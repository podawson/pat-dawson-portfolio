import { SiteHeader } from "../components/SiteHeader";

export default function AboutPage() {
  return (
    <main>
      <SiteHeader />
      <section className="about-hero">
        <div>
          <p className="kicker">About / Pat Dawson</p>
          <h1>I am useful at the plus sign.</h1>
          <p className="about-lede">I work where architecture, atmosphere, storytelling, and computation have to become one deliverable.</p>
          <p>My background begins in physical space and extends through fabrication, experiential systems, product management, AI workflows, and cultural experiments. The throughline is a fondness for existing conditions—and for making the reasoning visible enough that someone else can carry it forward.</p>
        </div>
        <div className="plus-map" aria-label="A plus sign mapping Patrick’s practice">
          <span className="plus-arm plus-arm--top">Atmosphere</span>
          <span className="plus-arm plus-arm--right">Computation</span>
          <span className="plus-arm plus-arm--bottom">Architecture</span>
          <span className="plus-arm plus-arm--left">Storytelling</span>
          <strong>+</strong>
        </div>
      </section>

      <section className="about-grid">
        <article><p className="micro">01 · Practice</p><h2>Find what is already there.</h2><p>A site, archive, behavior, or half-working tool is rarely empty. I start by making the existing record usable.</p></article>
        <article><p className="micro">02 · Delivery</p><h2>Make it work well with others.</h2><p>Drawings, interfaces, packages, checklists, and operating models are all forms of coordination.</p></article>
        <article><p className="micro">03 · Tissue</p><h2>Foster the connective tissue.</h2><p>I tend to become the person holding the relationship between disciplines, constraints, and people.</p></article>
        <article><p className="micro">04 · Evidence</p><h2>Show the work.</h2><p>A system earns trust when the handoff preserves decisions, contradictions, and the path to the outcome.</p></article>
      </section>

      <section className="proteus-note">
        <p className="kicker kicker--light">A small personal mythology</p>
        <h2>Proteus is the old man of the sea: elusive, prophetic, and capable of assuming many forms.</h2>
        <p>“Protean” is often used as a euphemism for versatility. I like the less tidy version: change shape when the situation demands it, but keep the thread of meaning intact.</p>
        <a href="/playground">Play with the shape-shifting field ↗</a>
      </section>

      <footer className="site-footer site-footer--light"><a href="mailto:patrickdawsono@gmail.com">patrickdawsono@gmail.com</a><a href="/work">Browse the work ↗</a></footer>
    </main>
  );
}
