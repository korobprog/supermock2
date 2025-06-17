import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Avatar,
  Button,
  TextField,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListSubheader,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
} from '@mui/material';
import { PhotoCamera, CloudUpload, Delete } from '@mui/icons-material';
import api from '../utils/axios';
import { getPointsBalance, getPointsTransactions } from '../utils/pointsApi';

interface Interest {
  id: string;
  name: string;
  category: 'PROGRAMMING' | 'TESTING' | 'ANALYTICS_DATA_SCIENCE' | 'MANAGEMENT';
}

interface Profile {
  email: string;
  firstName: string;
  lastName: string;
  specialization: string;
  bio?: string;
  avatar?: string;
  role: string;
  interestId?: string;
  interest?: Interest;
}

interface PointsTransaction {
  id: string;
  amount: number;
  type: 'EARNED' | 'SPENT' | 'REFUNDED';
  description: string;
  createdAt: string;
}

interface PointsData {
  balance: number;
  transactions: PointsTransaction[];
}

const getRoleInfo = (role: string) => {
  switch (role) {
    case 'ADMIN':
      return { label: 'Администратор', color: 'error' as const };
    case 'INTERVIEWER':
      return { label: 'Интервьюер', color: 'primary' as const };
    case 'USER':
      return { label: 'Пользователь', color: 'default' as const };
    default:
      return { label: 'Пользователь', color: 'default' as const };
  }
};

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

// Функция для группировки интересов по категориям
const getGroupedInterests = (interests: Interest[]) => {
  const grouped: { [key: string]: Interest[] } = {};
  interests.forEach((interest) => {
    if (!grouped[interest.category]) {
      grouped[interest.category] = [];
    }
    grouped[interest.category].push(interest);
  });
  return grouped;
};

// Функция для получения названия типа транзакции на русском
const getTransactionTypeName = (type: string) => {
  switch (type) {
    case 'EARNED':
      return 'Начислено';
    case 'SPENT':
      return 'Потрачено';
    case 'REFUNDED':
      return 'Возвращено';
    default:
      return type;
  }
};

// Функция для получения цвета типа транзакции
const getTransactionTypeColor = (
  type: string
): 'success' | 'error' | 'warning' | 'default' => {
  switch (type) {
    case 'EARNED':
      return 'success';
    case 'SPENT':
      return 'error';
    case 'REFUNDED':
      return 'warning';
    default:
      return 'default';
  }
};

// Функция для форматирования даты
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Функция для формирования полного URL аватара
const getFullAvatarUrl = (
  avatarPath: string | null | undefined
): string | undefined => {
  if (!avatarPath) return undefined;
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  return `${apiUrl}${avatarPath}`;
};

const ProfilePage = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Profile | null>(null);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [interestsLoading, setInterestsLoading] = useState(false);
  const [pointsData, setPointsData] = useState<PointsData | null>(null);
  const [pointsLoading, setPointsLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/users/me');
        // Извлекаем данные пользователя из структуры ответа
        const userData = response.data.data.user;

        // Формируем полный URL для аватара, если он есть
        const avatarUrl = getFullAvatarUrl(userData.profile.avatar);

        const profileData = {
          email: userData.email,
          firstName: userData.profile.firstName,
          lastName: userData.profile.lastName,
          specialization: userData.profile.specialization,
          bio: userData.profile.bio,
          avatar: avatarUrl,
          role: userData.role,
          interestId: userData.profile.interestId,
          interest: userData.profile.interest,
        };
        setProfile(profileData);
        setEditedProfile(profileData);
      } catch (err) {
        console.error('Failed to load profile:', err);
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };

    const fetchInterests = async () => {
      try {
        setInterestsLoading(true);
        const response = await api.get('/users/interests');
        setInterests(response.data.data.interests);
      } catch (err) {
        console.error('Error fetching interests:', err);
      } finally {
        setInterestsLoading(false);
      }
    };

    fetchProfile();
    fetchInterests();
    fetchPointsData();
  }, []);

  const fetchPointsData = async () => {
    try {
      setPointsLoading(true);
      const [balance, transactions] = await Promise.all([
        getPointsBalance(),
        getPointsTransactions(),
      ]);
      setPointsData({ balance, transactions });
    } catch (err) {
      console.error('Error fetching points data:', err);
    } finally {
      setPointsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedProfile((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleInterestChange = (value: string) => {
    setEditedProfile((prev) => (prev ? { ...prev, interestId: value } : null));
  };

  const handleSave = async () => {
    if (!editedProfile) return;
    try {
      const response = await api.patch('/users/profile', {
        firstName: editedProfile.firstName,
        lastName: editedProfile.lastName,
        specialization: editedProfile.specialization,
        bio: editedProfile.bio,
        interestId: editedProfile.interestId || undefined,
      });

      // Обновляем профиль с данными из ответа сервера
      const updatedProfileData = response.data.data.profile;

      // Формируем полный URL для аватара, если он есть
      const avatarUrl = getFullAvatarUrl(updatedProfileData.avatar);

      const profileData = {
        email: editedProfile.email, // email не изменяется
        firstName: updatedProfileData.firstName,
        lastName: updatedProfileData.lastName,
        specialization: updatedProfileData.specialization,
        bio: updatedProfileData.bio,
        avatar: avatarUrl,
        role: editedProfile.role, // role не изменяется при обновлении профиля
        interestId: updatedProfileData.interestId,
        interest: updatedProfileData.interest,
      };

      setProfile(profileData);
      setEditedProfile(profileData);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Failed to update profile.');
    }
  };

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return 'Пожалуйста, выберите изображение';
    }
    if (file.size > 5 * 1024 * 1024) {
      return 'Размер файла не должен превышать 5MB';
    }
    return null;
  };

  const createPreview = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadAvatar = async (file: File) => {
    try {
      console.log('🔍 [FRONTEND DEBUG] Starting avatar upload');
      console.log('🔍 [FRONTEND DEBUG] File info:', {
        name: file.name,
        size: file.size,
        type: file.type,
      });

      setAvatarUploading(true);
      setError('');

      const formData = new FormData();
      formData.append('avatar', file);

      console.log(
        '🔍 [FRONTEND DEBUG] FormData created, making API request...'
      );

      const response = await api.post('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log(
        '✅ [FRONTEND DEBUG] Upload successful, response:',
        response.data
      );

      // Обновляем аватар в профиле
      const updatedProfile = response.data.data.profile;
      const newAvatarUrl = getFullAvatarUrl(updatedProfile.avatar);

      console.log('🔍 [FRONTEND DEBUG] New avatar URL:', newAvatarUrl);

      if (profile) {
        const updatedProfileData = {
          ...profile,
          avatar: newAvatarUrl,
        };
        setProfile(updatedProfileData);
        setEditedProfile(updatedProfileData);
      }
      setAvatarPreview(null);
    } catch (err: unknown) {
      console.error('❌ [FRONTEND DEBUG] Failed to upload avatar:', err);

      // Детальное логирование ошибки
      if (err && typeof err === 'object' && 'response' in err) {
        console.error('❌ [FRONTEND DEBUG] Response error:', {
          status: (err as { response?: { status?: number } })?.response?.status,
          statusText: (err as { response?: { statusText?: string } })?.response
            ?.statusText,
          data: (err as { response?: { data?: unknown } })?.response?.data,
        });
      }

      const errorMessage =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response &&
        err.response.data &&
        typeof err.response.data === 'object' &&
        'message' in err.response.data
          ? String(err.response.data.message)
          : 'Ошибка при загрузке аватарки';

      console.error('❌ [FRONTEND DEBUG] Error message:', errorMessage);
      setError(errorMessage);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    createPreview(file);
    await uploadAvatar(file);
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);

    const files = event.dataTransfer.files;
    if (files.length === 0) return;

    const file = files[0];
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    createPreview(file);
    await uploadAvatar(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleRemoveAvatar = async () => {
    try {
      setAvatarUploading(true);
      await api.delete('/users/avatar');

      if (profile) {
        const updatedProfileData = {
          ...profile,
          avatar: undefined,
        };
        setProfile(updatedProfileData);
        setEditedProfile(updatedProfileData);
      }
      setAvatarPreview(null);
    } catch (err: unknown) {
      console.error('Failed to remove avatar:', err);
      setError('Ошибка при удалении аватарки');
    } finally {
      setAvatarUploading(false);
    }
  };

  const cancelPreview = () => {
    setAvatarPreview(null);
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

  if (error) {
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

  if (!profile || !editedProfile) return null;

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 3,
        }}
      >
        {/* Профиль пользователя */}
        <Box sx={{ flex: 1 }}>
          <Paper
            elevation={3}
            className="profile-card"
            sx={{ height: 'fit-content' }}
          >
            <Box className="profile-header">
              {/* Аватарка с улучшенным UI */}
              <Box className="avatar-upload-container">
                <Box
                  className={`avatar-drag-zone ${
                    isDragOver ? 'drag-over' : ''
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <Box className="avatar-preview">
                    <Avatar
                      sx={{
                        width: 120,
                        height: 120,
                        border: '4px solid #fff',
                      }}
                      src={avatarPreview || profile.avatar}
                    />

                    {/* Индикатор загрузки */}
                    {avatarUploading && (
                      <Box className="avatar-loading-overlay">
                        <CircularProgress size={40} sx={{ color: 'white' }} />
                      </Box>
                    )}

                    {/* Overlay для hover эффекта */}
                    <Box className="avatar-upload-overlay">
                      <PhotoCamera className="upload-icon" />
                    </Box>
                  </Box>
                </Box>

                {/* Кнопки управления аватаркой */}
                <Box className="avatar-buttons">
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="avatar-upload"
                    type="file"
                    onChange={handleAvatarUpload}
                    disabled={avatarUploading}
                  />
                  <label htmlFor="avatar-upload">
                    <Button
                      variant="contained"
                      component="span"
                      size="small"
                      disabled={avatarUploading}
                      startIcon={<CloudUpload />}
                      className="avatar-button avatar-upload-button"
                    >
                      {avatarUploading ? 'Загрузка...' : 'Загрузить'}
                    </Button>
                  </label>

                  {profile.avatar && (
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={avatarUploading}
                      startIcon={<Delete />}
                      onClick={handleRemoveAvatar}
                      className="avatar-button avatar-delete-button"
                    >
                      Удалить
                    </Button>
                  )}
                </Box>

                {/* Предварительный просмотр */}
                {avatarPreview && (
                  <Alert
                    severity="info"
                    className="avatar-preview-alert"
                    action={
                      <Button
                        color="inherit"
                        size="small"
                        onClick={cancelPreview}
                        disabled={avatarUploading}
                      >
                        Отмена
                      </Button>
                    }
                  >
                    Новое изображение загружается...
                  </Alert>
                )}

                {/* Подсказка для drag & drop */}
                {isDragOver && (
                  <Box className="avatar-drop-hint">
                    <Typography variant="body2" fontWeight="bold">
                      Отпустите для загрузки
                    </Typography>
                  </Box>
                )}
              </Box>
              {isEditing ? (
                <>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={editedProfile.firstName}
                    onChange={handleChange}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={editedProfile.lastName}
                    onChange={handleChange}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Specialization"
                    name="specialization"
                    value={editedProfile.specialization}
                    onChange={handleChange}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Bio"
                    name="bio"
                    value={editedProfile.bio || ''}
                    onChange={handleChange}
                    margin="normal"
                    multiline
                    rows={4}
                  />
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="interest-select-label">
                      Интерес (необязательно)
                    </InputLabel>
                    <Select
                      labelId="interest-select-label"
                      value={editedProfile.interestId || ''}
                      label="Интерес (необязательно)"
                      onChange={(e) => handleInterestChange(e.target.value)}
                      disabled={interestsLoading}
                    >
                      <MenuItem value="">
                        <em>Не выбран</em>
                      </MenuItem>
                      {Object.entries(getGroupedInterests(interests)).flatMap(
                        ([category, categoryInterests]) => [
                          <ListSubheader key={category}>
                            {getCategoryName(category)}
                          </ListSubheader>,
                          ...categoryInterests.map((interest) => (
                            <MenuItem key={interest.id} value={interest.id}>
                              {interest.name}
                            </MenuItem>
                          )),
                        ]
                      )}
                    </Select>
                  </FormControl>
                  <Box mt={2}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSave}
                      sx={{ mr: 1 }}
                    >
                      Save
                    </Button>
                    <Button variant="outlined" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </Box>
                </>
              ) : (
                <>
                  <Typography variant="h5" className="profile-name">
                    {profile.firstName} {profile.lastName}
                  </Typography>
                  <Box mb={1}>
                    <Chip
                      label={getRoleInfo(profile.role).label}
                      color={getRoleInfo(profile.role).color}
                      size="small"
                      className="profile-role-chip"
                    />
                  </Box>
                  <Typography
                    variant="subtitle1"
                    className="profile-specialization"
                  >
                    {profile.specialization}
                  </Typography>
                  {profile.interest && (
                    <Typography variant="body2" className="profile-interest">
                      Интерес: {profile.interest.name}
                    </Typography>
                  )}
                  <Typography variant="body2" className="profile-bio">
                    {profile.bio}
                  </Typography>
                  <Typography variant="body2" className="profile-email">
                    {profile.email}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleEdit}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 3,
                      py: 1,
                      mt: 2,
                    }}
                  >
                    Редактировать профиль
                  </Button>
                </>
              )}
            </Box>
          </Paper>
        </Box>

        {/* Баланс баллов и история транзакций */}
        <Box sx={{ flex: 1 }}>
          <Card elevation={3} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Баланс баллов
              </Typography>
              {pointsLoading ? (
                <Box display="flex" justifyContent="center" p={2}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <Typography variant="h4" color="primary" sx={{ mb: 1 }}>
                  {pointsData?.balance || 0}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                Доступно для использования
              </Typography>
            </CardContent>
          </Card>

          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                История транзакций
              </Typography>
              {pointsLoading ? (
                <Box display="flex" justifyContent="center" p={2}>
                  <CircularProgress size={24} />
                </Box>
              ) : pointsData?.transactions &&
                pointsData.transactions.length > 0 ? (
                <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {pointsData.transactions.map((transaction, index) => (
                    <div key={transaction.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText
                          primary={
                            <Box
                              display="flex"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Typography variant="body1">
                                {transaction.description}
                              </Typography>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Chip
                                  label={getTransactionTypeName(
                                    transaction.type
                                  )}
                                  color={getTransactionTypeColor(
                                    transaction.type
                                  )}
                                  size="small"
                                />
                                <Typography
                                  variant="body1"
                                  color={
                                    transaction.type === 'EARNED'
                                      ? 'success.main'
                                      : 'error.main'
                                  }
                                  fontWeight="bold"
                                >
                                  {transaction.type === 'EARNED' ? '+' : '-'}
                                  {transaction.amount}
                                </Typography>
                              </Box>
                            </Box>
                          }
                          secondary={formatDate(transaction.createdAt)}
                        />
                      </ListItem>
                      {index < pointsData.transactions.length - 1 && (
                        <Divider />
                      )}
                    </div>
                  ))}
                </List>
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                  py={2}
                >
                  Нет транзакций
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default ProfilePage;
