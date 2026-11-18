// Vídeo 11: pedágio sem cancela (free flow). Abre no futuro (janeiro, a mensagem no celular) e volta à descida da serra.
// Cada cena recebe K(frase) = instante (s, relativo à cena) em que a frase começa na narração.
// Palco: dentro do carro à noite, descendo a serra (painel, para-brisa, retrovisor com a tag, celular no suporte);
// cenas 1 e 9 em casa, em janeiro. Fio condutor: o celular, por onde chegam a cobrança, o site oficial e o golpe.
// Regras: câmera sempre andando, nada parado por mais de ~6 s, transições discretas, uma só de efeito (o flash do pórtico
// estoura a tela na entrada da cena 5, a virada), sem música, objetos genéricos sem marca, nenhum texto abaixo de y≈890.
import { W, H, C, clamp, lerp, prog, ease, appear, text, font, rr, fillRR, strokeRR, circle, hexA, source, iconTruck } from './lib.js';
import { glowText, counting, shockRing, sparks, layer, flash } from './fx.js';

// cores fixas do canal: empresa azul (concessionária), estado laranja (multa, órgão de trânsito), União vermelho (PIS e Cofins),
// prefeitura roxo (ISS), verde para "o jeito certo", rosa-escuro para o golpe
const P = {
  emp: '#3b82f6', fed: '#ef4444', iss: '#a855f7', multa: '#f59e0b', ok: '#22c55e', golpe: '#e11d48', gold: '#facc15', ouro2: '#d4a017',
  ink: '#1f2937', paper: '#fbfaf5', red: '#dc2626', amber: '#fbbf24', sky: '#38bdf8', voce: '#4ade80', aqui: '#a855f7', icms: '#f59e0b', fab: '#22c55e',
};
// os R$ 20,30 de um sentido (fontes.md): PIS e Cofins 3,65%, ISS de até 5% (exemplo com 5%), o resto fica com a concessionária
const T = { tarifa: 20.30, pis: 0.74, iss: 1.02 }; T.imp = T.pis + T.iss; T.emp = T.tarifa - T.imp;
const pct = (v) => (100 * v) / T.tarifa;
