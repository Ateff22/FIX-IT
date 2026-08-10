const express = require('express');
const router = express.Router();
const { submitRating, getTechnicianReviews } = require('../controllers/ratingController');

const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('customer'), submitRating);
router.get('/technician/:technicianId', protect, getTechnicianReviews);
module.exports = router;
