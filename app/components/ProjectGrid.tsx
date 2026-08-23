"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { categories, projects, type Category } from "../data";

export function ProjectGrid() {
  const [lens, setLens] = useState<"All" | Category>("All");
  const [activeIndex, setActiveIndex] = useState(0);
  const [connector, setConnector] = useState({ startX: 0, startY: 0, endX: 0, endY: 0, width: 1, height: 1 });
  const shellRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const cardRef = useRef<HTMLDivElement>(null);
  const active = projects[activeIndex];
  const isVisible = (index: number) => lens === "All" || projects[index].categories.includes(lens);

  useEffect(() => {
    const readLens = () => {
      const value = new URLSearchParams(window.location.search).get("lens")?.toLowerCase();
      const match = categories.find((item) => item.toLowerCase().replace(/\s+/g, "-") === value);
      const nextLens = match ?? "All";
      setLens(nextLens);
      const first = projects.findIndex((project) => nextLens === "All" || project.categories.includes(nextLens));
      if (first >= 0) setActiveIndex(first);
    };
    readLens();
    window.addEventListener("popstate", readLens);
    return () => window.removeEventListener("popstate", readLens);
  }, []);

  const selectLens = (item: "All" | Category) => {
    setLens(item);
    const first = projects.findIndex((project) => item === "All" || project.categories.includes(item));
    if (first >= 0) setActiveIndex(first);
    const query = item === "All" ? "" : `?lens=${item.toLowerCase().replace(/\s+/g, "-")}`;
    window.history.replaceState({}, "", `/work${query}`);
  };

  const measure = () => {
    const shell = shellRef.current;
    const item = itemRefs.current[activeIndex];
    const card = cardRef.current;
    if (!shell || !item || !card) return;
    const shellBounds = shell.getBoundingClientRect();
    const itemBounds = item.getBoundingClientRect();
    const cardBounds = card.getBoundingClientRect();
    setConnector({
      startX: itemBounds.right - shellBounds.left + 14,
      startY: itemBounds.top - shellBounds.top + itemBounds.height / 2,
      endX: cardBounds.left - shellBounds.left - 14,
      endY: cardBounds.top - shellBounds.top + cardBounds.height * 0.36,
      width: shellBounds.width,
      height: shellBounds.height,
    });
  };

  useLayoutEffect(measure, [activeIndex, lens]);
  useEffect(() => {
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  });

  const move = (direction: number) => {
    let next = activeIndex;
    for (let attempt = 0; attempt < projects.length; attempt += 1) {
      next = (next + direction + projects.length) % projects.length;
      if (isVisible(next)) {
        setActiveIndex(next);
        itemRefs.current[next]?.focus();
        return;
      }
    }
  };

  return (
    <div
      className="index-shell"
      ref={shellRef}
    >
      <div className="index-lenses" role="group" aria-label="Lenses">
        <span>Lenses</span>
        {categories.map((item) => (
          <button className={lens === item ? "is-active" : ""} key={item} onClick={() => selectLens(item)} type="button">
            {item}<sup>{item === "All" ? projects.length : projects.filter((project) => project.categories.includes(item)).length}</sup>
          </button>
        ))}
      </div>

      <svg className="index-connector" width={connector.width} height={connector.height} aria-hidden="true">
        <path
          pathLength="1"
          d={`M ${connector.startX} ${connector.startY} C ${connector.startX + 100} ${connector.startY}, ${connector.endX - 130} ${connector.endY}, ${connector.endX} ${connector.endY}`}
        />
      </svg>

      <ol className="index-list" aria-label="Project Index">
        {projects.map((project, index) => isVisible(index) ? (
          <li className={index === activeIndex ? "is-active" : ""} key={project.slug}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <a
              href={`/work/${project.slug}`}
              ref={(element) => { itemRefs.current[index] = element; }}
              onFocus={() => isVisible(index) && setActiveIndex(index)}
              onMouseEnter={() => isVisible(index) && setActiveIndex(index)}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown" || event.key === "ArrowRight") { event.preventDefault(); move(1); }
                if (event.key === "ArrowUp" || event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
              }}
              onClick={(event) => {
                if (event.detail === 0) return;
                const pointerIsCoarse = window.matchMedia("(pointer: coarse)").matches;
                if (pointerIsCoarse && activeIndex !== index) {
                  event.preventDefault();
                  setActiveIndex(index);
                }
              }}
              aria-current={index === activeIndex ? "true" : undefined}
              tabIndex={isVisible(index) ? 0 : -1}
            >
              {project.title}
            </a>
            <em>{project.indexPill}</em>
          </li>
        ) : null)}
      </ol>

      <div className="index-preview-wrap">
        <article className="index-preview" ref={cardRef} key={active.slug}>
          <div><img src={active.image} alt="" /></div>
          <p className="micro">{active.eyebrow} · {active.year}</p>
          <h2>{active.title}</h2>
          <p>{active.summary} {active.details[0]?.body}</p>
          <div className="tag-row">{active.categories.map((category) => <span key={category}>{category}</span>)}</div>
          <a href={`/work/${active.slug}`}>Open project ↗</a>
        </article>
      </div>
    </div>
  );
}
