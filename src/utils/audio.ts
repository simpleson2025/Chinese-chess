/**
 * High-fidelity synthesized audio effects for Xiangqi using Web Audio API
 * Accurately mimics physical Chinese wooden chess pieces and board resonance.
 */

class SoundEffects {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // Lazy init on first user interaction
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Sound of normal piece move (走子/落子):
   * Crisp, light, single snappy wooden click on the board ("啪/嗒").
   * Characterized by a high attack transient, rapid decay, and light wood timbre.
   */
  public playMove() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // 1. Wood tone oscillator (high pitch dropping rapidly)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.045);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.055);

      // 2. High-frequency click transient (very short snap, 12ms)
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.012);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(1800, now);
      noiseFilter.Q.setValueAtTime(2.5, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.55, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.012);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noise.start(now);
    } catch {
      // AudioContext failed silently
    }
  }

  /**
   * Sound of capturing an opponent piece (吃子):
   * Dramatic, heavy DOUBLE impact with a deep wooden chamber slam ("砰·啪！").
   * Highly distinct from a regular move: heavier bass punch, double-strike transient, and wood resonance tail.
   */
  public playCapture() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // --- Transient 1: First strike (pieces colliding, t = 0) ---
      const strikeOsc = this.ctx.createOscillator();
      const strikeGain = this.ctx.createGain();
      strikeOsc.type = 'triangle';
      strikeOsc.frequency.setValueAtTime(750, now);
      strikeOsc.frequency.exponentialRampToValueAtTime(280, now + 0.04);
      strikeGain.gain.setValueAtTime(0.5, now);
      strikeGain.gain.exponentialRampToValueAtTime(0.01, now + 0.045);
      strikeOsc.connect(strikeGain);
      strikeGain.connect(this.ctx.destination);
      strikeOsc.start(now);
      strikeOsc.stop(now + 0.05);

      // --- Transient 2: Second heavy impact (slamming onto the thick wooden board, t = +24ms) ---
      const t2 = now + 0.024;
      const thudOsc = this.ctx.createOscillator();
      const thudGain = this.ctx.createGain();
      thudOsc.type = 'sine';
      thudOsc.frequency.setValueAtTime(280, t2);
      thudOsc.frequency.exponentialRampToValueAtTime(48, t2 + 0.16);
      thudGain.gain.setValueAtTime(0.85, t2);
      thudGain.gain.exponentialRampToValueAtTime(0.001, t2 + 0.18);
      thudOsc.connect(thudGain);
      thudGain.connect(this.ctx.destination);
      thudOsc.start(t2);
      thudOsc.stop(t2 + 0.19);

      // --- Heavy sub-bass body punch (gives solid weight to the capture) ---
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'triangle';
      subOsc.frequency.setValueAtTime(110, t2);
      subOsc.frequency.exponentialRampToValueAtTime(35, t2 + 0.14);
      subGain.gain.setValueAtTime(0.7, t2);
      subGain.gain.exponentialRampToValueAtTime(0.001, t2 + 0.15);
      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);
      subOsc.start(t2);
      subOsc.stop(t2 + 0.16);

      // --- Crunchy wood impact noise ---
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.05);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(1600, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.65, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.005, now + 0.06);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noise.start(now);
    } catch {
      // AudioContext failed silently
    }
  }

  /**
   * Check alarm: "将军!" - distinct alert double chime
   */
  public playCheck() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      [0, 0.085].forEach((delay, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        const freq = idx === 0 ? 587.33 : 880; // D5 -> A5
        osc.frequency.setValueAtTime(freq, now + delay);
        gain.gain.setValueAtTime(0.4, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.32);
      });
    } catch {
      // AudioContext failed silently
    }
  }

  /**
   * Victory / Checkmate: Triumphant oriental pentatonic fanfare
   */
  public playVictory() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // Pentatonic notes: C5, D5, E5, G5, A5, C6
      const notes = [523.25, 587.33, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        const start = now + idx * 0.11;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.35, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(start);
        osc.stop(start + 0.5);
      });
    } catch {
      // AudioContext failed silently
    }
  }
}

export const sounds = new SoundEffects();
