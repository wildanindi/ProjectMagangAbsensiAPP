/* ================================
   DATABASE
================================ */
CREATE DATABASE IF NOT EXISTS absensi_magang;
USE absensi_magang;

/* ================================
   TABEL PEMBIMBING
================================ */
CREATE TABLE pembimbing (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  nohp VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/* ================================
   TABEL PERIODE MAGANG
================================ */
CREATE TABLE periode_magang (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama_periode VARCHAR(100) NOT NULL,
  tanggal_mulai DATE NOT NULL,
  tanggal_selesai DATE NOT NULL,
  jatah_izin INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/* ================================
   TABEL USERS (ADMIN & ANAK MAGANG)
================================ */
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  nohp VARCHAR(20),
  asal_kampus VARCHAR(150),
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('ADMIN','USER') NOT NULL,

  pembimbing_id INT,
  periode_id INT,
  sisa_izin INT DEFAULT 0,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (pembimbing_id) REFERENCES pembimbing(id)
    ON DELETE SET NULL,
  FOREIGN KEY (periode_id) REFERENCES periode_magang(id)
    ON DELETE SET NULL
);

/* ================================
   TABEL ABSENSI
================================ */
CREATE TABLE absensi (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  tanggal DATE NOT NULL,
  jam_masuk TIME NOT NULL,
  status ENUM('HADIR','TELAT','ALPHA') NOT NULL,
  foto_path VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,

  UNIQUE (user_id, tanggal)
);

/* ================================
   TABEL IZIN / CUTI
================================ */
CREATE TABLE izin (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  tanggal_mulai DATE NOT NULL,
  tanggal_selesai DATE NOT NULL,
  alasan TEXT,
  status ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

/* ================================
   VIEW DASHBOARD ADMIN
================================ */
CREATE VIEW dashboard_absensi_hari_ini AS
SELECT 
  u.id,
  u.nama,
  IFNULL(a.status, 'ALPHA') AS status_hari_ini
FROM users u
LEFT JOIN absensi a 
  ON u.id = a.user_id 
  AND a.tanggal = CURDATE()
WHERE u.role = 'USER';

