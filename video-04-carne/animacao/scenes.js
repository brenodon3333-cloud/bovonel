// Vídeo 04: Por que a carne está tão cara se o Brasil é o maior exportador?
// Cada cena recebe K(frase) = instante (s, relativo à cena) em que a frase começa na narração.
// Conceito: o balcão do açougue é o palco e a etiqueta da balança é o fio condutor.
// Objetos com cara de real: balança com visor de 7 segmentos, etiqueta térmica, bandeja de isopor,
// carimbo do SIF, cartaz de cortes, lousa de giz, painel de placas giratórias, relógio da vaca.
import { W, H, C, clamp, lerp, prog, ease, appear, text, font, rr, fillRR, strokeRR, circle, hexA, source } from './lib.js';
import { glowText, counting, shockRing, sparks } from './fx.js';

const P = {
  pasto: '#84cc16', pastoL: '#bef264', cadeia: '#a855f7', cadeiaL: '#d8b4fe', icms: '#f59e0b', fed: '#ef4444',
  au: '#facc15', ok: '#4ade80', meat: '#b4232c', meatD: '#6f1414', fat: '#f3e3cf', chalk: '#eef2e6', ink: '#1d2230',
  sif: '#6d28d9', led: '#5dff8f', wood: '#8a5a2b',
};
const vis = (t, a, b, fin = 0.4, fout = 0.4) => Math.min(appear(t, a, fin), 1 - appear(t, b, fout));
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const fmt = (v, dec = 0) => v.toFixed(dec).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const fmtBR = (v, dec = 2) => { const [i, d] = v.toFixed(dec).split('.'); return i.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (d ? ',' + d : ''); };

// ================================================================ tipografia caprichada
// Título com profundidade: extrusão escura, contorno, degradê e marca-texto opcional atrás.
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
// Legenda de apoio: peso forte, sombra curta e cor clara (nunca cinza miúdo).
function cap(ctx, str, x, y, o = {}) {
  text(ctx, str, x, y, { size: o.size || 34, weight: o.weight || 800, color: o.color || '#e2e8f0', align: o.align || 'center', alpha: o.alpha ?? 1, shadow: true, letter: o.letter || 0 });
}
// Giz: escrita revelada da esquerda pra direita, com o pó do giz (várias passadas finas).
function chalk(ctx, str, x, y, o = {}) {
  const { size = 48, color = P.chalk, align = 'left', r = 1, weight = 700 } = o;
  if (r <= 0) return 0;
  ctx.save(); ctx.font = font(size, weight);
  if (o.letter) ctx.letterSpacing = `${o.letter}px`;
  const w = ctx.measureText(str).width, x0 = align === 'left' ? x : align === 'center' ? x - w / 2 : x - w;
  ctx.beginPath(); ctx.rect(x0 - 12, y - size, (w + 24) * clamp(r), size * 2); ctx.clip();
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = color;
  for (const [dx, dy, a] of [[0, 0, 0.82], [1.3, -0.9, 0.3], [-1.1, 1.1, 0.26], [0.7, 1.5, 0.2]]) { ctx.globalAlpha = (o.alpha ?? 1) * a; ctx.fillText(str, x0 + dx, y + dy); }
  ctx.restore();
  if (r < 1 && r > 0) { // ponta do giz escrevendo
    const px = x0 + w * r;
    ctx.save(); ctx.translate(px + 6, y + size * 0.2); ctx.rotate(-0.6);
    fillRR(ctx, -6, -40, 12, 44, 4, '#f8fafc'); ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(-6, -40, 4, 44);
    ctx.restore();
  }
  return w;
}
// Sublinhado de giz desenhado à mão
function chalkLine(ctx, x0, y0, x1, y1, r = 1, color = P.chalk, lw = 6) {
  if (r <= 0) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineCap = 'round'; ctx.globalAlpha *= 0.85;
  for (const [o, a] of [[0, 1], [1.5, 0.35]]) {
    ctx.globalAlpha *= a; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(x0, y0 + o);
    ctx.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 - 6 + o, lerp(x0, x1, r), lerp(y0, y1, r) + o); ctx.stroke();
  }
  ctx.restore();
}

// ================================================================ cenário: azulejo do açougue, lousa, trilho
let TILE = null;
function azulejos(ctx, x, y, w, h, a = 1) {
  if (!TILE) {
    TILE = document.createElement('canvas'); TILE.width = 120; TILE.height = 60;
    const g = TILE.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 120, 60); gr.addColorStop(0, '#1a2440'); gr.addColorStop(1, '#141c33');
    g.fillStyle = gr; g.fillRect(0, 0, 120, 60);
    g.fillStyle = 'rgba(255,255,255,0.05)'; g.fillRect(2, 2, 116, 10);
    g.strokeStyle = 'rgba(0,0,0,0.55)'; g.lineWidth = 3; g.strokeRect(0, 0, 120, 60);
  }
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = ctx.createPattern(TILE, 'repeat'); ctx.translate(x, y); ctx.fillRect(0, 0, w, h);
  const v = ctx.createLinearGradient(0, 0, 0, h); v.addColorStop(0, 'rgba(5,7,13,0.55)'); v.addColorStop(0.5, 'rgba(5,7,13,0)'); v.addColorStop(1, 'rgba(5,7,13,0.6)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, w, h); ctx.restore();
}
let SLATE = null;
function lousa(ctx, x, y, w, h, a = 1) {
  if (!SLATE) {
    SLATE = document.createElement('canvas'); SLATE.width = 512; SLATE.height = 320;
    const g = SLATE.getContext('2d'); g.fillStyle = '#1d2a25'; g.fillRect(0, 0, 512, 320);
    const r = rng(9); for (let i = 0; i < 90; i++) { g.fillStyle = `rgba(230,240,230,${r() * 0.035})`; g.beginPath(); g.ellipse(r() * 512, r() * 320, 20 + r() * 70, 6 + r() * 20, r() * 3, 0, 6.283); g.fill(); }
    for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(255,255,255,${r() * 0.03})`; g.fillRect(r() * 512, r() * 320, 1.5, 1.5); }
  }
  ctx.save(); ctx.globalAlpha *= a;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 16; fillRR(ctx, x - 22, y - 22, w + 44, h + 44, 10, '#5b3a1c'); ctx.restore();
  const fg = ctx.createLinearGradient(x, y - 22, x, y + h + 22); fg.addColorStop(0, '#9a6a3a'); fg.addColorStop(1, '#5e3b1b');
  ctx.fillStyle = fg; rr(ctx, x - 22, y - 22, w + 44, h + 44, 10); ctx.fill();
  ctx.drawImage(SLATE, x, y, w, h);
  ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 3; ctx.strokeRect(x, y, w, h);
  fillRR(ctx, x + 30, y + h + 4, w * 0.5, 14, 4, '#4a2f16'); fillRR(ctx, x + 60, y + h - 2, 46, 10, 4, '#f8fafc'); fillRR(ctx, x + 120, y + h - 1, 30, 9, 4, '#fde68a');
  ctx.restore();
}
function trilho(ctx, x0, x1, y, rod = 52) {
  const g = ctx.createLinearGradient(0, y - 10, 0, y + 10); g.addColorStop(0, '#e2e8f0'); g.addColorStop(0.5, '#94a3b8'); g.addColorStop(1, '#475569');
  ctx.fillStyle = g; ctx.fillRect(x0, y - 9, x1 - x0, 18);
  for (let x = x0 + 60; x < x1; x += 260) { ctx.fillStyle = '#334155'; ctx.fillRect(x - 6, y - 8 - rod, 12, rod); }
}
function gancho(ctx, x, y, len = 60) { // gancho em S saindo do trilho
  ctx.save(); ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(x, y + 6, 12, Math.PI, 0); ctx.lineTo(x + 12, y + len - 18); ctx.arc(x, y + len - 18, 12, 0, Math.PI * 0.9); ctx.stroke();
  ctx.restore();
}

// ================================================================ balança de açougue (visor de 7 segmentos)
const SEG = { 0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgedc', 7: 'abc', 8: 'abcdefg', 9: 'abcfgd', '-': 'g', ' ': '' };
function seg7(ctx, str, x, y, h, color, align = 'right') {
  const w = h * 0.52, gap = h * 0.17, th = h * 0.13;
  let tot = 0; for (const ch of str) tot += (ch === ',' || ch === '.') ? h * 0.2 : w + gap;
  let cx = align === 'right' ? x - tot : align === 'center' ? x - tot / 2 : x;
  ctx.save(); ctx.transform(1, 0, -0.07, 1, y * 0.07, 0);
  const segs = (on, x0, y0) => {
    const hor = (yy) => { ctx.beginPath(); ctx.moveTo(x0 + th * 0.4, yy); ctx.lineTo(x0 + th, yy - th / 2); ctx.lineTo(x0 + w - th, yy - th / 2); ctx.lineTo(x0 + w - th * 0.4, yy); ctx.lineTo(x0 + w - th, yy + th / 2); ctx.lineTo(x0 + th, yy + th / 2); ctx.closePath(); ctx.fill(); };
    const ver = (xx, a, b) => { ctx.beginPath(); ctx.moveTo(xx, a + th * 0.4); ctx.lineTo(xx + th / 2, a + th); ctx.lineTo(xx + th / 2, b - th); ctx.lineTo(xx, b - th * 0.4); ctx.lineTo(xx - th / 2, b - th); ctx.lineTo(xx - th / 2, a + th); ctx.closePath(); ctx.fill(); };
    const yt = y0 + th / 2, ym = y0 + h / 2, yb = y0 + h - th / 2, xl = x0 + th / 2, xr = x0 + w - th / 2;
    for (const sg of 'abcdefg') {
      ctx.fillStyle = on.includes(sg) ? color : hexA(color, 0.07);
      if (sg === 'a') hor(yt); else if (sg === 'g') hor(ym); else if (sg === 'd') hor(yb);
      else if (sg === 'f') ver(xl, yt, ym); else if (sg === 'b') ver(xr, yt, ym); else if (sg === 'e') ver(xl, ym, yb); else ver(xr, ym, yb);
    }
  };
  ctx.shadowColor = color; ctx.shadowBlur = h * 0.35;
  for (const ch of str) {
    if (ch === ',' || ch === '.') { ctx.fillStyle = color; ctx.fillRect(cx, y + h / 2 - th, th, th); if (ch === ',') ctx.fillRect(cx - th * 0.25, y + h / 2, th * 0.7, th * 0.8); cx += h * 0.2; continue; }
    segs(SEG[ch] ?? '', cx, y - h / 2); cx += w + gap;
  }
  ctx.restore();
}
// cx, cy = centro do prato (topo). Corpo ~ 860 x 520. st: { peso, preco, total, keyB, press }
function balanca(ctx, cx, cy, s, st = {}) {
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.beginPath(); ctx.ellipse(0, 486, 500, 40, 0, 0, 6.283); ctx.fill();
  // corpo
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20;
  const bg = ctx.createLinearGradient(0, 10, 0, 470); bg.addColorStop(0, '#f6f7f9'); bg.addColorStop(1, '#b7bec7');
  ctx.fillStyle = bg; rr(ctx, -430, 14, 860, 460, 40); ctx.fill(); ctx.restore();
  ctx.fillStyle = 'rgba(255,255,255,0.6)'; rr(ctx, -410, 24, 820, 18, 9); ctx.fill();
  // prato de inox
  const pg = ctx.createLinearGradient(-400, 0, 400, 0); pg.addColorStop(0, '#9aa3ad'); pg.addColorStop(0.3, '#f1f5f9'); pg.addColorStop(0.55, '#b8c0c9'); pg.addColorStop(0.8, '#eef2f6'); pg.addColorStop(1, '#8c95a0');
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 8; ctx.fillStyle = pg; rr(ctx, -400, -36, 800, 44, 14); ctx.fill(); ctx.restore();
  ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fillRect(-380, -32, 760, 4);
  // painel de vidro escuro
  fillRR(ctx, -392, 74, 784, 252, 22, '#0a120e'); strokeRR(ctx, -392, 74, 784, 252, 22, '#2b3a33', 4);
  const win = [[-370, 'PESO', 'kg', st.peso ?? '0,000'], [-110, 'PREÇO', 'R$/kg', st.preco ?? '0,00'], [150, 'TOTAL', 'R$', st.total ?? '0,00']];
  win.forEach(([x, l1, l2, v], i) => {
    fillRR(ctx, x, 128, i === 2 ? 222 : 236, 128, 10, '#06100a'); strokeRR(ctx, x, 128, i === 2 ? 222 : 236, 128, 10, '#1c2a22', 3);
    text(ctx, l1, x + 12, 106, { size: 20, weight: 900, color: '#dbe7df', align: 'left', letter: 2 });
    text(ctx, l2, x + (i === 2 ? 210 : 224), 106, { size: 18, weight: 700, color: '#93a59a', align: 'right' });
    seg7(ctx, v, x + (i === 2 ? 210 : 224), 192, 62, P.led);
  });
  text(ctx, 'BALANÇA COMPUTADORA · MÁX 15 kg · e = 5 g', 0, 296, { size: 15, weight: 700, color: '#7d8f86', letter: 1 });
  // teclado
  fillRR(ctx, -392, 340, 784, 110, 18, '#d5dbe1');
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'C', 'B'];
  keys.forEach((k, i) => {
    const x = -376 + i * 64, y = 356, isB = k === 'B', down = isB && st.press > 0 ? 6 * st.press : 0;
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 5 - down * 0.7;
    fillRR(ctx, x, y + down, 56, 74, 10, isB && st.keyB ? '#facc15' : '#f8fafc'); ctx.restore();
    if (isB && st.keyB) { ctx.save(); ctx.translate(x + 28, y + 38 + down); priceTagMini(ctx, 40); ctx.restore(); }
    else text(ctx, k, x + 28, y + 40 + down, { size: 28, weight: 800, color: '#334155' });
  });
  // impressora à direita
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
  const ig = ctx.createLinearGradient(440, 0, 640, 0); ig.addColorStop(0, '#d9dee4'); ig.addColorStop(1, '#a7b0ba');
  ctx.fillStyle = ig; rr(ctx, 440, 80, 200, 330, 26); ctx.fill(); ctx.restore();
  fillRR(ctx, 462, 92, 156, 16, 6, '#1f2937');
  text(ctx, 'ETIQUETAS', 540, 380, { size: 16, weight: 900, color: '#6b7280', letter: 2 });
  ctx.restore();
}
// mini etiqueta "B" do canal (para a tecla)
function priceTagMini(ctx, w) {
  const h = w * 0.62, n = h * 0.5;
  ctx.save(); ctx.translate(-w / 2, -h / 2); ctx.fillStyle = '#0b1222';
  ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(n, 0); ctx.lineTo(w, 0); ctx.lineTo(w, h); ctx.lineTo(n, h); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(n * 0.6, h / 2, h * 0.1, 0, 6.283); ctx.fill();
  text(ctx, 'B', n + (w - n) / 2, h / 2 + 1, { size: h * 0.8, weight: 900, color: '#facc15' });
  ctx.restore();
}
// saída da impressora da balança (coordenadas do mundo, já com escala da balança)
const slotOf = (cx, cy, s) => ({ x: cx + 540 * s, y: cy + 100 * s });

// ================================================================ etiqueta térmica da balança
// d: { t: título, sub, rows: [[rótulo, valor]], total: [rótulo, valor], foot, code, h }
// altura mínima para o total nunca cobrir o código de barras
function etiH(d) { const yEnd = (d.sub ? 128 : 112) + (d.rows || []).length * 38; return Math.max(d.h || 320, d.total ? yEnd + 122 : yEnd + 46); }
function etiqueta(ctx, cx, cy, s, d, o = {}) {
  const Wl = 440, Hl = etiH(d);
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(o.rot || 0); ctx.scale(s, s); ctx.translate(-Wl / 2, -Hl / 2);
  ctx.globalAlpha *= o.alpha ?? 1;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 22; ctx.shadowOffsetY = 10;
  const g = ctx.createLinearGradient(0, 0, Wl, Hl); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#ecebe4');
  ctx.fillStyle = g; rr(ctx, 0, 0, Wl, Hl, 10); ctx.fill(); ctx.restore();
  const T = (s2, x, y, size, weight = 700, color = P.ink, align = 'left', letter = 0) => text(ctx, s2, x, y, { size, weight, color, align, letter });
  T('AÇOUGUE BOM CORTE', 18, 22, 14, 900, '#334155', 'left', 2); T(d.date || '14/11/26 10:42', Wl - 18, 22, 13, 700, '#475569', 'right');
  ctx.fillStyle = '#1d2230'; ctx.fillRect(14, 36, Wl - 28, 2);
  T(d.t, 18, 66, d.tSize || 32, 900);
  if (d.sub) T(d.sub, 18, 98, 16, 700, '#475569');
  let y = d.sub ? 128 : 112;
  for (const [l, v] of d.rows || []) {
    T(l, 18, y, 15, 700, '#475569'); T(v, Wl - 18, y, 22, 900, P.ink, 'right');
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(18, y + 16, Wl - 36, 1.5); y += 38;
  }
  if (d.total) {
    const by = Math.max(y - 6, Hl - 132);
    fillRR(ctx, 14, by, Wl - 28, 66, 8, '#111827');
    T(d.total[0], 30, by + 33, 16, 900, '#e5e7eb', 'left', 2); T(d.total[1], Wl - 30, by + 35, d.totalSize || 40, 900, '#ffffff', 'right');
  }
  // código de barras e rodapé
  const r = rng(d.code || 7), bx0 = 18, by0 = Hl - 56; let bx = bx0;
  ctx.fillStyle = '#111'; while (bx < 250) { const bw = 1 + Math.floor(r() * 3.2); if (r() > 0.4) ctx.fillRect(bx, by0, bw, 34); bx += bw + 1; }
  T(d.codeTxt || '2 01234 5 06640 8', 18, Hl - 12, 12, 700, '#111', 'left', 1);
  T(d.foot || 'EMB 14/11/26  VAL 18/11/26', Wl - 18, Hl - 42, 12, 800, '#334155', 'right');
  T('CONSERVAR DE 0 °C A 4 °C', Wl - 18, Hl - 20, 12, 700, '#475569', 'right');
  // brilho do papel térmico
  const sh = ctx.createLinearGradient(0, 0, Wl, 0); sh.addColorStop(0, 'rgba(255,255,255,0)'); sh.addColorStop(0.5, 'rgba(255,255,255,0.25)'); sh.addColorStop(0.55, 'rgba(255,255,255,0)');
  ctx.fillStyle = sh; ctx.fillRect(0, 0, Wl, Hl);
  ctx.restore();
}
// Etiqueta saindo da impressora: a parte visível cresce a partir do topo da fenda.
function etiquetaImprimindo(ctx, slot, s, d, k, o = {}) {
  if (k <= 0) return;
  const Hl = etiH(d) * s, Wl = 440 * s;
  ctx.save(); ctx.beginPath(); ctx.rect(slot.x - Wl, slot.y - Hl - 400, Wl * 2, Hl + 400); ctx.clip();
  etiqueta(ctx, slot.x + (o.dx || 0), slot.y - Hl * ease.out(clamp(k)) + Hl / 2, s, d);
  ctx.restore();
}

// ================================================================ bandeja de isopor com carne
function bandeja(ctx, cx, cy, s, kind = 'bife', o = {}) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(o.rot || 0); ctx.scale(s, s); ctx.globalAlpha *= o.alpha ?? 1;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 12;
  const tg = ctx.createLinearGradient(0, -100, 0, 100); tg.addColorStop(0, '#fbfcfd'); tg.addColorStop(1, '#d9dee3');
  ctx.fillStyle = tg; rr(ctx, -160, -100, 320, 200, 28); ctx.fill(); ctx.restore();
  fillRR(ctx, -140, -82, 280, 164, 20, '#e6eaee');
  ctx.strokeStyle = 'rgba(0,0,0,0.05)'; ctx.lineWidth = 3; for (let x = -120; x <= 120; x += 30) { ctx.beginPath(); ctx.moveTo(x, -76); ctx.lineTo(x, 76); ctx.stroke(); }
  meat(ctx, kind);
  // filme plástico
  ctx.save(); rr(ctx, -150, -92, 300, 184, 24); ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,0.16)'; ctx.beginPath(); ctx.moveTo(-150, -40); ctx.lineTo(-60, -92); ctx.lineTo(-10, -92); ctx.lineTo(-150, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.beginPath(); ctx.moveTo(40, 92); ctx.lineTo(150, 20); ctx.lineTo(150, 50); ctx.lineTo(80, 92); ctx.closePath(); ctx.fill();
  ctx.restore();
  strokeRR(ctx, -150, -92, 300, 184, 24, 'rgba(255,255,255,0.5)', 2);
  if (o.label) etiqueta(ctx, o.lx ?? 72, o.ly ?? 38, o.ls ?? 0.4, o.label, { rot: o.lrot ?? -0.04 });
  if (o.stamp) o.stamp(ctx);
  ctx.restore();
}
function meat(ctx, kind) {
  const red = (x0, y0, x1, y1) => { const g = ctx.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, '#c9333b'); g.addColorStop(0.6, '#a3202a'); g.addColorStop(1, '#7c1520'); return g; };
  const marble = (r, n, cx, cy, rx, ry) => { ctx.strokeStyle = 'rgba(255,235,220,0.45)'; ctx.lineWidth = 2; for (let i = 0; i < n; i++) { const a = r() * 6.283, d = r() * 0.8; const x = cx + Math.cos(a) * rx * d, y = cy + Math.sin(a) * ry * d; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 10, y + 6 * (r() - 0.5), x + 18 + r() * 14, y + 8 * (r() - 0.5)); ctx.stroke(); } };
  const r = rng(kind.length * 17);
  if (kind === 'frango') {
    for (const [x, y, a] of [[-50, 0, -0.5], [40, 10, 0.4]]) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(a);
      const g = ctx.createRadialGradient(-10, -10, 4, 0, 0, 70); g.addColorStop(0, '#f2c58a'); g.addColorStop(1, '#c7864a');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, -10, 44, 54, 0, 0, 6.283); ctx.fill();
      fillRR(ctx, -9, 30, 18, 46, 8, '#e8d8c0'); circle(ctx, -6, 78, 9, '#f1e6d6'); circle(ctx, 6, 78, 9, '#f1e6d6');
      ctx.restore();
    }
    return;
  }
  if (kind === 'acem') {
    for (const [x, y, w, h] of [[-90, -30, 70, 56], [-10, -40, 64, 60], [60, -20, 62, 52], [-60, 30, 66, 50], [20, 30, 70, 46]]) {
      ctx.fillStyle = red(x, y, x + w, y + h); rr(ctx, x - w / 2, y - h / 2, w, h, 14); ctx.fill();
      ctx.fillStyle = 'rgba(255,235,220,0.5)'; ctx.fillRect(x - w / 2 + 6, y - 4, w - 12, 5);
    }
    return;
  }
  if (kind === 'musculo') { // rodelas com nervo prateado
    for (const [x, y, rr0, a] of [[-70, -18, 52, 0.3], [32, -26, 48, -0.4], [-12, 38, 44, 1.1], [86, 34, 38, 0.7]]) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(a);
      ctx.fillStyle = red(-rr0, -rr0, rr0, rr0); ctx.beginPath(); ctx.ellipse(0, 0, rr0, rr0 * 0.86, 0, 0, 6.283); ctx.fill();
      ctx.strokeStyle = 'rgba(236,232,240,0.75)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(0, 0, rr0 * 0.62, rr0 * 0.5, 0.3, 0.3, 4.6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-rr0 * 0.2, -rr0 * 0.1); ctx.quadraticCurveTo(rr0 * 0.1, rr0 * 0.2, rr0 * 0.42, rr0 * 0.05); ctx.stroke();
      ctx.restore();
    }
    return;
  }
  if (kind === 'maminha') { // peça triangular com capa de gordura embaixo
    ctx.save(); ctx.beginPath(); ctx.moveTo(-118, 46); ctx.quadraticCurveTo(-60, -66, 70, -58); ctx.quadraticCurveTo(122, -50, 116, -6); ctx.quadraticCurveTo(40, 56, -118, 46); ctx.closePath();
    ctx.fillStyle = red(-110, -60, 110, 60); ctx.fill(); ctx.clip();
    marble(r, 7, 0, -4, 90, 40);
    ctx.fillStyle = P.fat; ctx.beginPath(); ctx.moveTo(-130, 40); ctx.quadraticCurveTo(40, 52, 126, -12); ctx.lineTo(130, 20); ctx.quadraticCurveTo(40, 80, -130, 70); ctx.closePath(); ctx.fill();
    ctx.restore();
    return;
  }
  if (kind === 'costela') {
    ctx.fillStyle = red(-120, -60, 120, 60); rr(ctx, -120, -60, 240, 120, 30); ctx.fill();
    ctx.fillStyle = P.fat; rr(ctx, -120, -60, 240, 22, 12); ctx.fill();
    for (let i = 0; i < 4; i++) fillRR(ctx, -100 + i * 58, -40, 22, 96, 10, '#efe3d1');
    return;
  }
  // bife, patinho, picanha
  ctx.save();
  ctx.beginPath();
  if (kind === 'picanha') { ctx.moveTo(-120, 50); ctx.quadraticCurveTo(-110, -50, 10, -62); ctx.quadraticCurveTo(110, -60, 120, -20); ctx.quadraticCurveTo(80, 50, -120, 50); }
  else { ctx.moveTo(-110, 10); ctx.bezierCurveTo(-110, -60, -10, -70, 60, -55); ctx.bezierCurveTo(130, -40, 120, 40, 70, 55); ctx.bezierCurveTo(10, 70, -110, 70, -110, 10); }
  ctx.closePath(); ctx.fillStyle = red(-110, -60, 110, 60); ctx.fill(); ctx.clip();
  marble(r, kind === 'patinho' ? 4 : 10, 0, 0, 100, 50);
  if (kind === 'picanha') { ctx.fillStyle = P.fat; ctx.beginPath(); ctx.moveTo(-120, -10); ctx.quadraticCurveTo(-100, -62, 10, -74); ctx.quadraticCurveTo(120, -70, 130, -30); ctx.lineTo(130, -8); ctx.quadraticCurveTo(110, -40, 10, -46); ctx.quadraticCurveTo(-90, -40, -120, 14); ctx.closePath(); ctx.fill(); }
  else if (kind === 'bife') { ctx.strokeStyle = P.fat; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(-110, 10); ctx.bezierCurveTo(-110, -60, -10, -70, 60, -55); ctx.stroke(); }
  ctx.restore();
}

// ================================================================ carimbo oval (SIF e "INSCRITO")
function ovalStamp(ctx, cx, cy, rx, ry, lines, color, k = 1, rot = -0.12) {
  if (k <= 0) return;
  const sc = lerp(1.6, 1, ease.out(clamp(k * 1.4)));
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 2) * 0.92;
  ctx.strokeStyle = color; ctx.lineWidth = Math.max(3, ry * 0.07);
  ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, 6.283); ctx.stroke();
  ctx.lineWidth = Math.max(2, ry * 0.035); ctx.beginPath(); ctx.ellipse(0, 0, rx * 0.88, ry * 0.84, 0, 0, 6.283); ctx.stroke();
  const small = ry < 40; // carimbo pequeno: só a sigla, senão vira borrão
  (small ? [['SIF', 0.04, 0.62]] : lines).forEach(([str, dy, size, weight = 900], i) => text(ctx, str, 0, dy * ry, { size: size * ry, weight, color, letter: small ? 1 : i === 1 ? 2 : 1 }));
  // falhas da tinta
  const r = rng(Math.round(rx * 7));
  ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = 'rgba(0,0,0,0.5)';
  const nv = small ? 14 : ry < 90 ? 30 : 70, vr = small ? ry / 40 : 1; for (let i = 0; i < nv; i++) { const a = r() * 6.283, d = r(); ctx.beginPath(); ctx.arc(Math.cos(a) * rx * d, Math.sin(a) * ry * d, (1 + r() * 2.5) * vr, 0, 6.283); ctx.fill(); }
  ctx.restore();
}
const sifLines = [['BRASIL', -0.48, 0.24], ['S.I.F.', 0.04, 0.5], ['1234', 0.5, 0.24]];

// ================================================================ painel de placas giratórias (cotação)
function flipBoard(ctx, x, y, cw, str, t, t0, o = {}) {
  const chars = 'ABCDEFGHIJKLMNOPRSTUVZ0123456789$,.';
  const chH = cw * 1.45, n = str.length;
  const w = n * (cw + 6) - 6, x0 = (o.align === 'left' ? x : x - w / 2);
  ctx.save(); ctx.globalAlpha *= o.alpha ?? 1;
  if (!o.noFrame) { ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 30; fillRR(ctx, x0 - 20, y - chH / 2 - 20, w + 40, chH + 40, 14, '#0b0f17'); ctx.restore(); strokeRR(ctx, x0 - 20, y - chH / 2 - 20, w + 40, chH + 40, 14, '#334155', 3); }
  for (let i = 0; i < n; i++) {
    const cx = x0 + i * (cw + 6), target = str[i];
    const settle = t0 + 0.12 + i * 0.07 + (o.spin ?? 0.45);
    let ch = target;
    if (t < settle && target !== ' ') ch = t < t0 ? ' ' : chars[Math.floor((t * 24 + i * 7) % chars.length)];
    const flipping = t < settle && t >= t0;
    const gc = ctx.createLinearGradient(0, y - chH / 2, 0, y + chH / 2); gc.addColorStop(0, '#2a3140'); gc.addColorStop(0.5, '#1a1f2a'); gc.addColorStop(1, '#232a37');
    ctx.fillStyle = gc; rr(ctx, cx, y - chH / 2, cw, chH, 6); ctx.fill();
    if (ch !== ' ') text(ctx, ch, cx + cw / 2, y + 2, { size: cw * 1.12, weight: 900, color: o.color || '#f8fafc' });
    ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(cx, y - 1.5, cw, 3);
    if (flipping) { ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(cx, y - chH / 2, cw, chH / 2); }
  }
  ctx.restore();
  return w;
}

// ================================================================ o boi (nelore de perfil, olhando para a direita)
// Silhueta inteira (corpo, cabeça e pernas do lado de cá). hh = altura do cupim (1 boi, 0.45 vaca).
function boiSil(ctx, hh = 1) {
  const hy = -136 - 54 * hh;
  ctx.beginPath();
  ctx.moveTo(-214, -126); // inserção do rabo
  ctx.bezierCurveTo(-150, -134, -40, -128, 60, -134); // lombo
  ctx.bezierCurveTo(78, -138, 92, hy + 8, 120, hy); // cupim
  ctx.bezierCurveTo(148, hy - 4, 166, hy + 26, 176, -136);
  ctx.bezierCurveTo(196, -128, 222, -116, 244, -108); // pescoço até a nuca
  ctx.bezierCurveTo(258, -112, 270, -104, 280, -86); // testa
  ctx.bezierCurveTo(296, -62, 314, -34, 326, -14); // chanfro
  ctx.bezierCurveTo(334, -2, 328, 12, 312, 12); // focinho
  ctx.bezierCurveTo(296, 12, 278, 4, 262, -6); // queixo e mandíbula
  ctx.bezierCurveTo(252, -12, 246, -16, 240, -16); // garganta
  ctx.bezierCurveTo(236, 10, 226, 40, 214, 64); // barbela
  ctx.bezierCurveTo(206, 66, 196, 76, 184, 80); // peito
  ctx.bezierCurveTo(182, 104, 186, 130, 183, 148); // joelho dianteiro
  ctx.bezierCurveTo(179, 166, 177, 180, 178, 192);
  ctx.lineTo(179, 202); ctx.lineTo(153, 202); ctx.lineTo(155, 192);
  ctx.bezierCurveTo(155, 178, 153, 164, 155, 148);
  ctx.bezierCurveTo(155, 124, 149, 100, 142, 82); // cotovelo
  ctx.bezierCurveTo(90, 88, 0, 88, -70, 78); // barriga
  ctx.bezierCurveTo(-100, 74, -118, 66, -126, 58); // virilha
  ctx.bezierCurveTo(-128, 90, -136, 120, -148, 144); // perna traseira até o jarrete
  ctx.bezierCurveTo(-151, 164, -148, 180, -148, 192);
  ctx.lineTo(-146, 202); ctx.lineTo(-172, 202); ctx.lineTo(-173, 192);
  ctx.bezierCurveTo(-173, 178, -175, 160, -177, 146);
  ctx.bezierCurveTo(-186, 136, -191, 128, -190, 118); // ponta do jarrete
  ctx.bezierCurveTo(-214, 90, -240, 48, -250, 0); // coxa
  ctx.bezierCurveTo(-256, -40, -254, -80, -244, -104); // garupa redonda
  ctx.bezierCurveTo(-236, -118, -226, -124, -214, -126);
  ctx.closePath();
}
function boiFarLegs(ctx, col) { // pernas do lado de lá, mais escuras
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.moveTo(108, 74); ctx.lineTo(142, 76); ctx.bezierCurveTo(144, 116, 140, 136, 141, 150); ctx.lineTo(139, 196); ctx.lineTo(116, 196); ctx.lineTo(116, 150); ctx.bezierCurveTo(114, 124, 110, 100, 108, 74); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-130, 44); ctx.lineTo(-96, 64); ctx.bezierCurveTo(-98, 96, -102, 124, -108, 142); ctx.lineTo(-108, 196); ctx.lineTo(-130, 196); ctx.lineTo(-132, 146); ctx.bezierCurveTo(-140, 136, -142, 126, -142, 116); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#2b2722'; ctx.fillRect(115, 192, 25, 10); ctx.fillRect(-131, 192, 24, 10);
}
// o: { alpha, ghost (0..1 só contorno), carcass (0..1), female, tint, flip }
function boi(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.flip ? -1 : 1), s); ctx.globalAlpha *= o.alpha ?? 1;
  const ghost = o.ghost || 0, base = o.tint || '#e8e4dc', hh = o.female ? 0.45 : 1;
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(10, 204, 270, 18, 0, 0, 6.283); ctx.fill();
  ctx.save(); ctx.globalAlpha *= 1 - ghost;
  boiFarLegs(ctx, '#9d978b');
  // rabo
  ctx.strokeStyle = '#c9c3b8'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-216, -124); ctx.bezierCurveTo(-244, -100, -264, -30, -260, 104); ctx.stroke();
  ctx.fillStyle = '#26221e'; ctx.beginPath(); ctx.ellipse(-259, 126, 10, 24, 0.04, 0, 6.283); ctx.fill();
  // corpo
  boiSil(ctx, hh);
  const bg = ctx.createLinearGradient(0, -190, 0, 200); bg.addColorStop(0, base); bg.addColorStop(0.5, '#d9d4ca'); bg.addColorStop(1, '#a8a296');
  ctx.fillStyle = bg; ctx.fill();
  ctx.save(); boiSil(ctx, hh); ctx.clip();
  // volume: luz de cima à esquerda, sombra embaixo e no lado de trás
  const vg = ctx.createRadialGradient(-40, -120, 20, -40, -60, 320); vg.addColorStop(0, 'rgba(255,255,255,0.20)'); vg.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = vg; ctx.fillRect(-270, -220, 620, 440);
  // cupim, pescoço e cabeça mais escuros (pelagem do nelore)
  const hg = ctx.createRadialGradient(150, -110, 10, 150, -110, 170); hg.addColorStop(0, 'rgba(105,98,88,0.6)'); hg.addColorStop(1, 'rgba(105,98,88,0)');
  ctx.fillStyle = hg; ctx.fillRect(-260, -220, 600, 440);
  const fg = ctx.createLinearGradient(250, 0, 336, 0); fg.addColorStop(0, 'rgba(80,74,66,0)'); fg.addColorStop(1, 'rgba(80,74,66,0.5)'); ctx.fillStyle = fg; ctx.fillRect(250, -120, 90, 140);
  const sg = ctx.createLinearGradient(0, 0, 0, 88); sg.addColorStop(0, 'rgba(0,0,0,0)'); sg.addColorStop(1, 'rgba(0,0,0,0.26)'); ctx.fillStyle = sg; ctx.fillRect(-270, -220, 620, 440);
  const lg = ctx.createLinearGradient(0, 96, 0, 200); lg.addColorStop(0, 'rgba(60,55,50,0)'); lg.addColorStop(1, 'rgba(60,55,50,0.38)'); ctx.fillStyle = lg; ctx.fillRect(-270, -220, 620, 440);
  const rg = ctx.createLinearGradient(-256, 0, -170, 0); rg.addColorStop(0, 'rgba(70,64,56,0.28)'); rg.addColorStop(1, 'rgba(70,64,56,0)'); ctx.fillStyle = rg; ctx.fillRect(-260, -140, 100, 280);
  // ossos e músculos: ponta do quadril, paleta, coxa
  ctx.strokeStyle = 'rgba(90,84,76,0.28)'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-196, -112); ctx.quadraticCurveTo(-178, -100, -164, -112); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(150, -104); ctx.bezierCurveTo(112, -40, 118, 20, 144, 80); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-160, -96); ctx.bezierCurveTo(-112, -40, -108, 20, -126, 58); ctx.stroke();
  // mandíbula (separa a cabeça do pescoço)
  ctx.strokeStyle = 'rgba(80,74,66,0.4)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(262, -6); ctx.bezierCurveTo(248, -26, 246, -52, 256, -76); ctx.stroke();
  // barbela (dobras)
  ctx.strokeStyle = 'rgba(90,84,76,0.32)'; ctx.lineWidth = 3;
  for (const k of [0, 1, 2]) { ctx.beginPath(); ctx.moveTo(236 - k * 12, -8 + k * 12); ctx.quadraticCurveTo(220 - k * 8, 30 + k * 10, 204 - k * 6, 66 + k * 6); ctx.stroke(); }
  ctx.restore();
  ctx.strokeStyle = 'rgba(70,64,56,0.5)'; ctx.lineWidth = 2.5; boiSil(ctx, hh); ctx.stroke();
  // cabeça: focinho escuro, orelha de lado, chifre curto, olho
  ctx.fillStyle = '#3f3a34'; ctx.beginPath(); ctx.moveTo(314, -36); ctx.bezierCurveTo(326, -22, 334, -4, 326, 6); ctx.bezierCurveTo(318, 13, 304, 12, 298, 4); ctx.bezierCurveTo(300, -12, 306, -26, 314, -36); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#111'; ctx.beginPath(); ctx.ellipse(322, -8, 3, 5, 0.5, 0, 6.283); ctx.fill();
  ctx.fillStyle = '#cfc9be'; ctx.beginPath(); ctx.moveTo(248, -96); ctx.bezierCurveTo(232, -100, 206, -96, 194, -84); ctx.bezierCurveTo(206, -74, 232, -76, 250, -84); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(80,74,66,0.55)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = 'rgba(150,120,110,0.5)'; ctx.beginPath(); ctx.ellipse(220, -87, 18, 4, -0.05, 0, 6.283); ctx.fill();
  if (!o.female || s > 0.3) { ctx.fillStyle = '#5c544b'; ctx.beginPath(); ctx.moveTo(250, -108); ctx.quadraticCurveTo(250, -130, 264, -138); ctx.quadraticCurveTo(262, -120, 264, -106); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = 'rgba(60,55,50,0.4)'; ctx.beginPath(); ctx.ellipse(272, -72, 11, 8, 0.5, 0, 6.283); ctx.fill();
  circle(ctx, 273, -72, 5, '#141210'); circle(ctx, 275, -74, 1.7, 'rgba(255,255,255,0.75)');
  ctx.fillStyle = '#26221e'; ctx.fillRect(153, 195, 26, 8); ctx.fillRect(-172, 195, 26, 8);
  ctx.restore();
  // carcaça: o boi sem couro, cabeça e vísceras (só a carne com o osso)
  const ck = o.carcass || 0;
  if (ck > 0) {
    ctx.save(); ctx.globalAlpha *= ck;
    ctx.save(); ctx.beginPath(); ctx.rect(-260, -220, 498, 352); ctx.clip(); boiSil(ctx, hh); ctx.clip();
    const mg = ctx.createLinearGradient(0, -190, 0, 130); mg.addColorStop(0, '#c4343a'); mg.addColorStop(1, '#7c1520');
    ctx.fillStyle = mg; ctx.fillRect(-260, -220, 520, 360);
    ctx.globalAlpha *= 0.9; ctx.fillStyle = P.fat; ctx.beginPath(); ctx.moveTo(-260, -220); ctx.lineTo(260, -220); ctx.lineTo(260, -120); ctx.bezierCurveTo(60, -100, -140, -100, -260, -80); ctx.closePath(); ctx.fill(); ctx.globalAlpha /= 0.9;
    ctx.strokeStyle = 'rgba(245,230,210,0.8)'; ctx.lineWidth = 9; ctx.lineCap = 'round';
    ctx.lineWidth = 7; for (let i = 0; i < 7; i++) { const xx = -40 + i * 26; ctx.beginPath(); ctx.moveTo(xx + 14, -92); ctx.bezierCurveTo(xx - 6, -40, xx - 10, 20, xx + 6, 62 - i * 3); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(255,230,215,0.35)'; ctx.lineWidth = 3;
    for (const [x0, y0] of [[-200, -40], [-180, 20], [-150, -70], [170, -40], [150, 20]]) { ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(x0 + 20, y0 + 10, x0 + 40, y0 - 4); ctx.stroke(); }
    ctx.restore();
    ctx.save(); boiSil(ctx, hh); ctx.clip(); ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 3; ctx.setLineDash([8, 6]); ctx.beginPath(); ctx.moveTo(238, -140); ctx.lineTo(238, 40); ctx.moveTo(-260, 132); ctx.lineTo(238, 132); ctx.stroke(); ctx.restore();
    ctx.restore();
  }
  if (ghost > 0) {
    ctx.save(); ctx.globalAlpha *= ghost * (1 - ck * 0.4); ctx.setLineDash([10, 8]); ctx.strokeStyle = 'rgba(226,232,240,0.7)'; ctx.lineWidth = 3;
    boiSil(ctx, hh); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}
function bezerro(ctx, x, y, s, o = {}) { boi(ctx, x, y, s * 0.55, { ...o, female: true, tint: '#efe9dc' }); }

// ================================================================ cartaz de cortes do açougue
// [nome, polígono (recortado pela silhueta), posição do nome, cor, ponto da seta (só nos cortes pequenos: nome fora do corte)]
const CUTS = [
  ['picanha', [[-270, -170], [-176, -170], [-176, -100], [-270, -100]], [-214, -168], '#d9867f', [-214, -114]],
  ['coxão', [[-270, -100], [-176, -100], [-176, 30], [-200, 30], [-200, 150], [-270, 150]], [-214, -24], '#e8a49b'],
  ['patinho', [[-200, 30], [-120, 30], [-120, 140], [-200, 140]], [-60, 124], '#f2c3b6', [-160, 84]],
  ['alcatra', [[-176, -170], [-86, -170], [-86, -60], [-176, -60]], [-131, -104], '#efb6a8'],
  ['maminha', [[-176, -60], [-86, -60], [-86, 30], [-176, 30]], [-131, -16], '#e39a90'],
  ['fraldinha', [[-120, 30], [-20, 30], [-20, 110], [-130, 110]], [-66, 58], '#f4cfc3'],
  ['contrafilé', [[-86, -170], [70, -170], [70, -95], [-86, -95]], [-10, -114], '#dc8f86'],
  ['filé', [[-86, -95], [70, -95], [70, -65], [-86, -65]], [-10, -80], '#c86f69'],
  ['costela', [[-86, -65], [130, -65], [130, 110], [-20, 110], [-20, 30], [-86, 30]], [40, 22], '#f0bdae'],
  ['cupim', [[50, -230], [190, -230], [190, -140], [50, -140]], [120, -160], '#c97a72'],
  ['acém', [[70, -140], [200, -140], [200, -40], [130, -40], [130, -65], [70, -65]], [140, -98], '#e7a99c'],
  ['pescoço', [[190, -200], [252, -200], [252, -40], [200, -40]], [262, -150], '#dd958c', [226, -70]],
  ['peito', [[130, -40], [262, -40], [262, 100], [130, 100]], [180, 32], '#f3c9bd'],
  ['músculo', [[-200, 140], [-110, 140], [-110, 220], [-200, 220]], [-64, 178], '#cf7f77', [-158, 172]],
  ['músculo', [[130, 100], [210, 100], [210, 220], [130, 220]], [78, 178], '#cf7f77', [164, 166]],
];
function cutPoly(ctx, poly) { ctx.beginPath(); poly.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.closePath(); }
// o.fill(nome) -> cor ou null (usa a cor do cartaz); o.base = cor de cabeça e canelas; o.hoof; o.plain (cortes sem cor)
function cartaz(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (!o.noPaper) {
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 16;
    const pg = ctx.createLinearGradient(-340, -300, 340, 300); pg.addColorStop(0, '#f6eedb'); pg.addColorStop(1, '#e0d3b4');
    ctx.fillStyle = pg; ctx.fillRect(-340, -300, 680, 560); ctx.restore();
    const r = rng(3); for (let i = 0; i < 900; i++) { ctx.fillStyle = `rgba(110,80,40,${r() * 0.06})`; ctx.fillRect(-340 + r() * 680, -300 + r() * 560, 2, 2); }
    ctx.strokeStyle = '#7f1d1d'; ctx.lineWidth = 6; ctx.strokeRect(-322, -282, 644, 524);
    text(ctx, 'CORTES DO BOI', 0, -246, { size: 42, weight: 900, color: '#7f1d1d', letter: 6 });
    ctx.fillStyle = '#7f1d1d'; ctx.fillRect(-160, -220, 320, 3);
    for (const [cx, cy] of [[-322, -282], [322, -282], [-322, 242], [322, 242]]) circle(ctx, cx, cy, 7, '#94a3b8');
  }
  ctx.translate(o.dx ?? 30, o.dy ?? 20); ctx.scale(0.92, 0.92);
  boiSil(ctx); ctx.fillStyle = o.base || '#f3ead6'; ctx.fill();
  ctx.save(); boiSil(ctx); ctx.clip();
  for (const [name, poly, , col] of CUTS) {
    const c = o.fill ? o.fill(name) : null;
    ctx.fillStyle = c || (o.plain ? '#f3ead6' : col); cutPoly(ctx, poly); ctx.fill();
  }
  ctx.setLineDash([8, 7]); ctx.strokeStyle = 'rgba(127,29,29,0.8)'; ctx.lineWidth = 2.5;
  for (const [, poly] of CUTS) { cutPoly(ctx, poly); ctx.stroke(); }
  ctx.restore();
  ctx.fillStyle = o.hoof || '#7f1d1d'; ctx.fillRect(150, 194, 26, 10); ctx.fillRect(-170, 194, 28, 10);
  ctx.strokeStyle = '#7f1d1d'; ctx.lineWidth = 5; ctx.setLineDash([]); boiSil(ctx); ctx.stroke();
  // chifre e narina, para a cabeça não virar um bico
  ctx.beginPath(); ctx.moveTo(250, -108); ctx.quadraticCurveTo(250, -130, 264, -138); ctx.quadraticCurveTo(262, -120, 264, -106); ctx.closePath(); ctx.fillStyle = '#7f1d1d'; ctx.fill();
  circle(ctx, 273, -72, 6, '#7f1d1d');
  ctx.fillStyle = '#7f1d1d'; ctx.beginPath(); ctx.ellipse(318, -6, 4, 6, 0.5, 0, 6.283); ctx.fill();
  if (o.labels !== false) {
    ctx.save(); ctx.globalAlpha *= o.labelAlpha ?? 1;
    for (const [name, , [lx, ly], , tip] of CUTS) {
      const hl = clamp(o.hlName ? o.hlName(name) : 0);
      const size = 17 + 5 * hl;
      if (tip) { // nome fora do corte, com seta curta
        ctx.strokeStyle = '#7f1d1d'; ctx.lineWidth = 2.5; ctx.setLineDash([]);
        const ey = ly + (tip[1] > ly ? 12 : -12);
        ctx.beginPath(); ctx.moveTo(lx, ey); ctx.lineTo(tip[0], tip[1]); ctx.stroke(); circle(ctx, tip[0], tip[1], 4.5, '#7f1d1d');
      }
      if (hl > 0) {
        ctx.font = font(size, 900); const w = ctx.measureText(name).width + 22;
        fillRR(ctx, lx - w / 2, ly - size * 0.75, w, size * 1.5, 8, hexA('#7f1d1d', hl));
      }
      text(ctx, name, lx, ly, { size, weight: 900, color: hl > 0.5 ? '#ffffff' : '#5b1010' });
    }
    ctx.restore();
  }
  ctx.restore();
}

// ================================================================ mapa-múndi em pontos
const LAND = [
  [[-80, 10], [-75, 11], [-62, 11], [-52, 5], [-35, -5], [-39, -15], [-41, -22], [-48, -27], [-53, -34], [-58, -38], [-65, -41], [-68, -50], [-73, -53], [-75, -45], [-73, -37], [-71, -28], [-70, -18], [-76, -14], [-81, -5], [-80, 1]],
  [[-168, 66], [-160, 70], [-140, 70], [-120, 70], [-95, 72], [-80, 70], [-65, 60], [-55, 52], [-60, 46], [-67, 44], [-71, 41], [-76, 35], [-81, 31], [-80, 25], [-82, 28], [-90, 30], [-97, 26], [-97, 20], [-90, 16], [-84, 10], [-80, 8], [-86, 12], [-92, 15], [-105, 20], [-112, 28], [-117, 32], [-122, 37], [-124, 42], [-124, 48], [-130, 55], [-140, 60], [-150, 60], [-160, 58], [-165, 62]],
  [[-55, 60], [-45, 60], [-20, 70], [-20, 80], [-60, 82], [-70, 77]],
  [[-10, 36], [-9, 43], [-2, 44], [-5, 48], [2, 51], [5, 53], [8, 57], [5, 62], [15, 69], [28, 71], [40, 68], [45, 60], [40, 50], [30, 46], [28, 41], [22, 37], [15, 38], [12, 44], [8, 44], [3, 42], [-5, 36]],
  [[-6, 50], [1, 51], [1, 53], [-3, 58], [-6, 58], [-5, 54]],
  [[-17, 21], [-16, 15], [-12, 8], [-8, 4], [5, 4], [9, 4], [9, -1], [13, -6], [12, -17], [15, -28], [19, -35], [25, -34], [32, -28], [35, -22], [40, -15], [40, -5], [43, 0], [51, 11], [43, 12], [37, 20], [33, 30], [25, 32], [10, 37], [0, 36], [-6, 35], [-10, 30], [-14, 26]],
  [[44, -25], [47, -25], [50, -15], [49, -12]],
  [[28, 41], [35, 37], [36, 32], [43, 13], [52, 17], [58, 23], [56, 27], [62, 25], [67, 24], [73, 20], [77, 8], [80, 15], [88, 22], [92, 22], [98, 16], [98, 8], [103, 1], [105, 10], [108, 15], [108, 21], [117, 23], [122, 30], [121, 37], [125, 40], [129, 35], [130, 43], [140, 48], [142, 54], [155, 59], [162, 62], [170, 60], [180, 66], [180, 72], [140, 74], [110, 77], [80, 73], [68, 70], [55, 68], [45, 60], [40, 50], [30, 46]],
  [[130, 31], [135, 34], [140, 36], [142, 40], [141, 45], [138, 40], [133, 34]],
  [[95, 5], [105, -6], [115, -8], [120, -9], [125, -8], [140, -3], [150, -6], [140, -9], [120, -6], [110, -3], [100, 2]],
  [[114, -22], [122, -17], [131, -12], [137, -12], [142, -11], [146, -19], [153, -26], [151, -34], [145, -38], [138, -35], [131, -31], [124, -34], [115, -34]],
];
const BRASIL = [[-74, -8], [-70, -4], [-69, 1], [-60, 5], [-51, 4], [-50, 0], [-44, -2], [-35, -5], [-39, -13], [-40, -20], [-44, -23], [-48, -26], [-53, -33], [-57, -30], [-55, -25], [-58, -20], [-60, -16], [-65, -11], [-70, -11]];
const inPoly = (pt, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) c = !c; } return c; };
const MAP = { x: 110, y: 130, w: 1700 }; MAP.h = MAP.w * 140 / 360;
const mp = (lon, lat) => [MAP.x + (lon + 180) / 360 * MAP.w, MAP.y + (80 - lat) / 140 * MAP.h];
let MAPC = null, BRDOTS = null;
function mapaBase() {
  if (MAPC) return;
  MAPC = document.createElement('canvas'); MAPC.width = MAP.w + 20; MAPC.height = Math.ceil(MAP.h) + 20;
  const g = MAPC.getContext('2d'); BRDOTS = [];
  const step = 11;
  for (let yy = 0; yy < MAP.h; yy += step) for (let xx = (yy / step) % 2 ? step / 2 : 0; xx < MAP.w; xx += step) {
    const lon = xx / MAP.w * 360 - 180, lat = 80 - yy / MAP.h * 140;
    if (inPoly([lon, lat], BRASIL)) { BRDOTS.push([MAP.x + xx, MAP.y + yy]); continue; }
    if (!LAND.some((p) => inPoly([lon, lat], p))) continue;
    g.fillStyle = 'rgba(148,163,184,0.42)'; g.beginPath(); g.arc(xx + 10, yy + 10, 3.2, 0, 6.283); g.fill();
  }
}
function mapa(ctx, t, o = {}) {
  mapaBase();
  ctx.save(); ctx.globalAlpha *= o.alpha ?? 1;
  ctx.drawImage(MAPC, MAP.x - 10, MAP.y - 10);
  const br = o.br ?? 1;
  for (const [x, y] of BRDOTS) { ctx.fillStyle = hexA(P.pasto, 0.35 + 0.6 * br); ctx.beginPath(); ctx.arc(x, y, 3.6, 0, 6.283); ctx.fill(); }
  if (br > 0) { const [bx, by] = mp(-52, -12); const g = ctx.createRadialGradient(bx, by, 0, bx, by, 160); g.addColorStop(0, hexA(P.pasto, 0.22 * br)); g.addColorStop(1, hexA(P.pasto, 0)); ctx.fillStyle = g; ctx.fillRect(bx - 160, by - 160, 320, 320); }
  ctx.restore();
}
const PORT = { santos: mp(-46, -24), europa: mp(4, 52), china: mp(121, 31), eua: mp(-75, 39) };
// rota curva de navio: k = quanto já foi desenhado; via = ponto de controle
function rota(ctx, a, b, via, k, color, lw = 6, dash = null) {
  if (k <= 0) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.shadowColor = color; ctx.shadowBlur = 16;
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(a[0], a[1]);
  const N = 40, kk = clamp(k);
  for (let i = 1; i <= N * kk; i++) { const u = i / N; ctx.lineTo((1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * via[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * via[1] + u * u * b[1]); }
  ctx.stroke(); ctx.restore();
}
const rotaPt = (a, b, via, u) => [(1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * via[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * via[1] + u * u * b[1]];
const VIA = { europa: [mp(-20, 20)[0], mp(-20, 20)[1]], china: [mp(60, -45)[0], mp(60, -45)[1]], eua: [mp(-40, 10)[0], mp(-40, 10)[1]] };

// ================================================================ navio, caminhão, contêiner, cancela
function navio(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.dir === -1 ? -1 : 1), s);
  const cols = ['#ef4444', '#3b82f6', '#f59e0b', '#22c55e', '#e2e8f0', '#a855f7'];
  const r = rng(o.seed || 4);
  for (let row = 0; row < (o.rows ?? 3); row++) for (let c = 0; c < 9; c++) { if (r() < 0.12) continue; const cx = -150 + c * 30, cy = -34 - row * 18; fillRR(ctx, cx, cy, 28, 16, 2, cols[Math.floor(r() * cols.length)]); ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(cx, cy + 12, 28, 4); }
  fillRR(ctx, 128, -86, 40, 70, 4, '#f1f5f9'); ctx.fillStyle = '#1e293b'; ctx.fillRect(132, -78, 32, 6); ctx.fillRect(132, -64, 32, 6);
  ctx.fillStyle = '#1f2937'; ctx.fillRect(140, -106, 10, 22);
  ctx.fillStyle = '#7f1d1d'; ctx.beginPath(); ctx.moveTo(-190, -18); ctx.lineTo(186, -18); ctx.lineTo(200, -40); ctx.lineTo(220, -40); ctx.lineTo(196, 18); ctx.lineTo(-176, 18); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#111827'; ctx.fillRect(-180, 8, 372, 10);
  ctx.strokeStyle = 'rgba(147,197,253,0.6)'; ctx.lineWidth = 3; ctx.beginPath(); for (let i = -200; i < 230; i += 24) { ctx.moveTo(i, 22); ctx.quadraticCurveTo(i + 6, 18, i + 12, 22); } ctx.stroke();
  ctx.restore();
}
function caminhaoFrio(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(0, 70, 230, 14, 0, 0, 6.283); ctx.fill();
  const bg = ctx.createLinearGradient(0, -100, 0, 40); bg.addColorStop(0, '#ffffff'); bg.addColorStop(1, '#cbd5e1');
  ctx.fillStyle = bg; rr(ctx, -220, -110, 300, 150, 10); ctx.fill();
  ctx.fillStyle = '#1d4ed8'; ctx.fillRect(-220, -30, 300, 18);
  text(ctx, 'REFRIGERADO', -70, -66, { size: 26, weight: 900, color: '#1e3a8a', letter: 2 });
  fillRR(ctx, 70, -126, 40, 20, 4, '#94a3b8');
  const cg = ctx.createLinearGradient(90, -80, 200, 40); cg.addColorStop(0, '#2563eb'); cg.addColorStop(1, '#1e3a8a');
  ctx.fillStyle = cg; ctx.beginPath(); ctx.moveTo(90, 40); ctx.lineTo(90, -76); ctx.lineTo(160, -76); ctx.lineTo(200, -20); ctx.lineTo(206, 40); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#bfdbfe'; ctx.beginPath(); ctx.moveTo(104, -64); ctx.lineTo(154, -64); ctx.lineTo(184, -24); ctx.lineTo(104, -24); ctx.closePath(); ctx.fill();
  for (const wx of [-160, -60, 150]) { circle(ctx, wx, 46, 26, '#111827'); circle(ctx, wx, 46, 11, '#9ca3af'); }
  ctx.restore();
}
function conteiner(ctx, x, y, s, color = '#2563eb', o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6; fillRR(ctx, -90, -40, 180, 80, 4, color); ctx.restore();
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 3; for (let i = -78; i < 90; i += 14) { ctx.beginPath(); ctx.moveTo(i, -34); ctx.lineTo(i, 34); ctx.stroke(); }
  fillRR(ctx, 56, -30, 26, 60, 3, 'rgba(255,255,255,0.15)');
  if (o.label) text(ctx, o.label, -6, 2, { size: 26, weight: 900, color: '#ffffff' });
  ctx.restore();
}
function caixaCarne(ctx, x, y, s, a = 1, color = '#c9a46c') { // caixa de papelão de carne congelada
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= a;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 3; fillRR(ctx, -20, -14, 40, 28, 3, color); ctx.restore();
  ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(-20, -14, 40, 6); ctx.fillStyle = 'rgba(127,29,29,0.8)'; ctx.fillRect(-12, -2, 24, 4); strokeRR(ctx, -20, -14, 40, 28, 3, 'rgba(70,45,20,0.6)', 1.5);
  ctx.restore();
}

// ================================================================ relógio da vaca, cenário do pasto
function relogio(ctx, cx, cy, r, ang, o = {}) {
  ctx.save(); ctx.globalAlpha *= o.alpha ?? 1;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 14;
  const wg = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r); wg.addColorStop(0, '#a26b36'); wg.addColorStop(1, '#5a3517');
  ctx.fillStyle = wg; ctx.beginPath(); ctx.arc(cx, cy, r + 26, 0, 6.283); ctx.fill(); ctx.restore();
  const fg = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 10, cx, cy, r); fg.addColorStop(0, '#fbf6ea'); fg.addColorStop(1, '#e3d7bd');
  ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.283); ctx.fill();
  ctx.strokeStyle = '#3f2a14';
  for (let i = 0; i < 60; i++) { const a = i / 60 * 6.283, big = i % 5 === 0; ctx.lineWidth = big ? 6 : 2; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r * (big ? 0.84 : 0.9), cy + Math.sin(a) * r * (big ? 0.84 : 0.9)); ctx.lineTo(cx + Math.cos(a) * r * 0.95, cy + Math.sin(a) * r * 0.95); ctx.stroke(); }
  if (o.arc) { const [a0, a1, col] = o.arc; ctx.save(); ctx.strokeStyle = col; ctx.globalAlpha *= 0.85; ctx.lineWidth = r * 0.12; ctx.beginPath(); ctx.arc(cx, cy, r * 0.62, -Math.PI / 2 + a0, -Math.PI / 2 + a1); ctx.stroke(); ctx.restore(); }
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang);
  ctx.fillStyle = '#1f140a'; ctx.beginPath(); ctx.moveTo(-8, 20); ctx.lineTo(8, 20); ctx.lineTo(3, -r * 0.82); ctx.lineTo(-3, -r * 0.82); ctx.closePath(); ctx.fill();
  ctx.restore();
  if (o.label) { ctx.font = font(r * 0.16, 900); const lw = ctx.measureText(o.label).width + r * 0.14; fillRR(ctx, cx - lw / 2, cy + r * 0.38 - r * 0.12, lw, r * 0.24, r * 0.06, 'rgba(240,232,212,0.94)'); text(ctx, o.label, cx, cy + r * 0.38, { size: r * 0.16, weight: 900, color: '#3f2a14' }); }
  circle(ctx, cx, cy, 12, '#b45309');
  ctx.restore();
}
function pasto(ctx, t, o = {}) {
  const a = o.alpha ?? 1; if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  const sky = ctx.createLinearGradient(0, -200, 0, 700); sky.addColorStop(0, 'rgba(15,23,42,0)'); sky.addColorStop(1, `rgba(251,146,60,${0.22 * (o.dawn ?? 1)})`);
  ctx.fillStyle = sky; ctx.fillRect(-400, -300, 2720, 1000);
  const sun = ctx.createRadialGradient(1500, 640, 0, 1500, 640, 340); sun.addColorStop(0, `rgba(253,186,116,${0.5 * (o.dawn ?? 1)})`); sun.addColorStop(1, 'rgba(253,186,116,0)');
  ctx.fillStyle = sun; ctx.fillRect(1100, 300, 800, 700);
  ctx.fillStyle = '#123321'; ctx.beginPath(); ctx.moveTo(-400, 700); ctx.bezierCurveTo(300, 600, 900, 690, 1400, 640); ctx.bezierCurveTo(1800, 610, 2100, 660, 2400, 640); ctx.lineTo(2400, 1300); ctx.lineTo(-400, 1300); ctx.closePath(); ctx.fill();
  const gg = ctx.createLinearGradient(0, 680, 0, 1100); gg.addColorStop(0, '#1d4a2a'); gg.addColorStop(1, '#0d2416');
  ctx.fillStyle = gg; ctx.beginPath(); ctx.moveTo(-400, 760); ctx.bezierCurveTo(400, 700, 1200, 760, 2400, 720); ctx.lineTo(2400, 1300); ctx.lineTo(-400, 1300); ctx.closePath(); ctx.fill();
  // cerca
  ctx.strokeStyle = '#3d2a16'; ctx.lineWidth = 5;
  for (let x = -300; x < 2300; x += 180) { ctx.fillStyle = '#4a3219'; ctx.fillRect(x, 640, 12, 96); }
  ctx.beginPath(); ctx.moveTo(-300, 668); ctx.lineTo(2300, 662); ctx.moveTo(-300, 700); ctx.lineTo(2300, 694); ctx.stroke();
  // capim
  const r = rng(21); ctx.strokeStyle = 'rgba(74,140,70,0.55)'; ctx.lineWidth = 3;
  for (let i = 0; i < 140; i++) { const x = r() * 2600 - 300, y = 800 + r() * 260, h = 14 + r() * 26, sw = Math.sin(t * 1.4 + i) * 4; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + sw, y - h * 0.6, x + sw * 2, y - h); ctx.stroke(); }
  ctx.restore();
}
function porteira(ctx, x, y, s, open) { // porteira de madeira; open 0 (fechada) a 1 (aberta)
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#4a3219'; ctx.fillRect(-14, -150, 24, 170);
  ctx.save(); ctx.scale(lerp(1, 0.2, open), 1);
  ctx.strokeStyle = '#8a5a2b'; ctx.lineWidth = 16; ctx.lineCap = 'round';
  for (const yy of [-130, -85, -40]) { ctx.beginPath(); ctx.moveTo(10, yy); ctx.lineTo(300, yy); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(10, -40); ctx.lineTo(300, -130); ctx.moveTo(300, -130); ctx.lineTo(300, -40); ctx.stroke();
  ctx.restore(); ctx.restore();
}

// ================================================================ meia-carcaça pendurada (câmara fria), lado de dentro à mostra
function meiaPath(ctx) {
  ctx.beginPath();
  ctx.moveTo(-14, 0); ctx.bezierCurveTo(-20, 30, -28, 60, -40, 86);
  ctx.bezierCurveTo(-96, 120, -126, 190, -122, 250); ctx.bezierCurveTo(-118, 290, -98, 318, -90, 344);
  ctx.bezierCurveTo(-106, 390, -134, 460, -136, 530); ctx.bezierCurveTo(-138, 590, -120, 640, -84, 672);
  ctx.bezierCurveTo(-56, 700, -20, 712, 6, 706); ctx.bezierCurveTo(30, 698, 44, 670, 52, 630);
  ctx.bezierCurveTo(62, 560, 62, 470, 56, 400); ctx.bezierCurveTo(52, 340, 58, 290, 70, 240);
  ctx.bezierCurveTo(82, 180, 66, 120, 36, 86); ctx.bezierCurveTo(22, 60, 16, 30, 14, 0);
  ctx.closePath();
}
function meiaCarcaca(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(Math.sin((o.t || 0) * 0.9 + (o.ph || 0)) * 0.012);
  gancho(ctx, 0, -66, 74);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 34; ctx.shadowOffsetX = 10;
  meiaPath(ctx); const mg = ctx.createLinearGradient(-130, 0, 70, 0); mg.addColorStop(0, '#8f1c25'); mg.addColorStop(0.45, '#c3323a'); mg.addColorStop(1, '#9e2029');
  ctx.fillStyle = mg; ctx.fill(); ctx.restore();
  ctx.save(); meiaPath(ctx); ctx.clip();
  // capa de gordura por fora (esquerda) e no coxão
  const fg = ctx.createLinearGradient(-140, 0, -80, 0); fg.addColorStop(0, '#f6ead7'); fg.addColorStop(1, 'rgba(240,222,198,0)');
  ctx.fillStyle = fg; ctx.fillRect(-150, 60, 90, 660);
  ctx.fillStyle = 'rgba(246,234,215,0.85)'; ctx.beginPath(); ctx.ellipse(-60, 170, 60, 70, -0.3, 0, 6.283); ctx.fill();
  ctx.fillStyle = 'rgba(200,52,60,0.9)'; ctx.beginPath(); ctx.ellipse(-50, 190, 44, 52, -0.3, 0, 6.283); ctx.fill();
  // marmoreio
  ctx.strokeStyle = 'rgba(255,232,214,0.35)'; ctx.lineWidth = 3; const r = rng(17);
  for (let i = 0; i < 26; i++) { const xx = -100 + r() * 140, yy = 120 + r() * 560; ctx.beginPath(); ctx.moveTo(xx, yy); ctx.quadraticCurveTo(xx + 12, yy + 6 * (r() - 0.5), xx + 26, yy + 8 * (r() - 0.5)); ctx.stroke(); }
  // costelas saindo da coluna
  ctx.strokeStyle = '#f1e4d0'; ctx.lineWidth = 11; ctx.lineCap = 'round';
  for (let i = 0; i < 9; i++) { const yy = 400 + i * 30; ctx.beginPath(); ctx.moveTo(48, yy); ctx.quadraticCurveTo(-20, yy + 14, -96, yy + 34); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(150,40,40,0.5)'; ctx.lineWidth = 3;
  for (let i = 0; i < 9; i++) { const yy = 400 + i * 30; ctx.beginPath(); ctx.moveTo(48, yy + 6); ctx.quadraticCurveTo(-20, yy + 20, -96, yy + 40); ctx.stroke(); }
  // coluna (vértebras) na borda de dentro
  for (let yy = 250; yy < 700; yy += 26) { fillRR(ctx, 34, yy, 34, 22, 6, '#efe2cd'); ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(34, yy + 18, 34, 4); }
  ctx.restore();
  // ponta do osso da canela no gancho
  fillRR(ctx, -16, -4, 32, 40, 12, '#efe2cd'); circle(ctx, 0, -2, 18, '#f5ecdd');
  if (o.sif !== false) { ovalStamp(ctx, -70, 260, 34, 22, sifLines, P.sif, 1, -0.2); ovalStamp(ctx, -80, 600, 30, 20, sifLines, P.sif, 1, 0.15); }
  const ck = o.cuts || 0;
  if (ck > 0) {
    ctx.save(); ctx.globalAlpha *= ck; ctx.setLineDash([12, 8]); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(-140, 352); ctx.lineTo(70, 352); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-30, 352); ctx.lineTo(-30, 560); ctx.lineTo(-140, 560); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

// ================================================================ ícones pequenos: frigorífico, mercado, sapato, sabão, mão
function frigorifico(ctx, x, y, s, a = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= a;
  fillRR(ctx, -90, -40, 180, 90, 6, '#cbd5e1'); ctx.fillStyle = '#94a3b8'; ctx.beginPath(); ctx.moveTo(-96, -40); ctx.lineTo(-40, -70); ctx.lineTo(16, -40); ctx.lineTo(60, -70); ctx.lineTo(96, -40); ctx.closePath(); ctx.fill();
  fillRR(ctx, 40, -110, 22, 60, 3, '#64748b'); for (let i = 0; i < 4; i++) fillRR(ctx, -76 + i * 40, -12, 26, 20, 3, '#1e3a8a'); fillRR(ctx, -14, 18, 28, 32, 3, '#334155');
  ctx.restore();
}
function mercado(ctx, x, y, s, a = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= a;
  fillRR(ctx, -90, -30, 180, 80, 6, '#e2e8f0');
  for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? '#ffffff' : '#dc2626'; ctx.beginPath(); ctx.moveTo(-96 + i * 32, -34); ctx.lineTo(-64 + i * 32, -34); ctx.lineTo(-64 + i * 32, -8); ctx.quadraticCurveTo(-80 + i * 32, 2, -96 + i * 32, -8); ctx.closePath(); ctx.fill(); }
  fillRR(ctx, -96, -60, 192, 28, 4, '#991b1b'); text(ctx, 'AÇOUGUE', 0, -45, { size: 18, weight: 900, color: '#fff', letter: 2 });
  fillRR(ctx, -70, 6, 60, 40, 3, '#93c5fd'); fillRR(ctx, 16, 0, 40, 50, 3, '#334155');
  ctx.restore();
}
function sapato(ctx, x, y, s, a = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= a;
  const g = ctx.createLinearGradient(-60, -30, 60, 30); g.addColorStop(0, '#7c4a1e'); g.addColorStop(1, '#3f230b');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-64, 18); ctx.lineTo(-60, -26); ctx.quadraticCurveTo(-40, -36, -26, -20); ctx.quadraticCurveTo(10, -10, 50, -2); ctx.quadraticCurveTo(70, 4, 66, 18); ctx.closePath(); ctx.fill();
  fillRR(ctx, -66, 16, 134, 10, 4, '#1c1917'); ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-20, -16); ctx.lineTo(8, -6); ctx.stroke();
  ctx.restore();
}
function sabao(ctx, x, y, s, a = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= a;
  const g = ctx.createLinearGradient(0, -30, 0, 30); g.addColorStop(0, '#fef9c3'); g.addColorStop(1, '#eab308');
  ctx.fillStyle = g; rr(ctx, -54, -26, 108, 52, 18); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.5)'; rr(ctx, -40, -18, 50, 10, 5); ctx.fill();
  for (const [bx, by, br] of [[66, -16, 8], [80, -32, 6], [72, -44, 4]]) { ctx.strokeStyle = 'rgba(224,242,254,0.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(bx, by, br, 0, 6.283); ctx.stroke(); }
  ctx.restore();
}
function dedo(ctx, x, y, ang, s = 1) { // mão com o indicador apontando; (x, y) = ponta do dedo
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
  const skin = (y0, y1) => { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, '#f7d3a6'); g.addColorStop(1, '#cf955e'); return g; };
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 12;
  ctx.fillStyle = '#1e3a8a'; rr(ctx, -440, -78, 130, 170, 26); ctx.fill();
  ctx.fillStyle = skin(-70, 90); rr(ctx, -330, -66, 170, 150, 50); ctx.fill(); ctx.restore();
  ctx.fillStyle = skin(-24, 24); rr(ctx, -190, -24, 190, 48, 24); ctx.fill();
  ctx.fillStyle = '#fbe3c6'; rr(ctx, -34, -18, 28, 26, 10); ctx.fill();
  for (const [yy, w] of [[30, 120], [62, 108], [90, 92]]) { ctx.fillStyle = skin(yy - 16, yy + 16); rr(ctx, -200 - (120 - w), yy - 15, w, 32, 16); ctx.fill(); }
  ctx.fillStyle = skin(-80, -40); ctx.beginPath(); ctx.ellipse(-210, -58, 62, 22, -0.25, 0, 6.283); ctx.fill();
  ctx.strokeStyle = 'rgba(120,70,30,0.35)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-96, -20); ctx.quadraticCurveTo(-90, 0, -96, 20); ctx.stroke();
  ctx.restore();
}
function pesoFerro(ctx, x, y, s, a = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= a;
  const g = ctx.createLinearGradient(-30, -20, 30, 20); g.addColorStop(0, '#6b7280'); g.addColorStop(1, '#1f2937');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-34, 20); ctx.lineTo(-26, -12); ctx.lineTo(26, -12); ctx.lineTo(34, 20); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#374151'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(0, -14, 12, Math.PI, 0); ctx.stroke();
  text(ctx, '1 kg', 0, 6, { size: 15, weight: 900, color: '#e5e7eb' });
  ctx.restore();
}
// prato visto de cima com bife que encolhe (k = tamanho)
function prato(ctx, cx, cy, r, k = 1, kind = 'bife') {
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18; circle(ctx, cx, cy, r, '#f1f5f9'); ctx.restore();
  const g = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, 10, cx, cy, r * 0.75); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#dfe5ea');
  circle(ctx, cx, cy, r * 0.75, '#e2e8f0'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r * 0.72, 0, 6.283); ctx.fill();
  ctx.save(); ctx.translate(cx, cy); ctx.scale(k * r / 170, k * r / 170); meat(ctx, kind); ctx.restore();
  // garfo e faca
  ctx.fillStyle = '#cbd5e1';
  fillRR(ctx, cx - r - 70, cy - r * 0.7, 16, r * 1.5, 8, '#cbd5e1'); for (let i = 0; i < 4; i++) fillRR(ctx, cx - r - 76 + i * 8, cy - r * 0.9, 4, 50, 2, '#cbd5e1');
  fillRR(ctx, cx + r + 54, cy - r * 0.9, 18, r * 1.7, 8, '#94a3b8'); fillRR(ctx, cx + r + 50, cy - r * 0.9, 26, r * 0.9, 12, '#e2e8f0');
}

// ================================================================ Cena 01: o mundo fechou a porta, e o boi bateu recorde
function scene01(K) {
  const tEu = K('a europa'), tParou = K('parou de comprar'), tCh = K('a china'), tMaior = K('maior compradora'), t67 = K('sessenta e sete');
  const tExp = K('as exportacoes'), tTerco = K('mais de um terco'), tSobrou = K('entao sobrou'), tBarata = K('mais barata'), tCerto = K('certo'), tNao = K('nao no mesmo mes');
  const tBoi = K('o boi bateu'), tPreco = K('maior preco'), t1994 = K('em mil novecentos'), tBr = K('o brasil e o maior'), tSal = K('salario minimo'), t39 = K('trinta e nove');
  const t19 = K('ha dezenove'), t62 = K('sessenta e dois'), tQuem = K('quem esta ficando'), tPra = K('pra descobrir'), tSeg = K('seguir um boi');
  const mapK = (t) => 1 - appear(t, tNao + 0.5, 0.7);
  const cam = [{ t: 0, x: 820, y: 500, z: 1.18 }, { t: tCh - 0.3, x: 960, y: 470, z: 1.0, d: 1.6 }, { t: tExp - 0.2, x: 900, y: 500, z: 1.04, d: 1.2 },
    { t: tNao + 0.5, x: 960, y: 520, z: 1.06, d: 1.0 }, { t: tBr - 0.2, x: 960, y: 520, z: 1.0, d: 1.2 }, { t: tQuem - 0.2, x: 960, y: 500, z: 1.0, d: 1.0 }, { t: tSeg, x: 480, y: 660, z: 1.5, d: 2.6 }];
  const sfx = [[tEu, 'horn', 0.5, { dur: 1.6 }], [tParou + 0.4, 'stamp', 0.9], [tCh, 'horn', 0.4, { dur: 1.2 }], [tMaior, 'pop', 0.5], [t67 - 0.1, 'flip', 0.8, { dur: 0.7 }], [t67 + 0.6, 'gate', 0.6],
    [tExp, 'clank', 0.6], [tTerco, 'drop', 0.7], [tSobrou, 'clank', 0.5], [tBarata, 'drop', 0.4], [tCerto, 'pop', 0.5], [tNao, 'buzz', 0.6], [tNao + 0.05, 'stamp', 0.9],
    [tBoi - 0.1, 'flip', 1, { dur: 1.0 }], [tPreco, 'bell', 0.8], [t1994, 'stamp', 0.7], [tBr, 'chalk', 0.6, { dur: 1.4 }], [tSal, 'chalk', 0.6, { dur: 1.0 }],
    ...[0, 1, 2, 3, 4].map((i) => [t39 + i * 0.12, 'pop', 0.35, { p: 1 }]), [t62, 'weight', 0.6], [tQuem, 'impact', 0.6], [tPra, 'whoosh', 0.5], [tSeg, 'moo', 0.5]];
  return {
    accent: P.pasto, cam, sfx, impacts: [tNao, tPreco], trans: 'flip',
    draw(ctx, t) {
      const mk = mapK(t);
      if (mk > 0) {
        ctx.save(); ctx.globalAlpha *= mk;
        mapa(ctx, t, { br: appear(t, 0, 0.8) });
        // Europa: rota acende e é cortada
        const eu = appear(t, tEu, 0.9), cut = appear(t, tParou + 0.4, 0.3);
        rota(ctx, PORT.santos, PORT.europa, VIA.europa, eu, cut > 0 ? '#ef4444' : '#e2e8f0', 6, cut > 0 ? [14, 12] : null);
        const lab = 1 - appear(t, tSobrou - 0.3, 0.4);
        if (cut > 0) {
          const [ex, ey] = PORT.europa;
          ctx.save(); ctx.translate(ex, ey); ctx.scale(lerp(1.8, 1, ease.out(cut)), lerp(1.8, 1, ease.out(cut))); ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 16; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(-34, -34); ctx.lineTo(34, 34); ctx.moveTo(34, -34); ctx.lineTo(-34, 34); ctx.stroke(); ctx.restore();
          headline(ctx, 'UNIÃO EUROPEIA', ex - 60, ey + 92, { size: 44, align: 'right', k: cut * lab });
          cap(ctx, 'parou de comprar · 3/9', ex - 60, ey + 146, { size: 32, align: 'right', alpha: cut * lab, color: '#fca5a5' });
        }
        // China: maior compradora, taxa de 67%
        const ch = appear(t, tCh, 1.0);
        rota(ctx, PORT.santos, PORT.china, VIA.china, ch, P.au, 10);
        const [cx, cy] = PORT.china;
        if (t > tMaior) { headline(ctx, 'CHINA', cx - 30, cy - 130, { size: 50, k: appear(t, tMaior, 0.4) }); cap(ctx, 'a maior compradora', cx - 30, cy - 78, { size: 32, alpha: appear(t, tMaior, 0.4) * lab }); }
        if (t > t67 - 0.1) {
          const gp = rotaPt(PORT.santos, PORT.china, VIA.china, 0.86), close = ease.out(prog(t, t67 + 0.5, 0.5));
          ctx.save(); ctx.translate(gp[0], gp[1]); ctx.fillStyle = '#334155'; ctx.fillRect(-8, -10, 16, 60);
          ctx.rotate(lerp(-1.3, 0, close)); for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? '#ffffff' : '#ef4444'; ctx.fillRect(0 + i * 22, -8, 22, 14); } ctx.restore();
          flipBoard(ctx, gp[0] + 40, gp[1] + 120, 64, '67%', t, t67 - 0.1, { color: '#fca5a5' });
          cap(ctx, 'de taxa pra entrar', gp[0] + 40, gp[1] + 226, { size: 32, alpha: appear(t, t67 + 0.4, 0.4) });
        }
        // navios indo e vindo
        for (let i = 0; i < 3; i++) {
          const u = ((t * 0.05 + i / 3) % 1);
          const live = t < tExp ? 1 : i === 2 ? 1 - appear(t, tExp + 0.3, 0.5) : 1;
          if (ch > 0.9 && live > 0) { const [sx, sy] = rotaPt(PORT.santos, PORT.china, VIA.china, u); navio(ctx, sx, sy - 6, 0.16, { seed: i + 2, rows: 2 }); }
        }
        // exportações caíram mais de um terço: contêineres empilhados
        const ek = vis(t, tExp, tSobrou + 0.2, 0.5, 0.4);
        if (ek > 0) {
          ctx.save(); ctx.globalAlpha *= ek;
          fillRR(ctx, 150, 470, 400, 360, 22, 'rgba(5,7,13,0.78)'); strokeRR(ctx, 150, 470, 400, 360, 22, '#334155', 3);
          cap(ctx, 'exportação de carne', 350, 505, { size: 26 });
          const fall = ease.inOut(prog(t, tTerco - 0.1, 0.7));
          for (let i = 0; i < 6; i++) conteiner(ctx, 255, 770 - i * 40, 0.55, '#2563eb');
          for (let i = 0; i < 6; i++) { const gone = i >= 4 ? fall : 0; if (gone >= 1) continue; ctx.save(); ctx.globalAlpha *= 1 - gone; conteiner(ctx, 445 + gone * 40, 770 - i * 40 - gone * 60, 0.55, '#f59e0b', {}); ctx.restore(); }
          if (fall > 0) { ctx.save(); ctx.globalAlpha *= fall; ctx.setLineDash([8, 6]); strokeRR(ctx, 383, 548, 124, 84, 4, 'rgba(252,165,165,0.7)', 2.5); ctx.restore(); }
          text(ctx, 'out/2025', 255, 812, { size: 22, weight: 800, color: '#cbd5e1' }); text(ctx, 'out/2026', 445, 812, { size: 22, weight: 800, color: '#cbd5e1' });
          if (t > tTerco + 0.4) headline(ctx, '−35%', 445, 592, { size: 32, color: '#fecaca', color2: '#ef4444', k: appear(t, tTerco + 0.4, 0.4) });
          ctx.restore();
        }
        // a hipótese: sobrou carne aqui, ficou barata?
        const hk = appear(t, tSobrou, 0.5);
        if (hk > 0) {
          const [bx, by] = mp(-50, -12);
          for (let i = 0; i < 12; i++) caixaCarne(ctx, bx - 90 + (i % 4) * 48 + (Math.floor(i / 4) % 2) * 24, by + 60 - Math.floor(i / 4) * 34, 1.1, clamp((t - tSobrou - i * 0.06) / 0.2));
          cap(ctx, 'sobrou carne aqui?', bx - 18, by + 120, { size: 28, alpha: appear(t, tSobrou + 0.3, 0.4), color: '#fde68a' });
          if (t > tBarata) {
            const k2 = appear(t, tBarata, 0.4);
            etiqueta(ctx, bx + 340, by - 40, 0.8, { t: 'CARNE', rows: [['R$/kg', 'mais barata?']], total: ['VAI BAIXAR?', '?'], h: 250 }, { rot: 0.05, alpha: k2 });
          }
          if (t > tNao) ovalStamp(ctx, bx + 340, by - 40, 190, 100, [['', -0.5, 0.2], ['NÃO', 0.05, 0.62], ['', 0.5, 0.2]], '#ef4444', appear(t, tNao, 0.25), -0.18);
        }
        ctx.restore();
      }
      // o balcão: o boi bateu recorde
      const wk = appear(t, tNao + 0.5, 0.7);
      if (wk > 0) {
        ctx.save(); ctx.globalAlpha *= wk;
        azulejos(ctx, -300, -200, 2520, 1500);
        const topK = 1 - appear(t, tBr - 0.3, 0.6);
        if (topK > 0) {
          ctx.save(); ctx.globalAlpha *= topK;
          cap(ctx, 'ARROBA DO BOI GORDO · SÃO PAULO', 960, 250, { size: 34, letter: 4, alpha: appear(t, tBoi - 0.3, 0.4) });
          if (t > tBoi - 0.1) flipBoard(ctx, 960, 400, 92, 'R$ 392,70', t, tBoi - 0.1, { color: P.au });
          if (t > tPreco) ovalStamp(ctx, 1640, 330, 170, 96, [['MAIOR', -0.48, 0.2], ['RECORDE', 0.05, 0.38], ['DA HISTÓRIA', 0.52, 0.17]], '#ef4444', appear(t, tPreco, 0.3), 0.14);
          if (t > t1994) headline(ctx, 'maior preço real desde 1994', 960, 640, { size: 54, k: appear(t, t1994, 0.5), hl: '#7f1d1d' });
          cap(ctx, '6 de novembro de 2026', 960, 720, { size: 28, alpha: appear(t, t1994 + 0.6, 0.4), color: '#cbd5e1' });
          ctx.restore();
        }
        // a lousa: o salário e o acém
        const lk = vis(t, tBr - 0.2, tQuem - 0.35, 0.6, 0.4);
        if (lk > 0) {
          ctx.save(); ctx.globalAlpha *= lk;
          lousa(ctx, 150, 220, 840, 580);
          chalk(ctx, 'maior exportador de carne do mundo', 190, 290, { size: 40, r: prog(t, tBr + 0.3, 1.6) });
          chalkLine(ctx, 190, 322, 880, 318, prog(t, tBr + 1.8, 0.4));
          chalk(ctx, '1 salário mínimo compra', 190, 410, { size: 44, r: prog(t, tSal - 0.3, 1.1) });
          if (t > t39) { chalk(ctx, 'hoje:', 230, 520, { size: 48, r: 1 }); chalk(ctx, `${Math.round(counting(t, t39, 0.8, 0, 39))} kg de acém`, 390, 520, { size: 64, weight: 900, color: '#fef08a', r: 1 }); }
          if (t > t19) { chalk(ctx, 'há 19 anos:', 230, 650, { size: 40, r: prog(t, t19, 0.6) }); if (t > t62) chalk(ctx, '62 kg', 520, 650, { size: 64, weight: 900, r: prog(t, t62, 0.4) }); }
          // bandejas de acém de 3 kg: 13 hoje, 21 há 19 anos
          const n1 = Math.round(counting(t, t39, 0.8, 0, 13)), n2 = t > t62 ? Math.round(counting(t, t62, 0.9, 0, 21)) : 0;
          if (t > t39) cap(ctx, 'hoje: 39 kg (13 bandejas de 3 kg)', 1450, 262, { size: 30, alpha: appear(t, t39, 0.4), color: '#fef08a' });
          for (let i = 0; i < n1; i++) bandeja(ctx, 1140 + (i % 7) * 104, 330 + Math.floor(i / 7) * 74, 0.3, 'acem');
          if (t > t62) cap(ctx, 'há 19 anos: 62 kg (21 bandejas)', 1450, 492, { size: 30, alpha: appear(t, t62, 0.4) });
          for (let i = 0; i < n2; i++) bandeja(ctx, 1140 + (i % 7) * 104, 560 + Math.floor(i / 7) * 74, 0.3, 'acem', { alpha: 0.85 });
          ctx.restore();
        }
        // quem está ficando com o dinheiro? o caminho do boi
        const qk = appear(t, tQuem + 0.1, 0.5);
        if (qk > 0) {
          ctx.save(); ctx.globalAlpha *= qk;
          const qo = 1 - appear(t, tSeg - 0.3, 0.5);
          headline(ctx, 'QUEM ESTÁ FICANDO', 960, 250, { size: 76, k: appear(t, tQuem + 0.1, 0.5) * qo });
          headline(ctx, 'COM ESSE DINHEIRO?', 960, 350, { size: 76, color: '#fef08a', color2: P.au, k: appear(t, tQuem + 0.5, 0.5) * qo });
          const pk = appear(t, tPra, 0.6);
          if (pk > 0) {
            ctx.save(); ctx.globalAlpha *= pk;
            ctx.save(); ctx.setLineDash([16, 14]); ctx.strokeStyle = 'rgba(250,204,21,0.8)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(480, 640); ctx.lineTo(480 + 960 * ease.inOut(prog(t, tPra, 1.4)), 640); ctx.stroke(); ctx.restore();
            boi(ctx, 480, 600, 0.38);
            frigorifico(ctx, 960, 640, 1.1, appear(t, tPra + 0.5, 0.4)); mercado(ctx, 1440, 640, 1.1, appear(t, tPra + 1.0, 0.4));
            cap(ctx, 'pasto', 480, 735, { size: 30, alpha: appear(t, tPra, 0.4) }); cap(ctx, 'frigorífico', 960, 735, { size: 30, alpha: appear(t, tPra + 0.5, 0.4) }); cap(ctx, 'balcão', 1440, 735, { size: 30, alpha: appear(t, tPra + 1.0, 0.4) });
            ctx.restore();
          }
          ctx.restore();
        }
        ctx.restore();
      }
    },
    overlay(ctx, t) { overlaySrc(ctx, t < tNao + 0.5 ? 'Comissão Europeia, Abiec, g1 e Globo Rural (2026)' : t < tBr ? 'Cepea/Esalq (6/11/2026)' : 'Agrifatto, via g1 (nov/2026)', vis(t, tParou, tQuem)); },
  };
}
function overlaySrc(ctx, str, a) { if (a > 0) source(ctx, str, a); }

// ================================================================ Cena 02: o preço do boi (a arroba)
function scene02(K) {
  const tCampo = K('no campo'), tQuilo = K('vendido por quilo'), tArr = K('e por arroba'), t15 = K('uma arroba e quinze'), tCouro = K('sem o couro'), tCab = K('a cabeca');
  const tVisc = K('as visceras'), tOsso = K('so a carne com o osso'), tNov = K('em novembro'), t390 = K('trezentos e noventa'), t26 = K('uns vinte e seis'), tCom = K('com osso');
  const tPronto = K('um boi pronto'), t20 = K('vinte arrobas'), tPor = K('por ele'), t8 = K('oito mil');
  const ghost = (t) => ease.inOut(prog(t, tCouro - 0.1, 2.6));
  const cam = [{ t: 0, x: 860, y: 540, z: 1.12 }, { t: tQuilo, x: 980, y: 520, z: 1.0, d: 1.2 }, { t: tCouro - 0.3, x: 900, y: 540, z: 1.06, d: 1.2 },
    { t: tNov - 0.3, x: 1000, y: 500, z: 1.0, d: 1.2 }, { t: tPronto - 0.2, x: 960, y: 540, z: 1.0, d: 1.0 }, { t: tPor - 0.2, x: 1000, y: 520, z: 1.0, d: 1.0 }];
  const sfx = [[0.2, 'moo', 0.4], [tQuilo + 0.3, 'buzz', 0.35], [tArr, 'stamp', 0.7], ...[0, 1, 2, 3, 4].map((i) => [t15 + 0.3 + i * 0.22, 'weight', 0.5]),
    [tCouro, 'knife', 0.6], [tCab, 'knife', 0.5], [tVisc, 'knife', 0.5], [tOsso, 'pop', 0.5], [tNov - 0.1, 'flip', 0.9, { dur: 0.9 }], [t390, 'bell', 0.7],
    [t26, 'chalk', 0.6, { dur: 0.9 }], [tCom, 'pop', 0.4], ...Array.from({ length: 20 }, (_, i) => [tPronto + 0.3 + i * 0.08, 'stamp', 0.18]), [tPor, 'printer', 0.8, { dur: 0.9 }], [t8, 'cash', 0.7]];
  const stamps = Array.from({ length: 20 }, (_, i) => [-190 + (i % 5) * 78, -78 + Math.floor(i / 5) * 42]);
  return {
    accent: P.pasto, cam, sfx, impacts: [tArr, t8], trans: 'flip',
    draw(ctx, t) {
      pasto(ctx, t, { dawn: 1 });
      const g = ghost(t);
      boi(ctx, 720, 560, 1.25, { ghost: g, carcass: g });
      // o que sai: couro, cabeça, vísceras
      const parts = [['couro', tCouro, [720, 380], [560, 250]], ['cabeça', tCab, [1060, 480], [1160, 330]], ['vísceras', tVisc, [700, 640], [560, 760]]];
      for (const [lab, at, from, to] of parts) {
        const k = ease.out(prog(t, at, 0.8)); if (k <= 0) continue;
        const a = 1 - appear(t, tNov, 0.6); if (a <= 0) continue;
        const x = lerp(from[0], to[0], k), y = lerp(from[1], to[1], k);
        ctx.save(); ctx.globalAlpha *= a; ctx.setLineDash([6, 6]); ctx.strokeStyle = 'rgba(226,232,240,0.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(from[0], from[1]); ctx.lineTo(x, y); ctx.stroke(); ctx.restore();
        ctx.save(); ctx.globalAlpha *= a; fillRR(ctx, x - 90, y - 30, 180, 60, 30, 'rgba(5,7,13,0.8)'); strokeRR(ctx, x - 90, y - 30, 180, 60, 30, '#94a3b8', 3); text(ctx, lab, x, y + 2, { size: 30, weight: 900, color: '#f1f5f9' }); ctx.restore();
      }
      if (t > tOsso) headline(ctx, 'carcaça = carne + osso', 720, 820, { size: 40, k: vis(t, tOsso, tNov, 0.4, 0.5) * 1, hl: '#7f1d1d' });
      // vendido por quilo? não: por arroba
      const ak = vis(t, tQuilo, t15 + 0.2, 0.4, 0.4);
      if (ak > 0) {
        ctx.save(); ctx.globalAlpha *= ak;
        const kw = headline(ctx, 'R$ / kg', 1480, 300, { size: 64, color: '#cbd5e1', k: appear(t, tQuilo, 0.4) }) || 240;
        if (t > tQuilo + 0.3) { const L = 1480 - kw / 2 - 24, W = kw + 48; ctx.save(); ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(L, 332); ctx.lineTo(L + W * ease.out(prog(t, tQuilo + 0.3, 0.3)), 268); ctx.stroke(); ctx.restore(); }
        if (t > tArr) headline(ctx, 'R$ / arroba', 1480, 440, { size: 72, color: '#d9f99d', color2: P.pasto, k: appear(t, tArr, 0.4) });
        ctx.restore();
      }
      // 1 arroba = 15 kg (pesos de ferro)
      const wk = vis(t, t15, tNov - 0.2, 0.4, 0.5);
      if (wk > 0) {
        ctx.save(); ctx.globalAlpha *= wk;
        headline(ctx, '1 arroba', 1480, 300, { size: 64, k: appear(t, t15, 0.4) });
        let n = 0;
        for (let row = 0; row < 5; row++) for (let c = 0; c <= 4 - row; c++) {
          const k = clamp((t - t15 - 0.3 - Math.floor(n / 3) * 0.22) / 0.2); n++;
          if (k <= 0) continue;
          pesoFerro(ctx, 1480 - (4 - row) * 38 + c * 76, 720 - row * 66 - (1 - k) * 60, 1.5, k);
        }
        fillRR(ctx, 1260, 760, 440, 18, 8, '#64748b');
        headline(ctx, '= 15 kg de carcaça', 1480, 840, { size: 40, k: appear(t, t15 + 1.2, 0.4) });
        ctx.restore();
      }
      // a arroba de novembro
      const fk = appear(t, tNov - 0.1, 0.5);
      if (fk > 0) {
        const up = ease.inOut(prog(t, tPronto - 0.3, 0.8));
        ctx.save(); ctx.globalAlpha *= fk * (1 - appear(t, tPor - 0.2, 0.5));
        cap(ctx, 'ARROBA · NOVEMBRO DE 2026', 1480, lerp(250, 200, up), { size: 28, letter: 3 });
        flipBoard(ctx, 1480, lerp(340, 290, up), 62, 'R$ 392,70', t, tNov - 0.1, { color: P.au });
        if (t > t26) {
          const k = appear(t, t26, 0.5);
          cap(ctx, '÷ 15 kg', 1480, lerp(470, 420, up), { size: 36, alpha: k, color: '#e2e8f0' });
          headline(ctx, 'R$ 26 por quilo', 1480, lerp(560, 510, up), { size: 60, k, color: '#fef08a', color2: P.au });
          if (t > tCom) cap(ctx, 'com osso', 1480, lerp(630, 580, up), { size: 32, alpha: appear(t, tCom, 0.4), color: '#fca5a5' });
        }
        ctx.restore();
      }
      // 20 arrobas carimbadas no boi
      if (t > tPronto + 0.2) {
        const a = 1 - appear(t, tPor + 2.5, 0.6);
        ctx.save(); ctx.globalAlpha *= a; ctx.translate(720, 560); ctx.scale(1.25, 1.25);
        stamps.forEach(([sx, sy], i) => { const k = clamp((t - tPronto - 0.3 - i * 0.08) / 0.12); if (k > 0) { ctx.save(); ctx.translate(sx, sy); ctx.scale(lerp(1.8, 1, k), lerp(1.8, 1, k)); ctx.globalAlpha *= k * 0.9; ctx.strokeStyle = '#fef08a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 17, 0, 6.283); ctx.stroke(); text(ctx, '@', 0, 1, { size: 22, weight: 900, color: '#fef08a' }); ctx.restore(); } });
        ctx.restore();
        headline(ctx, `${Math.min(20, Math.max(1, Math.floor((t - tPronto - 0.3) / 0.08) + 1))} arrobas`, 720, 250, { size: 64, k: appear(t, tPronto + 0.2, 0.4) * a, color: '#fef08a', color2: P.au });
      }
      // a etiqueta do boi
      if (t > tPor - 0.1) {
        const k = ease.out(prog(t, tPor - 0.1, 0.7));
        etiqueta(ctx, lerp(2200, 1480, k), 500, 1.05, { t: 'BOI GORDO', sub: '20 arrobas · 300 kg de carcaça', rows: [['ARROBA (R$)', '392,70'], ['ARROBAS', '20']], total: ['PECUARISTA RECEBE', 'R$ 7.854'], h: 360, code: 11 }, { rot: lerp(0.3, -0.04, k) });
        if (t > t8) { shockRing(ctx, t, t8, 1480, 580, P.au, 60, 380); headline(ctx, 'quase R$ 8 mil', 1480, 760, { size: 54, k: appear(t, t8, 0.4), color: '#fef08a', color2: P.au }); }
      }
    },
    overlay(ctx, t) { overlaySrc(ctx, t < tNov ? 'Band (o que é a arroba)' : 'Cepea/Esalq (6/11/2026) · conta do canal', vis(t, t15, 40)); },
  };
}

// ================================================================ Cena 03: do frigorífico ao balcão
function scene03(K) {
  const tFrig = K('vai pro frigorifico'), t300 = K('trezentos quilos'), tDiv = K('dividida em tres partes'), tDian = K('o dianteiro'), tTras = K('o traseiro'), tPonta = K('ponta de agulha');
  const tCost = K('onde fica a costela'), tNem = K('nem tudo vira bife'), tOsso = K('sai osso'), tGord = K('sai gordura'), t230 = K('duzentos e trinta quilos');
  const tPic = K('nao e so picanha'), tDuas = K('duas picanhas'), t3 = K('uns tres quilos'), tDe230 = K('de duzentos e trinta'), tAcem = K('o resto e acem'), tMusc = K('musculo'), tPat = K('patinho');
  const tAcou = K('no acougue'), t50 = K('cinquenta reais'), tMedia = K('na media de todos'), t11 = K('onze mil');
  const roomK = (t) => 1 - appear(t, tPic - 0.4, 0.6);
  const posterK = (t) => vis(t, tPic - 0.4, tAcou - 0.3, 0.6, 0.5);
  const kg = (t) => (t < tOsso ? 300 : t < t230 + 0.6 ? Math.round(counting(t, tOsso, t230 + 0.6 - tOsso, 300, 230)) : 230);
  const cam = [{ t: 0, x: 960, y: 480, z: 1.12 }, { t: t300 - 0.2, x: 1060, y: 470, z: 1.05, d: 1.0 }, { t: tDiv - 0.2, x: 860, y: 500, z: 1.06, d: 1.0 }, { t: tNem - 0.2, x: 1060, y: 520, z: 1.0, d: 1.0 },
    { t: tPic - 0.3, x: 960, y: 500, z: 1.0, d: 1.0 }, { t: tDuas - 0.2, x: 900, y: 440, z: 1.12, d: 1.2 }, { t: tDe230 - 0.2, x: 1100, y: 470, z: 1.08, d: 1.0 }, { t: tAcem - 0.2, x: 960, y: 540, z: 1.0, d: 1.0 },
    { t: tAcou - 0.2, x: 960, y: 500, z: 1.04, d: 1.0 }, { t: t11 - 0.4, x: 1000, y: 520, z: 1.04, d: 1.0 }];
  const sfx = [[0.3, 'rail', 0.7], [t300, 'beep', 0.6, { n: 2 }], [tDian, 'knife', 0.6], [tTras, 'knife', 0.6], [tPonta, 'knife', 0.6], [tNem, 'chop', 0.6], [tOsso + 0.2, 'clank', 0.5], [tGord + 0.2, 'drop', 0.4],
    [t230 + 0.6, 'beep', 0.6], [tPic - 0.3, 'whoosh', 0.5], [tDuas, 'sparkle', 0.7], [t3, 'pop', 0.5], [tDe230, 'tick', 0.6], [tAcem, 'pop', 0.4], [tMusc, 'pop', 0.4], [tPat, 'pop', 0.4], [tPat + 0.9, 'pop', 0.4],
    ...[0, 1, 2, 3, 4].map((i) => [tAcou + 0.2 + i * 0.25, 'beep', 0.35]), [t50, 'chalk', 0.5, { dur: 0.6 }], [t11 - 0.3, 'printer', 0.8, { dur: 1.0 }], [t11 + 0.8, 'cash', 0.6]];
  const RANK = { acém: () => tAcem, músculo: () => tMusc, patinho: () => tPat, costela: () => tPat + 0.9 };
  return {
    accent: '#38bdf8', cam, sfx, impacts: [tNem, t11 + 0.8], trans: 'cold',
    draw(ctx, t) {
      // câmara fria
      const rk = roomK(t);
      if (rk > 0) {
        ctx.save(); ctx.globalAlpha *= rk;
        const fog = ctx.createLinearGradient(0, -200, 0, 1200); fog.addColorStop(0, 'rgba(186,230,253,0.16)'); fog.addColorStop(1, 'rgba(15,23,42,0)');
        ctx.fillStyle = fog; ctx.fillRect(-300, -200, 2520, 1500);
        trilho(ctx, -300, 2300, 120);
        // as do lado escurecem quando as etiquetas das partes entram (não brigam com o texto)
        const side = 1 - 0.7 * appear(t, tDian - 0.3, 0.5);
        ctx.save(); ctx.globalAlpha *= side; meiaCarcaca(ctx, 470, 190, 0.78, { t, ph: 1, sif: true }); ctx.restore(); meiaCarcaca(ctx, 1640, 190, 0.78, { t, ph: 2 });
        ctx.save(); ctx.globalAlpha *= 0.35 * side; meiaCarcaca(ctx, 120, 190, 0.7, { t, ph: 4, sif: false }); ctx.restore();
        meiaCarcaca(ctx, 960, 190, 0.88, { t, ph: 0, cuts: appear(t, tDiv, 0.6) });
        // balança do trilho
        const dk = appear(t, t300 - 0.3, 0.4);
        if (dk > 0) {
          ctx.save(); ctx.globalAlpha *= dk;
          fillRR(ctx, 1110, 250, 300, 150, 16, '#0a120e'); strokeRR(ctx, 1110, 250, 300, 150, 16, '#334155', 4);
          text(ctx, 'PESO DA CARCAÇA', 1260, 278, { size: 18, weight: 900, color: '#dbe7df', letter: 2 });
          seg7(ctx, `${kg(t)},0`, 1340, 340, 70, P.led); text(ctx, 'kg', 1380, 360, { size: 24, weight: 800, color: '#93a59a' });
          ctx.restore();
        }
        // as três partes
        const labs = [['TRASEIRO', tTras, 380, 330], ['PONTA DE AGULHA', tPonta, 560, 600], ['DIANTEIRO', tDian, 760, 790]];
        for (const [lab, at, y, ty] of labs) {
          const k = appear(t, at, 0.4); if (k <= 0) continue;
          const a = 1 - appear(t, tNem - 0.2, 0.5); if (a <= 0) continue;
          ctx.save(); ctx.globalAlpha *= k * a;
          ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(650, y); ctx.lineTo(880, ty); ctx.stroke();
          fillRR(ctx, 380, y - 26, 280, 56, 10, lab === 'PONTA DE AGULHA' ? '#7f1d1d' : '#1e293b'); strokeRR(ctx, 380, y - 26, 280, 56, 10, '#e2e8f0', 2);
          text(ctx, lab, 520, y + 2, { size: lab === 'PONTA DE AGULHA' ? 24 : 28, weight: 900, color: '#ffffff', letter: 2 });
          if (lab === 'PONTA DE AGULHA' && t > tCost) cap(ctx, 'onde fica a costela', 520, y + 54, { size: 24, alpha: appear(t, tCost, 0.4), color: '#fca5a5' });
          ctx.restore();
        }
        // osso e gordura caindo na caixa
        if (t > tOsso) {
          const ca = 1 - appear(t, tPic - 0.6, 0.4);
          ctx.save(); ctx.globalAlpha *= ca;
          fillRR(ctx, 1150, 690, 300, 120, 12, '#334155'); fillRR(ctx, 1150, 690, 300, 22, 8, '#475569');
          const r = rng(5);
          for (let i = 0; i < 16; i++) {
            const at = (i % 2 ? tGord : tOsso) + 0.1 + (i >> 1) * 0.12, k = clamp((t - at) / 0.5); if (k <= 0) continue;
            const x0 = 1000 + r() * 40, x1 = 1180 + r() * 240, y = lerp(500, 700 + r() * 20, ease.in(k));
            if (i % 2) { ctx.fillStyle = '#f3e3cf'; ctx.beginPath(); ctx.ellipse(lerp(x0, x1, k), y, 20, 13, r(), 0, 6.283); ctx.fill(); }
            else { fillRR(ctx, lerp(x0, x1, k) - 22, y - 8, 44, 16, 8, '#f8fafc'); circle(ctx, lerp(x0, x1, k) - 22, y, 10, '#f8fafc'); circle(ctx, lerp(x0, x1, k) + 22, y, 10, '#f8fafc'); }
          }
          cap(ctx, 'osso e gordura', 1300, 828, { size: 28, alpha: appear(t, tGord, 0.4) });
          if (t > t230) headline(ctx, 'sobram 230 kg de carne', 1300, 455, { size: 36, k: appear(t, t230 + 0.6, 0.4), color: '#fef08a', color2: P.au });
          ctx.restore();
        }
        ctx.restore();
      }
      // o cartaz de cortes: 2 picanhas em 230 kg
      const pk = posterK(t);
      if (pk > 0) {
        ctx.save(); ctx.globalAlpha *= pk;
        azulejos(ctx, -300, -200, 2520, 1500);
        const on = (name) => {
          if (t < tDuas) return null;
          if (name === 'picanha') return P.au;
          const at = RANK[name]; if (at && t > at()) return '#dc2626';
          return '#efe4d0';
        };
        cartaz(ctx, 720, 470, 1.05, { fill: on, hlName: (n) => (n === 'picanha' ? appear(t, tDuas, 0.4) : RANK[n] ? appear(t, RANK[n](), 0.3) : 0) });
        if (t > tDuas) {
          headline(ctx, '2 picanhas', 1490, 230, { size: 60, k: appear(t, tDuas, 0.4), color: '#fef08a', color2: P.au });
          if (t > t3) cap(ctx, 'uns 3 kg', 1490, 300, { size: 40, alpha: appear(t, t3, 0.4), color: '#fef08a' });
          const gk = appear(t, tDe230 - 0.3, 0.5);
          if (gk > 0) {
            for (let i = 0; i < 230; i++) { const cx = 1286 + (i % 23) * 18, cy = 360 + Math.floor(i / 23) * 18, k = clamp((t - tDe230 + 0.3 - i * 0.003) / 0.2); if (k <= 0) continue; fillRR(ctx, cx, cy, 15, 15, 3, i < 3 ? P.au : hexA('#f87171', 0.55), k); }
            cap(ctx, 'de 230 kg de carne', 1490, 570, { size: 32, alpha: gk });
          }
        }
        if (t > tAcem) headline(ctx, 'o resto: acém, músculo, patinho, costela', 960, 785, { size: 38, k: appear(t, tAcem, 0.5), hl: '#7f1d1d' });
        ctx.restore();
      }
      // o balcão do açougue
      const bk = appear(t, tAcou - 0.3, 0.6);
      if (bk > 0) {
        ctx.save(); ctx.globalAlpha *= bk;
        azulejos(ctx, -300, -200, 2520, 1500);
        // vitrine refrigerada
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 40; fillRR(ctx, 120, 560, 1680, 300, 20, '#1f2937'); ctx.restore();
        fillRR(ctx, 140, 580, 1640, 200, 14, '#0f2a3a');
        const items = [['ACÉM', '37,98', 'acem'], ['MÚSCULO', '40,01', 'musculo'], ['MAMINHA', '53,37', 'maminha'], ['COXÃO MOLE', '54,20', 'patinho'], ['PICANHA', '78,57', 'picanha']];
        items.forEach(([nome, preco, kind], i) => {
          const k = clamp((t - tAcou - 0.2 - i * 0.25) / 0.3); if (k <= 0) return;
          const x = 300 + i * 330;
          bandeja(ctx, x, 690, 0.98, kind, { alpha: k });
          etiqueta(ctx, x + 20, 480 - (1 - k) * 40, 0.66, { t: nome, tSize: nome.length > 8 ? 26 : 32, rows: [['R$/kg', preco]], h: 230, code: i + 3 }, { rot: (i % 2 ? 0.04 : -0.04), alpha: k });
        });
        ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(140, 580, 1640, 30);
        const mo = 1 - appear(t, t11 - 0.5, 0.3);
        if (t > t50) headline(ctx, 'média: R$ 50 o quilo', 960, 210, { size: 60, k: appear(t, t50, 0.4) * mo, color: '#fef08a', color2: P.au });
        if (t > tMedia) cap(ctx, 'somando todos os cortes do boi', 960, 285, { size: 32, alpha: appear(t, tMedia, 0.4) * mo });
        if (t > t11 - 0.3) {
          const k = ease.out(prog(t, t11 - 0.3, 0.8));
          etiqueta(ctx, 960, lerp(-200, 250, k), 0.82, { t: 'O BOI INTEIRO NO BALCÃO', tSize: 26, rows: [['CARNE (kg)', '230'], ['MÉDIA R$/kg', '50,00']], total: ['TOTAL', 'R$ 11.500'], h: 330, code: 21 }, { rot: lerp(-0.3, 0.02, k) });
        }
        ctx.restore();
      }
    },
    overlay(ctx, t) { overlaySrc(ctx, t < tAcou ? 'Embrapa e estudo de desossa (Engormix) · conta do canal' : 'Mercado Mineiro e Itatiaia (BH, out–nov/2026) · conta do canal', vis(t, t300, 44)); },
  };
}

// ================================================================ Cena 04: imagina o boi inteiro (quem fica com cada real)
function scene04(K) {
  const tIm = K('agora imagina'), tCem = K('de cada cem reais'), tQuem = K('quem fica com quanto'), t70 = K('quase setenta'), tCriou = K('quem criou o boi'), tLucro = K('nao e lucro');
  const tBez = K('o bezerro'), tPasto = K('o pasto'), tRac = K('a racao'), tVac = K('a vacina'), tEsp = K('dois anos de espera');
  const t25 = K('uns vinte e cinco'), tFrig = K('com o frigorifico'), tCam = K('caminhao refrigerado'), tMerc = K('e o mercado'), tAcou = K('o acougueiro'), tFrz = K('o freezer'), tEn = K('a energia'), tAlu = K('o aluguel'), tEstr = K('carne que estraga');
  const tPouco = K('ganha pouco'), tDin = K('o dinheiro dele'), tCouro = K('o couro vira sapato'), tSebo = K('o sebo'), tFora = K('vai pra fora'), tDolar = K('em dolar');
  const tImp = K('e o imposto'), t7 = K('uns sete reais'), tIcms = K('quase tudo de icms'), tEst = K('o imposto do estado'), tPis = K('o pis'), tFed = K('que sao federais'), tZer = K('estao zerados'), t2013 = K('dois mil e treze');
  const tIph = K('no iphone'), tMet = K('quase metade'), tNa = K('na carne a maior parte');
  const green = (t) => ease.inOut(prog(t, t70, 1.6)), purple = (t) => ease.out(prog(t, t25, 0.9)), orange = (t) => ease.out(prog(t, t7, 0.6));
  const cam = [{ t: 0, x: 860, y: 490, z: 1.08 }, { t: tCem, x: 960, y: 500, z: 1.0, d: 1.2 }, { t: t70 - 0.2, x: 940, y: 500, z: 1.03, d: 1.2 }, { t: tLucro - 0.2, x: 1000, y: 520, z: 1.03, d: 1.0 },
    { t: t25 - 0.2, x: 980, y: 500, z: 1.0, d: 1.0 }, { t: tPouco - 0.2, x: 1000, y: 520, z: 1.04, d: 1.2 }, { t: tImp - 0.2, x: 960, y: 500, z: 1.02, d: 1.0 },
    { t: tPis - 0.2, x: 1000, y: 510, z: 1.04, d: 1.0 }, { t: tIph - 0.2, x: 980, y: 510, z: 1.03, d: 1.0 }, { t: tNa - 0.2, x: 960, y: 500, z: 1.0, d: 1.6 }];
  const sfx = [[0.1, 'chalk', 0.6, { dur: 0.8 }], [tCem, 'printer', 0.7, { dur: 0.8 }], [tQuem, 'pop', 0.5], [t70, 'sizzle', 0.4, { dur: 1.6 }], [t70 + 1.7, 'cash', 0.6], [tLucro, 'paper', 0.6, { dur: 0.5 }],
    ...[tBez, tPasto, tRac, tVac, tEsp].map((x) => [x, 'tick', 0.7]), [t25, 'whoosh', 0.5], [t25 + 0.9, 'coin', 0.5], [tFrig, 'pop', 0.5], [tCam, 'truck', 0.5, { dur: 1.6 }], [tMerc, 'pop', 0.5],
    ...[tAcou, tFrz, tEn, tAlu, tEstr].map((x) => [x, 'click', 0.5]), [tPouco, 'drop', 0.4], [tCouro, 'pop', 0.6], [tSebo, 'pop', 0.6], [tFora, 'clank', 0.5], [tDolar, 'coin', 0.6],
    [tImp, 'hit', 0.5], [t7, 'stamp', 0.6], [tPis, 'paper', 0.4], [tZer, 'stamp', 0.9], [tIph, 'pop', 0.5], [tMet, 'buzz', 0.3], [tNa, 'ding', 0.7]];
  const legsCol = (t) => (purple(t) > 0.5 ? P.cadeia : '#e8dcc2');
  return {
    accent: P.pasto, cam, sfx, impacts: [tZer], trans: 'cleaver',
    draw(ctx, t) {
      azulejos(ctx, -300, -200, 2520, 1500);
      const g = green(t), pu = purple(t), or = orange(t);
      const thresh = lerp(-280, 180, g);
      cartaz(ctx, 700, 470, 1.1, {
        fill: (name) => {
          if (g <= 0) return null;
          if (name === 'pescoço' && or > 0) return hexA(P.icms, 0.4 + 0.6 * or);
          if (['músculo', 'pescoço', 'peito'].includes(name)) return pu > 0 ? hexA(P.cadeia, 0.35 + 0.6 * pu) : '#efe4d0';
          const c = CUTS.find((x) => x[0] === name)[2][0]; return c < thresh ? P.pasto : '#efe4d0';
        },
        base: pu > 0.3 ? P.cadeia : '#f3ead6', hoof: or > 0.3 ? P.icms : '#7f1d1d',
      });
      if (t > tIm) chalk(ctx, 'imagina...', 380, 96, { size: 52, r: prog(t, tIm, 0.8), color: '#fef3c7' });
      // a sua compra: R$ 100
      if (t > tCem) {
        const k = ease.out(prog(t, tCem, 0.7));
        etiqueta(ctx, 1490, lerp(-160, 190, k), 0.82, { t: 'SUA COMPRA DE CARNE', tSize: 24, rows: [], total: ['TOTAL', 'R$ 100,00'], h: 190, code: 31 }, { rot: 0.03 });
      }
      if (t > tQuem) headline(ctx, 'quem fica com quanto?', 1490, 345, { size: 44, k: vis(t, tQuem, t70 + 0.2, 0.4, 0.4) });
      // livro-caixa: três linhas
      const rows = [[P.pasto, 'PECUARISTA', 68, t70 + 0.6, 'quem criou o boi', tCriou], [P.cadeia, 'FRIGORÍFICO, FRETE E MERCADO', 25, t25 + 0.2, 'o caminho', t25], [P.icms, 'IMPOSTO (ICMS)', 7, t7, 'do estado', tEst]];
      rows.forEach(([col, lab, v, at, sub, subAt], i) => {
        const k = appear(t, at, 0.5); if (k <= 0) return;
        const y = 330 + i * 92;
        ctx.save(); ctx.globalAlpha *= k;
        fillRR(ctx, 1170, y - 38, 650, 80, 16, 'rgba(5,7,13,0.82)'); fillRR(ctx, 1170, y - 38, 14, 80, 7, col);
        text(ctx, lab, 1204, y - 12, { size: lab.length > 20 ? 20 : 24, weight: 900, color: '#f8fafc', align: 'left', letter: 1 });
        if (t > subAt) text(ctx, sub, 1204, y + 20, { size: 22, weight: 700, color: '#cbd5e1', align: 'left', alpha: appear(t, subAt, 0.4) });
        headline(ctx, `R$ ${Math.round(counting(t, at, 1.0, 0, v))}`, 1790, y + 2, { size: 54, align: 'right', color: '#ffffff', color2: col, k: 1, noPop: true });
        ctx.restore();
      });
      // detalhe 1: não é lucro (o recibo)
      const rk = vis(t, tLucro, t25 - 0.1, 0.5, 0.4);
      if (rk > 0) {
        ctx.save(); ctx.globalAlpha *= rk;
        const x = 1250, y = 400, w = 500, h = 440;
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 24; ctx.fillStyle = '#fbfaf5'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + h);
        for (let i = 0; i <= 20; i++) ctx.lineTo(x + w - (i * w) / 20, y + h + (i % 2 ? 10 : 0)); ctx.closePath(); ctx.fill(); ctx.restore();
        text(ctx, 'PRA ONDE VAI O DINHEIRO DO BOI', x + w / 2, y + 36, { size: 20, weight: 900, color: P.ink, letter: 1 });
        ctx.fillStyle = P.ink; ctx.fillRect(x + 20, y + 56, w - 40, 2);
        [['bezerro', tBez], ['pasto', tPasto], ['ração', tRac], ['vacina', tVac], ['2 anos de espera', tEsp]].forEach(([it, at], i) => {
          const k = appear(t, at, 0.3); if (k <= 0) return;
          const yy = y + 96 + i * 50;
          text(ctx, it, x + 40, yy, { size: 30, weight: 800, color: P.ink, align: 'left', alpha: k });
          ctx.save(); ctx.globalAlpha *= k; ctx.strokeStyle = '#16a34a'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x + w - 70, yy); ctx.lineTo(x + w - 56, yy + 14); ctx.lineTo(x + w - 30, yy - 16); ctx.stroke(); ctx.restore();
        });
        ovalStamp(ctx, x + w / 2, y + h - 58, 170, 58, [['NÃO É LUCRO', 0.04, 0.5]], '#b91c1c', appear(t, tEsp + 0.7, 0.3), -0.06);
        ctx.restore();
      }
      // detalhe 2: o caminho
      const ck = vis(t, tFrig, tPouco - 0.1, 0.4, 0.4);
      if (ck > 0) {
        ctx.save(); ctx.globalAlpha *= ck;
        frigorifico(ctx, 1290, 640, 0.95, appear(t, tFrig, 0.4)); caminhaoFrio(ctx, 1520, 640, 0.42 * appear(t, tCam, 0.4) + 0.0001); mercado(ctx, 1730, 640, 0.95, appear(t, tMerc, 0.4));
        [['açougueiro', tAcou], ['freezer', tFrz], ['energia', tEn], ['aluguel', tAlu], ['carne que estraga', tEstr]].forEach(([lab, at], i) => {
          const k = appear(t, at, 0.3, ease.back); if (k <= 0) return;
          const x = 1260 + (i % 3) * 190 + (i > 2 ? 95 : 0), y = 742 + (i > 2 ? 56 : 0);
          ctx.save(); ctx.translate(x, y); ctx.scale(k, k); fillRR(ctx, -88, -24, 176, 48, 24, hexA(P.cadeia, 0.3)); strokeRR(ctx, -88, -24, 176, 48, 24, P.cadeiaL, 2); text(ctx, lab, 0, 2, { size: lab.length > 12 ? 19 : 24, weight: 800, color: '#f5f3ff' }); ctx.restore();
        });
        ctx.restore();
      }
      // detalhe 3: o frigorífico ganha no que você não compra
      const fk = vis(t, tPouco, tImp - 0.1, 0.5, 0.4);
      if (fk > 0) {
        ctx.save(); ctx.globalAlpha *= fk;
        frigorifico(ctx, 1490, 590, 1.2);
        const items = [[tCouro, 1270, 'couro vira sapato', (c, x, y, k) => sapato(c, x, y, 1.1, k)], [tSebo, 1495, 'sebo vira sabão', (c, x, y, k) => sabao(c, x, y, 1.0, k)], [tFora, 1720, 'carne vai pra fora', (c, x, y, k) => conteiner(c, x, y, 0.6, '#0ea5e9', { label: 'US$' })]];
        for (const [at, x, lab, fn] of items) {
          const k = appear(t, at, 0.4, ease.back); if (k <= 0) continue;
          ctx.save(); ctx.translate(x, 757); ctx.scale(k, k); fn(ctx, 0, 0, 1); ctx.restore();
          cap(ctx, lab, x, 812, { size: 22, alpha: k });
        }
        if (t > tDin) cap(ctx, 'ganha mais no que você não compra', 1495, 690, { size: 28, alpha: appear(t, tDin, 0.4), color: '#e9d5ff' });
        ctx.restore();
      }
      // detalhe 4: ICMS e o carimbo do PIS/Cofins
      const ik = vis(t, tImp, tIph - 0.1, 0.5, 0.4);
      if (ik > 0) {
        ctx.save(); ctx.globalAlpha *= ik;
        if (t > tIcms) { headline(ctx, 'ICMS', 1340, 640, { size: 64, color: '#fde68a', color2: P.icms, k: appear(t, tIcms, 0.4) }); cap(ctx, 'uns 7% · vai pro estado', 1340, 710, { size: 28, alpha: appear(t, tIcms, 0.4) }); }
        if (t > tPis) {
          headline(ctx, 'PIS/COFINS', 1660, 620, { size: 44, k: appear(t, tPis, 0.4), color: '#fecaca' });
          if (t > tFed) cap(ctx, 'federais', 1660, 672, { size: 26, alpha: appear(t, tFed, 0.4) });
          ovalStamp(ctx, 1660, 780, 150, 74, [['DESDE 2013', -0.5, 0.2], ['R$ 0', 0.06, 0.6], ['', 0.5, 0.2]], '#ef4444', appear(t, tZer, 0.3), 0.08);
        }
        ctx.restore();
      }
      // detalhe 5: iPhone x carne
      const pk = appear(t, tIph - 0.1, 0.5);
      if (pk > 0) {
        ctx.save(); ctx.globalAlpha *= pk;
        etiqueta(ctx, 1340, 720, 0.62, { t: 'iPHONE', rows: [['IMPOSTO', '46%']], h: 210, code: 41 }, { rot: -0.06 });
        if (t > tNa) etiqueta(ctx, 1680, 720, 0.62, { t: 'CARNE', rows: [['IMPOSTO', '7%'], ['PECUARISTA', '68%']], h: 250, code: 42 }, { rot: 0.05, alpha: appear(t, tNa, 0.4) });
        if (t > tMet) cap(ctx, 'quase metade', 1340, 600, { size: 28, alpha: appear(t, tMet, 0.4), color: '#fca5a5' });
        ctx.restore();
      }
      if (t > tNa + 0.4) headline(ctx, 'a maior parte volta pro pasto', 700, 795, { size: 46, k: appear(t, tNa + 0.4, 0.5), color: '#ecfccb', color2: P.pasto, hl: 'rgba(20,83,45,0.9)' });
    },
    overlay(ctx, t) { overlaySrc(ctx, t < tImp ? 'conta do canal com Cepea, IBGE e Mercado Mineiro (2026)' : 'Lei 12.839/2013 · ICMS de SP · conta do canal', vis(t, t70, 70)); },
  };
}

// ================================================================ Cena 05: o relógio da vaca
function scene05(K) {
  const tSe = K('se o imposto e pequeno'), tPor = K('por que o boi ficou'), tVaca = K('comeca numa vaca'), t9 = K('nove meses'), tBez = K('pra ter um bezerro'), tLeva = K('e esse bezerro leva'), t2 = K('dois anos');
  const tOu = K('ou seja'), tDec = K('foi decidida'), tHa = K('e ha tres anos'), tBar = K('estava barato'), tCriar = K('criar nao compensava'), tAbate = K('mandou as vacas');
  const t2025 = K('em dois mil e vinte e cinco'), t43 = K('quarenta e tres milhoes'), tFem = K('quase metade eram femeas'), tSobra = K('teve carne sobrando'), tMas = K('mas cada vaca'), tNasce = K('que nao nasce');
  const tFalta = K('agora faltam animais'), tRec = K('o bezerro bateu recorde'), t3400 = K('tres mil e quatrocentos'), tContr = K('faz o contrario'), tSeg = K('segura as vacas'), tMenos = K('menos vaca'), tHoje = K('menos carne hoje');
  const clockK = (t) => vis(t, tVaca - 0.2, t2025 - 0.2, 0.6, 0.5);
  const truckX = (t) => lerp(-500, 2400, ease.inOut(prog(t, tAbate, 3.2)));
  const cowGone = (t) => (t > tAbate ? clamp((truckX(t) - 380) / 220) : 0);
  const handAng = (t) => {
    if (t < t9) return 0;
    if (t < tLeva) return 0.75 * 2 * Math.PI * ease.inOut(prog(t, t9, 1.4));
    if (t < tHa) return 0.75 * 2 * Math.PI + 4 * Math.PI * ease.inOut(prog(t, t2 - 0.2, 1.6));
    return (0.75 * 2 + 4) * Math.PI * (1 - ease.inOut(prog(t, tHa, 1.4)));
  };
  const cam = [{ t: 0, x: 960, y: 520, z: 1.0 }, { t: tVaca - 0.2, x: 1000, y: 500, z: 1.04, d: 1.2 }, { t: tOu - 0.2, x: 960, y: 520, z: 1.0, d: 1.0 }, { t: tCriar - 0.2, x: 860, y: 540, z: 1.04, d: 1.2 },
    { t: t2025 - 0.2, x: 960, y: 500, z: 1.0, d: 1.0 }, { t: tMas - 0.2, x: 960, y: 560, z: 1.08, d: 1.2 }, { t: tRec - 0.2, x: 1000, y: 480, z: 1.04, d: 1.0 }, { t: tSeg - 0.2, x: 900, y: 560, z: 1.06, d: 1.0 }, { t: tMenos - 0.2, x: 960, y: 500, z: 1.0, d: 1.0 }];
  const sfx = [[tSe, 'pop', 0.4], [tPor, 'hit', 0.5], [tVaca, 'moo', 0.5], [t9, 'clock', 0.8, { n: 4, step: 0.35 }], [tBez, 'sparkle', 0.5], [t2, 'clock', 0.8, { n: 6, step: 0.27 }], [tDec, 'chalk', 0.6, { dur: 1.2 }],
    [tHa, 'whoosh', 0.6, { dur: 1.2 }], [tHa, 'clock', 0.6, { n: 5, step: 0.25 }], [tBar, 'drop', 0.5], [tAbate, 'truck', 0.5, { dur: 2.5 }], [t2025 - 0.1, 'flip', 0.9, { dur: 1.0 }], [t43, 'impact', 0.6],
    ...Array.from({ length: 12 }, (_, i) => [tFem + 0.2 + i * 0.06, 'pop', 0.25]), [tSobra, 'clank', 0.4], [tMas, 'drop', 0.5], [tNasce, 'poweroff', 0.35], [tFalta, 'wind', 0.5, { dur: 2 }],
    [tRec - 0.1, 'flip', 0.9, { dur: 1.0 }], [t3400, 'bell', 0.8], [tSeg, 'gate', 0.8], [tMenos, 'drop', 0.5], [tHoje, 'drop', 0.5]];
  return {
    accent: '#f59e0b', cam, sfx, impacts: [t43, t3400], trans: 'clock',
    draw(ctx, t) {
      pasto(ctx, t, { dawn: 0.7 });
      // a pergunta
      const qk = vis(t, tSe - 0.1, tVaca - 0.7, 0.4, 0.4);
      if (qk > 0) {
        ctx.save(); ctx.globalAlpha *= qk;
        cap(ctx, 'se o imposto é pequeno...', 960, 260, { size: 44, alpha: appear(t, tSe, 0.4) });
        headline(ctx, 'POR QUE O BOI FICOU TÃO CARO?', 960, 370, { size: 76, k: appear(t, tPor, 0.5), color: '#fef08a', color2: P.au });
        ctx.restore();
      }
      // a vaca, o bezerro e o relógio
      const ck = clockK(t);
      if (ck > 0) {
        ctx.save(); ctx.globalAlpha *= ck;
        const ang = handAng(t);
        const lab = t < tLeva ? (t > t9 ? '9 meses' : 'meses') : t < tHa ? (t > t2 ? '2 anos' : 'anos') : (t > tHa + 0.6 ? '2023' : 'anos');
        relogio(ctx, 1460, 400, 240, ang, { label: lab, arc: t > t9 && t < tLeva ? [0, ang, P.au] : null });
        const grow = ease.inOut(prog(t, t2 - 0.2, 1.8));
        boi(ctx, 520, 610, 0.95, { female: true, tint: '#efe9dc', alpha: appear(t, tVaca, 0.5) * (1 - cowGone(t)) });
        if (t > tBez && t < tHa) { const s = lerp(0.5, 0.85, grow); boi(ctx, lerp(880, 900, grow), lerp(690, 640, grow), s, { alpha: appear(t, tBez, 0.4), tint: lerp(0, 1, grow) > 0.5 ? '#e9e6df' : '#efe9dc', female: grow < 0.5 }); }
        if (t > tOu) headline(ctx, 'a carne de hoje foi decidida há 3 anos', 960, 805, { size: 46, k: vis(t, tDec, tHa + 0.3, 0.5, 0.4), hl: 'rgba(120,53,15,0.95)' });
        // há três anos: bezerro barato, vacas pro abate
        if (t > tHa + 0.2) {
          const k = appear(t, tBar, 0.4);
          etiqueta(ctx, 900, 320, 0.85, { t: 'BEZERRO · 2023', rows: [['PREÇO', 'BAIXO']], h: 210, code: 51 }, { rot: -0.05, alpha: k });
          if (t > tCriar) cap(ctx, 'criar não compensava', 560, 815, { size: 36, alpha: appear(t, tCriar, 0.4), color: '#fde68a' });
        }
        ctx.restore();
      }
      // vacas saindo pro abate (caminhão)
      const ab = vis(t, tAbate, t2025 + 0.5, 0.4, 0.5);
      if (ab > 0) {
        ctx.save(); ctx.globalAlpha *= ab;
        caminhaoFrio(ctx, truckX(t), 760, 0.9);
        ctx.restore();
      }
      // 2025: recorde de abate, quase metade fêmeas
      const rk = vis(t, t2025 - 0.1, tFalta - 0.2, 0.5, 0.5);
      if (rk > 0) {
        ctx.save(); ctx.globalAlpha *= rk;
        cap(ctx, 'BOIS E VACAS ABATIDOS EM 2025', 960, 190, { size: 30, letter: 3 });
        flipBoard(ctx, 960, 290, 64, '42,9 MILHÕES', t, t2025 - 0.1, { color: '#fecaca' });
        if (t > t43) ovalStamp(ctx, 1650, 220, 150, 72, [['RECORDE', 0.05, 0.5]], '#ef4444', appear(t, t43, 0.3), 0.12);
        // 25 animais: 12 fêmeas
        for (let i = 0; i < 25; i++) {
          const x = 300 + (i % 13) * 112 + (i >= 13 ? 56 : 0), y = i < 13 ? 520 : 650, fem = [1, 3, 4, 6, 8, 9, 11, 14, 16, 18, 20, 23].includes(i);
          const k = clamp((t - t2025 - 0.6 - i * 0.03) / 0.3); if (k <= 0) continue;
          const lost = fem && t > tMas ? ease.inOut(prog(t, tMas + 0.3 + (i % 5) * 0.12, 0.6)) : 0;
          boi(ctx, x, y, 0.2, { alpha: k * (1 - lost), female: fem, tint: fem && t > tFem ? '#fbcfe8' : '#e9e6df' });
          if (lost > 0) { ctx.save(); ctx.globalAlpha *= lost; boi(ctx, x + 10, y + 12, 0.12, { ghost: 1, female: true }); ctx.restore(); }
        }
        if (t > tFem) headline(ctx, '48% eram fêmeas', 960, 790, { size: 50, k: vis(t, tFem, tMas, 0.4, 0.4), color: '#fce7f3', color2: '#f472b6' });
        if (t > tSobra) { const sk = vis(t, tSobra, tMas, 0.4, 0.4); for (let i = 0; i < 6; i++) bandeja(ctx, 1720, 820 - i * 22, 0.45, 'bife', { alpha: sk }); cap(ctx, 'carne sobrando em 2025', 1460, 820, { size: 26, alpha: sk }); }
        if (t > tMas) headline(ctx, 'cada vaca abatida = um bezerro a menos', 960, 800, { size: 44, k: appear(t, tMas + 0.2, 0.5), hl: 'rgba(127,29,29,0.95)' });
        ctx.restore();
      }
      // agora: bezerro recorde e a porteira fechando
      const nk = appear(t, tFalta, 0.6);
      if (nk > 0) {
        ctx.save(); ctx.globalAlpha *= nk;
        const gk = 1 - appear(t, tContr - 0.4, 0.5);
        if (gk > 0) {
          ctx.save(); ctx.globalAlpha *= gk;
          for (let i = 0; i < 4; i++) boi(ctx, 260 + i * 250, 640 + (i % 2) * 40, 0.42, { ghost: 1, female: i % 2 === 0, alpha: appear(t, tFalta + 0.2 + i * 0.15, 0.4) });
          headline(ctx, 'agora faltam animais', 700, 420, { size: 64, k: vis(t, tFalta, tRec - 0.1, 0.4, 0.4) });
          ctx.restore();
        }
        const bk = 1 - appear(t, tMenos - 0.3, 0.4);
        if (t > tRec - 0.1 && bk > 0) {
          ctx.save(); ctx.globalAlpha *= bk;
          cap(ctx, 'BEZERRO · POR CABEÇA · SET/2026', 1400, 190, { size: 26, letter: 2, alpha: appear(t, tRec - 0.1, 0.4) });
          flipBoard(ctx, 1400, 280, 60, 'R$ 3.446', t, tRec - 0.1, { color: P.au });
          { const ck = vis(t, tRec + 0.2, tContr - 0.2, 0.5, 0.4); if (ck > 0) { bezerro(ctx, 1400, 640, 0.8, { alpha: ck }); cap(ctx, 'o bezerro', 1400, 760, { size: 34, alpha: ck, color: '#fde68a' }); } }
          if (t > t3400) ovalStamp(ctx, 1400, 430, 160, 70, [['RECORDE', 0.05, 0.5]], '#ef4444', appear(t, t3400 + 0.2, 0.3), -0.08);
          ctx.restore();
        }
        for (let i = 0; i < 3; i++) boi(ctx, 330 + i * 230, 620 + (i % 2) * 30, 0.6, { female: true, tint: '#efe9dc', alpha: appear(t, tContr + i * 0.2, 0.4) });
        if (t > tSeg) { porteira(ctx, 1000, 760, 1.4, 1 - ease.out(prog(t, tSeg + 0.1, 0.6))); cap(ctx, 'as vacas ficam no pasto', 560, 795, { size: 36, color: '#ecfccb', alpha: appear(t, tSeg + 0.4, 0.4) }); }
        if (t > tMenos) { headline(ctx, 'menos vaca no abate', 1420, 300, { size: 54, k: appear(t, tMenos, 0.4) }); headline(ctx, 'menos carne hoje', 1420, 400, { size: 54, k: appear(t, tHoje, 0.4), color: '#fecaca', color2: '#ef4444' }); }
        ctx.restore();
      }
    },
    overlay(ctx, t) { overlaySrc(ctx, t < t2025 ? 'gestação e engorda: Embrapa e Cepea' : t < tFalta ? 'IBGE, abate de 2025' : 'Cepea, indicador do bezerro (MS, 30/9/2026)', vis(t, t9, 70)); },
  };
}

// ================================================================ Cena 06: o mundo disputa o mesmo boi
function scene06(K) {
  const tGente = K('e tem gente disputando'), tNorm = K('normalmente'), t70 = K('setenta por cento'), tDentro = K('ficam aqui dentro'), t2025 = K('em dois mil e vinte e cinco'), t61 = K('sessenta e um');
  const tEua = K('os estados unidos'), tNunca = K('do que nunca'), tDolar = K('e com o dolar alto'), tQuilo = K('cada quilo vendido'), tVale = K('vale mais reais');
  const tFrig = K('entao o frigorifico paga'), tFora = K('pode vender pra fora'), tPorIsso = K('por isso'), tChina = K('quando a china fechou'), tNao = K('a carne nao sobrou'), tJa = K('ja faltava boi');
  const mapK = (t) => 1 - appear(t, tFrig - 0.3, 0.6) * 0.75;
  const panK = (t) => 1 - appear(t, tFrig - 0.5, 0.5); // painéis somem por completo; só o mapa fica ao fundo
  const cam = [{ t: 0, x: 900, y: 500, z: 1.05 }, { t: tNorm - 0.2, x: 760, y: 590, z: 1.12, d: 1.2 }, { t: tEua - 0.2, x: 860, y: 520, z: 1.04, d: 1.2 }, { t: tFrig - 0.3, x: 960, y: 520, z: 1.0, d: 1.0 },
    { t: tChina - 0.2, x: 1000, y: 500, z: 1.04, d: 1.0 }, { t: tJa - 0.2, x: 960, y: 520, z: 1.08, d: 1.2 }];
  const sfx = [[tGente, 'whoosh', 0.5], ...Array.from({ length: 10 }, (_, i) => [tNorm + 0.3 + i * 0.1, 'tick', 0.4]), [t70, 'pop', 0.6], [t2025, 'clank', 0.5], [t61, 'stamp', 0.6], [tEua, 'horn', 0.6, { dur: 2 }],
    [tNunca, 'impact', 0.5], [tDolar, 'coin', 0.5], ...[0, 1, 2, 3].map((i) => [tQuilo + 0.3 + i * 0.2, 'coin', 0.3]), [tFrig, 'bell', 0.6], [tFora, 'clank', 0.4], [tChina, 'gate', 0.8], [tNao, 'drop', 0.5], [tJa, 'impact', 0.7]];
  return {
    accent: '#0ea5e9', cam, sfx, impacts: [tJa], trans: 'cleaver',
    draw(ctx, t) {
      const mk = mapK(t);
      ctx.save(); ctx.globalAlpha *= mk;
      mapa(ctx, t, { br: 1 });
      ctx.save(); ctx.globalAlpha *= panK(t) / Math.max(mk, 0.001) * mk;
      if (t > tGente) headline(ctx, 'tem gente disputando esse boi', 960, 250, { size: 60, k: vis(t, tGente, tNorm - 0.1, 0.4, 0.4) });
      // 100 caixas de carne do Brasil
      const gk = appear(t, tNorm, 0.5);
      if (gk > 0) {
        const nFora = t < t61 ? 30 : Math.round(counting(t, t61, 0.8, 30, 39));
        fillRR(ctx, 140, 360, 420, 470, 22, 'rgba(5,7,13,0.82)'); strokeRR(ctx, 140, 360, 420, 470, 22, '#334155', 3);
        cap(ctx, t > t2025 ? 'em 2025, de 100 caixas' : 'de 100 caixas de carne', 350, 396, { size: 28, color: t > t2025 ? '#fde68a' : '#e2e8f0' });
        for (let i = 0; i < 100; i++) {
          const k = clamp((t - tNorm - 0.3 - Math.floor(i / 10) * 0.1) / 0.2); if (k <= 0) continue;
          const out = i >= 100 - nFora;
          caixaCarne(ctx, 190 + (i % 10) * 36, 440 + Math.floor(i / 10) * 30, 0.8, k, out ? '#0ea5e9' : '#84cc16');
        }
        text(ctx, `${100 - nFora} ficam aqui`, 240, 770, { size: 30, weight: 900, color: '#d9f99d', align: 'left', alpha: appear(t, t70, 0.4) });
        text(ctx, `${nFora} vão pra fora`, 240, 806, { size: 26, weight: 800, color: '#7dd3fc', align: 'left', alpha: appear(t, t70, 0.4) });
      }
      // EUA: recorde
      const ek = appear(t, tEua, 1.0);
      rota(ctx, PORT.santos, PORT.eua, VIA.eua, ek, '#38bdf8', 9);
      if (ek > 0.6) {
        for (let i = 0; i < 3; i++) { const u = (t * 0.07 + i / 3) % 1; const [sx, sy] = rotaPt(PORT.santos, PORT.eua, VIA.eua, u); navio(ctx, sx, sy - 6, 0.17, { seed: i + 7, rows: 3 }); }
        const k = appear(t, tEua + 0.6, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        fillRR(ctx, 760, 210, 470, 170, 20, 'rgba(5,7,13,0.85)'); strokeRR(ctx, 760, 210, 470, 170, 20, '#38bdf8', 3);
        text(ctx, 'ESTADOS UNIDOS · 2026', 995, 244, { size: 22, weight: 900, color: '#bae6fd', letter: 2 });
        headline(ctx, '317 mil t', 995, 300, { size: 58, k: 1, noPop: true, color: '#ffffff', color2: '#7dd3fc' });
        if (t > tNunca) text(ctx, '+45% · recorde (até set)', 995, 352, { size: 26, weight: 900, color: '#fde68a', alpha: appear(t, tNunca, 0.4) });
        ctx.restore();
      }
      // dólar alto: cada quilo lá fora vale mais reais
      if (t > tDolar) {
        const k = vis(t, tDolar, tFrig - 0.2, 0.4, 0.4);
        ctx.save(); ctx.globalAlpha *= k;
        etiqueta(ctx, 1450, 540, 0.9, { t: 'DÓLAR ALTO', rows: [['1 kg lá fora', 'mais R$'], ['frigorífico', 'paga mais']], h: 260, code: 61 }, { rot: 0.04 });
        for (let i = 0; i < 4; i++) { const kk = appear(t, tQuilo + 0.3 + i * 0.2, 0.3, ease.back); if (kk > 0) { ctx.save(); ctx.translate(1240 + i * 70, 760); ctx.scale(kk, kk); circle(ctx, 0, 0, 26, '#facc15'); text(ctx, 'R$', 0, 2, { size: 20, weight: 900, color: '#78350f' }); ctx.restore(); } }
        ctx.restore();
      }
      ctx.restore();
      ctx.restore();
      // cabo de guerra pelo mesmo boi
      const tk = appear(t, tFrig - 0.2, 0.6);
      if (tk > 0) {
        ctx.save(); ctx.globalAlpha *= tk;
        // vai e volta; quando o frigorífico sabe que vende lá fora, o boi é puxado pro contêiner
        const dx = 90 * ease.inOut(prog(t, tFora, 1.0));
        const pull = Math.sin(t * 3.2) * 10 * (1 - 0.6 * prog(t, tFora, 1.0));
        ctx.strokeStyle = '#d6b07a'; ctx.lineWidth = 10; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(540 + pull + dx, 560); ctx.lineTo(820 + dx, 540); ctx.stroke(); ctx.beginPath(); ctx.moveTo(1100 + dx, 540); ctx.lineTo(1330 + pull, 560); ctx.stroke();
        boi(ctx, 960 + dx, 520, 0.62);
        // carrinho de mercado (Brasil) e contêiner (exportação)
        ctx.save(); ctx.translate(430 + pull + dx, 580); ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 8; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(-110, -70); ctx.lineTo(-80, -70); ctx.lineTo(-50, 30); ctx.lineTo(80, 30); ctx.lineTo(100, -40); ctx.lineTo(-66, -40); ctx.stroke(); circle(ctx, -36, 56, 14, '#e2e8f0'); circle(ctx, 66, 56, 14, '#e2e8f0'); ctx.restore();
        conteiner(ctx, 1420 + pull, 570, 1.0, '#0ea5e9', { label: 'US$' });
        cap(ctx, 'mercado daqui', 430 + dx, 680, { size: 30 }); cap(ctx, 'exportação', 1420, 680, { size: 30 });
        etiqueta(ctx, 960, 250, 0.78, { t: 'BOI GORDO', rows: [['ARROBA', 'R$ 392,70']], h: 200, code: 62 }, { rot: Math.sin(t * 2) * 0.03 });
        if (t > tChina) {
          const k = ease.out(prog(t, tChina, 0.5));
          ctx.save(); ctx.translate(1690, 520); fillRR(ctx, -16, -170, 32, 340, 6, '#475569'); ctx.rotate(lerp(-1.4, 0, k)); fillRR(ctx, -150, -14, 150, 28, 6, '#ef4444'); for (let i = 0; i < 4; i++) ctx.fillStyle = '#fff', ctx.fillRect(-140 + i * 36, -14, 18, 28); ctx.restore();
          cap(ctx, 'China: taxa de 67%', 1580, 335, { size: 30, alpha: k, color: '#fca5a5' });
        }
        if (t > tNao) cap(ctx, 'a carne não sobrou', 960 + dx, 690, { size: 36, alpha: appear(t, tNao, 0.4) });
        if (t > tJa) headline(ctx, 'JÁ FALTAVA BOI', 960 + dx, 770, { size: 64, k: appear(t, tJa, 0.4), color: '#fef08a', color2: P.au, hl: 'rgba(127,29,29,0.95)' });
        ctx.restore();
      }
    },
    overlay(ctx, t) { overlaySrc(ctx, t < tEua ? 'Rabobank, via Portal do Agronegócio (2025)' : 'Abiec, via CNN (out/2026)', vis(t, tNorm, tFrig)); },
  };
}

// ================================================================ Cena 07: o seu prato
function mesa(ctx) { // tampo de madeira visto de cima
  const g = ctx.createLinearGradient(-300, 0, 2220, 0); g.addColorStop(0, '#3b2614'); g.addColorStop(0.5, '#4a3019'); g.addColorStop(1, '#2f1e10');
  ctx.fillStyle = g; ctx.fillRect(-300, -200, 2520, 1500);
  const r = rng(13); ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 2;
  for (let i = 0; i < 70; i++) { const y = -200 + i * 22 + r() * 8; ctx.beginPath(); ctx.moveTo(-300, y); ctx.bezierCurveTo(400, y + r() * 20 - 10, 1300, y + r() * 20 - 10, 2220, y); ctx.stroke(); }
  for (let y = -200; y < 1300; y += 260) { ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(-300, y, 2520, 4); }
  ctx.fillStyle = 'rgba(15,23,42,0.45)'; ctx.fillRect(-300, -200, 2520, 1500);
}
function scene07(K) {
  const tFim = K('no fim'), tAj = K('quem se ajusta'), tEste = K('este ano'), t34 = K('trinta e quatro'), tPass = K('no ano passado'), t36 = K('trinta e seis');
  const tPic = K('trocou a picanha'), tAcem = K('pelo acem'), tFr = K('pelo frango'), tCorre = K('corre pro corte'), tDisp = K('fica disputado'), t2023 = K('desde dois mil e vinte e tres'), tPat = K('o patinho subiu'), t25 = K('vinte e cinco por cento'), tPic2 = K('a picanha sete'), t7 = K('a picanha sete', 0.94);
  const plateKind = (t) => (t < tAcem ? 'picanha' : t < tFr ? 'acem' : 'frango');
  const cam = [{ t: 0, x: 960, y: 500, z: 1.1 }, { t: tEste, x: 960, y: 500, z: 1.0, d: 1.2 }, { t: tPic - 0.2, x: 1100, y: 540, z: 1.04, d: 1.0 }, { t: t2023 - 0.3, x: 1150, y: 500, z: 1.06, d: 1.0 }];
  const sfx = [[tFim, 'paper', 0.4], [tEste, 'tick', 0.6], [t34 - 0.1, 'flip', 0.8, { dur: 0.8 }], [t34 + 0.3, 'knife', 0.5], [t36, 'pop', 0.5], [tPic, 'paper', 0.5, { dur: 0.3 }], [tAcem, 'paper', 0.5, { dur: 0.3 }], [tFr, 'paper', 0.5, { dur: 0.3 }],
    ...[0, 1, 2, 3, 4, 5].map((i) => [tCorre + 0.2 + i * 0.1, 'click', 0.4]), [tDisp, 'buzz', 0.3], [t2023, 'chalk', 0.6, { dur: 0.9 }], [tPat, 'chalk', 0.7, { dur: 1.0 }], [tPic2, 'chalk', 0.6, { dur: 0.5 }], [t7, 'pop', 0.6]];
  return {
    accent: '#fb923c', cam, sfx, impacts: [t34], trans: 'flip',
    draw(ctx, t) {
      mesa(ctx);
      const shrink = t < t34 ? 1 : lerp(1, 0.86, ease.inOut(prog(t, t34 + 0.3, 1.0)));
      const pk = 1 - appear(t, t2023 - 0.4, 0.6) * 0.0;
      ctx.save(); ctx.globalAlpha *= pk; prato(ctx, 640, 500, 250, shrink, plateKind(t)); ctx.restore();
      if (t > tAj) headline(ctx, 'quem se ajusta é você', 640, 160, { size: 52, k: vis(t, tAj, tPic, 0.4, 0.4) });
      // consumo por pessoa
      const ck = vis(t, tEste, tPic - 0.1, 0.5, 0.4);
      if (ck > 0) {
        ctx.save(); ctx.globalAlpha *= ck;
        cap(ctx, 'CARNE BOVINA POR PESSOA NO ANO', 1420, 300, { size: 28, letter: 2 });
        if (t > t34 - 0.1) flipBoard(ctx, 1420, 400, 70, '33,8 KG', t, t34 - 0.1, { color: '#fde68a' });
        cap(ctx, '2026', 1420, 500, { size: 30, alpha: appear(t, t34 + 0.4, 0.4), color: '#fde68a' });
        if (t > tPass) { headline(ctx, '2025: 36,1 kg', 1420, 610, { size: 46, k: appear(t, t36, 0.4), color: '#cbd5e1' }); cap(ctx, '−6,6%', 1420, 680, { size: 36, alpha: appear(t, t36 + 0.5, 0.4), color: '#fca5a5' }); }
        ctx.restore();
      }
      // a troca: picanha → acém → frango
      const tk = vis(t, tPic - 0.1, t2023 - 0.3, 0.5, 0.5);
      if (tk > 0) {
        ctx.save(); ctx.globalAlpha *= tk;
        const trays = [['picanha', 'PICANHA', '78,57', tPic], ['acem', 'ACÉM', '37,98', tAcem], ['frango', 'COXA DE FRANGO', '15,00', tFr]];
        trays.forEach(([kind, nome, preco, at], i) => {
          const k = appear(t, at, 0.4); if (k <= 0) return;
          const x = 1170 + i * 290, y = 520;
          bandeja(ctx, x, y, 0.78, kind, { alpha: k * (i === 0 && t > tAcem ? 0.45 : 1) });
          etiqueta(ctx, x, y + 165, 0.62, { t: nome, tSize: nome.length > 10 ? 26 : 34, rows: [['R$/kg', preco]], h: 210, code: 70 + i }, { alpha: k, rot: (i - 1) * 0.04 });
          if (i > 0) { ctx.save(); ctx.globalAlpha *= k; ctx.strokeStyle = '#fde68a'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - 200, y - 130); ctx.quadraticCurveTo(x - 145, y - 170, x - 90, y - 130); ctx.lineTo(x - 108, y - 150); ctx.moveTo(x - 90, y - 130); ctx.lineTo(x - 116, y - 126); ctx.stroke(); ctx.restore(); }
        });
        // todo mundo corre pro mesmo corte
        if (t > tCorre) {
          for (let i = 0; i < 6; i++) { const k = ease.out(prog(t, tCorre + 0.2 + i * 0.1, 0.4)), a = lerp(-2.55, -0.59, i / 5); const tx = 1460 + Math.cos(a) * lerp(380, 115, k), ty = 520 + Math.sin(a) * lerp(380, 120, k); dedo(ctx, tx, ty, a + Math.PI, 0.3); }
          if (t > tDisp) ovalStamp(ctx, 1460, 700, 150, 54, [['DISPUTADO', 0.05, 0.5]], '#dc2626', appear(t, tDisp, 0.3), -0.1);
        }
        ctx.restore();
      }
      // lousa: patinho +25%, picanha +7%
      const lk = appear(t, t2023 - 0.3, 0.6);
      if (lk > 0) {
        ctx.save(); ctx.globalAlpha *= lk;
        lousa(ctx, 1080, 230, 760, 560);
        chalk(ctx, 'quanto subiu desde 2023', 1120, 300, { size: 40, r: prog(t, t2023, 1.0) });
        chalkLine(ctx, 1120, 334, 1720, 330, prog(t, t2023 + 1.0, 0.4));
        const bar = (y, w, r, col) => { if (r <= 0) return; ctx.save(); ctx.fillStyle = col; ctx.globalAlpha *= 0.85; ctx.beginPath(); ctx.rect(1320, y - 32, w * r, 64); ctx.fill(); ctx.strokeStyle = P.chalk; ctx.lineWidth = 4; ctx.strokeRect(1320, y - 32, w * r, 64); ctx.restore(); };
        chalk(ctx, 'patinho', 1120, 460, { size: 46, r: prog(t, tPat, 0.5) });
        bar(460, 330, ease.out(prog(t, t25 - 0.3, 0.9)), 'rgba(248,113,113,0.55)');
        if (t > t25) chalk(ctx, '+25%', 1670, 460, { size: 52, weight: 900, color: '#fecaca', r: prog(t, t25 + 0.4, 0.4) });
        chalk(ctx, 'picanha', 1120, 640, { size: 46, r: prog(t, tPic2, 0.5) });
        bar(640, 92, ease.out(prog(t, t7 - 0.2, 0.5)), 'rgba(253,230,138,0.5)');
        if (t > t7) chalk(ctx, '+7%', 1440, 640, { size: 52, weight: 900, color: '#fef08a', r: prog(t, t7, 0.3) });
        ctx.restore();
      }
    },
    overlay(ctx, t) { overlaySrc(ctx, t < t2023 ? 'Conab, via R7 (2026) · Mercado Mineiro e Itatiaia (BH)' : 'IPCA/IBGE, jan/2023 a set/2026, via O Globo', vis(t, tEste, 40)); },
  };
}

// ================================================================ Cena 08: o que esperar e o que está na sua mão
function scene08(K) {
  const tDa = K('e da pra esperar'), tTres = K('tem tres coisas'), tP1 = K('a primeira'), tMil = K('nao espera milagre'), tRef = K('a reforma tributaria'), tFed = K('mas o imposto federal'), tJa = K('ja era zero');
  const tIcms = K('e o icms so comeca'), t2029 = K('dois mil e vinte e nove'), tP2 = K('a segunda'), tRel = K('o relogio da vaca'), tAcel = K('nao acelera'), tConab = K('a conab preve'), tBez = K('porque os bezerros');
  const tP3 = K('a terceira'), tBH = K('em belo horizonte'), t76 = K('setenta e seis'), tComp = K('comparar o mesmo corte');
  const which = (t) => (t < tP2 - 0.2 ? 0 : t < tP3 - 0.2 ? 1 : 2);
  const cam = [{ t: 0, x: 960, y: 480, z: 1.08 }, { t: tTres, x: 960, y: 500, z: 1.0, d: 1.0 }, { t: tP1 + 0.3, x: 760, y: 565, z: 1.1, d: 1.4 }, { t: tFed - 0.4, x: 960, y: 560, z: 1.06, d: 1.0 }, { t: tP2 - 0.2, x: 960, y: 560, z: 1.06, d: 1.0 }, { t: tP3 - 0.2, x: 960, y: 560, z: 1.06, d: 1.0 }, { t: tComp, x: 960, y: 540, z: 1.12, d: 1.6 }];
  const sfx = [[tDa, 'pop', 0.4], [tTres, 'rail', 0.6], [tP1, 'clank', 0.5], [tP1 + 0.2, 'paper', 0.4], [tRef, 'stamp', 0.9], [tFed, 'pop', 0.5], [tJa, 'buzz', 0.3], [tIcms, 'tick', 0.6], [t2029, 'pop', 0.5],
    [tP2, 'clank', 0.5], [tRel, 'clock', 0.7, { n: 6, step: 0.6 }], [tConab, 'drop', 0.5], [tP3, 'clank', 0.5], [tBH, 'beep', 0.5, { n: 2 }], [t76, 'beep', 0.6], [tComp, 'ding', 0.7]];
  const RY = 190;
  const cards = [['1', 'IMPOSTO ZERO EM 2027?', tP1], ['2', 'O RELÓGIO DA VACA', tP2], ['3', 'COMPARE NO BALCÃO', tP3]];
  return {
    accent: '#38bdf8', cam, sfx, impacts: [tRef], trans: 'cold',
    draw(ctx, t) {
      azulejos(ctx, -300, -200, 2520, 1500);
      if (t < tP1) headline(ctx, 'dá pra esperar a carne baixar?', 960, 500, { size: 66, k: vis(t, tDa, tP1, 0.4, 0.4) });
      // etiquetas penduradas no trilho
      trilho(ctx, -300, 2300, RY, 26);
      const w = which(t);
      cards.forEach(([n, lab, at], i) => {
        const k = appear(t, tTres + 0.2 + i * 0.2, 0.5); if (k <= 0) return;
        const act = t > at - 0.2 && w === i, x = 400 + i * 560, sw = Math.sin(t * 2 + i) * 0.03 * (act ? 0.3 : 1);
        ctx.save(); ctx.translate(x, RY); ctx.rotate(sw); ctx.globalAlpha *= k * (t > at - 0.2 && !act ? 0.45 : 1);
        gancho(ctx, 0, 0, 70);
        const s = act ? 1.0 : 0.85;
        ctx.scale(s, s);
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 10; fillRR(ctx, -230, 70, 460, 120, 12, act ? '#fefce8' : '#e5e7eb'); ctx.restore();
        circle(ctx, -190, 130, 34, act ? '#b91c1c' : '#64748b'); text(ctx, n, -190, 132, { size: 40, weight: 900, color: '#fff' });
        if (t > at) text(ctx, lab, 30, 132, { size: lab.length > 20 ? 23 : 28, weight: 900, color: P.ink, alpha: appear(t, at, 0.3) });
        ctx.restore();
      });
      // 1: imposto zero
      const k1 = vis(t, tP1 + 0.2, tP2 - 0.2, 0.5, 0.4);
      if (k1 > 0) {
        ctx.save(); ctx.globalAlpha *= k1;
        const shake = t > tRef && t < tRef + 0.4 ? Math.sin(t * 80) * 4 : 0;
        bandeja(ctx, 500 + shake, 605, 1.35, 'bife', { label: { t: 'CONTRAFILÉ', rows: [['R$/kg', '50,00']], h: 210, code: 81 }, lx: 86, ly: 46, ls: 0.5 });
        if (t > tRef) ovalStamp(ctx, 470, 475, 200, 84, [['CESTA BÁSICA', -0.5, 0.2], ['IBS/CBS 0%', 0.06, 0.38], ['2027', 0.52, 0.2]], '#15803d', appear(t, tRef, 0.3), -0.1);
        if (t > tRef + 1.0) cap(ctx, 'o preço da etiqueta não muda', 500, 815, { size: 30, alpha: appear(t, tRef + 1.0, 0.4), color: '#fde68a' });
        if (t > tFed) { headline(ctx, 'federal: já era zero', 1350, 400, { size: 48, k: appear(t, tFed, 0.4) }); cap(ctx, 'PIS/Cofins zerados desde 2013', 1350, 460, { size: 28, alpha: appear(t, tJa, 0.4) }); }
        if (t > tIcms) {
          const tl = ease.out(prog(t, tIcms, 1.2));
          ctx.save(); ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(1000, 650); ctx.lineTo(1000 + 700 * tl, 650); ctx.stroke(); ctx.restore();
          [[1060, '2027', 'IBS/CBS zero', '#4ade80'], [1350, '2029', 'ICMS começa a cair', P.icms], [1640, '2033', 'ICMS acaba', '#94a3b8']].forEach(([x, y, lab, col], i) => {
            const k = appear(t, i === 1 ? t2029 : tIcms + i * 0.4, 0.3); if (k <= 0) return;
            circle(ctx, x, 650, 16, col, k); text(ctx, y, x, 610, { size: 30, weight: 900, color: '#ffffff', alpha: k }); text(ctx, lab, x, 700, { size: 23, weight: 800, color: col, alpha: k });
          });
        }
        ctx.restore();
      }
      // 2: o relógio da vaca não acelera
      const k2 = vis(t, tP2 + 0.2, tP3 - 0.2, 0.5, 0.4);
      if (k2 > 0) {
        ctx.save(); ctx.globalAlpha *= k2;
        relogio(ctx, 520, 610, 200, (t - tP2) * 0.5, { label: 'anos' });
        for (let i = 0; i < 3; i++) { const x = 1000 + ((t - tP2) * 22 + i * 230) % 760; boi(ctx, x, 640 + (i % 2) * 20, 0.34, { female: true, tint: '#efe9dc' }); }
        if (t > tAcel) headline(ctx, 'não acelera', 1380, 420, { size: 56, k: appear(t, tAcel, 0.4) });
        if (t > tConab) { cap(ctx, 'Conab: ainda menos carne em 2027', 1380, 790, { size: 32, alpha: appear(t, tConab, 0.4), color: '#fde68a' }); }
        if (t > tBez) cap(ctx, 'os bezerros de agora só viram boi em uns 2 anos', 1380, 840, { size: 26, alpha: appear(t, tBez, 0.4) });
        ctx.restore();
      }
      // 3: o mesmo patinho de R$ 30 a R$ 76
      const k3 = appear(t, tP3 + 0.2, 0.5);
      if (k3 > 0) {
        ctx.save(); ctx.globalAlpha *= k3;
        if (t > tBH) cap(ctx, 'BELO HORIZONTE · MESMO LEVANTAMENTO', 960, 410, { size: 28, letter: 2, alpha: appear(t, tBH, 0.4) });
        const l = appear(t, tP3 + 0.4, 0.5), r = appear(t, t76, 0.4);
        bandeja(ctx, 520, 580, 1.35, 'patinho', { alpha: l, label: { t: 'PATINHO', rows: [['R$/kg', '29,98']], h: 210, code: 91 }, lx: 80, ly: 44, ls: 0.5 });
        // outro mercado, ainda sem preço: um lugar vazio no balcão
        const ph = vis(t, tBH + 0.6, t76 + 0.2, 0.5, 0.3);
        if (ph > 0) { ctx.save(); ctx.globalAlpha *= ph * 0.8; ctx.setLineDash([18, 14]); strokeRR(ctx, 1140, 440, 520, 280, 28, '#94a3b8', 5); ctx.restore(); text(ctx, '?', 1400, 580, { size: 120, weight: 900, color: '#94a3b8', alpha: ph * 0.8 }); }
        bandeja(ctx, 1400, 580, 1.35, 'patinho', { alpha: r, label: { t: 'PATINHO', rows: [['R$/kg', '76,00']], h: 210, code: 92 }, lx: 80, ly: 44, ls: 0.5 });
        if (t > t76) { headline(ctx, '+153%', 960, 580, { size: 70, k: appear(t, t76 + 0.3, 0.4), color: '#fecaca', color2: '#ef4444' }); }
        if (t > tComp) headline(ctx, 'compare o mesmo corte', 960, 780, { size: 52, k: appear(t, tComp, 0.5), color: '#ecfccb', color2: P.pasto, hl: 'rgba(20,83,45,0.95)' });
        ctx.restore();
      }
    },
    overlay(ctx, t) { overlaySrc(ctx, t < tP2 ? 'EC 132 e LC 214 (reforma tributária) · Lei 12.839/2013' : t < tP3 ? 'Conab (set/2026)' : 'Itatiaia (pesquisa em BH, abr/2026)', vis(t, tP1 + 0.5, 60)); },
  };
}

// ================================================================ Cena 09: fechamento, inscrição na balança e o próximo vídeo
function scene09(K) {
  const tProx = K('da proxima vez'), tEtiq = K('etiqueta da carne'), tLem = K('lembra'), tMaior = K('a maior parte desse dinheiro'), tCriar = K('pra criar o proximo boi');
  const tQue = K('o que deixou'), tImp = K('nao foi o imposto'), tChina = K('nem a china'), tFalta = K('foi a falta de boi'), tMundo = K('e o mundo querendo');
  const tAj = K('se esse video'), tInsc = K('se inscreve'), tNo = K('no proximo'), tCerv = K('preco da cerveja'), tChur = K('acompanha esse churrasco'), tNovo = K('imposto novo'), tCada = K('cada real'), tAte = K('ate la');
  const S = { x: 860, y: 480, s: 0.82 }, slot = slotOf(S.x, S.y, S.s);
  const tPress = tInsc + 0.15, tPrint = tPress + 0.2, tSw = tNo + 0.5;
  const LBL = { t: 'CARNE BOVINA', rows: [['PESO (kg)', '1,000'], ['R$/kg', '50,00']], total: ['TOTAL R$', '50,00'], h: 300, code: 99 };
  const INS = { t: 'INSCRITO', tSize: 44, rows: [['PESO', '1 clique'], ['PREÇO', 'R$ 0,00'], ['VALIDADE', 'pra sempre']], total: ['TOTAL', 'R$ 0,00'], h: 400, code: 100, date: 'HOJE' };
  const cam = [{ t: 0, x: 960, y: 520, z: 1.0 }, { t: tEtiq, x: 1040, y: 525, z: 1.06, d: 1.0 }, { t: tQue - 0.2, x: 960, y: 500, z: 1.0, d: 1.0 },
    { t: tAj, x: 1000, y: 620, z: 1.25, d: 1.4 }, { t: tPrint + 0.6, x: 1100, y: 545, z: 1.12, d: 1.0 }, { t: tSw, x: 960, y: 500, z: 1.0, d: 1.0 }, { t: tAte, x: 960, y: 510, z: 1.04, d: 2.5 }];
  const sfx = [[0.1, 'beep', 0.5], [tEtiq, 'printer', 0.8, { dur: 0.9 }], [tLem, 'paper', 0.5], [tMaior, 'pop', 0.6], [tCriar, 'moo', 0.4], [tImp, 'stamp', 0.7], [tChina, 'stamp', 0.7], [tFalta, 'impact', 0.6], [tMundo, 'horn', 0.4, { dur: 1.2 }],
    [tAj, 'beep', 0.6, { n: 3 }], [tPress, 'click', 1.1], [tPress + 0.02, 'beep', 0.7], [tPrint, 'printer', 1, { dur: 0.9 }], [tPrint + 1.0, 'paper', 0.6], [tPrint + 1.35, 'stamp', 1.2], [tPrint + 1.55, 'ding', 0.6],
    [tSw, 'whoosh', 0.5], [tCerv, 'chalk', 0.7, { dur: 1.4 }], [tChur, 'ice', 0.6, { dur: 1.0 }], [tNovo, 'stamp', 0.6], [tCada, 'chalk', 0.6, { dur: 1 }], [tAte, 'canopen', 0.9]];
  return {
    accent: P.pasto, cam, sfx, impacts: [tFalta, tPrint + 1.35], trans: 'clock',
    draw(ctx, t) {
      azulejos(ctx, -300, -200, 2520, 1500);
      const scK = 1 - appear(t, tSw, 0.6);
      if (scK > 0) {
        ctx.save(); ctx.globalAlpha *= scK;
        const subs = t > tAj - 0.1;
        const st = subs ? { peso: '0,000', preco: '0,00', total: '0,00', keyB: true, press: vis(t, tPress - 0.05, tPress + 0.25, 0.08, 0.15) } : { peso: '1,000', preco: '50,00', total: '50,00' };
        balanca(ctx, S.x, S.y, S.s, st);
        if (!subs || t < tAj + 0.4) bandeja(ctx, S.x - 40, S.y - 110, 0.9, 'picanha', { alpha: 1 - appear(t, tAj, 0.4) });
        // etiqueta da carne: imprime e cola na bandeja
        if (!subs) {
          const pk = prog(t, tEtiq, 0.9), fly = ease.inOut(prog(t, tEtiq + 1.1, 0.7));
          if (pk > 0 && fly <= 0) etiquetaImprimindo(ctx, slot, 0.62, LBL, pk);
          if (fly > 0) etiqueta(ctx, lerp(slot.x, S.x + 40, fly), lerp(slot.y - 93, S.y - 80, fly), lerp(0.62, 0.5, fly), LBL, { rot: lerp(0, -0.06, fly) });
          if (t > tMaior) {
            const k = appear(t, tMaior, 0.5);
            ctx.save(); ctx.translate(S.x + 40, S.y + 10); ctx.rotate(-0.06); ctx.globalAlpha *= k;
            fillRR(ctx, -190, -34, 380, 68, 12, '#15803d'); text(ctx, '68% volta pro pasto', 0, 2, { size: 32, weight: 900, color: '#ffffff' }); ctx.restore();
          }
          if (t > tCriar) { bezerro(ctx, 370, 700, 0.7, { alpha: appear(t, tCriar, 0.5) }); cap(ctx, 'o próximo boi', 370, 800, { size: 28, alpha: appear(t, tCriar + 0.3, 0.4) }); }
          // o que não foi / o que foi
          if (t > tQue) {
            const xk = (at) => appear(t, at, 0.3);
            [['o imposto', tImp, 1500, 200], ['a China', tChina, 1500, 300]].forEach(([lab, at, x, y]) => {
              const k = appear(t, at - 0.3, 0.4); if (k <= 0) return;
              cap(ctx, lab, x, y, { size: 44, alpha: k, color: '#cbd5e1' });
              if (xk(at) > 0) { ctx.save(); ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - 130, y + 4); ctx.lineTo(x - 130 + 260 * xk(at), y - 4); ctx.stroke(); ctx.restore(); }
            });
            if (t > tFalta) headline(ctx, 'falta de boi', 1500, 420, { size: 64, k: appear(t, tFalta, 0.4), color: '#fef08a', color2: P.au, hl: 'rgba(127,29,29,0.95)' });
            if (t > tMundo) cap(ctx, '+ o mundo querendo a mesma carne', 1500, 510, { size: 30, alpha: appear(t, tMundo, 0.4) });
          }
        }
        // inscrição: o dedo aperta o "B" e a balança imprime "INSCRITO"
        if (subs) {
          const key = { x: S.x + (-376 + 11 * 64 + 28) * S.s, y: S.y + (356 + 38) * S.s };
          const fk = vis(t, tAj + 0.3, tPress + 0.7, 0.4, 0.4);
          if (fk > 0) { const d = t < tPress ? lerp(160, 0, ease.out(prog(t, tAj + 0.3, tPress - tAj - 0.3))) : lerp(0, 160, ease.in(prog(t, tPress + 0.15, 0.5))); ctx.save(); ctx.globalAlpha *= fk; dedo(ctx, key.x + 4 + d * 0.7, key.y + 4 + d * 0.7, -2.4, 0.5); ctx.restore(); }
          if (t > tPress - 0.05 && t < tPress + 0.3) shockRing(ctx, t, tPress, key.x, key.y, '#facc15', 20, 160);
          const pk = prog(t, tPrint, 0.9), fly = ease.inOut(prog(t, tPrint + 0.95, 0.5));
          if (pk > 0 && fly <= 0) etiquetaImprimindo(ctx, slot, 0.62, INS, pk);
          if (fly > 0) {
            const x = lerp(slot.x, 1500, fly), y = lerp(slot.y - 124, 360, fly), s = lerp(0.62, 1.0, fly);
            etiqueta(ctx, x, y, s, INS, { rot: lerp(0, 0.04, fly) });
            if (t > tPrint + 1.35) { ovalStamp(ctx, x - 20, y + 30, 190, 80, [['BEM-VINDO', 0.05, 0.42]], P.sif, appear(t, tPrint + 1.35, 0.25), -0.16); sparks(ctx, t, tPrint + 1.35, x + 40, y + 40, '#c4b5fd', 22); }
          }
        }
        ctx.restore();
      }
      // próximo vídeo: a cerveja do churrasco, desenhada a giz
      const nk = appear(t, tSw, 0.6);
      if (nk > 0) {
        ctx.save(); ctx.globalAlpha *= nk;
        lousa(ctx, 300, 170, 1320, 640);
        chalk(ctx, 'PRÓXIMO VÍDEO', 360, 240, { size: 40, letter: 4, r: prog(t, tSw + 0.2, 0.7), color: '#fde68a' });
        const dk = prog(t, tCerv - 0.2, 1.6), col = appear(t, tChur, 1.0);
        // caixa de isopor com gelo e a lata
        ctx.save(); ctx.translate(560, 560);
        ctx.strokeStyle = P.chalk; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        const path = (k) => { ctx.beginPath(); ctx.moveTo(-180, -40); ctx.lineTo(-180 + 360 * clamp(k * 4), -40); if (k > 0.25) { ctx.moveTo(-180, -40); ctx.lineTo(-160, -40 + 200 * clamp((k - 0.25) * 4)); } if (k > 0.5) { ctx.moveTo(-160, 160); ctx.lineTo(-160 + 320 * clamp((k - 0.5) * 4), 160); } if (k > 0.75) { ctx.moveTo(180, -40); ctx.lineTo(160, -40 + 200 * clamp((k - 0.75) * 4)); } ctx.stroke(); };
        if (col > 0) { ctx.save(); ctx.globalAlpha *= col * 0.9; ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.moveTo(-180, -40); ctx.lineTo(180, -40); ctx.lineTo(160, 160); ctx.lineTo(-160, 160); ctx.closePath(); ctx.fill(); ctx.restore(); }
        // lata
        if (dk > 0.3) {
          const ck = clamp((dk - 0.3) / 0.7), open = t > tAte ? prog(t, tAte, 0.4) : 0;
          ctx.save(); ctx.translate(0, -60 - 12 * open); ctx.rotate(-0.12);
          if (col > 0) { const lg = ctx.createLinearGradient(-60, 0, 60, 0); lg.addColorStop(0, '#b45309'); lg.addColorStop(0.4, '#fbbf24'); lg.addColorStop(1, '#92400e'); ctx.save(); ctx.globalAlpha *= col; ctx.fillStyle = lg; rr(ctx, -56, -150, 112, 220, 16); ctx.fill(); ctx.fillStyle = '#e5e7eb'; rr(ctx, -50, -166, 100, 22, 8); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(-38, -130, 10, 180); ctx.restore(); }
          ctx.save(); ctx.globalAlpha *= ck; ctx.strokeStyle = P.chalk; ctx.lineWidth = 6; rr(ctx, -56, -150, 112, 220, 16); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-50, -150); ctx.lineTo(-44, -166); ctx.lineTo(44, -166); ctx.lineTo(50, -150); ctx.stroke(); ctx.restore();
          // gotas de suor da lata
          if (col > 0) for (let i = 0; i < 6; i++) { ctx.save(); ctx.globalAlpha *= col * 0.8; ctx.fillStyle = '#e0f2fe'; ctx.beginPath(); ctx.ellipse(-30 + (i * 23) % 70, -100 + ((i * 37 + t * 20) % 150), 3, 6, 0, 0, 6.283); ctx.fill(); ctx.restore(); }
          if (open > 0) for (let i = 0; i < 14; i++) { const a = -Math.PI / 2 + (i - 7) * 0.12, d = 30 + 90 * open; ctx.save(); ctx.globalAlpha *= (1 - open) * 0.9; circle(ctx, Math.cos(a) * d, -170 + Math.sin(a) * d, 4, '#fef9c3'); ctx.restore(); }
          ctx.restore();
        }
        path(dk);
        // gelo
        if (col > 0) for (let i = 0; i < 7; i++) { ctx.save(); ctx.globalAlpha *= col; ctx.translate(-130 + i * 44, -44 + Math.sin(i * 2.1) * 6); ctx.rotate(i * 0.5); fillRR(ctx, -16, -14, 32, 28, 6, 'rgba(186,230,253,0.9)'); ctx.restore(); }
        ctx.restore();
        if (t > tCerv) chalk(ctx, 'o preço da cerveja', 860, 400, { size: 70, weight: 900, r: prog(t, tCerv, 1.2) });
        if (t > tChur) chalk(ctx, 'que acompanha o churrasco', 860, 490, { size: 40, r: prog(t, tChur, 1.0), color: '#e2e8f0' });
        if (t > tNovo) { ovalStamp(ctx, 1290, 610, 230, 74, [['', -0.5, 0.2], ['IMPOSTO NOVO EM 2027', 0.06, 0.3], ['', 0.5, 0.2]], '#f87171', appear(t, tNovo, 0.3), -0.05); }
        if (t > tCada) chalk(ctx, 'quem fica com cada real?', 860, 730, { size: 50, weight: 900, color: '#fef08a', r: prog(t, tCada - 0.6, 1.2) });
        ctx.restore();
      }
    },
    overlay(ctx, t) { overlaySrc(ctx, 'conta do canal', vis(t, tMaior, tQue)); },
  };
}

export const SCENES = [
  { id: '01', name: 'o-mundo-fechou-a-porta', build: scene01 },
  { id: '02', name: 'a-arroba', build: scene02 },
  { id: '03', name: 'frigorifico-e-balcao', build: scene03 },
  { id: '04', name: 'quem-fica-com-cada-real', build: scene04 },
  { id: '05', name: 'o-relogio-da-vaca', build: scene05 },
  { id: '06', name: 'o-mundo-disputa-o-boi', build: scene06 },
  { id: '07', name: 'o-seu-prato', build: scene07 },
  { id: '08', name: 'o-que-esperar', build: scene08 },
  { id: '09', name: 'fechamento', build: scene09 },
];
