import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { mountReader, type Reader } from '../../packages/reader/index';
import { defaultSettings, type FlipbookManifest, type Project, type ReaderSettings } from '../../packages/shared/index';
import { connect, request, json } from './api';

type Progress = { completedPages?: number; totalPages?: number; stage?: string; message?: string };
function previewSettings(settings: ReaderSettings): ReaderSettings { return { ...settings, backgroundImage: settings.backgroundImage ? `assets/${settings.backgroundImage}` : null }; }
export function Studio() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [error, setError] = useState(''); const [notice, setNotice] = useState('');
  const [connected, setConnected] = useState(false); const [busy, setBusy] = useState(false);
  const [maxUploadBytes, setMaxUploadBytes] = useState(100 * 1024 * 1024);
  const [drawer, setDrawer] = useState(false); const [reading, setReading] = useState(false);
  const [exporting, setExporting] = useState(false); const [includeOriginal, setIncludeOriginal] = useState(false);
  const [exportResult, setExportResult] = useState<{ folder: string; downloadUrl: string; singleFileUrl: string } | null>(null);
  const [settings, setSettings] = useState<ReaderSettings>({ ...defaultSettings }); const [title, setTitle] = useState('');
  const [quality, setQuality] = useState<'standard' | 'lossless'>('standard'); const [dirty, setDirty] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null); const host = useRef<HTMLDivElement>(null);
  const reader = useRef<Reader | null>(null); const mountedBuild = useRef(''); const selected = useRef<Project | null>(null);
  selected.current = project;
  async function refresh() { const data = await request<{ projects: Project[] }>('/api/projects'); setProjects(data.projects); }
  useEffect(() => { void connect().then(async () => { const config = await request<{ limits: { maxInputBytes: number } }>('/api/config'); setMaxUploadBytes(config.limits.maxInputBytes); setConnected(true); await refresh(); }).catch(e => setError(e.message)); }, []);
  useEffect(() => {
    if (!exporting) return;
    const previous = document.activeElement as HTMLElement | null;
    const dialog = document.querySelector<HTMLElement>('.export-dialog');
    dialog?.querySelector<HTMLElement>('button,input,a')?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) setExporting(false);
      if (event.key !== 'Tab' || !dialog) return;
      const controls = [...dialog.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled)')];
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', keydown); return () => { document.removeEventListener('keydown', keydown); previous?.focus(); };
  }, [exporting, busy]);
  useEffect(() => {
    if (!project || (project.status !== 'converting' && project.status !== 'draft')) return;
    const id = project.id;
    const timer = setInterval(() => {
      void request<{ project: Project; progress: Progress }>(`/api/projects/${id}`).then(data => {
        if (selected.current?.id !== id) return; setProject(data.project); setProgress(data.progress);
        if (data.project.status === 'error') setError(data.project.error || 'Conversion failed. Retry this build.');
      }).catch(e => setError(e.message));
    }, 750); return () => clearInterval(timer);
  }, [project?.id, project?.status]);
  useEffect(() => {
    if (!project?.currentBuildId || !host.current) return;
    const identity = `${project.id}/${project.currentBuildId}`; if (mountedBuild.current === identity) return;
    mountedBuild.current = identity; let cancelled = false;
    reader.current?.destroy(); reader.current = null;
    void request<FlipbookManifest>(`/api/projects/${project.id}/manifest`).then(async manifest => {
      if (cancelled || !host.current) return;
      const instance = await mountReader(host.current, manifest, new URL(`/api/projects/${project.id}/`, location.href));
      if (cancelled) instance.destroy(); else reader.current = instance;
    }).catch(e => { mountedBuild.current = ''; setError(e.message); });
    return () => { cancelled = true; };
  }, [project?.id, project?.currentBuildId]);
  useEffect(() => () => reader.current?.destroy(), []);
  function open(item: Project) {
    setError(''); setNotice(''); setProject(item); setSettings(item.settings); setTitle(item.title); setQuality(item.quality); setDirty(false); setDrawer(false); setExportResult(null);
  }
  async function importPdf(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return; event.target.value = '';
    if (file.size > maxUploadBytes) { setError(`Choose a PDF smaller than ${Math.floor(maxUploadBytes / 1024 ** 2)} MiB, or adjust the configured limits.`); return; }
    setBusy(true); setError('');
    try { const data = await request<{ project: Project }>('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/pdf', 'X-File-Name': encodeURIComponent(file.name) }, body: file }); open(data.project); await refresh(); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  function edit<K extends keyof ReaderSettings>(key: K, value: ReaderSettings[K]) {
    const next = { ...settings, [key]: value }; setSettings(next); setDirty(true); void reader.current?.updateAppearance(previewSettings(next), title);
  }
  async function save() {
    if (!project) return null;
    setBusy(true); setError('');
    try { const data = await request<{ project: Project }>(`/api/projects/${project.id}/settings`, json('PUT', { revision: project.revision, title, settings })); setProject(data.project); setDirty(false); setNotice('Project saved'); await reader.current?.updateAppearance(previewSettings(settings), title); return data.project; }
    catch (e) { setError((e as Error).message); return null; } finally { setBusy(false); }
  }
  async function rebuild() {
    const current = dirty ? await save() : project; if (!current) return;
    setBusy(true); setError('');
    try { const data = await request<{ project: Project }>(`/api/projects/${current.id}/convert`, json('POST', { revision: current.revision, quality })); setProject(data.project); setNotice('Building new page images. Your last complete book stays available.'); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  async function background(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file || !project) return;
    setBusy(true); setError('');
    try { const result = await request<{ path: string }>(`/api/projects/${project.id}/background`, { method: 'POST', headers: { 'Content-Type': file.type || 'application/octet-stream' }, body: file }); edit('backgroundImage', result.path); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  async function exportBook() {
    const current = dirty ? await save() : project; if (!current) return;
    setBusy(true); setError('');
    try { setExportResult(await request(`/api/projects/${current.id}/export`, json('POST', { revision: current.revision, includeOriginal }))); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  async function library() { if (dirty && !(await save())) return; reader.current?.destroy(); reader.current = null; mountedBuild.current = ''; setProject(null); setReading(false); await refresh(); }
  return <main className={`studio ${reading ? 'is-reading' : ''}`}>
    <input hidden ref={fileInput} type="file" accept="application/pdf,.pdf" onChange={e => { void importPdf(e); }}/>
    {!reading && <header className="studio-header"><a className="brand" href="#library" onClick={e => { e.preventDefault(); void library(); }}><img className="brand-logo" src="/brand/tervoro-wordmark.png" alt="Tervoro"/><span className="brand-sub">DIGITAL PUBLISHING</span></a>
      <nav className="studio-actions">{project ? <><button className="plain-button" onClick={() => { void library(); }}>Library</button><span className="header-separator"/><button className={`plain-button ${drawer ? 'selected' : ''}`} onClick={() => setDrawer(!drawer)}>Appearance</button><button className="plain-button" onClick={() => setReading(true)}>Read</button><button className="solid-button" disabled={!project.currentBuildId} onClick={() => { setExporting(true); setExportResult(null); }}>Export <span>↗</span></button></> : <><span className="local-badge"><i/> Local & private</span><button className="solid-button" disabled={!connected || busy} onClick={() => fileInput.current?.click()}>＋ New flipbook</button></>}</nav>
    </header>}
    {reading && <button className="exit-reading" onClick={() => setReading(false)}>← Back to studio</button>}
    {error && <div role="alert" className="studio-message error"><span>{error}</span><button aria-label="Dismiss error" onClick={() => setError('')}>×</button></div>}
    {notice && !error && <div role="status" className="studio-message"><span>{notice}</span><button aria-label="Dismiss notification" onClick={() => setNotice('')}>×</button></div>}
    {!project ? <div className="library"><div className="library-intro"><div><div className="eyebrow">YOUR DIGITAL SHELF</div><h1>Bring your pages<br/><em>to life.</em></h1><p>Turn your PDFs into polished digital publications.<br/>Made on your computer. Kept entirely yours.</p></div><div className="library-illustration" aria-hidden="true"><div className="illustration-sheet">THE ART<br/>OF TAKING<br/><em>your time.</em><span>TERVORO / DIGITAL PUBLISHING</span></div><div className="illustration-back"/></div></div>
      <div className="shelf-heading"><h2>Your flipbooks <span>{projects.length.toString().padStart(2, '0')}</span></h2><span>Saved on this computer</span></div><div className="project-grid"><button className="new-project-card" disabled={!connected || busy} onClick={() => fileInput.current?.click()}><span className="import-plus">＋</span><strong>Start with a PDF</strong><span>Choose a file · up to {Math.floor(maxUploadBytes / 1024 ** 2)} MiB</span><small>Converted locally, page by page</small></button>{projects.map(item => <button key={item.id} className="project-card" onClick={() => open(item)}><div className="project-cover">{item.currentBuildId ? <img src={`/api/projects/${item.id}/cover`} alt=""/> : <span className="project-placeholder">p.</span>}</div><div className="project-card-text"><strong>{item.title}</strong><span>{item.pageCount || '—'} pages <span>·</span> {item.status === 'ready' ? 'Ready to read' : item.status}</span></div><span className="open-project">Open ↗</span></button>)}</div>
      <a className="demo-link" href="/?demo=1">Explore the sample publication <span>↗</span></a><footer className="library-footer"><span>NO UPLOADS. NO ACCOUNTS. JUST YOUR BOOKS.</span><span>PDF → Tervoro → Anywhere.</span></footer></div> : <div className="workspace">
      <div className="preview-host" ref={host}/>
      {!project.currentBuildId && <div className="conversion-empty"><div className="conversion-mark">p.</div><h2>{project.status === 'converting' ? 'Making room for your pages.' : 'Your flipbook is waiting.'}</h2><p>{project.status === 'converting' ? 'Rendering the original artwork, one page at a time.' : project.error || 'Start a build to turn this PDF into an animated book.'}</p>{project.status !== 'converting' && <button className="solid-button" onClick={() => { void rebuild(); }}>Build flipbook</button>}</div>}
      {project.status === 'converting' && <div className="conversion-progress" role="status"><span className="spinner"/><div><strong>Converting locally</strong><span>{progress?.message || `${progress?.completedPages ?? 0} of ${progress?.totalPages || '…'} pages · ${progress?.stage ?? 'Preparing PDF'}`}</span></div><button className="plain-button" onClick={() => { void request<{ project: Project }>(`/api/projects/${project.id}/cancel`, { method: 'POST' }).then(data => setProject(data.project)).catch(e => setError(e.message)); }}>Cancel</button></div>}
      {drawer && !reading && <aside className="appearance-drawer" inert={busy}><div className="drawer-heading"><div className="eyebrow">MAKE IT YOURS</div><h2>Appearance</h2><button aria-label="Close appearance" className="close-drawer" onClick={() => setDrawer(false)}>×</button></div>
        <label>Book title<input value={title} maxLength={240} onChange={e => { setTitle(e.target.value); setDirty(true); void reader.current?.updateAppearance(previewSettings(settings), e.target.value); }}/></label>
        <div className="preset-chip"><span>▤</span><div><strong>Magazine</strong><small>Flexible paper. Quiet detail.</small></div><span>✓</span></div>
        <label>Background<div className="color-controls"><input aria-label="Background color" type="color" value={settings.backgroundColor} onChange={e => edit('backgroundColor', e.target.value)}/><span>{settings.backgroundColor.toUpperCase()}</span>{['#02060d', '#07101b', '#0b1624', '#e9e6df', '#f6f7f3'].map(color => <button key={color} aria-label={`Set background ${color}`} style={{ background: color }} className="color-swatch" onClick={() => edit('backgroundColor', color)}/>)}</div></label>
        <label className="upload-background">Custom background<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e => { void background(e); }}/></label>{settings.backgroundImage && <button className="text-button" onClick={() => edit('backgroundImage', null)}>Remove background image</button>}
        <div className="drawer-row"><label>Controls<select value={settings.toolbarTheme} onChange={e => edit('toolbarTheme', e.target.value as ReaderSettings['toolbarTheme'])}><option value="dark">Tervoro dark</option><option value="light">Paper light</option></select></label><label>Layout<select value={settings.layout} onChange={e => edit('layout', e.target.value as ReaderSettings['layout'])}><option value="auto">Automatic</option><option value="spread">Spread</option><option value="single">Single page</option></select></label></div>
        <label className="checkbox-label"><span>Cover stands alone</span><input type="checkbox" checked={settings.showCoverAlone} onChange={e => edit('showCoverAlone', e.target.checked)}/></label>
        <label className="checkbox-label"><span>Subtle page edges</span><input type="checkbox" checked={settings.showPageEdges} onChange={e => edit('showPageEdges', e.target.checked)}/></label>
        <label>Turn duration <span className="range-value">{settings.turnDurationMs} ms</span><input type="range" min={400} max={1800} step={50} value={settings.turnDurationMs} onChange={e => edit('turnDurationMs', Number(e.target.value))}/></label>
        <label>Moving shadows <span className="range-value">{Math.round(settings.shadowStrength * 100)}%</span><input type="range" min={0} max={.7} step={.01} value={settings.shadowStrength} onChange={e => edit('shadowStrength', Number(e.target.value))}/></label>
        <label>Motion preference<select value={settings.motionPreference} onChange={e => edit('motionPreference', e.target.value as ReaderSettings['motionPreference'])}><option value="system">Use device preference</option><option value="full">Always animate</option><option value="reduced">Reduced motion</option></select></label>
        <div className="quality-section"><label>Page image quality<select value={quality} onChange={e => setQuality(e.target.value as 'standard' | 'lossless')}><option value="standard">Standard · WebP</option><option value="lossless">High quality · lossless WebP</option></select></label><p>Quality changes render a new build. Appearance changes keep your existing page images.</p><button className="outline-button" disabled={busy || project.status === 'converting'} onClick={() => { void rebuild(); }}>Rebuild page images</button></div>
        <div className="drawer-save"><span>{dirty ? 'Unsaved changes' : 'All changes saved'}</span><button className="solid-button" disabled={busy || !dirty || !title.trim()} onClick={() => { void save(); }}>Save project</button></div>
      </aside>}
    </div>}
    {exporting && project && <div className="modal-backdrop" onClick={() => { if (!busy) setExporting(false); }}><section className="export-dialog" role="dialog" aria-modal="true" aria-labelledby="export-heading" onClick={e => e.stopPropagation()}><button className="close-drawer" aria-label="Close export" onClick={() => setExporting(false)}>×</button><div className="eyebrow">PUBLISH YOUR WORK</div><h2 id="export-heading">The same publication.<br/><em>Anywhere you share it.</em></h2><p>Export the animated reader, your appearance settings, and all page images as an HTML folder and ZIP.</p><label className="checkbox-label"><span>Include the original PDF</span><input type="checkbox" checked={includeOriginal} onChange={e => setIncludeOriginal(e.target.checked)}/></label><p className="export-note">A snapshot for reading. Unzip it and double-click <code>index.html</code> to open the publication in Chrome or Edge. Back up the project folder to preserve editing.</p>{exportResult ? <div className="export-success"><strong>Export ready</strong><p>{exportResult.folder}</p><a className="solid-button" href={exportResult.singleFileUrl} download>Download one-file HTML ↓</a><a className="text-button" href={exportResult.downloadUrl} download>Download ZIP folder</a></div> : <button className="solid-button full-width" disabled={busy} onClick={() => { void exportBook(); }}>{busy ? 'Packing your publication…' : 'Export HTML folder + ZIP ↗'}</button>}</section></div>}
  </main>;
}
