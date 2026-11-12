import { ASSET_MANIFEST } from "../core/AssetManifest.js";
import { drawBar, roundedRect } from "../ui/draw.js";

export class BootScene {
  constructor(game) {
    this.game = game;
    this.elapsed = 0;
    this.minDuration = 0.4;
  }

  enter() {
    this.elapsed = 0;
    this.game.assets.loadAll(ASSET_MANIFEST).catch((error) => {
      console.error("[BootScene] Error inesperado al cargar assets.", error);
    });
  }

  update(dt) {
    this.elapsed += dt;
    const ready = this.game.assets.ready;
    const skipped = ready && this.game.input.consumePressed("Enter", "Space");

    if (ready && (this.elapsed >= this.minDuration || skipped)) {
      this.game.state.switchTo("menu");
    }
  }

  render(ctx) {
    const { width, height } = this.game;
    const assets = this.game.assets;

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#07100B");
    gradient.addColorStop(0.5, "#0B1F12");
    gradient.addColorStop(1, "#07100B");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const logo = assets.getImage("logo");
    const emblemSize = Math.min(width * 0.34, height * 0.3, 240);
    const emblemY = height * 0.17;

    if (logo) {
      const logoHeight = (logo.height / logo.width) * emblemSize;
      ctx.drawImage(logo, (width - emblemSize) / 2, emblemY, emblemSize, logoHeight);
    } else {
      roundedRect(ctx, (width - emblemSize) / 2, emblemY, emblemSize, emblemSize, 22);
      ctx.fillStyle = "#12351C";
      ctx.fill();
      ctx.strokeStyle = "#39A900";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.font = `800 ${Math.round(emblemSize * 0.4)}px 'Segoe UI', system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#9BE15D";
      ctx.fillText("IS", width / 2, emblemY + emblemSize / 2);
    }

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `800 ${Math.min(34, width * 0.035)}px 'Segoe UI', system-ui, sans-serif`;
    ctx.fillStyle = "#EAFFEA";
    ctx.fillText("INVACIÓN SENA", width / 2, emblemY + emblemSize + 26);

    ctx.font = "700 11px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(155, 225, 93, 0.85)";
    ctx.fillText(
      "APRENDICES · SUPERVIVENCIA · SENA",
      width / 2,
      emblemY + emblemSize + 48,
    );
    ctx.restore();

    const barWidth = Math.min(420, width * 0.6);
    const barX = (width - barWidth) / 2;
    const barY = height * 0.62;
    const progress = assets.total === 0 ? 1 : assets.progress;

    ctx.font = "600 13px 'Segoe UI', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#C9E8C9";
    ctx.fillText(
      assets.ready ? "Assets listos" : `Cargando assets... ${Math.round(progress * 100)}%`,
      width / 2,
      barY - 20,
    );

    drawBar(ctx, barX, barY, barWidth, 12, progress, "#39A900");

    ctx.font = "500 11px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(201, 232, 201, 0.6)";
    ctx.fillText(
      `${assets.total} recurso(s) · gráficos y audio oficiales`,
      width / 2,
      barY + 30,
    );

    if (assets.errors.length > 0) {
      roundedRect(ctx, barX, barY + 52, barWidth, 38, 10);
      ctx.fillStyle = "rgba(242, 201, 76, 0.12)";
      ctx.fill();
      ctx.strokeStyle = "rgba(242, 201, 76, 0.45)";
      ctx.stroke();
      ctx.fillStyle = "#F2C94C";
      ctx.font = "500 11px 'Segoe UI', system-ui, sans-serif";
      ctx.fillText(assets.errors[0], width / 2, barY + 71);
    }

    ctx.font = "500 11px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(201, 232, 201, 0.45)";
    ctx.fillText("INVACIÓN SENA · Assets oficiales integrados", width / 2, height - 28);
  }
}
