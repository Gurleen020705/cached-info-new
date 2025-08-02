// Sample data for ResourcePage when MongoDB connection fails
export const sampleData = {
    domains: [
        { _id: '1', name: 'Computer Science' },
        { _id: '2', name: 'Engineering' },
        { _id: '3', name: 'Mathematics' },
        { _id: '4', name: 'Business' },
        { _id: '5', name: 'Science' }
    ],

    universities: [
        { _id: '1', name: 'Stanford University' },
        { _id: '2', name: 'MIT' },
        { _id: '3', name: 'Harvard University' },
        { _id: '4', name: 'UC Berkeley' },
        { _id: '5', name: 'Carnegie Mellon' },
        { _id: '6', name: 'University of Washington' }
    ],

    semesters: [
        { _id: '1', name: 'Semester 1' },
        { _id: '2', name: 'Semester 2' },
        { _id: '3', name: 'Semester 3' },
        { _id: '4', name: 'Semester 4' },
        { _id: '5', name: 'Semester 5' },
        { _id: '6', name: 'Semester 6' },
        { _id: '7', name: 'Semester 7' },
        { _id: '8', name: 'Semester 8' }
    ],

    branches: [
        { _id: '1', name: 'Computer Science Engineering' },
        { _id: '2', name: 'Information Technology' },
        { _id: '3', name: 'Electronics Engineering' },
        { _id: '4', name: 'Mechanical Engineering' },
        { _id: '5', name: 'Civil Engineering' },
        { _id: '6', name: 'Business Administration' }
    ],

    subjects: [
        {
            _id: '1',
            name: 'Data Structures and Algorithms',
            code: 'CS201',
            creditHours: 4,
            domain: '1',
            university: '1',
            semester: '3',
            branch: '1'
        },
        {
            _id: '2',
            name: 'Database Management Systems',
            code: 'CS301',
            creditHours: 3,
            domain: '1',
            university: '1',
            semester: '5',
            branch: '1'
        },
        {
            _id: '3',
            name: 'Machine Learning',
            code: 'CS401',
            creditHours: 4,
            domain: '1',
            university: '2',
            semester: '7',
            branch: '1'
        },
        {
            _id: '4',
            name: 'Web Development',
            code: 'IT201',
            creditHours: 3,
            domain: '1',
            university: '1',
            semester: '4',
            branch: '2'
        },
        {
            _id: '5',
            name: 'Software Engineering',
            code: 'CS302',
            creditHours: 3,
            domain: '1',
            university: '3',
            semester: '6',
            branch: '1'
        },
        {
            _id: '6',
            name: 'Computer Networks',
            code: 'CS303',
            creditHours: 3,
            domain: '1',
            university: '2',
            semester: '5',
            branch: '1'
        }
    ],

    topics: [
        {
            _id: '1',
            name: 'Binary Trees',
            description: 'Understanding tree data structures, traversals, and operations',
            subject: { _id: '1', name: 'Data Structures and Algorithms' },
            domain: '1',
            university: '1',
            semester: '3',
            branch: '1'
        },
        {
            _id: '2',
            name: 'SQL Queries',
            description: 'Advanced SQL operations, joins, and query optimization',
            subject: { _id: '2', name: 'Database Management Systems' },
            domain: '1',
            university: '1',
            semester: '5',
            branch: '1'
        },
        {
            _id: '3',
            name: 'Neural Networks',
            description: 'Deep learning fundamentals and neural network architectures',
            subject: { _id: '3', name: 'Machine Learning' },
            domain: '1',
            university: '2',
            semester: '7',
            branch: '1'
        },
        {
            _id: '4',
            name: 'React.js Components',
            description: 'Building reusable components and managing state in React',
            subject: { _id: '4', name: 'Web Development' },
            domain: '1',
            university: '1',
            semester: '4',
            branch: '2'
        },
        {
            _id: '5',
            name: 'Agile Methodology',
            description: 'Scrum, sprints, and agile development practices',
            subject: { _id: '5', name: 'Software Engineering' },
            domain: '1',
            university: '3',
            semester: '6',
            branch: '1'
        },
        {
            _id: '6',
            name: 'TCP/IP Protocol',
            description: 'Understanding network protocols and communication',
            subject: { _id: '6', name: 'Computer Networks' },
            domain: '1',
            university: '2',
            semester: '5',
            branch: '1'
        }
    ],

    resources: [
        {
            _id: '1',
            title: 'Complete Data Structures Course',
            description: 'Comprehensive video course covering all major data structures with coding examples and practice problems.',
            type: 'university',
            url: 'https://example.com/ds-course',
            domain: '1',
            university: '1',
            semester: '3',
            branch: '1',
            subject: '1',
            topic: '1',
            submittedBy: { name: 'John Doe' }
        },
        {
            _id: '2',
            title: 'SQL Practice Platform',
            description: 'Interactive platform with hundreds of SQL problems ranging from beginner to advanced level.',
            type: 'skill',
            url: 'https://example.com/sql-practice',
            domain: '1',
            university: '1',
            semester: '5',
            branch: '1',
            subject: '2',
            topic: '2',
            submittedBy: { name: 'Jane Smith' }
        },
        {
            _id: '3',
            title: 'Machine Learning Handbook',
            description: 'Complete guide to machine learning algorithms with Python implementations and real-world examples.',
            type: 'university',
            url: 'https://example.com/ml-handbook',
            domain: '1',
            university: '2',
            semester: '7',
            branch: '1',
            subject: '3',
            topic: '3',
            submittedBy: { name: 'Mike Johnson' }
        },
        {
            _id: '4',
            title: 'React.js Documentation',
            description: 'Official React documentation with tutorials, API reference, and best practices.',
            type: 'skill',
            url: 'https://reactjs.org',
            domain: '1',
            university: '1',
            semester: '4',
            branch: '2',
            subject: '4',
            topic: '4',
            submittedBy: { name: 'Sarah Wilson' }
        },
        {
            _id: '5',
            title: 'Competitive Programming Guide',
            description: 'Essential algorithms and problem-solving techniques for coding competitions.',
            type: 'competitive',
            url: 'https://example.com/cp-guide',
            domain: '1',
            university: '2',
            semester: '3',
            branch: '1',
            subject: '1',
            topic: '1',
            submittedBy: { name: 'Alex Chen' }
        },
        {
            _id: '6',
            title: 'Agile Project Management',
            description: 'Learn agile methodologies, scrum framework, and project management best practices.',
            type: 'skill',
            url: 'https://example.com/agile-pm',
            domain: '1',
            university: '3',
            semester: '6',
            branch: '1',
            subject: '5',
            topic: '5',
            submittedBy: { name: 'Emma Davis' }
        },
        {
            _id: '7',
            title: 'Network Security Fundamentals',
            description: 'Understanding network protocols, security measures, and threat analysis.',
            type: 'university',
            url: 'https://example.com/network-security',
            domain: '1',
            university: '2',
            semester: '5',
            branch: '1',
            subject: '6',
            topic: '6',
            submittedBy: { name: 'Robert Brown' }
        },
        {
            _id: '8',
            title: 'LeetCode Problem Solutions',
            description: 'Detailed solutions and explanations for popular coding interview questions.',
            type: 'competitive',
            url: 'https://example.com/leetcode-solutions',
            domain: '1',
            university: '1',
            semester: '3',
            branch: '1',
            subject: '1',
            topic: '1',
            submittedBy: { name: 'Lisa Garcia' }
        }
    ]
};

// Helper function to filter data based on selected filters
export const filterData = (data, filters) => {
    return data.filter(item => {
        return Object.entries(filters).every(([key, value]) => {
            if (!value) return true; // If filter is empty, include all items
            return item[key] === value;
        });
    });
};