import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { requireRole } from '$lib/server/auth';
import { prisma } from '$lib/db';
import { hashPassword } from '$lib/auth';

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = requireRole(locals.user, ['ADMIN']);

	const searchParams = url.searchParams;
	const roleFilter = searchParams.get('role');
	const departmentFilter = searchParams.get('department');

	// Build where clause
	const whereClause: any = {};
	if (roleFilter) {
		whereClause.role = roleFilter;
	}
	if (departmentFilter) {
		whereClause.departmentId = parseInt(departmentFilter);
	}

	const [users, departments] = await Promise.all([
		prisma.user.findMany({
			where: whereClause,
			include: {
				department: true
			},
			orderBy: [
				{ role: 'asc' },
				{ name: 'asc' }
			]
		}),
		prisma.department.findMany({
			orderBy: { name: 'asc' }
		})
	]);

	return {
		users,
		departments,
		filters: {
			role: roleFilter,
			department: departmentFilter
		}
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const user = requireRole(locals.user, ['ADMIN']);
		const data = await request.formData();

		const name = data.get('name')?.toString();
		const email = data.get('email')?.toString();
		const password = data.get('password')?.toString();
		const role = data.get('role')?.toString();
		const departmentId = data.get('departmentId')?.toString();

		if (!name || !email || !password || !role) {
			return fail(400, {
				error: 'All fields are required',
				name, email, role, departmentId
			});
		}

		try {
			// Check if email already exists
			const existingUser = await prisma.user.findUnique({
				where: { email }
			});

			if (existingUser) {
				return fail(400, {
					error: 'Email already exists',
					name, email, role, departmentId
				});
			}

			// Hash password
			const passwordHash = await hashPassword(password);

			// Create user
			await prisma.user.create({
				data: {
					name,
					email,
					passwordHash,
					role: role as any,
					departmentId: departmentId ? parseInt(departmentId) : null
				}
			});

			// Log the action
			await prisma.auditLog.create({
				data: {
					userId: user.userId,
					action: 'CREATE_USER',
					target: `User ${email}`,
					details: { email, role, departmentId }
				}
			});

			return {
				success: true,
				message: 'User created successfully'
			};

		} catch (error) {
			console.error('Error creating user:', error);
			return fail(500, {
				error: 'Failed to create user',
				name, email, role, departmentId
			});
		}
	},

	delete: async ({ request, locals }) => {
		const user = requireRole(locals.user, ['ADMIN']);
		const data = await request.formData();
		const userId = data.get('userId')?.toString();

		if (!userId) {
			return fail(400, { error: 'User ID is required' });
		}

		try {
			const userToDelete = await prisma.user.findUnique({
				where: { id: parseInt(userId) }
			});

			if (!userToDelete) {
				return fail(404, { error: 'User not found' });
			}

			// Don't allow deleting self
			if (userToDelete.id === user.userId) {
				return fail(400, { error: 'Cannot delete your own account' });
			}

			await prisma.user.delete({
				where: { id: parseInt(userId) }
			});

			// Log the action
			await prisma.auditLog.create({
				data: {
					userId: user.userId,
					action: 'DELETE_USER',
					target: `User ${userToDelete.email}`,
					details: { deletedUserId: userId }
				}
			});

			return {
				success: true,
				message: 'User deleted successfully'
			};

		} catch (error) {
			console.error('Error deleting user:', error);
			return fail(500, { error: 'Failed to delete user' });
		}
	}
};
