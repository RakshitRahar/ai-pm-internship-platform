/**
 * ============================================================
 *  PM Internship Scheme — Database Seed Script
 * ============================================================
 *  Seeds the database with realistic internship listings
 *  based on the actual Prime Minister's Internship Scheme 2024-25.
 *
 *  The real scheme: https://pminternship.mca.gov.in
 *  Companies from India's Top 500 offer 12-month internships
 *  with ₹5,000/month stipend (₹4,500 Govt + ₹500 Company min).
 *
 *  Usage:
 *    1. Make sure your server is NOT running (or just run this separately)
 *    2. From the /server folder:
 *          node seedInternships.js
 * ============================================================
 */

require('dotenv').config();
const mongoose = require('mongoose');

// ─── Connect ──────────────────────────────────────────────────────────────────
async function connect() {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected!\n');
}

// ─── Get Admin User (needed for createdBy field) ──────────────────────────────
async function getAdminId() {
    const admin = await mongoose.connection.db
        .collection('users')
        .findOne({ role: 'admin' });

    if (!admin) {
        console.error('❌ No admin user found!');
        console.error('   Please run: node createAdmin.js   first.\n');
        process.exit(1);
    }

    console.log(`👤 Using admin: ${admin.email}\n`);
    return admin._id;
}

// ─── PM Internship Scheme Data ────────────────────────────────────────────────
//
//  Based on real PM Internship Scheme 2024-25:
//  - 12-month duration
//  - Stipend: ₹5,000/month (standard for PM scheme)
//  - Open to students aged 21-24, pursuing final year or recently graduated
//  - Companies: India's top 500 corporations
//
function getInternshipData(adminId) {
    const now = new Date();
    const deadline = new Date(now);
    deadline.setMonth(deadline.getMonth() + 2); // 2 months from now

    const startDate = new Date(now);
    startDate.setMonth(startDate.getMonth() + 3); // starts 3 months from now

    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 12); // 12-month internship

    return [
        // ── 1. TATA MOTORS ─────────────────────────────────────────────────
        {
            title: 'Automotive Engineering Intern',
            company: 'Tata Motors Limited',
            department: 'Research & Development',
            location: 'Pune, Maharashtra',
            isRemote: false,
            description:
                'Under the PM Internship Scheme, Tata Motors offers a 12-month immersive internship in its R&D division. Interns will work on real automotive engineering challenges including vehicle dynamics, powertrain systems, and next-generation EV design. You will collaborate with experienced engineers, participate in design reviews, and contribute to live product development projects. This is a rare opportunity to gain hands-on experience at India\'s largest automobile manufacturer.',
            responsibilities: [
                'Assist in design, simulation, and testing of automotive components',
                'Work on EV battery management system modules',
                'Participate in CAD modeling using CATIA/SolidWorks',
                'Support vehicle dynamics testing and data analysis',
                'Document findings and present weekly reports to senior engineers',
            ],
            duration: { value: 12, unit: 'months' },
            stipend: { amount: 5000, currency: 'INR', isPaid: true },
            requiredSkills: ['CAD', 'Mechanical Engineering', 'AutoCAD', 'MATLAB'],
            preferredSkills: ['CATIA', 'SolidWorks', 'EV Technology', 'Python'],
            educationRequirements: {
                minDegree: 'Bachelors',
                preferredMajors: ['Mechanical Engineering', 'Automotive Engineering', 'Electrical Engineering'],
                minCgpa: 6.0,
            },
            experienceRequirements: {
                minYears: 0,
                preferredDomains: ['Automotive', 'Manufacturing', 'Design'],
            },
            keywords: ['automobile', 'EV', 'electric vehicle', 'powertrain', 'CAD', 'R&D', 'Tata', 'automotive'],
            totalSeats: 50,
            filledSeats: 0,
            applicationDeadline: deadline,
            startDate: startDate,
            endDate: endDate,
            status: 'open',
            createdBy: adminId,
            tags: ['engineering', 'automotive', 'EV', 'pm-scheme', 'manufacturing'],
        },

        // ── 2. RELIANCE INDUSTRIES ─────────────────────────────────────────
        {
            title: 'Data Analytics & Business Intelligence Intern',
            company: 'Reliance Industries Limited',
            department: 'Digital Transformation',
            location: 'Mumbai, Maharashtra',
            isRemote: false,
            description:
                'Reliance Industries, under the PM Internship Scheme, invites aspiring data professionals to join its Digital Transformation team. Interns will work on large-scale data pipelines, business intelligence dashboards, and analytics that drive decisions across Reliance\'s diverse business verticals — from Jio to Retail to Petrochemicals. This role offers unmatched exposure to enterprise-scale data infrastructure.',
            responsibilities: [
                'Build and maintain Power BI / Tableau dashboards for business units',
                'Write SQL queries to extract and analyze large datasets',
                'Support data pipeline development using Python and Spark',
                'Identify trends and prepare insights reports for management',
                'Collaborate with cross-functional teams to gather requirements',
            ],
            duration: { value: 12, unit: 'months' },
            stipend: { amount: 5000, currency: 'INR', isPaid: true },
            requiredSkills: ['Python', 'SQL', 'Data Analysis', 'Excel'],
            preferredSkills: ['Power BI', 'Tableau', 'Apache Spark', 'Machine Learning'],
            educationRequirements: {
                minDegree: 'Bachelors',
                preferredMajors: ['Computer Science', 'Statistics', 'Data Science', 'Mathematics'],
                minCgpa: 6.5,
            },
            experienceRequirements: {
                minYears: 0,
                preferredDomains: ['Data Science', 'Analytics', 'Business Intelligence'],
            },
            keywords: ['data analytics', 'business intelligence', 'Power BI', 'SQL', 'Python', 'Reliance', 'Jio'],
            totalSeats: 80,
            filledSeats: 0,
            applicationDeadline: deadline,
            startDate: startDate,
            endDate: endDate,
            status: 'open',
            createdBy: adminId,
            tags: ['data', 'analytics', 'business intelligence', 'pm-scheme', 'technology'],
        },

        // ── 3. ONGC ────────────────────────────────────────────────────────
        {
            title: 'Petroleum Engineering Intern',
            company: 'Oil and Natural Gas Corporation (ONGC)',
            department: 'Exploration & Production',
            location: 'Dehradun, Uttarakhand',
            isRemote: false,
            description:
                'ONGC, India\'s largest oil and gas company, offers a 12-month PM Internship Scheme placement in its Exploration & Production division. Interns will gain firsthand experience in petroleum reservoir analysis, drilling operations, and production optimization. You will work alongside petroleum engineers, geologists, and field experts in a dynamic energy environment.',
            responsibilities: [
                'Assist in reservoir data interpretation and analysis',
                'Support drilling operations planning using Petrel/Eclipse software',
                'Participate in wellbore stability analysis',
                'Help prepare geological maps and subsurface models',
                'Compile daily production reports and logs',
            ],
            duration: { value: 12, unit: 'months' },
            stipend: { amount: 5000, currency: 'INR', isPaid: true },
            requiredSkills: ['Petroleum Engineering', 'Geology', 'Data Analysis', 'MS Office'],
            preferredSkills: ['Petrel', 'Eclipse', 'MATLAB', 'GIS', 'Python'],
            educationRequirements: {
                minDegree: 'Bachelors',
                preferredMajors: ['Petroleum Engineering', 'Chemical Engineering', 'Geology', 'Earth Sciences'],
                minCgpa: 6.0,
            },
            experienceRequirements: {
                minYears: 0,
                preferredDomains: ['Oil & Gas', 'Energy', 'Geology'],
            },
            keywords: ['petroleum', 'oil', 'gas', 'drilling', 'reservoir', 'ONGC', 'energy', 'exploration'],
            totalSeats: 40,
            filledSeats: 0,
            applicationDeadline: deadline,
            startDate: startDate,
            endDate: endDate,
            status: 'open',
            createdBy: adminId,
            tags: ['energy', 'petroleum', 'engineering', 'pm-scheme', 'oil-gas'],
        },

        // ── 4. INFOSYS ─────────────────────────────────────────────────────
        {
            title: 'Software Development Intern (Full Stack)',
            company: 'Infosys Limited',
            department: 'Technology & Innovation',
            location: 'Bengaluru, Karnataka',
            isRemote: false,
            description:
                'Infosys, as part of the PM Internship Scheme, provides a transformative 12-month internship experience in software development. Interns will join agile development teams building enterprise-grade applications for global clients. You will write production-quality code, participate in sprint planning, and learn software engineering best practices from world-class mentors at India\'s second-largest IT company.',
            responsibilities: [
                'Develop and maintain web applications using React.js and Node.js',
                'Write clean, tested, and well-documented code',
                'Participate in daily standups and sprint ceremonies',
                'Contribute to code reviews and technical discussions',
                'Integrate REST APIs and work with databases (MySQL, MongoDB)',
            ],
            duration: { value: 12, unit: 'months' },
            stipend: { amount: 5000, currency: 'INR', isPaid: true },
            requiredSkills: ['JavaScript', 'HTML', 'CSS', 'Python or Java'],
            preferredSkills: ['React.js', 'Node.js', 'MongoDB', 'REST APIs', 'Git'],
            educationRequirements: {
                minDegree: 'Bachelors',
                preferredMajors: ['Computer Science', 'Information Technology', 'Software Engineering'],
                minCgpa: 6.5,
            },
            experienceRequirements: {
                minYears: 0,
                preferredDomains: ['Software Development', 'Web Development', 'IT'],
            },
            keywords: ['software', 'full stack', 'React', 'Node.js', 'JavaScript', 'Infosys', 'IT', 'development'],
            totalSeats: 120,
            filledSeats: 0,
            applicationDeadline: deadline,
            startDate: startDate,
            endDate: endDate,
            status: 'open',
            createdBy: adminId,
            tags: ['software', 'full-stack', 'IT', 'pm-scheme', 'web-development'],
        },

        // ── 5. L&T (LARSEN & TOUBRO) ───────────────────────────────────────
        {
            title: 'Civil & Structural Engineering Intern',
            company: 'Larsen & Toubro Limited (L&T)',
            department: 'Infrastructure Projects',
            location: 'Chennai, Tamil Nadu',
            isRemote: false,
            description:
                'L&T, India\'s engineering giant, offers a 12-month PM Internship in its Infrastructure division. Interns will work on live construction projects — highways, bridges, metro systems, and smart city initiatives. You will gain real-world exposure to project management, structural design, and site coordination under India\'s best civil engineers.',
            responsibilities: [
                'Assist site engineers in monitoring construction progress',
                'Prepare AutoCAD drawings and structural sketches',
                'Conduct quality checks and material testing',
                'Manage daily site logs and progress reports',
                'Coordinate with contractors and sub-contractors on-site',
            ],
            duration: { value: 12, unit: 'months' },
            stipend: { amount: 5000, currency: 'INR', isPaid: true },
            requiredSkills: ['Civil Engineering', 'AutoCAD', 'Structural Analysis', 'MS Project'],
            preferredSkills: ['STAAD Pro', 'Revit', 'Site Management', 'GIS', 'BIM'],
            educationRequirements: {
                minDegree: 'Bachelors',
                preferredMajors: ['Civil Engineering', 'Structural Engineering', 'Construction Management'],
                minCgpa: 6.0,
            },
            experienceRequirements: {
                minYears: 0,
                preferredDomains: ['Construction', 'Infrastructure', 'Civil Engineering'],
            },
            keywords: ['civil', 'structural', 'construction', 'AutoCAD', 'bridge', 'highway', 'L&T', 'infrastructure'],
            totalSeats: 60,
            filledSeats: 0,
            applicationDeadline: deadline,
            startDate: startDate,
            endDate: endDate,
            status: 'open',
            createdBy: adminId,
            tags: ['civil', 'infrastructure', 'construction', 'pm-scheme', 'engineering'],
        },

        // ── 6. MAHINDRA & MAHINDRA ─────────────────────────────────────────
        {
            title: 'AI & Machine Learning Intern',
            company: 'Mahindra & Mahindra Limited',
            department: 'Digital Innovation Lab',
            location: 'Mumbai, Maharashtra',
            isRemote: false,
            description:
                'Mahindra\'s Digital Innovation Lab, under the PM Internship Scheme, is looking for passionate AI/ML enthusiasts. Interns will work on cutting-edge AI projects in agriculture tech (FarmEase), electric mobility, and customer analytics. You will develop and deploy machine learning models that directly impact Mahindra\'s digital products used by millions.',
            responsibilities: [
                'Build and train ML models for classification and prediction tasks',
                'Work with NLP models for customer sentiment analysis',
                'Develop computer vision solutions for quality inspection',
                'Use Python, TensorFlow/PyTorch for model development',
                'Present model performance metrics and insights to the team',
            ],
            duration: { value: 12, unit: 'months' },
            stipend: { amount: 5000, currency: 'INR', isPaid: true },
            requiredSkills: ['Python', 'Machine Learning', 'Data Analysis', 'Statistics'],
            preferredSkills: ['TensorFlow', 'PyTorch', 'NLP', 'Computer Vision', 'Deep Learning', 'scikit-learn'],
            educationRequirements: {
                minDegree: 'Bachelors',
                preferredMajors: ['Computer Science', 'Artificial Intelligence', 'Data Science', 'Mathematics'],
                minCgpa: 7.0,
            },
            experienceRequirements: {
                minYears: 0,
                preferredDomains: ['Machine Learning', 'AI', 'Data Science'],
            },
            keywords: ['AI', 'machine learning', 'deep learning', 'Python', 'NLP', 'computer vision', 'Mahindra'],
            totalSeats: 35,
            filledSeats: 0,
            applicationDeadline: deadline,
            startDate: startDate,
            endDate: endDate,
            status: 'open',
            createdBy: adminId,
            tags: ['AI', 'machine-learning', 'data-science', 'pm-scheme', 'technology'],
        },

        // ── 7. STATE BANK OF INDIA (SBI) ───────────────────────────────────
        {
            title: 'FinTech & Digital Banking Intern',
            company: 'State Bank of India (SBI)',
            department: 'Digital Banking & IT',
            location: 'Mumbai, Maharashtra',
            isRemote: false,
            description:
                'SBI, India\'s largest public sector bank, invites students under the PM Internship Scheme to join its Digital Banking division. You will experience how India\'s financial backbone is being digitally transformed — from UPI systems to AI-driven loan processing and cybersecurity. This role gives you rare access to the inner workings of enterprise-scale banking technology.',
            responsibilities: [
                'Support development and testing of digital banking features',
                'Assist in data analysis for fraud detection models',
                'Help document and test core banking APIs',
                'Contribute to cybersecurity compliance reviews',
                'Prepare reports on digital transaction trends',
            ],
            duration: { value: 12, unit: 'months' },
            stipend: { amount: 5000, currency: 'INR', isPaid: true },
            requiredSkills: ['Finance', 'Data Analysis', 'SQL', 'Excel'],
            preferredSkills: ['Python', 'Power BI', 'Banking Domain', 'Cybersecurity', 'Java'],
            educationRequirements: {
                minDegree: 'Bachelors',
                preferredMajors: ['Computer Science', 'Finance', 'Commerce', 'Economics', 'Banking'],
                minCgpa: 6.0,
            },
            experienceRequirements: {
                minYears: 0,
                preferredDomains: ['Banking', 'Finance', 'FinTech'],
            },
            keywords: ['banking', 'fintech', 'digital banking', 'UPI', 'finance', 'SBI', 'cybersecurity'],
            totalSeats: 70,
            filledSeats: 0,
            applicationDeadline: deadline,
            startDate: startDate,
            endDate: endDate,
            status: 'open',
            createdBy: adminId,
            tags: ['banking', 'fintech', 'finance', 'pm-scheme', 'digital'],
        },

        // ── 8. WIPRO ───────────────────────────────────────────────────────
        {
            title: 'Cybersecurity Analyst Intern',
            company: 'Wipro Limited',
            department: 'Cybersecurity & Risk Services',
            location: 'Bengaluru, Karnataka',
            isRemote: false,
            description:
                'Wipro\'s Cybersecurity division, as part of the PM Internship Scheme, is offering an intensive 12-month internship for aspiring security professionals. Interns will work on real client engagements involving threat detection, vulnerability assessment, and security incident response. You will gain hands-on experience with industry-standard security tools like SIEM, IDS/IPS, and penetration testing frameworks.',
            responsibilities: [
                'Monitor security alerts using SIEM tools (Splunk / Microsoft Sentinel)',
                'Perform vulnerability scans and assist in penetration testing',
                'Analyse security logs and prepare incident reports',
                'Help with compliance checks (ISO 27001, GDPR, SOC 2)',
                'Document security processes and runbooks',
            ],
            duration: { value: 12, unit: 'months' },
            stipend: { amount: 5000, currency: 'INR', isPaid: true },
            requiredSkills: ['Networking', 'Linux', 'Cybersecurity Fundamentals', 'Python'],
            preferredSkills: ['Ethical Hacking', 'Splunk', 'Wireshark', 'CEH', 'SIEM', 'Penetration Testing'],
            educationRequirements: {
                minDegree: 'Bachelors',
                preferredMajors: ['Computer Science', 'Information Security', 'Networking', 'Information Technology'],
                minCgpa: 6.5,
            },
            experienceRequirements: {
                minYears: 0,
                preferredDomains: ['Cybersecurity', 'Networking', 'IT Security'],
            },
            keywords: ['cybersecurity', 'ethical hacking', 'SIEM', 'threat detection', 'Wipro', 'security', 'Linux'],
            totalSeats: 45,
            filledSeats: 0,
            applicationDeadline: deadline,
            startDate: startDate,
            endDate: endDate,
            status: 'open',
            createdBy: adminId,
            tags: ['cybersecurity', 'security', 'IT', 'pm-scheme', 'ethical-hacking'],
        },

        // ── 9. HDFC BANK ───────────────────────────────────────────────────
        {
            title: 'Risk Management & Analytics Intern',
            company: 'HDFC Bank Limited',
            department: 'Risk Management',
            location: 'Mumbai, Maharashtra',
            isRemote: false,
            description:
                'HDFC Bank, under the PM Internship Scheme, is inviting future finance and analytics professionals to join its Risk Management department. You will work with quantitative analysts and risk officers to build credit risk models, analyze loan portfolios, and help ensure regulatory compliance. This internship provides deep exposure to how India\'s largest private sector bank manages risk at scale.',
            responsibilities: [
                'Assist in building and validating credit risk scorecards',
                'Perform statistical analysis on loan default data',
                'Prepare risk reports for senior management',
                'Support stress testing and scenario analysis',
                'Help in regulatory reporting (RBI, Basel III compliance)',
            ],
            duration: { value: 12, unit: 'months' },
            stipend: { amount: 5000, currency: 'INR', isPaid: true },
            requiredSkills: ['Finance', 'Statistics', 'Excel', 'Data Analysis'],
            preferredSkills: ['Python', 'R', 'SQL', 'Risk Management', 'SAS', 'Power BI'],
            educationRequirements: {
                minDegree: 'Bachelors',
                preferredMajors: ['Finance', 'Economics', 'Statistics', 'Mathematics', 'MBA'],
                minCgpa: 6.5,
            },
            experienceRequirements: {
                minYears: 0,
                preferredDomains: ['Finance', 'Banking', 'Risk Management'],
            },
            keywords: ['risk', 'credit risk', 'analytics', 'HDFC', 'banking', 'finance', 'statistics', 'Basel'],
            totalSeats: 30,
            filledSeats: 0,
            applicationDeadline: deadline,
            startDate: startDate,
            endDate: endDate,
            status: 'open',
            createdBy: adminId,
            tags: ['finance', 'risk-management', 'analytics', 'pm-scheme', 'banking'],
        },

        // ── 10. BHARTI AIRTEL ──────────────────────────────────────────────
        {
            title: 'Telecom Network Engineering Intern',
            company: 'Bharti Airtel Limited',
            department: '5G Network Operations',
            location: 'New Delhi, Delhi',
            isRemote: false,
            description:
                'Bharti Airtel, as part of the PM Internship Scheme, is offering a 12-month internship in its next-generation 5G Network division. Interns will be at the forefront of India\'s telecom revolution — assisting in 5G rollout, network optimization, and IoT applications. This is a unique opportunity to work on the infrastructure that powers digital India.',
            responsibilities: [
                'Support 5G network planning and rollout activities',
                'Monitor network KPIs and support troubleshooting',
                'Assist in IoT solution testing and integration',
                'Analyse network traffic data using Python/MATLAB',
                'Prepare network performance dashboards',
            ],
            duration: { value: 12, unit: 'months' },
            stipend: { amount: 5000, currency: 'INR', isPaid: true },
            requiredSkills: ['Telecommunications', 'Networking', 'Data Analysis', 'Python'],
            preferredSkills: ['5G', 'LTE', 'IoT', 'MATLAB', 'Network Optimization', 'RF Planning'],
            educationRequirements: {
                minDegree: 'Bachelors',
                preferredMajors: ['Electronics Engineering', 'Telecommunications', 'Computer Networks', 'Electrical Engineering'],
                minCgpa: 6.0,
            },
            experienceRequirements: {
                minYears: 0,
                preferredDomains: ['Telecom', 'Networks', 'Electronics'],
            },
            keywords: ['5G', 'telecom', 'networking', 'IoT', 'LTE', 'Airtel', 'RF', 'network optimization'],
            totalSeats: 55,
            filledSeats: 0,
            applicationDeadline: deadline,
            startDate: startDate,
            endDate: endDate,
            status: 'open',
            createdBy: adminId,
            tags: ['telecom', '5G', 'networking', 'pm-scheme', 'IoT'],
        },

        // ── 11. ITC LIMITED ────────────────────────────────────────────────
        {
            title: 'Supply Chain & Operations Management Intern',
            company: 'ITC Limited',
            department: 'Supply Chain & Logistics',
            location: 'Kolkata, West Bengal',
            isRemote: false,
            description:
                'ITC Limited, one of India\'s most admired companies, invites students under the PM Internship Scheme to join its Supply Chain & Logistics division. You will experience end-to-end supply chain management across ITC\'s diverse FMCG, hotels, paperboards, and agribusiness segments. Interns will work on optimization projects that impact supply chains serving millions of Indian consumers.',
            responsibilities: [
                'Analyse supply chain data and identify bottlenecks',
                'Support inventory optimization and demand forecasting',
                'Assist in vendor evaluation and procurement processes',
                'Map logistics routes and suggest cost optimization strategies',
                'Prepare operations reports and process flow diagrams',
            ],
            duration: { value: 12, unit: 'months' },
            stipend: { amount: 5000, currency: 'INR', isPaid: true },
            requiredSkills: ['Supply Chain Management', 'Excel', 'Data Analysis', 'Operations Research'],
            preferredSkills: ['SAP', 'Power BI', 'Python', 'Lean Six Sigma', 'ERP Systems'],
            educationRequirements: {
                minDegree: 'Bachelors',
                preferredMajors: ['Operations Management', 'Industrial Engineering', 'MBA', 'Logistics', 'Commerce'],
                minCgpa: 6.0,
            },
            experienceRequirements: {
                minYears: 0,
                preferredDomains: ['Supply Chain', 'Logistics', 'Operations', 'FMCG'],
            },
            keywords: ['supply chain', 'logistics', 'operations', 'SAP', 'ITC', 'FMCG', 'inventory', 'procurement'],
            totalSeats: 40,
            filledSeats: 0,
            applicationDeadline: deadline,
            startDate: startDate,
            endDate: endDate,
            status: 'open',
            createdBy: adminId,
            tags: ['supply-chain', 'operations', 'logistics', 'pm-scheme', 'FMCG'],
        },

        // ── 12. HCL TECHNOLOGIES ───────────────────────────────────────────
        {
            title: 'Cloud Computing & DevOps Intern',
            company: 'HCL Technologies Limited',
            department: 'Cloud & Infrastructure Services',
            location: 'Noida, Uttar Pradesh',
            isRemote: false,
            description:
                'HCL Technologies, as part of the PM Internship Scheme, offers a 12-month internship in its Cloud & Infrastructure Services division. Interns will work on real client cloud migration projects, DevOps automation pipelines, and container orchestration on AWS, Azure, and GCP. This role is ideal for students passionate about cloud architecture and modern software delivery.',
            responsibilities: [
                'Support cloud infrastructure setup and migration activities',
                'Build and maintain CI/CD pipelines using Jenkins/GitHub Actions',
                'Work with Docker containers and Kubernetes orchestration',
                'Monitor cloud resources and optimize costs',
                'Write Infrastructure-as-Code using Terraform/Ansible',
            ],
            duration: { value: 12, unit: 'months' },
            stipend: { amount: 5000, currency: 'INR', isPaid: true },
            requiredSkills: ['Linux', 'Python', 'Cloud Fundamentals', 'Networking'],
            preferredSkills: ['AWS', 'Azure', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'CI/CD'],
            educationRequirements: {
                minDegree: 'Bachelors',
                preferredMajors: ['Computer Science', 'Information Technology', 'Cloud Computing', 'Networking'],
                minCgpa: 6.5,
            },
            experienceRequirements: {
                minYears: 0,
                preferredDomains: ['Cloud Computing', 'DevOps', 'IT Infrastructure'],
            },
            keywords: ['cloud', 'DevOps', 'AWS', 'Docker', 'Kubernetes', 'HCL', 'CI/CD', 'Terraform'],
            totalSeats: 65,
            filledSeats: 0,
            applicationDeadline: deadline,
            startDate: startDate,
            endDate: endDate,
            status: 'open',
            createdBy: adminId,
            tags: ['cloud', 'DevOps', 'AWS', 'pm-scheme', 'infrastructure'],
        },

        // ── 13. ADANI GROUP ────────────────────────────────────────────────
        {
            title: 'Renewable Energy & Solar Technology Intern',
            company: 'Adani Green Energy Limited',
            department: 'Solar Projects & Operations',
            location: 'Ahmedabad, Gujarat',
            isRemote: false,
            description:
                'Adani Green Energy, under the PM Internship Scheme, is offering a unique opportunity in India\'s booming renewable energy sector. Interns will work on one of the world\'s largest solar energy projects — gaining hands-on experience in solar panel installation, energy monitoring, and grid integration. This role aligns with India\'s ambitious 500 GW renewable energy target.',
            responsibilities: [
                'Support solar plant operations and performance monitoring',
                'Analyse energy generation data using SCADA systems',
                'Assist in preventive maintenance planning',
                'Study grid integration and power dispatch optimization',
                'Prepare energy yield analysis and performance reports',
            ],
            duration: { value: 12, unit: 'months' },
            stipend: { amount: 5000, currency: 'INR', isPaid: true },
            requiredSkills: ['Electrical Engineering', 'Data Analysis', 'SCADA', 'MS Excel'],
            preferredSkills: ['Solar PV', 'Power Systems', 'MATLAB', 'Python', 'Grid Integration', 'AutoCAD Electrical'],
            educationRequirements: {
                minDegree: 'Bachelors',
                preferredMajors: ['Electrical Engineering', 'Renewable Energy', 'Electronics Engineering', 'Power Systems'],
                minCgpa: 6.0,
            },
            experienceRequirements: {
                minYears: 0,
                preferredDomains: ['Renewable Energy', 'Solar', 'Power Systems'],
            },
            keywords: ['solar', 'renewable energy', 'SCADA', 'grid', 'green energy', 'Adani', 'photovoltaic'],
            totalSeats: 45,
            filledSeats: 0,
            applicationDeadline: deadline,
            startDate: startDate,
            endDate: endDate,
            status: 'open',
            createdBy: adminId,
            tags: ['renewable-energy', 'solar', 'green-energy', 'pm-scheme', 'electrical'],
        },

        // ── 14. BAJAJ FINSERV ──────────────────────────────────────────────
        {
            title: 'Digital Marketing & Growth Analytics Intern',
            company: 'Bajaj Finserv Limited',
            department: 'Digital Marketing',
            location: 'Pune, Maharashtra',
            isRemote: false,
            description:
                'Bajaj Finserv, under the PM Internship Scheme, offers a 12-month internship in its Digital Marketing division. Interns will manage and analyze digital campaigns across Google, Meta, and programmatic channels for financial products reaching crores of Indian consumers. You will develop expertise in performance marketing, SEO, and data-driven growth strategies.',
            responsibilities: [
                'Manage and optimize Google Ads and Meta Ads campaigns',
                'Track campaign performance using Google Analytics 4 / Adobe Analytics',
                'Support SEO audits and content optimization',
                'Create performance dashboards and prepare weekly reports',
                'Assist in A/B testing and conversion rate optimization',
            ],
            duration: { value: 12, unit: 'months' },
            stipend: { amount: 5000, currency: 'INR', isPaid: true },
            requiredSkills: ['Digital Marketing', 'Google Analytics', 'Excel', 'Content Marketing'],
            preferredSkills: ['Google Ads', 'Meta Ads', 'SEO', 'SQL', 'Power BI', 'CRM Tools'],
            educationRequirements: {
                minDegree: 'Bachelors',
                preferredMajors: ['Marketing', 'Business Administration', 'Commerce', 'Mass Communication', 'MBA'],
                minCgpa: 6.0,
            },
            experienceRequirements: {
                minYears: 0,
                preferredDomains: ['Digital Marketing', 'Marketing', 'Analytics'],
            },
            keywords: ['digital marketing', 'Google Ads', 'SEO', 'analytics', 'Bajaj', 'fintech', 'growth'],
            totalSeats: 25,
            filledSeats: 0,
            applicationDeadline: deadline,
            startDate: startDate,
            endDate: endDate,
            status: 'open',
            createdBy: adminId,
            tags: ['marketing', 'digital', 'analytics', 'pm-scheme', 'fintech'],
        },

        // ── 15. NTPC LIMITED ───────────────────────────────────────────────
        {
            title: 'Power Plant Operations Intern',
            company: 'NTPC Limited (National Thermal Power Corporation)',
            department: 'Operations & Maintenance',
            location: 'Singrauli, Madhya Pradesh',
            isRemote: false,
            description:
                'NTPC, India\'s largest power generation company, offers PM Internship Scheme placement at its power stations. Interns will learn power plant operations, turbine maintenance, and energy management in a live thermal plant environment. This is a prestigious opportunity to understand the backbone of India\'s electricity infrastructure.',
            responsibilities: [
                'Assist in monitoring boiler, turbine, and generator operations',
                'Support plant engineers in preventive and predictive maintenance',
                'Collect and analyze plant performance data',
                'Study coal handling plants and ash disposal systems',
                'Prepare shift logs and operational reports',
            ],
            duration: { value: 12, unit: 'months' },
            stipend: { amount: 5000, currency: 'INR', isPaid: true },
            requiredSkills: ['Mechanical Engineering', 'Electrical Engineering', 'Thermodynamics', 'Data Analysis'],
            preferredSkills: ['Power Plant Operations', 'DCS/SCADA', 'Predictive Maintenance', 'AutoCAD', 'SAP PM'],
            educationRequirements: {
                minDegree: 'Bachelors',
                preferredMajors: ['Mechanical Engineering', 'Electrical Engineering', 'Power Engineering'],
                minCgpa: 6.0,
            },
            experienceRequirements: {
                minYears: 0,
                preferredDomains: ['Power', 'Energy', 'Electrical', 'Mechanical'],
            },
            keywords: ['power plant', 'NTPC', 'thermal', 'turbine', 'boiler', 'energy', 'electricity', 'operations'],
            totalSeats: 35,
            filledSeats: 0,
            applicationDeadline: deadline,
            startDate: startDate,
            endDate: endDate,
            status: 'open',
            createdBy: adminId,
            tags: ['power', 'energy', 'thermal', 'pm-scheme', 'operations'],
        },
    ];
}

// ─── Main Seed Function ────────────────────────────────────────────────────────
async function seedInternships() {
    try {
        await connect();
        const adminId = await getAdminId();

        const collection = mongoose.connection.db.collection('internships');

        // Check if already seeded
        const existing = await collection.countDocuments();
        if (existing > 0) {
            console.log(`⚠️  Found ${existing} internship(s) already in the database.`);
            console.log('   Do you want to ADD more, or has the seed already run?\n');
            console.log('   To fresh-seed, manually clear the internships collection first.');
            console.log('   MongoDB shell: db.internships.deleteMany({})  ← deletes all\n');

            // Still continue and add (won't duplicate if run carefully)
            console.log('   ➤ Proceeding to INSERT the PM scheme data anyway...\n');
        }

        const internships = getInternshipData(adminId);
        const result = await collection.insertMany(internships);

        console.log('');
        console.log('╔══════════════════════════════════════════════════════════╗');
        console.log('║       ✅  PM Internship Scheme — SEED COMPLETE!          ║');
        console.log('╠══════════════════════════════════════════════════════════╣');
        console.log(`║  📋 Internships Added : ${String(result.insertedCount).padEnd(34)}║`);
        console.log('║                                                          ║');
        console.log('║  Companies seeded:                                       ║');
        console.log('║  1.  Tata Motors            (Automotive Engineering)     ║');
        console.log('║  2.  Reliance Industries    (Data Analytics)             ║');
        console.log('║  3.  ONGC                   (Petroleum Engineering)      ║');
        console.log('║  4.  Infosys                (Full Stack Development)     ║');
        console.log('║  5.  Larsen & Toubro        (Civil Engineering)          ║');
        console.log('║  6.  Mahindra & Mahindra    (AI & Machine Learning)      ║');
        console.log('║  7.  State Bank of India    (FinTech & Digital Banking)  ║');
        console.log('║  8.  Wipro                  (Cybersecurity)              ║');
        console.log('║  9.  HDFC Bank              (Risk Management)            ║');
        console.log('║  10. Bharti Airtel          (5G Telecom Engineering)     ║');
        console.log('║  11. ITC Limited            (Supply Chain & Ops)         ║');
        console.log('║  12. HCL Technologies       (Cloud & DevOps)             ║');
        console.log('║  13. Adani Green Energy     (Renewable Energy)           ║');
        console.log('║  14. Bajaj Finserv          (Digital Marketing)          ║');
        console.log('║  15. NTPC Limited           (Power Plant Operations)     ║');
        console.log('╠══════════════════════════════════════════════════════════╣');
        console.log('║  🌐 View them at: http://localhost:5173                  ║');
        console.log('║  🔐 Admin panel:  http://localhost:5173/admin            ║');
        console.log('╚══════════════════════════════════════════════════════════╝');
        console.log('');

    } catch (err) {
        console.error('❌ Seed Error:', err.message);
        if (err.code === 11000) {
            console.error('   Duplicate key error — some records may already exist.');
        }
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

seedInternships();
