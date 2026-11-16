// Cenas do vídeo 03: Quem fica com cada real da sua conta de luz?
// Conceito: a conta de luz é o mapa, e o seu dinheiro vira eletricidade.
// K('frase') = instante (s, desde o início da cena) em que a frase começa a ser falada.

// Cores das partes (identidade do canal) e da eletricidade.
const P = { ger: C.petro, tra: '#22d3ee', dis: C.dist, enc: C.fed, imp: C.icms, au: C.gold, ok: '#4ade80' };
const HOME = { x: 960, y: 540, z: 1 };
const vis = (t, a, b, fin = 0.4, fout = 0.4) => Math.min(appear(t, a, fin), 1 - appear(t, b, fout));

// ---------------------------------------------------------------- textos com personalidade
// Máquina de escrever, com cursor piscando.
function typeText(ctx, str, x, y, t, t0, cps, o = {}) {
  if (t < t0) return 0;
  const n = Math.min(str.length, Math.floor((t - t0) * cps));
  const shown = str.slice(0, n);
  text(ctx, shown, x, y, { align: 'left', ...o });
  if (n < str.length || Math.sin(t * 9) > 0) {
    const w = measure(ctx, shown, o.size || 56, o.weight || 700);
    fillRR(ctx, x + w + 6, y - (o.size || 56) * 0.42, 4, (o.size || 56) * 0.8, 2, o.color || C.text, o.alpha ?? 1);
  }
  return n;
}
// Letreiro de neon: pisca ao ligar e fica aceso.
function neonText(ctx, str, x, y, t, t0, o = {}) {
  const dt = t - t0;
  if (dt < 0) return;
  const on = dt > 0.5 ? 1 : (Math.sin(dt * 61) > 0.3 || dt > 0.38 ? 1 : 0.15);
  const out = o.until != null ? 1 - prog(t, o.until, 0.3) : 1;
  if (out <= 0) return;
  const col = o.color || P.au;
  ctx.save();
  ctx.globalAlpha *= on * out;
  ctx.shadowColor = col; ctx.shadowBlur = o.blur || 36;
  text(ctx, str, x, y, { ...o, color: col });
  ctx.shadowBlur = 0;
  text(ctx, str, x, y, { ...o, color: 'rgba(255,255,255,0.55)', size: o.size, weight: o.weight });
  ctx.restore();
}
// Número escrito por um raio: revela da esquerda para a direita com uma faísca na ponta.
function boltText(ctx, str, x, y, t, t0, dur, o = {}) {
  const k = ease.inOut(prog(t, t0, dur));
  if (k <= 0) return;
  const size = o.size || 96, w = measure(ctx, str, size, o.weight || 900);
  const x0 = o.align === 'left' ? x : x - w / 2;
  ctx.save();
  ctx.beginPath(); ctx.rect(x0 - 10, y - size, (w + 20) * k, size * 2); ctx.clip();
  glowText(ctx, str, x, y, { size, weight: o.weight || 900, color: o.color || P.au, glow: hexA(o.color || P.au, 0.7), blur: 40, align: o.align || 'center' });
  ctx.restore();
  if (k < 1) {
    const fx = x0 + w * k;
    ctx.save(); ctx.strokeStyle = '#fff7cc'; ctx.lineWidth = 4; ctx.shadowColor = P.au; ctx.shadowBlur = 24;
    ctx.beginPath(); ctx.moveTo(fx, y - size * 0.7);
    for (let i = 1; i <= 5; i++) ctx.lineTo(fx + (Math.sin(t * 90 + i * 7) * 16), y - size * 0.7 + i * size * 0.28);
    ctx.stroke(); ctx.restore();
    circle(ctx, fx, y, 10, '#fff7cc');
  }
}
// Mostrador de LED (dígitos apagados ao fundo).
function ledText(ctx, str, x, y, o = {}) {
  const size = o.size || 72, col = o.color || '#fbbf24';
  ctx.save();
  ctx.font = `800 ${size}px "Noto Sans Mono", "Noto Sans", monospace`;
  ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle';
  ctx.globalAlpha *= (o.alpha ?? 1);
  ctx.save(); ctx.globalAlpha *= 0.12; ctx.fillStyle = col;
  ctx.fillText(str.replace(/[0-9]/g, '8'), x, y); ctx.restore();
  ctx.shadowColor = col; ctx.shadowBlur = 26; ctx.fillStyle = col;
  ctx.fillText(str, x, y);
  ctx.restore();
}

// ---------------------------------------------------------------- a conta de papel
const BILL_W = 520, BILL_H = 740;
const ROWS = {
  kwh: [190, 'Consumo do mês', '182 kWh'],
  flag: [240, 'Bandeira tarifária', ''],
  te: [320, 'Consumo TE', 'R$ 70,10'],
  tusd: [370, 'Consumo TUSD', 'R$ 74,60'],
  icms: [470, 'ICMS (18%)', 'R$ 35,90'],
  pis: [520, 'PIS/COFINS', 'R$ 9,10'],
  cip: [570, 'Iluminação pública', 'R$ 9,30'],
  total: [665, 'TOTAL A PAGAR', 'R$ 199,00'],
};
// posição (mundo) de uma linha da conta
function billRow(bx, by, s, key) { return { x: bx, y: by + (ROWS[key][0] - BILL_H / 2) * s }; }
function bill(ctx, bx, by, s, t, o = {}) {
  const a = o.alpha ?? 1;
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(bx, by); if (o.rot) ctx.rotate(o.rot); ctx.scale(s, s); ctx.translate(-BILL_W / 2, -BILL_H / 2);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 18;
  fillRR(ctx, 0, 0, BILL_W, BILL_H, 14, '#eef2f7'); ctx.restore();
  // dobra/serrilhado no topo
  ctx.fillStyle = '#d7dee8'; for (let x = 10; x < BILL_W - 10; x += 22) { ctx.beginPath(); ctx.arc(x + 11, 0, 5, 0, Math.PI); ctx.fill(); }
  fillRR(ctx, 0, 14, BILL_W, 86, 0, '#14213d');
  miniIcon(ctx, 'bolt', 50, 57, 46, P.au);
  text(ctx, 'CONTA DE ENERGIA', 90, 46, { size: 30, weight: 900, align: 'left', color: '#fff', letter: 2 });
  text(ctx, 'Distribuidora de Energia S.A. · nov/2026', 90, 78, { size: 17, weight: 600, align: 'left', color: '#9fb0c8' });
  text(ctx, 'Instalação 0004 5527 81', 30, 135, { size: 17, weight: 600, align: 'left', color: '#7b8798' });
  const hl = o.hl || {};
  for (const [key, [y, lab, val]] of Object.entries(ROWS)) {
    const h = hl[key] || 0;
    if (h > 0) fillRR(ctx, 14, y - 24, BILL_W - 28, 48, 10, hexA(o.hlColor?.[key] || P.au, 0.32 * h));
    if (o.xray && (key === 'te' || key === 'tusd')) {
      const k = o.xray;
      fillRR(ctx, 14, y - 24, BILL_W - 28, 48, 10, hexA('#38bdf8', 0.35 * k));
      // por dentro da linha: plugues escondidos
      for (let i = 0; i < 7; i++) {
        const px = 210 + i * 40;
        ctx.save(); ctx.globalAlpha *= k; ctx.fillStyle = '#0ea5e9';
        rr(ctx, px - 9, y - 10, 18, 20, 4); ctx.fill();
        ctx.fillStyle = '#e0f2fe'; ctx.fillRect(px - 5, y - 4, 3, 8); ctx.fillRect(px + 2, y - 4, 3, 8);
        ctx.restore();
      }
    }
    const big = key === 'total';
    text(ctx, lab, 34, y, { size: big ? 26 : 23, weight: big ? 900 : 600, align: 'left', color: '#1f2937' });
    if (key === 'flag') {
      fillRR(ctx, BILL_W - 120, y - 16, 86, 32, 6, o.flag || '#22c55e');
      text(ctx, o.flagLabel || 'VERDE', BILL_W - 77, y + 1, { size: 15, weight: 900, color: '#0b1222' });
    } else {
      let v = val;
      if (key === 'pis' && o.pis) v = o.pis;
      if (key === 'total' && o.total) v = o.total;
      text(ctx, v, BILL_W - 34, y, { size: big ? 30 : 23, weight: big ? 900 : 700, align: 'right', color: big ? '#0b1222' : '#1f2937' });
    }
    if (key === 'tusd' || key === 'cip') { ctx.fillStyle = '#cbd5e1'; ctx.fillRect(30, y + 42, BILL_W - 60, 2); }
  }
  if (o.empty) {
    const k = o.empty, y = 420;
    ctx.save(); ctx.globalAlpha *= k; ctx.setLineDash([10, 8]); ctx.strokeStyle = P.enc; ctx.lineWidth = 3;
    rr(ctx, 14, y - 22, BILL_W - 28, 44, 10); ctx.stroke(); ctx.restore();
    text(ctx, 'Encargos', 34, y, { size: 23, weight: 700, align: 'left', color: P.enc, alpha: k });
    text(ctx, '?', BILL_W - 40, y, { size: 30, weight: 900, align: 'right', color: P.enc, alpha: k });
  }
  // código de barras
  ctx.fillStyle = '#1f2937';
  for (let i = 0; i < 64; i++) if ((i * 7) % 5 !== 0) ctx.fillRect(40 + i * 7, 700, (i % 3) + 1, 26);
  ctx.restore();
}
// Lupa: anel de vidro com cabo, mais um brilho na linha mirada.
function lupa(ctx, x, y, r, a = 1, ang = 0.75) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  fillRR(ctx, r * 0.92, -r * 0.14, r * 1.05, r * 0.28, r * 0.14, '#334155');
  fillRR(ctx, r * 1.25, -r * 0.17, r * 0.75, r * 0.34, r * 0.17, '#1e293b');
  ctx.restore();
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  g.addColorStop(0, 'rgba(255,255,255,0.18)'); g.addColorStop(1, 'rgba(147,197,253,0.08)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
  ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = r * 0.1; ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 20;
  ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.stroke();
  ctx.restore();
}

// ---------------------------------------------------------------- bandeira de verdade, no vento
function flagWave(ctx, x, y, w, h, color, t, o = {}) {
  const N = 26, amp = (o.amp ?? 1) * h * 0.09, sp = o.speed || 5;
  const a = o.alpha ?? 1;
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; const ga = ctx.globalAlpha;
  // mastro
  if (!o.noMast) { fillRR(ctx, x - 8, y - 20, 12, o.mast || 560, 6, '#94a3b8'); circle(ctx, x - 2, y - 24, 11, '#cbd5e1'); }
  for (let i = 0; i < N; i++) {
    const u0 = i / N, u1 = (i + 1) / N;
    const d0 = Math.sin(t * sp - u0 * 7) * amp * u0, d1 = Math.sin(t * sp - u1 * 7) * amp * u1;
    const shade = 0.75 + 0.35 * Math.cos(t * sp - u0 * 7);
    ctx.fillStyle = color; ctx.globalAlpha = ga;
    ctx.beginPath();
    ctx.moveTo(x + w * u0, y + d0); ctx.lineTo(x + w * u1 + 1, y + d1); ctx.lineTo(x + w * u1 + 1, y + h + d1); ctx.lineTo(x + w * u0, y + h + d0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = shade > 1 ? `rgba(255,255,255,${(shade - 1) * 0.6})` : `rgba(0,0,0,${(1 - shade) * 0.5})`;
    ctx.fill();
    if (o.stripe && i > N * 0.0) { ctx.fillStyle = o.stripe; ctx.fillRect(x + w * u0, y + h * 0.42 + d0, w / N + 1, h * 0.16); }
  }
  ctx.restore();
}

// ---------------------------------------------------------------- usina, torres, poste, medidor
function hydro(ctx, x, y, s, t, level = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // represa (água atrás)
  const wl = lerp(60, -120, level);
  fillRR(ctx, -260, wl, 230, 200 - wl, 6, '#1d4ed8', 0.8);
  for (let i = 0; i < 4; i++) { ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(-250, wl + 14 + i * 22 + Math.sin(t * 2 + i) * 3, 200, 3); }
  // barragem
  ctx.fillStyle = '#94a3b8'; ctx.beginPath(); ctx.moveTo(-40, -140); ctx.lineTo(10, -140); ctx.lineTo(90, 200); ctx.lineTo(-40, 200); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#64748b'; for (let i = 0; i < 3; i++) ctx.fillRect(-30, -90 + i * 80, 60 + i * 18, 10);
  // queda d'água
  for (let i = 0; i < 6; i++) {
    const yy = ((t * 260 + i * 60) % 340) - 140;
    fillRR(ctx, 20 + i * 8, yy, 5, 40, 3, '#93c5fd', 0.7);
  }
  fillRR(ctx, 40, 180, 200, 24, 10, '#1e40af', 0.9);
  ctx.restore();
}
function turbine(ctx, x, y, s, t, color = '#e2e8f0') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(8, 0); ctx.lineTo(14, 330); ctx.lineTo(-14, 330); ctx.closePath(); ctx.fill();
  ctx.rotate(t * 1.6);
  for (let i = 0; i < 3; i++) { ctx.rotate(2.094); fillRR(ctx, -7, -170, 14, 170, 7, color); }
  circle(ctx, 0, 0, 16, '#cbd5e1');
  ctx.restore();
}
function solar(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#475569'; ctx.fillRect(-6, 0, 12, 110);
  ctx.transform(1, 0, -0.35, 0.6, 0, 0);
  fillRR(ctx, -150, -150, 300, 150, 8, '#1e3a8a');
  ctx.strokeStyle = '#60a5fa'; ctx.lineWidth = 3;
  for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-150 + i * 50, -150); ctx.lineTo(-150 + i * 50, 0); ctx.stroke(); }
  for (let j = 1; j < 3; j++) { ctx.beginPath(); ctx.moveTo(-150, -150 + j * 50); ctx.lineTo(150, -150 + j * 50); ctx.stroke(); }
  ctx.restore();
}
function thermal(ctx, x, y, s, t, k = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  fillRR(ctx, -110, 40, 220, 160, 8, '#475569');
  ctx.fillStyle = '#64748b'; ctx.beginPath(); ctx.moveTo(-40, 40); ctx.lineTo(-30, -160); ctx.lineTo(10, -160); ctx.lineTo(20, 40); ctx.closePath(); ctx.fill();
  for (let i = 0; i < 7; i++) {
    const ph = (t * 0.45 + i / 7) % 1;
    circle(ctx, -10 + Math.sin(ph * 5 + i) * 30 + ph * 60, -170 - ph * 260, (24 + ph * 60), `rgba(148,163,184,${0.45 * (1 - ph) * k})`);
  }
  ctx.restore();
}
function towerShape(ctx, x, y, h, color, lw = 3) {
  const w = h * 0.36;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x - w / 2, y); ctx.lineTo(x - w * 0.1, y - h); ctx.lineTo(x + w * 0.1, y - h); ctx.lineTo(x + w / 2, y);
  for (let i = 1; i < 5; i++) { const yy = y - (h * i) / 5, ww = lerp(w / 2, w * 0.1, i / 5); ctx.moveTo(x - ww, yy); ctx.lineTo(x + ww, yy + h / 5); ctx.moveTo(x + ww, yy); ctx.lineTo(x - ww, yy + h / 5); }
  ctx.moveTo(x - w * 0.8, y - h * 0.82); ctx.lineTo(x + w * 0.8, y - h * 0.82);
  ctx.moveTo(x - w * 0.6, y - h * 0.65); ctx.lineTo(x + w * 0.6, y - h * 0.65);
  ctx.stroke(); ctx.restore();
}
// Viagem dentro do fio: torres passando em perspectiva, corrente dourada correndo.
function wireTunnel(ctx, t, k, o = {}) {
  if (k <= 0) return;
  const VX = 960, VY = 420, speed = o.speed || 1;
  ctx.save(); ctx.globalAlpha *= k;
  // chão escuro em perspectiva
  ctx.fillStyle = 'rgba(15,23,42,0.6)'; ctx.beginPath(); ctx.moveTo(0, 1080); ctx.lineTo(VX - 40, VY + 20); ctx.lineTo(VX + 40, VY + 20); ctx.lineTo(1920, 1080); ctx.closePath(); ctx.fill();
  const towers = [];
  for (let i = 0; i < 9; i++) {
    const z = ((i / 9) - (t * 0.22 * speed) % 1 + 1) % 1; // 0 = longe, 1 = perto
    towers.push(z);
  }
  towers.sort((a, b) => a - b);
  const tops = [];
  for (const z of towers) {
    const sc = 0.04 + Math.pow(z, 2.2) * 1.6;
    for (const side of [-1, 1]) {
      const x = VX + side * (60 + sc * 520), y = VY + 20 + sc * 420, h = sc * 900;
      if (y - h > 1200) continue;
      towerShape(ctx, x, y, h, `rgba(148,163,184,${0.25 + 0.6 * z})`, 1 + sc * 4);
      tops.push([side, x, y - h * 0.82, z]);
    }
  }
  // cabos ligando o ponto de fuga às torres próximas
  ctx.lineCap = 'round';
  for (const side of [-1, 1]) {
    const pts = tops.filter((p) => p[0] === side).sort((a, b) => a[3] - b[3]);
    ctx.strokeStyle = 'rgba(203,213,225,0.5)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(VX + side * 30, VY - 10);
    for (const p of pts) ctx.lineTo(p[1], p[2]);
    ctx.stroke();
    // pulsos de energia
    for (let j = 0; j < 5; j++) {
      const u = ((t * 0.9 * speed + j / 5) % 1);
      const idx = Math.floor(u * (pts.length - 1));
      if (pts.length < 2) continue;
      const a0 = idx === 0 ? [VX + side * 30, VY - 10] : [pts[idx - 1][1], pts[idx - 1][2]];
      const b0 = [pts[idx][1], pts[idx][2]];
      const f = (u * (pts.length - 1)) % 1;
      const px = lerp(a0[0], b0[0], f), py = lerp(a0[1], b0[1], f);
      ctx.save(); ctx.shadowColor = P.au; ctx.shadowBlur = 30; circle(ctx, px, py, 6 + u * 14, '#fde68a'); ctx.restore();
    }
  }
  ctx.restore();
}
function pole(ctx, x, y, s, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // visto de baixo: poste afinando para cima
  ctx.fillStyle = '#64748b'; ctx.beginPath(); ctx.moveTo(-34, 420); ctx.lineTo(34, 420); ctx.lineTo(12, -380); ctx.lineTo(-12, -380); ctx.closePath(); ctx.fill();
  fillRR(ctx, -240, -340, 480, 20, 6, '#475569');
  for (const dx of [-210, -80, 80, 210]) { fillRR(ctx, dx - 6, -356, 12, 18, 4, '#cbd5e1'); }
  // fios saindo de cada lado
  ctx.strokeStyle = 'rgba(203,213,225,0.65)'; ctx.lineWidth = 3;
  for (const dx of [-210, -80, 80, 210]) { ctx.beginPath(); ctx.moveTo(dx, -350); ctx.quadraticCurveTo(dx * 3, -300, dx * 6, -420); ctx.stroke(); }
  // transformador
  fillRR(ctx, 22, -260, 120, 170, 20, '#94a3b8'); fillRR(ctx, 30, -250, 104, 20, 8, '#cbd5e1');
  for (let i = 0; i < 4; i++) ctx.fillRect(40 + i * 24, -220, 8, 110);
  if (o.glow) { ctx.save(); ctx.globalAlpha *= o.glow; ctx.shadowColor = P.au; ctx.shadowBlur = 40; strokeRR(ctx, 22, -260, 120, 170, 20, P.au, 4); ctx.restore(); }
  ctx.restore();
}
// Medidor de luz com odômetro mecânico (o último dígito rola).
function meter(ctx, x, y, s, value, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  fillRR(ctx, -230, -170, 460, 340, 30, '#1e293b');
  strokeRR(ctx, -230, -170, 460, 340, 30, 'rgba(255,255,255,0.18)', 3);
  text(ctx, 'kWh', 0, -118, { size: 30, weight: 800, color: '#94a3b8' });
  const digits = o.digits || 5, dw = 70;
  const x0 = -(digits * dw) / 2;
  const v = Math.max(0, value);
  for (let i = 0; i < digits; i++) {
    const place = Math.pow(10, digits - 1 - i);
    const raw = v / place;
    const d = Math.floor(raw) % 10;
    const frac = i === digits - 1 ? raw - Math.floor(raw) : 0;
    const dx = x0 + i * dw;
    fillRR(ctx, dx + 4, -60, dw - 8, 110, 8, i === digits - 1 ? '#7f1d1d' : '#0b1222');
    ctx.save(); rr(ctx, dx + 4, -60, dw - 8, 110, 8); ctx.clip();
    for (const [dd, off] of [[d, -frac], [(d + 1) % 10, 1 - frac]]) {
      text(ctx, String(dd), dx + dw / 2, -5 + off * 110, { size: 72, weight: 800, color: '#f8fafc' });
    }
    ctx.restore();
  }
  // disco giratório
  const ang = (o.spin || 0);
  ctx.save(); ctx.translate(0, 110); ctx.scale(1, 0.25);
  fillRR(ctx, -150, -40, 300, 80, 40, '#475569');
  fillRR(ctx, -150 + ((ang * 60) % 300), -40, 20, 80, 6, '#ef4444');
  ctx.restore();
  ctx.restore();
}
function stopwatch(ctx, x, y, r, sec, max, color = P.au) {
  circle(ctx, x, y, r + 10, '#1e293b');
  ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 4;
  for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.283; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r * 0.82, y + Math.sin(a) * r * 0.82); ctx.lineTo(x + Math.cos(a) * r * 0.95, y + Math.sin(a) * r * 0.95); ctx.stroke(); }
  const k = clamp(sec / max);
  ctx.strokeStyle = color; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.shadowColor = color; ctx.shadowBlur = 20;
  ctx.beginPath(); ctx.arc(x, y, r * 0.98, -Math.PI / 2, -Math.PI / 2 + k * 6.283); ctx.stroke();
  ctx.restore();
  fillRR(ctx, x - 18, y - r - 34, 36, 22, 6, '#475569');
  const m = Math.floor(sec / 60), s2 = Math.floor(sec % 60);
  text(ctx, `${m}:${String(s2).padStart(2, '0')}`, x, y + 4, { size: r * 0.42, weight: 900 });
}
function showerHead(ctx, x, y, s, t, on = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 16; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-160, -170); ctx.lineTo(-160, -120); ctx.quadraticCurveTo(-160, -90, -120, -90); ctx.lineTo(-30, -90); ctx.stroke();
  fillRR(ctx, -60, -110, 130, 52, 20, '#cbd5e1');
  fillRR(ctx, -46, -66, 102, 18, 8, '#64748b');
  // resistência acesa
  if (on > 0) fillRR(ctx, -30, -100, 70, 10, 5, hexA('#f97316', 0.6 + 0.4 * Math.sin(t * 20)), on);
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 3; j++) {
      const yy = ((t * 520 + i * 37 + j * 120) % 330) - 40;
      fillRR(ctx, -40 + i * 11 + yy * (i - 4) * 0.04, yy, 4, 26, 2, 'rgba(147,197,253,0.7)', on);
    }
  }
  ctx.restore();
}
function stamp(ctx, x, y, w, h, title, sub, color, k, rot = -0.08) {
  if (k <= 0) return;
  const sc = lerp(1.9, 1, ease.out(clamp(k)));
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 1.6);
  ctx.save(); ctx.shadowColor = color; ctx.shadowBlur = 24; strokeRR(ctx, -w / 2, -h / 2, w, h, 14, color, 6); ctx.restore();
  strokeRR(ctx, -w / 2 + 10, -h / 2 + 10, w - 20, h - 20, 8, hexA(color, 0.6), 2);
  text(ctx, title, 0, sub ? -h * 0.14 : 2, { size: h * 0.3, weight: 900, color, letter: 4 });
  if (sub) text(ctx, sub, 0, h * 0.22, { size: h * 0.19, weight: 800, color: '#f1f5f9' });
  ctx.restore();
}
function bulb(ctx, x, y, r, color, k, base = '#64748b') {
  // vidro
  ctx.save();
  if (k > 0) { ctx.shadowColor = color; ctx.shadowBlur = 26 * k; }
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r);
  g.addColorStop(0, k > 0 ? '#fff' : 'rgba(255,255,255,0.18)');
  g.addColorStop(0.35, k > 0 ? hexA(color, 0.6 + 0.4 * k) : 'rgba(148,163,184,0.12)');
  g.addColorStop(1, k > 0 ? hexA(color, 0.75 * k) : 'rgba(148,163,184,0.08)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
  ctx.restore();
  ctx.save(); ctx.strokeStyle = k > 0 ? hexA(color, 0.9) : 'rgba(148,163,184,0.35)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.stroke(); ctx.restore();
  fillRR(ctx, x - r * 0.45, y + r * 0.78, r * 0.9, r * 0.5, r * 0.12, base);
}
function socketPlate(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 30; fillRR(ctx, -150, -150, 300, 300, 40, '#e2e8f0'); ctx.restore();
  circle(ctx, 0, 0, 100, '#cbd5e1');
  if (!o.covered) { circle(ctx, -34, 10, 16, '#1f2937'); circle(ctx, 34, 10, 16, '#1f2937'); circle(ctx, 0, -38, 16, '#1f2937'); }
  ctx.restore();
}
// "T" (benjamim) com saídas; devolve as posições (mundo) das saídas.
function tAdapter(ctx, x, y, s, k) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * ease.back(clamp(k)), s * ease.back(clamp(k)));
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 30;
  fillRR(ctx, -70, -70, 140, 140, 22, '#f8fafc'); fillRR(ctx, -230, -60, 160, 120, 22, '#f1f5f9'); fillRR(ctx, 70, -60, 160, 120, 22, '#f1f5f9'); fillRR(ctx, -60, -230, 120, 160, 22, '#f1f5f9');
  ctx.restore();
  ctx.restore();
}
// Plugue com cabo e etiqueta. ang = direção do cabo saindo do T.
function plugIn(ctx, cx, cy, ang, len, label, color, k, t) {
  if (k <= 0) return;
  const ex = cx + Math.cos(ang) * len, ey = cy + Math.sin(ang) * len;
  const ins = ease.out(clamp(k));
  // cabo
  ctx.save(); ctx.strokeStyle = '#1f2937'; ctx.lineWidth = 12; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(cx + Math.cos(ang) * 120, cy + Math.sin(ang) * 120);
  ctx.quadraticCurveTo(cx + Math.cos(ang) * len * 0.6 + 30, cy + Math.sin(ang) * len * 0.6 + 40, lerp(cx + Math.cos(ang) * 120, ex, ins), lerp(cy + Math.sin(ang) * 120, ey, ins));
  ctx.stroke();
  ctx.strokeStyle = hexA(color, 0.9); ctx.lineWidth = 4; ctx.setLineDash([10, 16]); ctx.lineDashOffset = t * 60; ctx.shadowColor = color; ctx.shadowBlur = 14;
  ctx.stroke(); ctx.restore();
  // cabeça do plugue (entrando no T)
  const hx = cx + Math.cos(ang) * lerp(220, 135, ins), hy = cy + Math.sin(ang) * lerp(220, 135, ins);
  ctx.save(); ctx.translate(hx, hy); ctx.rotate(ang + Math.PI / 2);
  fillRR(ctx, -28, -22, 56, 44, 10, '#334155'); fillRR(ctx, -14, -36, 8, 16, 2, '#cbd5e1'); fillRR(ctx, 6, -36, 8, 16, 2, '#cbd5e1');
  ctx.restore();
  // etiqueta
  const lk = appear(clamp(k), 0.4, 0.6);
  if (lk > 0) {
    const w = measure(ctx, label, 32, 800) + 60;
    ctx.save(); ctx.translate(ex, ey); ctx.scale(lk, lk);
    ctx.save(); ctx.shadowColor = color; ctx.shadowBlur = 24; fillRR(ctx, -w / 2, -32, w, 64, 32, '#0f172a'); ctx.restore();
    strokeRR(ctx, -w / 2, -32, w, 64, 32, color, 3);
    text(ctx, label, 0, 2, { size: 32, weight: 800 });
    ctx.restore();
  }
}
function globe(ctx, x, y, r, t, o = {}) {
  ctx.save();
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  g.addColorStop(0, '#1e3a8a'); g.addColorStop(1, '#020617');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
  ctx.clip();
  ctx.strokeStyle = 'rgba(148,163,184,0.15)'; ctx.lineWidth = 2;
  for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.ellipse(x, y + i * r * 0.36, r * Math.sqrt(1 - Math.pow(i * 0.36, 2)), r * 0.06, 0, 0, 6.283); ctx.stroke(); }
  const rot = t * 0.35;
  for (let i = 0; i < 6; i++) { const a = rot + i * 0.52; const cx = Math.sin(a); if (Math.cos(a) < 0) continue; ctx.beginPath(); ctx.ellipse(x + cx * 0, y, Math.abs(Math.sin(a)) * r, r, 0, 0, 6.283); ctx.stroke(); }
  // luzes das cidades
  for (let i = 0; i < 260; i++) {
    const lon = (i * 2.399) % 6.283, lat = Math.asin(((i * 0.618) % 2) - 1) * 0.8;
    const a = lon + rot;
    const z = Math.cos(a) * Math.cos(lat);
    if (z <= 0) continue;
    const px = x + Math.sin(a) * Math.cos(lat) * r, py = y - Math.sin(lat) * r;
    circle(ctx, px, py, 1.5 + z * 2, `rgba(253,230,138,${0.3 + 0.6 * z})`);
  }
  // Brasil em destaque
  if (o.br) {
    const a = 0.2, lat = -0.25;
    const px = x + Math.sin(a) * Math.cos(lat) * r * 0.9, py = y - Math.sin(lat) * r;
    ctx.save(); ctx.globalAlpha *= o.br; ctx.shadowColor = P.ok; ctx.shadowBlur = 40;
    ctx.fillStyle = hexA(P.ok, 0.75);
    ctx.beginPath(); ctx.moveTo(px - 50, py - 70); ctx.lineTo(px + 60, py - 60); ctx.lineTo(px + 80, py); ctx.lineTo(px + 30, py + 90); ctx.lineTo(px - 20, py + 110); ctx.lineTo(px - 60, py + 20); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  ctx.restore();
  ctx.save(); ctx.strokeStyle = 'rgba(125,211,252,0.35)'; ctx.lineWidth = 3; ctx.shadowColor = '#38bdf8'; ctx.shadowBlur = 30;
  ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.stroke(); ctx.restore();
}
function lightSwitch(ctx, x, y, s, on, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 24; fillRR(ctx, -70, -110, 140, 220, 22, '#e2e8f0'); ctx.restore();
  fillRR(ctx, -34, -64, 68, 128, 14, '#cbd5e1');
  const ty = lerp(26, -26, on);
  ctx.save(); if (on > 0.5) { ctx.shadowColor = o.glow || P.au; ctx.shadowBlur = 30; }
  fillRR(ctx, -28, ty - 34, 56, 68, 12, on > 0.5 ? '#fef3c7' : '#f8fafc'); ctx.restore();
  if (o.tag) tagB(ctx, 0, -150, 0.75);
  if (o.label) text(ctx, o.label, 0, 0, { size: 34, weight: 900, color: '#0b1222', alpha: 0 });
  ctx.restore();
}
// Etiqueta "B" do canal (símbolo da identidade).
function tagB(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(-0.12);
  ctx.save(); ctx.shadowColor = hexA(P.au, 0.6); ctx.shadowBlur = 24;
  ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.moveTo(-70, 0); ctx.lineTo(-40, -36); ctx.lineTo(62, -36); ctx.quadraticCurveTo(72, -36, 72, -26); ctx.lineTo(72, 26); ctx.quadraticCurveTo(72, 36, 62, 36); ctx.lineTo(-40, 36); ctx.closePath(); ctx.fill(); ctx.restore();
  const cols = [C.petro, C.etanol, C.icms, C.fed, C.dist];
  cols.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(-30 + i * 20, 24, 20, 12); });
  circle(ctx, -46, 0, 7, '#0b1222');
  text(ctx, 'B', 16, -4, { size: 50, weight: 900, color: '#0b1222' });
  ctx.restore();
}
function house(ctx, x, y, s, lit, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#1e293b'; ctx.beginPath(); ctx.moveTo(-260, -40); ctx.lineTo(0, -230); ctx.lineTo(260, -40); ctx.closePath(); ctx.fill();
  fillRR(ctx, -220, -50, 440, 300, 6, '#1e293b');
  fillRR(ctx, 120, -210, 50, 90, 4, '#1e293b');
  const wins = [[-170, 10], [-60, 10], [50, 10], [-170, 130], [50, 130], [-60, 140]];
  wins.forEach(([wx, wy], i) => {
    const k = clamp(lit * wins.length - i);
    const w = i === 5 ? 90 : 100, h = i === 5 ? 110 : 80;
    ctx.save(); if (k > 0) { ctx.shadowColor = '#fde68a'; ctx.shadowBlur = 40 * k; }
    fillRR(ctx, wx, wy, w, h, 6, k > 0 ? `rgba(253,230,138,${0.25 + 0.75 * k})` : '#0b1222');
    ctx.restore();
    if (i < 5) { ctx.fillStyle = 'rgba(30,41,59,0.8)'; ctx.fillRect(wx + w / 2 - 2, wy, 4, h); ctx.fillRect(wx, wy + h / 2 - 2, w, 4); }
  });
  ctx.restore();
}
function personIcon(ctx, x, y, s, color) { miniIcon(ctx, 'person', x, y, s, color); }
function overlaySource(ctx, str, a) { source(ctx, str, a); }
// Corrente dourada (o seu dinheiro) correndo por um caminho de pontos.
// ---------------------------------------------------------------- etiquetas penduradas no fio da conta
const TAGS = [['encargos', P.enc, 360], ['impostos', P.imp, 640], ['subsídios', '#fca5a5', 1280], ['iluminação', '#fdba74', 1560]];
const wireY = (x) => { const u = (x - 220) / 1480; return 200 + 240 * u * (1 - u); };
function hangWire(ctx, t, items) {
  ctx.save(); ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(220, 200); ctx.quadraticCurveTo(960, 320, 1700, 200); ctx.stroke(); ctx.restore();
  items.forEach(([lab, col, x, k, pull = 0], i) => {
    if (k <= 0) return;
    const y = wireY(x), sw = Math.sin(t * 3 + i * 1.7) * 0.07 * Math.max(0, 1 - Math.abs(pull) / 30), len = 60 + pull;
    ctx.save(); ctx.translate(x, y); ctx.rotate(sw); ctx.scale(k, k);
    ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, len); ctx.stroke();
    fillRR(ctx, -125, len, 250, 84, 16, hexA(col, 0.28)); strokeRR(ctx, -125, len, 250, 84, 16, col, 4);
    text(ctx, lab, 0, len + 44, { size: 38, weight: 900 });
    ctx.restore();
  });
}

function current(ctx, pts, t, k = 1, color = P.au, n = 7) {
  if (k <= 0 || pts.length < 2) return;
  ctx.save(); ctx.globalAlpha *= k;
  ctx.strokeStyle = hexA(color, 0.25); ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) ctx.lineTo(p[0], p[1]); ctx.stroke();
  const L = []; let tot = 0;
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
  for (let j = 0; j < n; j++) {
    let u = ((t * 0.35 + j / n) % 1) * tot, i = 0;
    while (i < L.length - 1 && u > L[i]) { u -= L[i]; i++; }
    const f = clamp(u / L[i]);
    const px = lerp(pts[i][0], pts[i + 1][0], f), py = lerp(pts[i][1], pts[i + 1][1], f);
    ctx.save(); ctx.shadowColor = color; ctx.shadowBlur = 24; circle(ctx, px, py, 8, '#fef3c7'); ctx.restore();
  }
  ctx.restore();
}

// ================================================================ Cena 01: gancho
function scene01(K) {
  const tSua = K('sua conta'), tNove = K('nove virgula'), tDobro = K('quase o dobro'), tCulp = K('culpada de sempre'), tBand = K('bandeira tarifaria');
  const tCor = K('aquela cor'), tVerde = K('verde amarela'), tAmar = K('amarela ou'), tVerm = K('ou vermelha') + 0.15;
  const tChove = K('chove pouco'), tMuda = K('muda de cor'), tExtra = K('cobranca extra'), tOut = K('em outubro'), tFicou = K('ficou verde');
  const tZero = K('zero'), tQuem = K('quem foi'), tPra = K('pra descobrir'), tLer = K('ler a conta');
  // a conta cai na mesa, vai para a esquerda quando a bandeira cresce, volta ao centro no fim
  const billPos = (t) => {
    const fall = ease.out(prog(t, tSua - 0.1, 0.8));
    const left = ease.inOut(prog(t, tCor - 0.2, 1.0)) * (1 - ease.inOut(prog(t, tPra - 0.2, 1.0)));
    return { x: lerp(960, 620, left), y: lerp(-500, 480, fall), s: lerp(0.85, 0.8, left), rot: (1 - fall) * 0.4 };
  };
  const flagRow = (t) => { const b = billPos(t); return billRow(b.x, b.y, b.s, 'flag'); };
  const flagColor = (t) => (t < tVerde ? '#22c55e' : t < tAmar ? '#22c55e' : t < tVerm ? '#facc15' : t < tFicou ? '#ef4444' : '#22c55e');
  const cam = [
    { t: 0, x: 960, y: 520, z: 1.05 },
    { t: tNove - 0.2, x: 1100, y: 470, z: 1.08, d: 1.0 },
    { t: tCulp - 0.2, x: 960, y: 520, z: 1.0, d: 1.0 },
    { t: tBand - 0.1, x: 1000, y: 470, z: 1.15, d: 1.1 },
    { t: tCor + 0.2, x: 1060, y: 500, z: 1.0, d: 1.4 },
    { t: tChove - 0.2, x: 1160, y: 470, z: 1.05, d: 1.2 },
    { t: tOut - 0.2, x: 1200, y: 500, z: 1.04, d: 1.2 },
    { t: tZero - 0.1, x: 1180, y: 560, z: 1.06, d: 0.6 },
    { t: tQuem - 0.3, x: 960, y: 520, z: 1.0, d: 0.9 },
    { t: tLer - 0.2, x: 960, y: 520, z: 1.1, d: 1.6 },
  ];
  const sfx = [[tSua, 'paper', 1, { dur: 0.6 }], [tNove, 'meter', 0.8, { dur: 1.0 }], [tDobro, 'pop', 0.7], [tBand, 'swoosh', 0.5],
    [tCor, 'whoosh', 0.7], [tCor + 0.3, 'wind', 0.6, { dur: tFicou - tCor + 2 }], [tVerde, 'click', 0.6], [tAmar, 'click', 0.6], [tVerm, 'click', 0.6],
    [tMuda, 'relay', 0.6], [tExtra, 'coin', 0.6], [tOut, 'key', 0.8], [tOut + 0.6, 'key', 0.8], [tZero, 'impact', 0.8], [tZero + 0.05, 'ding', 0.6],
    [tQuem, 'hit', 0.8], [tLer, 'swoosh', 0.6], [tLer + 0.3, 'paper', 0.5, { dur: 0.4 }]];
  return {
    accent: P.au, cam, sfx, impacts: [tNove + 1.0, tZero, tQuem], trans: 'short',
    draw(ctx, t) {
      const b = billPos(t);
      const dim = 1 - 0.65 * vis(t, tQuem - 0.2, tPra, 0.3, 0.6);
      const hl = { total: vis(t, tNove - 0.1, tCulp, 0.3, 0.5), flag: appear(t, tBand - 0.2, 0.4) * (1 - appear(t, tPra, 0.4)) };
      const growFlag = ease.inOut(prog(t, tCor - 0.1, 0.9));
      bill(ctx, b.x, b.y, b.s, t, { rot: b.rot, hl, alpha: dim, flag: flagColor(t), flagLabel: t < tAmar || t >= tFicou ? 'VERDE' : t < tVerm ? 'AMARELA' : 'VERMELHA', total: 'R$ 199,00' });
      // +9,4%
      const pk = vis(t, tNove - 0.1, tCulp + 0.3);
      if (pk > 0) {
        ctx.save(); ctx.globalAlpha *= pk;
        const v = counting(t, tNove, 1.0, 0, 9.4);
        glowText(ctx, `+${v.toFixed(1).replace('.', ',')}%`, 1500, 360, { size: 130, weight: 900, color: P.enc, glow: hexA(P.enc, 0.7), blur: 50 });
        text(ctx, 'a conta, em 2026', 1500, 450, { size: 34, weight: 700, color: C.muted });
        const ik = appear(t, tDobro, 0.6);
        const hb = 260 * ease.out(prog(t, tNove, 1.0)); fillRR(ctx, 1380, 820 - hb, 90, hb, 14, P.enc);
        fillRR(ctx, 1530, 560 + 260 - 138 * ik, 90, 138 * ik, 14, '#64748b', ik);
        ctx.save(); ctx.translate(0, 820); ctx.scale(1, -1); ctx.restore();
        text(ctx, 'inflação ≈ 5%', 1575, 535 + 260 - 138 * ik, { size: 26, weight: 700, color: '#cbd5e1', alpha: ik });
        ctx.restore();
      }
      // o quadradinho da conta vira uma bandeira de verdade
      if (growFlag > 0) {
        const fr = flagRow(t);
        const x = lerp(fr.x + 160 * b.s, 1240, growFlag), y = lerp(fr.y - 14 * b.s, 250, growFlag);
        const w = lerp(86 * b.s, 420, growFlag), h = lerp(32 * b.s, 260, growFlag);
        const red = t > tChove && t < tFicou;
        flagWave(ctx, x, y, w, h, flagColor(t), t, { alpha: dim * (1 - appear(t, tPra, 0.6)), noMast: growFlag < 0.9, mast: 640, amp: 0.4 + growFlag * 0.8, speed: red ? 8 : 5 });
        // rótulos das cores
        [['verde', tVerde, '#22c55e'], ['amarela', tAmar, '#facc15'], ['vermelha', tVerm, '#ef4444']].forEach(([lab, at, col], i) => {
          const k = vis(t, at, tChove);
          if (k > 0) pill(ctx, 1340 + i * 170, 590, 150, 54, lab, col, k * dim);
        });
        // chove pouco: sol forte e a conta ganha extra
        const ck = vis(t, tChove, tOut);
        if (ck > 0) {
          ctx.save(); ctx.globalAlpha *= ck * dim;
          circle(ctx, 1760, 220, 60 + 4 * Math.sin(t * 3), '#f59e0b');
          ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 6; for (let i = 0; i < 8; i++) { const a = i * 0.785 + t * 0.4; ctx.beginPath(); ctx.moveTo(1760 + Math.cos(a) * 80, 220 + Math.sin(a) * 80); ctx.lineTo(1760 + Math.cos(a) * 110, 220 + Math.sin(a) * 110); ctx.stroke(); }
          text(ctx, 'chove pouco = energia mais cara', 1450, 590, { size: 34, weight: 800, color: '#fbbf24' });
          const ek = appear(t, tExtra, 0.5, ease.back);
          if (ek > 0) { pill(ctx, 1450, 690, 440, 70, '+ cobrança extra', P.enc, ek, { size: 34 }); }
          ctx.restore();
        }
        // outubro e novembro
        const ok = vis(t, tOut - 0.1, tQuem - 0.2);
        if (ok > 0) {
          ctx.save(); ctx.globalAlpha *= ok * dim;
          [['OUT', tOut], ['NOV', tOut + 0.6]].forEach(([m, at], i) => {
            const k = appear(t, at, 0.4, ease.back);
            if (k <= 0) return;
            ctx.save(); ctx.translate(1300 + i * 200, 620); ctx.scale(k, k);
            fillRR(ctx, -80, -60, 160, 120, 16, '#0f172a'); fillRR(ctx, -80, -60, 160, 36, 16, '#22c55e');
            text(ctx, m, 0, -42, { size: 24, weight: 900, color: '#0b1222' }); text(ctx, '2026', 0, 20, { size: 40, weight: 900 });
            ctx.restore();
          });
          const zk = appear(t, tZero, 0.4, ease.back);
          if (zk > 0) { ctx.save(); ctx.translate(1400, 780); ctx.scale(zk, zk); glowText(ctx, 'R$ 0 extra', 0, 0, { size: 84, weight: 900, color: P.ok, glow: hexA(P.ok, 0.7), blur: 40 }); ctx.restore(); shockRing(ctx, t, tZero, 1400, 780, P.ok, 60, 380); }
          ctx.restore();
        }
      }
      // a lupa varre a conta no fim
      const lk = appear(t, tLer - 0.1, 0.4);
      if (lk > 0) {
        const sw = ease.inOut(prog(t, tLer, 1.8));
        lupa(ctx, b.x + 120, lerp(b.y - 260, b.y + 230, sw), 110, lk);
      } else if (t > tBand - 0.3 && t < tCor + 0.2) {
        const fr = flagRow(t);
        lupa(ctx, fr.x + 140, fr.y, 70, vis(t, tBand - 0.3, tCor, 0.3, 0.3));
      }
    },
    overlay(ctx, t) {
      neonText(ctx, 'ENTÃO, QUEM FOI?', W / 2, 520, t, tQuem, { size: 120, weight: 900, color: P.au, until: tPra + 0.2 });
      overlaySource(ctx, t < tCor ? 'Aneel, InfoTarifas (set/2026)' : 'Aneel (out/2026)', vis(t, tNove, tQuem));
    },
  };
}

// ================================================================ Cena 02: o que você está comprando
function scene02(K) {
  const tOq = K('o que voce'), tNaoC = K('nao cobra'), tElaC = K('ela cobra'), tEng = K('coisa de engenheiro'), tChuv = K('chuveiro eletrico'), tOnze = K('onze minutos');
  const tCasa = K('casa media'), tCento = K('cento e oitenta'), tReal = K('um real e dez'), tBanho = K('banho de dez'), tQuase = K('quase um real'), tDuz = K('duzentos reais');
  const BX = 470, BY = 520, BS = 0.82;
  const kwhRow = billRow(BX, BY, BS, 'kwh');
  const cam = [
    { t: 0, x: 620, y: 470, z: 1.12 },
    { t: tElaC - 0.2, x: 960, y: 470, z: 1.05, d: 1.2 },
    { t: tChuv - 0.2, x: 1260, y: 520, z: 1.1, d: 1.2 },
    { t: tCasa - 0.2, x: 1240, y: 540, z: 1.12, d: 1.2 },
    { t: tReal - 0.2, x: 1200, y: 520, z: 1.06, d: 1.0 },
    { t: tDuz - 0.3, x: 760, y: 560, z: 1.08, d: 1.2 },
  ];
  const sfx = [[tOq, 'swoosh', 0.5], [tNaoC + 0.3, 'buzz', 0.4], [tElaC + 0.2, 'neon', 0.6], [tChuv, 'water', 0.8, { dur: Math.max(1.5, tCasa - tChuv) }], [tChuv + 0.2, 'meter', 0.4, { dur: 1.2 }],
    [tOnze, 'ding', 0.6], [tCasa + 0.2, 'meter', 0.8, { dur: Math.max(1, tCento - tCasa + 1) }], [tReal, 'relay', 0.6], [tBanho, 'drop', 0.6], [tQuase, 'coin', 0.7], [tDuz, 'stamp', 0.5]];
  return {
    accent: '#38bdf8', cam, sfx, impacts: [tQuase, tDuz], trans: 'blackout',
    draw(ctx, t) {
      bill(ctx, BX, BY, BS, t, { alpha: 1 - vis(t, tChuv - 0.2, tDuz - 0.4, 0.4, 0.4), hl: { kwh: vis(t, 0.1, tReal), total: appear(t, tDuz - 0.1, 0.4) }, total: 'R$ 199,00' });
      lupa(ctx, kwhRow.x + 150, kwhRow.y, 80, vis(t, 0.2, tCasa));
      // "luz" riscado, "kWh" em neon
      const lz = vis(t, tNaoC, tChuv - 0.2);
      if (lz > 0) {
        ctx.save(); ctx.globalAlpha *= lz;
        text(ctx, '"luz"', 1000, 260, { size: 90, weight: 900, color: '#94a3b8' });
        const st = ease.out(prog(t, tNaoC + 0.3, 0.3));
        ctx.strokeStyle = P.enc; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(900, 262); ctx.lineTo(lerp(900, 1100, st), 262); ctx.stroke();
        ctx.restore();
      }
      neonText(ctx, 'kWh', 1380, 260, t, tElaC + 0.2, { size: 150, weight: 900, color: '#38bdf8', until: tChuv - 0.2 });
      const ek = vis(t, tEng, tChuv - 0.2);
      if (ek > 0) typeText(ctx, 'quilowatt-hora', 1200, 380, t, tEng, 22, { size: 46, weight: 700, color: '#cbd5e1', alpha: ek });
      // chuveiro + cronômetro
      const sk = vis(t, tChuv - 0.1, tCasa);
      if (sk > 0) {
        ctx.save(); ctx.globalAlpha *= sk;
        showerHead(ctx, 1080, 420, 1.1, t, 1);
        const sec = t < tChuv ? 0 : Math.min(660, ((t - tChuv) / Math.max(0.8, tOnze - tChuv + 0.8)) * 660);
        stopwatch(ctx, 1560, 470, 150, sec, 660, '#38bdf8');
        const ok = appear(t, tOnze + 0.1, 0.4, ease.back);
        if (ok > 0) pill(ctx, 1560, 720, 360, 80, '11 min = 1 kWh', '#38bdf8', ok, { size: 40, weight: 900 });
        ctx.restore();
      }
      // medidor até 182
      const mk = vis(t, tCasa, tBanho - 0.2);
      if (mk > 0) {
        ctx.save(); ctx.globalAlpha *= mk;
        const v = t < tCasa + 0.2 ? 0 : counting(t, tCasa + 0.2, Math.max(1, tCento - tCasa + 1), 0, 182);
        meter(ctx, 1280, 460, 1.1, v, { spin: t });
        text(ctx, 'casa média · agosto de 2026', 1280, 235, { size: 32, weight: 700, color: C.muted });
        const lk = appear(t, tReal, 0.4);
        if (lk > 0) { ledText(ctx, 'R$ 1,10 por kWh', 1280, 720, { size: 56, alpha: lk }); text(ctx, 'com impostos', 1280, 778, { size: 28, weight: 600, color: C.muted, alpha: lk }); }
        ctx.restore();
      }
      // banho de 10 min ≈ R$ 1
      const bk = vis(t, tBanho - 0.1, tDuz + 1.5);
      if (bk > 0) {
        ctx.save(); ctx.globalAlpha *= bk;
        const fall = ease.inOut(prog(t, tBanho, 0.8));
        const y = lerp(260, 520, fall);
        if (t < tQuase) {
          ctx.fillStyle = '#93c5fd'; ctx.beginPath(); ctx.moveTo(1300, y - 70); ctx.bezierCurveTo(1340, y - 20, 1350, y + 10, 1300, y + 40); ctx.bezierCurveTo(1250, y + 10, 1260, y - 20, 1300, y - 70); ctx.fill();
        } else {
          const ck = appear(t, tQuase, 0.4, ease.back);
          iconCoin(ctx, 1300, 520, 90 * ck, P.au, 'R$1');
          sparks(ctx, t, tQuase, 1300, 520, P.au, 16);
        }
        text(ctx, 'banho de 10 minutos', 1300, 700, { size: 40, weight: 800 });
        glowText(ctx, '≈ R$ 1', 1300, 770, { size: 60, weight: 900, color: P.au, alpha: appear(t, tQuase, 0.4), glow: hexA(P.au, 0.6) });
        ctx.restore();
      }
    },
    overlay(ctx, t) {
      const dk = appear(t, tDuz, 0.4, ease.back);
      if (dk > 0) pill(ctx, 760, 900 - 120, 380, 84, 'conta ≈ R$ 200', P.au, dk, { size: 40, weight: 900 });
      overlaySource(ctx, 'EPE (ago/2026), tarifas Aneel 2026 · conta do canal', vis(t, tCasa, tDuz + 2));
    },
  };
}

// ================================================================ Cena 03: energia e fio (TE e TUSD)
function scene03(K) {
  const tPrim = K('primeiras linhas'), tDuas = K('duas vezes'), tTT = K('te e tusd'), tTE = K('te e a energia'), tUsina = K('pra usina');
  const tRio = K('de rio'), tVento = K('de vento'), tSol = K('de sol'), tTerm = K('uma termica'), tTU = K('tusd e o fio'), tViag = K('paga a viagem');
  const tTorres = K('torres de transmissao'), tCem = K('cem mil'), tDist = K('e a distribuidora'), tPoste = K('do poste'), tMed = K('seu medidor'), tEq = K('da equipe');
  const tUma = K('uma vez pela'), tOutra = K('outra vez pelo'), tTom = K('sua tomada');
  const pA = (t) => 1 - appear(t, tTE - 0.2, 0.4);
  const pB = (t) => vis(t, tTE - 0.1, tTU - 0.1, 0.5, 0.4);
  const pC = (t) => vis(t, tTU - 0.1, tUma - 0.2, 0.4, 0.4);
  const pD = (t) => appear(t, tUma - 0.2, 0.5);
  const cam = [
    { t: 0, x: 960, y: 480, z: 1.05 },
    { t: tTE - 0.2, x: 960, y: 540, z: 1.0, d: 0.8 },
    { t: tRio, x: 760, y: 540, z: 1.1, d: 1.2 },
    { t: tTerm - 0.2, x: 1240, y: 520, z: 1.08, d: 1.2 },
    { t: tTU - 0.1, x: 960, y: 520, z: 1.0, d: 0.6 },
    { t: tDist - 0.2, x: 960, y: 520, z: 1.05, d: 1.0 },
    { t: tUma - 0.2, x: 960, y: 540, z: 1.0, d: 1.0 },
  ];
  const sfx = [[tPrim, 'swoosh', 0.5], [tDuas, 'pop', 0.7], [tDuas + 0.3, 'pop', 0.7], [tTT, 'key', 0.7], [tTT + 0.4, 'key', 0.7],
    [tTE - 0.2, 'hum', 0.7, { dur: 0.6, f: 900 }], [tRio, 'water', 0.5, { dur: 1.5 }], [tVento, 'wind', 0.4, { dur: 1.4 }], [tSol, 'sparkle', 0.5], [tTerm, 'hit', 0.5],
    [tTU - 0.1, 'hum', 0.9, { dur: Math.max(1.5, tDist - tTU), f: 380 }], [tTorres, 'whoosh', 0.6], [tTorres + 1.2, 'whoosh', 0.5], [tCem, 'meter', 0.6, { dur: 1 }],
    [tDist, 'spark', 0.6], [tPoste, 'hum', 0.5, { dur: 1.2, f: 600 }], [tMed, 'relay', 0.6], [tEq, 'pop', 0.6], [tUma, 'pop', 0.7], [tOutra, 'pop', 0.7], [tTom, 'switch', 0.8]];
  return {
    accent: P.tra, cam, sfx, impacts: [tTom], trans: 'through',
    draw(ctx, t) {
      // A: as duas linhas da conta
      const a = pA(t);
      if (a > 0) {
        ctx.save(); ctx.globalAlpha *= a;
        const s = 1.0;
        bill(ctx, 960, 480, s, t, { hl: { te: appear(t, tPrim, 0.4), tusd: appear(t, tPrim + 0.3, 0.4) }, hlColor: { te: P.ger, tusd: P.tra } });
        const te = billRow(960, 480, s, 'te'), tu = billRow(960, 480, s, 'tusd');
        const dk = appear(t, tDuas, 0.4, ease.back);
        if (dk > 0) { pill(ctx, te.x + 360, te.y, 110, 56, '×1', P.ger, dk); pill(ctx, tu.x + 360, tu.y, 110, 56, '×2', P.tra, appear(t, tDuas + 0.3, 0.4, ease.back)); }
        const nk = appear(t, tTT, 0.4);
        if (nk > 0) { neonText(ctx, 'TE', te.x - 380, te.y, t, tTT, { size: 64, weight: 900, color: P.ger }); neonText(ctx, 'TUSD', tu.x - 410, tu.y, t, tTT + 0.4, { size: 64, weight: 900, color: P.tra }); }
        ctx.restore();
      }
      // B: TE = a energia (a usina)
      const b = pB(t);
      if (b > 0) {
        ctx.save(); ctx.globalAlpha *= b;
        fillRR(ctx, -200, 760, 2400, 400, 0, 'rgba(15,23,42,0.7)');
        hydro(ctx, 560, 560, 1.15, t, 1);
        const vk = appear(t, tVento, 0.6, ease.back); if (vk > 0) { ctx.save(); ctx.globalAlpha *= vk; turbine(ctx, 1000, 440, 0.95, t); ctx.restore(); }
        const sk = appear(t, tSol, 0.6, ease.back); if (sk > 0) { ctx.save(); ctx.globalAlpha *= sk; solar(ctx, 1320, 660, 0.9); ctx.restore(); }
        const tk = appear(t, tTerm, 0.6, ease.back); if (tk > 0) { ctx.save(); ctx.globalAlpha *= tk; thermal(ctx, 1640, 580, 0.9, t, tk); ctx.restore(); }
        current(ctx, [[660, 740], [1000, 760], [1320, 770], [1640, 780], [2000, 780]], t, appear(t, tUsina, 0.5));
        ctx.restore();
      }
      // C: TUSD = o fio (viagem dentro do fio)
      const c = pC(t);
      if (c > 0) {
        const pk = appear(t, tDist - 0.2, 0.6);
        wireTunnel(ctx, t, c * (1 - pk), { speed: 1.4 });
        const tk = vis(t, tTorres, tDist - 0.2);
        if (tk > 0) { ctx.save(); ctx.globalAlpha *= tk * c; if (t > tCem - 0.1) text(ctx, 'mais de', 960, 640, { size: 36, weight: 700, color: C.muted }); const v = t < tCem ? 0 : counting(t, tCem, 1.0, 0, 100000); if (t > tCem - 0.1) ledText(ctx, `${Math.round(v).toLocaleString('pt-BR')} km`, 960, 720, { size: 80, color: P.tra }); ctx.restore(); }
        if (pk > 0) {
          ctx.save(); ctx.globalAlpha *= pk * c;
          pole(ctx, 760, 600, 0.95, t, { glow: appear(t, tPoste, 0.4) });
          const mk = appear(t, tMed, 0.5, ease.back);
          if (mk > 0) { ctx.save(); ctx.translate(1300, 470); ctx.scale(mk, mk); meter(ctx, 0, 0, 0.55, 182, { spin: t }); ctx.restore(); }
          const ek = appear(t, tEq, 0.5, ease.back);
          if (ek > 0) { ctx.save(); ctx.globalAlpha *= ek; iconTruck(ctx, 1480, 740, 220 * ek, '#e2e8f0', P.dis); fillRR(ctx, 1380, 640, 200, 12, 6, '#94a3b8'); personIcon(ctx, 1220, 730, 90, P.dis); ctx.restore(); }
          ctx.restore();
        }
      }
      // D: as duas metades, lado a lado
      const d = pD(t);
      if (d > 0) {
        ctx.save(); ctx.globalAlpha *= d;
        fillRR(ctx, 120, 200, 820, 560, 30, hexA(P.ger, 0.1)); strokeRR(ctx, 120, 200, 820, 560, 30, hexA(P.ger, 0.6), 3);
        fillRR(ctx, 980, 200, 820, 560, 30, hexA(P.tra, 0.1 * appear(t, tOutra, 0.4))); strokeRR(ctx, 980, 200, 820, 560, 30, hexA(P.tra, 0.6), 3, appear(t, tOutra, 0.4));
        ctx.save(); ctx.beginPath(); ctx.rect(120, 200, 820, 560); ctx.clip(); hydro(ctx, 440, 500, 0.8, t); turbine(ctx, 760, 420, 0.6, t); ctx.restore();
        glowText(ctx, 'TE · a energia', 530, 690, { size: 52, weight: 900, color: P.ger, glow: hexA(P.ger, 0.6) });
        const ok = appear(t, tOutra, 0.4);
        if (ok > 0) {
          ctx.save(); ctx.globalAlpha *= ok; ctx.beginPath(); ctx.rect(980, 200, 820, 560); ctx.clip();
          towerShape(ctx, 1180, 640, 360, '#94a3b8', 4); pole(ctx, 1560, 540, 0.45, t); ctx.restore();
          glowText(ctx, 'TUSD · o caminho', 1390, 690, { size: 52, weight: 900, color: P.tra, glow: hexA(P.tra, 0.6), alpha: ok });
        }
        const sk = appear(t, tTom, 0.4, ease.back);
        if (sk > 0) { ctx.save(); ctx.translate(960, 480); ctx.scale(sk * 0.6, sk * 0.6); socketPlate(ctx, 0, 0, 1); ctx.restore(); shockRing(ctx, t, tTom, 960, 480, P.au, 60, 300); }
        ctx.restore();
      }
    },
    overlay(ctx, t) {
      neonText(ctx, 'TE = a energia', W / 2, 150, t, tTE, { size: 64, weight: 900, color: P.ger, until: tTU - 0.2 });
      neonText(ctx, 'TUSD = o fio', W / 2, 150, t, tTU, { size: 64, weight: 900, color: P.tra, until: tUma - 0.3 });
      const lk = vis(t, tDist, tUma - 0.3);
      if (lk > 0) text(ctx, 'distribuidora: poste, medidor e equipe', W / 2, 230, { size: 34, weight: 700, color: '#d8b4fe', alpha: lk });
      overlaySource(ctx, 'Aneel', vis(t, tTorres, tUma));
    },
  };
}

// ================================================================ Cena 04: o que a conta esconde
const PLUGS = [['Tarifa social', 'tarifa social', P.ok], ['Luz para Todos', 'luz para todos', '#38bdf8'], ['Irrigação rural', 'fazenda que irriga', '#a3e635'],
  ['Água e esgoto', 'agua e esgoto', '#22d3ee'], ['Usinas a carvão', 'usina a carvao', '#94a3b8'], ['Placas solares', 'placa solar', P.au]];
function scene04(K) {
  const tTeste = K('faz um teste'), tPal = K('palavra encargo'), tNao = K('nao vai achar'), tEsc = K('escondido dentro'), tLei = K('criadas por lei'), tOut = K('outras pessoas');
  const tNuma = K('numa tomada'), tCheio = K('cheio de plugues');
  const tp = PLUGS.map(([, cue]) => K(cue));
  const tDobrou = K('quase dobrou'), t37 = K('tres bilhoes'), t69 = K('seis bilhoes'), t48 = K('quarenta e oito'), tSem = K('sem ver');
  const SX = 900, SY = 540;
  const angs = [-2.55, -2.0, -1.15, -0.62, -0.12, 3.14];
  const phSearch = (t) => 1 - appear(t, tEsc - 0.2, 0.4);
  const phXray = (t) => vis(t, tEsc - 0.1, tNuma - 0.2, 0.4, 0.4);
  const phSocket = (t) => vis(t, tNuma - 0.1, t48 - 0.3, 0.4, 0.4);
  const phBig = (t) => appear(t, t48 - 0.2, 0.4);
  const cam = [
    { t: 0, x: 960, y: 470, z: 1.2 },
    { t: tEsc - 0.2, x: 960, y: 500, z: 1.0, d: 0.8 },
    { t: tNuma - 0.1, x: 900, y: 540, z: 1.25, d: 1.0 },
    { t: tCheio + 0.3, x: 960, y: 500, z: 1.0, d: 1.2 },
    ...tp.map((tt, i) => ({ t: tt - 0.15, x: 960 + Math.cos(angs[i]) * 60, y: 520 + Math.sin(angs[i]) * 40, z: 1.02, d: 0.7 })),
    { t: tDobrou - 0.1, x: 1100, y: 520, z: 1.05, d: 1.0 },
    { t: t48 - 0.2, x: 960, y: 500, z: 1.1, d: 1.0 },
    { t: tSem - 0.2, x: 960, y: 520, z: 1.0, d: 1.2 },
  ];
  const typed = 'encargo';
  const sfx = [[tTeste, 'switch', 0.6], ...typed.split('').map((_, i) => [tPal + 0.15 + i * 0.07, 'key', 0.7]), [tNao, 'buzz', 0.6],
    [tEsc - 0.1, 'hum', 0.6, { dur: 1.2, f: 1200 }], [tLei, 'stamp', 0.5], [tOut, 'swoosh', 0.5], [tNuma, 'whoosh', 0.6], [tCheio, 'relay', 0.7],
    ...tp.flatMap((tt) => [[tt, 'switch', 0.8], [tt + 0.08, 'spark', 0.6, { n: 4 }]]), [tDobrou, 'riser', 0.35, { dur: Math.max(0.8, t69 - tDobrou) }], [t37, 'pop', 0.7], [t69, 'impact', 0.7],
    [t48, 'spark', 0.9, { n: 8 }], [t48 + 0.05, 'impact', 0.9], [tSem, 'poweroff', 0.4]];
  return {
    accent: P.enc, cam, sfx, impacts: [tNao, t69, t48 + 0.05], trans: 'short',
    draw(ctx, t) {
      // A: a busca vazia
      const a = phSearch(t);
      if (a > 0) {
        ctx.save(); ctx.globalAlpha *= a;
        bill(ctx, 960, 520, 0.7, t, { alpha: 0.45 });
        const bk = appear(t, tTeste, 0.5, ease.back);
        ctx.save(); ctx.translate(960, 420); ctx.scale(bk, bk);
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 40; fillRR(ctx, -460, -60, 920, 120, 60, '#f8fafc'); ctx.restore();
        ctx.strokeStyle = '#64748b'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(-380, -6, 22, 0, 6.283); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-364, 10); ctx.lineTo(-346, 28); ctx.stroke();
        typeText(ctx, typed, -320, 2, t, tPal + 0.15, 14, { size: 56, weight: 700, color: '#0f172a' });
        ctx.restore();
        const nk = appear(t, tNao, 0.3, ease.back);
        if (nk > 0) { ctx.save(); ctx.translate(960, 560); ctx.scale(nk, nk); fillRR(ctx, -240, -40, 480, 80, 18, hexA(P.enc, 0.25)); text(ctx, '0 resultados', 0, 2, { size: 44, weight: 900, color: '#fca5a5' }); ctx.restore(); }
        ctx.restore();
      }
      // B: raio-X da TE e da TUSD
      const x = phXray(t);
      if (x > 0) {
        ctx.save(); ctx.globalAlpha *= x;
        bill(ctx, 760, 500, 0.85, t, { xray: appear(t, tEsc, 0.6) });
        const te = billRow(760, 500, 0.85, 'te');
        const lk = appear(t, tLei, 0.5);
        if (lk > 0) { ctx.save(); ctx.globalAlpha *= lk; text(ctx, 'cobranças criadas por lei', 1440, 300, { size: 44, weight: 900, color: '#fca5a5' }); text(ctx, 'escondidas dentro da TE e da TUSD', 1440, 360, { size: 32, weight: 600, color: C.muted }); ctx.restore(); }
        const ok = appear(t, tOut, 0.6);
        if (ok > 0) {
          const dests = [[1300, 560], [1480, 620], [1660, 560], [1400, 760], [1600, 780]];
          dests.forEach(([dx, dy], i) => {
            current(ctx, [[te.x + 260, te.y + 20], [dx, dy]], t + i * 0.2, ok, P.enc, 3);
            if (i % 2) { ctx.save(); ctx.globalAlpha *= ok; iconBank(ctx, dx, dy, 70, '#fca5a5'); ctx.restore(); } else personIcon(ctx, dx, dy, 70, '#fca5a5');
          });
        }
        ctx.restore();
      }
      // C: a tomada com o T cheio de plugues
      const s = phSocket(t);
      if (s > 0) {
        ctx.save(); ctx.globalAlpha *= s;
        socketPlate(ctx, SX, SY, 1.25, { covered: t > tCheio });
        tAdapter(ctx, SX, SY, 0.8, appear(t, tCheio - 0.1, 0.4));
        PLUGS.forEach(([lab, , col], i) => plugIn(ctx, SX, SY, angs[i], i === 5 ? 470 : i === 4 ? 430 : 330, lab, col, prog(t, tp[i] - 0.15, 0.55), t));
        // o seu dinheiro entrando pela tomada
        current(ctx, [[SX, 900], [SX, SY + 120]], t, appear(t, tCheio, 0.5), P.au, 4);
        const gk = appear(t, tDobrou, 0.5);
        if (gk > 0) {
          ctx.save(); ctx.globalAlpha *= gk;
          fillRR(ctx, 1320, 590, 480, 280, 24, 'rgba(15,23,42,0.92)'); strokeRR(ctx, 1320, 590, 480, 280, 24, hexA(P.au, 0.6), 3);
          text(ctx, 'desconto das placas solares', 1560, 625, { size: 26, weight: 700, color: C.muted });
          const h1 = 100 * appear(t, t37, 0.5), h2 = 186 * ease.out(prog(t, t69, 0.8));
          fillRR(ctx, 1400, 800 - h1, 110, h1, 10, '#a16207'); fillRR(ctx, 1610, 800 - h2, 110, h2, 10, P.au);
          text(ctx, '2025', 1455, 820, { size: 22, weight: 700, color: C.muted }); text(ctx, '2026', 1665, 820, { size: 22, weight: 700, color: C.muted });
          text(ctx, 'R$ 3,7 bi', 1455, 780 - h1, { size: 30, weight: 900, alpha: appear(t, t37, 0.4) });
          text(ctx, 'R$ 6,9 bi', 1665, 780 - h2, { size: 30, weight: 900, color: P.au, alpha: appear(t, t69, 0.4) });
          ctx.restore();
        }
        ctx.restore();
      }
      // D: o tamanho da tomada inteira
      const g = phBig(t);
      if (g > 0) {
        ctx.save(); ctx.globalAlpha *= g;
        const fade = 1 - 0.7 * appear(t, tSem - 0.2, 0.5);
        ctx.save(); ctx.globalAlpha *= fade;
        text(ctx, 'em 2026, essa tomada custa', 960, 300, { size: 40, weight: 700, color: C.muted });
        boltText(ctx, 'R$ 48 bilhões', 960, 430, t, t48, 1.1, { size: 140, color: P.enc });
        text(ctx, 'tirados das tarifas', 960, 540, { size: 40, weight: 700, color: '#fca5a5', alpha: appear(t, t48 + 1, 0.5) });
        ctx.restore();
        const bk = appear(t, tSem - 0.1, 0.6);
        if (bk > 0) bill(ctx, 960, 560 + (1 - bk) * 80, 0.62, t, { empty: appear(t, tSem + 0.3, 0.5), alpha: bk });
        ctx.restore();
      }
    },
    overlay(ctx, t) { overlaySource(ctx, t < tDobrou ? 'Aneel: CDE 2026' : 'Aneel (out/2026), eixos', vis(t, tNuma, tSem + 2)); },
  };
}

// ================================================================ Cena 05: os três governos e a luz do poste
function scene05(K) {
  const tLa = K('la embaixo'), tTres = K('tres governos'), tEst = K('o estado cobra'), t18 = K('dezoito por cento'), tUni = K('a uniao cobra');
  const tComp = K('comparar duas'), tMuda = K('muda todo mes'), tErro = K('nao e erro'), tDesc = K('a distribuidora desconta'), tPref = K('a prefeitura');
  const tPoste = K('luz do poste'), tRio = K('no rio'), t370 = K('trezentos e setenta'), t45 = K('quarenta e cinco'), tAntes = K('antes eram');
  const tSo = K('so o que aparece'), tUsina = K('a usina a transmissora'), tEmb = K('embutido');
  const pA = (t) => 1 - appear(t, tComp - 0.2, 0.4);
  const pB = (t) => vis(t, tComp - 0.1, tPref - 0.2, 0.4, 0.4);
  const pC = (t) => vis(t, tPref - 0.1, tSo - 0.2, 0.4, 0.4);
  const pD = (t) => appear(t, tSo - 0.2, 0.5);
  const stamps = [['ESTADO', 'ICMS ≈ 18%', P.imp], ['UNIÃO', 'PIS / COFINS', '#fb923c'], ['PREFEITURA', 'iluminação pública', '#fdba74']];
  const cam = [
    { t: 0, x: 760, y: 360, z: 1.15 },
    { t: tLa, x: 820, y: 620, z: 1.1, d: 1.4 },
    { t: tTres, x: 1000, y: 560, z: 1.0, d: 1.0 },
    { t: tComp - 0.1, x: 960, y: 520, z: 1.0, d: 0.8 },
    { t: tPref - 0.1, x: 960, y: 500, z: 1.05, d: 1.0 },
    { t: tRio - 0.2, x: 1060, y: 520, z: 1.02, d: 1.0 },
    { t: tSo - 0.2, x: 960, y: 540, z: 1.0, d: 1.0 },
  ];
  const months = [['AGO', '5,1%'], ['SET', '4,6%'], ['OUT', '5,4%']];
  const sfx = [[tLa, 'paper', 0.6, { dur: 0.6 }], [tEst, 'stamp', 1], [tUni, 'stamp', 1], [tComp, 'paper', 0.5], [tComp + 0.3, 'paper', 0.5], [tMuda, 'relay', 0.6], [tMuda + 0.4, 'relay', 0.5],
    [tErro, 'ding', 0.6], [tDesc, 'coin', 0.6], [tPref, 'stamp', 1], [tPoste, 'poweron', 0.7], [tPoste + 0.5, 'hum', 0.4, { dur: 2, f: 500 }], [tRio, 'pop', 0.7], [t45, 'impact', 0.7], [tAntes, 'drop', 0.5],
    [tUsina + 0.3, 'stamp', 0.5], [tUsina + 0.8, 'stamp', 0.5], [tUsina + 1.3, 'stamp', 0.5], [tEmb, 'hit', 0.6]];
  return {
    accent: P.imp, cam, sfx, impacts: [tEst, tUni, tPref, t45], trans: 'blackout',
    draw(ctx, t) {
      const a = pA(t);
      if (a > 0 || pC(t) > 0) {
        ctx.save(); ctx.globalAlpha *= Math.max(a, 0);
        bill(ctx, 760, 520, 1.0, t, { hl: { icms: appear(t, tEst, 0.4), pis: appear(t, tUni, 0.4), cip: 0 }, hlColor: { icms: P.imp, pis: '#fb923c' } });
        ctx.restore();
      }
      const stampK = (i) => [prog(t, tEst, 0.3), prog(t, tUni, 0.3), prog(t, tPref, 0.3)][i];
      if (a > 0) {
        ctx.save(); ctx.globalAlpha *= a;
        const tk = appear(t, tTres, 0.5);
        text(ctx, '3 governos na mesma conta', 1440, 250, { size: 40, weight: 800, alpha: tk });
        stamps.forEach(([ti, su, col], i) => { strokeRR(ctx, 1220, 320 + i * 170, 440, 140, 14, `rgba(148,163,184,${0.25 * tk})`, 2); if (i < 2) stamp(ctx, 1440, 390 + i * 170, 420, 130, ti, su, col, stampK(i), [-0.06, 0.05][i]); });
        const vk = appear(t, t18, 0.4);
        if (vk > 0) text(ctx, 'na maioria dos estados', 1440, 470, { size: 22, weight: 600, color: C.muted, alpha: vk });
        ctx.restore();
      }
      // B: três contas, a porcentagem muda
      const b = pB(t);
      if (b > 0) {
        ctx.save(); ctx.globalAlpha *= b;
        months.forEach(([m, pct], i) => {
          const k = appear(t, tComp + i * 0.25, 0.5);
          const x = 480 + i * 480;
          bill(ctx, x, 470 + (1 - k) * 60, 0.55, t, { alpha: k, pis: pct, hl: { pis: 0.6 + 0.4 * Math.sin(t * 6 + i) * appear(t, tMuda, 0.3) }, hlColor: { pis: '#fb923c' } });
          pill(ctx, x, 165, 140, 50, m, '#94a3b8', k, { size: 26 });
          const pr = billRow(x, 470, 0.55, 'pis');
          if (appear(t, tMuda, 0.3) > 0) pill(ctx, x + 210, pr.y, 140, 56, pct, '#fb923c', appear(t, tMuda + i * 0.15, 0.3, ease.back), { size: 32, weight: 900 });
        });
        const ek = appear(t, tErro, 0.4, ease.back);
        if (ek > 0) pill(ctx, 960, 820 - 40, 360, 76, '✓ não é erro', P.ok, ek, { size: 38, weight: 900 });
        const dk = appear(t, tDesc, 0.5);
        if (dk > 0) { ctx.save(); ctx.globalAlpha *= dk; text(ctx, 'a distribuidora desconta o imposto que já pagou', 960, 690, { size: 30, weight: 700, color: '#fdba74' }); ctx.restore(); }
        ctx.restore();
      }
      // C: a prefeitura e a luz do poste
      const c = pC(t);
      if (c > 0) {
        ctx.save(); ctx.globalAlpha *= c;
        const night = appear(t, tPoste - 0.3, 0.6);
        fillRR(ctx, -400, -400, 2800, 1900, 0, `rgba(2,6,23,${0.55 * night})`);
        stamp(ctx, 640, 250, 460, 130, 'PREFEITURA', 'iluminação pública', '#fdba74', stampK(2), -0.05);
        // poste de rua acendendo
        const lx = 560, ly = 330;
        fillRR(ctx, lx - 12, ly, 24, 520, 8, '#64748b'); fillRR(ctx, lx - 12, ly, 170, 18, 8, '#64748b');
        const on = appear(t, tPoste, 0.3);
        fillRR(ctx, lx + 120, ly + 10, 80, 30, 10, on > 0 ? '#fef3c7' : '#334155');
        if (on > 0) {
          ctx.save(); ctx.globalAlpha *= on * 0.55;
          const g = ctx.createRadialGradient(lx + 160, ly + 40, 10, lx + 160, ly + 300, 420);
          g.addColorStop(0, 'rgba(254,243,199,0.8)'); g.addColorStop(1, 'rgba(254,243,199,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(lx + 130, ly + 40); ctx.lineTo(lx + 190, ly + 40); ctx.lineTo(lx + 420, ly + 540); ctx.lineTo(lx - 100, ly + 540); ctx.closePath(); ctx.fill();
          ctx.restore();
          current(ctx, [[lx + 160, ly + 30], [900, 380], [1000, 520]], t, on, '#fdba74', 4);
          house(ctx, 1000, 640, 0.55, 1, t);
          text(ctx, 'a luz do poste vem na sua conta', 1000, 860 - 60, { size: 30, weight: 700, color: '#fdba74', alpha: on });
        }
        const rk = appear(t, tRio, 0.5, ease.back);
        if (rk > 0) {
          ctx.save(); ctx.translate(1530, 470); ctx.scale(rk, rk);
          fillRR(ctx, -260, -200, 520, 400, 28, 'rgba(15,23,42,0.95)'); strokeRR(ctx, -260, -200, 520, 400, 28, hexA('#fdba74', 0.6), 3);
          text(ctx, 'Rio de Janeiro · 2026', 0, -150, { size: 30, weight: 800, color: C.muted });
          text(ctx, 'conta de ~R$ 370', 0, -95, { size: 34, weight: 800, alpha: appear(t, t370, 0.4) });
          text(ctx, 'iluminação pública', 0, -30, { size: 28, weight: 600, color: C.muted });
          const v = t < t45 ? 19 : counting(t, t45, 0.8, 19, 45);
          glowText(ctx, `R$ ${Math.round(v)}`, 0, 60, { size: 110, weight: 900, color: '#fdba74', glow: hexA('#fdba74', 0.6) });
          const ak = appear(t, tAntes, 0.4);
          if (ak > 0) { text(ctx, 'antes: R$ 19', 0, 150, { size: 32, weight: 700, color: C.muted, alpha: ak }); ctx.save(); ctx.strokeStyle = P.enc; ctx.lineWidth = 4; ctx.globalAlpha *= ak; ctx.beginPath(); ctx.moveTo(-110, 152); ctx.lineTo(110, 152); ctx.stroke(); ctx.restore(); }
          ctx.restore();
        }
        ctx.restore();
      }
      // D: impostos também no caminho
      const d = pD(t);
      if (d > 0) {
        ctx.save(); ctx.globalAlpha *= d;
        const xs = [380, 960, 1540];
        current(ctx, [[180, 620], [380, 620], [960, 620], [1540, 620], [1760, 620]], t, 1, P.au, 6);
        hydro(ctx, xs[0], 500, 0.55, t); towerShape(ctx, xs[1], 680, 330, '#94a3b8', 4); pole(ctx, xs[2], 520, 0.4, t);
        ['usina', 'transmissora', 'distribuidora'].forEach((lab, i) => {
          text(ctx, lab, xs[i], 760, { size: 32, weight: 700, color: C.muted });
          stamp(ctx, xs[i] + 90, 330, 200, 76, 'IMPOSTO', null, P.imp, prog(t, tUsina + 0.3 + i * 0.5, 0.3), [-0.1, 0.06, -0.04][i]);
        });
        const ek = appear(t, tEmb, 0.5);
        if (ek > 0) pill(ctx, 960, 180, 760, 80, 'já vem embutido na tarifa', P.imp, ek, { size: 38, weight: 900 });
        ctx.restore();
      }
    },
    overlay(ctx, t) { overlaySource(ctx, t < tPref ? 'distribuidoras, Energisa' : t < tSo ? 'Veja Rio, Extra (2026)' : 'PwC / Instituto Acende Brasil', vis(t, tEst, tEmb + 2)); },
  };
}

function pill(ctx, x, y, w, h, label, color, k, o = {}) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  fillRR(ctx, -w / 2, -h / 2, w, h, h / 2, 'rgba(15,23,42,0.92)');
  fillRR(ctx, -w / 2, -h / 2, w, h, h / 2, hexA(color, 0.16));
  ctx.save(); ctx.shadowColor = color; ctx.shadowBlur = o.glow ?? 22; strokeRR(ctx, -w / 2, -h / 2, w, h, h / 2, color, 3); ctx.restore();
  text(ctx, label, 0, 2, { size: o.size || 30, weight: o.weight || 800, color: o.color || C.text });
  ctx.restore();
}

// ================================================================ Cena 06: imagina (as 100 lâmpadas)
const GROUPS = [['usina', 28, P.ger, 'vinte e oito'], ['torres', 7, P.tra, 'sete pras'], ['distribuidora', 20, P.dis, 'vinte pra'], ['encargos', 15, P.enc, 'quinze sao'], ['impostos', 30, P.imp, 'trinta sao']];
function scene06(K) {
  const tIm = K('agora imagina'), tCem = K('cem lampadas'), tVale = K('cada uma vale'), tg = GROUPS.map((g) => K(g[3]));
  const t55 = K('cinquenta e cinco'), tEF = K('energia e fio'), tOutras = K('as outras'), tQM = K('quase metade');
  const GX = 610, GY = 190, DX = 70, DY = 68, R = 24;
  // ordem de acendimento: cada grupo acende nas suas lâmpadas, durante a fala do número
  const owner = []; GROUPS.forEach(([, n], gi) => { for (let i = 0; i < n; i++) owner.push(gi); });
  const lightAt = []; let idx = 0;
  GROUPS.forEach(([, n], gi) => { const d = gi >= 3 ? 0.9 : Math.min(1.4, 0.05 * n + 0.3); for (let i = 0; i < n; i++) lightAt.push(tg[gi] + (i / n) * d); idx += n; });
  const cam = [{ t: 0, x: 960, y: 500, z: 1.25 }, { t: tCem, x: 960, y: 500, z: 1.0, d: 1.6 }, { t: tg[0] - 0.2, x: 960, y: 460, z: 1.03, d: 1.2 },
    { t: t55 - 0.2, x: 1060, y: 460, z: 1.02, d: 1.0 }, { t: tOutras - 0.2, x: 960, y: 540, z: 1.06, d: 1.0 }, { t: tQM - 0.3, x: 960, y: 500, z: 1.0, d: 1.6 }];
  const sfx = [[tIm, 'poweroff', 0.3], [tCem, 'hum', 0.4, { dur: 1.5, f: 300 }], [tVale, 'coin', 0.5],
    ...lightAt.map((at, i) => [at, 'bulb', owner[i] >= 3 ? 0.32 : 0.45, { p: 0.85 + (i % 7) * 0.05 }]),
    [t55, 'pop', 0.7], [tOutras, 'riser', 0.3, { dur: Math.max(0.6, tg[3] - tOutras) }], [tg[3] + 0.9, 'impact', 0.9], [tQM, 'hit', 0.6]];
  return {
    accent: P.au, cam, sfx, impacts: [tg[3] + 0.9], trans: 'blackout', hideWorldUntil: 0.35,
    draw(ctx, t) {
      const wall = appear(t, tCem - 0.2, 0.8);
      // a conta se pendura no meio da parede e some
      const bk = vis(t, 0.3, tCem + 0.4, 0.4, 0.6);
      if (bk > 0) bill(ctx, 960, 520, 0.6, t, { alpha: bk });
      const dimEF = appear(t, tQM, 0.8);
      for (let i = 0; i < 100; i++) {
        const r0 = Math.floor(i / 10), c0 = i % 10;
        const x = GX + c0 * DX, y = GY + r0 * DY;
        const gi = owner[i];
        const lk = clamp((t - lightAt[i]) / 0.12);
        const k = lk * (gi < 3 ? 1 - 0.7 * dimEF : 1);
        bulb(ctx, x, y, R * (0.6 + 0.4 * wall), GROUPS[gi][2], k * wall);
        if (wall < 1) { ctx.save(); ctx.globalAlpha *= 1 - wall; ctx.restore(); }
      }
      // placar à direita
      const px = 1400;
      GROUPS.forEach(([lab, n, col], gi) => {
        const k = appear(t, tg[gi], 0.4);
        if (k <= 0) return;
        const y = 230 + gi * 92 + (gi >= 3 ? 70 : 0);
        ctx.save(); ctx.translate((1 - k) * 60, 0);
        bulb(ctx, px, y, 18, col, 1);
        text(ctx, lab, px + 40, y, { size: 34, weight: 700, align: 'left', alpha: k * (gi < 3 ? 1 - 0.5 * dimEF : 1) });
        text(ctx, String(n), px + 360, y, { size: 44, weight: 900, align: 'right', color: col, alpha: k });
        ctx.restore();
      });
      const s1 = appear(t, t55, 0.5, ease.back);
      if (s1 > 0) { ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(px - 20, 494, 400 * s1, 3); text(ctx, 'energia e fio', px + 40, 528, { size: 30, weight: 700, color: C.muted, align: 'left', alpha: appear(t, tEF, 0.4) }); text(ctx, '55', px + 360, 528, { size: 52, weight: 900, align: 'right', alpha: s1 * (1 - 0.5 * dimEF) }); }
      const s2 = appear(t, tg[4] + 0.9, 0.5, ease.back);
      if (s2 > 0) { ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(px - 20, 740, 400 * s2, 3); glowText(ctx, '45', px + 360, 784, { size: 70, weight: 900, align: 'right', color: P.enc, glow: hexA(P.enc, 0.7), alpha: s2 }); text(ctx, 'não é energia', px + 40, 784, { size: 30, weight: 800, align: 'left', color: '#fca5a5', alpha: s2 }); }
      const qk = appear(t, tOutras, 0.4);
      if (qk > 0 && t < tg[3]) neonText(ctx, '?', 1600, 640, t, tOutras, { size: 120, weight: 900, color: P.enc });
    },
    overlay(ctx, t) {
      const k = vis(t, tVale, tg[0] + 0.3);
      if (k > 0) pill(ctx, 960, 110, 380, 76, 'cada lâmpada = R$ 1', P.au, k, { size: 36, weight: 900 });
      overlaySource(ctx, 'PwC/Acende Brasil (2024), Estadão · conta do canal', vis(t, tg[0], tQM + 3));
    },
  };
}

// ================================================================ Cena 07: a bandeira no lugar certo
function scene07(K) {
  const tBand = K('e a bandeira'), tVila = K('nao e a vila'), tInoc = K('nao e inocente'), tTerm = K('termometro da chuva'), tSeca = K('seca de 2021'), tMais = K('ainda mais cara');
  const tEsc = K('escassez hidrica'), tCat = K('catorze reais'), tHoje = K('casa media de hoje'), t26 = K('vinte e seis'), tAm = K('bandeira amarela'), t343 = K('tres reais e quarenta');
  const tMuda = K('muda de um mes'), tPesa = K('o que pesa');
  const dry = (t) => vis(t, tSeca - 0.2, tAm - 0.2, 0.6, 0.6);
  const flagCol = (t) => (t < tSeca ? '#22c55e' : t < tAm ? '#7f1d1d' : t < tMuda ? '#facc15' : ['#22c55e', '#facc15', '#ef4444', '#22c55e'][Math.floor((t - tMuda) * 2.2) % 4]);
  const shrink = (t) => ease.inOut(prog(t, tPesa - 0.1, 1.0));
  const cam = [{ t: 0, x: 760, y: 420, z: 1.15 }, { t: tTerm - 0.2, x: 860, y: 500, z: 1.0, d: 1.2 }, { t: tSeca - 0.2, x: 960, y: 520, z: 1.04, d: 1.4 },
    { t: tCat - 0.2, x: 1080, y: 480, z: 1.04, d: 1.0 }, { t: tAm - 0.2, x: 1100, y: 500, z: 1.04, d: 1.2 }, { t: tPesa - 0.2, x: 960, y: 520, z: 1.0, d: 1.2 }];
  const sfx = [[0.1, 'wind', 0.7, { dur: Math.max(2, tSeca - 0.1) }], [tVila, 'pop', 0.5], [tInoc, 'pop', 0.5], [tTerm, 'drop', 0.5], [tSeca - 0.1, 'wind', 0.9, { dur: Math.max(2, tAm - tSeca) }],
    [tEsc, 'hit', 0.8], [tCat, 'relay', 0.6], [t26, 'impact', 0.7], [tAm - 0.1, 'wind', 0.5, { dur: Math.max(2, tPesa - tAm + 1) }], [t343, 'relay', 0.6], [tMuda, 'click', 0.5], [tMuda + 0.45, 'click', 0.5], [tMuda + 0.9, 'click', 0.5],
    [tPesa, 'whoosh', 0.6], [tPesa + 0.7, 'bulb', 0.5]];
  return {
    accent: '#22c55e', cam, sfx, impacts: [tEsc, t26], trans: 'whip',
    draw(ctx, t) {
      const d = dry(t), sk = shrink(t);
      // céu seco e chão rachado
      if (d > 0) {
        ctx.save(); ctx.globalAlpha *= d;
        const g = ctx.createLinearGradient(0, 0, 0, 900); g.addColorStop(0, 'rgba(154,52,18,0.45)'); g.addColorStop(1, 'rgba(120,53,15,0.2)');
        ctx.fillStyle = g; ctx.fillRect(-300, -300, 2600, 1300);
        circle(ctx, 1620, 200, 90 + 6 * Math.sin(t * 2), '#f97316');
        fillRR(ctx, -300, 800, 2600, 400, 0, '#3f2a14');
        ctx.strokeStyle = '#1c1208'; ctx.lineWidth = 4;
        for (let i = 0; i < 18; i++) { const x = i * 120 - 100; ctx.beginPath(); ctx.moveTo(x, 800); ctx.lineTo(x + 40, 860); ctx.lineTo(x + 10, 930); ctx.moveTo(x + 40, 860); ctx.lineTo(x + 100, 880); ctx.stroke(); }
        ctx.restore();
      }
      // bandeira (encolhe no fim)
      const fx = lerp(420, 300, sk), fy = lerp(220, 360, sk), fw = lerp(460, 200, sk), fh = lerp(290, 125, sk);
      flagWave(ctx, fx, fy, fw, fh, flagCol(t), t, { mast: lerp(640, 300, sk), speed: d > 0.5 ? 9 : 5, amp: d > 0.5 ? 1.5 : 1, stripe: t > tEsc && t < tAm ? '#111827' : null });
      [['vilã?', tVila], ['inocente?', tInoc]].forEach(([lab, at], i) => { const k = vis(t, at, tTerm); if (k > 0) pill(ctx, 1150 + i * 300, 300, 260, 70, lab, '#94a3b8', k, { size: 34 }); });
      // termômetro de chuva
      const tk = vis(t, tTerm - 0.1, tPesa) ;
      if (tk > 0) {
        ctx.save(); ctx.globalAlpha *= tk;
        const level = t < tSeca ? 0.75 : t < tAm ? lerp(0.75, 0.12, ease.inOut(prog(t, tSeca, 1.2))) : lerp(0.12, 0.5, ease.inOut(prog(t, tAm, 1.2)));
        fillRR(ctx, 1000, 220, 70, 420, 35, '#0f172a'); strokeRR(ctx, 1000, 220, 70, 420, 35, '#94a3b8', 4);
        fillRR(ctx, 1012, 220 + 408 * (1 - level), 46, 408 * level, 23, '#38bdf8');
        circle(ctx, 1035, 660, 56, '#38bdf8');
        for (let i = 0; i < 4; i++) { const yy = ((t * 200 + i * 80) % 260) + 150; if (level > 0.3) { ctx.fillStyle = 'rgba(147,197,253,0.7)'; ctx.beginPath(); ctx.ellipse(1140 + i * 30, yy, 6, 12, 0, 0, 6.283); ctx.fill(); } }
        text(ctx, 'chuva', 1035, 750, { size: 30, weight: 700, color: C.muted });
        ctx.restore();
      }
      // 2021 e 2026
      const hk = vis(t, tSeca - 0.1, tAm - 0.2);
      if (hk > 0) {
        ctx.save(); ctx.globalAlpha *= hk;
        neonText(ctx, '2021', 1500, 330, t, tSeca, { size: 90, weight: 900, color: '#fb923c' });
        if (t > tEsc) text(ctx, 'ESCASSEZ HÍDRICA', 1500, 420, { size: 46, weight: 900, color: '#fca5a5', letter: 3, alpha: appear(t, tEsc, 0.4) });
        if (t > tCat) ledText(ctx, 'R$ 14,20 / 100 kWh', 1500, 510, { size: 52, color: '#fb923c', alpha: appear(t, tCat, 0.3) });
        const ck = appear(t, tHoje, 0.5);
        if (ck > 0) { house(ctx, 1320, 665, 0.32, 1, t); text(ctx, 'casa média de hoje', 1580, 610, { size: 36, weight: 700, color: C.muted, alpha: ck }); }
        const vk = appear(t, t26, 0.4, ease.back);
        if (vk > 0) { ctx.save(); ctx.translate(1580, 685); ctx.scale(vk, vk); glowText(ctx, '≈ R$ 26 a mais', 0, 0, { size: 58, weight: 900, color: P.enc, glow: hexA(P.enc, 0.7) }); text(ctx, 'por mês', 0, 58, { size: 34, weight: 700, color: C.muted }); ctx.restore(); }
        ctx.restore();
      }
      const ak = vis(t, tAm - 0.1, tPesa);
      if (ak > 0) {
        ctx.save(); ctx.globalAlpha *= ak;
        neonText(ctx, 'agosto de 2026', 1500, 330, t, tAm, { size: 64, weight: 900, color: '#facc15' });
        if (t > t343) { ctx.save(); ctx.translate(1500, 480); const k = appear(t, t343, 0.4, ease.back); ctx.scale(k, k); ledText(ctx, 'R$ 3,43', 0, 0, { size: 110, color: '#facc15' }); ctx.restore(); text(ctx, 'bandeira amarela, casa média', 1500, 580, { size: 36, weight: 700, color: C.muted }); }
        const mk = appear(t, tMuda, 0.4);
        if (mk > 0) pill(ctx, 1500, 700, 520, 76, 'muda de um mês pro outro', '#facc15', mk, { size: 34 });
        ctx.restore();
      }
      // o resto pesa o ano inteiro: as 45 lâmpadas ao lado da bandeira pequena
      if (sk > 0) {
        ctx.save(); ctx.globalAlpha *= sk;
        for (let i = 0; i < 45; i++) { const c0 = i % 9, r0 = Math.floor(i / 9); bulb(ctx, 900 + c0 * 70, 300 + r0 * 80, 24, i < 15 ? P.enc : P.imp, clamp((t - tPesa - 0.5 - i * 0.012) / 0.15)); }
        text(ctx, 'o que pesa o ano inteiro', 1180, 760, { size: 48, weight: 900, color: '#fca5a5', alpha: appear(t, tPesa + 0.6, 0.4) });
        ctx.restore();
      }
    },
    overlay(ctx, t) { overlaySource(ctx, t < tAm ? 'Aneel (2021)' : 'Aneel, EPE (2026) · conta do canal', vis(t, tEsc, tPesa)); },
  };
}

// ================================================================ Cena 08: então por que subiu?
function scene08(K) {
  const tPor = K('por que a conta'), tCresce = K('mais cresce'), t1999 = K('em 1999'), tQ15 = K('quase quinze'), tTom = K('aquela tomada'), t7 = K('sete por cento');
  const tTorr = K('as torres'), t9 = K('nove por cento'), tDet = K('detalhe que doi'), tBr = K('o brasil tira'), tLimp = K('mais limpas'), tMesmo = K('mesmo assim');
  const t77 = K('setenta e sete'), tProb = K('o problema'), tPend = K('pendurado');
  const tVerde = K('com a bandeira verde'), tNaoVe = K('voce nao ve');
  const pA = (t) => 1 - appear(t, tDet - 0.2, 0.6);
  const pB = (t) => vis(t, tDet, tProb - 0.2, 0.6, 0.5);
  const pC = (t) => appear(t, tProb - 0.2, 0.5);
  const nodes = [[420, 560], [960, 600], [1500, 560]];
  const cam = [{ t: 0, x: 960, y: 330, z: 1.22 }, { t: tVerde - 0.3, x: 960, y: 430, z: 1.12, d: 0.8 }, { t: tCresce, x: 960, y: 480, z: 1.0, d: 1.2 }, { t: t1999 - 0.3, x: 560, y: 640, z: 1.35, d: 1.0 },
    { t: tTom - 0.3, x: 960, y: 640, z: 1.35, d: 1.0 }, { t: tTorr - 0.3, x: 1400, y: 640, z: 1.35, d: 1.0 }, { t: t9 + 0.8, x: 960, y: 520, z: 1.0, d: 0.9 }, { t: tDet - 0.2, x: 960, y: 500, z: 1.0, d: 1.0 },
    { t: tMesmo, x: 1060, y: 500, z: 1.05, d: 1.4 }, { t: tProb - 0.2, x: 960, y: 500, z: 1.0, d: 1.0 }];
  const sfx = [[tPor, 'hit', 0.6], [tVerde, 'pop', 0.5], [tNaoVe, 'buzz', 0.35], [tCresce, 'hum', 0.5, { dur: 1.2, f: 700 }], [t1999, 'spark', 0.8], [tQ15, 'impact', 0.6], [tTom, 'spark', 0.8], [t7, 'switch', 0.7],
    [tTorr, 'spark', 0.8], [t9, 'relay', 0.7], [tDet, 'poweroff', 0.5], [tBr, 'poweron', 0.5], [tLimp, 'sparkle', 0.6], [tMesmo, 'riser', 0.3, { dur: Math.max(0.8, t77 - tMesmo) }],
    [t77, 'impact', 1], [tProb, 'whoosh', 0.5], [tProb + 0.4, 'pop', 0.5], ...[0, 1, 2, 3].map((i) => [K('e tudo o que') + i * 0.22, 'pop', 0.45, { p: 1 + i * 0.08 }])];
  return {
    accent: P.enc, cam, sfx, impacts: [tQ15, t77], trans: 'short',
    draw(ctx, t) {
      const a = pA(t);
      if (a > 0) {
        ctx.save(); ctx.globalAlpha *= a;
        neonText(ctx, 'ENTÃO POR QUE SUBIU 9,4%?', W / 2, 190, t, 0.1, { size: 76, weight: 900, color: '#fca5a5' });
        const lit = [t1999, tTom, tTorr];
        nodes.forEach(([nx, ny], i) => {
          const k = ease.inOut(prog(t, lit[i] - 0.2, 0.5));
          ctx.save(); ctx.strokeStyle = k > 0 ? P.au : 'rgba(148,163,184,0.3)'; ctx.lineWidth = 5; ctx.setLineDash(k > 0 ? [] : [10, 10]);
          if (k > 0) { ctx.shadowColor = P.au; ctx.shadowBlur = 20; }
          ctx.beginPath(); ctx.moveTo(W / 2, 250); ctx.quadraticCurveTo(nx, 260, nx, lerp(260, ny - 160, k || 1)); ctx.stroke(); ctx.restore();
          circle(ctx, nx, ny - 150, 16, k > 0 ? P.au : '#334155');
          const q0 = tNaoVe + 0.55 + i * 0.15, qk = vis(t, q0, lit[i] - 0.2, 0.3, 0.3);
          if (qk > 0) { ctx.save(); ctx.globalAlpha *= qk * (0.75 + 0.25 * Math.sin(t * 5 + i)); neonText(ctx, '?', nx, ny - 60, t, q0, { size: 96, weight: 900, color: '#94a3b8' }); ctx.restore(); }
        });
        // a bandeira verde que não explica a alta
        const gk = vis(t, tVerde, tNaoVe + 0.1, 0.35, 0.4);
        if (gk > 0) {
          ctx.save(); ctx.globalAlpha *= gk;
          const sc = ease.back(prog(t, tVerde, 0.4));
          ctx.translate(960, 560); ctx.scale(sc, sc);
          flagWave(ctx, -90, -110, 200, 125, '#22c55e', t, { mast: 220 });
          text(ctx, 'bandeira verde', 10, 140, { size: 40, weight: 900, color: P.ok });
          ctx.restore();
        }
        // 1: encargos crescendo
        const k1 = appear(t, t1999, 0.5);
        if (k1 > 0) {
          ctx.save(); ctx.globalAlpha *= k1;
          const h1 = 100 * ease.out(prog(t, K('seis por cento') - 0.1, 0.6)), h2 = 210 * ease.out(prog(t, tQ15, 0.9));
          fillRR(ctx, 300, 780 - h1, 100, h1, 10, '#7f1d1d'); fillRR(ctx, 440, 780 - h2, 100, h2, 10, P.enc);
          text(ctx, '1999', 350, 815, { size: 30, weight: 800, color: C.muted }); text(ctx, 'hoje', 490, 815, { size: 30, weight: 800, color: C.muted });
          if (h1 > 1) text(ctx, '6%', 350, 755 - h1, { size: 38, weight: 900 }); if (t > tQ15) text(ctx, '≈ 15%', 490, 755 - h2, { size: 42, weight: 900, color: '#fca5a5' });
          text(ctx, 'encargos', 420, 495, { size: 38, weight: 800 });
          ctx.restore();
        }
        // 2: a tomada ficou mais cara
        const k2 = appear(t, tTom, 0.5);
        if (k2 > 0) {
          ctx.save(); ctx.globalAlpha *= k2;
          socketPlate(ctx, 960, 660, 0.55, { covered: true }); tAdapter(ctx, 960, 660, 0.36, 1);
          for (let i = 0; i < 8; i++) { const ang = -Math.PI + (i / 7) * Math.PI; const pk = prog(t, tTom + 0.2 + i * 0.12, 0.3); if (pk > 0) { ctx.save(); ctx.strokeStyle = '#1f2937'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(960 + Math.cos(ang) * 50, 660 + Math.sin(ang) * 50); ctx.lineTo(960 + Math.cos(ang) * 125 * pk, 660 + Math.sin(ang) * 125 * pk); ctx.stroke(); ctx.restore(); circle(ctx, 960 + Math.cos(ang) * 125 * pk, 660 + Math.sin(ang) * 125 * pk, 10, P.enc); } }
          text(ctx, 'a tomada dos encargos', 960, 495, { size: 36, weight: 800 });
          if (t > t7) pill(ctx, 960, 805, 200, 70, '+7%', P.enc, appear(t, t7, 0.4, ease.back), { size: 40, weight: 900 });
          ctx.restore();
        }
        // 3: transmissão
        const k3 = appear(t, tTorr, 0.5);
        if (k3 > 0) {
          ctx.save(); ctx.globalAlpha *= k3;
          towerShape(ctx, 1500, 770, 240, P.tra, 5);
          text(ctx, 'transmissão', 1500, 495, { size: 36, weight: 800 });
          if (t > t9) pill(ctx, 1500, 800, 200, 70, '+9%', P.tra, appear(t, t9, 0.4, ease.back), { size: 40, weight: 900 });
          ctx.restore();
        }
        ctx.restore();
      }
      // o globo
      const b = pB(t);
      if (b > 0) {
        ctx.save(); ctx.globalAlpha *= b;
        globe(ctx, 760, 500, 300, t, { br: appear(t, tBr, 0.6) });
        const ik = appear(t, tBr + 0.3, 0.5);
        if (ik > 0) { ctx.save(); ctx.globalAlpha *= ik; hydro(ctx, 1200, 330, 0.3, t); turbine(ctx, 1360, 270, 0.35, t); solar(ctx, 1520, 340, 0.35); ctx.restore(); text(ctx, 'rio, vento e sol', 1360, 430, { size: 32, weight: 800, color: P.ok, alpha: ik }); }
        if (t > tLimp) text(ctx, 'uma das energias mais limpas do mundo', 1360, 482, { size: 30, weight: 600, color: C.muted, alpha: appear(t, tLimp, 0.4) });
        const ck = appear(t, tMesmo + 0.2, 0.4);
        if (ck > 0) {
          ctx.save(); ctx.globalAlpha *= ck;
          text(ctx, 'mesmo assim, a conta é mais cara que a de', 1360, 590, { size: 30, weight: 700 });
          const v = t < t77 ? counting(t, tMesmo + 0.2, Math.max(0.5, t77 - tMesmo - 0.2), 0, 70) : counting(t, t77, 0.4, 70, 77);
          glowText(ctx, `${Math.round(v)} países`, 1360, 690, { size: 110, weight: 900, color: P.enc, glow: hexA(P.enc, 0.7), blur: 50 });
          text(ctx, 'comparando com a renda das pessoas', 1360, 780, { size: 28, weight: 600, color: C.muted, alpha: appear(t, t77 + 0.3, 0.4) });
          ctx.restore();
          if (t > t77) shockRing(ctx, t, t77, 1360, 690, P.enc, 80, 520);
        }
        ctx.restore();
      }
      // o que foi pendurado na conta
      const c = pC(t);
      if (c > 0) {
        ctx.save(); ctx.globalAlpha *= c;
        bill(ctx, 960, 640, 0.5, t, {});
        const tTudo = K('e tudo o que');
        hangWire(ctx, t, [['energia', P.au, 960, appear(t, tProb + 0.4, 0.5, ease.back)], ...TAGS.map(([l, c, x], i) => [l, c, x, appear(t, tTudo + i * 0.22, 0.5, ease.back)])]);
        ctx.restore();
      }
    },
    overlay(ctx, t) { overlaySource(ctx, t < tDet ? 'PwC/Acende Brasil, Aneel (2026)' : 'CLP, estudo com 138 países (2026)', vis(t, t1999, tProb)); },
  };
}

// ================================================================ Cena 09: o que está na sua mão
function scene09(K) {
  const tSoz = K('nao tira sozinho'), tTres = K('tres coisas'), tP1 = K('a primeira'), tValor = K('nao so o valor'), tCasa = K('dentro de casa');
  const tP2 = K('a segunda'), tQuarto = K('um quarto'), tQuatro = K('quatro pessoas'), tMin = K('um minuto'), tOnze = K('onze reais');
  const tP3 = K('a terceira'), tCad = K('cadunico'), t80 = K('oitenta'), tGraca = K('de graca'), tNov = K('em novembro'), tDois = K('dois milhoes'), tRen = K('renovar');
  const panel = (t) => (t < tP2 - 0.2 ? 0 : t < tP3 - 0.2 ? 1 : 2);
  const cam = [{ t: 0, x: 960, y: 500, z: 1.06 }, { t: tP1 - 0.2, x: 980, y: 500, z: 1.0, d: 1.0 }, { t: tP3 - 0.2, x: 1000, y: 500, z: 1.0, d: 1.0 }, { t: tRen, x: 1000, y: 520, z: 1.02, d: 1.0 }];
  const tFoi = K('o que foi pendurado'), g0 = tFoi + 0.9;
  const sfx = [[tFoi + 0.1, 'pop', 0.4], [g0, 'paper', 0.5], [tSoz + 0.15, 'whip', 0.5], [tSoz + 0.2, 'buzz', 0.35], [tTres, 'pop', 0.6], [tTres + 0.25, 'pop', 0.4], [tTres + 0.5, 'pop', 0.4, { p: 1.1 }], [tTres + 0.75, 'pop', 0.4, { p: 1.2 }], [tP1 - 0.6, 'whip', 0.4], [tP1, 'switch', 1], [tValor, 'pop', 0.6], [tCasa, 'relay', 0.6], [tP2, 'switch', 1],
    [tQuarto, 'pop', 0.6], [tQuatro, 'pop', 0.6], [tMin, 'water', 0.5, { dur: 1.2 }], [tOnze, 'coin', 0.8], [tP3, 'switch', 1], [tCad, 'pop', 0.6], [K('com renda'), 'paper', 0.4], [K('os primeiros'), 'meter', 0.5], [tGraca, 'ding', 0.8], [tGraca, 'stamp', 0.5],
    [tNov, 'buzz', 0.3], [tDois, 'impact', 0.6]];
  const switches = [tP1, tP2, tP3];
  return {
    accent: P.ok, cam, sfx, impacts: [tOnze, tDois], trans: 'blackout',
    draw(ctx, t) {
      // o que foi pendurado não sai puxando sozinho
      const hk0 = 1 - appear(t, tTres - 0.3, 0.5);
      if (hk0 > 0) {
        ctx.save(); ctx.globalAlpha *= hk0 * appear(t, 0, 0.4);
        bill(ctx, 960, 640, 0.5, t, {});
        const snap = tSoz + 0.15;
        const pull = t < g0 ? 0 : t < snap ? 120 * ease.out(prog(t, g0, snap - g0)) : 120 * Math.exp(-5 * (t - snap)) * Math.cos(16 * (t - snap));
        hangWire(ctx, t, TAGS.map(([l, c, x], i) => [l, c, x, 1, i === 1 ? pull : 0]));
        const tip = wireY(640) + 60 + pull + 84;
        const fy = t < snap ? lerp(1000, tip - 30, ease.out(prog(t, tFoi + 0.3, 0.6))) : lerp(tip - 30, 1100, ease.inOut(prog(t, snap, 0.5)));
        fillRR(ctx, 608, fy, 64, 260, 32, '#f1c27d'); fillRR(ctx, 616, fy + 6, 48, 40, 18, '#e8b06a');
        if (t > snap) { const xk = vis(t, snap, tTres - 0.4, 0.2, 0.3); ctx.save(); ctx.globalAlpha *= xk; ctx.translate(470, 560); ctx.scale(lerp(1.4, 1, ease.out(prog(t, snap, 0.3))), lerp(1.4, 1, ease.out(prog(t, snap, 0.3)))); ctx.strokeStyle = P.enc; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-40, -40); ctx.lineTo(40, 40); ctx.moveTo(40, -40); ctx.lineTo(-40, 40); ctx.stroke(); ctx.restore(); text(ctx, 'não sai puxando sozinho', 470, 650, { size: 38, weight: 900, color: '#fca5a5', alpha: xk }); }
        ctx.restore();
      }
      const ik = appear(t, tTres, 0.5), mv = ease.inOut(prog(t, tP1 - 0.6, 0.6));
      text(ctx, '3 coisas na sua mão', 960, 290, { size: 64, weight: 900, alpha: Math.min(ik, 1 - mv) });
      text(ctx, '3 coisas na sua mão', 140, 170, { size: 40, weight: 900, alpha: mv, align: 'left' });
      switches.forEach((at, i) => {
        const on = ease.out(prog(t, at, 0.15));
        const pop = appear(t, tTres + 0.25 + i * 0.25, 0.4, ease.back);
        const x = lerp(620 + i * 340, 200, mv), y = lerp(560, 310 + i * 210, mv), sc = lerp(1.25, 0.7, mv) * pop;
        ctx.save(); ctx.globalAlpha *= ik; lightSwitch(ctx, x, y, sc, on, { glow: P.ok }); ctx.restore();
        text(ctx, String(i + 1), x + lerp(0, 100, mv), y + lerp(200, 0, mv), { size: lerp(64, 56, mv), weight: 900, color: on > 0.5 ? P.ok : '#475569', alpha: ik * pop, align: mv > 0.5 ? 'left' : 'center' });
        if (on > 0.5 && panel(t) === i) { ctx.save(); ctx.strokeStyle = hexA(P.ok, 0.5); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(360, y); ctx.lineTo(560, y); ctx.stroke(); ctx.restore(); }
      });
      const p = panel(t);
      const pk = (i) => (i === 0 ? vis(t, tP1, tP2 - 0.2) : i === 1 ? vis(t, tP2, tP3 - 0.2) : appear(t, tP3, 0.4));
      // 1: o consumo, não só o valor
      if (pk(0) > 0) {
        ctx.save(); ctx.globalAlpha *= pk(0);
        bill(ctx, 980, 520, 0.85, t, { hl: { kwh: 1 }, hlColor: { kwh: P.ok } });
        const r = billRow(980, 520, 0.85, 'kwh');
        const ck = ease.out(prog(t, tValor - 0.3, 0.6));
        ctx.save(); ctx.strokeStyle = P.ok; ctx.lineWidth = 7; ctx.shadowColor = P.ok; ctx.shadowBlur = 20; ctx.beginPath(); ctx.ellipse(r.x + 120, r.y, 140, 42, -0.05, 0, 6.283 * ck); ctx.stroke(); ctx.restore();
        const hk = appear(t, tCasa, 0.5, ease.back);
        if (hk > 0) { ctx.save(); ctx.globalAlpha *= hk; house(ctx, 1560, 520, 0.6, 1, t); text(ctx, 'o problema está dentro de casa', 1560, 760, { size: 32, weight: 800, color: P.ok }); ctx.restore(); }
        ctx.restore();
      }
      // 2: o chuveiro
      if (pk(1) > 0) {
        ctx.save(); ctx.globalAlpha *= pk(1);
        showerHead(ctx, 900, 400, 1.0, t, 1 - appear(t, tMin + 1.2, 0.3) * 0);
        const qk = appear(t, tQuarto, 0.5);
        if (qk > 0) {
          ctx.save(); ctx.globalAlpha *= qk; circle(ctx, 1200, 300, 105, '#334155');
          ctx.fillStyle = '#38bdf8'; ctx.beginPath(); ctx.moveTo(1200, 300); ctx.arc(1200, 300, 105, -Math.PI / 2, -Math.PI / 2 + Math.PI / 2 * ease.out(prog(t, tQuarto, 0.6))); ctx.closePath(); ctx.fill();
          text(ctx, 'até 1/4 da conta', 1200, 450, { size: 36, weight: 800 }); ctx.restore();
        }
        const fk = appear(t, tQuatro, 0.5);
        if (fk > 0) for (let i = 0; i < 4; i++) { const k = appear(t, tQuatro + i * 0.12, 0.3, ease.back); ctx.save(); ctx.translate(1440 + i * 95, 330); ctx.scale(k, k); personIcon(ctx, 0, 0, 80, '#93c5fd'); ctx.restore(); }
        const mk = appear(t, tMin, 0.4);
        if (mk > 0) { ctx.save(); ctx.globalAlpha *= mk; const back = 60 * ease.inOut(prog(t, tMin, 1.0)); stopwatch(ctx, 1240, 640, 110, 600 - back, 600, '#38bdf8'); pill(ctx, 1240, 790, 300, 64, '− 1 min de banho', '#38bdf8', mk, { size: 30 }); ctx.restore(); }
        const ok = appear(t, tOnze, 0.5, ease.back);
        if (ok > 0) { ctx.save(); ctx.translate(1620, 620); ctx.scale(ok, ok); glowText(ctx, '≈ R$ 11', 0, 0, { size: 96, weight: 900, color: P.ok, glow: hexA(P.ok, 0.7), blur: 40 }); text(ctx, 'por mês', 0, 70, { size: 32, weight: 700, color: C.muted }); ctx.restore(); }
        ctx.restore();
      }
      // 3: tarifa social
      if (pk(2) > 0) {
        ctx.save(); ctx.globalAlpha *= pk(2);
        const tRenda = K('com renda'), tPrim = K('os primeiros');
        // a família entra no cartão
        const fk = appear(t, tCad - 0.3, 0.5);
        if (fk > 0) {
          ctx.save(); ctx.globalAlpha *= fk;
          for (let i = 0; i < 3; i++) { const k = appear(t, tCad - 0.3 + i * 0.15, 0.35, ease.back); ctx.save(); ctx.translate(1380 + i * 120, 300); ctx.scale(k, k); personIcon(ctx, 0, 0, i === 2 ? 80 : 110, '#86efac'); ctx.restore(); }
          text(ctx, 'sua família no CadÚnico', 1500, 420, { size: 40, weight: 900, color: P.ok });
          ctx.restore();
        }
        const rk = appear(t, tRenda, 0.5);
        if (rk > 0) {
          ctx.save(); ctx.globalAlpha *= rk;
          fillRR(ctx, 1250, 470, 500, 120, 20, 'rgba(15,23,42,0.75)'); strokeRR(ctx, 1250, 470, 500, 120, 20, '#475569', 3);
          text(ctx, 'renda de até ½ salário mínimo', 1500, 515, { size: 34, weight: 800 });
          text(ctx, 'por pessoa', 1500, 562, { size: 32, weight: 700, color: C.muted });
          ctx.restore();
        }
        // o medidor: os primeiros 80 kWh saem de graça
        const sk = appear(t, tP3 + 0.3, 0.6, ease.back);
        if (sk > 0) {
          ctx.save(); ctx.translate(880, 470); ctx.scale(sk, sk);
          const fill = t < tPrim ? 0 : ease.inOut(prog(t, tPrim, Math.max(0.6, t80 - tPrim + 0.6)));
          ctx.save(); ctx.shadowColor = P.ok; ctx.shadowBlur = 40 * fill; circle(ctx, 0, 0, 220, 'rgba(15,23,42,0.85)'); ctx.restore();
          ctx.save(); ctx.strokeStyle = '#334155'; ctx.lineWidth = 26; ctx.beginPath(); ctx.arc(0, 0, 190, Math.PI * 0.75, Math.PI * 2.25); ctx.stroke();
          ctx.strokeStyle = P.ok; ctx.shadowColor = P.ok; ctx.shadowBlur = 24; ctx.beginPath(); ctx.arc(0, 0, 190, Math.PI * 0.75, Math.PI * (0.75 + 1.5 * fill)); ctx.stroke(); ctx.restore();
          text(ctx, 'tarifa social', 0, t > tPrim ? -90 : 0, { size: t > tPrim ? 34 : 44, weight: 800, color: t > tPrim ? C.muted : P.ok });
          const v = counting(t, tPrim, Math.max(0.6, t80 - tPrim + 0.6), 0, 80);
          if (t > tPrim) glowText(ctx, `${Math.round(v)} kWh`, 0, 10, { size: 96, weight: 900, color: '#fff', glow: hexA(P.ok, 0.6) });
          const gk = appear(t, tGraca, 0.4, ease.back);
          if (gk > 0) { ctx.save(); ctx.translate(0, 110); ctx.scale(gk, gk); ctx.rotate(-0.06); fillRR(ctx, -150, -36, 300, 72, 36, P.ok); text(ctx, 'DE GRAÇA', 0, 2, { size: 40, weight: 900, color: '#052e16', letter: 2 }); ctx.restore(); }
          ctx.restore();
        }
        // alerta de novembro, abaixo da renda
        const ak = appear(t, tNov, 0.4);
        if (ak > 0) {
          const blink = 0.75 + 0.25 * Math.sin(t * 8);
          ctx.save(); ctx.globalAlpha *= ak;
          fillRR(ctx, 1250, 630, 500, 200, 24, hexA(P.enc, 0.18 * blink)); strokeRR(ctx, 1250, 630, 500, 200, 24, P.enc, 3);
          text(ctx, '⚠ novembro de 2026', 1500, 675, { size: 32, weight: 800, color: '#fca5a5' });
          const v = t < tDois ? 0 : counting(t, tDois, 0.8, 0, 2.4);
          if (t > tDois - 0.05) text(ctx, `${v.toFixed(1).replace('.', ',')} milhões de casas`, 1500, 738, { size: 42, weight: 900 });
          text(ctx, 'precisavam renovar o cadastro', 1500, 795, { size: 30, weight: 700, color: C.muted, alpha: appear(t, tRen, 0.4) });
          ctx.restore();
        }
        ctx.restore();
      }
    },
    overlay(ctx, t) { overlaySource(ctx, panel(t) === 1 ? 'conta do canal: chuveiro de 5.500 W' : panel(t) === 2 ? 'MME (Luz do Povo), Extra (nov/2026)' : '', vis(t, tP2, tRen + 3)); },
  };
}

// ================================================================ Cena 10: fechamento com o interruptor do canal
function scene10(K) {
  const tProx = K('da proxima vez'), tCor = K('cor da bandeira'), tQM = K('quase metade'), tEnc = K('e encargo'), tPend = K('pendurados'), tAce = K('acende a sua');
  const tAj = K('te ajudou'), tInsc = K('se inscreve'), tNo = K('no proximo'), tCarne = K('preco da carne'), tMaior = K('maior exportador'), tCada = K('cada real'), tAte = K('ate la');
  const tOff = tAj + 0.2, tClick = tInsc + 0.35;
  const cam = [{ t: 0, x: 960, y: 480, z: 1.2 }, { t: tQM - 0.2, x: 960, y: 480, z: 1.05, d: 1.0 }, { t: tOff, x: 960, y: 520, z: 1.0, d: 1.0 },
    { t: tClick - 0.6, x: 1100, y: 480, z: 1.12, d: 0.6 }, { t: tNo - 0.2, x: 960, y: 520, z: 1.0, d: 1.0 }, { t: tAte, x: 960, y: 520, z: 0.95, d: 2.5 }];
  const sfx = [[tProx, 'hum', 0.4, { dur: 1.2, f: 500 }], [tCor, 'click', 0.5], [tQM, 'pop', 0.7], [tPend, 'switch', 0.5], [tOff, 'poweroff', 0.8],
    [tClick, 'switch', 1.2], [tClick + 0.08, 'poweron', 0.7], ...[0, 1, 2, 3, 4, 5].map((i) => [tClick + 0.25 + i * 0.12, 'bulb', 0.5, { p: 0.9 + i * 0.05 }]), [tClick + 1.0, 'ding', 0.6],
    [tNo, 'neon', 0.7], [tMaior, 'pop', 0.5], [tAte, 'impact', 0.4]];
  return {
    accent: P.au, cam, sfx, impacts: [tClick], trans: 'through',
    draw(ctx, t) {
      const dark = vis(t, tOff, tClick + 0.1, 0.5, 0.15);
      const pA = 1 - appear(t, tOff - 0.2, 0.5);
      if (pA > 0) {
        ctx.save(); ctx.globalAlpha *= pA;
        // a lâmpada da sala, pintada com as cores das 100 lâmpadas
        const x = 760, y = 420, r = 190;
        ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.clip();
        let yy = y + r;
        GROUPS.forEach(([, n, col], gi) => { const h = (n / 100) * 2 * r; ctx.globalAlpha = gi >= 3 ? 1 : 1 - 0.6 * appear(t, tQM, 0.6); ctx.fillStyle = col; ctx.fillRect(x - r, yy - h, 2 * r, h); yy -= h; });
        ctx.restore();
        ctx.save(); ctx.shadowColor = P.au; ctx.shadowBlur = 60; ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.stroke(); ctx.restore();
        fillRR(ctx, x - 80, y + r * 0.9, 160, 90, 14, '#64748b');
        const bk = vis(t, tCor - 0.1, tQM, 0.3, 0.4);
        if (bk > 0) { flagWave(ctx, 1200, 280, 200, 120, '#22c55e', t, { alpha: bk, mast: 260 }); ctx.save(); ctx.globalAlpha *= bk; ctx.strokeStyle = P.enc; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(1170, 250); ctx.lineTo(1430, 430); ctx.stroke(); ctx.restore(); }
        const qk = appear(t, tQM, 0.5, ease.back);
        if (qk > 0) { ctx.save(); ctx.translate(1380, 380); ctx.scale(qk, qk); glowText(ctx, '45%', 0, 0, { size: 130, weight: 900, color: P.enc, glow: hexA(P.enc, 0.7), blur: 50 }); text(ctx, 'não é energia nem fio', 0, 100, { size: 42, weight: 900, color: '#fca5a5' }); ctx.restore(); }
        const pk = appear(t, tPend, 0.5);
        if (pk > 0) {
          ctx.save(); ctx.globalAlpha *= pk; ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(760, 120); ctx.lineTo(760, y - r); ctx.stroke();
          [['encargo', P.enc, -1], ['imposto', P.imp, 1]].forEach(([lab, col, s], i) => { const k = appear(t, tPend + i * 0.2, 0.4, ease.back); ctx.save(); ctx.translate(760 + s * 30, 170); ctx.rotate(s * 0.25 + Math.sin(t * 3 + i) * 0.06); ctx.scale(k, k); fillRR(ctx, s > 0 ? 0 : -210, 20, 210, 66, 14, hexA(col, 0.3)); strokeRR(ctx, s > 0 ? 0 : -210, 20, 210, 66, 14, col, 3); text(ctx, lab, s > 0 ? 105 : -105, 54, { size: 36, weight: 900 }); ctx.restore(); });
          ctx.restore();
        }
        ctx.restore();
      }
      // a casa apaga; o interruptor da etiqueta B acende tudo
      const hk = appear(t, tOff - 0.3, 0.5) * (1 - appear(t, tNo - 0.1, 0.5));
      if (hk > 0) {
        ctx.save(); ctx.globalAlpha *= hk;
        const lit = clamp((t - tClick - 0.2) / 0.8);
        house(ctx, 720, 560, 1.0, lit, t);
        const sk = appear(t, tAj, 0.5, ease.back);
        ctx.save(); ctx.translate(1300, 520); ctx.scale(sk, sk); lightSwitch(ctx, 0, 0, 1.3, ease.out(prog(t, tClick, 0.12)), { tag: true }); ctx.restore();
        // dedo apertando
        const fk = vis(t, tClick - 0.6, tClick + 0.4, 0.3, 0.3);
        if (fk > 0) { const press = t < tClick ? lerp(120, 30, prog(t, tClick - 0.6, 0.6)) : lerp(30, 120, prog(t, tClick, 0.4)); ctx.save(); ctx.globalAlpha *= fk; fillRR(ctx, 1290 + press, 470, 160, 64, 32, '#f1c27d'); fillRR(ctx, 1290 + press + 10, 478, 40, 48, 18, '#e8b06a'); ctx.restore(); }
        const ik = appear(t, tClick + 0.9, 0.4, ease.back);
        if (ik > 0) {
          ctx.save(); ctx.translate(1300, 720); ctx.scale(ik, ik);
          ctx.save(); ctx.shadowColor = '#fde68a'; ctx.shadowBlur = 50; fillRR(ctx, -210, -46, 420, 92, 46, '#fef3c7'); ctx.restore();
          text(ctx, 'INSCRITO', 0, 2, { size: 40, weight: 900, color: '#0b1222', letter: 3 });
          ctx.restore();
          sparks(ctx, t, tClick + 0.9, 1300, 720, '#fde68a', 18);
        }
        ctx.restore();
      }
      if (dark > 0) { ctx.save(); ctx.fillStyle = `rgba(2,4,10,${0.82 * dark})`; ctx.fillRect(-500, -500, 2920, 2080); ctx.restore(); if (t > tAj) { ctx.save(); ctx.translate(1300, 520); const sk = appear(t, tAj, 0.5, ease.back); ctx.scale(sk, sk); lightSwitch(ctx, 0, 0, 1.3, ease.out(prog(t, tClick, 0.12)), { tag: true }); ctx.restore(); } }
      // próximo vídeo: boi em neon
      const nk = appear(t, tNo - 0.1, 0.4);
      if (nk > 0) {
        const on = (t - tNo) > 0.45 || Math.sin((t - tNo) * 60) > 0.2 ? 1 : 0.2;
        ctx.save(); ctx.globalAlpha *= nk * on; ctx.strokeStyle = '#fb7185'; ctx.lineWidth = 8; ctx.lineJoin = 'round'; ctx.shadowColor = '#fb7185'; ctx.shadowBlur = 40;
        ctx.translate(760, 470); ctx.scale(1.2, 1.2);
        ctx.beginPath(); ctx.moveTo(-230, -40); ctx.lineTo(-160, -110); ctx.lineTo(120, -110); ctx.lineTo(190, -150); ctx.lineTo(230, -120); ctx.lineTo(250, -60); ctx.lineTo(200, -40);
        ctx.lineTo(170, 30); ctx.lineTo(160, 140); ctx.lineTo(120, 140); ctx.lineTo(110, 50); ctx.lineTo(-120, 50); ctx.lineTo(-140, 140); ctx.lineTo(-180, 140); ctx.lineTo(-190, 30); ctx.lineTo(-240, 20); ctx.closePath(); ctx.stroke();
        ctx.lineWidth = 3; ctx.setLineDash([12, 10]);
        for (const x of [-90, 10, 100]) { ctx.beginPath(); ctx.moveTo(x, -110); ctx.lineTo(x - 10, 50); ctx.stroke(); }
        ctx.beginPath(); ctx.moveTo(-160, -30); ctx.lineTo(170, -30); ctx.stroke();
        ctx.restore();
        text(ctx, 'PRÓXIMO VÍDEO', 1400, 340, { size: 34, weight: 800, color: C.muted, alpha: nk, letter: 4 });
        neonText(ctx, 'o preço da carne', 1400, 430, t, tCarne, { size: 70, weight: 900, color: '#fb7185' });
        text(ctx, 'no maior exportador do mundo', 1400, 520, { size: 40, weight: 700, alpha: appear(t, tMaior, 0.4) });
        text(ctx, 'quem fica com cada real?', 1400, 605, { size: 42, weight: 800, color: P.au, alpha: appear(t, tCada, 0.4) });
      }
    },
  };
}

export const SCENES = [
  { id: '01', name: 'gancho', build: scene01 },
  { id: '02', name: 'kwh', build: scene02 },
  { id: '03', name: 'energia-e-fio', build: scene03 },
  { id: '04', name: 'o-que-esconde', build: scene04 },
  { id: '05', name: 'tres-governos', build: scene05 },
  { id: '06', name: 'cem-lampadas', build: scene06 },
  { id: '07', name: 'bandeira', build: scene07 },
  { id: '08', name: 'por-que-subiu', build: scene08 },
  { id: '09', name: 'na-sua-mao', build: scene09 },
  { id: '10', name: 'fechamento', build: scene10 },
];
