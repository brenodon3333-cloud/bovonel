// Thumbnails do vídeo 10 (brinquedo de Natal): rascunhos feitos ANTES do roteiro (estudo de embalagem).
// Três ideias diferentes para o teste A/B: o "70%?" (dúvida), o menor imposto é o de importação (descoberta), a compra de fora sem imposto de importação (novidade).
// Gerar: node tools/thumbs.mjs video-10-brinquedo   |   Ver no feed: tools/feed.mjs
function trng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function fundoCor(ctx, w, h, c0, c1, cx = 0.45, cy = 0.45) {
  const g = ctx.createRadialGradient(w * cx, h * cy, 0, w * cx, h * cy, w * 0.8);
  g.addColorStop(0, c0); g.addColorStop(1, c1); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  ctx.save(); ctx.globalAlpha = 0.06; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3;
  for (let x = -h; x < w; x += 46) { ctx.beginPath(); ctx.moveTo(x, h); ctx.lineTo(x + h, 0); ctx.stroke(); }
  ctx.restore();
}
function sombra(ctx, blur = 50, dy = 24, a = 0.45) { ctx.shadowColor = `rgba(0,0,0,${a})`; ctx.shadowBlur = blur; ctx.shadowOffsetY = dy; }
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

// ---------------------------------------------------------------- objetos
// boneca de frente: cabelo com franja e duas marias-chiquinhas, rosto, vestido rodado, braços e pernas curtos (proporção de brinquedo, cabeça grande)
function boneca(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const pele = '#f2c3a0', cabelo = '#7c3f1d';
  // pernas e sapatos
  fillRR(ctx, -46, 150, 34, 120, 14, pele); fillRR(ctx, 12, 150, 34, 120, 14, pele);
  fillRR(ctx, -56, 252, 52, 30, 14, '#b91c1c'); fillRR(ctx, 4, 252, 52, 30, 14, '#b91c1c');
  // braços
  ctx.save(); ctx.translate(-92, 10); ctx.rotate(0.35); fillRR(ctx, -18, 0, 36, 140, 18, pele); ctx.restore();
  ctx.save(); ctx.translate(92, 10); ctx.rotate(-0.35); fillRR(ctx, -18, 0, 36, 140, 18, pele); ctx.restore();
  // vestido rodado com gola branca e bolinhas
  ctx.fillStyle = '#ec4899'; ctx.beginPath(); ctx.moveTo(-70, -10); ctx.lineTo(70, -10); ctx.lineTo(150, 170); ctx.quadraticCurveTo(0, 200, -150, 170); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.55)'; for (const [bx, by] of [[-60, 60], [0, 40], [60, 70], [-90, 140], [-20, 120], [50, 140], [100, 130]]) circle(ctx, bx, by, 9, 'rgba(255,255,255,0.55)');
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(-56, -12); ctx.quadraticCurveTo(0, 30, 56, -12); ctx.lineTo(40, -22); ctx.lineTo(-40, -22); ctx.closePath(); ctx.fill();
  // marias-chiquinhas (atrás da cabeça)
  circle(ctx, -128, -150, 46, cabelo); circle(ctx, 128, -150, 46, cabelo);
  fillRR(ctx, -104, -168, 30, 34, 10, '#facc15'); fillRR(ctx, 74, -168, 30, 34, 10, '#facc15');
  // cabeça e cabelo
  circle(ctx, 0, -130, 100, cabelo);
  circle(ctx, 0, -112, 86, pele);
  ctx.fillStyle = cabelo; ctx.beginPath(); ctx.moveTo(-92, -130); ctx.quadraticCurveTo(-80, -232, 0, -230); ctx.quadraticCurveTo(80, -232, 92, -130); ctx.quadraticCurveTo(40, -170, 0, -150); ctx.quadraticCurveTo(-40, -172, -92, -130); ctx.closePath(); ctx.fill();
  // rosto: olhos grandes com brilho, bochechas, sorriso
  for (const ex of [-32, 32]) { circle(ctx, ex, -112, 15, '#1f2937'); circle(ctx, ex + 5, -117, 5, '#ffffff'); }
  circle(ctx, -54, -82, 13, 'rgba(244,114,182,0.45)'); circle(ctx, 54, -82, 13, 'rgba(244,114,182,0.45)');
  ctx.strokeStyle = '#9f1239'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, -84, 20, 0.25, Math.PI - 0.25); ctx.stroke();
  ctx.restore();
}
// caixa de brinquedo de loja: frente com janela de plástico, faixa do nome, berço de papelão, lateral em perspectiva, selo de certificação, faixa etária e código de barras
function caixaBrinquedo(ctx, x, y, s, o = {}) {
  const W2 = 560, H2 = 760, D = 120;
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s, s);
  const L = -W2 / 2, T = -H2 / 2;
  // lateral (perspectiva) e tampa
  ctx.save(); sombra(ctx, 60, 30, 0.45);
  ctx.fillStyle = '#9d174d'; ctx.beginPath(); ctx.moveTo(-L, T); ctx.lineTo(-L + D, T - D * 0.5); ctx.lineTo(-L + D, -T - D * 0.5); ctx.lineTo(-L, -T); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#f9a8d4'; ctx.beginPath(); ctx.moveTo(L, T); ctx.lineTo(L + D, T - D * 0.5); ctx.lineTo(-L + D, T - D * 0.5); ctx.lineTo(-L, T); ctx.closePath(); ctx.fill();
  // frente
  const g = ctx.createLinearGradient(L, T, -L, -T); g.addColorStop(0, '#f472b6'); g.addColorStop(1, '#db2777'); ctx.fillStyle = g; ctx.fillRect(L, T, W2, H2);
  ctx.restore();
  // a aba de pendurar (furo em forma de gota)
  ctx.fillStyle = '#db2777'; rr(ctx, -110, T - 70, 220, 80, 20); ctx.fill(); ctx.fillStyle = '#1f2937'; rr(ctx, -40, T - 50, 80, 26, 13); ctx.fill();
  // faixa do nome
  fillRR(ctx, L + 30, T + 30, W2 - 60, 110, 18, '#fde047');
  text(ctx, 'BONECA QUE FALA', 0, T + 86, { size: 48, weight: 900, color: '#9d174d', letter: 2 });
  // janela: berço de papelão, a boneca e o plástico com reflexo
  const wx = L + 50, wy = T + 170, ww = W2 - 100, wh = 450;
  fillRR(ctx, wx, wy, ww, wh, 26, '#fdf2f8');
  ctx.save(); rr(ctx, wx, wy, ww, wh, 26); ctx.clip();
  ctx.fillStyle = '#fbcfe8'; for (let i = 0; i < 8; i++) ctx.fillRect(wx, wy + i * 60, ww, 26);
  boneca(ctx, 0, wy + 250, 0.78);
  ctx.fillStyle = 'rgba(255,255,255,0.10)'; ctx.fillRect(wx, wy, ww, wh);
  ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.beginPath(); ctx.moveTo(wx + 40, wy); ctx.lineTo(wx + 140, wy); ctx.lineTo(wx + 40, wy + wh); ctx.lineTo(wx - 60, wy + wh); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.moveTo(wx + 180, wy); ctx.lineTo(wx + 220, wy); ctx.lineTo(wx + 120, wy + wh); ctx.lineTo(wx + 80, wy + wh); ctx.closePath(); ctx.fill();
  ctx.restore();
  strokeRR(ctx, wx, wy, ww, wh, 26, '#9d174d', 8);
  // rodapé: faixa etária, selo de certificação, código de barras
  fillRR(ctx, L + 40, -T - 120, 120, 90, 14, '#ffffff'); text(ctx, '3+', L + 100, -T - 70, { size: 54, weight: 900, color: '#1f2937' });
  circle(ctx, L + 230, -T - 75, 44, '#ffffff'); ctx.strokeStyle = '#1d4ed8'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(L + 230, -T - 75, 34, 0, 6.283); ctx.stroke();
  text(ctx, 'SELO', L + 230, -T - 80, { size: 18, weight: 900, color: '#1d4ed8' }); text(ctx, 'SEGURANÇA', L + 230, -T - 62, { size: 11, weight: 900, color: '#1d4ed8' });
  fillRR(ctx, -L - 240, -T - 125, 200, 100, 8, '#ffffff');
  const r = trng(5); let xx = -L - 228; ctx.fillStyle = '#111827'; while (xx < -L - 52) { const bw = 2 + Math.floor(r() * 4); ctx.fillRect(xx, -T - 115, bw, 70); xx += bw + 2 + Math.floor(r() * 3); }
  ctx.restore();
}
// etiqueta de preço de loja, pendurada por um barbante
function etiquetaPreco(ctx, x, y, s, val, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? 0.1); ctx.scale(s, s);
  ctx.save(); sombra(ctx, 30, 14, 0.45); ctx.fillStyle = '#fffbeb';
  ctx.beginPath(); ctx.moveTo(-60, -110); ctx.lineTo(60, -110); ctx.lineTo(220, -50); ctx.lineTo(220, 110); ctx.lineTo(-220, 110); ctx.lineTo(-220, -50); ctx.closePath(); ctx.fill(); ctx.restore();
  circle(ctx, 0, -76, 16, '#9ca3af');
  text(ctx, val, 0, 40, { size: 108, weight: 900, color: '#111827' });
  ctx.restore();
}
// etiqueta grande dividida em fatias (quem fica com cada real): a fatia do imposto de importação é a menor
function etiquetaFatias(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.04); ctx.scale(s, s);
  const Wd = 1180, Hd = 560, L = -Wd / 2, T = -Hd / 2;
  ctx.save(); sombra(ctx, 60, 30, 0.45); ctx.fillStyle = '#fffbeb';
  ctx.beginPath(); ctx.moveTo(L + 160, T); ctx.lineTo(-L, T); ctx.lineTo(-L, -T); ctx.lineTo(L + 160, -T); ctx.lineTo(L, 0); ctx.closePath(); ctx.fill(); ctx.restore();
  circle(ctx, L + 110, 0, 30, '#9ca3af');
  text(ctx, 'R$ 100', L + 230, T + 110, { size: 110, weight: 900, color: '#111827', align: 'left' });
  // a barra: o resto (67), ICMS (18), PIS e Cofins (8), IPI (3) e imposto de importação (4)
  const bx = L + 220, bw = Wd - 280, by = T + 200, bh = 230;
  const fat = [[0.67, '#94a3b8'], [0.18, '#f59e0b'], [0.08, '#22c55e'], [0.03, '#38bdf8'], [0.04, '#ef4444']];
  let cx = bx; for (const [v, cor] of fat) { ctx.fillStyle = cor; ctx.fillRect(cx, by, bw * v - 6, bh); cx += bw * v; }
  ctx.restore();
  // círculo de caneta na fatia vermelha (desenhado fora da rotação para ficar livre)
}
// pacote de encomenda internacional: envelope plástico cinza com fecho, etiqueta de remessa e código de barras, a caixa do brinquedo aparecendo pela boca rasgada
function pacoteEncomenda(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.06); ctx.scale(s, s);
  const Wd = 900, Hd = 700, L = -Wd / 2, T = -Hd / 2;
  // a caixa do brinquedo saindo pela boca
  caixaBrinquedo(ctx, 60, T + 20, 0.74, { rot: 0.08 });
  ctx.save(); sombra(ctx, 60, 30, 0.45);
  const g = ctx.createLinearGradient(L, T, -L, -T); g.addColorStop(0, '#d1d5db'); g.addColorStop(1, '#9ca3af'); ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(L, T + 40); for (let i = 0; i <= 12; i++) ctx.lineTo(L + i * (Wd / 12), T + 40 + (i % 2 ? -26 : 18)); ctx.lineTo(-L, -T); ctx.lineTo(L, -T); ctx.closePath(); ctx.fill();
  ctx.restore();
  // vincos do plástico
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 6; for (const [a, b, c2, d] of [[L + 60, T + 140, L + 260, T + 420], [-L - 80, T + 160, -L - 220, T + 480], [L + 120, -T - 60, L + 420, -T - 120]]) { ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(c2, d); ctx.stroke(); }
  // etiqueta de remessa
  ctx.save(); ctx.translate(-40, 120); ctx.rotate(0.03);
  ctx.save(); sombra(ctx, 16, 6, 0.3); fillRR(ctx, -320, -180, 640, 360, 10, '#ffffff'); ctx.restore();
  fillRR(ctx, -320, -180, 640, 70, 10, '#111827'); text(ctx, 'REMESSA INTERNACIONAL', 0, -142, { size: 34, weight: 900, color: '#ffffff', letter: 2 });
  text(ctx, 'VALOR: US$ 20', -290, -60, { size: 40, weight: 900, color: '#111827', align: 'left' });
  text(ctx, 'DESTINO: BRASIL', -290, -10, { size: 30, weight: 800, color: '#374151', align: 'left' });
  const r = trng(11); let xx = -290; ctx.fillStyle = '#111827'; while (xx < 290) { const bw = 3 + Math.floor(r() * 6); ctx.fillRect(xx, 30, bw, 120); xx += bw + 3 + Math.floor(r() * 4); }
  ctx.restore();
  ctx.restore();
}

// ---------------------------------------------------------------- as três ideias
// A (dúvida): a caixa da boneca com a etiqueta de R$ 100 e "70%?" grande. Vermelho de Natal claro.
function drawThumb10A(ctx, w, h) {
  fundoCor(ctx, w, h, '#fee2e2', '#dc2626', 0.62, 0.5);
  caixaBrinquedo(ctx, 1390, 600, 0.98, { rot: 0.05 });
  etiquetaPreco(ctx, 1000, 760, 0.95, 'R$ 100', { rot: -0.12 });
  bigType(ctx, '70%?', 80, 470, { size: 330, depth: 14, stroke: 18, hl: '#7f1d1d' });
}
// B (descoberta): a etiqueta dividida em fatias, com a menor (imposto de importação) circulada. Verde claro.
function drawThumb10B(ctx, w, h) {
  fundoCor(ctx, w, h, '#dcfce7', '#16a34a', 0.5, 0.6);
  etiquetaFatias(ctx, 930, 650, 1.32);
  ctx.save(); ctx.strokeStyle = '#facc15'; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.beginPath(); ctx.ellipse(1640, 705, 105, 215, -0.04, 0.2, 6.2); ctx.stroke(); ctx.restore();
  bigType(ctx, 'SÓ R$ 4?', 70, 230, { size: 200, hl: '#14532d' });
}
// C (novidade): o pacote de encomenda internacional com a caixa da boneca saindo. Âmbar claro.
function drawThumb10C(ctx, w, h) {
  fundoCor(ctx, w, h, '#fef3c7', '#d97706', 0.62, 0.55);
  pacoteEncomenda(ctx, 1300, 720, 0.86);
  bigType(ctx, 'IMPOSTO', 70, 260, { size: 170, hl: '#78350f' });
  bigType(ctx, '0?', 90, 560, { size: 300, depth: 14, stroke: 18 });
}

const THUMBS = {
  A: { draw: drawThumb10A, file: 'thumb-A-70.jpg' },
  B: { draw: drawThumb10B, file: 'thumb-B-so-4.jpg' },
  C: { draw: drawThumb10C, file: 'thumb-C-encomenda.jpg' },
};
