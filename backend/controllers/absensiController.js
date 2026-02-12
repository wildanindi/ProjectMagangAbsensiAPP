const absensiModel = require('../models/absensiModel');
const userModel = require('../models/userModel');
const izinModel = require('../models/izinModel');
const { processAlpha } = require('../scheduler/alphaScheduler');
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

        // Get current time
        const now = dayjs();

        // Batas check-in jam 12:00 (setelahnya otomatis ALPHA)
        const cutoffTime = now.startOf('day').add(12, 'hour');
        if (now.isAfter(cutoffTime)) {
            return res.status(400).json({
                success: false,
                message: 'Batas waktu check-in sudah lewat (12:00). Anda tercatat ALPHA hari ini.'
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

        const jamMasuk = now.format('HH:mm:ss');
        const tanggal = now.format('YYYY-MM-DD');

        // Jam masuk standar 08:00 — setelahnya dianggap terlambat
        const standardTime = now.startOf('day').add(8, 'hour');

        let status = 'HADIR';
        if (now.isAfter(standardTime)) {
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
            message: `Check-in berhasil dengan status ${status === 'TELAT' ? 'TERLAMBAT' : status}`,
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
        const now = dayjs();
        const today = now.format('YYYY-MM-DD');

        // Cek record absensi di DB
        const attendance = await absensiModel.getUserAttendanceToday(userId);

        if (attendance) {
            // Sudah ada record (HADIR / TELAT / ALPHA dari scheduler)
            return res.status(200).json({
                success: true,
                data: attendance
            });
        }

        // Belum ada record — cek apakah user punya izin approved hari ini
        const userLeaves = await izinModel.getUserLeaveRequests(userId, 'APPROVED');
        const hasApprovedLeave = userLeaves.some(leave => {
            const mulai = leave.tanggal_mulai instanceof Date
                ? leave.tanggal_mulai.toISOString().split('T')[0]
                : String(leave.tanggal_mulai).split('T')[0];
            const selesai = leave.tanggal_selesai instanceof Date
                ? leave.tanggal_selesai.toISOString().split('T')[0]
                : String(leave.tanggal_selesai).split('T')[0];
            return today >= mulai && today <= selesai;
        });

        if (hasApprovedLeave) {
            return res.status(200).json({
                success: true,
                message: 'Anda sedang izin hari ini',
                data: { user_id: userId, tanggal: today, jam_masuk: null, status: 'IZIN', foto_path: null }
            });
        }

        // Cek apakah sudah lewat jam 12:00
        if (now.hour() >= 12) {
            return res.status(200).json({
                success: true,
                message: 'Anda tercatat ALPHA hari ini karena tidak melakukan presensi sebelum jam 12:00',
                data: { user_id: userId, tanggal: today, jam_masuk: null, status: 'ALPHA', foto_path: null }
            });
        }

        // Belum jam 12, masih bisa check-in
        return res.status(200).json({
            success: true,
            message: 'Anda belum absen hari ini',
            data: null
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

        // Cek apakah hari ini user sudah ALPHA secara virtual
        // (belum ada record di DB tapi sudah lewat jam 12 & tidak ada izin)
        const now = dayjs();
        if (now.hour() >= 12) {
            const todayRecord = await absensiModel.getUserAttendanceToday(userId);
            if (!todayRecord) {
                // Cek apakah punya izin approved hari ini
                const today = now.format('YYYY-MM-DD');
                const userLeaves = await izinModel.getUserLeaveRequests(userId, 'APPROVED');
                const hasApprovedLeave = userLeaves.some(leave => {
                    const mulai = leave.tanggal_mulai instanceof Date
                        ? leave.tanggal_mulai.toISOString().split('T')[0]
                        : String(leave.tanggal_mulai).split('T')[0];
                    const selesai = leave.tanggal_selesai instanceof Date
                        ? leave.tanggal_selesai.toISOString().split('T')[0]
                        : String(leave.tanggal_selesai).split('T')[0];
                    return today >= mulai && today <= selesai;
                });

                if (!hasApprovedLeave) {
                    // Tambah +1 alpha untuk hari ini yang belum ter-record di DB
                    stats.alpha = (parseInt(stats.alpha) || 0) + 1;
                }
            }
        }

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

// Process auto-alpha manually (Admin)
const processAutoAlpha = async (req, res) => {
    try {
        const result = await processAlpha();

        if (!result) {
            return res.status(409).json({
                success: false,
                message: 'Proses alpha sedang berjalan, coba lagi nanti'
            });
        }

        return res.status(200).json({
            success: true,
            message: `${result.count} user ditandai ALPHA`,
            data: result
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
    getUserAttendanceDetail,
    processAutoAlpha
};
