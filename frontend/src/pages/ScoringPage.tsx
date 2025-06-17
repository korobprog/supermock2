import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Card,
  CardContent,
  Rating,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from '../utils/axios';

interface Score {
  id: string;
  interviewId: string;
  criteriaName: string;
  score: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

interface Interview {
  id: string;
  title: string;
  date: string;
  position?: string;
  candidate?: string;
}

const ScoringPage = () => {
  const { id: interviewId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [scores, setScores] = useState<Score[]>([]);
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentScore, setCurrentScore] = useState<Score | null>(null);
  const [formData, setFormData] = useState({
    criteriaName: '',
    score: 0,
    comment: '',
  });

  useEffect(() => {
    if (interviewId) {
      fetchScores();
      fetchInterview();
    } else {
      setError('ID интервью не указан');
      setLoading(false);
    }
  }, [interviewId]);

  const fetchScores = async () => {
    if (!interviewId) return;

    try {
      const response = await api.get(`/interviews/${interviewId}/scores`);
      setScores(response.data);
    } catch (error) {
      console.error('Ошибка загрузки оценок:', error);
      setError('Не удалось загрузить оценки.');
    } finally {
      setLoading(false);
    }
  };

  const fetchInterview = async () => {
    if (!interviewId) return;

    try {
      const response = await api.get(`/interviews/${interviewId}`);
      setInterview(response.data);
    } catch (error) {
      console.error('Ошибка загрузки интервью:', error);
      setError('Не удалось загрузить данные интервью.');
    }
  };

  const handleOpenDialog = (score?: Score) => {
    if (score) {
      setCurrentScore(score);
      setFormData({
        criteriaName: score.criteriaName,
        score: score.score,
        comment: score.comment || '',
      });
    } else {
      setCurrentScore(null);
      setFormData({ criteriaName: '', score: 0, comment: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'score' ? Number(value) : value,
    }));
  };

  const handleSave = async () => {
    if (!interviewId) return;

    try {
      if (currentScore) {
        // Для редактирования создаем новую оценку, так как API не поддерживает обновление
        setError(
          'Редактирование оценок не поддерживается. Создайте новую оценку.'
        );
        return;
      } else {
        await api.post(`/interviews/${interviewId}/scores`, formData);
      }
      fetchScores();
      handleCloseDialog();
    } catch (error) {
      console.error('Ошибка сохранения оценки:', error);
      setError('Не удалось сохранить оценку.');
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
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
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Назад к списку интервью
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={handleBack} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">Оценки собеседования</Typography>
      </Box>

      {interview && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            {interview.title}
          </Typography>
          {interview.candidate && (
            <Typography color="text.secondary" gutterBottom>
              Кандидат: {interview.candidate}
            </Typography>
          )}
        </Box>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={() => handleOpenDialog()}
        sx={{ mb: 3 }}
      >
        Добавить оценку
      </Button>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {scores.map((score) => (
          <Box
            key={score.id}
            sx={{ flex: '1 1 300px', minWidth: '300px', maxWidth: '400px' }}
          >
            <Card elevation={2}>
              <CardContent>
                <Box mb={2}>
                  <Typography variant="h6" component="div">
                    Оценка по критерию
                  </Typography>
                </Box>

                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Критерий: {score.criteriaName}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Rating value={score.score / 2} readOnly precision={0.5} />
                    <Typography variant="h6">{score.score}/10</Typography>
                  </Box>
                </Box>

                <Box mb={2}>
                  <Chip
                    label={`${score.criteriaName}: ${score.score}/10`}
                    size="small"
                    color={
                      score.score >= 7
                        ? 'success'
                        : score.score >= 5
                        ? 'warning'
                        : 'error'
                    }
                  />
                </Box>

                {score.comment && (
                  <>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Комментарий:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {score.comment}
                    </Typography>
                  </>
                )}

                <Typography
                  variant="caption"
                  color="text.secondary"
                  mt={1}
                  display="block"
                >
                  Дата: {new Date(score.createdAt).toLocaleDateString('ru-RU')}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {scores.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            Оценки для этого интервью пока не добавлены
          </Typography>
        </Box>
      )}

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {currentScore ? 'Редактировать оценку' : 'Добавить оценку'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Критерий оценки"
            name="criteriaName"
            value={formData.criteriaName}
            onChange={handleChange}
            margin="normal"
            placeholder="Например: Технические навыки, Коммуникация, Решение задач..."
          />
          <TextField
            fullWidth
            label="Оценка (0-10)"
            name="score"
            type="number"
            value={formData.score}
            onChange={handleChange}
            margin="normal"
            inputProps={{ min: 0, max: 10 }}
          />
          <TextField
            fullWidth
            label="Комментарий (необязательно)"
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={4}
            placeholder="Дополнительные комментарии по данному критерию..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button onClick={handleSave} color="primary" variant="contained">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ScoringPage;
