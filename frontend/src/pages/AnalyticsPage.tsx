import { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import axios from 'axios';

interface Score {
  id: string;
  interviewId: string;
  score: number;
  date: string;
}

interface Feedback {
  id: string;
  interviewId: string;
  content: string;
  date: string;
}

const AnalyticsPage = () => {
  const [scores, setScores] = useState<Score[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [scoresResponse, feedbacksResponse] = await Promise.all([
        axios.get('http://localhost:3000/api/interviews/scores', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('http://localhost:3000/api/interviews/feedback', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setScores(scoresResponse.data);
      setFeedbacks(feedbacksResponse.data);
    } catch (err) {
      setError('Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>;
  }

  if (error) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><Typography color="error">{error}</Typography></Box>;
  }

  const chartData = scores.map(score => ({
    date: score.date,
    score: score.score,
  }));

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <Paper elevation={3} sx={{ p: 4, minWidth: 320, width: '100%', maxWidth: 800 }}>
        <Typography variant="h5" mb={2}>Interview Analytics</Typography>
        <LineChart width={700} height={300} data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="score" stroke="#8884d8" />
        </LineChart>
      </Paper>
    </Box>
  );
};

export default AnalyticsPage; 