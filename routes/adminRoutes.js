const express = require('express');
const router = express.Router();
const { getAllUsers, toggleBanUser, getAllRatings, deleteRating } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/users', protect, authorize('admin'), getAllUsers);
router.put('/users/:id/ban', protect, authorize('admin'), toggleBanUser);
router.get('/ratings', protect, authorize('admin'), getAllRatings);
router.delete('/ratings/:id', protect, authorize('admin'), deleteRating);
module.exports = router;