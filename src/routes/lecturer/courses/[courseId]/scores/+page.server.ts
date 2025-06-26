import { error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { requireRole } from '$lib/server/auth';
import { prisma } from '$lib/db';

export const load: PageServerLoad = async ({ locals, params }) => {
	console.log('Load function called with params:', params);
	const user = requireRole(locals.user, ['LECTURER']);
	const courseId = parseInt(params.courseId);

	console.log('Course ID parsed:', courseId, 'User:', user.email);

	if (isNaN(courseId)) {
		console.log('Invalid course ID:', params.courseId);
		throw error(400, 'Invalid course ID');
	}

	// Get course details and verify access
	const course = await prisma.course.findFirst({
		where: {
			id: courseId,
			courseAssignments: {
				some: { userId: user.userId }
			}
		},
		include: {
			department: true
		}
	});

	if (!course) {
		throw error(404, 'Course not found or access denied');
	}

	// Get all departments for the add student form
	const departments = await prisma.department.findMany({
		orderBy: { name: 'asc' }
	});

	// Get all students who have scores for this course (any department/level)
	const studentsWithScoresInCourse = await prisma.student.findMany({
		where: {
			activeStatus: true,
			caScores: {
				some: {
					courseId: courseId
				}
			}
		},
		orderBy: { regNo: 'asc' }
	});

	// Also get all active students for the add student form (allow any student to be added)
	const allActiveStudents = await prisma.student.findMany({
		where: {
			activeStatus: true
		},
		orderBy: { regNo: 'asc' }
	});

	// Use students with scores, or all students if no scores exist yet
	const students = studentsWithScoresInCourse.length > 0 ? studentsWithScoresInCourse : allActiveStudents;

	// Get existing scores for this course by this lecturer
	const scores = await prisma.cAScore.findMany({
		where: {
			courseId: courseId,
			submittedBy: user.userId
		}
	});

	// Create a map for easy lookup
	const scoresMap = new Map(scores.map(score => [score.studentId, score]));

	// Combine students with their scores
	const studentsWithScores = students.map(student => ({
		...student,
		score: scoresMap.get(student.id) || null
	}));

	// Check if scores have been submitted
	const hasSubmittedScores = scores.some(score => score.isSubmitted);

	return {
		course,
		departments,
		students: studentsWithScores,
		hasSubmittedScores
	};
};

export const actions: Actions = {
	saveScores: async ({ request, locals, params }) => {
		const user = requireRole(locals.user, ['LECTURER']);
		const courseId = parseInt(params.courseId);
		const data = await request.formData();
		const scoresData = JSON.parse(data.get('scores')?.toString() || '[]');

		try {
			// Verify access to course
			const course = await prisma.course.findFirst({
				where: {
					id: courseId,
					courseAssignments: { some: { userId: user.userId } }
				}
			});

			if (!course) {
				throw error(404, 'Course not found');
			}

			// Check if already submitted
			const existingSubmission = await prisma.cAScore.findFirst({
				where: {
					courseId: courseId,
					submittedBy: user.userId,
					isSubmitted: true
				}
			});

			if (existingSubmission) {
				return {
					success: false,
					error: 'Scores have already been submitted and cannot be modified'
				};
			}

			// Save or update scores
			for (const scoreData of scoresData) {
				const score = parseFloat(scoreData.score);
				
				if (isNaN(score) || score < 0 || score > 30) {
					return {
						success: false,
						error: `Invalid score: ${scoreData.score}. Must be between 0 and 30.`
					};
				}

				// Check if a score by this lecturer already exists for this student/course
				const existingScore = await prisma.cAScore.findFirst({
					where: {
						courseId: courseId,
						studentId: scoreData.studentId,
						submittedBy: user.userId
					}
				});

				if (existingScore) {
					// Update existing score
					await prisma.cAScore.update({
						where: { id: existingScore.id },
						data: {
							score: score,
							isSubmitted: false
						}
					});
				} else {
					// Create new score
					await prisma.cAScore.create({
						data: {
							courseId: courseId,
							studentId: scoreData.studentId,
							score: score,
							submittedBy: user.userId,
							isSubmitted: false
						}
					});
				}
			}

			return {
				success: true,
				message: 'Scores saved successfully'
			};

		} catch (err: any) {
			console.error('Save scores error:', err);
			return {
				success: false,
				error: 'Failed to save scores'
			};
		}
	},

	submitScores: async ({ request, locals, params }) => {
		const user = requireRole(locals.user, ['LECTURER']);
		const courseId = parseInt(params.courseId);

		try {
			// Verify access to course
			const course = await prisma.course.findFirst({
				where: {
					id: courseId,
					courseAssignments: { some: { userId: user.userId } }
				}
			});

			if (!course) {
				throw error(404, 'Course not found');
			}

			// Check if already submitted
			const existingSubmission = await prisma.cAScore.findFirst({
				where: {
					courseId: courseId,
					submittedBy: user.userId,
					isSubmitted: true
				}
			});

			if (existingSubmission) {
				return {
					success: false,
					error: 'Scores have already been submitted'
				};
			}

			// Mark all scores as submitted
			await prisma.cAScore.updateMany({
				where: {
					courseId: courseId,
					submittedBy: user.userId
				},
				data: {
					isSubmitted: true
				}
			});

			return {
				success: true,
				message: 'Scores submitted successfully'
			};

		} catch (err: any) {
			console.error('Submit scores error:', err);
			return {
				success: false,
				error: 'Failed to submit scores'
			};
		}
	},

	addStudent: async ({ request, locals, params }) => {
		const user = requireRole(locals.user, ['LECTURER']);
		const courseId = parseInt(params.courseId);
		const data = await request.formData();
		const name = data.get('name')?.toString() || '';
		const regNo = data.get('regNo')?.toString() || '';
		const level = data.get('level')?.toString() || '';
		const departmentId = data.get('departmentId')?.toString() || '';
		const score = data.get('score')?.toString() || '';
		const status = data.get('status')?.toString() || 'ACTIVE';

		if (!name || !regNo || !level || !departmentId) {
			return {
				success: false,
				error: 'Name, registration number, level, and department are required'
			};
		}

		try {
			// Verify access to course
			const course = await prisma.course.findFirst({
				where: {
					id: courseId,
					courseAssignments: { some: { userId: user.userId } }
				},
				include: {
					department: true
				}
			});

			if (!course) {
				throw error(404, 'Course not found');
			}

			// Parse and validate level
			const studentLevel = parseInt(level);
			if (isNaN(studentLevel) || studentLevel < 100 || studentLevel > 800) {
				return {
					success: false,
					error: 'Invalid level. Must be between 100 and 800'
				};
			}

			// Parse and validate department
			const studentDepartmentId = parseInt(departmentId);
			if (isNaN(studentDepartmentId)) {
				return {
					success: false,
					error: 'Invalid department'
				};
			}

			// Verify department exists
			const department = await prisma.department.findUnique({
				where: { id: studentDepartmentId }
			});

			if (!department) {
				return {
					success: false,
					error: 'Department not found'
				};
			}

			// Validate score if provided
			let scoreValue = null;
			if (score && score.trim() !== '') {
				scoreValue = parseFloat(score);
				if (isNaN(scoreValue) || scoreValue < 0 || scoreValue > 30) {
					return {
						success: false,
						error: 'Score must be between 0 and 30'
					};
				}
			}

			// Check if student already exists
			const existingStudent = await prisma.student.findUnique({
				where: { regNo: regNo }
			});

			if (existingStudent) {
				return {
					success: false,
					error: 'Student with this registration number already exists'
				};
			}

			// Create new student
			const newStudent = await prisma.student.create({
				data: {
					name: name,
					regNo: regNo,
					departmentId: studentDepartmentId,
					level: studentLevel,
					activeStatus: status === 'ACTIVE'
				}
			});

			// Add score if provided
			if (scoreValue !== null) {
				await prisma.cAScore.create({
					data: {
						courseId: courseId,
						studentId: newStudent.id,
						score: scoreValue,
						submittedBy: user.userId,
						isSubmitted: false
					}
				});
			}

			return {
				success: true,
				message: 'Student added successfully'
			};

		} catch (err: any) {
			console.error('Add student error:', err);
			return {
				success: false,
				error: 'Failed to add student'
			};
		}
	},

	bulkUpload: async ({ request, locals, params }) => {
		const user = requireRole(locals.user, ['LECTURER']);
		const courseId = parseInt(params.courseId);
		const data = await request.formData();
		const file = data.get('file') as File;

		if (!file) {
			return {
				success: false,
				error: 'No file provided'
			};
		}

		try {
			// Verify access to course
			const course = await prisma.course.findFirst({
				where: {
					id: courseId,
					courseAssignments: { some: { userId: user.userId } }
				}
			});

			if (!course) {
				throw error(404, 'Course not found');
			}

			// Parse CSV content
			const text = await file.text();
			const lines = text.split('\n').map(line => line.trim()).filter(line => line);
			
			if (lines.length < 2) {
				return {
					success: false,
					error: 'File must contain at least a header row and one data row'
				};
			}

			// Parse header
			const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
			const requiredHeaders = ['name', 'regno', 'level', 'department'];
			const optionalHeaders = ['score', 'status'];
			
			// Check required headers
			for (const required of requiredHeaders) {
				if (!headers.includes(required)) {
					return {
						success: false,
						error: `Missing required column: ${required}`
					};
				}
			}

			const results = {
				success: 0,
				errors: [] as string[]
			};

			// Process each row
			for (let i = 1; i < lines.length; i++) {
				const row = lines[i].split(',').map(cell => cell.trim());
				const rowData: Record<string, string> = {};
				
				// Map row data to headers
				headers.forEach((header, index) => {
					rowData[header] = row[index] || '';
				});

				try {
					// Validate required fields
					if (!rowData.name || !rowData.regno || !rowData.level || !rowData.department) {
						results.errors.push(`Row ${i + 1}: Missing required fields (name, regno, level, department)`);
						continue;
					}

					// Parse and validate level
					const level = parseInt(rowData.level);
					if (isNaN(level) || level < 100 || level > 800) {
						results.errors.push(`Row ${i + 1}: Invalid level: ${rowData.level}. Must be between 100 and 800`);
						continue;
					}

					// Find department by name (case-sensitive for SQLite compatibility)
					const departmentName = rowData.department.trim();
					const department = await prisma.department.findFirst({
						where: {
							name: departmentName
						}
					});

					if (!department) {
						results.errors.push(`Row ${i + 1}: Department not found: ${departmentName}. Valid departments: Computer Science, Information Technology, Cyber Security`);
						continue;
					}

					const departmentId = department.id;

					// Parse score if provided
					let score = null;
					if (rowData.score && rowData.score.trim() !== '') {
						score = parseFloat(rowData.score);
						if (isNaN(score) || score < 0 || score > 30) {
							results.errors.push(`Row ${i + 1}: Invalid score: ${rowData.score}`);
							continue;
						}
					}

					// Parse status
					const status = rowData.status?.toUpperCase() === 'INACTIVE' ? false : true;

					// Check if student already exists
					const existingStudent = await prisma.student.findUnique({
						where: { regNo: rowData.regno }
					});

					if (existingStudent) {
						results.errors.push(`Row ${i + 1}: Student already exists: ${rowData.regno}`);
						continue;
					}

					// Create student
					const newStudent = await prisma.student.create({
						data: {
							name: rowData.name,
							regNo: rowData.regno,
							departmentId: departmentId,
							level: level,
							activeStatus: status
						}
					});

					// Add score if provided
					if (score !== null) {
						await prisma.cAScore.create({
							data: {
								courseId: courseId,
								studentId: newStudent.id,
								score: score,
								submittedBy: user.userId,
								isSubmitted: false
							}
						});
					}

					results.success++;

				} catch (err: any) {
					console.error(`Error processing row ${i + 1}:`, err);
					results.errors.push(`Row ${i + 1}: Failed to process - ${err.message}`);
				}
			}

			if (results.success === 0 && results.errors.length > 0) {
				return {
					success: false,
					error: 'No students were added',
					details: results.errors
				};
			}

			return {
				success: true,
				message: `Successfully added ${results.success} students`,
				details: results.errors.length > 0 ? results.errors : undefined
			};

		} catch (err: any) {
			console.error('Bulk upload error:', err);
			return {
				success: false,
				error: 'Failed to process file'
			};
		}
	},

	editStudent: async ({ request, locals, params }) => {
		console.log('Edit student action called with params:', params);
		const user = requireRole(locals.user, ['LECTURER']);
		const courseId = parseInt(params.courseId);
		const data = await request.formData();
		const studentId = parseInt(data.get('studentId')?.toString() || '');
		const name = data.get('name')?.toString() || '';
		const regNo = data.get('regNo')?.toString() || '';
		const level = data.get('level')?.toString() || '';
		const departmentId = data.get('departmentId')?.toString() || '';
		const score = data.get('score')?.toString() || '';
		const status = data.get('status')?.toString() || 'ACTIVE';

		console.log('Edit student data:', { studentId, name, regNo, level, departmentId, score, status });

		if (!studentId || !name || !regNo || !level || !departmentId) {
			console.log('Validation failed: missing required fields');
			return {
				success: false,
				error: 'Student ID, name, registration number, level, and department are required'
			};
		}

		try {
			// Verify access to course
			const course = await prisma.course.findFirst({
				where: {
					id: courseId,
					courseAssignments: { some: { userId: user.userId } }
				}
			});

			if (!course) {
				throw error(404, 'Course not found');
			}

			// Parse and validate level
			const studentLevel = parseInt(level);
			if (isNaN(studentLevel) || studentLevel < 100 || studentLevel > 800) {
				return {
					success: false,
					error: 'Invalid level. Must be between 100 and 800'
				};
			}

			// Parse and validate department
			const studentDepartmentId = parseInt(departmentId);
			if (isNaN(studentDepartmentId)) {
				return {
					success: false,
					error: 'Invalid department'
				};
			}

			// Verify department exists
			const department = await prisma.department.findUnique({
				where: { id: studentDepartmentId }
			});

			if (!department) {
				return {
					success: false,
					error: 'Department not found'
				};
			}

			// Validate score if provided
			let scoreValue = null;
			if (score && score.trim() !== '') {
				scoreValue = parseFloat(score);
				if (isNaN(scoreValue) || scoreValue < 0 || scoreValue > 30) {
					return {
						success: false,
						error: 'Score must be between 0 and 30'
					};
				}
			}

			// Check if another student has this registration number (excluding current student)
			const existingStudent = await prisma.student.findFirst({
				where: { 
					regNo: regNo,
					id: { not: studentId }
				}
			});

			if (existingStudent) {
				return {
					success: false,
					error: 'Another student with this registration number already exists'
				};
			}

			// Update student
			await prisma.student.update({
				where: { id: studentId },
				data: {
					name: name,
					regNo: regNo,
					departmentId: studentDepartmentId,
					level: studentLevel,
					activeStatus: status === 'ACTIVE'
				}
			});

			// Update or create score if provided
			if (scoreValue !== null) {
				const existingScore = await prisma.cAScore.findFirst({
					where: {
						courseId: courseId,
						studentId: studentId,
						submittedBy: user.userId
					}
				});

				if (existingScore) {
					// Update existing score
					await prisma.cAScore.update({
						where: { id: existingScore.id },
						data: { score: scoreValue }
					});
				} else {
					// Create new score
					await prisma.cAScore.create({
						data: {
							courseId: courseId,
							studentId: studentId,
							score: scoreValue,
							submittedBy: user.userId,
							isSubmitted: false
						}
					});
				}
			}

			console.log('Edit student action completed successfully');
			return {
				success: true,
				message: 'Student updated successfully'
			};

		} catch (err: any) {
			console.error('Edit student error:', err);
			return {
				success: false,
				error: 'Failed to update student'
			};
		}
	},

	deleteStudent: async ({ request, locals, params }) => {
		const user = requireRole(locals.user, ['LECTURER']);
		const courseId = parseInt(params.courseId);
		const data = await request.formData();
		const studentId = parseInt(data.get('studentId')?.toString() || '');

		if (!studentId) {
			return {
				success: false,
				error: 'Student ID is required'
			};
		}

		try {
			// Verify access to course
			const course = await prisma.course.findFirst({
				where: {
					id: courseId,
					courseAssignments: { some: { userId: user.userId } }
				}
			});

			if (!course) {
				throw error(404, 'Course not found');
			}

			// Check if scores have been submitted - prevent deletion if so
			const submittedScore = await prisma.cAScore.findFirst({
				where: {
					courseId: courseId,
					studentId: studentId,
					submittedBy: user.userId,
					isSubmitted: true
				}
			});

			if (submittedScore) {
				return {
					success: false,
					error: 'Cannot delete student with submitted scores'
				};
			}

			// Get student info before deletion for better error messages
			const student = await prisma.student.findUnique({
				where: { id: studentId },
				include: {
					caScores: {
						where: {
							courseId: courseId,
							submittedBy: user.userId
						}
					}
				}
			});

			if (!student) {
				return {
					success: false,
					error: 'Student not found'
				};
			}

			// Check if student has pending scores (not submitted)
			const hasPendingScores = student.caScores.some(score => !score.isSubmitted);

			// Delete any existing CA scores for this student in this course by this lecturer
			await prisma.cAScore.deleteMany({
				where: {
					courseId: courseId,
					studentId: studentId,
					submittedBy: user.userId
				}
			});

			// Delete the student
			await prisma.student.delete({
				where: { id: studentId }
			});

			return {
				success: true,
				message: 'Student deleted successfully'
			};

		} catch (err: any) {
			console.error('Delete student error:', err);
			
			// Check if it's a constraint error (student has pending references)
			if (err.code === 'P2003' || err.message.includes('Foreign key constraint')) {
				return {
					success: false,
					error: 'Failed to delete pending student - student may have references in other courses or pending assignments'
				};
			}
			
			// Check for other specific Prisma errors
			if (err.code === 'P2025') {
				return {
					success: false,
					error: 'Student not found or already deleted'
				};
			}
			
			return {
				success: false,
				error: 'Failed to delete student - an unexpected error occurred'
			};
		}
	}
};
