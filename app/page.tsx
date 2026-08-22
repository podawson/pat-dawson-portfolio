import Link from "next/link";
import { Constellation } from "./components/Constellation";
import { SiteHeader } from "./components/SiteHeader";
import { featuredProjects } from "./data";

export default function Home() {
  return (
    <main className="home-page">
      <SiteHeader inverse />
      <Constellation />

      <section className="selected-work" id="selected-work" aria-labelledby="selected-title">
        <div className="section-heading">
          <p className="kicker">Selected work</p>
          <h2 id="selected-title">From existing conditions<br />to working systems.</h2>
          <p>This is the straight path through the work. The Map above is the scenic route.</p>
        </div>
        <div className="selected-list">
          {featuredProjects.map((project, index) => (
            <article className="selected-project" key={project.slug}>
              <Link className="selected-project__image" href={`/work/${project.slug}`}>
                <img src={project.image} alt="" />
                <span className="selected-project__index">{String(index + 1).padStart(2, "0")}</span>
              </Link>
              <div className="selected-project__copy">
                <p className="micro">{project.eyebrow} · {project.year}</p>
                <h3><Link href={`/work/${project.slug}`}>{project.title}</Link></h3>
                <p>{project.summary}</p>
                <Link className="text-link" href={`/work/${project.slug}`}>View the case study ↗</Link>
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
          <Link href="/play">Open Play ↗</Link>
        </div>
      </section>

      <footer className="site-footer">
        <p>Patrick Dawson · New York · 2026</p>
        <a href="mailto:patrickdawsono@gmail.com">patrickdawsono@gmail.com</a>
        <p>Always in progress.</p>
      </footer>
    </main>
  );
}
