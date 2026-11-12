import { CHARACTERS, getCharacter, Player } from "../entities/Player.js";
import { Zombie } from "../entities/Zombie.js";
import { KeyboardProjectile } from "../entities/KeyboardProjectile.js";
import { MUSIC_TRACKS } from "../core/AssetManifest.js";
import { moveCircleWithCollisions } from "../systems/PhysicsSystem.js";
import { HUD } from "../ui/HUD.js";
import { CutsceneOverlay } from "../ui/CutsceneOverlay.js";
import { hexToRgba, pointInRect, roundedRect } from "../ui/draw.js";
import { createGrimeLayer, createLayerCanvas, fillTexture } from "../ui/textures.js";

const PHASE = {
  INTRO: "intro",
  TIMESKIP: "timeskip",
  DEPARTURE: "departure",
  SCREAM: "scream",
  BREACH: "breach",
  THREAT: "threat",
  KNOCKOUT: "knockout",
  FREE: "free",
  EXITING: "exiting",
  COMPLETE: "complete",
};

const ARRIVAL_DURATION = 1.55;
const TIMESKIP_DURATION = 2.9;
const SCREAM_DELAY = 0.55;
const BREACH_DURATION = 1.5;
const KNOCKOUT_DURATION = 1.7;
const SCENE_LABEL = "ESCENA 1 · AMBIENTE DE PROGRAMACIÓN";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export class Scene1Ambiente {
  constructor(game) {
    this.game = game;
    this.hud = new HUD();
    this.cutscene = new CutsceneOverlay();
    this.character = null;
    this.player = null;
    this.zombie = null;
    this.projectile = null;
    this.phase = PHASE.INTRO;
    this.phaseTime = 0;
    this.time = 0;
    this.throws = 0;
    this.knockouts = 0;
    this.exitOpen = false;
    this.fade = 0;
    this.shake = 0;
    this.groanTimer = 0;
    this.screamFlash = 0;
    this.particles = [];
    this.droppedKeyboards = [];
    this.room = null;
    this.interior = null;
    this.roomOverlay = null;
    this.roomLayer = null;
    this.desks = [];
    this.door = null;
    this.exitZone = null;
    this.selectedOption = 0;
    this.teacherDesk = null;
    this.playerSeat = null;
    this.classmates = [];
    this.instructor = null;
    this.arrivalStart = null;
    this.arrivalTarget = null;
    this.arrivalDone = false;
    this.introCutsceneStarted = false;
    this.screamCutsceneStarted = false;
    this.screamTimer = 0;
    this.departureClosing = false;
    this.doorClosed = false;
  }

  enter({ characterId = "zamora" } = {}) {
    this.character = getCharacter(characterId);
    this.player = new Player(this.character, this.game.assets, this.game.audio);
    this.zombie = null;
    this.projectile = null;
    this.phase = PHASE.INTRO;
    this.phaseTime = 0;
    this.time = 0;
    this.throws = 0;
    this.knockouts = 0;
    this.exitOpen = false;
    this.fade = 0;
    this.shake = 0;
    this.finalTime = 0;
    this.groanTimer = 1.2;
    this.screamFlash = 0;
    this.particles = [];
    this.droppedKeyboards = [];
    this.selectedOption = 0;
    this.arrivalDone = false;
    this.introCutsceneStarted = false;
    this.screamCutsceneStarted = false;
    this.screamTimer = 0;
    this.departureClosing = false;
    this.doorClosed = false;
    this.cutscene.play([], {});

    this.layoutRoom();
    this.setupClassroom();

    const door = this.getDoorCenter();
    const spawnX = this.interior.x + this.interior.w - 30;
    const spawnY = door.y;
    this.player.reset(spawnX, spawnY);
    this.player.facing = "left";
    this.player.aimAngle = Math.PI;
    this.arrivalStart = { x: spawnX, y: spawnY };
    this.arrivalTarget = this.playerSeat
      ? { x: this.playerSeat.x, y: this.playerSeat.y }
      : { x: this.interior.x + this.interior.w * 0.4, y: this.interior.y + this.interior.h * 0.6 };
    this.game.audio.playMusic(MUSIC_TRACKS.calm);
  }

  exit() {
    this.game.audio.stopFootsteps();
  }

  resize() {
    this.layoutRoom();
    this.setupClassroom();
    if (this.player) {
      moveCircleWithCollisions(this.player, 0, 0, this.interior, this.desks);
    }
  }

  layoutRoom() {
    const width = this.game.width;
    const height = this.game.height;
    const margin = clamp(width * 0.045, 18, 54);
    const top = Math.max(108, height * 0.145);
    const bottom = clamp(height * 0.09, 56, 84);

    this.room = {
      x: margin,
      y: top,
      w: width - margin * 2,
      h: height - top - bottom,
    };

    const wall = clamp(Math.min(this.room.w, this.room.h) * 0.06, 18, 32);
    this.interior = {
      x: this.room.x + wall,
      y: this.room.y + wall,
      w: this.room.w - wall * 2,
      h: this.room.h - wall * 2,
    };

    const doorHeight = clamp(this.interior.h * 0.26, 72, 112);
    this.door = {
      x: this.room.x + this.room.w - wall,
      y: this.room.y + this.room.h / 2 - doorHeight / 2,
      w: wall,
      h: doorHeight,
    };

    this.exitZone = {
      x: this.interior.x + this.interior.w - 64,
      y: this.door.y + 6,
      w: 64,
      h: doorHeight - 12,
    };

    this.desks = [];
    const deskW = clamp(this.interior.w * 0.135, 74, 146);
    const deskH = clamp(this.interior.h * 0.17, 44, 74);
    const columns = [0.17, 0.39, 0.61];
    const rows = [0.32, 0.74];

    for (const row of rows) {
      for (const column of columns) {
        this.desks.push({
          x: this.interior.x + this.interior.w * column - deskW / 2,
          y: this.interior.y + this.interior.h * row - deskH / 2,
          w: deskW,
          h: deskH,
        });
      }
    }

    const teacherW = clamp(this.interior.w * 0.15, 92, 150);
    const teacherH = clamp(this.interior.h * 0.12, 38, 58);
    this.teacherDesk = {
      x: this.interior.x + this.interior.w * 0.57 - teacherW / 2,
      y: this.interior.y + this.interior.h * 0.19 - teacherH / 2,
      w: teacherW,
      h: teacherH,
    };

    const playerDesk = this.desks[4] ?? this.desks[0];
    this.playerSeat = playerDesk
      ? {
          x: playerDesk.x + playerDesk.w / 2,
          y: playerDesk.y + playerDesk.h + 18,
        }
      : {
          x: this.interior.x + this.interior.w * 0.5,
          y: this.interior.y + this.interior.h * 0.7,
        };

    if (this.player) {
      moveCircleWithCollisions(this.player, 0, 0, this.interior, this.desks);
    }
    if (this.zombie) {
      moveCircleWithCollisions(this.zombie, 0, 0, this.interior, this.desks);
    }

    this.roomOverlay = createGrimeLayer(this.room.w, this.room.h, {
      seed: 11,
      grime: 18,
      blood: 7,
      scratches: 22,
    });
    this.buildRoomLayer();
  }

  /**
   * Ubica a los otros aprendices en sus puestos y al instructor en su
   * escritorio. Son NPC decorativos: no participan en colisiones ni combate.
   */
  setupClassroom() {
    if (!this.character || !this.interior) {
      return;
    }

    const others = CHARACTERS.filter((character) => character.id !== this.character.id);
    const seatIndices = [0, 2, 5];
    this.classmates = others.map((character, index) => {
      const desk = this.desks[seatIndices[index] ?? index] ?? this.desks[0];
      const x = desk ? desk.x + desk.w / 2 : this.interior.x + this.interior.w * 0.3;
      const y = desk ? desk.y - 6 : this.interior.y + this.interior.h * 0.35;
      return {
        character,
        name: character.name,
        color: character.color,
        accent: character.accent,
        radius: 12,
        x,
        y,
        prevX: x,
        prevY: y,
        homeX: x,
        homeY: y,
        delay: index * 0.12,
        leaving: false,
        gone: false,
        phase: index * 1.7,
      };
    });

    const teacher = this.teacherDesk;
    const instructorX = teacher
      ? teacher.x + teacher.w / 2
      : this.interior.x + this.interior.w * 0.57;
    const instructorY = teacher
      ? teacher.y - 10
      : this.interior.y + this.interior.h * 0.16;
    this.instructor = {
      name: "Instructor",
      color: "#3F6B8A",
      accent: "#C9D6E2",
      radius: 14,
      x: instructorX,
      y: instructorY,
      prevX: instructorX,
      prevY: instructorY,
      homeX: instructorX,
      homeY: instructorY,
      delay: 0.45,
      leaving: false,
      gone: false,
      phase: 0.8,
      instructor: true,
    };
  }

  /**
   * Pre-renderiza pared, piso, suciedad, mobiliario y pizarra. Solo la luz
   * parpadeante y las entidades se dibujan en cada fotograma.
   */
  buildRoomLayer() {
    if (!this.room) {
      return;
    }

    const layer = createLayerCanvas(this.room.w, this.room.h);
    if (!layer) {
      this.roomLayer = null;
      return;
    }

    const { canvas, ctx } = layer;
    ctx.save();
    ctx.translate(-this.room.x, -this.room.y);
    this.paintRoomBase(ctx);
    this.drawWhiteboard(ctx);
    this.drawClock(ctx);
    if (this.teacherDesk) {
      this.drawDesk(ctx, this.teacherDesk);
    }
    for (const desk of this.desks) {
      this.drawDesk(ctx, desk);
    }
    ctx.restore();

    this.roomLayer = canvas;
  }

  getDoorCenter() {
    return {
      x: this.door.x + this.door.w / 2,
      y: this.door.y + this.door.h / 2,
    };
  }

  update(dt) {
    this.time += dt;
    this.phaseTime += dt;
    this.hud.update(dt);
    this.shake = Math.max(0, this.shake - dt * 42);
    this.screamFlash = Math.max(0, this.screamFlash - dt * 2.2);
    this.updateParticles(dt);

    if (this.phase === PHASE.COMPLETE) {
      this.updateComplete();
      return;
    }

    const input = this.game.input;

    if (input.consumePressed("Escape")) {
      this.game.state.switchTo("menu", { characterId: this.character.id });
      return;
    }

    if (this.cutscene.active) {
      this.cutscene.update(dt, input);
      return;
    }

    if (this.phase === PHASE.INTRO) {
      if (!this.arrivalDone) {
        this.updateArrival(dt);
        return;
      }
      if (!this.introCutsceneStarted) {
        this.beginProfessorCutscene();
      }
      return;
    }

    if (this.phase === PHASE.TIMESKIP) {
      if (this.phaseTime >= TIMESKIP_DURATION) {
        this.beginDeparture();
      }
      return;
    }

    if (this.phase === PHASE.DEPARTURE) {
      this.updateDeparture(dt);
      return;
    }

    if (this.phase === PHASE.SCREAM) {
      this.updateScream(dt);
      return;
    }

    if (this.phase === PHASE.BREACH) {
      this.zombie?.update(dt, { target: this.player });
      if (this.phaseTime >= BREACH_DURATION) {
        this.beginThreat();
      }
      return;
    }

    if (this.phase === PHASE.EXITING) {
      this.fade = Math.min(1, this.fade + dt / 0.55);
      if (this.fade >= 1) {
        // La Escena 2 arranca con su propia cinemática de pasillo.
        this.game.state.switchTo("scene2", { characterId: this.character.id });
      }
      return;
    }

    this.updatePlayer(dt);

    if (this.phase === PHASE.THREAT) {
      this.zombie.update(dt, {
        target: this.player,
        bounds: this.interior,
        obstacles: this.desks,
      });

      this.groanTimer -= dt;
      if (this.groanTimer <= 0) {
        this.game.audio.playZombieGroan();
        this.groanTimer = 2.4 + Math.random() * 1.6;
      }

      if (!this.projectile && input.consumePressed("KeyE", "Space")) {
        this.throwKeyboard();
      }

      if (this.projectile) {
        this.projectile.update(dt, this.zombie);
        if (this.projectile.hits(this.zombie)) {
          this.hitZombie();
        } else if (!this.projectile.alive) {
          this.projectile = null;
        }
      }
      return;
    }

    if (this.phase === PHASE.KNOCKOUT) {
      this.zombie.update(dt, {
        target: this.player,
        bounds: this.interior,
        obstacles: this.desks,
      });

      if (this.phaseTime >= KNOCKOUT_DURATION) {
        this.phase = PHASE.FREE;
        this.phaseTime = 0;
        this.exitOpen = true;
        this.game.audio.playUiConfirm();
      }
      return;
    }

    if (this.phase === PHASE.FREE) {
      this.zombie.update(dt, {
        target: this.player,
        bounds: this.interior,
        obstacles: this.desks,
      });

      if (pointInRect(this.player.x, this.player.y, this.exitZone)) {
        this.beginExit();
      }
    }
  }

  updatePlayer(dt) {
    const input = this.game.input;
    this.player.update(dt, {
      direction: input.getMoveVector(),
      bounds: this.interior,
      obstacles: this.desks,
      aimX: input.mouse.x,
      aimY: input.mouse.y,
    });
  }

  updateArrival(dt) {
    const target = this.arrivalTarget ?? this.playerSeat;
    const start = this.arrivalStart;
    if (!target || !start) {
      this.arrivalDone = true;
      return;
    }

    const t = clamp(this.phaseTime / ARRIVAL_DURATION, 0, 1);
    const ease = t * t * (3 - 2 * t);
    this.player.prevX = this.player.x;
    this.player.prevY = this.player.y;
    this.player.x = start.x + (target.x - start.x) * ease;
    this.player.y = start.y + (target.y - start.y) * ease;
    this.player.facing = target.x >= start.x ? "right" : "left";
    this.player.aimAngle = target.x >= start.x ? 0 : Math.PI;

    if (t >= 1) {
      this.arrivalDone = true;
      this.player.facing = "up";
      this.player.aimAngle = -Math.PI / 2;
      this.player.prevX = this.player.x;
      this.player.prevY = this.player.y;
      this.doorClosed = true;
      this.game.audio.playDoorClose();
    }
  }

  beginProfessorCutscene() {
    this.introCutsceneStarted = true;
    this.cutscene.play(
      [
        {
          tone: "narration",
          text: "Entras al ambiente de programación. Tus compañeros ya están en sus puestos y el instructor espera en su escritorio.",
          duration: 4.6,
        },
        {
          tone: "character",
          speaker: "Profesor",
          portrait: "instructor",
          text: "Bueno, empecemos. Hoy vamos a ver los principios SOLID...",
          duration: 5.4,
        },
      ],
      {
        sceneLabel: SCENE_LABEL,
        onComplete: () => this.beginTimeSkip(),
      },
    );
  }

  beginTimeSkip() {
    this.phase = PHASE.TIMESKIP;
    this.phaseTime = 0;
    this.shake = 0;
    this.screamFlash = 0;
  }

  beginDeparture() {
    this.phase = PHASE.DEPARTURE;
    this.phaseTime = 0;
    this.doorClosed = false;
    this.departureClosing = false;
    this.screamTimer = 0;
    this.game.audio.playDoorOpen();

    for (const npc of [...this.classmates, this.instructor]) {
      npc.leaving = true;
      npc.gone = false;
      npc.prevX = npc.x;
      npc.prevY = npc.y;
    }
  }

  updateDeparture(dt) {
    const door = this.getDoorCenter();
    const npcs = [this.instructor, ...this.classmates].filter(Boolean);

    npcs.forEach((npc, index) => {
      if (npc.gone || this.phaseTime < npc.delay) {
        return;
      }

      const targetX = door.x + this.door.w * 0.5;
      const targetY = door.y + this.door.h * 0.5 + (index - 1.5) * 5;
      const dx = targetX - npc.x;
      const dy = targetY - npc.y;
      const distance = Math.hypot(dx, dy) || 1;
      const step = 95 * dt;

      npc.prevX = npc.x;
      npc.prevY = npc.y;
      npc.facing = Math.atan2(dy, dx);
      if (distance <= step + 4) {
        npc.x = targetX;
        npc.y = targetY;
        npc.gone = true;
      } else {
        npc.x += (dx / distance) * step;
        npc.y += (dy / distance) * step;
      }
    });

    if (!this.departureClosing && npcs.every((npc) => npc.gone)) {
      this.departureClosing = true;
      this.doorClosed = true;
      this.screamTimer = 0.65;
      this.game.audio.playDoorClose();
    }

    if (this.departureClosing) {
      this.screamTimer -= dt;
      if (this.screamTimer <= 0) {
        this.beginScream();
      }
    }
  }

  beginScream() {
    this.phase = PHASE.SCREAM;
    this.phaseTime = 0;
    this.shake = 18;
    this.screamFlash = 1;
    this.screamCutsceneStarted = false;
    this.screamTimer = SCREAM_DELAY;
    this.game.audio.playScream();
  }

  updateScream(dt) {
    if (this.screamCutsceneStarted) {
      return;
    }

    this.screamTimer -= dt;
    if (this.screamTimer > 0) {
      return;
    }

    this.screamCutsceneStarted = true;
    this.cutscene.play(
      [
        {
          tone: "character",
          text: "¡¿Qué fue esoo?!",
          duration: 2.1,
        },
      ],
      {
        sceneLabel: SCENE_LABEL,
        onComplete: () => this.beginBreach(),
      },
    );
  }

  beginBreach() {
    this.phase = PHASE.BREACH;
    this.phaseTime = 0;
    this.doorClosed = false;
    this.shake = 16;
    this.game.audio.playMusic(MUSIC_TRACKS.horror);
    this.game.audio.playDoorBreak();

    const door = this.getDoorCenter();
    this.spawnBurst(door.x - 10, door.y, "#5C8C46", 24, 210, 0.9, "fragment");
    this.spawnBurst(door.x - 6, door.y, "#C9E8C9", 14, 160, 0.7);

    const entryX = this.interior.x + this.interior.w - 26;
    this.zombie = new Zombie({
      x: entryX,
      y: door.y,
      speed: 68,
    });
    this.zombie.facing = Math.PI;
    this.zombie.enterTo(
      this.interior.x + this.interior.w * 0.78,
      this.interior.y + this.interior.h * 0.5,
    );
  }

  beginThreat() {
    this.phase = PHASE.THREAT;
    this.phaseTime = 0;
    this.groanTimer = 0.4;
    this.game.audio.playZombieGroan();
  }

  throwKeyboard() {
    const angle = Math.atan2(this.zombie.y - this.player.y, this.zombie.x - this.player.x);
    this.player.aimAt(this.zombie.x, this.zombie.y);
    this.throws += 1;

    const startX = this.player.x + Math.cos(angle) * (this.player.radius + 10);
    const startY = this.player.y + Math.sin(angle) * (this.player.radius + 10);

    this.projectile = new KeyboardProjectile({
      x: startX,
      y: startY,
      targetX: this.zombie.x,
      targetY: this.zombie.y,
    });

    this.zombie.startle(0.55);
    this.shake = 4;
    this.game.audio.playKeyboardThrow();
    this.spawnBurst(startX, startY, "#C9D6E2", 6, 80, 0.4);
  }

  hitZombie() {
    const angle = Math.atan2(this.zombie.y - this.player.y, this.zombie.x - this.player.x);
    this.zombie.knockOut({
      directionX: Math.cos(angle),
      directionY: Math.sin(angle),
    });
    this.projectile = null;
    this.knockouts += 1;
    this.phase = PHASE.KNOCKOUT;
    this.phaseTime = 0;
    this.shake = 10;
    this.game.audio.playKeyboardHit();
    this.spawnBurst(this.zombie.x, this.zombie.y, "#9BE15D", 22, 190, 0.8);
    this.spawnBurst(this.zombie.x, this.zombie.y, "#F2C94C", 10, 150, 0.7);
    this.spawnBurst(this.zombie.x, this.zombie.y, "#C9D6E2", 8, 120, 0.5, "fragment");

    this.droppedKeyboards.push({
      x: this.zombie.x + 20,
      y: this.zombie.y + 14,
      rotation: 0.6,
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

  restart() {
    this.game.audio.stopFootsteps();
    this.game.audio.playUiConfirm();
    this.game.state.switchTo("scene1", { characterId: this.character.id });
  }

  goToMenu() {
    this.game.audio.stopFootsteps();
    this.game.audio.playUiConfirm();
    this.game.state.switchTo("menu", { characterId: this.character.id });
  }

  getCompleteLayout() {
    const width = this.game.width;
    const height = this.game.height;
    const panelW = Math.min(560, width * 0.86);
    const panelH = Math.min(340, height * 0.62);
    const panelX = (width - panelW) / 2;
    const panelY = (height - panelH) / 2;
    const buttonW = panelW - 64;
    const buttonH = height < 640 ? 40 : 46;
    const firstY = panelY + panelH - buttonH * 2 - 30;

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
    background.addColorStop(0, "#050C08");
    background.addColorStop(0.5, "#07130B");
    background.addColorStop(1, "#040906");
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    if (this.shake > 0.5) {
      ctx.translate((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake);
    }

    this.drawRoom(ctx);
    this.drawDoor(ctx);

    if (this.exitOpen && this.phase !== PHASE.COMPLETE) {
      this.drawExit(ctx);
    }

    for (const keyboard of this.droppedKeyboards) {
      this.drawDroppedKeyboard(ctx, keyboard);
    }

    this.drawClassroomNpcs(ctx, alpha);
    this.zombie?.render(ctx, alpha);
    this.projectile?.render(ctx, alpha);
    this.player.render(ctx, alpha);
    this.drawParticles(ctx);
    ctx.restore();

    if (this.phase === PHASE.THREAT && !this.projectile) {
      this.drawThrowPrompt(ctx);
    }

    if (this.phase === PHASE.KNOCKOUT) {
      this.drawKnockoutBanner(ctx);
    }

    const gameplayPhases = [
      PHASE.BREACH,
      PHASE.THREAT,
      PHASE.KNOCKOUT,
      PHASE.FREE,
      PHASE.EXITING,
    ];
    if (gameplayPhases.includes(this.phase) && !this.cutscene.active) {
      this.hud.render(ctx, {
        player: this.player,
        fps: this.game.fps,
        sceneLabel: SCENE_LABEL,
        hint: this.getHint(),
      });
    }

    if (this.phase === PHASE.TIMESKIP) {
      this.drawTimeSkip(ctx);
    }

    if (this.phase === PHASE.DEPARTURE) {
      this.drawNarrativeCaption(
        ctx,
        "Tus compañeros salen al break. La puerta del salón se cierra...",
      );
    }

    if (this.screamFlash > 0) {
      ctx.fillStyle = `rgba(150, 12, 22, ${0.42 * this.screamFlash})`;
      ctx.fillRect(0, 0, width, height);
    }

    if (this.cutscene.active) {
      this.cutscene.render(ctx, {
        width,
        height,
        character: this.character,
        assets: this.game.assets,
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

  getHint() {
    switch (this.phase) {
      case PHASE.INTRO:
        return "Entrando al ambiente de programación...";
      case PHASE.TIMESKIP:
        return "La clase de SOLID terminó. Es hora del break.";
      case PHASE.DEPARTURE:
        return "Los compañeros salen al break...";
      case PHASE.SCREAM:
        return "Un grito rompe el silencio del pasillo.";
      case PHASE.BREACH:
        return "Algo acaba de romper la puerta del salón...";
      case PHASE.THREAT:
        return "WASD / Flechas mover · Ratón apuntar · E / Espacio lanzar el teclado";
      case PHASE.KNOCKOUT:
        return "El zombi aprendiz quedó fuera de combate.";
      case PHASE.FREE:
        return "La puerta está abierta: llega a la salida verde para pasar al pasillo.";
      case PHASE.EXITING:
        return "Saliendo del ambiente...";
      default:
        return "Esc para volver al menú";
    }
  }

  drawRoom(ctx) {
    if (!this.roomLayer) {
      this.buildRoomLayer();
    }

    if (this.roomLayer) {
      ctx.drawImage(this.roomLayer, this.room.x, this.room.y, this.room.w, this.room.h);
    }

    const interior = this.interior;
    const flicker =
      0.86 + Math.sin(this.time * 7.3) * 0.06 + Math.sin(this.time * 19.7) * 0.035;

    // Luz parpadeante del aula y charco de luz fría sobre el piso.
    ctx.save();
    const glow = ctx.createRadialGradient(
      interior.x + interior.w * 0.68,
      interior.y + interior.h * 0.28,
      16,
      interior.x + interior.w * 0.68,
      interior.y + interior.h * 0.28,
      interior.w * 0.7,
    );
    const warm = 0.09 * flicker;
    glow.addColorStop(0, `rgba(126, 188, 96, ${warm + 0.04})`);
    glow.addColorStop(0.5, `rgba(126, 188, 96, ${warm * 0.5})`);
    glow.addColorStop(1, "rgba(126, 188, 96, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(interior.x, interior.y, interior.w, interior.h);

    const pool = ctx.createRadialGradient(
      interior.x + interior.w * 0.42,
      interior.y + interior.h * 0.6,
      10,
      interior.x + interior.w * 0.42,
      interior.y + interior.h * 0.6,
      interior.w * 0.46,
    );
    pool.addColorStop(0, `rgba(168, 214, 178, ${0.05 + 0.04 * flicker})`);
    pool.addColorStop(1, "rgba(168, 214, 178, 0)");
    ctx.fillStyle = pool;
    ctx.fillRect(interior.x, interior.y, interior.w, interior.h);
    ctx.restore();
  }

  paintRoomBase(ctx) {
    const room = this.room;
    const interior = this.interior;
    const assets = this.game.assets;

    // Pared: textura de yeso teñida y sombreada.
    ctx.fillStyle = "#0B1310";
    ctx.fillRect(room.x, room.y, room.w, room.h);
    fillTexture(ctx, room, assets.getImage("wallTexture"), { scale: 0.58, alpha: 0.22 });

    const wallGradient = ctx.createLinearGradient(room.x, room.y, room.x, room.y + room.h);
    wallGradient.addColorStop(0, "rgba(18, 34, 24, 0.52)");
    wallGradient.addColorStop(0.55, "rgba(9, 18, 13, 0.72)");
    wallGradient.addColorStop(1, "rgba(3, 8, 6, 0.9)");
    ctx.fillStyle = wallGradient;
    ctx.fillRect(room.x, room.y, room.w, room.h);

    // Piso: baldosa crema repetida, oscurecida por capas verdes.
    ctx.fillStyle = "#0A140E";
    ctx.fillRect(interior.x, interior.y, interior.w, interior.h);
    fillTexture(ctx, interior, assets.getImage("floorTexture"), { scale: 0.62, alpha: 0.55 });

    const floor = ctx.createLinearGradient(
      interior.x,
      interior.y,
      interior.x,
      interior.y + interior.h,
    );
    floor.addColorStop(0, "rgba(11, 30, 20, 0.42)");
    floor.addColorStop(0.55, "rgba(7, 20, 14, 0.58)");
    floor.addColorStop(1, "rgba(3, 9, 6, 0.78)");
    ctx.fillStyle = floor;
    ctx.fillRect(interior.x, interior.y, interior.w, interior.h);

    // Suciedad, manchas y sangre pre-renderizadas.
    if (this.roomOverlay) {
      ctx.drawImage(this.roomOverlay, room.x, room.y, room.w, room.h);
    }

    // Junta del zócalo entre pared y piso.
    ctx.strokeStyle = "rgba(6, 10, 8, 0.9)";
    ctx.lineWidth = 3;
    ctx.strokeRect(interior.x - 1, interior.y - 1, interior.w + 2, interior.h + 2);
    ctx.strokeStyle = "rgba(201, 232, 201, 0.12)";
    ctx.lineWidth = 1;
    ctx.strokeRect(interior.x, interior.y, interior.w, interior.h);

    // Marco del salón.
    ctx.strokeStyle = "rgba(57, 169, 0, 0.4)";
    ctx.lineWidth = 2;
    ctx.strokeRect(room.x + 1, room.y + 1, room.w - 2, room.h - 2);

    ctx.save();
    ctx.font = "600 10px 'Segoe UI', system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(201, 232, 201, 0.34)";
    ctx.fillText("AMBIENTE DE PROGRAMACIÓN · BLOQUE A", interior.x + 16, room.y + room.h - 9);
    ctx.restore();
  }

  drawWhiteboard(ctx) {
    const interior = this.interior;
    const board = {
      x: interior.x + interior.w * 0.07,
      y: interior.y + 12,
      w: clamp(interior.w * 0.42, 220, 520),
      h: clamp(interior.h * 0.15, 44, 68),
    };

    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
    ctx.beginPath();
    ctx.roundRect(board.x + 3, board.y + 4, board.w, board.h, 6);
    ctx.fill();

    ctx.fillStyle = "#E8F2E4";
    ctx.beginPath();
    ctx.roundRect(board.x, board.y, board.w, board.h, 6);
    ctx.fill();

    ctx.strokeStyle = "#7A8F72";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#2F6B2A";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.font = `700 ${clamp(board.h * 0.22, 11, 17)}px 'Segoe UI', system-ui, sans-serif`;
    ctx.fillText("ADSO · PROGRAMACIÓN", board.x + 14, board.y + 8);

    ctx.fillStyle = "#5D7A55";
    ctx.font = `500 ${clamp(board.h * 0.17, 9, 12)}px 'Segoe UI', system-ui, sans-serif`;
    ctx.fillText("Proyecto final: sistema de inventario", board.x + 14, board.y + board.h * 0.48);
    ctx.fillText("Entrega: viernes · Sustentación en sala", board.x + 14, board.y + board.h * 0.72);

    ctx.strokeStyle = "rgba(47, 107, 42, 0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(board.x + board.w * 0.72, board.y + 10);
    ctx.lineTo(board.x + board.w * 0.72, board.y + board.h - 10);
    ctx.stroke();

    ctx.fillStyle = "#C9D8C2";
    ctx.fillRect(board.x + board.w * 0.74, board.y + 12, 26, 4);
    ctx.fillRect(board.x + board.w * 0.74, board.y + 22, 18, 4);
    ctx.restore();
  }

  drawClock(ctx) {
    const interior = this.interior;
    const x = interior.x + interior.w * 0.8;
    const y = interior.y + 36;
    const radius = 17;

    ctx.save();
    ctx.fillStyle = "rgba(7, 18, 12, 0.9)";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(201, 232, 201, 0.45)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.strokeStyle = "rgba(201, 232, 201, 0.75)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - 9);
    ctx.moveTo(x, y);
    ctx.lineTo(x + 7, y + 3);
    ctx.stroke();

    for (let index = 0; index < 12; index += 1) {
      const angle = (index / 12) * Math.PI * 2;
      ctx.fillStyle = "rgba(201, 232, 201, 0.4)";
      ctx.fillRect(
        x + Math.cos(angle) * (radius - 4) - 0.8,
        y + Math.sin(angle) * (radius - 4) - 0.8,
        1.6,
        1.6,
      );
    }
    ctx.restore();
  }

  drawClassroomNpcs(ctx, alpha = 1) {
    const npcs = [this.instructor, ...this.classmates].filter(Boolean);
    for (const npc of npcs) {
      if (npc.gone) {
        continue;
      }

      const x = npc.prevX + (npc.x - npc.prevX) * alpha;
      const y = npc.prevY + (npc.y - npc.prevY) * alpha;
      this.drawNpc(ctx, npc, x, y);
    }
  }

  drawNpc(ctx, npc, x, y) {
    const bob =
      this.phase === PHASE.INTRO || this.phase === PHASE.TIMESKIP
        ? Math.sin(this.time * 1.8 + npc.phase) * 0.5
        : 0;
    const r = npc.radius ?? 12;

    ctx.save();
    ctx.translate(x, y + bob);

    ctx.fillStyle = "rgba(0, 0, 0, 0.34)";
    ctx.beginPath();
    ctx.ellipse(0, r * 0.55, r * 1.15, r * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = npc.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, r, r * 0.82, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = npc.accent;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Cabeza y cabello vistos desde arriba.
    ctx.fillStyle = npc.instructor ? "#D6A27C" : "#C98E6B";
    ctx.beginPath();
    ctx.arc(0, -r * 0.38, r * 0.55, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = npc.instructor ? "#2A2A2A" : "rgba(24, 20, 16, 0.85)";
    ctx.beginPath();
    ctx.arc(0, -r * 0.48, r * 0.5, Math.PI, Math.PI * 2);
    ctx.fill();

    if (npc.instructor) {
      // Gafas y corbata para distinguir al instructor.
      ctx.strokeStyle = "rgba(12, 20, 26, 0.9)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(-r * 0.2, -r * 0.38, r * 0.15, 0, Math.PI * 2);
      ctx.arc(r * 0.2, -r * 0.38, r * 0.15, 0, Math.PI * 2);
      ctx.moveTo(-r * 0.05, -r * 0.38);
      ctx.lineTo(r * 0.05, -r * 0.38);
      ctx.stroke();

      ctx.fillStyle = "#A3112A";
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.05);
      ctx.lineTo(r * 0.14, r * 0.42);
      ctx.lineTo(-r * 0.14, r * 0.42);
      ctx.closePath();
      ctx.fill();
    }

    ctx.font = "600 9px 'Segoe UI', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = npc.instructor
      ? "rgba(242, 201, 76, 0.9)"
      : "rgba(201, 232, 201, 0.62)";
    ctx.fillText(
      npc.instructor ? "PROFESOR" : npc.name.toUpperCase(),
      0,
      -r - 6,
    );
    ctx.restore();
  }

  drawTimeSkip(ctx) {
    const { width, height } = this.game;
    const t = this.phaseTime;
    const fade = clamp(t / 0.4, 0, 1);
    const flash = Math.max(0, 1 - t / 0.55);
    const blink = 0.62 + Math.sin(t * 9) * 0.3;

    ctx.save();
    ctx.fillStyle = `rgba(245, 250, 242, ${flash * 0.9})`;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = `rgba(3, 7, 4, ${0.5 * fade})`;
    ctx.fillRect(0, 0, width, height);

    const barHeight = clamp(height * 0.07, 38, 58);
    ctx.fillStyle = `rgba(2, 4, 3, ${0.9 * fade})`;
    ctx.fillRect(0, 0, width, barHeight);
    ctx.fillRect(0, height - barHeight, width, barHeight);

    ctx.globalAlpha = fade;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.font = `800 ${clamp(width * 0.05, 30, 54)}px 'Segoe UI', system-ui, sans-serif`;
    ctx.fillStyle = `rgba(242, 201, 76, ${blink})`;
    ctx.fillText("2 HORAS DESPUÉS...", width / 2, height / 2 - 14);

    ctx.font = "600 13px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(234, 255, 234, 0.8)";
    ctx.fillText(
      "La clase de SOLID terminó. Es hora del break.",
      width / 2,
      height / 2 + 30,
    );

    ctx.font = "500 10px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(201, 232, 201, 0.45)";
    ctx.fillText(
      "El salón recupera el silencio...",
      width / 2,
      height / 2 + 56,
    );
    ctx.restore();
  }

  drawNarrativeCaption(ctx, text) {
    const { width, height } = this.game;
    const barHeight = clamp(height * 0.07, 38, 58);
    const panelW = Math.min(720, width - 64);
    const panelH = 44;
    const x = (width - panelW) / 2;
    const y = height - barHeight - panelH - 18;

    ctx.save();
    roundedRect(ctx, x, y, panelW, panelH, 22);
    ctx.fillStyle = "rgba(4, 10, 6, 0.9)";
    ctx.fill();
    ctx.strokeStyle = "rgba(201, 232, 201, 0.22)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = "500 12px 'Segoe UI', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(234, 255, 234, 0.82)";
    ctx.fillText(text, width / 2, y + panelH / 2);
    ctx.restore();
  }

  drawDoor(ctx) {
    const door = this.door;
    const center = this.getDoorCenter();

    ctx.save();
    ctx.fillStyle = "#050B07";
    ctx.fillRect(door.x - 2, door.y, door.w + 6, door.h);

    const corridor = ctx.createLinearGradient(door.x, door.y, door.x + door.w + 24, door.y);
    corridor.addColorStop(0, "rgba(30, 52, 34, 0.9)");
    corridor.addColorStop(1, "rgba(8, 16, 11, 0.9)");
    ctx.fillStyle = corridor;
    ctx.fillRect(door.x, door.y + 3, door.w + 3, door.h - 6);

    ctx.strokeStyle = "rgba(201, 232, 201, 0.35)";
    ctx.lineWidth = 3;
    ctx.strokeRect(door.x - 3, door.y - 3, door.w + 8, door.h + 6);

    if (this.doorClosed) {
      ctx.fillStyle = "#243B2A";
      ctx.fillRect(door.x - 2, door.y + 2, door.w + 4, door.h / 2 - 3);
      ctx.fillRect(door.x - 2, door.y + door.h / 2 + 1, door.w + 4, door.h / 2 - 3);
      ctx.strokeStyle = "rgba(155, 180, 150, 0.5)";
      ctx.lineWidth = 2;
      ctx.strokeRect(door.x - 2, door.y + 2, door.w + 4, door.h / 2 - 3);
      ctx.strokeRect(door.x - 2, door.y + door.h / 2 + 1, door.w + 4, door.h / 2 - 3);
      ctx.fillStyle = "rgba(201, 232, 201, 0.55)";
      ctx.beginPath();
      ctx.arc(door.x + door.w * 0.5, door.y + door.h / 2 - 10, 2.4, 0, Math.PI * 2);
      ctx.arc(door.x + door.w * 0.5, door.y + door.h / 2 + 10, 2.4, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.phase === PHASE.BREACH && this.phaseTime < 0.35) {
      ctx.fillStyle = `rgba(235, 87, 87, ${0.35 - this.phaseTime})`;
      ctx.fillRect(door.x - 4, door.y - 4, door.w + 10, door.h + 8);
    }

    ctx.font = "600 9px 'Segoe UI', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = "rgba(201, 232, 201, 0.42)";
    ctx.fillText("PUERTA", center.x, door.y - 8);
    ctx.restore();
  }

  drawDesk(ctx, desk) {
    const centerX = desk.x + desk.w / 2;
    const topY = desk.y;

    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.beginPath();
    ctx.roundRect(desk.x + 4, desk.y + 6, desk.w, desk.h, 8);
    ctx.fill();

    const top = ctx.createLinearGradient(desk.x, desk.y, desk.x, desk.y + desk.h);
    top.addColorStop(0, "#2A3D26");
    top.addColorStop(1, "#1B2A19");
    ctx.fillStyle = top;
    ctx.beginPath();
    ctx.roundRect(desk.x, desk.y, desk.w, desk.h, 8);
    ctx.fill();
    ctx.strokeStyle = "rgba(104, 140, 82, 0.55)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.strokeStyle = "rgba(201, 232, 201, 0.12)";
    ctx.beginPath();
    ctx.moveTo(desk.x + 8, desk.y + desk.h - 8);
    ctx.lineTo(desk.x + desk.w - 8, desk.y + desk.h - 8);
    ctx.stroke();

    const monitorW = clamp(desk.w * 0.34, 26, 42);
    const monitorH = clamp(desk.h * 0.34, 18, 26);
    const monitorX = centerX - monitorW / 2 - desk.w * 0.1;
    const monitorY = topY + desk.h * 0.18;

    ctx.fillStyle = "#0A120D";
    ctx.fillRect(monitorX - 2, monitorY + monitorH, monitorW + 4, 4);
    ctx.fillStyle = "#121D14";
    ctx.beginPath();
    ctx.roundRect(monitorX, monitorY, monitorW, monitorH, 3);
    ctx.fill();
    ctx.strokeStyle = "rgba(155, 225, 93, 0.55)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = "rgba(155, 225, 93, 0.55)";
    for (let line = 0; line < 3; line += 1) {
      ctx.fillRect(monitorX + 4, monitorY + 5 + line * 5, monitorW * (0.4 + line * 0.12), 1.6);
    }

    ctx.fillStyle = "#222E1F";
    ctx.beginPath();
    ctx.roundRect(centerX + desk.w * 0.12, topY + desk.h * 0.42, desk.w * 0.24, desk.h * 0.22, 3);
    ctx.fill();
    ctx.strokeStyle = "rgba(201, 232, 201, 0.2)";
    ctx.stroke();

    ctx.fillStyle = "rgba(201, 232, 201, 0.18)";
    ctx.beginPath();
    ctx.arc(centerX - desk.w * 0.28, desk.y + desk.h + 14, 9, 0, Math.PI * 2);
    ctx.fill();
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
      zone.w * 2.6,
    );
    glow.addColorStop(0, `rgba(155, 225, 93, ${0.24 + pulse * 0.12})`);
    glow.addColorStop(1, "rgba(155, 225, 93, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(zone.x - zone.w, zone.y - 30, zone.w * 3.4, zone.h + 60);

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
      ctx.moveTo(zone.x + 18 + offset, centerY - 9);
      ctx.lineTo(zone.x + 27 + offset, centerY);
      ctx.lineTo(zone.x + 18 + offset, centerY + 9);
      ctx.stroke();
    }

    ctx.font = "700 10px 'Segoe UI', system-ui, sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillStyle = `rgba(199, 240, 170, ${0.65 + pulse * 0.3})`;
    ctx.fillText("SALIDA AL PASILLO", zone.x - 10, centerY);
    ctx.restore();
  }

  drawDroppedKeyboard(ctx, keyboard) {
    ctx.save();
    ctx.translate(keyboard.x, keyboard.y);
    ctx.rotate(keyboard.rotation);

    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.beginPath();
    ctx.ellipse(3, 4, 17, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#2B3138";
    ctx.strokeStyle = "#7D8B97";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-16, -8, 32, 16, 3);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#C9D6E2";
    for (let row = 0; row < 3; row += 1) {
      for (let column = 0; column < 6; column += 1) {
        ctx.fillRect(-12 + column * 3.7, -4 + row * 3, 2.4, 2);
      }
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

  drawThrowPrompt(ctx) {
    const { width, height } = this.game;
    const boxW = Math.min(400, width * 0.6);
    const boxH = 58;
    const x = (width - boxW) / 2;
    const y = height - 132;
    const pulse = 0.6 + Math.sin(this.time * 6) * 0.4;

    ctx.save();
    roundedRect(ctx, x, y, boxW, boxH, 14);
    ctx.fillStyle = "rgba(7, 18, 12, 0.92)";
    ctx.fill();
    ctx.strokeStyle = `rgba(242, 201, 76, ${0.5 + pulse * 0.4})`;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = "800 15px 'Segoe UI', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#F2C94C";
    ctx.fillText("¡LANZA EL TECLADO CONTRA EL ZOMBI!", width / 2, y + 22);

    ctx.font = "600 11px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(234, 255, 234, 0.8)";
    ctx.fillText("Presiona E o Espacio", width / 2, y + 42);
    ctx.restore();
  }

  drawKnockoutBanner(ctx) {
    const { width } = this.game;
    const alpha = Math.max(0, Math.min(1, this.phaseTime < 1.1 ? 1 : 1.1 - (this.phaseTime - 1.1) * 0.8));
    const label = "ZOMBI FUERA DE COMBATE";
    const boxW = Math.min(360, width * 0.6);
    const x = (width - boxW) / 2;
    const y = 108;

    ctx.save();
    ctx.globalAlpha = alpha;
    roundedRect(ctx, x, y, boxW, 42, 21);
    ctx.fillStyle = "rgba(57, 169, 0, 0.22)";
    ctx.fill();
    ctx.strokeStyle = "rgba(155, 225, 93, 0.8)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = "800 13px 'Segoe UI', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#C7F0A8";
    ctx.fillText(label, width / 2, y + 21);
    ctx.restore();
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
    ctx.fillText("SPRINT I2 · ESCENA 1", centerX, panel.y + 30);

    ctx.font = `800 ${clamp(panel.w * 0.055, 24, 34)}px 'Segoe UI', system-ui, sans-serif`;
    ctx.fillStyle = "#EAFFEA";
    ctx.fillText("AMBIENTE SUPERADO", centerX, panel.y + 68);

    ctx.font = "500 13px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(201, 232, 201, 0.82)";
    ctx.fillText(
      "El zombi aprendiz quedó fuera de combate.",
      centerX,
      panel.y + 98,
    );

    ctx.font = "600 12px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(242, 201, 76, 0.9)";
    ctx.fillText(
      "El pasillo del SENA continúa en el Sprint I3.",
      centerX,
      panel.y + 122,
    );

    const stats = `Personaje: ${this.character.name}  ·  Tiempo: ${this.finalTime.toFixed(1)} s  ·  Teclazos: ${this.throws}`;
    ctx.font = "500 11px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(201, 232, 201, 0.62)";
    ctx.fillText(stats, centerX, panel.y + 148);

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
