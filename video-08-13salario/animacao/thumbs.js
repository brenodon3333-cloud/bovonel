// Thumbnails do vídeo 08 (1920x1080): primeiros rascunhos, feitos ANTES do roteiro com as regras do
// estudo de embalagem (canal/estudo-embalagem.md): um objeto só, 2 a 4 palavras grandes, fundo claro com cor
// própria, nada no canto da duração. Três ideias diferentes para o teste A/B (benefício, custo escondido, história).
// Gerar: node tools/thumbs.mjs video-08-13salario   |   Ver no feed: tools/feed.mjs
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

// ---------------------------------------------------------------- objetos
// holerite do 13º em close: só a linha do imposto é grande; o resto é textura de documento
function holeriteGrande(ctx, x, y, s, rot) {
  const Wd = 1300, Hd = 760, L = -Wd / 2, T = -Hd / 2;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.save(); sombra(ctx, 60, 30, 0.45); ctx.fillStyle = '#fbfaf5'; ctx.fillRect(L, T, Wd, Hd); ctx.restore();
  ctx.fillStyle = '#e9e5d8'; ctx.fillRect(L, T, Wd, 92);
  text(ctx, 'RECIBO DE PAGAMENTO DE SALÁRIO', L + 40, T + 48, { size: 34, weight: 900, color: '#1f2937', align: 'left', letter: 2 });
  text(ctx, '13º SALÁRIO · 2026', -L - 40, T + 48, { size: 34, weight: 900, color: '#1e3a8a', align: 'right' });
  const linha = (lab, val, yy, cor = '#111827') => { text(ctx, lab, L + 50, yy, { size: 48, weight: 800, color: '#374151', align: 'left' }); text(ctx, val, -L - 50, yy, { size: 54, weight: 900, color: cor, align: 'right' }); ctx.fillStyle = 'rgba(17,24,39,0.12)'; ctx.fillRect(L + 40, yy + 46, Wd - 80, 3); };
  linha('13º SALÁRIO', '5.000,00', T + 170);
  linha('INSS', '501,51', T + 270);
  // a linha do imposto, com marca-texto verde
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = '#86efac'; ctx.fillRect(L + 24, T + 340, Wd - 48, 250); ctx.restore();
  text(ctx, 'IMPOSTO DE RENDA', L + 50, T + 400, { size: 60, weight: 900, color: '#14532d', align: 'left' });
  text(ctx, '0,00', -L - 40, T + 520, { size: 250, weight: 900, color: '#15803d', align: 'right' });
  ctx.fillStyle = 'rgba(17,24,39,0.12)'; ctx.fillRect(L + 40, T + 640, Wd - 80, 3);
  text(ctx, 'LÍQUIDO A RECEBER', L + 50, T + 700, { size: 40, weight: 800, color: '#6b7280', align: 'left' });
  ctx.restore();
}
// maço de notas de R$ 100 (azuis) com a cinta do banco; o terço de cima sai levantado
function macoNotas(ctx, x, y, s, lift) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const nota = (yy, alt, levant = 0, dx = 0, rot = 0, borda = null) => {
    ctx.save(); ctx.translate(dx, yy - levant); ctx.rotate(rot);
    // lateral (as bordas das notas empilhadas)
    ctx.save(); sombra(ctx, 40, 18, 0.4); ctx.fillStyle = '#9fb7c9';
    ctx.beginPath(); ctx.moveTo(-430, 0); ctx.lineTo(430, 0); ctx.lineTo(430, alt); ctx.lineTo(-430, alt); ctx.closePath(); ctx.fill(); ctx.restore();
    const r = trng(alt); for (let k = 4; k < alt; k += 6) { ctx.fillStyle = r() > 0.5 ? '#d7e3ec' : '#7f9db3'; ctx.fillRect(-430, k, 860, 2); }
    // face de cima (a nota de cima, em perspectiva)
    ctx.beginPath(); ctx.moveTo(-430, 0); ctx.lineTo(430, 0); ctx.lineTo(370, -210); ctx.lineTo(-370, -210); ctx.closePath();
    const g = ctx.createLinearGradient(0, -210, 0, 0); g.addColorStop(0, '#9bd3e6'); g.addColorStop(1, '#4f9fc0'); ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = '#dff3fa'; ctx.lineWidth = 6; ctx.stroke();
    ctx.save(); ctx.transform(1, 0, -0.28, 1, 0, 0);
    ctx.globalAlpha = 0.6; circle(ctx, -170, -105, 62, '#e6f6fb'); ctx.globalAlpha = 1;
    text(ctx, '100', 230, -100, { size: 120, weight: 900, color: '#0c4a6e' });
    text(ctx, 'REAIS', 40, -100, { size: 40, weight: 900, color: '#075985', letter: 4 });
    ctx.restore();
    if (borda) { ctx.save(); ctx.strokeStyle = borda; ctx.lineWidth = 12; ctx.setLineDash([30, 18]); ctx.beginPath(); ctx.moveTo(-450, alt + 14); ctx.lineTo(450, alt + 14); ctx.lineTo(450, -20); ctx.lineTo(390, -228); ctx.lineTo(-390, -228); ctx.lineTo(-450, -20); ctx.closePath(); ctx.stroke(); ctx.restore(); }
    ctx.restore();
  };
  nota(0, 220); // o que fica com você
  // a cinta do banco em volta do maço
  ctx.fillStyle = '#fde68a'; ctx.fillRect(-120, 0, 240, 220); ctx.fillStyle = 'rgba(146,64,14,0.35)'; ctx.fillRect(-120, 0, 6, 220); ctx.fillRect(114, 0, 6, 220);
  text(ctx, 'R$', 0, 112, { size: 64, weight: 900, color: '#92400e' });
  nota(-20, 150, 180 * lift, 120 * lift, 0.07 * lift, '#ef4444'); // o terço que sai levantado
  ctx.restore();
}
// página de jornal de 1962 (sem marca de jornal de verdade): manchete gigante, colunas de texto como textura
function jornal1962(ctx, x, y, s, rot) {
  const Wd = 1180, Hd = 900, L = -Wd / 2, T = -Hd / 2;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.save(); sombra(ctx, 60, 30, 0.5); const g = ctx.createLinearGradient(L, T, -L, -T); g.addColorStop(0, '#f3e9cf'); g.addColorStop(1, '#e2d3ad'); ctx.fillStyle = g; ctx.fillRect(L, T, Wd, Hd); ctx.restore();
  ctx.fillStyle = 'rgba(120,90,30,0.10)'; ctx.fillRect(L, T, 26, Hd); ctx.fillRect(-L - 26, T, 26, Hd); // borda amarelada
  text(ctx, 'DIÁRIO DA MANHÃ', 0, T + 80, { size: 80, weight: 900, color: '#1c1917', letter: 4 });
  ctx.fillStyle = '#1c1917'; ctx.fillRect(L + 40, T + 132, Wd - 80, 5); ctx.fillRect(L + 40, T + 186, Wd - 80, 2);
  text(ctx, 'QUINTA-FEIRA, 26 DE ABRIL DE 1962', 0, T + 160, { size: 30, weight: 800, color: '#44403c', letter: 2 });
  text(ctx, 'CONSIDERADO', 0, T + 260, { size: 84, weight: 900, color: '#1c1917', letter: 3 });
  text(ctx, 'DESASTROSO', 0, T + 420, { size: 176, weight: 900, color: '#0c0a09' });
  text(ctx, 'PARA O PAÍS UM 13º MÊS DE SALÁRIO', 0, T + 550, { size: 56, weight: 900, color: '#1c1917' });
  const r = trng(62); ctx.fillStyle = 'rgba(28,25,23,0.45)';
  for (let c = 0; c < 3; c++) for (let i = 0; i < 9; i++) ctx.fillRect(L + 60 + c * 360, T + 620 + i * 28, i === 8 ? 140 : 300 - r() * 40, 11);
  ctx.restore();
}
// carimbo do ano
function carimboAno(ctx, x, y, s, str, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.strokeStyle = '#b91c1c'; ctx.lineWidth = 16; ctx.strokeRect(-230, -110, 460, 220); ctx.lineWidth = 5; ctx.strokeRect(-206, -86, 412, 172);
  text(ctx, str, 0, 8, { size: 150, weight: 900, color: '#b91c1c' });
  ctx.restore();
}

// ---------------------------------------------------------------- as três ideias
// A (benefício): o holerite com a linha do imposto zerada. Verde.
function drawThumb8A(ctx, w, h) {
  fundoCor(ctx, w, h, '#bbf7d0', '#16a34a', 0.55, 0.6);
  holeriteGrande(ctx, 900, 670, 1.0, -0.035);
  bigType(ctx, 'PELA 1ª VEZ', 70, 210, { size: 175, hl: '#14532d' });
}
// B (custo escondido): o maço de notas com o terço de cima saindo. Âmbar.
function drawThumb8B(ctx, w, h) {
  fundoCor(ctx, w, h, '#fde68a', '#d97706', 0.5, 0.6);
  macoNotas(ctx, 980, 700, 1.1, 1);
  bigType(ctx, 'QUEM FICA?', 70, 210, { size: 185, hl: '#1e3a8a' });
}
// C (história): a manchete de 1962. Vermelho.
function drawThumb8C(ctx, w, h) {
  fundoCor(ctx, w, h, '#fca5a5', '#b91c1c', 0.45, 0.55);
  jornal1962(ctx, 820, 560, 1.0, -0.05);
  carimboAno(ctx, 1600, 230, 1.0, '1962', 0.12);
}

const THUMBS = {
  A: { draw: drawThumb8A, file: 'thumb-A-pela-1a-vez.jpg' },
  B: { draw: drawThumb8B, file: 'thumb-B-quem-fica.jpg' },
  C: { draw: drawThumb8C, file: 'thumb-C-1962.jpg' },
};
