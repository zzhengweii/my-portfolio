# Design plan

A single-page portfolio for Zheng Wei Ow. This file is the source of truth for
tokens, layout and motion so future edits stay consistent.

## Design read

Data-science student portfolio for recruiters and hiring managers in finance
and tech. Dark, playful-technical language: a night-time tiny planet (after
messenger.abeto.co) drawn with blueprint line-work (after Orano's innovation
experience), with tactile hover physics (after op.al).

Layout leans asymmetric and motion is rich, but density stays moderate: the
references are experiential sites, while the audience scans fast, so every
section reads without motion.

## Tokens

Defined as CSS variables in `src/index.css`. Dark only (explicit brief).

| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `#0A0F16` | Page background (blue-black night) |
| `--bg-raised` | `#0E151F` | Alternate section tint |
| `--surface` | `#121B27` | Panels, preview frames |
| `--ink` | `#EAF0F6` | Primary text |
| `--ink-2` | `#A7B4C4` | Body text |
| `--ink-3` | `#7A889B` | Labels, meta (5.3:1 on bg) |
| `--line` | `rgb(143 176 214 / 0.14)` | Hairlines |
| `--schematic` | `rgb(143 176 214 / 0.72)` | Drawing strokes |
| `--accent` | `#F4B55B` | The one accent: lamps, CTAs, highlights |

One accent only. Medals in the dragon boat plot are an ordinal ramp in the
same warm family (gold `#F4B55B`, silver `#ADA392`, bronze `#8C6231`), with
lightness order and contrast checked against `--bg`, plus a legend and a table.

Type: Bricolage Grotesque Variable for display and body, Geist Mono Variable
for schematic labels and numbers (tabular figures). Both self-hosted through
Fontsource.

Shape rule: controls are full pills, media and panels use `--radius` (20px),
small floating surfaces (cursor preview, tooltips, thumbnails) use
`--radius-sm` (12px), schematic drawings are frameless.

## Page structure

| Section | Anchor | Layout family |
| --- | --- | --- |
| Hero | `#home` | Asymmetric split, text left, 3D tiny planet right |
| About | `#about` | Portrait photo + statement + facts grid |
| Experience | `#experience` | Route line with station nodes and impact figures |
| Projects | `#projects` | Featured drawing sheet + index list with cursor preview |
| Activities | `#activities` | Two-cell asymmetric bento (dragon boat, FinTech) |
| Contact | `#contact` | Postcard |

## The tiny planet (hero)

- three.js, lazy-loaded so the hero text paints first. SVG outline placeholder
  while the chunk loads and as the fallback when WebGL is unavailable.
- Low-poly flat-shaded terrain, toon lighting from a moon, light-blue edge
  lines for coastlines and buildings. Warm amber only where light is emitted
  (windows, lanterns).
- A small character in a white shirt walks on top while the world turns
  under it. Drag to spin; the character turns to face the direction.
- Fixed callout labels with leader lines that track landmarks (vessel,
  dragon boat, city). Labels link to their sections.
- Reduced motion: no auto-rotation or walking, a still frame with all
  landmarks visible.

## Schematic language

1px strokes (`vector-effect: non-scaling-stroke`), dashed strokes for hidden
parts, hollow node circles, leader lines ending in a short shelf under a mono
label. Drawings draw themselves in once when they enter the viewport.

Drawings: vessel side elevation with sensor callouts (featured project),
dragon boat top view plus a medals-by-distance dot plot, FinTech credit-risk
pipeline with flowing data dashes.

## Hover and motion

- Text roll on links and buttons: the label slides up and a copy slides in,
  staggered per character.
- Project index: a preview card follows the cursor on a spring, tilts with
  horizontal velocity, and cross-fades between projects. Sibling rows dim.
- Magnetic pull on the primary CTA.
- All hover styles sit behind `@media (hover: hover) and (pointer: fine)`.
  Touch gets `:active` press feedback (`scale(0.97)`).
- Easing: `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`, press 140ms, hovers
  200 to 350ms, reveals up to 900ms. Everything respects
  `prefers-reduced-motion`.

## Copy rules

No em or en dashes anywhere visible (use hyphens), at most one mid-dot per
line, no scroll cues, sentence case headings, real numbers only (all figures
come from the CV).
