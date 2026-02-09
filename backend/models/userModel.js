const db = require('../config/db');
const bcrypt = require('bcrypt');

// Get all users (Admin only)
const getAllUsers = async (role = null) => {
    try {
        let query = `SELECT 
                        u.id, 
                        u.nama, 
                        u.email, 
                        u.username, 
                        u.role, 
                        u.pembimbing_id,
                        u.periode_id,
                        u.sisa_izin,
                        p.nama_periode,
                        pb.nama AS pembimbing_nama,
                        u.created_at
                    FROM users u
                    LEFT JOIN periode_magang p ON u.periode_id = p.id
                    LEFT JOIN pembimbing pb ON u.pembimbing_id = pb.id
                    WHERE 1=1`;
        
        if (role) {
            query += ` AND u.role = '${role}'`;
        }
        
        query += ` ORDER BY u.created_at DESC`;
        
        const [rows] = await db.query(query);
        return rows;
    } catch (error) {
        throw error;
    }
};

// Get user by ID
const getUserById = async (id) => {
    try {
        const query = `SELECT 
                        u.id, 
                        u.nama, 
                        u.email, 
                        u.username, 
                        u.password,
                        u.role, 
                        u.pembimbing_id,
                        u.periode_id,
                        u.sisa_izin,
                        p.nama_periode,
                        pb.nama AS pembimbing_nama,
                        u.created_at
                    FROM users u
                    LEFT JOIN periode_magang p ON u.periode_id = p.id
                    LEFT JOIN pembimbing pb ON u.pembimbing_id = pb.id
                    WHERE u.id = ?`;
        
        const [rows] = await db.query(query, [id]);
        return rows[0];
    } catch (error) {
        throw error;
    }
};

// Get user by username
const getUserByUsername = async (username) => {
    try {
        const query = `SELECT 
                        u.id, 
                        u.nama, 
                        u.email, 
                        u.username, 
                        u.password,
                        u.role, 
                        u.pembimbing_id,
                        u.periode_id,
                        u.sisa_izin,
                        u.created_at
                    FROM users u
                    WHERE u.username = ?`;
        
        const [rows] = await db.query(query, [username]);
        return rows[0];
    } catch (error) {
        throw error;
    }
};

// Create new user
const createUser = async (userData) => {
    try {
        const { nama, email, username, password, role, pembimbing_id, periode_id, sisa_izin } = userData;
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const query = `INSERT INTO users 
                        (nama, email, username, password, role, pembimbing_id, periode_id, sisa_izin)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        
        const [result] = await db.query(query, [
            nama, 
            email, 
            username, 
            hashedPassword, 
            role, 
            pembimbing_id || null, 
            periode_id || null,
            sisa_izin || 0
        ]);
        
        return { id: result.insertId, ...userData };
    } catch (error) {
        throw error;
    }
};

// Update user
const updateUser = async (id, userData) => {
    try {
        const { nama, email, pembimbing_id, periode_id } = userData;
        
        const query = `UPDATE users 
                    SET nama = ?, email = ?, pembimbing_id = ?, periode_id = ?
                    WHERE id = ?`;
        
        await db.query(query, [nama, email, pembimbing_id || null, periode_id || null, id]);
        
        return { id, ...userData };
    } catch (error) {
        throw error;
    }
};

// Update user password
const updateUserPassword = async (id, newPassword) => {
    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        const query = `UPDATE users SET password = ? WHERE id = ?`;
        
        await db.query(query, [hashedPassword, id]);
        
        return { success: true };
    } catch (error) {
        throw error;
    }
};

// Update user remaining leave (sisa_izin)
const updateUserSisaIzin = async (id, sisa_izin) => {
    try {
        const query = `UPDATE users SET sisa_izin = ? WHERE id = ?`;
        
        await db.query(query, [sisa_izin, id]);
        
        return { success: true };
    } catch (error) {
        throw error;
    }
};

// Delete user
const deleteUser = async (id) => {
    try {
        const query = `DELETE FROM users WHERE id = ?`;
        
        await db.query(query, [id]);
        
        return { success: true };
    } catch (error) {
        throw error;
    }
};

// Verify password
const verifyPassword = async (plainPassword, hashedPassword) => {
    try {
        return await bcrypt.compare(plainPassword, hashedPassword);
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

module.exports = {
    getAllUsers,
    getUserById,
    getUserByUsername,
    createUser,
    updateUser,
    updateUserPassword,
    updateUserSisaIzin,
    deleteUser,
    verifyPassword,
    getUserAttendanceToday
};
