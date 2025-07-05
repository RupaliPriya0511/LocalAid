import { AppBar, Toolbar, Typography, InputBase, IconButton, Badge, Avatar, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Button } from '@mui/material';
import { useState } from 'react';
import UserProfileModal from './UserProfileModal';
import NotificationBell from './NotificationBell';
import { useNavigate } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';

export default function Header({ user, socket, onNotificationAction, onMenuClick }) {
    const [profileOpen, setProfileOpen] = useState(false);
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
    };

    const defaultAvatar = 'https://res.cloudinary.com/demo/image/upload/v1234567890/default_avatar.png';
    const getAvatarUrl = (avatar) => {
        if (!avatar) return defaultAvatar;
        return avatar.startsWith('/') ? `https://localaid.onrender.com${avatar}` : avatar;
    };

    return (
        <AppBar position="fixed" color="inherit" elevation={1} sx={{ width: "100vw", left: 0, zIndex: 1201, maxWidth: '100vw', overflowX: 'hidden' }}>
            <Toolbar>
                {isMobile && (
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        onClick={onMenuClick}
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                )}
                <Typography variant="h6" sx={{ flexGrow: 1, color: "#1976d2", fontWeight: 700, ml: isMobile ? 1 : 0 }}>
                    LocalAid
                </Typography>
                <NotificationBell socket={socket} currentUser={user} onNotificationAction={onNotificationAction} />
                <Avatar 
                    src={getAvatarUrl(user?.avatar)}
                    sx={{ ml: 2, cursor: 'pointer' }} 
                    onClick={() => setProfileOpen(true)}
                >
                    {(!user?.avatar && user?.name) ? user.name[0]?.toUpperCase() : ''}
                </Avatar>
                <Button color="inherit" onClick={handleLogout} sx={{ ml: 2 }}>
                    Logout
                </Button>
            </Toolbar>
            <UserProfileModal 
                open={profileOpen} 
                onClose={() => setProfileOpen(false)} 
                user={user}
            />
        </AppBar>
    );
}