/**
 * Write paths across the server utilities: they must refuse politely when no
 * database is configured (including the placeholder URL), and soft deletes
 * must report success from the rows Postgres hands back — the Neon HTTP
 * driver returns rows, never an affected-row count.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { neonMock, sqlMock } = vi.hoisted(() => {
	const sqlMock = vi.fn();
	const neonMock = vi.fn(() => sqlMock);
	return { neonMock, sqlMock };
});

vi.mock('@neondatabase/serverless', () => ({ neon: neonMock }));

import {
	computeEmployeeStatistics,
	createEmployee,
	deleteEmployee,
	deleteEmployees,
	updateEmployee
} from './dataGrid';
import { createEditorData, deleteEditorData, updateEditorData } from './editorData';
import {
	createFile,
	createFolder,
	deleteFile,
	deleteFolder,
	updateFile,
	updateFolder
} from './folderFiles';
import { createMapMarker, deleteMapMarker, getMarkerCategories } from './maps';
import { getCalendarCategories, getCalendarStats } from './calendarData';
import { getSankeyCategories } from './sankeyData';
import type { Employee } from '$lib/types';

const REAL_URL = 'postgresql://user:secret@ep-real.neon.tech/db?sslmode=require';
const PLACEHOLDER_URL = 'postgresql://username:password@host.neon.tech/dbname?sslmode=require';

/** Joins the template strings of the nth sql`` call so we can assert on the SQL text. */
const sqlText = (call = 0): string => (sqlMock.mock.calls[call][0] as string[]).join('?');

const employee: Omit<Employee, 'id'> = {
	firstName: 'Ada',
	lastName: 'Lovelace',
	email: 'ada@example.com',
	department: 'Engineering',
	position: 'Engineer',
	salary: 100000,
	hireDate: new Date('2020-01-01'),
	status: 'active'
};

describe('server write paths', () => {
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

	describe('when the database is not configured', () => {
		beforeEach(() => {
			// The placeholder used to slip through `!!process.env.DATABASE_URL`.
			vi.stubEnv('DATABASE_URL', PLACEHOLDER_URL);
		});

		it('DataGrid writes return their "nothing happened" values without calling Neon', async () => {
			expect(await createEmployee(employee)).toBeNull();
			expect(await updateEmployee(1, { firstName: 'X' })).toBeNull();
			expect(await deleteEmployee(1)).toBe(false);
			expect(await deleteEmployees([1, 2])).toBe(0);
			expect(neonMock).not.toHaveBeenCalled();
		});

		it('Editor writes throw a DATABASE_URL error the API maps to 503', async () => {
			await expect(createEditorData({} as never)).rejects.toThrow('DATABASE_URL');
			await expect(updateEditorData(1, {})).rejects.toThrow('DATABASE_URL');
			await expect(deleteEditorData(1)).rejects.toThrow('DATABASE_URL');
			expect(neonMock).not.toHaveBeenCalled();
		});

		it('FolderFiles writes throw a DATABASE_URL error', async () => {
			await expect(createFolder({} as never)).rejects.toThrow('DATABASE_URL');
			await expect(createFile({} as never)).rejects.toThrow('DATABASE_URL');
			await expect(updateFolder(1, {})).rejects.toThrow('DATABASE_URL');
			await expect(updateFile(1, {})).rejects.toThrow('DATABASE_URL');
			await expect(deleteFolder(1)).rejects.toThrow('DATABASE_URL');
			await expect(deleteFile(1)).rejects.toThrow('DATABASE_URL');
			expect(neonMock).not.toHaveBeenCalled();
		});

		it('Maps writes return null/false without calling Neon', async () => {
			expect(
				await createMapMarker({ position: { lat: 0, lng: 0 }, title: 'X' } as never)
			).toBeNull();
			expect(await deleteMapMarker(1)).toBe(false);
			expect(neonMock).not.toHaveBeenCalled();
		});

		it('secondary readers fall back without calling Neon', async () => {
			expect((await getMarkerCategories()).length).toBeGreaterThan(0);
			expect(await getCalendarCategories()).toEqual(['general']);
			expect(await getCalendarStats()).toBeNull();
			expect(await getSankeyCategories()).toEqual(['energy']);
			expect(neonMock).not.toHaveBeenCalled();
		});
	});

	describe('soft deletes with a configured database', () => {
		beforeEach(() => {
			vi.stubEnv('DATABASE_URL', REAL_URL);
		});

		// Regression: `(result as any).count` is undefined on Neon's row array,
		// so every DataGrid delete used to report "not found".
		it('deleteEmployee is true when a row comes back, false when none does', async () => {
			sqlMock.mockResolvedValueOnce([{ id: 7 }]);
			expect(await deleteEmployee(7)).toBe(true);
			expect(sqlText()).toMatch(/RETURNING id/);

			sqlMock.mockResolvedValueOnce([]);
			expect(await deleteEmployee(8)).toBe(false);
		});

		it('deleteEmployees returns the number of rows actually deleted', async () => {
			sqlMock.mockResolvedValueOnce([{ id: 1 }, { id: 2 }]);
			expect(await deleteEmployees([1, 2, 3])).toBe(2);
			expect(sqlText()).toMatch(/RETURNING id/);
		});

		// Regression: UPDATE without RETURNING yields [], so these always said false.
		it('deleteEditorData reports success from RETURNING rows', async () => {
			sqlMock.mockResolvedValueOnce([{ id: 3 }]);
			expect(await deleteEditorData(3)).toBe(true);
			expect(sqlText()).toMatch(/RETURNING id/);

			sqlMock.mockResolvedValueOnce([]);
			expect(await deleteEditorData(4)).toBe(false);
		});

		it('deleteFolder and deleteFile report success from RETURNING rows', async () => {
			// deleteFolder first soft-deletes the folder's files, then the folder.
			sqlMock.mockResolvedValueOnce([]).mockResolvedValueOnce([{ id: 1 }]);
			expect(await deleteFolder(1)).toBe(true);
			expect(sqlText(1)).toMatch(/RETURNING id/);

			sqlMock.mockResolvedValueOnce([{ id: 5 }]);
			expect(await deleteFile(5)).toBe(true);

			sqlMock.mockResolvedValueOnce([]);
			expect(await deleteFile(6)).toBe(false);
		});

		// Regression: deleteMapMarker used to return true even when nothing matched.
		it('deleteMapMarker is false when no marker matched', async () => {
			sqlMock.mockResolvedValueOnce([]);
			expect(await deleteMapMarker(99)).toBe(false);

			sqlMock.mockResolvedValueOnce([{ id: 1 }]);
			expect(await deleteMapMarker(1)).toBe(true);
		});

		it('write failures resolve to null/false rather than throwing', async () => {
			sqlMock.mockRejectedValue(new Error('boom'));
			expect(await createEmployee(employee)).toBeNull();
			expect(await deleteEmployee(1)).toBe(false);
			expect(await deleteEditorData(1)).toBe(false);
			expect(await deleteMapMarker(1)).toBe(false);
		});
	});

	describe('computeEmployeeStatistics', () => {
		it('summarises counts, average salary and departments', () => {
			const stats = computeEmployeeStatistics([
				{ ...employee, id: 1, salary: 100 },
				{ ...employee, id: 2, salary: 201, department: 'Sales' }
			]);

			expect(stats).toEqual({
				totalEmployees: 2,
				averageSalary: 151,
				departmentCount: 2,
				departmentBreakdown: { Engineering: 1, Sales: 1 }
			});
		});

		it('handles an empty list without dividing by zero', () => {
			expect(computeEmployeeStatistics([]).averageSalary).toBe(0);
		});
	});
});
