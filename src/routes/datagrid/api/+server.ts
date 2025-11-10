/**
 * DataGrid API Endpoints
 *
 * RESTful API for employee CRUD operations
 *
 * Endpoints:
 * - GET    /datagrid/api           - List all employees (with optional filtering)
 * - POST   /datagrid/api           - Create new employee
 * - PUT    /datagrid/api           - Update employee (requires id in body)
 * - DELETE /datagrid/api?id=123    - Delete single employee
 * - DELETE /datagrid/api?ids=1,2,3 - Bulk delete employees
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { Employee } from '$lib/types';
import {
	loadEmployeesFromDatabase,
	loadEmployeesByDepartment,
	loadEmployeesByStatus,
	createEmployee,
	updateEmployee,
	deleteEmployee,
	deleteEmployees
} from '$lib/server/dataGrid';
import { VALIDATION_FIELDS } from '$lib/constants';

/**
 * Validate dropdown field values against allowed options
 * Ensures data integrity by preventing invalid values
 *
 * @param data - Employee data to validate
 * @returns Error message if validation fails, null if valid
 */
function validateDropdownFields(data: Partial<Employee>): string | null {
	// Iterate through all validated fields
	for (const [field, allowedValues] of Object.entries(VALIDATION_FIELDS)) {
		const value = data[field as keyof typeof data];

		if (typeof value === 'string' && !allowedValues.includes(value)) {
			return `Invalid ${field}: ${value}. Must be one of: ${allowedValues.join(', ')}`;
		}
	}

	return null;
}

/**
 * GET /datagrid/api
 * Retrieve employees with optional filtering
 *
 * Query params:
 * - department: Filter by department
 * - status: Filter by status
 */
export const GET: RequestHandler = async ({ url }) => {
	try {
		const department = url.searchParams.get('department');
		const status = url.searchParams.get('status');

		let employees;

		if (department) {
			employees = await loadEmployeesByDepartment(department);
		} else if (status) {
			employees = await loadEmployeesByStatus(status);
		} else {
			employees = await loadEmployeesFromDatabase();
		}

		return json({
			success: true,
			data: employees,
			count: employees.length
		});
	} catch (error) {
		console.error('[API] Error loading employees:', error);
		return json(
			{
				success: false,
				error: 'Failed to load employees'
			},
			{ status: 500 }
		);
	}
};

/**
 * POST /datagrid/api
 * Create a new employee
 *
 * Body: Employee data (without id)
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();

		// Validate required fields
		const requiredFields = ['firstName', 'lastName', 'email', 'department', 'position', 'salary', 'hireDate', 'status'];
		const missingFields = requiredFields.filter(field => !data[field]);

		if (missingFields.length > 0) {
			return json(
				{
					success: false,
					error: `Missing required fields: ${missingFields.join(', ')}`
				},
				{ status: 400 }
			);
		}

		// Validate dropdown field values
		const validationError = validateDropdownFields(data);
		if (validationError) {
			return json(
				{
					success: false,
					error: validationError
				},
				{ status: 400 }
			);
		}

		const employee = await createEmployee(data);

		if (!employee) {
			return json(
				{
					success: false,
					error: 'Failed to create employee. Database may not be configured.'
				},
				{ status: 500 }
			);
		}

		return json({
			success: true,
			data: employee
		}, { status: 201 });
	} catch (error) {
		console.error('[API] Error creating employee:', error);
		return json(
			{
				success: false,
				error: 'Failed to create employee'
			},
			{ status: 500 }
		);
	}
};

/**
 * PUT /datagrid/api
 * Update an existing employee
 *
 * Body: Partial employee data with id
 */
export const PUT: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();

		if (!data.id) {
			return json(
				{
					success: false,
					error: 'Employee ID is required'
				},
				{ status: 400 }
			);
		}

		// Validate dropdown field values
		const validationError = validateDropdownFields(data);
		if (validationError) {
			return json(
				{
					success: false,
					error: validationError
				},
				{ status: 400 }
			);
		}

		const { id, ...updateData } = data;
		const employee = await updateEmployee(id, updateData);

		if (!employee) {
			return json(
				{
					success: false,
					error: 'Employee not found or update failed'
				},
				{ status: 404 }
			);
		}

		return json({
			success: true,
			data: employee
		});
	} catch (error) {
		console.error('[API] Error updating employee:', error);
		return json(
			{
				success: false,
				error: 'Failed to update employee'
			},
			{ status: 500 }
		);
	}
};

/**
 * DELETE /datagrid/api
 * Delete employee(s)
 *
 * Query params:
 * - id: Single employee ID to delete
 * - ids: Comma-separated employee IDs for bulk delete
 */
export const DELETE: RequestHandler = async ({ url }) => {
	try {
		const id = url.searchParams.get('id');
		const idsParam = url.searchParams.get('ids');

		// Bulk delete
		if (idsParam) {
			const ids = idsParam.split(',').map(Number).filter(n => !isNaN(n));

			if (ids.length === 0) {
				return json(
					{
						success: false,
						error: 'Invalid employee IDs'
					},
					{ status: 400 }
				);
			}

			const deletedCount = await deleteEmployees(ids);

			return json({
				success: true,
				deletedCount,
				message: `Deleted ${deletedCount} employee(s)`
			});
		}

		// Single delete
		if (id) {
			const employeeId = Number(id);

			if (isNaN(employeeId)) {
				return json(
					{
						success: false,
						error: 'Invalid employee ID'
					},
					{ status: 400 }
				);
			}

			const success = await deleteEmployee(employeeId);

			if (!success) {
				return json(
					{
						success: false,
						error: 'Employee not found or delete failed'
					},
					{ status: 404 }
				);
			}

			return json({
				success: true,
				message: 'Employee deleted successfully'
			});
		}

		// No ID provided
		return json(
			{
				success: false,
				error: 'Employee ID(s) required'
			},
			{ status: 400 }
		);
	} catch (error) {
		console.error('[API] Error deleting employee:', error);
		return json(
			{
				success: false,
				error: 'Failed to delete employee'
			},
			{ status: 500 }
		);
	}
};
