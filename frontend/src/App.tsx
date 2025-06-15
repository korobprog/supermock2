import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from '@mui/material';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import InterviewPage from './pages/InterviewPage';
import ScoringPage from './pages/ScoringPage';
import FeedbackPage from './pages/FeedbackPage';
import AnalyticsPage from './pages/AnalyticsPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage';
import { useState, useEffect } from 'react';
import api from './utils/axios';

const theme = createTheme();

// PrivateRoute component to protect routes
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" />;
};

// AppBar with logout button
const AppBarWithLogout = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('token')
  );
  const [userRole, setUserRole] = useState<string>('');

  // Fetch user role when authenticated
  useEffect(() => {
    const fetchUserRole = async () => {
      if (isAuthenticated) {
        try {
          const response = await api.get('/users/me');
          setUserRole(response.data.data.user.role);
        } catch (error) {
          console.error('Failed to fetch user role:', error);
          setUserRole('');
        }
      } else {
        setUserRole('');
      }
    };

    fetchUserRole();
  }, [isAuthenticated]);

  // Listen for storage changes (e.g., login/logout in other tabs)
  window.addEventListener('storage', () => {
    setIsAuthenticated(!!localStorage.getItem('token'));
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Mock Interview Platform
        </Typography>
        {!isAuthenticated && (
          <Button color="inherit" component={Link} to="/login">
            Login
          </Button>
        )}
        {!isAuthenticated && (
          <Button color="inherit" component={Link} to="/register">
            Register
          </Button>
        )}
        <Button color="inherit" component={Link} to="/dashboard">
          Dashboard
        </Button>
        {isAuthenticated && (
          <Button color="inherit" component={Link} to="/profile">
            Profile
          </Button>
        )}
        {isAuthenticated && (
          <Button color="inherit" component={Link} to="/interviews">
            Interviews
          </Button>
        )}
        {isAuthenticated && (
          <Button color="inherit" component={Link} to="/scoring">
            Scoring
          </Button>
        )}
        {isAuthenticated && (
          <Button color="inherit" component={Link} to="/feedback">
            Feedback
          </Button>
        )}
        {isAuthenticated && (
          <Button color="inherit" component={Link} to="/analytics">
            Analytics
          </Button>
        )}
        {isAuthenticated && (
          <Button color="inherit" component={Link} to="/notifications">
            Notifications
          </Button>
        )}
        {isAuthenticated && (
          <Button color="inherit" component={Link} to="/settings">
            Settings
          </Button>
        )}
        {isAuthenticated && userRole === 'ADMIN' && (
          <Button color="inherit" component={Link} to="/admin">
            Admin
          </Button>
        )}
        {isAuthenticated && (
          <Button color="inherit" onClick={handleLogout}>
            Exit
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppBarWithLogout />
        <Box sx={{ mt: 4 }}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/interviews"
              element={
                <PrivateRoute>
                  <InterviewPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/scoring"
              element={
                <PrivateRoute>
                  <ScoringPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/feedback"
              element={
                <PrivateRoute>
                  <FeedbackPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <PrivateRoute>
                  <AnalyticsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <PrivateRoute>
                  <NotificationsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <SettingsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <PrivateRoute>
                  <AdminPage />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<LoginPage />} />
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
