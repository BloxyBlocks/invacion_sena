import { getCharacter, Player } from "../entities/Player.js";
import {
  circleCircleCollision,
  moveCircleWithCollisions,
} from "../systems/PhysicsSystem.js";
import { HUD } from "../ui/HUD.js";
import { roundedRect } from "../ui/draw.js";
import { createGrimeLayer, createLayerCanvas, fillTexture, drawVignette } from "../ui/textures.js";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export class TestScene {
  constructor(game) {
    this.game = game;
    this.player = null;
    this.character = null;
    this.hud = new HUD();
    this.elapsed = 0;
    this.time = 0;
    this.arena = null;
    this.floorOverlay = null;
    this.pageLayer = null;
    this.arenaLayer = null;
    this.obstacles = [];
    this.hazards = [];
    this.finished = true;
  }

  enter({ characterId = "zamora" } = {}) {
    this.character = getCharacter(characterId);
    this.player = new Player(this.character, this.game.assets, this.game.audio);
    this.elapsed = 0;
    this.time = 0;
    this.finished = false;
    this.game.audio.stopMusic({ fadeSeconds: 0.4 });
    this.layoutArena();

    const startX = this.arena.x + Math.min(110, this.arena.w * 0.18);
    const startY = this.arena.y + this.arena.h / 2;
    this.player.reset(startX, startY);
  }

  resize() {
    this.layoutArena();
  }

  layoutArena() {
    const { width, height } = this.game;
    const margin = clamp(width * 0.045, 22, 56);
    const top = Math.max(112, height * 0.15);
    const bottom = clamp(height * 0.08, 54, 80);

    this.arena = {
      x: margin,
      y: top,
      w: width - margin * 2,
      h: height - top - bottom,
    };

    const arena = this.arena;
    const crateW = clamp(arena.w * 0.1, 60, 130);
    const crateH = clamp(arena.h * 0.14, 50, 90);

    this.obstacles = [
      {
        x: arena.x + arena.w * 0.26 - crateW / 2,
        y: arena.y + arena.h * 0.3 - crateH / 2,
        w: crateW,
        h: crateH,
      },
      {
        x: arena.x + arena.w * 0.7 - crateW * 0.4,
        y: arena.y + arena.h * 0.62 - crateH * 0.6,
        w: crateW * 0.8,
        h: crateH * 1.2,
      },
    ];

    const hazardRadius = clamp(Math.min(arena.w, arena.h) * 0.11, 38, 70);
    this.hazards = [
      {
        x: arena.x + arena.w * 0.5,
        y: arena.y + arena.h * 0.5,
        radius: hazardRadius,
      },
      {
        x: arena.x + arena.w * 0.8,
        y: arena.y + arena.h * 0.22,
        radius: clamp(hazardRadius * 0.72, 28, 52),
      },
    ];

    if (this.player) {
      moveCircleWithCollisions(this.player, 0, 0, this.arena, this.obstacles);
    }

    this.floorOverlay = createGrimeLayer(this.arena.w, this.arena.h, {
      seed: 29,
      grime: 16,
      blood: 5,
      scratches: 14,
    });
    this.buildLayers();
  }

  buildLayers() {
    this.pageLayer = null;
    this.arenaLayer = null;

    const page = createLayerCanvas(this.game.width, this.game.height);
    if (page) {
      this.paintPage(page.ctx);
      this.pageLayer = page.canvas;
    }

    const arena = createLayerCanvas(this.arena.w, this.arena.h);
    if (arena) {
      arena.ctx.save();
      arena.ctx.translate(-this.arena.x, -this.arena.y);
      this.paintArena(arena.ctx);
      for (const obstacle of this.obstacles) {
        this.drawObstacle(arena.ctx, obstacle);
      }
      arena.ctx.restore();
      this.arenaLayer = arena.canvas;
    }
  }

  paintPage(ctx) {
    const { width, height } = this.game;
    const assets = this.game.assets;

    // Fondo de yeso: la pared del entorno de prueba.
    ctx.fillStyle = "#070B09";
    ctx.fillRect(0, 0, width, height);
    fillTexture(ctx, { x: 0, y: 0, w: width, h: height }, assets.getImage("wallTexture"), {
      scale: 0.55,
      alpha: 0.16,
    });
    const wallVeil = ctx.createLinearGradient(0, 0, 0, height);
    wallVeil.addColorStop(0, "rgba(5, 12, 9, 0.55)");
    wallVeil.addColorStop(1, "rgba(2, 6, 4, 0.85)");
    ctx.fillStyle = wallVeil;
    ctx.fillRect(0, 0, width, height);
    drawVignette(ctx, width, height, 0.5);
  }

  paintArena(ctx) {
    const arena = this.arena;
    const assets = this.game.assets;

    // Piso de baldosa crema, oscurecido para la escena de prueba.
    ctx.fillStyle = "#0A140E";
    ctx.fillRect(arena.x, arena.y, arena.w, arena.h);
    fillTexture(ctx, arena, assets.getImage("floorTexture"), { scale: 0.6, alpha: 0.5 });

    const floor = ctx.createLinearGradient(arena.x, arena.y, arena.x, arena.y + arena.h);
    floor.addColorStop(0, "rgba(10, 28, 19, 0.42)");
    floor.addColorStop(1, "rgba(3, 9, 6, 0.72)");
    ctx.fillStyle = floor;
    ctx.fillRect(arena.x, arena.y, arena.w, arena.h);

    if (this.floorOverlay) {
      ctx.drawImage(this.floorOverlay, arena.x, arena.y, arena.w, arena.h);
    }
  }

  drawObstacle(ctx, obstacle) {
    const assets = this.game.assets;

    roundedRect(ctx, obstacle.x, obstacle.y, obstacle.w, obstacle.h, 10);
    ctx.fillStyle = "rgba(32, 53, 31, 0.95)";
    ctx.fill();

    ctx.save();
    roundedRect(ctx, obstacle.x, obstacle.y, obstacle.w, obstacle.h, 10);
    ctx.clip();
    fillTexture(ctx, obstacle, assets.getImage("wallTexture"), {
      scale: 0.5,
      alpha: 0.16,
      tint: { color: "rgba(30, 16, 12, 0.3)", alpha: 1 },
    });
    ctx.restore();

    roundedRect(ctx, obstacle.x, obstacle.y, obstacle.w, obstacle.h, 10);
    ctx.strokeStyle = "rgba(92, 140, 70, 0.7)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.strokeStyle = "rgba(92, 140, 70, 0.28)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(obstacle.x + 10, obstacle.y + obstacle.h - 10);
    ctx.lineTo(obstacle.x + obstacle.w - 10, obstacle.y + 10);
    ctx.stroke();
  }

  update(dt) {
    if (this.finished) {
      return;
    }

    this.elapsed += dt;
    this.time += dt;
    this.hud.update(dt);

    const input = this.game.input;
    if (input.consumePressed("Escape")) {
      this.finished = true;
      this.game.state.switchTo("menu");
      return;
    }

    this.player.update(dt, {
      direction: input.getMoveVector(),
      bounds: this.arena,
      obstacles: this.obstacles,
      aimX: input.mouse.x,
      aimY: input.mouse.y,
    });

    for (const hazard of this.hazards) {
      if (circleCircleCollision(this.player, hazard)) {
        if (this.player.takeDamage(25)) {
          this.game.audio.playDamage();
        }
        break;
      }
    }

    if (this.player.health <= 0) {
      this.finishGame();
    }
  }

  finishGame() {
    if (this.finished) {
      return;
    }

    this.finished = true;
    this.game.audio.playGameOver();
    this.game.state.switchTo("gameOver", {
      characterId: this.character.id,
      survived: this.elapsed,
    });
  }

  render(ctx, alpha = 1) {
    const { width, height } = this.game;
    const arena = this.arena;

    if (!this.pageLayer || !this.arenaLayer) {
      this.buildLayers();
    }

    if (this.pageLayer) {
      ctx.drawImage(this.pageLayer, 0, 0, width, height);
    }

    ctx.save();
    roundedRect(ctx, arena.x, arena.y, arena.w, arena.h, 18);
    ctx.clip();
    if (this.arenaLayer) {
      ctx.drawImage(this.arenaLayer, arena.x, arena.y, arena.w, arena.h);
    }
    ctx.restore();

    roundedRect(ctx, arena.x, arena.y, arena.w, arena.h, 18);
    ctx.strokeStyle = "rgba(57, 169, 0, 0.42)";
    ctx.lineWidth = 2;
    ctx.stroke();

    this.hazards.forEach((hazard, index) => {
      const pulse = 0.5 + Math.sin(this.time * 4 + index * 1.7) * 0.5;
      const outerRadius = hazard.radius + 6 + pulse * 5;

      ctx.save();
      ctx.fillStyle = `rgba(235, 87, 87, ${0.08 + pulse * 0.05})`;
      ctx.beginPath();
      ctx.arc(hazard.x, hazard.y, outerRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(235, 87, 87, ${0.16 + pulse * 0.07})`;
      ctx.beginPath();
      ctx.arc(hazard.x, hazard.y, hazard.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `rgba(255, 154, 154, ${0.5 + pulse * 0.25})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([7, 6]);
      ctx.beginPath();
      ctx.arc(hazard.x, hazard.y, hazard.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = "800 10px 'Segoe UI', system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(255, 210, 210, 0.9)";
      ctx.fillText("DAÑO", hazard.x, hazard.y);
      ctx.restore();
    });

    this.player.render(ctx, alpha);

    this.hud.render(ctx, {
      player: this.player,
      fps: this.game.fps,
      sceneLabel: "ESCENA DE PRUEBA · I1",
      hint: "WASD / Flechas mover · Ratón apuntar · Zona roja = daño de prueba · ESC menú",
    });
  }
}
