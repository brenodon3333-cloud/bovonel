// Cenas do vídeo 01 (versão cinematográfica).
// Cada cena é montada a partir da narração: K('frase') devolve o instante
// (em segundos, desde o início da cena) em que essa frase começa a ser falada.
// Tudo que aparece, cada movimento de câmera e cada efeito sonoro usa esses instantes.

export const SLICES = [
  { key: 'petro', name: 'Petrobras', val: 2.11, pct: 32, color: C.petro },
  { key: 'etanol', name: 'Etanol anidro', val: 0.98, pct: 15, color: C.etanol },
  { key: 'icms', name: 'ICMS (estado)', val: 1.57, pct: 24, color: C.icms },
  { key: 'fed', name: 'Impostos federais', val: 0.20, pct: 3, color: C.fed },
  { key: 'dist', name: 'Distribuição e posto', val: 1.68, pct: 26, color: C.dist },
];
const S = Object.fromEntries(SLICES.map((s) => [s.key, s]));

const ticks = (sfx, t0, t1, step = 0.07) => { for (let t = t0; t < t1; t += step) sfx.push([t, 'tick', 0.5]); };
const HOME = { x: 960, y: 540, z: 1 };

// ---------------------------------------------------------------- peças comuns
function priceBoard(ctx, x, y, scale, t, on) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  fillRR(ctx, -14, 170, 28, 260, 6, '#334155');
  fillRR(ctx, -230, -200, 460, 380, 26, '#0f172a');
  strokeRR(ctx, -230, -200, 460, 380, 26, 'rgba(255,255,255,0.18)', 4);
  fillRR(ctx, -230, -200, 460, 90, 26, '#dc2626');
  ctx.fillStyle = '#dc2626'; ctx.fillRect(-230, -140, 460, 30);
  text(ctx, 'GASOLINA COMUM', 0, -152, { size: 40, weight: 900, letter: 2 });
  fillRR(ctx, -190, -80, 380, 210, 16, '#05070d');
  const dt = t - on;
  let lit = dt < 0 ? 0.08 : dt < 1.3 ? (Math.sin(dt * 47) > 0.1 || dt > 1.0 ? 1 : 0.25) : 1;
  ctx.save();
  ctx.shadowColor = C.led; ctx.shadowBlur = 40 * lit;
  text(ctx, 'R$', -150, -40, { size: 34, weight: 800, color: C.led, align: 'left', alpha: lit });
  text(ctx, '6,54', 20, 30, { size: 150, weight: 900, color: C.led, alpha: lit });
  ctx.restore();
  ctx.restore();
}

function flowLine(ctx, x1, y1, x2, y2, k, color, t) {
  if (k <= 0) return;
  const xe = lerp(x1, x2, k), ye = lerp(y1, y2, k);
  ctx.save();
  ctx.strokeStyle = hexA(color, 0.3);
  ctx.lineWidth = 16; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(xe, ye); ctx.stroke();
  ctx.setLineDash([18, 22]);
  ctx.lineDashOffset = -t * 80;
  ctx.strokeStyle = color; ctx.lineWidth = 6;
  ctx.shadowColor = color; ctx.shadowBlur = 16;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(xe, ye); ctx.stroke();
  ctx.restore();
  if (k < 1) circle(ctx, xe, ye, 12, color);
}

function node(ctx, t, start, x, y, icon, color, label, sub, subColor) {
  const k = appear(t, start, 0.7, ease.back);
  if (k <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  const pulse = 1 + 0.03 * Math.sin(t * 3);
  circle(ctx, 0, 0, 115 * pulse, hexA(color, 0.10));
  circle(ctx, 0, 0, 100, hexA(color, 0.16));
  ctx.save(); ctx.strokeStyle = hexA(color, 0.7); ctx.lineWidth = 4; ctx.shadowColor = color; ctx.shadowBlur = 20;
  ctx.beginPath(); ctx.arc(0, 0, 100, 0, 6.283); ctx.stroke(); ctx.restore();
  icon(ctx, 0, 4, 110, color);
  ctx.restore();
  text(ctx, label, x, y + 150, { size: 40, alpha: k });
  if (sub) text(ctx, sub, x, y + 198, { size: 30, weight: subColor ? 700 : 500, color: subColor || C.muted, alpha: appear(t, start + 0.3) });
}

// Cartão que entra deslizando, com brilho na borda.
function fact(ctx, t, t0, x, y, w, h, title, sub, accent) {
  const k = appear(t, t0, 0.55);
  if (k <= 0) return;
  ctx.save();
  ctx.translate((1 - k) * 80, 0);
  ctx.shadowColor = hexA(accent, 0.5 * (1 - prog(t, t0 + 0.4, 1.2)));
  ctx.shadowBlur = 40;
  card(ctx, x, y, w, h, k, accent);
  ctx.restore();
  ctx.save(); ctx.translate((1 - k) * 80, 0);
  if (sub) {
    text(ctx, title, x + 44, y + h / 2 - 20, { size: 40, align: 'left', alpha: k, maxWidth: w - 70 });
    text(ctx, sub, x + 44, y + h / 2 + 26, { size: 28, weight: 500, color: C.muted, align: 'left', alpha: k, maxWidth: w - 70 });
  } else {
    text(ctx, title, x + 44, y + h / 2 + 2, { size: 40, align: 'left', alpha: k, maxWidth: w - 70 });
  }
  ctx.restore();
}

function overlaySource(ctx, str, a) { source(ctx, str, a); }

// ---------------------------------------------------------------- Cena 01: gancho
const TARGETS = [
  { label: 'Petrobras', color: C.petro, icon: iconRefinery, cue: 'pra petrobras' },
  { label: 'Governo do estado', color: C.icms, icon: iconBank, cue: 'governo do seu estado' },
  { label: 'Usinas de etanol', color: C.etanol, icon: iconCane, cue: 'usinas de cana' },
  { label: 'Distribuidora e posto', color: C.dist, icon: iconPump, cue: 'fica com o posto' },
  { label: 'Governo federal', color: C.fed, icon: iconBank, cue: 'fica com o posto', off: 0.9 },
];
function scene01(K) {
  const tOn = 0.15, tMoney = K('o dinheiro'), tSink = K('sumir dentro'), tNo = K('nao some'), tDiv = K('se divide');
  const tAbrir = K('abrir um litro'), tSeg = K('seguir cada centavo');
  const tt = TARGETS.map((g) => K(g.cue, g.off || 0));
  const cam = [
    { t: 0, x: 960, y: 470, z: 1.75 },
    { t: tMoney - 0.3, x: 960, y: 380, z: 1.3, d: 1.4 },
    { t: tSink, x: 960, y: 500, z: 1.55, d: 1.0 },
    { t: tNo, x: 960, y: 470, z: 1.2, d: 0.45 },
    { t: tDiv, x: 1030, y: 530, z: 1.0, d: 1.3 },
    ...tt.map((t, i) => ({ t: t - 0.1, x: 1120, y: 420 + i * 45, z: 1.06, d: 1.1 })),
    { t: tAbrir, ...HOME, d: 1.6 },
  ];
  const sfx = [[tOn, 'neon', 0.9], [tMoney, 'coin', 0.9], [tSink + 0.3, 'swoosh', 0.7], [tNo, 'hit', 0.9], [tDiv - 0.1, 'whoosh', 1], [tDiv, 'sparkle', 0.7],
    ...tt.map((t) => [t + 0.25, 'pop', 0.8]), [tSeg, 'impact', 0.6]];
  const impacts = [tNo, tSeg];
  const board = (t) => {
    const m = ease.inOut(prog(t, tDiv, 1.2));
    return { x: lerp(960, 470, m), y: lerp(520, 500, m), s: lerp(1.1, 0.95, m) };
  };
  return {
    accent: C.led, cam, sfx, impacts,
    draw(ctx, t) {
      const b = board(t);
      priceBoard(ctx, b.x, b.y, b.s, t, tOn);
      // moeda caindo dentro da placa
      const ck = appear(t, tMoney, 0.5, ease.back);
      if (ck > 0 && t < tSink + 1.0) {
        const fall = ease.inOut(prog(t, tSink, 0.8));
        const cy = lerp(150, b.y, fall);
        const r = 70 * ck * (1 - fall * 0.85);
        ctx.save(); ctx.translate(b.x, cy); ctx.rotate(t * 3); ctx.translate(-b.x, -cy);
        iconCoin(ctx, b.x, cy, r, C.gold); ctx.restore();
      }
      // pedaços orbitando a placa e voando para os destinos
      if (t >= tDiv) {
        TARGETS.forEach((g, i) => {
          const ty = 250 + i * 135, tx = 1100;
          const born = appear(t, tDiv + i * 0.06, 0.4, ease.back);
          const a = (i / 5) * 6.283 + t * 1.2;
          const ox = b.x + Math.cos(a) * 270, oy = b.y + Math.sin(a) * 200;
          const fly = ease.inOut(prog(t, tt[i] - 0.35, 0.6));
          if (fly < 1) {
            const px = lerp(ox, tx - 90, fly), py = lerp(oy, ty, fly) - Math.sin(fly * Math.PI) * 90;
            ctx.save(); ctx.shadowColor = g.color; ctx.shadowBlur = 24;
            circle(ctx, px, py, lerp(26, 20, fly) * born, g.color); ctx.restore();
          }
          const k = appear(t, tt[i] + 0.2, 0.5, ease.back);
          if (k > 0) {
            ctx.save(); ctx.translate(tx - 150 + (1 - k) * 60, 0);
            card(ctx, 0, ty - 52, 820, 104, k, g.color);
            circle(ctx, 80, ty, 38, hexA(g.color, 0.22), k);
            ctx.globalAlpha = k; g.icon(ctx, 80, ty, 46, g.color); ctx.globalAlpha = 1;
            text(ctx, g.label, 150, ty + 2, { size: 44, align: 'left', alpha: k });
            ctx.restore();
          }
        });
      }
    },
    overlay(ctx, t) {
      punchText(ctx, t, tNo, 'ELE NÃO SOME.', W / 2, 150, { size: 76, weight: 900, until: tDiv - 0.1 });
      punchText(ctx, t, tDiv, 'ELE SE DIVIDE.', W / 2, 150, { size: 76, weight: 900, color: C.gold, glow: hexA(C.gold, 0.6), until: tt[0] });
      punchText(ctx, t, tSeg, 'Vamos seguir cada centavo.', W / 2, 140, { size: 60, weight: 800 });
    },
  };
}

// ---------------------------------------------------------------- Cena 02: título
function scene02(K) {
  const tC = K('seis reais'), tE = K('centavos no brasil') + 0.4, tFonte = K('segundo a anp'), tDes = K('desmontar');
  const cam = [
    { t: 0, x: 960, y: 300, z: 1.35 },
    { t: 1.2, x: 960, y: 330, z: 1.2, d: 2 },
    { t: tC - 0.4, x: 960, y: 530, z: 1.2, d: 1.2 },
    { t: tFonte, x: 960, y: 560, z: 1.0, d: 1.2 },
    { t: tDes, x: 960, y: 700, z: 1.3, d: 1.1 },
  ];
  const sfx = [[0.05, 'whoosh', 0.8], [0.45, 'hit', 0.7], [tE, 'impact', 0.7], ...[0, 1, 2, 3, 4].map((i) => [tDes + 0.25 + i * 0.16, 'pop', 0.7])];
  ticks(sfx, tC, tE - 0.1);
  return {
    accent: C.gas, cam, sfx, impacts: [tE],
    draw(ctx, t) {
      const l1 = appear(t, 0.05, 0.6), l2 = appear(t, 0.45, 0.6, ease.back);
      text(ctx, 'PARA ONDE VAI O DINHEIRO', W / 2, 250 - (1 - l1) * 40, { size: 84, weight: 900, alpha: l1, letter: 2 });
      ctx.save(); ctx.translate(W / 2, 350); ctx.scale(l2, l2);
      glowText(ctx, 'DE UM LITRO DE GASOLINA?', 0, 0, { size: 84, weight: 900, color: C.gas, glow: hexA(C.gas, 0.5), letter: 2 });
      ctx.restore();
      const k = appear(t, tC - 0.2, 0.4);
      const v = counting(t, tC, tE - tC, 0, 6.54);
      const pop = 1 + 0.12 * Math.max(0, 1 - (t - tE) * 3) * (t > tE ? 1 : 0);
      ctx.save(); ctx.translate(W / 2, 545); ctx.scale(pop, pop);
      glowText(ctx, brl(v), 0, 0, { size: 180, weight: 900, color: C.gold, alpha: k, glow: hexA(C.gold, 0.55), blur: 50 });
      ctx.restore();
      shockRing(ctx, t, tE, W / 2, 545, C.gold, 120, 700);
      text(ctx, 'por litro · média nacional · ANP, 4 a 10 de outubro de 2026', W / 2, 670, { size: 32, weight: 500, color: C.muted, alpha: appear(t, tFonte) });
      if (t > tDes) {
        const x = 460, y = 740, w = 1000, h = 46;
        const total = SLICES.reduce((s, a) => s + a.val, 0);
        let cx = x;
        SLICES.forEach((s, i) => {
          const sw = (s.val / total) * w;
          const kk = appear(t, tDes + 0.25 + i * 0.16, 0.5, ease.back);
          fillRR(ctx, cx + 12 * kk * (i - 2), y + (1 - kk) * 40, sw, h, 10, s.color, kk);
          cx += sw;
        });
      }
    },
    overlay(ctx, t) { overlaySource(ctx, 'ANP', appear(t, tFonte)); },
  };
}

// ---------------------------------------------------------------- Cena 03: o caminho
function scene03(K) {
  const Y = 480, X = [300, 1350, 2400, 3450], U = { x: 1900, y: 900 };
  const tPet = K('o petroleo sai'), tFundo = K('sete mil metros'), tRef = K('vai pra refinaria'), tA = K('vira a gasolina a');
  const tDist = K('pra distribuidora'), tEt = K('mistura o etanol'), tC = K('gasolina c'), tTruck = K('o caminhao'), tPosto = K('ate o posto');
  const tEtapa = K('cada etapa');
  const truckDur = Math.max(2.2, tPosto - tTruck + 0.8);
  const truckX = (t) => lerp(X[2] + 140, X[3] - 170, ease.inOut(prog(t, tTruck, truckDur)));
  const cam = [
    { t: 0, x: 300, y: 480, z: 0.9 },
    { t: tPet - 0.2, x: 300, y: 540, z: 1.25, d: 1.6 },
    { t: tRef - 0.3, x: 1350, y: 540, z: 1.25, d: 2.0 },
    { t: tDist - 0.3, x: 2400, y: 540, z: 1.25, d: 2.0 },
    { t: tEt, x: 2150, y: 680, z: 0.95, d: 1.4 },
    { t: tC, x: 2400, y: 560, z: 1.2, d: 1.3 },
    { t: tTruck - 0.2, x: X[2] + 300, y: 520, z: 1.35, d: 1.0 },
    { t: tEtapa - 0.1, x: 1875, y: 620, z: 0.5, d: 2.2 },
  ];
  const sfx = [[0.1, 'whoosh', 0.7], [tPet, 'pop', 0.8], [tFundo, 'riser', 0.35, { dur: 1.2 }], [tRef - 0.3, 'whoosh', 0.8], [tRef + 0.8, 'pop', 0.8],
    [tDist - 0.3, 'whoosh', 0.8], [tDist + 0.6, 'pop', 0.8], [tEt, 'pop', 0.8], [tEt + 0.5, 'liquid', 0.5, { dur: 1.6 }], [tC, 'click', 0.8],
    [tTruck, 'truck', 0.9, { dur: truckDur + 0.5 }], [tTruck + truckDur - 0.3, 'pop', 0.8], [tEtapa - 0.1, 'whoosh', 0.9],
    ...[0, 1, 2, 3].map((i) => [tEtapa + 0.6 + i * 0.22, 'coin', 0.55])];
  return {
    accent: C.gas, cam, sfx, impacts: [],
    draw(ctx, t) {
      // estrada de fundo ligando tudo
      ctx.save(); ctx.globalAlpha = 0.5; ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 70;
      ctx.beginPath(); ctx.moveTo(X[0], Y); ctx.lineTo(X[3], Y); ctx.stroke(); ctx.restore();
      node(ctx, t, tPet, X[0], Y, iconPlatform, '#38bdf8', 'Plataforma', 'até 7.000 m de profundidade');
      flowLine(ctx, X[0] + 115, Y, X[1] - 115, Y, ease.inOut(prog(t, tRef - 0.3, 1.6)), C.gas, t);
      node(ctx, t, tRef + 0.8, X[1], Y, iconRefinery, C.petro, 'Refinaria', 'Gasolina A (pura)', C.gas);
      flowLine(ctx, X[1] + 115, Y, X[2] - 115, Y, ease.inOut(prog(t, tDist - 0.3, 1.5)), C.gas, t);
      node(ctx, t, tDist + 0.6, X[2], Y, iconDistributor, C.dist, 'Distribuidora', t > tC ? 'Gasolina C (a da bomba)' : '', C.gold);
      const uk = appear(t, tEt - 0.1, 0.7, ease.back);
      if (uk > 0) {
        ctx.save(); ctx.translate(U.x, U.y); ctx.scale(uk, uk);
        circle(ctx, 0, 0, 80, hexA(C.etanol, 0.16));
        iconCane(ctx, 0, 6, 90, C.etanol);
        ctx.restore();
        text(ctx, 'Usina: etanol anidro', U.x, U.y + 125, { size: 34, weight: 700, color: C.etanol, alpha: uk });
      }
      const ek = prog(t, tEt + 0.4, 1.4);
      if (ek > 0) {
        flowLine(ctx, U.x + 90, U.y, X[2], U.y, clamp(ek * 2), C.etanol, t);
        if (ek > 0.5) flowLine(ctx, X[2], U.y, X[2], Y + 230, clamp(ek * 2 - 1), C.etanol, t);
      }
      node(ctx, t, tTruck + truckDur - 0.3, X[3], Y, iconPump, C.gold, 'Posto', '');
      if (t > tTruck - 0.2) {
        const tx = truckX(t);
        const a = appear(t, tTruck - 0.2, 0.3);
        const bob = Math.sin(t * 18) * 2;
        ctx.save(); ctx.globalAlpha = a;
        // rastro de velocidade
        const moving = prog(t, tTruck, truckDur) < 0.98 && t > tTruck;
        if (moving) for (let i = 1; i <= 4; i++) fillRR(ctx, tx - 120 - i * 40, Y - 30 + i * 9, 60 - i * 10, 4, 2, 'rgba(255,255,255,0.25)');
        iconTruck(ctx, tx, Y - 8 + bob, 140, '#e2e8f0', C.gas);
        ctx.restore();
      }
      [X[1], X[2], U.x, X[3]].forEach((cx, i) => {
        const k = appear(t, tEtapa + 0.6 + i * 0.22, 0.5, ease.back);
        const cy = i === 2 ? U.y - 140 : Y - 170;
        if (k > 0) { iconCoin(ctx, cx + 90, cy, 46 * k, C.gold); sparks(ctx, t, tEtapa + 0.6 + i * 0.22, cx + 90, cy, C.gold, 10); }
      });
    },
    overlay(ctx, t) {
      punchText(ctx, t, tEtapa + 0.4, 'Cada etapa cobra a sua parte', W / 2, 150, { size: 62, weight: 800, color: C.gold, glow: hexA(C.gold, 0.5) });
    },
  };
}

// ---------------------------------------------------------------- Cena 04: a mistura
function scene04(K) {
  const tDet = K('detalhe'), tDesde = K('desde primeiro'), tPct = K('trinta e dois por cento'), tLitro = K('cada litro que voce');
  const t680 = K('seiscentos e oitenta'), tResto = K('o resto');
  const bx = 420, by = 260, bw = 400, bh = 520;
  const gasT0 = tLitro, gasDur = Math.max(1.6, t680 - tLitro + 0.6);
  const cam = [
    { t: 0, x: 620, y: 520, z: 1.25 },
    { t: tDesde - 0.3, x: 1340, y: 330, z: 1.35, d: 1.4 },
    { t: tLitro - 0.3, x: 620, y: 540, z: 1.35, d: 1.4 },
    { t: t680, x: 1000, y: 520, z: 1.05, d: 1.3 },
    { t: tResto, x: 1000, y: 580, z: 1.1, d: 1.0 },
  ];
  const sfx = [[tDet, 'riser', 0.3, { dur: 1.4 }], [tDesde, 'pop', 0.9], [tPct, 'hit', 0.6], [gasT0, 'liquid', 0.7, { dur: gasDur }],
    [t680, 'pop', 0.8], [tResto, 'liquid', 0.5, { dur: 1.4 }], [tResto + 0.4, 'pop', 0.8]];
  return {
    accent: C.etanol, cam, sfx, impacts: [tPct],
    draw(ctx, t) {
      const gasFill = ease.inOut(prog(t, gasT0, gasDur)) * 0.68;
      const ethFill = ease.inOut(prog(t, tResto, 1.4)) * 0.32;
      rr(ctx, bx, by, bw, bh, 40);
      ctx.save(); ctx.clip();
      ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.fillRect(bx, by, bw, bh);
      const gh = bh * gasFill, eh = bh * ethFill;
      const wave = (yy, amp) => {
        ctx.beginPath(); ctx.moveTo(bx, yy);
        for (let x = 0; x <= bw; x += 10) ctx.lineTo(bx + x, yy + Math.sin(x / 40 + t * 4) * amp);
        ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx, by + bh); ctx.closePath();
      };
      if (gh > 0) {
        ctx.fillStyle = C.gas; wave(by + bh - gh, 7); ctx.fill();
        // bolhas
        for (let i = 0; i < 14; i++) {
          const ph = (t * 0.6 + i * 0.13) % 1;
          circle(ctx, bx + 30 + ((i * 97) % (bw - 60)), by + bh - ph * gh, 4 + (i % 3) * 2, 'rgba(255,255,255,0.25)');
        }
      }
      if (eh > 0) {
        ctx.save(); ctx.beginPath(); ctx.rect(bx, by, bw, bh - gh + 6); ctx.clip();
        ctx.fillStyle = C.etanol; wave(by + bh - gh - eh, 7); ctx.fill(); ctx.restore();
      }
      // jato caindo
      const pouring = (t > gasT0 && t < gasT0 + gasDur) ? C.gas : (t > tResto && t < tResto + 1.4) ? C.etanol : null;
      if (pouring) fillRR(ctx, bx + bw / 2 - 14, by - 120, 28, bh - gh - eh + 120, 14, pouring, 0.9);
      ctx.restore();
      ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 6; rr(ctx, bx, by, bw, bh, 40); ctx.stroke();
      ctx.lineWidth = 3;
      for (let i = 1; i < 10; i++) {
        const yy = by + bh - (bh * i) / 10;
        ctx.beginPath(); ctx.moveTo(bx + bw - (i % 5 === 0 ? 70 : 40), yy); ctx.lineTo(bx + bw, yy); ctx.stroke();
      }
      ctx.restore();
      text(ctx, '1 litro', bx + bw / 2, by + bh + 50, { size: 36, weight: 700, color: C.muted });
      const sk = appear(t, tDesde, 0.7, ease.back);
      if (sk > 0) {
        ctx.save(); ctx.translate(1340, 300); ctx.scale(sk, sk);
        fillRR(ctx, -300, -70, 600, 140, 70, hexA(C.etanol, 0.18));
        ctx.save(); ctx.shadowColor = C.etanol; ctx.shadowBlur = 30; strokeRR(ctx, -300, -70, 600, 140, 70, C.etanol, 4); ctx.restore();
        text(ctx, 'E32', -170, 0, { size: 72, weight: 900, color: C.etanol });
        text(ctx, 'em vigor desde', 90, -22, { size: 28, weight: 600, color: C.muted });
        text(ctx, '1º de agosto de 2026', 90, 22, { size: 34, weight: 800 });
        ctx.restore();
      }
      punchText(ctx, t, tPct, '32% etanol', 1340, 440, { size: 54, weight: 900, color: C.etanol, glow: hexA(C.etanol, 0.6), until: t680 - 0.3 });
      const a1 = appear(t, t680, 0.6), a2 = appear(t, tResto + 0.4, 0.6);
      ctx.save(); ctx.translate((1 - a1) * 60, 0);
      fillRR(ctx, 1060, 480, 24, 90, 8, C.gas, a1);
      text(ctx, '68%  gasolina pura', 1110, 505, { size: 52, weight: 800, align: 'left', alpha: a1 });
      text(ctx, '680 ml', 1110, 555, { size: 32, weight: 500, color: C.muted, align: 'left', alpha: a1 });
      ctx.restore();
      ctx.save(); ctx.translate((1 - a2) * 60, 0);
      fillRR(ctx, 1060, 630, 24, 90, 8, C.etanol, a2);
      text(ctx, '32%  etanol anidro', 1110, 655, { size: 52, weight: 800, align: 'left', alpha: a2 });
      text(ctx, '320 ml', 1110, 705, { size: 32, weight: 500, color: C.muted, align: 'left', alpha: a2 });
      ctx.restore();
    },
    overlay(ctx, t) { overlaySource(ctx, 'MME / ANP', appear(t, tDesde)); },
  };
}

// ---------------------------------------------------------------- Cenas 05 a 09: as fatias
const RX = 860, RW = 940;
function sliceBase(ctx, t, idx, slice, icon, tValue, valueStr, valueAlpha = 1) {
  const k = appear(t, 0.1, 0.6);
  text(ctx, `FATIA ${idx + 1} DE 5`, 140, 170, { size: 28, weight: 700, color: C.muted, align: 'left', alpha: k, letter: 3 });
  glowText(ctx, slice.name, 140, 232, { size: 68, weight: 900, color: slice.color, align: 'left', alpha: k, glow: hexA(slice.color, 0.45) });
  const ik = appear(t, 0.3, 0.8, ease.back);
  if (ik > 0) {
    ctx.save(); ctx.translate(430, 430); ctx.scale(ik * 0.88, ik * 0.88);
    const pulse = 1 + 0.04 * Math.sin(t * 2.6);
    circle(ctx, 0, 0, 150 * pulse, hexA(slice.color, 0.08));
    circle(ctx, 0, 0, 130, hexA(slice.color, 0.15));
    ctx.save(); ctx.strokeStyle = hexA(slice.color, 0.6); ctx.lineWidth = 5; ctx.shadowColor = slice.color; ctx.shadowBlur = 24;
    ctx.beginPath(); ctx.arc(0, 0, 130, 0, 6.283); ctx.stroke(); ctx.restore();
    icon(ctx, 0, 6, 140, slice.color);
    ctx.restore();
  }
  if (tValue != null) {
    const vk = appear(t, tValue - 0.1, 0.4);
    if (vk > 0) {
      const v = counting(t, tValue, 1.0, 0, slice.val);
      const land = t > tValue + 1.0 ? 1 + 0.1 * Math.max(0, 1 - (t - tValue - 1.0) * 4) : 1;
      ctx.save(); ctx.translate(430, 612); ctx.scale(land, land);
      glowText(ctx, valueStr || brl(v), 0, 0, { size: 96, weight: 900, alpha: vk * valueAlpha, glow: hexA(slice.color, 0.6), blur: 40 });
      ctx.restore();
      text(ctx, `por litro · ${slice.pct}% do preço`, 430, 684, { size: 32, weight: 600, color: slice.color, alpha: appear(t, tValue + 0.8) * valueAlpha });
      shockRing(ctx, t, tValue + 1.0, 430, 612, slice.color, 80, 420);
    }
    literBar(ctx, t, SLICES, idx, idx, ease.inOut(prog(t, tValue, 1.2)));
  } else {
    literBar(ctx, t, SLICES, idx, idx, 0);
  }
}
// Câmera padrão das fatias: começa no título, visita cada elemento na ordem em que é falado.
function sliceCam(events, endT) {
  const keys = [{ t: 0, x: 620, y: 360, z: 1.3 }];
  for (const e of [...events].sort((a, b) => a.t - b.t)) keys.push({ d: 1.3, z: 1.07, ...e, t: e.t - 0.25 });
  keys.push({ t: endT, x: 960, y: 520, z: 1.0, d: 2.0 });
  return keys;
}
const VALUE_FOCUS = { x: 760, y: 560, z: 1.15 };
const cardFocus = (y) => ({ x: 1000, y: Math.max(480, Math.min(y, 560)), z: 1.07 });

function scene05(K) {
  const s = S.petro;
  const t1 = K('tres reais e cinco'), t2 = K('sessenta e oito por cento'), tV = K('dois reais e onze'), t3 = K('maior fatia');
  const tAc = K('acompanha o petroleo'), tB = K('cem dolares');
  const cam = sliceCam([{ t: t1, ...cardFocus(380) }, { t: t2, ...cardFocus(500) }, { t: tV, ...VALUE_FOCUS }, { t: t3, ...cardFocus(620) }, { t: tAc, x: 1200, y: 400, z: 1.12 }], tB + 1.6);
  const sfx = [[0.05, 'whoosh', 0.6], [0.35, 'pop', 0.7], [t1, 'pop', 0.8], [t2, 'pop', 0.8], [tV + 1.0, 'impact', 0.6], [t3, 'pop', 0.8], [tB, 'hit', 0.9]];
  ticks(sfx, tV, tV + 1.0);
  return {
    accent: s.color, cam, sfx, impacts: [tV + 1.0, tB],
    draw(ctx, t) {
      sliceBase(ctx, t, 0, s, iconRefinery, tV);
      fact(ctx, t, t1, RX, 300, RW, 120, 'Gasolina A: R$ 3,05 o litro', 'preço médio para as distribuidoras', s.color);
      fact(ctx, t, t2, RX, 445, RW, 120, 'Só 68% do litro é gasolina A', 'os outros 32% são etanol', s.color);
      fact(ctx, t, t3, RX, 590, RW, 100, 'Maior fatia: quase 1/3 do preço', null, s.color);
      // gráfico do barril subindo
      const ok = appear(t, tAc, 0.6, ease.back);
      if (ok > 0) {
        ctx.save(); ctx.translate(RX + RW - 200, 205); ctx.scale(ok, ok);
        fillRR(ctx, -230, -55, 460, 110, 55, hexA(C.fed, 0.18));
        ctx.save(); ctx.shadowColor = C.fed; ctx.shadowBlur = t > tB ? 30 : 0; strokeRR(ctx, -230, -55, 460, 110, 55, C.fed, 3); ctx.restore();
        const usd = t < tB ? counting(t, tAc, tB - tAc, 60, 95) : 100;
        text(ctx, `Barril: US$ ${Math.round(usd)}${t >= tB ? '+' : ''}`, 0, 2, { size: 40, weight: 900 });
        ctx.restore();
      }
    },
    overlay(ctx, t) { overlaySource(ctx, 'Petrobras, g1 (set/2026), CNN Brasil (out/2026)', appear(t, t1)); },
  };
}

function scene06(K) {
  const s = S.etanol;
  const t1 = K('usinas de cana'), tV = K('noventa e oito'), t2 = K('quinze por cento'), t3 = K('safra e ruim'), tUp = K('fatia sobe');
  const cam = sliceCam([{ t: t1, ...cardFocus(355) }, { t: tV, ...VALUE_FOCUS }, { t: t2, ...cardFocus(490) }, { t: t3, ...cardFocus(630) }], tUp + 1.2);
  const sfx = [[0.05, 'whoosh', 0.6], [0.35, 'pop', 0.7], [t1, 'pop', 0.8], [tV + 1.0, 'impact', 0.5], [t2, 'pop', 0.8], [t3, 'pop', 0.8], [tUp, 'riser', 0.35, { dur: 0.9 }]];
  ticks(sfx, tV, tV + 1.0);
  return {
    accent: s.color, cam, sfx, impacts: [tV + 1.0],
    draw(ctx, t) {
      sliceBase(ctx, t, 1, s, iconCane, tV);
      fact(ctx, t, t1, RX, 300, RW, 110, 'Vem das usinas de cana e de milho', null, s.color);
      fact(ctx, t, t2, RX, 435, RW, 110, 'Cerca de 15% do preço', null, s.color);
      fact(ctx, t, t3, RX, 570, RW, 120, 'Safra ruim ou açúcar caro', 'fazem essa fatia subir', s.color);
      const uk = appear(t, tUp, 0.5, ease.back);
      if (uk > 0) {
        const bob = Math.sin(t * 5) * 6;
        ctx.save(); ctx.translate(RX + RW - 70, 630 + bob); ctx.scale(uk, uk);
        ctx.fillStyle = C.fed; ctx.beginPath(); ctx.moveTo(0, -40); ctx.lineTo(30, 0); ctx.lineTo(10, 0); ctx.lineTo(10, 38); ctx.lineTo(-10, 38); ctx.lineTo(-10, 0); ctx.lineTo(-30, 0); ctx.closePath(); ctx.fill();
        ctx.restore();
      }
    },
    overlay(ctx, t) { overlaySource(ctx, 'CNN Brasil, com dados da Petrobras (out/2026)', appear(t, tV)); },
  };
}

function scene07(K) {
  const s = S.icms;
  const t1 = K('valor fixo'), t2 = K('igual em todo'), tV = K('um real e cinquenta e sete'), tPct = K('vinte e quatro por cento');
  const tAum = K('o aumento'), tFev = K('fevereiro de 2027'), t164 = K('um real e sessenta e quatro');
  const cam = sliceCam([{ t: t1, ...cardFocus(345) }, { t: t2, ...cardFocus(475) }, { t: tV, ...VALUE_FOCUS }, { t: tAum, x: 1200, y: 560, z: 1.15 }], t164 + 1.6);
  const sfx = [[0.05, 'whoosh', 0.6], [0.35, 'pop', 0.7], [t1, 'pop', 0.8], [t2, 'pop', 0.8], [tV + 1.0, 'impact', 0.5], [tV + 0.3, 'click', 0.7], [tV + 0.8, 'click', 0.7],
    [tAum, 'riser', 0.4, { dur: Math.max(0.8, t164 - tAum) }], [t164, 'impact', 0.9]];
  ticks(sfx, tV, tV + 1.0);
  const pts = [{ label: '2025', v: 'R$ 1,47', at: tV + 0.3 }, { label: '2026', v: 'R$ 1,57', at: tV + 0.8 }, { label: 'fev/2027', v: 'R$ 1,64', at: t164 }];
  return {
    accent: s.color, cam, sfx, impacts: [tV + 1.0, t164],
    draw(ctx, t) {
      sliceBase(ctx, t, 2, s, iconBank, tV);
      fact(ctx, t, t1, RX, 290, RW, 110, 'Valor fixo por litro desde 2023', null, s.color);
      fact(ctx, t, t2, RX, 420, RW, 110, 'Igual em todos os estados', null, s.color);
      const ly = 640, lx0 = RX + 90, lx1 = RX + RW - 90;
      const l1 = prog(t, tV + 0.2, 0.8), l2 = prog(t, tFev, Math.max(0.6, t164 - tFev));
      if (l1 > 0) {
        ctx.save(); ctx.strokeStyle = hexA(C.icms, 0.55); ctx.lineWidth = 6;
        const reach = l2 > 0 ? lerp((lx0 + lx1) / 2, lx1, ease.out(l2)) : lerp(lx0, (lx0 + lx1) / 2, ease.out(l1));
        ctx.beginPath(); ctx.moveTo(lx0, ly); ctx.lineTo(reach, ly); ctx.stroke(); ctx.restore();
      }
      pts.forEach((p, i) => {
        const k = appear(t, p.at, 0.5, ease.back);
        if (k <= 0) return;
        const x = lerp(lx0, lx1, i / 2);
        const col = i === 2 ? C.fed : C.icms;
        circle(ctx, x, ly, 16 * k, col);
        if (i === 2) { shockRing(ctx, t, p.at, x, ly, C.fed, 20, 160); sparks(ctx, t, p.at, x, ly - 52, C.fed, 14); }
        glowText(ctx, p.v, x, ly - 52, { size: i === 0 ? 40 : 46, weight: 900, alpha: k, color: i === 2 ? C.fed : C.text, glow: i === 2 ? hexA(C.fed, 0.6) : 'rgba(0,0,0,0)' });
        text(ctx, p.label, x, ly + 50, { size: 28, weight: 600, color: C.muted, alpha: k });
      });
    },
    overlay(ctx, t) {
      overlaySource(ctx, 'Confaz, Valor, Poder360 (out/2026)', appear(t, t1));
    },
  };
}

function scene08(K) {
  const s = S.fed;
  const tCide = K('cide'), t89 = K('oitenta e nove'), tFora = K('fora do comum'), tSet = K('em setembro'), tZero = K('zerou tudo');
  const tPro = K('prorrogou'), tBi = K('dois bilhoes'), t20 = K('uns vinte centavos'), tHoje = K('hoje zero');
  const gx = RX, gy = 250, gw = RW;
  const px0 = gx + 60, px1 = gx + gw - 40, py0 = gy + 230, pyTop = gy + 95;
  const xm = (m) => lerp(px0, px1, m / 12);
  const yv = (v) => lerp(py0, pyTop, v / 0.89);
  const cam = sliceCam([{ t: t89, x: 1330, y: 420, z: 1.3 }, { t: tSet, x: 1500, y: 450, z: 1.45 }, { t: tBi, x: 1250, y: 600, z: 1.2 }, { t: t20, ...VALUE_FOCUS }], tHoje + 1.2);
  const sfx = [[0.05, 'whoosh', 0.6], [0.35, 'pop', 0.7], [tCide, 'click', 0.7], [t89, 'pop', 0.8], [tFora, 'riser', 0.4, { dur: Math.max(0.8, tSet - tFora) }],
    [tSet + 0.5, 'drop', 0.9], [tZero, 'drop', 1], [tZero + 0.1, 'hit', 0.8], [tPro, 'click', 0.8], [tBi, 'impact', 1], [tBi + 0.05, 'cash', 0.5],
    [t20, 'pop', 0.8], [tHoje, 'hit', 0.9]];
  return {
    accent: s.color, cam, sfx, impacts: [tZero + 0.1, tBi, tHoje],
    draw(ctx, t) {
      const strike = ease.out(prog(t, tHoje, 0.4));
      sliceBase(ctx, t, 3, s, iconBank, null);
      text(ctx, 'CIDE + PIS/Cofins', 140, 282, { size: 30, weight: 600, color: C.muted, align: 'left', alpha: appear(t, tCide) });
      const gk = appear(t, t89 - 0.2, 0.6);
      if (gk > 0) {
        card(ctx, gx, gy - 30, gw, 420, gk);
        text(ctx, 'R$ por litro de gasolina A · 2026', gx + 40, gy + 10, { size: 26, weight: 600, color: C.muted, align: 'left', alpha: gk });
        ctx.save(); ctx.globalAlpha = gk; ctx.strokeStyle = C.line; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(px0, py0); ctx.lineTo(px1, py0); ctx.stroke();
        ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'].forEach((m, i) => text(ctx, m, xm(i + 0.5), py0 + 34, { size: 22, weight: 500, color: C.muted }));
        ctx.restore();
      }
      ctx.save(); ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.strokeStyle = C.fed; ctx.shadowColor = C.fed; ctx.shadowBlur = 18;
      const k0 = ease.inOut(prog(t, t89, 1.4));
      if (k0 > 0) { ctx.beginPath(); ctx.moveTo(xm(0), yv(0.89)); ctx.lineTo(lerp(xm(0), xm(8.3), k0), yv(0.89)); ctx.stroke(); }
      const k1 = ease.inOut(prog(t, tSet + 0.4, 0.8));
      if (k1 > 0) {
        ctx.beginPath(); ctx.moveTo(xm(8.3), yv(0.89)); ctx.lineTo(xm(8.3), lerp(yv(0.89), yv(0.26), clamp(k1 * 2))); ctx.stroke();
        if (k1 > 0.5) { ctx.beginPath(); ctx.moveTo(xm(8.3), yv(0.26)); ctx.lineTo(lerp(xm(8.3), xm(9.27), clamp(k1 * 2 - 1)), yv(0.26)); ctx.stroke(); }
      }
      const k2 = ease.inOut(prog(t, tZero, 0.8));
      if (k2 > 0) {
        ctx.beginPath(); ctx.moveTo(xm(9.27), yv(0.26)); ctx.lineTo(xm(9.27), lerp(yv(0.26), yv(0), clamp(k2 * 2))); ctx.stroke();
        if (k2 > 0.5) { ctx.beginPath(); ctx.moveTo(xm(9.27), yv(0)); ctx.lineTo(lerp(xm(9.27), xm(10.27), clamp(k2 * 2 - 1)), yv(0)); ctx.stroke(); }
      }
      const k3 = ease.out(prog(t, tPro, 1.0));
      if (k3 > 0) { ctx.setLineDash([14, 12]); ctx.beginPath(); ctx.moveTo(xm(10.27), yv(0)); ctx.lineTo(lerp(xm(10.27), xm(11.27), k3), yv(0)); ctx.stroke(); }
      ctx.restore();
      text(ctx, 'R$ 0,89', xm(3.5), yv(0.89) - 34, { size: 34, weight: 800, alpha: appear(t, t89 + 0.5) });
      [[tSet + 0.4, 'set: −R$ 0,63'], [tZero, '9/out: zerado'], [tPro, 'prorrogado: 9/dez']].forEach(([at, lab], i) => {
        const k = appear(t, at, 0.5, ease.back);
        if (k <= 0) return;
        const pw = 270, pxx = gx + 40 + i * (pw + 25), pyy = 562;
        ctx.save(); ctx.translate(pxx + pw / 2, pyy + 26); ctx.scale(k, k); ctx.translate(-(pxx + pw / 2), -(pyy + 26));
        fillRR(ctx, pxx, pyy, pw, 52, 26, hexA(C.fed, 0.18));
        strokeRR(ctx, pxx, pyy, pw, 52, 26, C.fed, 2);
        text(ctx, lab, pxx + pw / 2, pyy + 27, { size: 26, weight: 700 });
        ctx.restore();
      });
      if (k2 > 0) shockRing(ctx, t, tZero + 0.1, xm(9.6), yv(0), C.fed, 10, 200);
      const ck = appear(t, tBi, 0.6, ease.back);
      if (ck > 0) {
        ctx.save(); ctx.translate(RX + RW / 2, 700); ctx.scale(ck, ck);
        fillRR(ctx, -RW / 2, -55, RW, 110, 24, hexA(C.fed, 0.18));
        ctx.save(); ctx.shadowColor = C.fed; ctx.shadowBlur = 36; strokeRR(ctx, -RW / 2, -55, RW, 110, 24, C.fed, 3); ctx.restore();
        const bi = counting(t, tBi, 1.2, 0, 2.76);
        text(ctx, `R$ ${bi.toFixed(2).replace('.', ',')} bilhões`, -RW / 2 + 40, -2, { size: 50, weight: 900, align: 'left' });
        text(ctx, 'custo de 30 dias de prorrogação', RW / 2 - 40, 0, { size: 28, weight: 600, color: C.muted, align: 'right' });
        ctx.restore();
      }
      const vk = appear(t, t20, 0.5);
      if (vk > 0) {
        glowText(ctx, '≈ R$ 0,20', 430, 612, { size: 84, weight: 900, alpha: vk * (1 - 0.6 * strike), glow: hexA(C.fed, 0.5) });
        if (strike > 0) {
          ctx.save(); ctx.strokeStyle = C.fed; ctx.lineWidth = 9; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(240, 612); ctx.lineTo(lerp(240, 620, strike), 612); ctx.stroke(); ctx.restore();
        }
      }
      punchText(ctx, t, tHoje, 'hoje: R$ 0', 430, 690, { size: 48, weight: 900, color: C.fed, glow: hexA(C.fed, 0.6) });
      literBar(ctx, t, SLICES, 3, 3, ease.inOut(prog(t, t20, 1.0)));
    },
    overlay(ctx, t) { overlaySource(ctx, 'gov.br, Ministério da Fazenda, Valor (2026)', appear(t, t89)); },
  };
}

function scene09(K) {
  const s = S.dist;
  const tV = K('um real e sessenta e oito'), tPct = K('vinte e seis por cento');
  const items = [['truck', 'Frete', K('o frete')], ['person', 'Salários', K('o salario')], ['house', 'Aluguel', K('o aluguel')],
    ['bolt', 'Energia', K('a energia')], ['card', 'Maquininha', K('maquininha')], ['chart', 'Lucro', K('o lucro')]];
  const tTab = K('sem tabela'), t2002 = K('desde 2002');
  const cam = sliceCam([{ t: tV, ...VALUE_FOCUS }, { t: items[0][2], x: 1330, y: 430, z: 1.35 }, { t: items[3][2], x: 1330, y: 500, z: 1.3 },
    { t: tTab, x: 960, y: 560, z: 1.05 }], t2002 + 2.4);
  const sfx = [[0.05, 'whoosh', 0.6], [0.35, 'pop', 0.7], [tV + 1.0, 'impact', 0.5], ...items.map(([, , at]) => [at, 'pop', 0.8]), [items[5][2], 'coin', 0.6], [tTab, 'riser', 0.3, { dur: 1 }], [t2002, 'hit', 0.7]];
  ticks(sfx, tV, tV + 1.0);
  return {
    accent: s.color, cam, sfx, impacts: [tV + 1.0, t2002],
    draw(ctx, t) {
      sliceBase(ctx, t, 4, s, iconPump, tV);
      items.forEach(([kind, label, at], i) => {
        const col = i % 3, row = Math.floor(i / 3);
        const x = RX + 40 + col * 300, y = 260 + row * 230;
        const k = appear(t, at, 0.55, ease.back);
        if (k <= 0) return;
        ctx.save(); ctx.translate(x + 130, y + 95); ctx.scale(k, k); ctx.translate(-(x + 130), -(y + 95));
        const hot = 1 - prog(t, at + 0.3, 1.0);
        ctx.save(); ctx.shadowColor = s.color; ctx.shadowBlur = 40 * hot; card(ctx, x, y, 260, 200, 1); ctx.restore();
        miniIcon(ctx, kind, x + 130, y + 80, 80, kind === 'chart' ? C.gold : s.color);
        text(ctx, label, x + 130, y + 160, { size: 32, weight: 700 });
        ctx.restore();
      });
      const fk = appear(t, t2002, 0.6);
      if (fk > 0) glowText(ctx, 'Preço livre desde 2002: cada posto define o seu', RX + RW / 2, 730 + (1 - fk) * 20, { size: 30, weight: 700, color: C.gold, alpha: fk, glow: hexA(C.gold, 0.5) });
    },
    overlay(ctx, t) {
      overlaySource(ctx, 'CNN Brasil (out/2026), ANP', appear(t, tV));
    },
  };
}

// ---------------------------------------------------------------- Cena 10: o litro completo
const DONUT_ORDER = ['petro', 'dist', 'icms', 'etanol', 'fed'];
function scene10(K) {
  const times = [K('dois e onze'), K('um e sessenta e oito'), K('um e cinquenta e sete'), K('noventa e oito'), K('uns vinte')];
  const tSom = K('somando'), t27 = K('vinte e sete por cento');
  const cx = 600, cy = 500, R = 300, r = 185;
  const cam = [{ t: 0, x: 600, y: 500, z: 1.3 }, { t: times[0] - 0.3, x: 960, y: 480, z: 1.04, d: 1.6 },
    ...times.slice(1).map((tt, i) => ({ t: tt - 0.25, x: 1000, y: 440 + i * 25, z: 1.07, d: 1.2 })),
    { t: tSom, x: 900, y: 500, z: 1.0, d: 1.2 }, { t: t27, x: 760, y: 500, z: 1.2, d: 0.9 }];
  const sfx = [[0.05, 'whoosh', 0.7], ...times.map((tt) => [tt, 'pop', 0.8]), [tSom, 'riser', 0.4, { dur: Math.max(0.8, t27 - tSom) }], [t27, 'impact', 1]];
  return {
    accent: C.icms, cam, sfx, impacts: [t27],
    draw(ctx, t) {
      punchText(ctx, t, 0.1, 'O litro completo', W / 2, 140, { size: 60, weight: 800 });
      const total = SLICES.reduce((s, a) => s + a.val, 0);
      const hl = appear(t, tSom, 0.6);
      let a0 = -Math.PI / 2 + (1 - ease.out(prog(t, 0, 2))) * -0.6;
      ctx.save(); ctx.globalAlpha = 0.5; ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = R - r;
      ctx.beginPath(); ctx.arc(cx, cy, (R + r) / 2, 0, 6.283); ctx.stroke(); ctx.restore();
      DONUT_ORDER.forEach((key, i) => {
        const s = S[key];
        const span = (s.val / total) * Math.PI * 2;
        const k = ease.inOut(prog(t, times[i], 0.8));
        const isTax = key === 'icms' || key === 'fed';
        if (k > 0) {
          const pop = isTax ? 22 * hl : 0;
          const mid = a0 + span / 2;
          ctx.save();
          ctx.translate(Math.cos(mid) * pop, Math.sin(mid) * pop);
          ctx.globalAlpha = isTax ? 1 : 1 - 0.65 * hl;
          ctx.fillStyle = s.color;
          if (isTax && hl > 0) { ctx.shadowColor = s.color; ctx.shadowBlur = 40 * hl; }
          ctx.beginPath(); ctx.arc(cx, cy, R, a0, a0 + span * k); ctx.arc(cx, cy, r, a0 + span * k, a0, true); ctx.closePath(); ctx.fill();
          ctx.restore();
        }
        const lk = appear(t, times[i], 0.5);
        if (lk > 0) {
          const ly = 300 + i * 105;
          const la = lk * (isTax ? 1 : 1 - 0.6 * hl);
          ctx.save(); ctx.translate((1 - lk) * 60, 0);
          fillRR(ctx, 1060, ly - 24, 48, 48, 12, s.color, la);
          text(ctx, s.name, 1136, ly, { size: 42, weight: 700, align: 'left', alpha: la });
          text(ctx, brl(s.val), 1780, ly, { size: 42, weight: 900, align: 'right', alpha: la });
          ctx.restore();
        }
        a0 += span;
      });
      if (hl < 0.5) {
        const a = appear(t, 0.3) * (1 - hl * 2);
        text(ctx, 'R$ 6,54', cx, cy - 10, { size: 72, weight: 900, alpha: a });
        text(ctx, 'por litro', cx, cy + 50, { size: 30, weight: 600, color: C.muted, alpha: a });
      }
      const pk = appear(t, t27, 0.4, ease.back);
      if (pk > 0) {
        ctx.save(); ctx.translate(cx, cy); ctx.scale(pk, pk);
        glowText(ctx, '27%', 0, -14, { size: 104, weight: 900, color: C.icms, glow: hexA(C.icms, 0.7), blur: 50 });
        text(ctx, 'é imposto', 0, 60, { size: 36, weight: 700 });
        ctx.restore();
        shockRing(ctx, t, t27, cx, cy, C.icms, 190, 520);
      }
    },
    overlay(ctx, t) {
      overlaySource(ctx, 'CNN Brasil, Petrobras, ANP (out/2026) · valores arredondados', appear(t, times[0]));
    },
  };
}

// ---------------------------------------------------------------- Cena 11: os seus R$ 100
function banknote(ctx, x, y, w, h, alpha) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha *= alpha;
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, '#1d4ed8'); g.addColorStop(1, '#0e7490');
  ctx.fillStyle = g; ctx.shadowColor = 'rgba(56,189,248,0.5)'; ctx.shadowBlur = 40;
  rr(ctx, x, y, w, h, 20); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 4;
  rr(ctx, x + 16, y + 16, w - 32, h - 32, 12); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath(); ctx.arc(x + w * 0.72, y + h / 2, h * 0.32, 0, 6.283); ctx.fill();
  ctx.restore();
  text(ctx, '100', x + 50, y + 70, { size: 64, weight: 900, align: 'left', alpha });
  text(ctx, 'R$ 100', x + w * 0.72, y + h / 2 + 4, { size: 56, weight: 900, alpha });
  text(ctx, 'CEM REAIS', x + 50, y + h - 50, { size: 26, weight: 800, align: 'left', alpha: alpha * 0.8, letter: 3 });
}
function scene11(K) {
  const tCem = K('pediu cem reais'), tL = K('quinze litros');
  const order = [['petro', 32, K('trinta e dois')], ['dist', 26, K('vinte e seis')], ['icms', 24, K('vinte e quatro')], ['etanol', 15, K('quinze com')], ['fed', 3, K('tres com')]];
  const x0 = 160, wTot = W - 320, y = 590, h = 150;
  const segX = []; { let cx = x0; for (const [, v] of order) { segX.push(cx + (v / 100) * wTot / 2); cx += (v / 100) * wTot; } }
  const cam = [{ t: 0, x: 960, y: 420, z: 1.25 }, { t: tCem, x: 960, y: 380, z: 1.4, d: 1.2 }, { t: tL - 0.2, x: 1150, y: 400, z: 1.15, d: 1.2 },
    ...order.map(([, , at], i) => ({ t: at - 0.25, x: lerp(820, 1100, i / 4), y: 600, z: 1.1, d: 1.1 })),
    { t: order[4][2] + 1.4, x: 960, y: 520, z: 1.0, d: 1.6 }];
  const sfx = [[0.05, 'whoosh', 0.7], [tCem, 'cash', 1], [tL, 'liquid', 0.4, { dur: 1 }], ...order.map(([, , at]) => [at, 'coin', 0.55]), [order[0][2], 'swoosh', 0.5]];
  return {
    accent: '#38bdf8', cam, sfx, impacts: [tCem],
    draw(ctx, t) {
      punchText(ctx, t, 0.1, 'Os seus R$ 100 no posto', W / 2, 140, { size: 60, weight: 800 });
      const nk = appear(t, tCem - 0.2, 0.7, ease.back);
      const nw = 620, nh = 290;
      ctx.save(); ctx.translate(W / 2, 375); ctx.rotate((1 - nk) * -0.25); ctx.translate(-W / 2, -375);
      banknote(ctx, W / 2 - nw / 2, 230 + (1 - nk) * 60, nw, nh, nk);
      ctx.restore();
      sparks(ctx, t, tCem + 0.1, W / 2, 375, C.gold, 20);
      const lk = appear(t, tL, 0.6);
      if (lk > 0) {
        iconDrop(ctx, W / 2 + nw / 2 + 120, 380, 90 * lk, C.gas);
        const lit = counting(t, tL, 0.9, 0, 15.3);
        text(ctx, `≈ ${lit.toFixed(1).replace('.', ',')} litros`, W / 2 + nw / 2 + 200, 380, { size: 44, weight: 800, align: 'left', alpha: lk });
      }
      let cx = x0;
      order.forEach(([key, v, at]) => {
        const s = S[key];
        const sw = (v / 100) * wTot;
        const k = appear(t, at, 0.55, ease.back);
        if (k > 0) {
          ctx.save(); ctx.shadowColor = s.color; ctx.shadowBlur = 30 * (1 - prog(t, at + 0.3, 1));
          fillRR(ctx, cx + 3, y + (1 - k) * 50, sw - 6, h, 16, s.color, k); ctx.restore();
          if (key !== 'fed') {
            text(ctx, `R$ ${v}`, cx + sw / 2, y + h / 2 + (1 - k) * 50, { size: 52, weight: 900, alpha: k });
            text(ctx, s.name, cx + sw / 2, y + h + 40, { size: 26, weight: 600, color: C.muted, alpha: k, maxWidth: sw - 10 });
          } else {
            text(ctx, 'R$ 3', cx + sw / 2, y - 34, { size: 40, weight: 900, color: C.fed, alpha: k });
            text(ctx, 'União', cx + sw / 2, y + h + 40, { size: 26, weight: 600, color: C.muted, alpha: k });
          }
        }
        cx += sw;
      });
    },
    overlay(ctx, t) {
      overlaySource(ctx, 'cálculo do canal com base na composição de out/2026', appear(t, order[0][2]));
    },
  };
}

// ---------------------------------------------------------------- Cena 12: por que não caiu mais?
function scene12(K) {
  const tQ = K('a pergunta'), tDesp = K('nao despencou'), tR = [K('primeiro'), K('segundo'), K('terceiro')], tSub2 = K('entre o fim');
  const tMesmo = K('mesmo assim'), tRS = K('rio grande'), t611 = K('seis e onze'), tMenor = K('menor preco');
  const cardY = (i) => 250 + i * 165;
  const cam = [{ t: 0, x: 960, y: 520, z: 1.25 }, { t: tDesp, x: 960, y: 500, z: 1.4, d: 0.6 },
    ...tR.map((tt, i) => ({ t: tt - 0.3, x: 900, y: cardY(i) + 70, z: 1.25, d: 1.2 })),
    { t: tSub2, x: 960, y: cardY(1) + 90, z: 1.3, d: 1.0 }, { t: tR[2] + 2.5, x: 960, y: 480, z: 1.0, d: 1.4 },
    { t: tRS - 0.2, x: 960, y: 520, z: 1.15, d: 1.0 }, { t: t611, x: 960, y: 520, z: 1.35, d: 0.6 }];
  const sfx = [[tQ, 'whoosh', 0.7], [tDesp, 'hit', 0.8], ...tR.map((tt) => [tt, 'pop', 0.9]), [tSub2, 'click', 0.7],
    [tMesmo, 'riser', 0.6, { dur: Math.max(1, t611 - tMesmo) }], [tRS, 'whoosh', 0.7], [t611, 'impact', 1], [t611 + 0.05, 'sparkle', 0.8]];
  const qMove = (t) => ease.inOut(prog(t, tR[0] - 0.6, 0.8));
  return {
    accent: C.gold, cam, sfx, impacts: [tDesp, t611],
    draw(ctx, t) {
      const fade = 1 - 0.88 * appear(t, tRS - 0.3, 0.6);
      [['1', 'O corte vale só para a gasolina pura', '68% do litro: o etanol não entra nessa conta'],
        ['2', 'Em setembro, o corte trocou um desconto da Petrobras', 'de 30/08 a 10/10, a média nacional quase não mudou'],
        ['3', 'O desconto chega aos poucos', 'conforme o posto compra um estoque novo']].forEach(([n, title, sub], i) => {
        const k = appear(t, tR[i], 0.6);
        if (k <= 0) return;
        const y = cardY(i);
        ctx.save(); ctx.globalAlpha = fade; ctx.translate((1 - k) * 90, 0);
        ctx.save(); ctx.shadowColor = C.gold; ctx.shadowBlur = 30 * (1 - prog(t, tR[i] + 0.3, 1)); card(ctx, 160, y, W - 320, 140, k, C.gold); ctx.restore();
        circle(ctx, 250, y + 70, 42, hexA(C.gold, 0.2), k);
        text(ctx, n, 250, y + 72, { size: 48, weight: 900, color: C.gold, alpha: k });
        text(ctx, title, 330, y + 50, { size: 42, weight: 800, align: 'left', alpha: k });
        text(ctx, sub, 330, y + 100, { size: 30, weight: 500, color: C.muted, align: 'left', alpha: appear(t, i === 1 ? tSub2 : tR[i] + 0.8, 0.6) });
        ctx.restore();
      });
      const hk = appear(t, tRS, 0.6, ease.back);
      if (hk > 0) {
        ctx.save(); ctx.translate(W / 2, 520); ctx.scale(hk, hk);
        fillRR(ctx, -560, -150, 1120, 300, 32, '#0b1222');
        ctx.save(); ctx.shadowColor = C.etanol; ctx.shadowBlur = 40; strokeRR(ctx, -560, -150, 1120, 300, 32, C.etanol, 4); ctx.restore();
        text(ctx, 'Rio Grande do Sul · novembro de 2026', 0, -88, { size: 36, weight: 700, color: C.muted });
        const v = t < t611 ? counting(t, tRS, t611 - tRS, 6.54, 6.2) : counting(t, t611, 0.5, 6.2, 6.11);
        glowText(ctx, brl(v), 0, 4, { size: 120, weight: 900, color: C.etanol, glow: hexA(C.etanol, 0.6), blur: 50 });
        text(ctx, 'o menor preço em um ano', 0, 100, { size: 38, weight: 700, alpha: appear(t, tMenor) });
        ctx.restore();
        shockRing(ctx, t, t611, W / 2, 520, C.etanol, 200, 900);
      }
    },
    overlay(ctx, t) {
      // pergunta grande no centro, que sobe para o topo quando o primeiro motivo chega
      const k = appear(t, tQ - 0.1, 0.5);
      const m = qMove(t);
      const y = lerp(520, 150, m), s = lerp(1.25, 1, m);
      if (k > 0) {
        ctx.save(); ctx.translate(W / 2, y); ctx.scale(s, s);
        glowText(ctx, 'Se zerou o imposto, por que não caiu mais?', 0, 0, { size: 54, weight: 800, alpha: k * (t > tR[0] - 0.6 ? 1 : 1), glow: 'rgba(255,255,255,0.35)' });
        ctx.restore();
      }
      overlaySource(ctx, 'Viasoft (out/2026), GZH com dados da ANP (nov/2026)', appear(t, tR[1]));
    },
    // a pergunta no centro esconde os cards até subir
    hideWorldUntil: tR[0] - 0.6,
  };
}

// ---------------------------------------------------------------- Cena 13: fechamento
function scene13(K) {
  const tPlaca = K('placa do posto'), tNao = K('nao esta pagando'), tCinco = K('cinco negocios'), tInsc = K('se inscreve'), tProx = K('no proximo'), tIph = K('iphone'), tAte = K('ate la');
  const icons = [[iconRefinery, C.petro, 'Petrobras'], [iconCane, C.etanol, 'Usinas'], [iconBank, C.icms, 'Estado'], [iconBank, C.fed, 'União'], [iconPump, C.dist, 'Distribuidora e posto']];
  const cam = [{ t: 0, x: 960, y: 380, z: 1.3 }, { t: tCinco - 0.3, x: 960, y: 360, z: 1.05, d: 1.4 }, { t: tInsc - 0.3, x: 960, y: 600, z: 1.3, d: 1.1 },
    { t: tProx, x: 960, y: 600, z: 1.05, d: 1.2 }, { t: tAte, x: 960, y: 520, z: 0.95, d: 3 }];
  const sfx = [[0.05, 'whoosh', 0.6], [tPlaca, 'neon', 0.5], [tNao, 'hit', 0.6], ...icons.map((_, i) => [tCinco + i * 0.18, 'pop', 0.7]),
    [tInsc + 0.1, 'pop', 0.8], [tInsc + 0.9, 'click', 1], [tIph, 'whoosh', 0.8], [tIph + 0.2, 'sparkle', 0.6], [tAte, 'impact', 0.5]];
  return {
    accent: C.gold, cam, sfx, impacts: [],
    draw(ctx, t) {
      punchText(ctx, t, tNao, 'Você não paga só a gasolina.', W / 2, 150, { size: 60, weight: 900, until: tCinco - 0.2 });
      punchText(ctx, t, tCinco, 'Você paga 5 negócios diferentes.', W / 2, 150, { size: 60, weight: 900, color: C.gold, glow: hexA(C.gold, 0.5) });
      icons.forEach(([fn, col, label], i) => {
        const x = 330 + i * 315, y = 330;
        const k = appear(t, tCinco + i * 0.18, 0.55, ease.back);
        if (k <= 0) return;
        const bob = Math.sin(t * 2 + i) * 6;
        ctx.save(); ctx.translate(x, y + bob); ctx.scale(k, k);
        ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 30; circle(ctx, 0, 0, 95, hexA(col, 0.18)); ctx.restore();
        fn(ctx, 0, 4, 100, col);
        ctx.restore();
        text(ctx, label, x, y + 140, { size: 30, weight: 700, alpha: k });
      });
      const bk = appear(t, tInsc, 0.5, ease.back);
      if (bk > 0) {
        const press = t > tInsc + 0.8 && t < tInsc + 1.05 ? 0.92 : 1;
        const subscribed = t > tInsc + 0.95;
        ctx.save(); ctx.translate(W / 2, 620); ctx.scale(bk * press, bk * press);
        ctx.save(); ctx.shadowColor = '#dc2626'; ctx.shadowBlur = subscribed ? 0 : 40;
        fillRR(ctx, -230, -50, 460, 100, 50, subscribed ? '#334155' : '#dc2626'); ctx.restore();
        text(ctx, subscribed ? 'INSCRITO' : 'INSCREVA-SE', 0, 2, { size: 40, weight: 900, letter: 2 });
        ctx.restore();
      }
      const nk = appear(t, tProx, 0.6);
      if (nk > 0) {
        ctx.save(); ctx.translate(0, (1 - nk) * 30);
        card(ctx, W / 2 - 600, 720, 1200, 110, nk, C.gold);
        text(ctx, 'Próximo vídeo: por que o iPhone custa o dobro no Brasil?', W / 2 + 10, 776, { size: 36, weight: 700, alpha: nk });
        ctx.restore();
      }
    },

  };
}

export const SCENES = [
  { id: '01', name: 'gancho', build: scene01 },
  { id: '02', name: 'titulo', build: scene02 },
  { id: '03', name: 'caminho', build: scene03 },
  { id: '04', name: 'mistura', build: scene04 },
  { id: '05', name: 'petrobras', build: scene05 },
  { id: '06', name: 'etanol', build: scene06 },
  { id: '07', name: 'icms', build: scene07 },
  { id: '08', name: 'federais', build: scene08 },
  { id: '09', name: 'distribuicao', build: scene09 },
  { id: '10', name: 'litro-completo', build: scene10 },
  { id: '11', name: 'cem-reais', build: scene11 },
  { id: '12', name: 'por-que-nao-caiu', build: scene12 },
  { id: '13', name: 'fechamento', build: scene13 },
];
