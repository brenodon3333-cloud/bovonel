// Thumbnails do vídeo 10 (brinquedo, refeito do zero): rascunhos feitos ANTES do roteiro.
// Três ideias para o teste A/B: o 70% (dúvida), a fábrica no ano recorde (história), o jogo disputado (briga).
const TCAM = { x: 960, y: 540, z: 1 };
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
// nota de dinheiro de brinquedo (papel colorido, borda branca, círculo no meio com o valor, cantos com o número)
function notaBrinquedo(ctx, x, y, s, val, cor, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.save(); sombra(ctx, 30, 14, 0.4); ctx.fillStyle = cor; ctx.fillRect(-300, -150, 600, 300); ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 12; ctx.strokeRect(-276, -126, 552, 252);
  ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 3; for (let i = -240; i <= 240; i += 30) { ctx.beginPath(); ctx.moveTo(i, -100); ctx.lineTo(i + 20, 100); ctx.stroke(); }
  circle(ctx, 0, 0, 92, 'rgba(255,255,255,0.9)');
  text(ctx, val, 0, 6, { size: 96, weight: 900, color: '#1f2937' });
  for (const [cx, cy] of [[-220, -82], [220, -82], [-220, 86], [220, 86]]) text(ctx, val, cx, cy, { size: 44, weight: 900, color: 'rgba(255,255,255,0.95)' });
  ctx.restore();
}
// caixa de jogo de tabuleiro de compra e venda: tampa com casas coloridas em volta, centro com o nome genérico, lateral
function caixaJogo(ctx, x, y, s, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const W2 = 760, H2 = 520, L = -W2 / 2, T = -H2 / 2;
  ctx.save(); sombra(ctx, 60, 30, 0.45); ctx.fillStyle = '#7f1d1d'; ctx.fillRect(L + 16, T + 30, W2, H2); ctx.fillStyle = '#f8fafc'; ctx.fillRect(L, T, W2, H2); ctx.restore();
  const cols = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#14b8a6', '#eab308'];
  const n = 9, cw = W2 / n, chh = H2 / 7;
  for (let i = 0; i < n; i++) { ctx.fillStyle = cols[i % 8]; ctx.fillRect(L + i * cw + 3, T + 3, cw - 6, 22); ctx.fillRect(L + i * cw + 3, -T - 25, cw - 6, 22); }
  for (let j = 1; j < 6; j++) { ctx.fillStyle = cols[(j + 3) % 8]; ctx.fillRect(L + 3, T + j * chh + 3, 22, chh - 6); ctx.fillRect(-L - 25, T + j * chh + 3, 22, chh - 6); }
  ctx.strokeStyle = '#1f2937'; ctx.lineWidth = 4; ctx.strokeRect(L + 70, T + 70, W2 - 140, H2 - 140);
  ctx.save(); ctx.translate(0, 0); ctx.rotate(-0.12); fillRR(ctx, -250, -60, 500, 120, 14, '#dc2626');
  text(ctx, 'COMPRA E VENDA', 0, 4, { size: 54, weight: 900, color: '#ffffff', letter: 3 }); ctx.restore();
  ctx.restore();
}
// prédio de fábrica antiga com telhado em serra e chaminé, com carimbo no meio
function fabrica(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.save(); sombra(ctx, 50, 24, 0.45); ctx.fillStyle = '#9a3412'; ctx.fillRect(-420, -120, 840, 300); ctx.restore();
  ctx.fillStyle = '#7c2d12'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-420 + i * 210, -120); ctx.lineTo(-420 + i * 210, -240); ctx.lineTo(-210 + i * 210, -120); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = '#bae6fd'; for (let i = 0; i < 4; i++) ctx.fillRect(-410 + i * 210, -228, 26, 100);
  ctx.fillStyle = '#57534e'; ctx.fillRect(300, -420, 70, 300);
  ctx.fillStyle = '#fef3c7'; for (let i = 0; i < 6; i++) ctx.fillRect(-370 + i * 130, -60, 80, 90);
  ctx.fillStyle = '#44403c'; ctx.fillRect(-70, 60, 140, 120);
  ctx.restore();
}

// ---------------------------------------------------------------- as três ideias
// A (dúvida): a nota de brinquedo de 100 com "70%?" grande. Vermelho de Natal claro.
function drawThumb10A(ctx, w, h) {
  fundoCor(ctx, w, h, '#fee2e2', '#dc2626', 0.62, 0.5);
  notaBrinquedo(ctx, 1380, 640, 1.1, '100', '#16a34a', 0.1);
  notaBrinquedo(ctx, 1280, 430, 0.8, '50', '#f59e0b', -0.15);
  bigType(ctx, '70%?', 80, 470, { size: 330, depth: 14, stroke: 18, hl: '#7f1d1d' });
}
// B (história): a fábrica antiga com o carimbo "EM CRISE?". Âmbar claro.
function drawThumb10B(ctx, w, h) {
  fundoCor(ctx, w, h, '#fef3c7', '#d97706', 0.6, 0.55);
  fabrica(ctx, 1240, 720, 1.0);
  bigType(ctx, 'NO RECORDE?', 70, 230, { size: 175, hl: '#78350f' });
}
// C (briga): a caixa de jogo de tabuleiro com as bandeiras do Brasil e dos EUA puxando. Azul claro.
function drawThumb10C(ctx, w, h) {
  fundoCor(ctx, w, h, '#dbeafe', '#2563eb', 0.55, 0.6);
  caixaJogo(ctx, 1220, 660, 1.05, -0.05);
  bigType(ctx, 'DE QUEM É?', 70, 230, { size: 185, hl: '#1e3a8a' });
}

const THUMBS = {
  A: { draw: drawThumb10A, file: 'thumb-A-70.jpg' },
  B: { draw: drawThumb10B, file: 'thumb-B-recorde.jpg' },
  C: { draw: drawThumb10C, file: 'thumb-C-de-quem-e.jpg' },
};
