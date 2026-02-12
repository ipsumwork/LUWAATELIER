import Link from "next/link";
import { getAboutPage, getSiteConfig } from "@/sanity/lib/fetch";
import FadeIn from "@/components/FadeIn";
import { PortableText } from "@/components/PortableText";
import { SanityImage } from "@/components/SanityImage";

export default async function About() {
  const [about, siteConfig] = await Promise.all([
    getAboutPage(),
    getSiteConfig(),
  ]);

  // Fallback content if CMS is empty
  const heading = about?.heading || "Designer & Creative Technologist";
  const services = about?.services || [
    "Creative Direction",
    "Art Direction",
    "Visual Identity",
    "AI/ML Exploration",
    "Interactive Design",
  ];
  const clients = about?.clients || [
    "Studio Name",
    "Brand Co.",
    "Agency Inc.",
    "Creative Lab",
  ];
  const contactEmail = about?.contactEmail || siteConfig?.contactEmail || "hello@luwa.design";
  const socialLinks = siteConfig?.socialLinks || [];
  const servicesLabel = about?.servicesLabel || "Services";
  const clientsLabel = about?.clientsLabel || "Selected Clients";
  const contactLabel = about?.contactLabel || "Contact";

  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-[24px] md:px-[63px] py-[24px] flex justify-between items-center bg-background/80 backdrop-blur-sm">
        <Link
          href="/"
          className="text-[24px] md:text-[32px] font-medium tracking-tight underline underline-offset-4 peer font-[var(--font-heros)]"
        >
          LUWA
        </Link>
        <Link
          href="/#projects"
          className="text-[24px] md:text-[32px] font-medium tracking-tight underline-offset-4 hover:underline peer-hover:no-underline font-[var(--font-heros)]"
        >
          ATELIER
        </Link>
      </header>

      {/* Hero Section */}
      <section className="pt-[120px] md:pt-[160px] px-[24px] md:px-[63px]">
        <FadeIn>
          <h1 className="font-[var(--font-abhaya)] text-[48px] md:text-[96px] leading-[0.95] max-w-[900px]">
            {heading}
          </h1>
        </FadeIn>
      </section>

      {/* About Content */}
      <section className="px-[24px] md:px-[63px] py-[80px] md:py-[120px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[48px] md:gap-[120px]">
          {/* Left Column - Bio */}
          <FadeIn delay={0.1}>
            <div className="space-y-[32px]">
              {about?.bio ? (
                <div className="section-text">
                  <PortableText value={about.bio} />
                </div>
              ) : (
                <div className="section-text">
                  <p>
                    I&apos;m a multidisciplinary designer exploring the intersection of
                    artificial intelligence, visual design, and human experience.
                    My work spans creative direction, art direction, and experimental
                    technology projects.
                  </p>
                  <p>
                    Currently focused on building tools and experiences that bridge
                    the gap between human creativity and machine intelligence,
                    questioning how we collaborate with AI systems to create
                    meaningful work.
                  </p>
                  <p>
                    Previously worked with brands and studios across fashion,
                    technology, and culture, bringing a research-driven approach
                    to every project.
                  </p>
                </div>
              )}
            </div>
          </FadeIn>

          {/* Right Column - Details */}
          <div className="space-y-[48px]">
            <FadeIn delay={0.2}>
              <div>
                <h3 className="text-[14px] uppercase tracking-[0.1em] text-foreground opacity-50 mb-[16px] font-bold">
                  {servicesLabel}
                </h3>
                <ul className="space-y-[8px] text-[24px] md:text-[32px] font-normal">
                  {services.map((service, i) => (
                    <li key={i}>{service}</li>
                  ))}
                </ul>
              </div>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div>
                <h3 className="text-[14px] uppercase tracking-[0.1em] text-foreground opacity-50 mb-[16px] font-bold">
                  {clientsLabel}
                </h3>
                <ul className="space-y-[8px] text-[24px] md:text-[32px] font-normal">
                  {clients.map((client, i) => (
                    <li key={i}>{client}</li>
                  ))}
                </ul>
              </div>
            </FadeIn>

            <FadeIn delay={0.4}>
              <div>
                <h3 className="text-[14px] uppercase tracking-[0.1em] text-foreground opacity-50 mb-[16px] font-bold">
                  {contactLabel}
                </h3>
                <ul className="space-y-[8px] text-[24px] md:text-[32px] font-normal">
                  <li>
                    <a
                      href={`mailto:${contactEmail}`}
                      className="hover:underline underline-offset-4"
                    >
                      {contactEmail}
                    </a>
                  </li>
                  {socialLinks.map((link) => (
                    <li key={link._key}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline underline-offset-4 capitalize"
                      >
                        {link.platform}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Image Section */}
      <section className="px-[24px] md:px-[63px] pb-[80px] md:pb-[120px]">
        <FadeIn delay={0.2}>
          <div className="aspect-[16/9] md:aspect-[21/9] bg-[#acacac] rounded-[8px] overflow-hidden relative">
            {about?.portrait ? (
              <SanityImage
                image={about.portrait}
                alt="Portrait"
                fill
                className="object-cover"
              />
            ) : null}
          </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="px-[24px] md:px-[63px] py-[32px] border-t border-foreground/10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-[16px]">
          <p className="text-[14px] text-foreground/50">
            &copy; {new Date().getFullYear()} LUWA. All rights reserved.
          </p>
          <div className="flex gap-[24px] text-[14px]">
            <Link href="/" className="hover:underline underline-offset-4">
              Work
            </Link>
            <Link href="/about" className="hover:underline underline-offset-4">
              About
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
