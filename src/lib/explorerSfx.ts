/** Gentle synthesized sound effects shared by More to Explore and Wudu & Salah. */
export type Sfx = "water" | "click" | "chime" | "bell" | "pop" | "buzz" | "rustle" | "clink" | "door" | "warm" | "coin" | "yay";
let ctx: AudioContext | null = null;
export function sfx(kind: Sfx) {
  try {
    ctx ??= new AudioContext();
    const c = ctx; const t = c.currentTime;
    const tone = (f: number, d: number, type: OscillatorType = "sine", v = 0.12, at = 0, f2?: number) => {
      const o = c.createOscillator(); const g = c.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t + at); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + at + d);
      g.gain.setValueAtTime(0.0001, t + at); g.gain.exponentialRampToValueAtTime(v, t + at + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + at + d);
      o.connect(g).connect(c.destination); o.start(t + at); o.stop(t + at + d + 0.05);
    };
    const noise = (d: number, freq: number, v = 0.15) => {
      const b = c.createBuffer(1, c.sampleRate * d, c.sampleRate); const ch = b.getChannelData(0);
      for (let i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / ch.length);
      const s = c.createBufferSource(); s.buffer = b; const f = c.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = freq; const g = c.createGain(); g.gain.value = v;
      s.connect(f).connect(g).connect(c.destination); s.start();
    };
    ({
      water: () => { noise(1.2, 900, 0.2); tone(600, 0.15, "sine", 0.05, 0.1, 900); tone(700, 0.15, "sine", 0.05, 0.4, 1000); },
      click: () => tone(1400, 0.05, "triangle", 0.1),
      chime: () => { tone(880, 1.2, "sine", 0.08); tone(1320, 1.2, "sine", 0.05, 0.15); tone(1760, 1.4, "sine", 0.04, 0.3); },
      bell: () => { tone(660, 1.6, "sine", 0.1); tone(990, 1.4, "sine", 0.05, 0.02); },
      pop: () => tone(500, 0.12, "sine", 0.12, 0, 900),
      buzz: () => tone(180, 0.8, "sawtooth", 0.03, 0, 220),
      rustle: () => noise(0.6, 3000, 0.1),
      clink: () => { tone(2200, 0.15, "triangle", 0.06); tone(2600, 0.15, "triangle", 0.05, 0.12); },
      door: () => { tone(120, 0.25, "square", 0.04, 0, 90); },
      warm: () => { tone(392, 0.5, "sine", 0.08); tone(523, 0.6, "sine", 0.07, 0.15); },
      coin: () => { tone(1320, 0.1, "square", 0.04); tone(1760, 0.2, "square", 0.04, 0.08); },
      yay: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.3, "triangle", 0.08, i * 0.11)); },
    } as Record<Sfx, () => void>)[kind]();
  } catch { /* audio unavailable */ }
}
