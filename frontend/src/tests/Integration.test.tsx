import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import App from '../App';

jest.mock('axios');

describe('Integration Tests', () => {
  it('fetches and displays user data', async () => {
    const mockUserData = { firstName: 'John', lastName: 'Doe' };
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockUserData });

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });
  });

  it('fetches and displays interviews', async () => {
    const mockInterviews = [{ title: 'Interview 1', date: '2023-01-01' }];
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockInterviews });

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Interview 1/i)).toBeInTheDocument();
    });
  });

  it('fetches and displays feedback', async () => {
    const mockFeedback = [{ content: 'Great interview!', date: '2023-01-01' }];
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockFeedback });

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Great interview!/i)).toBeInTheDocument();
    });
  });

  it('fetches and displays notifications', async () => {
    const mockNotifications = [{ message: 'New notification', date: '2023-01-01' }];
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockNotifications });

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/New notification/i)).toBeInTheDocument();
    });
  });
}); 