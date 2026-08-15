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

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);

      context.save();
      context.strokeStyle = "rgba(230,242,240,.035)";
      context.lineWidth = 0.6;
      for (let x = 0; x < width; x += 72) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, height);
        context.stroke();
      }
      for (let y = 0; y < height; y += 72) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(width, y);
        context.stroke();
      }
      context.restore();

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

      animation = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    animation = requestAnimationFrame(draw);

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
