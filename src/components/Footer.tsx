import Link from "next/link";
import type { SiteConfig } from "@/sanity/lib/types";

interface FooterProps {
  siteConfig?: SiteConfig | null;
}

export default function Footer({ siteConfig }: FooterProps) {
  const contactEmail = siteConfig?.contactEmail || "hello@luwa.design";
  const socialLinks = siteConfig?.socialLinks || [];

  const instagram = socialLinks.find((l) => l.platform === "instagram");
  const linkedin = socialLinks.find((l) => l.platform === "linkedin");

  return (
    <footer className="px-[23px] pt-[60px] md:pt-[80px] pb-0 bg-[var(--background)]">
      {/* Contact Grid */}
      <div className="flex flex-col md:flex-row md:justify-between gap-[40px] md:gap-0 mb-[80px] md:mb-[104px]">
        {/* Left - Tagline */}
        <p className="text-[28px] md:text-[50px] font-bold leading-tight">
          SHOP OPEN 9-5
        </p>

        {/* Right - Two Columns */}
        <div className="flex gap-[60px] md:gap-[89px]">
          {/* Online Column */}
          <div className="flex flex-col text-[28px] md:text-[50px] font-bold leading-tight">
            <span>ONLINE</span>
            {contactEmail && (
              <a href={`mailto:${contactEmail}`} className="hover:underline underline-offset-4">
                E-MAIL
              </a>
            )}
            {linkedin && (
              <a href={linkedin.url} target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-4">
                LINKEDIN
              </a>
            )}
            {instagram && (
              <a href={instagram.url} target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-4">
                INSTA
              </a>
            )}
          </div>

          {/* Offline Column */}
          <div className="flex flex-col text-[28px] md:text-[50px] font-bold leading-tight">
            <span>OFFLINE</span>
            <span>L.WANELOF</span>
            <span>(+46)</span>
          </div>
        </div>
      </div>

      {/* Large Brand Name - SVG scales to fill container width exactly */}
      <svg viewBox="0 0 100 15" className="w-full block" preserveAspectRatio="none" aria-label="LUWA ATELIER">
        <text
          x="0"
          y="12"
          textLength="100"
          lengthAdjust="spacing"
          className="font-medium"
          style={{ fontSize: '14px', fill: 'currentColor' }}
        >
          LUWA ATELIER
        </text>
      </svg>
    </footer>
  );
}
