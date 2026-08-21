const Offer = require('../models/offer');
const User = require('../models/user');
const ServiceRequest = require('../models/serviceRequest');

exports.submitOffer = async (req, res) => {
  try {
    const { requestId, price, estimatedTime } = req.body;

    const existingOffer = await Offer.findOne({ request: requestId, technician: req.user.id });
    if (existingOffer) {
      return res.status(400).json({ message: 'You already submitted an offer for this request' });
    }

    const serviceRequest = await ServiceRequest.findById(requestId);
    if (!serviceRequest) return res.status(404).json({ message: 'Request not found' });

    const technician = await User.findById(req.user.id);
    if (technician.specialty !== serviceRequest.specialty) {
      return res.status(400).json({ message: 'This request does not match your specialty' });
    }

    const offer = await Offer.create({
      request: requestId,
      technician: req.user.id,
      price,
      estimatedTime,
    });

    res.status(201).json(offer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.acceptOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: 'Offer not found' });

    const request = await ServiceRequest.findOneAndUpdate(
      { _id: offer.request, status: 'pending' },
      { status: 'accepted' },
      { new: true }
    );

    if (!request) {
      return res.status(400).json({ message: 'This request already has an accepted offer' });
    }

    offer.status = 'accepted';
    await offer.save();

    await Offer.updateMany(
      { request: offer.request, _id: { $ne: offer._id } },
      { status: 'rejected' }
    );

    res.json({ message: 'Offer accepted', offer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOffersForRequest = async (req, res) => {
  try {
    const offers = await Offer.find({ request: req.params.requestId }).populate('technician', 'name email phone');
    res.json(offers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};