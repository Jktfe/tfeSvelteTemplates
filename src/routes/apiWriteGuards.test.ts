/**
 * Write endpoints must go through requireAuthAPI: 401 when signed out, 403 for
 * the read-only public demo account. These tests exercise the real handlers
 * with a mocked Neon driver so no database is needed.
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

import * as editorApi from './editor/api/+server';
import * as datagridApi from './datagrid/api/+server';
import * as cardsApi from './api/cards/+server';

const REAL_URL = 'postgresql://user:secret@ep-real.neon.tech/db?sslmode=require';

type Handler = (event: never) => Promise<Response>;
type UserShape = { id: string; email: string } | null;

function makeEvent(method: string, path: string, user: UserShape, body?: unknown) {
	const url = new URL(`http://localhost${path}`);
	return {
		url,
		request: new Request(url, {
			method,
			headers: { 'Content-Type': 'application/json' },
			body: body === undefined ? undefined : JSON.stringify(body)
		}),
		locals: { user, session: user ? { id: 'session-1' } : null }
	} as never;
}

/** Runs a handler and normalises SvelteKit's thrown HttpError into a status. */
async function statusOf(handler: Handler, event: never): Promise<number> {
	try {
		return (await handler(event)).status;
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) {
			return (err as { status: number }).status;
		}
		throw err;
	}
}

const signedIn = { id: 'user-1', email: 'someone@example.com' };
const demoUser = { id: 'demo-1', email: 'tester@test.com' };

const writes: Array<[string, Handler, string, string, unknown]> = [
	['POST /editor/api', editorApi.POST as Handler, 'POST', '/editor/api', { heading: 'x' }],
	['PUT /editor/api', editorApi.PUT as Handler, 'PUT', '/editor/api', { id: 1 }],
	['DELETE /editor/api', editorApi.DELETE as Handler, 'DELETE', '/editor/api?id=1', undefined],
	['POST /datagrid/api', datagridApi.POST as Handler, 'POST', '/datagrid/api', {}],
	['PUT /datagrid/api', datagridApi.PUT as Handler, 'PUT', '/datagrid/api', { id: 1 }],
	['DELETE /datagrid/api', datagridApi.DELETE as Handler, 'DELETE', '/datagrid/api?id=1', undefined]
];

describe('API write guards', () => {
	beforeEach(() => {
		neonMock.mockClear();
		sqlMock.mockReset();
		publicEnv.PUBLIC_DEMO_AUTH = 'true';
		publicEnv.PUBLIC_DEMO_USER_EMAIL = 'tester@test.com';
		vi.stubEnv('DATABASE_URL', REAL_URL);
		vi.spyOn(console, 'warn').mockImplementation(() => {});
		vi.spyOn(console, 'error').mockImplementation(() => {});
		vi.spyOn(console, 'log').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.unstubAllEnvs();
		vi.restoreAllMocks();
	});

	describe.each(writes)('%s', (_name, handler, method, path, body) => {
		it('answers 401 when signed out, without touching the database', async () => {
			expect(await statusOf(handler, makeEvent(method, path, null, body))).toBe(401);
			expect(neonMock).not.toHaveBeenCalled();
		});

		it('answers 403 for the public demo account', async () => {
			expect(await statusOf(handler, makeEvent(method, path, demoUser, body))).toBe(403);
			expect(neonMock).not.toHaveBeenCalled();
		});
	});

	it('lets a signed-in user through to validation', async () => {
		// Missing required fields → 400 proves we got past the auth gate.
		const status = await statusOf(
			editorApi.POST as Handler,
			makeEvent('POST', '/editor/api', signedIn, { heading: 'only a heading' })
		);
		expect(status).toBe(400);
	});

	it('editor writes answer 503 when the database is not configured', async () => {
		vi.stubEnv('DATABASE_URL', '');
		const status = await statusOf(
			editorApi.DELETE as Handler,
			makeEvent('DELETE', '/editor/api?id=1', signedIn)
		);
		expect(status).toBe(503);
	});

	it('datagrid writes answer 503 (not 404) when the database is not configured', async () => {
		vi.stubEnv('DATABASE_URL', '');
		const status = await statusOf(
			datagridApi.DELETE as Handler,
			makeEvent('DELETE', '/datagrid/api?id=1', signedIn)
		);
		expect(status).toBe(503);
	});

	it('datagrid DELETE succeeds for a signed-in user when a row is returned', async () => {
		sqlMock.mockResolvedValueOnce([{ id: 1 }]);
		const response = await (datagridApi.DELETE as Handler)(
			makeEvent('DELETE', '/datagrid/api?id=1', signedIn)
		);
		expect(response.status).toBe(200);
		expect(await response.json()).toMatchObject({ success: true });
	});

	it('reads stay public', async () => {
		sqlMock.mockResolvedValue([]);
		const status = await statusOf(
			datagridApi.GET as Handler,
			makeEvent('GET', '/datagrid/api', null)
		);
		expect(status).toBe(200);
	});
});

describe('GET /api/cards', () => {
	beforeEach(() => {
		neonMock.mockClear();
		sqlMock.mockReset();
		vi.spyOn(console, 'warn').mockImplementation(() => {});
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.unstubAllEnvs();
		vi.restoreAllMocks();
	});

	it('answers 503 when the database is not configured', async () => {
		vi.stubEnv('DATABASE_URL', '');
		expect(await statusOf(cardsApi.GET as Handler, makeEvent('GET', '/api/cards', null))).toBe(503);
	});

	it('answers 500 when the query fails', async () => {
		vi.stubEnv('DATABASE_URL', REAL_URL);
		sqlMock.mockRejectedValue(new Error('boom'));
		expect(await statusOf(cardsApi.GET as Handler, makeEvent('GET', '/api/cards', null))).toBe(500);
	});

	it('returns mapped cards from the database', async () => {
		vi.stubEnv('DATABASE_URL', REAL_URL);
		sqlMock.mockResolvedValue([
			{ id: 1, title: 'T', description: 'D', image_url: 'https://example.com/a.jpg' }
		]);
		const response = await (cardsApi.GET as Handler)(makeEvent('GET', '/api/cards', null));
		expect(await response.json()).toEqual({
			cards: [{ title: 'T', content: 'D', image: 'https://example.com/a.jpg' }]
		});
	});
});
