const express = require('express');
const router = express.Router();
const { submitOffer, acceptOffer } = require('../controllers/offerController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('technician'), submitOffer);
router.put('/:id/accept', protect, authorize('customer'), acceptOffer);

module.exports = router;