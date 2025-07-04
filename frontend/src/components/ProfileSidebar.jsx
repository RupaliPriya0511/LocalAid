import { useState } from 'react';
import { Card, Avatar, Typography, Box, Divider, Button, List, ListItem, ListItemText, IconButton, Chip, Tooltip, Badge, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VerifiedIcon from '@mui/icons-material/Verified';
import axios from 'axios';

const typeColors = {
  Help: 'primary',
  Service: 'success',
  Alert: 'error',
};

const defaultAvatar = 'https://res.cloudinary.com/demo/image/upload/v1234567890/default_avatar.png';
const getAvatarUrl = (avatar) => {
  if (!avatar) return defaultAvatar;
  return avatar.startsWith('/') ? `https://localaid.onrender.com${avatar}` : avatar;
};

export default function ProfileSidebar({ user, stats, posts, onDeletePost, onEditProfile }) {
  const [editOpen, setEditOpen] = useState(false);
  const [editFields, setEditFields] = useState({ name: user?.name || '', locationName: user?.locationName || '', avatar: user?.avatar || '' });
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [uploading, setUploading] = useState(false);
  const [deletingPost, setDeletingPost] = useState(null);

  const handleDelete = async (id) => {
    try {
      setDeletingPost(id);
      await onDeletePost(id);
      // The parent component will handle the state update and show snackbar
    } catch (err) {
      console.error('Error deleting post:', err);
    } finally {
      setDeletingPost(null);
    }
  };

  const handleEditOpen = () => {
    setEditFields({ name: user?.name || '', locationName: user?.locationName || '', avatar: user?.avatar || '' });
    setAvatarPreview(user?.avatar || '');
    setEditOpen(true);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setUploading(true);
      const formData = new FormData();
      formData.append('avatar', file);
      try {
        const res = await axios.post(`https://localaid.onrender.com/api/users/${user._id || user.id}/avatar`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setAvatarPreview(res.data.avatar);
        setEditFields(f => ({ ...f, avatar: res.data.avatar }));
      } catch (err) {
        console.error('Error uploading avatar:', err);
      }
      setUploading(false);
    }
  };

  const handleEditSave = () => {
    if (onEditProfile) onEditProfile(editFields);
    setEditOpen(false);
  };

  if (!user) return null;
  return (
    <Card sx={{
      p: { xs: 1.5, sm: 3 },
      borderRadius: 3,
      mb: 3,
      minWidth: { xs: '100%', sm: 260 },
      maxWidth: 400,
      width: '100%',
      boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)',
      background: 'linear-gradient(135deg, #f8fafc 60%, #e3eafc 100%)',
      transition: 'box-shadow 0.2s',
      '&:hover': { boxShadow: '0 8px 32px 0 rgba(0,0,0,0.15)' }
    }}>
      <Box display="flex" flexDirection="column" alignItems="center">
        <Box sx={{ position: 'relative', mb: 2 }}>
          <Avatar
            src={getAvatarUrl(avatarPreview || user.avatar)}
            sx={{
              width: 64,
              height: 64,
              boxShadow: 2,
              transition: 'transform 0.2s',
              '&:hover': { transform: 'scale(1.08)' }
            }}
          />
          {user.verified && (
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={<VerifiedIcon color="primary" fontSize="small" />}
              sx={{ position: 'absolute', bottom: 0, right: 0 }}
            />
          )}
        </Box>
        <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: 16, sm: 20 } }}>{user.name}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: 12, sm: 14 } }}>{user.email}</Typography>
        {user.locationName && (
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: 12, sm: 14 } }}>{user.locationName}</Typography>
        )}
        <Divider sx={{ my: 2, width: '100%' }} />
        <Box display="flex" justifyContent="space-between" width="100%" mb={1}>
          <Box textAlign="center">
            <Typography variant="subtitle2" fontWeight="bold">{posts?.length ?? 0}</Typography>
            <Typography variant="caption" color="text.secondary">Posts</Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="subtitle2" fontWeight="bold">{stats?.responses ?? 0}</Typography>
            <Typography variant="caption" color="text.secondary">Responses</Typography>
          </Box>
        </Box>
        <Button variant="outlined" size="small" sx={{ mt: 2, mb: 2, borderRadius: 2, width: { xs: '100%', sm: 'auto' }, fontWeight: 600 }} onClick={handleEditOpen}>Edit Profile</Button>
      </Box>
      {posts && posts.length > 0 && (
        <Box mt={2} sx={{ overflowX: { xs: 'auto', sm: 'visible' } }}>
          <Divider sx={{ mb: 1 }} />
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, letterSpacing: 0.5 }}>My Posts</Typography>
          <List dense sx={{ bgcolor: '#f8fafc', borderRadius: 2, boxShadow: 1, p: 1, minWidth: 0 }}>
            {posts.map(post => (
              <ListItem key={post._id} sx={{
                borderRadius: 2,
                mb: 1,
                transition: 'background 0.2s, box-shadow 0.2s',
                '&:hover': { bgcolor: '#e3eafc', boxShadow: 2 },
                minWidth: 0
              }}
                secondaryAction={
                  <Tooltip title="Delete this post">
                    <IconButton 
                      edge="end" 
                      aria-label="delete" 
                      onClick={() => handleDelete(post._id)} 
                      size="small" 
                      disabled={deletingPost === post._id}
                      sx={{ 
                        color: 'error.main', 
                        '&:hover': { bgcolor: '#ffebee' },
                        '&:disabled': { opacity: 0.6 }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                }>
                <Chip
                  label={post.type}
                  color={typeColors[post.type] || 'default'}
                  size="small"
                  sx={{ mr: 1, fontWeight: 600, letterSpacing: 0.5 }}
                />
                <ListItemText
                  primary={post.title}
                  secondary={post.status}
                  primaryTypographyProps={{ fontSize: { xs: 12, sm: 14 }, fontWeight: 500 }}
                  secondaryTypographyProps={{ fontSize: { xs: 10, sm: 12 }, color: 'text.secondary' }}
                  sx={{ ml: 1, minWidth: 0 }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 2 }}>
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <Avatar src={getAvatarUrl(avatarPreview)} sx={{ width: 64, height: 64, mb: 1 }} />
            <Button variant="outlined" component="label" size="small" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload Profile Picture'}
              <input type="file" accept="image/*" hidden onChange={handleAvatarChange} />
            </Button>
          </Box>
          <TextField label="Name" value={editFields.name} fullWidth size="small" InputProps={{ readOnly: true }} />
          <TextField label="Email" value={user.email} fullWidth size="small" InputProps={{ readOnly: true }} />
          <TextField label="Location" value={editFields.locationName} onChange={e => setEditFields(f => ({ ...f, locationName: e.target.value }))} fullWidth size="small" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
} 