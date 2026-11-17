// Thumbnails do vídeo 09 (IPVA 2027): rascunhos feitos ANTES do roteiro (estudo de embalagem).
// Três ideias diferentes para o teste A/B: a divisão (curiosidade), o mesmo carro em dois estados (contraste), o buraco da rua (pergunta).
// Gerar: node tools/thumbs.mjs video-09-ipva   |   Ver no feed: tools/feed.mjs
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
// guia do IPVA 2027 em close: a faixa de quem fica com o dinheiro ocupa o meio (estado 40, prefeitura 40, escola 20)
function guiaGrande(ctx, x, y, s, rot) {
  const Wd = 1340, Hd = 640, L = -Wd / 2, T = -Hd / 2;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.save(); sombra(ctx, 60, 30, 0.45); ctx.fillStyle = '#ffffff'; ctx.fillRect(L, T, Wd, Hd); ctx.restore();
  ctx.strokeStyle = '#1f2937'; ctx.lineWidth = 4; ctx.strokeRect(L + 26, T + 26, Wd - 52, Hd - 52);
  text(ctx, 'IPVA 2027 · GUIA DE PAGAMENTO', L + 60, T + 84, { size: 46, weight: 900, color: '#1f2937', align: 'left' });
  text(ctx, 'VALOR', -L - 60, T + 70, { size: 26, weight: 900, color: '#6b7280', align: 'right' });
  text(ctx, 'R$ 3.240,00', -L - 60, T + 112, { size: 48, weight: 900, color: '#111827', align: 'right' });
  const bx = L + 60, bw = Wd - 120, by = T + 170, bh = 230;
  const fat = [[0.4, '#f59e0b'], [0.4, '#a855f7'], [0.2, '#38bdf8']];
  let cx = bx;
  for (const [v, cor] of fat) { ctx.fillStyle = cor; ctx.fillRect(cx, by, bw * v - 8, bh); cx += bw * v; }
  // os números ficam dentro de cada fatia (lê a 168 px)
  cx = bx; for (const [v] of fat) { bigType(ctx, String(Math.round(v * 100)), cx + (bw * v - 8) / 2, by + bh / 2 + 76, { size: v < 0.3 ? 190 : 230, align: 'center', depth: 8, stroke: 16 }); cx += bw * v; }
  const r = trng(27); let xx = L + 60; ctx.fillStyle = '#111827';
  while (xx < -L - 60) { const w = 2 + Math.floor(r() * 5); ctx.fillRect(xx, T + 450, w, 120); xx += w + 2 + Math.floor(r() * 3); }
  ctx.restore();
}
// chave de carro grande com duas etiquetas de preço amarradas na argola
function chaveEtiquetas(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // etiquetas penduradas (barbante saindo da argola)
  const tag = (tx, ty, rot, uf, val, cor) => {
    ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-330, -40); ctx.quadraticCurveTo(tx - 80, ty - 120, tx, ty - 120); ctx.stroke();
    ctx.save(); ctx.translate(tx, ty); ctx.rotate(rot);
    ctx.save(); sombra(ctx, 30, 14, 0.4); ctx.fillStyle = '#fffbeb';
    ctx.beginPath(); ctx.moveTo(-60, -120); ctx.lineTo(60, -120); ctx.lineTo(240, -60); ctx.lineTo(240, 110); ctx.lineTo(-240, 110); ctx.lineTo(-240, -60); ctx.closePath(); ctx.fill(); ctx.restore();
    circle(ctx, 0, -86, 16, '#9ca3af');
    text(ctx, uf, 0, -20, { size: 64, weight: 900, color: '#1f2937', letter: 4 });
    text(ctx, val, 0, 64, { size: 92, weight: 900, color: cor });
    ctx.restore();
  };
  tag(-380, 290, -0.1, 'SP', 'R$ 3.240', '#dc2626');
  tag(170, 300, 0.08, 'PR', 'R$ 1.539', '#15803d');
  // a chave: argola, cabeça preta com botões e a lâmina recortada
  ctx.strokeStyle = '#d1d5db'; ctx.lineWidth = 20; ctx.beginPath(); ctx.arc(-330, -90, 70, 0, 6.283); ctx.stroke();
  ctx.save(); sombra(ctx, 40, 20, 0.5); ctx.fillStyle = '#111827'; rr(ctx, -270, -200, 300, 220, 80); ctx.fill(); ctx.restore();
  circle(ctx, -160, -130, 28, '#374151'); circle(ctx, -160, -50, 28, '#374151'); circle(ctx, -70, -90, 28, '#7f1d1d');
  const g = ctx.createLinearGradient(0, -130, 0, -50); g.addColorStop(0, '#f3f4f6'); g.addColorStop(1, '#9ca3af'); ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(30, -130); ctx.lineTo(470, -130); ctx.lineTo(510, -90); ctx.lineTo(470, -50); ctx.lineTo(30, -50); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#6b7280'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(70, -90); for (let i = 0; i < 9; i++) ctx.lineTo(110 + i * 40, i % 2 ? -106 : -74); ctx.stroke();
  ctx.restore();
}
// buraco no asfalto, visto de cima e um pouco de lado, com o cone de trânsito dentro e a guia do IPVA caída na borda
function buracoCone(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // faixa amarela da pista
  ctx.fillStyle = '#facc15'; ctx.save(); ctx.rotate(-0.08); ctx.fillRect(-900, 320, 700, 34); ctx.fillRect(300, 320, 700, 34); ctx.restore();
  // o buraco: borda irregular, fundo escuro, rachaduras
  const r = trng(9), pts = [];
  for (let i = 0; i < 28; i++) { const a = (i / 28) * 6.283, rad = 1 + (r() - 0.5) * 0.28; pts.push([Math.cos(a) * 520 * rad, Math.sin(a) * 230 * rad]); }
  ctx.fillStyle = '#5b5b5b'; ctx.beginPath(); pts.forEach(([px, py], i) => (i ? ctx.lineTo(px * 1.08, py * 1.12 + 6) : ctx.moveTo(px * 1.08, py * 1.12 + 6))); ctx.closePath(); ctx.fill();
  const gh = ctx.createRadialGradient(0, 40, 40, 0, 0, 520); gh.addColorStop(0, '#0b0b0b'); gh.addColorStop(1, '#2b2b2b');
  ctx.fillStyle = gh; ctx.beginPath(); pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#3f3f3f'; for (let i = 0; i < 40; i++) { ctx.beginPath(); ctx.arc((r() - 0.5) * 760, 40 + (r() - 0.3) * 260, 6 + r() * 16, 0, 6.283); ctx.fill(); }
  ctx.strokeStyle = '#262626'; ctx.lineWidth = 6; for (const [ax, ay] of [[-560, -60], [540, 40], [-200, 240], [300, -230]]) { ctx.beginPath(); ctx.moveTo(ax * 0.9, ay * 0.9); ctx.lineTo(ax * 1.25, ay * 1.25 + 30); ctx.lineTo(ax * 1.45, ay * 1.45 - 20); ctx.stroke(); }
  // a guia do IPVA caída na borda do buraco
  ctx.save(); ctx.translate(-380, 210); ctx.rotate(-0.22); sombra(ctx, 20, 10, 0.5); ctx.fillStyle = '#ffffff'; ctx.fillRect(-170, -90, 340, 180); ctx.restore();
  ctx.save(); ctx.translate(-380, 210); ctx.rotate(-0.22);
  text(ctx, 'IPVA 2027', -140, -50, { size: 40, weight: 900, color: '#1f2937', align: 'left' }); ctx.fillStyle = '#a855f7'; ctx.fillRect(-140, -10, 140, 34); ctx.fillStyle = '#f59e0b'; ctx.fillRect(0, -10, 140, 34);
  ctx.fillStyle = '#111827'; for (let i = 0; i < 40; i++) ctx.fillRect(-140 + i * 7, 40, i % 3 ? 3 : 5, 36);
  ctx.restore();
  // o cone: base quadrada preta, corpo laranja afunilado com duas faixas brancas refletivas
  ctx.save(); ctx.translate(200, 90); ctx.scale(0.9, 0.9);
  ctx.save(); sombra(ctx, 30, 18, 0.55); ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.moveTo(-230, 130); ctx.lineTo(230, 130); ctx.lineTo(200, 175); ctx.lineTo(-200, 175); ctx.closePath(); ctx.fill(); ctx.restore();
  const gc = ctx.createLinearGradient(-150, 0, 150, 0); gc.addColorStop(0, '#c2410c'); gc.addColorStop(0.45, '#fb923c'); gc.addColorStop(1, '#9a3412');
  ctx.fillStyle = gc; ctx.beginPath(); ctx.moveTo(-34, -500); ctx.lineTo(34, -500); ctx.lineTo(160, 130); ctx.lineTo(-160, 130); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#f8fafc'; for (const [y0, y1] of [[-330, -250], [-130, -40]]) { const w0 = 34 + (y0 + 500) / 630 * 126, w1 = 34 + (y1 + 500) / 630 * 126; ctx.beginPath(); ctx.moveTo(-w0, y0); ctx.lineTo(w0, y0); ctx.lineTo(w1, y1); ctx.lineTo(-w1, y1); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = '#9a3412'; ctx.beginPath(); ctx.ellipse(0, -500, 34, 10, 0, 0, 6.283); ctx.fill();
  ctx.restore();
  ctx.restore();
}
// asfalto com textura (fundo da thumb C)
function asfalto(ctx, w, h) {
  const g = ctx.createRadialGradient(w * 0.5, h * 0.55, 0, w * 0.5, h * 0.55, w * 0.75); g.addColorStop(0, '#9ca3af'); g.addColorStop(1, '#6b7280');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  const r = trng(3); for (let i = 0; i < 2600; i++) { ctx.fillStyle = r() > 0.5 ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.14)'; ctx.fillRect(r() * w, r() * h, 2 + r() * 3, 2 + r() * 3); }
}

// ---------------------------------------------------------------- as três ideias
// A (curiosidade): a guia com a faixa 40 · 40 · 20. Roxo claro (a cor da prefeitura).
function drawThumb9A(ctx, w, h) {
  fundoCor(ctx, w, h, '#ede9fe', '#8b5cf6', 0.55, 0.55);
  guiaGrande(ctx, 900, 520, 1.24, -0.03);
}
// B (contraste): a chave do carro com as etiquetas SP x PR. Azul claro.
function drawThumb9B(ctx, w, h) {
  fundoCor(ctx, w, h, '#e0f2fe', '#0284c7', 0.5, 0.55);
  chaveEtiquetas(ctx, 1000, 520, 1.12);
  bigType(ctx, 'MESMO CARRO', 70, 210, { size: 175, hl: '#0c4a6e' });
}
// C (pergunta): o buraco com o cone e a guia caída. Laranja no texto, asfalto claro.
function drawThumb9C(ctx, w, h) {
  asfalto(ctx, w, h);
  buracoCone(ctx, 1080, 680, 1.0);
  bigType(ctx, 'E O BURACO?', 70, 210, { size: 175, hl: '#c2410c' });
}

const THUMBS = {
  A: { draw: drawThumb9A, file: 'thumb-A-40-40-20.jpg' },
  B: { draw: drawThumb9B, file: 'thumb-B-mesmo-carro.jpg' },
  C: { draw: drawThumb9C, file: 'thumb-C-buraco.jpg' },
};
