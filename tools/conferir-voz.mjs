// Confere a narração antes de animar: procura sinais de erro na fala.
// Não reconhece palavras (não há reconhecimento de voz neste ambiente); compara o
// tempo de cada trecho com o tamanho do texto e mede volume, pausas e estalos.
//
// O que acusa:
//   RITMO   trecho bem mais curto que o texto (palavra pulada ou engolida) ou bem
//           mais longo (palavra repetida, gaguejo, frase lida duas vezes)
//   PAUSA   pausa no meio da frase, onde o texto não tem vírgula nem ponto (hesitação)
//   SILÊNCIO pausa longa demais (> 2,5 s)
//   ESTALO  pico de 5 ms muito acima do som ao redor (clique, estalo de boca, falha da voz de IA)
//   VOLUME  cena bem mais alta ou mais baixa que o resto (> 3 dB)
//   RUÍDO   som de fundo nas pausas (respiração forte, chiado)
//   PICO    áudio estourado (pico perto de 0 dBFS)
//
// Uso: node tools/conferir-voz.mjs <pasta-do-video>
// Pré-requisito: envelope.mjs e alinhar.mjs (gera audio/trechos.json)
// Saída: <pasta>/audio/conferencia-voz.txt (com o que fazer em cada caso)
import fs from 'fs';
import path from 'path';

const root = path.resolve(process.argv[2]);
const env = JSON.parse(fs.readFileSync(path.join(root, 'audio', 'envelope.json'), 'utf8'));
const { trechos } = JSON.parse(fs.readFileSync(path.join(root, 'audio', 'trechos.json'), 'utf8'));
const STEP = env.step, R = env.rms;
const dB = (v) => 20 * Math.log10(Math.max(v, 1e-6));
const mmss = (t) => `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, '0')}`;
const curto = (s, n = 70) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
const achados = [];
const add = (t, tipo, txt, fazer) => achados.push({ t, tipo, txt, fazer });

// ---------------------------------------------------------------- RITMO
for (const s of trechos) {
  const ratio = s.dur / s.exp, diff = s.dur - s.exp;
  if (s.syl < 5) continue; // trechos de 1 ou 2 palavras variam demais
  if (ratio < 0.68 && diff < -0.6)
    add(s.a, 'RITMO', `trecho ${Math.round((1 - ratio) * 100)}% mais curto que o texto (${s.dur.toFixed(1)} s, esperado ${s.exp.toFixed(1)} s): "${curto(s.text)}"`,
      'ouvir: palavra pulada ou engolida? Se faltou um número, ele vai escrito na tela no instante certo; se mudou o sentido, regravar só a frase.');
  else if (ratio > 1.5 && diff > 0.8)
    add(s.a, 'RITMO', `trecho ${Math.round((ratio - 1) * 100)}% mais longo que o texto (${s.dur.toFixed(1)} s, esperado ${s.exp.toFixed(1)} s): "${curto(s.text)}"`,
      'ouvir: repetição ou gaguejo? Cortar a parte repetida no áudio (corte na pausa mais próxima) e deixar a câmera andando por cima do corte.');
}

// ---------------------------------------------------------------- REPETIÇÃO (mesmo desenho de som duas vezes seguidas)
{
  // blocos de fala separados por pausas >= 0,2 s, direto do volume
  const thr = Math.pow(10, -40 / 20), bl = [];
  let s0 = -1;
  for (let k = 0; k <= R.length; k++) {
    const L = k < R.length && R[k] > thr;
    if (L && s0 < 0) s0 = k;
    if (!L && s0 >= 0) { if (bl.length && (s0 - bl[bl.length - 1][1]) * STEP < 0.2) bl[bl.length - 1][1] = k; else bl.push([s0, k]); s0 = -1; }
  }
  const forma = ([a, z]) => { const n = 80, v = []; for (let i = 0; i < n; i++) v.push(dB(R[Math.floor(a + (i / n) * (z - a))])); const m = v.reduce((x, y) => x + y, 0) / n; const d = Math.sqrt(v.reduce((x, y) => x + (y - m) ** 2, 0)) || 1; return v.map((x) => (x - m) / d); };
  const corr = (x, y) => x.reduce((s, v, i) => s + v * y[i], 0);
  const F = bl.map(forma);
  for (let i = 0; i < bl.length; i++) {
    const di = (bl[i][1] - bl[i][0]) * STEP;
    if (di < 0.8) continue;
    for (let j = i + 1; j <= Math.min(bl.length - 1, i + 4); j++) {
      const dj = (bl[j][1] - bl[j][0]) * STEP;
      if (Math.abs(dj - di) / di > 0.12) continue;
      const c = corr(F[i], F[j]);
      if (c > 0.85) {
        const t = bl[j][0] * STEP;
        const s = trechos.find((x) => t >= x.a - 0.05 && t <= x.z + 0.05);
        add(t, 'REPETIÇÃO', `o som de ${mmss(t)} é quase igual ao de ${mmss(bl[i][0] * STEP)} (${(c * 100).toFixed(0)}% parecido, ${dj.toFixed(1)} s)${s ? ` perto de "${curto(s.text, 50)}"` : ''}`,
          'ouvir: se a frase foi dita duas vezes, cortar uma no áudio, na pausa; a câmera segue andando por cima do corte.');
      }
    }
  }
}

// ---------------------------------------------------------------- PAUSA no meio da frase
for (const s of trechos) {
  // nas narrações aprovadas, pausas de até ~0,6 s sem pontuação são o jeito normal da voz
  for (const g of s.inner) if (g.gap > 0.7)
    add(g.t, 'PAUSA', `pausa de ${g.gap.toFixed(2)} s no meio de "${curto(s.text)}"`,
      'se soar como hesitação, encurtar a pausa no áudio para ~0,15 s; a animação segue a voz já editada.');
  if (s.gapAfter != null && s.end == null && s.gapAfter > 0.7)
    add(s.z, 'PAUSA', `pausa de ${s.gapAfter.toFixed(2)} s sem vírgula, depois de "…${s.text.split(' ').slice(-4).join(' ')}"`,
      'se soar como hesitação, encurtar a pausa no áudio para ~0,15 s.');
  if (s.gapAfter != null && s.gapAfter > 2.5)
    add(s.z, 'SILÊNCIO', `silêncio de ${s.gapAfter.toFixed(1)} s depois de "…${s.text.split(' ').slice(-4).join(' ')}"`,
      'encurtar para a pausa normal entre cenas, ou usar o silêncio numa revelação com som.');
}

// ---------------------------------------------------------------- ESTALO
{
  // estalo = pico que sobe e desce em ~5 ms. Medido contra o som 10 a 15 ms antes e depois.
  // Nas narrações aprovadas (vídeos 02 a 07) o começo de "p", "t", "c" chega a 24 dB; acima de 26 é estalo.
  let ultimo = -1;
  for (let k = 3; k < R.length - 3; k++) {
    const viz = Math.max(R[k - 2], R[k + 2], R[k - 3], R[k + 3]);
    const sobe = dB(R[k]) - dB(viz);
    if (R[k] > 0.03 && sobe > 26 && (k - ultimo) * STEP > 0.3) {
      ultimo = k;
      const t = k * STEP;
      const s = trechos.find((x) => t >= x.a - 0.05 && t <= x.z + 0.05);
      add(t, 'ESTALO', `pico curto ${sobe.toFixed(0)} dB acima do redor${s ? ` em "${curto(s.text, 50)}"` : ' numa pausa'}`,
        s ? 'ouvir: se for estalo, abaixar só esses ~10 ms no áudio; se não der, cobrir com o efeito sonoro da cena.' : 'abaixar esse trecho da pausa no áudio.');
    }
  }
}

// ---------------------------------------------------------------- VOLUME por cena
{
  // nível da cena = volume que 90% da fala não passa (não depende de pausas nem de limiar).
  // Nas narrações aprovadas as cenas ficam a até 2,2 dB da mediana.
  const fala = (a, z) => { const v = []; for (let k = Math.floor(a / STEP); k < Math.min(R.length, z / STEP); k++) v.push(R[k]); return v; };
  const nivel = (v) => { v = v.slice().sort((x, y) => x - y); return dB(v[Math.floor(v.length * 0.9)] || 0); };
  const cenas = [...new Set(trechos.map((s) => s.scene))];
  const niveis = cenas.map((c) => nivel(trechos.filter((s) => s.scene === c).flatMap((s) => fala(s.a, s.z))));
  const geral = niveis.slice().sort((x, y) => x - y)[Math.floor(niveis.length / 2)];
  for (const [j, c] of cenas.entries()) {
    const ts = trechos.filter((s) => s.scene === c);
    const n = niveis[j];
    if (Math.abs(n - geral) > 3)
      add(ts[0].a, 'VOLUME', `cena ${c + 1} está ${(n - geral).toFixed(1)} dB ${n > geral ? 'mais alta' : 'mais baixa'} que o resto`,
        'igualar o volume da cena na trilha final.');
  }
}

// ---------------------------------------------------------------- RUÍDO nas pausas
{
  const v = [];
  for (const s of trechos) if (s.gapAfter && s.gapAfter > 0.3) {
    const a = Math.ceil((s.z + 0.08) / STEP), z = Math.floor((s.z + s.gapAfter - 0.08) / STEP);
    for (let k = a; k < z; k++) v.push(R[k]);
  }
  v.sort((x, y) => x - y);
  const med = v.length ? dB(v[Math.floor(v.length / 2)]) : -120;
  if (med > -50) add(0, 'RUÍDO', `fundo nas pausas a ${med.toFixed(0)} dBFS (o normal é abaixo de -55)`, 'ouvir as pausas; se tiver chiado ou respiração forte, abaixar as pausas na trilha final.');
}

// ---------------------------------------------------------------- PICO
if (env.peak >= 0.98) add(0, 'PICO', `pico em ${dB(env.peak).toFixed(1)} dBFS (estourado)`, 'baixar o volume geral; trecho estourado pode ter chiado.');

// ---------------------------------------------------------------- relatório
achados.sort((x, y) => x.t - y.t);
const ordem = ['RITMO', 'REPETIÇÃO', 'PAUSA', 'SILÊNCIO', 'ESTALO', 'VOLUME', 'RUÍDO', 'PICO'];
const linhas = [
  `Conferência da narração: ${path.basename(root)}`,
  `Duração ${mmss(env.duration)}, ${trechos.length} trechos, pico ${dB(env.peak).toFixed(1)} dBFS.`,
  `Achados: ${achados.length} (${ordem.map((o) => `${o} ${achados.filter((a) => a.tipo === o).length}`).join(', ')})`,
  'Cada achado é um ponto para OUVIR. A ferramenta não entende as palavras: ela mede tempo e volume.',
  '',
  ...achados.map((a) => `${mmss(a.t).padStart(7)}  ${a.tipo.padEnd(8)} ${a.txt}\n${' '.repeat(18)}-> ${a.fazer}`),
];
fs.writeFileSync(path.join(root, 'audio', 'conferencia-voz.txt'), linhas.join('\n') + '\n');
console.log(linhas.slice(0, 3).join('\n'));
for (const a of achados) console.log(`${mmss(a.t).padStart(7)}  ${a.tipo.padEnd(8)} ${a.txt}`);
