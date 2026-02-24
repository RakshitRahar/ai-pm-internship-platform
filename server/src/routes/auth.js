const express = require('express');
const router = express.Router();
const { register, login, getMe, updatePassword, registerAdmin } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/admin/register', registerAdmin); // Gate with ADMIN_SECRET
router.get('/me', protect, getMe);
router.put('/update-password', protect, updatePassword);

module.exports = router;
