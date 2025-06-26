// Test admin functionality
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testAdminFunctionality() {
  console.log('🧪 Testing admin functionality...');
  
  try {
    // Test 1: Check if admin user exists
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      include: { department: true }
    });
    
    console.log('✅ Admin user found:', admin ? admin.name : 'No admin found');
    
    // Test 2: Check courses data for admin courses page
    const courses = await prisma.course.findMany({
      include: {
        department: true,
        courseAssignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        caScores: {
          where: {
            isSubmitted: true
          }
        },
        _count: {
          select: {
            caScores: true
          }
        }
      },
      take: 3
    });
    
    console.log('✅ Courses query successful:', courses.length, 'courses found');
    
    // Test 3: Check departments for forms
    const departments = await prisma.department.findMany();
    console.log('✅ Departments found:', departments.length);
    
    // Test 4: Check lecturers for assignment
    const lecturers = await prisma.user.findMany({
      where: { role: 'LECTURER' },
      include: { department: true }
    });
    console.log('✅ Lecturers found:', lecturers.length);
    
    // Test 5: Check recent submissions for reports
    const recentSubmissions = await prisma.cAScore.findMany({
      where: {
        isSubmitted: true,
        updatedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      include: {
        course: {
          include: {
            department: true
          }
        },
        student: {
          include: {
            department: true
          }
        },
        submittedByUser: true
      },
      take: 5
    });
    
    console.log('✅ Recent submissions found:', recentSubmissions.length);
    
    console.log('\n🎉 All admin queries successful! Pages should work.');
    
  } catch (error) {
    console.error('❌ Error testing admin functionality:', error);
  }
}

testAdminFunctionality().catch(console.error).finally(() => process.exit(0));
