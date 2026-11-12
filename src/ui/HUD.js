import { drawBar, hexToRgba, roundedRect } from "./draw.js";
import { drawPortrait } from "./portrait.js";

export class HUD {
  constructor() {
    this.time = 0;
  }

  update(dt) {
    this.time += dt;
  }

  render(
    ctx,
    {
      player,
      fps = 60,
      sceneLabel = "",
      hint = "",
      weapon = "",
      wave = 0,
      wavesTotal = 0,
      remaining = null,
    } = {},
  ) {
    if (!player) {
      return;
    }

    const { width, height } = ctx.canvas;
    const viewWidth = ctx.canvas.clientWidth || width;
    const viewHeight = ctx.canvas.clientHeight || height;
    const ratio = player.maxHealth > 0 ? player.health / player.maxHealth : 0;
    const healthColor = ratio > 0.6 ? "#39A900" : ratio > 0.3 ? "#F2C94C" : "#EB5757";

    ctx.save();

    const panel = { x: 18, y: 16, w: Math.min(330, viewWidth - 36), h: 88 };
    roundedRect(ctx, panel.x, panel.y, panel.w, panel.h, 14);
    ctx.fillStyle = "rgba(7, 18, 12, 0.88)";
    ctx.fill();
    ctx.strokeStyle = "rgba(57, 169, 0, 0.45)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const avatarX = panel.x + 34;
    const avatarY = panel.y + 34;
    if (!drawPortrait(ctx, avatarX, avatarY, 20, player.character, player.assets)) {
      ctx.fillStyle = player.character.color;
      ctx.beginPath();
      ctx.arc(avatarX, avatarY, 20, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = player.character.accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, 20, 0, Math.PI * 2);
    ctx.stroke();

    ctx.font = "700 16px 'Segoe UI', system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#EAFFEA";
    ctx.fillText(player.character.name, panel.x + 66, panel.y + 26);

    ctx.font = "500 11px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = hexToRgba(player.character.accent, 0.9);
    ctx.fillText(player.character.role.toUpperCase(), panel.x + 66, panel.y + 44);

    drawBar(ctx, panel.x + 66, panel.y + 57, panel.w - 86, 12, ratio, healthColor);

    ctx.font = "600 11px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "#C9E8C9";
    ctx.textAlign = "right";
    ctx.fillText(
      `${Math.ceil(player.health)} / ${player.maxHealth}`,
      panel.x + panel.w - 20,
      panel.y + 72,
    );

    const fpsColor = fps >= 55 ? "#9BE15D" : fps >= 40 ? "#F2C94C" : "#EB5757";
    const fpsText = `${Math.round(fps)} FPS`;
    ctx.font = "700 12px 'Segoe UI', system-ui, sans-serif";
    const fpsWidth = ctx.measureText(fpsText).width + 24;

    roundedRect(ctx, viewWidth - fpsWidth - 18, 16, fpsWidth, 32, 16);
    ctx.fillStyle = "rgba(7, 18, 12, 0.88)";
    ctx.fill();
    ctx.strokeStyle = hexToRgba(fpsColor, 0.55);
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = fpsColor;
    ctx.textAlign = "center";
    ctx.fillText(fpsText, viewWidth - fpsWidth / 2 - 18, 32);

    let statusY = 62;

    if (weapon) {
      const label = weapon.toUpperCase();
      ctx.font = "700 10px 'Segoe UI', system-ui, sans-serif";
      const chipW = Math.min(260, Math.max(156, ctx.measureText(label).width + 54));
      const chipX = viewWidth - chipW - 18;

      roundedRect(ctx, chipX, 54, chipW, 30, 15);
      ctx.fillStyle = "rgba(7, 18, 12, 0.88)";
      ctx.fill();
      ctx.strokeStyle = "rgba(242, 201, 76, 0.55)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      drawAxeIcon(ctx, chipX + 17, 69);

      ctx.font = "700 10px 'Segoe UI', system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#F2C94C";
      ctx.fillText(label, chipX + 30, 69);
      statusY = 100;
    }

    if (wave > 0) {
      const waveText = wavesTotal > 0 ? `OLEADA ${wave} / ${wavesTotal}` : `OLEADA ${wave}`;
      const remainingText =
        remaining === null
          ? ""
          : remaining > 0
            ? `${remaining} ZOMBI${remaining === 1 ? "I" : "S"} RESTANTE${remaining === 1 ? "" : "S"}`
            : "PASILLO DESPEJADO";

      ctx.font = "800 12px 'Segoe UI', system-ui, sans-serif";
      const titleW = ctx.measureText(waveText).width;
      ctx.font = "600 10px 'Segoe UI', system-ui, sans-serif";
      const subW = remainingText ? ctx.measureText(remainingText).width : 0;
      const chipW = Math.max(150, titleW, subW) + 34;
      const chipH = remainingText ? 44 : 30;
      const chipY = viewWidth >= 900 ? 16 : 112;
      const chipX = (viewWidth - chipW) / 2;

      roundedRect(ctx, chipX, chipY, chipW, chipH, 12);
      ctx.fillStyle = "rgba(7, 18, 12, 0.88)";
      ctx.fill();
      ctx.strokeStyle = "rgba(235, 87, 87, 0.5)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "800 12px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = "#FF9A9A";
      ctx.fillText(waveText, viewWidth / 2, chipY + 15);

      if (remainingText) {
        ctx.font = "600 10px 'Segoe UI', system-ui, sans-serif";
        ctx.fillStyle = "rgba(234, 255, 234, 0.78)";
        ctx.fillText(remainingText, viewWidth / 2, chipY + 31);
      }
    }

    if (sceneLabel) {
      ctx.font = "600 11px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = "rgba(201, 232, 201, 0.75)";
      ctx.textAlign = "right";
      ctx.fillText(sceneLabel, viewWidth - 18, statusY);
    }

    if (hint) {
      ctx.font = "500 12px 'Segoe UI', system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(201, 232, 201, 0.7)";
      ctx.fillText(hint, viewWidth / 2, viewHeight - 22);
    }

    if (ratio < 0.3 && player.health > 0) {
      const pulse = 0.24 + Math.sin(this.time * 6) * 0.12;
      ctx.strokeStyle = `rgba(235, 87, 87, ${pulse})`;
      ctx.lineWidth = 10;
      ctx.strokeRect(5, 5, viewWidth - 10, viewHeight - 10);
    }

    ctx.restore();
  }
}

function drawAxeIcon(ctx, x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.5);

  ctx.strokeStyle = "#8A6236";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-8, 0);
  ctx.lineTo(5, 0);
  ctx.stroke();

  ctx.fillStyle = "#C3CDD4";
  ctx.beginPath();
  ctx.moveTo(3, -7);
  ctx.lineTo(10, -8);
  ctx.lineTo(11, 0);
  ctx.lineTo(10, 8);
  ctx.lineTo(3, 7);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}
