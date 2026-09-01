import { ProjectGrid } from "../components/ProjectGrid";
import { SiteHeader } from "../components/SiteHeader";

export default function WorkPage() {
  return (
    <main className="work-page work-page--dark">
      <SiteHeader inverse />
      <section className="page-intro page-intro--work route-intro">
        <h1>Selected curation</h1>
      </section>
      <section className="work-index" aria-label="Project Index">
        <ProjectGrid />
      </section>
    </main>
  );
}
