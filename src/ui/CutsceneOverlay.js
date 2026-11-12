import { drawPortrait } from "./portrait.js";
import { hexToRgba, roundedRect, wrapText } from "./draw.js";

const TONE_COLORS = {
  narration: "#F2C94C",
  character: "#9BE15D",
  system: "#56CCF2",
  danger: "#EB5757",
};

function defaultDuration(text) {
  return Math.max(2.9, Math.min(6.8, text.length * 0.046));
}

/**
 * Capa reutilizable de cinemáticas con letterbox, retrato y cuadros de texto.
 *
 * Las escenas entregan una lista de beats y bloquean su lógica mientras
 * `active` sea true. El jugador avanza con Enter/Espacio/clic o espera a que
 * termine la duración del cuadro.
 */
export class CutsceneOverlay {
  constructor() {
    this.active = false;
    this.beats = [];
    this.index = 0;
    this.time = 0;
    this.onComplete = null;
    this.sceneLabel = "";
    this.finishedOnce = false;
  }

  play(beats = [], { onComplete = null, sceneLabel = "" } = {}) {
    const normalized = beats.filter((beat) => beat && beat.text);
    this.active = normalized.length > 0;
    this.beats = normalized;
    this.index = 0;
    this.time = 0;
    this.onComplete = onComplete;
    this.sceneLabel = sceneLabel;
    this.finishedOnce = false;
    return this.active;
  }

  get beat() {
    return this.active ? this.beats[this.index] ?? null : null;
  }

  get progress() {
    if (this.beats.length === 0) {
      return 0;
    }
    return (this.index + 1) / this.beats.length;
  }

  update(dt, input) {
    if (!this.active) {
      return false;
    }

    this.time += dt;
    const beat = this.beat;

    if (!beat) {
      this.finish();
      return false;
    }

    const duration = beat.duration ?? defaultDuration(beat.text);
    const advance =
      input.consumePressed("Enter", "Space") ||
      input.consumeClick() ||
      this.time >= duration;

    if (advance) {
      this.advance();
    }

    return this.active;
  }

  advance() {
    if (!this.active) {
      return;
    }

    this.index += 1;
    this.time = 0;

    if (this.index >= this.beats.length) {
      this.finish();
    }
  }

  finish() {
    if (!this.active) {
      return;
    }

    this.active = false;
    this.finishedOnce = true;
    const callback = this.onComplete;
    this.onComplete = null;
    callback?.();
  }

  render(
    ctx,
    { width = 0, height = 0, character = null, assets = null, accent = "#9BE15D" } = {},
  ) {
    if (!this.active || !this.beat) {
      return;
    }

    const beat = this.beat;
    const toneColor = TONE_COLORS[beat.tone] ?? accent;
    const barHeight = Math.max(42, Math.min(86, height * 0.095));
    const panelW = Math.min(920, width - 48);
    const panelH = Math.max(132, Math.min(172, height * 0.24));
    const panelX = (width - panelW) / 2;
    const panelY = height - barHeight - panelH - 16;
    const portraitVisible =
      beat.portrait === "instructor" ||
      beat.tone === "character" ||
      beat.tone === "narration";

    ctx.save();

    // Letterbox cinematográfico.
    ctx.fillStyle = "#020403";
    ctx.fillRect(0, 0, width, barHeight);
    ctx.fillRect(0, height - barHeight, width, barHeight);

    const shade = ctx.createLinearGradient(0, barHeight, 0, barHeight + 110);
    shade.addColorStop(0, "rgba(2, 4, 3, 0.5)");
    shade.addColorStop(1, "rgba(2, 4, 3, 0)");
    ctx.fillStyle = shade;
    ctx.fillRect(0, barHeight, width, 110);

    // Chapa de escena en la barra superior.
    ctx.font = "700 10px 'Segoe UI', system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(201, 232, 201, 0.6)";
    ctx.fillText(this.sceneLabel || "CINEMÁTICA", 24, barHeight / 2);

    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(201, 232, 201, 0.45)";
    ctx.fillText(
      `CUADRO ${this.index + 1} / ${this.beats.length}`,
      width - 24,
      barHeight / 2,
    );

    // Panel de diálogo.
    roundedRect(ctx, panelX, panelY, panelW, panelH, 14);
    ctx.fillStyle = "rgba(5, 12, 8, 0.94)";
    ctx.fill();
    ctx.strokeStyle = hexToRgba(toneColor, 0.55);
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const portraitSize = 42;
    const portraitX = panelX + 22 + portraitSize;
    const portraitY = panelY + panelH / 2 - 4;

    if (portraitVisible) {
      if (beat.portrait === "instructor") {
        this.drawInstructorPortrait(ctx, portraitX, portraitY, portraitSize, toneColor);
      } else if (!drawPortrait(ctx, portraitX, portraitY, portraitSize, character, assets)) {
        ctx.fillStyle = character?.color ?? "#39A900";
        ctx.beginPath();
        ctx.arc(portraitX, portraitY, portraitSize, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = hexToRgba(toneColor, 0.8);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(portraitX, portraitY, portraitSize, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.save();
      ctx.translate(portraitX, portraitY);
      ctx.fillStyle = hexToRgba(toneColor, 0.16);
      ctx.beginPath();
      ctx.arc(0, 0, portraitSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = hexToRgba(toneColor, 0.7);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, portraitSize, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = "800 30px 'Segoe UI', system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = toneColor;
      ctx.fillText("!", 0, 2);
      ctx.restore();
    }

    const textX = panelX + portraitSize * 2 + 48;
    const textW = panelW - (textX - panelX) - 28;

    const speaker =
      beat.speaker ??
      (beat.tone === "character"
        ? character?.name ?? "APRENDIZ"
        : beat.tone === "system"
          ? "SISTEMA"
          : "NARRADOR");

    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.font = "800 11px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = toneColor;
    ctx.fillText(speaker.toUpperCase(), textX, panelY + 26);

    ctx.font = "500 14px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(234, 255, 234, 0.94)";
    const lines = wrapText(ctx, beat.text, textW, 3);
    let lineY = panelY + 52;
    for (const line of lines) {
      ctx.fillText(line, textX, lineY);
      lineY += 20;
    }

    // Progreso de la cinemática.
    const dots = this.beats.length;
    const dotY = panelY + panelH - 18;
    for (let index = 0; index < dots; index += 1) {
      ctx.fillStyle =
        index <= this.index ? hexToRgba(toneColor, 0.95) : "rgba(201, 232, 201, 0.2)";
      ctx.beginPath();
      ctx.arc(panelX + 24 + index * 14, dotY, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    const blink = 0.5 + Math.sin(this.time * 5) * 0.35;
    ctx.font = "600 10px 'Segoe UI', system-ui, sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillStyle = `rgba(201, 232, 201, ${blink})`;
    ctx.fillText("Enter / Espacio / Clic para continuar", panelX + panelW - 22, dotY);

    ctx.restore();
  }

  drawInstructorPortrait(ctx, x, y, radius, accent) {
    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = "rgba(20, 32, 42, 0.96)";
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    // Hombros y camisa del instructor.
    ctx.fillStyle = "#2F4F6B";
    ctx.beginPath();
    ctx.ellipse(0, radius * 0.78, radius * 0.82, radius * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cuello y rostro.
    ctx.fillStyle = "#D6A27C";
    ctx.fillRect(-radius * 0.16, radius * 0.18, radius * 0.32, radius * 0.28);
    ctx.beginPath();
    ctx.arc(0, -radius * 0.06, radius * 0.46, 0, Math.PI * 2);
    ctx.fill();

    // Cabello canoso.
    ctx.fillStyle = "#B9C2C8";
    ctx.beginPath();
    ctx.arc(0, -radius * 0.16, radius * 0.48, Math.PI, Math.PI * 2);
    ctx.fill();

    // Gafas.
    ctx.strokeStyle = "rgba(12, 20, 26, 0.95)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-radius * 0.18, -radius * 0.06, radius * 0.15, 0, Math.PI * 2);
    ctx.arc(radius * 0.18, -radius * 0.06, radius * 0.15, 0, Math.PI * 2);
    ctx.moveTo(-radius * 0.03, -radius * 0.06);
    ctx.lineTo(radius * 0.03, -radius * 0.06);
    ctx.stroke();

    // Corbata.
    ctx.fillStyle = "#A3112A";
    ctx.beginPath();
    ctx.moveTo(0, radius * 0.3);
    ctx.lineTo(radius * 0.13, radius * 0.62);
    ctx.lineTo(0, radius * 0.86);
    ctx.lineTo(-radius * 0.13, radius * 0.62);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = hexToRgba(accent, 0.7);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.92, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}
