/**
 * Synthesizes audio alerts and alarms using the browser Web Audio API
 */

class AudioSynthesizer {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playAlarmSound(preset: 'classic' | 'digital' | 'chime' | 'marimba' = 'classic') {
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    if (preset === 'classic') {
      // Classic Alarm Beep-Beep-Beep
      for (let i = 0; i < 4; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, now + i * 0.25); // A5
        gain.gain.setValueAtTime(0.3, now + i * 0.25);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.25 + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.25);
        osc.stop(now + i * 0.25 + 0.15);
      }
    } else if (preset === 'chime') {
      // Gentle chime chords
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      freqs.forEach((f, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.12);
        gain.gain.setValueAtTime(0.4, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 1.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 1.2);
      });
    } else if (preset === 'digital') {
      // High pitch digital pulse
      for (let i = 0; i < 3; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1200, now + i * 0.18);
        gain.gain.setValueAtTime(0.2, now + i * 0.18);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.18 + 0.1);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.18);
        osc.stop(now + i * 0.18 + 0.1);
      }
    } else {
      // Marimba / Bell pattern
      const freqs = [440, 554.37, 659.25];
      freqs.forEach((f, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + idx * 0.15);
        gain.gain.setValueAtTime(0.5, now + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.6);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.15);
        osc.stop(now + idx * 0.15 + 0.6);
      });
    }
  }

  playClick() {
    this.initCtx();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.03);
  }
}

export const audioSynth = new AudioSynthesizer();
