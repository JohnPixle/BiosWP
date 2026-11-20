#!/usr/bin/env python3
"""BIOS screen validator — checks composed markup against the kit's rules.

    python3 validate.py examples/my-screen.html
    python3 validate.py examples/*.html

tokens.css is the source of truth: every token name, every class, and the
primitive/semantic split are read from it at run time. Nothing to keep in
sync, no dependencies beyond the standard library.

Why this exists: the rules that keep screens consistent fail SILENTLY in a
browser. `var(--space-4)` (no such token) drops the declaration.
`class="card__meta"` (no such class) renders unstyled. `style="padding:12px"`
looks right until the density knob moves. A drifted screen looks ~95% correct,
so it survives review by eye — which is why it needs a machine.

Checks (each one is a rule from AGENT.md / docs/contract.md made mechanical):

  1 undefined-token   every var(--x) resolves to a real token (or has a
                      fallback, which makes it a deliberate input)
  2 unknown-class     every class has a rule in tokens.css
  3 inline-style      an inline style may set custom properties and NOTHING
                      else — that is the one sanctioned dynamic channel
                      (e.g. style="--fill: 70%" on .progress__bar)
  4 raw-literal       no px/rem/em/%/hex literal in a normal declaration
  5 primitive         no primitive token (--gray-900) in markup; components
                      and screens speak semantic roles only
  6 page-css          no page-local CSS beyond the :root knob block

Profiles. Guide pages (styleguide*.html, navigation-patterns.html) are
scaffolding, not kit UI — they carry token swatches, type specimens and demo
framing that legitimately style themselves. They run checks 1, 2, 4, 5 and
may keep a local scaffolding block. Everything else is a SCREEN and runs all
six with zero tolerance. Placement encodes policy, as elsewhere in this repo.
"""
import glob
import os
import re
import sys

# ---------------------------------------------------------------- constants
GUIDE_PAGES = ("navigation-patterns.html",)
GUIDE_PREFIX = "styleguide"

TOKEN_DEF = re.compile(r"(?<![\w-])(--[a-z0-9-]+)\s*:")
VAR_REF = re.compile(r"var\(\s*(--[a-z0-9-]+)\s*(,)?")
CLASS_DEF = re.compile(r"\.([a-z][a-z0-9_-]*)")
CLASS_USE = re.compile(r'\bclass="([^"]*)"')
STYLE_ATTR = re.compile(r'\bstyle="([^"]*)"')
STYLE_TAG = re.compile(r"<style[^>]*>(.*?)</style>", re.DOTALL)
SPRITE = re.compile(r"<svg data-bios-sprite.*?</svg>", re.DOTALL)
# a length/colour literal written out by hand
LITERAL = re.compile(r"(?<![\w.#-])\.?\d+(?:\.\d+)?(?:px|rem|em|%|vh|vw|pt|ch)|#[0-9a-fA-F]{3,8}(?![0-9a-zA-Z])")
SELECTOR = re.compile(r"^\s*([^{@/\s][^{]*?)\s*\{", re.MULTILINE)
KNOB_SELECTORS = {":root", "html", "body", ":root[data-theme=\"dark\"]"}


def find_tokens_css(target):
    """Locate tokens.css from the file being checked, then the cwd."""
    d = os.path.dirname(os.path.abspath(target))
    for _ in range(4):
        p = os.path.join(d, "tokens.css")
        if os.path.exists(p):
            return p
        d = os.path.dirname(d)
    if os.path.exists("tokens.css"):
        return "tokens.css"
    return None


def strip_comments(css):
    """Comments are prose, not declarations. Without this, a section comment
    like `--bar: compact progress bar` registers --bar as a real token and a
    sentence mentioning `.card__meta` registers that class — both of which
    turn checks 1 and 2 into false negatives. Newlines are preserved so line
    numbers stay true."""
    return re.sub(r"/\*.*?\*/",
                  lambda m: "\n" * m.group(0).count("\n"), css, flags=re.DOTALL)


def split_primitives(raw_css):
    """Return (primitive-section, whole-file), both comment-stripped.

    The section markers live INSIDE comments ("2. SEMANTIC TOKENS"), so the
    split has to happen on the raw text and the stripping after it — do it the
    other way round and the marker vanishes, the primitive section comes back
    empty, and check 5 silently passes everything.
    """
    marker = "2. SEMANTIC TOKENS"
    cut = raw_css.index(marker) if marker in raw_css else 0
    return strip_comments(raw_css[:cut]), strip_comments(raw_css)


def build_index(tokens_path):
    """Everything the checks need, derived from tokens.css (+ guide.css)."""
    raw = open(tokens_path).read()
    head, css = split_primitives(raw)
    root = os.path.dirname(tokens_path) or "."

    primitives = set(TOKEN_DEF.findall(head))
    if not primitives:
        raise SystemExit("validate: found no primitive tokens in tokens.css — "
                         "the section-1 marker moved; fix split_primitives()")
    tokens = set(TOKEN_DEF.findall(css))
    classes = set(CLASS_DEF.findall(css))

    guide_css = os.path.join(root, "examples", "guide.css")
    if not os.path.exists(guide_css):
        guide_css = os.path.join(root, "guide.css")
    guide_tokens, guide_classes = set(), set()
    if os.path.exists(guide_css):
        g = strip_comments(open(guide_css).read())
        guide_tokens = set(TOKEN_DEF.findall(g))
        guide_classes = set(CLASS_DEF.findall(g))

    return {
        "tokens": tokens,
        "primitives": primitives,
        "classes": classes,
        "guide_tokens": guide_tokens,
        "guide_classes": guide_classes,
    }


def profile_for(path):
    base = os.path.basename(path)
    if base.startswith(GUIDE_PREFIX) or base in GUIDE_PAGES:
        return "guide"
    return "screen"


def line_of(src, pos):
    return src.count("\n", 0, pos) + 1


def declarations(style_value):
    """Split an inline style into (property, value) pairs."""
    out = []
    for decl in style_value.split(";"):
        if ":" not in decl:
            continue
        prop, _, val = decl.partition(":")
        out.append((prop.strip(), val.strip()))
    return out


def check(path, idx):
    """Return a list of (line, check-name, detail) for one HTML file."""
    raw = open(path).read()
    profile = profile_for(path)
    guide = profile == "guide"

    # Blank out the hidden icon sprite while keeping the original line numbers.
    src = SPRITE.sub(lambda m: "\n" * m.group(0).count("\n"), raw)
    # HTML comments are prose too — markup quoted inside one is not markup.
    src = re.sub(r"<!--.*?-->",
                 lambda m: "\n" * m.group(0).count("\n"), src, flags=re.DOTALL)

    known_tokens = set(idx["tokens"])
    known_classes = set(idx["classes"])
    if guide:
        known_tokens |= idx["guide_tokens"]
        known_classes |= idx["guide_classes"]

    # a page's own :root knob block legitimately defines tokens, and a guide
    # page's scaffolding block legitimately defines classes
    page_css = strip_comments("".join(m.group(1) for m in STYLE_TAG.finditer(src)))
    known_tokens |= set(TOKEN_DEF.findall(page_css))
    if guide:
        known_classes |= set(CLASS_DEF.findall(page_css))

    issues = []

    # -- 1 undefined-token ---------------------------------------------------
    for m in VAR_REF.finditer(src):
        name, fallback = m.group(1), m.group(2)
        if name in known_tokens or fallback:
            continue
        issues.append((line_of(src, m.start()), "undefined-token",
                       f"var({name}) — no such token in tokens.css"))

    # -- 2 unknown-class -----------------------------------------------------
    for m in CLASS_USE.finditer(src):
        for cls in m.group(1).split():
            if cls not in known_classes:
                issues.append((line_of(src, m.start()), "unknown-class",
                               f".{cls} — no rule in tokens.css"))

    # -- 3 inline-style / 4 raw-literal --------------------------------------
    for m in STYLE_ATTR.finditer(src):
        ln = line_of(src, m.start())
        for prop, val in declarations(m.group(1)):
            custom = prop.startswith("--")
            if not custom and not guide:
                issues.append((ln, "inline-style",
                               f'style="{prop}: {val}" — inline styles may only '
                               f"set custom properties (e.g. --fill)"))
                continue
            # custom properties ARE the sanctioned state channel, so a literal
            # in one (--fill: 70%) is the point, not a violation
            if custom:
                continue
            for lit in LITERAL.findall(val):
                issues.append((ln, "raw-literal",
                               f'style="{prop}: {val}" — {lit} is a raw literal; '
                               f"use a token or a class"))

    # -- 5 primitive-in-markup ----------------------------------------------
    markup = STYLE_TAG.sub(lambda m: "\n" * m.group(0).count("\n"), src)
    for m in VAR_REF.finditer(markup):
        if m.group(1) in idx["primitives"]:
            issues.append((line_of(markup, m.start()), "primitive",
                           f"var({m.group(1)}) is a primitive — use a semantic role"))

    # -- 6 page-css ----------------------------------------------------------
    if not guide:
        for m in STYLE_TAG.finditer(src):
            body = m.group(1)
            offset = m.start(1)
            for sm in SELECTOR.finditer(body):
                sel = sm.group(1).strip()
                if sel in KNOB_SELECTORS:
                    continue
                issues.append((line_of(src, offset + sm.start()), "page-css",
                               f"{sel} {{...}} — screens carry no page-local CSS; "
                               f"only a :root knob block"))

    return sorted(issues)


def main(argv):
    targets = []
    for a in argv:
        targets.extend(sorted(glob.glob(a)) or [a])
    if not targets:
        print("usage: python3 validate.py <screen.html> [...]", file=sys.stderr)
        return 2

    tokens_path = find_tokens_css(targets[0])
    if not tokens_path:
        print("validate: could not find tokens.css next to the file or in the "
              "current directory", file=sys.stderr)
        return 2
    idx = build_index(tokens_path)

    total = 0
    for t in targets:
        if not os.path.exists(t):
            print(f"validate: no such file: {t}", file=sys.stderr)
            return 2
        issues = check(t, idx)
        total += len(issues)
        for ln, name, detail in issues:
            print(f"{t}:{ln}  {name}  {detail}")

    n = len(targets)
    if total:
        print(f"\nFAILED: {total} violation(s) across {n} file(s)")
        return 1
    print(f"  validate: clean ({n} file{'s' if n != 1 else ''})")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
