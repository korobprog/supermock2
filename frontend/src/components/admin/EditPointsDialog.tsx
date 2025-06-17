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
} from '@mui/material';
import { editUserPointsBalance } from '../../utils/pointsApi';

interface User {
  id: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
  };
}

interface EditPointsDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: User;
  currentBalance: number;
}

const EditPointsDialog = ({
  open,
  onClose,
  onSuccess,
  user,
  currentBalance,
}: EditPointsDialogProps) => {
  const [newBalance, setNewBalance] = useState(currentBalance.toString());
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    const balance = parseInt(newBalance);

    if (isNaN(balance) || balance < 0) {
      setError('Введите корректный баланс баллов (не менее 0)');
      return;
    }

    if (!description.trim()) {
      setError('Введите описание операции');
      return;
    }

    if (balance === currentBalance) {
      setError('Новый баланс должен отличаться от текущего');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await editUserPointsBalance(user.id, balance, description.trim());

      // Сброс формы
      setNewBalance(currentBalance.toString());
      setDescription('');

      onSuccess();
    } catch (err) {
      console.error('Ошибка при редактировании баланса:', err);
      setError('Не удалось изменить баланс пользователя');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setNewBalance(currentBalance.toString());
      setDescription('');
      setError('');
      onClose();
    }
  };

  const difference = parseInt(newBalance) - currentBalance;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Изменить баланс баллов</DialogTitle>

      <DialogContent>
        <Box mb={2}>
          <Typography variant="body2" color="text.secondary">
            Пользователь: {user.profile.firstName} {user.profile.lastName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Email: {user.email}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Текущий баланс: {currentBalance} баллов
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
          label="Новый баланс баллов"
          type="number"
          fullWidth
          variant="outlined"
          value={newBalance}
          onChange={(e) => setNewBalance(e.target.value)}
          inputProps={{ min: 0 }}
          sx={{ mb: 2 }}
          disabled={loading}
        />

        {!isNaN(parseInt(newBalance)) && difference !== 0 && (
          <Box mb={2}>
            <Typography
              variant="body2"
              color={difference > 0 ? 'success.main' : 'warning.main'}
            >
              Изменение: {difference > 0 ? '+' : ''}
              {difference} баллов
            </Typography>
          </Box>
        )}

        <TextField
          margin="dense"
          label="Описание операции"
          fullWidth
          variant="outlined"
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Например: Корректировка баланса, исправление ошибки..."
          disabled={loading}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Отмена
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="info"
          disabled={
            loading ||
            !newBalance ||
            !description.trim() ||
            parseInt(newBalance) === currentBalance
          }
        >
          {loading ? <CircularProgress size={20} /> : 'Изменить баланс'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditPointsDialog;
