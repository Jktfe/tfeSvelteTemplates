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
		// Vercel adapter for serverless deployment
		// Runtime set to nodejs20.x for compatibility with Neon serverless driver
		adapter: adapter({
			runtime: 'nodejs20.x' // Required for @neondatabase/serverless compatibility
		})
	}
};

export default config;
