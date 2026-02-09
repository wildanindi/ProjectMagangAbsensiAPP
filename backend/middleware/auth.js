const jwt = require('jsonwebtoken');

// Verify JWT Token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Token tidak ditemukan' 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ 
            success: false, 
            message: 'Token tidak valid' 
        });
    }
};

// Check if user is Admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ 
            success: false, 
            message: 'Akses ditolak. Hanya admin yang bisa akses' 
        });
    }
    next();
};

// Check if user is User (Anak Magang)
const isUser = (req, res, next) => {
    if (req.user.role !== 'USER') {
        return res.status(403).json({ 
            success: false, 
            message: 'Akses ditolak. Hanya anak magang yang bisa akses' 
        });
    }
    next();
};

module.exports = {
    verifyToken,
    isAdmin,
    isUser
};
