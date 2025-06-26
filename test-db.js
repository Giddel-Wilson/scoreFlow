import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Testing database connection...');
    
    // Check if users exist
    const userCount = await prisma.user.count();
    console.log(`Number of users in database: ${userCount}`);
    
    if (userCount > 0) {
      const users = await prisma.user.findMany({
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          department: {
            select: {
              name: true
            }
          }
        }
      });
      
      console.log('\nSample users:');
      users.forEach(user => {
        console.log(`- ${user.name} (${user.email}) - ${user.role} - ${user.department?.name || 'No department'}`);
      });
    } else {
      console.log('No users found in database');
    }
    
    // Check departments
    const deptCount = await prisma.department.count();
    console.log(`\nNumber of departments: ${deptCount}`);
    
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
