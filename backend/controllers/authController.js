const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

// Register (Admin membuat user/anak magang)
const register = async (req, res) => {
    try {
        const { nama, email, username, password, role, pembimbing_id, periode_id, sisa_izin } = req.body;

        // Validate input
        if (!nama || !username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Nama, username, dan password harus diisi'
            });
        }

        // Check if user already exists
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
            role: role || 'USER',
            pembimbing_id: pembimbing_id || null,
            periode_id: periode_id || null,
            sisa_izin: sisa_izin || 0
        };

        const newUser = await userModel.createUser(userData);

        return res.status(201).json({
            success: true,
            message: 'User berhasil dibuat',
            data: {
                id: newUser.id,
                nama: newUser.nama,
                email: newUser.email,
                username: newUser.username,
                role: newUser.role
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

// Login
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username dan password harus diisi'
            });
        }

        // Get user by username
        const user = await userModel.getUserByUsername(username);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Username atau password salah'
            });
        }

        // Verify password
        const isPasswordValid = await userModel.verifyPassword(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Username atau password salah'
            });
        }

        // Create JWT token
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                nama: user.nama,
                role: user.role,
                periode_id: user.periode_id,
                sisa_izin: user.sisa_izin
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.status(200).json({
            success: true,
            message: 'Login berhasil',
            data: {
                id: user.id,
                nama: user.nama,
                email: user.email,
                username: user.username,
                role: user.role,
                periode_id: user.periode_id,
                sisa_izin: user.sisa_izin,
                token
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

// Get current user profile
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await userModel.getUserById(userId);

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

// Update profile
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { nama, email } = req.body;

        if (!nama) {
            return res.status(400).json({
                success: false,
                message: 'Nama harus diisi'
            });
        }

        const userData = {
            nama,
            email: email || null
        };

        const updatedUser = await userModel.updateUser(userId, userData);

        return res.status(200).json({
            success: true,
            message: 'Profil berhasil diperbarui',
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

// Change password
const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { oldPassword, newPassword, confirmPassword } = req.body;

        // Validate input
        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Semua field harus diisi'
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Password baru dan konfirmasi password harus sama'
            });
        }

        // Get user
        const user = await userModel.getUserById(userId);

        // Verify old password
        const isPasswordValid = await userModel.verifyPassword(oldPassword, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Password lama salah'
            });
        }

        // Update password
        await userModel.updateUserPassword(userId, newPassword);

        return res.status(200).json({
            success: true,
            message: 'Password berhasil diperbarui'
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
    register,
    login,
    getProfile,
    updateProfile,
    changePassword
};
