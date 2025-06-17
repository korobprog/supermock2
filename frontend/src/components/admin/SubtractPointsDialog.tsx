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
import { subtractUserPoints } from '../../utils/pointsApi';

interface User {
  id: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
  };
}

interface SubtractPointsDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: User;
  currentBalance: number;
}

const SubtractPointsDialog = ({
  open,
  onClose,
  onSuccess,
  user,
  currentBalance,
}: SubtractPointsDialogProps) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    const pointsAmount = parseInt(amount);

    if (!pointsAmount || pointsAmount <= 0) {
      setError('Введите корректное количество баллов');
      return;
    }

    if (pointsAmount > currentBalance) {
      setError(
        `Нельзя вычесть больше баллов, чем есть у пользователя (${currentBalance})`
      );
      return;
    }

    if (!description.trim()) {
      setError('Введите описание операции');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await subtractUserPoints(user.id, pointsAmount, description.trim());

      // Сброс формы
      setAmount('');
      setDescription('');

      onSuccess();
    } catch (err) {
      console.error('Ошибка при вычитании баллов:', err);
      setError('Не удалось вычесть баллы у пользователя');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setAmount('');
      setDescription('');
      setError('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Вычесть баллы у пользователя</DialogTitle>

      <DialogContent>
        <Box mb={2}>
          <Typography variant="body2" color="text.secondary">
            Пользователь: {user.profile.firstName} {user.profile.lastName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Email: {user.email}
          </Typography>
          <Typography variant="body2" color="primary" fontWeight="medium">
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
          label="Количество баллов для вычитания"
          type="number"
          fullWidth
          variant="outlined"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          inputProps={{ min: 1, max: currentBalance }}
          sx={{ mb: 2 }}
          disabled={loading}
          helperText={`Максимум: ${currentBalance} баллов`}
        />

        <TextField
          margin="dense"
          label="Описание операции"
          fullWidth
          variant="outlined"
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Например: Штраф за нарушение, списание за услугу..."
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
          color="warning"
          disabled={loading || !amount || !description.trim()}
        >
          {loading ? <CircularProgress size={20} /> : 'Вычесть баллы'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubtractPointsDialog;
