import Link from "next/link";
import { Constellation } from "./components/Constellation";
import { SiteHeader } from "./components/SiteHeader";
import { featuredProjects } from "./data";

export default function Home() {
  return (
    <main>
      <SiteHeader inverse />
      <Constellation />

      <section className="selected-work" id="selected-work" aria-labelledby="selected-title">
        <div className="section-heading">
          <p className="kicker">Curated sequence</p>
          <h2 id="selected-title">From existing conditions<br />to working systems.</h2>
          <p>This is the straight path through the work. The constellation above is the scenic route.</p>
        </div>
        <div className="selected-list">
          {featuredProjects.map((project, index) => (
            <article className="selected-project" key={project.slug}>
              <a className="selected-project__image" href={`/work/${project.slug}`}>
                <img src={project.image} alt="" />
                <span className="selected-project__index">{String(index + 1).padStart(2, "0")}</span>
              </a>
              <div className="selected-project__copy">
                <p className="micro">{project.eyebrow} · {project.year}</p>
                <h3><a href={`/work/${project.slug}`}>{project.title}</a></h3>
                <p className="question">{project.question}</p>
                <p>{project.summary}</p>
                <a className="text-link" href={`/work/${project.slug}`}>View the case study ↗</a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="archive-cta">
        <p className="kicker kicker--light">The archive is wider than the shortlist</p>
        <h2>Every project is a node.<br />Every node has neighbors.</h2>
        <div>
          <Link href="/work">Browse all work ↗</Link>
          <Link href="/playground">Open the playground ↗</Link>
        </div>
      </section>

      <footer className="site-footer">
        <p>Patrick Dawson · New York · 2026</p>
        <a href="mailto:patrickdawsono@gmail.com">patrickdawsono@gmail.com</a>
        <p>Still changing shape.</p>
      </footer>
    </main>
  );
}
