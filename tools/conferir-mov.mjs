// Confere um .mov pronto (depois de codificado) sem precisar decodificar o vídeo.
// Lê a tabela de quadros do arquivo (caixa stsz da faixa de vídeo) e mede o tamanho de cada quadro.
// Num H.264, um quadro igual ao anterior (imagem parada) vira um quadro minúsculo; então um trecho
// travado aparece como uma sequência de quadros pequenos. Também confere duração de imagem x som,
// número de quadros por segundo e quadros-chave.
//
// Uso: node tools/conferir-mov.mjs arquivo.mov [arquivo2.mov ...]
// Acusa: PARADO (>= 1,5 s seguidos com quadros abaixo de 1,5 KB), DURAÇÃO (imagem e som diferentes em mais de 0,1 s),
//        CHAVE (mais de 3 s sem quadro-chave), VAZIO (arquivo sem quadros de vídeo).
// Saída: uma linha por arquivo e, no fim, "TUDO CERTO" ou a lista de problemas (código de saída 1).
import fs from 'fs';

const LIMIAR = 1500, MIN_PARADO = 1.5;
function caixas(buf, ini, fim) {
  const out = []; let p = ini;
  while (p + 8 <= fim) {
    let size = buf.readUInt32BE(p); const type = buf.toString('latin1', p + 4, p + 8); let hdr = 8;
    if (size === 1) { size = Number(buf.readBigUInt64BE(p + 8)); hdr = 16; }
    if (size === 0) size = fim - p;
    out.push({ type, ini: p + hdr, fim: p + size }); p += size;
  }
  return out;
}
const acha = (buf, cx, tipo) => caixas(buf, cx.ini, cx.fim).find((c) => c.type === tipo);
function conferir(arq) {
  const buf = fs.readFileSync(arq), probs = [];
  const moov = caixas(buf, 0, buf.length).find((c) => c.type === 'moov');
  if (!moov) return { arq, probs: ['VAZIO: sem caixa moov'] };
  const faixas = caixas(buf, moov.ini, moov.fim).filter((c) => c.type === 'trak').map((trak) => {
    const mdia = acha(buf, trak, 'mdia'), mdhd = acha(buf, mdia, 'mdhd'), minf = acha(buf, mdia, 'minf'), stbl = acha(buf, minf, 'stbl');
    const v = buf[mdhd.ini], ts = v === 1 ? buf.readUInt32BE(mdhd.ini + 20) : buf.readUInt32BE(mdhd.ini + 12);
    const du = v === 1 ? Number(buf.readBigUInt64BE(mdhd.ini + 24)) : buf.readUInt32BE(mdhd.ini + 16);
    const video = !!acha(buf, minf, 'vmhd'), stsz = acha(buf, stbl, 'stsz'), stss = acha(buf, stbl, 'stss');
    let tam = [];
    if (stsz) { const fixo = buf.readUInt32BE(stsz.ini + 4), n = buf.readUInt32BE(stsz.ini + 8); tam = fixo ? Array(n).fill(fixo) : Array.from({ length: n }, (_, i) => buf.readUInt32BE(stsz.ini + 12 + i * 4)); }
    const chaves = stss ? Array.from({ length: buf.readUInt32BE(stss.ini + 4) }, (_, i) => buf.readUInt32BE(stss.ini + 8 + i * 4) - 1) : null;
    return { video, seg: du / ts, tam, chaves };
  });
  const vid = faixas.find((f) => f.video), som = faixas.find((f) => !f.video);
  if (!vid || !vid.tam.length) return { arq, probs: ['VAZIO: sem quadros de vídeo'] };
  const fps = vid.tam.length / vid.seg;
  if (som && Math.abs(som.seg - vid.seg) > 0.1) probs.push(`DURAÇÃO: imagem ${vid.seg.toFixed(2)} s, som ${som.seg.toFixed(2)} s`);
  const ch = new Set(vid.chaves || []);
  let corrida = 0, ini = 0;
  const fecha = (i) => { if (corrida / fps >= MIN_PARADO) probs.push(`PARADO: ${(ini / fps).toFixed(1)}–${(i / fps).toFixed(1)} s (${(corrida / fps).toFixed(1)} s com a imagem igual)`); corrida = 0; };
  // quadro-chave é sempre grande: não interrompe nem começa uma sequência parada
  vid.tam.forEach((t, i) => { if (ch.has(i)) { if (corrida) corrida++; return; } if (t < LIMIAR) { if (!corrida) ini = i; corrida++; } else fecha(i); });
  fecha(vid.tam.length);
  if (vid.chaves) { const ks = [...vid.chaves, vid.tam.length].sort((a, b) => a - b); for (let k = 1; k < ks.length; k++) if ((ks[k] - ks[k - 1]) / fps > 3) probs.push(`CHAVE: ${((ks[k] - ks[k - 1]) / fps).toFixed(1)} s sem quadro-chave a partir de ${(ks[k - 1] / fps).toFixed(1)} s`); }
  const p = vid.tam.filter((_, i) => !ch.has(i)).sort((a, b) => a - b), med = p[Math.floor(p.length / 2)] || 0;
  return { arq, probs, resumo: `${vid.tam.length} quadros, ${fps.toFixed(2)} q/s, imagem ${vid.seg.toFixed(2)} s, som ${som ? som.seg.toFixed(2) + ' s' : 'nenhum'}, quadro comum ${(med / 1024).toFixed(1)} KB, menor ${(p[0] / 1024).toFixed(1)} KB` };
}
let ruim = 0;
for (const arq of process.argv.slice(2)) {
  const r = conferir(arq);
  console.log(`${arq}: ${r.resumo || ''}`);
  for (const x of r.probs) { console.log('   ' + x); ruim++; }
}
console.log(ruim ? `${ruim} problema(s)` : 'TUDO CERTO: a imagem anda do começo ao fim em todas as partes');
process.exitCode = ruim ? 1 : 0;
