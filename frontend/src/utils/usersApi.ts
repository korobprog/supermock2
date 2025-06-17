import api from './axios';

export interface User {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
    avatarUrl?: string;
    interests?: string[];
  };
  pointsBalance?: number;
  activeBlocks?: number;
}

export interface UsersData {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Получение списка всех пользователей (для администратора)
// Поскольку этого API пока нет в бэкенде, создадим заглушку
export const getAllUsers = async (
  page: number = 1,
  limit: number = 20,
  search?: string
): Promise<UsersData> => {
  try {
    // Временная заглушка - будем использовать существующий API для получения текущего пользователя
    // и создадим mock данные для демонстрации
    const response = await api.get('/users/me');
    const currentUser = response.data.data.user;

    // Создаем mock данные для демонстрации
    const mockUsers: User[] = [
      {
        ...currentUser,
        pointsBalance: 150,
        activeBlocks: 0,
      },
      {
        id: 'mock-user-1',
        email: 'user1@example.com',
        role: 'USER',
        isBlocked: false,
        createdAt: '2024-01-15T10:00:00.000Z',
        updatedAt: '2024-01-15T10:00:00.000Z',
        profile: {
          firstName: 'Иван',
          lastName: 'Петров',
          phone: '+7 (999) 123-45-67',
          interests: ['PROGRAMMING', 'TESTING'],
        },
        pointsBalance: 250,
        activeBlocks: 0,
      },
      {
        id: 'mock-user-2',
        email: 'user2@example.com',
        role: 'USER',
        isBlocked: true,
        createdAt: '2024-02-10T14:30:00.000Z',
        updatedAt: '2024-02-10T14:30:00.000Z',
        profile: {
          firstName: 'Мария',
          lastName: 'Сидорова',
          phone: '+7 (999) 987-65-43',
          interests: ['ANALYTICS_DATA_SCIENCE'],
        },
        pointsBalance: 75,
        activeBlocks: 1,
      },
      {
        id: 'mock-user-3',
        email: 'user3@example.com',
        role: 'USER',
        isBlocked: false,
        createdAt: '2024-03-05T09:15:00.000Z',
        updatedAt: '2024-03-05T09:15:00.000Z',
        profile: {
          firstName: 'Алексей',
          lastName: 'Козлов',
          phone: '+7 (999) 555-12-34',
          interests: ['MANAGEMENT', 'PROGRAMMING'],
        },
        pointsBalance: 320,
        activeBlocks: 0,
      },
    ];

    // Фильтрация по поиску если указан
    let filteredUsers = mockUsers;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = mockUsers.filter(
        (user) =>
          user.email.toLowerCase().includes(searchLower) ||
          user.profile.firstName.toLowerCase().includes(searchLower) ||
          user.profile.lastName.toLowerCase().includes(searchLower)
      );
    }

    // Пагинация
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    return {
      users: paginatedUsers,
      pagination: {
        page,
        limit,
        total: filteredUsers.length,
        totalPages: Math.ceil(filteredUsers.length / limit),
      },
    };
  } catch (error) {
    console.error('Ошибка при получении списка пользователей:', error);
    throw error;
  }
};

// Получение информации о пользователе по ID
export const getUserById = async (userId: string): Promise<User> => {
  try {
    // Временная заглушка - используем mock данные
    const mockUser: User = {
      id: userId,
      email: 'user@example.com',
      role: 'USER',
      isBlocked: false,
      createdAt: '2024-01-15T10:00:00.000Z',
      updatedAt: '2024-01-15T10:00:00.000Z',
      profile: {
        firstName: 'Тестовый',
        lastName: 'Пользователь',
        phone: '+7 (999) 123-45-67',
        interests: ['PROGRAMMING'],
      },
      pointsBalance: 150,
      activeBlocks: 0,
    };

    return mockUser;
  } catch (error) {
    console.error('Ошибка при получении информации о пользователе:', error);
    throw error;
  }
};
