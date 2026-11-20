# BIOS

A component system for WordPress plugin administration screens:
a free, open-source kit you can use, edit, and share.

## Package contents

| Path | Contents |
|---|---|
| `tokens.css` | The stylesheet: design tokens and all components. The example pages link it. |
| `examples/` | Reference pages. `styleguide.html`: foundations + component index (live customizer on every guide page); specs on six `styleguide-*.html` group pages. `example.html`: a live settings demo alongside visual dashboard and list examples. Three shell layout variants, and `ai-components.html`, a reference screen for the AI set (chat, inline suggestions, consent). Open directly in a browser. |
| `components.json` | The kit as data: every component (classes, anatomy, variants, a snippet or layout references) plus the token surface — primitives, the accent knob, and every semantic role with its light and dark value. For agents and tooling. |
| `validate.py` | Checks a screen against the kit: unresolved tokens, class names with no rule, inline styles, raw literals, primitives in markup, page-local CSS. `python3 validate.py my-screen.html`. Python 3, no dependencies. |
| `icons/` | The Tabler icon files used by the kit, plus the wp-admin chrome glyphs. Source for adding icons to a page. |
| `docs/` | Documentation: `index.html` (the manual), the contract (`contract.md`: hard rules, tokens, inventory), decision rules (`agent-heuristics.md`), configuration notes (`customization-notes.md`), and the wp-admin integration procedure (`wp-admin.md`). |
| `.claude/skills/bios-setup/SKILL.md` | The setup skill: plan → confirm → build for a whole plugin. Claude Code loads it automatically; other agents can read it as the procedure. |
| `LICENSE` / `CHANGELOG.md` | MIT license for BIOS, and what changed per version. |
| `THIRD-PARTY-LICENSES.md` | License terms for the icon files in `icons/` (Tabler Icons, MIT; Dashicons, GPL-2.0-or-later). |

## First use

1. Open `examples/styleguide.html` in a browser. It is the component
   index and visual reference.
2. Open `examples/example.html`. Try editing a setting, then save or discard it. The dashboard and list patterns are visual examples.
3. To design your own screen, copy `examples/example.html` to a new file
   in the same folder and edit the markup.
4. Refresh the browser as you work. The examples link `tokens.css` by
   relative path, so keep copied files inside this folder.
5. From the kit root, run `python3 validate.py examples/my-screen.html` when your screen looks finished.
   A browser renders a drifted screen at about 95% correct — an unknown
   class simply goes unstyled, a mistyped token silently drops its
   declaration — so the things easiest to miss are the ones it catches.
   It reads `tokens.css` for the answers, so it stays right as you edit
   the stylesheet.

Start by changing markup, not CSS. Most plugin screens are built by
removing sections you do not need, duplicating the sections you do need,
and replacing literal placeholder text with your own labels.

## Customization

The quickest way to change color, density, and shape is one small block
of variables. Copy the block from the styleguide customizer. When setting a brand color by hand, set all three accent values:

```css
:root {
  --accent: #7f54b3;           /* brand color */
  --accent-hover: #664491;     /* hover color */
  --accent-soft: rgb(127 84 179 / 10%); /* tinted surface */
  --space-unit: 3px;   /* rhythm; default 4px */
  --radius: 0px;       /* container corner radius; default 4px (controls derive tighter) */
}
```

With no accent set, the interface follows the wp-admin color scheme.

You can edit any part of `tokens.css`. The file is organized in two tiers (primitive values →
semantic roles) with one section per component; keeping that structure
keeps the styleguide truthful and dark mode working, so it is worth
preserving as you customize. The conventions in
`docs/agent-heuristics.md` exist for the same reason: they keep
screens consistent, not restricted.

The useful mental model is:

```
knobs set values → tokens name them → components consume them → screens compose them
```

You do not need to understand the whole system before using it. Copy a
screen first; read the conventions when you need to decide between two
components.

## Into WordPress

The designs are plain HTML — how you render them from your plugin is
your choice. When they run inside wp-admin, WordPress core styles
interfere with unscoped markup; `docs/wp-admin.md` is the validated
procedure for that (a wrapper class, a short reset snippet, and a
mechanical scoping pass over your stylesheet).

## Working with an agent

Open this folder in your editor and describe your plugin. The folder
carries the agent's context (`CLAUDE.md` / `AGENTS.md`) and the
`bios-setup` skill: the agent proposes a screen list, confirms it with
you, then composes one HTML file per screen from the kit's components.

The agent docs are decision support, not homework. A human can begin
with the examples and only open `docs/agent-heuristics.md` when a layout
choice is unclear.
## License

The original BIOS code and documentation are available under the [MIT License](LICENSE).
Tabler Icons and WordPress Dashicons, including copies embedded in the examples,
keep their own licenses. See [Third-party licenses](THIRD-PARTY-LICENSES.md).
