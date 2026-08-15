import { SiteHeader } from "../../components/SiteHeader";
import { getProject, projects } from "../../data";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug) ?? projects[0];
  const current = projects.findIndex((item) => item.slug === project.slug);
  const next = projects[(current + 1) % projects.length];

  return (
    <main>
      <SiteHeader />
      <article className="project-page">
        <header className="project-hero">
          <div className="project-hero__copy">
            <p className="kicker">{project.eyebrow} · {project.year}</p>
            <h1>{project.title}</h1>
            <p className="project-hero__question">{project.question}</p>
            <p>{project.summary}</p>
          </div>
          <div className="project-hero__image"><img src={project.image} alt="" /></div>
        </header>

        <section className="project-facts">
          <div><p className="micro">Role</p><p>{project.role}</p></div>
          <div><p className="micro">Outcome</p><p>{project.outcome}</p></div>
          <div><p className="micro">Lenses</p><p>{project.categories.join(" · ")}</p></div>
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

        <section className="project-image-break"><img src={project.image} alt="" /></section>

        <nav className="next-project" aria-label="Next project">
          <p className="micro">Next node</p>
          <a href={`/work/${next.slug}`}>{next.title} <span>↗</span></a>
          <p>{next.question}</p>
        </nav>
      </article>
    </main>
  );
}

