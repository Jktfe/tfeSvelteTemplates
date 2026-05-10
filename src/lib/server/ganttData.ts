/**
 * Gantt schedule data utilities
 * Server-side loader for the Gantt template. Returns DataSourceResult so the
 * demo route can show a "database / fallback / error" badge consistently with
 * other components in the project.
 */

import { neon } from '@neondatabase/serverless';
import {
	fromDatabase,
	fromDatabaseError,
	fromFallback,
	fromMissingTable,
	getConfiguredDatabaseUrl,
	isMissingTableError,
	type DataSourceResult
} from './dataSource';
import type { GanttTask, GanttTaskRow } from '$lib/types';
import { FALLBACK_GANTT } from '$lib/constants';

interface GanttDependencyRow {
	task_key: string;
	depends_on: string;
}

function rowToTask(row: GanttTaskRow, deps: string[]): GanttTask {
	return {
		id: row.task_key,
		name: row.name,
		start: typeof row.start_date === 'string' ? row.start_date : new Date(row.start_date).toISOString().slice(0, 10),
		end: typeof row.end_date === 'string' ? row.end_date : new Date(row.end_date).toISOString().slice(0, 10),
		progress: row.progress ?? undefined,
		dependencies: deps.length > 0 ? deps : undefined,
		isMilestone: row.is_milestone === true,
		color: row.color ?? undefined,
		group: row.group_name ?? undefined,
		assignee: row.assignee ?? undefined
	};
}

/**
 * Load the Gantt schedule from Neon, joining gantt_tasks ↔ gantt_dependencies.
 * Falls back to FALLBACK_GANTT when the database is not configured.
 */
export async function loadGanttFromDatabase(): Promise<DataSourceResult<GanttTask[]>> {
	const databaseUrl = getConfiguredDatabaseUrl();
	if (!databaseUrl) return fromFallback(FALLBACK_GANTT);

	try {
		const sql = neon(databaseUrl);

		const taskRows = (await sql`
			SELECT id, task_key, name, start_date, end_date, progress, is_milestone,
			       color, group_name, assignee, display_order, is_active,
			       created_at, updated_at
			FROM gantt_tasks
			WHERE is_active = TRUE
			ORDER BY display_order ASC, start_date ASC
		`) as unknown as GanttTaskRow[];

		const depRows = (await sql`
			SELECT task_key, depends_on
			FROM gantt_dependencies
		`) as unknown as GanttDependencyRow[];

		const depMap = new Map<string, string[]>();
		for (const dep of depRows) {
			const list = depMap.get(dep.task_key);
			if (list) list.push(dep.depends_on);
			else depMap.set(dep.task_key, [dep.depends_on]);
		}

		const tasks = taskRows.map((row) => rowToTask(row, depMap.get(row.task_key) ?? []));
		return fromDatabase(tasks);
	} catch (err) {
		if (isMissingTableError(err)) {
			// Treat "schema not yet provisioned" as a setup state, not an error.
			return fromMissingTable(FALLBACK_GANTT, 'schema_gantt.sql');
		}
		console.error('[ganttData] Error loading Gantt schedule:', err);
		return fromDatabaseError(FALLBACK_GANTT, err);
	}
}
