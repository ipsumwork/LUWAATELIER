'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function NavBar() {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);
  const visibleRef = useRef(true);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const isHome = pathname === '/' || pathname === '/testing';

  useEffect(() => {
    if (!mounted || isHome) return;

    // Read #smooth-content's CSS transform to detect scroll direction.
    // This bypasses GSAP's normalizeScroll event interception entirely.
    let lastY = 0;
    let rafId: number;

    const tick = () => {
      const content = document.getElementById('smooth-content');
      if (content) {
        const transform = getComputedStyle(content).transform;
        if (transform && transform !== 'none') {
          const m42 = new DOMMatrix(transform).m42; // translateY
          const diff = m42 - lastY;
          if (Math.abs(diff) > 0.1) {
            const shouldShow = diff > 0; // translateY increasing = scrolling up
            if (shouldShow !== visibleRef.current) {
              visibleRef.current = shouldShow;
              setVisible(shouldShow);
            }
            lastY = m42;
          }
        }
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [mounted, isHome]);

  if (!mounted || isHome) return null;

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
  };

  const navBg = isDark ? 'rgba(0, 0, 0, 0.75)' : 'rgba(255, 255, 255, 0.75)';
  const navShadow = isDark
    ? '0 2px 20px rgba(255, 255, 255, 0.06), 0 0 0 1px rgba(255, 255, 255, 0.08)'
    : '0 2px 20px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)';

  return (
    <div
      className="fixed z-50 top-3 left-1/2 h-12 md:h-[52px] w-[calc(100vw-24px)] max-w-[500px] rounded-full flex items-center justify-between px-3 md:px-4 relative"
      style={{
        backgroundColor: navBg,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: navShadow,
        color: isDark ? '#ffffff' : '#000000',
        transform: visible
          ? 'translateX(-50%)'
          : 'translateX(-50%) translateY(calc(-100% - 12px))',
        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <Link
        href="/about"
        className="text-[16px] md:text-[20px] font-medium tracking-tight font-[var(--font-heros)] hover:underline underline-offset-4"
      >
        LUWA
      </Link>

      {/* Yin-yang dark mode toggle — absolutely centered */}
      <button
        onClick={toggleDark}
        className="absolute left-1/2 -translate-x-1/2 cursor-pointer bg-transparent border-none p-0 m-0"
        aria-label="Toggle dark mode"
      >
        <svg width="22" height="22" viewBox="0 0 600 600" fill="currentColor" className="block">
          <path d="M284.666 598.294C282.396 597.553 272.319 596.981 269.251 596.694C263.042 596.102 256.859 595.268 250.716 594.195C213.801 588.017 178.384 574.924 146.327 555.605C79.3843 515.211 30.9322 450.195 11.3576 374.498C-8.49681 297.037 3.52552 214.847 44.7354 146.317C85.1215 79.2098 150.302 30.6994 226.179 11.2793C303.763 -8.53323 386.052 3.6672 454.548 45.1375C521.181 85.5359 569.386 150.376 588.874 225.822C591.95 237.865 594.273 250.087 595.832 262.418C596.301 266.17 596.684 269.933 596.983 273.703C597.247 277.118 597.382 282.04 598.266 285.269V315.207C596.869 320.495 596.764 330.225 596.057 336.131C594.511 348.951 592.141 361.657 588.956 374.173C569.567 449.393 521.676 514.118 455.412 554.656C423.165 574.379 387.461 587.779 350.201 594.145C344.91 595.103 339.587 595.862 334.24 596.419C330.812 596.744 318.804 597.397 316.269 598.294H284.666ZM278.043 589.924L279.493 590.1C280.932 590.439 288.309 590.703 290.215 590.797C287.675 590.032 285.976 589.675 283.362 589.552C281.607 589.323 279.829 589.051 278.074 588.799C236.977 580.634 202.383 554.94 179.184 520.399C157.837 488.615 150.181 457.698 157.715 419.949C165.637 380.803 188.662 346.352 221.803 324.058C242.241 310.37 265.897 302.255 290.434 300.509C304.641 299.595 313.003 300.304 327.481 296.999C384.897 283.891 435.103 230.755 446.863 173.393C453.678 140.139 444.962 103.604 426.288 75.5667C404.052 42.7859 369.736 20.1462 330.85 12.5995C314.778 9.39046 303.224 9.3425 287.127 9.96643C233.798 12.1869 182.131 29.1549 137.87 58.9841C74.378 101.708 30.2897 167.742 15.169 242.762C-0.195145 319.124 15.7138 398.454 59.332 462.989C102.145 526.265 168.135 570.154 243.044 585.178C253.755 587.217 267.116 589.294 278.043 589.924Z" />
        </svg>
      </button>

      <Link
        href="/#projects"
        className="text-[16px] md:text-[20px] font-medium tracking-tight font-[var(--font-heros)] underline underline-offset-4"
      >
        ATELIER
      </Link>
    </div>
  );
}
