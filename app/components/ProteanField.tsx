"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type Sky = "clear" | "cloud" | "fog";

const vertexShader = `
  uniform float uTime;
  uniform float uWaveHeight;
  uniform float uStorm;
  uniform float uCurrent;
  uniform float uSkew;
  uniform float uCloud;
  uniform vec2 uPointer;
  attribute vec3 aBarycentric;
  attribute vec3 aCenter;
  attribute float aTip;
  varying vec3 vBarycentric;
  varying float vElevation;
  varying float vDistance;
  varying float vPulse;

  void main() {
    vec3 p = position;
    float slow = uTime * (0.18 + uStorm * 0.32);
    float alongX = sin((aCenter.x * 0.78) + slow * 2.1);
    float alongZ = cos((aCenter.z * 0.92) - slow * 1.37);
    float crossWave = sin((aCenter.x + aCenter.z) * 1.55 + slow * 3.0);
    float triangleBreath = 1.0 + aTip * uWaveHeight * 0.018 * (alongX + alongZ);

    p.z = aCenter.z + (p.z - aCenter.z) * triangleBreath;
    p.x += (p.z - aCenter.z) * uSkew * 0.012;
    p.x += sin(p.z * 0.75 + slow) * uCurrent * 0.006;

    float elevation = (alongX + alongZ) * uWaveHeight * 0.075;
    elevation += crossWave * uStorm * uWaveHeight * 0.055;
    elevation += aTip * sin(aCenter.x * 1.7 - slow * 2.4) * uWaveHeight * 0.018;
    vec2 pointerCenter = vec2(uPointer.x * 5.8, -uPointer.y * 3.6);
    float pointerFalloff = exp(-distance(aCenter.xz, pointerCenter) * 0.62);
    elevation += pointerFalloff * sin(slow * 6.0 + distance(aCenter.xz, pointerCenter) * 2.1) * (0.55 + uWaveHeight * 0.018);
    p.y += elevation;

    float curl = (aCenter.z / 9.0) * uCurrent * 0.006;
    float c = cos(curl);
    float s = sin(curl);
    p.xz = mat2(c, -s, s, c) * p.xz;

    vBarycentric = aBarycentric;
    vElevation = elevation;
    vDistance = length(aCenter.xz) / 9.5;
    vPulse = 0.5 + 0.5 * crossWave;

    vec4 world = modelMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const fragmentShader = `
  uniform float uStorm;
  uniform float uCloud;
  uniform float uTime;
  varying vec3 vBarycentric;
  varying float vElevation;
  varying float vDistance;
  varying float vPulse;

  float edgeFactor() {
    vec3 d = fwidth(vBarycentric);
    vec3 a3 = smoothstep(vec3(0.0), d * 1.25, vBarycentric);
    return min(min(a3.x, a3.y), a3.z);
  }

  void main() {
    vec3 robin = vec3(0.58, 0.89, 0.91);
    vec3 sky = vec3(0.46, 0.79, 0.96);
    vec3 periwinkle = vec3(0.56, 0.57, 0.92);
    vec3 foam = vec3(0.96, 0.98, 0.96);
    vec3 graphite = vec3(0.06, 0.08, 0.10);
    vec3 stormBlue = vec3(0.10, 0.16, 0.22);

    float crest = smoothstep(-0.4, 1.5, vElevation);
    vec3 calm = mix(robin, sky, vPulse);
    calm = mix(calm, periwinkle, smoothstep(0.2, 1.0, vDistance));
    calm = mix(calm, foam, crest * 0.68);
    vec3 storm = mix(stormBlue, graphite, vDistance * 0.72 + (1.0 - crest) * 0.25);
    vec3 color = mix(calm, storm, uStorm);
    color = mix(color, foam, uCloud * 0.28 * (1.0 - vDistance));

    float edge = 1.0 - edgeFactor();
    float body = 0.16 + crest * 0.17;
    float alpha = body + edge * (0.58 + uStorm * 0.18);
    alpha *= 1.0 - smoothstep(0.72, 1.16, vDistance) * (0.24 + uCloud * 0.36);
    gl_FragColor = vec4(color, alpha);
  }
`;

function makeTriangleField() {
  const geometry = new THREE.BufferGeometry();
  const positions: number[] = [];
  const barycentric: number[] = [];
  const centers: number[] = [];
  const tips: number[] = [];
  const columns = 48;
  const rows = 34;
  const width = 0.34;
  const height = 0.38;

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const cx = (column - columns / 2) * width * 0.91 + (row % 2) * width * 0.45;
      const cz = (row - rows / 2) * height * 0.78;
      const flip = (row + column) % 2 === 0 ? 1 : -1;
      const baseZ = cz - flip * height * 0.42;
      const tipZ = cz + flip * height * 0.58;

      positions.push(
        cx - width / 2, 0, baseZ,
        cx + width / 2, 0, baseZ,
        cx, 0, tipZ,
      );
      barycentric.push(1, 0, 0, 0, 1, 0, 0, 0, 1);
      centers.push(cx, 0, cz, cx, 0, cz, cx, 0, cz);
      tips.push(0, 0, 1);
    }
  }

  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("aBarycentric", new THREE.Float32BufferAttribute(barycentric, 3));
  geometry.setAttribute("aCenter", new THREE.Float32BufferAttribute(centers, 3));
  geometry.setAttribute("aTip", new THREE.Float32BufferAttribute(tips, 1));
  geometry.computeBoundingSphere();
  return geometry;
}

export function ProteanField() {
  const mountRef = useRef<HTMLDivElement>(null);
  const uniformsRef = useRef<Record<string, THREE.IUniform> | null>(null);
  const [waveHeight, setWaveHeight] = useState(42);
  const [storm, setStorm] = useState(18);
  const [current, setCurrent] = useState(24);
  const [skew, setSkew] = useState(12);
  const [sky, setSky] = useState<Sky>("clear");

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(0, 5.6, 8.8);
    camera.lookAt(0, -0.35, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    } catch {
      mount.dataset.fallback = "true";
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const uniforms: Record<string, THREE.IUniform> = {
      uTime: { value: 0 },
      uWaveHeight: { value: 42 },
      uStorm: { value: 0.18 },
      uCurrent: { value: 24 },
      uSkew: { value: 12 },
      uCloud: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
    };
    uniformsRef.current = uniforms;

    const geometry = makeTriangleField();
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const field = new THREE.Mesh(geometry, material);
    field.rotation.y = -0.08;
    scene.add(field);

    const pointer = new THREE.Vector2(0, 0);
    const onPointerMove = (event: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      mount.classList.add("is-engaged");
    };
    const onPointerLeave = () => mount.classList.remove("is-engaged");

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };
    resize();
    mount.addEventListener("pointermove", onPointerMove);
    mount.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("resize", resize);

    const clock = new THREE.Clock();
    let animation = 0;
    const draw = () => {
      const time = clock.getElapsedTime();
      uniforms.uTime.value = time;
      (uniforms.uPointer.value as THREE.Vector2).lerp(pointer, 0.075);
      field.rotation.y += (pointer.x * 0.08 - field.rotation.y) * 0.025;
      field.rotation.x += (-pointer.y * 0.035 - field.rotation.x) * 0.02;
      camera.position.x += (pointer.x * 0.35 - camera.position.x) * 0.018;
      camera.lookAt(0, -0.35, 0);

      const stormValue = Number(uniforms.uStorm.value);
      const cloudValue = Number(uniforms.uCloud.value);
      const calm = new THREE.Color("#d8f4f2");
      const dark = new THREE.Color("#080b10");
      const cloudy = new THREE.Color("#8fa8b4");
      calm.lerp(cloudy, cloudValue * 0.72).lerp(dark, stormValue * 0.92);
      renderer.setClearColor(calm, 1);
      renderer.render(scene, camera);
      animation = requestAnimationFrame(draw);
    };
    animation = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animation);
      mount.removeEventListener("pointermove", onPointerMove);
      mount.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("resize", resize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      uniformsRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!uniformsRef.current) return;
    uniformsRef.current.uWaveHeight.value = waveHeight;
    uniformsRef.current.uStorm.value = storm / 100;
    uniformsRef.current.uCurrent.value = current;
    uniformsRef.current.uSkew.value = skew;
    uniformsRef.current.uCloud.value = sky === "clear" ? 0 : sky === "cloud" ? 0.48 : 0.92;
    mountRef.current?.style.setProperty("--fallback-storm", `${storm}%`);
    mountRef.current?.style.setProperty("--fallback-wave", `${waveHeight / 5}px`);
  }, [waveHeight, storm, current, skew, sky]);

  const reset = () => {
    setWaveHeight(42);
    setStorm(18);
    setCurrent(24);
    setSkew(12);
    setSky("clear");
  };

  return (
    <div className="playground-tool playground-tool--waves">
      <div
        className={`playground-canvas playground-canvas--${sky}`}
        ref={mountRef}
        role="img"
        aria-label="A dimensional field of isosceles triangles deformed by sine and cosine waves"
      />
      <p className="playground-interaction-cue" aria-hidden="true">Move across the water ↗</p>
      <div className="wave-readout" aria-hidden="true">
        <span>calm</span>
        <i />
        <span>storm</span>
      </div>
      <aside className="playground-controls playground-controls--waves">
        <p className="micro">WATER / FIELD 01</p>
        <h2>Wave controls</h2>
        <section className="control-section">
          <p>Surface</p>
          <label>Wave height <output>{waveHeight}</output><input type="range" min="5" max="100" value={waveHeight} onInput={(event) => setWaveHeight(Number(event.currentTarget.value))} /></label>
          <label>Current <output>{current}</output><input type="range" min="0" max="100" value={current} onInput={(event) => setCurrent(Number(event.currentTarget.value))} /></label>
          <label>Skew <output>{skew}</output><input type="range" min="-55" max="55" value={skew} onInput={(event) => setSkew(Number(event.currentTarget.value))} /></label>
        </section>
        <section className="control-section">
          <p>Weather</p>
          <label>Storm water <output>{storm}</output><input type="range" min="0" max="100" value={storm} onInput={(event) => setStorm(Number(event.currentTarget.value))} /></label>
          <div className="sky-switch" role="group" aria-label="Sky condition">
            {(["clear", "cloud", "fog"] as Sky[]).map((condition) => (
              <button className={sky === condition ? "is-active" : ""} key={condition} onClick={() => setSky(condition)} type="button">
                {condition}
              </button>
            ))}
          </div>
        </section>
        <button className="reset-control" type="button" onClick={reset}>Reset water</button>
      </aside>
      <p className="wave-caption">Each face is an isosceles triangle. Wave height lengthens its equal sides; sine and cosine fields move the apexes out of phase.</p>
    </div>
  );
}
