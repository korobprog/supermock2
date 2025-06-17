import api from './axios';

// Типы данных для временных слотов
export interface TimeSlot {
  id: string;
  interviewerId: string;
  interviewer: {
    id: string;
    profile?: {
      firstName: string;
      lastName: string;
      specialization: string;
    };
  };
  startTime: string;
  endTime: string;
  specialization: string;
  status: 'AVAILABLE' | 'BOOKED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  booking?: {
    id: string;
    candidateId: string;
    status: 'CREATED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
    candidate: {
      id: string;
      profile?: {
        firstName: string;
        lastName: string;
      };
    };
    interview?: {
      id: string;
      status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
      title: string;
    };
  };
}

// Типы данных для бронирований
export interface Booking {
  id: string;
  slotId: string;
  slot: TimeSlot;
  candidateId: string;
  candidate: {
    id: string;
    profile?: {
      firstName: string;
      lastName: string;
    };
  };
  status: 'CREATED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  pointsSpent: number;
  interviewId?: string;
  interview?: {
    id: string;
    title: string;
    status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    scheduledAt: string;
    duration: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Типы для создания временного слота
export interface CreateTimeSlotData {
  startTime: string;
  endTime: string;
  specialization: string;
}

// Типы для обновления временного слота
export interface UpdateTimeSlotData {
  startTime?: string;
  endTime?: string;
  specialization?: string;
  status?: 'AVAILABLE' | 'BOOKED' | 'CANCELLED';
}

// Типы для создания бронирования
export interface CreateBookingData {
  slotId: string;
}

// Типы для отмены бронирования
export interface CancelBookingData {
  reason?: string;
}

// Параметры для получения временных слотов
export interface GetTimeSlotsParams {
  specialization?: string;
  status?: 'AVAILABLE' | 'BOOKED' | 'CANCELLED';
  startDate?: string;
  endDate?: string;
  interviewerId?: string;
}

// Параметры для получения бронирований
export interface GetBookingsParams {
  status?: 'CREATED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  specialization?: string;
  startDate?: string;
  endDate?: string;
}

// API функции для временных слотов

/**
 * Получить список временных слотов
 */
export const getTimeSlots = async (
  params?: GetTimeSlotsParams
): Promise<TimeSlot[]> => {
  console.log(
    '🔍 [DEBUG API] Отправляем запрос на /timeslots с параметрами:',
    params
  );
  try {
    const response = await api.get('/timeslots', { params });
    console.log('🔍 [DEBUG API] Получен ответ от /timeslots:', {
      status: response.status,
      dataLength: response.data?.length,
      data: response.data,
    });
    return response.data;
  } catch (error: any) {
    console.error('🔍 [DEBUG API] Ошибка при запросе /timeslots:', error);
    if (error?.response) {
      console.error('🔍 [DEBUG API] Ответ сервера с ошибкой:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    }
    throw error;
  }
};

/**
 * Получить список временных слотов интервьюера (включая прошлые)
 */
export const getInterviewerTimeSlots = async (
  params?: Omit<GetTimeSlotsParams, 'interviewerId'>
): Promise<TimeSlot[]> => {
  // Получаем токен и извлекаем ID пользователя
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Токен авторизации не найден');
  }

  try {
    // Декодируем токен для получения ID пользователя
    const payload = JSON.parse(atob(token.split('.')[1]));
    const interviewerId = payload.id;

    const response = await api.get('/timeslots', {
      params: {
        ...params,
        interviewerId,
        // Не фильтруем по статусу, чтобы показать все слоты
        status: undefined,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка при декодировании токена:', error);
    throw new Error('Неверный токен авторизации');
  }
};

/**
 * Получить временной слот по ID
 */
export const getTimeSlotById = async (id: string): Promise<TimeSlot> => {
  const response = await api.get(`/timeslots/${id}`);
  return response.data;
};

/**
 * Создать новый временной слот
 */
export const createTimeSlot = async (
  data: CreateTimeSlotData
): Promise<TimeSlot> => {
  const response = await api.post('/timeslots', data);
  return response.data;
};

/**
 * Обновить временной слот
 */
export const updateTimeSlot = async (
  id: string,
  data: UpdateTimeSlotData
): Promise<TimeSlot> => {
  const response = await api.patch(`/timeslots/${id}`, data);
  return response.data;
};

/**
 * Удалить временной слот
 */
export const deleteTimeSlot = async (id: string): Promise<void> => {
  await api.delete(`/timeslots/${id}`);
};

// API функции для бронирований

/**
 * Получить список бронирований пользователя
 */
export const getBookings = async (
  params?: GetBookingsParams
): Promise<Booking[]> => {
  const response = await api.get('/bookings', { params });
  return response.data;
};

/**
 * Получить список бронирований интервьюера
 */
export const getInterviewerBookings = async (
  params?: GetBookingsParams
): Promise<Booking[]> => {
  const response = await api.get('/bookings/interviewer', { params });
  return response.data;
};

/**
 * Получить бронирование по ID
 */
export const getBookingById = async (id: string): Promise<Booking> => {
  const response = await api.get(`/bookings/${id}`);
  return response.data;
};

/**
 * Создать новое бронирование
 */
export const createBooking = async (
  data: CreateBookingData
): Promise<Booking> => {
  const response = await api.post('/bookings', data);
  return response.data;
};

/**
 * Отменить бронирование
 */
export const cancelBooking = async (
  id: string,
  data?: CancelBookingData
): Promise<Booking> => {
  const response = await api.patch(`/bookings/${id}/cancel`, data || {});
  return response.data;
};

/**
 * Подтвердить бронирование (для интервьюера)
 */
export const confirmBooking = async (id: string): Promise<Booking> => {
  const response = await api.patch(`/bookings/${id}/confirm`);
  return response.data;
};

// Утилитарные функции

/**
 * Форматировать дату и время для отображения
 */
export const formatDateTime = (dateTime: string): string => {
  const date = new Date(dateTime);
  return date.toLocaleString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Moscow',
  });
};

/**
 * Форматировать дату для отображения
 */
export const formatDate = (dateTime: string): string => {
  const date = new Date(dateTime);
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Europe/Moscow',
  });
};

/**
 * Форматировать время для отображения
 */
export const formatTime = (dateTime: string): string => {
  const date = new Date(dateTime);
  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Moscow',
  });
};

/**
 * Получить статус на русском языке
 */
export const getStatusDisplayName = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    // Статусы временных слотов
    AVAILABLE: 'Доступен',
    BOOKED: 'Забронирован',
    CANCELLED: 'Отменен',
    // Статусы бронирований
    CREATED: 'Создано',
    CONFIRMED: 'Подтверждено',
    COMPLETED: 'Завершено',
  };
  return statusMap[status] || status;
};

/**
 * Получить цвет для статуса
 */
export const getStatusColor = (
  status: string
):
  | 'default'
  | 'primary'
  | 'secondary'
  | 'error'
  | 'info'
  | 'success'
  | 'warning' => {
  const colorMap: {
    [key: string]:
      | 'default'
      | 'primary'
      | 'secondary'
      | 'error'
      | 'info'
      | 'success'
      | 'warning';
  } = {
    // Статусы временных слотов
    AVAILABLE: 'success',
    BOOKED: 'primary',
    CANCELLED: 'error',
    // Статусы бронирований
    CREATED: 'info',
    CONFIRMED: 'success',
    COMPLETED: 'default',
  };
  return colorMap[status] || 'default';
};
