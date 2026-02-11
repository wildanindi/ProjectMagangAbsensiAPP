const db = require('../config/db');

// Create attendance record (check-in dengan foto)
const createAttendance = async (attendanceData) => {
    try {
        const { user_id, tanggal, jam_masuk, status, foto_path } = attendanceData;
        
        const query = `INSERT INTO absensi 
                        (user_id, tanggal, jam_masuk, status, foto_path)
                    VALUES (?, ?, ?, ?, ?)`;
        
        const [result] = await db.query(query, [
            user_id, 
            tanggal, 
            jam_masuk, 
            status, 
            foto_path
        ]);
        
        return { id: result.insertId, ...attendanceData };
    } catch (error) {
        throw error;
    }
};

// Get attendance by ID
const getAttendanceById = async (id) => {
    try {
        const query = `SELECT * FROM absensi WHERE id = ?`;
        
        const [rows] = await db.query(query, [id]);
        return rows[0];
    } catch (error) {
        throw error;
    }
};

// Get user's attendance today
const getUserAttendanceToday = async (userId) => {
    try {
        const query = `SELECT * FROM absensi WHERE user_id = ? AND tanggal = CURDATE()`;
        
        const [rows] = await db.query(query, [userId]);
        return rows[0];
    } catch (error) {
        throw error;
    }
};

// Get user's attendance history
const getUserAttendanceHistory = async (userId, limit = 50, offset = 0) => {
    try {
        const query = `SELECT * FROM absensi 
                    WHERE user_id = ? 
                    ORDER BY tanggal DESC 
                    LIMIT ? OFFSET ?`;
        
        const [rows] = await db.query(query, [userId, limit, offset]);
        return rows;
    } catch (error) {
        throw error;
    }
};

// Get user's attendance history with date range
const getUserAttendanceByDateRange = async (userId, startDate, endDate) => {
    try {
        const query = `SELECT * FROM absensi 
                    WHERE user_id = ? 
                    AND tanggal BETWEEN ? AND ?
                    ORDER BY tanggal ASC`;
        
        const [rows] = await db.query(query, [userId, startDate, endDate]);
        return rows;
    } catch (error) {
        throw error;
    }
};

// Get all attendance records (Admin)
const getAllAttendance = async (limit = 100, offset = 0) => {
    try {
        const query = `SELECT 
                        a.*,
                        u.nama,
                        u.email,
                        u.username
                    FROM absensi a
                    JOIN users u ON a.user_id = u.id
                    ORDER BY a.tanggal DESC
                    LIMIT ? OFFSET ?`;
        
        const [rows] = await db.query(query, [limit, offset]);
        return rows;
    } catch (error) {
        throw error;
    }
};

// Get attendance summary for today (Admin)
const getAttendanceSummaryToday = async () => {
    try {
        const query = `SELECT 
                        COUNT(CASE WHEN status = 'HADIR' THEN 1 END) as hadir,
                        COUNT(CASE WHEN status = 'TELAT' THEN 1 END) as telat,
                        COUNT(CASE WHEN status = 'ALPHA' THEN 1 END) as alpha,
                        COUNT(*) as total_record,
                        (SELECT COUNT(*) FROM izin WHERE status = 'APPROVED' AND CURDATE() BETWEEN tanggal_mulai AND tanggal_selesai) as izin
                    FROM absensi 
                    WHERE tanggal = CURDATE() AND user_id IN (
                        SELECT id FROM users WHERE role = 'USER'
                    )`;
        
        const [rows] = await db.query(query);
        return rows[0] || { hadir: 0, telat: 0, alpha: 0, izin: 0, total_record: 0 };
    } catch (error) {
        throw error;
    }
};

// Get user list with today's attendance
const getUsersWithTodayAttendance = async () => {
    try {
        const query = `SELECT 
                        u.id,
                        u.nama,
                        u.email,
                        u.username,
                        u.sisa_izin,
                        COALESCE(a.status, 'ALPHA') AS status_hari_ini,
                        COALESCE(a.jam_masuk, NULL) AS jam_masuk_hari_ini,
                        COALESCE(a.foto_path, NULL) AS foto_hari_ini
                    FROM users u
                    LEFT JOIN absensi a 
                        ON u.id = a.user_id 
                        AND DATE(a.tanggal) = CURDATE()
                    WHERE u.role = 'USER'
                    ORDER BY u.nama ASC`;
        
        const [rows] = await db.query(query);
        return rows;
    } catch (error) {
        throw error;
    }
};

// Get user attendance statistics
const getUserAttendanceStats = async (userId) => {
    try {
        const query = `SELECT 
                        COUNT(CASE WHEN a.status = 'HADIR' THEN 1 END) as hadir,
                        COUNT(CASE WHEN a.status = 'TELAT' THEN 1 END) as telat,
                        COUNT(CASE WHEN a.status = 'ALPHA' THEN 1 END) as alpha,
                        COUNT(*) as total,
                        (SELECT COUNT(*) FROM izin WHERE user_id = ? AND status = 'APPROVED') as izin
                    FROM absensi a
                    WHERE a.user_id = ?`;
        
        const [rows] = await db.query(query, [userId, userId]);
        return rows[0];
    } catch (error) {
        throw error;
    }
};

// Update attendance record
const updateAttendance = async (id, attendanceData) => {
    try {
        const { status, foto_path } = attendanceData;
        
        const query = `UPDATE absensi SET status = ?, foto_path = ? WHERE id = ?`;
        
        await db.query(query, [status, foto_path, id]);
        
        return { id, ...attendanceData };
    } catch (error) {
        throw error;
    }
};

// Delete attendance record
const deleteAttendance = async (id) => {
    try {
        const query = `DELETE FROM absensi WHERE id = ?`;
        
        await db.query(query, [id]);
        
        return { success: true };
    } catch (error) {
        throw error;
    }
};

module.exports = {
    createAttendance,
    getAttendanceById,
    getUserAttendanceToday,
    getUserAttendanceHistory,
    getUserAttendanceByDateRange,
    getAllAttendance,
    getAttendanceSummaryToday,
    getUsersWithTodayAttendance,
    getUserAttendanceStats,
    updateAttendance,
    deleteAttendance
};
