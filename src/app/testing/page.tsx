import { getProjects, getSiteConfig, getAboutPage } from "@/sanity/lib/fetch";
import Hero from "@/components/Hero";
import { ProjectGrid } from "@/components/ProjectGrid";
import Footer from "@/components/Footer";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TestingPage() {
  const [projects, siteConfig, about] = await Promise.all([
    getProjects({ revalidate: false }),
    getSiteConfig({ revalidate: false }),
    getAboutPage({ revalidate: false }),
  ]);

  const heroMediaUrl = siteConfig?.heroMedia?.asset?.url;
  const heroMediaMime = siteConfig?.heroMedia?.asset?.mimeType;
  const heroBgColor = siteConfig?.heroBackgroundColor?.hex;

  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* Testing Banner */}
      <div className="fixed top-0 left-0 right-0 z-[100] bg-yellow-400 text-black text-center py-1 text-xs font-bold tracking-widest uppercase">
        Testing Environment — Changes are not cached
      </div>

      <Hero heroMediaUrl={heroMediaUrl} heroMediaMime={heroMediaMime} heroBgColor={heroBgColor} />

      {/* Spacer */}
      <div className="h-[10vh]" aria-hidden="true" />

      {/* Projects Grid */}
      <section id="projects" className="px-[23px] pt-[27px] pb-[27px]">
        <ProjectGrid projects={projects} />
      </section>

      {/* Testing Navigation */}
      <section className="px-[23px] py-[40px] border-t border-foreground/10">
        <h2 className="text-[14px] uppercase tracking-[0.1em] text-foreground opacity-50 mb-[16px] font-bold">
          Test Pages
        </h2>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/testing"
            className="px-4 py-2 bg-foreground/10 rounded-full text-sm hover:bg-foreground/20 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/about"
            className="px-4 py-2 bg-foreground/10 rounded-full text-sm hover:bg-foreground/20 transition-colors"
          >
            About
          </Link>
          {projects.map((project) => (
            <Link
              key={project._id}
              href={`/projects/${project.slug}`}
              className="px-4 py-2 bg-foreground/10 rounded-full text-sm hover:bg-foreground/20 transition-colors"
            >
              {project.title}
            </Link>
          ))}
          <Link
            href="/studio"
            className="px-4 py-2 bg-blue-500/20 text-blue-600 rounded-full text-sm hover:bg-blue-500/30 transition-colors"
          >
            Sanity Studio
          </Link>
        </div>
      </section>

      <Footer siteConfig={siteConfig} />
    </main>
  );
}
