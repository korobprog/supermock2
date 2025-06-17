import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import api from '../utils/axios';
import { AxiosError } from 'axios';

interface Notification {
  id: number;
  message: string;
  date: string;
  type: string;
  read: boolean;
}

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (err) {
      const axiosError = err as AxiosError;
      console.error('Failed to load notifications:', axiosError);
      if (axiosError.response?.status === 401) {
        setError('Необходимо войти в систему для просмотра уведомлений.');
      } else if (axiosError.response?.status === 404) {
        setError(
          'Эндпоинт уведомлений не найден. Проверьте настройки сервера.'
        );
      } else {
        setError(
          `Ошибка загрузки уведомлений: ${
            axiosError.response?.status || 'Неизвестная ошибка'
          }`
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleMarkAsRead = useCallback(
    async (id: number) => {
      try {
        await api.patch(`/notifications/${id}/read`, { read: true });
        fetchNotifications();
      } catch (err) {
        const axiosError = err as AxiosError;
        console.error('Failed to mark notification as read:', axiosError);
        if (axiosError.response?.status === 401) {
          setError('Необходимо войти в систему.');
        } else if (axiosError.response?.status === 404) {
          setError('Уведомление не найдено.');
        } else {
          setError(
            `Ошибка отметки уведомления: ${
              axiosError.response?.status || 'Неизвестная ошибка'
            }`
          );
        }
      }
    },
    [fetchNotifications]
  );

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="60vh"
    >
      <Paper
        elevation={3}
        sx={{ p: 4, minWidth: 320, width: '100%', maxWidth: 600 }}
      >
        <Typography variant="h5" mb={2}>
          Notifications
        </Typography>
        <List>
          {notifications.map((notification) => (
            <ListItem key={notification.id}>
              <ListItemText
                primary={notification.message}
                secondary={`Date: ${notification.date}`}
              />
              <ListItemSecondaryAction>
                {!notification.read && (
                  <IconButton
                    edge="end"
                    onClick={(e) => {
                      e.preventDefault();
                      handleMarkAsRead(notification.id);
                    }}
                  >
                    <CheckCircleIcon />
                  </IconButton>
                )}
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default NotificationsPage;
