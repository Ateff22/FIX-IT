const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  request: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceRequest', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  technician: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stars: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Rating', ratingSchema);