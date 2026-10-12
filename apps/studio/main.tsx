import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { mountReader } from '../../packages/reader/index';
import { manifestSchema } from '../../packages/shared/index';
import './studio.css';
import './tervoro.css';
import { Studio } from './Studio';

function Demo() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let gone = false; let reader: Awaited<ReturnType<typeof mountReader>> | undefined;
    void fetch('/demo/manifest.json').then(r => r.json()).then(async data => {
      if (gone || !host.current) return; reader = await mountReader(host.current, manifestSchema.parse(data), new URL('/demo/', location.href)); if (gone) reader.destroy();
    }).catch(error => { if (host.current) host.current.textContent = String(error); });
    return () => { gone = true; reader?.destroy(); };
  }, []);
  return <main className="studio"><header className="studio-header"><a className="brand" href="/"><img className="brand-logo" src="/brand/tervoro-wordmark.png" alt="Tervoro"/><span className="brand-sub">DIGITAL PUBLISHING</span></a><span className="demo-label">READER STUDY / 01</span></header><div className="preview-host" ref={host}/></main>;
}
createRoot(document.getElementById('root')!).render(new URLSearchParams(location.search).has('demo') ? <Demo/> : <Studio/>);
