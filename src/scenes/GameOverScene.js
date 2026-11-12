import { getCharacter } from "../entities/Player.js";
import { hexToRgba, pointInRect, roundedRect } from "../ui/draw.js";
import { drawPortrait } from "../ui/portrait.js";

export class GameOverScene {
  constructor(game) {
    this.game = game;
    this.character = null;
    this.survived = 0;
    this.scene = "test";
    this.time = 0;
    this.selectedOption = 0;
    this.hoveredOption = -1;
  }

  enter({ characterId = "zamora", survived = 0, scene = "test" } = {}) {
    this.character = getCharacter(characterId);
    this.survived = survived;
    this.scene = scene;
    this.time = 0;
    this.selectedOption = 0;
    this.hoveredOption = -1;
    this.game.audio.stopMusic({ fadeSeconds: 0.4 });
  }

  getLayout() {
    const width = this.game.width;
    const height = this.game.height;
    const buttonW = Math.min(360, width * 0.62);
    const buttonH = height < 640 ? 46 : 54;
    const gap = 14;
    const titleY = height * 0.17;
    const subtitleY = titleY + 50;
    const avatarY = subtitleY + 62;
    const nameY = avatarY + 56;
    const timeY = avatarY + 82;
    const firstY = Math.max(height * 0.54, timeY + 34);
    const x = (width - buttonW) / 2;

    return {
      width,
      height,
      titleY,
      subtitleY,
      avatarY,
      nameY,
      timeY,
      buttons: [
        {
          id: "restart",
          label: "REINICIAR ESCENA",
          shortcut: "R",
          x,
          y: firstY,
          w: buttonW,
          h: buttonH,
        },
        {
          id: "menu",
          label: "VOLVER AL MENÚ",
          shortcut: "M",
          x,
          y: firstY + buttonH + gap,
          w: buttonW,
          h: buttonH,
        },
      ],
    };
  }

  update(dt) {
    this.time += dt;
    const input = this.game.input;
    const layout = this.getLayout();

    this.hoveredOption = layout.buttons.findIndex((button) =>
      pointInRect(input.mouse.x, input.mouse.y, button),
    );

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
      this.confirmSelection();
    }

    if (input.consumeClick()) {
      const { mouse } = input;
      const clicked = layout.buttons.findIndex((button) =>
        pointInRect(mouse.x, mouse.y, button),
      );
      if (clicked >= 0) {
        this.selectedOption = clicked;
        this.confirmSelection();
      }
    }
  }

  confirmSelection() {
    if (this.selectedOption === 0) {
      this.restart();
    } else {
      this.goToMenu();
    }
  }

  restart() {
    this.game.audio.playUiConfirm();
    this.game.state.switchTo(this.scene, { characterId: this.character.id });
  }

  goToMenu() {
    this.game.audio.playUiConfirm();
    this.game.state.switchTo("menu", { characterId: this.character.id });
  }

  render(ctx) {
    const layout = this.getLayout();
    const { width, height } = layout;

    const background = ctx.createLinearGradient(0, 0, 0, height);
    background.addColorStop(0, "#120607");
    background.addColorStop(0.55, "#1D0A0B");
    background.addColorStop(1, "#070506");
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);

    const glow = ctx.createRadialGradient(
      width / 2,
      height * 0.28,
      20,
      width / 2,
      height * 0.28,
      Math.max(width, height) * 0.55,
    );
    glow.addColorStop(0, "rgba(235, 87, 87, 0.2)");
    glow.addColorStop(1, "rgba(235, 87, 87, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `800 ${height < 640 ? 44 : 64}px 'Segoe UI', system-ui, sans-serif`;
    ctx.fillStyle = "#EB5757";
    ctx.shadowBlur = 28;
    ctx.shadowColor = "rgba(235, 87, 87, 0.6)";
    ctx.fillText("GAME OVER", width / 2, layout.titleY);
    ctx.shadowBlur = 0;

    ctx.font = "500 14px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(255, 220, 220, 0.72)";
    ctx.fillText("La infección te alcanzó.", width / 2, layout.subtitleY);
    ctx.restore();

    const avatarX = width / 2;
    const avatarY = layout.avatarY;
    ctx.save();
    if (!drawPortrait(ctx, avatarX, avatarY, 32, this.character, this.game.assets)) {
      ctx.fillStyle = this.character.color;
      ctx.beginPath();
      ctx.arc(avatarX, avatarY, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = "800 28px 'Segoe UI', system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#07100B";
      ctx.fillText(this.character.name.charAt(0), avatarX, avatarY + 2);
    }
    ctx.strokeStyle = this.character.accent;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, 32, 0, Math.PI * 2);
    ctx.stroke();

    ctx.font = "700 20px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "#EAFFEA";
    ctx.fillText(this.character.name, width / 2, layout.nameY);

    ctx.font = "500 13px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(255, 220, 220, 0.7)";
    ctx.fillText(
      `Tiempo sobrevivido: ${this.survived.toFixed(1)} s`,
      width / 2,
      layout.timeY,
    );
    ctx.restore();

    layout.buttons.forEach((button, index) => {
      this.drawButton(ctx, button, index);
    });

    ctx.save();
    ctx.font = "500 11px 'Segoe UI', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255, 220, 220, 0.5)";
    ctx.fillText(
      "← → elegir · Enter confirmar · R reiniciar · M menú",
      width / 2,
      height - 28,
    );
    ctx.restore();
  }

  drawButton(ctx, button, index) {
    const selected = index === this.selectedOption;
    const hovered = index === this.hoveredOption;
    const accent = index === 0 ? this.character.color : "#EB5757";

    ctx.save();
    if (selected) {
      ctx.shadowBlur = 22;
      ctx.shadowColor = hexToRgba(accent, 0.42);
    }

    roundedRect(ctx, button.x, button.y, button.w, button.h, button.h / 2);
    ctx.fillStyle = selected
      ? hexToRgba(accent, 0.18)
      : hovered
        ? "rgba(255, 255, 255, 0.06)"
        : "rgba(7, 5, 6, 0.78)";
    ctx.fill();
    ctx.strokeStyle = selected ? accent : "rgba(255, 220, 220, 0.22)";
    ctx.lineWidth = selected ? 2 : 1.5;
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.font = "700 14px 'Segoe UI', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = selected ? "#EAFFEA" : "rgba(255, 220, 220, 0.78)";
    ctx.fillText(button.label, button.x + button.w / 2, button.y + button.h / 2);

    const badgeW = 26;
    const badgeH = 22;
    const badgeX = button.x + button.w - 40;
    const badgeY = button.y + button.h / 2 - badgeH / 2;
    roundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 7);
    ctx.fillStyle = selected ? hexToRgba(accent, 0.35) : "rgba(255, 255, 255, 0.08)";
    ctx.fill();
    ctx.font = "700 10px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = selected ? "#EAFFEA" : "rgba(255, 220, 220, 0.55)";
    ctx.fillText(button.shortcut, badgeX + badgeW / 2, badgeY + badgeH / 2);

    ctx.restore();
  }
}
