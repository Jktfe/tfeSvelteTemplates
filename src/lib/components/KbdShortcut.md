# KbdShortcut — Technical Logic Explainer

## What Does It Do? (Plain English)

Renders one or more keys as styled `<kbd>` caps so users can see at a glance which key combo triggers an action. Auto-detects platform (Mac vs Windows/Linux) and substitutes the correct modifier glyphs — ⌘ on Mac, Ctrl/Win on Windows. Passing `keys={['Cmd', 'K']}` produces `⌘ K` on a Mac and `Win + K` on Windows; passing `keys={['G', 'S']}` with a custom `separator=" → "` produces a sequential combo like `G → S`.

Think of it as a typographer's tool, not a wired-up shortcut handler. The component shows the combo; firing the action when the user actually presses it is wholly the consumer's job.

## How It Works (Pseudo-Code)

```
state:
  keys      = string | string[]
  mac       = optional boolean override

derive isMac:
  if mac prop is boolean: return mac (consumer wins)
  if running on server (no navigator): return true (Mac is the safer SSR default)
  return /Mac|iPod|iPhone|iPad/.test(navigator.platform)

derive keyList = Array.isArray(keys) ? keys : [keys]
derive renderedKeys = keyList.map(k => symbolFor(k, isMac))

symbolFor(key, onMac):
  switch key.toLowerCase():
    case 'cmd' | 'command' | 'meta': → '⌘' on Mac, 'Win' on Windows
    case 'ctrl' | 'control':         → '⌃' on Mac, 'Ctrl' on Windows
    case 'alt' | 'option' | 'opt':   → '⌥' on Mac, 'Alt' on Windows
    case 'shift':                    → '⇧' on Mac, 'Shift' on Windows
    case 'enter' | 'return':         → '⏎' on Mac, 'Enter' on Windows
    case 'esc':                      → 'esc' / 'Esc'
    case 'tab' | 'backspace' | 'space' | arrow keys: → glyph or label
    default: return key as-is

derive computedAriaLabel:
  ariaLabel ?? keyList.join(' plus ')
  // "Cmd plus K" reads better than "command-K-symbol" via SR

render:
  <kbd aria-label={computedAriaLabel}>
    for each rendered symbol:
      if not first: <span aria-hidden>{separator}</span>
      <span>{symbol}</span>
  </kbd>
```

The component is essentially a lookup table wrapped in pretty CSS. The clever bits are SSR-safe platform detection and the aria-label that spells out modifier names instead of their glyphs.

## The Core Concept: Platform-Aware Symbol Substitution

The same shortcut renders differently depending on platform:

| Logical key | Mac glyph | Windows label |
|-------------|-----------|---------------|
| `Cmd`       | ⌘         | Win            |
| `Ctrl`      | ⌃         | Ctrl           |
| `Alt`       | ⌥         | Alt            |
| `Shift`     | ⇧         | Shift          |
| `Enter`     | ⏎         | Enter          |
| `Tab`       | ⇥         | Tab            |
| `Backspace` | ⌫         | Backspace      |
| `Space`     | ␣         | Space          |
| Arrow keys  | ↑ ↓ ← →   | ↑ ↓ ← →        |

The Mac column uses Unicode glyphs that match the keycaps Apple ships. The Windows column uses readable text labels because the Windows keyboard doesn't have a visual symbol for "Win" or "Ctrl" — Microsoft's design language is text-first.

`navigator.platform` is the detection vector. It's been deprecated in favour of `navigator.userAgentData.platform` for a few years, but the new API is still gated by browser permission prompts (User-Agent Client Hints) on some configurations, so we stick with the legacy property — it's reliable for the Mac/non-Mac binary we actually need.

## SSR-Safe Auto-Detection

`navigator` is undefined on the server. A naïve `navigator.platform.includes('Mac')` would crash during SSR. The fix is a guard:

```
const isMac = $derived.by(() => {
  if (typeof mac === 'boolean') return mac;             // explicit prop wins
  if (typeof navigator === 'undefined') return true;    // SSR: assume Mac
  return /Mac|iPod|iPhone|iPad/.test(navigator.platform);
});
```

Why default to Mac on the server? Two reasons:

1. **Hydration mismatch is harmless either way.** The server renders one value; the client re-derives on hydration. If the user is on Windows, the kbd caps re-render from ⌘ to Ctrl on the first hydration tick — a flicker, but the underlying text content is correct after hydration.
2. **Mac is the more common dev/laptop environment** for the audience this component primarily serves (early-2026 Svelte template gallery). Defaulting to Mac means most users see the right glyphs even before hydration completes.

If you want to force a specific platform regardless of detection (e.g. a docs page that always shows Windows shortcuts), pass `mac={false}` explicitly. The `typeof mac === 'boolean'` check ensures the consumer's choice wins.

## Accessibility: Spelling Out the Combo

The default `aria-label` is `keyList.join(' plus ')`. So `<KbdShortcut keys={['Cmd', 'K']} />` gets `aria-label="Cmd plus K"`. AT users hear "*kbd, Cmd plus K*" — a clear, speakable shortcut.

Without this, the alternative is having AT read the literal glyphs, which produces output like "*kbd, command symbol K*" or worse, garbled depending on the SR's glyph dictionary. Words always beat glyphs for accessibility.

The separator characters between keys (`+`, `→`, or whatever the consumer passes) are wrapped in `<span aria-hidden="true">` so AT skips them. The aria-label already encodes "plus" between keys; the visual separator is for the eye only.

The whole combo is one `<kbd>` element rather than per-key `<kbd>`s. Screen readers announce the combo as a single unit ("kbd, Cmd plus K") rather than three separate kbd announcements ("kbd Cmd, plus, kbd K"). The semantic boundary matches the human concept of "one shortcut".

## State Flow Diagram

```
   PROPS                                  RENDER

   keys = ['Cmd', 'K']
   mac  = undefined                       ┌─────────────────────┐
                                           │  <kbd aria-label=    │
                                           │   "Cmd plus K">      │
   ───────────────────────────             │   <span>⌘</span>     │
                                           │   <span +>+</span>   │  ← aria-hidden
   isMac = navigator.platform              │   <span>K</span>     │
       matches Mac?                        │  </kbd>              │
       (server: true, client: real)       └─────────────────────┘

   ───────────────────────────

   renderedKeys = keyList.map(symbolFor)
     'Cmd' on Mac → '⌘'
     'K'           → 'K'

   ───────────────────────────

   On hydration mismatch (Windows user):
     server rendered '⌘ K'
     client re-derives → 'Win + K'
     Svelte updates DOM in place

   prefers-color-scheme = dark:
     7 chrome tokens flip via @media block
     no Pattern #67 split (no brand variant on a kbd)
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `keys` | `string \| string[]` | required | Single key (`"Esc"`) or combo array (`["Cmd", "K"]`). |
| `mac` | `boolean \| undefined` | auto | Force Mac (`true`) or Windows (`false`) symbols. Auto-detects when omitted. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Cap size and font scale. |
| `separator` | `string` | `'+'` | Joiner between keys. Use `' → '` for sequential combos like `G → S`. Ignored if `keys` is a string. |
| `ariaLabel` | `string` | auto | Override the SR-announced label. Default is keys joined by `" plus "`. |
| `class` | `string` | `''` | Extra classes on the wrapper. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| User on Windows, server rendered for Mac default | First paint shows ⌘; on hydration, Svelte re-renders to `Win + K`. Brief flicker, no error. To avoid the flicker, pass `mac` explicitly when SSR'ing. |
| `keys` contains an unknown name (e.g. `"F4"`) | `symbolFor` falls through to the default case and returns the key as-is. So `["Cmd", "F4"]` renders as `⌘ F4`. |
| `keys = []` (empty array) | Renders an empty `<kbd>`. Keyboard a11y not affected (the `<kbd>` is still semantic), but the visual output is just an empty pill. |
| `separator` is a multi-character string | Rendered as-is between keys. `separator=" then "` produces `⌘ then K`. |
| User has `prefers-color-scheme: dark` system preference | All seven `--kbd-*` chrome tokens flip via the media query. The whole cap reads on dark surfaces. |
| Consumer overrides `--kbd-bg-top` at `:root` and uses dark mode | The system-pref media block writes to `.kbd` directly with ≥(0,2,0) specificity, beating the inherited `:root` token. To override in dark mode, target `body .kbd.kbd` or your own `.dark .kbd.kbd`. |
| `navigator.platform` returns an empty string | The regex doesn't match; `isMac` returns `false`; Windows glyphs are used. |
| Component used inside a Tooltip on a button | The `<kbd>` is inline-flex, so it sits naturally next to the button's text. No layout fights. |

## Dependencies

- **Svelte 5.x** — `$derived.by` for the platform check, `$props` for the typed interface.
- Zero external dependencies. Native `<kbd>`, scoped CSS, no icon library.

## File Structure

```
src/lib/components/KbdShortcut.svelte    # implementation
src/lib/components/KbdShortcut.md        # this file (rendered inside ComponentPageShell)
src/lib/components/KbdShortcut.test.ts   # vitest unit tests
src/routes/kbdshortcut/+page.svelte      # demo page
```
