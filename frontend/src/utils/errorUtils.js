export const getErrorMessage = (error) => {
    if (typeof error === 'string') {
        return error;
    }
    
    if (error?.response?.data?.message) {
        return error.response.data.message;
    }
    
    if (error?.response?.statusText) {
        return error.response.statusText;
    }
    
    if (error?.request && !error?.response) {
        return 'Tidak ada respons dari server. Periksa koneksi internet Anda.';
    }
    
    if (error?.message) {
        return error.message;
    }
    
    return 'Terjadi kesalahan yang tidak diketahui';
};

/** @deprecated Gunakan getErrorMessage() — fungsi ini tetap tersedia untuk backward-compatibility */
export const handleApiError = (error) => getErrorMessage(error);

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
