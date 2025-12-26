/**
 * Sankey data utilities
 * Server-side functions for loading expandable Sankey data from database
 * Follows project pattern: Neon PostgreSQL with graceful fallback to constants
 */

import { neon } from '@neondatabase/serverless';
import type { SankeyNode, SankeyLink } from '$lib/types';
import { FALLBACK_SANKEY_DATA } from '$lib/constants';

/**
 * Load Sankey nodes and links from Neon database
 * Falls back to FALLBACK_SANKEY_DATA if database is not configured or query fails
 *
 * @param category - Optional category filter (default: 'energy')
 * @returns Object containing nodes and links arrays
 *
 * @example
 * ```typescript
 * // In +page.server.ts
 * export const load: PageServerLoad = async () => {
 *   const sankeyData = await loadSankeyDataFromDatabase('energy');
 *   return { sankeyData };
 * };
 * ```
 */
export async function loadSankeyDataFromDatabase(
	category: string = 'energy'
): Promise<{ nodes: SankeyNode[]; links: SankeyLink[] }> {
	try {
		const databaseUrl = process.env.DATABASE_URL;

		if (!databaseUrl) {
			console.warn('[SankeyData] DATABASE_URL not configured, using fallback data');
			return FALLBACK_SANKEY_DATA;
		}

		const sql = neon(databaseUrl);

		// Query nodes
		const nodeRows = await sql`
			SELECT
				id,
				label,
				color,
				expandable,
				parent,
				display_order
			FROM sankey_nodes
			WHERE
				category = ${category}
				AND is_active = TRUE
			ORDER BY display_order ASC
		`;

		// Query links
		const linkRows = await sql`
			SELECT
				source,
				target,
				value
			FROM sankey_links
			WHERE
				category = ${category}
				AND is_active = TRUE
		`;

		// Transform database rows to component format
		const nodes: SankeyNode[] = nodeRows.map((row) => ({
			id: row.id,
			label: row.label,
			color: row.color || undefined,
			expandable: row.expandable || undefined,
			parent: row.parent || undefined
		}));

		const links: SankeyLink[] = linkRows.map((row) => ({
			source: row.source,
			target: row.target,
			value: Number(row.value)
		}));

		console.log(
			`[SankeyData] Loaded ${nodes.length} nodes and ${links.length} links for category "${category}"`
		);

		return { nodes, links };
	} catch (error) {
		console.error('[SankeyData] Error loading from database:', error);
		console.warn('[SankeyData] Falling back to constant data');
		return FALLBACK_SANKEY_DATA;
	}
}

/**
 * Get list of available Sankey categories
 * Useful for demo pages with category switchers
 *
 * @returns Array of category names
 */
export async function getSankeyCategories(): Promise<string[]> {
	try {
		const databaseUrl = process.env.DATABASE_URL;

		if (!databaseUrl) {
			return ['energy'];
		}

		const sql = neon(databaseUrl);

		const rows = await sql`
			SELECT DISTINCT category
			FROM sankey_nodes
			WHERE is_active = TRUE
			ORDER BY category ASC
		`;

		return rows.map((row) => row.category);
	} catch (error) {
		console.error('[SankeyData] Error loading categories:', error);
		return ['energy'];
	}
}
