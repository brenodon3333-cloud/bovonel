// Gera o Short (vertical 1080x1920) de um vídeo a partir de <pasta>/animacao/short.js.
// O Short usa uma cena do vídeo longo: o texto da cena vem da linha do tempo da narração e o som é o mesmo trecho
// da trilha final (voz + efeitos), com uns segundos de silêncio no fim para o cartão "vídeo completo".
//
// Uso: node tools/short.mjs <pasta> <cena> [preview t1,t2,...]
//   sem "preview": gera <pasta>/saida/short.mov (H.264 + PCM, 30 fps, quadro a quadro)
//   com "preview": gera PNGs em <pasta>/saida/preview/short-tX.png
// Pré-requisito: saida/trilha-final.wav (node tools/render.mjs <pasta> audio)
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { remux } from './remux.mjs';
const require = createRequire(import.meta.url);
const { chromium } = require('/inner_container/opt/toolchains/.nvm/versions/node/v22.23.4/lib/node_modules/@playwright/mcp/node_modules/playwright');
const CHROME = '/inner_container/opt/playwright/chromium-1232/chrome-linux64/chrome';

const [, , dir, cenaArg, mode, tlist] = process.argv;
const root = path.resolve(dir), anim = path.join(root, 'animacao'), out = path.join(root, 'saida');
const SW = 1080, SH = 1920, FPS = 30, BITRATE = Number(process.env.BITRATE || 10_000_000), FIM = 2.6;
const tl = JSON.parse(fs.readFileSync(path.join(root, 'audio', 'timeline.json'), 'utf8')).timeline;
const seg = tl[Number(cenaArg) - 1];
const voz = seg.segEnd - seg.segStart, dur = voz + FIM;
const strip = (s) => s.replace(/^import[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '').replace(/^export\s+/gm, '');
const code = ['lib.js', 'fx.js', 'scenes.js', 'short.js'].map((f) => strip(fs.readFileSync(path.join(anim, f), 'utf8'))).join('\n');
const html = `<html><body style="margin:0;background:#000"><canvas id="c" width="${SW}" height="${SH}"></canvas><script>
(() => { ${code}
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').replace(/[^a-z0-9 ]/g, ' ').split(/\\s+/).filter(Boolean);
const ERR = [];
window.setup = (seg, dur) => {
  const toks = seg.words.map((w) => norm(w.w).join(''));
  const K = (phrase) => { const p = norm(phrase); for (let i = 0; i + p.length <= toks.length; i++) if (p.every((x, j) => toks[i + j] === x)) return seg.words[i].t; ERR.push(phrase); return 1e9; };
  window.S = buildShort(K, dur); return ERR;
};
const cv = document.getElementById('c'), ctx = cv.getContext('2d', { alpha: false });
window.frame = (t) => { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = '#05070d'; ctx.fillRect(0, 0, ${SW}, ${SH}); S.draw(ctx, t);
  if (t < 0.15) { ctx.fillStyle = 'rgba(0,0,0,' + (1 - t / 0.15) + ')'; ctx.fillRect(0, 0, ${SW}, ${SH}); }
  const d = S.dur - t; if (d < 0.6) { ctx.fillStyle = 'rgba(0,0,0,' + (1 - d / 0.6) + ')'; ctx.fillRect(0, 0, ${SW}, ${SH}); } };
window.png = (t) => { frame(t); return cv.toDataURL('image/png'); };
window.encode = async (dur, bitrate, fps) => {
  S.dur = dur; const n = Math.round(dur * fps), samples = []; let avcC = null, color = null, err = null, parts = [];
  const enc = new VideoEncoder({ output: (ch, md) => { if (md && md.decoderConfig) { if (md.decoderConfig.description && !avcC) avcC = Array.from(new Uint8Array(md.decoderConfig.description instanceof ArrayBuffer ? md.decoderConfig.description : md.decoderConfig.description.buffer)); if (md.decoderConfig.colorSpace && !color) color = md.decoderConfig.colorSpace; }
    const b = new Uint8Array(ch.byteLength); ch.copyTo(b); samples.push([b.length, ch.type === 'key' ? 1 : 0]); parts.push(b); }, error: (e) => { err = e.message; } });
  enc.configure({ codec: 'avc1.640028', width: ${SW}, height: ${SH}, bitrate, bitrateMode: 'variable', framerate: fps, latencyMode: 'quality', avc: { format: 'avc' } });
  for (let i = 0; i < n && !err; i++) { frame(i / fps); const f = new VideoFrame(cv, { timestamp: Math.round(i * 1e6 / fps), duration: Math.round(1e6 / fps) }); enc.encode(f, { keyFrame: i % (2 * fps) === 0 }); f.close(); while (enc.encodeQueueSize > 3) await new Promise((r) => setTimeout(r, 0)); }
  await enc.flush(); enc.close(); if (err) throw new Error(err);
  let tot = 0; for (const p of parts) tot += p.length; const all = new Uint8Array(tot); let o = 0; for (const p of parts) { all.set(p, o); o += p.length; }
  for (let p = 0; p < all.length; p += 3 << 20) { const part = all.subarray(p, p + (3 << 20)); let s = ''; for (let j = 0; j < part.length; j += 0x8000) s += String.fromCharCode.apply(null, part.subarray(j, j + 0x8000)); await window.__chunk(btoa(s)); }
  return { frames: n, samples, avcC, color };
};
window.ready = true; })();
</script></body></html>`;
const b = await chromium.launch({ executablePath: CHROME, args: ['--disable-crash-reporter', '--disable-crashpad-for-testing'] });
const p = await b.newPage({ viewport: { width: SW, height: SH } });
p.on('pageerror', (e) => console.error('[página]', e.message));
let chunks = [];
await p.exposeFunction('__chunk', (s) => { chunks.push(Buffer.from(s, 'base64')); });
await p.goto('file://' + out + '/');
await p.setContent(html);
await p.waitForFunction(() => window.ready === true);
await p.evaluate(() => document.fonts.ready);
const err = await p.evaluate(([s, d]) => window.setup(s, d), [seg, dur]);
if (err.length) { console.error('Frases não encontradas: ' + err.join(' | ')); await b.close(); process.exit(1); }
await p.evaluate((d) => { window.S.dur = d; }, dur);
if (mode === 'preview') {
  fs.mkdirSync(path.join(out, 'preview'), { recursive: true });
  for (const t of tlist.split(',').map(Number)) { const d = await p.evaluate((x) => window.png(x), t); const f = path.join(out, 'preview', `short-t${t.toFixed(1)}.png`); fs.writeFileSync(f, Buffer.from(d.split(',')[1], 'base64')); console.log(f); }
} else {
  // som: o mesmo trecho da trilha final + silêncio no fim
  const w = fs.readFileSync(path.join(out, 'trilha-final.wav')), sr = w.readUInt32LE(24), di = w.indexOf('data'), pcmAll = w.subarray(di + 8);
  const a0 = Math.round(seg.segStart * sr) * 2, a1 = Math.round(seg.segEnd * sr) * 2;
  const need = Math.round(dur * sr) * 2, pcm = Buffer.concat([pcmAll.subarray(a0, a1), Buffer.alloc(Math.max(0, need - (a1 - a0)))]).subarray(0, need);
  // as voltas de volume nas pontas: 40 ms de entrada e saída suaves
  const F = Math.round(sr * 0.04); for (let i = 0; i < F; i++) { for (const k of [i, (need / 2) - 1 - i]) { const v = pcm.readInt16LE(k * 2); pcm.writeInt16LE(Math.round(v * (i / F)), k * 2); } }
  const r = await p.evaluate(([d, br, fps]) => window.encode(d, br, fps), [dur, BITRATE, FPS]);
  const cs = r.color || {}, P = { bt709: 1, bt470bg: 5, smpte170m: 6 }, T = { bt709: 1, smpte170m: 6, 'iec61966-2-1': 13 }, M = { rgb: 0, bt709: 1, bt470bg: 5, smpte170m: 6 };
  const raw = { data: Buffer.concat(chunks), samples: r.samples.map(([size, key]) => ({ size, key })), fps: FPS, width: SW, height: SH, avcC: Buffer.from(r.avcC), color: [P[cs.primaries] ?? 1, T[cs.transfer] ?? 1, M[cs.matrix] ?? 1, !!cs.fullRange] };
  const file = path.join(out, 'short.mov');
  console.log(JSON.stringify(remux(null, file, { raw, pcm: { data: pcm, sampleRate: sr }, mov: true })));
  console.log(`short.mov: ${(fs.statSync(file).size / 1e6).toFixed(1)} MB, ${dur.toFixed(1)} s`);
}
await b.close();
