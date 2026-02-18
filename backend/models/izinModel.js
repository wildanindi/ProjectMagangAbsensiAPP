const db = require('../config/db');

// Create leave request (Pengajuan Izin)
const createLeaveRequest = async (leaveData) => {
    try {
        const { user_id, jenis_izin, tanggal_mulai, tanggal_selesai, alasan } = leaveData;
        
        const query = `INSERT INTO izin 
                        (user_id, jenis_izin, tanggal_mulai, tanggal_selesai, alasan, status)
                    VALUES (?, ?, ?, ?, ?, 'PENDING')`;
        
        const [result] = await db.query(query, [
            user_id, 
            jenis_izin || 'CUTI',
            tanggal_mulai, 
            tanggal_selesai, 
            alasan
        ]);
        
        return { id: result.insertId, ...leaveData };
    } catch (error) {
        throw error;
    }
};

// Get leave request by ID
const getLeaveRequestById = async (id) => {
    try {
        const query = `SELECT 
                        i.*,
                        u.nama,
                        u.email,
                        u.username
                    FROM izin i
                    JOIN users u ON i.user_id = u.id
                    WHERE i.id = ?`;
        
        const [rows] = await db.query(query, [id]);
        return rows[0];
    } catch (error) {
        throw error;
    }
};

// Get user's leave requests
const getUserLeaveRequests = async (userId, status = null) => {
    try {
        let query = `SELECT * FROM izin WHERE user_id = ?`;
        const params = [userId];
        
        if (status) {
            query += ` AND status = ?`;
            params.push(status);
        }
        
        query += ` ORDER BY created_at DESC`;
        
        const [rows] = await db.query(query, params);
        return rows;
    } catch (error) {
        throw error;
    }
};

// Get all leave requests (Admin)
const getAllLeaveRequests = async (status = null) => {
    try {
        let query = `SELECT 
                        i.*,
                        u.nama,
                        u.email,
                        u.username
                    FROM izin i
                    JOIN users u ON i.user_id = u.id
                    WHERE 1=1`;
        const params = [];
        
        if (status) {
            query += ` AND i.status = ?`;
            params.push(status);
        }
        
        query += ` ORDER BY i.created_at DESC`;
        
        const [rows] = await db.query(query, params);
        return rows;
    } catch (error) {
        throw error;
    }
};

// Update leave request status
const updateLeaveRequestStatus = async (id, status, keterangan = null) => {
    try {
        let query;
        let params;

        if (keterangan !== null && keterangan !== undefined) {
            query = `UPDATE izin SET status = ?, keterangan = ? WHERE id = ?`;
            params = [status, keterangan, id];
        } else {
            query = `UPDATE izin SET status = ? WHERE id = ?`;
            params = [status, id];
        }

        await db.query(query, params);
        
        // If approved, calculate days and update user's sisa_izin
        if (status === 'APPROVED') {
            const leaveRequest = await getLeaveRequestById(id);
            
            // Calculate leave days (inclusive)
            const startDate = new Date(leaveRequest.tanggal_mulai);
            const endDate = new Date(leaveRequest.tanggal_selesai);
            const daysRequested = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
            
            // Update user's sisa_izin
            const userLeaveData = await db.query(
                'SELECT sisa_izin FROM users WHERE id = ?',
                [leaveRequest.user_id]
            );
            
            const currentLeave = userLeaveData[0][0].sisa_izin;
            const newLeave = currentLeave - daysRequested;
            
            await db.query(
                'UPDATE users SET sisa_izin = ? WHERE id = ?',
                [newLeave < 0 ? 0 : newLeave, leaveRequest.user_id]
            );
        }
        
        return { success: true };
    } catch (error) {
        throw error;
    }
};

// Delete leave request
const deleteLeaveRequest = async (id) => {
    try {
        const query = `DELETE FROM izin WHERE id = ?`;
        
        await db.query(query, [id]);
        
        return { success: true };
    } catch (error) {
        throw error;
    }
};

// Get leave summary for user (stats about their leave)
const getUserLeaveSummary = async (userId) => {
    try {
        const query = `SELECT 
                        COUNT(CASE WHEN status = 'APPROVED' THEN 1 END) as total_approved,
                        COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as total_pending,
                        COUNT(CASE WHEN status = 'REJECTED' THEN 1 END) as total_rejected,
                        COUNT(*) as total
                    FROM izin
                    WHERE user_id = ?`;
        
        const [rows] = await db.query(query, [userId]);
        return rows[0];
    } catch (error) {
        throw error;
    }
};

// Get pending leave requests count (Admin dashboard)
const getPendingLeaveCount = async () => {
    try {
        const query = `SELECT COUNT(*) as pending_count FROM izin WHERE status = 'PENDING'`;
        
        const [rows] = await db.query(query);
        return rows[0].pending_count;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    createLeaveRequest,
    getLeaveRequestById,
    getUserLeaveRequests,
    getAllLeaveRequests,
    updateLeaveRequestStatus,
    deleteLeaveRequest,
    getUserLeaveSummary,
    getPendingLeaveCount
};
