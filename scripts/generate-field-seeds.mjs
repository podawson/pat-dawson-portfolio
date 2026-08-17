import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const coordinates = [
  [-0.65, -0.45], [-0.35, -0.70], [-0.10, -0.85], [-0.75, 0.15],
  [-0.40, 0.45], [0.50, -0.45], [0.30, 0.60], [0.40, 0.85],
  [0.60, -0.20], [0.70, 0.10], [0.90, -0.15], [0.80, -0.35],
  [0.80, 0.25], [0.20, 0.35],
];

function randomFrom(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function renderField(seed, width = 1600, height = 1000) {
  const random = randomFrom(seed);
  const sx = width / 1600;
  const sy = height / 1000;
  const jitter = () => (random() - 0.5) * 84 * sy;
  const anchors = [
    [-100, 690 + jitter()],
    [250, 600 + jitter()],
    [540, 520 + jitter()],
    [820, 500 + jitter()],
    [1120, 360 + jitter()],
    [1690, 270 + jitter()],
  ].map(([x, y]) => [x * sx, y * sy]);
  const pathFor = (offset, drift = 0) => {
    const points = anchors.map(([x, y], index) => [
      x,
      y + offset * (0.58 + Math.sin(index * 1.31 + seed * 0.017) * 0.32) + drift * index,
    ]);
    return `M ${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)} C ${points[1][0].toFixed(1)} ${points[1][1].toFixed(1)}, ${points[2][0].toFixed(1)} ${points[2][1].toFixed(1)}, ${points[3][0].toFixed(1)} ${points[3][1].toFixed(1)} S ${points[4][0].toFixed(1)} ${points[4][1].toFixed(1)}, ${points[5][0].toFixed(1)} ${points[5][1].toFixed(1)}`;
  };
  const ribbon = [];
  for (let index = 0; index < 126; index += 1) {
    const amount = index / 125;
    const offset = (amount - 0.5) * 430 * sy;
    const opacity = 0.055 + (1 - Math.abs(amount - 0.5) * 2) * 0.18;
    const hue = 205 + amount * 52 + Math.sin(seed * 0.1) * 8;
    ribbon.push(`<path d="${pathFor(offset, (random() - 0.5) * 3)}" fill="none" stroke="hsla(${hue.toFixed(0)},65%,${(72 + amount * 8).toFixed(0)}%,${opacity.toFixed(3)})" stroke-width="${(0.42 + random() * 0.62).toFixed(2)}"/>`);
  }
  const loose = [];
  for (let index = 0; index < 44; index += 1) {
    const side = index % 2 === 0 ? -1 : 1;
    const startX = (180 + random() * 1160) * sx;
    const startY = (480 + side * (130 + random() * 180)) * sy;
    const endX = startX + (random() - 0.5) * 420 * sx;
    const endY = startY + side * (80 + random() * 250) * sy;
    const controlX = (startX + endX) / 2 + (random() - 0.5) * 160 * sx;
    const controlY = (startY + endY) / 2 - side * random() * 80 * sy;
    loose.push(`<path d="M${startX.toFixed(1)} ${startY.toFixed(1)} Q${controlX.toFixed(1)} ${controlY.toFixed(1)} ${endX.toFixed(1)} ${endY.toFixed(1)}" fill="none" stroke="rgba(174,193,235,${(0.06 + random() * 0.13).toFixed(3)})" stroke-width="${(0.35 + random() * 0.45).toFixed(2)}"/>`);
  }
  const folds = coordinates.map(([x, y], index) => {
    const px = (800 + x * 620) * sx;
    const py = (510 - y * 340) * sy;
    const radius = (44 + (index % 4) * 13 + random() * 24) * sy;
    return `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${radius.toFixed(1)}" fill="url(#nodeSheen)" opacity="${(0.09 + random() * 0.08).toFixed(3)}"/>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="body" x1="0" y1="1" x2="1" y2="0"><stop stop-color="#111c28"/><stop offset=".48" stop-color="#24275a"/><stop offset=".72" stop-color="#284b74"/><stop offset="1" stop-color="#171d2c"/></linearGradient>
    <radialGradient id="nodeSheen"><stop stop-color="#e8f6f7" stop-opacity=".72"/><stop offset=".24" stop-color="#6b84dd" stop-opacity=".42"/><stop offset="1" stop-color="#142033" stop-opacity="0"/></radialGradient>
    <filter id="velvet" x="-20%" y="-30%" width="140%" height="160%"><feGaussianBlur stdDeviation="${(24 * sy).toFixed(1)}"/><feColorMatrix values="1.12 0 0 0 0 0 .92 0 0 0 0 0 1.3 0 0 0 0 0 .88 0"/></filter>
  </defs>
  <rect width="100%" height="100%" fill="#090b0d"/>
  <path d="${pathFor(0)}" fill="none" stroke="url(#body)" stroke-width="${(410 * sy).toFixed(1)}" stroke-linecap="round" opacity=".92" filter="url(#velvet)"/>
  <path d="${pathFor(-55)}" fill="none" stroke="rgba(205,222,244,.2)" stroke-width="${(54 * sy).toFixed(1)}" stroke-linecap="round" filter="url(#velvet)"/>
  ${folds.join("\n  ")}
  <g>${ribbon.join("\n")}</g>
  <g>${loose.join("\n")}</g>
</svg>`;
}

const mode = process.argv[2] ?? "--selected";
if (mode === "--candidates") {
  const output = path.resolve(process.argv[3] ?? "/private/tmp/field-seed-candidates");
  await mkdir(output, { recursive: true });
  for (let seed = 1; seed <= 200; seed += 1) {
    await writeFile(path.join(output, `field-${String(seed).padStart(3, "0")}.svg`), renderField(seed, 400, 250));
  }
  await writeFile(path.join(output, "index.html"), `<style>body{background:#090b0d;color:white;font:12px monospace;display:grid;grid-template-columns:repeat(5,1fr);gap:10px}figure{margin:0}img{width:100%}</style>${Array.from({length:200},(_,i)=>`<figure><img src="field-${String(i+1).padStart(3,"0")}.svg"><figcaption>${i+1}</figcaption></figure>`).join("")}`);
  console.log(`Generated 200 candidates in ${output}`);
} else {
  const seedFile = path.resolve("app/field-seeds.json");
  const { seeds } = JSON.parse(await readFile(seedFile, "utf8"));
  const output = path.resolve("public/field");
  await mkdir(output, { recursive: true });
  for (const seed of seeds) await writeFile(path.join(output, `field-${seed}.svg`), renderField(seed));
  console.log(`Generated ${seeds.length} selected field compositions in ${output}`);
}
