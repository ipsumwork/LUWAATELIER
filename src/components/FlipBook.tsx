'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';

// Generate array of page paths
const TOTAL_PAGES = 103;
const pages = Array.from({ length: TOTAL_PAGES }, (_, i) => {
  const pageNum = String(i + 1).padStart(3, '0');
  return `/images/mep/MISEENPLACE_BOK_NYTYPO_Page_${pageNum}.jpg`;
});

export default function FlipBook() {
  const [currentPage, setCurrentPage] = useState(0);
  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set([0]));
  const containerRef = useRef<HTMLDivElement>(null);

  // Preload nearby images
  useEffect(() => {
    const pagesToPreload = [
      currentPage - 2,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      currentPage + 2,
      currentPage + 3,
      currentPage + 4,
      currentPage + 5,
    ].filter((p) => p >= 0 && p < pages.length);

    pagesToPreload.forEach((pageIndex) => {
      if (!loadedPages.has(pageIndex)) {
        const img = new window.Image();
        img.src = pages[pageIndex];
        img.onload = () => {
          setLoadedPages((prev) => new Set([...prev, pageIndex]));
        };
      }
    });
  }, [currentPage, loadedPages]);

  const goToNext = useCallback(() => {
    if (currentPage < pages.length - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [currentPage]);

  const goToPrev = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentPage]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const halfWidth = rect.width / 2;

    if (clickX > halfWidth) {
      goToNext();
    } else {
      goToPrev();
    }
  };

  // Determine which pages to keep mounted (current + nearby for instant switching)
  const pagesToRender = [
    currentPage - 1,
    currentPage,
    currentPage + 1,
  ].filter((p) => p >= 0 && p < pages.length);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black flex items-center justify-center cursor-pointer select-none"
      onClick={handleClick}
    >
      {/* Navigation hint areas */}
      <div className="absolute inset-0 z-10 flex pointer-events-none">
        <div className="w-1/2 h-full flex items-center justify-start pl-6 opacity-0 hover:opacity-100 transition-opacity">
          {currentPage > 0 && (
            <div className="text-white/30">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="rotate-180">
                <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </div>
        <div className="w-1/2 h-full flex items-center justify-end pr-6 opacity-0 hover:opacity-100 transition-opacity">
          {currentPage < pages.length - 1 && (
            <div className="text-white/30">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Page counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 text-white/50 text-xs font-mono tracking-wider">
        {currentPage + 1} / {pages.length}
      </div>

      {/* Images - keep nearby pages mounted but hidden */}
      {pagesToRender.map((pageIndex) => (
        <div
          key={pageIndex}
          className={`absolute inset-0 flex items-center justify-center p-8 transition-opacity duration-75 ${
            pageIndex === currentPage ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <Image
            src={pages[pageIndex]}
            alt={`Page ${pageIndex + 1}`}
            width={800}
            height={1000}
            className="max-h-full w-auto object-contain transition-[filter] duration-200 hover:invert"
            priority={pageIndex <= 2}
          />
        </div>
      ))}
    </div>
  );
}
