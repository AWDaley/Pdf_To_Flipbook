import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

if (process.argv.includes('--help')) {
  console.log('Usage: node scripts/launch.mjs [--no-open]\nStarts the built local studio and opens its authenticated loopback link. Ctrl+C stops it.');
} else {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const service = spawn(process.execPath, ['--import', 'tsx', 'apps/local-service/index.ts'], {
    cwd: root, stdio: ['inherit', 'pipe', 'inherit'], windowsHide: true,
  });
  let opened = false;
  let recentOutput = '';
  service.stdout.on('data', chunk => {
    process.stdout.write(chunk);
    recentOutput = (recentOutput + chunk.toString('utf8')).slice(-8192);
    const url = recentOutput.match(/http:\/\/127\.0\.0\.1:\d+\/#cap=[a-f0-9]{64}/)?.[0];
    if (!opened && url && !process.argv.includes('--no-open')) {
      opened = true;
      // Fixed executable names and a validated loopback URL; no shell strings.
      const browser = process.platform === 'win32'
        ? spawn('rundll32.exe', ['url.dll,FileProtocolHandler', url], { stdio: 'ignore', windowsHide: true })
        : spawn(process.platform === 'darwin' ? 'open' : 'xdg-open', [url], { stdio: 'ignore' });
      browser.on('error', () => console.log('Open the printed local link in your browser.'));
      browser.unref();
    }
  });
  service.on('error', error => { console.error(`Cannot start Tervoro Digital Publishing: ${error.message}`); process.exitCode = 1; });
  service.on('close', code => { process.exitCode = code ?? 1; });
  const stop = () => { if (service.exitCode === null) service.kill('SIGTERM'); };
  process.once('SIGINT', stop); process.once('SIGTERM', stop);
}
