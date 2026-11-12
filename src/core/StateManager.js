export class StateManager {
  constructor(game) {
    this.game = game;
    this.factories = new Map();
    this.current = null;
    this.currentId = null;
    this.currentParams = {};
    this.pending = null;
  }

  register(id, factory) {
    this.factories.set(id, factory);
    return this;
  }

  switchTo(id, params = {}) {
    this.pending = { id, params };
  }

  applyPending() {
    if (!this.pending) {
      return;
    }

    const { id, params } = this.pending;
    this.pending = null;

    const factory = this.factories.get(id);
    if (!factory) {
      console.error(`[StateManager] La escena "${id}" no está registrada.`);
      return;
    }

    this.current?.exit?.();
    this.game.audio.stopFootsteps();
    this.current = factory();
    this.currentId = id;
    this.currentParams = params;
    this.current.enter?.(params);
    this.current.resize?.(this.game.width, this.game.height);
  }

  update(dt) {
    this.applyPending();
    this.current?.update?.(dt);
    this.applyPending();
  }

  render(ctx, alpha) {
    this.current?.render?.(ctx, alpha);
  }

  resize(width, height) {
    this.current?.resize?.(width, height);
  }

  reload() {
    if (this.currentId) {
      this.switchTo(this.currentId, this.currentParams);
    }
  }

  get id() {
    return this.currentId;
  }
}
