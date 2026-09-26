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

Defined as CSS variables in `src/index.css`. Night is the default look; a
day theme (`:root[data-theme="day"]`) redefines the same tokens as blueprint
paper with navy ink. The values below are night.

| Token         | Value                     | Use                                     |
| ------------- | ------------------------- | --------------------------------------- |
| `--bg`        | `#0A0F16`                 | Page background (blue-black night)      |
| `--bg-raised` | `#0E151F`                 | Alternate section tint                  |
| `--surface`   | `#121B27`                 | Panels, preview frames                  |
| `--ink`       | `#EAF0F6`                 | Primary text                            |
| `--ink-2`     | `#A7B4C4`                 | Body text                               |
| `--ink-3`     | `#7A889B`                 | Labels, meta (5.3:1 on bg)              |
| `--line`      | `rgb(143 176 214 / 0.14)` | Hairlines                               |
| `--schematic` | `rgb(143 176 214 / 0.72)` | Drawing strokes                         |
| `--accent`    | `#F4B55B`                 | The one accent: lamps, CTAs, highlights |

One accent only. Medals in the dragon boat plot are an ordinal ramp in the
same warm family (gold `#F4B55B`, silver `#ADA392`, bronze `#8C6231`), with
lightness order and contrast checked against `--bg`, plus a legend and a table.

### Day theme

| Token         | Day value                                                                                |
| ------------- | ---------------------------------------------------------------------------------------- |
| `--bg`        | `#EEF2F7`                                                                                |
| `--ink`       | `#0D1726`                                                                                |
| `--ink-3`     | `#5B6879`                                                                                |
| `--schematic` | `rgb(28 70 132 / 0.72)`                                                                  |
| `--accent`    | `#F2A93B` (fills), `--accent-line` `#B06D00` (strokes), `--accent-text` `#8F5300` (text) |
| Medals        | gold `#D39A2E`, silver `#9A9282`, bronze `#855733`                                       |

The sun and moon button in the nav switches themes. The new theme grows out
of the button as a circle (View Transitions API, instant with reduced motion
or where unsupported). The choice is saved in `localStorage` and applied
before first paint by a small script in `index.html`. The planet lerps its
palette, lights and sky (moon sets, sun rises) over about 1.4s.

Type: Bricolage Grotesque Variable for display and body, Geist Mono Variable
for schematic labels and numbers (tabular figures). Both self-hosted through
Fontsource.

Shape rule: controls are full pills, media and panels use `--radius` (20px),
small floating surfaces (cursor preview, tooltips, thumbnails) use
`--radius-sm` (12px), schematic drawings are frameless.

## Page structure

| Section    | Anchor        | Layout family                                           |
| ---------- | ------------- | ------------------------------------------------------- |
| Hero       | `#home`       | Asymmetric split, text left, 3D tiny planet right       |
| About      | `#about`      | Portrait photo + statement + facts grid                 |
| Experience | `#experience` | Route line with station nodes and impact figures        |
| Projects   | `#projects`   | Featured drawing sheet + index list with cursor preview |
| Activities | `#activities` | Two-cell asymmetric bento (dragon boat, FinTech)        |
| Contact    | `#contact`    | Postcard                                                |

## The tiny planet (hero)

- three.js, lazy-loaded so the hero text paints first. SVG outline placeholder
  while the chunk loads and as the fallback when WebGL is unavailable.
- Low-poly flat-shaded terrain, toon lighting from a moon, light-blue edge
  lines for coastlines and buildings. Warm amber only where light is emitted
  (windows, lanterns).
- A small character in a white shirt walks on top while the world turns
  under it. Drag in any direction to revolve it freely (quaternion
  rotation); the character turns to face the way it walks. Scrolling the
  page gives the walk a short boost.
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

### Vessel (interactive)

The five numbered signals are shared between the drawing and the list of
toggle buttons beside it. Hover or focus previews a signal, click or tap
pins it. Picking one fades the hull back like an x-ray and traces the
signal in the accent: shaft and a fast-spinning propeller, engine with
running pistons, fuel tank level and fuel flowing to the engine, GPS pings
from the mast with a heading arrow, or gusting wind, swell and current. A
fixed-height readout under the list says what the signal is (aria-live), so
nothing below shifts. The drawing's hotspots are pointer only; keyboards
and screen readers use the list.

### Dragon boat (animated)

Once drawn, the crew paddles in time: paddles swing about the gunwale
(catch, drive, exit, slower recovery), paddlers lean, each blade leaves a
swirl that drifts astern, the drum flashes with a ring on every catch and
the steerer's oar makes small corrections. Lane buoys and the wake stream
past. Every part runs on one clock (`--stroke`, 1.2s) and pauses together
off screen. The results list sits in a fixed-height scroll panel with a
sticky header that fills the space beside the drawing, so the card never
grows; pointing at a dot scrolls the panel to its row.

## Hover and motion

- Text roll on links and buttons: the label slides up and a copy slides in,
  staggered per character.
- Project index: a preview card follows the cursor on a spring, tilts with
  horizontal velocity, and cross-fades between projects. Sibling rows dim.
- Magnetic pull on the primary CTA.
- Touch screens and windows up to 1024px: project rows show a thumbnail
  instead of the cursor preview. Tapping it opens the picture in a dialog;
  the thumbnail grows into it (shared layout) and shrinks back on close.
  Close with the button, a tap outside, Escape or by dragging down. The
  page behind is inert and focus returns to the thumbnail.
- All hover styles sit behind `@media (hover: hover) and (pointer: fine)`.
  Touch gets `:active` press feedback (`scale(0.97)`).
- Easing: `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`, press 140ms, hovers
  200 to 350ms, reveals up to 900ms. Everything respects
  `prefers-reduced-motion`.

## Parallax

Depth runs through the whole page, all scroll-linked transforms on the
compositor (`useParallax` and `Parallax` in `ui/motion.js`):

| Layer                            | Rate or travel                              |
| -------------------------------- | ------------------------------------------- |
| Sky: far specks (stars at night) | 5% of scroll speed, fixed behind everything |
| Sky: near drafting marks         | 14% of scroll speed                         |
| Hero copy                        | lifts 150px faster than the page and fades  |
| Planet                           | lags 220px and shrinks to 0.88              |
| Section titles                   | drift 28px against their content            |
| About photo                      | pans 12% inside its frame                   |
| Experience figures               | float 36px against the text                 |
| Vessel                           | sails 60 units along the sheet              |
| Dragon boat                      | pulls 44 units up its lane                  |
| FinTech diagram                  | drifts 22px inside its card                 |
| Stamp and postmark               | drift and tilt in opposite directions       |

The sky sits at `z-index: -1` with the page colour on `<html>` only, so
opaque cards hide it and the translucent experience band lets it through.
Travel halves under 700px wide and everything is still with reduced motion.

## Copy rules

No em or en dashes anywhere visible (use hyphens), at most one mid-dot per
line, no scroll cues, sentence case headings, real numbers only (all figures
come from the CV).
