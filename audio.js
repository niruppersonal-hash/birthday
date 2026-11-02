/**
 * Audio Engine for Birthday Celebration
 * Supports:
 * 1. Local imported audio for "I Wanna Be Yours" (MP3, WAV, etc.) with IndexedDB caching
 * 2. Auto-detection of assets/audio/i-wanna-be-yours.mp3
 * 3. Built-in Web Audio API Synthesizer playing the iconic "I Wanna Be Yours" melody & chords
 * 4. Interactive sound effects (arrow whoosh, heart hit, cake bounce, candle blow, balloon pop, cheers)
 */

class BirthdayAudioEngine {
  constructor() {
    this.ctx = null;
    this.soundEnabled = true;
    this.musicEnabled = false;
    this.isPlayingMusic = false;
    this.synthMusicTimeout = null;
    this.currentChordIndex = 0;
    this.volume = 0.75;

    // HTML5 Audio element for imported / local MP3 files
    this.bgAudio = new Audio();
    this.bgAudio.loop = true;
    this.bgAudio.volume = this.volume;
    this.hasCustomAudioFile = false;
    this.customAudioSource = null;

    // "I Wanna Be Yours" chord progression in C Minor:
    // Cm (C, Eb, G) -> Ab (Ab, C, Eb) -> Fm (F, Ab, C) -> Gm (G, Bb, D)
    this.wannaBeYoursProgression = [
      {
        chord: 'Cm',
        bass: 130.81, // C3
        notes: [261.63, 311.13, 392.00, 523.25], // C4, Eb4, G4, C5
        melody: [311.13, 293.66, 261.63, 311.13], // Eb4, D4, C4, Eb4
        dur: 2.8
      },
      {
        chord: 'Ab',
        bass: 103.83, // Ab2
        notes: [207.65, 261.63, 311.13, 415.30], // Ab3, C4, Eb4, Ab4
        melody: [293.66, 261.63, 207.65, 261.63], // D4, C4, Ab3, C4
        dur: 2.8
      },
      {
        chord: 'Fm',
        bass: 87.31, // F2
        notes: [174.61, 207.65, 261.63, 349.23], // F3, Ab3, C4, F4
        melody: [261.63, 207.65, 174.61, 261.63], // C4, Ab3, F3, C4
        dur: 2.8
      },
      {
        chord: 'Gm',
        bass: 98.00, // G2
        notes: [196.00, 233.08, 293.66, 392.00], // G3, Bb3, D4, G4
        melody: [293.66, 261.63, 293.66, 311.13], // D4, C4, D4, Eb4
        dur: 2.8
      }
    ];

    this.initLocalAudioDetection();
    this.initIndexedDBCache();
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Check if a local file exists in assets/audio
  async initLocalAudioDetection() {
    const defaultPaths = [
      'assets/audio/i-wanna-be-yours.mp3',
      'assets/audio/song.mp3'
    ];

    for (const path of defaultPaths) {
      try {
        const res = await fetch(path, { method: 'HEAD' });
        if (res.ok) {
          this.setAudioSource(path, 'I Wanna Be Yours (Local File)');
          return;
        }
      } catch (e) {}
    }
  }

  // IndexedDB caching for user uploaded audio
  initIndexedDBCache() {
    if (!window.indexedDB) return;
    const req = indexedDB.open('MadhuluBirthdayDB', 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('audioStore')) {
        db.createObjectStore('audioStore');
      }
    };
    req.onsuccess = (e) => {
      const db = e.target.result;
      const tx = db.transaction('audioStore', 'readonly');
      const store = tx.objectStore('audioStore');
      const getReq = store.get('bg_song');
      getReq.onsuccess = () => {
        if (getReq.result && getReq.result.blob) {
          const url = URL.createObjectURL(getReq.result.blob);
          this.setAudioSource(url, getReq.result.name || 'I Wanna Be Yours (Saved)');
        }
      };
    };
  }

  saveAudioToIndexedDB(file) {
    if (!window.indexedDB) return;
    const req = indexedDB.open('MadhuluBirthdayDB', 1);
    req.onsuccess = (e) => {
      const db = e.target.result;
      const tx = db.transaction('audioStore', 'readwrite');
      const store = tx.objectStore('audioStore');
      store.put({ blob: file, name: file.name }, 'bg_song');
    };
  }

  // Load a local audio file provided by user input
  loadUserAudioFile(file) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    this.saveAudioToIndexedDB(file);
    this.setAudioSource(url, file.name);
    this.playMusic();
  }

  setAudioSource(url, displayName = 'I Wanna Be Yours') {
    this.bgAudio.src = url;
    this.hasCustomAudioFile = true;
    this.customAudioSource = displayName;

    // Dispatch custom event to notify UI
    window.dispatchEvent(new CustomEvent('bgSongChanged', {
      detail: { title: displayName, isCustom: true }
    }));
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    this.bgAudio.volume = this.volume;
  }

  // Start playing music
  playMusic() {
    this.initContext();
    this.musicEnabled = true;
    this.isPlayingMusic = true;

    if (this.hasCustomAudioFile) {
      // Stop synth loop if running
      if (this.synthMusicTimeout) {
        clearTimeout(this.synthMusicTimeout);
        this.synthMusicTimeout = null;
      }
      this.bgAudio.play().catch(e => {
        console.warn('Playback requires user gesture', e);
      });
    } else {
      // Play synthesized "I Wanna Be Yours" backing track
      this.currentChordIndex = 0;
      this.playNextWannaBeYoursChord();
    }

    window.dispatchEvent(new CustomEvent('bgPlayStateChanged', { detail: { isPlaying: true } }));
    return true;
  }

  pauseMusic() {
    this.musicEnabled = false;
    this.isPlayingMusic = false;

    if (this.hasCustomAudioFile) {
      this.bgAudio.pause();
    }

    if (this.synthMusicTimeout) {
      clearTimeout(this.synthMusicTimeout);
      this.synthMusicTimeout = null;
    }

    window.dispatchEvent(new CustomEvent('bgPlayStateChanged', { detail: { isPlaying: false } }));
    return false;
  }

  toggleMusic() {
    if (this.isPlayingMusic) {
      return this.pauseMusic();
    } else {
      return this.playMusic();
    }
  }

  // Synthesizes the moody, warm lo-fi chords of "I Wanna Be Yours"
  playNextWannaBeYoursChord() {
    if (!this.musicEnabled || !this.isPlayingMusic || this.hasCustomAudioFile) return;
    this.initContext();
    if (!this.ctx) return;

    const chordData = this.wannaBeYoursProgression[this.currentChordIndex];
    if (!chordData) {
      this.currentChordIndex = 0;
      this.synthMusicTimeout = setTimeout(() => this.playNextWannaBeYoursChord(), 400);
      return;
    }

    const t = this.ctx.currentTime;
    const dur = chordData.dur;

    // 1. Warm Analog Sub Bass
    const bassOsc = this.ctx.createOscillator();
    const bassGain = this.ctx.createGain();
    const bassFilter = this.ctx.createBiquadFilter();

    bassOsc.type = 'triangle';
    bassOsc.frequency.setValueAtTime(chordData.bass, t);
    bassFilter.type = 'lowpass';
    bassFilter.frequency.setValueAtTime(280, t);

    bassGain.gain.setValueAtTime(0.01, t);
    bassGain.gain.linearRampToValueAtTime(0.25 * this.volume, t + 0.15);
    bassGain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    bassOsc.connect(bassFilter);
    bassFilter.connect(bassGain);
    bassGain.connect(this.ctx.destination);

    bassOsc.start(t);
    bassOsc.stop(t + dur);

    // 2. Dreamy Electric Guitar / Rhodes Chords with slight tremolo
    chordData.notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq * 1.5, t);
      filter.Q.setValueAtTime(1.5, t);

      const noteOffset = idx * 0.08;
      gain.gain.setValueAtTime(0.001, t + noteOffset);
      gain.gain.linearRampToValueAtTime(0.08 * this.volume, t + noteOffset + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + noteOffset + dur * 0.9);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + noteOffset);
      osc.stop(t + noteOffset + dur);
    });

    // 3. Delicate "I Wanna Be Yours" Vocal Melody Chimes
    chordData.melody.forEach((melFreq, mIdx) => {
      const melTime = t + mIdx * (dur / chordData.melody.length);
      const melOsc = this.ctx.createOscillator();
      const melGain = this.ctx.createGain();

      melOsc.type = 'triangle';
      melOsc.frequency.setValueAtTime(melFreq, melTime);

      melGain.gain.setValueAtTime(0.001, melTime);
      melGain.gain.linearRampToValueAtTime(0.09 * this.volume, melTime + 0.04);
      melGain.gain.exponentialRampToValueAtTime(0.001, melTime + 0.65);

      melOsc.connect(melGain);
      melGain.connect(this.ctx.destination);

      melOsc.start(melTime);
      melOsc.stop(melTime + 0.7);
    });

    this.currentChordIndex = (this.currentChordIndex + 1) % this.wannaBeYoursProgression.length;
    this.synthMusicTimeout = setTimeout(() => this.playNextWannaBeYoursChord(), dur * 1000);
  }

  // ================= SFX =================
  playArrowWhoosh() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    filter.type = 'lowpass';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(160, t + 0.45);
    filter.frequency.setValueAtTime(1400, t);
    filter.frequency.exponentialRampToValueAtTime(300, t + 0.45);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.2 * this.volume, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.45);
  }

  playHeartHit() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const chord = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    chord.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.04);
      gain.gain.setValueAtTime(0.18 * this.volume, t + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.04 + 1.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + idx * 0.04);
      osc.stop(t + idx * 0.04 + 1.2);
    });

    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(140, t);
    sub.frequency.exponentialRampToValueAtTime(45, t + 0.5);
    subGain.gain.setValueAtTime(0.35 * this.volume, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    sub.connect(subGain);
    subGain.connect(this.ctx.destination);
    sub.start(t);
    sub.stop(t + 0.5);
  }

  playCakeLayer(tierNumber = 1) {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const baseFreqs = [220, 293.66, 369.99, 440, 587.33];
    const freq = baseFreqs[Math.min(tierNumber - 1, baseFreqs.length - 1)];

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.92, t + 0.3);
    gain.gain.setValueAtTime(0.25 * this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.35);
  }

  playCandleBlow() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.5;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, t);
    filter.Q.setValueAtTime(2, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.01, t);
    noiseGain.gain.linearRampToValueAtTime(0.2 * this.volume, t + 0.15);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    whiteNoise.start(t);
    whiteNoise.stop(t + 0.5);

    setTimeout(() => {
      this.playSparkle();
    }, 200);
  }

  playBalloonPop() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.12);

    gain.gain.setValueAtTime(0.35 * this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.14);

    const bell = this.ctx.createOscillator();
    const bGain = this.ctx.createGain();
    bell.type = 'sine';
    bell.frequency.setValueAtTime(880 + Math.random() * 400, t + 0.02);
    bGain.gain.setValueAtTime(0.12 * this.volume, t + 0.02);
    bGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    bell.connect(bGain);
    bGain.connect(this.ctx.destination);

    bell.start(t + 0.02);
    bell.stop(t + 0.5);
  }

  playSparkle() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [587.33, 739.99, 880.00, 1174.66, 1479.98];
    const t = this.ctx.currentTime;

    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + i * 0.06);

      gain.gain.setValueAtTime(0.1 * this.volume, t + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + i * 0.06);
      osc.stop(t + i * 0.06 + 0.45);
    });
  }

  playFanfare() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const chords = [
      { tOffset: 0.0, freqs: [523.25, 659.25, 783.99], dur: 0.25 },
      { tOffset: 0.25, freqs: [587.33, 739.99, 880.00], dur: 0.25 },
      { tOffset: 0.50, freqs: [659.25, 830.61, 987.77], dur: 0.35 },
      { tOffset: 0.85, freqs: [523.25, 659.25, 783.99, 1046.50], dur: 1.5 }
    ];

    chords.forEach(c => {
      c.freqs.forEach(f => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, t + c.tOffset);
        gain.gain.setValueAtTime(0.12 * this.volume, t + c.tOffset);
        gain.gain.exponentialRampToValueAtTime(0.001, t + c.tOffset + c.dur);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + c.tOffset);
        osc.stop(t + c.tOffset + c.dur);
      });
    });
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    return this.soundEnabled;
  }
}

// Global audio singleton
window.birthdayAudio = new BirthdayAudioEngine();
