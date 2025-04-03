import React, { useState, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  Description as DocumentIcon,
  History as HistoryIcon,
  AccountCircle as ProfileIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  LanguageOutlined as LanguageIcon,
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../../context/ThemeContext';
import LanguageContext from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

// Styled components
const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  minHeight: '100vh',
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'center',
}));

const DrawerContent = styled(Box)({
  width: 250,
});

const StyledLink = styled(Link)({
  textDecoration: 'none',
  color: 'inherit',
  display: 'flex',
  width: '100%',
});

function Layout() {
  const { t } = useTranslation();
  const { mode, toggleTheme } = useContext(ThemeContext);
  const { language, toggleLanguage } = useContext(LanguageContext);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('md'));

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  const handleLanguageToggle = () => {
    toggleLanguage();
    handleMenuClose();
  };

  const handleThemeToggle = () => {
    toggleTheme();
    handleMenuClose();
  };

  // Navigation items
  const navItems = [
    { text: t('home'), icon: <HomeIcon />, path: '/' },
  ];

  if (isAuthenticated) {
    navItems.push(
      { text: t('dashboard'), icon: <DashboardIcon />, path: '/dashboard' },
      { text: t('newRequest'), icon: <DocumentIcon />, path: '/new-request' },
      { text: t('requestHistory'), icon: <HistoryIcon />, path: '/history' },
      { text: t('profile'), icon: <ProfileIcon />, path: '/profile' }
    );

    // Admin navigation
    if (user?.role === 'admin' || user?.role === 'staff') {
      navItems.push(
        { text: t('adminDashboard'), icon: <DashboardIcon />, path: '/admin/dashboard' },
        { text: t('manageRequests'), icon: <DocumentIcon />, path: '/admin/requests' }
      );
    }

    // Approver navigation
    if (user?.role === 'approver') {
      navItems.push(
        { text: t('approverDashboard'), icon: <DashboardIcon />, path: '/approver/dashboard' },
        { text: t('pendingApprovals'), icon: <DocumentIcon />, path: '/approver/requests' }
      );
    }
  } else {
    navItems.push(
      { text: t('login'), icon: <LoginIcon />, path: '/login' },
      { text: t('register'), icon: <RegisterIcon />, path: '/register' }
    );
  }

  const drawerContent = (
    <DrawerContent>
      <DrawerHeader>
        <Typography variant="h6" component="div">
          {t('appName')}
        </Typography>
      </DrawerHeader>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem 
            button 
            key={item.text}
            component={StyledLink}
            to={item.path}
            selected={location.pathname === item.path}
            onClick={isMobile ? handleDrawerToggle : undefined}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </DrawerContent>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {t('appName')}
          </Typography>

          {/* Language toggle button */}
          <Button 
            color="inherit" 
            onClick={handleLanguageToggle}
            startIcon={<LanguageIcon />}
            sx={{ mr: 1 }}
          >
            {language === 'th' ? 'EN' : 'ไทย'}
          </Button>

          {/* Theme toggle button */}
          <IconButton color="inherit" onClick={handleThemeToggle} sx={{ mr: 1 }}>
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          {isAuthenticated ? (
            <>
              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenuOpen}
                color="inherit"
              >
                <Avatar sx={{ width: 32, height: 32 }}>
                  {user?.firstName?.charAt(0) || user?.email?.charAt(0)}
                </Avatar>
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
                  <ListItemIcon>
                    <ProfileIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>{t('profile')}</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>{t('logout')}</ListItemText>
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">
                {t('login')}
              </Button>
              <Button color="inherit" component={Link} to="/register">
                {t('register')}
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? drawerOpen : true}
        onClose={isMobile ? handleDrawerToggle : undefined}
      >
        {drawerContent}
      </Drawer>

      <MainContent>
        <Toolbar /> {/* Spacer for fixed AppBar */}
        <Outlet />
      </MainContent>
    </Box>
  );
}

export default Layout;