const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const Resource = require('../models/Resource');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// @route   GET api/users/saved-resources
// @desc    Get user's saved resources
// @access  Private
router.get('/saved-resources', async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate({
            path: 'savedResources',
            populate: [
                { path: 'university', select: 'name' },
                { path: 'domain', select: 'name' },
                { path: 'subject', select: 'name' },
                { path: 'submittedBy', select: 'name' }
            ]
        });

        res.json(user.savedResources || []);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/users/saved-resources
// @desc    Save a resource to user's saved list
// @access  Private
router.post('/saved-resources', async (req, res) => {
    try {
        const { resourceId } = req.body;

        if (!resourceId) {
            return res.status(400).json({ msg: 'Resource ID is required' });
        }

        // Check if resource exists
        const resource = await Resource.findById(resourceId);
        if (!resource) {
            return res.status(404).json({ msg: 'Resource not found' });
        }

        // Check if resource is already saved
        const user = await User.findById(req.user.id);
        if (user.savedResources.includes(resourceId)) {
            return res.status(400).json({ msg: 'Resource already saved' });
        }

        // Add resource to saved list
        user.savedResources.push(resourceId);
        await user.save();

        res.json({ msg: 'Resource saved successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE api/users/saved-resources/:id
// @desc    Remove a resource from user's saved list
// @access  Private
router.delete('/saved-resources/:id', async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        // Remove resource from saved list
        user.savedResources = user.savedResources.filter(
            id => id.toString() !== req.params.id
        );
        
        await user.save();

        res.json({ msg: 'Resource removed from saved list' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-googleId');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', async (req, res) => {
    try {
        const { name, email } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, email },
            { new: true }
        ).select('-googleId');

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router; 