const Resource = require('../models/Resource');
const User = require('../models/User');

// @desc    Get all approved resources
exports.getResources = async (req, res) => {
    try {
        const resources = await Resource.find({ approved: true })
            .populate('university domain subject submittedBy', 'name');
        res.json(resources);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get single resource
exports.getResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id)
            .populate('university domain subject submittedBy', 'name');

        if (!resource) {
            return res.status(404).json({ msg: 'Resource not found' });
        }

        res.json(resource);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Submit new resource
exports.submitResource = async (req, res) => {
    try {
        const newResource = new Resource({
            ...req.body,
            submittedBy: req.user.id,
            approved: req.user.role === 'admin'
        });

        const resource = await newResource.save();
        res.status(201).json(resource);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};