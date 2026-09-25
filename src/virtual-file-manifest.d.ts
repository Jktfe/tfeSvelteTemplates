/**
 * Types for the `virtual:file-manifest` module served by
 * scripts/viteFileManifest.ts. Each array lists repo-relative paths with a
 * leading slash (the same shape `import.meta.glob` keys use).
 */
declare module 'virtual:file-manifest' {
	export const screenshotFiles: string[];
	export const componentSourceFiles: string[];
	export const componentDocFiles: string[];
	export const demoPageFiles: string[];
}
