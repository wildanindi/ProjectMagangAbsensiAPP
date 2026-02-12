const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const absensiModel = require('../models/absensiModel');
const userModel = require('../models/userModel');
const dayjs = require('dayjs');

// ==================== HELPERS ====================

const STATUS_LABEL = {
    'HADIR': 'Hadir',
    'TELAT': 'Terlambat',
    'ALPHA': 'Alpha',
    'IZIN': 'Izin',
    'SAKIT': 'Sakit'
};

const formatDate = (dateVal) => {
    const d = new Date(dateVal);
    return d.toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
};

const getMonthLabel = (month) => {
    const [y, m] = month.split('-');
    const d = new Date(parseInt(y), parseInt(m) - 1, 1);
    return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
};

// ==================== EXCEL HELPERS ====================

const applyHeaderStyle = (row) => {
    row.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF02B6D1' } };
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' }
        };
    });
};

const applyDataStyle = (row, idx) => {
    row.eachCell((cell) => {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' }
        };
        if (idx % 2 === 0) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F9FF' } };
        }
    });
};

// ==================== USER EXPORT ====================

// User: Export own attendance to Excel
const exportUserExcel = async (req, res) => {
    try {
        const userId = req.user.id;
        const { month } = req.query;

        if (!month) {
            return res.status(400).json({ success: false, message: 'Parameter month (YYYY-MM) diperlukan' });
        }

        const user = await userModel.getUserById(userId);
        const data = await absensiModel.getUserAttendanceForExport(userId, month);
        const monthLabel = getMonthLabel(month);

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Portal Internship';
        const sheet = workbook.addWorksheet('Rekap Absensi');

        // Title
        sheet.mergeCells('A1:D1');
        const titleCell = sheet.getCell('A1');
        titleCell.value = `Rekap Absensi — ${user.nama}`;
        titleCell.font = { bold: true, size: 14, color: { argb: 'FF1A599E' } };
        titleCell.alignment = { horizontal: 'center' };

        sheet.mergeCells('A2:D2');
        const subtitleCell = sheet.getCell('A2');
        subtitleCell.value = `Periode: ${monthLabel}`;
        subtitleCell.font = { size: 11, color: { argb: 'FF666666' } };
        subtitleCell.alignment = { horizontal: 'center' };

        // Spacer row
        sheet.addRow([]);

        // Headers
        const headerRow = sheet.addRow(['No', 'Tanggal', 'Jam Masuk', 'Status']);
        applyHeaderStyle(headerRow);

        sheet.getColumn(1).width = 6;
        sheet.getColumn(2).width = 28;
        sheet.getColumn(3).width = 14;
        sheet.getColumn(4).width = 16;

        // Data
        data.forEach((record, i) => {
            const row = sheet.addRow([
                i + 1,
                formatDate(record.tanggal),
                record.jam_masuk || '-',
                STATUS_LABEL[record.status] || record.status
            ]);
            applyDataStyle(row, i);
        });

        // Summary
        sheet.addRow([]);
        const hadir = data.filter(r => r.status === 'HADIR').length;
        const telat = data.filter(r => r.status === 'TELAT').length;
        const alpha = data.filter(r => r.status === 'ALPHA').length;
        const izin = data.filter(r => r.status === 'IZIN' || r.status === 'SAKIT').length;

        const summaryStart = sheet.lastRow.number + 1;
        sheet.mergeCells(`A${summaryStart}:D${summaryStart}`);
        const summaryTitle = sheet.getCell(`A${summaryStart}`);
        summaryTitle.value = 'Ringkasan';
        summaryTitle.font = { bold: true, size: 12 };

        sheet.addRow(['', 'Hadir', hadir, '']);
        sheet.addRow(['', 'Terlambat', telat, '']);
        sheet.addRow(['', 'Alpha', alpha, '']);
        sheet.addRow(['', 'Izin/Sakit', izin, '']);
        sheet.addRow(['', 'Total', data.length, '']);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Rekap_Absensi_${user.nama.replace(/\s+/g, '_')}_${month}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Export Excel error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// User: Export own attendance to PDF
const exportUserPdf = async (req, res) => {
    try {
        const userId = req.user.id;
        const { month } = req.query;

        if (!month) {
            return res.status(400).json({ success: false, message: 'Parameter month (YYYY-MM) diperlukan' });
        }

        const user = await userModel.getUserById(userId);
        const data = await absensiModel.getUserAttendanceForExport(userId, month);
        const monthLabel = getMonthLabel(month);

        const doc = new PDFDocument({ margin: 40, size: 'A4' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Rekap_Absensi_${user.nama.replace(/\s+/g, '_')}_${month}.pdf`);
        doc.pipe(res);

        // Title
        doc.fontSize(18).fillColor('#1A599E').text(`Rekap Absensi`, { align: 'center' });
        doc.fontSize(12).fillColor('#333').text(`${user.nama}`, { align: 'center' });
        doc.fontSize(10).fillColor('#666').text(`Periode: ${monthLabel}`, { align: 'center' });
        doc.moveDown(1.5);

        // Table
        const tableTop = doc.y;
        const colWidths = [35, 180, 90, 90];
        const headers = ['No', 'Tanggal', 'Jam Masuk', 'Status'];
        const startX = 50;

        // Draw header
        let x = startX;
        doc.rect(x, tableTop, colWidths.reduce((a, b) => a + b, 0), 22).fill('#02B6D1');
        x = startX;
        headers.forEach((h, i) => {
            doc.fontSize(10).fillColor('#fff').text(h, x + 5, tableTop + 6, { width: colWidths[i] - 10, align: 'center' });
            x += colWidths[i];
        });

        // Draw rows
        let y = tableTop + 22;
        data.forEach((record, idx) => {
            if (y > 750) {
                doc.addPage();
                y = 40;
            }

            if (idx % 2 === 0) {
                doc.rect(startX, y, colWidths.reduce((a, b) => a + b, 0), 20).fill('#f0f9ff');
            }

            x = startX;
            const rowData = [
                String(idx + 1),
                formatDate(record.tanggal),
                record.jam_masuk || '-',
                STATUS_LABEL[record.status] || record.status
            ];

            rowData.forEach((val, i) => {
                doc.fontSize(9).fillColor('#333').text(val, x + 5, y + 5, { width: colWidths[i] - 10, align: 'center' });
                x += colWidths[i];
            });
            y += 20;
        });

        // Summary
        y += 20;
        if (y > 700) { doc.addPage(); y = 40; }
        const hadir = data.filter(r => r.status === 'HADIR').length;
        const telat = data.filter(r => r.status === 'TELAT').length;
        const alpha = data.filter(r => r.status === 'ALPHA').length;

        doc.fontSize(12).fillColor('#1A599E').text('Ringkasan:', startX, y);
        y += 20;
        doc.fontSize(10).fillColor('#333')
            .text(`Hadir: ${hadir}  |  Terlambat: ${telat}  |  Alpha: ${alpha}  |  Total: ${data.length}`, startX, y);

        doc.end();
    } catch (error) {
        console.error('Export PDF error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== ADMIN EXPORT ====================

// Admin: Export all attendance to Excel
const exportAdminExcel = async (req, res) => {
    try {
        const { month } = req.query;

        if (!month) {
            return res.status(400).json({ success: false, message: 'Parameter month (YYYY-MM) diperlukan' });
        }

        const data = await absensiModel.getAllAttendanceForExport(month);
        const monthLabel = getMonthLabel(month);

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Portal Internship - Admin';
        const sheet = workbook.addWorksheet('Rekap Absensi Semua');

        // Title
        sheet.mergeCells('A1:F1');
        const titleCell = sheet.getCell('A1');
        titleCell.value = `Rekap Absensi Seluruh Peserta Magang`;
        titleCell.font = { bold: true, size: 14, color: { argb: 'FF1A599E' } };
        titleCell.alignment = { horizontal: 'center' };

        sheet.mergeCells('A2:F2');
        const subtitleCell = sheet.getCell('A2');
        subtitleCell.value = `Periode: ${monthLabel}`;
        subtitleCell.font = { size: 11, color: { argb: 'FF666666' } };
        subtitleCell.alignment = { horizontal: 'center' };

        sheet.addRow([]);

        // Headers
        const headerRow = sheet.addRow(['No', 'Nama', 'Username', 'Tanggal', 'Jam Masuk', 'Status']);
        applyHeaderStyle(headerRow);

        sheet.getColumn(1).width = 6;
        sheet.getColumn(2).width = 24;
        sheet.getColumn(3).width = 18;
        sheet.getColumn(4).width = 28;
        sheet.getColumn(5).width = 14;
        sheet.getColumn(6).width = 16;

        // Data
        data.forEach((record, i) => {
            const row = sheet.addRow([
                i + 1,
                record.nama,
                record.username,
                formatDate(record.tanggal),
                record.jam_masuk || '-',
                STATUS_LABEL[record.status] || record.status
            ]);
            applyDataStyle(row, i);
        });

        // Summary
        sheet.addRow([]);
        const hadir = data.filter(r => r.status === 'HADIR').length;
        const telat = data.filter(r => r.status === 'TELAT').length;
        const alpha = data.filter(r => r.status === 'ALPHA').length;

        const summaryStart = sheet.lastRow.number + 1;
        sheet.mergeCells(`A${summaryStart}:F${summaryStart}`);
        const summaryTitle = sheet.getCell(`A${summaryStart}`);
        summaryTitle.value = 'Ringkasan';
        summaryTitle.font = { bold: true, size: 12 };

        sheet.addRow(['', 'Hadir', hadir, 'Terlambat', telat, '']);
        sheet.addRow(['', 'Alpha', alpha, 'Total Record', data.length, '']);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Rekap_Absensi_Semua_${month}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Admin Export Excel error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: Export all attendance to PDF
const exportAdminPdf = async (req, res) => {
    try {
        const { month } = req.query;

        if (!month) {
            return res.status(400).json({ success: false, message: 'Parameter month (YYYY-MM) diperlukan' });
        }

        const data = await absensiModel.getAllAttendanceForExport(month);
        const monthLabel = getMonthLabel(month);

        const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Rekap_Absensi_Semua_${month}.pdf`);
        doc.pipe(res);

        // Title
        doc.fontSize(18).fillColor('#1A599E').text('Rekap Absensi Seluruh Peserta Magang', { align: 'center' });
        doc.fontSize(10).fillColor('#666').text(`Periode: ${monthLabel}`, { align: 'center' });
        doc.moveDown(1.5);

        // Table
        const tableTop = doc.y;
        const colWidths = [30, 160, 120, 165, 80, 80];
        const headers = ['No', 'Nama', 'Username', 'Tanggal', 'Jam Masuk', 'Status'];
        const startX = 40;

        let x = startX;
        doc.rect(x, tableTop, colWidths.reduce((a, b) => a + b, 0), 22).fill('#02B6D1');
        x = startX;
        headers.forEach((h, i) => {
            doc.fontSize(9).fillColor('#fff').text(h, x + 4, tableTop + 6, { width: colWidths[i] - 8, align: 'center' });
            x += colWidths[i];
        });

        let y = tableTop + 22;
        data.forEach((record, idx) => {
            if (y > 520) {
                doc.addPage();
                y = 40;
            }

            if (idx % 2 === 0) {
                doc.rect(startX, y, colWidths.reduce((a, b) => a + b, 0), 18).fill('#f0f9ff');
            }

            x = startX;
            const rowData = [
                String(idx + 1),
                record.nama,
                record.username,
                formatDate(record.tanggal),
                record.jam_masuk || '-',
                STATUS_LABEL[record.status] || record.status
            ];

            rowData.forEach((val, i) => {
                doc.fontSize(8).fillColor('#333').text(val, x + 4, y + 4, { width: colWidths[i] - 8, align: 'center' });
                x += colWidths[i];
            });
            y += 18;
        });

        // Summary
        y += 15;
        if (y > 500) { doc.addPage(); y = 40; }
        const hadir = data.filter(r => r.status === 'HADIR').length;
        const telat = data.filter(r => r.status === 'TELAT').length;
        const alpha = data.filter(r => r.status === 'ALPHA').length;

        doc.fontSize(11).fillColor('#1A599E').text('Ringkasan:', startX, y);
        y += 18;
        doc.fontSize(9).fillColor('#333')
            .text(`Hadir: ${hadir}  |  Terlambat: ${telat}  |  Alpha: ${alpha}  |  Total Record: ${data.length}`, startX, y);

        doc.end();
    } catch (error) {
        console.error('Admin Export PDF error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    exportUserExcel,
    exportUserPdf,
    exportAdminExcel,
    exportAdminPdf
};
