import { CHARACTERS, STAT_MAX } from "../entities/Player.js";
import { MUSIC_TRACKS } from "../core/AssetManifest.js";
import { drawBar, hexToRgba, pointInRect, roundedRect, wrapText } from "../ui/draw.js";
import { drawPortrait } from "../ui/portrait.js";
import { drawVignette, getCoverRect } from "../ui/textures.js";

const CRIMSON = "#C21B32";
const CRIMSON_LIGHT = "#E2576B";
const BONE = "#F0E4E4";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export class MenuScene {
  constructor(game) {
    this.game = game;
    this.selectedIndex = 0;
    this.hoveredIndex = -1;
    this.time = 0;
    this.starting = false;
    this.particles = [];
    this.backgroundLayer = null;
    this.backgroundDpr = 1;
  }

  enter(params = {}) {
    const selected = CHARACTERS.findIndex((character) => character.id === params.characterId);
    this.selectedIndex = selected >= 0 ? selected : 0;
    this.hoveredIndex = -1;
    this.starting = false;
    this.particles = this.createParticles();
    this.rebuildBackground();
    this.game.audio.playMusic(MUSIC_TRACKS.menu);
  }

  exit() {
    this.game.audio.stopFootsteps();
  }

  resize() {
    this.particles = this.createParticles();
    this.rebuildBackground();
  }

  createParticles() {
    const width = Math.max(1, this.game.width);
    const height = Math.max(1, this.game.height);
    return Array.from({ length: 56 }, (_, index) => {
      const ember = index % 5 === 0;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        radius: ember ? 1 + Math.random() * 1.9 : 0.6 + Math.random() * 1.7,
        speed: ember ? 14 + Math.random() * 26 : 5 + Math.random() * 16,
        drift: 2 + Math.random() * 6,
        alpha: ember ? 0.35 + Math.random() * 0.45 : 0.05 + Math.random() * 0.14,
        frequency: 0.4 + Math.random() * 1.2,
        phase: Math.random() * Math.PI * 2,
        flicker: 1.4 + Math.random() * 3.4,
        ember,
      };
    });
  }

  getLayout() {
    const width = this.game.width;
    const height = this.game.height;
    const compact = height < 640;
    const wide = width >= 900;
    const margin = clamp(width * 0.05, 18, 64);

    // En pantallas anchas el contenido se desplaza a la derecha para dejar
    // visible al personaje acurrucado de la ilustración.
    const contentW = wide
      ? clamp(width * 0.46, 420, 720)
      : Math.min(width - margin * 2, 640);
    const contentX = wide ? width - margin - contentW : (width - contentW) / 2;

    const gap = Math.max(10, Math.min(18, width * 0.012));
    const cols = 2;
    const rows = Math.ceil(CHARACTERS.length / cols);
    const cardW = (contentW - gap * (cols - 1)) / cols;
    const cardH = compact
      ? clamp(height * 0.15, 72, 98)
      : clamp(height * 0.175, 96, 132);

    const emblem = compact ? 48 : clamp(height * 0.115, 58, 88);
    const headerY = compact ? 10 : 18;
    const subtitleY = headerY + emblem + (compact ? 10 : 16);
    const cardsTop = subtitleY + (compact ? 18 : 26);

    const cards = CHARACTERS.map((character, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      return {
        character,
        x: contentX + col * (cardW + gap),
        y: cardsTop + row * (cardH + gap),
        w: cardW,
        h: cardH,
      };
    });

    const cardsBottom = cardsTop + rows * cardH + (rows - 1) * gap;
    const detailsY = cardsBottom + (compact ? 10 : 16);
    const detailsH = compact ? 64 : clamp(height * 0.17, 104, 124);
    const startW = Math.min(320, contentW * 0.58);
    const startH = compact ? 42 : clamp(height * 0.072, 46, 56);
    const start = {
      x: contentX + (contentW - startW) / 2,
      y: detailsY + detailsH + (compact ? 8 : 14),
      w: startW,
      h: startH,
    };
    const sound = {
      x: contentX + contentW - 146,
      y: start.y + start.h + (compact ? 8 : 12),
      w: 146,
      h: 34,
    };

    return {
      width,
      height,
      compact,
      wide,
      margin,
      contentX,
      contentW,
      cols,
      rows,
      gap,
      cardW,
      cardH,
      cards,
      cardsTop,
      cardsBottom,
      details: { x: contentX, y: detailsY, w: contentW, h: detailsH },
      start,
      sound,
      emblem,
      headerY,
      subtitleY,
    };
  }

  update(dt) {
    this.time += dt;
    this.updateParticles(dt);

    const input = this.game.input;
    const layout = this.getLayout();

    this.hoveredIndex = layout.cards.findIndex((card) =>
      pointInRect(input.mouse.x, input.mouse.y, card),
    );

    let move = 0;
    if (input.consumePressed("ArrowLeft", "KeyA")) {
      move = -1;
    } else if (input.consumePressed("ArrowRight", "KeyD")) {
      move = 1;
    } else if (input.consumePressed("ArrowUp", "KeyW")) {
      move = -layout.cols;
    } else if (input.consumePressed("ArrowDown", "KeyS")) {
      move = layout.cols;
    }

    if (move !== 0) {
      const total = CHARACTERS.length;
      this.selectedIndex = (this.selectedIndex + move + total) % total;
      this.game.audio.playUiMove();
    }

    if (input.consumePressed("KeyM")) {
      this.toggleSound();
    }

    if (input.consumePressed("Enter", "Space")) {
      this.startGame();
    }

    if (input.consumeClick()) {
      const { mouse } = input;
      if (pointInRect(mouse.x, mouse.y, layout.start)) {
        this.startGame();
      } else if (pointInRect(mouse.x, mouse.y, layout.sound)) {
        this.toggleSound();
      } else if (this.hoveredIndex >= 0) {
        this.selectedIndex = this.hoveredIndex;
        this.game.audio.playUiMove();
      }
    }
  }

  updateParticles(dt) {
    for (const particle of this.particles) {
      particle.y -= particle.speed * dt;
      particle.x += Math.sin(this.time * particle.frequency + particle.phase) * particle.drift * dt;

      if (particle.y < -12) {
        particle.y = this.game.height + 12;
        particle.x = Math.random() * this.game.width;
      }
      if (particle.x < -12) {
        particle.x = this.game.width + 12;
      } else if (particle.x > this.game.width + 12) {
        particle.x = -12;
      }
    }
  }

  startGame() {
    if (this.starting) {
      return;
    }

    this.starting = true;
    this.game.audio.playUiConfirm();
    this.game.state.switchTo("scene1", { characterId: CHARACTERS[this.selectedIndex].id });
  }

  toggleSound() {
    const muted = this.game.audio.toggleMuted();
    if (!muted) {
      this.game.audio.playUiConfirm();
    }
  }

  render(ctx) {
    const layout = this.getLayout();
    const selected = CHARACTERS[this.selectedIndex];

    this.drawBackground(ctx, layout);
    this.drawLogo(ctx, layout);

    ctx.save();
    ctx.font = "500 13px 'Segoe UI', system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(232, 214, 214, 0.68)";
    ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
    ctx.shadowBlur = 8;
    ctx.fillText(
      "Elige tu aprendiz. Sobrevive a la infección.",
      layout.contentX + 6,
      layout.subtitleY,
    );
    ctx.restore();

    this.drawSoundButton(ctx, layout);
    layout.cards.forEach((card, index) => this.drawCharacterCard(ctx, card, index, layout));
    this.drawDetails(ctx, layout, selected);
    this.drawStartButton(ctx, layout, selected);
    this.drawFooter(ctx, layout);
  }

  rebuildBackground() {
    const width = Math.max(1, Math.round(this.game.width));
    const height = Math.max(1, Math.round(this.game.height));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      this.backgroundLayer = null;
      return;
    }

    ctx.scale(dpr, dpr);
    this.paintStaticBackground(ctx, width, height);
    this.backgroundLayer = canvas;
    this.backgroundDpr = dpr;
  }

  paintStaticBackground(ctx, width, height) {
    const image = this.game.assets.getImage("menuBackground");

    ctx.fillStyle = "#05070A";
    ctx.fillRect(0, 0, width, height);

    if (image) {
      const cover = getCoverRect(image, width, height);
      ctx.drawImage(image, cover.x, cover.y, cover.w, cover.h);
    } else {
      const fallback = ctx.createLinearGradient(0, 0, 0, height);
      fallback.addColorStop(0, "#0B0A0D");
      fallback.addColorStop(0.6, "#16070A");
      fallback.addColorStop(1, "#050406");
      ctx.fillStyle = fallback;
      ctx.fillRect(0, 0, width, height);
    }

    // Velo general para integrar la ilustración al menú.
    ctx.fillStyle = "rgba(5, 6, 9, 0.34)";
    ctx.fillRect(0, 0, width, height);

    // Refuerzo sobre la columna de contenido para garantizar contraste.
    const veil = ctx.createLinearGradient(0, 0, width, 0);
    veil.addColorStop(0, "rgba(4, 5, 8, 0.08)");
    veil.addColorStop(0.34, "rgba(4, 5, 8, 0.26)");
    veil.addColorStop(0.56, "rgba(6, 4, 8, 0.74)");
    veil.addColorStop(1, "rgba(3, 3, 6, 0.93)");
    ctx.fillStyle = veil;
    ctx.fillRect(0, 0, width, height);

    // Oscurecimiento inferior para el pie del menú.
    const footerVeil = ctx.createLinearGradient(0, height * 0.72, 0, height);
    footerVeil.addColorStop(0, "rgba(3, 3, 5, 0)");
    footerVeil.addColorStop(1, "rgba(3, 3, 5, 0.92)");
    ctx.fillStyle = footerVeil;
    ctx.fillRect(0, height * 0.72, width, height * 0.28);

    drawVignette(ctx, width, height, 0.72);
  }

  drawBackground(ctx, layout) {
    if (!this.backgroundLayer) {
      this.rebuildBackground();
    }

    if (this.backgroundLayer) {
      ctx.drawImage(this.backgroundLayer, 0, 0, layout.width, layout.height);
    } else {
      this.paintStaticBackground(ctx, layout.width, layout.height);
    }

    // Resplandor carmesí pulsante detrás de las tarjetas.
    const pulse = 0.72 + Math.sin(this.time * 1.7) * 0.18 + Math.sin(this.time * 7.3) * 0.06;
    const glow = ctx.createRadialGradient(
      layout.contentX + layout.contentW * 0.5,
      layout.cardsTop + layout.cardH,
      20,
      layout.contentX + layout.contentW * 0.5,
      layout.cardsTop + layout.cardH,
      layout.contentW * 0.95,
    );
    glow.addColorStop(0, `rgba(150, 14, 30, ${0.16 * pulse})`);
    glow.addColorStop(1, "rgba(150, 14, 30, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(layout.contentX - 80, 0, layout.contentW + 160, layout.height);

    this.drawParticles(ctx, layout);
  }

  drawParticles(ctx, layout) {
    ctx.save();
    for (const particle of this.particles) {
      const flicker = particle.ember
        ? 0.55 + Math.abs(Math.sin(this.time * particle.flicker + particle.phase)) * 0.45
        : 1;
      const alpha = particle.alpha * flicker;

      if (particle.ember) {
        ctx.fillStyle = `rgba(196, 38, 40, ${alpha * 0.3})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius * 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(255, 138, 84, ${alpha})`;
      } else {
        ctx.fillStyle = `rgba(206, 198, 194, ${alpha})`;
      }

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawLogo(ctx, layout) {
    const emblem = layout.emblem;
    const gap = layout.compact ? 10 : 14;
    const titleSize = layout.compact ? 22 : clamp(layout.height * 0.044, 26, 36);
    const kickerSize = layout.compact ? 8 : 10;
    const title = "INVACIÓN SENA";
    const kicker = "APRENDICES · SUPERVIVENCIA · SENA";

    ctx.save();
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    ctx.font = `800 ${titleSize}px 'Segoe UI', system-ui, sans-serif`;
    const titleWidth = ctx.measureText(title).width;
    ctx.font = `700 ${kickerSize}px 'Segoe UI', system-ui, sans-serif`;
    const kickerWidth = ctx.measureText(kicker).width;
    const blockWidth = emblem + gap + Math.max(titleWidth, kickerWidth);
    const startX = layout.contentX + 4;
    const centerY = layout.headerY + emblem / 2;

    ctx.save();
    ctx.shadowColor = "rgba(194, 27, 50, 0.55)";
    ctx.shadowBlur = 22;
    if (this.game.assets.getImage("logo")) {
      const image = this.game.assets.getImage("logo");
      const aspect = image.width > 0 ? image.height / image.width : 1;
      const height = emblem * aspect;
      ctx.drawImage(
        image,
        startX,
        layout.headerY + (emblem - height) / 2,
        emblem,
        height,
      );
    } else {
      roundedRect(ctx, startX, layout.headerY, emblem, emblem, emblem * 0.24);
      ctx.fillStyle = "#2A050B";
      ctx.fill();
      ctx.strokeStyle = CRIMSON;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.font = `800 ${Math.round(emblem * 0.4)}px 'Segoe UI', system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillStyle = CRIMSON_LIGHT;
      ctx.fillText("IS", startX + emblem / 2, centerY);
      ctx.textAlign = "left";
    }
    ctx.restore();

    const textX = startX + emblem + gap;
    ctx.font = `800 ${titleSize}px 'Segoe UI', system-ui, sans-serif`;
    ctx.fillStyle = BONE;
    ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
    ctx.shadowBlur = 14;
    ctx.fillText(title, textX, centerY - (layout.compact ? 7 : 9));
    ctx.shadowBlur = 0;

    ctx.font = `700 ${kickerSize}px 'Segoe UI', system-ui, sans-serif`;
    ctx.fillStyle = hexToRgba(CRIMSON_LIGHT, 0.92);
    ctx.fillText(kicker, textX, centerY + (layout.compact ? 12 : 16));

    ctx.strokeStyle = "rgba(194, 27, 50, 0.55)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(textX, centerY + (layout.compact ? 22 : 28));
    ctx.lineTo(startX + blockWidth, centerY + (layout.compact ? 22 : 28));
    ctx.stroke();
    ctx.restore();
  }

  drawSoundButton(ctx, layout) {
    const hovered = pointInRect(
      this.game.input.mouse.x,
      this.game.input.mouse.y,
      layout.sound,
    );
    const muted = this.game.audio.isMuted();

    ctx.save();
    roundedRect(ctx, layout.sound.x, layout.sound.y, layout.sound.w, layout.sound.h, 17);
    ctx.fillStyle = hovered ? "rgba(83, 10, 20, 0.82)" : "rgba(7, 6, 9, 0.82)";
    ctx.fill();
    ctx.strokeStyle = muted ? "rgba(200, 190, 190, 0.22)" : "rgba(194, 27, 50, 0.6)";
    ctx.lineWidth = 1.4;
    ctx.stroke();

    ctx.font = "700 11px 'Segoe UI', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = muted ? "rgba(200, 190, 190, 0.5)" : CRIMSON_LIGHT;
    ctx.fillText(
      muted ? "SONIDO: OFF" : "SONIDO: ON",
      layout.sound.x + layout.sound.w / 2,
      layout.sound.y + layout.sound.h / 2,
    );
    ctx.restore();
  }

  drawCharacterCard(ctx, card, index, layout) {
    const selected = index === this.selectedIndex;
    const hovered = index === this.hoveredIndex;
    const character = card.character;

    ctx.save();
    if (selected) {
      ctx.shadowBlur = 22;
      ctx.shadowColor = "rgba(194, 27, 50, 0.55)";
    }

    roundedRect(ctx, card.x, card.y, card.w, card.h, 14);
    ctx.fillStyle = selected
      ? "rgba(72, 8, 18, 0.66)"
      : hovered
        ? "rgba(30, 20, 24, 0.78)"
        : "rgba(7, 7, 11, 0.72)";
    ctx.fill();
    ctx.strokeStyle = selected
      ? CRIMSON
      : hovered
        ? "rgba(226, 87, 107, 0.5)"
        : "rgba(220, 205, 205, 0.12)";
    ctx.lineWidth = selected ? 2.4 : 1.3;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Franja de identidad del personaje.
    roundedRect(ctx, card.x, card.y, 4, card.h, 2);
    ctx.fillStyle = hexToRgba(character.color, selected ? 0.95 : 0.5);
    ctx.fill();

    const portraitX = card.x + 40;
    const portraitY = card.y + card.h / 2;
    this.drawAvatar(ctx, portraitX, portraitY, card.h < 118 ? 24 : 28, character);

    const textX = card.x + (card.h < 118 ? 72 : 78);
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.font = `700 ${layout.compact ? 16 : 18}px 'Segoe UI', system-ui, sans-serif`;
    ctx.fillStyle = BONE;
    ctx.fillText(character.name, textX, portraitY - 12);

    ctx.font = "600 10px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = selected ? CRIMSON_LIGHT : "rgba(214, 198, 198, 0.72)";
    ctx.fillText(character.role.toUpperCase(), textX, portraitY + 9);

    if (selected) {
      ctx.fillStyle = CRIMSON_LIGHT;
      ctx.beginPath();
      ctx.arc(card.x + card.w - 16, card.y + 16, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  drawAvatar(ctx, x, y, radius, character) {
    if (drawPortrait(ctx, x, y, radius, character, this.game.assets)) {
      ctx.save();
      ctx.strokeStyle = hexToRgba(character.accent, 0.9);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.fillStyle = character.color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = character.accent;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.font = `800 ${Math.round(radius * 0.9)}px 'Segoe UI', system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#08070A";
    ctx.fillText(character.name.charAt(0), x, y + 1);
    ctx.restore();
  }

  drawDetails(ctx, layout, character) {
    const details = layout.details;
    ctx.save();
    roundedRect(ctx, details.x, details.y, details.w, details.h, 14);
    ctx.fillStyle = "rgba(7, 6, 10, 0.82)";
    ctx.fill();
    ctx.strokeStyle = "rgba(194, 27, 50, 0.42)";
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // Pequeña marca de expediente en la esquina.
    ctx.font = "700 8px 'Segoe UI', system-ui, sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(194, 27, 50, 0.55)";
    ctx.fillText("EXPEDIENTE DE SUPERVIVENCIA", details.x + details.w - 16, details.y + 12);

    const avatarX = details.x + (layout.compact ? 32 : 46);
    const avatarY = details.y + details.h / 2;
    this.drawAvatar(ctx, avatarX, avatarY, layout.compact ? 21 : 30, character);

    const textX = avatarX + (layout.compact ? 38 : 54);
    const roomy = details.w >= 560;
    const statsX = details.x + details.w * (roomy ? 0.55 : 0.54);
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.font = `700 ${layout.compact ? 16 : 22}px 'Segoe UI', system-ui, sans-serif`;
    ctx.fillStyle = BONE;
    ctx.fillText(character.name, textX, details.y + (layout.compact ? 24 : 32));

    ctx.font = "600 10px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = CRIMSON_LIGHT;
    ctx.fillText(character.role.toUpperCase(), textX, details.y + (layout.compact ? 42 : 54));

    if (!layout.compact && roomy) {
      ctx.font = "500 12px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = "rgba(214, 200, 200, 0.72)";
      const descriptionWidth = Math.max(120, statsX - textX - 18);
      const maxLines = Math.max(1, Math.floor((details.h - 86) / 16) + 1);
      const lines = wrapText(ctx, character.description, descriptionWidth, maxLines);
      lines.forEach((line, index) => {
        ctx.fillText(line, textX, details.y + 76 + index * 16);
      });
    }

    if (layout.compact) {
      ctx.font = "600 11px 'Segoe UI', system-ui, sans-serif";
      ctx.textAlign = "right";
      ctx.fillStyle = "rgba(214, 200, 200, 0.78)";
      ctx.fillText(
        `VEL ${character.speed} · VIDA ${character.maxHealth} · DAÑO ${character.damage} · ATQ ${character.attackSpeed.toFixed(2)}x`,
        details.x + details.w - 16,
        details.y + 30,
      );
      ctx.font = "500 10px 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = "rgba(214, 200, 200, 0.46)";
      ctx.fillText("Estadísticas base", details.x + details.w - 16, details.y + 50);
    } else {
      const statsX = details.x + details.w * (roomy ? 0.55 : 0.54);
      this.drawStats(ctx, details, character, statsX);
    }

    ctx.restore();
  }

  drawStats(ctx, details, character, statsX) {
    const stats = [
      { label: "VELOCIDAD", value: character.speed, max: STAT_MAX.speed, color: "#C24C5E" },
      { label: "SALUD", value: character.maxHealth, max: STAT_MAX.maxHealth, color: "#C2463F" },
      { label: "DAÑO", value: character.damage, max: STAT_MAX.damage, color: "#E2576B" },
      {
        label: "RITMO DE ATAQUE",
        value: character.attackSpeed,
        max: STAT_MAX.attackSpeed,
        color: "#D8915A",
      },
    ];

    const x = statsX;
    const width = details.x + details.w - 22 - x;
    const startY = details.y + 28;

    stats.forEach((stat, index) => {
      const y = startY + index * 23;
      ctx.font = "600 9px 'Segoe UI', system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(214, 200, 200, 0.66)";
      ctx.fillText(stat.label, x, y);

      drawBar(ctx, x + 104, y - 5, Math.max(30, width - 150), 10, stat.value / stat.max, stat.color, "rgba(255, 255, 255, 0.07)");

      ctx.font = "700 10px 'Segoe UI', system-ui, sans-serif";
      ctx.textAlign = "right";
      ctx.fillStyle = BONE;
      const isAttackSpeed = stat.label === "RITMO DE ATAQUE";
      const display = isAttackSpeed
        ? `${stat.value.toFixed(2)}x`
        : Number.isInteger(stat.value)
          ? stat.value
          : `${stat.value.toFixed(2)}x`;
      ctx.fillText(String(display), x + width, y);
    });
  }

  drawStartButton(ctx, layout, character) {
    const hovered = pointInRect(
      this.game.input.mouse.x,
      this.game.input.mouse.y,
      layout.start,
    );
    const pulse = 0.5 + Math.sin(this.time * 2.4) * 0.5;

    ctx.save();
    if (hovered) {
      ctx.shadowBlur = 26;
      ctx.shadowColor = "rgba(194, 27, 50, 0.7)";
    }

    roundedRect(
      ctx,
      layout.start.x,
      layout.start.y,
      layout.start.w,
      layout.start.h,
      layout.start.h / 2,
    );
    const fill = ctx.createLinearGradient(
      layout.start.x,
      layout.start.y,
      layout.start.x,
      layout.start.y + layout.start.h,
    );
    fill.addColorStop(0, hovered ? "#E03049" : "#C21B32");
    fill.addColorStop(1, hovered ? "#8C1022" : "#6E0A18");
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = `rgba(255, 160, 170, ${0.25 + pulse * 0.35})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = `800 ${layout.compact ? 15 : 17}px 'Segoe UI', system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#FFF1F1";
    ctx.fillText(
      "INICIAR PARTIDA",
      layout.start.x + layout.start.w / 2,
      layout.start.y + layout.start.h / 2,
    );
    ctx.restore();
  }

  drawFooter(ctx, layout) {
    ctx.save();
    ctx.font = "500 11px 'Segoe UI', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(214, 200, 200, 0.5)";
    ctx.fillText(
      "← → / A D seleccionar · Enter iniciar · M sonido · Ratón compatible",
      layout.contentX + layout.contentW / 2,
      layout.height - 22,
    );
    ctx.restore();
  }
}
