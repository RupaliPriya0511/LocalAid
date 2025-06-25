import { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Grid, Dialog, Alert, Container, Fade, Paper, Typography, useTheme, CircularProgress } from '@mui/material';
import Header from '../components/Header';
import FilterBar from '../components/FilterBar';
import ActionButtons from '../components/ActionButtons';
import PostCard from '../components/PostCard';
import PostForm from '../components/PostForm';
import ChatModal from '../components/ChatModal';
import UserProfileModal from '../components/UserProfileModal';
import HelpersModal from '../components/HelpersModal';
import ProfileSidebar from '../components/ProfileSidebar';

export default function Home({ user, socket }) {
  const theme = useTheme();
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

  // Define fetchPosts at the top level so it is available everywhere
  const fetchPosts = async () => {
    try {
      setLoading(true);
      let url = 'http://localhost:5000/api/posts';
      if (location) {
        url += `?latitude=${location.latitude}&longitude=${location.longitude}`;
      }
      const res = await axios.get(url);
      setPosts(res.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch posts');
      setLoading(false);
      console.error('Error fetching posts:', err);
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
    setPosts([newPost, ...posts]);
    setFormOpen(false);
  };

  // Handler for notification click to open chat
  const handleNotificationAction = async (notification) => {
    if (notification.type === 'MESSAGE') {
      let post = posts.find(p => p._id === notification.postId);
      if (!post) {
        try {
          const res = await axios.get(`http://localhost:5000/api/posts/${notification.postId}`);
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
      alert('Please log in to create a post');
      return;
    }
    setFormType('Help');
    setFormOpen(true);
  };

  const handleOfferService = () => {
    if (!user) {
      alert('Please log in to create a post');
      return;
    }
    setFormType('Service');
    setFormOpen(true);
  };

  const handlePostAlert = () => {
    if (!user) {
      alert('Please log in to create a post');
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

  // Sorting
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortOrder === 'latest') {
      return new Date(b.time) - new Date(a.time);
    } else if (sortOrder === 'nearest') {
      return (a.distance || 0) - (b.distance || 0);
    }
    return 0;
  });

  const myPosts = posts.filter(post => {
    if (!user) return false;
    if (typeof post.user === 'object') {
      return (user._id && post.user._id === user._id) || (user.name && post.user.name === user.name);
    } else {
      return post.user === user.name || post.user === user;
    }
  });

  const handleDeletePost = async (postId) => {
    await axios.delete(`http://localhost:5000/api/posts/${postId}`);
    fetchPosts();
  };

  // Utility to normalize avatar URL (keep in sync with App.jsx)
  const normalizeUserAvatar = (user) => {
    if (!user) return user;
    let avatar = user.avatar;
    if (avatar && avatar.startsWith('/')) {
      avatar = `http://localhost:5000${avatar}`;
    }
    // Always ensure 'id' is present
    const id = user.id || user._id;
    return { ...user, avatar, id };
  };

  const handleEditProfile = async (updated) => {
    try {
      console.log('DEBUG userState:', userState);
      const userId = userState._id || userState.id;
      const res = await axios.patch(`http://localhost:5000/api/users/${userId}`, updated);
      const normalized = normalizeUserAvatar(res.data);
      setUserState(normalized);
      localStorage.setItem('user', JSON.stringify(normalized));
    } catch (err) {
      alert('Failed to update profile.');
    }
  };

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => fetchPosts();
    socket.on('postsUpdated', handleUpdate);
    return () => socket.off('postsUpdated', handleUpdate);
  }, [socket]);

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
      transition: 'all 0.3s ease-in-out'
    }}>
      <Header user={userState} socket={socket} onNotificationAction={handleNotificationAction} />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container columns={12} spacing={3}>
          <Grid gridColumn={{ xs: 'span 12', md: 'span 3' }}>
            <ProfileSidebar user={userState} stats={{ posts: posts.length, responses: 0 }} posts={myPosts} onDeletePost={handleDeletePost} onEditProfile={handleEditProfile} />
          </Grid>
          <Grid gridColumn={{ xs: 'span 12', md: 'span 9' }}>
            <Fade in={true} timeout={800}>
              <Box>
                {locationError && (
                  <Alert 
                    severity="warning" 
                    sx={{ 
                      mb: 3,
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
                    p: 3, 
                    mb: 4, 
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
                    p: 2, 
                    mb: 4, 
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    boxShadow: '0 2px 12px 0 rgba(0,0,0,0.05)'
                  }}
                >
                  <FilterBar tab={tab} setTab={setTab} distance={distance} setDistance={setDistance} sortOrder={sortOrder} setSortOrder={setSortOrder} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                </Paper>

                <Grid container spacing={3}>
                  {sortedPosts.map((post, index) => (
                    <Grid key={post._id} gridColumn={{ xs: 'span 12', sm: 'span 6', md: 'span 4' }}>
                      <Fade in={true} timeout={500} style={{ transitionDelay: `${index * 100}ms` }}>
                        <Box>
                          <PostCard
                            post={post}
                            onMessage={handleMessage}
                            onHelpersClick={handleHelpersClick}
                            onAvatarClick={handleAvatarClick}
                            currentUser={userState}
                            socket={socket}
                            onPostUpdate={fetchPosts}
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
    </Box>
  );
}


