// ============================================================
// NotificationsPage.jsx — User Notifications
// ============================================================
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  Box, Typography, Paper, Button, Chip, Skeleton, Alert,
  useTheme, useMediaQuery, IconButton, Divider, Badge,
  Accordion, AccordionSummary, AccordionDetails
} from '@mui/material'
import NotificationsIcon from '@mui/icons-material/Notifications'
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead'
import DeleteIcon from '@mui/icons-material/Delete'
import CampaignIcon from '@mui/icons-material/Campaign'
import InfoIcon from '@mui/icons-material/Info'
import WarningIcon from '@mui/icons-material/Warning'
import NewReleasesIcon from '@mui/icons-material/NewReleases'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import axiosInstance from '../utils/axiosInstance'
import { formatUTCDateTime } from '../utils/formatTime'
import { PageWrapper, getColors } from '../components/Layout/SharedLayout'

const typeConfig = {
  info: { icon: InfoIcon, color: '#3b82f6', bg: '#eff6ff' },
  warning: { icon: WarningIcon, color: '#f59e0b', bg: '#fffbeb' },
  announcement: { icon: CampaignIcon, color: '#5312bc', bg: '#f5f3ff' },
  promotion: { icon: NewReleasesIcon, color: '#10b981', bg: '#ecfdf5' },
}

const NotificationsPage = ({ darkMode, toggleDarkMode }) => {
  const { user } = useSelector((state) => state.auth)
  const COLORS = getColors(darkMode)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // all | unread | read
  const [actionLoading, setActionLoading] = useState({})

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const res = await axiosInstance.get('/announcements/')
      setNotifications(res.data.data || [])
      setUnreadCount(res.data.unread_count || 0)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkRead = async (id) => {
    setActionLoading(prev => ({ ...prev, [id]: 'read' }))
    try {
      await axiosInstance.put(`/announcements/${id}/read`)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark as read')
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: null }))
    }
  }

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id)
    if (unreadIds.length === 0) return
    setActionLoading(prev => ({ ...prev, all: 'read' }))
    try {
      await Promise.all(unreadIds.map(id => axiosInstance.put(`/announcements/${id}/read`)))
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() })))
      setUnreadCount(0)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark all as read')
    } finally {
      setActionLoading(prev => ({ ...prev, all: null }))
    }
  }

  const handleHide = async (id) => {
    setActionLoading(prev => ({ ...prev, [id]: 'hide' }))
    try {
      await axiosInstance.delete(`/announcements/${id}`)
      setNotifications(prev => prev.filter(n => n.id !== id))
      if (!notifications.find(n => n.id === id)?.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to hide notification')
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: null }))
    }
  }

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read
    if (filter === 'read') return n.is_read
    return true
  })

  const formatDate = (dateStr) => {
    return dateStr ? formatUTCDateTime(dateStr) : ''
  }

  return (
    <PageWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      {/* Header */}
      <Box sx={{ mb: 3, py:1, px: isMobile ? 1 : 0 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: COLORS.textPrimary, mb: 0.5 }}>
          Notifications
        </Typography>
        <Typography variant="body2" sx={{ color: COLORS.textMuted }}>
          {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'You are all caught up'}
        </Typography>
      </Box>

      {unreadCount > 0 && (
        <Box sx={{ px: isMobile ? 1 : 0, mb: 2 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<MarkEmailReadIcon />}
            onClick={handleMarkAllRead}
            disabled={actionLoading.all === 'read'}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              borderColor: COLORS.primary,
              color: COLORS.primary,
              '&:hover': { bgcolor: `${COLORS.primary}08`, borderColor: COLORS.primaryDark }
            }}
          >
            Mark all as read
          </Button>
        </Box>
      )}

      {/* Filter Chips */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap', px: isMobile ? 1 : 0 }}>
        {[{ key: 'all', label: 'All' }, { key: 'unread', label: 'Unread' }, { key: 'read', label: 'Read' }].map(f => (
          <Button
            key={f.key}
            onClick={() => setFilter(f.key)}
            sx={{
              fontWeight: 600,
              fontSize: '0.8rem',
              borderRadius: 2,
              bgcolor: filter === f.key ? COLORS.primary : darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              color: filter === f.key ? '#fff' : COLORS.textSecondary,
              border: `1px solid ${filter === f.key ? COLORS.primary : COLORS.border}`,
              '&:hover': { bgcolor: filter === f.key ? COLORS.primaryDark : darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }
            }}
          >
            {f.label}
          </Button>
        ))}
      </Box>

      {/* Error */}
      {error && (
        <Box sx={{ px: isMobile ? 1 : 0, mb: 2 }}>
          <Alert severity="error" sx={{ borderRadius: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        </Box>
      )}

      {/* Notifications List */}
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, px: isMobile ? 1 : 0 }}>
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} variant="rounded" height={72} sx={{ borderRadius: 2 }} />
          ))}
        </Box>
      ) : filteredNotifications.length === 0 ? (
        <Box sx={{ px: isMobile ? 1 : 0 }}>
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.border}` }}>
            <NotificationsIcon sx={{ fontSize: 48, color: COLORS.textMuted, mb: 1 }} />
            <Typography sx={{ color: COLORS.textMuted, fontWeight: 600 }}>
              {filter === 'unread' ? 'No unread notifications' : filter === 'read' ? 'No read notifications' : 'No notifications yet'}
            </Typography>
            <Typography variant="body2" sx={{ color: COLORS.textMuted, mt: 0.5 }}>
              {filter === 'unread' ? 'Check back later for new updates' : 'All your notifications will appear here'}
            </Typography>
          </Paper>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, px: isMobile ? 1 : 0 }}>
          {filteredNotifications.map((notif) => {
            const config = typeConfig[notif.type] || typeConfig.info
            const Icon = config.icon
            const isUnread = !notif.is_read

            return (
              <Accordion
                key={notif.id}
                disableGutters
                elevation={0}
                sx={{
                  borderRadius: '12px !important',
                  overflow: 'hidden',
                  bgcolor: COLORS.cardBg,
                  border: `1px solid ${COLORS.border}`,
                  '&:before': { display: 'none' },
                  '&.Mui-expanded': {
                    bgcolor: COLORS.cardBg,
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: COLORS.textMuted, flexShrink: 0 }} />}
                  sx={{
                    py: 1,
                    px: isMobile ? 1.5 : 2,
                    minHeight: '56px !important',
                    '& .MuiAccordionSummary-content': {
                      margin: '6px 0 !important',
                      alignItems: 'center',
                      gap: 1.5,
                      minWidth: 0,
                    },
                  }}
                >
                  {/* Icon */}
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 2,
                      bgcolor: config.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon sx={{ fontSize: 18, color: config.color }} />
                  </Box>

                  {/* Title + Unread badge */}
                  <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                    <Typography
                      sx={{
                        fontWeight: isUnread ? 700 : 600,
                        fontSize: '0.9rem',
                        color: COLORS.textPrimary,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {notif.title}
                      </span>
                      {isUnread && (
                        <Badge
                          variant="dot"
                          sx={{
                            flexShrink: 0,
                            '& .MuiBadge-badge': {
                              bgcolor: COLORS.primary,
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                            },
                          }}
                        />
                      )}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: COLORS.textMuted, fontSize: '0.75rem', display: 'block' }}
                    >
                      {formatDate(notif.created_at)}
                      {notif.is_read && notif.read_at && `  | Read at ${formatDate(notif.read_at)}`}
                    </Typography>
                  </Box>
                </AccordionSummary>

                <AccordionDetails sx={{ px: isMobile ? 1.5 : 2, pb: 2, pt: 0 }}>
                  <Divider sx={{ mb: 1.5, borderColor: COLORS.border }} />

                  {/* Message */}
                  <Typography
                    sx={{
                      color: COLORS.textSecondary,
                      fontSize: '0.85rem',
                      lineHeight: 1.6,
                      mb: 2,
                      wordBreak: 'break-word',
                    }}
                    dangerouslySetInnerHTML={{ __html: notif.message }}
                  />

                  {/* Actions */}
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    {isUnread && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMarkRead(notif.id)
                        }}
                        disabled={actionLoading[notif.id] === 'read'}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          borderRadius: 1.5,
                          borderColor: COLORS.primary,
                          color: COLORS.primary,
                          '&:hover': { bgcolor: `${COLORS.primary}08` },
                        }}
                      >
                        Mark as read
                      </Button>
                    )}
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation()
                        handleHide(notif.id)
                      }}
                      disabled={actionLoading[notif.id] === 'hide'}
                      size="small"
                      sx={{
                        color: COLORS.textMuted,
                        '&:hover': { color: '#ef4444', bgcolor: 'rgba(239,68,68,0.06)' },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </AccordionDetails>
              </Accordion>
            )
          })}
        </Box>
      )}
    </PageWrapper>
  )
}

export default NotificationsPage