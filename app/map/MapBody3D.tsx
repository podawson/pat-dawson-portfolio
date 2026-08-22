"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { mapEdges3D, mapNode3DBySlug, mapNodes3D } from "./graphGeometry";

type MapBody3DProps = {
  activeSlug: string | null;
  onReadyChange: (ready: boolean) => void;
};

const vertexShader = `
  uniform float uTime;
  uniform float uMotion;
  uniform float uSelection;
  uniform vec3 uActivePosition;
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;
  varying vec3 vViewPosition;
  varying float vLift;

  void main() {
    vec3 transformed = position;
    vec3 undeformedWorld = (modelMatrix * vec4(position, 1.0)).xyz;
    float selectedDistance = distance(undeformedWorld, uActivePosition);
    vLift = exp(-selectedDistance * selectedDistance * 7.4) * uSelection;
    float breath = sin(position.x * 7.0 + position.y * 4.0 + position.z * 5.0 + uTime * 0.34) * 0.006 * uMotion;
    transformed += normal * (vLift * 0.105 + breath);
    vec4 world = modelMatrix * vec4(transformed, 1.0);
    vec4 view = viewMatrix * world;
    vWorldPosition = world.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vViewPosition = view.xyz;
    gl_Position = projectionMatrix * view;
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform float uSelection;
  uniform vec3 uNight;
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;
  varying vec3 vViewPosition;
  varying float vLift;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  void main() {
    vec3 normal = normalize(vWorldNormal);
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    vec3 cyanLight = normalize(vec3(-0.45, 0.72, 0.9));
    vec3 violetLight = normalize(vec3(0.68, -0.12, 0.72));
    float diffuse = max(dot(normal, cyanLight), 0.0) * 0.54 + max(dot(normal, violetLight), 0.0) * 0.28;
    float backLight = max(dot(-normal, cyanLight), 0.0) * 0.11;
    float rim = pow(1.0 - max(dot(normal, viewDirection), 0.0), 3.05);
    float depthAmount = clamp((vWorldPosition.z + 3.1) / 6.2, 0.0, 1.0);
    vec3 navy = vec3(0.035, 0.055, 0.16);
    vec3 violet = vec3(0.29, 0.31, 0.72);
    vec3 periwinkle = vec3(0.53, 0.58, 0.94);
    vec3 cyan = vec3(0.58, 0.92, 0.98);
    vec3 color = mix(navy, violet, depthAmount * 0.82 + diffuse * 0.34);
    color = mix(color, periwinkle, diffuse * 0.48 + vLift * 0.24);
    float grain = hash(vec3(vWorldPosition.x * 0.52, vWorldPosition.y * 3.1, vWorldPosition.z * 0.64) + uTime * 0.004);
    color += (grain - 0.5) * 0.055;
    color += cyan * rim * (0.56 + vLift * 0.34);
    color += vec3(0.34, 0.20, 0.54) * backLight;
    float crest = smoothstep(0.68, 0.98, diffuse + rim * 0.32 + vLift * 0.24);
    color = mix(color, vec3(0.78, 0.94, 1.0), crest * 0.24);
    float fog = smoothstep(8.5, 18.5, length(vViewPosition));
    color = mix(color, uNight, fog * 0.56);
    gl_FragColor = vec4(color, 0.9);
  }
`;

function normalizedPosition(slug: string) {
  const node = mapNode3DBySlug.get(slug) ?? mapNodes3D[0];
  return new THREE.Vector3(
    node.x * 2 - 1,
    node.y * 2 - 1,
    node.z * 0.31,
  );
}

function relationshipCurve(
  from: THREE.Vector3,
  to: THREE.Vector3,
  index: number,
  strandOffset = 0,
) {
  const direction = to.clone().sub(from);
  const distance = direction.length();
  const normal = new THREE.Vector3(-direction.y, direction.x, 0).normalize();
  const handedness = index % 2 === 0 ? 1 : -1;
  const bend = (0.035 + distance * 0.075) * handedness;
  const first = from.clone().lerp(to, 0.3);
  const second = from.clone().lerp(to, 0.7);
  first.addScaledVector(normal, bend + strandOffset);
  second.addScaledVector(normal, bend * -0.42 + strandOffset * -0.55);
  first.z += 0.075 + distance * 0.045;
  second.z += 0.105 + distance * 0.032;
  return new THREE.CatmullRomCurve3([from, first, second, to]);
}

function createGraphBody(material: THREE.Material) {
  const group = new THREE.Group();
  const geometries: THREE.BufferGeometry[] = [];
  const strandMaterial = new THREE.MeshBasicMaterial({
    color: "#8ae9ff",
    transparent: true,
    opacity: 0.2,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  mapEdges3D.forEach((edge, index) => {
    const from = normalizedPosition(edge.from.slug);
    const to = normalizedPosition(edge.to.slug);
    const curve = relationshipCurve(from, to, index);
    const geometry = new THREE.TubeGeometry(
      curve,
      38,
      0.0065 + edge.thickness * 0.0055,
      10,
      false,
    );
    geometries.push(geometry);
    group.add(new THREE.Mesh(geometry, material));

    [-1, 1].forEach((side) => {
      const strandCurve = relationshipCurve(from, to, index, side * 0.014);
      const strandGeometry = new THREE.TubeGeometry(
        strandCurve,
        34,
        0.00115,
        5,
        false,
      );
      geometries.push(strandGeometry);
      group.add(new THREE.Mesh(strandGeometry, strandMaterial));
    });
  });

  mapNodes3D.forEach((node, index) => {
    const geometry = new THREE.SphereGeometry(1, 34, 22);
    const mesh = new THREE.Mesh(geometry, material);
    const position = normalizedPosition(node.slug);
    mesh.position.copy(position);
    mesh.scale.set(
      0.077 * node.radius,
      0.066 * node.radius,
      0.122 * node.radius,
    );
    mesh.rotation.set(
      Math.sin(index * 1.7) * 0.32,
      Math.cos(index * 1.13) * 0.42,
      Math.sin(index * 0.91) * 0.26,
    );
    geometries.push(geometry);
    group.add(mesh);
  });

  return { group, geometries, strandMaterial };
}

export function MapBody3D({ activeSlug, onReadyChange }: MapBody3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const activeSlugRef = useRef(activeSlug);

  useEffect(() => {
    activeSlugRef.current = activeSlug;
  }, [activeSlug]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 700px)").matches;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: !mobile, alpha: true, powerPreference: "high-performance" });
    } catch {
      mount.dataset.fallback = "true";
      onReadyChange(false);
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 40);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: true,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uMotion: { value: reduceMotion ? 0 : 1 },
        uSelection: { value: 0 },
        uActivePosition: { value: new THREE.Vector3(10, 10, 10) },
        uNight: { value: new THREE.Color("#090b0d") },
      },
    });

    const started = performance.now();
    const { group: body, geometries, strandMaterial } = createGraphBody(material);
    scene.add(body);

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const pointer = new THREE.Vector2();
    const smoothedPointer = new THREE.Vector2();
    const animationStarted = performance.now();
    let frame = 0;
    let selection = 0;
    let lastActiveSlug: string | null = null;

    const resize = () => {
      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(1, mount.clientHeight);
      const aspect = width / height;
      const vertical = 5.15;
      camera.left = -vertical * aspect;
      camera.right = vertical * aspect;
      camera.top = vertical;
      camera.bottom = -vertical;
      camera.near = 0.1;
      camera.far = 40;
      camera.position.set(0, -2.5, 12.2);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
      body.scale.set(vertical * aspect, vertical, 3.1);
      renderer.setSize(width, height, false);
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      pointer.set(
        ((event.clientX - rect.left) / rect.width - 0.5) * 2,
        ((event.clientY - rect.top) / rect.height - 0.5) * 2,
      );
    };
    const onPointerLeave = () => pointer.set(0, 0);

    resize();
    window.addEventListener("resize", resize);
    mount.addEventListener("pointermove", onPointerMove);
    mount.addEventListener("pointerleave", onPointerLeave);
    onReadyChange(true);
    mount.dataset.bakeMs = String(Math.round(performance.now() - started));

    const draw = () => {
      const elapsed = (performance.now() - animationStarted) / 1000;
      const currentActive = activeSlugRef.current;
      const targetSelection = currentActive ? 1 : 0;
      selection += (targetSelection - selection) * (reduceMotion ? 1 : 0.075);
      if (currentActive && currentActive !== lastActiveSlug) {
        material.uniforms.uActivePosition.value.copy(
          body.localToWorld(normalizedPosition(currentActive)),
        );
      }
      lastActiveSlug = currentActive;
      material.uniforms.uSelection.value = selection;
      material.uniforms.uTime.value = elapsed;

      if (!reduceMotion && !mobile) {
        smoothedPointer.lerp(pointer, 0.035);
        camera.position.x = smoothedPointer.x * 0.16;
        camera.position.y = -2.5 - smoothedPointer.y * 0.1;
        camera.lookAt(smoothedPointer.x * 0.025, smoothedPointer.y * -0.02, 0);
      }

      renderer.render(scene, camera);
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      mount.removeEventListener("pointermove", onPointerMove);
      mount.removeEventListener("pointerleave", onPointerLeave);
      geometries.forEach((geometry) => geometry.dispose());
      strandMaterial.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      onReadyChange(false);
    };
  }, [onReadyChange]);

  return <div className="field-body-3d" ref={mountRef} aria-hidden="true" />;
}
