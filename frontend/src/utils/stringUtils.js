export const getInitials = (name) => {
    return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .slice(0, 2);
};

export const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const capitalizeWords = (str) => {
    return str
        .split(' ')
        .map(word => capitalize(word))
        .join(' ');
};

export const truncate = (str, length = 50) => {
    return str.length > length ? str.substring(0, length) + '...' : str;
};

export const getStatusLabel = (status) => {
    const statusMap = {
        'HADIR': 'Hadir',
        'TERLAMBAT': 'Terlambat',
        'IZIN': 'Izin',
        'SAKIT': 'Sakit',
        'ALPHA': 'Alpha',
        'PENDING': 'Menunggu',
        'APPROVED': 'Disetujui',
        'REJECTED': 'Ditolak',
        'ADMIN': 'Administrator',
        'USER': 'Karyawan'
    };
    return statusMap[status] || status;
};

export const getStatusColor = (status) => {
    const colorMap = {
        'HADIR': '#10b981',
        'TERLAMBAT': '#f59e0b',
        'IZIN': '#3b82f6',
        'SAKIT': '#ef4444',
        'ALPHA': '#6b7280',
        'PENDING': '#f59e0b',
        'APPROVED': '#10b981',
        'REJECTED': '#ef4444'
    };
    return colorMap[status] || '#9ca3af';
};

/**
 * Format numeric user ID ke template MAG-ICON-{ID}
 * Contoh: 1 → MAG-ICON-001, 25 → MAG-ICON-025
 */
export const formatUserId = (id) => {
    if (!id && id !== 0) return '-';
    const paddedId = String(id).padStart(3, '0');
    return `MAG-ICON-${paddedId}`;
};
