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
  Tabs,
  Tab,
  IconButton,
  Tooltip,
} from '@mui/material';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import {
  getBookings,
  getInterviewerBookings,
  cancelBooking,
  confirmBooking,
  formatDateTime,
  formatDate,
  formatTime,
  getStatusDisplayName,
  getStatusColor,
} from '../utils/bookingApi';
import type { Booking, GetBookingsParams } from '../utils/bookingApi';

// Настройка dayjs для работы с часовыми поясами
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('ru');

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`booking-tabpanel-${index}`}
      aria-labelledby={`booking-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const MyBookingsPage = () => {
  const [candidateBookings, setCandidateBookings] = useState<Booking[]>([]);
  const [interviewerBookings, setInterviewerBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [dialogAction, setDialogAction] = useState<
    'cancel' | 'confirm' | 'details'
  >('details');
  const [actionInProgress, setActionInProgress] = useState(false);

  const statusOptions = [
    { value: '', label: 'Все статусы' },
    { value: 'CREATED', label: 'Создано' },
    { value: 'CONFIRMED', label: 'Подтверждено' },
    { value: 'CANCELLED', label: 'Отменено' },
    { value: 'COMPLETED', label: 'Завершено' },
  ];

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params: GetBookingsParams = statusFilter
        ? {
            status: statusFilter as
              | 'CREATED'
              | 'CONFIRMED'
              | 'CANCELLED'
              | 'COMPLETED',
          }
        : {};

      console.log(
        '🔍 [DEBUG MyBookings] Запрашиваем бронирования с параметрами:',
        params
      );

      const [candidateData, interviewerData] = await Promise.all([
        getBookings(params),
        getInterviewerBookings(params),
      ]);

      console.log(
        '🔍 [DEBUG MyBookings] Получено бронирований как кандидат:',
        candidateData.length
      );
      console.log(
        '🔍 [DEBUG MyBookings] Получено бронирований как интервьюер:',
        interviewerData.length
      );

      console.log(
        '🔍 [DEBUG MyBookings] Бронирования как кандидат:',
        candidateData.map((b) => ({
          id: b.id,
          status: b.status,
          slotStartTime: b.slot.startTime,
          specialization: b.slot.specialization,
          interviewId: b.interviewId,
          hasInterview: !!b.interview,
        }))
      );

      console.log(
        '🔍 [DEBUG MyBookings] Бронирования как интервьюер:',
        interviewerData.map((b) => ({
          id: b.id,
          status: b.status,
          slotStartTime: b.slot.startTime,
          specialization: b.slot.specialization,
          interviewId: b.interviewId,
          hasInterview: !!b.interview,
        }))
      );

      setCandidateBookings(candidateData);
      setInterviewerBookings(interviewerData);
    } catch (error) {
      console.error('Ошибка при загрузке бронирований:', error);
      setError('Не удалось загрузить бронирования.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      fetchBookings();
    }
  }, [statusFilter]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (
    booking: Booking,
    action: 'cancel' | 'confirm' | 'details'
  ) => {
    setSelectedBooking(booking);
    setDialogAction(action);
    setOpenDialog(true);
    setError('');
    setSuccess('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBooking(null);
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    try {
      setActionInProgress(true);
      await cancelBooking(selectedBooking.id, {
        reason: 'Отменено пользователем',
      });
      setSuccess('Бронирование успешно отменено.');
      handleCloseDialog();
      await fetchBookings();
    } catch (error) {
      console.error('Ошибка при отмене бронирования:', error);
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message || 'Не удалось отменить бронирование.'
          : 'Не удалось отменить бронирование.';
      setError(errorMessage);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedBooking) return;

    try {
      setActionInProgress(true);
      await confirmBooking(selectedBooking.id);
      setSuccess('Бронирование успешно подтверждено.');
      handleCloseDialog();
      await fetchBookings();
    } catch (error) {
      console.error('Ошибка при подтверждении бронирования:', error);
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message || 'Не удалось подтвердить бронирование.'
          : 'Не удалось подтвердить бронирование.';
      setError(errorMessage);
    } finally {
      setActionInProgress(false);
    }
  };

  const renderBookingList = (
    bookings: Booking[],
    isInterviewer: boolean = false
  ) => {
    if (bookings.length === 0) {
      return (
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ textAlign: 'center', py: 4 }}
        >
          {statusFilter
            ? `Нет бронирований со статусом "${
                statusOptions.find((opt) => opt.value === statusFilter)?.label
              }".`
            : 'У вас пока нет бронирований.'}
        </Typography>
      );
    }

    return (
      <List>
        {bookings.map((booking) => (
          <ListItem key={booking.id} divider>
            <ListItemText
              primary={
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Typography variant="h6" component="span">
                    {booking.slot.specialization}
                  </Typography>
                  <Chip
                    label={getStatusDisplayName(booking.status)}
                    color={getStatusColor(booking.status)}
                    size="small"
                  />
                </Box>
              }
              secondary={
                <Box>
                  <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                    <AccessTimeIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(booking.slot.startTime)} в{' '}
                      {formatTime(booking.slot.startTime)} -{' '}
                      {formatTime(booking.slot.endTime)}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                    <PersonIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {isInterviewer
                        ? `Кандидат: ${booking.candidate.profile?.firstName} ${booking.candidate.profile?.lastName}`
                        : `Интервьюер: ${booking.slot.interviewer.profile?.firstName} ${booking.slot.interviewer.profile?.lastName}`}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Забронировано: {formatDateTime(booking.createdAt)}
                  </Typography>
                  {booking.pointsSpent > 0 && (
                    <Typography variant="body2" color="text.secondary">
                      Потрачено баллов: {booking.pointsSpent}
                    </Typography>
                  )}
                </Box>
              }
            />
            <ListItemSecondaryAction>
              <Stack direction="row" spacing={1}>
                <Tooltip title="Подробности">
                  <IconButton
                    onClick={() => handleOpenDialog(booking, 'details')}
                    size="small"
                  >
                    <InfoIcon />
                  </IconButton>
                </Tooltip>

                {isInterviewer && booking.status === 'CREATED' && (
                  <Tooltip title="Подтвердить">
                    <IconButton
                      onClick={() => handleOpenDialog(booking, 'confirm')}
                      size="small"
                      color="success"
                    >
                      <CheckCircleIcon />
                    </IconButton>
                  </Tooltip>
                )}

                {booking.status !== 'CANCELLED' &&
                  booking.status !== 'COMPLETED' && (
                    <Tooltip title="Отменить">
                      <IconButton
                        onClick={() => handleOpenDialog(booking, 'cancel')}
                        size="small"
                        color="error"
                      >
                        <CancelIcon />
                      </IconButton>
                    </Tooltip>
                  )}
              </Stack>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    );
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
        sx={{ p: 4, minWidth: 320, width: '100%', maxWidth: 1000 }}
      >
        <Typography variant="h5" mb={3}>
          Мои бронирования
        </Typography>

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

        {/* Фильтр по статусу */}
        <Box mb={3}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Фильтр по статусу</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Фильтр по статусу"
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Вкладки */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab
              label={`Как кандидат (${candidateBookings.length})`}
              id="booking-tab-0"
              aria-controls="booking-tabpanel-0"
            />
            <Tab
              label={`Как интервьюер (${interviewerBookings.length})`}
              id="booking-tab-1"
              aria-controls="booking-tabpanel-1"
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {renderBookingList(candidateBookings, false)}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {renderBookingList(interviewerBookings, true)}
        </TabPanel>

        {/* Диалог действий с бронированием */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {dialogAction === 'cancel' && 'Отмена бронирования'}
            {dialogAction === 'confirm' && 'Подтверждение бронирования'}
            {dialogAction === 'details' && 'Детали бронирования'}
          </DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {selectedBooking && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  {selectedBooking.slot.specialization}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Статус:
                    </Typography>
                    <Chip
                      label={getStatusDisplayName(selectedBooking.status)}
                      color={getStatusColor(selectedBooking.status)}
                      size="small"
                    />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Дата и время:
                    </Typography>
                    <Typography variant="body1">
                      {formatDateTime(selectedBooking.slot.startTime)} -{' '}
                      {formatTime(selectedBooking.slot.endTime)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Интервьюер:
                    </Typography>
                    <Typography variant="body1">
                      {selectedBooking.slot.interviewer.profile?.firstName}{' '}
                      {selectedBooking.slot.interviewer.profile?.lastName}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Кандидат:
                    </Typography>
                    <Typography variant="body1">
                      {selectedBooking.candidate.profile?.firstName}{' '}
                      {selectedBooking.candidate.profile?.lastName}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Дата бронирования:
                    </Typography>
                    <Typography variant="body1">
                      {formatDateTime(selectedBooking.createdAt)}
                    </Typography>
                  </Box>
                  {selectedBooking.pointsSpent > 0 && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Потрачено баллов:
                      </Typography>
                      <Typography variant="body1">
                        {selectedBooking.pointsSpent}
                      </Typography>
                    </Box>
                  )}
                </Stack>

                {dialogAction === 'cancel' && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Вы уверены, что хотите отменить это бронирование?
                  </Alert>
                )}

                {dialogAction === 'confirm' && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Подтвердите бронирование для проведения собеседования.
                  </Alert>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={actionInProgress}>
              {dialogAction === 'details' ? 'Закрыть' : 'Отмена'}
            </Button>
            {dialogAction === 'cancel' && (
              <Button
                onClick={handleCancelBooking}
                color="error"
                variant="contained"
                disabled={actionInProgress}
              >
                {actionInProgress ? 'Отмена...' : 'Отменить бронирование'}
              </Button>
            )}
            {dialogAction === 'confirm' && (
              <Button
                onClick={handleConfirmBooking}
                color="success"
                variant="contained"
                disabled={actionInProgress}
              >
                {actionInProgress ? 'Подтверждение...' : 'Подтвердить'}
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default MyBookingsPage;
