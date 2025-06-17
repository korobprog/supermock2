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
  Stack,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ru';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import {
  getInterviewerTimeSlots,
  createTimeSlot,
  updateTimeSlot,
  deleteTimeSlot,
  formatDateTime,
  getStatusDisplayName,
  getStatusColor,
} from '../utils/bookingApi';
import type {
  TimeSlot,
  CreateTimeSlotData,
  UpdateTimeSlotData,
} from '../utils/bookingApi';

// Настройка dayjs для работы с часовыми поясами
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('ru');

const TimeSlotsPage = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentTimeSlot, setCurrentTimeSlot] = useState<TimeSlot | null>(null);
  const [formData, setFormData] = useState({
    specialization: '',
  });
  const [startTime, setStartTime] = useState<Dayjs | null>(null);
  const [endTime, setEndTime] = useState<Dayjs | null>(null);

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

  useEffect(() => {
    fetchTimeSlots();
  }, []);

  const fetchTimeSlots = async () => {
    try {
      setLoading(true);
      const slots = await getInterviewerTimeSlots();
      setTimeSlots(slots);
    } catch (error) {
      console.error('Ошибка при загрузке временных слотов:', error);
      setError('Не удалось загрузить временные слоты.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (timeSlot?: TimeSlot) => {
    if (timeSlot) {
      setCurrentTimeSlot(timeSlot);
      setFormData({
        specialization: timeSlot.specialization,
      });
      setStartTime(dayjs(timeSlot.startTime).tz('Europe/Moscow'));
      setEndTime(dayjs(timeSlot.endTime).tz('Europe/Moscow'));
    } else {
      setCurrentTimeSlot(null);
      setFormData({ specialization: '' });
      // Устанавливаем время по умолчанию на завтра в 10:00
      const tomorrow = dayjs().add(1, 'day').hour(10).minute(0).second(0);
      setStartTime(tomorrow);
      setEndTime(tomorrow.add(1, 'hour'));
    }
    setOpenDialog(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setError('');
  };

  const handleSave = async () => {
    try {
      // Валидация
      if (!formData.specialization.trim()) {
        setError('Пожалуйста, выберите специализацию');
        return;
      }

      if (!startTime || !endTime) {
        setError('Пожалуйста, выберите время начала и окончания');
        return;
      }

      if (startTime.isBefore(dayjs(), 'minute')) {
        setError('Время начала не может быть в прошлом');
        return;
      }

      if (endTime.isBefore(startTime)) {
        setError('Время окончания должно быть позже времени начала');
        return;
      }

      const duration = endTime.diff(startTime, 'minute');
      if (duration < 30) {
        setError('Минимальная продолжительность слота - 30 минут');
        return;
      }

      if (duration > 180) {
        setError('Максимальная продолжительность слота - 3 часа');
        return;
      }

      const dataToSend = {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        specialization: formData.specialization,
      };

      if (currentTimeSlot) {
        await updateTimeSlot(
          currentTimeSlot.id,
          dataToSend as UpdateTimeSlotData
        );
      } else {
        await createTimeSlot(dataToSend as CreateTimeSlotData);
      }

      await fetchTimeSlots();
      handleCloseDialog();
    } catch (error) {
      console.error('Ошибка при сохранении временного слота:', error);
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message || 'Не удалось сохранить временной слот.'
          : 'Не удалось сохранить временной слот.';
      setError(errorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm('Вы уверены, что хотите удалить этот временной слот?')
    ) {
      return;
    }

    try {
      await deleteTimeSlot(id);
      await fetchTimeSlots();
    } catch (error) {
      console.error('Ошибка при удалении временного слота:', error);
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message || 'Не удалось удалить временной слот.'
          : 'Не удалось удалить временной слот.';
      setError(errorMessage);
    }
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
        sx={{ p: 4, minWidth: 320, width: '100%', maxWidth: 800 }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h5">Управление временными слотами</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Создать слот
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {timeSlots.length === 0 ? (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ textAlign: 'center', py: 4 }}
          >
            У вас пока нет созданных временных слотов. Создайте первый слот для
            проведения собеседований.
          </Typography>
        ) : (
          <List>
            {timeSlots.map((slot) => (
              <ListItem key={slot.id} divider>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="h6" component="span">
                        {slot.specialization}
                      </Typography>
                      <Chip
                        label={getStatusDisplayName(slot.status)}
                        color={getStatusColor(slot.status)}
                        size="small"
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Начало: {formatDateTime(slot.startTime)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Окончание: {formatDateTime(slot.endTime)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
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
                  <IconButton
                    edge="end"
                    onClick={() => handleOpenDialog(slot)}
                    aria-label={`Редактировать слот ${slot.specialization}`}
                    disabled={slot.status === 'BOOKED'}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={() => handleDelete(slot.id)}
                    aria-label={`Удалить слот ${slot.specialization}`}
                    disabled={slot.status === 'BOOKED'}
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
            {currentTimeSlot
              ? 'Редактировать временной слот'
              : 'Создать временной слот'}
          </DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
              <Stack spacing={3} sx={{ mt: 1 }}>
                <FormControl fullWidth>
                  <InputLabel>Специализация</InputLabel>
                  <Select
                    name="specialization"
                    value={formData.specialization}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        specialization: e.target.value,
                      }))
                    }
                    label="Специализация"
                  >
                    {specializations.map((spec) => (
                      <MenuItem key={spec} value={spec}>
                        {spec}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Box>
                  <DateTimePicker
                    label="Время начала (МСК)"
                    value={startTime}
                    onChange={(newValue: Dayjs | null) =>
                      setStartTime(newValue)
                    }
                    format="DD.MM.YYYY HH:mm"
                    minDateTime={dayjs().add(1, 'hour')}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        helperText: 'Время по московскому часовому поясу',
                        sx: { mb: 2 },
                      },
                    }}
                  />
                  <DateTimePicker
                    label="Время окончания (МСК)"
                    value={endTime}
                    onChange={(newValue: Dayjs | null) => setEndTime(newValue)}
                    format="DD.MM.YYYY HH:mm"
                    minDateTime={
                      startTime
                        ? startTime.add(30, 'minute')
                        : dayjs().add(1, 'hour')
                    }
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        helperText: 'Время по московскому часовому поясу',
                      },
                    }}
                  />
                </Box>

                {startTime && endTime && (
                  <Alert severity="info">
                    Продолжительность слота: {endTime.diff(startTime, 'minute')}{' '}
                    минут
                  </Alert>
                )}
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
                !startTime || !endTime || !formData.specialization.trim()
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

export default TimeSlotsPage;
