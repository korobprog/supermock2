import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { sendAdminNotification } from '../../utils/adminNotificationApi';

interface User {
  id: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
  };
}

interface SendFeedbackDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: User;
}

const SendFeedbackDialog = ({
  open,
  onClose,
  onSuccess,
  user,
}: SendFeedbackDialogProps) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR'>(
    'INFO'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Введите заголовок уведомления');
      return;
    }

    if (!message.trim()) {
      setError('Введите текст уведомления');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await sendAdminNotification(user.id, title.trim(), message.trim(), type);

      // Сброс формы
      setTitle('');
      setMessage('');
      setType('INFO');

      onSuccess();
    } catch (err) {
      console.error('Ошибка при отправке уведомления:', err);
      setError('Не удалось отправить уведомление пользователю');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setTitle('');
      setMessage('');
      setType('INFO');
      setError('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Отправить уведомление пользователю</DialogTitle>

      <DialogContent>
        <Box mb={2}>
          <Typography variant="body2" color="text.secondary">
            Получатель: {user.profile.firstName} {user.profile.lastName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Email: {user.email}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          autoFocus
          margin="dense"
          label="Заголовок уведомления"
          fullWidth
          variant="outlined"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Например: Поздравляем с успешным прохождением интервью!"
          disabled={loading}
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
          <InputLabel>Тип уведомления</InputLabel>
          <Select
            value={type}
            onChange={(e) => setType(e.target.value as typeof type)}
            label="Тип уведомления"
            disabled={loading}
          >
            <MenuItem value="INFO">Информация</MenuItem>
            <MenuItem value="SUCCESS">Успех</MenuItem>
            <MenuItem value="WARNING">Предупреждение</MenuItem>
            <MenuItem value="ERROR">Ошибка</MenuItem>
          </Select>
        </FormControl>

        <TextField
          margin="dense"
          label="Текст уведомления"
          fullWidth
          variant="outlined"
          multiline
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Введите подробный текст уведомления для пользователя..."
          disabled={loading}
        />

        <Box mt={2}>
          <Typography variant="body2" color="text.secondary">
            <strong>Примеры уведомлений:</strong>
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            component="ul"
            sx={{ mt: 1 }}
          >
            <li>
              <strong>Успех:</strong> "Поздравляем! Вы успешно прошли интервью и
              приглашены на следующий этап."
            </li>
            <li>
              <strong>Информация:</strong> "Напоминаем о предстоящем интервью
              завтра в 14:00."
            </li>
            <li>
              <strong>Предупреждение:</strong> "Обратите внимание на изменения в
              расписании интервью."
            </li>
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Отмена
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading || !title.trim() || !message.trim()}
        >
          {loading ? <CircularProgress size={20} /> : 'Отправить уведомление'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SendFeedbackDialog;
