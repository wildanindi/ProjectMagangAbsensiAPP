const express = require('express');
const router = express.Router();
const izinController = require('../controllers/izinController');
const { verifyToken, isAdmin, isUser } = require('../middleware/auth');

// User routes
router.post('/request', verifyToken, isUser, izinController.createLeaveRequest);
router.get('/my-requests', verifyToken, isUser, izinController.getUserLeaveRequests);
router.get('/summary', verifyToken, isUser, izinController.getUserLeaveSummary);
router.delete('/:id', verifyToken, isUser, izinController.deleteLeaveRequest);

// Admin routes
router.get('/admin/all', verifyToken, isAdmin, izinController.getAllLeaveRequests);
router.get('/admin/:id', verifyToken, isAdmin, izinController.getLeaveRequestDetail);
router.put('/admin/:id/approve', verifyToken, isAdmin, izinController.approveLeaveRequest);
router.put('/admin/:id/reject', verifyToken, isAdmin, izinController.rejectLeaveRequest);
router.get('/admin/pending/count', verifyToken, isAdmin, izinController.getPendingLeaveCount);

module.exports = router;
