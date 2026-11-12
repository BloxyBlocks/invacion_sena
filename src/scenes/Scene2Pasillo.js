import { getCharacter, Player } from "../entities/Player.js";
import { Zombie } from "../entities/Zombie.js";
import { FIRE_AXE } from "../entities/Weapon.js";
import { CombatSystem } from "../systems/CombatSystem.js";
import { circleCircleCollision, moveCircleWithCollisions } from "../systems/PhysicsSystem.js";
import { MUSIC_TRACKS } from "../core/AssetManifest.js";
import { HUD } from "../ui/HUD.js";
import { CutsceneOverlay } from "../ui/CutsceneOverlay.js";
import { hexToRgba, pointInRect, roundedRect } from "../ui/draw.js";
import { createGrimeLayer, createLayerCanvas, fillTexture } from "../ui/textures.js";

const PHASE = {
  INTRO: "intro",
  EXPLORE: "explore",
  WAVE: "wave",
  CLEARED: "cleared",
  EXITING: "exiting",
  COMPLETE: "complete",
};

const CABINET = {
  INTACT: "intact",
  BROKEN: "broken",
  TAKEN: "taken",
};

const CABINET_HITS_REQUIRED = 3;
const CABINET_HIT_INTERVAL = 0.55;
const CABINET_REACH = 82;
const WAVE_SIZE = 6;
const CONTACT_DAMAGE = 8;
const SCENE_LABEL = "ESCENA 2 · PASILLOS DEL SENA";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export class Scene2Pasillo {
  constructor(game) {
    this.game = game;
    this.hud = new HUD();
    this.cutscene = new CutsceneOverlay();
    this.combat = new CombatSystem();
    this.character = null;
    this.player = null;
    this.phase = PHASE.INTRO;
    this.phaseTime = 0;
    this.time = 0;
    this.finalTime = 0;
    this.fade = 0;
    this.shake = 0;
    this.groanTimer = 0;
    this.particles = [];
    this.zombies = [];
    this.spawnQueue = [];
    this.spawnTimer = 0;
    this.spawned = 0;
    this.killed = 0;
    this.selectedOption = 0;
    this.corridor = null;
    this.interior = null;
    this.leftDoor = null;
    this.rightDoor = null;
    this.exitZone = null;
    this.cabinet = null;
    this.cabinetPoint = null;
    this.cabinetState = CABINET.INTACT;
    this.cabinetHits = 0;
    this.cabinetHold = 0;
    this.cabinetAlarm = 0;
    this.obstacles = [];
    this.corridorOverlay = null;
    this.corridorLayer = null;
    this.exitOpen = false;
  }

  enter({ characterId = "zamora" } = {}) {
    this.character = getCharacter(characterId);
    this.player = new Player(this.character, this.game.assets, this.game.audio);
    this.phase = PHASE.INTRO;
    this.phaseTime = 0;
    this.time = 0;
    this.finalTime = 0;
    this.fade = 0;
    this.shake = 0;
    this.groanTimer = 1.6;
    this.particles = [];
    this.zombies = [];
    this.spawnQueue = [];
    this.spawnTimer = 0;
    this.spawned = 0;
    this.killed = 0;
    this.selectedOption = 0;
    this.cabinetState = CABINET.INTACT;
    this.cabinetHits = 0;
    this.cabinetHold = 0;
    this.cabinetAlarm = 0;
    this.exitOpen = false;

    this.layoutCorridor();

    const spawnX = this.interior.x + Math.min(120, this.interior.w * 0.12);
    const spawnY = this.interior.y + this.interior.h * 0.52;
    this.player.reset(spawnX, spawnY);
    this.player.aimAt(this.interior.x + this.interior.w, spawnY);

    this.game.audio.playMusic(MUSIC_TRACKS.horror);
    this.cutscene.play(this.getIntroBeats(), {
      sceneLabel: SCENE_LABEL,
      onComplete: () => {
        this.phase = PHASE.EXPLORE;
        this.phaseTime = 0;
      },
    });
  }

  exit() {
    this.game.audio.stopFootsteps();
  }

  resize() {
    this.layoutCorridor();
    if (this.player) {
      moveCircleWithCollisions(this.player, 0, 0, this.interior, this.obstacles);
    }
    for (const zombie of this.zombies) {
      moveCircleWithCollisions(zombie, 0, 0, this.interior, this.obstacles);
    }
  }

  layoutCorridor() {
    const width = this.game.width;
    const height = this.game.height;
    const margin = clamp(width * 0.026, 14, 42);
    const top = Math.max(96, height * 0.13);
    const bottom = clamp(height * 0.07, 48, 72);

    this.corridor = {
      x: margin,
      y: top,
      w: width - margin * 2,
      h: height - top - bottom,
    };

    const wall = clamp(Math.min(this.corridor.w, this.corridor.h) * 0.055, 16, 30);
    this.interior = {
      x: this.corridor.x + wall,
      y: this.corridor.y + wall,
      w: this.corridor.w - wall * 2,
      h: this.corridor.h - wall * 2,
    };

    const doorHeight = clamp(this.interior.h * 0.34, 82, 142);
    this.leftDoor = {
      x: this.corridor.x,
      y: this.corridor.y + this.corridor.h / 2 - doorHeight / 2,
      w: wall,
      h: doorHeight,
    };
    this.rightDoor = {
      x: this.corridor.x + this.corridor.w - wall,
      y: this.corridor.y + this.corridor.h / 2 - doorHeight / 2,
      w: wall,
      h: doorHeight,
    };

    this.exitZone = {
      x: this.interior.x + this.interior.w - 72,
      y: this.rightDoor.y + 8,
      w: 72,
      h: doorHeight - 16,
    };

    const cabinetW = clamp(this.interior.w * 0.052, 48, 66);
    const cabinetH = clamp(this.interior.h * 0.17, 56, 82);
    const cabinetCenterX = this.interior.x + this.interior.w * 0.38;
    this.cabinet = {
      x: cabinetCenterX - cabinetW / 2,
      y: this.interior.y - cabinetH * 0.52,
      w: cabinetW,
      h: cabinetH,
    };
    this.cabinetPoint = {
      x: cabinetCenterX,
      y: this.interior.y + 40,
    };

    const benchW = clamp(this.interior.w * 0.16, 108, 196);
    const benchH = clamp(this.interior.h * 0.085, 28, 42);
    this.obstacles = [
      {
        x: this.interior.x + this.interior.w * 0.12,
        y: this.interior.y + this.interior.h - benchH - 12,
        w: benchW,
        h: benchH,
      },
      {
        x: this.interior.x + this.interior.w * 0.57,
        y: this.interior.y + this.interior.h - benchH - 12,
        w: benchW * 0.78,
        h: benchH,
      },
      {
        x: this.interior.x + this.interior.w * 0.73,
        y: this.interior.y + 10,
        w: benchW * 0.62,
        h: benchH * 0.92,
      },
    ];

    if (this.player) {
      moveCircleWithCollisions(this.player, 0, 0, this.interior, this.obstacles);
    }

    this.corridorOverlay = createGrimeLayer(this.corridor.w, this.corridor.h, {
      seed: 41,
      grime: 18,
      blood: 7,
      scratches: 24,
    });
    this.buildCorridorLayer();
  }

  buildCorridorLayer() {
    if (!this.corridor) {
      this.corridorLayer = null;
      return;
    }

    const layer = createLayerCanvas(this.corridor.w, this.corridor.h);
    if (!layer) {
      this.corridorLayer = null;
      return;
    }

    const { canvas, ctx } = layer;
    ctx.save();
    ctx.translate(-this.corridor.x, -this.corridor.y);
    this.paintCorridorBase(ctx);
    for (const obstacle of this.obstacles) {
      this.drawObstacle(ctx, obstacle);
    }
    ctx.restore();

    this.corridorLayer = canvas;
  }

  paintCorridorBase(ctx) {
    const corridor = this.corridor;
    const interior = this.interior;
    const assets = this.game.assets;

    ctx.fillStyle = "#090F0C";
    ctx.fillRect(corridor.x, corridor.y, corridor.w, corridor.h);
    fillTexture(ctx, corridor, assets.getImage("wallTexture"), {
      scale: 0.6,
      alpha: 0.22,
    });

    const wallGradient = ctx.createLinearGradient(
      corridor.x,
      corridor.y,
      corridor.x,
      corridor.y + corridor.h,
    );
    wallGradient.addColorStop(0, "rgba(20, 38, 27, 0.5)");
    wallGradient.addColorStop(0.55, "rgba(10, 22, 15, 0.72)");
    wallGradient.addColorStop(1, "rgba(4, 10, 7, 0.92)");
    ctx.fillStyle = wallGradient;
    ctx.fillRect(corridor.x, corridor.y, corridor.w, corridor.h);

    ctx.fillStyle = "#0A140E";
    ctx.fillRect(interior.x, interior.y, interior.w, interior.h);
    fillTexture(ctx, interior, assets.getImage("floorTexture"), {
      scale: 0.62,
      alpha: 0.52,
    });

    const floor = ctx.createLinearGradient(
      interior.x,
      interior.y,
      interior.x,
      interior.y + interior.h,
    );
    floor.addColorStop(0, "rgba(12, 31, 21, 0.38)");
    floor.addColorStop(0.55, "rgba(7, 20, 14, 0.56)");
    floor.addColorStop(1, "rgba(3, 9, 6, 0.76)");
    ctx.fillStyle = floor;
    ctx.fillRect(interior.x, interior.y, interior.w, interior.h);

    if (this.corridorOverlay) {
      ctx.drawImage(this.corridorOverlay, corridor.x, corridor.y, corridor.w, corridor.h);
    }

    // Junta del zócalo y marco del pasillo.
    ctx.strokeStyle = "rgba(5, 9, 7, 0.9)";
    ctx.lineWidth = 3;
    ctx.strokeRect(interior.x - 1, interior.y - 1, interior.w + 2, interior.h + 2);
    ctx.strokeStyle = "rgba(201, 232, 201, 0.11)";
    ctx.lineWidth = 1;
    ctx.strokeRect(interior.x, interior.y, interior.w, interior.h);

    ctx.strokeStyle = "rgba(57, 169, 0, 0.34)";
    ctx.lineWidth = 2;
    ctx.strokeRect(corridor.x + 1, corridor.y + 1, corridor.w - 2, corridor.h - 2);

    // Señalización del pasillo.
    ctx.save();
    ctx.font = "700 10px 'Segoe UI', system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(201, 232, 201, 0.34)";
    ctx.fillText(
      "BLOQUE A · PASILLO PRINCIPAL",
      interior.x + 16,
      corridor.y + corridor.h - 9,
    );

    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(155, 225, 93, 0.4)";
    ctx.fillText("PATIO / HELISUPERFICIE →", interior.x + interior.w - 16, corridor.y + corridor.h - 9);
    ctx.restore();

    // Franja reflectiva del piso.
    ctx.save();
    ctx.strokeStyle = "rgba(201, 232, 201, 0.07)";
    ctx.lineWidth = 2;
    ctx.setLineDash([26, 20]);
    ctx.beginPath();
    ctx.moveTo(interior.x + 20, interior.y + interior.h * 0.5);
    ctx.lineTo(interior.x + interior.w - 20, interior.y + interior.h * 0.5);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  drawObstacle(ctx, obstacle) {
    const assets = this.game.assets;

    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.32)";
    ctx.beginPath();
    ctx.roundRect(obstacle.x + 4, obstacle.y + 5, obstacle.w, obstacle.h, 8);
    ctx.fill();

    roundedRect(ctx, obstacle.x, obstacle.y, obstacle.w, obstacle.h, 8);
    ctx.fillStyle = "rgba(37, 55, 35, 0.96)";
    ctx.fill();
    ctx.save();
    ctx.clip();
    fillTexture(ctx, obstacle, assets.getImage("wallTexture"), {
      scale: 0.5,
      alpha: 0.2,
      tint: { color: "rgba(20, 12, 8, 0.3)", alpha: 1 },
    });
    ctx.restore();

    roundedRect(ctx, obstacle.x, obstacle.y, obstacle.w, obstacle.h, 8);
    ctx.strokeStyle = "rgba(104, 140, 82, 0.6)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.strokeStyle = "rgba(201, 232, 201, 0.12)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(obstacle.x + 8, obstacle.y + obstacle.h - 7);
    ctx.lineTo(obstacle.x + obstacle.w - 8, obstacle.y + obstacle.h - 7);
    ctx.stroke();
    ctx.restore();
  }

  getHint() {
    if (this.cutscene.active) {
      return "";
    }

    switch (this.phase) {
      case PHASE.EXPLORE:
        return this.cabinetState === CABINET.INTACT
          ? "WASD / Flechas mover · Mantén E frente al gabinete para dar 3 golpes · ESC menú"
          : "Pulsa E para tomar el Hacha de Incendios.";
      case PHASE.WAVE:
        return "Ratón apuntar · Clic o Espacio atacar · Elimina la oleada de zombis aprendices.";
      case PHASE.CLEARED:
        return "El pasillo está despejado: cruza la salida verde hacia el patio.";
      case PHASE.EXITING:
        return "Saliendo hacia el patio del SENA...";
      default:
        return "ESC para volver al menú";
    }
  }

  update(dt) {
    this.time += dt;
    this.phaseTime += dt;
    this.hud.update(dt);
    this.combat.update(dt);
    this.shake = Math.max(0, this.shake - dt * 46);
    this.cabinetAlarm = Math.max(0, this.cabinetAlarm - dt);
    this.updateParticles(dt);

    if (this.phase === PHASE.COMPLETE) {
      this.updateComplete();
      return;
    }

    const input = this.game.input;

    if (input.consumePressed("Escape")) {
      this.game.audio.stopFootsteps();
      this.game.state.switchTo("menu", { characterId: this.character.id });
      return;
    }

    if (this.cutscene.active) {
      this.cutscene.update(dt, input);
      return;
    }

    if (this.phase === PHASE.INTRO) {
      this.phase = PHASE.EXPLORE;
      this.phaseTime = 0;
      return;
    }

    if (this.phase === PHASE.EXITING) {
      this.fade = Math.min(1, this.fade + dt / 0.6);
      if (this.fade >= 1) {
        this.phase = PHASE.COMPLETE;
        this.phaseTime = 0;
        this.finalTime = this.time;
        this.game.audio.playSuccess();
      }
      return;
    }

    this.updatePlayer(dt);

    if (this.phase === PHASE.EXPLORE) {
      this.updateCabinet(dt, input);
      return;
    }

    if (this.phase === PHASE.WAVE) {
      this.updateWave(dt, input);
      return;
    }

    if (this.phase === PHASE.CLEARED) {
      // Se siguen actualizando los cuerpos para que terminen su caída y se
      // desvanezcan antes de cruzar la salida.
      for (const zombie of this.zombies) {
        zombie.update(dt, {
          bounds: this.interior,
          obstacles: this.obstacles,
        });
      }
      this.zombies = this.zombies.filter((zombie) => zombie.active);

      if (pointInRect(this.player.x, this.player.y, this.exitZone)) {
        this.beginExit();
      }
    }
  }

  isNearCabinet() {
    if (!this.player || !this.cabinetPoint) {
      return false;
    }

    return Math.hypot(
      this.player.x - this.cabinetPoint.x,
      this.player.y - this.cabinetPoint.y,
    ) <= CABINET_REACH;
  }

  isBreakingCabinet(input) {
    return (
      this.phase === PHASE.EXPLORE &&
      this.cabinetState === CABINET.INTACT &&
      this.isNearCabinet() &&
      input.isDown("KeyE")
    );
  }

  updatePlayer(dt) {
    const input = this.game.input;
    const breaking = this.isBreakingCabinet(input);
    const direction = breaking ? { x: 0, y: 0 } : input.getMoveVector();

    this.player.update(dt, {
      direction,
      bounds: this.interior,
      obstacles: this.obstacles,
      aimX: breaking ? undefined : input.mouse.x,
      aimY: breaking ? undefined : input.mouse.y,
    });

    if (breaking) {
      this.player.aimAt(this.cabinetPoint.x, this.cabinetPoint.y);
      this.player.facing = "up";
    }
  }

  updateCabinet(dt, input) {
    const near = this.isNearCabinet();

    if (this.cabinetState === CABINET.INTACT) {
      if (near && input.isDown("KeyE")) {
        this.cabinetHold += dt;
        if (this.cabinetHold >= CABINET_HIT_INTERVAL) {
          this.cabinetHold -= CABINET_HIT_INTERVAL;
          this.hitCabinet();
        }
      } else {
        this.cabinetHold = 0;
      }
      return;
    }

    if (
      this.cabinetState === CABINET.BROKEN &&
      near &&
      input.consumePressed("KeyE", "Space")
    ) {
      this.takeAxe();
    }
  }

  hitCabinet() {
    this.cabinetHits = Math.min(CABINET_HITS_REQUIRED, this.cabinetHits + 1);
    const angle = Math.atan2(
      this.cabinetPoint.y - this.player.y,
      this.cabinetPoint.x - this.player.x,
    );

    this.combat.previewSwing({
      angle,
      range: 62,
      arc: Math.PI * 0.62,
      duration: 0.2,
      accent: "#F2C94C",
    });
    this.shake = 5;
    this.game.audio.playCabinetHit();
    this.spawnBurst(
      this.cabinetPoint.x,
      this.cabinetPoint.y - 14,
      "#C9D6E2",
      8,
      100,
      0.5,
      "fragment",
    );
    this.spawnBurst(
      this.cabinetPoint.x,
      this.cabinetPoint.y - 6,
      "#F2C94C",
      6,
      90,
      0.4,
    );

    if (this.cabinetHits >= CABINET_HITS_REQUIRED) {
      this.breakCabinet();
    }
  }

  breakCabinet() {
    this.cabinetState = CABINET.BROKEN;
    this.cabinetAlarm = 2.6;
    this.cabinetHold = 0;
    this.shake = 15;
    this.game.audio.playGlassBreak();

    this.spawnBurst(this.cabinetPoint.x, this.cabinetPoint.y - 10, "#BFE9F5", 26, 180, 0.85, "fragment");
    this.spawnBurst(this.cabinetPoint.x, this.cabinetPoint.y - 4, "#F2C94C", 12, 140, 0.6);
    this.spawnBurst(this.cabinetPoint.x, this.cabinetPoint.y + 6, "#EB5757", 10, 120, 0.55);
  }

  takeAxe() {
    if (this.cabinetState === CABINET.TAKEN) {
      return;
    }

    this.cabinetState = CABINET.TAKEN;
    this.player.equipWeapon(FIRE_AXE);
    this.game.audio.playAxePickup();
    this.shake = 4;
    this.spawnBurst(this.cabinetPoint.x, this.cabinetPoint.y, "#F2C94C", 18, 150, 0.7);
    this.spawnBurst(this.cabinetPoint.x, this.cabinetPoint.y, "#EAFFEA", 8, 90, 0.5);

    this.cutscene.play(this.getAxeBeats(), {
      sceneLabel: SCENE_LABEL,
      onComplete: () => this.startWave(),
    });
  }

  startWave() {
    this.phase = PHASE.WAVE;
    this.phaseTime = 0;
    this.spawnTimer = 0;
    this.spawned = 0;
    this.killed = 0;
    this.groanTimer = 0.8;
    this.spawnQueue = [];

    for (let index = 0; index < WAVE_SIZE; index += 1) {
      this.spawnQueue.push({
        delay: 0.55 + index * 0.85,
        side: index < 4 ? "right" : "left",
      });
    }

    this.game.audio.playWaveStart();
  }

  spawnZombie({ side = "right" } = {}) {
    const y = this.interior.y + this.interior.h * (0.28 + Math.random() * 0.44);
    const spawnX =
      side === "right"
        ? this.interior.x + this.interior.w - 20
        : this.interior.x + 20;
    const entryX =
      side === "right"
        ? this.interior.x + this.interior.w * 0.72
        : this.interior.x + this.interior.w * 0.28;
    const entryY = y + (Math.random() - 0.5) * this.interior.h * 0.16;

    const zombie = new Zombie({
      x: spawnX,
      y,
      speed: 68 + Math.random() * 10,
      maxHealth: 90,
    });
    zombie.facing = side === "right" ? Math.PI : 0;
    zombie.enterTo(entryX, entryY);

    moveCircleWithCollisions(zombie, 0, 0, this.interior, this.obstacles);
    this.zombies.push(zombie);
    this.spawned += 1;
    this.game.audio.playZombieGroan();
  }

  updateWave(dt, input) {
    this.spawnTimer += dt;

    while (
      this.spawnQueue.length > 0 &&
      this.spawnQueue[0].delay <= this.spawnTimer
    ) {
      this.spawnZombie(this.spawnQueue.shift());
    }

    const alive = this.zombies.filter((zombie) => !zombie.dead);

    for (const zombie of this.zombies) {
      zombie.update(dt, {
        target: this.player,
        bounds: this.interior,
        obstacles: this.obstacles,
        neighbors: alive,
      });
    }

    for (const zombie of alive) {
      if (circleCircleCollision(this.player, zombie)) {
        if (this.player.takeDamage(CONTACT_DAMAGE)) {
          this.game.audio.playDamage();
          this.shake = Math.max(this.shake, 6);
        }
      }
    }

    if (input.consumeClick() || input.consumePressed("Space")) {
      this.attack();
    }

    this.groanTimer -= dt;
    if (this.groanTimer <= 0 && alive.length > 0) {
      this.game.audio.playZombieGroan();
      this.groanTimer = 2.1 + Math.random() * 1.8;
    }

    this.zombies = this.zombies.filter((zombie) => zombie.active);

    if (this.player.health <= 0) {
      this.finishGame();
      return;
    }

    if (this.spawnQueue.length === 0 && this.zombies.every((zombie) => zombie.dead)) {
      this.clearWave();
    }
  }

  attack() {
    if (!this.player.hasWeapon()) {
      return;
    }

    const result = this.combat.attack({
      attacker: this.player,
      weapon: this.player.weapon,
      targets: this.zombies,
      angle: this.player.aimAngle,
    });

    if (!result) {
      return;
    }

    if (result.hits.length === 0) {
      this.game.audio.playAxeSwing();
      return;
    }

    this.game.audio.playAxeHit();
    this.shake = Math.max(this.shake, 6);

    for (const hit of result.hits) {
      this.spawnBurst(hit.x, hit.y, "#A3112A", 12, 130, 0.6);
      this.spawnBurst(hit.x, hit.y, "#F2C94C", 6, 110, 0.4);
      if (hit.killed) {
        this.killed += 1;
        this.game.audio.playZombieDeath();
        this.spawnBurst(hit.x, hit.y, "#7E9B5A", 14, 150, 0.7, "fragment");
      }
    }
  }

  clearWave() {
    if (this.phase === PHASE.CLEARED) {
      return;
    }

    this.phase = PHASE.CLEARED;
    this.phaseTime = 0;
    this.exitOpen = true;
    this.game.audio.playSuccess();
    this.cutscene.play(this.getClearedBeats(), {
      sceneLabel: SCENE_LABEL,
    });
  }

  beginExit() {
    if (this.phase === PHASE.EXITING) {
      return;
    }

    this.phase = PHASE.EXITING;
    this.phaseTime = 0;
    this.fade = 0;
    this.game.audio.stopFootsteps();
    this.game.audio.stopMusic({ fadeSeconds: 0.9 });
    this.game.audio.playUiConfirm();
  }

  finishGame() {
    this.game.audio.stopFootsteps();
    this.game.audio.playGameOver();
    this.game.state.switchTo("gameOver", {
      characterId: this.character.id,
      survived: this.time,
      scene: "scene2",
    });
  }

  restart() {
    this.game.audio.playUiConfirm();
    this.game.state.switchTo("scene2", { characterId: this.character.id });
  }

  goToMenu() {
    this.game.audio.playUiConfirm();
    this.game.state.switchTo("menu", { characterId: this.character.id });
  }

  getIntroBeats() {
    return [
      {
        tone: "character",
        text: "El salón quedó atrás. El pasillo del bloque A está en silencio... demasiado silencio.",
        duration: 4.1,
      },
      {
        tone: "narration",
        text: "Solo el zumbido de las luces de emergencia rompe la calma. Al frente, el gabinete de incendios sigue intacto.",
        duration: 5,
      },
      {
        tone: "system",
        text: "Objetivo: acércate al gabinete y MANTÉN E para dar tres golpes. Después podrás equipar el Hacha de Incendios.",
        duration: 5.4,
      },
    ];
  }

  getAxeBeats() {
    return [
      {
        tone: "system",
        text: "HACHA DE INCENDIOS equipada. El arma pesa, pero al menos ya no estás indefenso.",
        duration: 3.7,
      },
      {
        tone: "character",
        text: "El cristal roto y el golpe metálico retumbaron por todo el pasillo... algo respondió.",
        duration: 4.2,
      },
      {
        tone: "danger",
        text: "¡Oleada de zombis aprendices! Haz clic o pulsa Espacio para atacar en la dirección del ratón.",
        duration: 4.4,
      },
    ];
  }

  getClearedBeats() {
    return [
      {
        tone: "system",
        text: "Pasillo despejado. La primera oleada de zombis aprendices fue eliminada.",
        duration: 3.5,
      },
      {
        tone: "character",
        text: "La puerta del patio cedió. Si cruzo la salida, podré llegar a la helisuperficie... y al rescate.",
        duration: 4.3,
      },
    ];
  }

  spawnBurst(x, y, color, count, speed, life, kind = "spark") {
    for (let index = 0; index < count; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = speed * (0.35 + Math.random() * 0.75);
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        life: life * (0.6 + Math.random() * 0.6),
        maxLife: life,
        size: kind === "fragment" ? 3 + Math.random() * 7 : 1.5 + Math.random() * 3,
        color,
        kind,
        rotation: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 10,
      });
    }
  }

  updateParticles(dt) {
    for (const particle of this.particles) {
      particle.life -= dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vx *= Math.pow(0.06, dt);
      particle.vy *= Math.pow(0.06, dt);
      particle.rotation += particle.spin * dt;
    }

    this.particles = this.particles.filter((particle) => particle.life > 0);
  }

  render(ctx, alpha = 1) {
    const { width, height } = this.game;

    const background = ctx.createLinearGradient(0, 0, 0, height);
    background.addColorStop(0, "#040A07");
    background.addColorStop(0.5, "#07130B");
    background.addColorStop(1, "#030604");
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    if (this.shake > 0.5) {
      ctx.translate((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake);
    }

    this.drawCorridor(ctx);
    this.drawDoors(ctx);
    this.drawCabinet(ctx);

    if (this.exitOpen && this.phase !== PHASE.COMPLETE) {
      this.drawExit(ctx);
    }

    if (this.cabinetState === CABINET.BROKEN) {
      FIRE_AXE.renderPickup(
        ctx,
        this.cabinetPoint.x,
        this.cabinetPoint.y - 6,
        this.time,
      );
    }

    for (const zombie of this.zombies) {
      zombie.render(ctx, alpha);
    }

    this.player.render(ctx, alpha);
    this.combat.renderSwing(ctx, this.player, alpha, Boolean(this.player.getSpriteView()));
    this.drawParticles(ctx);
    ctx.restore();

    if (
      this.phase !== PHASE.COMPLETE &&
      this.phase !== PHASE.INTRO &&
      !this.cutscene.active
    ) {
      this.hud.render(ctx, {
        player: this.player,
        fps: this.game.fps,
        sceneLabel: SCENE_LABEL,
        hint: this.getHint(),
        weapon: this.player.hasWeapon() ? this.player.weapon.shortName : "",
        wave: this.phase === PHASE.WAVE || this.phase === PHASE.CLEARED ? 1 : 0,
        wavesTotal: 1,
        remaining:
          this.phase === PHASE.WAVE
            ? this.zombies.filter((zombie) => !zombie.dead).length +
              this.spawnQueue.length
            : this.phase === PHASE.CLEARED
              ? 0
              : null,
      });

      if (this.phase === PHASE.EXPLORE && this.isNearCabinet()) {
        this.drawCabinetPrompt(ctx);
      }
    }

    if (this.cutscene.active) {
      this.cutscene.render(ctx, {
        width,
        height,
        character: this.character,
        assets: this.game.assets,
        accent: this.character.accent,
      });
    }

    if (this.phase === PHASE.EXITING || (this.phase === PHASE.COMPLETE && this.fade < 1)) {
      ctx.fillStyle = `rgba(3, 6, 4, ${this.fade})`;
      ctx.fillRect(0, 0, width, height);
    }

    if (this.phase === PHASE.COMPLETE) {
      this.drawComplete(ctx);
    }
  }

  drawCorridor(ctx) {
    if (!this.corridorLayer) {
      this.buildCorridorLayer();
    }

    if (this.corridorLayer) {
      ctx.drawImage(
        this.corridorLayer,
        this.corridor.x,
        this.corridor.y,
        this.corridor.w,
        this.corridor.h,
      );
    }

    const interior = this.interior;
    const flicker = 0.84 + Math.sin(this.time * 6.4) * 0.08 + Math.sin(this.time * 18.3) * 0.04;
    const lights = [0.24, 0.52, 0.8];

    ctx.save();
    for (const position of lights) {
      const x = interior.x + interior.w * position;
      const y = interior.y + interior.h * 0.42;
      const glow = ctx.createRadialGradient(x, y, 8, x, y, interior.w * 0.18);
      glow.addColorStop(0, `rgba(178, 220, 188, ${0.07 * flicker})`);
      glow.addColorStop(0.55, `rgba(126, 188, 140, ${0.035 * flicker})`);
      glow.addColorStop(1, "rgba(126, 188, 140, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(x - interior.w * 0.2, y - interior.w * 0.2, interior.w * 0.4, interior.w * 0.4);
    }

    if (this.cabinetAlarm > 0 && Math.sin(this.time * 20) > 0) {
      const alarm = ctx.createRadialGradient(
        this.cabinetPoint.x,
        this.cabinetPoint.y,
        6,
        this.cabinetPoint.x,
        this.cabinetPoint.y,
        190,
      );
      alarm.addColorStop(0, "rgba(235, 87, 87, 0.28)");
      alarm.addColorStop(1, "rgba(235, 87, 87, 0)");
      ctx.fillStyle = alarm;
      ctx.fillRect(
        this.cabinetPoint.x - 190,
        this.cabinetPoint.y - 190,
        380,
        380,
      );
    }
    ctx.restore();
  }

  drawDoors(ctx) {
    this.drawDoor(ctx, this.leftDoor, {
      label: "AULA · BLOQUE A",
      open: false,
      fromLeft: true,
    });
    this.drawDoor(ctx, this.rightDoor, {
      label: this.exitOpen ? "PATIO DEL SENA" : "SALIDA BLOQUEADA",
      open: this.exitOpen,
      fromLeft: false,
    });
  }

  drawDoor(ctx, door, { label = "", open = false, fromLeft = false } = {}) {
    ctx.save();
    ctx.fillStyle = "#040806";
    ctx.fillRect(door.x - 2, door.y, door.w + 4, door.h);

    const opening = ctx.createLinearGradient(
      door.x,
      door.y,
      door.x + door.w,
      door.y,
    );
    opening.addColorStop(0, open ? "rgba(30, 58, 38, 0.95)" : "rgba(22, 34, 26, 0.95)");
    opening.addColorStop(1, open ? "rgba(7, 16, 10, 0.95)" : "rgba(6, 12, 8, 0.95)");
    ctx.fillStyle = opening;
    ctx.fillRect(door.x, door.y + 3, door.w, door.h - 6);

    ctx.strokeStyle = open ? "rgba(155, 225, 93, 0.7)" : "rgba(201, 232, 201, 0.32)";
    ctx.lineWidth = 2;
    ctx.strokeRect(door.x - 2, door.y - 2, door.w + 4, door.h + 4);

    if (!open) {
      const panel = ctx.createLinearGradient(door.x, door.y, door.x + door.w, door.y);
      panel.addColorStop(0, "#21382A");
      panel.addColorStop(1, "#16241B");
      ctx.fillStyle = panel;
      ctx.fillRect(door.x + 2, door.y + 4, door.w - 4, door.h - 8);

      ctx.strokeStyle = "rgba(155, 180, 150, 0.28)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(door.x + 4, door.y + 6, door.w - 8, door.h / 2 - 9);
      ctx.strokeRect(door.x + 4, door.y + door.h / 2 + 3, door.w - 8, door.h / 2 - 9);

      ctx.fillStyle = "rgba(235, 87, 87, 0.75)";
      ctx.beginPath();
      ctx.arc(door.x + door.w / 2, door.y + door.h / 2, 2.6, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = `rgba(155, 225, 93, ${0.35 + Math.sin(this.time * 5) * 0.12})`;
      ctx.beginPath();
      ctx.arc(door.x + door.w / 2, door.y + 14, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.font = "700 9px 'Segoe UI', system-ui, sans-serif";
    ctx.textAlign = fromLeft ? "left" : "right";
    ctx.textBaseline = fromLeft ? "top" : "bottom";
    ctx.fillStyle = open ? "rgba(199, 240, 170, 0.85)" : "rgba(201, 232, 201, 0.4)";
    ctx.fillText(
      label,
      fromLeft
        ? Math.max(door.x, 8)
        : Math.min(door.x + door.w, this.game.width - 8),
      fromLeft ? door.y + door.h + 8 : door.y - 8,
    );
    ctx.restore();
  }

  drawCabinet(ctx) {
    const cabinet = this.cabinet;
    const centerX = cabinet.x + cabinet.w / 2;
    const broken = this.cabinetState !== CABINET.INTACT;
    const taken = this.cabinetState === CABINET.TAKEN;

    ctx.save();

    // Sombra y cuerpo metálico del gabinete.
    ctx.fillStyle = "rgba(0, 0, 0, 0.36)";
    ctx.beginPath();
    ctx.roundRect(cabinet.x + 4, cabinet.y + 5, cabinet.w, cabinet.h, 8);
    ctx.fill();

    const body = ctx.createLinearGradient(
      cabinet.x,
      cabinet.y,
      cabinet.x,
      cabinet.y + cabinet.h,
    );
    body.addColorStop(0, broken ? "#8E1A20" : "#B3262C");
    body.addColorStop(0.55, broken ? "#741318" : "#961C23");
    body.addColorStop(1, "#560C11");
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.roundRect(cabinet.x, cabinet.y, cabinet.w, cabinet.h, 8);
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 214, 214, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Etiqueta blanca.
    ctx.fillStyle = "rgba(245, 249, 246, 0.9)";
    ctx.fillRect(cabinet.x + 6, cabinet.y + cabinet.h * 0.08, cabinet.w - 12, 13);
    ctx.fillStyle = "#7C1116";
    ctx.font = "800 8px 'Segoe UI', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("INCENDIOS", centerX, cabinet.y + cabinet.h * 0.08 + 7);

    // Ventana de vidrio.
    const glass = {
      x: cabinet.x + 7,
      y: cabinet.y + cabinet.h * 0.3,
      w: cabinet.w - 14,
      h: cabinet.h * 0.52,
    };

    ctx.fillStyle = broken ? "rgba(8, 15, 11, 0.96)" : "rgba(45, 74, 74, 0.72)";
    ctx.beginPath();
    ctx.roundRect(glass.x, glass.y, glass.w, glass.h, 4);
    ctx.fill();
    ctx.strokeStyle = "rgba(226, 244, 246, 0.5)";
    ctx.lineWidth = 1.3;
    ctx.stroke();

    if (!taken && !broken) {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(glass.x, glass.y, glass.w, glass.h, 4);
      ctx.clip();
      ctx.translate(centerX - 4, glass.y + glass.h * 0.52);
      ctx.scale(0.55, 0.55);
      FIRE_AXE.renderPickup(ctx, 0, 0, this.time);
      ctx.restore();
    }

    // Manguera enrollada.
    ctx.strokeStyle = "rgba(235, 245, 235, 0.42)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cabinet.x + cabinet.w * 0.22, cabinet.y + cabinet.h * 0.47, 6, 0, Math.PI * 2);
    ctx.stroke();

    // Grietas acumuladas por cada golpe.
    const crackSets = [
      [
        [cabinet.x + cabinet.w * 0.32, glass.y + 4],
        [cabinet.x + cabinet.w * 0.48, glass.y + glass.h * 0.55],
        [cabinet.x + cabinet.w * 0.4, glass.y + glass.h - 4],
      ],
      [
        [cabinet.x + cabinet.w * 0.68, glass.y + 2],
        [cabinet.x + cabinet.w * 0.56, glass.y + glass.h * 0.4],
        [cabinet.x + cabinet.w * 0.7, glass.y + glass.h * 0.7],
      ],
      [
        [cabinet.x + cabinet.w * 0.2, glass.y + glass.h * 0.3],
        [cabinet.x + cabinet.w * 0.5, glass.y + glass.h * 0.5],
        [cabinet.x + cabinet.w * 0.82, glass.y + glass.h * 0.28],
      ],
    ];

    ctx.strokeStyle = "rgba(232, 248, 250, 0.72)";
    ctx.lineWidth = 1.2;
    for (let index = 0; index < Math.min(this.cabinetHits, crackSets.length); index += 1) {
      const points = crackSets[index];
      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);
      for (let point = 1; point < points.length; point += 1) {
        ctx.lineTo(points[point][0], points[point][1]);
      }
      ctx.stroke();
    }

    // Puerta abierta y vidrios rotos.
    if (broken) {
      ctx.save();
      ctx.translate(cabinet.x + cabinet.w, cabinet.y + cabinet.h * 0.5);
      ctx.rotate(-0.38);
      ctx.fillStyle = "rgba(116, 19, 24, 0.96)";
      ctx.beginPath();
      ctx.roundRect(0, -cabinet.h * 0.46, cabinet.w * 0.9, cabinet.h * 0.92, 5);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 214, 214, 0.32)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = "rgba(191, 233, 245, 0.55)";
      for (let index = 0; index < 6; index += 1) {
        const shardX = cabinet.x + 6 + ((index * 13) % Math.max(1, cabinet.w - 12));
        ctx.beginPath();
        ctx.moveTo(shardX, cabinet.y + cabinet.h - 4);
        ctx.lineTo(shardX + 4, cabinet.y + cabinet.h - 12 - (index % 3) * 3);
        ctx.lineTo(shardX + 8, cabinet.y + cabinet.h - 4);
        ctx.closePath();
        ctx.fill();
      }
    }

    ctx.font = "700 9px 'Segoe UI', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = "rgba(255, 214, 214, 0.62)";
    ctx.fillText("GABINETE DE INCENDIOS", centerX, cabinet.y - 8);
    ctx.restore();
  }

  drawExit(ctx) {
    const zone = this.exitZone;
    const pulse = 0.5 + Math.sin(this.time * 5) * 0.5;
    const centerY = zone.y + zone.h / 2;

    ctx.save();
    ctx.beginPath();
    ctx.rect(this.interior.x, this.interior.y, this.interior.w, this.interior.h);
    ctx.clip();

    const glow = ctx.createRadialGradient(
      zone.x + zone.w,
      centerY,
      4,
      zone.x + zone.w,
      centerY,
      zone.w * 2.8,
    );
    glow.addColorStop(0, `rgba(155, 225, 93, ${0.24 + pulse * 0.14})`);
    glow.addColorStop(1, "rgba(155, 225, 93, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(zone.x - zone.w, zone.y - 34, zone.w * 3.6, zone.h + 68);

    ctx.fillStyle = `rgba(155, 225, 93, ${0.08 + pulse * 0.05})`;
    ctx.beginPath();
    ctx.roundRect(zone.x, zone.y, zone.w, zone.h, 10);
    ctx.fill();
    ctx.strokeStyle = `rgba(155, 225, 93, ${0.45 + pulse * 0.35})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 7]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = `rgba(155, 225, 93, ${0.55 + pulse * 0.4})`;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    for (let index = 0; index < 2; index += 1) {
      const offset = pulse * 4 + index * 9;
      ctx.beginPath();
      ctx.moveTo(zone.x + 20 + offset, centerY - 10);
      ctx.lineTo(zone.x + 30 + offset, centerY);
      ctx.lineTo(zone.x + 20 + offset, centerY + 10);
      ctx.stroke();
    }

    ctx.font = "700 10px 'Segoe UI', system-ui, sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillStyle = `rgba(199, 240, 170, ${0.65 + pulse * 0.3})`;
    ctx.fillText("SALIDA AL PATIO", zone.x - 10, centerY);
    ctx.restore();
  }

  drawCabinetPrompt(ctx) {
    const cabinet = this.cabinet;
    const intact = this.cabinetState === CABINET.INTACT;
    const boxW = intact ? 262 : 238;
    const boxH = intact ? 66 : 50;
    const x = clamp(cabinet.x + cabinet.w / 2 - boxW / 2, 18, this.game.width - boxW - 18);
    const y = clamp(cabinet.y + cabinet.h + 24, 96, this.game.height - boxH - 96);
    const pulse = 0.55 + Math.sin(this.time * 6) * 0.35;

    ctx.save();
    roundedRect(ctx, x, y, boxW, boxH, 12);
    ctx.fillStyle = "rgba(7, 18, 12, 0.94)";
    ctx.fill();
    ctx.strokeStyle = hexToRgba("#F2C94C", 0.45 + pulse * 0.45);
    ctx.lineWidth = 2;
    ctx.stroke();

    if (intact) {
      ctx.font = "800 11px 'Segoe UI', system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#F2C94C";
      ctx.fillText("MANTÉN E PARA GOLPEAR", x + 16, y + 18);

      ctx.font = "700 10px 'Segoe UI', system-ui, sans-serif";
      ctx.textAlign = "right";
      ctx.fillStyle = "rgba(234, 255, 234, 0.82)";
      ctx.fillText(
        `GOLPES ${this.cabinetHits} / ${CABINET_HITS_REQUIRED}`,
        x + boxW - 16,
        y + 18,
      );

      const barX = x + 16;
      const barW = boxW - 32;
      const barY = y + 34;
      const progress = Math.min(
        1,
        (this.cabinetHits + this.cabinetHold / CABINET_HIT_INTERVAL) /
          CABINET_HITS_REQUIRED,
      );
      ctx.fillStyle = "rgba(255, 255, 255, 0.09)";
      ctx.beginPath();
      ctx.roundRect(barX, barY, barW, 9, 4.5);
      ctx.fill();
      ctx.fillStyle = "#F2C94C";
      ctx.beginPath();
      ctx.roundRect(barX, barY, Math.max(4, barW * progress), 9, 4.5);
      ctx.fill();

      ctx.font = "500 9px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = "rgba(201, 232, 201, 0.62)";
      ctx.textAlign = "left";
      ctx.fillText(
        this.cabinetHold > 0
          ? "Sigue presionando E..."
          : "Acércate y mantén la tecla E.",
        x + 16,
        y + 55,
      );
    } else {
      ctx.font = "800 12px 'Segoe UI', system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#EAFFEA";
      ctx.fillText("E · TOMAR HACHA DE INCENDIOS", x + boxW / 2, y + 26);
    }
    ctx.restore();
  }

  drawParticles(ctx) {
    for (const particle of this.particles) {
      const alpha = Math.max(0, Math.min(1, particle.life / particle.maxLife));
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(particle.x, particle.y);

      if (particle.kind === "fragment") {
        ctx.rotate(particle.rotation);
        ctx.fillStyle = particle.color;
        ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size * 0.7);
      } else {
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  getCompleteLayout() {
    const width = this.game.width;
    const height = this.game.height;
    const panelW = Math.min(580, width * 0.88);
    const panelH = Math.min(340, height * 0.66);
    const panelX = (width - panelW) / 2;
    const panelY = (height - panelH) / 2;
    const buttonW = panelW - 64;
    const buttonH = height < 640 ? 40 : 46;
    const firstY = panelY + panelH - buttonH * 2 - 46;

    return {
      width,
      height,
      panel: { x: panelX, y: panelY, w: panelW, h: panelH },
      buttons: [
        {
          id: "restart",
          label: "REPETIR ESCENA",
          shortcut: "R",
          x: panelX + 32,
          y: firstY,
          w: buttonW,
          h: buttonH,
        },
        {
          id: "menu",
          label: "VOLVER AL MENÚ",
          shortcut: "M",
          x: panelX + 32,
          y: firstY + buttonH + 10,
          w: buttonW,
          h: buttonH,
        },
      ],
    };
  }

  updateComplete() {
    const input = this.game.input;
    const layout = this.getCompleteLayout();

    let move = 0;
    if (input.consumePressed("ArrowUp", "ArrowLeft", "KeyW", "KeyA")) {
      move = -1;
    } else if (input.consumePressed("ArrowDown", "ArrowRight", "KeyS", "KeyD")) {
      move = 1;
    }

    if (move !== 0) {
      this.selectedOption =
        (this.selectedOption + move + layout.buttons.length) % layout.buttons.length;
      this.game.audio.playUiMove();
    }

    if (input.consumePressed("KeyR")) {
      this.restart();
      return;
    }

    if (input.consumePressed("KeyM", "Escape")) {
      this.goToMenu();
      return;
    }

    if (input.consumePressed("Enter", "Space")) {
      if (this.selectedOption === 0) {
        this.restart();
      } else {
        this.goToMenu();
      }
      return;
    }

    if (input.consumeClick()) {
      const { mouse } = input;
      const clicked = layout.buttons.findIndex((button) =>
        pointInRect(mouse.x, mouse.y, button),
      );
      if (clicked >= 0) {
        this.selectedOption = clicked;
        if (clicked === 0) {
          this.restart();
        } else {
          this.goToMenu();
        }
      }
    }
  }

  drawComplete(ctx) {
    const layout = this.getCompleteLayout();
    const { width, height } = layout;
    const panel = layout.panel;

    ctx.save();
    ctx.fillStyle = "rgba(3, 6, 4, 0.82)";
    ctx.fillRect(0, 0, width, height);

    roundedRect(ctx, panel.x, panel.y, panel.w, panel.h, 18);
    ctx.fillStyle = "rgba(9, 22, 14, 0.98)";
    ctx.fill();
    ctx.strokeStyle = "rgba(57, 169, 0, 0.65)";
    ctx.lineWidth = 2;
    ctx.stroke();

    const centerX = width / 2;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.font = "800 12px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "#9BE15D";
    ctx.fillText("SPRINT I3 · ESCENA 2", centerX, panel.y + 30);

    ctx.font = `800 ${clamp(panel.w * 0.054, 24, 34)}px 'Segoe UI', system-ui, sans-serif`;
    ctx.fillStyle = "#EAFFEA";
    ctx.fillText("PASILLO DESPEJADO", centerX, panel.y + 68);

    ctx.font = "500 13px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(201, 232, 201, 0.82)";
    ctx.fillText(
      "El gabinete de incendios y la primera oleada quedaron superados.",
      centerX,
      panel.y + 98,
    );

    ctx.font = "600 12px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(242, 201, 76, 0.9)";
    ctx.fillText(
      "La helisuperficie del SENA continúa en el Sprint I4.",
      centerX,
      panel.y + 122,
    );

    ctx.font = "500 11px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(201, 232, 201, 0.62)";
    ctx.fillText(
      `Personaje: ${this.character.name}  ·  Tiempo: ${this.finalTime.toFixed(1)} s  ·  Zombis: ${this.killed}  ·  Golpes: ${CABINET_HITS_REQUIRED}`,
      centerX,
      panel.y + 150,
    );

    layout.buttons.forEach((button, index) => {
      this.drawCompleteButton(ctx, button, index === this.selectedOption);
    });

    ctx.font = "500 10px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(201, 232, 201, 0.45)";
    ctx.fillText(
      "↑ ↓ elegir · Enter confirmar · R repetir · M menú",
      centerX,
      panel.y + panel.h - 14,
    );
    ctx.restore();
  }

  drawCompleteButton(ctx, button, selected) {
    const hovered = pointInRect(
      this.game.input.mouse.x,
      this.game.input.mouse.y,
      button,
    );

    ctx.save();
    roundedRect(ctx, button.x, button.y, button.w, button.h, button.h / 2);
    ctx.fillStyle = selected
      ? "rgba(57, 169, 0, 0.24)"
      : hovered
        ? "rgba(255, 255, 255, 0.06)"
        : "rgba(7, 18, 12, 0.85)";
    ctx.fill();
    ctx.strokeStyle = selected ? "#9BE15D" : "rgba(201, 232, 201, 0.22)";
    ctx.lineWidth = selected ? 2 : 1.5;
    ctx.stroke();

    ctx.font = "700 13px 'Segoe UI', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = selected ? "#EAFFEA" : "rgba(201, 232, 201, 0.8)";
    ctx.fillText(button.label, button.x + button.w / 2, button.y + button.h / 2);

    const badgeW = 24;
    const badgeH = 20;
    const badgeX = button.x + button.w - 38;
    const badgeY = button.y + button.h / 2 - badgeH / 2;
    roundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 6);
    ctx.fillStyle = selected ? hexToRgba("#9BE15D", 0.3) : "rgba(255, 255, 255, 0.07)";
    ctx.fill();
    ctx.font = "700 9px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = selected ? "#EAFFEA" : "rgba(201, 232, 201, 0.55)";
    ctx.fillText(button.shortcut, badgeX + badgeW / 2, badgeY + badgeH / 2);
    ctx.restore();
  }
}
