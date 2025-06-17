import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Block as BlockIcon,
  AccountBalance as PointsIcon,
  Feedback as FeedbackIcon,
} from '@mui/icons-material';
import { getAllUsers, type User } from '../../utils/usersApi';

interface UsersTableProps {
  onUserSelect: (user: User) => void;
  onUserBlock: (user: User) => void;
  onUserPoints: (user: User) => void;
  onUserFeedback: (user: User) => void;
}

const UsersTable = ({
  onUserSelect,
  onUserBlock,
  onUserPoints,
  onUserFeedback,
}: UsersTableProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const fetchUsers = async (currentPage: number = 0, search: string = '') => {
    try {
      setLoading(true);
      const response = await getAllUsers(currentPage + 1, rowsPerPage, search);
      setUsers(response.users);
      setTotalUsers(response.pagination.total);
      setError('');
    } catch (err) {
      console.error('Ошибка при загрузке пользователей:', err);
      setError('Не удалось загрузить список пользователей');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page, searchQuery);
  }, [page, rowsPerPage]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchQuery(value);

    // Очищаем предыдущий таймаут
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Устанавливаем новый таймаут для поиска
    const timeout = setTimeout(() => {
      setPage(0);
      fetchUsers(0, value);
    }, 500);

    setSearchTimeout(timeout);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getRoleChip = (role: string) => {
    return (
      <Chip
        label={role === 'ADMIN' ? 'Администратор' : 'Пользователь'}
        color={role === 'ADMIN' ? 'secondary' : 'default'}
        size="small"
      />
    );
  };

  const getStatusChip = (isBlocked: boolean) => {
    return (
      <Chip
        label={isBlocked ? 'Заблокирован' : 'Активен'}
        color={isBlocked ? 'error' : 'success'}
        size="small"
      />
    );
  };

  if (loading && users.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3}>
      <Box p={3}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h6">Управление пользователями</Typography>
          <TextField
            placeholder="Поиск пользователей..."
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Пользователь</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Роль</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Баллы</TableCell>
                <TableCell>Дата регистрации</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {user.profile.firstName} {user.profile.lastName}
                      </Typography>
                      {user.profile.phone && (
                        <Typography variant="caption" color="text.secondary">
                          {user.profile.phone}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleChip(user.role)}</TableCell>
                  <TableCell>{getStatusChip(user.isBlocked)}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {user.pointsBalance || 0}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <IconButton
                        size="small"
                        onClick={() => onUserSelect(user)}
                        title="Просмотр профиля"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => onUserPoints(user)}
                        title="Управление баллами"
                      >
                        <PointsIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => onUserBlock(user)}
                        title="Управление блокировками"
                        color={user.isBlocked ? 'error' : 'default'}
                      >
                        <BlockIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => onUserFeedback(user)}
                        title="Отправить уведомление"
                      >
                        <FeedbackIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="text.secondary">
                      {searchQuery
                        ? 'Пользователи не найдены'
                        : 'Нет пользователей'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalUsers}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Строк на странице:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} из ${count !== -1 ? count : `более чем ${to}`}`
          }
        />
      </Box>
    </Paper>
  );
};

export default UsersTable;
