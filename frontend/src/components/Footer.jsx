import { Box, Typography } from '@mui/material';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        width: '100%',
        bgcolor: 'background.paper',
        py: 2,
        textAlign: 'center',
        mt: 'auto',
        boxShadow: '0 -2px 8px 0 rgba(0,0,0,0.04)'
      }}
    >
      <Typography variant="body2" color="text.secondary">
        &copy; {new Date().getFullYear()} LocalAid. All rights reserved.
      </Typography>
    </Box>
  );
} 