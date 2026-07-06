import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Error as ErrorIcon,
  Person as PersonIcon,
  LocalOffer as OfferWallIcon,
  Gavel as ReversalsIcon,
  OpenInNew as OpenInNewIcon,
  VerifiedUser as VerifiedIcon,
  Block as BlockIcon
} from '@mui/icons-material';
import adminAxiosInstance from '../../utils/adminAxiosInstance';
import { AdminPageWrapper } from '../../components/Layout/AdminLayout';
import { getColors } from '../../components/Layout/SharedLayout';
import { formatUTCDateTime } from '../../utils/formatTime';
import { UserDetailDrawer } from './AdminUsersPage';
import { ActionDialog } from '../../components/Admin/AdminUiKit';

// 100 points = $1 — same convention used everywhere else in the admin panel
const POINTS_TO_DOLLAR = 100;
const formatPoints = (n) => `${Number(n || 0).toLocaleString('en-US')} pts`;
const formatDollar = (n) => `$${(Number(n || 0) / POINTS_TO_DOLLAR).toFixed(2)}`;

const AdminTrafficLogsPage = ({ darkMode, toggleDarkMode }) => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [usernameQuery, setUsernameQuery] = useState('');
  const [filters, setFilters] = useState({
    direction: '',
    type: '',
    status_code: '',
    date_from: '',
    date_to: ''
  });
  const colors = getColors(darkMode);

  // In-place user viewing — reuses the same drawer as the Users page so
  // "view this user" doesn't navigate away from the log you were reading.
  const [userDrawerOpen, setUserDrawerOpen] = useState(false);
  const [viewUserId, setViewUserId] = useState(null);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [banTarget, setBanTarget] = useState(null); // { id, username }
  const [banReason, setBanReason] = useState('');
  const [banLoading, setBanLoading] = useState(false);
  const [banError, setBanError] = useState('');

  const openUserDrawer = (userId) => {
    if (!userId) return;
    setViewUserId(userId);
    setUserDrawerOpen(true);
  };

  // Called by UserDetailDrawer's ban/unban buttons
  const handleBanUnbanFromDrawer = async (user, action) => {
    if (action === 'ban') {
      setBanTarget(user);
      setBanReason('');
      setBanError('');
      setBanDialogOpen(true);
      return;
    }
    // Unban is a single confirmed action already, no reason needed
    try {
      await adminAxiosInstance.put(`/admin/users/${user.id}/unban`);
      setUserDrawerOpen(false);
      fetchLogs();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to unban user');
    }
  };

  const confirmBan = async () => {
    if (!banTarget) return;
    setBanLoading(true);
    setBanError('');
    try {
      await adminAxiosInstance.put(`/admin/users/${banTarget.id}/ban`, { reason: banReason || undefined });
      setBanDialogOpen(false);
      setBanReason('');
      fetchLogs();
    } catch (err) {
      setBanError(err.response?.data?.message || 'Failed to ban user');
    } finally {
      setBanLoading(false);
    }
  };

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
      if (usernameQuery) params.append('username', usernameQuery);

      const res = await adminAxiosInstance.get(`/admin/traffic-logs?${params.toString()}`);
      setLogs(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load traffic logs');
    } finally {
      setLoading(false);
    }
  }, [meta.page, meta.limit, filters, searchQuery, usernameQuery]);

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

  // Quick-nav — jump to the related admin pages instead of digging through
  // menus. Users/Offer Walls/Reversals don't support deep-linking to a
  // specific record yet, so these open the list; the log dialog already
  // shows the username / offer wall internal_id to search for there.
  const goToUsers = () => navigate('/admin/users');
  const goToOfferWalls = () => navigate('/admin/offer-walls');
  const goToReversals = () => navigate('/admin/reversals');

  const openDetail = (log) => {
    setSelectedLog(log);
    setDialogOpen(true);
  };

  const closeDetail = () => {
    setSelectedLog(null);
    setDialogOpen(false);
  };

  return (
    <AdminPageWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
    <Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5, mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ color: colors.textPrimary }}>
            Traffic Logs
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textMuted, mt: 0.3 }}>
            Every outgoing redirect to an offer wall and every incoming callback that hits your server — with the user and survey click behind each one.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button size="small" variant="outlined" startIcon={<PersonIcon fontSize="small" />} onClick={goToUsers}
            sx={{ textTransform: 'none', borderRadius: 2 }}>
            Users
          </Button>
          <Button size="small" variant="outlined" startIcon={<OfferWallIcon fontSize="small" />} onClick={goToOfferWalls}
            sx={{ textTransform: 'none', borderRadius: 2 }}>
            Offer Walls
          </Button>
          <Button size="small" variant="outlined" startIcon={<ReversalsIcon fontSize="small" />} onClick={goToReversals}
            sx={{ textTransform: 'none', borderRadius: 2 }}>
            Reversals
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 3, borderRadius: 3, bgcolor: colors.cardBg }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Search by Transaction ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            size="small"
            sx={{ minWidth: 220 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            placeholder="Search by Username..."
            value={usernameQuery}
            onChange={(e) => setUsernameQuery(e.target.value)}
            onKeyDown={handleSearch}
            size="small"
            sx={{ minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon fontSize="small" />
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

      <Paper sx={{ borderRadius: 3, overflow: 'hidden', bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: colors.headerBg }}>
                <TableCell sx={{ fontWeight: 600, color: colors.textPrimary }}>Direction</TableCell>
                <TableCell sx={{ fontWeight: 600, color: colors.textPrimary }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600, color: colors.textPrimary }}>Username</TableCell>
                <TableCell sx={{ fontWeight: 600, color: colors.textPrimary }}>Time (UTC)</TableCell>
                <TableCell sx={{ fontWeight: 600, color: colors.textPrimary }}>Transaction ID</TableCell>
                <TableCell sx={{ fontWeight: 600, color: colors.textPrimary }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, color: colors.textPrimary }}>Offer Wall</TableCell>
                <TableCell sx={{ fontWeight: 600, color: colors.textPrimary }} align="center">Actions</TableCell>
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
                  <TableCell colSpan={8} align="center" sx={{ py: 4, color: colors.textMuted }}>
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
                    <TableCell>
                      {(log.user_username || log.user_username_joined) ? (
                        <Typography
                          component="span"
                          onClick={(e) => { e.stopPropagation(); openUserDrawer(log.user_id); }}
                          sx={{
                            color: colors.primary, fontWeight: 600, cursor: 'pointer',
                            fontSize: '0.85rem', '&:hover': { textDecoration: 'underline' }
                          }}
                        >
                          {log.user_username || log.user_username_joined}
                        </Typography>
                      ) : (
                        <Typography component="span" sx={{ color: colors.textPrimary, fontSize: '0.85rem' }}>-</Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ color: colors.textPrimary, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      {formatUTCDateTime(log.created_at)}
                    </TableCell>
                    <TableCell sx={{ color: colors.textPrimary, fontFamily: 'monospace', fontSize: '0.8rem' }}>
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
                    <TableCell sx={{ color: colors.textPrimary }}>
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
      <Dialog open={dialogOpen} onClose={closeDetail} maxWidth="md" fullWidth
        PaperProps={{ sx: { bgcolor: colors.cardBg, borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: colors.textPrimary }}>
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

              {/* User Profile — who this click/callback belongs to */}
              {(selectedLog.user_id || selectedLog.user_username_joined) && (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      User Profile
                    </Typography>
                    <Button
                      size="small"
                      endIcon={<OpenInNewIcon fontSize="small" />}
                      onClick={() => openUserDrawer(selectedLog.user_id)}
                      sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                    >
                      View Full Profile
                    </Button>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Full Name</Typography>
                      <Typography variant="body1">{selectedLog.user_full_name || '-'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Email</Typography>
                      <Typography variant="body1">{selectedLog.user_email || '-'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Country / Phone</Typography>
                      <Typography variant="body1">
                        {selectedLog.user_country || '-'} {selectedLog.user_phone ? `· ${selectedLog.user_phone}` : ''}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Account Status</Typography>
                      <Box sx={{ display: 'flex', gap: 0.75, mt: 0.3 }}>
                        <Chip
                          size="small"
                          icon={selectedLog.user_is_active === false ? <BlockIcon fontSize="small" /> : <VerifiedIcon fontSize="small" />}
                          label={selectedLog.user_is_active === false ? 'Banned' : 'Active'}
                          color={selectedLog.user_is_active === false ? 'error' : 'success'}
                        />
                        <Chip
                          size="small"
                          label={selectedLog.user_is_verified ? 'Verified' : 'Unverified'}
                          color={selectedLog.user_is_verified ? 'info' : 'default'}
                          variant="outlined"
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Balance Available / Locked</Typography>
                      <Typography variant="body1">
                        {formatPoints(selectedLog.user_balance_available)} ({formatDollar(selectedLog.user_balance_available)})
                        {'  /  '}
                        {formatPoints(selectedLog.user_balance_locked)} ({formatDollar(selectedLog.user_balance_locked)})
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Registered</Typography>
                      <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {selectedLog.user_registered_at ? formatUTCDateTime(selectedLog.user_registered_at) : '-'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}

              <Divider />

              {/* Survey Click Details — the click record this traffic belongs to */}
              {selectedLog.survey_click_id && (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      Survey Click Details
                    </Typography>
                    <Button
                      size="small"
                      endIcon={<OpenInNewIcon fontSize="small" />}
                      onClick={goToOfferWalls}
                      sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                    >
                      Open Offer Wall Config
                    </Button>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Survey</Typography>
                      <Typography variant="body1">
                        {selectedLog.click_survey_name || selectedLog.click_survey_id || '-'}
                        {selectedLog.click_loi ? ` (${selectedLog.click_loi} min LOI)` : ''}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Integration Type</Typography>
                      <Chip size="small" label={selectedLog.click_integration_type || selectedLog.offer_wall_type || '-'} variant="outlined" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">CPA Original → User Payout</Typography>
                      <Typography variant="body1">
                        {formatPoints(selectedLog.click_cpa_original)} ({formatDollar(selectedLog.click_cpa_original)}) → {formatPoints(selectedLog.click_cpa_user)} ({formatDollar(selectedLog.click_cpa_user)})
                        {selectedLog.click_commission_rate ? ` · commission ${selectedLog.click_commission_rate}%` : ''}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Their Transaction ID (stored on click)</Typography>
                      <Typography variant="body1" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                        {selectedLog.click_external_transaction_id || '-'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Click Created (UTC)</Typography>
                      <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {selectedLog.click_created_at ? formatUTCDateTime(selectedLog.click_created_at) : '-'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Expires At (UTC)</Typography>
                      <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {selectedLog.click_expires_at ? formatUTCDateTime(selectedLog.click_expires_at) : '-'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}

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

      {/* View full user profile in place — same drawer the Users page uses,
          so ban/unban/adjust-balance context is consistent everywhere. */}
      <UserDetailDrawer
        userId={viewUserId}
        open={userDrawerOpen}
        onClose={() => setUserDrawerOpen(false)}
        darkMode={darkMode}
        onBanUnban={handleBanUnbanFromDrawer}
      />

      <ActionDialog
        open={banDialogOpen}
        onClose={() => { setBanDialogOpen(false); setBanError(''); }}
        title={`Ban ${banTarget?.username || 'user'}`}
        onConfirm={confirmBan}
        confirmLabel="Ban user"
        danger
        loading={banLoading}
        COLORS={colors}
        error={banError}
      >
        <Typography sx={{ fontSize: '0.85rem', color: colors.textSecondary, mb: 1.5 }}>
          This immediately blocks the account from logging in and earning.
        </Typography>
        <TextField
          fullWidth
          label="Ban reason (optional)"
          placeholder="e.g. Fraud detected"
          value={banReason}
          onChange={(e) => setBanReason(e.target.value)}
          size="small"
        />
      </ActionDialog>
    </Box>
    </AdminPageWrapper>
  );
};

export default AdminTrafficLogsPage;