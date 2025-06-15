import { useEffect, useState } from 'react';
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

interface Notification {
  id: string;
  message: string;
  date: string;
  read: boolean;
}

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.data.notifications);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}`, { read: true });
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      setError('Failed to mark notification as read.');
    }
  };

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
                    onClick={() => handleMarkAsRead(notification.id)}
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
