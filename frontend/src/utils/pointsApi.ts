import api from './axios';

export interface PointsTransaction {
  id: string;
  amount: number;
  type: 'EARNED' | 'SPENT' | 'REFUNDED';
  description: string;
  createdAt: string;
}

export interface UserPointsData {
  user: {
    id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  balance: number;
}

export interface UserTransactionsData {
  user: {
    id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  transactions: PointsTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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

// === АДМИНИСТРАТИВНЫЕ ФУНКЦИИ ===

// Получение баланса баллов пользователя (для администратора)
export const getUserPointsBalance = async (
  userId: string
): Promise<UserPointsData> => {
  try {
    const response = await api.get(`/points/admin/${userId}/balance`);
    return response.data.data;
  } catch (error) {
    console.error('Ошибка при получении баланса баллов пользователя:', error);
    throw error;
  }
};

// Получение истории транзакций пользователя (для администратора)
export const getUserPointsTransactions = async (
  userId: string,
  page: number = 1,
  limit: number = 20
): Promise<UserTransactionsData> => {
  try {
    const response = await api.get(`/points/admin/${userId}/transactions`, {
      params: { page, limit },
    });
    return response.data.data;
  } catch (error) {
    console.error(
      'Ошибка при получении истории транзакций пользователя:',
      error
    );
    throw error;
  }
};

// Добавление баллов пользователю
export const addUserPoints = async (
  userId: string,
  amount: number,
  description: string
): Promise<PointsTransaction> => {
  try {
    const response = await api.post(`/points/admin/${userId}/add`, {
      amount,
      description,
    });
    return response.data.data.transaction;
  } catch (error) {
    console.error('Ошибка при добавлении баллов пользователю:', error);
    throw error;
  }
};

// Вычитание баллов у пользователя
export const subtractUserPoints = async (
  userId: string,
  amount: number,
  description: string
): Promise<PointsTransaction> => {
  try {
    const response = await api.post(`/points/admin/${userId}/subtract`, {
      amount,
      description,
    });
    return response.data.data.transaction;
  } catch (error) {
    console.error('Ошибка при вычитании баллов у пользователя:', error);
    throw error;
  }
};

// Редактирование баланса баллов пользователя
export const editUserPointsBalance = async (
  userId: string,
  newBalance: number,
  description: string
): Promise<{
  transaction: PointsTransaction;
  previousBalance: number;
  newBalance: number;
  difference: number;
}> => {
  try {
    const response = await api.put(`/points/admin/${userId}/edit`, {
      newBalance,
      description,
    });
    return response.data.data;
  } catch (error) {
    console.error(
      'Ошибка при редактировании баланса баллов пользователя:',
      error
    );
    throw error;
  }
};
