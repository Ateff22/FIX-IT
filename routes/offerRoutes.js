const express = require('express');
const router = express.Router();
const { submitOffer, acceptOffer, getOffersForRequest } = require('../controllers/offerController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('technician'), submitOffer);
router.put('/:id/accept', protect, authorize('customer'), acceptOffer);
router.get('/:requestId', protect, getOffersForRequest);

module.exports = router;