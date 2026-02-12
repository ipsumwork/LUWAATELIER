'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
}

export function VideoPlayer({ src, poster, title }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const miniProgressRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [hasScrolled, setHasScrolled] = useState(false);

  const controlsTimeoutRef = useRef<NodeJS.Timeout>(undefined);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle scroll to minimize
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > 100 && !hasScrolled && !isMinimized) {
        setHasScrolled(true);
        setIsMinimized(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasScrolled, isMinimized]);

  // Auto-hide controls in fullscreen mode
  useEffect(() => {
    if (!isMinimized && !isClosed) {
      const resetTimer = () => {
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
        setShowControls(true);
        controlsTimeoutRef.current = setTimeout(() => {
          if (isPlaying) setShowControls(false);
        }, 3000);
      };

      resetTimer();
      window.addEventListener('mousemove', resetTimer);
      return () => {
        window.removeEventListener('mousemove', resetTimer);
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
      };
    }
  }, [isPlaying, isMinimized, isClosed]);

  // Update progress from the single video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (!isDragging && video.duration) {
        setCurrentTime(video.currentTime);
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [isDragging]);

  // Play/pause toggle
  const togglePlay = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }, []);

  // Mute toggle
  const toggleMute = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  // Handle progress bar click/drag
  const handleProgressInteraction = useCallback((e: React.MouseEvent | MouseEvent, ref: React.RefObject<HTMLDivElement | null>) => {
    const progressBar = ref.current;
    const video = videoRef.current;
    if (!progressBar || !video || !video.duration) return;

    const rect = progressBar.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = percent * video.duration;

    video.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress(percent * 100);
  }, []);

  // Drag handlers for fullscreen progress
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    handleProgressInteraction(e, progressRef);
  }, [handleProgressInteraction]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleProgressInteraction(e, progressRef);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleProgressInteraction]);

  // Minimize/expand toggle
  const toggleMinimize = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isMinimized) {
      setIsMinimized(false);
      setHasScrolled(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setIsMinimized(true);
    }
  }, [isMinimized]);

  // Close player
  const closePlayer = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsClosed(true);
    const video = videoRef.current;
    if (video) {
      video.pause();
    }
  }, []);

  // Handle mini progress click
  const handleMiniProgressClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    handleProgressInteraction(e, miniProgressRef);
  }, [handleProgressInteraction]);

  if (isClosed) return null;

  return (
    <>
      {/* Single shared video element — rendered in fullscreen layer,
          visible in both states via CSS */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{
          opacity: isMinimized ? 0 : 1,
          pointerEvents: isMinimized ? 'none' : 'auto',
        }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 bg-black"
        style={{ visibility: isMinimized ? 'hidden' : 'visible' }}
      >
        {/* The one and only video element */}
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          className="w-full h-full object-contain cursor-pointer"
          onClick={togglePlay}
          autoPlay
          muted={isMuted}
          loop
          playsInline
        />

        {/* Controls overlay */}
        <motion.div
          initial={false}
          animate={{ opacity: showControls ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 pointer-events-none"
        >
          {/* Top gradient */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/50 to-transparent" />

          {/* Bottom gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent" />

          {/* Title */}
          {title && (
            <div className="absolute top-6 left-6 pointer-events-auto">
              <h2 className="text-white text-lg font-medium">{title}</h2>
            </div>
          )}

          {/* Minimize button */}
          <button
            onClick={toggleMinimize}
            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors pointer-events-auto cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 6L8 11L13 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Bottom controls */}
          <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-auto">
            {/* Progress bar */}
            <div
              ref={progressRef}
              className="relative h-1 bg-white/30 rounded-full cursor-pointer mb-4 group"
              onMouseDown={handleMouseDown}
            >
              {/* Progress fill */}
              <div
                className="absolute top-0 left-0 h-full bg-white rounded-full"
                style={{ width: `${progress}%` }}
              />
              {/* Drag handle */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `calc(${progress}% - 6px)` }}
              />
            </div>

            {/* Control buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Play/Pause */}
                <button
                  onClick={togglePlay}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                >
                  {isPlaying ? (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <rect x="4" y="3" width="4" height="14" rx="1" fill="white"/>
                      <rect x="12" y="3" width="4" height="14" rx="1" fill="white"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M5 3.5L16 10L5 16.5V3.5Z" fill="white"/>
                    </svg>
                  )}
                </button>

                {/* Mute */}
                <button
                  onClick={toggleMute}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                >
                  {isMuted ? (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 4L5 8H2V12H5L10 16V4Z" fill="white"/>
                      <path d="M15 7L19 11M19 7L15 11" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 4L5 8H2V12H5L10 16V4Z" fill="white"/>
                      <path d="M14 7C15.5 8 16 9 16 10C16 11 15.5 12 14 13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M16 5C18.5 6.5 19.5 8 19.5 10C19.5 12 18.5 13.5 16 15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  )}
                </button>

                {/* Time */}
                <span className="text-white/80 text-sm font-mono">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Minimized floating player — renders a canvas-like preview from the same video */}
      <AnimatePresence>
        {isMinimized && (
          <motion.div
            key="mini-player"
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            drag
            dragMomentum={false}
            className="fixed bottom-6 right-6 z-50 w-[320px] rounded-lg overflow-hidden shadow-2xl bg-black group"
            style={{ aspectRatio: '16/9' }}
          >
            {/* Mini video preview — a second video element synced with the main one */}
            <MiniVideoPreview
              src={src}
              mainVideoRef={videoRef}
              isPlaying={isPlaying}
              isMuted={isMuted}
            />

            {/* Mini controls overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Expand button */}
              <button
                onClick={toggleMinimize}
                className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 5V1H5M9 1H13V5M13 9V13H9M5 13H1V9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* Close button */}
              <button
                onClick={closePlayer}
                className="absolute top-2 left-2 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors cursor-pointer"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1 1L11 11M11 1L1 11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>

              {/* Bottom mini controls */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                {/* Mini progress bar */}
                <div
                  ref={miniProgressRef}
                  className="relative h-1 bg-white/30 rounded-full cursor-pointer mb-2"
                  onClick={handleMiniProgressClick}
                >
                  <div
                    className="absolute top-0 left-0 h-full bg-white rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Mini control buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlay}
                    className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    {isPlaying ? (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <rect x="2" y="1" width="3" height="12" rx="1" fill="white"/>
                        <rect x="9" y="1" width="3" height="12" rx="1" fill="white"/>
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M3 1.5L12 7L3 12.5V1.5Z" fill="white"/>
                      </svg>
                    )}
                  </button>

                  <button
                    onClick={toggleMute}
                    className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    {isMuted ? (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M7 2L3.5 5H1V9H3.5L7 12V2Z" fill="white"/>
                        <path d="M10 5L13 8M13 5L10 8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M7 2L3.5 5H1V9H3.5L7 12V2Z" fill="white"/>
                        <path d="M10 5C11 5.7 11.5 6.3 11.5 7C11.5 7.7 11 8.3 10 9" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    )}
                  </button>

                  <span className="text-white/70 text-xs font-mono ml-auto">
                    {formatTime(currentTime)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Mini video preview component that stays synced with the main video.
 * Uses a separate <video> element but continuously syncs currentTime,
 * play/pause state, and mute state with the main player.
 */
function MiniVideoPreview({
  src,
  mainVideoRef,
  isPlaying,
  isMuted,
}: {
  src: string;
  mainVideoRef: React.RefObject<HTMLVideoElement | null>;
  isPlaying: boolean;
  isMuted: boolean;
}) {
  const miniRef = useRef<HTMLVideoElement>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout>(undefined);

  // Sync playback position with main video at regular intervals
  useEffect(() => {
    const sync = () => {
      const main = mainVideoRef.current;
      const mini = miniRef.current;
      if (!main || !mini) return;

      // Only sync if drift is > 0.3s to avoid constant seeking
      const drift = Math.abs(main.currentTime - mini.currentTime);
      if (drift > 0.3) {
        mini.currentTime = main.currentTime;
      }
    };

    // Sync every 500ms
    syncIntervalRef.current = setInterval(sync, 500);
    // Initial sync
    sync();

    return () => {
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    };
  }, [mainVideoRef]);

  // Sync play/pause state
  useEffect(() => {
    const mini = miniRef.current;
    if (!mini) return;

    if (isPlaying) {
      mini.play().catch(() => {});
    } else {
      mini.pause();
    }
  }, [isPlaying]);

  // Sync mute state
  useEffect(() => {
    const mini = miniRef.current;
    if (!mini) return;
    mini.muted = isMuted;
  }, [isMuted]);

  return (
    <video
      ref={miniRef}
      src={src}
      className="w-full h-full object-cover pointer-events-none"
      autoPlay
      muted
      loop
      playsInline
    />
  );
}
