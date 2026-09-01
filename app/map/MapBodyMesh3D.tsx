"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { MarchingCubes } from "three/addons/objects/MarchingCubes.js";
import { mapEdges3D, mapNodes3D } from "./graphGeometry";
import { CORPUS_MOTION, CORPUS_SMOOTH_MIN_GLSL, corpusEase } from "../visualMotion";

type MapBody3DProps = {
  activeSlug: string | null;
  emphasizedSlugs?: readonly string[];
  filterColor?: string | null;
  highlightedNeighbors?: readonly string[];
  onAxisPositionsChange?: (positions: Readonly<Record<"story" | "compute" | "atmosphere" | "architecture" | "center", { x: number; y: number; visible: boolean }>>) => void;
  onReadyChange: (ready: boolean) => void;
  onNodePositionsChange?: (positions: ReadonlyArray<{ x: number; y: number; visible: boolean }>) => void;
  onResetMap?: () => void;
  onToggleNodeNames?: () => void;
  showNodeNames?: boolean;
};

const MAX_RELATED = 4;
const MAX_EMPHASIZED = 14;
const DEFAULT_ROTATION = new THREE.Euler(0, 0, 0, "YXZ");
const DEFAULT_CORPUS_SCALE = 1.15;

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
  uniform float uFilterActive;
  uniform float uPreviousFilterActive;
  uniform vec3 uFilterColor;
  uniform vec3 uPreviousFilterColor;
  uniform float uFilterTransition;
  uniform float uSelection;
  uniform float uSelectionBloom;
  uniform float uSelectionTransition;
  varying vec3 vLocalPosition;
  varying vec3 vWorldNormal;
  varying vec3 vViewPosition;
  varying float vSelectionHeat;
  varying float vFilterHeat;

  ${CORPUS_SMOOTH_MIN_GLSL}

  float pointField(vec3 point, vec3 fieldPoint) {
    float pointDistance = length(point - fieldPoint);
    return exp(-pointDistance * pointDistance * 18.0);
  }

  float emphasizedField(vec3 point, bool previous) {
    float heat = 0.0;
    for (int index = 0; index < MAX_EMPHASIZED; index++) {
      float count = previous ? uPreviousEmphasizedCount : uEmphasizedCount;
      if (float(index) >= count) break;
      heat = max(heat, pointField(point, previous ? uPreviousEmphasizedPoints[index] : uEmphasizedPoints[index]));
    }
    return clamp(heat, 0.0, 1.35);
  }

  void main() {
    vec3 transformed = position;
    float selectedDistance = length(position - uActivePoint);
    float previousDistance = length(position - uPreviousPoint);
    float transitionIn = smoothstep(0.02, 0.96, uSelectionTransition);
    float transitionOut = 1.0 - smoothstep(0.04, 0.90, uSelectionTransition);
    float broadHeat = (exp(-selectedDistance * selectedDistance * 12.0) * transitionIn + exp(-previousDistance * previousDistance * 12.0) * transitionOut) * smoothstep(0.0, 0.72, uSelection);
    float localHeat = (exp(-selectedDistance * selectedDistance * 28.0) * transitionIn + exp(-previousDistance * previousDistance * 28.0) * transitionOut) * smoothstep(0.24, 1.0, uSelection);
    float waveRadius = mix(0.78, 0.18, uSelection);
    float travellingWave = exp(-pow(selectedDistance - waveRadius, 2.0) * 46.0) * uSelectionBloom;
    float previousFilterHeat = emphasizedField(position, true);
    float nextFilterHeat = emphasizedField(position, false);
    float filterHeat = mix(previousFilterHeat, nextFilterHeat, smoothstep(0.0, 1.0, uFilterTransition));
    float selectionHeat = clamp(localHeat, 0.0, 1.0);
    float filterSwell = smoothstep(0.32, 0.78, filterHeat);
    float filterAura = smoothstep(0.05, 0.50, filterHeat);
    float filterBaseline = mix(uPreviousFilterActive, uFilterActive, smoothstep(0.0, 1.0, uFilterTransition));
    vec3 filterDirection = normalize(mix(uPreviousFilterColor, uFilterColor, smoothstep(0.0, 1.0, uFilterTransition)) * 2.0 - 1.0 + vec3(0.21, -0.12, 0.17));
    float filterMorph = filterBaseline * (sin(dot(position, filterDirection) * 8.0) * 0.007 + dot(normalize(position + vec3(0.001)), filterDirection) * 0.005);
    transformed += normalize(normal) * (filterBaseline * 0.026 + filterMorph + filterSwell * 0.060 + filterAura * 0.012 + broadHeat * 0.012 + localHeat * 0.055 + travellingWave * 0.018);

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
  uniform float uSelection;
  uniform float uSelectionBloom;
  uniform vec3 uFilterColor;
  uniform vec3 uPreviousFilterColor;
  uniform float uFilterActive;
  uniform float uPreviousFilterActive;
  uniform float uFilterTransition;
  varying vec3 vLocalPosition;
  varying vec3 vWorldNormal;
  varying vec3 vViewPosition;
  varying float vSelectionHeat;
  varying float vFilterHeat;

  vec3 sRGBToLinear(vec3 srgbColor) {
    vec3 higher = pow((srgbColor + 0.055) / 1.055, vec3(2.4));
    vec3 lower = srgbColor / 12.92;
    return mix(higher, lower, vec3(lessThanEqual(srgbColor, vec3(0.04045))));
  }

  void main() {
    vec3 normal = normalize(vWorldNormal);
    vec3 viewDirection = normalize(vViewPosition);
    vec3 keyDirection = normalize(vec3(-0.42, 0.74, 0.52));
    vec3 fillDirection = normalize(vec3(0.70, -0.12, 0.42));
    float key = max(dot(normal, keyDirection), 0.0);
    float fill = max(dot(normal, fillDirection), 0.0);
    float wrappedLight = (key + fill) * 0.5;
    float fresnel = pow(1.0 - max(dot(normal, viewDirection), 0.0), 2.7);
    float depthTone = clamp(vLocalPosition.z * 0.27 + vLocalPosition.y * 0.09 + 0.50, 0.0, 1.0);

    vec3 graphite = sRGBToLinear(vec3(0.018, 0.029, 0.070));
    vec3 deepBlue = sRGBToLinear(vec3(0.052, 0.082, 0.205));
    vec3 indigo = sRGBToLinear(vec3(0.105, 0.150, 0.360));
    vec3 facetBlue = sRGBToLinear(vec3(0.105, 0.355, 0.650));
    vec3 violet = sRGBToLinear(vec3(0.215, 0.225, 0.540));
    vec3 pearl = sRGBToLinear(vec3(0.760, 0.875, 0.950));

    vec3 color = mix(graphite, deepBlue, 0.42 + depthTone * 0.34);
    float longWrinkle = sin(vLocalPosition.x * 18.0 + sin(vLocalPosition.y * 7.0) * 1.8 + vLocalPosition.z * 13.0);
    float crossWrinkle = sin(vLocalPosition.y * 25.0 - vLocalPosition.z * 11.0 + sin(vLocalPosition.x * 6.0));
    float textureField = longWrinkle * 0.62 + crossWrinkle * 0.38;
    float smoothField = smoothstep(-0.35, 0.72, sin(dot(vLocalPosition, vec3(3.7, 5.1, 4.3))));
    float unifiedTexture = mix(textureField * 0.045, textureField * 0.012, smoothField);
    float indigoWash = smoothstep(0.05, 0.82, wrappedLight);
    vec3 facetDirection = normalize(vec3(-0.74, 0.18, 0.65));
    float directionalFacet = pow(max(dot(normal, facetDirection), 0.0), 3.2);
    float facetBreak = smoothstep(-0.30, 0.62, sin(dot(vLocalPosition, vec3(3.1, 4.6, -3.7))));
    float blueFacet = directionalFacet * mix(0.28, 1.0, facetBreak);
    color = mix(color, indigo, indigoWash * 0.38);
    color = mix(color, facetBlue, blueFacet * 0.68);
    color += pearl * wrappedLight * 0.10;
    color *= 1.0 + unifiedTexture;
    color += mix(violet, facetBlue, depthTone) * fresnel * 0.46;
    float filterPresence = mix(uPreviousFilterActive, uFilterActive, smoothstep(0.0, 1.0, uFilterTransition));
    float filterMask = smoothstep(0.06, 0.66, vFilterHeat);
    vec3 relationshipHue = mix(uPreviousFilterColor, uFilterColor, smoothstep(0.0, 1.0, uFilterTransition));
    vec3 quietColor = color * 0.34;
    color = mix(color, quietColor, (1.0 - filterMask) * filterPresence * 0.56);
    color = mix(color, relationshipHue, filterMask * filterPresence * 0.46);
    float selectionPresence = smoothstep(0.02, 0.98, uSelection);
    float localSelection = clamp(vSelectionHeat, 0.0, 1.0);
    float farField = (1.0 - smoothstep(0.01, 0.35, localSelection)) * selectionPresence;
    color *= 1.0 - farField * 0.22;
    vec3 baseSelectionHighlight = min(color * 6.00, vec3(1.0));
    vec3 filterSelectionHighlight = mix(relationshipHue, vec3(1.0), 0.35);
    vec3 selectionHighlight = mix(baseSelectionHighlight, filterSelectionHighlight, filterPresence);
    float selectionAmount = clamp(localSelection * 0.92 + uSelectionBloom * localSelection * 0.12, 0.0, 0.78);
    color = mix(color, selectionHighlight, selectionAmount);

    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

export function MapBody3D({ activeSlug, emphasizedSlugs = [], filterColor = null, highlightedNeighbors = [], onAxisPositionsChange, onReadyChange, onNodePositionsChange, onResetMap, onToggleNodeNames, showNodeNames = false }: MapBody3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const activeSlugRef = useRef(activeSlug);
  const emphasizedSlugsRef = useRef(emphasizedSlugs);
  const filterColorRef = useRef(filterColor);
  const highlightedNeighborsRef = useRef(highlightedNeighbors);
  const wakeRef = useRef<(() => void) | null>(null);
  const resetRef = useRef<(() => void) | null>(null);
  const [rotated, setRotated] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    activeSlugRef.current = activeSlug;
    emphasizedSlugsRef.current = emphasizedSlugs;
    filterColorRef.current = filterColor;
    highlightedNeighborsRef.current = highlightedNeighbors;
    wakeRef.current?.();
  }, [activeSlug, emphasizedSlugs, filterColor, highlightedNeighbors]);

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
      uFilterColor: { value: new THREE.Color(filterColorRef.current ?? "#72d9e8") },
      uPreviousFilterColor: { value: new THREE.Color(filterColorRef.current ?? "#72d9e8") },
      uFilterActive: { value: filterColorRef.current ? 1 : 0 },
      uPreviousFilterActive: { value: filterColorRef.current ? 1 : 0 },
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
    const fitCorpusToViewport = (width: number, height: number) => {
      const fit = mobile
        ? THREE.MathUtils.clamp(Math.min(width / 420, height / 780), 0.82, 1)
        : THREE.MathUtils.clamp(Math.min(width / 1280, height / 800), 0.76, 1);
      body.scale.set(
        (mobile ? 3.25 : 5.65) * DEFAULT_CORPUS_SCALE * fit,
        (mobile ? 3.9 : 3.85) * DEFAULT_CORPUS_SCALE * fit,
        (mobile ? 3.0 : 3.8) * DEFAULT_CORPUS_SCALE * fit,
      );
    };
    fitCorpusToViewport(mount.clientWidth, mount.clientHeight);
    body.rotation.copy(DEFAULT_ROTATION);
    body.position.set(0, mobile ? 0.34 : 0, 0);
    scene.add(body);

    let scheduledFrame = 0;
    let inViewport = true;
    let previousFrame = performance.now();
    let renderUntil = performance.now() + 500;
    let selection = 0;
    let selectionTarget = 0;
    let selectionFrom = 0;
    let selectionDuration = CORPUS_MOTION.selection;
    let selectionStarted = performance.now();
    let lastRelationKey: string | undefined;
    let lastActiveIndex: number | undefined;
    let lastFilterKey = "";
    let filterStarted = performance.now();
    let filterDuration = 560;
    let isDragging = false;
    const defaultQuaternion = new THREE.Quaternion().setFromEuler(DEFAULT_ROTATION);
    const rotationQuaternion = defaultQuaternion.clone();
    const targetQuaternion = defaultQuaternion.clone();
    const yawQuaternion = new THREE.Quaternion();
    const pitchQuaternion = new THREE.Quaternion();
    const dragDelta = new THREE.Quaternion();
    const worldUp = new THREE.Vector3(0, 1, 0);
    const cameraRight = new THREE.Vector3(1, 0, 0);
    let previousPointerX = 0;
    let previousPointerY = 0;
    let previousPointerTime = 0;
    let yawVelocity = 0;
    let pitchVelocity = 0;
    let resetRequested = false;
    let rotationFlag = false;
    let projectionDirty = true;
    let projectionsReady = false;
    const lastProjectedQuaternion = new THREE.Quaternion();

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
      fitCorpusToViewport(width, height);
      projectionDirty = true;
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
      targetQuaternion.copy(defaultQuaternion);
      yawVelocity = 0;
      pitchVelocity = 0;
      wake(850);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      if (event.target instanceof Element && event.target.closest(".map-corpus-tools")) return;
      isDragging = true;
      resetRequested = false;
      previousPointerX = event.clientX;
      previousPointerY = event.clientY;
      previousPointerTime = event.timeStamp;
      yawVelocity = 0;
      pitchVelocity = 0;
      mount.setPointerCapture(event.pointerId);
      setDragging(true);
      wake(800);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!isDragging) return;
      const bounds = mount.getBoundingClientRect();
      const referenceSize = Math.max(280, Math.min(bounds.width, bounds.height));
      const sensitivity = mobile ? 3.1 : 2.7;
      const yawStep = THREE.MathUtils.clamp((event.clientX - previousPointerX) / referenceSize * sensitivity, -0.18, 0.18);
      const pitchStep = THREE.MathUtils.clamp((event.clientY - previousPointerY) / referenceSize * sensitivity, -0.18, 0.18);
      const elapsedFrames = THREE.MathUtils.clamp((event.timeStamp - previousPointerTime) / 16.67, 0.5, 2.5);
      yawQuaternion.setFromAxisAngle(worldUp, yawStep);
      pitchQuaternion.setFromAxisAngle(cameraRight, pitchStep);
      dragDelta.copy(yawQuaternion).multiply(pitchQuaternion);
      targetQuaternion.premultiply(dragDelta).normalize();
      yawVelocity = THREE.MathUtils.lerp(yawVelocity, yawStep / elapsedFrames, 0.38);
      pitchVelocity = THREE.MathUtils.lerp(pitchVelocity, pitchStep / elapsedFrames, 0.38);
      previousPointerX = event.clientX;
      previousPointerY = event.clientY;
      previousPointerTime = event.timeStamp;
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
      const relatedHighlights = window.matchMedia("(max-width: 580px)").matches
        ? []
        : highlightedNeighborsRef.current;
      // Keying the projected relation field by both source and destinations prevents
      // a shared neighbor set from leaving the previous source (notably Vanderbilt)
      // visually latched after the active project changes.
      const relationKey = `${active ?? "none"}:${relatedHighlights.join(",")}`;
      if (relationKey !== lastRelationKey) {
        relatedPoints.forEach((point) => point.set(99, 99, 99));
        if (activeIndex !== undefined) {
          const neighbors = new Set<number>(relatedHighlights.flatMap((slug) => {
            const index = nodeBySlug.get(slug);
            return index === undefined ? [] : [index];
          }));
          [...neighbors].slice(0, MAX_RELATED).forEach((index, relatedIndex) => relatedPoints[relatedIndex].copy(nodeLocals[index]));
          uniforms.uRelatedCount.value = Math.min(neighbors.size, MAX_RELATED);
        } else {
          uniforms.uRelatedCount.value = 0;
        }
        lastRelationKey = relationKey;
        projectionDirty = true;
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
        projectionDirty = true;
        wake(selectionDuration + 180);
      }
      const progress = reduceMotion ? 1 : THREE.MathUtils.clamp((now - selectionStarted) / selectionDuration, 0, 1);
      const eased = corpusEase(progress);
      selection = THREE.MathUtils.lerp(selectionFrom, selectionTarget, eased);
      uniforms.uSelection.value = selection;
      uniforms.uSelectionBloom.value = reduceMotion ? 0 : Math.sin(progress * Math.PI) * (1 - progress * 0.18);
      uniforms.uSelectionTransition.value = lastActiveIndex === undefined ? 0 : eased;

      const filterKey = `${filterColorRef.current ?? "all"}:${emphasizedSlugsRef.current.join(",")}`;
      if (filterKey !== lastFilterKey) {
        previousEmphasizedPoints.forEach((point, index) => point.copy(emphasizedPoints[index]));
        uniforms.uPreviousEmphasizedCount.value = uniforms.uEmphasizedCount.value;
        uniforms.uPreviousFilterColor.value.copy(uniforms.uFilterColor.value);
        uniforms.uPreviousFilterActive.value = uniforms.uFilterActive.value;
        emphasizedPoints.forEach((point) => point.set(99, 99, 99));
        const indices = emphasizedSlugsRef.current.flatMap((slug) => {
          const index = nodeBySlug.get(slug);
          return index === undefined ? [] : [index];
        }).slice(0, MAX_EMPHASIZED);
        indices.forEach((index, emphasizedIndex) => emphasizedPoints[emphasizedIndex].copy(nodeLocals[index]));
        uniforms.uEmphasizedCount.value = indices.length;
        uniforms.uFilterColor.value.set(filterColorRef.current ?? "#72d9e8");
        uniforms.uFilterActive.value = filterColorRef.current ? 1 : 0;
        uniforms.uFilterTransition.value = 0;
        filterStarted = now;
        filterDuration = 560;
        lastFilterKey = filterKey;
        wake(filterDuration + 120);
      }
      const filterProgress = reduceMotion ? 1 : THREE.MathUtils.clamp((now - filterStarted) / filterDuration, 0, 1);
      uniforms.uFilterTransition.value = filterProgress * filterProgress * (3 - 2 * filterProgress);
      return progress < 1 || filterProgress < 1;
    }

    let readyNotified = false;
    function draw(now: number) {
      scheduledFrame = 0;
      if (!inViewport || document.hidden) return;
      const delta = Math.min(2, Math.max(0.35, (now - previousFrame) / 16.67));
      previousFrame = now;
      const selectionChanging = updateSelection(now);
      if (resetRequested) {
        rotationQuaternion.slerp(defaultQuaternion, 1 - Math.pow(0.72, delta));
        if (rotationQuaternion.angleTo(defaultQuaternion) < 0.003) {
          rotationQuaternion.copy(defaultQuaternion);
          targetQuaternion.copy(defaultQuaternion);
          resetRequested = false;
        }
      } else {
        if (!isDragging && !reduceMotion && (Math.abs(yawVelocity) > 0.00004 || Math.abs(pitchVelocity) > 0.00004)) {
          yawQuaternion.setFromAxisAngle(worldUp, yawVelocity * delta);
          pitchQuaternion.setFromAxisAngle(cameraRight, pitchVelocity * delta);
          dragDelta.copy(yawQuaternion).multiply(pitchQuaternion);
          targetQuaternion.premultiply(dragDelta).normalize();
          const damping = Math.pow(0.84, delta);
          yawVelocity *= damping;
          pitchVelocity *= damping;
        }
        rotationQuaternion.slerp(targetQuaternion, 1 - Math.pow(isDragging ? 0.48 : 0.68, delta));
      }
      body.quaternion.copy(rotationQuaternion);
      updateRotationFlag();
      body.updateMatrixWorld(true);
      // The first projection pass can happen before renderer.render() updates the
      // camera matrices. Refresh them explicitly so cached DOM node positions are
      // valid from frame one rather than being projected from an identity camera.
      camera.updateMatrixWorld(true);
      const projectionChanged = !projectionsReady || projectionDirty || rotationQuaternion.angleTo(lastProjectedQuaternion) > 0.00005;
      if (projectionChanged) {
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
        lastProjectedQuaternion.copy(rotationQuaternion);
        projectionsReady = true;
        projectionDirty = false;
      }
      renderer.render(scene, camera);
      if (!readyNotified) {
        readyNotified = true;
        onReadyChange(true);
      }
      const moving = isDragging || resetRequested || rotationQuaternion.angleTo(targetQuaternion) > 0.00015 || Math.abs(yawVelocity) > 0.00004 || Math.abs(pitchVelocity) > 0.00004;
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
      <div className="map-corpus-tools">
        <button
          aria-pressed={showNodeNames}
          className={`control-pill ${showNodeNames ? "is-active" : ""}`}
          onClick={(event) => { event.stopPropagation(); onToggleNodeNames?.(); }}
          onPointerDown={(event) => event.stopPropagation()}
          type="button"
        ><span className="control-pill__content">{showNodeNames ? "Hide names" : "Show Names"}</span></button>
        <button
          className={`map-reset-view control-pill ${rotated ? "is-rotated" : ""}`}
          onClick={(event) => { event.stopPropagation(); resetRef.current?.(); onResetMap?.(); }}
          onPointerDown={(event) => event.stopPropagation()}
          type="button"
        ><span className="control-pill__content">Reset Corpus</span></button>
      </div>
    </div>
  );
}
