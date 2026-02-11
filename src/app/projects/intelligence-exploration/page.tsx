import Link from "next/link";
import { Metadata } from "next";
import { getProjectBySlug } from "@/sanity/lib/fetch";
import IntelligenceDiagram from "@/components/IntelligenceDiagram";
import ParallaxSection from "./ParallaxSection";

export const metadata: Metadata = {
  title: "Intelligence Exploration | LUWA",
  description: "Transforming creative workflows through custom AI solutions",
};

export default async function IntelligenceExplorationPage() {
  // Fetch project data from CMS
  const project = await getProjectBySlug("intelligence-exploration");

  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* Hero - Intelligence Diagram */}
      <section className="w-full">
        <div className="relative w-full aspect-[16/9] md:aspect-[2.5/1] overflow-hidden diagram-transition">
          <IntelligenceDiagram />
        </div>
      </section>

      {/* Parallax Sections with CMS Images */}
      <ParallaxSection
        galleryImages={project?.galleryImages}
        documentId={project?._id || ''}
      />

      {/* Quote Section */}
      <section className="px-[24px] md:px-[63px] py-[100px] md:py-[150px] text-center">
        <p className="max-w-[700px] mx-auto text-[18px] md:text-[24px] leading-[1.5] italic text-foreground/80">
          The goal isn't to replace creativity—it's to remove friction between
          imagination and execution, letting teams focus on strategy while AI
          handles scale.
        </p>
      </section>

      {/* Footer Navigation */}
      <footer className="px-[24px] md:px-[63px] py-[40px] border-t border-foreground/10">
        <div className="flex justify-between items-center">
          <Link
            href="/#projects"
            className="text-[16px] md:text-[18px] font-medium hover:underline underline-offset-4"
          >
            ATELIER
          </Link>
          <Link
            href="/projects/next-project"
            className="text-[16px] md:text-[18px] font-medium hover:underline underline-offset-4"
          >
            NEXT
          </Link>
        </div>
      </footer>
    </main>
  );
}
