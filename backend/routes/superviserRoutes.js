const express = require('express');
const router = express.Router();
const superviserController = require('../controllers/superviserController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Admin only routes
router.get('/all', verifyToken, isAdmin, superviserController.getAllSupervisors);
router.get('/:id', verifyToken, isAdmin, superviserController.getSupervisorDetail);
router.post('/create', verifyToken, isAdmin, superviserController.createSupervisor);
router.put('/:id', verifyToken, isAdmin, superviserController.updateSupervisor);
router.delete('/:id', verifyToken, isAdmin, superviserController.deleteSupervisor);

module.exports = router;
