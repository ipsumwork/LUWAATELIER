'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
}

export function VideoPlayer({ src, poster, title }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [isExpanded, setIsExpanded] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const controlsTimeoutRef = useRef<NodeJS.Timeout>(undefined);
  const hasCollapsed = useRef(false);

  const formatTime = (s: number) => {
    if (!isFinite(s) || isNaN(s)) return '0:00';
    return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
  };

  // Autoplay on mount
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  }, []);

  // Collapse on scroll (once)
  useEffect(() => {
    if (!isExpanded) return;
    const onScroll = () => {
      if (window.scrollY > 80 && !hasCollapsed.current) {
        hasCollapsed.current = true;
        setIsExpanded(false);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isExpanded]);

  // Auto-hide controls after 3s
  useEffect(() => {
    const resetTimer = () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      setShowControls(true);
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) setShowControls(false);
      }, 3000);
    };
    resetTimer();
    const el = containerRef.current;
    if (el) {
      el.addEventListener('mousemove', resetTimer);
      el.addEventListener('touchstart', resetTimer, { passive: true });
    }
    return () => {
      if (el) {
        el.removeEventListener('mousemove', resetTimer);
        el.removeEventListener('touchstart', resetTimer);
      }
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying]);

  // Track progress
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => {
      if (!isDragging && v.duration) {
        setCurrentTime(v.currentTime);
        setProgress((v.currentTime / v.duration) * 100);
      }
    };
    const onMeta = () => setDuration(v.duration);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('loadedmetadata', onMeta);
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    return () => {
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('loadedmetadata', onMeta);
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
    };
  }, [isDragging]);

  // Track native fullscreen state
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // Actions
  const togglePlay = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.paused ? v.play() : v.pause();
  }, []);

  const toggleMute = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
  }, []);

  const seekTo = useCallback((e: React.MouseEvent | MouseEvent) => {
    const bar = progressRef.current;
    const v = videoRef.current;
    if (!bar || !v || !v.duration) return;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    v.currentTime = pct * v.duration;
    setCurrentTime(v.currentTime);
    setProgress(pct * 100);
  }, []);

  const collapse = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsExpanded(false);
  }, []);

  const toggleFullscreen = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  // Progress drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    seekTo(e);
  }, [seekTo]);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => seekTo(e);
    const onUp = () => setIsDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isDragging, seekTo]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full bg-black overflow-hidden transition-[height] duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        isExpanded ? 'h-screen' : 'aspect-[16/9] md:aspect-[2.5/1]'
      }`}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="absolute inset-0 w-full h-full object-cover cursor-pointer"
        onClick={togglePlay}
        autoPlay
        muted
        loop
        playsInline
      />

      {/* Controls overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: showControls ? 1 : 0,
          pointerEvents: showControls ? 'auto' : 'none',
        }}
      >
        {/* Top gradient */}
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

        {/* Top bar — title + collapse button (only when expanded) */}
        {isExpanded && (
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
            {title && (
              <h2 className="text-white text-lg font-medium drop-shadow-sm">{title}</h2>
            )}
            <button
              onClick={collapse}
              className="ml-auto w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors cursor-pointer"
              aria-label="Minimize"
            >
              {/* Chevron down */}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 6L8 11L13 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}

        {/* Bottom controls bar */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 pt-2">
          {/* Progress bar */}
          <div
            ref={progressRef}
            className="relative h-[5px] bg-white/25 rounded-full cursor-pointer mb-3 group hover:h-[7px] transition-all"
            onMouseDown={handleMouseDown}
          >
            <div
              className="absolute top-0 left-0 h-full bg-white rounded-full"
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-[14px] h-[14px] bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `calc(${progress}% - 7px)` }}
            />
          </div>

          {/* Button row */}
          <div className="flex items-center gap-2">
            {/* Play / Pause */}
            <button
              onClick={togglePlay}
              className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <rect x="4" y="3" width="5" height="16" rx="1" fill="white"/>
                  <rect x="13" y="3" width="5" height="16" rx="1" fill="white"/>
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M6 3L18 11L6 19V3Z" fill="white"/>
                </svg>
              )}
            </button>

            {/* Mute */}
            <button
              onClick={toggleMute}
              className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M11 4L6 8.5H2V13.5H6L11 18V4Z" fill="white"/>
                  <path d="M16 8L20 12M20 8L16 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M11 4L6 8.5H2V13.5H6L11 18V4Z" fill="white"/>
                  <path d="M15 8C16.5 9 17 10 17 11C17 12 16.5 13 15 14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M17.5 5.5C20 7 21 9 21 11C21 13 20 15 17.5 16.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              )}
            </button>

            {/* Time */}
            <span className="text-white/70 text-sm font-mono tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M7 2V7H2M13 2V7H18M18 13H13V18M2 13H7V18" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M2 7V2H7M13 2H18V7M18 13V18H13M7 18H2V13" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
