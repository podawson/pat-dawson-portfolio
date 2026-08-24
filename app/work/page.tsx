import { ProjectGrid } from "../components/ProjectGrid";
import { SiteHeader } from "../components/SiteHeader";

export default function WorkPage() {
  return (
    <main className="work-page work-page--dark">
      <SiteHeader inverse />
      <section className="page-intro page-intro--work route-intro">
        <p className="kicker">WORK</p>
        <h1>Selected Projects</h1>
        <p className="page-intro__lede">Filter or don&apos;t</p>
      </section>
      <section className="work-index" aria-label="Project Index">
        <ProjectGrid />
      </section>
    </main>
  );
}
