import { Box, Tabs, Tab, MenuItem, Select, FormControl, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export default function FilterBar({ tab, setTab, distance, setDistance, sortOrder, setSortOrder, searchQuery, setSearchQuery }) {
  return (
    <Box display="flex" alignItems="center" gap={2} mt={2}>
      <TextField
        size="small"
        placeholder="Search posts..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        sx={{ minWidth: 260, bgcolor: '#f5f7fa', borderRadius: 3 }}
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
      <FormControl size="small">
        <Select value={distance} onChange={e => setDistance(e.target.value)}>
          <MenuItem value="1km">1 km</MenuItem>
          <MenuItem value="3km">3 km</MenuItem>
          <MenuItem value="5km">5 km</MenuItem>
        </Select>
      </FormControl>
      <Tabs value={tab} onChange={(_, v) => setTab(v)}>
        <Tab label="All" />
        <Tab label="Help Requests" />
        <Tab label="Services" />
        <Tab label="Alerts" />
        <Tab label="My Posts" />
      </Tabs>
      <Box flexGrow={1} />
      <FormControl size="small">
        <Select value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
          <MenuItem value="latest">Latest</MenuItem>
          <MenuItem value="nearest">Nearest</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}