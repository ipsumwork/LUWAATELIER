import { groq } from 'next-sanity';

// Image/file expansion fragment (handles both images and videos)
const imageExpansion = groq`{
  _type,
  asset->{
    _id,
    url,
    mimeType,
    metadata {
      lqip,
      palette { dominant { background } },
      dimensions { width, height, aspectRatio }
    }
  },
  hotspot,
  crop,
  alt,
  caption
}`;

// Video/file expansion fragment (simpler, for standalone video fields)
const videoExpansion = groq`{
  _type,
  asset->{
    _id,
    url,
    mimeType
  }
}`;

// Get all projects for homepage grid
export const projectsQuery = groq`
  *[_type == "project"] | order(orderIndex asc) {
    _id,
    title,
    "slug": slug.current,
    orderIndex,
    heroImage ${imageExpansion},
    heroVideo ${videoExpansion},
    customComponent
  }
`;

// Get single project by slug
export const projectBySlugQuery = groq`
  *[_type == "project" && slug.current == $slug][0] {
    _id,
    _type,
    title,
    "slug": slug.current,
    orderIndex,
    year,
    role,
    tools,
    description,
    processSteps[] {
      _key,
      title,
      description
    },
    heroImage ${imageExpansion},
    heroVideo ${videoExpansion},
    galleryImages[] ${imageExpansion},
    customComponent
  }
`;

// Get all project slugs for generateStaticParams
export const projectSlugsQuery = groq`
  *[_type == "project"] { "slug": slug.current }
`;

// Get about page
export const aboutPageQuery = groq`
  *[_type == "about"][0] {
    _id,
    heading,
    bio,
    services,
    clients,
    portrait ${imageExpansion},
    contactEmail
  }
`;

// Get site configuration
export const siteConfigQuery = groq`
  *[_type == "siteConfig"][0] {
    _id,
    siteName,
    siteDescription,
    contactEmail,
    socialLinks[] {
      _key,
      platform,
      url
    },
    heroBackgroundColor,
    heroMedia {
      asset->{
        url,
        mimeType
      }
    }
  }
`;
