// Vídeo 10: brinquedo de Natal, quem fica com cada real da caixa.
// Cada cena recebe K(frase) = instante (s, relativo à cena) em que a frase começa na narração.
// Conceito: a sala de casa na noite de Natal é o palco; um trenzinho de brinquedo leva a boneca em volta da árvore,
// parada por parada (FÁBRICA, PORTO, IMPORTADOR, LOJA, ÁRVORE). Fio condutor: a fita dourada do laço é a régua dos R$ 100,
// cortada em pedaços com o valor exato do exemplo (a voz arredonda, a tela mostra o exato; fontes.md, "Uma história só").
// Regras: câmera sempre andando, nada parado por mais de ~6 s, transições discretas, uma só de efeito (a caixa da boneca
// abre na planificação de papelão entre as cenas 5 e 6), sem música, objetos genéricos sem marca, nada de texto abaixo de y≈890.
import { W, H, C, clamp, lerp, prog, ease, appear, text, font, rr, fillRR, strokeRR, circle, hexA, source, iconTruck } from './lib.js';
import { glowText, counting, shockRing, sparks, layer, flash } from './fx.js';

// cores fixas do canal por destino: matéria-prima/fábrica verde, União vermelho, estado laranja, cadeia/loja roxo
const P = {
  fab: '#22c55e', fed: '#ef4444', icms: '#f59e0b', aqui: '#a855f7', gold: '#facc15', ouro2: '#d4a017',
  ink: '#1f2937', paper: '#fbfaf5', red: '#dc2626', ok: '#22c55e', amber: '#fbbf24', sky: '#38bdf8', voce: '#4ade80',
  estado: '#f59e0b', pref: '#a855f7', escola: '#38bdf8', hist: '#e7d7b0', azul: '#1e3a8a', lista: '#e2e8f0',
};
// valores do exemplo (fontes.md): fábrica + navio, importação, IPI, PIS e Cofins, ICMS; o resto fica aqui
const V = { fab: 20, imp: 3.6, ipi: 2.93, pis: 7.59, icms: 18 };
V.fed = V.imp + V.ipi + V.pis; V.tax = V.fed + V.icms; V.aqui = 100 - V.fab - V.tax;
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

// ================================================================ cenário: a sala na noite de Natal (fundo com paralaxe e desfoque)
// parede com papel listrado, janela com prédios acesos e cortina, pisca-pisca no alto, estante, abajur, sofá, piso de madeira e tapete.
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
// luzinhas desfocadas perto da câmera (camada da frente), quentes
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

// ================================================================ árvore de Natal (galhos recortados, festão, bolas com brilho, luzinhas e estrela)
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

// ================================================================ o presente: caixa embrulhada, fita dourada em cruz, laço e etiqueta de preço pendurada
// o: { tampa 0..1 (abre), janela 0..1 (mostra a boneca), etq 'R$ 100,00', etqK, balanco, laco 0..1 (1 = laço desfeito), tag (inscrição) }
function presente(ctx, x, y, s, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  const Wb = 420, Hb = 300, L = -Wb / 2, T = -Hb / 2;
  sombraChao(ctx, 0, Hb / 2 + 10, 300, 0.55);
  // boneca aparecendo por dentro
  ctx.save(); papelSombra(ctx); fillRR(ctx, L, T, Wb, Hb, 8, '#b91c1c'); ctx.restore();
  ctx.save(); rr(ctx, L, T, Wb, Hb, 8); ctx.clip();
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 14; for (let k = -Wb; k < Wb; k += 52) { ctx.beginPath(); ctx.moveTo(L + k, T); ctx.lineTo(L + k + Hb, T + Hb); ctx.stroke(); }
  for (let k = 0; k < 14; k++) circle(ctx, L + 30 + (k * 97) % Wb, T + 30 + (k * 61) % Hb, 6, 'rgba(250,204,21,0.35)');
  const kj = clamp(o.janela || 0);
  if (kj > 0) { ctx.save(); ctx.globalAlpha *= kj; fillRR(ctx, -120, -110, 240, 230, 16, '#fdf2f8'); boneca(ctx, 0, 10, 0.62, t); ctx.globalAlpha *= 0.25; fillRR(ctx, -120, -110, 240, 230, 16, '#ffffff'); ctx.restore(); }
  ctx.restore();
  if (!o.semFita) { ctx.fillStyle = P.gold; ctx.fillRect(-20, T, 40, Hb); ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(-20, T, 8, Hb); }
  // tampa
  const tk = ease.out(clamp(o.tampa || 0));
  ctx.save(); ctx.translate(0, T - tk * 150); ctx.rotate(-tk * 0.22);
  ctx.save(); papelSombra(ctx); fillRR(ctx, L - 16, -46, Wb + 32, 52, 8, '#991b1b'); ctx.restore();
  if (!o.semFita) { ctx.fillStyle = P.gold; ctx.fillRect(-20, -46, 40, 52); }
  // laço
  const kl = clamp(o.laco || 0);
  if (!o.semFita) {
    ctx.save(); ctx.translate(0, -50); ctx.rotate(kl * 0.6); ctx.globalAlpha *= 1 - kl * 0.9;
    ctx.fillStyle = P.gold; for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(d * 40, -80, d * 140, -60, d * 110, -5); ctx.bezierCurveTo(d * 90, 20, d * 30, 10, 0, 0); ctx.fill(); }
    ctx.fillStyle = P.ouro2; for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(d * 60, 70); ctx.lineTo(d * 40, 76); ctx.lineTo(d * 18, 10); ctx.closePath(); ctx.fill(); }
    circle(ctx, 0, -2, 20, P.ouro2);
    ctx.restore();
  }
  ctx.restore();
  // etiqueta de preço pendurada no laço por um barbante
  if (o.etq) {
    const ke = clamp(o.etqK ?? 1), sw = Math.sin(t * 1.3) * 0.06 + (o.balanco || 0);
    ctx.save(); ctx.globalAlpha *= ke; ctx.translate(Wb / 2 - 30, T - 10); ctx.rotate(0.35 + sw);
    ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(70, 70); ctx.stroke();
    etiquetaPreco(ctx, 150, 120, 1.0, o.etq, -0.35, o.etqCor);
    ctx.restore();
  }
  ctx.restore();
}
// etiqueta de preço de papel (formato de etiqueta com furo e barbante)
function etiquetaPreco(ctx, x, y, s, str, rot = 0, cor) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.save(); papelSombra(ctx); ctx.fillStyle = '#fffbeb';
  ctx.beginPath(); ctx.moveTo(-130, -40); ctx.lineTo(-170, 0); ctx.lineTo(-130, 40); ctx.lineTo(130, 40); ctx.lineTo(130, -40); ctx.closePath(); ctx.fill(); ctx.restore();
  circle(ctx, -138, 0, 9, '#7c2d12');
  ctx.strokeStyle = 'rgba(31,41,55,0.25)'; ctx.lineWidth = 2; ctx.strokeRect(-110, -30, 230, 60);
  text(ctx, str, 5, 2, { size: 50, weight: 900, color: cor || P.ink });
  ctx.restore();
}

// ================================================================ a boneca genérica (cabelo de lã com marias-chiquinhas, vestido simples)
function boneca(ctx, x, y, s, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  const pele = '#f1c9a5', cab = o.cab || '#7c3f1d', vest = o.vest || '#2563eb';
  // pernas e sapatos
  ctx.fillStyle = pele; ctx.fillRect(-34, 110, 22, 70); ctx.fillRect(12, 110, 22, 70);
  fillRR(ctx, -42, 172, 36, 20, 8, '#111827'); fillRR(ctx, 6, 172, 36, 20, 8, '#111827');
  // vestido (trapézio) com gola branca
  ctx.fillStyle = vest; ctx.beginPath(); ctx.moveTo(-40, -20); ctx.lineTo(40, -20); ctx.lineTo(80, 120); ctx.lineTo(-80, 120); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.moveTo(-34, -20); ctx.lineTo(0, 6); ctx.lineTo(34, -20); ctx.closePath(); ctx.fill();
  for (let k = 0; k < 3; k++) circle(ctx, 0, 30 + k * 26, 5, '#fde68a');
  // braços
  ctx.strokeStyle = pele; ctx.lineWidth = 18; ctx.lineCap = 'round'; const ab = Math.sin(t * 2) * 0.05;
  ctx.beginPath(); ctx.moveTo(-40, -6); ctx.lineTo(-74, 60 + ab * 40); ctx.moveTo(40, -6); ctx.lineTo(74, 60 - ab * 40); ctx.stroke();
  // marias-chiquinhas de lã
  for (const d of [-1, 1]) { ctx.fillStyle = cab; ctx.beginPath(); ctx.ellipse(d * 78, -78, 26, 44, d * 0.4, 0, 6.283); ctx.fill(); circle(ctx, d * 60, -102, 9, '#ef4444'); }
  // cabeça
  circle(ctx, 0, -86, 62, pele);
  ctx.fillStyle = cab; ctx.beginPath(); ctx.arc(0, -96, 64, Math.PI * 1.05, Math.PI * 1.95); ctx.quadraticCurveTo(10, -120, -60, -100); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 3; for (let k = -40; k <= 40; k += 16) { ctx.beginPath(); ctx.moveTo(k, -150); ctx.quadraticCurveTo(k * 1.1, -125, k * 1.3, -110); ctx.stroke(); }
  circle(ctx, -22, -84, 7, '#111827'); circle(ctx, 22, -84, 7, '#111827'); circle(ctx, -20, -86, 2.5, '#ffffff'); circle(ctx, 24, -86, 2.5, '#ffffff');
  circle(ctx, -36, -64, 10, 'rgba(244,114,182,0.5)'); circle(ctx, 36, -64, 10, 'rgba(244,114,182,0.5)');
  ctx.strokeStyle = '#be123c'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, -66, 14, 0.25, Math.PI - 0.25); ctx.stroke();
  ctx.restore();
}
// caixa da boneca de loja (embalagem com janela de plástico e o lugar do selo)
function caixaBoneca(ctx, x, y, s, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.rot || 0); ctx.globalAlpha *= o.a ?? 1;
  const cor = o.cor || '#db2777';
  ctx.save(); papelSombra(ctx); fillRR(ctx, -150, -210, 300, 420, 14, cor); ctx.restore();
  fillRR(ctx, -150, -210, 300, 70, 14, hexA('#000000', 0.18));
  text(ctx, o.nome || 'BONECA', 0, -174, { size: 38, weight: 900, color: '#ffffff', letter: 4 });
  fillRR(ctx, -118, -128, 236, 280, 12, '#fdf2f8');
  boneca(ctx, 0, 30, 0.62, t, { vest: o.vest });
  ctx.save(); ctx.globalAlpha *= 0.25; const g = ctx.createLinearGradient(-118, -128, 118, 152); g.addColorStop(0, '#ffffff'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); g.addColorStop(1, '#ffffff'); ctx.fillStyle = g; rr(ctx, -118, -128, 236, 280, 12); ctx.fill(); ctx.restore();
  strokeRR(ctx, -118, -128, 236, 280, 12, 'rgba(255,255,255,0.8)', 4);
  text(ctx, '3+', -112, 182, { size: 22, weight: 900, color: '#ffffff', align: 'left' });
  if (o.selo !== false && o.selo !== 'vazio') seloSeguranca(ctx, 100, 172, 0.34, { k: o.seloK ?? 1 });
  if (o.selo === 'vazio') { ctx.save(); ctx.setLineDash([8, 8]); ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(100, 172, 30, 0, 6.283); ctx.stroke(); ctx.restore(); text(ctx, '?', 100, 174, { size: 36, weight: 900, color: '#ffffff' }); }
  if (o.etq) etiquetaPreco(ctx, 0, 250, 0.7, o.etq, 0.05, o.etqCor);
  ctx.restore();
}
// selo de certificação genérico (sem a marca de nenhum órgão): escudo com visto e a palavra SEGURANÇA
function seloSeguranca(ctx, x, y, s, o = {}) {
  const k = clamp(o.k ?? 1); if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * lerp(1.5, 1, ease.out(k)), s * lerp(1.5, 1, ease.out(k))); ctx.globalAlpha *= clamp(k * 2);
  circle(ctx, 0, 0, 92, '#ffffff'); ctx.strokeStyle = '#15803d'; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(0, 0, 80, 0, 6.283); ctx.stroke();
  ctx.fillStyle = '#15803d'; ctx.beginPath(); ctx.moveTo(0, -52); ctx.lineTo(42, -36); ctx.lineTo(36, 18); ctx.quadraticCurveTo(20, 46, 0, 58); ctx.quadraticCurveTo(-20, 46, -36, 18); ctx.lineTo(-42, -36); ctx.closePath(); ctx.fill();
  check(ctx, 0, 0, 0.7, '#ffffff', 1);
  ctx.restore();
}

// ================================================================ a fita dourada do laço como régua dos R$ 100
// pedaços: [{ a, b (reais, 0..100), cor (null = dourada), k (cor entrando 0..1), dx, dy, al (alpha), gap (corte aberto 0..1) }]
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
// rótulo de um pedaço da fita (valor exato em cima, nome embaixo)
function rotuloFita(ctx, x, y, val, nome, cor, k, o = {}) {
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(k * 1.8); ctx.translate(x, y + (1 - ease.out(clamp(k))) * 16);
  glowText(ctx, val, 0, -8, { size: o.size || 46, weight: 900, color: cor, glow: hexA(cor, 0.5), blur: 24 });
  if (nome) text(ctx, nome, 0, Math.max(34, (o.size || 46) * 0.55 + 12), { size: o.sub || 22, weight: 900, color: '#e2e8f0' });
  if (o.exemplo) { ctx.font = font(o.size || 46, 900); const wv = ctx.measureText(val).width; fillRR(ctx, wv / 2 + 4, -36, 98, 30, 15, '#0b1222'); strokeRR(ctx, wv / 2 + 4, -36, 98, 30, 15, '#cbd5e1', 2); text(ctx, 'exemplo', wv / 2 + 53, -20, { size: 17, weight: 900, color: '#cbd5e1' }); }
  ctx.restore();
}
// tesoura (aberta 0..1) cortando
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

// ================================================================ trenzinho de brinquedo, trilho e plaquinhas das paradas
function trilho(ctx, x0, x1, y, o = {}) {
  ctx.save(); ctx.globalAlpha *= o.a ?? 1;
  for (let x = x0; x < x1; x += 34) fillRR(ctx, x, y - 6, 22, 30, 3, '#78350f');
  ctx.fillStyle = '#94a3b8'; ctx.fillRect(x0, y - 2, x1 - x0, 6); ctx.fillRect(x0, y + 14, x1 - x0, 6);
  ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(x0, y - 2, x1 - x0, 2); ctx.fillRect(x0, y + 14, x1 - x0, 2);
  ctx.restore();
}
function plaquinha(ctx, x, y, label, cor, k = 1, o = {}) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.globalAlpha *= clamp(k * 2); ctx.rotate((1 - ease.back(clamp(k))) * 0.3 + (o.rot || 0));
  ctx.fillStyle = '#e5e7eb'; ctx.fillRect(-5, -10, 10, 120);
  ctx.font = font(26, 900); const w = Math.max(150, ctx.measureText(label).width + 44);
  ctx.save(); papelSombra(ctx); fillRR(ctx, -w / 2, -64, w, 56, 10, '#0b1222'); ctx.restore();
  strokeRR(ctx, -w / 2, -64, w, 56, 10, cor, 4);
  text(ctx, label, 0, -35, { size: 26, weight: 900, color: '#ffffff', letter: 2 });
  if (o.x > 0) xMark(ctx, 0, -36, 1.1, '#ef4444', o.x);
  ctx.restore();
}
// locomotiva + vagão com a caixa da boneca; anda para a direita; fumaça sobe
function trem(ctx, x, y, s, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  const roda = (cx, r) => { circle(ctx, cx, 0, r, '#111827'); circle(ctx, cx, 0, r * 0.7, '#9ca3af'); ctx.save(); ctx.translate(cx, 0); ctx.rotate((o.giro ?? t * 4)); ctx.strokeStyle = '#374151'; ctx.lineWidth = 4; for (let k = 0; k < 3; k++) { ctx.rotate(1.047); ctx.beginPath(); ctx.moveTo(-r * 0.65, 0); ctx.lineTo(r * 0.65, 0); ctx.stroke(); } ctx.restore(); circle(ctx, cx, 0, 5, '#facc15'); };
  // vagão (atrás)
  if (o.vagao !== false) {
    ctx.save(); papelSombra(ctx); fillRR(ctx, -330, -50, 210, 40, 6, '#ca8a04'); ctx.restore();
    ctx.fillStyle = '#374151'; ctx.fillRect(-120, -36, 30, 10);
    if (o.carga !== false) { ctx.save(); ctx.translate(-225, -110); ctx.scale(0.3, 0.3); caixaBoneca(ctx, 0, 0, 1, t, { selo: o.selo, nome: 'BONECA' }); ctx.restore(); }
    roda(-290, 22); roda(-160, 22);
  }
  // locomotiva
  ctx.save(); papelSombra(ctx); fillRR(ctx, -80, -110, 90, 110, 8, '#b91c1c'); ctx.restore();
  fillRR(ctx, -70, -96, 70, 40, 6, '#fde68a');
  fillRR(ctx, -94, -124, 118, 20, 6, '#111827');
  ctx.save(); papelSombra(ctx); fillRR(ctx, 0, -84, 150, 84, 40, '#dc2626'); ctx.restore();
  for (const bx of [40, 80, 120]) ctx.fillRect(bx, -84, 6, 84);
  ctx.fillStyle = '#111827'; ctx.fillRect(110, -140, 26, 60); fillRR(ctx, 102, -150, 42, 16, 6, '#111827');
  circle(ctx, 150, -44, 16, '#fde68a');
  ctx.fillStyle = '#374151'; ctx.beginPath(); ctx.moveTo(150, -10); ctx.lineTo(190, 14); ctx.lineTo(150, 14); ctx.closePath(); ctx.fill();
  roda(-40, 28); roda(50, 22); roda(115, 22);
  // fumaça
  for (let i = 0; i < 4; i++) { const ph = ((t * 0.9 + i * 0.25) % 1); circle(ctx, 123 - ph * 90, -160 - ph * 120, 14 + ph * 26, '#e5e7eb', (1 - ph) * 0.35 * (o.fumaca ?? 1)); }
  ctx.restore();
}

// ================================================================ fábrica, navio, contêiner, guindaste, galpão e loja (todos genéricos)
function fabrica(ctx, x, y, s, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  sombraChao(ctx, 0, 150, 320, 0.5);
  ctx.fillStyle = '#6b7280'; ctx.fillRect(170, -230, 50, 260); ctx.fillStyle = '#ef4444'; ctx.fillRect(170, -210, 50, 16); ctx.fillRect(170, -170, 50, 16);
  for (let i = 0; i < 4; i++) { const ph = (t * 0.4 + i * 0.25) % 1; circle(ctx, 195 + ph * 80, -250 - ph * 150, 22 + ph * 40, '#cbd5e1', (1 - ph) * 0.4); }
  ctx.save(); papelSombra(ctx); ctx.fillStyle = '#9ca3af'; ctx.fillRect(-280, -60, 520, 210); ctx.restore();
  ctx.fillStyle = '#4b5563'; ctx.beginPath(); ctx.moveTo(-280, -60); for (let i = 0; i < 4; i++) { const x0 = -280 + i * 130; ctx.lineTo(x0, -130); ctx.lineTo(x0 + 130, -60); } ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#93c5fd'; for (let i = 0; i < 4; i++) { const x0 = -280 + i * 130; ctx.beginPath(); ctx.moveTo(x0 + 6, -118); ctx.lineTo(x0 + 6, -66); ctx.lineTo(x0 + 100, -66); ctx.closePath(); ctx.fill(); }
  for (let i = 0; i < 5; i++) fillRR(ctx, -250 + i * 100, -20, 60, 60, 4, '#fde68a');
  fillRR(ctx, -60, 60, 120, 90, 4, '#374151');
  ctx.restore();
}
function conteiner(ctx, x, y, s, cor = '#c2410c', o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  ctx.save(); papelSombra(ctx); ctx.fillStyle = cor; ctx.fillRect(-160, -60, 320, 120); ctx.restore();
  ctx.fillStyle = 'rgba(0,0,0,0.18)'; for (let xx = -150; xx < 160; xx += 18) ctx.fillRect(xx, -56, 7, 112);
  ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 4; ctx.strokeRect(-160, -60, 320, 120);
  ctx.fillStyle = '#e5e7eb'; for (const xx of [100, 124]) ctx.fillRect(xx, -50, 5, 100);
  if (o.label) text(ctx, o.label, -40, 0, { size: 30, weight: 900, color: 'rgba(255,255,255,0.85)', letter: 2 });
  ctx.restore();
}
function navio(ctx, x, y, s, t, o = {}) {
  ctx.save(); ctx.translate(x, y + Math.sin(t * 1.2) * 6); ctx.rotate(Math.sin(t * 0.9) * 0.012); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  const cores = ['#c2410c', '#1d4ed8', '#15803d', '#ca8a04', '#be123c', '#0e7490'];
  for (let r2 = 0; r2 < 2; r2++) for (let i = 0; i < 6; i++) { ctx.fillStyle = cores[(i + r2 * 2) % 6]; ctx.fillRect(-330 + i * 92, -110 - r2 * 46, 88, 42); ctx.fillStyle = 'rgba(0,0,0,0.2)'; for (let k = 0; k < 6; k++) ctx.fillRect(-326 + i * 92 + k * 14, -106 - r2 * 46, 5, 34); }
  ctx.fillStyle = '#e5e7eb'; ctx.fillRect(250, -190, 90, 130); ctx.fillStyle = '#1e293b'; for (let k = 0; k < 3; k++) ctx.fillRect(260 + k * 26, -170, 18, 14);
  ctx.save(); papelSombra(ctx); ctx.fillStyle = '#1e3a8a'; ctx.beginPath(); ctx.moveTo(-400, -60); ctx.lineTo(380, -60); ctx.lineTo(330, 40); ctx.lineTo(-370, 40); ctx.closePath(); ctx.fill(); ctx.restore();
  ctx.fillStyle = '#b91c1c'; ctx.beginPath(); ctx.moveTo(-382, 10); ctx.lineTo(352, 10); ctx.lineTo(330, 40); ctx.lineTo(-370, 40); ctx.closePath(); ctx.fill();
  ctx.restore();
  // ondas na frente
  ctx.save(); ctx.translate(x, y); ctx.globalAlpha *= o.a ?? 1; ctx.strokeStyle = 'rgba(147,197,253,0.7)'; ctx.lineWidth = 5;
  for (let row = 0; row < 3; row++) { ctx.beginPath(); for (let xx = -520; xx <= 520; xx += 10) { const yy = 40 * s + row * 22 + Math.sin(xx / 40 + t * 2 + row) * 6; xx === -520 ? ctx.moveTo(xx, yy) : ctx.lineTo(xx, yy); } ctx.stroke(); }
  ctx.restore();
}
function guindaste(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 14; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-120, 200); ctx.lineTo(-100, -260); ctx.moveTo(120, 200); ctx.lineTo(100, -260); ctx.moveTo(-100, -100); ctx.lineTo(100, -100); ctx.moveTo(-260, -260); ctx.lineTo(380, -260); ctx.stroke();
  ctx.lineWidth = 5; ctx.beginPath(); for (let xx = -240; xx < 380; xx += 40) { ctx.moveTo(xx, -260); ctx.lineTo(xx + 20, -300); ctx.lineTo(xx + 40, -260); } ctx.stroke();
  const cx = o.carro ?? 200, cy = o.cabo ?? 0;
  ctx.fillStyle = '#374151'; ctx.fillRect(cx - 30, -272, 60, 24);
  ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx - 14, -250); ctx.lineTo(cx - 14, -250 + cy); ctx.moveTo(cx + 14, -250); ctx.lineTo(cx + 14, -250 + cy); ctx.stroke();
  ctx.restore();
}
function galpao(ctx, x, y, s, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  sombraChao(ctx, 0, 170, 360, 0.5);
  ctx.save(); papelSombra(ctx); ctx.fillStyle = '#64748b'; ctx.beginPath(); ctx.moveTo(-320, 170); ctx.lineTo(-320, -60); ctx.quadraticCurveTo(0, -210, 320, -60); ctx.lineTo(320, 170); ctx.closePath(); ctx.fill(); ctx.restore();
  ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 3; for (let xx = -300; xx < 320; xx += 30) { ctx.beginPath(); ctx.moveTo(xx, 170); ctx.lineTo(xx, -60 - Math.cos((xx / 320) * 1.57) * 80); ctx.stroke(); }
  // porta aberta com as prateleiras de caixas
  ctx.fillStyle = '#1e293b'; ctx.fillRect(-170, -10, 340, 180);
  for (let r2 = 0; r2 < 3; r2++) { ctx.fillStyle = '#475569'; ctx.fillRect(-160, 40 + r2 * 50, 320, 6); for (let i = 0; i < 6; i++) fillRR(ctx, -150 + i * 52, 6 + r2 * 50, 44, 34, 3, i % 3 === 0 ? '#db2777' : '#b08a55'); }
  if (o.placa) { fillRR(ctx, -150, -110, 300, 56, 10, '#0b1222'); strokeRR(ctx, -150, -110, 300, 56, 10, P.aqui, 4); text(ctx, o.placa, 0, -81, { size: 28, weight: 900, color: '#ffffff', letter: 2 }); }
  ctx.restore();
}
function loja(ctx, x, y, s, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  sombraChao(ctx, 0, 190, 380, 0.5);
  ctx.save(); papelSombra(ctx); ctx.fillStyle = '#e7e5e4'; ctx.fillRect(-340, -170, 680, 360); ctx.restore();
  for (let i = 0; i < 10; i++) { ctx.fillStyle = i % 2 ? '#ffffff' : '#7c3aed'; ctx.beginPath(); ctx.moveTo(-340 + i * 68, -170); ctx.lineTo(-340 + (i + 1) * 68, -170); ctx.lineTo(-340 + (i + 1) * 68 + 8, -110); ctx.lineTo(-340 + i * 68 + 8, -110); ctx.closePath(); ctx.fill(); }
  for (let i = 0; i < 10; i++) { ctx.fillStyle = i % 2 ? '#ffffff' : '#7c3aed'; ctx.beginPath(); ctx.arc(-332 + i * 68 + 34, -110, 34, 0, Math.PI); ctx.fill(); }
  // vitrine com brinquedos
  ctx.fillStyle = '#bfdbfe'; ctx.fillRect(-310, -60, 360, 220); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.moveTo(-300, -50); ctx.lineTo(-220, -50); ctx.lineTo(-300, 40); ctx.closePath(); ctx.fill();
  for (let i = 0; i < 3; i++) { ctx.save(); ctx.translate(-250 + i * 120, 90); ctx.scale(0.2, 0.2); caixaBoneca(ctx, 0, 0, 1, t, { cor: ['#db2777', '#7c3aed', '#0891b2'][i], vest: ['#2563eb', '#f59e0b', '#16a34a'][i] }); ctx.restore(); }
  fillRR(ctx, 100, -60, 200, 250, 6, '#78350f'); circle(ctx, 270, 70, 8, '#facc15');
  if (o.placa !== false) { fillRR(ctx, -130, -240, 260, 56, 10, '#0b1222'); strokeRR(ctx, -130, -240, 260, 56, 10, P.aqui, 4); text(ctx, o.placa || 'LOJA', 0, -211, { size: 28, weight: 900, color: '#ffffff', letter: 3 }); }
  ctx.restore();
}
function caixaRegistradora(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.save(); papelSombra(ctx); fillRR(ctx, -130, -40, 260, 120, 12, '#334155'); ctx.restore();
  fillRR(ctx, -100, -130, 200, 90, 10, '#1e293b'); fillRR(ctx, -84, -118, 168, 54, 6, '#052e16');
  mono(ctx, o.visor || '100,00', 70, -91, 30, '#4ade80', 'right', 900);
  for (let r2 = 0; r2 < 2; r2++) for (let i = 0; i < 5; i++) fillRR(ctx, -110 + i * 46, -20 + r2 * 40, 36, 28, 5, '#cbd5e1');
  fillRR(ctx, -150, 80, 300, 30, 6, '#1f2937');
  ctx.restore();
}
// prédio de governo genérico (frontão e colunas) com a faixa do nome
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

// ================================================================ documentos e objetos de apoio
// a lista do instituto (só as duas linhas que o vídeo cita têm número; as outras são textura, sem valor)
function listaIBPT(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.02); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  drawDoc(ctx, 'lista' + (o.key || ''), 760, 900, (ctx) => {
    const Wd = 760, Hd = 900, L = -Wd / 2, T = -Hd / 2;
    ctx.save(); papelSombra(ctx); ctx.fillStyle = '#ffffff'; ctx.fillRect(L, T, Wd, Hd); ctx.restore();
    ctx.fillStyle = '#0f172a'; ctx.fillRect(L, T, Wd, 120);
    text(ctx, 'CARGA TRIBUTÁRIA', L + 40, T + 46, { size: 34, weight: 900, color: '#ffffff', align: 'left', letter: 2 });
    text(ctx, 'presentes de Dia das Crianças · estimativa', L + 40, T + 88, { size: 22, weight: 700, color: '#cbd5e1', align: 'left' });
    text(ctx, 'IBPT', -L - 40, T + 62, { size: 34, weight: 900, color: '#fde68a', align: 'right', letter: 3 });
    text(ctx, 'PRODUTO', L + 40, T + 160, { size: 18, weight: 900, color: '#6b7280', align: 'left' }); text(ctx, '% DE TRIBUTOS', -L - 40, T + 160, { size: 18, weight: 900, color: '#6b7280', align: 'right' });
    const r = rng(8);
    for (let i = 0; i < 12; i++) {
      const yy = T + 210 + i * 56; ctx.fillStyle = i % 2 ? '#ffffff' : '#f8fafc'; ctx.fillRect(L + 20, yy - 26, Wd - 40, 52);
      if (i === 0) { text(ctx, 'Videogame', L + 40, yy, { size: 30, weight: 900, color: P.ink, align: 'left' }); mono(ctx, '72,18%', -L - 40, yy, 30, '#b91c1c', 'right', 900); }
      else if (i === 8) { text(ctx, 'Brinquedos', L + 40, yy, { size: 30, weight: 900, color: P.ink, align: 'left' }); mono(ctx, '39,70%', -L - 40, yy, 30, '#b45309', 'right', 900); }
      else { fillRR(ctx, L + 40, yy - 9, 160 + r() * 200, 18, 9, '#e5e7eb'); fillRR(ctx, -L - 150, yy - 9, 110, 18, 9, '#e5e7eb'); }
    }
    marker(ctx, L + 30, T + 210 - 24, Wd - 60, 46, '#fde047', o.mTopo || 0);
    marker(ctx, L + 30, T + 210 + 8 * 56 - 24, Wd - 60, 46, '#fdba74', o.mBaixo || 0);
  });
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
function lupa(ctx, x, y, s, rot = 0.6) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.save(); ctx.globalAlpha *= 0.18; circle(ctx, 0, 0, 80, '#bae6fd'); ctx.restore();
  ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(0, 0, 80, 0, 6.283); ctx.stroke();
  fillRR(ctx, 86, -14, 140, 28, 12, '#7c2d12');
  ctx.restore();
}
function lanterna(ctx, x, y, ang, k, alvo) { // facho de luz numa área escura
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(k);
  ctx.fillStyle = 'rgba(5,5,12,0.55)'; ctx.fillRect(x - 4000, y - 3000, 8000, 6000);
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(alvo[0], alvo[1], 0, alvo[0], alvo[1], alvo[2]); g.addColorStop(0, 'rgba(254,243,199,0.35)'); g.addColorStop(1, 'rgba(254,243,199,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(alvo[0] + Math.cos(ang + 1.57) * alvo[2], alvo[1] + Math.sin(ang + 1.57) * alvo[2]); ctx.lineTo(alvo[0] - Math.cos(ang + 1.57) * alvo[2], alvo[1] - Math.sin(ang + 1.57) * alvo[2]); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.arc(alvo[0], alvo[1], alvo[2], 0, 6.283); ctx.fill();
  ctx.restore();
}
function sopa(ctx, x, y, s, t, letras = [], o = {}) { // tigela de sopa de letrinhas
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (let i = 0; i < 3; i++) { const ph = (t * 0.5 + i * 0.33) % 1; ctx.strokeStyle = `rgba(226,232,240,${(1 - ph) * 0.35})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-60 + i * 60, -60 - ph * 120); ctx.quadraticCurveTo(-40 + i * 60, -90 - ph * 120, -60 + i * 60, -120 - ph * 120); ctx.stroke(); }
  ctx.fillStyle = '#e5e7eb'; ctx.beginPath(); ctx.ellipse(0, 0, 230, 60, 0, 0, 6.283); ctx.fill();
  ctx.fillStyle = '#ea580c'; ctx.beginPath(); ctx.ellipse(0, 2, 200, 48, 0, 0, 6.283); ctx.fill();
  const r = rng(3); for (let row = 0; row < 2; row++) for (let col = 0; col < 8; col++) text(ctx, 'ABCDEFGHIJLMNOPRSTUV'[Math.floor(r() * 20)], -150 + col * 43 + row * 18, row ? 18 : -16, { size: 20, weight: 900, color: '#fde68a' });
  ctx.save(); papelSombra(ctx); ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.moveTo(-230, 0); ctx.quadraticCurveTo(-220, 170, 0, 180); ctx.quadraticCurveTo(220, 170, 230, 0); ctx.quadraticCurveTo(0, 70, -230, 0); ctx.fill(); ctx.restore();
  ctx.restore();
}
function holerite(ctx, x, y, s, o = {}) { // contracheque pequeno do vendedor
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || -0.04); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  ctx.save(); papelSombra(ctx); ctx.fillStyle = '#ffffff'; ctx.fillRect(-170, -120, 340, 240); ctx.restore();
  text(ctx, 'HOLERITE · VENDEDOR', -150, -90, { size: 20, weight: 900, color: P.ink, align: 'left' });
  for (let i = 0; i < 5; i++) { fillRR(ctx, -150, -50 + i * 34, 140, 12, 6, '#e5e7eb'); fillRR(ctx, 70, -50 + i * 34, 80, 12, 6, '#e5e7eb'); }
  marker(ctx, -158, 52, 316, 30, '#fdba74', o.m || 0); text(ctx, 'encargos sobre o salário', -150, 67, { size: 18, weight: 900, color: '#9a3412', align: 'left', alpha: clamp((o.m || 0) * 2) });
  ctx.restore();
}
function moedaLaranja(ctx, x, y, r, a = 1) { ctx.save(); ctx.globalAlpha *= a; circle(ctx, x, y, r, P.icms); circle(ctx, x, y, r * 0.75, '#fbbf24'); text(ctx, 'R$', x, y + 1, { size: r * 0.7, weight: 900, color: '#7c2d12' }); ctx.restore(); }
function cilindroTeste(ctx, x, y, s, t, o = {}) { // cilindro de medir peça pequena (topo inclinado) com uma pecinha caindo
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const kd = clamp(o.cai || 0), py = lerp(-260, 40, ease.in(kd));
  if (kd > 0) { ctx.save(); ctx.translate(0, py); ctx.rotate(kd * 2); fillRR(ctx, -22, -22, 44, 44, 8, '#f472b6'); circle(ctx, 0, 0, 8, '#be185d'); ctx.restore(); }
  ctx.fillStyle = 'rgba(186,230,253,0.25)'; ctx.beginPath(); ctx.moveTo(-60, -40); ctx.lineTo(60, -80); ctx.lineTo(60, 120); ctx.lineTo(-60, 120); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(226,232,240,0.9)'; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = '#334155'; ctx.fillRect(-80, 120, 160, 20);
  ctx.restore();
}
function banca(ctx, x, y, s, t, o = {}) { // banca de rua com lona
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  sombraChao(ctx, 0, 200, 380, 0.5);
  ctx.strokeStyle = '#9ca3af'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(-330, 200); ctx.lineTo(-330, -230); ctx.moveTo(330, 200); ctx.lineTo(330, -230); ctx.stroke();
  ctx.fillStyle = '#1d4ed8'; ctx.beginPath(); ctx.moveTo(-370, -230); ctx.lineTo(370, -230); ctx.lineTo(340, -150 + Math.sin(t * 2) * 6); ctx.lineTo(-340, -150 + Math.sin(t * 2 + 1) * 6); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.15)'; for (let i = -340; i < 340; i += 80) ctx.fillRect(i, -230, 30, 80);
  fillRR(ctx, -350, 40, 700, 30, 4, '#78350f'); ctx.fillStyle = '#57534e'; ctx.fillRect(-320, 70, 14, 130); ctx.fillRect(306, 70, 14, 130);
  ctx.restore();
}
function celular(ctx, x, y, s, fn, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  ctx.save(); papelSombra(ctx); fillRR(ctx, -190, -380, 380, 760, 48, '#0f172a'); ctx.restore();
  fillRR(ctx, -170, -350, 340, 700, 30, '#f8fafc'); fillRR(ctx, -50, -366, 100, 12, 6, '#1e293b');
  ctx.save(); rr(ctx, -170, -350, 340, 700, 30); ctx.clip(); fn(ctx); ctx.restore();
  ctx.restore();
}
function chocalho(ctx, x, y, s, t) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 6) * 0.15 - 0.4); ctx.scale(s, s);
  fillRR(ctx, -16, 0, 32, 160, 14, '#f472b6'); circle(ctx, 0, 170, 26, '#f472b6');
  circle(ctx, 0, -60, 80, '#fde68a'); circle(ctx, 0, -60, 64, '#fef9c3');
  for (let i = 0; i < 5; i++) circle(ctx, Math.cos(i * 1.3 + t * 3) * 34, -60 + Math.sin(i * 1.3 + t * 3) * 30, 9, ['#ef4444', '#38bdf8', '#22c55e', '#a855f7', '#f59e0b'][i]);
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
// pórtico de pedágio sem cancela sobre a estrada à noite
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
// etiqueta de presente da inscrição (PARA: VOCÊ / INSCREVA-SE; vira INSCRITO)
function tagPresente(ctx, x, y, s, t, virado, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 1.4) * 0.05 + (o.rot || 0));
  const sx = Math.cos(Math.PI * clamp(virado)); ctx.scale(s * Math.max(0.02, Math.abs(sx)), s);
  ctx.strokeStyle = P.gold; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-260, 0); ctx.lineTo(-330, -40); ctx.stroke();
  ctx.save(); papelSombra(ctx); ctx.fillStyle = sx >= 0 ? '#fffbeb' : '#dcfce7';
  ctx.beginPath(); ctx.moveTo(-200, -120); ctx.lineTo(-260, 0); ctx.lineTo(-200, 120); ctx.lineTo(260, 120); ctx.lineTo(260, -120); ctx.closePath(); ctx.fill(); ctx.restore();
  circle(ctx, -215, 0, 14, '#7c2d12');
  if (sx >= 0) {
    text(ctx, 'PARA: VOCÊ', 30, -54, { size: 36, weight: 900, color: '#6b7280', letter: 2 });
    fillRR(ctx, -150, -6, 360, 90, 45, '#dc2626'); text(ctx, 'INSCREVA-SE', 30, 40, { size: 44, weight: 900, color: '#ffffff', letter: 2 });
  } else {
    ctx.save(); ctx.scale(-1, 1);
    text(ctx, 'OBRIGADO!', -30, -54, { size: 36, weight: 900, color: '#166534', letter: 2 });
    fillRR(ctx, -210, -6, 360, 90, 45, '#16a34a'); text(ctx, 'INSCRITO', -30, 40, { size: 48, weight: 900, color: '#ffffff', letter: 3 });
    ctx.restore();
  }
  ctx.restore();
}
// a planificação de papelão da caixa da boneca (transição): molde em cruz com as dobras marcadas
function molde(ctx, cx, cy, s, abre, o = {}) {
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  const f = 300, d = 160, k = ease.inOut(clamp(abre));
  const kraft = '#c8a26b', dob = 'rgba(90,60,20,0.55)';
  const face = (x, y, w, h) => { ctx.fillStyle = kraft; ctx.fillRect(x, y, w, h); ctx.strokeStyle = dob; ctx.setLineDash([14, 10]); ctx.lineWidth = 4; ctx.strokeRect(x, y, w, h); ctx.setLineDash([]); };
  face(-f / 2, -f / 2, f, f);
  face(-f / 2, -f / 2 - d * k, f, d * k); face(-f / 2, f / 2, f, d * k);
  face(-f / 2 - d * k, -f / 2, d * k, f); face(f / 2, -f / 2, d * k, f);
  if (k > 0.6) { const k2 = (k - 0.6) / 0.4; face(-f / 2, -f / 2 - d - f * k2, f, f * k2); face(f / 2 + d, -f / 2, d * k2 * 0.6, f); face(-f / 2 - d - d * k2 * 0.6, -f / 2, d * k2 * 0.6, f); }
  ctx.fillStyle = 'rgba(90,60,20,0.25)'; const r = rng(9); for (let i = 0; i < 40; i++) ctx.fillRect((r() - 0.5) * f, (r() - 0.5) * f, 2 + r() * 30, 2);
  if (o.texto) text(ctx, o.texto, 0, 0, { size: 40, weight: 900, color: 'rgba(90,60,20,0.75)', letter: 4 });
  ctx.restore();
}
// contador de preço girando (o palpite): dígitos rolando até parar
function contador(ctx, x, y, s, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.save(); papelSombra(ctx); fillRR(ctx, -240, -70, 480, 140, 20, '#0b1222'); ctx.restore(); strokeRR(ctx, -240, -70, 480, 140, 20, o.cor || P.fab, 4);
  let str;
  str = o.para || 'R$ ??,??';
  const jit = o.para ? 0 : Math.sin(t * 40) * 3;
  ctx.font = MONO(78, 900); ctx.fillStyle = o.para ? '#ffffff' : 'rgba(255,255,255,0.8)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(str, 0, 4 + jit);
  if (!o.para) { ctx.fillStyle = 'rgba(11,18,34,0.5)'; ctx.fillRect(-230, -60, 460, 26); ctx.fillRect(-230, 34, 460, 26); }
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

// ================================================================ peças comuns das cenas
const B1 = V.fab, B2 = B1 + V.imp, B3 = B2 + V.ipi, B4 = B3 + V.pis, B5 = B4 + V.icms; // fronteiras na fita (reais)
// camadas da caixa (vista explodida): três cascas que sobem da caixa; `dest` = qual casca acende (0..2)
function camadas(ctx, x, y, s, k, o = {}) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (let i = 2; i >= 0; i--) {
    const kk = ease.out(clamp(k * 1.4 - i * 0.2)), w = 420 + i * 70, h = 300 + i * 50, dy = -kk * (90 + i * 95);
    ctx.save(); ctx.globalAlpha *= clamp(kk * 1.5) * 0.9; ctx.translate(0, dy);
    const on = o.dest === i ? clamp(o.destK ?? 1) : 0, cor = o.cor || P.voce;
    fillRR(ctx, -w / 2, -h / 2, w, h, 18, on > 0 ? hexA(cor, 0.12 + 0.18 * on * (0.6 + 0.4 * Math.sin(o.t * 6))) : 'rgba(255,255,255,0.05)');
    ctx.save(); if (on > 0) { ctx.shadowColor = cor; ctx.shadowBlur = 30 * on; } strokeRR(ctx, -w / 2, -h / 2, w, h, 18, on > 0 ? cor : 'rgba(226,232,240,0.55)', on > 0 ? 6 : 3); ctx.restore();
    ctx.restore();
  }
  ctx.restore();
}
// a lâmpada (custo de luz da loja)
function lampada(ctx, x, y, s, k = 1) { if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s * lerp(0.6, 1, ease.back(clamp(k))), s * lerp(0.6, 1, ease.back(clamp(k)))); ctx.globalAlpha *= clamp(k * 2); const g = ctx.createRadialGradient(0, -20, 0, 0, -20, 90); g.addColorStop(0, 'rgba(254,240,138,0.6)'); g.addColorStop(1, 'rgba(254,240,138,0)'); ctx.fillStyle = g; ctx.fillRect(-90, -110, 180, 180); circle(ctx, 0, -20, 46, '#fef08a'); ctx.fillStyle = '#94a3b8'; ctx.fillRect(-22, 22, 44, 36); ctx.restore(); }
function chave(ctx, x, y, s, k = 1) { if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(-0.5); ctx.scale(s, s); ctx.globalAlpha *= clamp(k * 2); ctx.strokeStyle = '#facc15'; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(-60, 0, 30, 0, 6.283); ctx.stroke(); ctx.fillStyle = '#facc15'; ctx.fillRect(-30, -8, 110, 16); ctx.fillRect(50, 8, 12, 24); ctx.fillRect(70, 8, 10, 18); ctx.restore(); }
const etqX = (ctx, x, y, s, k) => xMark(ctx, x, y, s, '#ef4444', k);

// ================================================================ Cena 01: gancho (a caixa e o "até 70%?" já na tela; a conta da fita; o pedaço escuro e a camada que fica para o fim)
function scene01(K) {
  const tAte = K('até setenta por cento'), tPega = K('Pega essa caixa'), tDentro = K('Dentro dela'), tEtq = K('Na etiqueta, cem reais'), tConta = K('Faz a conta comigo');
  const tSe = K('se a frase fosse verdade'), tSob = K('sobrariam trinta reais'), tFab = K('para fabricar essa boneca'), tNav = K('atravessar meio mundo'), tLoja = K('e ainda pagar a loja'), tSera = K('Será que é isso mesmo');
  const tNessa = K('Nessa caixa tem um pedaço'), tOlha = K('quase ninguém olha'), tCam = K('e uma camada que você'), tLei = K('dentro da lei'), tFim = K('Essa fica para o fim');
  const tHoje = K('Hoje a gente abre a caixa'), tCamada = K('camada por camada'), tCada = K('quem fica com cada real');
  const cam = [
    { t: 0, x: 960, y: 470, z: 1.0, dz: 0.006 }, { t: tPega, x: 1150, y: 560, z: 1.14, d: 1.6 }, { t: tEtq, x: 1260, y: 540, z: 1.18, d: 1.2 },
    { t: tConta - 0.3, x: 2400, y: 470, z: 1.0, d: 1.4, dx: 3 }, { t: tSob, x: 2620, y: 470, z: 1.08, d: 1.4 }, { t: tSera, x: 2420, y: 470, z: 1.02, d: 1.2 },
    { t: tNessa - 0.3, x: 3800, y: 480, z: 1.0, d: 1.4 }, { t: tOlha, x: 3700, y: 560, z: 1.12, d: 1.4 }, { t: tCam, x: 3800, y: 440, z: 1.0, d: 1.4 }, { t: tFim, x: 3800, y: 470, z: 1.05, d: 1.4 },
    { t: tHoje - 0.3, x: 5200, y: 480, z: 1.0, d: 1.4 }, { t: tCada, x: 5200, y: 460, z: 1.06, d: 2.4, dz: 0.004 },
  ];
  const sfx = [[0.05, 'paper', 0.3], [tAte, 'hit', 0.35], [tPega, 'whoosh', 0.3], [tDentro, 'papelao', 0.35, { dur: 0.6 }], [tEtq, 'paper', 0.35], [tEtq + 0.3, 'cash', 0.35],
    [tConta - 0.2, 'whoosh', 0.3], [tSe, 'tesoura', 0.45], [tSob, 'ding', 0.3], [tFab, 'pop', 0.3], [tNav, 'pop', 0.3], [tLoja, 'pop', 0.3], [tSera, 'stamp', 0.45],
    [tNessa - 0.2, 'whoosh', 0.3], [tOlha, 'switch', 0.35], [tCam, 'riser', 0.25], [tLei, 'ding', 0.35], [tFim, 'tick', 0.3],
    [tHoje - 0.2, 'whoosh', 0.3], [tHoje + 0.3, 'papelao', 0.45, { dur: 0.9 }], [tCamada, 'sparkle', 0.3], [tCada, 'coin', 0.45]];
  return {
    accent: P.gold, cam, sfx, impacts: [tAte, tSera], trans: 'cut',
    draw(ctx, t, cam2) {
      salaFundo(ctx, cam2, 0.95);
      zone(ctx, cam2, 900, 1300, () => {
        if (t > tConta + 1.2) return;
        arvore(ctx, 470, 500, 0.78, t);
        presente(ctx, 1150, 650, 1.0, t, { etq: 'R$ 100,00', janela: appear(t, tDentro, 0.8), tampa: 0.12 * appear(t, tDentro, 0.6), balanco: Math.sin(Math.PI * prog(t, tEtq, 1.2)) * 0.25 });
        // abre já com a pergunta escrita (funciona sem som)
        const k70 = appear(t, 0.1, 0.4), pop = Math.sin(Math.PI * prog(t, tAte, 0.5)) * 0.12;
        if (k70 > 0) { ctx.save(); ctx.translate(1400, 200); ctx.scale(1 + pop, 1 + pop); headline(ctx, 'até 70%?', 0, 0, { size: 120, k: k70, color: '#fecaca', color2: '#f87171', noPop: true }); ctx.restore(); }
        text(ctx, 'do preço do brinquedo é imposto?', 1400, 300, { size: 34, weight: 900, color: '#e2e8f0', alpha: appear(t, tAte + 0.3, 0.4) });
        chip(ctx, 820, 120, 'a frase de todo Natal', '#fde68a', vis(t, 0.6, tPega, 0.4, 0.4), { size: 26 });
        if (t > tEtq) penCircle(ctx, 1475, 655, 150, 70, '#fde047', prog(t, tEtq + 0.2, 0.6), 6);
      });
      zone(ctx, cam2, 2300, 2700, () => {
        if (t < tConta - 0.8 || t > tNessa + 0.6) return;
        const k = vis(t, tConta - 0.3, tNessa, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        headline(ctx, 'faz a conta comigo', 2400, 150, { size: 62, k: appear(t, tConta, 0.5), hl: '#854d0e' });
        const x0 = 1700, w = 1400, y = 470, ks = appear(t, tSe, 0.5), kb = appear(t, tSob, 0.5);
        fita(ctx, x0, y, w, [{ a: 0, b: 70, cor: '#ef4444', k: ks * 0.85, gapB: ks }, { a: 70, b: 100, brilho: kb * (0.6 + 0.4 * Math.sin(t * 5)), gapA: ks }], { marcas: 1, numeros: true, h: 60 });
        text(ctx, 'R$ 100', x0 + w / 2, y - 70, { size: 34, weight: 900, color: '#fde68a', alpha: 1 - ks });
        if (ks > 0) { tesoura(ctx, fitaX(x0, w, 70), y - 10, 0.7, 0.5 + 0.5 * Math.sin(prog(t, tSe, 0.4) * Math.PI * 2), -1.57); }
        rotuloFita(ctx, fitaX(x0, w, 35), y + 120, 'R$ 70', 'imposto, segundo a frase', '#fca5a5', ks, { size: 76, sub: 26 });
        rotuloFita(ctx, fitaX(x0, w, 85), y + 120, 'R$ 30', 'para todo o resto', '#fde68a', kb, { size: 76, sub: 26 });
        // fábrica, navio e loja tentando caber nos R$ 30
        const xs = fitaX(x0, w, 85);
        [[tFab, (c, kk) => fabrica(c, xs - 120, 330, 0.42, t, { a: kk })], [tNav, (c, kk) => navio(c, xs + 20, 350, 0.34, t, { a: kk })], [tLoja, (c, kk) => loja(c, xs + 160, 330, 0.3, t, { a: kk, placa: false })]].forEach(([tt, fn]) => {
          const kk = appear(t, tt, 0.5); if (kk <= 0) return; ctx.save(); ctx.translate(0, (1 - ease.out(kk)) * -120); fn(ctx, clamp(kk * 2)); ctx.restore();
        });
        text(ctx, 'fábrica', xs - 120, 420, { size: 22, weight: 900, color: '#bbf7d0', alpha: appear(t, tFab + 0.2, 0.4) });
        text(ctx, 'navio', xs + 20, 420, { size: 22, weight: 900, color: '#bfdbfe', alpha: appear(t, tNav + 0.2, 0.4) });
        text(ctx, 'loja', xs + 170, 420, { size: 22, weight: 900, color: '#e9d5ff', alpha: appear(t, tLoja + 0.2, 0.4) });
        const kq = appear(t, tSera, 0.5);
        if (kq > 0) { ctx.save(); ctx.translate(2400, 300); ctx.rotate(Math.sin(t * 3) * 0.05); headline(ctx, '?', 0, 0, { size: 260, k: kq, color: '#fde68a' }); ctx.restore(); }
        ctx.restore();
      });
      zone(ctx, cam2, 3700, 3900, () => {
        if (t < tNessa - 0.8 || t > tHoje + 0.6) return;
        const k = vis(t, tNessa - 0.3, tHoje, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        const kc = vis(t, tCam, tFim + 1.2, 0.6, 0.8);
        presente(ctx, 3800, 660, 0.95, t, { tampa: 0.35 + 0.65 * kc, etq: 'R$ 100,00' });
        camadas(ctx, 3800, 640, 0.95, kc, { dest: 1, destK: appear(t, tCam + 0.8, 0.5), t, cor: P.voce });
        const kl = vis(t, tOlha - 0.2, tCam, 0.5, 0.5);
        lanterna(ctx, 3300, 150, 0.9, kl, [4010, 700, 150]);
        chip(ctx, 3800, 140, 'um pedaço grande que quase ninguém olha', '#fde68a', vis(t, tOlha, tCam, 0.4, 0.4), { size: 30 });
        chip(ctx, 3800, 140, 'uma camada você pode tirar sozinho', P.voce, vis(t, tCam + 0.6, tFim, 0.4, 0.4), { size: 30 });
        if (t > tLei) { chip(ctx, 4300, 300, 'dentro da lei', P.voce, vis(t, tLei, tHoje, 0.4, 0.4), { size: 28 }); check(ctx, 4430, 300, 0.6, P.voce, prog(t, tLei + 0.2, 0.4) * (1 - prog(t, tHoje, 0.4))); }
        chip(ctx, 3800, 140, 'essa fica para o fim', '#e2e8f0', vis(t, tFim, tHoje + 1, 0.4, 0.4), { size: 30 });
        ctx.restore();
      });
      zone(ctx, cam2, 5100, 5300, () => {
        if (t < tHoje - 0.8) return;
        const k = appear(t, tHoje - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        arvore(ctx, 4700, 520, 0.7, t);
        const ka = appear(t, tHoje + 0.3, 1.0);
        presente(ctx, 5300, 670, 0.95, t, { tampa: ka, janela: ka, etq: 'R$ 100,00' });
        camadas(ctx, 5300, 650, 0.95, appear(t, tCamada, 1.2), { t });
        headline(ctx, 'quem fica com cada real?', 5200, 130, { size: 64, k: appear(t, tCada, 0.5), hl: '#854d0e' });
        ctx.restore();
      });
      bokeh(ctx, cam2, t, 3, 10);
    },
    overlay(ctx, t) {},
  };
}

// ================================================================ Cena 02: a lista (o 72% é do videogame; "guarda esse número"); o trenzinho sai em viagem
function scene02(K) {
  const tPrim = K('Primeiro, de onde saiu'), tLista = K('Ela vem de uma lista'), tIbpt = K('o IBPT'), tDia = K('perto do Dia das Crianças'), tTopo = K('Lá no topo');
  const t72 = K('setenta e dois por cento'), tNao = K('não está a boneca'), tVideo = K('Está o videogame'), tComum = K('O brinquedo comum'), t40 = K('com uns quarenta'), tGuarda = K('Guarda esse número');
  const tQuis = K('A gente quis ver'), tRefez = K('então refez a conta'), tSeg = K('seguindo a boneca'), tViagem = K('começo da viagem');
  const cam = [
    { t: 0, x: 960, y: 480, z: 1.0, dx: 3 }, { t: tLista, x: 1000, y: 470, z: 1.02, d: 1.4 }, { t: tTopo, x: 1150, y: 370, z: 1.14, d: 1.6 },
    { t: tComum, x: 1150, y: 600, z: 1.12, d: 1.6 }, { t: tGuarda + 0.6, x: 1050, y: 520, z: 1.02, d: 1.4 },
    { t: tQuis - 0.3, x: 2440, y: 500, z: 1.04, d: 1.4, dx: 3 }, { t: tSeg, x: 2300, y: 540, z: 1.1, d: 1.6, dx: 8 },
  ];
  const sfx = [[tPrim, 'pop', 0.3], [tLista, 'paper', 0.45, { dur: 0.6 }], [tIbpt, 'tick', 0.3], [tDia, 'pop', 0.25], [tTopo, 'whoosh', 0.3], [t72, 'pop', 0.35], [tNao, 'buzz', 0.25],
    [tVideo, 'hit', 0.35], [tComum, 'whoosh', 0.3], [t40, 'pop', 0.35], [tGuarda, 'riser', 0.25], [tGuarda + 0.9, 'clink', 0.35],
    [tQuis - 0.2, 'whoosh', 0.3], [tRefez, 'pop', 0.3], [tRefez + 0.5, 'pop', 0.25], [tRefez + 1.0, 'pop', 0.25], [tSeg, 'apito', 0.45, { dur: 0.6 }], [tSeg + 0.6, 'trem', 0.35, { dur: 3 }]];
  return {
    accent: P.lista, cam, sfx, impacts: [tVideo], trans: 'push',
    draw(ctx, t, cam2) {
      salaFundo(ctx, cam2, 0.95);
      zone(ctx, cam2, 900, 1200, () => {
        if (t > tQuis + 0.6) return;
        const k = vis(t, 0, tQuis, 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        arvore(ctx, 330, 520, 0.72, t);
        headline(ctx, 'de onde saiu a frase?', 1000, 110, { size: 60, k: vis(t, tPrim, tLista + 0.1, 0.5, 0.4), hl: '#334155' });
        const kl = appear(t, tLista, 0.7);
        if (kl > 0) { ctx.save(); ctx.translate(0, (1 - ease.out(kl)) * -500); listaIBPT(ctx, 1050, 470, 0.8, { a: clamp(kl * 2), mTopo: prog(t, t72, 0.6), mBaixo: prog(t, t40, 0.6) }); ctx.restore(); }
        chip(ctx, 1600, 200, 'IBPT · instituto de estudos de impostos', '#e2e8f0', vis(t, tIbpt, tTopo, 0.4, 0.4), { size: 24 });
        chip(ctx, 1600, 260, 'sai perto do Dia das Crianças', '#fde68a', vis(t, tDia, tTopo, 0.4, 0.4), { size: 24 });
        // no topo: a boneca não está; está o videogame
        const kn = vis(t, tNao, tVideo + 0.4, 0.4, 0.3);
        if (kn > 0) { ctx.save(); ctx.globalAlpha *= kn; boneca(ctx, 1620, 310, 0.62, t); etqX(ctx, 1620, 300, 1.8, prog(t, tNao + 0.4, 0.4)); ctx.restore(); }
        const kv = vis(t, tVideo, tComum + 1, 0.5, 0.4);
        if (kv > 0) { ctx.save(); ctx.globalAlpha *= kv; const gg = ctx.createRadialGradient(1660, 280, 0, 1660, 280, 260); gg.addColorStop(0, 'rgba(56,189,248,0.35)'); gg.addColorStop(1, 'rgba(56,189,248,0)'); ctx.fillStyle = gg; ctx.fillRect(1400, 20, 520, 520); ctx.restore(); console_(ctx, 1640, 230, 0.85 * lerp(1.3, 1, ease.out(clamp(kv))), { a: clamp(kv * 2) }); chip(ctx, 1640, 420, 'videogame: 72,18%', '#fca5a5', kv, { size: 28 }); }
        // embaixo: o brinquedo comum
        const kb = appear(t, tComum + 0.6, 0.5);
        if (kb > 0) { ctx.save(); ctx.globalAlpha *= kb * (1 - appear(t, tQuis - 0.4, 0.4)); boneca(ctx, 1620, 600, 0.42, t); ctx.restore(); }
        chip(ctx, 1620, 760, 'brinquedos: 39,70%', '#fdba74', vis(t, t40, tGuarda + 0.6, 0.4, 0.3), { size: 28 });
        ctx.restore();
      });
      zone(ctx, cam2, 2200, 2600, () => {
        if (t < tQuis - 0.8) return;
        const k = appear(t, tQuis - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        arvore(ctx, 3230, 470, 0.5, t);
        trilho(ctx, 1550, 3350, 760);
        [['FÁBRICA', 1800, P.fab], ['PORTO', 2120, P.sky], ['IMPORTADOR', 2440, P.aqui], ['LOJA', 2760, P.aqui], ['ÁRVORE', 3080, P.gold]].forEach(([lb, x, cor], i) => plaquinha(ctx, x, 660, lb, cor, appear(t, tQuis + 0.3 + i * 0.4, 0.5)));
        const kt = appear(t, tRefez, 0.5), xt = 1700 + 260 * ease.inOut(prog(t, tSeg, 6));
        trem(ctx, xt, 742, 0.9, t, { a: clamp(kt * 2), giro: (xt - 1700) / 25 });
        headline(ctx, 'a conta de novo, com os impostos de hoje', 2400, 150, { size: 50, k: appear(t, tRefez, 0.5), hl: '#14532d' });
        chip(ctx, 2400, 260, 'seguindo a boneca desde o começo da viagem', '#bbf7d0', appear(t, tSeg, 0.4), { size: 26 });
        ctx.restore();
      });
      bokeh(ctx, cam2, t, 5, 10);
    },
    overlay(ctx, t, cam2) {
      source(ctx, 'IBPT (carga tributária dos produtos)', vis(t, tLista, tQuis, 0.5, 0.4));
      // "guarda esse número": o 39,70% sai da lista e vai para o canto
      const kg = appear(t, tGuarda + 0.3, 0.9);
      if (kg > 0) {
        const sx = (1620 - cam2.x) * cam2.z + 960, sy = (760 - cam2.y) * cam2.z + 540, p = ease.inOut(kg);
        chip(ctx, lerp(sx, 190, p), lerp(sy, 70, p), 'lista: 39,70%', '#fdba74', 1, { size: lerp(28, 22, p) });
      }
    },
  };
}
// o 39,70% guardado no canto (cenas 3 a 5 e começo da 6)
function cantoLista(ctx, a = 1) { chip(ctx, 190, 70, 'lista: 39,70%', '#fdba74', a, { size: 22 }); }

// ================================================================ Cena 03: o palpite, a fábrica, o navio, os R$ 20 do exemplo e o imposto de importação
function scene03(K) {
  const tAntes = K('Antes, um palpite'), tQuanto = K('Quanto você acha que fica'), tPensa = K('Pensa num número'), tImp = K('A boneca é importada'), tMaioria = K('como a maioria');
  const tSai = K('Sai de uma fábrica na China'), tCont = K('entra num contêiner'), tMes = K('passa mais de um mês no mar'), tCada = K('Cada boneca tem a sua conta'), tEx = K('No nosso exemplo');
  const t20 = K('ficam com uns vinte reais'), tQuinto = K('Um quinto da etiqueta'), tPorto = K('Quando o contêiner chega ao porto'), tCulpa = K('aparece o imposto que todo mundo culpa'), tDeImp = K('o de importação');
  const tSoQ = K('Só que ele é cobrado'), tVinte = K('em cima desses vinte'), tNaoCem = K('e não dos cem'), tAlta = K('por mais alta que a alíquota'), t4 = K('ele leva só uns quatro reais'), tVilao = K('O vilão de sempre'), tMenores = K('uma das menores fatias');
  const cam = [
    { t: 0, x: 960, y: 470, z: 1.0, dz: 0.006 }, { t: tQuanto, x: 960, y: 430, z: 1.08, d: 1.4 }, { t: tImp, x: 960, y: 520, z: 1.0, d: 1.4 },
    { t: tSai - 0.3, x: 2200, y: 480, z: 1.04, d: 1.4, dx: 10 }, { t: tMes, x: 2600, y: 470, z: 1.06, d: 1.6 },
    { t: tCada - 0.3, x: 3800, y: 470, z: 1.0, d: 1.4 }, { t: t20, x: 3700, y: 520, z: 1.08, d: 1.4 },
    { t: tPorto - 0.3, x: 5100, y: 470, z: 1.0, d: 1.4 }, { t: tDeImp, x: 5250, y: 420, z: 1.1, d: 1.0 }, { t: tSoQ, x: 5200, y: 520, z: 1.02, d: 1.4 }, { t: t4, x: 5050, y: 600, z: 1.1, d: 1.2 }, { t: tVilao, x: 5200, y: 520, z: 1.04, d: 1.6 },
  ];
  const sfx = [[tAntes, 'pop', 0.3], [tQuanto, 'tick', 0.3], [tQuanto + 0.3, 'contadora', 0.25, { dur: 4 }], [tPensa, 'clock', 0.3], [tImp, 'pop', 0.3], [tMaioria, 'pop', 0.25],
    [tSai - 0.2, 'whoosh', 0.3], [tSai + 0.4, 'apito', 0.35], [tCont, 'clank', 0.26], [tMes, 'horn', 0.35], [tMes + 0.6, 'flip', 0.3, { dur: 1.2 }],
    [tCada - 0.2, 'whoosh', 0.3], [tCada + 0.4, 'contadora', 0.25, { dur: 2.6 }], [t20, 'ding', 0.4], [t20 + 0.4, 'tesoura', 0.5], [tQuinto, 'pop', 0.3],
    [tPorto - 0.2, 'whoosh', 0.3], [tPorto + 0.3, 'rail', 0.35], [tDeImp, 'hit', 0.45], [tVinte, 'pop', 0.3], [tNaoCem, 'buzz', 0.25], [tAlta, 'riser', 0.25], [t4, 'tesoura', 0.5], [t4 + 0.5, 'drop', 0.3], [tVilao, 'pop', 0.3]];
  return {
    accent: P.fab, cam, sfx, impacts: [tDeImp, t4], trans: 'push',
    draw(ctx, t, cam2) {
      salaFundo(ctx, cam2, 0.95);
      zone(ctx, cam2, 900, 1100, () => {
        if (t > tSai + 0.6) return;
        const k = vis(t, 0, tSai, 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        headline(ctx, 'um palpite', 960, 120, { size: 64, k: vis(t, tAntes, tQuanto, 0.5, 0.3), hl: '#14532d' });
        text(ctx, 'quanto fica com a fábrica e o navio?', 960, 120, { size: 46, weight: 900, color: '#ffffff', alpha: vis(t, tQuanto, tImp, 0.4, 0.4) });
        fabrica(ctx, 520, 480, 0.55, t, { a: appear(t, tQuanto, 0.5) });
        navio(ctx, 1420, 520, 0.42, t, { a: appear(t, tQuanto + 0.4, 0.5) });
        contador(ctx, 960, 330, 0.9, t, {});
        chip(ctx, 960, 450, 'pensa num número', '#fde68a', vis(t, tPensa, tImp, 0.4, 0.4), { size: 28 });
        if (t > tPensa - 0.2 && t < tImp + 0.6) { ctx.save(); ctx.globalAlpha *= vis(t, tPensa, tImp, 0.4, 0.4); ampulheta(ctx, 1210, 330, 0.5, t); ctx.restore(); }
        // prateleira de loja: a maioria das caixas é importada
        const kp = appear(t, tImp, 0.5);
        if (kp > 0) for (let i = 0; i < 5; i++) {
          const x = 600 + i * 180, kk = appear(t, tImp + i * 0.15, 0.4);
          ctx.save(); ctx.globalAlpha *= kk; caixaBoneca(ctx, x, 690, 0.36, t, { cor: ['#db2777', '#7c3aed', '#0891b2', '#ea580c', '#16a34a'][i], vest: ['#2563eb', '#f59e0b', '#16a34a', '#7c3aed', '#dc2626'][i], selo: false }); ctx.restore();
          if (i !== 2) chip(ctx, x, 590, 'IMPORTADO', '#93c5fd', appear(t, tMaioria + i * 0.12, 0.4), { size: 16 });
        }
        ctx.save(); ctx.globalAlpha *= kp; ctx.fillStyle = '#78350f'; ctx.fillRect(480, 770, 1000, 16); ctx.restore();
        ctx.restore();
      });
      zone(ctx, cam2, 2200, 2700, () => {
        if (t < tSai - 0.8 || t > tCada + 0.6) return;
        const k = vis(t, tSai - 0.3, tCada, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        fabrica(ctx, 1880, 520, 0.85, t);
        chip(ctx, 1980, 230, 'fábrica na China', P.fab, appear(t, tSai, 0.4), { size: 26 });
        trilho(ctx, 1500, 2600, 790);
        const xt = lerp(1900, 2250, ease.inOut(prog(t, tSai + 0.4, 2.2)));
        trem(ctx, xt, 772, 0.6, t, { carga: t < tCont + 0.3, giro: xt / 20 });
        const kc = appear(t, tCont, 0.5);
        if (kc > 0) {
          conteiner(ctx, 2420, 600, 0.9, '#c2410c', { a: clamp(kc * 2), label: 'CONTÊINER' });
          const p = ease.inOut(prog(t, tCont + 0.1, 0.8));
          if (p < 1) { ctx.save(); ctx.translate(lerp(xt - 170, 2360, p), lerp(690, 600, p)); ctx.scale(lerp(0.3, 0.12, p), lerp(0.3, 0.12, p)); caixaBoneca(ctx, 0, 0, 1, t, {}); ctx.restore(); }
        }
        const km = appear(t, tMes, 0.6);
        if (km > 0) {
          navio(ctx, 2880 + ease.out(prog(t, tMes, 6)) * 120, 610, 0.62, t, { a: clamp(km * 2) });
          const dia = 1 + Math.floor(34 * ease.out(prog(t, tMes + 0.6, 2.4)));
          calMini(ctx, 2900, 280, 0.75, 'NO MAR', dia, '#1d4ed8', 0, { a: clamp(km * 2) });
          chip(ctx, 2900, 430, 'mais de um mês no mar', '#93c5fd', appear(t, tMes + 0.3, 0.4), { size: 26 });
        }
        ctx.restore();
      });
      zone(ctx, cam2, 3700, 3900, () => {
        if (t < tCada - 0.8 || t > tPorto + 0.6) return;
        const k = vis(t, tCada - 0.3, tPorto, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        headline(ctx, 'cada boneca tem a sua conta', 3800, 120, { size: 54, k: vis(t, tCada, t20, 0.5, 0.4), hl: '#14532d' });
        // etiquetas de fábrica diferentes passando (sem valor: cada boneca tem o seu)
        if (t < t20 + 0.4) for (let i = 0; i < 6; i++) {
          const t0 = tCada + 0.3 + i * 0.35, kk = vis(t, t0, t0 + 1.4, 0.3, 0.4); if (kk <= 0) continue;
          const xx = 3200 + ((i * 263) % 1200), yy = 230 + ((i * 97) % 3) * 40;
          ctx.save(); ctx.globalAlpha *= kk; etiquetaPreco(ctx, xx, yy, 0.6, 'R$ ?', (i % 2 ? 0.12 : -0.1)); ctx.restore();
        }
        contador(ctx, 3800, 330, 0.95, t, { para: t > t20 ? 'R$ 20,00' : null, cor: P.fab });
        if (t > t20) { fillRR(ctx, 4030, 248, 120, 34, 17, '#0b1222'); strokeRR(ctx, 4030, 248, 120, 34, 17, '#cbd5e1', 2); text(ctx, 'exemplo', 4090, 266, { size: 19, weight: 900, color: '#cbd5e1' }); }
        chip(ctx, 3800, 210, 'no nosso exemplo', '#e2e8f0', vis(t, tEx, t20 + 2, 0.4, 0.4), { size: 26 });
        const x0 = 3100, w = 1400, y = 560, kf = appear(t, t20 + 0.3, 0.5);
        fita(ctx, x0, y, w, [{ a: 0, b: B1, cor: P.fab, k: kf, gapB: kf, dy: kf * 20, brilho: vis(t, tQuinto, tPorto, 0.3, 0.4) * (0.6 + 0.4 * Math.sin(t * 6)) }, { a: B1, b: 100, gapA: kf }], { marcas: 1, numeros: true });
        if (t > t20 && t < t20 + 1.2) tesoura(ctx, fitaX(x0, w, B1), y - 10, 0.6, 0.5 + 0.5 * Math.sin(prog(t, t20 + 0.3, 0.4) * 6.28), -1.57);
        rotuloFita(ctx, fitaX(x0, w, B1 / 2), y + 120, 'R$ 20,00', 'fábrica + navio', '#86efac', kf, { exemplo: true });
        chip(ctx, 4300, 700, '1/5 da etiqueta', '#86efac', appear(t, tQuinto, 0.4), { size: 30 });
        ctx.restore();
      });
      zone(ctx, cam2, 5000, 5300, () => {
        if (t < tPorto - 0.8) return;
        const k = appear(t, tPorto - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        const lift = ease.inOut(prog(t, tPorto + 0.3, 1.6));
        navio(ctx, lerp(3900, 4350, ease.out(prog(t, tPorto - 0.3, 2.0))), 520, 0.42, t);
        guindaste(ctx, 4700, 480, 0.75, { carro: lerp(260, 120, lift), cabo: 200 - lift * 60 });
        conteiner(ctx, 4700 + lerp(195, 90, lift), 480 - 250 * 0.75 + (200 - lift * 60) * 0.75 + 45, 0.5, '#c2410c');
        // o "vilão": a placa do imposto de importação chega enorme e encolhe quando corta
        const kv = appear(t, tDeImp, 0.5), enc = ease.inOut(prog(t, t4 + 0.4, 1.0)), cresce = Math.sin(Math.PI * prog(t, tAlta, 1.6)) * 0.12;
        if (kv > 0) {
          const sc = lerp(1.0, 0.42, enc) * (1 + cresce) * lerp(1.4, 1, ease.out(clamp(kv)));
          ctx.save(); ctx.translate(lerp(5350, 5480, enc), lerp(290, 250, enc)); ctx.rotate(Math.sin(t * 2.2) * 0.04); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(kv * 2);
          fillRR(ctx, -330, -90, 660, 180, 20, '#7f1d1d'); strokeRR(ctx, -330, -90, 660, 180, 20, '#fca5a5', 8);
          text(ctx, 'IMPOSTO DE', 0, -40, { size: 40, weight: 900, color: '#fecaca', letter: 3 });
          text(ctx, 'IMPORTAÇÃO', 0, 26, { size: 76, weight: 900, color: '#ffffff', letter: 2 });
          ctx.restore();
          if (enc > 0.5) { const yy = 200 + ((t * 60) % 40); ctx.save(); ctx.globalAlpha *= (enc - 0.5) * 2 * vis(t, tVilao, 99, 0.3, 0.3); ctx.fillStyle = '#7dd3fc'; ctx.beginPath(); ctx.moveTo(5640, yy - 16); ctx.quadraticCurveTo(5652, yy, 5640, yy + 8); ctx.quadraticCurveTo(5628, yy, 5640, yy - 16); ctx.fill(); ctx.restore(); }
        }
        chip(ctx, 5350, 120, 'o imposto que todo mundo culpa', '#fca5a5', vis(t, tCulpa, tSoQ, 0.4, 0.4), { size: 28 });
        const x0 = 4500, w = 1400, y = 640, kc = appear(t, t4, 0.5);
        fita(ctx, x0, y, w, [{ a: 0, b: B1, cor: P.fab, k: 1, gapB: 1, dy: 20, brilho: vis(t, tVinte, tNaoCem + 1.2, 0.3, 0.4) }, { a: B1, b: B2, cor: P.fed, k: kc, gapA: 1, gapB: kc, dy: kc * 20 }, { a: B2, b: 100, gapA: kc }], { marcas: 0.6 });
        if (t > t4 && t < t4 + 1.2) tesoura(ctx, fitaX(x0, w, B2), y - 10, 0.6, 0.5 + 0.5 * Math.sin(prog(t, t4, 0.4) * 6.28), -1.57);
        const ka = vis(t, tVinte, t4, 0.4, 0.4);
        if (ka > 0) { ctx.save(); ctx.globalAlpha *= ka; arrow(ctx, 5200, 400, fitaX(x0, w, B1 / 2) + 60, y - 50, '#fecaca', 8, ease.out(prog(t, tVinte, 0.6))); ctx.restore(); }
        chip(ctx, fitaX(x0, w, B1 / 2), y - 70, 'cobrado em cima dos R$ 20', '#86efac', vis(t, tVinte, t4, 0.4, 0.4), { size: 24 });
        const kn = vis(t, tNaoCem, t4, 0.4, 0.4);
        if (kn > 0) { ctx.save(); ctx.globalAlpha *= kn; etiquetaPreco(ctx, 5880, 470, 0.6, 'R$ 100,00', 0.06); etqX(ctx, 5890, 470, 1.3, prog(t, tNaoCem + 0.2, 0.4)); ctx.restore(); }
        chip(ctx, 5350, 440, 'parece alta…', '#fca5a5', vis(t, tAlta, t4, 0.4, 0.3), { size: 26 });
        rotuloFita(ctx, fitaX(x0, w, B2) + 40, y + 120, 'R$ 3,60', 'importação', '#fca5a5', kc);
        chip(ctx, 5400, 820 - 60, 'uma das menores fatias', '#fde68a', appear(t, tMenores, 0.4), { size: 28 });
        ctx.restore();
      });
      bokeh(ctx, cam2, t, 7, 9);
    },
    overlay(ctx, t) { cantoLista(ctx); source(ctx, 'conta do canal (exemplo)', vis(t, tEx, 99, 0.5, 0.4)); },
  };
}

// ================================================================ Cena 04: o importador, a sopa de letrinhas e os R$ 14,12 de Brasília
function scene04(K) {
  const tDo = K('Do porto, a caixa vai'), tEmp = K('a empresa que trouxe'), tLa = K('e de lá para a loja'), tCam = K('No caminho, entram mais três'), tSopa = K('sopa de letrinhas');
  const tIPI = K('IPI'), tPIS = K('PIS e'), tCof = K('Cofins'), tJunto = K('Junto com a de importação'), tBras = K('Brasília já levou'), t14 = K('uns catorze reais'), tMesmo = K('Mesmo assim'), tMaior = K('o maior pedaço do imposto');
  const cam = [
    { t: 0, x: 900, y: 480, z: 1.04, dx: 6 }, { t: tEmp, x: 1000, y: 470, z: 1.1, d: 1.6 }, { t: tLa, x: 1250, y: 480, z: 1.02, d: 1.4 },
    { t: tCam - 0.3, x: 2400, y: 470, z: 1.0, d: 1.4 }, { t: tIPI - 0.2, x: 2400, y: 380, z: 1.08, d: 1.2 },
    { t: tJunto - 0.3, x: 3800, y: 470, z: 1.0, d: 1.4 }, { t: t14, x: 3700, y: 480, z: 1.08, d: 1.2 }, { t: tMesmo, x: 3950, y: 470, z: 1.02, d: 1.6, dx: 6 },
  ];
  const sfx = [[0.1, 'apito', 0.35], [0.3, 'trem', 0.35, { dur: 2.4 }], [tEmp, 'pop', 0.3], [tLa, 'whoosh', 0.3], [tCam - 0.2, 'whoosh', 0.3], [tCam + 0.4, 'liquid', 0.3], [tSopa, 'spoon', 0.4],
    [tIPI, 'pop', 0.45], [tPIS, 'pop', 0.45], [tCof, 'pop', 0.45], [tJunto - 0.2, 'whoosh', 0.3], [tJunto + 0.3, 'tesoura', 0.4], [tJunto + 0.9, 'tesoura', 0.4], [tBras, 'coin', 0.4], [t14, 'cash', 0.4],
    [tMesmo, 'riser', 0.25], [tMaior, 'drop', 0.3]];
  return {
    accent: P.fed, cam, sfx, impacts: [t14], trans: 'push',
    draw(ctx, t, cam2) {
      salaFundo(ctx, cam2, 0.95);
      zone(ctx, cam2, 800, 1300, () => {
        if (t > tCam + 0.6) return;
        const k = vis(t, 0, tCam, 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        galpao(ctx, 900, 500, 1.0, t, { placa: 'IMPORTADOR' });
        trilho(ctx, 200, 1900, 820);
        plaquinha(ctx, 1700, 720, 'LOJA', P.aqui, appear(t, tLa, 0.5));
        const xt = lerp(150, 560, ease.out(prog(t, 0.2, 2.6))) + lerp(0, 1000, ease.inOut(prog(t, tLa + 0.3, 3)));
        trem(ctx, xt, 802, 0.8, t, { giro: xt / 20 });
        chip(ctx, 900, 140, 'a empresa que trouxe a boneca para o Brasil', '#e9d5ff', vis(t, tEmp, tCam, 0.4, 0.4), { size: 28 });
        if (t > tLa) arrow(ctx, 1300, 600, 1620, 600, '#e9d5ff', 8, ease.out(prog(t, tLa, 0.6)));
        ctx.restore();
      });
      zone(ctx, cam2, 2300, 2500, () => {
        if (t < tCam - 0.8 || t > tJunto + 0.6) return;
        const k = vis(t, tCam - 0.3, tJunto, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        chip(ctx, 2400, 120, 'mais três cobranças federais', '#fca5a5', appear(t, tCam, 0.4), { size: 30 });
        sopa(ctx, 2400, 650, 0.95, t);
        text(ctx, 'sopa de letrinhas', 1960, 600, { size: 30, weight: 900, color: '#fde68a', alpha: appear(t, tSopa, 0.4) });
        [[tIPI, 'IPI', 2080], [tPIS, 'PIS', 2400], [tCof, 'COFINS', 2760]].forEach(([tt, s, x]) => {
          const kk = prog(t, tt - 0.1, 0.6); if (kk <= 0) return;
          const p = ease.out(kk), yy = lerp(640, 330, p) - Math.sin(Math.PI * clamp(kk)) * 60;
          headline(ctx, s, lerp(2400, x, p), yy, { size: 96, k: clamp(kk * 1.5), color: '#fecaca', color2: '#ef4444' });
        });
        ctx.restore();
      });
      zone(ctx, cam2, 3700, 4000, () => {
        if (t < tJunto - 0.8) return;
        const k = appear(t, tJunto - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        const x0 = 3100, w = 1400, y = 330, c1 = appear(t, tJunto + 0.3, 0.4), c2 = appear(t, tJunto + 0.9, 0.4), kj = appear(t, t14, 0.6);
        const ped = [
          { a: 0, b: B1, cor: P.fab, k: 1, gapB: 1, dy: 20 },
          { a: B1, b: B2, cor: P.fed, k: 1, gapA: 1, gapB: 1 - kj, dy: 20, brilho: kj },
          { a: B2, b: B3, cor: P.fed, k: c1, gapA: 1 - kj, gapB: c1 * (1 - kj), dy: 20 * c1, brilho: kj },
          { a: B3, b: B4, cor: P.fed, k: c2, gapA: c1 * (1 - kj), gapB: c2, dy: 20 * c2, brilho: kj },
          { a: B4, b: 100, gapA: c2, brilho: vis(t, tMaior, 99, 0.4, 0.3) * (0.5 + 0.5 * Math.sin(t * 5)) },
        ];
        fita(ctx, x0, y, w, ped, { marcas: 0.6 });
        if (t > tJunto + 0.2 && t < tJunto + 1.5) { const xb = t < tJunto + 0.8 ? B3 : B4; tesoura(ctx, fitaX(x0, w, xb), y - 10, 0.55, 0.5 + 0.5 * Math.sin(t * 14), -1.57); }
        text(ctx, 'IPI', fitaX(x0, w, (B2 + B3) / 2), y + 70, { size: 20, weight: 900, color: '#fecaca', alpha: c1 * (1 - kj) });
        text(ctx, 'PIS e Cofins', fitaX(x0, w, (B3 + B4) / 2), y + 70, { size: 20, weight: 900, color: '#fecaca', alpha: c2 * (1 - kj) });
        text(ctx, 'importação', fitaX(x0, w, (B1 + B2) / 2), y + 70, { size: 20, weight: 900, color: '#fecaca', alpha: 1 - kj });
        rotuloFita(ctx, fitaX(x0, w, (B1 + B4) / 2), y + 120, 'R$ 14,12', 'federais', '#fca5a5', kj);
        // Brasília: o prédio do governo federal recebe as moedas
        const kb = appear(t, tBras, 0.5);
        if (kb > 0) {
          predioGov(ctx, 3450, 720, 0.62, 'UNIÃO', '#fca5a5', { a: clamp(kb * 2) });
          for (let i = 0; i < 4; i++) { const p = ease.inOut(prog(t, tBras + 0.2 + i * 0.18, 0.8)); if (p <= 0 || p >= 1) continue; const xs = fitaX(x0, w, B1 + 3 + i * 4), ys = y + 30; const xx = lerp(xs, 3450, p), yy = lerp(ys, 660, p) - Math.sin(Math.PI * p) * 120; moedaLaranja(ctx, xx, yy, 18); }
          chip(ctx, 3450, 575, 'Brasília', '#fca5a5', kb, { size: 26 });
        }
        // a sombra da tesoura grande chegando: falta o maior pedaço
        const km = appear(t, tMesmo, 0.8);
        if (km > 0) { ctx.save(); ctx.globalAlpha *= 0.35 * km; ctx.filter = 'blur(6px)'; ctx.fillStyle = '#000'; tesoura(ctx, lerp(4900, 4550, ease.out(km)), 300, 1.4, 0.7 + 0.2 * Math.sin(t * 3), -1.2); ctx.filter = 'none'; ctx.restore(); }
        chip(ctx, 4250, 600, 'o maior pedaço do imposto ainda não entrou', '#fde68a', appear(t, tMaior, 0.4), { size: 28 });
        ctx.restore();
      });
      bokeh(ctx, cam2, t, 9, 9);
    },
    overlay(ctx, t) { cantoLista(ctx); source(ctx, 'Receita Federal; conta do canal (exemplo)', vis(t, tJunto, 99, 0.5, 0.4)); },
  };
}

// ================================================================ Cena 05: o ICMS na loja, o terço de imposto, o teste do palpite e a virada (quase metade fica aqui)
function scene05(K) {
  const tICMS = K('É o ICMS'), tEst = K('o imposto do estado'), t18 = K('é de dezoito por cento'), tDesde = K('Ele é cobrado desde o porto'), tFecha = K('a conta dele fecha'), tFinal = K('o da etiqueta');
  const tSoz = K('Por isso ele leva, sozinho'), tFeds = K('mais que todos os federais'), tSoma = K('Somando tudo'), t32 = K('uns trinta e dois reais'), tTerco = K('Um terço'), tNem = K('Nem perto da frase');
  const tPalp = K('E se o seu palpite foi outro'), tQuase = K('essa conta quase não muda'), tPorque = K('porque o imposto grande depende'), tAgora = K('Agora vem a parte');
  const tDesc = K('Desconta a viagem'), tDescImp = K('e desconta esses impostos'), tEx = K('No nosso exemplo, ainda sobra'), tMetade = K('quase metade da etiqueta'), tPed = K('Esse pedaço ficou aqui'), tEmp = K('com as empresas que trouxeram');
  const cam = [
    { t: 0, x: 960, y: 480, z: 1.0, dx: 4 }, { t: t18, x: 1150, y: 470, z: 1.08, d: 1.4 }, { t: tDesde, x: 900, y: 420, z: 1.02, d: 1.6 }, { t: tFinal, x: 1200, y: 520, z: 1.1, d: 1.2 },
    { t: tSoz - 0.3, x: 2400, y: 470, z: 1.0, d: 1.4 }, { t: tSoma, x: 2400, y: 430, z: 1.06, d: 1.4 }, { t: tNem, x: 2400, y: 470, z: 1.02, d: 1.2 },
    { t: tPalp - 0.3, x: 3800, y: 470, z: 1.0, d: 1.4, dx: 3 },
    { t: tAgora - 0.3, x: 5200, y: 480, z: 1.0, d: 1.4 }, { t: tEx, x: 5450, y: 460, z: 1.12, d: 1.2 }, { t: tPed, x: 5250, y: 480, z: 1.04, d: 1.6 },
  ];
  const sfx = [[tICMS, 'hit', 0.4], [tEst, 'pop', 0.3], [t18, 'stamp', 0.45], [tDesde, 'coin', 0.3], [tDesde + 0.5, 'coin', 0.25], [tDesde + 1.0, 'coin', 0.25], [tFinal, 'cash', 0.4],
    [tSoz - 0.2, 'whoosh', 0.3], [tSoz + 0.3, 'tesoura', 0.55], [tFeds, 'pop', 0.35], [tSoma, 'riser', 0.25], [t32, 'ding', 0.4], [tTerco, 'pop', 0.35], [tNem, 'stamp', 0.4],
    [tPalp - 0.2, 'whoosh', 0.3], [tQuase, 'tick', 0.3], [tPorque, 'pop', 0.3],
    [tAgora - 0.2, 'whoosh', 0.3], [tAgora + 0.3, 'switch', 0.35], [tDesc, 'whoosh', 0.35], [tDescImp, 'whoosh', 0.35], [tEx + 0.6, 'impact', 0.28], [tMetade, 'sparkle', 0.35], [tPed, 'pop', 0.3]];
  return {
    accent: P.icms, cam, sfx, impacts: [tSoz + 0.3, tEx + 0.6], trans: 'push',
    draw(ctx, t, cam2) {
      salaFundo(ctx, cam2, 0.95);
      zone(ctx, cam2, 900, 1200, () => {
        if (t > tSoz + 0.6) return;
        const k = vis(t, 0, tSoz, 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        loja(ctx, 640, 580, 0.86, t);
        caixaRegistradora(ctx, 1330, 650, 1.1, { visor: '100,00' });
        const ki = appear(t, tICMS, 0.5);
        if (ki > 0) headline(ctx, 'ICMS', 1330, 210, { size: 120, k: ki, color: '#fde68a', color2: '#f59e0b' });
        chip(ctx, 1330, 320, 'o imposto do estado', P.icms, appear(t, tEst, 0.4), { size: 28 });
        bigNum(ctx, 'SP: 18%', 1620, 470, appear(t, t18, 0.5), { size: 80, color: P.icms });
        // cobrado desde o porto: moedinhas laranja pelas paradas até a loja
        const kd = vis(t, tDesde, tFinal, 0.4, 0.4);
        if (kd > 0) {
          ctx.save(); ctx.globalAlpha *= kd;
          ctx.strokeStyle = 'rgba(253,186,116,0.7)'; ctx.lineWidth = 5; ctx.setLineDash([14, 12]); ctx.beginPath(); ctx.moveTo(250, 250); ctx.lineTo(1250, 250); ctx.stroke(); ctx.setLineDash([]);
          [['porto', 280], ['importador', 760], ['loja', 1230]].forEach(([lb, x], i) => chip(ctx, x, 200, lb, '#fdba74', appear(t, tDesde + i * 0.3, 0.4), { size: 24 }));
          for (let i = 0; i < 3; i++) { const p = ((t - tDesde) * 0.4 + i / 3) % 1; moedaLaranja(ctx, lerp(280, 1230, p), 250 - Math.sin(p * Math.PI) * 30, 18, clamp(kd * 2)); }
          chip(ctx, 760, 310, 'cobrado desde o porto, etapa por etapa', P.icms, appear(t, tDesde + 0.6, 0.4), { size: 26 });
          ctx.restore();
        }
        if (t > tFecha) penCircle(ctx, 1345, 549, 150, 52, '#fde047', prog(t, tFecha + 0.3, 0.6), 6);
        chip(ctx, 1330, 410, 'a conta fecha no preço final', '#fde68a', vis(t, tFecha + 0.3, tSoz, 0.4, 0.4), { size: 26 });
        ctx.restore();
      });
      zone(ctx, cam2, 2300, 2500, () => {
        if (t < tSoz - 0.8 || t > tPalp + 0.6) return;
        const k = vis(t, tSoz - 0.3, tPalp, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        const x0 = 1700, w = 1400, y = 300, kc = appear(t, tSoz + 0.3, 0.5), ks = appear(t, t32, 0.6);
        fita(ctx, x0, y, w, [
          { a: 0, b: B1, cor: P.fab, k: 1, gapB: 1, dy: 20, al: 1 - 0.5 * ks },
          { a: B1, b: B4, cor: P.fed, k: 1, gapA: 1, gapB: 1 - ks, dy: 20, brilho: ks },
          { a: B4, b: B5, cor: P.icms, k: kc, gapA: kc * (1 - ks), gapB: kc, dy: 20 * kc, brilho: Math.max(ks, vis(t, tFeds, tSoma, 0.3, 0.3)) },
          { a: B5, b: 100, gapA: kc, al: 1 - 0.5 * ks },
        ], { marcas: 0.5 });
        if (t > tSoz + 0.2 && t < tSoz + 1.4) tesoura(ctx, fitaX(x0, w, B5), y - 20, 1.0, 0.5 + 0.5 * Math.sin(t * 12), -1.57);
        rotuloFita(ctx, fitaX(x0, w, (B4 + B5) / 2), y + 120, 'R$ 18,00', 'ICMS', '#fde68a', kc * (1 - ks));
        // comparação: ICMS sozinho x os federais juntos
        const kb = vis(t, tFeds, tSoma, 0.4, 0.4);
        if (kb > 0) {
          ctx.save(); ctx.globalAlpha *= kb;
          const base = 760, sc = 14, g = ease.out(prog(t, tFeds, 0.8));
          fillRR(ctx, 2160, base - V.fed * sc * g, 150, V.fed * sc * g, 10, P.fed); fillRR(ctx, 2490, base - V.icms * sc * g, 150, V.icms * sc * g, 10, P.icms);
          text(ctx, 'federais', 2235, base + 28, { size: 22, weight: 900, color: '#fecaca' }); text(ctx, 'ICMS', 2565, base + 28, { size: 22, weight: 900, color: '#fde68a' });
          text(ctx, 'R$ 14,12', 2235, base - V.fed * sc * g - 26, { size: 26, weight: 900, color: '#fecaca' }); text(ctx, 'R$ 18,00', 2565, base - V.icms * sc * g - 26, { size: 26, weight: 900, color: '#fde68a' });
          ctx.restore();
        }
        rotuloFita(ctx, fitaX(x0, w, (B1 + B5) / 2), y + 130, 'R$ 32,12', 'impostos em cima da boneca', '#fdba74', ks, { size: 78, sub: 26 });
        bigNum(ctx, '1/3', 2400, 580, vis(t, tTerco, tPalp, 0.4, 0.4), { size: 110, color: '#fdba74' });
        const kn = appear(t, tNem, 0.4);
        if (kn > 0) { headline(ctx, 'até 70%', 2400, 720, { size: 80, k: kn, color: '#fecaca', color2: '#f87171' }); crossOut(ctx, 2220, 730, 2580, 700, '#ffffff', prog(t, tNem + 0.3, 0.4), 12); }
        ctx.restore();
      });
      zone(ctx, cam2, 3700, 3900, () => {
        if (t < tPalp - 0.8 || t > tAgora + 0.6) return;
        const k = vis(t, tPalp - 0.3, tAgora, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        headline(ctx, 'e se o seu palpite foi outro?', 3800, 130, { size: 54, k: appear(t, tPalp, 0.5), hl: '#14532d' });
        // a fábrica estica e encolhe (R$ 15 a R$ 30); o imposto quase não se mexe (31% a 35%)
        const osc = 0.5 + 0.5 * Math.sin((t - tPalp) * 1.6), fab = lerp(15, 30, osc), tax = lerp(30.88, 34.56, osc);
        const x0 = 3100, w = 1400, y = 380;
        fita(ctx, x0, y, w, [{ a: 0, b: fab, cor: P.fab, k: 1, gapB: 1 }, { a: fab, b: fab + tax, cor: P.icms, k: 1, gapA: 1, gapB: 1 }, { a: fab + tax, b: 100, cor: P.aqui, k: 0.35, gapA: 1 }], {});
        text(ctx, 'fábrica + navio', fitaX(x0, w, fab / 2), y + 64, { size: 22, weight: 900, color: '#bbf7d0' });
        text(ctx, 'impostos', fitaX(x0, w, fab + tax / 2), y + 64, { size: 22, weight: 900, color: '#fde68a' });
        chip(ctx, 3480, 560, 'fábrica de R$ 15 a R$ 30', '#86efac', appear(t, tPalp + 0.8, 0.4), { size: 32 });
        text(ctx, '→', 3800, 562, { size: 54, weight: 900, color: '#e2e8f0', alpha: appear(t, tQuase, 0.4) });
        chip(ctx, 4120, 560, 'imposto de 31% a 35%', '#fdba74', appear(t, tQuase, 0.4), { size: 32 });
        chip(ctx, 3800, 700, 'o imposto grande vai no preço da loja', P.icms, appear(t, tPorque, 0.4), { size: 32 });
        ctx.restore();
      });
      zone(ctx, cam2, 5100, 5500, () => {
        if (t < tAgora - 0.8) return;
        const k = appear(t, tAgora - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        const x0 = 4500, w = 1400, y = 430, kv = appear(t, tDesc, 0.7), ki = appear(t, tDescImp, 0.7), ke = appear(t, tEx + 0.6, 0.5);
        lanterna(ctx, 4300, 0, 1.1, vis(t, tAgora + 0.3, tEx + 0.6, 0.6, 0.5) * 0.8, [fitaX(x0, w, 76), y, 260]);
        fita(ctx, x0, y, w, [
          { a: 0, b: B1, cor: P.fab, k: 1, gapB: 1, dy: -kv * 320, dx: -kv * 200, al: 1 - kv },
          { a: B1, b: B5, cor: P.icms, k: 1, gapA: 1, gapB: 1, dy: -ki * 320, al: 1 - ki },
          { a: B5, b: 100, cor: P.aqui, k: ke, gapA: 1, brilho: ke * (0.6 + 0.4 * Math.sin(t * 5)) },
        ], { h: 70 });
        headline(ctx, 'a parte que quase ninguém olha', 5200, 130, { size: 56, k: vis(t, tAgora, tMetade, 0.5, 0.4), hl: '#3b0764' });
        headline(ctx, '− a viagem', 4920, 600, { size: 54, k: vis(t, tDesc, tEx + 0.6, 0.4, 0.4), color: '#bbf7d0', color2: '#22c55e', align: 'left' });
        headline(ctx, '− os impostos', 4920, 690, { size: 54, k: vis(t, tDescImp, tEx + 0.6, 0.4, 0.4), color: '#fde68a', color2: '#f59e0b', align: 'left' });
        chip(ctx, fitaX(x0, w, B1 / 2), y - 90, 'a viagem desde a China', '#86efac', vis(t, tDesc, tDesc + 1.2, 0.3, 0.4), { size: 24 });
        chip(ctx, fitaX(x0, w, (B1 + B5) / 2), y - 90, 'os impostos', '#fdba74', vis(t, tDescImp, tDescImp + 1.2, 0.3, 0.4), { size: 24 });
        shockRing(ctx, t, tEx + 0.6, fitaX(x0, w, 76), y, P.aqui, 60, 420);
        rotuloFita(ctx, fitaX(x0, w, 76), y + 130, 'R$ 47,88', 'importador + loja', '#d8b4fe', ke, { size: 66, exemplo: true });
        chip(ctx, 5200, 140, 'quase metade da etiqueta', '#e9d5ff', appear(t, tMetade, 0.4), { size: 32 });
        chip(ctx, 5200, 720, 'ficou aqui no Brasil, com quem trouxe e vendeu', '#e9d5ff', appear(t, tPed, 0.4), { size: 28 });
        ctx.restore();
      });
      bokeh(ctx, cam2, t, 11, 9);
    },
    overlay(ctx, t) {
      const DUR = this.dur ?? 999;
      cantoLista(ctx);
      source(ctx, 'RICMS/SP; conta do canal (exemplo)', vis(t, tICMS, DUR - 1.4, 0.5, 0.3));
      // transição (a única de efeito): a caixa da boneca abre na planificação de papelão pela tela toda
      const kt = prog(t, DUR - 1.3, 1.3);
      if (kt > 0) {
        ctx.save(); ctx.globalAlpha *= clamp(kt * 3);
        molde(ctx, 960, 540, lerp(0.45, 4.2, ease.in(kt)), clamp(kt * 1.6));
        ctx.fillStyle = `rgba(200,162,107,${clamp((kt - 0.72) / 0.28)})`; ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }
    },
  };
}

// ================================================================ Cena 06: para onde vai o pedaço (custos, imposto escondido, os 40 da lista, o lucro e o risco das duas datas)
function scene06(K) {
  const tE = K('E para onde vai esse pedaço'), tCusto = K('Uma parte é custo'), tFrete = K('paga o frete'), tGalp = K('e o galpão'), tAlug = K('a loja paga aluguel'), tVend = K('vendedor e luz'), tLuz = K('e luz');
  const tLembra = K('Lembra dos quarenta'), tAqui = K('Aqui dentro ainda tem'), tSal = K('sobre o salário do vendedor'), tLucro = K('o que as empresas pagam sobre o lucro');
  const tLista = K('A lista do IBPT soma'), tPorIsso = K('Por isso, as duas contas'), tNossa = K('a nossa pega só'), tSobra = K('O que sobra depois disso'), tRisco = K('Só que ele vem com risco');
  const tCompra = K('A loja compra meses antes'), tAposta = K('aposta alto'), tDia = K('o Dia das Crianças'), tNatal = K('e o Natal'), tJan = K('O que sobra em janeiro'), tLiq = K('vai para a liquidação'), tEtq = K('Esse risco também está escrito');
  const cam = [
    { t: 0, x: 960, y: 480, z: 1.0, dz: 0.006 }, { t: tFrete, x: 760, y: 500, z: 1.08, d: 1.4 }, { t: tAlug, x: 1250, y: 500, z: 1.08, d: 1.4 },
    { t: tLembra - 0.3, x: 2400, y: 470, z: 1.0, d: 1.4 }, { t: tSal, x: 2250, y: 520, z: 1.08, d: 1.4 }, { t: tLucro, x: 2600, y: 520, z: 1.08, d: 1.4 }, { t: tPorIsso, x: 2400, y: 460, z: 1.0, d: 1.4 },
    { t: tSobra - 0.3, x: 3800, y: 470, z: 1.0, d: 1.4 }, { t: tAposta, x: 4000, y: 450, z: 1.06, d: 1.4 }, { t: tJan, x: 3800, y: 540, z: 1.06, d: 1.4 }, { t: tEtq, x: 4150, y: 520, z: 1.1, d: 1.4 },
  ];
  const sfx = [[0.05, 'papelao', 0.4, { dur: 1.2 }], [tE, 'pop', 0.3], [tCusto, 'pop', 0.3], [tFrete, 'truck', 0.18], [tGalp, 'pop', 0.3], [tAlug, 'key', 0.35], [tVend, 'pop', 0.3], [tLuz, 'switch', 0.35],
    [tLembra - 0.2, 'whoosh', 0.3], [tLembra + 0.2, 'riser', 0.25], [tAqui, 'scan', 0.3], [tSal, 'paper', 0.35], [tSal + 0.8, 'coin', 0.35], [tLucro + 0.8, 'coin', 0.35], [tLista, 'pop', 0.3], [tPorIsso, 'stamp', 0.22],
    [tSobra - 0.2, 'whoosh', 0.3], [tSobra + 0.3, 'coin', 0.3], [tRisco, 'buzz', 0.25], [tCompra, 'crate', 0.3], [tDia, 'pop', 0.35], [tNatal, 'pop', 0.35], [tJan, 'flip', 0.3, { dur: 0.5 }], [tLiq, 'drop', 0.35], [tEtq, 'paper', 0.35]];
  return {
    accent: P.aqui, cam, sfx, impacts: [], trans: 'cut',
    draw(ctx, t, cam2) {
      salaFundo(ctx, cam2, 0.95);
      zone(ctx, cam2, 900, 1200, () => {
        if (t > tLembra + 0.6) return;
        const k = vis(t, 0, tLembra, 0.0, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        // o molde vira o chão: galpão e loja montando
        const km = appear(t, 0.2, 1.2);
        ctx.save(); ctx.translate(0, (1 - ease.out(km)) * 40); ctx.globalAlpha *= km;
        galpao(ctx, 620, 540, 0.68, t, { placa: 'IMPORTADOR' }); loja(ctx, 1320, 560, 0.58, t);
        ctx.restore();
        fita(ctx, -181, 130, 1500, [{ a: B5, b: 100, cor: P.aqui, k: 1, brilho: vis(t, tE, tCusto + 1, 0.4, 0.4) }], {});
        rotuloFita(ctx, 960, 210, 'R$ 47,88', null, '#d8b4fe', appear(t, 0.6, 0.5), { size: 40 });
        chip(ctx, 960, 300, 'para onde vai esse pedaço?', '#e9d5ff', vis(t, tE, tCusto + 0.4, 0.4, 0.4), { size: 28 });
        chip(ctx, 960, 300, 'uma parte é custo', '#e9d5ff', vis(t, tCusto + 0.4, tLembra, 0.4, 0.4), { size: 28 });
        const kf = appear(t, tFrete, 0.5) * (1 - appear(t, tAlug, 0.4)); if (kf > 0) { ctx.save(); ctx.globalAlpha *= clamp(kf * 2); iconTruck(ctx, lerp(200, 340, ease.out(kf)), 770, 170, '#e9d5ff', '#a78bfa'); ctx.restore(); text(ctx, 'frete', 340, 670, { size: 24, weight: 900, color: '#e9d5ff', alpha: kf }); }
        if (t > tGalp) penCircle(ctx, 620, 520, 240, 160, '#d8b4fe', prog(t, tGalp, 0.6), 6);
        const ka = appear(t, tAlug, 0.5); chave(ctx, 1640, 420, 0.8, ka); text(ctx, 'aluguel', 1660, 500, { size: 24, weight: 900, color: '#e9d5ff', alpha: ka });
        const kv = appear(t, tVend, 0.5); if (kv > 0) { pessoa(ctx, 1760, 700, 0.9, '#c4b5fd', clamp(kv * 2)); text(ctx, 'vendedor', 1760, 790, { size: 24, weight: 900, color: '#e9d5ff', alpha: kv }); }
        lampada(ctx, 1560, 640, 0.8, appear(t, tLuz, 0.5)); text(ctx, 'luz', 1560, 720, { size: 24, weight: 900, color: '#e9d5ff', alpha: appear(t, tLuz, 0.5) });
        ctx.restore();
      });
      zone(ctx, cam2, 2300, 2500, () => {
        if (t < tLembra - 0.8 || t > tSobra + 0.6) return;
        const k = vis(t, tLembra - 0.3, tSobra, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        const kd = appear(t, tPorIsso, 0.6);
        // os dois números: a lista (39,70%) e a nossa conta (R$ 32,12)
        bigNum(ctx, '39,70%', lerp(2700, 2750, kd), 210, appear(t, tLembra + 0.9, 0.4), { size: 84, color: '#fdba74' });
        text(ctx, 'a lista', 2750, 285, { size: 26, weight: 900, color: '#fdba74', alpha: appear(t, tLembra + 1.0, 0.4) });
        bigNum(ctx, 'R$ 32,12', 2050, 210, appear(t, tLembra + 1.2, 0.4), { size: 84, color: '#fde68a' });
        text(ctx, 'a nossa conta', 2050, 285, { size: 26, weight: 900, color: '#fde68a', alpha: appear(t, tLembra + 1.3, 0.4) });
        fita(ctx, 1950, 450, 900, [{ a: 0, b: 100, cor: P.aqui, k: 1 }], { semPontas: true, a: 1 - kd });
        const kl = vis(t, tAqui, tPorIsso, 0.4, 0.4);
        if (kl > 0) { ctx.save(); ctx.globalAlpha *= kl; lupa(ctx, 2400 + Math.sin(t * 1.4) * 160, 450, 0.9); ctx.restore(); }
        chip(ctx, 2400, 360, 'ainda tem imposto escondido aqui dentro', '#fdba74', vis(t, tAqui, tLista, 0.4, 0.4), { size: 26 });
        const ks = appear(t, tSal, 0.5);
        if (ks > 0) { ctx.save(); ctx.globalAlpha *= clamp(ks * 2) * (1 - kd); holerite(ctx, 2080, 640, 0.85, { m: prog(t, tSal + 0.5, 0.6) }); ctx.restore(); }
        const kc = appear(t, tLucro, 0.5);
        if (kc > 0) { ctx.save(); ctx.globalAlpha *= clamp(kc * 2) * (1 - kd); for (let i = 0; i < 7; i++) circle(ctx, 2720 + (i % 3) * 22 - 22, 700 - i * 14, 34, i % 2 ? '#facc15' : '#eab308'); text(ctx, 'lucro', 2720, 780, { size: 26, weight: 900, color: '#fde68a' }); text(ctx, 'imposto sobre o lucro', 2720, 560, { size: 22, weight: 900, color: '#fdba74', alpha: appear(t, tLucro + 0.6, 0.4) }); ctx.restore(); }
        for (const [t0, xs, ys] of [[tSal + 0.8, 2080, 600], [tLucro + 0.8, 2720, 600]]) { const p = ease.inOut(prog(t, t0, 1.0)); if (p > 0 && p < 1) moedaLaranja(ctx, lerp(xs, 2750, p), lerp(ys, 220, p) - Math.sin(Math.PI * p) * 120, 22); }
        chip(ctx, 2750, 360, 'a lista do IBPT soma esse imposto também', '#fdba74', vis(t, tLista, tPorIsso, 0.4, 0.4), { size: 24 });
        if (kd > 0) {
          headline(ctx, 'não medem a mesma coisa', 2400, 470, { size: 60, k: kd, hl: '#7c2d12' });
          chip(ctx, 2050, 620, 'só o imposto em cima da boneca', '#fde68a', appear(t, tNossa, 0.4), { size: 26 });
          chip(ctx, 2750, 620, 'também folha e lucro da cadeia', '#fdba74', appear(t, tNossa + 0.6, 0.4), { size: 26 });
        }
        ctx.restore();
      });
      zone(ctx, cam2, 3700, 4200, () => {
        if (t < tSobra - 0.8) return;
        const k = appear(t, tSobra - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        const kl = appear(t, tSobra + 0.3, 0.5);
        for (let i = 0; i < 6; i++) circle(ctx, 3420 + (i % 2) * 20, 760 - i * 16 - (1 - ease.out(kl)) * 200, 36, i % 2 ? '#facc15' : '#eab308', clamp(kl * 2));
        text(ctx, 'lucro', 3430, 640 - 80, { size: 28, weight: 900, color: '#fde68a', alpha: kl });
        chip(ctx, 3430, 470, 'com risco', '#fca5a5', appear(t, tRisco, 0.4), { size: 28 });
        // a prateleira cheia comprada meses antes; as duas datas; o que sobra vai para a liquidação
        const kp = appear(t, tCompra, 0.5), vaz = ease.inOut(prog(t, tJan, 1.2));
        if (kp > 0) {
          ctx.save(); ctx.globalAlpha *= clamp(kp * 2);
          ctx.fillStyle = '#5b3a24'; for (let r2 = 0; r2 < 3; r2++) ctx.fillRect(3600, 380 + r2 * 150, 520, 14);
          for (let r2 = 0; r2 < 3; r2++) for (let i = 0; i < 6; i++) { const idx = r2 * 6 + i, fica = idx % 5 === 0; if (!fica && vaz > idx / 18) continue; ctx.save(); ctx.translate(3640 + i * 84, 330 + r2 * 150); ctx.scale(0.18, 0.18); caixaBoneca(ctx, 0, 0, 1, t, { cor: ['#db2777', '#7c3aed', '#0891b2'][idx % 3], selo: false }); ctx.restore(); }
          ctx.restore();
          chip(ctx, 3860, 230, 'compra meses antes', '#e9d5ff', vis(t, tCompra, tDia, 0.4, 0.4), { size: 26 });
        }
        calMini(ctx, 4380, 300, 0.8, 'OUTUBRO', 12, '#0891b2', prog(t, tDia + 0.2, 0.6), { a: appear(t, tDia, 0.4), rot: -0.05 });
        calMini(ctx, 4600, 330, 0.8, 'DEZEMBRO', 25, '#b91c1c', prog(t, tNatal + 0.2, 0.6), { a: appear(t, tNatal, 0.4), rot: 0.05 });
        chip(ctx, 4490, 140, 'as duas datas que mais vendem', '#fde68a', vis(t, tAposta, tJan, 0.4, 0.4), { size: 26 });
        const kq = appear(t, tLiq, 0.5);
        if (kq > 0) { ctx.save(); ctx.globalAlpha *= clamp(kq * 2); ctx.fillStyle = '#b91c1c'; ctx.beginPath(); ctx.moveTo(3700, 640); ctx.lineTo(4000, 640); ctx.lineTo(3970, 800); ctx.lineTo(3730, 800); ctx.closePath(); ctx.fill(); for (let i = 0; i < 3; i++) { ctx.save(); ctx.translate(3780 + i * 70, 640 - (1 - ease.out(kq)) * 140); ctx.rotate(i * 0.3 - 0.3); ctx.scale(0.14, 0.14); caixaBoneca(ctx, 0, 0, 1, t, { selo: false }); ctx.restore(); } ctx.restore(); rectStamp(ctx, 3850, 720, 260, 70, 'LIQUIDAÇÃO', '#fde68a', kq, -0.06, 30); }
        const ke = appear(t, tEtq, 0.5);
        if (ke > 0) { ctx.save(); ctx.globalAlpha *= clamp(ke * 2); etiquetaPreco(ctx, 4400, 640, 0.75, 'R$ 100,00', 0.05); ctx.restore(); chip(ctx, 4400, 740, 'o risco também está no preço', '#e9d5ff', ke, { size: 24 }); }
        ctx.restore();
      });
      bokeh(ctx, cam2, t, 13, 9);
    },
    overlay(ctx, t, cam2) {
      // a planificação de papelão encolhe e vira o chão do galpão e da loja
      const kk = 1 - prog(t, 0, 1.5);
      if (kk > 0) {
        ctx.save(); ctx.fillStyle = `rgba(200,162,107,${clamp((kk - 0.45) / 0.55)})`; ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha *= clamp(kk * 1.6); molde(ctx, 960, 540, lerp(0.6, 4.2, ease.in(kk)), 1); ctx.restore();
      }
      // o 39,70% guardado no canto volta para o centro em "Lembra dos quarenta"
      const kv = prog(t, tLembra, 0.9);
      if (kv < 1) cantoLista(ctx, 1);
      if (kv > 0 && kv < 1) { const sx = (2700 - cam2.x) * cam2.z + 960, sy = (210 - cam2.y) * cam2.z + 540, p = ease.inOut(kv); chip(ctx, lerp(190, sx, p), lerp(70, sy, p), 'lista: 39,70%', '#fdba74', 1 - p * 0.5, { size: lerp(22, 30, p) }); }
      source(ctx, 'IBPT (método); Circana (vendas por data)', vis(t, tLista, 99, 0.5, 0.4));
    },
  };
}

// ================================================================ Cena 07: a boneca pela metade do preço (pulou etapas), o selo e o teste da peça pequena
function scene07(K) {
  const tCom = K('Com essa conta na cabeça'), tImag = K('imagina uma boneca igualzinha'), tMet = K('pela metade do preço'), tBanca = K('numa banca na rua'), tMot = K('Pode ter um motivo'), tPulou = K('ela pulou etapas');
  const tTodo = K('Todo brinquedo vendido no Brasil'), tSelo = K('precisa do selo do Inmetro'), tTestes = K('que exige testes de segurança'), tPeca = K('como o da peça pequena'), tEng = K('que a criança pode engolir');
  const tCusta = K('Teste custa'), tPreco = K('e o custo entra no preço'), tQuem = K('Quem pula essa parte'), tImpJ = K('pula o imposto junto'), tBarato = K('consegue vender mais barato'), tErr = K('Isso é tirar camada do jeito errado'), tAntes = K('Antes de olhar o preço'), tOlha = K('olha o selo na caixa');
  const cam = [
    { t: 0, x: 960, y: 470, z: 1.0, dx: 3 }, { t: tMet, x: 1050, y: 480, z: 1.08, d: 1.4 }, { t: tMot, x: 960, y: 560, z: 1.02, d: 1.4, dx: 6 },
    { t: tTodo - 0.3, x: 2400, y: 470, z: 1.0, d: 1.4 }, { t: tPeca, x: 2650, y: 480, z: 1.1, d: 1.4 }, { t: tCusta, x: 2400, y: 500, z: 1.02, d: 1.4 },
    { t: tQuem - 0.3, x: 3800, y: 470, z: 1.0, d: 1.4 }, { t: tErr, x: 3800, y: 340, z: 1.06, d: 1.2 }, { t: tAntes, x: 4100, y: 500, z: 1.1, d: 1.4 },
  ];
  const sfx = [[tCom, 'pop', 0.3], [tImag, 'pop', 0.3], [tMet, 'cash', 0.35], [tBanca, 'whoosh', 0.25], [tMot, 'tick', 0.3], [tPulou, 'apito', 0.3], [tPulou + 0.3, 'whip', 0.3],
    [tTodo - 0.2, 'whoosh', 0.3], [tSelo, 'stamp', 0.45], [tTestes, 'pop', 0.3], [tPeca, 'drop', 0.35], [tEng, 'buzz', 0.3], [tCusta, 'coin', 0.35], [tPreco, 'paper', 0.3],
    [tQuem - 0.2, 'whoosh', 0.3], [tImpJ, 'pop', 0.3], [tBarato, 'cash', 0.35], [tErr, 'tesoura', 0.45], [tErr + 0.4, 'buzz', 0.3], [tAntes, 'whoosh', 0.25], [tOlha, 'ding', 0.4]];
  return {
    accent: '#ef4444', cam, sfx, impacts: [tErr + 0.4], trans: 'push',
    draw(ctx, t, cam2) {
      salaFundo(ctx, cam2, 1.0, 0.4);
      zone(ctx, cam2, 900, 1100, () => {
        if (t > tTodo + 0.6) return;
        const k = vis(t, 0, tTodo, 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        caixaBoneca(ctx, 520, 430, 0.62, t, { etq: 'R$ 100,00', a: appear(t, tImag, 0.5) });
        chip(ctx, 520, 110, 'na loja', '#e9d5ff', appear(t, tImag + 0.3, 0.4), { size: 26 });
        const kb = appear(t, tBanca - 0.6, 0.6);
        banca(ctx, 1300, 520, 0.72, t);
        caixaBoneca(ctx, 1300, 440, 0.55, t, { selo: 'vazio', etq: t > tMet ? 'R$ 50,00' : '', etqCor: '#b91c1c', a: appear(t, tImag + 0.4, 0.5) });
        chip(ctx, 1300, 110, 'igualzinha, pela metade do preço', '#fca5a5', appear(t, tMet, 0.4), { size: 26 });
        chip(ctx, 1300, 170, 'numa banca na rua', '#e2e8f0', kb, { size: 24 });
        // pulou etapas: o trem salta as paradas do teste e do imposto
        const kp = appear(t, tMot, 0.5);
        if (kp > 0) {
          ctx.save(); ctx.globalAlpha *= kp;
          trilho(ctx, 250, 1700, 840);
          [['FÁBRICA', 400, P.fab], ['TESTE', 800, P.voce], ['IMPOSTO', 1150, P.icms], ['BANCA', 1550, '#fca5a5']].forEach(([lb, x, cor], i) => plaquinha(ctx, x, 760, lb, cor, appear(t, tMot + i * 0.2, 0.4), { x: (i === 1 || i === 2) ? prog(t, tPulou + 0.6 + i * 0.3, 0.4) : 0 }));
          const p = ease.inOut(prog(t, tPulou + 0.2, 1.6)), xt = lerp(420, 1500, p), yt = 822 - Math.sin(Math.PI * p) * 230;
          trem(ctx, xt, yt, 0.42, t, { vagao: false, giro: xt / 20 });
          ctx.restore();
          chip(ctx, 960, 560, 'pulou etapas', '#fca5a5', appear(t, tPulou, 0.4), { size: 30 });
        }
        ctx.restore();
      });
      zone(ctx, cam2, 2300, 2700, () => {
        if (t < tTodo - 0.8 || t > tQuem + 0.6) return;
        const k = vis(t, tTodo - 0.3, tQuem, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        chip(ctx, 2400, 110, 'todo brinquedo vendido no Brasil', '#e2e8f0', appear(t, tTodo, 0.4), { size: 28 });
        seloSeguranca(ctx, 2050, 380, 1.6, { k: appear(t, tSelo, 0.6) });
        text(ctx, 'selo obrigatório', 2050, 560, { size: 28, weight: 900, color: '#bbf7d0', alpha: appear(t, tSelo + 0.4, 0.4) });
        chip(ctx, 2050, 630, 'testes de segurança', P.voce, appear(t, tTestes, 0.4), { size: 26 });
        const kc = appear(t, tTestes, 0.5);
        if (kc > 0) {
          ctx.save(); ctx.globalAlpha *= clamp(kc * 2); cilindroTeste(ctx, 2700, 430, 1.15, t, { cai: prog(t, tPeca, 0.9) }); ctx.restore();
          text(ctx, 'a peça pequena', 2700, 640, { size: 28, weight: 900, color: '#fbcfe8', alpha: appear(t, tPeca + 0.4, 0.4) });
          if (t > tEng) { xMark(ctx, 2860, 300, 1.0, '#ef4444', prog(t, tEng, 0.4)); chip(ctx, 2900, 210, 'cabe na boca: reprovada', '#fca5a5', appear(t, tEng + 0.2, 0.4), { size: 24 }); }
        }
        const kq = appear(t, tCusta, 0.5);
        if (kq > 0) {
          const p = ease.inOut(prog(t, tCusta + 0.2, 1.0));
          if (p < 1) moedaLaranja(ctx, lerp(2400, 2400, p), lerp(560, 760, p), 24);
          ctx.save(); ctx.globalAlpha *= clamp(kq * 2); etiquetaPreco(ctx, 2400, 780, 0.6, 'R$ 100,00', 0.04); ctx.restore();
          chip(ctx, 2400, 670, 'teste custa, e entra no preço', '#fde68a', appear(t, tPreco, 0.4), { size: 26 });
        }
        ctx.restore();
      });
      zone(ctx, cam2, 3700, 4200, () => {
        if (t < tQuem - 0.8) return;
        const k = appear(t, tQuem - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        banca(ctx, 3550, 560, 0.62, t);
        caixaBoneca(ctx, 3550, 490, 0.48, t, { selo: 'vazio', etq: 'R$ 50,00', etqCor: '#b91c1c' });
        [[tQuem, 'sem teste', 360], [tImpJ, 'muitas vezes, sem imposto', 430], [tBarato, 'mais barato', 500]].forEach(([tt, s, y]) => chip(ctx, 4050, y, s, '#fca5a5', appear(t, tt, 0.4), { size: 26 }));
        // o jeito errado: a tesoura corta a fita torta, fora das marcas
        const ke = appear(t, tErr, 0.5);
        if (ke > 0) {
          ctx.save(); ctx.globalAlpha *= clamp(ke * 2);
          ctx.save(); ctx.translate(3800, 200); ctx.rotate(-0.05 * ke); fita(ctx, -600, 0, 1200, [{ a: 0, b: 47 }, { a: 47, b: 100, dy: 26 * ke, dx: 14 * ke }], { marcas: 1 }); ctx.restore();
          tesoura(ctx, 3800 - 30, 190, 0.7, 0.5 + 0.5 * Math.sin(prog(t, tErr, 0.5) * 6.28), -1.2);
          ctx.restore();
          xMark(ctx, 4320, 200, 1.0, '#ef4444', prog(t, tErr + 0.4, 0.4));
          chip(ctx, 3800, 300, 'o jeito errado', '#fca5a5', appear(t, tErr + 0.3, 0.4), { size: 30 });
        }
        const ko = appear(t, tAntes + 0.8, 0.5);
        if (ko > 0) {
          caixaBoneca(ctx, 4450, 520, 0.6, t, { etq: 'R$ 100,00', a: clamp(ko * 2), seloK: appear(t, tOlha + 0.2, 0.5) });
          ctx.save(); ctx.globalAlpha *= clamp(ko * 2); lupa(ctx, lerp(4800, 4510, ease.out(prog(t, tOlha, 0.8))), lerp(520, 625, ease.out(prog(t, tOlha, 0.8))), 0.55, 0.7); ctx.restore();
          chip(ctx, 4450, 120, 'olha o selo na caixa', P.voce, appear(t, tOlha, 0.4), { size: 30 });
        }
        ctx.restore();
      });
      bokeh(ctx, cam2, t, 15, 8);
    },
    overlay(ctx, t) { source(ctx, 'Inmetro (Portaria 302/2021)', vis(t, tTodo, tQuem, 0.5, 0.4)); },
  };
}

// ================================================================ Cena 08: o jeito certo (a camada de quem traz e vende; a compra direta; o que dá para afirmar; o risco)
function scene08(K) {
  const tJeito = K('O jeito certo é a camada'), tPed = K('o pedaço de quem traz'), tCompr = K('Comprando direto num site'), tPula = K('você pula os dois'), tLugar = K('e no lugar deles entram'), tFrete = K('o frete e o lucro do site');
  const tImpM = K('O imposto também muda'), tNesse = K('Nesse tipo de compra'), tSo = K('a Receita cobra só o de importação'), tMaio = K('e desde maio ele é zero'), t50 = K('até cinquenta dólares'), tComF = K('já com o frete'), tCad = K('num site cadastrado');
  const tEstado = K('O do estado continua'), tAfirmar = K('É isso que dá para afirmar'), tSai = K('sai o imposto federal'), tFica = K('fica o do estado');
  const tQuanto = K('Quanto sobra no bolso'), tDepende = K('depende do preço do site'), tMostra = K('o site cadastrado mostra'), tCompara = K('compara o total');
  const tRiscoS = K('Só que o risco que o selo'), tSeu = K('passa a ser seu'), tPorq = K('porque o brinquedo que vem direto'), tTeste = K('não passou pelo teste daqui');
  const tCrianca = K('Para criança pequena'), tBoca = K('que põe tudo na boca'), tNaoVale = K('essa camada não vale a pena'), tResto = K('Para o resto, pode valer'), tVesp = K('antes da véspera');
  const cam = [
    { t: 0, x: 960, y: 470, z: 1.0, dz: 0.006 }, { t: tPed, x: 1200, y: 440, z: 1.06, d: 1.4 },
    { t: tCompr - 0.3, x: 2400, y: 500, z: 0.98, d: 1.4 }, { t: tPula, x: 2450, y: 520, z: 1.04, d: 1.4 },
    { t: tImpM - 0.3, x: 3800, y: 470, z: 1.0, d: 1.4 }, { t: tMaio, x: 3700, y: 470, z: 1.08, d: 1.4 }, { t: tAfirmar, x: 3950, y: 470, z: 1.04, d: 1.4 },
    { t: tQuanto - 0.3, x: 5200, y: 470, z: 1.0, d: 1.4 }, { t: tCompara, x: 5200, y: 460, z: 1.08, d: 1.4 },
    { t: tRiscoS - 0.3, x: 6600, y: 470, z: 1.0, d: 1.4 }, { t: tCrianca, x: 6450, y: 480, z: 1.08, d: 1.4 }, { t: tResto, x: 6800, y: 460, z: 1.04, d: 1.6 },
  ];
  const sfx = [[tJeito, 'pop', 0.3], [tJeito + 0.4, 'sparkle', 0.3], [tPed, 'pop', 0.3], [tCompr - 0.2, 'whoosh', 0.3], [tCompr + 0.4, 'tap', 0.4], [tPula, 'whip', 0.35], [tLugar, 'pop', 0.3], [tFrete, 'pop', 0.3],
    [tImpM - 0.2, 'whoosh', 0.3], [tSo, 'tap', 0.35], [tMaio, 'ding', 0.4], [t50, 'pop', 0.3], [tCad, 'ding', 0.3], [tEstado, 'pop', 0.3], [tSai, 'drop', 0.35], [tFica, 'stamp', 0.4],
    [tQuanto - 0.2, 'whoosh', 0.3], [tDepende, 'tick', 0.3], [tMostra, 'tap', 0.4], [tCompara, 'whoosh', 0.25],
    [tRiscoS - 0.2, 'whoosh', 0.3], [tTeste, 'buzz', 0.3], [tCrianca, 'pop', 0.3], [tBoca, 'clink', 0.25], [tNaoVale, 'buzz', 0.35], [tResto, 'pop', 0.3], [tVesp, 'ding', 0.35]];
  return {
    accent: P.voce, cam, sfx, impacts: [tMaio], trans: 'push',
    draw(ctx, t, cam2) {
      salaFundo(ctx, cam2, 0.95);
      zone(ctx, cam2, 900, 1200, () => {
        if (t > tCompr + 0.6) return;
        const k = vis(t, 0, tCompr, 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        arvore(ctx, 430, 520, 0.72, t);
        presente(ctx, 1150, 680, 0.9, t, { tampa: 1, janela: 1, etq: 'R$ 100,00' });
        camadas(ctx, 1150, 660, 0.9, 1, { dest: 1, destK: appear(t, tJeito + 0.3, 0.5), t, cor: P.aqui });
        headline(ctx, 'o jeito certo', 1150, 110, { size: 62, k: appear(t, tJeito, 0.5), hl: '#14532d' });
        const kp = appear(t, tPed, 0.5);
        fita(ctx, 1300, 300, 600, [{ a: 0, b: 100, cor: P.aqui, k: 1 }], { a: kp, semPontas: true });
        rotuloFita(ctx, 1600, 400, 'R$ 47,88', 'de quem traz e de quem vende', '#d8b4fe', kp, { exemplo: true });
        ctx.restore();
      });
      zone(ctx, cam2, 2300, 2700, () => {
        if (t < tCompr - 0.8 || t > tImpM + 0.6) return;
        const k = vis(t, tCompr - 0.3, tImpM, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        trilho(ctx, 1500, 3400, 800);
        const kx = prog(t, tPula + 0.6, 0.4);
        [['FÁBRICA', 1700, P.fab], ['PORTO', 2050, P.sky], ['IMPORTADOR', 2450, P.aqui], ['LOJA', 2850, P.aqui], ['ÁRVORE', 3220, P.gold]].forEach(([lb, x, cor], i) => plaquinha(ctx, x, 700, lb, cor, 1, { x: i === 2 || i === 3 ? kx : 0 }));
        celular(ctx, 2000, 330, 0.55, (c) => { c.fillStyle = '#0f172a'; c.fillRect(-170, -350, 340, 90); text(c, 'site de fora', 0, -300, { size: 34, weight: 900, color: '#ffffff' }); c.save(); c.translate(0, 0); c.scale(0.9, 0.9); boneca(c, 0, 20, 0.9, t); c.restore(); fillRR(c, -120, 230, 240, 70, 35, '#16a34a'); text(c, 'comprar', 0, 266, { size: 32, weight: 900, color: '#ffffff' }); }, { a: appear(t, tCompr, 0.5), rot: -0.05 });
        // o desvio: do porto direto para a árvore, pulando importador e loja
        const p = ease.inOut(prog(t, tPula, 1.6));
        if (p > 0) {
          ctx.save(); ctx.strokeStyle = '#86efac'; ctx.lineWidth = 7; ctx.setLineDash([18, 14]); ctx.beginPath();
          const n = 40; for (let i = 0; i <= n * p; i++) { const q = i / n, xx = lerp(2050, 3220, q), yy = 640 - Math.sin(Math.PI * q) * 330; i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke(); ctx.restore();
          const xx = lerp(2050, 3220, p), yy = 640 - Math.sin(Math.PI * p) * 330; ctx.save(); ctx.translate(xx, yy); ctx.scale(0.13, 0.13); caixaBoneca(ctx, 0, 0, 1, t, { selo: 'vazio' }); ctx.restore();
        }
        chip(ctx, 2640, 220, 'você pula os dois', '#86efac', appear(t, tPula, 0.4), { size: 28 });
        chip(ctx, 2900, 420, 'frete', '#cbd5e1', appear(t, tFrete, 0.4), { size: 24 }); chip(ctx, 3080, 420, 'lucro do site', '#cbd5e1', appear(t, tFrete + 0.4, 0.4), { size: 24 });
        chip(ctx, 2990, 340, 'no lugar deles', '#e2e8f0', appear(t, tLugar, 0.4), { size: 22 });
        ctx.restore();
      });
      zone(ctx, cam2, 3700, 4100, () => {
        if (t < tImpM - 0.8 || t > tQuanto + 0.6) return;
        const k = vis(t, tImpM - 0.3, tQuanto, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        headline(ctx, 'o imposto também muda', 3800, 110, { size: 56, k: vis(t, tImpM, tNesse + 1, 0.5, 0.4), hl: '#14532d' });
        const kz = appear(t, tMaio + 0.2, 0.5), ke = appear(t, tEstado, 0.5);
        celular(ctx, 3500, 480, 0.88, (c) => {
          c.fillStyle = '#0f172a'; c.fillRect(-170, -350, 340, 90); text(c, 'carrinho', 0, -300, { size: 34, weight: 900, color: '#ffffff' });
          const linha = (y, a, b, cor, al = 1) => { c.save(); c.globalAlpha *= al; text(c, a, -150, y, { size: 27, weight: 800, color: '#334155', align: 'left' }); text(c, b, 150, y, { size: 29, weight: 900, color: cor || '#0f172a', align: 'right' }); c.fillStyle = '#e2e8f0'; c.fillRect(-150, y + 24, 300, 2); c.restore(); };
          linha(-220, 'boneca', 'produto', '#64748b'); linha(-160, 'frete', 'no limite', '#64748b');
          linha(-90, 'importação', 'R$ 0,00', '#16a34a', appear(t, tSo, 0.4));
          if (kz > 0) { c.save(); c.globalAlpha *= kz; fillRR(c, -160, -118, 320, 56, 10, 'rgba(34,197,94,0.15)'); c.restore(); }
          linha(-20, 'ICMS (estado)', 'cobrado', '#b45309', ke);
          if (appear(t, tCad, 0.4) > 0) { c.save(); c.globalAlpha *= appear(t, tCad, 0.4); fillRR(c, -150, 60, 300, 60, 30, '#dcfce7'); text(c, 'site cadastrado', 10, 91, { size: 24, weight: 900, color: '#166534' }); check(c, -110, 91, 0.45, '#16a34a', prog(t, tCad + 0.2, 0.4)); c.restore(); }
        });
        chip(ctx, 4200, 230, 'Receita: só o imposto de importação', '#fca5a5', vis(t, tSo, tAfirmar, 0.4, 0.4), { size: 24 });
        bigNum(ctx, 'R$ 0', 4200, 360, vis(t, tMaio, tAfirmar, 0.5, 0.4), { size: 100, color: '#86efac' });
        chip(ctx, 4200, 470, 'até US$ 50', '#86efac', vis(t, t50, tAfirmar, 0.4, 0.4), { size: 30 });
        chip(ctx, 4200, 535, 'já com o frete', '#86efac', vis(t, tComF, tAfirmar, 0.4, 0.4), { size: 24 });
        chip(ctx, 4200, 640, 'o do estado continua', '#fdba74', vis(t, tEstado, tAfirmar, 0.4, 0.4), { size: 26 });
        // o que dá para afirmar
        const ka = appear(t, tAfirmar, 0.5);
        if (ka > 0) {
          ctx.save(); ctx.globalAlpha *= clamp(ka * 2);
          fillRR(ctx, 3960, 300, 520, 300, 22, 'rgba(15,23,42,0.88)'); strokeRR(ctx, 3960, 300, 520, 300, 22, '#e2e8f0', 3);
          text(ctx, 'o que dá para afirmar', 4220, 345, { size: 26, weight: 900, color: '#e2e8f0' });
          const ks = appear(t, tSai, 0.4), kf = appear(t, tFica, 0.4);
          text(ctx, 'federal da alfândega', 4000, 430, { size: 30, weight: 900, color: '#fca5a5', align: 'left', alpha: ks }); text(ctx, 'sai', 4440, 430, { size: 34, weight: 900, color: '#fca5a5', align: 'right', alpha: ks });
          if (ks > 0) crossOut(ctx, 4000, 432, 4310, 432, '#fca5a5', prog(t, tSai + 0.4, 0.4), 5);
          text(ctx, 'imposto do estado', 4000, 520, { size: 30, weight: 900, color: '#fdba74', align: 'left', alpha: kf }); text(ctx, 'fica', 4440, 520, { size: 34, weight: 900, color: '#fdba74', align: 'right', alpha: kf });
          ctx.restore();
        }
        ctx.restore();
      });
      zone(ctx, cam2, 5100, 5300, () => {
        if (t < tQuanto - 0.8 || t > tRiscoS + 0.6) return;
        const k = vis(t, tQuanto - 0.3, tRiscoS, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        headline(ctx, 'quanto sobra no bolso?', 5200, 110, { size: 56, k: appear(t, tQuanto, 0.5), hl: '#334155' });
        chip(ctx, 5200, 200, 'depende do preço do site', '#e2e8f0', appear(t, tDepende, 0.4), { size: 28 });
        celular(ctx, 4880, 520, 0.72, (c) => {
          c.fillStyle = '#0f172a'; c.fillRect(-170, -350, 340, 90); text(c, 'pagamento', 0, -300, { size: 34, weight: 900, color: '#ffffff' });
          text(c, 'impostos', -150, -190, { size: 26, weight: 800, color: '#334155', align: 'left' }); text(c, 'mostrados', 150, -190, { size: 26, weight: 900, color: '#16a34a', align: 'right' });
          text(c, 'antes de pagar', -150, -150, { size: 22, weight: 800, color: '#64748b', align: 'left' });
          c.fillStyle = '#e2e8f0'; c.fillRect(-150, -110, 300, 2);
          text(c, 'TOTAL', -150, -50, { size: 34, weight: 900, color: '#0f172a', align: 'left' }); text(c, 'R$ ?', 150, -50, { size: 40, weight: 900, color: '#0f172a', align: 'right' });
          fillRR(c, -120, 160, 240, 70, 35, '#16a34a'); text(c, 'pagar', 0, 196, { size: 32, weight: 900, color: '#ffffff' });
        }, { a: appear(t, tQuanto + 0.6, 0.5), rot: -0.04 });
        chip(ctx, 4880, 740, 'o site cadastrado mostra o imposto', '#86efac', appear(t, tMostra, 0.4), { size: 24 });
        const kc = appear(t, tCompara, 0.5);
        if (kc > 0) { ctx.save(); ctx.globalAlpha *= clamp(kc * 2); etiquetaPreco(ctx, 5600, 470, 0.85, 'R$ 100,00', 0.05); ctx.restore(); text(ctx, '⇄', 5240, 470, { size: 90, weight: 900, color: '#e2e8f0', alpha: kc }); chip(ctx, 5600, 600, 'a etiqueta da loja', '#e9d5ff', kc, { size: 24 }); }
        ctx.restore();
      });
      zone(ctx, cam2, 6500, 6900, () => {
        if (t < tRiscoS - 0.8) return;
        const k = appear(t, tRiscoS - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        const kr = vis(t, tRiscoS, tCrianca, 0.5, 0.5);
        if (kr > 0) { ctx.save(); ctx.globalAlpha *= kr; caixaBoneca(ctx, 6200, 470, 0.78, t, { selo: 'vazio' }); cilindroTeste(ctx, 6950, 470, 1.1, t, { cai: prog(t, tTeste, 0.9) }); const kv2 = appear(t, tSeu, 0.5); pessoa(ctx, 6580, 600, 1.5, '#86efac', kv2); chip(ctx, 6580, 420, 'você', '#86efac', kv2, { size: 28 }); text(ctx, '?', 6950, 250, { size: 110, weight: 900, color: '#fde68a', alpha: appear(t, tTeste + 0.8, 0.4) }); ctx.restore(); }
        chip(ctx, 6600, 120, 'o risco que o selo evitaria passa a ser seu', '#fde68a', vis(t, tSeu, tCrianca, 0.4, 0.4), { size: 28 });
        chip(ctx, 6950, 700, 'muitas vezes não passou pelo teste daqui', '#fca5a5', vis(t, tTeste, tCrianca, 0.4, 0.4), { size: 24 });
        const kb = vis(t, tCrianca, tResto, 0.5, 0.5);
        if (kb > 0) { ctx.save(); ctx.globalAlpha *= kb; chocalho(ctx, 6350, 480, 1.0, t); sinalProibido(ctx, 6350, 440, 210, prog(t, tNaoVale, 0.5)); ctx.restore(); chip(ctx, 6350, 760, 'criança pequena põe tudo na boca', '#fbcfe8', kb, { size: 26 }); }
        chip(ctx, 6600, 120, 'para criança pequena, não vale', '#fca5a5', vis(t, tNaoVale, tResto, 0.4, 0.4), { size: 30 });
        const kv = appear(t, tResto, 0.5);
        if (kv > 0) { const kg = appear(t, tVesp + 0.6, 0.8); arvore(ctx, 6420, 560, 0.4, t, { a: kg }); presente(ctx, lerp(6800, 6540, ease.out(kg)), 700, 0.36, t, { a: kg }); calMini(ctx, 6850, 420, 1.0, 'DEZEMBRO', 24, '#b91c1c', prog(t, tVesp + 0.2, 0.6), { a: clamp(kv * 2), rot: 0.04 }); chip(ctx, 6850, 640, 'faça a conta antes da véspera', '#86efac', appear(t, tVesp, 0.4), { size: 26 }); chip(ctx, 6850, 150, 'para o resto, pode valer', '#86efac', kv, { size: 30 }); }
        ctx.restore();
      });
      bokeh(ctx, cam2, t, 17, 9);
    },
    overlay(ctx, t) { source(ctx, 'Receita Federal (Remessa Conforme)', vis(t, tNesse, tQuanto, 0.5, 0.4)); },
  };
}

// ================================================================ Cena 09: fechamento (a fita inteira, o videogame sai, a etiqueta de presente da inscrição, a estrada e o pórtico)
function scene09(K) {
  const tEntao = K('Então, quando você olhar'), tCem = K('dos cem reais'), t32 = K('uns trinta e dois foram de imposto'), tMaior = K('a maior parte para o estado'), tResto = K('O resto pagou a fábrica'), tTrouxe = K('quem trouxe e vendeu');
  const tFrase = K('A frase famosa é de videogame'), tSe = K('Se esse vídeo te ajudou'), tInsc = K('se inscreve no canal'), tProx = K('No próximo, a gente sai da sala'), tEstr = K('pega a estrada do fim de ano');
  const tTem = K('Tem pedágio que não tem mais cancela'), tMulta = K('quem esquece de pagar leva multa'), tPassa = K('A gente passa pelo pórtico'), tCada = K('mostra quem fica com cada real');
  const tPress = tInsc + 0.4;
  const cam = [
    { t: 0, x: 960, y: 470, z: 1.0, dz: 0.005 }, { t: t32, x: 960, y: 450, z: 1.04, d: 1.4 }, { t: tFrase, x: 1150, y: 470, z: 1.02, d: 1.4 },
    { t: tSe - 0.3, x: 2400, y: 470, z: 1.0, d: 1.4 }, { t: tInsc, x: 2400, y: 450, z: 1.1, d: 1.0 },
    { t: tProx - 0.3, x: 3800, y: 480, z: 1.0, d: 1.6, dx: 4 }, { t: tTem, x: 4050, y: 470, z: 1.08, d: 1.6 }, { t: tPassa, x: 4050, y: 460, z: 1.04, d: 2.4, dz: 0.003 },
  ];
  const sfx = [[tEntao, 'pop', 0.3], [tCem, 'paper', 0.3], [t32, 'ding', 0.35], [tMaior, 'pop', 0.3], [tResto, 'pop', 0.3], [tTrouxe, 'pop', 0.25], [tFrase, 'whoosh', 0.3],
    [tSe - 0.2, 'whoosh', 0.3], [tPress, 'tear', 0.35], [tPress + 0.2, 'flip', 0.35, { dur: 0.5 }], [tPress + 0.8, 'ding', 0.45], [tPress + 0.9, 'sparkle', 0.35],
    [tProx - 0.2, 'whoosh', 0.3], [tProx + 0.3, 'apito', 0.35], [tEstr, 'truck', 0.25], [tTem, 'beep', 0.3], [tMulta, 'paper', 0.4], [tMulta + 0.5, 'stamp', 0.4], [tCada, 'coin', 0.4]];
  return {
    accent: P.gold, cam, sfx, impacts: [tPress + 0.8], trans: 'push',
    draw(ctx, t, cam2) {
      salaFundo(ctx, cam2, 0.95);
      zone(ctx, cam2, 900, 1200, () => {
        if (t > tSe + 0.6) return;
        const k = vis(t, 0, tSe, 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        arvore(ctx, 300, 540, 0.72, t);
        presente(ctx, 1150, 700, 0.8, t, { tampa: 0, etq: 'R$ 100,00' });
        chip(ctx, 1150, 120, 'lembra:', '#fde68a', vis(t, tEntao + 0.6, tCem + 0.4, 0.4, 0.4), { size: 32 });
        const x0 = 520, w = 1300, y = 300, k3 = appear(t, t32, 0.5), kr = appear(t, tResto, 0.5);
        fita(ctx, x0, y, w, [
          { a: 0, b: B1, cor: P.fab, k: 1, gapB: 1, brilho: kr * vis(t, tResto, tFrase, 0.3, 0.3) },
          { a: B1, b: B4, cor: P.fed, k: 1, gapA: 1, gapB: 1, brilho: k3 * (1 - kr) },
          { a: B4, b: B5, cor: P.icms, k: 1, gapA: 1, gapB: 1, brilho: Math.max(k3 * (1 - kr), vis(t, tMaior, tResto, 0.3, 0.3)) },
          { a: B5, b: 100, cor: P.aqui, k: 1, gapA: 1, brilho: vis(t, tTrouxe, tFrase, 0.3, 0.3) },
        ], { a: appear(t, tCem, 0.5) });
        rotuloFita(ctx, fitaX(x0, w, (B1 + B5) / 2), y - 100, 'R$ 32,12', 'impostos em cima da boneca', '#fdba74', k3 * (1 - kr), { size: 54 });
        chip(ctx, fitaX(x0, w, (B4 + B5) / 2), y + 80, 'estado: R$ 18,00', '#fde68a', vis(t, tMaior, tResto, 0.4, 0.4), { size: 26 });
        rotuloFita(ctx, fitaX(x0, w, B1 / 2), y - 100, 'R$ 20,00', 'fábrica + navio', '#86efac', kr, { size: 40 });
        rotuloFita(ctx, fitaX(x0, w, 76), y - 100, 'R$ 47,88', 'quem trouxe e vendeu', '#d8b4fe', appear(t, tTrouxe, 0.4), { size: 40 });
        const kv = appear(t, tFrase, 0.5);
        if (kv > 0) { const sai = ease.in(prog(t, tFrase + 1.4, 1.2)); console_(ctx, 1500 + sai * 900, 560, 0.6, { a: clamp(kv * 2) * (1 - sai), rot: sai * 0.3 }); chip(ctx, 1500 + sai * 900, 440, 'a frase dos 70% é do videogame', '#fca5a5', kv * (1 - sai), { size: 24 }); }
        ctx.restore();
      });
      zone(ctx, cam2, 2300, 2500, () => {
        if (t < tSe - 0.8 || t > tProx + 0.6) return;
        const k = vis(t, tSe - 0.3, tProx, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        presente(ctx, 2400, 760, 0.62, t, { laco: prog(t, tPress, 0.6), semFita: t > tPress + 0.7 });
        tagPresente(ctx, 2400, 400, 1.0, t, ease.inOut(prog(t, tPress + 0.1, 0.7)));
        sparks(ctx, t, tPress + 0.8, 2400, 400, P.voce, 22);
        chip(ctx, 2400, 120, 'te ajudou a entender o preço do presente?', '#e2e8f0', appear(t, tSe, 0.4), { size: 28 });
        ctx.restore();
      });
      zone(ctx, cam2, 3700, 4200, () => {
        if (t < tProx - 0.8) return;
        const k = appear(t, tProx - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        trilho(ctx, 3000, 3700, 820);
        plaquinha(ctx, 3550, 720, 'ESTRADA', '#fde68a', appear(t, tProx, 0.5));
        const xt = lerp(3000, 3420, ease.out(prog(t, tProx + 0.2, 2.2)));
        trem(ctx, xt, 802, 0.5, t, { giro: xt / 20 });
        // a janela da sala vira a estrada à noite
        const kj = appear(t, tEstr, 0.8);
        if (kj > 0) {
          ctx.save(); ctx.globalAlpha *= clamp(kj * 2);
          ctx.save(); rr(ctx, 3720, 130, 760, 560, 16); ctx.clip(); estradaNoite(ctx, 4100, 410, 760, 560, t);
          const kp = appear(t, tTem, 0.6); if (kp > 0) { ctx.save(); ctx.globalAlpha *= clamp(kp * 2); portico(ctx, 4100, 420, 0.62 * lerp(0.8, 1, ease.out(kp)), t); ctx.restore(); }
          ctx.restore();
          strokeRR(ctx, 3720, 130, 760, 560, 16, '#3f2818', 18);
          ctx.restore();
        }
        envelopeMulta(ctx, lerp(4700, 4550, ease.out(prog(t, tMulta, 0.6))), 640, 0.6, appear(t, tMulta, 0.5), -0.12);
        chip(ctx, 4100, 760, 'quem esquece de pagar leva multa', '#fca5a5', appear(t, tMulta + 0.3, 0.4), { size: 24 });
        chip(ctx, 4100, 70 + 40, 'próximo vídeo: o pedágio sem cancela', P.amber, appear(t, tPassa, 0.4), { size: 28 });
        chip(ctx, 4100, 230 - 60, 'quem fica com cada real', '#e2e8f0', appear(t, tCada, 0.4), { size: 24 });
        ctx.restore();
      });
      bokeh(ctx, cam2, t, 19, 9);
    },
    overlay(ctx, t) {},
  };
}

export const SCENES = [
  { id: '01', name: 'a-caixa-e-a-frase', build: scene01 },
  { id: '02', name: 'a-lista', build: scene02 },
  { id: '03', name: 'fabrica-navio-e-porto', build: scene03 },
  { id: '04', name: 'importador-e-federais', build: scene04 },
  { id: '05', name: 'icms-e-a-virada', build: scene05 },
  { id: '06', name: 'para-onde-vai-o-pedaco', build: scene06 },
  { id: '07', name: 'a-banca', build: scene07 },
  { id: '08', name: 'o-jeito-certo', build: scene08 },
  { id: '09', name: 'fechamento', build: scene09 },
];
