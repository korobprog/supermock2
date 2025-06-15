import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  FormControlLabel,
  Switch,
  Alert,
  Chip,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ru';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import api from '../utils/axios';

// Настройка dayjs для работы с часовыми поясами
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('ru');

interface Interview {
  id: string;
  title: string;
  date: string;
  status: string;
  description?: string;
  interestCategory?: string;
}

interface InterviewResponse {
  interviews: Interview[];
  userInterest: string | null;
  isFiltered: boolean;
}

const InterviewPage = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentInterview, setCurrentInterview] = useState<Interview | null>(
    null
  );
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    description: '',
  });
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedTime, setSelectedTime] = useState<Dayjs | null>(null);
  const [showAllInterviews, setShowAllInterviews] = useState(false);
  const [userInterest, setUserInterest] = useState<string | null>(null);
  const [isFiltered, setIsFiltered] = useState(false);

  useEffect(() => {
    fetchInterviews();
  }, [showAllInterviews]);

  const fetchInterviews = async () => {
    try {
      const params = showAllInterviews ? { showAll: 'true' } : {};
      const response = await api.get('/interviews', { params });
      const data: InterviewResponse = response.data;

      setInterviews(data.interviews);
      setUserInterest(data.userInterest);
      setIsFiltered(data.isFiltered);
    } catch (error) {
      console.error('Ошибка при загрузке интервью:', error);
      setError('Не удалось загрузить интервью.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (interview?: Interview) => {
    if (interview) {
      setCurrentInterview(interview);
      setFormData({
        title: interview.title,
        date: interview.date,
        description: interview.description || '',
      });
      // Парсим существующую дату для редактирования
      if (interview.date) {
        const parsedDate = dayjs(interview.date).tz('Europe/Moscow');
        setSelectedDate(parsedDate);
        setSelectedTime(parsedDate);
      }
    } else {
      setCurrentInterview(null);
      setFormData({ title: '', date: '', description: '' });
      // Устанавливаем завтрашнюю дату по умолчанию
      setSelectedDate(dayjs().add(1, 'day'));
      // Устанавливаем время по умолчанию на 10:00
      setSelectedTime(dayjs().hour(10).minute(0));
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setError(''); // Очищаем ошибки при закрытии диалога
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      // Проверяем, что выбранная дата не в прошлом
      if (selectedDate && selectedDate.isBefore(dayjs(), 'day')) {
        setError('Нельзя выбрать дату в прошлом');
        return;
      }

      // Объединяем дату и время в одну строку с указанием часового пояса МСК
      let combinedDateTime = '';
      if (selectedDate && selectedTime) {
        const date = selectedDate.format('YYYY-MM-DD');
        const time = selectedTime.format('HH:mm');
        combinedDateTime = `${date} ${time} (МСК)`;
      }

      const dataToSend = {
        ...formData,
        date: combinedDateTime,
      };

      if (currentInterview) {
        await api.patch(`/interviews/${currentInterview.id}`, dataToSend);
      } else {
        await api.post('/interviews', dataToSend);
      }

      fetchInterviews();
      handleCloseDialog();
      setError(''); // Очищаем ошибку при успешном сохранении
    } catch (error) {
      console.error('Ошибка при сохранении интервью:', error);
      setError('Не удалось сохранить интервью.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/interviews/${id}`);
      fetchInterviews();
    } catch {
      setError('Не удалось удалить интервью.');
    }
  };

  const handleToggleFilter = () => {
    setShowAllInterviews(!showAllInterviews);
  };

  const getInterestDisplayName = (category: string) => {
    const interestMap: { [key: string]: string } = {
      PROGRAMMING: 'Программирование',
      TESTING: 'Тестирование',
      ANALYTICS_DATA_SCIENCE: 'Аналитика и Data Science',
      DESIGN: 'Дизайн',
      MANAGEMENT: 'Менеджмент',
      MARKETING: 'Маркетинг',
      SALES: 'Продажи',
      HR: 'HR',
      OTHER: 'Другое',
    };
    return interestMap[category] || category;
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
          Интервью
        </Typography>

        {/* Информация о фильтрации */}
        {userInterest && (
          <Box sx={{ mb: 2 }}>
            {isFiltered ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                Показаны интервью по вашему интересу:{' '}
                <Chip
                  label={getInterestDisplayName(userInterest)}
                  size="small"
                  color="primary"
                  sx={{ ml: 1 }}
                />
              </Alert>
            ) : (
              <Alert severity="info" sx={{ mb: 2 }}>
                Показаны все доступные интервью
              </Alert>
            )}

            <FormControlLabel
              control={
                <Switch
                  checked={showAllInterviews}
                  onChange={handleToggleFilter}
                  color="primary"
                />
              }
              label={
                showAllInterviews
                  ? 'Показать все интервью'
                  : 'Фильтровать по интересу'
              }
              sx={{ mb: 2 }}
            />
          </Box>
        )}

        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
          sx={{ mb: 2 }}
        >
          Создать интервью
        </Button>

        {!interviews || interviews.length === 0 ? (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ textAlign: 'center', py: 4 }}
          >
            {isFiltered
              ? `Нет интервью по интересу "${
                  userInterest ? getInterestDisplayName(userInterest) : ''
                }". Попробуйте показать все интервью.`
              : 'Нет доступных интервью.'}
          </Typography>
        ) : (
          <List>
            {interviews.map((interview) => (
              <ListItem key={interview.id}>
                <ListItemText
                  primary={interview.title}
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        Дата: {interview.date} | Статус: {interview.status}
                      </Typography>
                      {interview.interestCategory && (
                        <Chip
                          label={getInterestDisplayName(
                            interview.interestCategory
                          )}
                          size="small"
                          variant="outlined"
                          sx={{ mt: 0.5 }}
                        />
                      )}
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handleOpenDialog(interview)}
                    aria-label={`Редактировать интервью ${interview.title}`}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={() => handleDelete(interview.id)}
                    aria-label={`Удалить интервью ${interview.title}`}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {currentInterview ? 'Редактировать интервью' : 'Создать интервью'}
          </DialogTitle>
          <DialogContent>
            {error && (
              <Typography color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
              <Stack spacing={3} sx={{ mt: 1 }}>
                <TextField
                  fullWidth
                  label="Название"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                />

                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Дата интервью
                  </Typography>
                  <DateCalendar
                    value={selectedDate}
                    onChange={(newValue: Dayjs | null) =>
                      setSelectedDate(newValue)
                    }
                    minDate={dayjs().add(1, 'day')}
                    sx={{
                      width: '100%',
                      '& .MuiPickersCalendarHeader-root': {
                        paddingLeft: 1,
                        paddingRight: 1,
                      },
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Выберите дату проведения интервью (только будущие дни)
                  </Typography>
                </Box>

                <TimePicker
                  label="Время (МСК)"
                  value={selectedTime}
                  onChange={(newValue: Dayjs | null) =>
                    setSelectedTime(newValue)
                  }
                  format="HH:mm"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      helperText: 'Время по московскому часовому поясу',
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Описание"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  placeholder="Дополнительная информация об интервью..."
                />
              </Stack>
            </LocalizationProvider>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Отмена</Button>
            <Button
              onClick={handleSave}
              color="primary"
              variant="contained"
              disabled={
                !selectedDate || !selectedTime || !formData.title.trim()
              }
            >
              Сохранить
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default InterviewPage;
