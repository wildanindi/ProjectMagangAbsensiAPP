const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/absensi');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const userId = req.user?.id || 'unknown';
        const timestamp = Date.now();
        const ext = path.extname(file.originalname) || '.jpg';
        cb(null, `absensi_${userId}_${timestamp}${ext}`);
    }
});

// File filter - only accept images
const fileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Hanya file gambar yang diizinkan (JPEG, PNG, WebP)'), false);
    }
};

// Upload middleware for attendance photo
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max
    }
});

// Wrapper to handle multer errors
const handleUpload = (req, res, next) => {
    console.log('Upload middleware called');
    console.log('Content-Type:', req.headers['content-type']);
    
    upload.single('photo')(req, res, (err) => {
        console.log('After multer, file:', req.file);
        console.log('After multer, body:', req.body);
        
        if (err instanceof multer.MulterError) {
            console.log('Multer error:', err);
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'Ukuran file terlalu besar. Maksimal 5MB'
                });
            }
            return res.status(400).json({
                success: false,
                message: err.message
            });
        } else if (err) {
            console.log('Other error:', err);
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }
        next();
    });
};

module.exports = { handleUpload };
