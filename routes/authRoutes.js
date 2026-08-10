const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
router.post('/login', login);

router.post('/register', register);

module.exports = router;


const { protect } = require('../middleware/authMiddleware');

router.get('/me', protect, (req, res) => {
  res.json({ message: 'You are authenticated', user: req.user });
});