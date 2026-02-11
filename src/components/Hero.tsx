"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface HeroProps {
  heroMediaUrl?: string;
  heroMediaMime?: string;
  heroBgColor?: string;
}

export default function Hero({ heroMediaUrl, heroMediaMime, heroBgColor }: HeroProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const luwaRef = useRef<HTMLAnchorElement>(null);
  const atelierRef = useRef<HTMLButtonElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const yinYangRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const isAbout = pathname === "/about";

  const isVideo = heroMediaMime?.startsWith("video/");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let collapseTl: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let heroObserver: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let returnObserver: any = null;
    let bobAnimation: { kill: () => void } | null = null;
    let isCollapsed = false;
    let animating = false;
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    let atelierClickHandler: ((e: MouseEvent) => void) | null = null;
    let luwaEnterHandler: (() => void) | null = null;
    let luwaLeaveHandler: (() => void) | null = null;
    let yinYangClickHandler: (() => void) | null = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let scrambleTween: any = null;
    let isDark = document.documentElement.classList.contains("dark");
    let hasEntrance = false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let gsapRef: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let ObserverRef: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let ScrollSmootherRef: any = null;

    const cleanup = () => {
      if (bobAnimation) { bobAnimation.kill(); bobAnimation = null; }
      if (collapseTl) { collapseTl.kill(); collapseTl = null; }
      if (heroObserver) { heroObserver.kill(); heroObserver = null; }
      if (returnObserver) { returnObserver.kill(); returnObserver = null; }
      if (atelierClickHandler && atelierRef.current) {
        atelierRef.current.removeEventListener("click", atelierClickHandler);
        atelierClickHandler = null;
      }
      if (luwaEnterHandler && luwaRef.current) {
        luwaRef.current.removeEventListener("mouseenter", luwaEnterHandler);
        luwaRef.current.removeEventListener("mouseleave", luwaLeaveHandler!);
        luwaEnterHandler = null;
        luwaLeaveHandler = null;
      }
      if (yinYangClickHandler && yinYangRef.current) {
        yinYangRef.current.removeEventListener("click", yinYangClickHandler);
        yinYangClickHandler = null;
      }
      if (scrambleTween) { scrambleTween.kill(); scrambleTween = null; }
    };

    const setup = (gsap: typeof gsapRef, Observer: typeof ObserverRef, ScrollSmoother: typeof ScrollSmootherRef, skipEntrance: boolean) => {
      cleanup();

      if (!heroRef.current || !luwaRef.current || !atelierRef.current) return;

      const isMobile = window.innerWidth < 768;
      const windowWidth = window.innerWidth;
      const minHeight = isMobile ? 48 : 52;
      const navMaxWidth = 500;
      const navMargin = 12;
      const navWidth = Math.min(navMaxWidth, windowWidth - navMargin * 2);
      const navLeft = (windowWidth - navWidth) / 2;
      const navPadding = isMobile ? 12 : 16;

      const wasCollapsed = isCollapsed;
      isCollapsed = false;
      animating = false;

      // Reset to expanded state so measurements are correct
      gsap.set(heroRef.current, {
        height: "100vh", top: 0, left: 0, right: 0,
        borderRadius: 0, boxShadow: "none",
        backgroundColor: heroBgColor || "#acacac",
        backdropFilter: "none", borderBottom: "none",
      });
      gsap.set(luwaRef.current, { x: 0, scale: 1 });
      gsap.set(atelierRef.current, { x: 0, scale: 1 });
      if (mediaRef.current) gsap.set(mediaRef.current, { opacity: 1 });
      if (scrollIndicatorRef.current) gsap.set(scrollIndicatorRef.current, { y: 0 });
      if (yinYangRef.current) gsap.set(yinYangRef.current, { opacity: 0, pointerEvents: "none" });

      const textContainer = luwaRef.current.parentElement;
      if (textContainer) {
        gsap.set(textContainer, { mixBlendMode: "exclusion", color: "#ffffff" });
      }

      // Entrance animation (first load only)
      if (!skipEntrance) {
        gsap.set([luwaRef.current, atelierRef.current], { opacity: 0, y: 20 });
        if (scrollIndicatorRef.current) gsap.set(scrollIndicatorRef.current, { opacity: 0 });

        const entranceTl = gsap.timeline({ delay: 0.3 });
        entranceTl
          .to(luwaRef.current, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" })
          .to(atelierRef.current, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, "-=0.5")
          .to(scrollIndicatorRef.current, { opacity: 0.7, duration: 0.6, ease: "power2.out" }, "-=0.3");

        if (scrollIndicatorRef.current) {
          bobAnimation = gsap.to(scrollIndicatorRef.current, {
            y: 6, duration: 1.5, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1.5,
          });
        }
      } else {
        // After resize: ensure text is visible, no y offset
        gsap.set([luwaRef.current, atelierRef.current], { opacity: 1, y: 0 });
        if (scrollIndicatorRef.current) gsap.set(scrollIndicatorRef.current, { opacity: 0.7 });
        if (scrollIndicatorRef.current) {
          bobAnimation = gsap.to(scrollIndicatorRef.current, {
            y: 6, duration: 1.5, repeat: -1, yoyo: true, ease: "sine.inOut",
          });
        }
      }

      // Measurements (from expanded state)
      const luwaRect = luwaRef.current.getBoundingClientRect();
      const atelierRect = atelierRef.current.getBoundingClientRect();
      const luwaTargetX = (navLeft + navPadding) - luwaRect.left;
      const atelierTargetX = (navLeft + navWidth - navPadding - atelierRect.width) - atelierRect.left;
      const startFontSize = isMobile ? 32 : 50;
      const endFontSize = isMobile ? 16 : 20;
      const scaleRatio = endFontSize / startFontSize;

      // Build collapse timeline
      collapseTl = gsap.timeline({
        paused: true,
        defaults: { duration: 0.8, ease: "power2.inOut" },
        onComplete: () => {
          animating = false;
          isCollapsed = true;
          heroObserver?.disable();
          returnObserver?.enable();
          const smoother = ScrollSmoother.get();
          if (smoother) { smoother.scrollTo(0, false); smoother.paused(false); }
          // Apply dark mode colors if active
          if (isDark && heroRef.current) {
            gsap.set(heroRef.current, {
              backgroundColor: "rgba(0, 0, 0, 0.75)",
              boxShadow: "0 2px 20px rgba(255, 255, 255, 0.06), 0 0 0 1px rgba(255, 255, 255, 0.08)",
            });
            if (textContainer) gsap.set(textContainer, { color: "#ffffff" });
          }
        },
        onReverseComplete: () => {
          animating = false;
          isCollapsed = false;
          heroObserver?.enable();
          returnObserver?.disable();
          const smoother = ScrollSmoother.get();
          if (smoother) { smoother.scrollTo(0, false); smoother.paused(true); }
        },
      });

      collapseTl
        .to(heroRef.current, {
          height: minHeight, top: navMargin, left: navLeft,
          right: windowWidth - navLeft - navWidth, borderRadius: 999,
        }, 0)
        .to(luwaRef.current, { x: luwaTargetX, scale: scaleRatio }, 0)
        .to(atelierRef.current, { x: atelierTargetX, scale: scaleRatio }, 0)
        .to(mediaRef.current, { opacity: 0, duration: 0.6 }, 0)
        .to(scrollIndicatorRef.current, { opacity: 0, duration: 0.3 }, 0)
        .to(yinYangRef.current, { opacity: 1, pointerEvents: "auto", duration: 0.3 }, 0.5)
        .to(heroRef.current, {
          backgroundColor: "rgba(255, 255, 255, 0.75)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 2px 20px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)",
        }, 0)
        .to(textContainer, { color: "#000000", duration: 0.3 }, 0.5);

      collapseTl.call(() => {
        if (textContainer) gsap.set(textContainer, { mixBlendMode: "normal" });
      }, [], 0.5);
      collapseTl.call(() => {
        if (textContainer) gsap.set(textContainer, { mixBlendMode: "exclusion", color: "#ffffff" });
      }, [], 0.01);

      // If was collapsed before resize, snap to collapsed state instantly
      if (wasCollapsed) {
        collapseTl.progress(1, true);
        isCollapsed = true;
        if (isDark && heroRef.current) {
          gsap.set(heroRef.current, {
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            boxShadow: "0 2px 20px rgba(255, 255, 255, 0.06), 0 0 0 1px rgba(255, 255, 255, 0.08)",
          });
          if (textContainer) gsap.set(textContainer, { color: "#ffffff" });
        }
      } else {
        const smoother = ScrollSmoother.get();
        if (smoother) { smoother.scrollTo(0, false); smoother.paused(true); }
      }

      // Observers
      heroObserver = Observer.create({
        type: "wheel,touch,pointer",
        onDown: () => {
          if (!animating && collapseTl) {
            animating = true;
            if (bobAnimation) bobAnimation.kill();
            collapseTl.play();
          }
        },
        tolerance: 10, preventDefault: true,
      });

      returnObserver = Observer.create({
        type: "wheel,touch,pointer",
        onUp: () => {
          if (!animating && collapseTl) {
            const smoother = ScrollSmoother.get();
            if (smoother && smoother.scrollTop() <= 5) {
              animating = true;
              collapseTl.reverse();
            }
          }
        },
        tolerance: 10, preventDefault: false,
      });

      if (isCollapsed) {
        heroObserver.disable();
      } else {
        returnObserver.disable();
      }

      // ATELIER click
      atelierClickHandler = (e: MouseEvent) => {
        if (!isCollapsed && !animating && collapseTl) {
          e.preventDefault();
          animating = true;
          if (bobAnimation) bobAnimation.kill();
          collapseTl.play();
        }
      };
      atelierRef.current.addEventListener("click", atelierClickHandler);

      // LUWA hover scramble → "ABOUT" (only in collapsed state)
      luwaEnterHandler = () => {
        if (!isCollapsed) return;
        if (scrambleTween) scrambleTween.kill();
        scrambleTween = gsap.to(luwaRef.current, {
          duration: 0.4,
          scrambleText: { text: "ABOUT", chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ", speed: 0.6 },
        });
      };
      luwaLeaveHandler = () => {
        if (scrambleTween) scrambleTween.kill();
        scrambleTween = gsap.to(luwaRef.current, {
          duration: 0.3,
          scrambleText: { text: "LUWA", chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ", speed: 0.8 },
        });
      };
      luwaRef.current.addEventListener("mouseenter", luwaEnterHandler);
      luwaRef.current.addEventListener("mouseleave", luwaLeaveHandler);

      // Yin-yang dark mode toggle
      if (yinYangRef.current) {
        yinYangClickHandler = () => {
          isDark = !isDark;
          document.documentElement.classList.toggle("dark", isDark);

          // Rotate the symbol
          gsap.to(yinYangRef.current, { rotation: isDark ? 180 : 0, duration: 0.5, ease: "power2.inOut" });

          // Update collapsed navbar colors
          if (isCollapsed && heroRef.current) {
            gsap.to(heroRef.current, {
              backgroundColor: isDark ? "rgba(0, 0, 0, 0.75)" : "rgba(255, 255, 255, 0.75)",
              boxShadow: isDark
                ? "0 2px 20px rgba(255, 255, 255, 0.06), 0 0 0 1px rgba(255, 255, 255, 0.08)"
                : "0 2px 20px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)",
              duration: 0.4,
            });
            if (textContainer) {
              gsap.to(textContainer, {
                color: isDark ? "#ffffff" : "#000000",
                duration: 0.3,
              });
            }
          }
        };
        yinYangRef.current.addEventListener("click", yinYangClickHandler);
      }
    };

    const initAnimation = async () => {
      const { gsap } = await import("@gsap/index");
      const { Observer } = await import("@gsap/Observer");
      const { ScrollSmoother } = await import("@gsap/ScrollSmoother");
      const { ScrambleTextPlugin } = await import("@gsap/ScrambleTextPlugin");
      gsap.registerPlugin(Observer, ScrambleTextPlugin);

      gsapRef = gsap;
      ObserverRef = Observer;
      ScrollSmootherRef = ScrollSmoother;

      setup(gsap, Observer, ScrollSmoother, false);
      hasEntrance = true;
    };

    const onResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (gsapRef && ObserverRef && ScrollSmootherRef) {
          setup(gsapRef, ObserverRef, ScrollSmootherRef, true);
        }
      }, 200);
    };

    const initTimeout = setTimeout(initAnimation, 100);
    window.addEventListener("resize", onResize);

    return () => {
      clearTimeout(initTimeout);
      if (resizeTimer) clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      cleanup();
    };
  }, [mounted]);

  const heroContent = (
    <div
      ref={heroRef}
      className="fixed h-screen z-50 flex items-center justify-center overflow-hidden"
      style={{
        backgroundColor: heroBgColor || "#acacac",
        top: 0,
        left: 0,
        right: 0,
        borderRadius: 0,
        boxShadow: "none",
      }}
    >
      {/* Background media */}
      {heroMediaUrl && (
        <div ref={mediaRef} className="absolute inset-0">
          {isVideo ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            >
              <source src={heroMediaUrl} type={heroMediaMime} />
            </video>
          ) : (
            <img
              src={heroMediaUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          )}
        </div>
      )}

      {/* Text overlay with exclusion blend */}
      <div className="group flex items-center gap-6 md:gap-8 relative z-10 headline-exclusion">
        <Link
          ref={luwaRef}
          href="/about"
          className="peer text-[32px] md:text-[50px] font-medium tracking-tight hover:underline underline-offset-4 origin-center font-[var(--font-heros)] transition-opacity duration-200"
          style={{ opacity: 0 }}
        >
          LUWA
        </Link>
        <button
          ref={atelierRef}
          className={`text-[32px] md:text-[50px] font-medium tracking-tight underline-offset-4 origin-center font-[var(--font-heros)] transition-opacity duration-200 cursor-pointer bg-transparent border-none p-0 m-0 ${isAbout ? "no-underline" : "underline peer-hover:no-underline"}`}
          style={{ opacity: 0 }}
        >
          ATELIER
        </button>
      </div>

      {/* Yin-yang dark mode toggle */}
      <button
        ref={yinYangRef}
        className="absolute z-20 cursor-pointer bg-transparent border-none p-0 m-0"
        style={{ opacity: 0, top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
        aria-label="Toggle dark mode"
      >
        <svg width="22" height="22" viewBox="0 0 600 600" fill="currentColor" className="block">
          <path d="M284.666 598.294C282.396 597.553 272.319 596.981 269.251 596.694C263.042 596.102 256.859 595.268 250.716 594.195C213.801 588.017 178.384 574.924 146.327 555.605C79.3843 515.211 30.9322 450.195 11.3576 374.498C-8.49681 297.037 3.52552 214.847 44.7354 146.317C85.1215 79.2098 150.302 30.6994 226.179 11.2793C303.763 -8.53323 386.052 3.6672 454.548 45.1375C521.181 85.5359 569.386 150.376 588.874 225.822C591.95 237.865 594.273 250.087 595.832 262.418C596.301 266.17 596.684 269.933 596.983 273.703C597.247 277.118 597.382 282.04 598.266 285.269V315.207C596.869 320.495 596.764 330.225 596.057 336.131C594.511 348.951 592.141 361.657 588.956 374.173C569.567 449.393 521.676 514.118 455.412 554.656C423.165 574.379 387.461 587.779 350.201 594.145C344.91 595.103 339.587 595.862 334.24 596.419C330.812 596.744 318.804 597.397 316.269 598.294H284.666ZM278.043 589.924L279.493 590.1C280.932 590.439 288.309 590.703 290.215 590.797C287.675 590.032 285.976 589.675 283.362 589.552C281.607 589.323 279.829 589.051 278.074 588.799C236.977 580.634 202.383 554.94 179.184 520.399C157.837 488.615 150.181 457.698 157.715 419.949C165.637 380.803 188.662 346.352 221.803 324.058C242.241 310.37 265.897 302.255 290.434 300.509C304.641 299.595 313.003 300.304 327.481 296.999C384.897 283.891 435.103 230.755 446.863 173.393C453.678 140.139 444.962 103.604 426.288 75.5667C404.052 42.7859 369.736 20.1462 330.85 12.5995C314.778 9.39046 303.224 9.3425 287.127 9.96643C233.798 12.1869 182.131 29.1549 137.87 58.9841C74.378 101.708 30.2897 167.742 15.169 242.762C-0.195145 319.124 15.7138 398.454 59.332 462.989C102.145 526.265 168.135 570.154 243.044 585.178C253.755 587.217 267.116 589.294 278.043 589.924Z" />
        </svg>
      </button>

      {/* Scroll indicator */}
      <div
        ref={scrollIndicatorRef}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0"
      >
        <span
          className="text-[11px] uppercase tracking-[0.2em] font-[var(--font-heros)]"
          style={{ color: heroMediaUrl ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)" }}
        >
          Scroll
        </span>
        <div
          className="w-px h-8"
          style={{ backgroundColor: heroMediaUrl ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)" }}
        />
      </div>
    </div>
  );

  // Portal to render outside ScrollSmoother's transformed container
  if (!mounted) return null;

  return createPortal(heroContent, document.body);
}
