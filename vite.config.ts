/**
 * Vite Configuration
 *
 * This file configures Vite as the build tool and development server for SvelteKit.
 * The sveltekit() plugin handles all the necessary Vite configuration for SvelteKit.
 *
 * For additional Vite options, consult: https://vitejs.dev/config/
 */

import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

// Load environment variables from .env file
import { config } from 'dotenv';
config();

export default defineConfig({
	// SvelteKit plugin - handles all SvelteKit-specific Vite configuration
	plugins: [sveltekit()],

	// SSR configuration for packages that don't work well with Vite's SSR
	ssr: {
		// @panzoom/panzoom needs to be bundled for SSR to work correctly
		// It exports as default but Vite SSR has trouble with the module resolution
		noExternal: ['@panzoom/panzoom']
	}
});
