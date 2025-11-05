/**
 * Shared TypeScript type definitions for the CardStack template project
 *
 * This file contains all shared types used across components and server-side code
 * to ensure type consistency and prevent duplication.
 */

/**
 * Card data structure for CardStack components
 *
 * @property image - Optional URL to the card's background image
 * @property title - Optional title text displayed at the top of the card
 * @property content - Optional HTML content displayed at the bottom with gradient overlay
 */
export interface Card {
	image?: string;
	title?: string;
	content?: string;
}

/**
 * Database row structure from the cards table
 * Maps to the schema defined in database/schema.sql
 *
 * @property id - Unique identifier (auto-increment)
 * @property title - Card title
 * @property description - Card description/content (can contain HTML)
 * @property image_url - URL to card image
 * @property display_order - Order for displaying cards (lower numbers first)
 * @property created_at - Timestamp when card was created
 */
export interface CardRow {
	id: number;
	title: string;
	description: string;
	image_url: string;
	display_order: number;
	created_at: Date;
}

/**
 * Props for CardStack and CardStackAdvanced components
 *
 * @property cards - Array of card objects to display
 * @property cardWidth - Width of each card in pixels (default: 300)
 * @property cardHeight - Height of each card in pixels (default: 400)
 * @property partialRevealSide - Which side stays hidden on hover - 'left' or 'right' (default: 'right')
 */
export interface CardStackProps {
	cards?: Card[];
	cardWidth?: number;
	cardHeight?: number;
	partialRevealSide?: 'left' | 'right';
}
