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
import { addUserPoints } from '../../utils/pointsApi';

interface User {
  id: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
  };
}

interface AddPointsDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: User;
}

const AddPointsDialog = ({
  open,
  onClose,
  onSuccess,
  user,
}: AddPointsDialogProps) => {
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

    if (!description.trim()) {
      setError('Введите описание операции');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await addUserPoints(user.id, pointsAmount, description.trim());

      // Сброс формы
      setAmount('');
      setDescription('');

      onSuccess();
    } catch (err) {
      console.error('Ошибка при добавлении баллов:', err);
      setError('Не удалось добавить баллы пользователю');
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
      <DialogTitle>Добавить баллы пользователю</DialogTitle>

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
          label="Количество баллов"
          type="number"
          fullWidth
          variant="outlined"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          inputProps={{ min: 1 }}
          sx={{ mb: 2 }}
          disabled={loading}
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
          placeholder="Например: Бонус за активность, награда за участие в мероприятии..."
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
          color="success"
          disabled={loading || !amount || !description.trim()}
        >
          {loading ? <CircularProgress size={20} /> : 'Добавить баллы'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPointsDialog;
