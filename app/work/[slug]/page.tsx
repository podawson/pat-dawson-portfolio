import { SiteHeader } from "../../components/SiteHeader";
import { getProject, projects } from "../../data";
import { redirect } from "next/navigation";
import type { CSSProperties } from "react";

const projectAccents: Record<string, string> = {
  "charlesgate-park": "#8fc49a",
  "88-east-broadway": "#62c7c7",
  "ouellette-bridge": "#dfa45f",
  "flower-tower": "#d884ad",
  caleta: "#ef6757",
  "wework-conversions": "#79b8a5",
  "confidential-client": "#6ebee8",
  "vanderbilt-passage": "#d5b46e",
  "gymnast-cobot": "#dfc959",
  "civic-investment-map": "#ed8b5d",
  "release-intelligence": "#ef935c",
  gleanings: "#a58bd4",
  string: "#9dd6dc",
  aintivirus: "#7185ff",
};

export function generateStaticParams() {
  return [...projects.map((project) => ({ slug: project.slug })), { slug: "intuit-astor-place" }];
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug === "intuit-astor-place") redirect("/work/confidential-client");
  const project = getProject(slug) ?? projects[0];
  const current = projects.findIndex((item) => item.slug === project.slug);
  const next = projects[(current + 1) % projects.length];
  const isSystemDiagram = project.slug === "release-intelligence" || project.slug === "gleanings";

  return (
    <main className="project-page-shell" style={{ "--project-accent": projectAccents[project.slug] ?? "#72d9e8" } as CSSProperties}>
      <SiteHeader inverse />
      <article className="project-page">
        <header className="project-hero">
          <div className="project-hero__copy">
            <p className="kicker">{project.eyebrow} · {project.year}</p>
            <h1>{project.title}</h1>
            <p className="project-hero__headline">{project.headline}</p>
            <p className="project-hero__summary">{project.summary}</p>
            <div className="tag-row project-hero__tags" aria-label="Project categories">
              {project.categories.map((category) => <span key={category}>{category}</span>)}
            </div>
          </div>
          <div className={`project-hero__image${isSystemDiagram ? " project-hero__image--diagram" : ""}`}><img src={project.image} alt="" /></div>
        </header>

        <section className="project-facts">
          <div><p className="micro">Role</p><p>{project.role}</p></div>
          <div><p className="micro">Outcome</p><p>{project.outcome}</p></div>
        </section>

        <section className="project-narrative">
          <div className="project-narrative__title">
            <p className="kicker">The operating story</p>
            <h2>What the system held,<br />and what it left human.</h2>
          </div>
          <div className="project-narrative__body">
            <p>{project.narrative}</p>
            <aside>
              <p className="micro">Where authorship stays human</p>
              <p>{project.agency}</p>
            </aside>
          </div>
        </section>

        <section className="project-evidence" aria-label="Evidence and recommended artifacts">
          <div>
            <p className="kicker">By the numbers</p>
            <ul>{project.metrics.map((metric) => <li key={metric}>{metric}</li>)}</ul>
          </div>
          <div>
            <p className="kicker">Artifacts that carry the case</p>
            <ol>{project.artifacts.map((artifact) => <li key={artifact}>{artifact}</li>)}</ol>
          </div>
        </section>

        <section className="project-details">
          {project.details.map((detail, index) => (
            <article key={detail.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h2>{detail.title}</h2>
              <p>{detail.body}</p>
            </article>
          ))}
        </section>

        <section className={`project-image-break${isSystemDiagram ? " project-image-break--diagram" : ""}`}><img src={project.artifactImage ?? project.image} alt="" /></section>

        <nav className="next-project" aria-label="Next project">
          <a href={`/work/${next.slug}`}>{next.title} <span>↗</span></a>
          <p>{next.question}</p>
        </nav>
      </article>
    </main>
  );
}
