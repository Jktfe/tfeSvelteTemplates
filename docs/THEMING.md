# Theming Convention

> **Scope:** every component in `src/lib/components/` that renders coloured chrome.
> **Status:** normative. New components and existing-component dark-mode passes both follow this convention.
> **First adopters (the reference set):** `Tooltip`, `Slider`, `RatingStars`, `KbdShortcut`.

---

## Why this doc exists

The project's templates need to look right on **light AND dark, mobile AND desktop** — every component, no exceptions. (See the project-wide rule in `CLAUDE.md` and the matching auto-memory entry.)

Across the first dark-mode batch (Tooltip + Slider + RatingStars + KbdShortcut, four architecturally-distinct shapes — greenfield / partial-API extension / attribute-to-CSS-var migration / simple-additive) we converged on **one rule** that survives every shape:

> **Chrome flips. Brand stays. Semantic stays.**

This doc names what those words mean, gives the override patterns at three scopes, and ends with a five-line PR checklist.

---

## Token taxonomy

Every coloured value in a component is exactly one of three kinds. Knowing which kind decides whether it goes into the `prefers-color-scheme: dark` flip block.

### 1. Chrome tokens

The **structural surfaces** of the component — backgrounds, foregrounds, borders, dividers, scroll thumbs, focus rings, drop shadows, separators. Their job is to read on whatever surface they sit on.

- **Light surface needs dark text + light bg.** Dark surface needs the inverse.
- **Always flip under `prefers-color-scheme: dark`.**
- Examples: `--tooltip-bg`, `--slider-track-bg`, `--rating-focus-ring`, `--kbd-fg`, `--kbd-shadow-drop`.

### 2. Brand tokens

The **identity colours** that carry meaning the user recognises across the whole product — your accent / primary / signature colour, an app-wide gold star, a particular brand red.

- Brand identity is **scheme-independent**. A gold rating star should be gold on light AND dark, otherwise the brand fades on half your users.
- **Stay prop-driven** (or stay at the same value across schemes if exposed only as a CSS var).
- **Never include in the dark flip block** unless the consumer explicitly opts in.
- Examples: `--rating-star-filled` (gold), `--fill-color` on `Slider` (variant accent — blue / green / red), an app-wide `--accent` token.

### 3. Semantic tokens

Colours whose **meaning is the colour itself** — success-green, warning-amber, error-red, info-blue, traffic-light states.

- "Green = OK" must hold on both schemes; flipping to a magenta-leaning green on dark would break the meaning.
- Same rule as brand: **stay prop-driven, never in the flip block** unless explicitly themed.
- Examples: `--success`, `--warning`, `--error`, `--info`.

> **The test:** before adding a token to your `@media (prefers-color-scheme: dark)` block, ask *"is this a structural surface (chrome), or is it carrying brand / semantic meaning?"* — only chrome goes in the flip.

---

## The default rule

```css
.your-component {
  /* Light defaults inline */
  --your-chrome-fg:    #374151;
  --your-chrome-bg:    #ffffff;
  --your-chrome-border:#d1d5db;

  /* Brand / semantic stay un-flipped — set once or expose as a prop */
  --your-brand-accent: #fbbf24;
}

@media (prefers-color-scheme: dark) {
  .your-component {
    --your-chrome-fg:    #d1d5db;
    --your-chrome-bg:    #1f2937;
    --your-chrome-border:#4b5563;
    /* note: --your-brand-accent deliberately NOT flipped */
  }
}
```

That's it. Expose tokens, default light, flip chrome only.

---

## Reference table — the four first adopters

These shipped together in PR #22 and prove the rule applies across four very different shapes.

| Component | Patch shape | Tokens introduced | Chrome (flips) | Brand / variant (stays) |
|-----------|-------------|-------------------|----------------|-------------------------|
| `Tooltip` | Greenfield (no prior CSS-var API) | 3 | `--tooltip-fg`, `--tooltip-bg`, `--tooltip-shadow` | *(none — Tooltip is all chrome)* |
| `Slider` | Partial-API extension (existing `--fill-color` / `--track-h` / `--thumb-size`) | 6 chrome | `--slider-track-bg`, `--slider-thumb-bg`, `--slider-label-fg`, `--slider-bubble-bg`, `--slider-bubble-fg`, `--slider-focus-ring` | `--fill-color` (variant accent) |
| `RatingStars` | Architectural migration (SVG `fill=` attribute → CSS class + `var()`) | 3 | `--rating-star-empty`, `--rating-focus-ring` | `--rating-star-filled` (brand gold) |
| `KbdShortcut` | Simple-additive (kbd cap is all chrome — no brand) | 7 | `--kbd-fg`, `--kbd-bg-top`, `--kbd-bg-bottom`, `--kbd-border`, `--kbd-shadow-inner`, `--kbd-shadow-drop`, `--kbd-sep-color` | *(none — kbd cap has no brand)* |

The rule held identically across **greenfield, extension, migration, and additive** shapes — that's why this is convention, not a recipe.

---

## CSS overrides — three scopes

Token APIs have one big advantage over hardcoded values: **consumers retheme without forking the component**. The cascade does the work.

### Scope 1 — global override

Override the token for every instance of the component across the app.

```css
body .kbd.kbd {
  --kbd-fg:        #78350f;
  --kbd-bg-top:    #fef3c7;
  --kbd-bg-bottom: #fde68a;
  --kbd-border:    #f59e0b;
}
```

This sets warm-beige kbd caps everywhere `<KbdShortcut>` is rendered. The `body .kbd.kbd` selector totals (0,2,1) specificity, which beats the component's own `.kbd { ... }` rule once Svelte's scope-hash class is added — see the callout below.

> **Why the doubled `.kbd`, and why declared on the element itself?** Svelte scopes component styles by appending a hash class to every selector — so `.kbd { --kbd-fg: ... }` in the component's `<style>` block compiles to `.kbd.svelte-1etmya9 { --kbd-fg: ... }`, giving it 2-class specificity (0,2,0). For a consumer-side rule to override CSS variables on the *same* element it must satisfy two conditions: (1) declare the variable directly on that element — inherited values from an ancestor lose to declared values regardless of how specific the ancestor selector is — and (2) total ≥(0,2,0) specificity. The doubled `.kbd.kbd` is the simplest selector that hits the specificity bar without coupling to Svelte's implementation hash; the leading `body ` lifts it to (0,2,1) so it wins unconditionally over the component's (0,2,0) rule even when the cascade order goes against you. The same caveat applies to every component in this library that follows the inline-default convention (`Tooltip`, `Slider`, `RatingStars`, `KbdShortcut`, `Breadcrumbs`, …) — adapt the doubled-class pattern to each component's root class.
>
> **Patterns that look like they should work, but don't:** `:root { --kbd-* }` and `body { --kbd-* }` only inherit down to the kbd element, where the component's own declared value still wins. `body .kbd { ... }` declares directly on the element but only totals (0,1,1) — still loses to the scoped (0,2,0). The doubled-class trick is the cheapest fix.

### Scope 2 — ancestor scope

Override the token only inside a particular section of your app. The same two conditions as scope 1 apply: declare on the element itself, and clear the (0,2,0) scoped specificity. Because the parent component doesn't render the child's element directly, Svelte will strip the selector unless wrapped in `:global()`.

```svelte
<section class="docs-area">
  <Tooltip text="Press to copy">{children}</Tooltip>
</section>

<style>
  /* Deep-blue tooltips inside .docs-area only.
     :global(...) breaks out of the parent's CSS scoping so the rule
     reaches the child component's element; the doubled .tooltip-wrap
     gives it (0,3,0) specificity, beating the child's scoped (0,2,0). */
  .docs-area :global(.tooltip-wrap.tooltip-wrap) {
    --tooltip-bg:     #1e3a8a;
    --tooltip-fg:     #ffffff;
    --tooltip-shadow: 0 8px 24px rgba(30, 58, 138, 0.35);
  }
</style>
```

Anywhere else in the app, tooltips render with their default chrome. The same doubled-class + `:global()` pattern works for any component in this library — substitute the component's root class (`.tooltip-wrap`, `.kbd`, `.slider-wrap`, `.rating-stars`, `.breadcrumbs`, …).

### Scope 3 — manual `.dark` class toggle

If your app manages dark mode with a manual class toggle (rather than relying on `prefers-color-scheme`), declare the chrome tokens directly on the component element under your `.dark` selector.

```css
:root.dark .kbd {
  --kbd-fg:           #d1d5db;
  --kbd-bg-top:       #1f2937;
  --kbd-bg-bottom:    #111827;
  --kbd-border:       #4b5563;
  --kbd-shadow-inner: #4b5563;
  --kbd-shadow-drop:  rgba(0, 0, 0, 0.4);
  --kbd-sep-color:    #6b7280;
}
```

`:root.dark .kbd` totals (0,2,1) specificity, which clears Svelte's scoped (0,2,0) — the same threshold scope 1 has to clear. The component's own `@media (prefers-color-scheme: dark)` block still fires when the OS preference is dark *and* no manual override is present; your `.dark` selector wins because it has higher specificity than the in-component media-block rule. For users who haven't set an OS preference, your manual toggle is the only signal and it works as intended.

---

## Conditional split — when "all chrome, no brand" applies

Two of the four reference components (`Tooltip`, `KbdShortcut`) have **no brand or variant tokens at all** — every coloured value is structural. For those, the dark `@media` block flips the whole token set together.

The other two (`Slider`, `RatingStars`) have a brand or variant token that's deliberately left out of the flip:

- `Slider --fill-color` — the variant accent (blue / green / red); these read fine on either scheme, so flipping would only mute them.
- `RatingStars --rating-star-filled` — the brand gold; rating systems rely on a constant brand-coloured "filled" signal so users can scan and compare.

> **Decision rule:** for every token, ask *"does this carry meaning that a colour-blind / contrast-sensitive user would lose if the colour shifted between schemes?"* — if yes, leave it out of the flip.

---

## Checklist for new component PRs

Before opening a PR for a new component (or a dark-mode pass on an existing one), verify:

1. **Inline light defaults** — every coloured value is a CSS custom property defaulting to its light value at the top of `:host` / `.your-root`.
2. **Token taxonomy applied** — chrome / brand / semantic tagged in the header docblock's `THEMING` section.
3. **Flip block present** — `@media (prefers-color-scheme: dark)` overrides every chrome token, and *only* chrome tokens.
4. **Brand / semantic deliberately omitted** — explicitly noted in the header *why* (one short sentence).
5. **`.md` file `## Theming` section** — token table (Property / Light / Dark / Used by) + at least one override example.

If your component has no brand or semantic tokens (it's all chrome), say so explicitly — a future reader needs to know the omission was intentional, not forgotten.

---

## Linking from elsewhere

This doc is the source of truth. Link to it from:

- `CLAUDE.md` → §Gold Standard Guidelines (so future component PRs find the rule)
- Each adopter's `.md` → `## Theming` section header (one-line link out)
- New component template scaffolds — token API stub + link to this doc

If you're adding a sixth, seventh, … adopter, append a row to the reference table above with the patch shape and token split. The table is the audit trail.

---

## Related patterns (Obsidian audit vault)

For the empirical record of how this rule emerged across the first batch:

- **Pattern #67** — chrome flips, brand stays (the conditional split rule).
- **Pattern #73** — all-chrome components don't split #67 (rule is conditional, not universal).
- **Pattern #63** — token-API-introduction OR -extension OR architectural-migration is the cheapest light-to-dark path.
- **Pattern #69** — architectural-migration patch shape (markup-attribute → class-based CSS-var).
- **Pattern #70** — backwards-compat props as conditional inline-style overrides.

These are tracked in `Agent Memory Vault/tfesveltetemplates/_index.md`.
