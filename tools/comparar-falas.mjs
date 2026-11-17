// Compara dois trechos da narração que deveriam dizer a mesma coisa (ex.: "1962" na cena 1 e na cena 9).
// Calcula o espectro (bandas de frequência a cada 10 ms) e alinha um trecho com o outro (DTW).
// Mostra onde o som diverge e quanto tempo sobra ou falta em cada um.
// Uso: node tools/comparar-falas.mjs <pasta> <a0>,<a1> <b0>,<b1> [rótulo]
//      (tempos em segundos da narração). Saída no terminal.
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const require = createRequire(import.meta.url);
const { chromium } = require('/inner_container/opt/toolchains/.nvm/versions/node/v22.23.4/lib/node_modules/@playwright/mcp/node_modules/playwright');

const [, , dir, A, B, label = ''] = process.argv;
const root = path.resolve(dir);
const [a0, a1] = A.split(',').map(Number), [b0, b1] = B.split(',').map(Number);
const br = await chromium.launch({ executablePath: '/inner_container/opt/playwright/chromium-1232/chrome-linux64/chrome', args: ['--disable-crash-reporter', '--disable-crashpad-for-testing'] });
const p = await br.newPage();
const res = await p.evaluate(async ([data, a0, a1, b0, b1]) => {
  const bytes = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
  const buf = await new OfflineAudioContext(1, 1, 16000).decodeAudioData(bytes.buffer);
  const sr = buf.sampleRate, x = buf.getChannelData(0);
  const N = 512, hop = Math.round(sr * 0.01), win = Math.round(sr * 0.025), NB = 26;
  const hann = Float32Array.from({ length: win }, (_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (win - 1)));
  const mel = (f) => 2595 * Math.log10(1 + f / 700), imel = (m) => 700 * (10 ** (m / 2595) - 1);
  const edges = Array.from({ length: NB + 2 }, (_, i) => imel(mel(100) + (i * (mel(7000) - mel(100))) / (NB + 1)));
  function fft(re, im) {
    const n = re.length;
    for (let i = 1, j = 0; i < n; i++) { let b = n >> 1; for (; j & b; b >>= 1) j ^= b; j ^= b; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
    for (let len = 2; len <= n; len <<= 1) {
      const ang = (-2 * Math.PI) / len;
      for (let i = 0; i < n; i += len) for (let k = 0; k < len / 2; k++) {
        const wr = Math.cos(ang * k), wi = Math.sin(ang * k), ur = re[i + k], ui = im[i + k];
        const vr = re[i + k + len / 2] * wr - im[i + k + len / 2] * wi, vi = re[i + k + len / 2] * wi + im[i + k + len / 2] * wr;
        re[i + k] = ur + vr; im[i + k] = ui + vi; re[i + k + len / 2] = ur - vr; im[i + k + len / 2] = ui - vi;
      }
    }
  }
  function feats(t0, t1) {
    const out = [];
    for (let s = Math.round(t0 * sr); s + win < Math.round(t1 * sr); s += hop) {
      const re = new Float64Array(N), im = new Float64Array(N);
      for (let i = 0; i < win; i++) re[i] = (x[s + i] || 0) * hann[i];
      fft(re, im);
      const pw = Array.from({ length: N / 2 }, (_, k) => re[k] * re[k] + im[k] * im[k]);
      const v = [];
      let e = 0;
      for (let b = 0; b < NB; b++) {
        let acc = 0;
        for (let k = 0; k < N / 2; k++) {
          const f = (k * sr) / N, lo = edges[b], c = edges[b + 1], hi = edges[b + 2];
          const w = f < lo || f > hi ? 0 : f <= c ? (f - lo) / (c - lo) : (hi - f) / (hi - c);
          acc += w * pw[k];
        }
        v.push(Math.log(acc + 1e-9)); e += acc;
      }
      const m = v.reduce((q, y) => q + y, 0) / NB; // tira o volume: compara só a forma do som
      out.push({ v: v.map((y) => y - m), e: 10 * Math.log10(e + 1e-12) });
    }
    return out;
  }
  const FA = feats(a0, a1), FB = feats(b0, b1);
  const dist = (u, w) => Math.sqrt(u.v.reduce((q, y, i) => q + (y - w.v[i]) ** 2, 0) / NB);
  const n = FA.length, m = FB.length, D = Array.from({ length: n + 1 }, () => new Float64Array(m + 1).fill(Infinity));
  D[0][0] = 0;
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) D[i][j] = dist(FA[i - 1], FB[j - 1]) + Math.min(D[i - 1][j] + 0.15, D[i][j - 1] + 0.15, D[i - 1][j - 1]);
  const pathAB = [];
  for (let i = n, j = m; i > 0 && j > 0;) {
    pathAB.push([i - 1, j - 1, dist(FA[i - 1], FB[j - 1])]);
    const c = [D[i - 1][j - 1], D[i - 1][j], D[i][j - 1]], k = c.indexOf(Math.min(...c));
    if (k === 0) { i--; j--; } else if (k === 1) i--; else j--;
  }
  pathAB.reverse();
  return { n, m, path: pathAB, eA: FA.map((f) => f.e), eB: FB.map((f) => f.e), total: D[n][m] / (n + m) };
}, [fs.readFileSync(process.env.EDITADA ? path.join(root, 'audio', 'narracao-editada.wav') : path.join(root, 'audio', 'narracao.mp3')).toString('base64'), a0, a1, b0, b1]);
await br.close();

// relatório em blocos de 50 ms: distância média e "esticamento" (quantos quadros de A para cada quadro de B)
console.log(`${label} A ${a0}-${a1} s (${res.n} quadros) x B ${b0}-${b1} s (${res.m} quadros); distância média ${res.total.toFixed(2)}`);
const rows = [];
for (let s = 0; s < res.n; s += 5) {
  const seg = res.path.filter(([i]) => i >= s && i < s + 5);
  if (!seg.length) continue;
  const d = seg.reduce((q, x) => q + x[2], 0) / seg.length, js = seg.map((x) => x[1]);
  const span = Math.max(...js) - Math.min(...js) + 1;
  rows.push(`A ${(a0 + s / 100).toFixed(2)} s  ->  B ${(b0 + Math.min(...js) / 100).toFixed(2)} s  dist ${d.toFixed(2)} ${'#'.repeat(Math.round(d * 6))}${span <= 1 ? '   (A esticado: B parado)' : ''}  vol A ${res.eA[s].toFixed(0)} dB`);
}
console.log(rows.join('\n'));
