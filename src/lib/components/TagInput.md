# TagInput

## What Does It Do? (Plain English)

TagInput turns a plain text box into a row of removable "chips" (also called tokens or pills). You type a word and press **Enter** or **comma**, and it becomes a chip. Keep typing to add more. Made a mistake? Press **Backspace** while the box is empty to peel off the last chip, or click the little ✕ on any chip.

**Think of it like:** the "To:" field in an email client — each recipient becomes its own little badge you can remove individually, and pasting a long list of addresses splits them out automatically.

The committed list is a plain `string[]` exposed through `bind:value`, so the parent always holds the current tags.

---

## How It Works (Pseudo-Code)

```
STATE:
  value[]        ← the committed tags (bindable)
  draft          ← the text currently being typed
  armedForDelete ← has the first empty-Backspace primed a deletion?

WHEN a key is pressed in the text box:
  IF key is Enter OR comma:
     commit the draft as a chip, then clear the draft
  ELSE IF key is Backspace AND draft is empty AND there are chips:
     IF already armed → remove the LAST chip
     ELSE             → arm deletion (highlight the last chip red)
  ELSE:
     cancel any armed deletion

WHEN text is pasted:
  IF the pasted text contains a comma or newline:
     split on commas/newlines → add each piece (running the same checks)

TO ADD a candidate tag:
  trim it
  REJECT if empty, over the max count, a duplicate, or validate() says no
  OTHERWISE append it to value[]
```

---

## The Core Concept: Two-Step Backspace Deletion

Naïve token inputs delete the last chip on the very first Backspace. That bites users who type fast and overshoot — a stray Backspace silently destroys a finished tag.

TagInput uses a **two-step "arm then fire"** gesture instead:

```
draft empty, press Backspace ──▶  ARMED   (last chip turns red)
ARMED,       press Backspace ──▶  DELETED (chip removed, disarmed)
ARMED,       press any other key ─▶ DISARMED (nothing lost)
```

The armed state is purely visual feedback driven by `class:is-armed`, so the user always sees which chip is about to go before it goes.

## Paste-to-Split and Dedupe

Pasting is where token inputs earn their keep. The paste handler only intercepts the event when the clipboard text actually contains a delimiter (`/[\n,]/`), so pasting a single value still behaves like normal typing. Multi-value pastes are split, trimmed, emptied-filtered, and each piece runs through the same `tryAdd` gate as a typed tag.

Dedupe is centralised in one `key()` function:

```
key(tag) = caseSensitive ? tag.trim() : tag.trim().toLowerCase()
```

Every existence check compares keys, so `"Svelte"` and `"svelte"` collapse to one entry by default, but flipping `caseSensitive` keeps them distinct without touching any other logic.

## Validation and Capacity

A single `tryAdd` chokepoint returns a human-readable reason string (or `''` on success). That reason is mirrored into a visually hidden `aria-live="polite"` region so screen-reader users hear *why* an entry was refused — duplicate, invalid, or over the `max` cap. When the cap is hit the text input is disabled and a visible hint appears, so the limit is obvious to sighted and non-sighted users alike.

---

## State Flow Diagram

```
                 ┌─────────────────────┐
                 │       IDLE          │
                 │  draft typing…      │
                 └──────────┬──────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │ Enter / comma     │ Backspace (empty)  │ paste w/ delimiter
        ▼                   ▼                    ▼
  ┌───────────┐       ┌───────────┐        ┌───────────┐
  │ tryAdd()  │       │  ARMED    │        │ addMany() │
  └─────┬─────┘       └─────┬─────┘        └─────┬─────┘
        │                   │ Backspace          │
   ok ──┤── rejected        ▼                    │
        │      │      ┌───────────┐              │
        ▼      ▼      │ remove    │              ▼
   value[]  notice    │ last chip │         value[] (many)
   updated  announced └───────────┘
```

---

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string[]` (bindable) | `[]` | The committed tags; flows both ways via `bind:value`. |
| `placeholder` | `string` | `'Add a tag…'` | Placeholder for the text input (hidden when at capacity). |
| `max` | `number` | `Infinity` | Maximum number of tags allowed. |
| `caseSensitive` | `boolean` | `false` | When false, differently-cased duplicates collapse to one. |
| `disabled` | `boolean` | `false` | Disable the whole control. |
| `ariaLabel` | `string` | `'Tags'` | Accessible name for the group and the add-input. |
| `validate` | `(tag: string) => boolean` | `() => true` | Return `false` to reject a candidate tag. |

---

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Submit empty/whitespace draft | Ignored — no chip created, no notice. |
| Duplicate (case-insensitive) | Rejected; polite announcement "… is already added". |
| Duplicate with `caseSensitive` | Allowed if the casing differs. |
| `max` reached | Input disabled, visible hint shown, further adds rejected. |
| Paste of a single value | Falls through to normal typing (no split). |
| Paste with trailing/empty fields | Empty pieces filtered out before adding. |
| Backspace mid-typing | Only deletes characters; chip deletion requires an empty draft. |
| `validate` rejects | Tag not added; reason announced via aria-live. |
| Remove via ✕ button | Removes that specific chip and refocuses the input. |

---

## Dependencies

Zero external dependencies. Pure Svelte 5 runes (`$state`, `$derived`, `$bindable`, `$props`), scoped CSS, and one inline SVG glyph for the remove button.

---

## File Structure

```
TagInput.svelte    # The component
TagInput.test.ts   # Unit tests
TagInput.md        # This explainer
```
