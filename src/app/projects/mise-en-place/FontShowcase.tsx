"use client";

import { useState, useRef, useEffect } from "react";

type FontId = "holesmono" | "placemono";

const FONTS: Record<FontId, { label: string; shortLabel: string; cssVar: string; filename: string }> = {
  holesmono: {
    label: "Holesmono",
    shortLabel: "Holes",
    cssVar: "var(--font-holesmono)",
    filename: "HolesmonoVF.ttf",
  },
  placemono: {
    label: "Placemono",
    shortLabel: "Place",
    cssVar: "var(--font-placemono)",
    filename: "PLACEMONOVF.ttf",
  },
};


const WEIGHT_LABELS: Record<number, string> = {
  100: "Thin",
  200: "Extra Light",
  300: "Light",
  400: "Regular",
  500: "Medium",
  600: "Semi Bold",
  700: "Bold",
  800: "Extra Bold",
  900: "Black",
};

// Full printable ASCII + selected Latin Extended
const GLYPHS: string[] = [
  "A","Á","Â","Ä","À","Å","Ã","Ā","Ą",
  "B","C","Ç","Ć","Č","D","Ð","E","É","Ê","Ë","È","Ē","Ę",
  "F","G","H","I","Í","Î","Ï","Ì","Ī","J","K","L","Ł",
  "M","N","Ñ","Ń","O","Ó","Ô","Ö","Ò","Ø","Õ","P","Q",
  "R","S","Š","Ś","T","U","Ú","Û","Ü","Ù","Ū","V","W","X","Y","Ý","Z","Ž","Ź",
  "a","á","â","ä","à","å","ã","ā","ą",
  "b","c","ç","ć","č","d","ð","e","é","ê","ë","è","ē","ę",
  "f","g","h","i","í","î","ï","ì","ī","j","k","l","ł",
  "m","n","ñ","ń","o","ó","ô","ö","ò","ø","õ","p","q",
  "r","s","š","ś","t","u","ú","û","ü","ù","ū","v","w","x","y","ý","z","ž","ź",
  "0","1","2","3","4","5","6","7","8","9",
  "!",'"',"#","$","%","&","'","(",")","*","+",",","-",".","/",
  ":",";"," <","=",">"," ?","@","[","\\","]","^","_","`","{","|","}","~",
];

const SPECIMEN_WEIGHTS = [100, 200, 300, 400, 500, 600, 700, 800, 900];

const MONO = "font-[var(--font-geist-mono)] text-[11px] uppercase tracking-[0.12em]";

// Fallback font size before metrics are computed
const GLYPH_SIZE = 360;

interface FontMetrics {
  glyphSize: number;    // px: computed to fill the panel
  charTop: number;      // px: character element top (em-box top = TOP_GAP)
  capHeightY: number;   // px: guide position
  xHeightY: number;
  baselineY: number;
  descenderY: number;
  capHeightVal: number; // display values in ~UPM units
  xHeightVal: number;
  descenderVal: number;
}

export default function FontShowcase() {
  const [activeFont, setActiveFont] = useState<FontId>("holesmono");
  const [selectedGlyph, setSelectedGlyph] = useState("H");
  const [activeMode, setActiveMode] = useState<"solid" | "anchors">("solid");
  const [weight, setWeight] = useState(400);
  const [size, setSize] = useState(48);
  const [supportedGlyphs, setSupportedGlyphs] = useState<Set<string> | null>(null);
  const [metrics, setMetrics] = useState<FontMetrics | null>(null);
  const playgroundRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);

  const font = FONTS[activeFont];

  useEffect(() => {
    if (playgroundRef.current) {
      playgroundRef.current.textContent =
        "The quick brown fox jumps over the lazy dog.";
    }
  }, []);

  // Detect supported glyphs + measure real font metrics in one pass.
  // Monospaced fonts: all supported glyphs share the same advance width.
  // Unsupported glyphs fall back to a system font with a different width.
  useEffect(() => {
    setSupportedGlyphs(null);
    setMetrics(null);
    const detect = async () => {
      if (!containerRef.current) return;
      await document.fonts.ready;

      // Resolve CSS variable to actual font-family name in the component's scope
      const probe = document.createElement("span");
      probe.style.cssText =
        `font-family: ${font.cssVar}; font-size: 0px; position: absolute; visibility: hidden;`;
      containerRef.current.appendChild(probe);
      const resolvedFamily = getComputedStyle(probe).fontFamily;
      containerRef.current.removeChild(probe);

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx || !resolvedFamily) {
        setSupportedGlyphs(new Set(GLYPHS));
        return;
      }

      // ── Glyph support detection at 64px ──────────────────
      ctx.font = `400 64px ${resolvedFamily}`;
      const refWidth = ctx.measureText("A").width;
      if (refWidth === 0) {
        setSupportedGlyphs(new Set(GLYPHS));
        return;
      }
      const supported = new Set<string>();
      for (const glyph of GLYPHS) {
        const w = ctx.measureText(glyph).width;
        if (w > 0 && Math.abs(w - refWidth) / refWidth < 0.08) {
          supported.add(glyph);
        }
      }
      setSupportedGlyphs(supported);

      // ── Dynamic font sizing: fill the panel height ───────
      const pH = leftPanelRef.current?.clientHeight ?? 600;
      const TOP_GAP = 16; // px breathing room at top of panel

      // Pass 1: probe at 100px to get font ratios
      ctx.font = `400 100px ${resolvedFamily}`;
      const capH100 = ctx.measureText("H").actualBoundingBoxAscent;
      const desc100 = ctx.measureText("g").actualBoundingBoxDescent;
      const rawFba100 = ctx.measureText("H").fontBoundingBoxAscent ?? 0;
      // Same clamp as before: broken OS/2 values on display/variable fonts
      const fba100 = rawFba100 > capH100
        ? Math.min(rawFba100, capH100 * 1.35)
        : capH100 * 1.18;

      // Compute size so (fba + desc) fills (pH − TOP_GAP) exactly:
      // em-box top at TOP_GAP, descender flush with panel bottom
      const totalSpan100 = fba100 + desc100;
      const optSize = totalSpan100 > 0
        ? Math.floor((pH - TOP_GAP) * 100 / totalSpan100)
        : GLYPH_SIZE;

      // Pass 2: measure at optSize for pixel-accurate guide positions
      ctx.font = `400 ${optSize}px ${resolvedFamily}`;
      const Hm = ctx.measureText("H");
      const xm = ctx.measureText("x");
      const gm = ctx.measureText("g");

      const capH = Hm.actualBoundingBoxAscent;
      const rawFba = Hm.fontBoundingBoxAscent ?? 0;
      const fba = rawFba > capH ? Math.min(rawFba, capH * 1.35) : capH * 1.18;
      const xH   = xm.actualBoundingBoxAscent;
      const desc = gm.actualBoundingBoxDescent;
      const scale = 1000 / optSize;

      // charTop = TOP_GAP: em-box starts TOP_GAP px from panel top.
      // baseline (bY) = TOP_GAP + fba, descenderY = bY + desc ≈ pH.
      const bY = Math.round(TOP_GAP + fba);

      setMetrics({
        glyphSize:    optSize,
        charTop:      TOP_GAP,
        capHeightY:   bY - capH,
        xHeightY:     bY - xH,
        baselineY:    bY,
        descenderY:   bY + desc,
        capHeightVal: Math.round(capH  * scale),
        xHeightVal:   Math.round(xH   * scale),
        descenderVal: -Math.round(desc * scale),
      });
    };
    detect();
  }, [activeFont, font.cssVar]);

  // If the selected glyph isn't in the new font, reset to first supported one
  useEffect(() => {
    if (supportedGlyphs && !supportedGlyphs.has(selectedGlyph)) {
      const first = GLYPHS.find((g) => supportedGlyphs.has(g));
      if (first) setSelectedGlyph(first);
    }
  }, [supportedGlyphs, selectedGlyph]);

  const visibleGlyphs = supportedGlyphs
    ? GLYPHS.filter((g) => supportedGlyphs.has(g))
    : GLYPHS;

  return (
    <div ref={containerRef} className="bg-[#0A0A0A] text-white">

      {/* ── Section header ───────────────────────────────── */}
      <div className="px-[24px] md:px-[63px] pt-[80px] md:pt-[120px] pb-[56px] border-b border-white/[0.08]">
        <p className={`${MONO} text-white/40 mb-[32px]`}>Typeface</p>
        <div className="flex justify-center mb-[48px]">
          {/* Pill switcher */}
          <div
            className="inline-flex items-center p-[4px] rounded-full"
            style={{
              backgroundColor: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {(Object.keys(FONTS) as FontId[]).map((id) => (
              <button
                key={id}
                onClick={() => setActiveFont(id)}
                className={`rounded-full px-[20px] py-[8px] transition-all duration-200 ${
                  activeFont === id
                    ? "bg-white text-[#0A0A0A]"
                    : "text-white/40 hover:text-white/70"
                }`}
                style={{
                  fontFamily: FONTS[id].cssVar,
                  fontSize: "clamp(13px, 1.1vw, 16px)",
                }}
              >
                {FONTS[id].shortLabel}
              </button>
            ))}
          </div>
        </div>
        <h2
          className="leading-[0.9] tracking-[-0.02em]"
          style={{
            fontFamily: font.cssVar,
            fontWeight: 400,
            fontSize: "clamp(48px, 9vw, 120px)",
          }}
        >
          {font.label}.
        </h2>
      </div>

      {/* ── Glyph Inspector ──────────────────────────────── */}
      <div>
        {/* Top bar: Solid / Anchors */}
        <div className="flex items-center gap-[1px] px-[24px] md:px-[63px] pt-[24px] pb-[16px]">
          {(["solid", "anchors"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setActiveMode(mode)}
              className={`flex items-center gap-[6px] ${MONO} px-[12px] py-[6px] transition-all duration-200 ${
                activeMode === mode
                  ? "bg-white/10 text-white border-b border-white"
                  : "text-white/30 hover:text-white/60"
              }`}
            >
              {mode === "solid" ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="1" y="1" width="5" height="5" fill="currentColor" />
                  <rect x="8" y="1" width="5" height="5" fill="currentColor" />
                  <rect x="1" y="8" width="5" height="5" fill="currentColor" />
                  <rect x="8" y="8" width="5" height="5" fill="currentColor" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="3" cy="3" r="1.5" fill="currentColor" />
                  <circle cx="11" cy="3" r="1.5" fill="currentColor" />
                  <circle cx="3" cy="11" r="1.5" fill="currentColor" />
                  <circle cx="11" cy="11" r="1.5" fill="currentColor" />
                  <circle cx="7" cy="7" r="1.5" fill="currentColor" />
                </svg>
              )}
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>

        {/* Two-panel inspector */}
        <div className="flex border-t border-white/[0.08]" style={{ height: "min(640px, 65vw)" }}>

          {/* Left: large glyph with guides */}
          <div
            ref={leftPanelRef}
            className="relative overflow-hidden border-r border-white/[0.08] shrink-0"
            style={{ width: "42%" }}
          >
            {/* Vertical grid lines */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, transparent 0, transparent calc(100%/9 - 0.5px), rgba(255,255,255,0.05) calc(100%/9 - 0.5px), rgba(255,255,255,0.05) calc(100%/9))",
              }}
            />

            {/* Large glyph — em-box top at TOP_GAP px, descender flush with panel bottom */}
            <span
              className="absolute left-1/2 -translate-x-1/2 select-none whitespace-nowrap"
              style={{
                top: metrics ? metrics.charTop : "16px",
                fontSize: metrics ? metrics.glyphSize : GLYPH_SIZE,
                fontFamily: font.cssVar,
                fontWeight: weight,
                lineHeight: 1,
                color: activeMode === "anchors" ? "transparent" : "white",
                WebkitTextStroke:
                  activeMode === "anchors" ? "1px rgba(255,255,255,0.6)" : "0px",
              }}
            >
              {selectedGlyph}
            </span>

            {/* Typographic guide lines — pixel-accurate from measured metrics */}
            {metrics && [
              { label: "Cap Height", value: metrics.capHeightVal,  y: metrics.capHeightY  },
              { label: "X-Height",   value: metrics.xHeightVal,   y: metrics.xHeightY   },
              { label: "Baseline",   value: 0,                    y: metrics.baselineY   },
              { label: "Descender",  value: metrics.descenderVal, y: metrics.descenderY  },
            ].map(({ label, value, y }) => (
              <div
                key={label}
                className="absolute left-0 right-0 pointer-events-none"
                style={{ top: y }}
              >
                <div style={{ borderTop: "1px dashed rgba(255,255,255,0.18)" }} />
                <span
                  className="absolute uppercase text-white/30"
                  style={{
                    fontFamily: "var(--font-geist-mono)",
                    fontSize: "9px",
                    letterSpacing: "0.1em",
                    left: "12px",
                    top: "-14px",
                  }}
                >
                  {label}
                </span>
                <span
                  className="absolute text-white/30 tabular-nums"
                  style={{
                    fontFamily: "var(--font-geist-mono)",
                    fontSize: "9px",
                    right: "12px",
                    top: "-14px",
                  }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Right: scrollable glyph grid */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <div
              className="grid"
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(52px, 1fr))",
                gap: "1px",
                backgroundColor: "rgba(255,255,255,0.05)",
              }}
            >
              {visibleGlyphs.map((glyph, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedGlyph(glyph)}
                  className={`flex items-center justify-center aspect-square transition-colors duration-100 ${
                    selectedGlyph === glyph
                      ? "bg-white text-black"
                      : "bg-[#0A0A0A] text-white hover:bg-white/10"
                  }`}
                  style={{ fontSize: "clamp(16px, 2vw, 28px)" }}
                >
                  <span
                    style={{
                      fontFamily: font.cssVar,
                      fontWeight: weight,
                      lineHeight: 1,
                      userSelect: "none",
                    }}
                  >
                    {glyph}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Playground ───────────────────────────────────── */}
      <div className="border-t border-white/[0.08] px-[24px] md:px-[63px] py-[80px] md:py-[120px]">
        <p className={`${MONO} text-white/40 mb-[48px]`}>Playground</p>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[32px] mb-[56px]">
          {[
            {
              label: "Weight",
              value: `${weight}`,
              min: 100,
              max: 900,
              step: 1,
              current: weight,
              set: setWeight,
            },
            {
              label: "Size",
              value: `${size}px`,
              min: 12,
              max: 120,
              step: 1,
              current: size,
              set: setSize,
            },
          ].map(({ label, value, min, max, step, current, set }) => (
            <div key={label}>
              <div className="flex justify-between items-baseline mb-[16px]">
                <span className={`${MONO} text-white/40`}>{label}</span>
                <span
                  className="text-white/50 tabular-nums"
                  style={{ fontFamily: "var(--font-geist-mono)", fontSize: "11px" }}
                >
                  {value}
                </span>
              </div>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={current}
                onChange={(e) => set(Number(e.target.value))}
                className="w-full cursor-pointer"
                style={{ accentColor: "white" }}
              />
            </div>
          ))}
        </div>

        {/* Editable text */}
        <div className="border-b border-white/[0.08] pb-[8px]">
          <div
            ref={playgroundRef}
            contentEditable
            suppressContentEditableWarning
            className="w-full bg-transparent outline-none min-h-[1.2em] text-white caret-white"
            style={{
              fontFamily: font.cssVar,
              fontWeight: weight,
              fontSize: `${size}px`,
              lineHeight: 1.1,
            }}
          />
        </div>
        <p
          className="mt-[12px] text-white/20 uppercase tracking-[0.12em]"
          style={{ fontFamily: "var(--font-geist-mono)", fontSize: "9px" }}
        >
          Click to edit
        </p>
      </div>

      {/* ── Weight Specimens ─────────────────────────────── */}
      <div className="border-t border-white/[0.08] px-[24px] md:px-[63px] py-[80px] md:py-[120px]">
        <p className={`${MONO} text-white/40 mb-[48px]`}>Weights</p>
        <div className="space-y-[1px]" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
          {SPECIMEN_WEIGHTS.map((w) => (
            <div
              key={w}
              className="flex items-baseline gap-[24px] md:gap-[48px] px-[24px] md:px-[32px] py-[20px] md:py-[24px] bg-[#0A0A0A] hover:bg-white/[0.03] transition-colors duration-150"
            >
              <div className="shrink-0 w-[80px]">
                <span
                  className="block text-white/30 tabular-nums uppercase tracking-[0.1em]"
                  style={{ fontFamily: "var(--font-geist-mono)", fontSize: "9px" }}
                >
                  {w}
                </span>
                <span
                  className="block text-white/20 uppercase tracking-[0.1em]"
                  style={{ fontFamily: "var(--font-geist-mono)", fontSize: "9px" }}
                >
                  {WEIGHT_LABELS[w]}
                </span>
              </div>
              <span
                className="text-[28px] md:text-[40px] leading-none overflow-hidden text-white"
                style={{ fontFamily: font.cssVar, fontWeight: w }}
              >
                {font.label} — The quick brown fox jumps over the lazy dog
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Usage ────────────────────────────────────────── */}
      <div className="border-t border-white/[0.08] px-[24px] md:px-[63px] py-[80px] md:py-[120px]">
        <p className={`${MONO} text-white/40 mb-[48px]`}>Usage</p>
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-[1px]"
          style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
        >
          <div className="bg-[#0A0A0A] p-[32px]">
            <p className={`${MONO} text-white/30 mb-[24px]`}>@font-face</p>
            <pre
              className="text-[12px] leading-[1.8] text-white/50 overflow-x-auto"
              style={{ fontFamily: "var(--font-geist-mono)" }}
            >
              {`@font-face {
  font-family: "${font.label}";
  src: url("./${font.filename}")
       format("truetype");
  font-weight: 100 900;
  font-style: normal;
}`}
            </pre>
          </div>
          <div className="bg-[#0A0A0A] p-[32px]">
            <p className={`${MONO} text-white/30 mb-[24px]`}>CSS</p>
            <pre
              className="text-[12px] leading-[1.8] text-white/50 overflow-x-auto"
              style={{ fontFamily: "var(--font-geist-mono)" }}
            >
              {`.element {
  font-family: "${font.label}", monospace;
  font-weight: 400;
  font-variation-settings: "wght" 400;
}`}
            </pre>
          </div>
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────── */}
      <div className="px-[24px] md:px-[63px] py-[32px] border-t border-white/[0.08]">
        <div className="flex justify-between items-center">
          <p
            className="text-white/30 uppercase tracking-[0.08em]"
            style={{ fontFamily: "var(--font-geist-mono)", fontSize: "11px" }}
          >
            © {new Date().getFullYear()} LUWA
          </p>
          <p
            className="text-white/20 uppercase tracking-[0.08em]"
            style={{ fontFamily: "var(--font-geist-mono)", fontSize: "11px" }}
          >
            Variable Typeface
          </p>
        </div>
      </div>
    </div>
  );
}
