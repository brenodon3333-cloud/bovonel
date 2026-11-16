// Thumbnails do vídeo 05 (1920x1080). Usam os mesmos desenhos do vídeo (lata, cupom fiscal, carimbos, geladeira).
// Gerar: node tools/thumbs.mjs video-05-cerveja
// Regras: objeto real em destaque, até 4 palavras, texto com profundidade, nada do nome do canal.

const TCAM = { x: 960, y: 540, z: 1 };
function tbVig(ctx, w, h, a = 0.55) {
  const v = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,0,${a})`); ctx.fillStyle = v; ctx.fillRect(0, 0, w, h);
}
function tbGlow(ctx, x, y, r, col, a) { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, hexA(col, a)); g.addColorStop(1, hexA(col, 0)); ctx.fillStyle = g; ctx.fillRect(0, 0, 1920, 1080); }
function bigType(ctx, str, x, y, o = {}) {
  const { size = 160, color = '#fff', color2 = null, align = 'left', depth = 9, stroke = 12, hl = null, rot = 0 } = o;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.font = font(size, 900); ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  const w = ctx.measureText(str).width, x0 = align === 'left' ? 0 : align === 'center' ? -w / 2 : -w;
  if (hl) {
    const pad = size * 0.16, top = -size * 0.8, bh = size * 1.02;
    ctx.save(); ctx.rotate(-0.025); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10; ctx.fillStyle = hl;
    ctx.beginPath(); ctx.moveTo(x0 - pad, top + 6); ctx.lineTo(x0 + w + pad, top); ctx.lineTo(x0 + w + pad + 10, top + bh * 0.5); ctx.lineTo(x0 + w + pad - 4, top + bh); ctx.lineTo(x0 - pad + 4, top + bh + 6); ctx.lineTo(x0 - pad - 10, top + bh * 0.45); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.65)'; ctx.shadowBlur = 36; ctx.shadowOffsetY = depth + 6; ctx.fillStyle = '#05070d'; ctx.fillText(str, depth * 0.4, depth); ctx.restore();
  ctx.fillStyle = '#05070d'; for (let i = depth; i > 0; i--) ctx.fillText(str, i * 0.4, i);
  ctx.lineJoin = 'round'; ctx.lineWidth = stroke; ctx.strokeStyle = '#05070d'; ctx.strokeText(str, 0, 0);
  const g = ctx.createLinearGradient(0, -size * 0.75, 0, 0); g.addColorStop(0, color); g.addColorStop(1, color2 || color);
  ctx.fillStyle = g; ctx.fillText(str, 0, 0);
  ctx.restore();
  return w;
}
function fundoGeladeira(ctx, w, h, spots) {
  ctx.fillStyle = '#060a15'; ctx.fillRect(0, 0, w, h);
  geladeiraFundo(ctx, TCAM, 0.95);
  for (const [x, y, r, c, a] of spots) tbGlow(ctx, x, y, r, c, a);
  mesaMadeira(ctx, 900, -100, 2100);
}

// A: a lata com o rótulo pintado de quem fica com cada real; o "56%" riscado
function drawThumb5A(ctx, w, h) {
  fundoGeladeira(ctx, w, h, [[1380, 520, 760, '#fbbf24', 0.2], [300, 300, 700, '#ef4444', 0.22]]);
  const bands = [[0.3, P.estado, 'IMPOSTO', '30'], [0.2, P.mercado, 'MERCADO', '20'], [0.5, P.fabrica, 'FÁBRICA', '50']];
  lata(ctx, 1400, 560, 2.2, { t: 3, rot: 0.06, open: 1, bands: (c, x0, top, cw, lh) => { let y = top; for (const [f, col] of bands) { c.fillStyle = hexA(col, 0.9); c.fillRect(x0, y, cw, lh * f); y += lh * f; } } });
  // rótulos de cada faixa (centavos de cada real)
  const top = 560 + (-186 + 62) * 2.2, lh = (372 - 104) * 2.2; let y = top;
  for (const [f, , nm, v] of bands) { const cy = y + (lh * f) / 2; text(ctx, v, 1400, cy - 8, { size: f > 0.25 ? 120 : 92, weight: 900, color: '#ffffff', shadow: true }); text(ctx, nm, 1400, cy + (f > 0.25 ? 56 : 44), { size: 34, weight: 900, color: '#0b1222', letter: 4 }); y += lh * f; }
  text(ctx, 'de cada R$ 1 da lata', 80, 800, { size: 48, weight: 900, color: '#e2e8f0', align: 'left', shadow: true });
  tbVig(ctx, w, h, 0.5);
  bigType(ctx, '56%', 80, 430, { size: 250, color: '#fecaca', color2: '#ef4444' });
  ctx.save(); ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 26; ctx.lineCap = 'round'; ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 20;
  ctx.beginPath(); ctx.moveTo(60, 370); ctx.lineTo(720, 230); ctx.stroke(); ctx.restore();
  bigType(ctx, 'É MESMO?', 80, 680, { size: 150, color: '#fff7c2', color2: '#facc15', hl: '#1e3a8a' });
}

// B: o imposto do pecado carimbado na lata; o IPI 3,9% cai e o 4,2% entra
function drawThumb5B(ctx, w, h) {
  fundoGeladeira(ctx, w, h, [[1350, 500, 760, '#ef4444', 0.3], [400, 820, 600, '#facc15', 0.15]]);
  lata(ctx, 1380, 560, 2.2, { t: 7, rot: 0.1 });
  rectStamp(ctx, 1380, 540, 760, 170, 'IMPOSTO DO PECADO', P.red, 1, -0.1, 62);
  chip(ctx, 880, 860, 'IPI 3,9%', '#94a3b8', 1, { size: 50 });
  ctx.save(); ctx.translate(880, 860); ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-130, 10); ctx.lineTo(130, -10); ctx.stroke(); ctx.restore();
  bigType(ctx, '4,2%', 1440, 215, { size: 150, color: '#fef3c7', color2: '#fbbf24', rot: 0.06, depth: 10 });
  tbVig(ctx, w, h, 0.5);
  bigType(ctx, 'VAI', 80, 420, { size: 200 });
  bigType(ctx, 'SUBIR?', 80, 640, { size: 200, color: '#fff7c2', color2: '#facc15', hl: '#b91c1c' });
}

// C: o cupom fiscal com os "tributos aproximados" grifados e o carimbo ESTIMATIVA
function drawThumb5C(ctx, w, h) {
  fundoGeladeira(ctx, w, h, [[1350, 540, 760, '#facc15', 0.2], [200, 900, 600, '#7c3aed', 0.2]]);
  const lines = cupomLinhas([{ s: '--------------------------------------', c: 1 }, { s: 'Trib. aprox. R$ (Fonte: IBPT)', b: 1, hl: '#facc15', hlk: 1, big: 1 }, { s: 'Lei Federal 12.741/2012', c: 1 }, { s: 'Consulte pela chave de acesso', c: 1 }]);
  cupom(ctx, 1330, 40, 1.4, lines, lines.length + 1, { qr: true, rot: 0.03 });
  ovalStamp(ctx, 1500, 905, 240, 84, [['ESTIMATIVA', 0.04, 0.5]], P.red, 1, -0.14);
  lata(ctx, 1770, 620, 0.95, { t: 2, rot: 0.08 });
  tbVig(ctx, w, h, 0.5);
  bigType(ctx, 'CONTA', 80, 430, { size: 190 });
  bigType(ctx, 'ERRADA?', 80, 650, { size: 190, color: '#fff7c2', color2: '#facc15', hl: '#b91c1c' });
}

const THUMBS = {
  A: { draw: drawThumb5A, file: 'thumb-A-56.jpg' },
  B: { draw: drawThumb5B, file: 'thumb-B-pecado.jpg' },
  C: { draw: drawThumb5C, file: 'thumb-C-cupom.jpg' },
};
