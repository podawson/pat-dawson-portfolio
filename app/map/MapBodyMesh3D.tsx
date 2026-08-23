"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { MarchingCubes } from "three/addons/objects/MarchingCubes.js";
import { mapEdges3D, mapNodes3D } from "./graphGeometry";

type MapBody3DProps = {
  activeSlug: string | null;
  emphasizedSlugs?: readonly string[];
  highlightedNeighbors?: readonly string[];
  onAxisPositionsChange?: (positions: Readonly<Record<"story" | "compute" | "atmosphere" | "architecture" | "center", { x: number; y: number; visible: boolean }>>) => void;
  onReadyChange: (ready: boolean) => void;
  onNodePositionsChange?: (positions: ReadonlyArray<{ x: number; y: number; visible: boolean }>) => void;
  onResetMap?: () => void;
};

const MAX_RELATED = 4;
const MAX_EMPHASIZED = 14;
const DEFAULT_ROTATION = new THREE.Euler(-0.09, 0.12, -0.025, "YXZ");

function fieldPosition(index: number) {
  const node = mapNodes3D[index];
  return new THREE.Vector3(
    THREE.MathUtils.lerp(0.09, 0.91, node.x),
    THREE.MathUtils.lerp(0.09, 0.91, node.y),
    THREE.MathUtils.clamp(0.5 + node.z * 0.20 + Math.sin(index * 1.83) * 0.018, 0.23, 0.77),
  );
}

function localPosition(fieldPoint: THREE.Vector3) {
  return fieldPoint.clone().multiplyScalar(2).subScalar(1);
}

function quadraticPoint(a: THREE.Vector3, control: THREE.Vector3, b: THREE.Vector3, amount: number) {
  const inverse = 1 - amount;
  return a.clone().multiplyScalar(inverse * inverse)
    .add(control.clone().multiplyScalar(2 * inverse * amount))
    .add(b.clone().multiplyScalar(amount * amount));
}

const vertexShader = `
  #define MAX_EMPHASIZED ${MAX_EMPHASIZED}
  uniform vec3 uActivePoint;
  uniform vec3 uPreviousPoint;
  uniform vec3 uEmphasizedPoints[MAX_EMPHASIZED];
  uniform vec3 uPreviousEmphasizedPoints[MAX_EMPHASIZED];
  uniform float uEmphasizedCount;
  uniform float uPreviousEmphasizedCount;
  uniform float uFilterTransition;
  uniform float uSelection;
  uniform float uSelectionBloom;
  uniform float uSelectionTransition;
  varying vec3 vLocalPosition;
  varying vec3 vWorldNormal;
  varying vec3 vViewPosition;
  varying float vSelectionHeat;
  varying float vFilterHeat;

  float pointField(vec3 point, vec3 fieldPoint) {
    float pointDistance = length(point - fieldPoint);
    return exp(-pointDistance * pointDistance * 8.4);
  }

  float emphasizedField(vec3 point, bool previous) {
    float heat = 0.0;
    for (int index = 0; index < MAX_EMPHASIZED; index++) {
      float count = previous ? uPreviousEmphasizedCount : uEmphasizedCount;
      if (float(index) >= count) break;
      heat += pointField(point, previous ? uPreviousEmphasizedPoints[index] : uEmphasizedPoints[index]);
    }
    return clamp(heat, 0.0, 1.35);
  }

  void main() {
    vec3 transformed = position;
    float selectedDistance = length(position - uActivePoint);
    float previousDistance = length(position - uPreviousPoint);
    float transitionIn = smoothstep(0.02, 0.96, uSelectionTransition);
    float transitionOut = 1.0 - smoothstep(0.04, 0.90, uSelectionTransition);
    float broadHeat = (exp(-selectedDistance * selectedDistance * 2.35) * transitionIn + exp(-previousDistance * previousDistance * 2.35) * transitionOut) * smoothstep(0.0, 0.72, uSelection);
    float localHeat = (exp(-selectedDistance * selectedDistance * 7.2) * transitionIn + exp(-previousDistance * previousDistance * 7.2) * transitionOut) * smoothstep(0.24, 1.0, uSelection);
    float waveRadius = mix(0.78, 0.18, uSelection);
    float travellingWave = exp(-pow(selectedDistance - waveRadius, 2.0) * 46.0) * uSelectionBloom;
    float previousFilterHeat = emphasizedField(position, true);
    float nextFilterHeat = emphasizedField(position, false);
    float filterHeat = mix(previousFilterHeat, nextFilterHeat, smoothstep(0.0, 1.0, uFilterTransition));
    float selectionHeat = max(broadHeat * 0.42, localHeat);
    transformed += normalize(normal) * (filterHeat * 0.040 + broadHeat * 0.026 + localHeat * 0.073 + travellingWave * 0.018);

    vec4 viewPosition = modelViewMatrix * vec4(transformed, 1.0);
    vLocalPosition = transformed;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vViewPosition = -viewPosition.xyz;
    vSelectionHeat = selectionHeat;
    vFilterHeat = filterHeat;
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const fragmentShader = `
  precision highp float;
  #define MAX_RELATED ${MAX_RELATED}

  uniform vec3 uRelatedPoints[MAX_RELATED];
  uniform float uRelatedCount;
  uniform float uSelection;
  uniform float uSelectionBloom;
  varying vec3 vLocalPosition;
  varying vec3 vWorldNormal;
  varying vec3 vViewPosition;
  varying float vSelectionHeat;
  varying float vFilterHeat;

  float relatedHeat(vec3 point) {
    float heat = 0.0;
    for (int index = 0; index < MAX_RELATED; index++) {
      if (float(index) >= uRelatedCount) break;
      float distanceToPoint = length(point - uRelatedPoints[index]);
      heat += exp(-distanceToPoint * distanceToPoint * 10.0) * 0.38;
    }
    return heat * uSelection;
  }

  void main() {
    vec3 normal = normalize(vWorldNormal);
    vec3 viewDirection = normalize(vViewPosition);
    vec3 keyDirection = normalize(vec3(-0.42, 0.74, 0.52));
    vec3 fillDirection = normalize(vec3(0.70, -0.12, 0.42));
    float key = max(dot(normal, keyDirection), 0.0);
    float fill = max(dot(normal, fillDirection), 0.0);
    float fresnel = pow(1.0 - max(dot(normal, viewDirection), 0.0), 2.7);
    float depthTone = clamp(vLocalPosition.z * 0.27 + vLocalPosition.y * 0.09 + 0.50, 0.0, 1.0);

    vec3 graphite = vec3(0.025, 0.040, 0.082);
    vec3 deepBlue = vec3(0.080, 0.125, 0.310);
    vec3 violet = vec3(0.255, 0.235, 0.610);
    vec3 cyan = vec3(0.245, 0.790, 0.940);
    vec3 pearl = vec3(0.760, 0.875, 0.950);

    vec3 color = mix(graphite, deepBlue, 0.56 + depthTone * 0.32);
    color = mix(color, violet, fill * 0.31);
    color += pearl * key * 0.24;
    color += mix(violet, cyan, depthTone) * fresnel * 0.62;
    color = mix(color, cyan, clamp(relatedHeat(vLocalPosition), 0.0, 0.38));
    color = mix(color, mix(violet, cyan, depthTone), clamp(vFilterHeat * 0.20, 0.0, 0.34));
    color = mix(color, pearl, clamp(vSelectionHeat * 0.68 + uSelectionBloom * vSelectionHeat * 0.18, 0.0, 0.78));

    gl_FragColor = vec4(color, 1.0);
  }
`;

export function MapBody3D({ activeSlug, emphasizedSlugs = [], highlightedNeighbors = [], onAxisPositionsChange, onReadyChange, onNodePositionsChange, onResetMap }: MapBody3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const activeSlugRef = useRef(activeSlug);
  const emphasizedSlugsRef = useRef(emphasizedSlugs);
  const highlightedNeighborsRef = useRef(highlightedNeighbors);
  const wakeRef = useRef<(() => void) | null>(null);
  const resetRef = useRef<(() => void) | null>(null);
  const [rotated, setRotated] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    activeSlugRef.current = activeSlug;
    emphasizedSlugsRef.current = emphasizedSlugs;
    highlightedNeighborsRef.current = highlightedNeighbors;
    wakeRef.current?.();
  }, [activeSlug, emphasizedSlugs, highlightedNeighbors]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 700px)").matches;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      mount.dataset.fallback = "true";
      onReadyChange(false);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x05080c, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.45));
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(mobile ? 42 : 36, 1, 0.1, 100);
    camera.position.set(0, 0, mobile ? 13.8 : 14.8);
    const nodeFields = mapNodes3D.map((_, index) => fieldPosition(index));
    const nodeLocals = nodeFields.map(localPosition);
    const projectedNodes = nodeLocals.map(() => ({ x: 0, y: 0, visible: true }));
    const axisLocals = {
      story: new THREE.Vector3(-0.82, 0, 0),
      compute: new THREE.Vector3(0.82, 0, 0),
      atmosphere: new THREE.Vector3(0, 0.82, 0),
      architecture: new THREE.Vector3(0, -0.82, 0),
      center: new THREE.Vector3(0, 0, 0),
    };
    const projectedAxes = Object.fromEntries(Object.keys(axisLocals).map((key) => [key, { x: 0, y: 0, visible: true }])) as Record<keyof typeof axisLocals, { x: number; y: number; visible: boolean }>;
    const projectedPoint = new THREE.Vector3();
    const nodeBySlug = new Map(mapNodes3D.map((node, index) => [node.slug, index]));
    const relatedPoints = Array.from({ length: MAX_RELATED }, () => new THREE.Vector3(99, 99, 99));
    const emphasizedPoints = Array.from({ length: MAX_EMPHASIZED }, () => new THREE.Vector3(99, 99, 99));
    const previousEmphasizedPoints = Array.from({ length: MAX_EMPHASIZED }, () => new THREE.Vector3(99, 99, 99));
    const uniforms = {
      uActivePoint: { value: new THREE.Vector3(99, 99, 99) },
      uPreviousPoint: { value: new THREE.Vector3(99, 99, 99) },
      uRelatedPoints: { value: relatedPoints },
      uRelatedCount: { value: 0 },
      uEmphasizedPoints: { value: emphasizedPoints },
      uPreviousEmphasizedPoints: { value: previousEmphasizedPoints },
      uEmphasizedCount: { value: 0 },
      uPreviousEmphasizedCount: { value: 0 },
      uFilterTransition: { value: 1 },
      uSelection: { value: 0 },
      uSelectionBloom: { value: 0 },
      uSelectionTransition: { value: 1 },
    };
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: false,
      depthWrite: true,
      depthTest: true,
      side: THREE.DoubleSide,
    });

    // Generate the fused topology once. Interaction below only rasterizes this
    // mesh; it never solves the implicit field again per pixel or per frame.
    const body = new MarchingCubes(mobile ? 44 : 54, material, false, false, 90000);
    body.isolation = 80;
    body.reset();
    nodeFields.forEach((point, index) => {
      body.addBall(point.x, point.y, point.z, 0.20 + mapNodes3D[index].radius * 0.055, 12);
    });
    mapEdges3D.forEach((edge, edgeIndex) => {
      const fromIndex = nodeBySlug.get(edge.from.slug);
      const toIndex = nodeBySlug.get(edge.to.slug);
      if (fromIndex === undefined || toIndex === undefined) return;
      const a = nodeFields[fromIndex];
      const b = nodeFields[toIndex];
      const distance = a.distanceTo(b);
      const control = a.clone().lerp(b, 0.5);
      control.z -= 0.025 + distance * 0.055;
      control.y += (edgeIndex % 2 ? 1 : -1) * Math.min(0.025, distance * 0.04);
      const samples = THREE.MathUtils.clamp(Math.ceil(distance * 27), 6, 18);
      for (let sample = 1; sample < samples; sample += 1) {
        const amount = sample / samples;
        const point = quadraticPoint(a, control, b, amount);
        const taper = 1 - Math.abs(amount - 0.5) * 0.34;
        body.addBall(point.x, point.y, point.z, 0.033 * edge.thickness * taper, 12);
      }
    });
    body.update();
    body.geometry.computeBoundingSphere();
    body.scale.set(mobile ? 4.15 : 5.65, mobile ? 4.65 : 3.85, mobile ? 3.5 : 3.8);
    body.rotation.copy(DEFAULT_ROTATION);
    body.position.set(mobile ? 0 : 0.28, mobile ? -0.32 : 0.02, 0);
    scene.add(body);

    let scheduledFrame = 0;
    let inViewport = true;
    let previousFrame = performance.now();
    let renderUntil = performance.now() + 500;
    let selection = 0;
    let selectionTarget = 0;
    let selectionFrom = 0;
    let selectionDuration = 1500;
    let selectionStarted = performance.now();
    let lastRelationKey: string | undefined;
    let lastActiveIndex: number | undefined;
    let lastFilterKey = "";
    let filterStarted = performance.now();
    let filterDuration = 1300;
    let isDragging = false;
    const defaultQuaternion = new THREE.Quaternion().setFromEuler(DEFAULT_ROTATION);
    const rotationQuaternion = defaultQuaternion.clone();
    const dragVector = new THREE.Vector3();
    const nextDragVector = new THREE.Vector3();
    const inertiaQuaternion = new THREE.Quaternion();
    const identityQuaternion = new THREE.Quaternion();
    const dragDelta = new THREE.Quaternion();
    let resetRequested = false;
    let rotationFlag = false;

    const trackballPoint = (clientX: number, clientY: number, target: THREE.Vector3) => {
      const bounds = mount.getBoundingClientRect();
      const x = ((clientX - bounds.left) / Math.max(1, bounds.width)) * 2 - 1;
      const y = -(((clientY - bounds.top) / Math.max(1, bounds.height)) * 2 - 1);
      const radiusSquared = x * x + y * y;
      if (radiusSquared <= 1) target.set(x, y, Math.sqrt(1 - radiusSquared));
      else target.set(x, y, 0).normalize();
      return target;
    };

    const schedule = () => {
      if (!scheduledFrame && inViewport && !document.hidden) scheduledFrame = requestAnimationFrame(draw);
    };
    const wake = (duration = 900) => {
      renderUntil = Math.max(renderUntil, performance.now() + duration);
      schedule();
    };
    wakeRef.current = () => wake(activeSlugRef.current ? 1050 : 450);

    const resize = () => {
      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(1, mount.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      wake(250);
    };
    resize();
    window.addEventListener("resize", resize);

    const updateRotationFlag = () => {
      const changed = rotationQuaternion.angleTo(defaultQuaternion) > 0.025;
      if (changed !== rotationFlag) {
        rotationFlag = changed;
        setRotated(changed);
      }
    };
    resetRef.current = () => {
      resetRequested = true;
      inertiaQuaternion.identity();
      wake(850);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      if (event.target instanceof Element && event.target.closest(".map-reset-view")) return;
      isDragging = true;
      resetRequested = false;
      trackballPoint(event.clientX, event.clientY, dragVector);
      inertiaQuaternion.identity();
      mount.setPointerCapture(event.pointerId);
      setDragging(true);
      wake(800);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!isDragging) return;
      trackballPoint(event.clientX, event.clientY, nextDragVector);
      dragDelta.setFromUnitVectors(dragVector, nextDragVector);
      rotationQuaternion.premultiply(dragDelta).normalize();
      inertiaQuaternion.copy(dragDelta);
      dragVector.copy(nextDragVector);
      updateRotationFlag();
      wake(500);
    };
    const onPointerUp = (event: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;
      setDragging(false);
      if (mount.hasPointerCapture(event.pointerId)) mount.releasePointerCapture(event.pointerId);
      wake(1200);
    };
    mount.addEventListener("pointerdown", onPointerDown);
    mount.addEventListener("pointermove", onPointerMove);
    mount.addEventListener("pointerup", onPointerUp);
    mount.addEventListener("pointercancel", onPointerUp);
    mount.style.touchAction = "none";

    function updateSelection(now: number) {
      const active = activeSlugRef.current;
      const activeIndex = active ? nodeBySlug.get(active) : undefined;
      const relationKey = highlightedNeighborsRef.current.join(",");
      if (relationKey !== lastRelationKey) {
        relatedPoints.forEach((point) => point.set(99, 99, 99));
        if (activeIndex !== undefined) {
          const neighbors = new Set<number>(highlightedNeighborsRef.current.flatMap((slug) => {
            const index = nodeBySlug.get(slug);
            return index === undefined ? [] : [index];
          }));
          [...neighbors].slice(0, MAX_RELATED).forEach((index, relatedIndex) => relatedPoints[relatedIndex].copy(nodeLocals[index]));
          uniforms.uRelatedCount.value = Math.min(neighbors.size, MAX_RELATED);
        } else {
          uniforms.uRelatedCount.value = 0;
        }
        lastRelationKey = relationKey;
        wake(700);
      }
      if (activeIndex !== lastActiveIndex) {
        uniforms.uPreviousPoint.value.copy(lastActiveIndex === undefined ? new THREE.Vector3(99, 99, 99) : nodeLocals[lastActiveIndex]);
        if (activeIndex !== undefined) {
          uniforms.uActivePoint.value.copy(nodeLocals[activeIndex]);
          selectionFrom = selection;
          selectionTarget = 1;
          selectionDuration = 1650;
        } else {
          uniforms.uActivePoint.value.set(99, 99, 99);
          selectionFrom = selection;
          selectionTarget = 0;
          selectionDuration = 900;
        }
        selectionStarted = now;
        lastActiveIndex = activeIndex;
        wake(selectionDuration + 180);
      }
      const progress = reduceMotion ? 1 : THREE.MathUtils.clamp((now - selectionStarted) / selectionDuration, 0, 1);
      const eased = progress * progress * (3 - 2 * progress);
      selection = THREE.MathUtils.lerp(selectionFrom, selectionTarget, eased);
      uniforms.uSelection.value = selection;
      uniforms.uSelectionBloom.value = reduceMotion ? 0 : Math.sin(progress * Math.PI) * (1 - progress * 0.18);
      uniforms.uSelectionTransition.value = lastActiveIndex === undefined ? 0 : eased;

      const filterKey = emphasizedSlugsRef.current.join(",");
      if (filterKey !== lastFilterKey) {
        previousEmphasizedPoints.forEach((point, index) => point.copy(emphasizedPoints[index]));
        uniforms.uPreviousEmphasizedCount.value = uniforms.uEmphasizedCount.value;
        emphasizedPoints.forEach((point) => point.set(99, 99, 99));
        const indices = emphasizedSlugsRef.current.flatMap((slug) => {
          const index = nodeBySlug.get(slug);
          return index === undefined ? [] : [index];
        }).slice(0, MAX_EMPHASIZED);
        indices.forEach((index, emphasizedIndex) => emphasizedPoints[emphasizedIndex].copy(nodeLocals[index]));
        uniforms.uEmphasizedCount.value = indices.length;
        uniforms.uFilterTransition.value = 0;
        filterStarted = now;
        filterDuration = 1300;
        lastFilterKey = filterKey;
        wake(filterDuration + 120);
      }
      const filterProgress = reduceMotion ? 1 : THREE.MathUtils.clamp((now - filterStarted) / filterDuration, 0, 1);
      uniforms.uFilterTransition.value = filterProgress * filterProgress * (3 - 2 * filterProgress);
      return progress < 1 || filterProgress < 1;
    }

    function draw(now: number) {
      scheduledFrame = 0;
      if (!inViewport || document.hidden) return;
      const delta = Math.min(2, Math.max(0.35, (now - previousFrame) / 16.67));
      previousFrame = now;
      const selectionChanging = updateSelection(now);
      if (resetRequested) {
        rotationQuaternion.slerp(defaultQuaternion, 1 - Math.pow(0.78, delta));
        if (rotationQuaternion.angleTo(defaultQuaternion) < 0.003) {
          rotationQuaternion.copy(defaultQuaternion);
          resetRequested = false;
        }
      } else if (!isDragging && !reduceMotion) {
        const inertiaAngle = inertiaQuaternion.angleTo(identityQuaternion);
        if (inertiaAngle > 0.00015) {
          rotationQuaternion.premultiply(inertiaQuaternion).normalize();
          inertiaQuaternion.slerp(identityQuaternion, 1 - Math.pow(0.90, delta));
        } else {
          inertiaQuaternion.identity();
        }
      }
      body.quaternion.copy(rotationQuaternion);
      updateRotationFlag();
      body.updateMatrixWorld(true);
      nodeLocals.forEach((node, index) => {
        projectedPoint.copy(node).applyMatrix4(body.matrixWorld).project(camera);
        projectedNodes[index].x = (projectedPoint.x * 0.5 + 0.5) * 100;
        projectedNodes[index].y = (-projectedPoint.y * 0.5 + 0.5) * 100;
        projectedNodes[index].visible = projectedPoint.z >= -1 && projectedPoint.z <= 1;
      });
      onNodePositionsChange?.(projectedNodes);
      (Object.keys(axisLocals) as Array<keyof typeof axisLocals>).forEach((key) => {
        projectedPoint.copy(axisLocals[key]).applyMatrix4(body.matrixWorld).project(camera);
        projectedAxes[key].x = (projectedPoint.x * 0.5 + 0.5) * 100;
        projectedAxes[key].y = (-projectedPoint.y * 0.5 + 0.5) * 100;
        projectedAxes[key].visible = projectedPoint.z >= -1 && projectedPoint.z <= 1;
      });
      onAxisPositionsChange?.(projectedAxes);
      renderer.render(scene, camera);
      const moving = isDragging || resetRequested || inertiaQuaternion.angleTo(identityQuaternion) > 0.00015;
      if (moving || selectionChanging || now < renderUntil) schedule();
    }

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      inViewport = entry?.isIntersecting ?? true;
      if (inViewport) wake(250);
      else if (scheduledFrame) {
        cancelAnimationFrame(scheduledFrame);
        scheduledFrame = 0;
      }
    }, { threshold: 0.01 });
    intersectionObserver.observe(mount);
    const onVisibilityChange = () => {
      if (!document.hidden) wake(250);
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    onReadyChange(true);
    schedule();

    return () => {
      cancelAnimationFrame(scheduledFrame);
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("resize", resize);
      mount.removeEventListener("pointerdown", onPointerDown);
      mount.removeEventListener("pointermove", onPointerMove);
      mount.removeEventListener("pointerup", onPointerUp);
      mount.removeEventListener("pointercancel", onPointerUp);
      body.geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      resetRef.current = null;
      wakeRef.current = null;
      onReadyChange(false);
    };
  }, [onAxisPositionsChange, onNodePositionsChange, onReadyChange]);

  return (
    <div className={`field-body-3d ${dragging ? "is-dragging" : ""}`} ref={mountRef} aria-label="Drag freely to rotate the project Corpus in three dimensions">
      <button
        className={`map-reset-view ${rotated ? "is-rotated" : ""}`}
        onClick={(event) => { event.stopPropagation(); resetRef.current?.(); onResetMap?.(); }}
        onPointerDown={(event) => event.stopPropagation()}
        type="button"
      >Reset Corpus</button>
    </div>
  );
}
