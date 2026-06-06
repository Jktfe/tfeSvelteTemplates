# CopyPasteComposer

## Purpose

`CopyPasteComposer` turns the component catalogue into a practical handoff surface. A visitor chooses one catalogue entry, toggles the supporting artefacts they want, and receives the files, dependency command, copy commands, usage snippet, and final checklist in one place.

## Data Model

The component consumes catalogue-shaped entries with `source`, `docs`, `demo`, `dependencies`, `relatedFiles`, and `usage`. It does not read the filesystem directly; routes pass the catalogue rows in, which keeps the component testable and usable in static contexts.

## Helper Exports

- `deriveSelectedFiles(entry, options)` returns the ordered source/docs/demo/test/related file list for the current toggles.
- `deriveInstallCommands(entry, options)` returns dependency, directory, and copy commands for the selected file list.
- `testCandidatesFor(entry)` derives colocated `.test.ts`, `.test.svelte`, and `TestHarness.test.svelte` candidates from Svelte source paths.
- `checklistFor(entry, options)` turns the selected bundle into implementation review steps.

## Behaviour Notes

The source component is always included because the bundle is meaningless without it. Docs, demo route, tests, and related files are optional so the receiving project can choose a minimal install or a fuller migration pack.

Test files listed in `relatedFiles` are treated as tests when the Tests toggle is enabled. Non-test `relatedFiles` stay behind the Related files toggle, which prevents helper utilities from being silently bundled unless the user asks for them.
