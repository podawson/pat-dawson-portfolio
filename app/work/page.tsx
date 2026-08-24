import { ProjectGrid } from "../components/ProjectGrid";
import { SiteHeader } from "../components/SiteHeader";

export default function WorkPage() {
  return (
    <main className="work-page work-page--dark">
      <SiteHeader inverse />
      <section className="page-intro page-intro--work route-intro">
        <p className="kicker">WORK</p>
        <h1>Fourteen projects.<br />Many ways through.</h1>
        <p className="page-intro__lede">Use the lenses to follow a discipline, or move by adjacency. Hover, focus, or use the arrow keys to preview the work without leaving the Index.</p>
      </section>
      <section className="work-index" aria-label="Project Index">
        <ProjectGrid />
      </section>
      <footer className="site-footer"><a href="/#map">← Back to the Corpus</a><a href="mailto:patrickdawsono@gmail.com">patrickdawsono@gmail.com</a></footer>
    </main>
  );
}
