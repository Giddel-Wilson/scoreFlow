import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Checking courses and assignments...');
    
    // Check courses
    const courses = await prisma.course.findMany({
      include: {
        department: true,
        courseAssignments: {
          include: {
            user: true
          }
        }
      }
    });
    
    console.log(`\nFound ${courses.length} courses:`);
    courses.forEach(course => {
      console.log(`- ${course.code}: ${course.title} (Level ${course.level}, Semester ${course.semester})`);
      console.log(`  Department: ${course.department.name}`);
      console.log(`  Assigned to: ${course.courseAssignments.map(a => a.user.name).join(', ') || 'No assignments'}`);
    });
    
    // Check course assignments
    const assignments = await prisma.courseAssignment.findMany({
      include: {
        user: true,
        course: true
      }
    });
    
    console.log(`\nFound ${assignments.length} course assignments:`);
    assignments.forEach(assignment => {
      console.log(`- ${assignment.user.name} -> ${assignment.course.code}`);
    });
    
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
