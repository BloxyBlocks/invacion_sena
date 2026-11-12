import { AssetLoader } from "./AssetLoader.js";
import { AudioManager } from "./AudioManager.js";
import { InputManager } from "./InputManager.js";
import { StateManager } from "./StateManager.js";
import { BootScene } from "../scenes/BootScene.js";
import { MenuScene } from "../scenes/MenuScene.js";
import { Scene1Ambiente } from "../scenes/Scene1Ambiente.js";
import { Scene2Pasillo } from "../scenes/Scene2Pasillo.js";
import { TestScene } from "../scenes/TestScene.js";
import { GameOverScene } from "../scenes/GameOverScene.js";

const FIXED_STEP = 1 / 60;
const MAX_FRAME_DELTA = 0.25;
const MAX_STEPS_PER_FRAME = 5;

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false });

    if (!this.ctx) {
      throw new Error("Este navegador no soporta Canvas 2D.");
    }

    this.width = 0;
    this.height = 0;
    this.dpr = 1;
    this.fps = 60;
    this.fixedStep = FIXED_STEP;
    this.running = false;

    this.input = new InputManager(canvas);
    this.audio = new AudioManager();
    this.assets = new AssetLoader();
    this.audio.setAssets(this.assets);
    this.state = new StateManager(this);

    this.accumulator = 0;
    this.lastTime = 0;
    this.fpsAccumulator = 0;
    this.fpsFrames = 0;
    this.animationFrame = null;

    this.loop = this.loop.bind(this);
    this.resize = this.resize.bind(this);
    this.onVisibilityChange = this.onVisibilityChange.bind(this);

    this.registerScenes();
    this.state.switchTo("boot");

    window.addEventListener("resize", this.resize);
    document.addEventListener("visibilitychange", this.onVisibilityChange);

    const unlockAudio = () => {
      this.audio.unlock().catch(() => {});
    };
    window.addEventListener("pointerdown", unlockAudio, { once: true, passive: true });
    window.addEventListener("keydown", unlockAudio, { once: true });

    this.resize();
  }

  registerScenes() {
    this.state
      .register("boot", () => new BootScene(this))
      .register("menu", () => new MenuScene(this))
      .register("scene1", () => new Scene1Ambiente(this))
      .register("scene2", () => new Scene2Pasillo(this))
      .register("test", () => new TestScene(this))
      .register("gameOver", () => new GameOverScene(this));
  }

  start() {
    if (this.running) {
      return;
    }

    this.running = true;
    this.lastTime = performance.now();
    this.state.applyPending();
    this.animationFrame = requestAnimationFrame(this.loop);
  }

  stop() {
    this.running = false;
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  loop(now) {
    if (!this.running) {
      return;
    }

    const delta = Math.min((now - this.lastTime) / 1000, MAX_FRAME_DELTA);
    this.lastTime = now;
    this.accumulator += delta;

    let steps = 0;
    while (this.accumulator >= FIXED_STEP && steps < MAX_STEPS_PER_FRAME) {
      this.state.update(FIXED_STEP);
      this.accumulator -= FIXED_STEP;
      steps += 1;
    }

    if (steps === MAX_STEPS_PER_FRAME) {
      this.accumulator = 0;
    }

    // Solo se descartan las pulsaciones cuando al menos una actualización las
    // pudo consumir; si el frame no ejecutó lógica, se conservan para el siguiente.
    if (steps > 0) {
      this.input.endFrame();
    }

    const alpha = Math.max(0, Math.min(1, this.accumulator / FIXED_STEP));

    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.state.render(this.ctx, alpha);

    this.updateFps(delta);

    this.animationFrame = requestAnimationFrame(this.loop);
  }

  updateFps(delta) {
    this.fpsAccumulator += delta;
    this.fpsFrames += 1;

    if (this.fpsAccumulator >= 0.5) {
      this.fps = this.fpsFrames / this.fpsAccumulator;
      this.fpsAccumulator = 0;
      this.fpsFrames = 0;
    }
  }

  resize() {
    const width = Math.max(320, window.innerWidth);
    const height = Math.max(240, window.innerHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.width = width;
    this.height = height;
    this.dpr = dpr;

    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.state.resize(width, height);
  }

  onVisibilityChange() {
    if (!document.hidden) {
      this.lastTime = performance.now();
      return;
    }

    this.audio.stopFootsteps();
  }

  destroy() {
    this.stop();
    window.removeEventListener("resize", this.resize);
    document.removeEventListener("visibilitychange", this.onVisibilityChange);
    this.input.dispose();
    this.audio.destroy();
  }
}
