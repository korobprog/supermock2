import api from './axios';

export interface AdminNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

// Отправка уведомления пользователю
export const sendAdminNotification = async (
  userId: string,
  title: string,
  message: string,
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR' = 'INFO'
): Promise<AdminNotification> => {
  try {
    const response = await api.post(`/notifications/admin/${userId}`, {
      title,
      message,
      type,
    });
    return response.data.data.notification;
  } catch (error) {
    console.error('Ошибка при отправке уведомления пользователю:', error);
    throw error;
  }
};
