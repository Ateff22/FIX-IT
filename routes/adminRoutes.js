const express = require('express');
const router = express.Router();
const { getAllUsers, toggleBanUser } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/users', protect, authorize('admin'), getAllUsers);
router.put('/users/:id/ban', protect, authorize('admin'), toggleBanUser);

module.exports = router;