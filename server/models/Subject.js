const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubjectSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    domain: {
        type: Schema.Types.ObjectId,
        ref: 'Domain',
        required: true
    },
    syllabus: [{
        topic: String,
        resources: [{
            type: Schema.Types.ObjectId,
            ref: 'Resource'
        }]
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Subject', SubjectSchema);