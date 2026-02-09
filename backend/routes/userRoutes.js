const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Admin only routes
router.get('/all', verifyToken, isAdmin, userController.getAllUsers);
router.get('/interns', verifyToken, isAdmin, userController.getAllInterns);
router.get('/:id', verifyToken, isAdmin, userController.getUserDetail);
router.post('/create', verifyToken, isAdmin, userController.createIntern);
router.put('/:id', verifyToken, isAdmin, userController.updateUserData);
router.delete('/:id', verifyToken, isAdmin, userController.deleteUserData);
router.put('/:id/reset-password', verifyToken, isAdmin, userController.resetUserPassword);
router.put('/:id/leave-balance', verifyToken, isAdmin, userController.updateUserLeaveBalance);

module.exports = router;
