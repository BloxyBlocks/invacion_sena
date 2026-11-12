/**
 * Armas cuerpo a cuerpo de INVACIÓN SENA.
 *
 * El Hacha de Incendios es la primera arma del juego y solo puede equiparse
 * después de romper el gabinete de la Escena 2 (RN-02). El daño se deriva de
 * las estadísticas del personaje para conservar el balance de I1.
 */

export class Weapon {
  constructor({
    id = "weapon",
    name = "Arma",
    shortName = "ARMA",
    damageMultiplier = 1,
    range = 74,
    arc = Math.PI * 0.8,
    baseCooldown = 0.58,
    minCooldown = 0.32,
    knockback = 170,
    accent = "#F2C94C",
  } = {}) {
    this.id = id;
    this.name = name;
    this.shortName = shortName;
    this.damageMultiplier = damageMultiplier;
    this.range = range;
    this.arc = arc;
    this.baseCooldown = baseCooldown;
    this.minCooldown = minCooldown;
    this.knockback = knockback;
    this.accent = accent;
  }

  damageFor(player) {
    return Math.max(1, Math.round((player?.damage ?? 20) * this.damageMultiplier));
  }

  cooldownFor(player) {
    const attackSpeed = Math.max(0.5, player?.attackSpeed ?? 1);
    return Math.max(this.minCooldown, this.baseCooldown / attackSpeed);
  }

  /**
   * Dibuja el hacha en la mano del jugador siguiendo el apuntado del ratón.
   * El estado quieto del sprite no tiene animación de golpe, así que el arma
   * se dibuja por separado y la estela del arco la aporta `CombatSystem`.
   */
  renderInHand(ctx, player, usingSprite = false) {
    const angle = player.aimAngle;
    const originY = usingSprite ? -18 : 0;
    const handDistance = player.radius * 0.55;

    ctx.save();
    ctx.translate(
      Math.cos(angle) * handDistance,
      originY + Math.sin(angle) * handDistance,
    );
    ctx.rotate(angle);

    // Mango de madera.
    ctx.strokeStyle = "#6B4A2A";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-2, 0);
    ctx.lineTo(28, 0);
    ctx.stroke();

    ctx.strokeStyle = "rgba(242, 201, 76, 0.35)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(0, -1);
    ctx.lineTo(26, -1);
    ctx.stroke();

    // Cabeza metálica del hacha.
    ctx.fillStyle = "#B9C4CC";
    ctx.beginPath();
    ctx.moveTo(24, -10);
    ctx.lineTo(36, -13);
    ctx.lineTo(38, 0);
    ctx.lineTo(36, 13);
    ctx.lineTo(24, 10);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#EEF4F8";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = "rgba(235, 87, 87, 0.9)";
    ctx.fillRect(28, -9, 3, 18);

    ctx.restore();
  }

  /**
   * Dibuja el arma apoyada en el gabinete mientras espera a ser recogida.
   */
  renderPickup(ctx, x, y, time = 0) {
    const pulse = 0.5 + Math.sin(time * 5) * 0.5;

    ctx.save();
    ctx.translate(x, y);

    const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, 42);
    glow.addColorStop(0, `rgba(242, 201, 76, ${0.22 + pulse * 0.16})`);
    glow.addColorStop(1, "rgba(242, 201, 76, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, 42, 0, Math.PI * 2);
    ctx.fill();

    ctx.rotate(-0.55 + Math.sin(time * 2.4) * 0.06);

    ctx.strokeStyle = "#6B4A2A";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-14, 0);
    ctx.lineTo(20, 0);
    ctx.stroke();

    ctx.fillStyle = "#C3CDD4";
    ctx.beginPath();
    ctx.moveTo(16, -11);
    ctx.lineTo(30, -14);
    ctx.lineTo(32, 0);
    ctx.lineTo(30, 14);
    ctx.lineTo(16, 11);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#F4F9FC";
    ctx.lineWidth = 1.3;
    ctx.stroke();

    ctx.restore();
  }
}

export const FIRE_AXE = new Weapon({
  id: "fireAxe",
  name: "Hacha de Incendios",
  shortName: "HACHA DE INCENDIOS",
  damageMultiplier: 2.4,
  range: 88,
  arc: Math.PI * 0.82,
  baseCooldown: 0.58,
  minCooldown: 0.34,
  knockback: 190,
  accent: "#F2C94C",
});
