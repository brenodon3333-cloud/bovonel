// Vídeo 11: pedágio sem cancela (free flow). Abre no futuro (janeiro, a mensagem no celular) e volta à descida da serra.
// Cada cena recebe K(frase) = instante (s, relativo à cena) em que a frase começa na narração.
// Palco: dentro do carro à noite, descendo a serra (painel, para-brisa, retrovisor com a tag, celular no suporte);
// cenas 1 e 9 em casa, em janeiro. Fio condutor: o celular, por onde chegam a cobrança, o site oficial e o golpe.
// Regras: câmera sempre andando, nada parado por mais de ~6 s, transições discretas, uma só de efeito (o flash do pórtico
// estoura a tela na entrada da cena 5, a virada), sem música, objetos genéricos sem marca, nenhum texto abaixo de y≈890.
import { W, H, C, clamp, lerp, prog, ease, appear, text, font, rr, fillRR, strokeRR, circle, hexA, source, iconTruck } from './lib.js';
import { glowText, counting, shockRing, sparks, layer, flash } from './fx.js';

// cores fixas do canal: empresa azul (concessionária), estado laranja (multa, órgão de trânsito), União vermelho (PIS e Cofins),
// prefeitura roxo (ISS), verde para "o jeito certo", rosa-escuro para o golpe
const P = {
  emp: '#3b82f6', fed: '#ef4444', iss: '#a855f7', multa: '#f59e0b', ok: '#22c55e', golpe: '#e11d48', gold: '#facc15', ouro2: '#d4a017',
  ink: '#1f2937', paper: '#fbfaf5', red: '#dc2626', amber: '#fbbf24', sky: '#38bdf8', voce: '#4ade80', aqui: '#a855f7', icms: '#f59e0b', fab: '#22c55e',
};
// os R$ 20,30 de um sentido (fontes.md): PIS e Cofins 3,65%, ISS de até 5% (exemplo com 5%), o resto fica com a concessionária
const T = { tarifa: 20.30, pis: 0.74, iss: 1.02 }; T.imp = T.pis + T.iss; T.emp = T.tarifa - T.imp;
const pct = (v) => (100 * v) / T.tarifa;

// ---- reaproveitado dos vídeos 09 e 10 (mesmo padrão visual)
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
function penCircle(ctx, x, y, rx, ry, color, k, lw = 7) {
  if (k <= 0) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.globalAlpha *= 0.92;
  ctx.beginPath(); const n = 60, end = 1.15 * clamp(k);
  for (let i = 0; i <= n * end; i++) { const a = -2.4 + (i / n) * 6.283, w = 1 + 0.05 * Math.sin(i * 0.3); const px = x + Math.cos(a) * rx * w, py = y + Math.sin(a) * ry * w + (i / n) * 6; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
  ctx.stroke(); ctx.restore();
}
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
function pessoa(ctx, x, y, s, cor, a = 1) {
  if (a <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= a; ctx.fillStyle = cor;
  ctx.beginPath(); ctx.arc(0, -46, 22, 0, 6.283); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-34, 50); ctx.lineTo(-34, 4); ctx.quadraticCurveTo(-34, -18, -12, -18); ctx.lineTo(12, -18); ctx.quadraticCurveTo(34, -18, 34, 4); ctx.lineTo(34, 50); ctx.closePath(); ctx.fill();
  ctx.restore();
}
let SALA = null;
function salaFundo(ctx, cam, a = 1, escuro = 0) {
  if (!SALA) {
    const Wd = 2600, Hd = 1400, r = rng(17);
    const c = document.createElement('canvas'); c.width = Wd; c.height = Hd; const g = c.getContext('2d');
    g.fillStyle = '#4a3328'; g.fillRect(0, 0, Wd, 920);
    for (let x = 0; x < Wd; x += 70) { g.fillStyle = (x / 70) % 2 ? '#523a2e' : '#4a3328'; g.fillRect(x, 0, 35, 920); }
    for (let y = 40; y < 900; y += 90) for (let x = 35; x < Wd; x += 140) { g.fillStyle = 'rgba(250,204,21,0.10)'; g.beginPath(); g.arc(x + 17, y, 6, 0, 6.283); g.fill(); }
    g.fillStyle = '#3a271e'; g.fillRect(0, 860, Wd, 60); g.fillStyle = '#2b1c15'; g.fillRect(0, 912, Wd, 10);
    // janela com a cidade à noite e cortinas vermelhas
    g.fillStyle = '#2b1c15'; g.fillRect(380, 150, 620, 520);
    const ng = g.createLinearGradient(0, 165, 0, 655); ng.addColorStop(0, '#0b1733'); ng.addColorStop(1, '#22365e'); g.fillStyle = ng; g.fillRect(395, 165, 590, 490);
    for (let i = 0; i < 9; i++) { const bx = 400 + i * 66, bh = 160 + r() * 260; g.fillStyle = '#121a2e'; g.fillRect(bx, 655 - bh, 58, bh); for (let yy = 655 - bh + 14; yy < 640; yy += 26) for (let xx = bx + 8; xx < bx + 50; xx += 16) if (r() > 0.55) { g.fillStyle = r() > 0.5 ? 'rgba(253,224,141,0.85)' : 'rgba(186,230,253,0.6)'; g.fillRect(xx, yy, 8, 12); } }
    g.fillStyle = '#2b1c15'; g.fillRect(686, 165, 10, 490); g.fillRect(395, 405, 590, 10);
    for (const [x0, dir] of [[300, 1], [1000, -1]]) { g.fillStyle = '#7f1d1d'; g.beginPath(); g.moveTo(x0, 120); g.lineTo(x0 + dir * 150, 120); g.quadraticCurveTo(x0 + dir * 90, 420, x0 + dir * 140, 720); g.lineTo(x0, 720); g.closePath(); g.fill(); g.fillStyle = 'rgba(0,0,0,0.25)'; for (let k = 1; k < 4; k++) g.fillRect(x0 + dir * k * 34, 130, 6, 580); }
    g.fillStyle = '#1f150f'; g.fillRect(260, 108, 900, 14);
    // estante com livros e porta-retrato
    g.fillStyle = '#5b3a24'; g.fillRect(1700, 220, 560, 640); g.fillStyle = '#3f2818'; for (let y = 300; y < 860; y += 140) g.fillRect(1700, y, 560, 14);
    for (let s2 = 0; s2 < 4; s2++) for (let x = 1720; x < 2240;) { const w = 18 + r() * 26, h = 70 + r() * 50; g.fillStyle = ['#1e3a8a', '#991b1b', '#ca8a04', '#065f46', '#e5e7eb', '#7c3aed'][Math.floor(r() * 6)]; g.fillRect(x, 300 + s2 * 140 - h, w, h); x += w + 3; if (r() > 0.85) x += 60; }
    // abajur aceso com o brilho quente
    const lg = g.createRadialGradient(1480, 520, 10, 1480, 520, 520); lg.addColorStop(0, 'rgba(253,186,116,0.45)'); lg.addColorStop(1, 'rgba(253,186,116,0)'); g.fillStyle = lg; g.fillRect(900, 0, 1200, 1100);
    g.fillStyle = '#fde68a'; g.beginPath(); g.moveTo(1420, 470); g.lineTo(1540, 470); g.lineTo(1510, 400); g.lineTo(1450, 400); g.closePath(); g.fill();
    g.fillStyle = '#3f2818'; g.fillRect(1475, 470, 10, 300); g.fillRect(1430, 770, 100, 14);
    // quadro na parede
    g.fillStyle = '#a16207'; g.fillRect(1180, 230, 200, 150); g.fillStyle = '#1e3a5f'; g.fillRect(1194, 244, 172, 122); g.fillStyle = '#365314'; g.beginPath(); g.moveTo(1194, 366); g.lineTo(1260, 300); g.lineTo(1310, 340); g.lineTo(1366, 290); g.lineTo(1366, 366); g.closePath(); g.fill();
    // sofá à esquerda
    g.fillStyle = '#334155'; rrPath(g, 20, 640, 340, 280, 40); g.fill(); g.fillStyle = '#3f4c63'; rrPath(g, 0, 720, 380, 200, 30); g.fill();
    // pisca-pisca de fio no alto
    g.strokeStyle = '#14532d'; g.lineWidth = 3; g.beginPath(); for (let x = 0; x <= Wd; x += 20) { const y = 70 + Math.abs(Math.sin(x / 260 * Math.PI)) * 50; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
    for (let x = 30; x < Wd; x += 65) { const y = 76 + Math.abs(Math.sin(x / 260 * Math.PI)) * 50, col = ['#ef4444', '#facc15', '#38bdf8', '#22c55e', '#f472b6'][Math.floor(x / 65) % 5]; const bg = g.createRadialGradient(x, y, 0, x, y, 30); bg.addColorStop(0, col); bg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = bg; g.fillRect(x - 30, y - 30, 60, 60); }
    // piso de madeira e tapete
    const fl = g.createLinearGradient(0, 920, 0, Hd); fl.addColorStop(0, '#6b4226'); fl.addColorStop(1, '#2e1b10'); g.fillStyle = fl; g.fillRect(0, 920, Wd, Hd - 920);
    g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 3; for (let y = 950; y < Hd; y += 46) { g.beginPath(); g.moveTo(0, y); g.lineTo(Wd, y); g.stroke(); }
    g.fillStyle = '#7f1d1d'; g.beginPath(); g.ellipse(1300, 1150, 900, 150, 0, 0, 6.283); g.fill(); g.strokeStyle = '#fbbf24'; g.lineWidth = 6; g.beginPath(); g.ellipse(1300, 1150, 860, 135, 0, 0, 6.283); g.stroke();
    const tmp = document.createElement('canvas'); tmp.width = Wd; tmp.height = Hd; const t2 = tmp.getContext('2d');
    t2.filter = 'blur(11px)'; for (const dx of [-Wd, 0, Wd]) t2.drawImage(c, dx, 0); SALA = tmp;
  }
  layer(ctx, cam, 0.35, () => {
    ctx.save(); ctx.globalAlpha *= a;
    const cx = cam.x - (cam.x - 960) * 0.65, k0 = Math.floor((cx - 1500 + 340) / 2600), k1 = Math.floor((cx + 1500 + 340) / 2600);
    for (let k = k0; k <= k1; k++) ctx.drawImage(SALA, -340 + k * 2600, -160);
    ctx.fillStyle = `rgba(8,6,14,${0.5 + 0.3 * escuro})`; ctx.fillRect(-340 + k0 * 2600, -160, (k1 - k0 + 1) * 2600, 1400);
    ctx.restore();
  });
}
function rrPath(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function bokeh(ctx, cam, t, seed = 1, n = 10, a = 0.12) {
  const r = rng(seed);
  layer(ctx, cam, 1.45, () => {
    for (let i = 0; i < n; i++) {
      const x = r() * 2600 - 340 + cam.x - 960, y = r() * 1000 - 60, rad = 22 + r() * 50, ph = r() * 6.28, col = ['#fde68a', '#fca5a5', '#bae6fd', '#bbf7d0'][i % 4];
      const g = ctx.createRadialGradient(x, y + Math.sin(t * 0.3 + ph) * 10, 0, x, y, rad);
      g.addColorStop(0, hexA(col, a * (0.55 + 0.45 * Math.sin(t * 0.8 + ph)))); g.addColorStop(1, hexA(col, 0));
      ctx.fillStyle = g; ctx.fillRect(x - rad, y - rad - 12, rad * 2, rad * 2 + 24);
    }
  });
}
function arvore(ctx, x, y, s, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  sombraChao(ctx, 0, 330, 360, 0.55);
  ctx.fillStyle = '#7c2d12'; ctx.fillRect(-34, 230, 68, 90); fillRR(ctx, -90, 300, 180, 50, 10, '#991b1b');
  const tiers = [[260, 330, 250], [90, 270, 230], [-70, 210, 210], [-220, 150, 190], [-350, 90, 160]];
  tiers.forEach(([yb, wb, hb], i) => {
    ctx.fillStyle = i % 2 ? '#166534' : '#15803d';
    ctx.beginPath(); ctx.moveTo(0, yb - hb);
    const n = 7; for (let k = 0; k <= n; k++) { const px = wb - (2 * wb * k) / n; ctx.lineTo(px, yb + (k % 2 ? -18 : 0)); }
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.beginPath(); ctx.moveTo(0, yb - hb); ctx.lineTo(wb * 0.15, yb - 6); ctx.lineTo(-wb * 0.2, yb - 6); ctx.closePath(); ctx.fill();
    // festão dourado
    ctx.strokeStyle = 'rgba(250,204,21,0.8)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-wb * 0.8, yb - hb * 0.35); ctx.quadraticCurveTo(0, yb - hb * 0.1, wb * 0.8, yb - hb * 0.45); ctx.stroke();
  });
  const cols = ['#ef4444', '#facc15', '#38bdf8', '#f472b6', '#a855f7']; const r = rng(4);
  for (let i = 0; i < 22; i++) { const yy = -420 + r() * 660, ww = 30 + (yy + 430) * 0.42; const bx = (r() - 0.5) * ww * 1.3; const cb = cols[i % 5]; circle(ctx, bx, yy, 15, cb); circle(ctx, bx - 5, yy - 5, 5, 'rgba(255,255,255,0.7)'); }
  for (let i = 0; i < 30; i++) { const yy = -440 + r() * 690, ww = 30 + (yy + 430) * 0.45, bx = (r() - 0.5) * ww * 1.5; const tw = 0.4 + 0.6 * Math.max(0, Math.sin(t * 2.2 + i * 1.7)); const g = ctx.createRadialGradient(bx, yy, 0, bx, yy, 22); g.addColorStop(0, hexA('#fef3c7', 0.9 * tw)); g.addColorStop(1, hexA('#fef3c7', 0)); ctx.fillStyle = g; ctx.fillRect(bx - 22, yy - 22, 44, 44); }
  ctx.save(); ctx.shadowColor = 'rgba(250,204,21,0.9)'; ctx.shadowBlur = 40; ctx.fillStyle = '#facc15'; ctx.beginPath(); for (let i = 0; i < 10; i++) { const ang = -1.571 + (i / 10) * 6.283, rr2 = i % 2 ? 20 : 48; ctx.lineTo(Math.cos(ang) * rr2, -600 + Math.sin(ang) * rr2); } ctx.closePath(); ctx.fill(); ctx.restore();
  ctx.restore();
}
function fitaX(x0, w, v) { return x0 + (w * v) / 100; }
function fita(ctx, x0, y, w, pedacos, o = {}) {
  const h = o.h || 44;
  ctx.save(); ctx.globalAlpha *= o.a ?? 1;
  for (const p of pedacos) {
    if ((p.al ?? 1) <= 0) continue;
    const g0 = (p.gapA ?? 0) * 5, g1 = (p.gapB ?? 0) * 5;
    const xa = fitaX(x0, w, p.a) + g0 + (p.dx || 0), xb = fitaX(x0, w, p.b) - g1 + (p.dx || 0), yy = y + (p.dy || 0);
    if (xb - xa < 1) continue;
    ctx.save(); ctx.globalAlpha *= p.al ?? 1;
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 6;
    const gr = ctx.createLinearGradient(0, yy - h / 2, 0, yy + h / 2); gr.addColorStop(0, '#fde68a'); gr.addColorStop(0.45, P.gold); gr.addColorStop(1, P.ouro2);
    ctx.fillStyle = gr; ctx.beginPath();
    const cutL = p.a === 0 && !o.semPontas, cutR = p.b === 100 && !o.semPontas;
    ctx.moveTo(xa - (cutL ? 22 : 0), yy - h / 2); ctx.lineTo(xb + (cutR ? 22 : 0), yy - h / 2);
    if (cutR) ctx.lineTo(xb + 6, yy); ctx.lineTo(xb + (cutR ? 22 : 0), yy + h / 2); ctx.lineTo(xa - (cutL ? 22 : 0), yy + h / 2);
    if (cutL) ctx.lineTo(xa - 6, yy); ctx.closePath(); ctx.fill(); ctx.restore();
    if (p.cor && (p.k ?? 0) > 0) { ctx.save(); ctx.clip(); ctx.globalAlpha *= clamp(p.k); const gc = ctx.createLinearGradient(0, yy - h / 2, 0, yy + h / 2); gc.addColorStop(0, hexA(p.cor, 0.85)); gc.addColorStop(1, p.cor); ctx.fillStyle = gc; ctx.fillRect(xa - 30, yy - h / 2, xb - xa + 60, h); ctx.restore(); }
    if (p.brilho) { ctx.save(); ctx.globalAlpha *= p.brilho; ctx.shadowColor = p.cor || P.gold; ctx.shadowBlur = 30; strokeRR(ctx, xa, yy - h / 2, xb - xa, h, 6, '#ffffff', 4); ctx.restore(); }
    ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.fillRect(xa, yy - h / 2 + 5, xb - xa, 5);
    ctx.restore();
  }
  // marcas de 10 em 10 (só na parte ainda inteira)
  if (o.marcas) { ctx.save(); ctx.globalAlpha *= o.marcas; for (let v = 0; v <= 100; v += 10) { const xm = fitaX(x0, w, v); ctx.fillStyle = 'rgba(80,50,0,0.55)'; ctx.fillRect(xm - 1.5, y + h / 2 - 14, 3, 14); if (v % 50 === 0 || o.numeros) text(ctx, String(v), xm, y + h / 2 + 18, { size: 18, weight: 800, color: '#fde68a' }); } ctx.restore(); }
  ctx.restore();
}
function rotuloFita(ctx, x, y, val, nome, cor, k, o = {}) {
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(k * 1.8); ctx.translate(x, y + (1 - ease.out(clamp(k))) * 16);
  glowText(ctx, val, 0, -8, { size: o.size || 46, weight: 900, color: cor, glow: hexA(cor, 0.5), blur: 24 });
  if (nome) text(ctx, nome, 0, Math.max(34, (o.size || 46) * 0.55 + 12), { size: o.sub || 22, weight: 900, color: '#e2e8f0' });
  if (o.exemplo) { ctx.font = font(o.size || 46, 900); const wv = ctx.measureText(val).width; fillRR(ctx, wv / 2 + 4, -36, 98, 30, 15, '#0b1222'); strokeRR(ctx, wv / 2 + 4, -36, 98, 30, 15, '#cbd5e1', 2); text(ctx, 'exemplo', wv / 2 + 53, -20, { size: 17, weight: 900, color: '#cbd5e1' }); }
  ctx.restore();
}
function tesoura(ctx, x, y, s, abre = 0.5, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const a = 0.08 + abre * 0.35;
  for (const d of [-1, 1]) {
    ctx.save(); ctx.rotate(d * a);
    const g = ctx.createLinearGradient(0, -8, 0, 8); g.addColorStop(0, '#f1f5f9'); g.addColorStop(1, '#94a3b8'); ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(150, -2 * d); ctx.lineTo(150, 4 * d); ctx.lineTo(0, 8); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = d > 0 ? '#dc2626' : '#b91c1c'; ctx.lineWidth = 14; ctx.beginPath(); ctx.ellipse(-60, d * 26, 40, 24, 0, 0, 6.283); ctx.stroke();
    ctx.restore();
  }
  circle(ctx, 0, 0, 8, '#475569');
  ctx.restore();
}
function predioGov(ctx, x, y, s, label, cor, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  sombraChao(ctx, 0, 120, 230, 0.5);
  ctx.fillStyle = '#e5e7eb'; ctx.beginPath(); ctx.moveTo(-200, -60); ctx.lineTo(0, -140); ctx.lineTo(200, -60); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#d1d5db'; ctx.fillRect(-190, -60, 380, 18);
  for (let i = 0; i < 6; i++) { ctx.fillStyle = '#f3f4f6'; ctx.fillRect(-170 + i * 64, -42, 26, 130); }
  ctx.fillStyle = '#9ca3af'; ctx.fillRect(-210, 88, 420, 14); ctx.fillRect(-230, 102, 460, 14);
  fillRR(ctx, -120, -112, 240, 40, 8, cor); text(ctx, label, 0, -91, { size: 26, weight: 900, color: '#0b1222', letter: 2 });
  ctx.restore();
}
function lupa(ctx, x, y, s, rot = 0.6) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.save(); ctx.globalAlpha *= 0.18; circle(ctx, 0, 0, 80, '#bae6fd'); ctx.restore();
  ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(0, 0, 80, 0, 6.283); ctx.stroke();
  fillRR(ctx, 86, -14, 140, 28, 12, '#7c2d12');
  ctx.restore();
}
function moedaLaranja(ctx, x, y, r, a = 1) { ctx.save(); ctx.globalAlpha *= a; circle(ctx, x, y, r, P.icms); circle(ctx, x, y, r * 0.75, '#fbbf24'); text(ctx, 'R$', x, y + 1, { size: r * 0.7, weight: 900, color: '#7c2d12' }); ctx.restore(); }
function celular(ctx, x, y, s, fn, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  ctx.save(); papelSombra(ctx); fillRR(ctx, -190, -380, 380, 760, 48, '#0f172a'); ctx.restore();
  fillRR(ctx, -170, -350, 340, 700, 30, '#f8fafc'); fillRR(ctx, -50, -366, 100, 12, 6, '#1e293b');
  ctx.save(); rr(ctx, -170, -350, 340, 700, 30); ctx.clip(); fn(ctx); ctx.restore();
  ctx.restore();
}
function sinalProibido(ctx, x, y, r, k) { if (k <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(k * 2); ctx.translate(x, y); ctx.scale(lerp(1.4, 1, ease.out(clamp(k))), lerp(1.4, 1, ease.out(clamp(k)))); ctx.strokeStyle = '#ef4444'; ctx.lineWidth = r * 0.16; ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.283); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-r * 0.7, -r * 0.7); ctx.lineTo(r * 0.7, r * 0.7); ctx.stroke(); ctx.restore(); }
function ampulheta(ctx, x, y, s, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#78350f'; ctx.fillRect(-70, -110, 140, 16); ctx.fillRect(-70, 94, 140, 16);
  ctx.strokeStyle = 'rgba(226,232,240,0.9)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-54, -94); ctx.quadraticCurveTo(-54, -10, 0, 0); ctx.quadraticCurveTo(-54, 10, -54, 94); ctx.moveTo(54, -94); ctx.quadraticCurveTo(54, -10, 0, 0); ctx.quadraticCurveTo(54, 10, 54, 94); ctx.stroke();
  const k = (t * 0.2) % 1; ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.moveTo(-44 * (1 - k), -80 + k * 70); ctx.lineTo(44 * (1 - k), -80 + k * 70); ctx.lineTo(0, -6); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-48, 90); ctx.lineTo(48, 90); ctx.lineTo(0, 90 - k * 70); ctx.closePath(); ctx.fill(); ctx.fillRect(-2, -6, 4, 96);
  ctx.restore();
}
function estradaNoite(ctx, x, y, w, h, t) {
  ctx.save(); ctx.translate(x, y);
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, '#0b1733'); g.addColorStop(0.45, '#1e293b'); g.addColorStop(1, '#111827'); ctx.fillStyle = g; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = '#1f2937'; ctx.beginPath(); ctx.moveTo(-60, -h * 0.05); ctx.lineTo(60, -h * 0.05); ctx.lineTo(w * 0.45, h / 2); ctx.lineTo(-w * 0.45, h / 2); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#fde68a'; ctx.lineWidth = 6; for (let i = 0; i < 8; i++) { const k = ((i / 8) + t * 0.35) % 1, k2 = k + 0.04; ctx.beginPath(); ctx.moveTo(0, lerp(-h * 0.05, h / 2, k * k)); ctx.lineTo(0, lerp(-h * 0.05, h / 2, k2 * k2)); ctx.stroke(); }
  ctx.restore();
}
function portico(ctx, x, y, s, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#94a3b8'; ctx.fillRect(-420, -200, 30, 420); ctx.fillRect(390, -200, 30, 420);
  ctx.save(); papelSombra(ctx); fillRR(ctx, -440, -260, 880, 80, 8, '#334155'); ctx.restore();
  for (const cx of [-200, 0, 200]) { fillRR(ctx, cx - 30, -180, 60, 34, 6, '#111827'); circle(ctx, cx, -163, 9, (Math.sin(t * 3 + cx) > 0.6) ? '#ef4444' : '#7f1d1d'); }
  text(ctx, 'PEDÁGIO SEM CANCELA', 0, -220, { size: 34, weight: 900, color: '#fde68a', letter: 3 });
  ctx.restore();
}
function envelopeMulta(ctx, x, y, s, k, rot = -0.1) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.globalAlpha *= clamp(k * 2);
  ctx.save(); papelSombra(ctx); ctx.fillStyle = '#f5f5f4'; ctx.fillRect(-180, -110, 360, 220); ctx.restore();
  ctx.strokeStyle = '#d6d3d1'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-180, -110); ctx.lineTo(0, 10); ctx.lineTo(180, -110); ctx.stroke();
  rectStamp(ctx, 40, 50, 210, 70, 'MULTA', '#dc2626', prog(k, 0.4, 0.6), -0.1, 40);
  ctx.restore();
}
function calMini(ctx, x, y, s, mes, dia, cor, k = 1, o = {}) { // folhinha de calendário com um dia circulado
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  ctx.save(); papelSombra(ctx); fillRR(ctx, -110, -120, 220, 240, 12, '#ffffff'); ctx.restore();
  ctx.fillStyle = cor; ctx.fillRect(-110, -120, 220, 60); text(ctx, mes, 0, -89, { size: 30, weight: 900, color: '#ffffff', letter: 3 });
  text(ctx, String(dia), 0, 30, { size: 96, weight: 900, color: P.ink });
  if (k > 0) penCircle(ctx, 0, 30, 70, 62, '#dc2626', k, 6);
  ctx.restore();
}
function console_(ctx, x, y, s, o = {}) { // console genérico (caixa preta com luz azul) e controle
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.rot || 0); ctx.globalAlpha *= o.a ?? 1;
  ctx.save(); papelSombra(ctx); fillRR(ctx, -170, -60, 340, 120, 18, '#111827'); ctx.restore();
  ctx.fillStyle = '#38bdf8'; ctx.fillRect(-150, 30, 300, 5); fillRR(ctx, 110, -40, 40, 12, 6, '#334155');
  ctx.save(); ctx.translate(40, 150); papelSombra(ctx); ctx.fillStyle = '#1f2937'; ctx.beginPath(); ctx.ellipse(-70, 10, 60, 40, -0.3, 0, 6.283); ctx.ellipse(70, 10, 60, 40, 0.3, 0, 6.283); ctx.fill(); fillRR(ctx, -80, -30, 160, 60, 26, '#1f2937'); ctx.restore();
  circle(ctx, -10, 150, 14, '#4b5563'); for (const [dx, dy, c] of [[100, 132, '#ef4444'], [124, 150, '#22c55e'], [100, 168, '#38bdf8'], [76, 150, '#facc15']]) circle(ctx, dx, dy, 8, c);
  ctx.restore();
}
const BRASIL = [[-74, -7.5], [-72.8, -5.1], [-70.5, -4.2], [-69.9, -1.1], [-69.4, 1.1], [-67.5, 2.0], [-66.8, 1.2], [-64.1, 1.9], [-63.4, 3.9], [-61.0, 4.5], [-60.0, 5.2], [-58.5, 1.3], [-56.5, 1.9], [-54.5, 2.3], [-52.9, 2.1], [-51.1, 4.4], [-50.0, 1.8], [-49.9, -0.3], [-48.5, -0.8], [-47.0, -0.7], [-44.5, -2.4], [-41.8, -2.9], [-39.0, -3.3], [-37.2, -4.8], [-35.2, -5.4], [-34.8, -7.5], [-35.1, -9.0], [-37.0, -11.0], [-38.5, -13.0], [-39.0, -15.6], [-39.6, -18.2], [-40.9, -21.9], [-42.0, -22.9], [-44.6, -23.3], [-47.0, -24.5], [-48.5, -26.0], [-48.6, -28.5], [-50.0, -30.0], [-51.0, -31.5], [-53.4, -33.7], [-53.5, -32.4], [-55.6, -30.9], [-57.6, -30.2], [-55.9, -28.2], [-54.6, -25.6], [-54.3, -24.0], [-55.8, -22.3], [-57.9, -22.0], [-57.6, -19.9], [-58.2, -16.3], [-60.2, -16.2], [-60.5, -13.8], [-62.8, -12.9], [-65.3, -11.3], [-66.0, -9.8], [-68.6, -11.1], [-70.5, -10.9], [-70.6, -9.5], [-72.9, -9.1]];
function carroLado(ctx, x, y, s, o = {}) {
  const cor = o.cor || '#dc2626';
  ctx.save(); ctx.translate(x, y); ctx.scale(o.flip ? -s : s, s); ctx.globalAlpha *= o.a ?? 1;
  sombraChao(ctx, 0, 88, 250, 0.5);
  ctx.save(); papelSombra(ctx);
  const g = ctx.createLinearGradient(0, -110, 0, 50); g.addColorStop(0, hexA(cor, 1)); g.addColorStop(1, '#1f2937');
  ctx.fillStyle = cor; ctx.beginPath(); ctx.moveTo(-222, 44); ctx.lineTo(-222, -14); ctx.quadraticCurveTo(-215, -58, -190, -66); ctx.lineTo(-150, -110); ctx.lineTo(40, -112); ctx.lineTo(118, -34); ctx.lineTo(200, -22); ctx.quadraticCurveTo(226, -14, 224, 18); ctx.lineTo(224, 44); ctx.closePath(); ctx.fill(); ctx.restore();
  ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(-222, 10, 446, 34);
  ctx.fillStyle = '#bcd7ee'; ctx.beginPath(); ctx.moveTo(-182, -62); ctx.lineTo(-146, -100); ctx.lineTo(-52, -101); ctx.lineTo(-52, -40); ctx.lineTo(-190, -40); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-40, -101); ctx.lineTo(34, -102); ctx.lineTo(94, -40); ctx.lineTo(-40, -40); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-46, -38); ctx.lineTo(-46, 20); ctx.moveTo(100, -30); ctx.lineTo(100, 20); ctx.stroke(); // portas
  fillRR(ctx, -20, -14, 34, 8, 4, 'rgba(0,0,0,0.4)'); fillRR(ctx, 120, -10, 30, 8, 4, 'rgba(0,0,0,0.4)'); // maçanetas
  fillRR(ctx, 196, -16, 26, 16, 6, '#fef3c7'); fillRR(ctx, -224, -12, 14, 22, 4, '#ef4444'); // farol e lanterna
  for (const wx of [-138, 138]) { circle(ctx, wx, 44, 46, '#111318'); circle(ctx, wx, 44, 24, '#9ca3af'); circle(ctx, wx, 44, 8, '#4b5563'); }
  ctx.restore();
}
function placa(ctx, x, y, s, letras = 'ABC1D23', o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  ctx.save(); papelSombra(ctx); fillRR(ctx, -200, -66, 400, 132, 12, '#f8fafc'); ctx.restore();
  strokeRR(ctx, -200, -66, 400, 132, 12, '#111827', 4);
  ctx.save(); rr(ctx, -200, -66, 400, 132, 12); ctx.clip(); ctx.fillStyle = '#1d4ed8'; ctx.fillRect(-200, -66, 400, 34); ctx.restore();
  text(ctx, 'BRASIL', 0, -48, { size: 20, weight: 900, color: '#ffffff', letter: 4 });
  ctx.fillStyle = '#16a34a'; ctx.fillRect(150, -60, 38, 22); ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.moveTo(169, -58); ctx.lineTo(186, -49); ctx.lineTo(169, -40); ctx.lineTo(152, -49); ctx.closePath(); ctx.fill(); circle(ctx, 169, -49, 5, '#1d4ed8');
  mono(ctx, letras, 0, 18, 70, '#111827', 'center', 900);
  ctx.restore();
}
function guincho(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  sombraChao(ctx, 0, 80, 300, 0.5);
  fillRR(ctx, -300, -10, 420, 40, 6, '#facc15'); fillRR(ctx, 130, -110, 150, 140, 16, '#facc15'); fillRR(ctx, 170, -90, 90, 50, 8, '#bcd7ee');
  for (const wx of [-220, 30, 200]) { circle(ctx, wx, 50, 36, '#111318'); circle(ctx, wx, 50, 14, '#9ca3af'); }
  fillRR(ctx, 180, -128, 50, 18, 6, '#f97316');
  ctx.restore();
  carroLado(ctx, x - 80 * s, y - 70 * s, s * 0.62, { cor: '#64748b', a: o.a ?? 1 });
}
function cone(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.save(); papelSombra(ctx); ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.moveTo(-120, 0); ctx.lineTo(120, 0); ctx.lineTo(104, 24); ctx.lineTo(-104, 24); ctx.closePath(); ctx.fill(); ctx.restore();
  const gc = ctx.createLinearGradient(-80, 0, 80, 0); gc.addColorStop(0, '#c2410c'); gc.addColorStop(0.45, '#fb923c'); gc.addColorStop(1, '#9a3412');
  ctx.fillStyle = gc; ctx.beginPath(); ctx.moveTo(-18, -330); ctx.lineTo(18, -330); ctx.lineTo(84, 0); ctx.lineTo(-84, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#f8fafc'; for (const [y0, y1] of [[-230, -180], [-110, -55]]) { const w0 = 18 + (y0 + 330) / 330 * 66, w1 = 18 + (y1 + 330) / 330 * 66; ctx.beginPath(); ctx.moveTo(-w0, y0); ctx.lineTo(w0, y0); ctx.lineTo(w1, y1); ctx.lineTo(-w1, y1); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}
function cavalete(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  sombraChao(ctx, 0, 130, 230, 0.5);
  ctx.strokeStyle = '#374151'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(-180, 130); ctx.lineTo(-150, -40); ctx.moveTo(180, 130); ctx.lineTo(150, -40); ctx.stroke();
  ctx.save(); rr(ctx, -220, -60, 440, 70, 8); ctx.clip(); for (let i = -6; i < 12; i++) { ctx.fillStyle = i % 2 ? '#dc2626' : '#f8fafc'; ctx.beginPath(); ctx.moveTo(-220 + i * 50, -60); ctx.lineTo(-170 + i * 50, -60); ctx.lineTo(-220 + i * 50, 10); ctx.lineTo(-270 + i * 50, 10); ctx.closePath(); ctx.fill(); } ctx.restore();
  fillRR(ctx, -150, -150, 300, 76, 8, '#1d4ed8'); text(ctx, 'FISCALIZAÇÃO', 0, -112, { size: 30, weight: 900, color: '#ffffff', letter: 2 });
  ctx.restore();
}

// ================================================================ cenário: a serra do mar à noite (fundo com paralaxe e desfoque)
// céu azul-escuro com estrelas, morros em camadas com neblina, a estrada descendo em curvas com os faróis, as luzes da Baixada lá embaixo.
let SERRA = null;
function serraFundo(ctx, cam, a = 1, escuro = 0) {
  if (!SERRA) {
    const Wd = 2600, Hd = 1400, r = rng(23);
    const c = document.createElement('canvas'); c.width = Wd; c.height = Hd; const g = c.getContext('2d');
    const sky = g.createLinearGradient(0, 0, 0, 900); sky.addColorStop(0, '#060b1a'); sky.addColorStop(1, '#1b2a4a'); g.fillStyle = sky; g.fillRect(0, 0, Wd, Hd);
    for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(226,232,240,${0.2 + r() * 0.6})`; g.fillRect(r() * Wd, r() * 520, 2, 2); }
    // luzes da Baixada no horizonte, à direita
    for (let i = 0; i < 260; i++) { const x = 1300 + r() * 1300, y = 640 + r() * 70; g.fillStyle = r() > 0.6 ? 'rgba(253,224,141,0.9)' : 'rgba(186,230,253,0.7)'; g.fillRect(x, y, 3, 2); }
    const glow = g.createRadialGradient(1950, 680, 10, 1950, 680, 600); glow.addColorStop(0, 'rgba(253,186,116,0.25)'); glow.addColorStop(1, 'rgba(253,186,116,0)'); g.fillStyle = glow; g.fillRect(1200, 300, 1400, 700);
    // morros em camadas
    [['#14213a', 560, 0.9], ['#101a2f', 680, 1.3], ['#0b1324', 820, 1.8]].forEach(([cor, base, amp], k) => {
      g.fillStyle = cor; g.beginPath(); g.moveTo(0, Hd);
      for (let x = 0; x <= Wd; x += 40) g.lineTo(x, base - Math.abs(Math.sin(x / (260 + k * 90) + k)) * 160 * amp - Math.sin(x / 70) * 12);
      g.lineTo(Wd, Hd); g.closePath(); g.fill();
      g.fillStyle = 'rgba(203,213,225,0.06)'; g.fillRect(0, base - 40, Wd, 60);
    });
    // a estrada descendo em curvas, com os faróis
    g.strokeStyle = '#2a3346'; g.lineWidth = 34; g.beginPath(); g.moveTo(-50, 900); g.bezierCurveTo(600, 760, 900, 1000, 1400, 840); g.bezierCurveTo(1800, 720, 2200, 900, 2700, 800); g.stroke();
    for (let i = 0; i < 70; i++) { const q = r(), x = q * 2700 - 50, y = 870 - Math.sin(q * 9) * 50; g.fillStyle = r() > 0.5 ? 'rgba(254,240,138,0.95)' : 'rgba(248,113,113,0.9)'; g.beginPath(); g.arc(x, y, 3.5, 0, 6.283); g.fill(); }
    const fl = g.createLinearGradient(0, 960, 0, Hd); fl.addColorStop(0, '#070c18'); fl.addColorStop(1, '#03060d'); g.fillStyle = fl; g.fillRect(0, 960, Wd, Hd - 960);
    const tmp = document.createElement('canvas'); tmp.width = Wd; tmp.height = Hd; const t2 = tmp.getContext('2d');
    t2.filter = 'blur(8px)'; for (const dx of [-Wd, 0, Wd]) t2.drawImage(c, dx, 0); SERRA = tmp;
  }
  layer(ctx, cam, 0.35, () => {
    ctx.save(); ctx.globalAlpha *= a;
    const cx = cam.x - (cam.x - 960) * 0.65, k0 = Math.floor((cx - 1500 + 340) / 2600), k1 = Math.floor((cx + 1500 + 340) / 2600);
    for (let k = k0; k <= k1; k++) ctx.drawImage(SERRA, -340 + k * 2600, -160);
    ctx.fillStyle = `rgba(4,8,18,${0.35 + 0.35 * escuro})`; ctx.fillRect(-340 + k0 * 2600, -160, (k1 - k0 + 1) * 2600, 1400);
    ctx.restore();
  });
}
// faixas de neblina passando perto da câmera (camada da frente)
function neblina(ctx, cam, t, seed = 1, a = 0.08) {
  const r = rng(seed);
  layer(ctx, cam, 1.4, () => {
    for (let i = 0; i < 6; i++) {
      const x = ((r() * 2600 + t * (30 + r() * 40)) % 2800) - 400 + cam.x - 960, y = 200 + r() * 600, w = 500 + r() * 500;
      const g = ctx.createRadialGradient(x, y, 0, x, y, w / 2); g.addColorStop(0, hexA('#cbd5e1', a)); g.addColorStop(1, hexA('#cbd5e1', 0));
      ctx.fillStyle = g; ctx.fillRect(x - w / 2, y - w / 4, w, w / 2);
    }
  });
}

// ================================================================ a estrada vista pelo para-brisa (perspectiva), com o pórtico chegando
// o: { vel (velocidade das faixas), port (0 = longe, 1 = passando por cima), flash (0..1), placaLida, curva }
function estradaVista(ctx, cx, cy, w, h, t, o = {}) {
  ctx.save(); ctx.translate(cx, cy);
  ctx.save(); rr(ctx, -w / 2, -h / 2, w, h, 26); ctx.clip();
  const sky = ctx.createLinearGradient(0, -h / 2, 0, 0); sky.addColorStop(0, '#0a1226'); sky.addColorStop(1, '#22345a'); ctx.fillStyle = sky; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = '#0d1729'; ctx.beginPath(); ctx.moveTo(-w / 2, -h * 0.02); for (let x = -w / 2; x <= w / 2; x += 30) ctx.lineTo(x, -h * 0.08 - Math.abs(Math.sin(x / 180)) * h * 0.14); ctx.lineTo(w / 2, h / 2); ctx.lineTo(-w / 2, h / 2); ctx.closePath(); ctx.fill();
  const hz = -h * 0.02, cu = (o.curva ?? Math.sin(t * 0.3) * 0.15) * w;
  // pista em perspectiva
  ctx.fillStyle = '#262f40'; ctx.beginPath(); ctx.moveTo(cu - 20, hz); ctx.lineTo(cu + 20, hz); ctx.lineTo(w * 0.62, h / 2); ctx.lineTo(-w * 0.62, h / 2); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(226,232,240,0.7)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cu - 22, hz); ctx.lineTo(-w * 0.6, h / 2); ctx.moveTo(cu + 22, hz); ctx.lineTo(w * 0.6, h / 2); ctx.stroke();
  const vel = o.vel ?? 1;
  for (let i = 0; i < 9; i++) { const k = ((i / 9) + t * 0.45 * vel) % 1, k2 = Math.min(1, k + 0.045); const y0 = lerp(hz, h / 2, k * k), y1 = lerp(hz, h / 2, k2 * k2); ctx.strokeStyle = '#fde68a'; ctx.lineWidth = 2 + 10 * k; ctx.beginPath(); ctx.moveTo(lerp(cu, 0, k * k), y0); ctx.lineTo(lerp(cu, 0, k2 * k2), y1); ctx.stroke(); }
  // mureta com refletores
  for (let i = 0; i < 8; i++) { const k = ((i / 8) + t * 0.45 * vel) % 1; circle(ctx, lerp(cu + 24, w * 0.6, k * k), lerp(hz, h / 2, k * k) - 6 - 8 * k, 2 + 5 * k, '#fca5a5', 0.8); }
  // o pórtico chegando
  const pk = clamp(o.port ?? -1);
  if (o.port != null && o.port >= 0) {
    const s = lerp(0.12, 2.2, Math.pow(pk, 2.2)), py = lerp(hz - 10, -h * 0.9, Math.pow(pk, 2.2));
    ctx.save(); ctx.translate(lerp(cu, 0, pk), py); ctx.scale(s, s);
    ctx.fillStyle = '#94a3b8'; ctx.fillRect(-330, -20, 22, 260); ctx.fillRect(308, -20, 22, 260);
    fillRR(ctx, -350, -60, 700, 60, 6, '#334155'); ctx.strokeStyle = '#64748b'; ctx.lineWidth = 3; for (let x = -340; x < 340; x += 40) { ctx.beginPath(); ctx.moveTo(x, -60); ctx.lineTo(x + 20, 0); ctx.lineTo(x + 40, -60); ctx.stroke(); }
    for (const bx of [-180, 0, 180]) { fillRR(ctx, bx - 26, 0, 52, 30, 5, '#0f172a'); circle(ctx, bx, 15, 7, (o.flash || 0) > 0.1 ? '#ffffff' : '#ef4444'); }
    ctx.restore();
  }
  if ((o.flash || 0) > 0) { ctx.fillStyle = `rgba(255,255,255,${0.85 * clamp(o.flash)})`; ctx.fillRect(-w / 2, -h / 2, w, h); }
  ctx.restore();
  ctx.restore();
}

// ================================================================ por dentro do carro (desenhado em tela, na camada da frente)
// o: { a, tag (0..1 brilho do bip), tagCor, cel: fn(ctx) conteúdo do celular, celK, vel (velocímetro) }
function painelCarro(ctx, t, o = {}) {
  const a = o.a ?? 1; if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  // colunas do para-brisa
  ctx.fillStyle = '#05070c';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(150, 0); ctx.lineTo(10, 900); ctx.lineTo(0, 900); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(W, 0); ctx.lineTo(W - 150, 0); ctx.lineTo(W - 10, 900); ctx.lineTo(W, 900); ctx.closePath(); ctx.fill();
  ctx.fillRect(0, 0, W, 34);
  // retrovisor com a tag colada atrás
  ctx.fillStyle = '#0b0f17'; ctx.fillRect(952, 34, 16, 50);
  fillRR(ctx, 820, 80, 280, 74, 30, '#111827'); fillRR(ctx, 834, 92, 252, 50, 22, '#1e293b');
  const tk = clamp(o.tag || 0);
  fillRR(ctx, 1110, 44, 96, 54, 8, tk > 0 ? (o.tagCor || P.ok) : '#e5e7eb');
  if (tk > 0) { ctx.save(); ctx.globalAlpha *= tk; const g = ctx.createRadialGradient(1158, 71, 0, 1158, 71, 120); g.addColorStop(0, hexA(o.tagCor || P.ok, 0.6)); g.addColorStop(1, hexA(o.tagCor || P.ok, 0)); ctx.fillStyle = g; ctx.fillRect(1040, -50, 240, 240); ctx.restore(); }
  text(ctx, 'TAG', 1158, 72, { size: 22, weight: 900, color: tk > 0.5 ? '#ffffff' : '#475569' });
  // painel (objeto, abaixo da faixa das legendas: nenhum texto aqui embaixo)
  const g = ctx.createLinearGradient(0, 860, 0, H); g.addColorStop(0, '#111827'); g.addColorStop(1, '#030509');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, 900); ctx.quadraticCurveTo(W / 2, 830, W, 900); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(148,163,184,0.25)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 902); ctx.quadraticCurveTo(W / 2, 832, W, 902); ctx.stroke();
  // volante
  ctx.save(); ctx.translate(560, 1120); ctx.rotate(Math.sin(t * 0.7) * 0.05);
  ctx.strokeStyle = '#0b0f17'; ctx.lineWidth = 44; ctx.beginPath(); ctx.arc(0, 0, 300, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
  ctx.strokeStyle = '#1f2937'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, 318, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
  ctx.restore();
  // velocímetro aceso (sem número)
  ctx.save(); ctx.translate(560, 1000); ctx.strokeStyle = 'rgba(56,189,248,0.5)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, 60, Math.PI, Math.PI * 2); ctx.stroke();
  const ang = Math.PI + Math.PI * clamp(o.vel ?? 0.45 + 0.03 * Math.sin(t)); ctx.strokeStyle = '#f87171'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(ang) * 52, Math.sin(ang) * 52); ctx.stroke(); ctx.restore();
  ctx.restore();
  // o celular no suporte do painel (fio condutor)
  const ck = clamp(o.celK ?? 0);
  if (ck > 0 && o.cel) celSuporte(ctx, 1540, 560, 0.72 * lerp(0.9, 1, ease.out(ck)), o.cel, { a: a * clamp(ck * 2) });
}
function celSuporte(ctx, x, y, s, fn, o = {}) {
  ctx.save(); ctx.globalAlpha *= o.a ?? 1;
  ctx.fillStyle = '#0b0f17'; ctx.fillRect(x - 12, y + 270 * s, 24, 900 - y - 270 * s); // haste até o painel
  celular(ctx, x, y, s, fn, { rot: o.rot || 0 });
  ctx.restore();
}

// ================================================================ telas do celular (desenhadas dentro do celular: largura 340, de y = −350 a 350)
function telaTopo(c, titulo, cor = '#0f172a') { c.fillStyle = cor; c.fillRect(-170, -350, 340, 90); text(c, titulo, 0, -300, { size: 30, weight: 900, color: '#ffffff' }); }
// notificação "pedágio em aberto"
function telaNotif(c, t, o = {}) {
  c.fillStyle = '#0b1222'; c.fillRect(-170, -350, 340, 700);
  text(c, o.hora || '19:42', 0, -250, { size: 64, weight: 300, color: '#e2e8f0' });
  text(c, o.dia || 'quinta, 14 de janeiro', 0, -196, { size: 20, weight: 700, color: '#94a3b8' });
  const k = clamp(o.k ?? 1);
  if (k > 0) {
    c.save(); c.globalAlpha *= k; c.translate(0, (1 - ease.out(k)) * -40);
    fillRR(c, -155, -140, 310, 200, 22, 'rgba(241,245,249,0.95)');
    fillRR(c, -135, -122, 40, 40, 10, o.iconeCor || '#64748b'); text(c, '!', -115, -101, { size: 26, weight: 900, color: '#ffffff' });
    text(c, 'mensagem', -82, -108, { size: 18, weight: 800, color: '#475569', align: 'left' });
    text(c, 'Pedágio em aberto', -135, -58, { size: 24, weight: 900, color: '#0f172a', align: 'left' });
    text(c, 'R$ 20,30', -135, -20, { size: 34, weight: 900, color: '#0f172a', align: 'left' });
    text(c, 'clique para pagar ›', -135, 26, { size: 20, weight: 800, color: '#2563eb', align: 'left' });
    c.restore();
  }
  if (o.marca === 'x') xMark(c, 0, 180, 1.8, P.golpe, o.mk ?? 1);
  if (o.marca === 'ok') check(c, 0, 180, 1.8, P.ok, o.mk ?? 1);
  if (o.marca === '?') text(c, '?', 0, 190, { size: 150, weight: 900, color: '#f59e0b' });
}
// site de pagamento pela placa (o oficial e o falso têm a MESMA tela; só muda o endereço)
// o: { endereco, digitado (0..1), achou (0 nada, 1 dados do carro + valor), pix, cadeado, oficial }
function telaSite(c, t, o = {}) {
  c.fillStyle = '#f8fafc'; c.fillRect(-170, -350, 340, 700);
  fillRR(c, -160, -340, 320, 50, 14, '#e2e8f0');
  if (o.cadeado) { c.save(); c.fillStyle = '#16a34a'; fillRR(c, -146, -322, 18, 16, 3, '#16a34a'); c.strokeStyle = '#16a34a'; c.lineWidth = 3; c.beginPath(); c.arc(-137, -324, 6, Math.PI, 0); c.stroke(); c.restore(); }
  const end = o.endereco || 'site-de-pagamento', ke = clamp(o.digEnd ?? 1), shown = end.slice(0, Math.ceil(end.length * ke));
  text(c, shown + (ke < 1 && Math.sin(t * 12) > 0 ? '|' : ''), o.cadeado ? -120 : -146, -314, { size: 18, weight: 800, color: '#334155', align: 'left' });
  text(c, 'PEDÁGIO', 0, -240, { size: 28, weight: 900, color: '#0f172a', letter: 3 });
  text(c, 'digite a placa', 0, -196, { size: 20, weight: 800, color: '#64748b' });
  fillRR(c, -130, -170, 260, 70, 12, '#ffffff'); strokeRR(c, -130, -170, 260, 70, 12, '#94a3b8', 3);
  const pl = 'ABC1D23', kd = clamp(o.digitado ?? 0), txt = pl.slice(0, Math.round(pl.length * kd));
  c.save(); c.font = MONO(36, 900); c.fillStyle = '#0f172a'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt + (kd > 0 && kd < 1 && Math.sin(t * 12) > 0 ? '|' : ''), 0, -134); c.restore();
  const ka = clamp(o.achou ?? 0);
  if (ka > 0) {
    c.save(); c.globalAlpha *= ka;
    fillRR(c, -140, -80, 280, 150, 14, '#eef2ff');
    text(c, 'HATCH 1.0 · PRATA', -124, -50, { size: 18, weight: 900, color: '#334155', align: 'left' });
    text(c, '1 passagem em aberto', -124, -18, { size: 18, weight: 800, color: '#475569', align: 'left' });
    text(c, 'R$ 20,30', -124, 30, { size: 40, weight: 900, color: '#0f172a', align: 'left' });
    fillRR(c, -120, 100, 240, 70, 35, o.botaoCor || '#16a34a'); text(c, o.botao || 'pagar com Pix', 0, 136, { size: 24, weight: 900, color: '#ffffff' });
    c.restore();
  }
  if (o.nada) { text(c, 'nenhuma passagem', 0, -40, { size: 24, weight: 900, color: '#16a34a' }); text(c, 'em aberto', 0, -6, { size: 24, weight: 900, color: '#16a34a' }); }
}
// aviso oficial por mensagem: mostra a passagem e indica onde pagar, sem botão de pagamento
function telaAviso(c, t, o = {}) {
  telaTopo(c, 'mensagem', '#0f5132');
  c.fillStyle = '#e7f5ec'; c.fillRect(-170, -260, 340, 610);
  fillRR(c, -150, -230, 290, 230, 18, '#ffffff');
  text(c, 'Aviso de passagem', -130, -196, { size: 22, weight: 900, color: '#0f172a', align: 'left' });
  text(c, 'placa ABC1D23', -130, -158, { size: 19, weight: 800, color: '#475569', align: 'left' });
  text(c, 'passagem em aberto', -130, -124, { size: 19, weight: 800, color: '#475569', align: 'left' });
  text(c, 'pague no canal', -130, -76, { size: 21, weight: 900, color: '#166534', align: 'left' });
  text(c, 'oficial da concessionária', -130, -46, { size: 21, weight: 900, color: '#166534', align: 'left' });
  if (o.semBotao) { fillRR(c, -120, 40, 240, 70, 35, '#e2e8f0'); text(c, 'sem botão de pagar', 0, 76, { size: 20, weight: 900, color: '#64748b' }); }
}

// ================================================================ objetos da estrada e do dinheiro
function cabineAntiga(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  sombraChao(ctx, 0, 150, 220, 0.5);
  fillRR(ctx, -300, -260, 600, 50, 8, '#e5e7eb'); ctx.fillStyle = '#94a3b8'; ctx.fillRect(-280, -210, 20, 360); ctx.fillRect(260, -210, 20, 360);
  ctx.save(); papelSombra(ctx); fillRR(ctx, -90, -150, 180, 300, 10, '#cbd5e1'); ctx.restore();
  fillRR(ctx, -70, -120, 140, 100, 8, '#bae6fd'); fillRR(ctx, 90, 30, 30, 30, 4, '#475569');
  // cancela listrada
  const ab = o.abre || 0;
  ctx.save(); ctx.translate(110, 60); ctx.rotate(-ab * 1.3);
  for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? '#ffffff' : '#dc2626'; ctx.fillRect(i * 40, -10, 40, 20); }
  ctx.restore();
  fillRR(ctx, 90, 40, 40, 70, 6, '#334155');
  if (o.x > 0) xMark(ctx, 0, -40, 2.4, P.golpe, o.x);
  ctx.restore();
}
function recibo(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || -0.05); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  ctx.save(); papelSombra(ctx); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(-110, -170); ctx.lineTo(110, -170); for (let i = 0; i <= 10; i++) ctx.lineTo(110 - i * 22, 170 + (i % 2 ? 10 : 0)); ctx.lineTo(-110, -170); ctx.fill(); ctx.restore();
  text(ctx, 'RECIBO', 0, -130, { size: 28, weight: 900, color: P.ink, letter: 3 });
  for (let i = 0; i < 5; i++) { fillRR(ctx, -80, -80 + i * 34, 90, 10, 5, '#e5e7eb'); fillRR(ctx, 30, -80 + i * 34, 50, 10, 5, '#e5e7eb'); }
  mono(ctx, o.valor || 'R$ 20,30', 0, 120, 30, P.ink, 'center', 900);
  if (o.x > 0) xMark(ctx, 0, 0, 2.0, P.golpe, o.x);
  ctx.restore();
}
function cnhPontos(ctx, x, y, s, pontos, o = {}) { // carteira de motorista genérica com bolinhas de pontos
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0.04); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  ctx.save(); papelSombra(ctx); fillRR(ctx, -200, -125, 400, 250, 18, '#d9f99d'); ctx.restore();
  fillRR(ctx, -200, -125, 400, 54, 18, '#4d7c0f'); text(ctx, 'HABILITAÇÃO', 0, -96, { size: 26, weight: 900, color: '#ffffff', letter: 3 });
  fillRR(ctx, -175, -50, 110, 140, 10, '#cbd5e1'); circle(ctx, -120, -10, 26, '#94a3b8'); fillRR(ctx, -158, 22, 76, 50, 20, '#94a3b8');
  for (let i = 0; i < 3; i++) fillRR(ctx, -40, -40 + i * 30, 200, 12, 6, 'rgba(63,98,18,0.35)');
  for (let i = 0; i < 5; i++) circle(ctx, -30 + i * 44, 75, 15, i < pontos ? '#dc2626' : 'rgba(63,98,18,0.25)');
  ctx.restore();
}
function escritorioEmpresa(ctx, x, y, s, label, cor, o = {}) { // prédio de escritório (a concessionária), diferente do prédio de governo
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  sombraChao(ctx, 0, 160, 230, 0.5);
  ctx.save(); papelSombra(ctx); ctx.fillStyle = '#1e3a8a'; ctx.fillRect(-150, -280, 300, 440); ctx.restore();
  for (let r2 = 0; r2 < 9; r2++) for (let c = 0; c < 5; c++) ctx.fillStyle = (r2 * 7 + c * 3) % 5 ? 'rgba(147,197,253,0.75)' : 'rgba(30,58,138,0.9)', ctx.fillRect(-130 + c * 54, -260 + r2 * 46, 40, 30);
  fillRR(ctx, -170, -340, 340, 50, 10, cor); text(ctx, label, 0, -315, { size: 24, weight: 900, color: '#0b1222', letter: 1 });
  if (o.zero) { chip(ctx, 0, 0, o.zero, '#e2e8f0', 1, { size: 34 }); }
  ctx.restore();
}
function ambulancia(ctx, x, y, s, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  sombraChao(ctx, 0, 70, 220, 0.5);
  ctx.save(); papelSombra(ctx); fillRR(ctx, -200, -110, 270, 160, 14, '#f8fafc'); fillRR(ctx, 70, -60, 120, 110, 14, '#f8fafc'); ctx.restore();
  fillRR(ctx, 100, -45, 70, 45, 6, '#bae6fd'); ctx.fillStyle = '#dc2626'; ctx.fillRect(-200, -10, 390, 18);
  ctx.fillStyle = '#dc2626'; ctx.fillRect(-90, -90, 22, 66); ctx.fillRect(-112, -68, 66, 22);
  fillRR(ctx, -60, -132, 60, 22, 6, Math.sin(t * 9) > 0 ? '#ef4444' : '#3b82f6');
  for (const wx of [-130, 120]) { circle(ctx, wx, 55, 30, '#111827'); circle(ctx, wx, 55, 12, '#9ca3af'); }
  ctx.restore();
}
function rolo(ctx, x, y, s, o = {}) { // rolo compactador (o asfalto)
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  sombraChao(ctx, 0, 80, 220, 0.5);
  ctx.fillStyle = '#facc15'; fillRR(ctx, -120, -120, 200, 110, 12, '#facc15'); fillRR(ctx, -70, -190, 110, 80, 10, '#1f2937');
  circle(ctx, -150, 30, 60, '#475569'); circle(ctx, -150, 30, 50, '#64748b'); ctx.fillStyle = '#334155'; ctx.fillRect(-150, 10, 260, 40); circle(ctx, 110, 40, 40, '#111827');
  ctx.restore();
}
function placaSinal(ctx, x, y, s, o = {}) { // placa de sinalização de trânsito (curva perigosa)
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  ctx.fillStyle = '#94a3b8'; ctx.fillRect(-8, 0, 16, 220);
  ctx.save(); ctx.rotate(Math.PI / 4); fillRR(ctx, -90, -90, 180, 180, 12, '#facc15'); strokeRR(ctx, -82, -82, 164, 164, 10, '#111827', 6); ctx.restore();
  ctx.strokeStyle = '#111827'; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-20, 50); ctx.lineTo(-20, 0); ctx.quadraticCurveTo(-20, -30, 20, -40); ctx.stroke();
  ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.moveTo(20, -70); ctx.lineTo(48, -42); ctx.lineTo(16, -14); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function radar(ctx, x, y, s, t, o = {}) { // poste de fiscalização com câmera
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  ctx.fillStyle = '#94a3b8'; ctx.fillRect(-10, -60, 20, 280); ctx.fillRect(-10, -60, 120, 16);
  fillRR(ctx, 80, -80, 90, 60, 10, '#1f2937'); circle(ctx, 140, -50, 16, Math.sin(t * 4) > 0.6 ? '#ffffff' : '#64748b');
  ctx.restore();
}
function livro(ctx, x, y, s, o = {}) { // cartilha de educação no trânsito
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.08); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  ctx.save(); papelSombra(ctx); fillRR(ctx, -120, -150, 240, 300, 10, '#16a34a'); ctx.restore();
  fillRR(ctx, -100, -130, 200, 260, 6, '#22c55e'); circle(ctx, 0, -20, 50, '#dc2626'); circle(ctx, 0, -20, 36, '#ffffff'); ctx.fillStyle = '#dc2626'; ctx.fillRect(-30, -26, 60, 12);
  fillRR(ctx, -70, 70, 140, 14, 7, 'rgba(255,255,255,0.7)');
  ctx.restore();
}
function cofre(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  sombraChao(ctx, 0, 140, 160, 0.5);
  ctx.save(); papelSombra(ctx); fillRR(ctx, -130, -130, 260, 260, 16, '#475569'); ctx.restore();
  strokeRR(ctx, -110, -110, 220, 220, 10, '#94a3b8', 4); circle(ctx, 0, 0, 46, '#cbd5e1'); circle(ctx, 0, 0, 34, '#64748b');
  for (let i = 0; i < 8; i++) { const a2 = i * 0.785; ctx.fillStyle = '#e2e8f0'; ctx.fillRect(Math.cos(a2) * 38 - 3, Math.sin(a2) * 38 - 3, 6, 6); }
  ctx.restore();
}
function carteiraAnonima(ctx, x, y, s, o = {}) { // a conta de outra pessoa: carteira com "?"
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.06); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  ctx.save(); papelSombra(ctx); fillRR(ctx, -160, -110, 320, 220, 26, '#3f1d2b'); ctx.restore();
  fillRR(ctx, 40, -50, 140, 100, 22, '#5b2333'); circle(ctx, 90, 0, 14, '#fda4af');
  text(ctx, '?', -50, 6, { size: 130, weight: 900, color: '#fda4af' });
  ctx.restore();
}
// mapa da estrada de São Paulo até a Baixada, com as cidades ao longo do caminho (para o ISS dividido)
function mapaEstrada(ctx, x, y, s, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  const pts = [[-520, -230], [-300, -150], [-120, -40], [40, 60], [220, 150], [470, 230]];
  const cidades = o.cidades || [[-520, -230, 'SÃO PAULO'], [-200, -100, 'CIDADE 2'], [60, 80, 'CIDADE 3'], [470, 230, 'LITORAL']];
  ctx.strokeStyle = '#475569'; ctx.lineWidth = 34; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); pts.forEach(([px, py], i) => i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)); ctx.stroke();
  ctx.strokeStyle = '#fde68a'; ctx.lineWidth = 4; ctx.setLineDash([18, 14]); ctx.stroke(); ctx.setLineDash([]);
  cidades.forEach(([cx, cy, lb], i) => {
    const kc = clamp(o.kc ? o.kc[i] ?? 1 : 1);
    ctx.save(); ctx.globalAlpha *= 0.35 + 0.65 * kc;
    for (let b = 0; b < 4; b++) fillRR(ctx, cx - 70 + b * 36, cy - 60 - (b % 2) * 30 - 40, 30, 60 + (b % 2) * 30, 4, kc > 0.5 ? '#c4b5fd' : '#64748b');
    text(ctx, lb, cx, cy + 60, { size: 24, weight: 900, color: '#e2e8f0' });
    ctx.restore();
  });
  if (o.fluxo) for (let i = 0; i < 6; i++) { const q = ((t * 0.12 + i / 6) % 1) * (pts.length - 1), j = Math.floor(q), f = q - j, [ax, ay] = pts[j], [bx, by] = pts[Math.min(j + 1, pts.length - 1)]; circle(ctx, lerp(ax, bx, f), lerp(ay, by, f), 9, i % 2 ? '#fde68a' : '#fca5a5'); }
  if (o.portico) { const [px, py] = o.portico; ctx.save(); ctx.translate(px, py); fillRR(ctx, -60, -70, 120, 22, 4, '#94a3b8'); ctx.fillStyle = '#94a3b8'; ctx.fillRect(-58, -50, 8, 60); ctx.fillRect(50, -50, 8, 60); circle(ctx, 0, -59, 6, '#ef4444'); ctx.restore(); }
  ctx.restore();
}
// envelope verdadeiro de multa com o valor
function envelopeValor(ctx, x, y, s, k, o = {}) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.06); ctx.scale(s * lerp(1.2, 1, ease.out(clamp(k))), s * lerp(1.2, 1, ease.out(clamp(k)))); ctx.globalAlpha *= clamp(k * 2);
  ctx.save(); papelSombra(ctx); ctx.fillStyle = '#f5f5f4'; ctx.fillRect(-260, -160, 520, 320); ctx.restore();
  ctx.strokeStyle = '#d6d3d1'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-260, -160); ctx.lineTo(0, 20); ctx.lineTo(260, -160); ctx.stroke();
  text(ctx, 'NOTIFICAÇÃO DE INFRAÇÃO', 0, 60, { size: 24, weight: 900, color: '#57534e', letter: 2 });
  mono(ctx, 'R$ 195,23', 0, 112, 48, '#b91c1c', 'center', 900);
  ctx.restore();
}
// bilhete de pedágio (o valor que continua devido)
function bilhete(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0.05); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  ctx.save(); papelSombra(ctx); fillRR(ctx, -150, -70, 300, 140, 12, '#fefce8'); ctx.restore();
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.setLineDash([6, 6]); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(70, -60); ctx.lineTo(70, 60); ctx.stroke(); ctx.setLineDash([]);
  text(ctx, 'PEDÁGIO', -40, -30, { size: 22, weight: 900, color: '#57534e', letter: 2 });
  mono(ctx, 'R$ 20,30', -40, 18, 34, P.ink, 'center', 900);
  if (o.carimbo) { ctx.save(); ctx.translate(-30, 0); ctx.rotate(-0.15); strokeRR(ctx, -120, -36, 240, 72, 8, o.carimboCor || '#dc2626', 6); text(ctx, o.carimbo, 0, 2, { size: 30, weight: 900, color: o.carimboCor || '#dc2626', letter: 2 }); ctx.restore(); }
  ctx.restore();
}
// placa do pórtico com o painel de letreiro (para a inscrição)
function painelPortico(ctx, x, y, s, t, str, cor) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#94a3b8'; ctx.fillRect(-460, -160, 30, 460); ctx.fillRect(430, -160, 30, 460);
  ctx.save(); papelSombra(ctx); fillRR(ctx, -500, -230, 1000, 160, 14, '#1e293b'); ctx.restore();
  fillRR(ctx, -440, -205, 880, 110, 10, '#020617');
  ctx.save(); ctx.shadowColor = cor; ctx.shadowBlur = 30; text(ctx, str, 0, -148, { size: 70, weight: 900, color: cor, letter: 6 }); ctx.restore();
  for (const bx of [-260, 0, 260]) { fillRR(ctx, bx - 40, -70, 80, 44, 6, '#0f172a'); circle(ctx, bx, -48, 10, '#ef4444'); }
  ctx.restore();
}
function controleGame(ctx, x, y, s, t) { // controle de videogame genérico
  ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t) * 0.05); ctx.scale(s, s);
  ctx.save(); papelSombra(ctx); ctx.fillStyle = '#1f2937'; ctx.beginPath(); ctx.ellipse(-110, 20, 90, 70, -0.3, 0, 6.283); ctx.ellipse(110, 20, 90, 70, 0.3, 0, 6.283); ctx.fill(); fillRR(ctx, -130, -60, 260, 110, 50, '#1f2937'); ctx.restore();
  ctx.fillStyle = '#475569'; ctx.fillRect(-140, -12, 60, 20); ctx.fillRect(-120, -32, 20, 60);
  for (const [dx, dy, c] of [[110, -30, '#ef4444'], [140, 0, '#22c55e'], [110, 30, '#38bdf8'], [80, 0, '#facc15']]) circle(ctx, dx, dy, 13, c);
  circle(ctx, -40, 40, 22, '#334155'); circle(ctx, 40, 40, 22, '#334155');
  ctx.restore();
}
// três setas saindo do carro (estrada, multa, golpe)
function tresSetas(ctx, x, y, t, ks, kf) {
  const dests = [[P.emp, 'ESTRADA', -520, -250], [P.multa, 'MULTA', 0, -330], [P.golpe, 'GOLPE', 520, -250]];
  dests.forEach(([cor, lb, dx, dy], i) => {
    const k = clamp(ks[i] ?? 0); if (k <= 0) return;
    const fade = i > 0 ? 1 - 0.75 * clamp(kf) : 1;
    ctx.save(); ctx.globalAlpha *= fade;
    arrow(ctx, x, y - 60, x + dx * 0.8, y + dy * 0.8 + 60, cor, 12, ease.out(k));
    chip(ctx, x + dx, y + dy, lb, cor, k, { size: 40 });
    ctx.restore();
  });
}

// ================================================================ peças comuns
const B1 = pct(T.pis), B2 = pct(T.imp); // fronteiras na fita da tarifa (0..100)
const selo = (ctx, x, y, str, cor, k) => chip(ctx, x, y, str, cor, k, { size: 22 });
// celular grande no meio da cena (fora do carro)
const celGrande = (ctx, x, y, s, fn, o = {}) => celular(ctx, x, y, s, fn, o);
// painel do carro só enquanto a câmera está dentro do carro (por tempo)
function carroK(t, a, b) { return Math.min(appear(t, a, 0.6), 1 - appear(t, b, 0.6)); }

// ================================================================ Cena 01: janeiro, a mensagem; pode ser verdade (a serra sem cabine), pode ser golpe; quase dez vezes mais caro
function scene01(K) {
  const tVolt = K('Você voltou da praia'), tMsg = K('pedágio em aberto'), tVerd = K('Pode ser verdade'), tDesde = K('Desde o dia 1º de dezembro'), tAnch = K('pela Anchieta e pela Imigrantes'), tCab = K('não tem mais cabine');
  const tGolpe = K('Mas também pode ser golpe'), tIgual = K('o golpe é quase igual'), tSep = K('Até o fim deste vídeo'), tDez = K('Também vai entender'), tMais = K('quase dez vezes mais caro');
  const cam = [
    { t: 0, x: 960, y: 470, z: 1.04, dz: 0.006 }, { t: tMsg, x: 960, y: 430, z: 1.12, d: 1.4 },
    { t: tDesde - 0.3, x: 2400, y: 480, z: 1.0, d: 1.4, dx: 3 }, { t: tCab, x: 2560, y: 480, z: 1.08, d: 1.4 },
    { t: tGolpe - 0.3, x: 3800, y: 470, z: 1.0, d: 1.4 }, { t: tSep, x: 3800, y: 450, z: 1.06, d: 1.4 },
    { t: tDez - 0.3, x: 5200, y: 470, z: 1.0, d: 1.4 }, { t: tMais, x: 5260, y: 470, z: 1.08, d: 2.0, dz: 0.004 },
  ];
  const sfx = [[0.05, 'notif', 0.35], [tVolt, 'pop', 0.25], [tMsg, 'notif', 0.5], [tVerd, 'ding', 0.3], [tDesde - 0.2, 'whoosh', 0.3], [tAnch, 'pop', 0.3], [tCab, 'clank', 0.35], [tCab + 0.5, 'buzz', 0.25],
    [tGolpe - 0.2, 'whoosh', 0.3], [tIgual, 'pop', 0.3], [tIgual + 0.3, 'pop', 0.3], [tSep, 'tick', 0.3], [tDez - 0.2, 'whoosh', 0.3], [tMais, 'hit', 0.4], [tMais + 0.4, 'paper', 0.35]];
  return {
    accent: P.sky, cam, sfx, impacts: [tMais], trans: 'cut',
    draw(ctx, t, cam2) {
      salaFundo(ctx, cam2, 0.95, 0.6);
      zone(ctx, cam2, 900, 1100, () => {
        if (t > tDesde + 0.6) return;
        headline(ctx, 'janeiro', 960, 110, { size: 70, k: appear(t, 0.1, 0.4), hl: '#1e3a8a' });
        { const pul = 1 + 0.05 * Math.sin(Math.PI * prog(t, tMsg, 0.5)); celGrande(ctx, 960, 500, 0.95 * pul, (c) => telaNotif(c, t, { k: appear(t, 0.15, 0.4), marca: t > tVerd ? '?' : null }), { rot: -0.02 }); }
        bigNum(ctx, 'R$ 20,30', 1480, 470, appear(t, 0.6, 0.5), { size: 96, color: '#fde68a' });
        text(ctx, 'pedágio em aberto?', 1480, 550, { size: 32, weight: 900, color: '#e2e8f0', alpha: appear(t, 0.9, 0.4) });
        chip(ctx, 480, 300, 'voltou da praia há 2 semanas', '#fde68a', vis(t, tVolt, tDesde, 0.4, 0.4), { size: 26 });
        chip(ctx, 1480, 300, 'pode ser verdade', P.ok, vis(t, tVerd, tDesde, 0.4, 0.4), { size: 28 });
      });
      zone(ctx, cam2, 2300, 2600, () => {
        if (t < tDesde - 0.8 || t > tGolpe + 0.6) return;
        const k = vis(t, tDesde - 0.3, tGolpe, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        calMini(ctx, 1790, 300, 0.9, 'DEZEMBRO', 1, '#b91c1c', prog(t, tDesde + 0.4, 0.6), { rot: -0.05 });
        mapaEstrada(ctx, 2300, 520, 0.72, t, { fluxo: true, cidades: [[-520, -230, 'SÃO PAULO'], [470, 230, 'BAIXADA SANTISTA']], kc: [1, appear(t, tAnch, 0.5)] });
        chip(ctx, 2330, 180, 'Anchieta e Imigrantes', P.sky, appear(t, tAnch, 0.4), { size: 28 });
        cabineAntiga(ctx, 2900, 560, 0.62, { abre: 0, x: prog(t, tCab + 0.2, 0.5) });
        chip(ctx, 2900, 300, 'sem cabine', '#fca5a5', appear(t, tCab, 0.4), { size: 28 });
        ctx.restore();
      });
      zone(ctx, cam2, 3700, 3900, () => {
        if (t < tGolpe - 0.8 || t > tDez + 0.6) return;
        const k = vis(t, tGolpe - 0.3, tDez, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        const ki = appear(t, tIgual, 0.6);
        celGrande(ctx, lerp(3800, 3560, ease.out(ki)), 500, 0.82, (c) => telaNotif(c, t, { marca: '?' }), { rot: -0.04 });
        if (ki > 0) { ctx.save(); ctx.globalAlpha *= clamp(ki * 2); celGrande(ctx, lerp(3800, 4040, ease.out(ki)), 500, 0.82, (c) => telaNotif(c, t, { marca: '?' }), { rot: 0.04 }); ctx.restore(); }
        chip(ctx, 3560, 160, 'verdadeira?', P.ok, appear(t, tSep, 0.4), { size: 28 });
        chip(ctx, 4040, 160, 'golpe?', P.golpe, appear(t, tSep + 0.3, 0.4), { size: 28 });
        chip(ctx, 3800, 160, 'quase iguais', '#e2e8f0', vis(t, tIgual + 0.4, tSep, 0.4, 0.3), { size: 28 });
        ctx.restore();
      });
      zone(ctx, cam2, 5100, 5300, () => {
        if (t < tDez - 0.8) return;
        const k = appear(t, tDez - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        bilhete(ctx, 4760, 470, 1.0, { rot: -0.06 });
        arrow(ctx, 4980, 470, 5180, 470, '#fde68a', 10, appear(t, tDez + 0.8, 0.5));
        envelopeValor(ctx, 5560, 470, 0.85, appear(t, tDez + 1.2, 0.5));
        bigNum(ctx, 'quase 10×', 5200, 160, appear(t, tMais + 0.4, 0.5), { size: 96, color: '#fca5a5' });
        ctx.restore();
      });
      bokeh(ctx, cam2, t, 3, 8, 0.08);
    },
    overlay(ctx, t) { source(ctx, 'Governo de SP (pórticos desde 1º/12/2026)', vis(t, tDesde, tGolpe, 0.5, 0.4)); },
  };
}

// ================================================================ Cena 02: a descida da serra; o pórtico; ele leu a placa; uns 70 pórticos em 7 estados; livre de fila, não de pagamento
function scene02(K) {
  const tVolta = K('Volta um pouco'), tLugar = K('No lugar da cabine'), tEstr = K('uma estrutura de metal'), tCam = K('com câmeras e antenas'), tPassa = K('Você passa sem frear');
  const tViu = K('Mas o pórtico viu'), tLeu = K('Leu a sua placa'), tTag = K('ou a tag no'), tAnot = K('e anotou a passagem'), tLa = K('Isso não é só lá');
  const t70 = K('uns setenta pórticos'), t7 = K('em sete estados'), tNome = K('O nome em inglês'), tFluxo = K('fluxo livre'), tFila = K('Livre de fila'), tPag = K('Não de pagamento');
  const cam = [
    { t: 0, x: 960, y: 470, z: 1.0, dz: 0.004 }, { t: tCam, x: 960, y: 420, z: 1.05, d: 1.6 }, { t: tViu, x: 960, y: 470, z: 1.1, d: 0.6 },
    { t: tLeu - 0.3, x: 2400, y: 480, z: 1.0, d: 1.2 }, { t: tTag, x: 2500, y: 450, z: 1.08, d: 1.2 },
    { t: tLa - 0.3, x: 3800, y: 470, z: 1.0, d: 1.4 }, { t: t7, x: 3760, y: 500, z: 1.08, d: 1.4 },
    { t: tNome - 0.3, x: 5200, y: 470, z: 1.0, d: 1.4, dx: 3 },
  ];
  const tFlash = tViu - 0.2;
  const sfx = [[0.05, 'whoosh', 0.3], [tLugar, 'pop', 0.3], [tEstr, 'clank', 0.3], [tCam, 'pop', 0.25], [tPassa, 'whoosh', 0.35, { dur: 1.2 }], [tFlash, 'flashPortico', 0.5], [tLeu, 'scan', 0.3], [tTag, 'bipTag', 0.45], [tAnot, 'tick', 0.35],
    [tLa - 0.2, 'whoosh', 0.3], [t70, 'pop', 0.3], [t7, 'sparkle', 0.3], [tNome - 0.2, 'whoosh', 0.3], [tFila, 'whoosh', 0.3, { dur: 0.8 }], [tPag, 'stamp', 0.4]];
  return {
    accent: P.sky, cam, sfx, impacts: [tFlash + 0.1], trans: 'push',
    draw(ctx, t, cam2) {
      serraFundo(ctx, cam2, 0.95);
      zone(ctx, cam2, 900, 1100, () => {
        if (t > tLeu + 0.6) return;
        const port = t < tLugar ? -1 : prog(t, tLugar, tViu - tLugar + 0.4);
        estradaVista(ctx, 960, 470, 1640, 820, t, { vel: 1.3, port, flash: Math.max(0, 1 - Math.abs(t - tFlash) / 0.35) });
        chip(ctx, 960, 150, 'no lugar da cabine, um pórtico', '#e2e8f0', vis(t, tLugar, tPassa, 0.4, 0.4), { size: 30 });
        chip(ctx, 700, 260, 'câmeras', P.sky, vis(t, tCam, tPassa + 1, 0.4, 0.4), { size: 26 });
        chip(ctx, 1220, 260, 'antenas', P.sky, vis(t, tCam + 0.5, tPassa + 1, 0.4, 0.4), { size: 26 });
        headline(ctx, 'o pórtico viu', 960, 200, { size: 70, k: vis(t, tViu, tLeu, 0.3, 0.3), hl: '#1e3a8a' });
      });
      zone(ctx, cam2, 2300, 2600, () => {
        if (t < tLeu - 0.8 || t > tLa + 0.6) return;
        const k = vis(t, tLeu - 0.3, tLa, 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        placa(ctx, 2250, 470, 1.25, 'ABC1D23', { rot: -0.03 });
        const ks = prog(t, tLeu, 0.9); if (ks > 0 && ks < 1) { ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 6; ctx.strokeRect(2250 - 270, 470 - 100 + ks * 0, 540, 200); ctx.fillStyle = 'rgba(74,222,128,0.35)'; ctx.fillRect(2250 - 270, 370 + ks * 200, 540, 6); }
        if (t > tLeu + 0.9) { strokeRR(ctx, 1980, 370, 540, 200, 10, '#4ade80', 6); }
        const kt = appear(t, tTag, 0.4);
        if (kt > 0) { ctx.save(); ctx.globalAlpha *= clamp(kt * 2); fillRR(ctx, 2700, 380, 230, 130, 14, Math.sin((t - tTag) * 20) > 0 && t < tTag + 1 ? P.ok : '#e5e7eb'); text(ctx, 'TAG', 2815, 445, { size: 44, weight: 900, color: '#0f172a' }); ctx.restore(); }
        chip(ctx, 2480, 700, 'passagem anotada · placa e horário', '#4ade80', appear(t, tAnot, 0.4), { size: 26 });
        ctx.restore();
      });
      zone(ctx, cam2, 3700, 3900, () => {
        if (t < tLa - 0.8 || t > tNome + 0.6) return;
        const k = vis(t, tLa - 0.3, tNome, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        const cx = 3560, cy = 560, sc = 13, pt = ([lon, lat]) => [cx + (lon + 54) * sc, cy - (lat + 14) * sc];
        ctx.beginPath(); BRASIL.forEach((p, i) => { const [x, y] = pt(p); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); ctx.fillStyle = 'rgba(30,41,59,0.85)'; ctx.fill(); ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 3; ctx.stroke();
        const est = [['SP', -48.5, -22.5], ['RJ', -42.8, -22.4], ['MG', -44.5, -18.5], ['PR', -51.5, -24.8], ['RS', -53.2, -29.8], ['GO', -49.6, -16.0], ['RO', -63.0, -10.9]];
        est.forEach(([uf, lon, lat], i) => { const kk = appear(t, t7 + i * 0.25, 0.4); if (kk <= 0) return; const [x, y] = pt([lon, lat]); circle(ctx, x, y, 16 * ease.back(kk), P.sky); shockRing(ctx, t, t7 + i * 0.25, x, y, P.sky, 10, 60); text(ctx, uf, x, y - 34, { size: 22, weight: 900, color: '#e2e8f0', alpha: kk }); });
        bigNum(ctx, '74 pórticos', 4300, 380, appear(t, t70, 0.5), { size: 84, color: P.sky });
        text(ctx, 'em 7 estados · ago/2026', 4300, 460, { size: 28, weight: 900, color: '#e2e8f0', alpha: appear(t, t7, 0.4) });
        ctx.restore();
      });
      zone(ctx, cam2, 5100, 5300, () => {
        if (t < tNome - 0.8) return;
        const k = appear(t, tNome - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        portico(ctx, 5200, 560, 0.8, t);
        headline(ctx, 'FREE FLOW', 5200, 180, { size: 110, k: appear(t, tNome, 0.5), color: '#bae6fd', color2: '#38bdf8' });
        text(ctx, '= fluxo livre', 5200, 280, { size: 40, weight: 900, color: '#e2e8f0', alpha: appear(t, tFluxo, 0.4) });
        const kf = appear(t, tFila, 0.5);
        for (let i = 0; i < 4; i++) { const xx = 4700 + ((t - tFila) * 260 + i * 260) % 1100; if (kf > 0) carroLado(ctx, xx, 640, 0.42, { a: kf, cor: ['#dc2626', '#2563eb', '#f8fafc', '#16a34a'][i] }); }
        bilhete(ctx, 5200, 720, 0.9, { a: appear(t, tPag, 0.5), carimbo: t > tPag + 0.3 ? 'A PAGAR' : null });
        ctx.restore();
      });
      neblina(ctx, cam2, t, 5);
    },
    overlay(ctx, t) {
      painelCarro(ctx, t, { a: 1 - appear(t, tLeu - 0.4, 0.5), tag: Math.max(0, 1 - Math.abs(t - tTag - 0.2) / 0.5), celK: 1, cel: (c) => { c.fillStyle = '#0b1222'; c.fillRect(-170, -350, 340, 700); c.save(); c.strokeStyle = '#38bdf8'; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.moveTo(-40, 250); c.quadraticCurveTo(80, 60, -20, -140); c.stroke(); c.restore(); c.fillStyle = '#38bdf8'; c.beginPath(); c.moveTo(-20, -200); c.lineTo(20, -130); c.lineTo(-60, -140); c.closePath(); c.fill(); } });
      source(ctx, 'PEGN (74 pórticos, ago/2026)', vis(t, t70, tNome, 0.5, 0.4));
    },
  };
}

// ================================================================ Cena 03: tag x placa; 30 dias; nada lembra você; 3,4 milhões de multas suspensas; o prazo extra acabou
function scene03(K) {
  const tTag = K('Quem tem tag paga'), tCai = K('a cobrança cai sozinha'), tDesc = K('com desconto'), tNao = K('Quem não tem ganha um prazo'), t30 = K('de trinta dias'), tSite = K('no site oficial');
  const tSimp = K('Parece simples'), tProb = K('O problema é que'), tCanc = K('Não tem cancela'), tRec = K('não tem recibo'), tJan = K('não tem ninguém na janela');
  const t23 = K('Desde 2023'), tRecl = K('junto com as reclamações'), tSusp = K('que o governo suspendeu'), tTempo = K('e deu mais tempo'), t16 = K('Esse tempo extra acabou'), tVolt = K('Agora a multa voltou');
  const cam = [
    { t: 0, x: 960, y: 470, z: 1.0, dx: 3 }, { t: tNao, x: 1100, y: 470, z: 1.06, d: 1.4 },
    { t: tSimp - 0.3, x: 2400, y: 470, z: 1.0, d: 1.4 }, { t: tCanc, x: 2400, y: 500, z: 1.06, d: 1.4 },
    { t: t23 - 0.3, x: 3800, y: 470, z: 1.0, d: 1.4 }, { t: tSusp, x: 3800, y: 440, z: 1.08, d: 1.4 },
    { t: t16 - 0.3, x: 5200, y: 470, z: 1.0, d: 1.4 },
  ];
  const sfx = [[tTag, 'bipTag', 0.45], [tCai, 'coin', 0.35], [tDesc, 'ding', 0.3], [tNao, 'pop', 0.3], [t30, 'flip', 0.35, { dur: 0.8 }], [tSite, 'tap', 0.35], [tSimp, 'pop', 0.25],
    [tSimp - 0.2, 'whoosh', 0.3], [tProb, 'buzz', 0.2], [tCanc, 'pop', 0.3], [tRec, 'pop', 0.3], [tJan, 'pop', 0.3], [t23 - 0.2, 'whoosh', 0.3], [t23 + 0.5, 'paper', 0.3, { dur: 0.6 }], [tRecl, 'buzz', 0.2], [tSusp, 'stamp', 0.45], [tTempo, 'tick', 0.3],
    [t16 - 0.2, 'whoosh', 0.3], [t16 + 0.4, 'flip', 0.3, { dur: 0.4 }], [tVolt, 'hit', 0.4]];
  return {
    accent: P.ok, cam, sfx, impacts: [tSusp, tVolt], trans: 'push',
    draw(ctx, t, cam2) {
      serraFundo(ctx, cam2, 0.9, 0.4);
      zone(ctx, cam2, 900, 1200, () => {
        if (t > tSimp + 0.6) return;
        const k = vis(t, 0, tSimp, 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        chip(ctx, 560, 120, 'COM TAG', P.ok, appear(t, tTag, 0.4), { size: 32 });
        { ctx.save(); ctx.globalAlpha *= appear(t, 0, 0.5); portico(ctx, 560, 300, 0.42, t); ctx.restore(); }
        const kt = appear(t, tTag, 0.5);
        if (kt > 0) { ctx.save(); ctx.globalAlpha *= clamp(kt * 2); fillRR(ctx, 445, 380, 230, 130, 14, Math.sin((t - tTag) * 20) > 0 && t < tTag + 1 ? P.ok : '#e5e7eb'); text(ctx, 'TAG', 560, 445, { size: 44, weight: 900, color: '#0f172a' }); ctx.restore(); }
        const kc = prog(t, tCai, 1.0); if (kc > 0) { const p = ease.inOut(kc); moedaLaranja(ctx, 560, lerp(520, 640, p), 26, kc < 1 ? 1 : 0.0001); bilhete(ctx, 560, 640, 0.8, { carimbo: kc >= 1 ? 'PAGO' : null, carimboCor: '#16a34a' }); }
        chip(ctx, 560, 770, 'em muitas estradas, com desconto', P.ok, appear(t, tDesc, 0.4), { size: 24 });
        chip(ctx, 1360, 150, 'SEM TAG', '#fde68a', appear(t, tNao, 0.4), { size: 32 });
        if (t > tNao - 0.3) celGrande(ctx, 1260, 520, 0.72, (c) => telaSite(c, t, { endereco: 'site oficial', cadeado: true, digitado: prog(t, tSite, 1.0), achou: appear(t, tSite + 1.1, 0.4) }), { a: appear(t, tNao, 0.5), rot: -0.03 });
        if (t > t30) calMini(ctx, 1620, 380, 0.85, 'PRAZO', 30 - Math.floor(clamp((t - t30) / 4) * 29), '#a16207', 0, { a: appear(t, t30, 0.4), rot: 0.05 });
        text(ctx, 'dias', 1620, 510, { size: 26, weight: 900, color: '#fde68a', alpha: appear(t, t30, 0.4) });
        ctx.restore();
      });
      zone(ctx, cam2, 2300, 2500, () => {
        if (t < tSimp - 0.8 || t > t23 + 0.6) return;
        const k = vis(t, tSimp - 0.3, t23, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        headline(ctx, 'parece simples', 2400, 140, { size: 60, k: vis(t, tSimp, tProb + 0.6, 0.4, 0.4), hl: '#14532d' });
        { const kk = vis(t, tSimp - 0.3, tCanc, 0.4, 0.4); if (kk > 0) { ctx.save(); ctx.globalAlpha *= kk; portico(ctx, 2400, 560, 0.75, t); carroLado(ctx, lerp(1800, 3000, prog(t, tSimp, 5)), 700, 0.5, { cor: '#dc2626' }); ctx.restore(); } }
        headline(ctx, 'na estrada, nada lembra você', 2400, 140, { size: 54, k: appear(t, tProb + 0.6, 0.4), hl: '#7f1d1d' });
        cabineAntiga(ctx, 1980, 560, 0.55, { a: appear(t, tCanc, 0.4) * appear(t, tCanc, 0.4), x: prog(t, tCanc + 0.4, 0.4) });
        recibo(ctx, 2420, 520, 0.9, { a: appear(t, tRec, 0.4), x: prog(t, tRec + 0.4, 0.4) });
        const kj = appear(t, tJan, 0.4);
        if (kj > 0) { ctx.save(); ctx.globalAlpha *= kj; fillRR(ctx, 2740, 360, 220, 260, 14, '#334155'); fillRR(ctx, 2765, 390, 170, 130, 10, '#bae6fd'); pessoa(ctx, 2850, 470, 0.8, '#475569', 1); ctx.restore(); xMark(ctx, 2850, 480, 2.0, P.golpe, prog(t, tJan + 0.4, 0.4)); }
        ctx.restore();
      });
      zone(ctx, cam2, 3700, 3900, () => {
        if (t < t23 - 0.8 || t > t16 + 0.6) return;
        const k = vis(t, t23 - 0.3, t16, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        chip(ctx, 3800, 130, 'desde 2023', '#e2e8f0', appear(t, t23, 0.4), { size: 28 });
        const n = Math.round(14 * ease.out(prog(t, t23 + 0.3, 3)));
        for (let i = 0; i < n; i++) envelopeValor(ctx, 3420 + (i % 7) * 26 - 80, 640 - i * 22, 0.42, 1, { rot: -0.08 + (i % 3) * 0.04 });
        chip(ctx, 3360, 260, 'reclamações: não consegui pagar', '#fca5a5', appear(t, tRecl, 0.4), { size: 22 });
        { const ka = appear(t, t23, 0.4); if (ka > 0 && t < tSusp + 0.2) { const ano = 2023 + Math.min(3, Math.floor((t - t23) / 2.2)); calMini(ctx, 4250, 420, 0.95, 'ANO', ano, '#475569', 0, { a: ka * (1 - appear(t, tSusp - 0.3, 0.3)), rot: 0.04 }); } }
        const ks = appear(t, tSusp, 0.5);
        if (ks > 0) { ovalStamp(ctx, 3360, 470, 210, 90, [['SUSPENSAS', 0.05, 0.5]], '#16a34a', ks, -0.12); }
        bigNum(ctx, '3,4 milhões', 4250, 420, appear(t, tSusp, 0.5), { size: 92, color: '#86efac' });
        text(ctx, 'de multas suspensas', 4250, 500, { size: 30, weight: 900, color: '#e2e8f0', alpha: appear(t, tSusp + 0.3, 0.4) });
        if (t > tTempo) { ctx.save(); ctx.globalAlpha *= appear(t, tTempo, 0.4); ampulheta(ctx, 4250, 680, 0.7, t); ctx.restore(); }
        ctx.restore();
      });
      zone(ctx, cam2, 5100, 5300, () => {
        if (t < t16 - 0.8) return;
        const k = appear(t, t16 - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        calMini(ctx, 4850, 470, 1.15, 'NOVEMBRO', 16, '#b91c1c', prog(t, t16 + 0.5, 0.6), { rot: -0.04 });
        chip(ctx, 4850, 220, 'fim do prazo extra', '#fde68a', appear(t, t16 + 0.3, 0.4), { size: 26 });
        envelopeValor(ctx, 5480, 470, 0.8, appear(t, tVolt, 0.5));
        chip(ctx, 5480, 220, 'a multa voltou a valer', '#fca5a5', appear(t, tVolt + 0.2, 0.4), { size: 28 });
        ctx.restore();
      });
      neblina(ctx, cam2, t, 7, 0.06);
    },
    overlay(ctx, t) { source(ctx, 'ANTT; Siga Fácil (30 dias); Deliberação 277/2026', vis(t, tNao, 99, 0.5, 0.4)); },
  };
}

// ================================================================ Cena 04: para onde vai o pedágio (a promessa do 10): imposto menos de R$ 2, o ISS dividido entre as cidades, mais de R$ 18 para a concessionária
function scene04(K) {
  const tAntes = K('Antes de chegar nela'), tPassar = K('passar pelo pórtico'), tSurp = K('A primeira surpresa'), tMenor = K('Ele é a menor parte'), tDois = K('menos de dois reais'), tCam = K('Esse pedacinho ainda faz');
  const tPref = K('O imposto da prefeitura'), tLei = K('A lei divide'), tResto = K('O resto, mais de dezoito'), tConc = K('fica com a concessionária'), tAsf = K('o asfalto da serra'), tGui = K('o guincho'), tAmb = K('a ambulância'), tLuc = K('o lucro dela');
  const tJan = K('Em janeiro'), tRef = K('com a reforma tributária'), t5 = K('uns cinco por cento'), tRep = K('se o imposto novo');
  const cam = [
    { t: 0, x: 960, y: 470, z: 1.0, dz: 0.005 }, { t: tPassar, x: 960, y: 440, z: 1.06, d: 1.4 },
    { t: tSurp - 0.3, x: 2400, y: 470, z: 1.0, d: 1.4 }, { t: tDois, x: 2150, y: 470, z: 1.1, d: 1.2 },
    { t: tPref - 0.3, x: 3800, y: 480, z: 1.0, d: 1.4 }, { t: tLei, x: 3820, y: 500, z: 1.04, d: 1.6, dx: 4 },
    { t: tResto - 0.3, x: 5200, y: 470, z: 1.0, d: 1.4 }, { t: tAsf, x: 5300, y: 520, z: 1.06, d: 1.6, dx: 3 },
    { t: tJan - 0.3, x: 6600, y: 470, z: 1.0, d: 1.4 }, { t: t5, x: 6600, y: 440, z: 1.08, d: 1.4 },
  ];
  const sfx = [[tAntes, 'pop', 0.3], [tPassar, 'whoosh', 0.35], [tSurp - 0.2, 'whoosh', 0.3], [tMenor, 'tesoura', 0.45], [tDois, 'ding', 0.35], [tCam, 'pop', 0.25], [tPref - 0.2, 'whoosh', 0.3],
    [tLei, 'coin', 0.3], [tLei + 0.5, 'coin', 0.3], [tLei + 1.0, 'coin', 0.3], [tResto - 0.2, 'whoosh', 0.3], [tConc, 'cash', 0.35], [tAsf, 'truck', 0.18], [tGui, 'pop', 0.3], [tAmb, 'pop', 0.3], [tLuc, 'coin', 0.35],
    [tJan - 0.2, 'whoosh', 0.3], [tJan + 0.3, 'flip', 0.3, { dur: 0.4 }], [t5, 'riser', 0.25], [tRep, 'pop', 0.3]];
  return {
    accent: P.emp, cam, sfx, impacts: [tDois], trans: 'push',
    draw(ctx, t, cam2) {
      serraFundo(ctx, cam2, 0.9, 0.5);
      zone(ctx, cam2, 900, 1100, () => {
        if (t > tSurp + 0.6) return;
        const k = vis(t, 0, tSurp, 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        chip(ctx, 960, 130, 'a promessa do último vídeo', '#e2e8f0', appear(t, tAntes, 0.4), { size: 26 });
        headline(ctx, 'para onde vai o pedágio?', 960, 230, { size: 64, k: appear(t, tAntes + 0.6, 0.5), hl: '#1e3a8a' });
        portico(ctx, 960, 560, 0.9, t);
        const p = ease.inOut(prog(t, tPassar + 0.2, 2.2)); bilhete(ctx, lerp(500, 1420, p), 700, 0.8, { a: appear(t, tPassar, 0.4) });
        ctx.restore();
      });
      zone(ctx, cam2, 2100, 2500, () => {
        if (t < tSurp - 0.8 || t > tPref + 0.6) return;
        const k = vis(t, tSurp - 0.3, tPref, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        const x0 = 1700, w = 1400, y = 330, kc = appear(t, tMenor, 0.5);
        text(ctx, 'R$ 20,30 · um sentido', 2400, 230, { size: 32, weight: 900, color: '#fde68a' });
        headline(ctx, 'a primeira surpresa: o imposto', 2400, 120, { size: 52, k: vis(t, tSurp, tPref, 0.4, 0.4), hl: '#7c2d12' });
        fita(ctx, x0, y, w, [{ a: 0, b: B1, cor: P.fed, k: kc, gapB: kc, dy: kc * 20 }, { a: B1, b: B2, cor: P.iss, k: kc, gapA: 0, gapB: kc, dy: kc * 20 }, { a: B2, b: 100, cor: P.emp, k: 0.35 * kc, gapA: kc }], { h: 60 });
        if (t > tMenor && t < tMenor + 1.0) tesoura(ctx, fitaX(x0, w, B2), y - 10, 0.7, 0.5 + 0.5 * Math.sin(t * 14), -1.57);
        rotuloFita(ctx, fitaX(x0, w, B2 / 2) + 60, y + 140, 'até R$ 1,76', 'imposto', '#fdba74', appear(t, tDois, 0.5), { size: 60, sub: 26, exemplo: true });
        chip(ctx, 1950, 640, 'PIS e Cofins · R$ 0,74', '#fca5a5', appear(t, tDois + 0.6, 0.4), { size: 24 });
        chip(ctx, 1950, 700, 'ISS · até R$ 1,02', '#d8b4fe', appear(t, tCam, 0.4), { size: 24 });
        ctx.restore();
      });
      zone(ctx, cam2, 3700, 3900, () => {
        if (t < tPref - 0.8 || t > tResto + 0.6) return;
        const k = vis(t, tPref - 0.3, tResto, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        const cid = [[-520, -230, 'SÃO PAULO'], [-200, -100, 'CIDADE B'], [60, 80, 'CIDADE C'], [470, 230, 'LITORAL']];
        const kc = cid.map((_, i) => appear(t, tLei + i * 0.5, 0.5));
        mapaEstrada(ctx, 3800, 520, 0.85, t, { fluxo: true, cidades: cid, kc: kc.map((x, i) => (i === 1 ? Math.max(x, appear(t, tPref, 0.5)) : x)), portico: [-200, -100] });
        chip(ctx, 3800 - 200 * 0.85, 520 - 100 * 0.85 - 170, 'o pórtico está aqui', '#fca5a5', vis(t, tPref, tLei, 0.4, 0.4), { size: 22 });
        cid.forEach(([cx, cy], i) => { const p = ease.in(prog(t, tLei + i * 0.5, 0.6)); if (p > 0 && p < 1) { ctx.save(); ctx.fillStyle = P.iss; circle(ctx, 3800 + cx * 0.85, lerp(150, 520 + cy * 0.85 - 90, p), 18, P.iss); ctx.restore(); } });
        chip(ctx, 3800, 140, 'o ISS é dividido entre as cidades da estrada', '#d8b4fe', appear(t, tLei, 0.4), { size: 28 });
        ctx.restore();
      });
      zone(ctx, cam2, 5100, 5500, () => {
        if (t < tResto - 0.8 || t > tJan + 0.6) return;
        const k = vis(t, tResto - 0.3, tJan, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        fita(ctx, 4520, 200, 1360, [{ a: 0, b: 100, cor: P.emp, k: 1 }], { semPontas: true });
        rotuloFita(ctx, 5200, 120, 'R$ 18,54', null, '#93c5fd', appear(t, tResto, 0.5), { size: 50 });
        escritorioEmpresa(ctx, 4700, 560, 0.75, 'CONCESSIONÁRIA', '#93c5fd', { a: appear(t, tConc, 0.5) });
        rolo(ctx, 5130, 620, 0.62, { a: appear(t, tAsf, 0.5) }); text(ctx, 'asfalto', 5130, 470, { size: 26, weight: 900, color: '#e2e8f0', alpha: appear(t, tAsf, 0.4) });
        guincho(ctx, 5530, 640, 0.5, { a: appear(t, tGui, 0.5) }); text(ctx, 'guincho', 5530, 470, { size: 26, weight: 900, color: '#e2e8f0', alpha: appear(t, tGui, 0.4) });
        ambulancia(ctx, 5860, 650, 0.62, t, { a: appear(t, tAmb, 0.5) }); text(ctx, 'ambulância', 5860, 470, { size: 26, weight: 900, color: '#e2e8f0', alpha: appear(t, tAmb, 0.4) });
        const kl = appear(t, tLuc, 0.5); if (kl > 0) { for (let i = 0; i < 6; i++) circle(ctx, 4700 + 200 + (i % 2) * 18, 760 - i * 16 - (1 - ease.out(kl)) * 120, 30, i % 2 ? '#facc15' : '#eab308', clamp(kl * 2)); text(ctx, 'lucro', 4920, 650, { size: 26, weight: 900, color: '#fde68a', alpha: kl }); }
        ctx.restore();
      });
      zone(ctx, cam2, 6500, 6700, () => {
        if (t < tJan - 0.8) return;
        const k = appear(t, tJan - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        calMini(ctx, 6250, 470, 1.0, 'JANEIRO', 2027, '#1d4ed8', 0, { rot: -0.04 });
        { const kr = appear(t, tRef, 0.5), gr = ease.inOut(prog(t, tRef + 0.5, 2.0)); if (kr > 0) { ctx.save(); ctx.globalAlpha *= kr; fita(ctx, 6420, 760 - 20, 960, [{ a: 0, b: B2 * (1 + 0.6 * gr), cor: P.fed, k: 1, gapB: 1, brilho: gr * (0.5 + 0.5 * Math.sin(t * 6)) }, { a: B2 * (1 + 0.6 * gr), b: 100, cor: P.emp, k: 0.6, gapA: 1 }], { h: 40 }); ctx.restore(); text(ctx, 'o imposto da tarifa', 6900, 700 - 20, { size: 22, weight: 900, color: '#fca5a5', alpha: kr }); } }
        chip(ctx, 6900, 260, 'reforma tributária', '#e2e8f0', appear(t, tRef, 0.4), { size: 28 });
        bigNum(ctx, '+5%?', 6900, 430, appear(t, t5, 0.5), { size: 120, color: '#fca5a5' });
        text(ctx, 'estimativa das concessionárias', 6900, 520, { size: 26, weight: 900, color: '#e2e8f0', alpha: appear(t, t5 + 0.3, 0.4) });
        chip(ctx, 6900, 610, 'se o imposto novo for repassado', '#fde68a', appear(t, tRep, 0.4), { size: 24 });
        ctx.restore();
      });
      neblina(ctx, cam2, t, 9, 0.05);
    },
    overlay(ctx, t) {
      const DUR = this.dur ?? 999;
      source(ctx, 'Conjur (8,65%); LC 116, art. 3º; conta do canal', vis(t, tMenor, tResto, 0.5, 0.4));
      source(ctx, 'Poder360 (nov/2026)', vis(t, tRef, DUR - 0.8, 0.5, 0.3));
      // a transição de efeito (uma só): o flash do pórtico cresce e estoura a tela; a cena 5 nasce dele
      const kf = prog(t, DUR - 0.7, 0.7);
      if (kf > 0) { const g = ctx.createRadialGradient(W / 2, 200, 0, W / 2, 200, lerp(100, 2200, ease.in(kf))); g.addColorStop(0, `rgba(255,255,255,${kf})`); g.addColorStop(1, `rgba(255,255,255,${kf * 0.6})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
    },
  };
}

// ================================================================ Cena 05: a multa (a virada): R$ 195,23 e 5 pontos; não vai para a concessionária; o pedágio continua devido
function scene05(K) {
  const tAgora = K('Agora, a multa'), tPass = K('Passaram os trinta dias'), tGrave = K('É infração grave'), t195 = K('cento e noventa e cinco reais'), t5p = K('e cinco pontos na carteira'), tDez = K('Quase dez vezes o pedágio');
  const tSabe = K('Aqui está a parte'), tNaoVai = K('Esse dinheiro não vai'), tOrgao = K('Vai para o órgão de trânsito'), tSinal = K('em sinalização'), tFisc = K('fiscalização e educação'), tEduc = K('educação no trânsito'), tFundo = K('com uma parte num fundo nacional');
  const tEmp = K('A empresa da estrada não ganha'), tCont = K('E continua cobrando'), tQuita = K('porque pagar a multa'), tDuas = K('Você paga as duas coisas');
  const cam = [
    { t: 0, x: 960, y: 470, z: 1.1, dz: 0.004 }, { t: tGrave, x: 900, y: 470, z: 1.04, d: 1.4 }, { t: tDez, x: 960, y: 450, z: 1.0, d: 1.4 },
    { t: tSabe - 0.3, x: 2400, y: 470, z: 1.0, d: 1.4 }, { t: tOrgao, x: 2480, y: 480, z: 1.02, d: 1.6, dx: 2 },
    { t: tEmp - 0.3, x: 3800, y: 470, z: 1.0, d: 1.4 }, { t: tDuas, x: 3800, y: 450, z: 1.08, d: 1.4 },
  ];
  const sfx = [[0.05, 'impact', 0.3], [tAgora, 'paper', 0.4], [tPass, 'flip', 0.3, { dur: 0.6 }], [tGrave, 'stamp', 0.45], [t195, 'cash', 0.35], [t5p, 'pop', 0.3], [t5p + 0.3, 'pop', 0.25], [t5p + 0.6, 'pop', 0.25], [tDez, 'hit', 0.4],
    [tSabe - 0.2, 'whoosh', 0.3], [tNaoVai, 'buzz', 0.3], [tOrgao, 'coin', 0.35], [tSinal, 'pop', 0.3], [tFisc, 'pop', 0.3], [tEduc, 'pop', 0.3], [tFundo, 'clank', 0.3],
    [tEmp - 0.2, 'whoosh', 0.3], [tCont, 'paper', 0.35], [tQuita, 'stamp', 0.4], [tDuas, 'cash', 0.4]];
  return {
    accent: P.multa, cam, sfx, impacts: [tGrave, tDez], trans: 'cut',
    draw(ctx, t, cam2) {
      serraFundo(ctx, cam2, 0.85, 0.7);
      zone(ctx, cam2, 900, 1100, () => {
        if (t > tSabe + 0.6) return;
        const k = vis(t, 0, tSabe, 0.0, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        calMini(ctx, 420, 360, 0.75, 'PRAZO', 30, '#a16207', prog(t, tPass + 0.3, 0.6), { a: appear(t, tPass, 0.4), rot: -0.06 });
        chip(ctx, 420, 520, '30 dias depois', '#fde68a', appear(t, tPass, 0.4), { size: 24 });
        envelopeValor(ctx, 960, 430, 1.0, appear(t, 0.1, 0.5));
        ovalStamp(ctx, 1200, 250, 190, 70, [['INFRAÇÃO GRAVE', 0.06, 0.42]], '#dc2626', appear(t, tGrave, 0.5), 0.1);
        cnhPontos(ctx, 1520, 520, 0.8, Math.min(5, Math.floor(prog(t, t5p, 1.0) * 5 + (t > t5p ? 1 : 0))), { a: appear(t, t5p - 0.2, 0.4) });
        const kd = appear(t, tDez, 0.5);
        if (kd > 0) for (let i = 0; i < 10; i++) { const kk = appear(t, tDez + i * 0.08, 0.3); bilhete(ctx, 330 + i * 140, 760, 0.42, { a: kk, rot: (i % 2 ? 0.05 : -0.05) }); }
        bigNum(ctx, '≈ 10 pedágios', 960, 860 - 220, appear(t, tDez + 0.6, 0.5), { size: 60, color: '#fca5a5' });
        ctx.restore();
      });
      zone(ctx, cam2, 2300, 2700, () => {
        if (t < tSabe - 0.8 || t > tEmp + 0.6) return;
        const k = vis(t, tSabe - 0.3, tEmp, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        headline(ctx, 'a parte que quase ninguém sabe', 2400, 120, { size: 54, k: vis(t, tSabe, tOrgao, 0.4, 0.4), hl: '#7c2d12' });
        envelopeValor(ctx, 2400, 330, 0.55, 1);
        escritorioEmpresa(ctx, 1900, 640, 0.55, 'CONCESSIONÁRIA', '#93c5fd', { a: appear(t, tNaoVai, 0.4) });
        arrow(ctx, 2300, 420, 2000, 520, '#94a3b8', 8, appear(t, tNaoVai, 0.5)); xMark(ctx, 2140, 470, 1.4, P.golpe, prog(t, tNaoVai + 0.4, 0.4));
        predioGov(ctx, 2900, 600, 0.7, 'ÓRGÃO DE TRÂNSITO', '#fdba74', { a: appear(t, tOrgao, 0.5) });
        arrow(ctx, 2500, 420, 2800, 500, P.multa, 8, appear(t, tOrgao, 0.5));
        placaSinal(ctx, 3120, 560, 0.55, { a: appear(t, tSinal, 0.4) }); text(ctx, 'sinalização', 3120, 430, { size: 22, weight: 900, color: '#e2e8f0', alpha: appear(t, tSinal, 0.4) });
        radar(ctx, 3260, 590, 0.6, t, { a: appear(t, tFisc, 0.4) }); text(ctx, 'fiscalização', 3300, 500, { size: 22, weight: 900, color: '#e2e8f0', alpha: appear(t, tFisc, 0.4) });
        livro(ctx, 3120, 700, 0.42, { a: appear(t, tEduc, 0.4) }); text(ctx, 'educação', 3200, 680, { size: 22, weight: 900, color: '#e2e8f0', align: 'left', alpha: appear(t, tEduc, 0.4) });
        cofre(ctx, 2900, 820 - 60, 0.4, { a: appear(t, tFundo, 0.4) }); chip(ctx, 2620, 760, 'fundo nacional · 5%', '#fde68a', appear(t, tFundo + 0.3, 0.4), { size: 22 });
        ctx.restore();
      });
      zone(ctx, cam2, 3700, 3900, () => {
        if (t < tEmp - 0.8) return;
        const k = appear(t, tEmp - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        escritorioEmpresa(ctx, 3350, 600, 0.7, 'CONCESSIONÁRIA', '#93c5fd', {});
        chip(ctx, 3350, 250, 'da multa: R$ 0', '#93c5fd', appear(t, tEmp + 0.3, 0.4), { size: 30 });
        bilhete(ctx, 3950, 380, 0.95, { a: appear(t, tCont, 0.5), carimbo: t > tQuita + 0.3 ? 'AINDA DEVIDO' : null });
        envelopeValor(ctx, 4250, 600, 0.5, appear(t, tDuas - 0.4, 0.4), { rot: 0.05 });
        const kt = appear(t, tDuas, 0.5);
        if (kt > 0) { bigNum(ctx, 'R$ 215,53', 3950, 140, kt, { size: 80, color: '#fca5a5' }); text(ctx, 'R$ 195,23 + R$ 20,30', 3950, 210, { size: 28, weight: 900, color: '#e2e8f0', alpha: kt }); }
        ctx.restore();
      });
    },
    overlay(ctx, t) {
      const kf = 1 - prog(t, 0, 0.9); if (kf > 0) { ctx.fillStyle = `rgba(255,255,255,${ease.in(kf)})`; ctx.fillRect(0, 0, W, H); }
      source(ctx, 'CTB, arts. 209-A e 320', vis(t, tGrave, tEmp, 0.5, 0.4));
    },
  };
}

// ================================================================ Cena 06: o golpe copia o hábito certo; quase 500 sites falsos; dados reais do carro; o dinheiro vai para outra pessoa
function scene06(K) {
  const tVolta = K('É aí que volta a mensagem'), tHab = K('O pedágio sem cabine criou'), tDig = K('digitar a placa num site'), tCop = K('Os golpistas copiaram'), tEmp = K('Uma empresa de segurança digital'), t500 = K('quase quinhentos sites falsos');
  const tVoce = K('Você digita a placa'), tDados = K('aparecem dados reais'), tValor = K('e um valor pequeno'), tPaga = K('Você paga'), tConta = K('o dinheiro cai na conta'), tAberto = K('A passagem verdadeira continua'), tPrazo = K('e o prazo continua correndo');
  const cam = [
    { t: 0, x: 960, y: 470, z: 1.02, dz: 0.006 }, { t: tDig, x: 960, y: 450, z: 1.08, d: 1.4 },
    { t: tCop - 0.3, x: 2400, y: 470, z: 1.0, d: 1.4 }, { t: t500, x: 2400, y: 460, z: 1.04, d: 1.4 },
    { t: tVoce - 0.3, x: 3800, y: 470, z: 1.0, d: 1.4 }, { t: tConta, x: 3950, y: 480, z: 1.06, d: 1.4 },
    { t: tAberto - 0.3, x: 5200, y: 470, z: 1.0, d: 1.4 },
  ];
  const sfx = [[tVolta, 'notif', 0.4], [tHab, 'pop', 0.3], [tDig, 'key', 0.3], [tDig + 0.3, 'key', 0.3], [tDig + 0.6, 'key', 0.3], [tCop - 0.2, 'whoosh', 0.3], [tCop + 0.3, 'pop', 0.3], [tEmp, 'scan', 0.3], [t500, 'typewriter', 0.25, { n: 14 }],
    [tVoce - 0.2, 'whoosh', 0.3], [tVoce + 0.3, 'key', 0.3], [tVoce + 0.6, 'key', 0.3], [tDados, 'ding', 0.3], [tValor, 'pop', 0.3], [tPaga, 'tap', 0.45], [tConta, 'cash', 0.35], [tConta + 0.4, 'buzz', 0.3], [tAberto - 0.2, 'whoosh', 0.3], [tPrazo, 'clock', 0.3]];
  return {
    accent: P.golpe, cam, sfx, impacts: [tConta + 0.4], trans: 'push',
    draw(ctx, t, cam2) {
      salaFundo(ctx, cam2, 0.9, 0.7);
      zone(ctx, cam2, 900, 1100, () => {
        if (t > tCop + 0.6) return;
        const k = vis(t, 0, tCop, 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        celGrande(ctx, 700, 500, 0.7, (c) => telaNotif(c, t, {}), { rot: -0.05, a: 1 - 0.5 * appear(t, tHab, 0.5) });
        chip(ctx, 700, 130, 'a mensagem do começo', '#e2e8f0', vis(t, tVolta, tHab + 1, 0.4, 0.4), { size: 26 });
        celGrande(ctx, 1240, 500, 0.8, (c) => telaSite(c, t, { endereco: 'site oficial', cadeado: true, digitado: prog(t, tDig, 1.2), achou: appear(t, tDig + 1.4, 0.4) }), { a: appear(t, tHab, 0.5), rot: 0.03 });
        chip(ctx, 1240, 130, 'o hábito novo: placa + Pix', P.ok, appear(t, tDig, 0.4), { size: 26 });
        ctx.restore();
      });
      zone(ctx, cam2, 2300, 2500, () => {
        if (t < tCop - 0.8 || t > tVoce + 0.6) return;
        const k = vis(t, tCop - 0.3, tVoce, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        const kg = appear(t, t500, 0.5), n = Math.round(480 * ease.out(prog(t, t500, 4)));
        if (kg > 0) { ctx.save(); ctx.globalAlpha *= 0.85 * kg; for (let i = 0; i < n; i++) { const c2 = i % 40, r2 = Math.floor(i / 40); fillRR(ctx, 1640 + c2 * 38, 330 + r2 * 40, 32, 32, 4, i % 9 ? '#9f1239' : '#e11d48'); } ctx.restore(); }
        const ks = 1 - appear(t, t500 - 0.2, 0.5);
        celGrande(ctx, 2150, 500, 0.66 * (ks > 0.5 ? 1 : 1), (c) => telaSite(c, t, { endereco: 'site oficial', cadeado: true, digitado: 1, achou: 1 }), { rot: -0.03, a: ks });
        celGrande(ctx, 2650, 500, 0.66, (c) => telaSite(c, t, { endereco: 'site parecido', digitado: 1, achou: 1 }), { rot: 0.03, a: ks * appear(t, tCop + 0.3, 0.5) });
        chip(ctx, 2150, 130, 'verdadeiro', P.ok, appear(t, tCop + 0.6, 0.4) * ks, { size: 26 });
        chip(ctx, 2650, 130, 'falso', P.golpe, appear(t, tCop + 0.8, 0.4) * ks, { size: 26 });
        if (ks > 0.05) { ctx.save(); ctx.globalAlpha *= ks * appear(t, tCop + 1.0, 0.4); lupa(ctx, 2400 + Math.sin((t - tCop) * 1.6) * 260, 320, 0.7, 0.6); ctx.restore(); }
        if (kg > 0) { ctx.save(); ctx.globalAlpha *= kg; fillRR(ctx, 1900, 130, 1000, 170, 24, 'rgba(15,23,42,0.9)'); ctx.restore(); }
        bigNum(ctx, '480 sites falsos', 2400, 195, kg, { size: 84, color: '#fda4af' });
        text(ctx, 'jan–ago/2026 · empresa de segurança digital', 2400, 268, { size: 28, weight: 900, color: '#e2e8f0', alpha: kg });
        ctx.restore();
      });
      zone(ctx, cam2, 3700, 4100, () => {
        if (t < tVoce - 0.8 || t > tAberto + 0.6) return;
        const k = vis(t, tVoce - 0.3, tAberto, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        celGrande(ctx, 3600, 470, 1.0, (c) => telaSite(c, t, { endereco: 'site parecido', digitado: prog(t, tVoce, 1.0), achou: appear(t, tDados, 0.5), botaoCor: t > tPaga && t < tPaga + 0.4 ? '#14532d' : '#16a34a' }), { rot: -0.03 });
        chip(ctx, 3600, 60 + 30, 'dados reais do seu carro', '#fde68a', appear(t, tDados + 0.2, 0.4), { size: 24 });
        chip(ctx, 3150, 520, 'valor de pedágio', '#fde68a', appear(t, tValor, 0.4), { size: 24 });
        carteiraAnonima(ctx, 4300, 500, 0.95, { a: appear(t, tConta - 0.3, 0.4) });
        for (let i = 0; i < 4; i++) { const p = ease.inOut(prog(t, tConta - 0.2 + i * 0.15, 0.7)); if (p > 0 && p < 1) moedaLaranja(ctx, lerp(3700, 4300, p), lerp(560, 500, p) - Math.sin(Math.PI * p) * 120, 20); }
        chip(ctx, 4300, 300, 'conta de outra pessoa', P.golpe, appear(t, tConta + 0.2, 0.4), { size: 26 });
        ctx.restore();
      });
      zone(ctx, cam2, 5100, 5300, () => {
        if (t < tAberto - 0.8) return;
        const k = appear(t, tAberto - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        bilhete(ctx, 4900, 470, 1.05, { carimbo: 'EM ABERTO', carimboCor: '#dc2626' });
        calMini(ctx, 5550, 460, 0.95, 'PRAZO', Math.max(1, 30 - Math.floor((t - tPrazo) * 6)), '#a16207', 0, { a: appear(t, tPrazo, 0.4), rot: 0.05 });
        chip(ctx, 5550, 220, 'o prazo continua correndo', '#fde68a', appear(t, tPrazo, 0.4), { size: 26 });
        ctx.restore();
      });
      bokeh(ctx, cam2, t, 13, 8, 0.07);
    },
    overlay(ctx, t) { source(ctx, 'Kaspersky, via g1 (1/9/2026)', vis(t, t500, tVoce, 0.5, 0.4)); },
  };
}

// ================================================================ Cena 07: como separar (a promessa da cena 1): pela porta de entrada; o aviso oficial não recebe pagamento; onde pagar; não clica no link
function scene07(K) {
  const tComo = K('Então, como separar'), tPorta = K('Pela porta de entrada'), tGov = K('O governo federal começou'), tNaoRec = K('mas esse aviso não recebe'), tMostra = K('ele mostra a passagem'), tIndica = K('e indica onde pagar');
  const tSP = K('Em São Paulo'), tSiga = K('no site Siga Fácil'), tOutras = K('Nas outras estradas'), tFed = K('e nas rodovias federais'), tCNH = K('aplicativo CNH do Brasil');
  const tRegra = K('A regra é uma só'), tLink = K('não clica no link'), tAbre = K('Abre você mesmo'), tDigita = K('digita a placa'), tConf = K('e confere se a passagem existe'), tSe = K('Se ela não aparecer lá'), tGolpe = K('a mensagem era golpe');
  const cam = [
    { t: 0, x: 960, y: 470, z: 1.02, dz: 0.005 }, { t: tPorta, x: 960, y: 460, z: 1.06, d: 1.4 },
    { t: tGov - 0.3, x: 2400, y: 470, z: 1.0, d: 1.4 }, { t: tMostra, x: 2300, y: 450, z: 1.08, d: 1.4 },
    { t: tSP - 0.3, x: 3800, y: 470, z: 1.0, d: 1.4, dx: 3 },
    { t: tRegra - 0.3, x: 5200, y: 470, z: 1.0, d: 1.4 }, { t: tAbre, x: 5100, y: 470, z: 1.06, d: 1.4 }, { t: tSe, x: 5400, y: 470, z: 1.06, d: 1.4 },
  ];
  const sfx = [[tComo, 'pop', 0.3], [tPorta, 'whoosh', 0.3], [tPorta + 0.6, 'ding', 0.3], [tGov - 0.2, 'whoosh', 0.3], [tGov + 0.3, 'notif', 0.4], [tNaoRec, 'buzz', 0.2], [tMostra, 'pop', 0.3], [tIndica, 'pop', 0.3],
    [tSP - 0.2, 'whoosh', 0.3], [tSiga, 'tap', 0.35], [tOutras, 'pop', 0.3], [tFed, 'pop', 0.3], [tCNH, 'tap', 0.35], [tRegra - 0.2, 'whoosh', 0.3], [tLink, 'hit', 0.4], [tAbre, 'key', 0.3], [tAbre + 0.3, 'key', 0.3], [tDigita, 'key', 0.3], [tConf, 'ding', 0.35], [tSe, 'pop', 0.3], [tGolpe, 'stamp', 0.45]];
  return {
    accent: P.ok, cam, sfx, impacts: [tLink], trans: 'push',
    draw(ctx, t, cam2) {
      salaFundo(ctx, cam2, 0.9, 0.6);
      zone(ctx, cam2, 900, 1100, () => {
        if (t > tGov + 0.6) return;
        const k = vis(t, 0, tGov, 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        headline(ctx, 'verdadeira ou falsa?', 960, 120, { size: 62, k: appear(t, tComo, 0.5), hl: '#14532d' });
        const kp = appear(t, tPorta, 0.5);
        celGrande(ctx, 620, 520, 0.68, (c) => telaNotif(c, t, {}), { rot: -0.04 });
        if (kp > 0) { xMark(ctx, 620, 520, 2.6, P.golpe, prog(t, tPorta + 0.2, 0.4)); chip(ctx, 620, 160 + 80, 'pelo link da mensagem', P.golpe, kp, { size: 24 }); }
        celGrande(ctx, 1300, 520, 0.68, (c) => telaSite(c, t, { endereco: 'site oficial', cadeado: true, digEnd: prog(t, tPorta + 0.4, 1.2), digitado: 0 }), { rot: 0.04, a: kp });
        if (kp > 0) { check(ctx, 1300, 760, 1.4, P.ok, prog(t, tPorta + 1.6, 0.4)); chip(ctx, 1300, 160 + 80, 'pela porta de entrada', P.ok, kp, { size: 24 }); }
        ctx.restore();
      });
      zone(ctx, cam2, 2200, 2500, () => {
        if (t < tGov - 0.8 || t > tSP + 0.6) return;
        const k = vis(t, tGov - 0.3, tSP, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        celGrande(ctx, 2200, 480, 1.0, (c) => telaAviso(c, t, { semBotao: t > tNaoRec }), { rot: -0.03 });
        chip(ctx, 2200, 120, 'aviso do governo federal', '#86efac', appear(t, tGov, 0.4), { size: 26 });
        chip(ctx, 2760, 330, 'não recebe pagamento', '#fca5a5', appear(t, tNaoRec + 0.4, 0.4), { size: 26 });
        chip(ctx, 2760, 430, 'mostra a passagem', '#86efac', appear(t, tMostra, 0.4), { size: 26 });
        chip(ctx, 2760, 530, 'indica onde pagar', '#86efac', appear(t, tIndica, 0.4), { size: 26 });
        ctx.restore();
      });
      zone(ctx, cam2, 3700, 3900, () => {
        if (t < tSP - 0.8 || t > tRegra + 0.6) return;
        const k = vis(t, tSP - 0.3, tRegra, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        [[tSP, 'SÃO PAULO', 'site Siga Fácil', 3300], [tOutras, 'OUTRAS ESTRADAS', 'site ou app da concessionária', 3800], [tFed, 'RODOVIAS FEDERAIS', 'app CNH do Brasil', 4300]].forEach(([tt, a2, b2, x], i) => {
          const kk = appear(t, tt, 0.5); if (kk <= 0) return;
          ctx.save(); ctx.globalAlpha *= clamp(kk * 2); ctx.translate(x, 470 + (1 - ease.out(kk)) * 40);
          fillRR(ctx, -230, -170, 460, 340, 22, 'rgba(15,23,42,0.88)'); strokeRR(ctx, -230, -170, 460, 340, 22, P.ok, 4);
          text(ctx, a2, 0, -110, { size: 28, weight: 900, color: '#86efac', letter: 2 });
          fillRR(ctx, -160, -60, 320, 60, 30, '#e2e8f0'); text(ctx, b2, 0, -29, { size: b2.length > 22 ? 19 : 24, weight: 900, color: '#0f172a' });
          ctx.restore();
          if (i === 0) { ctx.save(); ctx.globalAlpha *= kk; fillRR(ctx, 3220, 530, 160, 60, 10, '#e5e7eb'); text(ctx, 'TAG', 3300, 560, { size: 30, weight: 900, color: '#0f172a' }); ctx.restore(); }
          if (i === 2) { ctx.save(); ctx.globalAlpha *= appear(t, tCNH, 0.4); fillRR(ctx, 4240, 520, 120, 120, 26, '#15803d'); text(ctx, 'CNH', 4300, 580, { size: 34, weight: 900, color: '#ffffff' }); ctx.restore(); }
        });
        ctx.restore();
      });
      zone(ctx, cam2, 5000, 5500, () => {
        if (t < tRegra - 0.8) return;
        const k = appear(t, tRegra - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        const kl = appear(t, tLink, 0.4);
        if (kl > 0) { ctx.save(); ctx.translate(5200, 140); fillRR(ctx, -260, -40, 520, 80, 40, '#1e3a8a'); text(ctx, 'clique para pagar ›', 0, 2, { size: 30, weight: 900, color: '#bfdbfe' }); ctx.restore(); crossOut(ctx, 4950, 150, 5450, 130, P.golpe, prog(t, tLink + 0.2, 0.4), 12); }
        headline(ctx, 'a regra é uma só', 5200, 250, { size: 56, k: vis(t, tRegra, tLink + 0.3, 0.4, 0.3), hl: '#14532d' });
        headline(ctx, 'não clica no link', 5200, 250, { size: 56, k: appear(t, tLink + 0.3, 0.4), hl: '#7f1d1d' });
        celGrande(ctx, 4950, 590, 0.7, (c) => telaSite(c, t, { endereco: 'site oficial', cadeado: true, digEnd: prog(t, tAbre, 1.4), digitado: prog(t, tDigita, 1.0), achou: appear(t, tConf, 0.5) }), { rot: -0.03, a: appear(t, tAbre - 0.2, 0.4) });
        chip(ctx, 4950, 360 - 40 + 0, 'você digita o endereço', P.ok, vis(t, tAbre, tSe, 0.4, 0.4), { size: 22 });
        const ks = appear(t, tSe, 0.5);
        if (ks > 0) { celGrande(ctx, 5480, 590, 0.7, (c) => telaSite(c, t, { endereco: 'site oficial', cadeado: true, digitado: 1, nada: true }), { rot: 0.03, a: ks }); }
        if (t > tGolpe) { rectStamp(ctx, 5480, 430, 320, 100, 'ERA GOLPE', '#e11d48', prog(t, tGolpe, 0.5), -0.1, 44); }
        ctx.restore();
      });
      bokeh(ctx, cam2, t, 15, 8, 0.07);
    },
    overlay(ctx, t) { source(ctx, 'CBN (10/11/2026); ANTT; Siga Fácil', vis(t, tGov, tRegra, 0.5, 0.4)); },
  };
}

// ================================================================ Cena 08: três lugares para o seu dinheiro; só um é obrigatório; tag ou pagar no mesmo dia; o pórtico não esquece
function scene08(K) {
  const tTres = K('o seu dinheiro pode ir para três lugares'), tEstr = K('para a estrada'), tMulta = K('para a multa'), tGolpe = K('ou para o golpe'), tSo = K('Só o primeiro é obrigatório'), tHab = K('Os outros dois dependem');
  const tTag = K('Com tag, o pórtico cobra'), tSem = K('Sem tag, chegou da viagem'), tNao = K('O pórtico não esquece');
  const cam = [
    { t: 0, x: 960, y: 500, z: 0.98, dz: 0.006 }, { t: tGolpe, x: 960, y: 440, z: 1.04, d: 1.4 }, { t: tSo, x: 860, y: 460, z: 1.04, d: 1.2 },
    { t: tTag - 0.3, x: 2400, y: 470, z: 1.0, d: 1.4 }, { t: tNao - 0.3, x: 3800, y: 460, z: 1.02, d: 1.2 }, { t: tNao + 1.5, x: 3800, y: 420, z: 1.12, d: 2.0, dz: 0.003 },
  ];
  const sfx = [[tTres, 'pop', 0.3], [tEstr, 'whoosh', 0.3, { dur: 0.4 }], [tMulta, 'whoosh', 0.3, { dur: 0.4 }], [tGolpe, 'whoosh', 0.3, { dur: 0.4 }], [tSo, 'ding', 0.4], [tHab, 'pop', 0.25], [tTag - 0.2, 'whoosh', 0.3], [tTag + 0.3, 'bipTag', 0.45], [tSem, 'tap', 0.35], [tSem + 1.0, 'ding', 0.3], [tNao - 0.2, 'whoosh', 0.3], [tNao + 0.4, 'flashPortico', 0.35]];
  return {
    accent: P.emp, cam, sfx, impacts: [tSo], trans: 'push',
    draw(ctx, t, cam2) {
      serraFundo(ctx, cam2, 0.9, 0.3);
      zone(ctx, cam2, 800, 1100, () => {
        if (t > tTag + 0.6) return;
        const k = vis(t, 0, tTag, 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        headline(ctx, 'três lugares', 960, 140, { size: 64, k: vis(t, tTres, tEstr + 0.4, 0.4, 0.3), hl: '#1e3a8a' });
        carroLado(ctx, 960, 680, 0.85, { cor: '#dc2626' });
        tresSetas(ctx, 960, 620, t, [appear(t, tEstr, 0.5), appear(t, tMulta, 0.5), appear(t, tGolpe, 0.5)], appear(t, tSo, 0.5));
        chip(ctx, 960 - 520, 120 + 80, 'obrigatório', P.emp, appear(t, tSo + 0.2, 0.4), { size: 26 });
        chip(ctx, 1220, 760, 'os outros dois dependem de um hábito', '#fde68a', appear(t, tHab, 0.4), { size: 26 });
        ctx.restore();
      });
      zone(ctx, cam2, 2300, 2500, () => {
        if (t < tTag - 0.8 || t > tNao + 0.6) return;
        const k = vis(t, tTag - 0.3, tNao, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        chip(ctx, 1980, 120, 'COM TAG', P.ok, appear(t, tTag, 0.4), { size: 30 });
        portico(ctx, 1980, 260, 0.4, t);
        { const kc = prog(t, tTag + 0.4, 1.0); if (kc > 0) { moedaLaranja(ctx, 1980, lerp(440, 620, ease.inOut(kc)), 22, kc < 1 ? 1 : 0.0001); if (kc >= 1) bilhete(ctx, 1980, 640, 0.6, { carimbo: 'PAGO', carimboCor: '#16a34a' }); } }
        fillRR(ctx, 1865, 360, 230, 130, 14, Math.sin((t - tTag) * 20) > 0 && t < tTag + 1.4 ? P.ok : '#e5e7eb'); text(ctx, 'TAG', 1980, 425, { size: 44, weight: 900, color: '#0f172a' });
        chip(ctx, 1980, 760, 'cobra sozinho · sem prazo', P.ok, appear(t, tTag + 0.8, 0.4), { size: 24 });
        const ks = appear(t, tSem, 0.5);
        chip(ctx, 2820, 160, 'SEM TAG', '#fde68a', ks, { size: 30 });
        if (ks > 0) { celGrande(ctx, 2820, 520, 0.6, (c) => telaSite(c, t, { endereco: 'site oficial', cadeado: true, digitado: 1, nada: t > tSem + 1.0 }), { a: ks, rot: 0.03 }); chip(ctx, 2820, 820 - 40, 'chegou, paga no mesmo dia', '#fde68a', appear(t, tSem + 0.6, 0.4), { size: 24 }); }
        ctx.restore();
      });
      zone(ctx, cam2, 3700, 3900, () => {
        if (t < tNao - 0.8) return;
        const k = appear(t, tNao - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        estradaVista(ctx, 3800, 470, 1500, 760, t, { vel: 0.8, port: 0.55 + 0.05 * Math.sin(t), flash: Math.max(0, 1 - Math.abs(t - tNao - 0.5) / 0.3) * 0.6 });
        headline(ctx, 'o pórtico não esquece', 3800, 160, { size: 62, k: appear(t, tNao + 0.2, 0.5), hl: '#1e3a8a' });
        ctx.restore();
      });
      neblina(ctx, cam2, t, 17, 0.05);
    },
    overlay(ctx, t) {},
  };
}

// ================================================================ Cena 09: janeiro de novo (já sabe o que fazer); inscrição na tag e no painel do pórtico; o videogame
function scene09(K) {
  const tEntao = K('Então, se em janeiro'), tNao = K('não clica, abre o site'), tSe = K('Se esse vídeo te ajudou'), tInsc = K('se inscreve no canal'), tProx = K('No próximo, a gente volta'), tVideo = K('o videogame'), tCamp = K('o campeão daquela lista'), tSera = K('Será que com ele'), tAte = K('Até lá');
  const tPress = tInsc + 0.4;
  const cam = [
    { t: 0, x: 960, y: 470, z: 1.04, dz: 0.005 }, { t: tNao, x: 1000, y: 470, z: 1.08, d: 1.4 },
    { t: tSe - 0.3, x: 2400, y: 480, z: 1.0, d: 1.4 }, { t: tInsc, x: 2400, y: 440, z: 1.08, d: 1.0 },
    { t: tProx - 0.3, x: 3800, y: 480, z: 1.0, d: 1.6, dx: 3 }, { t: tSera, x: 3850, y: 470, z: 1.08, d: 2.0, dz: 0.003 },
  ];
  const sfx = [[tEntao, 'notif', 0.4], [tNao, 'buzz', 0.2], [tNao + 0.6, 'key', 0.3], [tNao + 1.0, 'key', 0.3], [tNao + 1.6, 'ding', 0.3], [tSe - 0.2, 'whoosh', 0.3], [tPress, 'bipTag', 0.55], [tPress + 0.3, 'flip', 0.35, { dur: 0.5 }], [tPress + 0.8, 'ding', 0.45], [tPress + 0.9, 'sparkle', 0.35],
    [tProx - 0.2, 'whoosh', 0.3], [tVideo, 'pop', 0.35], [tCamp, 'pop', 0.3], [tSera, 'riser', 0.25]];
  return {
    accent: P.ok, cam, sfx, impacts: [tPress + 0.8], trans: 'push',
    draw(ctx, t, cam2) {
      salaFundo(ctx, cam2, 0.95, 0.5);
      zone(ctx, cam2, 900, 1100, () => {
        if (t > tSe + 0.6) return;
        const k = vis(t, 0, tSe, 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        headline(ctx, 'janeiro', 960, 110, { size: 64, k: appear(t, tEntao, 0.4), hl: '#1e3a8a' });
        celGrande(ctx, 700, 520, 0.7 * (1 + 0.05 * Math.sin(Math.PI * prog(t, tEntao, 0.5))), (c) => telaNotif(c, t, {}), { rot: -0.04 });
        chip(ctx, 700, 160 + 80, 'aquela mensagem', '#e2e8f0', vis(t, tEntao + 0.3, tNao, 0.4, 0.3), { size: 26 });
        if (t > tNao) { xMark(ctx, 700, 540, 2.4, P.golpe, prog(t, tNao, 0.4)); chip(ctx, 700, 240, 'não clica', P.golpe, appear(t, tNao, 0.4), { size: 26 }); }
        celGrande(ctx, 1240, 520, 0.7, (c) => telaSite(c, t, { endereco: 'site oficial', cadeado: true, digEnd: prog(t, tNao + 0.4, 1.0), digitado: prog(t, tNao + 1.4, 1.0), achou: appear(t, tNao + 2.5, 0.4) }), { rot: 0.04, a: appear(t, tNao + 0.2, 0.4) });
        chip(ctx, 1240, 240, 'abre o site oficial', P.ok, appear(t, tNao + 0.4, 0.4), { size: 26 });
        ctx.restore();
      });
      zone(ctx, cam2, 2300, 2500, () => {
        if (t < tSe - 0.8 || t > tProx + 0.6) return;
        const k = vis(t, tSe - 0.3, tProx, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        const on = t > tPress + 0.8;
        painelPortico(ctx, 2400, 420, 1.0, t, on ? 'INSCRITO' : 'INSCREVA-SE', on ? '#4ade80' : '#fde68a');
        const kt = Math.sin(Math.PI * prog(t, tPress, 0.6));
        fillRR(ctx, 2285, 640, 230, 130, 14, t > tPress ? P.ok : '#e5e7eb'); text(ctx, 'TAG', 2400, 705, { size: 44, weight: 900, color: '#0f172a' });
        if (kt > 0) { ctx.save(); ctx.globalAlpha *= kt; const g = ctx.createRadialGradient(2400, 705, 0, 2400, 705, 260); g.addColorStop(0, 'rgba(74,222,128,0.6)'); g.addColorStop(1, 'rgba(74,222,128,0)'); ctx.fillStyle = g; ctx.fillRect(2140, 445, 520, 520); ctx.restore(); }
        sparks(ctx, t, tPress + 0.8, 2400, 270, P.voce, 22);
        chip(ctx, 2400, 120, 'te ajudou a viajar mais tranquilo?', '#e2e8f0', appear(t, tSe, 0.4), { size: 28 });
        ctx.restore();
      });
      zone(ctx, cam2, 3700, 4100, () => {
        if (t < tProx - 0.8) return;
        const k = appear(t, tProx - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        arvore(ctx, 3420, 450, 0.75, t);
        controleGame(ctx, 3720, 760 - 40, 0.8 * lerp(0.6, 1, ease.back(appear(t, tVideo, 0.5))), t);
        chip(ctx, 4280, 200, 'próximo vídeo: o videogame', P.amber, appear(t, tVideo, 0.4), { size: 30 });
        bigNum(ctx, '72%?', 4280, 400, appear(t, tCamp, 0.5), { size: 130, color: '#fca5a5' });
        text(ctx, 'o campeão da lista', 4280, 500, { size: 30, weight: 900, color: '#e2e8f0', alpha: appear(t, tCamp + 0.3, 0.4) });
        headline(ctx, 'é verdade?', 4280, 640, { size: 64, k: appear(t, tSera, 0.5), hl: '#7c2d12' });
        ctx.restore();
      });
      bokeh(ctx, cam2, t, 19, 9);
    },
    overlay(ctx, t) {},
  };
}

export const SCENES = [
  { id: '01', name: 'janeiro-a-mensagem', build: scene01 },
  { id: '02', name: 'o-portico', build: scene02 },
  { id: '03', name: 'tag-placa-e-prazo', build: scene03 },
  { id: '04', name: 'para-onde-vai-o-pedagio', build: scene04 },
  { id: '05', name: 'a-multa', build: scene05 },
  { id: '06', name: 'o-golpe', build: scene06 },
  { id: '07', name: 'como-separar', build: scene07 },
  { id: '08', name: 'tres-lugares', build: scene08 },
  { id: '09', name: 'fechamento', build: scene09 },
];
