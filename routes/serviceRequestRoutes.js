const express = require('express');
const router = express.Router();
const { createRequest, getRequests, completeRequest } = require('../controllers/serviceRequestController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('customer'), createRequest);
router.get('/', protect, getRequests);
router.put('/:id/complete', protect, authorize('technician'), completeRequest);

module.exports = router;