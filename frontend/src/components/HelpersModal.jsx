import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Typography,
  Box,
  Chip,
  Button,
  CircularProgress
} from '@mui/material';
import { Chat as ChatIcon, Close as CloseIcon } from '@mui/icons-material';
import axios from 'axios';

export default function HelpersModal({ open, onClose, post, currentUser, onChatOpen }) {
  const [helpers, setHelpers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && post) {
      fetchHelpers();
    }
  }, [open, post]);

  const fetchHelpers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`https://localaid.onrender.com/api/helpers/post/${post._id}`);
      
      // Fetch full user object for each helper
      const helpersWithUser = await Promise.all(
        res.data.map(async (helper) => {
          try {
            const userRes = await axios.get(`https://localaid.onrender.com/api/users/${helper.helperId}`);
            return { ...helper, user: userRes.data };
          } catch (err) {
            console.error(`Failed to fetch user ${helper.helperId}`, err);
            return { ...helper, user: { name: helper.helperName } }; // Fallback
          }
        })
      );
      
      setHelpers(helpersWithUser);
      setError(null);
    } catch (err) {
      setError('Failed to fetch helpers');
      console.error('Error fetching helpers:', err);
    } finally {
      setLoading(false);
    }
  };

//   const handleAddHelper = async () => {
//     try {
//       const res = await axios.post('http://localhost:5000/api/helpers', {
//         postId: post._id,
//         helperId: currentUser.id,
//         helperName: currentUser.name,
//         status: 'pending'
//       });
//       setHelpers([...helpers, res.data]);
//       setError(null);
//     } catch (err) {
//       setError('Failed to offer help');
//       console.error('Error offering help:', err);
//     }
//   };

const handleAddHelper = async () => {
    try {
      await axios.post('https://localaid.onrender.com/api/helpers', {
        postId: post._id,
        helperId: currentUser.id,
        helperName: currentUser.name,
        status: 'pending'
      });
      fetchHelpers(); // Refetch to update the list
      setError(null);
    } catch (err) {
      setError('Failed to offer help');
      console.error('Error offering help:', err);
    }
  };

  const handleRemoveHelper = async (helperId) => {
    try {
      await axios.delete(`https://localaid.onrender.com/api/helpers/${helperId}`);
      setHelpers(helpers.filter(h => h._id !== helperId));
      setError(null);
    } catch (err) {
      setError('Failed to remove helper');
      console.error('Error removing helper:', err);
    }
  };

  const handleChat = (userObj) => {
    onChatOpen(userObj);
    onClose();
  };

//   const isPostCreator = currentUser && post && currentUser.id === post.user.id;
//   const hasOfferedHelp = helpers.some(h => h.helperId === currentUser?.id);
//   // Filter out the post creator from the helpers list
//   const filteredHelpers = helpers.filter(h => h.helperId !== post.user.id);


if (!post || !post.user || !currentUser) {
    return null; // or a loading spinner, or nothing
  }
  
  const isPostCreator = currentUser.name === post.user;
  const hasOfferedHelp = helpers.some(h => h.helperId === currentUser.id);
  const filteredHelpers = helpers.filter(h => h.helperName !== post.user);


console.log("DEBUG helpers:", helpers);
console.log("DEBUG post.user:", post.user);
console.log("DEBUG post.user.id:", post.user.id);
console.log("DEBUG currentUser.id:", currentUser.id);

  

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }
      }}
    >
    <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid #eee',
        pb: 2
      }}>
        <Typography variant="h6" component="div">
          {isPostCreator ? 'People Offering Help' : 'Offer Help'}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
    </DialogTitle>

    <DialogContent sx={{ p: 3 }}>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* For helpers (not post creator) who have not offered help */}
            {!isPostCreator && !hasOfferedHelp && (
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleAddHelper}
                sx={{ mb: 2 }}
              >
                Offer to Help
              </Button>
            )}

            {/* For helpers (not post creator) who have not offered help, show info */}
            {!isPostCreator && !hasOfferedHelp && (
              <Typography color="textSecondary" align="center">
                Click the button above to offer your help
              </Typography>
            )}

            {/* Always show filtered helpers list to post creator, and to helpers who have offered help */}
            {(isPostCreator || hasOfferedHelp) && (
            //   <List>
            //     {filteredHelpers.length === 0 ? (
            //       <Typography color="textSecondary" align="center" sx={{ width: '100%', mt: 2 }}>
            //         No one has offered to help yet
            //       </Typography>
            //     ) : (
            //       filteredHelpers.map((helper) => (
            //         <ListItem
            //           key={helper._id}
            //           sx={{
            //             mb: 1,
            //             borderRadius: 1,
            //             bgcolor: 'background.paper',
            //             '&:hover': {
            //               bgcolor: 'action.hover'
            //             }
            //           }}
            //           onClick={() => isPostCreator && handleChat({ _id: helper.helperId, name: helper.helperName })}
            //           secondaryAction={
            //             <Box sx={{ display: 'flex', gap: 1 }}>
            //               {/* Post creator sees 'Chat with Helper' for each helper */}
            //               {isPostCreator && (
            //                 <Button
            //                   variant="contained"
            //                   color="primary"
            //                   size="small"
            //                   startIcon={<ChatIcon />}
            //                   onClick={(e) => {
            //                     e.stopPropagation();
            //                     handleChat({ _id: helper.helperId, name: helper.helperName });
            //                   }}
            //                 >
            //                   Chat with Helper
            //                 </Button>
            //               )}
            //               {/* Helper sees 'Chat with Creator' only for their own entry */}
            //               {!isPostCreator && helper.helperId === currentUser.id && (
            //                 <Button
            //                   variant="contained"
            //                   color="primary"
            //                   size="small"
            //                   startIcon={<ChatIcon />}
            //                   onClick={() => handleChat({ _id: post.user.id, name: post.user.name })}
            //                 >
            //                   Chat with Creator
            //                 </Button>
            //               )}
            //             </Box>
            //           }
            //         >
            //           <ListItemAvatar>
            //             <Avatar>{helper.helperName[0]}</Avatar>
            //           </ListItemAvatar>
            //           <ListItemText
            //             primary={helper.helperName}
            //             secondary={
            //               <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            //                 <Chip
            //                   label={helper.status}
            //                   size="small"
            //                   color={
            //                     helper.status === 'accepted' ? 'success' :
            //                     helper.status === 'rejected' ? 'error' :
            //                     'warning'
            //                   }
            //                 />
            //               </Box>
            //             }
            //           />
            //         </ListItem>
            //       ))
            //     )}
            //   </List>





        // <List>
        // {filteredHelpers.length === 0 ? (
        //     <Typography color="textSecondary" align="center" sx={{ width: '100%', mt: 2 }}>
        //     No one has offered to help yet
        //     </Typography>
        // ) : (
        //     filteredHelpers.map((helper) => (
        //     <ListItem
        //         key={helper._id}
        //         sx={{
        //         mb: 1,
        //         borderRadius: 1,
        //         bgcolor: 'background.paper',
        //         '&:hover': {
        //             bgcolor: 'action.hover'
        //         }
        //         }}
        //         // Only allow post creator to click the list item to open chat
        //         onClick={() => isPostCreator && handleChat({ _id: helper.helperId, name: helper.helperName })}
        //         secondaryAction={
        //         <Box sx={{ display: 'flex', gap: 1 }}>
        //             {/* Post creator sees 'Chat with Helper' for each helper */}
        //             {isPostCreator && (
        //             <Button
        //                 variant="contained"
        //                 color="primary"
        //                 size="small"
        //                 startIcon={<ChatIcon />}
        //                 onClick={(e) => {
        //                 e.stopPropagation();
        //                 handleChat({ _id: helper.helperId, name: helper.helperName });
        //                 }}
        //             >
        //                 Chat with Helper
        //             </Button>
        //             )}
        //             {/* Helper sees 'Chat with Creator' only for their own entry */}
        //             {!isPostCreator && helper.helperId === currentUser.id && (
        //             <Button
        //                 variant="contained"
        //                 color="primary"
        //                 size="small"
        //                 startIcon={<ChatIcon />}
        //                 onClick={() => handleChat({ _id: currentUser.id, name: post.user })}
        //             >
        //                 Chat with Creator
        //             </Button>
        //             )}
        //         </Box>
        //         }
        //     >
        //         <ListItemAvatar>
        //         <Avatar>{helper.helperName[0]}</Avatar>
        //         </ListItemAvatar>
        //         <ListItemText
        //         primary={helper.helperName}
        //         secondary={
        //             <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        //             <Chip
        //                 label={helper.status}
        //                 size="small"
        //                 color={
        //                 helper.status === 'accepted' ? 'success' :
        //                 helper.status === 'rejected' ? 'error' :
        //                 'warning'
        //                 }
        //             />
        //             </Box>
        //         }
        //         />
        //     </ListItem>
        //     ))
        // )}
        // </List>



<List>
  {filteredHelpers.length === 0 ? (
    <Typography color="textSecondary" align="center" sx={{ width: '100%', mt: 2 }}>
      No one has offered to help yet
    </Typography>
  ) : (
    filteredHelpers.map((helper) => (
      <ListItem
        key={helper._id}
        sx={{
          mb: 1,
          borderRadius: 1,
          bgcolor: 'background.paper',
          '&:hover': {
            bgcolor: 'action.hover'
          }
        }}
        onClick={() => isPostCreator && handleChat(helper.user)}
        secondaryAction={
          <Box sx={{ display: 'flex', gap: 1 }}>
            {isPostCreator && (
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<ChatIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleChat(helper.user);
                }}
              >
                Chat with Helper
              </Button>
            )}
            {!isPostCreator && helper.helperId === currentUser.id && (
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<ChatIcon />}
                onClick={() => handleChat({ _id: post.userId || currentUser.id, name: post.user })}
              >
                Chat with Creator
              </Button>
            )}
          </Box>
        }
      >
        <ListItemAvatar>
          <Avatar>{helper.helperName[0]}</Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={helper.helperName}
          secondary={
            <span>
              <Chip
                label={helper.status}
                size="small"
                color={
                  helper.status === 'accepted' ? 'success' :
                  helper.status === 'rejected' ? 'error' :
                  'warning'
                }
                sx={{ verticalAlign: 'middle', ml: 1 }}
              />
            </span>
          }
        />
      </ListItem>
    ))
  )}
</List>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );



} 