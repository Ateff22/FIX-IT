const User = require('../models/user');
const Rating = require('../models/rating');
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.toggleBanUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isActive = !user.isActive;
    await user.save();

    res.json({ message: `User is now ${user.isActive ? 'active' : 'banned'}`, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.getAllRatings = async (req, res) => {
  try {
    const ratings = await Rating.find()
      .populate('customer', 'name')
      .populate('technician', 'name');
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteRating = async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.id);
    if (!rating) return res.status(404).json({ message: 'Rating not found' });

    await rating.deleteOne();

    res.json({ message: 'Rating deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.updateSpecialty = async (req, res) => {
  try {
    const { specialty } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role !== 'technician') {
      return res.status(400).json({ message: 'Only technicians have a specialty' });
    }

    user.specialty = specialty;
    await user.save();

    res.json({ message: 'Specialty updated', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};