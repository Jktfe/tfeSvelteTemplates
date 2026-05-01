# LiquidTabBar — Technical Logic Explainer

## What Does It Do? (Plain English)

LiquidTabBar is a pill-style tab selector where the active indicator does not snap or slide rigidly between tabs — it *melts* across the gap, stretches, and re-forms around the new tab. The effect is an inline SVG "goo" filter applied to a single moving pill: as the pill travels, its blurred halo bridges the space between source and destination, producing a brief liquid-mercury moment before the pill solidifies again.

Think of it as the difference between a billiard ball clacking from cup to cup and a single drop of mercury rolling across a tray and reabsorbing itself. The interaction is the same — pick a tab — but the motion communicates *flow* instead of *jump*, which is why this pattern shows up on premium marketing sites and settings panels where the tab bar is meant to feel deliberate rather than utilitarian.

## How It Works (Pseudo-Code)

```
state:
  tabEls[i]            = button DOM element per tab (bound via bind:this)
  pillWidth            = 0      // px, matches active button's width
  pillOffset           = 0      // px, matches active button's offsetLeft
  activeTab            = first tab id (bindable)
  prefersReducedMotion = OS preference, watched via matchMedia

on mount:
  read prefers-reduced-motion media query
  subscribe to its 'change' event so the user can toggle mid-session
  on unmount: remove the listener

reactive effect (runs when activeTab or layout changes):
  find index of active tab
  read tabEls[index].offsetWidth   → pillWidth
  read tabEls[index].offsetLeft    → pillOffset

on click(tab):
  activeTab = tab.id
  // the $effect above re-runs and pillWidth / pillOffset update,
  // CSS transition animates them, the SVG filter does the rest

on keydown(currentIndex):
  ArrowRight → focusTab(currentIndex + 1)   // wraps modulo tabs.length
  ArrowLeft  → focusTab(currentIndex - 1)   // wraps modulo tabs.length
  Home       → focusTab(0)
  End        → focusTab(tabs.length - 1)

focusTab(index):
  wrapped = positive-modulo(index, tabs.length)
  activeTab = tabs[wrapped].id
  tabEls[wrapped].focus()

render:
  wrapper with role="tablist"
    inline <svg> defining #gooey-filter (blur + colour matrix + composite)
    absolute layer with filter: url(#gooey-filter)
      single .ltb-pill div, transform: translateX(pillOffset), width: pillWidth
    each tab as <button role="tab" aria-selected={active}>
```

The whole component is CSS transforms plus one `$effect`. There is no animation library, no spring physics, no per-frame JavaScript while the pill moves — Svelte just rewrites two style values and the GPU does the rest.

## The Core Concept: SVG Goo Filter

The "liquid" feel is not produced by JavaScript. It comes from a three-stage SVG filter that processes whatever pixels sit underneath it. Strip the filter away and the pill simply slides across — pleasant, but unremarkable. The filter is what turns sliding into melting.

The filter chain, applied to a single absolutely-positioned layer that contains only the moving pill:

```
SourceGraphic ──► feGaussianBlur(stdDeviation=8) ──► feColorMatrix ──► feComposite ──► output
```

**Stage 1 — `feGaussianBlur stdDeviation="8"`** softens the pill into a fuzzy cloud. On its own this looks like a smudged shadow, not a pill.

**Stage 2 — `feColorMatrix`** is the trick. The matrix passes red, green and blue through unchanged but multiplies the alpha channel by `18` and subtracts `7`:

```
R' = R
G' = G
B' = B
A' = A × 18 − 7
```

Multiplying alpha by 18 forces almost every pixel above a low threshold to fully opaque, while the `−7` offset clips any pixel below that threshold to fully transparent. The fuzzy cloud snaps back into a hard-edged shape — but a *new* shape, one that bulges where the original was densest and pinches where it was thin. Two nearby blurs merge; an outlying speck disappears.

**Stage 3 — `feComposite operator="atop"`** layers the original sharp graphic on top of the rebuilt shape, keeping the gooey silhouette but restoring sharpness inside.

What you actually see while the pill moves:

```
collapsed                     in flight                       reformed
┌──────┐    ┌──────┐    ┌──────┐~~~~~~┌──────┐    ┌──────┐    ┌──────┐
│ tab1 │    │ tab1 │    │ tab1 │      │ tab2 │    │ tab1 │    │ tab2 │
└──────┘    └──█████    └──████████████████──┘    └──────┘    └─█████
   ▲              pill leaving ──►  liquid bridge       pill arriving
```

The bridge appears because, mid-transition, the moving pill's blur halo briefly touches the destination tab's bounds. Two blurs merge into one in stage 1; the colour matrix then snaps that merged blob into a single solid shape; the composite restores the crisp pill colour. The illusion lasts about 200 ms — long enough to register, short enough not to feel slow.

## CSS Animation Strategy

The pill's motion is a single `transition: all 500ms` on the `.ltb-pill` element. Two CSS properties drive it:

```css
.ltb-pill {
  width:     <pillWidth>px;       /* matches active button's offsetWidth */
  transform: translateX(<pillOffset>px);  /* matches offsetLeft */
  transition: all 500ms;
}
```

Both `width` and `transform` are GPU-accelerated paths in modern browsers. The pill is absolutely positioned inside a `pointer-events: none` layer, so it never participates in layout flow — moving it cannot trigger reflow on the tab buttons or anything else on the page.

Why these two properties together rather than just `transform`? Because tabs have *different widths* depending on label length. A pure `translateX` would slide a fixed-width pill, leaving a gap or overhang on tabs whose label is longer or shorter than the first one. Animating `width` alongside the translate means the pill resizes as it travels, and that resize is exactly what creates the elastic stretch before the goo filter chops it into a clean new shape.

The text-colour swap on the buttons themselves uses a separate, shorter `transition-colors duration-300`, so the label inside the pill brightens just before the pill's leading edge arrives. That tiny lead time is what stops the active tab from looking *grey* during the half-second the pill is in transit.

`prefers-reduced-motion` flips both transitions off:

```svelte
class={cn(
  'ltb-pill ...',
  prefersReducedMotion ? 'transition-none' : 'transition-all duration-500'
)}
```

When the user has the OS-level reduced-motion flag on, the pill simply teleports to the new position and the colour matrix has no moving blur to merge — which is exactly what an accessibility-aware user expects: *no animation* means no animation, not "shorter animation".

## Accessibility Deep-Dive

The component is a textbook ARIA tablist, with one Svelte-specific wrinkle around focus management.

**Roles and labelling:**

- The container has `role="tablist"` and `aria-label="Tabs"`.
- Each button has `role="tab"` and `aria-selected={activeTab === tab.id}`.
- Inactive tabs get `tabindex="-1"`; the active tab gets `tabindex="0"`. This is the standard tablist pattern: only one tab is in the tab order at a time, and arrow keys move focus *within* the group rather than the user having to Tab through every tab to reach the next page element.

**Keyboard interactions:**

| Key | Behaviour |
|---|---|
| `→` | Focus and select the next tab; wraps from last to first. |
| `←` | Focus and select the previous tab; wraps from first to last. |
| `Home` | Focus and select the first tab. |
| `End` | Focus and select the last tab. |
| `Tab` | Move focus *out* of the tab bar to the next focusable element. |
| `Enter` / `Space` | No special handler — clicking the focused button is the native behaviour and that already calls `onclick`. |

The wrapping logic uses a positive-modulo trick because JavaScript's `%` returns negatives for negative inputs:

```
((index % tabs.length) + tabs.length) % tabs.length
```

Without this, pressing `←` on the first tab would resolve to index `-1`, which is not a valid array index and would silently do nothing.

**Focus follows selection.** When the user presses `→`, both `activeTab` and `document.activeElement` update together. This is the "automatic activation" tablist variant — appropriate here because tab content is rendered by the parent and switching is cheap. (The "manual activation" variant, where arrow keys move focus only and `Enter` activates, is for cases where each tab triggers expensive content load.)

## State Flow Diagram

```
         ┌────────────────────────────┐
         │  initial render             │
         │  activeTab = tabs[0].id     │
         │  pillWidth/pillOffset = 0   │
         └────────────┬───────────────┘
                      │
                      │ onMount: $effect runs once
                      ▼
         ┌────────────────────────────┐
         │  pill snaps onto tabs[0]    │
         │  (no transition on first    │
         │   layout — initial state)   │
         └────────────┬───────────────┘
                      │
            ┌─────────┼─────────────────────────────┐
            │         │                             │
       click tab     ←/→/Home/End                resize / tab labels change
            │         │                             │
            ▼         ▼                             ▼
   ┌──────────────────────────────────┐   ┌────────────────────────┐
   │ activeTab = new id                │   │ $effect re-reads       │
   │ $effect re-runs                   │   │ offsetWidth/offsetLeft │
   │ reads new offsetWidth/Left        │   │ pill follows silently  │
   │ pillWidth + pillOffset update     │   └────────────┬───────────┘
   └──────────────────┬───────────────┘                │
                      │                                │
                      ▼                                ▼
         ┌────────────────────────────┐
         │  CSS transition (500ms)     │
         │  width + transform animate  │
         │  goo filter bridges blur    │
         │  colour swap (300ms) on btn │
         └────────────┬───────────────┘
                      │
                      │ transition completes
                      ▼
         ┌────────────────────────────┐
         │  pill at rest on new tab    │
         │  aria-selected updated      │
         └────────────────────────────┘

   prefers-reduced-motion === true:
       transitions replaced with `transition-none`;
       pill teleports; goo bridge never appears.
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tabs` | `Array<{ id: string; label: string }>` | `[]` | Tabs to render, in order. Each `id` must be unique. |
| `activeTab` | `string` (bindable) | `tabs[0]?.id ?? ''` | The currently selected tab id. Use `bind:activeTab` to read or write from the parent. |
| `class` | `string` | `''` | Extra classes appended to the container; merged via `cn()`. |
| `bg` | `string` | `'#171717'` | Background colour of the pill bar; accepts any CSS colour value. |
| `pillColor` | `string` | `'#ffffff'` | Fill colour of the moving pill itself. |
| `activeText` | `string` | `'#000000'` | Text colour of the active tab (the one inside the pill). |
| `inactiveText` | `string` | `'#a3a3a3'` | Text colour of inactive tabs at rest. |
| `inactiveHoverText` | `string` | `'#ffffff'` | Text colour of inactive tabs on hover. |

Colour props are wired through CSS custom properties (`--ltb-bg`, `--ltb-pill`, `--ltb-active`, `--ltb-inactive`, `--ltb-inactive-hover`) so they accept hex, `rgb(...)`, `hsl(...)`, and `var(--token)` references — useful for theming against an existing design-token system.

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `tabs` is empty on mount | Component renders an empty pill bar. `activeTab` falls back to `''`. The `$effect` no-ops because `findIndex` returns `-1` and `tabEls[-1]` is `undefined`. |
| `activeTab` is set to an id that does not exist in `tabs` | `findIndex` returns `-1`; the pill stays at its previous geometry rather than collapsing. The parent should reconcile the binding. |
| Tab labels change length at runtime (e.g. i18n switch) | The `$effect` does *not* re-run on label changes, only on `activeTab` changes. The pill keeps its old width until the next selection. If you need live-resize, force a re-read by toggling `activeTab` to itself. |
| User has `prefers-reduced-motion: reduce` | Both transitions are replaced with `transition-none`; the pill teleports; the goo bridge never forms. The component remains fully functional. |
| Two tabs are given the same `id` | `{#each}` keying by `tab.id` will throw a Svelte runtime warning about duplicate keys; the pill may target the wrong button. Ids must be unique. |
| Container is hidden (`display: none`) on mount | `offsetWidth` and `offsetLeft` both read `0`; the pill collapses. The `$effect` will recompute correctly the next time `activeTab` changes after the container becomes visible. |
| User clicks a tab very rapidly across the whole bar | Each click overwrites `pillWidth` and `pillOffset` immediately; the in-flight CSS transition retargets to the new values without a layout thrash. The goo filter handles the morph cleanly. |

## Dependencies

- **Svelte 5.x** — `$state`, `$effect`, `$bindable`, `$props` and `bind:this` are core to the implementation. There is no fallback for older Svelte versions.
- **Tailwind CSS** — used for layout and utility classes (`absolute`, `inline-flex`, `rounded-full`, `transition-all`, etc.). The component-specific styling lives in scoped `<style>` and CSS custom properties; if you copy the component into a non-Tailwind project, the utility classes need replacing with equivalent CSS.
- **`$lib/utils`** — only `cn()` for class merging.

Zero external animation libraries. The goo effect is pure SVG; the motion is pure CSS.

## File Structure

```
src/lib/components/LiquidTabBar.svelte         # implementation
src/lib/components/LiquidTabBar.md             # this file (rendered inside ComponentPageShell)
src/lib/components/LiquidTabBar.test.ts        # vitest unit tests
src/routes/liquidtabbar/+page.svelte           # demo page
```
