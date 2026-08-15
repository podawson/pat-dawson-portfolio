import Link from "next/link";
import { ProjectGrid } from "../components/ProjectGrid";
import { SiteHeader } from "../components/SiteHeader";

export default function WorkPage() {
  return (
    <main>
      <SiteHeader />
      <section className="page-intro">
        <p className="kicker">Work / archive</p>
        <h1>Places, stories,<br />systems, sometimes a mess.</h1>
        <p className="page-intro__lede">Filter by the kind of work you need to understand. Projects can—and usually do—belong to more than one category.</p>
      </section>
      <section className="work-index" aria-label="Project archive">
        <ProjectGrid />
      </section>
      <footer className="site-footer site-footer--light"><Link href="/">← Back to the constellation</Link><a href="mailto:patrickdawsono@gmail.com">Say hello ↗</a></footer>
    </main>
  );
}
