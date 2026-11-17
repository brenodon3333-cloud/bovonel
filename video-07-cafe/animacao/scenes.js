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
    text(ctx, 'INGREDIENTE: café torrado e moído', L + 32, T + 70, { size: 10, maxWidth: PAC_W - 64, weight: 700, color: '#3f2410', align: 'left' });
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
  if (o.mini) { ctx.restore(); return; }
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


// ================================================================ objetos das cenas 2 a 9
// etiqueta de gôndola (layout real): descrição, preço grande, preço por quilo em letra miúda, código de barras
function etiquetaGondola(ctx, x, y, s, o) {
  const Wd = 620, Hd = 300;
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s * (o.sx ?? 1), s); ctx.globalAlpha *= o.a ?? 1;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12; fillRR(ctx, -Wd / 2, -Hd / 2, Wd, Hd, 10, '#fefce8'); ctx.restore();
  ctx.fillStyle = '#facc15'; ctx.fillRect(-Wd / 2, -Hd / 2, Wd, 58);
  text(ctx, o.desc || 'CAFÉ TORRADO E MOÍDO TRADICIONAL', -Wd / 2 + 24, -Hd / 2 + 30, { size: 22, weight: 900, color: '#111827', align: 'left' });
  if (o.data) text(ctx, o.data, Wd / 2 - 24, -Hd / 2 + 30, { size: 22, weight: 800, color: '#7c2d12', align: 'right' });
  text(ctx, 'R$', -Wd / 2 + 40, 6, { size: 40, weight: 900, color: '#111827', align: 'left' });
  text(ctx, o.preco || '', -Wd / 2 + 110, 10, { size: 112, weight: 900, color: '#b91c1c', align: 'left' });
  text(ctx, o.un || 'kg', Wd / 2 - 40, 28, { size: 30, weight: 800, color: '#374151', align: 'right' });
  text(ctx, o.miuda || 'PREÇO POR kg: R$ 49,50', -Wd / 2 + 24, Hd / 2 - 30, { size: 16, weight: 800, color: '#374151', align: 'left' });
  if (o.circ > 0) { ctx.save(); ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(-Wd / 2 + 140, Hd / 2 - 30, 140, 30, -0.03, -1.6, -1.6 + 6.283 * ease.out(clamp(o.circ))); ctx.stroke(); ctx.restore(); }
  const rb = rng(17); let bx = Wd / 2 - 190; ctx.fillStyle = '#111827';
  while (bx < Wd / 2 - 24) { const bw = 1 + Math.floor(rb() * 3); ctx.fillRect(bx, Hd / 2 - 58, bw, 40); bx += bw + 1 + Math.floor(rb() * 2); }
  ctx.restore();
}
// coador de pano no suporte sobre a jarra; dentro da jarra o pó assenta em camadas coloridas
// camadas: [{ v (0..1 da altura), color, k }]
function coadorJarra(ctx, x, y, s, camadas, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const JW = 300, JH = 520, base = 300;
  sombraChao(ctx, 0, base + 20, 220, 0.5);
  // jarra de vidro
  ctx.save(); ctx.fillStyle = 'rgba(200,225,240,0.10)'; rr(ctx, -JW / 2, base - JH, JW, JH, 26); ctx.fill(); ctx.restore();
  ctx.save(); rr(ctx, -JW / 2 + 10, base - JH + 10, JW - 20, JH - 20, 20); ctx.clip();
  let yy = base - 10;
  for (const c of camadas) {
    const h = (JH - 20) * c.v * ease.out(clamp(c.k ?? 1));
    if (h <= 0) continue;
    const g = ctx.createLinearGradient(-JW / 2, 0, JW / 2, 0); g.addColorStop(0, hexA(c.color, 0.75)); g.addColorStop(0.4, c.color); g.addColorStop(1, hexA(c.color, 0.7));
    ctx.fillStyle = g; ctx.fillRect(-JW / 2, yy - h, JW, h);
    const r = rng(Math.round(c.v * 1000)); ctx.fillStyle = 'rgba(0,0,0,0.18)'; for (let i = 0; i < h * 1.4; i++) ctx.fillRect((r() - 0.5) * JW, yy - r() * h, 3, 3);
    if (c.glow > 0) { ctx.save(); ctx.globalAlpha *= 0.35 * c.glow; ctx.fillStyle = '#ffffff'; ctx.fillRect(-JW / 2, yy - h, JW, h); ctx.restore(); }
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(-JW / 2, yy - h, JW, 3);
    c.top = yy - h; c.bot = yy; yy -= h;
  }
  ctx.restore();
  strokeRR(ctx, -JW / 2, base - JH, JW, JH, 26, 'rgba(220,240,255,0.55)', 5);
  ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(-JW / 2 + 22, base - JH + 30, 14, JH - 60);
  // alça
  ctx.strokeStyle = 'rgba(220,240,255,0.45)'; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(JW / 2 + 10, base - JH / 2, 80, -1.2, 1.2); ctx.stroke();
  // suporte e coador de pano
  if (o.coador !== false) {
    ctx.fillStyle = '#4b2e17'; ctx.fillRect(-JW / 2 - 40, base - JH - 30, JW + 80, 16);
    ctx.fillStyle = '#efe7d4'; ctx.beginPath(); ctx.moveTo(-120, base - JH - 26); ctx.quadraticCurveTo(0, base - JH + 150, 120, base - JH - 26); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 2; for (let i = -100; i <= 100; i += 20) { ctx.beginPath(); ctx.moveTo(i, base - JH - 22); ctx.lineTo(i * 0.2, base - JH + 110); ctx.stroke(); }
    fillRR(ctx, -132, base - JH - 40, 264, 20, 10, '#c9b48a');
  }
  ctx.restore();
  // devolve a posição das camadas em coordenadas da cena
  return camadas.map((c) => c.top == null ? null : { top: y + c.top * s, bot: y + c.bot * s, mid: y + ((c.top + c.bot) / 2) * s });
}
// sol, termômetro, floco de gelo e chuva (ícones de clima)
function iconeClima(ctx, kind, x, y, s, k, t = 0) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * lerp(0.6, 1, ease.back(clamp(k))), s * lerp(0.6, 1, ease.back(clamp(k)))); ctx.globalAlpha *= clamp(k * 2);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 20; circle(ctx, 0, 0, 74, '#0b1222'); ctx.restore(); strokeRR(ctx, -74, -74, 148, 148, 74, 'rgba(255,255,255,0.2)', 3);
  ctx.lineCap = 'round';
  if (kind === 'sol') { circle(ctx, 0, 0, 28, '#fbbf24'); ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 7; for (let i = 0; i < 8; i++) { const a = i * 0.785 + t * 0.4; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 38, Math.sin(a) * 38); ctx.lineTo(Math.cos(a) * 54, Math.sin(a) * 54); ctx.stroke(); } }
  else if (kind === 'calor') { fillRR(ctx, -10, -48, 20, 74, 10, '#e5e7eb'); fillRR(ctx, -5, -28, 10, 54, 5, '#ef4444'); circle(ctx, 0, 34, 18, '#ef4444'); }
  else if (kind === 'geada') { ctx.strokeStyle = '#bae6fd'; ctx.lineWidth = 7; for (let i = 0; i < 3; i++) { const a = i * 1.047; ctx.beginPath(); ctx.moveTo(Math.cos(a) * -46, Math.sin(a) * -46); ctx.lineTo(Math.cos(a) * 46, Math.sin(a) * 46); ctx.stroke(); } }
  else if (kind === 'chuva') { ctx.fillStyle = '#94a3b8'; ctx.beginPath(); ctx.arc(-18, -12, 22, 0, 6.283); ctx.arc(14, -18, 28, 0, 6.283); ctx.arc(30, -2, 18, 0, 6.283); ctx.fill(); ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 5; for (let i = 0; i < 4; i++) { const yy = 16 + ((t * 60 + i * 13) % 30); ctx.beginPath(); ctx.moveTo(-24 + i * 16, yy); ctx.lineTo(-30 + i * 16, yy + 14); ctx.stroke(); } }
  ctx.restore();
}
// gráfico desenhado com grãos de café enfileirados (pts: [[u 0..1, v 0..1]])
function graficoGraos(ctx, x, y, w, h, pts, k, o = {}) {
  ctx.save(); ctx.globalAlpha *= o.a ?? 1;
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 2; for (let i = 0; i <= 4; i++) { ctx.beginPath(); ctx.moveTo(x, y - (h * i) / 4); ctx.lineTo(x + w, y - (h * i) / 4); ctx.stroke(); }
  (o.eixo || []).forEach(([u, lab]) => text(ctx, lab, x + w * u, y + 34, { size: 22, weight: 800, color: '#94a3b8' }));
  // percorre a linha e põe um grão a cada ~22 px
  const seg = []; let L = 0;
  for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i], d = Math.hypot((b[0] - a[0]) * w, (b[1] - a[1]) * h); seg.push([a, b, d]); L += d; }
  const upto = L * clamp(k);
  let acc = 0, n = 0;
  for (const [a, b, d] of seg) {
    for (let s2 = 0; s2 < d; s2 += 22) {
      if (acc + s2 > upto) { ctx.restore(); return; }
      const u = s2 / d, px = x + w * lerp(a[0], b[0], u), py = y - h * lerp(a[1], b[1], u);
      grao(ctx, px, py, 0.62, Math.atan2(-(b[1] - a[1]) * h, (b[0] - a[0]) * w) + 1.57 + (n++ % 2) * 0.3);
    }
    acc += d;
  }
  ctx.restore();
}
// copo americano com café coado, no balcão
function copoAmericano(ctx, x, y, s, nivel = 0.8, t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  sombraChao(ctx, 0, 150, 120, 0.5);
  ctx.save(); ctx.beginPath(); ctx.moveTo(-90, -150); ctx.lineTo(90, -150); ctx.lineTo(70, 150); ctx.lineTo(-70, 150); ctx.closePath(); ctx.clip();
  ctx.fillStyle = 'rgba(210,230,240,0.12)'; ctx.fillRect(-100, -160, 200, 320);
  const top = 150 - 300 * nivel; const g = ctx.createLinearGradient(0, top, 0, 150); g.addColorStop(0, '#5a3015'); g.addColorStop(1, '#2a1406'); ctx.fillStyle = g; ctx.fillRect(-100, top, 200, 160 + 300);
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 3; for (let i = -90; i < 90; i += 15) { ctx.beginPath(); ctx.moveTo(i, -40); ctx.lineTo(i * 0.8, 150); ctx.stroke(); } // facetas do copo
  ctx.restore();
  ctx.strokeStyle = 'rgba(220,240,255,0.55)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-90, -150); ctx.lineTo(-70, 150); ctx.lineTo(70, 150); ctx.lineTo(90, -150); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 7; ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) { ctx.beginPath(); for (let k2 = 0; k2 <= 14; k2++) { const yy = -170 - k2 * 9, xx = (i - 1) * 30 + Math.sin(k2 * 0.5 + t * 2 + i) * 12; k2 ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke(); }
  ctx.restore();
}
// comanda de padaria (papel com o pedido)
function comanda(ctx, x, y, s, linhas, k) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y + (1 - ease.out(clamp(k))) * 40); ctx.rotate(0.05); ctx.scale(s, s); ctx.globalAlpha *= clamp(k * 2);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 10; ctx.fillStyle = '#fffdf5'; ctx.fillRect(-150, -170, 300, 340); ctx.restore();
  text(ctx, 'PADARIA', 0, -134, { size: 26, weight: 900, color: '#111827', letter: 4 });
  ctx.setLineDash([6, 6]); ctx.strokeStyle = '#9ca3af'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-130, -108); ctx.lineTo(130, -108); ctx.stroke(); ctx.setLineDash([]);
  linhas.forEach(([a, b, big], i) => { const yy = -70 + i * 56; ctx.save(); ctx.font = MONO(big ? 30 : 22, 800); ctx.fillStyle = '#111827'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.fillText(a, -130, yy); ctx.textAlign = 'right'; ctx.fillText(b, 130, yy); ctx.restore(); });
  ctx.restore();
}
// balança de pratos (adubo x sacas de café)
function balancaPratos(ctx, x, y, s, incl, esq, dir) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#9ca3af'; fillRR(ctx, -16, -260, 32, 300, 10, '#9ca3af'); fillRR(ctx, -140, 30, 280, 30, 12, '#6b7280');
  ctx.save(); ctx.translate(0, -250); ctx.rotate(incl); fillRR(ctx, -360, -10, 720, 20, 10, '#d1d5db');
  for (const [sx, fn] of [[-320, esq], [320, dir]]) {
    ctx.save(); ctx.translate(sx, 0); ctx.rotate(-incl);
    ctx.strokeStyle = '#d1d5db'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-110, 170); ctx.moveTo(0, 0); ctx.lineTo(110, 170); ctx.stroke();
    ctx.fillStyle = '#e5e7eb'; ctx.beginPath(); ctx.ellipse(0, 175, 140, 22, 0, 0, 6.283); ctx.fill();
    fn && fn(ctx); ctx.restore();
  }
  ctx.restore(); ctx.restore();
}
// saco de adubo
function sacoAdubo(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 20; fillRR(ctx, -100, -130, 200, 260, 26, '#e5e7eb'); ctx.restore();
  fillRR(ctx, -100, -60, 200, 90, 6, '#15803d');
  text(ctx, 'ADUBO', 0, -94, { size: 40, weight: 900, color: '#14532d', letter: 3 });
  text(ctx, 'NPK 20-05-20', 0, -15, { size: 26, weight: 900, color: '#ffffff' });
  text(ctx, '50 kg', 0, 80, { size: 34, weight: 900, color: '#374151' });
  ctx.restore();
}
// carrinho de supermercado visto de lado
function carrinho(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  sombraChao(ctx, 0, 230, 300, 0.5);
  ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 8; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(-320, -170); ctx.lineTo(-260, -170); ctx.lineTo(-220, 110); ctx.lineTo(240, 110); ctx.lineTo(280, -100); ctx.lineTo(-240, -100); ctx.stroke();
  ctx.lineWidth = 3; for (let i = -200; i <= 240; i += 40) { ctx.beginPath(); ctx.moveTo(i, -100); ctx.lineTo(i - (i > 200 ? 0 : 4), 110); ctx.stroke(); }
  for (let j = -60; j <= 80; j += 35) { ctx.beginPath(); ctx.moveTo(-230 + (j + 100) * 0.13, j); ctx.lineTo(260 - (j + 100) * 0.1, j); ctx.stroke(); }
  ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(-220, 110); ctx.lineTo(-190, 170); ctx.lineTo(220, 170); ctx.stroke();
  for (const wx of [-170, 200]) { circle(ctx, wx, 200, 26, '#1f2937'); circle(ctx, wx, 200, 9, '#9ca3af'); }
  ctx.restore();
}
// balança de cozinha digital com visor
function balancaCozinha(ctx, x, y, s, visor) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  sombraChao(ctx, 0, 60, 280, 0.5);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 24; fillRR(ctx, -260, -30, 520, 80, 20, '#e5e7eb'); ctx.restore();
  fillRR(ctx, -240, -50, 480, 26, 10, '#cbd5e1');
  fillRR(ctx, -110, -16, 220, 54, 8, '#0f172a');
  ctx.save(); ctx.font = MONO(36, 800); ctx.fillStyle = '#4ade80'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(visor, 0, 12); ctx.restore();
  ctx.restore();
}
function capsula(ctx, x, y, s, cor) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const g = ctx.createLinearGradient(-30, 0, 30, 0); g.addColorStop(0, hexA(cor, 0.7)); g.addColorStop(0.5, cor); g.addColorStop(1, hexA(cor, 0.6));
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-34, -20); ctx.lineTo(34, -20); ctx.lineTo(22, 22); ctx.lineTo(-22, 22); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#d1d5db'; ctx.beginPath(); ctx.ellipse(0, -20, 40, 9, 0, 0, 6.283); ctx.fill();
  ctx.restore();
}
// cafeteira elétrica com o botão de ligar (pedido de inscrição)
function cafeteira(ctx, x, y, s, press, fill, label, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  sombraChao(ctx, 0, 260, 300, 0.55);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 16;
  fillRR(ctx, -230, -300, 460, 120, 30, '#1f2937'); fillRR(ctx, 120, -300, 110, 560, 30, '#1f2937'); fillRR(ctx, -230, 200, 460, 60, 20, '#111827'); ctx.restore();
  fillRR(ctx, -210, -280, 420, 22, 10, '#374151');
  // jarra
  ctx.save(); ctx.beginPath(); ctx.moveTo(-190, -150); ctx.lineTo(90, -150); ctx.lineTo(110, 190); ctx.lineTo(-210, 190); ctx.closePath();
  ctx.fillStyle = 'rgba(200,225,240,0.12)'; ctx.fill(); ctx.clip();
  const lvl = 190 - 320 * clamp(fill); const g = ctx.createLinearGradient(0, lvl, 0, 190); g.addColorStop(0, '#6b3d1a'); g.addColorStop(1, '#2a1406');
  ctx.fillStyle = g; ctx.fillRect(-220, lvl, 340, 400); ctx.restore();
  ctx.strokeStyle = 'rgba(220,240,255,0.5)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-190, -150); ctx.lineTo(90, -150); ctx.lineTo(110, 190); ctx.lineTo(-210, 190); ctx.closePath(); ctx.stroke();
  // marcas da jarra
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 3; for (let i = 1; i <= 4; i++) { const yy = 190 - i * 64; ctx.beginPath(); ctx.moveTo(-150, yy); ctx.lineTo(-110, yy); ctx.stroke(); }
  if (fill > 0 && fill < 1) { ctx.strokeStyle = '#6b3d1a'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(-40, -170); ctx.lineTo(-40, lvl); ctx.stroke(); }
  // botão de ligar (rocker com luz)
  const pz = clamp(press), on = pz > 0.5;
  ctx.save(); ctx.translate(175, 60);
  ctx.save(); if (on) { ctx.shadowColor = 'rgba(248,113,113,0.9)'; ctx.shadowBlur = 40; } fillRR(ctx, -40, -70, 80, 140, 16, on ? '#ef4444' : '#7f1d1d'); ctx.restore();
  fillRR(ctx, -40, -70 + (on ? 70 : 0), 80, 70, 14, 'rgba(0,0,0,0.25)');
  ctx.restore();
  // etiqueta do botão
  ctx.save(); ctx.translate(-50, -215);
  text(ctx, label, 0, 0, { size: 46, weight: 900, color: on ? '#fecaca' : '#e5e7eb', letter: 2 });
  ctx.restore();
  ctx.restore();
}
// holerite (layout real) para o próximo vídeo
function holerite(ctx, x, y, s, k, t0, t) {
  if (k <= 0) return;
  const Wd = 860, Hd = 520;
  ctx.save(); ctx.translate(x, y + (1 - ease.out(clamp(k))) * 50); ctx.rotate(-0.02); ctx.scale(s, s); ctx.globalAlpha *= clamp(k * 2);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 16; ctx.fillStyle = '#fbfaf5'; ctx.fillRect(-Wd / 2, -Hd / 2, Wd, Hd); ctx.restore();
  text(ctx, 'RECIBO DE PAGAMENTO · 13º SALÁRIO', -Wd / 2 + 30, -Hd / 2 + 40, { size: 26, weight: 900, color: '#111827', align: 'left' });
  text(ctx, 'DEZ/2026', Wd / 2 - 30, -Hd / 2 + 40, { size: 22, weight: 800, color: '#6b7280', align: 'right' });
  ctx.fillStyle = '#111827'; ctx.fillRect(-Wd / 2 + 30, -Hd / 2 + 66, Wd - 60, 3);
  const rows = [['DESCRIÇÃO', 'PROVENTOS', 'DESCONTOS'], ['13º SALÁRIO', '?', ''], ['INSS', '', '?'], ['IMPOSTO DE RENDA', '', '0,00']];
  rows.forEach((r, i) => {
    const yy = -Hd / 2 + 112 + i * 66, b = i === 0;
    text(ctx, r[0], -Wd / 2 + 40, yy, { size: b ? 18 : 26, weight: b ? 800 : 900, color: b ? '#6b7280' : '#111827', align: 'left' });
    text(ctx, r[1], 180, yy, { size: b ? 18 : 28, weight: 900, color: b ? '#6b7280' : '#111827', align: 'right' });
    text(ctx, r[2], Wd / 2 - 40, yy, { size: b ? 18 : 28, weight: 900, color: b ? '#6b7280' : (r[2] === '0,00' ? '#15803d' : '#111827'), align: 'right' });
    ctx.fillStyle = 'rgba(17,24,39,0.12)'; ctx.fillRect(-Wd / 2 + 30, yy + 26, Wd - 60, 2);
  });
  if (t > t0) { ctx.save(); ctx.globalCompositeOperation = 'multiply'; fillRR(ctx, -Wd / 2 + 30, -Hd / 2 + 112 + 3 * 66 - 26, (Wd - 60) * ease.out(prog(t, t0, 0.6)), 52, 6, '#bbf7d0', 0.95); ctx.restore(); }
  text(ctx, 'LÍQUIDO A RECEBER', -Wd / 2 + 40, Hd / 2 - 50, { size: 24, weight: 900, color: '#111827', align: 'left' });
  text(ctx, 'R$ ?', Wd / 2 - 40, Hd / 2 - 50, { size: 40, weight: 900, color: '#1e3a8a', align: 'right' });
  ctx.restore();
}
// barra vertical empilhada (composição do preço), de baixo para cima
function pilha(ctx, x, yBase, w, hTotal, partes, o = {}) {
  let y = yBase;
  for (const p of partes) {
    const h = hTotal * p.v * clamp(p.k ?? 1);
    if (h <= 0) continue;
    ctx.save(); ctx.shadowColor = hexA(p.color, 0.4); ctx.shadowBlur = 16; fillRR(ctx, x - w / 2, y - h, w, h, 6, p.color); ctx.restore();
    if (p.lab && h > 40) text(ctx, p.lab, x, y - h / 2, { size: o.size || 30, weight: 900, color: '#0b1222' });
    y -= h;
  }
  return y;
}


// ================================================================ Cena 02: o tamanho da queda (etiqueta de gôndola)
function scene02(K) {
  const tPrim = K('Primeiro, o tamanho da queda'), tAssoc = K('A associação das indústrias'), tAcomp = K('acompanha o preço'), tAbril = K('Em abril do ano passado'), tPico = K('perto do pico');
  const tQuilo = K('o quilo do tradicional'), t65 = K('sessenta e cinco reais e meio'), tAgo = K('Em agosto deste ano'), t49 = K('quarenta e nove e cinquenta');
  const tMeio = K('No pacote de meio quilo'), t33 = K('uns trinta e três'), t25 = K('para uns vinte e cinco'), tGrande = K('É uma queda grande');
  const tSo = K('Só que ela veio depois'), tAlta = K('de uma alta muito maior'), tDev = K('e devolveu só uma parte'), tLugar = K('E tem um lugar'), tAlivio = K('sentiu alívio'), tBalcao = K('o balcão da padaria'), tChega = K('A gente chega nele');
  const cam = [
    { t: 0, x: 960, y: 500, z: 1.04, dx: 3 }, { t: tAbril - 0.3, x: 960, y: 470, z: 1.1, d: 1.6 }, { t: tAgo, x: 990, y: 480, z: 1.06, d: 1.4, dx: -3 },
    { t: tMeio - 0.4, x: 2400, y: 490, z: 1.0, d: 1.5, dx: 4 }, { t: t25, x: 2440, y: 480, z: 1.06, d: 1.6 },
    { t: tSo - 0.4, x: 3800, y: 480, z: 1.0, d: 1.6 }, { t: tDev, x: 3880, y: 470, z: 1.06, d: 1.8 },
    { t: tLugar - 0.4, x: 5200, y: 500, z: 1.0, d: 1.6 }, { t: tBalcao, x: 5200, y: 480, z: 1.1, d: 1.6 }, { t: tChega, x: 5240, y: 500, z: 1.02, d: 1.6, dx: 5 },
  ];
  const sfx = [[tPrim, 'pop', 0.35], [tAssoc, 'paper', 0.4], [tAbril, 'scan', 0.5], [tQuilo, 'meter', 0.45, { dur: 1.6 }], [tAgo, 'flip', 0.6, { dur: 0.45 }], [t49, 'drop', 0.5],
    [tMeio, 'swoosh', 0.3], [t33, 'pop', 0.4], [t25, 'pop', 0.4], [tGrande, 'ding', 0.4], [tAlta, 'riser', 0.35, { dur: 1.2 }], [tDev, 'drop', 0.45],
    [tLugar, 'whoosh', 0.3], [tBalcao, 'spoon', 0.5], [tChega, 'pop', 0.35]];
  return {
    accent: P.amber, cam, sfx, impacts: [t49], trans: 'push',
    draw(ctx, t, cam2) {
      cozinhaFundo(ctx, cam2, 0.9, 0.1);
      zone(ctx, cam2, 900, 1000, () => {
        chip(ctx, 960, 150, 'Abic · preço médio nos supermercados', P.amber, vis(t, tAssoc, tMeio - 0.4), { size: 30 });
        const ke = appear(t, tPrim + 0.2, 0.6);
        if (ke > 0) {
          const flip = prog(t, tAgo, 0.45), sx = Math.abs(Math.cos(flip * Math.PI)) * 0.98 + 0.02, depois = flip > 0.5;
          const v = depois ? counting(t, t49 - 0.3, 0.9, 65.5, 49.5) : counting(t, tQuilo, Math.max(0.6, t65 - tQuilo + 0.4), 0, 65.5);
          etiquetaGondola(ctx, 960, 450, 1.3, { a: clamp(ke * 2), sx, data: depois ? 'AGO/2026' : t < tAbril ? '' : 'ABR/2025', preco: t < tQuilo ? '--,--' : v.toFixed(2).replace('.', ','), miuda: 'PREÇO MÉDIO · TRADICIONAL', rot: -0.02 });
          chip(ctx, 960, 690, depois ? 'agosto de 2026' : 'perto do pico', depois ? P.grao : '#f87171', depois ? appear(t, t49, 0.4) : vis(t, tPico, tAgo), { size: 32 });
        }
        bigNum(ctx, '−24%', 1500, 690, vis(t, t49 + 0.7, tMeio - 0.4), { size: 80, color: P.grao });
      });
      zone(ctx, cam2, 2300, 2500, () => {
        if (t < tMeio - 0.6 || t > tLugar) return;
        const k = vis(t, tMeio - 0.3, tSo, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        for (const [px, tt, preco, data, cor] of [[2120, t33, '≈ R$ 33', 'abr/2025', '#fca5a5'], [2680, t25, '≈ R$ 25', 'ago/2026', '#bef264']]) {
          sombraChao(ctx, px, 740, 170); pacote(ctx, px, 540, 1.0, { tipo: 'real', rot: px > 2400 ? 0.03 : -0.03 });
          etiquetaPend(ctx, px + 250, 300, 0.95, preco, data, appear(t, tt, 0.6), cor, t);
        }
        arrow(ctx, 2330, 230, 2440, 230, '#e2e8f0', 7, appear(t, t25, 0.5));
        text(ctx, '500 g', 2400, 640, { size: 34, weight: 900, color: '#e2e8f0', alpha: appear(t, tMeio, 0.5) });
        chip(ctx, 2400, 150, 'queda grande, de verdade', P.grao, appear(t, tGrande, 0.4), { size: 32 });
        ctx.restore();
      });
      zone(ctx, cam2, 3700, 3900, () => {
        if (t < tSo - 0.6 || t > tChega) return;
        const k = vis(t, tSo - 0.3, tLugar, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        const base = 720, sc = 2.1, bars = [[3500, 100, '2021', tSo, '#94a3b8'], [3800, 216, 'pico · 2025', tAlta, '#ef4444'], [4100, 164, 'ago/2026', tDev, '#f59e0b']];
        fillRR(ctx, 3340, base, 920, 6, 3, '#475569');
        for (const [bx, v, lab, tt, cor] of bars) {
          const kb = appear(t, tt, 0.8); if (kb <= 0) continue;
          const h = v * sc * ease.out(kb);
          ctx.save(); ctx.shadowColor = hexA(cor, 0.5); ctx.shadowBlur = 20; fillRR(ctx, bx - 80, base - h, 160, h, 10, cor); ctx.restore();
          text(ctx, String(v), bx, base - h - 40, { size: 44, weight: 900, color: '#ffffff', alpha: clamp(kb * 2) });
          text(ctx, lab, bx, base + 44, { size: 28, weight: 800, color: '#cbd5e1', alpha: clamp(kb * 2) });
        }
        // o pedaço devolvido (216 -> 164), tracejado
        const kd = appear(t, tDev + 0.4, 0.6);
        if (kd > 0) {
          ctx.save(); ctx.globalAlpha *= kd; ctx.setLineDash([12, 10]); ctx.strokeStyle = P.grao; ctx.lineWidth = 5;
          ctx.strokeRect(4020, base - 216 * sc, 160, (216 - 164) * sc); ctx.restore();
          chip(ctx, 4330, base - 190 * sc, 'só isto voltou', P.grao, kd, { size: 30 });
        }
        text(ctx, 'preço do tradicional · 2021 = 100', 3800, 150, { size: 30, weight: 800, color: '#e2e8f0', alpha: appear(t, tSo, 0.5) });
        ctx.restore();
      });
      zone(ctx, cam2, 5100, 5300, () => {
        if (t < tLugar - 0.6) return;
        const k = appear(t, tLugar - 0.3, 0.6), blur = 7 - 7 * vis(t, tBalcao - 0.2, tChega + 0.3, 0.5, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        fillRR(ctx, 4700, 640, 1000, 40, 8, '#5b3a22'); fillRR(ctx, 4700, 680, 1000, 140, 0, '#3a2414');
        ctx.save(); if (blur > 0.3) ctx.filter = `blur(${blur.toFixed(1)}px)`;
        copoAmericano(ctx, 5100, 470, 0.95, 0.82, t);
        ctx.fillStyle = '#e5e7eb'; ctx.beginPath(); ctx.ellipse(5380, 620, 110, 20, 0, 0, 6.283); ctx.fill(); // pires do pão
        ctx.fillStyle = '#d6a15c'; ctx.beginPath(); ctx.ellipse(5380, 590, 80, 34, 0, 0, 6.283); ctx.fill();
        ctx.restore();
        headline(ctx, 'quase ninguém sentiu alívio', 5200, 180, { size: 62, k: appear(t, tAlivio - 0.2, 0.5), hl: '#7c2d12' });
        chip(ctx, 5200, 760, 'o balcão da padaria · daqui a pouco', P.creme, appear(t, tChega, 0.4), { size: 30 });
        ctx.restore();
      });
      frente(ctx, cam2, t, 5, 9);
    },
    overlay(ctx, t) { source(ctx, 'Abic (abr/2025, ago/2026); conta do canal', vis(t, tAssoc, tLugar - 0.3, 0.5, 0.4)); },
  };
}

// ================================================================ Cena 03: o pacote aberto (o pó assenta em camadas na jarra)
function scene03(K) {
  const tPega = K('Pega cem reais'), tPo = K('gastos nesse pó'), tConta = K('Pela conta do canal'), t58 = K('uns cinquenta e oito'), tPagam = K('pagam o grão'), tPlanta = K('para quem planta'), tRev = K('quem compra e revende a saca');
  const t24 = K('Uns vinte e quatro'), tTorr = K('ficam com a torrefação'), tTorra = K('que torra'), tMoi = K('mói'), tEmb = K('embala'), tEntr = K('e entrega'), tLucro = K('inclui o lucro dela');
  const t10 = K('Uns dez ficam'), tSuper = K('com o supermercado'), t8 = K('Sobram uns oito de imposto'), tIcms = K('quase tudo ICMS'), tCesta = K('na cesta básica'), tOu = K('Ou seja'), tManda = K('quem manda no preço é a roça');
  const cam = [
    { t: 0, x: 860, y: 480, z: 1.06, dz: 0.004 }, { t: t58, x: 1000, y: 480, z: 1.04, d: 1.6, dx: 4 }, { t: t24, x: 1080, y: 470, z: 1.04, d: 1.6 },
    { t: t8, x: 1040, y: 450, z: 1.04, d: 1.6, dx: -3 }, { t: tOu, x: 960, y: 480, z: 1.06, d: 1.6 }, { t: tManda, x: 900, y: 500, z: 1.1, d: 2 },
  ];
  const sfx = [[tPega, 'vacuum', 0.5], [tPo, 'grains', 0.5, { dur: 1.6 }], [tConta, 'pop', 0.35], [t58, 'grains', 0.45, { dur: 1 }], [tPlanta, 'pop', 0.35], [tRev, 'jute', 0.4],
    [t24, 'grains', 0.4, { dur: 0.8 }], [tTorra, 'tick', 0.4], [tMoi, 'grinder', 0.35, { dur: 0.6 }], [tEmb, 'vacuum', 0.3], [tEntr, 'truck', 0.3, { dur: 1.2 }], [tLucro, 'coin', 0.4],
    [t10, 'grains', 0.35, { dur: 0.6 }], [tSuper, 'scan', 0.4], [t8, 'grains', 0.3, { dur: 0.5 }], [tIcms, 'stamp', 0.45], [tOu, 'whoosh', 0.3], [tManda, 'hit', 0.45]];
  return {
    accent: P.grao, cam, sfx, impacts: [tManda], trans: 'push',
    draw(ctx, t, cam2) {
      cozinhaFundo(ctx, cam2, 0.95);
      const glow = appear(t, tManda - 0.2, 0.6);
      const camadas = [
        { v: 0.58, color: P.grao, k: prog(t, t58, 1.1), glow },
        { v: 0.24, color: P.torra, k: prog(t, t24, 1.0) },
        { v: 0.10, color: P.mercado, k: prog(t, t10, 0.8) },
        { v: 0.08, color: P.estado, k: prog(t, t8, 0.7) },
      ];
      const pos = coadorJarra(ctx, 640, 470, 0.95, camadas, { coador: t < t24 });
      // o pacote derramando o pó no coador
      const kp = vis(t, tPega - 0.2, t58 + 0.4, 0.5, 0.5);
      if (kp > 0) {
        pacote(ctx, 700, 130, 0.6, { tipo: 'real', rot: lerp(0, 2.2, ease.inOut(prog(t, tPega, 0.9))), a: kp });
        if (t > tPo - 0.3 && t < t58 + 0.4) { ctx.save(); ctx.globalAlpha *= kp; ctx.strokeStyle = '#4a2a14'; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(640, 170); ctx.lineTo(640, 230); ctx.stroke(); ctx.restore(); }
        chip(ctx, 1000, 160, 'R$ 100 em café', P.creme, vis(t, tPega + 0.3, tConta), { size: 32 });
      }
      chip(ctx, 1010, 160, 'conta do canal', P.amber, vis(t, tConta, tOu - 0.2), { size: 28 });
      // legenda: valor, quem, e o fio até a camada
      const rows = [
        [0, 650, 'R$ 58', 'o grão', P.grao, t58],
        [1, 480, 'R$ 24', 'a torrefação', P.torra, t24],
        [2, 350, 'R$ 10', 'o supermercado', P.mercado, t10],
        [3, 240, 'R$ 8', 'imposto', P.estado, t8],
      ];
      for (const [i, ry, val, lab, cor, tt] of rows) {
        const k = appear(t, tt + 0.2, 0.5); if (k <= 0 || !pos[i]) continue;
        ctx.save(); ctx.globalAlpha *= clamp(k * 2);
        ctx.strokeStyle = hexA(cor, 0.8); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(800, pos[i].mid); ctx.lineTo(1000, ry); ctx.lineTo(1040, ry); ctx.stroke(); circle(ctx, 800, pos[i].mid, 7, cor);
        glowText(ctx, val, 1060, ry, { size: 72, weight: 900, color: cor, glow: hexA(cor, 0.55), blur: 26, align: 'left' });
        text(ctx, lab, 1310, ry + 4, { size: 40, weight: 900, color: '#f1f5f9', align: 'left' });
        ctx.restore();
      }
      // detalhes de cada fatia
      chip(ctx, 1200, 718, 'quem planta', P.grao, appear(t, tPlanta, 0.4), { size: 26 });
      chip(ctx, 1500, 718, 'quem revende a saca', P.grao, appear(t, tRev, 0.4), { size: 26 });
      [[tTorra, 'torra', 1120], [tMoi, 'mói', 1265], [tEmb, 'embala', 1405], [tEntr, 'entrega', 1575], [tLucro, '+ lucro', 1745]].forEach(([tt, s2, cx]) => chip(ctx, cx, 545, s2, P.torra, appear(t, tt, 0.35), { size: 24 }));
      text(ctx, 'quase tudo ICMS · cesta básica (7% em SP)', 1060, 296, { size: 26, weight: 800, color: '#fcd34d', align: 'left', alpha: appear(t, tIcms, 0.5) });
      headline(ctx, 'quem manda é a roça', 960, 150, { size: 70, k: appear(t, tManda, 0.5), color: '#ecfccb', color2: P.grao });
      frente(ctx, cam2, t, 7, 8);
    },
    overlay(ctx, t) { source(ctx, 'conta do canal com Cepea, Abic e Sefaz-SP', vis(t, tConta, tOu, 0.5, 0.4)); },
  };
}

const fmtMil = (v) => 'R$ ' + Math.round(v).toLocaleString('pt-BR');
// visor de LED com o preço da saca
function visorLed(ctx, x, y, s, str, cor = '#fbbf24', titulo = '') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 24; fillRR(ctx, -200, -60, 400, 120, 16, '#05070b'); ctx.restore();
  strokeRR(ctx, -200, -60, 400, 120, 16, '#1f2937', 4);
  if (titulo) text(ctx, titulo, 0, -36, { size: 18, weight: 800, color: '#64748b', letter: 3 });
  ctx.save(); ctx.font = MONO(54, 800); ctx.fillStyle = cor; ctx.shadowColor = hexA(cor, 0.8); ctx.shadowBlur = 16; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(str, 0, 16); ctx.restore();
  ctx.restore();
}

// ================================================================ Cena 04: a roça (saca, Cepea, clima, recorde, safra recorde, preço de hoje)
function scene04(K) {
  const tNa = K('Na roça'), tSacas = K('em sacas de sessenta quilos'), tMuda = K('o preço muda todo dia'), tQuem = K('Quem acompanha é o Cepea'), tUSP = K('um centro de pesquisa da USP');
  const tSeca = K('de seca'), tCalor = K('calor'), tGeada = K('geada nas lavouras'), tSaca = K('a saca do arábica'), tSuave = K('o tipo mais suave'), tBateu = K('bateu recorde em fevereiro'), t2800 = K('quase dois mil e oitocentos');
  const tCon = K('O conilon'), tForte = K('o grão mais forte'), tES = K('Espírito Santo'), tRO = K('de Rondônia'), tTamb = K('também bateu recorde');
  const tAi = K('Aí o tempo ajudou'), tColheu = K('o Brasil colheu'), tSafra = K('a maior safra de café da história'), tConab = K('segundo a Conab');
  const tHoje = K('Hoje, a saca do arábica'), t1600 = K('perto de mil e seiscentos'), tAbaixo = K('abaixo de mil'), tCaiu = K('O arábica caiu uns quarenta'), tPerdeu = K('O conilon perdeu mais da metade');
  const cam = [
    { t: 0, x: 960, y: 500, z: 1.04, dx: 4 }, { t: tQuem - 0.2, x: 1080, y: 480, z: 1.06, d: 1.6 },
    { t: tDepois(), x: 2400, y: 480, z: 1.0, d: 1.6, dz: 0.006 }, { t: tBateu, x: 2480, y: 460, z: 1.06, d: 1.6 }, { t: tCon - 0.2, x: 2700, y: 480, z: 1.04, d: 1.6 },
    { t: tAi - 0.4, x: 3800, y: 500, z: 1.0, d: 1.6 }, { t: tSafra, x: 3800, y: 480, z: 1.06, d: 2 },
    { t: tHoje - 0.4, x: 5200, y: 480, z: 1.0, d: 1.6, dx: 3 }, { t: tCaiu, x: 5200, y: 490, z: 1.06, d: 1.8 },
  ];
  function tDepois() { return tSeca - 1.2; }
  const sfx = [[tNa + 0.1, 'jute', 0.6], [tSacas, 'pop', 0.35], [tMuda, 'meter', 0.4, { dur: 1.2 }], [tQuem, 'paper', 0.45], [tUSP, 'pop', 0.3],
    [tSeca, 'pop', 0.35], [tCalor, 'pop', 0.35], [tGeada, 'ice', 0.4, { dur: 0.6 }], [tSaca, 'grains', 0.4, { dur: 2.4 }], [tBateu, 'riser', 0.35, { dur: 1 }], [t2800, 'hit', 0.55],
    [tCon, 'whoosh', 0.3], [tES, 'pop', 0.35], [tRO, 'pop', 0.35], [tTamb, 'stamp', 0.4],
    [tAi, 'water', 0.35, { dur: 2 }], [tColheu, 'grains', 0.45, { dur: 1.6 }], [tSafra + 0.2, 'jute', 0.4], [tConab, 'pop', 0.35],
    [tHoje, 'meter', 0.4, { dur: 1.4 }], [tAbaixo, 'meter', 0.4, { dur: 1.2 }], [tCaiu, 'drop', 0.5], [tPerdeu, 'drop', 0.55]];
  return {
    accent: P.grao, cam, sfx, impacts: [t2800, tPerdeu], trans: 'push',
    draw(ctx, t, cam2) {
      cozinhaFundo(ctx, cam2, 0.7, 0.3);
      zone(ctx, cam2, 900, 1100, () => {
        if (t > tSeca + 0.8) return;
        const ks = appear(t, tNa - 0.1, 0.5);
        ctx.save(); ctx.globalAlpha *= 1 - appear(t, tSeca - 0.6, 0.5);
        if (ks > 0) saca(ctx, 700, lerp(160, 440, ease.in(clamp(ks))), 0.95, { tipo: 'ARÁBICA', a: clamp(ks * 3) });
        chip(ctx, 700, 150, 'saca de 60 kg', P.creme, appear(t, tSacas, 0.4), { size: 32 });
        const kv = appear(t, tMuda - 0.2, 0.5);
        if (kv > 0) { ctx.save(); ctx.globalAlpha *= kv; const v = 1580 + Math.floor((Math.sin(t * 3.1) * 0.5 + 0.5) * 60); visorLed(ctx, 1300, 330, 1.1, fmtMil(v), '#fbbf24', 'CAFÉ ARÁBICA · POR SACA'); ctx.restore(); }
        chip(ctx, 1300, 470, 'muda todo dia', '#fbbf24', appear(t, tMuda + 0.4, 0.4), { size: 28 });
        const kc = appear(t, tQuem, 0.5);
        if (kc > 0) {
          ctx.save(); ctx.translate(0, (1 - ease.out(kc)) * 40); ctx.globalAlpha *= clamp(kc * 2);
          fillRR(ctx, 1080, 560, 440, 170, 14, '#f8fafc');
          text(ctx, 'INDICADOR CEPEA/ESALQ', 1300, 604, { size: 26, weight: 900, color: '#14532d', letter: 1 });
          text(ctx, 'café arábica · tipo 6', 1300, 646, { size: 22, weight: 700, color: '#374151' });
          text(ctx, 'USP · Piracicaba (SP)', 1300, 694, { size: 24, weight: 900, color: '#1e3a8a', alpha: appear(t, tUSP, 0.4) });
          ctx.restore();
        }
        ctx.restore();
      });
      zone(ctx, cam2, 2300, 2800, () => {
        if (t < tSeca - 1.2 || t > tAi + 0.6) return;
        const k = vis(t, tSeca - 1, tAi, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        iconeClima(ctx, 'sol', 1990, 200, 0.75, appear(t, tSeca, 0.4), t);
        iconeClima(ctx, 'calor', 2150, 200, 0.75, appear(t, tCalor, 0.4), t);
        iconeClima(ctx, 'geada', 2310, 200, 0.75, appear(t, tGeada, 0.4), t);
        const pts = [[0, 962 / 2900], [0.4, 1386 / 2900], [0.75, 2769 / 2900]];
        graficoGraos(ctx, 1880, 690, 1000, 600, pts, prog(t, tSaca - 0.2, Math.max(1, tBateu - tSaca + 0.8)), { eixo: [[0, '2023'], [0.4, '2024'], [0.75, 'fev/2025']] });
        text(ctx, 'arábica · R$ por saca · médias do ano e recorde', 2380, 765, { size: 22, weight: 700, color: '#94a3b8', alpha: appear(t, tSaca, 0.5) });
        chip(ctx, 2800, 150, 'recorde: R$ 2.769', '#f87171', appear(t, t2800, 0.4), { size: 32 });
        shockRing(ctx, t, t2800, 2630, 690 - 600 * 2769 / 2900, '#f87171', 20, 160);
        // o conilon
        const kc = appear(t, tCon, 0.5);
        if (kc > 0) {
          ctx.save(); ctx.globalAlpha *= kc;
          fillRR(ctx, 2960, 260, 440, 500, 22, 'rgba(11,18,34,0.85)'); strokeRR(ctx, 2960, 260, 440, 500, 22, P.amber, 4);
          text(ctx, 'CONILON', 3180, 310, { size: 36, weight: 900, color: P.amber, letter: 3 });
          text(ctx, 'o grão mais forte', 3180, 356, { size: 24, weight: 700, color: '#e2e8f0', alpha: appear(t, tForte, 0.4) });
          const pt = mapaRotas(ctx, 3200, 470, 7.5, 1);
          for (const [code, nome, tt, dy] of [['VIX', 'ES', tES, -22], ['PVH', 'RO', tRO, -22]]) { const p = pt(code), kk = appear(t, tt, 0.4); if (kk > 0) { shockRing(ctx, t, tt, p[0], p[1], P.amber, 8, 50); aeroporto(ctx, p[0], p[1], code, kk, P.amber, { name: nome, dx: 14, dy, size: 26 }); } }
          chip(ctx, 3180, 700, 'recorde: R$ 2.102 · jan/2025', '#f87171', appear(t, tTamb, 0.4), { size: 24 });
          ctx.restore();
        }
        ctx.restore();
      });
      zone(ctx, cam2, 3700, 3900, () => {
        if (t < tAi - 0.6 || t > tHoje + 0.6) return;
        const k = vis(t, tAi - 0.3, tHoje, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        // terreiro de secagem visto de cima; o rodo puxa o grão e escreve a frase
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 30; fillRR(ctx, 3260, 300, 1080, 440, 16, '#8b8170'); ctx.restore();
        ctx.save(); rr(ctx, 3270, 310, 1060, 420, 12); ctx.clip();
        const r = rng(44); for (let i = 0; i < 900; i++) grao(ctx, 3270 + r() * 1060, 310 + r() * 420, 0.5, r() * 6.28, r() > 0.5 ? '#5b3216' : '#7a4a22');
        const kw = ease.inOut(prog(t, tSafra - 0.2, 1.6)), xr = 3300 + 1000 * kw;
        ctx.fillStyle = '#9c9282'; ctx.fillRect(3270, 455, xr - 3270, 130);
        ctx.beginPath(); ctx.rect(3270, 455, xr - 3270, 130); ctx.clip();
        text(ctx, 'MAIOR SAFRA DA HISTÓRIA', 3800, 522, { size: 64, weight: 900, color: '#3f2410', letter: 2 });
        ctx.restore();
        if (kw > 0 && kw < 1) { fillRR(ctx, xr - 8, 440, 16, 160, 6, '#d6d3d1'); ctx.strokeStyle = '#a16207'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(xr, 520); ctx.lineTo(xr + 160, 360); ctx.stroke(); }
        iconeClima(ctx, 'chuva', 4430, 230, 0.8, vis(t, tAi - 0.1, tSafra + 1.2), t);
        chip(ctx, 3800, 230, '2026 · 67,6 milhões de sacas · Conab', P.grao, appear(t, tConab, 0.4), { size: 30 });
        ctx.restore();
      });
      zone(ctx, cam2, 5100, 5300, () => {
        if (t < tHoje - 0.6) return;
        const k = appear(t, tHoje - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        saca(ctx, 4930, 470, 0.8, { tipo: 'ARÁBICA' }); saca(ctx, 5470, 470, 0.8, { tipo: 'CONILON' });
        visorLed(ctx, 4930, 190, 0.85, fmtMil(counting(t, t1600 - 0.6, 1.2, 2769, 1604)), '#fbbf24', 'ARÁBICA · HOJE');
        visorLed(ctx, 5470, 190, 0.85, fmtMil(counting(t, tAbaixo - 0.6, 1.2, 2102, 975)), '#fbbf24', 'CONILON · HOJE');
        bigNum(ctx, '−42%', 4930, 730, appear(t, tCaiu + 0.4, 0.5), { size: 84, color: '#f87171' });
        bigNum(ctx, '−54%', 5470, 730, appear(t, tPerdeu + 0.3, 0.5), { size: 84, color: '#f87171' });
        text(ctx, 'desde o recorde', 5200, 800, { size: 26, weight: 800, color: '#cbd5e1', alpha: appear(t, tCaiu + 0.6, 0.5) });
        ctx.restore();
      });
      frente(ctx, cam2, t, 9, 8, '#d9f99d', 0.07);
    },
    overlay(ctx, t) { source(ctx, t < tAi ? 'Cepea/Esalq (2023 a 2025)' : t < tHoje ? 'Conab (set/2026)' : 'Cepea/Esalq (nov/2026)', vis(t, tQuem, 999, 0.5)); },
  };
}

// ================================================================ Cena 05: a virada (por que o pacote cai pela metade)
// única transição de efeito do vídeo: a água quente cai no coador e o vapor cobre a tela.
function scene05(K) {
  const tExp = K('A explicação tem três partes'), tPrim = K('a primeira quase ninguém conta'), tSub = K('Na subida'), tAcomp = K('não acompanhou o grão');
  const t2021 = K('De 2021 a 2025'), tPagou = K('o que a indústria pagou pelo arábica'), tTrip = K('mais que triplicou'), tPrat = K('Na prateleira, a alta foi bem menor'), tDobro = K('pouco mais que o dobro');
  const tNoPico = K('No pico, as torrefações'), tSeg = K('seguraram parte do aumento'), tMarg = K('margem apertada'), tDizem = K('elas mesmas dizem isso');
  const tConta = K('Pela conta do canal'), t80 = K('uns oitenta por cento'), tVolt = K('essa margem está voltando'), tCom = tVolt - 1.4;
  const tSeg2 = K('A segunda parte é matemática'), tSo = K('Só o pedaço do grão caiu'), tResto = K('O resto do caminho continua'), tCom2 = K('Com o grão valendo pouco mais da metade'), tQueda = K('a queda na prateleira fica');
  const tTerc = K('A terceira'), tCompra = K('a torrefação compra com meses'), tPoHoje = K('O pó de hoje'), tCaro = K('grão caro de ontem');
  const cam = [
    { t: 0, x: 960, y: 500, z: 1.1, dz: 0.004 }, { t: t2021 - 0.3, x: 960, y: 490, z: 1.04, d: 1.6, dx: 3 }, { t: tTrip, x: 900, y: 470, z: 1.08, d: 1.4 }, { t: tDobro, x: 1020, y: 480, z: 1.06, d: 1.4 },
    { t: tNoPico - 0.4, x: 2400, y: 490, z: 1.0, d: 1.6, dz: 0.006 }, { t: t80, x: 2360, y: 470, z: 1.08, d: 1.6 }, { t: tVolt, x: 2400, y: 490, z: 1.02, d: 1.6 },
    { t: tSeg2 - 0.4, x: 3800, y: 490, z: 1.0, d: 1.6 }, { t: tSo, x: 3880, y: 480, z: 1.06, d: 1.6 }, { t: tQueda, x: 3820, y: 480, z: 1.08, d: 1.8 },
    { t: tTerc - 0.4, x: 5200, y: 490, z: 1.0, d: 1.6, dx: 4 }, { t: tPoHoje, x: 5300, y: 480, z: 1.08, d: 1.8 },
  ];
  const sfx = [[0, 'pour', 0.5, { dur: 1.4 }], [0.1, 'steam', 0.5, { dur: 1.6 }], [tExp + 0.6, 'pop', 0.35], [tExp + 0.8, 'pop', 0.35], [tExp + 1.0, 'pop', 0.35], [tPrim, 'click', 0.5],
    [t2021, 'paper', 0.4], [tPagou, 'riser', 0.3, { dur: 1.6 }], [tTrip, 'hit', 0.5], [tPrat, 'pop', 0.4], [tDobro, 'pop', 0.45],
    [tNoPico, 'whoosh', 0.3], [tSeg, 'weight', 0.45], [tMarg, 'weight', 0.4], [tDizem, 'paper', 0.4], [tConta, 'pop', 0.35], [t80, 'hit', 0.45], [tVolt, 'riser', 0.25, { dur: 0.8 }],
    [tSeg2, 'click', 0.5], [tSo, 'drop', 0.5], [tResto, 'tick', 0.4], [tQueda, 'drop', 0.4],
    [tTerc, 'click', 0.5], [tCompra, 'paper', 0.45], [tPoHoje, 'grains', 0.35, { dur: 0.8 }], [tCaro, 'pop', 0.4]];
  return {
    accent: P.torra, cam, sfx, impacts: [tTrip, t80], trans: 'cut',
    draw(ctx, t, cam2) {
      cozinhaFundo(ctx, cam2, 0.85, 0.15);
      // parte 1a: subida 2021-2025, o grão x a prateleira (cilindros)
      zone(ctx, cam2, 900, 1100, () => {
        if (t > tNoPico + 0.6) return;
        const k = vis(t, 0.8, tNoPico, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        fillRR(ctx, 520, 700, 880, 6, 3, '#475569');
        const g = counting(t, tPagou, Math.max(1, tTrip - tPagou + 0.4), 1, 3.12), p2 = counting(t, tPrat, Math.max(1, tDobro - tPrat + 0.4), 1, 2.16), u = 105;
        const kb = appear(t, tSub, 0.6);
        for (const [bx, v, cor, lab, val] of [[760, g, P.grao, 'o grão (arábica)', '×' + g.toFixed(1).replace('.', ',')], [1160, p2, '#c2410c', 'na prateleira', '×' + p2.toFixed(1).replace('.', ',')]]) {
          if (kb <= 0) continue;
          const h = u * v * ease.out(kb);
          ctx.save(); ctx.shadowColor = hexA(cor, 0.5); ctx.shadowBlur = 22; fillRR(ctx, bx - 90, 700 - h, 180, h, 14, cor); ctx.restore();
          ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(bx - 70, 700 - h + 10, 14, h - 20);
          text(ctx, val, bx, 700 - h - 44, { size: 54, weight: 900, color: '#ffffff' });
          text(ctx, lab, bx, 742, { size: 28, weight: 800, color: '#cbd5e1' });
        }
        chip(ctx, 960, 250, '2021 a 2025', '#e2e8f0', appear(t, t2021, 0.4), { size: 30 });
        headline(ctx, 'por que o pacote caiu tão menos?', 960, 330, { size: 60, k: vis(t, 1.0, tSub, 0.5, 0.4), hl: '#7c2d12' });
        ctx.restore();
      });
      // parte 1b: a margem espremida no pico e voltando (pilha do preço)
      zone(ctx, cam2, 2300, 2500, () => {
        if (t < tNoPico - 0.6 || t > tSeg2 + 0.6) return;
        const k = vis(t, tNoPico - 0.3, tSeg2, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        const gv = lerp(lerp(0.58, 0.80, ease.inOut(prog(t, tSeg, 1.6))), 0.58, ease.inOut(prog(t, tCom, 1.6)));
        const partes = [{ v: gv, color: P.grao, lab: 'grão' }, { v: 1 - gv - 0.18, color: P.torra }, { v: 0.10, color: P.mercado }, { v: 0.08, color: P.estado }];
        const H0 = 520, base = 770, x = 2160;
        pilha(ctx, x, base, 230, H0, partes, { size: 34 });
        strokeRR(ctx, x - 115, base - H0, 230, H0, 8, 'rgba(255,255,255,0.35)', 3);
        const yT = base - H0 * gv, hT = H0 * (1 - gv - 0.18);
        ctx.save(); ctx.strokeStyle = P.torra; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + 120, yT - hT / 2); ctx.lineTo(x + 230, yT - hT / 2); ctx.stroke(); ctx.restore();
        text(ctx, 'margem da torrefação', x + 250, yT - hT / 2, { size: 34, weight: 900, color: '#93c5fd', align: 'left' });
        text(ctx, t < tCom ? 'no pico (2025)' : 'agora (2026)', x, base - H0 - 40, { size: 32, weight: 900, color: '#e2e8f0' });
        chip(ctx, 2650, 200, 'a indústria diz que segurou parte da alta', '#93c5fd', appear(t, tDizem, 0.4), { size: 28 });
        bigNum(ctx, gv > 0.7 ? 'uns 80% era grão' : gv < 0.6 && t > tCom ? 'uns 58%' : '', 2650, 640, appear(t, t80, 0.5), { size: 64, color: P.grao });
        chip(ctx, 2650, 740, 'conta do canal', P.amber, appear(t, tConta, 0.4), { size: 26 });
        ctx.restore();
      });
      // parte 2: só o grão cai (duas pilhas, antes e depois)
      zone(ctx, cam2, 3700, 3900, () => {
        if (t < tSeg2 - 0.6 || t > tTerc + 0.6) return;
        const k = vis(t, tSeg2 - 0.3, tTerc, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        const H0 = 440, base = 700, kq = ease.inOut(prog(t, tSo, 1.4));
        const antes = [{ v: 0.55, color: P.grao, lab: 'grão' }, { v: 0.45, color: '#64748b', lab: 'o resto' }];
        const depois = [{ v: lerp(0.55, 0.30, kq), color: P.grao, lab: 'grão' }, { v: 0.45, color: '#64748b', lab: 'o resto' }];
        pilha(ctx, 3540, base, 220, H0, antes, { size: 30 }); pilha(ctx, 4060, base, 220, H0, depois, { size: 30 });
        text(ctx, 'antes', 3540, 740, { size: 28, weight: 800, color: '#cbd5e1' }); text(ctx, 'depois', 4060, 740, { size: 28, weight: 800, color: '#cbd5e1' });
        ctx.save(); ctx.setLineDash([12, 10]); ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(3400, base - H0); ctx.lineTo(4200, base - H0); ctx.stroke(); ctx.restore();
        chip(ctx, 4300, base - H0 * 0.15, 'grão: uns −45%', P.grao, appear(t, tSo + 0.8, 0.4), { size: 28 });
        chip(ctx, 4300, base - H0 * 0.55, 'o resto: igual', '#cbd5e1', appear(t, tResto, 0.4), { size: 28 });
        arrow(ctx, 4200, base - H0, 4200, base - H0 * 0.75, '#f59e0b', 7, appear(t, tQueda, 0.5));
        bigNum(ctx, 'pacote: uns −25%', 3800, 180, appear(t, tQueda + 0.3, 0.5), { size: 64, color: '#fbbf24' });
        ctx.restore();
      });
      // parte 3: a compra feita meses antes
      zone(ctx, cam2, 5100, 5400, () => {
        if (t < tTerc - 0.6) return;
        const k = appear(t, tTerc - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        const meses = ['MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO'];
        meses.forEach((m, i) => { const bx = 4760 + i * 170; fillRR(ctx, bx - 70, 560, 140, 120, 12, '#f8fafc'); fillRR(ctx, bx - 70, 560, 140, 34, 12, '#b91c1c'); ctx.fillStyle = '#b91c1c'; ctx.fillRect(bx - 70, 580, 140, 14); text(ctx, m, bx, 636, { size: 34, weight: 900, color: '#111827' }); });
        const kc = appear(t, tCompra, 0.6);
        if (kc > 0) { saca(ctx, 4760, 400, 0.5, { tipo: 'COMPRA', a: clamp(kc * 2) }); }
        arrow(ctx, 4840, 470, 5560, 470, '#e2e8f0', 7, prog(t, tCompra + 0.6, 1.2));
        const kp = appear(t, tPoHoje, 0.5);
        if (kp > 0) { pacote(ctx, 5610, 400, 0.6, { tipo: 'real', a: clamp(kp * 2) }); }
        chip(ctx, 5200, 260, 'compra com meses de antecedência', '#e2e8f0', appear(t, tCompra + 0.3, 0.4), { size: 30 });
        chip(ctx, 5610, 750, 'um pouco do grão caro', '#f87171', appear(t, tCaro, 0.4), { size: 28 });
        ctx.restore();
      });
      frente(ctx, cam2, t, 11, 8);
    },
    overlay(ctx, t) {
      // as três partes (abas numeradas), fixas no canto de cima
      const parte = t < tSeg2 ? 1 : t < tTerc ? 2 : 3;
      ctx.save(); ctx.globalAlpha *= appear(t, tExp + 0.5, 0.5);
      [1, 2, 3].forEach((n, i) => { const on = n === parte, kk = appear(t, tExp + 0.6 + i * 0.2, 0.35); if (kk <= 0) return;
        const bx = 110 + i * 90; ctx.save(); ctx.globalAlpha *= clamp(kk * 2); fillRR(ctx, bx - 36, 40, 72, 58, 12, on ? P.amber : '#1e293b'); strokeRR(ctx, bx - 36, 40, 72, 58, 12, on ? '#fde68a' : '#334155', 3);
        text(ctx, String(n), bx, 70, { size: 36, weight: 900, color: on ? '#0b1222' : '#94a3b8' }); ctx.restore(); });
      ctx.restore();
      // o vapor do coador cobrindo a tela e abrindo a cena (a transição de efeito do vídeo)
      const kv = 1 - prog(t, 0.15, 1.3);
      if (kv > 0) {
        const r = rng(5);
        for (let i = 0; i < 26; i++) { const x = r() * W, y = H - ((r() * H + t * 500) % (H + 300)) + 150, rad = 200 + r() * 260;
          const g = ctx.createRadialGradient(x, y, 0, x, y, rad); g.addColorStop(0, `rgba(240,240,235,${0.55 * kv})`); g.addColorStop(1, 'rgba(240,240,235,0)'); ctx.fillStyle = g; ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
        ctx.fillStyle = `rgba(235,235,230,${0.6 * kv * kv})`; ctx.fillRect(0, 0, W, H);
      }
      source(ctx, t < tSeg2 ? 'Abic (2021 a 2025); conta do canal' : 'conta do canal', vis(t, t2021, 999, 0.5));
    },
  };
}

// dosador de vidro (tubo com grãos) que despeja no pacote
function dosador(ctx, x, y, h, nivel, cor, fluxo, t, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = 'rgba(200,225,240,0.10)'; rr(ctx, -60, -h, 120, h, 18); ctx.fill();
  ctx.save(); rr(ctx, -54, -h + 6, 108, h - 12, 14); ctx.clip();
  const hh = (h - 12) * clamp(nivel), r = rng(Math.round(x));
  for (let i = 0; i < 120 * clamp(nivel); i++) grao(ctx, -50 + r() * 100, -6 - r() * hh, 0.55, r() * 6.28, cor);
  ctx.restore();
  strokeRR(ctx, -60, -h, 120, h, 18, 'rgba(220,240,255,0.5)', 4);
  ctx.fillStyle = '#475569'; ctx.beginPath(); ctx.moveTo(-60, 0); ctx.lineTo(60, 0); ctx.lineTo(16, 50); ctx.lineTo(-16, 50); ctx.closePath(); ctx.fill();
  if (fluxo > 0) { const rr2 = rng(Math.floor(t * 20) + Math.round(x)); for (let i = 0; i < 6 * fluxo; i++) grao(ctx, (rr2() - 0.5) * 16, 60 + rr2() * 70, 0.5, rr2() * 6.28, cor); }
  ctx.restore();
}
function lupa(ctx, x, y, r, k) {
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(k * 2); ctx.translate(x, y); ctx.scale(lerp(0.7, 1, ease.back(clamp(k))), lerp(0.7, 1, ease.back(clamp(k))));
  ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.283); ctx.stroke();
  ctx.strokeStyle = '#a16207'; ctx.lineWidth = 26; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(r * 0.72, r * 0.72); ctx.lineTo(r * 1.5, r * 1.5); ctx.stroke();
  ctx.restore();
}

// ================================================================ Cena 06: dentro do pacote (a mistura mudou)
function scene06(K) {
  const tTem = K('Tem mais uma mudança'), tDentro = K('essa está dentro da embalagem'), tTrad = K('O tradicional é uma mistura'), tDois = K('dos dois grãos'), tDur = K('Durante anos');
  const tSeis = K('uns seis de arábica'), tQuatro = K('para cada quatro de conilon'), tCaro = K('Com o arábica caro'), tSofr = K('sofrendo com o clima'), tMuitas = K('muitas marcas puseram mais conilon');
  const tBarato = K('que é mais barato'), tAguenta = K('aguenta melhor o calor'), tAlg = K('Em algumas misturas'), tQuase = K('passou a ser quase tudo');
  const tGosto = K('O gosto mudou pouco'), tNome = K('o nome na frente'), tNaoP = K('Não é proibido'), t2024 = K('desde 2024'), tRot = K('o rótulo precisa dizer'), tPred = K('qual dos dois predomina');
  const tFalso = K('O falso também se entregava'), tPo = K('pó para bebida sabor café'), tInfo = K('A informação estava lá');
  const cam = [
    { t: 0, x: 960, y: 520, z: 1.06, dz: 0.004 }, { t: tTrad, x: 960, y: 490, z: 1.02, d: 1.6, dx: 3 }, { t: tSofr, x: 1040, y: 480, z: 1.04, d: 1.6 }, { t: tQuase, x: 980, y: 470, z: 1.08, d: 1.6 },
    { t: tGosto - 0.4, x: 2400, y: 490, z: 1.0, d: 1.6 }, { t: tPred, x: 2520, y: 470, z: 1.1, d: 1.6 },
    { t: tFalso - 0.4, x: 3800, y: 490, z: 1.02, d: 1.6 }, { t: tPo, x: 3800, y: 460, z: 1.12, d: 1.8 },
  ];
  const sfx = [[tTem, 'vacuum', 0.4], [tTrad, 'pop', 0.35], [tDur, 'grains', 0.4, { dur: 1.6 }], [tSeis, 'pop', 0.4], [tQuatro, 'pop', 0.4], [tSofr, 'pop', 0.35],
    [tMuitas, 'grains', 0.45, { dur: 2.2 }], [tBarato, 'coin', 0.35], [tAguenta, 'pop', 0.35], [tQuase, 'hit', 0.45],
    [tGosto, 'swoosh', 0.3], [tNome, 'pop', 0.35], [tNaoP, 'flip', 0.5, { dur: 0.4 }], [t2024, 'pop', 0.35], [tPred, 'ding', 0.4],
    [tFalso, 'whoosh', 0.3], [tPo, 'pop', 0.45], [tInfo, 'ding', 0.4]];
  return {
    accent: P.amber, cam, sfx, impacts: [tQuase], trans: 'push',
    draw(ctx, t, cam2) {
      cozinhaFundo(ctx, cam2, 0.9);
      zone(ctx, cam2, 900, 1100, () => {
        if (t > tGosto + 0.6) return;
        const k = 1 - appear(t, tGosto - 0.6, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        const r = lerp(0.6, 0.1, ease.inOut(prog(t, tMuitas, Math.max(1.5, tQuase - tMuitas + 0.3)))); // fatia do arábica
        const kd = appear(t, tTrad - 0.2, 0.6), fl = t > tDur && t < tQuase + 1 ? 1 : 0;
        if (kd > 0) { ctx.save(); ctx.globalAlpha *= clamp(kd * 2);
          dosador(ctx, 700, 560, 230, r + 0.1, '#b07a45', fl * r * 1.6, t, 0.25); dosador(ctx, 1220, 560, 230, 1.1 - r, '#2b1608', fl * (1 - r) * 1.6, t, -0.25);
          text(ctx, 'arábica', 640, 290, { size: 30, weight: 900, color: '#e8c08a' }); text(ctx, 'conilon', 1280, 290, { size: 30, weight: 900, color: '#d6b494' });
          ctx.restore(); }
        sombraChao(ctx, 960, 820, 150); pacote(ctx, 960, 650, 0.78, { tipo: 'real' });
        // a régua da mistura
        const kg = appear(t, tSeis - 0.2, 0.5);
        if (kg > 0) { ctx.save(); ctx.globalAlpha *= kg;
          fillRR(ctx, 610, 210, 700 * r, 46, 10, '#b07a45'); fillRR(ctx, 610 + 700 * r, 210, 700 * (1 - r), 46, 10, '#3f2410'); strokeRR(ctx, 610, 210, 700, 46, 10, '#e2e8f0', 3);
          text(ctx, String(Math.round(r * 10)), 610 + 350 * r, 234, { size: 30, weight: 900, color: '#1f1305' }); text(ctx, String(10 - Math.round(r * 10)), 610 + 700 * r + 350 * (1 - r), 234, { size: 30, weight: 900, color: '#f5e6c8' });
          ctx.restore(); }
        iconeClima(ctx, 'calor', 560, 420, 0.6, vis(t, tSofr, tGosto - 0.6), t);
        chip(ctx, 1500, 400, 'mais barato', P.grao, appear(t, tBarato, 0.4), { size: 28 });
        chip(ctx, 1500, 480, 'aguenta o calor', P.grao, appear(t, tAguenta, 0.4), { size: 28 });
        headline(ctx, 'quase tudo conilon', 960, 130, { size: 62, k: appear(t, tQuase, 0.5), hl: '#3f2410' });
        ctx.restore();
      });
      zone(ctx, cam2, 2300, 2600, () => {
        if (t < tGosto - 0.6 || t > tFalso + 0.6) return;
        const k = vis(t, tGosto - 0.3, tFalso, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        sombraChao(ctx, 2150, 760, 150); pacote(ctx, 2150, 540, 0.95, { tipo: 'real', marca: 'TRADICIONAL' });
        const fp = prog(t, tNaoP, 0.5), sx = Math.abs(Math.cos(fp * Math.PI)), verso = fp > 0.5;
        ctx.save(); ctx.translate(2650, 0); ctx.scale(Math.max(0.03, sx), 1); ctx.translate(-2650, 0);
        sombraChao(ctx, 2650, 760, 150); pacote(ctx, 2650, 520, verso ? 1.25 : 0.95, verso ? { tipo: 'real', verso: true, linhas: ['PREDOMINANTEMENTE', 'CANÉFORA (CONILON)'], hl: prog(t, tPred, 0.6), hlRow: 0.5 } : { tipo: 'real', marca: 'TRADICIONAL' });
        ctx.restore();
        text(ctx, '=', 2400, 520, { size: 110, weight: 900, color: '#e2e8f0', alpha: vis(t, tGosto + 0.3, tNaoP, 0.4, 0.3) });
        chip(ctx, 2400, 160, 'o mesmo nome na frente', P.creme, vis(t, tNome, tNaoP + 0.2), { size: 30 });
        chip(ctx, 2400, 160, 'não é proibido · está no rótulo', P.grao, appear(t, tNaoP + 0.4, 0.4), { size: 30 });
        chip(ctx, 2250, 290, 'desde 2024', P.amber, appear(t, t2024, 0.4), { size: 28 });
        lupa(ctx, 2650, 400, 120, appear(t, tPred - 0.3, 0.5));
        ctx.restore();
      });
      zone(ctx, cam2, 3700, 3900, () => {
        if (t < tFalso - 0.6) return;
        const k = appear(t, tFalso - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        sombraChao(ctx, 3800, 790, 200); pacote(ctx, 3800, 520, 1.25, { tipo: 'falso', hl: prog(t, tPo - 0.2, 0.7) });
        check(ctx, 4130, 300, 1.4, P.ok, prog(t, tInfo, 0.5));
        chip(ctx, 3800, 140, 'estava escrito', P.ok, appear(t, tInfo + 0.2, 0.4), { size: 32 });
        ctx.restore();
      });
      frente(ctx, cam2, t, 13, 8);
    },
    overlay(ctx, t) { source(ctx, 'Globo Rural (2025, 2026); g1 (out/2026)', vis(t, tDur, 999, 0.5)); },
  };
}

// ================================================================ Cena 07: quem perde, quem ganha e o copo da padaria
function scene07(K) {
  const tQuemP = K('E quem perde com a queda'), tPlanta = K('Quem planta'), tAdubo = K('O adubo não baixou junto'), tSet = K('Em setembro'), tSul = K('Sul de Minas'), tInt = K('interior paulista');
  const t20 = K('quase vinte por cento mais grão'), tCepea = K('pelas contas do Cepea'), tLado = K('Do lado de quem bebe'), tCons = K('o consumo voltou a crescer'), tMaio = K('entre maio e agosto'), t5 = K('quase cinco por cento');
  const tPad = K('E a padaria'), tLa = K('a queda quase não chega'), t2025 = K('Em 2025, o copo de coado'), tDez = K('beirava os dez reais'), tProcon = K('segundo o Procon');
  const tNum = K('Num copo desses'), tGramas = K('uns dez gramas de pó'), t50 = K('uns cinquenta centavos'), tResto = K('O resto do copo');
  const tAlug = K('aluguel'), tSal = K('salário'), tLeite = K('leite'), tAcuc = K('açúcar'), tLucro = K('o lucro da padaria'), tGrao = K('O grão ficou barato'), tCafez = K('o cafezinho é quase todo outra coisa');
  const cam = [
    { t: 0, x: 960, y: 500, z: 1.06, dz: 0.004 }, { t: tAdubo, x: 960, y: 480, z: 1.02, d: 1.6, dx: 3 }, { t: t20, x: 1000, y: 470, z: 1.08, d: 1.6 },
    { t: tLado - 0.4, x: 2400, y: 490, z: 1.0, d: 1.6 }, { t: t5, x: 2400, y: 470, z: 1.08, d: 1.6 },
    { t: tPad - 0.3, x: 3800, y: 490, z: 1.0, d: 1.6 }, { t: tDez, x: 3880, y: 470, z: 1.06, d: 1.6 }, { t: tGramas, x: 3640, y: 470, z: 1.1, d: 1.6 }, { t: tResto, x: 3820, y: 480, z: 1.02, d: 1.6 },
  ];
  const sfx = [[tQuemP, 'pop', 0.35], [tPlanta, 'pop', 0.4], [tAdubo, 'jute', 0.45], [tSul, 'pop', 0.3], [tInt, 'pop', 0.3], [t20, 'weight', 0.5], [t20 + 0.5, 'jute', 0.4], [tCepea, 'paper', 0.35],
    [tLado, 'whoosh', 0.3], [tCons, 'scan', 0.4], [tCons + 0.6, 'scan', 0.35], [t5, 'ding', 0.4],
    [tPad, 'whoosh', 0.3], [tLa, 'tick', 0.35], [t2025, 'pour', 0.35, { dur: 1.2 }], [tDez, 'cash', 0.4], [tGramas, 'spoon', 0.45], [t50, 'coin', 0.45],
    [tAlug, 'pop', 0.3], [tSal, 'pop', 0.3], [tLeite, 'pop', 0.3], [tAcuc, 'pop', 0.3], [tLucro, 'pop', 0.35], [tCafez, 'hit', 0.4]];
  return {
    accent: P.amber, cam, sfx, impacts: [t20], trans: 'push',
    draw(ctx, t, cam2) {
      cozinhaFundo(ctx, cam2, 0.85, 0.1);
      zone(ctx, cam2, 900, 1100, () => {
        if (t > tLado + 0.6) return;
        const k = 1 - appear(t, tLado - 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        headline(ctx, 'quem perde?', 960, 150, { size: 66, k: appear(t, tQuemP, 0.5), hl: '#7f1d1d' });
        chip(ctx, 960, 240, 'quem planta', P.grao, appear(t, tPlanta, 0.4), { size: 32 });
        const kb = appear(t, tAdubo - 0.2, 0.6);
        if (kb > 0) {
          const extra = appear(t, t20 + 0.4, 0.5), incl = lerp(0.12, 0, ease.out(extra));
          ctx.save(); ctx.globalAlpha *= clamp(kb * 2);
          balancaPratos(ctx, 960, 640, 0.95, incl, (c) => sacoAdubo(c, 0, 40, 0.75), (c) => {
            for (let i = 0; i < 5; i++) saca(c, -70 + (i % 3) * 70, 120 - Math.floor(i / 3) * 70, 0.22, { mini: true });
            if (extra > 0) saca(c, 35, 120 - 140 + (1 - ease.out(extra)) * -120, 0.22, { mini: true, a: extra });
          });
          ctx.restore();
        }
        chip(ctx, 700, 320, 'Sul de Minas', '#e2e8f0', appear(t, tSul, 0.4), { size: 26 });
        chip(ctx, 1220, 320, 'interior paulista', '#e2e8f0', appear(t, tInt, 0.4), { size: 26 });
        bigNum(ctx, '+20% de café pelo adubo', 1420, 230, appear(t, t20 + 0.3, 0.5), { size: 46, color: '#fca5a5' });
        ctx.restore();
      });
      zone(ctx, cam2, 2300, 2500, () => {
        if (t < tLado - 0.6 || t > tPad + 0.6) return;
        const k = vis(t, tLado - 0.3, tPad, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        carrinho(ctx, 2400, 560, 0.95);
        for (let i = 0; i < 5; i++) { const ki = appear(t, tCons + i * 0.35, 0.4); if (ki > 0) pacote(ctx, 2200 + i * 100, lerp(300, 470, ease.out(ki)), 0.36, { mini: true, tipo: 'real', a: clamp(ki * 2), rot: (i - 2) * 0.08 }); }
        bigNum(ctx, '+4,65%', 2400, 200, appear(t, t5, 0.5), { size: 96, color: P.grao });
        chip(ctx, 2400, 300, 'vendas no mercado · mai a ago/2026', '#e2e8f0', appear(t, tMaio, 0.4), { size: 28 });
        ctx.restore();
      });
      zone(ctx, cam2, 3600, 3900, () => {
        if (t < tPad - 0.6) return;
        const k = appear(t, tPad - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        fillRR(ctx, 3200, 640, 1200, 40, 8, '#5b3a22'); fillRR(ctx, 3200, 680, 1200, 160, 0, '#3a2414');
        copoAmericano(ctx, 3600, 470, 0.95, counting(t, t2025, 1.2, 0.1, 0.82), t);
        chip(ctx, 3600, 170, 'a queda quase não chega', '#fca5a5', vis(t, tLa, tGramas - 0.3), { size: 30 });
        comanda(ctx, 4150, 430, 1.0, [['COADO (COPO)', ''], ['', 'R$ 9,61', true]], vis(t, tDez - 0.3, tNum, 0.5, 0.4));
        chip(ctx, 4150, 680, 'Procon-SP · média de 2025', '#e2e8f0', vis(t, tProcon, tNum), { size: 24 });
        // a colher de pó vira a moeda de 50 centavos
        const kc = appear(t, tGramas - 0.2, 0.5), km = appear(t, t50, 0.5);
        if (kc > 0) {
          ctx.save(); ctx.globalAlpha *= clamp(kc * 2) * (1 - km);
          ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(3300, 360); ctx.lineTo(3430, 300); ctx.stroke();
          ctx.fillStyle = '#cbd5e1'; ctx.beginPath(); ctx.ellipse(3270, 372, 44, 26, -0.4, 0, 6.283); ctx.fill(); ctx.fillStyle = '#3f2410'; ctx.beginPath(); ctx.ellipse(3270, 366, 36, 18, -0.4, 0, 6.283); ctx.fill();
          ctx.restore();
        }
        if (km > 0) { moeda(ctx, 3280, 350, 70 * ease.back(clamp(km)), { label: '50¢', prata: true }); chip(ctx, 3280, 470, 'o pó: uns 50 centavos', P.grao, km, { size: 26 }); }
        [[tAlug, 'aluguel'], [tSal, 'salário'], [tLeite, 'leite'], [tAcuc, 'açúcar'], [tLucro, 'lucro da padaria']].forEach(([tt, s2], i) => chip(ctx, 4150, 260 + i * 84, s2, P.mercado, appear(t, tt, 0.35), { size: 30 }));
        headline(ctx, 'o cafezinho é quase todo outra coisa', 3800, 150, { size: 54, k: appear(t, tCafez, 0.5), hl: '#4c1d95' });
        ctx.restore();
      });
      frente(ctx, cam2, t, 15, 8);
    },
    overlay(ctx, t) { source(ctx, t < tLado ? 'Cepea (set/2026)' : t < tPad ? 'Abic (set/2026)' : 'Procon-SP (2025); conta do canal', vis(t, tSet, 999, 0.5)); },
  };
}

// ================================================================ Cena 08: na hora da compra
function scene08(K) {
  const tOque = K('O que dá pra fazer com isso'), tComp = K('Compara pelo preço do quilo'), tLetra = K('em letra miúda na etiqueta'), tAli = K('É ali que aparece');
  const tCaps = K('A cápsula, por exemplo'), t400 = K('uns quatrocentos reais o quilo'), t8 = K('umas oito vezes o pó'), tVira = K('E vira o pacote'), tCarr = K('antes de pôr no carrinho');
  const tRot = K('O rótulo diz se ele é'), tArab = K('predominantemente arábica ou conilon'), tCafe = K('e se é café mesmo'), tBeb = K('ou bebida sabor café'), tPref = K('Você pode até preferir o mais forte'), tEsc = K('A diferença é escolher sabendo');
  const cam = [
    { t: 0, x: 960, y: 500, z: 1.04, dx: 3 }, { t: tLetra, x: 820, y: 560, z: 1.14, d: 1.6 }, { t: tAli, x: 960, y: 500, z: 1.04, d: 1.4 },
    { t: tCaps - 0.4, x: 2400, y: 490, z: 1.0, d: 1.6, dx: 3 }, { t: t8, x: 2400, y: 470, z: 1.06, d: 1.6 },
    { t: tVira - 0.4, x: 3800, y: 490, z: 1.0, d: 1.6 }, { t: tArab, x: 3860, y: 460, z: 1.08, d: 1.6 }, { t: tEsc, x: 3800, y: 480, z: 1.02, d: 1.8 },
  ];
  const sfx = [[tOque, 'pop', 0.35], [tComp, 'scan', 0.45], [tLetra, 'pop', 0.35], [tAli, 'ding', 0.35], [tCaps, 'whoosh', 0.3], [tCaps + 0.3, 'beep', 0.4], [t400, 'cash', 0.4], [t8, 'hit', 0.45],
    [tVira, 'swoosh', 0.35], [tCarr, 'crate', 0.3], [tArab, 'pop', 0.4], [tCafe, 'pop', 0.4], [tBeb, 'pop', 0.4], [tPref, 'pop', 0.3], [tEsc, 'ding', 0.4]];
  return {
    accent: P.amber, cam, sfx, impacts: [t8], trans: 'push',
    draw(ctx, t, cam2) {
      cozinhaFundo(ctx, cam2, 0.85, 0.1);
      zone(ctx, cam2, 800, 1000, () => {
        if (t > tCaps + 0.6) return;
        const k = 1 - appear(t, tCaps - 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        etiquetaGondola(ctx, 960, 450, 1.3, { preco: '24,75', un: '500 g', data: '', miuda: 'PREÇO POR kg: R$ 49,50', circ: prog(t, tLetra, 0.8), a: appear(t, tOque, 0.5) });
        headline(ctx, 'olhe o preço do quilo', 960, 160, { size: 66, k: appear(t, tComp, 0.5), hl: '#854d0e' });
        chip(ctx, 960, 690, 'é aqui que aparece a diferença', P.amber, appear(t, tAli, 0.4), { size: 30 });
        ctx.restore();
      });
      zone(ctx, cam2, 2300, 2500, () => {
        if (t < tCaps - 0.6 || t > tVira + 0.6) return;
        const k = vis(t, tCaps - 0.3, tVira, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        balancaCozinha(ctx, 2020, 640, 0.75, '1,000 kg'); balancaCozinha(ctx, 2780, 640, 0.75, '1,000 kg');
        pacote(ctx, 1960, 520, 0.5, { tipo: 'real' }); pacote(ctx, 2080, 520, 0.5, { tipo: 'real', rot: 0.04 });
        const cores = ['#1d4ed8', '#b91c1c', '#15803d', '#a16207', '#6d28d9'], kc = appear(t, tCaps, 0.6);
        for (let i = 0; i < 24; i++) { const kk = clamp(kc * 24 - i); if (kk <= 0) continue; capsula(ctx, 2660 + (i % 6) * 48, 600 - Math.floor(i / 6) * 40, 0.75, cores[i % 5]); }
        glowText(ctx, 'R$ 49,50', 2020, 740, { size: 48, weight: 900, color: '#bef264', glow: 'rgba(190,242,100,0.5)' });
        glowText(ctx, 'R$ 408', 2780, 740, { size: 48, weight: 900, color: '#fca5a5', glow: 'rgba(252,165,165,0.5)', alpha: appear(t, t400, 0.5) });
        text(ctx, 'pó', 2020, 380, { size: 34, weight: 900, color: '#e2e8f0' }); text(ctx, 'cápsula', 2780, 380, { size: 34, weight: 900, color: '#e2e8f0', alpha: appear(t, tCaps, 0.4) });
        bigNum(ctx, '×8', 2400, 250, appear(t, t8, 0.5), { size: 120, color: '#fbbf24' });
        ctx.restore();
      });
      zone(ctx, cam2, 3700, 3900, () => {
        if (t < tVira - 0.6) return;
        const k = appear(t, tVira - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        ctx.save(); ctx.globalAlpha *= 0.55; carrinho(ctx, 3560, 600, 0.8); ctx.restore();
        const fp = prog(t, tVira, 0.5), sx = Math.max(0.03, Math.abs(Math.cos(fp * Math.PI))), verso = fp > 0.5;
        ctx.save(); ctx.translate(3700, 0); ctx.scale(sx, 1); ctx.translate(-3700, 0);
        pacote(ctx, 3700, 460, 1.35, verso ? { tipo: 'real', verso: true, linhas: ['PREDOMINANTEMENTE', 'ARÁBICA ou CONILON'], hl: prog(t, tArab, 0.6), hlRow: 0.5 } : { tipo: 'real' });
        ctx.restore();
        chip(ctx, 4280, 300, 'qual grão predomina', P.amber, appear(t, tArab, 0.4), { size: 30 });
        chip(ctx, 4280, 390, 'café ou bebida sabor café', P.amber, appear(t, tCafe, 0.4), { size: 30 });
        chip(ctx, 4280, 480, 'pode ser o mais forte', P.grao, appear(t, tPref, 0.4), { size: 30 });
        headline(ctx, 'escolher sabendo', 3800, 140, { size: 66, k: appear(t, tEsc, 0.5), color: '#ecfccb', color2: P.grao });
        ctx.restore();
      });
      frente(ctx, cam2, t, 17, 8);
    },
    overlay(ctx, t) { source(ctx, 'Abic (2026)', vis(t, tCaps, tVira, 0.5, 0.4)); },
  };
}

// ================================================================ Cena 09: fechamento, inscrição (a cafeteira) e o próximo vídeo
function scene09(K) {
  const tEntao = K('Então, da próxima vez'), tMetade = K('mais da metade dele é a roça'), tClima = K('a roça seguiu o clima'), tPrat = K('Na prateleira, o preço subiu'), tDesc = K('está descendo mais devagar');
  const tMeio = K('No meio do caminho'), tApert = K('apertou a margem na alta'), tRecup = K('está recuperando agora'), tEmb = K('E a embalagem'), tMist = K('pode estar levando outra mistura');
  const tSe = K('Se esse vídeo te ajudou'), tInsc = K('se inscreve no canal'), tProx = K('No próximo'), tHol = K('vai pro holerite'), tEste = K('este é o primeiro décimo terceiro'), tSemIR = K('sem imposto de renda'), t5mil = K('até cinco mil por mês');
  const tAbre = K('A gente abre o seu décimo terceiro'), tCada = K('quem fica com cada real'), tAte = K('Até lá');
  const tPress = tInsc + 0.15;
  const cam = [
    { t: 0, x: 960, y: 500, z: 1.04, dz: 0.004 }, { t: tMetade, x: 900, y: 480, z: 1.08, d: 1.6 },
    { t: tPrat - 0.4, x: 2400, y: 490, z: 1.0, d: 1.6, dx: 3 }, { t: tMeio, x: 2400, y: 470, z: 1.06, d: 1.6 }, { t: tEmb - 0.2, x: 2700, y: 490, z: 1.04, d: 1.4 },
    { t: tSe - 0.4, x: 3800, y: 490, z: 1.0, d: 1.6 }, { t: tInsc, x: 3860, y: 520, z: 1.12, d: 1.2 }, { t: tInsc + 1.6, x: 3800, y: 490, z: 1.02, d: 1.6 },
    { t: tHol - 0.3, x: 5200, y: 480, z: 1.0, d: 1.6, dx: 3 }, { t: tSemIR, x: 5260, y: 470, z: 1.08, d: 1.6 }, { t: tCada, x: 5200, y: 480, z: 1.04, d: 2.4, dz: 0.003 },
  ];
  const sfx = [[tEntao, 'pop', 0.3], [tMetade, 'grains', 0.4, { dur: 0.8 }], [tClima, 'wind', 0.3, { dur: 1.6 }], [tPrat, 'whoosh', 0.3], [tDesc, 'drop', 0.35], [tApert, 'weight', 0.4], [tRecup, 'riser', 0.25, { dur: 0.8 }],
    [tEmb, 'pop', 0.35], [tMist, 'grains', 0.35, { dur: 0.7 }], [tSe, 'whoosh', 0.3], [tPress, 'switch', 0.7], [tPress + 0.1, 'brew', 0.5, { dur: 2.6 }], [tPress + 0.8, 'ding', 0.45],
    [tProx, 'steam', 0.35, { dur: 1.2 }], [tHol, 'paper', 0.5, { dur: 0.5 }], [tSemIR, 'stamp', 0.4], [t5mil, 'pop', 0.35], [tCada, 'coin', 0.5]];
  return {
    accent: P.grao, cam, sfx, impacts: [tPress], trans: 'push',
    draw(ctx, t, cam2) {
      cozinhaFundo(ctx, cam2, 0.95);
      zone(ctx, cam2, 860, 1000, () => {
        if (t > tPrat + 0.6) return;
        const k = 1 - appear(t, tPrat - 0.6, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        const glow = appear(t, tMetade, 0.5) * (0.6 + 0.4 * Math.sin(t * 3));
        coadorJarra(ctx, 640, 470, 0.95, [{ v: 0.58, color: P.grao, glow }, { v: 0.24, color: P.torra }, { v: 0.10, color: P.mercado }, { v: 0.08, color: P.estado }], { coador: false });
        headline(ctx, 'mais da metade é a roça', 1300, 300, { size: 58, k: appear(t, tMetade, 0.5), color: '#ecfccb', color2: P.grao });
        iconeClima(ctx, 'sol', 1150, 480, 0.6, appear(t, tClima, 0.4), t); iconeClima(ctx, 'geada', 1300, 480, 0.6, appear(t, tClima + 0.2, 0.4), t); iconeClima(ctx, 'chuva', 1450, 480, 0.6, appear(t, tClima + 0.4, 0.4), t);
        ctx.restore();
      });
      zone(ctx, cam2, 2300, 2800, () => {
        if (t < tPrat - 0.6 || t > tSe + 0.6) return;
        const k = vis(t, tPrat - 0.3, tSe, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        // duas curvas: o grão (pico agudo) e a prateleira (morro baixo); entre elas, a margem
        const X0 = 1800, X1 = 2800, Y0 = 720, kc = prog(t, tPrat, 1.6);
        const grao2 = (u) => 0.12 + 0.68 * Math.exp(-Math.pow((u - 0.45) / 0.12, 2)) + 0.12 * u;
        const prat = (u) => 0.30 + 0.30 * Math.exp(-Math.pow((u - 0.55) / 0.22, 2)) + 0.05 * u;
        const H0 = 440, n = 60, upto = Math.floor(n * kc);
        if (t > tMeio - 0.2) { // a margem: faixa entre a prateleira e o grão (quando a prateleira está acima)
          ctx.save(); ctx.globalAlpha *= appear(t, tMeio - 0.2, 0.6);
          ctx.fillStyle = hexA(P.torra, 0.35); ctx.beginPath();
          for (let i = 0; i <= n; i++) { const u = i / n, x = lerp(X0, X1, u), y = Y0 - H0 * prat(u); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
          for (let i = n; i >= 0; i--) { const u = i / n, x = lerp(X0, X1, u), y = Y0 - H0 * grao2(u); ctx.lineTo(x, y); }
          ctx.closePath(); ctx.fill(); ctx.restore();
        }
        for (const [fn, cor, lw] of [[grao2, P.grao, 8], [prat, '#f97316', 8]]) {
          ctx.save(); ctx.strokeStyle = cor; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.shadowColor = hexA(cor, 0.7); ctx.shadowBlur = 16; ctx.beginPath();
          for (let i = 0; i <= upto; i++) { const u = i / n, x = lerp(X0, X1, u), y = Y0 - H0 * fn(u); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
          ctx.stroke(); ctx.restore();
        }
        fillRR(ctx, X0, Y0, X1 - X0, 4, 2, '#475569');
        chip(ctx, 2250, 180, 'o grão', P.grao, appear(t, tPrat + 0.3, 0.4), { size: 28 });
        chip(ctx, 2750, 380, 'a prateleira', '#f97316', appear(t, tPrat + 0.8, 0.4), { size: 28 });
        chip(ctx, 2250, 600, 'margem apertada na alta', '#93c5fd', appear(t, tApert, 0.4), { size: 24 });
        chip(ctx, 2620, 600, 'recuperando agora', '#93c5fd', appear(t, tRecup, 0.4), { size: 24 });
        // o pacote com a mesma frente e a mistura nova
        const kp = appear(t, tEmb, 0.5);
        if (kp > 0) { pacote(ctx, 3060, 470, 0.7, { tipo: 'real', a: clamp(kp * 2) }); chip(ctx, 3060, 690, 'outra mistura?', P.amber, appear(t, tMist, 0.4), { size: 26 }); }
        ctx.restore();
      });
      zone(ctx, cam2, 3700, 3900, () => {
        if (t < tSe - 0.6 || t > tHol + 0.6) return;
        const k = vis(t, tSe - 0.3, tHol, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        const press = prog(t, tPress - 0.1, 0.25), fill = prog(t, tPress + 0.2, 2.6);
        cafeteira(ctx, 3800, 470, 0.95, press, fill, t > tPress + 0.8 ? 'INSCRITO' : 'INSCREVA-SE', t);
        // o dedo apertando o botão
        const kd = vis(t, tInsc - 0.6, tPress + 0.6, 0.4, 0.4);
        if (kd > 0) { const dx = lerp(160, 0, ease.out(prog(t, tInsc - 0.6, 0.6))) + (t > tPress ? 10 : 0);
          ctx.save(); ctx.globalAlpha *= kd; ctx.translate(3966 + dx, 527); ctx.fillStyle = '#e0ac7e'; rr(ctx, 0, -26, 190, 52, 26); ctx.fill(); ctx.fillStyle = '#c98c5e'; rr(ctx, 40, -34, 220, 68, 30); ctx.fill(); ctx.restore(); }
        sparks(ctx, t, tPress + 0.8, 3750, 255, P.amber, 18);
        ctx.restore();
      });
      zone(ctx, cam2, 5100, 5300, () => {
        if (t < tProx) return;
        const kx = appear(t, tProx, 0.6);
        ctx.save(); ctx.globalAlpha *= kx * (1 - appear(t, tHol - 0.2, 0.5));
        xicara(ctx, 5200, 470, 0.9, t); chip(ctx, 5200, 200, 'próximo vídeo', P.amber, 1, { size: 30 });
        ctx.restore();
        holerite(ctx, 5200, 430, 1.0, appear(t, tHol, 0.6), tSemIR, t);
        chip(ctx, 5200, 745, 'sem IR para quem ganha até R$ 5 mil por mês', P.grao, appear(t, t5mil, 0.4), { size: 28 });
        headline(ctx, 'quem fica com cada real do seu 13º?', 5200, 150, { size: 58, k: appear(t, tCada, 0.5), hl: '#1e3a8a' });
      });
      frente(ctx, cam2, t, 19, 9);
    },
    overlay(ctx, t) { source(ctx, 'Lei 15.270/2025', vis(t, tSemIR, tAte, 0.5, 0.4)); },
  };
}
function xicara(ctx, x, y, s, t) { // xícara de café com vapor (a mesma do anúncio no fim do vídeo 06)
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.ellipse(0, 108, 200, 26, 0, 0, 6.283); ctx.fill();
  ctx.fillStyle = '#e5e7eb'; ctx.beginPath(); ctx.ellipse(0, 96, 190, 30, 0, 0, 6.283); ctx.fill();
  const g = ctx.createLinearGradient(-120, 0, 120, 0); g.addColorStop(0, '#cbd5e1'); g.addColorStop(0.4, '#ffffff'); g.addColorStop(1, '#94a3b8');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-120, -40); ctx.lineTo(120, -40); ctx.quadraticCurveTo(115, 90, 0, 92); ctx.quadraticCurveTo(-115, 90, -120, -40); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 18; ctx.beginPath(); ctx.arc(140, 10, 34, -1.3, 1.3); ctx.stroke();
  ctx.fillStyle = '#3f2410'; ctx.beginPath(); ctx.ellipse(0, -40, 118, 22, 0, 0, 6.283); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.28)'; ctx.lineWidth = 8; ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) { ctx.beginPath(); for (let k2 = 0; k2 <= 20; k2++) { const yy = -70 - k2 * 9, xx = (i - 1) * 40 + Math.sin(k2 * 0.5 + t * 2 + i) * 14; k2 ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke(); }
  ctx.restore();
}

export const SCENES = [
  { id: '01', name: 'o-cafe-falso', build: scene01 },
  { id: '02', name: 'o-tamanho-da-queda', build: scene02 },
  { id: '03', name: 'o-pacote-aberto', build: scene03 },
  { id: '04', name: 'a-roca', build: scene04 },
  { id: '05', name: 'por-que-caiu-pela-metade', build: scene05 },
  { id: '06', name: 'dentro-do-pacote', build: scene06 },
  { id: '07', name: 'quem-perde', build: scene07 },
  { id: '08', name: 'na-hora-da-compra', build: scene08 },
  { id: '09', name: 'fechamento', build: scene09 },
];
