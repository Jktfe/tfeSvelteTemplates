/**
 * Page loads must take their DatabaseStatus fields from the loader's
 * DataSourceResult. They used to compute `usingDatabase = !!process.env.DATABASE_URL`,
 * which claimed "connected" for the placeholder URL and for failed queries.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { neonMock, sqlMock, publicEnv } = vi.hoisted(() => {
	const sqlMock = vi.fn();
	const neonMock = vi.fn(() => sqlMock);
	const publicEnv: Record<string, string | undefined> = {};
	return { neonMock, sqlMock, publicEnv };
});

vi.mock('@neondatabase/serverless', () => ({ neon: neonMock }));
vi.mock('$env/dynamic/public', () => ({ env: publicEnv }));

import { load as homeLoad } from './+page.server';
import { load as editorLoad } from './editor/+page.server';
import { load as datagridLoad } from './datagrid/+page.server';
import { load as mapsLoad } from './maps/+page.server';
import { load as sankeyLoad } from './sankey/+page.server';
import { load as calendarLoad } from './calendarheatmap/+page.server';
import { load as sunburstLoad } from './sunburst/+page.server';
import { load as marqueeLoad } from './marquee/+page.server';
import { load as linkLoad } from './linkimagehover/+page.server';
import { load as folderLoad } from './folderfiles/+page.server';
import { load as expandingLoad } from './expandingcard/+page.server';
import { FALLBACK_EMPLOYEES } from '$lib/constants';

const REAL_URL = 'postgresql://user:secret@ep-real.neon.tech/db?sslmode=require';
const PLACEHOLDER_URL = 'postgresql://username:password@host.neon.tech/dbname?sslmode=require';

type AnyLoad = (event: never) => unknown;
type StatusShape = { usingDatabase: boolean; dataSource: string; dataSourceMessage?: string };

const makeEvent = (user: { id: string; email: string } | null = null) =>
	({
		url: new URL('http://localhost/'),
		locals: { user, session: null }
	}) as never;

const run = async (load: AnyLoad, user: { id: string; email: string } | null = null) =>
	(await load(makeEvent(user))) as StatusShape & Record<string, unknown>;

const dbPages: Array<[string, AnyLoad]> = [
	['home', homeLoad as AnyLoad],
	['editor', editorLoad as AnyLoad],
	['datagrid', datagridLoad as AnyLoad],
	['maps', mapsLoad as AnyLoad],
	['sankey', sankeyLoad as AnyLoad],
	['calendarheatmap', calendarLoad as AnyLoad],
	['marquee', marqueeLoad as AnyLoad],
	['linkimagehover', linkLoad as AnyLoad],
	['folderfiles', folderLoad as AnyLoad],
	['expandingcard', expandingLoad as AnyLoad]
];

describe('page data sources', () => {
	beforeEach(() => {
		neonMock.mockClear();
		sqlMock.mockReset();
		publicEnv.PUBLIC_DEMO_AUTH = 'true';
		publicEnv.PUBLIC_DEMO_USER_EMAIL = 'tester@test.com';
		vi.spyOn(console, 'warn').mockImplementation(() => {});
		vi.spyOn(console, 'error').mockImplementation(() => {});
		vi.spyOn(console, 'log').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.unstubAllEnvs();
		vi.restoreAllMocks();
	});

	describe.each(dbPages)('%s', (_name, load) => {
		it('reports fallback for the placeholder DATABASE_URL', async () => {
			vi.stubEnv('DATABASE_URL', PLACEHOLDER_URL);
			const data = await run(load);
			expect(data.usingDatabase).toBe(false);
			expect(data.dataSource).toBe('fallback');
		});

		it('reports error (not connected) when the query fails', async () => {
			vi.stubEnv('DATABASE_URL', REAL_URL);
			sqlMock.mockRejectedValue(new Error('connection refused'));
			const data = await run(load);
			expect(data.usingDatabase).toBe(false);
			expect(data.dataSource).toBe('error');
			expect(data.dataSourceMessage).toBe('connection refused');
		});

		it('reports database when the query succeeds', async () => {
			vi.stubEnv('DATABASE_URL', REAL_URL);
			sqlMock.mockResolvedValue([]);
			const data = await run(load);
			expect(data.usingDatabase).toBe(true);
			expect(data.dataSource).toBe('database');
		});
	});

	it('sunburst reports static regardless of DATABASE_URL', async () => {
		vi.stubEnv('DATABASE_URL', REAL_URL);
		const data = await run(sunburstLoad as AnyLoad);
		expect(data.usingDatabase).toBe(false);
		expect(data.dataSource).toBe('static');
		expect(neonMock).not.toHaveBeenCalled();
	});

	it('datagrid derives stats from the loaded rows with a single query', async () => {
		vi.stubEnv('DATABASE_URL', '');
		const data = await run(datagridLoad as AnyLoad);
		expect((data.stats as { totalEmployees: number }).totalEmployees).toBe(
			FALLBACK_EMPLOYEES.length
		);
	});

	describe('editor canPersist', () => {
		const signedIn = { id: 'user-1', email: 'someone@example.com' };
		const demoUser = { id: 'demo-1', email: 'tester@test.com' };

		beforeEach(() => {
			vi.stubEnv('DATABASE_URL', REAL_URL);
			sqlMock.mockResolvedValue([]);
		});

		it('is true only for a signed-in, non-demo user with a live database', async () => {
			expect((await run(editorLoad as AnyLoad, signedIn)).canPersist).toBe(true);
		});

		it('is false when signed out, so the page stays in in-memory mode', async () => {
			expect((await run(editorLoad as AnyLoad, null)).canPersist).toBe(false);
		});

		it('is false for the read-only demo account', async () => {
			expect((await run(editorLoad as AnyLoad, demoUser)).canPersist).toBe(false);
		});

		it('is false when the database query failed', async () => {
			sqlMock.mockRejectedValue(new Error('boom'));
			expect((await run(editorLoad as AnyLoad, signedIn)).canPersist).toBe(false);
		});
	});
});
