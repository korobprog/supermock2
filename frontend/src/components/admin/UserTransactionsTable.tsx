import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  getUserPointsTransactions,
  type UserTransactionsData,
  type PointsTransaction,
} from '../../utils/pointsApi';

interface UserTransactionsTableProps {
  userId: string;
}

const UserTransactionsTable = ({ userId }: UserTransactionsTableProps) => {
  const [data, setData] = useState<UserTransactionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchTransactions = async (currentPage: number, limit: number) => {
    try {
      setLoading(true);
      const transactionsData = await getUserPointsTransactions(
        userId,
        currentPage + 1, // API использует 1-based пагинацию
        limit
      );
      setData(transactionsData);
      setError('');
    } catch (err) {
      console.error('Ошибка при загрузке транзакций:', err);
      setError('Не удалось загрузить историю транзакций');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(page, rowsPerPage);
  }, [userId, page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getTransactionTypeLabel = (type: PointsTransaction['type']) => {
    switch (type) {
      case 'EARNED':
        return 'Начислено';
      case 'SPENT':
        return 'Потрачено';
      case 'REFUNDED':
        return 'Возврат';
      default:
        return type;
    }
  };

  const getTransactionTypeColor = (
    type: PointsTransaction['type']
  ): 'success' | 'error' | 'info' => {
    switch (type) {
      case 'EARNED':
        return 'success';
      case 'SPENT':
        return 'error';
      case 'REFUNDED':
        return 'info';
      default:
        return 'info';
    }
  };

  const formatAmount = (amount: number, type: PointsTransaction['type']) => {
    const sign = type === 'EARNED' || type === 'REFUNDED' ? '+' : '-';
    return `${sign}${Math.abs(amount)}`;
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!data || data.transactions.length === 0) {
    return (
      <Paper elevation={1} sx={{ p: 3, mt: 2 }}>
        <Typography color="text.secondary" align="center">
          История транзакций пуста
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={1} sx={{ mt: 2 }}>
      <Box p={2}>
        <Typography variant="h6" gutterBottom>
          История транзакций
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Пользователь: {data.user.profile.firstName}{' '}
          {data.user.profile.lastName}
        </Typography>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Дата</TableCell>
              <TableCell>Тип</TableCell>
              <TableCell align="right">Сумма</TableCell>
              <TableCell>Описание</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  {new Date(transaction.createdAt).toLocaleString('ru-RU', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </TableCell>
                <TableCell>
                  <Chip
                    label={getTransactionTypeLabel(transaction.type)}
                    color={getTransactionTypeColor(transaction.type)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="body2"
                    color={
                      transaction.type === 'EARNED' ||
                      transaction.type === 'REFUNDED'
                        ? 'success.main'
                        : 'error.main'
                    }
                    fontWeight="medium"
                  >
                    {formatAmount(transaction.amount, transaction.type)} баллов
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {transaction.description}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={data.pagination.total}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Строк на странице:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}–${to} из ${count !== -1 ? count : `более чем ${to}`}`
        }
      />
    </Paper>
  );
};

export default UserTransactionsTable;
