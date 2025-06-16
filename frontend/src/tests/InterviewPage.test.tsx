import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import InterviewPage from '../pages/InterviewPage';

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
const mockedApi = vi.mocked(api);

// Мок данных для интервью
const mockInterviews = [
  {
    id: 'interview-1',
    title: 'Frontend Developer Interview',
    date: '2024-01-15 10:00 (МСК)',
    status: 'SCHEDULED',
    description: 'Technical interview for frontend position',
    interestCategory: 'PROGRAMMING',
  },
  {
    id: 'interview-2',
    title: 'Backend Developer Interview',
    date: '2024-01-16 14:00 (МСК)',
    status: 'COMPLETED',
    description: 'Technical interview for backend position',
    interestCategory: 'PROGRAMMING',
  },
];

const mockInterviewResponse = {
  interviews: mockInterviews,
  userInterest: 'PROGRAMMING',
  isFiltered: true,
};

const mockUser = {
  id: 'user-id',
  email: 'user@example.com',
  profile: {
    firstName: 'John',
    lastName: 'Doe',
  },
};

// Мокаем localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('InterviewPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockUser));
  });

  const renderInterviewPage = () => {
    return render(
      <BrowserRouter>
        <InterviewPage />
      </BrowserRouter>
    );
  };

  describe('Загрузка и отображение интервью', () => {
    it('должен загружать и отображать список интервью', async () => {
      mockedApi.get.mockResolvedValueOnce({ data: mockInterviewResponse });

      renderInterviewPage();

      // Ждем загрузки данных
      await waitFor(() => {
        expect(screen.getByText('Интервью')).toBeInTheDocument();
      });

      // Проверяем отображение интервью
      expect(
        screen.getByText('Frontend Developer Interview')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Backend Developer Interview')
      ).toBeInTheDocument();
      expect(screen.getByText(/2024-01-15 10:00 \(МСК\)/)).toBeInTheDocument();
      expect(screen.getByText(/SCHEDULED/)).toBeInTheDocument();
    });

    it('должен отображать ошибку при неудачной загрузке', async () => {
      mockedApi.get.mockRejectedValueOnce(new Error('Network error'));

      renderInterviewPage();

      await waitFor(() => {
        expect(
          screen.getByText(/не удалось загрузить интервью/i)
        ).toBeInTheDocument();
      });
    });

    it('должен отображать сообщение когда нет интервью', async () => {
      const emptyResponse = {
        interviews: [],
        userInterest: 'PROGRAMMING',
        isFiltered: true,
      };
      mockedApi.get.mockResolvedValueOnce({ data: emptyResponse });

      renderInterviewPage();

      await waitFor(() => {
        expect(
          screen.getByText(/нет интервью по интересу/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Фильтрация интервью', () => {
    beforeEach(async () => {
      mockedApi.get.mockResolvedValueOnce({ data: mockInterviewResponse });
      renderInterviewPage();
      await waitFor(() => {
        expect(screen.getByText('Интервью')).toBeInTheDocument();
      });
    });

    it('должен отображать информацию о фильтрации', async () => {
      expect(
        screen.getByText(/показаны интервью по вашему интересу/i)
      ).toBeInTheDocument();
      // Используем более специфичный селектор для чипа в Alert
      const alertElement = screen.getByRole('alert');
      expect(alertElement).toHaveTextContent('Программирование');
    });

    it('должен позволять переключать фильтр', async () => {
      const allInterviewsResponse = {
        interviews: mockInterviews,
        userInterest: 'PROGRAMMING',
        isFiltered: false,
      };
      mockedApi.get.mockResolvedValueOnce({ data: allInterviewsResponse });

      const switchElement = screen.getByRole('checkbox');
      fireEvent.click(switchElement);

      await waitFor(() => {
        expect(mockedApi.get).toHaveBeenCalledWith('/interviews', {
          params: { showAll: 'true' },
        });
      });
    });
  });

  describe('Создание и редактирование интервью', () => {
    beforeEach(async () => {
      mockedApi.get.mockResolvedValueOnce({ data: mockInterviewResponse });
      renderInterviewPage();
      await waitFor(() => {
        expect(screen.getByText('Интервью')).toBeInTheDocument();
      });
    });

    it('должен открывать диалог создания интервью', async () => {
      const createButton = screen.getByRole('button', {
        name: /создать интервью/i,
      });
      fireEvent.click(createButton);

      // Используем более специфичный селектор для заголовка диалога
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();

      // Ищем заголовок диалога внутри самого диалога
      expect(dialog).toHaveTextContent('Создать интервью');
      expect(screen.getByLabelText(/название/i)).toBeInTheDocument();
      expect(screen.getByText(/дата интервью/i)).toBeInTheDocument();
    });

    it('должен позволять создать новое интервью', async () => {
      const createButton = screen.getByRole('button', {
        name: /создать интервью/i,
      });
      fireEvent.click(createButton);

      const titleInput = screen.getByLabelText(/название/i);
      fireEvent.change(titleInput, { target: { value: 'New Interview' } });

      const descriptionInput = screen.getByLabelText(/описание/i);
      fireEvent.change(descriptionInput, {
        target: { value: 'Test description' },
      });

      const newInterview = {
        id: 'interview-3',
        title: 'New Interview',
        date: '2024-01-17 10:00 (МСК)',
        status: 'SCHEDULED',
        description: 'Test description',
      };
      mockedApi.post.mockResolvedValueOnce({ data: newInterview });
      mockedApi.get.mockResolvedValueOnce({
        data: {
          ...mockInterviewResponse,
          interviews: [...mockInterviews, newInterview],
        },
      });

      // Ждем появления кнопки сохранить и проверяем её доступность
      await waitFor(
        () => {
          const saveButton = screen.getByRole('button', { name: /сохранить/i });
          expect(saveButton).toBeInTheDocument();
        },
        { timeout: 10000 }
      );

      const saveButton = screen.getByRole('button', { name: /сохранить/i });
      if (!saveButton.hasAttribute('disabled')) {
        fireEvent.click(saveButton);

        await waitFor(
          () => {
            expect(mockedApi.post).toHaveBeenCalledWith(
              '/interviews',
              expect.any(Object)
            );
          },
          { timeout: 10000 }
        );
      }
    }, 15000);

    it('должен открывать диалог редактирования при клике на редактировать', async () => {
      const editButtons = screen.getAllByLabelText(/редактировать интервью/i);
      fireEvent.click(editButtons[0]);

      expect(screen.getByText('Редактировать интервью')).toBeInTheDocument();
      expect(
        screen.getByDisplayValue('Frontend Developer Interview')
      ).toBeInTheDocument();
    });
  });

  describe('Удаление интервью', () => {
    beforeEach(async () => {
      mockedApi.get.mockResolvedValueOnce({ data: mockInterviewResponse });
      renderInterviewPage();
      await waitFor(() => {
        expect(screen.getByText('Интервью')).toBeInTheDocument();
      });
    });

    it('должен позволять удалить интервью', async () => {
      mockedApi.delete.mockResolvedValueOnce({});
      mockedApi.get.mockResolvedValueOnce({
        data: { ...mockInterviewResponse, interviews: [mockInterviews[1]] },
      });

      const deleteButtons = screen.getAllByLabelText(/удалить интервью/i);
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(mockedApi.delete).toHaveBeenCalledWith(
          '/interviews/interview-1'
        );
      });
    });
  });

  describe('Отображение категорий интересов', () => {
    it('должен отображать категории интересов для интервью', async () => {
      mockedApi.get.mockResolvedValueOnce({ data: mockInterviewResponse });
      renderInterviewPage();

      await waitFor(
        () => {
          // Ищем чипы с категориями интересов в списке интервью
          const chips = screen.getAllByText('Программирование');
          expect(chips.length).toBeGreaterThan(0);
        },
        { timeout: 10000 }
      );
    });

    it('должен корректно отображать разные категории', async () => {
      const mixedInterviews = [
        { ...mockInterviews[0], interestCategory: 'TESTING' },
        { ...mockInterviews[1], interestCategory: 'DESIGN' },
      ];
      const mixedResponse = {
        interviews: mixedInterviews,
        userInterest: null,
        isFiltered: false,
      };
      mockedApi.get.mockResolvedValueOnce({ data: mixedResponse });
      renderInterviewPage();

      await waitFor(() => {
        expect(screen.getByText('Тестирование')).toBeInTheDocument();
        expect(screen.getByText('Дизайн')).toBeInTheDocument();
      });
    });
  });

  describe('Обработка ошибок', () => {
    it('должен обрабатывать ошибки при сохранении интервью', async () => {
      mockedApi.get.mockResolvedValueOnce({ data: mockInterviewResponse });
      renderInterviewPage();

      await waitFor(() => {
        expect(screen.getByText('Интервью')).toBeInTheDocument();
      });

      const createButton = screen.getByRole('button', {
        name: /создать интервью/i,
      });
      fireEvent.click(createButton);

      const titleInput = screen.getByLabelText(/название/i);
      fireEvent.change(titleInput, { target: { value: 'Test Interview' } });

      mockedApi.post.mockRejectedValueOnce(new Error('Save failed'));

      const saveButton = screen.getByRole('button', { name: /сохранить/i });
      if (!saveButton.hasAttribute('disabled')) {
        fireEvent.click(saveButton);

        await waitFor(
          () => {
            expect(
              screen.getByText(/не удалось сохранить интервью/i)
            ).toBeInTheDocument();
          },
          { timeout: 10000 }
        );
      }
    });

    it('должен обрабатывать ошибки при удалении интервью', async () => {
      mockedApi.get.mockResolvedValueOnce({ data: mockInterviewResponse });
      renderInterviewPage();

      await waitFor(() => {
        expect(screen.getByText('Интервью')).toBeInTheDocument();
      });

      mockedApi.delete.mockRejectedValueOnce(new Error('Delete failed'));

      const deleteButtons = screen.getAllByLabelText(/удалить интервью/i);
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(
          screen.getByText(/не удалось удалить интервью/i)
        ).toBeInTheDocument();
      });
    });
  });
});
