
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
