import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPageLoad() {
  try {
    console.log('Testing page load for /lecturer/courses/4/scores...');
    
    // Simulate what the page server load function does
    const courseId = 4;
    const userId = 4; // Dr. Michael Brown's ID
    
    console.log('Step 1: Verify lecturer has access to course');
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        courseAssignments: {
          some: { userId: userId }
        }
      },
      include: {
        department: true
      }
    });
    
    if (!course) {
      console.log('❌ ERROR: Course not found or access denied');
      return;
    }
    
    console.log('✅ Course found:', course.code, '-', course.title);
    
    console.log('Step 2: Get students for this course');
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
    
    console.log('✅ Students found:', students.length);
    students.forEach(student => {
      console.log(`  - ${student.name} (${student.regNo})`);
    });
    
    console.log('Step 3: Get existing CA scores');
    const existingScores = await prisma.cAScore.findMany({
      where: {
        courseId: course.id,
        submittedBy: userId
      },
      include: {
        student: true
      }
    });
    
    console.log('✅ Existing scores found:', existingScores.length);
    
    console.log('Step 4: Create scores map');
    const scoresMap = new Map();
    existingScores.forEach((score) => {
      scoresMap.set(score.studentId, score);
    });
    
    console.log('Step 5: Combine students with scores');
    const studentsWithScores = students.map((student) => ({
      ...student,
      score: scoresMap.get(student.id) || null
    }));
    
    console.log('✅ Students with scores:');
    studentsWithScores.forEach(student => {
      console.log(`  - ${student.name}: ${student.score?.score || 'No score'}`);
    });
    
    console.log('Step 6: Check submission status');
    const hasSubmittedScores = existingScores.some((score) => score.isSubmitted);
    console.log('✅ Has submitted scores:', hasSubmittedScores);
    
    console.log('\n🎯 FINAL DATA THAT SHOULD BE PASSED TO COMPONENT:');
    console.log({
      course: {
        id: course.id,
        code: course.code,
        title: course.title,
        level: course.level,
        semester: course.semester,
        session: course.session,
        department: course.department
      },
      students: studentsWithScores,
      hasSubmittedScores
    });
    
  } catch (error) {
    console.error('❌ ERROR during page load simulation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPageLoad();
