// Short do vídeo 11 (vertical 1080x1920): a cena 7 ("como separar a cobrança verdadeira da falsa"), remontada em pé,
// com o mesmo áudio da cena 7 do vídeo longo. Usa os mesmos desenhos de scenes.js (celular, telas, chips, carimbos).
// Layout dos Shorts: título fixo no terço de cima; o celular e os cartões no meio; o terço de baixo sem texto
// (ali ficam os botões e a legenda do app). Termina apontando para o vídeo completo (link "vídeo relacionado").
const SW = 1080, SH = 1920;
function buildShort(K, dur) {
  const tComo = K('Então, como separar'), tPorta = K('Pela porta de entrada'), tGov = K('O governo federal começou'), tNaoRec = K('mas esse aviso não recebe'), tMostra = K('ele mostra a passagem'), tIndica = K('e indica onde pagar');
  const tSP = K('Em São Paulo'), tOutras = K('Nas outras estradas'), tFed = K('e nas rodovias federais'), tCNH = K('aplicativo CNH do Brasil');
  const tRegra = K('A regra é uma só'), tLink = K('não clica no link'), tAbre = K('Abre você mesmo'), tDigita = K('digita a placa'), tConf = K('e confere se a passagem existe'), tSe = K('Se ela não aparecer lá'), tGolpe = K('a mensagem era golpe');
  const fimVoz = dur - 2.6;
  const sfx = [[0.05, 'notif', 0.35], [fimVoz + 0.3, 'ding', 0.4], [fimVoz + 0.4, 'sparkle', 0.3]];
  return {
    sfx,
    draw(ctx, t) {
      // fundo: a sala em janeiro, ampliada para cobrir a tela em pé, com deriva lenta
      ctx.save(); ctx.scale(1.4, 1.4); ctx.translate(-560 + Math.sin(t * 0.08) * 60, 0); salaFundo(ctx, { x: 960, y: 540, z: 1 }, 0.9, 0.6); ctx.restore();
      const z = 1 + 0.02 * Math.sin(t * 0.4);
      // título fixo (funciona sem som): o assunto e a pergunta
      fillRR(ctx, 60, 120, 960, 330, 30, 'rgba(15,23,42,0.85)');
      text(ctx, 'PEDÁGIO SEM CANCELA', SW / 2, 200, { size: 54, weight: 900, color: '#fde68a', letter: 3 });
      headline(ctx, 'verdadeira', SW / 2 - 170, 310, { size: 72, k: 1, color: '#bbf7d0', color2: '#22c55e', noPop: true });
      headline(ctx, 'ou golpe?', SW / 2 + 210, 310, { size: 72, k: 1, color: '#fecdd3', color2: '#e11d48', noPop: true });
      text(ctx, 'a cobrança que chega no celular', SW / 2, 400, { size: 32, weight: 800, color: '#e2e8f0' });
      ctx.save(); ctx.translate(SW / 2, 1010); ctx.scale(z, z); ctx.translate(-SW / 2, -1010);
      const chipY = 540;
      if (t < tGov) {
        // a mensagem x a porta de entrada
        const kp = appear(t, tPorta, 0.5);
        if (kp < 1) celular(ctx, SW / 2, 1010, 1.0, (c) => telaNotif(c, t, { marca: '?' }), { rot: -0.02, a: 1 - kp });
        if (kp > 0) { celular(ctx, SW / 2, 1010, 1.0, (c) => telaSite(c, t, { endereco: 'site oficial', cadeado: true, digEnd: prog(t, tPorta + 0.4, 1.4) }), { rot: 0.02, a: kp }); }
        chip(ctx, SW / 2, chipY, 'como saber?', '#e2e8f0', vis(t, tComo, tPorta, 0.3, 0.3), { size: 34 });
        chip(ctx, SW / 2, chipY, 'pela porta de entrada', P.ok, vis(t, tPorta, tGov, 0.3, 0.3), { size: 34 });
      } else if (t < tSP) {
        celular(ctx, SW / 2, 1010, 1.0, (c) => telaAviso(c, t, { semBotao: t > tNaoRec }), { rot: -0.02, a: appear(t, tGov, 0.4) });
        chip(ctx, SW / 2, chipY, 'aviso do governo federal', '#86efac', vis(t, tGov, tNaoRec + 0.4, 0.3, 0.3), { size: 32 });
        chip(ctx, SW / 2, chipY, 'não recebe pagamento', '#fca5a5', vis(t, tNaoRec + 0.4, tMostra, 0.3, 0.3), { size: 34 });
        chip(ctx, SW / 2, chipY, 'mostra a passagem', '#86efac', vis(t, tMostra, tIndica, 0.3, 0.3), { size: 34 });
        chip(ctx, SW / 2, chipY, 'indica onde pagar', '#86efac', vis(t, tIndica, tSP, 0.3, 0.3), { size: 34 });
      } else if (t < tRegra) {
        chip(ctx, SW / 2, chipY, 'onde pagar', '#86efac', appear(t, tSP, 0.3), { size: 34 });
        [[tSP, 'SÃO PAULO', 'site Siga Fácil'], [tOutras, 'OUTRAS ESTRADAS', 'site ou app da concessionária'], [tFed, 'RODOVIAS FEDERAIS', 'app CNH do Brasil']].forEach(([tt, a2, b2], i) => {
          const kk = appear(t, tt, 0.5); if (kk <= 0) return;
          const y = 700 + i * 250;
          ctx.save(); ctx.globalAlpha *= clamp(kk * 2); ctx.translate((1 - ease.out(kk)) * 80, 0);
          fillRR(ctx, 110, y, 860, 210, 26, 'rgba(15,23,42,0.9)'); strokeRR(ctx, 110, y, 860, 210, 26, P.ok, 5);
          text(ctx, a2, SW / 2, y + 62, { size: 40, weight: 900, color: '#86efac', letter: 3 });
          fillRR(ctx, 190, y + 110, 700, 70, 35, '#e2e8f0'); text(ctx, b2, SW / 2, y + 146, { size: 34, weight: 900, color: '#0f172a' });
          ctx.restore();
        });
        if (t > tCNH) { ctx.save(); ctx.globalAlpha *= appear(t, tCNH, 0.4); fillRR(ctx, 860, 1250, 100, 100, 22, '#15803d'); text(ctx, 'CNH', 910, 1300, { size: 30, weight: 900, color: '#ffffff' }); ctx.restore(); }
      } else if (t < fimVoz) {
        const kl = appear(t, tLink, 0.4);
        headline(ctx, 'a regra é uma só', SW / 2, chipY, { size: 54, k: vis(t, tRegra, tLink + 0.3, 0.3, 0.3), hl: '#14532d' });
        if (kl > 0) { ctx.save(); ctx.globalAlpha *= kl * (1 - appear(t, tSe, 0.4)); fillRR(ctx, 220, chipY - 45, 640, 90, 45, '#1e3a8a'); text(ctx, 'clique para pagar ›', SW / 2, chipY, { size: 38, weight: 900, color: '#bfdbfe' }); crossOut(ctx, 230, chipY + 10, 850, chipY - 10, P.golpe, prog(t, tLink + 0.2, 0.4), 14); ctx.restore(); }
        chip(ctx, SW / 2, chipY + 90, 'não clica no link', P.golpe, vis(t, tLink + 0.4, tSe, 0.3, 0.3), { size: 36 });
        if (t < tAbre) celular(ctx, SW / 2, 1060, 0.95, (c) => telaNotif(c, t, { marca: t > tLink + 0.3 ? 'x' : null, mk: prog(t, tLink + 0.3, 0.4) }), { rot: -0.02, a: 1 - appear(t, tAbre - 0.4, 0.4) });
        const ks = appear(t, tSe, 0.5);
        if (ks < 1) celular(ctx, SW / 2, 1060, 0.95, (c) => telaSite(c, t, { endereco: 'site oficial', cadeado: true, digEnd: prog(t, tAbre, 1.4), digitado: prog(t, tDigita, 1.0), achou: appear(t, tConf, 0.5) }), { rot: -0.02, a: (t > tAbre - 0.4 ? appear(t, tAbre - 0.4, 0.4) : 0) * (1 - ks) });
        chip(ctx, SW / 2, chipY + 90, 'você digita o endereço', P.ok, vis(t, tAbre, tSe, 0.3, 0.3), { size: 32 });
        if (ks > 0) celular(ctx, SW / 2, 1060, 0.95, (c) => telaSite(c, t, { endereco: 'site oficial', cadeado: true, digitado: 1, nada: true }), { rot: 0.02, a: ks });
        chip(ctx, SW / 2, chipY + 90, 'não apareceu no site oficial?', '#fde68a', vis(t, tSe, 99, 0.3, 0.3), { size: 32 });
        if (t > tGolpe) rectStamp(ctx, SW / 2, 880, 520, 140, 'ERA GOLPE', '#e11d48', prog(t, tGolpe, 0.5), -0.1, 70);
      }
      ctx.restore();
      // fim: o vídeo completo (a resposta maior fica lá)
      const kf = appear(t, fimVoz, 0.5);
      if (kf > 0) {
        ctx.save(); ctx.globalAlpha *= kf;
        fillRR(ctx, 90, 620, 900, 640, 34, 'rgba(15,23,42,0.94)'); strokeRR(ctx, 90, 620, 900, 640, 34, '#fde68a', 5);
        text(ctx, 'e a multa de R$ 195,23', SW / 2, 740, { size: 48, weight: 900, color: '#fca5a5' });
        text(ctx, 'quem fica com ela?', SW / 2, 820, { size: 48, weight: 900, color: '#ffffff' });
        text(ctx, 'vídeo completo', SW / 2, 990, { size: 44, weight: 900, color: '#fde68a' });
        text(ctx, 'toque no link do vídeo', SW / 2, 1060, { size: 40, weight: 800, color: '#e2e8f0' });
        text(ctx, 'aqui embaixo', SW / 2, 1120, { size: 40, weight: 800, color: '#e2e8f0' });
        arrow(ctx, SW / 2, 1170, SW / 2, 1240 + 8 * Math.sin(t * 6), '#fde68a', 12, 1);
        ctx.restore();
      }
    },
  };
}
