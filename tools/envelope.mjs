// Extrai o envelope de volume da narração (RMS em janelas de 5 ms) para o alinhador.
// Uso: node tools/envelope.mjs <pasta-do-video>
// Saída: <pasta>/audio/envelope.json  { step, duration, sampleRate, rms: [...] }
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const require = createRequire(import.meta.url);
const { chromium } = require('/inner_container/opt/toolchains/.nvm/versions/node/v22.23.4/lib/node_modules/@playwright/mcp/node_modules/playwright');

const root = path.resolve(process.argv[2]);
const file = path.join(root, 'audio', 'narracao.mp3');
const STEP = 0.005;
const b = await chromium.launch({
  executablePath: '/inner_container/opt/playwright/chromium-1232/chrome-linux64/chrome',
  args: ['--disable-crash-reporter', '--disable-crashpad-for-testing'],
});
// vídeo 08: erros da fala escondidos na edição (audio/edicao-voz.json, tempos da narração original).
// O mp3 não é alterado: os cortes são aplicados aqui e na mixagem (render.mjs), então a animação segue a voz já editada.
const cutFile = path.join(root, 'audio', 'edicao-voz.json');
const CUTS = fs.existsSync(cutFile) && !process.env.ORIGINAL ? JSON.parse(fs.readFileSync(cutFile, 'utf8')) : [];
if (CUTS.length) console.log(`edição da voz: ${CUTS.length} corte(s) aplicados (${CUTS.map((c) => `${c.de}–${c.ate} s`).join(', ')})`);
const p = await b.newPage();
const res = await p.evaluate(async ([data, step, cuts]) => {
  const bytes = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
  const buf = await new OfflineAudioContext(1, 1, 44100).decodeAudioData(bytes.buffer);
  const sr = buf.sampleRate, win = Math.round(sr * step);
  let chans = [...Array(buf.numberOfChannels).keys()].map((c) => buf.getChannelData(c));
  if (cuts.length) { // mesmo corte da mixagem: 8 ms de transição suave em cada ponta
    const F = Math.round(sr * 0.008), n = buf.length, keep = []; let pos = 0;
    for (const c of [...cuts].sort((a, z) => a.de - z.de)) { const a = Math.round(c.de * sr), z = Math.round(c.ate * sr); if (a > pos) keep.push([pos, a]); pos = Math.max(pos, z); }
    if (pos < n) keep.push([pos, n]);
    const len = keep.reduce((s, [a, z]) => s + z - a, 0);
    chans = chans.map((ch) => { const o = new Float32Array(len); let q = 0; for (const [a, z] of keep) { for (let i = a; i < z; i++) { let g = 1; if (a > 0 && i - a < F) g = (i - a) / F; if (z < n && z - i <= F) g = Math.min(g, (z - i) / F); o[q + i - a] = ch[i] * g; } q += z - a; } return o; });
  }
  const length = chans[0].length;
  const rms = [];
  let peak = 0;
  for (let i = 0; i < length; i += win) {
    let s = 0; const end = Math.min(length, i + win);
    for (const ch of chans) for (let j = i; j < end; j++) { const v = ch[j]; s += v * v; if (Math.abs(v) > peak) peak = Math.abs(v); }
    rms.push(+Math.sqrt(s / ((end - i) * chans.length)).toFixed(5));
  }
  // passo real da janela (221 amostras a 44,1 kHz = 5,011 ms, não 5 ms): sem isso as palavras escorregam 0,23% para trás
  return { step: win / sr, duration: length / sr, sampleRate: sr, peak, rms };
}, [fs.readFileSync(file).toString('base64'), STEP, CUTS]);
await b.close();
fs.writeFileSync(path.join(root, 'audio', 'envelope.json'), JSON.stringify(res));
console.log(`envelope: ${res.rms.length} janelas, ${res.duration.toFixed(2)} s, pico ${(20 * Math.log10(res.peak)).toFixed(1)} dBFS`);
