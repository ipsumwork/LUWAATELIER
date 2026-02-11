import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getProjectBySlug, getProjectSlugs } from '@/sanity/lib/fetch';
import { ProjectContent } from '@/components/ProjectContent';

interface Props {
  params: Promise<{ slug: string }>;
}

// Generate static params for all projects
export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.map((item) => ({ slug: item.slug }));
}

// Generate metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) return { title: 'Project Not Found' };

  return {
    title: `${project.title} | LUWA`,
    description: project.role ? `${project.role} - ${project.year}` : undefined,
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return <ProjectContent project={project} />;
}
