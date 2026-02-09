export const handleApiError = (error) => {
    if (error.response) {
        // Server responded with error status
        return error.response.data?.message || error.response.statusText;
    } else if (error.request) {
        // Request made but no response
        return 'Tidak ada respons dari server. Periksa koneksi internet Anda.';
    } else {
        // Error in request setup
        return error.message || 'Terjadi kesalahan yang tidak diketahui';
    }
};

export const getErrorMessage = (error) => {
    if (typeof error === 'string') {
        return error;
    }
    
    if (error?.message) {
        return error.message;
    }
    
    if (error?.response?.data?.message) {
        return error.response.data.message;
    }
    
    if (error?.response?.statusText) {
        return error.response.statusText;
    }
    
    return 'Terjadi kesalahan yang tidak diketahui';
};

export const isNetworkError = (error) => {
    return !error.response && error.request;
};

export const isServerError = (error) => {
    return error.response && error.response.status >= 500;
};

export const isClientError = (error) => {
    return error.response && error.response.status >= 400 && error.response.status < 500;
};

export const isAuthError = (error) => {
    return error.response && error.response.status === 401;
};

export const isForbiddenError = (error) => {
    return error.response && error.response.status === 403;
};

export const isNotFoundError = (error) => {
    return error.response && error.response.status === 404;
};
