import { createClient } from '@sanity/client';
import { projectId, dataset, apiVersion, useCdn, token } from '../config';

// Client for general use (with CDN in production)
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn,
});

// Client for preview mode (no CDN, with token for drafts)
export const previewClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
  perspective: 'previewDrafts',
});

// Get appropriate client based on preview mode
export function getClient(preview = false) {
  return preview ? previewClient : client;
}

// Client for write operations (server-side only)
// Uses write token from environment variable
export function getWriteClient() {
  const writeToken = process.env.SANITY_API_WRITE_TOKEN;

  if (!writeToken) {
    throw new Error('SANITY_API_WRITE_TOKEN is not configured');
  }

  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token: writeToken,
  });
}
