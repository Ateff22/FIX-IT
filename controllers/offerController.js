const Offer = require('../models/offer');
const ServiceRequest = require('../models/serviceRequest');

exports.submitOffer = async (req, res) => {
  try {
    const { requestId, price, estimatedTime } = req.body;

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

    offer.status = 'accepted';
    await offer.save();

    await Offer.updateMany(
      { request: offer.request, _id: { $ne: offer._id } },
      { status: 'rejected' }
    );

    await ServiceRequest.findByIdAndUpdate(offer.request, { status: 'accepted' });

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