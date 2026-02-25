# L's Design Taste — Personal Style Guide
*Read this before producing any visual design output, UI mockup, brand concept, layout, or creative direction.*

---

## Philosophy

Design should feel inevitable — as if nothing could be removed and nothing is missing. Craft is visible but never decorative. The work earns its complexity through function, not ornament. Tension between opposites (heritage ↔ technical, organic ↔ engineered, utalitarien ↔ warm) is a feature, not a problem to resolve.

---

## Aesthetic Principles

**Restraint is the default.** Every element must justify its existence. If you're adding something for visual interest alone, remove it.

**Systems over moments.** Good design has rules that hold across all applications. A logo that only works on the hero page is not a logo. A color that only works in one context is not a color system.

**Tension is interesting. Resolution is boring.** Hold the contradiction — between materials, between eras, between tones. Don't smooth it out.

**Craft lives in the details.** Custom letterforms, bespoke numerals, refined symbol geometry. The difference between a mark that looks designed and one that looks made is in the small decisions.

---

## Typography

**The reference foundries are KH Type (Kurppa Hosk) and Gärde Design.** These define the typeface universe: Stockholm-based, systematic, constructed. When recommending or selecting type, start here.

- **Preferred categories:** Grid-constructed grotesques, mechanical monospaced faces used with intent, rigid geometric sans-serifs with internal logic. Typefaces that have a construction rationale — not just a look. KH Teka (modern rigid grotesque), KH Hekto (geometric with terminal variants), KH Einheit (strict modular monospaced), GD Gaio, GD Octio, GD Grio. Letters from Sweden. Haglöfs custom typeface territory.
- **Monospaced is a legitimate design choice**, not just a code font. KH Interference (primitive, receipt-like), KH Einheit (strict grid), KH Teka Mono — these work as display faces when used boldly. Use monospaced to add technical character, not retro kitsch.
- **Expressive serifs only when intentional.** KH Giga (exaggerated serifs, heavy bleeding at large sizes) and GD Serio (old-style with clarity) show how serifs can work — as compositional weight at large scale, not as "classic" body text decoration.
- **Never use:** Rounded display fonts, generic humanist sans (Poppins, DM Sans as hero), anything from a SaaS starter kit. Inter only with strong intentional customization. No font that exists to feel "approachable" or "friendly."
- **OpenType features matter.** Use alternate characters thoughtfully — single-storey a, circular dots, alternate numerals. These small decisions are where craft lives.
- **Hierarchy logic:** Large type does compositional work, not just communication. Display text can be structural — it is layout. Body text is restrained: regular weight, generous leading, left-aligned always.
- **Tracking:** Tight on display, slightly open on all-caps labels and UI elements. Never default tracking on headlines.
- **Never center body copy.** Centering is for single lines only, and even then, rarely.
- **Weight usage:** Max two weights per composition. Don't use medium weight as a crutch for hierarchy — use size and space instead.

---

## Color

- **Palettes are small and deliberate.** Max 3–4 tones including neutrals. Each color must earn its place.
- **Preferred palette character:** Nature + tech in tension. Earthy, slightly desaturated tones alongside colder, more technical hues. Not warm-and-cozy, not cold-and-corporate — both at once.
- **Neutrals are not beige.** Off-whites with a cool cast, near-blacks that aren't pure black (#0A0A0A territory, not #000000). Pure white and pure black only when intentional.
- **Avoid:** Gradients as decoration. Trendy gradient meshes. Pastel palettes with no contrast logic. Color combinations that feel "wellness" or "startup" without grounding.
- **Color contrast:** High contrast between type and background. No low-contrast text that requires squinting, ever.

---

## Layout & Spacing

- **8px base grid.** All spacing values are multiples of 8 (or 4 for micro-spacing).
- **Whitespace is structural.** Space is not what's left over — it's what carries weight and creates rhythm. Use it aggressively.
- **Asymmetry is fine. Randomness is not.** Off-center compositions are welcome when they follow a grid logic. Scattered layouts with no underlying system are not.
- **Full-bleed is a commitment.** If you go edge-to-edge, the content must justify it. Don't use full-bleed as a default.
- **Max 2 column types per page composition.** Layouts should feel resolved, not improvised.
- **Sections breathe.** Section padding minimum 120px vertical on desktop. Cramped sections feel cheap.

---

## Brand & Identity

- **Logomarks should have internal logic.** The symbol geometry should be explainable — it comes from somewhere real, not from random shapes that "feel right."
- **Separate wordmark and symbol.** Locked-up logos that always appear together are inflexible. A strong identity system lets elements work independently.
- **A bespoke typeface is brand equity, not a luxury.** Gärde Design's model: custom type carries cultural depth, emotional character, and quiet authority that a licensed font never fully achieves. When recommending type for a brand, always consider whether bespoke is the right answer.
- **Bespoke over generic.** Custom-drawn letterforms, modified characters, proprietary typefaces — these are the difference between a brand and a styled template. Even subtle modifications (alternate glyphs, adjusted spacing, modified terminals) shift a face from generic to owned.
- **Heritage is not nostalgia.** Drawing from a brand's history is about finding the thread that connects past to future. The Haglöfs approach is the model: early 20th century typographic tradition as the basis for something forward-looking, not a recreation of it.
- **Brand colors represent real things.** Nature and technology. Performance and restraint. Not vibes — dualities with meaning.

---

## UI & Digital

- **UI is a system, not a collection of screens.** Every component must work within a defined token system. Nothing should be one-off.
- **Nothing tech is the reference point for product website UI.** Cinematic photography with minimal UI chrome. The interface gets out of the way of the product.
- **Navigation is quiet.** Small, sparse nav. Never decorative headers. Never mega-menus unless truly necessary.
- **Micro-interactions are meaningful.** Hover states exist. Transitions have easing (not linear). But animations never show off — they clarify or delight briefly then step aside.
- **Cards and containers:** Use borders or subtle background shifts for separation, not drop shadows. If shadows are used, they're soft, large, and low-opacity — not the default `box-shadow: 0 4px 8px rgba(0,0,0,0.2)`.
- **Border radius:** 0–4px on major containers. Small radius or none. No pill buttons unless they're a deliberate brand choice. No 16px rounded cards.
- **Dark mode is first-class.** Not an afterthought or inverted light mode. If designing dark, design it as its own thing.

---

## Anti-patterns — Never Do These

- Drop shadows used for depth on flat UI
- Generic illustrations (blob shapes, Humaaans-style figures, abstract squiggly decorations)
- Gradient-heavy hero sections with no typographic anchor
- Emoji as design elements in professional work
- Centered body copy
- More than 4 colors in a palette (including neutrals)
- Font pairings that rely on contrast between "friendly" and "serious" — that's a cliché
- Rounded corners above 4px on layout containers
- Overly saturated accent colors against neutral backgrounds ("look at me" teal, neon orange, etc.)
- AI-generated imagery that looks AI-generated (perfect faces, uncanny hands, hyperreal lighting)
- Layouts that use icons to decorate every list item
- Type that is set too small to be legible in the name of "minimal"

---

## Reference World

When making judgment calls, ask: does this feel like it belongs in the world of —

- Stockholm Design Lab (Haglöfs, Hyperice, Slam) — identity systems with internal logic and material honesty
- KH Type / Kurppa Hosk — rigid, mechanical, grid-constructed typefaces; monospaced as a design asset
- Gärde Design — bespoke type as brand equity, Scandinavian precision, Maurten as a client archetype (performance + restraint)
- Nothing Technology — cinematic product presentation, minimal UI chrome, dark-first
- duties.xyz — structured, deliberate, not flashy
- Swiss International Typographic Style as a foundation (not pastiche)
- Scandinavian industrial design: honest materials, visible construction logic
- Are.na aesthetics: considered curation, not algorithmic taste

If the answer is no — simplify, strip back, or reconsider the core decision.

---

## How to Use This File

Before producing any design-related output (layouts, UI mockups, brand concepts, color palettes, type choices, creative direction):
1. Read the relevant sections above
2. Apply the anti-pattern check before finalizing
3. When in doubt, do less or ask 
