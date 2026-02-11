import Image, { ImageProps } from 'next/image';
import { getSanityImageProps } from '@/sanity/lib/image';
import type { SanityImageExpanded } from '@/sanity/lib/types';

interface SanityImageProps extends Omit<ImageProps, 'src' | 'alt'> {
  image: SanityImageExpanded;
  alt?: string;
}

export function SanityImage({ image, alt, width, ...props }: SanityImageProps) {
  if (!image?.asset?.url) {
    return null;
  }

  const { src, blurDataURL, placeholder } = getSanityImageProps(image, {
    width: typeof width === 'number' ? width : 1200,
  });

  return (
    <Image
      src={src}
      alt={alt || image.alt || ''}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      width={width}
      {...props}
    />
  );
}
