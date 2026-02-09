const db = require('../config/db');

// Create supervisor (Pembimbing)
const createSupervisor = async (supervisorData) => {
    try {
        const { nama, email, nohp } = supervisorData;
        
        const query = `INSERT INTO pembimbing (nama, email, nohp) VALUES (?, ?, ?)`;
        
        const [result] = await db.query(query, [nama, email, nohp]);
        
        return { id: result.insertId, ...supervisorData };
    } catch (error) {
        throw error;
    }
};

// Get all supervisors
const getAllSupervisors = async () => {
    try {
        const query = `SELECT * FROM pembimbing ORDER BY nama ASC`;
        
        const [rows] = await db.query(query);
        return rows;
    } catch (error) {
        throw error;
    }
};

// Get supervisor by ID
const getSupervisorById = async (id) => {
    try {
        const query = `SELECT * FROM pembimbing WHERE id = ?`;
        
        const [rows] = await db.query(query, [id]);
        return rows[0];
    } catch (error) {
        throw error;
    }
};

// Update supervisor
const updateSupervisor = async (id, supervisorData) => {
    try {
        const { nama, email, nohp } = supervisorData;
        
        const query = `UPDATE pembimbing SET nama = ?, email = ?, nohp = ? WHERE id = ?`;
        
        await db.query(query, [nama, email, nohp, id]);
        
        return { id, ...supervisorData };
    } catch (error) {
        throw error;
    }
};

// Delete supervisor
const deleteSupervisor = async (id) => {
    try {
        // First, remove supervisor reference from users
        await db.query(`UPDATE users SET pembimbing_id = NULL WHERE pembimbing_id = ?`, [id]);
        
        // Then delete supervisor
        const query = `DELETE FROM pembimbing WHERE id = ?`;
        
        await db.query(query, [id]);
        
        return { success: true };
    } catch (error) {
        throw error;
    }
};

// Get supervisor with their interns count
const getSupervisorWithInternsCount = async (id) => {
    try {
        const query = `SELECT 
                        p.*,
                        COUNT(u.id) as total_interns
                    FROM pembimbing p
                    LEFT JOIN users u ON p.id = u.pembimbing_id
                    WHERE p.id = ?
                    GROUP BY p.id`;
        
        const [rows] = await db.query(query, [id]);
        return rows[0];
    } catch (error) {
        throw error;
    }
};

module.exports = {
    createSupervisor,
    getAllSupervisors,
    getSupervisorById,
    updateSupervisor,
    deleteSupervisor,
    getSupervisorWithInternsCount
};
