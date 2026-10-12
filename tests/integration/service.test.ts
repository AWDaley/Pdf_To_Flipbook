import { afterEach, describe, expect, test } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { createService } from '../../apps/local-service/index';
import { ProjectStore } from '../../apps/local-service/store';
import { assertContained, atomicJson, readJson } from '../../packages/shared/files';
import type { Project } from '../../packages/shared/index';

const workspaces: string[] = [];
const services: Awaited<ReturnType<typeof createService>>[] = [];
afterEach(async () => {
  for (const service of services.splice(0)) await service.app.close();
  for (const workspace of workspaces.splice(0)) {
    assertContained(path.resolve('data'), workspace);
    await fs.rm(workspace, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
});

async function launch() {
  const workspace = path.resolve('data', `test-service-${randomUUID()}`);
  workspaces.push(workspace);
  const service = await createService({ serveUi: false, projectRoot: path.join(workspace, 'projects'), capability: 'test-capability-keep-local' });
  services.push(service);
  await service.app.listen({ host: '127.0.0.1', port: 0 });
  const address = service.app.server.address();
  if (!address || typeof address === 'string') throw new Error('Expected a TCP service.');
  const base = `http://127.0.0.1:${address.port}`;
  const headers = { 'X-Paperbound-Capability': service.capability, Origin: base };
  return { ...service, workspace, base, headers };
}

describe('loopback service and real project storage', () => {
  test('capability, Host, Origin and Fetch-Site protect API and image requests', async () => {
    const service = await launch();
    expect((await fetch(`${service.base}/api/health`)).status).toBe(200);
    expect((await fetch(`${service.base}/api/projects`)).status).toBe(401);
    expect((await fetch(`${service.base}/api/projects`, { headers: { ...service.headers, Origin: 'https://unrelated.example' } })).status).toBe(403);
    expect((await fetch(`${service.base}/api/projects`, { headers: { ...service.headers, 'Sec-Fetch-Site': 'same-site' } })).status).toBe(403);
    const badHost = await service.app.inject({ url: '/api/health', headers: { host: 'unrelated.example' } });
    expect(badHost.statusCode).toBe(403);
    const bootstrap = await fetch(`${service.base}/api/session`, { method: 'POST', headers: service.headers });
    expect(bootstrap.status).toBe(200);
    const setCookie = bootstrap.headers.get('set-cookie')!;
    expect(setCookie).toContain('HttpOnly');
    expect(setCookie).toContain('SameSite=Strict');
    const cookie = setCookie.split(';')[0];
    expect((await fetch(`${service.base}/api/projects`, { headers: { Cookie: cookie } })).status).toBe(200);
    // Cookie alone cannot authorize mutations.
    expect((await fetch(`${service.base}/api/projects/nope/cancel`, { method: 'POST', headers: { Cookie: cookie } })).status).toBe(401);
    expect((await fetch(`${service.base}/api/projects/nope/assets/pages/a.webp`)).status).toBe(401);
    expect((await fetch(`${service.base}/api/projects`, { method: 'POST', headers: { ...service.headers, 'Content-Type': 'application/pdf' }, body: 'not a PDF' })).status).toBe(400);
  });

  test('real PDF import, sequential conversion, settings revision, cancellation and failed replacement preserve the readable build', async () => {
    const service = await launch();
    const pdf = await fs.readFile('fixtures/pages-1.pdf');
    const imported = await fetch(`${service.base}/api/projects`, {
      method: 'POST', headers: { ...service.headers, 'Content-Type': 'application/pdf', 'X-File-Name': 'source.pdf', 'X-Project-Title': 'Storage%20proof' }, body: pdf,
    });
    expect(imported.status).toBe(202);
    const { project: started } = await imported.json() as { project: Project };
    expect(started.status).toBe('converting');
    await expect(service.store.startConversion(started.id, started.revision, 'standard')).rejects.toThrow('already converting');
    await service.store.waitForIdle();
    const project = await service.store.get(started.id);
    expect(project.status, project.error ?? '').toBe('ready');
    expect(project.pageCount).toBe(1);
    const originalBuild = project.currentBuildId;
    const manifestResponse = await fetch(`${service.base}/api/projects/${project.id}/manifest`, { headers: service.headers });
    expect(manifestResponse.status).toBe(200);
    const manifest = await manifestResponse.json();
    expect(manifest.pages[0].image.path).toMatch(/^assets\/pages\//);
    const imageResponse = await fetch(`${service.base}/api/projects/${project.id}/${manifest.pages[0].image.path}`, { headers: service.headers });
    expect(imageResponse.status).toBe(200);
    expect(imageResponse.headers.get('content-type')).toContain('image/webp');
    expect((await imageResponse.arrayBuffer()).byteLength).toBeGreaterThan(100);
    const backgroundBytes = await sharp({ create: { width: 40, height: 30, channels: 3, background: '#445566' } }).png().toBuffer();
    const backgroundUpload = await fetch(`${service.base}/api/projects/${project.id}/background`, { method: 'POST', headers: { ...service.headers, 'Content-Type': 'image/png' }, body: backgroundBytes });
    expect(backgroundUpload.status).toBe(200);
    const { path: backgroundImage } = await backgroundUpload.json() as { path: string };
    expect(backgroundImage).toMatch(/^background\/[a-f0-9-]+\.webp$/);
    const saved = await service.store.saveSettings(project.id, project.revision, 'Updated title', { ...project.settings, backgroundColor: '#223344', backgroundImage });
    expect(saved.currentBuildId).toBe(originalBuild);
    await expect(service.store.saveSettings(project.id, project.revision, 'Stale title', project.settings)).rejects.toThrow('another window');
    expect((await service.store.manifest(project.id)).manifest.title).toBe('Updated title');
    const backgroundPath = await service.store.asset(project.id, backgroundImage);
    expect((await sharp(await fs.readFile(backgroundPath)).metadata()).format).toBe('webp');
    expect((await fetch(`${service.base}/api/projects/${project.id}/cover`, { headers: service.headers })).status).toBe(200);
    await service.store.startConversion(saved.id, saved.revision, 'lossless');
    await service.store.cancel(saved.id);
    await service.store.waitForIdle();
    const cancelled = await service.store.get(saved.id);
    expect(cancelled.status).toBe('cancelled');
    expect(cancelled.currentBuildId).toBe(originalBuild);
    const directory = await service.store.projectDirectory(saved.id);
    await fs.writeFile(path.join(directory, 'source.pdf'), '%PDF-1.7\nMalformed replacement');
    await service.store.startConversion(saved.id, cancelled.revision, 'standard');
    await service.store.waitForIdle();
    const failed = await service.store.get(saved.id);
    expect(failed.status).toBe('error');
    expect(failed.currentBuildId).toBe(originalBuild);
    expect((await service.store.manifest(saved.id)).manifest.pageCount).toBe(1);
    expect((await readJson(directory, 'current-build.json') as { buildId: string }).buildId).toBe(originalBuild);
  });

  test('single-instance ownership and stale process recovery restore an interrupted project', async () => {
    const service = await launch();
    const other = new ProjectStore(service.store.root);
    await expect(other.initialize()).rejects.toThrow('already using');
    const pdf = await fs.readFile('fixtures/pages-1.pdf');
    const created = await service.store.importPdf(pdf, 'recovery.pdf');
    await service.store.waitForIdle();
    const complete = await service.store.get(created.id);
    expect(complete.status, complete.error ?? '').toBe('ready');
    await service.app.close();
    services.splice(services.findIndex((value) => value.app === service.app), 1);
    await atomicJson(service.store.root, `${complete.id}/project.json`, { ...complete, status: 'converting' });
    await fs.writeFile(path.join(service.store.root, '.instance-lock.json'), JSON.stringify({ pid: 2147483647, token: 'stale-test-lock' }));
    const reopened = new ProjectStore(service.store.root);
    await reopened.initialize();
    try {
      const recovered = await reopened.get(complete.id);
      expect(recovered.status).toBe('ready');
      expect(recovered.error).toContain('interrupted');
      expect(recovered.currentBuildId).toBe(complete.currentBuildId);
      expect(recovered.revision).toBe(complete.revision + 1);
    } finally { await reopened.close(); }
  });
});
