import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getWriteClient } from '@/sanity/lib/client';

const SESSION_COOKIE = 'editor_session';

interface PendingChange {
  documentId: string;
  documentType: 'project' | 'about' | 'siteConfig';
  fieldPath: string;
  value: unknown;
}

// Verify session is valid
async function verifySession(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  // In production, verify against stored sessions
  // For simplicity, just check if cookie exists
  return !!session?.value;
}

// Convert dot-notation path to nested object
function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown) {
  const keys = path.split('.');
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current)) {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }

  current[keys[keys.length - 1]] = value;
}

export async function POST(request: NextRequest) {
  // Verify authentication
  const isAuthenticated = await verifySession();
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { changes } = (await request.json()) as { changes: PendingChange[] };

    if (!changes || !Array.isArray(changes) || changes.length === 0) {
      return NextResponse.json({ error: 'No changes to publish' }, { status: 400 });
    }

    const writeClient = getWriteClient();

    // Group changes by document
    const changesByDocument = new Map<string, { type: string; patches: Record<string, unknown> }>();

    for (const change of changes) {
      const existing = changesByDocument.get(change.documentId);
      if (existing) {
        setNestedValue(existing.patches, change.fieldPath, change.value);
      } else {
        const patches: Record<string, unknown> = {};
        setNestedValue(patches, change.fieldPath, change.value);
        changesByDocument.set(change.documentId, {
          type: change.documentType,
          patches,
        });
      }
    }

    // Build and commit transaction
    const transaction = writeClient.transaction();
    const pathsToRevalidate = new Set<string>();

    for (const [documentId, { type, patches }] of changesByDocument) {
      transaction.patch(documentId, (p) => p.set(patches));

      // Track paths to revalidate
      if (type === 'project') {
        pathsToRevalidate.add('/');
        // We'd need the slug to revalidate the specific project page
        // For now, revalidate all project pages
        pathsToRevalidate.add('/projects/[slug]');
      } else if (type === 'about') {
        pathsToRevalidate.add('/about');
      } else if (type === 'siteConfig') {
        pathsToRevalidate.add('/');
        pathsToRevalidate.add('/about');
      }
    }

    // Commit to Sanity
    const result = await transaction.commit();

    // Revalidate affected paths
    for (const path of pathsToRevalidate) {
      try {
        revalidatePath(path);
      } catch (e) {
        console.warn(`Failed to revalidate path ${path}:`, e);
      }
    }

    return NextResponse.json({
      success: true,
      transactionId: result.transactionId,
      documentsUpdated: changesByDocument.size,
      pathsRevalidated: Array.from(pathsToRevalidate),
    });
  } catch (error) {
    console.error('Publish error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to publish changes' },
      { status: 500 }
    );
  }
}
