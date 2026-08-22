import Link from "next/link";
import { ProjectGrid } from "../components/ProjectGrid";
import { SiteHeader } from "../components/SiteHeader";

export default function WorkPage() {
  return (
    <main className="work-page work-page--dark">
      <SiteHeader inverse />
      <section className="page-intro page-intro--work">
        <p className="kicker">Work / Index</p>
        <h1>Fourteen projects.<br />Many ways through.</h1>
        <p className="page-intro__lede">Use the lenses to follow a discipline, or move by adjacency. Hover, focus, or use the arrow keys to preview the work without leaving the Index.</p>
      </section>
      <section className="work-index" aria-label="Project Index">
        <ProjectGrid />
      </section>
      <footer className="site-footer"><Link href="/">← Back to the Map</Link><a href="mailto:patrickdawsono@gmail.com">patrickdawsono@gmail.com</a></footer>
    </main>
  );
}
