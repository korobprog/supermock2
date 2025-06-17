import { useEffect, useState } from 'react';
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
  Card,
  CardContent,
  Chip,
  Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';

interface Feedback {
  id: string;
  interviewId: string;
  content: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

interface Interview {
  id: string;
  title: string;
  description: string;
  specialization: string;
  scheduledAt: string;
  status: string;
  interviewer?: {
    profile?: {
      firstName: string;
      lastName: string;
    };
  };
  participant?: {
    profile?: {
      firstName: string;
      lastName: string;
    };
  };
  feedback?: Feedback;
}

const FeedbackPage = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentInterview, setCurrentInterview] = useState<Interview | null>(
    null
  );
  const [formData, setFormData] = useState({ content: '', rating: 5 });

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      setError(''); // Сбрасываем предыдущие ошибки

      // Проверяем наличие токена
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);

      if (!token) {
        setError('Необходимо войти в систему для просмотра собеседований.');
        setLoading(false);
        return;
      }

      const response = await api.get('/interviews');
      console.log('API response for interviews:', response.data);

      // Обрабатываем ответ API - он возвращает объект с полем interviews
      const data = response.data;
      let interviews: Interview[] = [];

      if (data && Array.isArray(data.interviews)) {
        // API возвращает объект с полем interviews
        interviews = data.interviews;
      } else if (Array.isArray(data)) {
        // Если API вернул массив напрямую
        interviews = data;
      } else {
        console.warn('Unexpected data structure from /interviews:', data);
        interviews = [];
      }

      console.log('Processed interviews:', interviews);
      console.log(
        'Interviews without feedback:',
        interviews.filter((i) => i && !i.feedback)
      );
      setInterviews(interviews);
    } catch (error: unknown) {
      console.error('Ошибка загрузки собеседований:', error);

      // Проверяем, что это axios error
      const axiosError = error as { response?: { status: number } };

      if (axiosError.response?.status === 401) {
        setError('Необходимо войти в систему для просмотра собеседований.');
      } else if (axiosError.response?.status === 403) {
        setError('Недостаточно прав для просмотра собеседований.');
      } else {
        setError(
          'Не удалось загрузить собеседования. Проверьте подключение к серверу.'
        );
      }

      setInterviews([]); // Устанавливаем пустой массив при ошибке
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (interview?: Interview) => {
    if (interview) {
      setCurrentInterview(interview);
      if (interview.feedback) {
        setFormData({
          content: interview.feedback.content,
          rating: interview.feedback.rating,
        });
      } else {
        setFormData({ content: '', rating: 5 });
      }
    } else {
      setCurrentInterview(null);
      setFormData({ content: '', rating: 5 });
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
      [name]: name === 'rating' ? Number(value) : value,
    }));
  };

  const handleSave = async () => {
    if (!currentInterview) return;

    try {
      // Создание нового отзыва (API не поддерживает обновление)
      const payload = {
        interviewId: currentInterview.id,
        ...formData,
      };

      if (currentInterview.feedback) {
        setError(
          'Отзыв уже существует для этого интервью. Удалите существующий отзыв, чтобы создать новый.'
        );
        return;
      }

      await api.post('/interviews/feedback', payload);
      fetchInterviews();
      handleCloseDialog();
    } catch (error) {
      console.error('Ошибка сохранения отзыва:', error);
      setError('Не удалось сохранить отзыв.');
    }
  };

  const handleDelete = async (interviewId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот отзыв?')) {
      try {
        const interview = Array.isArray(interviews)
          ? interviews.find((i) => i && i.id === interviewId)
          : null;
        if (interview?.feedback) {
          await api.delete(`/interviews/feedback/${interview.feedback.id}`);
          fetchInterviews();
        }
      } catch (error) {
        console.error('Ошибка удаления отзыва:', error);
        setError('Не удалось удалить отзыв.');
      }
    }
  };

  const formatFeedbackContent = (content: string) => {
    // Разбиваем отзыв на секции для лучшего отображения
    const sections = content.split('\n\n').filter((section) => section.trim());
    return sections;
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
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
        gap={2}
      >
        <Typography color="error">{error}</Typography>
        {error.includes('войти в систему') && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/login')}
          >
            Войти в систему
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" mb={3}>
        Отзывы о собеседованиях
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => handleOpenDialog()}
        sx={{ mb: 3 }}
      >
        Добавить отзыв
      </Button>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {Array.isArray(interviews) &&
          interviews
            .filter((interview) => interview && interview.feedback)
            .map((interview) => {
              const feedback = interview.feedback!;
              const contentSections = formatFeedbackContent(feedback.content);

              return (
                <Box
                  key={interview.id}
                  sx={{
                    flex: '1 1 400px',
                    minWidth: '400px',
                    maxWidth: '500px',
                  }}
                >
                  <Card
                    elevation={2}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        mb={2}
                      >
                        <Box>
                          <Typography variant="h6" component="div" gutterBottom>
                            {interview.title}
                          </Typography>
                          <Chip
                            label={`Рейтинг: ${feedback.rating}/5`}
                            size="small"
                            color={
                              feedback.rating >= 4
                                ? 'success'
                                : feedback.rating >= 3
                                ? 'warning'
                                : 'error'
                            }
                            sx={{ mb: 1 }}
                          />
                        </Box>
                        <Box>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(interview.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>

                      {interview.participant?.profile && (
                        <Typography color="text.secondary" gutterBottom>
                          Участник: {interview.participant.profile.firstName}{' '}
                          {interview.participant.profile.lastName}
                        </Typography>
                      )}

                      <Typography color="text.secondary" gutterBottom>
                        Специализация: {interview.specialization}
                      </Typography>

                      <Divider sx={{ my: 2 }} />

                      <Typography variant="body2" color="text.secondary" mb={1}>
                        Отзыв:
                      </Typography>

                      {contentSections.map((section, index) => (
                        <Box key={index} mb={1}>
                          <Typography variant="body2" paragraph>
                            {section}
                          </Typography>
                          {index < contentSections.length - 1 && (
                            <Divider sx={{ my: 1 }} />
                          )}
                        </Box>
                      ))}
                    </CardContent>

                    <Box sx={{ p: 2, pt: 0 }}>
                      <Typography variant="caption" color="text.secondary">
                        Дата:{' '}
                        {new Date(feedback.createdAt).toLocaleDateString(
                          'ru-RU',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )}
                      </Typography>
                    </Box>
                  </Card>
                </Box>
              );
            })}
      </Box>

      {(!Array.isArray(interviews) ||
        interviews.filter((interview) => interview && interview.feedback)
          .length === 0) && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            Отзывы о собеседованиях пока не добавлены
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
          {currentInterview?.feedback
            ? 'Редактировать отзыв'
            : 'Добавить отзыв'}
        </DialogTitle>
        <DialogContent>
          {!currentInterview && (
            <TextField
              fullWidth
              label="Собеседование"
              margin="normal"
              select
              SelectProps={{ native: true }}
              onChange={(e) => {
                const selectedInterview = Array.isArray(interviews)
                  ? interviews.find((i) => i && i.id === e.target.value)
                  : null;
                if (selectedInterview) {
                  handleOpenDialog(selectedInterview);
                }
              }}
            >
              <option value="">Выберите собеседование</option>
              {Array.isArray(interviews) &&
                interviews
                  .filter((interview) => interview && !interview.feedback)
                  .map((interview) => (
                    <option key={interview.id} value={interview.id}>
                      {interview.title} - {interview.specialization}
                    </option>
                  ))}
            </TextField>
          )}

          {currentInterview && (
            <>
              <Typography variant="h6" gutterBottom>
                {currentInterview.title}
              </Typography>
              <Typography color="text.secondary" gutterBottom>
                Специализация: {currentInterview.specialization}
              </Typography>

              <TextField
                fullWidth
                label="Рейтинг (1-5)"
                name="rating"
                type="number"
                value={formData.rating}
                onChange={handleChange}
                margin="normal"
                inputProps={{ min: 1, max: 5 }}
              />

              <TextField
                fullWidth
                label="Подробный отзыв"
                name="content"
                value={formData.content}
                onChange={handleChange}
                margin="normal"
                multiline
                rows={8}
                placeholder="Структурируйте отзыв по разделам:

Общее впечатление:
[Ваше общее впечатление о кандидате]

Технические навыки:
[Оценка технических компетенций]

Коммуникативные навыки:
[Оценка способности к общению]

Рекомендации:
[Ваши рекомендации по кандидату]"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          {currentInterview && (
            <Button onClick={handleSave} color="primary" variant="contained">
              Сохранить
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FeedbackPage;
