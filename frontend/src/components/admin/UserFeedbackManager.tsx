import { useState } from 'react';
import { Box, Paper, Typography, Button, Alert } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { type User } from '../../utils/usersApi';
import SendFeedbackDialog from './SendFeedbackDialog';

interface UserFeedbackManagerProps {
  user: User;
  onClose: () => void;
}

const UserFeedbackManager = ({ user, onClose }: UserFeedbackManagerProps) => {
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleFeedbackSent = () => {
    setSendDialogOpen(false);
    setSuccessMessage('Уведомление успешно отправлено пользователю');
    // Скрываем сообщение через 3 секунды
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h5">Отправка уведомлений</Typography>
          <Button onClick={onClose}>Закрыть</Button>
        </Box>

        {/* Информация о пользователе */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            {user.profile.firstName} {user.profile.lastName}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {user.email}
          </Typography>
        </Box>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}

        {/* Описание функционала */}
        <Box mb={3}>
          <Typography variant="body1" gutterBottom>
            Здесь вы можете отправить персональное уведомление пользователю.
            Уведомление будет доставлено в его личный кабинет.
          </Typography>
        </Box>

        {/* Действия */}
        <Box display="flex" gap={2} mb={3} flexWrap="wrap">
          <Button
            variant="contained"
            color="primary"
            startIcon={<SendIcon />}
            onClick={() => setSendDialogOpen(true)}
          >
            Отправить уведомление
          </Button>
        </Box>

        {/* Примеры использования */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Примеры использования:
          </Typography>
          <Typography variant="body2" color="text.secondary" component="ul">
            <li>Персональные поздравления с достижениями</li>
            <li>Уведомления о специальных предложениях</li>
            <li>Информация о важных изменениях в системе</li>
            <li>Напоминания о незавершенных действиях</li>
            <li>Обратная связь по результатам интервью</li>
          </Typography>
        </Box>
      </Paper>

      {/* Диалог отправки уведомления */}
      <SendFeedbackDialog
        open={sendDialogOpen}
        onClose={() => setSendDialogOpen(false)}
        onSuccess={handleFeedbackSent}
        user={user}
      />
    </Box>
  );
};

export default UserFeedbackManager;
