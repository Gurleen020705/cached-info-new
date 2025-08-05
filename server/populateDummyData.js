const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const University = require('./models/University');
const Domain = require('./models/Domain');
const Subject = require('./models/Subject');
const Resource = require('./models/Resource');
const User = require('./models/User');
const Request = require('./models/Request');
const Skill = require('./models/Skill');
const Exam = require('./models/Exam');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/cached-info', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const populateDummyData = async () => {
    try {
        console.log('🚀 Starting dummy data population...');

        // Clear existing data
        await Promise.all([
            University.deleteMany({}),
            Domain.deleteMany({}),
            Subject.deleteMany({}),
            Resource.deleteMany({}),
            User.deleteMany({}),
            Request.deleteMany({}),
            Skill.deleteMany({}),
            Exam.deleteMany({})
        ]);
        console.log('✅ Cleared existing data');

        // Create Universities
        const universities = await University.insertMany([
            { name: 'Stanford University' },
            { name: 'Massachusetts Institute of Technology' },
            { name: 'Harvard University' },
            { name: 'University of California, Berkeley' },
            { name: 'Carnegie Mellon University' },
            { name: 'University of Oxford' },
            { name: 'University of Cambridge' },
            { name: 'Indian Institute of Technology Delhi' },
            { name: 'Indian Institute of Technology Bombay' },
            { name: 'Indian Institute of Science Bangalore' }
        ]);
        console.log('✅ Created universities');

        // Create Domains for each university
        const domains = [];
        const domainNames = [
            'Computer Science',
            'Electrical Engineering',
            'Mechanical Engineering',
            'Business Administration',
            'Mathematics',
            'Physics',
            'Chemistry',
            'Biology',
            'Economics',
            'Psychology'
        ];

        for (const university of universities) {
            for (let i = 0; i < 3; i++) {
                const domain = new Domain({
                    name: domainNames[i % domainNames.length],
                    university: university._id
                });
                domains.push(domain);
            }
        }
        await Domain.insertMany(domains);
        console.log('✅ Created domains');

        // Create Subjects for each domain
        const subjects = [];
        const subjectsByDomain = {
            'Computer Science': ['Data Structures', 'Algorithms', 'Database Systems', 'Machine Learning', 'Web Development'],
            'Electrical Engineering': ['Circuit Analysis', 'Digital Electronics', 'Signal Processing', 'Power Systems', 'Control Systems'],
            'Mechanical Engineering': ['Thermodynamics', 'Fluid Mechanics', 'Materials Science', 'Manufacturing', 'Robotics'],
            'Business Administration': ['Marketing', 'Finance', 'Operations Management', 'Strategic Management', 'Organizational Behavior'],
            'Mathematics': ['Calculus', 'Linear Algebra', 'Statistics', 'Discrete Mathematics', 'Number Theory'],
            'Physics': ['Classical Mechanics', 'Quantum Physics', 'Thermodynamics', 'Electromagnetism', 'Optics'],
            'Chemistry': ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Analytical Chemistry', 'Biochemistry'],
            'Biology': ['Cell Biology', 'Genetics', 'Ecology', 'Evolution', 'Molecular Biology'],
            'Economics': ['Microeconomics', 'Macroeconomics', 'Econometrics', 'Development Economics', 'International Economics'],
            'Psychology': ['Cognitive Psychology', 'Social Psychology', 'Developmental Psychology', 'Clinical Psychology', 'Research Methods']
        };

        for (const domain of domains) {
            const domainSubjects = subjectsByDomain[domain.name] || ['General Studies'];
            for (const subjectName of domainSubjects) {
                const subject = new Subject({
                    name: subjectName,
                    domain: domain._id,
                    syllabus: [
                        { topic: 'Introduction', resources: [] },
                        { topic: 'Fundamentals', resources: [] },
                        { topic: 'Advanced Topics', resources: [] }
                    ]
                });
                subjects.push(subject);
            }
        }
        await Subject.insertMany(subjects);
        console.log('✅ Created subjects');

        // Create Users
        const users = await User.insertMany([
            {
                googleId: 'admin_google_id_123',
                name: 'Admin User',
                email: 'admin@cachedinfo.com',
                role: 'admin'
            },
            {
                googleId: 'john_doe_google_id_456',
                name: 'John Doe',
                email: 'john.doe@example.com',
                role: 'user'
            },
            {
                googleId: 'jane_smith_google_id_789',
                name: 'Jane Smith',
                email: 'jane.smith@example.com',
                role: 'user'
            },
            {
                googleId: 'bob_johnson_google_id_101',
                name: 'Bob Johnson',
                email: 'bob.johnson@example.com',
                role: 'user'
            },
            {
                googleId: 'alice_brown_google_id_112',
                name: 'Alice Brown',
                email: 'alice.brown@example.com',
                role: 'user'
            }
        ]);
        console.log('✅ Created users');

        // Create Skills
        const skillsData = await Skill.insertMany([
            // Programming Skills
            { name: 'JavaScript', category: 'Programming', level: 'Intermediate', description: 'Modern JavaScript programming language' },
            { name: 'Python', category: 'Programming', level: 'Beginner', description: 'Versatile programming language for various applications' },
            { name: 'Java', category: 'Programming', level: 'Intermediate', description: 'Object-oriented programming language' },
            { name: 'C++', category: 'Programming', level: 'Advanced', description: 'System programming language' },
            { name: 'TypeScript', category: 'Programming', level: 'Intermediate', description: 'Typed superset of JavaScript' },
            
            // Web Development Skills
            { name: 'React', category: 'Web Development', level: 'Intermediate', description: 'Popular JavaScript library for building user interfaces' },
            { name: 'Node.js', category: 'Web Development', level: 'Intermediate', description: 'JavaScript runtime for server-side development' },
            { name: 'HTML/CSS', category: 'Web Development', level: 'Beginner', description: 'Frontend markup and styling languages' },
            { name: 'Vue.js', category: 'Web Development', level: 'Intermediate', description: 'Progressive JavaScript framework' },
            { name: 'Angular', category: 'Web Development', level: 'Advanced', description: 'Full-featured web application framework' },
            
            // Data Science Skills
            { name: 'Machine Learning', category: 'Data Science', level: 'Advanced', description: 'Algorithms and statistical models for data analysis' },
            { name: 'Data Analysis', category: 'Data Science', level: 'Intermediate', description: 'Techniques for analyzing and interpreting data' },
            { name: 'SQL', category: 'Data Science', level: 'Intermediate', description: 'Database query language' },
            { name: 'R Programming', category: 'Data Science', level: 'Intermediate', description: 'Statistical computing language' },
            { name: 'Pandas', category: 'Data Science', level: 'Intermediate', description: 'Python library for data manipulation' },
            
            // Mobile Development Skills
            { name: 'React Native', category: 'Mobile Development', level: 'Intermediate', description: 'Cross-platform mobile app development' },
            { name: 'Flutter', category: 'Mobile Development', level: 'Intermediate', description: 'Google\'s UI toolkit for mobile apps' },
            { name: 'iOS Development', category: 'Mobile Development', level: 'Advanced', description: 'Native iOS app development' },
            { name: 'Android Development', category: 'Mobile Development', level: 'Advanced', description: 'Native Android app development' },
            
            // DevOps Skills
            { name: 'Docker', category: 'DevOps', level: 'Intermediate', description: 'Containerization platform' },
            { name: 'Kubernetes', category: 'DevOps', level: 'Advanced', description: 'Container orchestration system' },
            { name: 'AWS', category: 'DevOps', level: 'Intermediate', description: 'Amazon Web Services cloud platform' },
            { name: 'CI/CD', category: 'DevOps', level: 'Intermediate', description: 'Continuous Integration and Deployment' },
            
            // Design Skills
            { name: 'UI/UX Design', category: 'Design', level: 'Intermediate', description: 'User interface and experience design' },
            { name: 'Figma', category: 'Design', level: 'Beginner', description: 'Collaborative design tool' },
            { name: 'Adobe Creative Suite', category: 'Design', level: 'Advanced', description: 'Professional design software suite' },
            
            // Business Skills
            { name: 'Project Management', category: 'Business', level: 'Intermediate', description: 'Planning and executing projects effectively' },
            { name: 'Agile/Scrum', category: 'Business', level: 'Intermediate', description: 'Agile project management methodologies' },
            
            // Marketing Skills
            { name: 'Digital Marketing', category: 'Marketing', level: 'Beginner', description: 'Online marketing strategies and techniques' },
            { name: 'SEO', category: 'Marketing', level: 'Intermediate', description: 'Search Engine Optimization' }
        ]);
        console.log('✅ Created skills');

        // Create Competitive Exams
        const examsData = await Exam.insertMany([
            // Engineering Exams
            { name: 'JEE Main', category: 'Engineering', level: 'National', subjects: ['Physics', 'Chemistry', 'Mathematics'], description: 'Joint Entrance Examination for engineering colleges' },
            { name: 'JEE Advanced', category: 'Engineering', level: 'National', subjects: ['Physics', 'Chemistry', 'Mathematics'], description: 'Advanced level engineering entrance exam' },
            { name: 'GATE', category: 'Engineering', level: 'National', subjects: ['Computer Science', 'Electrical', 'Mechanical', 'Civil'], description: 'Graduate Aptitude Test in Engineering' },
            { name: 'BITSAT', category: 'Engineering', level: 'University', subjects: ['Physics', 'Chemistry', 'Mathematics', 'English'], description: 'BITS Admission Test' },
            
            // Medical Exams
            { name: 'NEET', category: 'Medical', level: 'National', subjects: ['Physics', 'Chemistry', 'Biology'], description: 'National Eligibility cum Entrance Test for medical courses' },
            { name: 'AIIMS', category: 'Medical', level: 'National', subjects: ['Physics', 'Chemistry', 'Biology', 'General Knowledge'], description: 'All India Institute of Medical Sciences entrance exam' },
            
            // Management Exams
            { name: 'CAT', category: 'Management', level: 'National', subjects: ['Quantitative Aptitude', 'Verbal Ability', 'Data Interpretation'], description: 'Common Admission Test for MBA programs' },
            { name: 'XAT', category: 'Management', level: 'National', subjects: ['Verbal Ability', 'Decision Making', 'Quantitative Aptitude'], description: 'Xavier Aptitude Test' },
            { name: 'MAT', category: 'Management', level: 'National', subjects: ['Language Comprehension', 'Mathematical Skills', 'Data Analysis'], description: 'Management Aptitude Test' },
            
            // Government Exams
            { name: 'UPSC CSE', category: 'Government', level: 'National', subjects: ['General Studies', 'Optional Subject', 'Essay'], description: 'Union Public Service Commission Civil Services Examination' },
            { name: 'SSC CGL', category: 'Government', level: 'National', subjects: ['General Intelligence', 'General Awareness', 'Quantitative Aptitude'], description: 'Staff Selection Commission Combined Graduate Level' },
            { name: 'RRB NTPC', category: 'Government', level: 'National', subjects: ['General Awareness', 'Mathematics', 'General Intelligence'], description: 'Railway Recruitment Board Non-Technical Popular Categories' },
            
            // Banking Exams
            { name: 'IBPS PO', category: 'Banking', level: 'National', subjects: ['Reasoning', 'Quantitative Aptitude', 'English Language'], description: 'Institute of Banking Personnel Selection Probationary Officer' },
            { name: 'SBI PO', category: 'Banking', level: 'National', subjects: ['Reasoning', 'Quantitative Aptitude', 'English Language'], description: 'State Bank of India Probationary Officer' },
            { name: 'IBPS Clerk', category: 'Banking', level: 'National', subjects: ['Reasoning', 'Numerical Ability', 'English Language'], description: 'IBPS Clerical Cadre examination' },
            
            // Teaching Exams
            { name: 'CTET', category: 'Teaching', level: 'National', subjects: ['Child Development', 'Language I', 'Language II', 'Mathematics'], description: 'Central Teacher Eligibility Test' },
            { name: 'UGC NET', category: 'Teaching', level: 'National', subjects: ['Teaching Aptitude', 'Research Aptitude', 'Subject Specific'], description: 'University Grants Commission National Eligibility Test' },
            
            // Law Exams
            { name: 'CLAT', category: 'Law', level: 'National', subjects: ['English', 'General Knowledge', 'Legal Reasoning', 'Logical Reasoning'], description: 'Common Law Admission Test' },
            { name: 'AILET', category: 'Law', level: 'University', subjects: ['English', 'General Knowledge', 'Legal Aptitude'], description: 'All India Law Entrance Test' },
            
            // Other Exams
            { name: 'GRE', category: 'Other', level: 'International', subjects: ['Verbal Reasoning', 'Quantitative Reasoning', 'Analytical Writing'], description: 'Graduate Record Examination for international studies' },
            { name: 'GMAT', category: 'Other', level: 'International', subjects: ['Analytical Writing', 'Integrated Reasoning', 'Quantitative', 'Verbal'], description: 'Graduate Management Admission Test' }
        ]);
        console.log('✅ Created competitive exams');

        // Create Resources
        const resources = [];
        const resourceTemplates = [
            {
                title: 'Introduction to Data Structures',
                description: 'Comprehensive guide to fundamental data structures including arrays, linked lists, stacks, and queues.',
                url: 'https://example.com/data-structures-intro',
                type: 'university'
            },
            {
                title: 'Advanced Algorithms Course',
                description: 'Deep dive into sorting algorithms, graph algorithms, and dynamic programming techniques.',
                url: 'https://example.com/advanced-algorithms',
                type: 'university'
            },
            {
                title: 'Machine Learning Fundamentals',
                description: 'Complete course covering supervised and unsupervised learning algorithms.',
                url: 'https://example.com/ml-fundamentals',
                type: 'university'
            },
            {
                title: 'JavaScript Mastery',
                description: 'Complete JavaScript programming course from basics to advanced concepts.',
                url: 'https://example.com/javascript-mastery',
                type: 'skill'
            },
            {
                title: 'Python for Data Science',
                description: 'Learn Python programming specifically for data science applications.',
                url: 'https://example.com/python-data-science',
                type: 'skill'
            },
            {
                title: 'React Development Guide',
                description: 'Modern React development with hooks, context, and best practices.',
                url: 'https://example.com/react-guide',
                type: 'skill'
            },
            {
                title: 'JEE Main Preparation',
                description: 'Complete preparation material for JEE Main examination.',
                url: 'https://example.com/jee-main-prep',
                type: 'competitive'
            },
            {
                title: 'GATE Computer Science',
                description: 'Comprehensive GATE preparation for Computer Science and Engineering.',
                url: 'https://example.com/gate-cs',
                type: 'competitive'
            },
            {
                title: 'CAT Quantitative Aptitude',
                description: 'Quantitative aptitude preparation for CAT examination.',
                url: 'https://example.com/cat-quant',
                type: 'competitive'
            }
        ];

        const skillNames = ['JavaScript', 'Python', 'React', 'Node.js', 'Machine Learning', 'Data Analysis'];
        const examNames = ['JEE Main', 'JEE Advanced', 'GATE', 'CAT', 'GRE', 'GMAT'];

        for (let i = 0; i < resourceTemplates.length; i++) {
            const template = resourceTemplates[i];
            const university = universities[i % universities.length];
            const domain = domains.find(d => d.university.toString() === university._id.toString());
            const subject = subjects.find(s => s.domain.toString() === domain._id.toString());
            const user = users[i % users.length];

            const resource = new Resource({
                title: template.title,
                description: template.description,
                url: template.url,
                type: template.type,
                university: template.type === 'university' ? university._id : null,
                domain: template.type === 'university' ? domain._id : null,
                subject: template.type === 'university' ? subject._id : null,
                skill: template.type === 'skill' ? skillNames[i % skillNames.length] : null,
                exam: template.type === 'competitive' ? examNames[i % examNames.length] : null,
                submittedBy: user._id,
                approved: true // Auto-approve all for testing
            });
            resources.push(resource);
        }

        // Add more resources for variety
        for (let i = 0; i < 20; i++) {
            const university = universities[i % universities.length];
            const domain = domains.find(d => d.university.toString() === university._id.toString());
            const subject = subjects.find(s => s.domain.toString() === domain._id.toString());
            const user = users[i % users.length];

            const resource = new Resource({
                title: `Resource ${i + 10}: ${subject.name} Materials`,
                description: `Comprehensive study materials for ${subject.name} covering all essential topics and practical examples.`,
                url: `https://example.com/resource-${i + 10}`,
                type: 'university',
                university: university._id,
                domain: domain._id,
                subject: subject._id,
                submittedBy: user._id,
                approved: Math.random() > 0.3 // 70% approved
            });
            resources.push(resource);
        }

        await Resource.insertMany(resources);
        console.log('✅ Created resources');

        // Create Requests
        const requests = await Request.insertMany([
            {
                title: 'Need Advanced React Tutorial',
                description: 'Looking for comprehensive React tutorial covering hooks, context API, and performance optimization.',
                type: 'skill',
                skill: 'React',
                priority: 'high',
                contactEmail: 'student1@example.com',
                status: 'pending'
            },
            {
                title: 'Machine Learning Course for Beginners',
                description: 'Need a beginner-friendly machine learning course with practical examples.',
                type: 'skill',
                skill: 'Machine Learning',
                priority: 'medium',
                contactEmail: 'student2@example.com',
                status: 'in-progress'
            },
            {
                title: 'Database Systems Study Material',
                description: 'Looking for comprehensive database systems study material for university course.',
                type: 'university',
                university: 'Stanford University',
                domain: 'Computer Science',
                subject: 'Database Systems',
                priority: 'medium',
                contactEmail: 'student3@example.com',
                status: 'pending'
            },
            {
                title: 'JEE Advanced Physics Notes',
                description: 'Need detailed physics notes and practice problems for JEE Advanced preparation.',
                type: 'competitive',
                exam: 'JEE Advanced',
                priority: 'urgent',
                contactEmail: 'student4@example.com',
                status: 'completed'
            },
            {
                title: 'Python Data Science Resources',
                description: 'Looking for Python resources specifically focused on data science applications.',
                type: 'skill',
                skill: 'Python',
                priority: 'medium',
                contactEmail: 'student5@example.com',
                status: 'pending'
            },
            {
                title: 'Organic Chemistry Lab Manual',
                description: 'Need comprehensive organic chemistry lab manual with experiments and procedures.',
                type: 'university',
                university: 'Harvard University',
                domain: 'Chemistry',
                subject: 'Organic Chemistry',
                priority: 'low',
                contactEmail: 'student6@example.com',
                status: 'rejected'
            },
            {
                title: 'GATE Preparation Strategy',
                description: 'Looking for effective GATE preparation strategy and study plan.',
                type: 'competitive',
                exam: 'GATE',
                priority: 'high',
                contactEmail: 'student7@example.com',
                status: 'in-progress'
            },
            {
                title: 'Web Development Bootcamp',
                description: 'Need comprehensive web development bootcamp covering frontend and backend.',
                type: 'skill',
                skill: 'Web Development',
                priority: 'medium',
                contactEmail: 'student8@example.com',
                status: 'pending'
            }
        ]);
        console.log('✅ Created requests');

        console.log('\n🎉 Dummy data population completed successfully!');
        console.log(`📊 Summary:`);
        console.log(`   - Universities: ${universities.length}`);
        console.log(`   - Domains: ${domains.length}`);
        console.log(`   - Subjects: ${subjects.length}`);
        console.log(`   - Skills: ${skillsData.length}`);
        console.log(`   - Competitive Exams: ${examsData.length}`);
        console.log(`   - Resources: ${resources.length}`);
        console.log(`   - Users: ${users.length}`);
        console.log(`   - Requests: ${requests.length}`);

    } catch (error) {
        console.error('❌ Error populating dummy data:', error);
    } finally {
        mongoose.connection.close();
    }
};

// Run the population script
populateDummyData();
