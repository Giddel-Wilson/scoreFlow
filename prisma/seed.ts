import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
	console.log('🌱 Starting database seed...');

	// Create departments
	const departments = await Promise.all([
		prisma.department.create({
			data: { name: 'Computer Science' }
		}),
		prisma.department.create({
			data: { name: 'Information Technology' }
		}),
		prisma.department.create({
			data: { name: 'Cyber Security' }
		})
	]);

	const csDept = departments[0];
	const itDept = departments[1];
	const cyberDept = departments[2];

	// Create users
	const hashedPassword = await bcrypt.hash('password123', 12);

	const users = await Promise.all([
		// Admin
		prisma.user.create({
			data: {
				name: 'Dr. Samuel Admin',
				email: 'admin@university.edu',
				passwordHash: hashedPassword,
				role: 'ADMIN'
			}
		}),
		// HODs for all departments
		prisma.user.create({
			data: {
				name: 'Prof. David Wilson',
				email: 'hod.cs@university.edu',
				passwordHash: hashedPassword,
				role: 'HOD',
				departmentId: csDept.id
			}
		}),
		prisma.user.create({
			data: {
				name: 'Prof. James Thompson',
				email: 'hod.it@university.edu',
				passwordHash: hashedPassword,
				role: 'HOD',
				departmentId: itDept.id
			}
		}),
		prisma.user.create({
			data: {
				name: 'Prof. Lisa Martinez',
				email: 'hod.cybersec@university.edu',
				passwordHash: hashedPassword,
				role: 'HOD',
				departmentId: cyberDept.id
			}
		}),
		// Lecturers
		prisma.user.create({
			data: {
				name: 'Dr. Sarah Johnson',
				email: 'sarah.johnson@university.edu',
				passwordHash: hashedPassword,
				role: 'LECTURER',
				departmentId: csDept.id
			}
		}),
		prisma.user.create({
			data: {
				name: 'Dr. Michael Brown',
				email: 'michael.brown@university.edu',
				passwordHash: hashedPassword,
				role: 'LECTURER',
				departmentId: csDept.id
			}
		}),
		prisma.user.create({
			data: {
				name: 'Dr. Emily Davis',
				email: 'emily.davis@university.edu',
				passwordHash: hashedPassword,
				role: 'LECTURER',
				departmentId: itDept.id
			}
		})
	]);

	const [admin, hodCS, hodIT, hodCyber, lecturerSarah, lecturerMichael, lecturerEmily] = users;

	// Create students
	const students = await Promise.all([
		// CS Students - Level 200
		prisma.student.create({
			data: {
				name: 'John Smith',
				regNo: 'CS/2023/001',
				departmentId: csDept.id,
				level: 200
			}
		}),
		prisma.student.create({
			data: {
				name: 'Jane Doe',
				regNo: 'CS/2023/002',
				departmentId: csDept.id,
				level: 200
			}
		}),
		prisma.student.create({
			data: {
				name: 'Bob Wilson',
				regNo: 'CS/2023/003',
				departmentId: csDept.id,
				level: 200
			}
		}),
		// CS Students - Level 300
		prisma.student.create({
			data: {
				name: 'Alice Johnson',
				regNo: 'CS/2022/001',
				departmentId: csDept.id,
				level: 300
			}
		}),
		prisma.student.create({
			data: {
				name: 'Charlie Brown',
				regNo: 'CS/2022/002',
				departmentId: csDept.id,
				level: 300
			}
		})
	]);

	// Create courses
	const courses = await Promise.all([
		prisma.course.create({
			data: {
				code: 'CSC201',
				title: 'Data Structures and Algorithms',
				level: 200,
				semester: 1,
				session: '2023/2024',
				departmentId: csDept.id
			}
		}),
		prisma.course.create({
			data: {
				code: 'CSC202',
				title: 'Object-Oriented Programming',
				level: 200,
				semester: 2,
				session: '2023/2024',
				departmentId: csDept.id
			}
		}),
		prisma.course.create({
			data: {
				code: 'CSC301',
				title: 'Database Systems',
				level: 300,
				semester: 1,
				session: '2023/2024',
				departmentId: csDept.id
			}
		}),
		prisma.course.create({
			data: {
				code: 'CSC302',
				title: 'Software Engineering',
				level: 300,
				semester: 2,
				session: '2023/2024',
				departmentId: csDept.id
			}
		})
	]);

	const [dsa, oop, database, softEng] = courses;

	// Create course assignments
	await Promise.all([
		prisma.courseAssignment.create({
			data: {
				userId: lecturerSarah.id,
				courseId: dsa.id
			}
		}),
		prisma.courseAssignment.create({
			data: {
				userId: lecturerSarah.id,
				courseId: oop.id
			}
		}),
		prisma.courseAssignment.create({
			data: {
				userId: lecturerMichael.id,
				courseId: database.id
			}
		}),
		prisma.courseAssignment.create({
			data: {
				userId: lecturerMichael.id,
				courseId: softEng.id
			}
		})
	]);

	// Create some CA scores (both submitted and drafts)
	const level200Students = students.filter(s => s.level === 200);
	const level300Students = students.filter(s => s.level === 300);

	// DSA scores (submitted)
	await Promise.all(
		level200Students.map(student =>
			prisma.cAScore.create({
				data: {
					courseId: dsa.id,
					studentId: student.id,
					score: Math.floor(Math.random() * 21) + 10, // Random score between 10-30
					isSubmitted: true,
					submittedBy: lecturerSarah.id
				}
			})
		)
	);

	// OOP scores (draft)
	await Promise.all(
		level200Students.map(student =>
			prisma.cAScore.create({
				data: {
					courseId: oop.id,
					studentId: student.id,
					score: Math.floor(Math.random() * 21) + 10,
					isSubmitted: false,
					submittedBy: lecturerSarah.id
				}
			})
		)
	);

	// Database scores (submitted)
	await Promise.all(
		level300Students.map(student =>
			prisma.cAScore.create({
				data: {
					courseId: database.id,
					studentId: student.id,
					score: Math.floor(Math.random() * 21) + 10,
					isSubmitted: true,
					submittedBy: lecturerMichael.id
				}
			})
		)
	);

	console.log('✅ Database seeded successfully!');
	console.log('\n📋 Test Accounts Created:');
	console.log('Admin: admin@university.edu / password123');
	console.log('HOD (CS): hod.cs@university.edu / password123');
	console.log('HOD (IT): hod.it@university.edu / password123');
	console.log('HOD (Cyber Security): hod.cybersec@university.edu / password123');
	console.log('Lecturer (Sarah): sarah.johnson@university.edu / password123');
	console.log('Lecturer (Michael): michael.brown@university.edu / password123');
	console.log('Lecturer (Emily): emily.davis@university.edu / password123');
}

main()
	.catch((e) => {
		console.error('❌ Seed failed:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
