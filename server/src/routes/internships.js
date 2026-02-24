const express = require('express');
const router = express.Router();
const {
    getInternships, getInternship, createInternship,
    updateInternship, deleteInternship, getInternshipStats,
} = require('../controllers/internshipController');
const { protect, adminOnly } = require('../middleware/auth');

// Public routes
router.get('/', getInternships);
router.get('/:id', getInternship);

// Protected routes (admin only)
router.post('/', protect, adminOnly, createInternship);
router.put('/:id', protect, adminOnly, updateInternship);
router.delete('/:id', protect, adminOnly, deleteInternship);
router.get('/:id/stats', protect, adminOnly, getInternshipStats);

module.exports = router;
