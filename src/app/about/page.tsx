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
      {/* Hero Section */}
      <section className="pt-[120px] md:pt-[160px] px-[24px] md:px-[63px] pb-[80px] md:pb-[120px]">
        <FadeIn>
          <p className="font-[var(--font-geist-mono)] text-[11px] uppercase tracking-[0.12em] text-foreground/40 mb-[24px]">
            About
          </p>
          <h1 className="font-[var(--font-abhaya)] text-[48px] md:text-[96px] leading-[0.95] tracking-[-0.02em] max-w-[900px]">
            {heading}
          </h1>
        </FadeIn>
      </section>

      {/* About Content */}
      <section className="px-[24px] md:px-[63px] py-[80px] md:py-[120px]">
        <div className="grid grid-cols-1 md:grid-cols-[5fr_3fr] gap-[48px] md:gap-[80px]">
          {/* Left Column - Bio */}
          <FadeIn delay={0.1}>
            <div className="space-y-[32px]">
              {about?.bio ? (
                <div className="section-text leading-[1.55]">
                  <PortableText value={about.bio} />
                </div>
              ) : (
                <div className="section-text leading-[1.55]">
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
                <h3 className="font-[var(--font-geist-mono)] text-[11px] uppercase tracking-[0.12em] text-foreground/40 mb-[16px]">
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
                <h3 className="font-[var(--font-geist-mono)] text-[11px] uppercase tracking-[0.12em] text-foreground/40 mb-[16px]">
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
                <h3 className="font-[var(--font-geist-mono)] text-[11px] uppercase tracking-[0.12em] text-foreground/40 mb-[16px]">
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
          <div className="aspect-[16/9] md:aspect-[21/9] bg-[#acacac] rounded-[2px] overflow-hidden relative">
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

    </main>
  );
}
