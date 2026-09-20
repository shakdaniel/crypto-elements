#!/usr/bin/env node
/** Builds the static docs site into site/dist from build/ output. */
import { readFile, writeFile, mkdir, rm, cp } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(root, 'site/dist')

const manifest = JSON.parse(await readFile(join(root, 'build/icons.json'), 'utf8'))
const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'))
const generated = await readFile(join(root, 'packages/core/src/generated.ts'), 'utf8')

// Pull the rendered markup back out of the generated module so the site and the
// packages can never drift apart.
const bodies = new Map()
for (const m of generated.matchAll(/id: "([^"]+)",\n\s+type: "([^"]+)",[\s\S]*?body: (".*?"),\n\s+mono: (".*?"),/g)) {
  bodies.set(`${m[2]}:${m[1]}`, { body: JSON.parse(m[3]), mono: JSON.parse(m[4]) })
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const cards = manifest.icons
  .map((i) => {
    const { body, mono } = bodies.get(`${i.type}:${i.id}`)
    const tags = [i.id, i.name, ...i.aliases, i.type].join(' ').toLowerCase()
    return `<figure class="card" data-id="${esc(i.id)}" data-type="${i.type}" data-search="${esc(tags)}" data-component="${i.component}" data-fidelity="${i.fidelity}" tabindex="0">
  <div class="art">
    <svg class="c" xmlns="http://www.w3.org/2000/svg" viewBox="${i.viewBox}" width="44" height="44" aria-hidden="true">${body}</svg>
    <svg class="m" xmlns="http://www.w3.org/2000/svg" viewBox="${i.viewBox}" width="44" height="44" fill="currentColor" aria-hidden="true">${mono}</svg>
  </div>
  <figcaption>
    <span class="name">${esc(i.name)}</span>
    <code>${esc(i.id)}</code>
  </figcaption>
  ${i.fidelity === 'approximate' ? '<span class="badge" title="Hand-authored interpretation in the brand colours — official asset welcome via PR">approx</span>' : ''}
</figure>`
  })
  .join('\n')

const chains = manifest.icons.filter((i) => i.type === 'chain').length
const dexes = manifest.icons.filter((i) => i.type === 'dex').length

const html = `<!doctype html>
<html lang="en" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Crypto Elements — open-source logos for chains &amp; DEXes</title>
<meta name="description" content="${manifest.count} MIT-licensed SVG logos for crypto chains, DEXes and protocols. Framework-agnostic core plus React components.">
<meta property="og:title" content="Crypto Elements">
<meta property="og:description" content="${manifest.count} open-source SVG logos for crypto chains, DEXes and protocols.">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='14' fill='%230052FF'/%3E%3C/svg%3E">
<style>
  :root {
    --bg: #0a0b0f; --panel: #12141b; --panel-2: #171a23; --line: #232735;
    --text: #e7eaf3; --muted: #8b93a7; --accent: #6ea8fe; --radius: 14px;
    color-scheme: dark;
  }
  :root[data-theme="light"] {
    --bg: #fbfbfd; --panel: #fff; --panel-2: #f3f4f8; --line: #e3e5ec;
    --text: #12141b; --muted: #656d82; --accent: #2563eb; color-scheme: light;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; background: var(--bg); color: var(--text);
    font: 15px/1.5 ui-sans-serif, -apple-system, "Segoe UI", Inter, system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  a { color: var(--accent); }
  .wrap { max-width: 1120px; margin: 0 auto; padding: 0 20px; }
  header { border-bottom: 1px solid var(--line); background: linear-gradient(180deg, var(--panel) 0%, var(--bg) 100%); }
  .top { display: flex; align-items: center; gap: 14px; padding: 18px 0; }
  .logo { display: flex; align-items: center; gap: 10px; font-weight: 650; letter-spacing: -.02em; }
  .logo .dot { width: 22px; height: 22px; border-radius: 7px; background: linear-gradient(135deg, #9945FF, #14F195); }
  .top nav { margin-left: auto; display: flex; gap: 8px; align-items: center; }
  .btn {
    background: var(--panel-2); border: 1px solid var(--line); color: var(--text);
    padding: 7px 12px; border-radius: 9px; font-size: 13px; cursor: pointer; text-decoration: none;
  }
  .btn:hover { border-color: var(--accent); }
  .hero { padding: 38px 0 30px; }
  h1 { font-size: clamp(28px, 5vw, 42px); line-height: 1.1; letter-spacing: -.03em; margin: 0 0 12px; }
  .lede { color: var(--muted); max-width: 62ch; margin: 0 0 22px; font-size: 16px; }
  .install { display: flex; flex-wrap: wrap; gap: 8px; }
  .install code {
    background: var(--panel); border: 1px solid var(--line); border-radius: 10px;
    padding: 9px 12px; font: 13px/1 ui-monospace, SFMono-Regular, Menlo, monospace; cursor: pointer;
  }
  .install code:hover { border-color: var(--accent); }
  .controls {
    position: sticky; top: 0; z-index: 5; background: color-mix(in srgb, var(--bg) 88%, transparent);
    backdrop-filter: blur(10px); border-bottom: 1px solid var(--line); padding: 12px 0;
  }
  .controls .row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
  input[type=search] {
    flex: 1 1 220px; min-width: 180px; background: var(--panel); color: var(--text);
    border: 1px solid var(--line); border-radius: 10px; padding: 9px 12px; font-size: 14px;
  }
  input[type=search]:focus { outline: 2px solid var(--accent); outline-offset: -1px; }
  .seg { display: flex; background: var(--panel); border: 1px solid var(--line); border-radius: 10px; overflow: hidden; }
  .seg button { background: none; border: 0; color: var(--muted); padding: 8px 13px; font-size: 13px; cursor: pointer; }
  .seg button[aria-pressed=true] { background: var(--panel-2); color: var(--text); }
  .count { color: var(--muted); font-size: 13px; margin-left: auto; }
  .grid {
    display: grid; gap: 12px; padding: 22px 0 60px;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
  .card {
    position: relative; margin: 0; background: var(--panel); border: 1px solid var(--line);
    border-radius: var(--radius); padding: 18px 12px 12px; text-align: center; cursor: pointer;
    transition: border-color .15s, transform .15s;
  }
  .card:hover, .card:focus-visible { border-color: var(--accent); transform: translateY(-2px); outline: none; }
  .art { height: 56px; display: grid; place-items: center; }
  .art svg { display: block; }
  .card .m { display: none; color: var(--text); }
  body[data-mono="true"] .card .c { display: none; }
  body[data-mono="true"] .card .m { display: block; }
  figcaption { display: grid; gap: 3px; margin-top: 10px; }
  .name { font-size: 13px; font-weight: 550; }
  figcaption code { font: 11px/1 ui-monospace, Menlo, monospace; color: var(--muted); }
  .badge {
    position: absolute; top: 8px; right: 8px; font-size: 9px; letter-spacing: .04em;
    text-transform: uppercase; color: var(--muted); border: 1px solid var(--line);
    border-radius: 999px; padding: 2px 6px;
  }
  dialog {
    border: 1px solid var(--line); background: var(--panel); color: var(--text);
    border-radius: 16px; padding: 0; width: min(560px, 92vw);
  }
  dialog::backdrop { background: rgba(0,0,0,.6); }
  .sheet { padding: 20px; display: grid; gap: 14px; }
  .sheet header { display: flex; gap: 12px; align-items: center; border: 0; background: none; }
  .sheet h2 { margin: 0; font-size: 18px; }
  .sheet .meta { color: var(--muted); font-size: 12px; }
  .snips { display: grid; gap: 8px; }
  .snip {
    display: flex; gap: 10px; align-items: center; justify-content: space-between;
    background: var(--panel-2); border: 1px solid var(--line); border-radius: 10px; padding: 9px 11px;
  }
  .snip pre { margin: 0; overflow: auto; font: 12px/1.45 ui-monospace, Menlo, monospace; }
  .swatches { display: flex; gap: 6px; }
  .sw { width: 16px; height: 16px; border-radius: 5px; border: 1px solid var(--line); }
  footer { border-top: 1px solid var(--line); padding: 26px 0 50px; color: var(--muted); font-size: 13px; }
  .toast {
    position: fixed; bottom: 22px; left: 50%; transform: translateX(-50%) translateY(20px);
    background: var(--text); color: var(--bg); padding: 9px 16px; border-radius: 999px;
    font-size: 13px; opacity: 0; pointer-events: none; transition: .2s;
  }
  .toast.on { opacity: 1; transform: translateX(-50%) translateY(0); }
</style>
</head>
<body data-mono="false">
<header>
  <div class="wrap">
    <div class="top">
      <span class="logo"><span class="dot"></span> Crypto Elements</span>
      <nav>
        <button class="btn" id="theme" type="button">Theme</button>
        <a class="btn" href="https://github.com/${pkg.repository.url.split('github.com/')[1].replace(/\.git$/, '')}">GitHub</a>
      </nav>
    </div>
    <div class="hero">
      <h1>Crypto logos that ship<br>as code, not PNGs.</h1>
      <p class="lede">${manifest.count} MIT-licensed SVG marks for ${chains} chains and ${dexes} DEXes — a framework-agnostic core, typed React components, colour and <code>currentColor</code> variants, and a plain <code>/svg</code> folder you can hotlink.</p>
      <div class="install">
        <code data-copy="npm i @shakdaniel/react">npm i @shakdaniel/react</code>
        <code data-copy="pnpm add @shakdaniel/react">pnpm add @shakdaniel/react</code>
        <code data-copy="yarn add @shakdaniel/react">yarn add @shakdaniel/react</code>
        <code data-copy="bun add @shakdaniel/react">bun add @shakdaniel/react</code>
      </div>
    </div>
  </div>
</header>

<div class="controls">
  <div class="wrap row">
    <input type="search" id="q" placeholder="Search — uniswap, base, bsc, jup…" autocomplete="off">
    <div class="seg" id="filter">
      <button type="button" data-type="all" aria-pressed="true">All</button>
      <button type="button" data-type="chain" aria-pressed="false">Chains</button>
      <button type="button" data-type="dex" aria-pressed="false">DEXes</button>
    </div>
    <div class="seg">
      <button type="button" id="mono" aria-pressed="false">Mono</button>
    </div>
    <span class="count" id="count"></span>
  </div>
</div>

<main class="wrap">
  <div class="grid" id="grid">
${cards}
  </div>
</main>

<dialog id="sheet"><div class="sheet">
  <header>
    <span id="d-art"></span>
    <span>
      <h2 id="d-name"></h2>
      <span class="meta" id="d-meta"></span>
    </span>
    <span class="swatches" id="d-colors" style="margin-left:auto"></span>
  </header>
  <div class="snips" id="d-snips"></div>
</div></dialog>

<footer class="wrap">
  <p>MIT licensed code. Logos and brand marks are the property of their respective owners — see <a href="https://github.com/${pkg.repository.url.split('github.com/')[1].replace(/\.git$/, '')}/blob/main/TRADEMARKS.md">TRADEMARKS.md</a>.</p>
  <p>v${manifest.version} · <a href="./icons.json">icons.json</a> · <a href="./svg/">raw SVGs</a></p>
</footer>

<div class="toast" id="toast"></div>

<script type="application/json" id="data">${JSON.stringify(manifest.icons)}</script>
<script>
const DATA = new Map(JSON.parse(document.getElementById('data').textContent).map(i => [i.type + ':' + i.id, i]));
const grid = document.getElementById('grid');
const cards = [...grid.children];
const q = document.getElementById('q');
const count = document.getElementById('count');
let type = 'all';

function apply() {
  const term = q.value.trim().toLowerCase();
  let n = 0;
  for (const c of cards) {
    const ok = (type === 'all' || c.dataset.type === type) && (!term || c.dataset.search.includes(term));
    c.hidden = !ok;
    if (ok) n++;
  }
  count.textContent = n + ' / ' + cards.length + ' icons';
}
q.addEventListener('input', apply);
document.getElementById('filter').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  type = b.dataset.type;
  [...e.currentTarget.children].forEach(x => x.setAttribute('aria-pressed', String(x === b)));
  apply();
});
document.getElementById('mono').addEventListener('click', e => {
  const on = document.body.dataset.mono !== 'true';
  document.body.dataset.mono = String(on);
  e.currentTarget.setAttribute('aria-pressed', String(on));
});
document.getElementById('theme').addEventListener('click', () => {
  const el = document.documentElement;
  el.dataset.theme = el.dataset.theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('ce-theme', el.dataset.theme); } catch {}
});
try {
  const saved = localStorage.getItem('ce-theme');
  if (saved) document.documentElement.dataset.theme = saved;
} catch {}

let toastTimer;
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('on'), 1400);
}
async function copy(text, label) {
  try { await navigator.clipboard.writeText(text); toast(label + ' copied'); }
  catch { toast('Copy failed — select manually'); }
}
document.addEventListener('click', e => {
  const c = e.target.closest('[data-copy]');
  if (c) copy(c.dataset.copy, 'Command');
});

const sheet = document.getElementById('sheet');
function openSheet(card) {
  const icon = DATA.get(card.dataset.type + ':' + card.dataset.id);
  const svg = card.querySelector(document.body.dataset.mono === 'true' ? '.m' : '.c').outerHTML
    .replace(/ width="44" height="44"/, '').replace(/ class="[cm]"/, '');
  document.getElementById('d-art').innerHTML = card.querySelector('.art').innerHTML;
  document.getElementById('d-name').textContent = icon.name;
  document.getElementById('d-meta').textContent =
    [icon.id, icon.type, icon.evmChainId ? 'chainId ' + icon.evmChainId : null, icon.fidelity]
      .filter(Boolean).join(' · ');
  document.getElementById('d-colors').innerHTML =
    icon.colors.map(c => '<span class="sw" title="' + c + '" style="background:' + c + '"></span>').join('');

  const snippets = [
    ['React', '<' + icon.component + ' size={24} />'],
    ['Import', "import { " + icon.component + " } from '@shakdaniel/react'"],
    ['Core', "toSvg('" + icon.id + "', { size: 24 })"],
    ['SVG', svg],
    ['URL', location.origin + location.pathname.replace(/[^/]*$/, '') + 'svg/' + icon.type + '/' + icon.id.toLowerCase() + '.svg'],
  ];
  document.getElementById('d-snips').innerHTML = snippets.map(([label, text]) =>
    '<div class="snip"><pre>' + text.replace(/&/g, '&amp;').replace(/</g, '&lt;') +
    '</pre><button class="btn" data-snip="' + encodeURIComponent(text) + '">' + label + '</button></div>'
  ).join('');
  sheet.showModal();
}
grid.addEventListener('click', e => { const c = e.target.closest('.card'); if (c) openSheet(c); });
grid.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { const c = e.target.closest('.card'); if (c) { e.preventDefault(); openSheet(c); } }
});
sheet.addEventListener('click', e => {
  const b = e.target.closest('[data-snip]');
  if (b) copy(decodeURIComponent(b.dataset.snip), b.textContent);
  else if (e.target === sheet) sheet.close();
});
document.addEventListener('keydown', e => {
  if (e.key === '/' && document.activeElement !== q) { e.preventDefault(); q.focus(); }
});
apply();
</script>
</body>
</html>
`

await rm(out, { recursive: true, force: true })
await mkdir(out, { recursive: true })
await writeFile(join(out, 'index.html'), html)
await writeFile(join(out, '.nojekyll'), '')
await cp(join(root, 'build/svg'), join(out, 'svg'), { recursive: true })
await cp(join(root, 'build/icons.json'), join(out, 'icons.json'))
console.log(`✔ site built → site/dist (${manifest.count} icons)`)
