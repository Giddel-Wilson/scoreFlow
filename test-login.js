import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testLogin() {
    try {
        // Check if Dr. Michael Brown exists and get his details
        const user = await prisma.user.findFirst({
            where: { email: 'michael.brown@university.edu' },
            include: { department: true }
        });
        
        if (!user) {
            console.log('Dr. Michael Brown not found!');
            return;
        }
        
        console.log('User found:');
        console.log('- Name:', user.name);
        console.log('- Email:', user.email);
        console.log('- Role:', user.role);
        console.log('- Department:', user.department?.name);
        console.log('- Password Hash exists:', !!user.passwordHash);
        
        // Check courses assigned to him
        const assignments = await prisma.courseAssignment.findMany({
            where: { userId: user.userId },
            include: {
                course: {
                    include: { department: true }
                }
            }
        });
        
        console.log('\nCourse assignments:', assignments.length);
        assignments.forEach(assignment => {
            console.log(`- ${assignment.course.code}: ${assignment.course.title} (ID: ${assignment.course.id})`);
        });
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testLogin();
