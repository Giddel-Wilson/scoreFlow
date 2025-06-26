import type { PageServerLoad } from './$types';
import { requireRole } from '$lib/server/auth';
import { prisma } from '$lib/db';

export const load: PageServerLoad = async ({ locals }) => {
	const user = requireRole(locals.user, ['ADMIN']);

	// Get quick stats for dashboard
	const [
		totalUsers,
		totalStudents,
		totalCourses,
		totalDepartments,
		recentSubmissions,
		pendingCourses,
		recentUsers
	] = await Promise.all([
		prisma.user.count(),
		prisma.student.count(),
		prisma.course.count(),
		prisma.department.count(),
		
		// Recent submissions (last 7 days)
		prisma.cAScore.findMany({
			where: {
				isSubmitted: true,
				updatedAt: {
					gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
				}
			},
			include: {
				course: true,
				student: true,
				submittedByUser: true
			},
			orderBy: { updatedAt: 'desc' },
			take: 10
		}),

		// Courses without submissions
		prisma.course.findMany({
			where: {
				caScores: {
					none: {
						isSubmitted: true
					}
				}
			},
			include: {
				department: true,
				courseAssignments: {
					include: { user: true }
				}
			},
			take: 10
		}),

		// Recently created users (last 30 days)
		prisma.user.findMany({
			where: {
				createdAt: {
					gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
				}
			},
			include: { department: true },
			orderBy: { createdAt: 'desc' },
			take: 5
		})
	]);

	const stats = {
		totalUsers,
		totalStudents,
		totalCourses,
		totalDepartments,
		recentSubmissionsCount: recentSubmissions.length,
		pendingCoursesCount: pendingCourses.length
	};

	return {
		stats,
		recentSubmissions,
		pendingCourses,
		recentUsers
	};
};
