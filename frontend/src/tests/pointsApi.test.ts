import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPointsBalance, getPointsTransactions } from '../utils/pointsApi';

// Мокаем axios через utils/axios
vi.mock('../utils/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from '../utils/axios';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedApi = api as any;

describe('Points API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPointsBalance', () => {
    it('должен вызывать правильный URL и возвращать баланс', async () => {
      const mockBalance = 150;
      mockedApi.get.mockResolvedValueOnce({
        data: { balance: mockBalance },
      });

      const result = await getPointsBalance();

      expect(mockedApi.get).toHaveBeenCalledWith('/api/v1/points/balance');
      expect(result).toBe(mockBalance);
    });

    it('должен обрабатывать ошибки', async () => {
      const mockError = new Error('Network error');
      mockedApi.get.mockRejectedValueOnce(mockError);

      await expect(getPointsBalance()).rejects.toThrow('Network error');
      expect(mockedApi.get).toHaveBeenCalledWith('/api/v1/points/balance');
    });
  });

  describe('getPointsTransactions', () => {
    it('должен вызывать правильный URL и возвращать транзакции', async () => {
      const mockTransactions = [
        {
          id: '1',
          amount: 50,
          type: 'EARNED' as const,
          description: 'Завершение интервью',
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          amount: 25,
          type: 'SPENT' as const,
          description: 'Покупка услуги',
          createdAt: '2024-01-02T00:00:00Z',
        },
      ];

      mockedApi.get.mockResolvedValueOnce({
        data: mockTransactions,
      });

      const result = await getPointsTransactions();

      expect(mockedApi.get).toHaveBeenCalledWith('/api/v1/points/transactions');
      expect(result).toEqual(mockTransactions);
    });

    it('должен обрабатывать ошибки', async () => {
      const mockError = new Error('Server error');
      mockedApi.get.mockRejectedValueOnce(mockError);

      await expect(getPointsTransactions()).rejects.toThrow('Server error');
      expect(mockedApi.get).toHaveBeenCalledWith('/api/v1/points/transactions');
    });
  });

  describe('URL проверки', () => {
    it('должен использовать правильные URL эндпоинты', async () => {
      // Тест для баланса
      mockedApi.get.mockResolvedValueOnce({ data: { balance: 0 } });
      await getPointsBalance();
      expect(mockedApi.get).toHaveBeenCalledWith('/api/v1/points/balance');

      // Тест для транзакций
      mockedApi.get.mockResolvedValueOnce({ data: [] });
      await getPointsTransactions();
      expect(mockedApi.get).toHaveBeenCalledWith('/api/v1/points/transactions');
    });
  });
});
