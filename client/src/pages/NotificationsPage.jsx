// ============================================================
// NotificationsPage.jsx — User Notifications
// ============================================================
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  Box, Typography, Paper, Button, Chip, Skeleton, Alert,
  useTheme, useMediaQuery, IconButton, Divider, Badge
} from '@mui/material'
import NotificationsIcon from '@mui/icons-material/Notifications'
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead'
import DeleteIcon from '@mui/icons-material/Delete'
import CampaignIcon from '@mui/icons-material/Campaign'
import InfoIcon from '@mui/icons-material/Info'
import WarningIcon from '@mui/icons-material/Warning'
import NewReleasesIcon from '@mui/icons-material/NewReleases'
import axiosInstance from '../utils/axiosInstance'
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
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <PageWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <Box sx={{ maxWidth: 900, mx: 'auto', px: isMobile ? 2 : 0 }}>
        {/* Header */}
        <Box sx={{ mb: 3, mt: isMobile ? 1 : 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.4rem', color: COLORS.textPrimary, mb: 0.5 }}>
              Notifications
            </Typography>
            <Typography sx={{ fontSize: '0.9rem', color: COLORS.textSecondary }}>
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'You are all caught up'}
            </Typography>
          </Box>
          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllRead}
              disabled={actionLoading.all === 'read'}
              startIcon={<MarkEmailReadIcon />}
              variant="outlined"
              sx={{
                borderColor: COLORS.primary,
                color: COLORS.primary,
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: 2,
                fontSize: '0.85rem',
                '&:hover': { bgcolor: `${COLORS.primary}08`, borderColor: COLORS.primaryDark }
              }}
            >
              {actionLoading.all === 'read' ? 'Marking...' : 'Mark all read'}
            </Button>
          )}
        </Box>

        {/* Filter Chips */}
        <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
          {[{ key: 'all', label: 'All' }, { key: 'unread', label: 'Unread' }, { key: 'read', label: 'Read' }].map(f => (
            <Chip
              key={f.key}
              label={f.label}
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
            />
          ))}
        </Box>

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ borderRadius: 2, mb: 2, fontSize: '0.85rem' }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Notifications List */}
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} variant="rounded" height={80} sx={{ borderRadius: 3 }} />
            ))}
          </Box>
        ) : filteredNotifications.length === 0 ? (
          <Paper sx={{
            p: isMobile ? 3 : 5,
            borderRadius: 3,
            bgcolor: COLORS.cardBg,
            border: `1px solid ${COLORS.border}`,
            textAlign: 'center'
          }}>
            <NotificationsIcon sx={{ fontSize: '3rem', color: COLORS.textMuted, mb: 1.5 }} />
            <Typography sx={{ color: COLORS.textSecondary, fontWeight: 600, mb: 0.5 }}>
              {filter === 'unread' ? 'No unread notifications' : filter === 'read' ? 'No read notifications' : 'No notifications yet'}
            </Typography>
            <Typography sx={{ color: COLORS.textMuted, fontSize: '0.85rem' }}>
              {filter === 'unread' ? 'Check back later for new updates' : 'All your notifications will appear here'}
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {filteredNotifications.map((notif) => {
              const config = typeConfig[notif.type] || typeConfig.info
              const Icon = config.icon
              const isUnread = !notif.is_read

              return (
                <Paper
                  key={notif.id}
                  sx={{
                    p: isMobile ? 2 : 2.5,
                    px: isMobile ? 2 : 3,
                    borderRadius: 3,
                    bgcolor: isUnread ? (darkMode ? 'rgba(83,18,188,0.06)' : config.bg) : COLORS.cardBg,
                    border: `1px solid ${isUnread ? `${COLORS.primary}20` : COLORS.border}`,
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Unread indicator bar */}
                  {isUnread && (
                    <Box sx={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 4,
                      bgcolor: COLORS.primary,
                      borderRadius: '3px 0 0 3px'
                    }} />
                  )}

                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    {/* Icon */}
                    <Box sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: `${config.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: config.color,
                      flexShrink: 0,
                      mt: 0.3
                    }}>
                      <Icon sx={{ fontSize: '1.3rem' }} />
                    </Box>

                    {/* Content */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                        <Typography sx={{
                          fontWeight: isUnread ? 700 : 600,
                          fontSize: '0.95rem',
                          color: COLORS.textPrimary,
                          lineHeight: 1.3
                        }}>
                          {notif.title}
                        </Typography>
                        {isUnread && (
                          <Chip
                            label="New"
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              bgcolor: `${COLORS.primary}15`,
                              color: COLORS.primary,
                              borderRadius: 1
                            }}
                          />
                        )}
                      </Box>
                      <Typography sx={{
                        fontSize: '0.85rem',
                        color: COLORS.textSecondary,
                        lineHeight: 1.5,
                        mb: 1,
                        wordBreak: 'break-word'
                      }}>
                        {notif.content}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                        <Typography sx={{ fontSize: '0.75rem', color: COLORS.textMuted }}>
                          {formatDate(notif.created_at)}
                          {notif.is_read && notif.read_at && ` • Read ${formatDate(notif.read_at)}`}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {isUnread && (
                            <Button
                              onClick={() => handleMarkRead(notif.id)}
                              disabled={actionLoading[notif.id] === 'read'}
                              size="small"
                              startIcon={<MarkEmailReadIcon sx={{ fontSize: '0.9rem' }} />}
                              sx={{
                                color: COLORS.primary,
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                textTransform: 'none',
                                borderRadius: 1.5,
                                py: 0.3,
                                px: 1,
                                '&:hover': { bgcolor: `${COLORS.primary}08` }
                              }}
                            >
                              {actionLoading[notif.id] === 'read' ? '...' : 'Mark read'}
                            </Button>
                          )}
                          <IconButton
                            onClick={() => handleHide(notif.id)}
                            disabled={actionLoading[notif.id] === 'hide'}
                            size="small"
                            sx={{
                              color: COLORS.textMuted,
                              '&:hover': { color: '#ef4444', bgcolor: 'rgba(239,68,68,0.06)' }
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: '1rem' }} />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              )
            })}
          </Box>
        )}
      </Box>
    </PageWrapper>
  )
}

export default NotificationsPage