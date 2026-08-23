"use client";

import { useCallback, useEffect, useRef } from "react";
import { CORPUS_MOTION, corpusEase, corpusSmoothMin } from "../visualMotion";

type NavMetaballProps = {
  activeIndex: number;
  inverse: boolean;
  navRef: React.RefObject<HTMLElement | null>;
};

type Capsule = { ax: number; ay: number; bx: number; by: number; radius: number };

const routeMemoryKey = "patrick-portfolio-nav-from";

function capsuleDistance(x: number, y: number, capsule: Capsule, amplitude: number) {
  if (amplitude < 0.002) return 10000;
  const radius = capsule.radius * amplitude;
  const pax = x - capsule.ax;
  const pay = y - capsule.ay;
  const bax = capsule.bx - capsule.ax;
  const bay = capsule.by - capsule.ay;
  const denominator = bax * bax + bay * bay;
  const projection = denominator ? Math.max(0, Math.min(1, (pax * bax + pay * bay) / denominator)) : 0;
  return Math.hypot(pax - bax * projection, pay - bay * projection) - radius;
}

export function rememberNavOrigin(index: number) {
  try { sessionStorage.setItem(routeMemoryKey, String(index)); } catch { /* storage is optional */ }
}

export function NavMetaball({ activeIndex, inverse, navRef }: NavMetaballProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const capsulesRef = useRef<Capsule[]>([]);
  const activeRef = useRef(activeIndex);
  const fromRef = useRef(activeIndex);
  const transitStartRef = useRef(0);
  const hoverIndexRef = useRef(-1);
  const hoverAmountRef = useRef(0);
  const hoverTargetRef = useRef(0);
  const hoverStartedRef = useRef(0);
  const hoverFromRef = useRef(0);
  const frameRef = useRef(0);
  const drawFrameRef = useRef<(now?: number) => void>(() => undefined);
  const reducedMotionRef = useRef(false);

  const draw = useCallback((now = performance.now()) => {
    frameRef.current = 0;
    const canvas = canvasRef.current;
    const capsules = capsulesRef.current;
    if (!canvas || !capsules.length || !capsules[activeRef.current]) return;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const ratio = Math.max(1, canvas.width / Math.max(1, canvas.getBoundingClientRect().width));
    const width = canvas.width;
    const height = canvas.height;
    const image = context.createImageData(width, height);
    const transitElapsed = now - transitStartRef.current;
    const transitProgress = reducedMotionRef.current ? 1 : Math.max(0, Math.min(1, transitElapsed / CORPUS_MOTION.navTransit));
    const transiting = fromRef.current !== activeRef.current && transitProgress < 1;
    const fromAmount = transiting ? 1 - transitProgress * transitProgress : 0;
    const delayedProgress = Math.max(0, Math.min(1, (transitProgress - 0.25) / 0.75));
    const toAmount = transiting ? 1 - Math.pow(1 - delayedProgress, 3) : 1;

    const hoverDuration = hoverTargetRef.current > hoverFromRef.current ? CORPUS_MOTION.navHoverIn : CORPUS_MOTION.navHoverOut;
    const hoverProgress = reducedMotionRef.current ? 1 : Math.max(0, Math.min(1, (now - hoverStartedRef.current) / hoverDuration));
    hoverAmountRef.current = hoverFromRef.current + (hoverTargetRef.current - hoverFromRef.current) * corpusEase(hoverProgress);
    const hovering = hoverProgress < 1 || Math.abs(hoverAmountRef.current - hoverTargetRef.current) > 0.002;

    const fromCapsule = capsules[fromRef.current] ?? capsules[activeRef.current];
    const toCapsule = capsules[activeRef.current];
    const hoverCapsule = capsules[hoverIndexRef.current] ?? toCapsule;
    const centerGap = Math.abs((fromCapsule.ax + fromCapsule.bx - toCapsule.ax - toCapsule.bx) * 0.5);
    const bridge = transiting ? Math.pow(Math.sin(Math.PI * transitProgress), 0.72) : 0;
    const blend = CORPUS_MOTION.smoothMinRest + centerGap * 1.8 * bridge;
    const hoverGap = Math.abs((hoverCapsule.ax + hoverCapsule.bx - toCapsule.ax - toCapsule.bx) * 0.5);
    const hoverBlend = CORPUS_MOTION.smoothMinRest + hoverGap * 0.24 * hoverAmountRef.current;
    const color = inverse ? [245, 241, 232] : [23, 32, 27];

    for (let py = 0; py < height; py += 1) {
      const y = py / ratio;
      for (let px = 0; px < width; px += 1) {
        const x = px / ratio;
        const distanceFrom = capsuleDistance(x, y, fromCapsule, fromAmount);
        const distanceTo = capsuleDistance(x, y, toCapsule, toAmount);
        const distanceHover = capsuleDistance(x, y, hoverCapsule, hoverAmountRef.current * 0.6);
        const activeDistance = corpusSmoothMin(distanceFrom, distanceTo, blend);
        const distance = corpusSmoothMin(activeDistance, distanceHover, hoverBlend);
        const antialias = 0.9 / ratio;
        const fill = 1 - Math.max(0, Math.min(1, (distance + antialias) / (antialias * 2)));
        const rim = Math.max(0, 1 - Math.abs(distance) / 2.2) * 0.42;
        const alpha = Math.max(0, Math.min(255, Math.round((fill * 0.105 + rim * 0.045) * 255)));
        const offset = (py * width + px) * 4;
        image.data[offset] = color[0];
        image.data[offset + 1] = color[1];
        image.data[offset + 2] = color[2];
        image.data[offset + 3] = alpha;
      }
    }
    context.putImageData(image, 0, 0);

    if (transiting || hovering) frameRef.current = requestAnimationFrame((time) => drawFrameRef.current(time));
  }, [inverse]);

  useEffect(() => { drawFrameRef.current = draw; }, [draw]);

  const schedule = useCallback(() => {
    if (!frameRef.current) frameRef.current = requestAnimationFrame((time) => drawFrameRef.current(time));
  }, []);

  const measure = useCallback(() => {
    const canvas = canvasRef.current;
    const nav = navRef.current;
    if (!canvas || !nav) return;
    const links = Array.from(nav.querySelectorAll<HTMLElement>("[data-nav-item]"));
    const bounds = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(bounds.width * ratio));
    canvas.height = Math.max(1, Math.round(bounds.height * ratio));
    capsulesRef.current = links.map((link) => {
      const box = link.getBoundingClientRect();
      const centerY = box.top - bounds.top + box.height / 2;
      return {
        ax: box.left - bounds.left + 12,
        ay: centerY,
        bx: box.right - bounds.left - 12,
        by: centerY,
        radius: Math.min(18, box.height / 2 + 2),
      };
    });
    schedule();
  }, [navRef, schedule]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => { reducedMotionRef.current = media.matches; };
    updateMotion();
    media.addEventListener("change", updateMotion);
    window.addEventListener("resize", measure);
    document.fonts.ready.then(measure);
    measure();
    return () => {
      media.removeEventListener("change", updateMotion);
      window.removeEventListener("resize", measure);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [measure]);

  useEffect(() => {
    let remembered = activeRef.current;
    try {
      const stored = Number(sessionStorage.getItem(routeMemoryKey));
      if (Number.isInteger(stored)) remembered = stored;
      sessionStorage.removeItem(routeMemoryKey);
    } catch { /* storage is optional */ }
    fromRef.current = remembered;
    activeRef.current = activeIndex;
    transitStartRef.current = performance.now();
    measure();
    schedule();
  }, [activeIndex, measure, schedule]);

  const setHover = useCallback((index: number, target: number) => {
    if (reducedMotionRef.current) return;
    hoverIndexRef.current = index;
    hoverFromRef.current = hoverAmountRef.current;
    hoverTargetRef.current = target;
    hoverStartedRef.current = performance.now();
    schedule();
  }, [schedule]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const links = Array.from(nav.querySelectorAll<HTMLElement>("[data-nav-item]"));
    const cleanups = links.map((link, index) => {
      const enter = () => { if (index !== activeRef.current) setHover(index, 1); };
      const leave = () => setHover(index, 0);
      link.addEventListener("pointerenter", enter);
      link.addEventListener("pointerleave", leave);
      link.addEventListener("focus", enter);
      link.addEventListener("blur", leave);
      return () => {
        link.removeEventListener("pointerenter", enter);
        link.removeEventListener("pointerleave", leave);
        link.removeEventListener("focus", enter);
        link.removeEventListener("blur", leave);
      };
    });
    return () => cleanups.forEach((cleanup) => cleanup());
  }, [navRef, setHover]);

  return <canvas aria-hidden="true" className="nav-metaball" ref={canvasRef} />;
}
