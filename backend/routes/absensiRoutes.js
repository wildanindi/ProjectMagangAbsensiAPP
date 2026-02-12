const express = require('express');
const router = express.Router();
const absensiController = require('../controllers/absensiController');
const exportController = require('../controllers/exportController');
const { verifyToken, isAdmin, isUser } = require('../middleware/auth');
const { handleUpload } = require('../middleware/upload');

// User routes
router.post('/check-in', verifyToken, isUser, handleUpload, absensiController.checkIn);
router.get('/today', verifyToken, isUser, absensiController.getAttendanceToday);
router.get('/history', verifyToken, isUser, absensiController.getAttendanceHistory);
router.get('/date-range', verifyToken, isUser, absensiController.getAttendanceByDateRange);
router.get('/stats', verifyToken, isUser, absensiController.getAttendanceStats);

// User export routes
router.get('/export/excel', verifyToken, isUser, exportController.exportUserExcel);
router.get('/export/pdf', verifyToken, isUser, exportController.exportUserPdf);

// Admin routes
router.get('/admin/all', verifyToken, isAdmin, absensiController.getAllAttendance);
router.get('/admin/summary-today', verifyToken, isAdmin, absensiController.getAttendanceSummaryToday);
router.get('/admin/users-today', verifyToken, isAdmin, absensiController.getUsersWithTodayAttendance);
router.get('/admin/user/:userId', verifyToken, isAdmin, absensiController.getUserAttendanceDetail);
router.post('/admin/process-alpha', verifyToken, isAdmin, absensiController.processAutoAlpha);

// Admin export routes
router.get('/admin/export/excel', verifyToken, isAdmin, exportController.exportAdminExcel);
router.get('/admin/export/pdf', verifyToken, isAdmin, exportController.exportAdminPdf);

module.exports = router;
