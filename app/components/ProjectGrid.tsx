"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { categories, projects, type Category } from "../data";

export function ProjectGrid() {
  const [filter, setFilter] = useState<"All" | Category>("All");
  const [activeIndex, setActiveIndex] = useState(0);
  const [connector, setConnector] = useState({ startX: 0, startY: 0, endX: 0, endY: 0, width: 1, height: 1 });
  const shellRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const cardRef = useRef<HTMLDivElement>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const active = projects[activeIndex];
  const isVisible = (index: number) => filter === "All" || projects[index].categories.includes(filter);

  useEffect(() => {
    const readFilter = () => {
      const parameters = new URLSearchParams(window.location.search);
      const rawValue = parameters.get("filter")?.toLowerCase();
      const value = rawValue === "ai-systems" ? "systems" : rawValue;
      const match = categories.find((item) => item.toLowerCase().replace(/\s+/g, "-") === value);
      const nextFilter = match ?? "All";
      setFilter(nextFilter);
      const first = projects.findIndex((project) => nextFilter === "All" || project.categories.includes(nextFilter));
      if (first >= 0) setActiveIndex(first);
    };
    readFilter();
    window.addEventListener("popstate", readFilter);
    return () => window.removeEventListener("popstate", readFilter);
  }, []);

  useEffect(() => {
    projects.forEach((project) => {
      const image = new Image();
      image.src = project.image;
    });
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  const clearHoverIntent = () => {
    if (!hoverTimerRef.current) return;
    clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = null;
  };

  const queueHoverIntent = (index: number) => {
    clearHoverIntent();
    if (!isVisible(index) || index === activeIndex) return;
    hoverTimerRef.current = setTimeout(() => {
      setActiveIndex(index);
      hoverTimerRef.current = null;
    }, 28);
  };

  const selectFilter = (item: "All" | Category) => {
    setFilter(item);
    const first = projects.findIndex((project) => item === "All" || project.categories.includes(item));
    if (first >= 0) setActiveIndex(first);
    const query = item === "All" ? "" : `?filter=${item.toLowerCase().replace(/\s+/g, "-")}`;
    window.history.replaceState({}, "", `/work${query}`);
  };

  const measure = () => {
    const shell = shellRef.current;
    const item = itemRefs.current[activeIndex];
    const card = cardRef.current;
    if (!shell || !item || !card) return;
    const shellBounds = shell.getBoundingClientRect();
    const itemBounds = item.getBoundingClientRect();
    const pillBounds = item.parentElement?.querySelector("em")?.getBoundingClientRect() ?? itemBounds;
    const cardBounds = card.getBoundingClientRect();
    setConnector({
      startX: pillBounds.right - shellBounds.left,
      startY: pillBounds.top - shellBounds.top + pillBounds.height / 2,
      endX: cardBounds.left - shellBounds.left - 14,
      endY: cardBounds.top - shellBounds.top + cardBounds.height * 0.36,
      width: shellBounds.width,
      height: shellBounds.height,
    });
  };

  useLayoutEffect(measure, [activeIndex, filter]);
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
      <div className="index-filters" role="group" aria-label="Project filters">
        <span>Filter</span>
        {categories.map((item) => (
          <button className={filter === item ? "is-active" : ""} key={item} onClick={() => selectFilter(item)} type="button">
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
          <li
            className={index === activeIndex ? "is-active" : ""}
            key={project.slug}
            onPointerEnter={() => queueHoverIntent(index)}
            onPointerLeave={clearHoverIntent}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <a
              href={`/work/${project.slug}`}
              ref={(element) => { itemRefs.current[index] = element; }}
              onFocus={() => {
                clearHoverIntent();
                if (isVisible(index)) setActiveIndex(index);
              }}
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
        <article className="index-preview" ref={cardRef}>
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
