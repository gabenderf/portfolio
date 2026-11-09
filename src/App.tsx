import { About } from "./chrome/About";
import { Architecture } from "./chrome/Architecture";
import { Contact } from "./chrome/Contact";
import { Hero } from "./chrome/Hero";
import { HowIWork } from "./chrome/HowIWork";
import { IconSprite } from "./chrome/Icons";
import { Nav } from "./chrome/Nav";
import { Principles } from "./chrome/Principles";
import { ToastProvider } from "./chrome/Toast";
import { useSpotlight } from "./chrome/useSpotlight";
import { WaveField } from "./chrome/WaveField";
import { site } from "./content/site";
import { WorkSection } from "./work/WorkSection";

export function App() {
  useSpotlight();
  return (
    <ToastProvider>
      <a className="skip" href="#trabalho">
        {site.nav.skipLabel}
      </a>
      <WaveField />
      <IconSprite />
      <Nav />
      <main>
        <Hero />
        <About />
        <WorkSection />
        <Architecture />
        <HowIWork />
        <Principles />
      </main>
      <Contact />
    </ToastProvider>
  );
}
