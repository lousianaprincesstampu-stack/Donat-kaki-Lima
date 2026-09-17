// Web Audio API procedural synthesizer for Indonesian Donut Game sound effects

class SoundManager {
  private ctx: AudioContext | null = null;
  private musicInterval: any = null;
  public isMuted: boolean = false;
  public isMusicPlaying: boolean = false;

  private init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Bell chime when customer arrives (Ting! Khas lonceng gerobak)
  public playBell() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1800, this.ctx.currentTime + 0.08);
    osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.6);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.85);
  }

  // Suara Klakson Motor Pinggir Jalan Khas Indonesia ("Ti-tin!")
  public playMotorHorn() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const playBeep = (timeOffset: number) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, this.ctx.currentTime + timeOffset);
      osc.frequency.setValueAtTime(460, this.ctx.currentTime + timeOffset + 0.04);

      gain.gain.setValueAtTime(0.1, this.ctx.currentTime + timeOffset);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + timeOffset + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + timeOffset);
      osc.stop(this.ctx.currentTime + timeOffset + 0.11);
    };

    playBeep(0);
    playBeep(0.12);
  }

  // Sizzling oil sound when donuts hit hot oil (Khas minyak goreng mendidih)
  public playSizzle() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.15;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2500, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
  }

  // Flip donat in oil
  public playFlip() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
    this.playSizzle();
  }

  // Glaze dip sound (Slosh kental kuah gula merah / lelehan coklat)
  public playGlaze() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(160, this.ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  // Sprinkling seres warna-warni or chopped peanuts
  public playSprinkle() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    // Fast high pitch clicks
    for (let i = 0; i < 3; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1600 + Math.random() * 800, this.ctx.currentTime + i * 0.03);

      gain.gain.setValueAtTime(0.1, this.ctx.currentTime + i * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.03 + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + i * 0.03);
      osc.stop(this.ctx.currentTime + i * 0.03 + 0.05);
    }
  }

  // Dough molding & cutter stamp (Cetak adonan)
  public playStamp() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  // Cash / Tip sound (Klining koin uang rupiah!)
  public playCash() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [987.77, 1318.51, 1975.53];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + idx * 0.08);
      osc.stop(this.ctx.currentTime + idx * 0.08 + 0.35);
    });
  }

  // Customer happy reaction cheer
  public playSuccess() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const melody = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    melody.forEach((pitch, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, this.ctx.currentTime + i * 0.09);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime + i * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.09 + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + i * 0.09);
      osc.stop(this.ctx.currentTime + i * 0.09 + 0.3);
    });
  }

  // Background Lo-Fi Pentatonic / Angklung-like melody for warm Indonesian street vibe
  public toggleMusic(start?: boolean) {
    if (start === undefined) {
      this.isMusicPlaying = !this.isMusicPlaying;
    } else {
      this.isMusicPlaying = start;
    }

    if (!this.isMusicPlaying) {
      if (this.musicInterval) {
        clearInterval(this.musicInterval);
        this.musicInterval = null;
      }
      return;
    }

    this.init();
    if (!this.ctx) return;

    // Pentatonic scale frequencies: Slendro/Pelog inspired warm tones
    const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
    const bass = [130.81, 146.83, 164.81, 196.00];
    let step = 0;

    if (this.musicInterval) clearInterval(this.musicInterval);

    this.musicInterval = setInterval(() => {
      if (!this.isMusicPlaying || this.isMuted || !this.ctx) return;

      const time = this.ctx.currentTime;
      // Melody note
      if (step % 2 === 0 || Math.random() > 0.3) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        const note = scale[Math.floor(Math.random() * scale.length)];
        osc.frequency.setValueAtTime(note, time);

        gain.gain.setValueAtTime(0.04, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + 0.5);
      }

      // Bass note every 4 steps
      if (step % 4 === 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'sine';
        const bNote = bass[(step / 4) % bass.length];
        bassOsc.frequency.setValueAtTime(bNote, time);

        bassGain.gain.setValueAtTime(0.05, time);
        bassGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.8);

        bassOsc.connect(bassGain);
        bassGain.connect(this.ctx.destination);

        bassOsc.start(time);
        bassOsc.stop(time + 0.85);
      }

      step = (step + 1) % 16;
    }, 450);
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
      this.isMusicPlaying = false;
    }
  }
}

export const sound = new SoundManager();
