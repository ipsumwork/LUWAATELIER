import { getProjects, getSiteConfig } from "@/sanity/lib/fetch";
import Hero from "@/components/Hero";
import { ProjectGrid } from "@/components/ProjectGrid";
import Footer from "@/components/Footer";

export default async function Home() {
  const [projects, siteConfig] = await Promise.all([
    getProjects(),
    getSiteConfig(),
  ]);

  const heroMediaUrl = siteConfig?.heroMedia?.asset?.url;
  const heroMediaMime = siteConfig?.heroMedia?.asset?.mimeType;
  const heroBgColor = siteConfig?.heroBackgroundColor?.hex;

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Hero heroMediaUrl={heroMediaUrl} heroMediaMime={heroMediaMime} heroBgColor={heroBgColor} />

      {/* Spacer */}
      <div className="h-[10vh]" aria-hidden="true" />

      {/* Projects Grid */}
      <section id="projects" className="px-[23px] pt-[27px] pb-[27px]">
        <ProjectGrid projects={projects} />
      </section>

      <Footer siteConfig={siteConfig} />
    </main>
  );
}
