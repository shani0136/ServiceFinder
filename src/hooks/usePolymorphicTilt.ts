import { useRef, useEffect, useCallback } from 'react';

interface PolymorphicTiltOptions {
  maxTilt?: number;      // Maximum tilt angle in degrees (default: 12)
  scale?: number;        // Hover scale factor (default: 1.03)
  perspective?: number;  // Perspective distance (default: 900)
  speed?: number;        // Transition speed ms on leave (default: 400)
  glare?: boolean;       // Enable dynamic pointer flare (default: true)
}

/**
 * usePolymorphicTilt
 * High-performance pointer & touch-tracking 3D polymorphic tilt hook.
 * Updates CSS custom properties (--px, --py, --rx, --ry) directly on the DOM element
 * to guarantee 120fps butter-smooth rendering without triggering React re-renders.
 */
export function usePolymorphicTilt<T extends HTMLElement = HTMLButtonElement>(
  options: PolymorphicTiltOptions = {}
) {
  const {
    maxTilt = 10,
    scale = 1.025,
    perspective = 900,
    speed = 350,
    glare = true,
  } = options;

  const elementRef = useRef<T | null>(null);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    const el = elementRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // Constrain 0 to 1
    const clampedX = Math.max(0, Math.min(1, x));
    const clampedY = Math.max(0, Math.min(1, y));

    // Tilt angles
    const rx = (0.5 - clampedY) * (maxTilt * 2);
    const ry = (clampedX - 0.5) * (maxTilt * 2);

    el.style.transition = 'transform 80ms ease-out, box-shadow 80ms ease-out';
    el.style.transform = `perspective(${perspective}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-4px) scale3d(${scale}, ${scale}, ${scale})`;

    if (glare) {
      el.style.setProperty('--px', `${(clampedX * 100).toFixed(1)}%`);
      el.style.setProperty('--py', `${(clampedY * 100).toFixed(1)}%`);
      el.style.setProperty('--sheen-opacity', '1');
    }
  }, [maxTilt, scale, perspective, glare]);

  const handlePointerDown = useCallback(() => {
    const el = elementRef.current;
    if (!el) return;
    el.style.transition = 'transform 120ms ease-out';
    el.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) translateY(1px) scale3d(0.97, 0.97, 0.97)`;
    el.style.setProperty('--is-pressed', '1');
  }, [perspective]);

  const handlePointerUp = useCallback(() => {
    const el = elementRef.current;
    if (!el) return;
    el.style.setProperty('--is-pressed', '0');
  }, []);

  const handlePointerLeave = useCallback(() => {
    const el = elementRef.current;
    if (!el) return;

    el.style.transition = `transform ${speed}ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow ${speed}ms ease`;
    el.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) translateY(0px) scale3d(1, 1, 1)`;
    el.style.setProperty('--sheen-opacity', '0');
    el.style.setProperty('--is-pressed', '0');
  }, [perspective, speed]);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    el.addEventListener('pointermove', handlePointerMove);
    el.addEventListener('pointerdown', handlePointerDown);
    el.addEventListener('pointerup', handlePointerUp);
    el.addEventListener('pointerleave', handlePointerLeave);
    el.addEventListener('pointercancel', handlePointerLeave);

    return () => {
      el.removeEventListener('pointermove', handlePointerMove);
      el.removeEventListener('pointerdown', handlePointerDown);
      el.removeEventListener('pointerup', handlePointerUp);
      el.removeEventListener('pointerleave', handlePointerLeave);
      el.removeEventListener('pointercancel', handlePointerLeave);
    };
  }, [handlePointerMove, handlePointerDown, handlePointerUp, handlePointerLeave]);

  return elementRef;
}

export default usePolymorphicTilt;
