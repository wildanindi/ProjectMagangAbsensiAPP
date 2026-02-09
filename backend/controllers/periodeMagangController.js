const periodeMagangModel = require('../models/periodeMagangModel');

// Get all internship periods (Admin)
const getAllInternshipPeriods = async (req, res) => {
    try {
        const periods = await periodeMagangModel.getAllInternshipPeriods();

        return res.status(200).json({
            success: true,
            data: periods,
            total: periods.length
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get internship period detail (Admin)
const getInternshipPeriodDetail = async (req, res) => {
    try {
        const { id } = req.params;

        const period = await periodeMagangModel.getInternshipPeriodWithInternsCount(id);

        if (!period) {
            return res.status(404).json({
                success: false,
                message: 'Periode magang tidak ditemukan'
            });
        }

        return res.status(200).json({
            success: true,
            data: period
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Create new internship period (Admin)
const createInternshipPeriod = async (req, res) => {
    try {
        const { nama_periode, tanggal_mulai, tanggal_selesai, jatah_izin } = req.body;

        // Validate
        if (!nama_periode || !tanggal_mulai || !tanggal_selesai) {
            return res.status(400).json({
                success: false,
                message: 'Nama periode, tanggal mulai, dan tanggal selesai harus diisi'
            });
        }

        const periodData = {
            nama_periode,
            tanggal_mulai,
            tanggal_selesai,
            jatah_izin: jatah_izin || 0
        };

        const newPeriod = await periodeMagangModel.createInternshipPeriod(periodData);

        return res.status(201).json({
            success: true,
            message: 'Periode magang berhasil dibuat',
            data: newPeriod
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update internship period (Admin)
const updateInternshipPeriod = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama_periode, tanggal_mulai, tanggal_selesai, jatah_izin } = req.body;

        // Validate
        if (!nama_periode || !tanggal_mulai || !tanggal_selesai) {
            return res.status(400).json({
                success: false,
                message: 'Nama periode, tanggal mulai, dan tanggal selesai harus diisi'
            });
        }

        // Check if period exists
        const period = await periodeMagangModel.getInternshipPeriodById(id);
        if (!period) {
            return res.status(404).json({
                success: false,
                message: 'Periode magang tidak ditemukan'
            });
        }

        const periodData = {
            nama_periode,
            tanggal_mulai,
            tanggal_selesai,
            jatah_izin: jatah_izin || 0
        };

        const updatedPeriod = await periodeMagangModel.updateInternshipPeriod(id, periodData);

        return res.status(200).json({
            success: true,
            message: 'Periode magang berhasil diperbarui',
            data: updatedPeriod
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete internship period (Admin)
const deleteInternshipPeriod = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if period exists
        const period = await periodeMagangModel.getInternshipPeriodById(id);
        if (!period) {
            return res.status(404).json({
                success: false,
                message: 'Periode magang tidak ditemukan'
            });
        }

        await periodeMagangModel.deleteInternshipPeriod(id);

        return res.status(200).json({
            success: true,
            message: 'Periode magang berhasil dihapus'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get current active period
const getCurrentActivePeriod = async (req, res) => {
    try {
        const period = await periodeMagangModel.getCurrentActivePeriod();

        if (!period) {
            return res.status(200).json({
                success: true,
                message: 'Tidak ada periode magang yang aktif saat ini',
                data: null
            });
        }

        return res.status(200).json({
            success: true,
            data: period
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
    getAllInternshipPeriods,
    getInternshipPeriodDetail,
    createInternshipPeriod,
    updateInternshipPeriod,
    deleteInternshipPeriod,
    getCurrentActivePeriod
};
