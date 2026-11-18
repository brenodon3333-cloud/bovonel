
// ================================================================ peças comuns
const B1 = pct(T.pis), B2 = pct(T.imp); // fronteiras na fita da tarifa (0..100)
const selo = (ctx, x, y, str, cor, k) => chip(ctx, x, y, str, cor, k, { size: 22 });
// celular grande no meio da cena (fora do carro)
const celGrande = (ctx, x, y, s, fn, o = {}) => celular(ctx, x, y, s, fn, o);
// painel do carro só enquanto a câmera está dentro do carro (por tempo)
function carroK(t, a, b) { return Math.min(appear(t, a, 0.6), 1 - appear(t, b, 0.6)); }

// ================================================================ Cena 01: janeiro, a mensagem; pode ser verdade (a serra sem cabine), pode ser golpe; quase dez vezes mais caro
function scene01(K) {
  const tVolt = K('Você voltou da praia'), tMsg = K('pedágio em aberto'), tVerd = K('Pode ser verdade'), tDesde = K('Desde o dia 1º de dezembro'), tAnch = K('pela Anchieta e pela Imigrantes'), tCab = K('não tem mais cabine');
  const tGolpe = K('Mas também pode ser golpe'), tIgual = K('o golpe é quase igual'), tSep = K('Até o fim deste vídeo'), tDez = K('Também vai entender'), tMais = K('quase dez vezes mais caro');
  const cam = [
    { t: 0, x: 960, y: 470, z: 1.04, dz: 0.006 }, { t: tMsg, x: 960, y: 430, z: 1.12, d: 1.4 },
    { t: tDesde - 0.3, x: 2400, y: 480, z: 1.0, d: 1.4, dx: 3 }, { t: tCab, x: 2560, y: 480, z: 1.08, d: 1.4 },
    { t: tGolpe - 0.3, x: 3800, y: 470, z: 1.0, d: 1.4 }, { t: tSep, x: 3800, y: 450, z: 1.06, d: 1.4 },
    { t: tDez - 0.3, x: 5200, y: 470, z: 1.0, d: 1.4 }, { t: tMais, x: 5260, y: 470, z: 1.08, d: 2.0, dz: 0.004 },
  ];
  const sfx = [[0.05, 'notif', 0.35], [tVolt, 'pop', 0.25], [tMsg, 'notif', 0.5], [tVerd, 'ding', 0.3], [tDesde - 0.2, 'whoosh', 0.3], [tAnch, 'pop', 0.3], [tCab, 'clank', 0.35], [tCab + 0.5, 'buzz', 0.25],
    [tGolpe - 0.2, 'whoosh', 0.3], [tIgual, 'pop', 0.3], [tIgual + 0.3, 'pop', 0.3], [tSep, 'tick', 0.3], [tDez - 0.2, 'whoosh', 0.3], [tMais, 'hit', 0.4], [tMais + 0.4, 'paper', 0.35]];
  return {
    accent: P.sky, cam, sfx, impacts: [tMais], trans: 'cut',
    draw(ctx, t, cam2) {
      salaFundo(ctx, cam2, 0.95, 0.6);
      zone(ctx, cam2, 900, 1100, () => {
        if (t > tDesde + 0.6) return;
        headline(ctx, 'janeiro', 960, 110, { size: 70, k: appear(t, 0.1, 0.4), hl: '#1e3a8a' });
        { const pul = 1 + 0.05 * Math.sin(Math.PI * prog(t, tMsg, 0.5)); celGrande(ctx, 960, 500, 0.95 * pul, (c) => telaNotif(c, t, { k: appear(t, 0.15, 0.4), marca: t > tVerd ? '?' : null }), { rot: -0.02 }); }
        bigNum(ctx, 'R$ 20,30', 1480, 470, appear(t, 0.6, 0.5), { size: 96, color: '#fde68a' });
        text(ctx, 'pedágio em aberto?', 1480, 550, { size: 32, weight: 900, color: '#e2e8f0', alpha: appear(t, 0.9, 0.4) });
        chip(ctx, 480, 300, 'voltou da praia há 2 semanas', '#fde68a', vis(t, tVolt, tDesde, 0.4, 0.4), { size: 26 });
        chip(ctx, 1480, 300, 'pode ser verdade', P.ok, vis(t, tVerd, tDesde, 0.4, 0.4), { size: 28 });
      });
      zone(ctx, cam2, 2300, 2600, () => {
        if (t < tDesde - 0.8 || t > tGolpe + 0.6) return;
        const k = vis(t, tDesde - 0.3, tGolpe, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        calMini(ctx, 1790, 300, 0.9, 'DEZEMBRO', 1, '#b91c1c', prog(t, tDesde + 0.4, 0.6), { rot: -0.05 });
        mapaEstrada(ctx, 2300, 520, 0.72, t, { fluxo: true, cidades: [[-520, -230, 'SÃO PAULO'], [470, 230, 'BAIXADA SANTISTA']], kc: [1, appear(t, tAnch, 0.5)] });
        chip(ctx, 2330, 180, 'Anchieta e Imigrantes', P.sky, appear(t, tAnch, 0.4), { size: 28 });
        cabineAntiga(ctx, 2900, 560, 0.62, { abre: 0, x: prog(t, tCab + 0.2, 0.5) });
        chip(ctx, 2900, 300, 'sem cabine', '#fca5a5', appear(t, tCab, 0.4), { size: 28 });
        ctx.restore();
      });
      zone(ctx, cam2, 3700, 3900, () => {
        if (t < tGolpe - 0.8 || t > tDez + 0.6) return;
        const k = vis(t, tGolpe - 0.3, tDez, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        const ki = appear(t, tIgual, 0.6);
        celGrande(ctx, lerp(3800, 3560, ease.out(ki)), 500, 0.82, (c) => telaNotif(c, t, { marca: '?' }), { rot: -0.04 });
        if (ki > 0) { ctx.save(); ctx.globalAlpha *= clamp(ki * 2); celGrande(ctx, lerp(3800, 4040, ease.out(ki)), 500, 0.82, (c) => telaNotif(c, t, { marca: '?' }), { rot: 0.04 }); ctx.restore(); }
        chip(ctx, 3560, 160, 'verdadeira?', P.ok, appear(t, tSep, 0.4), { size: 28 });
        chip(ctx, 4040, 160, 'golpe?', P.golpe, appear(t, tSep + 0.3, 0.4), { size: 28 });
        chip(ctx, 3800, 160, 'quase iguais', '#e2e8f0', vis(t, tIgual + 0.4, tSep, 0.4, 0.3), { size: 28 });
        ctx.restore();
      });
      zone(ctx, cam2, 5100, 5300, () => {
        if (t < tDez - 0.8) return;
        const k = appear(t, tDez - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        bilhete(ctx, 4760, 470, 1.0, { rot: -0.06 });
        arrow(ctx, 4980, 470, 5180, 470, '#fde68a', 10, appear(t, tDez + 0.8, 0.5));
        envelopeValor(ctx, 5560, 470, 0.85, appear(t, tDez + 1.2, 0.5));
        bigNum(ctx, 'quase 10×', 5200, 160, appear(t, tMais + 0.4, 0.5), { size: 96, color: '#fca5a5' });
        ctx.restore();
      });
      bokeh(ctx, cam2, t, 3, 8, 0.08);
    },
    overlay(ctx, t) { source(ctx, 'Governo de SP (pórticos desde 1º/12/2026)', vis(t, tDesde, tGolpe, 0.5, 0.4)); },
  };
}

// ================================================================ Cena 02: a descida da serra; o pórtico; ele leu a placa; uns 70 pórticos em 7 estados; livre de fila, não de pagamento
function scene02(K) {
  const tVolta = K('Volta um pouco'), tLugar = K('No lugar da cabine'), tEstr = K('uma estrutura de metal'), tCam = K('com câmeras e antenas'), tPassa = K('Você passa sem frear');
  const tViu = K('Mas o pórtico viu'), tLeu = K('Leu a sua placa'), tTag = K('ou a tag no'), tAnot = K('e anotou a passagem'), tLa = K('Isso não é só lá');
  const t70 = K('uns setenta pórticos'), t7 = K('em sete estados'), tNome = K('O nome em inglês'), tFluxo = K('fluxo livre'), tFila = K('Livre de fila'), tPag = K('Não de pagamento');
  const cam = [
    { t: 0, x: 960, y: 470, z: 1.0, dz: 0.004 }, { t: tCam, x: 960, y: 420, z: 1.05, d: 1.6 }, { t: tViu, x: 960, y: 470, z: 1.1, d: 0.6 },
    { t: tLeu - 0.3, x: 2400, y: 480, z: 1.0, d: 1.2 }, { t: tTag, x: 2500, y: 450, z: 1.08, d: 1.2 },
    { t: tLa - 0.3, x: 3800, y: 470, z: 1.0, d: 1.4 }, { t: t7, x: 3760, y: 500, z: 1.08, d: 1.4 },
    { t: tNome - 0.3, x: 5200, y: 470, z: 1.0, d: 1.4, dx: 3 },
  ];
  const tFlash = tViu - 0.2;
  const sfx = [[0.05, 'whoosh', 0.3], [tLugar, 'pop', 0.3], [tEstr, 'clank', 0.3], [tCam, 'pop', 0.25], [tPassa, 'whoosh', 0.35, { dur: 1.2 }], [tFlash, 'flashPortico', 0.5], [tLeu, 'scan', 0.3], [tTag, 'bipTag', 0.45], [tAnot, 'tick', 0.35],
    [tLa - 0.2, 'whoosh', 0.3], [t70, 'pop', 0.3], [t7, 'sparkle', 0.3], [tNome - 0.2, 'whoosh', 0.3], [tFila, 'whoosh', 0.3, { dur: 0.8 }], [tPag, 'stamp', 0.4]];
  return {
    accent: P.sky, cam, sfx, impacts: [tFlash + 0.1], trans: 'push',
    draw(ctx, t, cam2) {
      serraFundo(ctx, cam2, 0.95);
      zone(ctx, cam2, 900, 1100, () => {
        if (t > tLeu + 0.6) return;
        const port = t < tLugar ? -1 : prog(t, tLugar, tViu - tLugar + 0.4);
        estradaVista(ctx, 960, 470, 1640, 820, t, { vel: 1.3, port, flash: Math.max(0, 1 - Math.abs(t - tFlash) / 0.35) });
        chip(ctx, 960, 150, 'no lugar da cabine, um pórtico', '#e2e8f0', vis(t, tLugar, tPassa, 0.4, 0.4), { size: 30 });
        chip(ctx, 700, 260, 'câmeras', P.sky, vis(t, tCam, tPassa + 1, 0.4, 0.4), { size: 26 });
        chip(ctx, 1220, 260, 'antenas', P.sky, vis(t, tCam + 0.5, tPassa + 1, 0.4, 0.4), { size: 26 });
        headline(ctx, 'o pórtico viu', 960, 200, { size: 70, k: vis(t, tViu, tLeu, 0.3, 0.3), hl: '#1e3a8a' });
      });
      zone(ctx, cam2, 2300, 2600, () => {
        if (t < tLeu - 0.8 || t > tLa + 0.6) return;
        const k = vis(t, tLeu - 0.3, tLa, 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        placa(ctx, 2250, 470, 1.25, 'ABC1D23', { rot: -0.03 });
        const ks = prog(t, tLeu, 0.9); if (ks > 0 && ks < 1) { ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 6; ctx.strokeRect(2250 - 270, 470 - 100 + ks * 0, 540, 200); ctx.fillStyle = 'rgba(74,222,128,0.35)'; ctx.fillRect(2250 - 270, 370 + ks * 200, 540, 6); }
        if (t > tLeu + 0.9) { strokeRR(ctx, 1980, 370, 540, 200, 10, '#4ade80', 6); }
        const kt = appear(t, tTag, 0.4);
        if (kt > 0) { ctx.save(); ctx.globalAlpha *= clamp(kt * 2); fillRR(ctx, 2700, 380, 230, 130, 14, Math.sin((t - tTag) * 20) > 0 && t < tTag + 1 ? P.ok : '#e5e7eb'); text(ctx, 'TAG', 2815, 445, { size: 44, weight: 900, color: '#0f172a' }); ctx.restore(); }
        chip(ctx, 2480, 700, 'passagem anotada · placa e horário', '#4ade80', appear(t, tAnot, 0.4), { size: 26 });
        ctx.restore();
      });
      zone(ctx, cam2, 3700, 3900, () => {
        if (t < tLa - 0.8 || t > tNome + 0.6) return;
        const k = vis(t, tLa - 0.3, tNome, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        const cx = 3560, cy = 560, sc = 13, pt = ([lon, lat]) => [cx + (lon + 54) * sc, cy - (lat + 14) * sc];
        ctx.beginPath(); BRASIL.forEach((p, i) => { const [x, y] = pt(p); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); ctx.fillStyle = 'rgba(30,41,59,0.85)'; ctx.fill(); ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 3; ctx.stroke();
        const est = [['SP', -48.5, -22.5], ['RJ', -42.8, -22.4], ['MG', -44.5, -18.5], ['PR', -51.5, -24.8], ['RS', -53.2, -29.8], ['GO', -49.6, -16.0], ['RO', -63.0, -10.9]];
        est.forEach(([uf, lon, lat], i) => { const kk = appear(t, t7 + i * 0.25, 0.4); if (kk <= 0) return; const [x, y] = pt([lon, lat]); circle(ctx, x, y, 16 * ease.back(kk), P.sky); shockRing(ctx, t, t7 + i * 0.25, x, y, P.sky, 10, 60); text(ctx, uf, x, y - 34, { size: 22, weight: 900, color: '#e2e8f0', alpha: kk }); });
        bigNum(ctx, '74 pórticos', 4300, 380, appear(t, t70, 0.5), { size: 84, color: P.sky });
        text(ctx, 'em 7 estados · ago/2026', 4300, 460, { size: 28, weight: 900, color: '#e2e8f0', alpha: appear(t, t7, 0.4) });
        ctx.restore();
      });
      zone(ctx, cam2, 5100, 5300, () => {
        if (t < tNome - 0.8) return;
        const k = appear(t, tNome - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        portico(ctx, 5200, 560, 0.8, t);
        headline(ctx, 'FREE FLOW', 5200, 180, { size: 110, k: appear(t, tNome, 0.5), color: '#bae6fd', color2: '#38bdf8' });
        text(ctx, '= fluxo livre', 5200, 280, { size: 40, weight: 900, color: '#e2e8f0', alpha: appear(t, tFluxo, 0.4) });
        const kf = appear(t, tFila, 0.5);
        for (let i = 0; i < 4; i++) { const xx = 4700 + ((t - tFila) * 260 + i * 260) % 1100; if (kf > 0) carroLado(ctx, xx, 640, 0.42, { a: kf, cor: ['#dc2626', '#2563eb', '#f8fafc', '#16a34a'][i] }); }
        bilhete(ctx, 5200, 720, 0.9, { a: appear(t, tPag, 0.5), carimbo: t > tPag + 0.3 ? 'A PAGAR' : null });
        ctx.restore();
      });
      neblina(ctx, cam2, t, 5);
    },
    overlay(ctx, t) {
      painelCarro(ctx, t, { a: 1 - appear(t, tLeu - 0.4, 0.5), tag: Math.max(0, 1 - Math.abs(t - tTag - 0.2) / 0.5), celK: 1, cel: (c) => { c.fillStyle = '#0b1222'; c.fillRect(-170, -350, 340, 700); c.save(); c.strokeStyle = '#38bdf8'; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.moveTo(-40, 250); c.quadraticCurveTo(80, 60, -20, -140); c.stroke(); c.restore(); c.fillStyle = '#38bdf8'; c.beginPath(); c.moveTo(-20, -200); c.lineTo(20, -130); c.lineTo(-60, -140); c.closePath(); c.fill(); } });
      source(ctx, 'PEGN (74 pórticos, ago/2026)', vis(t, t70, tNome, 0.5, 0.4));
    },
  };
}

// ================================================================ Cena 03: tag x placa; 30 dias; nada lembra você; 3,4 milhões de multas suspensas; o prazo extra acabou
function scene03(K) {
  const tTag = K('Quem tem tag paga'), tCai = K('a cobrança cai sozinha'), tDesc = K('com desconto'), tNao = K('Quem não tem ganha um prazo'), t30 = K('de trinta dias'), tSite = K('no site oficial');
  const tSimp = K('Parece simples'), tProb = K('O problema é que'), tCanc = K('Não tem cancela'), tRec = K('não tem recibo'), tJan = K('não tem ninguém na janela');
  const t23 = K('Desde 2023'), tRecl = K('junto com as reclamações'), tSusp = K('que o governo suspendeu'), tTempo = K('e deu mais tempo'), t16 = K('Esse tempo extra acabou'), tVolt = K('Agora a multa voltou');
  const cam = [
    { t: 0, x: 960, y: 470, z: 1.0, dx: 3 }, { t: tNao, x: 1100, y: 470, z: 1.06, d: 1.4 },
    { t: tSimp - 0.3, x: 2400, y: 470, z: 1.0, d: 1.4 }, { t: tCanc, x: 2400, y: 500, z: 1.06, d: 1.4 },
    { t: t23 - 0.3, x: 3800, y: 470, z: 1.0, d: 1.4 }, { t: tSusp, x: 3800, y: 440, z: 1.08, d: 1.4 },
    { t: t16 - 0.3, x: 5200, y: 470, z: 1.0, d: 1.4 },
  ];
  const sfx = [[tTag, 'bipTag', 0.45], [tCai, 'coin', 0.35], [tDesc, 'ding', 0.3], [tNao, 'pop', 0.3], [t30, 'flip', 0.35, { dur: 0.8 }], [tSite, 'tap', 0.35], [tSimp, 'pop', 0.25],
    [tSimp - 0.2, 'whoosh', 0.3], [tProb, 'buzz', 0.2], [tCanc, 'pop', 0.3], [tRec, 'pop', 0.3], [tJan, 'pop', 0.3], [t23 - 0.2, 'whoosh', 0.3], [t23 + 0.5, 'paper', 0.3, { dur: 0.6 }], [tRecl, 'buzz', 0.2], [tSusp, 'stamp', 0.45], [tTempo, 'tick', 0.3],
    [t16 - 0.2, 'whoosh', 0.3], [t16 + 0.4, 'flip', 0.3, { dur: 0.4 }], [tVolt, 'hit', 0.4]];
  return {
    accent: P.ok, cam, sfx, impacts: [tSusp, tVolt], trans: 'push',
    draw(ctx, t, cam2) {
      serraFundo(ctx, cam2, 0.9, 0.4);
      zone(ctx, cam2, 900, 1200, () => {
        if (t > tSimp + 0.6) return;
        const k = vis(t, 0, tSimp, 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        chip(ctx, 560, 120, 'COM TAG', P.ok, appear(t, tTag, 0.4), { size: 32 });
        { ctx.save(); ctx.globalAlpha *= appear(t, 0, 0.5); portico(ctx, 560, 300, 0.42, t); ctx.restore(); }
        const kt = appear(t, tTag, 0.5);
        if (kt > 0) { ctx.save(); ctx.globalAlpha *= clamp(kt * 2); fillRR(ctx, 445, 380, 230, 130, 14, Math.sin((t - tTag) * 20) > 0 && t < tTag + 1 ? P.ok : '#e5e7eb'); text(ctx, 'TAG', 560, 445, { size: 44, weight: 900, color: '#0f172a' }); ctx.restore(); }
        const kc = prog(t, tCai, 1.0); if (kc > 0) { const p = ease.inOut(kc); moedaLaranja(ctx, 560, lerp(520, 640, p), 26, kc < 1 ? 1 : 0.0001); bilhete(ctx, 560, 640, 0.8, { carimbo: kc >= 1 ? 'PAGO' : null, carimboCor: '#16a34a' }); }
        chip(ctx, 560, 770, 'em muitas estradas, com desconto', P.ok, appear(t, tDesc, 0.4), { size: 24 });
        chip(ctx, 1360, 150, 'SEM TAG', '#fde68a', appear(t, tNao, 0.4), { size: 32 });
        if (t > tNao - 0.3) celGrande(ctx, 1260, 520, 0.72, (c) => telaSite(c, t, { endereco: 'site oficial', cadeado: true, digitado: prog(t, tSite, 1.0), achou: appear(t, tSite + 1.1, 0.4) }), { a: appear(t, tNao, 0.5), rot: -0.03 });
        if (t > t30) calMini(ctx, 1620, 380, 0.85, 'PRAZO', 30 - Math.floor(clamp((t - t30) / 4) * 29), '#a16207', 0, { a: appear(t, t30, 0.4), rot: 0.05 });
        text(ctx, 'dias', 1620, 510, { size: 26, weight: 900, color: '#fde68a', alpha: appear(t, t30, 0.4) });
        ctx.restore();
      });
      zone(ctx, cam2, 2300, 2500, () => {
        if (t < tSimp - 0.8 || t > t23 + 0.6) return;
        const k = vis(t, tSimp - 0.3, t23, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        headline(ctx, 'parece simples', 2400, 140, { size: 60, k: vis(t, tSimp, tProb + 0.6, 0.4, 0.4), hl: '#14532d' });
        { const kk = vis(t, tSimp - 0.3, tCanc, 0.4, 0.4); if (kk > 0) { ctx.save(); ctx.globalAlpha *= kk; portico(ctx, 2400, 560, 0.75, t); carroLado(ctx, lerp(1800, 3000, prog(t, tSimp, 5)), 700, 0.5, { cor: '#dc2626' }); ctx.restore(); } }
        headline(ctx, 'na estrada, nada lembra você', 2400, 140, { size: 54, k: appear(t, tProb + 0.6, 0.4), hl: '#7f1d1d' });
        cabineAntiga(ctx, 1980, 560, 0.55, { a: appear(t, tCanc, 0.4) * appear(t, tCanc, 0.4), x: prog(t, tCanc + 0.4, 0.4) });
        recibo(ctx, 2420, 520, 0.9, { a: appear(t, tRec, 0.4), x: prog(t, tRec + 0.4, 0.4) });
        const kj = appear(t, tJan, 0.4);
        if (kj > 0) { ctx.save(); ctx.globalAlpha *= kj; fillRR(ctx, 2740, 360, 220, 260, 14, '#334155'); fillRR(ctx, 2765, 390, 170, 130, 10, '#bae6fd'); pessoa(ctx, 2850, 470, 0.8, '#475569', 1); ctx.restore(); xMark(ctx, 2850, 480, 2.0, P.golpe, prog(t, tJan + 0.4, 0.4)); }
        ctx.restore();
      });
      zone(ctx, cam2, 3700, 3900, () => {
        if (t < t23 - 0.8 || t > t16 + 0.6) return;
        const k = vis(t, t23 - 0.3, t16, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        chip(ctx, 3800, 130, 'desde 2023', '#e2e8f0', appear(t, t23, 0.4), { size: 28 });
        const n = Math.round(14 * ease.out(prog(t, t23 + 0.3, 3)));
        for (let i = 0; i < n; i++) envelopeValor(ctx, 3420 + (i % 7) * 26 - 80, 640 - i * 22, 0.42, 1, { rot: -0.08 + (i % 3) * 0.04 });
        chip(ctx, 3360, 260, 'reclamações: não consegui pagar', '#fca5a5', appear(t, tRecl, 0.4), { size: 22 });
        { const ka = appear(t, t23, 0.4); if (ka > 0 && t < tSusp + 0.2) { const ano = 2023 + Math.min(3, Math.floor((t - t23) / 2.2)); calMini(ctx, 4250, 420, 0.95, 'ANO', ano, '#475569', 0, { a: ka * (1 - appear(t, tSusp - 0.3, 0.3)), rot: 0.04 }); } }
        const ks = appear(t, tSusp, 0.5);
        if (ks > 0) { ovalStamp(ctx, 3360, 470, 210, 90, [['SUSPENSAS', 0.05, 0.5]], '#16a34a', ks, -0.12); }
        bigNum(ctx, '3,4 milhões', 4250, 420, appear(t, tSusp, 0.5), { size: 92, color: '#86efac' });
        text(ctx, 'de multas suspensas', 4250, 500, { size: 30, weight: 900, color: '#e2e8f0', alpha: appear(t, tSusp + 0.3, 0.4) });
        if (t > tTempo) { ctx.save(); ctx.globalAlpha *= appear(t, tTempo, 0.4); ampulheta(ctx, 4250, 680, 0.7, t); ctx.restore(); }
        ctx.restore();
      });
      zone(ctx, cam2, 5100, 5300, () => {
        if (t < t16 - 0.8) return;
        const k = appear(t, t16 - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        calMini(ctx, 4850, 470, 1.15, 'NOVEMBRO', 16, '#b91c1c', prog(t, t16 + 0.5, 0.6), { rot: -0.04 });
        chip(ctx, 4850, 220, 'fim do prazo extra', '#fde68a', appear(t, t16 + 0.3, 0.4), { size: 26 });
        envelopeValor(ctx, 5480, 470, 0.8, appear(t, tVolt, 0.5));
        chip(ctx, 5480, 220, 'a multa voltou a valer', '#fca5a5', appear(t, tVolt + 0.2, 0.4), { size: 28 });
        ctx.restore();
      });
      neblina(ctx, cam2, t, 7, 0.06);
    },
    overlay(ctx, t) { source(ctx, 'ANTT; Siga Fácil (30 dias); Deliberação 277/2026', vis(t, tNao, 99, 0.5, 0.4)); },
  };
}

// ================================================================ Cena 04: para onde vai o pedágio (a promessa do 10): imposto menos de R$ 2, o ISS dividido entre as cidades, mais de R$ 18 para a concessionária
function scene04(K) {
  const tAntes = K('Antes de chegar nela'), tPassar = K('passar pelo pórtico'), tSurp = K('A primeira surpresa'), tMenor = K('Ele é a menor parte'), tDois = K('menos de dois reais'), tCam = K('Esse pedacinho ainda faz');
  const tPref = K('O imposto da prefeitura'), tLei = K('A lei divide'), tResto = K('O resto, mais de dezoito'), tConc = K('fica com a concessionária'), tAsf = K('o asfalto da serra'), tGui = K('o guincho'), tAmb = K('a ambulância'), tLuc = K('o lucro dela');
  const tJan = K('Em janeiro'), tRef = K('com a reforma tributária'), t5 = K('uns cinco por cento'), tRep = K('se o imposto novo');
  const cam = [
    { t: 0, x: 960, y: 470, z: 1.0, dz: 0.005 }, { t: tPassar, x: 960, y: 440, z: 1.06, d: 1.4 },
    { t: tSurp - 0.3, x: 2400, y: 470, z: 1.0, d: 1.4 }, { t: tDois, x: 2150, y: 470, z: 1.1, d: 1.2 },
    { t: tPref - 0.3, x: 3800, y: 480, z: 1.0, d: 1.4 }, { t: tLei, x: 3820, y: 500, z: 1.04, d: 1.6, dx: 4 },
    { t: tResto - 0.3, x: 5200, y: 470, z: 1.0, d: 1.4 }, { t: tAsf, x: 5300, y: 520, z: 1.06, d: 1.6, dx: 3 },
    { t: tJan - 0.3, x: 6600, y: 470, z: 1.0, d: 1.4 }, { t: t5, x: 6600, y: 440, z: 1.08, d: 1.4 },
  ];
  const sfx = [[tAntes, 'pop', 0.3], [tPassar, 'whoosh', 0.35], [tSurp - 0.2, 'whoosh', 0.3], [tMenor, 'tesoura', 0.45], [tDois, 'ding', 0.35], [tCam, 'pop', 0.25], [tPref - 0.2, 'whoosh', 0.3],
    [tLei, 'coin', 0.3], [tLei + 0.5, 'coin', 0.3], [tLei + 1.0, 'coin', 0.3], [tResto - 0.2, 'whoosh', 0.3], [tConc, 'cash', 0.35], [tAsf, 'truck', 0.18], [tGui, 'pop', 0.3], [tAmb, 'pop', 0.3], [tLuc, 'coin', 0.35],
    [tJan - 0.2, 'whoosh', 0.3], [tJan + 0.3, 'flip', 0.3, { dur: 0.4 }], [t5, 'riser', 0.25], [tRep, 'pop', 0.3]];
  return {
    accent: P.emp, cam, sfx, impacts: [tDois], trans: 'push',
    draw(ctx, t, cam2) {
      serraFundo(ctx, cam2, 0.9, 0.5);
      zone(ctx, cam2, 900, 1100, () => {
        if (t > tSurp + 0.6) return;
        const k = vis(t, 0, tSurp, 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        chip(ctx, 960, 130, 'a promessa do último vídeo', '#e2e8f0', appear(t, tAntes, 0.4), { size: 26 });
        headline(ctx, 'para onde vai o pedágio?', 960, 230, { size: 64, k: appear(t, tAntes + 0.6, 0.5), hl: '#1e3a8a' });
        portico(ctx, 960, 560, 0.9, t);
        const p = ease.inOut(prog(t, tPassar + 0.2, 2.2)); bilhete(ctx, lerp(500, 1420, p), 700, 0.8, { a: appear(t, tPassar, 0.4) });
        ctx.restore();
      });
      zone(ctx, cam2, 2100, 2500, () => {
        if (t < tSurp - 0.8 || t > tPref + 0.6) return;
        const k = vis(t, tSurp - 0.3, tPref, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        const x0 = 1700, w = 1400, y = 330, kc = appear(t, tMenor, 0.5);
        text(ctx, 'R$ 20,30 · um sentido', 2400, 230, { size: 32, weight: 900, color: '#fde68a' });
        headline(ctx, 'a primeira surpresa: o imposto', 2400, 120, { size: 52, k: vis(t, tSurp, tPref, 0.4, 0.4), hl: '#7c2d12' });
        fita(ctx, x0, y, w, [{ a: 0, b: B1, cor: P.fed, k: kc, gapB: kc, dy: kc * 20 }, { a: B1, b: B2, cor: P.iss, k: kc, gapA: 0, gapB: kc, dy: kc * 20 }, { a: B2, b: 100, cor: P.emp, k: 0.35 * kc, gapA: kc }], { h: 60 });
        if (t > tMenor && t < tMenor + 1.0) tesoura(ctx, fitaX(x0, w, B2), y - 10, 0.7, 0.5 + 0.5 * Math.sin(t * 14), -1.57);
        rotuloFita(ctx, fitaX(x0, w, B2 / 2) + 60, y + 140, 'até R$ 1,76', 'imposto', '#fdba74', appear(t, tDois, 0.5), { size: 60, sub: 26, exemplo: true });
        chip(ctx, 1950, 640, 'PIS e Cofins · R$ 0,74', '#fca5a5', appear(t, tDois + 0.6, 0.4), { size: 24 });
        chip(ctx, 1950, 700, 'ISS · até R$ 1,02', '#d8b4fe', appear(t, tCam, 0.4), { size: 24 });
        ctx.restore();
      });
      zone(ctx, cam2, 3700, 3900, () => {
        if (t < tPref - 0.8 || t > tResto + 0.6) return;
        const k = vis(t, tPref - 0.3, tResto, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        const cid = [[-520, -230, 'SÃO PAULO'], [-200, -100, 'CIDADE B'], [60, 80, 'CIDADE C'], [470, 230, 'LITORAL']];
        const kc = cid.map((_, i) => appear(t, tLei + i * 0.5, 0.5));
        mapaEstrada(ctx, 3800, 520, 0.85, t, { fluxo: true, cidades: cid, kc: kc.map((x, i) => (i === 1 ? Math.max(x, appear(t, tPref, 0.5)) : x)), portico: [-200, -100] });
        chip(ctx, 3800 - 200 * 0.85, 520 - 100 * 0.85 - 170, 'o pórtico está aqui', '#fca5a5', vis(t, tPref, tLei, 0.4, 0.4), { size: 22 });
        cid.forEach(([cx, cy], i) => { const p = ease.in(prog(t, tLei + i * 0.5, 0.6)); if (p > 0 && p < 1) { ctx.save(); ctx.fillStyle = P.iss; circle(ctx, 3800 + cx * 0.85, lerp(150, 520 + cy * 0.85 - 90, p), 18, P.iss); ctx.restore(); } });
        chip(ctx, 3800, 140, 'o ISS é dividido entre as cidades da estrada', '#d8b4fe', appear(t, tLei, 0.4), { size: 28 });
        ctx.restore();
      });
      zone(ctx, cam2, 5100, 5500, () => {
        if (t < tResto - 0.8 || t > tJan + 0.6) return;
        const k = vis(t, tResto - 0.3, tJan, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        fita(ctx, 4520, 200, 1360, [{ a: 0, b: 100, cor: P.emp, k: 1 }], { semPontas: true });
        rotuloFita(ctx, 5200, 120, 'R$ 18,54', null, '#93c5fd', appear(t, tResto, 0.5), { size: 50 });
        escritorioEmpresa(ctx, 4700, 560, 0.75, 'CONCESSIONÁRIA', '#93c5fd', { a: appear(t, tConc, 0.5) });
        rolo(ctx, 5130, 620, 0.62, { a: appear(t, tAsf, 0.5) }); text(ctx, 'asfalto', 5130, 470, { size: 26, weight: 900, color: '#e2e8f0', alpha: appear(t, tAsf, 0.4) });
        guincho(ctx, 5530, 640, 0.5, { a: appear(t, tGui, 0.5) }); text(ctx, 'guincho', 5530, 470, { size: 26, weight: 900, color: '#e2e8f0', alpha: appear(t, tGui, 0.4) });
        ambulancia(ctx, 5860, 650, 0.62, t, { a: appear(t, tAmb, 0.5) }); text(ctx, 'ambulância', 5860, 470, { size: 26, weight: 900, color: '#e2e8f0', alpha: appear(t, tAmb, 0.4) });
        const kl = appear(t, tLuc, 0.5); if (kl > 0) { for (let i = 0; i < 6; i++) circle(ctx, 4700 + 200 + (i % 2) * 18, 760 - i * 16 - (1 - ease.out(kl)) * 120, 30, i % 2 ? '#facc15' : '#eab308', clamp(kl * 2)); text(ctx, 'lucro', 4920, 650, { size: 26, weight: 900, color: '#fde68a', alpha: kl }); }
        ctx.restore();
      });
      zone(ctx, cam2, 6500, 6700, () => {
        if (t < tJan - 0.8) return;
        const k = appear(t, tJan - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        calMini(ctx, 6250, 470, 1.0, 'JANEIRO', 2027, '#1d4ed8', 0, { rot: -0.04 });
        { const kr = appear(t, tRef, 0.5), gr = ease.inOut(prog(t, tRef + 0.5, 2.0)); if (kr > 0) { ctx.save(); ctx.globalAlpha *= kr; fita(ctx, 6420, 760 - 20, 960, [{ a: 0, b: B2 * (1 + 0.6 * gr), cor: P.fed, k: 1, gapB: 1, brilho: gr * (0.5 + 0.5 * Math.sin(t * 6)) }, { a: B2 * (1 + 0.6 * gr), b: 100, cor: P.emp, k: 0.6, gapA: 1 }], { h: 40 }); ctx.restore(); text(ctx, 'o imposto da tarifa', 6900, 700 - 20, { size: 22, weight: 900, color: '#fca5a5', alpha: kr }); } }
        chip(ctx, 6900, 260, 'reforma tributária', '#e2e8f0', appear(t, tRef, 0.4), { size: 28 });
        bigNum(ctx, '+5%?', 6900, 430, appear(t, t5, 0.5), { size: 120, color: '#fca5a5' });
        text(ctx, 'estimativa das concessionárias', 6900, 520, { size: 26, weight: 900, color: '#e2e8f0', alpha: appear(t, t5 + 0.3, 0.4) });
        chip(ctx, 6900, 610, 'se o imposto novo for repassado', '#fde68a', appear(t, tRep, 0.4), { size: 24 });
        ctx.restore();
      });
      neblina(ctx, cam2, t, 9, 0.05);
    },
    overlay(ctx, t) {
      const DUR = this.dur ?? 999;
      source(ctx, 'Conjur (8,65%); LC 116, art. 3º; conta do canal', vis(t, tMenor, tResto, 0.5, 0.4));
      source(ctx, 'Poder360 (nov/2026)', vis(t, tRef, DUR - 0.8, 0.5, 0.3));
      // a transição de efeito (uma só): o flash do pórtico cresce e estoura a tela; a cena 5 nasce dele
      const kf = prog(t, DUR - 0.7, 0.7);
      if (kf > 0) { const g = ctx.createRadialGradient(W / 2, 200, 0, W / 2, 200, lerp(100, 2200, ease.in(kf))); g.addColorStop(0, `rgba(255,255,255,${kf})`); g.addColorStop(1, `rgba(255,255,255,${kf * 0.6})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
    },
  };
}

// ================================================================ Cena 05: a multa (a virada): R$ 195,23 e 5 pontos; não vai para a concessionária; o pedágio continua devido
function scene05(K) {
  const tAgora = K('Agora, a multa'), tPass = K('Passaram os trinta dias'), tGrave = K('É infração grave'), t195 = K('cento e noventa e cinco reais'), t5p = K('e cinco pontos na carteira'), tDez = K('Quase dez vezes o pedágio');
  const tSabe = K('Aqui está a parte'), tNaoVai = K('Esse dinheiro não vai'), tOrgao = K('Vai para o órgão de trânsito'), tSinal = K('em sinalização'), tFisc = K('fiscalização e educação'), tEduc = K('educação no trânsito'), tFundo = K('com uma parte num fundo nacional');
  const tEmp = K('A empresa da estrada não ganha'), tCont = K('E continua cobrando'), tQuita = K('porque pagar a multa'), tDuas = K('Você paga as duas coisas');
  const cam = [
    { t: 0, x: 960, y: 470, z: 1.1, dz: 0.004 }, { t: tGrave, x: 900, y: 470, z: 1.04, d: 1.4 }, { t: tDez, x: 960, y: 450, z: 1.0, d: 1.4 },
    { t: tSabe - 0.3, x: 2400, y: 470, z: 1.0, d: 1.4 }, { t: tOrgao, x: 2480, y: 480, z: 1.02, d: 1.6, dx: 2 },
    { t: tEmp - 0.3, x: 3800, y: 470, z: 1.0, d: 1.4 }, { t: tDuas, x: 3800, y: 450, z: 1.08, d: 1.4 },
  ];
  const sfx = [[0.05, 'impact', 0.3], [tAgora, 'paper', 0.4], [tPass, 'flip', 0.3, { dur: 0.6 }], [tGrave, 'stamp', 0.45], [t195, 'cash', 0.35], [t5p, 'pop', 0.3], [t5p + 0.3, 'pop', 0.25], [t5p + 0.6, 'pop', 0.25], [tDez, 'hit', 0.4],
    [tSabe - 0.2, 'whoosh', 0.3], [tNaoVai, 'buzz', 0.3], [tOrgao, 'coin', 0.35], [tSinal, 'pop', 0.3], [tFisc, 'pop', 0.3], [tEduc, 'pop', 0.3], [tFundo, 'clank', 0.3],
    [tEmp - 0.2, 'whoosh', 0.3], [tCont, 'paper', 0.35], [tQuita, 'stamp', 0.4], [tDuas, 'cash', 0.4]];
  return {
    accent: P.multa, cam, sfx, impacts: [tGrave, tDez], trans: 'cut',
    draw(ctx, t, cam2) {
      serraFundo(ctx, cam2, 0.85, 0.7);
      zone(ctx, cam2, 900, 1100, () => {
        if (t > tSabe + 0.6) return;
        const k = vis(t, 0, tSabe, 0.0, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        calMini(ctx, 420, 360, 0.75, 'PRAZO', 30, '#a16207', prog(t, tPass + 0.3, 0.6), { a: appear(t, tPass, 0.4), rot: -0.06 });
        chip(ctx, 420, 520, '30 dias depois', '#fde68a', appear(t, tPass, 0.4), { size: 24 });
        envelopeValor(ctx, 960, 430, 1.0, appear(t, 0.1, 0.5));
        ovalStamp(ctx, 1200, 250, 190, 70, [['INFRAÇÃO GRAVE', 0.06, 0.42]], '#dc2626', appear(t, tGrave, 0.5), 0.1);
        cnhPontos(ctx, 1520, 520, 0.8, Math.min(5, Math.floor(prog(t, t5p, 1.0) * 5 + (t > t5p ? 1 : 0))), { a: appear(t, t5p - 0.2, 0.4) });
        const kd = appear(t, tDez, 0.5);
        if (kd > 0) for (let i = 0; i < 10; i++) { const kk = appear(t, tDez + i * 0.08, 0.3); bilhete(ctx, 330 + i * 140, 760, 0.42, { a: kk, rot: (i % 2 ? 0.05 : -0.05) }); }
        bigNum(ctx, '≈ 10 pedágios', 960, 860 - 220, appear(t, tDez + 0.6, 0.5), { size: 60, color: '#fca5a5' });
        ctx.restore();
      });
      zone(ctx, cam2, 2300, 2700, () => {
        if (t < tSabe - 0.8 || t > tEmp + 0.6) return;
        const k = vis(t, tSabe - 0.3, tEmp, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        headline(ctx, 'a parte que quase ninguém sabe', 2400, 120, { size: 54, k: vis(t, tSabe, tOrgao, 0.4, 0.4), hl: '#7c2d12' });
        envelopeValor(ctx, 2400, 330, 0.55, 1);
        escritorioEmpresa(ctx, 1900, 640, 0.55, 'CONCESSIONÁRIA', '#93c5fd', { a: appear(t, tNaoVai, 0.4) });
        arrow(ctx, 2300, 420, 2000, 520, '#94a3b8', 8, appear(t, tNaoVai, 0.5)); xMark(ctx, 2140, 470, 1.4, P.golpe, prog(t, tNaoVai + 0.4, 0.4));
        predioGov(ctx, 2900, 600, 0.7, 'ÓRGÃO DE TRÂNSITO', '#fdba74', { a: appear(t, tOrgao, 0.5) });
        arrow(ctx, 2500, 420, 2800, 500, P.multa, 8, appear(t, tOrgao, 0.5));
        placaSinal(ctx, 3120, 560, 0.55, { a: appear(t, tSinal, 0.4) }); text(ctx, 'sinalização', 3120, 430, { size: 22, weight: 900, color: '#e2e8f0', alpha: appear(t, tSinal, 0.4) });
        radar(ctx, 3260, 590, 0.6, t, { a: appear(t, tFisc, 0.4) }); text(ctx, 'fiscalização', 3300, 500, { size: 22, weight: 900, color: '#e2e8f0', alpha: appear(t, tFisc, 0.4) });
        livro(ctx, 3120, 700, 0.42, { a: appear(t, tEduc, 0.4) }); text(ctx, 'educação', 3200, 680, { size: 22, weight: 900, color: '#e2e8f0', align: 'left', alpha: appear(t, tEduc, 0.4) });
        cofre(ctx, 2900, 820 - 60, 0.4, { a: appear(t, tFundo, 0.4) }); chip(ctx, 2620, 760, 'fundo nacional · 5%', '#fde68a', appear(t, tFundo + 0.3, 0.4), { size: 22 });
        ctx.restore();
      });
      zone(ctx, cam2, 3700, 3900, () => {
        if (t < tEmp - 0.8) return;
        const k = appear(t, tEmp - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        escritorioEmpresa(ctx, 3350, 600, 0.7, 'CONCESSIONÁRIA', '#93c5fd', {});
        chip(ctx, 3350, 250, 'da multa: R$ 0', '#93c5fd', appear(t, tEmp + 0.3, 0.4), { size: 30 });
        bilhete(ctx, 3950, 380, 0.95, { a: appear(t, tCont, 0.5), carimbo: t > tQuita + 0.3 ? 'AINDA DEVIDO' : null });
        envelopeValor(ctx, 4250, 600, 0.5, appear(t, tDuas - 0.4, 0.4), { rot: 0.05 });
        const kt = appear(t, tDuas, 0.5);
        if (kt > 0) { bigNum(ctx, 'R$ 215,53', 3950, 140, kt, { size: 80, color: '#fca5a5' }); text(ctx, 'R$ 195,23 + R$ 20,30', 3950, 210, { size: 28, weight: 900, color: '#e2e8f0', alpha: kt }); }
        ctx.restore();
      });
    },
    overlay(ctx, t) {
      const kf = 1 - prog(t, 0, 0.9); if (kf > 0) { ctx.fillStyle = `rgba(255,255,255,${ease.in(kf)})`; ctx.fillRect(0, 0, W, H); }
      source(ctx, 'CTB, arts. 209-A e 320', vis(t, tGrave, tEmp, 0.5, 0.4));
    },
  };
}

// ================================================================ Cena 06: o golpe copia o hábito certo; quase 500 sites falsos; dados reais do carro; o dinheiro vai para outra pessoa
function scene06(K) {
  const tVolta = K('É aí que volta a mensagem'), tHab = K('O pedágio sem cabine criou'), tDig = K('digitar a placa num site'), tCop = K('Os golpistas copiaram'), tEmp = K('Uma empresa de segurança digital'), t500 = K('quase quinhentos sites falsos');
  const tVoce = K('Você digita a placa'), tDados = K('aparecem dados reais'), tValor = K('e um valor pequeno'), tPaga = K('Você paga'), tConta = K('o dinheiro cai na conta'), tAberto = K('A passagem verdadeira continua'), tPrazo = K('e o prazo continua correndo');
  const cam = [
    { t: 0, x: 960, y: 470, z: 1.02, dz: 0.006 }, { t: tDig, x: 960, y: 450, z: 1.08, d: 1.4 },
    { t: tCop - 0.3, x: 2400, y: 470, z: 1.0, d: 1.4 }, { t: t500, x: 2400, y: 460, z: 1.04, d: 1.4 },
    { t: tVoce - 0.3, x: 3800, y: 470, z: 1.0, d: 1.4 }, { t: tConta, x: 3950, y: 480, z: 1.06, d: 1.4 },
    { t: tAberto - 0.3, x: 5200, y: 470, z: 1.0, d: 1.4 },
  ];
  const sfx = [[tVolta, 'notif', 0.4], [tHab, 'pop', 0.3], [tDig, 'key', 0.3], [tDig + 0.3, 'key', 0.3], [tDig + 0.6, 'key', 0.3], [tCop - 0.2, 'whoosh', 0.3], [tCop + 0.3, 'pop', 0.3], [tEmp, 'scan', 0.3], [t500, 'typewriter', 0.25, { n: 14 }],
    [tVoce - 0.2, 'whoosh', 0.3], [tVoce + 0.3, 'key', 0.3], [tVoce + 0.6, 'key', 0.3], [tDados, 'ding', 0.3], [tValor, 'pop', 0.3], [tPaga, 'tap', 0.45], [tConta, 'cash', 0.35], [tConta + 0.4, 'buzz', 0.3], [tAberto - 0.2, 'whoosh', 0.3], [tPrazo, 'clock', 0.3]];
  return {
    accent: P.golpe, cam, sfx, impacts: [tConta + 0.4], trans: 'push',
    draw(ctx, t, cam2) {
      salaFundo(ctx, cam2, 0.9, 0.7);
      zone(ctx, cam2, 900, 1100, () => {
        if (t > tCop + 0.6) return;
        const k = vis(t, 0, tCop, 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        celGrande(ctx, 700, 500, 0.7, (c) => telaNotif(c, t, {}), { rot: -0.05, a: 1 - 0.5 * appear(t, tHab, 0.5) });
        chip(ctx, 700, 130, 'a mensagem do começo', '#e2e8f0', vis(t, tVolta, tHab + 1, 0.4, 0.4), { size: 26 });
        celGrande(ctx, 1240, 500, 0.8, (c) => telaSite(c, t, { endereco: 'site oficial', cadeado: true, digitado: prog(t, tDig, 1.2), achou: appear(t, tDig + 1.4, 0.4) }), { a: appear(t, tHab, 0.5), rot: 0.03 });
        chip(ctx, 1240, 130, 'o hábito novo: placa + Pix', P.ok, appear(t, tDig, 0.4), { size: 26 });
        ctx.restore();
      });
      zone(ctx, cam2, 2300, 2500, () => {
        if (t < tCop - 0.8 || t > tVoce + 0.6) return;
        const k = vis(t, tCop - 0.3, tVoce, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        const kg = appear(t, t500, 0.5), n = Math.round(480 * ease.out(prog(t, t500, 4)));
        if (kg > 0) { ctx.save(); ctx.globalAlpha *= 0.85 * kg; for (let i = 0; i < n; i++) { const c2 = i % 40, r2 = Math.floor(i / 40); fillRR(ctx, 1640 + c2 * 38, 330 + r2 * 40, 32, 32, 4, i % 9 ? '#9f1239' : '#e11d48'); } ctx.restore(); }
        const ks = 1 - appear(t, t500 - 0.2, 0.5);
        celGrande(ctx, 2150, 500, 0.66 * (ks > 0.5 ? 1 : 1), (c) => telaSite(c, t, { endereco: 'site oficial', cadeado: true, digitado: 1, achou: 1 }), { rot: -0.03, a: ks });
        celGrande(ctx, 2650, 500, 0.66, (c) => telaSite(c, t, { endereco: 'site parecido', digitado: 1, achou: 1 }), { rot: 0.03, a: ks * appear(t, tCop + 0.3, 0.5) });
        chip(ctx, 2150, 130, 'verdadeiro', P.ok, appear(t, tCop + 0.6, 0.4) * ks, { size: 26 });
        chip(ctx, 2650, 130, 'falso', P.golpe, appear(t, tCop + 0.8, 0.4) * ks, { size: 26 });
        if (ks > 0.05) { ctx.save(); ctx.globalAlpha *= ks * appear(t, tCop + 1.0, 0.4); lupa(ctx, 2400 + Math.sin((t - tCop) * 1.6) * 260, 320, 0.7, 0.6); ctx.restore(); }
        if (kg > 0) { ctx.save(); ctx.globalAlpha *= kg; fillRR(ctx, 1900, 130, 1000, 170, 24, 'rgba(15,23,42,0.9)'); ctx.restore(); }
        bigNum(ctx, '480 sites falsos', 2400, 195, kg, { size: 84, color: '#fda4af' });
        text(ctx, 'jan–ago/2026 · empresa de segurança digital', 2400, 268, { size: 28, weight: 900, color: '#e2e8f0', alpha: kg });
        ctx.restore();
      });
      zone(ctx, cam2, 3700, 4100, () => {
        if (t < tVoce - 0.8 || t > tAberto + 0.6) return;
        const k = vis(t, tVoce - 0.3, tAberto, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        celGrande(ctx, 3600, 470, 1.0, (c) => telaSite(c, t, { endereco: 'site parecido', digitado: prog(t, tVoce, 1.0), achou: appear(t, tDados, 0.5), botaoCor: t > tPaga && t < tPaga + 0.4 ? '#14532d' : '#16a34a' }), { rot: -0.03 });
        chip(ctx, 3600, 60 + 30, 'dados reais do seu carro', '#fde68a', appear(t, tDados + 0.2, 0.4), { size: 24 });
        chip(ctx, 3150, 520, 'valor de pedágio', '#fde68a', appear(t, tValor, 0.4), { size: 24 });
        carteiraAnonima(ctx, 4300, 500, 0.95, { a: appear(t, tConta - 0.3, 0.4) });
        for (let i = 0; i < 4; i++) { const p = ease.inOut(prog(t, tConta - 0.2 + i * 0.15, 0.7)); if (p > 0 && p < 1) moedaLaranja(ctx, lerp(3700, 4300, p), lerp(560, 500, p) - Math.sin(Math.PI * p) * 120, 20); }
        chip(ctx, 4300, 300, 'conta de outra pessoa', P.golpe, appear(t, tConta + 0.2, 0.4), { size: 26 });
        ctx.restore();
      });
      zone(ctx, cam2, 5100, 5300, () => {
        if (t < tAberto - 0.8) return;
        const k = appear(t, tAberto - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        bilhete(ctx, 4900, 470, 1.05, { carimbo: 'EM ABERTO', carimboCor: '#dc2626' });
        calMini(ctx, 5550, 460, 0.95, 'PRAZO', Math.max(1, 30 - Math.floor((t - tPrazo) * 6)), '#a16207', 0, { a: appear(t, tPrazo, 0.4), rot: 0.05 });
        chip(ctx, 5550, 220, 'o prazo continua correndo', '#fde68a', appear(t, tPrazo, 0.4), { size: 26 });
        ctx.restore();
      });
      bokeh(ctx, cam2, t, 13, 8, 0.07);
    },
    overlay(ctx, t) { source(ctx, 'Kaspersky, via g1 (1/9/2026)', vis(t, t500, tVoce, 0.5, 0.4)); },
  };
}

// ================================================================ Cena 07: como separar (a promessa da cena 1): pela porta de entrada; o aviso oficial não recebe pagamento; onde pagar; não clica no link
function scene07(K) {
  const tComo = K('Então, como separar'), tPorta = K('Pela porta de entrada'), tGov = K('O governo federal começou'), tNaoRec = K('mas esse aviso não recebe'), tMostra = K('ele mostra a passagem'), tIndica = K('e indica onde pagar');
  const tSP = K('Em São Paulo'), tSiga = K('no site Siga Fácil'), tOutras = K('Nas outras estradas'), tFed = K('e nas rodovias federais'), tCNH = K('aplicativo CNH do Brasil');
  const tRegra = K('A regra é uma só'), tLink = K('não clica no link'), tAbre = K('Abre você mesmo'), tDigita = K('digita a placa'), tConf = K('e confere se a passagem existe'), tSe = K('Se ela não aparecer lá'), tGolpe = K('a mensagem era golpe');
  const cam = [
    { t: 0, x: 960, y: 470, z: 1.02, dz: 0.005 }, { t: tPorta, x: 960, y: 460, z: 1.06, d: 1.4 },
    { t: tGov - 0.3, x: 2400, y: 470, z: 1.0, d: 1.4 }, { t: tMostra, x: 2300, y: 450, z: 1.08, d: 1.4 },
    { t: tSP - 0.3, x: 3800, y: 470, z: 1.0, d: 1.4, dx: 3 },
    { t: tRegra - 0.3, x: 5200, y: 470, z: 1.0, d: 1.4 }, { t: tAbre, x: 5100, y: 470, z: 1.06, d: 1.4 }, { t: tSe, x: 5400, y: 470, z: 1.06, d: 1.4 },
  ];
  const sfx = [[tComo, 'pop', 0.3], [tPorta, 'whoosh', 0.3], [tPorta + 0.6, 'ding', 0.3], [tGov - 0.2, 'whoosh', 0.3], [tGov + 0.3, 'notif', 0.4], [tNaoRec, 'buzz', 0.2], [tMostra, 'pop', 0.3], [tIndica, 'pop', 0.3],
    [tSP - 0.2, 'whoosh', 0.3], [tSiga, 'tap', 0.35], [tOutras, 'pop', 0.3], [tFed, 'pop', 0.3], [tCNH, 'tap', 0.35], [tRegra - 0.2, 'whoosh', 0.3], [tLink, 'hit', 0.4], [tAbre, 'key', 0.3], [tAbre + 0.3, 'key', 0.3], [tDigita, 'key', 0.3], [tConf, 'ding', 0.35], [tSe, 'pop', 0.3], [tGolpe, 'stamp', 0.45]];
  return {
    accent: P.ok, cam, sfx, impacts: [tLink], trans: 'push',
    draw(ctx, t, cam2) {
      salaFundo(ctx, cam2, 0.9, 0.6);
      zone(ctx, cam2, 900, 1100, () => {
        if (t > tGov + 0.6) return;
        const k = vis(t, 0, tGov, 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        headline(ctx, 'verdadeira ou falsa?', 960, 120, { size: 62, k: appear(t, tComo, 0.5), hl: '#14532d' });
        const kp = appear(t, tPorta, 0.5);
        celGrande(ctx, 620, 520, 0.68, (c) => telaNotif(c, t, {}), { rot: -0.04 });
        if (kp > 0) { xMark(ctx, 620, 520, 2.6, P.golpe, prog(t, tPorta + 0.2, 0.4)); chip(ctx, 620, 160 + 80, 'pelo link da mensagem', P.golpe, kp, { size: 24 }); }
        celGrande(ctx, 1300, 520, 0.68, (c) => telaSite(c, t, { endereco: 'site oficial', cadeado: true, digEnd: prog(t, tPorta + 0.4, 1.2), digitado: 0 }), { rot: 0.04, a: kp });
        if (kp > 0) { check(ctx, 1300, 760, 1.4, P.ok, prog(t, tPorta + 1.6, 0.4)); chip(ctx, 1300, 160 + 80, 'pela porta de entrada', P.ok, kp, { size: 24 }); }
        ctx.restore();
      });
      zone(ctx, cam2, 2200, 2500, () => {
        if (t < tGov - 0.8 || t > tSP + 0.6) return;
        const k = vis(t, tGov - 0.3, tSP, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        celGrande(ctx, 2200, 480, 1.0, (c) => telaAviso(c, t, { semBotao: t > tNaoRec }), { rot: -0.03 });
        chip(ctx, 2200, 120, 'aviso do governo federal', '#86efac', appear(t, tGov, 0.4), { size: 26 });
        chip(ctx, 2760, 330, 'não recebe pagamento', '#fca5a5', appear(t, tNaoRec + 0.4, 0.4), { size: 26 });
        chip(ctx, 2760, 430, 'mostra a passagem', '#86efac', appear(t, tMostra, 0.4), { size: 26 });
        chip(ctx, 2760, 530, 'indica onde pagar', '#86efac', appear(t, tIndica, 0.4), { size: 26 });
        ctx.restore();
      });
      zone(ctx, cam2, 3700, 3900, () => {
        if (t < tSP - 0.8 || t > tRegra + 0.6) return;
        const k = vis(t, tSP - 0.3, tRegra, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        [[tSP, 'SÃO PAULO', 'site Siga Fácil', 3300], [tOutras, 'OUTRAS ESTRADAS', 'site ou app da concessionária', 3800], [tFed, 'RODOVIAS FEDERAIS', 'app CNH do Brasil', 4300]].forEach(([tt, a2, b2, x], i) => {
          const kk = appear(t, tt, 0.5); if (kk <= 0) return;
          ctx.save(); ctx.globalAlpha *= clamp(kk * 2); ctx.translate(x, 470 + (1 - ease.out(kk)) * 40);
          fillRR(ctx, -230, -170, 460, 340, 22, 'rgba(15,23,42,0.88)'); strokeRR(ctx, -230, -170, 460, 340, 22, P.ok, 4);
          text(ctx, a2, 0, -110, { size: 28, weight: 900, color: '#86efac', letter: 2 });
          fillRR(ctx, -160, -60, 320, 60, 30, '#e2e8f0'); text(ctx, b2, 0, -29, { size: b2.length > 22 ? 19 : 24, weight: 900, color: '#0f172a' });
          ctx.restore();
          if (i === 0) { ctx.save(); ctx.globalAlpha *= kk; fillRR(ctx, 3220, 530, 160, 60, 10, '#e5e7eb'); text(ctx, 'TAG', 3300, 560, { size: 30, weight: 900, color: '#0f172a' }); ctx.restore(); }
          if (i === 2) { ctx.save(); ctx.globalAlpha *= appear(t, tCNH, 0.4); fillRR(ctx, 4240, 520, 120, 120, 26, '#15803d'); text(ctx, 'CNH', 4300, 580, { size: 34, weight: 900, color: '#ffffff' }); ctx.restore(); }
        });
        ctx.restore();
      });
      zone(ctx, cam2, 5000, 5500, () => {
        if (t < tRegra - 0.8) return;
        const k = appear(t, tRegra - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        const kl = appear(t, tLink, 0.4);
        if (kl > 0) { ctx.save(); ctx.translate(5200, 140); fillRR(ctx, -260, -40, 520, 80, 40, '#1e3a8a'); text(ctx, 'clique para pagar ›', 0, 2, { size: 30, weight: 900, color: '#bfdbfe' }); ctx.restore(); crossOut(ctx, 4950, 150, 5450, 130, P.golpe, prog(t, tLink + 0.2, 0.4), 12); }
        headline(ctx, 'a regra é uma só', 5200, 250, { size: 56, k: vis(t, tRegra, tLink + 0.3, 0.4, 0.3), hl: '#14532d' });
        headline(ctx, 'não clica no link', 5200, 250, { size: 56, k: appear(t, tLink + 0.3, 0.4), hl: '#7f1d1d' });
        celGrande(ctx, 4950, 590, 0.7, (c) => telaSite(c, t, { endereco: 'site oficial', cadeado: true, digEnd: prog(t, tAbre, 1.4), digitado: prog(t, tDigita, 1.0), achou: appear(t, tConf, 0.5) }), { rot: -0.03, a: appear(t, tAbre - 0.2, 0.4) });
        chip(ctx, 4950, 360 - 40 + 0, 'você digita o endereço', P.ok, vis(t, tAbre, tSe, 0.4, 0.4), { size: 22 });
        const ks = appear(t, tSe, 0.5);
        if (ks > 0) { celGrande(ctx, 5480, 590, 0.7, (c) => telaSite(c, t, { endereco: 'site oficial', cadeado: true, digitado: 1, nada: true }), { rot: 0.03, a: ks }); }
        if (t > tGolpe) { rectStamp(ctx, 5480, 430, 320, 100, 'ERA GOLPE', '#e11d48', prog(t, tGolpe, 0.5), -0.1, 44); }
        ctx.restore();
      });
      bokeh(ctx, cam2, t, 15, 8, 0.07);
    },
    overlay(ctx, t) { source(ctx, 'CBN (10/11/2026); ANTT; Siga Fácil', vis(t, tGov, tRegra, 0.5, 0.4)); },
  };
}

// ================================================================ Cena 08: três lugares para o seu dinheiro; só um é obrigatório; tag ou pagar no mesmo dia; o pórtico não esquece
function scene08(K) {
  const tTres = K('o seu dinheiro pode ir para três lugares'), tEstr = K('para a estrada'), tMulta = K('para a multa'), tGolpe = K('ou para o golpe'), tSo = K('Só o primeiro é obrigatório'), tHab = K('Os outros dois dependem');
  const tTag = K('Com tag, o pórtico cobra'), tSem = K('Sem tag, chegou da viagem'), tNao = K('O pórtico não esquece');
  const cam = [
    { t: 0, x: 960, y: 500, z: 0.98, dz: 0.006 }, { t: tGolpe, x: 960, y: 440, z: 1.04, d: 1.4 }, { t: tSo, x: 860, y: 460, z: 1.04, d: 1.2 },
    { t: tTag - 0.3, x: 2400, y: 470, z: 1.0, d: 1.4 }, { t: tNao - 0.3, x: 3800, y: 460, z: 1.02, d: 1.2 }, { t: tNao + 1.5, x: 3800, y: 420, z: 1.12, d: 2.0, dz: 0.003 },
  ];
  const sfx = [[tTres, 'pop', 0.3], [tEstr, 'whoosh', 0.3, { dur: 0.4 }], [tMulta, 'whoosh', 0.3, { dur: 0.4 }], [tGolpe, 'whoosh', 0.3, { dur: 0.4 }], [tSo, 'ding', 0.4], [tHab, 'pop', 0.25], [tTag - 0.2, 'whoosh', 0.3], [tTag + 0.3, 'bipTag', 0.45], [tSem, 'tap', 0.35], [tSem + 1.0, 'ding', 0.3], [tNao - 0.2, 'whoosh', 0.3], [tNao + 0.4, 'flashPortico', 0.35]];
  return {
    accent: P.emp, cam, sfx, impacts: [tSo], trans: 'push',
    draw(ctx, t, cam2) {
      serraFundo(ctx, cam2, 0.9, 0.3);
      zone(ctx, cam2, 800, 1100, () => {
        if (t > tTag + 0.6) return;
        const k = vis(t, 0, tTag, 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        headline(ctx, 'três lugares', 960, 140, { size: 64, k: vis(t, tTres, tEstr + 0.4, 0.4, 0.3), hl: '#1e3a8a' });
        carroLado(ctx, 960, 680, 0.85, { cor: '#dc2626' });
        tresSetas(ctx, 960, 620, t, [appear(t, tEstr, 0.5), appear(t, tMulta, 0.5), appear(t, tGolpe, 0.5)], appear(t, tSo, 0.5));
        chip(ctx, 960 - 520, 120 + 80, 'obrigatório', P.emp, appear(t, tSo + 0.2, 0.4), { size: 26 });
        chip(ctx, 1220, 760, 'os outros dois dependem de um hábito', '#fde68a', appear(t, tHab, 0.4), { size: 26 });
        ctx.restore();
      });
      zone(ctx, cam2, 2300, 2500, () => {
        if (t < tTag - 0.8 || t > tNao + 0.6) return;
        const k = vis(t, tTag - 0.3, tNao, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        chip(ctx, 1980, 120, 'COM TAG', P.ok, appear(t, tTag, 0.4), { size: 30 });
        portico(ctx, 1980, 260, 0.4, t);
        { const kc = prog(t, tTag + 0.4, 1.0); if (kc > 0) { moedaLaranja(ctx, 1980, lerp(440, 620, ease.inOut(kc)), 22, kc < 1 ? 1 : 0.0001); if (kc >= 1) bilhete(ctx, 1980, 640, 0.6, { carimbo: 'PAGO', carimboCor: '#16a34a' }); } }
        fillRR(ctx, 1865, 360, 230, 130, 14, Math.sin((t - tTag) * 20) > 0 && t < tTag + 1.4 ? P.ok : '#e5e7eb'); text(ctx, 'TAG', 1980, 425, { size: 44, weight: 900, color: '#0f172a' });
        chip(ctx, 1980, 760, 'cobra sozinho · sem prazo', P.ok, appear(t, tTag + 0.8, 0.4), { size: 24 });
        const ks = appear(t, tSem, 0.5);
        chip(ctx, 2820, 160, 'SEM TAG', '#fde68a', ks, { size: 30 });
        if (ks > 0) { celGrande(ctx, 2820, 520, 0.6, (c) => telaSite(c, t, { endereco: 'site oficial', cadeado: true, digitado: 1, nada: t > tSem + 1.0 }), { a: ks, rot: 0.03 }); chip(ctx, 2820, 820 - 40, 'chegou, paga no mesmo dia', '#fde68a', appear(t, tSem + 0.6, 0.4), { size: 24 }); }
        ctx.restore();
      });
      zone(ctx, cam2, 3700, 3900, () => {
        if (t < tNao - 0.8) return;
        const k = appear(t, tNao - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        estradaVista(ctx, 3800, 470, 1500, 760, t, { vel: 0.8, port: 0.55 + 0.05 * Math.sin(t), flash: Math.max(0, 1 - Math.abs(t - tNao - 0.5) / 0.3) * 0.6 });
        headline(ctx, 'o pórtico não esquece', 3800, 160, { size: 62, k: appear(t, tNao + 0.2, 0.5), hl: '#1e3a8a' });
        ctx.restore();
      });
      neblina(ctx, cam2, t, 17, 0.05);
    },
    overlay(ctx, t) {},
  };
}

// ================================================================ Cena 09: janeiro de novo (já sabe o que fazer); inscrição na tag e no painel do pórtico; o videogame
function scene09(K) {
  const tEntao = K('Então, se em janeiro'), tNao = K('não clica, abre o site'), tSe = K('Se esse vídeo te ajudou'), tInsc = K('se inscreve no canal'), tProx = K('No próximo, a gente volta'), tVideo = K('o videogame'), tCamp = K('o campeão daquela lista'), tSera = K('Será que com ele'), tAte = K('Até lá');
  const tPress = tInsc + 0.4;
  const cam = [
    { t: 0, x: 960, y: 470, z: 1.04, dz: 0.005 }, { t: tNao, x: 1000, y: 470, z: 1.08, d: 1.4 },
    { t: tSe - 0.3, x: 2400, y: 480, z: 1.0, d: 1.4 }, { t: tInsc, x: 2400, y: 440, z: 1.08, d: 1.0 },
    { t: tProx - 0.3, x: 3800, y: 480, z: 1.0, d: 1.6, dx: 3 }, { t: tSera, x: 3850, y: 470, z: 1.08, d: 2.0, dz: 0.003 },
  ];
  const sfx = [[tEntao, 'notif', 0.4], [tNao, 'buzz', 0.2], [tNao + 0.6, 'key', 0.3], [tNao + 1.0, 'key', 0.3], [tNao + 1.6, 'ding', 0.3], [tSe - 0.2, 'whoosh', 0.3], [tPress, 'bipTag', 0.55], [tPress + 0.3, 'flip', 0.35, { dur: 0.5 }], [tPress + 0.8, 'ding', 0.45], [tPress + 0.9, 'sparkle', 0.35],
    [tProx - 0.2, 'whoosh', 0.3], [tVideo, 'pop', 0.35], [tCamp, 'pop', 0.3], [tSera, 'riser', 0.25]];
  return {
    accent: P.ok, cam, sfx, impacts: [tPress + 0.8], trans: 'push',
    draw(ctx, t, cam2) {
      salaFundo(ctx, cam2, 0.95, 0.5);
      zone(ctx, cam2, 900, 1100, () => {
        if (t > tSe + 0.6) return;
        const k = vis(t, 0, tSe, 0.4, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        headline(ctx, 'janeiro', 960, 110, { size: 64, k: appear(t, tEntao, 0.4), hl: '#1e3a8a' });
        celGrande(ctx, 700, 520, 0.7 * (1 + 0.05 * Math.sin(Math.PI * prog(t, tEntao, 0.5))), (c) => telaNotif(c, t, {}), { rot: -0.04 });
        chip(ctx, 700, 160 + 80, 'aquela mensagem', '#e2e8f0', vis(t, tEntao + 0.3, tNao, 0.4, 0.3), { size: 26 });
        if (t > tNao) { xMark(ctx, 700, 540, 2.4, P.golpe, prog(t, tNao, 0.4)); chip(ctx, 700, 240, 'não clica', P.golpe, appear(t, tNao, 0.4), { size: 26 }); }
        celGrande(ctx, 1240, 520, 0.7, (c) => telaSite(c, t, { endereco: 'site oficial', cadeado: true, digEnd: prog(t, tNao + 0.4, 1.0), digitado: prog(t, tNao + 1.4, 1.0), achou: appear(t, tNao + 2.5, 0.4) }), { rot: 0.04, a: appear(t, tNao + 0.2, 0.4) });
        chip(ctx, 1240, 240, 'abre o site oficial', P.ok, appear(t, tNao + 0.4, 0.4), { size: 26 });
        ctx.restore();
      });
      zone(ctx, cam2, 2300, 2500, () => {
        if (t < tSe - 0.8 || t > tProx + 0.6) return;
        const k = vis(t, tSe - 0.3, tProx, 0.5, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        const on = t > tPress + 0.8;
        painelPortico(ctx, 2400, 420, 1.0, t, on ? 'INSCRITO' : 'INSCREVA-SE', on ? '#4ade80' : '#fde68a');
        const kt = Math.sin(Math.PI * prog(t, tPress, 0.6));
        fillRR(ctx, 2285, 640, 230, 130, 14, t > tPress ? P.ok : '#e5e7eb'); text(ctx, 'TAG', 2400, 705, { size: 44, weight: 900, color: '#0f172a' });
        if (kt > 0) { ctx.save(); ctx.globalAlpha *= kt; const g = ctx.createRadialGradient(2400, 705, 0, 2400, 705, 260); g.addColorStop(0, 'rgba(74,222,128,0.6)'); g.addColorStop(1, 'rgba(74,222,128,0)'); ctx.fillStyle = g; ctx.fillRect(2140, 445, 520, 520); ctx.restore(); }
        sparks(ctx, t, tPress + 0.8, 2400, 270, P.voce, 22);
        chip(ctx, 2400, 120, 'te ajudou a viajar mais tranquilo?', '#e2e8f0', appear(t, tSe, 0.4), { size: 28 });
        ctx.restore();
      });
      zone(ctx, cam2, 3700, 4100, () => {
        if (t < tProx - 0.8) return;
        const k = appear(t, tProx - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= k;
        arvore(ctx, 3420, 450, 0.75, t);
        controleGame(ctx, 3720, 760 - 40, 0.8 * lerp(0.6, 1, ease.back(appear(t, tVideo, 0.5))), t);
        chip(ctx, 4280, 200, 'próximo vídeo: o videogame', P.amber, appear(t, tVideo, 0.4), { size: 30 });
        bigNum(ctx, '72%?', 4280, 400, appear(t, tCamp, 0.5), { size: 130, color: '#fca5a5' });
        text(ctx, 'o campeão da lista', 4280, 500, { size: 30, weight: 900, color: '#e2e8f0', alpha: appear(t, tCamp + 0.3, 0.4) });
        headline(ctx, 'é verdade?', 4280, 640, { size: 64, k: appear(t, tSera, 0.5), hl: '#7c2d12' });
        ctx.restore();
      });
      bokeh(ctx, cam2, t, 19, 9);
    },
    overlay(ctx, t) {},
  };
}

export const SCENES = [
  { id: '01', name: 'janeiro-a-mensagem', build: scene01 },
  { id: '02', name: 'o-portico', build: scene02 },
  { id: '03', name: 'tag-placa-e-prazo', build: scene03 },
  { id: '04', name: 'para-onde-vai-o-pedagio', build: scene04 },
  { id: '05', name: 'a-multa', build: scene05 },
  { id: '06', name: 'o-golpe', build: scene06 },
  { id: '07', name: 'como-separar', build: scene07 },
  { id: '08', name: 'tres-lugares', build: scene08 },
  { id: '09', name: 'fechamento', build: scene09 },
];
