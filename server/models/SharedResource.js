const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SharedResourceSchema = new Schema({
    shareId: {
        type: String,
        required: true,
        unique: true
    },
    resource: {
        type: Schema.Types.ObjectId,
        ref: 'Resource',
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 30 * 24 * 60 * 60 // Expires after 30 days
    },
    views: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

// Generate unique share ID
SharedResourceSchema.pre('save', async function(next) {
    if (!this.shareId) {
        this.shareId = generateShareId();
    }
    next();
});

function generateShareId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

module.exports = mongoose.model('SharedResource', SharedResourceSchema); 