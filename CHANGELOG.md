# Changelog

Notable changes to the BIOS kit, per version. Format: Keep a Changelog.
The kit version is listed in the `tokens.css` header.

## [Unreleased]

## [0.9.0] — 2026-09-25

Pre-release candidate for 1.0.0, the first packaged version.

### Added

- 49 components in six groups (navigation · forms & actions · containers &
  chrome · data · feedback · add-ons & AI), including the AI set (`chat`,
  `ai-suggestion`), monetization (`license`, `pricing`, `upsell`,
  `badge--pro`, `addons`), form validation, `upload`, `repeater`,
  `conditions`, `section-index`.
- `tokens.css`: two-tier tokens (primitives → semantic), accent knob that
  follows the wp-admin color scheme, density and radius knobs, eight
  wp-admin scheme presets, dark mode, WCAG-audited contrast in both modes.
- wp-admin chrome pair (`admin-bar`, `admin-menu`) and typography measured
  1:1 against WP 7.0.
- Reference pages: styleguide (foundations + six spec pages, live
  customizer), `example.html` (dashboard · settings · list), three shell
  variants, navigation patterns, AI components; `bios.js` behaviour helper.
- `components.json` — the kit as data; `validate.py` — the screen validator.
- Docs: contract (hard rules R1–R9, tokens, inventory), agent heuristics,
  customization notes, wp-admin integration procedure, docs page.
- Agent context (`CLAUDE.md` / `AGENTS.md`) and the `bios-setup` skill.
