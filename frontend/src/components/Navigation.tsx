import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
  Collapse,
  Menu,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Person,
  VideoCall,
  Assessment,
  Feedback,
  Schedule,
  BookOnline,
  EventNote,
  Analytics,
  Notifications,
  Settings,
  AdminPanelSettings,
  Login,
  PersonAdd,
  Logout,
  ExpandLess,
  ExpandMore,
  MoreVert,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/axios';

interface NavigationProps {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
}

const Navigation: React.FC<NavigationProps> = ({
  isAuthenticated,
  setIsAuthenticated,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const isTablet = useMediaQuery(theme.breakpoints.down('xl'));

  const [userRole, setUserRole] = useState<string>('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bookingMenuOpen, setBookingMenuOpen] = useState(false);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<null | HTMLElement>(
    null
  );

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
  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [setIsAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setMobileOpen(false);
    setMoreMenuAnchor(null);
    navigate('/login');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleBookingMenuToggle = () => {
    setBookingMenuOpen(!bookingMenuOpen);
  };

  const handleMoreMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMoreMenuAnchor(event.currentTarget);
  };

  const handleMoreMenuClose = () => {
    setMoreMenuAnchor(null);
  };

  const primaryMenuItems = [
    {
      text: 'Главная',
      icon: <Dashboard />,
      path: '/dashboard',
      show: true,
      priority: 1,
    },
    {
      text: 'Профиль',
      icon: <Person />,
      path: '/profile',
      show: isAuthenticated,
      priority: 2,
    },
    {
      text: 'Интервью',
      icon: <VideoCall />,
      path: '/interviews',
      show: isAuthenticated,
      priority: 3,
    },
  ];

  const secondaryMenuItems = [
    {
      text: 'Оценка',
      icon: <Assessment />,
      path: '/scoring',
      show: isAuthenticated,
      priority: 4,
    },
    {
      text: 'Отзывы',
      icon: <Feedback />,
      path: '/feedback',
      show: isAuthenticated,
      priority: 5,
    },
    {
      text: 'Аналитика',
      icon: <Analytics />,
      path: '/analytics',
      show: isAuthenticated,
      priority: 6,
    },
    {
      text: 'Уведомления',
      icon: <Notifications />,
      path: '/notifications',
      show: isAuthenticated,
      priority: 7,
    },
    {
      text: 'Настройки',
      icon: <Settings />,
      path: '/settings',
      show: isAuthenticated,
      priority: 8,
    },
    {
      text: 'Админ',
      icon: <AdminPanelSettings />,
      path: '/admin',
      show: isAuthenticated && userRole === 'ADMIN',
      priority: 9,
    },
  ];

  const bookingItems = [
    {
      text: 'Временные слоты',
      icon: <Schedule />,
      path: '/timeslots',
    },
    {
      text: 'Бронирование',
      icon: <BookOnline />,
      path: '/booking',
    },
    {
      text: 'Мои бронирования',
      icon: <EventNote />,
      path: '/my-bookings',
    },
  ];

  const authItems = [
    {
      text: 'Войти',
      icon: <Login />,
      path: '/login',
      show: !isAuthenticated,
    },
    {
      text: 'Регистрация',
      icon: <PersonAdd />,
      path: '/register',
      show: !isAuthenticated,
    },
  ];

  // Определяем какие элементы показывать на десктопе
  const getVisibleDesktopItems = () => {
    const allItems = [...primaryMenuItems, ...secondaryMenuItems].filter(
      (item) => item.show
    );

    if (isTablet) {
      // На планшетах показываем только основные элементы
      return {
        visible: allItems.slice(0, 3),
        hidden: allItems.slice(3),
      };
    } else {
      // На больших экранах показываем больше элементов
      return {
        visible: allItems.slice(0, 6),
        hidden: allItems.slice(6),
      };
    }
  };

  const { visible: visibleDesktopItems, hidden: hiddenDesktopItems } =
    getVisibleDesktopItems();

  const drawer = (
    <Box sx={{ width: 280 }} className="fade-in">
      <Box sx={{ p: 2 }} className="drawer-header">
        <Typography
          variant="h6"
          className="logo-text"
          sx={{ fontWeight: 600, color: 'primary.main' }}
        >
          Mock Interview Platform
        </Typography>
      </Box>

      <List>
        {/* Main menu items */}
        {[...primaryMenuItems, ...secondaryMenuItems]
          .filter((item) => item.show)
          .map((item) => (
            <ListItem
              key={item.text}
              component={Link}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className="mobile-menu-item nav-item-hover"
              sx={{
                '&:hover': {
                  backgroundColor: 'primary.light',
                  color: 'white',
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
                borderRadius: 1,
                mx: 1,
                mb: 0.5,
              }}
            >
              <ListItemIcon sx={{ color: 'primary.main' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}

        {/* Booking section */}
        {isAuthenticated && (
          <>
            <Divider sx={{ my: 1 }} className="menu-section-divider" />
            <ListItem
              onClick={handleBookingMenuToggle}
              sx={{
                '&:hover': {
                  backgroundColor: 'primary.light',
                  color: 'white',
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
                borderRadius: 1,
                mx: 1,
                mb: 0.5,
                cursor: 'pointer',
              }}
            >
              <ListItemIcon sx={{ color: 'primary.main' }}>
                <BookOnline />
              </ListItemIcon>
              <ListItemText primary="Бронирование" />
              {bookingMenuOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItem>

            <Collapse in={bookingMenuOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding className="booking-submenu">
                {bookingItems.map((item) => (
                  <ListItem
                    key={item.text}
                    component={Link}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    sx={{
                      pl: 4,
                      '&:hover': {
                        backgroundColor: 'secondary.light',
                        color: 'white',
                        '& .MuiListItemIcon-root': {
                          color: 'white',
                        },
                      },
                      borderRadius: 1,
                      mx: 1,
                      mb: 0.5,
                    }}
                  >
                    <ListItemIcon sx={{ color: 'secondary.main' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </>
        )}

        {/* Auth items */}
        <Divider sx={{ my: 1 }} className="menu-section-divider" />
        {authItems
          .filter((item) => item.show)
          .map((item) => (
            <ListItem
              key={item.text}
              component={Link}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className="auth-menu-item mobile-menu-item"
              sx={{
                '&:hover': {
                  backgroundColor: 'secondary.light',
                  color: 'white',
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
                borderRadius: 1,
                mx: 1,
                mb: 0.5,
              }}
            >
              <ListItemIcon sx={{ color: 'secondary.main' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}

        {/* Logout */}
        {isAuthenticated && (
          <ListItem
            onClick={handleLogout}
            className="logout-menu-item mobile-menu-item"
            sx={{
              '&:hover': {
                backgroundColor: 'error.light',
                color: 'white',
                '& .MuiListItemIcon-root': {
                  color: 'white',
                },
              },
              borderRadius: 1,
              mx: 1,
              mb: 0.5,
              cursor: 'pointer',
            }}
          >
            <ListItemIcon sx={{ color: 'error.main' }}>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Выйти" />
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static" elevation={2} className="modern-appbar">
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            variant="h6"
            component={Link}
            to="/dashboard"
            className="logo-text"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 600,
            }}
          >
            Mock Interview Platform
          </Typography>

          {/* Desktop menu */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {!isAuthenticated && (
                <>
                  {authItems
                    .filter((item) => item.show)
                    .map((item) => (
                      <Button
                        key={item.text}
                        color="inherit"
                        component={Link}
                        to={item.path}
                        startIcon={item.icon}
                        className="desktop-nav-button"
                      >
                        {item.text}
                      </Button>
                    ))}
                </>
              )}

              {isAuthenticated && (
                <>
                  {/* Основные видимые элементы */}
                  {visibleDesktopItems.map((item) => (
                    <Button
                      key={item.text}
                      color="inherit"
                      component={Link}
                      to={item.path}
                      startIcon={item.icon}
                      className="desktop-nav-button"
                      size="small"
                    >
                      {item.text}
                    </Button>
                  ))}

                  {/* Меню бронирования */}
                  <Button
                    color="inherit"
                    component={Link}
                    to="/booking"
                    startIcon={<BookOnline />}
                    className="desktop-nav-button"
                    size="small"
                  >
                    Бронирование
                  </Button>

                  {/* Кнопка "Ещё" для скрытых элементов */}
                  {hiddenDesktopItems.length > 0 && (
                    <>
                      <IconButton
                        color="inherit"
                        onClick={handleMoreMenuOpen}
                        sx={{ ml: 1 }}
                      >
                        <MoreVert />
                        {hiddenDesktopItems.length > 0 && (
                          <Chip
                            label={hiddenDesktopItems.length}
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: -4,
                              right: -4,
                              backgroundColor: 'secondary.main',
                              color: 'white',
                              fontSize: '0.7rem',
                              height: 18,
                              minWidth: 18,
                            }}
                          />
                        )}
                      </IconButton>
                      <Menu
                        anchorEl={moreMenuAnchor}
                        open={Boolean(moreMenuAnchor)}
                        onClose={handleMoreMenuClose}
                        PaperProps={{
                          sx: {
                            mt: 1,
                            minWidth: 200,
                          },
                        }}
                      >
                        {hiddenDesktopItems.map((item) => (
                          <MenuItem
                            key={item.text}
                            component={Link}
                            to={item.path}
                            onClick={handleMoreMenuClose}
                            sx={{ gap: 2 }}
                          >
                            {item.icon}
                            {item.text}
                          </MenuItem>
                        ))}
                      </Menu>
                    </>
                  )}

                  <Button
                    color="inherit"
                    onClick={handleLogout}
                    startIcon={<Logout />}
                    className="desktop-nav-button"
                    size="small"
                    sx={{ ml: 1 }}
                  >
                    Выйти
                  </Button>
                </>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        className="slide-in"
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
            backgroundColor: 'background.paper',
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navigation;
