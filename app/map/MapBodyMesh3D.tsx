"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { MarchingCubes } from "three/addons/objects/MarchingCubes.js";
import { mapEdges3D, mapNodes3D } from "./graphGeometry";

type MapBody3DProps = {
  activeSlug: string | null;
  onReadyChange: (ready: boolean) => void;
  onNodePositionsChange?: (positions: ReadonlyArray<{ x: number; y: number; visible: boolean }>) => void;
};

const MAX_RELATED = 4;
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
  uniform vec3 uActivePoint;
  uniform float uSelection;
  uniform float uSelectionBloom;
  varying vec3 vLocalPosition;
  varying vec3 vWorldNormal;
  varying vec3 vViewPosition;
  varying float vSelectionHeat;

  void main() {
    vec3 transformed = position;
    float selectedDistance = length(position - uActivePoint);
    float selectionHeat = exp(-selectedDistance * selectedDistance * 7.2) * uSelection;
    transformed += normalize(normal) * selectionHeat * (0.07 + uSelectionBloom * 0.055);

    vec4 viewPosition = modelViewMatrix * vec4(transformed, 1.0);
    vLocalPosition = transformed;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vViewPosition = -viewPosition.xyz;
    vSelectionHeat = selectionHeat;
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
    color = mix(color, pearl, clamp(vSelectionHeat * 0.68 + uSelectionBloom * vSelectionHeat * 0.18, 0.0, 0.78));

    gl_FragColor = vec4(color, 1.0);
  }
`;

export function MapBody3D({ activeSlug, onReadyChange, onNodePositionsChange }: MapBody3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const activeSlugRef = useRef(activeSlug);
  const wakeRef = useRef<(() => void) | null>(null);
  const resetRef = useRef<(() => void) | null>(null);
  const [rotated, setRotated] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    activeSlugRef.current = activeSlug;
    wakeRef.current?.();
  }, [activeSlug]);

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
    const projectedPoint = new THREE.Vector3();
    const nodeBySlug = new Map(mapNodes3D.map((node, index) => [node.slug, index]));
    const relatedPoints = Array.from({ length: MAX_RELATED }, () => new THREE.Vector3(99, 99, 99));
    const uniforms = {
      uActivePoint: { value: new THREE.Vector3(99, 99, 99) },
      uRelatedPoints: { value: relatedPoints },
      uRelatedCount: { value: 0 },
      uSelection: { value: 0 },
      uSelectionBloom: { value: 0 },
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
    let selectionStarted = performance.now();
    let lastActive: string | null | undefined;
    let isDragging = false;
    let pointerX = 0;
    let pointerY = 0;
    let rotationX = DEFAULT_ROTATION.x;
    let rotationY = DEFAULT_ROTATION.y;
    let velocityX = 0;
    let velocityY = 0;
    let resetRequested = false;
    let rotationFlag = false;

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
      const changed = Math.abs(rotationX - DEFAULT_ROTATION.x) + Math.abs(rotationY - DEFAULT_ROTATION.y) > 0.025;
      if (changed !== rotationFlag) {
        rotationFlag = changed;
        setRotated(changed);
      }
    };
    resetRef.current = () => {
      resetRequested = true;
      velocityX = 0;
      velocityY = 0;
      wake(850);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (reduceMotion || event.button !== 0) return;
      isDragging = true;
      resetRequested = false;
      pointerX = event.clientX;
      pointerY = event.clientY;
      velocityX = 0;
      velocityY = 0;
      mount.setPointerCapture(event.pointerId);
      setDragging(true);
      wake(800);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!isDragging || reduceMotion) return;
      const dx = event.clientX - pointerX;
      const dy = event.clientY - pointerY;
      pointerX = event.clientX;
      pointerY = event.clientY;
      velocityY = THREE.MathUtils.clamp(dx * 0.0048, -0.085, 0.085);
      velocityX = THREE.MathUtils.clamp(dy * 0.0038, -0.064, 0.064);
      rotationY += velocityY;
      rotationX = THREE.MathUtils.clamp(rotationX + velocityX, -1.12, 1.12);
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
      if (active !== lastActive) {
        const activeIndex = active ? nodeBySlug.get(active) : undefined;
        relatedPoints.forEach((point) => point.set(99, 99, 99));
        if (activeIndex !== undefined) {
          uniforms.uActivePoint.value.copy(nodeLocals[activeIndex]);
          const neighbors = new Set<number>();
          mapEdges3D.forEach((edge) => {
            if (edge.from.slug === active) {
              const index = nodeBySlug.get(edge.to.slug);
              if (index !== undefined) neighbors.add(index);
            } else if (edge.to.slug === active) {
              const index = nodeBySlug.get(edge.from.slug);
              if (index !== undefined) neighbors.add(index);
            }
          });
          [...neighbors].slice(0, MAX_RELATED).forEach((index, relatedIndex) => relatedPoints[relatedIndex].copy(nodeLocals[index]));
          uniforms.uRelatedCount.value = Math.min(neighbors.size, MAX_RELATED);
          selection = 0;
          selectionTarget = 1;
        } else {
          selectionTarget = 0;
          uniforms.uRelatedCount.value = 0;
        }
        selectionStarted = now;
        lastActive = active;
        wake(900);
      }
      selection += (selectionTarget - selection) * (reduceMotion ? 1 : 0.16);
      uniforms.uSelection.value = selection;
      const arrival = THREE.MathUtils.clamp((now - selectionStarted) / 620, 0, 1);
      uniforms.uSelectionBloom.value = reduceMotion ? 0 : Math.sin(arrival * Math.PI) * (1 - arrival * 0.32);
      return Math.abs(selectionTarget - selection) > 0.004 || arrival < 1;
    }

    function draw(now: number) {
      scheduledFrame = 0;
      if (!inViewport || document.hidden) return;
      const delta = Math.min(2, Math.max(0.35, (now - previousFrame) / 16.67));
      previousFrame = now;
      const selectionChanging = updateSelection(now);
      if (resetRequested) {
        rotationX += (DEFAULT_ROTATION.x - rotationX) * 0.16 * delta;
        const difference = Math.atan2(Math.sin(DEFAULT_ROTATION.y - rotationY), Math.cos(DEFAULT_ROTATION.y - rotationY));
        rotationY += difference * 0.16 * delta;
        if (Math.abs(rotationX - DEFAULT_ROTATION.x) + Math.abs(difference) < 0.004) {
          rotationX = DEFAULT_ROTATION.x;
          rotationY = DEFAULT_ROTATION.y;
          resetRequested = false;
        }
      } else if (!isDragging && !reduceMotion) {
        rotationX = THREE.MathUtils.clamp(rotationX + velocityX * delta, -1.12, 1.12);
        rotationY += velocityY * delta;
        velocityX *= Math.pow(0.91, delta);
        velocityY *= Math.pow(0.91, delta);
        if (Math.abs(velocityX) < 0.00008) velocityX = 0;
        if (Math.abs(velocityY) < 0.00008) velocityY = 0;
      }
      body.rotation.x = rotationX;
      body.rotation.y = rotationY;
      updateRotationFlag();
      body.updateMatrixWorld(true);
      nodeLocals.forEach((node, index) => {
        projectedPoint.copy(node).applyMatrix4(body.matrixWorld).project(camera);
        projectedNodes[index].x = (projectedPoint.x * 0.5 + 0.5) * 100;
        projectedNodes[index].y = (-projectedPoint.y * 0.5 + 0.5) * 100;
        projectedNodes[index].visible = projectedPoint.z >= -1 && projectedPoint.z <= 1;
      });
      onNodePositionsChange?.(projectedNodes);
      renderer.render(scene, camera);
      const moving = isDragging || resetRequested || Math.abs(velocityX) + Math.abs(velocityY) > 0.0001;
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
  }, [onNodePositionsChange, onReadyChange]);

  return (
    <div className={`field-body-3d ${dragging ? "is-dragging" : ""}`} ref={mountRef} aria-label="Drag to rotate the project map geometry">
      <p className="map-rotation-hint">Drag to rotate</p>
      {rotated && <button className="map-reset-view" onClick={() => resetRef.current?.()} type="button">Reset view</button>}
    </div>
  );
}
