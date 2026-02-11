'use client';

import Link from 'next/link';
import FadeIn from '@/components/FadeIn';
import IntelligenceDiagram from '@/components/IntelligenceDiagram';
import { SanityMedia } from '@/components/SanityMedia';
import { EditableText } from '@/editor/components/editable/EditableText';
import { EditableImage } from '@/editor/components/editable/EditableImage';
import { useEditorStore } from '@/editor/hooks/useEditorStore';
import type { ProjectCard } from '@/sanity/lib/types';

interface ProjectGridProps {
  projects: ProjectCard[];
}

interface ProjectCardContentProps {
  project: ProjectCard;
  isFirst?: boolean;
}

function ProjectCardContent({ project, isFirst }: ProjectCardContentProps) {
  const isEditMode = useEditorStore((state) => state.isEditMode);

  // Check if heroVideo exists (takes precedence over heroImage)
  const hasHeroVideo = project.heroVideo?.asset?.url;
  const hasHeroImage = project.heroImage?.asset?.url;

  // Don't apply exclusion effect on IntelligenceDiagram
  const showsDiagram = isFirst && project.customComponent === 'IntelligenceDiagram';

  const content = (
    <>
      {showsDiagram ? (
        <IntelligenceDiagram />
      ) : hasHeroVideo ? (
        // Render video/gif hero
        <SanityMedia
          video={project.heroVideo}
          alt={project.title}
          fill
          className="object-cover"
        />
      ) : hasHeroImage && project.heroImage ? (
        isEditMode ? (
          <EditableImage
            documentId={project._id}
            documentType="project"
            fieldPath="heroImage"
            image={project.heroImage}
            alt={project.title}
            className="object-cover"
            containerClassName="absolute inset-0"
            defaultConfig={{ width: 100, aspectRatio: isFirst ? '2/1' : '4/3' }}
            fill
          />
        ) : (
          <SanityMedia
            image={project.heroImage}
            alt={project.title}
            fill
            className="object-cover"
          />
        )
      ) : (
        <div className="w-full h-full bg-[#acacac]" />
      )}
      <div
        className={
          isFirst
            ? `absolute top-[31px] left-[17px] z-10${showsDiagram ? '' : ' headline-exclusion'}`
            : 'absolute top-[16px] left-[16px] md:top-0 md:left-[4px] max-w-[90%] z-10 headline-exclusion'
        }
      >
        <span
          className={
            isFirst
              ? 'font-[var(--font-abhaya)] text-[32px] md:text-[56px] leading-none'
              : 'font-[var(--font-abhaya)] text-[28px] md:text-[56px] leading-tight'
          }
        >
          ({project.orderIndex}){' '}
        </span>
        <EditableText
          documentId={project._id}
          documentType="project"
          fieldPath="title"
          value={project.title}
          as="span"
          className={
            isFirst
              ? 'font-[var(--font-abhaya)] text-[32px] md:text-[56px] leading-none'
              : 'font-[var(--font-abhaya)] text-[28px] md:text-[56px] leading-tight'
          }
        />
      </div>
      {isEditMode && (
        <Link
          href={`/projects/${project.slug}`}
          className="absolute bottom-4 right-4 bg-black/80 text-white text-xs px-3 py-2 rounded-full hover:bg-black transition-colors z-20"
          onClick={(e) => e.stopPropagation()}
        >
          {isFirst ? 'Open Project →' : 'Open →'}
        </Link>
      )}
    </>
  );

  const className = isFirst
    ? 'group relative block w-full aspect-[16/9] md:aspect-[2/1] overflow-hidden diagram-transition'
    : 'group relative block aspect-[4/3] overflow-hidden';

  if (isEditMode) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Link href={`/projects/${project.slug}`} className={className}>
      {content}
    </Link>
  );
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  if (!projects || projects.length === 0) {
    return (
      <p className="text-center text-foreground/50 py-20">
        No projects yet. Add projects in the{' '}
        <Link href="/studio" className="underline">
          CMS
        </Link>
        .
      </p>
    );
  }

  const firstProject = projects[0];
  const gridProjects = projects.slice(1);

  return (
    <div className="flex flex-col gap-[22px]">
      {/* Full Width Card */}
      {firstProject && (
        <FadeIn>
          <ProjectCardContent project={firstProject} isFirst />
        </FadeIn>
      )}

      {/* 2x2 Grid - stacks vertically on mobile */}
      {gridProjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[22px]">
          {gridProjects.map((project, index) => (
            <FadeIn key={project._id} delay={0.1 * (index + 1)}>
              <ProjectCardContent project={project} />
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  );
}
