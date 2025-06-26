import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireRole } from '$lib/server/auth';
import { prisma } from '$lib/db';

export const GET: RequestHandler = async ({ locals, params, url }) => {
	const user = requireRole(locals.user, ['HOD']);
	const courseId = parseInt(params.courseId);
	const format = url.searchParams.get('format') || 'pdf';

	if (isNaN(courseId)) {
		throw error(400, 'Invalid course ID');
	}

	// Get course details with scores
	const course = await prisma.course.findFirst({
		where: {
			id: courseId,
			departmentId: user.departmentId
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

	const lecturer = course.courseAssignments[0]?.user;

	if (format === 'csv') {
		// Generate CSV
		const csvHeaders = ['Reg Number', 'Student Name', 'Score', 'Grade'];
		const csvRows = course.caScores.map((scoreRecord: any) => {
			const score = scoreRecord.score || '';
			let grade = '';
			if (scoreRecord.score !== null) {
				if (scoreRecord.score >= 25) grade = 'A';
				else if (scoreRecord.score >= 20) grade = 'B';
				else if (scoreRecord.score >= 15) grade = 'C';
				else if (scoreRecord.score >= 10) grade = 'D';
				else grade = 'F';
			}
			
			return [
				scoreRecord.student.regNo,
				scoreRecord.student.name,
				score,
				grade
			];
		});

		const csvContent = [
			csvHeaders.join(','),
			...csvRows.map((row: any) => row.map((cell: any) => `"${cell}"`).join(','))
		].join('\n');

		return new Response(csvContent, {
			headers: {
				'Content-Type': 'text/csv',
				'Content-Disposition': `attachment; filename="${course.code}_CA_Scores.csv"`
			}
		});
	} else {
		// Generate PDF (basic HTML version for now)
		const html = generatePDFHTML(course, lecturer);
		
		return new Response(html, {
			headers: {
				'Content-Type': 'text/html',
				'Content-Disposition': `inline; filename="${course.code}_CA_Report.html"`
			}
		});
	}
};

function generatePDFHTML(course: any, lecturer: any) {
	const currentDate = new Date().toLocaleDateString();
	
	return `
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title>${course.code} - CA Report</title>
	<style>
		body { font-family: Arial, sans-serif; margin: 40px; }
		.header { text-align: center; margin-bottom: 30px; }
		.course-info { margin-bottom: 30px; }
		.course-info table { width: 100%; border-collapse: collapse; }
		.course-info td { padding: 5px; border-bottom: 1px solid #ccc; }
		.scores-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
		.scores-table th, .scores-table td { border: 1px solid #333; padding: 8px; text-align: left; }
		.scores-table th { background-color: #f5f5f5; }
		.signatures { margin-top: 50px; display: flex; justify-content: space-between; }
		.signature-block { text-align: center; width: 200px; }
		.signature-line { border-bottom: 1px solid #333; margin-bottom: 5px; height: 30px; }
		@media print { body { margin: 20px; } }
	</style>
</head>
<body>
	<div class="header">
		<h1>CONTINUOUS ASSESSMENT REPORT</h1>
		<h2>UNIVERSITY ACADEMIC RECORDS</h2>
	</div>

	<div class="course-info">
		<table>
			<tr>
				<td><strong>Department:</strong></td>
				<td>${course.department.name}</td>
				<td><strong>Session:</strong></td>
				<td>${course.session}</td>
			</tr>
			<tr>
				<td><strong>Course Code:</strong></td>
				<td>${course.code}</td>
				<td><strong>Level:</strong></td>
				<td>${course.level}</td>
			</tr>
			<tr>
				<td><strong>Course Title:</strong></td>
				<td>${course.title}</td>
				<td><strong>Semester:</strong></td>
				<td>${course.semester}</td>
			</tr>
			<tr>
				<td><strong>Lecturer:</strong></td>
				<td>${lecturer?.name || 'Not Assigned'}</td>
				<td><strong>Date Generated:</strong></td>
				<td>${currentDate}</td>
			</tr>
		</table>
	</div>

	<table class="scores-table">
		<thead>
			<tr>
				<th>S/N</th>
				<th>Registration Number</th>
				<th>Student Name</th>
				<th>CA Score (30)</th>
				<th>Grade</th>
			</tr>
		</thead>
		<tbody>
			${course.caScores.map((scoreRecord: any, index: number) => {
				const score = scoreRecord.score || '';
				let grade = '';
				if (scoreRecord.score !== null) {
					if (scoreRecord.score >= 25) grade = 'A';
					else if (scoreRecord.score >= 20) grade = 'B';
					else if (scoreRecord.score >= 15) grade = 'C';
					else if (scoreRecord.score >= 10) grade = 'D';
					else grade = 'F';
				}
				
				return `
				<tr>
					<td>${index + 1}</td>
					<td>${scoreRecord.student.regNo}</td>
					<td>${scoreRecord.student.name}</td>
					<td>${score}</td>
					<td>${grade}</td>
				</tr>
				`;
			}).join('')}
		</tbody>
	</table>

	<div class="signatures">
		<div class="signature-block">
			<div class="signature-line"></div>
			<div><strong>Course Lecturer</strong></div>
			<div>${lecturer?.name || '_________________'}</div>
		</div>
		<div class="signature-block">
			<div class="signature-line"></div>
			<div><strong>Head of Department</strong></div>
			<div>_________________</div>
		</div>
	</div>
</body>
</html>
	`;
}
