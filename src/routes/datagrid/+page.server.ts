/**
 * Server-side data loading for DataGrid demo page
 *
 * This module handles:
 * - Loading employee data from database or fallback constants
 * - Providing database connection status to the client
 * - Pre-computing statistics for display
 */

import { loadEmployeesWithSource, computeEmployeeStatistics } from '$lib/server/dataGrid';
import type { PageServerLoad } from './$types';

/**
 * Load employee data and statistics on the server
 *
 * This data is loaded once on the server and sent to the client.
 * Benefits of server-side loading:
 * - Data is available immediately on page load (no loading state needed)
 * - SEO-friendly (data rendered in initial HTML)
 * - Single source of truth for database connection status
 *
 * @returns Object containing:
 * - employees: Array of employee records
 * - usingDatabase / dataSource / dataSourceMessage: where the rows came from
 * - stats: Employee statistics (count, averages, etc.)
 */
export const load: PageServerLoad = async () => {
	const result = await loadEmployeesWithSource();

	return {
		employees: result.data,
		usingDatabase: result.usingDatabase,
		dataSource: result.source,
		dataSourceMessage: result.message,
		// Derived from the rows we already have — no second query.
		stats: computeEmployeeStatistics(result.data)
	};
};
