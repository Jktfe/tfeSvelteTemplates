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

/**
 * Load employee data from database with fallback to constants
 *
 * @returns Promise<Employee[]> - Array of employee records
 *
 * Behavior:
 * - If DATABASE_URL is not set, returns FALLBACK_EMPLOYEES
 * - If database query succeeds, returns transformed database rows
 * - If database query fails, logs error and returns FALLBACK_EMPLOYEES
 * - Only returns active employees (is_active = TRUE)
 * - Sorts by last_name, then first_name
 */
export async function loadEmployeesFromDatabase(): Promise<Employee[]> {
	try {
		const databaseUrl = process.env.DATABASE_URL;

		if (!databaseUrl) {
			console.warn('[DataGrid] DATABASE_URL not configured, using fallback employee data');
			return FALLBACK_EMPLOYEES;
		}

		const sql = neon(databaseUrl);

		// Query active employees, sorted by name
		// Note: Neon returns Record<string, any>[], so we type assert to EmployeeRow[]
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

		console.log(`[DataGrid] Loaded ${rows.length} employees from database`);

		// Transform database rows (snake_case) to component props (camelCase)
		return rows.map((row) => ({
			id: row.id,
			firstName: row.first_name,
			lastName: row.last_name,
			email: row.email,
			department: row.department,
			position: row.position,
			salary: Number(row.salary), // Convert DECIMAL to number
			hireDate: row.hire_date.toISOString().split('T')[0], // Format as YYYY-MM-DD
			status: row.status,
			location: row.location || undefined,
			phone: row.phone || undefined,
			notes: row.notes || undefined
		}));
	} catch (error) {
		console.error('[DataGrid] Error loading employees from database:', error);
		console.warn('[DataGrid] Falling back to constant employee data');
		return FALLBACK_EMPLOYEES;
	}
}

/**
 * Load employees filtered by department
 *
 * @param department - Department name to filter by (e.g., 'Engineering', 'Sales')
 * @returns Promise<Employee[]> - Array of employee records in the specified department
 */
export async function loadEmployeesByDepartment(department: string): Promise<Employee[]> {
	const allEmployees = await loadEmployeesFromDatabase();
	return allEmployees.filter((emp) => emp.department === department);
}

/**
 * Load employees filtered by status
 *
 * @param status - Employment status to filter by (e.g., 'active', 'on-leave')
 * @returns Promise<Employee[]> - Array of employee records with the specified status
 */
export async function loadEmployeesByStatus(status: string): Promise<Employee[]> {
	const allEmployees = await loadEmployeesFromDatabase();
	return allEmployees.filter((emp) => emp.status === status);
}

/**
 * Get unique list of departments from employee data
 *
 * @returns Promise<string[]> - Sorted array of unique department names
 */
export async function getDepartments(): Promise<string[]> {
	const employees = await loadEmployeesFromDatabase();
	const departments = new Set(employees.map((emp) => emp.department));
	return Array.from(departments).sort();
}

/**
 * Get statistics about employees
 *
 * @returns Promise<object> - Statistics including total count, average salary, departments
 */
export async function getEmployeeStatistics(): Promise<{
	totalEmployees: number;
	averageSalary: number;
	departmentCount: number;
	departmentBreakdown: Record<string, number>;
}> {
	const employees = await loadEmployeesFromDatabase();

	const departmentBreakdown: Record<string, number> = {};
	let totalSalary = 0;

	for (const emp of employees) {
		// Count by department
		departmentBreakdown[emp.department] = (departmentBreakdown[emp.department] || 0) + 1;
		// Sum salaries
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
 * Update an employee record
 *
 * @param id - Employee ID to update
 * @param data - Partial employee data to update
 * @returns Promise<Employee | null> - Updated employee or null if not found/failed
 *
 * Behavior:
 * - If DATABASE_URL is not set, returns null (read-only mode)
 * - Uses SQL COALESCE to only update provided fields
 * - Updates updated_at timestamp automatically via trigger
 * - Returns updated employee data
 */
export async function updateEmployee(
	id: number,
	data: Partial<Omit<Employee, 'id'>>
): Promise<Employee | null> {
	try {
		const databaseUrl = process.env.DATABASE_URL;

		if (!databaseUrl) {
			console.warn('[DataGrid] DATABASE_URL not configured, cannot update employee');
			return null;
		}

		const sql = neon(databaseUrl);

		// Build update query with COALESCE for partial updates
		const result = (await sql`
			UPDATE employees
			SET
				first_name = COALESCE(${data.firstName}, first_name),
				last_name = COALESCE(${data.lastName}, last_name),
				email = COALESCE(${data.email}, email),
				department = COALESCE(${data.department}, department),
				position = COALESCE(${data.position}, position),
				salary = COALESCE(${data.salary}, salary),
				hire_date = COALESCE(${data.hireDate ? new Date(data.hireDate) : null}, hire_date),
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

		const row = result[0];
		console.log(`[DataGrid] Updated employee ${id}`);

		// Transform to Employee format
		return {
			id: row.id,
			firstName: row.first_name,
			lastName: row.last_name,
			email: row.email,
			department: row.department,
			position: row.position,
			salary: Number(row.salary), // Convert DECIMAL to number
			hireDate: row.hire_date.toISOString().split('T')[0],
			status: row.status,
			location: row.location || undefined,
			phone: row.phone || undefined,
			notes: row.notes || undefined
		};
	} catch (error) {
		console.error('[DataGrid] Error updating employee:', error);
		return null;
	}
}

/**
 * Delete an employee (soft delete by setting is_active = FALSE)
 *
 * @param id - Employee ID to delete
 * @returns Promise<boolean> - True if deleted successfully, false otherwise
 *
 * Behavior:
 * - If DATABASE_URL is not set, returns false (read-only mode)
 * - Performs soft delete (sets is_active = FALSE)
 * - Maintains audit trail by keeping record in database
 */
export async function deleteEmployee(id: number): Promise<boolean> {
	try {
		const databaseUrl = process.env.DATABASE_URL;

		if (!databaseUrl) {
			console.warn('[DataGrid] DATABASE_URL not configured, cannot delete employee');
			return false;
		}

		const sql = neon(databaseUrl);

		const result = await sql`
			UPDATE employees
			SET is_active = FALSE
			WHERE id = ${id} AND is_active = TRUE
		`;

		// Type assertion: Neon result has count property for UPDATE queries
		const success = (result as any).count > 0;
		if (success) {
			console.log(`[DataGrid] Deleted employee ${id}`);
		} else {
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
 * @param ids - Array of employee IDs to delete
 * @returns Promise<number> - Number of employees deleted
 */
export async function deleteEmployees(ids: number[]): Promise<number> {
	try {
		const databaseUrl = process.env.DATABASE_URL;

		if (!databaseUrl) {
			console.warn('[DataGrid] DATABASE_URL not configured, cannot delete employees');
			return 0;
		}

		const sql = neon(databaseUrl);

		const result = await sql`
			UPDATE employees
			SET is_active = FALSE
			WHERE id = ANY(${ids}) AND is_active = TRUE
		`;

		// Type assertion: Neon result has count property for UPDATE queries
		const count = (result as any).count;
		console.log(`[DataGrid] Bulk deleted ${count} employees`);
		return count;
	} catch (error) {
		console.error('[DataGrid] Error bulk deleting employees:', error);
		return 0;
	}
}

/**
 * Create a new employee
 *
 * @param data - Employee data (without ID)
 * @returns Promise<Employee | null> - Created employee with ID or null if failed
 */
export async function createEmployee(
	data: Omit<Employee, 'id'>
): Promise<Employee | null> {
	try {
		const databaseUrl = process.env.DATABASE_URL;

		if (!databaseUrl) {
			console.warn('[DataGrid] DATABASE_URL not configured, cannot create employee');
			return null;
		}

		const sql = neon(databaseUrl);

		const result = (await sql`
			INSERT INTO employees (
				first_name, last_name, email, department, position,
				salary, hire_date, status, location, phone, notes
			) VALUES (
				${data.firstName}, ${data.lastName}, ${data.email},
				${data.department}, ${data.position}, ${data.salary},
				${new Date(data.hireDate)}, ${data.status},
				${data.location || null}, ${data.phone || null}, ${data.notes || null}
			)
			RETURNING *
		`) as unknown as EmployeeRow[];

		const row = result[0];
		console.log(`[DataGrid] Created employee ${row.id}`);

		return {
			id: row.id,
			firstName: row.first_name,
			lastName: row.last_name,
			email: row.email,
			department: row.department,
			position: row.position,
			salary: Number(row.salary), // Convert DECIMAL to number
			hireDate: row.hire_date.toISOString().split('T')[0],
			status: row.status,
			location: row.location || undefined,
			phone: row.phone || undefined,
			notes: row.notes || undefined
		};
	} catch (error) {
		console.error('[DataGrid] Error creating employee:', error);
		return null;
	}
}
