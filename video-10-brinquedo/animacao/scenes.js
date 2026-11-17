// Vídeo 10: brinquedo de Natal, quem fica com cada real da caixa.
// Cada cena recebe K(frase) = instante (s, relativo à cena) em que a frase começa na narração.
// Conceito: a sala de casa na noite de Natal é o palco e a caixa da boneca com a etiqueta de R$ 100 é o fio condutor.
// Regras: câmera sempre andando, nenhum trecho de mais de ~6 s sem algo novo, transições discretas (corte ou 'push'),
// uma só virada de efeito (o papel de presente rasga na entrada da cena 5), sem música, checagem de silhueta.
// Aprendizados de referências: o vídeo abre já na caixa com "até 70%?" (funciona sem som), a promessa da cena 1 é paga na cena 8.
import { W, H, C, clamp, lerp, prog, ease, appear, text, font, rr, fillRR, strokeRR, circle, hexA, source } from './lib.js';
import { glowText, counting, shockRing, sparks, layer } from './fx.js';

const P = { ink: '#1f2937', paper: '#fbfaf5', red: '#dc2626', ok: '#22c55e', amber: '#fbbf24' };
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


function pessoa(ctx, x, y, s, cor, a = 1) {
  if (a <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= a; ctx.fillStyle = cor;
  ctx.beginPath(); ctx.arc(0, -46, 22, 0, 6.283); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-34, 50); ctx.lineTo(-34, 4); ctx.quadraticCurveTo(-34, -18, -12, -18); ctx.lineTo(12, -18); ctx.quadraticCurveTo(34, -18, 34, 4); ctx.lineTo(34, 50); ctx.closePath(); ctx.fill();
  ctx.restore();
}
// casa (telhado, porta, janela) com etiqueta de conta pendurada

// ================================================================ cenário: a sala de casa na noite de Natal (fundo com paralaxe e desfoque)
// parede com papel listrado, janela com a cidade à noite, árvore de Natal com pisca-pisca, sofá, abajur aceso, quadro, tapete e piso de madeira.
let SALA = null;
function salaFundo(ctx, cam, t, a = 1, escuro = 0) {
  if (!SALA) {
    const Wd = 2600, Hd = 1400, r = rng(17);
    const c = document.createElement('canvas'); c.width = Wd; c.height = Hd; const g = c.getContext('2d');
    g.fillStyle = '#4a3b46'; g.fillRect(0, 0, Wd, Hd);
    for (let x = 0; x < Wd; x += 70) { g.fillStyle = (x / 70) % 2 ? '#4f404b' : '#463742'; g.fillRect(x, 0, 70, 900); }
    // rodapé
    g.fillStyle = '#2d2128'; g.fillRect(0, 880, Wd, 24);
    // janela com a cidade à noite
    g.fillStyle = '#e8dcc8'; g.fillRect(860, 150, 520, 420);
    const ng = g.createLinearGradient(0, 170, 0, 550); ng.addColorStop(0, '#0b1733'); ng.addColorStop(1, '#22365e'); g.fillStyle = ng; g.fillRect(880, 170, 480, 380);
    for (let i = 0; i < 9; i++) { const bx = 880 + i * 56, bh = 120 + r() * 200; g.fillStyle = '#121d38'; g.fillRect(bx, 550 - bh, 50, bh); for (let j = 0; j < 12; j++) if (r() > 0.55) { g.fillStyle = r() > 0.5 ? '#fde68a' : '#fbbf24'; g.fillRect(bx + 6 + (j % 3) * 14, 560 - bh + Math.floor(j / 3) * 26, 8, 12); } }
    g.fillStyle = '#e8dcc8'; g.fillRect(1112, 170, 16, 380); g.fillRect(880, 352, 480, 14);
    // cortinas
    g.fillStyle = '#7f1d1d'; g.fillRect(800, 130, 90, 470); g.fillRect(1350, 130, 90, 470);
    // quadro na parede
    g.fillStyle = '#b08a55'; g.fillRect(260, 260, 300, 220); g.fillStyle = '#7aa0b8'; g.fillRect(280, 280, 260, 180); g.fillStyle = '#3f6b4a'; g.beginPath(); g.moveTo(280, 460); g.lineTo(380, 340); g.lineTo(470, 420); g.lineTo(540, 360); g.lineTo(540, 460); g.closePath(); g.fill();
    // sofá
    g.fillStyle = '#5b6b8c'; g.fillRect(140, 640, 620, 220); g.fillStyle = '#6b7ca0'; g.fillRect(170, 580, 560, 110); g.fillStyle = '#4b5a78'; g.fillRect(120, 640, 70, 230); g.fillRect(710, 640, 70, 230);
    g.fillStyle = '#c2410c'; g.fillRect(240, 600, 120, 90); g.fillStyle = '#facc15'; g.fillRect(560, 610, 110, 80);
    // abajur aceso com o brilho quente na parede
    const lg = g.createRadialGradient(1640, 420, 10, 1640, 420, 520); lg.addColorStop(0, 'rgba(255,200,120,0.45)'); lg.addColorStop(1, 'rgba(255,200,120,0)'); g.fillStyle = lg; g.fillRect(1100, 0, 1100, 1000);
    g.fillStyle = '#3b2a1f'; g.fillRect(1632, 470, 16, 400); g.fillRect(1580, 860, 120, 20);
    g.fillStyle = '#f5deb3'; g.beginPath(); g.moveTo(1570, 470); g.lineTo(1710, 470); g.lineTo(1675, 360); g.lineTo(1605, 360); g.closePath(); g.fill();
    // árvore de Natal grande com pisca-pisca e presentes
    g.fillStyle = '#5a3a22'; g.fillRect(2045, 760, 50, 120);
    for (let i = 0; i < 5; i++) { const yb = 800 - i * 130, wb = 330 - i * 55; g.fillStyle = i % 2 ? '#14532d' : '#166534'; g.beginPath(); g.moveTo(2070 - wb, yb); g.lineTo(2070, yb - 200); g.lineTo(2070 + wb, yb); g.closePath(); g.fill(); }
    const cols = ['#ef4444', '#facc15', '#38bdf8', '#f472b6', '#4ade80'];
    for (let i = 0; i < 60; i++) { const yy = 220 + r() * 560, ww = (yy - 160) * 0.5; g.fillStyle = cols[i % 5]; g.beginPath(); g.arc(2070 + (r() - 0.5) * ww * 1.6, yy, 9, 0, 6.283); g.fill(); }
    g.fillStyle = '#facc15'; g.beginPath(); for (let i = 0; i < 10; i++) { const an = -1.571 + (i / 10) * 6.283, rr2 = i % 2 ? 20 : 46; g.lineTo(2070 + Math.cos(an) * rr2, 150 + Math.sin(an) * rr2); } g.closePath(); g.fill();
    for (const [px, pw, ph, pc] of [[1830, 150, 110, '#dc2626'], [2000, 120, 90, '#2563eb'], [2160, 170, 120, '#16a34a'], [2320, 110, 80, '#a855f7']]) { g.fillStyle = pc; g.fillRect(px, 880 - ph, pw, ph); g.fillStyle = '#facc15'; g.fillRect(px + pw / 2 - 8, 880 - ph, 16, ph); }
    // tapete e piso de madeira
    const fl = g.createLinearGradient(0, 904, 0, Hd); fl.addColorStop(0, '#6b4a33'); fl.addColorStop(1, '#3a281c'); g.fillStyle = fl; g.fillRect(0, 904, Wd, Hd - 904);
    g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 3; for (let y = 940; y < Hd; y += 60) { g.beginPath(); g.moveTo(0, y); g.lineTo(Wd, y); g.stroke(); }
    g.fillStyle = '#7f1d1d'; g.beginPath(); g.ellipse(1300, 1060, 700, 110, 0, 0, 6.283); g.fill(); g.fillStyle = '#991b1b'; g.beginPath(); g.ellipse(1300, 1060, 600, 85, 0, 0, 6.283); g.fill();
    const tmp = document.createElement('canvas'); tmp.width = Wd; tmp.height = Hd; const t2 = tmp.getContext('2d');
    t2.filter = 'blur(12px)'; for (const dx of [-Wd, 0, Wd]) t2.drawImage(c, dx, 0); SALA = tmp;
  }
  layer(ctx, cam, 0.35, () => {
    ctx.save(); ctx.globalAlpha *= a;
    const cx = cam.x - (cam.x - 960) * 0.65, k0 = Math.floor((cx - 1500 + 340) / 2600), k1 = Math.floor((cx + 1500 + 340) / 2600);
    for (let k = k0; k <= k1; k++) ctx.drawImage(SALA, -340 + k * 2600, -160);
    ctx.fillStyle = `rgba(14,8,20,${0.56 + 0.25 * escuro})`; ctx.fillRect(-340 + k0 * 2600, -160, (k1 - k0 + 1) * 2600, 1400);
    // o pisca-pisca da árvore pisca de verdade (por cima do fundo escurecido)
    const r = rng(23), cols = ['#ef4444', '#facc15', '#38bdf8', '#f472b6', '#4ade80'];
    for (let k = k0; k <= k1; k++) for (let i = 0; i < 26; i++) {
      const yy = 220 + r() * 560, ww = (yy - 160) * 0.5, px = -340 + k * 2600 + 2070 + (r() - 0.5) * ww * 1.6, py = yy - 160, on = 0.5 + 0.5 * Math.sin(t * 2.2 + i * 1.7);
      const gg = ctx.createRadialGradient(px, py, 0, px, py, 26); gg.addColorStop(0, hexA(cols[i % 5], 0.55 * on)); gg.addColorStop(1, hexA(cols[i % 5], 0)); ctx.fillStyle = gg; ctx.fillRect(px - 26, py - 26, 52, 52);
    }
    ctx.restore();
  });
}
// luzinhas desfocadas perto da câmera (camada da frente)
function luzinhas(ctx, cam, t, seed = 1, n = 9, a = 0.12) {
  const r = rng(seed), cols = ['#fca5a5', '#fde68a', '#93c5fd', '#f9a8d4', '#86efac'];
  layer(ctx, cam, 1.45, () => {
    for (let i = 0; i < n; i++) {
      const x = r() * 2600 - 340 + cam.x - 960, y = r() * 1100 - 100, rad = 26 + r() * 56, ph = r() * 6.28, c = cols[i % 5];
      const g = ctx.createRadialGradient(x, y + Math.sin(t * 0.3 + ph) * 10, 0, x, y, rad);
      g.addColorStop(0, hexA(c, a * (0.55 + 0.45 * Math.sin(t * 0.8 + ph)))); g.addColorStop(1, hexA(c, 0));
      ctx.fillStyle = g; ctx.fillRect(x - rad, y - rad - 12, rad * 2, rad * 2 + 24);
    }
  });
}

// ================================================================ objetos (checagem de silhueta feita em cada um)
// boneca de frente: cabeça grande, franja, marias-chiquinhas com elástico, vestido rodado com gola, braços e pernas curtos
function boneca(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  const pele = '#f2c3a0', cabelo = '#7c3f1d';
  fillRR(ctx, -46, 150, 34, 120, 14, pele); fillRR(ctx, 12, 150, 34, 120, 14, pele);
  fillRR(ctx, -56, 252, 52, 30, 14, '#b91c1c'); fillRR(ctx, 4, 252, 52, 30, 14, '#b91c1c');
  ctx.save(); ctx.translate(-92, 10); ctx.rotate(0.35 + (o.aceno || 0)); fillRR(ctx, -18, 0, 36, 140, 18, pele); ctx.restore();
  ctx.save(); ctx.translate(92, 10); ctx.rotate(-0.35); fillRR(ctx, -18, 0, 36, 140, 18, pele); ctx.restore();
  ctx.fillStyle = '#ec4899'; ctx.beginPath(); ctx.moveTo(-70, -10); ctx.lineTo(70, -10); ctx.lineTo(150, 170); ctx.quadraticCurveTo(0, 200, -150, 170); ctx.closePath(); ctx.fill();
  for (const [bx, by] of [[-60, 60], [0, 40], [60, 70], [-90, 140], [-20, 120], [50, 140], [100, 130]]) circle(ctx, bx, by, 9, 'rgba(255,255,255,0.55)');
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(-56, -12); ctx.quadraticCurveTo(0, 30, 56, -12); ctx.lineTo(40, -22); ctx.lineTo(-40, -22); ctx.closePath(); ctx.fill();
  circle(ctx, -128, -150, 46, cabelo); circle(ctx, 128, -150, 46, cabelo);
  fillRR(ctx, -104, -168, 30, 34, 10, '#facc15'); fillRR(ctx, 74, -168, 30, 34, 10, '#facc15');
  circle(ctx, 0, -130, 100, cabelo); circle(ctx, 0, -112, 86, pele);
  ctx.fillStyle = cabelo; ctx.beginPath(); ctx.moveTo(-92, -130); ctx.quadraticCurveTo(-80, -232, 0, -230); ctx.quadraticCurveTo(80, -232, 92, -130); ctx.quadraticCurveTo(40, -170, 0, -150); ctx.quadraticCurveTo(-40, -172, -92, -130); ctx.closePath(); ctx.fill();
  for (const ex of [-32, 32]) { circle(ctx, ex, -112, 15, '#1f2937'); circle(ctx, ex + 5, -117, 5, '#ffffff'); }
  circle(ctx, -54, -82, 13, 'rgba(244,114,182,0.45)'); circle(ctx, 54, -82, 13, 'rgba(244,114,182,0.45)');
  ctx.strokeStyle = '#9f1239'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, -84, 20, 0.25, Math.PI - 0.25); ctx.stroke();
  ctx.restore();
}
// caixa de brinquedo de loja: frente com janela de plástico (reflexo), faixa do nome, berço de papelão, lateral e tampa em perspectiva,
// aba de pendurar com furo, faixa etária, selo de certificação e código de barras. o.aba (0..1) abre a tampa de cima.
function caixaBrinquedo(ctx, x, y, s, o = {}) {
  const W2 = 560, H2 = 760, D = 120, L = -W2 / 2, T = -H2 / 2, aba = clamp(o.aba || 0);
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  if (!o.semSombra) sombraChao(ctx, 40, -T + 30, 420, 0.5);
  drawDoc(ctx, 'caixa' + (o.key || ''), 860, 1000, (ctx) => {
    ctx.save(); papelSombra(ctx);
    ctx.fillStyle = '#9d174d'; ctx.beginPath(); ctx.moveTo(-L, T); ctx.lineTo(-L + D, T - D * 0.5); ctx.lineTo(-L + D, -T - D * 0.5); ctx.lineTo(-L, -T); ctx.closePath(); ctx.fill();
    ctx.fillStyle = aba > 0 ? '#3b0a24' : '#f9a8d4'; ctx.beginPath(); ctx.moveTo(L, T); ctx.lineTo(L + D, T - D * 0.5); ctx.lineTo(-L + D, T - D * 0.5); ctx.lineTo(-L, T); ctx.closePath(); ctx.fill();
    const g = ctx.createLinearGradient(L, T, -L, -T); g.addColorStop(0, '#f472b6'); g.addColorStop(1, '#db2777'); ctx.fillStyle = g; ctx.fillRect(L, T, W2, H2);
    ctx.restore();
    if (aba <= 0) { ctx.fillStyle = '#db2777'; rr(ctx, -110, T - 70, 220, 80, 20); ctx.fill(); ctx.fillStyle = '#1f2937'; rr(ctx, -40, T - 50, 80, 26, 13); ctx.fill(); }
    fillRR(ctx, L + 30, T + 30, W2 - 60, 110, 18, '#fde047');
    text(ctx, 'BONECA QUE FALA', 0, T + 86, { size: 48, weight: 900, color: '#9d174d', letter: 2 });
    const wx = L + 50, wy = T + 170, ww = W2 - 100, wh = 450;
    fillRR(ctx, wx, wy, ww, wh, 26, '#fdf2f8');
    ctx.save(); rr(ctx, wx, wy, ww, wh, 26); ctx.clip();
    ctx.fillStyle = '#fbcfe8'; for (let i = 0; i < 8; i++) ctx.fillRect(wx, wy + i * 60, ww, 26);
    if (!o.vazia) boneca(ctx, 0, wy + 250, 0.78, { aceno: o.aceno });
    ctx.fillStyle = 'rgba(255,255,255,0.10)'; ctx.fillRect(wx, wy, ww, wh);
    ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.beginPath(); ctx.moveTo(wx + 40, wy); ctx.lineTo(wx + 140, wy); ctx.lineTo(wx + 40, wy + wh); ctx.lineTo(wx - 60, wy + wh); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.moveTo(wx + 180, wy); ctx.lineTo(wx + 220, wy); ctx.lineTo(wx + 120, wy + wh); ctx.lineTo(wx + 80, wy + wh); ctx.closePath(); ctx.fill();
    ctx.restore();
    strokeRR(ctx, wx, wy, ww, wh, 26, '#9d174d', 8);
    fillRR(ctx, L + 40, -T - 120, 120, 90, 14, '#ffffff'); text(ctx, '3+', L + 100, -T - 70, { size: 54, weight: 900, color: '#1f2937' });
    if (!o.semSelo) { circle(ctx, L + 230, -T - 75, 44, '#ffffff'); ctx.strokeStyle = '#1d4ed8'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(L + 230, -T - 75, 34, 0, 6.283); ctx.stroke();
      text(ctx, 'SELO', L + 230, -T - 80, { size: 18, weight: 900, color: '#1d4ed8' }); text(ctx, 'SEGURANÇA', L + 230, -T - 62, { size: 11, weight: 900, color: '#1d4ed8' }); }
    fillRR(ctx, -L - 240, -T - 125, 200, 100, 8, '#ffffff');
    const r = rng(5); let xx = -L - 228; ctx.fillStyle = '#111827'; while (xx < -L - 52) { const bw = 2 + Math.floor(r() * 4); ctx.fillRect(xx, -T - 115, bw, 70); xx += bw + 2 + Math.floor(r() * 3); }
  });
  // a tampa de cima abrindo (gira em volta da aresta da frente e fica em pé)
  if (aba > 0) {
    // a tampa gira em volta da aresta de trás e fica inclinada para trás, deixando a boca escura à vista
    const e = ease.out(aba), hx = D, hy = -D * 0.5, ty = -lerp(0, 160, e), tx = lerp(-D, 40, e);
    ctx.fillStyle = '#f472b6'; ctx.beginPath(); ctx.moveTo(L + hx, T + hy); ctx.lineTo(-L + hx, T + hy); ctx.lineTo(-L + hx + tx, T + hy + ty + (1 - e) * D * 0.5); ctx.lineTo(L + hx + tx, T + hy + ty + (1 - e) * D * 0.5); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(L + hx + tx * 0.5 + 30, T + hy + ty * 0.6, W2 - 60, 10);
  }
  ctx.restore();
}
// onde fica o selo da caixa (para a lupa), em coordenadas do mundo
const seloDaCaixa = (x, y, s) => [x + (-280 + 230) * s, y + (380 - 75) * s];
// etiqueta de preço de loja (cartão com furo e barbante)
function etiquetaPreco(ctx, x, y, s, val, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? 0.1); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  if (o.fio) { ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, -76); ctx.quadraticCurveTo(o.fio[0] * 0.5, o.fio[1] * 0.4, o.fio[0], o.fio[1]); ctx.stroke(); }
  ctx.save(); papelSombra(ctx); ctx.fillStyle = o.bg || '#fffbeb';
  ctx.beginPath(); ctx.moveTo(-60, -110); ctx.lineTo(60, -110); ctx.lineTo(220, -50); ctx.lineTo(220, 110); ctx.lineTo(-220, 110); ctx.lineTo(-220, -50); ctx.closePath(); ctx.fill(); ctx.restore();
  circle(ctx, 0, -76, 16, '#9ca3af');
  text(ctx, val, 0, 30, { size: o.size || 100, weight: 900, color: o.cor || '#111827' });
  ctx.restore();
}
// barra do preço: um quadro de 100 partes; as fatias entram da esquerda (k de 0 a 1 cada); o resto fica tracejado
// fatias: [{ v, cor, k }]. Devolve [x0, x1] de cada fatia.
function barraPreco(ctx, x, y, w, h, fatias, o = {}) {
  const u = w / 100, out = [];
  ctx.save(); ctx.globalAlpha *= o.a ?? 1;
  ctx.save(); papelSombra(ctx); fillRR(ctx, x - 10, y - 10, w + 20, h + 20, 16, 'rgba(15,23,42,0.85)'); ctx.restore();
  let cx = x, used = 0;
  for (const f of fatias) {
    const ww = f.v * u, kk = ease.out(clamp(f.k ?? 1));
    if (kk > 0) { ctx.save(); if (f.glow) { ctx.shadowColor = hexA(f.cor, 0.8); ctx.shadowBlur = 30 * f.glow; } ctx.fillStyle = f.cor; ctx.fillRect(cx, y, Math.max(0, ww * kk - 3), h); ctx.restore(); }
    out.push([cx, cx + ww]); cx += ww; used += f.v;
  }
  if (o.resto !== false) { ctx.setLineDash([14, 10]); ctx.strokeStyle = 'rgba(203,213,225,0.7)'; ctx.lineWidth = 4; ctx.strokeRect(cx + 4, y + 4, x + w - cx - 8, h - 8); ctx.setLineDash([]);
    if ((o.restoCor || 0) > 0) { ctx.save(); ctx.globalAlpha *= clamp(o.restoCor); ctx.fillStyle = '#94a3b8'; ctx.fillRect(cx + 2, y, x + w - cx - 2, h); ctx.restore(); } }
  out.push([cx, x + w]);
  ctx.restore();
  return out;
}
// lista impressa do IBPT (folha com cabeçalho e linhas produto · porcentagem)
const LISTA = [['Videogame (console e jogos)', '72,18%'], ['Patins, skate e patinete', '52,78%'], ['Bicicleta', '45,93%'], ['Brinquedos', '39,70%'], ['Roupa infantil', '34,67%']];
function listaIBPT(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.02); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  const n = o.linhas ?? 5;
  drawDoc(ctx, 'lista' + (o.key || ''), 640, 760, (ctx) => {
    ctx.save(); papelSombra(ctx); ctx.fillStyle = '#fbfaf5'; ctx.fillRect(-320, -380, 640, 760); ctx.restore();
    ctx.fillStyle = '#1e3a8a'; ctx.fillRect(-320, -380, 640, 110);
    text(ctx, 'IMPOSTOS NO PREÇO', -290, -340, { size: 34, weight: 900, color: '#ffffff', align: 'left', letter: 2 });
    text(ctx, 'presentes do Dia das Crianças · IBPT para a ACSP', -290, -298, { size: 18, weight: 700, color: '#dbeafe', align: 'left' });
    for (let i = 0; i < LISTA.length; i++) {
      const yy = -200 + i * 100; if (i >= n) continue;
      ctx.fillStyle = i % 2 ? '#f1efe6' : '#fbfaf5'; ctx.fillRect(-300, yy - 42, 600, 84);
      text(ctx, LISTA[i][0], -280, yy, { size: 28, weight: 800, color: P.ink, align: 'left' });
      text(ctx, LISTA[i][1], 280, yy, { size: 34, weight: 900, color: '#b91c1c', align: 'right' });
    }
    for (let i = 0; i < 4; i++) { ctx.fillStyle = 'rgba(31,41,55,0.25)'; ctx.fillRect(-280, 300 + i * 20, i === 3 ? 260 : 560, 8); }
  });
  ctx.restore();
}
// posição (mundo) da linha i da lista
const linhaLista = (x, y, s, i) => [x, y + (-200 + i * 100) * s];
// calendário de mesa de bloco, só com o ano; o bloco vira quando o ano muda
function calendarioAno(ctx, x, y, s, ano, flip = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  sombraChao(ctx, 0, 230, 260, 0.5);
  ctx.save(); papelSombra(ctx); fillRR(ctx, -230, -200, 460, 420, 20, '#1f2937'); ctx.restore();
  fillRR(ctx, -200, -170, 400, 360, 12, '#ffffff');
  ctx.fillStyle = '#b91c1c'; ctx.fillRect(-200, -170, 400, 80);
  for (let i = 0; i < 8; i++) { circle(ctx, -170 + i * 48, -190, 10, '#9ca3af'); }
  ctx.save(); ctx.translate(0, 40); ctx.scale(1, 1 - 0.85 * Math.sin(Math.PI * clamp(flip)));
  text(ctx, String(ano), 0, 0, { size: 140, weight: 900, color: '#111827' });
  ctx.restore();
  ctx.restore();
}
// papel de acordo assinado (Pequim, 2006): cabeçalho, linhas datilografadas e duas assinaturas
function acordoPapel(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? 0.03); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  drawDoc(ctx, 'acordo', 640, 780, (ctx) => {
    ctx.save(); papelSombra(ctx); ctx.fillStyle = '#f7f1df'; ctx.fillRect(-320, -390, 640, 780); ctx.restore();
    text(ctx, 'ACORDO', 0, -320, { size: 52, weight: 900, color: '#3b2f1e', letter: 8 });
    text(ctx, 'fabricantes de brinquedos · Brasil e China', 0, -262, { size: 22, weight: 700, color: '#5b4a32' });
    text(ctx, 'Pequim · agosto de 2006', 0, -228, { size: 22, weight: 700, color: '#5b4a32' });
    for (let i = 0; i < 9; i++) { ctx.fillStyle = 'rgba(59,47,30,0.35)'; ctx.fillRect(-270, -170 + i * 34, i === 8 ? 300 : 540, 9); }
    for (let i = 0; i < 3; i++) { ctx.fillStyle = 'rgba(127,29,29,0.45)'; ctx.fillRect(-270, 140 + i * 34, i === 2 ? 220 : 480, 10); }
    ctx.strokeStyle = '#3b2f1e'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-270, 300); ctx.lineTo(-40, 300); ctx.moveTo(40, 300); ctx.lineTo(270, 300); ctx.stroke();
    ctx.strokeStyle = '#1e3a8a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-250, 290); ctx.bezierCurveTo(-200, 240, -170, 320, -120, 270); ctx.bezierCurveTo(-90, 250, -70, 300, -60, 280); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(60, 290); ctx.bezierCurveTo(100, 250, 140, 310, 180, 268); ctx.bezierCurveTo(210, 250, 230, 300, 250, 280); ctx.stroke();
  });
  ctx.restore();
}
// caixinha de brinquedo pequena (para as grades)
function caixaMini(ctx, x, y, s, cor, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  ctx.save(); papelSombra(ctx); fillRR(ctx, -40, -55, 80, 110, 8, cor); ctx.restore();
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.moveTo(40, -55); ctx.lineTo(54, -64); ctx.lineTo(54, 46); ctx.lineTo(40, 55); ctx.closePath(); ctx.fill();
  fillRR(ctx, -28, -32, 56, 62, 10, 'rgba(255,255,255,0.75)'); circle(ctx, 0, -10, 12, '#f2c3a0'); fillRR(ctx, -12, 2, 24, 24, 6, hexA(cor, 0.9));
  if (o.estrela) { ctx.fillStyle = '#facc15'; ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -1.571 + (i / 10) * 6.283, r2 = i % 2 ? 9 : 22; ctx.lineTo(Math.cos(a) * r2, -78 + Math.sin(a) * r2); } ctx.closePath(); ctx.fill(); }
  ctx.restore();
}
// contêiner de navio: chapa ondulada, portas com travas verticais
function conteiner(ctx, x, y, s, cor, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  ctx.save(); papelSombra(ctx); ctx.fillStyle = cor; ctx.fillRect(-200, -80, 400, 160); ctx.restore();
  ctx.fillStyle = 'rgba(0,0,0,0.18)'; for (let i = -190; i < 190; i += 22) ctx.fillRect(i, -76, 9, 152);
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(-200, -80, 400, 10); ctx.fillRect(-200, 70, 400, 10);
  ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = 4; for (const lx of [130, 160]) { ctx.beginPath(); ctx.moveTo(lx, -70); ctx.lineTo(lx, 70); ctx.stroke(); }
  ctx.restore();
}
// navio porta-contêiner de lado: casco com faixa vermelha, ponte de comando na popa e contêineres empilhados
function navio(ctx, x, y, s, t) {
  ctx.save(); ctx.translate(x, y + Math.sin(t * 0.9) * 5); ctx.rotate(Math.sin(t * 0.6) * 0.006); ctx.scale(s, s);
  ctx.strokeStyle = 'rgba(147,197,253,0.5)'; ctx.lineWidth = 5; for (let i = 0; i < 3; i++) { ctx.beginPath(); for (let k = 0; k <= 40; k++) { const xx = -760 + k * 38, yy = 120 + i * 16 + Math.sin(k * 0.7 + t * 2 + i) * 5; k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke(); }
  ctx.save(); papelSombra(ctx); ctx.fillStyle = '#1f2937'; ctx.beginPath(); ctx.moveTo(-700, 0); ctx.lineTo(640, 0); ctx.lineTo(720, -40); ctx.lineTo(660, 110); ctx.lineTo(-640, 110); ctx.closePath(); ctx.fill(); ctx.restore();
  ctx.fillStyle = '#b91c1c'; ctx.fillRect(-660, 70, 1310, 26);
  fillRR(ctx, -680, -190, 150, 190, 8, '#e5e7eb'); for (let i = 0; i < 3; i++) fillRR(ctx, -665 + i * 45, -170, 30, 22, 4, '#1e293b'); fillRR(ctx, -640, -260, 30, 70, 4, '#6b7280');
  const cols = ['#2563eb', '#16a34a', '#ea580c', '#7c3aed', '#0891b2', '#dc2626'], r = rng(8);
  for (let row = 0; row < 2; row++) for (let i = 0; i < 9; i++) { const c = cols[Math.floor(r() * cols.length)]; ctx.fillStyle = c; ctx.fillRect(-500 + i * 125, -70 - row * 72, 118, 66); ctx.fillStyle = 'rgba(0,0,0,0.2)'; for (let j = 0; j < 5; j++) ctx.fillRect(-494 + i * 125 + j * 23, -66 - row * 72, 8, 58); }
  ctx.restore();
}
// console de videogame com controle
function consoleVG(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  ctx.save(); papelSombra(ctx); fillRR(ctx, -200, -60, 400, 120, 20, '#111827'); ctx.restore();
  fillRR(ctx, -200, -60, 400, 26, 14, '#1f2937'); circle(ctx, 150, 10, 8, '#38bdf8'); fillRR(ctx, -160, 20, 120, 8, 4, '#374151');
  ctx.save(); ctx.translate(40, 120); ctx.rotate(-0.08);
  ctx.save(); papelSombra(ctx); ctx.fillStyle = '#e5e7eb'; ctx.beginPath(); ctx.moveTo(-120, -40); ctx.quadraticCurveTo(0, -60, 120, -40); ctx.quadraticCurveTo(170, 0, 140, 60); ctx.quadraticCurveTo(110, 80, 80, 40); ctx.lineTo(-80, 40); ctx.quadraticCurveTo(-110, 80, -140, 60); ctx.quadraticCurveTo(-170, 0, -120, -40); ctx.closePath(); ctx.fill(); ctx.restore();
  ctx.fillStyle = '#374151'; ctx.fillRect(-100, -12, 50, 16); ctx.fillRect(-83, -29, 16, 50);
  for (const [bx, by, c] of [[80, -22, '#ef4444'], [104, 0, '#3b82f6'], [56, 0, '#22c55e'], [80, 22, '#facc15']]) circle(ctx, bx, by, 10, c);
  ctx.restore();
  ctx.restore();
}
// bicicleta infantil: duas rodas com raios, rodinhas de apoio, quadro em V, selim, guidão
function bicicleta(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  const roda = (cx) => { ctx.strokeStyle = '#111827'; ctx.lineWidth = 16; ctx.beginPath(); ctx.arc(cx, 60, 80, 0, 6.283); ctx.stroke(); ctx.strokeStyle = '#9ca3af'; ctx.lineWidth = 3; for (let i = 0; i < 8; i++) { const a = i * 0.785 + (o.giro || 0); ctx.beginPath(); ctx.moveTo(cx, 60); ctx.lineTo(cx + Math.cos(a) * 74, 60 + Math.sin(a) * 74); ctx.stroke(); } circle(ctx, cx, 60, 10, '#6b7280'); };
  roda(-150); roda(150);
  ctx.strokeStyle = '#6b7280'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-150, 60); ctx.lineTo(-210, 110); ctx.stroke(); circle(ctx, -215, 115, 22, '#111827');
  ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 18; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(-150, 60); ctx.lineTo(-30, 60); ctx.lineTo(110, -50); ctx.moveTo(-30, 60); ctx.lineTo(-70, -60); ctx.moveTo(110, -50); ctx.lineTo(150, 60); ctx.stroke();
  fillRR(ctx, -120, -80, 100, 26, 12, '#111827');
  ctx.strokeStyle = '#111827'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(110, -50); ctx.lineTo(100, -110); ctx.lineTo(160, -120); ctx.stroke();
  ctx.restore();
}
// selo de certificação (genérico: anel com a palavra SEGURANÇA e um visto no meio)
function seloSeg(ctx, x, y, r, k = 1) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); const sc = lerp(0.7, 1, ease.back(clamp(k))); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 2);
  ctx.save(); papelSombra(ctx); circle(ctx, 0, 0, r, '#ffffff'); ctx.restore();
  ctx.strokeStyle = '#1d4ed8'; ctx.lineWidth = r * 0.08; ctx.beginPath(); ctx.arc(0, 0, r * 0.86, 0, 6.283); ctx.stroke();
  ctx.lineWidth = r * 0.03; ctx.beginPath(); ctx.arc(0, 0, r * 0.62, 0, 6.283); ctx.stroke();
  check(ctx, 0, r * 0.08, r / 80, '#16a34a', 1);
  text(ctx, 'SELO', 0, -r * 0.38, { size: r * 0.14, weight: 900, color: '#1d4ed8', letter: 3 });
  ctx.restore();
}
// lupa: aro grosso, lente com reflexo e cabo
function lupa(ctx, x, y, s, rot = 0.6) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.save(); papelSombra(ctx); fillRR(ctx, 60, -16, 170, 32, 14, '#3b2a1f'); ctx.restore();
  ctx.fillStyle = 'rgba(219,234,254,0.18)'; ctx.beginPath(); ctx.arc(0, 0, 66, 0, 6.283); ctx.fill();
  ctx.strokeStyle = '#9ca3af'; ctx.lineWidth = 16; ctx.beginPath(); ctx.arc(0, 0, 70, 0, 6.283); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, 46, 3.6, 4.6); ctx.stroke();
  ctx.restore();
}
// cilindro de teste de peças pequenas (tubo transparente com boca chanfrada) e a peça (um sapatinho de boneca) caindo dentro
function cilindroTeste(ctx, x, y, s, p = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  sombraChao(ctx, 0, 170, 160, 0.5);
  ctx.fillStyle = 'rgba(226,232,240,0.22)'; ctx.beginPath(); ctx.moveTo(-90, -110); ctx.lineTo(90, -150); ctx.lineTo(90, 160); ctx.lineTo(-90, 160); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(226,232,240,0.85)'; ctx.lineWidth = 6; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(-70, -100, 14, 240);
  const yy = lerp(-320, 110, ease.in(clamp(p))), rot = p * 2.4;
  ctx.save(); ctx.translate(10, yy); ctx.rotate(rot); fillRR(ctx, -38, -16, 76, 32, 14, '#b91c1c'); fillRR(ctx, -38, -16, 30, 32, 10, '#7f1d1d'); ctx.restore();
  ctx.restore();
}
// pilha de caixas de papelão retidas, com fita escrita RETIDO
function caixasRetidas(ctx, x, y, s, k = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  sombraChao(ctx, 0, 170, 420, 0.55);
  const cx = [[-230, 70, 220, 200], [0, 80, 230, 190], [230, 70, 220, 200], [-110, -120, 220, 190], [120, -120, 220, 190], [0, -300, 220, 180]];
  cx.forEach(([bx, by, bw, bh], i) => { const kk = appear(k * 3, i * 0.3, 0.5); if (kk <= 0) return;
    ctx.save(); ctx.globalAlpha *= clamp(kk * 2); ctx.translate(0, (1 - ease.out(kk)) * -60);
    ctx.save(); papelSombra(ctx); fillRR(ctx, bx - bw / 2, by - bh / 2, bw, bh, 6, '#b08a55'); ctx.restore();
    ctx.fillStyle = '#c9a26b'; ctx.fillRect(bx - 12, by - bh / 2, 24, bh);
    ctx.save(); ctx.translate(bx, by + 10); ctx.rotate(-0.18); ctx.fillStyle = '#facc15'; ctx.fillRect(-bw / 2 - 10, -16, bw + 20, 32);
    ctx.fillStyle = '#111827'; for (let j = -bw / 2; j < bw / 2; j += 34) ctx.fillRect(j, -16, 14, 32); ctx.restore();
    ctx.restore(); });
  ctx.restore();
}
// pacote de remessa internacional: envelope plástico cinza com a boca rasgada, a caixa da boneca saindo e a etiqueta de remessa
function pacoteRemessa(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.06); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  const Wd = 900, Hd = 700, L = -Wd / 2, T = -Hd / 2;
  sombraChao(ctx, 0, -T + 40, 500, 0.5);
  caixaBrinquedo(ctx, 60, T + 20, 0.74, { rot: 0.08, key: 'pac', semSombra: true, semSelo: o.semSelo });
  ctx.save(); papelSombra(ctx);
  const g = ctx.createLinearGradient(L, T, -L, -T); g.addColorStop(0, '#d1d5db'); g.addColorStop(1, '#9ca3af'); ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(L, T + 40); for (let i = 0; i <= 12; i++) ctx.lineTo(L + i * (Wd / 12), T + 40 + (i % 2 ? -26 : 18)); ctx.lineTo(-L, -T); ctx.lineTo(L, -T); ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 6; for (const [a, b, c2, d] of [[L + 60, T + 140, L + 260, T + 420], [-L - 80, T + 160, -L - 220, T + 480], [L + 120, -T - 60, L + 420, -T - 120]]) { ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(c2, d); ctx.stroke(); }
  ctx.save(); ctx.translate(-40, 120); ctx.rotate(0.03);
  drawDoc(ctx, 'etiqRemessa', 640, 360, (ctx) => {
    ctx.save(); papelSombra(ctx); fillRR(ctx, -320, -180, 640, 360, 10, '#ffffff'); ctx.restore();
    fillRR(ctx, -320, -180, 640, 70, 10, '#111827'); text(ctx, 'REMESSA INTERNACIONAL', 0, -142, { size: 34, weight: 900, color: '#ffffff', letter: 2 });
    text(ctx, 'VALOR: US$ 20', -290, -60, { size: 40, weight: 900, color: '#111827', align: 'left' });
    text(ctx, 'DESTINO: BRASIL', -290, -10, { size: 30, weight: 800, color: '#374151', align: 'left' });
    const r = rng(11); let xx = -290; ctx.fillStyle = '#111827'; while (xx < 290) { const bw = 3 + Math.floor(r() * 6); ctx.fillRect(xx, 30, bw, 120); xx += bw + 3 + Math.floor(r() * 4); }
  });
  ctx.restore();
  ctx.restore();
}
// celular com a tela de compra num site de fora (o: rows 0..4 quantas linhas aparecem, hl linha destacada)
function celularCompra(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? 0.04); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  const n = o.rows ?? 4;
  drawDoc(ctx, 'cel10', 380, 720, (ctx) => {
    ctx.save(); papelSombra(ctx); fillRR(ctx, -180, -350, 360, 700, 46, '#0f172a'); ctx.restore();
    fillRR(ctx, -166, -336, 332, 672, 36, '#f8fafc'); fillRR(ctx, -40, -326, 80, 18, 9, '#0f172a');
    ctx.save(); rr(ctx, -166, -336, 332, 672, 36); ctx.clip();
    ctx.fillStyle = '#ea580c'; ctx.fillRect(-166, -336, 332, 120);
    text(ctx, 'Seu pedido', -140, -264, { size: 34, weight: 900, color: '#ffffff', align: 'left' });
    fillRR(ctx, -140, -196, 280, 120, 14, '#fdf2f8'); fillRR(ctx, -126, -184, 70, 96, 8, '#ec4899'); circle(ctx, -91, -150, 14, '#f2c3a0');
    text(ctx, 'Boneca que fala', -40, -156, { size: 20, weight: 800, color: '#111827', align: 'left' }); text(ctx, 'US$ 20', -40, -118, { size: 26, weight: 900, color: '#111827', align: 'left' });
    const rows = [['Compra até US$ 50', '#111827'], ['Remessa Conforme', '#1e3a8a'], ['Imposto de importação', '#15803d'], ['ICMS do estado', '#b45309']];
    const vals = ['', '', 'R$ 0,00', '17% a 20%'];
    rows.forEach(([lab, cor], i) => { if (i >= n) return; const yy = -30 + i * 82; if (o.hl === i) fillRR(ctx, -150, yy - 34, 300, 68, 10, '#fef9c3');
      text(ctx, lab, -136, yy - (vals[i] ? 12 : 0), { size: 20, weight: 800, color: cor, align: 'left' }); if (vals[i]) text(ctx, vals[i], -136, yy + 18, { size: 24, weight: 900, color: cor, align: 'left' }); });
    ctx.restore();
  });
  ctx.restore();
}
// caixa-surpresa com manivela: cubo com losangos, manivela do lado, tampa com dobradiça e a placa na mola
function caixaSurpresa(ctx, x, y, s, t, o = {}) {
  const giro = o.giro || 0, abre = clamp(o.abre || 0), sobe = clamp(o.sobe || 0);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  sombraChao(ctx, 0, 230, 330, 0.55);
  // mola e placa (atrás da tampa, saem pela boca)
  if (sobe > 0) {
    const h = 380 * ease.back(sobe), wob = Math.sin(t * 9) * 10 * (1 - clamp((t - (o.tSobe || 0)) / 1.6));
    ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 8; ctx.beginPath();
    for (let i = 0; i <= 40; i++) { const yy = -200 - (i / 40) * h, xx = Math.sin(i * 1.2) * 40 + wob * (i / 40); i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke();
    ctx.save(); ctx.translate(wob, -200 - h - 70); ctx.rotate(wob * 0.004);
    ctx.save(); papelSombra(ctx); fillRR(ctx, -230, -70, 460, 140, 24, '#16a34a'); ctx.restore();
    strokeRR(ctx, -230, -70, 460, 140, 24, '#bbf7d0', 6);
    text(ctx, 'INSCRITO', 0, 4, { size: 76, weight: 900, color: '#ffffff', letter: 4 });
    ctx.restore();
  }
  // corpo
  ctx.save(); papelSombra(ctx); ctx.fillStyle = '#dc2626'; ctx.fillRect(-200, -200, 400, 400); ctx.restore();
  ctx.fillStyle = '#991b1b'; ctx.beginPath(); ctx.moveTo(200, -200); ctx.lineTo(270, -250); ctx.lineTo(270, 160); ctx.lineTo(200, 200); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#facc15'; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const cx2 = -150 + i * 100, cy2 = -150 + j * 100; ctx.beginPath(); ctx.moveTo(cx2, cy2 - 30); ctx.lineTo(cx2 + 22, cy2); ctx.lineTo(cx2, cy2 + 30); ctx.lineTo(cx2 - 22, cy2); ctx.closePath(); ctx.fill(); }
  fillRR(ctx, -170, -40, 340, 80, 16, '#ffffff');
  text(ctx, abre > 0.5 ? 'INSCRITO!' : 'INSCREVA-SE', 0, 2, { size: 44, weight: 900, color: '#b91c1c', letter: 2 });
  // manivela: eixo na lateral, braço girando e pegador
  ctx.save(); ctx.translate(250, -20); circle(ctx, 0, 0, 22, '#6b7280');
  const a = giro; ctx.strokeStyle = '#9ca3af'; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 110, Math.sin(a) * 110); ctx.stroke();
  fillRR(ctx, Math.cos(a) * 110 - 16, Math.sin(a) * 110 - 34, 32, 68, 14, '#111827');
  ctx.restore();
  // tampa (dobradiça atrás): abre girando para trás
  ctx.save(); ctx.translate(0, -200); ctx.scale(1, 1 - 1.7 * ease.out(abre)); ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.moveTo(-210, 0); ctx.lineTo(210, 0); ctx.lineTo(280, -50); ctx.lineTo(-140, -50); ctx.closePath(); ctx.fill(); ctx.restore();
  ctx.restore();
}
// pórtico de pedágio sem cancela sobre a estrada à noite, com o carro passando
function portico(ctx, x, y, s, t, carro = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#1f2937'; ctx.beginPath(); ctx.moveTo(-900, 360); ctx.lineTo(900, 360); ctx.lineTo(500, 40); ctx.lineTo(-500, 40); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#facc15'; ctx.lineWidth = 8; ctx.setLineDash([50, 40]); ctx.lineDashOffset = -t * 120; ctx.beginPath(); ctx.moveTo(0, 360); ctx.lineTo(0, 40); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = '#6b7280'; ctx.fillRect(-560, -300, 30, 400); ctx.fillRect(530, -300, 30, 400); ctx.fillRect(-560, -320, 1120, 50);
  for (const cx of [-300, -100, 100, 300]) { fillRR(ctx, cx - 30, -270, 60, 40, 8, '#111827'); circle(ctx, cx, -232, 8, (Math.sin(t * 3 + cx) > 0) ? '#ef4444' : '#7f1d1d'); }
  const k = clamp(carro), cy = lerp(420, -40, ease.inOut(k)), cs = lerp(1.2, 0.5, k);
  if (k > 0 && k < 1) { ctx.save(); ctx.translate(-180, cy); ctx.scale(cs, cs); fillRR(ctx, -90, -50, 180, 100, 24, '#2563eb'); fillRR(ctx, -70, -40, 140, 40, 10, '#bcd7ee'); circle(ctx, -60, 40, 12, '#fef3c7'); circle(ctx, 60, 40, 12, '#fef3c7'); ctx.restore(); }
  ctx.restore();
}
// árvore de Natal com pisca-pisca e presente embaixo (do vídeo 09, sem a caixa)
function arvore(ctx, x, y, s, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  sombraChao(ctx, 0, 300, 300, 0.5);
  ctx.fillStyle = '#7c2d12'; ctx.fillRect(-30, 200, 60, 90);
  for (let i = 0; i < 4; i++) { const yb = 220 - i * 130, wb = 300 - i * 60; ctx.fillStyle = i % 2 ? '#166534' : '#15803d'; ctx.beginPath(); ctx.moveTo(-wb, yb); ctx.lineTo(0, yb - 220); ctx.lineTo(wb, yb); ctx.closePath(); ctx.fill(); }
  const cols = ['#ef4444', '#facc15', '#38bdf8', '#f472b6']; const r = rng(4);
  for (let i = 0; i < 18; i++) { const yy = -260 + r() * 470, ww = 40 + (yy + 300) * 0.5; circle(ctx, (r() - 0.5) * ww * 1.4, yy, 12, cols[i % 4], 0.6 + 0.4 * Math.sin(t * 2 + i)); }
  ctx.fillStyle = '#facc15'; ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -1.571 + (i / 10) * 6.283, rr2 = i % 2 ? 18 : 42; ctx.lineTo(Math.cos(a) * rr2, -540 + Math.sin(a) * rr2); } ctx.closePath(); ctx.fill();
  ctx.restore();
}
// papel de presente cobrindo a tela (vermelho com estrelas douradas e fita) e rasgando ao meio: a única transição de efeito do vídeo
let PAPEL = null;
function papelPresente(ctx, cobre, rasga) {
  if (cobre <= 0 || rasga >= 1) return;
  if (!PAPEL) {
    const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, '#b91c1c'); gr.addColorStop(1, '#7f1d1d'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(255,255,255,0.06)'; for (let x = -H; x < W; x += 90) { g.beginPath(); g.moveTo(x, H); g.lineTo(x + H, 0); g.lineTo(x + H + 34, 0); g.lineTo(x + 34, H); g.closePath(); g.fill(); }
    const r = rng(31); g.fillStyle = '#facc15';
    for (let i = 0; i < 60; i++) { const sx = r() * W, sy = r() * H, rad = 12 + r() * 16; g.beginPath(); for (let k = 0; k < 10; k++) { const a = -1.571 + (k / 10) * 6.283, r2 = k % 2 ? rad * 0.42 : rad; g.lineTo(sx + Math.cos(a) * r2, sy + Math.sin(a) * r2); } g.closePath(); g.fill(); }
    g.fillStyle = '#facc15'; g.fillRect(0, H * 0.46, W, 70);
    PAPEL = c;
  }
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const off = (1 - ease.out(clamp(cobre))) * W, sep = ease.inOut(clamp(rasga)), r = rng(5), pts = [];
  for (let i = 0; i <= 18; i++) pts.push([W / 2 + (r() - 0.5) * 120, (i / 18) * H]);
  for (const side of [-1, 1]) {
    ctx.save(); ctx.translate(off + side * sep * W * 0.62, 0); ctx.rotate(side * sep * 0.12);
    ctx.beginPath();
    if (side < 0) { ctx.moveTo(-10, -10); pts.forEach(([px, py]) => ctx.lineTo(px, py)); ctx.lineTo(-10, H + 10); }
    else { ctx.moveTo(W + 10, -10); pts.forEach(([px, py]) => ctx.lineTo(px, py)); ctx.lineTo(W + 10, H + 10); }
    ctx.closePath(); ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 40; ctx.fillStyle = '#7f1d1d'; ctx.fill(); ctx.restore();
    ctx.clip(); ctx.drawImage(PAPEL, 0, 0);
    if (rasga > 0) { ctx.strokeStyle = '#fef2f2'; ctx.lineWidth = 10; ctx.beginPath(); pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.stroke(); }
    ctx.restore();
  }
  ctx.restore();
}

// cores das fatias do preço (as mesmas em todas as cenas)
const F = { imp: '#ef4444', ipi: '#38bdf8', pis: '#22c55e', icms: '#f59e0b', resto: '#94a3b8' };

// ================================================================ Cena 01: o "até 70%", a caixa aberta e a promessa (a boneca que entra sem imposto de importação)
function scene01(K) {
  const tAte = K('até setenta por cento'), tPeg = K('A gente pegou uma boneca'), tAbr = K('abriu a caixa'), tNao = K('Não chega nem perto'), tAinda = K('E ainda tem um detalhe');
  const tMesma = K('essa mesma boneca pode entrar'), tLei = K('dentro da lei'), tFim = K('Essa parte fica para o fim'), tHoje = K('Hoje a gente abre essa caixa'), tCada = K('quem fica com cada real');
  const cam = [
    { t: 0, x: 960, y: 480, z: 1.0, dz: 0.005 }, { t: tPeg, x: 1080, y: 470, z: 1.07, d: 1.4 }, { t: tNao, x: 960, y: 480, z: 1.0, d: 1.2 },
    { t: tAinda - 0.4, x: 2400, y: 480, z: 1.0, d: 1.5, dx: 3 }, { t: tLei, x: 2440, y: 460, z: 1.08, d: 1.4 },
    { t: tHoje - 0.4, x: 3800, y: 480, z: 1.0, d: 1.5 }, { t: tCada, x: 3800, y: 460, z: 1.06, d: 2.0, dz: 0.004 },
  ];
  const sfx = [[0.05, 'caixa', 0.3], [tAte, 'pop', 0.3], [tPeg, 'paper', 0.3], [tAbr, 'fita', 0.5, { dur: 0.5 }], [tAbr + 0.5, 'caixa', 0.3], [tNao, 'drop', 0.35],
    [tAinda - 0.3, 'whoosh', 0.3], [tAinda + 0.3, 'caixa', 0.35], [tMesma + 1.0, 'pop', 0.3], [tLei, 'stamp', 0.45], [tFim, 'tick', 0.3], [tHoje - 0.3, 'whoosh', 0.3], [tCada, 'coin', 0.4]];
  return {
    accent: F.icms, cam, sfx, impacts: [tLei], trans: 'cut',
    draw(ctx, t, cam2) {
      salaFundo(ctx, cam2, t, 0.95);
      zone(ctx, cam2, 900, 1100, () => {
        if (t > tAinda + 0.6) return;
        caixaBrinquedo(ctx, 1260, 470, 0.74, { aba: prog(t, tAbr, 0.8), aceno: Math.sin(t * 2) * 0.12 * appear(t, tAbr + 0.6, 0.5), key: 'a' });
        { const kr = ease.out(prog(t, tAte + 0.3, 1.2)) * (1 - appear(t, tNao, 0.5)), bh = 560 * 0.7 * kr; // o "70%" enchendo a caixa
          if (kr > 0) { ctx.save(); ctx.globalAlpha *= 0.55; ctx.fillStyle = '#dc2626'; ctx.fillRect(1260 - 207, 470 + 281 - bh, 414, bh); ctx.restore();
            ctx.save(); ctx.strokeStyle = '#fca5a5'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(1560, 470 + 281 - bh); ctx.lineTo(1620, 470 + 281 - bh); ctx.stroke(); ctx.restore(); text(ctx, '70%', 1640, 470 + 281 - bh, { size: 48, weight: 900, color: '#fecaca', align: 'left', alpha: clamp(kr * 2) }); } }
        chip(ctx, 560, 640, 'uma boneca de R$ 100', '#e2e8f0', vis(t, tPeg, tNao, 0.4, 0.4), { size: 24 });
        etiquetaPreco(ctx, 900, 640, 0.72, 'R$ 100', { rot: -0.1 + Math.sin(t * 1.3) * 0.03, fio: [190, -250] });
        headline(ctx, 'até 70%?', 520, 290, { size: 130, k: appear(t, 0, 0.3), hl: '#7f1d1d' });
        text(ctx, 'do preço é imposto?', 520, 410, { size: 40, weight: 900, color: '#fecaca', alpha: appear(t, 0.2, 0.4) });
        crossOut(ctx, 300, 300, 740, 280, '#f8fafc', prog(t, tNao, 0.4), 12);
        chip(ctx, 520, 530, 'com as alíquotas de hoje: bem menos', '#86efac', appear(t, tNao + 0.4, 0.4), { size: 26 });
        chip(ctx, 1260, 90, 'a conta do canal, imposto por imposto', '#fde68a', vis(t, tAbr + 0.4, tNao + 2, 0.4, 0.4), { size: 24 });
      });
      zone(ctx, cam2, 2300, 2500, () => {
        if (t < tAinda - 0.8 || t > tHoje + 0.6) return;
        const k = vis(t, tAinda - 0.3, tHoje, 0.5, 0.5), pe = ease.out(prog(t, tAinda - 0.3, 0.9));
        ctx.save(); ctx.globalAlpha *= k;
        pacoteRemessa(ctx, lerp(3100, 2380, pe), 520, 0.6, { rot: -0.06 + (1 - pe) * 0.2 });
        { const kv = appear(t, tMesma + 0.3, 0.5); if (kv > 0) { ctx.save(); ctx.globalAlpha *= kv; ctx.setLineDash([12, 10]); ctx.strokeStyle = 'rgba(226,232,240,0.6)'; ctx.lineWidth = 4;
          ctx.beginPath(); ctx.moveTo(1980, 700); ctx.quadraticCurveTo(2400, 520, 2820, 700); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
          chip(ctx, 1980, 760, 'China', '#fca5a5', kv, { size: 24 }); chip(ctx, 2820, 760, 'Brasil', '#86efac', kv, { size: 24 });
          const pp = ((t - tMesma - 0.3) / 3) % 1, px = lerp(1980, 2820, pp), py = (1 - pp) * (1 - pp) * 700 + 2 * (1 - pp) * pp * 520 + pp * pp * 700;
          ctx.save(); ctx.globalAlpha *= kv; ctx.translate(px, py - 20); ctx.rotate(-0.3 + pp * 0.6); ctx.fillStyle = '#e2e8f0'; ctx.beginPath(); ctx.moveTo(30, 0); ctx.lineTo(-20, -8); ctx.lineTo(-30, -24); ctx.lineTo(-36, -24); ctx.lineTo(-30, 0); ctx.lineTo(-36, 24); ctx.lineTo(-30, 24); ctx.lineTo(-20, 8); ctx.closePath(); ctx.fill(); ctx.restore(); } }
        chip(ctx, 2400, 110, 'imposto de importação: R$ 0?', '#fca5a5', appear(t, tMesma + 1.0, 0.4), { size: 30 });
        rectStamp(ctx, 2760, 300, 360, 100, 'DENTRO DA LEI', '#86efac', appear(t, tLei, 0.35), 0.08, 44);
        chip(ctx, 2400, 190, 'a resposta fica para o fim', '#fde68a', appear(t, tFim, 0.4), { size: 24 });
        ctx.restore();
      });
      zone(ctx, cam2, 3700, 3900, () => {
        if (t < tHoje - 0.8) return;
        const k = appear(t, tHoje - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        caixaBrinquedo(ctx, 3800, 520, 0.6, { aba: 1, key: 'b' });
        etiquetaPreco(ctx, 3420, 640, 0.6, 'R$ 100', { rot: -0.12 + Math.sin(t * 1.3) * 0.03 });
        headline(ctx, 'quem fica com cada real?', 3800, 100, { size: 60, k: appear(t, tCada, 0.5), hl: '#7c2d12' });
        [F.imp, F.ipi, F.pis, F.icms, F.resto].forEach((c, i) => { const p = prog(t, tCada + 0.3 + i * 0.18, 1.4); if (p <= 0 || p >= 1) return;
          moeda1(ctx, 3720 + i * 40 + Math.sin(p * 6 + i) * 30, lerp(250, 150, ease.out(p)) - i * 4, 26, { cor: c, a: 1 - p * 0.7 }); });
        ctx.restore();
      });
      luzinhas(ctx, cam2, t, 3, 9);
    },
    overlay(ctx, t) {},
  };
}

// ================================================================ Cena 02: de onde vem o 70% (a lista do IBPT) e o número que não muda
function scene02(K) {
  const tVem = K('Ele vem de uma lista'), tFeita = K('feita para a Associação Comercial'), tTopo = K('No topo está o videogame'), t72 = K('com setenta e dois por cento');
  const tBici = K('A bicicleta aparece'), tComum = K('O brinquedo comum'), t40 = K('fica em uns quarenta'), tCons = K('O setenta é do console'), tRep = K('Repara numa coisa'), tIg = K('esses números saem iguais');
  const tNesse = K('Nesse tempo'), tCaiu = K('caiu quase pela metade'), tIPI = K('e o IPI também foi cortado'), tPar = K('A lista ficou parada'), tNao = K('Os impostos, não');
  const LX = 700, LY = 480, LS = 0.9;
  const cam = [
    { t: 0, x: 960, y: 480, z: 1.0, dx: 2 }, { t: tVem, x: 880, y: 480, z: 1.05, d: 1.4 }, { t: tTopo - 0.2, x: 1080, y: 440, z: 1.07, d: 1.4 }, { t: tComum, x: 1080, y: 520, z: 1.05, d: 1.6 },
    { t: tCons, x: 1000, y: 470, z: 1.0, d: 1.4 }, { t: tRep - 0.4, x: 2400, y: 470, z: 1.0, d: 1.5 }, { t: tNesse, x: 2400, y: 430, z: 1.05, d: 1.4 }, { t: tPar, x: 2520, y: 470, z: 1.08, d: 1.4 },
  ];
  const sfx = [[0.25, 'pop', 0.3], [tVem, 'paper', 0.45, { dur: 0.5 }], [tFeita, 'tick', 0.3], [tTopo, 'pop', 0.35], [t72, 'hit', 0.3], [tBici, 'pop', 0.3], [tComum, 'pop', 0.3], [t40, 'ding', 0.3], [tCons, 'tick', 0.35],
    [tRep - 0.3, 'whoosh', 0.3], ...Array.from({ length: 11 }, (_, i) => [tIg + 0.2 + i * 0.27, 'flip', 0.2, { dur: 0.2 }]), [tCaiu, 'drop', 0.35], [tIPI, 'drop', 0.3], [tPar, 'stamp', 0.45], [tNao, 'pop', 0.3]];
  return {
    accent: '#3b82f6', cam, sfx, impacts: [tPar], trans: 'push',
    draw(ctx, t, cam2) {
      salaFundo(ctx, cam2, t, 0.95, 0.1);
      zone(ctx, cam2, 860, 1100, () => {
        if (t > tRep + 0.6) return;
        const k = vis(t, 0, tRep, 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        const kl = appear(t, 0.3, 0.6);
        if (kl > 0) { ctx.save(); ctx.globalAlpha *= clamp(kl * 2); listaIBPT(ctx, LX, LY + (1 - ease.out(kl)) * 60, LS, { linhas: t < tVem ? 0 : Math.min(5, Math.floor((t - tVem) / 0.5) + 1) }); ctx.restore(); }
        chip(ctx, LX, 90, 'IBPT · para a Associação Comercial de SP', '#93c5fd', appear(t, tFeita, 0.4), { size: 24 });
        for (const [i, tt] of [[0, tTopo], [2, tBici], [3, t40 - 0.4]]) { const [, ly] = linhaLista(LX, LY, LS, i); marker(ctx, LX - 275 * LS, ly - 30 * LS, 560 * LS, 60 * LS, '#fde047', prog(t, tt, 0.6)); }
        consoleVG(ctx, 1380, 250, 0.5, { a: appear(t, tTopo, 0.5) });
        bigNum(ctx, '72%', 1700, 250, appear(t, t72, 0.5), { size: 92, color: '#f87171' });
        bicicleta(ctx, 1380, 470, 0.42, { a: appear(t, tBici, 0.5), giro: t * 1.5 });
        bigNum(ctx, '46%', 1700, 470, appear(t, tBici + 0.5, 0.5), { size: 80, color: '#fdba74' });
        boneca(ctx, 1380, 690, 0.36, { a: appear(t, tComum, 0.5), aceno: Math.sin(t * 2) * 0.15 });
        bigNum(ctx, 'uns 40%', 1720, 690, appear(t, t40, 0.5), { size: 80, color: '#fde68a' });
        penCircle(ctx, 1700, 250, 120, 70, '#fde047', prog(t, tCons, 0.7), 7);
        chip(ctx, 1540, 120, 'o 70 é do console', '#fde68a', appear(t, tCons + 0.3, 0.4), { size: 26 });
        ctx.restore();
      });
      zone(ctx, cam2, 2300, 2600, () => {
        if (t < tRep - 0.8) return;
        const k = appear(t, tRep - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        const p = prog(t, tIg + 0.2, 2.9), ano = 2015 + Math.min(11, Math.floor(p * 11.999)), fl = (p * 11.999) % 1;
        calendarioAno(ctx, 2140, 470, 0.9, ano, p < 1 ? fl : 0);
        ctx.save(); ctx.translate(2700, 470); ctx.rotate(0.03);
        ctx.save(); papelSombra(ctx); fillRR(ctx, -200, -130, 400, 260, 16, '#fbfaf5'); ctx.restore();
        text(ctx, 'Brinquedos', 0, -50, { size: 36, weight: 900, color: P.ink }); text(ctx, '39,70%', 0, 30, { size: 72, weight: 900, color: '#b91c1c' });
        ctx.restore();
        rectStamp(ctx, 2700, 470, 380, 110, 'PARADA', '#f87171', appear(t, tPar, 0.35), -0.12, 64);
        chip(ctx, 2420, 720, 'o mesmo número há mais de dez anos', '#e2e8f0', appear(t, tIg + 0.8, 0.4), { size: 26 });
        chip(ctx, 2420, 110, 'imposto de importação: 35% → perto de 20%', '#fca5a5', appear(t, tCaiu, 0.4), { size: 26 });
        chip(ctx, 2420, 190, 'IPI cortado em 2022', '#93c5fd', appear(t, tIPI, 0.4), { size: 26 });
        shockRing(ctx, t, tNao, 2420, 150, '#fde68a', 60, 320);
        ctx.restore();
      });
      luzinhas(ctx, cam2, t, 5, 9);
    },
    overlay(ctx, t) { source(ctx, 'IBPT para a ACSP (2012 a 2025)', vis(t, tVem, tNesse, 0.5, 0.4)); source(ctx, 'Camex; Decreto 11.158/2022 (IPI)', vis(t, tCaiu, 99, 0.5, 0.4)); },
  };
}

// ================================================================ Cena 03: a tarifa que sobe e desce (acordo de 2006, 35% em 2010, degraus de 2020 a 2021)
function scene03(K) {
  const tPor = K('Por que o brinquedo importado'), t06 = K('Em 2006'), tFech = K('os fabricantes brasileiros fecharam'), tAcab = K('O acordo acabou em 2010'), tSeis = K('com os chineses já em seis');
  const tSub = K('e o governo subiu o imposto'), tRel = K('Num relatório do próprio governo'), tZim = K('só Zimbábue e Afeganistão'), tMed = K('A média do mundo era seis');
  const t20 = K('Em 2020, depois de um pedido'), tDeg = K('a taxa começou a descer em degraus'), tVolt = K('até voltar'), tF21 = K('no fim de 2021'), tAnt = K('ao que era antes de 2010'), tHoje = K('quase nove em cada dez');
  const cam = [
    { t: 0, x: 960, y: 480, z: 1.0 }, { t: t06, x: 860, y: 500, z: 1.07, d: 1.4 }, { t: tAcab, x: 1180, y: 470, z: 1.04, d: 1.4 },
    { t: tSub - 0.4, x: 2400, y: 470, z: 1.0, d: 1.5 }, { t: tRel - 0.4, x: 3800, y: 470, z: 1.0, d: 1.5 }, { t: t20 - 0.4, x: 2400, y: 470, z: 1.02, d: 1.5 },
    { t: tF21, x: 2560, y: 490, z: 1.06, d: 1.4 }, { t: tHoje - 0.6, x: 5200, y: 470, z: 1.0, d: 1.5, dz: 0.004 },
  ];
  // degraus: [rótulo, %, instante]
  const BARS = [['até 2010', 20, tSub - 1.0], ['2011', 35, tSub + 0.3], ['dez/2020', 30, tDeg + 0.2], ['jun/2021', 25, tDeg + 1.2], ['dez/2021', 20, tF21]];
  const sfx = [[tPor, 'pop', 0.3], [t06, 'paper', 0.45, { dur: 0.6 }], [tFech + 2.0, 'stamp', 0.4], [tFech + 3.0, 'stamp', 0.4], [tAcab, 'tick', 0.3], [tSeis, 'pop', 0.3],
    [tSub - 0.3, 'whoosh', 0.3], [tSub + 0.3, 'riser', 0.25, { dur: 0.7 }], [tSub + 1.0, 'hit', 0.35], [tRel - 0.3, 'whoosh', 0.3], [tZim, 'pop', 0.3], [tMed, 'ding', 0.3],
    [t20 - 0.3, 'whoosh', 0.3], [tDeg + 0.2, 'drop', 0.25], [tDeg + 1.2, 'drop', 0.25], [tF21, 'drop', 0.3], [tAnt, 'stamp', 0.4], [tHoje - 0.5, 'whoosh', 0.3], [tHoje + 0.2, 'conteiner', 0.35]];
  return {
    accent: F.imp, cam, sfx, impacts: [tSub + 1.0], trans: 'push',
    draw(ctx, t, cam2) {
      salaFundo(ctx, cam2, t, 0.95, 0.15);
      zone(ctx, cam2, 860, 1180, () => {
        if (t > tSub + 0.6) return;
        const k = vis(t, 0, tSub, 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        headline(ctx, 'por que pagava tanto?', 900, 100, { size: 60, k: vis(t, tPor, t06 + 1.5, 0.5, 0.4), hl: '#7f1d1d' });
        const ka = appear(t, 1.8, 0.6);
        if (ka > 0) { ctx.save(); ctx.globalAlpha *= clamp(ka * 2); acordoPapel(ctx, 760, 470 + (1 - ease.out(ka)) * 50, 0.82); ctx.restore(); }
        ovalStamp(ctx, 620, 650, 100, 52, [['BRASIL', 0, 0.5]], '#16a34a', appear(t, tFech + 2.0, 0.35), -0.15);
        ovalStamp(ctx, 900, 650, 100, 52, [['CHINA', 0, 0.5]], '#dc2626', appear(t, tFech + 3.0, 0.35), 0.1);
        chip(ctx, 1460, 230, 'limite para os brinquedos da China', '#fca5a5', vis(t, tFech + 4.0, tAcab, 0.4, 0.4), { size: 24 });
        chip(ctx, 1460, 230, '2010: fim do acordo', '#fde68a', appear(t, tAcab, 0.4), { size: 26 });
        for (let i = 0; i < 10; i++) { const kk = appear(t, tSeis + i * 0.08, 0.4); if (kk <= 0) continue; caixaMini(ctx, 1290 + (i % 5) * 90, 400 + Math.floor(i / 5) * 150, 0.9, i < 6 ? '#dc2626' : '#64748b', { a: clamp(kk * 2) }); }
        chip(ctx, 1470, 640, 'chineses: 6 de cada 10 vendas', '#fca5a5', appear(t, tSeis + 1.0, 0.4), { size: 24 });
        ctx.restore();
      });
      zone(ctx, cam2, 2300, 2600, () => {
        if (t < tSub - 0.8 || t > tHoje + 0.2) return;
        const base = 720, u = 13;
        ctx.save(); ctx.globalAlpha *= appear(t, tSub - 0.8, 0.5);
        text(ctx, 'imposto de importação do brinquedo', 2400, 110, { size: 34, weight: 900, color: '#e2e8f0' });
        fillRR(ctx, 1950, base, 900, 6, 3, '#64748b');
        BARS.forEach(([lab, v, tt], i) => {
          const kk = appear(t, tt, 0.7); if (kk <= 0) return; const x = 1990 + i * 180, h = v * u * ease.out(kk);
          const cor = v === 35 ? F.imp : i > 1 ? '#fca5a5' : '#94a3b8';
          ctx.save(); ctx.shadowColor = hexA(cor, 0.5); ctx.shadowBlur = 16; fillRR(ctx, x, base - h, 140, h, 10, cor); ctx.restore();
          text(ctx, v + '%', x + 70, base - h - 34, { size: 36, weight: 900, color: '#f8fafc', alpha: clamp(kk * 2) });
          text(ctx, lab, x + 70, base + 34, { size: 24, weight: 800, color: '#cbd5e1', alpha: clamp(kk * 2) });
        });
        shockRing(ctx, t, tSub + 1.0, 2250, 720 - 35 * u, F.imp, 40, 220);
        chip(ctx, 2480, 190, 'pedido da Hasbro (2019)', '#93c5fd', appear(t, t20, 0.4), { size: 24 });
        rectStamp(ctx, 2700, 330, 420, 100, 'COMO ANTES DE 2010', '#86efac', appear(t, tAnt, 0.35), -0.08, 36);
        ctx.restore();
      });
      zone(ctx, cam2, 3700, 3900, () => {
        if (t < tRel - 0.8 || t > t20 + 0.6) return;
        const k = vis(t, tRel - 0.3, t20, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        chip(ctx, 3800, 110, 'relatório do governo (2020)', '#e2e8f0', appear(t, tRel, 0.4), { size: 26 });
        const rows = [['Zimbábue', 860, '#fca5a5', tZim], ['Afeganistão', 820, '#fca5a5', tZim + 0.3], ['Brasil', 700, F.imp, tRel + 0.6], ['média do mundo', 120, '#86efac', tMed]];
        rows.forEach(([lab, len, cor, tt], i) => { const kk = appear(t, tt, 0.7); if (kk <= 0) return; const y = 260 + i * 130;
          text(ctx, lab, 3320, y, { size: 30, weight: 900, color: '#e2e8f0', align: 'right', alpha: clamp(kk * 2) });
          fillRR(ctx, 3350, y - 34, len * ease.out(kk), 68, 12, cor);
          if (lab === 'Brasil') text(ctx, '35%', 3350 + len * ease.out(kk) + 70, y, { size: 36, weight: 900, color: '#f8fafc', alpha: kk });
          if (lab === 'média do mundo') text(ctx, '6%', 3350 + len + 60, y, { size: 36, weight: 900, color: '#bbf7d0', alpha: kk }); });
        ctx.restore();
      });
      zone(ctx, cam2, 5100, 5300, () => {
        if (t < tHoje - 1.0) return;
        const k = appear(t, tHoje - 0.6, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        for (let i = 0; i < 10; i++) { const kk = appear(t, tHoje + 0.1 + i * 0.1, 0.4); if (kk <= 0) continue; const x = 4780 + (i % 5) * 210, y = 400 + Math.floor(i / 5) * 190;
          conteiner(ctx, x, y - (1 - ease.out(kk)) * 80, 0.48, i < 9 ? '#dc2626' : '#475569', { a: clamp(kk * 2) }); }
        headline(ctx, 'quase 9 em cada 10 vêm da China', 5200, 160, { size: 52, k: appear(t, tHoje + 0.8, 0.5), color: '#fecaca', color2: '#fca5a5' });
        ctx.restore();
      });
      luzinhas(ctx, cam2, t, 7, 8);
    },
    overlay(ctx, t) {
      source(ctx, 'BBC Brasil (2006); Veja (2010); Abrinq', vis(t, t06, tRel, 0.5, 0.4));
      source(ctx, 'Camex (2020), via O Globo', vis(t, tRel, t20, 0.5, 0.4));
      source(ctx, 'Gecex (2020 e 2021); Abrinq', vis(t, t20, 99, 0.5, 0.4));
    },
  };
}

// ================================================================ Cena 04: a conta, imposto por imposto (a etiqueta vira a barra de R$ 100)
function scene04(K) {
  const tLoja = K('numa loja de São Paulo'), tCont = K('Quando o contêiner chega'), tPaga = K('ela paga o imposto de importação'), tCob = K('cobrado em cima do preço de fábrica'), tBaixo = K('Como esse preço é baixo');
  const tIPI = K('Depois vem o IPI'), t3 = K('uns três'), tPis = K('PIS e Cofins'), t8 = K('uns oito'), tIcms = K('E o ICMS, do estado'), t18 = K('dezoito reais'), tSom = K('Somando'), t33 = K('uns trinta e três reais');
  const tIbpt = K('O número do IBPT é maior'), tSurp = K('Só que a surpresa'), tTam = K('Está no tamanho de cada pedaço');
  const BX = 3150, BY = 380, BW = 1300, BH = 120;
  const cam = [
    { t: 0, x: 960, y: 480, z: 1.0 }, { t: tLoja, x: 1000, y: 470, z: 1.06, d: 1.4 }, { t: tCont - 0.4, x: 2400, y: 470, z: 1.0, d: 1.5 }, { t: tBaixo, x: 2520, y: 450, z: 1.06, d: 1.4 },
    { t: tIPI - 0.4, x: 3720, y: 470, z: 1.0, d: 1.6 }, { t: tIcms, x: 3720, y: 450, z: 1.02, d: 1.4 }, { t: tSom, x: 3720, y: 430, z: 1.02, d: 1.4 }, { t: tIbpt, x: 3780, y: 470, z: 1.0, d: 1.6 },
  ];
  const sfx = [[0.3, 'caixa', 0.3], [tLoja, 'pop', 0.3], [tCont - 0.3, 'whoosh', 0.3], [tCont + 1.1, 'conteiner', 0.5], [tPaga, 'stamp', 0.4], [tCob, 'tick', 0.3], [tBaixo + 1.2, 'coin', 0.35],
    [tIPI - 0.3, 'whoosh', 0.3], [t3, 'pop', 0.35], [t8, 'pop', 0.35], [t18, 'hit', 0.35], [t33, 'cash', 0.4], [tIbpt, 'tick', 0.3], [tSurp, 'riser', 0.25, { dur: 1.2 }], [tTam + 0.5, 'whoosh', 0.35, { dur: 1.1 }]];
  return {
    accent: F.icms, cam, sfx, impacts: [t18], trans: 'push',
    draw(ctx, t, cam2) {
      salaFundo(ctx, cam2, t, 0.95);
      zone(ctx, cam2, 900, 1100, () => {
        if (t > tCont + 0.6) return;
        const k = vis(t, 0, tCont, 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        caixaBrinquedo(ctx, 1160, 470, 0.68, { key: 'c' });
        etiquetaPreco(ctx, 790, 620, 0.7, 'R$ 100', { rot: -0.1 + Math.sin(t * 1.3) * 0.03, fio: [230, -240] });
        chip(ctx, 960, 100, 'importada · loja em São Paulo', '#e2e8f0', appear(t, tLoja, 0.4), { size: 28 });
        ctx.restore();
      });
      zone(ctx, cam2, 2300, 2600, () => {
        if (t < tCont - 0.8 || t > tIPI + 0.6) return;
        const k = vis(t, tCont - 0.3, tIPI, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        navio(ctx, 2400, 640, 0.9, t);
        const p = ease.out(prog(t, tCont, 1.1)), cy = lerp(-260, 395, p);
        ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(2400, -400); ctx.lineTo(2400, cy - 80); ctx.stroke();
        conteiner(ctx, 2400, cy, 0.6, '#dc2626');
        rectStamp(ctx, 2340, cy, 200, 70, 'IMPOSTO', '#fef2f2', appear(t, tPaga + 0.2, 0.35), -0.1, 30);
        if (t > tCob) etiquetaPreco(ctx, 2600, cy + 120 + Math.sin(t * 1.6) * 6, 0.42, 'fábrica + frete', { rot: 0.1, a: appear(t, tCob + 0.3, 0.4), size: 46, fio: [-200, -230] });
        chip(ctx, 2400, 110, 'imposto de importação', '#fca5a5', appear(t, tPaga, 0.4), { size: 30 });
        chip(ctx, 2400, 190, 'cobrado sobre o preço de fábrica + frete', '#e2e8f0', appear(t, tCob, 0.4), { size: 24 });
        bigNum(ctx, 'uns R$ 4', 2860, 330, appear(t, tBaixo + 1.2, 0.5), { size: 80, color: F.imp });
        ctx.restore();
      });
      zone(ctx, cam2, 3300, 3900, () => {
        if (t < tIPI - 0.8) return;
        const k = appear(t, tIPI - 0.4, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        const ks = appear(t, tSom, 0.5);
        const seg = barraPreco(ctx, BX, BY, BW, BH, [{ v: 4, cor: F.imp, k: 1 }, { v: 3, cor: F.ipi, k: prog(t, t3, 0.6) }, { v: 8, cor: F.pis, k: prog(t, t8, 0.6) }, { v: 18, cor: F.icms, k: prog(t, t18, 0.7), glow: appear(t, t18, 0.3) * (1 - appear(t, tSom, 0.5)) }]);
        text(ctx, 'R$ 100', BX + BW, BY - 40, { size: 34, weight: 900, color: '#e2e8f0', align: 'right' });
        text(ctx, '?', (seg[4][0] + seg[4][1]) / 2, BY + BH / 2, { size: 70, weight: 900, color: 'rgba(203,213,225,0.7)', alpha: 1 - ks });
        // rótulos com linha guia: dois embaixo (importação e IPI) e dois em cima (PIS e Cofins, ICMS)
        const lab = (i, str, cor, lx, ly, tt, up) => { const kk = vis(t, tt, tSom, 0.4, 0.4); if (kk <= 0) return; const sx = (seg[i][0] + seg[i][1]) / 2;
          ctx.save(); ctx.globalAlpha *= clamp(kk * 2); ctx.strokeStyle = cor; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(sx, up ? BY - 6 : BY + BH + 6); ctx.lineTo(lx, ly + (up ? 26 : -26)); ctx.stroke(); ctx.restore();
          chip(ctx, lx, ly, str, cor, kk, { size: 24 }); };
        lab(0, 'importação · uns R$ 4', F.imp, 3060, 590, tIPI - 0.4, false);
        lab(1, 'IPI · uns R$ 3', F.ipi, 3350, 680, t3, false);
        lab(2, 'PIS e Cofins · uns R$ 8', F.pis, 3240, 290, t8, true);
        lab(3, 'ICMS do estado · R$ 18', F.icms, 3560, 200, t18, true);
        chip(ctx, 3300, 110, 'federal: IPI · PIS e Cofins', '#93c5fd', vis(t, tIPI + 1.2, t8 + 1.0, 0.4, 0.4), { size: 22 });
        // a soma
        if (ks > 0) { ctx.save(); ctx.globalAlpha *= ks; ctx.strokeStyle = '#fde68a'; ctx.lineWidth = 5; const x0 = BX, x1 = seg[3][1];
          ctx.beginPath(); ctx.moveTo(x0, BY + BH + 30); ctx.lineTo(x0, BY + BH + 50); ctx.lineTo(x1, BY + BH + 50); ctx.lineTo(x1, BY + BH + 30); ctx.stroke(); ctx.restore();
          bigNum(ctx, 'uns R$ 33', (BX + seg[3][1]) / 2, BY + BH + 130, appear(t, t33, 0.5), { size: 72, color: '#fde68a' }); }
        // o IBPT conta também o que as empresas recolhem no caminho
        const ki = appear(t, tIbpt, 0.6);
        if (ki > 0) { ctx.save(); ctx.globalAlpha *= ki; ctx.setLineDash([10, 8]); ctx.strokeStyle = '#fca5a5'; ctx.lineWidth = 4; ctx.strokeRect(seg[3][1] + 2, BY - 18, 7 * BW / 100 * ease.out(ki), BH + 36); ctx.setLineDash([]); ctx.restore();
          chip(ctx, 3960, 220, 'IBPT: soma também o que as empresas recolhem no caminho', '#fca5a5', ki, { size: 22 }); }
        chip(ctx, 3800, 110, 'a surpresa: o tamanho de cada pedaço', '#fde68a', appear(t, tSurp, 0.4), { size: 28 });
        [F.imp, F.ipi, F.pis, F.icms].forEach((c, i) => shockRing(ctx, t, tSurp + 0.5 + i * 0.5, (seg[i][0] + seg[i][1]) / 2, BY + BH / 2, c, 20, 140));
        ctx.restore();
      });
      luzinhas(ctx, cam2, t, 9, 8);
    },
    overlay(ctx, t) {
      source(ctx, 'conta do canal (TEC, TIPI, Lei 10.865/2004, RICMS/SP)', vis(t, tPaga, tIbpt, 0.5, 0.4));
      source(ctx, 'IBPT', vis(t, tIbpt, tTam, 0.5, 0.4));
      papelPresente(ctx, prog(t, tTam + 0.5, 1.4), 0);
    },
  };
}

// ================================================================ Cena 05: a virada (o papel de presente rasga): o tamanho de cada pedaço
function scene05(K) {
  const tCulpa = K('o que todo mundo culpa'), tMen = K('é um dos menores'), tMai = K('O maior é o do estado'), tFimc = K('porque ele é cobrado no fim'), tLoja = K('em cima do preço da loja'), tFab = K('e não do preço de fábrica');
  const tFoi = K('Foi por isso que'), tIpea = K('o Ipea'), tCalc = K('calculou que o preço na loja'), tOut = K('E os outros sessenta e sete'), tFabr = K('São a fábrica'), tNav = K('o navio'), tImpo = K('o importador'), tDono = K('o dono do personagem');
  const cam = [
    { t: 0, x: 960, y: 470, z: 1.0, dz: 0.004 }, { t: tCulpa, x: 880, y: 500, z: 1.08, d: 1.4 }, { t: tMai, x: 1140, y: 450, z: 1.07, d: 1.4 },
    { t: tFimc - 0.3, x: 2400, y: 470, z: 1.0, d: 1.5 }, { t: tFoi - 0.3, x: 3800, y: 470, z: 1.0, d: 1.5 }, { t: tOut - 0.4, x: 5200, y: 470, z: 1.0, d: 1.5 }, { t: tDono, x: 5200, y: 490, z: 1.04, d: 1.6 },
  ];
  const COLS = [['IPI', 3, F.ipi], ['importação', 4, F.imp], ['PIS e Cofins', 8, F.pis], ['ICMS', 18, F.icms]];
  const sfx = [[0.05, 'tear', 0.6, { dur: 0.9 }], [0.9, 'impact', 0.3], [tCulpa, 'pop', 0.3], [tMen, 'tick', 0.35], [tMai, 'hit', 0.4], [tFimc - 0.2, 'whoosh', 0.3], [tLoja, 'pop', 0.3], [tFab, 'pop', 0.3],
    [tFoi - 0.2, 'whoosh', 0.3], [tIpea, 'paper', 0.35], [tCalc + 1.0, 'drop', 0.35], [tOut - 0.3, 'whoosh', 0.3], [tFabr, 'pop', 0.3], [tNav, 'pop', 0.3], [tImpo, 'pop', 0.3], [tDono, 'pop', 0.3], [tDono + 0.8, 'pop', 0.3]];
  return {
    accent: F.icms, cam, sfx, impacts: [tMai], trans: 'cut',
    draw(ctx, t, cam2) {
      salaFundo(ctx, cam2, t, 0.95, 0.2);
      zone(ctx, cam2, 860, 1140, () => {
        if (t > tFimc + 0.6) return;
        const k = vis(t, 0, tFimc, 0.3, 0.5), base = 700, u = 22;
        ctx.save(); ctx.globalAlpha *= k;
        text(ctx, 'de cada R$ 100 da boneca, em imposto', 960, 110, { size: 34, weight: 900, color: '#e2e8f0' });
        fillRR(ctx, 470, base, 1000, 6, 3, '#64748b');
        COLS.forEach(([lab, v, cor], i) => { const x = 560 + i * 240, kk = appear(t, 0.3 + i * 0.25, 0.7), h = v * u * ease.out(kk), big = i === 3 ? appear(t, tMai, 0.4) : 0;
          ctx.save(); ctx.shadowColor = hexA(cor, 0.6); ctx.shadowBlur = 16 + 30 * big; fillRR(ctx, x - 80, base - h, 160, h, 12, cor); ctx.restore();
          text(ctx, (v === 18 ? 'R$ ' : 'uns R$ ') + v, x, base - h - 34, { size: 32, weight: 900, color: '#f8fafc', alpha: clamp(kk * 2) });
          text(ctx, lab, x, base + 40, { size: 26, weight: 900, color: '#cbd5e1', alpha: clamp(kk * 2) }); });
        arrow(ctx, 800, 360, 800, 560, '#fca5a5', 8, appear(t, tCulpa, 0.5));
        chip(ctx, 800, 300, 'o que todo mundo culpa', '#fca5a5', appear(t, tCulpa, 0.4), { size: 24 });
        penCircle(ctx, 680, 640, 230, 90, '#fde047', prog(t, tMen, 0.7), 7);
        chip(ctx, 1280, 160, 'o maior: o do estado', F.icms, appear(t, tMai + 0.3, 0.4), { size: 26 });
        shockRing(ctx, t, tMai, 1280, 450, F.icms, 60, 300);
        ctx.restore();
      });
      zone(ctx, cam2, 2300, 2500, () => {
        if (t < tFimc - 0.8 || t > tFoi + 0.6) return;
        const k = vis(t, tFimc - 0.3, tFoi, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        // o caminho: fábrica → porto → importador → loja
        const ST = [['fábrica', 1980], ['porto', 2260], ['importador', 2540], ['loja', 2820]];
        fillRR(ctx, 1980, 296, 840, 8, 4, '#475569');
        ST.forEach(([lab, x], i) => { const kk = appear(t, tFimc + i * 0.2, 0.4); circle(ctx, x, 300, 26, '#1e293b', clamp(kk * 2)); circle(ctx, x, 300, 14, '#cbd5e1', clamp(kk * 2)); text(ctx, lab, x, 230, { size: 28, weight: 900, color: '#e2e8f0', alpha: clamp(kk * 2) }); });
        // a base de cada imposto: curta no porto (preço de fábrica com frete), longa na loja (o preço da prateleira)
        const kl = appear(t, tLoja, 0.7), kf = appear(t, tFab, 0.7);
        if (kl > 0) { fillRR(ctx, 2000, 560, 840 * ease.out(kl), 70, 12, hexA(F.icms, 0.9)); text(ctx, 'ICMS: em cima do preço da loja', 2420, 595, { size: 28, weight: 900, color: '#1f2937', alpha: clamp(kl * 2) }); arrow(ctx, 2820, 340, 2820, 550, F.icms, 7, kl); }
        if (kf > 0) { fillRR(ctx, 2000, 430, 300 * ease.out(kf), 70, 12, hexA(F.imp, 0.9)); text(ctx, 'importação', 2150, 465, { size: 26, weight: 900, color: '#ffffff', alpha: clamp(kf * 2) }); arrow(ctx, 2260, 340, 2260, 420, F.imp, 7, kf);
          chip(ctx, 2560, 465, 'em cima do preço de fábrica', '#fca5a5', kf, { size: 24 }); }
        ctx.restore();
      });
      zone(ctx, cam2, 3700, 3900, () => {
        if (t < tFoi - 0.8 || t > tOut + 0.6) return;
        const k = vis(t, tFoi - 0.3, tOut, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        chip(ctx, 3800, 110, 'imposto de importação: 15 pontos a menos', '#fca5a5', appear(t, tFoi + 0.6, 0.4), { size: 28 });
        chip(ctx, 3800, 190, 'Ipea, o instituto de pesquisa do governo', '#93c5fd', appear(t, tIpea, 0.4), { size: 24 });
        const kc = appear(t, tFoi + 0.3, 0.6), enc = ease.inOut(prog(t, tCalc + 1.0, 1.0));
        { const ki = appear(t, tFoi + 0.9, 0.5), sh = ease.inOut(prog(t, tFoi + 1.6, 1.4)); if (ki > 0) { ctx.save(); ctx.globalAlpha *= ki; fillRR(ctx, 3330, 280, 35 * 14 - 15 * 14 * sh, 64, 12, F.imp);
          text(ctx, Math.round(35 - 15 * sh) + '%', 3330 + 35 * 14 - 15 * 14 * sh + 60, 312, { size: 32, weight: 900, color: '#fecaca' }); ctx.restore(); } }
        if (kc > 0) { ctx.save(); ctx.globalAlpha *= kc;
          text(ctx, 'preço na loja', 3330, 420, { size: 30, weight: 900, color: '#e2e8f0', align: 'left' });
          fillRR(ctx, 3330, 460, 1000 * (1 - 0.05 * enc), 110, 14, '#cbd5e1');
          ctx.setLineDash([10, 8]); ctx.strokeStyle = '#fca5a5'; ctx.lineWidth = 4; ctx.strokeRect(3330 + 950, 460, 50, 110); ctx.setLineDash([]);
          ctx.restore();
          bigNum(ctx, 'só uns 5% a menos', 3830, 700, appear(t, tCalc + 1.6, 0.5), { size: 64, color: '#fde68a' }); }
        ctx.restore();
      });
      zone(ctx, cam2, 5100, 5300, () => {
        if (t < tOut - 0.8) return;
        const k = appear(t, tOut - 0.4, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        ctx.save(); papelSombra(ctx); fillRR(ctx, 4750, 200, 900, 170, 20, F.resto); ctx.restore();
        text(ctx, 'R$ 67', 5200, 270, { size: 80, weight: 900, color: '#0f172a' });
        text(ctx, 'não é imposto', 5200, 340, { size: 28, weight: 900, color: '#1e293b' });
        const TAGS = [['a fábrica', 4860, 500, tFabr], ['o navio', 5200, 500, tNav], ['o importador', 5540, 500, tImpo], ['o dono do personagem', 4980, 620, tDono], ['a loja', 5440, 620, tDono + 0.8]];
        TAGS.forEach(([lab, x, y, tt]) => { const kk = appear(t, tt, 0.4); if (kk <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(kk * 2); ctx.strokeStyle = 'rgba(203,213,225,0.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y - 26); ctx.lineTo(lerp(x, 5200, 0.4), 370); ctx.stroke(); ctx.restore(); chip(ctx, x, y, lab, '#e2e8f0', kk, { size: 28 }); });
        ctx.restore();
      });
      luzinhas(ctx, cam2, t, 11, 8);
    },
    overlay(ctx, t) {
      papelPresente(ctx, 1, prog(t, 0.05, 1.0));
      source(ctx, 'conta do canal; Sefaz-SP', vis(t, tLoja, tFoi, 0.5, 0.4));
      source(ctx, 'Ipea (2020), via InfoMoney', vis(t, tIpea, tOut, 0.5, 0.4));
    },
  };
}

// ================================================================ Cena 06: o que não é imposto (o personagem e a loja)
function scene06(K) {
  const tPers = K('Começa pelo personagem'), tDoze = K('Nos doze maiores mercados'), tTres = K('um em cada três reais'), tDes = K('desenho ou jogo'), tLic = K('e cada caixa dessas paga uma licença');
  const tLoja = K('Depois vem a loja'), tNat = K('Natal e Dia das Crianças'), tAbr = K('segundo a Abrinq'), tEnc = K('A loja encomenda meses antes'), tEst = K('paga o estoque'), tAlu = K('o aluguel e os vendedores'), tPrec = K('e precisa vender quase tudo');
  const t25 = K('Em 2025'), tDez = K('esse mercado passou');
  const cam = [
    { t: 0, x: 960, y: 480, z: 1.0, dx: 3 }, { t: tTres, x: 1000, y: 450, z: 1.06, d: 1.4 }, { t: tLic, x: 1200, y: 480, z: 1.06, d: 1.4 },
    { t: tLoja - 0.4, x: 2400, y: 470, z: 1.0, d: 1.5 }, { t: tEnc - 0.4, x: 3800, y: 470, z: 1.0, d: 1.5 }, { t: tPrec, x: 3860, y: 450, z: 1.06, d: 1.4 }, { t: t25 - 0.4, x: 5200, y: 470, z: 1.0, d: 1.5 },
  ];
  const sfx = [[tPers, 'pop', 0.3], [tDoze, 'tick', 0.3], [tTres, 'sparkle', 0.3], [tDes, 'pop', 0.25], [tLic, 'stamp', 0.4], [tLoja - 0.3, 'whoosh', 0.3], [tNat, 'pop', 0.3], [tNat + 1.0, 'ding', 0.3],
    [tEnc - 0.3, 'whoosh', 0.3], [tEnc + 0.3, 'caixa', 0.35], [tEst, 'caixa', 0.3], [tAlu, 'cash', 0.3], [tPrec, 'clock', 0.25, { n: 6, step: 0.3 }], [t25 - 0.3, 'whoosh', 0.3], [tDez, 'riser', 0.25, { dur: 0.8 }], [tDez + 0.9, 'hit', 0.35]];
  return {
    accent: '#a855f7', cam, sfx, impacts: [tDez + 0.9], trans: 'push',
    draw(ctx, t, cam2) {
      salaFundo(ctx, cam2, t, 0.95, 0.1);
      zone(ctx, cam2, 900, 1200, () => {
        if (t > tLoja + 0.6) return;
        const k = vis(t, 0, tLoja, 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        headline(ctx, 'o personagem', 760, 110, { size: 56, k: appear(t, tPers, 0.5), hl: '#581c87' });
        chip(ctx, 760, 210, 'os 12 maiores mercados, Brasil incluído', '#e2e8f0', appear(t, tDoze, 0.4), { size: 24 });
        for (let i = 0; i < 12; i++) { const kk = appear(t, tDoze + 0.2 + i * 0.06, 0.4); if (kk <= 0) continue; const lic = i % 3 === 1 && t > tTres;
          caixaMini(ctx, 470 + (i % 6) * 115, 400 + Math.floor(i / 6) * 170, 0.95, lic ? '#a855f7' : '#475569', { a: clamp(kk * 2), estrela: lic }); }
        chip(ctx, 760, 690, '1 em cada 3 reais: brinquedo de filme, desenho ou jogo', '#d8b4fe', appear(t, tTres + 0.6, 0.4), { size: 22 });
        caixaBrinquedo(ctx, 1460, 470, 0.5, { key: 'd' });
        const kl = appear(t, tLic, 0.5);
        if (kl > 0) { ctx.save(); ctx.translate(1640, 330); ctx.rotate(0.12); ctx.globalAlpha *= clamp(kl * 2); const sc = lerp(1.4, 1, ease.out(kl)); ctx.scale(sc, sc);
          ctx.save(); papelSombra(ctx); fillRR(ctx, -110, -46, 220, 92, 12, '#faf5ff'); ctx.restore(); strokeRR(ctx, -110, -46, 220, 92, 12, '#a855f7', 5);
          text(ctx, 'LICENÇA', 0, 2, { size: 36, weight: 900, color: '#6b21a8', letter: 3 }); ctx.restore(); }
        ctx.restore();
      });
      zone(ctx, cam2, 2300, 2500, () => {
        if (t < tLoja - 0.8 || t > tEnc + 0.6) return;
        const k = vis(t, tLoja - 0.3, tEnc, 0.5, 0.5), base = 680;
        ctx.save(); ctx.globalAlpha *= k;
        headline(ctx, 'a loja', 2400, 110, { size: 56, k: appear(t, tLoja, 0.5), hl: '#7c2d12' });
        const M = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'], V = [3, 3, 3, 3, 4, 3, 3, 3, 4, 26, 6, 39];
        fillRR(ctx, 1960, base, 880, 6, 3, '#64748b');
        M.forEach((m, i) => { const kk = appear(t, tLoja + 0.4 + i * 0.06, 0.6), h = V[i] * 9 * ease.out(kk), x = 1985 + i * 72, hot = i === 9 || i === 11;
          fillRR(ctx, x, base - h, 54, h, 8, hot ? '#f472b6' : '#64748b'); text(ctx, m, x + 27, base + 32, { size: 24, weight: 900, color: hot ? '#fbcfe8' : '#94a3b8', alpha: clamp(kk * 2) }); });
        text(ctx, 'Dia das Crianças', 2675, 260, { size: 24, weight: 900, color: '#fbcfe8', alpha: appear(t, tNat + 1.0, 0.4), align: 'right' });
        text(ctx, 'Natal', 2810, 300, { size: 24, weight: 900, color: '#fbcfe8', alpha: appear(t, tNat + 1.0, 0.4) });
        if (t > tNat + 1.8) for (let j = 0; j < 6; j++) { const ph = ((t - tNat - 1.8) * 0.7 + j / 6) % 1, col = j % 2 ? 11 : 9, x = 1985 + col * 72 + 27, top = base - V[col] * 9;
          caixaMini(ctx, x, lerp(top - 260, top - 30, ease.in(ph)), 0.4, '#f472b6', { a: (1 - ph) * appear(t, tNat + 1.8, 0.5) }); }
        chip(ctx, 2300, 220, 'uns 2/3 das vendas do ano', '#f9a8d4', appear(t, tNat + 1.6, 0.4), { size: 26 });
        ctx.restore();
      });
      zone(ctx, cam2, 3700, 3900, () => {
        if (t < tEnc - 0.8 || t > t25 + 0.6) return;
        const k = vis(t, tEnc - 0.3, t25, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        // prateleira da loja enchendo de caixas
        ctx.fillStyle = '#5b4636'; for (const y of [360, 600]) ctx.fillRect(3330, y, 940, 20); ctx.fillRect(3330, 140, 20, 480); ctx.fillRect(4250, 140, 20, 480);
        for (let i = 0; i < 14; i++) { const kk = appear(t, tEnc + 0.3 + i * 0.12, 0.4); if (kk <= 0) continue; const row = i < 7 ? 0 : 1, x = 3410 + (i % 7) * 128, y = row ? 545 : 305;
          caixaMini(ctx, x, y - (1 - ease.out(kk)) * 60, 0.95, ['#ec4899', '#2563eb', '#16a34a', '#f59e0b', '#a855f7', '#dc2626', '#0891b2'][i % 7], { a: clamp(kk * 2) }); }
        chip(ctx, 3800, 100, 'encomenda meses antes', '#e2e8f0', appear(t, tEnc + 0.2, 0.4), { size: 26 });
        chip(ctx, 3480, 700, 'estoque', '#e2e8f0', appear(t, tEst, 0.4), { size: 26 });
        chip(ctx, 3800, 700, 'aluguel', '#e2e8f0', appear(t, tAlu, 0.4), { size: 26 });
        chip(ctx, 4120, 700, 'vendedores', '#e2e8f0', appear(t, tAlu + 0.6, 0.4), { size: 26 });
        chip(ctx, 3800, 180, 'e vender quase tudo em poucas semanas', '#fde68a', appear(t, tPrec + 0.3, 0.4), { size: 24 });
        ctx.restore();
      });
      zone(ctx, cam2, 5100, 5300, () => {
        if (t < t25 - 0.8) return;
        const k = appear(t, t25 - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        const v = counting(t, tDez, 1.0, 9.0, 10.39);
        bigNum(ctx, 'R$ ' + v.toFixed(2).replace('.', ',') + ' bi', 5200, 420, appear(t, tDez, 0.5), { size: 110, color: '#f9a8d4' });
        chip(ctx, 5200, 230, '2025: vendas de brinquedo no Brasil', '#e2e8f0', appear(t, t25, 0.4), { size: 28 });
        chip(ctx, 5200, 600, 'pela primeira vez acima de R$ 10 bi', '#f9a8d4', appear(t, tDez + 1.2, 0.4), { size: 28 });
        sparks(ctx, t, tDez + 0.9, 5200, 420, '#f9a8d4', 18);
        ctx.restore();
      });
      luzinhas(ctx, cam2, t, 13, 9);
    },
    overlay(ctx, t) {
      source(ctx, 'Circana, via Abral (2024)', vis(t, tDoze, tLoja, 0.5, 0.4));
      source(ctx, 'Abrinq', vis(t, tAbr, 99, 0.5, 0.4));
    },
  };
}

// ================================================================ Cena 07: o selo do Inmetro e o brinquedo irregular
function scene07(K) {
  const tPed = K('Tem um pedaço que vem impresso'), tSelo = K('o selo do Inmetro'), t92 = K('Desde 1992'), tSo = K('brinquedo só pode ser vendido'), tTes = K('depois de passar por testes'), tPeca = K('como o de peça pequena');
  const tCus = K('Esse teste custa'), tPre = K('e o custo entra no preço'), tPula = K('Quem pula essa etapa'), tIrr = K('e aí aparece o brinquedo irregular'), tJan = K('De janeiro a setembro'), tRec = K('a Receita apreendeu'), tAno = K('quase o ano inteiro de 2025');
  const CX = 820, CY = 480, CS = 0.66, [sx, sy] = seloDaCaixa(CX, CY, CS);
  const cam = [
    { t: 0, x: 960, y: 480, z: 1.0, dz: 0.004 }, { t: tSelo, x: 900, y: 560, z: 1.12, d: 1.4 }, { t: t92, x: 1080, y: 480, z: 1.02, d: 1.4 },
    { t: tTes - 0.4, x: 2400, y: 470, z: 1.0, d: 1.5 }, { t: tPeca, x: 2340, y: 500, z: 1.08, d: 1.4 }, { t: tPula - 0.4, x: 3800, y: 470, z: 1.0, d: 1.5 }, { t: tJan - 0.4, x: 5200, y: 470, z: 1.0, d: 1.5 }, { t: tAno, x: 5200, y: 450, z: 1.05, d: 1.6 },
  ];
  const sfx = [[tPed, 'pop', 0.3], [tSelo, 'stamp', 0.4], [t92, 'tick', 0.3], [tSo, 'pop', 0.3], [tTes - 0.3, 'whoosh', 0.3], [tPeca + 0.3, 'drip', 0.4, { big: 1 }], [tPeca + 1.4, 'buzz', 0.25], [tCus, 'coin', 0.35], [tPre, 'pop', 0.3],
    [tPula - 0.3, 'whoosh', 0.3], [tPula + 0.5, 'pop', 0.3], [tIrr, 'buzz', 0.3], [tJan - 0.3, 'whoosh', 0.3], [tJan + 0.3, 'caixa', 0.35], [tJan + 0.9, 'caixa', 0.3], [tRec, 'fita', 0.4, { dur: 0.6 }], [tRec + 1.0, 'hit', 0.35]];
  return {
    accent: '#3b82f6', cam, sfx, impacts: [tRec + 1.0], trans: 'push',
    draw(ctx, t, cam2) {
      salaFundo(ctx, cam2, t, 0.95);
      zone(ctx, cam2, 900, 1100, () => {
        if (t > tTes + 0.6) return;
        const k = vis(t, 0, tTes, 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        caixaBrinquedo(ctx, CX, CY, CS, { key: 'e' });
        const lp = ease.inOut(prog(t, tPed + 0.4, 1.6)); lupa(ctx, lerp(1400, sx + 10, lp), lerp(200, sy - 6, lp), 0.9, 0.7);
        penCircle(ctx, sx, sy, 54, 48, '#fde047', prog(t, tSelo, 0.6), 6);
        seloSeg(ctx, 1480, 380, 170, appear(t, tSelo + 0.4, 0.5));
        chip(ctx, 1480, 640, 'obrigatório desde 1992', '#93c5fd', appear(t, t92, 0.4), { size: 28 });
        chip(ctx, 1480, 720, 'sem ele, não pode vender', '#e2e8f0', appear(t, tSo + 0.6, 0.4), { size: 24 });
        ctx.restore();
      });
      zone(ctx, cam2, 2300, 2500, () => {
        if (t < tTes - 0.8 || t > tPula + 0.6) return;
        const k = vis(t, tTes - 0.3, tPula, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        chip(ctx, 2400, 100, 'testes de segurança', '#93c5fd', appear(t, tTes, 0.4), { size: 30 });
        cilindroTeste(ctx, 2200, 500, 1.0, prog(t, tPeca, 0.9));
        chip(ctx, 2200, 230, 'peça que cabe aqui: reprovada', '#fca5a5', appear(t, tPeca + 1.2, 0.4), { size: 22 });
        const kc = appear(t, tCus, 0.5);
        if (kc > 0) { moeda1(ctx, 2620, 420, 46, { a: kc }); arrow(ctx, 2680, 420, 2780, 420, '#fde68a', 7, appear(t, tPre, 0.5)); etiquetaPreco(ctx, 2900, 470, 0.5, 'R$', { rot: 0.08, a: appear(t, tPre, 0.5), size: 110 }); }
        chip(ctx, 2760, 640, 'o teste custa e entra no preço', '#fde68a', appear(t, tPre + 0.4, 0.4), { size: 24 });
        ctx.restore();
      });
      zone(ctx, cam2, 3700, 3900, () => {
        if (t < tPula - 0.8 || t > tJan + 0.6) return;
        const k = vis(t, tPula - 0.3, tJan, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        caixaBrinquedo(ctx, 3480, 470, 0.5, { key: 'f' });
        caixaBrinquedo(ctx, 4120, 470, 0.5, { key: 'g', semSelo: true, a: appear(t, tPula + 0.4, 0.5) });
        chip(ctx, 3480, 120, 'com selo', '#86efac', appear(t, tPula, 0.4), { size: 28 });
        chip(ctx, 4120, 120, 'sem selo, mais barato', '#fca5a5', appear(t, tPula + 0.6, 0.4), { size: 28 });
        xMark(ctx, 4120, 470, 3.0, '#ef4444', prog(t, tIrr, 0.5));
        chip(ctx, 4120, 760, 'irregular', '#fca5a5', appear(t, tIrr + 0.4, 0.4), { size: 28 });
        ctx.restore();
      });
      zone(ctx, cam2, 5100, 5300, () => {
        if (t < tJan - 0.8) return;
        const k = appear(t, tJan - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        caixasRetidas(ctx, 4880, 560, 0.85, prog(t, tJan + 0.2, 1.4));
        chip(ctx, 5200, 100, 'Receita Federal · janeiro a setembro de 2026', '#e2e8f0', appear(t, tJan, 0.4), { size: 24 });
        bigNum(ctx, 'quase R$ 49 milhões', 5440, 230, appear(t, tRec + 1.0, 0.5), { size: 62, color: '#fca5a5' });
        const kb = appear(t, tAno, 0.6);
        if (kb > 0) { ctx.save(); ctx.globalAlpha *= kb;
          for (const [lab, v, y, cor] of [['2025 inteiro', 51.7, 400, '#94a3b8'], ['2026 até setembro', 48.7, 520, '#f87171']]) { text(ctx, lab, 5250, y - 50, { size: 26, weight: 900, color: '#e2e8f0', align: 'left' }); fillRR(ctx, 5250, y - 20, v * 9 * ease.out(kb), 56, 10, cor); }
          ctx.restore(); }
        ctx.restore();
      });
      luzinhas(ctx, cam2, t, 15, 8);
    },
    overlay(ctx, t) {
      source(ctx, 'Inmetro', vis(t, t92, tPula, 0.5, 0.4));
      source(ctx, 'Receita Federal, via Valor (28/10/2026)', vis(t, tRec, 99, 0.5, 0.4));
    },
  };
}

// ================================================================ Cena 08: a promessa se paga (a compra de fora até US$ 50) e o que conferir
function scene08(K) {
  const tFal = K('Falta a promessa do começo'), tAtrav = K('a boneca que atravessa a fronteira'), tMaio = K('Desde maio de 2026'), tComp = K('a compra de até cinquenta dólares'), tProg = K('o programa da Receita'), tNaoP = K('não paga imposto de importação');
  const tCong = K('o Congresso confirmou'), tSob = K('Sobra só o ICMS'), tMesma = K('A mesma boneca chega pagando'), tSoQ = K('Só que essa caixa nem sempre'), tDep = K('pode chegar depois do Natal'), tTroca = K('e a troca é mais difícil');
  const tEnt = K('Então, em qualquer lugar'), tProc = K('procura o selo e a idade'), tCompa = K('compara o preço com o frete'), tEsp = K('E não vale esperar janeiro'), tZero = K('o IPI vai a zero em 2027'), tNovos = K('mas os tributos novos');
  const cam = [
    { t: 0, x: 960, y: 480, z: 1.0, dx: 3 }, { t: tMaio, x: 1120, y: 470, z: 1.05, d: 1.4 }, { t: tNaoP, x: 1180, y: 500, z: 1.08, d: 1.4 },
    { t: tSob - 0.4, x: 2400, y: 470, z: 1.0, d: 1.5 }, { t: tSoQ - 0.4, x: 3800, y: 470, z: 1.0, d: 1.5 }, { t: tEnt, x: 3800, y: 450, z: 1.04, d: 1.4 }, { t: tEsp - 0.4, x: 5200, y: 470, z: 1.0, d: 1.5 },
  ];
  const sfx = [[tFal, 'pop', 0.3], [tAtrav, 'whoosh', 0.3, { dur: 0.8 }], [tAtrav + 0.7, 'caixa', 0.35], [tMaio, 'tap', 0.4], [tComp, 'tap', 0.35], [tProg, 'tap', 0.35], [tNaoP + 0.6, 'ding', 0.4], [tCong, 'stamp', 0.45],
    [tSob - 0.3, 'whoosh', 0.3], [tSob + 0.6, 'pop', 0.3], [tMesma, 'coin', 0.3], [tSoQ - 0.3, 'whoosh', 0.3], [tSoQ + 0.5, 'buzz', 0.25], [tDep, 'tick', 0.3], [tTroca, 'tick', 0.3],
    [tProc, 'pop', 0.3], [tCompa, 'pop', 0.3], [tCompa + 1.6, 'pop', 0.3], [tEsp - 0.3, 'whoosh', 0.3], [tZero, 'flip', 0.35, { dur: 0.4 }], [tNovos, 'pop', 0.3]];
  return {
    accent: '#ea580c', cam, sfx, impacts: [tCong], trans: 'push',
    draw(ctx, t, cam2) {
      salaFundo(ctx, cam2, t, 0.95);
      zone(ctx, cam2, 900, 1180, () => {
        if (t > tSob + 0.6) return;
        const k = vis(t, 0, tSob, 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        headline(ctx, 'a promessa do começo', 760, 100, { size: 52, k: vis(t, tFal, tMaio + 1, 0.5, 0.4), hl: '#7c2d12' });
        const pe = ease.out(prog(t, tAtrav, 0.8));
        pacoteRemessa(ctx, lerp(-200, 700, pe), 500, 0.56, { rot: -0.06 - (1 - pe) * 0.2 });
        celularCompra(ctx, 1460, 450, 0.88, { rows: t < tComp ? 0 : t < tProg ? 1 : t < tNaoP ? 2 : 4, hl: t < tComp ? -1 : t < tProg ? 0 : t < tNaoP ? 1 : 2, a: appear(t, tMaio, 0.5) });
        chip(ctx, 1080, 760, 'desde maio de 2026', '#fdba74', vis(t, tMaio + 0.3, tCong, 0.4, 0.4), { size: 24 });
        check(ctx, 1640, 520, 1.1, '#22c55e', prog(t, tNaoP + 0.6, 0.5));
        bigNum(ctx, 'até US$ 50', 1120, 230, vis(t, tComp + 0.3, tCong, 0.5, 0.4), { size: 60, color: '#fdba74' });
        rectStamp(ctx, 760, 220, 470, 100, 'CONGRESSO CONFIRMOU', '#86efac', appear(t, tCong, 0.35), -0.06, 36, 'SETEMBRO DE 2026');
        ctx.restore();
      });
      zone(ctx, cam2, 2300, 2500, () => {
        if (t < tSob - 0.8 || t > tSoQ + 0.6) return;
        const k = vis(t, tSob - 0.3, tSoQ, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        text(ctx, 'imposto em cada R$ 100', 2400, 120, { size: 34, weight: 900, color: '#e2e8f0' });
        text(ctx, 'na loja', 1960, 290, { size: 30, weight: 900, color: '#e2e8f0', align: 'left' });
        barraPreco(ctx, 1960, 320, 900, 90, [{ v: 4, cor: F.imp }, { v: 3, cor: F.ipi }, { v: 8, cor: F.pis }, { v: 18, cor: F.icms }], { resto: false });
        text(ctx, 'uns R$ 33', 2310, 365, { size: 30, weight: 900, color: '#f8fafc', align: 'left' });
        const kf = appear(t, tSob + 0.4, 0.6);
        if (kf > 0) { ctx.save(); ctx.globalAlpha *= kf; text(ctx, 'de fora, até US$ 50', 1960, 520, { size: 30, weight: 900, color: '#e2e8f0', align: 'left' });
          barraPreco(ctx, 1960, 550, 900, 90, [{ v: 17, cor: F.icms, k: prog(t, tSob + 0.4, 0.7) }], { resto: false });
          ctx.save(); ctx.globalAlpha *= 0.5; ctx.fillStyle = F.icms; ctx.fillRect(1960 + 17 * 9, 550, 3 * 9, 90); ctx.restore();
          text(ctx, 'só o ICMS: 17% a 20%', 2190, 595, { size: 30, weight: 900, color: '#fde68a', align: 'left' }); ctx.restore();
          const kx = appear(t, tSob + 2.5, 0.5); if (kx > 0) { ctx.save(); ctx.globalAlpha *= kx * 0.9; ctx.setLineDash([8, 6]); ctx.strokeStyle = '#fca5a5'; ctx.lineWidth = 3; ctx.strokeRect(2620, 556, 15 * 9, 78); ctx.setLineDash([]); ctx.restore();
            xMark(ctx, 2620 + 15 * 4.5, 595, 0.8, '#ef4444', prog(t, tSob + 2.8, 0.4)); text(ctx, 'importação · IPI · PIS e Cofins', 2690, 670, { size: 22, weight: 800, color: '#fca5a5', alpha: kx }); } }
        chip(ctx, 2400, 760, 'bem menos que na loja', '#86efac', appear(t, tMesma, 0.4), { size: 28 });
        ctx.restore();
      });
      zone(ctx, cam2, 3700, 3900, () => {
        if (t < tSoQ - 0.8 || t > tEsp + 0.6) return;
        const k = vis(t, tSoQ - 0.3, tEsp, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        const CU = [['nem sempre tem o selo', tSoQ + 0.4], ['pode chegar depois do Natal', tDep], ['a troca é mais difícil', tTroca]];
        CU.forEach(([lab, tt], i) => chip(ctx, 3400, 230 + i * 110, lab, '#fca5a5', vis(t, tt, tEnt, 0.4, 0.4), { size: 26 }));
        const CK = [['procura o selo e a idade na caixa', tProc], ['compara o preço com o frete', tCompa], ['confere a data de entrega', tCompa + 1.6]];
        const ke = appear(t, tEnt, 0.5);
        if (ke > 0) { ctx.save(); ctx.globalAlpha *= ke; ctx.save(); papelSombra(ctx); fillRR(ctx, 3420, 170, 820, 470, 22, '#fbfaf5'); ctx.restore();
          text(ctx, 'antes de comprar, em qualquer lugar', 3830, 220, { size: 30, weight: 900, color: P.ink });
          CK.forEach(([lab, tt], i) => { const y = 330 + i * 110; strokeRR(ctx, 3470, y - 30, 60, 60, 10, '#94a3b8', 4); check(ctx, 3500, y, 0.8, '#16a34a', prog(t, tt, 0.5)); text(ctx, lab, 3560, y, { size: 30, weight: 800, color: P.ink, align: 'left', alpha: appear(t, tt - 0.2, 0.3) }); });
          ctx.restore(); }
        ctx.restore();
      });
      zone(ctx, cam2, 5100, 5300, () => {
        if (t < tEsp - 0.8) return;
        const k = appear(t, tEsp - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        calendario(ctx, 4980, 470, 0.9, { nome: 'JANEIRO', ano: 2027, dias: 31, inicio: 5, marcas: { 1: { cor: '#f59e0b', k: prog(t, tZero, 0.6) } } }, { rot: -0.03, cor: '#1e3a8a', key: 'jan27' });
        chip(ctx, 5520, 300, 'IPI: zero', '#93c5fd', appear(t, tZero, 0.4), { size: 30 });
        chip(ctx, 4980, 110, 'esperar janeiro?', '#e2e8f0', appear(t, tEsp, 0.4), { size: 28 });
        rectStamp(ctx, 4980, 520, 300, 90, 'IPI ZERO', '#2563eb', appear(t, tZero + 0.5, 0.35), -0.1, 44);
        chip(ctx, 5520, 420, 'tributos novos da reforma', '#fde68a', appear(t, tNovos, 0.4), { size: 26 });
        arrow(ctx, 5520, 340, 5520, 390, '#e2e8f0', 6, appear(t, tNovos, 0.4));
        chip(ctx, 5300, 760, 'não conte com preço menor em janeiro', '#e2e8f0', appear(t, tNovos + 1.0, 0.4), { size: 24 });
        ctx.restore();
      });
      luzinhas(ctx, cam2, t, 17, 8);
    },
    overlay(ctx, t) {
      source(ctx, 'Receita Federal; MP 1.357/2026; Senado', vis(t, tMaio, tSoQ, 0.5, 0.4));
      source(ctx, 'Receita Federal (reforma tributária); InfoMoney', vis(t, tZero, 99, 0.5, 0.4));
    },
  };
}

// ================================================================ Cena 09: fechamento (a caixa embaixo da árvore, a caixa-surpresa e o pedágio)
function scene09(K) {
  const tEnt = K('quando a caixa estiver embaixo da árvore'), tTer = K('um terço do preço vai para o governo'), tMai = K('e a maior parte disso fica com o estado'), tRes = K('O resto paga quem fez'), tTrou = K('quem trouxe e quem vendeu');
  const tNum = K('E aquele número do começo'), tLista = K('de uma lista que ficou no passado'), tSe = K('Se esse vídeo te ajudou'), tInsc = K('se inscreve no canal'), tProx = K('No próximo'), tPed = K('o pedágio sem cancela'), tPort = K('A gente passa pelo pórtico');
  const tGira = tInsc - 0.4, tAbre = tInsc + 1.0;
  const cam = [
    { t: 0, x: 960, y: 480, z: 1.0, dx: 3 }, { t: tMai, x: 1180, y: 450, z: 1.05, d: 1.4 },
    { t: tNum - 0.4, x: 2400, y: 470, z: 1.0, d: 1.5 }, { t: tSe - 0.4, x: 3800, y: 470, z: 1.0, d: 1.5 }, { t: tInsc, x: 3840, y: 420, z: 1.06, d: 1.2 },
    { t: tProx - 0.3, x: 5200, y: 470, z: 1.0, d: 1.5, dx: 3 }, { t: tPort, x: 5200, y: 500, z: 1.06, d: 2.0, dz: 0.003 },
  ];
  const sfx = [[0.1, 'pop', 0.3], [tTer, 'pop', 0.35], [tMai, 'ding', 0.35], [tRes, 'pop', 0.3], [tTrou, 'pop', 0.3], [tNum - 0.3, 'whoosh', 0.3], [tLista, 'stamp', 0.4],
    [tSe - 0.3, 'whoosh', 0.3], [tGira, 'manivela', 0.6, { n: 12, step: 0.11 }], [tAbre, 'boing', 0.6], [tAbre + 0.25, 'ding', 0.4], [tProx - 0.2, 'whoosh', 0.3], [tPort, 'whoosh', 0.35, { dur: 1.2 }]];
  return {
    accent: F.icms, cam, sfx, impacts: [tAbre], trans: 'push',
    draw(ctx, t, cam2) {
      salaFundo(ctx, cam2, t, 0.95);
      zone(ctx, cam2, 900, 1180, () => {
        if (t > tNum + 0.6) return;
        const k = vis(t, 0, tNum, 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        arvore(ctx, 560, 500, 0.72, t);
        caixaBrinquedo(ctx, 840, 650, 0.32, { key: 'h' });
        etiquetaPreco(ctx, 1010, 720, 0.45, 'R$ 100', { rot: 0.12 + Math.sin(t * 1.3) * 0.04, a: appear(t, tEnt, 0.5), fio: [-120, -150] });
        sparks(ctx, t, tEnt + 0.3, 840, 600, '#fde68a', 14);
        const kb = appear(t, tTer, 0.6);
        if (kb > 0) { ctx.save(); ctx.globalAlpha *= kb;
          barraPreco(ctx, 1080, 360, 760, 110, [{ v: 4, cor: F.imp }, { v: 3, cor: F.ipi }, { v: 8, cor: F.pis }, { v: 18, cor: F.icms, glow: appear(t, tMai, 0.4) }], { restoCor: appear(t, tRes, 0.5) });
          text(ctx, 'um terço: governo', 1080, 310, { size: 30, weight: 900, color: '#fde68a', align: 'left' }); ctx.restore(); }
        chip(ctx, 1300, 560, 'a maior parte: o estado', F.icms, appear(t, tMai + 0.3, 0.4), { size: 26 });
        chip(ctx, 1560, 660, 'quem fez · quem trouxe · quem vendeu', '#cbd5e1', appear(t, tTrou, 0.4), { size: 24 });
        ctx.restore();
      });
      zone(ctx, cam2, 2300, 2500, () => {
        if (t < tNum - 0.8 || t > tSe + 0.6) return;
        const k = vis(t, tNum - 0.3, tSe, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        listaIBPT(ctx, 2250, 470, 0.85, { key: 'b', rot: 0.03 });
        const [, ly] = linhaLista(2250, 470, 0.85, 0);
        penCircle(ctx, 2250, ly, 300, 52, '#fde047', prog(t, tNum + 0.6, 0.7), 7);
        rectStamp(ctx, 2720, 300, 340, 110, 'DE 2012', '#fca5a5', appear(t, tLista, 0.35), 0.1, 52);
        consoleVG(ctx, 2760, 560, 0.45, { a: appear(t, tNum + 0.3, 0.5) });
        ctx.restore();
      });
      zone(ctx, cam2, 3700, 3900, () => {
        if (t < tSe - 0.8 || t > tProx + 0.6) return;
        const k = vis(t, tSe - 0.3, tProx, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        const gp = prog(t, tGira, 1.3), sobe = prog(t, tAbre, 0.5);
        caixaSurpresa(ctx, 3760, 600, 0.7, t, { giro: gp * 6.283 * 2 + t * 0.2, abre: prog(t, tAbre, 0.25), sobe, tSobe: tAbre });
        // a mão girando a manivela
        const kh = vis(t, tGira - 0.5, tAbre + 0.4, 0.4, 0.4);
        if (kh > 0) { const a = gp * 6.283 * 2, hx = 3760 + 250 * 0.7 + Math.cos(a) * 110 * 0.7 + 30, hy = 600 - 20 * 0.7 + Math.sin(a) * 110 * 0.7;
          ctx.save(); ctx.globalAlpha *= kh; ctx.translate(hx, hy); ctx.fillStyle = '#e0ac7e'; rr(ctx, 0, -22, 150, 44, 22); ctx.fill(); ctx.fillStyle = '#c98c5e'; rr(ctx, 40, -30, 200, 60, 28); ctx.fill(); ctx.restore(); }
        sparks(ctx, t, tAbre + 0.2, 3760, 180, '#86efac', 18);
        ctx.restore();
      });
      zone(ctx, cam2, 5100, 5300, () => {
        if (t < tProx - 0.6) return;
        const k = appear(t, tProx - 0.2, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        portico(ctx, 5200, 470, 0.85, t, t > tProx + 0.6 ? ((t - tProx - 0.6) / 2.6) % 1 : 0);
        chip(ctx, 5200, 100, 'próximo vídeo: o pedágio sem cancela', F.icms, appear(t, tProx, 0.4), { size: 30 });
        chip(ctx, 5200, 720, 'quem fica com cada real da tarifa', '#fde68a', appear(t, tPort + 0.4, 0.4), { size: 26 });
        ctx.restore();
      });
      luzinhas(ctx, cam2, t, 19, 9);
    },
    overlay(ctx, t) {},
  };
}

export const SCENES = [
  { id: '01', name: 'o-70-e-a-promessa', build: scene01 },
  { id: '02', name: 'de-onde-vem-o-numero', build: scene02 },
  { id: '03', name: 'a-tarifa-que-sobe-e-desce', build: scene03 },
  { id: '04', name: 'a-conta', build: scene04 },
  { id: '05', name: 'o-tamanho-de-cada-pedaco', build: scene05 },
  { id: '06', name: 'o-personagem-e-a-loja', build: scene06 },
  { id: '07', name: 'o-selo', build: scene07 },
  { id: '08', name: 'a-compra-de-fora', build: scene08 },
  { id: '09', name: 'fechamento', build: scene09 },
];
