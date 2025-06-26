import type { PageServerLoad, Actions } from './$types';
import { requireRole } from '$lib/server/auth';
import { prisma } from '$lib/db';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const user = requireRole(locals.user, ['ADMIN']);

	// Get all courses with related data
	const courses = await prisma.course.findMany({
		include: {
			department: true,
			courseAssignments: {
				include: {
					user: {
						select: {
							id: true,
							name: true,
							email: true
						}
					}
				}
			},
			caScores: {
				where: {
					isSubmitted: true
				},
				include: {
					student: {
						include: {
							department: true
						}
					}
				}
			},
			_count: {
				select: {
					caScores: true
				}
			}
		},
		orderBy: [
			{ department: { name: 'asc' } },
			{ level: 'asc' },
			{ code: 'asc' }
		]
	});

	// Get departments for the create course form
	const departments = await prisma.department.findMany({
		orderBy: { name: 'asc' }
	});

	// Get lecturers for course assignment
	const lecturers = await prisma.user.findMany({
		where: { role: 'LECTURER' },
		include: { department: true },
		orderBy: { name: 'asc' }
	});

	// Calculate statistics
	const totalCourses = courses.length;
	const coursesWithSubmissions = courses.filter(course => 
		course.caScores.some(score => score.isSubmitted)
	).length;
	const totalSubmissions = courses.reduce((sum, course) => 
		sum + course.caScores.filter(score => score.isSubmitted).length, 0
	);

	return {
		courses,
		departments,
		lecturers,
		stats: {
			totalCourses,
			coursesWithSubmissions,
			pendingCourses: totalCourses - coursesWithSubmissions,
			totalSubmissions
		}
	};
};

export const actions: Actions = {
	createCourse: async ({ request, locals }) => {
		const user = requireRole(locals.user, ['ADMIN']);
		const data = await request.formData();

		const code = data.get('code') as string;
		const title = data.get('title') as string;
		const level = parseInt(data.get('level') as string);
		const semester = parseInt(data.get('semester') as string);
		const session = data.get('session') as string;
		const departmentId = parseInt(data.get('departmentId') as string);
		const lecturerId = data.get('lecturerId') as string;

		if (!code || !title || !level || !semester || !session || !departmentId) {
			return fail(400, { error: 'All fields are required' });
		}

		try {
			// Check if course code already exists for this session
			const existingCourse = await prisma.course.findUnique({
				where: {
					code_session: {
						code,
						session
					}
				}
			});

			if (existingCourse) {
				return fail(400, { error: 'Course code already exists for this session' });
			}

			// Create the course
			const course = await prisma.course.create({
				data: {
					code,
					title,
					level,
					semester,
					session,
					departmentId
				}
			});

			// Assign lecturer if provided
			if (lecturerId && lecturerId !== '') {
				await prisma.courseAssignment.create({
					data: {
						userId: parseInt(lecturerId),
						courseId: course.id
					}
				});
			}

			return { success: true };
		} catch (error) {
			console.error('Error creating course:', error);
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
			// Check if course has any scores
			const scoresCount = await prisma.cAScore.count({
				where: { courseId }
			});

			if (scoresCount > 0) {
				return fail(400, { error: 'Cannot delete course with existing scores' });
			}

			// Delete course assignments first
			await prisma.courseAssignment.deleteMany({
				where: { courseId }
			});

			// Delete the course
			await prisma.course.delete({
				where: { id: courseId }
			});

			return { success: true };
		} catch (error) {
			console.error('Error deleting course:', error);
			return fail(500, { error: 'Failed to delete course' });
		}
	},

	assignLecturer: async ({ request, locals }) => {
		const user = requireRole(locals.user, ['ADMIN']);
		const data = await request.formData();
		const courseId = parseInt(data.get('courseId') as string);
		const lecturerId = parseInt(data.get('lecturerId') as string);

		if (!courseId || !lecturerId) {
			return fail(400, { error: 'Course ID and Lecturer ID are required' });
		}

		try {
			// Remove existing assignment
			await prisma.courseAssignment.deleteMany({
				where: { courseId }
			});

			// Create new assignment
			await prisma.courseAssignment.create({
				data: {
					userId: lecturerId,
					courseId
				}
			});

			return { success: true };
		} catch (error) {
			console.error('Error assigning lecturer:', error);
			return fail(500, { error: 'Failed to assign lecturer' });
		}
	}
};
