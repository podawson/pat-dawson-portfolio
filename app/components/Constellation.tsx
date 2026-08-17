"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  categories,
  projectConnections,
  projects,
  type Category,
  type ConnectionKind,
} from "../data";

const relationColor: Record<ConnectionKind, string> = {
  method: "#72d9e8",
  handoff: "#f58a61",
  authority: "#a6a7ff",
  constraint: "#d9e6e4",
  lineage: "#e09ac6",
};

function RelationshipLines({
  activeSlug,
  category,
  selectedOnly,
}: {
  activeSlug: string;
  category: "All" | Category;
  selectedOnly: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const fieldCanvas = document.createElement("canvas");
    const fieldContext = fieldCanvas.getContext("2d");
    if (!fieldContext) return;

    let animation = 0;
    let width = 0;
    let height = 0;
    let pointer: { x: number; y: number } | null = null;
    let lastFrame = -Infinity;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const pointFor = (slug: string) => {
      const project = projects.find((item) => item.slug === slug) ?? projects[0];
      return { x: (project.node.x / 100) * width, y: (project.node.y / 100) * height };
    };

    const visible = (slug: string) => {
      const project = projects.find((item) => item.slug === slug);
      return category === "All" || Boolean(project?.categories.includes(category));
    };

    type Point = { x: number; y: number };

    const distanceToSegment = (point: Point, start: Point, end: Point) => {
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const lengthSquared = dx * dx + dy * dy || 1;
      const amount = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared));
      const nearestX = start.x + amount * dx;
      const nearestY = start.y + amount * dy;
      return Math.hypot(point.x - nearestX, point.y - nearestY);
    };

    const smoothstep = (edge0: number, edge1: number, value: number) => {
      const amount = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
      return amount * amount * (3 - 2 * amount);
    };

    const drawTopology = (time: number) => {
      const selectedSlugs = new Set<string>([activeSlug]);
      projectConnections.forEach((connection) => {
        if (connection.from === activeSlug) selectedSlugs.add(connection.to);
        if (connection.to === activeSlug) selectedSlugs.add(connection.from);
      });

      const fieldProjects = projects.filter(
        (project) => visible(project.slug) && (!selectedOnly || selectedSlugs.has(project.slug)),
      );
      const fieldConnections = projectConnections.filter((connection) => {
        const activeConnection = connection.from === activeSlug || connection.to === activeSlug;
        return visible(connection.from) && visible(connection.to) && (!selectedOnly || activeConnection);
      });

      const cell = Math.max(11, Math.min(16, Math.round(Math.min(width, height) / 82)));
      const columns = Math.max(2, Math.ceil(width / cell) + 1);
      const rows = Math.max(2, Math.ceil(height / cell) + 1);
      const stepX = width / (columns - 1);
      const stepY = height / (rows - 1);
      const scale = Math.min(width, height);
      const values = new Float32Array(columns * rows);

      const nodeFields = fieldProjects.map((project) => ({
        point: pointFor(project.slug),
        sigma: scale * 0.038 + project.node.size * 0.28,
        weight:
          0.72 +
          projectConnections.filter(
            (connection) => connection.from === project.slug || connection.to === project.slug,
          ).length * 0.055 +
          (project.slug === activeSlug ? 0.2 : 0),
      }));
      const edgeFields = fieldConnections.map((connection) => ({
        start: pointFor(connection.from),
        end: pointFor(connection.to),
        sigma: scale * (connection.from === activeSlug || connection.to === activeSlug ? 0.03 : 0.022),
        weight: connection.from === activeSlug || connection.to === activeSlug ? 0.72 : 0.54,
      }));

      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const sample = { x: column * stepX, y: row * stepY };
          let value = 0;
          nodeFields.forEach((node) => {
            const distanceSquared = (sample.x - node.point.x) ** 2 + (sample.y - node.point.y) ** 2;
            value += node.weight * Math.exp(-distanceSquared / (2 * node.sigma ** 2));
          });
          edgeFields.forEach((edge) => {
            const distance = distanceToSegment(sample, edge.start, edge.end);
            if (distance < edge.sigma * 3.4) {
              value += edge.weight * Math.exp(-(distance ** 2) / (2 * edge.sigma ** 2));
            }
          });
          if (pointer && !reduceMotion) {
            const pointerSigma = scale * 0.105;
            const pointerDistanceSquared = (sample.x - pointer.x) ** 2 + (sample.y - pointer.y) ** 2;
            value -= 0.72 * Math.exp(-pointerDistanceSquared / (2 * pointerSigma ** 2));
          }
          value += Math.sin(sample.x * 0.0042 + sample.y * 0.0031 + time * 0.00016) * 0.022;
          values[row * columns + column] = value;
        }
      }

      fieldCanvas.width = columns;
      fieldCanvas.height = rows;
      const imageData = fieldContext.createImageData(columns, rows);
      for (let index = 0; index < values.length; index += 1) {
        const value = values[index];
        const column = index % columns;
        const row = Math.floor(index / columns);
        const paletteAmount = Math.max(0, Math.min(1, column / columns * 0.58 + row / rows * 0.42));
        const firstHalf = paletteAmount < 0.5;
        const colorAmount = firstHalf ? paletteAmount * 2 : (paletteAmount - 0.5) * 2;
        const from = firstHalf ? [113, 220, 232] : [163, 151, 239];
        const to = firstHalf ? [163, 151, 239] : [241, 139, 91];
        const left = values[row * columns + Math.max(0, column - 1)];
        const right = values[row * columns + Math.min(columns - 1, column + 1)];
        const above = values[Math.max(0, row - 1) * columns + column];
        const below = values[Math.min(rows - 1, row + 1) * columns + column];
        let normalX = -(right - left) * 2.7;
        let normalY = -(below - above) * 2.7;
        let normalZ = 0.82;
        const normalLength = Math.hypot(normalX, normalY, normalZ) || 1;
        normalX /= normalLength;
        normalY /= normalLength;
        normalZ /= normalLength;
        const light = Math.max(0, normalX * -0.43 + normalY * -0.48 + normalZ * 0.76);
        const brightness = 0.46 + light * 0.76;
        const highlight = smoothstep(0.5, 0.78, light);
        const offset = index * 4;
        const baseRed = from[0] + (to[0] - from[0]) * colorAmount;
        const baseGreen = from[1] + (to[1] - from[1]) * colorAmount;
        const baseBlue = from[2] + (to[2] - from[2]) * colorAmount;
        imageData.data[offset] = Math.min(255, baseRed * brightness + 245 * highlight * 0.2);
        imageData.data[offset + 1] = Math.min(255, baseGreen * brightness + 245 * highlight * 0.2);
        imageData.data[offset + 2] = Math.min(255, baseBlue * brightness + 238 * highlight * 0.2);
        const body = smoothstep(0.4, 0.82, value) * 0.34;
        const edge = Math.exp(-Math.pow((value - 0.52) / 0.07, 2)) * 0.31;
        const innerRidge = Math.exp(-Math.pow((value - 0.88) / 0.13, 2)) * 0.09;
        imageData.data[offset + 3] = Math.min(205, (body + edge + innerRidge) * 255);
      }
      fieldContext.putImageData(imageData, 0, 0);

      context.save();
      context.globalCompositeOperation = "screen";
      context.imageSmoothingEnabled = true;
      context.filter = "blur(3.5px) saturate(1.22)";
      context.drawImage(fieldCanvas, -7, -7, width + 14, height + 14);
      context.restore();

      const interpolation = (first: number, second: number, level: number) => {
        if (Math.abs(second - first) < 0.0001) return 0.5;
        return Math.max(0, Math.min(1, (level - first) / (second - first)));
      };
      const edgePoint = (
        edge: number,
        column: number,
        row: number,
        corners: [number, number, number, number],
        level: number,
      ) => {
        const x = column * stepX;
        const y = row * stepY;
        if (edge === 0) return { x: x + interpolation(corners[0], corners[1], level) * stepX, y };
        if (edge === 1) return { x: x + stepX, y: y + interpolation(corners[1], corners[2], level) * stepY };
        if (edge === 2) return { x: x + interpolation(corners[3], corners[2], level) * stepX, y: y + stepY };
        return { x, y: y + interpolation(corners[0], corners[3], level) * stepY };
      };
      const contourPairs: Record<number, number[][]> = {
        1: [[3, 0]], 2: [[0, 1]], 3: [[3, 1]], 4: [[1, 2]],
        6: [[0, 2]], 7: [[3, 2]], 8: [[2, 3]], 9: [[0, 2]],
        11: [[1, 2]], 12: [[1, 3]], 13: [[0, 1]], 14: [[3, 0]],
      };
      const contourGradient = context.createLinearGradient(width * 0.08, height * 0.2, width * 0.92, height * 0.8);
      contourGradient.addColorStop(0, "#8ce6ec");
      contourGradient.addColorStop(0.52, "#a6a7ff");
      contourGradient.addColorStop(1, "#f59a69");

      [0.44, 0.52, 0.7, 0.92, 1.16].forEach((level) => {
        context.save();
        context.beginPath();
        for (let row = 0; row < rows - 1; row += 1) {
          for (let column = 0; column < columns - 1; column += 1) {
            const corners: [number, number, number, number] = [
              values[row * columns + column],
              values[row * columns + column + 1],
              values[(row + 1) * columns + column + 1],
              values[(row + 1) * columns + column],
            ];
            const mask =
              (corners[0] >= level ? 1 : 0) |
              (corners[1] >= level ? 2 : 0) |
              (corners[2] >= level ? 4 : 0) |
              (corners[3] >= level ? 8 : 0);
            if (mask === 0 || mask === 15) continue;
            const centerAbove = (corners[0] + corners[1] + corners[2] + corners[3]) / 4 >= level;
            const pairs = mask === 5
              ? (centerAbove ? [[3, 2], [0, 1]] : [[3, 0], [2, 1]])
              : mask === 10
                ? (centerAbove ? [[3, 0], [2, 1]] : [[3, 2], [0, 1]])
                : contourPairs[mask] ?? [];
            pairs.forEach(([firstEdge, secondEdge]) => {
              const first = edgePoint(firstEdge, column, row, corners, level);
              const second = edgePoint(secondEdge, column, row, corners, level);
              context.moveTo(first.x, first.y);
              context.lineTo(second.x, second.y);
            });
          }
        }
        context.strokeStyle = level === 0.52 ? "rgba(247,244,233,.9)" : contourGradient;
        context.globalAlpha = level === 0.52 ? 0.62 : 0.14;
        context.lineWidth = level === 0.52 ? 1.15 : 0.48;
        context.stroke();
        context.restore();
      });

      const sampleField = (x: number, y: number) => {
        const gridX = Math.max(0, Math.min(columns - 1.001, x / stepX));
        const gridY = Math.max(0, Math.min(rows - 1.001, y / stepY));
        const column = Math.floor(gridX);
        const row = Math.floor(gridY);
        const amountX = gridX - column;
        const amountY = gridY - row;
        const top = values[row * columns + column] * (1 - amountX) + values[row * columns + column + 1] * amountX;
        const bottom = values[(row + 1) * columns + column] * (1 - amountX) + values[(row + 1) * columns + column + 1] * amountX;
        return top * (1 - amountY) + bottom * amountY;
      };
      const gradientAt = (point: Point) => {
        const epsilon = cell * 1.15;
        return {
          x: sampleField(point.x + epsilon, point.y) - sampleField(point.x - epsilon, point.y),
          y: sampleField(point.x, point.y + epsilon) - sampleField(point.x, point.y - epsilon),
        };
      };
      const seeds: Point[] = [];
      const columnStride = Math.max(7, Math.floor(columns / 15));
      const rowStride = Math.max(6, Math.floor(rows / 11));
      for (let row = Math.floor(rowStride / 2); row < rows - 1; row += rowStride) {
        for (let column = Math.floor(columnStride / 2); column < columns - 1; column += columnStride) {
          const value = values[row * columns + column];
          if (value > 0.47 && value < 1.18 && (row + column) % 3 !== 0) {
            seeds.push({ x: column * stepX, y: row * stepY });
          }
        }
      }

      context.save();
      context.globalCompositeOperation = "screen";
      context.strokeStyle = contourGradient;
      context.globalAlpha = 0.135;
      context.lineWidth = 0.42;
      seeds.slice(0, 62).forEach((seed, seedIndex) => {
        const trace = (direction: number) => {
          const points: Point[] = [];
          let point = { ...seed };
          for (let step = 0; step < 32; step += 1) {
            const gradient = gradientAt(point);
            const magnitude = Math.hypot(gradient.x, gradient.y);
            if (magnitude < 0.002) break;
            const normalX = gradient.x / magnitude;
            const normalY = gradient.y / magnitude;
            const curl = Math.sin(seedIndex * 0.73 + step * 0.19 + time * 0.00008) * 0.16;
            point = {
              x: point.x + (normalX * direction - normalY * curl) * cell * 0.82,
              y: point.y + (normalY * direction + normalX * curl) * cell * 0.82,
            };
            if (point.x < 0 || point.x > width || point.y < 0 || point.y > height || sampleField(point.x, point.y) < 0.38) break;
            points.push(point);
          }
          return points;
        };
        const path = [...trace(-1).reverse(), seed, ...trace(1)];
        if (path.length < 4) return;
        context.beginPath();
        context.moveTo(path[0].x, path[0].y);
        path.slice(1).forEach((point) => context.lineTo(point.x, point.y));
        context.stroke();
      });
      context.restore();
    };

    const draw = (time: number) => {
      if (!reduceMotion && time - lastFrame < 34) {
        animation = requestAnimationFrame(draw);
        return;
      }
      lastFrame = time;
      context.clearRect(0, 0, width, height);

      drawTopology(time);

      projectConnections.forEach((connection, index) => {
        if (!visible(connection.from) || !visible(connection.to)) return;
        const isActive = connection.from === activeSlug || connection.to === activeSlug;
        if (selectedOnly && !isActive) return;

        const start = pointFor(connection.from);
        const end = pointFor(connection.to);
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const length = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
        const bend = ((index % 5) - 2) * 18 + (isActive ? 12 : 0);
        const control = {
          x: (start.x + end.x) / 2 - (dy / length) * bend,
          y: (start.y + end.y) / 2 + (dx / length) * bend,
        };

        context.save();
        const bundleGradient = context.createLinearGradient(start.x, start.y, end.x, end.y);
        bundleGradient.addColorStop(0, relationColor[connection.kind]);
        bundleGradient.addColorStop(0.5, "#f5f1e8");
        bundleGradient.addColorStop(1, relationColor[connection.kind]);
        for (let strand = -4; strand <= 4; strand += 1) {
          const strandBend = bend + strand * (5 + Math.min(7, length * 0.006));
          const strandControl = {
            x: (start.x + end.x) / 2 - (dy / length) * strandBend,
            y: (start.y + end.y) / 2 + (dx / length) * strandBend,
          };
          context.beginPath();
          context.moveTo(start.x, start.y);
          context.quadraticCurveTo(strandControl.x, strandControl.y, end.x, end.y);
          context.strokeStyle = bundleGradient;
          context.globalAlpha = isActive ? 0.15 : 0.058;
          context.lineWidth = 0.42;
          context.stroke();
        }
        context.restore();

        context.save();
        context.strokeStyle = relationColor[connection.kind];
        context.globalAlpha = isActive ? 0.7 : 0.14;
        context.lineWidth = isActive ? 1.35 : 0.65;
        if (connection.kind === "constraint") context.setLineDash([3, 6]);
        if (connection.kind === "handoff") context.setLineDash([12, 5]);
        context.beginPath();
        context.moveTo(start.x, start.y);
        context.quadraticCurveTo(control.x, control.y, end.x, end.y);
        context.stroke();
        context.restore();

        const speed = 0.000035 + (index % 4) * 0.000007;
        const phase = (time * speed + index * 0.17) % 1;
        const oneMinus = 1 - phase;
        const px = oneMinus * oneMinus * start.x + 2 * oneMinus * phase * control.x + phase * phase * end.x;
        const py = oneMinus * oneMinus * start.y + 2 * oneMinus * phase * control.y + phase * phase * end.y;
        context.save();
        context.fillStyle = relationColor[connection.kind];
        context.globalAlpha = isActive ? 0.95 : 0.26;
        context.shadowColor = relationColor[connection.kind];
        context.shadowBlur = isActive ? 12 : 4;
        context.beginPath();
        context.arc(px, py, isActive ? 2.4 : 1.25, 0, Math.PI * 2);
        context.fill();
        context.restore();
      });

      if (!reduceMotion) animation = requestAnimationFrame(draw);
    };

    resize();
    const updatePointer = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      const inside = event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
      pointer = inside ? { x: event.clientX - bounds.left, y: event.clientY - bounds.top } : null;
    };
    const clearPointer = () => { pointer = null; };
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", updatePointer, { passive: true });
    window.addEventListener("blur", clearPointer);
    if (reduceMotion) draw(0);
    else animation = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animation);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", updatePointer);
      window.removeEventListener("blur", clearPointer);
    };
  }, [activeSlug, category, selectedOnly]);

  return <canvas ref={canvasRef} aria-hidden="true" className="relationship-lines" />;
}

export function Constellation() {
  const [category, setCategory] = useState<"All" | Category>("All");
  const [activeSlug, setActiveSlug] = useState("vanderbilt-passage");
  const [selectedOnly, setSelectedOnly] = useState(false);
  const active = useMemo(
    () => projects.find((project) => project.slug === activeSlug) ?? projects[0],
    [activeSlug],
  );
  const activeConnections = useMemo(
    () =>
      projectConnections
        .filter((connection) => connection.from === activeSlug || connection.to === activeSlug)
        .map((connection) => ({
          ...connection,
          neighbor: projects.find(
            (project) =>
              project.slug === (connection.from === activeSlug ? connection.to : connection.from),
          ),
        })),
    [activeSlug],
  );

  return (
    <section className="constellation" id="constellation" aria-labelledby="constellation-title">
      <div className="constellation-copy">
        <p className="kicker kicker--light">An explorable practice / 14 projects / 20 explicit links</p>
        <h1 id="constellation-title">Nothing here is ever finished.</h1>
        <p>
          Select a node to see the working lineage: shared methods, difficult handoffs,
          bounded authority, and constraints that migrate from one medium to another.
        </p>
      </div>

      <div className="constellation-controls" aria-label="Relationship display">
        <button className={selectedOnly ? "" : "is-active"} onClick={() => setSelectedOnly(false)} type="button">
          All relations
        </button>
        <button className={selectedOnly ? "is-active" : ""} onClick={() => setSelectedOnly(true)} type="button">
          Selected web
        </button>
      </div>

      <div className="constellation-filters" role="group" aria-label="Filter projects">
        {categories.map((item) => (
          <button
            className={category === item ? "is-active" : ""}
            key={item}
            onClick={() => setCategory(item)}
            type="button"
          >
            {item}
          </button>
        ))}
      </div>

      <div className="relationship-legend" aria-label="Connection types">
        {(Object.keys(relationColor) as ConnectionKind[]).map((kind) => (
          <span key={kind} style={{ "--legend": relationColor[kind] } as CSSProperties}>
            {kind}
          </span>
        ))}
      </div>

      <div className="surface-index" aria-hidden="true">
        <span>Implicit surface / live project topology</span>
        <span>14 attractors · 20 constraints · 5 relation types</span>
      </div>

      <div className="axis axis--horizontal" aria-hidden="true"><span>Storytelling</span><span>Computation</span></div>
      <div className="axis axis--vertical" aria-hidden="true"><span>Atmosphere</span><span>Architecture</span></div>

      <RelationshipLines activeSlug={activeSlug} category={category} selectedOnly={selectedOnly} />

      <div className="node-field">
        {projects.map((project, index) => {
          const visible = category === "All" || project.categories.includes(category);
          const activeNode = project.slug === active.slug;
          const relationCount = projectConnections.filter(
            (connection) => connection.from === project.slug || connection.to === project.slug,
          ).length;
          return (
            <button
              aria-label={`Preview ${project.title}; ${relationCount} documented connections`}
              className={`project-node ${visible ? "" : "is-muted"} ${activeNode ? "is-active" : ""}`}
              key={project.slug}
              onClick={() => setActiveSlug(project.slug)}
              onFocus={() => setActiveSlug(project.slug)}
              style={{
                left: `${project.node.x}%`,
                top: `${project.node.y}%`,
                width: project.node.size,
                height: project.node.size,
                animationDelay: `${index * -0.42}s`,
                "--node-order": index,
              } as CSSProperties}
              type="button"
            >
              <span className="project-node__index">{String(index + 1).padStart(2, "0")}</span>
              <span className="project-node__name">{project.title}</span>
              <span className="project-node__count">{relationCount}</span>
            </button>
          );
        })}
      </div>

      <aside className="constellation-card" aria-live="polite">
        <div className="constellation-card__top">
          <div className="constellation-card__image"><img src={active.image} alt="" /></div>
          <div>
            <p className="micro">{active.eyebrow} · {active.year}</p>
            <h2>{active.title}</h2>
            <p>{active.question}</p>
          </div>
        </div>
        <div className="constellation-relations">
          <p className="micro">Why this node connects</p>
          {activeConnections.slice(0, 4).map((connection) => (
            <button
              key={`${connection.from}-${connection.to}`}
              onClick={() => connection.neighbor && setActiveSlug(connection.neighbor.slug)}
              type="button"
            >
              <i style={{ background: relationColor[connection.kind] }} />
              <span>
                <strong>{connection.neighbor?.title}</strong>
                <small>{connection.reason}</small>
              </span>
            </button>
          ))}
        </div>
        <div className="tag-row">{active.categories.map((tag) => <span key={tag}>{tag}</span>)}</div>
        <a href={`/work/${active.slug}`}>Open case study <span>↗</span></a>
      </aside>

      <p className="constellation-scroll">Move by relationship, filter by lens, or follow the straight sequence below ↓</p>
    </section>
  );
}
