import { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Grid, Dialog, Alert, Container, Fade, Paper, Typography, useTheme, CircularProgress, Snackbar, Drawer, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import useMediaQuery from '@mui/material/useMediaQuery';
import Header from '../components/Header';
import FilterBar from '../components/FilterBar';
import ActionButtons from '../components/ActionButtons';
import PostCard from '../components/PostCard';
import PostForm from '../components/PostForm';
import ChatModal from '../components/ChatModal';
import UserProfileModal from '../components/UserProfileModal';
import HelpersModal from '../components/HelpersModal';
import ProfileSidebar from '../components/ProfileSidebar';

export default function Home({ user, socket, onUserUpdate }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [tab, setTab] = useState(0);
  const [posts, setPosts] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [formType, setFormType] = useState('Help');
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [chatTarget, setChatTarget] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [helpersOpen, setHelpersOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [distance, setDistance] = useState('1km');
  const [sortOrder, setSortOrder] = useState('latest');
  const [searchQuery, setSearchQuery] = useState("");
  const [userState, setUserState] = useState(user);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Define fetchPosts at the top level so it is available everywhere
  const fetchPosts = async () => {
    try {
      setLoading(true);
      let url = 'https://localaid.onrender.com/api/posts';
      if (location) {
        url += `?latitude=${location.latitude}&longitude=${location.longitude}`;
      }
      const res = await axios.get(url);
      setPosts(res.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get user's location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          setLocationError("Please enable location access to see nearby posts");
          console.error("Error getting location:", error);
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser");
    }
  }, []);

  // useEffect for location
  useEffect(() => {
    fetchPosts();
  }, [location]);

  // Sync userState with user prop when it changes
  useEffect(() => {
    setUserState(user);
  }, [user]);

  // When avatar is clicked:
  const handleAvatarClick = (user) => {
    console.log('Avatar clicked:', user);
    setSelectedUser(user);
    setProfileOpen(true);
  };

  // When Message button is clicked:
  const handleMessage = (post) => {
    setSelectedPost(post);
    setChatOpen(true);
  };

  // When Helpers button is clicked:
  const handleHelpersClick = (post) => {
    setSelectedPost(post);
    setHelpersOpen(true);
  };

  // When Chat button is clicked in HelpersModal:
  const handleHelperChat = (userObj) => {
    setChatTarget(userObj.name);
    setChatOpen(true);
  };

  const handlePostCreated = (newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
    setFormOpen(false);
    setSnackbar({ open: true, message: 'Post created successfully!', severity: 'success' });
  };

  // Handler for notification click to open chat
  const handleNotificationAction = async (notification) => {
    if (notification.type === 'MESSAGE') {
      let post = posts.find(p => p._id === notification.postId);
      if (!post) {
        try {
          const res = await axios.get(`https://localaid.onrender.com/api/posts/${notification.postId}`);
          post = res.data;
        } catch (err) {
          console.error('Could not fetch post for chat:', err);
          return;
        }
      }
      
      const currentUserName = typeof user === 'object' ? user.name : user;
      const postCreator = typeof post.user === 'object' ? post.user.name : post.user;
      
      // Determine the chat target:
      // If current user is the post creator, chat with the message sender
      // If current user is not the post creator, chat with the post creator
      let chatTarget;
      if (currentUserName === postCreator) {
        // Current user is post creator, chat with the message sender
        chatTarget = notification.sender;
      } else {
        // Current user is not post creator, chat with the post creator
        chatTarget = postCreator;
      }
      
      setSelectedPost(post);
      setChatTarget(chatTarget);
      setChatOpen(true);
    }
  };

  // These handlers will be passed to ActionButtons
  const handleRequestHelp = () => {
    if (!user) {
      setSnackbar({ open: true, message: 'Please log in to create a post', severity: 'warning' });
      return;
    }
    setFormType('Help');
    setFormOpen(true);
  };

  const handleOfferService = () => {
    if (!user) {
      setSnackbar({ open: true, message: 'Please log in to create a post', severity: 'warning' });
      return;
    }
    setFormType('Service');
    setFormOpen(true);
  };

  const handlePostAlert = () => {
    if (!user) {
      setSnackbar({ open: true, message: 'Please log in to create a post', severity: 'warning' });
      return;
    }
    setFormType('Alert');
    setFormOpen(true);
  };

  // Filtering logic before rendering
  const filteredPosts = posts.filter(post => {
    // Tab filtering
    if (tab === 1 && post.type !== 'Help') return false;
    if (tab === 2 && post.type !== 'Service') return false;
    if (tab === 3 && post.type !== 'Alert') return false;
    if (tab === 4) {
      if (!user) return false;
      if (typeof post.user === 'object') {
        if (user._id && post.user._id !== user._id) return false;
        if (user.name && post.user.name !== user.name) return false;
      } else {
        if (post.user !== user.name && post.user !== user) return false;
      }
    }
    // Distance filtering
    if (post.distance && distance) {
      const maxDist = parseInt(distance);
      if (post.distance > maxDist) return false;
    }
    // Search filtering
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const inTitle = post.title && post.title.toLowerCase().includes(q);
      const inDesc = post.description && post.description.toLowerCase().includes(q);
      if (!inTitle && !inDesc) return false;
    }
    return true;
  });

  // Sorting logic
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortOrder === 'latest') {
      return new Date(b.time) - new Date(a.time);
    } else if (sortOrder === 'nearest') {
      return (a.distance || Infinity) - (b.distance || Infinity);
    }
    return 0;
  });

  // Get user's posts for sidebar - this will automatically update when posts state changes
  const myPosts = posts.filter(post => {
    if (!user) return false;
    if (typeof post.user === 'object') {
      if (user._id && post.user._id === user._id) return true;
      if (user.name && post.user.name === user.name) return true;
    } else {
      if (post.user === user.name || post.user === user) return true;
    }
    return false;
  });

  const handleDeletePost = async (postId) => {
    try {
      await axios.delete(`https://localaid.onrender.com/api/posts/${postId}`);
      // Update posts state immediately without refetching
      setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
      setSnackbar({ open: true, message: 'Post deleted successfully!', severity: 'success' });
    } catch (err) {
      console.error('Error deleting post:', err);
      setSnackbar({ open: true, message: 'Failed to delete post', severity: 'error' });
    }
  };

  // Utility to normalize avatar URL (keep in sync with App.jsx)
  const normalizeUserAvatar = (user) => {
    if (!user) return user;
    let avatar = user.avatar;
    if (avatar && avatar.startsWith('/')) {
      avatar = `https://localaid.onrender.com${avatar}`;
    }
    // Always ensure 'id' is present
    const id = user.id || user._id;
    return { ...user, avatar, id };
  };

  const handleEditProfile = async (updated) => {
    try {
      console.log('DEBUG userState:', userState);
      const userId = userState._id || userState.id;
      const res = await axios.patch(`https://localaid.onrender.com/api/users/${userId}`, updated);
      const normalized = normalizeUserAvatar(res.data);
      setUserState(normalized);
      localStorage.setItem('user', JSON.stringify(normalized));
      
      // Update parent component's user state for real-time updates
      if (onUserUpdate) {
        onUserUpdate(normalized);
      }
      
      setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update profile', severity: 'error' });
    }
  };

  // Enhanced socket event handling
  useEffect(() => {
    if (!socket) return;
    
    const handleUpdate = () => {
      console.log('Socket update received, refetching posts...');
      fetchPosts();
    };
    
    const handlePostCreated = (newPost) => {
      console.log('New post created via socket:', newPost);
      setPosts(prevPosts => [newPost, ...prevPosts]);
    };
    
    const handlePostUpdated = (updatedPost) => {
      console.log('Post updated via socket:', updatedPost);
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === updatedPost._id ? updatedPost : post
        )
      );
    };
    
    const handlePostDeleted = (postId) => {
      console.log('Post deleted via socket:', postId);
      setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
    };

    // Listen for user profile updates from other devices
    const handleUserProfileUpdated = (data) => {
      console.log('Profile update received in Home component:', data);
      // Check if this update is for the current user
      if (data.userId === user._id || data.userId === user.id) {
        console.log('Updating userState from WebSocket event in Home');
        const normalized = normalizeUserAvatar(data.user);
        setUserState(normalized);
        // Also update parent component if callback exists
        if (onUserUpdate) {
          onUserUpdate(normalized);
        }
      }
    };

    socket.on('postsUpdated', handleUpdate);
    socket.on('postCreated', handlePostCreated);
    socket.on('postUpdated', handlePostUpdated);
    socket.on('postDeleted', handlePostDeleted);
    socket.on('userProfileUpdated', handleUserProfileUpdated);
    
    return () => {
      socket.off('postsUpdated', handleUpdate);
      socket.off('postCreated', handlePostCreated);
      socket.off('postUpdated', handlePostUpdated);
      socket.off('postDeleted', handlePostDeleted);
      socket.off('userProfileUpdated', handleUserProfileUpdated);
    };
  }, [socket, user, onUserUpdate]);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: '#e0e3e8',
      transition: 'all 0.3s ease-in-out',
      width: '100vw',
      maxWidth: '100vw',
      overflowX: 'hidden'
          }}>
      <Header user={user} socket={socket} onNotificationAction={handleNotificationAction} onMenuClick={() => setSidebarOpen(true)} />
      {isMobile ? (
        <Drawer
          anchor="left"
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          PaperProps={{ sx: { width: 280 } }}
        >
          <Box sx={{ height: '100vh', overflowY: 'auto' }}>
            <ProfileSidebar user={userState} stats={{ posts: posts.length, responses: 0 }} posts={myPosts} onDeletePost={handleDeletePost} onEditProfile={handleEditProfile} />
          </Box>
        </Drawer>
      ) : null}
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
        <Grid container columns={12} spacing={{ xs: 2, md: 3 }}>
          {!isMobile && (
            <Grid item lg={3} sx={{ display: { xs: 'none', lg: 'block' } }}>
              <ProfileSidebar user={userState} stats={{ posts: posts.length, responses: 0 }} posts={myPosts} onDeletePost={handleDeletePost} onEditProfile={handleEditProfile} />
            </Grid>
          )}
          <Grid item xs={12} lg={9}>
            <Fade in={true} timeout={800}>
              <Box>
                {locationError && (
                  <Alert 
                    severity="warning" 
                    sx={{ 
                      mb: { xs: 2, md: 3 },
                      borderRadius: 2,
                      boxShadow: 1,
                      '& .MuiAlert-icon': {
                        color: 'warning.main'
                      }
                    }}
                  >
                    {locationError}
                  </Alert>
                )}

                <Paper 
                  elevation={0}
                  sx={{ 
                    p: { xs: 2, md: 3 }, 
                    mb: { xs: 2, md: 4 }, 
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    boxShadow: '0 2px 12px 0 rgba(0,0,0,0.05)'
                  }}
                >
                  <ActionButtons
                    onRequestHelp={handleRequestHelp}
                    onOfferService={handleOfferService}
                    onPostAlert={handlePostAlert}
                  />
                </Paper>

                <Paper 
                  elevation={0}
                  sx={{ 
                    p: { xs: 1, md: 2 }, 
                    mb: { xs: 2, md: 4 }, 
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    boxShadow: '0 2px 12px 0 rgba(0,0,0,0.05)'
                  }}
                >
                  <FilterBar tab={tab} setTab={setTab} distance={distance} setDistance={setDistance} sortOrder={sortOrder} setSortOrder={setSortOrder} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                </Paper>

                <Grid container spacing={{ xs: 2, md: 3 }}>
                  {sortedPosts.map((post, index) => (
                    <Grid key={post._id} gridColumn={{ xs: 'span 12', sm: 'span 6', lg: 'span 4' }}>
                      <Fade in={true} timeout={500} style={{ transitionDelay: `${index * 100}ms` }}>
                        <Box>
                          <PostCard
                            post={post}
                            onMessage={handleMessage}
                            onHelpersClick={handleHelpersClick}
                            onAvatarClick={handleAvatarClick}
                            currentUser={userState}
                            socket={socket}
                            onPostUpdate={() => {
                              // Update specific post in state
                              fetchPosts();
                            }}
                          />
                        </Box>
                      </Fade>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Fade>

            <Dialog
              open={formOpen}
              onClose={() => setFormOpen(false)}
              maxWidth="sm"
              fullWidth
              PaperProps={{
                sx: {
                  borderRadius: 2,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                }
              }}
            >
              <PostForm 
                type={formType}
                onPostCreated={handlePostCreated}
                onCancel={() => setFormOpen(false)}
                user={userState}
                location={location}
              />
            </Dialog>

            <ChatModal
              open={chatOpen}
              onClose={() => {
                setChatOpen(false);
                setChatTarget(null);
              }}
              post={selectedPost}
              currentUser={userState}
              chatTarget={chatTarget}
            />

            <UserProfileModal 
              open={profileOpen} 
              onClose={() => setProfileOpen(false)} 
              user={selectedUser} 
            />

            <HelpersModal
              open={helpersOpen}
              onClose={() => setHelpersOpen(false)}
              post={selectedPost}
              currentUser={userState}
              onChatOpen={handleHelperChat}
            />
          </Grid>
        </Grid>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}


