const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  specialty: { type: String, required: true },
  location: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in-progress', 'completed'],
    default: 'pending',
  },
  photo: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);