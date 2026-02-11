"use client";

import { useRef, useEffect } from "react";
import type { SanityImageExpanded } from "@/sanity/lib/types";
import { urlFor } from "@/sanity/lib/image";
import { EditableText } from "@/editor/components/editable/EditableText";
import { EditableImage } from "@/editor/components/editable/EditableImage";
import { useEditorStore } from "@/editor/hooks/useEditorStore";
import CustomModelTraining from "@/components/CustomModelTraining";

// Card media renderer — handles video, gif, and images
function CardMedia({ image }: { image?: SanityImageExpanded }) {
  if (!image?.asset?.url) return <div className="absolute inset-0 w-full h-full bg-[#d9d9d9]" />;

  const assetUrl = image.asset.url;
  const mimeType = (image.asset as { mimeType?: string })?.mimeType || "";
  const isVideo = mimeType.startsWith("video/") ||
    assetUrl.endsWith(".mp4") || assetUrl.endsWith(".webm") || assetUrl.endsWith(".mov");
  const isGif = mimeType === "image/gif" || assetUrl.endsWith(".gif");

  if (isVideo) {
    return (
      <video
        src={assetUrl}
        autoPlay loop muted playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
    );
  }

  if (isGif) {
    return (
      <img src={assetUrl} alt={image.alt || ""} className="absolute inset-0 w-full h-full object-cover" />
    );
  }

  return (
    <img
      src={urlFor(image).quality(100).auto("format").url()}
      alt={image.alt || ""}
      className="absolute inset-0 w-full h-full object-cover"
    />
  );
}

// Card layout config — keeps the same scattered positions
const cardConfigs = [
  { position: { right: "5%", top: "5%" }, size: { width: "47%", maxWidth: "675px" }, zIndex: 5 },
  { position: { left: "25%", top: "30%" }, size: { width: "38%", maxWidth: "470px" }, zIndex: 3 },
  { position: { left: "8%", top: "42%" }, size: { width: "22%", maxWidth: "270px" }, zIndex: 4 },
  { position: { left: "28%", top: "52%" }, size: { width: "22%", maxWidth: "270px" }, zIndex: 5 },
  { position: { left: "48%", top: "62%" }, size: { width: "65%", maxWidth: "810px" }, zIndex: 6 },
  { position: { left: "15%", top: "82%" }, size: { width: "74%", maxWidth: "945px" }, zIndex: 7 },
];

// Section with pinned text + draggable cards
function DraggableCardsSection({
  images,
  documentId,
}: {
  images: (SanityImageExpanded | undefined)[];
  documentId: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyTextRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const isEditMode = useEditorStore((state) => state.isEditMode);

  useEffect(() => {
    let pinTrigger: { kill: () => void } | null = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let draggables: any[] = [];

    const init = async () => {
      const { gsap } = await import("@gsap/index");
      const { ScrollTrigger } = await import("@gsap/ScrollTrigger");
      const { Draggable } = await import("@gsap/Draggable");
      gsap.registerPlugin(ScrollTrigger, Draggable);

      if (!sectionRef.current || !stickyTextRef.current || !cardsContainerRef.current) return;

      // Pin the text
      pinTrigger = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom bottom",
        pin: stickyTextRef.current,
        pinSpacing: false,
      });

      // Make each card draggable
      const cards = cardsContainerRef.current.querySelectorAll("[data-draggable-card]");
      cards.forEach((card, i) => {
        // Bump z-index on drag so the dragged card is always on top
        const d = Draggable.create(card, {
          type: "x,y",
          edgeResistance: 0.65,
          inertia: true,
          cursor: "grab",
          activeCursor: "grabbing",
          zIndexBoost: true,
          onPress() {
            gsap.to(card, { scale: 1.03, boxShadow: "0 8px 40px rgba(0,0,0,0.15)", duration: 0.2 });
          },
          onRelease() {
            gsap.to(card, { scale: 1, boxShadow: "0 4px 20px rgba(0,0,0,0.1)", duration: 0.3 });
          },
        });
        draggables.push(...d);
      });
    };

    init();
    return () => {
      if (pinTrigger) pinTrigger.kill();
      draggables.forEach(d => d.kill());
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-[450vh]">
      {/* Pinned Text */}
      <div ref={stickyTextRef} className="h-screen flex items-center z-0">
        <div className="px-[24px] md:px-[63px] w-[50%] section-text">
          <h2>Scalable Brand Systems</h2>
          <p>
            — Transform static brand guidelines into dynamic, AI-assisted
            libraries that grow with your needs.
          </p>
        </div>
      </div>

      {/* Draggable Cards */}
      <div ref={cardsContainerRef} className="absolute inset-0">
        {cardConfigs.map((cfg, i) => {
          const image = images[i];
          const aspectRatio = image?.asset?.metadata?.dimensions?.aspectRatio || 1;
          const paddingBottom = `${(1 / aspectRatio) * 100}%`;

          return (
            <div
              key={i}
              data-draggable-card
              className="absolute touch-none"
              style={{
                left: cfg.position.left,
                right: cfg.position.right,
                top: cfg.position.top,
                width: cfg.size.width,
                maxWidth: cfg.size.maxWidth,
                zIndex: cfg.zIndex,
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              }}
            >
              {isEditMode && image && (
                <EditableImage
                  documentId={documentId}
                  documentType="project"
                  fieldPath={`galleryImages[${i}]`}
                  image={image}
                  alt={image.alt || ""}
                  className="object-cover"
                  containerClassName="w-full"
                  defaultConfig={{ width: 100, aspectRatio: `${Math.round(aspectRatio * 100) / 100}` }}
                />
              )}
              {!isEditMode && (
                <div className="overflow-hidden">
                  <div className="relative w-full" style={{ paddingBottom }}>
                    <CardMedia image={image} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

interface ParallaxSectionProps {
  galleryImages?: SanityImageExpanded[];
  documentId: string;
}

export default function ParallaxSection({ galleryImages, documentId }: ParallaxSectionProps) {
  const images = galleryImages || [];

  return (
    <>
      {/* Title + Intro Section */}
      <section className="px-[24px] md:px-[63px] py-[60px] md:py-[100px]">
        <div className="w-[50%] section-text">
          <div className="flex items-baseline gap-2 mb-[24px]">
            <span className="font-[var(--font-abhaya)] text-[36px] md:text-[56px] leading-[1.1]">
              (1)
            </span>
            <EditableText
              documentId={documentId}
              documentType="project"
              fieldPath="title"
              value="Intelligence Exploration"
              as="h1"
              className="font-[var(--font-abhaya)] text-[36px] md:text-[56px] leading-[1.1]"
            />
          </div>
          <p>
            Transforming creative workflows through custom AI solutions that
            scale brand consistency without sacrificing creativity. By training
            bespoke AI models on brand DNA, I build systems that generate
            cohesive illustration libraries and expand visual guidelines
            intelligently.
          </p>
        </div>
      </section>

      {/* Scalable Brand Systems - Pinned Text with Draggable Cards */}
      <DraggableCardsSection images={images} documentId={documentId} />

      {/* Custom Model Training Section - Animated */}
      <CustomModelTraining />
    </>
  );
}
