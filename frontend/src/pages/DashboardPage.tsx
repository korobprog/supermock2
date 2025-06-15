import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import api from '../utils/axios';

interface Interview {
  title: string;
  date: string;
}

interface Feedback {
  content: string;
  date: string;
}

interface Notification {
  message: string;
  date: string;
}

const DashboardPage = () => {
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
        const [interviewsRes, feedbackRes, notificationsRes] =
          await Promise.all([
            api.get('/interviews'),
            api.get('/interviews/feedback'),
            api.get('/notifications'),
          ]);
        setRecentInterviews(interviewsRes.data.slice(0, 5));
        setRecentFeedback(feedbackRes.data.slice(0, 5));
        setRecentNotifications(notificationsRes.data.slice(0, 5));
        setLoading(false);
      } catch (error) {
        console.error('Dashboard fetch error:', error);
        setError('Failed to fetch dashboard data.');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

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
          {recentInterviews.map((interview, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={interview.title}
                secondary={interview.date}
              />
            </ListItem>
          ))}
        </List>
        <Divider />
        <Typography variant="h6" mb={2}>
          Recent Feedback
        </Typography>
        <List>
          {recentFeedback.map((feedback, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={feedback.content}
                secondary={feedback.date}
              />
            </ListItem>
          ))}
        </List>
        <Divider />
        <Typography variant="h6" mb={2}>
          Recent Notifications
        </Typography>
        <List>
          {recentNotifications.map((notification, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={notification.message}
                secondary={notification.date}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default DashboardPage;
