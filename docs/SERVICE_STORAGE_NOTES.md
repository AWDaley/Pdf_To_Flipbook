# Local service, filesystem, and export notes

The creator runs through one loopback Fastify service. `npm run dev` integrates Vite middleware on the same origin; `npm start` serves `dist/studio`. The default port is 4173. `PAPERBOUND_PORT` accepts a different unprivileged TCP port.

The terminal prints a per-launch capability in a URL fragment. The browser posts it once to `/api/session`; the server sets an HttpOnly, SameSite=Strict cookie scoped to `/api/` for image and text requests. Mutations also require the `X-Paperbound-Capability` header. The capability is not embedded in public HTML or stored in project/export data. Host, Origin, and Fetch-Site are checked before API or static responses. The server binds to `127.0.0.1` and exposes no arbitrary-path or remote-URL import API.

## Optional limit configuration

Defaults are 100 MiB input, 300 source pages, 16 million rendered pixels per page, 60 seconds per page, 2 GiB output, and 256 MiB minimum free disk. Change supported values before launching, using JSON in `PAPERBOUND_LIMITS`. Example in PowerShell:

```powershell
$env:PAPERBOUND_LIMITS = '{"maxInputBytes":52428800,"maxPages":100,"pageTimeoutMs":45000}'
npm start
```

Omitted fields retain their defaults. Supported field names are `maxInputBytes`, `maxPages`, `maxPagePixels`, `pageTimeoutMs`, `maxOutputBytes`, and `minimumFreeDiskBytes`. Bounds and unknown fields are validated at startup. The absolute source-page ceiling remains 300. `/api/config` reports the effective values to an authenticated creator. Conversion CLI limits are documented by its `--help` output.

## Persistence and recovery

Projects live under `data/projects/<generated-id>`. Upload bytes are written as `source.pdf`; client filenames remain display metadata. Every path component is checked for symlinks or Windows junctions, and file operations are contained inside the application workspace. The project library is reconstructed from its project folders.

One process owns `.instance-lock.json`. A live PID blocks another instance; a dead PID permits recovery. An invalid lock produces an actionable error. In-process mutations are serialized, and revision numbers reject stale saves from another browser window.

The converter child writes a new build directory. All referenced assets must exist and be nonempty before the service atomically replaces `current-build.json`. `project.json` is written with temporary-file flush and atomic replacement. The current-build pointer remains authoritative after an interruption between these writes. Startup marks interrupted conversions for retry while retaining their last completed build. Cancellation or conversion failure preserves the pointer and readable assets.

Windows replacement retries transient EPERM/EACCES/EBUSY errors. Vite watchers exclude project data, export artifacts, and test output because held directory handles were observed to prevent rename on this Windows host. CLI replacement succeeded after applying the watcher exclusions.

## Export behavior

Exports copy the same generated `dist/reader/reader.js` and `reader.css` used by the shared-reader build, plus current appearance settings, page assets, extracted text, optional background, and bundled dependency license notices. A new staging directory is promoted before ZIP creation. Existing export destinations are refused. Free disk space is checked for both the folder and ZIP. The original PDF is absent by default and copied only when explicitly selected. The included dependency-free `serve.mjs` supports `node serve.mjs . 8080`; available build-level artwork notices are also retained.

The export uses relative paths and runs beneath a static server subpath. Its generated `index.html` also embeds the manifest, extracted text, reader JavaScript, and reader CSS so the folder can be opened directly from `file://` by double-clicking it. The external files remain alongside it for ordinary static-server hosting. It has no creator capability, service URL, or runtime CDN dependency. An exported folder is a snapshot, while backing up the complete project folder preserves editing inputs.

## Recorded verification

The first full integration run passed 15 tests on Windows in 59.28 seconds: 9 converter checks plus real service/storage and exporter checks. Service tests exercise HTTP authorization, cross-site rejection, real PDF import, stale revisions, one active conversion, cancellation, failed replacement, startup recovery, and locking. Export tests check actual copied reader bytes, license notices, manifest assets, opt-in original PDF, existing destinations, missing assets, path traversal, and a real Windows directory junction.

Later targeted service/export verification passed 6 of 6 tests after adding background-image encoding and the cover endpoint. The background metadata test reads bytes before passing them to Sharp so native input-file caching does not hold a Windows file open during cleanup. Independent browser export acceptance and visual acceptance are separate checks; a ZIP on disk alone is not accepted as proof of reader parity. Firefox startup limitations are recorded in [dependency feasibility](DEPENDENCY_FEASIBILITY.md).
