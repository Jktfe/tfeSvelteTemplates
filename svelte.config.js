import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/**
 * SvelteKit Configuration
 *
 * This file configures SvelteKit for deployment to Vercel.
 * Consult https://svelte.dev/docs/kit/configuration for more options.
 */

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Preprocessors transform your Svelte code before compilation
	// vitePreprocess handles TypeScript, PostCSS, and other transformations
	// Consult https://svelte.dev/docs/kit/integrations for more preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// Vercel adapter for serverless deployment.
		//
		// Node 22.x is required because `isomorphic-dompurify` (used by the
		// component-docs markdown pipeline) pulls in `jsdom`, which does
		// `require('parse5')`. parse5 is now pure ESM — `require()` of an
		// ESM module is only supported from Node 22.12+. On Node 20 it fails
		// at runtime with ERR_REQUIRE_ESM and every SSR page returns 500.
		// Neon's serverless driver is happy on Node 22+ as well.
		adapter: adapter({
			runtime: 'nodejs22.x'
		})
	}
};

export default config;
