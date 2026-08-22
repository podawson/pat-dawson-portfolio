import Link from "next/link";
import { SiteHeader } from "../components/SiteHeader";
import { WaterStudy } from "../components/WaterStudy";

export default function PlayPage() {
  return (
    <main className="studies-page">
      <SiteHeader inverse />
      <section className="studies-intro">
        <p className="kicker kicker--light">Play / Water 01</p>
        <h1>One triangle, many seas.</h1>
        <p>A minimal water study built from one repeated isosceles triangle—change the field, then watch calm geometry move toward storm, cloud, and fog.</p>
      </section>
      <WaterStudy />
      <section className="studies-footnote">
        <p>The surface is deliberately inspectable: one primitive, nineteen explicit parameters, four observational presets, and no simulated realism hiding how the atmosphere is made.</p>
        <Link href="/#map">Return to the Map ↗</Link>
      </section>
    </main>
  );
}
