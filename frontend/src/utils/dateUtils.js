import dayjs from 'dayjs';
import 'dayjs/locale/id';

dayjs.locale('id');

export const formatDate = (date, format = 'DD MMMM YYYY') => {
    return dayjs(date).format(format);
};

export const formatTime = (time, format = 'HH:mm:ss') => {
    return dayjs(time, 'HH:mm:ss').format(format);
};

export const formatDateTime = (datetime) => {
    return dayjs(datetime).format('DD MMMM YYYY HH:mm');
};

export const getDayName = (date) => {
    return dayjs(date).format('dddd');
};

export const getMonthName = (date) => {
    return dayjs(date).format('MMMM');
};

export const calculateDateDifference = (startDate, endDate) => {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    return end.diff(start, 'day') + 1; // +1 to include both start and end date
};

export const isToday = (date) => {
    return dayjs(date).isSame(dayjs(), 'day');
};

export const isPast = (date) => {
    return dayjs(date).isBefore(dayjs(), 'day');
};

export const isFuture = (date) => {
    return dayjs(date).isAfter(dayjs(), 'day');
};

export const getRelativeTime = (date) => {
    return dayjs(date).fromNow();
};
