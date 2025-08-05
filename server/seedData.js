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

// Import comprehensive university data
const universities = require('./data/universities').map(uni => ({
  name: uni.name,
  location: `${uni.city || uni.state}, ${uni.country}`
}));

const domains = [
  { name: 'Computer Science', description: 'Programming, algorithms, and software development' },
  { name: 'Data Science', description: 'Statistics, machine learning, and data analysis' },
  { name: 'Web Development', description: 'Frontend, backend, and full-stack development' },
  { name: 'Mobile Development', description: 'iOS, Android, and cross-platform development' },
  { name: 'Cybersecurity', description: 'Network security, cryptography, and ethical hacking' },
  { name: 'Artificial Intelligence', description: 'Machine learning, neural networks, and AI' },
  { name: 'Cloud Computing', description: 'AWS, Azure, Google Cloud, and DevOps' },
  { name: 'Blockchain', description: 'Cryptocurrency, smart contracts, and DApps' }
];

const subjects = [
  { name: 'JavaScript', description: 'Web programming language' },
  { name: 'Python', description: 'General-purpose programming language' },
  { name: 'React', description: 'Frontend JavaScript library' },
  { name: 'Node.js', description: 'Backend JavaScript runtime' },
  { name: 'MongoDB', description: 'NoSQL database' },
  { name: 'SQL', description: 'Structured query language' },
  { name: 'Data Structures', description: 'Fundamental programming concepts' },
  { name: 'Algorithms', description: 'Problem-solving techniques' },
  { name: 'Machine Learning', description: 'AI and predictive modeling' },
  { name: 'Web Security', description: 'Cybersecurity for web applications' }
];

const resources = [
  {
    title: 'Complete JavaScript Course 2024',
    description: 'Learn JavaScript from scratch to advanced concepts including ES6+, async/await, and modern frameworks.',
    url: 'https://www.udemy.com/course/javascript-complete-guide/',
    type: 'skill',
    skill: 'JavaScript',
    submittedBy: 'admin'
  },
  {
    title: 'MIT Introduction to Computer Science',
    description: 'Comprehensive introduction to computer science and programming using Python.',
    url: 'https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/',
    type: 'university',
    university: 'MIT',
    subject: 'Python',
    submittedBy: 'admin'
  },
  {
    title: 'React Tutorial for Beginners',
    description: 'Step-by-step guide to building React applications with hooks and modern practices.',
    url: 'https://reactjs.org/tutorial/tutorial.html',
    type: 'skill',
    skill: 'React',
    submittedBy: 'admin'
  },
  {
    title: 'Stanford CS229: Machine Learning',
    description: 'Advanced machine learning course covering supervised learning, unsupervised learning, and deep learning.',
    url: 'https://cs229.stanford.edu/',
    type: 'university',
    university: 'Stanford University',
    subject: 'Machine Learning',
    submittedBy: 'admin'
  },
  {
    title: 'GATE Computer Science Preparation',
    description: 'Complete preparation material for GATE Computer Science examination with practice questions.',
    url: 'https://gatecse.in/',
    type: 'competitive',
    exam: 'GATE',
    submittedBy: 'admin'
  },
  {
    title: 'LeetCode Programming Challenges',
    description: 'Practice coding problems for technical interviews with solutions and explanations.',
    url: 'https://leetcode.com/',
    type: 'skill',
    skill: 'Algorithms',
    submittedBy: 'admin'
  }
];

// Seed function
async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/cached-info', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await University.deleteMany({});
    await Domain.deleteMany({});
    await Subject.deleteMany({});
    await Resource.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Insert universities
    const createdUniversities = await University.insertMany(universities);
    console.log(`✅ Inserted ${createdUniversities.length} universities`);

    // Insert domains
    const createdDomains = await Domain.insertMany(domains);
    console.log(`✅ Inserted ${createdDomains.length} domains`);

    // Insert subjects
    const createdSubjects = await Subject.insertMany(subjects);
    console.log(`✅ Inserted ${createdSubjects.length} subjects`);

    // Create a map for easy lookup
    const universityMap = {};
    const domainMap = {};
    const subjectMap = {};

    createdUniversities.forEach(uni => {
      universityMap[uni.name] = uni._id;
    });

    createdDomains.forEach(domain => {
      domainMap[domain.name] = domain._id;
    });

    createdSubjects.forEach(subject => {
      subjectMap[subject.name] = subject._id;
    });

    // Prepare resources with proper references
    const preparedResources = resources.map(resource => ({
      ...resource,
      university: resource.university ? universityMap[resource.university] : undefined,
      domain: resource.domain ? domainMap[resource.domain] : undefined,
      subject: resource.subject ? subjectMap[resource.subject] : undefined
    }));

    // Insert resources
    const createdResources = await Resource.insertMany(preparedResources);
    console.log(`✅ Inserted ${createdResources.length} resources`);

    console.log('🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Universities: ${createdUniversities.length}`);
    console.log(`   Domains: ${createdDomains.length}`);
    console.log(`   Subjects: ${createdSubjects.length}`);
    console.log(`   Resources: ${createdResources.length}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the seed function
seedDatabase(); 