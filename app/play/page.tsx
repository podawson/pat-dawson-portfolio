import { SiteHeader } from "../components/SiteHeader";
import { WaterStudy } from "../components/WaterStudy";

export default function PlayPage() {
  return (
    <main className="studies-page">
      <SiteHeader inverse />
      <section className="studies-intro page-intro page-intro--work route-intro">
        <p className="kicker">PLAY</p>
        <h1>Stay a while</h1>
        <p>We are too much like oysters observing the sun through the water, and thinking that thick water the thinnest of air</p>
      </section>
      <WaterStudy />
      <section className="studies-footnote">
        <p>The surface is deliberately inspectable: one primitive, twenty explicit parameters, four observational presets, and no simulated realism hiding how the atmosphere is made.</p>
        <a href="/#map">Return to the Corpus ↗</a>
      </section>
    </main>
  );
}
