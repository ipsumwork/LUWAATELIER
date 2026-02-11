'use client';

import { useEffect, useRef, useLayoutEffect } from 'react';

// Use layout effect on client, regular effect on server
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface SmoothScrollProps {
  children: React.ReactNode;
}

export function SmoothScroll({ children }: SmoothScrollProps) {
  const smootherRef = useRef<ScrollSmootherInstance | null>(null);

  useIsomorphicLayoutEffect(() => {
    let smoother: ScrollSmootherInstance | null = null;

    const initSmoother = async () => {
      // Dynamic import GSAP modules (client-side only)
      const { gsap } = await import('@gsap/index');
      const { ScrollTrigger } = await import('@gsap/ScrollTrigger');
      const { ScrollSmoother } = await import('@gsap/ScrollSmoother');

      // Register plugins
      gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

      // Create smoother
      smoother = ScrollSmoother.create({
        wrapper: '#smooth-wrapper',
        content: '#smooth-content',
        smooth: 1.5, // Duration of smoothing (higher = more smooth, slower catch-up)
        effects: true, // Enable data-speed and data-lag effects
        smoothTouch: 0.1, // Light smoothing on touch devices
        normalizeScroll: true, // Prevents jerky scrolling on some devices
        ignoreMobileResize: true, // Ignore resizes from mobile address bar
      });

      smootherRef.current = smoother;
    };

    initSmoother();

    return () => {
      if (smoother) {
        smoother.kill();
      }
    };
  }, []);

  return (
    <div id="smooth-wrapper">
      <div id="smooth-content">
        {children}
      </div>
    </div>
  );
}
