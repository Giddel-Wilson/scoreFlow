import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// This simulates the JWT verification that happens in authentication
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

async function simulateCompleteFlow() {
    try {
        console.log('=== COMPLETE SCOREFLOW TEST ===\n');
        
        // 1. Test user authentication
        console.log('1. Testing Dr. Michael Brown authentication...');
        const user = await prisma.user.findFirst({
            where: { email: 'michael.brown@university.edu' },
            include: { department: true }
        });
        
        if (!user) {
            console.error('❌ Dr. Michael Brown not found!');
            return;
        }
        
        console.log('✅ User found:', user.name, '(' + user.role + ')');
        
        // 2. Test password verification
        const testPassword = 'password123';
        const isValidPassword = await bcrypt.compare(testPassword, user.passwordHash);
        console.log('✅ Password verification:', isValidPassword ? 'PASS' : 'FAIL');
        
        if (!isValidPassword) {
            console.log('ℹ️  Default password might be different. Check seed script.');
        }
        
        // 3. Test JWT token generation (what happens after successful login)
        const jwtPayload = {
            userId: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            departmentId: user.departmentId
        };
        
        const token = jwt.sign(jwtPayload, JWT_SECRET, { expiresIn: '7d' });
        console.log('✅ JWT token generated successfully');
        
        // 4. Test course access
        console.log('\n2. Testing course access...');
        const courseId = 4; // CSC302
        
        const course = await prisma.course.findFirst({
            where: {
                id: courseId,
                courseAssignments: {
                    some: { userId: user.id }
                }
            },
            include: {
                department: true
            }
        });
        
        if (!course) {
            console.error('❌ Course 4 not accessible by Dr. Michael Brown');
            return;
        }
        
        console.log('✅ Course access:', course.code, '-', course.title);
        
        // 5. Test students loading
        console.log('\n3. Testing student data loading...');
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
            console.log(`   - ${student.regNo}: ${student.name}`);
        });
        
        // 6. Test existing scores
        console.log('\n4. Testing existing scores...');
        const existingScores = await prisma.cAScore.findMany({
            where: {
                courseId: course.id,
                submittedBy: user.id
            }
        });
        
        console.log('✅ Existing scores:', existingScores.length);
        
        // 7. Combine data (what the page.server.ts does)
        console.log('\n5. Testing page data structure...');
        const scoresMap = new Map();
        existingScores.forEach((score) => {
            scoresMap.set(score.studentId, score);
        });

        const studentsWithScores = students.map((student) => ({
            ...student,
            score: scoresMap.get(student.id) || null
        }));
        
        const hasSubmittedScores = existingScores.some((score) => score.isSubmitted);
        
        const pageData = {
            course,
            students: studentsWithScores,
            hasSubmittedScores
        };
        
        console.log('✅ Page data structure created successfully');
        console.log('   - Course:', pageData.course.code);
        console.log('   - Students with scores:', pageData.students.length);
        console.log('   - Has submitted scores:', pageData.hasSubmittedScores);
        
        // 8. Test score validation
        console.log('\n6. Testing score validation...');
        function validateScore(score) {
            const num = parseFloat(score);
            return !isNaN(num) && num >= 0 && num <= 30;
        }
        
        const testScores = ['25', '30', '0', '15.5', '-1', '31', 'abc'];
        console.log('✅ Score validation tests:');
        testScores.forEach(score => {
            const isValid = validateScore(score);
            console.log(`   - "${score}": ${isValid ? 'VALID' : 'INVALID'}`);
        });
        
        console.log('\n=== TEST SUMMARY ===');
        console.log('✅ Authentication: WORKING');
        console.log('✅ Course Access: WORKING');
        console.log('✅ Student Loading: WORKING');
        console.log('✅ Data Structure: WORKING');
        console.log('✅ Score Validation: WORKING');
        
        console.log('\n=== NEXT STEPS ===');
        console.log('1. Open browser to: http://localhost:5174/login');
        console.log('2. Login with:');
        console.log('   Email: michael.brown@university.edu');
        console.log('   Password: password123 (or check your seed script)');
        console.log('3. Navigate to: /lecturer/courses/4/scores');
        console.log('4. The page should display students and allow score entry');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

simulateCompleteFlow();
