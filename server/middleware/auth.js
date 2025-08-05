const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Basic authentication middleware
module.exports = function (req, res, next) {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if no token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

// Admin authorization middleware
module.exports.adminAuth = async function (req, res, next) {
    try {
        // First check if user is authenticated
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }

        // Get user from database to check current role
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        // Check if user is admin
        if (user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        // Add user object to request for use in route handlers
        req.currentUser = user;
        next();
    } catch (err) {
        console.error('Admin auth error:', err);
        res.status(500).json({ success: false, message: 'Server error in authorization' });
    }
};

// Resource owner or admin authorization
module.exports.resourceOwnerOrAdmin = async function (req, res, next) {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ msg: 'Authentication required' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(401).json({ msg: 'User not found' });
        }

        // Admin can access anything
        if (user.role === 'admin') {
            req.currentUser = user;
            return next();
        }

        // For non-admin users, check if they own the resource
        const resourceId = req.params.id;
        const Resource = require('../models/Resource');
        const resource = await Resource.findById(resourceId);

        if (!resource) {
            return res.status(404).json({ msg: 'Resource not found' });
        }

        // Check if user is the owner of the resource
        if (resource.submittedBy.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Access denied. You can only modify your own resources.' });
        }

        req.currentUser = user;
        req.resource = resource;
        next();
    } catch (err) {
        console.error('Resource owner auth error:', err);
        res.status(500).json({ msg: 'Server error in authorization' });
    }
};

// Optional authentication middleware (doesn't fail if no token)
module.exports.optionalAuth = function (req, res, next) {
    const token = req.header('x-auth-token');

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        req.user = null;
        next();
    }
};

// Rate limiting helper (basic implementation)
module.exports.rateLimiter = function (maxRequests = 100, windowMs = 15 * 60 * 1000) {
    const requests = new Map();

    return function (req, res, next) {
        const ip = req.ip;
        const now = Date.now();
        const windowStart = now - windowMs;

        // Clean old entries
        if (requests.has(ip)) {
            requests.set(ip, requests.get(ip).filter(time => time > windowStart));
        }

        const userRequests = requests.get(ip) || [];

        if (userRequests.length >= maxRequests) {
            return res.status(429).json({ msg: 'Too many requests, please try again later' });
        }

        userRequests.push(now);
        requests.set(ip, userRequests);
        next();
    };
};