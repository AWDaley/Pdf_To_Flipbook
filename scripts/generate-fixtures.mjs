/** Original publication writing/layout/illustrations plus credited NASA astronaut photography. */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { PDFDocument, PDFName, PDFString, StandardFonts, degrees, rgb } from 'pdf-lib';

const root = path.resolve(import.meta.dirname, '..');
const demo = path.join(root, 'public', 'demo');
const fixtures = path.join(root, 'fixtures');
const nasaPhoto = (await fs.readFile(path.join(fixtures, 'assets', 'nasa-iss064-e-9397.jpg'))).toString('base64');
await Promise.all([fs.mkdir(path.join(demo, 'pages'), { recursive: true }), fs.mkdir(path.join(demo, 'thumbnails'), { recursive: true }), fs.mkdir(path.join(demo, 'text'), { recursive: true }), fs.mkdir(fixtures, { recursive: true })]);
const W = 750, H = 1000;
const C = { paper: '#f2efe5', green: '#203d34', muted: '#6a7768', clay: '#aa6249', gold: '#d2c09b', white: '#fffaf0' };
const xml = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
let seed = 4271;
const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const rect = (x, y, width, height, fill) => `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}"/>`;
const line = (x1, y1, x2, y2, color = C.green, opacity = 1) => `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${color}" stroke-opacity="${opacity}" fill="none"/>`;
function forest(x, y, width, height, variant = 0) {
  const id = `forest${variant}`;
  let out = `<svg x="${x}" y="${y}" width="${width}" height="${height}" viewBox="0 0 750 1000" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="${id}" x2="0" y2="1"><stop stop-color="#aebbb0"/><stop offset="0.45" stop-color="#687f71"/><stop offset="1" stop-color="#142e25"/></linearGradient><radialGradient id="${id}light"><stop stop-color="#e2ddbd" stop-opacity=".6"/><stop offset="1" stop-color="#e2ddbd" stop-opacity="0"/></radialGradient></defs><rect width="750" height="1000" fill="url(#${id})"/><ellipse cx="510" cy="280" rx="470" ry="600" fill="url(#${id}light)"/>`;
  for (let layer = 0; layer < 5; layer++) {
    const colors = ['#81988a', '#657d6c', '#496653', '#304f3d', '#193c2c'];
    for (let i = 0; i < 15; i++) {
      const tx = i * 70 - 100 + random() * 90;
      const ty = 130 + random() * 350 + layer * 65;
      const tw = 40 + random() * 65 + layer * 12;
      const th = 360 + random() * 300;
      out += `<path d="M${tx} ${ty}l${-tw * .3} ${th * .2}h${tw * .17}l${-tw * .27} ${th * .19}h${tw * .2}l${-tw * .39} ${th * .22}h${tw * .26}l${-tw * .47} ${th * .25}h${tw * 1.6}l${-tw * .47} ${-th * .25}h${tw * .26}l${-tw * .39} ${-th * .22}h${tw * .2}l${-tw * .27} ${-th * .19}h${tw * .17}Z" fill="${colors[layer]}"/><path d="M${tx} ${ty + th * .2}v${th}" stroke="${colors[layer]}" stroke-width="${2 + layer}"/>`;
    }
  }
  out += `<path d="M350 1000C440 850 445 860 440 760C440 870 540 950 540 1000Z" fill="#b0aa83" opacity=".65"/>`;
  for (let i = 0; i < 200; i++) out += `<circle cx="${random() * 750}" cy="${random() * 1000}" r="${random() * 2}" fill="#f0eace" opacity=".14"/>`;
  return out + '</svg>';
}
function leaf(x, y, scale, color = C.green, rotation = 0) {
  let out = `<g transform="translate(${x} ${y}) rotate(${rotation}) scale(${scale})" stroke="${color}" fill="none" stroke-width="1.2"><path d="M0 330C20 220 -10 130 20 0"/>`;
  for (let i = 0; i < 8; i++) { const yy = 35 + i * 34; const side = i % 2 ? -1 : 1; out += `<path d="M9 ${yy + 42}Q${side * 92} ${yy + 5} ${side * 74} ${yy - 23}Q${side * 26} ${yy - 10} 9 ${yy + 42}Z"/><path d="M9 ${yy + 42}L${side * 66} ${yy - 12}" opacity=".5"/>`; }
  return out + '</g>';
}
const pages = [];
function page(number, bg = C.paper) {
  const result = { number, background: rect(0, 0, W, H, bg), texts: [] };
  result.text = (x, y, value, size = 15, font = 'sans', color = C.green, extra = '') => { result.texts.push({ x, y, value, size, font, color, extra }); return result; };
  result.art = (markup) => { result.background += markup; return result; };
  result.footer = (color = C.green) => { result.art(line(48, 948, 702, 948, color, .35)).text(48, 973, 'FIELDNOTES     /     VOL. 01', 10, 'sans', color).text(677, 975, String(number).padStart(2, '0'), 15, 'serif', color); return result; };
  pages.push(result); return result;
}
function paragraphs(p, x, y, lines, size = 16, leading = 25, color = C.green) { lines.forEach((value, i) => p.text(x, y + i * leading, value, size, 'serif', color)); }

page(1, C.green).art(forest(0, 0, 750, 1000, 1)).art(rect(0, 0, 750, 1000, 'rgba(15,35,26,.13)'))
  .text(47, 59, 'AN INDEPENDENT JOURNAL OF THE OUTDOORS', 11, 'sans', C.white)
  .text(45, 161, 'FIELDNOTES', 91, 'serif', C.white)
  .art(line(49, 183, 701, 183, C.white, .65)).text(49, 210, 'VOLUME 01', 11, 'sans', C.white).text(588, 210, 'AUTUMN 2026', 11, 'sans', C.white)
  .text(49, 716, 'A study in', 69, 'serif', C.white).text(49, 796, 'quiet places.', 69, 'italic', C.white)
  .text(53, 853, 'Small journeys. A different way of seeing.', 16, 'sans', C.white)
  .text(53, 945, 'FOREST  /  WATER  /  SHELTER', 11, 'sans', C.white).text(669, 947, '01', 16, 'serif', C.white);
const p2 = page(2).text(48, 62, 'A LETTER FROM THE FIELD', 11).text(48, 164, 'The art of', 62, 'serif').text(48, 234, 'paying attention.', 62, 'italic');
p2.art(line(49, 270, 700, 270, C.green, .35));
paragraphs(p2, 49, 317, ['The places that stay with us are often the quietest.', 'A path between trees. The edge of a lake at first light.', 'A room with a window open to the weather.'], 21, 31);
paragraphs(p2, 49, 452, ['This journal is an invitation to look a little longer.', 'We follow the soft line of a horizon and listen for', 'the spaces between sounds. Nothing here asks', 'to be hurried. There is no perfect route to take.']);
paragraphs(p2, 49, 578, ['Take these pages as field notes, unfinished and open.', 'Find a place to sit. Notice the changing light.', 'Begin wherever you are.']);
p2.art(leaf(592, 595, .77, C.muted, -17)).text(49, 743, 'With curiosity,', 20, 'italic').text(49, 781, 'The Fieldnotes studio', 16).text(49, 889, 'Original writing and illustrations. Made for this demo.', 10, 'sans', C.muted).footer();
page(3).art(forest(0, 0, 750, 1000, 3)).text(49, 60, '01    /    THE FOREST', 11, 'sans', C.white).text(49, 750, 'Where the', 66, 'serif', C.white).text(49, 823, 'world softens.', 66, 'italic', C.white).text(49, 884, 'A walk beneath the canopy', 17, 'sans', C.white).footer(C.white);
const p4 = page(4).text(49, 60, 'THE LISTENING FOREST', 11).art(forest(49, 94, 652, 391, 4)).text(49, 514, 'Fig. 01   /   A trail shaped by light. Original landscape illustration.', 10, 'sans', C.muted).text(49, 599, 'Follow the softer path.', 43, 'serif');
paragraphs(p4, 49, 656, ['The forest changes the scale of things.', 'A leaf becomes a small landscape.', 'The smallest sounds travel further:', 'a branch, a wing, a drop of water.', '', 'There is a rhythm here that does', 'not belong to clocks. Walk until', 'you find yourself moving with it.'], 16, 26);
paragraphs(p4, 392, 656, ['Stop where the path opens.', 'Look toward the brightest patch', 'of sky. Follow the layers of green', 'until they become separate trees.', '', 'Attention is a kind of arrival.', 'You do not have to travel far', 'to find a place worth noticing.'], 16, 26); p4.footer();
page(5, C.green).text(49, 61, 'A MOMENT TO REMEMBER', 11, 'sans', C.gold).text(62, 244, '“', 150, 'serif', C.gold).text(63, 338, 'There is a kind', 54, 'serif', C.white).text(63, 407, 'of clarity that', 54, 'serif', C.white).text(63, 476, 'only arrives', 54, 'serif', C.white).text(63, 545, 'when we slow down.', 54, 'italic', C.white).art(line(65, 606, 156, 606, C.gold)).text(65, 647, 'NOTES FROM A MORNING WALK', 11, 'sans', C.gold).art(leaf(555, 650, .72, '#92a58a', 23)).footer(C.gold);
const p6 = page(6, '#e4d8c6').text(49, 61, '02    /    THE WATER', 11).text(49, 156, 'Water holds the sky.', 55, 'serif').art(`<image x="0" y="205" width="750" height="470" preserveAspectRatio="xMidYMid slice" href="data:image/jpeg;base64,${nasaPhoto}"/>`).text(49, 697, 'Tahoe, Walker and Mono lakes from orbit / NASA, ISS064-E-9397', 10).text(49, 749, 'Stillness has its own movement.', 30, 'italic');
paragraphs(p6, 49, 790, ['The lake is never quite the same color twice. A passing cloud', 'changes everything. We stayed on the shore until the reflected', 'mountains and the real ones seemed equally close.'], 19, 29); p6.footer();
const p7 = page(7).text(49, 61, 'FROM THE FIELD JOURNAL', 11).text(49, 154, 'Small things,', 58, 'serif').text(49, 218, 'closely observed.', 58, 'italic').art(line(49, 253, 700, 253, C.green, .35)).art(leaf(211, 313, 1.22, C.green, -12)).art(leaf(527, 371, .85, C.clay, 21));
p7.text(49, 737, '01   /   THE SHAPE OF A LEAF', 11).text(409, 737, '02   /   A DIFFERENT PACE', 11);
paragraphs(p7, 49, 779, ['A whole season of growth', 'held in a single outline.', 'Trace the edge with your eyes.'], 18, 27);
paragraphs(p7, 409, 779, ['Let curiosity choose', 'where you stop next.', 'Leave room for a detour.'], 18, 27);
p7.text(49, 909, 'Botanical studies / original vector illustrations', 10, 'sans', C.muted).footer();
const p8 = page(8, '#cfac8c').text(49, 61, '03    /    THE SHELTER', 11).text(49, 155, 'A place to pause.', 59, 'serif');
p8.art(`<svg x="0" y="210" width="750" height="440" viewBox="0 0 750 440"><rect width="750" height="440" fill="#a7ad91"/><path d="M0 280L180 130L280 250L450 105L690 300L750 230V440H0Z" fill="#74876a"/><path d="M0 360L750 290V440H0Z" fill="#5b7457"/><path d="M195 177L454 127L580 211L320 269Z" fill="#5c5744"/><path d="M205 183L320 267V416L205 320Z" fill="#b8865d"/><path d="M320 267L572 212V353L320 416Z" fill="#c5976e"/><path d="M364 283L491 254V347L364 380Z" fill="#344d41"/><path d="M370 289L428 276V358L370 373Z" fill="#b6c2a8"/><path d="M436 274L483 264V345L436 357Z" fill="#d4c9a8"/><path d="M211 198L303 265" stroke="#ead8b4"/><path d="M217 212V315M229 221V326M241 230V338M253 239V349M265 248V361M277 257V372M289 266V384" stroke="#9e704f"/><path d="M570 356L681 440H305L325 414Z" fill="#d1b58a"/></svg>`).text(49, 693, 'Not a destination. A way of being.', 29, 'italic');
paragraphs(p8, 49, 753, ['A small shelter, a generous window, the sound of rain.', 'Enough space to put the day down and pick up a book.', 'The best rooms leave some room for the world outside.'], 20, 30);
p8.text(49, 901, 'Fig. 03   /   A imagined forest cabin. Original architectural illustration.', 10).footer();
const p9 = page(9).text(49, 61, 'TAKE SOMETHING WITH YOU', 11).text(49, 156, 'Make room', 63, 'serif').text(49, 227, 'for wonder.', 63, 'italic').art(line(49, 266, 700, 266, C.green, .35));
paragraphs(p9, 49, 318, ['You do not need a distant horizon', 'to practice paying attention.', 'A familiar street in unfamiliar light', 'can be the start of something.'], 22, 32);
['Take the longer way home.', 'Leave your headphones in your pocket.', 'Learn the name of one tree.', 'Sit still for five unhurried minutes.', 'Write down what you notice.'].forEach((value, i) => { const y = 515 + i * 71; p9.text(49, y, String(i + 1).padStart(2, '0'), 14, 'sans', C.clay).text(101, y, value, 22, 'serif').art(line(101, y + 23, 695, y + 23, C.green, .15)); });
p9.text(49, 910, 'Begin again tomorrow.', 18, 'italic', C.clay).footer();
page(10, C.green).art(leaf(576, 61, 1.33, '#44614a', 25)).text(49, 91, 'FIELDNOTES', 43, 'serif', C.white).art(line(49, 122, 698, 122, C.gold, .5)).text(49, 400, 'Go slowly.', 83, 'serif', C.white).text(49, 498, 'Look closely.', 83, 'italic', C.white).text(53, 588, 'There is more here than you think.', 20, 'serif', C.gold).text(53, 823, 'A STUDY IN QUIET PLACES', 12, 'sans', C.gold).text(53, 860, 'Volume 01   /   An original demo publication', 12, 'sans', C.gold).footer(C.gold);

const svgFor = (p, withText = true) => `<svg xmlns="http://www.w3.org/2000/svg" width="750" height="1000" viewBox="0 0 750 1000">${p.background}${withText ? p.texts.map(t => `<text x="${t.x}" y="${t.y}" fill="${t.color}" font-family="${t.font === 'sans' ? 'Arial, sans-serif' : 'Georgia, Times New Roman, serif'}" font-size="${t.size}" ${t.font === 'italic' ? 'font-style="italic"' : ''} ${t.extra}>${xml(t.value)}</text>`).join('') : ''}</svg>`;
const manifest = { schemaVersion: '2.0', title: 'Fieldnotes — A study in quiet places', pageCount: pages.length, settings: { preset: 'magazine', layout: 'auto', showCoverAlone: true, backgroundColor: '#e9e6df', backgroundImage: null, toolbarTheme: 'dark', turnDurationMs: 850, shadowStrength: .32, showPageEdges: true, motionPreference: 'system' }, pages: [], outline: [{ title: 'A letter from the field', sourcePage: 2 }, { title: 'The listening forest', sourcePage: 3 }, { title: 'Water holds the sky', sourcePage: 6 }, { title: 'A place to pause', sourcePage: 8 }, { title: 'Make room for wonder', sourcePage: 9 }], originalPdf: null };
const pdf = await PDFDocument.create();
pdf.setTitle(manifest.title); pdf.setAuthor('Flipbook demo studio; NASA astronaut photography'); pdf.setSubject('Original writing and vector illustrations, credited NASA ISS064-E-9397 photo; no commercial publication assets');
const fonts = { sans: await pdf.embedFont(StandardFonts.Helvetica), serif: await pdf.embedFont(StandardFonts.TimesRoman), italic: await pdf.embedFont(StandardFonts.TimesRomanItalic) };
for (const p of pages) {
  const n = String(p.number).padStart(3, '0');
  const svg = Buffer.from(svgFor(p));
  await fs.writeFile(path.join(demo, 'pages', `page-${n}.svg`), svg);
  for (const [name, longEdge, quality, dir] of [['fit', 1600, 90, 'pages'], ['zoom', 3200, 95, 'pages'], ['thumb', 320, 80, 'thumbnails']]) {
    await sharp(svg, { density: Math.ceil(longEdge / H * 72) }).resize({ height: longEdge }).webp({ quality }).toFile(path.join(demo, dir, `page-${n}-${name}.webp`));
  }
  const text = p.texts.map(t => t.value).join('\n');
  await fs.writeFile(path.join(demo, 'text', `page-${n}.json`), JSON.stringify({ sourcePage: p.number, text }));
  manifest.pages.push({ sourcePage: p.number, label: String(p.number).padStart(2, '0'), aspectRatio: .75, image: { path: `pages/page-${n}-fit.webp`, width: 1200, height: 1600 }, zoomImage: { path: `pages/page-${n}-zoom.webp`, width: 2400, height: 3200 }, thumbnail: { path: `thumbnails/page-${n}-thumb.webp`, width: 240, height: 320 }, textPath: `text/page-${n}.json`, links: [] });
  const pp = pdf.addPage([W, H]);
  const bg = await pdf.embedPng(await sharp(Buffer.from(svgFor(p, false))).resize({ height: 1600 }).png().toBuffer());
  pp.drawImage(bg, { x: 0, y: 0, width: W, height: H });
  for (const t of p.texts) {
    const color = rgb(parseInt(t.color.slice(1, 3), 16) / 255, parseInt(t.color.slice(3, 5), 16) / 255, parseInt(t.color.slice(5, 7), 16) / 255);
    pp.drawText(t.value, { x: t.x, y: H - t.y, size: t.size, font: fonts[t.font], color });
  }
}
manifest.pages[1].links.push({ x: .06, y: .3, width: .8, height: .075, label: 'Read The listening forest', target: { type: 'page', sourcePage: 3 } });
await fs.writeFile(path.join(demo, 'manifest.json'), JSON.stringify(manifest, null, 2));
await fs.writeFile(path.join(fixtures, 'fieldnotes.pdf'), await pdf.save());

// Deterministic navigation fixture: actual PDF text, both safe and forbidden URI actions, destinations, outlines.
const linksPdf = await PDFDocument.create();
const navFont = await linksPdf.embedFont(StandardFonts.Helvetica);
const navPages = [1, 2, 3].map(n => { const p = linksPdf.addPage([450, 600]); p.drawText(`Navigation fixture / source page ${n}`, { x: 30, y: 540, size: 20, font: navFont }); return p; });
function annotate(p, rectangle, action) { const ref = linksPdf.context.register(linksPdf.context.obj({ Type: 'Annot', Subtype: 'Link', Rect: rectangle, Border: [0, 0, 0], ...action })); const existing = p.node.lookup(PDFName.of('Annots')); if (existing) existing.push(ref); else p.node.set(PDFName.of('Annots'), linksPdf.context.obj([ref])); }
const actions = [['Safe external link', { A: { S: 'URI', URI: PDFString.of('https://example.com/') } }], ['Unsafe script link', { A: { S: 'URI', URI: PDFString.of('javascript:alert(1)') } }], ['Go to source page 3', { Dest: [navPages[2].ref, 'Fit'] }], ['Unsafe local file link', { A: { S: 'URI', URI: PDFString.of('file:///C:/secret.txt') } }]];
actions.forEach(([label, action], index) => { const y = 460 - index * 65; navPages[0].drawText(label, { x: 30, y, size: 16, font: navFont }); annotate(navPages[0], [28, y - 5, 350, y + 20], action); });
const outlineRoot = linksPdf.context.register(linksPdf.context.obj({ Type: 'Outlines', Count: 1 }));
const outlineEntry = linksPdf.context.register(linksPdf.context.obj({ Title: PDFString.of('Third source page'), Parent: outlineRoot, Dest: [navPages[2].ref, 'Fit'] }));
linksPdf.context.lookup(outlineRoot).set(PDFName.of('First'), outlineEntry); linksPdf.context.lookup(outlineRoot).set(PDFName.of('Last'), outlineEntry); linksPdf.catalog.set(PDFName.of('Outlines'), outlineRoot);
await fs.writeFile(path.join(fixtures, 'links-bookmarks.pdf'), await linksPdf.save());

const mixed = await PDFDocument.create(); const mf = await mixed.embedFont(StandardFonts.Helvetica);
for (const [index, [w, h, rotation, crop]] of [[450, 600, 0, false], [600, 450, 90, false], [650, 650, 0, true], [720, 360, 270, true]].entries()) {
  const p = mixed.addPage([w, h]); p.drawRectangle({ x: 0, y: 0, width: w, height: h, color: rgb(.85, .91, .82) });
  p.drawText(`PAGE ${index + 1} / ${w} x ${h} / rotation ${rotation}`, { x: 60, y: h - 80, size: 17, font: mf });
  p.drawText('TOP LEFT', { x: 60, y: h - 115, size: 14, font: mf });
  p.drawRectangle({ x: 65, y: 65, width: 80, height: 80, color: rgb(.68, .32, .2) });
  p.setRotation(degrees(rotation)); if (crop) p.setCropBox(40, 40, w - 80, h - 80);
}
await fs.writeFile(path.join(fixtures, 'mixed-rotation-crop.pdf'), await mixed.save());
const imageOnly = await PDFDocument.create(); const ip = imageOnly.addPage([W, H]); const ii = await imageOnly.embedPng(await sharp(Buffer.from(svgFor(pages[0]))).png().toBuffer()); ip.drawImage(ii, { x: 0, y: 0, width: W, height: H }); await fs.writeFile(path.join(fixtures, 'image-only.pdf'), await imageOnly.save());
for (const count of [1, 2, 5, 6]) {
  const target = await PDFDocument.create(); const copied = await target.copyPages(pdf, Array.from({ length: count }, (_, i) => i)); copied.forEach(p => target.addPage(p)); await fs.writeFile(path.join(fixtures, `pages-${count}.pdf`), await target.save());
}
const fine = await PDFDocument.create(); const fp = fine.addPage([600, 800]); const ff = await fine.embedFont(StandardFonts.TimesRoman);
fp.drawText('Fine type, lines, and diagrams', { x: 35, y: 753, size: 24, font: ff });
for (let i = 0; i < 35; i++) { const size = 5 + i % 8; fp.drawText(`Line ${i + 1}: The quick brown fox jumps over the lazy dog. 0123456789`, { x: 35, y: 710 - i * 17, size, font: ff }); }
for (let i = 0; i < 12; i++) fp.drawLine({ start: { x: 35, y: 75 - i * 4 }, end: { x: 550, y: 75 - i * 4 }, thickness: .1 + i * .08 });
await fs.writeFile(path.join(fixtures, 'fine-text.pdf'), await fine.save());
await fs.writeFile(path.join(fixtures, 'malformed.pdf'), Buffer.from('%PDF-1.7\nThis intentionally malformed fixture has no document objects or trailer.\n'));
await fs.writeFile(path.join(fixtures, 'README.md'), `# Rights-cleared fixtures\n\nWriting, layout, and landscape/botanical/architectural illustrations in this folder and public/demo are original material generated by scripts/generate-fixtures.mjs for this repository. The repository owner may use, modify, and redistribute that original material with the application. Page 6 adds credited NASA astronaut photography; see assets/README.md for its verified official source and usage guidelines. No Heyzine publication or player assets are included.\n\n- fieldnotes.pdf: 10-page editorial magazine, real PDF text, original rasterized vector illustrations, NASA photograph.\n- pages-1/2/5/6.pdf: source count and odd/even ending fixtures.\n- image-only.pdf: one raster page with no extracted text.\n- mixed-rotation-crop.pdf: portrait, landscape, square, 90/270-degree rotation, cropped MediaBox.\n- links-bookmarks.pdf: supported HTTPS and page links, unsafe javascript/file links, outline targeting page 3.\n- fine-text.pdf: small text and fine strokes.\n- malformed.pdf: deliberately invalid input.\n- password-required.pdf: AES-256 encryption; test password fixture-password.\n\nRegenerate artwork and ordinary fixtures with npm run fixtures; the checked-in photograph is used locally and regeneration makes no network request. Regenerate the password fixture with python scripts/generate-password-fixture.py (pypdf and cryptography required only for this fixture operation). Python is not an application dependency.\n`);
await fs.writeFile(path.join(demo, 'ARTWORK-NOTICE.txt'), 'FIELDNOTES / A study in quiet places\nOriginal text, layout, and procedural vector illustrations generated for this repository.\nPage 6 photograph: NASA / ISS Crew Earth Observations Facility, Johnson Space Center; ISS064-E-9397, December 3, 2020.\nPhoto source: https://science.nasa.gov/earth/earth-observatory/western-lake-trio-148165/\nUsage guidelines: https://www.nasa.gov/nasa-brand-center/images-and-media/\nThe NASA photo is used editorially with attribution. NASA does not endorse this application.\nNo Heyzine publication artwork or player assets. Other landscapes are original illustrations.\nThe repository owner may use, modify, and redistribute the original artwork with the application.\n');
console.log(`Generated ${pages.length} demo pages and rights-cleared PDF fixtures.`);
