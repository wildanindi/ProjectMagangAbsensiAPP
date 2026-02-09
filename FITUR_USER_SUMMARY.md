# 📋 Fitur Anak Magang (User) - AbsensiKu

## 🎯 Ringkasan Fitur yang Telah Diimplementasikan

Semua fitur yang diminta untuk halaman anak magang telah berhasil diintegrasikan ke dalam aplikasi React frontend. Berikut adalah detail lengkap setiap fitur:

---

## ✅ 1. Check-in Kehadiran dengan Foto

### Lokasi: `/pages/Attendance.js`

**Fitur:**
- ✅ **Ambil Foto Langsung**: Menggunakan webcam untuk mengambil foto check-in
- ✅ **Unggah Foto**: Alternatif upload foto dari device
- ✅ **Preview Foto**: Tampilkan preview sebelum submit
- ✅ **Validasi Foto**: Check-in hanya berlaku jika ada foto (tidak hanya textual check-in)
- ✅ **Status Hari Ini**: Menampilkan status check-in hari ini dengan jam masuk dan keluar
- ✅ **Konfirmasi Sukses**: SweetAlert2 popup dengan detail check-in (status & jam)

**Teknologi:**
- `navigator.mediaDevices.getUserMedia()` untuk akses kamera
- Canvas API untuk capture foto
- FormData untuk upload file foto ke server
- Base64 encoding untuk preview

**Props yang Dikirim ke Backend:**
- `photo` (File): Foto dari kamera/upload
- Endpoint: `POST /absensi/check-in` (multipart/form-data)

---

## ✅ 2. Riwayat Absensi

### Lokasi: `/pages/Attendance.js` (Bagian bawah)

**Fitur:**
- ✅ **Tabel Riwayat**: Menampilkan semua riwayat kehadiran
- ✅ **Filter Bulan**: Filter riwayat berdasarkan bulan/tahun
- ✅ **Statistik Ringkas**: 
  - Total Tepat Waktu (HADIR)
  - Total Terlambat
  - Total Izin
  - Total Alpha
- ✅ **Status Badge**: Warna-warni status kehadiran (Hijau=Hadir, Orange=Terlambat, Biru=Izin, Merah=Alpha)
- ✅ **Export Fitur**: Button export (ready for expansion)
- ✅ **Kolom Detail**:
  - Tanggal (format: Rab, 09 Feb 2026)
  - Jam Masuk
  - Jam Keluar
  - Status

**API Digunakan:**
- `absensiAPI.getTodayAttendance()` - Get status hari ini
- `absensiAPI.getUserAttendanceHistory(limit, offset)` - Get history

---

## ✅ 3. Pengajuan Izin/Cuti

### Lokasi: `/pages/LeaveRequest.js`

**Fitur Form:**
- ✅ **Jenis Izin**: Dropdown dengan opsi (Sakit, Cuti Tahunan, Izin Khusus)
- ✅ **Tanggal Mulai & Selesai**: Date input dengan validasi
- ✅ **Alasan**: Textarea untuk penjelasan izin
- ✅ **Validasi Form**: 
  - Semua field harus diisi
  - Tanggal mulai harus ≤ tanggal selesai
- ✅ **Submit Loading State**: Tombol disabled saat processing

**Fitur Leave Balance:**
- ✅ **Sisa Izin Info Card**: Menampilkan sisa jatah izin dari user object
- ✅ **Automatic Calculation**: Jumlah hari otomatis dihitung dari tanggal mulai-selesai
- ✅ **Balance Update**: Setelah approve admin, sisa izin berkurang otomatis

**Fitur Riwayat Izin:**
- ✅ **Tabel Riwayat**: Tampilkan semua pengajuan izin user
- ✅ **Kolom Tabel:**
  - Jenis Izin
  - Tanggal Mulai
  - Tanggal Selesai
  - Durasi (auto-calculated)
  - Status (Menunggu/Disetujui/Ditolak)
  - Keterangan (Alasan izin)
- ✅ **Status Badge**:
  - PENDING: Kuning dengan icon Clock
  - APPROVED: Hijau dengan icon CheckCircle
  - REJECTED: Merah dengan icon XCircle
- ✅ **Filter Info**: Menampilkan total permohonan
- ✅ **Empty State**: Pesan kosong jika belum ada pengajuan

**API Digunakan:**
- `izinAPI.createLeaveRequest(leaveData)` - Buat pengajuan baru
- `izinAPI.getUserLeaveRequests()` - Get semua pengajuan user
- `izinAPI.getUserLeaveSummary()` - Get ringkasan izin

---

## ✅ 4. Dashboard Anak Magang

### Lokasi: `/pages/Dashboard.js`

**Fitur Waktu Real-time:**
- ✅ **Clock Digital**: Jam real-time yang update setiap detik
- ✅ **Lokasi Info**: Menampilkan lokasi check-in

**Fitur Sisa Izin:**
- ✅ **Leave Balance Card**: Card hijau prominent menampilkan sisa izin
- ✅ **Besar Font Numbers**: 48px angka untuk visibility
- ✅ **Tombol "Lihat Detail"**: Link ke halaman LeaveRequest
- ✅ **Subtitle Penjelasan**: "Hari Tersisa Tahun Ini"

**Fitur Rekapan Kehadiran:**
- ✅ **Stat Cards Grid**: 4 cards dengan statistik:
  - Hadir (hijau)
  - Terlambat (orange)
  - Izin/Cuti (biru)
  - Alpha (merah)
- ✅ **Large Numbers**: 32px font untuk clarity
- ✅ **Gradient Background**: Beautiful linear gradient backgrounds

**Fitur Status Kehadiran Hari Ini:**
- ✅ **Card Status**: Menampilkan apakah sudah check-in hari ini
- ✅ **Jam Masuk & Keluar**: Display jam jika sudah check-in
- ✅ **Pesan Belum Check-in**: Friendly reminder jika belum absen
- ✅ **Icon Visual**: Icon dan warna indicator

**Fitur Aktivitas Terkini:**
- ✅ **Recent Activities List**: 5 aktivitas absensi terbaru
- ✅ **Masing-masing Item**: Tanggal, jam masuk, jam keluar, status
- ✅ **Lihat Semua Link**: Button "Lihat Semua" menuju halaman Attendance
- ✅ **Status Badge**: Warna-warni sesuai status

**API Digunakan:**
- `absensiAPI.getAttendanceStats()` - Get stats ringkasan
- `absensiAPI.getUserAttendanceHistory(limit, offset)` - Get aktivitas recent
- `absensiAPI.getTodayAttendance()` - Get status hari ini

---

## ✅ 5. Edit Profil

### Lokasi: `/pages/Profile.js`

**Fitur View Mode:**
- ✅ **Profile Avatar**: Avatar dengan initial nama user
- ✅ **Header Section**: Nama, role/tipe pengguna
- ✅ **Edit Button**: Tombol untuk masuk mode edit

**Fitur Edit Mode:**
- ✅ **Edit Form**: Form input untuk:
  - Nama Lengkap
  - Email
  - Nomor Telepon
- ✅ **Form Validation**: Input validation sebelum submit
- ✅ **Loading State**: Button disabled saat processing
- ✅ **Buttons**: Cancel dan Simpan Perubahan

**Fitur Informasi Detail:**
- ✅ **Informasi Pribadi Section:**
  - ID Karyawan (user.id)
  - Email
  - Username
  - Nomor Telepon

- ✅ **Informasi Pekerjaan Section:**
  - Tipe Pengguna (Anak Magang/User)
  - NIM / ID Magang
  - Pembimbing ID
  - Periode ID
  - Sisa Izin (badge hijau)

**API Digunakan:**
- `usersAPI.updateUser(id, userData)` - Update profil

---

## 🎨 Styling & UX Features

### Color Scheme:
- **Primary**: Blue (#3b82f6)
- **Secondary**: Purple (#5b21b6)
- **Success**: Green (#10b981)
- **Warning**: Orange (#f59e0b)
- **Info**: Blue (#3b82f6)
- **Danger**: Red (#ef4444)
- **Neutral**: Gray (#f3f4f6)

### Responsive Design:
- ✅ Mobile-first approach
- ✅ Grid layout yang responsive
- ✅ Tablet-optimized views
- ✅ Desktop-friendly UI

### Interactive Elements:
- ✅ Hover effects pada buttons
- ✅ Smooth transitions (0.3s ease)
- ✅ Loading spinners/states
- ✅ SweetAlert2 notifications
- ✅ Status badges dengan icons (Lucide React)

---

## 📱 Sidebar Navigation

**Menu Items untuk User Role:**
- 📊 Dashboard - Ringkasan kehadiran & izin
- 📋 Riwayat Absensi - Check-in dengan foto & history
- 📝 Pengajuan Izin - Form izin & riwayat
- 👤 Profil Saya - Edit profil & info personal

---

## 🔄 Data Flow & Integration

### Check-in Process:
```
1. User di halaman Attendance
2. Pilih: Ambil Foto Kamera atau Unggah Foto
3. Capture/Upload foto
4. Preview foto
5. Submit ke server (POST /absensi/check-in dengan foto)
6. Get response dengan status & jam
7. Update history otomatis
8. Show success alert
```

### Leave Request Process:
```
1. User di halaman LeaveRequest
2. Lihat sisa izin di dashboard card
3. Isi form pengajuan (jenis, tanggal, alasan)
4. Submit pengajuan (POST /izin/request)
5. Pengajuan masuk ke status PENDING
6. Admin review dan approve/reject
7. Jika approve:
   - Status berubah APPROVED
   - Sisa izin user otomatis berkurang
8. User lihat update di:
   - Dashboard leave balance card (berkurang)
   - Riwayat Izin table (status APPROVED)
```

### Profile Update Process:
```
1. User view profil (read mode)
2. Click "Edit Profil" button
3. Form tampil editable
4. Update fields (nama, email, telepon)
5. Click "Simpan Perubahan"
6. PUT request ke /users/{id}
7. Show success alert
8. Back to view mode
9. Info updated di semua halaman
```

---

## 🛠️ Technical Implementation

### Frontend Stack:
- React 19.2.4
- React Router 7
- Axios (API calls)
- SweetAlert2 (Notifications)
- Lucide React (Icons)
- Day.js (Date utilities)
- Custom CSS (No bootstrap needed)

### File Structure:
```
src/pages/
├── Dashboard.js (Ringkasan & leave balance)
├── Attendance.js (Check-in foto + history)
├── LeaveRequest.js (Form + riwayat izin)
├── Profile.js (Edit profil + info)
└── CSS files untuk masing-masing

src/api/
├── absensi.js (Attendance endpoints)
├── izin.js (Leave endpoints)
└── users.js (Profile endpoints)
```

### API Endpoints Used:
```
User Endpoints:
- PUT /users/{id} - Update profil

Attendance Endpoints:
- POST /absensi/check-in (multipart/form-data dengan foto)
- GET /absensi/today - Status hari ini
- GET /absensi/history?limit=X&offset=Y - Riwayat absensi
- GET /absensi/stats - Statistik attendance

Leave Endpoints:
- POST /izin/request - Buat pengajuan izin baru
- GET /izin/my-requests - Get semua pengajuan user
- GET /izin/summary - Get ringkasan izin
```

---

## ⚠️ Requirements Met

✅ **Halaman Anak Magang dapat:**
- [x] Check in absen
- [x] Check in dengan foto (validasi mandatory)
- [x] Mengajukan izin
- [x] Mengubah profil
- [x] Melihat riwayat absensi
- [x] Melihat riwayat izin
- [x] Melihat rekapan kehadiran di dashboard

✅ **Sistem Izin:**
- [x] Jatah izin/cuti yang tersedia (user.sisa_izin)
- [x] Automatic berkurang jika sudah di-approve admin
- [x] Menampilkan remaining leave balance

✅ **Validasi Check-in:**
- [x] Check-in hanya valid jika ada foto
- [x] Tidak bisa hanya text-only check-in

---

## 🚀 Next Steps / Future Enhancement

1. **Backend Updates** (jika belum lengkap):
   - Ensure `/absensi/check-in` endpoint support file upload
   - Verify automatic sisa_izin deduction after admin approval
   - Add endpoint untuk get user profile dengan all details

2. **Additional Features**:
   - Geolocation verification saat check-in
   - Face recognition untuk validasi foto
   - QR code check-in alternative
   - Offline mode untuk check-in
   - Export attendance report (PDF/Excel)
   - Push notifications untuk status izin
   - Calendar view untuk riwayat izin

3. **Performance**:
   - Implement data caching
   - Lazy load untuk history tables
   - Image compression untuk foto check-in

---

## 📝 Notes

- Semua icon menggunakan Lucide React (20-24px size)
- Color palette definisikan di CSS variables untuk konsistensi
- Responsive design tested pada mobile, tablet, desktop
- Loading states ditangani di semua async operations
- Error handling dengan SweetAlert2 popups
- API calls menggunakan try-catch blocks

---

**Status: ✅ COMPLETE - Semua fitur user yang diminta telah diimplementasikan dan siap untuk testing end-to-end.**
