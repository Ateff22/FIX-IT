const ServiceRequest = require('../models/serviceRequest');
const Offer = require('../models/offer');
const Rating = require('../models/rating');

exports.createRequest = async (req, res) => {
  try {
    const { title, description, specialty, location } = req.body;

    const request = await ServiceRequest.create({
      customer: req.user.id,
      title,
      description,
      specialty,
      location,
      photo: req.file ? req.file.path.replace(/\\/g, '/') : undefined,
    });

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRequests = async (req, res) => {
  try {
    const { specialty, status, search } = req.query;
    const filter = {};

    if (specialty) filter.specialty = specialty;
    if (status) filter.status = status;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const requests = await ServiceRequest.find(filter).populate('customer', 'name email phone');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.completeRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (request.status !== 'accepted') {
      return res.status(400).json({ message: 'Request must be accepted before it can be marked completed' });
    }

    request.status = 'completed';
    await request.save();

    res.json({ message: 'Request marked as completed', request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



exports.deleteRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    await Offer.deleteMany({ request: request._id });
    await Rating.deleteMany({ request: request._id });
    await request.deleteOne();

    res.json({ message: 'Request and related offers/ratings deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};