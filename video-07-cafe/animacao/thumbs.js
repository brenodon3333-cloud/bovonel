// Thumbnails do vídeo 07 (1920x1080). Usam os mesmos desenhos do vídeo (pacote a vácuo, saca de juta, jarra em camadas).
// Gerar: node tools/thumbs.mjs video-07-cafe
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
function fundoCozinha(ctx, w, h, spots) {
  ctx.fillStyle = '#060a15'; ctx.fillRect(0, 0, w, h);
  cozinhaFundo(ctx, TCAM, 1, 0.1);
  for (const [x, y, r, c, a] of spots) tbGlow(ctx, x, y, r, c, a);
}

// A: o pacote aberto com o pó em camadas na jarra; o grão é a camada maior
function drawThumb7A(ctx, w, h) {
  fundoCozinha(ctx, w, h, [[700, 640, 800, '#84cc16', 0.18], [1500, 300, 700, '#f59e0b', 0.14]]);
  coadorJarra(ctx, 560, 470, 1.15, [{ v: 0.58, color: P.grao, glow: 0.4 }, { v: 0.24, color: P.torra }, { v: 0.10, color: P.mercado }, { v: 0.08, color: P.estado }], { coador: false });
  sombraChao(ctx, 1080, 900, 220); pacote(ctx, 1080, 650, 1.35, { tipo: 'real', rot: 0.08 });
  etiquetaPend(ctx, 1560, 520, 1.5, 'R$ 24,75', '500 g · ago/2026', 1, '#facc15', 0);
  bigType(ctx, 'CAIU POUCO?', 960, 190, { size: 150, align: 'center', hl: '#7c2d12' });
  tbVig(ctx, w, h);
}
// B: a saca com a seta grande e o pacote com a seta pequena
function drawThumb7B(ctx, w, h) {
  fundoCozinha(ctx, w, h, [[500, 600, 800, '#ef4444', 0.16], [1400, 600, 700, '#f59e0b', 0.14]]);
  saca(ctx, 480, 600, 1.15, { tipo: 'ARÁBICA' }); setaQueda(ctx, 860, 300, 900, 1, '#ef4444', 150);
  bigType(ctx, '−42%', 860, 260, { size: 130, align: 'center', color: '#fecaca', color2: '#f87171' });
  sombraChao(ctx, 1350, 900, 180); pacote(ctx, 1350, 680, 1.1, { tipo: 'real' }); setaQueda(ctx, 1660, 520, 700, 1, '#f59e0b', 130);
  bigType(ctx, '−24%', 1660, 470, { size: 110, align: 'center', color: '#fde68a', color2: '#f59e0b' });
  bigType(ctx, 'E O PACOTE?', 960, 1010, { size: 120, align: 'center', hl: '#1e3a8a' });
  tbVig(ctx, w, h);
}
// C: o verso do pacote com a lupa no "predominantemente conilon"
function drawThumb7C(ctx, w, h) {
  fundoCozinha(ctx, w, h, [[1100, 540, 800, '#facc15', 0.16]]);
  sombraChao(ctx, 520, 930, 180); pacote(ctx, 520, 650, 1.25, { tipo: 'real', rot: -0.06 });
  sombraChao(ctx, 1150, 960, 230); pacote(ctx, 1150, 600, 1.85, { tipo: 'real', verso: true, linhas: ['PREDOMINANTEMENTE', 'CONILON'], hl: 1, hlRow: 0.5, rot: 0.04 });
  lupa(ctx, 1150, 420, 190, 1);
  bigType(ctx, 'MUDOU?', 1530, 230, { size: 140, align: 'center', hl: '#3f2410' });
  tbVig(ctx, w, h);
}

const THUMBS = {
  A: { draw: drawThumb7A, file: 'thumb-A-caiu-pouco.jpg' },
  B: { draw: drawThumb7B, file: 'thumb-B-e-o-pacote.jpg' },
  C: { draw: drawThumb7C, file: 'thumb-C-mudou.jpg' },
};
