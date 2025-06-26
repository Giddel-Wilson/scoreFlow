import type { PageServerLoad } from './$types';
import { requireRole } from '$lib/server/auth';
import { prisma } from '$lib/db';

export const load: PageServerLoad = async ({ locals }) => {
	const user = requireRole(locals.user, ['ADMIN']);

	// Get comprehensive system statistics
	const [
		totalUsers,
		totalStudents,
		totalCourses,
		totalDepartments,
		totalSubmissions,
		recentSubmissions,
		departmentStats,
		courseStats,
		userStats
	] = await Promise.all([
		// Basic counts
		prisma.user.count(),
		prisma.student.count(),
		prisma.course.count(),
		prisma.department.count(),
		prisma.cAScore.count({ where: { isSubmitted: true } }),

		// Recent submissions (last 30 days)
		prisma.cAScore.findMany({
			where: {
				isSubmitted: true,
				updatedAt: {
					gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
				}
			},
			include: {
				course: {
					include: {
						department: true
					}
				},
				student: {
					include: {
						department: true
					}
				},
				submittedByUser: true
			},
			orderBy: {
				updatedAt: 'desc'
			},
			take: 20
		}),

		// Department statistics
		prisma.department.findMany({
			include: {
				courses: {
					include: {
						caScores: {
							where: { isSubmitted: true }
						},
						_count: {
							select: {
								caScores: true
							}
						}
					}
				},
				students: true,
				users: {
					where: {
						role: {
							in: ['LECTURER', 'HOD']
						}
					}
				}
			}
		}),

		// Course statistics by level and department
		prisma.course.groupBy({
			by: ['level', 'departmentId'],
			_count: {
				id: true
			},
			orderBy: [
				{ departmentId: 'asc' },
				{ level: 'asc' }
			]
		}),

		// User statistics by role
		prisma.user.groupBy({
			by: ['role'],
			_count: {
				id: true
			}
		})
	]);

	// Calculate department statistics
	const processedDepartmentStats = departmentStats.map(dept => {
		const totalCourses = dept.courses.length;
		const coursesWithSubmissions = dept.courses.filter(course => 
			course.caScores.length > 0
		).length;
		const totalSubmissionsInDept = dept.courses.reduce((sum, course) => 
			sum + course.caScores.length, 0
		);
		const totalStudentsInCourses = dept.courses.reduce((sum, course) => 
			sum + course._count.caScores, 0
		);

		return {
			id: dept.id,
			name: dept.name,
			totalCourses,
			coursesWithSubmissions,
			pendingCourses: totalCourses - coursesWithSubmissions,
			totalSubmissions: totalSubmissionsInDept,
			totalStudents: dept.students.length,
			totalStudentsInCourses,
			lecturers: dept.users.filter(u => u.role === 'LECTURER').length,
			hods: dept.users.filter(u => u.role === 'HOD').length
		};
	});

	// System overview stats
	const systemStats = {
		totalUsers,
		totalStudents,
		totalCourses,
		totalDepartments,
		totalSubmissions,
		pendingSubmissions: await prisma.cAScore.count({ 
			where: { isSubmitted: false } 
		}),
		averageSubmissionsPerCourse: totalCourses > 0 ? Math.round(totalSubmissions / totalCourses * 100) / 100 : 0
	};

	// Performance metrics
	const performanceMetrics = {
		submissionRate: totalCourses > 0 ? 
			Math.round((processedDepartmentStats.reduce((sum, dept) => 
				sum + dept.coursesWithSubmissions, 0) / totalCourses) * 100 * 100) / 100 : 0,
		activeUsers: await prisma.user.count({
			where: {
				courseAssignments: {
					some: {}
				}
			}
		})
	};

	return {
		systemStats,
		departmentStats: processedDepartmentStats,
		courseStats,
		userStats,
		recentSubmissions,
		performanceMetrics
	};
};
