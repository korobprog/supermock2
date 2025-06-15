import { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';

interface Score {
  id: string;
  interviewId: string;
  score: number;
  feedback: string;
  date: string;
}

interface Interview {
  id: string;
  title: string;
  date: string;
}

const ScoringPage = () => {
  const [scores, setScores] = useState<Score[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentScore, setCurrentScore] = useState<Score | null>(null);
  const [formData, setFormData] = useState({ interviewId: '', score: 0, feedback: '' });

  useEffect(() => {
    fetchScores();
    fetchInterviews();
  }, []);

  const fetchScores = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/interviews/scores', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setScores(response.data);
    } catch (err) {
      setError('Failed to load scores.');
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

  const handleOpenDialog = (score?: Score) => {
    if (score) {
      setCurrentScore(score);
      setFormData({ interviewId: score.interviewId, score: score.score, feedback: score.feedback });
    } else {
      setCurrentScore(null);
      setFormData({ interviewId: '', score: 0, feedback: '' });
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
      if (currentScore) {
        await axios.patch(`http://localhost:3000/api/interviews/scores/${currentScore.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post('http://localhost:3000/api/interviews/scores', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchScores();
      handleCloseDialog();
    } catch (err) {
      setError('Failed to save score.');
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
        <Typography variant="h5" mb={2}>Interview Scores</Typography>
        <Button variant="contained" color="primary" onClick={() => handleOpenDialog()} sx={{ mb: 2 }}>Add Score</Button>
        <List>
          {scores.map(score => (
            <ListItem key={score.id}>
              <ListItemText primary={`Score: ${score.score}`} secondary={`Feedback: ${score.feedback} | Date: ${score.date}`} />
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => handleOpenDialog(score)}><EditIcon /></IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>{currentScore ? 'Edit Score' : 'Add Score'}</DialogTitle>
          <DialogContent>
            <TextField fullWidth label="Interview" name="interviewId" value={formData.interviewId} onChange={handleChange} margin="normal" select SelectProps={{ native: true }}>
              <option value="">Select Interview</option>
              {interviews.map(interview => (
                <option key={interview.id} value={interview.id}>{interview.title}</option>
              ))}
            </TextField>
            <TextField fullWidth label="Score" name="score" type="number" value={formData.score} onChange={handleChange} margin="normal" />
            <TextField fullWidth label="Feedback" name="feedback" value={formData.feedback} onChange={handleChange} margin="normal" multiline rows={4} />
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

export default ScoringPage; 