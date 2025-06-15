import { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';

interface Feedback {
  id: string;
  interviewId: string;
  content: string;
  date: string;
}

interface Interview {
  id: string;
  title: string;
  date: string;
}

const FeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<Feedback | null>(null);
  const [formData, setFormData] = useState({ interviewId: '', content: '' });

  useEffect(() => {
    fetchFeedbacks();
    fetchInterviews();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/interviews/feedback', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedbacks(response.data);
    } catch (err) {
      setError('Failed to load feedbacks.');
    } finally {
      setLoading(false);
    }
  };

  const fetchInterviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/interviews', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInterviews(response.data);
    } catch (err) {
      setError('Failed to load interviews.');
    }
  };

  const handleOpenDialog = (feedback?: Feedback) => {
    if (feedback) {
      setCurrentFeedback(feedback);
      setFormData({ interviewId: feedback.interviewId, content: feedback.content });
    } else {
      setCurrentFeedback(null);
      setFormData({ interviewId: '', content: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (currentFeedback) {
        await axios.patch(`http://localhost:3000/api/interviews/feedback/${currentFeedback.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post('http://localhost:3000/api/interviews/feedback', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchFeedbacks();
      handleCloseDialog();
    } catch (err) {
      setError('Failed to save feedback.');
    }
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>;
  }

  if (error) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><Typography color="error">{error}</Typography></Box>;
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <Paper elevation={3} sx={{ p: 4, minWidth: 320, width: '100%', maxWidth: 600 }}>
        <Typography variant="h5" mb={2}>Interview Feedback</Typography>
        <Button variant="contained" color="primary" onClick={() => handleOpenDialog()} sx={{ mb: 2 }}>Add Feedback</Button>
        <List>
          {feedbacks.map(feedback => (
            <ListItem key={feedback.id}>
              <ListItemText primary={`Feedback: ${feedback.content}`} secondary={`Date: ${feedback.date}`} />
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => handleOpenDialog(feedback)}><EditIcon /></IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>{currentFeedback ? 'Edit Feedback' : 'Add Feedback'}</DialogTitle>
          <DialogContent>
            <TextField fullWidth label="Interview" name="interviewId" value={formData.interviewId} onChange={handleChange} margin="normal" select SelectProps={{ native: true }}>
              <option value="">Select Interview</option>
              {interviews.map(interview => (
                <option key={interview.id} value={interview.id}>{interview.title}</option>
              ))}
            </TextField>
            <TextField fullWidth label="Feedback" name="content" value={formData.content} onChange={handleChange} margin="normal" multiline rows={4} />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSave} color="primary">Save</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default FeedbackPage; 