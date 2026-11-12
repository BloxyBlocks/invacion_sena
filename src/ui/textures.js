import { hexToRgba } from "./draw.js";

/**
 * Utilidades de texturizado para los entornos.
 *
 * Los PNG de `assets/img/texturas` se repiten con `CanvasPattern` y se tiñen
 * con capas oscuras para conservar la atmósfera de terror. Los patrones y las
 * capas de suciedad se cachean para no reconstruirlos en cada fotograma.
 */

const patternCache = new WeakMap();
let scratchContext = null;

function getScratchContext() {
  if (!scratchContext) {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    scratchContext = canvas.getContext("2d");
  }
  return scratchContext;
}

/**
 * Devuelve un patrón repetido del `image`. El patrón se crea una sola vez por
 * combinación imagen + escala y se reutiliza entre fotogramas.
 */
export function getTexturePattern(image, scale = 1) {
  if (!image) {
    return null;
  }

  const normalized = Math.max(0.05, scale);
  let perImage = patternCache.get(image);
  if (!perImage) {
    perImage = new Map();
    patternCache.set(image, perImage);
  }

  const key = normalized.toFixed(3);
  const cached = perImage.get(key);
  if (cached) {
    return cached;
  }

  const context = getScratchContext();
  if (!context) {
    return null;
  }

  const pattern = context.createPattern(image, "repeat");
  if (!pattern) {
    return null;
  }

  if (typeof pattern.setTransform === "function" && typeof DOMMatrix !== "undefined") {
    pattern.setTransform(new DOMMatrix([normalized, 0, 0, normalized, 0, 0]));
  }

  perImage.set(key, pattern);
  return pattern;
}

/**
 * Rellena `rect` con la textura repetida. `alpha` controla cuánto se mezcla con
 * la base y `tint` aplica un velo de color encima.
 */
export function fillTexture(
  ctx,
  rect,
  image,
  { scale = 1, alpha = 1, tint = null } = {},
) {
  const pattern = getTexturePattern(image, scale);
  if (!pattern || rect.w <= 0 || rect.h <= 0) {
    return false;
  }

  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();

  if (alpha < 1) {
    ctx.globalAlpha = Math.max(0, alpha);
  }
  ctx.fillStyle = pattern;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);

  if (tint) {
    ctx.globalAlpha = tint.alpha ?? 1;
    ctx.fillStyle = tint.color;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  }

  ctx.restore();
  return true;
}

/**
 * Crea un canvas fuera de pantalla con la escala del dispositivo ya aplicada.
 * Se usa para pre-renderizar fondos estáticos y evitar repetir texturas en
 * cada fotograma.
 */
export function createLayerCanvas(width, height) {
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(w * dpr));
  canvas.height = Math.max(1, Math.round(h * dpr));
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return null;
  }
  ctx.scale(dpr, dpr);
  return { canvas, ctx, dpr };
}

function createRandom(seed) {
  let state = (seed | 0) || 1;
  return function random() {
    state = (state + 0x6d2b79f5) | 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function drawBloodSplat(ctx, x, y, radius, random) {
  const blobs = 3 + Math.floor(random() * 4);
  for (let index = 0; index < blobs; index += 1) {
    const offsetX = (random() - 0.5) * radius * 1.1;
    const offsetY = (random() - 0.5) * radius * 0.8;
    const blobRadius = radius * (0.35 + random() * 0.6);
    const gradient = ctx.createRadialGradient(
      x + offsetX,
      y + offsetY,
      blobRadius * 0.15,
      x + offsetX,
      y + offsetY,
      blobRadius,
    );
    gradient.addColorStop(0, `rgba(112, 8, 20, ${0.5 + random() * 0.3})`);
    gradient.addColorStop(0.65, `rgba(78, 4, 14, ${0.34 + random() * 0.25})`);
    gradient.addColorStop(1, "rgba(60, 2, 10, 0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(
      x + offsetX,
      y + offsetY,
      blobRadius * (0.8 + random() * 0.5),
      blobRadius * (0.55 + random() * 0.4),
      random() * Math.PI,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  const droplets = 4 + Math.floor(random() * 8);
  for (let index = 0; index < droplets; index += 1) {
    const angle = random() * Math.PI * 2;
    const distance = radius * (0.5 + random() * 1.5);
    const dropRadius = radius * (0.04 + random() * 0.08);
    ctx.fillStyle = `rgba(92, 5, 16, ${0.3 + random() * 0.4})`;
    ctx.beginPath();
    ctx.ellipse(
      x + Math.cos(angle) * distance,
      y + Math.sin(angle) * distance * 0.7,
      dropRadius * 1.4,
      dropRadius,
      angle,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
}

/**
 * Crea una capa transparente con suciedad, manchas y sangre. Se dibuja una sola
 * vez y luego se estampa con `drawImage`, evitando gradientes por fotograma.
 */
export function createGrimeLayer(
  width,
  height,
  { seed = 1, grime = 14, blood = 5, scratches = 14 } = {},
) {
  const w = Math.max(2, Math.round(width));
  const h = Math.max(2, Math.round(height));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return null;
  }

  const random = createRandom(seed);
  const minSide = Math.min(w, h);

  for (let index = 0; index < grime; index += 1) {
    const x = random() * w;
    const y = random() * h;
    const radius = minSide * (0.12 + random() * 0.22);
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(3, 5, 4, ${0.08 + random() * 0.14})`);
    gradient.addColorStop(1, "rgba(3, 5, 4, 0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let index = 0; index < blood; index += 1) {
    const x = random() * w;
    const y = random() * h;
    const radius = minSide * (0.05 + random() * 0.11);
    drawBloodSplat(ctx, x, y, radius, random);
  }

  ctx.strokeStyle = "rgba(214, 224, 214, 0.05)";
  ctx.lineWidth = 1;
  for (let index = 0; index < scratches; index += 1) {
    const x = random() * w;
    const y = random() * h;
    const length = minSide * (0.02 + random() * 0.08);
    const angle = random() * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
    ctx.stroke();
  }

  return canvas;
}

/**
 * Viñeta radial reutilizable para menú y escenas.
 */
export function drawVignette(ctx, width, height, strength = 0.55, color = "0, 0, 0") {
  const gradient = ctx.createRadialGradient(
    width / 2,
    height * 0.46,
    Math.min(width, height) * 0.24,
    width / 2,
    height * 0.5,
    Math.max(width, height) * 0.72,
  );
  gradient.addColorStop(0, `rgba(${color}, 0)`);
  gradient.addColorStop(0.72, `rgba(${color}, ${strength * 0.42})`);
  gradient.addColorStop(1, `rgba(${color}, ${strength})`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

/**
 * Devuelve el rectángulo destino para dibujar `image` en modo *cover*.
 */
export function getCoverRect(image, width, height) {
  if (!image || !image.width || !image.height) {
    return { x: 0, y: 0, w: width, h: height };
  }

  const scale = Math.max(width / image.width, height / image.height);
  const w = image.width * scale;
  const h = image.height * scale;
  return { x: (width - w) / 2, y: (height - h) / 2, w, h };
}

/**
 * Degradado de sangre para acentos de interfaz.
 */
export function bloodGradient(ctx, x0, y0, x1, y1) {
  const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
  gradient.addColorStop(0, "#D6243F");
  gradient.addColorStop(0.55, hexToRgba("#C21B32", 1));
  gradient.addColorStop(1, "#6E0A18");
  return gradient;
}
