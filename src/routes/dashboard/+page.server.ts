import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { requireAuth } from '$lib/server/auth';
import { prisma } from '$lib/db';

type LecturerStats = {
	totalCourses: number;
	submittedCourses: number;
	pendingCourses: number;
	totalStudents: number;
};

type HODStats = {
	totalCourses: number;
	coursesWithSubmissions: number;
	pendingCourses: number;
	totalLecturers: number;
};

type AdminStats = {
	totalUsers: number;
	totalCourses: number;
	totalDepartments: number;
	totalStudents: number;
};

type DashboardStats = LecturerStats | HODStats | AdminStats;

export const load: PageServerLoad = async ({ locals }) => {
	const user = requireAuth(locals.user);

	try {
		// Get user with department info
		const userWithDept = await prisma.user.findUnique({
			where: { id: user.userId },
			include: { department: true }
		});

		if (!userWithDept) {
			throw redirect(302, '/login');
		}

		let stats: DashboardStats;

		if (user.role === 'LECTURER') {
			// Get lecturer's courses and submission stats
			const courses = await prisma.course.findMany({
				where: {
					courseAssignments: {
						some: { userId: user.userId }
					}
				},
				include: {
					department: true,
					caScores: {
						where: { submittedBy: user.userId },
						include: { student: true }
					}
				}
			});

			const totalCourses = courses.length;
			const submittedCourses = courses.filter((course: any) => 
				course.caScores.some((score: any) => score.isSubmitted)
			).length;
			const totalStudents = courses.reduce((acc: number, course: any) => 
				acc + course.caScores.length, 0
			);

			stats = {
				totalCourses,
				submittedCourses,
				pendingCourses: totalCourses - submittedCourses,
				totalStudents
			};

		} else if (user.role === 'HOD') {
			// Get department stats
			const departmentCourses = await prisma.course.findMany({
				where: { departmentId: user.departmentId! },
				include: {
					courseAssignments: {
						include: { user: true }
					},
					caScores: true
				}
			});

			const totalCourses = departmentCourses.length;
			const coursesWithSubmissions = departmentCourses.filter((course: any) =>
				course.caScores.some((score: any) => score.isSubmitted)
			).length;
			const totalLecturers = new Set(
				departmentCourses.flatMap((course: any) => 
					course.courseAssignments.map((ca: any) => ca.userId)
				)
			).size;

			stats = {
				totalCourses,
				coursesWithSubmissions,
				pendingCourses: totalCourses - coursesWithSubmissions,
				totalLecturers
			};

		} else {
			// Get system-wide stats (ADMIN role)
			const [totalUsers, totalCourses, totalDepartments, totalStudents] = await Promise.all([
				prisma.user.count(),
				prisma.course.count(),
				prisma.department.count(),
				prisma.student.count()
			]);

			stats = {
				totalUsers,
				totalCourses,
				totalDepartments,
				totalStudents
			};
		}

		return {
			user: userWithDept,
			stats
		};

	} catch (error) {
		console.error('Dashboard load error:', error);
		throw redirect(302, '/login');
	}
};
