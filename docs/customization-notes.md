# Customization notes — the knob surface and its rationale

Working notes collected while building the parameterization surface. They
ship as-is until the "How to customize BIOS" article (outline at the end)
replaces them.

## The concept: a small mission control

The whole kit reskins through a deliberately small set of variables. The
pitch line: *change five numbers, get a different product.* Everything else
derives. Components never hardcode; they consume roles; roles consume knobs.

The full surface (as of 2026-07-04):

| Knob | Default | What it does |
|---|---|---|
| `--accent` / `--accent-hover` / `--accent-soft` | wp-admin scheme → admin blue | brand color for actions, links, focus, soft fills |
| `--space-unit` | 4px | base of the spacing engine; every step is a multiple (×1 ×2 ×3 ×4 ×6 ×10) |
| `--gap-tight` / `--gap-content` / `--gap-section` / `--gap-label` | 8 / 16 / 24 / 12 | vertical rhythm roles (follow the spacing engine); `--gap-label` = field label → its control(s) |
| `--radius` | 4px | master roundness (container tier: cards, panels); 0 = square UI |
| `--radius-control` | `calc(var(--radius) * 0.5)` = 2px | control tier: buttons, inputs, checkbox, chips |
| `--radius-button` / `--radius-card` / `--radius-input` | button/input → control tier; card → master | per-part radius overrides |
| `--width-content-max` | 1100px | plugin body width |
| `--width-aside` | 300px | sidebar-widgets column |
| `--width-onboarding` / `--width-drawer` / `--width-modal` / `--width-popup` / `--width-toast` / `--width-filter-menu` | 560/420/440/320/360/240 | surface widths |

Preset attributes (no CSS knowledge needed):
- `data-density="compact" | "relaxed"` → space-unit 3px / 5px
- `data-admin-scheme="modern|light|blue|coffee|ectoplasm|midnight|ocean|sunrise"` → accent follows a WP admin color scheme
- `data-theme="dark"` → dark mode (semantic color tier swap)

## --accent vs --color-action-* — why both exist

Common question. `--accent*` is the INPUT (where the color comes from:
brand → wp scheme → blue). `--color-action-primary`, `--color-text-link`,
`--color-focus` etc. are the CONSUMPTION vocabulary (what the color is
used for). Today the roles all alias the accent — but the separation is
load-bearing: components speak stable role names, so you can
diverge one role without rewiring components ("brand the buttons, keep
links blue" = override `--color-text-link` only), and the sourcing
chain can change without touching a single component rule. Collapse them
and every such customization becomes a component edit.

## Spacing engine — design rationale

- All spacing primitives derive from `--space-unit` via calc multiples.
  One variable rescales paddings, stacks, and section gaps coherently.
- **Linear multiples, not a geometric ratio.** A ratio (à la type scales)
  produces fractional off-grid values and cannot reproduce 4/8/16/24/40.
  Spacing wants to stay on the 4px grid. If we ever add a fluid type scale,
  THAT is where a ratio variable belongs (`--type-ratio`), not spacing.
- Density presets change only the unit. Type sizes and control hit-areas
  (32px inputs, 16px checkboxes) deliberately do NOT scale — density should
  tighten breathing room, not shrink tap targets or legibility.
- Chosen preset values: compact 3px (–25%), relaxed 5px (+25%). Steps stay
  integers at all three presets.

## Radius mission control — design rationale

- Two tiers, in the classic wp-admin register (not WP 7.0's heavier 8px):
  containers a touch rounder (4px), controls crisp (2px). One master
  `--radius` feeds the container tier (`--radius-md`, `--radius-card`);
  `--radius-control` derives at half the master and feeds buttons, inputs,
  and `--radius-sm` (checkbox). Because controls derive from the master,
  one dial still governs everything.
- Set `--radius: 0` → square UI everywhere (both tiers collapse); then e.g.
  `--radius-button: 4px` re-rounds only buttons. Overrides win because they
  sit closer to the component than the master.
- `--radius-full` (pills: badges, toggle, tags, stepper markers) is
  intentionally NOT driven by the master — pills are a shape, not a
  roundness level. A square badge at `--radius: 0` would read as a broken
  tag, not a design choice. Call this out in the article; it will be asked.

## Accent — design rationale

- Three values per mode, not one: hover and soft can't be derived in CSS
  without color-mix() (browser support acceptable but conservative WP devs
  balk); explicit knobs also map 1:1 to design-tool variables.
- Resolution chain: explicit brand → WP core's `--wp-admin-theme-color`
  (present in every real wp-admin, so unbranded plugins auto-match the
  user's chosen scheme) → native admin blue.
- The setup skill computes hover (darker-10, HSL lightness −10) and soft
  (10% alpha tint) from one brand color.

## Known limits (document honestly)

- Breakpoints (700px setting-stack, 960px columns-stack) are constants:
  CSS media queries cannot read custom properties.
- Component-internal one-off paddings (button 9px 14px, tab 12px 14px,
  toggle track 28×16) stay local by design — they don't scale with the
  spacing engine. Tokenizing them adds noise without real control.
- Scheme accents like coffee (#46403c) are dark/muted; derived soft tints
  go greyish. Fine for chrome-matching, not for brand expression.

## Article outline (draft)

1. The mission control idea — 15 variables + 3 attributes
2. Brand it: one hex → accent trio (or do nothing and match the admin scheme)
3. Density: one attribute, or fine-tune the unit
4. Roundness: the master radius and per-part overrides
5. Layout: width knobs per surface
6. Dark mode: what changes and what doesn't
7. What you cannot (and should not) change
