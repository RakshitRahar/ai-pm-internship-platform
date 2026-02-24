/**
 * createTestUsers.js
 * Creates 30 test users for testing purposes.
 * Users: user1/useruser1 ... user30/useruser30
 * Usage: node createTestUsers.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const universities = [
    'MIT', 'Stanford University', 'Harvard University', 'IIT Delhi',
    'IIT Bombay', 'NIT Trichy', 'BITS Pilani', 'Delhi University',
    'Pune University', 'VIT University'
];

const degrees = ['B.Tech', 'B.Sc', 'B.E', 'M.Tech', 'MBA', 'B.Com'];
const majors = [
    'Computer Science', 'Data Science', 'Artificial Intelligence',
    'Information Technology', 'Electronics', 'Mechanical Engineering',
    'Business Administration', 'Mathematics', 'Statistics', 'Cyber Security'
];
const skillSets = [
    ['Python', 'Machine Learning', 'TensorFlow'],
    ['JavaScript', 'React', 'Node.js'],
    ['Java', 'Spring Boot', 'MySQL'],
    ['Data Analysis', 'SQL', 'Power BI'],
    ['C++', 'Algorithms', 'Data Structures'],
    ['Python', 'Django', 'PostgreSQL'],
    ['AWS', 'Docker', 'Kubernetes'],
    ['UI/UX Design', 'Figma', 'Adobe XD'],
    ['MongoDB', 'Express', 'Vue.js'],
    ['Deep Learning', 'NLP', 'PyTorch'],
];

async function createTestUsers() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected!\n');

        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');

        let created = 0;
        let skipped = 0;

        for (let i = 1; i <= 30; i++) {
            const email = `user${i}@test.com`;
            const password = `useruser${i}`;

            // Check if user already exists
            const existing = await usersCollection.findOne({ email });
            if (existing) {
                console.log(`⚠️  user${i} already exists — skipping`);
                skipped++;
                continue;
            }

            const hashedPassword = await bcrypt.hash(password, 12);

            const uniIndex = (i - 1) % universities.length;
            const degreeIndex = (i - 1) % degrees.length;
            const majorIndex = (i - 1) % majors.length;
            const skillIndex = (i - 1) % skillSets.length;
            const cgpa = parseFloat((6.5 + ((i % 35) * 0.1)).toFixed(1));

            await usersCollection.insertOne({
                firstName: `User`,
                lastName: `${i}`,
                email,
                password: hashedPassword,
                role: 'student',
                isActive: true,
                isEmailVerified: true,
                university: universities[uniIndex],
                degree: degrees[degreeIndex],
                major: majors[majorIndex],
                graduationYear: 2024 + (i % 3),
                cgpa: Math.min(cgpa, 10),
                skills: skillSets[skillIndex],
                bio: `Test user ${i} for platform testing. Passionate about technology and innovation.`,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            console.log(`✅ Created: user${i} | Email: ${email} | Password: ${password}`);
            created++;
        }

        console.log('\n─────────────────────────────────────────────────────');
        console.log(`  ✅ Done! Created: ${created} users | Skipped: ${skipped} users`);
        console.log('─────────────────────────────────────────────────────');
        console.log('\n📋 Login Credentials Summary:');
        console.log('  Username format : user{N}@test.com');
        console.log('  Password format : useruser{N}');
        console.log('  Example         : user1@test.com / useruser1');
        console.log('  Range           : user1 → user30');
        console.log('─────────────────────────────────────────────────────\n');

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

createTestUsers();
