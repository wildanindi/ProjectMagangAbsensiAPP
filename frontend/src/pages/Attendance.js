import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { absensiAPI } from '../api/absensi';
import { Camera, Download, Clock, X, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import './Attendance.css';

const Attendance = () => {
    const { user } = useAuth();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);

    // Check-in states
    const [showCamera, setShowCamera] = useState(false);
    const [photoData, setPhotoData] = useState(null);
    const [checkInStatus, setCheckInStatus] = useState(null);
    const [checkInLoading, setCheckInLoading] = useState(false);

    // History states
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
    const [filterDate, setFilterDate] = useState('');

    useEffect(() => {
        fetchAttendanceHistory();
        checkTodayStatus();
    }, [user]);

    const checkTodayStatus = async () => {
        try {
            if (user?.id) {
                const response = await absensiAPI.getTodayAttendance();
                setCheckInStatus(response.data);
            }
        } catch (error) {
            console.error('Error checking today status:', error);
        }
    };

    const fetchAttendanceHistory = async () => {
        try {
            setLoading(true);
            if (user?.id) {
                const response = await absensiAPI.getUserAttendanceHistory(100, 0);
                setAttendanceData(response.data || []);
            }
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    // Camera functions
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: false
            });
            videoRef.current.srcObject = stream;
            setShowCamera(true);
        } catch (error) {
            Swal.fire('Error', 'Tidak dapat mengakses kamera', 'error');
        }
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            context.drawImage(videoRef.current, 0, 0);
            const imageData = canvasRef.current.toDataURL('image/jpeg');
            setPhotoData(imageData);
            stopCamera();
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            setShowCamera(false);
        }
    };

    const retakePhoto = () => {
        setPhotoData(null);
        startCamera();
    };

    const uploadPhoto = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoData(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const submitCheckIn = async () => {
        if (!photoData) {
            Swal.fire('Error', 'Foto harus diambil atau diunggah', 'error');
            return;
        }

        try {
            setCheckInLoading(true);

            // Convert base64 to blob
            const response = await fetch(photoData);
            const blob = await response.blob();
            const formData = new FormData();
            formData.append('photo', blob, 'checkin.jpg');

            const result = await absensiAPI.checkIn(formData);

            if (result.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Check-in Berhasil',
                    html: `<p>Status: <strong>${result.data?.status || 'HADIR'}</strong></p><p>Jam: <strong>${result.data?.jam_masuk || new Date().toLocaleTimeString('id-ID')}</strong></p>`,
                    timer: 3000
                });
                setPhotoData(null);
                checkTodayStatus();
                fetchAttendanceHistory();
            }
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Gagal melakukan check-in', 'error');
        } finally {
            setCheckInLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'HADIR': { label: 'Hadir', className: 'badge-success' },
            'TELAT': { label: 'Terlambat', className: 'badge-warning' },
            'TERLAMBAT': { label: 'Terlambat', className: 'badge-warning' },
            'IZIN': { label: 'Izin', className: 'badge-info' },
            'SAKIT': { label: 'Sakit', className: 'badge-danger' },
            'ALPHA': { label: 'Alpha', className: 'badge-secondary' }
        };
        const statusInfo = statusMap[status] || { label: status, className: 'badge-secondary' };
        return <span className={`badge ${statusInfo.className}`}>{statusInfo.label}</span>;
    };

    const handleExport = () => {
        alert('Fitur export akan segera tersedia');
    };

    // derive displayed data based on month/date filters
    // NOTE: use local date parts to avoid UTC offset issues (toISOString shifts date)
    const displayedData = (attendanceData || []).filter((record) => {
        if (!record || !record.tanggal) return false;

        const dt = new Date(record.tanggal);
        const y = dt.getFullYear();
        const m = String(dt.getMonth() + 1).padStart(2, '0');
        const d = String(dt.getDate()).padStart(2, '0');
        const recDateLocal = `${y}-${m}-${d}`; // YYYY-MM-DD local
        const recMonthLocal = `${y}-${m}`; // YYYY-MM

        if (filterDate) {
            return recDateLocal === filterDate;
        }

        if (filterMonth) {
            return recMonthLocal === filterMonth;
        }

        return true;
    });

    return (
        <div className="attendance-container">
            {/* Check-in Section */}
            <div className="checkin-section">
                
                <h2>Check-in Kehadiran</h2>

                {/* Status Today Card */}
                {checkInStatus && (
                    <div className={`status-today-card ${checkInStatus?.status ? 'checked-in' : 'not-checked'}`}>
                        <div className="status-indicator">
                            {checkInStatus?.status ? (
                                <div className="status-badge-large success">
                                    {getStatusBadge(checkInStatus.status)}
                                </div>
                            ) : (
                                <AlertCircle size={48} color="#999" />
                            )}
                        </div>
                        <div className="status-content">
                            <div className="status-time">
                                {checkInStatus?.jam_masuk ? (
                                    <>
                                        <div className="time-item">
                                            <span className="time-label">Jam Masuk</span>
                                            <span className="time-value">{checkInStatus.jam_masuk}</span>
                                        </div>
                                        {checkInStatus?.jam_keluar && (
                                            <div className="time-item">
                                                <span className="time-label">Jam Keluar</span>
                                                <span className="time-value">{checkInStatus.jam_keluar}</span>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <p className="status-message">Anda belum melakukan check-in hari ini</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Camera Section */}
                {!photoData ? (
                    <>
                        {showCamera ? (
                            <div className="camera-container">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    className="camera-video"
                                />
                                <canvas ref={canvasRef} style={{ display: 'none' }} />

                                <div className="camera-controls">
                                    <button
                                        className="btn-capture"
                                        onClick={capturePhoto}
                                    >
                                        <Camera size={24} />
                                        <span>Ambil Foto</span>
                                    </button>
                                    <button
                                        className="btn-cancel"
                                        onClick={stopCamera}
                                    >
                                        <X size={24} />
                                        <span>Tutup</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="camera-options">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={uploadPhoto}
                                        style={{ display: 'none' }}
                                    />
                                </div>
                        )}
                    </>
                ) : (
                    <div className="photo-preview-container">
                        <img src={photoData} alt="Preview" className="photo-preview" />

                        <div className="preview-actions">
                            <button
                                className="btn-submit"
                                onClick={submitCheckIn}
                                disabled={checkInLoading}
                            >
                                {checkInLoading ? 'Memproses...' : 'Lakukan Check-in'}
                            </button>
                            <button
                                className="btn-retake"
                                onClick={retakePhoto}
                                disabled={checkInLoading}
                            >
                                Ambil Ulang
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* History Section */}
            <div className="history-section">
                <div className="attendance-header">
                    <h2>Riwayat Kehadiran</h2>
                    <div className="header-actions">
                        <select
                            value={filterMonth}
                            onChange={(e) => setFilterMonth(e.target.value)}
                            className="month-filter"
                        >
                            {Array.from({ length: 12 }, (_, i) => {
                                const date = new Date(new Date().getFullYear(), new Date().getMonth() - i, 1);
                                const value = date.toISOString().slice(0, 7);
                                const label = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
                                return <option key={value} value={value}>{label}</option>;
                            })}
                        </select>
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="date-filter"
                            title="Filter per tanggal"
                        />
                        <button onClick={handleExport} className="export-btn">
                            <Download size={18} />
                            <span>Export</span>
                        </button>
                    </div>
                </div>

                    <div className="attendance-stats">
                    <div className="stat-box">
                        <div className="stat-number">{displayedData.filter(a => a.status === 'HADIR').length}</div>
                        <div className="stat-text">Tepat Waktu</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-number">{displayedData.filter(a => a.status === 'TELAT' || a.status === 'TERLAMBAT').length}</div>
                        <div className="stat-text">Terlambat</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-number">{displayedData.filter(a => a.status === 'IZIN').length}</div>
                        <div className="stat-text">Izin</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-number">{displayedData.filter(a => a.status === 'ALPHA').length}</div>
                        <div className="stat-text">Alpha</div>
                    </div>
                </div>

                {loading ? (
                    <div className="loading">Memuat riwayat...</div>
                ) : displayedData.length > 0 ? (
                    <div className="attendance-table-wrapper">
                        <table className="attendance-table">
                            <thead>
                                <tr>
                                    <th>Tanggal</th>
                                    <th>Jam Masuk</th>
                                    <th>Jam Keluar</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedData.map((record) => (
                                    <tr key={record.id}>
                                        <td>{new Date(record.tanggal).toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                        <td>{record.jam_masuk || '-'}</td>
                                        <td>{record.jam_keluar || '-'}</td>
                                        <td>{getStatusBadge(record.status)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="no-data">Belum ada riwayat kehadiran</div>
                )}
            </div>
        </div>
    );
};

export default Attendance;
