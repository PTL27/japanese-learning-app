// Timezone utilities for GMT+7 (Vietnam time)

export const formatToVietnamTime = (dateString) => {
  const date = new Date(dateString);
  
  // Convert to Vietnam time (GMT+7)
  const vietnamTime = new Date(date.getTime() + (7 * 60 * 60 * 1000));
  
  return vietnamTime.toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

export const formatTimeToVietnam = (dateString) => {
  const date = new Date(dateString);
  
  return date.toLocaleTimeString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDateToVietnam = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Convert to Vietnam time for comparison
  const vietnamDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
  const vietnamToday = new Date(today.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
  const vietnamYesterday = new Date(yesterday.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));

  if (vietnamDate.toDateString() === vietnamToday.toDateString()) {
    return 'Hôm nay';
  } else if (vietnamDate.toDateString() === vietnamYesterday.toDateString()) {
    return 'Hôm qua';
  } else {
    return vietnamDate.toLocaleDateString('vi-VN');
  }
};

export const getCurrentVietnamTime = () => {
  const now = new Date();
  return new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
};

export const getCurrentVietnamTimeISO = () => {
  return getCurrentVietnamTime().toISOString();
};