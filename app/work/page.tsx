import { ProjectGrid } from "../components/ProjectGrid";
import { SiteHeader } from "../components/SiteHeader";

export default function WorkPage() {
  return (
    <main>
      <SiteHeader />
      <section className="page-intro">
        <p className="kicker">Work / Index</p>
        <h1>Fourteen projects.<br />Many ways through.</h1>
        <p className="page-intro__lede">Use the lenses to follow a discipline, or move by adjacency. Hover, focus, or use the arrow keys to preview the work without leaving the Index.</p>
      </section>
      <section className="work-index" aria-label="Project Index">
        <ProjectGrid />
      </section>
      <footer className="site-footer site-footer--light"><a href="/">← Back to the Field</a><a href="mailto:patrickdawsono@gmail.com">patrickdawsono@gmail.com</a></footer>
    </main>
  );
}
