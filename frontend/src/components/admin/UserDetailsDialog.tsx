import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  AccountBalance as PointsIcon,
  Block as BlockIcon,
} from '@mui/icons-material';
import { type User } from '../../utils/usersApi';

interface UserDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

const UserDetailsDialog = ({ open, onClose, user }: UserDetailsDialogProps) => {
  if (!user) return null;

  const getInterestName = (interest: string) => {
    switch (interest) {
      case 'PROGRAMMING':
        return 'Программирование';
      case 'TESTING':
        return 'Тестирование';
      case 'ANALYTICS_DATA_SCIENCE':
        return 'Аналитика и Data Science';
      case 'MANAGEMENT':
        return 'Менеджмент';
      default:
        return interest;
    }
  };

  const getInterestColor = (
    interest: string
  ): 'primary' | 'secondary' | 'success' | 'warning' | 'default' => {
    switch (interest) {
      case 'PROGRAMMING':
        return 'primary';
      case 'TESTING':
        return 'secondary';
      case 'ANALYTICS_DATA_SCIENCE':
        return 'success';
      case 'MANAGEMENT':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar src={user.profile.avatarUrl} sx={{ width: 56, height: 56 }}>
            <PersonIcon />
          </Avatar>
          <Box>
            <Typography variant="h6">
              {user.profile.firstName} {user.profile.lastName}
            </Typography>
            <Box display="flex" gap={1} mt={1}>
              <Chip
                label={user.role === 'ADMIN' ? 'Администратор' : 'Пользователь'}
                color={user.role === 'ADMIN' ? 'secondary' : 'default'}
                size="small"
              />
              <Chip
                label={user.isBlocked ? 'Заблокирован' : 'Активен'}
                color={user.isBlocked ? 'error' : 'success'}
                size="small"
              />
            </Box>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
          {/* Основная информация */}
          <Box flex={1}>
            <Typography variant="h6" gutterBottom>
              Основная информация
            </Typography>

            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <EmailIcon color="action" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">{user.email}</Typography>
              </Box>
            </Box>

            {user.profile.phone && (
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <PhoneIcon color="action" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Телефон
                  </Typography>
                  <Typography variant="body1">{user.profile.phone}</Typography>
                </Box>
              </Box>
            )}

            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <CalendarIcon color="action" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Дата регистрации
                </Typography>
                <Typography variant="body1">
                  {new Date(user.createdAt).toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Статистика */}
          <Box flex={1}>
            <Typography variant="h6" gutterBottom>
              Статистика
            </Typography>

            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <PointsIcon color="action" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Баланс баллов
                </Typography>
                <Typography variant="h6" color="primary">
                  {user.pointsBalance || 0}
                </Typography>
              </Box>
            </Box>

            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <BlockIcon color="action" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Активные блокировки
                </Typography>
                <Typography
                  variant="body1"
                  color={user.activeBlocks ? 'error' : 'success'}
                >
                  {user.activeBlocks || 0}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Интересы */}
        {user.profile.interests && user.profile.interests.length > 0 && (
          <Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Интересы
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {user.profile.interests.map((interest, index) => (
                <Chip
                  key={index}
                  label={getInterestName(interest)}
                  color={getInterestColor(interest)}
                  size="small"
                />
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserDetailsDialog;
