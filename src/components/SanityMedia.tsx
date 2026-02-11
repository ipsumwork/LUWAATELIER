'use client';

import Image, { ImageProps } from 'next/image';
import { getSanityImageProps } from '@/sanity/lib/image';
import type { SanityImageExpanded, SanityVideo } from '@/sanity/lib/types';

interface SanityMediaProps extends Omit<ImageProps, 'src' | 'alt'> {
  image?: SanityImageExpanded;
  video?: SanityVideo;
  alt?: string;
}

// Helper to detect if a video/file is a GIF
function isGif(mimeType?: string, url?: string): boolean {
  if (mimeType === 'image/gif') return true;
  if (url?.endsWith('.gif')) return true;
  return false;
}

// Helper to detect if a file is a video
function isVideo(mimeType?: string, url?: string): boolean {
  if (mimeType?.startsWith('video/')) return true;
  if (url?.endsWith('.mp4') || url?.endsWith('.webm') || url?.endsWith('.mov')) return true;
  return false;
}

export function SanityMedia({ image, video, alt, width, fill, className, ...props }: SanityMediaProps) {
  // If video is provided and has an asset, prioritize it
  if (video?.asset?.url) {
    const mimeType = video.asset.mimeType;
    const url = video.asset.url;

    // GIF - render as img tag
    if (isGif(mimeType, url)) {
      if (fill) {
        return (
          <img
            src={url}
            alt={alt || ''}
            className={className}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        );
      }
      return <img src={url} alt={alt || ''} className={className} />;
    }

    // Video - render as video tag
    if (isVideo(mimeType, url)) {
      if (fill) {
        return (
          <video
            src={url}
            autoPlay
            loop
            muted
            playsInline
            className={className}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        );
      }
      return (
        <video
          src={url}
          autoPlay
          loop
          muted
          playsInline
          className={className}
        />
      );
    }
  }

  // Check image prop (can also be a video/gif from galleryImages)
  if (!image?.asset?.url) {
    return null;
  }

  const imageMimeType = image.asset.mimeType;
  const imageUrl = image.asset.url;

  // Check if the "image" is actually a GIF
  if (isGif(imageMimeType, imageUrl)) {
    if (fill) {
      return (
        <img
          src={imageUrl}
          alt={alt || image.alt || ''}
          className={className}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      );
    }
    return <img src={imageUrl} alt={alt || image.alt || ''} className={className} />;
  }

  // Check if the "image" is actually a video
  if (isVideo(imageMimeType, imageUrl)) {
    if (fill) {
      return (
        <video
          src={imageUrl}
          autoPlay
          loop
          muted
          playsInline
          className={className}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      );
    }
    return (
      <video
        src={imageUrl}
        autoPlay
        loop
        muted
        playsInline
        className={className}
      />
    );
  }

  // Regular image
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
      fill={fill}
      className={className}
      {...props}
    />
  );
}
