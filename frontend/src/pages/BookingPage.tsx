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
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ru';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import {
  getTimeSlots,
  createBooking,
  formatDateTime,
  formatDate,
  formatTime,
} from '../utils/bookingApi';
import type { TimeSlot, CreateBookingData } from '../utils/bookingApi';
import { getPointsBalance } from '../utils/pointsApi';
import api from '../utils/axios';

// Настройка dayjs для работы с часовыми поясами
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('ru');

const BookingPage = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [filteredSlots, setFilteredSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [userSpecialization, setUserSpecialization] = useState<string>('');
  const [pointsBalance, setPointsBalance] = useState<number>(0);
  const [pointsLoading, setPointsLoading] = useState(false);

  // Список специализаций
  const specializations = [
    'Frontend разработка',
    'Backend разработка',
    'Fullstack разработка',
    'Mobile разработка',
    'DevOps',
    'QA/Тестирование',
    'Data Science',
    'Machine Learning',
    'UI/UX дизайн',
    'Product Management',
    'Project Management',
    'System Architecture',
  ];

  // Маппинг специализаций из профиля к специализациям в фильтре
  const specializationMapping: { [key: string]: string } = {
    Frontend: 'Frontend разработка',
    Backend: 'Backend разработка',
    Fullstack: 'Fullstack разработка',
    Mobile: 'Mobile разработка',
    DevOps: 'DevOps',
    QA: 'QA/Тестирование',
    Testing: 'QA/Тестирование',
    'Data Science': 'Data Science',
    'Machine Learning': 'Machine Learning',
    'UI/UX': 'UI/UX дизайн',
    'Product Management': 'Product Management',
    'Project Management': 'Project Management',
    'System Architecture': 'System Architecture',
  };

  useEffect(() => {
    fetchUserProfile();
    fetchTimeSlots();
    fetchPointsBalance();
  }, []);

  useEffect(() => {
    // Устанавливаем специализацию пользователя как значение по умолчанию
    console.log('useEffect сработал:', {
      userSpecialization,
      selectedSpecialization,
    });

    if (userSpecialization && !selectedSpecialization) {
      console.log(
        'Попытка установить специализацию по умолчанию:',
        userSpecialization
      );

      // Пытаемся найти соответствие в маппинге
      const mappedSpecialization =
        specializationMapping[userSpecialization] || userSpecialization;
      console.log('Маппированная специализация:', mappedSpecialization);
      console.log('Доступные специализации:', specializations);

      // Проверяем, есть ли такая специализация в списке доступных
      if (specializations.includes(mappedSpecialization)) {
        console.log(
          'Найдено точное соответствие, устанавливаем:',
          mappedSpecialization
        );
        setSelectedSpecialization(mappedSpecialization);
      } else {
        // Если точного соответствия нет, пытаемся найти частичное совпадение
        const partialMatch = specializations.find(
          (spec) =>
            spec.toLowerCase().includes(userSpecialization.toLowerCase()) ||
            userSpecialization.toLowerCase().includes(spec.toLowerCase())
        );
        if (partialMatch) {
          console.log(
            'Найдено частичное соответствие, устанавливаем:',
            partialMatch
          );
          setSelectedSpecialization(partialMatch);
        } else {
          console.log(
            'Соответствие не найдено для специализации:',
            userSpecialization
          );
        }
      }
    }
  }, [userSpecialization, selectedSpecialization]);

  useEffect(() => {
    // При изменении фильтров перезагружаем данные с сервера
    fetchTimeSlots();
  }, [selectedSpecialization, selectedDate]);

  useEffect(() => {
    // Применяем клиентскую фильтрацию только при изменении загруженных слотов
    applyFilters();
  }, [timeSlots]);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/users/me');
      const userData = response.data.data.user;
      const specialization = userData.profile.specialization;
      console.log('Загружена специализация из профиля:', specialization);
      setUserSpecialization(specialization);
    } catch (error) {
      console.error('Ошибка при загрузке профиля пользователя:', error);
      // Не показываем ошибку пользователю, так как это не критично
    }
  };

  const fetchPointsBalance = async () => {
    try {
      setPointsLoading(true);
      const balance = await getPointsBalance();
      setPointsBalance(balance);
    } catch (error) {
      console.error('Ошибка при загрузке баланса баллов:', error);
      // Не показываем ошибку пользователю, так как это не критично для отображения слотов
    } finally {
      setPointsLoading(false);
    }
  };

  const fetchTimeSlots = async () => {
    try {
      setLoading(true);
      console.log('🔍 [DEBUG FRONTEND] Запрашиваем слоты с фильтрами:', {
        specialization: selectedSpecialization || undefined,
        startDate: selectedDate ? selectedDate.format('YYYY-MM-DD') : undefined,
      });

      // Формируем параметры запроса с учетом фильтров
      const params: {
        specialization?: string;
        startDate?: string;
        endDate?: string;
      } = {};
      if (selectedSpecialization) {
        params.specialization = selectedSpecialization;
      }
      if (selectedDate) {
        params.startDate = selectedDate.format('YYYY-MM-DD');
        params.endDate = selectedDate.format('YYYY-MM-DD');
      }

      // Запрашиваем слоты с учетом фильтров
      const allSlots = await getTimeSlots(params);
      console.log(
        '🔍 [DEBUG FRONTEND] Получено ВСЕХ слотов от API:',
        allSlots.length
      );
      console.log('🔍 [DEBUG FRONTEND] Все слоты по статусам:', {
        AVAILABLE: allSlots.filter((s) => s.status === 'AVAILABLE').length,
        BOOKED: allSlots.filter((s) => s.status === 'BOOKED').length,
        CANCELLED: allSlots.filter((s) => s.status === 'CANCELLED').length,
      });

      // Показываем забронированные слоты с активными собеседованиями
      const bookedSlots = allSlots.filter(
        (s) => s.status === 'BOOKED' && s.booking
      );
      console.log(
        '🔍 [DEBUG FRONTEND] Забронированные слоты с собеседованиями:',
        bookedSlots.map((slot) => ({
          id: slot.id,
          status: slot.status,
          startTime: slot.startTime,
          specialization: slot.specialization,
          booking: {
            id: slot.booking?.id,
            status: slot.booking?.status,
            candidateId: slot.booking?.candidateId,
            interview: slot.booking?.interview,
          },
        }))
      );

      // Фильтруем слоты: показываем доступные для бронирования и активные собеседования
      const relevantSlots = allSlots.filter((slot) => {
        // Показываем доступные слоты
        if (slot.status === 'AVAILABLE') {
          return true;
        }
        // Показываем забронированные слоты с активными собеседованиями
        if (
          slot.status === 'BOOKED' &&
          slot.booking &&
          slot.booking.interview
        ) {
          const interviewStatus = slot.booking.interview.status;
          return (
            interviewStatus === 'SCHEDULED' || interviewStatus === 'IN_PROGRESS'
          );
        }
        return false;
      });

      console.log(
        '🔍 [DEBUG FRONTEND] Релевантные слоты (доступные + активные собеседования):',
        relevantSlots.map((slot) => ({
          id: slot.id,
          status: slot.status,
          startTime: slot.startTime,
          specialization: slot.specialization,
          hasBooking: !!slot.booking,
          booking: slot.booking,
        }))
      );

      // Бэкенд уже фильтрует прошедшие слоты, поэтому просто используем полученные данные
      console.log(
        '🔍 [DEBUG FRONTEND] Финальные слоты после обработки:',
        relevantSlots.length
      );

      setTimeSlots(relevantSlots);
    } catch (error) {
      console.error('Ошибка при загрузке временных слотов:', error);
      setError('Не удалось загрузить доступные временные слоты.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    // Поскольку фильтрация теперь происходит на сервере,
    // здесь мы только сортируем результаты
    const filtered = [...timeSlots].sort(
      (a, b) => dayjs(a.startTime).valueOf() - dayjs(b.startTime).valueOf()
    );

    setFilteredSlots(filtered);
  };

  const handleOpenBookingDialog = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setOpenDialog(true);
    setError('');
    setSuccess('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSlot(null);
  };

  const handleBookSlot = async () => {
    if (!selectedSlot) return;

    // Проверяем баланс баллов перед бронированием
    if (pointsBalance < 1) {
      setError(
        'Недостаточно баллов для бронирования. Для бронирования собеседования необходимо минимум 1 балл.'
      );
      return;
    }

    try {
      setBookingInProgress(true);
      const bookingData: CreateBookingData = {
        slotId: selectedSlot.id,
      };

      await createBooking(bookingData);
      setSuccess(
        'Слот успешно забронирован! Вы можете посмотреть детали в разделе "Мои бронирования".'
      );
      handleCloseDialog();
      await fetchTimeSlots(); // Обновляем список слотов
      await fetchPointsBalance(); // Обновляем баланс баллов
    } catch (error) {
      console.error('Ошибка при бронировании слота:', error);
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message || 'Не удалось забронировать слот.'
          : 'Не удалось забронировать слот.';
      setError(errorMessage);
    } finally {
      setBookingInProgress(false);
    }
  };

  const clearFilters = () => {
    setSelectedSpecialization('');
    setSelectedDate(null);
    // После очистки фильтров данные автоматически перезагрузятся через useEffect
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

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="flex-start"
      minHeight="60vh"
      sx={{ p: 2 }}
    >
      <Paper
        elevation={3}
        sx={{ p: 4, minWidth: 320, width: '100%', maxWidth: 900 }}
      >
        <Typography variant="h5" mb={3}>
          Собеседования и бронирование
        </Typography>

        {/* Информация о балансе баллов */}
        <Paper
          elevation={1}
          sx={{
            p: 2,
            mb: 3,
            backgroundColor: pointsBalance < 1 ? '#fff3e0' : '#e8f5e8',
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Typography
              variant="h6"
              color={pointsBalance < 1 ? 'warning.main' : 'success.main'}
            >
              Баланс баллов: {pointsLoading ? '...' : pointsBalance}
            </Typography>
            {pointsBalance < 1 && (
              <Chip label="Недостаточно баллов" color="warning" size="small" />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary" mt={1}>
            {pointsBalance < 1
              ? 'Для бронирования собеседования необходимо минимум 1 балл. При бронировании будет списан 1 балл.'
              : 'При бронировании собеседования будет списан 1 балл.'}
          </Typography>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* Фильтры */}
        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" mb={2}>
            Фильтры
          </Typography>
          <Stack spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Специализация</InputLabel>
              <Select
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                label="Специализация"
              >
                <MenuItem value="">Все специализации</MenuItem>
                {specializations.map((spec) => (
                  <MenuItem key={spec} value={spec}>
                    {spec}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
              <DatePicker
                label="Дата"
                value={selectedDate}
                onChange={(newValue: Dayjs | null) => setSelectedDate(newValue)}
                format="DD.MM.YYYY"
                minDate={dayjs()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    helperText: 'Выберите дату для фильтрации слотов',
                  },
                }}
              />
            </LocalizationProvider>

            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                onClick={clearFilters}
                disabled={!selectedSpecialization && !selectedDate}
              >
                Очистить фильтры
              </Button>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ alignSelf: 'center' }}
              >
                Найдено слотов: {filteredSlots.length}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Список слотов */}
        {filteredSlots.length === 0 ? (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ textAlign: 'center', py: 4 }}
          >
            {timeSlots.length === 0
              ? 'Нет доступных слотов для бронирования и активных собеседований.'
              : 'Нет слотов, соответствующих выбранным фильтрам. Попробуйте изменить критерии поиска.'}
          </Typography>
        ) : (
          <List>
            {filteredSlots.map((slot) => {
              const isAvailable = slot.status === 'AVAILABLE';
              const isActiveInterview =
                slot.status === 'BOOKED' &&
                slot.booking &&
                slot.booking.interview;

              return (
                <ListItem key={slot.id} divider>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography variant="h6" component="span">
                          {slot.specialization}
                        </Typography>
                        {isAvailable && (
                          <Chip label="Доступен" color="success" size="small" />
                        )}
                        {isActiveInterview && (
                          <Chip
                            label="Активное собеседование"
                            color="primary"
                            size="small"
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box component="span" sx={{ display: 'block' }}>
                        <Box
                          component="span"
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 0.5,
                          }}
                        >
                          <AccessTimeIcon fontSize="small" color="action" />
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            component="span"
                          >
                            {formatDate(slot.startTime)} в{' '}
                            {formatTime(slot.startTime)} -{' '}
                            {formatTime(slot.endTime)}
                          </Typography>
                        </Box>
                        <Box
                          component="span"
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 0.5,
                          }}
                        >
                          <PersonIcon fontSize="small" color="action" />
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            component="span"
                          >
                            Интервьюер: {slot.interviewer.profile?.firstName}{' '}
                            {slot.interviewer.profile?.lastName}
                          </Typography>
                        </Box>
                        {isActiveInterview && slot.booking && (
                          <Box
                            component="span"
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              mb: 0.5,
                            }}
                          >
                            <PersonIcon fontSize="small" color="action" />
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              component="span"
                            >
                              Кандидат:{' '}
                              {slot.booking.candidate.profile?.firstName}{' '}
                              {slot.booking.candidate.profile?.lastName}
                            </Typography>
                          </Box>
                        )}
                        {isActiveInterview && slot.booking?.interview && (
                          <Box
                            component="span"
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              mb: 0.5,
                            }}
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              component="span"
                            >
                              Собеседование: {slot.booking.interview.title}
                            </Typography>
                          </Box>
                        )}
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          component="span"
                        >
                          Продолжительность:{' '}
                          {dayjs(slot.endTime).diff(
                            dayjs(slot.startTime),
                            'minute'
                          )}{' '}
                          мин
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    {isAvailable ? (
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<BookmarkIcon />}
                        onClick={() => handleOpenBookingDialog(slot)}
                        disabled={pointsBalance < 1}
                      >
                        {pointsBalance < 1
                          ? 'Недостаточно баллов'
                          : 'Забронировать'}
                      </Button>
                    ) : (
                      <Chip
                        label="Забронировано"
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
          </List>
        )}

        {/* Диалог подтверждения бронирования */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Подтверждение бронирования</DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {selectedSlot && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  {selectedSlot.specialization}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Дата и время:
                    </Typography>
                    <Typography variant="body1">
                      {formatDateTime(selectedSlot.startTime)} -{' '}
                      {formatTime(selectedSlot.endTime)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Интервьюер:
                    </Typography>
                    <Typography variant="body1">
                      {selectedSlot.interviewer.profile?.firstName}{' '}
                      {selectedSlot.interviewer.profile?.lastName}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Продолжительность:
                    </Typography>
                    <Typography variant="body1">
                      {dayjs(selectedSlot.endTime).diff(
                        dayjs(selectedSlot.startTime),
                        'minute'
                      )}{' '}
                      минут
                    </Typography>
                  </Box>
                </Stack>
                {pointsBalance < 1 ? (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    У вас недостаточно баллов для бронирования. Для бронирования
                    собеседования необходимо минимум 1 балл.
                  </Alert>
                ) : (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    После бронирования вы получите уведомление с деталями
                    собеседования. Интервьюер должен будет подтвердить
                    бронирование. С вашего баланса будет списан 1 балл.
                  </Alert>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={bookingInProgress}>
              Отмена
            </Button>
            <Button
              onClick={handleBookSlot}
              color="primary"
              variant="contained"
              disabled={bookingInProgress || pointsBalance < 1}
            >
              {bookingInProgress
                ? 'Бронирование...'
                : pointsBalance < 1
                ? 'Недостаточно баллов'
                : 'Подтвердить бронирование'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default BookingPage;
