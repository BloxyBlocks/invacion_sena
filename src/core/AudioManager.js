import { FOOTSTEP_SOUND, MUSIC_TRACKS } from "./AssetManifest.js";

const STORAGE_KEY = "invacion-sena:muted";
const MUSIC_KEYS = Object.values(MUSIC_TRACKS);
const MUSIC_FADE_SECONDS = 0.8;
const FOOTSTEP_GAIN = 2;
const FOOTSTEP_START_OFFSET = 0.2;

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.music = null;
    this.sfx = null;
    this.assets = null;
    this.unlocked = false;
    this.unlocking = null;
    this.unavailable = false;
    this.masterVolume = 0.8;
    this.musicVolume = 0.5;
    this.sfxVolume = 0.9;
    this.muted = false;

    this.musicNodes = new Map();
    this.currentMusicKey = null;
    this.desiredMusicKey = null;
    this.musicPauseTimers = new Map();
    this.footstepNode = null;
    this.footstepWanted = false;

    try {
      this.muted = window.localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      this.muted = false;
    }
  }

  setAssets(assets) {
    this.assets = assets;
    if (this.ctx) {
      this.attachAudioGraph();
    }
  }

  async unlock() {
    if (this.unavailable) {
      return false;
    }

    if (this.unlocked) {
      if (this.ctx?.state === "suspended") {
        try {
          await this.ctx.resume();
        } catch {
          return false;
        }
      }
      this.startDesiredMusic();
      if (this.footstepWanted) {
        this.startFootsteps();
      }
      return true;
    }

    if (this.unlocking) {
      return this.unlocking;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      this.unavailable = true;
      return false;
    }

    this.unlocking = (async () => {
      try {
        this.ctx = new AudioContextClass();
        this.master = this.ctx.createGain();
        this.music = this.ctx.createGain();
        this.sfx = this.ctx.createGain();

        this.music.connect(this.master);
        this.sfx.connect(this.master);
        this.master.connect(this.ctx.destination);
        this.applyVolumes();

        if (this.ctx.state === "suspended") {
          await this.ctx.resume();
        }

        this.unlocked = true;
        this.attachAudioGraph();
        this.startDesiredMusic();
        if (this.footstepWanted) {
          this.startFootsteps();
        }
        return true;
      } catch {
        this.unavailable = true;
        return false;
      } finally {
        this.unlocking = null;
      }
    })();

    return this.unlocking;
  }

  /**
   * Conecta los elementos de audio cargados por `AssetLoader` al grafo Web Audio.
   * Cada pista musical tiene su propio gain para hacer fundidos cruzados; el
   * efecto de caminata se amplifica porque el archivo original es muy bajo.
   */
  attachAudioGraph() {
    if (!this.ctx || !this.assets || !this.music || !this.sfx) {
      return;
    }

    for (const key of MUSIC_KEYS) {
      if (this.musicNodes.has(key)) {
        continue;
      }

      const element = this.assets.getAudio(key);
      if (!element) {
        continue;
      }

      try {
        const source = this.ctx.createMediaElementSource(element);
        const gain = this.ctx.createGain();
        gain.gain.value = 0;
        source.connect(gain);
        gain.connect(this.music);
        element.loop = true;
        element.volume = 1;
        this.musicNodes.set(key, { element, source, gain });
      } catch (error) {
        console.error(`[AudioManager] No se pudo conectar la música "${key}".`, error);
      }
    }

    if (!this.footstepNode) {
      const element = this.assets.getAudio(FOOTSTEP_SOUND);
      if (element) {
        try {
          const source = this.ctx.createMediaElementSource(element);
          const gain = this.ctx.createGain();
          gain.gain.value = FOOTSTEP_GAIN;
          source.connect(gain);
          gain.connect(this.sfx);
          element.loop = true;
          element.volume = 1;
          this.footstepNode = { element, source, gain };
        } catch (error) {
          console.error("[AudioManager] No se pudo conectar el sonido de caminata.", error);
        }
      }
    }
  }

  applyVolumes() {
    if (!this.master || !this.music || !this.sfx) {
      return;
    }

    this.master.gain.value = this.muted ? 0 : this.masterVolume;
    this.music.gain.value = this.musicVolume;
    this.sfx.gain.value = this.sfxVolume;
  }

  isMuted() {
    return this.muted;
  }

  toggleMuted() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  setMuted(value) {
    this.muted = Boolean(value);
    this.applyVolumes();

    try {
      window.localStorage.setItem(STORAGE_KEY, this.muted ? "1" : "0");
    } catch {
      // El almacenamiento local es opcional.
    }
  }

  setMasterVolume(value) {
    this.masterVolume = Math.max(0, Math.min(1, value));
    this.applyVolumes();
  }

  setMusicVolume(value) {
    this.musicVolume = Math.max(0, Math.min(1, value));
    this.applyVolumes();
  }

  setSfxVolume(value) {
    this.sfxVolume = Math.max(0, Math.min(1, value));
    this.applyVolumes();
  }

  /**
   * Pide una pista musical por clave. Si el navegador todavía no permite audio,
   * la pista queda pendiente y se inicia en el primer gesto del usuario.
   */
  playMusic(key, { fadeSeconds = MUSIC_FADE_SECONDS } = {}) {
    if (!key) {
      this.stopMusic({ fadeSeconds });
      return;
    }

    this.desiredMusicKey = key;

    if (!this.ctx || !this.unlocked || this.unavailable) {
      return;
    }

    this.attachAudioGraph();
    if (!this.musicNodes.has(key)) {
      return;
    }

    this.startMusic(key, fadeSeconds);
  }

  startDesiredMusic() {
    if (!this.desiredMusicKey) {
      return;
    }

    this.attachAudioGraph();
    this.startMusic(this.desiredMusicKey, MUSIC_FADE_SECONDS);
  }

  startMusic(key, fadeSeconds = MUSIC_FADE_SECONDS) {
    const node = this.musicNodes.get(key);
    if (!node) {
      return;
    }

    const { element } = node;
    const previousKey = this.currentMusicKey;
    const previous = previousKey ? this.musicNodes.get(previousKey) : null;

    this.cancelScheduledPause(key);

    if (previousKey === key && previous) {
      if (element.paused) {
        if (Number.isFinite(element.duration) && element.currentTime >= element.duration - 0.3) {
          element.currentTime = 0;
        }
        const promise = element.play();
        promise?.catch(() => {});
      }
      this.rampMusicGain(node, 1, fadeSeconds);
      return;
    }

    if (previous && previous !== node) {
      this.rampMusicGain(previous, 0, fadeSeconds);
      this.schedulePause(previousKey, previous.element, fadeSeconds);
    }

    element.currentTime = 0;
    const promise = element.play();
    promise?.catch(() => {});
    this.rampMusicGain(node, 1, fadeSeconds);
    this.currentMusicKey = key;
  }

  stopMusic({ fadeSeconds = 0.6 } = {}) {
    this.desiredMusicKey = null;

    const key = this.currentMusicKey;
    if (!key) {
      return;
    }

    const node = this.musicNodes.get(key);
    this.currentMusicKey = null;
    if (!node) {
      return;
    }

    this.rampMusicGain(node, 0, fadeSeconds);
    this.schedulePause(key, node.element, fadeSeconds);
  }

  rampMusicGain(node, target, seconds) {
    if (!this.ctx) {
      return;
    }

    const param = node.gain.gain;
    const now = this.ctx.currentTime;

    try {
      if (typeof param.cancelAndHoldAtTime === "function") {
        param.cancelAndHoldAtTime(now);
      } else {
        param.cancelScheduledValues(now);
        param.setValueAtTime(param.value, now);
      }
      if (seconds <= 0) {
        param.setValueAtTime(target, now);
      } else {
        param.linearRampToValueAtTime(target, now + seconds);
      }
    } catch {
      param.setValueAtTime(target, now);
    }
  }

  schedulePause(key, element, seconds) {
    this.cancelScheduledPause(key);

    const timer = setTimeout(
      () => {
        this.musicPauseTimers.delete(key);
        if (this.currentMusicKey !== key) {
          element.pause();
          element.currentTime = 0;
        }
      },
      Math.max(0, seconds * 1000) + 120,
    );

    this.musicPauseTimers.set(key, timer);
  }

  cancelScheduledPause(key) {
    const timer = this.musicPauseTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.musicPauseTimers.delete(key);
    }
  }

  /**
   * Reproduce en bucle el sonido de pasos mientras el personaje se desplaza.
   * Lo usan todos los personajes porque la llamada vive en `Player`.
   */
  startFootsteps() {
    this.footstepWanted = true;

    if (!this.ctx || !this.unlocked || this.unavailable) {
      return;
    }

    this.attachAudioGraph();
    const node = this.footstepNode;
    if (!node) {
      return;
    }

    const { element } = node;
    if (!element.paused || element.readyState < 2) {
      return;
    }

    if (
      element.currentTime === 0 ||
      (Number.isFinite(element.duration) && element.currentTime >= element.duration - 0.05)
    ) {
      element.currentTime = FOOTSTEP_START_OFFSET;
    }

    const promise = element.play();
    promise?.catch(() => {});
  }

  stopFootsteps() {
    this.footstepWanted = false;

    const node = this.footstepNode;
    if (!node || node.element.paused) {
      return;
    }

    node.element.pause();
  }

  playTone({
    frequency = 440,
    duration = 0.12,
    type = "sine",
    channel = "sfx",
    gain = 0.12,
    slideTo = null,
  } = {}) {
    if (!this.ctx || !this.unlocked || this.muted || this.ctx.state !== "running") {
      return;
    }

    const destination = channel === "music" ? this.music : this.sfx;
    if (!destination) {
      return;
    }

    const now = this.ctx.currentTime;
    const oscillator = this.ctx.createOscillator();
    const envelope = this.ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    if (slideTo !== null) {
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), now + duration);
    }

    envelope.gain.setValueAtTime(0.0001, now);
    envelope.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), now + 0.012);
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    oscillator.connect(envelope);
    envelope.connect(destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.03);

    oscillator.addEventListener(
      "ended",
      () => {
        oscillator.disconnect();
        envelope.disconnect();
      },
      { once: true },
    );
  }

  playUiMove() {
    this.playTone({ frequency: 660, duration: 0.06, type: "triangle", gain: 0.07 });
  }

  playUiConfirm() {
    this.playTone({
      frequency: 520,
      duration: 0.14,
      type: "triangle",
      gain: 0.12,
      slideTo: 780,
    });
  }

  playDamage() {
    this.playTone({
      frequency: 190,
      duration: 0.18,
      type: "sawtooth",
      gain: 0.1,
      slideTo: 90,
    });
  }

  playGameOver() {
    this.playTone({
      frequency: 240,
      duration: 0.9,
      type: "sine",
      gain: 0.14,
      slideTo: 55,
    });
  }

  playDoorBreak() {
    this.playTone({
      frequency: 130,
      duration: 0.55,
      type: "sawtooth",
      gain: 0.16,
      slideTo: 42,
    });
    this.playTone({
      frequency: 68,
      duration: 0.8,
      type: "square",
      gain: 0.08,
      slideTo: 30,
    });
  }

  playDoorOpen() {
    this.playTone({
      frequency: 280,
      duration: 0.22,
      type: "triangle",
      gain: 0.05,
      slideTo: 460,
    });
  }

  playDoorClose() {
    this.playTone({
      frequency: 150,
      duration: 0.18,
      type: "square",
      gain: 0.1,
      slideTo: 62,
    });
    this.playTone({
      frequency: 70,
      duration: 0.24,
      type: "sine",
      gain: 0.09,
      slideTo: 42,
    });
  }

  /**
   * Grito lejano del pasillo. Se sintetiza con tres tonos superpuestos para
   * que se distinga de los gruñidos de los zombis.
   */
  playScream() {
    this.playTone({
      frequency: 840,
      duration: 0.78,
      type: "sawtooth",
      gain: 0.11,
      slideTo: 390,
    });
    this.playTone({
      frequency: 560,
      duration: 0.68,
      type: "triangle",
      gain: 0.07,
      slideTo: 250,
    });
    this.playTone({
      frequency: 1180,
      duration: 0.42,
      type: "square",
      gain: 0.035,
      slideTo: 620,
    });
  }

  playKeyboardThrow() {
    this.playTone({
      frequency: 880,
      duration: 0.18,
      type: "triangle",
      gain: 0.08,
      slideTo: 320,
    });
  }

  playKeyboardHit() {
    this.playTone({
      frequency: 190,
      duration: 0.16,
      type: "square",
      gain: 0.14,
      slideTo: 65,
    });
    this.playTone({
      frequency: 1100,
      duration: 0.07,
      type: "square",
      gain: 0.05,
      slideTo: 420,
    });
  }

  playZombieGroan() {
    this.playTone({
      frequency: 98,
      duration: 0.55,
      type: "sawtooth",
      gain: 0.055,
      slideTo: 72,
    });
  }

  playAxeSwing() {
    this.playTone({
      frequency: 540,
      duration: 0.12,
      type: "triangle",
      gain: 0.05,
      slideTo: 250,
    });
  }

  playAxeHit() {
    this.playTone({
      frequency: 165,
      duration: 0.16,
      type: "square",
      gain: 0.14,
      slideTo: 58,
    });
    this.playTone({
      frequency: 980,
      duration: 0.07,
      type: "sawtooth",
      gain: 0.05,
      slideTo: 330,
    });
  }

  playZombieDeath() {
    this.playTone({
      frequency: 148,
      duration: 0.42,
      type: "sawtooth",
      gain: 0.07,
      slideTo: 48,
    });
  }

  playCabinetHit() {
    this.playTone({
      frequency: 220,
      duration: 0.11,
      type: "square",
      gain: 0.12,
      slideTo: 110,
    });
    this.playTone({
      frequency: 1500,
      duration: 0.05,
      type: "triangle",
      gain: 0.05,
      slideTo: 720,
    });
  }

  playGlassBreak() {
    this.playTone({
      frequency: 1800,
      duration: 0.16,
      type: "triangle",
      gain: 0.07,
      slideTo: 640,
    });
    this.playTone({
      frequency: 1320,
      duration: 0.13,
      type: "square",
      gain: 0.045,
      slideTo: 420,
    });
    this.playTone({
      frequency: 96,
      duration: 0.32,
      type: "sawtooth",
      gain: 0.1,
      slideTo: 44,
    });
  }

  playAxePickup() {
    this.playTone({
      frequency: 420,
      duration: 0.16,
      type: "triangle",
      gain: 0.1,
      slideTo: 780,
    });
    this.playTone({
      frequency: 920,
      duration: 0.2,
      type: "triangle",
      gain: 0.06,
      slideTo: 1180,
    });
  }

  playWaveStart() {
    this.playTone({
      frequency: 120,
      duration: 0.7,
      type: "sawtooth",
      gain: 0.1,
      slideTo: 62,
    });
    this.playTone({
      frequency: 240,
      duration: 0.42,
      type: "square",
      gain: 0.05,
      slideTo: 150,
    });
  }

  playSuccess() {
    this.playTone({ frequency: 520, duration: 0.14, type: "triangle", gain: 0.09 });
    this.playTone({
      frequency: 660,
      duration: 0.18,
      type: "triangle",
      gain: 0.09,
      slideTo: 780,
    });
  }

  destroy() {
    this.stopFootsteps();

    for (const timer of this.musicPauseTimers.values()) {
      clearTimeout(timer);
    }
    this.musicPauseTimers.clear();

    for (const node of this.musicNodes.values()) {
      node.element.pause();
    }
    this.musicNodes.clear();
    this.footstepNode = null;
    this.currentMusicKey = null;
    this.desiredMusicKey = null;

    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}
