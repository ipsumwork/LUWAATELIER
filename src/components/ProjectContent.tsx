'use client';

import { useEffect, useRef } from 'react';
import { EditableText } from '@/editor/components/editable/EditableText';
import { EditableImage } from '@/editor/components/editable/EditableImage';
import { useEditorStore } from '@/editor/hooks/useEditorStore';
import { SanityMedia } from '@/components/SanityMedia';
import { PortableText } from '@/components/PortableText';
import { VideoPlayer } from '@/components/VideoPlayer';
import IntelligenceDiagram from '@/components/IntelligenceDiagram';
import FlipBook from '@/components/FlipBook';
import type { Project } from '@/sanity/lib/types';

interface ProjectContentProps {
  project: Project;
}

export function ProjectContent({ project }: ProjectContentProps) {
  const isEditMode = useEditorStore((state) => state.isEditMode);
  const gridRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLDivElement>(null);

  // Replace CSS sticky with ScrollTrigger pin (CSS sticky breaks inside ScrollSmoother)
  useEffect(() => {
    let pinTrigger: { kill: () => void } | null = null;

    const initPin = async () => {
      const { gsap } = await import('@gsap/index');
      const { ScrollTrigger } = await import('@gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      if (!gridRef.current || !descRef.current) return;

      // Only pin on desktop (md+)
      if (window.innerWidth < 768) return;

      pinTrigger = ScrollTrigger.create({
        trigger: gridRef.current,
        start: 'top 40px',
        end: 'bottom bottom',
        pin: descRef.current,
        pinSpacing: false,
      });
    };

    initPin();
    return () => { if (pinTrigger) pinTrigger.kill(); };
  }, []);
  const showCustomDiagram = project.customComponent === 'IntelligenceDiagram';
  const showFlipBook = project.customComponent === 'FlipBook';

  // Check if heroVideo exists (takes precedence over heroImage)
  const hasHeroVideo = project.heroVideo?.asset?.url;
  const hasHeroImage = project.heroImage?.asset?.url;

  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* Floating Video Player */}
      {hasHeroVideo && project.heroVideo?.asset?.url && (
        <VideoPlayer
          src={project.heroVideo.asset.url}
          title={project.title}
        />
      )}

      {/* Hero with diagram, flipbook, video, or image */}
      <section className="w-full">
        <div className={`relative w-full overflow-hidden diagram-transition ${
          showFlipBook ? 'h-screen' : 'aspect-[16/9] md:aspect-[2.5/1]'
        }`}>
          {showFlipBook ? (
            <FlipBook />
          ) : showCustomDiagram ? (
            <IntelligenceDiagram />
          ) : hasHeroVideo ? (
            // Render video/gif hero (static background when player is minimized)
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
                containerClassName="w-full h-full"
                defaultConfig={{ width: 100, aspectRatio: '16/9' }}
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
        </div>
      </section>

      {/* Content Section */}
      <section className="px-[24px] md:px-[63px] py-[40px] md:py-[60px]">
        {/* Title */}
        <div className="flex items-baseline gap-2 mb-[32px] md:mb-[48px]">
          <span className="font-[var(--font-abhaya)] text-[36px] md:text-[56px] leading-[1.1]">
            ({project.orderIndex})
          </span>
          <EditableText
            documentId={project._id}
            documentType="project"
            fieldPath="title"
            value={project.title}
            as="h1"
            className="font-[var(--font-abhaya)] text-[36px] md:text-[56px] leading-[1.1]"
          />
        </div>

        {/* Two Column Layout - Description + Images */}
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 gap-[40px] md:gap-[80px] items-start">
          {/* Left Column - Description (Pinned via ScrollTrigger) */}
          <div ref={descRef} className="section-text">
            {project.description && <PortableText value={project.description} />}
          </div>

          {/* Right Column - Vertical Image Stack */}
          <div className="flex flex-col gap-[16px] md:gap-[24px]">
            {project.galleryImages && project.galleryImages.length > 0 ? (
              project.galleryImages.map((image, i) => (
                <div key={i} className="relative">
                  {isEditMode ? (
                    <EditableImage
                      documentId={project._id}
                      documentType="project"
                      fieldPath={`galleryImages[${i}]`}
                      image={image}
                      alt={image.alt || `Gallery image ${i + 1}`}
                      className="object-cover"
                      containerClassName="w-full"
                      defaultConfig={{ width: 100, aspectRatio: '4/3' }}
                    />
                  ) : (
                    <div className="relative w-full aspect-[4/3] bg-[#d9d9d9] overflow-hidden">
                      <SanityMedia
                        image={image}
                        alt={image.alt || `Gallery image ${i + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              ))
            ) : (
              // Placeholder images if no gallery
              <>
                <div className="w-full aspect-[4/3] bg-[#d9d9d9]" />
                <div className="w-full aspect-[4/3] bg-[#d9d9d9]" />
                <div className="w-full aspect-[4/3] bg-[#d9d9d9]" />
                <div className="w-full aspect-[4/3] bg-[#d9d9d9]" />
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
