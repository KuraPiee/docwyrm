/**
 * @docwyrm/spatial-motion
 * Physics-based spring animations, spatial tree transitions, and diff illumination.
 * Built by Docwyrm Team (@KuraPiee) for the open-source community.
 *
 * Standalone repository: https://github.com/KuraPiee/spatial-motion
 */

export interface SpringConfig {
  stiffness?: number; // default: 260
  damping?: number;   // default: 20
  mass?: number;      // default: 1
  initialVelocity?: number; // default: 0
}

export interface SpatialTreeOptions {
  durationMs?: number;
  stiffness?: number;
  damping?: number;
}

export interface MagneticOptions {
  strength?: number; // 0 to 1, default: 0.35
  maxDistance?: number; // max pull in px, default: 12
}

/**
 * Calculates a physics-based spring cubic-bezier approximation.
 * Based on damped harmonic oscillator mechanics:
 *   omega_0 = sqrt(k / m)
 *   zeta    = d / (2 * sqrt(k * m))
 */
export function createSpringEasing(config: SpringConfig = {}): string {
  const { stiffness = 260, damping = 20, mass = 1 } = config;

  // Accessibility: Respect user prefers-reduced-motion
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return 'linear';
  }

  // Calculate damping ratio (zeta)
  const zeta = damping / (2 * Math.sqrt(Math.max(stiffness, 1) * Math.max(mass, 0.1)));

  if (zeta < 0.7) {
    // Underdamped: pronounced bouncy return
    return 'cubic-bezier(0.34, 1.56, 0.64, 1)';
  } else if (zeta < 1) {
    // Lightly damped: crisp snappy bounce
    return 'cubic-bezier(0.25, 1.25, 0.5, 1)';
  } else {
    // Critically damped or overdamped: smooth zero-overshoot glide
    return 'cubic-bezier(0.16, 1, 0.3, 1)';
  }
}

/**
 * Applies a smooth spatial accordion expand/collapse transition to an element
 * using the Web Animations API (WAAPI) with hardware acceleration.
 */
export function spatialTreeTransition(
  element: HTMLElement,
  isExpanded: boolean,
  options: SpatialTreeOptions = {}
): Animation | null {
  if (!element || typeof element.animate !== 'function') return null;

  const { durationMs = 240, stiffness = 280, damping = 22 } = options;

  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    element.style.display = isExpanded ? 'block' : 'none';
    return null;
  }

  const easing = createSpringEasing({ stiffness, damping });

  if (isExpanded) {
    element.style.display = 'block';
    const targetHeight = element.scrollHeight;
    return element.animate(
      [
        { height: '0px', opacity: 0, transform: 'translateY(-6px)' },
        { height: `${targetHeight}px`, opacity: 1, transform: 'translateY(0px)' },
      ],
      {
        duration: durationMs,
        easing,
        fill: 'forwards',
      }
    );
  } else {
    const currentHeight = element.scrollHeight;
    const anim = element.animate(
      [
        { height: `${currentHeight}px`, opacity: 1, transform: 'translateY(0px)' },
        { height: '0px', opacity: 0, transform: 'translateY(-6px)' },
      ],
      {
        duration: durationMs * 0.85,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        fill: 'forwards',
      }
    );
    anim.onfinish = () => {
      element.style.display = 'none';
    };
    return anim;
  }
}

/**
 * Illuminates an element with frosted-glass glow for visual Git diff inspection.
 */
export function glassDiffGlow(
  element: HTMLElement,
  type: 'added' | 'deleted' | 'modified' = 'added',
  duration: number = 900
): Animation | null {
  if (!element || typeof element.animate !== 'function') return null;

  const colorMap = {
    added: 'rgba(16, 185, 129, 0.45)',    // Emerald
    deleted: 'rgba(239, 68, 68, 0.45)',   // Crimson
    modified: 'rgba(245, 158, 11, 0.45)', // Amber
  };

  const color = colorMap[type] || colorMap.added;
  const keyframes = [
    { boxShadow: `0 0 0px ${color}`, filter: 'brightness(1)' },
    { boxShadow: `0 0 20px ${color}`, filter: 'brightness(1.08)' },
    { boxShadow: `0 0 0px ${color}`, filter: 'brightness(1)' },
  ];

  return element.animate(keyframes, {
    duration,
    easing: 'ease-out',
  });
}

/**
 * Calculates a magnetic pull displacement vector for cursor attraction.
 */
export function magneticPull(
  rect: DOMRect,
  clientX: number,
  clientY: number,
  options: MagneticOptions = {}
): { x: number; y: number } {
  const { strength = 0.35, maxDistance = 14 } = options;

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const deltaX = (clientX - centerX) * strength;
  const deltaY = (clientY - centerY) * strength;

  // Clamp to max distance
  const clampedX = Math.max(-maxDistance, Math.min(maxDistance, deltaX));
  const clampedY = Math.max(-maxDistance, Math.min(maxDistance, deltaY));

  return { x: clampedX, y: clampedY };
}

/**
 * Injects CSS variables for real-time theme customization
 */
export function injectThemeTokens(tokens: Record<string, string>): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  for (const [key, val] of Object.entries(tokens)) {
    root.style.setProperty(`--${key}`, val);
  }
}
