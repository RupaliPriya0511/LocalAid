import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  useTheme,
  alpha
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Message as MessageIcon,
  VolunteerActivism as HelpIcon,
  CheckCircle as AcceptedIcon,
  Cancel as RejectedIcon,
  PostAdd as PostAddIcon
} from '@mui/icons-material';
import axios from 'axios';

export default function NotificationBell({ socket, currentUser, onNotificationAction }) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!currentUser || !socket) return;

    // Authenticate socket with username
    socket.emit('authenticate', currentUser.name);

    // Fetch existing notifications
    fetchNotifications();

    // Listen for new notifications
    const handleNewNotification = (notification) => {
      console.log('New notification received:', notification);
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    socket.on('notification', handleNewNotification);

    return () => {
      socket.off('notification', handleNewNotification);
    };
  }, [currentUser, socket]);

  const fetchNotifications = async () => {
    if (!currentUser) return;
    
    try {
      const response = await axios.get(`http://localhost:5000/api/notifications/${currentUser.name}`);
      setNotifications(response.data);
      updateUnreadCount(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const updateUnreadCount = (notifs) => {
    setUnreadCount(notifs.filter(n => !n.read).length);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        await axios.put('http://localhost:5000/api/notifications/read', {
          notificationIds: [notification._id]
        });
        setNotifications(prev =>
          prev.map(n =>
            n._id === notification._id ? { ...n, read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    
    // Call the notification action handler if provided
    if (onNotificationAction) {
      onNotificationAction(notification);
    }
    
    handleClose();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'MESSAGE':
        return <MessageIcon color="primary" />;
      case 'HELP_OFFER':
        return <HelpIcon color="success" />;
      case 'HELPER_ACCEPTED':
        return <AcceptedIcon color="success" />;
      case 'HELPER_REJECTED':
        return <RejectedIcon color="error" />;
      case 'NEW_POST':
        return <PostAddIcon color="info" />;
      default:
        return <NotificationsIcon />;
    }
  };

  if (!currentUser) return null;

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{
          '&:hover': {
            bgcolor: alpha(theme.palette.primary.main, 0.1)
          }
        }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 400,
            mt: 1.5
          }
        }}
      >
        <Box sx={{ p: 2, pb: 1 }}>
          <Typography variant="h6">Notifications</Typography>
        </Box>
        <Divider />
        <List sx={{ p: 0 }}>
          {notifications.length === 0 ? (
            <ListItem>
              <ListItemText 
                primary="No notifications" 
                sx={{ textAlign: 'center', color: 'text.secondary' }}
              />
            </ListItem>
          ) : (
            notifications.map((notification) => (
              <ListItem
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  cursor: 'pointer',
                  bgcolor: notification.read ? 'transparent' : alpha(theme.palette.primary.main, 0.05),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.1)
                  }
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                    {getNotificationIcon(notification.type)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={notification.message}
                  secondary={new Date(notification.createdAt).toLocaleString()}
                  primaryTypographyProps={{
                    sx: {
                      fontWeight: notification.read ? 'normal' : 'bold'
                    }
                  }}
                />
              </ListItem>
            ))
          )}
        </List>
      </Menu>
    </>
  );
} 