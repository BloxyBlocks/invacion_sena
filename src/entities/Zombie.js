import { Entity } from "./Entity.js";
import { moveCircleWithCollisions } from "../systems/PhysicsSystem.js";

const STATE = {
  ENTERING: "entering",
  CHASE: "chase",
  KNOCKED_OUT: "knockedOut",
  DYING: "dying",
  DEAD: "dead",
};

export class Zombie extends Entity {
  constructor({ x = 0, y = 0, radius = 17, speed = 62, maxHealth = 90 } = {}) {
    super({ x, y, radius });
    this.speed = speed;
    this.state = STATE.ENTERING;
    this.stateTime = 0;
    this.startleTime = 0;
    this.facing = Math.PI;
    this.bob = Math.random() * Math.PI * 2;
    this.hitFlash = 0;
    this.entryPoint = { x, y };
    this.knockVx = 0;
    this.knockVy = 0;
    this.knockRotation = 0;
    this.maxHealth = maxHealth;
    this.health = maxHealth;
    this.dead = false;
    this.stunTime = 0;
    this.deathTime = 0;
  }

  get knockedOut() {
    return this.state === STATE.KNOCKED_OUT;
  }

  get alive() {
    return !this.dead && this.state !== STATE.KNOCKED_OUT;
  }

  setHealth(value) {
    this.maxHealth = Math.max(1, Math.round(value));
    this.health = this.maxHealth;
    return this;
  }

  /**
   * Aplica daño de melé. Devuelve `true` si este golpe elimina al zombi.
   * El empuje se reutiliza para separar a los enemigos del jugador.
   */
  takeHit(amount, { directionX = 1, directionY = 0, knockback = 170 } = {}) {
    if (this.dead || this.state === STATE.KNOCKED_OUT) {
      return false;
    }

    this.health = Math.max(0, this.health - Math.max(1, Math.round(amount)));
    this.hitFlash = 0.18;
    this.stunTime = Math.max(this.stunTime, 0.22);
    this.knockVx = directionX * knockback;
    this.knockVy = directionY * knockback;
    this.knockRotation = (directionY >= 0 ? 1 : -1) * (1.2 + Math.random() * 0.3);

    if (this.health <= 0) {
      this.dead = true;
      this.state = STATE.DYING;
      this.stateTime = 0;
      this.deathTime = 0;
      return true;
    }

    return false;
  }

  enterTo(x, y) {
    this.entryPoint = { x, y };
    this.state = STATE.ENTERING;
    this.stateTime = 0;
  }

  startle(seconds = 0.35) {
    if (this.state === STATE.CHASE) {
      this.startleTime = Math.max(this.startleTime, seconds);
    }
  }

  knockOut({ directionX = 1, directionY = 0 } = {}) {
    if (this.state === STATE.KNOCKED_OUT) {
      return false;
    }

    this.state = STATE.KNOCKED_OUT;
    this.stateTime = 0;
    this.hitFlash = 0.2;
    this.knockVx = directionX * 170;
    this.knockVy = directionY * 170;
    this.knockRotation = (directionY >= 0 ? 1 : -1) * (1.15 + Math.random() * 0.25);
    return true;
  }

  update(dt, { target = null, bounds = null, obstacles = [], neighbors = [] } = {}) {
    this.savePrevious();
    this.stateTime += dt;
    this.bob += dt * 5;
    this.hitFlash = Math.max(0, this.hitFlash - dt);
    this.startleTime = Math.max(0, this.startleTime - dt);
    this.stunTime = Math.max(0, this.stunTime - dt);

    if (this.state === STATE.DEAD) {
      return;
    }

    if (this.state === STATE.DYING) {
      this.deathTime += dt;
      if (Math.abs(this.knockVx) > 1 || Math.abs(this.knockVy) > 1) {
        moveCircleWithCollisions(this, this.knockVx * dt, this.knockVy * dt, bounds, obstacles);
        this.knockVx *= Math.pow(0.0025, dt);
        this.knockVy *= Math.pow(0.0025, dt);
      }
      if (this.deathTime >= 1.4) {
        this.state = STATE.DEAD;
        this.active = false;
      }
      return;
    }

    if (this.state === STATE.KNOCKED_OUT) {
      if (Math.abs(this.knockVx) > 1 || Math.abs(this.knockVy) > 1) {
        moveCircleWithCollisions(this, this.knockVx * dt, this.knockVy * dt, bounds, obstacles);
        this.knockVx *= Math.pow(0.0025, dt);
        this.knockVy *= Math.pow(0.0025, dt);
      }
      return;
    }

    if (this.stunTime > 0) {
      if (Math.abs(this.knockVx) > 1 || Math.abs(this.knockVy) > 1) {
        moveCircleWithCollisions(this, this.knockVx * dt, this.knockVy * dt, bounds, obstacles);
        this.knockVx *= Math.pow(0.05, dt);
        this.knockVy *= Math.pow(0.05, dt);
      }
      return;
    }

    if (this.state === STATE.ENTERING) {
      const dx = this.entryPoint.x - this.x;
      const dy = this.entryPoint.y - this.y;
      const distance = Math.hypot(dx, dy);

      if (distance < 5) {
        this.state = STATE.CHASE;
        this.stateTime = 0;
        return;
      }

      const step = Math.min(this.speed * 1.65 * dt, distance);
      this.facing = Math.atan2(dy, dx);
      moveCircleWithCollisions(
        this,
        (dx / distance) * step,
        (dy / distance) * step,
        bounds,
        obstacles,
      );
      return;
    }

    if (this.state === STATE.CHASE && target && this.startleTime <= 0) {
      const dx = target.x - this.x;
      const dy = target.y - this.y;
      const distance = Math.hypot(dx, dy);
      let moveX = 0;
      let moveY = 0;

      if (distance > 44) {
        this.facing = Math.atan2(dy, dx);
        const step = this.speed * dt;
        moveX = (dx / distance) * step;
        moveY = (dy / distance) * step;
      } else {
        this.facing = Math.atan2(dy, dx);
      }

      // Repulsión básica entre infectados para que no se apilen en un punto.
      for (const other of neighbors) {
        if (other === this || other.dead) {
          continue;
        }
        const ox = this.x - other.x;
        const oy = this.y - other.y;
        const otherDistance = Math.hypot(ox, oy);
        const minimum = this.radius + other.radius + 5;
        const range = minimum * 1.7;

        if (otherDistance > 0 && otherDistance < range) {
          const push = (range - otherDistance) / range;
          moveX += (ox / otherDistance) * this.speed * 0.55 * push * dt;
          moveY += (oy / otherDistance) * this.speed * 0.55 * push * dt;
        }
      }

      if (moveX !== 0 || moveY !== 0) {
        moveCircleWithCollisions(this, moveX, moveY, bounds, obstacles);
      }
    }
  }

  render(ctx, alpha = 1) {
    const { x, y } = this.getRenderPosition(alpha);

    ctx.save();
    ctx.translate(x, y);

    if (this.state === STATE.KNOCKED_OUT) {
      this.renderKnockedOut(ctx);
      ctx.restore();
      return;
    }

    if (this.state === STATE.DYING || this.state === STATE.DEAD) {
      this.renderDying(ctx);
      ctx.restore();
      return;
    }

    const sway = Math.sin(this.bob) * 2;
    ctx.fillStyle = "rgba(0, 0, 0, 0.38)";
    ctx.beginPath();
    ctx.ellipse(0, this.radius * 0.9, this.radius * 1.1, this.radius * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.rotate(this.facing);

    ctx.strokeStyle = "#7E9B5A";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(2, -this.radius * 0.5);
    ctx.lineTo(this.radius * 1.45, -this.radius * 0.75 + sway);
    ctx.moveTo(2, this.radius * 0.5);
    ctx.lineTo(this.radius * 1.45, this.radius * 0.75 + sway);
    ctx.stroke();

    ctx.fillStyle = this.hitFlash > 0 ? "#FFFFFF" : "#5F7F3E";
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(163, 196, 122, 0.65)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#9BB86C";
    ctx.beginPath();
    ctx.arc(this.radius * 0.42, 0, this.radius * 0.58, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#12200D";
    ctx.beginPath();
    ctx.arc(this.radius * 0.66, -this.radius * 0.2, 2.6, 0, Math.PI * 2);
    ctx.arc(this.radius * 0.66, this.radius * 0.2, 2.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(11, 20, 8, 0.75)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.radius * 0.3, 0);
    ctx.lineTo(this.radius * 0.55, 0);
    ctx.stroke();
    ctx.restore();

    if (this.health < this.maxHealth) {
      const barW = 42;
      const ratio = Math.max(0, this.health / this.maxHealth);
      ctx.fillStyle = "rgba(4, 8, 3, 0.72)";
      ctx.fillRect(-barW / 2, -this.radius - 26, barW, 5);
      ctx.fillStyle = ratio > 0.5 ? "#9BE15D" : ratio > 0.25 ? "#F2C94C" : "#EB5757";
      ctx.fillRect(-barW / 2, -this.radius - 26, barW * ratio, 5);
    }

    ctx.font = "700 10px 'Segoe UI', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = "rgba(196, 226, 160, 0.85)";
    ctx.fillText("ZOMBI APRENDIZ", 0, -this.radius - 8);

    ctx.restore();
  }

  renderDying(ctx) {
    const fall = Math.min(1, this.deathTime / 0.42);
    const pool = Math.min(1, this.deathTime / 0.65);
    const alpha =
      this.deathTime > 1.0 ? Math.max(0, 1 - (this.deathTime - 1.0) / 0.4) : 1;

    ctx.save();
    ctx.globalAlpha = alpha;

    // Charco de sangre que crece bajo el cuerpo.
    ctx.fillStyle = `rgba(96, 6, 18, ${0.16 + pool * 0.44})`;
    ctx.beginPath();
    ctx.ellipse(0, this.radius * 0.25, this.radius * (1.25 + pool * 0.5), this.radius * (0.65 + pool * 0.35), 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(0, 0, 0, 0.32)";
    ctx.beginPath();
    ctx.ellipse(0, this.radius * 0.35, this.radius * 1.4, this.radius * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.rotate((this.knockRotation || 1.2) * fall);

    ctx.fillStyle = "#4A6131";
    ctx.beginPath();
    ctx.ellipse(0, 0, this.radius * 1.22, this.radius * 0.82, 0.08, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#7F9B55";
    ctx.beginPath();
    ctx.arc(-this.radius * 0.6, 0, this.radius * 0.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#1D2810";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-this.radius * 0.78, -this.radius * 0.18);
    ctx.lineTo(-this.radius * 0.42, this.radius * 0.18);
    ctx.moveTo(-this.radius * 0.78, this.radius * 0.18);
    ctx.lineTo(-this.radius * 0.42, -this.radius * 0.18);
    ctx.stroke();

    ctx.strokeStyle = "#6E8B4B";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(this.radius * 0.35, -this.radius * 0.55);
    ctx.lineTo(this.radius * 1.3, -this.radius * 0.85);
    ctx.moveTo(this.radius * 0.35, this.radius * 0.55);
    ctx.lineTo(this.radius * 1.3, this.radius * 0.95);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  renderKnockedOut(ctx) {
    const twitch = Math.sin(this.stateTime * 18) * (this.stateTime < 0.45 ? 2.5 : 0);

    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.beginPath();
    ctx.ellipse(0, 0, this.radius * 1.6, this.radius * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.rotate(this.knockRotation + twitch * 0.01);

    ctx.fillStyle = "#4C6632";
    ctx.beginPath();
    ctx.ellipse(0, 0, this.radius * 1.25, this.radius * 0.85, 0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#8CA85F";
    ctx.beginPath();
    ctx.arc(-this.radius * 0.6, 0, this.radius * 0.62, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#233014";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-this.radius * 0.78, -this.radius * 0.18);
    ctx.lineTo(-this.radius * 0.42, this.radius * 0.18);
    ctx.moveTo(-this.radius * 0.78, this.radius * 0.18);
    ctx.lineTo(-this.radius * 0.42, -this.radius * 0.18);
    ctx.stroke();

    ctx.strokeStyle = "#6E8B4B";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(this.radius * 0.35, -this.radius * 0.55);
    ctx.lineTo(this.radius * 1.3, -this.radius * 0.85);
    ctx.moveTo(this.radius * 0.35, this.radius * 0.55);
    ctx.lineTo(this.radius * 1.3, this.radius * 0.95);
    ctx.stroke();
    ctx.restore();

    if (this.stateTime < 1.6) {
      const stars = 3;
      for (let index = 0; index < stars; index += 1) {
        const angle = this.stateTime * 4 + (index / stars) * Math.PI * 2;
        ctx.fillStyle = "rgba(242, 201, 76, 0.9)";
        ctx.beginPath();
        ctx.arc(
          Math.cos(angle) * (this.radius + 12),
          -this.radius - 8 + Math.sin(angle) * 5,
          2.6,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    }
  }
}
