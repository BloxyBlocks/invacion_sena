export class KeyboardProjectile {
  constructor({ x, y, targetX, targetY, speed = 980 } = {}) {
    this.x = x;
    this.y = y;
    this.prevX = x;
    this.prevY = y;
    this.targetX = targetX;
    this.targetY = targetY;
    this.speed = speed;
    this.rotation = 0;
    this.spin = 16;
    this.life = 0;
    this.maxLife = 1.2;
    this.radius = 12;
    this.alive = true;

    const angle = Math.atan2(targetY - y, targetX - x);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
  }

  update(dt, target = null) {
    this.prevX = this.x;
    this.prevY = this.y;
    this.life += dt;

    if (target && !target.knockedOut) {
      const desiredAngle = Math.atan2(target.y - this.y, target.x - this.x);
      const currentAngle = Math.atan2(this.vy, this.vx);
      let difference = desiredAngle - currentAngle;

      while (difference > Math.PI) {
        difference -= Math.PI * 2;
      }
      while (difference < -Math.PI) {
        difference += Math.PI * 2;
      }

      const turn = Math.max(-3.2 * dt, Math.min(3.2 * dt, difference));
      const angle = currentAngle + turn;
      this.vx = Math.cos(angle) * this.speed;
      this.vy = Math.sin(angle) * this.speed;
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.rotation += this.spin * dt;

    if (this.life >= this.maxLife) {
      this.alive = false;
    }
  }

  hits(circle) {
    const radius = circle.radius + this.radius;
    const dx = circle.x - this.x;
    const dy = circle.y - this.y;
    return dx * dx + dy * dy <= radius * radius;
  }

  render(ctx, alpha = 1) {
    const x = this.prevX + (this.x - this.prevX) * alpha;
    const y = this.prevY + (this.y - this.prevY) * alpha;

    ctx.save();
    ctx.translate(x, y);

    ctx.strokeStyle = "rgba(155, 225, 93, 0.22)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-this.vx * 0.006, -this.vy * 0.006);
    ctx.lineTo(0, 0);
    ctx.stroke();

    ctx.rotate(this.rotation);

    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.beginPath();
    ctx.ellipse(2, 3, 18, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#2B3138";
    ctx.strokeStyle = "#8B9AA8";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-17, -9, 34, 18, 3);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#12171C";
    ctx.beginPath();
    ctx.roundRect(-14, -6, 28, 12, 2);
    ctx.fill();

    ctx.fillStyle = "#C9D6E2";
    for (let row = 0; row < 3; row += 1) {
      for (let column = 0; column < 7; column += 1) {
        ctx.fillRect(-12.5 + column * 3.7, -4.4 + row * 3.3, 2.6, 2.2);
      }
    }

    ctx.fillStyle = "rgba(155, 225, 93, 0.9)";
    ctx.fillRect(-12.5, 5.2, 8, 1.6);

    ctx.restore();
  }
}
