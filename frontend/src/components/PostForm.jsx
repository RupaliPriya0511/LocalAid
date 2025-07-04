// import React from 'react';

// export default function PostForm() {
//   return (
//     <div style={{ padding: 32 }}>
//       <h2>Post Form Test</h2>
//       Hello, this is a test!
//     </div>
//   );
// }


// import React, { useState } from 'react';
// import { TextField, Button } from '@mui/material';

// export default function PostForm() {
//   const [title, setTitle] = useState('');

//   return (
//     <div style={{ padding: 32 }}>
//       <h2>Create a New Post</h2>
//       <TextField
//         label="Title"
//         value={title}
//         onChange={e => setTitle(e.target.value)}
//         fullWidth
//         sx={{ mb: 2 }}
//       />
//       <Button variant="contained">Submit</Button>
//     </div>
//   );
// }


// import React, { useState } from 'react';
// import { TextField, Button, MenuItem } from '@mui/material';

// export default function PostForm() {
//   const [type, setType] = useState('Help');
//   const [title, setTitle] = useState('');
//   const [description, setDescription] = useState('');

//   return (
//     <div style={{ padding: 32 }}>
//       <h2>Create a New Post</h2>
//       <TextField
//         select
//         label="Type"
//         value={type}
//         onChange={e => setType(e.target.value)}
//         sx={{ mb: 2, width: 150, mr: 2 }}
//       >
//         <MenuItem value="Help">Help</MenuItem>
//         <MenuItem value="Service">Service</MenuItem>
//         <MenuItem value="Alert">Alert</MenuItem>
//       </TextField>
//       <TextField
//         label="Title"
//         value={title}
//         onChange={e => setTitle(e.target.value)}
//         fullWidth
//         sx={{ mb: 2 }}
//       />
//       <TextField
//         label="Description"
//         value={description}
//         onChange={e => setDescription(e.target.value)}
//         fullWidth
//         multiline
//         rows={3}
//         sx={{ mb: 2 }}
//       />
//       <Button variant="contained">Submit</Button>
//     </div>
//   );
// }








import React, { useState, useEffect } from 'react';
import { TextField, Button, MenuItem, Box, Paper, Typography, Alert } from '@mui/material';
import axios from 'axios';

const types = [
  { value: 'Help', label: 'Help' },
  { value: 'Service', label: 'Service' },
  { value: 'Alert', label: 'Alert' },
];

export default function PostForm({ type = 'Help', onPostCreated, onCancel, user, location }) {
  const [form, setForm] = useState({
    type,
    status: 'open',
    title: '',
    description: '',
    user: user?.name || '',
    userId: user?.id || '',
  });
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(prev => ({ 
      ...prev, 
      type,
      user: user?.name || '',
      userId: user?.id || ''
    }));
  }, [type, user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Check if it's a video
      if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src);
          if (video.duration > 15) {
            setError('Video must be 15 seconds or less.');
            setMedia(null);
            return;
          }
          if (video.videoWidth > 1280 || video.videoHeight > 720) {
            setError('Video resolution must be 1280x720 or lower.');
            setMedia(null);
            return;
          }
          setError('');
          setMedia(file);
        };
        video.src = URL.createObjectURL(file);
      } else {
        setError('');
        setMedia(file);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!user) {
      setError('You must be logged in to create a post');
      setLoading(false);
      return;
    }

    if (!location) {
      setError('Please enable location access to create a post');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('type', form.type);
      formData.append('status', form.status);
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('user', user.name);
      formData.append('userId', user.id);
      formData.append('isPublic', true);
      formData.append('longitude', location.longitude);
      formData.append('latitude', location.latitude);
      if (media) {
        formData.append('media', media);
      }

      const res = await axios.post('https://localaid.onrender.com/api/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setForm({
        type,
        status: 'open',
        title: '',
        description: '',
        user: user.name,
        userId: user.id,
      });
      setMedia(null);
      if (onPostCreated) onPostCreated(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create post');
    }
    setLoading(false);
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" mb={2}>Create a New Post</Typography>
      {!location && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Please enable location access to create a post
        </Alert>
      )}
      <form onSubmit={handleSubmit}>
        <TextField
          select
          label="Type"
          name="type"
          value={form.type}
          onChange={handleChange}
          sx={{ mr: 2, mb: 2, width: 150 }}
        >
          {types.map((option) => (
            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
          ))}
        </TextField>
        <TextField
          label="Title"
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          sx={{ mr: 2, mb: 2, width: 300 }}
        />
        <TextField
          label="Description"
          name="description"
          value={form.description}
          onChange={handleChange}
          required
          multiline
          rows={2}
          sx={{ display: 'block', mb: 2, width: 470 }}
        />
        <Box sx={{ mb: 2 }}>
          <input
            accept="image/*,video/*"
            type="file"
            onChange={handleFileChange}
            style={{ display: 'block', marginBottom: 8 }}
          />
          {media && (
            <Typography variant="caption">Selected: {media.name}</Typography>
          )}
        </Box>
        <Box>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            disabled={loading || !location} 
            sx={{ mr: 2 }}
          >
            {loading ? 'Posting...' : 'Post'}
          </Button>
          <Button variant="outlined" onClick={onCancel}>Cancel</Button>
        </Box>
        {error && <Typography color="error" mt={1}>{error}</Typography>}
      </form>
    </Paper>
  );
}