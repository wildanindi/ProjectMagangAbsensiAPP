const superviserModel = require('../models/superviserModel');

// Get all supervisors (Admin)
const getAllSupervisors = async (req, res) => {
    try {
        const supervisors = await superviserModel.getAllSupervisors();

        return res.status(200).json({
            success: true,
            data: supervisors,
            total: supervisors.length
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get supervisor detail (Admin)
const getSupervisorDetail = async (req, res) => {
    try {
        const { id } = req.params;

        const supervisor = await superviserModel.getSupervisorWithInternsCount(id);

        if (!supervisor) {
            return res.status(404).json({
                success: false,
                message: 'Pembimbing tidak ditemukan'
            });
        }

        return res.status(200).json({
            success: true,
            data: supervisor
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Create new supervisor (Admin)
const createSupervisor = async (req, res) => {
    try {
        const { nama, email, nohp } = req.body;

        // Validate
        if (!nama) {
            return res.status(400).json({
                success: false,
                message: 'Nama pembimbing harus diisi'
            });
        }

        const supervisorData = {
            nama,
            email: email || null,
            nohp: nohp || null
        };

        const newSupervisor = await superviserModel.createSupervisor(supervisorData);

        return res.status(201).json({
            success: true,
            message: 'Pembimbing berhasil dibuat',
            data: newSupervisor
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update supervisor (Admin)
const updateSupervisor = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama, email, nohp } = req.body;

        // Validate
        if (!nama) {
            return res.status(400).json({
                success: false,
                message: 'Nama pembimbing harus diisi'
            });
        }

        // Check if supervisor exists
        const supervisor = await superviserModel.getSupervisorById(id);
        if (!supervisor) {
            return res.status(404).json({
                success: false,
                message: 'Pembimbing tidak ditemukan'
            });
        }

        const supervisorData = {
            nama,
            email: email || null,
            nohp: nohp || null
        };

        const updatedSupervisor = await superviserModel.updateSupervisor(id, supervisorData);

        return res.status(200).json({
            success: true,
            message: 'Pembimbing berhasil diperbarui',
            data: updatedSupervisor
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete supervisor (Admin)
const deleteSupervisor = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if supervisor exists
        const supervisor = await superviserModel.getSupervisorById(id);
        if (!supervisor) {
            return res.status(404).json({
                success: false,
                message: 'Pembimbing tidak ditemukan'
            });
        }

        await superviserModel.deleteSupervisor(id);

        return res.status(200).json({
            success: true,
            message: 'Pembimbing berhasil dihapus'
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
    getAllSupervisors,
    getSupervisorDetail,
    createSupervisor,
    updateSupervisor,
    deleteSupervisor
};
