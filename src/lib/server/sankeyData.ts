/**
 * Sankey data utilities
 * Server-side functions for loading expandable Sankey data from database
 * Follows project pattern: Neon PostgreSQL with graceful fallback to constants
 */

import { neon } from '@neondatabase/serverless';
import type { SankeyNode, SankeyLink } from '$lib/types';
import { FALLBACK_SANKEY_DATA } from '$lib/constants';
import { getConfiguredDatabaseUrl, loadWithFallback, type DataSourceResult } from './dataSource';

export interface SankeyData {
	nodes: SankeyNode[];
	links: SankeyLink[];
}

/**
 * Load Sankey nodes and links plus where they came from (database / fallback / error).
 * Falls back to FALLBACK_SANKEY_DATA if the database is not configured or the query fails.
 *
 * @param category - Optional category filter (default: 'energy')
 *
 * @example
 * ```typescript
 * // In +page.server.ts
 * export const load: PageServerLoad = async () => {
 *   const result = await loadSankeyDataWithSource('energy');
 *   return { sankeyData: result.data, usingDatabase: result.usingDatabase };
 * };
 * ```
 */
export async function loadSankeyDataWithSource(
	category: string = 'energy'
): Promise<DataSourceResult<SankeyData>> {
	return loadWithFallback<SankeyData>(
		FALLBACK_SANKEY_DATA,
		async (databaseUrl) => {
			const sql = neon(databaseUrl);

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

			return { nodes, links };
		},
		{ label: 'SankeyData' }
	);
}

/**
 * Load Sankey nodes and links (data only).
 *
 * @param category - Optional category filter (default: 'energy')
 */
export async function loadSankeyDataFromDatabase(category: string = 'energy'): Promise<SankeyData> {
	return (await loadSankeyDataWithSource(category)).data;
}

/**
 * Get list of available Sankey categories
 * Useful for demo pages with category switchers
 *
 * @returns Array of category names
 */
export async function getSankeyCategories(): Promise<string[]> {
	const databaseUrl = getConfiguredDatabaseUrl();

	if (!databaseUrl) {
		return ['energy'];
	}

	try {
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
