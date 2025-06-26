import type { PageServerLoad } from './$types';
import { requireRole } from '$lib/server/auth';
import { prisma } from '$lib/db';

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = requireRole(locals.user, ['HOD']);

	// Get filter parameters
	const searchParams = url.searchParams;
	const levelFilter = searchParams.get('level');
	const semesterFilter = searchParams.get('semester');
	const statusFilter = searchParams.get('status');
	const lecturerFilter = searchParams.get('lecturer');

	// Build where clause for filters
	const whereClause: any = {
		departmentId: user.departmentId
	};

	if (levelFilter) {
		whereClause.level = parseInt(levelFilter);
	}

	if (semesterFilter) {
		whereClause.semester = parseInt(semesterFilter);
	}

	// Get all courses in the department
	const courses = await prisma.course.findMany({
		where: whereClause,
		include: {
			department: true,
			courseAssignments: {
				include: {
					user: true
				}
			},
			caScores: {
				include: {
					student: true,
					submittedByUser: true
				}
			}
		},
		orderBy: [
			{ level: 'asc' },
			{ semester: 'asc' },
			{ code: 'asc' }
		]
	});

	// Process courses with submission status
	const processedCourses = courses.map((course: any) => {
		const lecturer = course.courseAssignments[0]?.user;
		const hasSubmittedScores = course.caScores.some((score: any) => score.isSubmitted);
		const totalStudents = course.caScores.length;
		const submittedStudents = course.caScores.filter((score: any) => score.score !== null).length;

		const status = hasSubmittedScores ? 'submitted' : 
			submittedStudents > 0 ? 'draft' : 'pending';

		return {
			...course,
			lecturer,
			status,
			totalStudents,
			submittedStudents,
			hasSubmittedScores
		};
	});

	// Apply additional filters
	let filteredCourses = processedCourses;

	if (statusFilter) {
		filteredCourses = filteredCourses.filter((course: any) => course.status === statusFilter);
	}

	if (lecturerFilter) {
		filteredCourses = filteredCourses.filter((course: any) => 
			course.lecturer?.id.toString() === lecturerFilter
		);
	}

	// Get unique lecturers for filter dropdown
	const lecturers = await prisma.user.findMany({
		where: {
			role: 'LECTURER',
			departmentId: user.departmentId
		},
		orderBy: { name: 'asc' }
	});

	// Get department info
	const department = await prisma.department.findUnique({
		where: { id: user.departmentId! }
	});

	return {
		courses: filteredCourses,
		lecturers,
		department,
		filters: {
			level: levelFilter,
			semester: semesterFilter,
			status: statusFilter,
			lecturer: lecturerFilter
		}
	};
};
