/**
 * Every DB-backed read loader in src/lib/server/ should behave identically:
 * no database → fixture data flagged `fallback` (without touching Neon),
 * failing database → fixture data flagged `error`, working database → rows
 * flagged `database`. This table-driven suite pins that contract so a loader
 * can't quietly drift back to reading process.env on its own.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { neonMock, sqlMock } = vi.hoisted(() => {
	const sqlMock = vi.fn();
	const neonMock = vi.fn(() => sqlMock);
	return { neonMock, sqlMock };
});

vi.mock('@neondatabase/serverless', () => ({ neon: neonMock }));

import {
	FALLBACK_CALENDAR_DATA,
	FALLBACK_CARDS,
	FALLBACK_EDITOR_DATA,
	FALLBACK_EMPLOYEES,
	FALLBACK_EXPANDING_CARDS,
	FALLBACK_FILES,
	FALLBACK_FOLDERS,
	FALLBACK_GANTT,
	FALLBACK_LINK_PREVIEWS,
	FALLBACK_MAP_MARKERS,
	FALLBACK_SANKEY_DATA,
	FALLBACK_TESTIMONIALS
} from '$lib/constants';
import type { DataSourceResult } from './dataSource';
import { loadCardsWithSource } from './cards';
import { loadTestimonialsWithSource } from './testimonials';
import { loadLinkPreviewsWithSource } from './linkPreviews';
import { loadExpandingCardsWithSource } from './expandingCards';
import { loadEditorDataWithSource } from './editorData';
import { loadFilesWithSource, loadFoldersWithSource } from './folderFiles';
import { loadMapMarkersWithSource } from './maps';
import { loadSankeyDataWithSource } from './sankeyData';
import { loadCalendarDataWithSource } from './calendarData';
import { loadEmployeesWithSource } from './dataGrid';
import { loadGanttFromDatabase } from './ganttData';

const REAL_URL = 'postgresql://user:secret@ep-real.neon.tech/db?sslmode=require';
const PLACEHOLDER_URL = 'postgresql://username:password@host.neon.tech/dbname?sslmode=require';

interface LoaderCase {
	name: string;
	load: () => Promise<DataSourceResult<unknown>>;
	fallback: unknown;
	emptyDatabaseResult: unknown;
}

const cases: LoaderCase[] = [
	{ name: 'cards', load: loadCardsWithSource, fallback: FALLBACK_CARDS, emptyDatabaseResult: [] },
	{
		name: 'testimonials',
		load: () => loadTestimonialsWithSource(),
		fallback: FALLBACK_TESTIMONIALS,
		emptyDatabaseResult: []
	},
	{
		name: 'link previews',
		load: () => loadLinkPreviewsWithSource(),
		fallback: FALLBACK_LINK_PREVIEWS,
		emptyDatabaseResult: []
	},
	{
		name: 'expanding cards',
		load: () => loadExpandingCardsWithSource(),
		fallback: FALLBACK_EXPANDING_CARDS,
		emptyDatabaseResult: []
	},
	{
		name: 'editor data',
		load: () => loadEditorDataWithSource(),
		fallback: FALLBACK_EDITOR_DATA,
		emptyDatabaseResult: []
	},
	{
		name: 'folders',
		load: () => loadFoldersWithSource(),
		fallback: FALLBACK_FOLDERS,
		emptyDatabaseResult: []
	},
	{
		name: 'files',
		load: () => loadFilesWithSource(),
		fallback: FALLBACK_FILES,
		emptyDatabaseResult: []
	},
	{
		name: 'map markers',
		load: () => loadMapMarkersWithSource(),
		fallback: FALLBACK_MAP_MARKERS,
		emptyDatabaseResult: []
	},
	{
		name: 'sankey',
		load: () => loadSankeyDataWithSource(),
		fallback: FALLBACK_SANKEY_DATA,
		emptyDatabaseResult: { nodes: [], links: [] }
	},
	{
		name: 'calendar',
		load: () => loadCalendarDataWithSource(),
		fallback: FALLBACK_CALENDAR_DATA,
		emptyDatabaseResult: []
	},
	{
		name: 'employees',
		load: loadEmployeesWithSource,
		fallback: FALLBACK_EMPLOYEES,
		emptyDatabaseResult: []
	},
	{ name: 'gantt', load: loadGanttFromDatabase, fallback: FALLBACK_GANTT, emptyDatabaseResult: [] }
];

describe('server read loaders', () => {
	beforeEach(() => {
		neonMock.mockClear();
		sqlMock.mockReset();
		vi.spyOn(console, 'warn').mockImplementation(() => {});
		vi.spyOn(console, 'error').mockImplementation(() => {});
		vi.spyOn(console, 'log').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.unstubAllEnvs();
		vi.restoreAllMocks();
	});

	describe.each(cases)('$name', ({ load, fallback, emptyDatabaseResult }) => {
		it('serves the fixture as `fallback` when DATABASE_URL is unset', async () => {
			vi.stubEnv('DATABASE_URL', '');

			const result = await load();

			expect(neonMock).not.toHaveBeenCalled();
			expect(result.data).toEqual(fallback);
			expect(result).toMatchObject({
				source: 'fallback',
				usingDatabase: false,
				databaseConfigured: false
			});
		});

		it('treats the .env.example placeholder URL as unset', async () => {
			vi.stubEnv('DATABASE_URL', PLACEHOLDER_URL);

			const result = await load();

			expect(neonMock).not.toHaveBeenCalled();
			expect(result.source).toBe('fallback');
			expect(result.usingDatabase).toBe(false);
		});

		it('serves the fixture as `error` when the query fails', async () => {
			vi.stubEnv('DATABASE_URL', REAL_URL);
			sqlMock.mockRejectedValue(new Error('connection refused'));

			const result = await load();

			expect(neonMock).toHaveBeenCalledWith(REAL_URL);
			expect(result.data).toEqual(fallback);
			expect(result).toMatchObject({
				source: 'error',
				usingDatabase: false,
				databaseConfigured: true,
				message: 'connection refused'
			});
		});

		it('reports `database` when the query succeeds', async () => {
			vi.stubEnv('DATABASE_URL', REAL_URL);
			sqlMock.mockResolvedValue([]);

			const result = await load();

			expect(result.data).toEqual(emptyDatabaseResult);
			expect(result).toMatchObject({ source: 'database', usingDatabase: true });
		});
	});

	describe('category-filtered fallbacks', () => {
		// Regression: the error path used to return the whole fixture, ignoring
		// the category that the unconfigured path respected.
		it.each([
			['testimonials', () => loadTestimonialsWithSource('no-such-category')],
			['link previews', () => loadLinkPreviewsWithSource('no-such-category')],
			['expanding cards', () => loadExpandingCardsWithSource('no-such-category')],
			['editor data', () => loadEditorDataWithSource('no-such-category')],
			['folders', () => loadFoldersWithSource('no-such-category')],
			['map markers', () => loadMapMarkersWithSource('no-such-category')]
		])('%s filters the fixture on the error path too', async (_name, load) => {
			vi.stubEnv('DATABASE_URL', REAL_URL);
			sqlMock.mockRejectedValue(new Error('boom'));

			const result = await load();

			expect(result.source).toBe('error');
			expect(result.data).toEqual([]);
		});

		it('filters files by folder on the error path', async () => {
			vi.stubEnv('DATABASE_URL', REAL_URL);
			sqlMock.mockRejectedValue(new Error('boom'));
			const folderId = FALLBACK_FILES[0].folderId;

			const result = await loadFilesWithSource(folderId);

			expect(result.data.length).toBeGreaterThan(0);
			expect(result.data.every((f) => f.folderId === folderId)).toBe(true);
		});
	});

	it('maps a missing table to a schema hint instead of an error badge', async () => {
		vi.stubEnv('DATABASE_URL', REAL_URL);
		sqlMock.mockRejectedValue(new Error('relation "employees" does not exist'));

		const result = await loadEmployeesWithSource();

		expect(result.source).toBe('fallback');
		expect(result.databaseConfigured).toBe(true);
		expect(result.message).toContain('schema_datagrid.sql');
	});
});
