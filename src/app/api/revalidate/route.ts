import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

// Webhook payload from Sanity
interface SanityWebhookPayload {
  _type: string;
  slug?: { current: string };
}

export async function POST(req: NextRequest) {
  try {
    const body: SanityWebhookPayload = await req.json();

    if (!body?._type) {
      return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
    }

    // Revalidate based on document type
    switch (body._type) {
      case 'project':
        // Revalidate homepage and specific project page
        revalidatePath('/');
        if (body.slug?.current) {
          revalidatePath(`/projects/${body.slug.current}`);
        }
        break;
      case 'about':
        revalidatePath('/about');
        break;
      case 'siteConfig':
        // Site config affects all pages
        revalidatePath('/', 'layout');
        break;
      default:
        // Revalidate all on unknown types
        revalidatePath('/', 'layout');
    }

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      type: body._type,
    });
  } catch (err) {
    console.error('Revalidation error:', err);
    return NextResponse.json({ error: 'Error revalidating' }, { status: 500 });
  }
}
