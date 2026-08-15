"use client";

import { useMemo, useState } from "react";
import { categories, projects, type Category } from "../data";

const connections = [
  { left: 18, top: 71, width: 18, rotate: -24 },
  { left: 25, top: 53, width: 19, rotate: -40 },
  { left: 35, top: 40, width: 26, rotate: -5 },
  { left: 51, top: 65, width: 22, rotate: -40 },
  { left: 63, top: 52, width: 19, rotate: 10 },
  { left: 70, top: 35, width: 17, rotate: -35 },
  { left: 72, top: 16, width: 16, rotate: -5 },
  { left: 77, top: 27, width: 14, rotate: 40 },
  { left: 59, top: 22, width: 20, rotate: -8 },
  { left: 35, top: 63, width: 28, rotate: -58 },
  { left: 18, top: 38, width: 20, rotate: 24 },
];

export function Constellation() {
  const [category, setCategory] = useState<"All" | Category>("All");
  const [activeSlug, setActiveSlug] = useState("vanderbilt-passage");
  const [quiet, setQuiet] = useState(false);
  const active = useMemo(() => projects.find((project) => project.slug === activeSlug) ?? projects[0], [activeSlug]);

  return (
    <section className={`constellation ${quiet ? "constellation--quiet" : ""}`} id="constellation" aria-labelledby="constellation-title">
      <div className="constellation-copy">
        <p className="kicker kicker--light">An explorable practice</p>
        <h1 id="constellation-title">Nothing here is ever finished.</h1>
        <p>
          I make places, stories, and systems—usually where the handoff between them is the interesting part.
        </p>
      </div>

      <div className="constellation-controls" aria-label="Project map filters">
        <button className={quiet ? "" : "is-active"} onClick={() => setQuiet(false)} type="button">Constellation</button>
        <button className={quiet ? "is-active" : ""} onClick={() => setQuiet(true)} type="button">Quiet</button>
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

      <div className="axis axis--horizontal" aria-hidden="true"><span>Storytelling</span><span>Computation</span></div>
      <div className="axis axis--vertical" aria-hidden="true"><span>Atmosphere</span><span>Architecture</span></div>

      <div className="connection-field" aria-hidden="true">
        {connections.map((connection, index) => (
          <i
            key={index}
            style={{
              left: `${connection.left}%`,
              top: `${connection.top}%`,
              width: `${connection.width}%`,
              transform: `rotate(${connection.rotate}deg)`,
            }}
          />
        ))}
      </div>

      <div className="node-field">
        {projects.map((project, index) => {
          const visible = category === "All" || project.categories.includes(category);
          const activeNode = project.slug === active.slug;
          return (
            <button
              aria-label={`Preview ${project.title}`}
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
              }}
              type="button"
            >
              <span>{project.title}</span>
            </button>
          );
        })}
      </div>

      <aside className="constellation-card" aria-live="polite">
        <div className="constellation-card__image"><img src={active.image} alt="" /></div>
        <p className="micro">{active.eyebrow} · {active.year}</p>
        <h2>{active.title}</h2>
        <p>{active.question}</p>
        <div className="tag-row">{active.categories.map((tag) => <span key={tag}>{tag}</span>)}</div>
        <a href={`/work/${active.slug}`}>Enter project <span>↗</span></a>
      </aside>

      <a className="constellation-scroll" href="#selected-work">Scroll for the curated sequence ↓</a>
    </section>
  );
}

