// Test bulk upload functionality directly
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function testBulkUploadLogic() {
  console.log('🧪 Testing bulk upload logic...');
  
  // Read the test CSV file
  const csvContent = fs.readFileSync('/Users/maintenance/Documents/ScoreFlow/test_upload.csv', 'utf8');
  console.log('📄 CSV Content:');
  console.log(csvContent);
  
  // Simulate the parsing logic
  const lines = csvContent.split('\n').map(line => line.trim()).filter(line => line);
  console.log('\n📄 Number of lines:', lines.length);
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  console.log('📋 Headers:', headers);
  
  // Check departments exist
  const departments = await prisma.department.findMany();
  console.log('\n🏢 Available departments:');
  departments.forEach(d => console.log(`  - ${d.name} (ID: ${d.id})`));
  
  // Test each row
  for (let i = 1; i < lines.length; i++) {
    console.log(`\n🔄 Testing row ${i + 1}: ${lines[i]}`);
    
    const row = lines[i].split(',').map(cell => cell.trim());
    const rowData = {};
    
    headers.forEach((header, index) => {
      rowData[header] = row[index] || '';
    });
    
    console.log('🗂️ Row data:', rowData);
    
    // Check if department exists
    const department = await prisma.department.findFirst({
      where: {
        name: rowData.department.trim()
      }
    });
    
    console.log('🏢 Department lookup result:', department);
    
    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { regNo: rowData.regno }
    });
    
    console.log('🎓 Existing student check:', existingStudent ? 'EXISTS' : 'NEW');
  }
  
  console.log('\n✅ Test completed!');
}

testBulkUploadLogic().catch(console.error).finally(() => process.exit(0));
