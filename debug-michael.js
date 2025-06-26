import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Checking Dr. Michael Brown\'s courses...');
    
    // Find Dr. Michael Brown
    const michael = await prisma.user.findUnique({
      where: { email: 'michael.brown@university.edu' },
      include: {
        courseAssignments: {
          include: {
            course: {
              include: {
                department: true
              }
            }
          }
        }
      }
    });
    
    if (!michael) {
      console.log('Dr. Michael Brown not found!');
      return;
    }
    
    console.log(`\nFound user: ${michael.name} (ID: ${michael.id})`);
    console.log(`Email: ${michael.email}`);
    console.log(`Role: ${michael.role}`);
    console.log(`Department ID: ${michael.departmentId}`);
    
    if (michael.courseAssignments.length === 0) {
      console.log('\nNo course assignments found!');
    } else {
      console.log(`\nCourse assignments (${michael.courseAssignments.length}):`);
      michael.courseAssignments.forEach(assignment => {
        const course = assignment.course;
        console.log(`- Course ID: ${course.id}`);
        console.log(`  Code: ${course.code}`);
        console.log(`  Title: ${course.title}`);
        console.log(`  Level: ${course.level}`);
        console.log(`  Semester: ${course.semester}`);
        console.log(`  Department: ${course.department.name}`);
        console.log(`  URL: /lecturer/courses/${course.id}/scores`);
        console.log('');
      });
    }
    
    // Also check all available courses
    console.log('All available courses:');
    const allCourses = await prisma.course.findMany({
      include: {
        department: true,
        courseAssignments: {
          include: { user: true }
        }
      }
    });
    
    allCourses.forEach(course => {
      const assignedTo = course.courseAssignments.map(a => a.user.name).join(', ') || 'No one';
      console.log(`- ID: ${course.id}, Code: ${course.code}, Assigned to: ${assignedTo}`);
    });
    
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
