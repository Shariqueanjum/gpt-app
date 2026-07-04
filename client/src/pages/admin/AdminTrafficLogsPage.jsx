import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Grid
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  CallMade as OutgoingIcon,
  CallReceived as IncomingIcon,
  Computer as SurveyClickIcon,
  Http as S2SIcon,
  WebAsset as BrowserIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import adminAxiosInstance from '../../utils/adminAxiosInstance';
import { getColors } from '../../components/Layout/SharedLayout';
import { formatUTCDateTime } from '../../utils/formatTime';

const AdminTrafficLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    direction: '',
    type: '',
    status_code: '',
    date_from: '',
    date_to: ''
  });
  const colors = getColors();

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      case 'rejected': return 'error';
      case 'quota_full': return 'info';
      case 'security_terminated': return 'error';
      case 'reversed': return 'default';
      default: return 'default';
    }
  };

  const getDirectionIcon = (direction) => {
    return direction === 'outgoing' ? <OutgoingIcon fontSize="small" /> : <IncomingIcon fontSize="small" />;
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'survey_click': return <SurveyClickIcon fontSize="small" />;
      case 's2s_callback': return <S2SIcon fontSize="small" />;
      case 'browser_callback': return <BrowserIcon fontSize="small" />;
      default: return <S2SIcon fontSize="small" />;
    }
  };

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('page', meta.page);
      params.append('limit', meta.limit);
      if (filters.direction) params.append('direction', filters.direction);
      if (filters.type) params.append('type', filters.type);
      if (filters.status_code) params.append('status_code', filters.status_code);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (searchQuery) params.append('internal_transaction_id', searchQuery);

      const res = await adminAxiosInstance.get(`/admin/traffic-logs?${params.toString()}`);
      setLogs(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load traffic logs');
    } finally {
      setLoading(false);
    }
  }, [meta.page, meta.limit, filters, searchQuery]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleChangePage = (event, newPage) => {
    setMeta(prev => ({ ...prev, page: newPage + 1 }));
  };

  const handleChangeRowsPerPage = (event) => {
    setMeta(prev => ({ ...prev, limit: parseInt(event.target.value, 10), page: 1 }));
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setMeta(prev => ({ ...prev, page: 1 }));
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setMeta(prev => ({ ...prev, page: 1 }));
      fetchLogs();
    }
  };

  const openDetail = (log) => {
    setSelectedLog(log);
    setDialogOpen(true);
  };

  const closeDetail = () => {
    setSelectedLog(null);
    setDialogOpen(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Traffic Logs
      </Typography>

      <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Search by Transaction ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            size="small"
            sx={{ minWidth: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Direction</InputLabel>
            <Select
              value={filters.direction}
              label="Direction"
              onChange={(e) => handleFilterChange('direction', e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="outgoing">Outgoing</MenuItem>
              <MenuItem value="incoming">Incoming</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={filters.type}
              label="Type"
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="survey_click">Survey Click</MenuItem>
              <MenuItem value="s2s_callback">S2S Callback</MenuItem>
              <MenuItem value="browser_callback">Browser Callback</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="From"
            type="date"
            size="small"
            value={filters.date_from}
            onChange={(e) => handleFilterChange('date_from', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="To"
            type="date"
            size="small"
            value={filters.date_to}
            onChange={(e) => handleFilterChange('date_to', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <IconButton onClick={fetchLogs} color="primary">
            <RefreshIcon />
          </IconButton>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: colors.tableHeaderBg }}>
                <TableCell sx={{ fontWeight: 600, color: colors.text }}>Direction</TableCell>
                <TableCell sx={{ fontWeight: 600, color: colors.text }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600, color: colors.text }}>Username</TableCell>
                <TableCell sx={{ fontWeight: 600, color: colors.text }}>Time (UTC)</TableCell>
                <TableCell sx={{ fontWeight: 600, color: colors.text }}>Transaction ID</TableCell>
                <TableCell sx={{ fontWeight: 600, color: colors.text }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, color: colors.text }}>Offer Wall</TableCell>
                <TableCell sx={{ fontWeight: 600, color: colors.text }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4, color: colors.muted }}>
                    No traffic logs found
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>
                      <Chip
                        icon={getDirectionIcon(log.direction)}
                        label={log.direction}
                        size="small"
                        color={log.direction === 'outgoing' ? 'primary' : 'secondary'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getTypeIcon(log.type)}
                        label={log.type.replace('_', ' ')}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell sx={{ color: colors.text }}>
                      {log.user_username || log.user_username_joined || '-'}
                    </TableCell>
                    <TableCell sx={{ color: colors.text, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      {formatUTCDateTime(log.created_at)}
                    </TableCell>
                    <TableCell sx={{ color: colors.text, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      {log.internal_transaction_id ? (
                        <Tooltip title={log.internal_transaction_id}>
                          <span>{log.internal_transaction_id.slice(0, 15)}...</span>
                        </Tooltip>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.click_status || 'unknown'}
                        size="small"
                        color={getStatusColor(log.click_status)}
                      />
                    </TableCell>
                    <TableCell sx={{ color: colors.text }}>
                      {log.offer_wall_name || log.offer_wall_name_joined || '-'}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => openDetail(log)} color="primary">
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={meta.total}
          page={meta.page - 1}
          onPageChange={handleChangePage}
          rowsPerPage={meta.limit}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </Paper>

      {/* Detail Dialog */}
      <Dialog open={dialogOpen} onClose={closeDetail} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Traffic Log Details #{selectedLog?.id}
        </DialogTitle>
        <DialogContent dividers>
          {selectedLog && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Basic Info */}
              <Box>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                  Basic Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Direction
                    </Typography>
                    <Chip
                      icon={getDirectionIcon(selectedLog.direction)}
                      label={selectedLog.direction}
                      size="small"
                      color={selectedLog.direction === 'outgoing' ? 'primary' : 'secondary'}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Type
                    </Typography>
                    <Chip
                      icon={getTypeIcon(selectedLog.type)}
                      label={selectedLog.type.replace('_', ' ')}
                      size="small"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      User
                    </Typography>
                    <Typography variant="body1">
                      {selectedLog.user_username || selectedLog.user_username_joined || '-'} 
                      {selectedLog.user_public_id || selectedLog.user_public_id_joined ? ` (${selectedLog.user_public_id || selectedLog.user_public_id_joined})` : ''}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Time (UTC)
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                      {formatUTCDateTime(selectedLog.created_at)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Offer Wall
                    </Typography>
                    <Typography variant="body1">
                      {selectedLog.offer_wall_name || selectedLog.offer_wall_name_joined || '-'}
                      {selectedLog.offer_wall_internal_id || selectedLog.offer_wall_internal_id_joined ? ` (${selectedLog.offer_wall_internal_id || selectedLog.offer_wall_internal_id_joined})` : ''}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Survey Click Status
                    </Typography>
                    <Chip
                      label={selectedLog.click_status || 'unknown'}
                      size="small"
                      color={getStatusColor(selectedLog.click_status)}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              {/* Transaction IDs */}
              <Box>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                  Transaction IDs
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Internal Transaction ID
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                      {selectedLog.internal_transaction_id || '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      External Transaction ID
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                      {selectedLog.external_transaction_id || '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Survey Click ID
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                      {selectedLog.survey_click_id || '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      HTTP Response Status
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                      {selectedLog.response_status || '-'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              {/* Outgoing Traffic Specific Details */}
              {selectedLog.direction === 'outgoing' && (
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                    Outgoing Traffic Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Redirect URL Sent to Offer Wall
                      </Typography>
                      <Box
                        sx={{
                          p: 1.5,
                          backgroundColor: '#f5f5f5',
                          borderRadius: 1,
                          fontFamily: 'monospace',
                          fontSize: '0.8rem',
                          wordBreak: 'break-all',
                          color: '#1976d2'
                        }}
                      >
                        {selectedLog.url || '-'}
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Method
                      </Typography>
                      <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                        {selectedLog.method || '-'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Processing Time
                      </Typography>
                      <Typography variant="body1">
                        {selectedLog.processing_time_ms ? `${selectedLog.processing_time_ms}ms` : '-'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Request Body (Click Payload)
                      </Typography>
                      <Box
                        component="pre"
                        sx={{
                          p: 1.5,
                          backgroundColor: '#f5f5f5',
                          borderRadius: 1,
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          overflow: 'auto',
                          maxHeight: 200
                        }}
                      >
                        {selectedLog.request_body ? JSON.stringify(selectedLog.request_body, null, 2) : '-'}
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Processing Result
                      </Typography>
                      <Box
                        component="pre"
                        sx={{
                          p: 1.5,
                          backgroundColor: '#f5f5f5',
                          borderRadius: 1,
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          overflow: 'auto',
                          maxHeight: 200
                        }}
                      >
                        {selectedLog.processing_result ? JSON.stringify(selectedLog.processing_result, null, 2) : '-'}
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Incoming Traffic Specific Details */}
              {selectedLog.direction === 'incoming' && (
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                    Incoming Traffic Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Callback URL
                      </Typography>
                      <Box
                        sx={{
                          p: 1.5,
                          backgroundColor: '#f5f5f5',
                          borderRadius: 1,
                          fontFamily: 'monospace',
                          fontSize: '0.8rem',
                          wordBreak: 'break-all',
                          color: '#1976d2'
                        }}
                      >
                        {selectedLog.url || '-'}
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Method
                      </Typography>
                      <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                        {selectedLog.method || '-'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Processing Time
                      </Typography>
                      <Typography variant="body1">
                        {selectedLog.processing_time_ms ? `${selectedLog.processing_time_ms}ms` : '-'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Headers
                      </Typography>
                      <Box
                        component="pre"
                        sx={{
                          p: 1.5,
                          backgroundColor: '#f5f5f5',
                          borderRadius: 1,
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          overflow: 'auto',
                          maxHeight: 200
                        }}
                      >
                        {selectedLog.headers ? JSON.stringify(selectedLog.headers, null, 2) : '-'}
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Query Parameters
                      </Typography>
                      <Box
                        component="pre"
                        sx={{
                          p: 1.5,
                          backgroundColor: '#f5f5f5',
                          borderRadius: 1,
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          overflow: 'auto',
                          maxHeight: 200
                        }}
                      >
                        {selectedLog.query_params ? JSON.stringify(selectedLog.query_params, null, 2) : '-'}
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Request Body
                      </Typography>
                      <Box
                        component="pre"
                        sx={{
                          p: 1.5,
                          backgroundColor: '#f5f5f5',
                          borderRadius: 1,
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          overflow: 'auto',
                          maxHeight: 200
                        }}
                      >
                        {selectedLog.request_body ? JSON.stringify(selectedLog.request_body, null, 2) : '-'}
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Response Body
                      </Typography>
                      <Box
                        component="pre"
                        sx={{
                          p: 1.5,
                          backgroundColor: '#f5f5f5',
                          borderRadius: 1,
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          overflow: 'auto',
                          maxHeight: 200
                        }}
                      >
                        {selectedLog.response_body ? JSON.stringify(selectedLog.response_body, null, 2) : '-'}
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Processing Result
                      </Typography>
                      <Box
                        component="pre"
                        sx={{
                          p: 1.5,
                          backgroundColor: '#f5f5f5',
                          borderRadius: 1,
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          overflow: 'auto',
                          maxHeight: 200
                        }}
                      >
                        {selectedLog.processing_result ? JSON.stringify(selectedLog.processing_result, null, 2) : '-'}
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Error Info */}
              {selectedLog.error_message && (
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} color="error" gutterBottom>
                    Error Information
                  </Typography>
                  <Alert severity="error" sx={{ mb: 1 }}>
                    {selectedLog.error_message}
                  </Alert>
                  {selectedLog.error_stack && (
                    <Box
                      component="pre"
                      sx={{
                        p: 1.5,
                        backgroundColor: '#ffebee',
                        borderRadius: 1,
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                        overflow: 'auto',
                        maxHeight: 300,
                        color: '#c62828'
                      }}
                    >
                      {selectedLog.error_stack}
                    </Box>
                  )}
                </Box>
              )}

              {/* Network Info */}
              <Box>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                  Network Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      IP Address
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                      {selectedLog.ip_address || '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      User Agent
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', wordBreak: 'break-all' }}>
                      {selectedLog.user_agent || '-'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDetail} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminTrafficLogsPage;