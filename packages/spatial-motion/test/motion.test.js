const test = require('node:test');
const assert = require('node:assert');

// Test the core mathematical algorithms of spatial-motion
function createSpringEasing(config = {}) {
  const { stiffness = 260, damping = 20, mass = 1 } = config;
  const zeta = damping / (2 * Math.sqrt(Math.max(stiffness, 1) * Math.max(mass, 0.1)));

  if (zeta < 0.7) {
    return 'cubic-bezier(0.34, 1.56, 0.64, 1)';
  } else if (zeta < 1) {
    return 'cubic-bezier(0.25, 1.25, 0.5, 1)';
  } else {
    return 'cubic-bezier(0.16, 1, 0.3, 1)';
  }
}

function magneticPull(rect, clientX, clientY, options = {}) {
  const { strength = 0.35, maxDistance = 14 } = options;
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const deltaX = (clientX - centerX) * strength;
  const deltaY = (clientY - centerY) * strength;

  const clampedX = Math.max(-maxDistance, Math.min(maxDistance, deltaX));
  const clampedY = Math.max(-maxDistance, Math.min(maxDistance, deltaY));

  return { x: clampedX, y: clampedY };
}

test('@docwyrm/spatial-motion: Spring physics curves and damping ratios', () => {
  // 1. Underdamped (bouncy, zeta ~ 0.25)
  const bouncy = createSpringEasing({ stiffness: 400, damping: 10, mass: 1 });
  assert.strictEqual(bouncy, 'cubic-bezier(0.34, 1.56, 0.64, 1)');

  // 2. Snappy damping (zeta ~ 0.806, between 0.7 and 1.0)
  const snappy = createSpringEasing({ stiffness: 260, damping: 26, mass: 1 });
  assert.strictEqual(snappy, 'cubic-bezier(0.25, 1.25, 0.5, 1)');

  // 3. Overdamped / Critically damped (zeta ~ 1.25, smooth glide)
  const smooth = createSpringEasing({ stiffness: 100, damping: 25, mass: 1 });
  assert.strictEqual(smooth, 'cubic-bezier(0.16, 1, 0.3, 1)');
});

test('@docwyrm/spatial-motion: Magnetic cursor pull displacement', () => {
  const rect = { left: 100, top: 100, width: 200, height: 50 }; // center at 200, 125
  const result = magneticPull(rect, 220, 135, { strength: 0.5, maxDistance: 20 });
  
  assert.strictEqual(result.x, 10); // (220 - 200) * 0.5 = 10
  assert.strictEqual(result.y, 5);  // (135 - 125) * 0.5 = 5

  // Clamping test
  const clamped = magneticPull(rect, 500, 500, { strength: 0.5, maxDistance: 14 });
  assert.strictEqual(clamped.x, 14);
  assert.strictEqual(clamped.y, 14);
});
