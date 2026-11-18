// Thumbnails do vídeo 10 (brinquedo, refeito do zero): rascunhos feitos ANTES do roteiro.
// Três ideias para o teste A/B: o 70% (dúvida), o imposto de importação não é o vilão (contraria o que todo mundo culpa), quem fica com cada real (a promessa).\n// Revisão de 16/11/2026: B e C não tratam mais a premissa do exemplo (R$ 20, 20/32/48) como fato.
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
// boneca pequena (cabeça grande, franja, marias-chiquinhas, vestido rodado)
function bonecaT(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const pele = '#f2c3a0', cab = '#7c3f1d';
  ctx.fillStyle = '#ec4899'; ctx.beginPath(); ctx.moveTo(-70, -10); ctx.lineTo(70, -10); ctx.lineTo(150, 170); ctx.quadraticCurveTo(0, 200, -150, 170); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(-56, -12); ctx.quadraticCurveTo(0, 30, 56, -12); ctx.closePath(); ctx.fill();
  circle(ctx, -128, -150, 46, cab); circle(ctx, 128, -150, 46, cab); circle(ctx, 0, -130, 100, cab); circle(ctx, 0, -112, 86, pele);
  ctx.fillStyle = cab; ctx.beginPath(); ctx.moveTo(-92, -130); ctx.quadraticCurveTo(-80, -232, 0, -230); ctx.quadraticCurveTo(80, -232, 92, -130); ctx.quadraticCurveTo(40, -170, 0, -150); ctx.quadraticCurveTo(-40, -172, -92, -130); ctx.closePath(); ctx.fill();
  for (const ex of [-32, 32]) { circle(ctx, ex, -112, 15, '#1f2937'); circle(ctx, ex + 5, -117, 5, '#ffffff'); }
  ctx.strokeStyle = '#9f1239'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, -84, 20, 0.25, Math.PI - 0.25); ctx.stroke();
  ctx.restore();
}
// caixa de presente aberta (papel vermelho, fita dourada, tampa inclinada) com a boneca saindo
function presenteAberto(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  bonecaT(ctx, 0, -230, 0.95);
  ctx.save(); sombra(ctx, 50, 24, 0.45); ctx.fillStyle = '#b91c1c'; ctx.fillRect(-300, -180, 600, 380); ctx.restore();
  ctx.fillStyle = '#facc15'; ctx.fillRect(-40, -180, 80, 380);
  ctx.save(); ctx.translate(250, -330); ctx.rotate(0.5); ctx.fillStyle = '#dc2626'; ctx.fillRect(-330, -40, 660, 80); ctx.fillStyle = '#facc15'; ctx.fillRect(-44, -40, 88, 80); ctx.restore();
  ctx.restore();
}
// etiqueta de preço pendurada
function etiquetaT(ctx, x, y, s, val, rot = 0.1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.save(); sombra(ctx, 30, 14, 0.45); ctx.fillStyle = '#fffbeb';
  ctx.beginPath(); ctx.moveTo(-60, -110); ctx.lineTo(60, -110); ctx.lineTo(220, -50); ctx.lineTo(220, 110); ctx.lineTo(-220, 110); ctx.lineTo(-220, -50); ctx.closePath(); ctx.fill(); ctx.restore();
  circle(ctx, 0, -76, 16, '#9ca3af'); text(ctx, val, 0, 30, { size: 100, weight: 900, color: '#111827' });
  ctx.restore();
}
// contêiner de navio com as portas abertas e a boneca dentro
function conteinerT(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.save(); sombra(ctx, 50, 24, 0.45); ctx.fillStyle = '#dc2626'; ctx.fillRect(-420, -220, 840, 440); ctx.restore();
  ctx.fillStyle = 'rgba(0,0,0,0.18)'; for (let i = -400; i < 420; i += 44) ctx.fillRect(i, -210, 16, 420);
  ctx.fillStyle = '#1f2937'; ctx.fillRect(-300, -180, 600, 360);
  bonecaT(ctx, 0, 40, 0.7);
  ctx.fillStyle = '#b91c1c'; ctx.beginPath(); ctx.moveTo(-300, -180); ctx.lineTo(-470, -230); ctx.lineTo(-470, 230); ctx.lineTo(-300, 180); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(300, -180); ctx.lineTo(470, -230); ctx.lineTo(470, 230); ctx.lineTo(300, 180); ctx.closePath(); ctx.fill();
  ctx.restore();
}
// etiqueta de R$ 100 rasgada em três pedaços de cores diferentes, sem valores (a divisão exata depende de cada boneca)
function etiquetaRasgada(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const pec = [[-470, 290, '#22c55e', -0.12], [-150, 300, '#f59e0b', 0.05], [190, 320, '#a855f7', 0.12]];
  for (const [px, w, cor, rot] of pec) {
    ctx.save(); ctx.translate(px + w / 2, 0); ctx.rotate(rot);
    ctx.save(); sombra(ctx, 30, 14, 0.45); ctx.fillStyle = '#fffbeb'; ctx.beginPath(); ctx.moveTo(-w / 2, -150);
    for (let i = 0; i <= 8; i++) ctx.lineTo(w / 2 + (i % 2 ? 14 : -6), -150 + i * 37.5); ctx.lineTo(-w / 2, 150); ctx.closePath(); ctx.fill(); ctx.restore();
    fillRR(ctx, -w / 2 + 24, -110, w - 48, 220, 14, cor);
    text(ctx, 'R$', 0, 0, { size: 110, weight: 900, color: 'rgba(255,255,255,0.9)' });
    ctx.restore();
  }
  ctx.restore();
}
// placa pequena do imposto de importação pendurada no contêiner (o "vilão" que é pequeno)
function placaImportacao(ctx, x, y, s, rot = 0.12) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-80, -110); ctx.lineTo(0, -40); ctx.lineTo(80, -110); ctx.stroke();
  ctx.save(); sombra(ctx, 30, 12, 0.5); fillRR(ctx, -200, -50, 400, 120, 16, '#7f1d1d'); ctx.restore();
  ctx.strokeStyle = '#fca5a5'; ctx.lineWidth = 6; rr(ctx, -200, -50, 400, 120, 16); ctx.stroke();
  text(ctx, 'IMPORTAÇÃO', 0, 12, { size: 56, weight: 900, color: '#ffffff' });
  ctx.restore();
}

// ---------------------------------------------------------------- as três ideias
// A (dúvida): o presente aberto com a boneca, a etiqueta R$ 100 e "70%?". Vermelho claro.
function drawThumb10A(ctx, w, h) {
  fundoCor(ctx, w, h, '#fee2e2', '#dc2626', 0.65, 0.5);
  presenteAberto(ctx, 1380, 720, 0.95);
  etiquetaT(ctx, 920, 820, 0.8, 'R$ 100', -0.12);
  bigType(ctx, '70%?', 80, 470, { size: 330, depth: 14, stroke: 18, hl: '#7f1d1d' });
}
// B (contraria o que todo mundo culpa): a boneca no contêiner com a plaquinha do imposto de importação e "VILÃO?". Azul claro.
function drawThumb10B(ctx, w, h) {
  fundoCor(ctx, w, h, '#dbeafe', '#2563eb', 0.6, 0.6);
  conteinerT(ctx, 1260, 690, 0.95);
  placaImportacao(ctx, 1500, 470, 0.85, 0.14);
  bigType(ctx, 'VILÃO?', 70, 300, { size: 250, hl: '#1e3a8a' });
}
// C (a promessa do canal): a etiqueta de R$ 100 rasgada em pedaços de cores, sem valores. Verde claro.
function drawThumb10C(ctx, w, h) {
  fundoCor(ctx, w, h, '#dcfce7', '#16a34a', 0.55, 0.62);
  etiquetaRasgada(ctx, 1000, 680, 1.25);
  bigType(ctx, 'QUEM FICA?', 70, 230, { size: 185, hl: '#14532d' });
}

const THUMBS = {
  A: { draw: drawThumb10A, file: 'thumb-A-70.jpg' },
  B: { draw: drawThumb10B, file: 'thumb-B-vilao.jpg' },
  C: { draw: drawThumb10C, file: 'thumb-C-quem-fica.jpg' },
};
