const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  tokenNumber: {
    type: Number,
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'called', 'completed', 'cancelled', 'skipped'],
    default: 'pending'
  },
  calledAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  estimatedWaitTime: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

tokenSchema.index({ service: 1, status: 1 });
tokenSchema.index({ service: 1, tokenNumber: -1 });
tokenSchema.index({ user: 1 });

module.exports = mongoose.model('Token', tokenSchema);

