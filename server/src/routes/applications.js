const express = require('express');
const router = express.Router();
const {
    submitApplication, getMyApplications, getApplication,
    withdrawApplication, getRecommendations, updateApplicationStatus,
} = require('../controllers/applicationController');
const { protect, adminOnly, studentOnly } = require('../middleware/auth');

router.use(protect);

// Student routes
router.post('/', submitApplication);
router.get('/my', getMyApplications);
router.get('/recommendations', getRecommendations);
router.patch('/:id/withdraw', withdrawApplication);

// Shared (student sees own, admin sees all — logic in controller)
router.get('/:id', getApplication);

// Admin only
router.patch('/:id/status', adminOnly, updateApplicationStatus);

module.exports = router;
