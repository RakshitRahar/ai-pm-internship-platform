const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, uploadCV, getCVAnalysis, reanalyzeCV } = require('../controllers/userController');
const { protect, studentOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect); // All user routes are protected

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/upload-cv', upload.single('cv'), uploadCV);
router.get('/cv-analysis', getCVAnalysis);
router.post('/reanalyze-cv', reanalyzeCV); // Re-run analysis on existing CV

module.exports = router;
