import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { absensiAPI } from '../api/absensi';
import { izinAPI } from '../api/izin';
import { MapPin, Clock, Calendar, AlertCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import Swal from 'sweetalert2';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [attendanceSummary, setAttendanceSummary] = useState(null);
    const [leaveSummary, setLeaveSummary] = useState(null);
    const [leaveBalance, setLeaveBalance] = useState(0);
    const [recentActivities, setRecentActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState(null);
    const [locationLoading, setLocationLoading] = useState(true);
    const [showCamera, setShowCamera] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [todayStatus, setTodayStatus] = useState(null);
    const webcamRef = React.useRef(null);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Get user's real-time location
    useEffect(() => {
        const getLocation = async () => {
            try {
                if ('geolocation' in navigator) {
                    navigator.geolocation.getCurrentPosition(
                        async (position) => {
                            const { latitude, longitude, accuracy } = position.coords;
                            
                            // Try to get address from coordinates using OpenStreetMap's Nominatim API
                            try {
                                const response = await fetch(
                                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
                                    { headers: { 'Accept-Language': 'id' } }
                                );
                                const data = await response.json();
                                const address = data.address?.city || data.address?.town || data.address?.county || 'Lokasi Tidak Diketahui';
                                const country = data.address?.country || '';
                                
                                setLocation({
                                    latitude: latitude.toFixed(6),
                                    longitude: longitude.toFixed(6),
                                    accuracy: accuracy.toFixed(0),
                                    address: address,
                                    country: country,
                                    fullAddress: `${address}${country ? ', ' + country : ''}`
                                });
                            } catch (error) {
                                // If reverse geocoding fails, just show coordinates
                                setLocation({
                                    latitude: latitude.toFixed(6),
                                    longitude: longitude.toFixed(6),
                                    accuracy: accuracy.toFixed(0),
                                    address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
                                    fullAddress: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
                                });
                            }
                            setLocationLoading(false);
                        },
                        (error) => {
                            console.error('Error getting location:', error);
                            setLocation({
                                address: 'Lokasi Tidak Tersedia',
                                fullAddress: 'Izinkan akses lokasi untuk menampilkan lokasi Anda'
                            });
                            setLocationLoading(false);
                        },
                        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
                    );
                }
            } catch (error) {
                console.error('Geolocation error:', error);
                setLocationLoading(false);
            }
        };

        getLocation();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (user?.id) {
                    // Fetch attendance summary
                    const summaryResponse = await absensiAPI.getAttendanceStats();
                    setAttendanceSummary(summaryResponse.data);

                    // Fetch recent activities
                    const historyResponse = await absensiAPI.getUserAttendanceHistory(5, 0);
                    setRecentActivities(historyResponse.data || []);

                    // Fetch today's attendance status (termasuk ALPHA setelah jam cutoff)
                    try {
                        const todayResponse = await absensiAPI.getTodayAttendance();
                        setTodayStatus(todayResponse.data || null);
                    } catch (error) {
                        console.error('Error fetching today status:', error);
                    }

                    // Fetch leave summary
                    try {
                        const leaveSummaryResponse = await izinAPI.getUserLeaveSummary();
                        setLeaveSummary(leaveSummaryResponse.data);
                    } catch (error) {
                        console.error('Error fetching leave summary:', error);
                    }

                    // Get leave balance from user (if available)
                    if (user?.sisa_izin) {
                        setLeaveBalance(user.sisa_izin);
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const formatTime = (date) => {
        return date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
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

    const hasCheckedInToday = () => {
        if (!recentActivities || recentActivities.length === 0) {
            return false;
        }

        const today = new Date();
        const todayString = today.getFullYear() + '-' + 
                           String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                           String(today.getDate()).padStart(2, '0');

        const todayActivity = recentActivities.find((activity) => {
            const activityDate = new Date(activity.tanggal);
            const activityDateString = activityDate.getFullYear() + '-' + 
                                      String(activityDate.getMonth() + 1).padStart(2, '0') + '-' + 
                                      String(activityDate.getDate()).padStart(2, '0');
            return activityDateString === todayString && activity.jam_masuk;
        });

        return !!todayActivity;
    };

    return (
        <div className="dashboard">
            <h1>Absensi Magang</h1>

            {/* Top Section: Time, Status, and Check-In */}
            <div className="top-section">
                {/* Time Card - Left */}
                <div className="time-card compact">
                    <div className="time-display">
                        <div className="time-label-top">Waktu Saat Ini</div>
                        <div className="time-value">{formatTime(currentTime)}</div>
                        <div className="time-unit">{currentTime.getSeconds()} Detik</div>
                    </div>
                    <div className="location-section compact">
                        <div className="location-header">
                            <MapPin size={18} className="location-icon" />
                            <span className="location-label">Lokasi</span>
                        </div>
                        {locationLoading ? (
                            <div className="location-loading">
                                <div className="spinner-small"></div>
                            </div>
                        ) : (
                            <div className="location-content">
                                <div className="location-value compact">{location?.fullAddress || 'Lokasi Tidak Tersedia'}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Status Kehadiran - Middle */}
                <div className="status-card middle">
                    <div className="status-header">Presensi Magang</div>
                    {todayStatus?.status === 'ALPHA' ? (
                        <>
                            <div className="status-message-pending" style={{ color: '#ef4444' }}>
                                Anda tercatat <strong>ALPHA</strong> hari ini karena tidak melakukan presensi sebelum jam 12:00.
                            </div>
                            <div className="status-badge-pending" style={{ backgroundColor: '#ef4444', color: '#fff' }}>Alpha</div>
                        </>
                    ) : todayStatus?.status === 'IZIN' ? (
                        <>
                            <div className="status-message">
                                Anda sedang izin hari ini.
                            </div>
                            <div className="status-badge" style={{ backgroundColor: '#3b82f6' }}>Izin</div>
                        </>
                    ) : todayStatus?.status === 'TELAT' ? (
                        <>
                            <div className="status-message">
                                Anda sudah melakukan Presensi hari ini, namun tercatat <strong>Terlambat</strong>. Catat aktivitas harian di Log Book sebelum pulang.
                            </div>
                            <div className="status-badge" style={{ backgroundColor: '#f59e0b' }}>Terlambat</div>
                            <div className="status-time">
                                <Clock size={16} />
                                <span>Masuk: {todayStatus.jam_masuk}</span>
                            </div>
                        </>
                    ) : todayStatus?.status === 'HADIR' ? (
                        <>
                            <div className="status-message">
                                Anda sudah melakukan Presensi hari ini. Catat aktivitas harian di Log Book sebelum pulang.
                            </div>
                            <div className="status-badge">Hadir</div>
                            <div className="status-time">
                                <Clock size={16} />
                                <span>Masuk: {todayStatus.jam_masuk}</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="status-message-pending">
                                Anda belum melakukan Presensi hari ini. Silakan submit presensi sebelum jam 12:00.
                            </div>
                            <div className="status-badge-pending">Belum Absen</div>
                        </>
                    )}
                </div>

                {/* Check-In Button - Right */}
                <div className="check-in-section">
                    {(!todayStatus || !todayStatus.status) ? (
                        <>
                            <button 
                                className="check-in-btn-circle"
                                onClick={() => setShowCamera(true)}
                            >
                                <span className="check-in-icon">→</span>
                            </button>
                            <div className="btn-label">Submit Presensi</div>
                        </>
                    ) : (
                        <div className="btn-label" style={{ textAlign: 'center', color: '#6b7280' }}>
                            {todayStatus.status === 'ALPHA' 
                                ? 'Batas presensi sudah lewat' 
                                : todayStatus.status === 'IZIN'
                                ? 'Anda sedang izin'
                                : 'Sudah presensi hari ini'}
                        </div>
                    )}
                </div>
            </div>

            {/* Leave Balance Card */}
            {/* <div className="leave-balance-card">
                <div className="leave-balance-header">
                    <Calendar size={24} />
                    <h3>Sisa Jatah Izin/Cuti</h3>
                </div>
                <div className="leave-balance-content">
                    <div className="leave-balance-number">{leaveBalance}</div>
                    <div className="leave-balance-subtitle">Hari Tersisa Tahun Ini</div>
                    <div className="leave-balance-actions">
                        <button className="btn-view-leave" onClick={() => navigate('/leave-request')}>
                            Lihat Detail
                        </button>
                    </div>
                </div>
            </div> */}

            {/* Summary Stats */}
            {attendanceSummary && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-value" style={{ color: '#10b981' }}>
                            {attendanceSummary.hadir || 0}
                        </div>
                        <div className="stat-label">HADIR</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value" style={{ color: '#f59e0b' }}>
                            {attendanceSummary.telat || 0}
                        </div>
                        <div className="stat-label">TERLAMBAT</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value" style={{ color: '#3b82f6' }}>
                            {attendanceSummary.izin || 0}
                        </div>
                        <div className="stat-label">IZIN/CUTI</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value" style={{ color: '#ef4444' }}>
                            {attendanceSummary.alpha || 0}
                        </div>
                        <div className="stat-label">ALPHA</div>
                    </div>
                </div>
            )}

            {/* Recent Activities */}
            <div className="activities-section">
                <div className="section-header">
                    <h2>Aktivitas Terkini</h2>
                    <a href="/attendance" className="see-all-link">Lihat Semua</a>
                </div>

                {loading ? (
                    <div className="loading">Memuat...</div>
                ) : recentActivities.length > 0 ? (
                    <div className="activities-list">
                        {recentActivities.map((activity) => {
                            const activityDate = new Date(activity.tanggal);
                            const formattedDate = activityDate.toLocaleDateString('id-ID', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            });
                            const timeDisplay = activity.jam_masuk || '-';

                            return (
                                <div key={activity.id} className="activity-item">
                                    <div className="activity-info">
                                        <div className="activity-date-section">
                                            <Clock size={20} className="activity-icon" />
                                            <div>
                                                <div className="activity-date-label">Tanggal</div>
                                                <div className="activity-date-value">{formattedDate}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="activity-time-section">
                                        <div className="activity-time-item">
                                            <div className="time-label">Jam Masuk</div>
                                            <div className="time-value-large">{timeDisplay}</div>
                                        </div>
                                    </div>
                                    <div className="activity-status-section">
                                        {getStatusBadge(activity.status)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="no-activities">Belum ada aktivitas</div>
                )}
            </div>

            {/* Camera Modal */}
            {showCamera && (
                <div className="camera-modal-overlay">
                    <div className="camera-modal-content">
                        <div className="camera-modal-header">
                            <h2>Ambil Foto Presensi</h2>
                            <button 
                                className="camera-modal-close"
                                onClick={() => {
                                    setShowCamera(false);
                                    setCapturedImage(null);
                                }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="camera-modal-body">
                            {!capturedImage ? (
                                <div className="webcam-container">
                                    <Webcam
                                        ref={webcamRef}
                                        screenshotFormat="image/jpeg"
                                        className="webcam-feed"
                                        facingMode="user"
                                    />
                                </div>
                            ) : (
                                <div className="captured-image-container">
                                    <img src={capturedImage} alt="Captured" className="captured-image" />
                                </div>
                            )}
                        </div>

                        <div className="camera-modal-actions">
                            {!capturedImage ? (
                                <>
                                    <button 
                                        className="btn-camera-cancel"
                                        onClick={() => {
                                            setShowCamera(false);
                                            setCapturedImage(null);
                                        }}
                                    >
                                        Batal
                                    </button>
                                    <button 
                                        className="btn-camera-capture"
                                        onClick={() => {
                                            const imageSrc = webcamRef.current.getScreenshot();
                                            setCapturedImage(imageSrc);
                                        }}
                                    >
                                        Ambil Foto
                                    </button>
                                </>
                            ) : !submitting ? (
                                <>
                                    <button 
                                        className="btn-camera-cancel"
                                        onClick={() => {
                                            setCapturedImage(null);
                                        }}
                                    >
                                        Ulang Foto
                                    </button>
                                    <button 
                                        className="btn-camera-capture"
                                        onClick={async () => {
                                            setSubmitting(true);
                                            try {
                                                // Convert base64 to File object for proper upload
                                                const base64Response = await fetch(capturedImage);
                                                const blob = await base64Response.blob();
                                                const file = new File([blob], 'presensi.jpg', { type: 'image/jpeg' });
                                                
                                                const formData = new FormData();
                                                formData.append('photo', file);

                                                console.log('Sending formData with file:', file.name, file.size, file.type);

                                                await absensiAPI.checkIn(formData);
                                                Swal.fire('Sukses', 'Presensi berhasil disubmit', 'success');
                                                setShowCamera(false);
                                                setCapturedImage(null);
                                                // Refresh attendance data
                                                const summaryResponse = await absensiAPI.getAttendanceStats();
                                                setAttendanceSummary(summaryResponse.data);
                                                const historyResponse = await absensiAPI.getUserAttendanceHistory(5, 0);
                                                setRecentActivities(historyResponse.data || []);
                                            } catch (error) {
                                                console.error('Check-in error:', error);
                                                const errorMsg = error.response?.data?.message || 'Gagal submit presensi';
                                                Swal.fire('Error', errorMsg, 'error');
                                            } finally {
                                                setSubmitting(false);
                                            }
                                        }}
                                        disabled={submitting}
                                    >
                                        Submit Presensi
                                    </button>
                                </>
                            ) : (
                                <div className="submitting-indicator">
                                    <span>Mengupload presensi...</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
