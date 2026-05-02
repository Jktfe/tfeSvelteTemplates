# AvatarStack — Technical Logic Explainer

## What Does It Do? (Plain English)

AvatarStack renders a horizontal group of overlapping circular avatars with an automatic `+N more` overflow tile when the group is larger than the visible limit. Each avatar gracefully degrades from photo → explicit initials → derived initials → deterministic background colour, so the component looks complete even when image URLs fail. Each avatar is keyboard-focusable, has a native tooltip, and the `+N` tile shows the next person's name on hover.

Think of it as the "who's involved" chip you see on every modern collaboration tool — Linear assignees, Figma collaborators, GitHub PR reviewers, Notion mentions.

## How It Works (Pseudo-Code)

```
props:
  people        = AvatarStackPerson[]                // [{ name, src?, alt?, initials?, color? }]
  max           = number                              // default 4
  size          = number (px)                         // default 36
  overlap       = number (px)                         // default 12
  borderColor   = CSS colour                          // default 'white'
  showOverflow  = boolean                             // default true

state:
  failedImages = {}                                   // map of index → boolean

derive:
  visiblePeople  = people.slice(0, max)
  overflowCount  = max(0, people.length - max)
  nextPerson     = people[max]                        // first person in overflow

helpers:
  deriveInitials(p): explicit p.initials, else first letter of first + last name token
  deriveColor(p):    explicit p.color,    else palette[hash(p.name) % 8]

render <div role="list" aria-label="People"
            style="--avatar-size --avatar-overlap --avatar-border">
  for each visible person, index i:
    showImg = person.src && !failedImages[i]
    <button title={alt ?? name} aria-label={alt ?? name}>
      if showImg:  <img src onerror={() => failedImages[i] = true} />
      else:        <span class="initials" aria-hidden>{initials}</span>
    </button>

  if showOverflow && overflowCount > 0:
    <button title={nextPerson.name + " and N-1 more"}
            aria-label={overflowCount + " more people"}>
      +{overflowCount}
    </button>
</div>
```

## The Core Concept: Negative Margins, Not Absolute Positioning

Most overlapping-avatar implementations reach for `position: absolute` and per-child `left: 0`, `left: 24px`, `left: 48px`. AvatarStack uses negative margins instead:

```css
.avatar-item + .avatar-item {
  margin-left: calc(-1 * var(--avatar-overlap));
}
```

The first child has no overlap; every subsequent child pulls itself `--avatar-overlap` pixels to the left. The result is the same visual stack, but with three big benefits:

1. **The container resizes itself.** `display: inline-flex` plus negative margins means the wrapper width grows naturally with the number of children. No JS measurement needed.
2. **Reordering is free.** Add or remove a person and the rest shift smoothly without recomputing any absolute offsets.
3. **Stacking order works without `z-index` arithmetic.** Document order plus `position: relative` puts the leftmost on top by default; on hover/focus we promote the active avatar with `z-index: 10`.

The container has `isolation: isolate` so the stacking context is local — promoted avatars don't escape the component and overlap unrelated UI.

## Three Levels Of Initials Fallback

The image-or-initials decision tree is:

```
1. person.src + !failedImages[i]
       └→  render <img>
             └→  on error: failedImages[i] = true → re-render falls through

2. person.initials
       └→  render explicit initials (capped at 2 chars, uppercased)

3. else, derive from person.name
       └→  one word ("Cher") → first 2 letters
       └→  many words ("Ada Lovelace King") → first letter of first + last word
       └→  empty/whitespace → '?'
```

The colour for the initials background follows a similar fallback:

```
1. person.color
       └→  render with that explicit colour

2. else, hash person.name
       └→  hash = (hash * 31 + charCode) | 0   (classic string-hash polynomial)
       └→  index = abs(hash) % 8                (eight-colour palette)
```

The string-hash polynomial (`* 31 + char`) is the same one Java's `String.hashCode` uses. It produces well-distributed indices for short strings like names; collisions exist but are rare and harmless — two people with the same initials colour are still distinguishable by name.

## The "+N More" Tooltip Trick

When the group overflows, the `+N` tile gets a smarter tooltip than just "5 more":

```
title = nextPerson
  ? `${nextPerson.name} and ${overflowCount - 1} more`
  : `${overflowCount} more`
```

If the next-hidden person is "Margaret Hamilton" and there are 5 hidden, the tooltip reads "Margaret Hamilton and 4 more". This gives users one extra piece of information for free — they can see at least one of the people the overflow is hiding without expanding anything.

The `aria-label` on the overflow tile is intentionally less specific (`"5 more people"`) because the tooltip text is for sighted users browsing visually; SR users typically want a count rather than a teaser.

## Hover & Focus Lift

Hovering or focusing an avatar lifts it 2 pixels with `transform: translateY(-2px)` and promotes its `z-index` so it sits above its neighbours. The transition is a quick 150ms; on `prefers-reduced-motion: reduce`, the lift is removed entirely and the focus ring alone communicates state.

```css
.avatar-item:hover,
.avatar-item:focus-visible {
  transform: translateY(-2px);
  z-index: 10;
}
```

The `:focus-visible` selector means keyboard users see the lift but mouse users don't get a flash of motion every time their cursor passes through. The 2-pixel rise is small enough not to disturb surrounding layout.

## Distinct From Avatar

- **Avatar** is one user. Has its own image-fallback logic.
- **AvatarStack** is a *group* of users. Reuses similar fallback ideas but adds overlap, max, overflow tile, and per-person `<button>` interactivity.

If you're rendering one user, use Avatar. If you're rendering many overlapping users with a count, use AvatarStack. They're not interchangeable; the stacking and overflow mechanics are AvatarStack-specific.

## State Flow Diagram

```
                  ┌──────────────────────┐
                  │  people  +  max      │
                  └────────────┬─────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
         visiblePeople    overflowCount   nextPerson
         = slice(0,max)   = max(0,        = people[max]
                            people.length-max)
                │              │              │
                ▼              ▼              ▼
      ┌──────────────────┐ ┌──────────────────┐
      │  render N        │ │  if > 0          │
      │  <button>s with  │ │  render +N tile  │
      │  img-or-initials │ │  with smart      │
      │  fallback        │ │  tooltip         │
      └────────┬─────────┘ └──────────────────┘
               │
               │ <img onerror>
               ▼
      failedImages[i] = true
               │
               ▼
      next render swaps to initials
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `people` | `AvatarStackPerson[]` | `[]` | List of people to render. Order is preserved; first → leftmost. |
| `max` | `number` | `4` | Maximum avatars shown before collapsing into the `+N` tile. |
| `size` | `number` | `36` | Avatar diameter in pixels. |
| `overlap` | `number` | `12` | How many pixels each avatar overlaps the previous. |
| `borderColor` | `string` | `'white'` | Ring colour separating overlapping avatars. |
| `showOverflow` | `boolean` | `true` | Render the `+N` tile when `people.length > max`. |
| `class` | `string` | `''` | Extra classes appended to the outer container. |

### `AvatarStackPerson`

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Display name. Used for tooltip, alt text, and initials fallback. Required. |
| `src` | `string` | Optional image URL. Falls back to initials when missing or failing to load. |
| `alt` | `string` | Optional explicit alt text override. Defaults to `name`. |
| `initials` | `string` | Optional explicit initials override (capped at 2 chars). |
| `color` | `string` | Optional explicit background colour for initials fallback. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `people` is empty | Renders an empty container — no avatars, no overflow. The `role="list"` is still announced as empty. |
| `people.length <= max` | All avatars render, no `+N` tile. `nextPerson` is `undefined` so the tile would have shown a count-only tooltip anyway. |
| `showOverflow = false` and `people.length > max` | Only the first `max` avatars render; the rest are dropped silently. Tell users "and N more" elsewhere if it matters. |
| Image URL fails partway through | `onerror` flips that index in `failedImages`; subsequent renders swap to initials for that one avatar only. Other photos are untouched. |
| Two people with the same name and no photos | Same hash → same colour → same initials. Visually identical; AT can still differentiate via the wrapping context (e.g. row position, surrounding text). |
| User has `prefers-reduced-motion: reduce` | Hover/focus lift transform is removed; focus ring alone communicates state. |
| Many avatars (e.g. 200 with `max=10`) | Only `max` + overflow tile render — the rest are not in the DOM at all. Performance scales with `max`, not with `people.length`. |
| Reordering `people` array | Svelte uses the `(person.name + i)` key for `each`. Identical names at different indices get distinct keys; updates animate via the negative-margin layout shift. |

## Dependencies

- **Svelte 5.x** — `$props`, `$state`, `$derived`, `each` blocks with key.
- **`$lib/utils`** — `cn()` for class merging (zero runtime cost).
- Zero external runtime dependencies. The hash, palette, and overflow logic are all in-component.

## File Structure

```
src/lib/components/AvatarStack.svelte         # component implementation
src/lib/components/AvatarStack.md             # this file (rendered inside ComponentPageShell)
src/lib/components/AvatarStack.test.ts        # vitest unit tests
src/routes/avatarstack/+page.svelte           # demo page
src/lib/types.ts                              # AvatarStackProps, AvatarStackPerson
```
