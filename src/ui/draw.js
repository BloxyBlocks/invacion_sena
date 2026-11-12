export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function clamp01(value) {
  return clamp(value, 0, 1);
}

export function lerp(from, to, amount) {
  return from + (to - from) * amount;
}

export function pointInRect(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

export function roundedRect(ctx, x, y, width, height, radius = 12) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

export function drawBar(ctx, x, y, width, height, ratio, color, background = "rgba(255, 255, 255, 0.10)") {
  const clamped = clamp01(ratio);
  roundedRect(ctx, x, y, width, height, height / 2);
  ctx.fillStyle = background;
  ctx.fill();

  if (clamped > 0) {
    roundedRect(ctx, x, y, Math.max(height, width * clamped), height, height / 2);
    ctx.fillStyle = color;
    ctx.fill();
  }
}

export function hexToRgba(hex, alpha = 1) {
  const clean = hex.replace("#", "");
  const expanded = clean.length === 3 ? clean.split("").map((char) => char + char).join("") : clean;
  const value = Number.parseInt(expanded, 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export function wrapText(ctx, text, maxWidth, maxLines = Infinity) {
  const words = text.split(/\s+/);
  const lines = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }

  if (current) {
    lines.push(current);
  }

  if (lines.length <= maxLines) {
    return lines;
  }

  // Recorta a las líneas visibles y añade puntos suspensivos si el texto no cabe.
  const clamped = lines.slice(0, Math.max(1, maxLines));
  let last = clamped[clamped.length - 1];
  while (last.length > 1 && ctx.measureText(`${last}…`).width > maxWidth) {
    last = last.slice(0, -1).trimEnd();
  }
  clamped[clamped.length - 1] = `${last}…`;
  return clamped;
}
