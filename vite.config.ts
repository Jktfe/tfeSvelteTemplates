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
	plugins: [sveltekit()]
});
