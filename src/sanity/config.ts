export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
export const apiVersion = '2024-01-01';

// Use CDN in production for faster reads
export const useCdn = process.env.NODE_ENV === 'production';

// Token for preview mode (server-side only)
export const token = process.env.SANITY_API_READ_TOKEN;
