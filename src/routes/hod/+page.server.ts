import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { requireRole } from '$lib/server/auth';
import { prisma } from '$lib/db';

export const load: PageServerLoad = async ({ locals }) => {
	const user = requireRole(locals.user, ['HOD']);

	// Get HOD's department
	const hodUser = await prisma.user.findUnique({
		where: { id: user.userId },
		include: { department: true }
	});

	if (!hodUser || !hodUser.department || !hodUser.departmentId) {
		throw redirect(302, '/login');
	}

	// Get courses in HOD's department
	const courses = await prisma.course.findMany({
		where: {
			departmentId: hodUser.departmentId
		},
		include: {
			courseAssignments: {
				include: {
					user: true
				}
			},
			caScores: {
				where: {
					isSubmitted: true
				}
			}
		},
		orderBy: [
			{ level: 'asc' },
			{ code: 'asc' }
		]
	});

	// Get submission statistics
	const totalCourses = courses.length;
	const coursesWithSubmissions = courses.filter(course => course.caScores.length > 0).length;
	const pendingCourses = totalCourses - coursesWithSubmissions;

	// Get recent submissions (last 7 days)
	const weekAgo = new Date();
	weekAgo.setDate(weekAgo.getDate() - 7);

	const recentSubmissions = await prisma.cAScore.findMany({
		where: {
			isSubmitted: true,
			updatedAt: {
				gte: weekAgo
			},
			course: {
				departmentId: hodUser.departmentId
			}
		},
		include: {
			course: true,
			submittedByUser: true
		},
		orderBy: {
			updatedAt: 'desc'
		},
		take: 10
	});

	// Get lecturers in the department
	const lecturers = await prisma.user.findMany({
		where: {
			role: 'LECTURER',
			departmentId: hodUser.departmentId
		},
		include: {
			courseAssignments: {
				include: {
					course: true
				}
			}
		}
	});

	return {
		department: hodUser.department,
		courses,
		stats: {
			totalCourses,
			coursesWithSubmissions,
			pendingCourses
		},
		recentSubmissions,
		lecturers
	};
};
