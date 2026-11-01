"use client";

import { useEffect, useEffectEvent, useSyncExternalStore } from "react";

export const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
export const lerp = (from: number, to: number, amount: number) => from + (to - from) * amount;

/** Runs `callback` on every animation frame while mounted and enabled. */
export function useFrame(callback: (time: number) => void, enabled = true) {
  const onFrame = useEffectEvent(callback);

  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    const loop = (time: number) => {
      onFrame(time);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [enabled]);
}

export function useMediaQuery(query: string, serverValue = false) {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

export const useReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");

const noopSubscribe = () => () => {};

/** False during server render and hydration, true afterwards. */
export const useHydrated = () =>
  useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

/** 0 when the element's top meets the viewport top, 1 when its bottom meets the viewport bottom. */
export function pinnedProgress(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const travel = rect.height - window.innerHeight;
  return travel > 0 ? clamp(-rect.top / travel) : 0;
}

export function isOnScreen(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  return rect.bottom > 0 && rect.top < window.innerHeight;
}

const fixed = (value: number) => value.toFixed(1);

/**
 * Deterministic topographic rings around one centre. Pure geometry, so the
 * server and client render identical paths.
 */
export function contourPaths(cx: number, cy: number, rings: number, base: number, gap: number, seed: number) {
  const steps = 72;
  const paths: string[] = [];

  for (let ring = 0; ring < rings; ring += 1) {
    const radius = base + ring * gap;
    const points: [number, number][] = [];
    for (let step = 0; step < steps; step += 1) {
      const angle = (step / steps) * Math.PI * 2;
      const wobble =
        1 +
        0.14 * Math.sin(3 * angle + seed + ring * 0.35) +
        0.08 * Math.sin(5 * angle - seed * 1.3 + ring * 0.22) +
        0.04 * Math.sin(9 * angle + ring * 0.5);
      points.push([cx + Math.cos(angle) * radius * wobble * 1.25, cy + Math.sin(angle) * radius * wobble]);
    }

    const [lastX, lastY] = points[steps - 1];
    let d = `M${fixed((lastX + points[0][0]) / 2)} ${fixed((lastY + points[0][1]) / 2)}`;
    for (let step = 0; step < steps; step += 1) {
      const [x, y] = points[step];
      const [nextX, nextY] = points[(step + 1) % steps];
      d += `Q${fixed(x)} ${fixed(y)} ${fixed((x + nextX) / 2)} ${fixed((y + nextY) / 2)}`;
    }
    paths.push(`${d}Z`);
  }

  return paths;
}
