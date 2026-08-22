"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { mapEdges3D, mapNodes3D } from "./graphGeometry";

type MapBody3DProps = {
  activeSlug: string | null;
  onReadyChange: (ready: boolean) => void;
};

const MAX_NODES = 14;
const MAX_SEGMENTS = 48;

type Segment = {
  from: number;
  to: number;
  a: THREE.Vector3;
  b: THREE.Vector3;
  radius: number;
  rest: number;
};

function nodePosition(index: number) {
  const node = mapNodes3D[index];
  return new THREE.Vector3(
    (node.x - 0.5) * 9.6,
    (node.y - 0.5) * 6.2,
    node.z * 0.72 + Math.sin(index * 1.83) * 0.12,
  );
}

function buildSegments(points: THREE.Vector3[]) {
  const bySlug = new Map(mapNodes3D.map((node, index) => [node.slug, index]));
  const segments: Segment[] = [];
  mapEdges3D.forEach((edge, edgeIndex) => {
    const from = bySlug.get(edge.from.slug) ?? 0;
    const to = bySlug.get(edge.to.slug) ?? 0;
    const a = points[from];
    const b = points[to];
    const length = a.distanceTo(b);
    const radius = THREE.MathUtils.clamp((0.205 - length * 0.013) * edge.thickness, 0.075, 0.19);
    const rest = edgeIndex % 5 === 0 ? 0.52 : edgeIndex % 3 === 0 ? 0.68 : 0.86;
    if (length > 4.1) {
      const midpoint = a.clone().lerp(b, 0.5);
      midpoint.z -= 0.72 + length * 0.045;
      midpoint.y += (edgeIndex % 2 ? 1 : -1) * 0.16;
      segments.push({ from, to, a: a.clone(), b: midpoint.clone(), radius, rest });
      segments.push({ from, to, a: midpoint, b: b.clone(), radius: radius * 0.92, rest });
    } else {
      segments.push({ from, to, a: a.clone(), b: b.clone(), radius, rest });
    }
  });
  return segments;
}

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;
  #define MAX_NODES ${MAX_NODES}
  #define MAX_SEGMENTS ${MAX_SEGMENTS}
  #define MAX_STEPS 96

  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uStepCount;
  uniform float uNodeBlend;
  uniform float uEdgeBlend;
  uniform mat3 uInvRotation;
  uniform vec3 uNodes[MAX_NODES];
  uniform float uNodeRadius[MAX_NODES];
  uniform float uInfluence[MAX_NODES];
  uniform vec3 uSegmentA[MAX_SEGMENTS];
  uniform vec3 uSegmentB[MAX_SEGMENTS];
  uniform float uSegmentRadius[MAX_SEGMENTS];
  uniform float uSegmentOwner[MAX_SEGMENTS];
  uniform float uSegmentActive[MAX_SEGMENTS];
  uniform float uSegmentCount;

  float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float sdSphere(vec3 p, vec3 center, float radius) {
    return length(p - center) - radius;
  }

  vec2 sdCapsule(vec3 p, vec3 a, vec3 b, float radius) {
    vec3 pa = p - a;
    vec3 ba = b - a;
    float h = clamp(dot(pa, ba) / max(dot(ba, ba), 0.0001), 0.0, 1.0);
    return vec2(length(pa - ba * h) - radius, h);
  }

  float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
  }

  vec4 mapScene(vec3 worldPoint) {
    vec3 p = uInvRotation * worldPoint;
    vec4 result = vec4(100.0, -1.0, -1.0, 0.0);
    for (int i = 0; i < MAX_NODES; i++) {
      float radius = uNodeRadius[i] * (1.0 + uInfluence[i] * 0.19);
      float d = sdSphere(p, uNodes[i], radius);
      float previous = result.x;
      result.x = smin(result.x, d, uNodeBlend);
      if (d < previous) result.y = float(i);
    }
    for (int i = 0; i < MAX_SEGMENTS; i++) {
      if (float(i) >= uSegmentCount) break;
      vec2 capsule = sdCapsule(p, uSegmentA[i], uSegmentB[i], uSegmentRadius[i]);
      float previous = result.x;
      result.x = smin(result.x, capsule.x, uEdgeBlend);
      if (capsule.x < previous) {
        result.y = uSegmentOwner[i];
        result.z = float(i);
        result.w = capsule.y;
      }
    }
    return result;
  }

  vec3 normalTetrahedron(vec3 p) {
    const float e = 0.0035;
    const vec2 k = vec2(1.0, -1.0);
    return normalize(
      k.xyy * mapScene(p + k.xyy * e).x +
      k.yyx * mapScene(p + k.yyx * e).x +
      k.yxy * mapScene(p + k.yxy * e).x +
      k.xxx * mapScene(p + k.xxx * e).x
    );
  }

  float ambientOcclusion(vec3 p, vec3 n) {
    float occlusion = 0.0;
    float weight = 1.0;
    for (int i = 1; i <= 5; i++) {
      float distance = 0.055 * float(i);
      float sampleDistance = mapScene(p + n * distance).x;
      occlusion += (distance - sampleDistance) * weight;
      weight *= 0.72;
    }
    return clamp(1.0 - occlusion * 2.7, 0.18, 1.0);
  }

  float softShadow(vec3 origin, vec3 direction) {
    float result = 1.0;
    float travel = 0.055;
    for (int i = 0; i < 14; i++) {
      float h = mapScene(origin + direction * travel).x;
      result = min(result, 12.0 * h / travel);
      travel += clamp(h, 0.025, 0.22);
      if (h < 0.001 || travel > 5.2) break;
    }
    return clamp(result, 0.14, 1.0);
  }

  vec3 nodeTint(float id) {
    float phase = fract(id * 0.173);
    vec3 cyan = vec3(0.20, 0.78, 0.94);
    vec3 violet = vec3(0.39, 0.32, 0.86);
    vec3 graphite = vec3(0.12, 0.17, 0.28);
    return mix(graphite, mix(cyan, violet, phase), 0.58);
  }

  bool boundsHit(vec3 ro, vec3 rd, out float nearHit, out float farHit) {
    float projection = dot(ro, rd);
    float c = dot(ro, ro) - 40.0;
    float discriminant = projection * projection - c;
    if (discriminant < 0.0) return false;
    float root = sqrt(discriminant);
    nearHit = max(0.0, -projection - root);
    farHit = -projection + root;
    return farHit > 0.0;
  }

  void main() {
    vec2 uv = (2.0 * gl_FragCoord.xy - uResolution.xy) / uResolution.y;
    float lens = tan(radians(11.0));
    vec3 rayOrigin = vec3(0.0, 0.0, 15.5);
    vec3 rayDirection = normalize(vec3(uv * lens, -1.0));
    float nearHit;
    float farHit;
    vec3 background = mix(vec3(0.018, 0.024, 0.033), vec3(0.012, 0.020, 0.030), clamp(uv.y * 0.25 + 0.5, 0.0, 1.0));
    if (!boundsHit(rayOrigin, rayDirection, nearHit, farHit)) {
      float noise = (hash12(gl_FragCoord.xy) - 0.5) / 255.0;
      gl_FragColor = vec4(background + noise, 1.0);
      return;
    }

    float travel = nearHit;
    vec4 hitData = vec4(100.0);
    bool hit = false;
    for (int step = 0; step < MAX_STEPS; step++) {
      if (float(step) >= uStepCount || travel > farHit) break;
      vec3 point = rayOrigin + rayDirection * travel;
      hitData = mapScene(point);
      if (hitData.x < 0.0018) { hit = true; break; }
      travel += max(hitData.x * 0.74, 0.009);
    }

    if (!hit) {
      float glow = exp(-max(hitData.x, 0.0) * 7.0) * 0.055;
      background += vec3(0.12, 0.28, 0.47) * glow;
      float vignette = smoothstep(1.34, 0.16, length(uv * vec2(0.72, 0.92)));
      background *= 0.72 + vignette * 0.28;
      background += (hash12(gl_FragCoord.xy + uTime * 7.0) - 0.5) / 255.0;
      gl_FragColor = vec4(background, 1.0);
      return;
    }

    vec3 point = rayOrigin + rayDirection * travel;
    vec3 normal = normalTetrahedron(point);
    vec3 keyDirection = normalize(vec3(-0.46, 0.72, 0.54));
    vec3 fillDirection = normalize(vec3(0.62, -0.08, 0.42));
    float key = max(dot(normal, keyDirection), 0.0);
    float fill = max(dot(normal, fillDirection), 0.0);
    float shadow = softShadow(point + normal * 0.012, keyDirection);
    float ao = ambientOcclusion(point, normal);
    float fresnel = pow(1.0 - max(dot(normal, -rayDirection), 0.0), 3.2);
    float thickness = 0.0;
    for (int i = 1; i <= 4; i++) {
      float sampleDistance = mapScene(point - rayDirection * (0.055 * float(i))).x;
      thickness += smoothstep(0.03, -0.12, sampleDistance);
    }
    thickness /= 4.0;

    int nodeIndex = int(clamp(hitData.y, 0.0, float(MAX_NODES - 1)));
    float influence = uInfluence[nodeIndex];
    vec3 deep = vec3(0.032, 0.047, 0.105);
    vec3 violet = vec3(0.23, 0.19, 0.54);
    vec3 color = mix(deep, nodeTint(hitData.y), 0.46 + key * 0.22);
    color += violet * fill * 0.24;
    color *= mix(0.58, 1.0, ao);
    color *= mix(0.66, 1.0, key * shadow);
    color += vec3(0.18, 0.77, 0.92) * fresnel * 0.34;
    color += vec3(0.31, 0.39, 0.82) * (1.0 - thickness) * 0.13;
    color += vec3(0.16, 0.45, 0.84) * influence * 0.32;

    if (hitData.z >= 0.0) {
      int segmentIndex = int(hitData.z);
      float activeEdge = uSegmentActive[segmentIndex];
      float phase = fract(uTime / 2.5 + hitData.z * 0.071);
      float travelBand = exp(-abs(hitData.w - phase) * 24.0) * activeEdge;
      color += vec3(0.50, 0.92, 1.0) * travelBand * 0.72;
    }

    float edgeAmount = smoothstep(0.42, 1.18, length(uv));
    color.r += fresnel * edgeAmount * 0.006;
    color.b += fresnel * edgeAmount * 0.014;
    color += (hash12(gl_FragCoord.xy + vec2(uTime * 11.0, 0.0)) - 0.5) / 255.0;
    float vignette = smoothstep(1.38, 0.12, length(uv * vec2(0.72, 0.92)));
    color *= 0.74 + vignette * 0.26;
    gl_FragColor = vec4(color, 1.0);
  }
`;

export function MapBody3D({ activeSlug, onReadyChange }: MapBody3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const activeSlugRef = useRef(activeSlug);
  const [rotated, setRotated] = useState(false);
  const resetRef = useRef<(() => void) | null>(null);

  useEffect(() => { activeSlugRef.current = activeSlug; }, [activeSlug]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 700px)").matches;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "high-performance" });
    } catch {
      mount.dataset.fallback = "true";
      onReadyChange(false);
      return;
    }

    const basePoints = mapNodes3D.map((_, index) => nodePosition(index));
    const segments = buildSegments(basePoints);
    const nodeBySlug = new Map(mapNodes3D.map((node, index) => [node.slug, index]));
    const nodeRadii = mapNodes3D.map((node) => 0.31 + node.radius * 0.105);
    const influences = Array(MAX_NODES).fill(0);
    const influenceTargets = Array(MAX_NODES).fill(0);
    const segmentActivity = Array(MAX_SEGMENTS).fill(0);
    const segmentActivityTargets = Array(MAX_SEGMENTS).fill(0);
    const paddedPoints = Array.from({ length: MAX_NODES }, (_, index) => basePoints[index]?.clone() ?? new THREE.Vector3(99, 99, 99));
    const paddedSegments = Array.from({ length: MAX_SEGMENTS }, (_, index) => segments[index] ?? {
      from: 0, to: 0, a: new THREE.Vector3(99, 99, 99), b: new THREE.Vector3(99, 99, 99), radius: 0, rest: 0,
    });

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const uniforms = {
      uResolution: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uStepCount: { value: mobile ? 48 : 96 },
      uNodeBlend: { value: 0.30 },
      uEdgeBlend: { value: 0.18 },
      uInvRotation: { value: new THREE.Matrix3() },
      uNodes: { value: paddedPoints.map((point) => point.clone()) },
      uNodeRadius: { value: Array.from({ length: MAX_NODES }, (_, index) => nodeRadii[index] ?? 0) },
      uInfluence: { value: influences },
      uSegmentA: { value: paddedSegments.map((segment) => segment.a.clone()) },
      uSegmentB: { value: paddedSegments.map((segment) => segment.b.clone()) },
      uSegmentRadius: { value: paddedSegments.map((segment) => segment.radius * segment.rest) },
      uSegmentOwner: { value: paddedSegments.map((segment) => segment.from) },
      uSegmentActive: { value: segmentActivity },
      uSegmentCount: { value: segments.length },
    };
    const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, depthWrite: false, depthTest: false });
    const geometry = new THREE.PlaneGeometry(2, 2);
    scene.add(new THREE.Mesh(geometry, material));
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.45));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const drawBufferSize = new THREE.Vector2();
    const resize = () => {
      renderer.setSize(Math.max(1, mount.clientWidth), Math.max(1, mount.clientHeight), false);
      renderer.getDrawingBufferSize(drawBufferSize);
      uniforms.uResolution.value.copy(drawBufferSize);
    };
    resize();
    window.addEventListener("resize", resize);

    let dragging = false;
    let pointerX = 0;
    let pointerY = 0;
    let yaw = 0;
    let pitch = 0;
    let targetYaw = 0;
    let targetPitch = 0;
    let yawVelocity = 0;
    let pitchVelocity = 0;
    const clampYaw = THREE.MathUtils.degToRad(40);
    const clampPitch = THREE.MathUtils.degToRad(25);
    const setRotationFlag = (value: boolean) => setRotated((current) => current === value ? current : value);
    resetRef.current = () => {
      targetYaw = 0;
      targetPitch = 0;
      yawVelocity = 0;
      pitchVelocity = 0;
    };

    const onPointerDown = (event: PointerEvent) => {
      if (reduceMotion) return;
      dragging = true;
      pointerX = event.clientX;
      pointerY = event.clientY;
      mount.setPointerCapture(event.pointerId);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging || reduceMotion) return;
      const dx = event.clientX - pointerX;
      const dy = event.clientY - pointerY;
      pointerX = event.clientX;
      pointerY = event.clientY;
      yawVelocity = THREE.MathUtils.clamp(dx * 0.0019, -0.045, 0.045);
      pitchVelocity = THREE.MathUtils.clamp(dy * 0.0017, -0.036, 0.036);
      targetYaw = THREE.MathUtils.clamp(targetYaw + yawVelocity, -clampYaw, clampYaw);
      targetPitch = THREE.MathUtils.clamp(targetPitch + pitchVelocity, -clampPitch, clampPitch);
    };
    const onPointerUp = (event: PointerEvent) => {
      dragging = false;
      targetYaw = 0;
      targetPitch = 0;
      if (mount.hasPointerCapture(event.pointerId)) mount.releasePointerCapture(event.pointerId);
    };
    mount.addEventListener("pointerdown", onPointerDown);
    mount.addEventListener("pointermove", onPointerMove);
    mount.addEventListener("pointerup", onPointerUp);
    mount.addEventListener("pointercancel", onPointerUp);
    mount.style.touchAction = "none";

    const rotation4 = new THREE.Matrix4();
    const inverseRotation = new THREE.Matrix3();
    const euler = new THREE.Euler(0, 0, 0, "YXZ");
    let frame = 0;
    let lastActive: string | null | undefined;
    const started = performance.now();
    onReadyChange(true);

    const draw = () => {
      const elapsed = (performance.now() - started) / 1000;
      const active = activeSlugRef.current;
      if (active !== lastActive) {
        influenceTargets.fill(0);
        segmentActivityTargets.fill(0);
        const activeIndex = active ? nodeBySlug.get(active) : undefined;
        if (activeIndex !== undefined) {
          influenceTargets[activeIndex] = 1;
          segments.forEach((segment, index) => {
            if (segment.from === activeIndex || segment.to === activeIndex) {
              segmentActivityTargets[index] = 1;
              const neighbor = segment.from === activeIndex ? segment.to : segment.from;
              influenceTargets[neighbor] = Math.max(influenceTargets[neighbor], 0.35);
            }
          });
        }
        lastActive = active;
      }

      const blend = reduceMotion ? 1 : 0.09;
      for (let index = 0; index < MAX_NODES; index += 1) {
        influences[index] += (influenceTargets[index] - influences[index]) * blend;
        const base = basePoints[index];
        const displayed = uniforms.uNodes.value[index] as THREE.Vector3;
        if (base && displayed) displayed.set(base.x, base.y, base.z + influences[index] * 0.34);
      }
      for (let index = 0; index < MAX_SEGMENTS; index += 1) {
        segmentActivity[index] += (segmentActivityTargets[index] - segmentActivity[index]) * blend;
        const segment = segments[index];
        if (!segment) continue;
        const activeAmount = Math.max(influences[segment.from], influences[segment.to]);
        const a = uniforms.uSegmentA.value[index] as THREE.Vector3;
        const b = uniforms.uSegmentB.value[index] as THREE.Vector3;
        a.copy(segment.a);
        b.copy(segment.b);
        if (a.distanceTo(basePoints[segment.from]) < 0.001) a.z += influences[segment.from] * 0.34;
        if (b.distanceTo(basePoints[segment.to]) < 0.001) b.z += influences[segment.to] * 0.34;
        uniforms.uSegmentRadius.value[index] = segment.radius * (segment.rest + activeAmount * (1 - segment.rest));
      }

      if (!dragging) {
        yawVelocity *= 0.88;
        pitchVelocity *= 0.88;
      }
      yaw += (targetYaw - yaw) * 0.115 + yawVelocity * 0.18;
      pitch += (targetPitch - pitch) * 0.115 + pitchVelocity * 0.18;
      if (!dragging) {
        targetYaw *= 0.89;
        targetPitch *= 0.89;
      }
      setRotationFlag(Math.abs(yaw) + Math.abs(pitch) > 0.012);
      euler.set(pitch, yaw, 0);
      rotation4.makeRotationFromEuler(euler);
      inverseRotation.setFromMatrix4(rotation4).transpose();
      uniforms.uInvRotation.value.copy(inverseRotation);
      uniforms.uTime.value = reduceMotion ? 0 : elapsed;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      mount.removeEventListener("pointerdown", onPointerDown);
      mount.removeEventListener("pointermove", onPointerMove);
      mount.removeEventListener("pointerup", onPointerUp);
      mount.removeEventListener("pointercancel", onPointerUp);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      resetRef.current = null;
      onReadyChange(false);
    };
  }, [onReadyChange]);

  return (
    <div className="field-body-3d" ref={mountRef}>
      {rotated && <button className="map-reset-view" onClick={() => resetRef.current?.()} type="button">Reset view</button>}
    </div>
  );
}
