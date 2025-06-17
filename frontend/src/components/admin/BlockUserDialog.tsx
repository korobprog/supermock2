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
  FormControlLabel,
  Switch,
} from '@mui/material';
import { blockUser } from '../../utils/userBlockApi';

interface User {
  id: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
  };
}

interface BlockUserDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: User;
}

const BlockUserDialog = ({
  open,
  onClose,
  onSuccess,
  user,
}: BlockUserDialogProps) => {
  const [reason, setReason] = useState('');
  const [isPermanent, setIsPermanent] = useState(false);
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError('Введите причину блокировки');
      return;
    }

    if (!isPermanent && !endDate) {
      setError(
        'Выберите дату окончания блокировки или установите постоянную блокировку'
      );
      return;
    }

    if (!isPermanent && endDate && new Date(endDate) <= new Date()) {
      setError('Дата окончания блокировки должна быть в будущем');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await blockUser(
        user.id,
        reason.trim(),
        isPermanent,
        isPermanent ? undefined : new Date(endDate).toISOString()
      );

      // Сброс формы
      setReason('');
      setIsPermanent(false);
      setEndDate('');

      onSuccess();
    } catch (err) {
      console.error('Ошибка при блокировке пользователя:', err);
      setError('Не удалось заблокировать пользователя');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setReason('');
      setIsPermanent(false);
      setEndDate('');
      setError('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Заблокировать пользователя</DialogTitle>

      <DialogContent>
        <Box mb={2}>
          <Typography variant="body2" color="text.secondary">
            Пользователь: {user.profile.firstName} {user.profile.lastName}
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
          label="Причина блокировки"
          fullWidth
          variant="outlined"
          multiline
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Например: Нарушение правил сообщества, спам, неподобающее поведение..."
          disabled={loading}
          sx={{ mb: 2 }}
        />

        <FormControlLabel
          control={
            <Switch
              checked={isPermanent}
              onChange={(e) => setIsPermanent(e.target.checked)}
              disabled={loading}
            />
          }
          label="Постоянная блокировка"
          sx={{ mb: 2 }}
        />

        {!isPermanent && (
          <TextField
            margin="dense"
            label="Дата окончания блокировки"
            type="datetime-local"
            fullWidth
            variant="outlined"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={loading}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              min: new Date().toISOString().slice(0, 16),
            }}
          />
        )}

        {isPermanent && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Внимание! Постоянная блокировка может быть снята только
            администратором.
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Отмена
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="error"
          disabled={loading || !reason.trim() || (!isPermanent && !endDate)}
        >
          {loading ? <CircularProgress size={20} /> : 'Заблокировать'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BlockUserDialog;
