export class AssetLoader {
  constructor() {
    this.images = new Map();
    this.audio = new Map();
    this.errors = [];
    this.total = 0;
    this.loaded = 0;
    this.progress = 0;
    this.ready = false;
  }

  async loadAll(manifest = {}) {
    const imageEntries = Object.entries(manifest.images ?? {});
    const audioEntries = Object.entries(manifest.audio ?? {});

    this.images.clear();
    this.audio.clear();
    this.errors = [];
    this.total = imageEntries.length + audioEntries.length;
    this.loaded = 0;
    this.progress = this.total === 0 ? 1 : 0;
    this.ready = false;

    const jobs = [
      ...imageEntries.map(([key, source]) => this.loadImage(key, source)),
      ...audioEntries.map(([key, source]) => this.loadAudio(key, source)),
    ];

    await Promise.allSettled(jobs);
    this.progress = 1;
    this.ready = true;
  }

  loadImage(key, source) {
    return new Promise((resolve) => {
      const image = new Image();
      image.decoding = "async";

      image.onload = () => {
        this.images.set(key, image);
        this.tick();
        resolve(image);
      };

      image.onerror = () => {
        this.errors.push(`No se pudo cargar la imagen "${key}".`);
        this.tick();
        resolve(null);
      };

      image.src = source;
    });
  }

  loadAudio(key, source) {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.preload = "auto";

      const finish = (loaded) => {
        if (loaded) {
          this.audio.set(key, audio);
        } else {
          this.errors.push(`No se pudo cargar el audio "${key}".`);
        }
        this.tick();
        resolve(loaded ? audio : null);
      };

      audio.addEventListener("canplaythrough", () => finish(true), { once: true });
      audio.addEventListener("error", () => finish(false), { once: true });
      audio.src = source;
      audio.load();
    });
  }

  tick() {
    this.loaded += 1;
    this.progress = this.total === 0 ? 1 : Math.min(1, this.loaded / this.total);
  }

  getImage(key) {
    return this.images.get(key) ?? null;
  }

  getAudio(key) {
    return this.audio.get(key) ?? null;
  }
}
