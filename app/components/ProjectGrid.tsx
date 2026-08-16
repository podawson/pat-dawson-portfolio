"use client";

import { useState } from "react";
import { categories, getProjectConstellationLine, projects, type Category } from "../data";

export function ProjectGrid() {
  const [category, setCategory] = useState<"All" | Category>("All");
  const visible = category === "All" ? projects : projects.filter((project) => project.categories.includes(category));

  return (
    <>
      <div className="work-filters" role="group" aria-label="Filter the project archive">
        {categories.map((item) => (
          <button className={category === item ? "is-active" : ""} key={item} onClick={() => setCategory(item)} type="button">
            {item}<sup>{item === "All" ? projects.length : projects.filter((project) => project.categories.includes(item)).length}</sup>
          </button>
        ))}
      </div>
      <div className="work-grid">
        {visible.map((project, index) => (
          <article className="work-card" key={project.slug}>
            <a className="work-card__image" href={`/work/${project.slug}`}>
              <img src={project.image} alt="" />
              <span>{String(index + 1).padStart(2, "0")}</span>
            </a>
            <div className="work-card__body">
              <p className="micro">{project.eyebrow} · {project.year}</p>
              <h2><a href={`/work/${project.slug}`}>{project.title}</a></h2>
              <p className="question constellation-line">{getProjectConstellationLine(project.slug)}</p>
              <p>{project.summary}</p>
              <div className="tag-row">{project.categories.map((tag) => <span key={tag}>{tag}</span>)}</div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
