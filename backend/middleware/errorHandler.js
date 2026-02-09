// Error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
            success: false, 
            message: 'Token tidak valid' 
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
            success: false, 
            message: 'Token sudah expired' 
        });
    }

    // Default error
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        message: message
    });
};

module.exports = errorHandler;
