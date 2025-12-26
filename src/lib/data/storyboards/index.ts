/**
 * ============================================================
 * Storyboard Data Exports
 * ============================================================
 *
 * Central export point for all component storyboards.
 * Import storyboards from this file for use in the dynamic route.
 *
 * Adding a new storyboard:
 *   1. Create the storyboard file in this directory
 *   2. Import and export it here
 *   3. Add the component name to the storyboards map
 *
 * ============================================================
 */

import type { ExplainerCanvasData } from '$lib/types';
import { shineBorderStoryboard } from './shineborder';

/**
 * Map of component names to their storyboard data.
 * The key should match the URL slug (/storyboard/[component]).
 */
export const storyboards: Record<string, ExplainerCanvasData> = {
	shineborder: shineBorderStoryboard
	// Add more storyboards here as they're created:
	// cardstack: cardStackStoryboard,
	// marquee: marqueeStoryboard,
	// magiccard: magicCardStoryboard,
	// ... etc.
};

/**
 * Get a storyboard by component name.
 * Returns undefined if the storyboard doesn't exist.
 */
export function getStoryboard(componentName: string): ExplainerCanvasData | undefined {
	return storyboards[componentName.toLowerCase()];
}

/**
 * Get list of all available storyboard component names.
 * Useful for generating navigation or sitemap.
 */
export function getAvailableStoryboards(): string[] {
	return Object.keys(storyboards);
}

// Re-export individual storyboards for direct import
export { shineBorderStoryboard };
