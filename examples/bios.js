/* BIOS behaviour — one small, framework-free helper shared across a
   plugin's screens. Wire it through data-* attributes on kit markup;
   never inline onclick. Every behaviour is optional and defensive: a
   screen that uses none of these hooks loads this file harmlessly.

   State is expressed by toggling the hidden attribute (backed by tokens.css
   [hidden]{display:none}) and ARIA — the helper writes no inline styles.

   ── Contract ──────────────────────────────────────────────────────

   Theme toggle
     [data-theme-toggle]            flips data-theme on <html>

   Drawer / modal   (anatomy: .drawer-overlay > .drawer > __header + __body + __footer)
     [data-open="ID"]               opens the .drawer-overlay with id="ID"
     [data-close]                   closes it (also: click the backdrop, or Esc)
     multi-step panels inside one drawer:
       [data-drawer-panel="KEY"]    a body; the first shown is the default
       [data-drawer-panel="KEY" data-panel-title="…"]  updates [data-drawer-title] on show
       [data-drawer-goto="KEY"]     a button that switches to panel KEY
     footer buttons scope themselves to a panel with data-drawer-panel="KEY"
     (shown only while that panel is active). Opening resets to the first panel.
     A URL hash matching the overlay id (#ID) auto-opens it.

   Copy
     .copy-field (input.copy-field__input + button.copy-field__button)  selects + copies, button flips to "Copied"
     or a bare [data-copy="TEXT"] / [data-copy-target="#sel"] button

   Save bar
     [data-save-bar-field]          a tracked field (input/select/checkbox)
     [data-save-bar]                the bar — hidden until a field differs from
                                    its initial value, hidden again on revert
     [data-save-discard]            restores initial values, hides the bar
     [data-save-submit]             commits: new values become the baseline

   Plugin-specific logic (e.g. copying a form value into a success panel)
   stays in the plugin's own small script; this file owns the chrome/flow.
   ─────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var root = document.documentElement;

  function on(sel, evt, fn) {
    document.addEventListener(evt, function (e) {
      var t = e.target.closest(sel);
      if (t) fn(e, t);
    });
  }

  /* ---- theme toggle ---- */
  on('[data-theme-toggle]', 'click', function () {
    root.dataset.theme = root.dataset.theme === 'dark' ? '' : 'dark';
  });

  /* ---- drawer / modal ---- */
  var lastFocus = null;

  function panels(overlay) {
    return overlay.querySelectorAll('[data-drawer-panel]');
  }

  function showPanel(overlay, key) {
    var title = overlay.querySelector('[data-drawer-title]');
    panels(overlay).forEach(function (el) {
      var active = el.getAttribute('data-drawer-panel') === key;
      // only flip panels that are bodies, not footer buttons scoped to a panel
      if (el.matches('.drawer__footer [data-drawer-panel], .modal__footer [data-drawer-panel]')) {
        el.hidden = !active;
        return;
      }
      el.hidden = !active;
      if (active && title && el.hasAttribute('data-panel-title')) {
        title.textContent = el.getAttribute('data-panel-title');
      }
    });
  }

  function firstPanelKey(overlay) {
    var bodies = [].filter.call(panels(overlay), function (el) {
      return !el.matches('.drawer__footer *, .modal__footer *');
    });
    return bodies.length ? bodies[0].getAttribute('data-drawer-panel') : null;
  }

  function openDrawer(overlay) {
    if (!overlay) return;
    lastFocus = document.activeElement;
    var key = firstPanelKey(overlay);
    if (key) showPanel(overlay, key);
    overlay.hidden = false;
    root.setAttribute('data-scroll-locked', '');
    var focusable = overlay.querySelector(
      'input:not([type=hidden]), select, textarea, button, [href], [tabindex]:not([tabindex="-1"])'
    );
    (focusable || overlay).focus();
  }

  function closeDrawer(overlay) {
    if (!overlay || overlay.hidden) return;
    overlay.hidden = true;
    root.removeAttribute('data-scroll-locked');
    var key = firstPanelKey(overlay);
    if (key) showPanel(overlay, key);
    if (lastFocus) { lastFocus.focus(); lastFocus = null; }
  }

  on('[data-open]', 'click', function (e, t) {
    e.preventDefault();
    openDrawer(document.getElementById(t.getAttribute('data-open')));
  });

  on('[data-drawer-goto]', 'click', function (e, t) {
    var overlay = t.closest('.drawer-overlay, .modal-overlay');
    if (overlay) showPanel(overlay, t.getAttribute('data-drawer-goto'));
  });

  on('[data-close]', 'click', function (e, t) {
    closeDrawer(t.closest('.drawer-overlay, .modal-overlay'));
  });

  // click on the backdrop itself (not its children) closes
  document.addEventListener('click', function (e) {
    if (e.target.matches('.drawer-overlay, .modal-overlay')) closeDrawer(e.target);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var open = document.querySelector('.drawer-overlay:not([hidden]), .modal-overlay:not([hidden])');
    if (open) closeDrawer(open);
  });

  // deep link: #overlay-id auto-opens, then cleans the hash
  if (location.hash.length > 1) {
    var target = document.getElementById(location.hash.slice(1));
    if (target && target.matches('.drawer-overlay, .modal-overlay')) {
      openDrawer(target);
      history.replaceState(null, '', location.pathname + location.search);
    }
  }

  /* ---- view switch (page-level tabbed panels) ---- */
  on('[data-view]', 'click', function (e, t) {
    var key = t.getAttribute('data-view');
    var group = t.closest('.views') || document;
    group.querySelectorAll('[data-view]').forEach(function (v) {
      var current = v === t;
      v.classList.toggle('views__view--current', current);
      if (v.hasAttribute('aria-current')) v.setAttribute('aria-current', current ? 'true' : 'false');
    });
    if (document.querySelector('[data-view-panel]')) {
      document.querySelectorAll('[data-view-panel]').forEach(function (p) {
        p.hidden = p.getAttribute('data-view-panel') !== key;
      });
      e.preventDefault();
    }
  });

  /* ---- copy: the .copy-field component ---- */
  on('.copy-field__button', 'click', function (e, t) {
    var field = t.closest('.copy-field');
    var input = field && field.querySelector('.copy-field__input');
    if (!input) return;
    input.select();
    input.setSelectionRange(0, input.value.length);
    if (navigator.clipboard) navigator.clipboard.writeText(input.value).catch(function () {});
    if (t.getAttribute('data-copy-prev') !== null) return; // already showing "Copied"
    t.setAttribute('data-copy-prev', t.innerHTML);
    t.innerHTML = '<svg class="icon icon--sm" aria-hidden="true"><use href="#i-circle-check"/></svg>Copied';
    setTimeout(function () {
      t.innerHTML = t.getAttribute('data-copy-prev');
      t.removeAttribute('data-copy-prev');
    }, 1600);
  });

  /* ---- copy: a bare [data-copy] / [data-copy-target] button ---- */
  on('[data-copy], [data-copy-target]', 'click', function (e, t) {
    e.preventDefault();
    var text = t.getAttribute('data-copy');
    if (!text) {
      var el = document.querySelector(t.getAttribute('data-copy-target'));
      text = el ? (el.value != null ? el.value : el.textContent) : '';
    }
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text).then(function () {
      if (t.getAttribute('data-copy-prev') !== null) return;
      t.setAttribute('data-copy-prev', t.textContent);
      t.textContent = t.getAttribute('data-copied-label') || 'Copied';
      setTimeout(function () {
        t.textContent = t.getAttribute('data-copy-prev');
        t.removeAttribute('data-copy-prev');
      }, 1600);
    });
  });

  /* ---- save bar (real dirty tracking) ---- */
  var saveBar = document.querySelector('[data-save-bar]');
  if (saveBar) {
    var fields = [].slice.call(document.querySelectorAll('[data-save-bar-field]'));
    var valueOf = function (f) { return f.type === 'checkbox' ? f.checked : f.value; };
    var baseline = fields.map(valueOf);

    var refresh = function () {
      var dirty = fields.some(function (f, i) { return valueOf(f) !== baseline[i]; });
      saveBar.hidden = !dirty;
    };
    fields.forEach(function (f) {
      f.addEventListener('input', refresh);
      f.addEventListener('change', refresh);
    });

    on('[data-save-discard]', 'click', function () {
      fields.forEach(function (f, i) {
        if (f.type === 'checkbox') f.checked = baseline[i]; else f.value = baseline[i];
      });
      saveBar.hidden = true;
    });
    on('[data-save-submit]', 'click', function () {
      baseline = fields.map(valueOf);
      saveBar.hidden = true;
    });
  }
})();
