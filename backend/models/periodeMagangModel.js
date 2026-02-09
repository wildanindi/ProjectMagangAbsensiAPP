const db = require('../config/db');

// Create internship period
const createInternshipPeriod = async (periodData) => {
    try {
        const { nama_periode, tanggal_mulai, tanggal_selesai, jatah_izin } = periodData;
        
        const query = `INSERT INTO periode_magang 
                        (nama_periode, tanggal_mulai, tanggal_selesai, jatah_izin)
                    VALUES (?, ?, ?, ?)`;
        
        const [result] = await db.query(query, [
            nama_periode, 
            tanggal_mulai, 
            tanggal_selesai, 
            jatah_izin || 0
        ]);
        
        return { id: result.insertId, ...periodData };
    } catch (error) {
        throw error;
    }
};

// Get all internship periods
const getAllInternshipPeriods = async () => {
    try {
        const query = `SELECT * FROM periode_magang ORDER BY tanggal_mulai DESC`;
        
        const [rows] = await db.query(query);
        return rows;
    } catch (error) {
        throw error;
    }
};

// Get internship period by ID
const getInternshipPeriodById = async (id) => {
    try {
        const query = `SELECT * FROM periode_magang WHERE id = ?`;
        
        const [rows] = await db.query(query, [id]);
        return rows[0];
    } catch (error) {
        throw error;
    }
};

// Update internship period
const updateInternshipPeriod = async (id, periodData) => {
    try {
        const { nama_periode, tanggal_mulai, tanggal_selesai, jatah_izin } = periodData;
        
        const query = `UPDATE periode_magang 
                    SET nama_periode = ?, tanggal_mulai = ?, tanggal_selesai = ?, jatah_izin = ?
                    WHERE id = ?`;
        
        await db.query(query, [nama_periode, tanggal_mulai, tanggal_selesai, jatah_izin, id]);
        
        return { id, ...periodData };
    } catch (error) {
        throw error;
    }
};

// Delete internship period
const deleteInternshipPeriod = async (id) => {
    try {
        // First, remove period reference from users
        await db.query(`UPDATE users SET periode_id = NULL WHERE periode_id = ?`, [id]);
        
        // Then delete period
        const query = `DELETE FROM periode_magang WHERE id = ?`;
        
        await db.query(query, [id]);
        
        return { success: true };
    } catch (error) {
        throw error;
    }
};

// Get internship period with interns count
const getInternshipPeriodWithInternsCount = async (id) => {
    try {
        const query = `SELECT 
                        p.*,
                        COUNT(u.id) as total_interns
                    FROM periode_magang p
                    LEFT JOIN users u ON p.id = u.periode_id
                    WHERE p.id = ?
                    GROUP BY p.id`;
        
        const [rows] = await db.query(query, [id]);
        return rows[0];
    } catch (error) {
        throw error;
    }
};

// Get current active period
const getCurrentActivePeriod = async () => {
    try {
        const query = `SELECT * FROM periode_magang 
                    WHERE CURDATE() BETWEEN tanggal_mulai AND tanggal_selesai
                    LIMIT 1`;
        
        const [rows] = await db.query(query);
        return rows[0];
    } catch (error) {
        throw error;
    }
};

module.exports = {
    createInternshipPeriod,
    getAllInternshipPeriods,
    getInternshipPeriodById,
    updateInternshipPeriod,
    deleteInternshipPeriod,
    getInternshipPeriodWithInternsCount,
    getCurrentActivePeriod
};
