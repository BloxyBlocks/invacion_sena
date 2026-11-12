import { Entity } from "./Entity.js";
import { PLAYER_SPRITE_VIEWS } from "../core/AssetManifest.js";
import { moveCircleWithCollisions } from "../systems/PhysicsSystem.js";

export const STAT_MAX = {
  speed: 280,
  maxHealth: 150,
  damage: 35,
  attackSpeed: 1.3,
};

export const CHARACTERS = [
  {
    id: "zamora",
    name: "Zamora",
    role: "Equilibrado",
    description:
      "Balance entre movilidad, aguante y daño. La elección segura para aprender el sistema.",
    color: "#39A900",
    accent: "#9BE15D",
    speed: 220,
    maxHealth: 100,
    damage: 25,
    attackSpeed: 1.15,
  },
  {
    id: "chantre",
    name: "Chantre",
    role: "Resistente",
    description:
      "Más salud para aguantar las hordas, a cambio de menor velocidad de desplazamiento.",
    color: "#F2C94C",
    accent: "#FFE38A",
    speed: 190,
    maxHealth: 140,
    damage: 22,
    attackSpeed: 1.0,
  },
  {
    id: "juan",
    name: "Juan",
    role: "Ágil",
    description:
      "El más rápido y con mejor ritmo de ataque, pero con menos margen de error por su salud.",
    color: "#56CCF2",
    accent: "#A6E9FF",
    speed: 265,
    maxHealth: 90,
    damage: 20,
    attackSpeed: 1.25,
  },
  {
    id: "daiver",
    name: "Daiver",
    role: "Demoledor",
    description:
      "Golpes fuertes y control de área; compensa su ataque más lento con mayor daño.",
    color: "#EB5757",
    accent: "#FF9A9A",
    speed: 205,
    maxHealth: 110,
    damage: 32,
    attackSpeed: 0.9,
  },
];

const SPRITE_HEIGHT = 76;
const SPRITE_FEET_Y = 14;

function resolveFacing(angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  if (Math.abs(cos) >= Math.abs(sin)) {
    return cos >= 0 ? "right" : "left";
  }

  return sin >= 0 ? "down" : "up";
}

export function getCharacter(id) {
  return CHARACTERS.find((character) => character.id === id) ?? CHARACTERS[0];
}

export class Player extends Entity {
  constructor(character, assets = null, audio = null) {
    super({ radius: 15 });
    this.character = character;
    this.assets = assets;
    this.audio = audio;
    this.maxHealth = character.maxHealth;
    this.health = this.maxHealth;
    this.speed = character.speed;
    this.damage = character.damage;
    this.attackSpeed = character.attackSpeed;
    this.aimAngle = 0;
    this.facing = "down";
    this.invulnerable = 0;
    this.hitFlash = 0;
    this.moving = false;
    this.weapon = null;
  }

  equipWeapon(weapon) {
    this.weapon = weapon ?? null;
    return this.weapon;
  }

  hasWeapon() {
    return Boolean(this.weapon);
  }

  reset(x, y) {
    this.x = x;
    this.y = y;
    this.prevX = x;
    this.prevY = y;
    this.health = this.maxHealth;
    this.active = true;
    this.invulnerable = 0;
    this.hitFlash = 0;
    this.moving = false;
    this.facing = "down";
    this.audio?.stopFootsteps();
  }

  aimAt(x, y) {
    this.aimAngle = Math.atan2(y - this.y, x - this.x);
  }

  update(dt, { direction = { x: 0, y: 0 }, bounds = null, obstacles = [], aimX, aimY } = {}) {
    this.savePrevious();

    if (Number.isFinite(aimX) && Number.isFinite(aimY)) {
      this.aimAt(aimX, aimY);
    }

    const hasInput = direction.x !== 0 || direction.y !== 0;
    this.moving = false;

    if (hasInput) {
      this.facing = resolveFacing(Math.atan2(direction.y, direction.x));
      moveCircleWithCollisions(
        this,
        direction.x * this.speed * dt,
        direction.y * this.speed * dt,
        bounds,
        obstacles,
      );
      this.moving =
        Math.abs(this.x - this.prevX) + Math.abs(this.y - this.prevY) > 0.05;
    } else if (Number.isFinite(this.aimAngle)) {
      this.facing = resolveFacing(this.aimAngle);
    }

    if (this.moving) {
      this.audio?.startFootsteps();
    } else {
      this.audio?.stopFootsteps();
    }

    this.invulnerable = Math.max(0, this.invulnerable - dt);
    this.hitFlash = Math.max(0, this.hitFlash - dt);
  }

  takeDamage(amount) {
    if (!this.active || this.invulnerable > 0) {
      return false;
    }

    this.health = Math.max(0, this.health - amount);
    this.invulnerable = 0.75;
    this.hitFlash = 0.18;

    if (this.health <= 0) {
      this.active = false;
    }

    return true;
  }

  getSpriteView() {
    const views = PLAYER_SPRITE_VIEWS[this.character.id];
    const view = views?.[this.facing];
    const image = view ? this.assets?.getImage(view.key) : null;
    return image && view ? { image, view } : null;
  }

  render(ctx, alpha = 1) {
    const { x, y } = this.getRenderPosition(alpha);
    const sprite = this.getSpriteView();
    const usingSprite = Boolean(sprite);

    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = "rgba(0, 0, 0, 0.38)";
    ctx.beginPath();
    ctx.ellipse(0, usingSprite ? 13 : 12, usingSprite ? 24 : 20, usingSprite ? 9 : 10, 0, 0, Math.PI * 2);
    ctx.fill();

    if (sprite) {
      this.drawSprite(ctx, sprite);
    } else {
      this.drawProcedural(ctx);
    }

    if (this.weapon) {
      this.weapon.renderInHand(ctx, this, usingSprite);
    }

    this.drawAim(ctx, usingSprite);

    if (this.invulnerable > 0) {
      this.drawInvulnerability(ctx, usingSprite);
    }

    ctx.restore();
    this.drawName(ctx, x, y, usingSprite);
  }

  drawSprite(ctx, { image, view }) {
    const { crop } = view;
    const width = (crop.w / crop.h) * SPRITE_HEIGHT;
    const dx = -width / 2;
    const dy = SPRITE_FEET_Y - SPRITE_HEIGHT;

    ctx.drawImage(
      image,
      crop.x,
      crop.y,
      crop.w,
      crop.h,
      dx,
      dy,
      width,
      SPRITE_HEIGHT,
    );

    if (this.hitFlash > 0) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = Math.min(1, this.hitFlash / 0.18) * 0.55;
      ctx.drawImage(
        image,
        crop.x,
        crop.y,
        crop.w,
        crop.h,
        dx,
        dy,
        width,
        SPRITE_HEIGHT,
      );
      ctx.restore();
    }
  }

  drawProcedural(ctx) {
    const bodyColor = this.hitFlash > 0 ? "#FFFFFF" : this.character.color;

    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = 3;
    ctx.strokeStyle = this.invulnerable > 0 ? "#FFFFFF" : this.character.accent;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  drawAim(ctx, usingSprite) {
    const originY = usingSprite ? -18 : 0;
    const reach = this.radius + 16;
    const startX = Math.cos(this.aimAngle) * this.radius * 0.35;
    const startY = originY + Math.sin(this.aimAngle) * this.radius * 0.35;
    const tipX = Math.cos(this.aimAngle) * reach;
    const tipY = originY + Math.sin(this.aimAngle) * reach;

    ctx.strokeStyle = usingSprite ? "rgba(234, 255, 234, 0.55)" : "#EAFFEA";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(tipX, tipY);
    ctx.stroke();

    ctx.fillStyle = "#F2C94C";
    ctx.beginPath();
    ctx.arc(tipX, tipY, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  drawInvulnerability(ctx, usingSprite) {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(
      0,
      usingSprite ? -26 : 0,
      this.radius + (usingSprite ? 13 : 6),
      this.radius + (usingSprite ? 24 : 6),
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }

  drawName(ctx, x, y, usingSprite) {
    const top = usingSprite ? SPRITE_FEET_Y - SPRITE_HEIGHT : -this.radius;

    ctx.save();
    ctx.font = "600 12px 'Segoe UI', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = "#EAFFEA";
    ctx.fillText(this.character.name, x, y + top - 10);
    ctx.restore();
  }
}
