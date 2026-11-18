// Thumbnails do vídeo 11 (pedágio sem cancela): rascunhos feitos ANTES do roteiro.
// Três ideias para o teste A/B: a multa que custa quase 10 pedágios (número), a cobrança falsa igual à verdadeira (curiosidade + utilidade),
// a estrada do fim de ano sem cabine (novidade). Nenhuma repete as palavras das thumbs do vídeo 10 ("QUEM FICA?").
function trng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
// fundo claro com cor dominante: centro claro, bordas na cor média (nunca preto)
function fundoCor(ctx, w, h, c0, c1, cx = 0.45, cy = 0.45) {
  const g = ctx.createRadialGradient(w * cx, h * cy, 0, w * cx, h * cy, w * 0.8);
  g.addColorStop(0, c0); g.addColorStop(1, c1); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  ctx.save(); ctx.globalAlpha = 0.06; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3;
  for (let x = -h; x < w; x += 46) { ctx.beginPath(); ctx.moveTo(x, h); ctx.lineTo(x + h, 0); ctx.stroke(); }
  ctx.restore();
}
function sombra(ctx, blur = 50, dy = 24, a = 0.45) { ctx.shadowColor = `rgba(0,0,0,${a})`; ctx.shadowBlur = blur; ctx.shadowOffsetY = dy; }
// título grande com profundidade e marca-texto (a mesma família de letra do canal)
function bigType(ctx, str, x, y, o = {}) {
  const { size = 170, color = '#fff', color2 = null, align = 'left', depth = 10, stroke = 14, hl = null, rot = 0 } = o;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.font = font(size, 900); ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  const w = ctx.measureText(str).width, x0 = align === 'left' ? 0 : align === 'center' ? -w / 2 : -w;
  if (hl) {
    const pad = size * 0.16, top = -size * 0.8, bh = size * 1.02;
    ctx.save(); ctx.rotate(-0.02); sombra(ctx, 30, 10, 0.5); ctx.fillStyle = hl;
    ctx.beginPath(); ctx.moveTo(x0 - pad, top + 6); ctx.lineTo(x0 + w + pad, top); ctx.lineTo(x0 + w + pad + 10, top + bh * 0.5); ctx.lineTo(x0 + w + pad - 4, top + bh); ctx.lineTo(x0 - pad + 4, top + bh + 6); ctx.lineTo(x0 - pad - 10, top + bh * 0.45); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  ctx.save(); sombra(ctx, 36, depth + 6, 0.6); ctx.fillStyle = '#05070d'; ctx.fillText(str, depth * 0.4, depth); ctx.restore();
  ctx.fillStyle = '#05070d'; for (let i = depth; i > 0; i--) ctx.fillText(str, i * 0.4, i);
  ctx.lineJoin = 'round'; ctx.lineWidth = stroke; ctx.strokeStyle = '#05070d'; ctx.strokeText(str, 0, 0);
  const g = ctx.createLinearGradient(0, -size * 0.75, 0, 0); g.addColorStop(0, color); g.addColorStop(1, color2 || color);
  ctx.fillStyle = g; ctx.fillText(str, 0, 0);
  ctx.restore();
  return w;
}





// ---------------------------------------------------------------- objetos (genéricos, sem marca)
// pórtico grande sobre a pista, visto de frente, com câmeras e antenas
function porticoT(ctx, x, y, s, flash = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#334155'; ctx.beginPath(); ctx.moveTo(-160, -40); ctx.lineTo(160, -40); ctx.lineTo(900, 520); ctx.lineTo(-900, 520); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#fde68a'; ctx.lineWidth = 14; for (let k = 0; k < 4; k++) { const y0 = -20 + k * 130, y1 = y0 + 70; ctx.beginPath(); ctx.moveTo(lerp(0, 0, 0), y0); ctx.lineTo(0, y1); ctx.stroke(); }
  ctx.fillStyle = '#94a3b8'; ctx.fillRect(-640, -420, 46, 560); ctx.fillRect(594, -420, 46, 560);
  ctx.save(); sombra(ctx, 40, 18, 0.5); fillRR(ctx, -680, -500, 1360, 120, 12, '#1e293b'); ctx.restore();
  for (const cx of [-420, -140, 140, 420]) { fillRR(ctx, cx - 50, -370, 100, 56, 8, '#0f172a'); circle(ctx, cx, -342, 16, '#ef4444'); }
  if (flash > 0) { const g = ctx.createRadialGradient(0, -340, 0, 0, -340, 700); g.addColorStop(0, `rgba(255,255,255,${0.7 * flash})`); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(-900, -900, 1800, 1400); }
  ctx.restore();
}
// envelope de multa com carimbo
function multaT(ctx, x, y, s, rot = -0.08) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.save(); sombra(ctx, 40, 18, 0.5); ctx.fillStyle = '#f8fafc'; ctx.fillRect(-300, -190, 600, 380); ctx.restore();
  ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-300, -190); ctx.lineTo(0, 30); ctx.lineTo(300, -190); ctx.stroke();
  ctx.save(); ctx.rotate(-0.12); ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 14; rr(ctx, -200, 40, 400, 120, 14); ctx.stroke(); text(ctx, 'MULTA', 0, 102, { size: 84, weight: 900, color: '#dc2626' }); ctx.restore();
  ctx.restore();
}
// celular com uma mensagem de cobrança (a verdadeira e a falsa são iguais)
function celT(ctx, x, y, s, rot, marca) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.save(); sombra(ctx, 40, 18, 0.5); fillRR(ctx, -200, -380, 400, 760, 50, '#0f172a'); ctx.restore();
  fillRR(ctx, -178, -350, 356, 700, 32, '#f1f5f9');
  fillRR(ctx, -150, -250, 300, 230, 24, '#ffffff'); 
  text(ctx, 'PEDÁGIO', -120, -205, { size: 30, weight: 900, color: '#475569', align: 'left' });
  text(ctx, 'em aberto', -120, -160, { size: 30, weight: 800, color: '#475569', align: 'left' });
  text(ctx, 'R$ 20,30', -120, -90, { size: 58, weight: 900, color: '#0f172a', align: 'left' });
  fillRR(ctx, -150, 10, 300, 90, 45, '#16a34a'); text(ctx, 'PAGAR', 0, 56, { size: 44, weight: 900, color: '#ffffff' });
  if (marca === 'x') { ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 30; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-150, 160); ctx.lineTo(150, 330); ctx.moveTo(150, 160); ctx.lineTo(-150, 330); ctx.stroke(); }
  if (marca === 'ok') { ctx.strokeStyle = '#16a34a'; ctx.lineWidth = 30; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(-110, 250); ctx.lineTo(-30, 320); ctx.lineTo(120, 160); ctx.stroke(); }
  if (marca === '?') text(ctx, '?', 0, 250, { size: 200, weight: 900, color: '#f59e0b' });
  ctx.restore();
}
// ---------------------------------------------------------------- as três ideias
// A (número): o pórtico à noite e o envelope da multa com "R$ 195". Fundo âmbar claro.
function drawThumb11A(ctx, w, h) {
  fundoCor(ctx, w, h, '#fef3c7', '#d97706', 0.62, 0.5);
  porticoT(ctx, 1300, 600, 0.8, 0.6);
  multaT(ctx, 1380, 780, 0.75, -0.1);
  bigType(ctx, 'R$ 195', 70, 300, { size: 240, hl: '#7c2d12' });
  bigType(ctx, 'por R$ 20?', 80, 520, { size: 120, hl: '#7c2d12', depth: 8, stroke: 12 });
}
// B (curiosidade): dois celulares com a mesma cobrança, um é golpe. Fundo azul claro.
function drawThumb11B(ctx, w, h) {
  fundoCor(ctx, w, h, '#dbeafe', '#2563eb', 0.62, 0.55);
  celT(ctx, 1120, 600, 0.95, -0.07, '?');
  celT(ctx, 1560, 620, 0.95, 0.07, '?');
  bigType(ctx, 'QUAL É', 70, 280, { size: 200, hl: '#1e3a8a' });
  bigType(ctx, 'GOLPE?', 70, 520, { size: 200, hl: '#1e3a8a' });
}
// C (novidade): a estrada da serra à noite com o pórtico no lugar da cabine e "SEM CABINE". Fundo verde claro.
function drawThumb11C(ctx, w, h) {
  fundoCor(ctx, w, h, '#dcfce7', '#16a34a', 0.6, 0.55);
  porticoT(ctx, 1150, 640, 0.95, 0.35);
  bigType(ctx, 'SEM CABINE', 70, 260, { size: 190, hl: '#14532d' });
}
const THUMBS = {
  A: { draw: drawThumb11A, file: 'thumb-A-195.jpg' },
  B: { draw: drawThumb11B, file: 'thumb-B-golpe.jpg' },
  C: { draw: drawThumb11C, file: 'thumb-C-sem-cabine.jpg' },
};
