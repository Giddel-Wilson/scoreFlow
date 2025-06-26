// Quick verification that students now appear in the course
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function verifyStudents() {
  const courseId = 3; // CSC301
  
  console.log('🔍 Checking students for course', courseId);
  
  // New logic - students with scores in the course
  const studentsWithScores = await prisma.student.findMany({
    where: {
      activeStatus: true,
      caScores: {
        some: { courseId: courseId }
      }
    },
    include: { 
      department: true,
      caScores: {
        where: { courseId: courseId }
      }
    },
    orderBy: { regNo: 'asc' }
  });
  
  console.log(`\n🎓 Students with scores in course: ${studentsWithScores.length}`);
  studentsWithScores.forEach(s => {
    const score = s.caScores[0]?.score || 'No score';
    console.log(`  - ${s.name} (${s.regNo}) - ${s.department.name} Level ${s.level} - Score: ${score}`);
  });
  
  console.log('\n✅ Verification completed!');
}

verifyStudents().catch(console.error).finally(() => process.exit(0));
