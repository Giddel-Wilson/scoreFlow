import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Checking students for course ID 4 (CSC302)...');
    
    // Get course details
    const course = await prisma.course.findUnique({
      where: { id: 4 },
      include: {
        department: true
      }
    });
    
    if (!course) {
      console.log('Course ID 4 not found!');
      return;
    }
    
    console.log(`Course: ${course.code} - ${course.title}`);
    console.log(`Level: ${course.level}, Department: ${course.department.name} (ID: ${course.departmentId})`);
    
    // Check students that should appear for this course
    const students = await prisma.student.findMany({
      where: {
        departmentId: course.departmentId,
        level: course.level,
        activeStatus: true
      },
      include: {
        caScores: {
          where: {
            courseId: course.id,
            submittedBy: 4 // Dr. Michael Brown's ID
          }
        }
      },
      orderBy: [{ regNo: 'asc' }]
    });
    
    console.log(`\nStudents for this course (Level ${course.level}, Dept ${course.department.name}):`);
    if (students.length === 0) {
      console.log('❌ NO STUDENTS FOUND! This is why the page appears blank.');
      
      // Check all students to see what levels exist
      const allStudents = await prisma.student.findMany({
        include: { department: true }
      });
      
      console.log('\nAll students in database:');
      allStudents.forEach(student => {
        console.log(`- ${student.name} (${student.regNo}) - Level ${student.level} - ${student.department.name} - Active: ${student.activeStatus}`);
      });
      
    } else {
      students.forEach(student => {
        const score = student.caScores[0];
        console.log(`- ${student.name} (${student.regNo}) - Score: ${score?.score || 'No score'}`);
      });
    }
    
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
