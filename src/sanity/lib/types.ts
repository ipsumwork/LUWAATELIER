import type { PortableTextBlock } from '@portabletext/types';

// Image with metadata
export interface SanityImage {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
  hotspot?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  crop?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  alt?: string;
  caption?: string;
}

// Expanded image with metadata (after GROQ projection)
export interface SanityImageExpanded {
  _type: 'image' | 'file';
  asset: {
    _id: string;
    url: string;
    mimeType?: string;
    metadata?: {
      lqip?: string;
      palette?: {
        dominant: { background: string };
      };
      dimensions?: {
        width: number;
        height: number;
        aspectRatio: number;
      };
    };
  };
  hotspot?: SanityImage['hotspot'];
  crop?: SanityImage['crop'];
  alt?: string;
  caption?: string;
}

// Video/file asset (simpler, no image metadata)
export interface SanityVideo {
  _type: 'file';
  asset: {
    _id: string;
    url: string;
    mimeType?: string;
  };
}

// Process Step
export interface ProcessStep {
  _key: string;
  title: string;
  description: string;
}

// Social Link
export interface SocialLink {
  _key: string;
  platform: 'instagram' | 'linkedin' | 'twitter' | 'github' | 'behance' | 'dribbble';
  url: string;
}

// Project Document
export interface Project {
  _id: string;
  _type: 'project';
  title: string;
  slug: string;
  orderIndex: number;
  year: number;
  role: string;
  tools: string[];
  description: PortableTextBlock[];
  processSteps: ProcessStep[];
  heroImage?: SanityImageExpanded;
  heroVideo?: SanityVideo;
  galleryImages?: SanityImageExpanded[];
  customComponent?: 'IntelligenceDiagram' | 'FlipBook' | 'none';
}

// Project card (minimal fields for grid)
export interface ProjectCard {
  _id: string;
  title: string;
  slug: string;
  orderIndex: number;
  heroImage?: SanityImageExpanded;
  heroVideo?: SanityVideo;
  customComponent?: string;
}

// About Page Singleton
export interface AboutPage {
  _id: string;
  _type: 'about';
  heading: string;
  bio: PortableTextBlock[];
  services: string[];
  clients: string[];
  portrait?: SanityImageExpanded;
  contactEmail?: string;
}

// Site Configuration Singleton
export interface SiteConfig {
  _id: string;
  _type: 'siteConfig';
  siteName: string;
  siteDescription?: string;
  contactEmail?: string;
  socialLinks?: SocialLink[];
  heroBackgroundColor?: {
    hex: string;
  };
  heroMedia?: {
    asset: {
      url: string;
      mimeType?: string;
    };
  };
}
