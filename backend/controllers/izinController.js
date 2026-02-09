const izinModel = require('../models/izinModel');
const userModel = require('../models/userModel');

// Create leave request (User - Pengajuan izin)
const createLeaveRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const { tanggal_mulai, tanggal_selesai, alasan } = req.body;

        // Validate input
        if (!tanggal_mulai || !tanggal_selesai) {
            return res.status(400).json({
                success: false,
                message: 'Tanggal mulai dan tanggal selesai harus diisi'
            });
        }

        // Create leave request
        const leaveData = {
            user_id: userId,
            tanggal_mulai,
            tanggal_selesai,
            alasan: alasan || ''
        };

        const newLeaveRequest = await izinModel.createLeaveRequest(leaveData);

        return res.status(201).json({
            success: true,
            message: 'Pengajuan izin berhasil dibuat',
            data: newLeaveRequest
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get user's leave requests (User)
const getUserLeaveRequests = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status } = req.query;

        const leaveRequests = await izinModel.getUserLeaveRequests(userId, status);

        return res.status(200).json({
            success: true,
            data: leaveRequests,
            total: leaveRequests.length
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get user's leave summary (User - Rekapan izin)
const getUserLeaveSummary = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await userModel.getUserById(userId);
        const summary = await izinModel.getUserLeaveSummary(userId);

        return res.status(200).json({
            success: true,
            data: {
                user,
                summary
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

// Delete leave request (User - hanya PENDING)
const deleteLeaveRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Get leave request
        const leaveRequest = await izinModel.getLeaveRequestById(id);

        if (!leaveRequest) {
            return res.status(404).json({
                success: false,
                message: 'Pengajuan izin tidak ditemukan'
            });
        }

        // Check if it belongs to the user
        if (leaveRequest.user_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Anda tidak berhak menghapus pengajuan ini'
            });
        }

        // Check if status is PENDING
        if (leaveRequest.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                message: 'Hanya pengajuan dengan status PENDING yang bisa dihapus'
            });
        }

        await izinModel.deleteLeaveRequest(id);

        return res.status(200).json({
            success: true,
            message: 'Pengajuan izin berhasil dihapus'
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

// Get all leave requests (Admin)
const getAllLeaveRequests = async (req, res) => {
    try {
        const { status } = req.query;

        const leaveRequests = await izinModel.getAllLeaveRequests(status);

        return res.status(200).json({
            success: true,
            data: leaveRequests,
            total: leaveRequests.length
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get leave request detail (Admin)
const getLeaveRequestDetail = async (req, res) => {
    try {
        const { id } = req.params;

        const leaveRequest = await izinModel.getLeaveRequestById(id);

        if (!leaveRequest) {
            return res.status(404).json({
                success: false,
                message: 'Pengajuan izin tidak ditemukan'
            });
        }

        return res.status(200).json({
            success: true,
            data: leaveRequest
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Approve leave request (Admin)
const approveLeaveRequest = async (req, res) => {
    try {
        const { id } = req.params;

        // Get leave request
        const leaveRequest = await izinModel.getLeaveRequestById(id);

        if (!leaveRequest) {
            return res.status(404).json({
                success: false,
                message: 'Pengajuan izin tidak ditemukan'
            });
        }

        // Check if already approved/rejected
        if (leaveRequest.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                message: `Pengajuan izin sudah di-${leaveRequest.status}`
            });
        }

        // Update status to APPROVED
        await izinModel.updateLeaveRequestStatus(id, 'APPROVED');

        return res.status(200).json({
            success: true,
            message: 'Pengajuan izin berhasil disetujui'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Reject leave request (Admin)
const rejectLeaveRequest = async (req, res) => {
    try {
        const { id } = req.params;

        // Get leave request
        const leaveRequest = await izinModel.getLeaveRequestById(id);

        if (!leaveRequest) {
            return res.status(404).json({
                success: false,
                message: 'Pengajuan izin tidak ditemukan'
            });
        }

        // Check if already approved/rejected
        if (leaveRequest.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                message: `Pengajuan izin sudah di-${leaveRequest.status}`
            });
        }

        // Update status to REJECTED
        await izinModel.updateLeaveRequestStatus(id, 'REJECTED');

        return res.status(200).json({
            success: true,
            message: 'Pengajuan izin berhasil ditolak'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get pending leave count (Admin - for dashboard)
const getPendingLeaveCount = async (req, res) => {
    try {
        const count = await izinModel.getPendingLeaveCount();

        return res.status(200).json({
            success: true,
            data: { pending_count: count }
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
    createLeaveRequest,
    getUserLeaveRequests,
    getUserLeaveSummary,
    deleteLeaveRequest,
    getAllLeaveRequests,
    getLeaveRequestDetail,
    approveLeaveRequest,
    rejectLeaveRequest,
    getPendingLeaveCount
};
