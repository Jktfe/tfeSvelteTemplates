/**
 * Shared constants for the CardStack template project
 *
 * This file contains all shared constant values to ensure consistency
 * across the application and prevent duplication.
 */

import type { Card } from './types';

/**
 * Fallback card data for when database is unavailable
 * Used by +page.server.ts when DATABASE_URL is not configured
 *
 * These cards use Unsplash images and are kept in sync with database/schema.sql seed data
 */
export const FALLBACK_CARDS: Card[] = [
	{
		title: 'Mountain Vista',
		content:
			'Breathtaking views from the highest peaks, where the air is crisp and the horizon endless.',
		image:
			'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
	},
	{
		title: 'Ocean Waves',
		content: 'The rhythmic dance of waves meeting shore, a timeless symphony of nature.',
		image:
			'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=600&fit=crop'
	},
	{
		title: 'Forest Path',
		content: 'Wandering through ancient woods, where sunlight filters through emerald canopies.',
		image:
			'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop'
	},
	{
		title: 'Desert Dunes',
		content: 'Golden sands sculpted by wind, creating an ever-changing landscape of beauty.',
		image:
			'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&h=600&fit=crop'
	},
	{
		title: 'City Lights',
		content: 'Urban brilliance illuminating the night, a testament to human achievement.',
		image:
			'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop'
	},
	{
		title: 'Northern Lights',
		content:
			"Aurora borealis painting the sky with ethereal colours, nature's greatest light show.",
		image:
			'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&h=600&fit=crop'
	}
];
