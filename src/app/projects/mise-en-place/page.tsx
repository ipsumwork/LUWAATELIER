import localFont from "next/font/local";
import { Metadata } from "next";
import { getProjectBySlug } from "@/sanity/lib/fetch";
import { ProjectContent } from "@/components/ProjectContent";
import FontShowcase from "./FontShowcase";

const holesmono = localFont({
  src: "../../../../Typefaces/type/HolesmonoVF.ttf",
  variable: "--font-holesmono",
  display: "swap",
  weight: "100 900",
});

const placemono = localFont({
  src: "../../../../Typefaces/type/PLACEMONOVF.ttf",
  variable: "--font-placemono",
  display: "swap",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Mise en Place | LUWA",
};

export default async function MiseEnPlacePage() {
  const project = await getProjectBySlug("mise-en-place");

  return (
    <div className={`${holesmono.variable} ${placemono.variable}`}>
      {project && <ProjectContent project={project} />}
      <FontShowcase />
    </div>
  );
}
