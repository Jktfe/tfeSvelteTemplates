/**
 * Server Load Function for Home Page
 *
 * Fetches card data from the database on the server side
 * This runs before the page loads, providing data for SSR
 *
 * BENEFITS OF SERVER-SIDE LOADING:
 * - SEO friendly (cards rendered in HTML)
 * - Faster initial page load
 * - No loading spinner needed
 * - Database credentials stay secure on server
 */

import type { PageServerLoad } from './$types';
import { neon } from '@neondatabase/serverless';

export const load: PageServerLoad = async () => {
	try {
		// Get database connection string from environment variable
		const databaseUrl = process.env.DATABASE_URL;

		// If DATABASE_URL is not configured, return empty cards array
		// This allows the app to work with fallback data
		if (!databaseUrl) {
			console.warn('DATABASE_URL not configured, using fallback data');
			return {
				cards: getFallbackCards()
			};
		}

		// Create Neon SQL client
		const sql = neon(databaseUrl);

		// Query cards from database
		const cards = await sql`
			SELECT
				id,
				title,
				description,
				image_url,
				display_order,
				created_at
			FROM cards
			ORDER BY display_order ASC
		`;

		// Transform database records to match component expectations
		const formattedCards = cards.map(card => ({
			id: card.id,
			title: card.title,
			content: card.description,
			image: card.image_url,
			display_order: card.display_order
		}));

		return {
			cards: formattedCards
		};

	} catch (err) {
		// Log error but don't crash - use fallback data instead
		console.error('Error loading cards from database:', err);

		// Return fallback cards so the demo still works
		return {
			cards: getFallbackCards()
		};
	}
};

/**
 * Fallback card data for when database is unavailable
 * Uses Unsplash images for beautiful placeholders
 */
function getFallbackCards() {
	return [
		{
			id: 1,
			title: 'Mountain Vista',
			content: 'Breathtaking views from the highest peaks, where the air is crisp and the horizon endless.',
			image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
			display_order: 1
		},
		{
			id: 2,
			title: 'Ocean Waves',
			content: 'The rhythmic dance of waves meeting shore, a timeless symphony of nature.',
			image: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=600&fit=crop',
			display_order: 2
		},
		{
			id: 3,
			title: 'Forest Path',
			content: 'Wandering through ancient woods, where sunlight filters through emerald canopies.',
			image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
			display_order: 3
		},
		{
			id: 4,
			title: 'Desert Dunes',
			content: 'Golden sands sculpted by wind, creating an ever-changing landscape of beauty.',
			image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&h=600&fit=crop',
			display_order: 4
		},
		{
			id: 5,
			title: 'City Lights',
			content: 'Urban brilliance illuminating the night, a testament to human achievement.',
			image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop',
			display_order: 5
		},
		{
			id: 6,
			title: 'Northern Lights',
			content: 'Aurora borealis painting the sky with ethereal colours, nature\'s greatest light show.',
			image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&h=600&fit=crop',
			display_order: 6
		}
	];
}
