/**
 * Server-side data loading for the DataGrid demo page
 *
 * - Loads employees from Neon, or the FALLBACK_EMPLOYEES constants, via the
 *   dataSource.ts helpers so the page status is always honest
 * - Tells the page whether writes can actually persist (a working database)
 * - Tells the page whether the viewer is the read-only public demo user, so
 *   the editing demo can explain why saves are refused
 * - Tells the page whether anyone is signed in: the write API requires a
 *   session (requireAuthAPI), so anonymous visitors edit in memory instead
 */

import { loadEmployeesWithSource, computeEmployeeStatistics } from '$lib/server/dataGrid';
import { checkAuth, isDemoUser } from '$lib/server/auth';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const result = await loadEmployeesWithSource();

	return {
		employees: result.data,
		// Only true when the rows really came from the database — the
		// .env.example placeholder and failed queries both report false.
		usingDatabase: result.usingDatabase,
		dataSource: result.source,
		dataSourceMessage: result.message,
		isSignedIn: checkAuth(event).authenticated,
		isDemoUser: isDemoUser(event),
		// Derived from the rows we already have — no second query.
		stats: computeEmployeeStatistics(result.data)
	};
};
