// Mostra a embalagem (thumb + título) do jeito que o público vê no YouTube: feed do celular
// no modo escuro e no claro, e a lista lateral (168 px). Serve para escolher título e thumb juntos.
//
// Uso:
//   node tools/feed.mjs <saida.jpg> "<thumb.jpg>|<título>|<duração>" ["<thumb2>|<título2>|<duração2>" ...]
//   node tools/feed.mjs --grade <saida.jpg> <thumb1.jpg> <thumb2.jpg> ...   (todas as thumbs a 168 px, fundo escuro e claro)
// Os caminhos das thumbs são relativos à raiz do repositório.
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ||
  '/inner_container/opt/toolchains/.nvm/versions/node/v22.23.4/lib/node_modules/@playwright/mcp/node_modules/playwright');
const CHROME = process.env.CHROME_BIN || '/inner_container/opt/playwright/chromium-1232/chrome-linux64/chrome';

const args = process.argv.slice(2);
const grade = args[0] === '--grade';
if (grade) args.shift();
const [saida, ...itens] = args;
if (!saida || !itens.length) { console.error('uso: node tools/feed.mjs [--grade] <saida.jpg> <itens...>'); process.exit(1); }
const raiz = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const img = (p) => 'data:image/jpeg;base64,' + fs.readFileSync(path.resolve(raiz, p)).toString('base64');
const logoPath = path.join(raiz, 'canal', 'logo.png');
const logo = fs.existsSync(logoPath) ? 'data:image/png;base64,' + fs.readFileSync(logoPath).toString('base64') : '';
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const css = `body{margin:0;font-family:"Noto Sans",Roboto,sans-serif}
.col{display:inline-block;vertical-align:top;padding:18px 16px;width:390px;white-space:normal}
.meta>div:last-child{min-width:0;flex:1}
.esc{background:#0f0f0f;color:#f1f1f1}.clr{background:#ffffff;color:#0f0f0f}
.lbl{font:700 13px "Noto Sans";letter-spacing:1px;opacity:.6;margin:0 0 10px}
.card{margin-bottom:22px}.th{position:relative;width:390px;height:219px;border-radius:12px;overflow:hidden}
.th img{width:100%;height:100%;display:block}
.dur{position:absolute;right:6px;bottom:6px;background:rgba(0,0,0,.8);color:#fff;font:600 12px "Noto Sans";padding:1px 4px;border-radius:4px}
.meta{display:flex;gap:12px;margin-top:10px}.av{width:36px;height:36px;border-radius:50%;flex:none;background:#333 center/cover}
.tt{font:500 16px/22px "Noto Sans";display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.sub{font:400 12px/18px "Noto Sans";opacity:.65;margin-top:2px}
.side{display:flex;gap:8px;margin-bottom:12px;width:390px}.sth{position:relative;width:168px;height:94px;flex:none;border-radius:8px;overflow:hidden}
.sth img{width:100%;height:100%;display:block}.sth .dur{font-size:11px;right:4px;bottom:4px}
.side>div:last-child{min-width:0;flex:1}
.stt{font:500 14px/20px "Noto Sans";display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.g{display:inline-block;margin:6px}.g img{width:168px;height:94px;border-radius:8px;display:block}`;

let html;
if (grade) {
  const bloco = (cls) => `<div class="col ${cls}" style="width:auto;max-width:1240px"><p class="lbl">${cls === 'esc' ? 'MODO ESCURO' : 'MODO CLARO'} · 168 px</p>${itens.map((t) => `<div class="g"><img src="${img(t)}"></div>`).join('')}</div>`;
  html = `<style>${css}</style>${bloco('esc')}<br>${bloco('clr')}`;
} else {
  const parse = (s) => { const [t, titulo, dur = '8:00'] = s.split('|'); return { t: img(t), titulo: esc(titulo), dur }; };
  const L = itens.map(parse);
  const feed = (cls) => `<div class="col ${cls}"><p class="lbl">CELULAR · ${cls === 'esc' ? 'MODO ESCURO' : 'MODO CLARO'}</p>${L.map((x) => `<div class="card"><div class="th"><img src="${x.t}"><span class="dur">${x.dur}</span></div>
    <div class="meta"><div class="av" style="background-image:url(${logo})"></div><div><div class="tt">${x.titulo}</div><div class="sub">Bovonel · 1,2 mil visualizações · há 3 horas</div></div></div></div>`).join('')}</div>`;
  const lado = `<div class="col esc"><p class="lbl">LISTA AO LADO DO VÍDEO · 168 px</p>${L.map((x) => `<div class="side"><div class="sth"><img src="${x.t}"><span class="dur">${x.dur}</span></div>
    <div><div class="stt">${x.titulo}</div><div class="sub">Bovonel<br>1,2 mil visualizações</div></div></div>`).join('')}</div>`;
  html = `<style>${css}</style><div style="white-space:nowrap">${feed('esc')}${feed('clr')}${lado}</div>`;
}
const b = await chromium.launch({ executablePath: CHROME, args: ['--disable-crash-reporter', '--disable-crashpad-for-testing'] });
const p = await b.newPage({ viewport: { width: grade ? 1300 : 1300, height: 600 }, deviceScaleFactor: 1 });
await p.setContent(html);
await p.evaluate(() => document.fonts.ready);
fs.mkdirSync(path.dirname(path.resolve(saida)), { recursive: true });
await p.screenshot({ path: path.resolve(saida), fullPage: true, type: 'jpeg', quality: 90 });
await b.close();
console.log(saida);
