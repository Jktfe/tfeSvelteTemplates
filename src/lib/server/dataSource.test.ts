import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
	getConfiguredDatabaseUrl,
	isDatabaseConfigured,
	isPlaceholderDatabaseUrl,
	loadWithFallback,
	requireDatabaseUrl
} from './dataSource';

const REAL_URL = 'postgresql://user:secret@ep-real.neon.tech/db?sslmode=require';
const PLACEHOLDER_URL = 'postgresql://username:password@host.neon.tech/dbname?sslmode=require';

describe('dataSource helpers', () => {
	beforeEach(() => {
		vi.spyOn(console, 'warn').mockImplementation(() => {});
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.unstubAllEnvs();
		vi.restoreAllMocks();
	});

	describe('configuration detection', () => {
		it('treats missing, empty and placeholder URLs as unconfigured', () => {
			expect(isPlaceholderDatabaseUrl(undefined)).toBe(true);
			expect(isPlaceholderDatabaseUrl('')).toBe(true);
			expect(isPlaceholderDatabaseUrl(PLACEHOLDER_URL)).toBe(true);
			expect(isPlaceholderDatabaseUrl(REAL_URL)).toBe(false);
		});

		it('only returns a real URL', () => {
			vi.stubEnv('DATABASE_URL', PLACEHOLDER_URL);
			expect(getConfiguredDatabaseUrl()).toBeUndefined();
			expect(isDatabaseConfigured()).toBe(false);

			vi.stubEnv('DATABASE_URL', REAL_URL);
			expect(getConfiguredDatabaseUrl()).toBe(REAL_URL);
			expect(isDatabaseConfigured()).toBe(true);
		});
	});

	describe('loadWithFallback', () => {
		const fallback = ['fixture'];

		it('returns the fallback without running the query when unconfigured', async () => {
			vi.stubEnv('DATABASE_URL', '');
			const query = vi.fn();

			const result = await loadWithFallback(fallback, query, { label: 'Test' });

			expect(query).not.toHaveBeenCalled();
			expect(result).toMatchObject({
				data: fallback,
				source: 'fallback',
				usingDatabase: false,
				databaseConfigured: false
			});
		});

		it('treats the .env.example placeholder as unconfigured', async () => {
			vi.stubEnv('DATABASE_URL', PLACEHOLDER_URL);
			const query = vi.fn();

			const result = await loadWithFallback(fallback, query, { label: 'Test' });

			expect(query).not.toHaveBeenCalled();
			expect(result.source).toBe('fallback');
		});

		it('passes the real URL to the query and reports database', async () => {
			vi.stubEnv('DATABASE_URL', REAL_URL);
			const query = vi.fn().mockResolvedValue(['row']);

			const result = await loadWithFallback(fallback, query, { label: 'Test' });

			expect(query).toHaveBeenCalledWith(REAL_URL);
			expect(result).toMatchObject({ data: ['row'], source: 'database', usingDatabase: true });
		});

		it('reports a failing query as error and serves the fallback', async () => {
			vi.stubEnv('DATABASE_URL', REAL_URL);
			const query = vi.fn().mockRejectedValue(new Error('connection refused'));

			const result = await loadWithFallback(fallback, query, { label: 'Test' });

			expect(result).toMatchObject({
				data: fallback,
				source: 'error',
				usingDatabase: false,
				databaseConfigured: true,
				message: 'connection refused'
			});
		});

		it('turns a missing table into a friendly fallback when a schema file is known', async () => {
			vi.stubEnv('DATABASE_URL', REAL_URL);
			const query = vi.fn().mockRejectedValue(new Error('relation "things" does not exist'));

			const result = await loadWithFallback(fallback, query, {
				label: 'Test',
				schemaFile: 'schema_things.sql'
			});

			expect(result.source).toBe('fallback');
			expect(result.databaseConfigured).toBe(true);
			expect(result.message).toContain('database/schema_things.sql');
		});

		it('keeps a missing table as an error when no schema file is given', async () => {
			vi.stubEnv('DATABASE_URL', REAL_URL);
			const query = vi.fn().mockRejectedValue(new Error('relation "things" does not exist'));

			const result = await loadWithFallback(fallback, query, { label: 'Test' });

			expect(result.source).toBe('error');
		});
	});

	describe('requireDatabaseUrl', () => {
		it('throws a DATABASE_URL error naming the action when unconfigured', () => {
			vi.stubEnv('DATABASE_URL', PLACEHOLDER_URL);
			expect(() => requireDatabaseUrl('create')).toThrow(
				'Cannot create: DATABASE_URL not configured'
			);
		});

		it('returns the real URL when configured', () => {
			vi.stubEnv('DATABASE_URL', REAL_URL);
			expect(requireDatabaseUrl('update')).toBe(REAL_URL);
		});
	});
});
