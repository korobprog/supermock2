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
  InputAdornment,
  Tooltip,
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
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import LinkIcon from '@mui/icons-material/Link';
import api from '../utils/axios';

// Настройка dayjs для работы с часовыми поясами
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('ru');

interface Interview {
  id: string;
  title: string;
  scheduledAt: string;
  status: string;
  description?: string;
  specialization?: string;
  interestCategory?: string;
  videoLink?: string;
  duration?: number;
  interviewerId?: string;
  participantId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface InterviewResponse {
  interviews: Interview[];
  userInterest: string | null;
  isFiltered: boolean;
}

interface UserProfile {
  firstName: string;
  lastName: string;
  specialization: string;
  interest?: {
    name: string;
    category: string;
  };
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
    videoLink: '',
  });
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedTime, setSelectedTime] = useState<Dayjs | null>(null);
  const [showAllInterviews, setShowAllInterviews] = useState(false);
  const [userInterest, setUserInterest] = useState<string | null>(null);
  const [isFiltered, setIsFiltered] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetchInterviews();
    fetchUserProfile();
  }, [showAllInterviews]);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/users/me');
      const userData = response.data.data.user;
      setUserProfile({
        firstName: userData.profile.firstName,
        lastName: userData.profile.lastName,
        specialization: userData.profile.specialization,
        interest: userData.profile.interest,
      });
    } catch (error) {
      console.error('Ошибка при загрузке профиля:', error);
    }
  };

  const generateInterviewTitle = () => {
    if (!userProfile) return '';

    const name = `${userProfile.firstName} ${userProfile.lastName}`;
    const interest = userProfile.interest?.name || userProfile.specialization;

    return `Интервью с ${name} - ${interest}`;
  };

  const handleAutoFillTitle = () => {
    const autoTitle = generateInterviewTitle();
    if (autoTitle) {
      setFormData((prev) => ({ ...prev, title: autoTitle }));
    }
  };

  const fetchInterviews = async () => {
    try {
      const params = showAllInterviews ? { showAll: 'true' } : {};
      const response = await api.get('/interviews', { params });
      console.log('Ответ сервера при загрузке интервью:', response.data);

      // Проверяем структуру ответа
      if (response.data && Array.isArray(response.data.interviews)) {
        const data: InterviewResponse = response.data;
        setInterviews(data.interviews);
        setUserInterest(data.userInterest);
        setIsFiltered(data.isFiltered);
      } else if (Array.isArray(response.data)) {
        // Если сервер возвращает массив напрямую
        setInterviews(response.data);
        setUserInterest(null);
        setIsFiltered(false);
      } else {
        console.error('Неожиданная структура ответа:', response.data);
        setInterviews([]);
      }
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
        date: interview.scheduledAt,
        description: interview.description || '',
        videoLink: interview.videoLink || '',
      });
      // Парсим существующую дату для редактирования
      if (interview.scheduledAt) {
        const parsedDate = dayjs(interview.scheduledAt).tz('Europe/Moscow');
        setSelectedDate(parsedDate);
        setSelectedTime(parsedDate);
      }
    } else {
      setCurrentInterview(null);
      setFormData({ title: '', date: '', description: '', videoLink: '' });
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
      // Валидация всех обязательных полей
      const errors = [];

      if (!formData.title.trim()) {
        errors.push('Название интервью');
      }

      if (!selectedDate) {
        errors.push('Дата интервью');
      }

      if (!selectedTime) {
        errors.push('Время интервью');
      }

      if (!formData.videoLink.trim()) {
        errors.push('Ссылка на видеоконференцию');
      }

      if (!formData.description.trim()) {
        errors.push('Описание интервью');
      } else if (formData.description.trim().length < 10) {
        errors.push('Описание интервью (минимум 10 символов)');
      }

      if (errors.length > 0) {
        setError(`Заполните обязательные поля: ${errors.join(', ')}`);
        return;
      }

      // Проверяем, что выбранная дата не в прошлом
      if (selectedDate && selectedDate.isBefore(dayjs(), 'day')) {
        setError('Нельзя выбрать дату в прошлом');
        return;
      }

      // Объединяем дату и время в ISO формат для бэкенда
      let scheduledAt = '';
      if (selectedDate && selectedTime) {
        // Создаем объединенную дату/время в московском часовом поясе
        const combinedDateTime = selectedDate
          .hour(selectedTime.hour())
          .minute(selectedTime.minute())
          .second(0)
          .millisecond(0);

        // Конвертируем в ISO формат для отправки на бэкенд
        scheduledAt = combinedDateTime.toISOString();
      }

      const dataToSend = {
        title: formData.title,
        description: formData.description,
        scheduledAt: scheduledAt,
        videoLink: formData.videoLink,
        specialization: 'PROGRAMMING', // Добавляем обязательное поле
        duration: 60, // Добавляем обязательное поле (60 минут по умолчанию)
      };

      console.log('Отправляем данные на сервер:', dataToSend);

      if (currentInterview) {
        // Для обновления используем только измененные поля
        const updateData: {
          title?: string;
          description?: string;
          videoLink?: string;
          scheduledAt?: string;
        } = {};
        if (formData.title !== currentInterview.title)
          updateData.title = formData.title;
        if (formData.description !== currentInterview.description)
          updateData.description = formData.description;
        if (formData.videoLink !== currentInterview.videoLink)
          updateData.videoLink = formData.videoLink;
        if (scheduledAt) updateData.scheduledAt = scheduledAt;

        console.log('Обновляем интервью:', updateData);
        const response = await api.patch(
          `/interviews/${currentInterview.id}`,
          updateData
        );
        console.log('Ответ сервера при обновлении:', response.data);
      } else {
        console.log('Создаем новое интервью');
        const response = await api.post('/interviews', dataToSend);
        console.log('Ответ сервера при создании:', response.data);
      }

      fetchInterviews();
      handleCloseDialog();
      setError(''); // Очищаем ошибку при успешном сохранении
    } catch (error) {
      console.error('Ошибка при сохранении интервью:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response: { data: { error?: string }; status: number };
        };
        console.error('Данные ошибки:', axiosError.response.data);
        console.error('Статус ошибки:', axiosError.response.status);
        setError(
          `Ошибка сервера: ${
            axiosError.response.data.error || 'Неизвестная ошибка'
          }`
        );
      } else {
        setError('Не удалось сохранить интервью.');
      }
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
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        component="span"
                      >
                        Дата:{' '}
                        {dayjs(interview.scheduledAt).format(
                          'DD.MM.YYYY HH:mm'
                        )}{' '}
                        | Статус: {interview.status}
                      </Typography>
                      {interview.videoLink && (
                        <Typography
                          variant="body2"
                          color="primary"
                          component="div"
                          sx={{ mt: 0.5 }}
                        >
                          📹 Видеоконференция: {interview.videoLink}
                        </Typography>
                      )}
                      {interview.specialization && (
                        <Chip
                          label={getInterestDisplayName(
                            interview.specialization
                          )}
                          size="small"
                          variant="outlined"
                          sx={{ mt: 0.5 }}
                        />
                      )}
                    </Box>
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
                  label="Название *"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  error={!formData.title.trim()}
                  helperText={!formData.title.trim() ? 'Обязательное поле' : ''}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title="Автозаполнение на основе профиля">
                          <IconButton
                            onClick={handleAutoFillTitle}
                            edge="end"
                            size="small"
                          >
                            <AutoFixHighIcon />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                />

                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Дата интервью *
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
                      ...(!selectedDate && {
                        border: '1px solid #d32f2f',
                        borderRadius: 1,
                      }),
                    }}
                  />
                  <Typography
                    variant="caption"
                    color={!selectedDate ? 'error' : 'text.secondary'}
                  >
                    {!selectedDate ? 'Обязательное поле - ' : ''}Выберите дату
                    проведения интервью (только будущие дни)
                  </Typography>
                </Box>

                <TimePicker
                  label="Время (МСК) *"
                  value={selectedTime}
                  onChange={(newValue: Dayjs | null) =>
                    setSelectedTime(newValue)
                  }
                  format="HH:mm"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !selectedTime,
                      helperText: !selectedTime
                        ? 'Обязательное поле - Время по московскому часовому поясу'
                        : 'Время по московскому часовому поясу',
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Ссылка на видеоконференцию *"
                  name="videoLink"
                  value={formData.videoLink}
                  onChange={handleChange}
                  required
                  error={!formData.videoLink.trim()}
                  placeholder="https://meet.google.com/... или https://zoom.us/..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LinkIcon />
                      </InputAdornment>
                    ),
                  }}
                  helperText={
                    !formData.videoLink.trim()
                      ? 'Обязательное поле'
                      : 'Поддерживаемые сервисы: Google Meet, Zoom, Microsoft Teams, Skype, Discord'
                  }
                />

                <TextField
                  fullWidth
                  label="Описание *"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  error={
                    !formData.description.trim() ||
                    formData.description.trim().length < 10
                  }
                  multiline
                  rows={4}
                  placeholder="Дополнительная информация об интервью..."
                  helperText={
                    !formData.description.trim()
                      ? 'Обязательное поле'
                      : formData.description.trim().length < 10
                      ? `Минимум 10 символов (введено: ${
                          formData.description.trim().length
                        })`
                      : `Символов: ${formData.description.trim().length}`
                  }
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
                !selectedDate ||
                !selectedTime ||
                !formData.title.trim() ||
                !formData.videoLink.trim() ||
                !formData.description.trim() ||
                formData.description.trim().length < 10
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
