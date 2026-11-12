import { PLAYER_SPRITE_VIEWS } from "../core/AssetManifest.js";

/**
 * Devuelve el recorte de retrato (cabeza y rostro) de un personaje que tenga
 * sprites dedicados. Los personajes sin sprites siguen usando el avatar
 * procedural de inicial.
 */
export function getPortraitSource(assets, character) {
  const views = PLAYER_SPRITE_VIEWS[character?.id];
  if (!views) {
    return null;
  }

  const view = views.down;
  const image = assets?.getImage(view.key);
  if (!image) {
    return null;
  }

  const { crop } = view;
  return {
    image,
    sx: crop.x,
    sy: Math.round(crop.y + crop.h * 0.3),
    sw: crop.w,
    sh: Math.round(crop.h * 0.4),
  };
}

/**
 * Dibuja el retrato recortado en un círculo. Devuelve `true` si usó un sprite;
 * `false` permite al llamador conservar el avatar procedural.
 */
export function drawPortrait(ctx, x, y, radius, character, assets) {
  const source = getPortraitSource(assets, character);
  if (!source) {
    return false;
  }

  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = "rgba(7, 16, 11, 0.92)";
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);

  const diameter = radius * 2;
  const scale = Math.max(diameter / source.sw, diameter / source.sh);
  const width = source.sw * scale;
  const height = source.sh * scale;

  ctx.drawImage(
    source.image,
    source.sx,
    source.sy,
    source.sw,
    source.sh,
    x - width / 2,
    y - height / 2,
    width,
    height,
  );
  ctx.restore();
  return true;
}
