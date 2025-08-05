const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ExamSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Engineering', 'Medical', 'Management', 'Government', 'Banking', 'Teaching', 'Law', 'Other']
    },
    level: {
        type: String,
        enum: ['National', 'State', 'University', 'International'],
        default: 'National'
    },
    subjects: [{
        type: String
    }],
    description: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Exam', ExamSchema);
