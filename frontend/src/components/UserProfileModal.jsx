import React from 'react';
import { Dialog, DialogTitle, DialogContent, Avatar, Typography, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const defaultAvatar = 'https://res.cloudinary.com/demo/image/upload/v1234567890/default_avatar.png';
const getAvatarUrl = (avatar) => {
  if (!avatar) return '';
  return avatar.startsWith('/') ? `https://localaid.onrender.com${avatar}` : avatar;
};

export default function UserProfileModal({ open, onClose, user }) {
  if (!user) return null;
  console.log('UserProfileModal rendered with:', user);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        User Profile
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" alignItems="center" py={2}>
          <Avatar src={getAvatarUrl(user.avatar)} sx={{ width: 80, height: 80, mb: 2, bgcolor: 'primary.main', fontSize: 36 }}>
            {(!user?.avatar && user?.name) ? user.name[0]?.toUpperCase() : ''}
          </Avatar>
          <Typography variant="h6" gutterBottom>
            {user.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {user.email}
          </Typography>
          {/* Show locationName if present, else show location if it's a string */}
          {user.locationName && (
            <Typography variant="body2" color="text.secondary">
              📍 {user.locationName}
            </Typography>
          )}
          {!user.locationName && typeof user.location === 'string' && (
            <Typography variant="body2" color="text.secondary">
              📍 {user.location}
            </Typography>
          )}
          {/* Add more fields as needed */}
        </Box>
      </DialogContent>
    </Dialog>
  );
}