/**
 * ============================================================
 *  PM Internship — Seed 40 Students with Applications & CVs
 * ============================================================
 *  Creates 40 realistic student accounts, AI analysis records,
 *  and applications spread across all internships.
 *
 *  Usage (from /server folder):
 *    node seedStudents.js
 * ============================================================
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ─── Connect ──────────────────────────────────────────────────────────────────
async function connect() {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected!\n');
}

// ─── Student Data ─────────────────────────────────────────────────────────────
const STUDENTS = [
    { firstName: 'Aarav', lastName: 'Sharma', email: 'aarav.sharma@example.com', university: 'IIT Delhi', degree: 'B.Tech', major: 'Computer Science', graduationYear: 2025, skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Git', 'React'], cgpa: 8.9 },
    { firstName: 'Priya', lastName: 'Patel', email: 'priya.patel@example.com', university: 'IIT Bombay', degree: 'B.Tech', major: 'Data Science & AI', graduationYear: 2025, skills: ['Python', 'SQL', 'Tableau', 'Power BI', 'Statistics', 'Pandas'], cgpa: 8.5 },
    { firstName: 'Rohan', lastName: 'Gupta', email: 'rohan.gupta@example.com', university: 'VIT Vellore', degree: 'B.Tech', major: 'Information Technology', graduationYear: 2025, skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'HTML', 'CSS'], cgpa: 7.8 },
    { firstName: 'Sneha', lastName: 'Reddy', email: 'sneha.reddy@example.com', university: 'Osmania University', degree: 'M.Sc.', major: 'Statistics', graduationYear: 2025, skills: ['R', 'Python', 'Statistics', 'SQL', 'Excel', 'SPSS'], cgpa: 8.2 },
    { firstName: 'Karan', lastName: 'Mehta', email: 'karan.mehta@example.com', university: 'IIM Ahmedabad', degree: 'MBA', major: 'Finance', graduationYear: 2025, skills: ['Finance', 'Excel', 'Power BI', 'Data Analysis', 'Risk Management'], cgpa: 8.7 },
    { firstName: 'Ananya', lastName: 'Singh', email: 'ananya.singh@example.com', university: 'Delhi University', degree: 'B.A.', major: 'Economics', graduationYear: 2025, skills: ['Economics', 'Excel', 'Research', 'SQL', 'Python', 'Statistics'], cgpa: 7.6 },
    { firstName: 'Vikram', lastName: 'Kumar', email: 'vikram.kumar@example.com', university: 'NIT Trichy', degree: 'B.E.', major: 'Mechanical Engineering', graduationYear: 2025, skills: ['AutoCAD', 'SolidWorks', 'MATLAB', 'Mechanical Engineering', 'CAD'], cgpa: 8.0 },
    { firstName: 'Pooja', lastName: 'Nair', email: 'pooja.nair@example.com', university: 'Amrita University', degree: 'B.Tech', major: 'Electronics & Communication', graduationYear: 2025, skills: ['Networking', 'Linux', 'Python', 'Electronics', 'IoT'], cgpa: 7.9 },
    { firstName: 'Arjun', lastName: 'Verma', email: 'arjun.verma@example.com', university: 'BITS Pilani', degree: 'B.Tech', major: 'Computer Science', graduationYear: 2025, skills: ['Java', 'Python', 'SQL', 'Spring Boot', 'AWS', 'Docker'], cgpa: 9.1 },
    { firstName: 'Divya', lastName: 'Krishnan', email: 'divya.krishnan@example.com', university: 'Anna University', degree: 'B.E.', major: 'Electrical Engineering', graduationYear: 2025, skills: ['MATLAB', 'AutoCAD', 'Electrical Engineering', 'Power Systems', 'Python'], cgpa: 8.1 },
    { firstName: 'Rahul', lastName: 'Joshi', email: 'rahul.joshi@example.com', university: 'IIT Kanpur', degree: 'B.Tech', major: 'Data Science & AI', graduationYear: 2025, skills: ['Python', 'Deep Learning', 'PyTorch', 'NLP', 'Computer Vision'], cgpa: 9.3 },
    { firstName: 'Meera', lastName: 'Pillai', email: 'meera.pillai@example.com', university: 'Cochin University', degree: 'M.Tech', major: 'Computer Science', graduationYear: 2025, skills: ['Machine Learning', 'Python', 'SQL', 'Data Analysis', 'TensorFlow'], cgpa: 8.6 },
    { firstName: 'Aditya', lastName: 'Rao', email: 'aditya.rao@example.com', university: 'IIT Hyderabad', degree: 'B.Tech', major: 'Computer Science', graduationYear: 2026, skills: ['C++', 'Python', 'Data Structures', 'Algorithms', 'Competitive Programming'], cgpa: 9.0 },
    { firstName: 'Kavya', lastName: 'Iyer', email: 'kavya.iyer@example.com', university: 'NIT Surathkal', degree: 'B.E.', major: 'Computer Science', graduationYear: 2025, skills: ['JavaScript', 'React', 'TypeScript', 'Node.js', 'GraphQL', 'REST APIs'], cgpa: 8.4 },
    { firstName: 'Siddharth', lastName: 'Malhotra', email: 'siddharth.m@example.com', university: 'Chandigarh University', degree: 'B.Tech', major: 'Information Technology', graduationYear: 2025, skills: ['Cybersecurity', 'Networking', 'Linux', 'Ethical Hacking', 'Python'], cgpa: 7.7 },
    { firstName: 'Ritika', lastName: 'Saxena', email: 'ritika.saxena@example.com', university: 'Pune University', degree: 'MBA', major: 'Marketing', graduationYear: 2025, skills: ['Digital Marketing', 'Google Analytics', 'Excel', 'SEO', 'Content Marketing'], cgpa: 8.0 },
    { firstName: 'Nikhil', lastName: 'Shah', email: 'nikhil.shah@example.com', university: 'IIT Madras', degree: 'B.Tech', major: 'Electrical Engineering', graduationYear: 2025, skills: ['Power Systems', 'MATLAB', 'Electrical Engineering', 'Python', 'Circuit Design'], cgpa: 8.8 },
    { firstName: 'Isha', lastName: 'Choudhary', email: 'isha.choudhary@example.com', university: 'LPU Phagwara', degree: 'B.Tech', major: 'Computer Science', graduationYear: 2026, skills: ['Python', 'SQL', 'Data Analysis', 'Excel', 'PowerPoint', 'Agile'], cgpa: 7.5 },
    { firstName: 'Pranav', lastName: 'Bhat', email: 'pranav.bhat@example.com', university: 'Manipal University', degree: 'B.Tech', major: 'Computer Science', graduationYear: 2025, skills: ['AWS', 'Docker', 'Kubernetes', 'Python', 'Terraform', 'Linux'], cgpa: 8.3 },
    { firstName: 'Shreya', lastName: 'Desai', email: 'shreya.desai@example.com', university: 'NMIMS Mumbai', degree: 'MBA', major: 'Finance', graduationYear: 2025, skills: ['Financial Modeling', 'Excel', 'Power BI', 'SQL', 'Risk Management', 'Accounting'], cgpa: 8.7 },
    { firstName: 'Rishabh', lastName: 'Tiwari', email: 'rishabh.tiwari@example.com', university: 'BHU Varanasi', degree: 'B.Tech', major: 'Mechanical Engineering', graduationYear: 2025, skills: ['SolidWorks', 'CATIA', 'AutoCAD', 'Mechanical Engineering', 'MATLAB', 'Six Sigma'], cgpa: 7.6 },
    { firstName: 'Lakshmi', lastName: 'Venkat', email: 'lakshmi.v@example.com', university: 'VIT Chennai', degree: 'B.Tech', major: 'Electronics & Communication', graduationYear: 2025, skills: ['IoT', 'Embedded Systems', 'Python', 'Arduino', 'Networking', 'C++'], cgpa: 8.1 },
    { firstName: 'Yash', lastName: 'Agarwal', email: 'yash.agarwal@example.com', university: 'IIT Roorkee', degree: 'B.Tech', major: 'Civil Engineering', graduationYear: 2025, skills: ['AutoCAD', 'Revit', 'STAAD Pro', 'Civil Engineering', 'BIM', 'MS Project'], cgpa: 8.5 },
    { firstName: 'Nisha', lastName: 'Banerjee', email: 'nisha.banerjee@example.com', university: 'Jadavpur University', degree: 'B.E.', major: 'Computer Science', graduationYear: 2025, skills: ['Python', 'Machine Learning', 'Scikit-learn', 'SQL', 'Pandas', 'NumPy'], cgpa: 8.9 },
    { firstName: 'Gaurav', lastName: 'Pandey', email: 'gaurav.pandey@example.com', university: 'DTU Delhi', degree: 'B.Tech', major: 'Computer Science', graduationYear: 2025, skills: ['Web Development', 'React', 'Django', 'Python', 'SQL', 'REST APIs'], cgpa: 7.8 },
    { firstName: 'Tanvi', lastName: 'Kulkarni', email: 'tanvi.kulkarni@example.com', university: 'Symbiosis Pune', degree: 'MBA', major: 'Marketing', graduationYear: 2025, skills: ['Digital Marketing', 'SEO', 'Social Media', 'Content Strategy', 'Analytics'], cgpa: 8.2 },
    { firstName: 'Abhishek', lastName: 'Mishra', email: 'abhishek.m@example.com', university: 'NIT Warangal', degree: 'B.Tech', major: 'Computer Science', graduationYear: 2025, skills: ['Java', 'Spring Boot', 'Microservices', 'AWS', 'SQL', 'Docker'], cgpa: 8.6 },
    { firstName: 'Riya', lastName: 'Sinha', email: 'riya.sinha@example.com', university: 'IIT Gandhinagar', degree: 'B.Tech', major: 'Data Science & AI', graduationYear: 2026, skills: ['Python', 'R', 'Statistics', 'Machine Learning', 'SQL', 'Big Data'], cgpa: 8.7 },
    { firstName: 'Harsh', lastName: 'Srivastava', email: 'harsh.s@example.com', university: 'Amity University', degree: 'B.Tech', major: 'Information Technology', graduationYear: 2025, skills: ['Cybersecurity', 'Network Security', 'Linux', 'Python', 'Wireshark', 'CEH'], cgpa: 7.4 },
    { firstName: 'Priyanka', lastName: 'Ghosh', email: 'priyanka.g@example.com', university: 'Calcutta University', degree: 'M.Sc.', major: 'Computer Science', graduationYear: 2025, skills: ['Python', 'SQL', 'Data Analysis', 'Machine Learning', 'Statistics', 'Tableau'], cgpa: 8.3 },
    { firstName: 'Deepak', lastName: 'Yadav', email: 'deepak.yadav@example.com', university: 'IIT Kharagpur', degree: 'B.Tech', major: 'Mechanical Engineering', graduationYear: 2025, skills: ['CAD', 'MATLAB', 'Mechanical Engineering', 'Python', 'FEA', 'Thermodynamics'], cgpa: 8.4 },
    { firstName: 'Simran', lastName: 'Kaur', email: 'simran.kaur@example.com', university: 'Panjab University', degree: 'BBA', major: 'Business Administration', graduationYear: 2025, skills: ['Excel', 'PowerPoint', 'Communication', 'Marketing', 'Research', 'SQL'], cgpa: 7.9 },
    { firstName: 'Varun', lastName: 'Menon', email: 'varun.menon@example.com', university: 'IIT Palakkad', degree: 'B.Tech', major: 'Computer Science', graduationYear: 2026, skills: ['Go', 'Python', 'Kubernetes', 'AWS', 'Microservices', 'CI/CD'], cgpa: 9.2 },
    { firstName: 'Pallavi', lastName: 'Rawat', email: 'pallavi.rawat@example.com', university: 'Graphic Era University', degree: 'B.Tech', major: 'Computer Science', graduationYear: 2025, skills: ['Python', 'SQL', 'Power BI', 'Excel', 'Data Analysis', 'Business Intelligence'], cgpa: 7.7 },
    { firstName: 'Akash', lastName: 'Dubey', email: 'akash.dubey@example.com', university: 'NIT Rourkela', degree: 'B.Tech', major: 'Electronics & Communication', graduationYear: 2025, skills: ['VLSI', 'Embedded Systems', 'C++', 'MATLAB', 'Electronics', 'IoT'], cgpa: 8.0 },
    { firstName: 'Swati', lastName: 'Jain', email: 'swati.jain@example.com', university: 'XLRI Jamshedpur', degree: 'MBA', major: 'Human Resources', graduationYear: 2025, skills: ['HR Management', 'Excel', 'Communication', 'Leadership', 'Operations'], cgpa: 8.5 },
    { firstName: 'Mohit', lastName: 'Garg', email: 'mohit.garg@example.com', university: 'IIT Indore', degree: 'B.Tech', major: 'Computer Science', graduationYear: 2025, skills: ['Blockchain', 'Solidity', 'Python', 'Web3', 'JavaScript', 'Smart Contracts'], cgpa: 8.1 },
    { firstName: 'Neha', lastName: 'Chatterjee', email: 'neha.c@example.com', university: 'IIT Bhubaneswar', degree: 'B.Tech', major: 'Electrical Engineering', graduationYear: 2025, skills: ['Power Electronics', 'MATLAB', 'Renewable Energy', 'Electrical Engineering', 'Python'], cgpa: 8.3 },
    { firstName: 'Suresh', lastName: 'Babu', email: 'suresh.babu@example.com', university: 'Anna University', degree: 'M.Tech', major: 'Computer Science', graduationYear: 2025, skills: ['Python', 'Machine Learning', 'Deep Learning', 'SQL', 'TensorFlow', 'NLP'], cgpa: 8.8 },
    { firstName: 'Falguni', lastName: 'Shah', email: 'falguni.shah@example.com', university: 'Ahmedabad University', degree: 'B.Com.', major: 'Commerce', graduationYear: 2025, skills: ['Accounting', 'Finance', 'Excel', 'Tally', 'GST', 'Financial Analysis'], cgpa: 7.6 },
];

// CV text templates per major
function generateCVText(student) {
    const { firstName, lastName, major, university, degree, skills, cgpa, graduationYear } = student;
    return `
${firstName} ${lastName}
Email: ${student.email} | Phone: +91-9${Math.floor(Math.random() * 900000000 + 100000000)}

EDUCATION
${degree} in ${major}
${university} | Expected: ${graduationYear} | CGPA: ${cgpa}/10

SKILLS
Technical: ${skills.join(', ')}
Soft Skills: Communication, Problem Solving, Teamwork, Leadership, Time Management

PROJECTS
1. ${major} Final Year Project
   - Developed a comprehensive ${major.toLowerCase()} solution
   - Technologies: ${skills.slice(0, 3).join(', ')}
   - Achieved 95% accuracy / efficiency

2. Mini Project: Smart ${major.split(' ')[0]} System
   - Built using ${skills.slice(1, 4).join(', ')}
   - Deployed and presented at college tech fest

EXPERIENCE
Internship Trainee — ${university} Research Lab (Summer ${graduationYear - 1})
- Worked on ${major} related research projects
- Assisted faculty in data collection and analysis
- Presented findings to department

CERTIFICATIONS
- ${skills[0]} Certification — Coursera / NPTEL
- ${skills[1]} Foundation Course — Online Platform
- ${major} Professional Certificate

ACHIEVEMENTS
- Secured rank in top 10% of department
- Published paper at college technical symposium
- Winner, Hackathon ${graduationYear - 1}

LANGUAGES
English (Professional), Hindi (Native)${major.includes('Tamil') || university.includes('Anna') || university.includes('VIT') ? ', Tamil (Native)' : ''}
    `.trim();
}

// Generate realistic AI scores per skills match
function generateAIScore(student, internship) {
    const matchedSkills = student.skills.filter(s =>
        internship.requiredSkills.some(r => s.toLowerCase().includes(r.toLowerCase()) || r.toLowerCase().includes(s.toLowerCase())) ||
        (internship.preferredSkills || []).some(r => s.toLowerCase().includes(r.toLowerCase()))
    );

    const skillBase = Math.min(100, (matchedSkills.length / Math.max(internship.requiredSkills.length, 1)) * 100);
    const skillsMatch = Math.max(20, Math.min(100, Math.round(skillBase * 0.7 + student.cgpa * 3)));
    const education = Math.max(30, Math.min(100, Math.round(student.cgpa * 9 + Math.random() * 10)));
    const experience = Math.max(20, Math.min(90, Math.round(45 + Math.random() * 30)));
    const projects = Math.max(30, Math.min(100, Math.round(50 + Math.random() * 35)));
    const keywords = Math.max(20, Math.min(100, Math.round(skillBase * 0.5 + 35)));

    const overall = Math.round(
        skillsMatch * 0.35 +
        education * 0.20 +
        experience * 0.20 +
        projects * 0.15 +
        keywords * 0.10
    );

    let recommendation;
    if (overall >= 80) recommendation = 'Strongly Recommend';
    else if (overall >= 65) recommendation = 'Recommend';
    else if (overall >= 50) recommendation = 'Consider';
    else recommendation = 'Not Recommended';

    return {
        overall,
        breakdown: { skillsMatch, experience, education, projects, keywords },
        matchedSkills: matchedSkills.slice(0, 5),
        missingSkills: internship.requiredSkills.filter(r =>
            !student.skills.some(s => s.toLowerCase().includes(r.toLowerCase()))
        ).slice(0, 3),
        strengthAreas: ['Technical Background', 'Academic Performance'],
        improvementAreas: ['Industry Exposure', 'Certifications'],
        aiSummary: `${student.firstName} demonstrates ${overall >= 70 ? 'strong' : 'reasonable'} potential for this role with a CGPA of ${student.cgpa} from ${student.university}. Skills in ${matchedSkills.slice(0, 2).join(' and ')} align well with role requirements.`,
        recommendation,
        analyzedAt: new Date(),
    };
}

async function seedStudents() {
    await connect();

    const db = mongoose.connection.db;
    const usersCol = db.collection('users');
    const analysisCol = db.collection('aianalyses');
    const applicationsCol = db.collection('applications');

    // Get all open internships
    const internships = await db.collection('internships').find({ status: 'open' }).toArray();
    if (internships.length === 0) {
        console.error('❌ No open internships found. Run node seedInternships.js first.');
        process.exit(1);
    }
    console.log(`📋 Found ${internships.length} open internships\n`);

    const passwordHash = await bcrypt.hash('Student@123', 12);
    let created = 0, skipped = 0, appCreated = 0;

    for (const student of STUDENTS) {
        // Check if already exists
        const existing = await usersCol.findOne({ email: student.email });
        if (existing) {
            console.log(`⏭️  Skip: ${student.email} already exists`);
            skipped++;
            continue;
        }

        // Create user
        const userDoc = {
            firstName: student.firstName,
            lastName: student.lastName,
            email: student.email,
            password: passwordHash,
            role: 'student',
            university: student.university,
            degree: student.degree,
            major: student.major,
            graduationYear: student.graduationYear,
            cgpa: student.cgpa,
            skills: student.skills,
            isActive: true,
            isEmailVerified: true,
            cv: {
                filename: `cv_${student.firstName.toLowerCase()}_${student.lastName.toLowerCase()}.txt`,
                originalName: `${student.firstName}_${student.lastName}_CV.pdf`,
                path: `./uploads/cv_${student.firstName.toLowerCase()}.txt`,
                mimetype: 'application/pdf',
                size: Math.floor(Math.random() * 200000 + 50000),
                uploadedAt: new Date(),
            },
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const userResult = await usersCol.insertOne(userDoc);
        const userId = userResult.insertedId;
        created++;

        // Create AI analysis
        const cvText = generateCVText(student);
        await analysisCol.insertOne({
            user: userId,
            cvFilename: userDoc.cv.filename,
            rawText: cvText,
            extractedData: {
                technicalSkills: student.skills,
                softSkills: ['Communication', 'Problem Solving', 'Teamwork', 'Leadership'],
                tools: student.skills.filter(s => ['Git', 'Jira', 'Figma', 'Excel', 'Docker', 'Tableau', 'Power BI'].includes(s)),
                languages: student.skills.filter(s => ['Python', 'JavaScript', 'Java', 'C++', 'TypeScript', 'R', 'Go'].includes(s)),
                frameworks: student.skills.filter(s => ['React', 'Angular', 'Django', 'Flask', 'Node.js', 'Spring Boot'].includes(s)),
                databases: student.skills.filter(s => ['MongoDB', 'MySQL', 'PostgreSQL', 'SQL'].includes(s)),
                cloudPlatforms: student.skills.filter(s => ['AWS', 'Azure', 'GCP'].includes(s)),
                education: [{ degree: student.degree, major: student.major, institution: student.university, cgpa: student.cgpa }],
                experience: [{ role: 'Lab Research Intern', company: `${student.university} Research Lab`, duration: '2 months' }],
                projects: [
                    { name: `${student.major} Final Year Project`, technologies: student.skills.slice(0, 3) },
                    { name: 'Mini Project', technologies: student.skills.slice(1, 4) },
                ],
                certifications: [`${student.skills[0]} Certification`, `${student.skills[1]} Course`],
                totalExperienceYears: 0,
                industryDomains: [student.major],
                keyStrengths: student.skills.slice(0, 4),
                careerLevel: 'Fresher',
                cvQualityScore: Math.round(student.cgpa * 8 + 15),
                cvFeedback: ['Add more internship experience', 'Include GitHub profile link'],
            },
            aiModel: 'local-fallback',
            tokensUsed: 0,
            processingTimeMs: 120,
            cvQualityScore: Math.round(student.cgpa * 8 + 15),
            cvFeedback: ['Quantify achievements', 'Add portfolio links'],
            lastAnalyzedAt: new Date(),
            analysisVersion: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // Apply to 2–4 random internships per student
        const numApps = Math.floor(Math.random() * 3) + 2;
        const shuffled = [...internships].sort(() => Math.random() - 0.5).slice(0, numApps);

        for (const internship of shuffled) {
            // Check for duplicate
            const dupApp = await applicationsCol.findOne({ student: userId, internship: internship._id });
            if (dupApp) continue;

            const aiScore = generateAIScore(student, internship);
            const status = aiScore.overall >= 60 ? 'ai_analyzed' : 'pending';

            await applicationsCol.insertOne({
                student: userId,
                internship: internship._id,
                coverLetter: `I am ${student.firstName} ${student.lastName}, a ${student.degree} student in ${student.major} from ${student.university} with a CGPA of ${student.cgpa}. My expertise in ${student.skills.slice(0, 3).join(', ')} makes me a strong fit for this role. I am eager to contribute to your team and grow professionally through this PM Internship Scheme opportunity.`,
                cvSnapshot: userDoc.cv,
                aiScore,
                status,
                rank: null,
                statusHistory: [
                    { status: 'pending', changedAt: new Date(Date.now() - 86400000 * Math.floor(Math.random() * 10)) },
                    ...(status === 'ai_analyzed' ? [{ status: 'ai_analyzed', changedAt: new Date() }] : []),
                ],
                createdAt: new Date(Date.now() - 86400000 * Math.floor(Math.random() * 14)),
                updatedAt: new Date(),
            });
            appCreated++;
        }

        console.log(`✅ Created: ${student.firstName} ${student.lastName} (${student.email}) — ${shuffled.length} applications`);
    }

    // Now compute rankings for all internships
    console.log('\n📊 Computing rankings for all internships...');
    for (const internship of internships) {
        const scored = await applicationsCol
            .find({ internship: internship._id, status: 'ai_analyzed', 'aiScore.overall': { $ne: null } })
            .sort({ 'aiScore.overall': -1 })
            .toArray();

        const bulkOps = scored.map((app, i) => ({
            updateOne: { filter: { _id: app._id }, update: { $set: { rank: i + 1 } } }
        }));
        if (bulkOps.length > 0) await applicationsCol.bulkWrite(bulkOps);
        console.log(`   ✓ ${internship.title} — ranked ${scored.length} candidates`);
    }

    console.log(`
╔══════════════════════════════════════════════════════════╗
║       ✅  Students Seed — COMPLETE!                      ║
╠══════════════════════════════════════════════════════════╣
║  👤 Students created : ${String(created).padEnd(34)}║
║  ⏭️  Students skipped : ${String(skipped).padEnd(34)}║
║  📝 Applications     : ${String(appCreated).padEnd(34)}║
╠══════════════════════════════════════════════════════════╣
║  🔑 All student passwords : Student@123                  ║
║  🌐 Admin panel: http://localhost:5173/admin             ║
╚══════════════════════════════════════════════════════════╝
`);

    await mongoose.disconnect();
    process.exit(0);
}

seedStudents().catch(err => {
    console.error('❌ Seed Error:', err.message);
    console.error(err.stack);
    process.exit(1);
});
