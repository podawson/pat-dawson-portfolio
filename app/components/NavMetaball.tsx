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
  const hoverShapeFromRef = useRef<Capsule | null>(null);
  const hoverCurrentShapeRef = useRef<Capsule | null>(null);
  const hoverMoveStartedRef = useRef(0);
  const hoverAmountRef = useRef(0);
  const hoverTargetRef = useRef(0);
  const hoverStartedRef = useRef(0);
  const hoverFromRef = useRef(0);
  const hoverLeaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

    const hoverDuration = CORPUS_MOTION.navHoverOut;
    const hoverProgress = reducedMotionRef.current ? 1 : Math.max(0, Math.min(1, (now - hoverStartedRef.current) / hoverDuration));
    hoverAmountRef.current = hoverFromRef.current + (hoverTargetRef.current - hoverFromRef.current) * corpusEase(hoverProgress);
    const hovering = hoverProgress < 1 || Math.abs(hoverAmountRef.current - hoverTargetRef.current) > 0.002;

    const fromCapsule = capsules[fromRef.current] ?? capsules[activeRef.current];
    const toCapsule = capsules[activeRef.current];
    const transitAmount = corpusEase(transitProgress);
    const movingCapsule: Capsule = {
      ax: fromCapsule.ax + (toCapsule.ax - fromCapsule.ax) * transitAmount,
      ay: fromCapsule.ay + (toCapsule.ay - fromCapsule.ay) * transitAmount,
      bx: fromCapsule.bx + (toCapsule.bx - fromCapsule.bx) * transitAmount,
      by: fromCapsule.by + (toCapsule.by - fromCapsule.by) * transitAmount,
      radius: fromCapsule.radius + (toCapsule.radius - fromCapsule.radius) * transitAmount,
    };
    const hoverTargetCapsule = capsules[hoverIndexRef.current] ?? toCapsule;
    const hoverShapeFrom = hoverShapeFromRef.current ?? toCapsule;
    const hoverMoveProgress = reducedMotionRef.current ? 1 : Math.max(0, Math.min(1, (now - hoverMoveStartedRef.current) / hoverDuration));
    const hoverMoveAmount = corpusEase(hoverMoveProgress);
    const hoverCapsule: Capsule = {
      ax: hoverShapeFrom.ax + (hoverTargetCapsule.ax - hoverShapeFrom.ax) * hoverMoveAmount,
      ay: hoverShapeFrom.ay + (hoverTargetCapsule.ay - hoverShapeFrom.ay) * hoverMoveAmount,
      bx: hoverShapeFrom.bx + (hoverTargetCapsule.bx - hoverShapeFrom.bx) * hoverMoveAmount,
      by: hoverShapeFrom.by + (hoverTargetCapsule.by - hoverShapeFrom.by) * hoverMoveAmount,
      radius: hoverShapeFrom.radius + (hoverTargetCapsule.radius - hoverShapeFrom.radius) * hoverMoveAmount,
    };
    hoverCurrentShapeRef.current = hoverCapsule;
    const centerOf = (capsule: Capsule) => ({
      x: (capsule.ax + capsule.bx) * 0.5,
      y: (capsule.ay + capsule.by) * 0.5,
    });
    const toCenter = centerOf(toCapsule);
    const hoverCenter = centerOf(hoverCapsule);
    const hoverGap = Math.abs((hoverCapsule.ax + hoverCapsule.bx - toCapsule.ax - toCapsule.bx) * 0.5);
    const hoverBlend = CORPUS_MOTION.smoothMinRest + hoverGap * 0.08 * hoverAmountRef.current;
    const hoverToRight = hoverCenter.x >= toCenter.x;
    const activeEdge = hoverToRight
      ? toCapsule.bx + toCapsule.radius
      : toCapsule.ax - toCapsule.radius;
    const hoverEdge = hoverToRight
      ? hoverCapsule.ax - hoverCapsule.radius
      : hoverCapsule.bx + hoverCapsule.radius;
    const hoverBridgeCapsule: Capsule = {
      ax: activeEdge,
      ay: toCenter.y,
      bx: hoverEdge,
      by: hoverCenter.y,
      radius: Math.min(toCapsule.radius, hoverCapsule.radius) * 0.28,
    };
    const color = inverse ? [224, 226, 222] : [62, 67, 65];

    for (let py = 0; py < height; py += 1) {
      const y = py / ratio;
      for (let px = 0; px < width; px += 1) {
        const x = px / ratio;
        const activeDistance = capsuleDistance(x, y, movingCapsule, 1);
        const distanceHoverBridge = capsuleDistance(x, y, hoverBridgeCapsule, Math.sqrt(hoverAmountRef.current));
        const distanceHover = capsuleDistance(x, y, hoverCapsule, hoverAmountRef.current);
        const hoverDistance = corpusSmoothMin(distanceHoverBridge, distanceHover, hoverBlend);
        const antialias = 0.9 / ratio;
        const activeFill = 1 - Math.max(0, Math.min(1, (activeDistance + antialias) / (antialias * 2)));
        const activeRim = Math.max(0, 1 - Math.abs(activeDistance) / 2.2) * 0.42;
        const hoverFill = 1 - Math.max(0, Math.min(1, (hoverDistance + antialias) / (antialias * 2)));
        const hoverRim = Math.max(0, 1 - Math.abs(hoverDistance) / 2.2) * 0.42;
        const alpha = Math.max(0, Math.min(255, Math.round((
          activeFill * 0.88
          + activeRim * 0.11
          + hoverFill * 0.30 * hoverAmountRef.current
          + hoverRim * 0.07 * hoverAmountRef.current
        ) * 255)));
        const offset = (py * width + px) * 4;
        image.data[offset] = color[0];
        image.data[offset + 1] = color[1];
        image.data[offset + 2] = color[2];
        image.data[offset + 3] = alpha;
      }
    }
    context.putImageData(image, 0, 0);

    if (transiting || hovering || hoverMoveProgress < 1) frameRef.current = requestAnimationFrame((time) => drawFrameRef.current(time));
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
        ax: box.left - bounds.left + 15,
        ay: centerY,
        bx: box.right - bounds.left - 15,
        by: centerY,
        radius: Math.min(14, Math.max(11, box.height / 2 - 3)),
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
      if (hoverLeaveTimerRef.current) clearTimeout(hoverLeaveTimerRef.current);
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
    if (target > 0 && index !== hoverIndexRef.current) {
      hoverShapeFromRef.current = hoverCurrentShapeRef.current ?? capsulesRef.current[activeRef.current] ?? null;
      hoverMoveStartedRef.current = performance.now();
    }
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
      const enter = () => {
        if (hoverLeaveTimerRef.current) {
          clearTimeout(hoverLeaveTimerRef.current);
          hoverLeaveTimerRef.current = null;
        }
        setHover(index, index === activeRef.current ? 0 : 0.58);
      };
      const leave = () => {
        if (hoverLeaveTimerRef.current) clearTimeout(hoverLeaveTimerRef.current);
        hoverLeaveTimerRef.current = setTimeout(() => {
          setHover(index, 0);
          hoverLeaveTimerRef.current = null;
        }, 36);
      };
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
    return () => {
      if (hoverLeaveTimerRef.current) clearTimeout(hoverLeaveTimerRef.current);
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [navRef, setHover]);

  return <canvas aria-hidden="true" className="nav-metaball" ref={canvasRef} />;
}
