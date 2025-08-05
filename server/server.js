const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/cached-info', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.log('❌ MongoDB connection error:', err));

// Import routes
const authRoutes = require('./routes/auth');
const resourceRoutes = require('./routes/resources');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/users');

// Route middleware
app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);

// Additional API routes for your frontend
app.get('/api/universities', async (req, res) => {
  try {
    const University = require('./models/University');
    const universities = await University.find().select('_id name');
    res.json(universities);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching universities' });
  }
});

app.get('/api/domains', async (req, res) => {
  try {
    const Domain = require('./models/Domain');
    const domains = await Domain.find().select('name');
    res.json(domains);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching domains' });
  }
});

// Get domains for a specific university
app.get('/api/universities/:id/domains', async (req, res) => {
  try {
    const Domain = require('./models/Domain');
    const domains = await Domain.find({ university: req.params.id }).select('_id name');
    res.json(domains);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching domains for university' });
  }
});

// Get subjects for a specific domain
app.get('/api/domains/:id/subjects', async (req, res) => {
  try {
    const Subject = require('./models/Subject');
    const subjects = await Subject.find({ domain: req.params.id }).select('_id name');
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subjects for domain' });
  }
});

app.get('/api/subjects', async (req, res) => {
  try {
    const Subject = require('./models/Subject');
    const subjects = await Subject.find().select('name');
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subjects' });
  }
});

// Skills API endpoints
app.get('/api/skills', async (req, res) => {
  try {
    const Skill = require('./models/Skill');
    const skills = await Skill.find().select('_id name category level');
    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching skills' });
  }
});

// Get skills by category
app.get('/api/skills/category/:category', async (req, res) => {
  try {
    const Skill = require('./models/Skill');
    const skills = await Skill.find({ category: req.params.category }).select('_id name level');
    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching skills for category' });
  }
});

// Get skill categories
app.get('/api/skills/categories', async (req, res) => {
  try {
    const categories = ['Programming', 'Data Science', 'Web Development', 'Mobile Development', 'DevOps', 'Design', 'Business', 'Marketing'];
    res.json(categories.map(cat => ({ name: cat, value: cat })));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching skill categories' });
  }
});

// Competitive Exams API endpoints
app.get('/api/exams', async (req, res) => {
  try {
    const Exam = require('./models/Exam');
    const exams = await Exam.find().select('_id name category level');
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching exams' });
  }
});

// Get exams by category
app.get('/api/exams/category/:category', async (req, res) => {
  try {
    const Exam = require('./models/Exam');
    const exams = await Exam.find({ category: req.params.category }).select('_id name level subjects');
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching exams for category' });
  }
});

// Get exam categories
app.get('/api/exams/categories', async (req, res) => {
  try {
    const categories = ['Engineering', 'Medical', 'Management', 'Government', 'Banking', 'Teaching', 'Law', 'Other'];
    res.json(categories.map(cat => ({ name: cat, value: cat })));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching exam categories' });
  }
});

// Search endpoint
app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    const Resource = require('./models/Resource');

    if (!q) {
      return res.json([]);
    }

    const resources = await Resource.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { type: { $regex: q, $options: 'i' } }
      ]
    }).populate('university domain subject').limit(10);

    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: 'Error searching resources' });
  }
});

// Stats endpoints
app.get('/api/resources/count', async (req, res) => {
  try {
    const Resource = require('./models/Resource');
    const count = await Resource.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error getting resource count' });
  }
});

app.get('/api/users/count', async (req, res) => {
  try {
    const User = require('./models/User');
    const count = await User.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error getting user count' });
  }
});

// Request form endpoint
app.post('/api/requests', async (req, res) => {
  try {
    const { title, description, type, subject, university, domain, skill, exam, priority, contactEmail } = req.body;
    const Request = require('./models/Request');

    const newRequest = new Request({
      title,
      description,
      type,
      subject,
      university,
      domain,
      skill,
      exam,
      priority,
      contactEmail
    });

    await newRequest.save();
    res.json({ message: 'Request submitted successfully', requestId: newRequest._id });
  } catch (error) {
    console.error('Error submitting request:', error);
    res.status(500).json({ message: 'Error submitting request' });
  }
});

app.get('/api/requests/count', async (req, res) => {
  try {
    const Request = require('./models/Request');
    const count = await Request.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error getting request count' });
  }
});

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'Cached Info API is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      resources: '/api/resources',
      search: '/api/search',
      universities: '/api/universities',
      domains: '/api/domains',
      subjects: '/api/subjects',
      requests: '/api/requests'
    }
  });
});

// Import error handler
const errorHandler = require('./middleware/errorHandler');

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation available at http://localhost:${PORT}`);
});