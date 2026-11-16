// Thumbnails do vídeo 04 (1920x1080). Usam os mesmos desenhos do vídeo (etiqueta, bandeja, cartaz de cortes, navio, prato).
// Gerar: node tools/thumbs.mjs video-04-carne
// Regras: objeto real em destaque, uma palavra forte, texto com profundidade, nada do nome do canal.

function tbBg(ctx, w, h, spots) {
  const g = ctx.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#060a15'); g.addColorStop(1, '#101a34');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  for (const [x, y, r, col, a] of spots) { const rg = ctx.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, hexA(col, a)); rg.addColorStop(1, hexA(col, 0)); ctx.fillStyle = rg; ctx.fillRect(0, 0, w, h); }
}
function tbVig(ctx, w, h, a = 0.55) {
  const v = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,0,${a})`); ctx.fillStyle = v; ctx.fillRect(0, 0, w, h);
}
function tbGrain(ctx, w, h, seed = 9, n = 14000, a = 0.03) { const r = rng(seed); for (let i = 0; i < n; i++) { ctx.fillStyle = `rgba(255,255,255,${r() * a})`; ctx.fillRect(r() * w, r() * h, 2, 2); } }
// Texto de thumb com profundidade: marca-texto opcional, extrusão escura, contorno e degradê.
function bigType(ctx, str, x, y, o = {}) {
  const { size = 160, color = '#fff', color2 = null, align = 'left', depth = 9, stroke = 12, hl = null, rot = 0, letter = 0 } = o;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.font = font(size, 900); ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  if (letter) ctx.letterSpacing = `${letter}px`;
  const w = ctx.measureText(str).width;
  const x0 = align === 'left' ? 0 : align === 'center' ? -w / 2 : -w;
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
// balcão de inox visto de frente (vidro + tampo)
function balcaoInox(ctx, w, y) {
  const g = ctx.createLinearGradient(0, y, 0, y + 60); g.addColorStop(0, '#e5e7eb'); g.addColorStop(0.4, '#9ca3af'); g.addColorStop(1, '#4b5563');
  ctx.fillStyle = g; ctx.fillRect(0, y, w, 60);
  const f = ctx.createLinearGradient(0, y + 60, 0, 1080); f.addColorStop(0, '#1f2937'); f.addColorStop(1, '#0b1020');
  ctx.fillStyle = f; ctx.fillRect(0, y + 60, w, 1080 - y - 60);
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(0, y + 4, w, 3);
}

// A: a etiqueta da balança com o preço recorde, numa bandeja de carne no balcão
function drawThumb4A(ctx, w, h) {
  tbBg(ctx, w, h, [[w * 0.68, h * 0.42, 900, '#ef4444', 0.28], [w * 0.15, h * 0.2, 700, '#1d4ed8', 0.3]]);
  azulejos(ctx, 0, 0, w, 820, 0.55);
  balcaoInox(ctx, w, 820);
  // luz de vitrine
  const lg = ctx.createRadialGradient(1300, 520, 40, 1300, 520, 760); lg.addColorStop(0, 'rgba(255,240,220,0.22)'); lg.addColorStop(1, 'rgba(255,240,220,0)');
  ctx.fillStyle = lg; ctx.fillRect(0, 0, w, h);
  // bandeja com contrafilé, inclinada, com a etiqueta enorme por cima
  bandeja(ctx, 1290, 700, 2.05, 'bife', { rot: -0.07 });
  etiqueta(ctx, 1380, 470, 1.55, {
    t: 'CONTRAFILÉ', tSize: 40, sub: 'BOVINO RESFRIADO', rows: [['PESO (kg)', '1,062'], ['R$ / kg', '69,90']],
    total: ['TOTAL R$', '74,23'], totalSize: 46, code: 44, codeTxt: '2 00417 5 07423 1', date: '14/11/26 10:42',
  }, { rot: 0.06 });
  tbGrain(ctx, w, h, 4);
  tbVig(ctx, w, h, 0.55);
  bigType(ctx, 'PREÇO', 70, 330, { size: 130, color: '#ffffff', color2: '#e2e8f0' });
  bigType(ctx, 'RECORDE', 70, 520, { size: 175, color: '#fff7c2', color2: '#facc15', hl: '#b91c1c' });
  bigType(ctx, 'e o Brasil', 78, 700, { size: 80, color: '#e2e8f0', depth: 6, stroke: 9 });
  bigType(ctx, 'exporta.', 78, 800, { size: 80, color: '#e2e8f0', depth: 6, stroke: 9 });
}

// B: o navio cargueiro levando a carne e, na frente, o prato vazio
function drawThumb4B(ctx, w, h) {
  // céu de fim de tarde no porto
  const sky = ctx.createLinearGradient(0, 0, 0, 620); sky.addColorStop(0, '#0b1230'); sky.addColorStop(0.65, '#3b2a5a'); sky.addColorStop(1, '#f59e0b');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, w, 620);
  const sun = ctx.createRadialGradient(1500, 600, 10, 1500, 600, 420); sun.addColorStop(0, 'rgba(255,214,140,0.85)'); sun.addColorStop(0.25, 'rgba(251,146,60,0.35)'); sun.addColorStop(1, 'rgba(251,146,60,0)');
  ctx.fillStyle = sun; ctx.fillRect(0, 0, w, 700);
  // guindastes do porto ao fundo
  ctx.strokeStyle = 'rgba(15,23,42,0.85)'; ctx.lineWidth = 10;
  for (const x of [180, 420]) { ctx.beginPath(); ctx.moveTo(x, 610); ctx.lineTo(x, 300); ctx.lineTo(x + 260, 300); ctx.moveTo(x - 60, 300); ctx.lineTo(x, 300); ctx.moveTo(x, 360); ctx.lineTo(x + 120, 300); ctx.stroke(); }
  // mar
  const sea = ctx.createLinearGradient(0, 600, 0, 1080); sea.addColorStop(0, '#1e3a5f'); sea.addColorStop(1, '#050a18');
  ctx.fillStyle = sea; ctx.fillRect(0, 600, w, 480);
  ctx.fillStyle = 'rgba(255,200,120,0.35)'; for (let i = 0; i < 26; i++) ctx.fillRect(1380 + Math.sin(i * 1.7) * 90, 620 + i * 12, 120 - i * 3, 3);
  // navio grande saindo, com contêineres refrigerados
  navio(ctx, 1240, 615, 2.6, { rows: 4, seed: 7, dir: 1 });
  // mesa e prato vazio na frente
  const tb = ctx.createLinearGradient(0, 780, 0, 1080); tb.addColorStop(0, '#7c4a1e'); tb.addColorStop(1, '#3b220d');
  ctx.fillStyle = tb; ctx.fillRect(0, 800, w, 280);
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 3; for (let y = 820; y < 1080; y += 38) { ctx.beginPath(); ctx.moveTo(0, y); ctx.bezierCurveTo(600, y + 8, 1200, y - 8, w, y + 4); ctx.stroke(); }
  ctx.save(); ctx.translate(1290, 930); ctx.scale(1, 0.42);
  prato(ctx, 0, 0, 330, 0.001, 'bife');
  ctx.restore();
  // só um pedacinho de gordura e farelo no prato
  ctx.fillStyle = '#f3e3cf'; ctx.beginPath(); ctx.ellipse(1350, 935, 34, 10, 0.2, 0, 6.283); ctx.fill();
  ctx.fillStyle = 'rgba(127,29,29,0.6)'; [[1240, 925], [1262, 940], [1310, 918]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 4, 0, 6.283); ctx.fill(); });
  tbGrain(ctx, w, h, 8);
  tbVig(ctx, w, h, 0.5);
  bigType(ctx, 'FOI PRA', 70, 300, { size: 160 });
  bigType(ctx, 'FORA?', 70, 490, { size: 190, color: '#fff7c2', color2: '#facc15', hl: '#1e3a8a' });
}

// C: o cartaz de cortes do açougue pintado de quem fica com o dinheiro; o imposto é quase nada
function drawThumb4C(ctx, w, h) {
  tbBg(ctx, w, h, [[w * 0.6, h * 0.45, 900, P.pasto, 0.18], [w * 0.1, h * 0.85, 600, '#7c3aed', 0.2]]);
  azulejos(ctx, 0, 0, w, h, 0.4);
  const fill = (name) => (name === 'pescoço' ? P.icms : ['músculo', 'peito'].includes(name) ? P.cadeia : P.pasto);
  ctx.save(); ctx.translate(1400, 580); ctx.rotate(0.03); cartaz(ctx, 0, 0, 1.45, { fill, base: P.cadeia, hoof: P.icms, labels: false }); ctx.restore();
  // etiquetas penduradas: pecuarista gigante e imposto miúdo
  etiqueta(ctx, 1215, 430, 1.12, { t: 'PECUARISTA', tSize: 40, rows: [], total: ['FICA COM', 'R$ 68'], totalSize: 56, h: 210, code: 12 }, { rot: -0.06 });
  etiqueta(ctx, 1800, 880, 0.42, { t: 'IMPOSTO', tSize: 34, rows: [], total: ['', 'R$ 7'], totalSize: 46, h: 200, code: 5 }, { rot: 0.12, alpha: 0.85 });
  ctx.save(); ctx.strokeStyle = '#facc15'; ctx.lineWidth = 6; ctx.setLineDash([12, 10]); ctx.beginPath(); ctx.ellipse(1800, 880, 118, 70, 0.12, 0, 6.283); ctx.stroke(); ctx.restore();
  tbGrain(ctx, w, h, 13);
  tbVig(ctx, w, h, 0.5);
  bigType(ctx, 'NÃO É', 70, 330, { size: 165 });
  bigType(ctx, 'IMPOSTO', 70, 530, { size: 175, color: '#fff7c2', color2: '#facc15', hl: '#b91c1c' });
}

const THUMBS = {
  A: { draw: drawThumb4A, file: 'thumb-A-recorde.jpg' },
  B: { draw: drawThumb4B, file: 'thumb-B-pra-fora.jpg' },
  C: { draw: drawThumb4C, file: 'thumb-C-nao-e-imposto.jpg' },
};
