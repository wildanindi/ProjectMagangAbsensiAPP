const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const db = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Routesss
const authRoutes = require('./routes/authRoutes');
const absensiRoutes = require('./routes/absensiRoutes');
const izinRoutes = require('./routes/izinRoutes');
const userRoutes = require('./routes/userRoutes');
const superviserRoutes = require('./routes/superviserRoutes');
const periodeMagangRoutes = require('./routes/periodeMagangRoutes');
const testRoutes = require('./routes/testRoutes');

// Initialize Express
const app = express();

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files (uploaded photos)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ message: 'Server is running' });
});

// API Routes
app.use('/api/test', testRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/absensi', absensiRoutes);
app.use('/api/izin', izinRoutes);
app.use('/api/users', userRoutes);
app.use('/api/supervisors', superviserRoutes);
app.use('/api/periods', periodeMagangRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route tidak ditemukan'
    });
});

// Error handler middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`✓ Server berjalan di http://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
});
