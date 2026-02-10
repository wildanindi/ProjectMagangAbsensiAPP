const absensiModel = require('../models/absensiModel');
const userModel = require('../models/userModel');
const dayjs = require('dayjs');
const path = require('path');

// Check-in (Absensi masuk)
const checkIn = async (req, res) => {
    try {
        const userId = req.user.id;

        // Validate photo upload
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Foto harus diupload sebagai bukti absensi'
            });
        }

        // Check if user already checked in today
        const existingAttendance = await absensiModel.getUserAttendanceToday(userId);

        if (existingAttendance) {
            return res.status(400).json({
                success: false,
                message: 'Anda sudah absen hari ini'
            });
        }

        // Get current time
        const now = dayjs();
        const jamMasuk = now.format('HH:mm:ss');
        const tanggal = now.format('YYYY-MM-DD');

        // Check time (08:00 is the standard check-in time)
        const checkInTime = dayjs(jamMasuk, 'HH:mm:ss');
        const standardTime = dayjs('08:00:00', 'HH:mm:ss');

        let status = 'HADIR';
        if (checkInTime.isAfter(standardTime)) {
            status = 'TELAT';
        }

        // Save photo path (relative path for serving)
        const fotoPath = `/uploads/absensi/${req.file.filename}`;

        // Create attendance record
        const attendanceData = {
            user_id: userId,
            tanggal,
            jam_masuk: jamMasuk,
            status,
            foto_path: fotoPath
        };

        const newAttendance = await absensiModel.createAttendance(attendanceData);

        return res.status(201).json({
            success: true,
            message: `Check-in berhasil dengan status ${status}`,
            data: newAttendance
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get attendance today (Check status hari ini)
const getAttendanceToday = async (req, res) => {
    try {
        const userId = req.user.id;

        const attendance = await absensiModel.getUserAttendanceToday(userId);

        if (!attendance) {
            return res.status(200).json({
                success: true,
                message: 'Anda belum absen hari ini',
                data: null
            });
        }

        return res.status(200).json({
            success: true,
            data: attendance
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get user attendance history
const getAttendanceHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 50, offset = 0 } = req.query;

        const attendanceHistory = await absensiModel.getUserAttendanceHistory(
            userId,
            parseInt(limit),
            parseInt(offset)
        );

        return res.status(200).json({
            success: true,
            data: attendanceHistory
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get attendance by date range
const getAttendanceByDateRange = async (req, res) => {
    try {
        const userId = req.user.id;
        const { startDate, endDate } = req.query;

        // Validate dates
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'startDate dan endDate harus diisi'
            });
        }

        const attendanceList = await absensiModel.getUserAttendanceByDateRange(
            userId,
            startDate,
            endDate
        );

        return res.status(200).json({
            success: true,
            data: attendanceList
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get user attendance statistics
const getAttendanceStats = async (req, res) => {
    try {
        const userId = req.user.id;

        const stats = await absensiModel.getUserAttendanceStats(userId);

        return res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============ ADMIN ENDPOINTS ============

// Get all attendance records (Admin)
const getAllAttendance = async (req, res) => {
    try {
        const { limit = 100, offset = 0 } = req.query;

        const attendanceList = await absensiModel.getAllAttendance(
            parseInt(limit),
            parseInt(offset)
        );

        return res.status(200).json({
            success: true,
            data: attendanceList
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get attendance summary today (Admin)
const getAttendanceSummaryToday = async (req, res) => {
    try {
        const summary = await absensiModel.getAttendanceSummaryToday();

        return res.status(200).json({
            success: true,
            data: summary
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get users with today's attendance (Admin)
const getUsersWithTodayAttendance = async (req, res) => {
    try {
        const usersList = await absensiModel.getUsersWithTodayAttendance();

        return res.status(200).json({
            success: true,
            data: usersList
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get specific user's attendance detail (Admin)
const getUserAttendanceDetail = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await userModel.getUserById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }

        const stats = await absensiModel.getUserAttendanceStats(userId);
        const history = await absensiModel.getUserAttendanceHistory(userId, 30, 0);

        return res.status(200).json({
            success: true,
            data: {
                user,
                stats,
                recentAttendance: history
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    checkIn,
    getAttendanceToday,
    getAttendanceHistory,
    getAttendanceByDateRange,
    getAttendanceStats,
    getAllAttendance,
    getAttendanceSummaryToday,
    getUsersWithTodayAttendance,
    getUserAttendanceDetail
};
