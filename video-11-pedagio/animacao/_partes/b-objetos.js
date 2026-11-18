
// ================================================================ cenário: a serra do mar à noite (fundo com paralaxe e desfoque)
// céu azul-escuro com estrelas, morros em camadas com neblina, a estrada descendo em curvas com os faróis, as luzes da Baixada lá embaixo.
let SERRA = null;
function serraFundo(ctx, cam, a = 1, escuro = 0) {
  if (!SERRA) {
    const Wd = 2600, Hd = 1400, r = rng(23);
    const c = document.createElement('canvas'); c.width = Wd; c.height = Hd; const g = c.getContext('2d');
    const sky = g.createLinearGradient(0, 0, 0, 900); sky.addColorStop(0, '#060b1a'); sky.addColorStop(1, '#1b2a4a'); g.fillStyle = sky; g.fillRect(0, 0, Wd, Hd);
    for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(226,232,240,${0.2 + r() * 0.6})`; g.fillRect(r() * Wd, r() * 520, 2, 2); }
    // luzes da Baixada no horizonte, à direita
    for (let i = 0; i < 260; i++) { const x = 1300 + r() * 1300, y = 640 + r() * 70; g.fillStyle = r() > 0.6 ? 'rgba(253,224,141,0.9)' : 'rgba(186,230,253,0.7)'; g.fillRect(x, y, 3, 2); }
    const glow = g.createRadialGradient(1950, 680, 10, 1950, 680, 600); glow.addColorStop(0, 'rgba(253,186,116,0.25)'); glow.addColorStop(1, 'rgba(253,186,116,0)'); g.fillStyle = glow; g.fillRect(1200, 300, 1400, 700);
    // morros em camadas
    [['#14213a', 560, 0.9], ['#101a2f', 680, 1.3], ['#0b1324', 820, 1.8]].forEach(([cor, base, amp], k) => {
      g.fillStyle = cor; g.beginPath(); g.moveTo(0, Hd);
      for (let x = 0; x <= Wd; x += 40) g.lineTo(x, base - Math.abs(Math.sin(x / (260 + k * 90) + k)) * 160 * amp - Math.sin(x / 70) * 12);
      g.lineTo(Wd, Hd); g.closePath(); g.fill();
      g.fillStyle = 'rgba(203,213,225,0.06)'; g.fillRect(0, base - 40, Wd, 60);
    });
    // a estrada descendo em curvas, com os faróis
    g.strokeStyle = '#2a3346'; g.lineWidth = 34; g.beginPath(); g.moveTo(-50, 900); g.bezierCurveTo(600, 760, 900, 1000, 1400, 840); g.bezierCurveTo(1800, 720, 2200, 900, 2700, 800); g.stroke();
    for (let i = 0; i < 70; i++) { const q = r(), x = q * 2700 - 50, y = 870 - Math.sin(q * 9) * 50; g.fillStyle = r() > 0.5 ? 'rgba(254,240,138,0.95)' : 'rgba(248,113,113,0.9)'; g.beginPath(); g.arc(x, y, 3.5, 0, 6.283); g.fill(); }
    const fl = g.createLinearGradient(0, 960, 0, Hd); fl.addColorStop(0, '#070c18'); fl.addColorStop(1, '#03060d'); g.fillStyle = fl; g.fillRect(0, 960, Wd, Hd - 960);
    const tmp = document.createElement('canvas'); tmp.width = Wd; tmp.height = Hd; const t2 = tmp.getContext('2d');
    t2.filter = 'blur(8px)'; for (const dx of [-Wd, 0, Wd]) t2.drawImage(c, dx, 0); SERRA = tmp;
  }
  layer(ctx, cam, 0.35, () => {
    ctx.save(); ctx.globalAlpha *= a;
    const cx = cam.x - (cam.x - 960) * 0.65, k0 = Math.floor((cx - 1500 + 340) / 2600), k1 = Math.floor((cx + 1500 + 340) / 2600);
    for (let k = k0; k <= k1; k++) ctx.drawImage(SERRA, -340 + k * 2600, -160);
    ctx.fillStyle = `rgba(4,8,18,${0.35 + 0.35 * escuro})`; ctx.fillRect(-340 + k0 * 2600, -160, (k1 - k0 + 1) * 2600, 1400);
    ctx.restore();
  });
}
// faixas de neblina passando perto da câmera (camada da frente)
function neblina(ctx, cam, t, seed = 1, a = 0.08) {
  const r = rng(seed);
  layer(ctx, cam, 1.4, () => {
    for (let i = 0; i < 6; i++) {
      const x = ((r() * 2600 + t * (30 + r() * 40)) % 2800) - 400 + cam.x - 960, y = 200 + r() * 600, w = 500 + r() * 500;
      const g = ctx.createRadialGradient(x, y, 0, x, y, w / 2); g.addColorStop(0, hexA('#cbd5e1', a)); g.addColorStop(1, hexA('#cbd5e1', 0));
      ctx.fillStyle = g; ctx.fillRect(x - w / 2, y - w / 4, w, w / 2);
    }
  });
}

// ================================================================ a estrada vista pelo para-brisa (perspectiva), com o pórtico chegando
// o: { vel (velocidade das faixas), port (0 = longe, 1 = passando por cima), flash (0..1), placaLida, curva }
function estradaVista(ctx, cx, cy, w, h, t, o = {}) {
  ctx.save(); ctx.translate(cx, cy);
  ctx.save(); rr(ctx, -w / 2, -h / 2, w, h, 26); ctx.clip();
  const sky = ctx.createLinearGradient(0, -h / 2, 0, 0); sky.addColorStop(0, '#0a1226'); sky.addColorStop(1, '#22345a'); ctx.fillStyle = sky; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = '#0d1729'; ctx.beginPath(); ctx.moveTo(-w / 2, -h * 0.02); for (let x = -w / 2; x <= w / 2; x += 30) ctx.lineTo(x, -h * 0.08 - Math.abs(Math.sin(x / 180)) * h * 0.14); ctx.lineTo(w / 2, h / 2); ctx.lineTo(-w / 2, h / 2); ctx.closePath(); ctx.fill();
  const hz = -h * 0.02, cu = (o.curva ?? Math.sin(t * 0.3) * 0.15) * w;
  // pista em perspectiva
  ctx.fillStyle = '#262f40'; ctx.beginPath(); ctx.moveTo(cu - 20, hz); ctx.lineTo(cu + 20, hz); ctx.lineTo(w * 0.62, h / 2); ctx.lineTo(-w * 0.62, h / 2); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(226,232,240,0.7)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cu - 22, hz); ctx.lineTo(-w * 0.6, h / 2); ctx.moveTo(cu + 22, hz); ctx.lineTo(w * 0.6, h / 2); ctx.stroke();
  const vel = o.vel ?? 1;
  for (let i = 0; i < 9; i++) { const k = ((i / 9) + t * 0.45 * vel) % 1, k2 = Math.min(1, k + 0.045); const y0 = lerp(hz, h / 2, k * k), y1 = lerp(hz, h / 2, k2 * k2); ctx.strokeStyle = '#fde68a'; ctx.lineWidth = 2 + 10 * k; ctx.beginPath(); ctx.moveTo(lerp(cu, 0, k * k), y0); ctx.lineTo(lerp(cu, 0, k2 * k2), y1); ctx.stroke(); }
  // mureta com refletores
  for (let i = 0; i < 8; i++) { const k = ((i / 8) + t * 0.45 * vel) % 1; circle(ctx, lerp(cu + 24, w * 0.6, k * k), lerp(hz, h / 2, k * k) - 6 - 8 * k, 2 + 5 * k, '#fca5a5', 0.8); }
  // o pórtico chegando
  const pk = clamp(o.port ?? -1);
  if (o.port != null && o.port >= 0) {
    const s = lerp(0.12, 2.2, Math.pow(pk, 2.2)), py = lerp(hz - 10, -h * 0.9, Math.pow(pk, 2.2));
    ctx.save(); ctx.translate(lerp(cu, 0, pk), py); ctx.scale(s, s);
    ctx.fillStyle = '#94a3b8'; ctx.fillRect(-330, -20, 22, 260); ctx.fillRect(308, -20, 22, 260);
    fillRR(ctx, -350, -60, 700, 60, 6, '#334155'); ctx.strokeStyle = '#64748b'; ctx.lineWidth = 3; for (let x = -340; x < 340; x += 40) { ctx.beginPath(); ctx.moveTo(x, -60); ctx.lineTo(x + 20, 0); ctx.lineTo(x + 40, -60); ctx.stroke(); }
    for (const bx of [-180, 0, 180]) { fillRR(ctx, bx - 26, 0, 52, 30, 5, '#0f172a'); circle(ctx, bx, 15, 7, (o.flash || 0) > 0.1 ? '#ffffff' : '#ef4444'); }
    ctx.restore();
  }
  if ((o.flash || 0) > 0) { ctx.fillStyle = `rgba(255,255,255,${0.85 * clamp(o.flash)})`; ctx.fillRect(-w / 2, -h / 2, w, h); }
  ctx.restore();
  ctx.restore();
}

// ================================================================ por dentro do carro (desenhado em tela, na camada da frente)
// o: { a, tag (0..1 brilho do bip), tagCor, cel: fn(ctx) conteúdo do celular, celK, vel (velocímetro) }
function painelCarro(ctx, t, o = {}) {
  const a = o.a ?? 1; if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  // colunas do para-brisa
  ctx.fillStyle = '#05070c';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(150, 0); ctx.lineTo(10, 900); ctx.lineTo(0, 900); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(W, 0); ctx.lineTo(W - 150, 0); ctx.lineTo(W - 10, 900); ctx.lineTo(W, 900); ctx.closePath(); ctx.fill();
  ctx.fillRect(0, 0, W, 34);
  // retrovisor com a tag colada atrás
  ctx.fillStyle = '#0b0f17'; ctx.fillRect(952, 34, 16, 50);
  fillRR(ctx, 820, 80, 280, 74, 30, '#111827'); fillRR(ctx, 834, 92, 252, 50, 22, '#1e293b');
  const tk = clamp(o.tag || 0);
  fillRR(ctx, 1110, 44, 96, 54, 8, tk > 0 ? (o.tagCor || P.ok) : '#e5e7eb');
  if (tk > 0) { ctx.save(); ctx.globalAlpha *= tk; const g = ctx.createRadialGradient(1158, 71, 0, 1158, 71, 120); g.addColorStop(0, hexA(o.tagCor || P.ok, 0.6)); g.addColorStop(1, hexA(o.tagCor || P.ok, 0)); ctx.fillStyle = g; ctx.fillRect(1040, -50, 240, 240); ctx.restore(); }
  text(ctx, 'TAG', 1158, 72, { size: 22, weight: 900, color: tk > 0.5 ? '#ffffff' : '#475569' });
  // painel (objeto, abaixo da faixa das legendas: nenhum texto aqui embaixo)
  const g = ctx.createLinearGradient(0, 860, 0, H); g.addColorStop(0, '#111827'); g.addColorStop(1, '#030509');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, 900); ctx.quadraticCurveTo(W / 2, 830, W, 900); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(148,163,184,0.25)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 902); ctx.quadraticCurveTo(W / 2, 832, W, 902); ctx.stroke();
  // volante
  ctx.save(); ctx.translate(560, 1120); ctx.rotate(Math.sin(t * 0.7) * 0.05);
  ctx.strokeStyle = '#0b0f17'; ctx.lineWidth = 44; ctx.beginPath(); ctx.arc(0, 0, 300, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
  ctx.strokeStyle = '#1f2937'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, 318, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
  ctx.restore();
  // velocímetro aceso (sem número)
  ctx.save(); ctx.translate(560, 1000); ctx.strokeStyle = 'rgba(56,189,248,0.5)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, 60, Math.PI, Math.PI * 2); ctx.stroke();
  const ang = Math.PI + Math.PI * clamp(o.vel ?? 0.45 + 0.03 * Math.sin(t)); ctx.strokeStyle = '#f87171'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(ang) * 52, Math.sin(ang) * 52); ctx.stroke(); ctx.restore();
  ctx.restore();
  // o celular no suporte do painel (fio condutor)
  const ck = clamp(o.celK ?? 0);
  if (ck > 0 && o.cel) celSuporte(ctx, 1540, 560, 0.72 * lerp(0.9, 1, ease.out(ck)), o.cel, { a: a * clamp(ck * 2) });
}
function celSuporte(ctx, x, y, s, fn, o = {}) {
  ctx.save(); ctx.globalAlpha *= o.a ?? 1;
  ctx.fillStyle = '#0b0f17'; ctx.fillRect(x - 12, y + 270 * s, 24, 900 - y - 270 * s); // haste até o painel
  celular(ctx, x, y, s, fn, { rot: o.rot || 0 });
  ctx.restore();
}

// ================================================================ telas do celular (desenhadas dentro do celular: largura 340, de y = −350 a 350)
function telaTopo(c, titulo, cor = '#0f172a') { c.fillStyle = cor; c.fillRect(-170, -350, 340, 90); text(c, titulo, 0, -300, { size: 30, weight: 900, color: '#ffffff' }); }
// notificação "pedágio em aberto"
function telaNotif(c, t, o = {}) {
  c.fillStyle = '#0b1222'; c.fillRect(-170, -350, 340, 700);
  text(c, o.hora || '19:42', 0, -250, { size: 64, weight: 300, color: '#e2e8f0' });
  text(c, o.dia || 'quinta, 14 de janeiro', 0, -196, { size: 20, weight: 700, color: '#94a3b8' });
  const k = clamp(o.k ?? 1);
  if (k > 0) {
    c.save(); c.globalAlpha *= k; c.translate(0, (1 - ease.out(k)) * -40);
    fillRR(c, -155, -140, 310, 200, 22, 'rgba(241,245,249,0.95)');
    fillRR(c, -135, -122, 40, 40, 10, o.iconeCor || '#64748b'); text(c, '!', -115, -101, { size: 26, weight: 900, color: '#ffffff' });
    text(c, 'mensagem', -82, -108, { size: 18, weight: 800, color: '#475569', align: 'left' });
    text(c, 'Pedágio em aberto', -135, -58, { size: 24, weight: 900, color: '#0f172a', align: 'left' });
    text(c, 'R$ 20,30', -135, -20, { size: 34, weight: 900, color: '#0f172a', align: 'left' });
    text(c, 'clique para pagar ›', -135, 26, { size: 20, weight: 800, color: '#2563eb', align: 'left' });
    c.restore();
  }
  if (o.marca === 'x') xMark(c, 0, 180, 1.8, P.golpe, o.mk ?? 1);
  if (o.marca === 'ok') check(c, 0, 180, 1.8, P.ok, o.mk ?? 1);
  if (o.marca === '?') text(c, '?', 0, 190, { size: 150, weight: 900, color: '#f59e0b' });
}
// site de pagamento pela placa (o oficial e o falso têm a MESMA tela; só muda o endereço)
// o: { endereco, digitado (0..1), achou (0 nada, 1 dados do carro + valor), pix, cadeado, oficial }
function telaSite(c, t, o = {}) {
  c.fillStyle = '#f8fafc'; c.fillRect(-170, -350, 340, 700);
  fillRR(c, -160, -340, 320, 50, 14, '#e2e8f0');
  if (o.cadeado) { c.save(); c.fillStyle = '#16a34a'; fillRR(c, -146, -322, 18, 16, 3, '#16a34a'); c.strokeStyle = '#16a34a'; c.lineWidth = 3; c.beginPath(); c.arc(-137, -324, 6, Math.PI, 0); c.stroke(); c.restore(); }
  const end = o.endereco || 'site-de-pagamento', ke = clamp(o.digEnd ?? 1), shown = end.slice(0, Math.ceil(end.length * ke));
  text(c, shown + (ke < 1 && Math.sin(t * 12) > 0 ? '|' : ''), o.cadeado ? -120 : -146, -314, { size: 18, weight: 800, color: '#334155', align: 'left' });
  text(c, 'PEDÁGIO', 0, -240, { size: 28, weight: 900, color: '#0f172a', letter: 3 });
  text(c, 'digite a placa', 0, -196, { size: 20, weight: 800, color: '#64748b' });
  fillRR(c, -130, -170, 260, 70, 12, '#ffffff'); strokeRR(c, -130, -170, 260, 70, 12, '#94a3b8', 3);
  const pl = 'ABC1D23', kd = clamp(o.digitado ?? 0), txt = pl.slice(0, Math.round(pl.length * kd));
  c.save(); c.font = MONO(36, 900); c.fillStyle = '#0f172a'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt + (kd > 0 && kd < 1 && Math.sin(t * 12) > 0 ? '|' : ''), 0, -134); c.restore();
  const ka = clamp(o.achou ?? 0);
  if (ka > 0) {
    c.save(); c.globalAlpha *= ka;
    fillRR(c, -140, -80, 280, 150, 14, '#eef2ff');
    text(c, 'HATCH 1.0 · PRATA', -124, -50, { size: 18, weight: 900, color: '#334155', align: 'left' });
    text(c, '1 passagem em aberto', -124, -18, { size: 18, weight: 800, color: '#475569', align: 'left' });
    text(c, 'R$ 20,30', -124, 30, { size: 40, weight: 900, color: '#0f172a', align: 'left' });
    fillRR(c, -120, 100, 240, 70, 35, o.botaoCor || '#16a34a'); text(c, o.botao || 'pagar com Pix', 0, 136, { size: 24, weight: 900, color: '#ffffff' });
    c.restore();
  }
  if (o.nada) { text(c, 'nenhuma passagem', 0, -40, { size: 24, weight: 900, color: '#16a34a' }); text(c, 'em aberto', 0, -6, { size: 24, weight: 900, color: '#16a34a' }); }
}
// aviso oficial por mensagem: mostra a passagem e indica onde pagar, sem botão de pagamento
function telaAviso(c, t, o = {}) {
  telaTopo(c, 'mensagem', '#0f5132');
  c.fillStyle = '#e7f5ec'; c.fillRect(-170, -260, 340, 610);
  fillRR(c, -150, -230, 290, 230, 18, '#ffffff');
  text(c, 'Aviso de passagem', -130, -196, { size: 22, weight: 900, color: '#0f172a', align: 'left' });
  text(c, 'placa ABC1D23', -130, -158, { size: 19, weight: 800, color: '#475569', align: 'left' });
  text(c, 'passagem em aberto', -130, -124, { size: 19, weight: 800, color: '#475569', align: 'left' });
  text(c, 'pague no canal', -130, -76, { size: 21, weight: 900, color: '#166534', align: 'left' });
  text(c, 'oficial da concessionária', -130, -46, { size: 21, weight: 900, color: '#166534', align: 'left' });
  if (o.semBotao) { fillRR(c, -120, 40, 240, 70, 35, '#e2e8f0'); text(c, 'sem botão de pagar', 0, 76, { size: 20, weight: 900, color: '#64748b' }); }
}

// ================================================================ objetos da estrada e do dinheiro
function cabineAntiga(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  sombraChao(ctx, 0, 150, 220, 0.5);
  fillRR(ctx, -300, -260, 600, 50, 8, '#e5e7eb'); ctx.fillStyle = '#94a3b8'; ctx.fillRect(-280, -210, 20, 360); ctx.fillRect(260, -210, 20, 360);
  ctx.save(); papelSombra(ctx); fillRR(ctx, -90, -150, 180, 300, 10, '#cbd5e1'); ctx.restore();
  fillRR(ctx, -70, -120, 140, 100, 8, '#bae6fd'); fillRR(ctx, 90, 30, 30, 30, 4, '#475569');
  // cancela listrada
  const ab = o.abre || 0;
  ctx.save(); ctx.translate(110, 60); ctx.rotate(-ab * 1.3);
  for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? '#ffffff' : '#dc2626'; ctx.fillRect(i * 40, -10, 40, 20); }
  ctx.restore();
  fillRR(ctx, 90, 40, 40, 70, 6, '#334155');
  if (o.x > 0) xMark(ctx, 0, -40, 2.4, P.golpe, o.x);
  ctx.restore();
}
function recibo(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || -0.05); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  ctx.save(); papelSombra(ctx); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(-110, -170); ctx.lineTo(110, -170); for (let i = 0; i <= 10; i++) ctx.lineTo(110 - i * 22, 170 + (i % 2 ? 10 : 0)); ctx.lineTo(-110, -170); ctx.fill(); ctx.restore();
  text(ctx, 'RECIBO', 0, -130, { size: 28, weight: 900, color: P.ink, letter: 3 });
  for (let i = 0; i < 5; i++) { fillRR(ctx, -80, -80 + i * 34, 90, 10, 5, '#e5e7eb'); fillRR(ctx, 30, -80 + i * 34, 50, 10, 5, '#e5e7eb'); }
  mono(ctx, o.valor || 'R$ 20,30', 0, 120, 30, P.ink, 'center', 900);
  if (o.x > 0) xMark(ctx, 0, 0, 2.0, P.golpe, o.x);
  ctx.restore();
}
function cnhPontos(ctx, x, y, s, pontos, o = {}) { // carteira de motorista genérica com bolinhas de pontos
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0.04); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  ctx.save(); papelSombra(ctx); fillRR(ctx, -200, -125, 400, 250, 18, '#d9f99d'); ctx.restore();
  fillRR(ctx, -200, -125, 400, 54, 18, '#4d7c0f'); text(ctx, 'HABILITAÇÃO', 0, -96, { size: 26, weight: 900, color: '#ffffff', letter: 3 });
  fillRR(ctx, -175, -50, 110, 140, 10, '#cbd5e1'); circle(ctx, -120, -10, 26, '#94a3b8'); fillRR(ctx, -158, 22, 76, 50, 20, '#94a3b8');
  for (let i = 0; i < 3; i++) fillRR(ctx, -40, -40 + i * 30, 200, 12, 6, 'rgba(63,98,18,0.35)');
  for (let i = 0; i < 5; i++) circle(ctx, -30 + i * 44, 75, 15, i < pontos ? '#dc2626' : 'rgba(63,98,18,0.25)');
  ctx.restore();
}
function escritorioEmpresa(ctx, x, y, s, label, cor, o = {}) { // prédio de escritório (a concessionária), diferente do prédio de governo
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  sombraChao(ctx, 0, 160, 230, 0.5);
  ctx.save(); papelSombra(ctx); ctx.fillStyle = '#1e3a8a'; ctx.fillRect(-150, -280, 300, 440); ctx.restore();
  for (let r2 = 0; r2 < 9; r2++) for (let c = 0; c < 5; c++) ctx.fillStyle = (r2 * 7 + c * 3) % 5 ? 'rgba(147,197,253,0.75)' : 'rgba(30,58,138,0.9)', ctx.fillRect(-130 + c * 54, -260 + r2 * 46, 40, 30);
  fillRR(ctx, -170, -340, 340, 50, 10, cor); text(ctx, label, 0, -315, { size: 24, weight: 900, color: '#0b1222', letter: 1 });
  if (o.zero) { chip(ctx, 0, 0, o.zero, '#e2e8f0', 1, { size: 34 }); }
  ctx.restore();
}
function ambulancia(ctx, x, y, s, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  sombraChao(ctx, 0, 70, 220, 0.5);
  ctx.save(); papelSombra(ctx); fillRR(ctx, -200, -110, 270, 160, 14, '#f8fafc'); fillRR(ctx, 70, -60, 120, 110, 14, '#f8fafc'); ctx.restore();
  fillRR(ctx, 100, -45, 70, 45, 6, '#bae6fd'); ctx.fillStyle = '#dc2626'; ctx.fillRect(-200, -10, 390, 18);
  ctx.fillStyle = '#dc2626'; ctx.fillRect(-90, -90, 22, 66); ctx.fillRect(-112, -68, 66, 22);
  fillRR(ctx, -60, -132, 60, 22, 6, Math.sin(t * 9) > 0 ? '#ef4444' : '#3b82f6');
  for (const wx of [-130, 120]) { circle(ctx, wx, 55, 30, '#111827'); circle(ctx, wx, 55, 12, '#9ca3af'); }
  ctx.restore();
}
function rolo(ctx, x, y, s, o = {}) { // rolo compactador (o asfalto)
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  sombraChao(ctx, 0, 80, 220, 0.5);
  ctx.fillStyle = '#facc15'; fillRR(ctx, -120, -120, 200, 110, 12, '#facc15'); fillRR(ctx, -70, -190, 110, 80, 10, '#1f2937');
  circle(ctx, -150, 30, 60, '#475569'); circle(ctx, -150, 30, 50, '#64748b'); ctx.fillStyle = '#334155'; ctx.fillRect(-150, 10, 260, 40); circle(ctx, 110, 40, 40, '#111827');
  ctx.restore();
}
function placaSinal(ctx, x, y, s, o = {}) { // placa de sinalização de trânsito (curva perigosa)
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  ctx.fillStyle = '#94a3b8'; ctx.fillRect(-8, 0, 16, 220);
  ctx.save(); ctx.rotate(Math.PI / 4); fillRR(ctx, -90, -90, 180, 180, 12, '#facc15'); strokeRR(ctx, -82, -82, 164, 164, 10, '#111827', 6); ctx.restore();
  ctx.strokeStyle = '#111827'; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-20, 50); ctx.lineTo(-20, 0); ctx.quadraticCurveTo(-20, -30, 20, -40); ctx.stroke();
  ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.moveTo(20, -70); ctx.lineTo(48, -42); ctx.lineTo(16, -14); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function radar(ctx, x, y, s, t, o = {}) { // poste de fiscalização com câmera
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  ctx.fillStyle = '#94a3b8'; ctx.fillRect(-10, -60, 20, 280); ctx.fillRect(-10, -60, 120, 16);
  fillRR(ctx, 80, -80, 90, 60, 10, '#1f2937'); circle(ctx, 140, -50, 16, Math.sin(t * 4) > 0.6 ? '#ffffff' : '#64748b');
  ctx.restore();
}
function livro(ctx, x, y, s, o = {}) { // cartilha de educação no trânsito
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.08); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  ctx.save(); papelSombra(ctx); fillRR(ctx, -120, -150, 240, 300, 10, '#16a34a'); ctx.restore();
  fillRR(ctx, -100, -130, 200, 260, 6, '#22c55e'); circle(ctx, 0, -20, 50, '#dc2626'); circle(ctx, 0, -20, 36, '#ffffff'); ctx.fillStyle = '#dc2626'; ctx.fillRect(-30, -26, 60, 12);
  fillRR(ctx, -70, 70, 140, 14, 7, 'rgba(255,255,255,0.7)');
  ctx.restore();
}
function cofre(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  sombraChao(ctx, 0, 140, 160, 0.5);
  ctx.save(); papelSombra(ctx); fillRR(ctx, -130, -130, 260, 260, 16, '#475569'); ctx.restore();
  strokeRR(ctx, -110, -110, 220, 220, 10, '#94a3b8', 4); circle(ctx, 0, 0, 46, '#cbd5e1'); circle(ctx, 0, 0, 34, '#64748b');
  for (let i = 0; i < 8; i++) { const a2 = i * 0.785; ctx.fillStyle = '#e2e8f0'; ctx.fillRect(Math.cos(a2) * 38 - 3, Math.sin(a2) * 38 - 3, 6, 6); }
  ctx.restore();
}
function carteiraAnonima(ctx, x, y, s, o = {}) { // a conta de outra pessoa: carteira com "?"
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.06); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  ctx.save(); papelSombra(ctx); fillRR(ctx, -160, -110, 320, 220, 26, '#3f1d2b'); ctx.restore();
  fillRR(ctx, 40, -50, 140, 100, 22, '#5b2333'); circle(ctx, 90, 0, 14, '#fda4af');
  text(ctx, '?', -50, 6, { size: 130, weight: 900, color: '#fda4af' });
  ctx.restore();
}
// mapa da estrada de São Paulo até a Baixada, com as cidades ao longo do caminho (para o ISS dividido)
function mapaEstrada(ctx, x, y, s, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  const pts = [[-520, -230], [-300, -150], [-120, -40], [40, 60], [220, 150], [470, 230]];
  const cidades = o.cidades || [[-520, -230, 'SÃO PAULO'], [-200, -100, 'CIDADE 2'], [60, 80, 'CIDADE 3'], [470, 230, 'LITORAL']];
  ctx.strokeStyle = '#475569'; ctx.lineWidth = 34; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); pts.forEach(([px, py], i) => i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)); ctx.stroke();
  ctx.strokeStyle = '#fde68a'; ctx.lineWidth = 4; ctx.setLineDash([18, 14]); ctx.stroke(); ctx.setLineDash([]);
  cidades.forEach(([cx, cy, lb], i) => {
    const kc = clamp(o.kc ? o.kc[i] ?? 1 : 1);
    ctx.save(); ctx.globalAlpha *= 0.35 + 0.65 * kc;
    for (let b = 0; b < 4; b++) fillRR(ctx, cx - 70 + b * 36, cy - 60 - (b % 2) * 30 - 40, 30, 60 + (b % 2) * 30, 4, kc > 0.5 ? '#c4b5fd' : '#64748b');
    text(ctx, lb, cx, cy + 60, { size: 24, weight: 900, color: '#e2e8f0' });
    ctx.restore();
  });
  if (o.fluxo) for (let i = 0; i < 6; i++) { const q = ((t * 0.12 + i / 6) % 1) * (pts.length - 1), j = Math.floor(q), f = q - j, [ax, ay] = pts[j], [bx, by] = pts[Math.min(j + 1, pts.length - 1)]; circle(ctx, lerp(ax, bx, f), lerp(ay, by, f), 9, i % 2 ? '#fde68a' : '#fca5a5'); }
  if (o.portico) { const [px, py] = o.portico; ctx.save(); ctx.translate(px, py); fillRR(ctx, -60, -70, 120, 22, 4, '#94a3b8'); ctx.fillStyle = '#94a3b8'; ctx.fillRect(-58, -50, 8, 60); ctx.fillRect(50, -50, 8, 60); circle(ctx, 0, -59, 6, '#ef4444'); ctx.restore(); }
  ctx.restore();
}
// envelope verdadeiro de multa com o valor
function envelopeValor(ctx, x, y, s, k, o = {}) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.06); ctx.scale(s * lerp(1.2, 1, ease.out(clamp(k))), s * lerp(1.2, 1, ease.out(clamp(k)))); ctx.globalAlpha *= clamp(k * 2);
  ctx.save(); papelSombra(ctx); ctx.fillStyle = '#f5f5f4'; ctx.fillRect(-260, -160, 520, 320); ctx.restore();
  ctx.strokeStyle = '#d6d3d1'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-260, -160); ctx.lineTo(0, 20); ctx.lineTo(260, -160); ctx.stroke();
  text(ctx, 'NOTIFICAÇÃO DE INFRAÇÃO', 0, 60, { size: 24, weight: 900, color: '#57534e', letter: 2 });
  mono(ctx, 'R$ 195,23', 0, 112, 48, '#b91c1c', 'center', 900);
  ctx.restore();
}
// bilhete de pedágio (o valor que continua devido)
function bilhete(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0.05); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  ctx.save(); papelSombra(ctx); fillRR(ctx, -150, -70, 300, 140, 12, '#fefce8'); ctx.restore();
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.setLineDash([6, 6]); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(70, -60); ctx.lineTo(70, 60); ctx.stroke(); ctx.setLineDash([]);
  text(ctx, 'PEDÁGIO', -40, -30, { size: 22, weight: 900, color: '#57534e', letter: 2 });
  mono(ctx, 'R$ 20,30', -40, 18, 34, P.ink, 'center', 900);
  if (o.carimbo) { ctx.save(); ctx.translate(-30, 0); ctx.rotate(-0.15); strokeRR(ctx, -120, -36, 240, 72, 8, o.carimboCor || '#dc2626', 6); text(ctx, o.carimbo, 0, 2, { size: 30, weight: 900, color: o.carimboCor || '#dc2626', letter: 2 }); ctx.restore(); }
  ctx.restore();
}
// placa do pórtico com o painel de letreiro (para a inscrição)
function painelPortico(ctx, x, y, s, t, str, cor) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#94a3b8'; ctx.fillRect(-460, -160, 30, 460); ctx.fillRect(430, -160, 30, 460);
  ctx.save(); papelSombra(ctx); fillRR(ctx, -500, -230, 1000, 160, 14, '#1e293b'); ctx.restore();
  fillRR(ctx, -440, -205, 880, 110, 10, '#020617');
  ctx.save(); ctx.shadowColor = cor; ctx.shadowBlur = 30; text(ctx, str, 0, -148, { size: 70, weight: 900, color: cor, letter: 6 }); ctx.restore();
  for (const bx of [-260, 0, 260]) { fillRR(ctx, bx - 40, -70, 80, 44, 6, '#0f172a'); circle(ctx, bx, -48, 10, '#ef4444'); }
  ctx.restore();
}
function controleGame(ctx, x, y, s, t) { // controle de videogame genérico
  ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t) * 0.05); ctx.scale(s, s);
  ctx.save(); papelSombra(ctx); ctx.fillStyle = '#1f2937'; ctx.beginPath(); ctx.ellipse(-110, 20, 90, 70, -0.3, 0, 6.283); ctx.ellipse(110, 20, 90, 70, 0.3, 0, 6.283); ctx.fill(); fillRR(ctx, -130, -60, 260, 110, 50, '#1f2937'); ctx.restore();
  ctx.fillStyle = '#475569'; ctx.fillRect(-140, -12, 60, 20); ctx.fillRect(-120, -32, 20, 60);
  for (const [dx, dy, c] of [[110, -30, '#ef4444'], [140, 0, '#22c55e'], [110, 30, '#38bdf8'], [80, 0, '#facc15']]) circle(ctx, dx, dy, 13, c);
  circle(ctx, -40, 40, 22, '#334155'); circle(ctx, 40, 40, 22, '#334155');
  ctx.restore();
}
// três setas saindo do carro (estrada, multa, golpe)
function tresSetas(ctx, x, y, t, ks, kf) {
  const dests = [[P.emp, 'ESTRADA', -520, -250], [P.multa, 'MULTA', 0, -330], [P.golpe, 'GOLPE', 520, -250]];
  dests.forEach(([cor, lb, dx, dy], i) => {
    const k = clamp(ks[i] ?? 0); if (k <= 0) return;
    const fade = i > 0 ? 1 - 0.75 * clamp(kf) : 1;
    ctx.save(); ctx.globalAlpha *= fade;
    arrow(ctx, x, y - 60, x + dx * 0.8, y + dy * 0.8 + 60, cor, 12, ease.out(k));
    chip(ctx, x + dx, y + dy, lb, cor, k, { size: 40 });
    ctx.restore();
  });
}
