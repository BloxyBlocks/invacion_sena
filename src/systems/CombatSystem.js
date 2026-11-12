/**
 * Sistema de combate Melee.
 *
 * El arco de ataque parte del apuntado del ratón (360°) y solo alcanza a los
 * enemigos que quedan dentro de la apertura y el alcance del arma. El daño se
 * aplica una vez por golpe y el enfriamiento depende del personaje elegido.
 */

export function normalizeAngle(angle) {
  const twoPi = Math.PI * 2;
  let normalized = angle % twoPi;
  if (normalized > Math.PI) {
    normalized -= twoPi;
  } else if (normalized < -Math.PI) {
    normalized += twoPi;
  }
  return normalized;
}

export function angleDifference(a, b) {
  return Math.abs(normalizeAngle(a - b));
}

/**
 * Comprueba si `target` cae dentro del cono de ataque. El margen por radio
 * evita que un zombi grande quede fuera por unos pocos píxeles.
 */
export function targetInArc(origin, target, angle, range, arc) {
  if (!origin || !target) {
    return false;
  }

  const dx = target.x - origin.x;
  const dy = target.y - origin.y;
  const distance = Math.hypot(dx, dy);
  const targetRadius = target.radius ?? 0;

  if (distance > range + targetRadius) {
    return false;
  }

  if (distance <= targetRadius * 0.75) {
    return true;
  }

  const radiusAllowance = Math.asin(
    Math.min(1, targetRadius / Math.max(distance, targetRadius, 1)),
  );
  const attackAngle = Math.atan2(dy, dx);

  return angleDifference(attackAngle, angle) <= arc / 2 + radiusAllowance;
}

export class CombatSystem {
  constructor({ swingDuration = 0.24 } = {}) {
    this.cooldown = 0;
    this.swingTime = 0;
    this.swingDuration = swingDuration;
    this.angle = 0;
    this.range = 0;
    this.arc = 0;
    this.accent = "#F2C94C";
    this.lastHits = [];
    this.swings = 0;
  }

  update(dt) {
    this.cooldown = Math.max(0, this.cooldown - dt);
    this.swingTime = Math.max(0, this.swingTime - dt);
  }

  canAttack() {
    return this.cooldown <= 0;
  }

  isSwinging() {
    return this.swingTime > 0;
  }

  getSwingProgress() {
    if (this.swingTime <= 0 || this.swingDuration <= 0) {
      return 0;
    }
    return 1 - this.swingTime / this.swingDuration;
  }

  /**
   * Ejecuta un golpe. Devuelve `null` si el arma aún está en enfriamiento.
   */
  attack({ attacker, weapon, targets = [], angle = null } = {}) {
    if (!attacker || !weapon || !this.canAttack()) {
      return null;
    }

    const swingAngle = Number.isFinite(angle) ? angle : attacker.aimAngle;

    this.cooldown = weapon.cooldownFor(attacker);
    this.angle = swingAngle;
    this.range = weapon.range;
    this.arc = weapon.arc;
    this.accent = weapon.accent;
    this.swingTime = this.swingDuration;
    this.swings += 1;

    const hits = [];
    for (const target of targets) {
      if (!target || target.dead || target.health <= 0) {
        continue;
      }

      if (!targetInArc(attacker, target, swingAngle, weapon.range, weapon.arc)) {
        continue;
      }

      const dx = target.x - attacker.x;
      const dy = target.y - attacker.y;
      const distance = Math.hypot(dx, dy) || 1;
      const killed = target.takeHit(weapon.damageFor(attacker), {
        directionX: dx / distance,
        directionY: dy / distance,
        knockback: weapon.knockback,
      });

      hits.push({
        target,
        killed,
        damage: weapon.damageFor(attacker),
        x: target.x,
        y: target.y,
      });
    }

    this.lastHits = hits;
    return { hits, angle: swingAngle, range: weapon.range, arc: weapon.arc };
  }

  /**
   * Reproduce sólo la estela visual del golpe. Se usa al golpear el gabinete,
   * antes de que el hacha esté equipada.
   */
  previewSwing({ angle = 0, range = 62, arc = Math.PI * 0.7, duration = 0.2, accent = "#F2C94C" } = {}) {
    this.angle = angle;
    this.range = range;
    this.arc = arc;
    this.accent = accent;
    this.swingDuration = duration;
    this.swingTime = duration;
  }

  renderSwing(ctx, player, alpha = 1, usingSprite = true) {
    if (this.swingTime <= 0) {
      return;
    }

    const { x, y } = player.getRenderPosition(alpha);
    const originY = usingSprite ? -18 : 0;
    const progress = Math.min(1, this.getSwingProgress() * 1.12);
    const start = this.angle - this.arc / 2;
    const head = start + this.arc * progress;
    const fade = 1 - this.getSwingProgress();

    ctx.save();
    ctx.translate(x, y + originY);

    // Estela del arco.
    ctx.beginPath();
    ctx.arc(0, 0, this.range, start, head);
    ctx.strokeStyle = this.accent;
    ctx.globalAlpha = 0.16 + fade * 0.42;
    ctx.lineWidth = 12;
    ctx.lineCap = "round";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, this.range - 5, start, head);
    ctx.strokeStyle = "rgba(255, 248, 214, 0.9)";
    ctx.globalAlpha = 0.25 + fade * 0.55;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Filo del hacha en el punto de barrido.
    ctx.globalAlpha = 0.65 + fade * 0.35;
    ctx.strokeStyle = "rgba(244, 249, 252, 0.88)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(Math.cos(head) * this.range * 0.38, Math.sin(head) * this.range * 0.38);
    ctx.lineTo(Math.cos(head) * this.range, Math.sin(head) * this.range);
    ctx.stroke();

    ctx.restore();
  }
}
