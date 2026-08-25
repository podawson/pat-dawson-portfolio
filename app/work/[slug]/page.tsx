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
  "mapping-investments": "#3f7255",
  "release-intelligence": "#ef935c",
  gleanings: "#a58bd4",
  string: "#9dd6dc",
  aintivirus: "#7185ff",
  bodega: "#f2c74f",
  hyperstructures: "#ef6e45",
  "richardson-plaza": "#8fbf7b",
  quaranzine: "#ee4ec0",
};

const projectGalleries: Record<string, { src: string; caption: string }[]> = {
  "charlesgate-park": [
    { src: "/work/gallery/charlesgate-park/01.webp", caption: "Ecological repair begins with the site already there." },
    { src: "/work/gallery/charlesgate-park/02.webp", caption: "Survey, archival geometry, and the infrastructural site model." },
    { src: "/work/gallery/charlesgate-park/05.webp", caption: "The inherited landscape before intervention." },
    { src: "/work/gallery/charlesgate-park/06.webp", caption: "The same view reworked as ecological and civic repair." },
  ],
  "88-east-broadway": [
    { src: "/work/gallery/88-east-broadway/01.webp", caption: "The building beneath the Manhattan Bridge." },
    { src: "/work/gallery/88-east-broadway/02.webp", caption: "The archival floor plan used to recover the record." },
    { src: "/work/gallery/88-east-broadway/03.webp", caption: "A reuse concept organized inside the building's operating constraints." },
  ],
  "ouellette-bridge": [
    { src: "/work/gallery/ouellette-bridge/01.webp", caption: "The reversible mounting system installed on the historic truss." },
    { src: "/work/gallery/ouellette-bridge/02.webp", caption: "Fabrication details for housings that required no drilling or welding." },
    { src: "/work/gallery/ouellette-bridge/03.webp", caption: "Installed housings carried light without altering the historic truss." },
    { src: "/work/gallery/ouellette-bridge/04.webp", caption: "Construction geometry translated a singular bridge into repeatable parts." },
    { src: "/work/gallery/ouellette-bridge/05.webp", caption: "Assembly studies resolved reversible attachments before fabrication." },
  ],
  "flower-tower": [
    { src: "/work/gallery/flower-tower/08.webp", caption: "A flower and seed packet left the tower as a wearable exchange." },
    { src: "/work/gallery/flower-tower/09.webp", caption: "Visitors took from and added to the installation throughout the festival." },
    { src: "/work/gallery/flower-tower/06.webp", caption: "A detail study worked through the plant-and-poem exchange." },
    { src: "/work/gallery/flower-tower/07.webp", caption: "The assembly drawing treated disappearance as a construction requirement." },
  ],
  caleta: [
    { src: "/work/gallery/caleta/01.webp", caption: "The completed interior: black tile, custom bar, and warm light." },
    { src: "/work/gallery/caleta/02.webp", caption: "Construction, inspection, and opening assembled as one delivery record." },
    { src: "/work/gallery/caleta/03.webp", caption: "Permit-set detail linking design intent to field execution." },
    { src: "/work/gallery/caleta/04.webp", caption: "Caleta and Bad Habit at opening." },
    { src: "/work/gallery/caleta/05.webp", caption: "Red light, black tile, and mirrored surfaces carried the concept into the dining room." },
    { src: "/work/gallery/caleta/06.webp", caption: "Bad Habit extended the project from architecture into product and atmosphere." },
  ],
  "wework-conversions": [
    { src: "/work/gallery/wework-conversions/02.webp", caption: "A floor-plan analysis translated into repeatable conversion logic." },
    { src: "/work/gallery/wework-conversions/03.webp", caption: "A completed conversion using the shared playbook." },
    { src: "/work/gallery/wework-conversions/05.webp", caption: "A converted shared space operating inside one of the portfolio's inherited buildings." },
  ],
  "confidential-client": [
    { src: "/work/gallery/confidential-client/01.webp", caption: "A responsive textile threshold for an enterprise physical-AI environment." },
    { src: "/work/gallery/confidential-client/02.webp", caption: "Media, lighting, and spatial interaction resolved as one experience." },
    { src: "/work/gallery/confidential-client/03.webp", caption: "A translucent pavilion carried the interaction into the storefront." },
  ],
  "vanderbilt-passage": [
    { src: "/work/gallery/vanderbilt-passage/02.webp", caption: "Historic imagery translated into a contemporary multi-modal scene." },
    { src: "/work/gallery/vanderbilt-passage/03.webp", caption: "The real-time control surface in the installed passage." },
    { src: "/work/gallery/vanderbilt-passage/04.webp", caption: "Generative media extended across the active supertall threshold." },
    { src: "/work/gallery/vanderbilt-passage/05.webp", caption: "A completed sequence designed for movement, pause, and return." },
  ],
  "gymnast-cobot": [
    { src: "/work/gallery/gymnast-cobot/01.webp", caption: "Human-robot interaction testing in the lab." },
    { src: "/work/gallery/gymnast-cobot/02.webp", caption: "Foundational research assembled across fatigue, gesture, and safety." },
    { src: "/work/gallery/gymnast-cobot/05.webp", caption: "Full-scale testing with workers and observers." },
  ],
  "mapping-investments": [
    { src: "/work/gallery/mapping-investments/02-crop.jpg", caption: "History, ownership, investment, and impact layered in one spatial record." },
  ],
  "release-intelligence": [
    { src: "/work/gallery/release-intelligence/04.webp", caption: "The functional architecture that survived the sketching process." },
    { src: "/work/gallery/release-intelligence/02.webp", caption: "Early sketches established the source, comparison, and decision flow." },
    { src: "/work/gallery/release-intelligence/03.webp", caption: "Alternative system structures were tested before implementation." },
  ],
  gleanings: [],
  string: [
    { src: "/work/gallery/string/01.webp", caption: "Product-development volume reconstructed from eight Telegram exports." },
    { src: "/work/gallery/string/02.webp", caption: "Model snapshots compared without erasing changes in call volume or precision." },
  ],
  aintivirus: [
    { src: "/work/gallery/aintivirus/02.webp", caption: "A live JohnBot conversation grounded in the private corpus." },
    { src: "/work/gallery/aintivirus/03.webp", caption: "The character system became the project's public product surface." },
    { src: "/work/gallery/aintivirus/04.webp", caption: "A privacy-service interface extended the character into utility." },
  ],
  bodega: [
    { src: "/work/gallery/bodega/01.jpg", caption: "The Bodega activation operating on the floor at ComplexCon LA." },
    { src: "/work/gallery/bodega/02.jpg", caption: "The same corner-store identity rebuilt as a complete event footprint." },
    { src: "/work/gallery/bodega/03.jpg", caption: "An activation-wide rendering coordinated storefronts, fixtures, circulation, and venue conditions." },
    { src: "/work/gallery/bodega/04.jpg", caption: "Art Basel Miami carried the identity into a different fair-floor format." },
  ],
  hyperstructures: [
    { src: "/work/gallery/hyperstructures/01.jpg", caption: "A resolved higher-dimensional form held together across surface, structure, and mathematical trace." },
    { src: "/work/gallery/hyperstructures/02.jpg", caption: "Iteration within a named series tested the same premise at a different scale." },
    { src: "/work/gallery/hyperstructures/03.jpg", caption: "A generated geometry with no physical precedent to compare it to." },
    { src: "/work/gallery/hyperstructures/04.jpg", caption: "The pipeline's exploratory volume remained visible behind the forms selected to keep." },
  ],
  "richardson-plaza": [
    { src: "/work/gallery/richardson-plaza/01.jpg", caption: "The completed plaza in use on Northeastern's campus." },
    { src: "/work/gallery/richardson-plaza/05.jpg", caption: "Repeated components carried the coordinated drawing set into daily campus use." },
    { src: "/work/gallery/richardson-plaza/03.jpg", caption: "A modular seating study translated scattered occupation into a repeatable kit of parts." },
    { src: "/work/gallery/richardson-plaza/04.jpg", caption: "The completed stair seating gathered around the plaza's existing clock structure." },
    { src: "/work/gallery/richardson-plaza/02.jpg", caption: "The built public realm joined movable planters, new seating, and inherited campus infrastructure." },
  ],
  quaranzine: [
    { src: "/work/gallery/quaranzine/01.jpg", caption: "Quaranzine's visual language treated each edition as an event rather than an archive entry." },
    { src: "/work/gallery/quaranzine/02.jpg", caption: "One edition from the 21-issue run." },
    { src: "/work/gallery/quaranzine/03.jpg", caption: "The live series extended the same editorial scene into performance." },
    { src: "/work/gallery/quaranzine/04.jpg", caption: "Alone together became both the pandemic condition and the publishing premise." },
  ],
};

type GalleryItem = { src: string; caption: string };

function ProjectMedia({ items, label, sideBySide = false, matched = false }: { items: GalleryItem[]; label: string; sideBySide?: boolean; matched?: boolean }) {
  if (items.length === 0) return null;

  return (
    <section
      className={`project-gallery${items.length === 1 ? " project-gallery--single" : ""}${sideBySide ? " project-gallery--side-by-side" : ""}${matched ? " project-gallery--matched" : ""}`}
      aria-label={label}
    >
      {items.map((item) => (
        <figure key={item.src}>
          {matched ? (
            <div className="project-gallery__media"><img src={item.src} alt={item.caption} loading="lazy" decoding="async" /></div>
          ) : (
            <img src={item.src} alt={item.caption} loading="lazy" decoding="async" />
          )}
          <figcaption>{item.caption}</figcaption>
        </figure>
      ))}
    </section>
  );
}

function ProjectVideo({ src, poster, caption, label }: { src: string; poster: string; caption: string; label: string }) {
  return (
    <section className="project-video" aria-label={label}>
      <figure>
        <video src={src} poster={poster} controls autoPlay muted loop playsInline preload="metadata" />
        <figcaption>{caption}</figcaption>
      </figure>
    </section>
  );
}

const flowerTowerStructureMedia: GalleryItem[] = [
  { src: "/work/gallery/flower-tower/10.webp", caption: "The temporary cardboard shell held the exchange from the inside." },
  { src: "/work/gallery/flower-tower/11.webp", caption: "Flowers, poems, and seed packets accumulated across the structure." },
];

const gleaningsRisks = [
  {
    finding: "Fabrication starts before the coordinated drawing release",
    source: "Schedule + drawing revision",
    exposure: "Sequence conflict",
  },
  {
    finding: "Permit approval is absent from the critical path",
    source: "Meeting notes + schedule",
    exposure: "Approval dependency",
  },
  {
    finding: "Ceiling allowance no longer matches issued scope",
    source: "Budget + drawing revision",
    exposure: "Cost variance",
  },
];

function GleaningsArtifacts() {
  return (
    <section className="gleanings-artifacts" aria-label="Gleanings portfolio reconstruction">
      <article className="gleanings-artifact">
        <header className="gleanings-artifact__header">
          <div>
            <p>01 · Ranked register</p>
            <h3>Risk becomes an inspectable queue.</h3>
          </div>
          <p>Portfolio reconstruction from the handed-off workflow</p>
        </header>
        <div className="gleanings-risk-list">
          {gleaningsRisks.map((risk, index) => (
            <div className="gleanings-risk" key={risk.finding}>
              <span className="gleanings-risk__rank">{String(index + 1).padStart(2, "0")}</span>
              <strong>{risk.finding}</strong>
              <span>{risk.source}</span>
              <span>{risk.exposure}</span>
            </div>
          ))}
        </div>
        <div className="gleanings-artifacts__legend">
          <span>Read across</span><span>Rank impact</span><span>Keep source attached</span>
        </div>
      </article>

      <article className="gleanings-artifact">
        <header className="gleanings-artifact__header">
          <div>
            <p>02 · Evidence chain</p>
            <h3>The claim stays attached to its record.</h3>
          </div>
        </header>
        <div className="gleanings-chain">
          <div className="gleanings-chain__finding">
            <p>Finding</p>
            <strong>Fabrication starts before the coordinated drawing release</strong>
          </div>
          <div className="gleanings-chain__arrow" aria-hidden="true">↓</div>
          <div className="gleanings-chain__sources">
            <div><span>Schedule</span><strong>Start date</strong></div>
            <div><span>Drawing revision</span><strong>Issue date</strong></div>
            <div><span>Meeting notes</span><strong>Owner</strong></div>
          </div>
          <div className="gleanings-chain__arrow" aria-hidden="true">↓</div>
          <div>
            <p className="gleanings-chain__label">Human review gate</p>
            <div className="gleanings-review"><span>Confirm</span><span>Dismiss</span><span>Investigate</span></div>
          </div>
        </div>
      </article>
    </section>
  );
}

export function generateStaticParams() {
  return [...projects.map((project) => ({ slug: project.slug })), { slug: "intuit-astor-place" }];
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug === "intuit-astor-place") redirect("/work/confidential-client");
  const project = getProject(slug) ?? projects[0];
  const current = projects.findIndex((item) => item.slug === project.slug);
  const next = projects[(current + 1) % projects.length];
  const isHeroDiagram = project.image.endsWith(".svg");
  const gallery = (projectGalleries[project.slug] ?? []).filter(
    (item, index, items) =>
      item.src !== project.image &&
      items.findIndex((candidate) => candidate.src === item.src) === index,
  );
  const openingMedia = gallery.slice(0, 1);
  const narrativeMedia =
    project.slug === "charlesgate-park" || project.slug === "flower-tower"
      ? gallery.slice(1, 2)
      : gallery.slice(1, 3);
  const evidenceMedia =
    project.slug === "charlesgate-park" || project.slug === "flower-tower"
      ? gallery.slice(2)
      : gallery.slice(3);
  const endImage =
    project.artifactImage &&
    project.artifactImage !== project.image &&
    !gallery.some((item) => item.src === project.artifactImage)
      ? project.artifactImage
      : null;
  const isEndImageDiagram = endImage?.endsWith(".svg") ?? false;
  const headerDescriptor = project.descriptor ?? project.eyebrow.split(" · ");

  return (
    <main className="project-page-shell" style={{ "--project-accent": projectAccents[project.slug] ?? "#72d9e8" } as CSSProperties}>
      <SiteHeader inverse />
      <article className="project-page">
        <header className="project-hero">
          <div className="project-hero__copy">
            <p className="kicker project-hero__kicker--stacked">
              {headerDescriptor.map((part) => <span key={part}>{part}</span>)}
              <span>{project.year}</span>
            </p>
            <h1>{project.title}</h1>
            <p className="project-hero__headline">{project.headline}</p>
            <p className="project-hero__summary">{project.summary}</p>
            <div className="tag-row project-hero__tags" aria-label="Project categories">
              {project.categories.map((category) => <span key={category}>{category}</span>)}
            </div>
          </div>
          <div className={`project-hero__image${isHeroDiagram ? " project-hero__image--diagram" : ""}`}><img src={project.image} alt="" /></div>
        </header>

        <section className="project-facts">
          <div><p className="micro">Role</p><p>{project.role}</p></div>
          <div><p className="micro">Outcome</p><p>{project.outcome}</p></div>
        </section>

        <ProjectMedia items={openingMedia} label={`${project.title} opening artifact`} />

        <section className="project-narrative">
          <div className="project-narrative__title">
            <p className="kicker">{project.storyKicker}</p>
            <h2>{project.storyTitle}</h2>
          </div>
          <div className="project-narrative__body">
            <p>{project.narrative}</p>
            <aside>
              <p className="micro">{project.agencyLabel}</p>
              <p>{project.agency}</p>
            </aside>
          </div>
        </section>

        {project.slug === "gleanings" ? <GleaningsArtifacts /> : null}

        <ProjectMedia
          items={narrativeMedia}
          label={`${project.title} supporting artifacts`}
          sideBySide={project.slug === "release-intelligence"}
          matched={project.slug === "richardson-plaza"}
        />

        {project.slug === "flower-tower" ? (
          <>
            <ProjectMedia items={flowerTowerStructureMedia} label="Flower Tower structural views" sideBySide />
            <ProjectVideo
              src="/work/gallery/flower-tower/flower-tower-dance.mp4"
              poster="/work/gallery/flower-tower/flower-tower-dance-poster.webp"
              caption="The installation became a backdrop, partner, and stage."
              label="Flower Tower in motion"
            />
          </>
        ) : null}

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

        <ProjectMedia
          items={evidenceMedia}
          label={`${project.title} additional evidence`}
          sideBySide={project.slug === "charlesgate-park"}
        />

        <section className="project-details">
          {project.details.map((detail, index) => (
            <article key={detail.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h2>{detail.title}</h2>
              <p>{detail.body}</p>
            </article>
          ))}
        </section>

        {endImage ? (
          <section className={`project-image-break${isEndImageDiagram ? " project-image-break--diagram" : ""}`}>
            <img src={endImage} alt={`${project.title} supporting artifact`} />
          </section>
        ) : null}

        <nav className="next-project" aria-label="Next project">
          <a href={`/work/${next.slug}`}>{next.title}</a>
          <p>{next.question}</p>
        </nav>
      </article>
    </main>
  );
}
