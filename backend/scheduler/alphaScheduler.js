const cron = require('node-cron');
const absensiModel = require('../models/absensiModel');

/**
 * Alpha Auto-Mark Scheduler
 * 
 * Berjalan setiap hari jam 12:00 siang (WIB).
 * Mengecek semua user aktif yang belum absen dan tidak punya izin yang disetujui,
 * lalu otomatis menandai mereka sebagai ALPHA.
 */

let isRunning = false;

const processAlpha = async () => {
    if (isRunning) {
        console.log('[Alpha Scheduler] Proses masih berjalan, skip...');
        return null;
    }

    isRunning = true;
    console.log(`[Alpha Scheduler] Memulai pengecekan alpha - ${new Date().toLocaleString('id-ID')}`);

    try {
        // Cari user yang belum absen dan tidak punya izin hari ini
        const usersWithoutAttendance = await absensiModel.getActiveUsersWithoutAttendance();

        if (usersWithoutAttendance.length === 0) {
            console.log('[Alpha Scheduler] Semua user sudah absen atau memiliki izin hari ini.');
            return { count: 0, users: [] };
        }

        console.log(`[Alpha Scheduler] Ditemukan ${usersWithoutAttendance.length} user belum absen tanpa izin.`);

        // Buat record alpha untuk semua user yang belum absen
        const result = await absensiModel.bulkCreateAlphaRecords();

        console.log(`[Alpha Scheduler] Selesai. ${result.count} user ditandai ALPHA.`);
        if (result.users.length > 0) {
            result.users.forEach(u => {
                console.log(`  - ${u.nama} (ID: ${u.user_id})`);
            });
        }

        return result;
    } catch (error) {
        console.error('[Alpha Scheduler] Error:', error.message);
        throw error;
    } finally {
        isRunning = false;
    }
};

const startAlphaScheduler = () => {
    // Jadwal: setiap hari jam 12:00 siang (menit 0, jam 12)
    // Format cron: detik(opsional) menit jam tanggal bulan hari
    const job = cron.schedule('0 12 * * *', async () => {
        try {
            await processAlpha();
        } catch (error) {
            console.error('[Alpha Scheduler] Gagal menjalankan auto-alpha:', error.message);
        }
    }, {
        scheduled: true,
        timezone: 'Asia/Jakarta'
    });

    console.log('✓ Alpha Scheduler aktif - akan berjalan setiap hari jam 12:00 WIB');
    return job;
};

module.exports = {
    startAlphaScheduler,
    processAlpha
};
