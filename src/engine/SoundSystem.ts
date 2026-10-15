/**
 * Authentic Retro 8-bit / AdLib FM Sound Synthesizer using Web Audio API.
 * Emulates the 1991 PC Speaker and AdLib sound card effects and low-key chiptune background music.
 */

class SoundSystem {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private isMuted: boolean = false;
  private musicPlaying: boolean = false;
  private musicInterval: number | null = null;
  private currentTrack: 'level' | 'cave' | 'boss' | null = null;
  private noteIndex: number = 0;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      // Low volume background music as requested: "musica de fondo baja (no es lo que centra la atencion)"
      this.musicGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // --- Retro Sound Effects ---

  // Jump "Boing"
  public playJump() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(460, now + 0.14);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  // Club Swing Whoosh
  public playSwing() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    // White noise swoosh
    const bufferSize = this.ctx.sampleRate * 0.12;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.linearRampToValueAtTime(250, now + 0.12);
    filter.Q.setValueAtTime(3, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
  }

  // Club Hit / Enemy Hit (Heavy impact crunch)
  public playHit() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;

    // Deep square punch
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);

    oscGain.gain.setValueAtTime(0.8, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.15);

    // Noise snap
    const bufferSize = this.ctx.sampleRate * 0.08;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.6, now);
    nGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    noise.connect(nGain);
    nGain.connect(this.sfxGain);
    noise.start(now);
  }

  // Food pickup (Retro arpeggio chime)
  public playFoodPickup() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + index * 0.04);
      gain.gain.setValueAtTime(0.3, now + index * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.01, now + index * 0.04 + 0.09);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + index * 0.04);
      osc.stop(now + index * 0.04 + 0.09);
    });
  }

  // Dizzy stars tweeting birds (Sam stunned when falling from great height)
  public playDizzyTweet() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1600, now);
    osc.frequency.linearRampToValueAtTime(2200, now + 0.08);
    osc.frequency.linearRampToValueAtTime(1800, now + 0.16);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  // Falling scream / Sam hurt groan
  public playHurt() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.35);

    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.38);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.38);
  }

  // Secret wall crumble
  public playSecretWallSmash() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.35;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.75, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(now);
  }

  // Boss Roar / Stomp
  public playBossRoar() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(85, now);
    osc.frequency.linearRampToValueAtTime(160, now + 0.15);
    osc.frequency.linearRampToValueAtTime(55, now + 0.5);

    gain.gain.setValueAtTime(0.75, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.55);
  }

  // Level Victory Fanfare
  public playVictory() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const notes = [
      { f: 523.25, d: 0.15, t: 0.00 }, // C5
      { f: 659.25, d: 0.15, t: 0.16 }, // E5
      { f: 783.99, d: 0.15, t: 0.32 }, // G5
      { f: 1046.5, d: 0.40, t: 0.48 }  // C6
    ];

    notes.forEach(n => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(n.f, now + n.t);
      gain.gain.setValueAtTime(0.4, now + n.t);
      gain.gain.exponentialRampToValueAtTime(0.01, now + n.t + n.d);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + n.t);
      osc.stop(now + n.t + n.d);
    });
  }

  // --- Background Chiptune Music (Subtle, Looping) ---

  public startMusic(track: 'level' | 'cave' | 'boss') {
    this.initContext();
    if (this.musicPlaying && this.currentTrack === track) return;
    this.stopMusic();

    this.currentTrack = track;
    this.musicPlaying = true;
    this.noteIndex = 0;

    // Bassline and melody patterns (in Hz)
    const levelBass = [130.81, 130.81, 164.81, 196.00, 174.61, 164.81, 146.83, 130.81]; // C3, C3, E3, G3, F3, E3, D3, C3
    const levelMelody = [261.63, 329.63, 392.00, 329.63, 440.00, 392.00, 349.23, 329.63];

    const caveBass = [98.00, 98.00, 116.54, 116.54, 98.00, 98.00, 130.81, 123.47];
    const caveMelody = [196.00, 233.08, 196.00, 261.63, 246.94, 233.08, 196.00, 220.00];

    const bossBass = [87.31, 87.31, 110.00, 87.31, 116.54, 110.00, 98.00, 87.31];
    const bossMelody = [174.61, 220.00, 233.08, 220.00, 261.63, 246.94, 220.00, 196.00];

    let bassPattern = levelBass;
    let melPattern = levelMelody;
    let tempoMs = 210;

    if (track === 'cave') {
      bassPattern = caveBass;
      melPattern = caveMelody;
      tempoMs = 260;
    } else if (track === 'boss') {
      bassPattern = bossBass;
      melPattern = bossMelody;
      tempoMs = 170;
    }

    this.musicInterval = window.setInterval(() => {
      if (this.isMuted || !this.ctx || !this.musicGain) return;

      const now = this.ctx.currentTime;
      const bFreq = bassPattern[this.noteIndex % bassPattern.length];
      const mFreq = melPattern[this.noteIndex % melPattern.length];

      // Bass note (triangle wave for warmth)
      const bOsc = this.ctx.createOscillator();
      const bGain = this.ctx.createGain();
      bOsc.type = 'triangle';
      bOsc.frequency.setValueAtTime(bFreq, now);
      bGain.gain.setValueAtTime(0.2, now);
      bGain.gain.exponentialRampToValueAtTime(0.01, now + (tempoMs / 1000) * 0.85);

      bOsc.connect(bGain);
      bGain.connect(this.musicGain);
      bOsc.start(now);
      bOsc.stop(now + (tempoMs / 1000) * 0.9);

      // Melody note (square wave with low duty-feel)
      if (this.noteIndex % 2 === 0) {
        const mOsc = this.ctx.createOscillator();
        const mGain = this.ctx.createGain();
        mOsc.type = 'square';
        mOsc.frequency.setValueAtTime(mFreq, now);
        mGain.gain.setValueAtTime(0.07, now);
        mGain.gain.exponentialRampToValueAtTime(0.005, now + (tempoMs / 1000) * 0.7);

        mOsc.connect(mGain);
        mGain.connect(this.musicGain);
        mOsc.start(now);
        mOsc.stop(now + (tempoMs / 1000) * 0.75);
      }

      this.noteIndex++;
    }, tempoMs);
  }

  public stopMusic() {
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.musicPlaying = false;
    this.currentTrack = null;
  }
}

export const soundSystem = new SoundSystem();
