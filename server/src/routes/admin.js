const express = require('express');
const router = express.Router();
const {
    getDashboardStats, getAllUsers, getUserDetail, toggleUserActive,
    getAllApplications, triggerBatchScoring, getRankedCandidatesForInternship,
    triggerAllocation, getAllocationReport,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly); // All admin routes require auth + admin role

// Dashboard
router.get('/dashboard', getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetail);
router.patch('/users/:id/toggle-active', toggleUserActive);

// Application management
router.get('/applications', getAllApplications);

// Allocation engine operations
router.post('/internships/:id/score-all', triggerBatchScoring);
router.get('/internships/:id/candidates', getRankedCandidatesForInternship);
router.post('/internships/:id/allocate', triggerAllocation);
router.get('/internships/:id/report', getAllocationReport);

module.exports = router;
