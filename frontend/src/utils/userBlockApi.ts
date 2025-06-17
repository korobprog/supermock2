import api from './axios';

export interface UserBlock {
  id: string;
  userId: string;
  reason: string;
  isPermanent: boolean;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface UserBlocksData {
  user: {
    id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  blocks: UserBlock[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ActiveBlocksData {
  blocks: UserBlock[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Блокировка пользователя
export const blockUser = async (
  userId: string,
  reason: string,
  isPermanent: boolean = false,
  endDate?: string
): Promise<UserBlock> => {
  try {
    const response = await api.post('/user-blocks', {
      userId,
      reason,
      isPermanent,
      endDate,
    });
    return response.data.data.block;
  } catch (error) {
    console.error('Ошибка при блокировке пользователя:', error);
    throw error;
  }
};

// Разблокировка пользователя
export const unblockUser = async (blockId: string): Promise<UserBlock> => {
  try {
    const response = await api.delete(`/user-blocks/${blockId}`);
    return response.data.data.block;
  } catch (error) {
    console.error('Ошибка при разблокировке пользователя:', error);
    throw error;
  }
};

// Получение истории блокировок пользователя
export const getUserBlocks = async (
  userId: string,
  page: number = 1,
  limit: number = 20
): Promise<UserBlocksData> => {
  try {
    const response = await api.get(`/user-blocks/user/${userId}`, {
      params: { page, limit },
    });
    return response.data.data;
  } catch (error) {
    console.error(
      'Ошибка при получении истории блокировок пользователя:',
      error
    );
    throw error;
  }
};

// Получение всех активных блокировок
export const getActiveBlocks = async (
  page: number = 1,
  limit: number = 20
): Promise<ActiveBlocksData> => {
  try {
    const response = await api.get('/user-blocks/active', {
      params: { page, limit },
    });
    return response.data.data;
  } catch (error) {
    console.error('Ошибка при получении активных блокировок:', error);
    throw error;
  }
};
