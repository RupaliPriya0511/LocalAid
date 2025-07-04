import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Avatar,
  Box,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import {
  People as PeopleIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  VolunteerActivism as HelpIcon,
  Close as CloseIcon,
  Replay as ReplayIcon
} from '@mui/icons-material';
import axios from 'axios';

export default function PostCard({ post, onMessage, onHelpersClick, onAvatarClick, currentUser, onPostUpdate }) {
  const theme = useTheme();
  
  const getTypeColor = (type) => {
    switch (type) {
      case 'Help':
        return theme.palette.primary.main;
      case 'Service':
        return theme.palette.success.main;
      case 'Alert':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return theme.palette.success.main;
      case 'active':
        return theme.palette.warning.main;
      case 'closed':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const defaultAvatar = 'https://res.cloudinary.com/demo/image/upload/v1234567890/default_avatar.png';
  // const defaultPostImage = 'https://res.cloudinary.com/demo/image/upload/v1234567890/default_post.png';
  const defaultPostImage = 'https://res.cloudinary.com/dnpawvfvy/image/upload/default_nn1ndo.png';
  
  const getAvatarUrl = (avatar) => {
    if (!avatar) return defaultAvatar;
    return avatar.startsWith('/') ? `https://localaid.onrender.com${avatar}` : avatar;
  };
  const getPostImageUrl = (image) => {
    if (!image) return defaultPostImage;
    return image.startsWith('/uploads/') ? `https://localaid.onrender.com${image}` : image;
  };
  const getVideoUrl = (video) => {
    if (!video) return '';
    return video.startsWith('/uploads/') ? `https://localaid.onrender.com${video}` : video;
  };

  // Handle both object and string user data
  const getUserData = () => {
    if (typeof post.user === 'object' && post.user !== null) {
      return {
        name: post.user.name || 'Unknown User',
        avatar: post.user.avatar,
        id: post.user._id
      };
    }
    return {
      name: post.user || 'Unknown User',
      avatar: null,
      id: null
    };
  };

  const userData = getUserData();
  const isPostCreator = currentUser && (
    (typeof currentUser === 'object' && (currentUser._id === userData.id || currentUser.name === userData.name)) ||
    (typeof currentUser === 'string' && (currentUser === userData.name || currentUser === userData.id))
  );
  console.log('DEBUG PostCard:', { currentUser, postUser: post.user, userData, isPostCreator });

  return (
    <Card 
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        transition: 'all 0.3s ease-in-out',
        bgcolor: 'background.paper',
        boxShadow: '0 2px 12px 0 rgba(0,0,0,0.05)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px 0 rgba(0,0,0,0.1)',
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Tooltip title="View Profile">
            <IconButton 
              onClick={() => onAvatarClick(userData)}
              sx={{ 
                mr: 2,
                '&:hover': {
                  transform: 'scale(1.1)',
                }
              }}
            >
              <Avatar 
                src={getAvatarUrl(userData.avatar)}
                sx={{ 
                  width: 40, 
                  height: 40,
                  border: `2px solid ${alpha(getTypeColor(post.type), 0.2)}`,
                  bgcolor: alpha(getTypeColor(post.type), 0.1)
                }}
              >
                {userData.name?.[0]?.toUpperCase()}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              {userData.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(post.time).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={post.type}
            size="small"
            sx={{
              bgcolor: alpha(getTypeColor(post.type), 0.1),
              color: getTypeColor(post.type),
              fontWeight: 'bold',
              height: 32,
              borderRadius: 2
            }}
          />
          <Chip
            label={post.status}
            size="small"
            sx={{
              bgcolor: alpha(getStatusColor(post.status), 0.1),
              color: getStatusColor(post.status),
              fontWeight: 'bold',
              height: 32,
              borderRadius: 2
            }}
          />
          {isPostCreator && post.status === 'open' && (
            <Tooltip title="Close this post">
              <Button
                variant="outlined"
                color="error"
                size="small"
                sx={{ ml: 1, height: 32, borderRadius: 2, minWidth: 64, px: 2, textTransform: 'none', fontWeight: 600 }}
                onClick={async () => {
                  try {
                    await axios.patch(`https://localaid.onrender.com/api/posts/${post._id}/status`, { status: 'closed' });
                    if (typeof onPostUpdate === 'function') onPostUpdate();
                  } catch (err) {
                    console.error('Error closing post:', err);
                  }
                }}
              >
                Close
              </Button>
            </Tooltip>
          )}
          {isPostCreator && post.status === 'closed' && (
            <Tooltip title="Reopen this post">
              <Button
                variant="outlined"
                color="primary"
                size="small"
                sx={{ ml: 1, height: 32, borderRadius: 2, minWidth: 64, px: 2, textTransform: 'none', fontWeight: 600 }}
                onClick={async () => {
                  try {
                    await axios.patch(`https://localaid.onrender.com/api/posts/${post._id}/status`, { status: 'open' });
                    if (typeof onPostUpdate === 'function') onPostUpdate();
                  } catch (err) {
                    console.error('Error reopening post:', err);
                  }
                }}
              >
                Reopen
              </Button>
            </Tooltip>
          )}
        </Box>

        <Typography variant="h6" gutterBottom fontWeight="bold">
          {post.title}
        </Typography>

        {/* Media Preview - always reserve space for media */}
        <Box sx={{ mb: 2, width: '100%', minHeight: 220, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f5f5f5', borderRadius: 2 }}>
          {post.image ? (
            <img src={getPostImageUrl(post.image)} alt="Post" style={{ width: '100%', borderRadius: 8, maxHeight: 220, objectFit: 'cover' }} />
          ) : post.video ? (
            <video
              src={getVideoUrl(post.video)}
              controls
              style={{ width: '100%', borderRadius: 8, maxHeight: 220, objectFit: 'cover', background: '#000' }}
            />
          ) : (
            <img src={defaultPostImage} alt="No Media" style={{ width: '100%', borderRadius: 8, maxHeight: 220, objectFit: 'cover', opacity: 0.7 }} />
          )}
        </Box>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {post.description}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'text.secondary' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocationIcon sx={{ fontSize: 16, mr: 0.5 }} />
            <Typography variant="caption">
              {post.distance ? `${post.distance.toFixed(1)} km` : 'Nearby'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TimeIcon sx={{ fontSize: 16, mr: 0.5 }} />
            <Typography variant="caption">
              {new Date(post.time).toLocaleTimeString()}
            </Typography>
          </Box>
        </Box>
      </CardContent>
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          variant="contained"
          startIcon={<HelpIcon />}
          onClick={() => onHelpersClick(post)}
          sx={{
            flex: 1,
            borderRadius: 2,
            textTransform: 'none',
            bgcolor: theme.palette.success.main,
            color: '#fff',
            '&:hover': {
              bgcolor: theme.palette.success.dark,
            }
          }}
        >
          Responses
        </Button>
      </CardActions>
    </Card>
  );
}