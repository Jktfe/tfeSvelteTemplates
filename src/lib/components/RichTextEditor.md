# RichTextEditor

## What Does It Do? (Plain English)

RichTextEditor gives you a small word-processor inside a box on your page. You type into it like any text field, but a toolbar across the top lets you make words **bold**, *italic*, underlined, turn a line into a heading, build bullet or numbered lists, and add links.

The clever part is what comes *out*. Every time you edit, the component reads the messy HTML the browser produces, runs it through a tiny built-in cleaner, and hands you back a tidy, **safe** string of HTML. Anything dangerous — a sneaky `<script>`, an `onclick` attribute, a `javascript:` link — is stripped before it can reach your application or your database.

**Think of it like:** a bouncer on the door of a club. Only a short guest list of tags (`b`, `i`, `u`, `strong`, `em`, `a`, `h2`, `ul`, `ol`, `li`, `p`, `br`) gets in. Everything else is turned away, but its plain text is kept so you never lose what the user actually wrote.

---

## How It Works (Pseudo-Code)

```
ON every input / formatting action:
  1. READ editor.innerHTML  (the browser's raw output)
  2. PARSE it inside a detached document
     (detached = nothing runs, no images load, no scripts fire)
  3. WALK the tree node by node:
       IF text node            → keep the text
       IF tag on the allowlist → rebuild it, drop ALL attributes
                                  (except a safe href on <a>)
       IF tag NOT allowed      → discard the tag, KEEP its children
  4. SERIALISE the cleaned tree back to a string
  5. IF the string changed → update bind:value AND call onChange(html)

ON selection change (keyup / mouseup / focus):
  1. ASK the browser: is bold active? italic? underline?
  2. WALK up from the caret: are we inside an H2 / UL / OL?
  3. UPDATE the toolbar's aria-pressed + highlight state

ON toolbar button:
  bold/italic/underline → execCommand(name)
  h2                    → formatBlock toggles between <h2> and <p>
  ul / ol               → execCommand(insert(Un)orderedList)
  link                  → prompt for URL, reject unsafe schemes, createLink
  clear                 → wipe innerHTML
```

---

## The Core Concept: Allowlist Sanitisation

A denylist ("block `<script>`") is a losing game — attackers find tags and encodings you forgot. This component uses the opposite, **allowlist** approach: nothing is trusted unless it is on a short, explicit list.

```
                 dirty HTML
                     │
            ┌────────▼─────────┐
            │ createHTMLDocument│  ← detached, inert
            │  body.innerHTML   │
            └────────┬─────────┘
                     │ walk
        ┌────────────┼─────────────┐
        ▼            ▼             ▼
   text node    allowed tag    unknown tag
   keep text   rebuild clean   drop tag,
               (strip attrs)   keep children
                     │
              <a> special case:
              href tested against
              isSafeHref()
```

The single non-obvious rule is **"unwrap, don't delete"**: a `<div onclick="…">hello</div>` is not on the list, so the `<div>` and its attribute vanish — but the text `hello` is preserved by recursing into the children first. This means pasting from Word or a webpage degrades gracefully to clean text rather than disappearing.

## URL Scheme Filtering

Links are the one place an attribute survives, so `href` gets its own gate:

```
isSafeHref("https://x.com")  → true   (http/https)
isSafeHref("mailto:a@b.com") → true   (mailto/tel)
isSafeHref("#section")       → true   (relative / anchor)
isSafeHref("./page")         → true   (relative)
isSafeHref("javascript:…")   → false  (has a scheme, not allow-listed)
isSafeHref("data:text/html") → false  (has a scheme, not allow-listed)
```

The test is: if a string has a `scheme:` prefix, it must be one we recognise (`http`, `https`, `mailto`, `tel`); anything else with a scheme is rejected. Schemeless links (relative paths, fragments) are always fine. Surviving anchors also get `rel="noopener noreferrer"` and `target="_blank"`.

## On execCommand (the deprecated workhorse)

`document.execCommand` and `queryCommandState` are formally deprecated. They are also still implemented in every shipping browser, and there is **no standard replacement** for driving `contenteditable` formatting. The honest alternative is a bespoke Range/Selection engine — hundreds of lines, its own bug surface — which is overkill for a copy-paste template. We use `execCommand` deliberately, sanitise its output rigorously, and isolate it behind the `exec()` / `toggleBlock()` helpers so a future swap touches one place.

---

## State Flow Diagram

```
        ┌──────────────┐   type / format    ┌──────────────┐
        │    EMPTY     │ ──────────────────▶ │   EDITING    │
        │ placeholder  │                     │  has content │
        │   visible    │ ◀────────────────── │              │
        └──────────────┘   clear / delete    └──────┬───────┘
                                                     │ every edit
                                                     ▼
                                          ┌─────────────────────┐
                                          │  sanitise(innerHTML) │
                                          └──────────┬──────────┘
                                                     │ changed?
                                       ┌─────────────┴─────────────┐
                                       ▼ yes                       ▼ no
                              value = clean                    (no emit)
                              onChange(clean)
```

---

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` (bindable) | `''` | Sanitised HTML content. Reading it gives clean HTML; setting it (when unfocused) replaces the editor body. |
| `placeholder` | `string` | `'Start writing…'` | Shown when the editor has no meaningful content. |
| `onChange` | `(html: string) => void` | `undefined` | Fires after each edit with the sanitised HTML (only when it actually changes). |
| `ariaLabel` | `string` | `'Rich text editor'` | Accessible name for the editable region. |
| `disabled` | `boolean` | `false` | Disables editing and the toolbar; greys the surface. |

---

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Paste from Word / a webpage | Unknown wrappers (`<span style>`, `<div>`, `<font>`) are unwrapped to clean allow-listed HTML or plain text. |
| `<script>` or `<style>` pasted | Element discarded entirely (its text content is also dropped for `<script>`/`<style>` by the parser). |
| `onclick`, `style`, `class` attributes | Stripped from every element; only a vetted `href` survives on `<a>`. |
| `javascript:` / `data:` link | Rejected by `isSafeHref`; the anchor is kept but without an href. |
| Empty editor with a stray `<br>` | Treated as empty so the placeholder shows. |
| External `value` change while focused | Ignored — the live caret is never clobbered mid-type. |
| Link prompt cancelled | No change; pressing OK with an empty URL removes the link (`unlink`). |
| `disabled` | `contenteditable` switched off, toolbar buttons disabled, surface greyed. |

---

## Dependencies

Zero external dependencies. Pure Svelte 5 runes, scoped CSS, inline SVG icons, and a hand-rolled allowlist sanitiser built on the platform `document.implementation.createHTMLDocument` API. No `sanitize-html`, no DOMPurify, no icon library.

---

## File Structure

```
RichTextEditor.svelte    # The component (editor + toolbar + inline sanitiser)
RichTextEditor.test.ts   # Unit tests
RichTextEditor.md        # This explainer
```
