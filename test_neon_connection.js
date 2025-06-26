import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔌 Testing Neon PostgreSQL connection...');
    
    // Test basic connection
    const departments = await prisma.department.findMany();
    console.log('✅ Connection successful!');
    console.log(`📊 Found ${departments.length} departments:`, departments.map(d => d.name));
    
    // Test users
    const users = await prisma.user.findMany({
      include: { department: true }
    });
    console.log(`👥 Found ${users.length} users`);
    
    // Test courses
    const courses = await prisma.course.findMany();
    console.log(`📚 Found ${courses.length} courses`);
    
    // Test students
    const students = await prisma.student.findMany();
    console.log(`🎓 Found ${students.length} students`);
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
