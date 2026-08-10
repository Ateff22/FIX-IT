const Rating = require('../models/rating');
const ServiceRequest = require('../models/serviceRequest');

exports.submitRating = async (req, res) => {
  try {
    const { requestId, stars, comment } = req.body;

    const request = await ServiceRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (request.status !== 'completed') {
      return res.status(400).json({ message: 'Request is not completed yet' });
    }

    const existingRating = await Rating.findOne({ request: requestId });
    if (existingRating) {
     return res.status(400).json({ message: 'This request has already been rated' });
    }


    const offer = await require('../models/offer').findOne({ request: requestId, status: 'accepted' });

    const rating = await Rating.create({
      request: requestId,
      customer: req.user.id,
      technician: offer.technician,
      stars,
      comment,
    });

    res.status(201).json(rating);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTechnicianReviews = async (req, res) => {
  try {
    const reviews = await Rating.find({ technician: req.params.technicianId }).populate('customer', 'name');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};