# Avatar — Technical Logic Explainer

## What Does It Do? (Plain English)

Avatar is a single user-identity element. Pass it a `src` and it renders a photo. Skip the `src` (or let the photo fail to load) and it falls back to the user's initials on a soft, deterministically-coloured background derived from their name. Same name produces the same colour everywhere — no persistence required, no random palette draws — so Ada Lovelace is always blue, Grace Hopper is always purple, in your sidebar and your comment thread alike.

Think of it as a robust profile-picture primitive that always renders something sensible, even when the network's having a bad day.

## How It Works (Pseudo-Code)

```
props:
  src    = optional image URL
  name   = optional display name
  alt    = optional accessible label override
  size   = 'sm' | 'md' | 'lg'                      // default 'md'
  shape  = 'circle' | 'rounded' | 'square'         // default 'circle'
  status = 'online' | 'away' | 'busy' | 'offline'  // optional
  children = optional snippet (overrides everything)

state:
  imgFailed = false                                 // flips on <img> onerror

derive:
  initials   = first letter of first two name tokens, uppercased; '?' if missing
  bgColour   = palette[charCodeSum(name) % palette.length]
  showImage  = Boolean(src) && !imgFailed
  label      = alt ?? name ?? 'User'
  inlineStyle = (showImage || children) ? '' : `background-color: {bgColour}`

effect (when src changes):
  imgFailed = false                                 // reset for the new URL

render <span role="img" aria-label={label} style={inlineStyle}>
  if children:        {render children}
  else if showImage:  <img src alt="" aria-hidden onerror={onImgError} />
  else:               <span class="initials" aria-hidden>{initials}</span>
  if status:          <span class="status status-{status}" aria-hidden />
</span>
```

## The Core Concept: Deterministic Colour From Name

The "Ada is always blue" property is what makes the initials fallback feel intentional rather than chaotic. The implementation is deliberately simple:

```
charCodeSum(name) % PALETTE.length
```

For each character in the name, sum its char code; take the result modulo the palette length to pick an index. Same string in, same index out — every time, on every page, on every device.

```
palette = [
  '#0ea5e9',  // sky
  '#6366f1',  // indigo
  '#a855f7',  // purple
  '#ec4899',  // pink
  '#f97316',  // orange
  '#eab308',  // amber
  '#14b8a6',  // teal
  '#10b981'   // emerald
]
```

Eight colours is a sweet spot: enough variety that adjacent users in a list rarely collide, few enough that each colour stays recognisable. The palette is tuned for readable white text at AA contrast at the default font weight — try harder than that and you'd need WCAG-aware contrast checks, which is overkill for this use case.

The colour is a hash, not a guarantee of uniqueness. Two different names will sometimes produce the same colour — that's fine. The point isn't "this colour means Ada"; the point is "Ada always looks the same, so I can spot her in a list at a glance".

## The `<img onerror>` Auto-Fallback

Real-world image URLs fail: 404s, expired CDN tokens, slow networks, ad-blockers. Avatar handles this without the parent having to detect or retry:

```
state: imgFailed = false

<img src={src} aria-hidden alt="" onerror={() => imgFailed = true} />
```

When the image fails to load, the browser fires the `error` event. The component flips `imgFailed`, the `showImage` derived re-evaluates to `false`, and the template re-renders the initials path on the next tick. The user sees a coloured initials block instead of a broken image icon.

The `$effect` that resets `imgFailed = false` whenever `src` changes is the polite version: if the parent swaps to a new URL (e.g. user uploaded a new photo), we should give it a chance rather than clinging to the previous failure flag. Without that effect, a once-failed avatar would *never* show an image again, even after the URL changed.

## Accessibility: One Announcement, Not Three

A naive avatar might announce its content three times to a screen reader: once via the `<img alt>`, once via the wrapper's `aria-label`, once via the visible initials. Avatar collapses this into a single announcement.

```
<span role="img" aria-label={alt ?? name ?? 'User'}>
  <img alt="" aria-hidden="true" />        ← decorative — silent
  <span class="initials" aria-hidden>AD</span>  ← decorative — silent
</span>
```

The wrapper carries `role="img"` and the meaningful label. The inner `<img>` and `<span class="initials">` are both `aria-hidden`. Screen readers announce a single "image: Ada Lovelace" — not "image: Ada, image: AD".

The status dot is also `aria-hidden`. Status colour alone is not enough to convey meaning — surrounding UI (a tooltip or a visible status label) should communicate "online" / "away" / etc. when that information matters.

## Distinct From AvatarStack

- **Avatar** is one user. Use it inline with a name in a comment, in a navbar, on a profile page.
- **AvatarStack** is a *group* of avatars overlapping with a `+N` overflow tile. Use it for collaborator chips, "who's online" headers, reaction summaries.

If you're rendering avatars in a `for` loop and they don't overlap, use Avatar. If they overlap and there's a count, use AvatarStack.

## State Flow Diagram

```
                 ┌──────────────────┐
                 │  src  passed     │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │  IMAGE LOADING   │
                 │  imgFailed=false │
                 └────────┬─────────┘
                          │
              ┌───────────┴────────────┐
              │                        │
       <img> onerror              <img> onload
              │                        │
              ▼                        ▼
      imgFailed = true        ┌──────────────────┐
              │               │  IMAGE VISIBLE   │
              ▼               │  status dot      │
   ┌──────────────────┐       │  optional        │
   │ INITIALS VISIBLE │       └──────────────────┘
   │ bgColour applied │
   │ status optional  │
   └──────────────────┘

   src changes (e.g. user uploads new photo):
       $effect resets imgFailed=false → IMAGE LOADING again
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | `undefined` | Image URL. Falls back to initials when missing or failing to load. |
| `name` | `string` | `undefined` | Display name. Drives initials and the deterministic background colour. |
| `alt` | `string` | `name` | Accessible label override. Falls through to `name`, then `'User'`. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 32 / 48 / 72 px diameter. |
| `shape` | `'circle' \| 'rounded' \| 'square'` | `'circle'` | Border-radius variant. |
| `status` | `'online' \| 'away' \| 'busy' \| 'offline'` | `undefined` | Optional status dot positioned bottom-right. |
| `children` | `Snippet` | `undefined` | Custom inner content — overrides image and initials. |
| `class` | `string` | `''` | Extra classes appended to the wrapper. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Neither `src` nor `name` is provided | Initials fall back to `'?'`; background uses palette index 0 (sky blue). Avatar still renders something sensible. |
| `name` is whitespace only | Splitting by `\s+` filters out empty tokens; initials fall back to `'?'`. |
| `name` is a single word (e.g. "Cher") | Initials are the first two letters of the single token. `cher` → `CH`. |
| Image URL fails to load | `onerror` flips `imgFailed`; the next render swaps to the initials fallback. No broken-image icon is ever shown. |
| Image URL changes after a previous failure | `$effect` resets `imgFailed = false`, giving the new URL a chance to load. |
| `alt` provided but empty string | `alt ?? name` resolves to `''`; the wrapper's `aria-label` is empty. Pass `null` only if you really want anonymous; otherwise rely on `name`. |
| Status dot on a square avatar | The dot is offset by `-2px` so it sits at the corner rather than overlapping the rounded inner area. |
| Children snippet provided | Overrides image, initials, and background. Useful for icon avatars (e.g. a system bot). |

## Dependencies

- **Svelte 5.x** — `$props`, `$state`, `$derived`, `$effect`, snippets.
- Zero external runtime dependencies. Initials, palette hash, and onerror handling are all in-component.

## File Structure

```
src/lib/components/Avatar.svelte         # component implementation
src/lib/components/Avatar.md             # this file (rendered inside ComponentPageShell)
src/lib/components/Avatar.test.ts        # vitest unit tests
src/routes/avatar/+page.svelte           # demo page
```
