# GsapSplitTextHero - Technical Logic Explainer

## What Does It Do? (Plain English)

GsapSplitTextHero is a hero block whose headline animates in piece by piece. Visitors choose whether it arrives by **characters**, **words** or **lines**, and each choice replays the entrance with its own choreography. It is inspired by GreenSock's SplitText mode demo (https://codepen.io/GreenSock/pen/xxmaNYj) and packages the plugin wiring as a reusable Svelte 5 primitive.

**Think of it like:** a letterpress printer who can set the same headline one letter, one word or one line at a time — and you get to pick which.

---

## How It Works (Pseudo-Code)

```
WHEN component renders (server or client):
  1. RENDER eyebrow, <h1> headline, lede and three mode buttons
  2. selectedMode = normalizeSplitTextMode(initialMode)   # unknown → 'chars'

WHEN component mounts:
  1. LOAD gsap + gsap/SplitText in parallel, registerPlugin(SplitText)
  2. WAIT for document.fonts.ready              # split on final glyph metrics
  3. runMode(selectedMode)

runMode(mode):
  1. resetSplit()      # kill the running tween, revert the old split markup
  2. IF prefers-reduced-motion:
       clear inline props, show the headline → return
  3. config = splitTextModeConfig(mode)
  4. split = SplitText.create(headline, { type, autoSplit, mask, aria: 'auto', onSplit })
  5. onSplit → animateTargets(chars | words | lines, mode)

ON mode button click:
  1. selectedMode = mode
  2. runMode(mode)

WHEN component unmounts:
  1. cancelled = true
  2. resetSplit()
```

---

## The Core Concept: Three Split Modes

`splitTextModeConfig(mode)` is a pure function that maps each mode to the SplitText options it needs:

| Mode | `type` | Animated target | `autoSplit` | `mask` | Motion |
|------|--------|-----------------|-------------|--------|--------|
| `chars` | `'chars,words'` | characters | `false` | — | Slide in from `x: 120` with random `y` jitter, 27ms stagger, `power4.out` |
| `words` | `'words'` | words | `false` | — | Drop from `y: -92` with random ±18° rotation, `back.out(1.6)` |
| `lines` | `'lines,words'` | lines | `true` | `lines` | Flip up from `rotationX: -92` behind a line mask, 180ms stagger |

Splitting `chars` also splits `words` so characters never break mid-word when the headline wraps. Lines mode uses `autoSplit: true`: SplitText re-splits when the container resizes, and because the tween is *returned* from `onSplit`, SplitText can sync the new animation to the old one's progress.

---

## DOM Mutation and Clean-up

SplitText rewrites the headline into many `<span>` elements. Leaving an old split in place before creating a new one would nest spans inside spans, so every mode change starts with:

```
resetSplit():
  animation?.kill()     # stop the tween
  split?.revert()       # restore the original headline text node
```

`aria: 'auto'` keeps the headline readable by screen readers — the accessible name is the original sentence, not a list of individual letters.

---

## State Flow Diagram

```
   ┌────────────────────┐   mount → plugins loaded → fonts ready
   │  STATIC (SSR)      │ ─────────────────────────────────────┐
   │  plain <h1> text   │                                      │
   └────────────────────┘                                      ▼
                                                   ┌──────────────────────┐
                    ┌─────────────────────────────▶│  runMode(mode)       │
                    │                              │  resetSplit()        │
                    │                              └──────────┬───────────┘
                    │                    reduced motion? yes  │  no
                    │                  ┌──────────────────────┴───────────┐
                    │                  ▼                                  ▼
                    │        ┌──────────────────┐              ┌────────────────────┐
                    │        │  PLAIN HEADLINE  │              │  SPLIT + ANIMATING │
                    │        │  no split        │              │  chars/words/lines │
                    │        └──────────────────┘              └─────────┬──────────┘
                    │                                                    │ tween ends
                    │     click Characters / Words / Lines               ▼
                    └──────────────────────────────────────── SPLIT (settled)

   Unmount → resetSplit() reverts the markup
```

---

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `headline` | `string` | `'Motion primitives with manners'` | The animated `<h1>` text. |
| `eyebrow` | `string` | `'GSAP suite'` | Small label above the headline. |
| `copy` | `string` | Short sample lede | Supporting paragraph under the headline. |
| `initialMode` | `'chars' \| 'words' \| 'lines'` | `'chars'` | Mode used for the first animation; unknown values fall back to `'chars'`. |
| `theme` | `'light' \| 'dark'` | `undefined` | Pins a colour set; when omitted the hero follows `prefers-color-scheme`. |
| `class` | `string` | `''` | Extra classes on the root `<section>`. |

### Exported helpers

| Export | Purpose |
|--------|---------|
| `splitTextModeOptions` | The three `{ id, label }` options rendered as buttons. |
| `normalizeSplitTextMode(value)` | Coerces any string to a valid mode (`'chars'` fallback). |
| `splitTextModeConfig(mode)` | Returns the SplitText `type`, animated `target`, `autoSplit` and `mask` for a mode. |

---

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Mode button clicked while a tween is running | The running tween is killed and the old split reverted before the new one starts. |
| Web fonts still loading on mount | The split waits for `document.fonts.ready` so line breaks match the final font. |
| Container resized in lines mode | `autoSplit` re-splits the headline and re-runs the tween. |
| `prefers-reduced-motion: reduce` | No split is created; the headline is shown in its final state. |
| Unmounted before plugins load | The `cancelled` flag prevents a split on a detached node. |
| Two heroes on one page | Both headlines use `id="gsap-suite-title"`; mount one per page to keep ids unique. |
| JavaScript disabled | The server-rendered headline is readable; only the animation is lost. |

---

## Dependencies

- **Svelte 5.x** — runes and `onMount` for client-only plugin loading.
- **`gsap`** and **`gsap/SplitText`** — SplitText handles accessible text splitting, masking and responsive re-splitting; doing this natively and robustly across fonts is a large job.
- **`$lib/gsapMotion`** — tiny helper (`loadGsap`, `prefersReducedMotion`); copy it alongside the component.

---

## File Structure

```
src/lib/components/GsapSplitTextHero.svelte     # implementation + exported helpers
src/lib/components/GsapSplitTextHero.md         # this file (rendered inside ComponentPageShell)
src/lib/components/GsapSplitTextHero.test.ts    # vitest unit tests
src/lib/gsapMotion.ts                           # shared GSAP loader + reduced-motion check
src/routes/gsap-suite/+page.svelte              # demo page (GSAP suite)
```

## Multiple instances

The `<section>` is labelled by its `<h1>` through `aria-labelledby`. The heading id is built
from `$props.id()`, so several heroes can share a page without duplicate ids — each section
always points at its own headline.
