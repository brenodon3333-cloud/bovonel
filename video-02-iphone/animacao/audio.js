// Efeitos sonoros e trilha sintetizados (Web Audio, renderização offline),
// mixados com a narração. Nenhum arquivo de som externo além da voz.

const SR = 32000; // 32 kHz mono: cobre voz, música e efeitos e mantém o arquivo abaixo de 100 MB

function noiseBuffer(ac, sec, kind = 'white') {
  const n = Math.ceil(sec * ac.sampleRate);
  const b = ac.createBuffer(1, n, ac.sampleRate);
  const d = b.getChannelData(0);
  let last = 0;
  for (let i = 0; i < n; i++) {
    const w = Math.random() * 2 - 1;
    if (kind === 'brown') { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w;
  }
  return b;
}
function env(g, T, pts) { // pts: [[dt, valor], ...]
  g.gain.setValueAtTime(pts[0][1], T + pts[0][0]);
  for (let i = 1; i < pts.length; i++) g.gain.linearRampToValueAtTime(pts[i][1], T + pts[i][0]);
}
function expEnv(g, T, peak, attack, decay) {
  g.gain.setValueAtTime(0.0001, T);
  g.gain.linearRampToValueAtTime(peak, T + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, T + attack + decay);
}
function osc(ac, type, f, T, dur, out) {
  const o = ac.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, T);
  o.connect(out); o.start(T); o.stop(T + dur + 0.05);
  return o;
}
function noise(ac, nb, T, dur, out) {
  const s = ac.createBufferSource(); s.buffer = nb; s.loop = true;
  s.loopStart = Math.random() * (nb.duration - 0.5);
  s.connect(out); s.start(T, Math.random() * (nb.duration - dur - 0.1 > 0 ? nb.duration - dur - 0.1 : 0)); s.stop(T + dur + 0.05);
  return s;
}
function filt(ac, type, f, q, out) { const b = ac.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q ?? 0.7; b.connect(out); return b; }
function gainNode(ac, v, out) { const g = ac.createGain(); g.gain.value = v; g.connect(out); return g; }

// Cada efeito recebe (ac, out, rev, T, gain, opts). `rev` é o envio para reverberação.
function makeSFX(ac) {
  const white = noiseBuffer(ac, 4), brown = noiseBuffer(ac, 6, 'brown');
  return {
    whoosh(out, rev, T, g, o) {
      const d = o.dur || 0.7;
      const v = gainNode(ac, 0, out); v.connect(rev);
      env(v, T, [[0, 0], [d * 0.6, 0.55 * g], [d, 0]]);
      const bp = filt(ac, 'bandpass', 400, 1.4, v);
      bp.frequency.setValueAtTime(250, T); bp.frequency.exponentialRampToValueAtTime(2800, T + d * 0.6); bp.frequency.exponentialRampToValueAtTime(500, T + d);
      noise(ac, white, T, d, bp);
    },
    swoosh(out, rev, T, g) { this.whoosh(out, rev, T, g * 0.8, { dur: 0.38 }); },
    pop(out, rev, T, g) {
      const v = gainNode(ac, 0, out); v.connect(rev);
      expEnv(v, T, 0.42 * g, 0.004, 0.14);
      const o = osc(ac, 'sine', 900, T, 0.2, v); o.frequency.exponentialRampToValueAtTime(230, T + 0.09);
      const c = gainNode(ac, 0, out); expEnv(c, T, 0.12 * g, 0.001, 0.02);
      noise(ac, white, T, 0.04, filt(ac, 'highpass', 3000, 0.7, c));
    },
    click(out, rev, T, g) {
      const c = gainNode(ac, 0, out); expEnv(c, T, 0.3 * g, 0.001, 0.025);
      noise(ac, white, T, 0.05, filt(ac, 'bandpass', 3500, 2, c));
      const v = gainNode(ac, 0, out); expEnv(v, T, 0.15 * g, 0.001, 0.04);
      osc(ac, 'square', 1800, T, 0.05, filt(ac, 'lowpass', 4000, 0.7, v));
    },
    tick(out, rev, T, g) {
      const c = gainNode(ac, 0, out); expEnv(c, T, 0.16 * g, 0.001, 0.012);
      noise(ac, white, T, 0.03, filt(ac, 'bandpass', 5200, 3, c));
    },
    coin(out, rev, T, g) {
      for (const [dt, base] of [[0, 1], [0.085, 0.94]]) {
        for (const [f, a, d] of [[2093, 0.18, 0.5], [3135, 0.12, 0.35], [4186, 0.08, 0.25], [5274, 0.05, 0.18]]) {
          const v = gainNode(ac, 0, out); v.connect(rev);
          expEnv(v, T + dt, a * g, 0.002, d);
          osc(ac, 'sine', f * base, T + dt, d + 0.05, v);
        }
      }
    },
    cash(out, rev, T, g) {
      const c = gainNode(ac, 0, out); env(c, T, [[0, 0.35 * g], [0.06, 0]]);
      noise(ac, white, T, 0.08, filt(ac, 'bandpass', 1600, 1.5, c));
      for (const [f, a] of [[1568, 0.16], [2349, 0.12], [3136, 0.1], [4699, 0.06], [6272, 0.04]]) {
        const v = gainNode(ac, 0, out); v.connect(rev);
        expEnv(v, T + 0.07, a * g, 0.002, 1.3);
        osc(ac, 'sine', f, T + 0.07, 1.4, v);
      }
    },
    hit(out, rev, T, g) {
      const v = gainNode(ac, 0, out); v.connect(rev);
      expEnv(v, T, 0.7 * g, 0.003, 0.45);
      const o = osc(ac, 'sine', 140, T, 0.5, v); o.frequency.exponentialRampToValueAtTime(45, T + 0.3);
      const n = gainNode(ac, 0, out); expEnv(n, T, 0.3 * g, 0.002, 0.18);
      noise(ac, white, T, 0.2, filt(ac, 'lowpass', 1400, 0.7, n));
    },
    impact(out, rev, T, g) {
      const v = gainNode(ac, 0, out); v.connect(rev);
      expEnv(v, T, 0.95 * g, 0.004, 1.4);
      const o = osc(ac, 'sine', 85, T, 1.5, v); o.frequency.exponentialRampToValueAtTime(30, T + 1.2);
      const n = gainNode(ac, 0, out); n.connect(rev); expEnv(n, T, 0.45 * g, 0.002, 0.6);
      noise(ac, brown, T, 0.7, filt(ac, 'lowpass', 600, 0.7, n));
      const h = gainNode(ac, 0, out); expEnv(h, T, 0.18 * g, 0.001, 0.08);
      noise(ac, white, T, 0.1, filt(ac, 'highpass', 2500, 0.7, h));
    },
    drop(out, rev, T, g) { // queda de valor: tom descendo
      const v = gainNode(ac, 0, out); v.connect(rev);
      expEnv(v, T, 0.3 * g, 0.01, 0.55);
      const o = osc(ac, 'triangle', 700, T, 0.6, filt(ac, 'lowpass', 2500, 0.7, v)); o.frequency.exponentialRampToValueAtTime(110, T + 0.5);
    },
    riser(out, rev, T, g, o) {
      const d = o.dur || 2;
      const v = gainNode(ac, 0, out); v.connect(rev);
      v.gain.setValueAtTime(0.0001, T); v.gain.exponentialRampToValueAtTime(0.35 * g, T + d); v.gain.linearRampToValueAtTime(0, T + d + 0.05);
      const bp = filt(ac, 'bandpass', 300, 2, v);
      bp.frequency.setValueAtTime(250, T); bp.frequency.exponentialRampToValueAtTime(5500, T + d);
      noise(ac, white, T, d + 0.1, bp);
      const s = gainNode(ac, 0.12, v);
      const ob = osc(ac, 'sawtooth', 110, T, d, filt(ac, 'lowpass', 1500, 0.7, s)); ob.frequency.exponentialRampToValueAtTime(440, T + d);
    },
    liquid(out, rev, T, g, o) {
      const d = o.dur || 2;
      const p = gainNode(ac, 0, out); env(p, T, [[0, 0], [0.2, 0.09 * g], [d - 0.2, 0.09 * g], [d, 0]]);
      noise(ac, white, T, d, filt(ac, 'bandpass', 900, 0.8, p));
      let t = T;
      while (t < T + d) {
        const f = 260 + Math.random() * 420;
        const v = gainNode(ac, 0, out); expEnv(v, t, 0.12 * g, 0.003, 0.06);
        const b = osc(ac, 'sine', f, t, 0.08, v); b.frequency.exponentialRampToValueAtTime(f * 1.9, t + 0.05);
        t += 0.05 + Math.random() * 0.11;
      }
    },
    truck(out, rev, T, g, o) {
      const d = o.dur || 3;
      const v = gainNode(ac, 0, out);
      env(v, T, [[0, 0], [d * 0.35, 0.55 * g], [d * 0.7, 0.45 * g], [d, 0]]);
      noise(ac, brown, T, d, filt(ac, 'lowpass', 320, 0.8, v));
      const e = gainNode(ac, 0.22, v);
      const m = osc(ac, 'sawtooth', 52, T, d, filt(ac, 'lowpass', 220, 1, e)); m.frequency.linearRampToValueAtTime(64, T + d * 0.5); m.frequency.linearRampToValueAtTime(48, T + d);
    },
    neon(out, rev, T, g) {
      const v = gainNode(ac, 0, out);
      const pattern = [[0, 1], [0.08, 0], [0.18, 1], [0.24, 0], [0.4, 1], [0.46, 0.2], [0.62, 1], [1.0, 1], [1.6, 0.25], [2.4, 0]];
      v.gain.setValueAtTime(0, T);
      for (const [dt, a] of pattern) v.gain.setValueAtTime(a * 0.14 * g, T + dt);
      const lp = filt(ac, 'lowpass', 1600, 0.7, v);
      osc(ac, 'sawtooth', 100, T, 2.5, lp); osc(ac, 'square', 120, T, 2.5, gainNode(ac, 0.4, lp));
      const c = gainNode(ac, 0, out); expEnv(c, T, 0.3 * g, 0.001, 0.05);
      noise(ac, white, T, 0.06, filt(ac, 'highpass', 2000, 0.7, c));
    },
    sparkle(out, rev, T, g) {
      for (let i = 0; i < 9; i++) {
        const t = T + i * 0.045 + Math.random() * 0.02;
        const v = gainNode(ac, 0, out); v.connect(rev);
        expEnv(v, t, 0.06 * g, 0.002, 0.25);
        osc(ac, 'sine', 2600 + Math.random() * 3600, t, 0.3, v);
      }
    },
  };
}

function impulse(ac, sec, decay) {
  const n = Math.floor(sec * ac.sampleRate);
  const b = ac.createBuffer(1, n, ac.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay);
  return b;
}

// ---------- trilha ----------
// Lá menor, 84 BPM. Seções: introdução, investigação, tensão e final mais claro.
const NOTE = (n) => 440 * Math.pow(2, (n - 69) / 12);
const PROG_MINOR = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]];   // Am F C G
const PROG_TENSE = [[57, 60, 64], [53, 57, 60], [50, 53, 57], [52, 56, 59]];   // Am F Dm E
const PROG_END = [[48, 52, 55], [53, 57, 60], [57, 60, 64], [55, 59, 62]];     // C F Am G

function music(ac, out, total, sections) {
  const beat = 60 / 84, bar = beat * 4;
  const pad = gainNode(ac, 1, out);
  const padLP = filt(ac, 'lowpass', 900, 0.6, pad);
  const delay = ac.createDelay(2); delay.delayTime.value = beat * 0.75;
  const fb = gainNode(ac, 0.33, delay); delay.connect(fb);
  const delayOut = gainNode(ac, 0.45, out); delay.connect(delayOut);
  const white = noiseBuffer(ac, 2);
  const sectionAt = (t) => { let s = sections[0]; for (const x of sections) if (t >= x.t) s = x; return s; };
  for (let b = 0, t = 0; t < total; b++, t = b * bar * 2) {
    const sec = sectionAt(t);
    const progs = sec.prog === 'end' ? PROG_END : sec.prog === 'tense' ? PROG_TENSE : PROG_MINOR;
    const chord = progs[b % 4];
    const len = bar * 2;
    // pad: notas do acorde, duas vozes desafinadas cada
    for (const n of chord) for (const det of [-7, 6]) {
      const v = gainNode(ac, 0, padLP);
      env(v, t, [[0, 0], [1.6, 0.03], [len - 0.4, 0.03], [len + 1.2, 0]]);
      const o = osc(ac, 'sawtooth', NOTE(n), t, len + 1.3, v); o.detune.value = det;
    }
    // baixo pulsante (batida de coração)
    if (sec.pulse) for (let k = 0; k < 8; k++) {
      const tt = t + k * beat;
      if (tt > total) break;
      const v = gainNode(ac, 0, out); expEnv(v, tt, (k % 2 ? 0.07 : 0.13) * sec.pulse, 0.01, 0.5);
      osc(ac, 'sine', NOTE(chord[0] - 24), tt, 0.6, v);
    }
    // arpejo em colcheias
    if (sec.arp) for (let k = 0; k < 16; k++) {
      const tt = t + k * beat / 2;
      if (tt > total) break;
      const n = chord[[0, 1, 2, 1][k % 4]] + 12 + (k % 8 >= 4 ? 12 : 0);
      const v = gainNode(ac, 0, out); v.connect(delay);
      expEnv(v, tt, 0.035 * sec.arp, 0.004, 0.32);
      osc(ac, 'triangle', NOTE(n), tt, 0.4, v);
    }
    // chimbal leve nos contratempos
    if (sec.hats) for (let k = 0; k < 8; k++) {
      const tt = t + k * beat + beat / 2;
      if (tt > total) break;
      const v = gainNode(ac, 0, out); expEnv(v, tt, 0.018 * sec.hats, 0.001, 0.05);
      noise(ac, white, tt, 0.07, filt(ac, 'highpass', 7500, 0.7, v));
    }
  }
}

// Mixagem final. Devolve PCM 16 bits mono (Int16Array) a 48 kHz.
async function renderMix(voiceBuf, events, total, sections) {
  const ac = new OfflineAudioContext(1, Math.ceil(total * SR), SR);
  const master = ac.createDynamicsCompressor();
  master.threshold.value = -6; master.ratio.value = 12; master.attack.value = 0.003; master.release.value = 0.12; master.knee.value = 3;
  const masterGain = gainNode(ac, 0.95, ac.destination); master.connect(masterGain);

  // voz: ganho + compressão leve
  const vc = ac.createDynamicsCompressor();
  vc.threshold.value = -20; vc.ratio.value = 3; vc.attack.value = 0.005; vc.release.value = 0.15;
  const vSrc = ac.createBufferSource(); vSrc.buffer = voiceBuf;
  const vGain = gainNode(ac, 2.1, vc); vSrc.connect(vGain); vc.connect(master);
  vSrc.start(0);

  // reverberação compartilhada
  const conv = ac.createConvolver(); conv.buffer = impulse(ac, 2.4, 3.2);
  const revIn = gainNode(ac, 0.28, conv); conv.connect(master);

  // efeitos
  const sfxBus = gainNode(ac, 0.62, master);
  const SFX = makeSFX(ac);
  for (const [t, name, g = 1, o = {}] of events) {
    if (!SFX[name] || t < 0 || t > total) continue;
    SFX[name](sfxBus, revIn, t, g, o);
  }

  // trilha com "ducking" (abaixa quando a voz fala)
  const musBus = ac.createGain(); musBus.connect(master);
  const ch = voiceBuf.getChannelData(0);
  const hop = 0.05, n = Math.ceil(total / hop), curve = new Float32Array(n);
  let level = 1;
  for (let i = 0; i < n; i++) {
    const a = Math.floor(i * hop * voiceBuf.sampleRate), z = Math.min(ch.length, a + Math.floor(hop * voiceBuf.sampleRate));
    let s = 0; for (let j = a; j < z; j += 4) s += ch[j] * ch[j];
    const rms = z > a ? Math.sqrt(s / ((z - a) / 4)) : 0;
    const target = rms > 0.02 ? 0.5 : 1;
    level += (target - level) * (target < level ? 0.5 : 0.08);
    curve[i] = level * 0.2;
  }
  // entrada e saída suaves
  for (let i = 0; i < n; i++) {
    const t = i * hop;
    curve[i] *= Math.min(1, t / 2.5) * Math.min(1, Math.max(0, (total - t) / 4));
  }
  musBus.gain.setValueCurveAtTime(curve, 0, total - 0.01);
  music(ac, musBus, total, sections);

  const out = await ac.startRendering();
  const d = out.getChannelData(0);
  const pcm = new Int16Array(d.length);
  let peak = 0;
  for (let i = 0; i < d.length; i++) {
    const v = Math.max(-1, Math.min(1, d[i]));
    peak = Math.max(peak, Math.abs(v));
    pcm[i] = v < 0 ? v * 32768 : v * 32767;
  }
  return { pcm, peak, sampleRate: SR };
}
