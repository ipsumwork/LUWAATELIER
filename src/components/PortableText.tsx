import {
  PortableText as PortableTextRenderer,
  PortableTextReactComponents,
} from '@portabletext/react';
import type { PortableTextBlock } from '@portabletext/types';
import { SanityImage } from './SanityImage';

const components: Partial<PortableTextReactComponents> = {
  block: {
    normal: ({ children }) => (
      <p>{children}</p>
    ),
    h2: ({ children }) => (
      <h2>{children}</h2>
    ),
    h3: ({ children }) => (
      <h3>{children}</h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-black/20 pl-[24px] italic my-[32px]">
        {children}
      </blockquote>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    link: ({ children, value }) => (
      <a
        href={value?.href}
        target={value?.blank ? '_blank' : undefined}
        rel={value?.blank ? 'noopener noreferrer' : undefined}
        className="underline underline-offset-4 hover:text-black/60"
      >
        {children}
      </a>
    ),
  },
  types: {
    image: ({ value }) => (
      <figure className="my-[48px]">
        <SanityImage
          image={value}
          alt={value.alt || ''}
          width={1200}
          height={800}
          className="w-full rounded-[8px]"
        />
        {value.caption && (
          <figcaption className="text-[14px] text-black/50 mt-[12px]">
            {value.caption}
          </figcaption>
        )}
      </figure>
    ),
  },
};

interface Props {
  value: PortableTextBlock[];
}

export function PortableText({ value }: Props) {
  if (!value) return null;
  return <PortableTextRenderer value={value} components={components} />;
}
