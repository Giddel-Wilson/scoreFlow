import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { requireRole } from '$lib/server/auth';
import { prisma } from '$lib/db';

export const load: PageServerLoad = async ({ locals, params }) => {
	const user = requireRole(locals.user, ['HOD']);
	const courseId = parseInt(params.courseId);

	if (isNaN(courseId)) {
		throw error(400, 'Invalid course ID');
	}

	// Get course details
	const course = await prisma.course.findFirst({
		where: {
			id: courseId,
			departmentId: user.departmentId // Ensure HOD can only view their department's courses
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
					student: true
				},
				orderBy: {
					student: {
						regNo: 'asc'
					}
				}
			}
		}
	});

	if (!course) {
		throw error(404, 'Course not found or access denied');
	}

	// Calculate statistics
	const totalStudents = course.caScores.length;
	const studentsWithScores = course.caScores.filter((score: any) => score.score !== null).length;
	const submittedScores = course.caScores.filter((score: any) => score.isSubmitted).length;
	const hasSubmittedScores = submittedScores > 0;

	// Calculate score statistics if there are submitted scores
	let scoreStats = null;
	if (hasSubmittedScores) {
		const validScores = course.caScores
			.filter((score: any) => score.score !== null && score.isSubmitted)
			.map((score: any) => score.score);

		if (validScores.length > 0) {
			const total = validScores.reduce((sum: number, score: number) => sum + score, 0);
			const average = total / validScores.length;
			const highest = Math.max(...validScores);
			const lowest = Math.min(...validScores);

			// Grade distribution (assuming A: 25-30, B: 20-24, C: 15-19, D: 10-14, F: 0-9)
			const gradeDistribution = {
				A: validScores.filter((score: number) => score >= 25).length,
				B: validScores.filter((score: number) => score >= 20 && score < 25).length,
				C: validScores.filter((score: number) => score >= 15 && score < 20).length,
				D: validScores.filter((score: number) => score >= 10 && score < 15).length,
				F: validScores.filter((score: number) => score < 10).length
			};

			scoreStats = {
				average: Math.round(average * 100) / 100,
				highest,
				lowest,
				gradeDistribution
			};
		}
	}

	return {
		course,
		lecturer: course.courseAssignments[0]?.user,
		totalStudents,
		studentsWithScores,
		hasSubmittedScores,
		scoreStats
	};
};
