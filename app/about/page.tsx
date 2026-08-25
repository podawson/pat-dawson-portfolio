import { SiteHeader } from "../components/SiteHeader";
import { WaterStudy } from "../components/WaterStudy";

const focusAreas = [
  "Experiential & media architecture",
  "AI systems & agent workflows",
  "Fabrication, permitting & delivery",
  "Real-time spatial systems",
  "Product strategy & operating models",
  "Research, prototyping & participatory design",
];

const experience = [
  { years: "2026", org: "Cairn", role: "Company Brain architect · sole builder", body: "A local-first OS and agent-orchestration engine that turns two decades of unstructured work into a memory layer capable of taking a brief and producing the materials to answer it, informed by what its swappable archive suggests." },
  { years: "2024–Present", org: "Tricky", role: "AI product builder and experience designer", body: "Release Intelligence, Gleanings, RFP Automation, Civic Investment Mapping, String, and AIntivirus; independent AI products and agentic infrastructure used by operating teams, 5,000+ traders, and 10,000+ chatbot users across ventures." },
  { years: "2023–26", org: "Downstream", role: "Experiential strategy · project management · media systems", body: "Vanderbilt Passage, a confidential physical-AI client, Warner Music, Red Hat, Toronto Reaptor, and other confidential enterprise programs; $6.9M in scoped budgets with $1.48M in documented savings." },
  { years: "2020–23", org: "BrineSpace", role: "Strategy and concepting and fabrication", body: "Hospitality interiors, cultural programming, fabrication, and materials research. Full-permit bar buildouts (Caleta, Bad Habits), adaptive reuse at 88 East Broadway, three cultural pop-ups, community fridge shed design, precision jewelry, school repairs for a Haitian art institution, and a third-place Nestlé BioDesign proposal for Booch Lab." },
  { years: "2021–22", org: "WeWork", role: "Spatial experience design · portfolio strategy", body: "Conversion logic across 900+ locations, initiating 200+ projects through a playbook distributed teams could run." },
  { years: "2019–21", org: "MassRobotics", role: "NSF-funded HRI research", body: "Gymnast CoBot, developed under NSF Award #1928654." },
  { years: "2019–20", org: "Landing Studio", role: "Research and design and fabrication", body: "Charlesgate Park, Richardson Plaza, Ouellette Bridge, Covid Food Distribution Hubs, and Marginal Street Community–Industry Seam Improvements." },
  { years: "2018–19", org: "Signify", role: "Experiential design research", body: "Gesture-controlled task lighting, bio-responsive systems, and waterfront experience planning across light, place, and interaction." },
];

export default function AboutPage() {
  return (
    <main className="about-page">
      <SiteHeader inverse />
      <section className="about-hero">
        <div className="route-intro">
          <p className="kicker">ABOUT</p>
          <h1>First Person</h1>
          <p className="about-intro-note page-intro__lede"><em>I wrote this part</em></p>
          <div className="about-hero__body">
            <p>I work where a lot of different things fuse together and become one deliverable.</p>
            <p>My background begins in physical space and extends through fabrication, product management, experiential systems, AI workflows, and cultural experiments.</p>
            <p>A fondness for the pre-existing flows through all my endeavors as does a transparency of my motivating design drivers for each and every output.</p>
          </div>
        </div>
        <div className="about-play-interactive">
          <WaterStudy embedded />
        </div>
      </section>

      <section className="about-grid" aria-label="Practice principles">
        <article><p className="micro">01 · Practice</p><h2>Work from what already exists.</h2><p>A site, archive, behavior, or half-working tool is never empty. I begin by making its existing conditions usable.</p></article>
        <article><p className="micro">02 · Figure</p><h2>Reason through the artifact.</h2><p>The drawing, model, deck, or diagram is where the problem gets worked out, not where the finished idea is announced.</p></article>
        <article><p className="micro">03 · Broker</p><h2>Build a shared language.</h2><p>I construct the terms and intermediary artifacts that let separate disciplines understand one another and act together.</p></article>
        <article><p className="micro">04 · Temper</p><h2>Design beyond the handoff.</h2><p>The work meets unanticipated conditions and untrained hands. What survives becomes more useful while its decisions remain legible.</p></article>
      </section>

      <section className="about-resume">
        <div className="about-resume__heading"><h2><em>Disciplines kept in productive collision.</em></h2></div>
        <ol className="focus-list">{focusAreas.map((area,index)=><li key={area}><span>{String(index+1).padStart(2,"0")}</span>{area}</li>)}</ol>

        <div className="about-resume__heading"><h2><em>What that looks like in practice.</em></h2></div>
        <div className="experience-list">{experience.map((item)=><article key={`${item.years}-${item.org}`}><time>{item.years}</time><div><h3>{item.org}</h3><p className="micro">{item.role}</p>{"lines" in item ? <div className="experience-lines">{item.lines?.map((line)=><p key={line}>{line}</p>)}</div> : <p>{item.body}</p>}</div></article>)}</div>

        <div className="about-resume__heading"><h2><em>Appreciate you.</em></h2></div>
        <div className="about-closing-note">
          <p>At the end of the day I just want to be making good work.</p>
          <p>I&apos;ve spent all my years trying to stay ahead of the next one by being a sponge.</p>
          <p>Everyone&apos;s a great teacher if you&apos;re a good listener.</p>
          <p>Hope this finds you well.</p>
        </div>
      </section>

      <footer className="site-footer">
        <a href="mailto:patrickdawsono@gmail.com">contact: patrickdawsono@gmail.com</a>
        <a className="footer-linkedin" href="https://www.linkedin.com/in/patrick-dawson/" target="_blank" rel="noreferrer" aria-label="Patrick Dawson on LinkedIn">
          <svg aria-hidden="true" viewBox="0 0 24 24"><rect width="24" height="24" rx="2"/><circle cx="6.5" cy="7" r="1.5"/><path d="M5 10h3v9H5zm5 0h2.8v1.25h.04c.39-.74 1.35-1.52 2.78-1.52 2.98 0 3.53 1.96 3.53 4.51V19h-3v-4.22c0-1.01-.02-2.3-1.4-2.3-1.4 0-1.62 1.1-1.62 2.23V19h-3z"/></svg>
        </a>
      </footer>
    </main>
  );
}
