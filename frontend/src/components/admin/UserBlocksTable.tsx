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
  IconButton,
} from '@mui/material';
import { CheckCircle as UnblockIcon } from '@mui/icons-material';
import {
  getUserBlocks,
  unblockUser,
  type UserBlocksData,
  type UserBlock,
} from '../../utils/userBlockApi';

interface UserBlocksTableProps {
  userId: string;
}

const UserBlocksTable = ({ userId }: UserBlocksTableProps) => {
  const [data, setData] = useState<UserBlocksData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  const fetchBlocks = async (currentPage: number, limit: number) => {
    try {
      setLoading(true);
      const blocksData = await getUserBlocks(
        userId,
        currentPage + 1, // API использует 1-based пагинацию
        limit
      );
      setData(blocksData);
      setError('');
    } catch (err) {
      console.error('Ошибка при загрузке блокировок:', err);
      setError('Не удалось загрузить историю блокировок');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlocks(page, rowsPerPage);
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

  const handleUnblock = async (blockId: string) => {
    try {
      setUnblockingId(blockId);
      await unblockUser(blockId);
      // Обновляем данные после разблокировки
      fetchBlocks(page, rowsPerPage);
    } catch (err) {
      console.error('Ошибка при разблокировке пользователя:', err);
      setError('Не удалось разблокировать пользователя');
    } finally {
      setUnblockingId(null);
    }
  };

  const getBlockStatusChip = (block: UserBlock) => {
    if (!block.isActive) {
      return <Chip label="Снята" color="success" size="small" />;
    }

    if (block.isPermanent) {
      return <Chip label="Постоянная" color="error" size="small" />;
    }

    if (block.endDate && new Date(block.endDate) <= new Date()) {
      return <Chip label="Истекла" color="warning" size="small" />;
    }

    return <Chip label="Активная" color="error" size="small" />;
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

  if (!data || data.blocks.length === 0) {
    return (
      <Paper elevation={1} sx={{ p: 3, mt: 2 }}>
        <Typography color="text.secondary" align="center">
          История блокировок пуста
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={1} sx={{ mt: 2 }}>
      <Box p={2}>
        <Typography variant="h6" gutterBottom>
          История блокировок
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
              <TableCell>Дата блокировки</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Тип</TableCell>
              <TableCell>Дата окончания</TableCell>
              <TableCell>Причина</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.blocks.map((block) => (
              <TableRow key={block.id}>
                <TableCell>
                  {new Date(block.createdAt).toLocaleString('ru-RU', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </TableCell>
                <TableCell>{getBlockStatusChip(block)}</TableCell>
                <TableCell>
                  <Chip
                    label={block.isPermanent ? 'Постоянная' : 'Временная'}
                    color={block.isPermanent ? 'error' : 'warning'}
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {block.endDate ? (
                    new Date(block.endDate).toLocaleString('ru-RU', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Не указана
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{block.reason}</Typography>
                </TableCell>
                <TableCell>
                  {block.isActive ? (
                    <IconButton
                      onClick={() => handleUnblock(block.id)}
                      color="success"
                      disabled={unblockingId === block.id}
                      size="small"
                    >
                      {unblockingId === block.id ? (
                        <CircularProgress size={20} />
                      ) : (
                        <UnblockIcon />
                      )}
                    </IconButton>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      —
                    </Typography>
                  )}
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

export default UserBlocksTable;
