const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const Resource = require('../models/Resource');
const User = require('../models/User');
const University = require('../models/University');
const Domain = require('../models/Domain');
const Subject = require('../models/Subject');

// Apply admin authentication to all routes
router.use(authMiddleware.adminAuth);

// @route   GET api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin)
router.get('/dashboard', async (req, res) => {
    try {
        const [
            totalUsers,
            totalResources,
            pendingResources,
            approvedResources,
            totalUniversities,
            totalDomains,
            totalSubjects
        ] = await Promise.all([
            User.countDocuments(),
            Resource.countDocuments(),
            Resource.countDocuments({ approved: false }),
            Resource.countDocuments({ approved: true }),
            University.countDocuments(),
            Domain.countDocuments(),
            Subject.countDocuments()
        ]);

        res.json({
            stats: {
                users: totalUsers,
                resources: totalResources,
                pendingResources,
                approvedResources,
                universities: totalUniversities,
                domains: totalDomains,
                subjects: totalSubjects
            },
            admin: {
                id: req.currentUser.id,
                name: req.currentUser.name,
                email: req.currentUser.email
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/admin/resources/pending
// @desc    Get all pending resources
// @access  Private (Admin)
router.get('/resources/pending', async (req, res) => {
    try {
        const resources = await Resource.find({ approved: false })
            .populate('submittedBy', 'name email')
            .populate('university', 'name')
            .populate('domain', 'name')
            .populate('subject', 'name')
            .sort({ createdAt: -1 });

        res.json(resources);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT api/admin/resources/:id/approve
// @desc    Approve a resource
// @access  Private (Admin)
router.put('/resources/:id/approve', async (req, res) => {
    try {
        const resource = await Resource.findByIdAndUpdate(
            req.params.id,
            { approved: true },
            { new: true }
        ).populate('submittedBy', 'name email');

        if (!resource) {
            return res.status(404).json({ msg: 'Resource not found' });
        }

        res.json({
            msg: 'Resource approved successfully',
            resource
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE api/admin/resources/:id
// @desc    Delete a resource
// @access  Private (Admin)
router.delete('/resources/:id', async (req, res) => {
    try {
        const resource = await Resource.findByIdAndDelete(req.params.id);

        if (!resource) {
            return res.status(404).json({ msg: 'Resource not found' });
        }

        res.json({ msg: 'Resource deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/admin/users
// @desc    Get all users
// @access  Private (Admin)
router.get('/users', async (req, res) => {
    try {
        const users = await User.find()
            .select('-googleId')
            .sort({ createdAt: -1 });

        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT api/admin/users/:id/role
// @desc    Update user role
// @access  Private (Admin)
router.put('/users/:id/role', [
    check('role', 'Role is required').isIn(['user', 'admin'])
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role: req.body.role },
            { new: true }
        ).select('-googleId');

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json({
            msg: 'User role updated successfully',
            user
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/admin/universities
// @desc    Add a new university
// @access  Private (Admin)
router.post('/universities', [
    check('name', 'University name is required').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const university = new University({
            name: req.body.name,
            location: req.body.location || ''
        });

        await university.save();
        res.json({
            msg: 'University added successfully',
            university
        });
    } catch (err) {
        console.error(err.message);
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'University already exists' });
        }
        res.status(500).send('Server error');
    }
});

// @route   POST api/admin/domains
// @desc    Add a new domain
// @access  Private (Admin)
router.post('/domains', [
    check('name', 'Domain name is required').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const domain = new Domain({
            name: req.body.name,
            description: req.body.description || ''
        });

        await domain.save();
        res.json({
            msg: 'Domain added successfully',
            domain
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/admin/subjects
// @desc    Add a new subject
// @access  Private (Admin)
router.post('/subjects', [
    check('name', 'Subject name is required').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const subject = new Subject({
            name: req.body.name,
            description: req.body.description || ''
        });

        await subject.save();
        res.json({
            msg: 'Subject added successfully',
            subject
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// New routes to get domains by university and subjects by domain
router.get('/universities/:id/domains', async (req, res) => {
    try {
        const university = await University.findById(req.params.id).populate('domains');
        if (!university) {
            return res.status(404).json({ msg: 'University not found' });
        }
        res.json(university.domains);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.get('/domains/:id/subjects', async (req, res) => {
    try {
        const domain = await Domain.findById(req.params.id).populate('subjects');
        if (!domain) {
            return res.status(404).json({ msg: 'Domain not found' });
        }
        res.json(domain.subjects);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
