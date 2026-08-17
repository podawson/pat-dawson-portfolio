import { SiteHeader } from "../components/SiteHeader";

const focusAreas = [
  "Experiential & media architecture",
  "AI product systems & agentic workflows",
  "Fabrication & delivery coordination",
  "Spatial computing & interactive installations",
  "Evidence-led product management",
  "Rapid 0→1 prototyping",
];

const experience = [
  { years: "2024—Present", org: "Tricky", role: "Independent practice · AI product builder & experience designer", body: "Release Intelligence, Gleanings, civic investment mapping, and applied-AI systems for operating teams." },
  { years: "2024—25", org: "String / AIntivirus", role: "Co-founder & product", body: "A Solana signal platform used by 5,000+ traders and an operated AI character system serving ~10,000 active chatbot users across a 1.2M-follower audience." },
  { years: "2023—26", org: "Downstream", role: "Experiential delivery", body: "Vanderbilt Passage at JPMC 270 Park Avenue—five hardware zones and fifteen generative modes—plus the Intuit flagship at Astor Place." },
  { years: "2021—22", org: "WeWork", role: "Portfolio strategy", body: "Conversion logic across 900+ locations, translated into rules distributed teams could run." },
  { years: "2019—21", org: "MassRobotics", role: "NSF-funded HRI research", body: "Gymnast CoBot, developed under NSF Award #1928654." },
  { years: "2016—21", org: "Landing Studio & independent fabrication", role: "Design & build", body: "Ouellette Bridge, Charlesgate advocacy, and hospitality build-outs." },
];

export default function AboutPage() {
  return (
    <main>
      <SiteHeader />
      <section className="about-hero">
        <div>
          <p className="kicker">About / Pat Dawson</p>
          <h1>I do my best where it comes crashing together.</h1>
          <p className="about-lede">I work where architecture, atmosphere, storytelling, and computation have to become one deliverable.</p>
          <p>My background begins in physical space and extends through fabrication, experiential systems, product management, AI workflows, and cultural experiments. The throughline is a fondness for existing conditions—and for making the reasoning visible enough that someone else can carry it forward.</p>
        </div>
        <figure className="plus-figure">
          <div className="plus-map" aria-label="A plus sign mapping Patrick’s practice">
            <span className="plus-arm plus-arm--top">Atmosphere</span>
            <span className="plus-arm plus-arm--right">Computation</span>
            <span className="plus-arm plus-arm--bottom">Architecture</span>
            <span className="plus-arm plus-arm--left">Storytelling</span>
            <strong>+</strong>
          </div>
          <figcaption>Also the coordinate system of the Field.</figcaption>
        </figure>
      </section>

      <section className="about-grid" aria-label="Practice principles">
        <article><p className="micro">01 · Practice</p><h2>Find what is already there.</h2><p>A site, archive, behavior, or half-working tool is rarely empty. I start by making the existing record usable.</p></article>
        <article><p className="micro">02 · Delivery</p><h2>Make it work well with others.</h2><p>Drawings, interfaces, packages, checklists, and operating models are all forms of coordination.</p></article>
        <article><p className="micro">03 · Tissue</p><h2>Foster the connective tissue.</h2><p>I tend to become the person holding the relationship between disciplines, constraints, and people.</p></article>
        <article><p className="micro">04 · Evidence</p><h2>Show the work.</h2><p>A system earns trust when the handoff preserves decisions, contradictions, and the path to the outcome.</p></article>
      </section>

      <section className="about-resume">
        <div className="about-resume__heading"><p className="kicker">Focus areas</p><h2>What I am building around.</h2></div>
        <ol className="focus-list">{focusAreas.map((area,index)=><li key={area}><span>{String(index+1).padStart(2,"0")}</span>{area}</li>)}</ol>

        <div className="about-resume__heading"><p className="kicker">Where I&apos;ve worked</p><h2>Ten years across rooms, systems, and handoffs.</h2></div>
        <div className="experience-list">{experience.map((item)=><article key={`${item.years}-${item.org}`}><time>{item.years}</time><div><h3>{item.org}</h3><p className="micro">{item.role}</p><p>{item.body}</p></div></article>)}</div>

        <div className="about-resume__heading"><p className="kicker">Where I&apos;ve studied</p><h2>Northeastern University.</h2></div>
        <div className="education-list"><article><span>2021</span><div><h3>Master of Architecture</h3><p>Graduate study in architecture, technology, research, and delivery.</p></div></article><article><span>2019</span><div><h3>Bachelor of Science in Architecture</h3><p>Five-year co-op program integrating practice with studio education.</p></div></article></div>
      </section>

      <footer className="site-footer site-footer--light"><a href="mailto:patrickdawsono@gmail.com">patrickdawsono@gmail.com</a><a href="/work">Browse the work →</a></footer>
    </main>
  );
}
