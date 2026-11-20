# Using BIOS screens inside wp-admin

The kit's stylesheet is unscoped: it styles elements and BEM classes
directly. Inside a real wp-admin page, WordPress core stylesheets
(`forms.css`, `common.css`) target many of the same elements, and the
two interfere in both directions. This page is the integration
procedure. It was validated against a real WordPress installation
(WP 6.5.5, WP Playground): before the procedure, 36 selector
collisions; after, zero, in both directions.

Apply it when you move designs from the preview pages into a plugin.
Everything operates on your own copy of `tokens.css` — customizations
carry over because the transform is applied to your file, not to a
pre-built one.

Throughout, `myplugin-admin` is a placeholder: use a class based on
your own plugin's slug. A plugin-specific class also means two plugins
built on this kit can coexist on one site without sharing a scope.

## 1 · Wrap your markup

Everything your plugin renders sits inside one wrapper:

```html
<div class="myplugin-admin">
  ... your screens ...
</div>
```

## 2 · Remove the demo chrome from your stylesheet

The sections `4. SHELL`, `4b. ADMIN MENU`, and `4c. ADMIN BAR` exist
for standalone previews — inside wp-admin, WordPress renders the real
admin bar and menu. Delete those sections from your copy (and the
corresponding markup: your pages keep only what was inside
`plugin__topbar` / `plugin__body`).

## 3 · Scope the stylesheet

Transform every selector in your copy:

| Original selector | Becomes |
|---|---|
| `:root`, `body`, `html` | `.myplugin-admin` |
| `[data-theme="dark"]` and other `[data-…]` blocks | `.myplugin-admin[data-…]` |
| every other selector | `.myplugin-admin.myplugin-admin ` + selector |
| `@keyframes` blocks | unchanged |

The doubled class is deliberate: it gives every rule a base
specificity of two classes, which wins against wp-admin compounds such
as `.wp-core-ui .button:hover` regardless of load order. A single
class prefix is not sufficient — this was measured.

This is a mechanical, one-pass edit; an agent or a small script does
it in seconds.

## 4 · Add the neutralizer

Paste this block **before** the scoped stylesheet's rules. It reverts
the wp-admin core properties that the kit does not itself declare —
each line traces to a measured collision:

```css
.myplugin-admin.myplugin-admin :where(button, input, select, textarea) {
  appearance: revert;
  margin: revert;
  min-height: revert;
  min-width: revert;
  box-shadow: revert;
  line-height: revert;
  vertical-align: revert;
  transition: revert;
  background-image: revert;
  background-position: revert;
  background-size: revert;
  border-radius: revert;
  cursor: revert;
  color: revert;
  font: revert;
  text-align: revert;
  outline: revert;
  white-space: revert;
}
.myplugin-admin.myplugin-admin :where(h1, h2, h3, h4, h5, h6, p, ul, ol, li) {
  margin: revert;
  padding: revert;
}
.myplugin-admin.myplugin-admin :where(a) {
  transition: revert;
}
.myplugin-admin.myplugin-admin :where(label) {
  vertical-align: revert;
}
.myplugin-admin.myplugin-admin :where(.card) {
  position: revert;
  margin: revert;
  min-width: revert;
  max-width: revert;
  box-shadow: revert;
}
.myplugin-admin.myplugin-admin :where(.notice) {
  margin: revert;
}
.myplugin-admin { -webkit-font-smoothing: auto; }

/* The wrapper takes over the page-frame role: a flex column so the
   body grows and a bottom .save-bar rests at the viewport bottom. */
.myplugin-admin {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.myplugin-admin > :where(.plugin__body) { flex: 1; }
```

## 5 · Configuration inside wp-admin

Knob overrides target the wrapper (the scoped stylesheet defines its
values there, so `:root` overrides no longer reach them):

```css
.myplugin-admin {
  --accent: #7f54b3;
}
```

With no accent set, the interface follows the administrator's
wp-admin color scheme automatically.
