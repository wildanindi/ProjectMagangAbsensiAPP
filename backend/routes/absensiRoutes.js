const express = require('express');
const router = express.Router();
const absensiController = require('../controllers/absensiController');
const { verifyToken, isAdmin, isUser } = require('../middleware/auth');

// User routes
router.post('/check-in', verifyToken, isUser, absensiController.checkIn);
router.get('/today', verifyToken, isUser, absensiController.getAttendanceToday);
router.get('/history', verifyToken, isUser, absensiController.getAttendanceHistory);
router.get('/date-range', verifyToken, isUser, absensiController.getAttendanceByDateRange);
router.get('/stats', verifyToken, isUser, absensiController.getAttendanceStats);

// Admin routes
router.get('/admin/all', verifyToken, isAdmin, absensiController.getAllAttendance);
router.get('/admin/summary-today', verifyToken, isAdmin, absensiController.getAttendanceSummaryToday);
router.get('/admin/users-today', verifyToken, isAdmin, absensiController.getUsersWithTodayAttendance);
router.get('/admin/user/:userId', verifyToken, isAdmin, absensiController.getUserAttendanceDetail);

module.exports = router;
