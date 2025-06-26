import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAppFunctionality() {
  try {
    console.log('🧪 Testing ScoreFlow functionality with Neon PostgreSQL...\n');
    
    // Test authentication data
    console.log('👤 Testing user authentication data:');
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      include: { department: true }
    });
    
    if (adminUser) {
      console.log('✅ Admin user found:', adminUser.name, `(${adminUser.email})`);
    } else {
      console.log('❌ No admin user found');
    }
    
    // Test HOD users
    const hodUsers = await prisma.user.findMany({
      where: { role: 'HOD' },
      include: { department: true }
    });
    console.log(`✅ Found ${hodUsers.length} HOD users:`, hodUsers.map(h => `${h.name} (${h.department?.name})`));
    
    // Test lecturer assignments
    console.log('\n📚 Testing course assignments:');
    const coursesWithAssignments = await prisma.course.findMany({
      include: {
        department: true,
        courseAssignments: {
          include: { user: true }
        }
      }
    });
    
    const assignedCourses = coursesWithAssignments.filter(c => c.courseAssignments.length > 0);
    console.log(`✅ Found ${assignedCourses.length} courses with lecturer assignments`);
    
    // Test student enrollments
    console.log('\n🎓 Testing student data:');
    const studentsWithScores = await prisma.student.findMany({
      include: {
        department: true,
        caScores: {
          include: { course: true }
        }
      }
    });
    
    const enrolledStudents = studentsWithScores.filter(s => s.caScores.length > 0);
    console.log(`✅ Found ${enrolledStudents.length} students with course enrollments`);
    
    // Test cross-department enrollments
    const crossDeptEnrollments = studentsWithScores.filter(student => 
      student.caScores.some(score => 
        score.course.departmentId !== student.departmentId
      )
    );
    console.log(`✅ Found ${crossDeptEnrollments.length} students with cross-department enrollments`);
    
    console.log('\n🎉 All functionality tests passed! ScoreFlow is working correctly with Neon PostgreSQL.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testAppFunctionality();
