function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function clampCircleToBounds(circle, bounds) {
  if (!bounds) {
    return;
  }

  const minX = bounds.x + circle.radius;
  const maxX = bounds.x + bounds.w - circle.radius;
  const minY = bounds.y + circle.radius;
  const maxY = bounds.y + bounds.h - circle.radius;

  circle.x = maxX >= minX ? clamp(circle.x, minX, maxX) : bounds.x + bounds.w / 2;
  circle.y = maxY >= minY ? clamp(circle.y, minY, maxY) : bounds.y + bounds.h / 2;
}

export function circleRectCollision(circle, rect) {
  const closestX = clamp(circle.x, rect.x, rect.x + rect.w);
  const closestY = clamp(circle.y, rect.y, rect.y + rect.h);
  const dx = circle.x - closestX;
  const dy = circle.y - closestY;
  return dx * dx + dy * dy < circle.radius * circle.radius;
}

export function resolveCircleRect(circle, rect) {
  const closestX = clamp(circle.x, rect.x, rect.x + rect.w);
  const closestY = clamp(circle.y, rect.y, rect.y + rect.h);
  const dx = circle.x - closestX;
  const dy = circle.y - closestY;
  const distance = Math.hypot(dx, dy);

  if (distance >= circle.radius) {
    return false;
  }

  if (distance === 0) {
    const left = circle.x - rect.x;
    const right = rect.x + rect.w - circle.x;
    const top = circle.y - rect.y;
    const bottom = rect.y + rect.h - circle.y;
    const minimum = Math.min(left, right, top, bottom);

    if (minimum === left) {
      circle.x = rect.x - circle.radius;
    } else if (minimum === right) {
      circle.x = rect.x + rect.w + circle.radius;
    } else if (minimum === top) {
      circle.y = rect.y - circle.radius;
    } else {
      circle.y = rect.y + rect.h + circle.radius;
    }
    return true;
  }

  const overlap = circle.radius - distance;
  circle.x += (dx / distance) * overlap;
  circle.y += (dy / distance) * overlap;
  return true;
}

export function circleCircleCollision(a, b) {
  const radius = a.radius + b.radius;
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy < radius * radius;
}

export function moveCircleWithCollisions(circle, deltaX, deltaY, bounds, obstacles = []) {
  if (deltaX !== 0) {
    circle.x += deltaX;
    clampCircleToBounds(circle, bounds);
    for (const obstacle of obstacles) {
      resolveCircleRect(circle, obstacle);
    }
  }

  if (deltaY !== 0) {
    circle.y += deltaY;
    clampCircleToBounds(circle, bounds);
    for (const obstacle of obstacles) {
      resolveCircleRect(circle, obstacle);
    }
  }

  for (let pass = 0; pass < 2; pass += 1) {
    for (const obstacle of obstacles) {
      resolveCircleRect(circle, obstacle);
    }
  }

  clampCircleToBounds(circle, bounds);
}
