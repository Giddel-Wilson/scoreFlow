// Quick test to verify the load function works correctly
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testLoad() {
  console.log('🧪 Testing load function logic...');
  
  const courseId = 3; // CSC301 - Computer Science Level 300
  console.log(`Testing course ID: ${courseId}`);
  
  // Get course details
  const course = await prisma.course.findFirst({
    where: { id: courseId },
    include: { department: true }
  });
  
  console.log(`Course: ${course.code} - ${course.title}`);
  console.log(`Department: ${course.department.name}, Level: ${course.level}`);
  
  // Old logic (restrictive)
  console.log('\n🔴 OLD LOGIC (restrictive):');
  const oldStudents = await prisma.student.findMany({
    where: {
      departmentId: course.departmentId,
      level: course.level,
      activeStatus: true
    },
    include: { department: true },
    orderBy: { regNo: 'asc' }
  });
  
  console.log(`Students found with old logic: ${oldStudents.length}`);
  oldStudents.forEach(s => {
    console.log(`  - ${s.name} (${s.regNo}) - ${s.department.name} Level ${s.level}`);
  });
  
  // New logic (flexible)
  console.log('\n🟢 NEW LOGIC (flexible):');
  const studentsWithScoresInCourse = await prisma.student.findMany({
    where: {
      activeStatus: true,
      caScores: {
        some: {
          courseId: courseId
        }
      }
    },
    include: { department: true },
    orderBy: { regNo: 'asc' }
  });
  
  const allActiveStudents = await prisma.student.findMany({
    where: { activeStatus: true },
    include: { department: true },
    orderBy: { regNo: 'asc' }
  });
  
  const newStudents = studentsWithScoresInCourse.length > 0 ? studentsWithScoresInCourse : allActiveStudents;
  
  console.log(`Students with scores in this course: ${studentsWithScoresInCourse.length}`);
  studentsWithScoresInCourse.forEach(s => {
    console.log(`  - ${s.name} (${s.regNo}) - ${s.department.name} Level ${s.level} [HAS SCORE]`);
  });
  
  console.log(`\nStudents shown with new logic: ${newStudents.length}`);
  console.log('(If no students have scores yet, all active students are shown)');
  
  // Show the difference
  console.log('\n📊 COMPARISON:');
  console.log(`Old logic: ${oldStudents.length} students (same dept/level only)`);
  console.log(`New logic: ${newStudents.length} students (flexible)`);
  
  console.log('\n✅ Test completed!');
}

testLoad().catch(console.error).finally(() => process.exit(0));
