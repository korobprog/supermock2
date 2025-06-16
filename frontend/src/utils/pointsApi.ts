import api from './axios';

export interface PointsTransaction {
  id: string;
  amount: number;
  type: 'EARNED' | 'SPENT' | 'REFUNDED';
  description: string;
  createdAt: string;
}

// Получение текущего баланса баллов пользователя
export const getPointsBalance = async (): Promise<number> => {
  try {
    const response = await api.get('/points/balance');
    return response.data.balance;
  } catch (error) {
    console.error('Ошибка при получении баланса баллов:', error);
    throw error;
  }
};

// Получение истории транзакций с баллами
export const getPointsTransactions = async (): Promise<PointsTransaction[]> => {
  try {
    const response = await api.get('/points/transactions');
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении истории транзакций:', error);
    throw error;
  }
};
