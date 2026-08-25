import { SiteHeader } from "../components/SiteHeader";

const focusAreas = [
  "Experiential & media architecture",
  "AI systems & agent workflows",
  "Fabrication, permitting & delivery",
  "Real-time spatial systems",
  "Product strategy & operating models",
  "Research, prototyping & participatory design",
];

const experience = [
  { years: "2026", org: "Cairn", role: "Company Brain architect · sole builder", body: "A private, local-first operating system for 345,000 files, 4.5 TB of evidence, and a human-gated vocabulary of 119 projects." },
  { years: "2024–Present", org: "Tricky", role: "Independent practice · AI product builder & experience designer", body: "Release Intelligence, Gleanings, RFP Automation, Civic Investment Mapping, String, and AIntivirus; independent AI products and agentic infrastructure used by operating teams, 5,000+ traders, and 10,000+ chatbot users across ventures." },
  { years: "2023–26", org: "Downstream", role: "Experiential strategy · project management · media systems", body: "Vanderbilt Passage, a confidential physical-AI client, Red Hat, and other confidential enterprise programs; $6.9M in scoped budgets with $1.48M in documented savings." },
  { years: "2020–23", org: "BrineSpace", role: "Co-founder · architecture and fabrication", body: "Caleta & Bad Habit, 88 East Broadway, three cultural pop-ups, and the third-place Nestlé BioDesign proposal Booch Lab." },
  { years: "2021–22", org: "WeWork", role: "Spatial experience design · portfolio strategy", body: "Conversion logic across 900+ locations, initiating 200+ projects through a playbook distributed teams could run." },
  { years: "2019–21", org: "MassRobotics", role: "NSF-funded HRI research", body: "Gymnast CoBot, developed under NSF Award #1928654." },
  { years: "2019–20", org: "Landing Studio", role: "Public realm design · research and fabrication", body: "Charlesgate Park, Richardson Plaza, Ouellette Bridge, Covid Food Distribution Hubs, and Marginal Street Community–Industry Seam Improvements." },
  { years: "2018–19", org: "Signify", role: "Experiential design research", body: "Gesture-controlled task lighting, bio-responsive systems, and waterfront experience planning across light, place, and interaction." },
];

export default function AboutPage() {
  return (
    <main className="about-page">
      <SiteHeader inverse />
      <section className="about-hero">
        <div className="route-intro">
          <p className="about-lede page-intro__lede">I work where architecture, atmosphere, storytelling, and computation fuse to become one deliverable.</p>
          <p>My background begins in physical space and extends through fabrication, experiential systems, product management, AI workflows, and cultural experiments.</p>
          <p>A fondness for pre-existing conditions flows through all of my endeavors as does transparency regarding the motivating design drivers of each and every output.</p>
        </div>
        <figure className="plus-figure">
          <div className="plus-map" aria-label="A plus sign mapping Patrick’s practice">
            <span className="plus-arm plus-arm--top">Atmosphere</span>
            <span className="plus-arm plus-arm--right">Computation</span>
            <span className="plus-arm plus-arm--bottom">Architecture</span>
            <span className="plus-arm plus-arm--left">Storytelling</span>
          </div>
        </figure>
      </section>

      <section className="about-grid" aria-label="Practice principles">
        <article><p className="micro">01 · Practice</p><h2>Work from what already exists</h2><p>A site, archive, behavior, or half-working tool is never empty. I begin by making its existing conditions usable.</p></article>
        <article><p className="micro">02 · Figure</p><h2>Reason through the artifact.</h2><p>The drawing, model, deck, or diagram is where the problem gets worked out, not where the finished idea is announced.</p></article>
        <article><p className="micro">03 · Broker</p><h2>Build a shared language.</h2><p>I construct the terms and intermediary artifacts that let separate disciplines understand one another and act together.</p></article>
        <article><p className="micro">04 · Temper</p><h2>Design beyond the handoff.</h2><p>The work meets unanticipated conditions and untrained hands. What survives becomes more useful while its decisions remain legible.</p></article>
      </section>

      <section className="about-resume">
        <div className="about-resume__heading"><h2><em>Disciplines kept in productive collision.</em></h2></div>
        <ol className="focus-list">{focusAreas.map((area,index)=><li key={area}><span>{String(index+1).padStart(2,"0")}</span>{area}</li>)}</ol>

        <div className="about-resume__heading"><h2><em>Ten years making rooms, systems, and handoffs hold together.</em></h2></div>
        <div className="experience-list">{experience.map((item)=><article key={`${item.years}-${item.org}`}><time>{item.years}</time><div><h3>{item.org}</h3><p className="micro">{item.role}</p>{"lines" in item ? <div className="experience-lines">{item.lines?.map((line)=><p key={line}>{line}</p>)}</div> : <p>{item.body}</p>}</div></article>)}</div>

        <div className="about-resume__heading"><h2><em>Northeastern University.</em></h2></div>
        <div className="education-list"><article><span>2021</span><div><h3>Master of Architecture</h3><p>Graduate study in architecture, technology, research, and delivery.</p></div></article><article><span>2019</span><div><h3>Bachelor of Science in Architecture</h3><p>Five-year co-op program integrating practice with studio education.</p></div></article></div>
      </section>

      <footer className="site-footer"><a href="mailto:patrickdawsono@gmail.com">contact: patrickdawsono@gmail.com</a></footer>
    </main>
  );
}
