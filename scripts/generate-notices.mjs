import { readFile, readdir, realpath, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const modules = await realpath(path.join(root, 'node_modules'));
const lock = JSON.parse(await readFile(path.join(root, 'package-lock.json'), 'utf8'));
const sections = [
  'TERVORO DIGITAL PUBLISHING — INSTALLED THIRD-PARTY NOTICES\n\nGenerated from the installed packages pinned by package-lock.json. Includes runtime and development dependencies present on this platform. Optional binaries for other platforms are not installed and are not included here.\n\nThis source project installs its dependencies through npm; it does not package a native application or redistribute node_modules. Independent HTML exports include a separate notice file for their actual bundled reader dependencies.\n\nThe page-flip 2.0.7 runtime bundles contain the application patch documented in docs/ENGINE_EVALUATION.md. Original license text is preserved below. Original fixture artwork and writing are described in fixtures/README.md.',
];
let count = 0;
for (const relative of Object.keys(lock.packages ?? {}).filter(name => name.startsWith('node_modules/')).sort()) {
  const folder = path.resolve(root, relative);
  let pkg;
  try { pkg = JSON.parse(await readFile(path.join(folder, 'package.json'), 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') continue; throw error; }
  const actual = await realpath(folder);
  const within = path.relative(modules, actual);
  if (within.startsWith('..') || path.isAbsolute(within)) throw new Error(`Dependency path escaped node_modules: ${relative}`);
  const texts = [];
  const scan = async (directory, prefix = '', depth = 0, licenseDirectory = false) => {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (entry.isSymbolicLink() || entry.name === 'node_modules' || entry.name === '.git') continue;
      const isLicense = /^(licen[cs]e|copying|notice)(?:s$|$|[._-])/i.test(entry.name);
      const filename = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        if (depth < 4) await scan(filename, prefix + entry.name + '/', depth + 1, licenseDirectory || isLicense);
      } else if (entry.isFile() && (isLicense || licenseDirectory)) {
        const data = await readFile(filename);
        if (data.length <= 1024 * 1024 && !data.includes(0)) texts.push(`${prefix}${entry.name}\n${data.toString('utf8').trimEnd()}`);
      }
    }
  };
  await scan(folder);
  // Platform binaries often refer to the wrapper package's license without
  // including a duplicate LICENSE file in their npm archive.
  if (!texts.length && pkg.name.startsWith('@napi-rs/canvas-')) {
    texts.push(`Parent @napi-rs/canvas LICENSE\n${await readFile(path.join(modules, '@napi-rs/canvas/LICENSE'), 'utf8')}`);
  }
  const repository = typeof pkg.repository === 'string' ? pkg.repository : pkg.repository?.url;
  const declared = typeof pkg.license === 'string' ? pkg.license : JSON.stringify(pkg.license ?? pkg.licenses ?? 'Not declared in package metadata');
  sections.push(`${pkg.name} ${pkg.version}\nInstalled path: ${relative}\nDeclared license: ${declared}${repository ? `\nSource repository: ${repository}` : ''}\n\n${texts.length ? texts.join('\n\n') : 'No separate license file was included in this installed package. Consult its declared license and source repository.'}`);
  count++;
}
await writeFile(path.join(root, 'THIRD_PARTY_NOTICES.txt'), sections.join('\n\n============================================================\n\n') + '\n');
console.log(`Wrote THIRD_PARTY_NOTICES.txt for ${count} installed packages.`);
