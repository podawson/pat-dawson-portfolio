import { Constellation } from "./components/Constellation";
import { SiteHeader } from "./components/SiteHeader";

export default function Home() {
  return (
    <main className="home-page">
      <SiteHeader inverse />
      <Constellation />
    </main>
  );
}
