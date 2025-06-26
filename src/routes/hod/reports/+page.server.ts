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
		throw new Error('HOD department not found');
	}

	// Get detailed course reports for the department
	const courseReports = await prisma.course.findMany({
		where: {
			departmentId: hodUser.departmentId
		},
		include: {
			department: true,
			courseAssignments: {
				include: {
					user: true
				}
			},
			caScores: {
				include: {
					student: {
						include: {
							department: true
						}
					},
					submittedByUser: true
				}
			}
		},
		orderBy: [
			{ level: 'asc' },
			{ code: 'asc' }
		]
	});

	// Generate summary statistics
	const totalStudents = new Set();
	const submittedCourses = courseReports.filter(course => 
		course.caScores.some(score => score.isSubmitted)
	);

	courseReports.forEach(course => {
		course.caScores.forEach(score => {
			totalStudents.add(score.studentId);
		});
	});

	const departmentStats = {
		totalCourses: courseReports.length,
		submittedCourses: submittedCourses.length,
		pendingCourses: courseReports.length - submittedCourses.length,
		totalStudentsWithScores: totalStudents.size
	};

	// Get cross-departmental students (students from other departments taking courses in this department)
	const crossDepartmentalStudents = await prisma.student.findMany({
		where: {
			departmentId: {
				not: hodUser.departmentId
			},
			caScores: {
				some: {
					course: {
						departmentId: hodUser.departmentId
					}
				}
			}
		},
		include: {
			department: true,
			caScores: {
				where: {
					course: {
						departmentId: hodUser.departmentId
					}
				},
				include: {
					course: true
				}
			}
		}
	});

	return {
		department: hodUser.department,
		courseReports,
		departmentStats,
		crossDepartmentalStudents
	};
};
