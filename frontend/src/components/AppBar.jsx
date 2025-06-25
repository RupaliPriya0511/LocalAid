import React from 'react';
import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  useTheme,
  alpha
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';

export default function AppBar({ 
  onMenuClick, 
  currentUser, 
  onLogout,
  socket
}) {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <MuiAppBar 
      position="fixed" 
      sx={{ 
        zIndex: theme.zIndex.drawer + 1,
        bgcolor: 'background.paper',
        color: 'text.primary',
        boxShadow: 'none',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Typography 
          variant="h6" 
          noWrap 
          component="div" 
          sx={{ 
            flexGrow: 1,
            cursor: 'pointer',
            fontWeight: 600,
            color: 'primary.main'
          }}
          onClick={() => navigate('/')}
        >
          LocalAid
        </Typography>
        {currentUser ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationBell socket={socket} currentUser={currentUser} />
            <IconButton
              color="inherit"
              onClick={() => navigate('/profile')}
              sx={{
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1)
                }
              }}
            >
              <AccountCircle />
            </IconButton>
            <IconButton
              color="inherit"
              onClick={onLogout}
              sx={{
                '&:hover': {
                  bgcolor: alpha(theme.palette.error.main, 0.1)
                }
              }}
            >
              <LogoutIcon />
            </IconButton>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              color="inherit" 
              onClick={() => navigate('/login')}
              sx={{
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1)
                }
              }}
            >
              Login
            </Button>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => navigate('/register')}
            >
              Register
            </Button>
          </Box>
        )}
      </Toolbar>
    </MuiAppBar>
  );
} 