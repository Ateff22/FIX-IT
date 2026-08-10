const ServiceRequest = require('../models/serviceRequest');

exports.createRequest = async (req, res) => {
  try {
    const { title, description, specialty, location } = req.body;

    const request = await ServiceRequest.create({
      customer: req.user.id,
      title,
      description,
      specialty,
      location,
      photo: req.file ? req.file.path : undefined,
    });

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find();
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.completeRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = 'completed';
    await request.save();

    res.json({ message: 'Request marked as completed', request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};