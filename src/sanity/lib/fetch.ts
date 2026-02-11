import { getClient } from './client';
import {
  projectsQuery,
  projectBySlugQuery,
  projectSlugsQuery,
  aboutPageQuery,
  siteConfigQuery,
} from './queries';
import type { Project, ProjectCard, AboutPage, SiteConfig } from './types';

interface FetchOptions {
  preview?: boolean;
  revalidate?: number | false;
}

// Generic fetch function with caching options
async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
  options: FetchOptions = {}
): Promise<T> {
  const { preview = false, revalidate = 60 } = options;
  const client = getClient(preview);

  return client.fetch<T>(query, params, {
    cache: revalidate === false ? 'no-store' : 'force-cache',
    next: {
      revalidate: revalidate === false ? 0 : revalidate,
    },
  });
}

// Fetch all projects for homepage
export async function getProjects(options?: FetchOptions): Promise<ProjectCard[]> {
  return sanityFetch<ProjectCard[]>(projectsQuery, {}, options);
}

// Fetch single project by slug
export async function getProjectBySlug(
  slug: string,
  options?: FetchOptions
): Promise<Project | null> {
  return sanityFetch<Project | null>(projectBySlugQuery, { slug }, options);
}

// Fetch all project slugs for static generation
export async function getProjectSlugs(): Promise<{ slug: string }[]> {
  return sanityFetch<{ slug: string }[]>(projectSlugsQuery, {}, {
    revalidate: 3600, // Revalidate slugs every hour
  });
}

// Fetch about page
export async function getAboutPage(options?: FetchOptions): Promise<AboutPage | null> {
  return sanityFetch<AboutPage | null>(aboutPageQuery, {}, options);
}

// Fetch site configuration
export async function getSiteConfig(options?: FetchOptions): Promise<SiteConfig | null> {
  return sanityFetch<SiteConfig | null>(siteConfigQuery, {}, options);
}
