const PREVENT_DEFAULT_CODES = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"]);

export class InputManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.pressed = new Set();
    this.released = new Set();
    this.mouse = {
      x: 0,
      y: 0,
      down: false,
      pressed: false,
      released: false,
    };

    this.onKeyDown = (event) => {
      if (PREVENT_DEFAULT_CODES.has(event.code)) {
        event.preventDefault();
      }
      if (!this.keys.has(event.code)) {
        this.pressed.add(event.code);
      }
      this.keys.add(event.code);
    };

    this.onKeyUp = (event) => {
      if (PREVENT_DEFAULT_CODES.has(event.code)) {
        event.preventDefault();
      }
      if (this.keys.delete(event.code)) {
        this.released.add(event.code);
      }
    };

    this.onBlur = () => {
      this.keys.clear();
      this.mouse.down = false;
    };

    this.onPointerMove = (event) => {
      this.updateMousePosition(event);
      if (event.buttons === 0) {
        this.mouse.down = false;
      }
    };

    this.onPointerDown = (event) => {
      if (event.button !== 0) {
        return;
      }
      this.updateMousePosition(event);
      if (!this.mouse.down) {
        this.mouse.pressed = true;
      }
      this.mouse.down = true;
    };

    this.onPointerUp = (event) => {
      if (event.button !== 0) {
        return;
      }
      this.updateMousePosition(event);
      if (this.mouse.down) {
        this.mouse.released = true;
      }
      this.mouse.down = false;
    };

    this.onContextMenu = (event) => {
      event.preventDefault();
    };

    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("blur", this.onBlur);
    window.addEventListener("pointerup", this.onPointerUp);
    window.addEventListener("pointercancel", this.onPointerUp);
    canvas.addEventListener("pointermove", this.onPointerMove);
    canvas.addEventListener("pointerdown", this.onPointerDown);
    canvas.addEventListener("contextmenu", this.onContextMenu);
  }

  updateMousePosition(event) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = event.clientX - rect.left;
    this.mouse.y = event.clientY - rect.top;
  }

  isDown(...codes) {
    return codes.some((code) => this.keys.has(code));
  }

  wasPressed(...codes) {
    return codes.some((code) => this.pressed.has(code));
  }

  consumePressed(...codes) {
    let found = false;
    for (const code of codes) {
      if (this.pressed.delete(code)) {
        found = true;
      }
    }
    return found;
  }

  consumeClick() {
    if (!this.mouse.pressed) {
      return false;
    }
    this.mouse.pressed = false;
    return true;
  }

  getMoveVector() {
    let x = 0;
    let y = 0;

    if (this.isDown("KeyA", "ArrowLeft")) {
      x -= 1;
    }
    if (this.isDown("KeyD", "ArrowRight")) {
      x += 1;
    }
    if (this.isDown("KeyW", "ArrowUp")) {
      y -= 1;
    }
    if (this.isDown("KeyS", "ArrowDown")) {
      y += 1;
    }

    if (x !== 0 && y !== 0) {
      const diagonal = 1 / Math.sqrt(2);
      x *= diagonal;
      y *= diagonal;
    }

    return { x, y };
  }

  endFrame() {
    this.pressed.clear();
    this.released.clear();
    this.mouse.pressed = false;
    this.mouse.released = false;
  }

  dispose() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("blur", this.onBlur);
    window.removeEventListener("pointerup", this.onPointerUp);
    window.removeEventListener("pointercancel", this.onPointerUp);
    this.canvas.removeEventListener("pointermove", this.onPointerMove);
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    this.canvas.removeEventListener("contextmenu", this.onContextMenu);
  }
}
