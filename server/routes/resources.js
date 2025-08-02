const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const Resource = require('../models/Resource');
const User = require('../models/User');

// @route   GET api/resources
// @desc    Get all approved resources
// @access  Public
router.get('/', async (req, res) => {
    try {
        const resources = await Resource.find({ approved: true })
            .populate('university', 'name')
            .populate('domain', 'name')
            .populate('subject', 'name');
        res.json(resources);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/resources
// @desc    Submit a new resource
// @access  Private
router.post(
    '/',
    [
        authMiddleware,
        [
            check('title', 'Title is required').not().isEmpty(),
            check('url', 'Valid URL is required').isURL(),
            check('type', 'Type is required').isIn(['university', 'skill', 'competitive'])
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, description, url, type, university, domain, subject, skill, exam } = req.body;

        try {
            const newResource = new Resource({
                title,
                description,
                url,
                type,
                university: type === 'university' ? university : null,
                domain: type === 'university' ? domain : null,
                subject: type === 'university' ? subject : null,
                skill: type === 'skill' ? skill : null,
                exam: type === 'competitive' ? exam : null,
                submittedBy: req.user.id,
                approved: req.user.role === 'admin' // Auto-approve if admin
            });

            const resource = await newResource.save();
            res.json(resource);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

// @route   PUT api/resources/approve/:id
// @desc    Approve a resource
// @access  Private (Admin)
router.put('/approve/:id', authMiddleware, async (req, res) => {
    try {
        // Check if user is admin
        const user = await User.findById(req.user.id);
        if (user.role !== 'admin') {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        const resource = await Resource.findByIdAndUpdate(
            req.params.id,
            { approved: true },
            { new: true }
        );

        if (!resource) {
            return res.status(404).json({ msg: 'Resource not found' });
        }

        res.json(resource);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;