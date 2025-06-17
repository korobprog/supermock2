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
  Block as BlockIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { getUserBlocks, type UserBlocksData } from '../../utils/userBlockApi';
import { type User } from '../../utils/usersApi';
import BlockUserDialog from './BlockUserDialog';
import UserBlocksTable from './UserBlocksTable';

interface UserBlockManagerProps {
  user: User;
  onClose: () => void;
}

const UserBlockManager = ({ user, onClose }: UserBlockManagerProps) => {
  const [userBlocksData, setUserBlocksData] = useState<UserBlocksData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [showBlocks, setShowBlocks] = useState(false);

  const fetchUserBlocks = async () => {
    try {
      setLoading(true);
      const data = await getUserBlocks(user.id);
      setUserBlocksData(data);
      setError('');
    } catch (err) {
      console.error('Ошибка при загрузке блокировок пользователя:', err);
      setError('Не удалось загрузить блокировки пользователя');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserBlocks();
  }, [user.id]);

  const handleBlockUpdate = () => {
    fetchUserBlocks();
    setBlockDialogOpen(false);
  };

  const getActiveBlocks = () => {
    if (!userBlocksData) return [];
    return userBlocksData.blocks.filter((block) => block.isActive);
  };

  const getBlockStatus = () => {
    const activeBlocks = getActiveBlocks();
    if (activeBlocks.length === 0) {
      return {
        status: 'Не заблокирован',
        color: 'success' as const,
        canBlock: true,
      };
    }

    const permanentBlock = activeBlocks.find((block) => block.isPermanent);
    if (permanentBlock) {
      return {
        status: 'Заблокирован навсегда',
        color: 'error' as const,
        canBlock: false,
      };
    }

    return {
      status: 'Временно заблокирован',
      color: 'warning' as const,
      canBlock: false,
    };
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

  if (!userBlocksData) {
    return (
      <Box p={3}>
        <Alert severity="warning">Данные о пользователе не найдены</Alert>
        <Box mt={2}>
          <Button onClick={onClose}>Закрыть</Button>
        </Box>
      </Box>
    );
  }

  const blockStatus = getBlockStatus();
  const activeBlocks = getActiveBlocks();

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h5">Управление блокировками</Typography>
          <Button onClick={onClose}>Закрыть</Button>
        </Box>

        {/* Информация о пользователе */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            {userBlocksData.user.profile.firstName}{' '}
            {userBlocksData.user.profile.lastName}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {userBlocksData.user.email}
          </Typography>
          <Box mt={1}>
            <Chip
              label={blockStatus.status}
              color={blockStatus.color}
              size="medium"
              sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}
            />
          </Box>
        </Box>

        {/* Активные блокировки */}
        {activeBlocks.length > 0 && (
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              Активные блокировки:
            </Typography>
            {activeBlocks.map((block) => (
              <Box key={block.id} mb={1}>
                <Typography variant="body2">
                  <strong>Причина:</strong> {block.reason}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Тип:</strong>{' '}
                  {block.isPermanent ? 'Постоянная' : 'Временная'}
                  {!block.isPermanent && block.endDate && (
                    <>
                      {' '}
                      (до {new Date(block.endDate).toLocaleDateString('ru-RU')})
                    </>
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Дата блокировки:</strong>{' '}
                  {new Date(block.createdAt).toLocaleDateString('ru-RU')}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {/* Действия */}
        <Box display="flex" gap={2} mb={3} flexWrap="wrap">
          <Button
            variant="contained"
            color="error"
            startIcon={<BlockIcon />}
            onClick={() => setBlockDialogOpen(true)}
            disabled={!blockStatus.canBlock}
          >
            Заблокировать пользователя
          </Button>
          <Button
            variant="outlined"
            startIcon={<HistoryIcon />}
            onClick={() => setShowBlocks(!showBlocks)}
          >
            {showBlocks ? 'Скрыть историю' : 'Показать историю блокировок'}
          </Button>
        </Box>

        {/* История блокировок */}
        {showBlocks && <UserBlocksTable userId={user.id} />}
      </Paper>

      {/* Диалог блокировки */}
      <BlockUserDialog
        open={blockDialogOpen}
        onClose={() => setBlockDialogOpen(false)}
        onSuccess={handleBlockUpdate}
        user={userBlocksData.user}
      />
    </Box>
  );
};

export default UserBlockManager;
