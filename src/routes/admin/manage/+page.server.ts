import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { requireRole } from '$lib/server/auth';
import { prisma } from '$lib/db';
import { hashPassword } from '$lib/auth';

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = requireRole(locals.user, ['ADMIN']);

	const tab = url.searchParams.get('tab') || 'users';
	const searchParams = url.searchParams;

	// Load data based on active tab
	let data: any = { activeTab: tab };

	if (tab === 'users') {
		const roleFilter = searchParams.get('role');
		const departmentFilter = searchParams.get('department');

		const whereClause: any = {};
		if (roleFilter) whereClause.role = roleFilter;
		if (departmentFilter) whereClause.departmentId = parseInt(departmentFilter);

		const [users, departments] = await Promise.all([
			prisma.user.findMany({
				where: whereClause,
				include: { department: true },
				orderBy: [{ role: 'asc' }, { name: 'asc' }]
			}),
			prisma.department.findMany({ orderBy: { name: 'asc' } })
		]);

		data.users = users;
		data.departments = departments;
		data.filters = { role: roleFilter, department: departmentFilter };
	}

	if (tab === 'courses') {
		const levelFilter = searchParams.get('level');
		const semesterFilter = searchParams.get('semester');
		const departmentFilter = searchParams.get('department');

		const whereClause: any = {};
		if (levelFilter) whereClause.level = parseInt(levelFilter);
		if (semesterFilter) whereClause.semester = parseInt(semesterFilter);
		if (departmentFilter) whereClause.departmentId = parseInt(departmentFilter);

		const [courses, departments] = await Promise.all([
			prisma.course.findMany({
				where: whereClause,
				include: {
					department: true,
					courseAssignments: {
						include: {
							user: { select: { name: true } }
						}
					}
				},
				orderBy: [{ level: 'asc' }, { semester: 'asc' }, { code: 'asc' }]
			}),
			prisma.department.findMany({ orderBy: { name: 'asc' } })
		]);

		data.courses = courses;
		data.departments = departments;
		data.filters = { level: levelFilter, semester: semesterFilter, department: departmentFilter };
	}

	if (tab === 'audit') {
		const userFilter = searchParams.get('user');
		const actionFilter = searchParams.get('action');
		const startDate = searchParams.get('startDate');
		const endDate = searchParams.get('endDate');

		const whereClause: any = {};
		if (userFilter) whereClause.userId = parseInt(userFilter);
		if (actionFilter) whereClause.action = actionFilter;
		if (startDate) {
			whereClause.timestamp = { 
				gte: new Date(startDate),
				...(endDate ? { lte: new Date(endDate) } : {})
			};
		} else if (endDate) {
			whereClause.timestamp = { lte: new Date(endDate) };
		}

		const [auditLogs, users] = await Promise.all([
			prisma.auditLog.findMany({
				where: whereClause,
				include: {
					user: { select: { name: true, role: true } }
				},
				orderBy: { timestamp: 'desc' },
				take: 100 // Limit to recent 100 entries
			}),
			prisma.user.findMany({
				select: { id: true, name: true, role: true },
				orderBy: { name: 'asc' }
			})
		]);

		data.auditLogs = auditLogs;
		data.users = users;
		data.filters = { user: userFilter, action: actionFilter, startDate, endDate };
	}

	if (tab === 'reports') {
		// Department statistics
		const departments = await prisma.department.findMany({
			include: {
				courses: {
					include: {
						courseAssignments: {
							include: {
								user: { select: { name: true, role: true } }
							}
						},
						caScores: {
							where: { isSubmitted: true }
						}
					}
				},
				users: {
					where: { role: { in: ['LECTURER', 'HOD'] } }
				}
			}
		});

		// System statistics
		const stats = await Promise.all([
			prisma.user.count(),
			prisma.course.count(),
			prisma.student.count(),
			prisma.cAScore.count({ where: { isSubmitted: true } }),
			prisma.auditLog.count(),
		]);

		data.departments = departments;
		data.systemStats = {
			totalUsers: stats[0],
			totalCourses: stats[1],
			totalStudents: stats[2],
			submittedScores: stats[3],
			auditEntries: stats[4]
		};
	}

	return data;
};

export const actions: Actions = {
	createUser: async ({ request, locals }) => {
		const user = requireRole(locals.user, ['ADMIN']);
		const data = await request.formData();

		const name = data.get('name') as string;
		const email = data.get('email') as string;
		const password = data.get('password') as string;
		const role = data.get('role') as string;
		const departmentId = data.get('departmentId') as string;

		if (!name || !email || !password || !role) {
			return fail(400, { error: 'All fields are required' });
		}

		if (!['ADMIN', 'HOD', 'LECTURER'].includes(role)) {
			return fail(400, { error: 'Invalid role' });
		}

		try {
			const hashedPassword = await hashPassword(password);
			
			await prisma.user.create({
				data: {
					name,
					email,
					passwordHash: hashedPassword,
					role: role as 'ADMIN' | 'HOD' | 'LECTURER',
					departmentId: departmentId ? parseInt(departmentId) : null
				}
			});

			// Log the action
			await prisma.auditLog.create({
				data: {
					userId: user.userId,
					action: 'CREATE_USER',
					target: 'USER',
					details: `Created user: ${name} (${email}) with role ${role}`
				}
			});

			return { success: 'User created successfully' };
		} catch (error: any) {
			if (error.code === 'P2002') {
				return fail(400, { error: 'Email already exists' });
			}
			return fail(500, { error: 'Failed to create user' });
		}
	},

	deleteUser: async ({ request, locals }) => {
		const user = requireRole(locals.user, ['ADMIN']);
		const data = await request.formData();
		const userId = parseInt(data.get('userId') as string);

		if (!userId) {
			return fail(400, { error: 'User ID is required' });
		}

		try {
			const targetUser = await prisma.user.findUnique({
				where: { id: userId },
				select: { name: true, email: true, role: true }
			});

			if (!targetUser) {
				return fail(404, { error: 'User not found' });
			}

			// Don't allow deletion of the last admin
			if (targetUser.role === 'ADMIN') {
				const adminCount = await prisma.user.count({
					where: { role: 'ADMIN' }
				});
				if (adminCount <= 1) {
					return fail(400, { error: 'Cannot delete the last admin user' });
				}
			}

			await prisma.user.delete({
				where: { id: userId }
			});

			// Log the action
			await prisma.auditLog.create({
				data: {
					userId: user.userId,
					action: 'DELETE_USER',
					target: 'USER',
					details: `Deleted user: ${targetUser.name} (${targetUser.email})`
				}
			});

			return { success: 'User deleted successfully' };
		} catch (error) {
			return fail(500, { error: 'Failed to delete user' });
		}
	},

	createCourse: async ({ request, locals }) => {
		const user = requireRole(locals.user, ['ADMIN']);
		const data = await request.formData();

		const code = data.get('code') as string;
		const title = data.get('title') as string;
		const level = parseInt(data.get('level') as string);
		const semester = parseInt(data.get('semester') as string);
		const session = data.get('session') as string;
		const departmentId = parseInt(data.get('departmentId') as string);

		if (!code || !title || !level || !semester || !session || !departmentId) {
			return fail(400, { error: 'All fields are required' });
		}

		try {
			await prisma.course.create({
				data: {
					code,
					title,
					level,
					semester,
					session,
					departmentId
				}
			});

			// Log the action
			await prisma.auditLog.create({
				data: {
					userId: user.userId,
					action: 'CREATE_COURSE',
					target: 'COURSE',
					details: `Created course: ${code} - ${title}`
				}
			});

			return { success: 'Course created successfully' };
		} catch (error: any) {
			if (error.code === 'P2002') {
				return fail(400, { error: 'Course code already exists' });
			}
			return fail(500, { error: 'Failed to create course' });
		}
	},

	deleteCourse: async ({ request, locals }) => {
		const user = requireRole(locals.user, ['ADMIN']);
		const data = await request.formData();
		const courseId = parseInt(data.get('courseId') as string);

		if (!courseId) {
			return fail(400, { error: 'Course ID is required' });
		}

		try {
			const course = await prisma.course.findUnique({
				where: { id: courseId },
				select: { code: true, title: true }
			});

			if (!course) {
				return fail(404, { error: 'Course not found' });
			}

			await prisma.course.delete({
				where: { id: courseId }
			});

			// Log the action
			await prisma.auditLog.create({
				data: {
					userId: user.userId,
					action: 'DELETE_COURSE',
					target: 'COURSE',
					details: `Deleted course: ${course.code} - ${course.title}`
				}
			});

			return { success: 'Course deleted successfully' };
		} catch (error) {
			return fail(500, { error: 'Failed to delete course' });
		}
	}
};
