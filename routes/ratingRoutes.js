const express = require('express');
const router = express.Router();
const { submitRating } = require('../controllers/ratingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('customer'), submitRating);

module.exports = router;