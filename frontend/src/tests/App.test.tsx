import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

describe('App Component', () => {
  it('renders the login page by default', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
  });

  it('renders the dashboard when authenticated', () => {
    localStorage.setItem('token', 'fake-token');
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  });

  it('redirects to login when not authenticated', () => {
    localStorage.removeItem('token');
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
  });
}); 