// Vídeo 08: 13º salário 2026, quanto cai na sua conta e quem fica com o resto.
// Cada cena recebe K(frase) = instante (s, relativo à cena) em que a frase começa na narração.
// Conceito: a mesa do departamento pessoal no fim do ano é o palco e o holerite do 13º é o fio condutor.
// Regras dos vídeos 04 a 07: câmera sempre andando, paralaxe em camadas, transições discretas (corte ou 'push'),
// uma só virada de efeito (o holerite vira de costas na cena 5), sem música (só ambiente quase inaudível).
// Checagem de silhueta (feedback do vídeo 07): cada objeto copia o desenho do objeto de verdade.
import { W, H, C, clamp, lerp, prog, ease, appear, text, font, rr, fillRR, strokeRR, circle, hexA, source, iconBank } from './lib.js';
import { glowText, counting, shockRing, sparks, layer } from './fx.js';

// cores por destino do dinheiro: você (verde), FGTS (azul-claro), INSS e encargos (laranja), imposto de renda (vermelho)
const P = {
  voce: '#4ade80', fgts: '#38bdf8', inss: '#f59e0b', ir: '#ef4444', juros: '#f43f5e', hist: '#e7d7b0',
  ink: '#1f2937', paper: '#fbfaf5', red: '#dc2626', ok: '#22c55e', amber: '#fbbf24', sky: '#38bdf8', azul: '#1e3a8a',
  kraft: '#c9a46a', nota: '#4f9fc0',
};
const vis = (t, a, b, fin = 0.4, fout = 0.4) => Math.min(appear(t, a, fin), 1 - appear(t, b, fout));
function zone(ctx, cam, a, b, fn) {
  const d = cam.x < a ? a - cam.x : cam.x > b ? cam.x - b : 0, al = 1 - clamp((d - 450) / 600);
  if (al <= 0) return;
  ctx.save(); ctx.globalAlpha *= al; fn(); ctx.restore();
}
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const MONO = (size, w = 700) => `${w} ${size}px "DejaVu Sans Mono", "Liberation Mono", monospace`;
function mono(ctx, str, x, y, size, color = P.ink, align = 'left', w = 700) {
  ctx.save(); ctx.font = MONO(size, w); ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(str, x, y); ctx.restore();
}
const fmt = (v, d = 2) => v.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });

// ================================================================ tipografia (a mesma família do vídeo 07)
function headline(ctx, str, x, y, o = {}) {
  const { size = 72, color = '#ffffff', color2 = null, align = 'center', hl = null, k = 1, rot = 0, letter = 0 } = o;
  if (k <= 0) return 0;
  const depth = o.depth ?? Math.max(3, Math.round(size / 14));
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  const kk = clamp(k), sc = o.noPop ? 1 : lerp(1.22, 1, ease.out(kk));
  ctx.scale(sc, sc); ctx.globalAlpha *= clamp(kk * 1.8);
  ctx.font = font(size, 900); ctx.textAlign = align; ctx.textBaseline = 'middle';
  if (letter) ctx.letterSpacing = `${letter}px`;
  const w = ctx.measureText(str).width;
  const x0 = align === 'left' ? 0 : align === 'center' ? -w / 2 : -w;
  if (hl) {
    const pad = size * 0.2, hk = ease.out(clamp(kk * 1.4)), L = x0 - pad, R = L + (w + 2 * pad) * hk, T0 = -size * 0.6, B0 = size * 0.52;
    ctx.save(); ctx.fillStyle = hl; ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 26; ctx.shadowOffsetY = 8;
    ctx.beginPath(); ctx.moveTo(L, T0 + 5); ctx.lineTo(R, T0); ctx.lineTo(R + 9, (T0 + B0) / 2); ctx.lineTo(R - 3, B0); ctx.lineTo(L + 4, B0 + 5); ctx.lineTo(L - 9, (T0 + B0) / 2 + 3); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = depth + 4;
  ctx.fillStyle = '#05070d'; ctx.fillText(str, depth * 0.45, depth); ctx.restore();
  ctx.fillStyle = '#05070d'; for (let i = depth - 1; i > 0; i--) ctx.fillText(str, i * 0.45, i);
  ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(4, size / 9); ctx.strokeStyle = '#05070d'; ctx.strokeText(str, 0, 0);
  const g = ctx.createLinearGradient(0, -size * 0.5, 0, size * 0.45); g.addColorStop(0, color); g.addColorStop(1, color2 || color);
  ctx.fillStyle = g; ctx.fillText(str, 0, 0);
  ctx.restore();
  return w;
}
function bigNum(ctx, str, x, y, k, o = {}) {
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(k * 1.6); ctx.translate(x, y + (1 - ease.out(clamp(k))) * 26);
  glowText(ctx, str, 0, 0, { size: o.size || 96, weight: 900, color: o.color || '#ffffff', glow: o.glow || hexA(o.color || '#ffffff', 0.55), blur: 34, align: o.align || 'center' });
  ctx.restore();
}
function chip(ctx, x, y, str, color, k, o = {}) {
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(k * 2); ctx.translate(x, y); const sc = lerp(0.6, 1, ease.back(clamp(k))); ctx.scale(sc, sc);
  ctx.font = font(o.size || 30, 900); const w = ctx.measureText(str).width + 50, h = (o.size || 30) * 1.7;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6; fillRR(ctx, -w / 2, -h / 2, w, h, h / 2, o.bg || '#0b1222'); ctx.restore();
  strokeRR(ctx, -w / 2, -h / 2, w, h, h / 2, color, 4);
  text(ctx, str, 0, 2, { size: o.size || 30, weight: 900, color: o.fg || color });
  ctx.restore();
}
function ovalStamp(ctx, cx, cy, rx, ry, lines, color, k = 1, rot = -0.12) {
  if (k <= 0) return;
  const sc = lerp(1.6, 1, ease.out(clamp(k * 1.4)));
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 2) * 0.92;
  ctx.strokeStyle = color; ctx.lineWidth = Math.max(3, ry * 0.07);
  ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, 6.283); ctx.stroke();
  ctx.lineWidth = Math.max(2, ry * 0.035); ctx.beginPath(); ctx.ellipse(0, 0, rx * 0.88, ry * 0.84, 0, 0, 6.283); ctx.stroke();
  lines.forEach(([str, dy, size, weight = 900], i) => text(ctx, str, 0, dy * ry, { size: size * ry, weight, color, letter: i === 1 ? 2 : 1 }));
  const r = rng(Math.round(rx * 7));
  ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = 'rgba(0,0,0,0.5)';
  for (let i = 0; i < 60; i++) { const a = r() * 6.283, d = r(); ctx.beginPath(); ctx.arc(Math.cos(a) * rx * d, Math.sin(a) * ry * d, 1 + r() * 2.5, 0, 6.283); ctx.fill(); }
  ctx.restore();
}
function rectStamp(ctx, cx, cy, w, h, str, color, k = 1, rot = -0.08, size = 64, sub = null) {
  if (k <= 0) return;
  const sc = lerp(1.8, 1, ease.out(clamp(k * 1.5)));
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 2.2) * 0.95;
  strokeRR(ctx, -w / 2, -h / 2, w, h, 14, color, 9);
  strokeRR(ctx, -w / 2 + 14, -h / 2 + 14, w - 28, h - 28, 8, color, 3);
  text(ctx, str, 0, sub ? -h * 0.13 : 2, { size, weight: 900, color, letter: 3 });
  if (sub) text(ctx, sub, 0, h * 0.24, { size: size * 0.42, weight: 900, color, letter: 2 });
  const r = rng(Math.round(w)); ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = 'rgba(0,0,0,0.55)';
  for (let i = 0; i < 90; i++) { ctx.beginPath(); ctx.arc((r() - 0.5) * w, (r() - 0.5) * h, 1 + r() * 3, 0, 6.283); ctx.fill(); }
  ctx.restore();
}
function arrow(ctx, x0, y0, x1, y1, color, lw = 6, k = 1) {
  if (k <= 0) return;
  const x = lerp(x0, x1, k), y = lerp(y0, y1, k), a = Math.atan2(y1 - y0, x1 - x0);
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x - Math.cos(a) * lw * 2, y - Math.sin(a) * lw * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - Math.cos(a - 0.45) * lw * 4, y - Math.sin(a - 0.45) * lw * 4); ctx.lineTo(x - Math.cos(a + 0.45) * lw * 4, y - Math.sin(a + 0.45) * lw * 4); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function check(ctx, x, y, s, color, k = 1) {
  if (k <= 0) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 10 * s; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const pts = [[-30, 0], [-8, 22], [34, -24]], L1 = 31, L2 = 63, d = (L1 + L2) * clamp(k);
  ctx.beginPath(); ctx.moveTo(x + pts[0][0] * s, y + pts[0][1] * s);
  if (d <= L1) ctx.lineTo(x + lerp(pts[0][0], pts[1][0], d / L1) * s, y + lerp(pts[0][1], pts[1][1], d / L1) * s);
  else { ctx.lineTo(x + pts[1][0] * s, y + pts[1][1] * s); const q = (d - L1) / L2; ctx.lineTo(x + lerp(pts[1][0], pts[2][0], q) * s, y + lerp(pts[1][1], pts[2][1], q) * s); }
  ctx.stroke(); ctx.restore();
}
function xMark(ctx, x, y, s, color, k = 1) {
  if (k <= 0) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 11 * s; ctx.lineCap = 'round';
  const a = clamp(k * 2), b = clamp(k * 2 - 1);
  ctx.beginPath(); ctx.moveTo(x - 28 * s, y - 28 * s); ctx.lineTo(x + lerp(-28, 28, a) * s, y + lerp(-28, 28, a) * s); ctx.stroke();
  if (b > 0) { ctx.beginPath(); ctx.moveTo(x + 28 * s, y - 28 * s); ctx.lineTo(x + lerp(28, -28, b) * s, y + lerp(-28, 28, b) * s); ctx.stroke(); }
  ctx.restore();
}
function crossOut(ctx, x0, y0, x1, y1, color, k = 1, lw = 10) {
  if (k <= 0) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(lerp(x0, x1, clamp(k)), lerp(y0, y1, clamp(k))); ctx.stroke(); ctx.restore();
}
// círculo de caneta feito à mão (duas voltas que não fecham certinho)
function penCircle(ctx, x, y, rx, ry, color, k, lw = 7) {
  if (k <= 0) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.globalAlpha *= 0.92;
  ctx.beginPath(); const n = 60, end = 1.15 * clamp(k);
  for (let i = 0; i <= n * end; i++) { const a = -2.4 + (i / n) * 6.283, w = 1 + 0.05 * Math.sin(i * 0.3); const px = x + Math.cos(a) * rx * w, py = y + Math.sin(a) * ry * w + (i / n) * 6; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
  ctx.stroke(); ctx.restore();
}
// marca-texto passando sobre uma linha
function marker(ctx, x, y, w, h, color, k) {
  if (k <= 0) return;
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha *= 0.85; ctx.fillStyle = color;
  const ww = w * ease.out(clamp(k)); ctx.beginPath(); ctx.moveTo(x, y + 4); ctx.lineTo(x + ww, y); ctx.lineTo(x + ww + 6, y + h - 2); ctx.lineTo(x - 3, y + h + 3); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function sombraChao(ctx, x, y, w, a = 0.45) {
  ctx.save(); const g = ctx.createRadialGradient(x, y, 0, x, y, w); g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, w, w * 0.16, 0, 0, 6.283); ctx.fill(); ctx.restore();
}
function papelSombra(ctx) { ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 34; ctx.shadowOffsetY = 14; }
// Documento desenhado numa imagem à parte e colado na cena (como o cartão de embarque do vídeo 06):
// o texto miúdo do papel faz parte do objeto e não entra na revisão de textos sobrepostos.
// Cuidado: por isso mesmo, o papel inteiro tem que ficar acima da faixa das legendas (y < 890 na tela).
const DOCS = {};
function drawDoc(ctx, key, w, h, fn) {
  const pad = 80, sc = 1.3;
  let c = DOCS[key];
  if (!c) { c = DOCS[key] = document.createElement('canvas'); c.width = Math.ceil((w + 2 * pad) * sc); c.height = Math.ceil((h + 2 * pad) * sc); }
  const g = c.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, c.width, c.height);
  g.setTransform(sc, 0, 0, sc, (w / 2 + pad) * sc, (h / 2 + pad) * sc);
  fn(g);
  ctx.drawImage(c, -(w / 2 + pad), -(h / 2 + pad), w + 2 * pad, h + 2 * pad);
}

// ================================================================ cenário: escritório do departamento pessoal em dezembro
// parede, duas janelas com persiana e a cidade no fim da tarde, luzinhas de Natal, arquivo de aço, estante de fichários e o tampo da mesa.
let OFFICE = null;
function escritorioFundo(ctx, cam, a = 1, escuro = 0) {
  if (!OFFICE) {
    const Wd = 2600, Hd = 1400, r = rng(81);
    const c = document.createElement('canvas'); c.width = Wd; c.height = Hd; const g = c.getContext('2d');
    const wg = g.createLinearGradient(0, 0, 0, 900); wg.addColorStop(0, '#3d4456'); wg.addColorStop(1, '#2a303e'); g.fillStyle = wg; g.fillRect(0, 0, Wd, Hd);
    g.fillStyle = 'rgba(255,255,255,0.05)'; g.fillRect(0, 760, Wd, 14); // rodameio
    for (const wx of [160, 1480]) {
      const sky = g.createLinearGradient(0, 118, 0, 642); sky.addColorStop(0, '#f4b36a'); sky.addColorStop(0.55, '#c76b58'); sky.addColorStop(1, '#4b3652');
      g.fillStyle = '#1b1f29'; g.fillRect(wx - 18, 100, 640, 560); g.fillStyle = sky; g.fillRect(wx, 118, 604, 524);
      for (let i = 0; i < 9; i++) {
        const bw = 44 + r() * 70, bh = 130 + r() * 260, bx = wx + i * 66 + r() * 16;
        g.fillStyle = '#2b2739'; g.fillRect(bx, 642 - bh, bw, bh);
        for (let yy = 642 - bh + 14; yy < 628; yy += 22) for (let xx = bx + 8; xx < bx + bw - 8; xx += 16) if (r() > 0.55) { g.fillStyle = 'rgba(255,214,140,0.85)'; g.fillRect(xx, yy, 7, 10); }
      }
      g.fillStyle = 'rgba(226,221,206,0.88)'; for (let yy = 118; yy < 360; yy += 19) g.fillRect(wx, yy, 604, 11); // persiana meio aberta
      g.fillStyle = '#1b1f29'; g.fillRect(wx + 296, 118, 12, 524); g.fillRect(wx - 18, 642, 640, 18);
      g.strokeStyle = '#14532d'; g.lineWidth = 4; g.beginPath();
      for (let i = 0; i <= 22; i++) { const xx = wx + 6 + i * 27, yy = 130 + Math.sin(i * 0.55) * 12; i ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke();
      const cols = ['#f87171', '#fbbf24', '#4ade80', '#60a5fa'];
      for (let i = 0; i <= 22; i++) { const xx = wx + 6 + i * 27, yy = 136 + Math.sin(i * 0.55) * 12; g.fillStyle = cols[i % 4]; g.beginPath(); g.ellipse(xx, yy, 6, 9, 0, 0, 6.283); g.fill(); }
    }
    // arquivo de aço com 4 gavetas (puxador e etiqueta em cada uma)
    g.fillStyle = '#5a6374'; g.fillRect(890, 360, 320, 540);
    for (let i = 0; i < 4; i++) { g.fillStyle = '#6c7588'; g.fillRect(902, 374 + i * 130, 296, 116); g.fillStyle = '#c7ccd6'; g.fillRect(1010, 440 + i * 130, 80, 14); g.fillStyle = '#f3efe2'; g.fillRect(1024, 396 + i * 130, 52, 24); }
    // estante com fichários de lombada colorida (etiqueta branca e furo de dedo)
    for (const sy of [300, 600]) {
      g.fillStyle = '#1d212b'; g.fillRect(2190, sy, 380, 14);
      const fc = ['#1e40af', '#b91c1c', '#15803d', '#a16207', '#475569', '#1e40af', '#7c2d12', '#15803d', '#334155'];
      for (let i = 0; i < 9; i++) {
        const h = 210 - (i % 3) * 12; g.fillStyle = fc[(i + sy) % 9]; g.fillRect(2200 + i * 40, sy - h, 34, h);
        g.fillStyle = 'rgba(255,255,255,0.75)'; g.fillRect(2205 + i * 40, sy - h + 30, 24, 50);
        g.fillStyle = 'rgba(0,0,0,0.45)'; g.beginPath(); g.arc(2217 + i * 40, sy - 40, 8, 0, 6.283); g.fill();
      }
    }
    // mural de cortiça com avisos
    g.fillStyle = '#8b6a43'; g.fillRect(1200, 160, 220, 170); g.fillStyle = '#b08757'; g.fillRect(1210, 170, 200, 150);
    for (const [px, py, cc] of [[1230, 190, '#fef3c7'], [1300, 210, '#ffffff'], [1350, 180, '#fde68a'], [1250, 260, '#ffffff']]) { g.fillStyle = cc; g.fillRect(px, py, 50, 60); g.fillStyle = '#dc2626'; g.beginPath(); g.arc(px + 25, py + 6, 5, 0, 6.283); g.fill(); }
    const desk = g.createLinearGradient(0, 900, 0, Hd); desk.addColorStop(0, '#8c6c4b'); desk.addColorStop(1, '#3a291b'); g.fillStyle = desk; g.fillRect(0, 900, Wd, Hd - 900);
    g.strokeStyle = 'rgba(0,0,0,0.22)'; g.lineWidth = 3;
    for (let y = 924; y < Hd; y += 40) { g.beginPath(); for (let x = 0; x <= Wd; x += 80) { const yy = y + Math.sin(x * 0.01 + y) * 4; x ? g.lineTo(x, yy) : g.moveTo(x, yy); } g.stroke(); }
    g.fillStyle = 'rgba(255,230,190,0.14)'; g.fillRect(0, 900, Wd, 8);
    const tmp = document.createElement('canvas'); tmp.width = Wd; tmp.height = Hd; const t2 = tmp.getContext('2d');
    t2.filter = 'blur(12px)'; for (const dx of [-Wd, 0, Wd]) t2.drawImage(c, dx, 0); OFFICE = tmp;
  }
  layer(ctx, cam, 0.35, () => {
    ctx.save(); ctx.globalAlpha *= a;
    const cx = cam.x - (cam.x - 960) * 0.65, k0 = Math.floor((cx - 1500 + 340) / 2600), k1 = Math.floor((cx + 1500 + 340) / 2600);
    for (let k = k0; k <= k1; k++) ctx.drawImage(OFFICE, -340 + k * 2600, -160);
    ctx.fillStyle = `rgba(6,10,20,${0.55 + 0.25 * escuro})`; ctx.fillRect(-340 + k0 * 2600, -160, (k1 - k0 + 1) * 2600, 1400);
    ctx.restore();
  });
}
// luzinhas de Natal desfocadas bem perto da câmera (camada da frente)
function luzinhas(ctx, cam, t, seed = 1, n = 9, a = 0.12) {
  const r = rng(seed), cols = ['#fca5a5', '#fde68a', '#86efac', '#93c5fd'];
  layer(ctx, cam, 1.45, () => {
    for (let i = 0; i < n; i++) {
      const x = r() * 2600 - 340 + cam.x - 960, y = r() * 1100 - 100, rad = 26 + r() * 60, ph = r() * 6.28, col = cols[i % 4];
      const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
      g.addColorStop(0, hexA(col, a * (0.55 + 0.45 * Math.sin(t * 0.8 + ph)))); g.addColorStop(1, hexA(col, 0));
      ctx.fillStyle = g; ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
  });
}

// ================================================================ o holerite do 13º (layout de recibo de pagamento de verdade)
// Folha 1000 x 1300. rows: [{ cod, desc, ref, venc, dsc, k, hl, riscado: {valor, k}, cor }]
// o: { rows, totV, totD, liq, liqK, rodape, hlRow, hlK, circ (0..1 círculo de caneta na linha hlRow), flip (0..1), verso: fn(ctx) }
const HOL = { W: 1000, H: 1300, rowY: (i) => -650 + 300 + i * 74 };
function holerite(ctx, x, y, s, o = {}) {
  const flip = o.flip || 0, sx = Math.cos(flip * Math.PI);
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s * Math.max(0.02, Math.abs(sx)), s); ctx.globalAlpha *= o.a ?? 1;
  drawDoc(ctx, 'hol' + (o.key || ''), 1000, 1300, (ctx) => holeritePapel(ctx, o, sx));
  ctx.restore();
}
function holeritePapel(ctx, o, sx) {
  const L = -500, T = -650, Wd = 1000, Hd = 1300;
  ctx.save(); papelSombra(ctx); ctx.fillStyle = P.paper; ctx.fillRect(L, T, Wd, Hd); ctx.restore();
  // textura do papel (fibras leves)
  const rp = rng(8); ctx.fillStyle = 'rgba(120,110,80,0.05)'; for (let i = 0; i < 120; i++) ctx.fillRect(L + rp() * Wd, T + rp() * Hd, 1 + rp() * 40, 1);
  if (sx < 0) { // verso: o papel visto por trás, com o desenho da frente aparecendo de leve
    ctx.save(); ctx.scale(-1, 1); ctx.globalAlpha *= 0.07; holeriteFrente(ctx, { ...o, rows: o.rows, liqK: 1 }); ctx.restore();
    if (o.verso) o.verso(ctx);
  } else holeriteFrente(ctx, o);
}
function holeriteFrente(ctx, o) {
  const L = -500, T = -650, Wd = 1000, ink = P.ink;
  ctx.strokeStyle = ink; ctx.lineWidth = 2.5; ctx.strokeRect(L + 24, T + 24, Wd - 48, 1252);
  text(ctx, 'RECIBO DE PAGAMENTO DE SALÁRIO', L + 46, T + 66, { size: 34, weight: 900, color: ink, align: 'left' });
  text(ctx, '13º SALÁRIO 2026', -L - 46, T + 66, { size: 30, weight: 900, color: P.azul, align: 'right' });
  text(ctx, 'Empresa: COMERCIAL BOA VISTA LTDA', L + 46, T + 112, { size: 22, weight: 700, color: '#374151', align: 'left' });
  text(ctx, 'CNPJ 12.345.678/0001-90', -L - 46, T + 112, { size: 20, weight: 700, color: '#374151', align: 'right' });
  text(ctx, 'Funcionária: MARIA A. SOUZA · ASSISTENTE ADMINISTRATIVA', L + 46, T + 148, { size: 22, weight: 700, color: '#374151', align: 'left' });
  text(ctx, 'Admissão 03/02/2021', -L - 46, T + 148, { size: 20, weight: 700, color: '#374151', align: 'right' });
  ctx.fillStyle = '#e5e1d3'; ctx.fillRect(L + 24, T + 180, Wd - 48, 52);
  const COL = { cod: L + 48, desc: L + 130, ref: L + 600, venc: L + 810, dsc: -L - 48 };
  for (const [lab, x, al] of [['CÓD.', COL.cod, 'left'], ['DESCRIÇÃO', COL.desc, 'left'], ['REF.', COL.ref, 'center'], ['VENCIMENTOS', COL.venc, 'right'], ['DESCONTOS', COL.dsc, 'right']]) text(ctx, lab, x, T + 207, { size: 18, weight: 900, color: ink, align: al, letter: 1 });
  ctx.strokeStyle = 'rgba(31,41,55,0.45)'; ctx.lineWidth = 1.5;
  for (const vx of [L + 110, L + 530, L + 670, L + 830]) { ctx.beginPath(); ctx.moveTo(vx, T + 180); ctx.lineTo(vx, T + 850); ctx.stroke(); }
  for (let i = 0; i < 8; i++) { const yy = HOL.rowY(i) + 37; ctx.strokeStyle = 'rgba(31,41,55,0.12)'; ctx.beginPath(); ctx.moveTo(L + 24, yy); ctx.lineTo(-L - 24, yy); ctx.stroke(); }
  ctx.strokeStyle = ink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(L + 24, T + 850); ctx.lineTo(-L - 24, T + 850); ctx.stroke();
  (o.rows || []).forEach((rw, i) => {
    const k = rw.k ?? 1; if (k <= 0) return;
    const yy = HOL.rowY(i);
    if (o.hlRow === i && o.hlK > 0) marker(ctx, L + 30, yy - 30, Wd - 60, 60, o.hlColor || '#86efac', o.hlK);
    ctx.save(); ctx.globalAlpha *= clamp(k * 2.5);
    mono(ctx, rw.cod, COL.cod, yy, 24, '#4b5563');
    text(ctx, rw.desc, COL.desc, yy, { size: 26, weight: 800, color: ink, align: 'left', maxWidth: 390 });
    text(ctx, rw.ref || '', COL.ref, yy, { size: 22, weight: 700, color: '#4b5563' });
    if (rw.venc) mono(ctx, rw.venc, COL.venc, yy, 28, ink, 'right', 800);
    if (rw.dsc) mono(ctx, rw.dsc, COL.dsc, yy, 28, rw.cor || ink, 'right', 800);
    if (rw.riscado && rw.riscado.k > 0) { // valor antigo riscado acima do novo
      ctx.save(); ctx.globalAlpha *= clamp(rw.riscado.k * 2);
      mono(ctx, rw.riscado.valor, COL.dsc, yy - 34, 22, '#b91c1c', 'right', 800);
      text(ctx, rw.riscado.rot || '', COL.dsc - 150, yy - 34, { size: 16, weight: 900, color: '#b91c1c', align: 'right' });
      if (rw.riscado.x > 0) crossOut(ctx, COL.dsc - 104, yy - 30, COL.dsc + 4, yy - 38, '#b91c1c', rw.riscado.x, 4);
      ctx.restore();
    }
    ctx.restore();
  });
  if (o.circ > 0 && o.hlRow != null) penCircle(ctx, 0, HOL.rowY(o.hlRow), 480, 46, '#dc2626', o.circ, 6);
  // totais
  text(ctx, 'TOTAL DE VENCIMENTOS', L + 560, T + 884, { size: 16, weight: 900, color: '#4b5563', align: 'right' });
  text(ctx, 'TOTAL DE DESCONTOS', -L - 48, T + 884, { size: 16, weight: 900, color: '#4b5563', align: 'right' });
  if (o.totV) mono(ctx, o.totV, L + 810, T + 924, 28, ink, 'right', 800);
  if (o.totD) mono(ctx, o.totD, -L - 48, T + 924, 28, ink, 'right', 800);
  ctx.strokeStyle = ink; ctx.lineWidth = 3; ctx.strokeRect(L + 470, T + 960, 506, 96);
  text(ctx, 'VALOR LÍQUIDO', L + 494, T + 1008, { size: 22, weight: 900, color: ink, align: 'left' });
  if (o.liq && (o.liqK ?? 1) > 0) { ctx.save(); ctx.globalAlpha *= clamp((o.liqK ?? 1) * 2); mono(ctx, o.liq, -L - 46, T + 1010, 44, '#14532d', 'right', 900); ctx.restore(); }
  // rodapé com as bases (como no recibo de verdade)
  const rod = o.rodape || [['Salário-base', '5.000,00'], ['Base INSS', '5.000,00'], ['Base FGTS', '5.000,00'], ['FGTS do mês', '400,00'], ['Base IRRF', '4.392,80'], ['Faixa IRRF', 'isento']];
  rod.forEach(([lab, v], i) => { const cx = L + 40 + i * 154; ctx.strokeStyle = 'rgba(31,41,55,0.4)'; ctx.lineWidth = 1.5; ctx.strokeRect(cx, T + 1080, 148, 70); text(ctx, lab, cx + 8, T + 1100, { size: 14, weight: 800, color: '#6b7280', align: 'left' }); mono(ctx, v, cx + 140, T + 1130, 18, ink, 'right', 800); });
  text(ctx, 'DECLARO TER RECEBIDO A IMPORTÂNCIA LÍQUIDA DISCRIMINADA NESTE RECIBO', L + 46, T + 1186, { size: 14, weight: 700, color: '#6b7280', align: 'left' });
  ctx.strokeStyle = '#6b7280'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(L + 560, T + 1240); ctx.lineTo(-L - 46, T + 1240); ctx.stroke();
  text(ctx, 'ASSINATURA DA FUNCIONÁRIA', L + 740, T + 1258, { size: 13, weight: 800, color: '#6b7280' });
}
// as linhas fixas do 13º de R$ 5.000 (cena 3 em diante)
function rows13(k = [1, 1, 1], extra = {}) {
  return [
    { cod: '001', desc: '13º SALÁRIO INTEGRAL', ref: '12/12', venc: '5.000,00', k: k[0] },
    { cod: '201', desc: 'INSS SOBRE 13º SALÁRIO', ref: 'faixas', dsc: extra.inss ?? '501,51', k: k[1] },
    { cod: '202', desc: 'IMPOSTO DE RENDA S/ 13º', ref: 'isento', dsc: extra.ir ?? '0,00', cor: '#15803d', k: k[2], riscado: extra.riscado },
  ];
}

// ================================================================ página de jornal de 1962 (jornal genérico, sem a marca do jornal de verdade)
// o: { type (0..1 manchete datilografada), date (0..1), a }
function jornalVelho(ctx, x, y, s, o = {}) {
  const Wd = 1180, Hd = 900, L = -Wd / 2, T = -Hd / 2;
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.03); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  drawDoc(ctx, 'jornal' + (o.key || ''), 1180, 900, (ctx) => {
  ctx.save(); papelSombra(ctx); const g = ctx.createLinearGradient(L, T, -L, -T); g.addColorStop(0, '#f1e6c8'); g.addColorStop(1, '#dccb9f'); ctx.fillStyle = g; ctx.fillRect(L, T, Wd, Hd); ctx.restore();
  ctx.fillStyle = 'rgba(120,90,30,0.12)'; ctx.fillRect(L, T, 30, Hd); ctx.fillRect(-L - 30, T, 30, Hd); ctx.fillRect(L, -T - 24, Wd, 24);
  // dobra do meio (jornal dobrado ao meio)
  const fold = ctx.createLinearGradient(0, -T - 40, 0, -T); ctx.fillStyle = 'rgba(0,0,0,0.06)'; ctx.fillRect(L, 0, Wd, 3);
  text(ctx, 'DIÁRIO DA MANHÃ', 0, T + 80, { size: 80, weight: 900, color: '#1c1917', letter: 4 });
  ctx.fillStyle = '#1c1917'; ctx.fillRect(L + 40, T + 132, Wd - 80, 5); ctx.fillRect(L + 40, T + 186, Wd - 80, 2);
  const dt = 'QUINTA-FEIRA, 26 DE ABRIL DE 1962', nd = Math.round(dt.length * clamp(o.date ?? 1));
  text(ctx, 'ANO XXXVII · Nº 10.951', L + 50, T + 160, { size: 20, weight: 800, color: '#57534e', align: 'left' });
  text(ctx, 'Cr$ 15,00', -L - 50, T + 160, { size: 20, weight: 800, color: '#57534e', align: 'right' });
  text(ctx, dt.slice(0, nd), 0, T + 160, { size: 26, weight: 800, color: '#44403c', letter: 2 });
  // manchete datilografada em três linhas
  const L1 = 'CONSIDERADO', L2 = 'DESASTROSO', L3 = 'PARA O PAÍS UM 13º MÊS DE SALÁRIO';
  const tot = L1.length + L2.length + L3.length, n = Math.round(tot * clamp(o.type ?? 1));
  const n1 = Math.min(n, L1.length), n2 = clamp(n - L1.length, 0, L2.length), n3 = clamp(n - L1.length - L2.length, 0, L3.length);
  const typeLine = (str, cnt, yy, size, col) => { if (cnt <= 0) return; ctx.save(); ctx.font = font(size, 900); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; const w = ctx.measureText(str).width; ctx.fillStyle = col; ctx.fillText(str.slice(0, cnt), -w / 2, yy); ctx.restore(); };
  typeLine(L1, n1, T + 262, 84, '#1c1917'); typeLine(L2, n2, T + 410, 168, '#0c0a09'); typeLine(L3, n3, T + 548, 54, '#1c1917');
  // colunas de texto (textura) e uma foto meio-tom
  const r = rng(62); ctx.fillStyle = 'rgba(28,25,23,0.42)';
  for (let c = 0; c < 2; c++) for (let i = 0; i < 9; i++) ctx.fillRect(L + 60 + c * 340, T + 620 + i * 26, i === 8 ? 140 : 300 - r() * 40, 10);
  ctx.fillStyle = '#a8a29e'; ctx.fillRect(L + 760, T + 612, 360, 236);
  for (let yy = 0; yy < 236; yy += 8) for (let xx = 0; xx < 360; xx += 8) { const d = 1.2 + 2.4 * Math.abs(Math.sin(xx * 0.02 + yy * 0.03)); ctx.fillStyle = '#44403c'; ctx.beginPath(); ctx.arc(L + 764 + xx, T + 616 + yy, d, 0, 6.283); ctx.fill(); }
  });
  ctx.restore();
}

// ================================================================ envelope de pagamento (papel kraft, com os campos impressos)
// o: { aberto (0..1 aba), notas (0..1 notas aparecendo), fatia (0..1 um maço saindo), fantasma (0..1 contorno do que a empresa paga por fora) }
function envelopePag(ctx, x, y, s, o = {}) {
  const Wd = 560, Hd = 340, L = -Wd / 2, T = -Hd / 2;
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.02); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  if (o.fantasma > 0) { // o tamanho do custo para a empresa: contorno tracejado bem maior atrás
    const f = ease.out(clamp(o.fantasma)), g2 = lerp(1, 1.51, f);
    ctx.save(); ctx.globalAlpha *= clamp(o.fantasma * 2); ctx.setLineDash([18, 12]); ctx.strokeStyle = P.inss; ctx.lineWidth = 6;
    ctx.strokeRect(L * g2, T - (Hd * g2 - Hd), Wd * g2, Hd * g2); ctx.restore();
  }
  // notas aparecendo pela boca do envelope
  if (o.notas > 0) for (let i = 0; i < 4; i++) {
    const up = ease.out(clamp(o.notas * 1.4 - i * 0.12)) * (70 - i * 8), out = i === 3 ? ease.inOut(clamp(o.fatia || 0)) : 0;
    ctx.save(); ctx.translate(-150 + i * 22 - out * 420, T - up + 40 + out * -60); ctx.rotate(-0.06 + i * 0.03 - out * 0.4); ctx.globalAlpha *= 1 - out * 0.15;
    notaCem(ctx, 0, 0, 0.62); ctx.restore();
  }
  ctx.save(); papelSombra(ctx); const g = ctx.createLinearGradient(L, T, -L, -T); g.addColorStop(0, '#d8b77d'); g.addColorStop(1, '#b8924f'); ctx.fillStyle = g; ctx.fillRect(L, T, Wd, Hd); ctx.restore();
  const rp = rng(4); ctx.fillStyle = 'rgba(80,50,10,0.10)'; for (let i = 0; i < 90; i++) ctx.fillRect(L + rp() * Wd, T + rp() * Hd, 2 + rp() * 26, 1.5);
  // aba de cima (triângulo) com cola
  const ab = o.aberto || 0, fy = lerp(1, -1, ease.inOut(clamp(ab)));
  ctx.save(); ctx.translate(0, T); ctx.scale(1, fy); ctx.fillStyle = fy > 0 ? '#c9a46a' : '#a88349'; ctx.beginPath(); ctx.moveTo(L, 0); ctx.lineTo(0, 150); ctx.lineTo(-L, 0); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(80,50,10,0.35)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
  text(ctx, 'ENVELOPE DE PAGAMENTO', 0, T + 196, { size: 30, weight: 900, color: '#5b3a12', letter: 2 });
  for (const [lab, yy] of [['NOME', 236], ['MÊS DE', 270], ['LÍQUIDO R$', 304]]) {
    text(ctx, lab, L + 40, T + yy, { size: 18, weight: 900, color: '#5b3a12', align: 'left' });
    ctx.fillStyle = 'rgba(91,58,18,0.6)'; ctx.fillRect(L + 170, T + yy + 10, Wd - 210, 2);
  }
  text(ctx, 'Maria A. Souza', L + 190, T + 230, { size: 22, weight: 700, color: '#1e3a8a', align: 'left' });
  text(ctx, '13º · dezembro de 2026', L + 190, T + 264, { size: 22, weight: 700, color: '#1e3a8a', align: 'left' });
  ctx.restore();
}
// nota de R$ 100 (azul, com a garoupa à direita e o rosto da República em marca-d'água à esquerda)
function notaCem(ctx, x, y, s, o = {}) {
  const Wd = 400, Hd = 190, L = -Wd / 2, T = -Hd / 2;
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 5;
  const g = ctx.createLinearGradient(L, 0, -L, 0); g.addColorStop(0, '#a7d4e6'); g.addColorStop(0.5, '#6fb3d1'); g.addColorStop(1, '#3f8db3');
  ctx.fillStyle = g; ctx.fillRect(L, T, Wd, Hd); ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 3; ctx.strokeRect(L + 8, T + 8, Wd - 16, Hd - 16);
  ctx.fillStyle = 'rgba(230,246,251,0.7)'; ctx.beginPath(); ctx.ellipse(L + 90, 0, 48, 60, 0, 0, 6.283); ctx.fill();
  ctx.fillStyle = 'rgba(12,74,110,0.35)'; ctx.beginPath(); ctx.ellipse(L + 90, -8, 22, 28, 0, 0, 6.283); ctx.fill();
  // garoupa (peixe) estilizada
  ctx.fillStyle = 'rgba(12,74,110,0.55)'; ctx.beginPath(); ctx.ellipse(70, 18, 70, 34, 0, 0, 6.283); ctx.fill();
  ctx.beginPath(); ctx.moveTo(130, 18); ctx.lineTo(170, -10); ctx.lineTo(170, 46); ctx.closePath(); ctx.fill();
  text(ctx, '100', -L - 50, T + 40, { size: 44, weight: 900, color: '#0c4a6e' });
  text(ctx, 'CEM REAIS', 40, T + 30, { size: 18, weight: 900, color: '#075985', letter: 3 });
  text(ctx, 'BANCO CENTRAL DO BRASIL', -10, -T - 24, { size: 13, weight: 900, color: '#0c4a6e', letter: 1 });
  ctx.restore();
}
// moeda de R$ 1 (bimetálica: miolo prateado, anel dourado)
function moeda1(ctx, x, y, r, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.globalAlpha *= o.a ?? 1;
  const tint = o.cor;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = r * 0.4; ctx.shadowOffsetY = r * 0.12;
  const g = ctx.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.1, 0, 0, r); g.addColorStop(0, '#fde68a'); g.addColorStop(1, '#b7791f');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.283); ctx.fill(); ctx.restore();
  const g2 = ctx.createRadialGradient(-r * 0.2, -r * 0.25, r * 0.05, 0, 0, r * 0.66); g2.addColorStop(0, '#f8fafc'); g2.addColorStop(1, '#9ca3af');
  ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(0, 0, r * 0.64, 0, 6.283); ctx.fill();
  text(ctx, '1', 0, r * 0.05, { size: r * 0.8, weight: 900, color: '#4b5563' });
  if (tint) { ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = hexA(tint, 0.42); ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.283); ctx.fill(); }
  ctx.restore();
}

// ================================================================ calendário de mesa (base em pé, espiral em cima, um mês por folha)
// mes: { nome, ano, dias, inicio (0 = domingo), marcas: {dia: {cor, k, risco}} }
function calendario(ctx, x, y, s, mes, o = {}) {
  const Wd = 520, Hd = 470, L = -Wd / 2, T = -Hd / 2;
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  drawDoc(ctx, 'cal' + (o.key || mes.nome), 560, 540, (ctx) => {
  // base em "A" atrás (cartão dobrado)
  ctx.fillStyle = '#1f2937'; ctx.beginPath(); ctx.moveTo(L + 20, -T + 10); ctx.lineTo(L + 60, T + 10); ctx.lineTo(-L - 60, T + 10); ctx.lineTo(-L - 20, -T + 10); ctx.closePath(); ctx.fill();
  ctx.save(); papelSombra(ctx); ctx.fillStyle = '#ffffff'; ctx.fillRect(L, T, Wd, Hd); ctx.restore();
  ctx.fillStyle = o.cor || '#b91c1c'; ctx.fillRect(L, T, Wd, 92);
  text(ctx, mes.nome, 0, T + 50, { size: 48, weight: 900, color: '#ffffff', letter: 5 });
  text(ctx, String(mes.ano), -L - 24, T + 50, { size: 24, weight: 900, color: 'rgba(255,255,255,0.8)', align: 'right' });
  for (let i = 0; i < 14; i++) { const sx2 = L + 30 + i * 35; ctx.fillStyle = '#9ca3af'; ctx.beginPath(); ctx.ellipse(sx2, T - 4, 6, 14, 0, 0, 6.283); ctx.fill(); ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.arc(sx2, T + 10, 4, 0, 6.283); ctx.fill(); }
  const cw = (Wd - 40) / 7;
  ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].forEach((d, i) => text(ctx, d, L + 20 + cw * (i + 0.5), T + 122, { size: 22, weight: 900, color: i === 0 ? '#b91c1c' : '#6b7280' }));
  for (let d = 1; d <= mes.dias; d++) {
    const idx = mes.inicio + d - 1, col = idx % 7, row = Math.floor(idx / 7);
    const cx = L + 20 + cw * (col + 0.5), cy = T + 168 + row * 54;
    const m = (mes.marcas || {})[d];
    if (m && m.fill > 0) { ctx.save(); ctx.globalAlpha *= clamp(m.fill); fillRR(ctx, cx - cw / 2 + 3, cy - 24, cw - 6, 48, 8, hexA(m.cor, 0.28)); ctx.restore(); }
    text(ctx, String(d), cx, cy, { size: 26, weight: 800, color: col === 0 ? '#b91c1c' : '#111827' });
    if (m && m.k > 0) penCircle(ctx, cx, cy, 30, 24, m.cor, m.k, 5);
    if (m && m.risco > 0) { xMark(ctx, cx, cy, 0.7, '#dc2626', m.risco); }
  }
  });
  ctx.restore();
}

// ================================================================ relógio de ponto mecânico (caixa de aço, mostrador redondo, fenda do cartão, alavanca)
function relogioPonto(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  drawDoc(ctx, 'relogio', 760, 760, (ctx) => {
  sombraChao(ctx, 0, 330, 260, 0.55);
  ctx.save(); papelSombra(ctx); const g = ctx.createLinearGradient(-210, 0, 210, 0); g.addColorStop(0, '#6b7280'); g.addColorStop(0.45, '#d1d5db'); g.addColorStop(1, '#4b5563');
  ctx.fillStyle = g; rr(ctx, -210, -300, 420, 620, 26); ctx.fill(); ctx.restore();
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 3; rr(ctx, -210, -300, 420, 620, 26); ctx.stroke();
  // mostrador
  ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.arc(0, -150, 128, 0, 6.283); ctx.fill();
  ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.arc(0, -150, 114, 0, 6.283); ctx.fill();
  for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.283; ctx.strokeStyle = '#111827'; ctx.lineWidth = i % 3 ? 3 : 7; ctx.beginPath(); ctx.moveTo(Math.sin(a) * 92, -150 - Math.cos(a) * 92); ctx.lineTo(Math.sin(a) * 106, -150 - Math.cos(a) * 106); ctx.stroke(); }
  const hr = o.hora ?? 8.5, mn = (hr % 1) * 60;
  ctx.strokeStyle = '#111827'; ctx.lineCap = 'round'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(0, -150); ctx.lineTo(Math.sin((hr / 12) * 6.283) * 60, -150 - Math.cos((hr / 12) * 6.283) * 60); ctx.stroke();
  ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, -150); ctx.lineTo(Math.sin((mn / 60) * 6.283) * 88, -150 - Math.cos((mn / 60) * 6.283) * 88); ctx.stroke();
  circle(ctx, 0, -150, 9, '#dc2626');
  text(ctx, 'PONTO', 0, -104, { size: 15, weight: 900, color: '#374151', letter: 3 });
  // janela da data
  fillRR(ctx, -110, -20, 220, 56, 8, '#0b1222'); mono(ctx, o.data || '01 DEZ  08:30', 0, 8, 26, '#fbbf24', 'center', 800);
  // fenda do cartão
  fillRR(ctx, -130, -306, 260, 18, 6, '#0b0f17'); // fenda do cartão em cima (como no relógio cartográfico)
  fillRR(ctx, -130, 70, 260, 14, 6, 'rgba(0,0,0,0.25)');
  // alavanca do lado direito (desce no aperto)
  const pr = o.aperto || 0; ctx.save(); ctx.translate(210, 120); ctx.rotate(lerp(-0.5, 0.35, pr));
  fillRR(ctx, 0, -14, 120, 28, 14, '#374151'); circle(ctx, 120, 0, 26, '#dc2626'); ctx.restore();
  // plaqueta do fabricante e os parafusos (sem botão: quem aperta é a alavanca)
  fillRR(ctx, -120, 200, 240, 44, 6, '#9ca3af'); text(ctx, 'RELÓGIO DE PONTO', 0, 223, { size: 18, weight: 900, color: '#1f2937', letter: 2 });
  for (const [px, py] of [[-180, -270], [180, -270], [-180, 290], [180, 290]]) { circle(ctx, px, py, 8, '#4b5563'); circle(ctx, px, py, 4, '#9ca3af'); }
  });
  ctx.restore();
}
// cartão de ponto (cartolina com as colunas ENTRADA / SAÍDA)
function cartaoPonto(ctx, x, y, s, o = {}) {
  const Wd = 240, Hd = 420, L = -Wd / 2, T = -Hd / 2;
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  drawDoc(ctx, 'cartao' + (o.key || ''), 240, 420, (ctx) => {
  ctx.save(); papelSombra(ctx); ctx.fillStyle = '#fef9e7'; ctx.fillRect(L, T, Wd, Hd); ctx.restore();
  text(ctx, 'CARTÃO DE PONTO', 0, T + 28, { size: 18, weight: 900, color: '#1f2937' });
  text(ctx, 'DEZ/2026', 0, T + 54, { size: 16, weight: 800, color: '#6b7280' });
  ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 1.5;
  for (let i = 0; i < 11; i++) { ctx.beginPath(); ctx.moveTo(L + 10, T + 80 + i * 30); ctx.lineTo(-L - 10, T + 80 + i * 30); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(L + 50, T + 70); ctx.lineTo(L + 50, T + 400); ctx.moveTo(0 + 20, T + 70); ctx.lineTo(20, T + 400); ctx.stroke();
  if (o.marca > 0) { ctx.save(); ctx.globalAlpha *= clamp(o.marca * 2); mono(ctx, o.texto || 'INSCRITO', 0, T + 96, 24, '#7c3aed', 'center', 900); ctx.restore(); }
  });
  ctx.restore();
}

// ================================================================ outros objetos do vídeo
// carimbo datador de escritório (cabo, armação de metal e as fitas de borracha com dia, mês e ano)
function datador(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  drawDoc(ctx, 'datador', 300, 520, (ctx) => {
  ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.ellipse(0, -230, 70, 46, 0, 0, 6.283); ctx.fill(); // cabo
  fillRR(ctx, -26, -200, 52, 90, 10, '#1f2937');
  ctx.save(); const g = ctx.createLinearGradient(-130, 0, 130, 0); g.addColorStop(0, '#6b7280'); g.addColorStop(0.5, '#e5e7eb'); g.addColorStop(1, '#6b7280'); ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(-120, -110); ctx.lineTo(120, -110); ctx.lineTo(130, 60); ctx.lineTo(-130, 60); ctx.closePath(); ctx.fill(); ctx.restore();
  fillRR(ctx, -100, -60, 200, 80, 8, '#1f2937');
  // as fitas giram: o ano passa de 1962 para 2026
  const v = o.ano || '1962'; mono(ctx, v, 0, -20, 50, '#f8fafc', 'center', 900);
  ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(-100, -60, 200, 14);
  fillRR(ctx, -138, 60, 276, 30, 6, '#4b5563');
  });
  ctx.restore();
}
// a escada do INSS: quatro degraus com a alíquota de cada faixa
function escadaINSS(ctx, x, y, s, t, o = {}) {
  const D = [['7,5%', 'até R$ 1.621', '#fde68a'], ['9%', 'até R$ 2.902,84', '#fcd34d'], ['12%', 'até R$ 4.354,27', '#fbbf24'], ['14%', 'até R$ 8.475,55', '#f59e0b']];
  const pagos = ['121,58', '115,37', '174,17', '90,40'];
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  D.forEach(([al, faixa, cor], i) => {
    const k = ease.out(clamp(o.deg?.[i] ?? 1)); if (k <= 0) return;
    const bx = -380 + i * 190, h = 90 + i * 90, top = 200 - h;
    ctx.save(); ctx.globalAlpha *= clamp(k * 2);
    ctx.save(); papelSombra(ctx); fillRR(ctx, bx, top + (1 - k) * 60, 180, h, 10, cor); ctx.restore();
    fillRR(ctx, bx, top + (1 - k) * 60, 180, 14, 6, 'rgba(255,255,255,0.35)');
    text(ctx, al, bx + 90, top + 52 + (1 - k) * 60, { size: 46, weight: 900, color: '#451a03' });
    text(ctx, faixa, bx + 90, 236, { size: 20, weight: 800, color: '#e2e8f0', alpha: o.faixaA ?? 1 });
    const kp = clamp(o.pago?.[i] ?? 0);
    if (kp > 0) { ctx.save(); ctx.globalAlpha *= kp; chip(ctx, bx + 90, top - 40, 'R$ ' + pagos[i], '#fde68a', kp, { size: 22 }); ctx.restore(); }
    ctx.restore();
  });
  // a parte mais alta (só o pedaço acima de 4.354,27 paga 14%)
  if (o.alto > 0) { ctx.save(); ctx.globalAlpha *= clamp(o.alto); ctx.setLineDash([10, 8]); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4; ctx.strokeRect(190 + 6, -160 + 6, 168, 60); ctx.restore(); }
  // o salário subindo a escada (uma etiqueta com R$ 5.000)
  if (o.sobe != null && o.sobe >= 0) {
    const p = clamp(o.sobe) * 3.999, i = Math.floor(p), f = p - i;
    const bx = -380 + i * 190 + 90 + f * 190 * (i < 3 ? 1 : 0), by = 200 - (90 + i * 90) - 120 - Math.sin(f * Math.PI) * 30 * (i < 3 ? 1 : 0);
    chip(ctx, Math.min(bx, 380 - 90 + 90), by, 'R$ 5.000', '#4ade80', 1, { size: 26 });
  }
  ctx.restore();
}
// régua de salários (régua de metal com marcações de mil em mil)
function reguaSal(ctx, x, y, s, t, o = {}) {
  const X0 = -800, X1 = 800, max = 10000, px = (v) => lerp(X0, X1, v / max);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.save(); papelSombra(ctx); const g = ctx.createLinearGradient(0, -60, 0, 60); g.addColorStop(0, '#e5e7eb'); g.addColorStop(0.5, '#cbd5e1'); g.addColorStop(1, '#94a3b8'); ctx.fillStyle = g; rr(ctx, X0 - 40, -60, X1 - X0 + 80, 120, 10); ctx.fill(); ctx.restore();
  for (let v = 0; v <= max; v += 250) { const xx = px(v), big = v % 1000 === 0; ctx.fillStyle = '#1f2937'; ctx.fillRect(xx - 1.5, -60, 3, big ? 40 : v % 500 === 0 ? 26 : 16); if (big) text(ctx, String(v / 1000), xx, 0, { size: 24, weight: 900, color: '#1f2937' }); }
  text(ctx, 'mil reais por mês', X1 + 10, 34, { size: 18, weight: 800, color: '#374151', align: 'right' });
  // faixas pintadas embaixo da régua
  for (const f of o.faixas || []) {
    const k = ease.out(clamp(f.k)); if (k <= 0) continue;
    const a = px(f.de), b = px(f.ate), w = (b - a) * k;
    if (f.grad) { const gg = ctx.createLinearGradient(a, 0, b, 0); gg.addColorStop(0, hexA(f.cor, f.a0 ?? 1)); gg.addColorStop(1, hexA(f.cor2 || f.cor, f.a1 ?? 1)); ctx.fillStyle = gg; } else ctx.fillStyle = f.cor;
    ctx.save(); ctx.shadowColor = hexA(f.glow || '#000000', f.glow ? 0.7 : 0); ctx.shadowBlur = f.glow ? 22 : 0; fillRR(ctx, a, 80, w, 46, 10, ctx.fillStyle); ctx.restore();
    if (f.rot && k > 0.6 && (f.rotK ?? 1) > 0) text(ctx, f.rot, a + (b - a) / 2, 103, { size: 24, weight: 900, color: f.corTxt || '#0b1222', alpha: clamp((k - 0.6) * 3) * (f.rotK ?? 1) });
  }
  for (const pin of o.pinos || []) {
    const k = clamp(pin.k); if (k <= 0) continue;
    const xx = px(pin.v); ctx.save(); ctx.globalAlpha *= k;
    ctx.fillStyle = pin.cor; ctx.beginPath(); ctx.moveTo(xx, -66); ctx.lineTo(xx - 14, -92); ctx.lineTo(xx + 14, -92); ctx.closePath(); ctx.fill();
    const hh = pin.h || 140, dy = (1 - ease.out(k)) * 40;
    ctx.fillRect(xx - 2, -90 - hh + dy, 4, hh);
    chip(ctx, xx + (pin.dx || 0), -122 - hh + dy, pin.rot, pin.cor, k, { size: pin.size || 28 });
    ctx.restore();
  }
  ctx.restore();
  return px;
}
// cofrinho de porquinho (corpo, orelhas, focinho com as narinas, patas e a fenda em cima)
function cofrinho(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  sombraChao(ctx, 0, 150, 220, 0.5);
  const cor = '#f9a8d4', cor2 = '#db2777';
  for (const lx of [-110, -50, 60, 120]) fillRR(ctx, lx - 22, 90, 44, 60, 12, cor2);
  ctx.save(); papelSombra(ctx); const g = ctx.createRadialGradient(-60, -60, 20, 0, 0, 230); g.addColorStop(0, '#fce7f3'); g.addColorStop(1, cor);
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, 210, 150, 0, 0, 6.283); ctx.fill(); ctx.restore();
  // orelhas de porco: pequenas, largas na base e com a ponta dobrada para a frente (não podem parecer chifres)
  for (const [ox, oy, sc2, rot] of [[-100, -118, 1.5, -0.25], [-30, -138, 1.35, -0.1]]) {
    ctx.save(); ctx.translate(ox, oy); ctx.rotate(rot); ctx.scale(sc2, sc2);
    ctx.fillStyle = '#f9a8d4'; ctx.beginPath(); ctx.moveTo(-30, 10); ctx.quadraticCurveTo(-34, -28, -22, -50); ctx.quadraticCurveTo(12, -34, 30, 10); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#db2777'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#f472b6'; ctx.beginPath(); ctx.moveTo(-16, 6); ctx.quadraticCurveTo(-20, -18, -16, -32); ctx.quadraticCurveTo(4, -20, 16, 6); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = '#f472b6'; ctx.beginPath(); ctx.ellipse(-205, 10, 44, 54, 0, 0, 6.283); ctx.fill(); // focinho
  ctx.fillStyle = cor2; ctx.beginPath(); ctx.ellipse(-212, -6, 9, 14, 0, 0, 6.283); ctx.fill(); ctx.beginPath(); ctx.ellipse(-212, 28, 9, 14, 0, 0, 6.283); ctx.fill();
  circle(ctx, -140, -40, 12, '#1f2937'); circle(ctx, -144, -44, 4, '#ffffff');
  ctx.strokeStyle = cor2; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(206, -10); ctx.bezierCurveTo(250, -40, 250, 20, 226, 10); ctx.stroke(); // rabinho
  fillRR(ctx, -10, -152, 110, 16, 8, '#831843'); // fenda
  ctx.restore();
}
// cofre pequeno do FGTS (porta com volante e o nome)
function cofreFGTS(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  sombraChao(ctx, 0, 150, 190, 0.5);
  ctx.save(); papelSombra(ctx); fillRR(ctx, -150, -140, 300, 280, 22, '#334155'); ctx.restore();
  fillRR(ctx, -126, -116, 252, 232, 14, '#475569'); strokeRR(ctx, -126, -116, 252, 232, 14, '#1e293b', 4);
  circle(ctx, 30, 0, 54, '#94a3b8'); circle(ctx, 30, 0, 38, '#cbd5e1'); circle(ctx, 30, 0, 10, '#334155');
  ctx.strokeStyle = '#334155'; ctx.lineWidth = 7; for (let i = 0; i < 3; i++) { const a = (o.giro || 0) + (i / 3) * 6.283; ctx.beginPath(); ctx.moveTo(30, 0); ctx.lineTo(30 + Math.cos(a) * 52, Math.sin(a) * 52); ctx.stroke(); }
  fillRR(ctx, -110, -40, 30, 80, 6, '#1e293b');
  fillRR(ctx, -106, -168, 212, 44, 10, P.fgts); text(ctx, 'FGTS', 0, -145, { size: 32, weight: 900, color: '#0b1222', letter: 3 });
  ctx.restore();
}
// guichê do INSS: o prédio de colunas (ícone do canal) com a placa
function predioINSS(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.globalAlpha *= o.a ?? 1;
  sombraChao(ctx, 0, 120 * s, 180 * s, 0.5);
  iconBank(ctx, 0, 0, 220 * s, '#e5e7eb');
  fillRR(ctx, -110 * s, -160 * s, 220 * s, 50 * s, 10 * s, P.inss); text(ctx, o.rot || 'INSS', 0, -135 * s, { size: 34 * s, weight: 900, color: '#0b1222', letter: 3 });
  ctx.restore();
}
// fatura do cartão de crédito (papel com logotipo do banco, tabela e a linha do rotativo)
function fatura(ctx, x, y, s, o = {}) {
  const Wd = 620, Hd = 780, L = -Wd / 2, T = -Hd / 2;
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? 0.03); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  drawDoc(ctx, 'fatura', 620, 780, (ctx) => {
  ctx.save(); papelSombra(ctx); ctx.fillStyle = '#ffffff'; ctx.fillRect(L, T, Wd, Hd); ctx.restore();
  fillRR(ctx, L + 30, T + 30, 70, 70, 14, '#7c3aed'); text(ctx, 'B', L + 65, T + 66, { size: 46, weight: 900, color: '#ffffff' });
  text(ctx, 'FATURA DO CARTÃO', L + 120, T + 54, { size: 32, weight: 900, color: '#1f2937', align: 'left' });
  text(ctx, 'Vencimento 10/12/2026', L + 120, T + 88, { size: 20, weight: 700, color: '#6b7280', align: 'left' });
  ctx.fillStyle = '#f3f4f6'; ctx.fillRect(L + 30, T + 124, Wd - 60, 90);
  text(ctx, 'TOTAL DA FATURA', L + 50, T + 150, { size: 18, weight: 900, color: '#6b7280', align: 'left' });
  mono(ctx, 'R$ 3.840,00', L + 50, T + 188, 34, '#111827', 'left', 900);
  text(ctx, 'PAGAMENTO MÍNIMO', -L - 50, T + 150, { size: 18, weight: 900, color: '#6b7280', align: 'right' });
  mono(ctx, 'R$ 576,00', -L - 50, T + 188, 30, '#111827', 'right', 900);
  const linhas = [['MERCADO CENTRAL', '412,30'], ['FARMÁCIA SAÚDE', '89,90'], ['POSTO AVENIDA', '250,00'], ['LOJA DE CALÇADOS 2/5', '119,80'], ['SALDO ANTERIOR', '2.540,00']];
  linhas.forEach(([d, v], i) => { const yy = T + 260 + i * 52; text(ctx, d, L + 50, yy, { size: 22, weight: 700, color: '#374151', align: 'left' }); mono(ctx, v, -L - 50, yy, 24, '#374151', 'right', 800); ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(L + 40, yy + 24, Wd - 80, 2); });
  const yj = T + 540;
  marker(ctx, L + 34, yj - 30, Wd - 68, 60, '#fca5a5', o.hl || 0);
  text(ctx, 'JUROS DO ROTATIVO', L + 50, yj, { size: 26, weight: 900, color: '#991b1b', align: 'left' });
  mono(ctx, o.juros || '—', -L - 50, yj, 28, '#991b1b', 'right', 900);
  text(ctx, 'CET do rotativo: 451,7% ao ano', L + 50, yj + 50, { size: 20, weight: 800, color: '#991b1b', align: 'left', alpha: clamp(o.cet ?? 1) });
  const rb = rng(31); let bx = L + 50; ctx.fillStyle = '#111827'; while (bx < -L - 50) { const bw = 1 + Math.floor(rb() * 3.5); ctx.fillRect(bx, -T - 110, bw, 60); bx += bw + 1 + Math.floor(rb() * 2); }
  mono(ctx, '34191.79001 01043.510047 91020.150008 1 12340000384000', 0, -T - 30, 15, '#374151', 'center', 700);
  });
  ctx.restore();
}
// cartão de crédito (chip, bandeira com dois círculos, números em relevo)
function cartaoCredito(ctx, x, y, s, rot = -0.12) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.save(); papelSombra(ctx); const g = ctx.createLinearGradient(-200, -125, 200, 125); g.addColorStop(0, '#4c1d95'); g.addColorStop(1, '#7c3aed'); ctx.fillStyle = g; rr(ctx, -200, -125, 400, 250, 22); ctx.fill(); ctx.restore();
  fillRR(ctx, -160, -60, 70, 54, 8, '#fbbf24'); ctx.strokeStyle = 'rgba(120,53,15,0.6)'; ctx.lineWidth = 2; ctx.strokeRect(-150, -48, 50, 30);
  mono(ctx, '5412  ****  ****  0926', -165, 44, 24, '#ede9fe', 'left', 800);
  ctx.globalAlpha *= 0.9; circle(ctx, 120, 78, 26, '#ef4444'); circle(ctx, 152, 78, 26, '#f59e0b');
  ctx.restore();
}
// celular com o aplicativo do FGTS (extrato com o depósito do 13º)
function celularFGTS(ctx, x, y, s, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? 0.04); ctx.scale(s, s);
  drawDoc(ctx, 'cel', 360, 700, (ctx) => {
  ctx.save(); papelSombra(ctx); fillRR(ctx, -170, -340, 340, 680, 44, '#0f172a'); ctx.restore();
  fillRR(ctx, -156, -326, 312, 652, 34, '#f8fafc');
  fillRR(ctx, -40, -316, 80, 18, 9, '#0f172a');
  ctx.save(); rr(ctx, -156, -326, 312, 652, 34); ctx.clip();
  ctx.fillStyle = '#1d4ed8'; ctx.fillRect(-156, -326, 312, 150);
  text(ctx, 'FGTS', -130, -240, { size: 44, weight: 900, color: '#ffffff', align: 'left', letter: 2 });
  text(ctx, 'Extrato · conta ativa', -130, -200, { size: 18, weight: 700, color: '#dbeafe', align: 'left' });
  const itens = [['NOV 2026', 'Depósito mensal', '400,00'], ['DEZ 2026', 'Depósito 13º salário', '400,00'], ['DEZ 2026', 'Depósito mensal', '400,00']];
  itens.forEach(([d, l, v], i) => {
    const yy = -130 + i * 110, k = i === 1 ? clamp(o.dep ?? 1) : 1;
    ctx.save(); ctx.globalAlpha *= k;
    if (i === 1) fillRR(ctx, -146, yy - 40, 292, 96, 14, hexA('#38bdf8', 0.22 + 0.15 * (o.brilho || 0)));
    text(ctx, d, -130, yy - 22, { size: 16, weight: 800, color: '#64748b', align: 'left' });
    text(ctx, l, -130, yy + 4, { size: 22, weight: 900, color: '#0f172a', align: 'left' });
    mono(ctx, '+ R$ ' + v, -130, yy + 34, 22, '#15803d', 'left', 900);
    ctx.restore();
  });
  ctx.restore();
  });
  ctx.restore();
}
// carteira de trabalho (capa azul, brasão dourado, letreiro em dourado, folhas aparecendo na lateral)
function carteiraTrab(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.06); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  drawDoc(ctx, 'ctps', 260, 340, (ctx) => {
  ctx.fillStyle = '#e7e2d3'; ctx.fillRect(-118, -158, 244, 324); // folhas
  ctx.save(); papelSombra(ctx); const g = ctx.createLinearGradient(-120, -160, 120, 160); g.addColorStop(0, '#1e3a8a'); g.addColorStop(1, '#172554'); ctx.fillStyle = g; rr(ctx, -125, -165, 240, 320, 12); ctx.fill(); ctx.restore();
  ctx.strokeStyle = 'rgba(253,230,138,0.55)'; ctx.lineWidth = 2; rr(ctx, -110, -150, 210, 290, 8); ctx.stroke();
  ctx.strokeStyle = '#fde68a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(-5, -70, 38, 0, 6.283); ctx.stroke();
  for (let i = 0; i < 5; i++) { const a = -1.57 + (i / 5) * 6.283; ctx.fillStyle = '#fde68a'; ctx.beginPath(); ctx.arc(-5 + Math.cos(a) * 20, -70 + Math.sin(a) * 20, 5, 0, 6.283); ctx.fill(); }
  text(ctx, 'CARTEIRA DE', -5, 10, { size: 22, weight: 900, color: '#fde68a', letter: 1 });
  text(ctx, 'TRABALHO', -5, 40, { size: 30, weight: 900, color: '#fde68a', letter: 2 });
  text(ctx, 'E PREVIDÊNCIA SOCIAL', -5, 72, { size: 15, weight: 900, color: '#fde68a', letter: 1 });
  });
  ctx.restore();
}
// crachá de servidor (cordão, presilha, foto, nome)
function cracha(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? 0.05); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  drawDoc(ctx, 'cracha', 260, 560, (ctx) => {
  ctx.strokeStyle = '#1d4ed8'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(-60, -260); ctx.lineTo(0, -170); ctx.lineTo(60, -260); ctx.stroke();
  fillRR(ctx, -22, -182, 44, 36, 6, '#9ca3af');
  ctx.save(); papelSombra(ctx); fillRR(ctx, -120, -150, 240, 320, 18, '#ffffff'); ctx.restore();
  fillRR(ctx, -120, -150, 240, 70, 18, '#166534'); ctx.fillStyle = '#166534'; ctx.fillRect(-120, -100, 240, 20);
  text(ctx, 'SERVIDOR PÚBLICO', 0, -112, { size: 18, weight: 900, color: '#ffffff', letter: 1 });
  fillRR(ctx, -50, -64, 100, 116, 10, '#cbd5e1'); circle(ctx, 0, -26, 26, '#64748b'); ctx.fillStyle = '#64748b'; ctx.beginPath(); ctx.ellipse(0, 40, 44, 30, 0, Math.PI, 0); ctx.fill();
  text(ctx, 'JOÃO P. LIMA', 0, 84, { size: 22, weight: 900, color: '#111827' });
  text(ctx, 'Matrícula 0452-1', 0, 116, { size: 16, weight: 700, color: '#6b7280' });
  });
  ctx.restore();
}
// cartão do aposentado (cartão de benefício: cartão de banco com a faixa "BENEFÍCIO INSS")
function cartaoINSS(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.08); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  drawDoc(ctx, 'cinss', 420, 270, (ctx) => {
  ctx.save(); papelSombra(ctx); const g = ctx.createLinearGradient(-200, -125, 200, 125); g.addColorStop(0, '#0f766e'); g.addColorStop(1, '#134e4a'); ctx.fillStyle = g; rr(ctx, -200, -125, 400, 250, 22); ctx.fill(); ctx.restore();
  fillRR(ctx, -160, -70, 70, 54, 8, '#fbbf24');
  fillRR(ctx, -200, 6, 400, 40, 0, '#f59e0b'); text(ctx, 'CARTÃO BENEFÍCIO INSS', 0, 27, { size: 22, weight: 900, color: '#0b1222', letter: 2 });
  text(ctx, 'APOSENTADORIA · PENSÃO', -170, 86, { size: 16, weight: 900, color: '#ccfbf1', align: 'left' });
  });
  ctx.restore();
}
// maleta de trabalhador por conta própria (alça, fecho, adesivo "MEI · CNPJ")
function maleta(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? 0.03); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  sombraChao(ctx, 0, 140, 220, 0.5);
  ctx.strokeStyle = '#3f2a16'; ctx.lineWidth = 18; ctx.beginPath(); ctx.moveTo(-60, -110); ctx.lineTo(-60, -150); ctx.quadraticCurveTo(0, -180, 60, -150); ctx.lineTo(60, -110); ctx.stroke();
  ctx.save(); papelSombra(ctx); const g = ctx.createLinearGradient(0, -110, 0, 140); g.addColorStop(0, '#92400e'); g.addColorStop(1, '#5c2a0b'); ctx.fillStyle = g; rr(ctx, -210, -110, 420, 250, 22); ctx.fill(); ctx.restore();
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(-210, -20, 420, 8);
  fillRR(ctx, -40, -34, 80, 36, 6, '#fbbf24');
  fillRR(ctx, 60, 30, 130, 70, 8, '#f8fafc'); text(ctx, 'MEI', 125, 52, { size: 22, weight: 900, color: '#1f2937' }); text(ctx, 'CNPJ', 125, 80, { size: 18, weight: 900, color: '#6b7280' });
  ctx.restore();
}
// pessoa em pictograma (cabeça e tronco)
function pessoa(ctx, x, y, s, cor, a = 1) {
  if (a <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= a; ctx.fillStyle = cor;
  ctx.beginPath(); ctx.arc(0, -46, 22, 0, 6.283); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-34, 50); ctx.lineTo(-34, 4); ctx.quadraticCurveTo(-34, -18, -12, -18); ctx.lineTo(12, -18); ctx.quadraticCurveTo(34, -18, 34, 4); ctx.lineTo(34, 50); ctx.closePath(); ctx.fill();
  ctx.restore();
}
// casa (telhado, porta, janela) com etiqueta de conta pendurada
function casa(ctx, x, y, s, cor, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  ctx.fillStyle = cor; ctx.beginPath(); ctx.moveTo(-60, -10); ctx.lineTo(0, -64); ctx.lineTo(60, -10); ctx.closePath(); ctx.fill();
  ctx.fillRect(-46, -12, 92, 70); ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(-12, 18, 24, 40); ctx.fillRect(18, 4, 18, 18);
  if (o.divida > 0) { ctx.save(); ctx.globalAlpha *= clamp(o.divida * 2); ctx.strokeStyle = '#fca5a5'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(40, -20); ctx.lineTo(62, 6); ctx.stroke(); fillRR(ctx, 46, 4, 40, 50, 4, '#fee2e2'); ctx.fillStyle = '#dc2626'; ctx.fillRect(52, 16, 28, 4); ctx.fillRect(52, 26, 20, 4); ctx.restore(); }
  if (o.atraso > 0) { const k = clamp(o.atraso); ctx.save(); ctx.globalAlpha *= clamp(k * 2); ctx.translate(0, 84); ctx.scale(lerp(1.4, 1, ease.out(k)), lerp(1.4, 1, ease.out(k))); fillRR(ctx, -66, -18, 132, 36, 8, '#dc2626'); text(ctx, 'ATRASADA', 0, 1, { size: 20, weight: 900, color: '#ffffff', letter: 1 }); ctx.restore(); }
  ctx.restore();
}
// chave de carro (cabeça preta com botões, argola e a lâmina)
function chaveCarro(ctx, x, y, s, rot = -0.4) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.strokeStyle = '#d1d5db'; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(-170, 0, 40, 0, 6.283); ctx.stroke();
  ctx.save(); papelSombra(ctx); fillRR(ctx, -130, -60, 160, 120, 40, '#111827'); ctx.restore();
  circle(ctx, -70, -18, 14, '#374151'); circle(ctx, -70, 22, 14, '#374151'); circle(ctx, -24, 2, 14, '#7f1d1d');
  const g = ctx.createLinearGradient(30, -20, 30, 20); g.addColorStop(0, '#e5e7eb'); g.addColorStop(1, '#9ca3af'); ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(30, -22); ctx.lineTo(230, -22); ctx.lineTo(250, 0); ctx.lineTo(230, 22); ctx.lineTo(30, 22); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#6b7280'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(50, 0); for (let i = 0; i < 8; i++) ctx.lineTo(70 + i * 22, i % 2 ? -8 : 8); ctx.stroke();
  ctx.restore();
}
// boleto do IPVA (guia com a faixa de quem fica com o dinheiro)
function boletoIPVA(ctx, x, y, s, o = {}) {
  const Wd = 900, Hd = 420, L = -Wd / 2, T = -Hd / 2;
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.02); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  drawDoc(ctx, 'boleto', 900, 420, (ctx) => {
  ctx.save(); papelSombra(ctx); ctx.fillStyle = '#ffffff'; ctx.fillRect(L, T, Wd, Hd); ctx.restore();
  ctx.strokeStyle = '#1f2937'; ctx.lineWidth = 2; ctx.strokeRect(L + 20, T + 20, Wd - 40, Hd - 40);
  text(ctx, 'IPVA 2027 · GUIA DE PAGAMENTO', L + 44, T + 60, { size: 30, weight: 900, color: '#1f2937', align: 'left' });
  text(ctx, 'Placa ABC-1D23 · Renavam 01234567890', L + 44, T + 100, { size: 20, weight: 700, color: '#6b7280', align: 'left' });
  text(ctx, 'VALOR', -L - 44, T + 60, { size: 18, weight: 900, color: '#6b7280', align: 'right' }); mono(ctx, 'R$ 2.400,00', -L - 44, T + 96, 32, '#111827', 'right', 900);
  const k = ease.out(clamp(o.metade || 0)), bx = L + 44, bw = Wd - 88;
  fillRR(ctx, bx, T + 150, bw, 60, 10, '#e5e7eb');
  if (k > 0) { fillRR(ctx, bx, T + 150, bw / 2 * k, 60, 10, '#a855f7'); if (k > 0.8) { text(ctx, 'prefeitura', bx + bw / 4, T + 181, { size: 26, weight: 900, color: '#ffffff' }); text(ctx, 'estado', bx + bw * 0.75, T + 181, { size: 26, weight: 900, color: '#374151' }); } }
  const rb = rng(27); let xx = L + 44; ctx.fillStyle = '#111827'; while (xx < -L - 44) { const bw2 = 1 + Math.floor(rb() * 3.5); ctx.fillRect(xx, T + 250, bw2, 90); xx += bw2 + 1 + Math.floor(rb() * 2); }
  mono(ctx, '85810000024 0 00002710270 1 27012026000 3 00000001234 5', 0, T + 368, 18, '#374151', 'center', 700);
  });
  ctx.restore();
}

// ================================================================ Cena 01: gancho (o holerite com o IR zerado, a manchete de 1962, o dinheiro de hoje)
function scene01(K) {
  const tSemIR = K('sem imposto de renda'), t5mil = K('até cinco mil reais por mês'), tPapel = K('E ele quase ficou só no papel'), tAbril = K('Em abril de 1962'), tCapa = K('a capa de um dos maiores jornais');
  const tConsid = K('considerado desastroso'), tMes = K('mês de salário'), tMenos = K('Menos de três meses depois'), tLei = K('virou lei');
  const tNeste = K('Neste ano'), tDieese = K('pelas contas do Dieese'), t399 = K('trezentos e noventa e nove bilhões'), tCem = K('quase cem milhões de pessoas');
  const tSo = K('Só que esse dinheiro não chega inteiro'), tParte = K('Uma parte fica no caminho'), tOutra = K('e outra parte você nem sabe que existe');
  const tQuanto = K('Quanto dele é seu de verdade'), tHoje = K('Hoje a gente abre o seu décimo terceiro'), tCada = K('quem fica com cada real');
  const cam = [
    { t: 0, x: 960, y: 330, z: 1.75, dz: 0.003 }, { t: t5mil, x: 960, y: 470, z: 1.04, d: 2.2, dx: 3 },
    { t: tPapel + 1.6, x: 2400, y: 470, z: 1.0, d: 1.6 }, { t: tCapa, x: 2380, y: 420, z: 1.1, d: 3.0 }, { t: tConsid, x: 2400, y: 430, z: 1.2, d: 2.2 }, { t: tMenos, x: 2460, y: 480, z: 1.04, d: 1.4 },
    { t: tNeste - 0.4, x: 3800, y: 480, z: 1.0, d: 1.6, dx: 3 }, { t: tCem, x: 3860, y: 500, z: 1.05, d: 1.6 },
    { t: tSo - 0.4, x: 5200, y: 480, z: 1.0, d: 1.6 }, { t: tQuanto, x: 5200, y: 450, z: 1.08, d: 1.6 }, { t: tHoje, x: 5200, y: 480, z: 1.03, d: 2.2, dz: 0.004 },
  ];
  const dType = Math.max(2.6, tMes + 1.2 - tConsid);
  const sfx = [[0.05, 'paper', 0.4, { dur: 0.4 }], [tSemIR + 0.1, 'tick', 0.4], [t5mil, 'pop', 0.35], [tPapel, 'whoosh', 0.3],
    [tAbril, 'typewriter', 0.45, { n: 10, step: 0.08 }], [tConsid, 'typewriter', 0.5, { n: 24, step: dType / 26, bell: true }], [tLei, 'stamp', 0.7],
    [tNeste - 0.3, 'whoosh', 0.3], [tNeste + 0.2, 'flip', 0.5, { dur: 0.5 }], [tNeste + 0.85, 'stamp', 0.55], [t399, 'cash', 0.35], [tCem, 'pop', 0.3],
    [tSo - 0.3, 'whoosh', 0.3], [tSo + 0.2, 'paper', 0.4], [tParte, 'notas', 0.5], [tOutra, 'riser', 0.25, { dur: 1 }], [tQuanto, 'pop', 0.35], [tHoje, 'paper', 0.45, { dur: 0.5 }], [tCada, 'coin', 0.45]];
  return {
    accent: P.voce, cam, sfx, impacts: [tLei], trans: 'cut',
    draw(ctx, t, cam2) {
      escritorioFundo(ctx, cam2, 0.95);
      zone(ctx, cam2, 900, 1000, () => {
        if (t > tAbril + 1) return;
        sombraChao(ctx, 960, 820, 360);
        holerite(ctx, 960, 440, 0.56, { a: 1 - 0.7 * appear(t, tPapel + 0.3, 0.8), rows: rows13([1, 1, 1]), totV: '5.000,00', totD: '501,51', liq: '4.498,49', hlRow: 2, hlK: prog(t, tSemIR, 0.7), hlColor: '#86efac', rot: -0.015 });
        chip(ctx, 960, 470, 'quase ficou só no papel', '#e2e8f0', vis(t, tPapel + 0.3, tPapel + 2.6, 0.4, 0.4), { size: 34 });
        chip(ctx, 1560, 230, 'para quem ganha até R$ 5 mil por mês', P.voce, vis(t, t5mil + 1.2, tPapel), { size: 28 });
      });
      zone(ctx, cam2, 2300, 2500, () => {
        if (t < tPapel - 0.8 || t > tNeste + 0.6) return;
        const k = vis(t, tPapel - 0.3, tNeste, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        sombraChao(ctx, 2400, 840, 520);
        jornalVelho(ctx, 2400, 470, 0.78, { date: prog(t, tAbril, 1.0), type: prog(t, tConsid, dType) });
        // cursor da máquina de escrever piscando onde a manchete vai entrar
        if (t > tCapa && t < tConsid && Math.floor(t * 2.5) % 2 === 0) fillRR(ctx, 2400 - 0.78 * 300, 470 + 0.78 * (-450 + 228), 0.78 * 44, 0.78 * 70, 3, '#1c1917', 0.85);
        chip(ctx, 2400, 110, 'abril de 1962 · capa de um grande jornal', P.hist, vis(t, tCapa, tLei), { size: 26 });
        rectStamp(ctx, 2250, 690, 500, 170, 'VIROU LEI', '#dc2626', appear(t, tLei, 0.35), -0.08, 68, 'LEI 4.090 · 13/7/1962');
        shockRing(ctx, t, tLei, 2250, 690, '#fca5a5', 60, 320);
        ctx.restore();
      });
      zone(ctx, cam2, 3700, 3950, () => {
        if (t < tNeste - 0.8 || t > tSo + 0.6) return;
        const k = vis(t, tNeste - 0.3, tSo, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        // o datador gira as fitas de 1962 para 2026 e carimba o ano numa folha
        const roll = prog(t, tNeste + 0.2, 0.5), press = Math.sin(Math.PI * prog(t, tNeste + 0.7, 0.35));
        ctx.save(); papelSombra(ctx); ctx.fillStyle = '#fbfaf5'; ctx.fillRect(3170, 640, 380, 200); ctx.restore();
        if (t > tNeste + 0.85) mono(ctx, '2026', 3360, 740, 76, '#1d4ed8', 'center', 900);
        datador(ctx, 3360, 470 + press * 120, 0.85, { ano: roll < 0.5 ? '1962' : '2026', rot: 0.02 });
        bigNum(ctx, 'R$ 399 bilhões', 4050, 300, appear(t, t399, 0.6), { size: 104, color: P.voce });
        for (let i = 0; i < 10; i++) pessoa(ctx, 3700 + i * 72, 560, 0.9, i < 10 ? '#bbf7d0' : '#475569', appear(t, tCem + i * 0.06, 0.3));
        text(ctx, 'quase 100 milhões de pessoas', 4025, 670, { size: 36, weight: 900, color: '#e2e8f0', alpha: appear(t, tCem + 0.4, 0.4) });
        chip(ctx, 4050, 160, 'conta do Dieese para 2026', P.voce, appear(t, tDieese, 0.4), { size: 26 });
        ctx.restore();
      });
      zone(ctx, cam2, 5100, 5300, () => {
        if (t < tSo - 0.8) return;
        const k = appear(t, tSo - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        sombraChao(ctx, 5200, 760, 360);
        envelopePag(ctx, 5200, 560, 1.05, { notas: prog(t, tSo, 0.8), fatia: prog(t, tParte + 0.2, 1.0), fantasma: prog(t, tOutra + 0.3, 1.2), aberto: prog(t, tHoje, 0.8) });
        chip(ctx, 4780, 300, 'fica no caminho', '#fca5a5', appear(t, tParte + 0.9, 0.4), { size: 26 });
        chip(ctx, 5700, 250, 'esta parte você não vê', P.inss, appear(t, tOutra + 1.0, 0.4), { size: 26 });
        headline(ctx, 'quanto dele é seu?', 5200, 150, { size: 76, k: appear(t, tQuanto, 0.5), hl: '#14532d' });
        chip(ctx, 5200, 770, 'quem fica com cada real', P.amber, appear(t, tCada, 0.4), { size: 30 });
        ctx.restore();
      });
      luzinhas(ctx, cam2, t, 3, 9);
    },
    overlay(ctx, t) {
      source(ctx, 'Lei 15.270/2025', vis(t, tSemIR, tPapel, 0.5, 0.4));
      source(ctx, 'jornal da época (26/4/1962); Lei 4.090/1962', vis(t, tAbril, tNeste, 0.5, 0.4));
      source(ctx, 'Dieese (2026)', vis(t, tDieese, tSo, 0.5, 0.4));
    },
  };
}

// ================================================================ Cena 02: a conta básica (12 pedaços, duas parcelas no calendário)
const MESES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
function scene02(K) {
  const tPrim = K('Primeiro, a conta básica'), tSal = K('É um salário a mais por ano'), tDoze = K('dividido em doze pedaços'), tCada = K('cada mês em que você trabalhou'), tQuinze = K('pelo menos quinze dias'), tVale = K('vale um pedaço');
  const tHora = K('Hora extra e comissão'), tMedia = K('entram pela média'), tPag = K('O pagamento vem em duas parcelas'), t30 = K('até 30 de novembro'), tSem = K('vem sem desconto nenhum'), tMetade = K('é metade do valor');
  const tSeg = K('A segunda tem prazo'), t20 = K('até 20 de dezembro'), tDom = K('cai num domingo'), t18 = K('então sai até sexta'), tNela = K('É nela que aparecem'), tMenor = K('por isso ela vem menor'), tAli = K('É ali que a gente vai olhar');
  const cam = [
    { t: 0, x: 960, y: 480, z: 1.02, dx: 3 }, { t: tCada, x: 960, y: 500, z: 1.08, d: 1.6 }, { t: tHora, x: 1000, y: 470, z: 1.02, d: 1.4, dx: -3 },
    { t: tPag - 0.4, x: 2400, y: 480, z: 1.0, d: 1.6 }, { t: t30, x: 2150, y: 470, z: 1.12, d: 1.6 }, { t: tSeg, x: 2640, y: 470, z: 1.12, d: 1.6 }, { t: t18, x: 2660, y: 480, z: 1.16, d: 1.4 },
    { t: tNela - 0.4, x: 3800, y: 480, z: 1.0, d: 1.6 }, { t: tAli, x: 3960, y: 470, z: 1.12, d: 1.8 },
  ];
  const sfx = [[tPrim, 'pop', 0.3], [tSal, 'notas', 0.45], [tDoze, 'flip', 0.5, { dur: 0.8 }], [tQuinze, 'tick', 0.4], [tVale, 'pop', 0.35], [tHora, 'clock', 0.3, { n: 4, step: 0.25 }], [tMedia, 'pop', 0.3],
    [tPag - 0.3, 'whoosh', 0.3], [t30, 'tick', 0.45], [tSem, 'ding', 0.35], [tMetade, 'notas', 0.4], [t20, 'tick', 0.45], [tDom, 'drop', 0.3], [t18, 'tick', 0.5],
    [tNela - 0.3, 'whoosh', 0.3], [tNela + 0.4, 'grampo', 0.5], [tMenor, 'drop', 0.35], [tAli, 'pop', 0.35]];
  return {
    accent: P.amber, cam, sfx, impacts: [], trans: 'push',
    draw(ctx, t, cam2) {
      escritorioFundo(ctx, cam2, 0.95);
      zone(ctx, cam2, 900, 1050, () => {
        if (t > tPag + 0.6) return;
        const k = vis(t, 0, tPag, 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        // um salário (barra de notas) que se divide em 12 folhinhas de mês
        const split = ease.inOut(prog(t, tDoze, 1.2)), X0 = 300, w = 1320, cw = w / 12;
        for (let i = 0; i < 12; i++) {
          const cx = X0 + cw * (i + 0.5) + (i - 5.5) * 12 * split, ka = appear(t, tSal + i * 0.02, 0.4);
          if (ka <= 0) continue;
          ctx.save(); ctx.globalAlpha *= ka;
          const full = i < 11 || t < tQuinze ? 1 : 1; // todos os meses trabalhados (o exemplo é o ano inteiro)
          const bw = cw - 12 * split, rad = split < 0.1 ? 0 : 10;
          ctx.save(); papelSombra(ctx); fillRR(ctx, cx - bw / 2, 360, bw, 240, rad, split > 0.5 ? '#fefce8' : '#4ade80'); ctx.restore();
          if (split > 0.5) { ctx.fillStyle = '#b91c1c'; ctx.fillRect(cx - bw / 2, 360, bw, 44); text(ctx, MESES[i], cx, 383, { size: 24, weight: 900, color: '#ffffff' }); text(ctx, '1/12', cx, 500, { size: 32, weight: 900, color: '#1f2937' }); }
          ctx.restore();
        }
        if (split < 0.5) text(ctx, '1 SALÁRIO', 960, 480, { size: 60, weight: 900, color: '#14532d', alpha: appear(t, tSal + 0.3, 0.4) * (1 - split * 2) });
        // o mês em destaque: 15 dias ou mais contam
        const kq = vis(t, tCada, tHora, 0.5, 0.5);
        if (kq > 0) {
          ctx.save(); ctx.globalAlpha *= kq;
          const cx = X0 + cw * 3.5 + (3 - 5.5) * 12;
          strokeRR(ctx, cx - cw / 2, 352, cw, 256, 12, P.amber, 6);
          for (let d = 0; d < 30; d++) { const on = d < 15 * ease.out(prog(t, tQuinze, 0.8)); fillRR(ctx, cx - 75 + (d % 6) * 26, 620 + Math.floor(d / 6) * 26, 20, 20, 4, on ? P.amber : 'rgba(255,255,255,0.18)'); }
          chip(ctx, cx + 380, 650, '15 dias ou mais = 1 pedaço', P.amber, appear(t, tVale, 0.4), { size: 28 });
          ctx.restore();
        }
        headline(ctx, 'a conta básica', 960, 220, { size: 70, k: vis(t, tPrim, tSal, 0.5, 0.4), hl: '#7c2d12' });
        headline(ctx, '1 salário a mais por ano', 960, 220, { size: 64, k: vis(t, tSal, tCada, 0.5, 0.5), color: '#ecfccb', color2: P.voce });
        // hora extra e comissão: entram pela média
        const kh = vis(t, tHora, tPag, 0.4, 0.4);
        if (kh > 0) { chip(ctx, 700, 230, 'hora extra', '#93c5fd', kh, { size: 32 }); chip(ctx, 1000, 230, 'comissão', '#93c5fd', appear(t, tHora + 0.5, 0.4) * kh, { size: 32 }); chip(ctx, 1320, 230, 'pela média do ano', P.amber, appear(t, tMedia, 0.4) * kh, { size: 32 }); }
        ctx.restore();
      });
      zone(ctx, cam2, 2100, 2700, () => {
        if (t < tPag - 0.8 || t > tNela + 0.6) return;
        const k = vis(t, tPag - 0.3, tNela, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        sombraChao(ctx, 2100, 760, 300); sombraChao(ctx, 2700, 760, 300);
        calendario(ctx, 2100, 480, 0.95, { nome: 'NOVEMBRO', ano: 2026, dias: 30, inicio: 0, marcas: { 30: { cor: '#16a34a', k: prog(t, t30, 0.6), fill: prog(t, t30, 0.4) } } }, { rot: -0.03 });
        calendario(ctx, 2700, 480, 0.95, { nome: 'DEZEMBRO', ano: 2026, dias: 31, inicio: 2, marcas: { 20: { cor: '#dc2626', k: prog(t, t20, 0.6), risco: prog(t, tDom, 0.5) }, 18: { cor: '#16a34a', k: prog(t, t18 + 0.3, 0.6), fill: prog(t, t18 + 0.3, 0.4) } } }, { rot: 0.03 });
        chip(ctx, 2100, 150, '1ª parcela: metade, sem desconto', P.voce, appear(t, tSem, 0.4), { size: 28 });
        chip(ctx, 2700, 150, '2ª parcela: sexta, 18/12', P.amber, appear(t, t18 + 0.3, 0.4), { size: 28 });
        chip(ctx, 2700, 150, 'dia 20 cai num domingo', '#fca5a5', vis(t, tDom, t18 + 0.3, 0.4, 0.3), { size: 28 });
        ctx.restore();
      });
      zone(ctx, cam2, 3700, 4000, () => {
        if (t < tNela - 0.8) return;
        const k = appear(t, tNela - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        // dois envelopes: o de novembro cheio, o de dezembro mais fino e com os descontos grampeados
        sombraChao(ctx, 3500, 740, 300); sombraChao(ctx, 4100, 740, 300);
        envelopePag(ctx, 3500, 540, 0.85, { notas: 1, rot: -0.04 });
        envelopePag(ctx, 4100, 560, 0.85 - 0.12 * ease.out(prog(t, tMenor, 0.8)), { notas: 1 - 0.45 * ease.out(prog(t, tMenor, 0.8)), rot: 0.03 });
        text(ctx, '1ª parcela', 3500, 760, { size: 32, weight: 900, color: '#e2e8f0' });
        text(ctx, '2ª parcela', 4100, 760, { size: 32, weight: 900, color: '#e2e8f0' });
        const kg = appear(t, tNela + 0.4, 0.4);
        if (kg > 0) { chip(ctx, 4300, 360, 'INSS', P.inss, kg, { size: 28 }); chip(ctx, 4320, 430, 'imposto de renda', P.ir, appear(t, tNela + 0.7, 0.4), { size: 26 }); }
        if (t > tAli) { penCircle(ctx, 4100, 560, 300, 200, P.amber, prog(t, tAli, 0.8), 7); }
        headline(ctx, 'os descontos ficam todos aqui', 3800, 180, { size: 58, k: appear(t, tNela + 0.2, 0.5), hl: '#7c2d12' });
        ctx.restore();
      });
      luzinhas(ctx, cam2, t, 5, 9);
    },
    overlay(ctx, t) { source(ctx, 'Lei 4.749/1965 (prazos do 13º)', vis(t, tPag, tNela, 0.5, 0.4)); },
  };
}

// ================================================================ Cena 03: o holerite aberto (escada do INSS e a linha do IR zerada)
function scene03(K) {
  const tPega = K('Pega uma gratificação'), tLim = K('no limite da isenção'), t5mil = K('cinco mil reais, de um ano inteiro'), tPrim = K('O primeiro desconto é o INSS'), tFaixas = K('Ele cobra por faixas');
  const t75 = K('sete e meio por cento'), tMin = K('até o valor do salário mínimo'), tSobe = K('a taxa vai subindo'), t14 = K('até catorze por cento'), tAlta = K('só sobre a parte mais alta'), t501 = K('quinhentos e um reais');
  const tSeg = K('O segundo desconto é o imposto de renda'), tAno = K('No ano passado'), t312 = K('trezentos e doze reais'), tReceita = K('para a Receita'), tZer = K('a linha do imposto vem zerada'), tSobra = K('Na conta, sobram'), t4498 = K('quatro mil quatrocentos e noventa e oito');
  const cam = [
    { t: 0, x: 900, y: 470, z: 1.04, dz: 0.003 }, { t: t5mil, x: 900, y: 300, z: 1.3, d: 1.6 },
    { t: tPrim, x: 960, y: 470, z: 1.0, d: 1.6, dx: 4 }, { t: tFaixas, x: 1230, y: 460, z: 1.06, d: 1.8 }, { t: tAlta, x: 1320, y: 440, z: 1.1, d: 1.6 },
    { t: t501, x: 1200, y: 470, z: 1.04, d: 1.6 }, { t: tSeg, x: 1060, y: 380, z: 1.1, d: 1.4, dx: 2 }, { t: tZer, x: 1080, y: 390, z: 1.12, d: 1.6 },
    { t: tSobra - 0.2, x: 1000, y: 500, z: 1.06, d: 1.8, dz: 0.004 },
  ];
  const sfx = [[tPega, 'paper', 0.45, { dur: 0.5 }], [t5mil, 'typewriter', 0.35, { n: 8 }], [tPrim, 'pop', 0.3], [tFaixas, 'whoosh', 0.3],
    [t75, 'hit', 0.35], [tSobe, 'hit', 0.3], [tSobe + 0.6, 'hit', 0.3], [t14, 'hit', 0.35], [tAlta, 'tick', 0.4], [t501, 'typewriter', 0.4, { n: 6 }], [t501 + 0.7, 'stamp', 0.4],
    [tSeg, 'whoosh', 0.3], [t312, 'typewriter', 0.35, { n: 6 }], [tZer, 'tick', 0.4], [tZer + 0.5, 'stamp', 0.6], [tSobra, 'typewriter', 0.4, { n: 8 }], [t4498 + 0.4, 'coin', 0.5]];
  return {
    accent: P.inss, cam, sfx, impacts: [tZer + 0.5], trans: 'push',
    draw(ctx, t, cam2) {
      escritorioFundo(ctx, cam2, 0.95, 0.1);
      const HX = 640, HY = 440, HS = 0.56;
      sombraChao(ctx, HX, 820, 340);
      const kIns = appear(t, t501 + 0.2, 0.3), kIr = appear(t, t312, 0.4);
      const rows = rows13([appear(t, t5mil, 0.4), appear(t, tPrim, 0.4), appear(t, tSeg, 0.4)], {
        inss: kIns > 0 ? '501,51' : '...', ir: t > tZer ? '0,00' : '...',
        riscado: { valor: '312,89', rot: '2025:', k: kIr, x: prog(t, tZer, 0.5) },
      });
      holerite(ctx, HX, HY, HS, { rows, totV: t > t5mil ? '5.000,00' : '', totD: kIns > 0 ? '501,51' : '', liq: '4.498,49', liqK: prog(t, t4498, 0.6), hlRow: 2, hlK: prog(t, tZer, 0.6), rot: -0.012 });
      // o valor zerado em destaque, ao lado da linha do IR
      const yIR = HY + HOL.rowY(2) * HS;
      // o carimbo do DP no espaço vazio da tabela, abaixo das linhas
      ovalStamp(ctx, HX + 60, HY + HOL.rowY(5) * HS, 170, 66, [['ISENTO', 0.05, 0.62]], '#15803d', appear(t, tZer + 0.5, 0.35), -0.1);
      chip(ctx, 1250, 160, 'no limite da isenção: R$ 5 mil', P.voce, vis(t, tLim, tFaixas - 0.4, 0.4, 0.4), { size: 28 });
      chip(ctx, 1250, 244, 'R$ 5.000 · ano inteiro trabalhado', P.voce, vis(t, t5mil, tFaixas - 0.4, 0.4, 0.4), { size: 26 });
      // escada do INSS à direita do holerite
      const kE = vis(t, tFaixas - 0.4, tSeg, 0.5, 0.5);
      if (kE > 0) {
        ctx.save(); ctx.globalAlpha *= kE;
        escadaINSS(ctx, 1420, 430, 1.15, t, {
          deg: [prog(t, t75, 0.5), prog(t, tSobe, 0.5), prog(t, tSobe + 0.6, 0.5), prog(t, t14, 0.5)],
          pago: [prog(t, tAlta + 0.8, 0.3), prog(t, tAlta + 1.2, 0.3), prog(t, tAlta + 1.6, 0.3), prog(t, tAlta + 2.0, 0.3)],
          faixaA: 1 - appear(t, t501 - 0.3, 0.3), alto: appear(t, tAlta, 0.4), sobe: t > tAlta + 0.5 ? prog(t, tAlta + 0.5, 1.8) : -1,
        });
        text(ctx, 'INSS por faixas', 1420, 120, { size: 44, weight: 900, color: '#fde68a', alpha: appear(t, tFaixas, 0.4) });
        text(ctx, '(o salário mínimo)', 1086, 742, { size: 22, weight: 800, color: '#fde68a', alpha: vis(t, tMin, t501 - 0.3, 0.4, 0.3) });
        bigNum(ctx, '= R$ 501,51', 1500, 715, appear(t, t501, 0.5), { size: 60, color: P.inss });
        ctx.restore();
      }
      // o imposto de 2025 x 2026, grande, ao lado do papel
      const kA = vis(t, tAno, tSobra, 0.5, 0.4);
      if (kA > 0) {
        ctx.save(); ctx.globalAlpha *= kA;
        text(ctx, 'imposto de renda deste 13º', 1360, 170, { size: 30, weight: 900, color: '#e2e8f0' });
        text(ctx, '2025', 1130, 280, { size: 34, weight: 900, color: '#fca5a5', align: 'left', alpha: appear(t, t312, 0.4) });
        bigNum(ctx, 'R$ 312,89', 1500, 280, appear(t, t312, 0.5), { size: 72, color: '#f87171' });
        crossOut(ctx, 1330, 300, 1680, 262, '#ef4444', prog(t, tZer, 0.5), 9);
        text(ctx, '2026', 1130, 410, { size: 34, weight: 900, color: P.voce, align: 'left', alpha: appear(t, tZer, 0.4) });
        bigNum(ctx, 'R$ 0,00', 1500, 410, appear(t, tZer + 0.2, 0.5), { size: 72, color: P.voce });
        ctx.restore();
      }
      bigNum(ctx, 'R$ 4.498,49', 1380, 430, appear(t, t4498 + 0.4, 0.5), { size: 96, color: P.voce });
      text(ctx, 'na conta, somando as duas parcelas', 1380, 520, { size: 30, weight: 900, color: '#e2e8f0', alpha: appear(t, t4498 + 0.8, 0.4) });
      chip(ctx, 1380, 610, '1ª parcela 2.500,00 + 2ª parcela 1.998,49', P.voce, appear(t, t4498 + 1.2, 0.4), { size: 24 });
      luzinhas(ctx, cam2, t, 7, 8);
    },
    overlay(ctx, t) { source(ctx, 'tabela do INSS 2026; Receita Federal; conta do canal', vis(t, tPrim, t4498 + 2, 0.5, 0.4)); },
  };
}

// ================================================================ Cena 04: para quem a isenção muda (régua de salários e o cofrinho do ano)
function scene04(K) {
  const tSo = K('Só que a isenção não muda a vida'), tAte3 = K('Para salários de até uns três mil'), tZero = K('já era zero'), tPadrao = K('um desconto padrão da Receita'), tNada = K('Nesse grupo, nada muda');
  const tDif = K('A diferença aparece daí para cima'), t4mil = K('Num décimo terceiro de quatro mil'), t115 = K('cento e quinze reais'), tLim = K('Do limite até sete mil'), tCai = K('o imposto cai, mas não zera'), tAcima = K('Acima disso, fica tudo igual');
  const tSom = K('Somando o salário do ano'), tBem = K('quem está bem no limite'), tQuase = K('quase um salário'), tLei = K('Quando a lei foi aprovada'), t10 = K('uns dez milhões de pessoas isentas'), t5 = K('outros cinco milhões pagando menos');
  const cam = [
    { t: 0, x: 960, y: 470, z: 1.0, dx: 3 }, { t: tAte3, x: 620, y: 520, z: 1.1, d: 1.8 }, { t: tDif, x: 960, y: 490, z: 1.02, d: 1.6, dx: 4 },
    { t: tLim, x: 1200, y: 500, z: 1.06, d: 1.6 }, { t: tAcima, x: 1080, y: 490, z: 1.0, d: 1.6 },
    { t: tSom - 0.4, x: 2380, y: 480, z: 1.0, d: 1.6 }, { t: tQuase, x: 2300, y: 470, z: 1.08, d: 1.6 }, { t: tLei - 0.2, x: 2700, y: 480, z: 1.02, d: 1.8, dx: 3 },
  ];
  const sfx = [[tSo, 'whoosh', 0.3], [tSo + 0.3, 'paper', 0.3], [tAte3, 'pop', 0.3], [tZero, 'tick', 0.35], [tPadrao, 'pop', 0.3], [tNada, 'stamp', 0.6],
    [tDif, 'riser', 0.25, { dur: 0.9 }], [t4mil, 'pop', 0.35], [t115, 'coin', 0.35], [tLim, 'pop', 0.35], [tCai, 'drop', 0.3], [tAcima, 'pop', 0.3],
    [tSom - 0.3, 'whoosh', 0.3], ...Array.from({ length: 13 }, (_, i) => [tSom + 0.4 + i * 0.32, 'coin', 0.18]), [tQuase, 'cash', 0.4], [tLei, 'paper', 0.35], [t10, 'pop', 0.35], [t5, 'pop', 0.3]];
  return {
    accent: P.voce, cam, sfx, impacts: [tNada], trans: 'push',
    draw(ctx, t, cam2) {
      escritorioFundo(ctx, cam2, 0.95);
      zone(ctx, cam2, 500, 1300, () => {
        if (t > tSom + 0.6) return;
        const k = vis(t, tSo, tSom, 0.6, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        const kr = ease.out(appear(t, tSo + 0.2, 0.8));
        ctx.save(); ctx.translate((1 - kr) * -300, 0);
        reguaSal(ctx, 960, 470, 1.0, t, {
          faixas: [
            { de: 0, ate: 3036, cor: '#64748b', k: prog(t, tAte3, 0.8), rot: 'nada muda', corTxt: '#f1f5f9', rotK: 1 - vis(t, tLim - 0.6, tAcima + 1.2, 0.4, 0.4) },
            { de: 3036, ate: 5000, cor: '#4ade80', cor2: '#4ade80', a0: 0.25, a1: 1, grad: true, k: prog(t, tDif, 0.9), glow: '#4ade80' },
            { de: 5000, ate: 7350, cor: '#4ade80', cor2: '#4ade80', a0: 1, a1: 0.18, grad: true, k: prog(t, tLim, 0.9) },
            { de: 7350, ate: 10000, cor: '#475569', k: prog(t, tAcima, 0.6), rot: 'fica igual', corTxt: '#e2e8f0' },
          ],
          pinos: [
            { v: 3036, rot: 'até uns R$ 3 mil: o IR do 13º já era zero', cor: '#cbd5e1', k: vis(t, tZero, tDif, 0.4, 0.4), h: 120, dx: 150, size: 26 },
            { v: 4000, rot: 'R$ 4 mil: economia de uns R$ 115', cor: P.voce, k: vis(t, t4mil, tLim, 0.4, 0.4), h: 120, size: 26 },
            { v: 5000, rot: 'o limite: o maior ganho', cor: P.voce, k: appear(t, tLim, 0.4), h: 170, size: 26 },
            { v: 7350, rot: 'até R$ 7.350 o IR cai, mas não zera', cor: '#bbf7d0', k: appear(t, tCai, 0.4), h: 95, dx: -20, size: 24 },
          ],
        });
        // o imposto do 13º em cada salário: 2025 (vermelho) x 2026 (verde), com a régua como eixo
        const BASE = 830, ESC = 0.2, pxv = (v) => 960 + lerp(-800, 800, v / 10000);
        const pares = [[3000, 0, 0, tZero], [4000, 114.76, 0, t4mil], [5000, 312.89, 0, tLim], [6000, 564.85, 385.10, tCai], [8000, 1037.85, 1037.85, tAcima]];
        for (const [v, antes, agora, tt] of pares) {
          const kb = ease.out(appear(t, tt, 0.7)); if (kb <= 0) continue;
          const x = pxv(v);
          for (const [val, dx, cor, ta] of [[antes, -27, '#f87171', 0], [agora, 27, '#4ade80', 0.35]]) {
            const kk = ease.out(appear(t, tt + ta, 0.6)); if (kk <= 0) continue;
            const h = Math.max(6, val * ESC) * kk;
            ctx.save(); ctx.shadowColor = hexA(cor, 0.5); ctx.shadowBlur = 14; fillRR(ctx, x + dx - 22, BASE - h, 44, h, 6, cor); ctx.restore();
            const igual = antes === agora && antes > 0;
            if (!(igual && ta > 0)) text(ctx, (val ? fmt(val, 0) : '0') + (igual ? ' (igual)' : ''), igual ? x : x + dx, BASE - h - 18, { size: igual ? 22 : 20, weight: 900, color: igual ? '#e2e8f0' : cor, alpha: clamp(kk * 2) });
          }
        }
        if (appear(t, tZero, 0.5) > 0) { ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(pxv(2700), BASE, pxv(8600) - pxv(2700), 3); }
        const kl = vis(t, tZero + 0.4, tSom, 0.4, 0.4);
        text(ctx, 'IR do 13º', 1700, 700, { size: 24, weight: 900, color: '#e2e8f0', align: 'left', alpha: kl });
        fillRR(ctx, 1700, 730, 22, 22, 4, '#f87171', kl); text(ctx, '2025', 1732, 742, { size: 22, weight: 900, color: '#f87171', align: 'left', alpha: kl });
        fillRR(ctx, 1700, 770, 22, 22, 4, '#4ade80', kl); text(ctx, '2026', 1732, 782, { size: 22, weight: 900, color: '#4ade80', align: 'left', alpha: kl });
        ctx.restore();
        chip(ctx, 560, 650, 'desconto padrão (simplificado) da Receita', '#cbd5e1', vis(t, tPadrao, tNada - 0.1, 0.4, 0.3), { size: 26 });
        rectStamp(ctx, 470, 690, 320, 100, 'NADA MUDA', '#94a3b8', vis(t, tNada, tDif + 1, 0.3, 0.4), -0.08, 44);
        headline(ctx, 'não muda igual para todo mundo', 960, 150, { size: 60, k: vis(t, tSo, tAte3 + 0.5, 0.5, 0.4), hl: '#14532d' });
        headline(ctx, 'quem ganha: de uns R$ 3 mil a R$ 7.350', 960, 95, { size: 54, k: vis(t, tDif + 0.4, tSom, 0.5, 0.4), hl: '#14532d' });
        text(ctx, 'salário por mês', 960, 330, { size: 30, weight: 900, color: '#e2e8f0', alpha: appear(t, tSo + 0.6, 0.4) * (1 - appear(t, tAte3, 0.3)) });
        ctx.restore();
      });
      zone(ctx, cam2, 2200, 2800, () => {
        if (t < tSom - 0.8) return;
        const k = appear(t, tSom - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        // 12 meses + o 13º: uma moeda por mês entra no cofrinho (o imposto que deixou de sair)
        cofrinho(ctx, 2150, 560, 0.95);
        for (let i = 0; i < 13; i++) {
          const t0 = tSom + 0.4 + i * 0.32, p = prog(t, t0, 0.45);
          if (p <= 0) { moeda1(ctx, 1700 + (i % 7) * 70, 240 + Math.floor(i / 7) * 80, 26); continue; }
          if (p >= 1) continue;
          const x0 = 1700 + (i % 7) * 70, y0 = 240 + Math.floor(i / 7) * 80, x1 = 2180, y1 = 410;
          moeda1(ctx, lerp(x0, x1, ease.inOut(p)), lerp(y0, y1, ease.in(p)) - Math.sin(p * Math.PI) * 60, 26, { a: 1 - ease.in(p) * 0.6 });
        }
        text(ctx, '13 × R$ 312,89 = R$ 4.067,57', 1910, 280, { size: 34, weight: 900, color: P.voce, alpha: vis(t, Math.max(tBem, tSom + 4.9), tLei, 0.4, 0.4) });
        text(ctx, '12 meses + o 13º', 1910, 160, { size: 30, weight: 900, color: '#e2e8f0', alpha: vis(t, tSom, tLei, 0.4, 0.4) });
        bigNum(ctx, 'quase 1 salário', 2620, 330, vis(t, tQuase, tLei - 0.1, 0.5, 0.4), { size: 70, color: P.voce });
        chip(ctx, 2190, 740, 'quem ganha R$ 5 mil: uns R$ 4 mil de IR a menos no ano', P.voce, vis(t, tBem, tLei + 0.6, 0.4, 0.4), { size: 22 });
        // quando a lei passou: 10 milhões isentos + 5 milhões pagando menos (1 pessoa = 1 milhão)
        const kp = appear(t, tLei, 0.5);
        if (kp > 0) {
          for (let i = 0; i < 15; i++) {
            const col = i % 5, row = Math.floor(i / 5), isento = i < 10;
            pessoa(ctx, 2700 + col * 92, 330 + row * 150, 1.0, isento ? '#4ade80' : '#bbf7d0', appear(t, (isento ? t10 : t5) + (i % 10) * 0.05, 0.3) * kp);
          }
          text(ctx, '10 milhões isentos', 2884, 720, { size: 32, weight: 900, color: '#4ade80', alpha: appear(t, t10 + 0.5, 0.4) });
          chip(ctx, 2884, 790, '+ 5 milhões pagando menos', '#bbf7d0', appear(t, t5 + 0.5, 0.4), { size: 26 });
          text(ctx, '1 boneco = 1 milhão de pessoas', 2884, 200, { size: 24, weight: 800, color: '#94a3b8', alpha: appear(t, t10, 0.4) });
        }
        ctx.restore();
      });
      luzinhas(ctx, cam2, t, 9, 9);
    },
    overlay(ctx, t) {
      source(ctx, 'Receita Federal; conta do canal', vis(t, tAte3, tLei, 0.5, 0.4));
      source(ctx, 'estimativa na aprovação da lei (nov/2025)', vis(t, tLei, 99, 0.5, 0.4));
    },
  };
}

// ================================================================ Cena 05: a virada (o holerite vira de costas e mostra o que a empresa paga por fora)
function versoCusto(ks) {
  return (ctx) => {
    const L = -500, T = -650, ink = '#1f2937';
    ctx.strokeStyle = ink; ctx.lineWidth = 2.5; ctx.strokeRect(L + 24, T + 24, 952, 1252);
    text(ctx, 'O QUE A EMPRESA PAGA', 0, T + 90, { size: 52, weight: 900, color: ink });
    text(ctx, 'pelo 13º de R$ 5.000 · empresa fora do Simples', 0, T + 146, { size: 26, weight: 800, color: '#6b7280' });
    const rows = [['13º salário (bruto)', '5.000,00', ks[0], ink], ['FGTS · 8%', '400,00', ks[1], '#0369a1'], ['INSS da empresa · 20%', '1.000,00', ks[2], '#b45309'], ['RAT · 2%', '100,00', ks[3], '#b45309'], ['outras contribuições · 5,8%', '290,00', ks[4], '#b45309']];
    rows.forEach(([d, v, k, cor], i) => {
      if (k <= 0) return; const yy = T + 260 + i * 128;
      ctx.save(); ctx.globalAlpha *= clamp(k * 2.5);
      text(ctx, d, L + 60, yy, { size: 38, weight: 800, color: ink, align: 'left' }); mono(ctx, v, -L - 60, yy, 42, cor, 'right', 900);
      ctx.fillStyle = 'rgba(31,41,55,0.12)'; ctx.fillRect(L + 50, yy + 46, 900, 2);
      ctx.restore();
    });
    if (ks[5] > 0) {
      ctx.save(); ctx.globalAlpha *= clamp(ks[5] * 2);
      ctx.fillStyle = ink; ctx.fillRect(L + 50, T + 920, 900, 4);
      text(ctx, 'CUSTO TOTAL', L + 60, T + 1010, { size: 50, weight: 900, color: ink, align: 'left' }); mono(ctx, '6.790,00', -L - 60, T + 1010, 60, '#b45309', 'right', 900);
      ctx.restore();
    }
  };
}
function scene05(K) {
  const tTem = K('Tem um pedaço dessa história'), tNao = K('que não aparece no holerite'), tAlem = K('Além do valor bruto'), t8 = K('mais oito por cento'), tFgts = K('no seu FGTS');
  const tFora = K('Numa empresa fora do Simples'), tMedias = K('que é o caso das médias e grandes'), tQuarto = K('mais de um quarto do valor por fora'), tFolha = K('outras contribuições sobre a folha');
  const tCusta = K('O décimo terceiro do exemplo custa para ela'), t6800 = K('uns seis mil e oitocentos'), tPega = K('Pega cem reais desse custo'), tConta = K('Pela conta do canal'), t66 = K('uns sessenta e seis caem na sua conta');
  const t6 = K('Uns seis vão para o seu FGTS'), tGuard = K('mas fica guardado'), t28 = K('Os outros vinte e oito'), tParte = K('uma parte sai do seu holerite'), tMaior = K('a maior parte a empresa paga direto'), tIR = K('O imposto de renda, este ano, fica com zero');
  const tFlip = tNao + 0.2;
  const cam = [
    { t: 0, x: 900, y: 480, z: 1.05, dz: 0.003 }, { t: tFlip, x: 860, y: 470, z: 1.12, d: 1.2 }, { t: tAlem, x: 860, y: 380, z: 1.3, d: 1.6 },
    { t: tFora, x: 1060, y: 450, z: 1.04, d: 1.6, dx: 3 }, { t: tCusta, x: 1100, y: 470, z: 1.02, d: 1.6 },
    { t: tPega - 0.4, x: 2560, y: 450, z: 1.0, d: 1.6 }, { t: t66, x: 2600, y: 440, z: 1.03, d: 1.6 }, { t: t6 + 0.6, x: 2880, y: 440, z: 1.12, d: 1.8 }, { t: t28 + 1.0, x: 2990, y: 440, z: 1.2, d: 1.8 }, { t: tIR, x: 2960, y: 450, z: 1.16, d: 1.8, dz: 0.003 },
  ];
  const sfx = [[tTem, 'pop', 0.3], [tFlip, 'whoosh', 0.45, { dur: 0.6 }], [tFlip + 0.35, 'paper', 0.5, { dur: 0.5 }], [tAlem, 'typewriter', 0.35, { n: 6 }], [t8, 'typewriter', 0.35, { n: 5 }],
    [tFora, 'pop', 0.3], [tQuarto, 'typewriter', 0.4, { n: 12 }], [tCusta, 'pop', 0.3], [t6800, 'stamp', 0.6],
    [tPega - 0.3, 'whoosh', 0.3], [tPega + 0.2, 'contadora', 0.4, { dur: 1.1 }], [tConta, 'pop', 0.3], [t66, 'coin', 0.4], [t66 + 0.4, 'coin', 0.3], [t6, 'coin', 0.35], [tGuard, 'clank', 0.35], [t28, 'coin', 0.4], [t28 + 0.4, 'coin', 0.3], [tParte, 'pop', 0.3], [tMaior, 'pop', 0.3], [tIR, 'drop', 0.35]];
  // 100 moedas de R$ 1 = os R$ 100 do custo; quem fica com cada uma
  const DEST = (i) => (i < 66 ? 0 : i < 72 ? 1 : 2);
  const GX = 1880, GY = 200, GS = 48;
  const DPOS = [[2640, 420], [2990, 440], [3330, 450]];
  return {
    accent: P.inss, cam, sfx, impacts: [t6800], trans: 'cut',
    draw(ctx, t, cam2) {
      escritorioFundo(ctx, cam2, 0.95, 0.15);
      zone(ctx, cam2, 800, 1100, () => {
        if (t > tPega + 0.6) return;
        const k = 1 - appear(t, tPega + 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        sombraChao(ctx, 760, 820, 340);
        const ks = [prog(t, tAlem, 0.4), prog(t, t8, 0.4), prog(t, tQuarto, 0.4), prog(t, tQuarto + 0.6, 0.4), prog(t, tQuarto + 1.2, 0.4), prog(t, t6800, 0.4)];
        holerite(ctx, 760, 440, 0.56, { rows: rows13(), totV: '5.000,00', totD: '501,51', liq: '4.498,49', flip: ease.inOut(prog(t, tFlip, 1.0)), verso: versoCusto(ks), rot: 0.01, key: 'v' });
        chip(ctx, 760, 70, 'o verso que você não vê', P.inss, vis(t, tFlip + 0.9, tFora, 0.4, 0.4), { size: 28 });
        chip(ctx, 1460, 260, 'fora do Simples: médias e grandes', '#fde68a', appear(t, tMedias, 0.4), { size: 26 });
        chip(ctx, 1460, 360, 'mais de 1/4 por fora: 27,8%', P.inss, appear(t, tFolha, 0.4), { size: 26 });
        bigNum(ctx, 'uns R$ 6,8 mil', 1460, 560, appear(t, t6800, 0.5), { size: 96, color: P.inss });
        text(ctx, 'para pagar um 13º de R$ 5 mil', 1460, 650, { size: 30, weight: 900, color: '#e2e8f0', alpha: appear(t, t6800 + 0.4, 0.4) });
        shockRing(ctx, t, t6800, 1460, 560, P.inss, 80, 380);
        ctx.restore();
      });
      zone(ctx, cam2, 2300, 2800, () => {
        if (t < tPega - 0.8) return;
        const k = appear(t, tPega - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        // destinos: envelope (sua conta), cofre do FGTS, prédio do INSS
        envelopePag(ctx, DPOS[0][0], DPOS[0][1], 0.52, { notas: 0, rot: 0.02 });
        cofreFGTS(ctx, DPOS[1][0], DPOS[1][1], 0.55);
        predioINSS(ctx, DPOS[2][0], DPOS[2][1] + 10, 0.85);
        const tint = appear(t, tConta, 0.5), tf = [t66, t6, t28];
        for (let i = 0; i < 100; i++) {
          const d = DEST(i), cx = GX + (i % 10) * GS, cy = GY + Math.floor(i / 10) * GS;
          const p = prog(t, tf[d] + 0.25 + (i % 12) * 0.025 + (d === 0 ? Math.floor(i / 12) * 0.06 : 0), 0.7);
          if (p >= 1) continue;
          const [dx, dy] = DPOS[d];
          const x = lerp(cx, dx, ease.inOut(p)), y = lerp(cy, dy, ease.inOut(p)) - Math.sin(p * Math.PI) * 80;
          moeda1(ctx, x, y, 21, { cor: tint > 0.5 ? [P.voce, P.fgts, P.inss][d] : null, a: (1 - ease.in(p) * 0.7) * appear(t, tPega + i * 0.008, 0.3) });
        }
        text(ctx, 'R$ 100 do custo', 2096, 690, { size: 32, weight: 900, color: '#e2e8f0', alpha: vis(t, tPega, t66 + 1.2, 0.4, 0.4) });
        chip(ctx, 2096, 120, 'conta do canal', P.amber, vis(t, tConta, t6 + 0.3, 0.4, 0.3), { size: 26 });
        bigNum(ctx, '66', DPOS[0][0], 200, appear(t, t66 + 0.9, 0.4), { size: 104, color: P.voce });
        text(ctx, 'na sua conta', DPOS[0][0], 600, { size: 28, weight: 900, color: P.voce, alpha: appear(t, t66 + 1.1, 0.4) });
        bigNum(ctx, '6', DPOS[1][0], 200, appear(t, t6 + 0.8, 0.4), { size: 104, color: P.fgts });
        text(ctx, 'seu, mas guardado', DPOS[1][0], 600, { size: 26, weight: 900, color: P.fgts, alpha: appear(t, tGuard, 0.4) });
        bigNum(ctx, '28', DPOS[2][0], 200, appear(t, t28 + 0.9, 0.4), { size: 104, color: P.inss });
        text(ctx, 'INSS e folha', DPOS[2][0], 590, { size: 28, weight: 900, color: P.inss, alpha: appear(t, t28 + 1.1, 0.4) });
        chip(ctx, DPOS[2][0], 630, 'uns 7 saem do seu holerite', P.inss, appear(t, tParte, 0.4), { size: 22 });
        chip(ctx, DPOS[2][0], 672, 'uns 21 a empresa paga direto', P.inss, appear(t, tMaior, 0.4), { size: 22 });
        chip(ctx, 2960, 672, 'imposto de renda: 0', P.ir, appear(t, tIR, 0.4), { size: 26 });
        ctx.restore();
      });
      luzinhas(ctx, cam2, t, 11, 8);
    },
    overlay(ctx, t) { source(ctx, 'Lei 8.212/1991; Lei 8.036/1990; conta do canal', vis(t, tAlem, 99, 0.5, 0.4)); },
  };
}

// ================================================================ Cena 06: para onde vai (aposentados, casas que já devem, o rotativo do cartão)
function scene06(K) {
  const tE = K('E depois que o dinheiro cai'), tOnde = K('para onde ele vai'), t112 = K('Uns cento e doze bilhões'), tApos = K('são de aposentados e pensionistas'), tAntes = K('Os do INSS receberam antes este ano'), tAbr = K('adiantado para abril e maio');
  const tLado = K('Do lado de quem trabalha'), tDeve = K('numa casa que já deve'), tOut = K('Em outubro'), t8 = K('oito em cada dez famílias'), t3 = K('quase três em cada dez'), tAtr = K('estavam com conta atrasada'), tCNC = K('segundo a Confederação Nacional do Comércio');
  const tBH = K('Em Belo Horizonte'), tUFMG = K('uma pesquisa da UFMG'), tPagar = K('pagar dívidas é o destino mais citado');
  const tCara = K('A dívida mais cara do país'), tRot = K('é o rotativo do cartão'), tSet = K('que em setembro cobrava'), t450 = K('mais de quatrocentos e cinquenta por cento'), tBC = K('segundo o Banco Central');
  const tPresas = K('Para as famílias presas nele'), tFatia = K('uma fatia grande da gratificação'), tJuros = K('vai direto para os juros');
  const cam = [
    { t: 0, x: 960, y: 480, z: 1.02, dx: 3 }, { t: t112, x: 960, y: 420, z: 1.08, d: 1.6 }, { t: tAntes, x: 1000, y: 520, z: 1.06, d: 1.6 },
    { t: tLado - 0.4, x: 2400, y: 480, z: 1.0, d: 1.6 }, { t: t8, x: 2300, y: 460, z: 1.06, d: 1.6 }, { t: tBH - 0.4, x: 2700, y: 470, z: 1.04, d: 1.8 },
    { t: tCara - 0.4, x: 3800, y: 480, z: 1.0, d: 1.6 }, { t: t450, x: 3740, y: 430, z: 1.12, d: 1.6 }, { t: tFatia, x: 3900, y: 480, z: 1.04, d: 1.8, dx: 3 },
  ];
  const sfx = [[tE, 'notas', 0.4], [tOnde, 'pop', 0.3], [t112, 'pop', 0.35], [tAntes, 'paper', 0.35], [tAbr, 'tick', 0.4], [tAbr + 0.6, 'tick', 0.4],
    [tLado - 0.3, 'whoosh', 0.3], [tDeve, 'pop', 0.3], ...Array.from({ length: 8 }, (_, i) => [t8 + 0.3 + i * 0.12, 'tick', 0.25]), [tAtr, 'stamp', 0.4], [tAtr + 0.25, 'stamp', 0.35], [tAtr + 0.5, 'stamp', 0.35],
    [tBH, 'paper', 0.35], [tPagar, 'ding', 0.35], [tCara - 0.3, 'whoosh', 0.3], [tRot, 'paper', 0.4], [t450, 'hit', 0.5], [tFatia, 'notas', 0.4, { dur: 1.4 }], [tJuros, 'drop', 0.4]];
  return {
    accent: P.juros, cam, sfx, impacts: [t450], trans: 'push',
    draw(ctx, t, cam2) {
      escritorioFundo(ctx, cam2, 0.95, 0.15);
      zone(ctx, cam2, 900, 1050, () => {
        if (t > tLado + 0.6) return;
        const k = vis(t, 0, tLado, 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        headline(ctx, 'para onde ele vai?', 960, 160, { size: 70, k: appear(t, tE, 0.5), hl: '#7f1d1d' });
        envelopePag(ctx, 960, 560, 0.8, { notas: 1, a: vis(t, tE, t112 - 0.3, 0.5, 0.4), rot: -0.03 });
        // a barra dos R$ 399 bi com a fatia dos aposentados acesa (28%)
        const kb = appear(t, t112 - 0.4, 0.6), X0 = 300, w = 1320;
        if (kb > 0) {
          fillRR(ctx, X0, 300, w * ease.out(kb), 90, 16, '#334155');
          const ka = appear(t, t112, 0.6); fillRR(ctx, X0, 300, w * 0.28 * ease.out(ka), 90, 16, '#a78bfa');
          text(ctx, 'R$ 399 bi', X0 + w - 24, 345, { size: 34, weight: 900, color: '#e2e8f0', align: 'right', alpha: kb });
          text(ctx, 'R$ 112 bi', X0 + 24, 345, { size: 34, weight: 900, color: '#1e1b4b', align: 'left', alpha: ka });
          chip(ctx, X0 + w * 0.14 + 140, 450, 'aposentados e pensionistas', '#c4b5fd', appear(t, tApos, 0.4), { size: 28 });
        }
        calendario(ctx, 760, 640, 0.66, { nome: 'ABRIL', ano: 2026, dias: 30, inicio: 3, marcas: {} }, { rot: -0.04, a: appear(t, tAntes, 0.5), cor: '#6d28d9', key: 'abr' });
        calendario(ctx, 1180, 640, 0.66, { nome: 'MAIO', ano: 2026, dias: 31, inicio: 5, marcas: {} }, { rot: 0.03, a: appear(t, tAntes + 0.3, 0.5), cor: '#6d28d9', key: 'mai' });
        check(ctx, 760, 660, 2.2, P.voce, prog(t, tAbr, 0.4)); check(ctx, 1180, 660, 2.2, P.voce, prog(t, tAbr + 0.6, 0.4));
        chip(ctx, 1560, 560, 'o 13º do INSS saiu antes', '#c4b5fd', appear(t, tAbr + 0.8, 0.4), { size: 24 });
        ctx.restore();
      });
      zone(ctx, cam2, 2200, 2800, () => {
        if (t < tLado - 0.8 || t > tCara + 0.6) return;
        const k = vis(t, tLado - 0.3, tCara, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        for (let i = 0; i < 10; i++) {
          const col = i % 5, row = Math.floor(i / 5), x = 1800 + col * 215, y = 280 + row * 240;
          casa(ctx, x, y, 1.4, '#cbd5e1', { a: appear(t, tLado + i * 0.05, 0.3), divida: i < 8 ? prog(t, t8 + 0.3 + i * 0.12, 0.3) : 0, atraso: [1, 4, 7].includes(i) ? appear(t, tAtr + [1, 4, 7].indexOf(i) * 0.25, 0.3) : 0 });
        }
        text(ctx, '8 em 10 famílias com dívida', 2230, 700, { size: 34, weight: 900, color: '#fca5a5', alpha: appear(t, t8 + 0.4, 0.4) });
        text(ctx, 'quase 3 em 10 com conta atrasada', 2230, 752, { size: 30, weight: 900, color: '#f87171', alpha: appear(t, tAtr + 0.3, 0.4) });
        // Belo Horizonte: o destino mais citado para o 13º
        const kh = appear(t, tBH + 0.8, 0.5);
        if (kh > 0) {
          ctx.save(); ctx.globalAlpha *= kh; ctx.translate(3060, 470);
          ctx.save(); papelSombra(ctx); fillRR(ctx, -240, -260, 480, 520, 22, '#f8fafc'); ctx.restore();
          text(ctx, 'Para que vai o 13º?', 0, -210, { size: 30, weight: 900, color: '#1f2937' });
          text(ctx, 'Belo Horizonte · Ipead/UFMG', 0, -170, { size: 20, weight: 800, color: '#6b7280' });
          const kp = appear(t, tPagar, 0.6);
          fillRR(ctx, -200, -110, 400, 110, 16, hexA('#ef4444', 0.15 + 0.2 * kp)); text(ctx, '1º', -160, -55, { size: 46, weight: 900, color: '#b91c1c' });
          text(ctx, 'pagar contas e dívidas', -110, -70, { size: 26, weight: 900, color: '#1f2937', align: 'left' }); text(ctx, '24,8% das respostas', -110, -36, { size: 22, weight: 800, color: '#b91c1c', align: 'left' });
          text(ctx, '2º', -160, 60, { size: 40, weight: 900, color: '#6b7280' }); text(ctx, 'poupar · 17,1%', -110, 60, { size: 24, weight: 800, color: '#6b7280', align: 'left' });
          ctx.restore();
        }
        ctx.restore();
      });
      zone(ctx, cam2, 3700, 4000, () => {
        if (t < tCara - 0.8) return;
        const k = appear(t, tCara - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        sombraChao(ctx, 3640, 820, 340);
        fatura(ctx, 3640, 470, 0.72, { hl: prog(t, tRot, 0.6), juros: t > tSet ? '15,3% ao mês' : '—', cet: appear(t, t450, 0.4) });
        cartaoCredito(ctx, 3340, 620, 0.55);
        bigNum(ctx, '451,7% ao ano', 4230, 250, appear(t, t450, 0.5), { size: 80, color: P.juros });
        chip(ctx, 4230, 340, 'rotativo do cartão · setembro', '#fda4af', appear(t, tSet, 0.4), { size: 26 });
        chip(ctx, 3640, 110, 'fatura de exemplo', '#94a3b8', vis(t, tRot, tFatia, 0.4, 0.4), { size: 22 });
        // as notas saem do envelope do 13º e escorrem para a linha dos juros
        envelopePag(ctx, 4380, 610, 0.62, { notas: 1, a: appear(t, tPresas, 0.5) });
        for (let i = 0; i < 6; i++) {
          const p = prog(t, tFatia + i * 0.35, 1.0); if (p <= 0 || p >= 1) continue;
          notaCem(ctx, lerp(4300, 3700, ease.inOut(p)), lerp(540, 600, ease.inOut(p)) - Math.sin(p * Math.PI) * 140, 0.42, { rot: lerp(0.1, -0.5, p), a: 1 - ease.in(p) * 0.8 });
        }
        chip(ctx, 4380, 770, 'uma fatia vai direto para os juros', P.juros, appear(t, tJuros, 0.4), { size: 26 });
        ctx.restore();
      });
      luzinhas(ctx, cam2, t, 13, 9);
    },
    overlay(ctx, t) {
      source(ctx, 'Dieese; Secom (13º do INSS em abril e maio)', vis(t, t112, tLado, 0.5, 0.4));
      source(ctx, 'CNC (Peic, outubro de 2026)', vis(t, tOut, tBH, 0.5, 0.4));
      source(ctx, 'Ipead/UFMG (2026)', vis(t, tBH, tCara, 0.5, 0.4));
      source(ctx, 'Banco Central (setembro de 2026)', vis(t, t450, 99, 0.5, 0.4));
    },
  };
}

// ================================================================ Cena 07: quem fica de fora (quem recebe x quem não recebe, a fila dos informais)
function scene07(K) {
  const tTem = K('Tem gente que não vê nada disso'), tCart = K('O décimo terceiro é de quem tem carteira assinada'), tServ = K('de servidor público'), tApos = K('e de aposentado ou pensionista do INSS');
  const tConta = K('Trabalhador por conta própria'), tCnpj = K('com ou sem CNPJ'), tNao = K('não recebe'), tSem = K('Nem quem trabalha sem carteira');
  const tIbge = K('Pelos números do IBGE'), t39 = K('quase trinta e nove milhões de brasileiros'), tInf = K('estão na informalidade'), tTerco = K('mais de um terço de todos os ocupados');
  const tDez = K('Para eles, dezembro tem as mesmas contas'), tNenhum = K('e nenhum salário a mais'), tEngana = K('Por isso o total do Dieese engana um pouco'), tTodo = K('não é todo mundo que trabalha');
  const cam = [
    { t: 0, x: 960, y: 470, z: 1.0, dx: 3 }, { t: tCart, x: 760, y: 380, z: 1.1, d: 1.6, dx: 4 }, { t: tConta - 0.9, x: 960, y: 500, z: 1.06, d: 1.6 },
    { t: tIbge - 0.4, x: 2400, y: 480, z: 1.0, d: 1.6 }, { t: tTerco, x: 2400, y: 470, z: 1.06, d: 1.6 }, { t: tDez, x: 2900, y: 480, z: 1.06, d: 1.8 }, { t: tEngana, x: 2700, y: 480, z: 1.0, d: 1.8, dz: 0.004 },
  ];
  const sfx = [[tTem, 'pop', 0.3], [tCart, 'paper', 0.35], [tCart + 0.5, 'ding', 0.3], [tServ, 'ding', 0.3], [tApos, 'ding', 0.3], [tConta, 'pop', 0.3], [tNao, 'drop', 0.35], [tSem, 'drop', 0.3],
    [tIbge - 0.3, 'whoosh', 0.3], ...Array.from({ length: 9 }, (_, i) => [tInf + i * 0.08, 'tick', 0.22]), [tTerco, 'pop', 0.35], [tDez, 'paper', 0.35], [tNenhum, 'drop', 0.35], [tEngana, 'pop', 0.3]];
  // 24 bonecos: 9 cinza = 37,5% dos ocupados na informalidade
  const INF = new Set([2, 5, 7, 10, 13, 15, 18, 20, 23]);
  return {
    accent: '#94a3b8', cam, sfx, impacts: [], trans: 'push',
    draw(ctx, t, cam2) {
      escritorioFundo(ctx, cam2, 0.95, 0.2);
      zone(ctx, cam2, 700, 1100, () => {
        if (t > tIbge + 0.6) return;
        const k = vis(t, 0, tIbge, 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        headline(ctx, 'tem gente que não vê nada disso', 960, 300, { size: 64, k: vis(t, tTem, tCart, 0.5, 0.4), hl: '#334155' });
        text(ctx, 'recebem 13º', 960, 150, { size: 40, weight: 900, color: P.voce, alpha: appear(t, tCart, 0.4) });
        carteiraTrab(ctx, 520, 330, 0.75, { a: appear(t, tCart, 0.5) }); check(ctx, 640, 470, 1.2, P.voce, prog(t, tCart + 0.5, 0.4));
        cracha(ctx, 960, 350, 0.62, { a: appear(t, tServ, 0.5) }); check(ctx, 1080, 470, 1.2, P.voce, prog(t, tServ + 0.3, 0.4));
        cartaoINSS(ctx, 1400, 340, 0.62, { a: appear(t, tApos, 0.5) }); check(ctx, 1540, 470, 1.2, P.voce, prog(t, tApos + 0.4, 0.4));
        // não recebem
        ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(360, 540, 1200, 3);
        maleta(ctx, 720, 630, 0.6, { a: appear(t, tConta, 0.5) }); xMark(ctx, 900, 600, 1.2, '#ef4444', prog(t, tNao, 0.4));
        text(ctx, 'por conta própria', 720, 760, { size: 28, weight: 900, color: '#fca5a5', alpha: appear(t, tConta + 0.3, 0.4) });
        text(ctx, 'com ou sem CNPJ', 720, 796, { size: 22, weight: 800, color: '#fde68a', alpha: appear(t, tCnpj, 0.4) });
        pessoa(ctx, 1220, 640, 1.4, '#94a3b8', appear(t, tSem, 0.5)); xMark(ctx, 1340, 600, 1.2, '#ef4444', prog(t, tSem + 0.4, 0.4));
        text(ctx, 'sem carteira', 1220, 760, { size: 28, weight: 900, color: '#fca5a5', alpha: appear(t, tSem + 0.3, 0.4) });
        ctx.restore();
      });
      zone(ctx, cam2, 2300, 2950, () => {
        if (t < tIbge - 0.8) return;
        const k = appear(t, tIbge - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        for (let i = 0; i < 24; i++) {
          const col = i % 8, row = Math.floor(i / 8), cinza = INF.has(i) && t > tInf + Array.from(INF).indexOf(i) * 0.08;
          pessoa(ctx, 2020 + col * 90, 270 + row * 135, 1.0, cinza ? '#475569' : '#4ade80', appear(t, tIbge + i * 0.03, 0.3));
        }
        bigNum(ctx, '38,8 milhões', 2335, 700, appear(t, t39, 0.5), { size: 64, color: '#cbd5e1' });
        chip(ctx, 2335, 150, 'mais de 1 em cada 3 ocupados · sem 13º', '#cbd5e1', vis(t, tTerco, tEngana, 0.4, 0.3), { size: 26 });
        // dezembro de quem não recebe: as mesmas contas, nenhum envelope
        const kd = appear(t, tDez, 0.5);
        if (kd > 0) {
          calendario(ctx, 3060, 420, 0.62, { nome: 'DEZEMBRO', ano: 2026, dias: 31, inicio: 2, marcas: {} }, { rot: 0.03, a: kd, key: 'dez7' });
          for (let i = 0; i < 3; i++) { ctx.save(); ctx.globalAlpha *= appear(t, tDez + 0.5 + i * 0.2, 0.3); ctx.translate(2930 + i * 120, 630); ctx.rotate(-0.1 + i * 0.1); ctx.save(); papelSombra(ctx); ctx.fillStyle = '#fff7ed'; ctx.fillRect(-50, -60, 100, 120); ctx.restore(); text(ctx, ['luz', 'água', 'aluguel'][i], 0, -30, { size: 20, weight: 900, color: '#7c2d12' }); ctx.fillStyle = 'rgba(124,45,18,0.4)'; for (let j = 0; j < 4; j++) ctx.fillRect(-36, -6 + j * 14, 72, 5); ctx.restore(); }
          chip(ctx, 3060, 770, 'nenhum salário a mais', '#fca5a5', appear(t, tNenhum, 0.4), { size: 28 });
        }
        chip(ctx, 2600, 150, 'R$ 399 bi do Dieese: só para quem tem direito', P.amber, appear(t, tEngana + 0.2, 0.4), { size: 26 });
        ctx.restore();
      });
      luzinhas(ctx, cam2, t, 15, 8);
    },
    overlay(ctx, t) { source(ctx, 'IBGE, Pnad (trimestre até setembro de 2026)', vis(t, tIbge, 99, 0.5, 0.4)); },
  };
}

// ================================================================ Cena 08: o que conferir (a linha do IR, o RH, o FGTS no celular, a dívida mais cara)
function scene08(K) {
  const tQue = K('O que dá pra fazer com isso'), tQuando = K('Quando a segunda parcela cair'), tAbre = K('abre o holerite'), tDentro = K('Se você está dentro da faixa isenta'), tZer = K('tem que vir zerada');
  const tVier = K('Se vier desconto'), tRH = K('pergunta no RH'), tErro = K('pode ser erro'), tMedia = K('ou a média das horas extras'), tLevou = K('levou o valor para cima do limite');
  const tFgts = K('Depois, confere o FGTS no aplicativo'), tDep = K('o depósito sobre o décimo terceiro'), tJan = K('tem que aparecer até janeiro'), tDiv = K('E se uma parte do dinheiro for para dívida'), tCara = K('começa pela mais cara');
  const cam = [
    { t: 0, x: 960, y: 480, z: 1.0, dx: 3 }, { t: tDentro, x: 800, y: 380, z: 1.35, d: 1.6 }, { t: tVier, x: 1060, y: 450, z: 1.04, d: 1.6 }, { t: tMedia, x: 1300, y: 480, z: 1.08, d: 1.6 },
    { t: tFgts - 0.4, x: 2400, y: 480, z: 1.0, d: 1.6 }, { t: tDep, x: 2340, y: 440, z: 1.12, d: 1.6 },
    { t: tDiv - 0.4, x: 3800, y: 480, z: 1.0, d: 1.6 }, { t: tCara, x: 3780, y: 420, z: 1.1, d: 1.6 },
  ];
  const sfx = [[tQue, 'pop', 0.3], [tAbre, 'paper', 0.45, { dur: 0.5 }], [tZer, 'tick', 0.35], [tZer + 0.3, 'ding', 0.35], [tVier, 'pop', 0.3], [tRH, 'pop', 0.35], [tErro, 'pop', 0.3], [tMedia, 'clock', 0.3, { n: 4, step: 0.22 }], [tLevou, 'riser', 0.25, { dur: 0.8 }],
    [tFgts - 0.3, 'whoosh', 0.3], [tFgts + 0.3, 'tap', 0.45], [tDep, 'tap', 0.4], [tDep + 0.3, 'ding', 0.35], [tJan, 'pop', 0.3], [tDiv - 0.3, 'whoosh', 0.3], [tCara, 'hit', 0.4]];
  return {
    accent: P.voce, cam, sfx, impacts: [tCara], trans: 'push',
    draw(ctx, t, cam2) {
      escritorioFundo(ctx, cam2, 0.95);
      zone(ctx, cam2, 750, 1350, () => {
        if (t > tFgts + 0.6) return;
        const k = vis(t, 0, tFgts, 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        headline(ctx, 'o que conferir', 1420, 300, { size: 66, k: vis(t, tQue, tDentro, 0.5, 0.4), hl: '#14532d' });
        const ka = appear(t, tQuando, 0.6);
        sombraChao(ctx, 760, 820, 340);
        holerite(ctx, 760, 440 + (1 - ease.out(ka)) * 80, 0.56, { a: clamp(ka * 2), rows: rows13(), totV: '5.000,00', totD: '501,51', liq: '4.498,49', hlRow: 2, circ: prog(t, tZer, 0.8), key: 'c8' });
        const yIR = 440 + HOL.rowY(2) * 0.56;
        check(ctx, 1110, yIR, 1.1, P.voce, prog(t, tZer + 0.3, 0.4));
        chip(ctx, 1060, yIR - 70, 'tem que vir 0,00', P.voce, vis(t, tZer, tVier, 0.4, 0.4), { size: 24 });
        // se vier desconto: o RH, e as duas explicações
        const kr = appear(t, tRH, 0.4);
        if (kr > 0) {
          ctx.save(); ctx.globalAlpha *= kr; ctx.translate(1450, 300);
          ctx.save(); papelSombra(ctx); fillRR(ctx, -200, -80, 400, 160, 30, '#f8fafc'); ctx.restore();
          ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.moveTo(-140, 70); ctx.lineTo(-190, 130); ctx.lineTo(-90, 76); ctx.closePath(); ctx.fill();
          text(ctx, 'pergunta no RH', 0, 0, { size: 40, weight: 900, color: '#1f2937' });
          ctx.restore();
        }
        chip(ctx, 1450, 470, 'pode ser erro', '#fca5a5', appear(t, tErro, 0.4), { size: 28 });
        // a média das horas extras empurra o valor para cima do limite
        const km = appear(t, tMedia, 0.5);
        if (km > 0) {
          ctx.save(); ctx.globalAlpha *= km;
          const bx = 1300, by = 820, hBase = 190, hExtra = 70 * ease.out(prog(t, tLevou, 0.8)), lim = 200;
          fillRR(ctx, bx, by - hBase, 110, hBase, 8, '#4ade80'); fillRR(ctx, bx, by - hBase - hExtra, 110, hExtra, 8, '#fbbf24');
          ctx.setLineDash([12, 8]); ctx.strokeStyle = '#f8fafc'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(bx - 40, by - lim); ctx.lineTo(bx + 330, by - lim); ctx.stroke(); ctx.setLineDash([]);
          text(ctx, 'limite de R$ 5 mil', bx + 340, by - lim, { size: 22, weight: 900, color: '#f8fafc', align: 'left' });
          text(ctx, '+ média das horas extras', bx + 130, by - hBase - 40, { size: 22, weight: 900, color: '#fde68a', align: 'left', alpha: appear(t, tLevou, 0.4) });
          ctx.restore();
        }
        ctx.restore();
      });
      zone(ctx, cam2, 2300, 2500, () => {
        if (t < tFgts - 0.8 || t > tDiv + 0.6) return;
        const k = vis(t, tFgts - 0.3, tDiv, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        celularFGTS(ctx, 2280, 470, 0.95, t, { dep: appear(t, tDep, 0.5), brilho: 0.5 + 0.5 * Math.sin(t * 4) });
        chip(ctx, 2760, 420, 'depósito do 13º: até janeiro', P.fgts, appear(t, tJan, 0.4), { size: 28 });
        chip(ctx, 2760, 330, 'confira no aplicativo do FGTS', P.fgts, appear(t, tFgts + 0.4, 0.4), { size: 24 });
        ctx.restore();
      });
      zone(ctx, cam2, 3700, 3900, () => {
        if (t < tDiv - 0.8) return;
        const k = appear(t, tDiv - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k; ctx.translate(3780, 470);
        ctx.save(); papelSombra(ctx); fillRR(ctx, -360, -300, 720, 600, 24, '#f8fafc'); ctx.restore();
        text(ctx, 'minhas dívidas', 0, -240, { size: 38, weight: 900, color: '#1f2937' });
        text(ctx, 'da mais cara para a mais barata', 0, -196, { size: 22, weight: 800, color: '#6b7280' });
        const lst = [['cartão de crédito (rotativo)', '#dc2626'], ['cheque especial', '#ea580c'], ['empréstimo pessoal', '#ca8a04'], ['consignado', '#65a30d']];
        lst.forEach(([d, c], i) => { const yy = -110 + i * 100, ki = appear(t, tDiv + 0.3 + i * 0.2, 0.3); ctx.save(); ctx.globalAlpha *= ki; fillRR(ctx, -320, yy - 38, 640, 76, 14, hexA(c, i === 0 ? 0.22 : 0.1)); circle(ctx, -280, yy, 16, c); text(ctx, d, -240, yy, { size: 30, weight: 900, color: '#1f2937', align: 'left' }); ctx.restore(); });
        ctx.restore();
        chip(ctx, 4320, 360, 'comece por aqui', '#dc2626', appear(t, tCara, 0.4), { size: 28 });
        arrow(ctx, 4320, 395, 4190, 360, '#dc2626', 7, appear(t, tCara + 0.2, 0.4));
        ctx.restore();
      });
      luzinhas(ctx, cam2, t, 17, 8);
    },
    overlay(ctx, t) { source(ctx, 'Banco Central (juros por modalidade)', vis(t, tDiv, 99, 0.5, 0.4)); },
  };
}

// ================================================================ Cena 09: fechamento (o resumo, a manchete de 1962 de novo, a inscrição no relógio de ponto, o IPVA)
function scene09(K) {
  const tEntao = K('Então, quando o seu décimo terceiro cair'), tMaior = K('ele é maior do que parece'), tEmp = K('A empresa gasta bem mais do que você recebe'), tINSS = K('a maior parte da diferença vai para o INSS');
  const tEste = K('Este ano, para quem ganha até cinco mil'), tSaiu = K('o imposto de renda saiu da conta'), tJuros = K('ainda disputa espaço com os juros');
  const tDes = K('Aquele desastre para o país de 1962'), tVirou = K('virou o maior dinheiro extra do ano'), tMetade = K('para quase metade dos brasileiros');
  const tSe = K('Se esse vídeo te ajudou'), tInsc = K('se inscreve no canal'), tProx = K('No próximo'), tGar = K('vai pra garagem'), tIpva = K('em janeiro chega o IPVA'), tMet = K('e metade dele nem fica com o estado'), tAbre = K('A gente abre o boleto'), tCada = K('quem fica com cada real'), tAte = K('Até lá');
  const tPress = tInsc + 0.35;
  const cam = [
    { t: 0, x: 960, y: 480, z: 1.02, dx: 3 }, { t: tEmp, x: 1000, y: 500, z: 1.06, d: 1.6 }, { t: tJuros, x: 960, y: 480, z: 1.02, d: 1.4 },
    { t: tDes - 0.4, x: 2400, y: 470, z: 1.0, d: 1.6 }, { t: tVirou, x: 2400, y: 500, z: 1.08, d: 1.8 },
    { t: tSe - 0.4, x: 3800, y: 480, z: 1.0, d: 1.6 }, { t: tInsc, x: 3800, y: 520, z: 1.14, d: 1.0 }, { t: tPress + 1.4, x: 3800, y: 480, z: 1.02, d: 1.4 },
    { t: tProx - 0.3, x: 5200, y: 480, z: 1.0, d: 1.6, dx: 3 }, { t: tMet, x: 5200, y: 520, z: 1.08, d: 1.6 }, { t: tCada, x: 5200, y: 480, z: 1.03, d: 2.4, dz: 0.003 },
  ];
  const sfx = [[tEntao, 'pop', 0.3], [tMaior, 'riser', 0.25, { dur: 0.8 }], [tEmp, 'contadora', 0.3, { dur: 0.8 }], [tINSS, 'pop', 0.35], [tSaiu, 'tick', 0.4], [tJuros, 'drop', 0.3],
    [tDes - 0.3, 'whoosh', 0.3], [tDes + 0.2, 'paper', 0.4], [tVirou, 'typewriter', 0.4, { n: 14, bell: true }], [tMetade, 'pop', 0.35],
    [tSe - 0.3, 'whoosh', 0.3], [tInsc - 0.2, 'paper', 0.35, { dur: 0.35 }], [tPress, 'ponto', 0.9], [tPress + 0.9, 'ding', 0.4],
    [tProx - 0.2, 'whoosh', 0.3], [tGar, 'clank', 0.3], [tIpva, 'paper', 0.4], [tMet, 'pop', 0.35], [tAbre, 'paper', 0.35], [tCada, 'coin', 0.45]];
  return {
    accent: P.voce, cam, sfx, impacts: [tPress + 0.07], trans: 'push',
    draw(ctx, t, cam2) {
      escritorioFundo(ctx, cam2, 0.95);
      zone(ctx, cam2, 900, 1100, () => {
        if (t > tDes + 0.6) return;
        const k = vis(t, 0, tDes, 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        sombraChao(ctx, 760, 760, 300);
        envelopePag(ctx, 760, 560, 0.95, { notas: 1, fantasma: prog(t, tMaior, 1.0) });
        chip(ctx, 760, 150, 'o custo do seu 13º: uns R$ 6,8 mil', P.inss, appear(t, tMaior + 0.4, 0.4), { size: 26 });
        // a barra dos R$ 100 do custo, de novo e rápida
        const X0 = 1220, w = 560, kb = [prog(t, tEmp, 0.5), prog(t, tEmp + 0.3, 0.4), prog(t, tEmp + 0.5, 0.5)];
        const seg = [[0.66, P.voce, '66 você'], [0.06, P.fgts, '6'], [0.28, P.inss, '28 INSS']];
        let x = X0;
        seg.forEach(([v, c, l], i) => { const ww = w * v * ease.out(kb[i]); if (ww > 0) { ctx.save(); if (i === 2 && t > tINSS) { ctx.shadowColor = hexA(c, 0.9); ctx.shadowBlur = 30 * (0.6 + 0.4 * Math.sin(t * 5)); } fillRR(ctx, x, 380, ww, 90, 10, c); ctx.restore(); if (kb[i] > 0.8 && i !== 1) text(ctx, l, x + w * v / 2, 425, { size: 28, weight: 900, color: '#0b1222' }); } x += w * v; });
        text(ctx, 'de cada R$ 100 do custo', X0 + w / 2, 330, { size: 28, weight: 900, color: '#e2e8f0', alpha: appear(t, tEmp, 0.4) });
        chip(ctx, X0 + w / 2, 540, 'imposto de renda: 0 (até R$ 5 mil)', P.voce, appear(t, tSaiu, 0.4), { size: 24 });
        chip(ctx, X0 + w / 2, 630, 'o que sobra disputa com os juros', P.juros, appear(t, tJuros, 0.4), { size: 24 });
        for (let i = 0; i < 3; i++) { const p = prog(t, tJuros + 0.2 + i * 0.4, 1.1); if (p > 0 && p < 1) notaCem(ctx, lerp(780, 1480, ease.inOut(p)), lerp(420, 700, ease.inOut(p)) - Math.sin(p * Math.PI) * 120, 0.4, { rot: lerp(-0.1, 0.5, p), a: 1 - ease.in(p) }); }
        ctx.restore();
      });
      zone(ctx, cam2, 2300, 2500, () => {
        if (t < tDes - 0.8 || t > tSe + 0.6) return;
        const k = vis(t, tDes - 0.3, tSe, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        sombraChao(ctx, 2400, 840, 520);
        jornalVelho(ctx, 2400, 450, 0.74, { key: '9' });
        // uma tira de papel colada por cima, datilografada com o que virou
        const kt = appear(t, tVirou - 0.2, 0.5);
        if (kt > 0) {
          ctx.save(); ctx.globalAlpha *= kt; ctx.translate(2420, 700); ctx.rotate(0.03);
          ctx.save(); papelSombra(ctx); ctx.fillStyle = '#fefce8'; ctx.fillRect(-430, -54, 860, 108); ctx.restore();
          ctx.fillStyle = 'rgba(253,230,138,0.65)'; ctx.fillRect(-470, -30, 70, 40); ctx.fillRect(400, -16, 70, 40);
          const s = '2026: o maior dinheiro extra do ano', n = Math.round(s.length * prog(t, tVirou, 1.6));
          ctx.font = MONO(36, 900); ctx.fillStyle = '#1e3a8a'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(s.slice(0, n), -ctx.measureText(s).width / 2, 2);
          ctx.restore();
        }
        chip(ctx, 2400, 110, 'para quase metade dos brasileiros', P.voce, appear(t, tMetade, 0.4), { size: 30 });
        ctx.restore();
      });
      zone(ctx, cam2, 3700, 3900, () => {
        if (t < tSe - 0.8 || t > tGar + 0.6) return;
        const k = vis(t, tSe - 0.3, tProx, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        const press = Math.sin(Math.PI * prog(t, tPress - 0.05, 0.3));
        // o cartão "INSCREVA-SE" desce até a fenda, o relógio carimba e ele volta com "INSCRITO"
        const down = ease.inOut(prog(t, tInsc - 0.3, 0.6)), up = ease.out(prog(t, tPress + 0.4, 0.6));
        const cy = lerp(160, 380, down) - up * 220;
        ctx.save(); ctx.beginPath(); ctx.rect(3500, -400, 600, 940 - 0 + (t < tPress + 0.3 ? 0 : 0)); ctx.clip();
        cartaoPonto(ctx, 3800, cy, 0.8, { marca: t > tPress ? 1 : 0, texto: 'INSCRITO', key: t > tPress ? 'b' : 'a' });
        ctx.restore();
        relogioPonto(ctx, 3800, 520, 0.95, { aperto: press, data: t > tPress ? '16 NOV  17:00' : '-- ---  --:--', hora: 5 });
        headline(ctx, t > tPress + 0.2 ? 'INSCRITO' : 'INSCREVA-SE', 4330, 300, { size: 64, k: appear(t, tSe + 0.4, 0.5), hl: t > tPress + 0.2 ? '#14532d' : '#7f1d1d' });
        sparks(ctx, t, tPress + 0.1, 3800, 460, P.amber, 18);
        ctx.restore();
      });
      zone(ctx, cam2, 5100, 5300, () => {
        if (t < tProx - 0.6) return;
        const k = appear(t, tProx - 0.2, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        sombraChao(ctx, 5200, 800, 480);
        boletoIPVA(ctx, 5200, 540, 1.15, { metade: prog(t, tMet, 1.0) });
        chaveCarro(ctx, 5640, 760, 0.7, 0.3);
        chip(ctx, 5200, 160, 'próximo vídeo: IPVA 2027', P.amber, appear(t, tProx, 0.4), { size: 30 });
        chip(ctx, 5200, 260, 'quem fica com cada real do boleto', '#c4b5fd', appear(t, tCada, 0.4), { size: 26 });
        ctx.restore();
      });
      luzinhas(ctx, cam2, t, 19, 9);
    },
    overlay(ctx, t) { source(ctx, 'Constituição, art. 158 (metade do IPVA é do município)', vis(t, tMet, tAte, 0.5, 0.4)); },
  };
}

export const SCENES = [
  { id: '01', name: 'o-13-quase-ficou-no-papel', build: scene01 },
  { id: '02', name: 'a-conta-basica', build: scene02 },
  { id: '03', name: 'o-holerite-aberto', build: scene03 },
  { id: '04', name: 'para-quem-muda', build: scene04 },
  { id: '05', name: 'o-que-a-empresa-paga', build: scene05 },
  { id: '06', name: 'para-onde-vai', build: scene06 },
  { id: '07', name: 'quem-fica-de-fora', build: scene07 },
  { id: '08', name: 'o-que-conferir', build: scene08 },
  { id: '09', name: 'fechamento', build: scene09 },
];
