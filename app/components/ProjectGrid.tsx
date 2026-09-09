"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { categories, projects, type Category } from "../data";

function chronology(year: string) {
  const parts = year.match(/\d{2,4}/g) ?? [];
  const start = Number(parts[0] ?? 0);
  const endPart = parts[1];
  const end = endPart
    ? Number(endPart.length === 2 ? `${String(start).slice(0, 2)}${endPart}` : endPart)
    : start;
  return { start, end };
}

const workIndexProjects = [...projects].sort((a, b) => {
  if (a.slug === "vanderbilt-passage") return -1;
  if (b.slug === "vanderbilt-passage") return 1;
  const aYears = chronology(a.year);
  const bYears = chronology(b.year);
  return bYears.end - aYears.end || bYears.start - aYears.start;
});

export function ProjectGrid() {
  const [filter, setFilter] = useState<"All" | Category>("All");
  const [activeIndex, setActiveIndex] = useState(0);
  const [connector, setConnector] = useState({ startX: 0, startY: 0, endX: 0, endY: 0, width: 1, height: 1 });
  const shellRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const cardRef = useRef<HTMLDivElement>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const active = workIndexProjects[activeIndex];
  const activeIsDiagram = active.image.endsWith(".svg");
  const isVisible = (index: number) => filter === "All" || workIndexProjects[index].categories.includes(filter);

  useEffect(() => {
    const readFilter = () => {
      const parameters = new URLSearchParams(window.location.search);
      const rawValue = parameters.get("filter")?.toLowerCase();
      const value = rawValue === "ai-systems" ? "systems" : rawValue;
      const match = categories.find((item) => item.toLowerCase().replace(/\s+/g, "-") === value);
      const nextFilter = match ?? "All";
      setFilter(nextFilter);
      const first = workIndexProjects.findIndex((project) => nextFilter === "All" || project.categories.includes(nextFilter));
      if (first >= 0) setActiveIndex(first);
    };
    readFilter();
    window.addEventListener("popstate", readFilter);
    return () => window.removeEventListener("popstate", readFilter);
  }, []);

  useEffect(() => {
    workIndexProjects.forEach((project) => {
      const image = new Image();
      image.src = project.image;
    });
    return undefined;
  }, []);

  const selectPreview = (index: number) => {
    if (isVisible(index) && index !== activeIndex) setActiveIndex(index);
  };

  const queuePreview = (index: number) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => selectPreview(index), 90);
  };

  const cancelQueuedPreview = () => {
    if (!hoverTimerRef.current) return;
    clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = null;
  };

  useEffect(() => cancelQueuedPreview, []);

  const selectFilter = (item: "All" | Category) => {
    setFilter(item);
    const first = workIndexProjects.findIndex((project) => item === "All" || project.categories.includes(item));
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
    const cardBounds = card.getBoundingClientRect();
    setConnector({
      startX: itemBounds.right - shellBounds.left + 16,
      startY: itemBounds.top - shellBounds.top + itemBounds.height / 2,
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
    for (let attempt = 0; attempt < workIndexProjects.length; attempt += 1) {
      next = (next + direction + workIndexProjects.length) % workIndexProjects.length;
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
        {categories.map((item) => (
          <button className={`control-pill ${filter === item ? "is-active" : ""}`} key={item} onClick={() => selectFilter(item)} type="button">
            <span className="control-pill__content">{item}</span>
          </button>
        ))}
      </div>

      {connector.width > 1 && connector.height > 1 ? <svg className="index-connector" width={connector.width} height={connector.height} aria-hidden="true">
        <path
          id="index-leader-path"
          pathLength="1"
          d={`M ${connector.startX} ${connector.startY} C ${connector.startX + 100} ${connector.startY}, ${connector.endX - 130} ${connector.endY}, ${connector.endX} ${connector.endY}`}
        />
        <text className="index-connector__label" textAnchor="middle">
          <textPath href="#index-leader-path" startOffset="50%">{active.indexPill}</textPath>
        </text>
      </svg> : null}

      <ol className="index-list" aria-label="Project Index" onPointerLeave={cancelQueuedPreview}>
        {workIndexProjects.map((project, index) => isVisible(index) ? (
          <li
            className={index === activeIndex ? "is-active" : ""}
            key={project.slug}
            onPointerEnter={() => queuePreview(index)}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <a
              href={`/work/${project.slug}`}
              ref={(element) => { itemRefs.current[index] = element; }}
              onFocus={() => {
                if (isVisible(index)) setActiveIndex(index);
              }}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown" || event.key === "ArrowRight") { event.preventDefault(); move(1); }
                if (event.key === "ArrowUp" || event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
              }}
              aria-current={index === activeIndex ? "true" : undefined}
              tabIndex={isVisible(index) ? 0 : -1}
            >
              {project.title}
            </a>
          </li>
        ) : null)}
      </ol>

      <div className="index-preview-wrap">
        <article
          className={`index-preview${activeIsDiagram ? " index-preview--diagram" : ""}`}
          data-project={active.slug}
          ref={cardRef}
        >
          <div>
            <img
              key={active.slug}
              src={active.image}
              alt=""
              decoding="async"
              fetchPriority="high"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = "/corpus-icon-20260825.png";
              }}
            />
          </div>
          <h2>{active.title}</h2>
          <p>{active.summary}{active.slug === "string" ? "" : ` ${active.details[0]?.body ?? ""}`}</p>
          <a className="project-open-pill control-pill" href={`/work/${active.slug}`}><span className="control-pill__content">Open project ↗</span></a>
        </article>
      </div>
    </div>
  );
}
