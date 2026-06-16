// Web Audio API sound effects for case opening

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function playClick(ac: AudioContext, time: number, vol = 0.18) {
  const buf = ac.createBuffer(1, ac.sampleRate * 0.03, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    // Sharp transient that decays quickly — slot-machine tick
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ac.sampleRate * 0.004));
  }
  const src = ac.createBufferSource();
  src.buffer = buf;

  const gain = ac.createGain();
  gain.gain.value = vol;

  // High-pass filter to give it a crisp click feel
  const hpf = ac.createBiquadFilter();
  hpf.type = 'highpass';
  hpf.frequency.value = 1200;

  src.connect(hpf);
  hpf.connect(gain);
  gain.connect(ac.destination);
  src.start(time);
}

/**
 * Plays a series of ticks that start fast and slow to a stop,
 * matching the cubic-bezier easing of the reel animation.
 * @param dur  Spin duration in seconds (matches CSS transition)
 */
export function playSpinSound(dur: number) {
  try {
    const ac = getCtx();
    const now = ac.currentTime;

    // Schedule clicks: dense at start, sparse at end.
    // We model the easing: speed peaks early (~0.15s) then decelerates.
    const ticks: number[] = [];
    let t = 0;
    let interval = 0.025; // start at 40 ticks/sec

    while (t < dur) {
      ticks.push(t);
      // Interval grows as a function of how far through the animation we are
      const progress = t / dur;
      // Ease-out curve: interval expands faster near the end
      interval = 0.025 + progress * progress * 0.55;
      t += interval;
    }

    ticks.forEach((tick, i) => {
      // Fade volume up quickly, then hold, then fade out near end
      const progress = tick / dur;
      const vol = progress < 0.05
        ? progress / 0.05 * 0.22          // fade in
        : progress > 0.85
          ? (1 - (progress - 0.85) / 0.15) * 0.22  // fade out
          : 0.22;
      playClick(ac, now + tick, vol);
    });
  } catch {}
}

/** Plays a short satisfying chime when the item is revealed */
export function playRevealSound() {
  try {
    const ac = getCtx();
    const now = ac.currentTime;

    // Two-tone ascending chime
    const notes = [880, 1108]; // A5, C#6
    notes.forEach((freq, i) => {
      const osc = ac.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const gain = ac.createGain();
      const start = now + i * 0.12;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.18, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.6);

      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(start);
      osc.stop(start + 0.65);
    });
  } catch {}
}
