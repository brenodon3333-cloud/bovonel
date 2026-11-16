// Vídeo 05: Quem fica com cada real da sua cerveja (e o imposto do pecado).
// Cada cena recebe K(frase) = instante (s, relativo à cena) em que a frase começa na narração.
// Conceito: a lata é o palco e o cupom fiscal é o fio condutor.
// Regras do vídeo 04 aplicadas: câmera sempre andando (keys densas + deriva), paralaxe em camadas,
// transições discretas (corte ou 'push'), sem música (só ambiente quase inaudível).
import { W, H, C, clamp, lerp, prog, ease, appear, text, font, rr, fillRR, strokeRR, circle, hexA, source } from './lib.js';
import { glowText, counting, shockRing, sparks, layer } from './fx.js';

const P = {
  estado: '#f59e0b', uniao: '#ef4444', mercado: '#a855f7', fabrica: '#3b82f6', fabricaL: '#93c5fd', lucro: '#60a5fa',
  beer: '#fbbf24', beerD: '#b45309', foam: '#fff7e0', ok: '#4ade80', ink: '#1d2230', paper: '#f7f5ef', red: '#dc2626',
  malte: '#84cc16', dolar: '#22c55e',
};
const vis = (t, a, b, fin = 0.4, fout = 0.4) => Math.min(appear(t, a, fin), 1 - appear(t, b, fout));
// Estação do cenário: some quando a câmera está longe dela (nada fica cortado na borda enquanto a câmera está em outra estação).
function zone(ctx, cam, a, b, fn) {
  const d = cam.x < a ? a - cam.x : cam.x > b ? cam.x - b : 0, al = 1 - clamp((d - 150) / 350);
  if (al <= 0) return;
  ctx.save(); ctx.globalAlpha *= al; fn(); ctx.restore();
}
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const MONO = (size, w = 700) => `${w} ${size}px "DejaVu Sans Mono", "Liberation Mono", monospace`;
function mono(ctx, str, x, y, size, color = P.ink, align = 'left', w = 700) {
  ctx.save(); ctx.font = MONO(size, w); ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(str, x, y); ctx.restore();
}

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
// Legenda de apoio: peso forte, sombra curta e cor clara.
function cap(ctx, str, x, y, o = {}) {
  text(ctx, str, x, y, { size: o.size || 34, weight: o.weight || 800, color: o.color || '#e2e8f0', align: o.align || 'center', alpha: o.alpha ?? 1, shadow: true, letter: o.letter || 0 });
}
// Valor em destaque (número com brilho) que entra subindo.
function bigNum(ctx, str, x, y, k, o = {}) {
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(k * 1.6); ctx.translate(x, y + (1 - ease.out(clamp(k))) * 26);
  glowText(ctx, str, 0, 0, { size: o.size || 96, weight: 900, color: o.color || '#ffffff', glow: o.glow || hexA(o.color || '#ffffff', 0.55), blur: 34, align: o.align || 'center' });
  ctx.restore();
}
// Carimbo oval (tinta com falhas)
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
// Carimbo retangular grande (imposto do pecado)
function rectStamp(ctx, cx, cy, w, h, str, color, k = 1, rot = -0.08, size = 64) {
  if (k <= 0) return;
  const sc = lerp(1.8, 1, ease.out(clamp(k * 1.5)));
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 2.2) * 0.96;
  // fundo de papel (adesivo), para o carimbo vermelho ler em cima de qualquer coisa
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 8; fillRR(ctx, -w / 2 - 10, -h / 2 - 10, w + 20, h + 20, 18, '#f3efe4'); ctx.restore();
  ctx.strokeStyle = color; ctx.lineWidth = 9; strokeRR(ctx, -w / 2, -h / 2, w, h, 14, color, 9);
  strokeRR(ctx, -w / 2 + 14, -h / 2 + 14, w - 28, h - 28, 8, color, 3);
  text(ctx, str, 0, 2, { size, weight: 900, color, letter: 3 });
  const r = rng(Math.round(w)); ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = 'rgba(0,0,0,0.55)';
  for (let i = 0; i < 90; i++) { ctx.beginPath(); ctx.arc((r() - 0.5) * w, (r() - 0.5) * h, 1 + r() * 3, 0, 6.283); ctx.fill(); }
  ctx.restore();
}
// seta desenhada (sem caractere de seta)
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
function crossOut(ctx, x0, y0, x1, y1, color, k = 1, lw = 10) {
  if (k <= 0) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(lerp(x0, x1, clamp(k)), lerp(y0, y1, clamp(k))); ctx.stroke(); ctx.restore();
}

// ================================================================ cenário: geladeira de mercado (fundo com paralaxe e desfoque)
let FRIDGE = null;
function geladeiraFundo(ctx, cam, a = 1) {
  if (!FRIDGE) {
    FRIDGE = document.createElement('canvas'); FRIDGE.width = 2600; FRIDGE.height = 1400;
    const g = FRIDGE.getContext('2d');
    const bg = g.createLinearGradient(0, 0, 0, 1400); bg.addColorStop(0, '#0d1a2e'); bg.addColorStop(1, '#070d18'); g.fillStyle = bg; g.fillRect(0, 0, 2600, 1400);
    const r = rng(5);
    for (let row = 0; row < 5; row++) {
      const y = 120 + row * 260;
      g.fillStyle = 'rgba(200,220,255,0.10)'; g.fillRect(0, y + 190, 2600, 10); // prateleira
      for (let x = 40; x < 2560; x += 70 + r() * 30) { // latas e garrafas desfocadas (a última passa da borda e a emenda repete)
        const tall = r() > 0.6, w = tall ? 46 : 56, h = tall ? 170 : 110, hue = ['#b91c1c', '#1d4ed8', '#047857', '#b45309', '#e5e7eb', '#7c3aed'][Math.floor(r() * 6)];
        g.fillStyle = hue; g.globalAlpha = 0.55; rr(g, x, y + 190 - h, w, h, tall ? 18 : 10); g.fill();
        g.globalAlpha = 0.35; g.fillStyle = '#ffffff'; g.fillRect(x + w * 0.2, y + 190 - h + 8, 6, h - 16); g.globalAlpha = 1;
      }
    }
    // luz da geladeira em cima
    const lg = g.createLinearGradient(0, 0, 0, 260); lg.addColorStop(0, 'rgba(190,225,255,0.35)'); lg.addColorStop(1, 'rgba(190,225,255,0)'); g.fillStyle = lg; g.fillRect(0, 0, 2600, 260);
    const tmp = document.createElement('canvas'); tmp.width = 2600; tmp.height = 1400; const t2 = tmp.getContext('2d');
    t2.filter = 'blur(14px)'; for (const dx of [-2600, 0, 2600]) t2.drawImage(FRIDGE, dx, 0); FRIDGE = tmp; // emenda sem costura
  }
  layer(ctx, cam, 0.35, () => { // repete na horizontal: a câmera pode andar o cenário inteiro
    ctx.save(); ctx.globalAlpha *= a;
    const cx = cam.x - (cam.x - 960) * 0.65, k0 = Math.floor((cx - 1500 + 340) / 2600), k1 = Math.floor((cx + 1500 + 340) / 2600);
    for (let k = k0; k <= k1; k++) ctx.drawImage(FRIDGE, -340 + k * 2600, -160);
    ctx.fillStyle = 'rgba(6,10,20,0.45)'; ctx.fillRect(-340 + k0 * 2600, -160, (k1 - k0 + 1) * 2600, 1400); ctx.restore(); });
}
// gotas/bokeh perto da câmera (camada da frente)
function bokeh(ctx, cam, t, seed = 1, n = 14, color = '#cfe8ff', a = 0.16) {
  const r = rng(seed);
  layer(ctx, cam, 1.45, () => {
    for (let i = 0; i < n; i++) {
      const x = r() * 2400 - 240, y = r() * 1300 - 110, rad = 18 + r() * 46, ph = r() * 6.28;
      const g = ctx.createRadialGradient(x, y + Math.sin(t * 0.4 + ph) * 12, 0, x, y, rad);
      g.addColorStop(0, hexA(color, a * (0.6 + 0.4 * Math.sin(t * 0.7 + ph)))); g.addColorStop(1, hexA(color, 0));
      ctx.fillStyle = g; ctx.fillRect(x - rad, y - rad - 14, rad * 2, rad * 2 + 28);
    }
  });
}
// mesa de madeira (para o bar e o mercado)
function mesaMadeira(ctx, y, x0 = -400, x1 = 2400) {
  const g = ctx.createLinearGradient(0, y, 0, y + 420); g.addColorStop(0, '#6b4324'); g.addColorStop(1, '#2a180b');
  ctx.fillStyle = g; ctx.fillRect(x0, y, x1 - x0, 520);
  ctx.strokeStyle = 'rgba(0,0,0,0.22)'; ctx.lineWidth = 3;
  for (let yy = y + 26; yy < y + 520; yy += 34) { ctx.beginPath(); ctx.moveTo(x0, yy); ctx.bezierCurveTo(x0 + 700, yy + 7, x1 - 700, yy - 7, x1, yy + 3); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fillRect(x0, y, x1 - x0, 4);
}

// ================================================================ a lata (350 ml), cilíndrica, com rótulo girando
// centro (x, y); corpo 200 x 372 na escala 1. o: { rot (0..1 giro do rótulo), open (0..1), t, drops, label: 'pilsen'|'zero', alpha, plain }
const CAN_W = 200, CAN_H = 372;
const LABELS = {};
function labelTex(kind) {
  if (LABELS[kind]) return LABELS[kind];
  const c = document.createElement('canvas'); c.width = 900; c.height = 300; const g = c.getContext('2d');
  const zero = kind === 'zero';
  const bg = g.createLinearGradient(0, 0, 0, 300); bg.addColorStop(0, zero ? '#0f3b8a' : '#b3121b'); bg.addColorStop(1, zero ? '#0a2a66' : '#7d0d14');
  g.fillStyle = bg; g.fillRect(0, 0, 900, 300);
  g.fillStyle = '#f5c542'; g.fillRect(0, 18, 900, 8); g.fillRect(0, 274, 900, 8);
  for (const x0 of [0, 450]) {
    g.save(); g.translate(x0, 0);
    g.fillStyle = '#ffffff'; g.font = '900 92px "Noto Sans"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(zero ? '0,0%' : 'PILSEN', 225, 136);
    g.font = '800 30px "Noto Sans"'; g.fillStyle = '#f5c542'; g.fillText(zero ? 'SEM ÁLCOOL' : 'CERVEJA', 225, 62);
    g.font = '700 24px "Noto Sans"'; g.fillStyle = '#fde7b0'; g.fillText('350 ml', 225, 214);
    // espiga
    g.strokeStyle = '#f5c542'; g.lineWidth = 4; g.beginPath(); g.moveTo(72, 250); g.quadraticCurveTo(78, 190, 96, 150); g.stroke();
    for (let i = 0; i < 6; i++) { g.fillStyle = '#f5c542'; g.beginPath(); g.ellipse(84 + i * 2.4, 236 - i * 15, 6, 11, -0.5, 0, 6.283); g.fill(); g.beginPath(); g.ellipse(70 + i * 3.4, 230 - i * 15, 6, 11, 0.5, 0, 6.283); g.fill(); }
    g.restore();
  }
  LABELS[kind] = c; return c;
}
function canBody(ctx) { // contorno do corpo (com ombro e pescoço)
  const w = CAN_W / 2, h = CAN_H / 2;
  ctx.beginPath();
  ctx.moveTo(-w * 0.78, -h); ctx.lineTo(w * 0.78, -h); ctx.quadraticCurveTo(w, -h + 18, w, -h + 46);
  ctx.lineTo(w, h - 26); ctx.quadraticCurveTo(w, h, w * 0.8, h); ctx.lineTo(-w * 0.8, h); ctx.quadraticCurveTo(-w, h, -w, h - 26);
  ctx.lineTo(-w, -h + 46); ctx.quadraticCurveTo(-w, -h + 18, -w * 0.78, -h); ctx.closePath();
}
function lata(ctx, x, y, s, o = {}) {
  const w = CAN_W / 2, h = CAN_H / 2;
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.tilt || 0); ctx.scale(s, s); ctx.globalAlpha *= o.alpha ?? 1;
  // sombra no chão
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.beginPath(); ctx.ellipse(10, h + 6, w * 1.25, 18, 0, 0, 6.283); ctx.fill();
  // metal
  ctx.save(); canBody(ctx); ctx.clip();
  const mg = ctx.createLinearGradient(-w, 0, w, 0);
  mg.addColorStop(0, '#5b6470'); mg.addColorStop(0.18, '#e7ebef'); mg.addColorStop(0.32, '#aab3bd'); mg.addColorStop(0.62, '#d8dde3'); mg.addColorStop(0.85, '#7d8792'); mg.addColorStop(1, '#4a525c');
  ctx.fillStyle = mg; ctx.fillRect(-w, -h, CAN_W, CAN_H);
  // rótulo cilíndrico (fatias com mapeamento de cilindro)
  if (!o.plain) {
    const tex = labelTex(o.label || 'pilsen'), N = 56, top = -h + 62, lh = CAN_H - 104, rot = o.rot || 0;
    // a textura (900 px) é uma volta inteira com a marca dos dois lados; a frente mostra meia volta
    const U = (xx) => (Math.asin(clamp(xx, -1, 1)) / Math.PI + 0.5) * 0.5 + rot;
    for (let i = 0; i < N; i++) {
      const xa = -1 + (2 * i) / N, xb = -1 + (2 * (i + 1)) / N;
      const ua = U(xa), sx = (((ua % 1) + 1) % 1) * 900; let sw = (U(xb) - ua) * 900; if (sx + sw > 900) sw = 900 - sx;
      ctx.drawImage(tex, sx, 0, Math.max(1, sw), 300, xa * w, top, (xb - xa) * w + 0.8, lh);
    }
  }
  if (o.bands) o.bands(ctx, -w, -h + 62, CAN_W, CAN_H - 104);
  // sombreamento de cilindro por cima
  const sh = ctx.createLinearGradient(-w, 0, w, 0);
  sh.addColorStop(0, 'rgba(0,0,0,0.55)'); sh.addColorStop(0.2, 'rgba(255,255,255,0.28)'); sh.addColorStop(0.28, 'rgba(255,255,255,0.05)');
  sh.addColorStop(0.7, 'rgba(0,0,0,0.05)'); sh.addColorStop(0.9, 'rgba(0,0,0,0.38)'); sh.addColorStop(1, 'rgba(0,0,0,0.6)');
  ctx.fillStyle = sh; ctx.fillRect(-w, -h, CAN_W, CAN_H);
  // gotas de condensação
  if (o.drops !== false) {
    const r = rng(17), tt = o.t || 0;
    for (let i = 0; i < 70; i++) {
      const dx = (r() * 2 - 1) * w * 0.92, dy0 = -h + 50 + r() * (CAN_H - 80), rad = 1.5 + r() * 4.5, run = r() < 0.12;
      const dy = run ? -h + 50 + ((dy0 + h - 50 + tt * (14 + r() * 20)) % (CAN_H - 80)) : dy0;
      ctx.fillStyle = 'rgba(255,255,255,0.32)'; ctx.beginPath(); ctx.ellipse(dx, dy, rad * 0.8, rad, 0, 0, 6.283); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.beginPath(); ctx.ellipse(dx + rad * 0.3, dy + rad * 0.4, rad * 0.5, rad * 0.6, 0, 0, 6.283); ctx.fill();
      if (run) { ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(dx - 1, dy - 40, 2, 40); }
    }
  }
  ctx.restore();
  // tampa
  const lg = ctx.createLinearGradient(-w, -h, w, -h); lg.addColorStop(0, '#8b949e'); lg.addColorStop(0.4, '#f1f3f5'); lg.addColorStop(1, '#7b848e');
  ctx.fillStyle = lg; ctx.beginPath(); ctx.ellipse(0, -h, w * 0.8, 15, 0, 0, 6.283); ctx.fill();
  ctx.strokeStyle = '#6b7480'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, -h, w * 0.8, 15, 0, 0, 6.283); ctx.stroke();
  ctx.fillStyle = '#c3c9cf'; ctx.beginPath(); ctx.ellipse(0, -h + 1, w * 0.68, 11, 0, 0, 6.283); ctx.fill();
  const op = clamp(o.open || 0);
  ctx.fillStyle = '#1c2026'; ctx.beginPath(); ctx.ellipse(16, -h, 18 * (0.3 + 0.7 * op), 6 * (0.3 + 0.7 * op), 0, 0, 6.283); ctx.globalAlpha *= 0.2 + 0.8 * op; ctx.fill(); ctx.globalAlpha /= 0.2 + 0.8 * op;
  ctx.save(); ctx.translate(-4, -h - 2); ctx.rotate(-0.9 * op); fillRR(ctx, -26, -7, 44, 14, 7, '#d1d6db'); strokeRR(ctx, -26, -7, 44, 14, 7, '#7b848e', 2); ctx.restore();
  // espuma saindo
  if (o.foam > 0) { const k = clamp(o.foam); for (let i = 0; i < 7; i++) circle(ctx, 16 + (i - 3) * 6, -h - 6 - k * (8 + (i % 3) * 7), 5 + (i % 2) * 3, P.foam, 0.85 * k); }
  ctx.restore();
}

// ================================================================ cupom fiscal (NFC-e) saindo da impressora do caixa
// x = centro, y = topo (boca da impressora). lines: [{ s, b, big, right, hl, qr }]. k = quantas linhas já saíram (fração).
const CUPOM_W = 460;
function cupomLinhas(extra = []) {
  return [
    { s: 'SUPERMERCADO BOM PREÇO LTDA', b: 1, c: 1 },
    { s: 'CNPJ 12.345.678/0001-90', c: 1 },
    { s: 'R. DAS PALMEIRAS, 100 · SÃO PAULO', c: 1 },
    { s: '--------------------------------------', c: 1 },
    { s: 'DANFE NFC-e · Documento Auxiliar', c: 1, b: 1 },
    { s: 'da Nota Fiscal de Consumidor Eletrônica', c: 1 },
    { s: '--------------------------------------', c: 1 },
    { s: '001 CERVEJA PILSEN LATA 350ML' },
    { s: '1 UN x 4,00', right: '4,00' },
    { s: '--------------------------------------', c: 1 },
    { s: 'VALOR TOTAL R$', right: '4,00', b: 1, big: 1 },
    { s: 'Dinheiro', right: '4,00' },
    ...extra,
  ];
}
function cupom(ctx, x, y, s, lines, k, o = {}) {
  const lh = 30, pad = 26, n = lines.length, shown = clamp(k, 0, n), full = pad + n * lh + (o.qr ? 170 : 0) + pad;
  const hh = Math.min(full, pad + shown * lh + (shown >= n && o.qr ? 170 * clamp((k - n) * 2) : 0) + pad * clamp(shown));
  if (hh <= 2) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s, s);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 10;
  const pg = ctx.createLinearGradient(0, 0, 0, hh); pg.addColorStop(0, '#ecebe5'); pg.addColorStop(1, P.paper);
  ctx.fillStyle = pg; ctx.beginPath(); ctx.moveTo(-CUPOM_W / 2, 0); ctx.lineTo(CUPOM_W / 2, 0); ctx.lineTo(CUPOM_W / 2, hh);
  for (let xx = CUPOM_W / 2; xx > -CUPOM_W / 2; xx -= 16) ctx.lineTo(xx - 8, hh - (o.torn ? 7 : 0)), ctx.lineTo(xx - 16, hh); // serrilha
  ctx.lineTo(-CUPOM_W / 2, hh); ctx.closePath(); ctx.fill(); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(-CUPOM_W / 2, 0, CUPOM_W, hh); ctx.clip();
  lines.forEach((L, i) => {
    if (i >= shown) return;
    const yy = pad + i * lh + lh / 2;
    if (L.hl) { const hk = clamp(L.hlk ?? 1); fillRR(ctx, -CUPOM_W / 2 + 12, yy - lh / 2 + 2, (CUPOM_W - 24) * hk, lh - 4, 4, hexA(L.hl, 0.4)); }
    const sz = L.big ? 21 : 17, col = L.col || P.ink;
    if (L.c) mono(ctx, L.s, 0, yy, sz, col, 'center', L.b ? 800 : 600);
    else mono(ctx, L.s, -CUPOM_W / 2 + pad, yy, sz, col, 'left', L.b ? 800 : 600);
    if (L.right) mono(ctx, L.right, CUPOM_W / 2 - pad, yy, sz, col, 'right', 800);
  });
  if (o.qr && k > n) { // QR code
    const q0x = -70, q0y = pad + n * lh + 10, qs = 7, rq = rng(77);
    ctx.globalAlpha *= clamp((k - n) * 2);
    ctx.fillStyle = '#111'; for (let i = 0; i < 20; i++) for (let j = 0; j < 20; j++) if (rq() > 0.5) ctx.fillRect(q0x + i * qs, q0y + j * qs, qs, qs);
    [[0, 0], [13, 0], [0, 13]].forEach(([i, j]) => { ctx.fillStyle = '#111'; ctx.fillRect(q0x + i * qs, q0y + j * qs, 7 * qs, 7 * qs); ctx.fillStyle = P.paper; ctx.fillRect(q0x + (i + 1) * qs, q0y + (j + 1) * qs, 5 * qs, 5 * qs); ctx.fillStyle = '#111'; ctx.fillRect(q0x + (i + 2) * qs, q0y + (j + 2) * qs, 3 * qs, 3 * qs); });
  }
  ctx.restore();
  ctx.restore();
}
function impressoraCaixa(ctx, x, y, s) { // impressora térmica do caixa; a boca fica em (x, y)
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
  const g = ctx.createLinearGradient(0, -130, 0, 10); g.addColorStop(0, '#3a414b'); g.addColorStop(1, '#1d2229');
  ctx.fillStyle = g; rr(ctx, -290, -150, 580, 160, 26); ctx.fill(); ctx.restore();
  fillRR(ctx, -250, -12, 500, 16, 6, '#0b0e12');
  fillRR(ctx, 170, -118, 80, 22, 8, '#111827'); circle(ctx, 236, -107, 6, '#22c55e');
  text(ctx, 'CAIXA 03', -200, -100, { size: 22, weight: 900, color: '#94a3b8', align: 'left', letter: 3 });
  ctx.restore();
}

// ================================================================ moedas (R$)
function moeda(ctx, x, y, r, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(1, o.flat ?? 1);
  const g = ctx.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.1, 0, 0, r);
  const gold = o.prata ? ['#f3f4f6', '#9ca3af'] : ['#fde68a', '#b7791f'];
  g.addColorStop(0, gold[0]); g.addColorStop(1, gold[1]);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = r * 0.4; ctx.shadowOffsetY = r * 0.12; circle(ctx, 0, 0, r, gold[1]); ctx.restore();
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r * 0.94, 0, 6.283); ctx.fill();
  ctx.strokeStyle = 'rgba(80,50,10,0.35)'; ctx.lineWidth = r * 0.05; ctx.beginPath(); ctx.arc(0, 0, r * 0.78, 0, 6.283); ctx.stroke();
  text(ctx, o.label || 'R$', 0, 2, { size: r * 0.62, weight: 900, color: o.prata ? '#4b5563' : '#7c4a03' });
  ctx.restore();
}
// pilha de moedas vista de lado; n moedas; base (x, y)
function pilha(ctx, x, y, n, r = 46, color = null) {
  for (let i = 0; i < n; i++) {
    const yy = y - i * r * 0.22;
    ctx.save(); ctx.translate(x, yy);
    const g = ctx.createLinearGradient(-r, 0, r, 0); g.addColorStop(0, '#b7791f'); g.addColorStop(0.4, '#fde68a'); g.addColorStop(1, '#a16207');
    ctx.fillStyle = color ? hexA(color, 1) : g; ctx.fillRect(-r, -r * 0.11, r * 2, r * 0.22);
    ctx.fillStyle = color ? hexA(color, 0.7) : '#fcd34d'; ctx.beginPath(); ctx.ellipse(0, -r * 0.11, r, r * 0.3, 0, 0, 6.283); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, -r * 0.11, r, r * 0.3, 0, 0, 6.283); ctx.stroke();
    ctx.restore();
  }
}

// ================================================================ saco de malte (juta, 25 kg)
function sacoMalte(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.beginPath(); ctx.ellipse(0, 250, 240, 26, 0, 0, 6.283); ctx.fill();
  const path = () => { ctx.beginPath(); ctx.moveTo(-170, -250); ctx.quadraticCurveTo(0, -280, 170, -250); ctx.quadraticCurveTo(230, 0, 210, 230); ctx.quadraticCurveTo(0, 270, -210, 230); ctx.quadraticCurveTo(-230, 0, -170, -250); ctx.closePath(); };
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 14;
  const g = ctx.createLinearGradient(-220, -260, 220, 260); g.addColorStop(0, '#d9bf8c'); g.addColorStop(1, '#9c7f4c'); ctx.fillStyle = g; path(); ctx.fill(); ctx.restore();
  ctx.save(); path(); ctx.clip();
  ctx.strokeStyle = 'rgba(80,55,20,0.18)'; ctx.lineWidth = 2;
  for (let i = -280; i < 280; i += 9) { ctx.beginPath(); ctx.moveTo(i, -300); ctx.lineTo(i, 300); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-300, i); ctx.lineTo(300, i); ctx.stroke(); }
  const sh = ctx.createLinearGradient(-220, 0, 220, 0); sh.addColorStop(0, 'rgba(0,0,0,0.3)'); sh.addColorStop(0.4, 'rgba(255,255,255,0.08)'); sh.addColorStop(1, 'rgba(0,0,0,0.35)'); ctx.fillStyle = sh; ctx.fillRect(-260, -300, 520, 600);
  // estêncil
  const ink = 'rgba(60,30,10,0.85)';
  text(ctx, 'MALTE PILSEN', 0, -120, { size: 50, weight: 900, color: ink, letter: 4 });
  ctx.fillStyle = ink; ctx.fillRect(-150, -84, 300, 5);
  text(ctx, '25 kg', 0, -20, { size: 76, weight: 900, color: ink });
  text(ctx, 'IMPORTADO', 0, 70, { size: 34, weight: 900, color: 'rgba(150,20,20,0.85)', letter: 6 });
  text(ctx, 'ORIGEM: ARGENTINA', 0, 120, { size: 28, weight: 800, color: ink, letter: 2 });
  ctx.restore();
  // amarração da boca
  ctx.strokeStyle = '#6b4f22'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(-120, -252); ctx.quadraticCurveTo(0, -238, 120, -252); ctx.stroke();
  ctx.restore();
}
// grãos de cevada/malte
function graos(ctx, x, y, n, spread, seed = 3, k = 1) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const gx = x + (r() - 0.5) * spread, gy = y + (r() - 0.5) * spread * 0.35, a = r() * 3;
    if (r() > k) continue;
    ctx.save(); ctx.translate(gx, gy); ctx.rotate(a);
    const g = ctx.createLinearGradient(-9, 0, 9, 0); g.addColorStop(0, '#a16207'); g.addColorStop(0.5, '#fbbf24'); g.addColorStop(1, '#92400e');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, 11, 5, 0, 0, 6.283); ctx.fill();
    ctx.strokeStyle = 'rgba(80,40,0,0.4)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(9, 0); ctx.stroke();
    ctx.restore();
  }
}

// ================================================================ painel de cotação (tela escura com gráfico de linha)
// pts: [[rótulo do mês, valor]]; k = quanto da linha já foi desenhado (0..1)
function painelCotacao(ctx, x, y, w, h, o) {
  const { title, unit, pts, k = 1, lo, hi, color = P.dolar, marks = [] } = o;
  ctx.save(); ctx.globalAlpha *= o.alpha ?? 1;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 16; fillRR(ctx, x, y, w, h, 22, '#0a1020'); ctx.restore();
  strokeRR(ctx, x, y, w, h, 22, '#1f2b44', 3);
  text(ctx, title, x + 36, y + 44, { size: 30, weight: 900, color: '#e2e8f0', align: 'left', letter: 2 });
  text(ctx, unit, x + w - 36, y + 44, { size: 24, weight: 700, color: '#94a3b8', align: 'right' });
  const gx = x + 70, gy = y + 90, gw = w - 120, gh = h - 160;
  ctx.strokeStyle = 'rgba(148,163,184,0.15)'; ctx.lineWidth = 2;
  for (let i = 0; i <= 4; i++) { const yy = gy + (gh * i) / 4; ctx.beginPath(); ctx.moveTo(gx, yy); ctx.lineTo(gx + gw, yy); ctx.stroke(); }
  const X = (i) => gx + (gw * i) / (pts.length - 1), Y = (v) => gy + gh - ((v - lo) / (hi - lo)) * gh;
  pts.forEach(([m], i) => text(ctx, m, X(i), gy + gh + 30, { size: 20, weight: 800, color: '#94a3b8' }));
  const n = (pts.length - 1) * clamp(k), last = Math.floor(n);
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 7; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.shadowColor = color; ctx.shadowBlur = 16;
  ctx.beginPath(); ctx.moveTo(X(0), Y(pts[0][1]));
  for (let i = 1; i <= last; i++) ctx.lineTo(X(i), Y(pts[i][1]));
  let hx = X(last), hy = Y(pts[last][1]);
  if (last < pts.length - 1) { const f = n - last; hx = lerp(X(last), X(last + 1), f); hy = lerp(Y(pts[last][1]), Y(pts[last + 1][1]), f); ctx.lineTo(hx, hy); }
  ctx.stroke(); ctx.restore();
  circle(ctx, hx, hy, 10, '#ffffff');
  for (const mk of marks) {
    const a = clamp(mk.k ?? 1); if (a <= 0) continue;
    const mx = X(mk.i), my = Y(pts[mk.i][1]);
    ctx.save(); ctx.globalAlpha *= a; circle(ctx, mx, my, 14, mk.color || '#ffffff'); circle(ctx, mx, my, 7, '#0a1020');
    const ly = my + (mk.dy ?? -70), lw = Math.max(170, mk.s.length * 15 + 40);
    fillRR(ctx, mx - lw / 2, ly - 26, lw, 52, 12, mk.color || '#ffffff');
    text(ctx, mk.s, mx, ly + 1, { size: 26, weight: 900, color: '#0a1020' });
    ctx.restore();
  }
  if (mkBand(o)) { const [i0, i1, lab] = o.band; ctx.save(); ctx.globalAlpha *= clamp(o.bandK ?? 1) * 0.9; ctx.fillStyle = 'rgba(239,68,68,0.16)'; ctx.fillRect(X(i0), gy, X(i1) - X(i0), gh); text(ctx, lab, (X(i0) + X(i1)) / 2, gy + 26, { size: 22, weight: 900, color: '#fca5a5' }); ctx.restore(); }
  ctx.restore();
}
const mkBand = (o) => o.band && (o.bandK ?? 1) > 0;

// ================================================================ ícones de embalagem
function garrafa(ctx, x, y, s, o = {}) { // garrafa de vidro âmbar (600 ml retornável ou litrão)
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.alpha ?? 1;
  const tall = o.litrao ? 1.18 : 1;
  ctx.scale(1, tall);
  ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.ellipse(0, 190, 70, 12, 0, 0, 6.283); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-18, -200); ctx.lineTo(18, -200); ctx.lineTo(20, -110); ctx.quadraticCurveTo(62, -70, 62, -20); ctx.lineTo(62, 170); ctx.quadraticCurveTo(62, 190, 40, 190);
  ctx.lineTo(-40, 190); ctx.quadraticCurveTo(-62, 190, -62, 170); ctx.lineTo(-62, -20); ctx.quadraticCurveTo(-62, -70, -20, -110); ctx.closePath();
  const g = ctx.createLinearGradient(-62, 0, 62, 0); g.addColorStop(0, '#3b1d06'); g.addColorStop(0.25, '#a0520f'); g.addColorStop(0.5, '#6b3209'); g.addColorStop(1, '#2a1404');
  ctx.fillStyle = g; ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.fillRect(-44, -40, 10, 200);
  fillRR(ctx, -22, -214, 44, 18, 4, '#d4a017');
  if (!o.noLabel) { fillRR(ctx, -58, 20, 116, 90, 8, o.labelColor || '#f5efe0'); text(ctx, o.tag || 'PILSEN', 0, 52, { size: 22, weight: 900, color: '#7d0d14' }); text(ctx, o.ml || '600 ml', 0, 84, { size: 18, weight: 800, color: '#7d0d14' }); }
  ctx.restore();
}
function barril(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.alpha ?? 1;
  ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.ellipse(0, 175, 120, 18, 0, 0, 6.283); ctx.fill();
  const g = ctx.createLinearGradient(-110, 0, 110, 0); g.addColorStop(0, '#6b7280'); g.addColorStop(0.3, '#f3f4f6'); g.addColorStop(0.6, '#a1a8b2'); g.addColorStop(1, '#4b5563');
  ctx.fillStyle = g; rr(ctx, -110, -170, 220, 345, 30); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 6; for (const yy of [-110, 0, 110]) { ctx.beginPath(); ctx.moveTo(-110, yy); ctx.lineTo(110, yy); ctx.stroke(); }
  fillRR(ctx, -40, -196, 80, 30, 8, '#374151'); text(ctx, 'CHOPE', 0, 56, { size: 30, weight: 900, color: '#1f2937' }); text(ctx, '50 L', 0, -55, { size: 30, weight: 900, color: '#1f2937' });
  ctx.restore();
}
function engradado(ctx, x, y, s, k = 1) { // caixa plástica com 12 garrafas retornáveis
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (let r2 = 0; r2 < 2; r2++) for (let c = 0; c < 6; c++) { if ((r2 * 6 + c) / 12 > k) continue; garrafa(ctx, -250 + c * 100 + r2 * 26, -60 - r2 * 40, 0.5, { noLabel: true }); }
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 10;
  const g = ctx.createLinearGradient(0, -20, 0, 120); g.addColorStop(0, '#d11b1b'); g.addColorStop(1, '#7f0f0f'); ctx.fillStyle = g; rr(ctx, -320, -20, 640, 140, 18); ctx.fill(); ctx.restore();
  for (let i = 0; i < 7; i++) fillRR(ctx, -290 + i * 88, 10, 60, 26, 8, 'rgba(0,0,0,0.35)');
  text(ctx, 'RETORNÁVEL', 0, 80, { size: 38, weight: 900, color: '#fee2e2', letter: 4 });
  ctx.restore();
}

// ================================================================ caminhão de bebidas (lateral) e prédios do caminho
function caminhao(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.beginPath(); ctx.ellipse(0, 112, 330, 18, 0, 0, 6.283); ctx.fill();
  // baú lateral com engradados
  const g = ctx.createLinearGradient(0, -170, 0, 80); g.addColorStop(0, '#e5e7eb'); g.addColorStop(1, '#9ca3af');
  ctx.fillStyle = g; rr(ctx, -320, -170, 470, 250, 14); ctx.fill();
  for (let r2 = 0; r2 < 3; r2++) for (let c = 0; c < 5; c++) fillRR(ctx, -300 + c * 90, -150 + r2 * 74, 80, 64, 6, ['#b91c1c', '#991b1b'][(r2 + c) % 2]);
  text(ctx, o.label || 'BEBIDAS', -85, 46, { size: 30, weight: 900, color: '#1f2937', letter: 4 });
  // cabine
  const cg = ctx.createLinearGradient(160, -120, 300, 80); cg.addColorStop(0, '#1d4ed8'); cg.addColorStop(1, '#1e3a8a');
  ctx.fillStyle = cg; ctx.beginPath(); ctx.moveTo(160, 80); ctx.lineTo(160, -110); ctx.lineTo(250, -110); ctx.lineTo(310, -30); ctx.lineTo(320, 80); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#bfdbfe'; ctx.beginPath(); ctx.moveTo(180, -90); ctx.lineTo(244, -90); ctx.lineTo(290, -30); ctx.lineTo(180, -30); ctx.closePath(); ctx.fill();
  // rodas
  const rot = o.wheel || 0;
  for (const wx of [-220, -120, 240]) {
    circle(ctx, wx, 86, 40, '#111827'); circle(ctx, wx, 86, 22, '#9ca3af');
    ctx.save(); ctx.translate(wx, 86); ctx.rotate(rot); ctx.strokeStyle = '#4b5563'; ctx.lineWidth = 5; for (let i = 0; i < 3; i++) { ctx.rotate(2.094); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 20); ctx.stroke(); } ctx.restore();
  }
  if (o.guia > 0) { // guia de imposto já paga, presa no baú
    const k = clamp(o.guia);
    ctx.save(); ctx.translate(-30, -110); ctx.rotate(-0.06); ctx.scale(lerp(1.5, 1, ease.out(k)), lerp(1.5, 1, ease.out(k))); ctx.globalAlpha *= clamp(k * 2);
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 14; fillRR(ctx, -150, -64, 300, 128, 6, P.paper); ctx.restore();
    mono(ctx, 'GUIA DE RECOLHIMENTO', 0, -36, 17, P.ink, 'center', 800); mono(ctx, 'ICMS - SUBSTITUIÇÃO', 0, -10, 17, P.ink, 'center', 700); mono(ctx, 'TRIBUTÁRIA', 0, 12, 17, P.ink, 'center', 700);
    ctx.restore();
    if (o.pago > 0) ovalStamp(ctx, 10, -112, 92, 40, [['PAGO', 0.08, 0.7]], P.red, o.pago, -0.14);
  }
  ctx.restore();
}
function predio(ctx, x, y, w, h, kind, a = 1) { // fábrica, distribuidor, mercado
  ctx.save(); ctx.globalAlpha *= a;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
  const col = { fabrica: ['#334155', '#1e293b'], distribuidor: ['#3f3f46', '#27272a'], mercado: ['#4c1d95', '#2e1065'] }[kind];
  const g = ctx.createLinearGradient(0, y - h, 0, y); g.addColorStop(0, col[0]); g.addColorStop(1, col[1]); ctx.fillStyle = g; ctx.fillRect(x - w / 2, y - h, w, h); ctx.restore();
  if (kind === 'fabrica') {
    for (let i = 0; i < 3; i++) { fillRR(ctx, x - w / 2 + 40 + i * 110, y - h - 120, 50, 140, 6, '#475569'); }
    ctx.fillStyle = '#1e293b'; ctx.beginPath(); for (let i = 0; i < 4; i++) { const xx = x - w / 2 + i * (w / 4); ctx.moveTo(xx, y - h); ctx.lineTo(xx + w / 8, y - h - 50); ctx.lineTo(xx + w / 4, y - h); } ctx.fill();
  }
  const r = rng(Math.round(x));
  for (let yy = y - h + 40; yy < y - 70; yy += 70) for (let xx = x - w / 2 + 30; xx < x + w / 2 - 50; xx += 80) fillRR(ctx, xx, yy, 46, 34, 4, r() > 0.35 ? 'rgba(253,230,138,0.75)' : 'rgba(15,23,42,0.8)');
  const label = { fabrica: 'CERVEJARIA', distribuidor: 'DISTRIBUIDOR', mercado: 'MERCADO' }[kind];
  fillRR(ctx, x - 150, y - 64, 300, 50, 10, '#0b1222'); text(ctx, label, x, y - 38, { size: 28, weight: 900, color: '#f8fafc', letter: 3 });
  ctx.restore();
}

// ================================================================ página do Diário Oficial com a tabela de preço médio (PMPF)
function diarioOficial(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s, s);
  const Wp = 760, Hp = 900;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18;
  const pg = ctx.createLinearGradient(0, 0, Wp, Hp); pg.addColorStop(0, '#f8f6ef'); pg.addColorStop(1, '#e6e1d3'); ctx.fillStyle = pg; ctx.fillRect(-Wp / 2, -Hp / 2, Wp, Hp); ctx.restore();
  const L = -Wp / 2 + 40, R = Wp / 2 - 40;
  text(ctx, 'DIÁRIO OFICIAL', 0, -Hp / 2 + 56, { size: 50, weight: 900, color: '#111827', letter: 2 });
  text(ctx, 'ESTADO · PODER EXECUTIVO · SEÇÃO I', 0, -Hp / 2 + 98, { size: 18, weight: 800, color: '#374151', letter: 2 });
  ctx.fillStyle = '#111827'; ctx.fillRect(L, -Hp / 2 + 120, R - L, 4); ctx.fillRect(L, -Hp / 2 + 130, R - L, 1.5);
  text(ctx, 'SECRETARIA DA FAZENDA', L, -Hp / 2 + 166, { size: 20, weight: 900, color: '#111827', align: 'left' });
  text(ctx, 'Portaria: divulga o preço médio ponderado a', L, -Hp / 2 + 200, { size: 18, weight: 600, color: '#374151', align: 'left' });
  text(ctx, 'consumidor final (PMPF) para o ICMS da cerveja', L, -Hp / 2 + 226, { size: 18, weight: 600, color: '#374151', align: 'left' });
  // tabela
  const top = -Hp / 2 + 270, rh = 46;
  fillRR(ctx, L, top, R - L, rh, 4, '#1f2937');
  text(ctx, 'PRODUTO', L + 16, top + rh / 2, { size: 18, weight: 900, color: '#f9fafb', align: 'left', letter: 1 });
  text(ctx, 'EMBALAGEM', L + 420, top + rh / 2, { size: 18, weight: 900, color: '#f9fafb', align: 'left', letter: 1 });
  text(ctx, 'R$', R - 16, top + rh / 2, { size: 18, weight: 900, color: '#f9fafb', align: 'right' });
  const rows = o.rows;
  rows.forEach(([p, e, v], i) => {
    const yy = top + rh * (i + 1);
    if (i % 2) ctx.fillStyle = 'rgba(0,0,0,0.04)', ctx.fillRect(L, yy, R - L, rh);
    if (o.hl === i) fillRR(ctx, L - 6, yy + 4, (R - L + 12) * clamp(o.hlk ?? 1), rh - 8, 6, 'rgba(250,204,21,0.55)');
    mono(ctx, p, L + 16, yy + rh / 2, 17, '#111827', 'left', 700); mono(ctx, e, L + 420, yy + rh / 2, 17, '#111827', 'left', 600); mono(ctx, v, R - 16, yy + rh / 2, 17, '#111827', 'right', 800);
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(L, yy + rh, R - L, 1);
  });
  ctx.restore();
}

// ================================================================ Brasil (silhueta em pontos) para o ICMS por estado
const BRASIL = [[-74, -8], [-70, -4], [-69, 1], [-60, 5], [-51, 4], [-50, 0], [-44, -2], [-35, -5], [-39, -13], [-40, -20], [-44, -23], [-48, -26], [-53, -33], [-57, -30], [-55, -27], [-54, -25], [-58, -20], [-58, -16], [-60, -14], [-65, -11], [-70, -11], [-73, -9]];
const inPoly = (pt, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) c = !c; } return c; };
let BRMAP = null;
function brasilPontos(ctx, cx, cy, sc, a = 1) { // cx, cy = centro; sc = px por grau
  if (!BRMAP) { BRMAP = []; for (let lat = 6; lat > -34; lat -= 0.9) for (let lon = -74; lon < -34; lon += 0.9) if (inPoly([lon, lat], BRASIL)) BRMAP.push([lon, lat]); }
  const pt = (lon, lat) => [cx + (lon + 54) * sc, cy - (lat + 14) * sc];
  ctx.save(); ctx.globalAlpha *= a;
  for (const [lon, lat] of BRMAP) { const [x, y] = pt(lon, lat); ctx.fillStyle = 'rgba(148,163,184,0.55)'; ctx.beginPath(); ctx.arc(x, y, sc * 0.3, 0, 6.283); ctx.fill(); }
  ctx.restore();
  return pt;
}
// marcador de estado com a alíquota
function pinoEstado(ctx, x, y, label, value, color, k) {
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(k * 2);
  const g = ctx.createRadialGradient(x, y, 0, x, y, 70 * ease.out(clamp(k))); g.addColorStop(0, hexA(color, 0.6)); g.addColorStop(1, hexA(color, 0)); ctx.fillStyle = g; ctx.fillRect(x - 80, y - 80, 160, 160);
  circle(ctx, x, y, 12, color); circle(ctx, x, y, 5, '#0b1222');
  const bx = x + 34, by = y - 50, w = 320;
  fillRR(ctx, bx, by - 44, w, 124, 16, '#0b1222'); strokeRR(ctx, bx, by - 44, w, 124, 16, color, 4);
  text(ctx, label, bx + 22, by - 10, { size: 30, weight: 800, color: '#cbd5e1', align: 'left' });
  text(ctx, value, bx + 22, by + 40, { size: 56, weight: 900, color, align: 'left' });
  ctx.restore();
}

// ================================================================ objetos menores das cenas
function tabuaCarne(ctx, x, y, s) { // tábua com um bife (lembra o vídeo da carne)
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.beginPath(); ctx.ellipse(0, 70, 300, 30, 0, 0, 6.283); ctx.fill();
  const g = ctx.createLinearGradient(0, -60, 0, 70); g.addColorStop(0, '#a26a3a'); g.addColorStop(1, '#6b4324'); ctx.fillStyle = g; rr(ctx, -290, -70, 580, 140, 40); ctx.fill();
  ctx.fillStyle = '#7f1d1d'; ctx.beginPath(); ctx.ellipse(-10, -10, 190, 70, -0.08, 0, 6.283); ctx.fill();
  const mg = ctx.createRadialGradient(-40, -30, 10, -10, -10, 190); mg.addColorStop(0, '#c9333b'); mg.addColorStop(1, '#8a1d23'); ctx.fillStyle = mg; ctx.beginPath(); ctx.ellipse(-10, -14, 180, 62, -0.08, 0, 6.283); ctx.fill();
  ctx.strokeStyle = '#f3e3cf'; ctx.lineWidth = 16; ctx.beginPath(); ctx.ellipse(-10, -14, 180, 62, -0.08, 3.6, 5.4); ctx.stroke();
  ctx.restore();
}
function jornal(ctx, x, y, s, k, o = {}) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(lerp(0.4, o.rot ?? -0.04, ease.out(clamp(k)))); ctx.scale(s * lerp(0.6, 1, ease.out(clamp(k))), s * lerp(0.6, 1, ease.out(clamp(k)))); ctx.globalAlpha *= clamp(k * 2);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18; ctx.fillStyle = '#efece3'; ctx.fillRect(-420, -300, 840, 600); ctx.restore();
  text(ctx, 'JORNAL DA MANHÃ', 0, -250, { size: 46, weight: 900, color: '#111827', letter: 4 });
  ctx.fillStyle = '#111827'; ctx.fillRect(-390, -214, 780, 4);
  text(ctx, 'ECONOMIA · NOVEMBRO DE 2026', -390, -188, { size: 18, weight: 800, color: '#374151', align: 'left', letter: 2 });
  text(ctx, 'IMPOSTO DO PECADO:', -390, -120, { size: 54, weight: 900, color: '#111827', align: 'left' });
  text(ctx, 'CERVEJA VAI FICAR', -390, -56, { size: 54, weight: 900, color: '#111827', align: 'left' });
  text(ctx, 'MAIS CARA?', -390, 8, { size: 54, weight: 900, color: '#b91c1c', align: 'left' });
  ctx.fillStyle = 'rgba(17,24,39,0.28)'; for (let i = 0; i < 7; i++) ctx.fillRect(-390, 70 + i * 30, i % 3 === 2 ? 420 : 780, 12);
  ctx.restore();
}
function barraComp(ctx, x, yBase, w, hMax, v, vMax, color, label, valStr, k) { // barra vertical com rótulo
  const h = hMax * (v / vMax) * ease.out(clamp(k));
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(k * 2);
  ctx.save(); ctx.shadowColor = hexA(color, 0.6); ctx.shadowBlur = 24; fillRR(ctx, x - w / 2, yBase - h, w, h, 14, color); ctx.restore();
  text(ctx, valStr, x, yBase - h - 40, { size: 54, weight: 900, color: '#ffffff' });
  text(ctx, label, x, yBase + 42, { size: 32, weight: 800, color: '#e2e8f0' });
  ctx.restore();
}
function etiquetaPrateleira(ctx, x, y, s, o = {}) { // etiqueta de gôndola com preço por litro
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s, s); ctx.globalAlpha *= o.alpha ?? 1;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 22; ctx.shadowOffsetY = 10; fillRR(ctx, -230, -110, 460, 220, 10, '#fde047'); ctx.restore();
  fillRR(ctx, -230, -110, 460, 52, 10, '#ca8a04'); ctx.fillStyle = '#ca8a04'; ctx.fillRect(-230, -80, 460, 22);
  text(ctx, o.nome || 'CERVEJA PILSEN LATA 350 ML', 0, -84, { size: 22, weight: 900, color: '#1c1917', letter: 1 });
  if (o.preco !== '') text(ctx, 'R$', -170, 6, { size: 34, weight: 900, color: '#1c1917' });
  text(ctx, o.preco ?? '4,00', 20, 8, { size: 104, weight: 900, color: '#1c1917' });
  fillRR(ctx, -210, 58, 420, 40, 8, '#1c1917');
  text(ctx, o.litro || 'PREÇO POR LITRO R$ 11,43', 0, 79, { size: 22, weight: 900, color: '#fde047', letter: 1 });
  if (o.hlLitro > 0) strokeRR(ctx, -218, 50, 436, 56, 10, P.red, 6, clamp(o.hlLitro));
  ctx.restore();
}
function copoIcone(ctx, x, y, s, fill, color) { // copo de vidro (pictograma), fill 0..1
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-40, -70); ctx.lineTo(40, -70); ctx.lineTo(32, 70); ctx.lineTo(-32, 70); ctx.closePath();
  ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fill(); ctx.strokeStyle = 'rgba(226,232,240,0.6)'; ctx.lineWidth = 4; ctx.stroke();
  if (fill > 0) { ctx.save(); ctx.clip(); const top = 70 - 140 * clamp(fill); ctx.fillStyle = color; ctx.fillRect(-45, top, 90, 150); ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.fillRect(-45, top - 10, 90, 12); ctx.restore(); }
  ctx.restore();
}
function documento(ctx, x, y, s, title, lines, k, o = {}) { // relatório de resultados (folha)
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y + (1 - ease.out(clamp(k))) * 80); ctx.rotate(o.rot || 0.03); ctx.scale(s, s); ctx.globalAlpha *= clamp(k * 2);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 14; ctx.fillStyle = '#f8fafc'; ctx.fillRect(-300, -380, 600, 760); ctx.restore();
  fillRR(ctx, -300, -380, 600, 90, 0, '#1e3a8a');
  text(ctx, title, 0, -335, { size: 30, weight: 900, color: '#ffffff', letter: 2 });
  lines.forEach(([a, b], i) => { const yy = -250 + i * 56; text(ctx, a, -260, yy, { size: 24, weight: 700, color: '#334155', align: 'left' }); if (b) text(ctx, b, 260, yy, { size: 26, weight: 900, color: '#0f172a', align: 'right' }); ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(-260, yy + 24, 520, 2); });
  ctx.restore();
}
function contaPapel(ctx, x, y, s, rowsK, rows, o = {}) { // "conta de padaria" a lápis num papel de pão
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.03); ctx.scale(s, s);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 26; ctx.shadowOffsetY = 12;
  const g = ctx.createLinearGradient(-330, -240, 330, 240); g.addColorStop(0, '#e9d8b4'); g.addColorStop(1, '#cdb88d'); ctx.fillStyle = g; ctx.fillRect(-330, -240, 660, 480); ctx.restore();
  ctx.strokeStyle = 'rgba(120,90,40,0.2)'; ctx.lineWidth = 2; for (let yy = -200; yy < 240; yy += 60) { ctx.beginPath(); ctx.moveTo(-300, yy); ctx.lineTo(300, yy); ctx.stroke(); }
  if (o.title) text(ctx, o.title, 0, -206, { size: 30, weight: 900, color: '#7c5a1e', letter: 3 });
  rows.forEach((str, i) => {
    const k = clamp(rowsK - i); if (k <= 0) return;
    ctx.save(); ctx.beginPath(); ctx.rect(-320, -230 + i * 120, 640 * k, 120); ctx.clip();
    text(ctx, str, -290, -170 + i * 120, { size: o.size || 52, weight: 800, color: i === rows.length - 1 ? '#1d4ed8' : '#2b2b2b', align: 'left' });
    ctx.restore();
  });
  ctx.restore();
}
function chip(ctx, x, y, str, color, k, o = {}) { // etiqueta arredondada que entra
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(k * 2); ctx.translate(x, y); const sc = lerp(0.6, 1, ease.back(clamp(k))); ctx.scale(sc, sc);
  ctx.font = font(o.size || 30, 900); const w = ctx.measureText(str).width + 50, h = (o.size || 30) * 1.7;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6; fillRR(ctx, -w / 2, -h / 2, w, h, h / 2, o.bg || '#0b1222'); ctx.restore();
  strokeRR(ctx, -w / 2, -h / 2, w, h, h / 2, color, 4);
  text(ctx, str, 0, 2, { size: o.size || 30, weight: 900, color: o.fg || color });
  ctx.restore();
}

// ================================================================ Cena 01: imposto novo, manchete e o "56%"
function scene01(K) {
  const tCarne = K('No vídeo da carne'), tCem = K('de cada cem reais de carne'), tSete = K('só uns sete são imposto'), tPega = K('Agora pega a cerveja');
  const tFev = K('Em fevereiro'), tNovo = K('ela ganha um imposto novo'), tVilao = K('com nome de vilão'), tPec = K('o imposto do pecado'), t42 = K('Quatro vírgula dois por cento');
  const tMan = K('E a manchete já saiu'), tMais = K('a cerveja vai ficar mais cara'), tVai = K('Vai mesmo'), tSe = K('E se não vai'), tSobe = K('por que ela já sobe');
  const t12 = K('Nos últimos doze meses'), t5 = K('a cerveja subiu quase cinco'), tInf = K('mais que a inflação');
  const tNum = K('E tem mais um número no ar'), t56 = K('o setor diz que cinquenta e seis'), tMet = K('Mais da metade'), tSera = K('Será');
  const tPra = K('Pra descobrir'), tAbrir = K('a gente vai abrir uma lata'), tGrao = K('do grão até a sua geladeira'), tCent = K('e ver quem fica com cada centavo');
  // estações no mundo: A carne (600), B lata (1400), C jornal (2500), D barras (3500), E 56% (4500)
  const cam = [
    { t: 0, x: 760, y: 520, z: 1.12, dx: 6 }, { t: tSete - 0.3, x: 820, y: 500, z: 1.18, d: 1.6 },
    { t: tPega - 0.2, x: 1240, y: 520, z: 1.0, d: 1.8, dz: 0.008 }, { t: tFev - 0.3, x: 1400, y: 470, z: 1.15, d: 1.6 },
    { t: tPec - 0.3, x: 1430, y: 500, z: 1.3, d: 1.3 }, { t: t42 - 0.2, x: 1500, y: 520, z: 1.12, d: 1.2, dx: 8 },
    { t: tMan - 0.4, x: 2500, y: 480, z: 1.05, d: 1.7 }, { t: tVai - 0.2, x: 2560, y: 470, z: 1.2, d: 1.3 },
    { t: tSobe - 0.4, x: 3500, y: 470, z: 1.0, d: 1.8 }, { t: tInf, x: 3520, y: 450, z: 1.1, d: 2 },
    { t: tNum - 0.3, x: 4500, y: 500, z: 0.95, d: 1.8 }, { t: t56 + 0.6, x: 4500, y: 480, z: 1.15, d: 2.4 }, { t: tSera - 0.2, x: 4520, y: 470, z: 1.3, d: 1.4 },
    { t: tPra - 0.05, x: 1400, y: 500, z: 1.4, d: 0.001 }, { t: tPra + 0.1, x: 1400, y: 520, z: 1.12, d: 2.2 },
    { t: tGrao - 0.3, x: 1600, y: 560, z: 0.95, d: 1.8, dx: 6 }, { t: tCent - 0.2, x: 1500, y: 520, z: 1.05, d: 1.6 },
  ];
  const sfx = [[tCem, 'pop', 0.5], [tSete, 'stamp', 0.5], [tPega - 0.2, 'whoosh', 0.4], [tPega + 0.4, 'clink', 0.4], [tFev, 'paper', 0.5],
    [tPec, 'stamp', 1.0], [t42, 'impact', 0.6], [tMan, 'paper', 0.7, { dur: 0.5 }], [tVai, 'pop', 0.6], [t5, 'tick', 0.4], [tInf, 'tick', 0.4],
    [t56 + 1.4, 'hit', 0.7], [tMet, 'liquid', 0.4, { dur: 1.2 }], [tSera, 'pop', 0.6], [tAbrir + 0.8, 'canopen', 1.0], [tAbrir + 1.0, 'fizz', 0.7, { dur: 1.6 }],
    ...[0, 1, 2, 3].map((i) => [tGrao + 0.2 + i * 0.35, 'pop', 0.4]), [tCent, 'coin', 0.6]];
  return {
    accent: P.beer, cam, sfx, impacts: [tPec, t56 + 1.4], trans: 'cut',
    draw(ctx, t, cam2) {
      geladeiraFundo(ctx, cam2, 0.9);
      mesaMadeira(ctx, 760, -600, 5600);
      // A: a carne do vídeo anterior
      zone(ctx, cam2, 500, 800, () => {
      tabuaCarne(ctx, 640, 690, 1);
      chip(ctx, 640, 470, 'R$ 100 de carne', '#e2e8f0', vis(t, tCem, tFev));
      chip(ctx, 640, 560, 'imposto: uns R$ 7', P.estado, vis(t, tSete, tFev), { size: 34 });
      });
      // B: a lata
      zone(ctx, cam2, 1300, 1800, () => {
      const pk = ease.out(prog(t, tPega, 0.9));
      const op = prog(t, tAbrir + 0.8, 0.25);
      lata(ctx, lerp(2000, 1400, pk), 590, 1.05, { t, rot: 0.08 * Math.sin(t * 0.25) + t * 0.01, open: op, foam: op * (1 - prog(t, tAbrir + 3, 1.5)) });
      if (t > tFev) { // calendário de fevereiro
        const k = vis(t, tFev, tMan, 0.6, 0.4);
        ctx.save(); ctx.globalAlpha *= k; ctx.translate(1110, lerp(220, 300, ease.out(k))); ctx.rotate(-0.05);
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 20; fillRR(ctx, -120, -110, 240, 230, 14, '#f8fafc'); ctx.restore();
        fillRR(ctx, -120, -110, 240, 66, 14, P.red); ctx.fillStyle = P.red; ctx.fillRect(-120, -64, 240, 20);
        text(ctx, 'FEVEREIRO', 0, -76, { size: 28, weight: 900, color: '#fff', letter: 2 }); text(ctx, '2', 0, 30, { size: 110, weight: 900, color: '#111827' }); text(ctx, '2027', 0, 96, { size: 24, weight: 800, color: '#6b7280' });
        ctx.restore();
      }
      if (t > tNovo) chip(ctx, 1720, 330, 'imposto novo', P.uniao, appear(t, tNovo, 0.5) * (1 - appear(t, tMan, 0.5)), { size: 32 });
      if (t > tVilao) cap(ctx, 'com nome de vilão...', 1720, 410, { size: 34, alpha: vis(t, tVilao, tPec + 0.3) });
      const bOut = 1 - appear(t, tMan, 0.5);
      rectStamp(ctx, 1460, 560, 520, 130, 'IMPOSTO DO PECADO', P.red, prog(t, tPec, 0.35) * bOut, -0.12, 50);
      bigNum(ctx, '4,2%', 1760, 760, appear(t, t42, 0.5) * bOut, { size: 110, color: '#fecaca', glow: hexA(P.red, 0.6) });
      });
      // C: a manchete
      zone(ctx, cam2, 2400, 2700, () => {
      jornal(ctx, 2500, 470, 0.95, prog(t, tMan, 0.7));
      if (t > tVai) { headline(ctx, 'VAI MESMO?', 2760, 690, { size: 76, color: '#fef08a', color2: '#facc15', k: appear(t, tVai, 0.4), rot: -0.05, hl: '#b91c1c' }); }
      if (t > tSe) cap(ctx, 'e se não vai...', 2500, 120, { size: 36, alpha: vis(t, tSe, tSobe) });
      });
      // D: cerveja x inflação (12 meses até julho)
      zone(ctx, cam2, 3350, 3650, () => {
      if (t > tSobe) headline(ctx, 'por que já sobe?', 3500, 140, { size: 62, k: appear(t, tSobe + 0.6, 0.5), color: '#fef08a', color2: '#facc15' });
      if (t > t12) {
        cap(ctx, 'alta de preço em 12 meses (até julho de 2026)', 3500, 215, { size: 32, alpha: appear(t, t12, 0.5) });
        barraComp(ctx, 3360, 680, 190, 340, 4.9, 5, P.beer, 'cerveja', '+4,9%', prog(t, t5, 0.9));
        barraComp(ctx, 3640, 680, 190, 340, 4.44, 5, '#94a3b8', 'inflação', '+4,4%', prog(t, tInf, 0.9));
      }
      });
      // E: o "56%"
      zone(ctx, cam2, 4300, 4700, () => {
      if (t > tNum) {
        cap(ctx, 'o setor diz:', 4500, 170, { size: 36, alpha: appear(t, tNum, 0.5) });
        const fillK = ease.inOut(prog(t, tMet, 1.4));
        lata(ctx, 4250, 560, 1.15, { t, plain: true, drops: true, bands: (c, x0, top, w, lh) => { const hh = (lh + 60) * 0.56 * fillK; c.fillStyle = hexA(P.uniao, 0.85); c.fillRect(x0, top + lh + 40 - hh, w, hh); } });
        bigNum(ctx, '56%', 4700, 470, appear(t, t56 + 1.3, 0.6), { size: 190, color: '#fecaca', glow: hexA(P.uniao, 0.7) });
        cap(ctx, 'do preço é imposto', 4700, 600, { size: 40, alpha: appear(t, t56 + 2.2, 0.5) });
        if (t > tMet) cap(ctx, 'mais da metade?', 4250, 300, { size: 40, color: '#fca5a5', alpha: appear(t, tMet, 0.4) });
        if (t > tSera) headline(ctx, 'SERÁ?', 4700, 680, { size: 96, color: '#fef08a', color2: '#facc15', k: appear(t, tSera, 0.4), rot: 0.04 });
      }
      });
      // F (volta para a lata): o caminho do grão até a geladeira
      zone(ctx, cam2, 1300, 1700, () => {
      if (t > tGrao) {
        const icons = [['grão', P.malte], ['fábrica', P.fabrica], ['caminhão', '#94a3b8'], ['geladeira', '#38bdf8']];
        icons.forEach(([s2, col], i) => chip(ctx, 1000 + i * 300, 200, s2, col, appear(t, tGrao + 0.2 + i * 0.35, 0.5), { size: 30 }));
        for (let i = 0; i < 3; i++) arrow(ctx, 1090 + i * 300, 200, 1210 + i * 300, 200, '#64748b', 5, prog(t, tGrao + 0.4 + i * 0.35, 0.3));
      }
      if (t > tCent) headline(ctx, 'quem fica com cada centavo?', 1500, 920 - 160, { size: 58, k: appear(t, tCent, 0.5), hl: '#1e3a8a' });
      });
      bokeh(ctx, cam2, t, 3, 12);
    },
    overlay(ctx, t) {
      source(ctx, 'Safra (IPCA, jul/2026); Sindcerv (abr/2026)', vis(t, t12, tPra, 0.5, 0.4));
    },
  };
}

// ================================================================ Cena 02: o que tem dentro da lata (malte e alumínio em dólar)
const ALU = [['jan', 3000], ['fev', 3260], ['mar', 3340], ['abr', 3120], ['mai', 3220], ['jun', 3500], ['jul', 3290], ['ago', 3380], ['set', 3160], ['out', 3090], ['nov', 3065]];
function scene02(K) {
  const tDentro = K('Começa pelo que tem dentro'), t350 = K('Uma lata tem trezentos e cinquenta'), tAgua = K('e quase tudo é água'), tMalte = K('O resto é malte'), tCev = K('que é cevada germinada');
  const tLup = K('um pouco de lúpulo'), tAmargo = K('que dá o amargo'), tFerm = K('e fermento'), tSimples = K('Parece simples'), tFrio = K('Mas a cevada é um grão'), tPlanta = K('e o Brasil não planta');
  const tMetade = K('Até metade da cevada'), tArg = K('e o maior fornecedor'), tDol = K('Paga em dólar'), tLata = K('E tem a própria lata'), tAlu = K('Ela é de alumínio'), tOutro = K('outro produto com preço em dólar');
  const tFevMar = K('Em fevereiro e março deste ano'), tGuerra = K('com a guerra no Oriente Médio'), tDisp = K('o alumínio disparou'), tJun = K('Em junho'), tMaior = K('chegou ao maior preço');
  const tOuSeja = K('Ou seja'), tAntes = K('antes de qualquer imposto'), tPedaco = K('a sua cerveja já vem com um pedaço'), tPouca = K('E não é pouca lata'), tTerc = K('O Brasil é o terceiro maior'), t35 = K('quase trinta e cinco bilhões');
  // estações: 1 lata em corte (900), 2 saco de malte (2300), 3 alumínio + painel (3700), 4 dólar dentro (900 volta), 5 parede de latas (5100)
  const cam = [
    { t: 0, x: 900, y: 520, z: 0.95, dz: 0.008 }, { t: t350 - 0.2, x: 860, y: 520, z: 1.2, d: 1.6 }, { t: tMalte - 0.3, x: 980, y: 520, z: 1.12, d: 1.6, dx: 5 },
    { t: tFerm, x: 1000, y: 540, z: 1.05, d: 1.4 }, { t: tFrio - 0.4, x: 2300, y: 520, z: 1.0, d: 1.8 }, { t: tMetade - 0.2, x: 2360, y: 500, z: 1.18, d: 1.6 },
    { t: tArg, x: 2500, y: 470, z: 1.1, d: 1.6, dx: -5 }, { t: tDol - 0.2, x: 2440, y: 520, z: 1.22, d: 1.0 },
    { t: tLata - 0.3, x: 3300, y: 520, z: 1.25, d: 1.6 }, { t: tOutro, x: 3380, y: 520, z: 1.1, d: 1.4 }, { t: tFevMar - 0.3, x: 3950, y: 480, z: 0.98, d: 1.7 },
    { t: tDisp, x: 3980, y: 470, z: 1.06, d: 1.6 }, { t: tMaior, x: 4100, y: 460, z: 1.14, d: 1.6 },
    { t: tOuSeja - 0.3, x: 3400, y: 520, z: 1.0, d: 1.8, dz: 0.01 }, { t: tPedaco, x: 3380, y: 540, z: 1.25, d: 2 },
    { t: tPouca - 0.4, x: 5100, y: 500, z: 1.3, d: 1.6 }, { t: tTerc, x: 5100, y: 500, z: 0.95, d: 3 }, { t: t35, x: 5100, y: 480, z: 0.9, d: 2.4 },
  ];
  const sfx = [[t350, 'liquid', 0.5, { dur: 1.6 }], [tAgua, 'water', 0.25, { dur: 1 }], [tMalte, 'pop', 0.5], [tLup, 'pop', 0.5], [tFerm, 'pop', 0.5], [tFrio, 'wind', 0.25, { dur: 1.4 }],
    [tMetade, 'paper', 0.4], [tMetade + 0.6, 'drop', 0.5], [tArg, 'stamp', 0.6], [tDol, 'coin', 0.7], [tAlu, 'clank', 0.6], [tOutro, 'coin', 0.5],
    [tGuerra, 'horn', 0.35], [tDisp, 'riser', 0.5, { dur: 1.2 }], [tMaior, 'hit', 0.6], [tPedaco, 'coin', 0.6], [tTerc, 'pop', 0.5], [t35, 'cash', 0.6]];
  return {
    accent: P.malte, cam, sfx, impacts: [tMaior], trans: 'push',
    draw(ctx, t, cam2) {
      geladeiraFundo(ctx, cam2, 0.55);
      mesaMadeira(ctx, 790, -600, 6400);
      // 1: a lata em corte (metade transparente mostrando o líquido) e as camadas ao lado
      zone(ctx, cam2, 760, 1150, () => {
      const cut = appear(t, tDentro, 0.8);
      lata(ctx, 760, 560, 1.15, { t, rot: t * 0.02, bands: (c, x0, top, w, lh) => { if (cut <= 0) return; c.save(); c.globalAlpha *= cut; c.fillStyle = 'rgba(10,14,22,0.82)'; c.fillRect(x0, top - 60, w, lh + 120); const lev = top + 10; const g = c.createLinearGradient(0, lev, 0, top + lh + 60); g.addColorStop(0, '#fcd34d'); g.addColorStop(1, '#d97706'); c.fillStyle = g; c.fillRect(x0 + 12, lev, w - 24, lh + 40); c.fillStyle = P.foam; c.fillRect(x0 + 12, lev - 14, w - 24, 16); const r = rng(4); c.fillStyle = 'rgba(255,255,255,0.5)'; for (let i = 0; i < 30; i++) { const bx = x0 + 20 + r() * (w - 40), by = top + lh + 40 - ((t * 60 + r() * 400) % (lh + 20)); c.beginPath(); c.arc(bx, by, 2 + r() * 2, 0, 6.283); c.fill(); } c.restore(); } });
      if (t > t350) chip(ctx, 760, 210, '350 ml', '#e2e8f0', appear(t, t350, 0.5), { size: 36 });
      // copo medidor com as camadas: água quase tudo
      const cx = 1150, base = 760, Hh = 480;
      const lay = [['água', '#38bdf8', 0.9, tAgua], ['malte', '#d97706', 0.07, tMalte], ['lúpulo', '#65a30d', 0.015, tLup], ['fermento', '#e7d8b0', 0.015, tFerm]];
      if (t > tAgua - 0.2) {
        ctx.save(); ctx.globalAlpha *= appear(t, tAgua - 0.2, 0.5);
        strokeRR(ctx, cx - 90, base - Hh, 180, Hh, 16, 'rgba(226,232,240,0.6)', 4);
        let acc = 0;
        lay.forEach(([nm, col, f, tc]) => { const k = ease.out(prog(t, tc, 0.8)); const h = Hh * f * k; if (h <= 0) return; ctx.fillStyle = col; ctx.fillRect(cx - 86, base - acc - h, 172, h); acc += h; });
        ctx.restore();
        lay.forEach(([nm, col, , tc], i) => { if (t > tc) chip(ctx, cx + 260, base - 400 + i * 100, nm, col, appear(t, tc, 0.4), { size: 30 }); });
        if (t > tCev) cap(ctx, 'cevada germinada e seca no forno', 1250, 140, { size: 32, alpha: vis(t, tCev, tLup + 1.2) });
        if (t > tAmargo) cap(ctx, 'dá o amargo', cx + 470, base - 300, { size: 26, alpha: vis(t, tAmargo, tSimples + 1) });
        if (t > tSimples) headline(ctx, 'parece simples', 1000, 160, { size: 54, k: vis(t, tSimples, tFrio + 0.5) });
      }
      });
      // 2: o saco de malte importado
      zone(ctx, cam2, 2250, 2550, () => {
      sacoMalte(ctx, 2250, 520, 0.95, { rot: -0.03 });
      graos(ctx, 2250, 800, 140, 520, 7, appear(t, tFrio - 1, 1));
      if (t > tFrio) cap(ctx, 'a cevada é grão de clima frio', 2300, 150, { size: 34, alpha: vis(t, tFrio, tMetade + 0.3) });
      if (t > tPlanta) chip(ctx, 2620, 260, 'o Brasil não planta o suficiente', '#e2e8f0', vis(t, tPlanta, tMetade - 0.1, 0.4, 0.3), { size: 28 });
      if (t > tMetade) { // metade dos grãos com etiqueta "de fora"
        const k = appear(t, tMetade, 0.6);
        chip(ctx, 2620, 300, 'até metade vem de fora', P.estado, k, { size: 32 });
      }
      if (t > tArg) { chip(ctx, 2620, 400, 'maior fornecedor: Argentina', '#7dd3fc', appear(t, tArg, 0.5), { size: 30 }); }
      if (t > tDol) { moeda(ctx, 2590, 600, 70 * ease.back(clamp(prog(t, tDol, 0.5))), { label: 'US$', prata: true }); cap(ctx, 'paga em dólar', 2590, 710, { size: 34, color: P.dolar, alpha: appear(t, tDol, 0.4) }); }
      });
      // 3: o alumínio (lata sem rótulo) e o painel de cotação
      zone(ctx, cam2, 3300, 4100, () => {
      lata(ctx, 3300, 560, 1.1, { t, plain: true, drops: false, rot: 0 });
      if (t > tAlu) chip(ctx, 3300, 170, 'alumínio', '#e2e8f0', vis(t, tAlu, tFevMar - 0.6), { size: 36 });
      if (t > tOutro) chip(ctx, 3300, 250, 'preço em dólar', P.dolar, vis(t, tOutro, tFevMar - 0.6), { size: 30 });
      if (t > tFevMar - 0.4) {
        painelCotacao(ctx, 3600, 170, 980, 560, {
          title: 'ALUMÍNIO EM 2026', unit: 'US$ por tonelada', pts: ALU, lo: 2800, hi: 3850, color: '#e2e8f0', alpha: vis(t, tFevMar - 0.4, tOuSeja - 0.5, 0.6, 0.5),
          k: ease.inOut(prog(t, tFevMar, 7.5)), band: [1, 2, 'Ormuz'], bandK: appear(t, tGuerra, 0.6),
          marks: [{ i: 5, s: 'US$ 3.500 · maior em 4 anos', k: appear(t, tMaior, 0.5), color: '#fca5a5', dy: -60 }, { i: 10, s: 'nov: 3.065', k: appear(t, tMaior + 1.5, 0.5), dy: -60 }],
        });
        if (t > tGuerra) { // navios parados no estreito
          ctx.save(); ctx.globalAlpha *= vis(t, tGuerra, tJun + 0.5);
          for (let i = 0; i < 4; i++) { const sx = 3700 + i * 70, sy = 800; fillRR(ctx, sx, sy, 56, 16, 4, '#64748b'); fillRR(ctx, sx + 6, sy - 14, 22, 14, 2, '#94a3b8'); }
          cap(ctx, 'navios travados no estreito de Ormuz', 4100, 750, { size: 28 }); ctx.restore();
        }
      }
      });
      // 4: o pedaço do dólar dentro da lata
      zone(ctx, cam2, 3300, 3400, () => {
      if (t > tAntes) {
        const k = ease.out(prog(t, tAntes, 1.2));
        ctx.save(); ctx.globalAlpha *= appear(t, tAntes, 0.5);
        lata(ctx, 3300, 560, 1.1, { t, rot: 0.15, bands: (c, x0, top, w, lh) => { c.fillStyle = hexA(P.dolar, 0.82); c.fillRect(x0, top, w * 0.32 * k, lh); } });
        ctx.restore();
        if (t > tPedaco) chip(ctx, 3300, 860 - 120, 'um pedaço é dólar', P.dolar, appear(t, tPedaco, 0.4), { size: 32 });
      }
      });
      // 5: a parede de latas
      zone(ctx, cam2, 5100, 5100, () => {
      if (t > tPouca - 0.6) {
        const k = prog(t, tPouca - 0.6, 6);
        const r = rng(9);
        for (let row = 0; row < 7; row++) for (let c = 0; c < 22; c++) {
          const i = row * 22 + c; if (i / 154 > k) continue;
          lata(ctx, 4100 + c * 92 - (row % 2) * 46, 820 - row * 130, 0.3, { t, drops: false, rot: r(), label: r() > 0.85 ? 'zero' : 'pilsen' });
        }
        if (t > tTerc) { const tk = appear(t, tTerc, 0.5); fillRR(ctx, 4700, 60, 800, 130, 22, 'rgba(11,18,34,0.9)', tk); text(ctx, '3º maior mercado de latinhas do mundo', 5100, 125, { size: 34, weight: 900, color: '#e2e8f0', alpha: tk }); }
        if (t > t35) { fillRR(ctx, 4700, 470, 800, 200, 26, 'rgba(11,18,34,0.92)', appear(t, t35, 0.4)); bigNum(ctx, `${counting(t, t35, 1.6, 0, 34.8).toFixed(1).replace('.', ',')} bilhões`, 5100, 550, appear(t, t35, 0.4), { size: 92, color: '#fef3c7', glow: hexA(P.beer, 0.5) }); cap(ctx, 'de latas vendidas em 2024', 5100, 630, { size: 30, alpha: appear(t, t35 + 0.4, 0.4) }); }
      }
      });
      bokeh(ctx, cam2, t, 7, 10);
    },
    overlay(ctx, t) {
      source(ctx, 'Gazeta do Povo (out/2026); Trading Economics', vis(t, tMetade, tLata, 0.5, 0.4));
      source(ctx, 'LME via Trading Economics e Investing; linha aproximada', vis(t, tFevMar, tOuSeja, 0.5, 0.4));
      source(ctx, 'Abralatas (2024)', vis(t, tTerc, 99, 0.5, 0.4));
    },
  };
}

// ================================================================ Cena 03: a fábrica e a conta de padaria
function esteira(ctx, t, x0, x1, y, speed = 120) { // esteira com latas passando
  fillRR(ctx, x0, y, x1 - x0, 34, 10, '#1f2937'); ctx.fillStyle = '#374151';
  const off = (t * speed) % 60; for (let x = x0 - 60 + off; x < x1; x += 60) ctx.fillRect(x, y + 6, 30, 6);
  for (let x = x0 - 140 + ((t * speed) % 140); x < x1; x += 140) lata(ctx, x, y - 64, 0.34, { t, drops: false, rot: x * 0.001 });
  for (let x = x0 + 40; x < x1; x += 260) { fillRR(ctx, x, y + 34, 18, 200, 4, '#111827'); }
}
function scene03(K) {
  const tFab = K('a fábrica'), tMaior = K('A maior cervejaria do país'), tPub = K('Ela publica as contas'), tPad = K('e dá pra fazer uma conta de padaria');
  const tTri = K('No segundo trimestre'), tSem = K('já sem os impostos'), t465 = K('ela recebeu em média'), t160 = K('Isso dá uns um real e sessenta'), tMedia = K('Só que essa é a média de tudo');
  const tRet = K('garrafa retornável'), tBar = K('barril de chope'), tLit = K('litrão'), tBarato = K('que saem mais baratos'), tCara = K('A lata é a embalagem mais cara');
  const tConta = K('Na nossa conta'), t4 = K('de uma lata de quatro reais no mercado'), t2 = K('uns dois reais ficam com a cervejaria'), tPaga = K('É com esse dinheiro');
  const tAlu = K('o alumínio'), tAgua = K('a água'), tEn = K('a energia'), tCam = K('o caminhão'), tPes = K('as pessoas e a propaganda');
  const tLucro = K('E o lucro'), t3t = K('No terceiro trimestre'), t44 = K('a empresa lucrou'), t20 = K('Dá uns vinte centavos'), tSua = K('Na sua lata'), t40 = K('uns quarenta centavos');
  // estações: fábrica (960), papel da conta (2300), embalagens (3600), moedas da cervejaria (4900), lucro (6100)
  const cam = [
    { t: 0, x: 860, y: 480, z: 0.92, dx: 10 }, { t: tMaior, x: 960, y: 470, z: 1.05, d: 2 }, { t: tPub - 0.2, x: 1500, y: 470, z: 1.1, d: 1.6 },
    { t: tPad - 0.2, x: 2300, y: 500, z: 1.05, d: 1.6 }, { t: t465, x: 2280, y: 500, z: 1.16, d: 2 }, { t: t160, x: 2320, y: 540, z: 1.24, d: 1.6 },
    { t: tMedia - 0.3, x: 3600, y: 500, z: 1.12, d: 1.8, dx: 6 }, { t: tBarato, x: 3700, y: 480, z: 1.18, d: 1.6 }, { t: tCara - 0.2, x: 3800, y: 480, z: 1.16, d: 1.6 },
    { t: tConta - 0.3, x: 4700, y: 480, z: 1.1, d: 1.8 }, { t: t2, x: 4800, y: 480, z: 1.15, d: 1.6 }, { t: tPaga, x: 5100, y: 480, z: 1.08, d: 2.4, dx: 5 },
    { t: tLucro - 0.3, x: 6100, y: 500, z: 1.06, d: 1.7 }, { t: t44, x: 6100, y: 480, z: 1.15, d: 2 }, { t: t20, x: 6150, y: 500, z: 1.05, d: 1.6 }, { t: t40 - 0.2, x: 6250, y: 520, z: 1.18, d: 1.4 },
  ];
  const sfx = [[tFab, 'clank', 0.5], [tMaior, 'pop', 0.4], ...[0, 1, 2, 3, 4, 5].map((i) => [tMaior + 2 + i * 0.25, 'tick', 0.35]), [tPub, 'paper', 0.6], [tPad, 'chalk', 0.35, { dur: 1.4 }],
    [t465 + 2, 'chalk', 0.35, { dur: 1.4 }], [t160, 'coin', 0.6], [tRet, 'clink', 0.5], [tBar, 'clank', 0.4], [tLit, 'clink', 0.45, { p: 0.85 }], [tCara, 'hit', 0.5],
    [t4, 'cash', 0.5], [t2, 'coin', 0.6], ...[tPaga + 1.2, tAlu, tAgua, tEn, tCam, tPes].map((x) => [x, 'pop', 0.4]), [tLucro, 'pop', 0.5], [t44, 'cash', 0.6], [t20, 'coin', 0.5], [t40, 'coin', 0.7]];
  return {
    accent: P.fabrica, cam, sfx, impacts: [tCara, t40], trans: 'push',
    draw(ctx, t, cam2) {
      // fundo: galpão da fábrica com tanques (paralaxe)
      layer(ctx, cam2, 0.4, () => {
        const g = ctx.createLinearGradient(0, -200, 0, 1200); g.addColorStop(0, '#0b1426'); g.addColorStop(1, '#060a14'); ctx.fillStyle = g; ctx.fillRect(-600, -300, 8400, 1600);
        for (let i = 0; i < 18; i++) { const x = -200 + i * 420; const tg = ctx.createLinearGradient(x, 0, x + 220, 0); tg.addColorStop(0, '#334155'); tg.addColorStop(0.4, '#94a3b8'); tg.addColorStop(1, '#1e293b'); ctx.fillStyle = tg; ctx.globalAlpha = 0.45; rr(ctx, x, 80, 220, 600, 100); ctx.fill(); ctx.globalAlpha = 1; }
      });
      esteira(ctx, t, -300, 7000, 860);
      // 6 de cada 10 litros
      zone(ctx, cam2, 900, 1560, () => {
      if (t > tFab) headline(ctx, 'a fábrica', 960, 300, { size: 80, k: vis(t, tFab, tMaior, 0.5, 0.3) });
      if (t > tMaior) {
        cap(ctx, 'a maior cervejaria vende', 960, 170, { size: 34, alpha: appear(t, tMaior, 0.5) });
        for (let i = 0; i < 10; i++) copoIcone(ctx, 600 + i * 80, 380, 0.7, i < 6 ? ease.out(prog(t, tMaior + 2 + i * 0.25, 0.5)) : 0.0, P.beer);
        headline(ctx, '6 de cada 10 litros', 960, 560, { size: 66, k: vis(t, tMaior + 3.6, tPad - 0.7, 0.5, 0.3), color: '#ffffff', color2: '#cbd5e1' });
      }
      documento(ctx, 1560, 470, 0.72, 'RESULTADO 2º TRI 2026', [['Volume de cerveja', ''], ['Receita líquida', ''], ['por hectolitro', 'R$ 465,5'], ['Custo do produto', ''], ['Lucro', '']], appear(t, tPub, 0.7), { rot: 0.04 });
      });
      // a conta de padaria (papel de pão)
      zone(ctx, cam2, 2300, 2300, () => {
      if (t > tPad - 0.4) {
        const rows = ['100 litros  =  R$ 465', '100 litros  =  285 latas', 'R$ 465 ÷ 285  =  R$ 1,63'];
        const rk = t < t465 ? 0 : t < t465 + 2 ? prog(t, t465, 1.4) : t < t160 ? 1 + prog(t, t465 + 2, 1.4) : 2 + prog(t, t160, 1.4);
        contaPapel(ctx, 2300, 500, 0.95, rk, rows, { title: 'CONTA DE PADARIA' });
        if (t > tSem) chip(ctx, 2560, 200, 'já sem os impostos', P.estado, vis(t, tSem, tMedia + 0.4), { size: 28 });
        if (t > tTri) chip(ctx, 2060, 200, '2º trimestre de 2026', '#e2e8f0', vis(t, tTri, tMedia + 0.4), { size: 26 });
        if (t > t160) headline(ctx, 'uns R$ 1,60 por lata', 2300, 830 - 60, { size: 54, k: appear(t, t160 + 1.2, 0.5), hl: '#1d4ed8' });
      }
      });
      // embalagens: a média mistura tudo
      zone(ctx, cam2, 3600, 3900, () => {
      if (t > tMedia - 0.4) {
        const a = appear(t, tMedia - 0.4, 0.6);
        ctx.save(); ctx.globalAlpha *= a;
        cap(ctx, 'a média de tudo', 3600, 150, { size: 36 });
        garrafa(ctx, 3250, 560, 1.0, { alpha: appear(t, tRet, 0.4) });
        barril(ctx, 3550, 580, 0.95, { alpha: appear(t, tBar, 0.4) });
        garrafa(ctx, 3840, 560, 1.0, { litrao: true, ml: '1 litro', alpha: appear(t, tLit, 0.4) });
        lata(ctx, 4130, 590, 0.95, { t, alpha: appear(t, tCara - 0.3, 0.4) });
        [[3250, 'retornável', tRet], [3550, 'barril', tBar], [3840, 'litrão', tLit], [4130, 'lata', tCara]].forEach(([x, nm, tc]) => cap(ctx, nm, x, 330, { size: 30, alpha: appear(t, tc, 0.4) }));
        if (t > tBarato) chip(ctx, 3550, 220, 'mais baratas por litro', P.ok, vis(t, tBarato, tConta), { size: 30 });
        if (t > tCara) { ctx.save(); ctx.strokeStyle = P.beer; ctx.lineWidth = 6; ctx.globalAlpha *= appear(t, tCara, 0.4); ctx.beginPath(); ctx.ellipse(4130, 590, 150, 250, 0, 0, 6.283); ctx.stroke(); ctx.restore(); headline(ctx, 'a mais cara', 4130, 140 + 70, { size: 54, k: appear(t, tCara, 0.4), hl: '#b45309' }); }
        ctx.restore();
      }
      });
      // os R$ 2,00 da cervejaria e o que eles pagam
      zone(ctx, cam2, 4700, 5300, () => {
      if (t > tConta - 0.4) {
        const a = appear(t, tConta - 0.4, 0.6);
        ctx.save(); ctx.globalAlpha *= a;
        etiquetaPrateleira(ctx, 4520, 440, 0.95, { litro: 'NO MERCADO', alpha: appear(t, t4, 0.5) });
        cap(ctx, 'na nossa conta', 4520, 250, { size: 34 });
        const nc = Math.round(10 * ease.out(prog(t, t2, 1.2)));
        pilha(ctx, 4980, 720, nc, 80, null);
        if (t > t2) { bigNum(ctx, 'R$ 2,00', 4980, 330, appear(t, t2, 0.5), { size: 100, color: P.fabricaL, glow: hexA(P.fabrica, 0.6) }); cap(ctx, 'ficam com a cervejaria', 4980, 420, { size: 34, alpha: appear(t, t2 + 0.3, 0.4) }); }
        const items = [['malte', tPaga + 1.2], ['alumínio', tAlu], ['água', tAgua], ['energia', tEn], ['caminhão', tCam], ['pessoas', tPes], ['propaganda', tPes + 0.8]];
        cap(ctx, 'paga:', 5400, 250, { size: 32, alpha: appear(t, tPaga, 0.4) });
        items.forEach(([nm, tc], i) => chip(ctx, 5420 + (i % 2) * 230, 330 + Math.floor(i / 2) * 95, nm, P.fabricaL, appear(t, tc, 0.4), { size: 30 }));
        ctx.restore();
      }
      });
      // o lucro
      zone(ctx, cam2, 6100, 6250, () => {
      if (t > tLucro - 0.3) {
        const a = appear(t, tLucro - 0.3, 0.5);
        ctx.save(); ctx.globalAlpha *= a;
        headline(ctx, 'E o lucro?', 6100, 160, { size: 62, k: appear(t, tLucro, 0.4) });
        if (t > t3t) chip(ctx, 6100, 260, '3º trimestre de 2026', '#e2e8f0', appear(t, t3t, 0.4), { size: 28 });
        if (t > t44) bigNum(ctx, 'R$ 4,4 bilhões', 6100, 380, appear(t, t44, 0.5), { size: 88, color: '#dbeafe', glow: hexA(P.fabrica, 0.6) });
        if (t > t20) { // moeda de R$ 1 com a fatia de 20 centavos
          const k = ease.out(prog(t, t20, 1)); moeda(ctx, 5850, 540, 100, { label: 'R$ 1' });
          ctx.save(); ctx.fillStyle = hexA(P.lucro, 0.85); ctx.beginPath(); ctx.moveTo(5850, 540); ctx.arc(5850, 540, 94, -Math.PI / 2, -Math.PI / 2 + 6.283 * 0.2 * k); ctx.closePath(); ctx.fill(); ctx.restore();
          cap(ctx, 'uns 20 centavos de cada real', 5850, 680, { size: 30, alpha: appear(t, t20 + 0.5, 0.4) });
        }
        if (t > tSua) { lata(ctx, 6340, 560, 0.7, { t, alpha: appear(t, tSua, 0.4) }); }
        if (t > t40) { chip(ctx, 6640, 520, 'R$ 0,40 na sua lata', P.lucro, appear(t, t40, 0.4), { size: 34 }); }
        ctx.restore();
      }
      });
      bokeh(ctx, cam2, t, 11, 8, '#bfdbfe', 0.12);
    },
    overlay(ctx, t) {
      source(ctx, 'Ambev (2º e 3º tri de 2026) via Valor e InfoMoney; conta do canal', vis(t, tMaior, 99, 0.5, 0.4));
    },
  };
}

// ================================================================ Cena 04: o imposto que viaja na frente (ICMS-ST e a tabela do estado)
function geladeiraMercado(ctx, x, y, s, t) { // geladeira vertical do mercado, com latas
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 40; fillRR(ctx, -220, -420, 440, 840, 24, '#1f2937'); ctx.restore();
  fillRR(ctx, -196, -396, 392, 760, 14, '#0c1a2e');
  const lg = ctx.createLinearGradient(0, -396, 0, -300); lg.addColorStop(0, 'rgba(190,225,255,0.5)'); lg.addColorStop(1, 'rgba(190,225,255,0)'); ctx.fillStyle = lg; ctx.fillRect(-196, -396, 392, 120);
  for (let r2 = 0; r2 < 4; r2++) { ctx.fillStyle = 'rgba(200,220,255,0.25)'; ctx.fillRect(-196, -220 + r2 * 180, 392, 6); for (let c = 0; c < 4; c++) lata(ctx, -140 + c * 94, -270 + r2 * 180, 0.24, { t, drops: false, rot: c * 0.2 }); }
  ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.beginPath(); ctx.moveTo(-196, -396); ctx.lineTo(-60, -396); ctx.lineTo(-196, 100); ctx.closePath(); ctx.fill();
  fillRR(ctx, 170, -60, 14, 160, 6, '#94a3b8');
  ctx.restore();
}
function scene04(K) {
  const tDa = K('Da fábrica'), tDist = K('a lata vai pro distribuidor'), tMerc = K('depois pro mercado'), tGel = K('e só então pra geladeira'), tDet = K('E aqui tem um detalhe');
  const tImp = K('O imposto do estado'), tIcms = K('o ICMS'), tCaixa = K('não é cobrado no caixa'), tAtras = K('Ele é cobrado lá atrás'), tSaida = K('na saída da fábrica'), tVez = K('de uma vez só'), tCadeia = K('pela cadeia inteira');
  const tComo = K('Mas como a fábrica sabe'), tPesq = K('O estado pesquisa'), tTab = K('Os estados publicam uma tabela'), tMarca = K('marca por marca'), tLataL = K('lata por lata'), tCalc = K('E o imposto é calculado');
  const tAntes = K('o governo cobra o imposto'), tAcha = K('com base no preço que ele acha');
  const tSP = K('Em São Paulo'), t20 = K('o ICMS da cerveja é de uns vinte'), tAlg = K('Em alguns estados'), t25 = K('passa de vinte e cinco'), t4 = K('Na lata de quatro reais'), t80 = K('uns oitenta centavos pro estado');
  const tFed = K('E ainda tem os impostos federais'), tNaFab = K('cobrados na fábrica'), tIPI = K('o IPI'), tPis = K('o PIS e a Cofins'), tJuntos = K('Juntos'), t40 = K('mais uns quarenta centavos');
  // estrada: fábrica 500, distribuidor 1900, mercado 3300 (caixa em 3300), geladeira 4300; Diário (5600); mapa (7000); moedas (8400)
  const truckX = (t) => {
    if (t < tDa) return 420;
    if (t < tGel + 1.5) return lerp(420, 3900, ease.inOut(prog(t, tDa, tGel + 1.5 - tDa)));
    if (t < tAtras) return lerp(3900, 5600, ease.in(prog(t, tGel + 1.5, 2.5))); // segue viagem e sai de cena
    if (t < tSaida + 0.5) return 620; // a câmera volta à saída da fábrica: o caminhão aparece de novo no portão
    return lerp(620, 900, ease.inOut(prog(t, tVez, 3)));
  };
  const cam = [
    { t: 0, x: 600, y: 500, z: 1.0 }, { t: tDa + 0.3, x: 1900, y: 500, z: 0.95, d: tMerc - tDa + 0.4 }, { t: tMerc + 0.6, x: 3400, y: 500, z: 0.95, d: tGel - tMerc + 0.6 },
    { t: tGel + 0.4, x: 4300, y: 480, z: 1.05, d: 1.8 }, { t: tDet - 0.2, x: 3300, y: 520, z: 1.15, d: 1.6 }, { t: tCaixa - 0.2, x: 3300, y: 560, z: 1.3, d: 1.4 },
    { t: tAtras - 0.1, x: 700, y: 500, z: 1.2, d: 0.001 }, { t: tAtras + 0.1, x: 760, y: 560, z: 1.25, d: 2.2, dx: 6 },
    { t: tComo - 0.2, x: 760, y: 480, z: 1.0, d: 2 }, { t: tPesq - 0.15, x: 5600, y: 500, z: 1.0, d: 0.001 }, { t: tPesq, x: 5600, y: 480, z: 1.2, d: 2.4 }, { t: tMarca, x: 5600, y: 500, z: 1.32, d: 2 },
    { t: tCalc, x: 5640, y: 470, z: 1.4, d: 2 }, { t: tAntes - 0.3, x: 5550, y: 500, z: 1.05, d: 1.8, dx: 6 },
    { t: tSP - 0.4, x: 7000, y: 480, z: 1.0, d: 1.6 }, { t: t20, x: 7080, y: 560, z: 1.15, d: 2 }, { t: t25, x: 7180, y: 460, z: 1.12, d: 1.8 },
    { t: t4 - 0.3, x: 8380, y: 540, z: 1.3, d: 1.7 }, { t: tFed - 0.2, x: 8560, y: 520, z: 1.25, d: 1.8, dx: 4 }, { t: tJuntos, x: 8620, y: 540, z: 1.35, d: 1.4 },
  ];
  const sfx = [[tDa, 'truck', 0.5, { dur: tGel - tDa + 1.6 }], [tDist, 'pop', 0.4], [tMerc, 'pop', 0.4], [tGel, 'coldDoor', 0.35], [tDet, 'pop', 0.5],
    [tIcms, 'pop', 0.5], [tCaixa, 'scan', 0.7], [tCaixa + 0.6, 'buzz', 0.35], [tSaida, 'paper', 0.5], [tVez + 0.4, 'stamp', 0.9], [tCadeia, 'whoosh', 0.3],
    [tPesq, 'paper', 0.6, { dur: 0.5 }], [tMarca, 'tick', 0.4], [tLataL, 'tick', 0.4], [tCalc, 'pop', 0.5], [tAntes, 'hit', 0.5],
    [t20, 'stamp', 0.6], [t25, 'stamp', 0.6], [t80, 'coin', 0.7], [tIPI, 'pop', 0.5], [tPis, 'pop', 0.5], [t40, 'coin', 0.7]];
  return {
    accent: P.estado, cam, sfx, impacts: [tVez + 0.4, tAntes], trans: 'push',
    draw(ctx, t, cam2) {
      // céu e estrada
      layer(ctx, cam2, 0.3, () => { const g = ctx.createLinearGradient(0, -300, 0, 900); g.addColorStop(0, '#0b1730'); g.addColorStop(1, '#1b2a4a'); ctx.fillStyle = g; ctx.fillRect(-800, -400, 11000, 1500); for (let i = 0; i < 40; i++) { ctx.fillStyle = 'rgba(30,41,59,0.9)'; const x = -600 + i * 280, h = 160 + (i * 97) % 220; ctx.fillRect(x, 700 - h, 200, h); } });
      ctx.fillStyle = '#111827'; ctx.fillRect(-800, 760, 10800, 400); ctx.fillStyle = '#facc15'; for (let x = -800; x < 10000; x += 160) ctx.fillRect(x, 850, 80, 8);
      predio(ctx, 420, 760, 560, 380, 'fabrica'); predio(ctx, 1900, 760, 520, 300, 'distribuidor'); predio(ctx, 3500, 760, 900, 340, 'mercado');
      geladeiraMercado(ctx, 4300, 520, 0.62, t);
      // o caixa do mercado
      zone(ctx, cam2, 3300, 3300, () => {
      const cxK = appear(t, tDet - 0.3, 0.5);
      if (cxK > 0) { ctx.save(); ctx.globalAlpha *= cxK; ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 30; fillRR(ctx, 2930, 280, 440, 520, 24, '#0f172a'); ctx.restore(); strokeRR(ctx, 2930, 280, 440, 520, 24, '#334155', 3); text(ctx, 'CAIXA DO MERCADO', 3150, 316, { size: 24, weight: 900, color: '#94a3b8', letter: 3 }); ctx.restore(); }
      impressoraCaixa(ctx, 3150, 400, 0.7 * cxK);
      if (t > tCaixa) { cupom(ctx, 3150, 400, 0.72, cupomLinhas(), 12, {}); chip(ctx, 3420, 300, 'ICMS no caixa?', P.estado, vis(t, tCaixa, tAtras), { size: 32 }); crossOut(ctx, 3290, 300, 3550, 300, P.red, prog(t, tCaixa + 0.6, 0.3) * (1 - prog(t, tAtras - 0.1, 0.05)), 8); }
      if (t > tImp) chip(ctx, 3300, 200, 'o imposto do estado: ICMS', P.estado, vis(t, tImp, tAtras), { size: 30 });
      });
      // caminhão
      caminhao(ctx, truckX(t), 700, 0.7, { wheel: -truckX(t) / 30, guia: prog(t, tSaida, 0.6), pago: prog(t, tVez + 0.4, 0.4) });
      if (t > tVez) chip(ctx, 760, 300, 'de uma vez só, na saída da fábrica', P.estado, vis(t, tVez, tComo + 3), { size: 30 });
      if (t > tCadeia) cap(ctx, 'pela cadeia inteira: distribuidor, mercado, até você', 900, 200, { size: 30, alpha: vis(t, tCadeia, tComo + 3) });
      if (t > tComo) headline(ctx, 'mas por quanto vai ser vendida?', 900, 140 + 270, { size: 50, k: vis(t, tComo, tPesq), color: '#fde68a' });
      // o Diário Oficial com o preço médio
      zone(ctx, cam2, 5200, 5900, () => {
      if (t > tPesq - 0.5) {
        ctx.save(); ctx.globalAlpha *= 1 - appear(t, tAntes - 0.2, 0.5);
        diarioOficial(ctx, 5600, 500, 0.8, { rot: -0.02, rows: [['CERVEJA PILSEN', 'LATA 350 ML', '3,98'], ['CERVEJA PILSEN', 'LATA 269 ML', '3,29'], ['CERVEJA PILSEN', 'GARRAFA 600 ML', '7,90'], ['CERVEJA PILSEN', 'LITRÃO 1 L', '9,50'], ['CERVEJA PREMIUM', 'LATA 350 ML', '5,49'], ['CERVEJA PREMIUM', 'LONG NECK', '6,99'], ['CHOPE', 'BARRIL 50 L', '389,00']], hl: 0, hlk: prog(t, tLataL, 0.6) });
        ctx.restore();
        if (t > tAntes - 0.3) { lata(ctx, 5180, 560, 1.0, { t, alpha: appear(t, tAntes - 0.3, 0.4) }); rectStamp(ctx, 5180, 600, 330, 110, 'JÁ PAGO', P.red, prog(t, tAntes + 0.6, 0.35), -0.15, 56); }
        if (t > tAntes) headline(ctx, 'imposto cobrado ANTES da compra', 5850, 400, { size: 50, k: appear(t, tAntes, 0.4), hl: '#b45309' });
        if (t > tAcha) cap(ctx, 'sobre o preço que o governo acha que você vai pagar', 5850, 490, { size: 28, alpha: appear(t, tAcha, 0.4) });
      }
      });
      // mapa: SP 20%, outros acima de 25%
      zone(ctx, cam2, 7000, 7100, () => {
      if (t > tSP - 0.5) {
        const pt = brasilPontos(ctx, 6850, 470, 18, appear(t, tSP - 0.5, 0.6));
        const [sx, sy] = pt(-47, -22.5), [ex, ey] = pt(-37.3, -10.5);
        pinoEstado(ctx, sx, sy, 'São Paulo', '20%', P.estado, prog(t, t20, 0.6));
        pinoEstado(ctx, ex, ey, 'alguns estados', '25% ou mais', P.uniao, prog(t, t25, 0.6));
        if (t > tSP) cap(ctx, 'ICMS da cerveja, sobre o preço final', 7420, 230, { size: 32, alpha: appear(t, tSP, 0.5) });
      }
      });
      // as moedas do imposto numa lata de R$ 4
      zone(ctx, cam2, 8400, 8600, () => {
      if (t > t4 - 0.4) {
        const a = appear(t, t4 - 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= a;
        lata(ctx, 8150, 580, 1.0, { t, rot: t * 0.02 });
        chip(ctx, 8150, 230, 'lata de R$ 4,00 · São Paulo', '#e2e8f0', 1, { size: 28 });
        if (t > t80) { pilha(ctx, 8480, 720, Math.round(8 * ease.out(prog(t, t80, 0.8))), 64, P.estado); bigNum(ctx, 'R$ 0,80', 8480, 470, appear(t, t80, 0.4), { size: 74, color: '#fde68a', glow: hexA(P.estado, 0.6) }); cap(ctx, 'pro estado', 8480, 540, { size: 30, alpha: appear(t, t80 + 0.3, 0.4) }); }
        if (t > tFed) { cap(ctx, 'impostos federais, na fábrica', 8800, 230, { size: 30, alpha: appear(t, tFed, 0.4) }); }
        chip(ctx, 8700, 330, 'IPI', P.uniao, appear(t, tIPI, 0.4), { size: 32 }); chip(ctx, 8840, 330, 'PIS', P.uniao, appear(t, tPis, 0.4), { size: 32 }); chip(ctx, 8990, 330, 'COFINS', P.uniao, appear(t, tPis + 0.4, 0.4), { size: 32 });
        if (t > t40) { pilha(ctx, 8840, 720, Math.round(4 * ease.out(prog(t, t40, 0.6))), 64, P.uniao); bigNum(ctx, '+ R$ 0,40', 8840, 470, appear(t, t40, 0.4), { size: 70, color: '#fecaca', glow: hexA(P.uniao, 0.6) }); cap(ctx, 'pra União', 8840, 540, { size: 30, alpha: appear(t, t40 + 0.3, 0.4) }); }
        ctx.restore();
      }
      });
    },
    overlay(ctx, t) {
      source(ctx, 'Sefaz SP, MG e AL (tabelas de PMPF, 2026); RICMS/SP', vis(t, tPesq, 99, 0.5, 0.4));
      if (t > tPesq) { chip(ctx, 250, 140, 'o estado pesquisa', P.estado, vis(t, tPesq, tAntes - 0.3), { size: 32 }); chip(ctx, 250, 220, 'o preço', P.estado, vis(t, tPesq + 0.3, tAntes - 0.3), { size: 32 }); chip(ctx, 1680, 140, 'valores de exemplo', '#cbd5e1', vis(t, tPesq + 1.2, tAntes - 0.3), { size: 24 }); }
    },
  };
}

// ================================================================ Cena 05: o rótulo se desenrola (quem fica com cada real)
// fita do rótulo: começa na lata e vai até x0 + L; segs: [{ v, color, k }] em reais
function fitaRotulo(ctx, x0, y, L, h, unroll, segs, total, o = {}) {
  const len = L * clamp(unroll);
  if (len <= 2) return;
  const tex = labelTex('pilsen');
  ctx.save();
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 14; ctx.fillStyle = '#7d0d14'; ctx.fillRect(x0, y - h / 2, len, h); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(x0, y - h / 2, len, h); ctx.clip();
  for (let x = x0; x < x0 + len; x += h * 3) ctx.drawImage(tex, 0, 0, 900, 300, x, y - h / 2, h * 3, h);
  let acc = 0;
  for (const sg of segs) {
    const w = (sg.v / total) * L, k = clamp(sg.k ?? 0);
    if (k > 0) { ctx.fillStyle = hexA(sg.color, k); ctx.fillRect(x0 + acc, y - h / 2, w, h); }
    if (k > 0.5 && acc > 0) { ctx.fillStyle = 'rgba(5,7,13,0.9)'; ctx.fillRect(x0 + acc - 2, y - h / 2, 4, h); }
    acc += w;
  }
  // curvatura de papel (brilho e sombra)
  const g = ctx.createLinearGradient(0, y - h / 2, 0, y + h / 2); g.addColorStop(0, 'rgba(255,255,255,0.18)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,0.25)');
  ctx.fillStyle = g; ctx.fillRect(x0, y - h / 2, len, h);
  ctx.restore();
  ctx.restore();
}
function scene05(K) {
  const tAbrir = K('Então vamos abrir a lata inteira'), t4 = K('Dos quatro reais'), t120 = K('um real e vinte é imposto'), tEst = K('Oitenta centavos pro estado'), tUni = K('quarenta pra União');
  const tMerc = K('Uns oitenta centavos ficam com o mercado'), tGel = K('que paga a geladeira'), tEn1 = K('a energia'), tAlug = K('o aluguel'), tCaixa = K('o caixa e a lata que amassa');
  const tCerv = K('E uns dois reais ficam com a cervejaria'), tDesses = K('Desses dois reais'), tMalte = K('o malte'), tAlu = K('o alumínio a energia'), tFrete = K('o frete'), tLucro = K('E uns quarenta centavos viram lucro');
  const tMiudos = K('Trocando em miúdos'), tReal = K('de cada real da sua cerveja'), t30 = K('uns trinta centavos são imposto'), t2050 = K('vinte ficam no mercado');
  const tCarne = K('Na carne'), tPasto = K('a maior parte voltava pro pasto'), tCerveja = K('Na cerveja'), tFab = K('a maior parte fica na fábrica'), tSeg = K('e o segundo maior pedaço'), tImp = K('no imposto');
  const X0 = 700, L = 2400, Y = 500, Hh = 200; // R$ 4,00 = 2400 px (600 px por real)
  const segs = (t) => [
    { v: 0.8, color: P.estado, k: appear(t, tEst, 0.5), lab: 'estado', val: 'R$ 0,80', tc: tEst },
    { v: 0.4, color: P.uniao, k: appear(t, tUni, 0.5), lab: 'União', val: 'R$ 0,40', tc: tUni },
    { v: 0.8, color: P.mercado, k: appear(t, tMerc, 0.5), lab: 'mercado', val: 'R$ 0,80', tc: tMerc },
    { v: 1.6, color: P.fabrica, k: appear(t, tCerv, 0.5), lab: 'produção e caminho', val: 'R$ 1,60', tc: tDesses },
    { v: 0.4, color: P.lucro, k: appear(t, tLucro, 0.5), lab: 'lucro', val: 'R$ 0,40', tc: tLucro },
  ];
  const segX = (i) => { const S = segs(0); let a = 0; for (let j = 0; j < i; j++) a += (S[j].v / 4) * L; return X0 + a + ((S[i].v / 4) * L) / 2; };
  const cam = [
    { t: 0, x: 760, y: 500, z: 1.15 }, { t: tAbrir + 0.4, x: 1300, y: 480, z: 1.0, d: 2.2, dx: 6 }, { t: t120, x: 1140, y: 480, z: 1.2, d: 1.6 },
    { t: tMerc - 0.2, x: segX(2), y: 540, z: 1.12, d: 1.6 }, { t: tAlug, x: segX(2) + 60, y: 540, z: 1.08, d: 1.6 },
    { t: tCerv - 0.3, x: segX(3), y: 520, z: 1.0, d: 1.7 }, { t: tDesses + 1, x: segX(3), y: 540, z: 1.12, d: 2 }, { t: tLucro - 0.2, x: segX(4) - 80, y: 520, z: 1.15, d: 1.4 },
    { t: tMiudos - 0.3, x: 1900, y: 500, z: 0.82, d: 1.8, dz: 0.004 }, { t: tReal + 0.6, x: 1900, y: 480, z: 1.08, d: 2 },
    { t: tCarne - 0.4, x: 1900, y: 470, z: 1.0, d: 1.6 }, { t: tFab, x: 1900, y: 500, z: 1.06, d: 2 },
  ];
  const sfx = [[tAbrir + 0.2, 'paper', 0.7, { dur: 1.4 }], [t120, 'pop', 0.5], [tEst, 'stamp', 0.5], [tUni, 'stamp', 0.5], [tMerc, 'stamp', 0.5], ...[tGel, tEn1, tAlug, tCaixa].map((x) => [x, 'pop', 0.35]),
    [tCerv, 'stamp', 0.55], ...[tMalte, tAlu, tFrete].map((x) => [x, 'pop', 0.35]), [tLucro, 'coin', 0.6], [tMiudos, 'whoosh', 0.4], [t30, 'coin', 0.5], [t2050, 'coin', 0.5], [tCarne, 'pop', 0.4], [tCerveja, 'pop', 0.4], [tImp, 'hit', 0.4]];
  return {
    accent: P.mercado, cam, sfx, impacts: [tLucro], trans: 'push',
    draw(ctx, t, cam2) {
      geladeiraFundo(ctx, cam2, 0.45);
      // a fita encolhe para "R$ 1" na hora do "trocando em miúdos"
      const sh = ease.inOut(prog(t, tMiudos, 1.4)), Lnow = lerp(L, 1200, sh), X0now = lerp(X0, 1900 - 600, sh);
      lata(ctx, X0 - 120, Y + 60, 1.0, { t, plain: prog(t, tAbrir, 0.6) > 0.5, alpha: 1 - sh });
      const S = segs(t);
      ctx.save(); ctx.globalAlpha *= 1 - appear(t, tCarne - 0.3, 0.5);
      fitaRotulo(ctx, X0now, Y, Lnow, Hh, ease.inOut(prog(t, tAbrir, 2.2)), S, 4);
      ctx.restore();
      // rótulos de cada pedaço (valores em R$ antes, centavos de cada real depois)
      let acc = 0;
      S.forEach((sg, i) => {
        const w = (sg.v / 4) * Lnow, cx = X0now + acc + w / 2; acc += w;
        const k = appear(t, sg.tc ?? sg.tc, 0.5) * (1 - sh);
        if (k > 0 && Math.abs(cx - cam2.x) < 900 / cam2.z) { text(ctx, sg.val, cx, Y - Hh / 2 - 46, { size: 46, weight: 900, color: '#ffffff', alpha: k }); text(ctx, sg.lab, cx, Y + Hh / 2 + 40, { size: 30, weight: 800, color: sg.color === P.uniao ? '#fecaca' : '#e2e8f0', alpha: k }); }
      });
      if (t > t4) cap(ctx, 'os R$ 4,00 da lata', X0 + 600, 180, { size: 36, alpha: vis(t, t4, tCerv - 0.4) });
      if (t > t120) { const k = vis(t, t120, tMerc - 0.2); ctx.save(); ctx.globalAlpha *= k; ctx.strokeStyle = '#fde68a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(X0, Y - Hh / 2 - 100); ctx.lineTo(X0 + 720, Y - Hh / 2 - 100); ctx.stroke(); ctx.restore(); text(ctx, 'imposto: R$ 1,20', X0 + 360, Y - Hh / 2 - 136, { size: 40, weight: 900, color: '#fde68a', alpha: k }); }
      // o que o mercado paga
      [['geladeira', tGel], ['energia', tEn1], ['aluguel', tAlug], ['caixa', tCaixa], ['lata amassada', tCaixa + 1.6]].forEach(([nm, tc], i) => chip(ctx, segX(2) + (i - 2) * 190, Y + Hh / 2 + 95 + (i % 2) * 60, nm, '#d8b4fe', vis(t, tc, tCerv, 0.4), { size: 30 }));
      // o que a cervejaria paga
      [['malte', tMalte], ['alumínio', tAlu], ['energia', tAlu + 0.9], ['frete', tFrete]].forEach(([nm, tc], i) => chip(ctx, segX(3) + (i - 1.5) * 200, Y + Hh / 2 + 95 + (i % 2) * 60, nm, P.fabricaL, vis(t, tc, tLucro - 0.3, 0.4), { size: 30 }));
      // de cada real: 30 / 20 / 50
      if (t > tMiudos) {
        const k = appear(t, tReal, 0.5);
        text(ctx, 'de cada R$ 1 da sua cerveja', 1900, 260, { size: 40, weight: 900, color: '#ffffff', alpha: k * (1 - appear(t, tCarne - 0.2, 0.4)) });
        const parts = [[0.3, '30 centavos', 'imposto', t30, '#fde68a'], [0.2, '20', 'mercado', t2050, '#e9d5ff'], [0.5, '50', 'cervejaria', t2050 + 1.4, '#bfdbfe']];
        let a2 = 1300;
        parts.forEach(([f, v, lab, tc, col]) => { const w = 1200 * f, kk = appear(t, tc, 0.4) * (1 - appear(t, tCarne - 0.2, 0.4)); text(ctx, v, a2 + w / 2, Y - 10, { size: f > 0.25 ? 50 : 44, weight: 900, color: '#0b1222', alpha: kk }); text(ctx, lab, a2 + w / 2, Y + Hh / 2 + 44, { size: 32, weight: 900, color: col, alpha: kk }); a2 += w; });
      }
      // carne x cerveja
      if (t > tCarne - 0.3) {
        const k = appear(t, tCarne - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        fillRR(ctx, 1150, 120, 1500, 760, 28, 'rgba(6,10,20,0.92)');
        const bar = (y, label, parts, kk) => {
          text(ctx, label, 1230, y, { size: 40, weight: 900, color: '#ffffff', align: 'left', alpha: kk });
          let x = 1500; parts.forEach(([f, col, nm]) => { const w = 1060 * f * ease.out(clamp(kk)); fillRR(ctx, x, y - 50, Math.max(0, w - 6), 100, 12, col); if (w > 140) text(ctx, nm, x + w / 2, y + 2, { size: 28, weight: 900, color: '#0b1222' }); x += w; });
        };
        bar(330, 'carne', [[0.68, P.malte, 'pasto'], [0.25, P.mercado, 'caminho'], [0.07, P.estado, '']], prog(t, tPasto, 0.9));
        bar(560, 'cerveja', [[0.5, P.fabrica, 'fábrica'], [0.3, P.estado, 'imposto'], [0.2, P.mercado, 'mercado']], prog(t, tCerveja, 0.9));
        if (t > tFab) chip(ctx, 1765, 680, 'a maior parte', P.fabricaL, appear(t, tFab, 0.4), { size: 28 });
        if (t > tSeg) chip(ctx, 2210, 680, 'o segundo maior', '#fde68a', appear(t, tSeg, 0.4), { size: 28 });
        ctx.restore();
      }
      bokeh(ctx, cam2, t, 15, 8);
    },
    overlay(ctx, t) { source(ctx, 'conta do canal com alíquotas reais (ver descrição)', vis(t, t120, 99, 0.5, 0.4)); },
  };
}

// ================================================================ Cena 06: 56% x 30% (a base muda o número)
function regua(ctx, x0, x1, y, label, color, k, o = {}) {
  if (k <= 0) return;
  const x = lerp(x0, x1, ease.out(clamp(k)));
  ctx.save(); ctx.globalAlpha *= clamp(k * 3);
  const g = ctx.createLinearGradient(0, y - 32, 0, y + 32); g.addColorStop(0, '#fde68a'); g.addColorStop(1, '#d6a23a');
  ctx.fillStyle = g; rr(ctx, x0, y - 32, x - x0, 64, 8); ctx.fill();
  ctx.strokeStyle = 'rgba(60,40,10,0.7)'; ctx.lineWidth = 2;
  for (let xx = x0 + 10; xx < x; xx += 20) { const big = Math.round((xx - x0 - 10) / 20) % 5 === 0; ctx.beginPath(); ctx.moveTo(xx, y - 32); ctx.lineTo(xx, y - 32 + (big ? 20 : 11)); ctx.stroke(); }
  if (k > 0.9) text(ctx, label, (x0 + x1) / 2, y + 10, { size: 32, weight: 900, color: '#3b2a08' });
  ctx.restore();
}
function scene06(K) {
  const tEsp = K('Mas espera'), t56 = K('O setor falou em cinquenta e seis'), t30 = K('A nossa conta deu trinta'), tQuem = K('Quem está errado'), tNing = K('Talvez ninguém'), tPorc = K('Porcentagem depende');
  const tOlha = K('Olha a lata de novo'), t120 = K('O imposto é um real e vinte'), tTira = K('Tira o imposto'), t280 = K('e sobra dois reais e oitenta');
  const tFinal = K('Se você compara o imposto com o preço final'), t30b = K('ele é trinta por cento'), tSem = K('Se você compara com o preço sem imposto'), t42 = K('ele vira quarenta e dois');
  const tMesmo = K('Mesmo dinheiro'), tDois = K('dois números'), tLeva = K('Agora leva essa lata'), t150 = K('O imposto sobe pra quase'), tComp = K('E comparado com o preço sem imposto'), t55 = K('passa de cinquenta e cinco'), tAssim = K('É assim que se chega');
  const tCupom = K('E o seu cupom fiscal'), tEmb = K('Lá embaixo'), tAprox = K('ele mostra um valor aproximado'), tTab = K('Esse valor sai de uma tabela'), tEst = K('É uma estimativa'), tExata = K('não a conta exata'), tGuarda = K('Guarda essa ideia'), tExpl = K('porque ela explica');
  const X0 = 420, PX = 400; // 400 px por real
  const impV = (t) => lerp(1.2, 1.47, ease.inOut(prog(t, t150 - 0.6, 1.6)));
  const cam = [
    { t: 0, x: 960, y: 480, z: 1.15, dz: 0.004 }, { t: t30, x: 960, y: 480, z: 1.0, d: 1.4 }, { t: tPorc, x: 960, y: 470, z: 1.12, d: 2.4 },
    { t: tOlha - 0.3, x: 1320, y: 540, z: 1.0, d: 1.6 }, { t: t120, x: 1260, y: 560, z: 1.12, d: 1.6 }, { t: t280, x: 1320, y: 560, z: 1.0, d: 1.6 },
    { t: tFinal - 0.2, x: 1320, y: 480, z: 1.0, d: 1.6 }, { t: t30b, x: 1320, y: 470, z: 1.0, d: 1.6 }, { t: tSem, x: 1320, y: 440, z: 1.0, d: 1.6 }, { t: t42, x: 1320, y: 440, z: 1.0, d: 1.4 },
    { t: tMesmo, x: 1320, y: 470, z: 1.0, d: 1.8 }, { t: tLeva, x: 1320, y: 470, z: 1.0, d: 1.8, dx: 0 }, { t: t55, x: 1320, y: 450, z: 1.0, d: 1.4 }, { t: tAssim, x: 1320, y: 500, z: 0.95, d: 1.6 },
    { t: tCupom - 0.3, x: 3250, y: 480, z: 0.98, d: 1.6 }, { t: tEmb, x: 3220, y: 580, z: 1.25, d: 1.8 }, { t: tEst, x: 3260, y: 600, z: 1.2, d: 1.6 }, { t: tGuarda - 0.2, x: 3450, y: 500, z: 1.0, d: 1.8 },
  ];
  const sfx = [[tEsp, 'hit', 0.5], [t56, 'stamp', 0.5], [t30, 'stamp', 0.5], [tNing, 'pop', 0.4], [t120, 'coin', 0.5], [t280, 'coin', 0.5], [tFinal + 0.6, 'whoosh', 0.3], [t30b, 'pop', 0.6], [tSem + 0.4, 'whoosh', 0.3], [t42, 'pop', 0.6],
    [tLeva, 'whoosh', 0.35], [t150, 'coin', 0.5], [t55, 'hit', 0.5], [tCupom, 'printer', 0.6, { dur: 1.6 }], [tAprox, 'pop', 0.5], [tEst, 'stamp', 0.8]];
  return {
    accent: P.estado, cam, sfx, impacts: [tEsp, tEst], trans: 'cut',
    draw(ctx, t, cam2) {
      geladeiraFundo(ctx, cam2, 0.35);
      // abertura: 56 x 30
      const intro = 1 - appear(t, tOlha - 0.2, 0.5);
      if (intro > 0) {
        ctx.save(); ctx.globalAlpha *= intro;
        headline(ctx, 'mas espera', 960, 300, { size: 84, k: vis(t, tEsp, t56 - 0.1, 0.3, 0.3), color: '#fef08a', color2: '#facc15' });
        bigNum(ctx, '56%', 660, 470, appear(t, t56, 0.5), { size: 190, color: '#fecaca', glow: hexA(P.uniao, 0.6) }); cap(ctx, 'o setor', 660, 600, { size: 36, alpha: appear(t, t56, 0.5) });
        bigNum(ctx, '30%', 1260, 470, appear(t, t30, 0.5), { size: 190, color: '#fde68a', glow: hexA(P.estado, 0.6) }); cap(ctx, 'a nossa conta', 1260, 600, { size: 36, alpha: appear(t, t30, 0.5) });
        if (t > tQuem) headline(ctx, 'quem está errado?', 960, 190, { size: 60, k: vis(t, tQuem, tNing + 0.6) });
        if (t > tNing) headline(ctx, 'talvez ninguém', 960, 190, { size: 60, k: appear(t, tNing + 0.6, 0.4), color: '#bbf7d0' });
        if (t > tPorc) chip(ctx, 960, 760, 'depende de onde você começa a contar', '#e2e8f0', appear(t, tPorc, 0.5), { size: 32 });
        ctx.restore();
      }
      // a barra do preço: imposto + resto
      if (t > tOlha - 0.3) {
        const a = appear(t, tOlha - 0.3, 0.6) * (1 - appear(t, tCupom - 0.3, 0.5));
        ctx.save(); ctx.globalAlpha *= a;
        const iv = impV(t), rv = 4 - iv, Y = 640;
        const iw = iv * PX * ease.out(prog(t, t120, 0.7)), rw = rv * PX * ease.out(prog(t, tTira, 0.9));
        fillRR(ctx, X0, Y - 85, iw, 170, 16, P.estado); fillRR(ctx, X0 + iv * PX + 8, Y - 85, Math.max(0, rw - 8), 170, 16, '#334155');
        if (iw > 120) { text(ctx, 'imposto', X0 + iw / 2, Y - 22, { size: 32, weight: 800, color: '#1c1206' }); text(ctx, `R$ ${iv.toFixed(2).replace('.', ',')}`, X0 + iw / 2, Y + 26, { size: 46, weight: 900, color: '#1c1206' }); }
        if (rw > 300) { text(ctx, 'sem imposto', X0 + iv * PX + rw / 2, Y - 22, { size: 32, weight: 800, color: '#cbd5e1' }); text(ctx, `R$ ${rv.toFixed(2).replace('.', ',')}`, X0 + iv * PX + rw / 2, Y + 26, { size: 46, weight: 900, color: '#ffffff' }); }
        // régua 1: o preço final inteiro
        const fk = prog(t, tFinal + 0.5, 0.9);
        regua(ctx, X0, X0 + 4 * PX, 460, 'preço final: R$ 4,00', '#fde68a', fk);
        if (t > t30b) text(ctx, `${Math.floor((iv / 4) * 100 + 1e-6)}%`, X0 + 4 * PX + 100, 460, { size: 76, weight: 900, color: '#fde68a', alpha: appear(t, t30b, 0.4) });
        // régua 2: só o preço sem imposto
        const sk = prog(t, tSem + 0.5, 0.9);
        regua(ctx, X0 + iv * PX + 8, X0 + 4 * PX, 330, `sem imposto: R$ ${rv.toFixed(2).replace('.', ',')}`, '#93c5fd', sk);
        if (t > t42) text(ctx, `${Math.floor((iv / rv) * 100 + 1e-6)}%`, X0 + 4 * PX + 100, 330, { size: 76, weight: 900, color: '#93c5fd', alpha: appear(t, t42, 0.4) });
        if (t > tMesmo) headline(ctx, 'mesmo dinheiro, dois números', X0 + 2 * PX, 170, { size: 54, k: vis(t, tMesmo, tLeva + 0.3) });
        if (t > tLeva) chip(ctx, X0 + 2 * PX, 170, 'estado com ICMS de 27%', P.uniao, appear(t, tLeva + 0.3, 0.5), { size: 32 });
        if (t > t55) chip(ctx, X0 + 4 * PX - 60, 210, 'passa de 55%', '#93c5fd', appear(t, t55, 0.4), { size: 30 });
        if (t > tAssim) headline(ctx, 'perto do número do setor', X0 + 2 * PX, 755, { size: 50, k: appear(t, tAssim, 0.4), hl: '#7f1d1d' });
        ctx.restore();
      }
      // o cupom fiscal com os "tributos aproximados"
      if (t > tCupom - 0.4) {
        impressoraCaixa(ctx, 3200, 170, 0.85);
        const lines = cupomLinhas([{ s: '--------------------------------------', c: 1 }, { s: 'Trib. aprox. R$ (Fonte: IBPT)', b: 1, hl: '#facc15', hlk: prog(t, tAprox, 0.6) }, { s: 'Lei Federal 12.741/2012', c: 1 }, { s: 'Consulte pela chave de acesso', c: 1 }]);
        cupom(ctx, 3200, 170, 1.1, lines, prog(t, tCupom, 2.4) * (lines.length + 0.9), { qr: true });
        if (t > tTab) chip(ctx, 3640, 600, 'tabela de médias', '#e2e8f0', appear(t, tTab, 0.4), { size: 30 });
        ovalStamp(ctx, 3560, 520, 190, 66, [['ESTIMATIVA', 0.04, 0.5]], P.red, prog(t, tEst, 0.35), -0.16);
        if (t > tExata) cap(ctx, 'não é a conta exata da sua lata', 3700, 700, { size: 30, alpha: appear(t, tExata, 0.4) });
        if (t > tGuarda) headline(ctx, 'a base muda o número', 3780, 420, { size: 56, k: appear(t, tGuarda + 0.6, 0.4), hl: '#1e3a8a' });
      }
    },
    overlay(ctx, t) { source(ctx, 'Sindcerv (abr/2026); conta do canal; Lei 12.741/2012', vis(t, t56, 99, 0.5, 0.4)); },
  };
}

// ================================================================ Cena 07: o imposto do pecado (troca o IPI)
function macoCigarro(ctx, x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 20; fillRR(ctx, -70, -110, 140, 220, 8, '#e5e7eb'); ctx.restore(); fillRR(ctx, -70, -110, 140, 70, 8, '#7f1d1d'); fillRR(ctx, -60, 0, 120, 90, 4, '#1f2937'); text(ctx, 'FAZ MAL', 0, 46, { size: 18, weight: 900, color: '#fca5a5' }); ctx.restore(); }
function garrafaDestilado(ctx, x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(-14, -150); ctx.lineTo(14, -150); ctx.lineTo(14, -80); ctx.lineTo(50, -50); ctx.lineTo(50, 130); ctx.lineTo(-50, 130); ctx.lineTo(-50, -50); ctx.lineTo(-14, -80); ctx.closePath(); const g = ctx.createLinearGradient(-50, 0, 50, 0); g.addColorStop(0, '#78350f'); g.addColorStop(0.4, '#d97706'); g.addColorStop(1, '#78350f'); ctx.fillStyle = g; ctx.fill(); fillRR(ctx, -40, -10, 80, 70, 6, '#f5f5f4'); fillRR(ctx, -16, -172, 32, 26, 4, '#111827'); ctx.restore(); }
function latinhaRefri(ctx, x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s * 0.9, s * 0.9); fillRR(ctx, -60, -110, 120, 220, 18, '#16a34a'); ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(-40, -100, 10, 200); text(ctx, 'REFRI', 0, 4, { size: 28, weight: 900, color: '#ecfccb' }); ctx.restore(); }
function carro(ctx, x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = '#334155'; ctx.beginPath(); ctx.moveTo(-170, 40); ctx.lineTo(-160, -10); ctx.lineTo(-90, -20); ctx.lineTo(-50, -70); ctx.lineTo(70, -70); ctx.lineTo(120, -20); ctx.lineTo(170, -10); ctx.lineTo(175, 40); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#93c5fd'; ctx.fillRect(-40, -60, 50, 36); ctx.fillRect(20, -60, 46, 36); circle(ctx, -100, 46, 30, '#111827'); circle(ctx, 110, 46, 30, '#111827'); ctx.fillStyle = 'rgba(148,163,184,0.5)'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(-200 - i * 26, 30 - i * 10, 10 + i * 5, 0, 6.283); ctx.fill(); } ctx.restore(); }
function congresso(ctx, x, y, s, a = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= a; ctx.fillStyle = '#cbd5e1'; ctx.fillRect(-30, -260, 26, 260); ctx.fillRect(8, -260, 26, 260); ctx.fillRect(-260, 0, 520, 30); ctx.beginPath(); ctx.arc(-150, 0, 90, Math.PI, 0); ctx.fill(); ctx.beginPath(); ctx.arc(150, -50, 90, 0, Math.PI); ctx.fill(); ctx.fillRect(60, -60, 180, 12); ctx.restore(); }
function scene07(K) {
  const tPec = K('O imposto do pecado faz parte'), tCriado = K('Ele foi criado pra deixar mais caro'), tCig = K('cigarro'), tBeb = K('bebida alcoólica'), tRef = K('refrigerante'), tCar = K('carro a combustão');
  const t667 = K('O cigarro vai pagar'), tDest = K('Os destilados'), t24 = K('até vinte e quatro'), tCerv = K('A cerveja'), t42 = K('quatro vírgula dois'), tCob = K('A cobrança começa');
  const tDet = K('Mas tem um detalhe'), tDia = K('no mesmo dia'), tZero = K('o IPI da cerveja vai a zero'), t39 = K('E o IPI da cerveja hoje'), tLugar = K('Então são quatro vírgula dois no lugar'), tSubiu = K('Subiu');
  const tMin = K('Segundo o ministro da Fazenda'), tBase = K('O imposto novo é calculado'), tTam = K('e o valor final fica do mesmo tamanho'), tLicao = K('É a mesma lição da lata'), tSoz = K('a porcentagem sozinha');
  const tBriga = K('E a briga acabou'), tNao = K('Não'), t110 = K('O Ministério da Saúde'), tFaz = K('A Fazenda não aceitou'), tAno = K('Esse primeiro ano'), tSem = K('sem aumento'), t2028 = K('As alíquotas de dois mil e vinte e oito'), tCong = K('e a medida ainda precisa');
  const tOuSeja = K('Ou seja'), tFev = K('em fevereiro'), tNaoDev = K('a lata não deveria subir'), tVerd = K('A briga de verdade');
  // estações: carimbo e produtos (960 a 1900), troca IPI x IS (3200), áreas iguais (4500), 110% (5800), calendário 2027/2028 (7000)
  const cam = [
    { t: 0, x: 960, y: 520, z: 1.25 }, { t: tCriado - 0.3, x: 1200, y: 500, z: 0.92, d: 1.8, dx: 8 }, { t: t667 - 0.2, x: 860, y: 520, z: 1.1, d: 1.4 },
    { t: tDest, x: 1260, y: 520, z: 1.1, d: 1.2 }, { t: tCerv, x: 1880, y: 520, z: 1.12, d: 1.2 }, { t: tCob - 0.2, x: 1620, y: 470, z: 1.0, d: 1.6 },
    { t: tDet - 0.3, x: 3200, y: 500, z: 1.0, d: 1.7 }, { t: tZero, x: 3120, y: 520, z: 1.16, d: 1.6 }, { t: tLugar, x: 3260, y: 500, z: 1.06, d: 1.6 }, { t: tSubiu, x: 3260, y: 470, z: 1.18, d: 1.2 },
    { t: tBase - 0.3, x: 4500, y: 500, z: 0.95, d: 1.8 }, { t: tTam, x: 4500, y: 520, z: 1.08, d: 2 }, { t: tLicao, x: 4520, y: 480, z: 1.0, d: 2 },
    { t: tBriga - 0.3, x: 5800, y: 500, z: 1.0, d: 1.6 }, { t: t110 + 1.4, x: 5800, y: 480, z: 1.18, d: 1.8 }, { t: tFaz, x: 5850, y: 500, z: 1.05, d: 1.4 },
    { t: tAno - 0.2, x: 6900, y: 500, z: 1.08, d: 1.8, dx: 5 }, { t: t2028, x: 7000, y: 500, z: 1.04, d: 1.8 }, { t: tCong, x: 7400, y: 500, z: 1.0, d: 1.8 }, { t: tOuSeja - 0.2, x: 7100, y: 500, z: 0.92, d: 1.6 }, { t: tVerd, x: 7150, y: 480, z: 1.05, d: 1.8 },
  ];
  const sfx = [[0.15, 'stamp', 1.0], [0.18, 'impact', 0.5], [tCig, 'pop', 0.45], [tBeb, 'pop', 0.45], [tRef, 'pop', 0.45], [tCar, 'pop', 0.45], [t667, 'stamp', 0.5], [t24, 'stamp', 0.5], [t42, 'stamp', 0.6],
    [tCob, 'paper', 0.5], [tZero, 'paper', 0.6, { dur: 0.5 }], [t39, 'pop', 0.5], [tLugar, 'whoosh', 0.35], [tSubiu, 'pop', 0.5], [tMin, 'pop', 0.4], [tTam, 'ding', 0.5],
    [t110 + 1.6, 'hit', 0.7], [tFaz, 'stamp', 0.7], [tSem, 'ding', 0.4], [t2028, 'paper', 0.4], [tCong, 'pop', 0.4], [tNaoDev, 'pop', 0.4], [tVerd, 'hit', 0.5]];
  return {
    accent: P.uniao, cam, sfx, impacts: [0.15, t110 + 1.6], trans: 'cut',
    draw(ctx, t, cam2) {
      geladeiraFundo(ctx, cam2, 0.3);
      // o carimbo que abre a cena (a única transição de efeito do vídeo)
      zone(ctx, cam2, 860, 1880, () => {
      const sk = prog(t, 0.05, 0.3), shrink = ease.inOut(prog(t, tCriado - 0.3, 1.2));
      if (t < tCriado + 1.2) rectStamp(ctx, lerp(960, 1200, shrink), lerp(520, 170, shrink), lerp(900, 620, shrink), lerp(200, 110, shrink), 'IMPOSTO DO PECADO', P.red, sk, -0.08, lerp(84, 54, shrink));
      else rectStamp(ctx, 1200, 170, 620, 110, 'IMPOSTO DO PECADO', P.red, 1 - appear(t, tCerv - 0.6, 0.4), -0.08, 54);
      if (t > tPec) chip(ctx, 1200, 280, 'parte da reforma tributária', '#e2e8f0', vis(t, tPec + 0.6, tCerv - 0.6), { size: 28 });
      if (t > tCriado) headline(ctx, 'pra encarecer o que faz mal', 1300, 400, { size: 54, k: vis(t, tCriado, tCig - 0.2), hl: '#7f1d1d' });
      if (t > tCriado + 1.5) cap(ctx, 'à saúde ou ao meio ambiente', 1300, 480, { size: 34, alpha: vis(t, tCriado + 1.5, tCig - 0.2) });
      // produtos e alíquotas
      const row = [[macoCigarro, 820, tCig, '66,7%', t667], [garrafaDestilado, 1230, tBeb, 'até 24%', t24], [latinhaRefri, 1570, tRef, null, 0], [carro, 2280, tCar, null, 0]];
      row.forEach(([fn, x, tc, rate, tr]) => { const k = appear(t, tc, 0.5); if (k <= 0) return; ctx.save(); ctx.globalAlpha *= k; fn(ctx, x, 620 + (1 - ease.out(k)) * 40, 1.3); ctx.restore(); if (rate) chip(ctx, x, 380, rate, P.uniao, appear(t, tr, 0.4), { size: 44 }); });
      if (t > tCerv - 0.3) { lata(ctx, 1900, 620, 0.85, { t, alpha: appear(t, tCerv - 0.3, 0.4) }); chip(ctx, 1900, 380, '4,2%', '#fde68a', appear(t, t42, 0.4), { size: 48 }); }
      if (t > tCob) { const k = appear(t, tCob, 0.5); chip(ctx, 1700, 800 - 30, 'a partir de 2 de fevereiro de 2027', '#fde68a', k * (1 - appear(t, tDet, 0.4)), { size: 30 }); }
      });
      // troca: IPI 3,9% sai, imposto seletivo 4,2% entra
      zone(ctx, cam2, 3120, 3260, () => {
      if (t > tDet - 0.4) {
        const a = appear(t, tDet - 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= a;
        lata(ctx, 3200, 560, 1.1, { t, rot: t * 0.02 });
        if (t > tDet) cap(ctx, 'o detalhe que a manchete não conta', 3200, 210, { size: 34, alpha: appear(t, tDet, 0.4) });
        const off = ease.in(prog(t, tZero, 0.8));
        ctx.save(); ctx.translate(lerp(2950, 2700, off), lerp(380, 820, off)); ctx.rotate(lerp(-0.12, -0.9, off)); ctx.globalAlpha *= 1 - off;
        chip(ctx, 0, 0, 'IPI 3,9%', '#cbd5e1', appear(t, tDet + 0.2, 0.4), { size: 48 }); ctx.restore();
        if (t > tZero) chip(ctx, 2760, 260, 'o IPI vai a zero', '#e2e8f0', appear(t, tZero, 0.4), { size: 28 });
        if (t > t39) cap(ctx, 'hoje: IPI de 3,9%', 3200, 820 - 40, { size: 32, alpha: vis(t, t39, tLugar + 0.5) });
        if (t > tLugar) chip(ctx, 3460, 380, 'seletivo 4,2%', '#fde68a', appear(t, tLugar, 0.5), { size: 40 });
        if (t > tSubiu) headline(ctx, 'subiu?', 2880, 540, { size: 70, k: vis(t, tSubiu, tBase), color: '#fef08a' });
        if (t > tMin) chip(ctx, 2880, 650, 'ministro da Fazenda: não', P.ok, appear(t, tMin, 0.4), { size: 30 });
        ctx.restore();
      }
      });
      // áreas iguais: base x alíquota
      zone(ctx, cam2, 4500, 4520, () => {
      if (t > tBase - 0.4) {
        const a = appear(t, tBase - 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= a;
        const H1 = 3.9 * 60, H2 = 4.2 * 60, W1 = 640, W2 = (W1 * 3.9) / 4.2, base = 690;
        fillRR(ctx, 3900, base - H1 * appear(t, tBase, 0.6), W1, H1 * appear(t, tBase, 0.6), 10, '#94a3b8');
        text(ctx, 'IPI hoje', 3900 + W1 / 2, base + 40, { size: 30, weight: 900, color: '#e2e8f0' }); text(ctx, 'base maior × 3,9%', 3900 + W1 / 2, base - H1 / 2, { size: 30, weight: 900, color: '#0b1222' });
        const k2 = appear(t, tBase + 1.6, 0.6);
        fillRR(ctx, 4700, base - H2 * k2, W2, H2 * k2, 10, '#fbbf24');
        text(ctx, 'seletivo', 4700 + W2 / 2, base + 40, { size: 30, weight: 900, color: '#fde68a' }); text(ctx, 'base menor × 4,2%', 4700 + W2 / 2, base - H2 / 2, { size: 30, weight: 900, color: '#0b1222' });
        if (t > tTam) { headline(ctx, 'o mesmo tamanho', 4500, 300, { size: 60, k: appear(t, tTam, 0.4), hl: '#065f46' }); check(ctx, 4500, 400, 1.2, P.ok, prog(t, tTam + 0.3, 0.5)); }
        if (t > tSoz) cap(ctx, 'a porcentagem sozinha não diz nada sem a base', 4500, 160, { size: 32, alpha: appear(t, tSoz, 0.4) });
        ctx.restore();
      }
      });
      // 110% e a Fazenda
      zone(ctx, cam2, 5800, 5850, () => {
      if (t > tBriga - 0.4) {
        const a = appear(t, tBriga - 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= a;
        if (t > tBriga) headline(ctx, 'a briga acabou?', 5800, 400, { size: 76, k: vis(t, tBriga, t110 - 0.1, 0.4, 0.3) });
        if (t > tNao) headline(ctx, 'não.', 5800, 540, { size: 110, k: vis(t, tNao, t110 - 0.1, 0.3, 0.3), color: '#fca5a5' });
        if (t > t110) { cap(ctx, 'o Ministério da Saúde propôs', 5800, 300, { size: 34, alpha: appear(t, t110, 0.4) }); bigNum(ctx, '110%', 5800, 480, appear(t, t110 + 1.4, 0.4), { size: 210, color: '#fecaca', glow: hexA(P.uniao, 0.7) }); cap(ctx, 'na cerveja', 5800, 620, { size: 34, alpha: appear(t, t110 + 1.8, 0.4) }); }
        crossOut(ctx, 5580, 560, 6020, 400, P.red, prog(t, tFaz, 0.35), 14);
        if (t > tFaz) chip(ctx, 5800, 760, 'a Fazenda não aceitou', '#e2e8f0', appear(t, tFaz, 0.4), { size: 32 });
        ctx.restore();
      }
      });
      // 2027 x 2028 e o Congresso
      zone(ctx, cam2, 6900, 7400, () => {
      if (t > tAno - 0.4) {
        const a = appear(t, tAno - 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= a;
        const cal = (x, y, ano, sub, col, k) => { if (k <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(k * 2); ctx.translate(x, y + (1 - ease.out(clamp(k))) * 40); ctx.scale(1.3, 1.3); ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 22; fillRR(ctx, -200, -150, 400, 300, 16, '#f8fafc'); ctx.restore(); fillRR(ctx, -200, -150, 400, 80, 16, col); ctx.fillStyle = col; ctx.fillRect(-200, -96, 400, 26); text(ctx, ano, 0, -108, { size: 44, weight: 900, color: '#ffffff' }); text(ctx, sub, 0, 30, { size: 30, weight: 900, color: '#111827' }); ctx.restore(); };
        cal(6650, 480, '2027', 'troca, sem aumento', P.ok, appear(t, tAno, 0.5));
        cal(7240, 480, '2028', 'em discussão', P.estado, appear(t, t2028, 0.5));
        if (t > t2028) text(ctx, '?', 7240, 610, { size: 110, weight: 900, color: '#f59e0b', alpha: appear(t, t2028 + 0.8, 0.4) });
        congresso(ctx, 7700, 680, 0.75, appear(t, tCong, 0.5));
        if (t > tCong) cap(ctx, 'ainda precisa passar pelo Congresso', 7650, 300, { size: 30, alpha: appear(t, tCong, 0.4) });
        if (t > tFev) chip(ctx, 6920, 240, 'em fevereiro: não deveria subir por causa dele', '#bbf7d0', appear(t, tNaoDev, 0.4), { size: 30 });
        if (t > tVerd) headline(ctx, 'a briga de verdade: 2028', 7150, 720, { size: 56, k: appear(t, tVerd, 0.4), hl: '#7c2d12' });
        ctx.restore();
      }
      });
    },
    overlay(ctx, t) {
      source(ctx, 'MP 1.399/2026 (Senado, Casa Civil, g1, Valor)', vis(t, t667, tBase, 0.5, 0.4));
      source(ctx, 'Metrópoles (Durigan); Buscador NCM (IPI 3,9%)', vis(t, tBase, tBriga, 0.5, 0.4));
      source(ctx, 'Estado de Minas (fev/2026); InfoMoney; Valor', vis(t, tBriga, 99, 0.5, 0.4));
    },
  };
}

// ================================================================ Cena 08: então por que a cerveja sobe?
function scene08(K) {
  const tEnt = K('se não é o imposto'), tPri = K('Primeiro'), tCusto = K('o custo'), tDol = K('O malte e o alumínio da lata têm preço em dólar'), tCaros = K('e ficaram mais caros'), tTri = K('No último trimestre'), t5 = K('o custo do que a maior cervejaria vende');
  const tSeg = K('Segundo'), tJeito = K('o jeito de vender'), tGest = K('As cervejarias chamam de gestão de receita'), tAos = K('subir o preço aos poucos'), tPrem = K('as premium'), t8 = K('No começo do ano');
  const tCur = K('E aí vem a parte curiosa'), tSub = K('Com o preço subindo'), tMenos = K('o brasileiro passou a beber menos'), t25 = K('Em dois mil e vinte e cinco'), tCaiu = K('o consumo de cerveja caiu'), tLat = K('Dá uma latinha a menos por mês');
  const tZero = K('E a cerveja sem álcool'), t40 = K('vendeu quarenta por cento mais'), tLit = K('A indústria vende menos litros'), tCobra = K('mas cobra mais por cada um'), tLucro = K('Por isso o lucro continua alto');
  const cam = [
    { t: 0, x: 960, y: 500, z: 1.1 }, { t: tPri - 0.2, x: 960, y: 500, z: 0.95, d: 1.6 }, { t: tDol, x: 900, y: 520, z: 1.08, d: 1.6, dx: 5 }, { t: t5, x: 1060, y: 500, z: 1.15, d: 2 },
    { t: tSeg - 0.3, x: 2400, y: 500, z: 0.98, d: 1.7 }, { t: tAos, x: 2300, y: 520, z: 1.1, d: 2 }, { t: tPrem, x: 2600, y: 520, z: 1.12, d: 1.6 }, { t: t8, x: 2450, y: 480, z: 1.04, d: 1.8 },
    { t: tCur - 0.3, x: 3900, y: 480, z: 1.0, d: 1.7 }, { t: tCaiu, x: 3820, y: 520, z: 1.12, d: 1.8 }, { t: tLat, x: 3900, y: 560, z: 1.06, d: 1.6 },
    { t: tZero - 0.3, x: 5200, y: 520, z: 1.12, d: 1.6 }, { t: tLit - 0.2, x: 6300, y: 480, z: 1.12, d: 1.8 }, { t: tLucro, x: 6300, y: 500, z: 1.06, d: 2 },
  ];
  const sfx = [[tPri, 'pop', 0.5], [tDol, 'coin', 0.5], [tCaros, 'riser', 0.35, { dur: 0.9 }], [t5, 'hit', 0.5], [tSeg, 'pop', 0.5], ...[0, 1, 2, 3].map((i) => [tAos + 0.3 + i * 0.4, 'tick', 0.4]), [tPrem, 'clink', 0.5], [t8, 'hit', 0.5],
    [tCur, 'pop', 0.5], [tCaiu, 'drop', 0.5], [tLat + 0.8, 'pop', 0.5], [tZero, 'canopen', 0.7], [t40, 'cash', 0.5], [tLit, 'whoosh', 0.3], [tCobra, 'coin', 0.5], [tLucro, 'cash', 0.6]];
  return {
    accent: P.dolar, cam, sfx, impacts: [t5, t8], trans: 'push',
    draw(ctx, t, cam2) {
      geladeiraFundo(ctx, cam2, 0.4);
      if (t > tEnt) headline(ctx, 'se não é o imposto, por que sobe?', 960, 440, { size: 72, k: vis(t, tEnt, tPri - 0.3, 0.4, 0.3) });
      // 1: custo em dólar
      zone(ctx, cam2, 900, 1420, () => {
      if (t > tPri - 0.3) {
        chip(ctx, 900, 220, '1 · o custo', '#e2e8f0', appear(t, tPri, 0.4) * (1 - appear(t, tSeg, 0.4)), { size: 42 });
        ctx.save(); ctx.globalAlpha *= 1 - appear(t, tSeg, 0.6);
        sacoMalte(ctx, 620, 580, 0.75); lata(ctx, 1020, 600, 1.05, { t, plain: true, drops: false });
        if (t > tDol) { chip(ctx, 620, 330, 'US$', P.dolar, appear(t, tDol, 0.4), { size: 40 }); chip(ctx, 1020, 330, 'US$', P.dolar, appear(t, tDol + 0.4, 0.4), { size: 40 }); }
        if (t > tCaros) { arrow(ctx, 790, 420, 790, 280, P.uniao, 12, prog(t, tCaros, 0.5)); arrow(ctx, 1190, 420, 1190, 280, P.uniao, 12, prog(t, tCaros + 0.2, 0.5)); }
        if (t > tTri) { bigNum(ctx, '+5%', 1420, 470, appear(t, t5 + 1, 0.5), { size: 140, color: '#fecaca', glow: hexA(P.uniao, 0.6) }); cap(ctx, 'no custo, no último trimestre', 1420, 580, { size: 30, alpha: appear(t, t5 + 1.2, 0.4) }); }
        ctx.restore();
      }
      });
      // 2: gestão de receita (degraus de preço) e premium
      zone(ctx, cam2, 2300, 2750, () => {
      if (t > tSeg - 0.4) {
        const a = appear(t, tSeg - 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= a;
        chip(ctx, 2400, 200, '2 · o jeito de vender', '#e2e8f0', 1, { size: 42 });
        if (t > tGest) headline(ctx, 'gestão de receita', 2350, 330, { size: 64, k: vis(t, tGest, t8 + 0.5), hl: '#1e3a8a' });
        const steps = ['3,79', '3,89', '3,99', '4,09'];
        steps.forEach((p, i) => { const k = appear(t, tAos + 0.3 + i * 0.4, 0.4); if (k <= 0) return; const x = 2000 + i * 150, y = 640 - i * 60; fillRR(ctx, x - 60, y, 130, 600 - y + 160, 8, hexA(P.fabrica, 0.35 * k)); chip(ctx, x + 5, y - 30, p, '#fde68a', k, { size: 28 }); });
        if (t > tPrem - 0.3) { garrafa(ctx, 2750, 560, 0.95, { tag: 'PREMIUM', labelColor: '#111827', alpha: appear(t, tPrem - 0.3, 0.4) }); chip(ctx, 2750, 300, 'mais marcas premium', '#fde68a', appear(t, tPrem, 0.4), { size: 28 }); }
        if (t > t8) { bigNum(ctx, '+8%', 2300, 320, appear(t, t8 + 0.8, 0.5), { size: 110, color: '#bfdbfe', glow: hexA(P.fabrica, 0.6) }); cap(ctx, 'no que a líder recebe por litro (1º tri)', 2300, 410, { size: 30, alpha: appear(t, t8 + 1, 0.4) }); }
        ctx.restore();
      }
      });
      // 3: o consumo cai
      zone(ctx, cam2, 3700, 4000, () => {
      if (t > tCur - 0.4) {
        const a = appear(t, tCur - 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= a;
        headline(ctx, 'a parte curiosa', 3900, 420, { size: 76, k: vis(t, tCur, tSub - 0.1, 0.4, 0.3), color: '#fef08a', color2: '#facc15' });
        if (t > tMenos) cap(ctx, 'o brasileiro passou a beber menos', 3900, 160, { size: 38, alpha: appear(t, tMenos, 0.4) });
        barraComp(ctx, 3700, 710, 200, 300, 100, 100, '#94a3b8', '2024', '100', prog(t, tSub, 0.7));
        barraComp(ctx, 4000, 710, 200, 300, 95, 100, P.beer, '2025', '−5%', prog(t, tCaiu, 0.8));
        if (t > tLat) { // 12 latinhas do mês, uma some
          for (let i = 0; i < 12; i++) { const gone = i === 11 ? ease.out(prog(t, tLat + 0.8, 0.6)) : 0; lata(ctx, 3480 + i * 76, 235 + gone * 50, 0.2, { t, drops: false, alpha: 1 - gone }); }
          cap(ctx, 'uma latinha a menos por mês', 3900, 315, { size: 30, alpha: appear(t, tLat, 0.4) });
        }
        ctx.restore();
      }
      });
      // 4: sem álcool
      zone(ctx, cam2, 5100, 5450, () => {
      if (t > tZero - 0.4) {
        lata(ctx, 5100, 580, 1.0, { t, label: 'zero', alpha: appear(t, tZero - 0.4, 0.4) });
        if (t > t40) { bigNum(ctx, '+40%', 5560, 480, appear(t, t40 + 0.6, 0.5), { size: 120, color: '#bbf7d0', glow: hexA(P.ok, 0.6) }); cap(ctx, 'sem álcool, numa cervejaria,', 5560, 580, { size: 30, alpha: appear(t, t40 + 0.8, 0.4) }); cap(ctx, 'no último trimestre', 5560, 625, { size: 30, alpha: appear(t, t40 + 0.8, 0.4) }); }
      }
      });
      // 5: menos litros, mais por litro
      zone(ctx, cam2, 6050, 6550, () => {
      if (t > tLit - 0.4) {
        const a = appear(t, tLit - 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= a;
        chip(ctx, 6000, 220, 'litros vendidos', '#e2e8f0', 1, { size: 36 }); arrow(ctx, 6170, 330, 6170, 520, P.uniao, 14, prog(t, tLit + 0.4, 0.5));
        for (let i = 0; i < 5; i++) { const gone = i === 4 ? ease.out(prog(t, tLit + 0.8, 0.6)) : 0; lata(ctx, 5850 + (i % 3) * 110, 470 + Math.floor(i / 3) * 170 + gone * 40, 0.4, { t, drops: false, alpha: 1 - gone }); }
        chip(ctx, 6600, 220, 'preço por litro', '#e2e8f0', appear(t, tCobra, 0.4), { size: 36 }); arrow(ctx, 6420, 520, 6420, 330, P.ok, 14, prog(t, tCobra + 0.3, 0.5));
        if (t > tCobra) pilha(ctx, 6620, 620, Math.round(3 + 6 * ease.out(prog(t, tCobra + 0.3, 1.2))), 70, null);
        if (t > tLucro) headline(ctx, 'o lucro continua alto', 6300, 740, { size: 58, k: appear(t, tLucro, 0.4), hl: '#1e3a8a' });
        ctx.restore();
      }
      });
    },
    overlay(ctx, t) {
      source(ctx, 'Ambev via Reuters, Valor e Terra (2026); CervBrasil via O Globo', vis(t, tTri, 99, 0.5, 0.4));
    },
  };
}

// ================================================================ Cena 09: a mesma cerveja no bar
function cardapio(ctx, x, y, s, k) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y + (1 - ease.out(clamp(k))) * 60); ctx.rotate(-0.05); ctx.scale(s, s); ctx.globalAlpha *= clamp(k * 2);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 14; fillRR(ctx, -300, -360, 600, 720, 26, '#1f2937'); ctx.restore();
  fillRR(ctx, -276, -336, 552, 672, 18, '#fef3c7'); fillRR(ctx, -276, -336, 552, 100, 18, '#7c2d12'); ctx.fillStyle = '#7c2d12'; ctx.fillRect(-276, -260, 552, 24);
  text(ctx, 'BAR DO ZÉ', 0, -286, { size: 46, weight: 900, color: '#fde68a', letter: 4 }); text(ctx, 'BEBIDAS', -240, -190, { size: 28, weight: 900, color: '#7c2d12', align: 'left', letter: 3 });
  const rows = [['Cerveja 600 ml', '15,80', true], ['Chope 300 ml', '11,90'], ['Long neck', '12,50'], ['Refrigerante', '7,00'], ['Água', '5,00'], ['Porção de fritas', '32,00']];
  rows.forEach(([n, v, hl], i) => { const yy = -130 + i * 74; if (hl) fillRR(ctx, -256, yy - 30, 512, 60, 8, 'rgba(250,204,21,0.6)'); text(ctx, n, -240, yy, { size: 30, weight: 800, color: '#1c1917', align: 'left' }); text(ctx, 'R$ ' + v, 240, yy, { size: 30, weight: 900, color: '#1c1917', align: 'right' }); ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(-240, yy + 34, 480, 2); });
  text(ctx, 'preços de exemplo; média de BH em maio: R$ 15,80', 0, 320, { size: 18, weight: 700, color: '#78716c' });
  ctx.restore();
}
function jarra(ctx, x, yBase, h, fill, color, label, valor, k) { // jarra medidora de 1 litro, nível = preço do litro
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(k * 2);
  ctx.beginPath(); ctx.moveTo(x - 110, yBase - h); ctx.lineTo(x + 110, yBase - h); ctx.lineTo(x + 96, yBase); ctx.lineTo(x - 96, yBase); ctx.closePath();
  ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fill(); ctx.strokeStyle = 'rgba(226,232,240,0.7)'; ctx.lineWidth = 5; ctx.stroke();
  ctx.save(); ctx.clip(); const top = yBase - h * fill * ease.out(clamp(k)); const g = ctx.createLinearGradient(0, top, 0, yBase); g.addColorStop(0, color); g.addColorStop(1, hexA(color, 0.7)); ctx.fillStyle = g; ctx.fillRect(x - 120, top, 240, yBase - top); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(x - 120, top - 10, 240, 12); ctx.restore();
  ctx.strokeStyle = 'rgba(226,232,240,0.6)'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(x + 104, yBase - h * 0.8); ctx.quadraticCurveTo(x + 190, yBase - h * 0.6, x + 100, yBase - h * 0.3); ctx.stroke();
  text(ctx, valor, x, yBase - h - 50, { size: 56, weight: 900, color: '#ffffff' }); text(ctx, label, x, yBase + 42, { size: 32, weight: 800, color: '#e2e8f0' });
  ctx.restore();
}
function iconeBar(ctx, kind, x, y, s, k) { // mesa, cadeira, garçom, copo, geladeira, aluguel
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * lerp(0.6, 1, ease.back(clamp(k))), s * lerp(0.6, 1, ease.back(clamp(k)))); ctx.globalAlpha *= clamp(k * 2);
  circle(ctx, 0, 0, 78, '#0b1222'); ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, 78, 0, 6.283); ctx.stroke();
  ctx.fillStyle = '#e9d5ff'; ctx.strokeStyle = '#e9d5ff'; ctx.lineWidth = 7; ctx.lineCap = 'round';
  if (kind === 'mesa') { ctx.fillRect(-46, -16, 92, 12); ctx.beginPath(); ctx.moveTo(-34, -4); ctx.lineTo(-40, 36); ctx.moveTo(34, -4); ctx.lineTo(40, 36); ctx.stroke(); }
  else if (kind === 'cadeira') { ctx.beginPath(); ctx.moveTo(-20, -40); ctx.lineTo(-20, 36); ctx.moveTo(-20, 4); ctx.lineTo(24, 4); ctx.lineTo(24, 36); ctx.stroke(); }
  else if (kind === 'garcom') { circle(ctx, 0, -28, 16, '#e9d5ff'); ctx.beginPath(); ctx.moveTo(-22, 36); ctx.lineTo(-22, 0); ctx.quadraticCurveTo(0, -12, 22, 0); ctx.lineTo(22, 36); ctx.stroke(); ctx.fillRect(28, -12, 30, 6); }
  else if (kind === 'copo') { ctx.beginPath(); ctx.moveTo(-22, -36); ctx.lineTo(22, -36); ctx.lineTo(16, 36); ctx.lineTo(-16, 36); ctx.closePath(); ctx.stroke(); for (let i = 0; i < 3; i++) circle(ctx, -10 + i * 10, -46 - i * 4, 4, '#93c5fd'); }
  else if (kind === 'geladeira') { strokeRR(ctx, -26, -40, 52, 80, 6, '#e9d5ff', 6); ctx.beginPath(); ctx.moveTo(-26, -6); ctx.lineTo(26, -6); ctx.stroke(); }
  else if (kind === 'aluguel') { ctx.beginPath(); ctx.moveTo(-40, -4); ctx.lineTo(0, -40); ctx.lineTo(40, -4); ctx.stroke(); ctx.strokeRect(-28, -4, 56, 40); }
  ctx.restore();
}
function scene09(K) {
  const tBar = K('a mesma cerveja no bar'), tBH = K('Em Belo Horizonte'), tGarr = K('uma garrafa de seiscentos mililitros'), t26 = K('Isso dá uns vinte e seis reais o litro'), tMerc = K('No mercado'), t115 = K('a lata de quatro reais sai a uns onze e meio');
  const tDobro = K('Mais que o dobro'), tImp = K('Mas a maior parte do imposto'), tJeito = K('do mesmo jeito'), tSobe = K('O que sobe no bar fica'), tComBar = K('com o bar');
  const tVende = K('E o bar não vende só a cerveja'), tMesa = K('Ele vende a mesa'), tCad = K('a cadeira'), tGar = K('o garçom'), tCopo = K('o copo lavado'), tGel = K('a geladeira que você não precisou'), tAlug = K('o aluguel numa rua');
  const tRot = K('E o mesmo rótulo pode custar o dobro'), tCid = K('na mesma cidade'), tOu = K('Ou seja'), tLugar = K('você paga mais pelo lugar');
  const cam = [
    { t: 0, x: 900, y: 500, z: 1.15, dx: 5 }, { t: tBH, x: 900, y: 480, z: 1.0, d: 1.8 }, { t: tGarr + 2, x: 820, y: 520, z: 1.14, d: 2 },
    { t: t26 - 0.3, x: 2200, y: 520, z: 1.2, d: 1.6 }, { t: tMerc, x: 2420, y: 520, z: 1.2, d: 1.6 }, { t: tDobro, x: 2300, y: 480, z: 1.05, d: 1.4 },
    { t: tImp, x: 2300, y: 480, z: 1.06, d: 2.4, dx: 4 }, { t: tVende - 0.3, x: 3800, y: 500, z: 1.0, d: 1.7 }, { t: tGel, x: 3860, y: 500, z: 1.1, d: 2 },
    { t: tRot - 0.3, x: 5200, y: 480, z: 1.15, d: 1.7 }, { t: tOu - 0.2, x: 5200, y: 480, z: 1.05, d: 1.6 }, { t: tLugar, x: 5200, y: 500, z: 1.08, d: 2 },
  ];
  const sfx = [[tBar, 'clink', 0.6], [tGarr, 'paper', 0.4], [tGarr + 3, 'pop', 0.5], [t26, 'liquid', 0.45, { dur: 1.4 }], [t115, 'liquid', 0.35, { dur: 1.2 }], [tDobro, 'hit', 0.5],
    [tImp, 'stamp', 0.4], [tSobe, 'coin', 0.5], ...[tMesa, tCad, tGar, tCopo, tGel, tAlug].map((x) => [x, 'pop', 0.4]), [tRot, 'clink', 0.5], [tCid, 'pop', 0.4], [tLugar, 'cash', 0.5]];
  return {
    accent: P.mercado, cam, sfx, impacts: [tDobro], trans: 'push',
    draw(ctx, t, cam2) {
      // fundo: bar à noite, luzes quentes desfocadas
      layer(ctx, cam2, 0.35, () => { const g = ctx.createLinearGradient(0, -300, 0, 1200); g.addColorStop(0, '#1a0f1f'); g.addColorStop(1, '#0b0710'); ctx.fillStyle = g; ctx.fillRect(-800, -400, 8600, 1600); const r = rng(21); for (let i = 0; i < 46; i++) { const x = r() * 7400 - 600, y = r() * 500, rad = 30 + r() * 60; const gg = ctx.createRadialGradient(x, y, 0, x, y, rad); gg.addColorStop(0, `rgba(253,186,116,${0.25 + r() * 0.2})`); gg.addColorStop(1, 'rgba(253,186,116,0)'); ctx.fillStyle = gg; ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2); } });
      mesaMadeira(ctx, 800, -800, 7000);
      if (t < tBH + 0.4) headline(ctx, 'no bar', 900, 420, { size: 96, k: vis(t, tBar, tBH, 0.4, 0.4), color: '#fde68a', color2: '#f59e0b' });
      zone(ctx, cam2, 800, 1320, () => {
      cardapio(ctx, 800, 470, 0.95, appear(t, tBH - 0.3, 0.6));
      if (t > tBH) chip(ctx, 1320, 200, 'Belo Horizonte, a capital dos bares', '#fde68a', vis(t, tBH, t26), { size: 28 });
      garrafa(ctx, 1260, 600, 1.0, { tag: 'PILSEN', alpha: appear(t, tGarr, 0.4) });
      });
      // jarras do litro: bar x mercado
      zone(ctx, cam2, 2050, 2550, () => {
      if (t > t26 - 0.4) {
        jarra(ctx, 2050, 740, 440, 26 / 28, '#fbbf24', 'no bar', 'R$ 26', prog(t, t26, 1.2));
        jarra(ctx, 2550, 740, 440, 11.5 / 28, '#fbbf24', 'no mercado', 'R$ 11,50', prog(t, t115, 1.2));
        cap(ctx, 'o preço de 1 litro', 2300, 160, { size: 34, alpha: vis(t, t26, tDobro - 0.1, 0.4, 0.3) });
        if (t > tDobro) headline(ctx, 'mais que o dobro', 2300, 150, { size: 56, k: vis(t, tDobro, tImp + 1), hl: '#7c2d12' });
        if (t > tImp) chip(ctx, 2300, 150, 'a maior parte do imposto já foi na fábrica', P.estado, appear(t, tImp + 1, 0.4), { size: 28 });
        if (t > tSobe) { const yT = 740 - 440 * (26 / 28), yM = 740 - 440 * (11.5 / 28); ctx.save(); ctx.globalAlpha *= appear(t, tSobe, 0.4); ctx.setLineDash([14, 10]); strokeRR(ctx, 1930, yT - 6, 240, yM - yT + 12, 10, '#c084fc', 6); ctx.restore(); chip(ctx, 1730, (yT + yM) / 2, 'fica com o bar', '#d8b4fe', appear(t, tComBar, 0.4), { size: 30 }); }
      }
      });
      // o que o bar vende
      zone(ctx, cam2, 3300, 4300, () => {
      if (t > tVende - 0.4) {
        const a = appear(t, tVende - 0.4, 0.5) * (1 - appear(t, tRot - 0.3, 0.5));
        ctx.save(); ctx.globalAlpha *= a;
        headline(ctx, 'o bar não vende só a cerveja', 3800, 160, { size: 52, k: appear(t, tVende, 0.4) });
        [['mesa', tMesa], ['cadeira', tCad], ['garcom', tGar], ['copo', tCopo], ['geladeira', tGel], ['aluguel', tAlug]].forEach(([kd, tc], i) => {
          const x = 3300 + (i % 3) * 500, y = 340 + Math.floor(i / 3) * 260; iconeBar(ctx, kd, x, y, 1.4, appear(t, tc, 0.4));
          text(ctx, { mesa: 'a mesa', cadeira: 'a cadeira', garcom: 'o garçom', copo: 'o copo lavado', geladeira: 'a geladeira', aluguel: 'o aluguel' }[kd], x, y + 132, { size: 30, weight: 800, color: '#e9d5ff', alpha: appear(t, tc, 0.4) });
        });
        ctx.restore();
      }
      });
      // o mesmo rótulo pelo dobro
      zone(ctx, cam2, 4900, 5500, () => {
      if (t > tRot - 0.4) {
        const a = appear(t, tRot - 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= a;
        garrafa(ctx, 4900, 540, 1.35, { tag: 'PILSEN' }); garrafa(ctx, 5500, 540, 1.35, { tag: 'PILSEN' });
        chip(ctx, 4900, 220, 'bar A: R$ 9', '#e2e8f0', appear(t, tRot, 0.4), { size: 42 }); chip(ctx, 5500, 220, 'bar B: R$ 18', '#fca5a5', appear(t, tRot + 0.8, 0.4), { size: 42 });
        if (t > tRot + 0.8) text(ctx, '×2', 5200, 500, { size: 120, weight: 900, color: '#fca5a5', alpha: appear(t, tRot + 1.2, 0.4) });
        if (t > tCid) cap(ctx, 'mesma cidade, mesmo rótulo (exemplo)', 5200, 130, { size: 30, alpha: appear(t, tCid, 0.4) });
        if (t > tLugar) headline(ctx, 'você paga mais pelo lugar', 5200, 750, { size: 54, k: appear(t, tLugar, 0.4), hl: '#581c87' });
        ctx.restore();
      }
      });
      bokeh(ctx, cam2, t, 23, 12, '#fdba74', 0.13);
    },
    overlay(ctx, t) { source(ctx, 'Mercado Mineiro via Itatiaia e O Tempo (maio/2026)', vis(t, tBH, tVende, 0.5, 0.4)); },
  };
}

// ================================================================ Cena 10: três coisas na sua mão
function calendarioFev(ctx, x, y, s, k, marcado) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= clamp(k * 2);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 26; fillRR(ctx, -330, -300, 660, 600, 22, '#f8fafc'); ctx.restore();
  fillRR(ctx, -330, -300, 660, 96, 22, P.red); ctx.fillStyle = P.red; ctx.fillRect(-330, -230, 660, 26);
  text(ctx, 'FEVEREIRO 2027', 0, -250, { size: 40, weight: 900, color: '#fff', letter: 3 });
  ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].forEach((d, i) => text(ctx, d, -270 + i * 90, -160, { size: 24, weight: 900, color: '#6b7280' }));
  for (let d = 1; d <= 28; d++) { const i = d - 1, c = i % 7, r2 = Math.floor(i / 7); const xx = -270 + c * 90, yy = -90 + r2 * 90; if (d === 2 && marcado > 0) { ctx.save(); ctx.strokeStyle = P.red; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(xx, yy, 34 * ease.out(clamp(marcado)), 0, 6.283); ctx.stroke(); ctx.restore(); } text(ctx, String(d), xx, yy, { size: 32, weight: 800, color: '#111827' }); }
  ctx.restore();
}
function postit(ctx, x, y, s, lines, k) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(0.05); ctx.scale(s * lerp(0.7, 1, ease.back(clamp(k))), s * lerp(0.7, 1, ease.back(clamp(k)))); ctx.globalAlpha *= clamp(k * 2);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 8; fillRR(ctx, -190, -150, 380, 300, 6, '#fde047'); ctx.restore();
  lines.forEach((l, i) => text(ctx, l, -160, -90 + i * 62, { size: 28, weight: 800, color: '#1c1917', align: 'left' }));
  ctx.restore();
}
function scene10(K) {
  const tFazer = K('E o que dá pra fazer com isso'), tTres = K('Três coisas'), t1 = K('A primeira'), tLitro = K('olha o preço do litro'), tNao = K('não o preço da lata'), tEtq = K('A etiqueta da prateleira'), tRegra = K('é regra');
  const tMenor = K('A latinha menor parece mais barata'), tCaro = K('mas o litro dela costuma sair mais caro'), t2 = K('A segunda'), tRet = K('a garrafa retornável'), tVolta = K('Ela volta pra fábrica'), t20v = K('umas vinte vezes'), tCusto = K('então não carrega o custo');
  const tPesq = K('Nas pesquisas dos últimos anos'), tMais = K('o litro da retornável saiu'), t3 = K('A terceira'), tTeste = K('em fevereiro, faz o teste'), tAnota = K('Anota hoje o preço'), tSe = K('Se ela subir muito'), tSabe = K('você já sabe'), tSoz = K('não foi o imposto do pecado sozinho'), tLugar = K('porque ele entra no lugar');
  const cam = [
    { t: 0, x: 960, y: 500, z: 1.0 }, { t: t1 - 0.2, x: 960, y: 500, z: 1.1, d: 1.4 }, { t: tEtq - 0.2, x: 960, y: 520, z: 1.25, d: 1.6 }, { t: tMenor - 0.3, x: 1400, y: 500, z: 0.98, d: 1.6, dx: 5 }, { t: tCaro + 1, x: 1500, y: 520, z: 1.08, d: 1.6 },
    { t: t2 - 0.3, x: 2950, y: 480, z: 1.15, d: 1.7 }, { t: tVolta, x: 3150, y: 480, z: 1.15, d: 2 }, { t: tMais, x: 3050, y: 460, z: 1.05, d: 2 },
    { t: t3 - 0.3, x: 4450, y: 480, z: 1.12, d: 1.7 }, { t: tAnota + 1.4, x: 4750, y: 470, z: 1.15, d: 2 }, { t: tSabe, x: 4620, y: 490, z: 1.02, d: 1.8 },
  ];
  const sfx = [[tTres, 'pop', 0.5], [t1, 'pop', 0.5], [tLitro, 'scan', 0.6], [tEtq, 'paper', 0.4], [tRegra, 'stamp', 0.5], [tMenor, 'pop', 0.4], [tCaro, 'hit', 0.4], [t2, 'pop', 0.5], [tRet, 'crate', 0.8], [tVolta, 'whoosh', 0.3], [t20v, 'clink', 0.5],
    [tMais, 'coin', 0.5], [t3, 'pop', 0.5], [tTeste, 'paper', 0.5], [tAnota, 'chalk', 0.3, { dur: 1.2 }], [tAnota + 3, 'pop', 0.4], [tSoz, 'pop', 0.4]];
  return {
    accent: P.ok, cam, sfx, impacts: [tRegra], trans: 'push',
    draw(ctx, t, cam2) {
      geladeiraFundo(ctx, cam2, 0.8);
      ctx.fillStyle = '#cbd5e1'; ctx.fillRect(-600, 700, 6400, 30); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(-600, 730, 6400, 12); // prateleira
      if (t > tFazer) headline(ctx, 'o que dá pra fazer?', 960, 380, { size: 80, k: vis(t, tFazer, t1 - 0.3, 0.4, 0.3) });
      if (t > tTres) chip(ctx, 960, 500, 'três coisas', P.ok, vis(t, tTres, t1 - 0.3, 0.4, 0.3), { size: 44 });
      // 1: preço do litro
      zone(ctx, cam2, 960, 1640, () => {
      if (t > t1 - 0.3) {
        chip(ctx, 960, 160, '1 · o preço do litro, não o da lata', '#bbf7d0', appear(t, t1, 0.4) * (1 - appear(t, t2 - 0.4, 0.4)), { size: 32 });
        lata(ctx, 960, 520, 0.85, { t });
        etiquetaPrateleira(ctx, 960, 790 - 80, 0.75, { hlLitro: prog(t, tEtq, 0.5) });
        if (t > tRegra) chip(ctx, 1300, 600, 'é regra: tem que mostrar', '#fde68a', appear(t, tRegra, 0.4), { size: 26 });
        // latinha menor x lata
        if (t > tMenor - 0.3) {
          lata(ctx, 1600, 560, 0.62, { t, alpha: appear(t, tMenor - 0.3, 0.4) });
          etiquetaPrateleira(ctx, 1640, 790 - 80, 0.6, { nome: 'CERVEJA PILSEN LATA 269 ML', preco: '3,29', litro: 'PREÇO POR LITRO R$ 12,23', hlLitro: prog(t, tCaro, 0.5), alpha: appear(t, tMenor, 0.4) });
          if (t > tCaro) chip(ctx, 1640, 300, 'o litro sai mais caro', P.uniao, appear(t, tCaro, 0.4), { size: 28 });
          if (t > tMenor) cap(ctx, 'preços de exemplo', 1300, 760, { size: 24, alpha: appear(t, tMenor, 0.4) });
        }
      }
      });
      // 2: retornável
      zone(ctx, cam2, 2850, 3470, () => {
      if (t > t2 - 0.4) {
        const a = appear(t, t2 - 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= a;
        chip(ctx, 3000, 160, '2 · a garrafa retornável', '#bbf7d0', 1, { size: 32 });
        engradado(ctx, 2820, 600, 1.05, prog(t, tRet, 1.2));
        if (t > tVolta) { // volta pra fábrica e é usada de novo (laço)
          const k = prog(t, tVolta, 1.6); ctx.save(); ctx.strokeStyle = P.ok; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.ellipse(3470, 440, 170, 125, 0, -1.4, -1.4 + 6.0 * ease.out(k)); ctx.stroke(); ctx.restore();
          text(ctx, 'fábrica', 3470, 290, { size: 32, weight: 900, color: '#bbf7d0', alpha: k }); text(ctx, 'você', 3470, 600, { size: 32, weight: 900, color: '#bbf7d0', alpha: k });
        }
        if (t > t20v) bigNum(ctx, '20 vezes', 3470, 450, appear(t, t20v, 0.4), { size: 52, color: '#bbf7d0', glow: hexA(P.ok, 0.5) });
        if (t > tMais) { bigNum(ctx, '20 a 30%', 2850, 300, appear(t, tMais + 0.8, 0.4), { size: 92, color: '#bbf7d0', glow: hexA(P.ok, 0.5) }); cap(ctx, 'mais barato por litro que as descartáveis', 2850, 380, { size: 28, alpha: appear(t, tMais + 1.2, 0.4) }); }
        ctx.restore();
      }
      });
      // 3: o teste de fevereiro
      zone(ctx, cam2, 4300, 4960, () => {
      if (t > t3 - 0.4) {
        const a = appear(t, t3 - 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= a;
        chip(ctx, 4620, 110, '3 · em fevereiro, faz o teste', '#bbf7d0', 1, { size: 32 });
        calendarioFev(ctx, 4280, 450, 0.98, appear(t, tTeste, 0.5), prog(t, tAnota + 3, 0.6));
        postit(ctx, 4960, 420, 1.15, ['preço hoje: R$ ____', 'depois do dia 2:', 'R$ ____'], appear(t, tAnota, 0.5));
        if (t > tSoz) headline(ctx, 'não foi o imposto do pecado sozinho', 4550, 790, { size: 46, k: appear(t, tSoz, 0.4), hl: '#065f46' });
        ctx.restore();
      }
      });
      bokeh(ctx, cam2, t, 31, 10);
    },
    overlay(ctx, t) {
      source(ctx, 'Lei 10.962/2004 e Decreto 5.903/2006 (MJSP)', vis(t, tEtq, t2, 0.5, 0.4));
      source(ctx, 'Valor (2017) e UOL (2019)', vis(t, tPesq, t3, 0.5, 0.4));
    },
  };
}

// ================================================================ Cena 11: fechamento, inscrição e próximo vídeo
function cartaoEmbarque(ctx, x, y, s, k) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y + (1 - ease.out(clamp(k))) * 60); ctx.rotate(-0.04); ctx.scale(s, s); ctx.globalAlpha *= clamp(k * 2);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 34; ctx.shadowOffsetY = 14; fillRR(ctx, -480, -190, 960, 380, 26, '#f8fafc'); ctx.restore();
  fillRR(ctx, -480, -190, 960, 92, 26, '#1d4ed8'); ctx.fillStyle = '#1d4ed8'; ctx.fillRect(-480, -120, 960, 22);
  text(ctx, 'CARTÃO DE EMBARQUE', -440, -144, { size: 32, weight: 900, color: '#ffffff', align: 'left', letter: 3 });
  ctx.save(); ctx.translate(380, -144); ctx.rotate(0.3); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(-40, 0); ctx.lineTo(40, -4); ctx.lineTo(50, 0); ctx.lineTo(40, 4); ctx.closePath(); ctx.fill(); ctx.fillRect(-6, -30, 14, 60); ctx.fillRect(-36, -12, 8, 24); ctx.restore();
  text(ctx, 'PRÓXIMO VÍDEO', -440, -40, { size: 26, weight: 900, color: '#64748b', align: 'left', letter: 3 });
  text(ctx, 'por que a passagem de avião', -440, 20, { size: 46, weight: 900, color: '#0f172a', align: 'left' });
  text(ctx, 'está tão cara?', -440, 80, { size: 46, weight: 900, color: '#0f172a', align: 'left' });
  ctx.setLineDash([10, 10]); ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(240, -80); ctx.lineTo(240, 170); ctx.stroke(); ctx.setLineDash([]);
  text(ctx, 'quem fica com', 360, 0, { size: 28, weight: 800, color: '#1d4ed8' }); text(ctx, 'cada real', 360, 40, { size: 28, weight: 800, color: '#1d4ed8' });
  ctx.restore();
}
function scene11(K) {
  const tEnt = K('da próxima vez que você abrir uma lata'), tLembra = K('lembra'), t30 = K('uns trinta centavos de cada real são imposto'), tMuito = K('É muito'), tMetade = K('Mas não é mais da metade'), tOutro = K('a não ser que você conte');
  const tFab = K('O maior pedaço fica na fábrica'), tPaga = K('que paga o malte e o alumínio'), tPec = K('E o imposto do pecado'), tTroca = K('troca um imposto por outro'), tFrase = K('O pecado mesmo é a porcentagem sem a base');
  const tAjud = K('Se esse vídeo te ajudou'), tInsc = K('se inscreve no canal'), tProx = K('No próximo'), tAero = K('a gente sai do churrasco'), tAviao = K('por que a passagem de avião'), tCada = K('e quem fica com cada real'), tAte = K('Até lá');
  const tScan = tInsc + 0.3, tSw = tInsc + 0.9;
  const cam = [
    { t: 0, x: 960, y: 520, z: 1.25, dz: 0.004 }, { t: tLembra, x: 960, y: 500, z: 1.05, d: 1.8 }, { t: tMetade, x: 1000, y: 500, z: 0.98, d: 1.6 }, { t: tFab, x: 1060, y: 520, z: 1.1, d: 1.8, dx: -4 },
    { t: tPec - 0.2, x: 960, y: 500, z: 1.0, d: 1.6 }, { t: tFrase - 0.2, x: 960, y: 460, z: 1.08, d: 2.4 },
    { t: tAjud - 0.3, x: 2600, y: 520, z: 1.05, d: 1.6 }, { t: tScan, x: 2600, y: 560, z: 1.22, d: 1.2 }, { t: tSw + 1, x: 2600, y: 520, z: 1.05, d: 1.6 },
    { t: tProx - 0.3, x: 4200, y: 500, z: 0.98, d: 1.7, dz: 0.008 }, { t: tCada, x: 4200, y: 500, z: 1.08, d: 2.4 },
  ];
  const sfx = [[tEnt + 0.4, 'canopen', 0.8], [tEnt + 0.6, 'fizz', 0.5, { dur: 1.2 }], [t30, 'coin', 0.5], [tMetade, 'pop', 0.5], [tFab, 'pop', 0.4], [tTroca, 'whoosh', 0.3], [tFrase, 'stamp', 0.7],
    [tAjud, 'pop', 0.4], [tScan, 'scan', 0.9], [tSw, 'printer', 0.5, { dur: 0.6 }], [tSw + 0.7, 'ding', 0.6], [tProx, 'paper', 0.5], [tAero, 'whoosh', 0.4, { dur: 1 }], [tCada, 'pop', 0.4]];
  return {
    accent: P.beer, cam, sfx, impacts: [tFrase], trans: 'push',
    draw(ctx, t, cam2) {
      geladeiraFundo(ctx, cam2, 0.7);
      mesaMadeira(ctx, 780, -600, 6000);
      // a lata com o rótulo nas 3 cores (30 / 20 / 50)
      zone(ctx, cam2, 800, 1400, () => {
      const bk = ease.inOut(prog(t, t30, 1.2));
      lata(ctx, 960, 560, 1.1, { t, rot: t * 0.03, open: prog(t, tEnt + 0.4, 0.25), bands: (c, x0, top, w, lh) => { if (bk <= 0) return; c.save(); c.globalAlpha *= bk; let y = top; [[0.3, P.estado], [0.2, P.mercado], [0.5, P.fabrica]].forEach(([f, col]) => { c.fillStyle = hexA(col, 0.85); c.fillRect(x0, y, w, lh * f); y += lh * f; }); c.restore(); } });
      if (t > t30) { chip(ctx, 1380, 360, '30 imposto', '#fde68a', appear(t, t30 + 0.4, 0.4), { size: 42 }); chip(ctx, 1380, 470, '20 mercado', '#e9d5ff', appear(t, t30 + 0.8, 0.4), { size: 42 }); chip(ctx, 1380, 580, '50 fábrica', '#bfdbfe', appear(t, t30 + 1.2, 0.4), { size: 42 }); cap(ctx, 'de cada real', 1380, 260, { size: 38, alpha: appear(t, t30, 0.4) }); }
      if (t > tMuito) chip(ctx, 560, 300, 'é muito', '#fde68a', vis(t, tMuito, tPec), { size: 42 });
      if (t > tMetade) chip(ctx, 520, 410, 'mas não é mais da metade', '#e2e8f0', vis(t, tMetade, tPec), { size: 36 });
      if (t > tPaga) chip(ctx, 520, 520, 'malte e alumínio em dólar', P.dolar, vis(t, tPaga, tPec), { size: 34 });
      if (t > tTroca) { chip(ctx, 620, 300, 'IPI 3,9%', '#94a3b8', vis(t, tTroca, tFrase), { size: 30 }); arrow(ctx, 720, 300, 820, 300, '#e2e8f0', 5, prog(t, tTroca + 0.3, 0.3) * (1 - prog(t, tFrase, 0.3))); chip(ctx, 960, 300, 'seletivo 4,2%', '#fde68a', vis(t, tTroca + 0.5, tFrase), { size: 30 }); }
      if (t > tFrase) { fillRR(ctx, 240, 120, 1440, 170, 26, 'rgba(6,10,20,0.85)', appear(t, tFrase, 0.4)); headline(ctx, 'o pecado mesmo é a porcentagem sem a base', 960, 205, { size: 54, k: appear(t, tFrase, 0.5), color: '#fef08a', color2: '#facc15' }); }
      });
      // inscrição: a etiqueta da prateleira vira "INSCREVA-SE" com o leitor do caixa
      zone(ctx, cam2, 2250, 3060, () => {
      if (t > tAjud - 0.4) {
        const a = appear(t, tAjud - 0.4, 0.5), sw = prog(t, tSw, 0.5);
        ctx.save(); ctx.globalAlpha *= a;
        lata(ctx, 2250, 560, 0.85, { t });
        etiquetaPrateleira(ctx, 2700, 520, 1.0 * (1 + 0.04 * Math.sin(prog(t, tSw, 0.5) * Math.PI)), { preco: sw < 0.5 ? '4,00' : '', nome: sw < 0.5 ? 'CERVEJA PILSEN LATA 350 ML' : 'ESTE CANAL', litro: sw < 0.5 ? 'PREÇO POR LITRO R$ 11,43' : 'ABRE O PREÇO DE TUDO' });
        if (sw >= 0.5) { headline(ctx, 'INSCREVA-SE', 2700, 528, { size: 60, color: '#ffffff', k: prog(t, tSw + 0.25, 0.4), depth: 4 }); }
        // leitor de código de barras com o feixe vermelho
        const sc = prog(t, tScan - 0.4, 0.4);
        if (sc > 0) { ctx.save(); ctx.translate(2700, 360 - 60 * (1 - ease.out(sc))); fillRR(ctx, -60, -150, 120, 120, 18, '#111827'); fillRR(ctx, -30, -40, 60, 30, 6, '#1f2937'); ctx.globalAlpha *= clamp((t - tScan) * 4) * (1 - prog(t, tSw + 0.2, 0.3)); ctx.fillStyle = 'rgba(239,68,68,0.6)'; ctx.beginPath(); ctx.moveTo(-26, -10); ctx.lineTo(26, -10); ctx.lineTo(240, 260); ctx.lineTo(-240, 260); ctx.closePath(); ctx.fill(); ctx.restore(); }
        if (t > tSw + 0.7) { check(ctx, 3060, 380, 1.2, P.ok, prog(t, tSw + 0.7, 0.5)); chip(ctx, 2700, 760, 'INSCRITO', P.ok, appear(t, tSw + 0.9, 0.4), { size: 34 }); }
        ctx.restore();
      }
      });
      // próximo vídeo
      zone(ctx, cam2, 4200, 4200, () => {
      if (t > tProx - 0.4) {
        const a = appear(t, tProx - 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= a;
        if (t > tAero) { const k = ease.inOut(prog(t, tAero, 2.2)); ctx.save(); ctx.translate(lerp(3500, 4900, k), lerp(260, 140, k)); ctx.rotate(-0.12); ctx.fillStyle = '#e2e8f0'; ctx.beginPath(); ctx.moveTo(-70, 0); ctx.lineTo(70, -6); ctx.lineTo(90, 0); ctx.lineTo(70, 6); ctx.closePath(); ctx.fill(); ctx.fillRect(-10, -46, 24, 92); ctx.fillRect(-60, -18, 12, 36); ctx.restore(); }
        cartaoEmbarque(ctx, 4200, 520, 1.0, appear(t, tAero + 0.6, 0.6));
        ctx.restore();
      }
      });
    },
  };
}

export const SCENES = [
  { id: '01', name: 'imposto-novo-e-56', build: scene01 },
  { id: '02', name: 'dentro-da-lata', build: scene02 },
  { id: '03', name: 'a-fabrica', build: scene03 },
  { id: '04', name: 'o-imposto-viaja-na-frente', build: scene04 },
  { id: '05', name: 'a-lata-aberta', build: scene05 },
  { id: '06', name: '56-x-30', build: scene06 },
  { id: '07', name: 'imposto-do-pecado', build: scene07 },
  { id: '08', name: 'por-que-sobe', build: scene08 },
  { id: '09', name: 'o-bar', build: scene09 },
  { id: '10', name: 'na-sua-mao', build: scene10 },
  { id: '11', name: 'fechamento', build: scene11 },
];
