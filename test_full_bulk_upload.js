// Simulate bulk upload request
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function simulateBulkUpload() {
  console.log('🧪 Simulating bulk upload request...');
  
  // Get a lecturer user and course
  const user = await prisma.user.findFirst({
    where: { role: 'LECTURER' }
  });
  
  const course = await prisma.course.findUnique({
    where: { id: 3 } // CSC301
  });
  
  console.log('👤 User:', user.email);
  console.log('📚 Course:', course.code);
  
  // Read the CSV file
  const csvContent = fs.readFileSync('/Users/maintenance/Documents/ScoreFlow/test_upload.csv', 'utf8');
  
  // Simulate the bulk upload logic
  const lines = csvContent.split('\n').map(line => line.trim()).filter(line => line);
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  const results = {
    success: 0,
    errors: []
  };
  
  // Process each row (same logic as the server)
  for (let i = 1; i < lines.length; i++) {
    console.log(`\n🔄 Processing row ${i + 1}: ${lines[i]}`);
    
    const row = lines[i].split(',').map(cell => cell.trim());
    const rowData = {};
    
    headers.forEach((header, index) => {
      rowData[header] = row[index] || '';
    });
    
    try {
      // Validate required fields
      if (!rowData.name || !rowData.regno || !rowData.level || !rowData.department) {
        const error = `Row ${i + 1}: Missing required fields`;
        console.log('❌', error);
        results.errors.push(error);
        continue;
      }
      
      // Parse level
      const level = parseInt(rowData.level);
      if (isNaN(level) || level < 100 || level > 800) {
        const error = `Row ${i + 1}: Invalid level: ${rowData.level}`;
        console.log('❌', error);
        results.errors.push(error);
        continue;
      }
      
      // Find department
      const department = await prisma.department.findFirst({
        where: { name: rowData.department.trim() }
      });
      
      if (!department) {
        const error = `Row ${i + 1}: Department not found: ${rowData.department}`;
        console.log('❌', error);
        results.errors.push(error);
        continue;
      }
      
      // Parse score
      let score = null;
      if (rowData.score && rowData.score.trim() !== '') {
        score = parseFloat(rowData.score);
        if (isNaN(score) || score < 0 || score > 30) {
          const error = `Row ${i + 1}: Invalid score: ${rowData.score}`;
          console.log('❌', error);
          results.errors.push(error);
          continue;
        }
      }
      
      // Parse status
      const status = rowData.status?.toUpperCase() === 'INACTIVE' ? false : true;
      
      // Check if student exists
      const existingStudent = await prisma.student.findUnique({
        where: { regNo: rowData.regno }
      });
      
      if (existingStudent) {
        const error = `Row ${i + 1}: Student already exists: ${rowData.regno}`;
        console.log('❌', error);
        results.errors.push(error);
        continue;
      }
      
      console.log('✅ Creating student:', rowData.name);
      
      // Create student
      const newStudent = await prisma.student.create({
        data: {
          name: rowData.name,
          regNo: rowData.regno,
          departmentId: department.id,
          level: level,
          activeStatus: status
        }
      });
      
      console.log('✅ Student created with ID:', newStudent.id);
      
      // Add score if provided
      if (score !== null) {
        console.log('✅ Adding score:', score);
        await prisma.cAScore.create({
          data: {
            courseId: course.id,
            studentId: newStudent.id,
            score: score,
            submittedBy: user.id,
            isSubmitted: false
          }
        });
        console.log('✅ Score added');
      }
      
      results.success++;
      console.log('✅ Row processed successfully');
      
    } catch (err) {
      console.error(`❌ Error processing row ${i + 1}:`, err);
      results.errors.push(`Row ${i + 1}: ${err.message}`);
    }
  }
  
  console.log('\n📊 Final results:', results);
  
  // Verify students were created
  console.log('\n🔍 Verifying students were created...');
  const createdStudents = await prisma.student.findMany({
    where: {
      regNo: {
        in: ['TEST/2024/001', 'TEST/2024/002']
      }
    },
    include: {
      department: true,
      caScores: true
    }
  });
  
  console.log('🎓 Created students:');
  createdStudents.forEach(s => {
    console.log(`  - ${s.name} (${s.regNo}) - ${s.department.name} Level ${s.level}`);
    console.log(`    Scores: ${s.caScores.length}`);
  });
  
  console.log('\n✅ Simulation completed!');
}

simulateBulkUpload().catch(console.error).finally(() => process.exit(0));
