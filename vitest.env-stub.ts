/**
 * Stand-in for SvelteKit's virtual `$env/dynamic/*` modules under Vitest.
 *
 * The test config uses the plain Svelte plugin (not the SvelteKit one), so the
 * virtual env modules don't exist and any server file importing them fails to
 * resolve. Aliasing them here lets such files load; tests that care about a
 * value can still `vi.mock('$env/dynamic/public', ...)` to supply their own.
 */
export const env: Record<string, string | undefined> = process.env;
