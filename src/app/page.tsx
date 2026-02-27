import { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { SignatureDishes } from "@/components/sections/SignatureDishes";
import { FishShowcase } from "@/components/sections/FishShowcase";
import { SocialMedia } from "@/components/sections/SocialMedia";
import { MusicSection } from "@/components/sections/MusicSection";
import { VideoShowcase } from "@/components/sections/VideoShowcase";
import { LocalRelevance } from "@/components/sections/LocalRelevance";
import { ContactFormSection } from "@/components/sections/ContactFormSection";
import { Reveal } from "@/components/ui/Reveal";
import { buildMetadata } from "@/lib/seo";
import Image from "next/image";
import { PageManagedContent } from "@/components/cms/PageManagedContent";
import { getPageContent } from "@/lib/cms/queries";
import { MediaType } from "@prisma/client";
import { getPublicMediaUrl } from "@/lib/cms/public-media";

export const metadata: Metadata = buildMetadata({
  title: "Restaurant in Bad Saarow am Kurpark",
  description:
    "Carpe Diem bei Ben in Bad Saarow: mediterrane Küche, Fisch- und Grillgerichte, Live-Musik und Tischreservierung online.",
  path: "/",
});

export default async function Home() {
  const homePage = await getPageContent("home");
  const homeMediaLinks = homePage?.mediaLinks || [];

  const fishShowcaseItems = homeMediaLinks
    .filter((link) => link.fieldKey === "fish_showcase" && link.media.mediaType === MediaType.IMAGE)
    .map((link) => ({
      id: link.media.id,
      src: getPublicMediaUrl(link.media.id, link.media.url),
      alt: link.media.altText || link.media.filename,
      title: link.media.title || null,
      description: link.media.caption || null,
    }));

  const videoShowcaseItems = homeMediaLinks
    .filter((link) => link.fieldKey === "video_showcase" && link.media.mediaType === MediaType.VIDEO)
    .map((link) => ({
      id: link.media.id,
      src: getPublicMediaUrl(link.media.id, link.media.url),
      title: link.media.title || null,
      description: link.media.caption || null,
      width: link.media.width,
      height: link.media.height,
    }));

  return (
    <div className="flex flex-col w-full">
      <Hero />
      <Reveal>
        <SignatureDishes />
      </Reveal>
      <Reveal delayMs={80}>
        <FishShowcase items={fishShowcaseItems.length > 0 ? fishShowcaseItems : undefined} />
      </Reveal>
      <Reveal delayMs={100}>
        <SocialMedia />
      </Reveal>
      <MusicSection />
      <Reveal delayMs={140}>
        <VideoShowcase items={videoShowcaseItems.length > 0 ? videoShowcaseItems : undefined} />
      </Reveal>
      <Reveal delayMs={200}>
        <LocalRelevance />
      </Reveal>
      <PageManagedContent slug="home" />
      
      {/* Trust Section */}
      <section className="py-32 bg-transparent text-white overflow-hidden relative z-10 border-t border-white/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center space-y-16">
            <Reveal className="space-y-8">
              <div className="flex flex-col items-center gap-4">
                <span className="text-sm md:text-base font-bold uppercase tracking-[0.6em] text-primary-400">Unsere Philosophie</span>
                <div className="h-px w-24 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
              </div>
              <h2 className="font-serif text-6xl md:text-8xl font-bold leading-[0.9] tracking-tighter">
                <span className="bg-gradient-to-b from-white via-white/90 to-white/40 bg-clip-text text-transparent inline-block pb-2">
                  Qualität, die man
                </span>
                <br />
                <span className="text-primary-400 font-medium">schmecken kann.</span>
              </h2>
              <p className="text-accent-200 text-xl md:text-2xl leading-relaxed font-light max-w-3xl mx-auto">
                Wir legen größten Wert auf frische Zutaten und authentische Zubereitung. 
                Ob ein schneller Lunch oder ein ausgedehntes Abendessen – bei uns 
                erleben Sie mediterrane Gastfreundschaft auf höchstem Niveau.
              </p>
              
              <div className="flex justify-center gap-16 md:gap-24 pt-8">
                <div className="space-y-3">
                  <p className="text-6xl md:text-7xl font-serif font-bold text-primary-400 tracking-tighter">4.8</p>
                  <p className="text-[10px] text-accent-400 uppercase tracking-[0.4em] font-bold">Google Rating</p>
                </div>
                <div className="space-y-3">
                  <p className="text-6xl md:text-7xl font-serif font-bold text-primary-400 tracking-tighter">15+</p>
                  <p className="text-[10px] text-accent-400 uppercase tracking-[0.4em] font-bold">Jahre Erfahrung</p>
                </div>
              </div>
            </Reveal>

            <Reveal delayMs={150}>
              <div className="relative aspect-[21/9] rounded-[3rem] overflow-hidden shadow-2xl ring-1 ring-white/10 mx-auto">
                <Image
                  src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=85&w=2000"
                  alt="Atmosphäre im Restaurant"
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <Reveal delayMs={260}>
        <ContactFormSection />
      </Reveal>
    </div>
  );
}
