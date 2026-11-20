# BIOS contract

The invariants of the kit: what the tokens are, how things are named, what
exists, and the rules that hold on every screen. `docs/agent-heuristics.md`
says how to choose between components; this page says what the system is.

## 1. Purpose

A neutral, componentized design system for WordPress-admin-native plugin
UI. Single source of truth is `tokens.css`. Reference pages demonstrate
every component with literal placeholder text. Audience: humans and AI
agents building or editing plugin screens.

## 2. Hard rules

The rules stated once, here. Other documents cite them by number. R1–R5
are mechanical and `validate.py` (screen markup) or the build guard
(`tokens.css`) enforce them; R6–R9 are reviewed by eye.

| # | Rule | Checked by |
|---|---|---|
| R1 | Components and markup use **semantic tokens only**. Primitives (`--blue-600`, `--space-16`) never appear outside the primitive tier. Accent color routes through `--accent` / `--accent-hover` / `--accent-soft`. | guard · `validate.py` |
| R2 | Vertical spacing is **flex + gap** (`.stack`, `--gap-*` roles), never margins. The only margin exception is pixel-level optical alignment inside a component. | review |
| R3 | **No page-local CSS.** Screens are composition only. An inline `style` may set custom properties and nothing else (`style="--fill: 70%"`); any raw declaration is a violation. Custom UI is a new proper component (extension protocol, heuristics §1). | `validate.py` |
| R4 | **Icons are Tabler only**, delivered as the per-page inline SVG sprite: `<svg class="icon" aria-hidden="true"><use href="#i-{name}"/></svg>`. The wp-admin chrome (`.admin-bar`, `.admin-menu`) uses WP dashicons; never in kit components. | guard |
| R5 | **Dark mode swaps the semantic color tier only** (`data-theme="dark"`). No component-level dark styles. | guard (contrast audit) |
| R6 | **Exactly one `.page-header` per screen.** | review |
| R7 | **One `--primary` button per card footer or save-bar**, maximum. | review |
| R8 | **`--danger` actions confirm through a `.modal`** before completing. Never a popup or toast. | review |
| R9 | **Placeholder content is literal** on the kit's own pages ("Card title", `example.com`, `2026-01-01 00:00:00`). On a real plugin's screens, labels are design and come from the plugin's domain; data stays representative and never invents facts. | review |

## 3. Token architecture (two tiers)

**Tier 1 — Primitives.** Raw values. Never referenced by components.
Design-tool mapping: one "Primitives" collection, single mode.

- Color ramps: `--gray-900…50`, `--white`, `--blue-700/600/400/300/50`,
  `--green-700/600/400/50`, `--yellow-600/50`, `--red-700/600/300/50`
- Type: `--font-size-11…23`, `--line-height-tight/base`,
  `--font-family` (system stack), `--font-mono`
- Space: `--space-unit` (4px base) → `--space-4/8/16/24/40` as calc
  multiples (×1 ×2 ×4 ×6 ×10). Density presets: `[data-density="compact"]`
  (3px unit) / `"relaxed"` (5px unit). Type/control sizes unaffected.
- Radius: `--radius-4/999`
- Size: `--size-16/24/36/44/80/160/180`

**Tier 1b — Accent (branding knob).** `--accent` / `--accent-hover` /
`--accent-soft`, one set per mode. Everything accent-colored routes through
them. Resolution: explicit brand override → user's wp-admin color scheme via
WP core's `--wp-admin-theme-color(-darker-10)` → native admin blue.
`[data-admin-scheme="modern|light|blue|coffee|ectoplasm|midnight|ocean|sunrise"]`
presets replicate the schemes for static previews (values = WP core's
per-scheme theme colors). Design-tool mapping: an "Accent" variable trio
that can be rebound.

**Tier 2 — Semantic.** Role aliases. The ONLY tokens components use.
Design-tool mapping: one "Semantic" collection, modes = Light / Dark.

- Color: `--color-{category}-{role}` — text (primary, secondary, inverse,
  inverse-muted, on-accent, link, link-hover), bg (canvas, surface, subtle,
  inverse), border (default, strong), action (primary, primary-hover, soft),
  states (success, success-text, success-soft, warning, warning-soft, danger,
  danger-hover, danger-soft), focus
- Type roles: `--text-xs/sm/md/lg`, `--heading-sm/md/lg/xl`,
  `--leading-heading/body`
- Space roles: `--space-xs/sm/md/lg/xl`
- Vertical rhythm roles (density knobs): `--gap-tight` 8 (stacked controls) ·
  `--gap-content` 16 (blocks inside a card/drawer/popup) · `--gap-section` 24
  (page level: header, notices, cards) · `--gap-label` 12 (field label → its
  control(s))
- Radius: two-tier — containers a touch rounder than controls, in the
  classic wp-admin register (not WP 7.0's heavier 8px). `--radius` master
  knob (4px; 0 = square UI) drives the container tier →
  `--radius-md`/`--radius-card`; `--radius-control` (half the master =
  2px) drives buttons, inputs, `--radius-sm` (checkbox) and other tight
  parts. One dial still governs both (controls derive from the master, so
  `--radius: 0` squares everything). `--radius-full` (pills: badges,
  toggle) is shape-based, not master-driven.
- Size roles: `--size-control` 16 · `--size-step` 24 · `--size-icon-tile` 36 ·
  `--size-icon-tile-lg` 44 · `--width-input-narrow` 80 · `--width-sidebar` 160 ·
  `--width-setting-label` 180
- Layout width knobs (quick parameterization surface, raw px by design):
  `--width-content-max` 1100 · `--width-aside` 300 · `--width-onboarding` 560 ·
  `--width-drawer` 420 · `--width-modal` 440 · `--width-popup` 320 ·
  `--width-toast` 360 · `--width-filter-menu` 240. Breakpoints (700px setting
  stack, 960px columns stack) are constants — CSS media queries cannot read
  custom properties.

**Dark mode.** `[data-theme="dark"]` overrides the semantic color tier only
(R5). Type/space/radius/size are mode-independent. Dark contrast is audited and
guard-enforced in both modes (see §9).

**Notes**
- Hard rules R1 (semantic tokens only) and R2 (gap, not margins) apply to
  this tier — see §2. If a role is missing, add a semantic token first.
  Containers own the rhythm via `--gap-*` roles; the `.stack` utility
  (`--tight` / `--loose`) is the generic stacking frame.
- `.shell` (wp-admin demo chrome) is the one exception: fixed-dark in both
  modes, uses primitives directly, not part of the shippable system.
- Component-internal paddings without reuse (button `9px 14px`, tab `12px 14px`,
  toggle track `28×16`) stay local by design — tokenizing them adds noise.

## 4. Naming

- CSS classes: BEM — `block__element--modifier` (page-local CSS: R3).
- Tokens: `--color-{category}-{role}` for color; `--{scale}-{step}` otherwise.
- Icons: Tabler set only. Icon name in code = tabler name.

## 5. Component inventory

The machine-readable inventory is `components.json` (one entry per
styleguide spec block, generated); the live reference is the
`examples/styleguide-*.html` group pages. This section is the same
inventory as prose, by group.

Layout / chrome: `shell` (demo only) · `admin-bar` (the wp-admin top bar
as a component: `__item` w/ shared hover/focus/open state, `__icon`
dashicons, `__badge` updates count, `__bubble` moderation count (wp red),
`__avatar` 16px square, `__menu` > `__submenu` (+`--right`) CSS-only
dropdowns, `__user` panel w/ 64px avatar; measured on WP 7.0; excluded
from dist — WP renders the real bar) · `admin-menu` (the wp-admin sidebar
as a component, for full-screen mockups/previews: `__item` + `--current`
w/ accent fill + canvas arrow, `__icon` real dashicons, `__bubble` count
pill, `__separator`, `__submenu-item` + `--current`; fixed wp palette,
measured on WP 7.0; excluded from dist — WP renders the real menu) ·
`plugin` (topbar, brand, body;
optional `__theme-toggle` icon button — live dark/light switch) ·
`tabs` (chrome placement under the topbar, or sub-navigation variant inside
a flush card — `--card` underline, `--boxed` folder tabs fusing into the
panel, `--vertical` rail for two-column layouts; inline `--segmented`
button-group (square radius, matches `.button`) for small equally-weighted
toggles, not tied to a card; invariant is at most one chrome `.tabs` strip
per screen — it's the primary nav for a single menu-item plugin, or a
page's section nav under the header when the sidebar submenu is primary
(WP settings-tabs pattern); never two competing strips, and the
sub-navigation variants never in parallel with a chrome-tabs strip) ·
`page-header`
(+ drill-in `__breadcrumb`: `__back` icon button, crumb links, `__crumb-sep`)

Containers: `card` (header, icon — optional per product, all cards or none,
default on; heading, title, description, `section-title` (plain-heading group
divider for the single-container settings layout — the default: one flush
card holds all field groups, one card per group only when groups are
independent),
header-actions, well, divider, footer, footer-meta, body — padded tab-panel
slot in a flush card hosting `tabs--card`; `--flush` full-bleed body;
`--collapsible` = details/summary card w/ rotating `__chevron`, slot content) ·
`panel` (lean nested toggle container: details/summary, header + chevron +
body slot) · `addons` / `addon` (`--pro` locked extension: lock icon tile,
`badge--pro`, upgrade footer + `__note`; `__thumb` = full-bleed 16:9 image
variant replacing the icon tile, filled-badge overlay only) · `notice`
(info/warning/danger/success)

Actions: `button` (default outline · `--primary` · `--danger` · `--link` ·
`--small` · disabled) · `menu` (anchored kebab action menu, static-open
panel like `filter`: `__item` buttons/links w/ icons, `__item--danger`,
`__divider`, `__panel--right`)

Forms: `field` (label, input, select, textarea, hint; `__input--narrow`,
`__input--search` w/ leading icon; validation: `--error`/`--success`
color the control border + `__message` line w/ icon — replaces `__hint`
while shown) · `upload` (file input: styled native row + `--dropzone`;
`--dragover` state) · `settings` /
`setting` (wp form-table rows; group kills card gap between rows, trims
first/last padding; stacks ≤700px) · `checkbox` · `radio` · `toggle`
(28×16 track) — all three with `--hint-below` variant · `tag-input` / `tag`
(chips with remove buttons) / `tags` (static or linked chip row outside the
input — tags on an item, browse-by-tag; links keep chip colors, no remove;
counts-based filtering stays `views`) · `filter` (advanced dropdown, static-open panel;
single-select + multi-select w/ search + Clear/Apply footer) · `copy-field`
(readonly mono `field__input` fused with a copy `button`) · `repeater`
(sortable row group: `__handle`, `__content` slot, `__remove`, add-row
`__footer`; drag behavior is host-page JS) · `conditions` (rule builder
for conditional logic: `__group` AND-set of `__row`s — "When"/"and"
`__connector` + subject·operator·value from field controls + `__remove` —
`__or` between groups, `__footer` add buttons; add/remove/value-control
swap is host-page JS)

Data: `table` (head-cell, row, cell, `--muted`, empty) · `list-table`
(wp-list-table: toolbar w/ bulk actions + filters + count + pagination,
tfoot header repeat, check column, hover quick-actions; row variants
default/--selected/--warning/--danger/--disabled) · `views` (wp "subsubsub"
text-link filter row over a collection: item > view + count, CSS pipe
separators, `--current` bold; filtering not navigation — sits directly above
a list-table) · `badge`
(default/success/danger/accent/`--ai`) · `checklist` · `disclosure` · `stat` /
`stats` (dashboard metric: label, big value, `__meta` delta via `badge`;
`stats` = responsive grid in a card body) · `code-block` (read-only
multi-line code display: `__pre` + optional `__copy`; no highlighting —
editing stays a field + mono textarea) · `pagination` (standalone
prev/next pager + `__label`; inside list-table stays `__pagination`)

Navigation / progress: `subnav` (secondary nav strip directly under
whichever primary nav is in use — under chrome tabs, or directly under
`.page-header` when the sidebar submenu is primary; full-bleed, outside
any card either way; two variants — `--links` (spaced text links,
`--current` bold) or `--tabs` (connected block tabs, `--current` takes the
body/canvas bg and drops the bar border to blend into content);
nav ladder: primary = sidebar submenu OR (single menu-item) a top-level
chrome-tabs strip → secondary, max one = chrome `.tabs` under the header
(WP settings-tabs) OR subnav OR tabs--card → views = filtering, not a
level) · `section-index` (in-page ToC for settings pages past ~2 viewport
heights: `nav.section-index > __title + __list > li > __link`, pure anchors,
no JS; `__link--current` pairs with `aria-current="true"`; `--sticky` only
inside a `.columns` aside rail. Not a nav level — it points inside the
current page) · `stepper` (wizard
progress; numbered steps w/ connectors, `--bar` compact variant; step states
default/--current/--complete) · `progress` (determinate operation bar:
`__head` label + value, `__track` > `__bar` w/ fill from `--fill`;
accent/--success/--danger; distinct from `stepper --bar` = wizard position)

Actions (page level): `save-bar` (full-width sticky bottom save bar, sibling
of `plugin__body`: message + actions)

Upsell: `badge--pro` (uppercase accent badge, no dot) · `upsell` (CTA banner:
icon, title, description, actions; uses `--color-action-soft`) · `pricing`
(plan comparison cards: `__plan` grid, `--featured` accent-ring tier +
`__badge` "Most Popular", `__price`/`__amount`/`__period`, `__features` w/
accent checks, CTA + `__note` guarantee; annual billing, 3–4 tiers)

Feedback: `empty-state` · `modal` (+ `modal-overlay`) ·
`toast` (+ `toast-stack`; success/warning/danger) · `drawer` (+ `drawer-overlay`;
right side panel: header, title, close, body, section, section-title, text,
footer) · `popup` (anchored notification/confirmation: icon, content, title,
message, actions, dismiss; success/warning/danger) · `tooltip` (CSS-only
bubble from `data-tip`, inverse surface; top default, `--bottom`/`--right`/
`--left`; short labels only) · `spinner` (indeterminate, 14/18/22 mirroring
`icon`; arc = accent or button text color) · `skeleton` (loading placeholder:
`__line` + `--half`/`--third`, `__block`; opacity pulse)

AI: `chat` (assistant conversation panel for a flush card or drawer:
`__log`, `__message` + `--user`, `__bubble`,
`__typing` dots, per-message `__actions`, `__suggestions` pills,
`__composer`, `__footnote`; static markup, sending is host-page JS) ·
`ai-suggestion` (inline proposal next to a field: sparkles header +
`badge--ai`, `__text`, Accept/Regenerate/Discard actions; the primary AI
pattern — chat only when conversation is the feature)

Integration: `license` (key validation + account-connect path; states
unlicensed/connecting/active/expired/invalid, monospace masked key,
`__connect`+`__or` dual path, `__help` troubleshooting list; expired degrades
updates/support without bricking) · `link-list` (aside links w/ icons)

Layout variations: `plugin__body--full` (no max-width) · `columns`
(main + 300px aside of widget cards; stacks ≤960px) · `onboarding`
(headerless centered panel, 560px)

Utility: `icon` (`--sm` 14 · default 18 · `--lg` 22) · `stack`
(vertical auto-layout frame; default `--gap-content`, `--tight`, `--loose`)

## 6. Form controls (custom-rendered)

All controls share `height: 32px` metrics (input/select) or
`--size-control` 16px (checkbox/radio).

- **Select**: `appearance: none`, Tabler `chevron-down` as background-image,
  `padding-right: 32px`.
- **Textarea**: shares the input chrome; `height: auto`, `min-height: 88px`,
  `resize: vertical`.
- **Search input** (`field__input--search`): Tabler `search` as
  background-image, `padding-left: 32px`.
- **Checkbox**: `appearance: none`, checked = accent fill + white Tabler
  `check`; full focus-visible / disabled / disabled-checked states.
- **Radio**: `appearance: none`, checked = accent fill + inset
  `--color-bg-surface` ring (dot adapts to dark mode automatically).
- **Toggle**: visually-hidden input + `__track` element; keyboard-focusable.
- **Hints** (`checkbox/radio/toggle__hint`): secondary color. Two variants:
  default renders inline after the label (em-dash prefix in the text);
  `--hint-below` renders on its own line under the label (no dash).

Known exception: the select chevron, checkbox check, and search icon are
background-images and cannot inherit `currentColor`; their colors are pinned
inside utf8 SVG data URIs (dark-mode overrides for chevron and search icon).
Only place a color bypasses the token cascade.

## 7. Icons

- Set: **Tabler only** (R4). Always SVG, never icon fonts.
- Delivery: **inline SVG sprite per page**, built from the SVG files
  in `icons/`. Usage:
  `<svg class="icon" aria-hidden="true"><use href="#i-{name}"/></svg>`.
  Clean markup, native `currentColor`, zero external requests, no encoding.
- The three CSS background-image cases (select chevron, checkbox check,
  search icon) are readable utf8 SVG data URIs with pinned colors — the only
  icons outside the sprite.
- Icon source is the official Tabler set: copy the file verbatim from the
  `@tabler/icons` npm package into the icon folder. When adding a symbol to a page sprite,
  preserve the SVG's root stroke and fill attributes.
- Exception: `.admin-menu` and `.admin-bar` use real WP dashicons (the
  `wp-*.svg` files in the icon folder, from the `@icon/dashicons` npm
  package, GPL-2.0-or-later — WP core's own glyphs). Chrome only; never in kit
  components.

## 8. Content rules

- All placeholder text is **literal**: "Page title", "Card title",
  "Setting label", "Primary action", "Cell value", dates as
  `2026-01-01 00:00:00`, domain as `example.com`, user as "Username".
  Exception: the `.shell` sidebar uses real wp-admin menu labels
  (Dashboard … Settings) for realism; plugin submenu items stay literal.
- Page title is the largest text on any screen; plugin brand is
  `--heading-md` and never outweighs it. (One `.page-header` per screen,
  one `--primary` per footer, danger confirms via `.modal`: R6–R8.)
- Toast text mirrors the action verb ("Save changes" → "Changes saved").

## 9. Accessibility baseline

- Visible `:focus-visible` on tabs, buttons, all form controls, modal close,
  toggle track.
- Modal: `role="dialog"`, `aria-modal="true"`, labelled by `__title`.
- Toast: `role="status"`.
- Icons always `aria-hidden="true"`; adjacent label carries meaning.
- Current tabs use `aria-current="page"`.
- **Contrast is audited** (the source repo's build guard enforces it): ~29 real text/UI pairs per
  mode audited at the default accent — text AA 4.5:1, UI boundaries 3:1
  (WCAG 1.4.11), rgba softs composited over their real backgrounds. Dark
  mode passes clean (accent brightens to blue-300 with dark on-accent
  text; danger/success step up to text-grade primitives). One pinned
  wp-parity exception: wp's red-600 on gray-50 (4.40, floor 4.35). The
  shell/admin chrome is excluded — it never ships.
- Not yet done: reduced-motion audit (transitions are ≤150ms, likely fine).
