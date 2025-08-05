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
            Request.deleteMany({})
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
                name: 'Admin User',
                email: 'admin@cachedinfo.com',
                password: '$2a$10$dummy.hash.for.admin.user',
                role: 'admin',
                verified: true
            },
            {
                name: 'John Doe',
                email: 'john.doe@example.com',
                password: '$2a$10$dummy.hash.for.john.doe',
                role: 'user',
                verified: true
            },
            {
                name: 'Jane Smith',
                email: 'jane.smith@example.com',
                password: '$2a$10$dummy.hash.for.jane.smith',
                role: 'user',
                verified: true
            },
            {
                name: 'Bob Johnson',
                email: 'bob.johnson@example.com',
                password: '$2a$10$dummy.hash.for.bob.johnson',
                role: 'user',
                verified: true
            },
            {
                name: 'Alice Brown',
                email: 'alice.brown@example.com',
                password: '$2a$10$dummy.hash.for.alice.brown',
                role: 'user',
                verified: true
            }
        ]);
        console.log('✅ Created users');

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

        const skills = ['JavaScript', 'Python', 'React', 'Node.js', 'Machine Learning', 'Data Analysis'];
        const exams = ['JEE Main', 'JEE Advanced', 'GATE', 'CAT', 'GRE', 'GMAT'];

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
                skill: template.type === 'skill' ? skills[i % skills.length] : null,
                exam: template.type === 'competitive' ? exams[i % exams.length] : null,
                submittedBy: user._id,
                approved: true
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
