# CopyPasteComposer - Technical Logic Explainer

## What Does It Do? (Plain English)

CopyPasteComposer turns the component catalogue into a practical handoff surface. A visitor picks one catalogue entry, ticks the supporting artefacts they want (docs, demo route, tests, related helper files), chooses a package manager and a target folder, and gets back the exact file list, the install and copy commands, a review checklist and the usage snippet — all in one place.

**Think of it like:** a flat-pack furniture picking list. You choose the wardrobe, tick whether you want the shelves and the door handles, and the list tells you which boxes to collect and the order to assemble them.

---

## How It Works (Pseudo-Code)

```
WHEN component loads:
  1. RECEIVE catalogue-shaped entries from the route (never reads the filesystem)
  2. SET toggles from defaultCopyPasteOptions
     (docs on, demo on, tests on, related files off, bun, target '.')
  3. EFFECT: if selectedHref is not a known entry
       → use initialHref when it matches, else the first entry

DERIVED on every change:
  selectedEntry  = entry matching selectedHref (or entries[0])
  selectedFiles  = deriveSelectedFiles(selectedEntry, toggles)
  commands       = deriveInstallCommands(selectedEntry, toggles)
  checklist      = checklistFor(selectedEntry, toggles)

deriveSelectedFiles(entry, options):
  1. ADD entry.source            (kind 'source', required)
  2. IF includeDocs  → ADD entry.docs
  3. IF includeDemo  → ADD entry.demo
  4. IF includeTests → ADD every relatedFile that looks like a test
  5. IF includeRelatedFiles → ADD every relatedFile that is NOT a test
  6. SKIP duplicates and empty paths (leading slashes stripped)

deriveInstallCommands(entry, options):
  1. IF dependencies → "<pm> add ..." (npm → "npm install", yarn/pnpm → "add")
  2. FOR each unique target directory → "mkdir -p <dir>"
  3. FOR each selected file → "cp <path> <targetRoot>/<path>"
```

---

## The Core Concept: Pure Helpers, Thin UI

Every piece of logic lives in `<script module>` as a pure, exported function. The component body only holds toggle state and wires `$derived` values to those helpers.

```
  toggles ($state) ──▶ deriveSelectedFiles ──▶ file list panel
         │          ──▶ deriveInstallCommands ──▶ command block
         │          ──▶ checklistFor ──▶ checklist panel
         └────────────▶ entry.usage ──▶ usage panel
```

This buys three things:

1. **Testability** — `CopyPasteComposer.test.ts` exercises the helpers directly without mounting the DOM.
2. **Reuse** — a CLI or an agent prompt can import `deriveInstallCommands` and get the same output the UI shows.
3. **Static-friendly** — because the route passes rows in, the component works on prerendered pages with no server.

### Helper exports

| Helper | Returns |
|--------|---------|
| `deriveSelectedFiles(entry, options)` | Ordered source → docs → demo → tests → related file list |
| `deriveInstallCommands(entry, options)` | Dependency install, `mkdir -p` and `cp` commands |
| `dependencyInstallCommand(deps, pm)` | A single install line, or `''` when there are no dependencies |
| `testCandidatesFor(entry)` | Colocated `.test.ts`, `.test.svelte` and `TestHarness.test.svelte` guesses |
| `checklistFor(entry, options)` | Human review steps for the chosen bundle |
| `normalisePath(path)` | The path with leading slashes stripped |

---

## Test vs Related File Classification

`relatedFiles` on a catalogue entry is a mixed bag — helper utilities, shared types and test files all live there. The composer splits them with a single regex:

```
/\.(test|spec)\.(ts|tsx|js|jsx|svelte)$/
```

- Matches → treated as a **test** and shown only when the Tests toggle is on.
- No match → treated as **related** and shown only when Related files is on.

Related files default to **off** so helper modules are never silently bundled; the receiving project has to opt in.

---

## State Flow Diagram

```
   ┌──────────────────────┐
   │   NO ENTRIES         │  entries = []
   │   "No catalogue      │
   │    entries…" message │
   └──────────────────────┘

   ┌──────────────────────┐   select another component
   │   ENTRY SELECTED     │◀──────────────────────────┐
   │   selectedHref set   │                           │
   └──────────┬───────────┘                           │
              │ toggle docs / demo / tests / related  │
              │ change package manager / target root  │
              ▼                                       │
   ┌──────────────────────┐                           │
   │   RE-DERIVE          │                           │
   │   files, commands,   │───────────────────────────┘
   │   checklist          │
   └──────────────────────┘

   entries prop changes and selectedHref vanishes
      → effect resets to initialHref (if present) or entries[0]
```

---

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `entries` | `CopyPasteCatalogEntry[]` | — (required) | Catalogue rows with `name`, `href`, `category`, `description`, `source`, `docs`, `demo`, `dependencies`, `relatedFiles` and `usage`. |
| `title` | `string` | `'Copy-paste composer'` | Heading shown at the top of the composer. |
| `initialHref` | `string` | — | `href` of the entry to preselect; ignored if no entry matches. |

---

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `entries` is empty | Controls are hidden and a "No catalogue entries are available." message renders. |
| `initialHref` does not match any entry | Falls back to the first entry. |
| Entry has no dependencies | No install line is emitted; the checklist asks you to confirm Svelte 5 instead. |
| `targetRoot` is blank or has trailing slashes | Treated as `.`; trailing slashes are trimmed before joining paths. |
| Docs path duplicates the source path | Deduplicated — each path appears once. |
| Unknown package manager string | Emits `<manager> add <deps>` so custom tools still get a sensible line. |
| All optional toggles off | Only the required source file is listed and copied. |

---

## Dependencies

- **Svelte 5.x** — runes (`$state`, `$derived`, `$effect`, `$props`) drive the reactive bundle.
- **`svelte/reactivity`** (`SvelteSet`) — ships with Svelte; used to collect unique test candidates.
- Zero external dependencies beyond Svelte itself.

---

## File Structure

```
src/lib/components/CopyPasteComposer.svelte     # implementation + exported pure helpers
src/lib/components/CopyPasteComposer.md         # this file (rendered inside ComponentPageShell)
src/lib/components/CopyPasteComposer.test.ts    # vitest unit tests for the helpers
src/routes/copypastecomposer/+page.svelte       # demo page
```
