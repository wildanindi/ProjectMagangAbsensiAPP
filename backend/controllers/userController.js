const userModel = require('../models/userModel');

// Get all users (Admin)
const getAllUsers = async (req, res) => {
    try {
        const { role } = req.query;

        const users = await userModel.getAllUsers(role);

        return res.status(200).json({
            success: true,
            data: users,
            total: users.length
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all anak magang (USER role)
const getAllInterns = async (req, res) => {
    try {
        const interns = await userModel.getAllUsers('USER');

        return res.status(200).json({
            success: true,
            data: interns,
            total: interns.length
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get user detail by ID (Admin)
const getUserDetail = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await userModel.getUserById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }

        return res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Create new user (Admin - untuk create anak magang)
const createIntern = async (req, res) => {
    try {
        const { nama, email, username, password, pembimbing_id, periode_id, sisa_izin } = req.body;

        // Validate
        if (!nama || !username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Nama, username, dan password harus diisi'
            });
        }

        // Check if username exists
        const existingUser = await userModel.getUserByUsername(username);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Username sudah digunakan'
            });
        }

        // Create user
        const userData = {
            nama,
            email: email || null,
            username,
            password,
            role: 'USER',
            pembimbing_id: pembimbing_id || null,
            periode_id: periode_id || null,
            sisa_izin: sisa_izin || 0
        };

        const newUser = await userModel.createUser(userData);

        return res.status(201).json({
            success: true,
            message: 'Anak magang berhasil dibuat',
            data: {
                id: newUser.id,
                nama: newUser.nama,
                email: newUser.email,
                username: newUser.username,
                role: newUser.role,
                pembimbing_id: newUser.pembimbing_id,
                periode_id: newUser.periode_id,
                sisa_izin: newUser.sisa_izin
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

// Update user (Admin)
const updateUserData = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama, email, pembimbing_id, periode_id } = req.body;

        // Validate
        if (!nama) {
            return res.status(400).json({
                success: false,
                message: 'Nama harus diisi'
            });
        }

        // Check if user exists
        const user = await userModel.getUserById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }

        const userData = {
            nama,
            email: email || null,
            pembimbing_id: pembimbing_id || null,
            periode_id: periode_id || null
        };

        const updatedUser = await userModel.updateUser(id, userData);

        return res.status(200).json({
            success: true,
            message: 'User berhasil diperbarui',
            data: updatedUser
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete user (Admin)
const deleteUserData = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if user exists
        const user = await userModel.getUserById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }

        await userModel.deleteUser(id);

        return res.status(200).json({
            success: true,
            message: 'User berhasil dihapus'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Reset user password (Admin)
const resetUserPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        // Validate
        if (!newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Password baru harus diisi'
            });
        }

        // Check if user exists
        const user = await userModel.getUserById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }

        await userModel.updateUserPassword(id, newPassword);

        return res.status(200).json({
            success: true,
            message: 'Password user berhasil direset'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update user leave balance (Admin)
const updateUserLeaveBalance = async (req, res) => {
    try {
        const { id } = req.params;
        const { sisa_izin } = req.body;

        // Validate
        if (sisa_izin === undefined || sisa_izin === null) {
            return res.status(400).json({
                success: false,
                message: 'sisa_izin harus diisi'
            });
        }

        // Check if user exists
        const user = await userModel.getUserById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }

        await userModel.updateUserSisaIzin(id, sisa_izin);

        return res.status(200).json({
            success: true,
            message: 'Sisa izin user berhasil diperbarui',
            data: {
                id,
                sisa_izin
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
    getAllUsers,
    getAllInterns,
    getUserDetail,
    createIntern,
    updateUserData,
    deleteUserData,
    resetUserPassword,
    updateUserLeaveBalance
};
