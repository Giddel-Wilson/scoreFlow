// Test HOD functionality and department filtering
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testHODFunctionality() {
  console.log('🧪 Testing HOD functionality...');
  
  // Get all HODs
  const hods = await prisma.user.findMany({
    where: { role: 'HOD' },
    include: { department: true }
  });
  
  console.log(`\n📊 Found ${hods.length} HODs:`);
  
  for (const hod of hods) {
    console.log(`\n🏢 ${hod.department?.name} Department HOD:`);
    console.log(`   Name: ${hod.name}`);
    console.log(`   Email: ${hod.email}`);
    
    // Get courses in this HOD's department
    const courses = await prisma.course.findMany({
      where: { departmentId: hod.departmentId },
      include: {
        caScores: {
          where: { isSubmitted: true }
        }
      }
    });
    
    console.log(`   Courses in department: ${courses.length}`);
    
    // Count submissions
    let totalSubmissions = 0;
    courses.forEach(course => {
      totalSubmissions += course.caScores.length;
    });
    
    console.log(`   Total submissions: ${totalSubmissions}`);
    
    // Get cross-departmental students
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
    
    console.log(`   Cross-departmental students: ${crossDeptStudents.length}`);
    
    if (crossDeptStudents.length > 0) {
      console.log(`   Cross-departmental enrollments:`);
      crossDeptStudents.forEach(student => {
        console.log(`     - ${student.name} (${student.department.name}) taking ${student.caScores.length} courses`);
      });
    }
  }
  
  console.log('\n✅ HOD functionality test completed!');
}

testHODFunctionality().catch(console.error).finally(() => process.exit(0));
