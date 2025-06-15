import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListSubheader,
} from '@mui/material';
import api from '../utils/axios';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Interest {
  id: string;
  name: string;
  category: 'PROGRAMMING' | 'TESTING' | 'ANALYTICS_DATA_SCIENCE' | 'MANAGEMENT';
}

const RegisterPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [interestId, setInterestId] = useState('');
  const [interests, setInterests] = useState<Interest[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
  const getGroupedInterests = () => {
    const grouped: { [key: string]: Interest[] } = {};
    interests.forEach((interest) => {
      if (!grouped[interest.category]) {
        grouped[interest.category] = [];
      }
      grouped[interest.category].push(interest);
    });
    return grouped;
  };

  // Загрузка интересов при монтировании компонента
  useEffect(() => {
    const fetchInterests = async () => {
      try {
        setLoading(true);
        const response = await api.get('/users/interests');
        setInterests(response.data.data.interests);
      } catch (err) {
        console.error('Error fetching interests:', err);
        setError('Ошибка загрузки интересов');
      } finally {
        setLoading(false);
      }
    };

    fetchInterests();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const response = await api.post('/users/register', {
        firstName,
        lastName,
        email,
        password,
        specialization,
        interestId: interestId || undefined,
      });
      console.log('Registration successful:', response.data);
      // Store token and redirect to dashboard
      localStorage.setItem('token', response.data.data.token);
      navigate('/dashboard');
    } catch (err: unknown) {
      console.error('Registration error:', err);

      if (axios.isAxiosError(err)) {
        if (err.response?.data?.message) {
          // Если сервер вернул конкретную ошибку
          setError(err.response.data.message);
        } else if (err.response?.status === 400) {
          // Ошибка валидации
          setError('Проверьте правильность заполнения всех полей');
        } else if (err.response?.status === 409) {
          // Конфликт (пользователь уже существует)
          setError('Пользователь с таким email уже зарегистрирован');
        } else if (err.code === 'NETWORK_ERROR' || !err.response) {
          // Проблемы с сетью
          setError(
            'Ошибка подключения к серверу. Проверьте интернет-соединение.'
          );
        } else {
          // Общая ошибка
          setError('Ошибка регистрации. Попробуйте еще раз.');
        }
      } else {
        // Неизвестная ошибка
        setError('Произошла неожиданная ошибка. Попробуйте еще раз.');
      }
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="60vh"
    >
      <Paper elevation={3} sx={{ p: 4, minWidth: 320 }}>
        <Typography variant="h5" mb={2}>
          Register
        </Typography>
        {error && (
          <Typography color="error" mb={2}>
            {error}
          </Typography>
        )}
        <Box
          component="form"
          noValidate
          autoComplete="off"
          onSubmit={handleSubmit}
        >
          <TextField
            label="First Name"
            fullWidth
            margin="normal"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <TextField
            label="Last Name"
            fullWidth
            margin="normal"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Specialization"
            fullWidth
            margin="normal"
            required
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="interest-select-label">
              Интерес (необязательно)
            </InputLabel>
            <Select
              labelId="interest-select-label"
              value={interestId}
              label="Интерес (необязательно)"
              onChange={(e) => setInterestId(e.target.value)}
              disabled={loading}
            >
              <MenuItem value="">
                <em>Не выбран</em>
              </MenuItem>
              {Object.entries(getGroupedInterests()).map(
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
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            label="Confirm Password"
            type="password"
            fullWidth
            margin="normal"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            type="submit"
          >
            Register
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default RegisterPage;
