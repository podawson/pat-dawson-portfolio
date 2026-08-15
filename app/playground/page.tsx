import { ProteanField } from "../components/ProteanField";
import { SiteHeader } from "../components/SiteHeader";

export default function PlaygroundPage() {
  return (
    <main className="playground-page">
      <SiteHeader inverse />
      <section className="playground-intro">
        <p className="kicker kicker--light">Playground</p>
        <h1>Small instruments<br />for looking sideways.</h1>
        <p>These are not case studies. They are places to touch the logic, move a parameter, and watch a system disclose itself.</p>
      </section>
      <ProteanField />
      <section className="playground-footnote">
        <p>Density changes what can connect. Reach changes what counts as near. Drift changes which relationships survive.</p>
        <a href="/#constellation">Return to the project field ↗</a>
      </section>
    </main>
  );
}

