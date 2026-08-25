import { SiteHeader } from "../components/SiteHeader";
import { WaterStudy } from "../components/WaterStudy";

export default function PlayPage() {
  return (
    <main className="studies-page studies-page--immersive">
      <SiteHeader inverse />
      <WaterStudy />
    </main>
  );
}
