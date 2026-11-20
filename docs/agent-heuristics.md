# BIOS agent heuristics

Decision rules for building plugin screens with BIOS. The manifest tells you
*what exists*; this page tells you *how to choose*. Rules are terse on
purpose — when two options are both valid, the rule below picks one.

## 1 · Prime directives

- The model: **knobs set values → tokens name them → components consume
  them → screens compose them.** Never let a layer reach around another.
- The hard rules R1–R9 live in `docs/contract.md` §2; this page assumes
  them and cites them by number.
- **Extension protocol.** BIOS is a baseline, not a ceiling — custom UI is
  expected. When nothing fits, go custom *on the system*, in this order:
  1. Compose first: most "custom" needs are existing components in a new
     arrangement (cards + stacks + panels cover a lot).
  2. Extend properly: build the new piece as a real component — BEM block,
     semantic tokens and knobs only, gap-based stacking, focus-visible,
     dark mode for free. It should be indistinguishable from a kit
     component in code review.
  3. Never: inline styles, one-off CSS with raw values, primitives in
     markup, or margins. That's the rot vector — not customization itself.
     The single exception is state a stylesheet cannot know, passed as a
     custom property (`style="--fill: 70%"`) — never as a raw declaration.
     `python3 validate.py <file>` enforces all of this; run it rather than
     trusting a read-through.
  4. Tell the user when a custom piece looks broadly reusable — it may
     belong in their component layer (or upstream in BIOS).
- Speak in semantic roles and knobs, in markup and in proposals (R1).
- Customization goes through the knobs (accent, space unit, gaps, radius,
  widths, presets) — never by editing component rules.

## 2 · Screen selection

- Landing/overview → dashboard pattern: status card + getting-started.
- Configuration → settings pattern: settings rows + save-bar.
- Collections (logs, entries, items) → list pattern: list-table in a
  flush card.
- All three live on `examples/example.html` (one working reference page);
  the shell variants below have their own pages.
- First-run/wizard → `shell-onboarding`: no plugin topbar/tabs, centered
  panel with stepper.
- License/newsletter/links/upsell alongside content → `shell-sidebar`
  (`.columns`).
- Wide tables → `shell-fullwidth` (`.plugin__body--full`).
- Tabs must fit one row — see the overflow rule in §2b.
- The wp-admin chrome (admin bar + admin menu) is context, not design
  surface: reproduce it in full — all core items, separators, counts.
  Only the plugin's own menu item and submenu change.

## 2b · Navigation

- **One PRIMARY navigation per screen.** Chrome `.tabs` is a form, not a
  fixed level — the strip plays one of two roles:
  - No sidebar submenu (single menu-item plugin) → the strip under the
    topbar IS the primary nav (top-level sections). A second strip never
    stacks directly on it — but a *titled* secondary level below it is
    the legal way to add depth: `page-header → .subnav--links` (lightest),
    `page-header → .tabs--boxed` bare on the canvas (the standard
    settings screen — the wp-native look; core settings pages live on the
    body bg, not in cards), or a titled `.card--flush` + `.tabs--card`
    (when the tabbed thing is one object among others on the screen).
    Worked frames: `examples/navigation-patterns.html` ("Titled second
    level under a tab").
  - Sidebar submenu is the primary nav → a page reached from it may carry
    at most one *secondary* chrome `.tabs` strip under its `.page-header`
    as that page's section nav (the canonical WP settings-tabs pattern:
    sidebar picks the screen, tabs pick the section) — always at lower
    visual weight than the primary, never competing with it.
  - A drill-in `.tabs--card` does not count as a second strip: it lives
    inside a card behind a breadcrumb + back + card title, so it is one
    level *down*, not a competing primary. The card + breadcrumb + back
    must make that subordination unmistakable.
  - Forbidden: two strips of equal visual weight/role on one screen, or a
    top-level tab strip *and* the sidebar submenu both acting as the
    plugin's main switch.
- **The labeled-parent rule** — the structural test for nav nesting: every
  nav strip must sit directly under a labeled parent, either the
  `.page-header` title or the drill-in card header whose breadcrumb +
  title labels the `.tabs--card` level. Two stacked strips create a
  labeling paradox — the page title can only name one level, so one strip
  always floats unanchored. Deterministic agent test: *is there a title
  element directly between this strip and the strip/level above it?*
  Yes → legal nesting. No → misplaced strip; restructure: push a level to
  the sidebar submenu, move the inner level into a drill-in `.tabs--card`
  (it brings its own titled header), or split the screen. Never fix by
  stacking a second strip. If you can't name the parent of a strip, the
  strip is wrong.
  **This is a default, not a prohibition.** Never build a bare direct
  stack (`.subnav--tabs` fused straight under the primary strip, no title
  between) unprompted. If the user explicitly asks for it, give one
  heads-up — the page title can only name one level, so one nav level
  floats unanchored — then build it without further protest, always with
  a compound `.page-header` title below the stack naming the full path
  ("Settings: General"): one title anchoring both levels at once. The
  override is per-request, triggered only by the user's explicit ask,
  never by thematic distinctness or your own judgment. The depth cap
  is not overridable: never a third row on one screen, titled or not
  (Primer's two-level ceiling; Nielsen on spatial memory) — depth beyond
  primary + one secondary always moves across screens.
- Subpage sections (drill-in page reached from a main page) → `.tabs--card`
  inside a `.card--flush`: card header hosts the `.page-header` (with
  `__breadcrumb` + `__back`), then the tabs row, then `.card__body` as the
  tab panel. See `shell-sidebar.html`.
- `.tabs--card` is sub-navigation only. Never use it in parallel with
  chrome `.tabs` on the same screen — chrome and card tabs are the same
  component and read as the same level of hierarchy.
- The full navigation ladder — levels differ by form, not just placement:
  1. Primary: the sidebar submenu, OR (single menu-item plugins) a chrome
     `.tabs` strip as the top-level switch. One or the other is the plugin's
     main switch between screens.
  2. Secondary (optional, max one) — section nav within the current page,
     under either primary (sidebar submenu or a tabs-primary). Always
     below the titled `.page-header` (or inside a titled card). Pick one
     by weight: `.subnav--links` (lightest — a few light pages) ·
     `.tabs--boxed` bare on the canvas (the standard settings screen,
     wp-native) · chrome `.tabs` under the header (WP settings-tabs,
     underline strip) · or a titled `.card--flush` + `.tabs--card` (the
     level as one contained object). Never stack two of them.
  3. `.views` = filtering, not navigation: same collection, filtered
     subsets, above the list-table. Doesn't count as a nav level and may
     coexist with any of the above.
- **Depth comes from composing screens, not stacking bars.** The reason
  the combinations above matter: plugin settings routinely outgrow what one
  flat nav can hold. Don't answer that by adding a second tab row — go a
  level *down* by composition: sidebar submenu (screen) → page `.tabs`
  (section) → drill-in `.tabs--card` (sub-section of a subpage). Each
  individual screen still obeys "one chrome `.tabs` strip, max one
  secondary"; the depth lives across screens. When a settings screen feels
  overcrowded, that's the signal to push a level down, not to widen the
  current row. Worked examples: `examples/navigation-patterns.html`.
- **Tab count is a layout rule, not a quota.** Hard rule: a `.tabs` strip
  must fit ONE row without wrapping. 3–6 items is the soft target
  (convention — no study fixes a count). When items would wrap or exceed
  the container → restructure: split the screen, push a level down to
  `.tabs--card`, or move sections to the sidebar submenu. Never wrap tabs
  to a second row (wrapped rows destroy spatial memory — Nielsen), and
  never reach for a "More"/overflow tab as the default fix — it hides
  content. `.tabs--segmented`: 2–4 items only (interchangeable views of
  one object).
- Different content → tabs. Same collection, filtered subsets → `.views`
  (text-link row with counts above the list-table).
- Text-row grammar: `.subnav` = spaced links, no pipes, no counts;
  `.views` = pipes + counts. Current item in both is bold text-primary —
  "colored = clickable, dark = you are here".
- Tab badging: counts render on `.views` as `Label (n)`. A counter may
  appear on a `.tabs` item only when it reports the size of a related
  resource collection on the destination page ("Logs (12)") — never to
  express filtering. If a row needs counts for filtered subsets of the
  current collection, it is `.views`, not `.tabs`.
- **Breadcrumbs mark journey, not structure.** The invariant is the
  labeled parent (N11 above); the breadcrumb answers a different
  question — *how did the user get here, and is the way back still on
  screen?* Arrived by drill-in (a list row, a link from another page —
  the parent left the screen) → the card header needs `__breadcrumb` +
  `__back`. Selected by a visible parent strip (a primary tab, the
  sidebar submenu) → no breadcrumb needed; the title alone anchors the
  level, because the way back never left the screen. So a titled
  `.card--flush` + `.tabs--card` with no breadcrumb is legal when the
  parent strip is visible above it. Container rules that remain hard:
  `.tabs--card` (underline) and `.tabs--vertical` are only valid inside
  a `.card--flush` — bare, they read as an orphaned second header.
  `.tabs--boxed` is the exception: it may sit bare on the canvas under a
  `.page-header` (its current tab takes the body bg and fuses into the
  page — the native WP settings look) as well as inside a card. (The
  container mapping is a BIOS convention that systematizes NN/g
  breadcrumb + Primer parent→child guidance, not a tested finding.)
- `.tabs--card`'s three siblings (`--boxed`, `--vertical`, `--segmented`) are the
  same sub-navigation rung, not new levels — pick by visual weight and
  layout, never by "which one hasn't been used yet":
  - `.tabs--card` (underline): the default. Reach for it first.
  - `.tabs--boxed`: the folder tabs. Two legal homes — bare on the canvas
    under a `.page-header` (the standard settings-screen secondary; the
    current tab fuses into the body bg) or inside a card in the same
    contexts as `.tabs--card`, when the screen is dense enough that an
    underline reads too flat and the current section needs a stronger
    anchor into its panel.
  - `.tabs--vertical`: same drill-in context, use only when the screen is
    already a `.columns` two-column layout — it's a rail, not a strip, and
    needs a side column to live in.
  - `.tabs--segmented`: the one exception that doesn't require a breadcrumb —
    it's for a small (2-4) equally-weighted *toggle* (Visual/Code,
    Day/Week/Month), not a section list. If the options aren't
    interchangeable views of the same thing, it's the wrong pick; use
    `.subnav` or `.tabs--card` instead.
- Drill-in wayfinding (the Stage 2 rules):
  - **Breadcrumbs may carry ≥2 ancestors** (list → item → sub-item).
    Every ancestor is a link, the current level plain text; the back
    button targets the *nearest* ancestor, not the list.
  - **Back-to-list is mandatory on row-reached detail screens**, and it
    returns to the originating list state: the back href preserves the
    list's `.views` filter and pagination (leave page 3 of "Active" →
    return to page 3 of "Active").
  - **`.section-index`** (optional) for settings pages past ~2 viewport
    heights: an anchor-link "On this page" ToC. Static by default;
    `--sticky` only inside a `.columns` aside rail (the kit sets root
    `scroll-padding-top`). Not a nav level — orthogonal to the ladder,
    like `.views`.
- Anti-patterns, forbidden outright:
  - **Top-level admin-menu land-grab.** Single-purpose config registers
    as a submenu under **Settings** (or Tools, for utilities) — never a
    new top-level admin-menu item. The defining wp-admin IA failure;
    a top-level item is justified only for a genuinely multi-screen
    product surface.
  - **ALL-CAPS or Title Case nav labels.** Tab, subnav, views, and menu
    labels are sentence case ("Email notifications", not "Email
    Notifications" or "EMAIL NOTIFICATIONS"). Scoped to nav only —
    list-table uppercase column headers are a separate idiom and stay.

## 3 · Container choice

- Default container is `.card`. Everything on a screen lives in cards.
- **Grouped fields — single container is the default for settings.** One
  `.card--flush` holds all groups, with the `.page-header` inside its
  `.card__header` (title in the card, not on the canvas) and groups divided
  by `.card__section-title` (plain heading). Reads as one focused surface
  instead of a pile of boxes. Tabs are optional — add `.tabs--card` under
  the header only when the screen has enough sections to warrant them; the
  title-inside single container is the default even with no tabs. Reach for
  one `.card` per group only when the groups are genuinely independent (not
  sections of one settings screen). Pick one per screen, not a mix.
- **Title placement follows the container:** title inside the card needs one
  owning card (the single-container default). Multiple independent cards
  keep the title on the canvas above them.
- `card__icon` is optional per product, not per card: keep icons on all
  cards or none (default: on). This is a setup-time question for the
  user, not a per-screen decision.
- Card hosting a full-bleed child (list-table) → `.card--flush`.
- Whole card optional/collapsible → `.card--collapsible` (details/summary).
- Collapsible section *inside* a card → `.panel`, grouped with
  `.stack--tight`. Never nest cards in cards.
- Secondary detail or editing context → `.drawer` (right, 420px).
- Blocking decision → `.modal`. Highlighted static info inside a card →
  `.card__well`.
- Aside widgets are plain `.card`s — there is no special widget component.

## 4 · Feedback choice

- Persistent condition the user must know about → `.notice` (above cards).
- Transient result of an action → `.toast` (`role="status"`), text mirrors
  the verb: "Save changes" → "Changes saved".
- Light anchored notification/confirmation near its trigger → `.popup`
  (`role="status"` + dismiss, or `role="alertdialog"` + actions).
- Destructive or irreversible → `.modal` (`role="dialog"`,
  `aria-modal="true"`). Never confirm destruction with a popup or toast.
- No data yet → `.empty-state`, always offering the next action.
- Loading: an action being processed → `.spinner` (in the button, trigger
  disabled); a region waiting for data → `.skeleton` sketching its layout;
  a long operation with known progress → `.progress` (never animate a fake
  percentage — unknown duration is a spinner).
- A short label for an icon button or truncated value → `.tooltip`
  (`data-tip`). Anything sentence-length → `__hint` or `.popup`; tooltips
  never hold actions.

## 5 · Actions and buttons

- The primary action is one per footer or save-bar (R7).
- Default (outline) button for secondary actions; `--link` for tertiary.
- `--danger` only for destructive actions; the confirmation is R8.
- Screen-wide settings save → `.save-bar` (sticky, shown only while dirty).
  Card-scoped action → card footer. Never both on one screen.
- Sticky `.save-bar` earns its keep only when the form is long enough that
  the primary action would otherwise scroll out of view (multi-card
  settings pages, long option lists). A settings screen that's a single
  card fitting in the viewport gets a plain `.card__footer` with Save
  (+ Discard) inline — no sticky positioning. Default to the card footer;
  reach for `.save-bar` only once the page is provably long.
- Icon-only buttons need `aria-label`. Small contexts use `--small`.
- Three or more actions on one item, or any destructive one → `.menu`
  (kebab); one or two safe actions stay inline. Danger items sit last
  behind a `__divider` and still confirm via `.modal`. Filtering is
  `.filter`, never a menu.

## 6 · Forms

- Inside a card, label-left rows → `.settings` group of `.setting` rows
  (wp form-table). Standalone/vertical (drawers, onboarding) → `.field`.
- Hints: inline after the label (em-dash) is the default; use
  `--hint-below` when the hint is a full sentence or the control is a toggle.
- Checkbox = independent options. Radio = one of 2–5 visible options.
  Select = one of many. Toggle = immediate on/off state (no save needed) —
  don't mix toggle and checkbox semantics.
- Multiple free values → `.tag-input`. Multiple from a known set →
  `.filter` multi-select. Add the filter's search field only above ~7 options.
- Tags *displayed* on an item (read-only or navigating) → `.tags` of
  `.tag` chips — the input only when the user edits them. Filtering a
  collection by tag with counts → `.views`; no weighted tag clouds.
- Plain selects for simple filtering; `.filter` panels are advanced — use
  sparingly.
- File uploads → `.upload`. Default: the row form (native input + outline
  `.button` submit — the WP install/import register). `--dropzone` only
  when drag-and-drop genuinely helps (bulk/media). Selection display is
  native; drag-over is host JS toggling `--dragover`.
- License keys: monospace input, masked `XXXX-XXXX-XXXX-XXXX`; Activate is
  `--primary`, Deactivate is outline.
- Validation is per-field: `--error`/`--success` + `__message` (icon + text,
  replaces the `__hint` while shown; `aria-invalid` + `aria-describedby`).
  Form-level results are a `.notice` above the cards — never both repeating
  the same message.
- A value the user copies but never edits (API key, shortcode, webhook URL)
  → `.copy-field`. A value the user searches with → `field__input--search`.
- Code by role: one read-only line + copy → `.copy-field` · multi-line
  read-only display (shortcode example, config sample, log excerpt) →
  `.code-block` · editable code → `.field` + monospace textarea (plugins
  mount a real editor; never restyle third-party editors).
- User-ordered sets of rows (mappings, rules, social links) → `.repeater`.
  Rows hold controls; collapsible content rows are `.panel`s instead.
- Conditional logic ("show/run when …") → `.conditions`: subject ·
  operator · value rows composed from field controls; rows AND within a
  group, groups OR between them. Not a `.repeater` (no ordering) and not
  list filtering (that's `.filter`/`.views`).

## 6b · WP-native controls (out of scope by design)

- Media/file pickers, date/time pickers, color pickers, and the WYSIWYG
  editor are **WordPress-provided UI — BIOS deliberately does not restyle
  or rebuild them.** Call the core APIs (`wp.media`, `wp-color-picker`,
  `wp_editor()`, native `input[type=date]`) and let them render as core.
- Integration pattern: the *trigger and frame* are BIOS — a `.field` or
  `.setting` row wraps the control, an outline `.button` ("Choose image",
  "Select file") opens the core picker, and the chosen value renders back
  into BIOS components (thumbnail in the field, filename as `.tag`,
  hex value in a `field__input`).
- Do not invent a BIOS lookalike for these — a half-rebuilt media modal is
  worse than the core one. If a product truly needs a custom picker, that's
  extension-protocol territory (§1), not a screen-level improvisation.

## 7 · Tables

- Read-only listing inside a card → `.table`. This applies anywhere a
  block has ≥2 comparable columns (name/type/date/status and the like) —
  including a dashboard widget like "Recently edited". Hand-rolled flex or
  grid columns standing in for tabular data are never correct; if it has
  headers and rows, it's `.table` (or `.list-table` once selection/bulk/
  filters/pagination show up).
- Screen-level collection with selection, bulk actions, filters, pagination
  → `.list-table`, wrapped in `.card--flush` + `.list-table--flush` so the
  screen keeps the card heading.
- Row variants mean state, not decoration: `--selected` pairs with its
  checked checkbox; `--warning`/`--danger` are row-level conditions;
  `--disabled` disables the checkbox and hides quick actions.
- Quick actions live in the primary cell, hidden until hover/focus-within;
  a danger quick action still needs a `.modal`.
- Column headers repeat in `tfoot`; toolbar repeats below with pagination.
- Paging outside a list-table (card grids, log views) → standalone
  `.pagination`. Prev/next + "1 of 5" only — no page-number lists; disable,
  don't hide, the edge buttons.
- Dashboard numbers → `.stats` grid of `.stat`s in a card body; deltas are
  `.badge --success/--danger`, not new colors.

## 8 · Spacing and layout

- Stack blocks with `.stack` (`--tight` for controls, `--loose` for
  sections) — R2.
- Need a new rhythm? Propose a gap role first. Never a one-off margin.
- Between settings rows, the `.settings` group owns the rhythm — don't add
  spacing around `.setting`s.
- Widths come from the `--width-*` knobs; don't set component widths inline
  (demo-only exceptions aside).
- Breakpoints (700px settings stack, 960px columns stack) are constants —
  don't try to tokenize or override them.

## 9 · Theming and branding

- All accent color flows through `--accent`/`--accent-hover`/`--accent-soft`.
  Never hardcode a blue; never bypass the chain.
- Unbranded plugins do nothing: the accent follows the user's wp-admin
  color scheme automatically. Brand = set the three knobs (hover = HSL
  lightness −10, soft = 10% alpha tint).
- Dark mode = `data-theme="dark"` (R5).
- `--color-action-soft` is for tinted fills only (icon tiles, soft
  surfaces) — never for text.
- Roundness: `--radius` master; per-part `--radius-button/card/input`.
  Pills (badges, toggle, tags) are shapes — they don't follow the master.

## 10 · Content rules

- Labels are design, data is placeholder (R9): field labels, headings,
  columns, and option values come from the plugin's domain.
- Page title is the largest text on any screen; the plugin brand is
  `--heading-md` and never outweighs it.
- Leads end with a "Learn more" docs link.
- Upsell copy sells value in one sentence; toast copy is the action verb
  past-tensed.

## 11 · Accessibility floor

- `:focus-visible` on everything interactive — if you add an interactive
  element, it ships with a focus style.
- Contracts: modal/drawer `role="dialog"` + `aria-modal` + labelled by
  title · toast/notification popup `role="status"` · confirmation popup
  `role="alertdialog"` · current tab `aria-current="page"` · current step
  `aria-current="step"` · trigger of an open panel `aria-expanded`.
- Icons are always `aria-hidden="true"`; the adjacent label carries meaning.
  Icon-only controls get `aria-label`.
- Collapsibles are native `details/summary` — don't rebuild them with divs.

## 12 · Upsell etiquette

- One `.upsell` banner per screen, maximum. Never stack them.
- Locked features render disabled with an inline `badge--pro` — visible,
  never hidden. Locked add-ons (`addon--pro`) keep their full
  description; only the icon tile mutes (lock icon).
- Upsell surfaces use `--color-action-soft` — promotion is not a warning;
  never use state colors for it.
- In narrow asides, use `.upsell--stacked`.

## 13 · Domain → component map

When translating a plugin's features into UI, map directly — don't
invent intermediate abstractions:

- Collection of things (logs, subscribers, orders) → `.list-table` in a
  flush card, `.views` above it for subsets.
- Configuration group → `.settings` rows (one screen or tab per group).
- Thing with a status → `.badge` / list-table row variants.
- Long-running job (import, scan, sync) → `.progress` while running,
  `.toast` on completion.
- First-run flow → onboarding shell + `.stepper`.
- Numbers to monitor → `.stats` grid in a dashboard card.
- Key / connection to an external service → `.license` or `.copy-field`,
  consent via `.notice`.
- AI feature → `.ai-suggestion` next to its field; `.chat` only when
  conversation itself is the feature.
- Every collection ships its `.empty-state`; every job ships its loading
  state — these are part of the screen, not additions.

---

*Companion docs: `docs/contract.md` (the contract; hard rules R1–R9), `docs/customization-notes.md`
(the knobs), the styleguide pages (`styleguide.html` index + `styleguide-*.html` specs, live demos).
Building a whole plugin end-to-end: `skills/bios-setup/SKILL.md`
(plan → confirm → build).*
