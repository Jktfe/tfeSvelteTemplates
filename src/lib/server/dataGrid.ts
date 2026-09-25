/**
 * Server utilities for DataGrid component data loading
 *
 * Provides database operations with graceful fallback to constants when DATABASE_URL is not configured.
 * This module handles:
 * - Loading employee data from Neon database or fallback constants
 * - Transforming database rows (snake_case) to component props (camelCase)
 * - Error handling and logging
 */

import { neon } from '@neondatabase/serverless';
import type { Employee, EmployeeRow } from '$lib/types';
import { FALLBACK_EMPLOYEES } from '$lib/constants';
import { getConfiguredDatabaseUrl, loadWithFallback, type DataSourceResult } from './dataSource';

/** snake_case row → camelCase Employee, shared by every read and write path. */
function rowToEmployee(row: EmployeeRow): Employee {
	return {
		id: row.id,
		firstName: row.first_name,
		lastName: row.last_name,
		email: row.email,
		department: row.department,
		position: row.position,
		salary: Number(row.salary), // Neon returns DECIMAL as a string
		hireDate: row.hire_date, // Database returns Date object
		status: row.status,
		location: row.location || undefined,
		phone: row.phone || undefined,
		notes: row.notes || undefined
	};
}

/**
 * Load employee data along with where it came from, so the page can show an
 * honest DatabaseStatus badge (a configured-but-failing database is reported
 * as `error`, not as "connected").
 *
 * - Not configured (missing or placeholder URL) → FALLBACK_EMPLOYEES, source `fallback`
 * - Query succeeds → active employees sorted by last, then first name
 * - `employees` table missing → fallback with a hint to run schema_datagrid.sql
 * - Any other failure → FALLBACK_EMPLOYEES, source `error`
 */
export async function loadEmployeesWithSource(): Promise<DataSourceResult<Employee[]>> {
	return loadWithFallback(
		FALLBACK_EMPLOYEES,
		async (databaseUrl) => {
			const sql = neon(databaseUrl);

			const rows = (await sql`
				SELECT
					id,
					first_name,
					last_name,
					email,
					department,
					position,
					salary,
					hire_date,
					status,
					location,
					phone,
					notes,
					is_active,
					created_at,
					updated_at
				FROM employees
				WHERE is_active = TRUE
				ORDER BY last_name ASC, first_name ASC
			`) as unknown as EmployeeRow[];

			return rows.map(rowToEmployee);
		},
		{ label: 'DataGrid', schemaFile: 'schema_datagrid.sql' }
	);
}

/**
 * Load employee data from database with fallback to constants.
 * Convenience wrapper for callers that only need the rows.
 */
export async function loadEmployeesFromDatabase(): Promise<Employee[]> {
	return (await loadEmployeesWithSource()).data;
}

/**
 * Load employees filtered by department
 *
 * @param department - Department name to filter by (e.g., 'Engineering', 'Sales')
 */
export async function loadEmployeesByDepartment(department: string): Promise<Employee[]> {
	const allEmployees = await loadEmployeesFromDatabase();
	return allEmployees.filter((emp) => emp.department === department);
}

/**
 * Load employees filtered by status
 *
 * @param status - Employment status to filter by (e.g., 'active', 'on-leave')
 */
export async function loadEmployeesByStatus(status: string): Promise<Employee[]> {
	const allEmployees = await loadEmployeesFromDatabase();
	return allEmployees.filter((emp) => emp.status === status);
}

/**
 * Get unique list of departments from employee data
 */
export async function getDepartments(): Promise<string[]> {
	const employees = await loadEmployeesFromDatabase();
	const departments = new Set(employees.map((emp) => emp.department));
	return Array.from(departments).sort();
}

export interface EmployeeStatistics {
	totalEmployees: number;
	averageSalary: number;
	departmentCount: number;
	departmentBreakdown: Record<string, number>;
}

/**
 * Summarise an already-loaded employee list. Pure, so a page that has just
 * loaded employees can derive stats without a second round-trip.
 */
export function computeEmployeeStatistics(employees: Employee[]): EmployeeStatistics {
	const departmentBreakdown: Record<string, number> = {};
	let totalSalary = 0;

	for (const emp of employees) {
		departmentBreakdown[emp.department] = (departmentBreakdown[emp.department] || 0) + 1;
		totalSalary += emp.salary;
	}

	return {
		totalEmployees: employees.length,
		averageSalary: employees.length > 0 ? Math.round(totalSalary / employees.length) : 0,
		departmentCount: Object.keys(departmentBreakdown).length,
		departmentBreakdown
	};
}

/**
 * Get statistics about employees (loads them first).
 */
export async function getEmployeeStatistics(): Promise<EmployeeStatistics> {
	return computeEmployeeStatistics(await loadEmployeesFromDatabase());
}

/**
 * Update an employee record
 *
 * @param id - Employee ID to update
 * @param data - Partial employee data to update
 * @returns Updated employee, or null if not configured / not found / failed
 *
 * Uses SQL COALESCE so only provided fields change; updated_at is bumped by a trigger.
 */
export async function updateEmployee(
	id: number,
	data: Partial<Omit<Employee, 'id'>>
): Promise<Employee | null> {
	const databaseUrl = getConfiguredDatabaseUrl();

	if (!databaseUrl) {
		console.warn('[DataGrid] DATABASE_URL not configured, cannot update employee');
		return null;
	}

	try {
		const sql = neon(databaseUrl);

		const result = (await sql`
			UPDATE employees
			SET
				first_name = COALESCE(${data.firstName}, first_name),
				last_name = COALESCE(${data.lastName}, last_name),
				email = COALESCE(${data.email}, email),
				department = COALESCE(${data.department}, department),
				position = COALESCE(${data.position}, position),
				salary = COALESCE(${data.salary}, salary),
				hire_date = COALESCE(${data.hireDate || null}, hire_date),
				status = COALESCE(${data.status}, status),
				location = COALESCE(${data.location}, location),
				phone = COALESCE(${data.phone}, phone),
				notes = COALESCE(${data.notes}, notes)
			WHERE id = ${id} AND is_active = TRUE
			RETURNING *
		`) as unknown as EmployeeRow[];

		if (result.length === 0) {
			console.warn(`[DataGrid] Employee ${id} not found or inactive`);
			return null;
		}

		return rowToEmployee(result[0]);
	} catch (error) {
		console.error('[DataGrid] Error updating employee:', error);
		return null;
	}
}

/**
 * Delete an employee (soft delete by setting is_active = FALSE)
 *
 * @returns True if a row was deleted, false if not configured / not found / failed
 *
 * The Neon HTTP driver returns only rows (no affected-row count), so we ask
 * Postgres to hand back the ids it touched and count those.
 */
export async function deleteEmployee(id: number): Promise<boolean> {
	const databaseUrl = getConfiguredDatabaseUrl();

	if (!databaseUrl) {
		console.warn('[DataGrid] DATABASE_URL not configured, cannot delete employee');
		return false;
	}

	try {
		const sql = neon(databaseUrl);

		const result = (await sql`
			UPDATE employees
			SET is_active = FALSE
			WHERE id = ${id} AND is_active = TRUE
			RETURNING id
		`) as unknown as Array<{ id: number }>;

		const success = result.length > 0;
		if (!success) {
			console.warn(`[DataGrid] Employee ${id} not found or already deleted`);
		}
		return success;
	} catch (error) {
		console.error('[DataGrid] Error deleting employee:', error);
		return false;
	}
}

/**
 * Delete multiple employees (bulk soft delete)
 *
 * @returns Number of employees actually deleted (0 when not configured or on failure)
 */
export async function deleteEmployees(ids: number[]): Promise<number> {
	const databaseUrl = getConfiguredDatabaseUrl();

	if (!databaseUrl) {
		console.warn('[DataGrid] DATABASE_URL not configured, cannot delete employees');
		return 0;
	}

	try {
		const sql = neon(databaseUrl);

		const result = (await sql`
			UPDATE employees
			SET is_active = FALSE
			WHERE id = ANY(${ids}) AND is_active = TRUE
			RETURNING id
		`) as unknown as Array<{ id: number }>;

		return result.length;
	} catch (error) {
		console.error('[DataGrid] Error bulk deleting employees:', error);
		return 0;
	}
}

/**
 * Create a new employee
 *
 * @returns Created employee with ID, or null if not configured / failed
 */
export async function createEmployee(data: Omit<Employee, 'id'>): Promise<Employee | null> {
	const databaseUrl = getConfiguredDatabaseUrl();

	if (!databaseUrl) {
		console.warn('[DataGrid] DATABASE_URL not configured, cannot create employee');
		return null;
	}

	try {
		const sql = neon(databaseUrl);

		const result = (await sql`
			INSERT INTO employees (
				first_name, last_name, email, department, position,
				salary, hire_date, status, location, phone, notes
			) VALUES (
				${data.firstName}, ${data.lastName}, ${data.email},
				${data.department}, ${data.position}, ${data.salary},
				${data.hireDate}, ${data.status},
				${data.location || null}, ${data.phone || null}, ${data.notes || null}
			)
			RETURNING *
		`) as unknown as EmployeeRow[];

		return rowToEmployee(result[0]);
	} catch (error) {
		console.error('[DataGrid] Error creating employee:', error);
		return null;
	}
}
