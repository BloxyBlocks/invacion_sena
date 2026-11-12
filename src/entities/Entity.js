export class Entity {
  constructor({ x = 0, y = 0, radius = 10 } = {}) {
    this.x = x;
    this.y = y;
    this.prevX = x;
    this.prevY = y;
    this.radius = radius;
    this.active = true;
  }

  savePrevious() {
    this.prevX = this.x;
    this.prevY = this.y;
  }

  getRenderPosition(alpha = 1) {
    return {
      x: this.prevX + (this.x - this.prevX) * alpha,
      y: this.prevY + (this.y - this.prevY) * alpha,
    };
  }

  distanceTo(other) {
    return Math.hypot(other.x - this.x, other.y - this.y);
  }
}
