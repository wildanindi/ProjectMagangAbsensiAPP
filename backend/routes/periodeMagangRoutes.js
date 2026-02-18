const express = require('express');
const router = express.Router();
const periodeMagangController = require('../controllers/periodeMagangController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Admin only routes
router.get('/all', verifyToken, isAdmin, periodeMagangController.getAllInternshipPeriods);
router.get('/current/active', periodeMagangController.getCurrentActivePeriod);
router.get('/:id', verifyToken, isAdmin, periodeMagangController.getInternshipPeriodDetail);
router.post('/create', verifyToken, isAdmin, periodeMagangController.createInternshipPeriod);
router.put('/:id', verifyToken, isAdmin, periodeMagangController.updateInternshipPeriod);
router.delete('/:id', verifyToken, isAdmin, periodeMagangController.deleteInternshipPeriod);

module.exports = router;
