import { Nav } from "@/components/Nav";
import { ReactiveName } from "@/components/ReactiveName";
import { TraceHero } from "@/components/TraceHero";
import { HeroActions } from "@/components/HeroActions";
import { StackMarquee } from "@/components/StackMarquee";
import { Projects } from "@/components/Projects";
import { Timeline } from "@/components/Timeline";
import { Contact } from "@/components/Contact";
import { SceneSlot } from "@/components/three/SceneSlot";
import { HeroFallback } from "@/components/three/fallbacks/HeroFallback";
import { hero, site } from "@/lib/content";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="top" className="mx-auto max-w-content px-5 sm:px-8">
        <section className="pb-20 pt-32 sm:pt-40">
          <p className="text-base text-muted sm:text-lg">{site.role}</p>
          <div className="mt-3">
            <ReactiveName name={site.name} />
          </div>
          <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_26rem]">
            <div>
              <p className="max-w-[60ch] text-lg text-muted sm:text-xl">{site.summary}</p>
              <HeroActions primary={hero.primaryCta} palette={hero.paletteCta} />
            </div>
            <SceneSlot name="hero" className="relative h-64 w-full lg:h-80" fallback={<HeroFallback />} />
          </div>
          <div className="mt-14">
            <TraceHero />
          </div>
        </section>
        <StackMarquee />
        <Projects />
        <Timeline />
        <Contact />
      </main>
    </>
  );
}
