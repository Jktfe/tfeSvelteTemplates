# TFE Catalogue Delivery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the TFE Svelte Templates repo from a large demo catalogue into a verified, productized component library with health, theming, copy, evidence, and interaction-lab surfaces.

**Architecture:** Stabilize the current gates first, then add catalogue-driven product components that reuse `componentCatalog.ts` metadata rather than duplicating registry facts. New components should remain copy-paste friendly: one primary `.svelte` file, one `.md` doc, one route, focused tests, and screenshot proof.

**Tech Stack:** SvelteKit, Svelte 5, TypeScript, Vitest, Playwright, catalogue metadata in `src/lib/componentCatalog.ts`, screenshots in `static/ComponentScreenshots`.

---

## Delivery Rules

- One owner per lane. Do not edit another active lane's files without a room claim.
- Fix red gates before adding broad new surface.
- Every new component needs source, route, docs, test, catalogue entry, screenshot, and browser proof.
- Prefer existing local patterns: `ComponentPageShell`, `AgentPromptCopy`, `component(...)` catalogue entries, focused helper exports for testable logic.
- Keep external dependencies out unless the component cannot be credible without them.

## Lane 0: Trust Gates

**Files:**
- Modify: `src/lib/components/AnimatedText.svelte`
- Modify: `src/lib/components/SearchBar.svelte`
- Modify: `src/lib/components/WaveText.svelte`
- Modify: `src/lib/components/NeonSign.svelte`
- Modify: `src/routes/+page.svelte`
- Modify: `vitest.setup.ts` or narrow test mocks if needed
- Modify: `tests/home.spec.ts`

- [x] **Step 1: Restore Svelte diagnostics**

Run: `bun run check`

Expected: `svelte-check found 0 errors and 0 warnings`

- [ ] **Step 2: Stabilize Vitest**

Run: `bun run test`

Expected: all Vitest files pass and command exits 0. If external CSS fetches or GSAP teardown errors remain, mock them in the test environment rather than masking failures globally.

- [ ] **Step 3: Replace stale homepage E2E**

Run: `bun run test:e2e -- tests/home.spec.ts`

Expected: homepage smoke tests use current catalogue content, not obsolete `.component-card` / 25-card assumptions.

## Lane 1: ComponentHealthMatrix

**Files:**
- Create: `src/lib/components/ComponentHealthMatrix.svelte`
- Create: `src/lib/components/ComponentHealthMatrix.md`
- Create: `src/lib/components/ComponentHealthMatrix.test.ts`
- Create: `src/routes/componenthealthmatrix/+page.svelte`
- Modify: `src/lib/componentCatalog.ts`

- [ ] **Step 1: Add testable health helpers**

Expose helper functions in the component module for status derivation:

```ts
export type HealthStatus = 'ready' | 'partial' | 'missing';

export function healthStatus(done: boolean, partial = false): HealthStatus {
	return done ? 'ready' : partial ? 'partial' : 'missing';
}
```

- [ ] **Step 2: Render a catalogue health table**

Show one row per catalogue item with columns for docs, screenshot, tests, theme support, dependencies, and route. Use compact status badges and a search/filter control.

- [ ] **Step 3: Register and verify**

Add the catalogue entry under `Data-Backed Workflows` or a new `Library Operations` shelf, then run:

```bash
bun run test -- src/lib/components/ComponentHealthMatrix.test.ts src/lib/componentCatalog.test.ts
bun run check
```

## Lane 2: ThemeTokenInspector

**Files:**
- Create: `src/lib/components/ThemeTokenInspector.svelte`
- Create: `src/lib/components/ThemeTokenInspector.md`
- Create: `src/lib/components/ThemeTokenInspector.test.ts`
- Create: `src/routes/themetokeninspector/+page.svelte`
- Modify: `src/lib/componentCatalog.ts`

- [ ] **Step 1: Encode token groups**

Represent token rows as `chrome`, `brand`, or `semantic`, matching `docs/THEMING.md`.

- [ ] **Step 2: Add live theme preview**

Provide light/dark toggle, token swatches, contrast note, and copyable CSS override snippets.

- [ ] **Step 3: Register and verify**

Run targeted component and catalogue tests, then browser-check the route in light and dark modes.

## Lane 3: CopyPasteComposer

**Files:**
- Create: `src/lib/components/CopyPasteComposer.svelte`
- Create: `src/lib/components/CopyPasteComposer.md`
- Create: `src/lib/components/CopyPasteComposer.test.ts`
- Create: `src/routes/copypastecomposer/+page.svelte`
- Modify: `src/lib/componentCatalog.ts`

- [ ] **Step 1: Build bundle derivation helpers**

Given a catalogue item, derive source/docs/demo/dependencies/related files and a checklist.

- [ ] **Step 2: Render export checklist**

Let users pick docs, tests, route, and related files. Show install commands and copy-ready file list.

## Lane 4: EvidenceCard and AgentLaneBoard

**Files:**
- Create: `src/lib/components/EvidenceCard.svelte`
- Create: `src/lib/components/EvidenceCard.md`
- Create: `src/lib/components/EvidenceCard.test.ts`
- Create: `src/routes/evidencecard/+page.svelte`
- Create: `src/lib/components/AgentLaneBoard.svelte`
- Create: `src/lib/components/AgentLaneBoard.md`
- Create: `src/lib/components/AgentLaneBoard.test.ts`
- Create: `src/routes/agentlaneboard/+page.svelte`
- Modify: `src/lib/componentCatalog.ts`

- [ ] **Step 1: Ship EvidenceCard first**

Render command, status, output excerpt, screenshot link, owner, and timestamp. Keep it useful for room updates and component pages.

- [ ] **Step 2: Compose AgentLaneBoard from EvidenceCard**

Represent lanes as `active`, `review`, `blocked`, or `done`, with owner, ETA, files, and acceptance gate.

## Lane 5: Visual QA and Interaction Components

**Components:**
- `RoutePreviewRail`
- `InteractionLab`
- `TokenSwatchGrid`
- `DataVizInspector`
- `MediaLightboxPro`

- [ ] **Step 1: Build in this order**

`TokenSwatchGrid` before `ThemeTokenInspector` if token visuals need extraction. `RoutePreviewRail` before large screenshot automation. `InteractionLab` before motion-heavy follow-on components. `DataVizInspector` before additional chart demos. `MediaLightboxPro` last because it is the least connected to current quality gates.

- [ ] **Step 2: Verify each component**

For each component, run targeted unit tests, `bun run check`, and browser screenshot proof for the route.

## Final Release Gate

- [ ] `bun run check`
- [ ] `bun run test`
- [ ] `bun run test:e2e -- tests/home.spec.ts`
- [ ] `bun run build`
- [ ] Browser route proof for every new component
- [ ] Room evidence update with files changed, checks run, screenshots, blockers
