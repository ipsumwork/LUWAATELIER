declare module '@gsap/index' {
  export const gsap: GSAP;
  export default gsap;
}

declare module '@gsap/ScrollTrigger' {
  const ScrollTrigger: ScrollTriggerStatic;
  export { ScrollTrigger };
  export default ScrollTrigger;
}

declare module '@gsap/ScrollSmoother' {
  const ScrollSmoother: ScrollSmootherStatic;
  export { ScrollSmoother };
  export default ScrollSmoother;
}

interface GSAP {
  registerPlugin(...plugins: unknown[]): void;
  to(target: GSAPTarget, vars: GSAPVars): GSAPTween;
  from(target: GSAPTarget, vars: GSAPVars): GSAPTween;
  fromTo(target: GSAPTarget, fromVars: GSAPVars, toVars: GSAPVars): GSAPTween;
  set(target: GSAPTarget, vars: GSAPVars): GSAPTween;
  timeline(vars?: GSAPVars): GSAPTimeline;
  ticker: {
    add(callback: () => void): void;
    remove(callback: () => void): void;
  };
}

interface GSAPTween {
  kill(): void;
  pause(): void;
  play(): void;
  progress(value?: number): number;
}

interface GSAPTimeline extends GSAPTween {
  to(target: GSAPTarget, vars: GSAPVars, position?: string | number): GSAPTimeline;
  from(target: GSAPTarget, vars: GSAPVars, position?: string | number): GSAPTimeline;
  fromTo(target: GSAPTarget, fromVars: GSAPVars, toVars: GSAPVars, position?: string | number): GSAPTimeline;
}

interface GSAPVars {
  [key: string]: unknown;
  duration?: number;
  ease?: string;
  delay?: number;
  onComplete?: () => void;
  scrollTrigger?: ScrollTriggerVars;
}

interface ScrollTriggerSelf {
  progress: number;
  direction: number;
  isActive: boolean;
}

interface ScrollTriggerVars {
  trigger?: GSAPTarget;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  pin?: boolean | GSAPTarget;
  pinSpacing?: boolean | string;
  pinnedContainer?: GSAPTarget;
  markers?: boolean;
  onEnter?: () => void;
  onLeave?: () => void;
  onEnterBack?: () => void;
  onLeaveBack?: () => void;
  onUpdate?: (self: ScrollTriggerSelf) => void;
  onToggle?: (self: ScrollTriggerSelf) => void;
  onRefresh?: (self: ScrollTriggerSelf) => void;
}

interface ScrollTriggerStatic {
  create(vars: ScrollTriggerVars): ScrollTriggerInstance;
  refresh(): void;
  update(): void;
  getAll(): ScrollTriggerInstance[];
  killAll(): void;
  scrollerProxy(scroller: GSAPTarget, vars: unknown): void;
}

interface ScrollTriggerInstance {
  kill(): void;
  refresh(): void;
  disable(): void;
  enable(): void;
}

interface ScrollSmootherStatic {
  create(vars: ScrollSmootherVars): ScrollSmootherInstance;
  get(): ScrollSmootherInstance | null;
}

interface ScrollSmootherVars {
  wrapper?: string | Element;
  content?: string | Element;
  smooth?: number;
  effects?: boolean;
  smoothTouch?: number | boolean;
  normalizeScroll?: boolean;
  ignoreMobileResize?: boolean;
}

interface ScrollSmootherInstance {
  kill(): void;
  paused(value?: boolean): boolean;
  scrollTo(target: GSAPTarget | number, smooth?: boolean): void;
  scrollTop(value?: number): number;
  progress(value?: number): number;
}

type GSAPTarget = string | Element | Element[] | NodeList | null;
