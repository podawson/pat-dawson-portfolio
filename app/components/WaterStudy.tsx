"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type Sky = "clear" | "cloud" | "fog";
type WaterSettings = {
  waveHeight: number; chop: number; swell: number; current: number; skew: number; fetch: number; foam: number;
  storm: number; windAngle: number; gust: number; rain: number;
  sunAngle: number; glint: number; depthTint: number; haze: number;
  tilt: number; zoom: number; vignette: number; grain: number;
};

const initial: WaterSettings = {
  waveHeight: 38, chop: 26, swell: 48, current: 24, skew: 8, fetch: 44, foam: 22,
  storm: 12, windAngle: 18, gust: 10, rain: 0,
  sunAngle: 36, glint: 58, depthTint: 34, haze: 8,
  tilt: 17, zoom: 48, vignette: 14, grain: 4,
};

const presets: Array<{ name: string; sky: Sky; values: WaterSettings }> = [
  { name: "Glass calm", sky: "clear", values: { ...initial, waveHeight: 15, chop: 4, swell: 24, current: 10, skew: 0, fetch: 78, foam: 2, storm: 0, windAngle: 0, gust: 0, rain: 0, sunAngle: 28, glint: 76, depthTint: 18, haze: 0, tilt: 10, zoom: 56, vignette: 6, grain: 0 } },
  { name: "Short chop", sky: "cloud", values: { ...initial, waveHeight: 43, chop: 82, swell: 18, current: 48, skew: 22, fetch: 16, foam: 46, storm: 28, windAngle: 62, gust: 34, rain: 8, sunAngle: 54, glint: 38, depthTint: 46, haze: 16, tilt: 25, zoom: 43, vignette: 18, grain: 7 } },
  { name: "Squall", sky: "cloud", values: { ...initial, waveHeight: 86, chop: 91, swell: 70, current: 76, skew: -32, fetch: 28, foam: 78, storm: 92, windAngle: 116, gust: 88, rain: 74, sunAngle: 78, glint: 24, depthTint: 90, haze: 48, tilt: 33, zoom: 37, vignette: 46, grain: 22 } },
  { name: "Fog bank", sky: "fog", values: { ...initial, waveHeight: 28, chop: 18, swell: 66, current: 16, skew: 4, fetch: 72, foam: 12, storm: 22, windAngle: 145, gust: 8, rain: 2, sunAngle: 12, glint: 8, depthTint: 52, haze: 92, tilt: 8, zoom: 60, vignette: 28, grain: 12 } },
];

const groups: Array<{ title: string; controls: Array<{ key: keyof WaterSettings; label: string; min: number; max: number }> }> = [
  { title: "Surface", controls: [
    { key: "waveHeight", label: "Wave height", min: 0, max: 100 }, { key: "chop", label: "Chop", min: 0, max: 100 },
    { key: "swell", label: "Swell", min: 0, max: 100 }, { key: "current", label: "Current", min: 0, max: 100 },
    { key: "skew", label: "Skew", min: -55, max: 55 }, { key: "fetch", label: "Fetch", min: 0, max: 100 },
    { key: "foam", label: "Foam", min: 0, max: 100 },
  ]},
  { title: "Weather", controls: [
    { key: "storm", label: "Storm water / speed", min: 0, max: 100 }, { key: "windAngle", label: "Wind angle", min: 0, max: 180 },
    { key: "gust", label: "Gust", min: 0, max: 100 }, { key: "rain", label: "Rain", min: 0, max: 100 },
  ]},
  { title: "Light", controls: [
    { key: "sunAngle", label: "Sun angle", min: 0, max: 180 }, { key: "glint", label: "Glint", min: 0, max: 100 },
    { key: "depthTint", label: "Depth tint", min: 0, max: 100 }, { key: "haze", label: "Haze", min: 0, max: 100 },
  ]},
  { title: "Lens", controls: [
    { key: "tilt", label: "Tilt", min: -15, max: 55 }, { key: "zoom", label: "Zoom", min: 20, max: 80 },
    { key: "vignette", label: "Vignette", min: 0, max: 100 }, { key: "grain", label: "Grain", min: 0, max: 100 },
  ]},
];

const vertexShader = `
  uniform float uTime; uniform float uWaveHeight; uniform float uChop; uniform float uSwell;
  uniform float uCurrent; uniform float uSkew; uniform float uFetch; uniform float uGust; uniform float uStorm;
  uniform float uRain; uniform float uWindAngle; uniform vec2 uPointer;
  attribute vec3 aBarycentric; attribute vec3 aCenter; attribute float aTip;
  varying vec3 vBarycentric; varying float vElevation; varying float vCrest; varying float vDistance;
  void main() {
    vec3 p = position;
    float angle = uWindAngle * 3.14159265;
    mat2 wind = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    vec2 q = wind * aCenter.xz;
    float scale = mix(2.2, .56, uFetch);
    float time = uTime * (mix(.18, 1.15, uCurrent) + uStorm * 1.72);
    float base = sin(q.x * scale + time * 1.7) + .58 * cos(q.y * scale * 1.27 - time * 1.1);
    float sharpened = sign(base) * pow(abs(base) * .5, mix(1.0, .34, uChop));
    float swell = sin((q.x + q.y * .28) * .24 + time * .34) * uSwell * 1.7;
    float gust = pow(.5 + .5 * sin(uTime * 1.7 + q.y * .18), 7.0) * uGust;
    float rainCell = sin(length(fract((q + uTime * .17) * .43) - .5) * 36.0 - uTime * 9.0) * uRain;
    float stormCross = sin(q.x * scale * 2.6 - time * 3.4) * cos(q.y * scale * 1.9 + time * 2.2);
    float stormRake = sin((q.x - q.y * .54) * scale * 3.5 + time * 5.1);
    float amplitude = .12 + uWaveHeight * 1.48 + uStorm * .5;
    float elevation = sharpened * amplitude + swell + gust * sharpened * .72 + rainCell * .17;
    elevation += (stormCross * .34 + stormRake * .16) * uStorm * (1.0 + uChop * .65);
    vec2 pointerCenter = vec2(uPointer.x * 6.5, -uPointer.y * 4.0);
    float pointerDistance = distance(aCenter.xz, pointerCenter);
    elevation += exp(-pointerDistance * .72) * sin(pointerDistance * 4.2 - uTime * 3.0) * .72;
    float stretch = 1.0 + aTip * uWaveHeight * .11 * (1.0 + uChop * .85);
    p.z = aCenter.z + (p.z - aCenter.z) * stretch;
    p.x += (p.z - aCenter.z) * uSkew * .34;
    p.x += sin(q.y * .42 + time) * uCurrent * .42;
    p.x += stormCross * uStorm * .18;
    p.z += stormRake * uStorm * .13;
    p.y += elevation;
    vBarycentric = aBarycentric; vElevation = elevation; vCrest = max(0.0, sharpened); vDistance = length(aCenter.xz) / 10.0;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(p, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime; uniform float uFoam; uniform float uStorm; uniform float uCloud; uniform float uFog;
  uniform float uSunAngle; uniform float uGlint; uniform float uDepthTint; uniform float uHaze; uniform float uGrain;
  uniform vec2 uResolution;
  varying vec3 vBarycentric; varying float vElevation; varying float vCrest; varying float vDistance;
  float edgeFactor(){ vec3 d=fwidth(vBarycentric); vec3 a3=smoothstep(vec3(0.0),d*1.25,vBarycentric); return min(min(a3.x,a3.y),a3.z); }
  float noise(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
  void main(){
    vec3 robin=vec3(.50,.88,.91); vec3 sky=vec3(.39,.70,.94); vec3 peri=vec3(.45,.48,.83);
    vec3 deep=vec3(.025,.065,.095); vec3 graphite=vec3(.025,.032,.04); vec3 foam=vec3(.94,.98,.97);
    float depth=clamp((1.0-vElevation*.34)*.55+vDistance*.34,0.0,1.0);
    vec3 calm=mix(robin,sky,clamp(vElevation*.36+.45,0.0,1.0)); calm=mix(calm,peri,vDistance*.76);
    calm=mix(calm,deep,uDepthTint*depth); vec3 color=mix(calm,mix(deep,graphite,depth),uStorm);
    float sun=sin(uSunAngle*6.28318+vElevation*1.4)*.5+.5;
    float spec=pow(clamp(sun*vCrest,0.0,1.0),mix(16.0,2.0,uGlint))*uGlint;
    float foamMask=smoothstep(mix(1.15,.05,uFoam),1.18,vCrest+max(0.0,vElevation)*.18);
    color=mix(color,foam,foamMask*.86+spec*.74); color=mix(color,vec3(.64,.72,.75),uCloud*.26+uHaze*.38+uFog*.46);
    float edge=1.0-edgeFactor(); float alpha=.18+edge*(.52+uStorm*.24)+foamMask*.18;
    alpha*=1.0-vDistance*(.18+uFog*.36); float grain=(noise(gl_FragCoord.xy+uTime*61.0)-.5)*uGrain*.24;
    color+=grain; gl_FragColor=vec4(color,mix(.72,1.0,alpha));
  }
`;

function makeTriangleField() {
  const geometry = new THREE.BufferGeometry();
  const positions: number[] = []; const barycentric: number[] = []; const centers: number[] = []; const tips: number[] = [];
  const columns = 56; const rows = 40; const width = .3; const height = .34;
  for (let row = 0; row < rows; row += 1) for (let column = 0; column < columns; column += 1) {
    const cx = (column - columns / 2) * width * .91 + (row % 2) * width * .45;
    const cz = (row - rows / 2) * height * .78; const flip = (row + column) % 2 === 0 ? 1 : -1;
    positions.push(cx-width/2,0,cz-flip*height*.42,cx+width/2,0,cz-flip*height*.42,cx,0,cz+flip*height*.58);
    barycentric.push(1,0,0,0,1,0,0,0,1); centers.push(cx,0,cz,cx,0,cz,cx,0,cz); tips.push(0,0,1);
  }
  geometry.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute("aBarycentric",new THREE.Float32BufferAttribute(barycentric,3));
  geometry.setAttribute("aCenter",new THREE.Float32BufferAttribute(centers,3));
  geometry.setAttribute("aTip",new THREE.Float32BufferAttribute(tips,1)); geometry.computeBoundingSphere(); return geometry;
}

export function WaterStudy() {
  const mountRef = useRef<HTMLDivElement>(null);
  const uniformsRef = useRef<Record<string, THREE.IUniform> | null>(null);
  const sceneRef = useRef<{ field: THREE.Mesh; camera: THREE.PerspectiveCamera } | null>(null);
  const [settings, setSettings] = useState(initial);
  const [sky, setSky] = useState<Sky>("clear");
  const [panelOpen, setPanelOpen] = useState(true);

  const applyPreset = (index: number) => { setSettings(presets[index].values); setSky(presets[index].sky); };
  const reset = () => { setSettings(initial); setSky("clear"); };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return;
      if (event.key.toLowerCase() === "h") setPanelOpen((open) => !open);
      if (event.key.toLowerCase() === "r") reset();
      const number = Number(event.key);
      if (number >= 1 && number <= 4) applyPreset(number - 1);
    };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const mount = mountRef.current; if (!mount) return;
    const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(44,1,.1,100); camera.position.set(0,9.2,9.6); camera.lookAt(0,-.15,0);
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance", preserveDrawingBuffer: true }); }
    catch { mount.dataset.fallback = "true"; return; }
    renderer.setClearColor(0x000000,0); renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1,2)); renderer.outputColorSpace=THREE.SRGBColorSpace; mount.appendChild(renderer.domElement);
    const uniforms: Record<string, THREE.IUniform> = {
      uTime:{value:0},uWaveHeight:{value:.38},uChop:{value:.26},uSwell:{value:.48},uCurrent:{value:.24},uSkew:{value:.08},uFetch:{value:.44},uFoam:{value:.22},
      uStorm:{value:.12},uWindAngle:{value:.1},uGust:{value:.1},uRain:{value:0},uCloud:{value:0},uFog:{value:0},uSunAngle:{value:.2},uGlint:{value:.58},uDepthTint:{value:.34},uHaze:{value:.08},uGrain:{value:.04},
      uResolution:{value:new THREE.Vector2(1,1)},uPointer:{value:new THREE.Vector2(0,0)},
    };
    uniformsRef.current=uniforms;
    const geometry=makeTriangleField(); const material=new THREE.ShaderMaterial({vertexShader,fragmentShader,uniforms,transparent:false,depthWrite:true,side:THREE.DoubleSide});
    const field=new THREE.Mesh(geometry,material); scene.add(field); sceneRef.current={field,camera};
    const pointer=new THREE.Vector2(0,0);
    const onPointer=(event:PointerEvent)=>{const rect=mount.getBoundingClientRect();pointer.set(((event.clientX-rect.left)/rect.width-.5)*2,((event.clientY-rect.top)/rect.height-.5)*2);mount.classList.add("is-engaged");};
    const onLeave=()=>mount.classList.remove("is-engaged");
    const resize=()=>{const width=mount.clientWidth,height=mount.clientHeight;renderer.setSize(width,height,false);camera.aspect=width/Math.max(height,1);camera.updateProjectionMatrix();uniforms.uResolution.value.set(width,height);};
    resize(); mount.addEventListener("pointermove",onPointer); mount.addEventListener("pointerleave",onLeave); window.addEventListener("resize",resize);
    const clock=new THREE.Clock(); let animation=0;
    const draw=()=>{uniforms.uTime.value=clock.getElapsedTime();(uniforms.uPointer.value as THREE.Vector2).lerp(pointer,.075);field.rotation.y+=(pointer.x*.07-field.rotation.y)*.025;renderer.render(scene,camera);animation=requestAnimationFrame(draw);};
    animation=requestAnimationFrame(draw);
    return()=>{cancelAnimationFrame(animation);mount.removeEventListener("pointermove",onPointer);mount.removeEventListener("pointerleave",onLeave);window.removeEventListener("resize",resize);geometry.dispose();material.dispose();renderer.dispose();renderer.domElement.remove();uniformsRef.current=null;sceneRef.current=null;};
  }, []);

  useEffect(() => {
    const uniforms=uniformsRef.current; const sceneState=sceneRef.current; if(!uniforms||!sceneState) return;
    Object.entries(settings).forEach(([key,value])=>{
      const uniformName=`u${key.charAt(0).toUpperCase()}${key.slice(1)}`;
      if(uniforms[uniformName]) uniforms[uniformName].value = key === "skew" ? value/55 : key === "windAngle" || key === "sunAngle" ? value/180 : value/100;
    });
    uniforms.uCloud.value=sky==="cloud"?.58:sky==="fog"?.38:0; uniforms.uFog.value=sky==="fog"?.94:0;
    sceneState.field.rotation.x=THREE.MathUtils.degToRad(-4-settings.tilt*.28); sceneState.camera.position.z=13.4-settings.zoom*.065; sceneState.camera.position.y=8.4+settings.tilt*.055; sceneState.camera.lookAt(0,-.18,0);
    mountRef.current?.style.setProperty("--study-vignette",String(settings.vignette/100));
    mountRef.current?.style.setProperty("--study-haze",String(settings.haze/100));
  },[settings,sky]);

  const capture = () => {
    const canvas=mountRef.current?.querySelector("canvas"); if(!canvas) return;
    const link=document.createElement("a"); link.download=`water-study-${Date.now()}.png`; link.href=canvas.toDataURL("image/png"); link.click();
  };

  return (
    <div className="study-tool study-tool--water">
      <div className={`study-canvas study-canvas--${sky}`} ref={mountRef} role="img" aria-label="A dimensional field of isosceles triangles deformed by nineteen live water, weather, light, and lens parameters"><div className="study-vignette" /></div>
      <p className="study-interaction-cue" aria-hidden="true">Move across the water ↗</p>
      {!panelOpen && <button className="study-controls-reopen" onClick={()=>setPanelOpen(true)} type="button">Open controls</button>}
      {panelOpen && <aside className="study-controls">
        <button className="study-controls-close" onClick={()=>setPanelOpen(false)} aria-label="Hide controls" type="button">×</button>
        <p className="micro">Water / Field 01</p><h2>Flow controls</h2>
        <div className="study-presets">{presets.map((preset,index)=><button key={preset.name} onClick={()=>applyPreset(index)} type="button"><b>{index+1}</b>{preset.name}</button>)}</div>
        {groups.map((group)=><section className="study-control-section" key={group.title}><p>{group.title}</p>{group.controls.map((control)=><label key={control.key}>{control.label}<output>{settings[control.key]}</output><input aria-label={control.label} type="range" min={control.min} max={control.max} value={settings[control.key]} onInput={(event)=>{const value=Number(event.currentTarget.value);setSettings((current)=>({...current,[control.key]:value}));}}/></label>)}{group.title==="Weather"&&<div className="study-sky-switch" role="group" aria-label="Sky condition">{(["clear","cloud","fog"] as Sky[]).map((condition)=><button className={sky===condition?"is-active":""} key={condition} onClick={()=>setSky(condition)} type="button">{condition}</button>)}</div>}</section>)}
        <div className="study-actions"><button onClick={reset} type="button">Reset</button><button onClick={capture} type="button">Capture PNG</button></div>
        <p className="study-shortcuts"><span>H</span> controls <span>R</span> reset <span>1–4</span> presets</p>
      </aside>}
      <p className="study-caption">Each face is an isosceles triangle. Wave height lengthens its equal sides while sine, cosine, wind, rain, light, and lens fields deform the shared surface.</p>
    </div>
  );
}
