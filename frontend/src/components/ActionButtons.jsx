// import { Box, Button } from '@mui/material';
// import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
// import AddAlertIcon from '@mui/icons-material/AddAlert';

// export default function ActionButtons() {
//   return (
//     <Box display="flex" gap={2} my={3} sx={{ width: "100vw", left: 0 }}>
//       <Button variant="contained" color="warning" sx={{ flex: 1 }}>
//         Request Help
//       </Button>
//       <Button variant="contained" color="success" sx={{ flex: 1 }} startIcon={<VolunteerActivismIcon />}>
//         Offer Service
//       </Button>
//       <Button variant="contained" color="error" sx={{ flex: 1 }} startIcon={<AddAlertIcon />}>
//         Post Alert
//       </Button>
//     </Box>
//   );
// }

import React from 'react';
import { Box, Button, useTheme, alpha } from '@mui/material';
import {
  Add as AddIcon,
  VolunteerActivism as HelpIcon,
  Handshake as ServiceIcon,
  Warning as AlertIcon
} from '@mui/icons-material';

export default function ActionButtons({ onRequestHelp, onOfferService, onPostAlert }) {
  const theme = useTheme();

  const buttonStyles = {
    flex: 1,
    py: 1.5,
    borderRadius: 2,
    textTransform: 'none',
    fontWeight: 'bold',
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
      transform: 'translateY(-2px)',
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Button
        variant="contained"
        startIcon={<HelpIcon />}
        onClick={onRequestHelp}
        sx={{
          ...buttonStyles,
          bgcolor: theme.palette.primary.main,
          '&:hover': {
            ...buttonStyles['&:hover'],
            bgcolor: theme.palette.primary.dark,
          }
        }}
      >
        Request Help
      </Button>

      <Button
        variant="contained"
        startIcon={<ServiceIcon />}
        onClick={onOfferService}
        sx={{
          ...buttonStyles,
          bgcolor: theme.palette.success.main,
          '&:hover': {
            ...buttonStyles['&:hover'],
            bgcolor: theme.palette.success.dark,
          }
        }}
      >
        Offer Service
      </Button>

      <Button
        variant="contained"
        startIcon={<AlertIcon />}
        onClick={onPostAlert}
        sx={{
          ...buttonStyles,
          bgcolor: theme.palette.error.main,
          '&:hover': {
            ...buttonStyles['&:hover'],
            bgcolor: theme.palette.error.dark,
          }
        }}
      >
        Post Alert
      </Button>
    </Box>
  );
}