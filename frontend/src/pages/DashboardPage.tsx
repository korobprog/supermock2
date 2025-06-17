import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';

interface ApiError {
  response?: {
    status: number;
    data?: unknown;
  };
  message: string;
}

interface Interview {
  id: string;
  title: string;
  scheduledAt: string;
  status: string;
  specialization: string;
}

interface Feedback {
  id: string;
  content: string;
  createdAt: string;
  interview: {
    title: string;
  };
}

interface Notification {
  id: number;
  message: string;
  date: string;
  type: string;
  read: boolean;
}

const DashboardPage = () => {
  const navigate = useNavigate();
  const [recentInterviews, setRecentInterviews] = useState<Interview[]>([]);
  const [recentFeedback, setRecentFeedback] = useState<Feedback[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<
    Notification[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Проверяем, есть ли токен
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Пожалуйста, войдите в систему для просмотра дашборда.');
          setLoading(false);
          return;
        }

        // Безопасная функция для API запросов
        const safeApiCall = async (
          url: string,
          defaultValue: unknown[] = []
        ) => {
          try {
            const response = await api.get(url);
            return response;
          } catch (err) {
            const apiError = err as ApiError;
            console.warn(`API error for ${url}:`, apiError);

            // Если 401 - проблема с авторизацией
            if (apiError.response?.status === 401) {
              throw apiError; // Пробрасываем 401 наверх
            }

            // Для других ошибок возвращаем пустые данные
            return { data: defaultValue };
          }
        };

        const [interviewsRes, feedbackRes, notificationsRes] =
          await Promise.all([
            safeApiCall('/interviews', []),
            safeApiCall('/interviews/feedback', []),
            safeApiCall('/notifications', []),
          ]);

        // Обрабатываем данные интервью
        const interviewsData = interviewsRes.data;
        let interviews = [];

        if (Array.isArray(interviewsData)) {
          interviews = interviewsData;
        } else if (interviewsData && Array.isArray(interviewsData.interviews)) {
          interviews = interviewsData.interviews;
        } else if (interviewsData && typeof interviewsData === 'object') {
          // Пытаемся найти массив в объекте
          const possibleArrays = Object.values(interviewsData).filter(
            Array.isArray
          );
          interviews =
            possibleArrays.length > 0 ? (possibleArrays[0] as Interview[]) : [];
        }

        setRecentInterviews(interviews.slice(0, 5));

        // Обрабатываем данные обратной связи
        const feedbackData = feedbackRes.data;
        const feedback = Array.isArray(feedbackData) ? feedbackData : [];
        setRecentFeedback(feedback.slice(0, 5));

        // Обрабатываем уведомления
        const notificationsData = notificationsRes.data;
        const notifications = Array.isArray(notificationsData)
          ? notificationsData
          : [];
        setRecentNotifications(notifications.slice(0, 5));

        setLoading(false);
      } catch (error) {
        console.error('Dashboard fetch error:', error);
        const apiError = error as ApiError;
        if (apiError.response?.status === 401) {
          setError('Сессия истекла. Пожалуйста, войдите в систему заново.');
          localStorage.removeItem('token');
        } else {
          setError('Не удалось загрузить данные дашборда.');
        }
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Typography>Loading...</Typography>;
  if (error) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
        <Typography color="error">{error}</Typography>
        {error.includes('войдите в систему') && (
          <Button variant="contained" onClick={() => navigate('/login')}>
            Войти в систему
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      minHeight="60vh"
    >
      <Typography variant="h4" mb={2}>
        Dashboard
      </Typography>
      <Paper
        elevation={3}
        sx={{ p: 4, minWidth: 320, width: '100%', maxWidth: 600 }}
      >
        <Typography variant="h6" mb={2}>
          Recent Interviews
        </Typography>
        <List>
          {recentInterviews.length > 0 ? (
            recentInterviews.map((interview, index) => (
              <ListItem key={interview.id || index}>
                <ListItemText
                  primary={interview.title}
                  secondary={new Date(interview.scheduledAt).toLocaleDateString(
                    'ru-RU'
                  )}
                />
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText primary="Нет недавних интервью" />
            </ListItem>
          )}
        </List>
        <Divider />
        <Typography variant="h6" mb={2}>
          Recent Feedback
        </Typography>
        <List>
          {recentFeedback.length > 0 ? (
            recentFeedback.map((feedback, index) => (
              <ListItem key={feedback.id || index}>
                <ListItemText
                  primary={feedback.content}
                  secondary={`${
                    feedback.interview?.title || 'Интервью'
                  } - ${new Date(feedback.createdAt).toLocaleDateString(
                    'ru-RU'
                  )}`}
                />
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText primary="Нет недавней обратной связи" />
            </ListItem>
          )}
        </List>
        <Divider />
        <Typography variant="h6" mb={2}>
          Recent Notifications
        </Typography>
        <List>
          {recentNotifications.length > 0 ? (
            recentNotifications.map((notification, index) => (
              <ListItem key={notification.id || index}>
                <ListItemText
                  primary={notification.message}
                  secondary={new Date(notification.date).toLocaleDateString(
                    'ru-RU'
                  )}
                />
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText primary="Нет недавних уведомлений" />
            </ListItem>
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default DashboardPage;
