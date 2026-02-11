import imageUrlBuilder from '@sanity/image-url';
import { client } from './client';
import type { SanityImage, SanityImageExpanded } from './types';

const builder = imageUrlBuilder(client);

export function urlFor(source: SanityImage | SanityImageExpanded) {
  return builder.image(source);
}

// Generate image props for next/image
export function getSanityImageProps(
  image: SanityImageExpanded,
  options: {
    width?: number;
    quality?: number;
  } = {}
) {
  const { width = 1200, quality = 80 } = options;

  return {
    src: urlFor(image).width(width).quality(quality).auto('format').url(),
    blurDataURL: image.asset?.metadata?.lqip,
    placeholder: image.asset?.metadata?.lqip ? ('blur' as const) : ('empty' as const),
  };
}

// Generate srcSet for responsive images
export function getSrcSet(
  image: SanityImageExpanded,
  widths: number[] = [640, 750, 828, 1080, 1200, 1920]
) {
  return widths
    .map((w) => `${urlFor(image).width(w).auto('format').url()} ${w}w`)
    .join(', ');
}
