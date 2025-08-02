const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UniversitySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    domains: [{
        type: Schema.Types.ObjectId,
        ref: 'Domain'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('University', UniversitySchema);