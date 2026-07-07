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
		// Pinned to Node 22.x (current LTS) to stay ahead of the Neon serverless
		// driver's Node 20+ requirement and to track a maintained runtime. The
		// markdown pipeline uses pure-JS `sanitize-html` (no jsdom/parse5), so
		// no ESM-require constraint forces a specific minor.
		adapter: adapter({
			runtime: 'nodejs22.x'
		})
	}
};

export default config;
