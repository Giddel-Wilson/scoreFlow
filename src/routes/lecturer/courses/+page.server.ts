import type { PageServerLoad } from './$types';
import { requireRole } from '$lib/server/auth';
import { prisma } from '$lib/db';

export const load: PageServerLoad = async ({ locals }) => {
	const user = requireRole(locals.user, ['LECTURER']);

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
		},
		orderBy: [
			{ level: 'asc' },
			{ semester: 'asc' },
			{ code: 'asc' }
		]
	});

	// Add submission status to each course
	const coursesWithStatus = courses.map((course: any) => {
		const hasSubmittedScores = course.caScores.some((score: any) => score.isSubmitted);
		const totalStudents = course.caScores.length;
		const submittedStudents = course.caScores.filter((score: any) => score.score !== null).length;

		return {
			...course,
			hasSubmittedScores,
			totalStudents,
			submittedStudents,
			submissionStatus: hasSubmittedScores ? 'submitted' : 
				submittedStudents > 0 ? 'draft' : 'pending'
		};
	});

	return {
		courses: coursesWithStatus
	};
};
