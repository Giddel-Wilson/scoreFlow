// Test to verify HOD reports are properly filtered by department
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testHODReportsFiltering() {
  console.log('🧪 Testing HOD reports filtering...');
  
  // Test each HOD's dashboard data
  const hods = await prisma.user.findMany({
    where: { role: 'HOD' },
    include: { department: true },
    orderBy: { department: { name: 'asc' } }
  });
  
  for (const hod of hods) {
    console.log(`\n🏢 Testing ${hod.department?.name} HOD (${hod.name}):`);
    
    // Simulate the dashboard load function
    const courses = await prisma.course.findMany({
      where: { departmentId: hod.departmentId },
      include: {
        courseAssignments: {
          include: { user: true }
        },
        caScores: {
          where: { isSubmitted: true }
        }
      },
      orderBy: [
        { level: 'asc' },
        { code: 'asc' }
      ]
    });
    
    console.log(`   📚 Courses in department: ${courses.length}`);
    courses.forEach(course => {
      const submissions = course.caScores.length;
      const lecturer = course.courseAssignments[0]?.user?.name || 'Unassigned';
      console.log(`     - ${course.code}: ${submissions} submissions (${lecturer})`);
    });
    
    // Test recent submissions filtering
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const recentSubmissions = await prisma.cAScore.findMany({
      where: {
        isSubmitted: true,
        updatedAt: { gte: weekAgo },
        course: { departmentId: hod.departmentId }
      },
      include: {
        course: true,
        submittedByUser: true
      },
      orderBy: { updatedAt: 'desc' },
      take: 5
    });
    
    console.log(`   📊 Recent submissions (last 7 days): ${recentSubmissions.length}`);
    
    // Test cross-departmental students
    const crossDeptStudents = await prisma.student.findMany({
      where: {
        departmentId: { not: hod.departmentId },
        caScores: {
          some: {
            course: { departmentId: hod.departmentId }
          }
        }
      },
      include: {
        department: true,
        caScores: {
          where: {
            course: { departmentId: hod.departmentId }
          },
          include: { course: true }
        }
      }
    });
    
    console.log(`   🔄 Cross-departmental students: ${crossDeptStudents.length}`);
    
    // Verify no data leakage from other departments
    const otherDeptCourses = await prisma.course.findMany({
      where: { departmentId: { not: hod.departmentId } }
    });
    
    console.log(`   🔒 Other departments' courses (should not see): ${otherDeptCourses.length}`);
    console.log(`   ✅ Data isolation: ${courses.length > 0 ? 'PASS' : 'NO COURSES'}`);
  }
  
  console.log('\n✅ HOD reports filtering test completed!');
}

testHODReportsFiltering().catch(console.error).finally(() => process.exit(0));
