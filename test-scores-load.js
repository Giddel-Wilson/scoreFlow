import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testScoresPageLoad() {
    try {
        console.log('Testing scores page load for course 4...');
        
        // Test user authentication - Dr. Michael Brown
        const user = await prisma.user.findFirst({
            where: { email: 'michael.brown@university.edu' },
            include: { department: true }
        });
        console.log('User found:', user?.name, user?.role);
        
        // Test course access for course 4
        const course = await prisma.course.findFirst({
            where: {
                id: 4,
                courseAssignments: {
                    some: { userId: user.userId }
                }
            },
            include: {
                department: true
            }
        });
        console.log('Course found:', course?.code, course?.title);
        
        // Test students for this course
        const students = await prisma.student.findMany({
            where: {
                departmentId: course.departmentId,
                level: course.level,
                activeStatus: true
            },
            orderBy: [
                { regNo: 'asc' }
            ]
        });
        console.log('Students found:', students.length);
        students.forEach(s => console.log(`  - ${s.regNo}: ${s.name}`));
        
        // Test existing scores
        const existingScores = await prisma.cAScore.findMany({
            where: {
                courseId: course.id,
                submittedBy: user.userId
            }
        });
        console.log('Existing scores:', existingScores.length);
        
        // Create the data structure that would be returned
        const scoresMap = new Map();
        existingScores.forEach((score) => {
            scoresMap.set(score.studentId, score);
        });

        const studentsWithScores = students.map((student) => ({
            ...student,
            score: scoresMap.get(student.id) || null
        }));
        
        const hasSubmittedScores = existingScores.some((score) => score.isSubmitted);
        
        console.log('Final data structure:');
        console.log('- Course:', course.code);
        console.log('- Students with scores:', studentsWithScores.length);
        console.log('- Has submitted scores:', hasSubmittedScores);
        
        // Print first few students with their scores
        console.log('Sample student data:');
        studentsWithScores.slice(0, 3).forEach(student => {
            console.log(`  ${student.regNo}: ${student.name} - Score: ${student.score?.score || 'None'}`);
        });
        
    } catch (error) {
        console.error('Error testing scores page load:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testScoresPageLoad();
