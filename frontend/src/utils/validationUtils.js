export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

export const validatePassword = (password) => {
    return password.length >= 6;
};

export const validateUsername = (username) => {
    return username.length >= 3 && username.length <= 20;
};

export const validatePhone = (phone) => {
    const re = /^(\+62|0)[0-9]{9,12}$/;
    return re.test(phone.replace(/\D/g, ''));
};

export const validateEmpty = (value) => {
    return value && value.trim().length > 0;
};

export const validateDateRange = (startDate, endDate) => {
    return new Date(startDate) <= new Date(endDate);
};

export const sanitizeInput = (value) => {
    return value.trim();
};

export const formatPhoneNumber = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
        return '+62' + cleaned.slice(1);
    }
    if (!cleaned.startsWith('62')) {
        return '+62' + cleaned;
    }
    return '+' + cleaned;
};
