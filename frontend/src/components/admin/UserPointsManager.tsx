import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Edit as EditIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import {
  getUserPointsBalance,
  type UserPointsData,
} from '../../utils/pointsApi';
import { type User } from '../../utils/usersApi';
import AddPointsDialog from './AddPointsDialog';
import SubtractPointsDialog from './SubtractPointsDialog';
import EditPointsDialog from './EditPointsDialog';
import UserTransactionsTable from './UserTransactionsTable';

interface UserPointsManagerProps {
  user: User;
  onClose: () => void;
}

const UserPointsManager = ({ user, onClose }: UserPointsManagerProps) => {
  const [userPointsData, setUserPointsData] = useState<UserPointsData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [subtractDialogOpen, setSubtractDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);

  const fetchUserPoints = async () => {
    try {
      setLoading(true);
      const data = await getUserPointsBalance(user.id);
      setUserPointsData(data);
      setError('');
    } catch (err) {
      console.error('Ошибка при загрузке баланса пользователя:', err);
      setError('Не удалось загрузить баланс пользователя');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPoints();
  }, [user.id]);

  const handlePointsUpdate = () => {
    fetchUserPoints();
    setAddDialogOpen(false);
    setSubtractDialogOpen(false);
    setEditDialogOpen(false);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="300px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
        <Box mt={2}>
          <Button onClick={onClose}>Закрыть</Button>
        </Box>
      </Box>
    );
  }

  if (!userPointsData) {
    return (
      <Box p={3}>
        <Alert severity="warning">Данные о пользователе не найдены</Alert>
        <Box mt={2}>
          <Button onClick={onClose}>Закрыть</Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h5">Управление баллами пользователя</Typography>
          <Button onClick={onClose}>Закрыть</Button>
        </Box>

        {/* Информация о пользователе */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            {userPointsData.user.profile.firstName}{' '}
            {userPointsData.user.profile.lastName}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {userPointsData.user.email}
          </Typography>
          <Box mt={1}>
            <Chip
              label={`Текущий баланс: ${userPointsData.balance} баллов`}
              color="primary"
              size="medium"
              sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}
            />
          </Box>
        </Box>

        {/* Действия */}
        <Box display="flex" gap={2} mb={3} flexWrap="wrap">
          <Button
            variant="contained"
            color="success"
            startIcon={<AddIcon />}
            onClick={() => setAddDialogOpen(true)}
          >
            Добавить баллы
          </Button>
          <Button
            variant="contained"
            color="warning"
            startIcon={<RemoveIcon />}
            onClick={() => setSubtractDialogOpen(true)}
          >
            Вычесть баллы
          </Button>
          <Button
            variant="contained"
            color="info"
            startIcon={<EditIcon />}
            onClick={() => setEditDialogOpen(true)}
          >
            Изменить баланс
          </Button>
          <Button
            variant="outlined"
            startIcon={<HistoryIcon />}
            onClick={() => setShowTransactions(!showTransactions)}
          >
            {showTransactions ? 'Скрыть историю' : 'Показать историю'}
          </Button>
        </Box>

        {/* История транзакций */}
        {showTransactions && <UserTransactionsTable userId={user.id} />}
      </Paper>

      {/* Диалоги */}
      <AddPointsDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSuccess={handlePointsUpdate}
        user={userPointsData.user}
      />

      <SubtractPointsDialog
        open={subtractDialogOpen}
        onClose={() => setSubtractDialogOpen(false)}
        onSuccess={handlePointsUpdate}
        user={userPointsData.user}
        currentBalance={userPointsData.balance}
      />

      <EditPointsDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSuccess={handlePointsUpdate}
        user={userPointsData.user}
        currentBalance={userPointsData.balance}
      />
    </Box>
  );
};

export default UserPointsManager;
