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
} from '@mui/material';
import api from '../utils/axios';

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

const ProfilePage = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Profile | null>(null);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [interestsLoading, setInterestsLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/users/me');
        // Извлекаем данные пользователя из структуры ответа
        const userData = response.data.data.user;
        const profileData = {
          email: userData.email,
          firstName: userData.profile.firstName,
          lastName: userData.profile.lastName,
          specialization: userData.profile.specialization,
          bio: userData.profile.bio,
          avatar: userData.profile.avatar,
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
  }, []);

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
      const profileData = {
        email: editedProfile.email, // email не изменяется
        firstName: updatedProfileData.firstName,
        lastName: updatedProfileData.lastName,
        specialization: updatedProfileData.specialization,
        bio: updatedProfileData.bio,
        avatar: updatedProfileData.avatar,
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
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="60vh"
    >
      <Paper elevation={3} sx={{ p: 4, minWidth: 320, textAlign: 'center' }}>
        <Avatar
          sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }}
          src={profile.avatar}
        />
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
            <Typography variant="h5" mb={1}>
              {profile.firstName} {profile.lastName}
            </Typography>
            <Box mb={1}>
              <Chip
                label={getRoleInfo(profile.role).label}
                color={getRoleInfo(profile.role).color}
                size="small"
              />
            </Box>
            <Typography variant="subtitle1" mb={1}>
              {profile.specialization}
            </Typography>
            {profile.interest && (
              <Typography variant="body2" mb={1} color="primary">
                Интерес: {profile.interest.name}
              </Typography>
            )}
            <Typography variant="body2" mb={2}>
              {profile.bio}
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              {profile.email}
            </Typography>
            <Button variant="contained" color="primary" onClick={handleEdit}>
              Edit Profile
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default ProfilePage;
