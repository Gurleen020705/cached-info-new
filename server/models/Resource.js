const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ResourceSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['university', 'skill', 'competitive'],
    required: true
  },
  university: {
    type: Schema.Types.ObjectId,
    ref: 'University'
  },
  domain: {
    type: Schema.Types.ObjectId,
    ref: 'Domain'
  },
  subject: {
    type: Schema.Types.ObjectId,
    ref: 'Subject'
  },
  skill: {
    type: String
  },
  exam: {
    type: String
  },
  approved: {
    type: Boolean,
    default: false
  },
  submittedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Resource', ResourceSchema);