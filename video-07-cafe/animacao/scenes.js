// Vídeo 07: O café caiu. Por que tão pouco no mercado?
// Cada cena recebe K(frase) = instante (s, relativo à cena) em que a frase começa na narração.
// Conceito: a bancada da cozinha de manhã é o palco e o pacote a vácuo de 500 g é o fio condutor.
// Regras dos vídeos 04 a 06: câmera sempre andando, paralaxe em camadas, transições discretas (corte ou 'push'),
// uma só virada de efeito (o vapor do coador na cena 5), sem música (só ambiente quase inaudível).
import { W, H, C, clamp, lerp, prog, ease, appear, text, font, rr, fillRR, strokeRR, circle, hexA, source } from './lib.js';
import { glowText, counting, shockRing, sparks, layer } from './fx.js';

// cores fixas do canal por fatia: matéria-prima verde (o grão), empresa azul (torrefação), loja roxo (mercado), estado laranja (ICMS)
const P = {
  grao: '#84cc16', torra: '#3b82f6', mercado: '#a855f7', estado: '#f59e0b', uniao: '#ef4444',
  ink: '#1d2230', paper: '#f7f5ef', red: '#dc2626', ok: '#4ade80', amber: '#fbbf24', sky: '#38bdf8',
  cafe: '#6b3d1a', cafe2: '#3f2410', creme: '#f5e6c8', juta: '#b08a55',
};
const vis = (t, a, b, fin = 0.4, fout = 0.4) => Math.min(appear(t, a, fin), 1 - appear(t, b, fout));
// Estação do cenário: some quando a câmera está longe dela.
function zone(ctx, cam, a, b, fn) {
  const d = cam.x < a ? a - cam.x : cam.x > b ? cam.x - b : 0, al = 1 - clamp((d - 150) / 350);
  if (al <= 0) return;
  ctx.save(); ctx.globalAlpha *= al; fn(); ctx.restore();
}
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const MONO = (size, w = 700) => `${w} ${size}px "DejaVu Sans Mono", "Liberation Mono", monospace`;
function mono(ctx, str, x, y, size, color = P.ink, align = 'left', w = 700) {
  ctx.save(); ctx.font = MONO(size, w); ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(str, x, y); ctx.restore();
}


// ================================================================ tipografia caprichada
// Título com profundidade: extrusão escura, contorno, degradê e marca-texto opcional atrás.
function headline(ctx, str, x, y, o = {}) {
  const { size = 72, color = '#ffffff', color2 = null, align = 'center', hl = null, k = 1, rot = 0, letter = 0 } = o;
  if (k <= 0) return 0;
  const depth = o.depth ?? Math.max(3, Math.round(size / 14));
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  const kk = clamp(k), sc = o.noPop ? 1 : lerp(1.22, 1, ease.out(kk));
  ctx.scale(sc, sc); ctx.globalAlpha *= clamp(kk * 1.8);
  ctx.font = font(size, 900); ctx.textAlign = align; ctx.textBaseline = 'middle';
  if (letter) ctx.letterSpacing = `${letter}px`;
  const w = ctx.measureText(str).width;
  const x0 = align === 'left' ? 0 : align === 'center' ? -w / 2 : -w;
  if (hl) {
    const pad = size * 0.2, hk = ease.out(clamp(kk * 1.4)), L = x0 - pad, R = L + (w + 2 * pad) * hk, T0 = -size * 0.6, B0 = size * 0.52;
    ctx.save(); ctx.fillStyle = hl; ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 26; ctx.shadowOffsetY = 8;
    ctx.beginPath(); ctx.moveTo(L, T0 + 5); ctx.lineTo(R, T0); ctx.lineTo(R + 9, (T0 + B0) / 2); ctx.lineTo(R - 3, B0); ctx.lineTo(L + 4, B0 + 5); ctx.lineTo(L - 9, (T0 + B0) / 2 + 3); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = depth + 4;
  ctx.fillStyle = '#05070d'; ctx.fillText(str, depth * 0.45, depth); ctx.restore();
  ctx.fillStyle = '#05070d'; for (let i = depth - 1; i > 0; i--) ctx.fillText(str, i * 0.45, i);
  ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(4, size / 9); ctx.strokeStyle = '#05070d'; ctx.strokeText(str, 0, 0);
  const g = ctx.createLinearGradient(0, -size * 0.5, 0, size * 0.45); g.addColorStop(0, color); g.addColorStop(1, color2 || color);
  ctx.fillStyle = g; ctx.fillText(str, 0, 0);
  ctx.restore();
  return w;
}
// Legenda de apoio: peso forte, sombra curta e cor clara.
function cap(ctx, str, x, y, o = {}) {
  text(ctx, str, x, y, { size: o.size || 34, weight: o.weight || 800, color: o.color || '#e2e8f0', align: o.align || 'center', alpha: o.alpha ?? 1, shadow: true, letter: o.letter || 0 });
}
// Valor em destaque (número com brilho) que entra subindo.
function bigNum(ctx, str, x, y, k, o = {}) {
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(k * 1.6); ctx.translate(x, y + (1 - ease.out(clamp(k))) * 26);
  glowText(ctx, str, 0, 0, { size: o.size || 96, weight: 900, color: o.color || '#ffffff', glow: o.glow || hexA(o.color || '#ffffff', 0.55), blur: 34, align: o.align || 'center' });
  ctx.restore();
}
// Carimbo oval (tinta com falhas)
function ovalStamp(ctx, cx, cy, rx, ry, lines, color, k = 1, rot = -0.12) {
  if (k <= 0) return;
  const sc = lerp(1.6, 1, ease.out(clamp(k * 1.4)));
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 2) * 0.92;
  ctx.strokeStyle = color; ctx.lineWidth = Math.max(3, ry * 0.07);
  ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, 6.283); ctx.stroke();
  ctx.lineWidth = Math.max(2, ry * 0.035); ctx.beginPath(); ctx.ellipse(0, 0, rx * 0.88, ry * 0.84, 0, 0, 6.283); ctx.stroke();
  lines.forEach(([str, dy, size, weight = 900], i) => text(ctx, str, 0, dy * ry, { size: size * ry, weight, color, letter: i === 1 ? 2 : 1 }));
  const r = rng(Math.round(rx * 7));
  ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = 'rgba(0,0,0,0.5)';
  for (let i = 0; i < 60; i++) { const a = r() * 6.283, d = r(); ctx.beginPath(); ctx.arc(Math.cos(a) * rx * d, Math.sin(a) * ry * d, 1 + r() * 2.5, 0, 6.283); ctx.fill(); }
  ctx.restore();
}
// Carimbo retangular grande (imposto do pecado)
function rectStamp(ctx, cx, cy, w, h, str, color, k = 1, rot = -0.08, size = 64) {
  if (k <= 0) return;
  const sc = lerp(1.8, 1, ease.out(clamp(k * 1.5)));
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 2.2) * 0.96;
  // fundo de papel (adesivo), para o carimbo vermelho ler em cima de qualquer coisa
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 8; fillRR(ctx, -w / 2 - 10, -h / 2 - 10, w + 20, h + 20, 18, '#f3efe4'); ctx.restore();
  ctx.strokeStyle = color; ctx.lineWidth = 9; strokeRR(ctx, -w / 2, -h / 2, w, h, 14, color, 9);
  strokeRR(ctx, -w / 2 + 14, -h / 2 + 14, w - 28, h - 28, 8, color, 3);
  text(ctx, str, 0, 2, { size, weight: 900, color, letter: 3 });
  const r = rng(Math.round(w)); ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = 'rgba(0,0,0,0.55)';
  for (let i = 0; i < 90; i++) { ctx.beginPath(); ctx.arc((r() - 0.5) * w, (r() - 0.5) * h, 1 + r() * 3, 0, 6.283); ctx.fill(); }
  ctx.restore();
}
// seta desenhada (sem caractere de seta)
function arrow(ctx, x0, y0, x1, y1, color, lw = 6, k = 1) {
  if (k <= 0) return;
  const x = lerp(x0, x1, k), y = lerp(y0, y1, k), a = Math.atan2(y1 - y0, x1 - x0);
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x - Math.cos(a) * lw * 2, y - Math.sin(a) * lw * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - Math.cos(a - 0.45) * lw * 4, y - Math.sin(a - 0.45) * lw * 4); ctx.lineTo(x - Math.cos(a + 0.45) * lw * 4, y - Math.sin(a + 0.45) * lw * 4); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function check(ctx, x, y, s, color, k = 1) {
  if (k <= 0) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 10 * s; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const pts = [[-30, 0], [-8, 22], [34, -24]], L1 = 31, L2 = 63, d = (L1 + L2) * clamp(k);
  ctx.beginPath(); ctx.moveTo(x + pts[0][0] * s, y + pts[0][1] * s);
  if (d <= L1) ctx.lineTo(x + lerp(pts[0][0], pts[1][0], d / L1) * s, y + lerp(pts[0][1], pts[1][1], d / L1) * s);
  else { ctx.lineTo(x + pts[1][0] * s, y + pts[1][1] * s); const q = (d - L1) / L2; ctx.lineTo(x + lerp(pts[1][0], pts[2][0], q) * s, y + lerp(pts[1][1], pts[2][1], q) * s); }
  ctx.stroke(); ctx.restore();
}
function crossOut(ctx, x0, y0, x1, y1, color, k = 1, lw = 10) {
  if (k <= 0) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(lerp(x0, x1, clamp(k)), lerp(y0, y1, clamp(k))); ctx.stroke(); ctx.restore();
}


function moeda(ctx, x, y, r, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(1, o.flat ?? 1);
  const g = ctx.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.1, 0, 0, r);
  const gold = o.prata ? ['#f3f4f6', '#9ca3af'] : ['#fde68a', '#b7791f'];
  g.addColorStop(0, gold[0]); g.addColorStop(1, gold[1]);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = r * 0.4; ctx.shadowOffsetY = r * 0.12; circle(ctx, 0, 0, r, gold[1]); ctx.restore();
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r * 0.94, 0, 6.283); ctx.fill();
  ctx.strokeStyle = 'rgba(80,50,10,0.35)'; ctx.lineWidth = r * 0.05; ctx.beginPath(); ctx.arc(0, 0, r * 0.78, 0, 6.283); ctx.stroke();
  text(ctx, o.label || 'R$', 0, 2, { size: r * 0.62, weight: 900, color: o.prata ? '#4b5563' : '#7c4a03' });
  ctx.restore();
}
function chip(ctx, x, y, str, color, k, o = {}) { // etiqueta arredondada que entra
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(k * 2); ctx.translate(x, y); const sc = lerp(0.6, 1, ease.back(clamp(k))); ctx.scale(sc, sc);
  ctx.font = font(o.size || 30, 900); const w = ctx.measureText(str).width + 50, h = (o.size || 30) * 1.7;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6; fillRR(ctx, -w / 2, -h / 2, w, h, h / 2, o.bg || '#0b1222'); ctx.restore();
  strokeRR(ctx, -w / 2, -h / 2, w, h, h / 2, color, 4);
  text(ctx, str, 0, 2, { size: o.size || 30, weight: 900, color: o.fg || color });
  ctx.restore();
}


// ================================================================ mapa de rotas (contorno do Brasil com aeroportos)
const BRASIL = [[-74, -8], [-70, -4], [-69, 1], [-64, 4], [-60, 5], [-56, 2], [-51, 4], [-50, 0], [-44, -2], [-38, -3.5], [-35, -5], [-35, -9], [-39, -13], [-40, -20], [-42, -23], [-44, -23], [-48, -26], [-49, -29], [-53, -33.7], [-57, -30], [-55, -27], [-54, -25], [-58, -20], [-58, -16], [-60, -14], [-65, -11], [-70, -11], [-73, -9]];
const CITY = { RBR: [-67.8, -10.0, 'Rio Branco'], PVH: [-63.9, -8.8, 'Porto Velho'], BVB: [-60.7, 2.8, 'Boa Vista'], MAO: [-60.0, -3.1, 'Manaus'], BSB: [-47.9, -15.8, 'Brasília'], GRU: [-46.5, -23.4, 'São Paulo'],
  GIG: [-43.2, -22.8, 'Rio'], CNF: [-43.9, -19.6, 'BH'], SSA: [-38.5, -13.0, 'Salvador'], REC: [-34.9, -8.1, 'Recife'], FOR: [-38.5, -3.8, 'Fortaleza'], BEL: [-48.5, -1.4, 'Belém'], POA: [-51.2, -30.0, 'Porto Alegre'],
  CGB: [-56.1, -15.6, 'Cuiabá'], CGR: [-54.6, -20.5, 'Campo Grande'], FLN: [-48.5, -27.6, 'Florianópolis'], CWB: [-49.3, -25.4, 'Curitiba'], VIX: [-40.3, -20.3, 'Vitória'], PVH2: [-63.9, -8.8, 'Porto Velho'], CPV: [-35.9, -7.2, 'Campina Grande'], BYO: [-56.5, -21.1, 'Bonito'], THE: [-42.8, -5.1, 'Teresina'] };
function mapaRotas(ctx, cx, cy, sc, a = 1) { // devolve pt(code|[lon,lat]) -> [x, y]
  const pt = (c) => { const [lon, lat] = typeof c === 'string' ? CITY[c] : c; return [cx + (lon + 54) * sc, cy - (lat + 14) * sc]; };
  if (a <= 0) return pt;
  ctx.save(); ctx.globalAlpha *= a;
  ctx.beginPath(); BRASIL.forEach(([lon, lat], i) => { const [x, y] = pt([lon, lat]); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath();
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, sc * 26); g.addColorStop(0, 'rgba(30,58,138,0.35)'); g.addColorStop(1, 'rgba(15,23,42,0.25)');
  ctx.fillStyle = g; ctx.fill();
  ctx.save(); ctx.shadowColor = 'rgba(56,189,248,0.6)'; ctx.shadowBlur = 18; ctx.strokeStyle = 'rgba(125,211,252,0.75)'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
  ctx.restore();
  return pt;
}
function aeroporto(ctx, x, y, code, k = 1, color = '#e2e8f0', o = {}) {
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(k * 2);
  circle(ctx, x, y, 9, color); circle(ctx, x, y, 4, '#0b1222');
  if (o.label !== false) text(ctx, o.name || code, x + (o.dx ?? 16), y + (o.dy ?? -18), { size: o.size || 24, weight: 900, color, align: o.align || 'left' });
  ctx.restore();
}

// ================================================================ cenário: a cozinha de manhã (fundo com paralaxe e desfoque)
// parede de azulejos, janelas com luz da manhã e folhagem lá fora, prateleira com potes e a bancada de madeira.
let KITCHEN = null;
function cozinhaFundo(ctx, cam, a = 1, escuro = 0) {
  if (!KITCHEN) {
    const Wd = 2600, Hd = 1400, r = rng(77);
    const c = document.createElement('canvas'); c.width = Wd; c.height = Hd; const g = c.getContext('2d');
    g.fillStyle = '#2f261f'; g.fillRect(0, 0, Wd, Hd);
    for (let y = 0; y < 900; y += 60) for (let x = ((y / 60) % 2) * 60 - 60; x < Wd; x += 120) { g.fillStyle = '#5a4b3e'; g.fillRect(x + 3, y + 3, 114, 54); }
    for (const wx of [260, 1420, 2200]) {
      const lg = g.createLinearGradient(0, 110, 0, 640); lg.addColorStop(0, '#ffe7b8'); lg.addColorStop(1, '#d0925a');
      g.fillStyle = '#1f1711'; g.fillRect(wx - 18, 92, 456, 566);
      g.fillStyle = lg; g.fillRect(wx, 110, 420, 530);
      for (let i = 0; i < 26; i++) { g.fillStyle = `rgba(${40 + r() * 30},${70 + r() * 40},${32 + r() * 20},0.6)`; g.beginPath(); g.arc(wx + r() * 420, 470 + r() * 170, 26 + r() * 46, 0, 6.283); g.fill(); }
      g.fillStyle = '#1f1711'; g.fillRect(wx + 200, 110, 20, 530); g.fillRect(wx, 360, 420, 16);
    }
    g.fillStyle = '#20160e'; g.fillRect(0, 735, Wd, 18);
    for (let x = 60; x < Wd; x += 230) { const h = 70 + r() * 50; g.fillStyle = 'rgba(210,225,235,0.30)'; g.fillRect(x, 735 - h, 80, h); g.fillStyle = r() > 0.5 ? '#3b2414' : '#c9a66b'; g.fillRect(x + 6, 735 - h * 0.7, 68, h * 0.7 - 4); }
    const wood = g.createLinearGradient(0, 900, 0, Hd); wood.addColorStop(0, '#7a4e2b'); wood.addColorStop(1, '#2a190d'); g.fillStyle = wood; g.fillRect(0, 900, Wd, Hd - 900);
    g.strokeStyle = 'rgba(0,0,0,0.28)'; g.lineWidth = 3;
    for (let y = 922; y < Hd; y += 36) { g.beginPath(); for (let x = 0; x <= Wd; x += 80) { const yy = y + Math.sin(x * 0.012 + y) * 5; x ? g.lineTo(x, yy) : g.moveTo(x, yy); } g.stroke(); }
    g.fillStyle = 'rgba(255,220,170,0.14)'; g.fillRect(0, 900, Wd, 10);
    const tmp = document.createElement('canvas'); tmp.width = Wd; tmp.height = Hd; const t2 = tmp.getContext('2d');
    t2.filter = 'blur(13px)'; for (const dx of [-Wd, 0, Wd]) t2.drawImage(c, dx, 0); KITCHEN = tmp;
  }
  layer(ctx, cam, 0.35, () => {
    ctx.save(); ctx.globalAlpha *= a;
    const cx = cam.x - (cam.x - 960) * 0.65, k0 = Math.floor((cx - 1500 + 340) / 2600), k1 = Math.floor((cx + 1500 + 340) / 2600);
    for (let k = k0; k <= k1; k++) ctx.drawImage(KITCHEN, -340 + k * 2600, -160);
    ctx.fillStyle = `rgba(6,10,20,${0.56 + 0.25 * escuro})`; ctx.fillRect(-340 + k0 * 2600, -160, (k1 - k0 + 1) * 2600, 1400);
    ctx.restore();
  });
}
// vapor e luz de janela perto da câmera (camada da frente)
function frente(ctx, cam, t, seed = 1, n = 10, color = '#ffe2b0', a = 0.11) {
  const r = rng(seed);
  layer(ctx, cam, 1.45, () => {
    for (let i = 0; i < n; i++) {
      const x = r() * 2600 - 340, y = r() * 1200 - 110, rad = 30 + r() * 70, ph = r() * 6.28;
      const g = ctx.createRadialGradient(x, y + Math.sin(t * 0.35 + ph) * 14, 0, x, y, rad);
      g.addColorStop(0, hexA(color, a * (0.6 + 0.4 * Math.sin(t * 0.6 + ph)))); g.addColorStop(1, hexA(color, 0));
      ctx.fillStyle = g; ctx.fillRect(x - rad, y - rad - 16, rad * 2, rad * 2 + 32);
    }
  });
}
// sombra de contato no tampo da bancada
function sombraChao(ctx, x, y, w, a = 0.45) {
  ctx.save(); const g = ctx.createRadialGradient(x, y, 0, x, y, w); g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, w, w * 0.16, 0, 0, 6.283); ctx.fill(); ctx.restore();
}

// ================================================================ o pacote a vácuo de 500 g ("tijolinho")
// o: { tipo: 'real'|'falso', verso, rot, a, hl (0..1 grifo no rótulo pequeno), corte (0..1 linha de corte no topo), cor, marca }
const PAC_W = 260, PAC_H = 400;
function pacote(ctx, x, y, s, o = {}) {
  const falso = o.tipo === 'falso';
  const cor = o.cor || (falso ? ['#7a5a2e', '#a37b42', '#5c4220'] : ['#4a140e', '#8f2c1d', '#3a0f0a']);
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  const L = -PAC_W / 2, T = -PAC_H / 2;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 34; ctx.shadowOffsetY = 14;
  const g = ctx.createLinearGradient(L, 0, -L, 0); g.addColorStop(0, cor[2]); g.addColorStop(0.45, cor[1]); g.addColorStop(1, cor[2]);
  ctx.fillStyle = g; rr(ctx, L, T, PAC_W, PAC_H, 18); ctx.fill(); ctx.restore();
  // vincos do vácuo
  ctx.save(); rr(ctx, L, T, PAC_W, PAC_H, 18); ctx.clip();
  const rv = rng(falso ? 5 : 3); ctx.strokeStyle = 'rgba(0,0,0,0.22)'; ctx.lineWidth = 3;
  for (let i = 0; i < 9; i++) { const yy = T + 40 + rv() * (PAC_H - 60); ctx.beginPath(); ctx.moveTo(L, yy); ctx.quadraticCurveTo(0, yy + (rv() - 0.5) * 50, -L, yy + (rv() - 0.5) * 30); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(255,255,255,0.10)'; ctx.lineWidth = 2;
  for (let i = 0; i < 7; i++) { const xx = L + 20 + rv() * (PAC_W - 40); ctx.beginPath(); ctx.moveTo(xx, T); ctx.lineTo(xx + (rv() - 0.5) * 40, -T); ctx.stroke(); }
  const sh = ctx.createLinearGradient(L, 0, -L, 0); sh.addColorStop(0, 'rgba(255,255,255,0)'); sh.addColorStop(0.3, 'rgba(255,255,255,0.16)'); sh.addColorStop(0.42, 'rgba(255,255,255,0)'); ctx.fillStyle = sh; ctx.fillRect(L, T, PAC_W, PAC_H);
  // solda de cima (serrilhada)
  ctx.fillStyle = 'rgba(0,0,0,0.30)'; ctx.fillRect(L, T, PAC_W, 26); ctx.fillStyle = 'rgba(255,255,255,0.12)'; for (let xx = L + 4; xx < -L; xx += 10) ctx.fillRect(xx, T + 4, 4, 18);
  ctx.restore();
  if (o.mini) {
    fillRR(ctx, L + 22, T + 58, PAC_W - 44, 150, 14, P.creme);
    text(ctx, 'CAFÉ', 0, T + 132, { size: 76, weight: 900, color: '#3f2410', letter: 3 });
  } else if (!o.verso) {
    fillRR(ctx, L + 22, T + 58, PAC_W - 44, 196, 14, P.creme);
    if (falso) {
      text(ctx, 'PÓ PARA PREPARO DE BEBIDA', 0, T + 80, { size: 11, weight: 700, color: '#7c5a2a' });
      text(ctx, 'SABOR', 0, T + 104, { size: 16, weight: 800, color: '#7c5a2a', letter: 2 });
      text(ctx, 'CAFÉ', 0, T + 158, { size: 72, weight: 900, color: '#4a2c10', letter: 3 });
      text(ctx, o.marca || 'TRADIÇÃO', 0, T + 222, { size: 24, weight: 900, color: '#7c2d12', letter: 2 });
      if (o.hl > 0) { // grifo no letreiro pequeno
        ctx.save(); ctx.globalCompositeOperation = 'multiply'; fillRR(ctx, L + 30, T + 68, (PAC_W - 60) * ease.out(clamp(o.hl)), 48, 6, '#facc15', 0.85); ctx.restore();
      }
    } else {
      text(ctx, 'CAFÉ', 0, T + 116, { size: 72, weight: 900, color: '#5a1a12', letter: 3 });
      text(ctx, 'TORRADO E MOÍDO', 0, T + 172, { size: 18, weight: 800, color: '#7c2d12', letter: 1 });
      text(ctx, o.marca || 'TRADICIONAL', 0, T + 216, { size: 24, weight: 900, color: '#7c2d12', letter: 2 });
    }
    ctx.save(); ctx.translate(-L - 52, T + 300); circle(ctx, 0, 0, 30, falso ? '#a3a3a3' : '#facc15'); circle(ctx, 0, 0, 24, falso ? '#737373' : '#ca8a04');
    text(ctx, falso ? 'SABOR' : 'PUREZA', 0, 1, { size: 10, weight: 900, color: '#1f1305' }); ctx.restore();
    text(ctx, '500 g', L + 70, T + 300, { size: 34, weight: 900, color: P.creme });
    text(ctx, 'EMBALADO A VÁCUO', 0, T + 360, { size: 14, weight: 800, color: 'rgba(245,230,200,0.75)', letter: 2 });
  } else {
    // verso: tabela, composição, lote, código de barras
    fillRR(ctx, L + 18, T + 46, PAC_W - 36, PAC_H - 70, 12, '#f8f1e3');
    text(ctx, 'INGREDIENTE: café torrado e moído', L + 32, T + 70, { size: 12, weight: 700, color: '#3f2410', align: 'left' });
    const linhas = o.linhas || ['PREDOMINANTEMENTE ARÁBICA'];
    linhas.forEach((ln, i) => text(ctx, ln, 0, T + 104 + i * 30, { size: 15, weight: 900, color: '#7c2d12' }));
    if (o.hl > 0) { ctx.save(); ctx.globalCompositeOperation = 'multiply'; fillRR(ctx, L + 26, T + 88 + (o.hlRow || 0) * 30, (PAC_W - 52) * ease.out(clamp(o.hl)), 32, 6, '#facc15', 0.9); ctx.restore(); }
    ctx.strokeStyle = '#3f2410'; ctx.lineWidth = 2; ctx.strokeRect(L + 32, T + 170, PAC_W - 64, 96);
    text(ctx, 'INFORMAÇÃO NUTRICIONAL', 0, T + 184, { size: 10, weight: 900, color: '#3f2410' });
    for (let i = 0; i < 4; i++) { ctx.fillStyle = 'rgba(63,36,16,0.35)'; ctx.fillRect(L + 40, T + 200 + i * 16, 110, 5); ctx.fillRect(-L - 80, T + 200 + i * 16, 40, 5); }
    text(ctx, 'LOTE 0726 · TORRA 07/2026', L + 32, T + 290, { size: 11, weight: 700, color: '#3f2410', align: 'left' });
    const rb = rng(12); let bx = L + 40; ctx.fillStyle = '#111827';
    while (bx < -L - 40) { const bw = 1 + Math.floor(rb() * 3.5); ctx.fillRect(bx, T + 306, bw, 44); bx += bw + 1 + Math.floor(rb() * 2); }
  }
  // linha de corte no topo (o pacote sendo aberto)
  if (o.corte > 0) {
    ctx.save(); ctx.strokeStyle = '#f8fafc'; ctx.lineWidth = 4; ctx.setLineDash([12, 8]);
    ctx.beginPath(); ctx.moveTo(L, T + 40); ctx.lineTo(L + PAC_W * ease.inOut(clamp(o.corte)), T + 40); ctx.stroke(); ctx.restore();
  }
  ctx.restore();
}
// janela de corte mostrando o que tem dentro: 'cafe' (pó fino) ou 'casca' (casca e graveto)
function recheio(ctx, x, y, w, h, tipo, k) {
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(k * 2);
  const sc = lerp(0.85, 1, ease.out(clamp(k)));
  ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 30; fillRR(ctx, -w / 2, -h / 2, w, h, 22, '#1a120c'); ctx.restore();
  ctx.save(); rr(ctx, -w / 2 + 10, -h / 2 + 10, w - 20, h - 20, 16); ctx.clip();
  const r = rng(tipo === 'casca' ? 21 : 22);
  if (tipo === 'casca') {
    ctx.fillStyle = '#6e5233'; ctx.fillRect(-w / 2, -h / 2, w, h);
    for (let i = 0; i < 70; i++) { // cascas (lascas claras)
      const px = (r() - 0.5) * w, py = (r() - 0.5) * h, a = r() * 6.28, s2 = 8 + r() * 16;
      ctx.save(); ctx.translate(px, py); ctx.rotate(a); ctx.fillStyle = r() > 0.5 ? '#c8a26b' : '#a47c48';
      ctx.beginPath(); ctx.ellipse(0, 0, s2, s2 * 0.45, 0, 0, 6.283); ctx.fill(); ctx.restore();
    }
    ctx.strokeStyle = '#3e2a16'; ctx.lineCap = 'round';
    for (let i = 0; i < 12; i++) { const px = (r() - 0.5) * w, py = (r() - 0.5) * h, a = r() * 6.28, L2 = 30 + r() * 40; ctx.lineWidth = 4 + r() * 3; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + Math.cos(a) * L2, py + Math.sin(a) * L2); ctx.stroke(); }
  } else {
    ctx.fillStyle = '#2b170b'; ctx.fillRect(-w / 2, -h / 2, w, h);
    for (let i = 0; i < 420; i++) { ctx.fillStyle = r() > 0.5 ? '#4a2a14' : '#1c0f07'; ctx.fillRect((r() - 0.5) * w, (r() - 0.5) * h, 3, 3); }
  }
  ctx.restore();
  strokeRR(ctx, -w / 2 + 10, -h / 2 + 10, w - 20, h - 20, 16, 'rgba(255,255,255,0.25)', 3);
  ctx.restore();
}
// grão de café (visto de cima, com o sulco)
function grao(ctx, x, y, s, rot = 0, cor = '#5b3216') {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const g = ctx.createRadialGradient(-4, -5, 1, 0, 0, 16); g.addColorStop(0, '#8a5530'); g.addColorStop(1, cor);
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, 11, 15, 0, 0, 6.283); ctx.fill();
  ctx.strokeStyle = 'rgba(20,10,4,0.85)'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(0, -12); ctx.bezierCurveTo(4, -4, -4, 4, 0, 12); ctx.stroke();
  ctx.restore();
}
// saca de juta de 60 kg com estêncil
function saca(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  sombraChao(ctx, 0, 190, 200, 0.5);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
  const g = ctx.createLinearGradient(-180, 0, 180, 0); g.addColorStop(0, '#7d5f36'); g.addColorStop(0.5, P.juta); g.addColorStop(1, '#6e5230');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-150, -170); ctx.quadraticCurveTo(0, -205, 150, -170); ctx.quadraticCurveTo(195, 0, 165, 175); ctx.quadraticCurveTo(0, 205, -165, 175); ctx.quadraticCurveTo(-195, 0, -150, -170); ctx.closePath(); ctx.fill(); ctx.restore();
  ctx.save(); ctx.clip(); ctx.strokeStyle = 'rgba(60,40,15,0.22)'; ctx.lineWidth = 2;
  for (let i = -200; i < 200; i += 8) { ctx.beginPath(); ctx.moveTo(i, -210); ctx.lineTo(i, 210); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-210, i); ctx.lineTo(210, i); ctx.stroke(); }
  ctx.restore();
  ctx.fillStyle = '#5a4220'; ctx.beginPath(); ctx.moveTo(-60, -186); ctx.quadraticCurveTo(0, -150, 60, -186); ctx.lineTo(40, -220); ctx.quadraticCurveTo(0, -205, -40, -220); ctx.closePath(); ctx.fill();
  text(ctx, 'CAFÉ', 0, -70, { size: 64, weight: 900, color: 'rgba(40,24,8,0.82)', letter: 6 });
  text(ctx, o.tipo || 'ARÁBICA', 0, 0, { size: 34, weight: 900, color: 'rgba(40,24,8,0.82)', letter: 4 });
  text(ctx, 'BENEFICIADO · 60 KG', 0, 60, { size: 22, weight: 800, color: 'rgba(40,24,8,0.75)', letter: 2 });
  ctx.restore();
}
// documento oficial (auto de apreensão) com campos que vão sendo preenchidos
function autoApreensao(ctx, x, y, s, o) {
  const Wd = 600, Hd = 700;
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || -0.03); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 16;
  const pg = ctx.createLinearGradient(0, -Hd / 2, 0, Hd / 2); pg.addColorStop(0, '#fbfaf5'); pg.addColorStop(1, '#ebe6d8');
  ctx.fillStyle = pg; ctx.fillRect(-Wd / 2, -Hd / 2, Wd, Hd); ctx.restore();
  ctx.fillStyle = '#14532d'; ctx.fillRect(-Wd / 2, -Hd / 2, Wd, 12);
  circle(ctx, -Wd / 2 + 62, -Hd / 2 + 70, 30, '#e5e7eb'); strokeRR(ctx, -Wd / 2 + 32, -Hd / 2 + 40, 60, 60, 30, '#14532d', 3);
  text(ctx, 'MINISTÉRIO DA AGRICULTURA', -Wd / 2 + 110, -Hd / 2 + 58, { size: 22, weight: 900, color: '#14532d', align: 'left', letter: 1 });
  text(ctx, 'E PECUÁRIA · FISCALIZAÇÃO', -Wd / 2 + 110, -Hd / 2 + 86, { size: 16, weight: 800, color: '#4b5563', align: 'left', letter: 2 });
  ctx.fillStyle = '#1f2937'; ctx.fillRect(-Wd / 2 + 30, -Hd / 2 + 120, Wd - 60, 3);
  text(ctx, 'AUTO DE APREENSÃO', 0, -Hd / 2 + 160, { size: 34, weight: 900, color: '#111827', letter: 3 });
  const campos = o.campos || [];
  campos.forEach(([lab, val, k], i) => {
    const yy = -Hd / 2 + 230 + i * 92;
    text(ctx, lab, -Wd / 2 + 40, yy, { size: 15, weight: 800, color: '#6b7280', align: 'left', letter: 2 });
    ctx.fillStyle = 'rgba(17,24,39,0.18)'; ctx.fillRect(-Wd / 2 + 40, yy + 46, Wd - 80, 2);
    if (k > 0) { // texto "escrito à máquina", letra a letra
      const n = Math.ceil(val.length * clamp(k));
      ctx.save(); ctx.font = MONO(24, 700); ctx.fillStyle = '#1e293b'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(val.slice(0, n), -Wd / 2 + 40, yy + 30); ctx.restore();
    }
  });
  ctx.restore();
}
// recorte de jornal com manchete
function jornal(ctx, x, y, s, o) {
  const Wd = 760, Hd = 560;
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0.02); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 16;
  ctx.fillStyle = '#efeadc'; ctx.beginPath(); const r = rng(31); ctx.moveTo(-Wd / 2, -Hd / 2);
  for (let i = 0; i <= 20; i++) ctx.lineTo(-Wd / 2 + (Wd * i) / 20, -Hd / 2 + (r() - 0.5) * 8);
  for (let i = 0; i <= 14; i++) ctx.lineTo(Wd / 2 + (r() - 0.5) * 8, -Hd / 2 + (Hd * i) / 14);
  for (let i = 20; i >= 0; i--) ctx.lineTo(-Wd / 2 + (Wd * i) / 20, Hd / 2 + (r() - 0.5) * 8);
  ctx.closePath(); ctx.fill(); ctx.restore();
  text(ctx, 'ECONOMIA', -Wd / 2 + 40, -Hd / 2 + 44, { size: 22, weight: 900, color: '#991b1b', align: 'left', letter: 4 });
  ctx.fillStyle = '#1f2937'; ctx.fillRect(-Wd / 2 + 40, -Hd / 2 + 66, Wd - 80, 3);
  const k = clamp(o.k ?? 1);
  if (k > 0) {
    ctx.save(); ctx.globalAlpha *= clamp(k * 2);
    text(ctx, 'Café tem a maior queda em 12 meses', -Wd / 2 + 40, -Hd / 2 + 120, { size: 38, weight: 900, color: '#111827', align: 'left' });
    text(ctx, 'desde o Plano Real', -Wd / 2 + 40, -Hd / 2 + 168, { size: 38, weight: 900, color: '#111827', align: 'left' });
    ctx.restore();
  }
  ctx.fillStyle = 'rgba(31,41,55,0.28)';
  for (let c2 = 0; c2 < 2; c2++) for (let i = 0; i < 9; i++) ctx.fillRect(-Wd / 2 + 40 + c2 * 360, -Hd / 2 + 222 + i * 26, i === 8 ? 180 : 320, 9);
  ctx.restore();
}
// etiqueta de preço que balança pendurada (cordão)
function etiquetaPend(ctx, x, y, s, str, sub, k, color = '#facc15', t = 0) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 2.2) * 0.06 * (1 - clamp(k - 1)) + (1 - ease.back(clamp(k))) * 0.5); ctx.scale(s, s); ctx.globalAlpha *= clamp(k * 2);
  ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -80); ctx.lineTo(0, -20); ctx.stroke();
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 8;
  ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(-110, 0); ctx.lineTo(0, -30); ctx.lineTo(110, 0); ctx.lineTo(110, 130); ctx.lineTo(-110, 130); ctx.closePath(); ctx.fill(); ctx.restore();
  circle(ctx, 0, -6, 7, '#1f2937');
  text(ctx, str, 0, 58, { size: 44, weight: 900, color: '#111827' });
  if (sub) text(ctx, sub, 0, 104, { size: 20, weight: 800, color: '#374151' });
  ctx.restore();
}
// bloco de calendário com o ano virando
function calendarioAno(ctx, x, y, s, de, para, k) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12; fillRR(ctx, -170, -150, 340, 300, 20, '#f8fafc'); ctx.restore();
  fillRR(ctx, -170, -150, 340, 80, 20, '#b91c1c'); ctx.fillStyle = '#b91c1c'; ctx.fillRect(-170, -100, 340, 30);
  for (const dx of [-90, 90]) { fillRR(ctx, dx - 9, -172, 18, 46, 8, '#94a3b8'); }
  text(ctx, 'ANO', 0, -110, { size: 28, weight: 900, color: '#fff', letter: 6 });
  const kk = clamp(k);
  if (kk < 0.5) { ctx.save(); ctx.translate(0, 40); ctx.scale(1, 1 - kk * 2); text(ctx, de, 0, 0, { size: 110, weight: 900, color: '#111827' }); ctx.restore(); }
  else { ctx.save(); ctx.translate(0, 40); ctx.scale(1, (kk - 0.5) * 2); text(ctx, para, 0, 0, { size: 110, weight: 900, color: '#111827' }); ctx.restore(); }
  ctx.restore();
}
// seta grossa vertical com rótulo (queda)
function setaQueda(ctx, x, y0, y1, k, color, w = 70) {
  if (k <= 0) return;
  const y = lerp(y0, y1, ease.out(clamp(k)));
  ctx.save(); ctx.shadowColor = hexA(color, 0.6); ctx.shadowBlur = 24; ctx.fillStyle = color;
  ctx.fillRect(x - w / 4, y0, w / 2, Math.max(0, y - y0 - w * 0.6));
  ctx.beginPath(); ctx.moveTo(x - w / 2, y - w * 0.7); ctx.lineTo(x + w / 2, y - w * 0.7); ctx.lineTo(x, y); ctx.closePath(); ctx.fill();
  ctx.restore();
}

// ================================================================ Cena 01: o café falso e a queda recorde
function scene01(K) {
  const tFev = K('Em fevereiro de 2025'), tOper = K('numa operação'), tSP = K('São Paulo'), tSC = K('Santa Catarina'), tPR = K('e Paraná'), tFisc = K('fiscais do Ministério da Agricultura');
  const tAcharam = K('acharam pacotes'), tPareciam = K('que pareciam café'), tNao = K('Não tinha um grão dentro'), tCasca = K('Era casca'), tResto = K('resto de lavoura'), tVend = K('vendido como pó'), tSabor = K('bebida sabor café');
  const tNaquele = K('Naquele ano'), tDez = K('dez marcas'), tProib = K('foram proibidas'), tLotes = K('tiveram lotes recolhidos'), tFraude = K('por fraude'), tSanit = K('problema sanitário');
  const tProd = K('O produto de verdade'), tCaro = K('tão caro'), tFals = K('valia a pena falsificar');
  const tUm = K('Um ano depois'), tVirou = K('a história virou'), tNos = K('Nos doze meses'), tJul = K('até julho de 2026'), tMaior = K('a maior queda de preço'), tPlano = K('desde o Plano Real');
  const tSo = K('Só que'), tRec = K('desde o recorde'), tGrao = K('o grão que vai dentro dele'), tDesp = K('despencou bem mais');
  const tEntao = K('Então, por que'), tEmb = K('a embalagem no mercado'), tMenos = K('caiu tão menos');
  const tHoje = K('Hoje a gente abre'), tPac = K('um pacote de café'), tCada = K('quem fica com cada real');
  const cam = [
    { t: 0, x: 900, y: 500, z: 1.12, dz: 0.004, dx: 3 }, { t: tSP - 0.3, x: 1060, y: 470, z: 1.1, d: 1.6, dx: 4 },
    { t: tFisc, x: 860, y: 490, z: 1.06, d: 1.6, dx: 3 },
    { t: tAcharam - 0.2, x: 1180, y: 500, z: 1.04, d: 1.5, dx: 4 }, { t: tNao, x: 1200, y: 480, z: 1.04, d: 1.4 }, { t: tVend - 0.2, x: 1000, y: 450, z: 1.1, d: 1.6, dx: -3 },
    { t: tNaquele - 0.4, x: 2400, y: 480, z: 1.0, d: 1.6, dz: 0.007 }, { t: tProib, x: 2420, y: 470, z: 1.06, d: 1.8 }, { t: tFraude, x: 2440, y: 520, z: 1.0, d: 1.4 },
    { t: tProd - 0.4, x: 3300, y: 480, z: 1.04, d: 1.5, dx: 4 }, { t: tFals - 0.3, x: 3320, y: 460, z: 1.12, d: 1.6 },
    { t: tUm - 0.3, x: 4500, y: 500, z: 1.0, d: 1.6, dx: 3 }, { t: tNos, x: 4560, y: 480, z: 1.04, d: 1.6 }, { t: tMaior, x: 4620, y: 470, z: 1.1, d: 2 },
    { t: tSo - 0.3, x: 5900, y: 500, z: 1.0, d: 1.6 }, { t: tDesp, x: 5880, y: 520, z: 1.06, d: 1.6 }, { t: tEntao - 0.2, x: 5900, y: 470, z: 1.02, d: 1.4 }, { t: tMenos, x: 5900, y: 500, z: 1.06, d: 1.6 },
    { t: tHoje - 0.4, x: 7300, y: 500, z: 1.0, d: 1.5, dx: 2 }, { t: tCada, x: 7300, y: 500, z: 1.08, d: 2.2 },
  ];
  const sfx = [[tFev, 'paper', 0.5, { dur: 0.5 }], [tSP, 'pop', 0.35], [tSC, 'pop', 0.35], [tPR, 'pop', 0.35], [tFisc, 'key', 0.4], [tFisc + 0.25, 'key', 0.35], [tFisc + 0.5, 'key', 0.35],
    [tAcharam, 'jute', 0.45], [tNao, 'tear', 0.55], [tNao + 0.4, 'buzz', 0.3], [tCasca, 'grains', 0.35, { dur: 0.6 }], [tResto, 'pop', 0.35], [tVend, 'whoosh', 0.3], [tSabor, 'pop', 0.45], [tSabor + 0.9, 'stamp', 0.65],
    [tDez, 'tick', 0.4], [tProib, 'stamp', 0.55], [tProib + 0.5, 'stamp', 0.45], [tLotes, 'stamp', 0.45], [tFraude, 'pop', 0.4], [tSanit, 'pop', 0.4],
    [tProd, 'swoosh', 0.3], [tCaro, 'meter', 0.45, { dur: 1.1 }], [tFals, 'hit', 0.5],
    [tUm, 'paper', 0.5], [tVirou, 'flip', 0.6, { dur: 0.5 }], [tNos, 'paper', 0.45, { dur: 0.5 }], [tMaior, 'drop', 0.55], [tPlano, 'impact', 0.45],
    [tRec, 'jute', 0.5], [tGrao, 'grains', 0.4, { dur: 0.7 }], [tDesp, 'drop', 0.6], [tEmb, 'pop', 0.35], [tMenos, 'hit', 0.45],
    [tPac - 0.1, 'vacuum', 0.7], [tCada, 'coin', 0.5]];
  return {
    accent: P.amber, cam, sfx, impacts: [tPlano, tMenos], trans: 'cut',
    draw(ctx, t, cam2) {
      cozinhaFundo(ctx, cam2, 0.95);
      // A: o auto de apreensão, o mapa e o pacote falso
      zone(ctx, cam2, 860, 1300, () => {
        const doc = appear(t, tFev - 0.1, 0.7), out = 1 - appear(t, tNaquele - 0.6, 0.5);
        autoApreensao(ctx, lerp(380, 520, ease.out(doc)), 470, 0.78, { a: doc * out, campos: [
          ['DATA', 'FEVEREIRO DE 2025', prog(t, tFev, 0.9)],
          ['LOCAL', 'SP · SC · PR', prog(t, tOper, 0.8)],
          ['PRODUTO', 'PÓ P/ BEBIDA SABOR CAFÉ', prog(t, tVend, 1.2)],
          ['SITUAÇÃO', 'SEM CAFÉ · APREENDIDO', prog(t, tSabor + 0.4, 1.0)],
        ] });
        // mapa do Sul e Sudeste com os três estados
        const km = vis(t, tOper - 0.2, tAcharam - 0.2, 0.5, 0.5);
        if (km > 0) {
          const pt = mapaRotas(ctx, 1240, 300, 17, km);
          for (const [code, nome, tt, dx, dy, al] of [['GRU', 'São Paulo', tSP, 18, -24, 'left'], ['CWB', 'Paraná', tPR, -20, -6, 'right'], ['FLN', 'Santa Catarina', tSC, 18, 30, 'left']]) {
            const p = pt(code), k = appear(t, tt, 0.4) * km;
            if (k > 0) { shockRing(ctx, t, tt, p[0], p[1], P.amber, 10, 70); aeroporto(ctx, p[0], p[1], code, k, P.amber, { name: nome, dx, dy, align: al, size: 28 }); }
          }
        }
        // o pacote falso
        const kp = appear(t, tAcharam, 0.6);
        if (kp > 0 && out > 0) {
          ctx.save(); ctx.globalAlpha *= out;
          sombraChao(ctx, 1180, 690, 170);
          pacote(ctx, 1180, lerp(380, 480, ease.out(kp)), lerp(0.9, 1.05, ease.out(prog(t, tVend - 0.2, 1))), { tipo: 'falso', a: clamp(kp * 2), rot: lerp(0.18, -0.03, ease.out(kp)), hl: prog(t, tSabor - 0.3, 0.7) });
          chip(ctx, 1180, 190, 'parecia café', P.creme, vis(t, tPareciam, tNao - 0.2), { size: 32 });
          recheio(ctx, 1560, 450, 300, 380, 'casca', vis(t, tNao, tVend - 0.3, 0.5, 0.4));
          chip(ctx, 1560, 220, 'nenhum grão de café', '#f87171', vis(t, tNao + 0.3, tVend - 0.3), { size: 30 });
          chip(ctx, 1560, 680, 'casca', '#d6b07a', vis(t, tCasca + 0.1, tVend - 0.3), { size: 30 });
          chip(ctx, 1560, 750, 'resto de lavoura', '#d6b07a', vis(t, tResto, tVend - 0.3), { size: 30 });
          if (t > tVend - 0.2) headline(ctx, 'bebida sabor café', 1180, 170, { size: 64, k: appear(t, tSabor, 0.5), hl: '#854d0e' });
          ovalStamp(ctx, 520, 680, 130, 58, [['APREENDIDO', -0.05, 0.38], ['MAPA · 2025', 0.42, 0.2]], '#b91c1c', appear(t, tSabor + 0.9, 0.35), -0.12);
          ctx.restore();
        }
      });
      // B: as dez marcas na prateleira
      zone(ctx, cam2, 2300, 2500, () => {
        if (t < tNaquele - 0.6 || t > tProd + 0.6) return;
        const kb = vis(t, tNaquele - 0.4, tProd, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= kb;
        fillRR(ctx, 1880, 715, 1040, 20, 6, '#3b2a1a'); fillRR(ctx, 1880, 455, 1040, 20, 6, '#3b2a1a');
        const cores = [['#14532d', '#1f7a43', '#0f3d21'], ['#1e3a8a', '#2b50b8', '#172c69'], ['#7c2d12', '#a3401c', '#5c210d'], ['#3f3f46', '#57575f', '#2a2a2f'], ['#7a5a2e', '#a37b42', '#5c4220'],
          ['#701a75', '#932297', '#53135a'], ['#4a140e', '#8f2c1d', '#3a0f0a'], ['#854d0e', '#a8641a', '#62390a'], ['#0f766e', '#139488', '#0b5750'], ['#3b2414', '#5a3820', '#2a190d']];
        for (let i = 0; i < 10; i++) {
          const row = Math.floor(i / 5), col = i % 5, px = 1990 + col * 205, py = row ? 610 : 350;
          const ki = appear(t, tNaquele - 0.5 + i * 0.12, 0.35);
          if (ki <= 0) continue;
          pacote(ctx, px, py + (1 - ease.out(ki)) * 30, 0.5, { mini: true, tipo: i % 3 === 0 ? 'falso' : 'real', cor: cores[i], a: clamp(ki * 2), marca: ['SERRA', 'BOM DIA', 'FAZENDA', 'MINEIRO', 'TRADIÇÃO', 'AROMA', 'DO SÍTIO', 'CASEIRO', 'VALE', 'FORTE'][i] });
          const st = i < 6 ? tProib + i * 0.09 : tLotes + (i - 6) * 0.1;
          rectStamp(ctx, px, py + 58, 184, 58, i < 6 ? 'PROIBIDO' : 'RECOLHIDO', '#dc2626', appear(t, st, 0.3), -0.14 + (i % 2) * 0.1, i < 6 ? 28 : 24);
        }
        headline(ctx, '10 marcas', 2400, 165, { size: 80, k: appear(t, tDez, 0.5), color: '#fecaca', color2: '#f87171' });
        chip(ctx, 2220, 770, 'fraude', '#f87171', appear(t, tFraude, 0.4), { size: 32 });
        chip(ctx, 2600, 770, 'problema sanitário', '#f87171', appear(t, tSanit, 0.4), { size: 32 });
        ctx.restore();
      });
      // B2: o café de verdade, caro
      zone(ctx, cam2, 3200, 3400, () => {
        if (t < tProd - 0.6 || t > tUm + 0.6) return;
        const k = vis(t, tProd - 0.3, tUm, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        sombraChao(ctx, 3150, 760, 200);
        pacote(ctx, 3150, 520, 1.15, { tipo: 'real', rot: -0.04 });
        const kc = prog(t, tCaro, 1.4);
        etiquetaPend(ctx, 3560, 330, 1.05, 'CARO', 'café moído · 2025', appear(t, tCaro, 0.6), '#facc15', t);
        // termômetro do preço subindo
        fillRR(ctx, 3740, 260, 40, 420, 20, '#1f2937'); fillRR(ctx, 3746, 266 + 408 * (1 - ease.out(kc)), 28, 408 * ease.out(kc), 14, '#ef4444');
        circle(ctx, 3760, 700, 36, '#ef4444');
        chip(ctx, 3560, 560, '+82% em 12 meses', '#f87171', appear(t, tCaro + 0.6, 0.4), { size: 28 });
        text(ctx, 'até mai/2025 · IPCA', 3560, 620, { size: 22, weight: 700, color: '#cbd5e1', alpha: appear(t, tCaro + 0.8, 0.4) });
        headline(ctx, 'valia a pena falsificar', 3330, 150, { size: 70, k: appear(t, tFals, 0.5), hl: '#7f1d1d' });
        ctx.restore();
      });
      // C: um ano depois, a manchete
      zone(ctx, cam2, 4400, 4700, () => {
        if (t < tUm - 0.6 || t > tSo + 0.6) return;
        const k = vis(t, tUm - 0.3, tSo, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        calendarioAno(ctx, 4130, 440, 0.95, '2025', '2026', prog(t, tVirou, 0.45));
        const kj = appear(t, tNos - 0.2, 0.7);
        if (kj > 0) {
          ctx.save(); ctx.translate((1 - ease.out(kj)) * 120, 0); ctx.globalAlpha *= clamp(kj * 2);
          jornal(ctx, 4760, 400, 0.85, { k: appear(t, tMaior - 0.3, 0.6), rot: 0.025 });
          ctx.restore();
        }
        bigNum(ctx, '−17,2%', 4760, 705, appear(t, tMaior, 0.5), { size: 96, color: P.grao });
        text(ctx, 'café moído · 12 meses até jul/2026 · IPCA', 4760, 765, { size: 24, weight: 700, color: '#cbd5e1', alpha: appear(t, tJul, 0.5) });
        chip(ctx, 4130, 680, 'série desde 1994', P.amber, appear(t, tPlano, 0.4), { size: 28 });
        ctx.restore();
      });
      // D: o grão despencou, o pacote nem tanto
      zone(ctx, cam2, 5800, 6000, () => {
        if (t < tSo - 0.6 || t > tHoje + 0.6) return;
        const k = vis(t, tSo - 0.3, tHoje - 0.1, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        const ks = appear(t, tRec - 0.2, 0.5), kpc = appear(t, tEmb - 0.3, 0.5);
        if (ks > 0) { ctx.save(); ctx.globalAlpha *= clamp(ks * 2); saca(ctx, 5560, lerp(300, 420, ease.out(ks)), 0.85, { tipo: 'ARÁBICA' }); ctx.restore(); }
        chip(ctx, 5560, 160, 'o grão', P.grao, appear(t, tGrao, 0.4), { size: 32 });
        setaQueda(ctx, 5800, 260, 690, prog(t, tDesp, 1.0), '#ef4444', 80);
        if (kpc > 0) { ctx.save(); ctx.globalAlpha *= clamp(kpc * 2); sombraChao(ctx, 6200, 600, 120); pacote(ctx, 6200, 420, 0.7, { tipo: 'real' }); ctx.restore(); }
        chip(ctx, 6200, 160, 'o pacote', P.creme, appear(t, tEmb, 0.4), { size: 32 });
        setaQueda(ctx, 6440, 260, 430, prog(t, tMenos - 0.2, 0.8), '#f59e0b', 80);
        headline(ctx, 'por que caiu tão menos?', 5900, 735, { size: 64, k: appear(t, tMenos, 0.5), hl: '#7c2d12' });
        ctx.restore();
      });
      // E: o pacote aberto na bancada
      zone(ctx, cam2, 7200, 7400, () => {
        if (t < tHoje - 0.9) return;
        const k = appear(t, tHoje - 0.7, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        sombraChao(ctx, 7300, 780, 210);
        pacote(ctx, 7300, 560, 1.15, { tipo: 'real', corte: prog(t, tPac - 0.4, 0.6), rot: lerp(0.06, 0, ease.out(k)) });
        // nuvem de ar/pó saindo quando o vácuo abre
        const kv = prog(t, tPac - 0.1, 1.2);
        if (kv > 0 && kv < 1) for (let i = 0; i < 14; i++) { const a = -Math.PI / 2 + (i - 7) * 0.12; circle(ctx, 7300 + Math.cos(a) * 160 * kv + (i - 7) * 8, 330 + Math.sin(a) * 120 * kv, 14 + 24 * kv, '#c8a27a', 0.3 * (1 - kv)); }
        headline(ctx, 'quem fica com cada real?', 7300, 170, { size: 74, k: appear(t, tCada, 0.5), hl: '#1e3a8a' });
        ctx.restore();
      });
      frente(ctx, cam2, t, 3, 10);
    },
    overlay(ctx, t) {
      const s = t < tNaquele ? 'Ministério da Agricultura; Anvisa (2025)' : t < tUm ? 'g1 (dez/2025); IBGE' : t < tSo ? 'IBGE · IPCA (jul/2026)' : 'Cepea; Abic';
      source(ctx, s, vis(t, tFev + 0.5, tHoje - 0.5, 0.5, 0.4));
    },
  };
}

// ================================================================ cenas em produção (só aparecem depois da cena 1)
function emProducao(n, titulo) {
  return () => ({
    accent: P.amber, cam: [{ t: 0, x: 960, y: 520, z: 1.02 }], sfx: [], impacts: [], trans: 'push',
    draw(ctx, t, cam2) { cozinhaFundo(ctx, cam2, 0.9); headline(ctx, titulo, 960, 460, { size: 70, k: 1 }); },
  });
}

export const SCENES = [
  { id: '01', name: 'o-cafe-falso', build: scene01 },
  { id: '02', name: 'o-tamanho-da-queda', build: emProducao(2, 'cena 2') },
  { id: '03', name: 'o-pacote-aberto', build: emProducao(3, 'cena 3') },
  { id: '04', name: 'a-roca', build: emProducao(4, 'cena 4') },
  { id: '05', name: 'por-que-caiu-pela-metade', build: emProducao(5, 'cena 5') },
  { id: '06', name: 'dentro-do-pacote', build: emProducao(6, 'cena 6') },
  { id: '07', name: 'quem-perde', build: emProducao(7, 'cena 7') },
  { id: '08', name: 'na-hora-da-compra', build: emProducao(8, 'cena 8') },
  { id: '09', name: 'fechamento', build: emProducao(9, 'cena 9') },
];
