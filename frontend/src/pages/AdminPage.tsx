import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import api from '../utils/axios';

interface Interest {
  id: string;
  name: string;
  category: 'PROGRAMMING' | 'TESTING' | 'ANALYTICS_DATA_SCIENCE' | 'MANAGEMENT';
  createdAt: string;
  updatedAt: string;
}

interface User {
  role: string;
}

// Функция для получения названия категории на русском
const getCategoryName = (category: string) => {
  switch (category) {
    case 'PROGRAMMING':
      return 'Программирование';
    case 'TESTING':
      return 'Тестирование';
    case 'ANALYTICS_DATA_SCIENCE':
      return 'Аналитика и Data Science';
    case 'MANAGEMENT':
      return 'Менеджмент';
    default:
      return category;
  }
};

// Функция для получения цвета категории
const getCategoryColor = (
  category: string
): 'primary' | 'secondary' | 'success' | 'warning' | 'default' => {
  switch (category) {
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

const AdminPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingInterest, setEditingInterest] = useState<Interest | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'PROGRAMMING' as Interest['category'],
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [interestToDelete, setInterestToDelete] = useState<Interest | null>(
    null
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Проверяем роль пользователя
        const userResponse = await api.get('/users/me');
        const userData = userResponse.data.data.user;
        setUser(userData);

        if (userData.role !== 'ADMIN') {
          setError('У вас нет прав доступа к этой странице');
          setLoading(false);
          return;
        }

        // Загружаем интересы
        const interestsResponse = await api.get('/users/interests');
        setInterests(interestsResponse.data.data.interests);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Не удалось загрузить данные');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleOpenDialog = (interest?: Interest) => {
    if (interest) {
      setEditingInterest(interest);
      setFormData({
        name: interest.name,
        category: interest.category,
      });
    } else {
      setEditingInterest(null);
      setFormData({
        name: '',
        category: 'PROGRAMMING',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingInterest(null);
    setFormData({
      name: '',
      category: 'PROGRAMMING',
    });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError('Название интереса не может быть пустым');
      return;
    }

    setSubmitting(true);
    try {
      if (editingInterest) {
        // Обновляем существующий интерес
        await api.put(`/users/interests/${editingInterest.id}`, formData);
        setInterests(
          interests.map((interest) =>
            interest.id === editingInterest.id
              ? {
                  ...interest,
                  ...formData,
                  updatedAt: new Date().toISOString(),
                }
              : interest
          )
        );
      } else {
        // Создаем новый интерес
        const response = await api.post('/users/interests', formData);
        setInterests([...interests, response.data.data.interest]);
      }
      handleCloseDialog();
      setError('');
    } catch (err: unknown) {
      console.error('Failed to save interest:', err);
      const errorMessage =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message || 'Не удалось сохранить интерес'
          : 'Не удалось сохранить интерес';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (interest: Interest) => {
    setInterestToDelete(interest);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!interestToDelete) return;

    setSubmitting(true);
    try {
      await api.delete(`/users/interests/${interestToDelete.id}`);
      setInterests(
        interests.filter((interest) => interest.id !== interestToDelete.id)
      );
      setDeleteConfirmOpen(false);
      setInterestToDelete(null);
      setError('');
    } catch (err: unknown) {
      console.error('Failed to delete interest:', err);
      const errorMessage =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message || 'Не удалось удалить интерес'
          : 'Не удалось удалить интерес';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
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

  if (error && !user) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Панель администратора
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 3 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h5">Управление интересами</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Добавить интерес
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Название</TableCell>
                <TableCell>Категория</TableCell>
                <TableCell>Дата создания</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {interests.map((interest) => (
                <TableRow key={interest.id}>
                  <TableCell>{interest.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={getCategoryName(interest.category)}
                      color={getCategoryColor(interest.category)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(interest.createdAt).toLocaleDateString('ru-RU')}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleOpenDialog(interest)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteClick(interest)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {interests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography color="text.secondary">
                      Интересы не найдены
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Диалог создания/редактирования интереса */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingInterest ? 'Редактировать интерес' : 'Добавить новый интерес'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название интереса"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth variant="outlined">
            <InputLabel>Категория</InputLabel>
            <Select
              value={formData.category}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category: e.target.value as Interest['category'],
                })
              }
              label="Категория"
            >
              <MenuItem value="PROGRAMMING">Программирование</MenuItem>
              <MenuItem value="TESTING">Тестирование</MenuItem>
              <MenuItem value="ANALYTICS_DATA_SCIENCE">
                Аналитика и Data Science
              </MenuItem>
              <MenuItem value="MANAGEMENT">Менеджмент</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting}
          >
            {submitting ? (
              <CircularProgress size={20} />
            ) : editingInterest ? (
              'Сохранить'
            ) : (
              'Создать'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Подтвердите удаление</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить интерес "{interestToDelete?.name}"?
            Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Отмена</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={20} /> : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPage;
