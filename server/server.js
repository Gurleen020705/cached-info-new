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

// Route middleware
app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);

// Additional API routes for your frontend
app.get('/api/universities', async (req, res) => {
  try {
    const University = require('./models/University');
    const universities = await University.find().select('name');
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

app.get('/api/subjects', async (req, res) => {
  try {
    const Subject = require('./models/Subject');
    const subjects = await Subject.find().select('name');
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subjects' });
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
    
    // For now, just log the request (you can create a Request model later)
    console.log('Resource Request:', {
      title,
      description,
      type,
      subject,
      university,
      domain,
      skill,
      exam,
      priority,
      contactEmail,
      timestamp: new Date()
    });

    res.json({ message: 'Request submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting request' });
  }
});

app.get('/api/requests/count', async (req, res) => {
  try {
    // For now, return a mock count (you can implement this properly later)
    res.json({ count: 15 });
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation available at http://localhost:${PORT}`);
});