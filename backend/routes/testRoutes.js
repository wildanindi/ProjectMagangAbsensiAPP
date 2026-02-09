const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Test Database Connection
router.get('/test-db', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT COUNT(*) as count FROM users');
        return res.status(200).json({
            success: true,
            message: 'Database connection OK',
            data: {
                userCount: rows[0]?.count || 0,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Database connection failed',
            error: error.message
        });
    }
});

// Get all users (for testing - show current users)
router.get('/test-users', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, nama, email, username, role FROM users LIMIT 10');
        return res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
            data: rows,
            count: rows.length
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve users',
            error: error.message
        });
    }
});

// Health check
router.get('/health', (req, res) => {
    return res.status(200).json({
        success: true,
        message: 'API is healthy',
        timestamp: new Date().toISOString(),
        frontend_url: 'http://localhost:3000',
        api_url: 'http://localhost:5000/api'
    });
});

module.exports = router;
