# BIOS — agent context

This folder is the BIOS kit: HTML/CSS material for designing WordPress
plugin administration screens. The kit may be edited. Your task here is design: composing screens as HTML files.

## Workflow

1. The owner describes their plugin. Propose a screen list first
   (map features to patterns per `docs/agent-heuristics.md` §2 and
   §13) and confirm it before writing files.
2. Before composing a screen, write its content model in one or two
   lines — the entities, settings, and columns this plugin actually
   has — and take every label on the screen from it. If a label cannot
   be filled from the plugin description, that is a question for the
   owner, not a placeholder to leave.
3. One HTML file per screen, created in `examples/` by copying
   `example.html` (it links `../tokens.css`; keep the relative path).
   Compose from existing components; the `examples/styleguide-*.html`
   group pages show every component's markup (`styleguide.html` is
   foundations + the index).
4. Quick configuration is one `:root` block (`--accent`,
   `--space-unit`, `--radius`) in a `<style>` element after the
   stylesheet link. The default is no block at all — the interface
   then follows the wp-admin color scheme (admin blue). Set `--accent`
   only when the owner supplies a brand color; if the owner delegates
   the choice ("decide for me"), that means the default. Deeper
   changes may edit `tokens.css` itself — keep
   its two-tier token structure and one-section-per-component layout
   so the styleguide stays truthful.
5. Run `python3 validate.py <screen>.html` before calling a screen done,
   and again after any edit. It reads `tokens.css` at run time, needs
   nothing but Python 3, and catches the drift that looks fine in a
   browser — an undefined token drops silently, an invented class renders
   unstyled. `components.json` carries the same information as data: its
   `tokens` block is the legal token surface (primitives to avoid, the
   accent knob, and every semantic role with its light/dark value).

## Conventions

These keep screens consistent with each other and with wp-admin.
Follow them unless the owner directs otherwise.

- The wp-admin chrome (admin bar and left menu) is context, not design
  surface: copy it from `example.html` unchanged — every core item,
  separator, and count bubble stays. Only the plugin's own menu item
  and submenu are renamed.
- Icons come from the Tabler set in `icons/`. The copied page's
  embedded sprite covers its existing icons; for a new one, add a
  `<symbol id="i-{name}">` to the sprite from the file's paths, or
  inline the SVG file with `class="icon"` keeping its attributes —
  `stroke="currentColor"` makes it follow the text color. Icons from
  other sets or drawn by hand tend to carry hardcoded fills that
  ignore state colors.
- Compose from existing components; copy their exact markup from the
  `styleguide-*.html` group pages. Do not reconstruct a component's
  class structure from memory or invent class names — if unsure a
  component exists, check the styleguide and `docs/contract.md` §5 first.
- The hard rules are `docs/contract.md` §2 (R1–R9); `validate.py` checks
  the mechanical ones. In practice: if something needs styling, reach for a
  component/utility class or add a proper component to `tokens.css` (BEM
  block, semantic tokens, its own section) — then every screen can use it.
  State a stylesheet cannot know travels as a custom property
  (`style="--fill: 70%"` on `.progress__bar`). To hide an element use the
  `hidden` attribute, not inline `display:none`.
- Vertical spacing is `.stack` + gap, not margins or `<br>`. When a
  flex gap "isn't working," the fix is usually a missing `.stack`
  wrapper on the intermediate element, not a margin.
- A drawer or modal has exactly one `__header` and one `__footer`.
  Multiple states (form → success) are separate inner bodies shown or
  hidden with the `hidden` attribute; the title updates in place. Never
  duplicate the chrome per state.
- Spacing that looks wrong is usually a nesting problem, not a padding
  problem: put the element in the slot the kit expects (e.g. a
  `page-header` inside the first `card__header` so a `.views` row
  inherits the card's padding) rather than adding overrides.
- Global visual changes are made once in `tokens.css` on the
  component's own section, never repeated per page.
- Labels are design; data is placeholder. Field labels, headings,
  section names, columns, option values, and help notes are written
  for the owner's actual plugin — derive them from its domain;
  "Setting label" left on a real screen is unfinished design. Data
  values (numbers, dates, names, table rows) stay representative
  placeholders; never invent statistics, testimonials, or facts.
- Every collection screen includes its `.empty-state`; every
  long-running job its loading state (`spinner`/`skeleton`/
  `progress`).
- Verify each screen in a browser, in light and dark
  (`data-theme="dark"`), before moving on.

## When you need X, reach for Y

The kit already has a component for most needs — find it before building.
Specs live on the `styleguide-*.html` group pages; this maps intent to
the existing piece so you don't reinvent one.

- Settings tabs (General / Security / …) → `.tabs--boxed` bare on the
  canvas under the `.page-header` (the native WP settings look), or
  `.tabs--card` inside a titled flush card when the tabbed area is one
  object among others on the screen. Either way the strip sits directly
  under a title — never directly under another nav strip. If the user
  explicitly asks for the direct stack (`.subnav--tabs` fused under the
  primary tabs, no title between), give one heads-up — the page title
  can only name one of the two levels, so one floats unanchored — then
  build it as asked, with a compound `.page-header` title below the
  stack naming the full path ("Settings: General").
- List filters (All / Published / Draft) → `.views` with `.views__count`.
- Detail screen reached from a list row → breadcrumb + back link that
  preserves the list's filter/pagination in the URL (back from page 3 of
  "Active" lands on page 3 of "Active"). Deeper drill-ins carry ≥2
  breadcrumb ancestors.
- Long settings page (~2+ viewport heights) → `.section-index` ("On this
  page" anchor ToC); static by default, `--sticky` only in a `.columns`
  aside rail.
- Premium / locked feature → the existing `.badge--pro` on the label,
  the control rendered `disabled`, and an `.upsell` banner beside the
  group. Never invent a new "pro" indicator.
- Bottom-of-screen unsaved-changes prompt → `.save-bar`.
- Slide-in editor / detail panel → `.drawer` (+ `.drawer-overlay`).
- Confirm a destructive action → `.modal`.
- Empty collection → `.empty-state`; in-progress work → `spinner` /
  `skeleton` / `progress`.
- Page title inside the first card (when asked) → put `page-header`
  inside that card's `card__header`; the first card carries no icon.

## Interactivity

Behaviour lives in one small shared file, `examples/bios.js`, wired
through `data-*` attributes — never inline `onclick`, no framework.
Load it once per screen with `<script src="bios.js"></script>`. It
covers the common hooks (state is toggled via the `hidden` attribute and
ARIA, never inline styles):

- Theme toggle — `[data-theme-toggle]`.
- Drawer / modal — `[data-open="ID"]` opens the `.drawer-overlay#ID`;
  `[data-close]` / backdrop click / Esc closes; focus moves in and
  returns; the page locks behind it. Multi-step drawers (form →
  success) use `[data-drawer-panel="KEY"]` bodies switched by
  `[data-drawer-goto="KEY"]`, with the header `[data-drawer-title]`
  updating from each panel's `data-panel-title`. One header/footer.
- View switch — `[data-view="KEY"]` on a `.views__view` shows the
  matching `[data-view-panel="KEY"]`.
- Copy — the `.copy-field` component works automatically; or a bare
  `[data-copy="TEXT"]` / `[data-copy-target="#sel"]` button.
- Save bar — mark tracked inputs `[data-save-bar-field]`; the
  `[data-save-bar]` appears only when a value actually differs (and
  hides again on revert). `[data-save-discard]` restores, `[data-save-submit]`
  commits the new baseline.

The file header documents the full contract. Plugin-specific logic
(e.g. writing a form value into a success panel) stays in the plugin's
own small script; `bios.js` owns the chrome and flow. Extend the contract
there rather than scattering one-off scripts across pages.

## Heads-up: wp-admin integration

These designs will eventually render inside wp-admin, where WordPress
core styles collide with unscoped markup. The validated procedure is
`docs/wp-admin.md`: wrap the screens in a plugin-specific class, add
the neutralizer snippet, and scope the stylesheet with a mechanical
prefix pass. Raise it when the owner asks about integration; apply it
on request. Knob overrides then target the wrapper class instead of
`:root`.

## References

- `docs/agent-heuristics.md` — decision rules; read before composing.
- `docs/contract.md` — the contract: hard rules R1–R9, tokens, component inventory.
- `.claude/skills/bios-setup/SKILL.md` — the setup skill (plan → confirm → build). Claude Code loads it when this folder is open; other agents can follow it as the procedure for a whole plugin.
- `examples/styleguide.html` — foundations + component index; specs on the `styleguide-*.html` group pages.
- `validate.py` — the screen check: `python3 validate.py <file>`. Run it; don't eyeball it.
- `components.json` — the same kit as data: every component, plus the legal token surface.
- `docs/wp-admin.md` — the wp-admin integration procedure.

## Before you call a screen done

- [ ] **`python3 validate.py <screen>.html` passes.** It checks what a browser
      won't tell you: every `var()` resolves, every class exists, no inline
      styles beyond custom properties, no raw literals, no primitives in
      markup, no page-local CSS. If it is clean, those six rules are met —
      don't re-audit them by eye.
- [ ] Every component copied from the styleguide, not inferred.
- [ ] Vertical spacing via `.stack`; no `<br>` or ad-hoc margins.
- [ ] One `__header`/`__footer` per drawer/modal; states toggle `hidden`.
- [ ] Padding fixed by correct nesting, not overrides.
- [ ] Pro features: `.badge--pro` + `disabled` control + `.upsell`.
- [ ] Global style changes made once in `tokens.css`.
- [ ] Requested / wp-admin nav patterns followed; chrome unchanged.
- [ ] Behaviour in `bios.js` via `data-*` hooks, with ARIA.
- [ ] Verified in a browser, light and dark (`data-theme="dark"`).
