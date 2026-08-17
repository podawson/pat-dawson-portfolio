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

    let animation = 0;
    let width = 0;
    let height = 0;
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

    const traceSmooth = (points: Point[], move = true) => {
      if (points.length < 2) return;
      if (move) context.moveTo(points[0].x, points[0].y);
      for (let index = 1; index < points.length - 1; index += 1) {
        const midpoint = {
          x: (points[index].x + points[index + 1].x) / 2,
          y: (points[index].y + points[index + 1].y) / 2,
        };
        context.quadraticCurveTo(points[index].x, points[index].y, midpoint.x, midpoint.y);
      }
      const last = points[points.length - 1];
      context.lineTo(last.x, last.y);
    };

    const drawWarpedLattice = (time: number) => {
      const anchors = projects.filter((project) => visible(project.slug)).map((project) => pointFor(project.slug));
      const phase = time * 0.00008;

      context.save();
      context.lineWidth = 0.45;
      context.strokeStyle = "rgba(210,236,238,.055)";

      for (let row = 0; row <= 12; row += 1) {
        const baseY = (row / 12) * height;
        context.beginPath();
        for (let column = 0; column <= 30; column += 1) {
          const x = (column / 30) * width;
          let warp = 0;
          anchors.forEach((anchor, index) => {
            const distance = (x - anchor.x) / Math.max(width * 0.13, 1);
            const influence = Math.exp(-(distance * distance));
            warp += Math.sin(row * 0.62 + index * 0.91 + phase) * influence * (7 + (index % 4) * 2.5);
          });
          const y = baseY + warp;
          if (column === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.stroke();
      }

      context.strokeStyle = "rgba(166,167,255,.042)";
      for (let column = 0; column <= 18; column += 1) {
        const baseX = (column / 18) * width;
        context.beginPath();
        for (let row = 0; row <= 24; row += 1) {
          const y = (row / 24) * height;
          let warp = 0;
          anchors.forEach((anchor, index) => {
            const distance = (y - anchor.y) / Math.max(height * 0.16, 1);
            const influence = Math.exp(-(distance * distance));
            warp += Math.cos(column * 0.47 + index * 0.72 - phase) * influence * (5 + (index % 3) * 2);
          });
          const x = baseX + warp;
          if (row === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.stroke();
      }
      context.restore();
    };

    const drawMembrane = (
      slugs: string[],
      colors: [string, string],
      time: number,
      membraneIndex: number,
    ) => {
      const points = slugs.filter(visible).map(pointFor);
      if (points.length < 3) return;
      const phase = time * 0.00011 + membraneIndex * 1.7;
      const gradient = context.createLinearGradient(points[0].x, points[0].y, points[points.length - 1].x, points[points.length - 1].y);
      gradient.addColorStop(0, colors[0]);
      gradient.addColorStop(1, colors[1]);

      const outer = 34 + membraneIndex * 3;
      const upper = points.map((point, index) => ({
        x: point.x + Math.cos(phase + index * 1.1) * 5,
        y: point.y - outer + Math.sin(phase + index * 0.8) * 9,
      }));
      const lower = [...points].reverse().map((point, index) => ({
        x: point.x + Math.sin(phase + index * 0.9) * 5,
        y: point.y + outer + Math.cos(phase + index * 0.75) * 9,
      }));

      context.save();
      context.beginPath();
      traceSmooth(upper);
      context.lineTo(lower[0].x, lower[0].y);
      traceSmooth(lower, false);
      context.closePath();
      context.fillStyle = gradient;
      context.globalAlpha = 0.045;
      context.fill();

      for (let contour = -7; contour <= 7; contour += 1) {
        const offset = contour * 6;
        const contourPoints = points.map((point, index) => ({
          x: point.x + Math.cos(index * 0.86 + phase) * Math.abs(contour) * 0.75,
          y: point.y + offset + Math.sin(index * 1.16 - phase) * (8 + Math.abs(contour) * 0.85),
        }));
        context.beginPath();
        traceSmooth(contourPoints);
        context.strokeStyle = gradient;
        context.globalAlpha = contour === 0 ? 0.28 : 0.105;
        context.lineWidth = contour === 0 ? 0.9 : 0.48;
        context.stroke();
      }

      points.forEach((point, index) => {
        const ribHeight = outer + Math.sin(phase + index) * 8;
        context.beginPath();
        context.moveTo(point.x - 2, point.y - ribHeight);
        context.quadraticCurveTo(point.x + Math.sin(phase + index) * 8, point.y, point.x + 2, point.y + ribHeight);
        context.strokeStyle = gradient;
        context.globalAlpha = 0.09;
        context.lineWidth = 0.45;
        context.stroke();
      });
      context.restore();
    };

    const drawAnchorWells = (time: number) => {
      projects.forEach((project, index) => {
        if (!visible(project.slug)) return;
        const point = pointFor(project.slug);
        const degree = projectConnections.filter(
          (connection) => connection.from === project.slug || connection.to === project.slug,
        ).length;
        if (degree < 2 && project.slug !== activeSlug) return;
        context.save();
        context.translate(point.x, point.y);
        context.rotate(index * 0.37 + time * 0.000018);
        for (let ring = 1; ring <= Math.min(6, degree + 2); ring += 1) {
          context.beginPath();
          context.ellipse(0, 0, 12 + ring * 9, 5 + ring * 4.5, ring * 0.18, 0, Math.PI * 2);
          context.strokeStyle = relationColor[projectConnections.find(
            (connection) => connection.from === project.slug || connection.to === project.slug,
          )?.kind ?? "method"];
          context.globalAlpha = project.slug === activeSlug ? 0.16 - ring * 0.012 : 0.052;
          context.lineWidth = 0.45;
          context.stroke();
        }
        context.restore();
      });
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);

      drawWarpedLattice(time);
      drawMembrane(
        ["flower-tower", "ouellette-bridge", "caleta", "vanderbilt-passage", "string", "aintivirus"],
        ["#72d9e8", "#a6a7ff"],
        time,
        0,
      );
      drawMembrane(
        ["charlesgate-park", "88-east-broadway", "wework-conversions", "intuit-astor-place", "mapping-investments"],
        ["#f58a61", "#e09ac6"],
        time,
        1,
      );
      drawMembrane(
        ["caleta", "gymnast-cobot", "release-intelligence", "gleanings", "string"],
        ["#a6a7ff", "#72d9e8"],
        time,
        2,
      );
      drawAnchorWells(time);

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
    window.addEventListener("resize", resize);
    if (reduceMotion) draw(0);
    else animation = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animation);
      window.removeEventListener("resize", resize);
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
        <span>Relational surface / project topology</span>
        <span>14 anchors · 20 edges · 5 relation types</span>
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
