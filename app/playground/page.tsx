import Link from "next/link";
import { ProteanField } from "../components/ProteanField";
import { SiteHeader } from "../components/SiteHeader";

export default function PlaygroundPage() {
  return (
    <main className="playground-page">
      <SiteHeader inverse />
      <section className="playground-intro">
        <p className="kicker kicker--light">Playground</p>
        <h1>Weather for<br />a protean surface.</h1>
        <p>A minimal water study built from one repeated isosceles triangle. Change the field, then watch calm geometry move toward storm, cloud, and fog.</p>
      </section>
      <ProteanField />
      <section className="playground-footnote">
        <p>The surface is deliberately inspectable: one primitive, a few explicit uniforms, and no simulated realism hiding how the atmosphere is made.</p>
        <Link href="/#constellation">Return to the project field ↗</Link>
      </section>
    </main>
  );
}
