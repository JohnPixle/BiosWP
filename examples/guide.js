/* Style-guide-only scaffolding (not part of the plugin UI).
   Shared by all styleguide*.html pages: injects the customizer and the
   fixed jump nav, then wires both. Icons are embedded inline so guide
   chrome has no dependency on the per-page sprite. */

(function () {
  'use strict';

  /* ---- Page manifest: the split styleguide ---- */
  var PAGES = [
    { file: 'styleguide.html', label: 'Foundations' },
    { file: 'styleguide-navigation.html', label: 'Navigation' },
    { file: 'navigation-patterns.html', label: 'Navigation patterns' },
    { file: 'styleguide-forms.html', label: 'Forms & actions' },
    { file: 'styleguide-containers.html', label: 'Containers & chrome' },
    { file: 'styleguide-data.html', label: 'Data' },
    { file: 'styleguide-feedback.html', label: 'Feedback' },
    { file: 'styleguide-addons-ai.html', label: 'Add-ons & AI' }
  ];

  var SVG_GEAR = '<svg class="icon customizer__icon-open" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37c1 .608 2.296.07 2.572-1.065"/><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0-6 0"/></g></svg>';
  var SVG_X = '<svg class="icon customizer__icon-close" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 6L6 18M6 6l12 12"/></svg>';

  /* ---- Inject the customizer (single source, every guide page) ---- */
  function injectCustomizer() {
    var details = document.createElement('details');
    details.className = 'customizer';
    details.innerHTML =
      '<summary aria-label="Customizer">' + SVG_GEAR + SVG_X + '</summary>' +
      '<div class="customizer__body">' +
      '<div class="customizer__row"><label for="cz-accent">Accent</label><input type="color" id="cz-accent" value="#2271b1"><button class="button button--small" id="cz-accent-reset" type="button">Reset</button></div>' +
      '<div class="customizer__row"><label for="cz-scheme">Admin scheme</label><select class="field__select" id="cz-scheme" style="max-width: 130px;"><option value="">default</option><option value="modern">modern</option><option value="light">light</option><option value="blue">blue</option><option value="coffee">coffee</option><option value="ectoplasm">ectoplasm</option><option value="midnight">midnight</option><option value="ocean">ocean</option><option value="sunrise">sunrise</option></select></div>' +
      '<div class="customizer__row"><label for="cz-unit">Space unit</label><input type="range" id="cz-unit" min="2" max="6" step="0.5" value="4"><output id="cz-unit-out">4px</output></div>' +
      '<div class="customizer__row"><label for="cz-radius">Radius</label><input type="range" id="cz-radius" min="0" max="12" step="1" value="4"><output id="cz-radius-out">4px</output></div>' +
      '<div class="customizer__row"><label for="cz-width">Content max</label><input type="range" id="cz-width" min="800" max="1400" step="50" value="1100"><output id="cz-width-out">1100</output></div>' +
      '<div class="customizer__row"><label for="cz-dark">Dark mode</label><label class="toggle"><input class="toggle__input" type="checkbox" id="cz-dark"><span class="toggle__track" aria-hidden="true"></span></label></div>' +
      '<textarea class="customizer__css" id="cz-css" readonly aria-label="Generated CSS overrides">/* your overrides appear here */</textarea>' +
      '<button class="button" id="cz-copy" type="button">Copy CSS</button>' +
      '</div>';
    document.body.appendChild(details);
  }

  /* ---- Live customizer wiring (unchanged logic) ---- */
  function wireCustomizer() {
    var root = document.documentElement;
    var defaults = { accent: '#2271b1', unit: 4, radius: 4, width: 1100 };
    var state = { accent: null, scheme: '', unit: 4, radius: 4, width: 1100, dark: false };

    function darker10(hex) {
      var r = parseInt(hex.slice(1, 3), 16) / 255,
          g = parseInt(hex.slice(3, 5), 16) / 255,
          b = parseInt(hex.slice(5, 7), 16) / 255;
      var max = Math.max(r, g, b), min = Math.min(r, g, b);
      var l = (max + min) / 2, h = 0, sat = 0, d = max - min;
      if (d) {
        sat = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        else if (max === g) h = ((b - r) / d + 2) / 6;
        else h = ((r - g) / d + 4) / 6;
      }
      l = Math.max(0, l - 0.10);
      function f(n) {
        var k = (n + h * 12) % 12;
        var a = sat * Math.min(l, 1 - l);
        var c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
        return Math.round(c * 255).toString(16).padStart(2, '0');
      }
      return '#' + f(0) + f(8) + f(4);
    }

    function rgba(hex, a) {
      return 'rgba(' + parseInt(hex.slice(1, 3), 16) + ', ' + parseInt(hex.slice(3, 5), 16) + ', ' + parseInt(hex.slice(5, 7), 16) + ', ' + a + ')';
    }

    function apply() {
      var lines = [];
      if (state.accent) {
        root.style.setProperty('--accent', state.accent);
        root.style.setProperty('--accent-hover', darker10(state.accent));
        root.style.setProperty('--accent-soft', rgba(state.accent, 0.1));
        lines.push('  --accent: ' + state.accent + ';');
        lines.push('  --accent-hover: ' + darker10(state.accent) + ';');
        lines.push('  --accent-soft: ' + rgba(state.accent, 0.1) + ';');
      } else {
        root.style.removeProperty('--accent');
        root.style.removeProperty('--accent-hover');
        root.style.removeProperty('--accent-soft');
      }
      if (state.scheme) { root.dataset.adminScheme = state.scheme; }
      else { delete root.dataset.adminScheme; }
      if (state.unit !== defaults.unit) {
        root.style.setProperty('--space-unit', state.unit + 'px');
        lines.push('  --space-unit: ' + state.unit + 'px;');
      } else { root.style.removeProperty('--space-unit'); }
      if (state.radius !== defaults.radius) {
        root.style.setProperty('--radius', state.radius + 'px');
        lines.push('  --radius: ' + state.radius + 'px;');
      } else { root.style.removeProperty('--radius'); }
      if (state.width !== defaults.width) {
        root.style.setProperty('--width-content-max', state.width + 'px');
        lines.push('  --width-content-max: ' + state.width + 'px;');
      } else { root.style.removeProperty('--width-content-max'); }
      root.dataset.theme = state.dark ? 'dark' : '';
      document.getElementById('cz-css').value = lines.length
        ? ':root {\n' + lines.join('\n') + '\n}'
        : '/* your overrides appear here */';
    }

    document.getElementById('cz-accent').addEventListener('input', function () { state.accent = this.value; apply(); });
    document.getElementById('cz-accent-reset').addEventListener('click', function () {
      state.accent = null;
      document.getElementById('cz-accent').value = defaults.accent;
      apply();
    });
    document.getElementById('cz-scheme').addEventListener('change', function () { state.scheme = this.value; apply(); });
    document.getElementById('cz-unit').addEventListener('input', function () {
      state.unit = parseFloat(this.value);
      document.getElementById('cz-unit-out').textContent = this.value + 'px';
      apply();
    });
    document.getElementById('cz-radius').addEventListener('input', function () {
      state.radius = parseInt(this.value, 10);
      document.getElementById('cz-radius-out').textContent = this.value + 'px';
      apply();
    });
    document.getElementById('cz-width').addEventListener('input', function () {
      state.width = parseInt(this.value, 10);
      document.getElementById('cz-width-out').textContent = this.value;
      apply();
    });
    document.getElementById('cz-dark').addEventListener('change', function () { state.dark = this.checked; apply(); });
    document.getElementById('cz-copy').addEventListener('click', function () {
      navigator.clipboard.writeText(document.getElementById('cz-css').value);
      this.textContent = 'Copied!';
      var btn = this;
      setTimeout(function () { btn.textContent = 'Copy CSS'; }, 1200);
    });
    document.querySelectorAll('[data-theme-toggle]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.dark = !state.dark;
        document.getElementById('cz-dark').checked = state.dark;
        apply();
      });
    });
  }

  /* ---- Fixed jump nav: guide pages first, then the current page's
     sections and spec anchors — built from the DOM, never stale. ---- */
  function buildJumpNav() {
    function slug(text) {
      return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }
    var nav = document.createElement('nav');
    nav.className = 'guide__jumpnav';
    nav.setAttribute('aria-label', 'Style guide pages and sections');
    var here = location.pathname.split('/').pop() || 'styleguide.html';
    var frag = document.createDocumentFragment();

    PAGES.forEach(function (p, i) {
      if (i) {
        var dot = document.createElement('span');
        dot.className = 'guide__jumpnav-sep';
        dot.textContent = '·';
        frag.appendChild(dot);
      }
      var a = document.createElement('a');
      a.href = p.file;
      a.textContent = p.label;
      a.style.fontWeight = '600';
      if (p.file === here) a.className = 'guide__jumpnav-current';
      frag.appendChild(a);
    });

    var anchors = [];
    document.querySelectorAll('.guide__section').forEach(function (section) {
      var titleEl = section.querySelector(':scope > .guide__section-title');
      if (titleEl) {
        var sectionId = 'sec-' + slug(titleEl.textContent);
        section.id = sectionId;
        anchors.push({ id: sectionId, label: titleEl.textContent, strong: true });
      }
      section.querySelectorAll('.spec__name').forEach(function (nameEl) {
        var specEl = nameEl.closest('.spec');
        if (!specEl || specEl.id) return;
        var specId = slug(nameEl.textContent);
        if (document.getElementById(specId)) return;
        specEl.id = specId;
        anchors.push({ id: specId, label: nameEl.textContent, strong: false });
      });
    });

    if (anchors.length) {
      var sep = document.createElement('span');
      sep.className = 'guide__jumpnav-sep';
      sep.textContent = '|';
      frag.appendChild(sep);
      anchors.forEach(function (an) {
        var a = document.createElement('a');
        a.href = '#' + an.id;
        a.textContent = an.label;
        if (an.strong) a.style.fontWeight = '600';
        frag.appendChild(a);
      });
    }

    nav.appendChild(frag);
    document.body.appendChild(nav);
  }

  injectCustomizer();
  wireCustomizer();
  buildJumpNav();
})();
