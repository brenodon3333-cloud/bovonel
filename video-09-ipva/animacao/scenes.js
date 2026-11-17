// Vídeo 09: IPVA 2027, quem fica com cada real do boleto.
// Cada cena recebe K(frase) = instante (s, relativo à cena) em que a frase começa na narração.
// Conceito: a garagem de casa à noite é o palco e a guia do IPVA 2027 é o fio condutor.
// Regras: câmera sempre andando, nenhum trecho de mais de ~6 s sem algo novo, transições discretas (corte ou 'push'),
// uma só virada de efeito (a etiqueta da tabela descola na cena 5), sem música, checagem de silhueta.
// Aprendizados de referências (referencias-aprendizados.md): o vídeo abre já na guia com "40 · 40 · 20" (funciona sem som),
// a pergunta do buraco é plantada na cena 1 e paga na cena 7, a virada fica perto do meio.
import { W, H, C, clamp, lerp, prog, ease, appear, text, font, rr, fillRR, strokeRR, circle, hexA, source, iconBank } from './lib.js';
import { glowText, counting, shockRing, sparks, layer } from './fx.js';

// cores fixas por destino do dinheiro: estado laranja (cor do canal para o estado), prefeitura roxo, escolas azul-claro
const P = {
  estado: '#f59e0b', pref: '#a855f7', escola: '#38bdf8', voce: '#4ade80', juros: '#f43f5e', hist: '#e7d7b0',
  ink: '#1f2937', paper: '#fbfaf5', red: '#dc2626', ok: '#22c55e', amber: '#fbbf24', sky: '#38bdf8', azul: '#1e3a8a',
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

// ================================================================ cenário: garagem de casa à noite (fundo com paralaxe e desfoque)
// parede de bloco de concreto, painel de ferramentas, prateleira com latas, lâmpada tubular, janelinha com poste de rua, piso de cimento.
let GARAGE = null;
function garagemFundo(ctx, cam, a = 1, escuro = 0) {
  if (!GARAGE) {
    const Wd = 2600, Hd = 1400, r = rng(91);
    const c = document.createElement('canvas'); c.width = Wd; c.height = Hd; const g = c.getContext('2d');
    g.fillStyle = '#4a5160'; g.fillRect(0, 0, Wd, Hd);
    for (let y = 0; y < 900; y += 50) for (let x = ((y / 50) % 2) * 60 - 60; x < Wd; x += 120) { g.fillStyle = r() > 0.5 ? '#565e6e' : '#525a69'; g.fillRect(x + 3, y + 3, 114, 44); }
    // lâmpada tubular acesa no alto, com o brilho na parede
    const lg = g.createRadialGradient(1300, 90, 20, 1300, 90, 900); lg.addColorStop(0, 'rgba(220,240,255,0.35)'); lg.addColorStop(1, 'rgba(220,240,255,0)'); g.fillStyle = lg; g.fillRect(0, 0, Wd, 900);
    g.fillStyle = '#e8f6ff'; g.fillRect(1050, 70, 500, 22); g.fillStyle = '#2b3140'; g.fillRect(1030, 60, 540, 8);
    // painel perfurado com ferramentas (chave inglesa, martelo, serrote, alicate)
    g.fillStyle = '#8b6e4e'; g.fillRect(260, 220, 560, 380);
    g.fillStyle = 'rgba(0,0,0,0.25)'; for (let y = 240; y < 590; y += 26) for (let x = 280; x < 810; x += 26) { g.beginPath(); g.arc(x, y, 3, 0, 6.283); g.fill(); }
    g.fillStyle = '#9ca3af'; g.fillRect(320, 280, 26, 200); g.beginPath(); g.arc(333, 280, 30, 0, 6.283); g.fill(); g.fillStyle = '#8b6e4e'; g.fillRect(323, 248, 20, 30); // chave
    g.fillStyle = '#7c2d12'; g.fillRect(420, 300, 22, 220); g.fillStyle = '#6b7280'; g.fillRect(390, 280, 82, 34); // martelo
    g.fillStyle = '#d1d5db'; g.beginPath(); g.moveTo(520, 280); g.lineTo(700, 300); g.lineTo(700, 360); g.lineTo(520, 330); g.closePath(); g.fill(); g.fillStyle = '#92400e'; g.fillRect(480, 270, 50, 70); // serrote
    g.fillStyle = '#dc2626'; g.fillRect(590, 420, 16, 120); g.fillRect(620, 420, 16, 120); g.fillStyle = '#6b7280'; g.fillRect(595, 380, 36, 46); // alicate
    // prateleira de aço com latas de tinta e caixas
    g.fillStyle = '#374151'; g.fillRect(1700, 300, 640, 12); g.fillRect(1700, 520, 640, 12); g.fillRect(1700, 300, 10, 560); g.fillRect(2330, 300, 10, 560);
    for (let i = 0; i < 6; i++) { const x = 1730 + i * 98; g.fillStyle = ['#2563eb', '#e5e7eb', '#ca8a04', '#dc2626', '#16a34a', '#e5e7eb'][i]; g.fillRect(x, 220, 70, 80); g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(x, 220, 70, 10); }
    for (let i = 0; i < 4; i++) { g.fillStyle = '#b08a55'; g.fillRect(1730 + i * 150, 420, 120, 100); g.fillStyle = 'rgba(0,0,0,0.2)'; g.fillRect(1730 + i * 150 + 55, 420, 10, 100); }
    // janelinha alta com a rua à noite e o poste
    g.fillStyle = '#1f2533'; g.fillRect(960, 200, 260, 170); const ng = g.createLinearGradient(0, 210, 0, 360); ng.addColorStop(0, '#0f1e3d'); ng.addColorStop(1, '#253a63'); g.fillStyle = ng; g.fillRect(975, 212, 230, 146);
    const pg = g.createRadialGradient(1150, 240, 2, 1150, 240, 70); pg.addColorStop(0, 'rgba(255,214,140,0.95)'); pg.addColorStop(1, 'rgba(255,214,140,0)'); g.fillStyle = pg; g.fillRect(975, 212, 230, 146);
    g.fillStyle = '#1f2533'; g.fillRect(1085, 212, 10, 146);
    // pneus empilhados no canto
    for (let i = 0; i < 3; i++) { g.fillStyle = '#111318'; g.beginPath(); g.ellipse(2480, 860 - i * 60, 110, 34, 0, 0, 6.283); g.fill(); g.fillStyle = '#2a2d35'; g.beginPath(); g.ellipse(2480, 860 - i * 60, 50, 14, 0, 0, 6.283); g.fill(); }
    // piso de cimento com mancha de óleo
    const fl = g.createLinearGradient(0, 900, 0, Hd); fl.addColorStop(0, '#7b7f87'); fl.addColorStop(1, '#3b3e45'); g.fillStyle = fl; g.fillRect(0, 900, Wd, Hd - 900);
    g.fillStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); g.ellipse(1300, 1080, 260, 60, 0, 0, 6.283); g.fill();
    g.strokeStyle = 'rgba(0,0,0,0.18)'; g.lineWidth = 3; for (let x = 0; x < Wd; x += 300) { g.beginPath(); g.moveTo(x, 900); g.lineTo(x - 120, Hd); g.stroke(); }
    g.fillStyle = 'rgba(220,240,255,0.10)'; g.fillRect(0, 900, Wd, 8);
    const tmp = document.createElement('canvas'); tmp.width = Wd; tmp.height = Hd; const t2 = tmp.getContext('2d');
    t2.filter = 'blur(12px)'; for (const dx of [-Wd, 0, Wd]) t2.drawImage(c, dx, 0); GARAGE = tmp;
  }
  layer(ctx, cam, 0.35, () => {
    ctx.save(); ctx.globalAlpha *= a;
    const cx = cam.x - (cam.x - 960) * 0.65, k0 = Math.floor((cx - 1500 + 340) / 2600), k1 = Math.floor((cx + 1500 + 340) / 2600);
    for (let k = k0; k <= k1; k++) ctx.drawImage(GARAGE, -340 + k * 2600, -160);
    ctx.fillStyle = `rgba(6,10,20,${0.55 + 0.25 * escuro})`; ctx.fillRect(-340 + k0 * 2600, -160, (k1 - k0 + 1) * 2600, 1400);
    ctx.restore();
  });
}
// poeira iluminada pela lâmpada, perto da câmera (camada da frente)
function poeiraLuz(ctx, cam, t, seed = 1, n = 9, a = 0.10) {
  const r = rng(seed);
  layer(ctx, cam, 1.45, () => {
    for (let i = 0; i < n; i++) {
      const x = r() * 2600 - 340 + cam.x - 960, y = r() * 1100 - 100, rad = 24 + r() * 60, ph = r() * 6.28;
      const g = ctx.createRadialGradient(x, y + Math.sin(t * 0.3 + ph) * 12, 0, x, y, rad);
      g.addColorStop(0, hexA('#dbeafe', a * (0.55 + 0.45 * Math.sin(t * 0.7 + ph)))); g.addColorStop(1, hexA('#dbeafe', 0));
      ctx.fillStyle = g; ctx.fillRect(x - rad, y - rad - 14, rad * 2, rad * 2 + 28);
    }
  });
}

// ================================================================ a guia do IPVA 2027 (layout de guia de pagamento de verdade)
// o: { bar: 0..1 faixa aparecendo, split: 0 = 50/50 (estado | prefeitura), 1 = 40/40/20 (estado | prefeitura | escolas),
//      nums (mostra os números dentro das fatias), campos: 0..1, valor (texto do imposto), semCarimbo, a, rot, key }
function guiaIPVA(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.02); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  drawDoc(ctx, 'guia' + (o.key || ''), 1100, 640, (ctx) => {
    const Wd = 1100, Hd = 640, L = -Wd / 2, T = -Hd / 2, ink = P.ink;
    ctx.save(); papelSombra(ctx); ctx.fillStyle = '#ffffff'; ctx.fillRect(L, T, Wd, Hd); ctx.restore();
    const rp = rng(5); ctx.fillStyle = 'rgba(120,110,80,0.05)'; for (let i = 0; i < 80; i++) ctx.fillRect(L + rp() * Wd, T + rp() * Hd, 1 + rp() * 40, 1);
    ctx.strokeStyle = ink; ctx.lineWidth = 2.5; ctx.strokeRect(L + 20, T + 20, Wd - 40, Hd - 40);
    text(ctx, 'SECRETARIA DA FAZENDA', L + 44, T + 52, { size: 20, weight: 900, color: '#6b7280', align: 'left', letter: 2 });
    text(ctx, 'IPVA 2027 · GUIA DE PAGAMENTO', L + 44, T + 92, { size: 38, weight: 900, color: ink, align: 'left' });
    text(ctx, 'COTA ÚNICA', -L - 44, T + 52, { size: 20, weight: 900, color: '#6b7280', align: 'right' });
    const kc = clamp(o.campos ?? 1);
    const campos = [['PLACA', 'ABC1D23'], ['RENAVAM', '01234567890'], ['VEÍCULO', 'HATCH 1.0 · 2026'], ['VALOR VENAL', o.venal || 'R$ 81.000,00'], ['ALÍQUOTA', o.aliq || '4%']];
    let cx = L + 44;
    campos.forEach(([lab, v], i) => {
      const w = [150, 210, 260, 200, 120][i];
      ctx.save(); ctx.globalAlpha *= clamp(kc * 5 - i);
      ctx.strokeStyle = 'rgba(31,41,55,0.4)'; ctx.lineWidth = 1.5; ctx.strokeRect(cx, T + 122, w - 8, 66);
      text(ctx, lab, cx + 8, T + 140, { size: 14, weight: 900, color: '#6b7280', align: 'left' });
      mono(ctx, v, cx + 8, T + 168, 19, ink, 'left', 800);
      ctx.restore(); cx += w;
    });
    text(ctx, 'VALOR A PAGAR', -L - 44, T + 222, { size: 18, weight: 900, color: '#6b7280', align: 'right' });
    if (o.valor) mono(ctx, o.valor, -L - 44, T + 256, 36, '#111827', 'right', 900);
    // a faixa "para onde vai" (mesmo layout das guias que mostram a repartição)
    text(ctx, 'DESTINO DO IMPOSTO', L + 44, T + 236, { size: 18, weight: 900, color: '#6b7280', align: 'left', alpha: clamp(o.bar ?? 1) });
    const kb = ease.out(clamp(o.bar ?? 1));
    if (kb > 0) {
      const bx = L + 44, bw = (Wd - 88) * kb, by = T + 290, bh = 150, sp = ease.inOut(clamp(o.split || 0));
      const fat = [[lerp(0.5, 0.4, sp), P.estado, 'ESTADO'], [lerp(0.5, 0.4, sp), P.pref, 'PREFEITURA'], [lerp(0, 0.2, sp), P.escola, 'ESCOLAS']];
      let fx = bx;
      for (const [v, cor, lab] of fat) {
        const w = bw * v; if (w < 2) { fx += w; continue; }
        ctx.fillStyle = cor; ctx.fillRect(fx, by, w - 6, bh);
        if (o.nums !== false && kb > 0.95 && w > 60) {
          const n = String(Math.round(v * 100));
          ctx.save(); ctx.font = font(96, 900); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = 12; ctx.strokeStyle = '#05070d'; ctx.strokeText(n, fx + w / 2 - 3, by + bh / 2 - 6); ctx.fillStyle = '#ffffff'; ctx.fillText(n, fx + w / 2 - 3, by + bh / 2 - 6); ctx.restore();
          text(ctx, lab, fx + w / 2 - 3, by + bh + 22, { size: 18, weight: 900, color: ink });
        }
        fx += w;
      }
    }
    const rb = rng(27); let xx = L + 44; ctx.fillStyle = '#111827';
    while (xx < -L - 44) { const w = 1 + Math.floor(rb() * 3.5); ctx.fillRect(xx, T + 490, w, 70); xx += w + 1 + Math.floor(rb() * 2); }
    mono(ctx, '85810000032 4 00002710270 1 11012027000 3 00000001234 5', 0, T + 588, 16, '#374151', 'center', 700);
  });
  ctx.restore();
}
// canhoto: um pedaço da guia rasgado, com a cor e o valor de uma fatia
function canhoto(ctx, x, y, s, cor, val, lab, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  ctx.save(); papelSombra(ctx); ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.moveTo(-120, -80); ctx.lineTo(120, -80); for (let i = 0; i <= 10; i++) ctx.lineTo(120 - (i % 2) * 10, -80 + i * 16); ctx.lineTo(-120, 80); for (let i = 10; i >= 0; i--) ctx.lineTo(-120 + (i % 2) * 10, -80 + i * 16); ctx.closePath(); ctx.fill(); ctx.restore();
  fillRR(ctx, -100, -60, 200, 70, 6, cor);
  text(ctx, val, 0, -24, { size: 44, weight: 900, color: '#ffffff' });
  text(ctx, lab, 0, 44, { size: 22, weight: 900, color: P.ink });
  ctx.restore();
}

// ================================================================ veículos (vista de lado; checagem de silhueta feita em cada um)
// hatch 1.0: traseira curta e reta, teto comprido, para-brisa inclinado, capô curto, duas rodas
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
// carro antigo coberto com capa (a capa marca o volume do carro, cai até as rodas e tem dobras)
function carroCapa(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  sombraChao(ctx, 0, 92, 260, 0.55);
  for (const wx of [-140, 140]) { circle(ctx, wx, 50, 40, '#111318'); circle(ctx, wx, 50, 16, '#6b7280'); }
  ctx.save(); papelSombra(ctx); const g = ctx.createLinearGradient(0, -120, 0, 60); g.addColorStop(0, '#94a3b8'); g.addColorStop(1, '#475569');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-240, 40); ctx.quadraticCurveTo(-246, -30, -200, -46); ctx.quadraticCurveTo(-150, -112, -60, -116); ctx.quadraticCurveTo(60, -118, 120, -50); ctx.quadraticCurveTo(230, -40, 238, 10); ctx.lineTo(236, 40);
  for (let i = 0; i <= 12; i++) ctx.lineTo(236 - i * 39.6, 40 + (i % 2 ? 12 : 0)); ctx.closePath(); ctx.fill(); ctx.restore();
  fillRR(ctx, 200, 22, 60, 16, 6, '#d1d5db'); fillRR(ctx, -262, 22, 50, 16, 6, '#d1d5db'); // para-choques cromados aparecendo
  circle(ctx, 232, 8, 13, '#fef3c7'); circle(ctx, 232, 8, 7, '#fde68a'); // farol redondo de carro antigo
  ctx.strokeStyle = 'rgba(30,41,59,0.45)'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (const [a, b, c2, d] of [[-160, -80, -120, 30], [-40, -110, -20, 30], [70, -90, 90, 34], [170, -40, 190, 30]]) { ctx.beginPath(); ctx.moveTo(a, b); ctx.quadraticCurveTo((a + c2) / 2 + 14, (b + d) / 2, c2, d); ctx.stroke(); }
  ctx.restore();
}
// moto pequena (até 180 cc): duas rodas, tanque, banco, guidão, farol, escapamento
function moto(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  sombraChao(ctx, 0, 72, 190, 0.5);
  for (const wx of [-110, 110]) { circle(ctx, wx, 30, 44, '#111318'); circle(ctx, wx, 30, 24, '#9ca3af'); circle(ctx, wx, 30, 6, '#374151'); }
  ctx.strokeStyle = '#374151'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-110, 30); ctx.lineTo(-30, -10); ctx.lineTo(60, -12); ctx.lineTo(110, 30); ctx.moveTo(90, -70); ctx.lineTo(110, 30); ctx.stroke();
  ctx.fillStyle = o.cor || '#2563eb'; ctx.beginPath(); ctx.moveTo(-20, -40); ctx.quadraticCurveTo(20, -70, 70, -46); ctx.lineTo(60, -10); ctx.lineTo(-20, -10); ctx.closePath(); ctx.fill(); // tanque
  fillRR(ctx, -120, -36, 110, 22, 10, '#111827'); // banco
  ctx.strokeStyle = '#111827'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(70, -86); ctx.lineTo(116, -78); ctx.stroke(); // guidão
  fillRR(ctx, 108, -64, 26, 22, 8, '#fef3c7'); // farol
  ctx.strokeStyle = '#9ca3af'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(-40, 14); ctx.lineTo(-140, 4); ctx.stroke(); // escapamento
  ctx.restore();
}
// jatinho executivo: fuselagem fina, nariz pontudo, janelas redondas, asa enflechada, motor atrás e cauda em T
function jatinho(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  ctx.fillStyle = '#9ca3af'; ctx.beginPath(); ctx.moveTo(-40, 10); ctx.lineTo(80, 10); ctx.lineTo(-10, 90); ctx.lineTo(-70, 90); ctx.closePath(); ctx.fill(); // asa
  ctx.save(); papelSombra(ctx); const g = ctx.createLinearGradient(0, -40, 0, 40); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#cbd5e1');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-260, 0); ctx.quadraticCurveTo(-250, -36, -150, -38); ctx.lineTo(200, -34); ctx.quadraticCurveTo(290, -28, 320, 0); ctx.quadraticCurveTo(290, 26, 200, 30); ctx.lineTo(-150, 34); ctx.quadraticCurveTo(-250, 34, -260, 0); ctx.closePath(); ctx.fill(); ctx.restore();
  ctx.fillStyle = '#cbd5e1'; ctx.beginPath(); ctx.moveTo(-200, -34); ctx.lineTo(-250, -130); ctx.lineTo(-210, -130); ctx.lineTo(-130, -36); ctx.closePath(); ctx.fill(); // deriva
  fillRR(ctx, -290, -142, 110, 16, 6, '#cbd5e1'); // cauda em T
  fillRR(ctx, -170, -70, 90, 34, 16, '#6b7280'); // motor
  ctx.fillStyle = '#1e293b'; ctx.beginPath(); ctx.moveTo(250, -26); ctx.lineTo(300, -10); ctx.lineTo(266, -6); ctx.closePath(); ctx.fill(); // cabine
  for (let i = 0; i < 6; i++) circle(ctx, -60 + i * 46, -10, 9, '#1e293b');
  ctx.fillStyle = '#1d4ed8'; ctx.fillRect(-150, 8, 350, 6);
  ctx.restore();
}
// lancha: casco em V, convés, para-brisa, motor de popa e a esteira na água
function lancha(ctx, x, y, s, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  ctx.strokeStyle = 'rgba(147,197,253,0.6)'; ctx.lineWidth = 6; for (let i = 0; i < 3; i++) { ctx.beginPath(); for (let k = 0; k <= 30; k++) { const xx = -360 + k * 24, yy = 52 + i * 18 + Math.sin(k * 0.8 + t * 3 + i) * 5; k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke(); }
  ctx.save(); papelSombra(ctx); ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.moveTo(-240, -10); ctx.lineTo(220, -10); ctx.quadraticCurveTo(300, -14, 320, -40); ctx.lineTo(260, 40); ctx.lineTo(-220, 40); ctx.closePath(); ctx.fill(); ctx.restore();
  ctx.fillStyle = '#1e3a8a'; ctx.beginPath(); ctx.moveTo(-232, 16); ctx.lineTo(272, 16); ctx.lineTo(262, 30); ctx.lineTo(-224, 30); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(30,58,138,0.7)'; ctx.beginPath(); ctx.moveTo(40, -10); ctx.lineTo(100, -64); ctx.lineTo(130, -64); ctx.lineTo(110, -10); ctx.closePath(); ctx.fill(); // para-brisa
  fillRR(ctx, -280, -40, 50, 90, 10, '#111827'); // motor de popa
  ctx.restore();
}
// helicóptero: cabine em bolha, cauda comprida com rotor pequeno, pá do rotor em cima, esquis
function helicoptero(ctx, x, y, s, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  ctx.strokeStyle = '#374151'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(-80, 70); ctx.lineTo(80, 70); ctx.moveTo(-50, 40); ctx.lineTo(-60, 70); ctx.moveTo(40, 40); ctx.lineTo(50, 70); ctx.stroke();
  ctx.save(); papelSombra(ctx); ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.ellipse(0, 0, 100, 48, 0, 0, 6.283); ctx.fill(); ctx.restore();
  ctx.fillStyle = '#dc2626'; ctx.fillRect(-250, -12, 170, 18); fillRR(ctx, -270, -50, 20, 60, 6, '#dc2626');
  ctx.fillStyle = '#bcd7ee'; ctx.beginPath(); ctx.ellipse(46, -8, 46, 30, 0, 0, 6.283); ctx.fill();
  fillRR(ctx, -10, -66, 20, 22, 4, '#374151');
  const sp = Math.sin(t * 20) * 0.5 + 0.5; ctx.fillStyle = 'rgba(55,65,81,0.85)'; ctx.fillRect(-200 * (0.4 + 0.6 * sp), -70, 400 * (0.4 + 0.6 * sp), 8);
  ctx.restore();
}

// ================================================================ placa Mercosul (faixa azul com BRASIL, bandeira à direita, letras pretas)
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

// ================================================================ prédios que recebem o dinheiro (silhuetas diferentes entre si)
function palacio(ctx, x, y, s, o = {}) { // governo do estado: frontão triangular, colunas, escadaria, bandeira
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  sombraChao(ctx, 0, 120, 230, 0.5);
  ctx.fillStyle = '#e5e7eb'; ctx.beginPath(); ctx.moveTo(-200, -60); ctx.lineTo(0, -140); ctx.lineTo(200, -60); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#d1d5db'; ctx.fillRect(-190, -60, 380, 18);
  for (let i = 0; i < 6; i++) { ctx.fillStyle = '#f3f4f6'; ctx.fillRect(-170 + i * 64, -42, 26, 130); }
  ctx.fillStyle = '#9ca3af'; ctx.fillRect(-210, 88, 420, 14); ctx.fillRect(-230, 102, 460, 14);
  ctx.strokeStyle = '#6b7280'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, -140); ctx.lineTo(0, -210); ctx.stroke(); fillRR(ctx, 0, -210, 60, 36, 3, P.estado);
  fillRR(ctx, -110, -112, 220, 40, 8, P.estado); text(ctx, 'ESTADO', 0, -91, { size: 26, weight: 900, color: '#0b1222', letter: 3 });
  ctx.restore();
}
function prefeitura(ctx, x, y, s, o = {}) { // prefeitura: torre central com relógio e duas alas
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  sombraChao(ctx, 0, 120, 230, 0.5);
  ctx.fillStyle = '#fde68a'; ctx.fillRect(-210, -20, 420, 130);
  for (let i = 0; i < 8; i++) if (i !== 3 && i !== 4) { ctx.fillStyle = '#1f2937'; ctx.fillRect(-190 + i * 50, 10, 26, 40); ctx.fillRect(-190 + i * 50, 66, 26, 34); }
  ctx.fillStyle = '#fcd34d'; ctx.fillRect(-55, -170, 110, 280); ctx.fillStyle = '#b45309'; ctx.beginPath(); ctx.moveTo(-70, -170); ctx.lineTo(0, -230); ctx.lineTo(70, -170); ctx.closePath(); ctx.fill();
  circle(ctx, 0, -120, 34, '#f8fafc'); ctx.strokeStyle = '#111827'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, -120); ctx.lineTo(0, -144); ctx.moveTo(0, -120); ctx.lineTo(16, -112); ctx.stroke();
  ctx.fillStyle = '#7c2d12'; ctx.fillRect(-26, 50, 52, 60);
  fillRR(ctx, -130, -64, 260, 40, 8, P.pref); text(ctx, 'PREFEITURA', 0, -43, { size: 24, weight: 900, color: '#ffffff', letter: 2 });
  ctx.restore();
}
function escola(ctx, x, y, s, o = {}) { // escola pública: prédio baixo e comprido, muitas janelas, mastro com bandeira, placa
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  sombraChao(ctx, 0, 120, 250, 0.5);
  ctx.fillStyle = '#e0f2fe'; ctx.fillRect(-240, -10, 480, 120); ctx.fillStyle = '#0369a1'; ctx.fillRect(-250, -26, 500, 18);
  for (let i = 0; i < 8; i++) { ctx.fillStyle = '#93c5fd'; ctx.fillRect(-220 + i * 56, 14, 36, 34); }
  ctx.fillStyle = '#1e3a8a'; ctx.fillRect(-30, 56, 60, 54);
  ctx.strokeStyle = '#6b7280'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(280, 110); ctx.lineTo(280, -150); ctx.stroke();
  ctx.fillStyle = '#16a34a'; ctx.fillRect(280, -150, 80, 52); ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.moveTo(320, -146); ctx.lineTo(354, -124); ctx.lineTo(320, -102); ctx.lineTo(286, -124); ctx.closePath(); ctx.fill(); circle(ctx, 320, -124, 11, '#1d4ed8');
  fillRR(ctx, -150, -80, 300, 44, 8, P.escola); text(ctx, 'ESCOLA PÚBLICA', 0, -57, { size: 24, weight: 900, color: '#0b1222', letter: 2 });
  ctx.restore();
}

// ================================================================ mapa do Brasil com SP, MG, RJ e PR (contornos simplificados)
const BRASIL_OLD = [[-74, -8], [-70, -4], [-69, 1], [-64, 4], [-60, 5], [-56, 2], [-51, 4], [-50, 0], [-44, -2], [-38, -3.5], [-35, -5], [-35, -9], [-39, -13], [-40, -20], [-42, -23], [-44, -23], [-48, -26], [-49, -29], [-53, -33.7], [-57, -30], [-55, -27], [-54, -25], [-58, -20], [-58, -16], [-60, -14], [-65, -11], [-70, -11], [-73, -9]];
const BRASIL = [[-74, -7.5], [-72.8, -5.1], [-70.5, -4.2], [-69.9, -1.1], [-69.4, 1.1], [-67.5, 2.0], [-66.8, 1.2], [-64.1, 1.9], [-63.4, 3.9], [-61.0, 4.5], [-60.0, 5.2], [-58.5, 1.3], [-56.5, 1.9], [-54.5, 2.3], [-52.9, 2.1], [-51.1, 4.4], [-50.0, 1.8], [-49.9, -0.3], [-48.5, -0.8], [-47.0, -0.7], [-44.5, -2.4], [-41.8, -2.9], [-39.0, -3.3], [-37.2, -4.8], [-35.2, -5.4], [-34.8, -7.5], [-35.1, -9.0], [-37.0, -11.0], [-38.5, -13.0], [-39.0, -15.6], [-39.6, -18.2], [-40.9, -21.9], [-42.0, -22.9], [-44.6, -23.3], [-47.0, -24.5], [-48.5, -26.0], [-48.6, -28.5], [-50.0, -30.0], [-51.0, -31.5], [-53.4, -33.7], [-53.5, -32.4], [-55.6, -30.9], [-57.6, -30.2], [-55.9, -28.2], [-54.6, -25.6], [-54.3, -24.0], [-55.8, -22.3], [-57.9, -22.0], [-57.6, -19.9], [-58.2, -16.3], [-60.2, -16.2], [-60.5, -13.8], [-62.8, -12.9], [-65.3, -11.3], [-66.0, -9.8], [-68.6, -11.1], [-70.5, -10.9], [-70.6, -9.5], [-72.9, -9.1]];
const UF = {
  SP: [[-53.1, -22.5], [-51.5, -20.0], [-50, -19.8], [-47.5, -20.2], [-46.5, -21.5], [-44.8, -22.6], [-44.9, -23.4], [-46.5, -24.1], [-48, -25.2], [-49.4, -24.6], [-50.5, -22.9]],
  PR: [[-54.6, -25.5], [-53.9, -24], [-52.5, -23], [-50.5, -22.9], [-49.4, -24.6], [-48, -25.2], [-48.3, -26], [-49.5, -26.2], [-51.5, -26.5], [-53.7, -26.3]],
  MG: [[-51, -19.5], [-50, -19.8], [-47.5, -20.2], [-46.5, -21.5], [-44.8, -22.6], [-42.3, -21.5], [-41, -20.2], [-40.4, -17.9], [-41.5, -15.2], [-44, -14.3], [-46, -15], [-47.5, -15.8], [-49.5, -18.0]],
  RJ: [[-44.8, -22.6], [-42.3, -21.5], [-41, -21.2], [-41.9, -22.9], [-43.2, -23.05], [-44.7, -23.3]],
};
function mapaBR(ctx, cx, cy, sc, ufs = {}) { // ufs: { SP: {cor, k}, ... }; devolve o centro de cada estado na tela
  const pt = ([lon, lat]) => [cx + (lon + 54) * sc, cy - (lat + 14) * sc];
  const path = (pts) => { ctx.beginPath(); pts.forEach((p, i) => { const [x, y] = pt(p); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); };
  path(BRASIL); ctx.fillStyle = 'rgba(30,41,59,0.85)'; ctx.fill();
  ctx.save(); ctx.shadowColor = 'rgba(148,163,184,0.6)'; ctx.shadowBlur = 16; ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
  const centros = {};
  for (const [uf, pts] of Object.entries(UF)) {
    const st = ufs[uf] || {}, k = clamp(st.k ?? 0);
    path(pts); ctx.fillStyle = k > 0 ? hexA(st.cor, 0.25 + 0.6 * k) : 'rgba(71,85,105,0.6)'; ctx.fill(); ctx.strokeStyle = 'rgba(226,232,240,0.7)'; ctx.lineWidth = 2; ctx.stroke();
    const c = pts.reduce((a, p) => [a[0] + p[0] / pts.length, a[1] + p[1] / pts.length], [0, 0]); centros[uf] = pt(c);
  }
  return centros;
}

// ================================================================ outros objetos
// engrenagem com a alíquota no meio
function engrenagem(ctx, x, y, r, rot, label, cor = P.estado) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.save(); papelSombra(ctx); ctx.fillStyle = '#475569'; ctx.beginPath();
  for (let i = 0; i < 24; i++) { const a = (i / 24) * 6.283, rr2 = i % 2 ? r : r * 1.18; ctx.lineTo(Math.cos(a - 0.1) * rr2, Math.sin(a - 0.1) * rr2); ctx.lineTo(Math.cos(a + 0.1) * rr2, Math.sin(a + 0.1) * rr2); }
  ctx.closePath(); ctx.fill(); ctx.restore();
  circle(ctx, 0, 0, r * 0.78, '#64748b'); circle(ctx, 0, 0, r * 0.62, cor);
  ctx.rotate(-rot); text(ctx, label, 0, 4, { size: r * 0.5, weight: 900, color: '#0b1222' });
  ctx.restore();
}
// etiqueta de preço pendurada (preço da tabela)
function etiqueta(ctx, x, y, s, l1, l2, cor = '#111827', o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? 0.06); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  ctx.save(); papelSombra(ctx); ctx.fillStyle = o.bg || '#fffbeb';
  ctx.beginPath(); ctx.moveTo(-50, -90); ctx.lineTo(50, -90); ctx.lineTo(170, -40); ctx.lineTo(170, 80); ctx.lineTo(-170, 80); ctx.lineTo(-170, -40); ctx.closePath(); ctx.fill(); ctx.restore();
  circle(ctx, 0, -60, 12, '#9ca3af');
  text(ctx, l1, 0, -14, { size: 26, weight: 900, color: '#374151' });
  text(ctx, l2, 0, 40, { size: 48, weight: 900, color: cor });
  ctx.restore();
}
// cone de trânsito
function cone(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.save(); papelSombra(ctx); ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.moveTo(-120, 0); ctx.lineTo(120, 0); ctx.lineTo(104, 24); ctx.lineTo(-104, 24); ctx.closePath(); ctx.fill(); ctx.restore();
  const gc = ctx.createLinearGradient(-80, 0, 80, 0); gc.addColorStop(0, '#c2410c'); gc.addColorStop(0.45, '#fb923c'); gc.addColorStop(1, '#9a3412');
  ctx.fillStyle = gc; ctx.beginPath(); ctx.moveTo(-18, -330); ctx.lineTo(18, -330); ctx.lineTo(84, 0); ctx.lineTo(-84, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#f8fafc'; for (const [y0, y1] of [[-230, -180], [-110, -55]]) { const w0 = 18 + (y0 + 330) / 330 * 66, w1 = 18 + (y1 + 330) / 330 * 66; ctx.beginPath(); ctx.moveTo(-w0, y0); ctx.lineTo(w0, y0); ctx.lineTo(w1, y1); ctx.lineTo(-w1, y1); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}
// trecho de asfalto com buraco (vista de cima, um pouco inclinada)
function asfaltoBuraco(ctx, x, y, w, h, k = 1) {
  ctx.save(); ctx.globalAlpha *= k;
  const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#4b5563'); g.addColorStop(1, '#374151'); ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  const r = rng(13); for (let i = 0; i < 1400; i++) { ctx.fillStyle = r() > 0.5 ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.14)'; ctx.fillRect(x + r() * w, y + r() * h, 2 + r() * 3, 2 + r() * 3); }
  ctx.fillStyle = '#facc15'; for (let xx = x + 40; xx < x + w; xx += 260) ctx.fillRect(xx, y + h * 0.82, 160, 18);
  const cx = x + w * 0.5, cy = y + h * 0.5, pts = []; const rr2 = rng(9);
  for (let i = 0; i < 26; i++) { const a = (i / 26) * 6.283, f = 1 + (rr2() - 0.5) * 0.3; pts.push([cx + Math.cos(a) * 300 * f, cy + Math.sin(a) * 130 * f]); }
  ctx.fillStyle = '#6b7280'; ctx.beginPath(); pts.forEach(([px, py], i) => (i ? ctx.lineTo(cx + (px - cx) * 1.08, cy + (py - cy) * 1.14 + 5) : ctx.moveTo(cx + (px - cx) * 1.08, cy + (py - cy) * 1.14 + 5))); ctx.closePath(); ctx.fill();
  const gh = ctx.createRadialGradient(cx, cy + 20, 20, cx, cy, 300); gh.addColorStop(0, '#0b0b0b'); gh.addColorStop(1, '#262626'); ctx.fillStyle = gh;
  ctx.beginPath(); pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#1f1f1f'; ctx.lineWidth = 5; for (const [dx, dy] of [[-330, -40], [320, 30], [-120, 140], [180, -140]]) { ctx.beginPath(); ctx.moveTo(cx + dx * 0.9, cy + dy * 0.9); ctx.lineTo(cx + dx * 1.2, cy + dy * 1.2 + 20); ctx.lineTo(cx + dx * 1.4, cy + dy * 1.4 - 10); ctx.stroke(); }
  ctx.restore();
}
// comprovante da Taxa Rodoviária Única (documento genérico de 1969, papel amarelado, carimbo de estradas)
function comprovanteTRU(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? 0.03); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  drawDoc(ctx, 'tru', 900, 560, (ctx) => {
    const L = -450, T = -280;
    ctx.save(); papelSombra(ctx); const g = ctx.createLinearGradient(L, T, -L, -T); g.addColorStop(0, '#f1e6c8'); g.addColorStop(1, '#d9c79c'); ctx.fillStyle = g; ctx.fillRect(L, T, 900, 560); ctx.restore();
    ctx.strokeStyle = '#57534e'; ctx.lineWidth = 3; ctx.strokeRect(L + 22, T + 22, 856, 516);
    text(ctx, 'TAXA RODOVIÁRIA ÚNICA', 0, T + 80, { size: 50, weight: 900, color: '#1c1917', letter: 3 });
    text(ctx, 'COMPROVANTE DE PAGAMENTO · EXERCÍCIO DE 1969', 0, T + 128, { size: 24, weight: 800, color: '#44403c', letter: 1 });
    const linhas = [['PROPRIETÁRIO', 'J. DA SILVA'], ['VEÍCULO', 'AUTOMÓVEL DE PASSEIO'], ['PAGAMENTO', 'UMA VEZ POR ANO']];
    linhas.forEach(([a, b], i) => { const yy = T + 200 + i * 60; text(ctx, a, L + 60, yy, { size: 22, weight: 900, color: '#57534e', align: 'left' }); text(ctx, b, L + 320, yy, { size: 28, weight: 800, color: '#1c1917', align: 'left' }); ctx.fillStyle = 'rgba(87,83,78,0.5)'; ctx.fillRect(L + 310, yy + 22, 500, 2); });
    text(ctx, 'RECOLHIDA PARA O DEPARTAMENTO DE ESTRADAS DE RODAGEM', 0, T + 420, { size: 22, weight: 800, color: '#44403c' });
  });
  if ((o.carimbo ?? 0) > 0) ovalStamp(ctx, 250, 150, 170, 74, [['ESTRADAS', 0.05, 0.5]], '#1d4ed8', o.carimbo, -0.12);
  ctx.restore();
}
// livro da Constituição aberto no art. 167
function constituicao(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.02); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  drawDoc(ctx, 'cf', 1040, 620, (ctx) => {
    ctx.save(); papelSombra(ctx); fillRR(ctx, -520, -300, 1040, 600, 16, '#14532d'); ctx.restore();
    fillRR(ctx, -500, -284, 490, 568, 6, '#fbfaf5'); fillRR(ctx, 10, -284, 490, 568, 6, '#fbfaf5');
    ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(-12, -284, 24, 568);
    text(ctx, 'CONSTITUIÇÃO DA REPÚBLICA', -255, -240, { size: 22, weight: 900, color: '#14532d' }); text(ctx, 'FEDERATIVA DO BRASIL · 1988', -255, -210, { size: 20, weight: 800, color: '#14532d' });
    for (let i = 0; i < 12; i++) { ctx.fillStyle = 'rgba(31,41,55,0.35)'; ctx.fillRect(-470, -160 + i * 34, i % 4 === 3 ? 260 : 420, 9); }
    text(ctx, 'Art. 167. São vedados:', 40, -240, { size: 26, weight: 900, color: P.ink, align: 'left' });
    for (let i = 0; i < 3; i++) { ctx.fillStyle = 'rgba(31,41,55,0.35)'; ctx.fillRect(40, -196 + i * 30, 420, 9); }
    text(ctx, 'IV - a vinculação de receita de', 40, -84, { size: 23, weight: 800, color: P.ink, align: 'left' });
    text(ctx, 'impostos a órgão, fundo ou despesa,', 40, -50, { size: 23, weight: 800, color: P.ink, align: 'left' });
    text(ctx, 'ressalvadas... saúde... ensino...', 40, -16, { size: 24, weight: 700, color: '#4b5563', align: 'left' });
    for (let i = 0; i < 6; i++) { ctx.fillStyle = 'rgba(31,41,55,0.3)'; ctx.fillRect(40, 40 + i * 34, 420, 9); }
  });
  if ((o.hl ?? 0) > 0) marker(ctx, 34 * 1, -110, 440, 80, '#fde047', o.hl);
  ctx.restore();
}
// janela de navegador com a página da Fazenda
function paginaWeb(ctx, x, y, s, titulo, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? 0.02); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  drawDoc(ctx, 'web', 1000, 600, (ctx) => {
    ctx.save(); papelSombra(ctx); fillRR(ctx, -500, -300, 1000, 600, 16, '#f8fafc'); ctx.restore();
    fillRR(ctx, -500, -300, 1000, 60, 16, '#e2e8f0'); ctx.fillStyle = '#e2e8f0'; ctx.fillRect(-500, -260, 1000, 20);
    for (const [cx, c] of [[-470, '#ef4444'], [-440, '#f59e0b'], [-410, '#22c55e']]) circle(ctx, cx, -270, 9, c);
    fillRR(ctx, -360, -286, 700, 32, 16, '#ffffff'); text(ctx, 'educacaofiscal.sp.gov.br', -340, -270, { size: 18, weight: 700, color: '#64748b', align: 'left' });
    fillRR(ctx, -500, -230, 1000, 70, 0, '#1e3a8a'); text(ctx, 'Educação Fiscal · Secretaria da Fazenda', -460, -195, { size: 24, weight: 800, color: '#ffffff', align: 'left' });
    const words = titulo.split(' '); let line = '', yy = -100, lines = [];
    for (const wd of words) { if ((line + ' ' + wd).length > 30) { lines.push(line); line = wd; } else line = (line ? line + ' ' : '') + wd; } lines.push(line);
    lines.forEach((l, i) => text(ctx, l, -460, yy + i * 62, { size: 50, weight: 900, color: P.ink, align: 'left' }));
    for (let i = 0; i < 5; i++) { ctx.fillStyle = 'rgba(31,41,55,0.25)'; ctx.fillRect(-460, 120 + i * 30, i === 4 ? 400 : 900, 10); }
  });
  ctx.restore();
}
// caixa geral (cofre grande da prefeitura) com entradas e saídas
function caixaGeral(ctx, x, y, s, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  sombraChao(ctx, 0, 190, 260, 0.55);
  ctx.save(); papelSombra(ctx); fillRR(ctx, -220, -180, 440, 360, 26, '#334155'); ctx.restore();
  fillRR(ctx, -190, -150, 380, 300, 16, '#475569'); circle(ctx, 60, 10, 70, '#94a3b8'); circle(ctx, 60, 10, 50, '#cbd5e1'); circle(ctx, 60, 10, 12, '#334155');
  ctx.strokeStyle = '#334155'; ctx.lineWidth = 8; for (let i = 0; i < 3; i++) { const a = t * 0.6 + (i / 3) * 6.283; ctx.beginPath(); ctx.moveTo(60, 10); ctx.lineTo(60 + Math.cos(a) * 66, 10 + Math.sin(a) * 66); ctx.stroke(); }
  fillRR(ctx, -170, -230, 340, 50, 10, P.pref); text(ctx, 'CAIXA GERAL', 0, -205, { size: 30, weight: 900, color: '#ffffff', letter: 3 });
  ctx.restore();
}
// celular com a consulta do valor venal pela placa
function celularConsulta(ctx, x, y, s, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? 0.04); ctx.scale(s, s);
  drawDoc(ctx, 'cel9', 360, 700, (ctx) => {
    ctx.save(); papelSombra(ctx); fillRR(ctx, -170, -340, 340, 680, 44, '#0f172a'); ctx.restore();
    fillRR(ctx, -156, -326, 312, 652, 34, '#f8fafc'); fillRR(ctx, -40, -316, 80, 18, 9, '#0f172a');
    ctx.save(); rr(ctx, -156, -326, 312, 652, 34); ctx.clip();
    ctx.fillStyle = '#1e3a8a'; ctx.fillRect(-156, -326, 312, 140);
    text(ctx, 'Consulta', -130, -250, { size: 34, weight: 900, color: '#ffffff', align: 'left' }); text(ctx, 'valor venal · IPVA 2027', -130, -212, { size: 18, weight: 700, color: '#dbeafe', align: 'left' });
    text(ctx, 'Placa', -130, -150, { size: 18, weight: 800, color: '#64748b', align: 'left' });
    fillRR(ctx, -134, -134, 268, 60, 10, '#ffffff'); strokeRR(ctx, -134, -134, 268, 60, 10, '#94a3b8', 2);
    const pl = 'ABC1D23', n = Math.round(pl.length * clamp(o.digita ?? 1)); mono(ctx, pl.slice(0, n), -116, -104, 30, '#111827', 'left', 900);
    fillRR(ctx, -134, -50, 268, 56, 12, '#16a34a'); text(ctx, 'CONSULTAR', 0, -22, { size: 22, weight: 900, color: '#ffffff', letter: 2 });
    if ((o.resultado ?? 0) > 0) { ctx.globalAlpha *= clamp(o.resultado * 2); fillRR(ctx, -134, 30, 268, 170, 14, '#ecfdf5'); text(ctx, 'Valor venal 2027', -116, 62, { size: 18, weight: 800, color: '#065f46', align: 'left' }); text(ctx, 'sai em dezembro', -116, 100, { size: 26, weight: 900, color: '#065f46', align: 'left' }); text(ctx, 'confira antes de pagar', -116, 150, { size: 18, weight: 700, color: '#047857', align: 'left' }); }
    ctx.restore();
  });
  ctx.restore();
}
// cavalete de fiscalização (listras vermelhas e brancas, placa em cima)
function cavalete(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  sombraChao(ctx, 0, 130, 230, 0.5);
  ctx.strokeStyle = '#374151'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(-180, 130); ctx.lineTo(-150, -40); ctx.moveTo(180, 130); ctx.lineTo(150, -40); ctx.stroke();
  ctx.save(); rr(ctx, -220, -60, 440, 70, 8); ctx.clip(); for (let i = -6; i < 12; i++) { ctx.fillStyle = i % 2 ? '#dc2626' : '#f8fafc'; ctx.beginPath(); ctx.moveTo(-220 + i * 50, -60); ctx.lineTo(-170 + i * 50, -60); ctx.lineTo(-220 + i * 50, 10); ctx.lineTo(-270 + i * 50, 10); ctx.closePath(); ctx.fill(); } ctx.restore();
  fillRR(ctx, -150, -150, 300, 76, 8, '#1d4ed8'); text(ctx, 'FISCALIZAÇÃO', 0, -112, { size: 30, weight: 900, color: '#ffffff', letter: 2 });
  ctx.restore();
}
// guincho (caminhão com plataforma) levando um carro
function guincho(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  sombraChao(ctx, 0, 80, 300, 0.5);
  fillRR(ctx, -300, -10, 420, 40, 6, '#facc15'); fillRR(ctx, 130, -110, 150, 140, 16, '#facc15'); fillRR(ctx, 170, -90, 90, 50, 8, '#bcd7ee');
  for (const wx of [-220, 30, 200]) { circle(ctx, wx, 50, 36, '#111318'); circle(ctx, wx, 50, 14, '#9ca3af'); }
  fillRR(ctx, 180, -128, 50, 18, 6, '#f97316');
  ctx.restore();
  carroLado(ctx, x - 80 * s, y - 70 * s, s * 0.62, { cor: '#64748b' });
}
// controle remoto do portão e o portão basculante
function controlePortao(ctx, x, y, s, press = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.15); ctx.scale(s, s);
  ctx.save(); papelSombra(ctx); fillRR(ctx, -70, -130, 140, 260, 40, '#111827'); ctx.restore();
  circle(ctx, 0, -60, 34, press > 0.5 ? '#16a34a' : '#374151'); circle(ctx, 0, -60 + press * 3, 26, press > 0.5 ? '#22c55e' : '#4b5563');
  circle(ctx, 0, 30, 26, '#374151'); circle(ctx, 0, -110, 5, press > 0.5 ? '#ef4444' : '#7f1d1d');
  ctx.restore();
}
function portao(ctx, x, y, w, h, open, t, label) { // open 0..1: o portão sobe girando (basculante)
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = '#1f2937'; ctx.fillRect(-w / 2 - 30, -h - 40, w + 60, h + 40);
  const lg = ctx.createLinearGradient(0, -h, 0, 0); lg.addColorStop(0, '#fef9c3'); lg.addColorStop(1, '#fde68a');
  ctx.fillStyle = lg; ctx.globalAlpha *= 0.15 + 0.85 * open; ctx.fillRect(-w / 2, -h, w, h); ctx.globalAlpha = 1;
  const ph = h * (1 - open * 0.92);
  ctx.save(); papelSombra(ctx); ctx.fillStyle = '#9ca3af'; ctx.fillRect(-w / 2, -h, w, ph); ctx.restore();
  for (let yy = -h + 20; yy < -h + ph - 10; yy += 34) { ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(-w / 2, yy, w, 6); }
  if (ph > 40) fillRR(ctx, -60, -h + ph - 30, 120, 16, 6, '#4b5563');
  // a luz de cima com o letreiro
  fillRR(ctx, -220, -h - 140, 440, 80, 14, open > 0.6 ? '#16a34a' : '#374151');
  ctx.save(); if (open > 0.6) { ctx.shadowColor = 'rgba(74,222,128,0.8)'; ctx.shadowBlur = 30; } text(ctx, label, 0, -h - 99, { size: 46, weight: 900, color: open > 0.6 ? '#ffffff' : '#9ca3af', letter: 3 }); ctx.restore();
  ctx.restore();
}
// árvore de Natal com a caixa de brinquedo embaixo
function arvoreNatal(ctx, x, y, s, t, tampa = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  sombraChao(ctx, 0, 300, 300, 0.5);
  ctx.fillStyle = '#7c2d12'; ctx.fillRect(-30, 200, 60, 90);
  for (let i = 0; i < 4; i++) { const yb = 220 - i * 130, wb = 300 - i * 60; ctx.fillStyle = i % 2 ? '#166534' : '#15803d'; ctx.beginPath(); ctx.moveTo(-wb, yb); ctx.lineTo(0, yb - 220); ctx.lineTo(wb, yb); ctx.closePath(); ctx.fill(); }
  const cols = ['#ef4444', '#facc15', '#38bdf8', '#f472b6']; const r = rng(4);
  for (let i = 0; i < 18; i++) { const yy = -260 + r() * 470, ww = 40 + (yy + 300) * 0.5; circle(ctx, (r() - 0.5) * ww * 1.4, yy, 12, cols[i % 4], 0.6 + 0.4 * Math.sin(t * 2 + i)); }
  ctx.fillStyle = '#facc15'; ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -1.571 + (i / 10) * 6.283, rr2 = i % 2 ? 18 : 42; ctx.lineTo(Math.cos(a) * rr2, -540 + Math.sin(a) * rr2); } ctx.closePath(); ctx.fill();
  // caixa de brinquedo com laço
  ctx.save(); ctx.translate(200, 230);
  ctx.save(); papelSombra(ctx); fillRR(ctx, -130, -60, 260, 130, 6, '#dc2626'); ctx.restore();
  ctx.fillStyle = '#facc15'; ctx.fillRect(-16, -60, 32, 130);
  ctx.save(); ctx.translate(0, -60 - tampa * 60); ctx.rotate(-tampa * 0.25); fillRR(ctx, -142, -30, 284, 34, 6, '#b91c1c'); ctx.fillStyle = '#facc15'; ctx.fillRect(-16, -30, 32, 34);
  ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.ellipse(-34, -42, 34, 18, -0.4, 0, 6.283); ctx.ellipse(34, -42, 34, 18, 0.4, 0, 6.283); ctx.fill(); ctx.restore();
  ctx.restore();
  ctx.restore();
}

// casa simples (telhado, porta, janela) para a regra do domicílio
function casinha(ctx, x, y, s, cor = '#cbd5e1') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  sombraChao(ctx, 0, 110, 200, 0.5);
  ctx.fillStyle = '#7c2d12'; ctx.beginPath(); ctx.moveTo(-200, -40); ctx.lineTo(0, -180); ctx.lineTo(200, -40); ctx.closePath(); ctx.fill();
  ctx.fillStyle = cor; ctx.fillRect(-170, -40, 340, 150); ctx.fillStyle = '#1e3a8a'; ctx.fillRect(-40, 20, 80, 90); ctx.fillStyle = '#93c5fd'; ctx.fillRect(70, 0, 70, 56); ctx.fillRect(-140, 0, 70, 56);
  ctx.restore();
}
const tagX = (ctx, x, y, s, k) => xMark(ctx, x, y, s, '#ef4444', k);

// ================================================================ Cena 01: gancho (a guia já na tela, metade para a cidade, o buraco prometido para o fim)
function scene01(K) {
  const tJan = K('Em janeiro chega o boleto'), tMet = K('E metade dele nem fica'), t90 = K('mais de noventa bilhões'), tSo = K('Só que quase ninguém sabe'), tDobro = K('paga mais que o dobro');
  const tPerg = K('E tem a pergunta'), tBur = K('e o buraco da minha rua'), t69 = K('A resposta começa numa taxa'), tFim = K('e ela fica para o fim'), tHoje = K('Hoje a gente abre esse boleto'), tCada = K('quem fica com cada real');
  const cam = [
    { t: 0, x: 960, y: 470, z: 1.0, dz: 0.006 }, { t: tMet, x: 1060, y: 470, z: 1.08, d: 1.4 }, { t: t90, x: 960, y: 500, z: 1.0, d: 1.4 },
    { t: tSo - 0.3, x: 2400, y: 470, z: 1.0, d: 1.4, dx: 3 }, { t: tDobro, x: 2400, y: 460, z: 1.08, d: 1.4 },
    { t: tPerg - 0.3, x: 3800, y: 480, z: 1.0, d: 1.4 }, { t: tBur, x: 3860, y: 520, z: 1.1, d: 1.4 }, { t: t69, x: 3700, y: 560, z: 1.12, d: 1.6 },
    { t: tHoje - 0.3, x: 5200, y: 470, z: 1.0, d: 1.4 }, { t: tCada, x: 5200, y: 460, z: 1.05, d: 2.4, dz: 0.004 },
  ];
  const sfx = [[0.05, 'paper', 0.35], [tMet, 'pop', 0.35], [tMet + 0.3, 'tick', 0.35], [t90, 'cash', 0.35], [tSo - 0.2, 'whoosh', 0.3], [tSo + 0.4, 'clank', 0.3], [tSo + 0.8, 'clank', 0.3], [tDobro, 'hit', 0.35],
    [tPerg - 0.2, 'whoosh', 0.3], [tBur, 'drop', 0.35], [t69, 'paper', 0.4], [tFim, 'tick', 0.3], [tHoje - 0.2, 'whoosh', 0.3], [tHoje + 0.3, 'paper', 0.4], [tCada, 'coin', 0.45]];
  return {
    accent: P.pref, cam, sfx, impacts: [tDobro], trans: 'cut',
    draw(ctx, t, cam2) {
      garagemFundo(ctx, cam2, 0.95);
      zone(ctx, cam2, 900, 1100, () => {
        if (t > tSo + 1.5) return;
        sombraChao(ctx, 960, 800, 420);
        guiaIPVA(ctx, 960, 470, 0.92, { split: 0, valor: 'R$ 3.240,00' });
        const km = vis(t, tMet, t90 - 0.2, 0.4, 0.3);
        if (km > 0) { penCircle(ctx, 1193, 512, 250, 92, '#fde047', prog(t, tMet, 0.7), 7); chip(ctx, 1193, 120, 'metade vai para a prefeitura', P.pref, km, { size: 34 }); }
        bigNum(ctx, 'R$ 90 bilhões', 860, 110, vis(t, t90, tSo, 0.5, 0.4), { size: 64, color: P.amber });
        chip(ctx, 1380, 110, 'IPVA pago em 2025 · IBPT', P.amber, vis(t, t90 + 0.6, tSo, 0.4, 0.4), { size: 22 });
      });
      zone(ctx, cam2, 2300, 2500, () => {
        if (t < tSo - 0.8 || t > tPerg + 0.6) return;
        const k = vis(t, tSo - 0.3, tPerg, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        for (const [px, uf, tt] of [[2050, 'SP', tSo + 0.4], [2750, 'PR', tSo + 0.8]]) {
          const kc = appear(t, tt - 0.2, 0.5);
          carroLado(ctx, px + (1 - ease.out(kc)) * (px > 2400 ? 260 : -260), 690, 0.55, { a: clamp(kc * 2), cor: '#dc2626' });
          placa(ctx, px, 470, 1.0, 'ABC1D23', { a: appear(t, tt, 0.4), rot: px > 2400 ? 0.03 : -0.03 }); chip(ctx, px, 300, uf, P.amber, appear(t, tt, 0.4), { size: 40 });
        }
        bigNum(ctx, '×2', 2400, 490, appear(t, tDobro, 0.5), { size: 130, color: '#f87171' });
        shockRing(ctx, t, tDobro, 2400, 470, '#f87171', 50, 260);
        text(ctx, 'o mesmo carro, a mesma placa', 2400, 150, { size: 34, weight: 900, color: '#e2e8f0', alpha: appear(t, tSo + 0.6, 0.4) });
        ctx.restore();
      });
      zone(ctx, cam2, 3700, 3900, () => {
        if (t < tPerg - 0.8 || t > tHoje + 0.6) return;
        const k = vis(t, tPerg - 0.3, tHoje, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        asfaltoBuraco(ctx, 2700, -200, 2200, 1500);
        cone(ctx, 4020, 640, 0.75);
        headline(ctx, 'e o buraco da minha rua?', 3800, 150, { size: 66, k: appear(t, tBur, 0.5), hl: '#c2410c' });
        comprovanteTRU(ctx, 3420, 720, 0.34, { a: appear(t, t69, 0.5), rot: -0.06 });
        chip(ctx, 3420, 560, 'começa em 1969', P.hist, appear(t, t69 + 0.3, 0.4), { size: 28 });
        chip(ctx, 3800, 260, 'a resposta fica para o fim', '#fde68a', appear(t, tFim, 0.4), { size: 28 });
        ctx.restore();
      });
      zone(ctx, cam2, 5100, 5300, () => {
        if (t < tHoje - 0.8) return;
        const k = appear(t, tHoje - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        sombraChao(ctx, 5200, 800, 420);
        guiaIPVA(ctx, 5200, 490, 0.88, { split: 0, valor: 'R$ 3.240,00', key: 'b', rot: 0.015 });
        headline(ctx, 'quem fica com cada real?', 5200, 110, { size: 62, k: appear(t, tCada, 0.5), hl: '#4c1d95' });
        ctx.restore();
      });
      poeiraLuz(ctx, cam2, t, 3, 9);
    },
    overlay(ctx, t) { source(ctx, 'IBPT (arrecadação de 2025)', vis(t, t90, tSo, 0.5, 0.4)); },
  };
}

// ================================================================ Cena 02: a conta (valor venal × alíquota) e o calendário de janeiro
function scene02(K) {
  const tPrim = K('Primeiro, de onde sai'), tDuas = K('A conta tem duas partes'), tVenal = K('A primeira é o valor venal'), tFipe = K('em geral a da Fipe'), tSet = K('com os preços de setembro');
  const tAliq = K('A segunda é a alíquota'), tCada = K('que cada estado escolhe'), t4 = K('ela é de quatro por cento'), tHatch = K('Pega um hatch popular'), t3240 = K('fica em uns três mil');
  const tVence = K('o boleto vence entre'), tPlaca = K('conforme o final da placa'), tCota = K('Quem paga tudo de uma vez'), t97 = K('uns noventa e sete reais'), tFev = K('Também dá para pagar'), tParc = K('ou dividir em até cinco parcelas');
  const cam = [
    { t: 0, x: 960, y: 480, z: 1.0, dx: 3 }, { t: tVenal, x: 700, y: 480, z: 1.12, d: 1.6 }, { t: tAliq, x: 1000, y: 480, z: 1.08, d: 1.6 },
    { t: tHatch, x: 960, y: 480, z: 1.0, d: 1.4 }, { t: t3240, x: 1300, y: 470, z: 1.08, d: 1.6 },
    { t: tVence - 0.4, x: 2400, y: 480, z: 1.0, d: 1.6 }, { t: tPlaca, x: 2200, y: 470, z: 1.1, d: 1.6 }, { t: tCota, x: 2600, y: 460, z: 1.06, d: 1.6 }, { t: tParc, x: 2500, y: 480, z: 1.02, d: 1.8, dx: -3 },
  ];
  const sfx = [[tPrim, 'pop', 0.3], [tDuas, 'whoosh', 0.3], [tVenal, 'paper', 0.4], [tFipe, 'tick', 0.35], [tAliq, 'clank', 0.35], [t4, 'stamp', 0.45], [tHatch, 'pop', 0.35], [t3240, 'cash', 0.45],
    [tVence - 0.3, 'whoosh', 0.3], [tVence + 0.4, 'flip', 0.4, { dur: 0.5 }], [tPlaca, 'tick', 0.35], [tCota, 'pop', 0.35], [t97, 'coin', 0.45], [tFev, 'pop', 0.3], [tParc, 'pop', 0.3]];
  return {
    accent: P.estado, cam, sfx, impacts: [t3240], trans: 'push',
    draw(ctx, t, cam2) {
      garagemFundo(ctx, cam2, 0.95);
      zone(ctx, cam2, 700, 1300, () => {
        if (t > tVence + 0.6) return;
        const k = vis(t, 0, tVence, 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        headline(ctx, 'a conta tem duas partes', 960, 110, { size: 58, k: vis(t, tDuas, tVenal + 0.4, 0.5, 0.4), hl: '#7c2d12' });
        const kc = appear(t, tPrim, 0.6);
        carroLado(ctx, 470, 560, 0.85, { a: clamp(kc * 2) });
        ctx.save(); ctx.globalAlpha *= clamp(kc * 2); ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(560, 470); ctx.lineTo(560, 380); ctx.stroke(); ctx.restore();
        etiqueta(ctx, 560, 290, 0.95, 'VALOR VENAL', t > tHatch ? 'R$ 81.000' : 'R$ ?', '#111827', { a: clamp(kc * 2) });
        // a pesquisa de preços: anúncios de lojas voando até a etiqueta
        if (t > tFipe && t < tSet + 1.6) {
          [['R$ 79 mil', 160, 150], ['R$ 83 mil', 260, 560], ['R$ 80 mil', 900, 170], ['R$ 82 mil', 820, 600]].forEach(([v, x0, y0], i) => {
            const t0 = tFipe + 0.2 + i * 0.45, p = ease.inOut(prog(t, t0 + 0.5, 0.9));
            const ka = appear(t, t0, 0.3) * (1 - prog(t, t0 + 0.9, 0.35)); if (ka <= 0) return;
            ctx.save(); ctx.globalAlpha *= ka; ctx.translate(lerp(x0, 560, p), lerp(y0, 300, p)); ctx.rotate((i % 2 ? 0.08 : -0.08) * (1 - p)); ctx.scale(lerp(1, 0.4, p), lerp(1, 0.4, p));
            ctx.save(); papelSombra(ctx); fillRR(ctx, -95, -34, 190, 68, 10, '#f8fafc'); ctx.restore();
            text(ctx, 'loja ' + (i + 1), 0, -14, { size: 16, weight: 900, color: '#64748b' });
            text(ctx, v, 0, 14, { size: 30, weight: 900, color: P.ink });
            ctx.restore();
          });
        }
        chip(ctx, 470, 760, 'pesquisa de preços (Fipe)', '#e2e8f0', vis(t, tFipe, tHatch, 0.4, 0.4), { size: 22 });
        chip(ctx, 745, 760, 'set · out', '#fde68a', vis(t, tSet, tHatch, 0.4, 0.4), { size: 22 });
        text(ctx, '×', 860, 470, { size: 110, weight: 900, color: '#e2e8f0', alpha: appear(t, tAliq - 0.3, 0.4) });
        const kg = appear(t, tAliq, 0.6);
        if (kg > 0) { ctx.save(); ctx.globalAlpha *= clamp(kg * 2); engrenagem(ctx, 1110, 470, 130, t * 0.25, t > t4 ? '4%' : '?', P.estado); ctx.restore(); }
        chip(ctx, 1110, 700, 'cada estado escolhe', P.estado, appear(t, tCada, 0.4), { size: 24 });
        chip(ctx, 1110, 760, 'SP · carro de passeio', P.estado, appear(t, t4 - 0.2, 0.4), { size: 22 });
        text(ctx, '=', 1340, 470, { size: 110, weight: 900, color: '#e2e8f0', alpha: appear(t, t3240 - 0.3, 0.4) });
        const kr = appear(t, t3240, 0.5);
        if (kr > 0) { bigNum(ctx, 'R$ ' + Math.round(counting(t, t3240, 1.0, 0, 3240)).toLocaleString('pt-BR'), 1640, 470, kr, { size: 96, color: P.amber }); text(ctx, 'IPVA 2027 em SP', 1640, 560, { size: 30, weight: 900, color: '#e2e8f0', alpha: kr }); }
        ctx.restore();
      });
      zone(ctx, cam2, 2200, 2600, () => {
        if (t < tVence - 0.8) return;
        const k = appear(t, tVence - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        sombraChao(ctx, 2130, 760, 300);
        const marcas = {}; for (let d = 11; d <= 22; d++) if (![16, 17].includes(d)) marcas[d] = { cor: P.estado, fill: prog(t, tVence + 0.4 + (d - 11) * 0.06, 0.3) };
        calendario(ctx, 2130, 480, 1.0, { nome: 'JANEIRO', ano: 2027, dias: 31, inicio: 5, marcas }, { rot: -0.03, cor: '#b45309', key: 'jan' });
        chip(ctx, 2130, 170, 'um dia para cada final de placa', P.estado, appear(t, tPlaca, 0.4), { size: 24 });
        const ops = [[tCota, 'JANEIRO · cota única', '−3%', P.voce], [tFev, 'FEVEREIRO · valor cheio', '0%', '#e2e8f0'], [tParc, 'ATÉ 5 PARCELAS', 'sem desconto', '#93c5fd']];
        ops.forEach(([tt, a, b, cor], i) => {
          const ko = appear(t, tt, 0.5); if (ko <= 0) return;
          const y = 260 + i * 170;
          ctx.save(); ctx.globalAlpha *= clamp(ko * 2); ctx.translate((1 - ease.out(ko)) * 60, 0);
          fillRR(ctx, 2560, y - 60, 520, 120, 20, 'rgba(15,23,42,0.85)'); strokeRR(ctx, 2560, y - 60, 520, 120, 20, cor, 4);
          text(ctx, a, 2590, y - 20, { size: 26, weight: 900, color: '#e2e8f0', align: 'left' });
          text(ctx, b, 2590, y + 26, { size: 40, weight: 900, color: cor, align: 'left' });
          ctx.restore();
        });
        chip(ctx, 2820, 340, 'uns R$ 97 a menos', P.voce, appear(t, t97, 0.4), { size: 24, bg: '#052e16' });
        ctx.restore();
      });
      poeiraLuz(ctx, cam2, t, 5, 9);
    },
    overlay(ctx, t) {
      source(ctx, 'Lei 13.296/2008 (SP); Fipe; conta do canal', vis(t, tVenal, tVence, 0.5, 0.4));
      source(ctx, 'Decreto 70.960/2026 (SP)', vis(t, tVence, 99, 0.5, 0.4));
    },
  };
}

// ================================================================ Cena 03: quem fica com cada real (a faixa vira 40 · 40 · 20 e os canhotos voam para os prédios)
function scene03(K) {
  const tAgora = K('Agora, para onde vai'), tConst = K('A Constituição manda metade'), tOutra = K('A outra metade fica com o estado'), tSoQ = K('Só que, das duas metades'), tFundeb = K('o Fundeb'), tAlunos = K('dividido pelo número de alunos');
  const tCem = K('Pega cem reais pagos'), t40a = K('Uns quarenta ficam'), t40b = K('Outros quarenta vão'), t20 = K('E vinte vão para o fundo'), t1200 = K('mais de mil e duzentos reais'), tRepara = K('E repara numa coisa'), tEstrada = K('está escrito estrada');
  const cam = [
    { t: 0, x: 960, y: 470, z: 1.0, dz: 0.004 }, { t: tConst, x: 1120, y: 500, z: 1.12, d: 1.4 }, { t: tOutra, x: 800, y: 500, z: 1.12, d: 1.4 }, { t: tSoQ, x: 960, y: 480, z: 1.04, d: 1.4 },
    { t: tCem - 0.4, x: 2400, y: 470, z: 1.0, d: 1.6 }, { t: t40a, x: 2200, y: 470, z: 1.05, d: 1.4 }, { t: t20, x: 2560, y: 470, z: 1.05, d: 1.4 }, { t: t1200, x: 2400, y: 420, z: 1.08, d: 1.4 }, { t: tRepara - 0.6, x: 2400, y: 560, z: 1.02, d: 1.2 },
  ];
  const DEST = [[2000, P.estado, 'R$ 40', 'ESTADO', t40a], [2420, P.pref, 'R$ 40', 'PREFEITURA', t40b], [2880, P.escola, 'R$ 20', 'ESCOLAS', t20]];
  const sfx = [[tAgora, 'pop', 0.3], [tConst, 'stamp', 0.45], [tOutra, 'pop', 0.35], [tSoQ + 0.3, 'whoosh', 0.35, { dur: 0.8 }], [tFundeb, 'ding', 0.35], [tAlunos, 'pop', 0.3],
    [tCem - 0.3, 'whoosh', 0.3], [tCem + 0.2, 'paper', 0.45], ...DEST.map(([, , , , tt]) => [tt + 0.1, 'paper', 0.45, { dur: 0.4 }]), [t1200, 'cash', 0.4], [tEstrada, 'drop', 0.4]];
  return {
    accent: P.pref, cam, sfx, impacts: [], trans: 'push',
    draw(ctx, t, cam2) {
      garagemFundo(ctx, cam2, 0.95);
      zone(ctx, cam2, 800, 1120, () => {
        if (t > tCem + 0.6) return;
        const k = vis(t, 0, tCem, 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        sombraChao(ctx, 960, 790, 420);
        guiaIPVA(ctx, 960, 470, 0.92, { split: prog(t, tSoQ + 0.3, 1.6), valor: 'R$ 3.240,00', key: 'c' });
        if (t < tSoQ + 0.2) {
          penCircle(ctx, 1193, 512, 250, 92, P.pref, prog(t, tConst, 0.7) * (1 - appear(t, tOutra, 0.3)), 7);
          penCircle(ctx, 727, 512, 250, 92, P.estado, prog(t, tOutra, 0.7), 7);
        }
        chip(ctx, 1193, 130, 'Constituição: metade para a cidade', P.pref, vis(t, tConst, tSoQ, 0.4, 0.3), { size: 28 });
        chip(ctx, 960, 130, 'Fundeb: escola pública do estado e das cidades', P.escola, vis(t, tFundeb, tAlunos, 0.4, 0.3), { size: 28 });
        chip(ctx, 960, 130, 'dividido pelo número de alunos', P.escola, vis(t, tAlunos, tCem, 0.4, 0.4), { size: 28 });
        ctx.restore();
      });
      zone(ctx, cam2, 2200, 2600, () => {
        if (t < tCem - 0.8) return;
        const k = appear(t, tCem - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        palacio(ctx, 2000, 610, 0.68, { a: appear(t, t40a - 0.6, 0.5) });
        prefeitura(ctx, 2420, 610, 0.68, { a: appear(t, t40b - 0.6, 0.5) });
        escola(ctx, 2860, 620, 0.6, { a: appear(t, t20 - 0.6, 0.5) });
        chip(ctx, 2420, 120, 'R$ 100 de IPVA em São Paulo', '#e2e8f0', vis(t, tCem, t1200, 0.4, 0.4), { size: 28 });
        canhoto(ctx, 2420, 230, 0.85, P.amber, 'R$ 100', 'IPVA PAGO', { a: vis(t, tCem + 0.2, t20 + 0.4, 0.4, 0.4) });
        for (const [dx, cor, val, lab, tt] of DEST) {
          const p = ease.inOut(prog(t, tt, 0.9)); if (t < tt - 0.3) continue;
          const x = lerp(2420, dx, p), y = lerp(230, 360, p) - Math.sin(p * Math.PI) * 60;
          canhoto(ctx, x, y, 0.75, cor, val, lab, { rot: lerp(0, (dx - 2420) / 4000, p), a: appear(t, tt - 0.3, 0.3) });
        }
        chip(ctx, 2420, 200, 'no boleto do exemplo: + R$ 1.296 para a cidade', P.pref, appear(t, t1200, 0.4), { size: 26 });
        const ke = appear(t, tRepara + 0.6, 0.5);
        if (ke > 0) {
          ctx.save(); ctx.globalAlpha *= ke; ctx.translate(2420, 770);
          fillRR(ctx, -170, -40, 340, 80, 10, '#166534'); strokeRR(ctx, -170, -40, 340, 80, 10, '#f8fafc', 4);
          text(ctx, 'ESTRADA', 0, 2, { size: 40, weight: 900, color: '#f8fafc', letter: 4 });
          ctx.restore();
          tagX(ctx, 2420, 770, 1.4, prog(t, tEstrada, 0.5));
        }
        ctx.restore();
      });
      poeiraLuz(ctx, cam2, t, 7, 8);
    },
    overlay(ctx, t) { source(ctx, 'Constituição, art. 158; Lei do Fundeb; Sefaz-SP', vis(t, tConst, 99, 0.5, 0.4)); },
  };
}

// ================================================================ Cena 04: o mapa (SP, MG e RJ x Paraná) e a regra do domicílio
function scene04(K) {
  const tMuda = K('Muda o mapa'), tMinas = K('Minas e Rio cobram'), tPR = K('Já o Paraná cortou'), tMenor = K('a menor do país'), tMesmo = K('O mesmo hatch'), t1540 = K('uns mil quinhentos e quarenta');
  const tLinha = K('A diferença vem de uma linha'), tEfeito = K('E o efeito apareceu'), tQR = K('os emplacamentos no Paraná'), tRegra = K('Só que tem uma regra'), tDevido = K('O imposto é devido onde'), tSup = K('e o Supremo já decidiu'), tIrreg = K('Emplacar lá sem morar lá');
  const cam = [
    { t: 0, x: 960, y: 470, z: 1.0, dx: 2 }, { t: tMinas, x: 1020, y: 520, z: 1.12, d: 1.6 }, { t: tPR, x: 900, y: 580, z: 1.16, d: 1.6 }, { t: tMenor, x: 960, y: 500, z: 1.04, d: 1.4 },
    { t: tMesmo - 0.4, x: 2400, y: 470, z: 1.0, d: 1.6 }, { t: tLinha, x: 2400, y: 440, z: 1.06, d: 1.6 },
    { t: tEfeito - 0.4, x: 3800, y: 480, z: 1.0, d: 1.6 }, { t: tRegra - 0.4, x: 5200, y: 480, z: 1.0, d: 1.6 }, { t: tIrreg, x: 5240, y: 540, z: 1.04, d: 1.6 },
  ];
  const sfx = [[tMuda, 'whoosh', 0.35], [tMinas, 'pop', 0.35], [tPR, 'drop', 0.45], [tMenor, 'ding', 0.35], [tMesmo - 0.3, 'whoosh', 0.3], [tMesmo + 0.3, 'clank', 0.3], [t1540, 'coin', 0.4], [tLinha, 'pop', 0.3],
    [tEfeito - 0.3, 'whoosh', 0.3], [tQR, 'riser', 0.3, { dur: 1.0 }], [tRegra - 0.3, 'whoosh', 0.3], [tSup, 'gavel', 0.6], [tIrreg + 0.4, 'drop', 0.35]];
  return {
    accent: P.voce, cam, sfx, impacts: [tSup], trans: 'push',
    draw(ctx, t, cam2) {
      garagemFundo(ctx, cam2, 0.95, 0.1);
      zone(ctx, cam2, 900, 1100, () => {
        if (t > tMesmo + 0.6) return;
        const k = vis(t, 0, tMesmo, 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        const kA = appear(t, tMinas, 0.6), kP = appear(t, tPR, 0.6);
        const c = mapaBR(ctx, 760, 440, 17, { SP: { cor: P.estado, k: Math.max(appear(t, tMuda, 0.6), kA) }, MG: { cor: P.estado, k: kA }, RJ: { cor: P.estado, k: kA }, PR: { cor: P.voce, k: kP } });
        for (const uf of ['MG', 'RJ', 'SP']) { const [x, y] = c[uf]; chip(ctx, x + (uf === 'RJ' ? 70 : 0), y + (uf === 'SP' ? -10 : 0), uf + ' · 4%', P.estado, uf === 'SP' ? appear(t, tMuda, 0.4) : kA, { size: 20 }); }
        if (kP > 0) { const [x, y] = c.PR; const v = counting(t, tPR + 0.4, 1.6, 3.5, 1.9); chip(ctx, x - 40, y + 30, 'PR · ' + v.toFixed(1).replace('.', ',') + '%', P.voce, kP, { size: 22 }); }
        // painel ao lado do mapa: as duas alíquotas que a cena compara
        const kq = appear(t, tMuda + 0.3, 0.5);
        if (kq > 0) { bigNum(ctx, '4%', 1460, 230, kq, { size: 96, color: '#93c5fd' }); text(ctx, 'SP · MG · RJ', 1460, 300, { size: 32, weight: 900, color: '#e2e8f0', alpha: appear(t, tMinas, 0.4) }); }
        const kv = appear(t, tPR + 0.4, 0.5);
        if (kv > 0) { bigNum(ctx, '1,9%', 1460, 480, kv, { size: 96, color: P.voce }); text(ctx, 'PR · era 3,5% até 2025', 1460, 550, { size: 30, weight: 900, color: '#bbf7d0', alpha: kv }); shockRing(ctx, t, tPR + 0.4, 1460, 470, P.voce, 40, 220); }
        headline(ctx, 'o menor IPVA do país', 1460, 680, { size: 50, k: appear(t, tMenor + 0.4, 0.5), color: '#bbf7d0', color2: P.voce });
        ctx.restore();
      });
      zone(ctx, cam2, 2300, 2500, () => {
        if (t < tMesmo - 0.8 || t > tEfeito + 0.6) return;
        const k = vis(t, tMesmo - 0.3, tEfeito, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        for (const [px, uf, val, cor, tt] of [[2050, 'SP', 'R$ 3.240', '#f87171', tMesmo + 0.3], [2750, 'PR', 'uns R$ 1.540', P.voce, t1540]]) {
          chip(ctx, px, 250, uf, cor, appear(t, tMesmo + 0.3, 0.4), { size: 40 });
          placa(ctx, px, 420, 0.95, 'ABC1D23', { a: appear(t, tMesmo + 0.3, 0.4), rot: px > 2400 ? 0.03 : -0.03 });
          bigNum(ctx, val, px, 620, appear(t, tt, 0.5), { size: 70, color: cor });
        }
        chip(ctx, 2400, 120, 'mesmo carro · mesmo valor venal', '#e2e8f0', appear(t, tMesmo + 0.6, 0.4), { size: 28 });
        chip(ctx, 2400, 720, 'a diferença: uma linha na lei de cada estado', '#fde68a', appear(t, tLinha, 0.4), { size: 26 });
        ctx.restore();
      });
      zone(ctx, cam2, 3700, 3900, () => {
        if (t < tEfeito - 0.8 || t > tRegra + 0.6) return;
        const k = vis(t, tEfeito - 0.3, tRegra, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        text(ctx, 'carros emplacados no Paraná', 3800, 150, { size: 38, weight: 900, color: '#e2e8f0' });
        const base = 720, kb1 = appear(t, tEfeito, 0.6), kb2 = appear(t, tQR, 1.0);
        fillRR(ctx, 3400, base, 800, 6, 3, '#64748b');
        ctx.save(); ctx.shadowColor = 'rgba(148,163,184,0.5)'; ctx.shadowBlur = 16; fillRR(ctx, 3500, base - 220 * ease.out(kb1), 200, 220 * ease.out(kb1), 12, '#94a3b8'); ctx.restore();
        ctx.save(); ctx.shadowColor = hexA(P.voce, 0.6); ctx.shadowBlur = 20; fillRR(ctx, 3900, base - 450 * ease.out(kb2), 200, 450 * ease.out(kb2), 12, P.voce); ctx.restore();
        text(ctx, 'antes', 3600, base + 40, { size: 28, weight: 900, color: '#cbd5e1', alpha: kb1 }); text(ctx, 'com o IPVA menor', 4000, base + 40, { size: 28, weight: 900, color: '#bbf7d0', alpha: kb2 });
        chip(ctx, 4000, base - 520, 'quase o dobro · Quatro Rodas', P.voce, appear(t, tQR + 0.8, 0.4), { size: 26 });
        ctx.restore();
      });
      zone(ctx, cam2, 5100, 5300, () => {
        if (t < tRegra - 0.8) return;
        const k = appear(t, tRegra - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        casinha(ctx, 4900, 560, 1.0);
        chip(ctx, 4900, 300, 'o dono mora em SP', P.estado, appear(t, tDevido, 0.4), { size: 28 });
        carroLado(ctx, 5480, 640, 0.8, { cor: '#2563eb' });
        placa(ctx, 5480, 430, 0.6, 'PRX2A26', { a: appear(t, tDevido, 0.5) });
        chip(ctx, 5480, 330, 'placa do PR', P.voce, appear(t, tDevido + 0.3, 0.4), { size: 24 });
        rectStamp(ctx, 5200, 150, 640, 120, 'VALE ONDE O DONO MORA', '#f8fafc', appear(t, tSup, 0.35), -0.03, 40, 'DECISÃO DO STF');
        tagX(ctx, 5480, 430, 1.8, prog(t, tIrreg + 0.4, 0.5));
        chip(ctx, 5480, 780, 'irregular: a Fazenda de onde você mora cobra', '#fca5a5', appear(t, tIrreg + 0.8, 0.4), { size: 22 });
        ctx.restore();
      });
      poeiraLuz(ctx, cam2, t, 9, 8);
    },
    overlay(ctx, t) {
      source(ctx, 'Sefaz de cada estado; Assembleia do PR (2025)', vis(t, tMinas, tEfeito, 0.5, 0.4));
      source(ctx, 'Quatro Rodas', vis(t, tQR, tRegra, 0.5, 0.4));
      source(ctx, 'STF', vis(t, tSup, 99, 0.5, 0.4));
    },
  };
}

// ================================================================ Cena 05: a virada (a etiqueta da tabela descola e mostra o preço de verdade)
function scene05(K) {
  const tPed = K('Tem um pedaço dessa conta'), tValor = K('o valor do carro'), tChin = K('a chegada de carros chineses'), tDerr = K('derrubou o preço dos usados'), tOut = K('Em outubro, mais de três quartos');
  const tDev = K('Só que a tabela anda mais devagar'), tG1 = K('Um levantamento publicado pelo g1'), tNove = K('uns nove por cento a menos'), tQuatro = K('quase quatro vezes a queda');
  const tOuSeja = K('Ou seja'), tMenor = K('deve vir um pouco menor'), tAcima = K('a conta pode usar um valor acima'), tSegue = K('O imposto segue a tabela');
  const tPeel = tAcima + 0.3;
  const cam = [
    { t: 0, x: 960, y: 470, z: 1.02, dz: 0.004 }, { t: tValor, x: 1060, y: 420, z: 1.12, d: 1.4 }, { t: tChin, x: 960, y: 520, z: 1.0, d: 1.6, dx: 3 },
    { t: tOut - 0.4, x: 2400, y: 470, z: 1.0, d: 1.6 }, { t: tDev - 0.3, x: 3800, y: 470, z: 1.0, d: 1.6 }, { t: tNove, x: 3900, y: 450, z: 1.06, d: 1.6 },
    { t: tOuSeja - 0.4, x: 5200, y: 470, z: 1.0, d: 1.4 }, { t: tAcima, x: 5300, y: 430, z: 1.15, d: 1.4 }, { t: tSegue, x: 5200, y: 460, z: 1.04, d: 1.8, dz: 0.003 },
  ];
  const sfx = [[tPed, 'pop', 0.3], [tValor, 'paper', 0.4], [tChin, 'whoosh', 0.35, { dur: 0.9 }], [tDerr, 'drop', 0.34], [tOut - 0.3, 'whoosh', 0.3], ...Array.from({ length: 10 }, (_, i) => [tOut + 0.4 + i * 0.12, 'tick', 0.22]),
    [tDev - 0.3, 'whoosh', 0.3], [tG1, 'pop', 0.3], [tNove, 'drop', 0.4], [tQuatro, 'hit', 0.4], [tOuSeja - 0.3, 'whoosh', 0.3], [tPeel, 'paper', 0.6, { dur: 0.6 }], [tPeel + 0.5, 'riser', 0.25, { dur: 0.7 }], [tSegue, 'stamp', 0.45]];
  return {
    accent: P.voce, cam, sfx, impacts: [tPeel + 0.5], trans: 'push',
    draw(ctx, t, cam2) {
      garagemFundo(ctx, cam2, 0.95, 0.2);
      zone(ctx, cam2, 900, 1100, () => {
        if (t > tOut + 0.6) return;
        const k = vis(t, 0, tOut, 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        carroLado(ctx, 900, 560, 1.15);
        ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(1100, 470); ctx.lineTo(1260, 320); ctx.stroke();
        etiqueta(ctx, 1300, 250, 1.0, 'ANÚNCIO · USADO', 'R$ 81 mil', '#111827');
        shockRing(ctx, t, tValor, 1300, 260, '#fde68a', 80, 300);
        chip(ctx, 1220, 400, 'valor venal = o que o carro vale na tabela', '#fde68a', vis(t, tValor, tDerr, 0.4, 0.4), { size: 22 });
        arrow(ctx, 1540, 180, 1540, 330, P.voce, 9, appear(t, tDerr, 0.5));
        chip(ctx, 1540, 400, 'o preço dos usados caiu', P.voce, appear(t, tDerr + 0.3, 0.4), { size: 24 });
        chip(ctx, 960, 110, 'o pedaço que ninguém olha: o valor do carro', '#fde68a', appear(t, tPed, 0.4), { size: 28 });
        for (let i = 0; i < 3; i++) { const p = ease.out(prog(t, tChin + i * 0.25, 1.0)); if (p <= 0) continue; carroLado(ctx, lerp(2100, 520 + i * 360, p), 790, 0.42, { cor: ['#e5e7eb', '#0ea5e9', '#16a34a'][i], flip: false }); }
        chip(ctx, 960, 680, 'carros chineses mais baratos chegando', '#93c5fd', appear(t, tChin + 0.6, 0.4), { size: 24 });
        ctx.restore();
      });
      zone(ctx, cam2, 2300, 2500, () => {
        if (t < tOut - 0.8 || t > tDev + 0.6) return;
        const k = vis(t, tOut - 0.3, tDev, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        text(ctx, '100 modelos da tabela Fipe · outubro', 2400, 130, { size: 34, weight: 900, color: '#e2e8f0' });
        for (let i = 0; i < 100; i++) {
          const cx = 1980 + (i % 20) * 44, cy = 260 + Math.floor(i / 20) * 80, caiu = i % 4 !== 3 || i > 96;
          const kk = appear(t, tOut + 0.4 + (i % 20) * 0.06, 0.3);
          fillRR(ctx, cx - 18, cy - 24, 36, 48, 6, caiu && kk > 0.5 ? hexA(P.voce, 0.85) : '#475569');
          if (caiu && kk > 0.5) { ctx.fillStyle = '#052e16'; ctx.beginPath(); ctx.moveTo(cx - 10, cy - 6); ctx.lineTo(cx + 10, cy - 6); ctx.lineTo(cx, cy + 10); ctx.closePath(); ctx.fill(); }
        }
        bigNum(ctx, 'mais de 3/4 ficaram mais baratos', 2400, 720, appear(t, tOut + 1.6, 0.5), { size: 56, color: P.voce });
        ctx.restore();
      });
      zone(ctx, cam2, 3700, 3900, () => {
        if (t < tDev - 0.8 || t > tOuSeja + 0.6) return;
        const k = vis(t, tDev - 0.3, tOuSeja, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        text(ctx, 'quanto o preço caiu · seminovos de até 3 anos · 1º semestre', 3800, 130, { size: 30, weight: 900, color: '#e2e8f0' });
        const base = 300, esc = 36, kf = appear(t, tDev + 0.3, 0.8), km = appear(t, tG1 + 0.8, Math.max(0.6, tNove + 1.8 - (tG1 + 0.8))), kn = appear(t, tNove + 1.6, 0.5);
        fillRR(ctx, 3350, base, 900, 6, 3, '#64748b');
        ctx.save(); ctx.shadowColor = 'rgba(148,163,184,0.5)'; ctx.shadowBlur = 14; fillRR(ctx, 3450, base, 220, 2.4 * esc * ease.out(kf), 12, '#94a3b8'); ctx.restore();
        ctx.save(); ctx.shadowColor = hexA(P.voce, 0.6); ctx.shadowBlur = 20; fillRR(ctx, 3930, base, 220, 9.3 * esc * ease.out(km), 12, P.voce); ctx.restore();
        text(ctx, 'tabela Fipe', 3560, base - 40, { size: 30, weight: 900, color: '#cbd5e1', alpha: kf });
        text(ctx, 'venda de verdade', 4040, base - 40, { size: 30, weight: 900, color: '#bbf7d0', alpha: clamp(km * 4) });
        text(ctx, '−9%', 4040, base + 9.3 * esc + 50, { size: 54, weight: 900, color: P.voce, alpha: kn });
        chip(ctx, 4040, base + 9.3 * esc + 130, 'quase 4 vezes a queda da tabela', P.voce, appear(t, tQuatro, 0.4), { size: 26 });
        chip(ctx, 3560, base + 160, 'a tabela anda devagar', '#cbd5e1', appear(t, tDev + 0.6, 0.4), { size: 24 });
        ctx.restore();
      });
      zone(ctx, cam2, 5100, 5300, () => {
        if (t < tOuSeja - 0.8) return;
        const k = appear(t, tOuSeja - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        carroLado(ctx, 4980, 600, 1.1);
        ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(5160, 510); ctx.lineTo(5330, 360); ctx.stroke();
        // por baixo: o preço que o carro consegue de verdade
        etiqueta(ctx, 5380, 290, 1.05, 'NA LOJA, DE VERDADE', 'uns R$ 74 mil', P.voce, { bg: '#ecfdf5' });
        // por cima: a etiqueta da tabela descola a partir do canto (a única transição de efeito do vídeo)
        const pe = ease.inOut(prog(t, tPeel, 1.1));
        if (pe < 1) {
          ctx.save(); ctx.translate(5380 + 170, 290 + 80); ctx.rotate(-pe * 1.9); ctx.translate(-(5380 + 170) + pe * 140, -(290 + 80) - pe * 60);
          ctx.globalAlpha *= 1 - pe * 0.15;
          etiqueta(ctx, 5380, 290, 1.05, 'TABELA FIPE', 'R$ 81 mil', '#111827');
          ctx.restore();
        }
        if (pe >= 1) { // a etiqueta da tabela pendurada ao lado, que é a que o imposto usa
          etiqueta(ctx, 5760, 400, 0.8, 'TABELA FIPE', 'R$ 81 mil', '#111827', { rot: -0.12 });
          arrow(ctx, 5760, 500, 5760, 580, '#fde68a', 7, appear(t, tSegue, 0.5));
          chip(ctx, 5760, 630, 'o IPVA usa esta', '#fde68a', appear(t, tSegue + 0.2, 0.4), { size: 26 });
        }
        sparks(ctx, t, tPeel + 0.5, 5380, 300, '#fde68a', 16);
        chip(ctx, 5200, 120, 'IPVA 2027: um pouco menor', P.voce, appear(t, tMenor, 0.4), { size: 28 });
        chip(ctx, 5380, 470, 'exemplo', '#94a3b8', appear(t, tPeel + 1.0, 0.4), { size: 20 });
        ctx.restore();
      });
      poeiraLuz(ctx, cam2, t, 11, 8);
    },
    overlay(ctx, t) {
      source(ctx, 'Fipe (out/2026, via A Tarde)', vis(t, tOut, tDev, 0.5, 0.4));
      source(ctx, 'g1 (4/9/2026)', vis(t, tG1, tOuSeja, 0.5, 0.4));
    },
  };
}

// ================================================================ Cena 06: quem não paga (o carro velho, a moto, e o jatinho e a lancha até agora)
function scene06(K) {
  const tQuem = K('E tem quem não pague'), tVinte = K('carro com mais de vinte anos'), tDez = K('são quase dez milhões'), tMotos = K('as motos de até cento'), tOutro = K('Do outro lado, por décadas');
  const tSup = K('porque o Supremo entendeu'), tRef = K('A reforma tributária mudou'), t2027 = K('prevista para começar em 2027'), tLei = K('conforme a lei de cada estado'), tComum = K('tinham uma coisa em comum'), tNenhum = K('nenhum dos dois pagava');
  const cam = [
    { t: 0, x: 960, y: 480, z: 1.0, dx: 3 }, { t: tVinte, x: 760, y: 520, z: 1.1, d: 1.6 }, { t: tDez, x: 1200, y: 460, z: 1.06, d: 1.6 }, { t: tMotos, x: 1300, y: 560, z: 1.1, d: 1.4 },
    { t: tOutro - 0.4, x: 2400, y: 470, z: 1.0, d: 1.6 }, { t: tRef, x: 2400, y: 440, z: 1.06, d: 1.6 }, { t: tComum - 0.4, x: 3800, y: 470, z: 1.0, d: 1.6 }, { t: tNenhum, x: 3800, y: 400, z: 1.1, d: 1.4 },
  ];
  const sfx = [[tQuem, 'pop', 0.3], [tVinte, 'paper', 0.4, { dur: 0.6 }], [tVinte + 1.0, 'stamp', 0.5], [tDez, 'tick', 0.3], [tMotos, 'pop', 0.35], [tOutro - 0.3, 'whoosh', 0.35, { dur: 0.8 }], [tOutro + 1.5, 'stamp', 0.4], [tSup, 'gavel', 0.5],
    [tRef, 'stamp', 0.5], [t2027, 'ding', 0.35], [tComum - 0.3, 'whoosh', 0.3], [tNenhum, 'hit', 0.35]];
  return {
    accent: '#94a3b8', cam, sfx, impacts: [tVinte + 1.0], trans: 'push',
    draw(ctx, t, cam2) {
      garagemFundo(ctx, cam2, 0.95, 0.15);
      zone(ctx, cam2, 760, 1300, () => {
        if (t > tOutro + 0.6) return;
        const k = vis(t, 0, tOutro, 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        headline(ctx, 'quem não paga', 960, 110, { size: 62, k: vis(t, tQuem, tDez, 0.5, 0.4), hl: '#334155' });
        carroCapa(ctx, 640, 560, 1.05, { a: appear(t, tVinte - 0.3, 0.5) });
        chip(ctx, 640, 380, 'mais de 20 anos (SP)', '#e2e8f0', appear(t, tVinte, 0.4), { size: 28 });
        rectStamp(ctx, 640, 520, 300, 100, 'ISENTO', P.voce, appear(t, tVinte + 1.0, 0.35), -0.1, 54);
        const kd = appear(t, tDez, 0.5);
        if (kd > 0) {
          for (let i = 0; i < 30; i++) { const x = 1150 + (i % 6) * 90, y = 220 + Math.floor(i / 6) * 70, iso = i < 10; ctx.save(); ctx.globalAlpha *= appear(t, tDez + i * 0.03, 0.3); fillRR(ctx, x - 34, y - 14, 68, 24, 8, iso ? P.voce : '#64748b'); circle(ctx, x - 20, y + 12, 9, '#111318'); circle(ctx, x + 20, y + 12, 9, '#111318'); ctx.restore(); }
          chip(ctx, 1375, 150, 'verde: isentos', P.voce, kd, { size: 22 });
          text(ctx, 'quase 10 dos 30 milhões de veículos de SP', 1375, 600, { size: 28, weight: 900, color: '#e2e8f0', alpha: kd });
        }
        moto(ctx, 1380, 730, 0.75, { a: appear(t, tMotos, 0.5) });
        chip(ctx, 1380, 655, 'motos até 180 cc · isentas desde 2026 (SP)', P.voce, appear(t, tMotos + 0.5, 0.4), { size: 22 });
        ctx.restore();
      });
      zone(ctx, cam2, 2300, 2500, () => {
        if (t < tOutro - 0.8 || t > tComum + 0.6) return;
        const k = vis(t, tOutro - 0.3, tComum, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        const dv = t - tOutro; // jatinho e lancha andando devagar, o helicóptero pairando
        jatinho(ctx, 2050 + dv * 9, 300 - Math.sin(dv * 0.6) * 8, 0.9, { a: appear(t, tOutro + 0.2, 0.5) });
        helicoptero(ctx, 2800, 330 + Math.sin(dv * 1.3) * 10, 0.75, t, { a: appear(t, tOutro + 0.6, 0.5) });
        lancha(ctx, 2300 + dv * 7, 620 + Math.sin(dv * 1.7) * 4, 0.9, t, { a: appear(t, tOutro + 1.0, 0.5) });
        rectStamp(ctx, 2400, 450, 380, 100, 'IPVA: R$ 0', '#f8fafc', vis(t, tOutro + 1.5, tRef, 0.35, 0.4), -0.06, 54);
        chip(ctx, 2400, 110, 'STF: o IPVA era só de veículo terrestre', '#e2e8f0', vis(t, tSup, tRef, 0.4, 0.4), { size: 26 });
        chip(ctx, 2400, 110, 'reforma tributária: cobrança prevista a partir de 2027', P.amber, appear(t, tRef + 0.3, 0.4), { size: 26 });
        rectStamp(ctx, 2900, 640, 260, 100, '2027', P.amber, appear(t, t2027, 0.35), 0.08, 60);
        chip(ctx, 2400, 190, 'depende da lei de cada estado', '#fde68a', appear(t, tLei, 0.4), { size: 24 });
        ctx.restore();
      });
      zone(ctx, cam2, 3700, 3900, () => {
        if (t < tComum - 0.8) return;
        const k = appear(t, tComum - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        carroCapa(ctx, 3460, 600, 0.75);
        jatinho(ctx, 4180, 560, 0.7);
        ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(3798, 220, 4, 520);
        bigNum(ctx, 'R$ 0', 3460, 300, appear(t, tNenhum, 0.5), { size: 90, color: '#e2e8f0' });
        bigNum(ctx, 'R$ 0', 4180, 300, appear(t, tNenhum + 0.2, 0.5), { size: 90, color: '#e2e8f0' });
        text(ctx, 'até agora', 3800, 160, { size: 34, weight: 900, color: '#fde68a', alpha: appear(t, tComum, 0.4) });
        ctx.restore();
      });
      poeiraLuz(ctx, cam2, t, 13, 8);
    },
    overlay(ctx, t) {
      source(ctx, 'Sefaz-SP (frota de 2026); Lei paulista de 2025 (motos)', vis(t, tDez, tOutro, 0.5, 0.4));
      source(ctx, 'STF; Emenda Constitucional 132/2023', vis(t, tSup, 99, 0.5, 0.4));
    },
  };
}

// ================================================================ Cena 07: o buraco da rua (a promessa da cena 1 se paga)
function scene07(K) {
  const tAg = K('Agora, o buraco da rua'), t69 = K('Em 1969, o governo criou'), tEnd = K('O dinheiro tinha endereço'), tDept = K('ia para o departamento de estradas'), t85 = K('Em 1985, essa taxa virou imposto');
  const tMudou = K('E aí mudou tudo'), tCF = K('A Constituição de 1988'), tProib = K('é proibido amarrar'), tExc = K('com exceção de saúde'), tFaz = K('A própria Fazenda de São Paulo'), tTit = K('paguei meu IPVA e minha rua');
  const tAsf = K('O asfalto da sua rua sai'), tAjuda = K('O seu IPVA ajuda'), tCar = K('não tem carimbo de buraco');
  const cam = [
    { t: 0, x: 960, y: 470, z: 1.0, dz: 0.004 }, { t: tEnd, x: 1120, y: 560, z: 1.12, d: 1.4 }, { t: t85, x: 960, y: 470, z: 1.02, d: 1.4 }, { t: tMudou, x: 960, y: 440, z: 1.08, d: 1.6 },
    { t: tCF - 0.4, x: 2400, y: 470, z: 1.0, d: 1.6 }, { t: tProib, x: 2560, y: 460, z: 1.12, d: 1.6 }, { t: tExc - 0.5, x: 2400, y: 500, z: 1.02, d: 1.0 },
    { t: tFaz - 0.4, x: 3800, y: 470, z: 1.0, d: 1.6 }, { t: tTit, x: 3760, y: 400, z: 1.12, d: 1.6 }, { t: tAsf - 0.3, x: 5200, y: 470, z: 1.0, d: 1.6 }, { t: tCar, x: 5200, y: 440, z: 1.06, d: 1.6 },
  ];
  const sfx = [[tAg, 'drop', 0.35], [t69, 'paper', 0.45, { dur: 0.6 }], [t69 + 0.4, 'typewriter', 0.35, { n: 10 }], [tDept, 'stamp', 0.42], [t85, 'whoosh', 0.35, { dur: 0.8 }], [tMudou, 'hit', 0.28],
    [tCF - 0.3, 'whoosh', 0.3], [tMudou + 1.6, 'whoosh', 0.25, { dur: 0.8 }], [tCF + 0.3, 'paper', 0.45, { dur: 0.5 }], [tCF + 1.2, 'stamp', 0.4], [tProib, 'tick', 0.35], [tProib + 3.0, 'tick', 0.35], [tExc, 'pop', 0.3], [tFaz - 0.3, 'whoosh', 0.3], [tFaz + 0.3, 'tap', 0.4], [tTit, 'pop', 0.35],
    [tAsf - 0.3, 'whoosh', 0.3], [tAsf + 0.4, 'clank', 0.4], [tCar, 'drop', 0.4]];
  return {
    accent: P.hist, cam, sfx, impacts: [tMudou], trans: 'push',
    draw(ctx, t, cam2) {
      garagemFundo(ctx, cam2, 0.95, 0.2);
      zone(ctx, cam2, 900, 1120, () => {
        if (t > tCF + 0.6) return;
        const k = vis(t, 0, tCF, 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        headline(ctx, 'e o buraco da rua?', 960, 110, { size: 62, k: vis(t, tAg, t69 + 1, 0.5, 0.4), hl: '#c2410c' });
        sombraChao(ctx, 960, 760, 420);
        const kx = ease.inOut(prog(t, t85, 1.2));
        comprovanteTRU(ctx, 960, 450, 0.88, { a: appear(t, t69, 0.5) * (1 - kx), carimbo: appear(t, tDept, 0.35) });
        guiaIPVA(ctx, 960, 450, 0.82, { split: 1, valor: 'R$ 3.240,00', key: 'd', a: kx });
        chip(ctx, 960, 120, '1969: o dinheiro tinha endereço', P.hist, vis(t, tEnd, t85, 0.4, 0.4), { size: 30 });
        chip(ctx, 960, 120, '1985: vira IPVA, imposto dos estados', P.estado, vis(t, t85 + 0.6, tMudou, 0.4, 0.4), { size: 30 });
        headline(ctx, 'imposto não tem destino marcado', 960, 110, { size: 50, k: appear(t, tMudou, 0.5), hl: '#7f1d1d' });
        // sem endereço: setas saem da guia para todo lado, sem destino certo
        [[470, 330, 230, 250], [470, 580, 210, 680], [1450, 330, 1690, 240], [1450, 580, 1710, 690]].forEach(([x0, y0, x1, y1], i) => {
          const ka = appear(t, tMudou + 1.6 + i * 0.25, 0.5); if (ka <= 0) return;
          const w = Math.sin(t * 1.6 + i * 1.7) * 26;
          arrow(ctx, x0, y0, x1, y1 + w, '#fca5a5', 6, ka);
          text(ctx, '?', x1 + (x1 < 960 ? -34 : 34), y1 + w, { size: 54, weight: 900, color: '#fca5a5', alpha: ka });
        });
        ctx.restore();
      });
      zone(ctx, cam2, 2300, 2620, () => {
        if (t < tCF - 0.8 || t > tFaz + 0.6) return;
        const k = vis(t, tCF - 0.3, tFaz, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        sombraChao(ctx, 2400, 770, 460);
        constituicao(ctx, 2400, 440, 0.86, { hl: prog(t, tProib, 0.8) });
        rectStamp(ctx, 2180, 640, 240, 90, '1988', '#166534', appear(t, tCF + 1.2, 0.35), -0.1, 56);
        chip(ctx, 2400, 110, 'art. 167, IV', '#e2e8f0', vis(t, tCF + 2.6, tProib + 2.2, 0.4, 0.4), { size: 28 });
        const kv = vis(t, tProib + 2.4, tExc + 0.3, 0.4, 0.4);
        if (kv > 0) { chip(ctx, 2400, 110, 'IPVA  →  estrada', P.amber, kv, { size: 30 }); crossOut(ctx, 2270, 110, 2530, 110, '#ef4444', prog(t, tProib + 3.0, 0.4) * kv, 9); }
        chip(ctx, 2200, 770, 'exceções: saúde', '#fca5a5', appear(t, tExc + 0.5, 0.4), { size: 26 });
        chip(ctx, 2600, 770, 'e educação', P.escola, appear(t, tExc + 0.9, 0.4), { size: 26 });
        ctx.restore();
      });
      zone(ctx, cam2, 3700, 3900, () => {
        if (t < tFaz - 0.8 || t > tAsf + 0.6) return;
        const k = vis(t, tFaz - 0.3, tAsf, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        sombraChao(ctx, 3800, 760, 460);
        paginaWeb(ctx, 3800, 440, 0.9, 'Paguei meu IPVA e minha rua continua esburacada!');
        penCircle(ctx, 3720, 382, 420, 100, '#ef4444', prog(t, tTit, 0.9), 7);
        { // o cursor do mouse indo até o título
          const pc = ease.inOut(prog(t, tFaz + 0.8, Math.max(0.8, tTit - tFaz - 0.8))), kc = appear(t, tFaz + 0.6, 0.3);
          if (kc > 0) {
            const cx = lerp(4320, 3980, pc), cy = lerp(700, 420, pc) + Math.sin(t * 2) * 3;
            ctx.save(); ctx.globalAlpha *= kc; ctx.translate(cx, cy); ctx.fillStyle = '#111827'; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 52); ctx.lineTo(13, 40); ctx.lineTo(23, 62); ctx.lineTo(32, 58); ctx.lineTo(22, 37); ctx.lineTo(38, 36); ctx.closePath(); ctx.stroke(); ctx.fill(); ctx.restore();
          }
        }
        ctx.restore();
      });
      zone(ctx, cam2, 5100, 5300, () => {
        if (t < tAsf - 0.8) return;
        const k = appear(t, tAsf - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        caixaGeral(ctx, 5200, 470, 0.85, t);
        const ent = ['IPVA', 'IPTU', 'ISS', 'repasses'], sai = ['asfalto', 'saúde', 'escola', 'ônibus'];
        ent.forEach((s2, i) => { const y = 260 + i * 110, kk = appear(t, tAsf + 0.3 + i * 0.15, 0.4); arrow(ctx, 4520, y, 4980, 470 + (i - 1.5) * 40, '#cbd5e1', 5, kk); chip(ctx, 4440, y, s2, s2 === 'IPVA' ? P.amber : '#cbd5e1', kk, { size: 24 }); });
        sai.forEach((s2, i) => { const y = 260 + i * 110, kk = appear(t, tAsf + 1.2 + i * 0.15, 0.4); arrow(ctx, 5420, 470 + (i - 1.5) * 40, 5880, y, '#cbd5e1', 5, kk); chip(ctx, 5960, y, s2, s2 === 'asfalto' ? '#fde68a' : '#cbd5e1', kk, { size: 24 }); });
        // o dinheiro entrando e saindo da caixa o tempo todo
        ent.forEach((s2, i) => { if (t < tAsf + 1.0) return; for (let j = 0; j < 2; j++) { const ph = ((t - tAsf) * 0.45 + i * 0.27 + j * 0.5) % 1; const y0 = 260 + i * 110; circle(ctx, lerp(4520, 4980, ph), lerp(y0, 470 + (i - 1.5) * 40, ph), 10, s2 === 'IPVA' ? P.amber : '#94a3b8'); } });
        sai.forEach((s2, i) => { if (t < tAsf + 2.0) return; for (let j = 0; j < 2; j++) { const ph = ((t - tAsf) * 0.45 + i * 0.31 + j * 0.5) % 1; const y1 = 260 + i * 110; circle(ctx, lerp(5420, 5880, ph), lerp(470 + (i - 1.5) * 40, y1, ph), 10, '#94a3b8'); } });
        shockRing(ctx, t, tAjuda, 4440, 260, P.amber, 30, 160);
        chip(ctx, 5200, 130, 'o IPVA ajuda, mas não tem carimbo de buraco', P.amber, appear(t, tCar - 0.3, 0.4), { size: 26 });
        ctx.restore();
      });
      poeiraLuz(ctx, cam2, t, 15, 8);
    },
    overlay(ctx, t) {
      source(ctx, 'Decreto-lei 999/1969; Emenda 27/1985', vis(t, t69, tCF, 0.5, 0.4));
      source(ctx, 'Constituição, art. 167, IV', vis(t, tCF, tFaz, 0.5, 0.4));
      source(ctx, 'Educação Fiscal · Sefaz-SP', vis(t, tFaz, tAsf, 0.5, 0.4));
    },
  };
}

// ================================================================ Cena 08: o que conferir (a consulta pela placa, a cota única, a multa e a blitz)
function scene08(K) {
  const tQue = K('O que dá pra fazer'), tDez = K('Em dezembro, quando a tabela'), tPl = K('confere o valor venal pela placa'), tJunta = K('Se der, junta o dinheiro'), tAtr = K('E não atrasa');
  const tMulta = K('a multa é de zero vírgula'), tQuinto = K('até um quinto do imposto'), tLic = K('Sem o imposto pago'), tBlitz = K('pode ser recolhido numa blitz'), t34 = K('Só os paulistas já devem');
  const cam = [
    { t: 0, x: 960, y: 480, z: 1.0, dx: 3 }, { t: tPl, x: 900, y: 450, z: 1.08, d: 1.6 }, { t: tJunta, x: 1000, y: 480, z: 1.03, d: 1.4 },
    { t: tAtr - 0.3, x: 2400, y: 470, z: 1.0, d: 1.4 }, { t: tQuinto, x: 2600, y: 460, z: 1.08, d: 1.6 }, { t: tLic - 0.3, x: 3800, y: 480, z: 1.0, d: 1.6 }, { t: t34, x: 3800, y: 420, z: 1.06, d: 1.6 },
  ];
  const sfx = [[tQue, 'pop', 0.3], [tDez, 'flip', 0.35, { dur: 0.4 }], [tPl, 'tap', 0.45], [tPl + 0.5, 'key', 0.3], [tPl + 0.8, 'key', 0.3], [tPl + 1.4, 'tap', 0.4], [tPl + 1.8, 'ding', 0.35], [tJunta, 'coin', 0.4],
    [tAtr - 0.2, 'whoosh', 0.3], [tMulta, 'clock', 0.3, { n: 6, step: 0.3 }], [tQuinto, 'stamp', 0.5], [tLic - 0.3, 'whoosh', 0.3], [tLic + 0.6, 'pisca', 0.5, { n: 8 }], [tBlitz, 'truck', 0.35, { dur: 1.2 }], [t34, 'hit', 0.28]];
  return {
    accent: P.voce, cam, sfx, impacts: [tQuinto, t34], trans: 'push',
    draw(ctx, t, cam2) {
      garagemFundo(ctx, cam2, 0.95);
      zone(ctx, cam2, 800, 1100, () => {
        if (t > tAtr + 0.6) return;
        const k = vis(t, 0, tAtr, 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        celularConsulta(ctx, 760, 450, 0.95, t, { digita: prog(t, tPl + 0.3, 1.0), resultado: appear(t, tPl + 1.8, 0.5) });
        headline(ctx, 'o que conferir', 1340, 180, { size: 64, k: appear(t, tQue, 0.5), hl: '#14532d' });
        chip(ctx, 1340, 330, 'dezembro: sai a tabela nova', '#e2e8f0', appear(t, tDez, 0.4), { size: 28 });
        chip(ctx, 1340, 430, 'confira o valor venal pela placa', P.voce, appear(t, tPl, 0.4), { size: 28 });
        chip(ctx, 1340, 560, 'se der: cota única em janeiro', P.voce, appear(t, tJunta, 0.4), { size: 28 });
        ctx.restore();
      });
      zone(ctx, cam2, 2300, 2600, () => {
        if (t < tAtr - 0.8 || t > tLic + 0.6) return;
        const k = vis(t, tAtr - 0.3, tLic, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        headline(ctx, 'não atrasa', 2400, 150, { size: 64, k: appear(t, tAtr, 0.5), hl: '#7f1d1d' });
        const X0 = 1950, Wb = 900, y = 470, kf = prog(t, tMulta + 0.3, 3.0), dias = Math.round(kf * 61), pct = Math.min(20, dias * 0.33);
        fillRR(ctx, X0, y - 40, Wb, 80, 16, '#1f2937'); fillRR(ctx, X0, y - 40, Wb * pct / 20, 80, 16, P.juros);
        text(ctx, 'dia ' + dias, X0, y - 90, { size: 34, weight: 900, color: '#e2e8f0', align: 'left', alpha: appear(t, tMulta, 0.4) });
        text(ctx, 'multa ' + pct.toFixed(2).replace('.', ',') + '%', X0 + Wb, y - 90, { size: 34, weight: 900, color: '#fda4af', align: 'right', alpha: appear(t, tMulta, 0.4) });
        chip(ctx, X0 + 200, y + 110, '0,33% por dia', '#fda4af', appear(t, tMulta + 0.2, 0.4), { size: 26 });
        rectStamp(ctx, X0 + Wb - 120, y + 140, 260, 100, 'TETO 20%', P.juros, appear(t, tQuinto, 0.35), -0.06, 40, 'UM QUINTO');
        chip(ctx, 2400, 760, '+ juros pela Selic', '#fde68a', appear(t, tQuinto + 0.6, 0.4), { size: 26 });
        ctx.restore();
      });
      zone(ctx, cam2, 3700, 3900, () => {
        if (t < tLic - 0.8) return;
        const k = appear(t, tLic - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        cavalete(ctx, 3500, 600, 0.8);
        cone(ctx, 3270, 720, 0.4);
        const gx = 4200 + Math.max(0, t - t34 - 1.5) * 38; // depois do número, o guincho vai embora devagar com o carro
        guincho(ctx, gx, 640, 0.7, { a: appear(t, tBlitz, 0.5) });
        chip(ctx, 3500, 330, 'sem IPVA: sem licenciamento', '#fca5a5', appear(t, tLic, 0.4), { size: 28 });
        bigNum(ctx, 'R$ ' + Math.round(counting(t, t34 + 0.2, 1.4, 0, 34)) + ' bilhões', 3800, 170, appear(t, t34, 0.5), { size: 80, color: P.juros });
        shockRing(ctx, t, t34 + 1.6, 3800, 160, P.juros, 60, 320);
        chip(ctx, 4200, 260, 'IPVA atrasado em SP', '#fda4af', appear(t, t34 + 0.4, 0.4), { size: 26 });
        ctx.restore();
      });
      poeiraLuz(ctx, cam2, t, 17, 8);
    },
    overlay(ctx, t) {
      source(ctx, 'Sefaz-SP; Código de Trânsito, art. 230', vis(t, tMulta, t34, 0.5, 0.4));
      source(ctx, 'Autoesporte (fev/2026)', vis(t, t34, 99, 0.5, 0.4));
    },
  };
}

// ================================================================ Cena 09: fechamento (as três fatias, a taxa de 1969 ao lado da guia, o portão da garagem, o brinquedo)
function scene09(K) {
  const tEntao = K('Então, quando o boleto chegar'), tNao = K('ele não paga uma estrada'), tMaior = K('A maior parte se divide'), tVal = K('O valor depende de uma tabela'), tTaxa = K('Aquela taxa de 1969');
  const tSe = K('Se esse vídeo te ajudou'), tInsc = K('se inscreve no canal'), tProx = K('No próximo, a gente sai da garagem'), tSet = K('até setenta por cento'), tAbre = K('A gente abre a caixa'), tAte = K('Até lá');
  const tPress = tInsc + 0.3, tEsc = K('e um pedaço vai para as escolas'), tPorIsso = K('e por isso o mesmo carro'), tVirou = K('virou um imposto que paga');
  const cam = [
    { t: 0, x: 960, y: 480, z: 1.02, dx: 3 }, { t: tMaior, x: 960, y: 500, z: 1.08, d: 1.6 },
    { t: tVal - 0.3, x: 2400, y: 470, z: 1.0, d: 1.4 }, { t: tTaxa, x: 2400, y: 480, z: 1.06, d: 1.6 },
    { t: tSe - 0.4, x: 3800, y: 470, z: 1.0, d: 1.4 }, { t: tInsc, x: 3900, y: 480, z: 1.08, d: 1.0 }, { t: tPress + 2.4, x: 3800, y: 440, z: 1.02, d: 1.4 },
    { t: tProx - 0.3, x: 5200, y: 470, z: 1.0, d: 1.6, dx: 3 }, { t: tAbre, x: 5260, y: 520, z: 1.08, d: 2.0, dz: 0.003 },
  ];
  const sfx = [[tEntao, 'pop', 0.3], [tNao, 'drop', 0.35], [tMaior, 'paper', 0.35], [tVal - 0.2, 'whoosh', 0.3], [tVal + 0.4, 'clank', 0.3], [tTaxa, 'paper', 0.4], [tTaxa + 0.6, 'stamp', 0.4],
    [tSe - 0.3, 'whoosh', 0.3], [tPress, 'click', 0.8], [tPress + 0.05, 'portao', 0.55, { dur: 2.2 }], [tPress + 2.3, 'ding', 0.45],
    [tProx - 0.2, 'whoosh', 0.3], [tProx + 0.6, 'sparkle', 0.3], [tSet, 'pop', 0.4], [tAbre, 'paper', 0.45, { dur: 0.5 }]];
  return {
    accent: P.pref, cam, sfx, impacts: [tPress + 2.3], trans: 'push',
    draw(ctx, t, cam2) {
      garagemFundo(ctx, cam2, 0.95);
      zone(ctx, cam2, 900, 1100, () => {
        if (t > tVal + 0.6) return;
        const k = vis(t, 0, tVal, 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        sombraChao(ctx, 960, 790, 420);
        guiaIPVA(ctx, 960, 470, 0.92, { split: 1, valor: 'R$ 3.240,00', key: 'e' });
        const ke = vis(t, tNao, tMaior, 0.4, 0.3);
        if (ke > 0) { ctx.save(); ctx.globalAlpha *= ke; ctx.translate(960, 110); fillRR(ctx, -170, -40, 340, 80, 10, '#166534'); strokeRR(ctx, -170, -40, 340, 80, 10, '#f8fafc', 4); text(ctx, 'ESTRADA', 0, 2, { size: 40, weight: 900, color: '#f8fafc', letter: 4 }); ctx.restore(); ctx.save(); ctx.globalAlpha *= ke; tagX(ctx, 960, 110, 1.3, prog(t, tNao + 0.2, 0.5)); ctx.restore(); }
        chip(ctx, 960, 110, 'estado · sua cidade · escolas públicas', '#e2e8f0', appear(t, tMaior, 0.4), { size: 26 });
        penCircle(ctx, 680, 512, 200, 86, P.estado, prog(t, tMaior + 0.3, 0.6), 7);
        penCircle(ctx, 1053, 512, 200, 86, P.pref, prog(t, tMaior + 2.3, 0.6), 7);
        penCircle(ctx, 1333, 512, 120, 86, P.escola, prog(t, tEsc + 0.9, 0.6), 7);
        ctx.restore();
      });
      zone(ctx, cam2, 2300, 2500, () => {
        if (t < tVal - 0.8 || t > tSe + 0.6) return;
        const k = vis(t, tVal - 0.3, tSe, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        etiqueta(ctx, 2050, 300, 0.9, 'TABELA', 'valor venal', '#111827', { a: vis(t, tVal, tTaxa, 0.4, 0.4), rot: 0.06 + Math.sin(t * 1.4) * 0.04 });
        { // o mesmo carro, dois estados, dois valores diferentes
          const kq = vis(t, tPorIsso, tTaxa, 0.5, 0.4);
          if (kq > 0) for (const [px, uf, cor, d] of [[2120, 'SP', '#93c5fd', -1], [2680, 'PR', P.voce, 1]]) {
            const kk = appear(t, tPorIsso + (d > 0 ? 0.4 : 0), 0.5);
            ctx.save(); ctx.globalAlpha *= kq; carroLado(ctx, px + d * (1 - ease.out(kk)) * 200, 640, 0.5, { a: clamp(kk * 2) }); chip(ctx, px, 530, uf, cor, kk, { size: 30 }); ctx.restore();
          }
          const kne = kq * appear(t, tPorIsso + 0.9, 0.4);
          if (kne > 0) { ctx.save(); ctx.globalAlpha *= kne; ctx.strokeStyle = '#fca5a5'; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(2350, 620); ctx.lineTo(2450, 620); ctx.moveTo(2350, 660); ctx.lineTo(2450, 660); ctx.moveTo(2430, 585); ctx.lineTo(2370, 695); ctx.stroke(); ctx.restore(); }
        }
        text(ctx, '×', 2330, 320, { size: 90, weight: 900, color: '#e2e8f0', alpha: vis(t, tVal, tTaxa, 0.4, 0.4) });
        if (t < tTaxa + 0.4) { ctx.save(); ctx.globalAlpha *= vis(t, tVal + 0.3, tTaxa, 0.4, 0.4); engrenagem(ctx, 2600, 310, 110, t * 0.25, '%', P.estado); ctx.restore(); }
        chip(ctx, 2600, 455, 'a escolha de cada governo', P.estado, vis(t, tVal + 1.6, tTaxa, 0.4, 0.4), { size: 22 });
        chip(ctx, 2050, 455, 'a tabela de preços', '#e2e8f0', vis(t, tVal + 0.8, tTaxa, 0.4, 0.4), { size: 22 });
        const kt = appear(t, tTaxa, 0.6);
        if (kt > 0) {
          comprovanteTRU(ctx, 2000, 480, 0.5, { a: kt, carimbo: 1, rot: -0.05 });
          arrow(ctx, 2280, 480, 2480, 480, '#fde68a', 8, appear(t, tTaxa + 0.6, 0.5));
          guiaIPVA(ctx, 2800, 480, 0.5, { split: 1, valor: 'R$ 3.240,00', key: 'f', a: appear(t, tTaxa + 0.8, 0.5) });
          chip(ctx, 2000, 730, '1969: pagava estrada', P.hist, kt, { size: 24 });
          chip(ctx, 2800, 730, 'hoje: paga a cidade inteira', P.pref, appear(t, tTaxa + 1.0, 0.4), { size: 24 });
          ['asfalto', 'saúde', 'escola', 'ônibus'].forEach((w, i) => chip(ctx, 2580 + i * 145, 250, w, '#cbd5e1', appear(t, tVirou + 0.8 + i * 0.35, 0.4), { size: 20 }));
        }
        ctx.restore();
      });
      zone(ctx, cam2, 3700, 3900, () => {
        if (t < tSe - 0.8 || t > tProx + 0.6) return;
        const k = vis(t, tSe - 0.3, tProx, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        const op = ease.inOut(prog(t, tPress + 0.05, 2.2));
        portao(ctx, 3720, 780, 860, 520, op, t, op > 0.6 ? 'INSCRITO' : 'INSCREVA-SE');
        const kd = vis(t, tInsc - 0.6, tPress + 0.8, 0.4, 0.4), press = Math.sin(Math.PI * prog(t, tPress - 0.08, 0.3));
        controlePortao(ctx, 4340, 560, 0.9, t > tPress ? 1 : 0);
        if (kd > 0) { const dx = lerp(160, 0, ease.out(prog(t, tInsc - 0.6, 0.6))) + press * 8; ctx.save(); ctx.globalAlpha *= kd; ctx.translate(4370 + dx, 500); ctx.fillStyle = '#e0ac7e'; rr(ctx, 0, -24, 170, 48, 24); ctx.fill(); ctx.fillStyle = '#c98c5e'; rr(ctx, 40, -32, 220, 64, 30); ctx.fill(); ctx.restore(); }
        sparks(ctx, t, tPress + 2.3, 3720, 180, P.voce, 18);
        ctx.restore();
      });
      zone(ctx, cam2, 5100, 5300, () => {
        if (t < tProx - 0.6) return;
        const k = appear(t, tProx - 0.2, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        arvoreNatal(ctx, 5000, 450, 0.75, t, ease.out(prog(t, tAbre, 0.8)));
        chip(ctx, 5620, 220, 'próximo vídeo: brinquedo de Natal', P.amber, appear(t, tProx, 0.4), { size: 28 });
        bigNum(ctx, 'até 70%?', 5620, 400, appear(t, tSet, 0.5), { size: 88, color: '#fca5a5' });
        text(ctx, 'é imposto, diz o setor', 5620, 480, { size: 28, weight: 900, color: '#e2e8f0', alpha: appear(t, tSet + 0.4, 0.4) });
        chip(ctx, 5620, 620, 'quem fica com cada real da caixa', '#c4b5fd', appear(t, tAbre, 0.4), { size: 24 });
        ctx.restore();
      });
      poeiraLuz(ctx, cam2, t, 19, 9);
    },
    overlay(ctx, t) {},
  };
}

export const SCENES = [
  { id: '01', name: 'o-boleto-e-a-pergunta', build: scene01 },
  { id: '02', name: 'a-conta', build: scene02 },
  { id: '03', name: 'quem-fica-com-cada-real', build: scene03 },
  { id: '04', name: 'o-mapa', build: scene04 },
  { id: '05', name: 'a-tabela-e-o-preco-de-verdade', build: scene05 },
  { id: '06', name: 'quem-nao-paga', build: scene06 },
  { id: '07', name: 'o-buraco-da-rua', build: scene07 },
  { id: '08', name: 'o-que-conferir', build: scene08 },
  { id: '09', name: 'fechamento', build: scene09 },
];
