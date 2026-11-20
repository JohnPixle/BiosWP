---
name: bios-setup
description: Set up and build a WordPress plugin admin UI with the BIOS kit. Use when the user describes their plugin and wants its admin screens designed or built, or asks to configure the BIOS layout (accent, density, navigation, screens).
---

# BIOS setup — plan, confirm, build

You are building a plugin admin UI on the BIOS kit. The rules live in the
kit's docs — this skill only sequences the conversation. Read first, in
this order: `CLAUDE.md` (or the kit README) →
`docs/agent-heuristics.md` (every decision rule; §13 maps plugin concepts
to components) → `docs/contract.md` §2 (hard rules R1–R9) and §5 (the
component inventory). The styleguide is
the anatomy reference. The six reference patterns you compose from live in
four files: `examples/example.html` (dashboard · settings · list, on one
screen) and the three `examples/shell-*.html` variants (onboarding · sidebar
layout · full-width).

Work in three beats. Never skip a gate.

## 1 · Plan out loud

The user describes their plugin. From that description, propose in plain
chat — no files, no diagrams:

- **Screens** — each mapped to one of the six reference patterns
  (dashboard · settings · list · onboarding · sidebar layout · full-width).
- **Navigation** — per the nav ladder (heuristics §2b): chrome tabs OR
  sidebar submenu, never both; subnav/tabs--card only as level 2.
- **Per screen, the component list** — chosen via the domain map
  (heuristics §13) and the inventory. Name the components, not vague areas.
- **The setup answers, inferred** — fill the configuration from the
  description and state your assumptions instead of interrogating:
  1. plugin name (topbar brand)
  2. accent: brand hex or follow the wp-admin scheme (default: follow —
     also when the user delegates the choice; never invent a brand color)
  3. screens (default: dashboard + settings)
  4. navigation model + labels
  5. content width (default 1100px; full for list-heavy screens)
  6. density + radius (default: 4px unit, 4px radius)
  7. card icons on/off (default: on, all cards or none)
  8. dark-mode toggle (default: yes)
  9. modules: license · upsell/pro · AI (default: none)

  Only ask about the ones you genuinely cannot infer.

## 2 · Confirm before composing

Two things need explicit user approval — a sitemap is cheap to change,
five built screens are not:

- **The screen list + navigation.** Wait for a yes.
- **Anything the kit doesn't cover.** Flag each gap with your call:
  compose (existing pieces, new arrangement) · extend (new proper
  component via the extension protocol, heuristics §1) · out of scope
  (WP-native pickers, heuristics §6b). If the plan needs more than two or
  three new components, the plan is wrong — remap it, don't build it.

## 3 · Build screen by screen

- Start every screen from a **copy of its reference page** — never from a
  blank file. Keep the shell chrome; replace the plugin body.
- Labels are design; data is placeholder. Write field labels, headings,
  columns, and option values for the plugin's actual domain (a content
  model per screen: its entities, settings, columns). Data values stay
  representative — never invent stats, prices, or testimonials.
- Configuration deviations from defaults go in one `:root` override block
  (same format the styleguide customizer emits) — never edits to
  component rules.
- Every collection screen ships its `empty-state`; every long-running job
  ships its loading state (`spinner`/`skeleton`/`progress`). Build them
  in from the start, not on request.
- Verify each screen before moving on: `python3 validate.py <screen>.html`
  must be clean, then open it in a browser and check light and dark
  (`data-theme="dark"`).
- After each screen, say in one line which heuristics drove the
  non-obvious choices, then move to the next.

Everything not sequenced here is already decided by the heuristics —
follow them, don't restate them, and don't improvise around them.
