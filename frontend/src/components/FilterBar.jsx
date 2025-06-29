import { Box, Tabs, Tab, MenuItem, Select, FormControl, TextField, InputAdornment, useTheme, useMediaQuery } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export default function FilterBar({ tab, setTab, distance, setDistance, sortOrder, setSortOrder, searchQuery, setSearchQuery }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: isSmallMobile ? 'column' : 'row',
        alignItems: isSmallMobile ? 'stretch' : 'center', 
        gap: 2, 
        mt: 2,
        flexWrap: 'wrap'
      }}
    >
      <TextField
        size="small"
        placeholder="Search posts..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        sx={{ 
          minWidth: isMobile ? '100%' : 260, 
          bgcolor: '#f5f7fa', 
          borderRadius: 3,
          flex: isMobile ? 'none' : 1
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: '#1976d2' }} />
            </InputAdornment>
          ),
          style: { borderRadius: 24, background: '#f5f7fa' }
        }}
        variant="outlined"
      />
      
      <Box sx={{ 
        display: 'flex', 
        gap: 1, 
        flexDirection: isSmallMobile ? 'column' : 'row',
        width: isSmallMobile ? '100%' : 'auto'
      }}>
        <FormControl size="small" sx={{ minWidth: isSmallMobile ? '100%' : 120 }}>
          <Select value={distance} onChange={e => setDistance(e.target.value)}>
            <MenuItem value="1km">1 km</MenuItem>
            <MenuItem value="3km">3 km</MenuItem>
            <MenuItem value="5km">5 km</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl size="small" sx={{ minWidth: isSmallMobile ? '100%' : 120 }}>
          <Select value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
            <MenuItem value="latest">Latest</MenuItem>
            <MenuItem value="nearest">Nearest</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ 
        width: '100%', 
        overflowX: isMobile ? 'auto' : 'visible',
        '& .MuiTabs-root': {
          minHeight: 'auto'
        },
        '& .MuiTab-root': {
          minWidth: 'auto',
          padding: isSmallMobile ? '6px 8px' : '12px 16px',
          fontSize: isSmallMobile ? '0.75rem' : '0.875rem'
        }
      }}>
        <Tabs 
          value={tab} 
          onChange={(_, v) => setTab(v)}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons={isMobile ? "auto" : false}
          allowScrollButtonsMobile
        >
          <Tab label="All" />
          <Tab label="Help Requests" />
          <Tab label="Services" />
          <Tab label="Alerts" />
          <Tab label="My Posts" />
        </Tabs>
      </Box>
    </Box>
  );
}