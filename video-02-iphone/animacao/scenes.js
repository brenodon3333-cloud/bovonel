// Cenas do vídeo 02: Por que o iPhone custa quase o dobro no Brasil?
// K('frase') devolve o instante (s, desde o início da cena) em que a frase começa a ser falada,
// medido no começo real da palavra (tools/alinhar.mjs). Tudo que aparece, cada movimento de
// câmera e cada efeito sonoro usa esses instantes.

// Cores fixas do canal: aparelho/empresa azul, impostos federais em vermelhos, ICMS laranja, resto roxo.
export const SLICES = [
  { key: 'aparelho', name: 'O iPhone', long: 'O iPhone (preço dos EUA)', val: 6139, pct: 51, color: C.petro },
  { key: 'ii', name: 'Importação', long: 'Imposto de importação', val: 982, pct: 8, color: '#fb7185' },
  { key: 'ipi', name: 'IPI', long: 'IPI', val: 1565, pct: 13, color: '#ef4444' },
  { key: 'pis', name: 'PIS e Cofins', long: 'PIS e Cofins', val: 765, pct: 6, color: '#e11d48' },
  { key: 'icms', name: 'ICMS (estado)', long: 'ICMS (estado)', val: 2160, pct: 18, color: C.icms },
  { key: 'resto', name: 'O resto', long: 'Frete, garantia e margem', val: 388, pct: 3, color: C.dist },
];
const S = Object.fromEntries(SLICES.map((s) => [s.key, s]));
const TAX = ['ii', 'ipi', 'pis', 'icms'];
const PRICE = 11999, USD = 1199, FX = 5.12;

const ticks = (sfx, t0, t1, step = 0.07) => { for (let t = t0; t < t1; t += step) sfx.push([t, 'tick', 0.5]); };
const HOME = { x: 960, y: 540, z: 1 };
// "R$ 11.999" (inteiros com ponto de milhar)
const brlI = (v) => 'R$ ' + Math.round(v).toLocaleString('pt-BR');
const usdI = (v) => 'US$ ' + Math.round(v).toLocaleString('pt-BR');

// ---------------------------------------------------------------- peças comuns
// iPhone visto de frente. o.slices: [{color, frac}] pinta a tela em faixas de baixo para cima.
function phone(ctx, x, y, h, o = {}) {
  const w = h * 0.49, r = h * 0.13, bez = h * 0.022;
  ctx.save();
  ctx.translate(x, y);
  if (o.rot) ctx.rotate(o.rot);
  ctx.globalAlpha *= o.alpha ?? 1;
  ctx.save();
  ctx.shadowColor = o.glow || 'rgba(0,0,0,0.6)'; ctx.shadowBlur = o.glow ? 60 : 30;
  fillRR(ctx, -w / 2, -h / 2, w, h, r, '#9aa4b2');
  ctx.restore();
  const g = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
  g.addColorStop(0, '#d7dde5'); g.addColorStop(0.5, '#7b8592'); g.addColorStop(1, '#c5ccd6');
  ctx.fillStyle = g; rr(ctx, -w / 2, -h / 2, w, h, r); ctx.fill();
  const sx = -w / 2 + bez, sy = -h / 2 + bez, sw = w - bez * 2, sh = h - bez * 2, sr = r - bez;
  fillRR(ctx, sx, sy, sw, sh, sr, '#05070d');
  ctx.save(); rr(ctx, sx, sy, sw, sh, sr); ctx.clip();
  const sg = ctx.createLinearGradient(sx, sy, sx + sw, sy + sh);
  sg.addColorStop(0, '#111a33'); sg.addColorStop(1, '#0a0f1e');
  ctx.fillStyle = sg; ctx.fillRect(sx, sy, sw, sh);
  if (o.slices) {
    let yy = sy + sh;
    for (const s of o.slices) {
      const hh = sh * s.frac;
      ctx.globalAlpha = s.alpha ?? 1;
      ctx.fillStyle = s.color; ctx.fillRect(sx, yy - hh, sw, hh);
      ctx.globalAlpha = 1;
      yy -= hh;
    }
  }
  if (o.screen) o.screen(ctx, sx, sy, sw, sh);
  // reflexo
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + sw * 0.6, sy); ctx.lineTo(sx, sy + sh * 0.5); ctx.closePath(); ctx.fill();
  ctx.restore();
  fillRR(ctx, -w * 0.17, sy + h * 0.025, w * 0.34, h * 0.042, h * 0.021, '#000');
  ctx.restore();
}
function iconPhone(ctx, x, y, s, color) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 100, s / 100);
  fillRR(ctx, -27, -52, 54, 104, 12, color);
  fillRR(ctx, -22, -46, 44, 92, 8, 'rgba(0,0,0,0.45)');
  fillRR(ctx, -9, -42, 18, 5, 2.5, color);
  ctx.restore();
}
function iconStamp(ctx, x, y, s, color) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 100, s / 100);
  ctx.fillStyle = color;
  rr(ctx, -12, -54, 24, 40, 10); ctx.fill();
  rr(ctx, -34, -18, 68, 18, 6); ctx.fill();
  rr(ctx, -46, 2, 92, 22, 6); ctx.fill();
  ctx.fillRect(-50, 36, 100, 8);
  ctx.restore();
}
function iconFactory(ctx, x, y, s, color) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 100, s / 100);
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(-54, 46); ctx.lineTo(-54, -6); ctx.lineTo(-24, 10); ctx.lineTo(-24, -6); ctx.lineTo(6, 10); ctx.lineTo(6, -6); ctx.lineTo(36, 10);
  ctx.lineTo(36, -50); ctx.lineTo(54, -50); ctx.lineTo(54, 46); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  for (const dx of [-42, -14, 14]) ctx.fillRect(dx, 22, 16, 12);
  ctx.restore();
}
function iconPlane(ctx, x, y, s, color) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 100, s / 100); ctx.rotate(-0.3);
  ctx.fillStyle = color;
  rr(ctx, -56, -9, 112, 18, 9); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-6, -6); ctx.lineTo(-30, -52); ctx.lineTo(-14, -52); ctx.lineTo(22, -6); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-6, 6); ctx.lineTo(-30, 52); ctx.lineTo(-14, 52); ctx.lineTo(22, 6); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-50, -4); ctx.lineTo(-62, -26); ctx.lineTo(-52, -26); ctx.lineTo(-38, -4); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function iconStore(ctx, x, y, s, color) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 100, s / 100);
  ctx.strokeStyle = color; ctx.lineWidth = 8; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, -22, 20, Math.PI, 0); ctx.stroke();
  ctx.fillStyle = color; rr(ctx, -42, -22, 84, 72, 12); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.arc(0, 12, 12, 0, 6.283); ctx.fill();
  ctx.restore();
}
function iconShield(ctx, x, y, s, color) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 100, s / 100);
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(0, -52); ctx.lineTo(44, -34); ctx.quadraticCurveTo(44, 26, 0, 52); ctx.quadraticCurveTo(-44, 26, -44, -34); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(-3, 14); ctx.lineTo(20, -14); ctx.stroke();
  ctx.restore();
}
function iconPercent(ctx, x, y, s, color) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 100, s / 100);
  ctx.strokeStyle = color; ctx.lineWidth = 10; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(34, -40); ctx.lineTo(-34, 40); ctx.stroke();
  ctx.lineWidth = 9;
  ctx.beginPath(); ctx.arc(-24, -24, 15, 0, 6.283); ctx.stroke();
  ctx.beginPath(); ctx.arc(24, 24, 15, 0, 6.283); ctx.stroke();
  ctx.restore();
}
function iconBox(ctx, x, y, s, color) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 100, s / 100);
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(0, -48); ctx.lineTo(50, -24); ctx.lineTo(50, 30); ctx.lineTo(0, 54); ctx.lineTo(-50, 30); ctx.lineTo(-50, -24); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(-50, -24); ctx.lineTo(0, 0); ctx.lineTo(50, -24); ctx.moveTo(0, 0); ctx.lineTo(0, 54); ctx.stroke();
  ctx.restore();
}
function iconCoins(ctx, x, y, s, color) {
  iconCoin(ctx, x - s * 0.2, y + s * 0.08, s * 0.34, color, '');
  iconCoin(ctx, x + s * 0.2, y - s * 0.08, s * 0.34, color, '');
}
function iconClock(ctx, x, y, s, color) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 100, s / 100);
  ctx.strokeStyle = color; ctx.lineWidth = 9; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, 0, 46, 0, 6.283); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -28); ctx.moveTo(0, 0); ctx.lineTo(20, 12); ctx.stroke();
  ctx.restore();
}

function flowLine(ctx, x1, y1, x2, y2, k, color, t) {
  if (k <= 0) return;
  const xe = lerp(x1, x2, k), ye = lerp(y1, y2, k);
  ctx.save();
  ctx.strokeStyle = hexA(color, 0.3);
  ctx.lineWidth = 16; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(xe, ye); ctx.stroke();
  ctx.setLineDash([18, 22]);
  ctx.lineDashOffset = -t * 80;
  ctx.strokeStyle = color; ctx.lineWidth = 6;
  ctx.shadowColor = color; ctx.shadowBlur = 16;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(xe, ye); ctx.stroke();
  ctx.restore();
  if (k < 1) circle(ctx, xe, ye, 12, color);
}

function node(ctx, t, start, x, y, icon, color, label, sub, subColor) {
  const k = appear(t, start, 0.7, ease.back);
  if (k <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  const pulse = 1 + 0.03 * Math.sin(t * 3);
  circle(ctx, 0, 0, 115 * pulse, hexA(color, 0.10));
  circle(ctx, 0, 0, 100, hexA(color, 0.16));
  ctx.save(); ctx.strokeStyle = hexA(color, 0.7); ctx.lineWidth = 4; ctx.shadowColor = color; ctx.shadowBlur = 20;
  ctx.beginPath(); ctx.arc(0, 0, 100, 0, 6.283); ctx.stroke(); ctx.restore();
  icon(ctx, 0, 4, 110, color);
  ctx.restore();
  text(ctx, label, x, y + 150, { size: 40, alpha: k });
  if (sub) text(ctx, sub, x, y + 198, { size: 30, weight: subColor ? 700 : 500, color: subColor || C.muted, alpha: appear(t, start + 0.3) });
}

// Cartão que entra deslizando, com brilho na borda.
function fact(ctx, t, t0, x, y, w, h, title, sub, accent) {
  const k = appear(t, t0, 0.55);
  if (k <= 0) return;
  ctx.save();
  ctx.translate((1 - k) * 80, 0);
  ctx.shadowColor = hexA(accent, 0.5 * (1 - prog(t, t0 + 0.4, 1.2)));
  ctx.shadowBlur = 40;
  card(ctx, x, y, w, h, k, accent);
  ctx.restore();
  ctx.save(); ctx.translate((1 - k) * 80, 0);
  if (sub) {
    text(ctx, title, x + 44, y + h / 2 - 20, { size: 40, align: 'left', alpha: k, maxWidth: w - 70 });
    text(ctx, sub, x + 44, y + h / 2 + 26, { size: 28, weight: 500, color: C.muted, align: 'left', alpha: k, maxWidth: w - 70 });
  } else {
    text(ctx, title, x + 44, y + h / 2 + 2, { size: 40, align: 'left', alpha: k, maxWidth: w - 70 });
  }
  ctx.restore();
}
function pill(ctx, x, y, w, h, label, color, k, o = {}) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  fillRR(ctx, -w / 2, -h / 2, w, h, h / 2, hexA(color, 0.18));
  ctx.save(); ctx.shadowColor = color; ctx.shadowBlur = o.glow ?? 24; strokeRR(ctx, -w / 2, -h / 2, w, h, h / 2, color, 3); ctx.restore();
  text(ctx, label, 0, 2, { size: o.size || 34, weight: o.weight || 800, color: o.color || C.text });
  ctx.restore();
}
function overlaySource(ctx, str, a) { source(ctx, str, a); }

// Barra do preço (empilhada), usada nas cenas das fatias.
function priceBar(ctx, t, upto, current, startK, o = {}) {
  const x = 140, y = 800, w = W - 280, h = 40;
  text(ctx, o.label || 'O iPhone 18 Pro de R$ 11.999', x, y - 34, { size: 28, weight: 600, color: C.muted, align: 'left', alpha: o.alpha ?? 1 });
  fillRR(ctx, x, y, w, h, 12, 'rgba(255,255,255,0.06)', o.alpha ?? 1);
  ctx.save();
  ctx.globalAlpha *= o.alpha ?? 1;
  rr(ctx, x, y, w, h, 12);
  ctx.clip();
  let cx = x;
  for (let i = 0; i < SLICES.length; i++) {
    const sw = (SLICES[i].val / PRICE) * w;
    if (i < upto) {
      ctx.globalAlpha = 0.45 * (o.alpha ?? 1);
      ctx.fillStyle = SLICES[i].color;
      ctx.fillRect(cx, y, sw, h);
    } else if (i === current) {
      ctx.globalAlpha = o.alpha ?? 1;
      ctx.fillStyle = SLICES[i].color;
      ctx.fillRect(cx, y, sw * startK, h);
    }
    cx += sw;
  }
  ctx.restore();
}

// ---------------------------------------------------------------- Cenas 04 a 09: base das fatias
const RX = 860, RW = 940;
function sliceBase(ctx, t, idx, slice, icon, tValue, o = {}) {
  const barA = appear(t, o.barAt ?? 2, 0.6);
  const k = appear(t, 0.1, 0.6);
  text(ctx, `FATIA ${idx + 1} DE 6`, 140, 170, { size: 28, weight: 700, color: C.muted, align: 'left', alpha: k, letter: 3 });
  glowText(ctx, o.title || slice.long, 140, 232, { size: 64, weight: 900, color: slice.color, align: 'left', alpha: k, glow: hexA(slice.color, 0.45), maxWidth: 700 });
  const ik = appear(t, 0.3, 0.8, ease.back);
  if (ik > 0) {
    ctx.save(); ctx.translate(430, 430); ctx.scale(ik * 0.88, ik * 0.88);
    const pulse = 1 + 0.04 * Math.sin(t * 2.6);
    circle(ctx, 0, 0, 150 * pulse, hexA(slice.color, 0.08));
    circle(ctx, 0, 0, 130, hexA(slice.color, 0.15));
    ctx.save(); ctx.strokeStyle = hexA(slice.color, 0.6); ctx.lineWidth = 5; ctx.shadowColor = slice.color; ctx.shadowBlur = 24;
    ctx.beginPath(); ctx.arc(0, 0, 130, 0, 6.283); ctx.stroke(); ctx.restore();
    icon(ctx, 0, 6, 140, slice.color);
    ctx.restore();
  }
  if (tValue != null) {
    const vk = appear(t, tValue - 0.1, 0.4);
    if (vk > 0) {
      const v = counting(t, tValue, 1.0, 0, slice.val);
      const land = t > tValue + 1.0 ? 1 + 0.1 * Math.max(0, 1 - (t - tValue - 1.0) * 4) : 1;
      ctx.save(); ctx.translate(430, 612); ctx.scale(land, land);
      glowText(ctx, brlI(v), 0, 0, { size: 96, weight: 900, alpha: vk, glow: hexA(slice.color, 0.6), blur: 40 });
      ctx.restore();
      const pk = appear(t, o.tPct ?? tValue + 0.8);
      text(ctx, `${slice.pct}% do preço`, 430, 684, { size: 34, weight: 700, color: slice.color, alpha: pk });
      shockRing(ctx, t, tValue + 1.0, 430, 612, slice.color, 80, 420);
    }
    priceBar(ctx, t, idx, idx, ease.inOut(prog(t, tValue, 1.2)), { alpha: barA });
  } else {
    priceBar(ctx, t, idx, idx, 0, { alpha: barA });
  }
}
// Câmera padrão das fatias: começa no título, visita cada elemento na ordem em que é falado.
let BAR_AT = 0;
function sliceCam(events, endT) {
  const keys = [{ t: 0, x: 620, y: 360, z: 1.3 }];
  const sorted = [...events].sort((a, b) => a.t - b.t);
  BAR_AT = sorted.length ? sorted[0].t + 0.9 : 1;
  for (const e of sorted) keys.push({ d: 1.3, z: 1.05, ...e, t: e.t - 0.25 });
  keys.push({ t: endT, x: 960, y: 520, z: 1.0, d: 2.0 });
  return keys;
}
const VALUE_FOCUS = { x: 900, y: 560, z: 1.06 };
const cardFocus = (y) => ({ x: 1000, y: Math.max(480, Math.min(y, 560)), z: 1.05 });
const RIGHT = (y, z = 1.05) => ({ x: 1000, y, z: Math.min(z, 1.05) });

// ---------------------------------------------------------------- Cena 01: gancho
function scene01(K) {
  const tOnze = K('onze mil'), tReais = K('reais e o preco'), tEUA = K('estados unidos'), tMil = K('mil cento e noventa');
  const tPelo = K('pelo dolar'), tSeis = K('seis mil e cem'), tMetade = K('quase a metade');
  const tSal = K('salario minimo'), tHoras = K('mil seiscentas'), tMeses = K('mais de sete meses');
  const tPra = K('pra onde vai'), tAbre = K('abre esse preco'), tReal = K('segue cada real');
  const BR = { x: 960, y: 430 }, BRL = { x: 620, y: 430 }, US = { x: 1300, y: 430 };
  const split = (t) => ease.inOut(prog(t, tEUA - 0.2, 1.0));
  const cam = [
    { t: 0, x: 960, y: 470, z: 1.55 },
    { t: tOnze + 0.2, x: 960, y: 480, z: 1.3, d: 2.4 },
    { t: tEUA - 0.2, x: 960, y: 500, z: 1.05, d: 1.2 },
    { t: tMil, x: 1080, y: 470, z: 1.12, d: 1.1 },
    { t: tMetade - 0.2, x: 960, y: 520, z: 1.05, d: 1.0 },
    { t: tSal - 0.2, x: 960, y: 520, z: 1.2, d: 1.2 },
    { t: tPra - 0.3, x: 960, y: 520, z: 1.05, d: 1.2 },
    { t: tAbre - 0.2, x: 760, y: 500, z: 1.2, d: 1.2 },
    { t: tReal + 0.4, ...HOME, d: 1.6 },
  ];
  const sfx = [[0.05, 'neon', 0.5], [tReais, 'impact', 0.8], [tEUA - 0.2, 'swoosh', 0.7], [tMil, 'pop', 0.8], [tPelo, 'click', 0.7], [tSeis, 'coin', 0.7],
    [tMetade, 'hit', 0.9], [tSal, 'pop', 0.8], [tMeses, 'hit', 0.7], [tPra - 0.1, 'whoosh', 0.8], [tAbre, 'sparkle', 0.7], [tAbre + 0.05, 'swoosh', 0.6], [tReal, 'impact', 0.6]];
  ticks(sfx, tOnze, tReais - 0.05);
  ticks(sfx, tHoras, tHoras + 1.2, 0.06);
  const hideCompare = (t) => 1 - appear(t, tSal - 0.3, 0.5) + appear(t, tPra - 0.2, 0.6);
  return {
    accent: C.petro, cam, sfx, impacts: [tReais, tMetade, tReal],
    draw(ctx, t) {
      const m = split(t);
      const cmp = clamp(hideCompare(t));
      const bx = lerp(BR.x, BRL.x, m), by = BR.y;
      const open = ease.inOut(prog(t, tAbre, 1.4));
      const slices = open > 0 ? SLICES.map((s) => ({ color: s.color, frac: (s.val / PRICE) * open })) : null;
      ctx.save(); ctx.globalAlpha = cmp;
      phone(ctx, bx, by, 380, { glow: hexA(C.petro, 0.35), slices });
      // etiqueta do preço brasileiro
      const pk = appear(t, tOnze - 0.15, 0.4);
      const v = t < tReais ? counting(t, tOnze, tReais - tOnze, 0, PRICE) : PRICE;
      const land = t > tReais ? 1 + 0.12 * Math.max(0, 1 - (t - tReais) * 3) : 1;
      ctx.save(); ctx.translate(bx, by + 250); ctx.scale(land, land);
      glowText(ctx, brlI(v), 0, 0, { size: 96, weight: 900, color: C.gold, alpha: pk, glow: hexA(C.gold, 0.55), blur: 44 });
      ctx.restore();
      const lab = 1 - appear(t, tPra - 0.3, 0.3);
      text(ctx, 'Brasil', bx, by - 230, { size: 34, weight: 800, color: C.muted, alpha: appear(t, tEUA) * lab });
      shockRing(ctx, t, tReais, bx, by + 250, C.gold, 100, 520);
      // o iPhone americano
      const uk = appear(t, tEUA, 0.6, ease.back);
      if (uk > 0) {
        const half = ease.inOut(prog(t, tMetade, 0.8));
        ctx.save(); ctx.translate(US.x, by); ctx.scale(uk, uk);
        phone(ctx, 0, 0, 380, {});
        ctx.restore();
        text(ctx, 'Estados Unidos', US.x, by - 230, { size: 34, weight: 800, color: C.muted, alpha: uk * lab });
        const usd = appear(t, tMil, 0.4);
        if (usd > 0) glowText(ctx, usdI(USD), US.x, by + 250, { size: 80, weight: 900, alpha: usd * (1 - appear(t, tPelo + 0.3, 0.4)), glow: 'rgba(255,255,255,0.4)' });
        const rk = appear(t, tSeis, 0.5);
        if (rk > 0) glowText(ctx, '≈ R$ 6,1 mil', US.x, by + 250, { size: 80, weight: 900, color: '#93c5fd', alpha: rk, glow: hexA(C.petro, 0.6) });
        // "quase a metade": régua de altura
        if (half > 0) {
          const top = by - 190, bot = by + 190;
          ctx.save(); ctx.globalAlpha *= half;
          ctx.strokeStyle = C.gold; ctx.lineWidth = 4; ctx.setLineDash([12, 10]);
          ctx.beginPath(); ctx.moveTo(bx + 140, top); ctx.lineTo(US.x + 140, top); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(bx + 140, (top + bot) / 2); ctx.lineTo(US.x + 140, (top + bot) / 2); ctx.stroke();
          ctx.restore();
          fillRR(ctx, US.x + 125, lerp(bot, (top + bot) / 2 + 4, half), 40, lerp(0, (bot - top) / 2 - 4, half), 10, '#93c5fd', 0.9);
          fillRR(ctx, bx + 125, top, 40, bot - top, 10, C.gold, 0.9 * half);
          punchText(ctx, t, tMetade, 'quase a metade', (bx + US.x) / 2 + 20, by + 40, { size: 46, weight: 900, color: C.gold, glow: hexA(C.gold, 0.6), until: tSal - 0.3 });
        }
      }
      ctx.restore();
      // salário mínimo: horas de trabalho
      const sk = appear(t, tSal, 0.5) * (1 - appear(t, tPra - 0.2, 0.5));
      if (sk > 0) {
        ctx.save(); ctx.globalAlpha *= sk;
        card(ctx, 360, 260, 1200, 470, 1, C.gold);
        text(ctx, 'Com um salário mínimo (R$ 1.621)', W / 2, 330, { size: 40, weight: 700, color: C.muted });
        iconClock(ctx, 560, 520, 150, C.gold);
        const h = t < tHoras ? 0 : counting(t, tHoras, 1.2, 0, 1628);
        glowText(ctx, `${Math.round(h).toLocaleString('pt-BR')} horas`, 1080, 480, { size: 104, weight: 900, glow: hexA(C.gold, 0.5), alpha: appear(t, tHoras - 0.1, 0.3) });
        text(ctx, 'de trabalho para pagar o iPhone', 1080, 560, { size: 34, weight: 600, color: C.muted, alpha: appear(t, tHoras + 0.6) });
        pill(ctx, 1080, 650, 520, 76, 'mais de 7 meses', C.gold, appear(t, tMeses, 0.5, ease.back), { size: 38 });
        ctx.restore();
      }
    },
    overlay(ctx, t) {
      punchText(ctx, t, tPra, 'Pra onde vai a outra metade?', W / 2, 140, { size: 62, weight: 900, until: tAbre - 0.1 });
      punchText(ctx, t, tAbre, 'Hoje a gente abre esse preço.', W / 2, 140, { size: 62, weight: 900, color: C.gold, glow: hexA(C.gold, 0.6) });
      overlaySource(ctx, 'Apple Brasil e EUA (9/9/2026), Gazeta do Povo', appear(t, tEUA) * (1 - appear(t, tAbre, 0.4)));
    },
  };
}

// ---------------------------------------------------------------- Cena 02: os números
function browserCard(ctx, x, y, w, h, url, k) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.scale(k, k); ctx.translate(-(x + w / 2), -(y + h / 2));
  fillRR(ctx, x, y, w, h, 24, '#0b1222');
  strokeRR(ctx, x, y, w, h, 24, 'rgba(255,255,255,0.14)', 2);
  fillRR(ctx, x, y, w, 64, 24, 'rgba(255,255,255,0.06)');
  ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(x, y + 40, w, 24);
  for (const [i, c] of [['#f87171', 0], ['#fbbf24', 1], ['#4ade80', 2]].map(([c], i) => [i, c])) circle(ctx, x + 34 + i * 26, y + 32, 8, c);
  fillRR(ctx, x + 120, y + 16, w - 150, 34, 17, 'rgba(255,255,255,0.08)');
  text(ctx, url, x + 140, y + 34, { size: 22, weight: 600, color: C.muted, align: 'left' });
  ctx.restore();
}
function scene02(K) {
  const tSpec = K('duzentos e cinquenta'), tLanc = K('lancado em'), tBR = K('apple brasil'), tBRv = K('onze mil novecentos'), tUS = K('site americano'), tUSv = K('mil cento e noventa');
  const tFX = K('cinco e doze'), tConv = K('seis mil cento e trinta'), tDif = K('a diferenca'), tDes = K('vamos desmontar');
  const L = { x: 200, y: 300, w: 700, h: 330 }, R = { x: 1020, y: 300, w: 700, h: 330 };
  const cam = [
    { t: 0, x: 960, y: 480, z: 1.2 },
    { t: tSpec - 0.2, x: 960, y: 470, z: 1.1, d: 2.0 },
    { t: tBR - 0.3, x: 960, y: 470, z: 1.15, d: 1.2 },
    { t: tFX - 0.3, x: 960, y: 560, z: 1.12, d: 1.0 },
    { t: tDif - 0.3, x: 960, y: 600, z: 1.05, d: 1.2 },
    { t: tDes, x: 960, y: 640, z: 1.1, d: 1.0 },
  ];
  const sfx = [[0.05, 'whoosh', 0.7], [0.15, 'pop', 0.7], [tSpec, 'pop', 0.8], [tLanc, 'click', 0.7], [tBR - 0.6, 'swoosh', 0.6], [tBR, 'pop', 0.8], [tBRv + 0.9, 'hit', 0.6], [tUS, 'pop', 0.8], [tUSv + 0.7, 'hit', 0.5],
    [tFX, 'click', 0.8], [tConv, 'coin', 0.7], [tDif, 'riser', 0.35, { dur: 1.2 }], [tDif + 1.2, 'impact', 0.7], ...SLICES.map((_, i) => [tDes + 0.2 + i * 0.13, 'pop', 0.6])];
  ticks(sfx, tBRv, tBRv + 0.9);
  ticks(sfx, tConv, tConv + 0.9);
  return {
    accent: C.petro, cam, sfx, impacts: [tDif + 1.2],
    draw(ctx, t) {
      // abertura: ficha grande do aparelho, que vira uma faixa no topo quando os sites aparecem
      const big = 1 - appear(t, tBR - 0.6, 0.5);
      if (big > 0) {
        ctx.save(); ctx.globalAlpha *= big;
        const pk = appear(t, 0.05, 0.7, ease.back);
        ctx.save(); ctx.translate(640, 480); ctx.scale(pk, pk); phone(ctx, 0, 0, 420, { glow: hexA(C.petro, 0.35) }); ctx.restore();
        glowText(ctx, 'iPhone 18 Pro', 860, 380, { size: 96, weight: 900, align: 'left', alpha: appear(t, 0.2, 0.6), glow: hexA(C.petro, 0.5) });
        pill(ctx, 1010, 500, 300, 84, '256 GB', C.gold, appear(t, tSpec, 0.5, ease.back), { size: 44, weight: 900 });
        text(ctx, 'lançado em 9 de setembro de 2026', 860, 610, { size: 40, weight: 600, color: C.muted, align: 'left', alpha: appear(t, tLanc, 0.5) });
        ctx.restore();
      }
      const sk = appear(t, tBR - 0.4, 0.5) * (1 - appear(t, tDif - 0.3, 0.5));
      fillRR(ctx, 560, 150, 800, 90, 45, 'rgba(255,255,255,0.06)', sk);
      iconPhone(ctx, 620, 195, 60, '#cbd5e1');
      text(ctx, 'iPhone 18 Pro', 670, 195, { size: 40, weight: 800, align: 'left', alpha: sk });
      text(ctx, '256 GB', 1000, 195, { size: 34, weight: 700, color: C.gold, alpha: appear(t, tSpec) * sk, align: 'left' });
      text(ctx, '9/9/2026', 1160, 195, { size: 30, weight: 600, color: C.muted, alpha: appear(t, tLanc) * sk, align: 'left' });
      browserCard(ctx, L.x, L.y, L.w, L.h, 'apple.com/br', appear(t, tBR - 0.1, 0.5, ease.back));
      browserCard(ctx, R.x, R.y, R.w, R.h, 'apple.com/us', appear(t, tUS - 0.1, 0.5, ease.back));
      if (t > tBR) {
        const v = t < tBRv ? 0 : counting(t, tBRv, 0.9, 0, PRICE);
        glowText(ctx, brlI(v), L.x + L.w / 2, L.y + 190, { size: 100, weight: 900, color: C.gold, glow: hexA(C.gold, 0.5), alpha: appear(t, tBRv - 0.1, 0.3) });
        text(ctx, 'iPhone 18 Pro · 256 GB', L.x + L.w / 2, L.y + 280, { size: 28, weight: 600, color: C.muted, alpha: appear(t, tBRv + 0.5) });
      }
      if (t > tUS) {
        const ak = appear(t, tUSv - 0.1, 0.3);
        glowText(ctx, usdI(USD), R.x + R.w / 2, R.y + 190, { size: 100, weight: 900, alpha: ak * (1 - 0.5 * appear(t, tFX, 0.5)) });
        text(ctx, 'sem imposto sobre vendas', R.x + R.w / 2, R.y + 280, { size: 28, weight: 600, color: C.muted, alpha: appear(t, tUSv + 0.5) });
      }
      // conversão
      const ck = appear(t, tFX - 0.1, 0.5);
      if (ck > 0) {
        ctx.save(); ctx.translate(0, (1 - ck) * 30);
        card(ctx, R.x, 660, R.w, 100, ck, C.petro);
        text(ctx, 'US$ 1.199 × R$ 5,12 =', R.x + 40, 712, { size: 36, weight: 700, align: 'left', alpha: ck });
        const cv = t < tConv ? 0 : counting(t, tConv, 0.9, 0, 6139);
        text(ctx, brlI(cv), R.x + R.w - 40, 712, { size: 44, weight: 900, align: 'right', color: '#93c5fd', alpha: appear(t, tConv - 0.1, 0.3) });
        ctx.restore();
      }
      // a diferença
      const dk = ease.inOut(prog(t, tDif, 1.2));
      if (dk > 0) {
        const x0 = L.x, x1 = lerp(L.x, L.x + 1520, dk);
        ctx.save(); ctx.strokeStyle = C.fed; ctx.lineWidth = 6; ctx.shadowColor = C.fed; ctx.shadowBlur = 20;
        ctx.beginPath(); ctx.moveTo(x0, 690); ctx.lineTo(x0, 730); ctx.moveTo(x0, 710); ctx.lineTo(x1 * 0 + L.x + 730 * dk, 710); ctx.stroke(); ctx.restore();
        const lk = appear(t, tDif + 1.0, 0.5, ease.back);
        pill(ctx, L.x + L.w / 2, 712, 560, 84, 'diferença: R$ 5.860', C.fed, lk, { size: 40, weight: 900 });
        if (lk > 0) shockRing(ctx, t, tDif + 1.2, L.x + L.w / 2, 712, C.fed, 60, 420);
      }
      if (t > tDes) priceBar(ctx, t, SLICES.length, -1, 0, { label: 'Vamos desmontar o preço', alpha: appear(t, tDes, 0.5) });
    },
    overlay(ctx, t) { overlaySource(ctx, 'Apple Brasil e EUA (9/9/2026); dólar: InfoMoney (set/2026)', appear(t, tBR)); },
  };
}

// ---------------------------------------------------------------- Cena 03: o caminho do iPhone
function scene03(K) {
  const Y = 480, X = [300, 1350, 2400, 3450];
  const tNao = K('nao e feito'), tFab = K('fabricas na china'), tIndia = K('na india'), tChega = K('quando chega aqui'), tRec = K('receita federal');
  const tEnt = K('impostos de entrada'), tLib = K('liberar a caixa'), tDep = K('depois a apple'), tVoce = K('pra voce'), tVenda = K('impostos da venda'), tMorde = K('morde um pedaco');
  const planeDur = Math.max(1.6, tRec - tChega + 0.4);
  const planeX = (t) => lerp(X[0] + 140, X[1] - 150, ease.inOut(prog(t, tChega - 0.2, planeDur)));
  const cam = [
    { t: 0, x: 300, y: 480, z: 0.95 },
    { t: tFab - 0.3, x: 300, y: 540, z: 1.25, d: 1.4 },
    { t: tChega - 0.3, x: 820, y: 520, z: 1.05, d: 1.6 },
    { t: tRec - 0.2, x: 1350, y: 540, z: 1.25, d: 1.4 },
    { t: tDep - 0.3, x: 2400, y: 540, z: 1.2, d: 2.0 },
    { t: tVoce, x: 3000, y: 540, z: 1.05, d: 1.6 },
    { t: tMorde - 0.4, x: 1875, y: 620, z: 0.5, d: 2.0 },
  ];
  const sfx = [[0.1, 'whoosh', 0.7], [0.4, 'pop', 0.7], [tNao, 'hit', 0.6], [tFab, 'pop', 0.8], [tIndia, 'pop', 0.6], [tChega - 0.2, 'whoosh', 0.8, { dur: planeDur }], [tRec, 'pop', 0.8],
    [tEnt, 'hit', 0.8], [tEnt + 0.15, 'coin', 0.6], [tLib, 'click', 0.8], [tDep - 0.3, 'whoosh', 0.8], [tDep + 0.4, 'pop', 0.8], [tVoce, 'pop', 0.8],
    [tVenda, 'coin', 0.6], [tMorde - 0.4, 'whoosh', 0.9], ...[0, 1, 2].map((i) => [tMorde + 0.3 + i * 0.22, 'coin', 0.55])];
  return {
    accent: C.petro, cam, sfx, impacts: [tEnt],
    draw(ctx, t) {
      ctx.save(); ctx.globalAlpha = 0.5; ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 70;
      ctx.beginPath(); ctx.moveTo(X[0], Y); ctx.lineTo(X[3], Y); ctx.stroke(); ctx.restore();
      node(ctx, t, 0.4, X[0], Y, iconFactory, '#94a3b8', 'Fábrica', t > tIndia ? 'China e Índia' : t > tFab ? 'China' : '', null);
      flowLine(ctx, X[0] + 115, Y, X[1] - 115, Y, ease.inOut(prog(t, tChega - 0.2, planeDur)), '#93c5fd', t);
      if (t > tChega - 0.3 && t < tChega - 0.2 + planeDur + 0.3) {
        const px = planeX(t), bob = Math.sin(t * 4) * 8;
        const a = appear(t, tChega - 0.3, 0.3) * (1 - appear(t, tChega - 0.2 + planeDur, 0.3));
        ctx.save(); ctx.globalAlpha = a;
        iconPlane(ctx, px, Y - 150 + bob, 110, '#e2e8f0');
        iconBox(ctx, px - 10, Y - 60 + bob, 50, '#cbd5e1');
        ctx.restore();
      }
      node(ctx, t, tRec, X[1], Y, iconStamp, '#fb7185', 'Alfândega', 'Receita Federal', '#fb7185');
      flowLine(ctx, X[1] + 115, Y, X[2] - 115, Y, ease.inOut(prog(t, tDep - 0.3, 1.4)), '#93c5fd', t);
      node(ctx, t, tDep + 0.4, X[2], Y, iconStore, C.petro, 'Apple Brasil', 'vende o aparelho');
      flowLine(ctx, X[2] + 115, Y, X[3] - 115, Y, ease.inOut(prog(t, tDep + 0.6, 1.2)), '#93c5fd', t);
      node(ctx, t, tVoce, X[3], Y, (c, x, y, s, col) => miniIcon(c, 'person', x, y, s * 0.9, col), C.gold, 'Você', '');
      // carimbo dos impostos de entrada
      const sk = appear(t, tEnt, 0.35, ease.back) * (1 - appear(t, tDep - 0.4, 0.4));
      if (sk > 0) {
        ctx.save(); ctx.translate(X[1] + 190, Y - 190); ctx.rotate(-0.18); ctx.scale(lerp(1.8, 1, sk), lerp(1.8, 1, sk));
        ctx.globalAlpha = sk;
        strokeRR(ctx, -170, -50, 340, 100, 16, '#fb7185', 6);
        text(ctx, 'IMPOSTOS', 0, -14, { size: 38, weight: 900, color: '#fb7185', letter: 3 });
        text(ctx, 'DE ENTRADA', 0, 26, { size: 28, weight: 800, color: '#fb7185', letter: 3 });
        ctx.restore();
      }
      const vk = appear(t, tVenda, 0.4, ease.back);
      if (vk > 0) pill(ctx, X[2] + 40, Y - 220, 460, 80, 'impostos da venda', C.icms, vk, { size: 34 });
      [X[1], X[2], X[2] + 300].forEach((cx, i) => {
        const k = appear(t, tMorde + 0.3 + i * 0.22, 0.5, ease.back);
        if (k > 0) { iconCoin(ctx, cx + 90, Y - 170 + (i === 2 ? 40 : 0), 46 * k, C.gold); sparks(ctx, t, tMorde + 0.3 + i * 0.22, cx + 90, Y - 170, C.gold, 10); }
      });
    },
    overlay(ctx, t) {
      punchText(ctx, t, 0.1, 'O caminho do iPhone', W / 2, 150, { size: 60, weight: 900, until: tNao - 0.1 });
      punchText(ctx, t, tNao, 'Não é feito no Brasil', W / 2, 150, { size: 60, weight: 900, until: tChega - 0.3 });
      punchText(ctx, t, tMorde, 'Cada etapa morde um pedaço', W / 2, 150, { size: 62, weight: 800, color: C.gold, glow: hexA(C.gold, 0.5) });
    },
  };
}

// ---------------------------------------------------------------- Cena 04: fatia 1, o aparelho
function scene04(K) {
  const s = S.aparelho;
  const tConta = K('na conta do canal'), tAmer = K('preco americano'), tV = K('seis mil cento e trinta'), tPct = K('cinquenta e um por cento');
  const tSo = K('so metade'), tOutra = K('a outra metade');
  const cam = sliceCam([{ t: tConta, ...cardFocus(355) }, { t: tV, ...VALUE_FOCUS }, { t: tPct, ...cardFocus(490) }, { t: tSo, ...cardFocus(620) }], tOutra + 1.0);
  const barAt = BAR_AT;
  const sfx = [[0.05, 'whoosh', 0.6], [0.35, 'pop', 0.7], [tConta, 'pop', 0.8], [tAmer, 'click', 0.6], [tV + 1.0, 'impact', 0.6], [tPct, 'pop', 0.8], [tSo, 'hit', 0.8], [tOutra, 'riser', 0.35, { dur: 1.0 }]];
  ticks(sfx, tV, tV + 1.0);
  return {
    accent: s.color, cam, sfx, impacts: [tV + 1.0, tSo],
    draw(ctx, t) {
      sliceBase(ctx, t, 0, s, iconPhone, tV, { barAt, tPct, title: 'O próprio iPhone' });
      fact(ctx, t, tConta, RX, 300, RW, 120, 'Preço americano, sem imposto', 'estimativa do canal · US$ 1.199 × R$ 5,12', s.color);
      fact(ctx, t, tPct, RX, 445, RW, 110, '51% do que você paga', null, s.color);
      fact(ctx, t, tSo, RX, 580, RW, 110, 'Só metade do preço é o celular', null, C.gold);
    },
    overlay(ctx, t) { overlaySource(ctx, 'Apple EUA (9/9/2026), cálculo do canal', appear(t, tConta)); },
  };
}

// ---------------------------------------------------------------- Cena 05: fatia 2, imposto de importação
function scene05(K) {
  const s = S.ii;
  const tAlf = K('na alfandega'), t16 = K('dezesseis por cento'), tFev = K('em fevereiro'), t20 = K('subir pra vinte'), tVolt = K('voltou atras');
  const tV = K('novecentos e oitenta e dois'), tPct = K('oito por cento');
  const cam = sliceCam([{ t: tAlf, ...cardFocus(355) }, { t: t16, ...cardFocus(480) }, { t: tFev, ...RIGHT(600) }, { t: tV, ...VALUE_FOCUS }], tPct + 1.4);
  const barAt = BAR_AT;
  const sfx = [[0.05, 'whoosh', 0.6], [0.35, 'pop', 0.7], [tAlf, 'hit', 0.7], [t16, 'pop', 0.8], [tFev, 'click', 0.7], [t20, 'riser', 0.3, { dur: 0.6 }], [t20 + 0.6, 'pop', 0.8],
    [tVolt, 'drop', 0.8], [tV + 1.0, 'impact', 0.6], [tPct, 'pop', 0.6]];
  ticks(sfx, tV, tV + 1.0);
  const pts = [{ label: 'jan', v: '16%', at: tFev }, { label: '6/fev', v: '20%', at: t20 + 0.5 }, { label: '27/fev', v: '16%', at: tVolt + 0.3 }];
  return {
    accent: s.color, cam, sfx, impacts: [tAlf, tV + 1.0],
    draw(ctx, t) {
      sliceBase(ctx, t, 1, s, iconStamp, tV, { barAt, tPct });
      fact(ctx, t, tAlf, RX, 290, RW, 110, 'Cobrado na alfândega', null, s.color);
      fact(ctx, t, t16, RX, 420, RW, 110, '16% sobre o valor do aparelho', null, s.color);
      const ly = 690, lx0 = RX + 110, lx1 = RX + RW - 110;
      const lk = appear(t, tFev - 0.2, 0.5);
      if (lk > 0) {
        text(ctx, 'Imposto de importação de smartphone · 2026', RX + RW / 2, 566, { size: 26, weight: 600, color: C.muted, alpha: lk });
        ctx.save(); ctx.globalAlpha *= lk; ctx.strokeStyle = hexA(s.color, 0.5); ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(lx0, ly); ctx.lineTo(lerp(lx0, lx1, ease.out(prog(t, tFev, Math.max(0.8, tVolt + 0.3 - tFev)))), ly); ctx.stroke(); ctx.restore();
      }
      pts.forEach((p, i) => {
        const k = appear(t, p.at, 0.5, ease.back);
        if (k <= 0) return;
        const x = lerp(lx0, lx1, i / 2), up = i === 1 ? -18 : 0;
        circle(ctx, x, ly + up * k, 14 * k, i === 1 ? C.fed : s.color);
        glowText(ctx, p.v, x, ly - 50 + up * k, { size: 44, weight: 900, alpha: k, color: i === 1 ? C.fed : C.text, glow: i === 1 ? hexA(C.fed, 0.6) : 'rgba(0,0,0,0)' });
        text(ctx, p.label, x, ly + 46, { size: 26, weight: 600, color: C.muted, alpha: k });
      });
      const xk = appear(t, tVolt + 0.3, 0.4);
      if (xk > 0) { const x = lerp(lx0, lx1, 0.5); ctx.save(); ctx.strokeStyle = C.fed; ctx.lineWidth = 6; ctx.globalAlpha = xk; ctx.beginPath(); ctx.moveTo(x - 36, ly - 92); ctx.lineTo(x + 36, ly - 44); ctx.stroke(); ctx.restore(); }
    },
    overlay(ctx, t) { overlaySource(ctx, 'Camex/Gecex, Valor, Agência Brasil (fev/2026)', appear(t, t16)); },
  };
}

// ---------------------------------------------------------------- Cena 06: fatia 3, IPI
function scene06(K) {
  const s = S.ipi;
  const tFed = K('o imposto federal'), t15 = K('quinze por cento'), tDet = K('um detalhe'), tCalc = K('e calculado'), tDentro = K('importacao dentro');
  const tSobre = K('e imposto sobre imposto'), tV = K('mil quinhentos'), tPct = K('treze por cento');
  const SX = RX + 120, SW = 300;
  const cam = sliceCam([{ t: tFed, ...cardFocus(355) }, { t: t15, ...cardFocus(480) }, { t: tCalc, ...RIGHT(520) }, { t: tV, ...VALUE_FOCUS }], tPct + 1.2);
  const barAt = BAR_AT;
  const sfx = [[0.05, 'whoosh', 0.6], [0.35, 'pop', 0.7], [tFed, 'pop', 0.8], [t15, 'pop', 0.8], [tDet, 'riser', 0.3, { dur: 1.0 }], [tCalc, 'pop', 0.7], [tDentro, 'drop', 0.6],
    [tSobre, 'impact', 0.8], [tV + 1.0, 'impact', 0.5], [tPct, 'pop', 0.6]];
  ticks(sfx, tV, tV + 1.0);
  return {
    accent: s.color, cam, sfx, impacts: [tSobre, tV + 1.0],
    draw(ctx, t) {
      sliceBase(ctx, t, 2, s, iconFactory, tV, { barAt, tPct });
      const cardsOut = 1 - appear(t, tCalc - 0.3, 0.5);
      ctx.save(); ctx.globalAlpha *= cardsOut;
      fact(ctx, t, tFed, RX, 300, RW, 120, 'Imposto federal', 'sobre produtos industrializados', s.color);
      fact(ctx, t, t15, RX, 445, RW, 110, '15% para celular', null, s.color);
      ctx.restore();
      // pilha: aparelho + importação, e o IPI calculado em cima dos dois
      const pk = appear(t, tCalc - 0.2, 0.5);
      if (pk > 0) {
        const base = 690;
        ctx.save(); ctx.globalAlpha *= pk;
        fillRR(ctx, SX, base - 200, SW, 200, 14, S.aparelho.color);
        text(ctx, 'aparelho', SX + SW / 2, base - 100, { size: 36, weight: 800 });
        const ik = appear(t, tDentro, 0.5, ease.back);
        fillRR(ctx, SX, base - 200 - 70 * ik, SW, 66 * ik, 12, S.ii.color);
        if (ik > 0.5) text(ctx, 'importação', SX + SW / 2, base - 236, { size: 30, weight: 800, alpha: ik });
        // o IPI aparece ao lado e aponta para a pilha inteira
        const bk = appear(t, tSobre - 0.2, 0.5, ease.back);
        if (bk > 0) {
          ctx.save(); ctx.strokeStyle = s.color; ctx.lineWidth = 5; ctx.globalAlpha *= bk;
          ctx.beginPath(); ctx.moveTo(SX + SW + 30, base - 276); ctx.lineTo(SX + SW + 60, base - 276); ctx.lineTo(SX + SW + 60, base); ctx.lineTo(SX + SW + 30, base); ctx.stroke();
          ctx.restore();
          fillRR(ctx, SX + SW + 100, base - 180, 260, 110, 18, s.color, bk);
          text(ctx, 'IPI 15%', SX + SW + 230, base - 125, { size: 44, weight: 900, alpha: bk });
          text(ctx, 'sobre tudo isso', SX + SW + 230, base - 40, { size: 28, weight: 600, color: C.muted, alpha: bk });
        }
        ctx.restore();
      }
    },
    overlay(ctx, t) {
      punchText(ctx, t, tSobre, 'IMPOSTO SOBRE IMPOSTO', W / 2 + 330, 175, { size: 56, weight: 900, color: s.color, glow: hexA(s.color, 0.6), until: tV - 0.2 });
      overlaySource(ctx, 'TIPI (NCM 8517.13.00), cálculo do canal', appear(t, t15));
    },
  };
}

// ---------------------------------------------------------------- Cena 07: fatia 4, PIS e Cofins
function scene07(K) {
  const s = S.pis;
  const tDois = K('mais dois impostos'), tEnt = K('na entrada'), tVenda = K('de novo na venda'), tDesc = K('com desconto'), tV = K('setecentos e sessenta'), tPct = K('seis por cento');
  const cam = sliceCam([{ t: tDois, ...cardFocus(355) }, { t: tEnt, ...RIGHT(560) }, { t: tV, ...VALUE_FOCUS }], tPct + 1.0);
  const barAt = BAR_AT;
  const sfx = [[0.05, 'whoosh', 0.6], [0.35, 'pop', 0.7], [tDois, 'pop', 0.8], [tEnt, 'coin', 0.7], [tVenda, 'coin', 0.7], [tDesc, 'drop', 0.6], [tV + 1.0, 'impact', 0.5], [tPct, 'pop', 0.6]];
  ticks(sfx, tV, tV + 1.0);
  return {
    accent: s.color, cam, sfx, impacts: [tV + 1.0],
    draw(ctx, t) {
      sliceBase(ctx, t, 3, s, iconCoins, tV, { barAt, tPct });
      fact(ctx, t, tDois, RX, 300, RW, 110, 'Mais dois impostos federais', null, s.color);
      const cy = 560;
      [[RX + 210, 'na entrada', '11,75%', tEnt], [RX + RW - 210, 'na venda', '9,25%', tVenda]].forEach(([x, lab, pct, at]) => {
        const k = appear(t, at, 0.5, ease.back);
        if (k <= 0) return;
        ctx.save(); ctx.translate(x, cy); ctx.scale(k, k);
        ctx.save(); ctx.shadowColor = s.color; ctx.shadowBlur = 30; circle(ctx, 0, 0, 92, hexA(s.color, 0.2)); ctx.restore();
        strokeRR(ctx, -92, -92, 184, 184, 92, s.color, 4);
        text(ctx, pct, 0, -8, { size: 44, weight: 900 });
        text(ctx, 'PIS + Cofins', 0, 36, { size: 22, weight: 700, color: C.muted });
        ctx.restore();
        text(ctx, lab, x, cy + 130, { size: 32, weight: 700, alpha: k });
      });
      const dk = appear(t, tDesc, 0.5);
      if (dk > 0) {
        ctx.save(); ctx.globalAlpha *= dk; ctx.strokeStyle = C.gold; ctx.lineWidth = 6; ctx.lineCap = 'round';
        const x0 = RX + 330, x1 = RX + RW - 330;
        ctx.beginPath(); ctx.moveTo(x0, cy); ctx.lineTo(lerp(x0, x1, ease.out(dk)), cy); ctx.stroke();
        ctx.restore();
        text(ctx, '− o que já foi pago', RX + RW / 2, cy - 40, { size: 30, weight: 800, color: C.gold, alpha: dk });
      }
    },
    overlay(ctx, t) { overlaySource(ctx, 'Receita Federal, cálculo do canal', appear(t, tDois)); },
  };
}

// ---------------------------------------------------------------- Cena 08: fatia 5, ICMS
function scene08(K) {
  const s = S.icms;
  const tSP = K('em sao paulo'), t18 = K('dezoito por cento na'), tMaior = K('na maioria'), tPeg = K('uma pegadinha'), tDentro = K('por dentro');
  const tMesmo = K('dele mesmo'), tViram = K('na pratica viram'), t22 = K('vinte e dois'), tV = K('dois mil cento'), tFatia = K('a maior fatia');
  const BX = RX + 60, BW = RW - 120, BY = 660, BH = 60;
  const cam = sliceCam([{ t: tSP, ...cardFocus(355) }, { t: tMaior, ...cardFocus(480) }, { t: tDentro, ...RIGHT(560) }, { t: tV, ...VALUE_FOCUS }, { t: tFatia, ...VALUE_FOCUS, z: 1.1 }], tFatia + 2.0);
  const barAt = BAR_AT;
  const sfx = [[0.05, 'whoosh', 0.6], [0.35, 'pop', 0.7], [tSP, 'pop', 0.8], [tMaior, 'pop', 0.8], [tPeg, 'riser', 0.35, { dur: 1.0 }], [tDentro, 'hit', 0.7],
    [tMesmo, 'swoosh', 0.6], [t22, 'impact', 0.8], [tV + 1.0, 'impact', 0.5], [tFatia, 'hit', 0.7]];
  ticks(sfx, tV, tV + 1.0);
  return {
    accent: s.color, cam, sfx, impacts: [t22, tV + 1.0],
    draw(ctx, t) {
      sliceBase(ctx, t, 4, s, iconBank, tV, { barAt, tPct: tFatia });
      fact(ctx, t, tSP, RX, 290, RW, 110, 'São Paulo: 18%', null, s.color);
      fact(ctx, t, tMaior, RX, 415, RW, 110, 'Maioria dos estados: 17% a 20%', null, s.color);
      // "por dentro": o imposto entra na base dele mesmo
      const bk = appear(t, tDentro - 0.1, 0.5);
      if (bk > 0) {
        ctx.save(); ctx.globalAlpha *= bk;
        const icmsK = ease.inOut(prog(t, tMesmo, 0.8));
        fillRR(ctx, BX, BY, BW * 0.82, BH, 12, 'rgba(255,255,255,0.12)');
        text(ctx, 'preço sem o ICMS', BX + BW * 0.41, BY + BH / 2 + 2, { size: 28, weight: 700 });
        fillRR(ctx, BX + BW * 0.82 + 6, BY, (BW * 0.18 - 6) * icmsK, BH, 12, s.color);
        if (icmsK > 0.6) text(ctx, '18%', BX + BW * 0.91 + 3, BY + BH / 2 + 2, { size: 30, weight: 900 });
        text(ctx, 'a base do ICMS é o preço final inteiro', BX + BW / 2, BY + BH + 26, { size: 26, weight: 600, color: C.muted, alpha: appear(t, tMesmo + 0.4) * (1 - appear(t, tFatia - 0.3, 0.3)) });
        ctx.restore();
        const vk = appear(t, tViram, 0.5);
        if (vk > 0) {
          ctx.save(); ctx.strokeStyle = s.color; ctx.lineWidth = 4; ctx.globalAlpha = vk; ctx.setLineDash([10, 8]);
          ctx.beginPath(); ctx.moveTo(BX, BY - 20); ctx.lineTo(BX + BW * 0.82, BY - 20); ctx.stroke(); ctx.restore();
          const k22 = appear(t, t22, 0.4, ease.back);
          pill(ctx, BX + BW * 0.41, BY - 54, 600, 60, '18% por dentro ≈ 22% por fora', s.color, k22, { size: 30 });
          if (k22 > 0) shockRing(ctx, t, t22, BX + BW * 0.41, BY - 54, s.color, 40, 300);
        }
      }
    },
    overlay(ctx, t) {
      punchText(ctx, t, tFatia, 'a maior fatia de imposto', RX + RW / 2, 762, { size: 40, weight: 900, color: s.color, glow: hexA(s.color, 0.6) });
      overlaySource(ctx, 'RICMS/SP, tabelas estaduais 2026', appear(t, tSP));
    },
  };
}

// ---------------------------------------------------------------- Cena 09: fatia 6, o resto
function scene09(K) {
  const s = S.resto;
  const tV = K('trezentos e oitenta'), tPct = K('tres por cento');
  const items = [[iconPlane, 'Frete', K('o frete')], [iconShield, 'Seguro', K('o seguro')], [iconShield, 'Garantia', K('a garantia')],
    [(c, x, y, sz, col) => miniIcon(c, 'chart', x, y, sz, col), 'Risco do dólar', K('o risco')], [iconPercent, 'Margem extra', K('a margem')]];
  const tQuanto = K('quanto vai'), tNao = K('nao divulga');
  const cam = sliceCam([{ t: tV, ...VALUE_FOCUS }, { t: items[0][2], ...RIGHT(480) }, { t: items[3][2], ...RIGHT(540) }, { t: tQuanto, ...RIGHT(560) }], tNao + 1.4);
  const barAt = BAR_AT;
  const sfx = [[0.05, 'whoosh', 0.6], [0.35, 'pop', 0.7], [tV + 1.0, 'impact', 0.5], [tPct, 'pop', 0.6], ...items.map(([, , at]) => [at, 'pop', 0.8]), [tQuanto, 'riser', 0.3, { dur: 0.9 }], [tNao, 'hit', 0.8]];
  ticks(sfx, tV, tV + 1.0);
  return {
    accent: s.color, cam, sfx, impacts: [tNao],
    draw(ctx, t) {
      sliceBase(ctx, t, 5, s, iconBox, tV, { barAt, tPct, title: 'O resto' });
      items.forEach(([icon, label, at], i) => {
        const col = i % 3, row = Math.floor(i / 3);
        const x = RX + 40 + col * 300, y = 270 + row * 230;
        const k = appear(t, at, 0.55, ease.back);
        if (k <= 0) return;
        ctx.save(); ctx.translate(x + 130, y + 95); ctx.scale(k, k); ctx.translate(-(x + 130), -(y + 95));
        const hot = 1 - prog(t, at + 0.3, 1.0);
        ctx.save(); ctx.shadowColor = s.color; ctx.shadowBlur = 40 * hot; card(ctx, x, y, 260, 200, 1); ctx.restore();
        icon(ctx, x + 130, y + 80, 80, i === 4 ? C.gold : s.color);
        text(ctx, label, x + 130, y + 160, { size: 30, weight: 700 });
        ctx.restore();
      });
      const lk = appear(t, tNao - 0.1, 0.5, ease.back);
      if (lk > 0) {
        const x = RX + 40 + 2 * 300 + 130, y = 270 + 230 + 95;
        ctx.save(); ctx.translate(x, y); ctx.scale(lk, lk);
        circle(ctx, 0, 0, 90, hexA(C.gold, 0.15));
        ctx.strokeStyle = C.gold; ctx.lineWidth = 8;
        ctx.beginPath(); ctx.arc(0, -18, 26, Math.PI, 0); ctx.stroke();
        fillRR(ctx, -38, -18, 76, 60, 10, C.gold);
        text(ctx, '?', 0, 14, { size: 40, weight: 900, color: '#0b1222' });
        ctx.restore();
        text(ctx, 'A Apple não divulga', x, y + 130, { size: 30, weight: 800, color: C.gold, alpha: lk });
      }
    },
    overlay(ctx, t) { overlaySource(ctx, 'cálculo do canal (o que sobra depois dos impostos)', appear(t, tV)); },
  };
}

// ---------------------------------------------------------------- Cena 10: o iPhone completo
function scene10(K) {
  const tTudo = K('juntando tudo'), tCel = K('seis mil cento'), tImp = K('cinco mil quatrocentos'), tFed = K('tres mil trezentos'), tEst = K('dois mil cento e sessenta pro');
  const t46 = K('quarenta e seis por cento'), tQuase = K('quase metade');
  const cx = 600, cy = 500, R = 300, r = 185;
  const cam = [{ t: 0, x: 600, y: 500, z: 1.3 }, { t: tCel - 0.3, x: 960, y: 480, z: 1.04, d: 1.6 }, { t: tImp - 0.2, x: 1000, y: 470, z: 1.08, d: 1.2 },
    { t: tFed - 0.2, x: 1050, y: 560, z: 1.12, d: 1.2 }, { t: t46 - 0.2, x: 760, y: 500, z: 1.2, d: 0.9 }, { t: tQuase + 1.2, ...HOME, d: 1.6 }];
  const sfx = [[0.05, 'whoosh', 0.7], [tTudo, 'riser', 0.3, { dur: Math.max(0.6, tCel - tTudo) }], [tCel, 'pop', 0.9], ...TAX.map((_, i) => [tImp + i * 0.15, 'pop', 0.7]),
    [tFed, 'click', 0.8], [tEst, 'click', 0.8], [t46, 'impact', 1], [tQuase, 'hit', 0.7]];
  return {
    accent: C.icms, cam, sfx, impacts: [t46],
    draw(ctx, t) {
      punchText(ctx, t, 0.1, 'O iPhone completo', W / 2, 140, { size: 60, weight: 800, until: tQuase - 0.2 });
      const hl = appear(t, t46 - 0.2, 0.6);
      let a0 = -Math.PI / 2 + (1 - ease.out(prog(t, 0, 2))) * -0.6;
      ctx.save(); ctx.globalAlpha = 0.5; ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = R - r;
      ctx.beginPath(); ctx.arc(cx, cy, (R + r) / 2, 0, 6.283); ctx.stroke(); ctx.restore();
      const order = ['aparelho', 'ii', 'ipi', 'pis', 'icms', 'resto'];
      const at = { aparelho: tCel, ii: tImp, ipi: tImp + 0.15, pis: tImp + 0.3, icms: tImp + 0.45, resto: tEst + 1.6 };
      order.forEach((key) => {
        const s = S[key];
        const span = (s.val / PRICE) * Math.PI * 2;
        const k = ease.inOut(prog(t, at[key], 0.8));
        const isTax = TAX.includes(key);
        if (k > 0) {
          const pop = isTax ? 22 * hl : 0;
          const mid = a0 + span / 2;
          ctx.save();
          ctx.translate(Math.cos(mid) * pop, Math.sin(mid) * pop);
          ctx.globalAlpha = isTax ? 1 : 1 - 0.65 * hl;
          ctx.fillStyle = s.color;
          if (isTax && hl > 0) { ctx.shadowColor = s.color; ctx.shadowBlur = 40 * hl; }
          ctx.beginPath(); ctx.arc(cx, cy, R, a0, a0 + span * k); ctx.arc(cx, cy, r, a0 + span * k, a0, true); ctx.closePath(); ctx.fill();
          ctx.restore();
        }
        a0 += span;
      });
      // legenda à direita
      const rows = [
        { label: 'O celular', val: 6139, color: S.aparelho.color, at: tCel },
        { label: 'Impostos', val: 5472, color: C.fed, at: tImp, sw: TAX.map((k) => S[k].color) },
        { label: '  governo federal', val: 3312, color: '#fb7185', at: tFed, small: true },
        { label: '  seu estado', val: 2160, color: C.icms, at: tEst, small: true },
        { label: 'O resto', val: 388, color: C.dist, at: tEst + 1.6 },
      ];
      rows.forEach((rw, i) => {
        const lk = appear(t, rw.at, 0.5);
        if (lk <= 0) return;
        const ly = 280 + i * 100;
        const isTaxRow = i >= 1 && i <= 3;
        const la = lk * (isTaxRow ? 1 : 1 - 0.6 * hl);
        ctx.save(); ctx.translate((1 - lk) * 60, 0);
        if (rw.sw) rw.sw.forEach((c, j) => fillRR(ctx, 1060 + j * 13, ly - 24, 12, 48, 4, c, la));
        else fillRR(ctx, 1060 + (rw.small ? 30 : 0), ly - (rw.small ? 16 : 24), rw.small ? 32 : 48, rw.small ? 32 : 48, 10, rw.color, la);
        text(ctx, rw.label.trim(), 1136 + (rw.small ? 20 : 0), ly, { size: rw.small ? 34 : 42, weight: rw.small ? 600 : 700, align: 'left', alpha: la, color: rw.small ? C.muted : C.text });
        text(ctx, brlI(rw.val), 1800, ly, { size: rw.small ? 36 : 44, weight: 900, align: 'right', alpha: la });
        ctx.restore();
      });
      if (hl < 0.5) {
        const a = appear(t, 0.3) * (1 - hl * 2);
        text(ctx, 'R$ 11.999', cx, cy - 10, { size: 70, weight: 900, alpha: a });
        text(ctx, 'iPhone 18 Pro', cx, cy + 50, { size: 30, weight: 600, color: C.muted, alpha: a });
      }
      const pk = appear(t, t46, 0.4, ease.back);
      if (pk > 0) {
        ctx.save(); ctx.translate(cx, cy); ctx.scale(pk, pk);
        glowText(ctx, '46%', 0, -14, { size: 104, weight: 900, color: C.fed, glow: hexA(C.fed, 0.7), blur: 50 });
        text(ctx, 'é imposto', 0, 60, { size: 36, weight: 700 });
        ctx.restore();
        shockRing(ctx, t, t46, cx, cy, C.fed, 190, 520);
      }
      punchText(ctx, t, tQuase, 'Quase metade.', W / 2, 140, { size: 60, weight: 900, color: C.gold, glow: hexA(C.gold, 0.5) });
    },
    overlay(ctx, t) { overlaySource(ctx, 'cálculo do canal · valores arredondados', appear(t, tCel)); },
  };
}

// ---------------------------------------------------------------- Cena 11: os seus R$ 100 e a Espanha
function banknote(ctx, x, y, w, h, alpha) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha *= alpha;
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, '#1d4ed8'); g.addColorStop(1, '#0e7490');
  ctx.fillStyle = g; ctx.shadowColor = 'rgba(56,189,248,0.5)'; ctx.shadowBlur = 40;
  rr(ctx, x, y, w, h, 20); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 4;
  rr(ctx, x + 16, y + 16, w - 32, h - 32, 12); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath(); ctx.arc(x + w * 0.72, y + h / 2, h * 0.32, 0, 6.283); ctx.fill();
  ctx.restore();
  text(ctx, '100', x + 50, y + 70, { size: 64, weight: 900, align: 'left', alpha });
  text(ctx, 'R$ 100', x + w * 0.72, y + h / 2 + 4, { size: 56, weight: 900, alpha });
  text(ctx, 'CEM REAIS', x + 50, y + h - 50, { size: 26, weight: 800, align: 'left', alpha: alpha * 0.8, letter: 3 });
}
function scene11(K) {
  const tCem = K('cada cem reais'), t51 = K('cinquenta e um pagam'), t46 = K('quarenta e seis pagam'), t3 = K('tres pagam');
  const tJusto = K('pra ser justo'), tCaixa = K('cobrado no caixa'), t75 = K('sete e meio'), tSom = K('mesmo somando'), t6600 = K('seis mil e seiscentos');
  const tEsp = K('na espanha'), t21 = K('vinte e um por cento'), tVez = K('uma vez so'), t39 = K('trinta e nove'), t95 = K('noventa e cinco');
  const order = [['aparelho', 51, t51, [S.aparelho.color]], ['tax', 46, t46, TAX.map((k) => S[k].color)], ['resto', 3, t3, [C.dist]]];
  const x0 = 160, wTot = W - 320, y = 560, h = 150;
  const phase2 = (t) => appear(t, tJusto - 0.3, 0.6);
  const cam = [{ t: 0, x: 960, y: 420, z: 1.25 }, { t: tCem, x: 960, y: 380, z: 1.35, d: 1.2 },
    ...order.map(([, , at], i) => ({ t: at - 0.25, x: lerp(880, 1060, i / 2), y: 520, z: 1.05, d: 1.1 })),
    { t: tJusto - 0.3, x: 960, y: 520, z: 1.0, d: 1.2 }, { t: t6600 - 0.2, x: 1080, y: 560, z: 1.1, d: 1.0 }, { t: tEsp - 0.3, x: 960, y: 540, z: 1.0, d: 1.2 }, { t: t95, x: 980, y: 580, z: 1.06, d: 0.9 }];
  const sfx = [[0.05, 'whoosh', 0.7], [tCem, 'cash', 1], ...order.map(([, , at]) => [at, 'coin', 0.55]), [tJusto - 0.3, 'swoosh', 0.7], [tCaixa, 'cash', 0.5], [t75, 'pop', 0.7], [t6600, 'pop', 0.8],
    [tEsp, 'pop', 0.8], [t21, 'click', 0.7], [t39, 'pop', 0.8], [t95, 'impact', 1]];
  const bars = [['EUA', 0, 'preço de vitrine', null, '#93c5fd'], ['Espanha', 39, 'imposto de 21%, uma vez só', t39, '#fbbf24'], ['Brasil', 95, 'quase o dobro', t95, C.fed]];
  return {
    accent: '#38bdf8', cam, sfx, impacts: [tCem, t95],
    draw(ctx, t) {
      const p2 = phase2(t);
      // fase 1: a nota
      if (p2 < 1) {
        ctx.save(); ctx.globalAlpha *= 1 - p2;
        const nk = appear(t, tCem - 0.2, 0.7, ease.back);
        const nw = 600, nh = 280;
        const shrink = appear(t, t51 - 0.3, 0.6);
        ctx.save(); ctx.translate(W / 2, 360); ctx.rotate((1 - nk) * -0.25); ctx.scale(1 - 0.3 * shrink, 1 - 0.3 * shrink); ctx.translate(-W / 2, -360);
        banknote(ctx, W / 2 - nw / 2, 220 + (1 - nk) * 60, nw, nh, nk * (1 - 0.5 * shrink));
        ctx.restore();
        sparks(ctx, t, tCem + 0.1, W / 2, 360, C.gold, 20);
        let cx = x0;
        order.forEach(([key, v, at, cols]) => {
          const sw = (v / 100) * wTot;
          const k = appear(t, at, 0.55, ease.back);
          if (k > 0) {
            const yy = y + (1 - k) * 50;
            ctx.save(); ctx.shadowColor = cols[0]; ctx.shadowBlur = 30 * (1 - prog(t, at + 0.3, 1));
            if (cols.length > 1) {
              const parts = TAX.map((k2) => S[k2].pct), tot = parts.reduce((a, b) => a + b, 0);
              let px = cx + 3;
              parts.forEach((pp, j) => { const pw = (pp / tot) * (sw - 6); ctx.globalAlpha = k; ctx.fillStyle = cols[j]; rr(ctx, px, yy, pw - (j < parts.length - 1 ? 3 : 0), h, 14); ctx.fill(); px += pw; });
              ctx.globalAlpha = 1;
            } else fillRR(ctx, cx + 3, yy, sw - 6, h, 16, cols[0], k);
            ctx.restore();
            if (key !== 'resto') {
              text(ctx, `R$ ${v}`, cx + sw / 2, yy + h / 2, { size: 60, weight: 900, alpha: k });
              text(ctx, key === 'tax' ? 'impostos' : 'o celular', cx + sw / 2, y + h + 44, { size: 30, weight: 700, color: C.muted, alpha: k });
            } else {
              text(ctx, 'R$ 3', cx + sw / 2, y - 34, { size: 40, weight: 900, color: C.dist, alpha: k });
              text(ctx, 'o resto', cx + sw / 2, y + h + 44, { size: 26, weight: 600, color: C.muted, alpha: k });
            }
          }
          cx += sw;
        });
        ctx.restore();
      }
      // fase 2: comparação justa
      if (p2 > 0) {
        ctx.save(); ctx.globalAlpha *= p2;
        // o preço americano não inclui o imposto de lá
        const us = 1 - appear(t, tEsp - 0.4, 0.5);
        if (us > 0) {
          ctx.save(); ctx.globalAlpha *= us;
          phone(ctx, 560, 500, 420, { glow: hexA(C.petro, 0.3) });
          text(ctx, 'Estados Unidos', 560, 250, { size: 34, weight: 800, color: C.muted });
          glowText(ctx, usdI(USD), 1180, 330, { size: 92, weight: 900, glow: 'rgba(255,255,255,0.35)' });
          text(ctx, 'preço de vitrine, sem imposto', 1180, 410, { size: 34, weight: 600, color: C.muted });
          pill(ctx, 1180, 520, 620, 84, '+ imposto no caixa', '#93c5fd', appear(t, tCaixa, 0.5, ease.back), { size: 40 });
          pill(ctx, 1180, 620, 420, 70, 'média de 7,5%', '#93c5fd', appear(t, t75, 0.5, ease.back), { size: 34 });
          const fk = appear(t, t6600, 0.5, ease.back);
          if (fk > 0) {
            ctx.save(); ctx.translate(1180, 730); ctx.scale(fk, fk);
            glowText(ctx, '≈ R$ 6.600', 0, 0, { size: 84, weight: 900, color: '#93c5fd', glow: hexA(C.petro, 0.6) });
            ctx.restore();
            shockRing(ctx, t, t6600, 1180, 730, '#93c5fd', 60, 380);
          }
          ctx.restore();
        }
        pill(ctx, W / 2, 220, 900, 84, 'EUA, com imposto no caixa: ≈ R$ 6.600', '#93c5fd', appear(t, tEsp - 0.3, 0.5), { size: 36 });
        const ek = appear(t, tEsp - 0.2, 0.5);
        if (ek > 0) {
          text(ctx, 'Quanto mais caro que nos EUA', 220, 360, { size: 34, weight: 700, color: C.muted, align: 'left', alpha: ek });
          bars.forEach(([name, pct, sub, at, col], i) => {
            const yy = 420 + i * 140;
            const k = i === 0 ? ek : ease.inOut(prog(t, at - 0.1, 0.9));
            const shown = i === 0 ? ek : appear(t, i === 1 ? tEsp : t95 - 0.3);
            const bw = Math.max(8, 760 * (pct / 100) * (i === 0 ? 1 : k));
            text(ctx, name, 220, yy + 45, { size: 44, weight: 800, align: 'left', alpha: shown });
            fillRR(ctx, 520, yy + 10, bw, 70, 14, col, shown);
            const vk = i === 0 ? ek : appear(t, at, 0.4);
            const lab = i === 0 ? 'referência' : `+${Math.round(pct * k)}%`;
            const lx = 520 + bw + 24;
            text(ctx, lab, lx, yy + 47, { size: 48, weight: 900, align: 'left', alpha: vk, color: i === 2 ? C.fed : C.text });
            text(ctx, sub, lx + measure(ctx, i === 0 ? lab : '+95%', 48, 900) + 28, yy + 47, { size: 28, weight: 600, align: 'left', color: C.muted, alpha: i === 1 ? appear(t, t21) : vk });
          });
          if (t > t95) shockRing(ctx, t, t95 + 0.8, 520 + 722, 420 + 280 + 45, C.fed, 40, 300);
        }
        ctx.restore();
      }
    },
    overlay(ctx, t) {
      ctx.save(); ctx.globalAlpha *= 1 - phase2(t);
      punchText(ctx, t, 0.1, 'Cada R$ 100 desse iPhone', W / 2, 140, { size: 60, weight: 800 });
      ctx.restore();
      overlaySource(ctx, phase2(t) < 0.5 ? 'cálculo do canal' : 'Tax Foundation (2026), Apple Espanha, Neoteo (set/2026)', Math.max(appear(t, t51) * (1 - phase2(t)), appear(t, tCaixa)));
    },
  };
}

// ---------------------------------------------------------------- Cena 12: e o iPhone feito aqui?
function scene12(K) {
  const tSeP = K('se o problema'), tQ = K('e ai vem a pergunta'), tBar = K('bem mais barato'), tExiste = K('existe um'), tJund = K('montado em jundiai'), tEUA = K('nos estados unidos ele custa');
  const t899 = K('oitocentos e noventa e nove'), t4600 = K('quatro mil e seiscentos'), t8299 = K('oito mil duzentos'), t80 = K('oitenta por cento');
  const tR = [K('primeiro porque'), K('segundo porque'), K('terceiro porque')];
  const tPouco = K('pouco antes'), t17p = K('o iphone 17 pro'), tTeto = K('o preco da apple e o teto'), tParte = K('uma parte que voce'), t11499 = K('onze mil quatrocentos'), t8048 = K('oito mil e quarenta'), t30 = K('trinta por cento a menos');
  const pA = (t) => 1 - appear(t, tR[0] - 0.5, 0.5);                // fase A: comparação
  const pB = (t) => appear(t, tR[0] - 0.4, 0.5) * (1 - appear(t, tParte - 0.4, 0.5)); // fase B: motivos
  const pC = (t) => appear(t, tParte - 0.3, 0.6);                    // fase C: o teto
  const cardY = (i) => 280 + i * 165;
  const cam = [{ t: 0, x: 960, y: 520, z: 1.25 }, { t: tBar, x: 960, y: 520, z: 1.4, d: 0.6 },
    { t: tExiste - 0.2, x: 960, y: 520, z: 1.05, d: 1.0 }, { t: tEUA - 0.2, x: 800, y: 560, z: 1.1, d: 1.2 }, { t: t8299 - 0.2, x: 1100, y: 560, z: 1.1, d: 1.2 },
    { t: t80 - 0.1, x: 960, y: 540, z: 1.1, d: 0.8 },
    ...tR.map((tt, i) => ({ t: tt - 0.3, x: 960, y: cardY(i) + 70, z: 1.08, d: 1.2 })),
    { t: tParte - 0.3, x: 960, y: 520, z: 1.0, d: 1.2 }, { t: t11499 - 0.3, x: 960, y: 540, z: 1.05, d: 1.0 }, { t: t30 + 0.5, x: 960, y: 520, z: 1.0, d: 1.4 }];
  const sfx = [[tQ, 'whoosh', 0.7], [tBar, 'hit', 0.8], [tExiste, 'pop', 0.9], [tJund, 'pop', 0.8], [t899, 'pop', 0.7], [t4600, 'coin', 0.6], [t8299, 'pop', 0.8], [t80, 'impact', 0.9],
    ...tR.map((tt) => [tt, 'pop', 0.9]), [tParte - 0.3, 'swoosh', 0.7], [tTeto, 'hit', 0.7], [tPouco, 'click', 0.7], [t17p, 'pop', 0.8], [tSeP, 'pop', 0.6], [tBar - 0.1, 'swoosh', 0.5], [t11499, 'pop', 0.7], [t8048 - 0.2, 'drop', 0.8], [t8048, 'cash', 0.8], [t30, 'sparkle', 0.8], [t30 + 0.05, 'impact', 0.7]];
  return {
    accent: C.gold, cam, sfx, impacts: [tBar, t80, t30 + 0.05],
    draw(ctx, t) {
      // fase A
      const a = pA(t);
      if (a > 0 && t > tExiste - 0.3) {
        ctx.save(); ctx.globalAlpha *= a;
        const fk = appear(t, Math.min(tJund - 0.1, tExiste + 0.3), 0.6, ease.back);
        if (fk > 0) {
          ctx.save(); ctx.translate(W / 2, 320); ctx.scale(fk, fk);
          fillRR(ctx, -380, -70, 760, 140, 70, hexA(C.etanol, 0.15));
          ctx.save(); ctx.shadowColor = C.etanol; ctx.shadowBlur = 24; strokeRR(ctx, -380, -70, 760, 140, 70, C.etanol, 3); ctx.restore();
          iconFactory(ctx, -290, 0, 80, C.etanol);
          text(ctx, 'iPhone 17: montado em Jundiaí (SP)', 40, 2, { size: 36, weight: 800 });
          ctx.restore();
        }
        const ek = appear(t, tEUA - 0.1, 0.6, ease.back);
        if (ek > 0) {
          phone(ctx, 560, 560, 300, { alpha: ek });
          text(ctx, 'EUA', 560, 380, { size: 32, weight: 800, color: C.muted, alpha: ek });
          glowText(ctx, t > t4600 ? '≈ R$ 4.603' : 'US$ 899', 560, 760, { size: 60, weight: 900, color: t > t4600 ? '#93c5fd' : C.text, alpha: appear(t, t899 - 0.1, 0.3), glow: 'rgba(0,0,0,0)' });
        }
        const bk = appear(t, t8299 - 0.2, 0.6, ease.back);
        if (bk > 0) {
          phone(ctx, 1360, 560, 300, { alpha: bk, glow: hexA(C.gold, 0.35) });
          text(ctx, 'Brasil', 1360, 380, { size: 32, weight: 800, color: C.muted, alpha: bk });
          glowText(ctx, brlI(8299), 1360, 760, { size: 60, weight: 900, color: C.gold, alpha: bk, glow: hexA(C.gold, 0.5) });
        }
        const pk = appear(t, t80, 0.45, ease.back);
        if (pk > 0) { pill(ctx, W / 2, 560, 340, 110, '+80%', C.fed, pk, { size: 64, weight: 900 }); shockRing(ctx, t, t80, W / 2, 560, C.fed, 80, 460); }
        ctx.restore();
      }
      // fase B: três motivos
      const b = pB(t);
      if (b > 0) {
        ctx.save(); ctx.globalAlpha *= b;
        [['1', 'Sai o imposto de importação…', '…mas ICMS, PIS e Cofins continuam'],
          ['2', 'As peças ainda vêm de fora', 'o iPhone é só montado aqui'],
          ['3', 'Quem define o preço é a Apple', 'mesmo preço, montado aqui ou importado']].forEach(([n, title, sub], i) => {
          const k = appear(t, tR[i], 0.6);
          if (k <= 0) return;
          const yy = cardY(i);
          ctx.save(); ctx.translate((1 - k) * 90, 0);
          ctx.save(); ctx.shadowColor = C.gold; ctx.shadowBlur = 30 * (1 - prog(t, tR[i] + 0.3, 1)); card(ctx, 160, yy, W - 320, 140, k, C.gold); ctx.restore();
          circle(ctx, 250, yy + 70, 42, hexA(C.gold, 0.2), k);
          text(ctx, n, 250, yy + 72, { size: 48, weight: 900, color: C.gold, alpha: k });
          text(ctx, title, 330, yy + 50, { size: 42, weight: 800, align: 'left', alpha: k });
          text(ctx, sub, 330, yy + 100, { size: 30, weight: 500, color: C.muted, align: 'left', alpha: appear(t, tR[i] + 0.8, 0.6) });
          ctx.restore();
        });
        ctx.restore();
      }
      // fase C: o teto
      const c = pC(t);
      if (c > 0) {
        ctx.save(); ctx.globalAlpha *= c;
        glowText(ctx, t < tTeto ? 'Uma parte você controla' : 'O preço da Apple é o teto', W / 2, 200, { size: 60, weight: 900, color: C.gold, glow: hexA(C.gold, 0.5) });
        text(ctx, 'iPhone 17 Pro · 256 GB · setembro de 2026', W / 2, 280, { size: 32, weight: 600, color: C.muted, alpha: appear(t, tPouco, 0.5) });
        // o teto: linha da Apple com os preços das lojas sempre abaixo dela
        const cards = appear(t, t11499 - 0.3, 0.5);
        const tk = appear(t, tTeto, 0.6) * (1 - cards);
        if (tk > 0) {
          ctx.save(); ctx.globalAlpha *= tk;
          ctx.strokeStyle = C.gold; ctx.lineWidth = 8; ctx.shadowColor = C.gold; ctx.shadowBlur = 24;
          ctx.beginPath(); ctx.moveTo(lerp(W / 2, 360, ease.out(tk)), 400); ctx.lineTo(lerp(W / 2, W - 360, ease.out(tk)), 400); ctx.stroke();
          ctx.restore();
          text(ctx, 'preço da Apple', 360, 360, { size: 32, weight: 800, color: C.gold, align: 'left', alpha: tk });
          [[700, 520], [960, 600], [1220, 560]].forEach(([x, y], i) => {
            const k = appear(t, tTeto + 0.3 + i * 0.2, 0.5, ease.back) * tk;
            if (k > 0) { fillRR(ctx, x - 60, y, 120, 760 - y, 14, hexA(C.etanol, 0.5), k); text(ctx, 'loja', x, y + 34, { size: 26, weight: 700, alpha: k }); }
          });
          const pk = appear(t, t17p, 0.5, ease.back);
          if (pk > 0) { ctx.save(); ctx.translate(W - 420, 600); ctx.scale(pk, pk); phone(ctx, 0, 0, 280, { glow: hexA(C.petro, 0.3) }); ctx.restore(); text(ctx, 'iPhone 17 Pro', W - 420, 770, { size: 30, weight: 800, alpha: pk }); }
          ctx.restore();
        }
        const ak = appear(t, t11499 - 0.1, 0.5, ease.back);
        if (ak > 0 && cards > 0) {
          ctx.save(); ctx.translate(560, 520); ctx.scale(ak, ak);
          card(ctx, -320, -140, 640, 280, 1, C.petro);
          text(ctx, 'Loja da Apple', 0, -80, { size: 34, weight: 700, color: C.muted });
          text(ctx, brlI(11499), 0, 10, { size: 84, weight: 900, alpha: 1 - 0.5 * appear(t, t8048, 0.4) });
          const st = ease.out(prog(t, t8048 - 0.1, 0.4));
          if (st > 0) { ctx.strokeStyle = C.fed; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-250, 10); ctx.lineTo(lerp(-250, 250, st), 10); ctx.stroke(); }
          ctx.restore();
        }
        const lk = appear(t, t8048, 0.5, ease.back);
        if (lk > 0) {
          ctx.save(); ctx.translate(1360, 520); ctx.scale(lk, lk);
          ctx.save(); ctx.shadowColor = C.etanol; ctx.shadowBlur = 40; card(ctx, -320, -140, 640, 280, 1, C.etanol); ctx.restore();
          text(ctx, 'Grande loja, no Pix', 0, -80, { size: 34, weight: 700, color: C.muted });
          glowText(ctx, brlI(8048), 0, 10, { size: 84, weight: 900, color: C.etanol, glow: hexA(C.etanol, 0.6) });
          ctx.restore();
          sparks(ctx, t, t8048 + 0.1, 1360, 520, C.etanol, 18);
        }
        const pk = appear(t, t30, 0.45, ease.back);
        if (pk > 0) { pill(ctx, W / 2, 740, 560, 96, '30% a menos, mesmo aparelho', C.etanol, pk, { size: 38, weight: 900 }); shockRing(ctx, t, t30 + 0.05, W / 2, 740, C.etanol, 60, 420); }
        ctx.restore();
      }
    },
    overlay(ctx, t) {
      // pergunta grande no centro, que sobe para o topo quando a fábrica aparece
      const k = appear(t, tQ - 0.1, 0.5) * pA(t);
      const m = ease.inOut(prog(t, tExiste - 0.4, 0.7));
      const y = lerp(520, 150, m), s = lerp(1.25, 1, m);
      if (k > 0) {
        ctx.save(); ctx.translate(W / 2, y); ctx.scale(s, s);
        glowText(ctx, 'E SE FOSSE FEITO AQUI?', 0, 0, { size: 64, weight: 900, alpha: k, glow: 'rgba(255,255,255,0.35)' });
        ctx.restore();
      }
      const sub = (1 - m) * k;
      if (sub > 0) {
        ctx.save(); ctx.globalAlpha *= sub;
        const a1 = appear(t, tSeP, 0.5, ease.back), a2 = appear(t, tBar - 0.1, 0.5, ease.back);
        pill(ctx, 660, 680, 520, 80, 'sem imposto de importação', '#fb7185', a1, { size: 34 });
        if (a2 > 0) {
          ctx.save(); ctx.globalAlpha *= a2; ctx.strokeStyle = C.gold; ctx.lineWidth = 6; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(950, 680); ctx.lineTo(1060, 680); ctx.moveTo(1040, 664); ctx.lineTo(1060, 680); ctx.lineTo(1040, 696); ctx.stroke(); ctx.restore();
        }
        pill(ctx, 1290, 680, 380, 80, 'mais barato?', C.gold, a2, { size: 38, weight: 900 });
        ctx.restore();
      }
      const src = pC(t) > 0.5 ? 'Tecnoblog (set/2026)' : 'MacMagazine, Tecnoblog, Mac Observer (2026)';
      overlaySource(ctx, src, Math.max(appear(t, tJund) * pA(t), pC(t)));
    },
    hideWorldUntil: tExiste - 0.35,
  };
}

// ---------------------------------------------------------------- Cena 13: fechamento
function scene13(K) {
  const tOlhar = K('olhar o preco'), tNao = K('nao e celular'), tImp = K('e imposto cobrado'), tUm = K('um em cima'), tInsc = K('se inscreve'), tProx = K('no proximo'), tLuz = K('conta de luz'), tAte = K('ate la');
  const cam = [{ t: 0, x: 960, y: 470, z: 1.3 }, { t: tNao - 0.2, x: 960, y: 470, z: 1.15, d: 1.2 }, { t: tUm, x: 1100, y: 470, z: 1.1, d: 1.2 }, { t: tInsc - 0.3, x: 960, y: 600, z: 1.25, d: 1.1 },
    { t: tProx, x: 960, y: 600, z: 1.05, d: 1.2 }, { t: tAte, x: 960, y: 520, z: 0.95, d: 3 }];
  const sfx = [[0.05, 'whoosh', 0.6], [tOlhar, 'pop', 0.6], [tNao, 'hit', 0.7], ...TAX.map((_, i) => [tUm + i * 0.2, 'pop', 0.7]), [tInsc + 0.1, 'pop', 0.8], [tInsc + 0.9, 'click', 1],
    [tLuz, 'whoosh', 0.8], [tLuz + 0.2, 'sparkle', 0.6], [tAte, 'impact', 0.5]];
  return {
    accent: C.gold, cam, sfx, impacts: [],
    draw(ctx, t) {
      const fill = ease.inOut(prog(t, tOlhar, 1.6));
      const tx = ease.inOut(prog(t, tInsc - 0.4, 0.8));
      const px = lerp(760, 560, tx), py = lerp(470, 360, tx), ph = lerp(560, 300, tx);
      const slices = SLICES.map((s) => ({ color: s.color, frac: (s.val / PRICE) * fill, alpha: t > tNao && !TAX.includes(s.key) ? 0.35 : 1 }));
      phone(ctx, px, py, ph, { slices, glow: hexA(C.fed, 0.3 * appear(t, tNao)) });
      // pilha "um em cima do outro"
      TAX.forEach((key, i) => {
        const k = appear(t, tUm + i * 0.2, 0.45, ease.back) * (1 - tx);
        if (k <= 0) return;
        const s = S[key];
        const bw = 420, bh = 70, bx = 1080, by = 640 - i * (bh + 12) - (1 - k) * 60;
        fillRR(ctx, bx, by, bw, bh, 14, s.color, k);
        text(ctx, s.name, bx + bw / 2, by + bh / 2 + 2, { size: 32, weight: 800, alpha: k });
      });
      const bk = appear(t, tInsc, 0.5, ease.back);
      if (bk > 0) {
        const press = t > tInsc + 0.8 && t < tInsc + 1.05 ? 0.92 : 1;
        const subscribed = t > tInsc + 0.95;
        ctx.save(); ctx.translate(1200, 360); ctx.scale(bk * press, bk * press);
        ctx.save(); ctx.shadowColor = '#dc2626'; ctx.shadowBlur = subscribed ? 0 : 40;
        fillRR(ctx, -230, -50, 460, 100, 50, subscribed ? '#334155' : '#dc2626'); ctx.restore();
        text(ctx, subscribed ? 'INSCRITO' : 'INSCREVA-SE', 0, 2, { size: 40, weight: 900, letter: 2 });
        ctx.restore();
      }
      const nk = appear(t, tProx, 0.6);
      if (nk > 0) {
        ctx.save(); ctx.translate(0, (1 - nk) * 30);
        card(ctx, W / 2 - 640, 640, 1280, 120, nk, C.gold);
        miniIcon(ctx, 'bolt', W / 2 - 560, 700, 60, C.gold);
        text(ctx, 'Próximo vídeo: quem fica com cada real da sua conta de luz', W / 2 + 40, 700, { size: 36, weight: 700, alpha: nk, maxWidth: 1120 });
        ctx.restore();
      }
    },
    overlay(ctx, t) {
      punchText(ctx, t, tNao, 'Quase metade não é celular.', W / 2, 140, { size: 60, weight: 900, until: tImp - 0.1 });
      punchText(ctx, t, tImp, 'É imposto, um em cima do outro.', W / 2, 140, { size: 60, weight: 900, color: C.fed, glow: hexA(C.fed, 0.5), until: tInsc - 0.3 });
    },
  };
}

export const SCENES = [
  { id: '01', name: 'gancho', build: scene01 },
  { id: '02', name: 'numeros', build: scene02 },
  { id: '03', name: 'caminho', build: scene03 },
  { id: '04', name: 'aparelho', build: scene04 },
  { id: '05', name: 'importacao', build: scene05 },
  { id: '06', name: 'ipi', build: scene06 },
  { id: '07', name: 'pis-cofins', build: scene07 },
  { id: '08', name: 'icms', build: scene08 },
  { id: '09', name: 'resto', build: scene09 },
  { id: '10', name: 'iphone-completo', build: scene10 },
  { id: '11', name: 'cem-reais', build: scene11 },
  { id: '12', name: 'feito-aqui', build: scene12 },
  { id: '13', name: 'fechamento', build: scene13 },
];
