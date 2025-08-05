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
                submittedBy: null, // Allow anonymous submissions for testing
                approved: true // Auto-approve for testing
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

// @route   POST api/resources/share
// @desc    Create a shareable link for a resource
// @access  Private
router.post('/share', authMiddleware, async (req, res) => {
    try {
        const { resourceId } = req.body;

        if (!resourceId) {
            return res.status(400).json({ msg: 'Resource ID is required' });
        }

        // Check if resource exists and is approved
        const resource = await Resource.findById(resourceId);
        if (!resource) {
            return res.status(404).json({ msg: 'Resource not found' });
        }

        if (!resource.approved) {
            return res.status(400).json({ msg: 'Cannot share unapproved resources' });
        }

        // Create shared resource
        const SharedResource = require('../models/SharedResource');
        const sharedResource = new SharedResource({
            resource: resourceId,
            createdBy: req.user.id
        });

        await sharedResource.save();

        res.json({ shareId: sharedResource.shareId });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/resources/shared/:shareId
// @desc    Get shared resource by share ID
// @access  Public
router.get('/shared/:shareId', async (req, res) => {
    try {
        const SharedResource = require('../models/SharedResource');
        
        const sharedResource = await SharedResource.findOne({
            shareId: req.params.shareId,
            isActive: true
        }).populate({
            path: 'resource',
            populate: [
                { path: 'university', select: 'name' },
                { path: 'domain', select: 'name' },
                { path: 'subject', select: 'name' },
                { path: 'submittedBy', select: 'name' }
            ]
        });

        if (!sharedResource) {
            return res.status(404).json({ msg: 'Shared resource not found or expired' });
        }

        // Increment view count
        sharedResource.views += 1;
        await sharedResource.save();

        res.json(sharedResource.resource);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/resources/:id
// @desc    Get resource by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id)
            .populate('university', 'name')
            .populate('domain', 'name')
            .populate('subject', 'name')
            .populate('submittedBy', 'name email');
        
        if (!resource) {
            return res.status(404).json({ msg: 'Resource not found' });
        }
        
        res.json(resource);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Resource not found' });
        }
        res.status(500).send('Server error');
    }
});

// @route   PUT api/resources/:id
// @desc    Update resource
// @access  Private (Admin or Resource Owner)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { title, description, url, type, university, domain, subject, skill, exam } = req.body;
        
        let resource = await Resource.findById(req.params.id);
        
        if (!resource) {
            return res.status(404).json({ msg: 'Resource not found' });
        }
        
        // Check if user is admin or resource owner
        const user = await User.findById(req.user.id);
        if (user.role !== 'admin' && resource.submittedBy.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }
        
        // Build resource object
        const resourceFields = {
            title: title || resource.title,
            description: description || resource.description,
            url: url || resource.url,
            type: type || resource.type,
            university: type === 'university' ? university : null,
            domain: type === 'university' ? domain : null,
            subject: type === 'university' ? subject : null,
            skill: type === 'skill' ? skill : null,
            exam: type === 'competitive' ? exam : null
        };
        
        resource = await Resource.findByIdAndUpdate(
            req.params.id,
            { $set: resourceFields },
            { new: true }
        ).populate('university domain subject submittedBy');
        
        res.json(resource);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Resource not found' });
        }
        res.status(500).send('Server error');
    }
});

// @route   DELETE api/resources/:id
// @desc    Delete resource
// @access  Private (Admin or Resource Owner)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        
        if (!resource) {
            return res.status(404).json({ msg: 'Resource not found' });
        }
        
        // Check if user is admin or resource owner
        const user = await User.findById(req.user.id);
        if (user.role !== 'admin' && resource.submittedBy.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }
        
        await Resource.findByIdAndDelete(req.params.id);
        
        res.json({ msg: 'Resource deleted successfully' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Resource not found' });
        }
        res.status(500).send('Server error');
    }
});

module.exports = router;