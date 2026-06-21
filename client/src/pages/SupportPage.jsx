// ============================================================
// SupportPage.jsx — Create & View Support Tickets
// ============================================================
import { useEffect, useState } from 'react'
import {
  Box, Typography, Paper, Button, TextField, MenuItem, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert,
  Skeleton, Pagination, useTheme, useMediaQuery, CircularProgress,
  Accordion, AccordionSummary, AccordionDetails
} from '@mui/material'
import SupportAgentIcon from '@mui/icons-material/SupportAgent'
import AddIcon from '@mui/icons-material/Add'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import ImageIcon from '@mui/icons-material/Image'
import axiosInstance from '../utils/axiosInstance'
import { PageWrapper, getColors } from '../components/Layout/SharedLayout'

const TICKET_CATEGORIES = [
  { value: 'payment_issue', label: 'Payment Issue' },
  { value: 'account_problem', label: 'Account Problem' },
  { value: 'survey_problem', label: 'Survey Problem' },
  { value: 'withdrawal_issue', label: 'Withdrawal Issue' },
  { value: 'referral_issue', label: 'Referral Issue' },
  { value: 'bug_report', label: 'Bug Report' },
  { value: 'feature_request', label: 'Feature Request' },
  { value: 'other', label: 'Other' },
]

const STATUS_CONFIG = {
  open: { bg: '#dbeafe', color: '#2563eb', icon: <AccessTimeIcon sx={{ fontSize: '0.9rem' }} /> },
  in_progress: { bg: '#fef3c7', color: '#d97706', icon: <AccessTimeIcon sx={{ fontSize: '0.9rem' }} /> },
  resolved: { bg: '#d1fae5', color: '#059669', icon: <CheckCircleIcon sx={{ fontSize: '0.9rem' }} /> },
  closed: { bg: '#f3f4f6', color: '#6b7280', icon: <CancelIcon sx={{ fontSize: '0.9rem' }} /> },
}

const SupportPage = ({ darkMode, toggleDarkMode }) => {
  const COLORS = getColors(darkMode)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const [tickets, setTickets] = useState([])
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Create ticket dialog
  const [createOpen, setCreateOpen] = useState(false)
  const [category, setCategory] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [image, setImage] = useState(null)

  useEffect(() => {
    fetchTickets(1)
  }, [])

  const fetchTickets = async (page) => {
    try {
      setLoading(true)
      const res = await axiosInstance.get(`/tickets/?page=${page}&limit=10&sort_by=created_at&sort_order=desc`)
      setTickets(res.data.data || [])
      setMeta(res.data.meta || { page: 1, totalPages: 1, total: 0 })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTicket = async () => {
    if (!category || !subject.trim() || !message.trim()) {
      setError('Please fill all required fields')
      return
    }
    if (subject.trim().length < 5) {
      setError('Subject must be at least 5 characters')
      return
    }
    if (message.trim().length < 10) {
      setError('Message must be at least 10 characters')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const formData = new FormData()
      formData.append('category', category)
      formData.append('subject', subject.trim())
      formData.append('message', message.trim())
      if (image) {
        formData.append('image', image)
      }

      await axiosInstance.post('/tickets/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setSuccess('Ticket created successfully! Our team will respond soon.')
      setCreateOpen(false)
      setCategory('')
      setSubject('')
      setMessage('')
      setImage(null)
      fetchTickets(1)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create ticket')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  const getStatusConfig = (status) => STATUS_CONFIG[status] || STATUS_CONFIG.open

  return (
    <PageWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <Box sx={{ maxWidth: 900, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1
        }}>
          <Box>
            <Typography sx={{
              fontWeight: 800, fontSize: '1.4rem', color: COLORS.textPrimary, mb: 0.5
            }}>
              Support
            </Typography>
            <Typography sx={{ fontSize: '0.9rem', color: COLORS.textSecondary }}>
              Create a ticket or view your past requests
            </Typography>
          </Box>
          <Button
            onClick={() => setCreateOpen(true)}
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              bgcolor: COLORS.primary, color: '#fff',
              fontWeight: 700, textTransform: 'none', borderRadius: 2,
              '&:hover': { bgcolor: COLORS.primaryDark },
              boxShadow: 'none',
            }}
          >
            New Ticket
          </Button>
        </Box>

        {/* Tickets List */}
        <Paper sx={{
          p: { xs: 2, md: 3 }, borderRadius: 3,
          bgcolor: COLORS.cardBg,
          border: `1px solid ${COLORS.border}`,
        }}>
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={80} sx={{ borderRadius: 2 }} />)}
            </Box>
          ) : tickets.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <SupportAgentIcon sx={{ fontSize: '3rem', color: COLORS.textMuted, mb: 1 }} />
              <Typography sx={{ color: COLORS.textSecondary, fontWeight: 600 }}>
                No tickets yet
              </Typography>
              <Typography sx={{ color: COLORS.textMuted, fontSize: '0.85rem', mt: 0.5 }}>
                Create a ticket if you need help with anything
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {tickets.map((ticket) => {
                const statusCfg = getStatusConfig(ticket.status)
                return (
                  <Accordion key={ticket.id} sx={{
                    borderRadius: '12px !important',
                    bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                    border: `1px solid ${COLORS.border}`,
                    '&:before': { display: 'none' },
                    overflow: 'hidden',
                  }}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: COLORS.textSecondary }} />}
                      sx={{ borderRadius: 2 }}
                    >
                      <Box sx={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        width: '100%', pr: 2, flexWrap: 'wrap', gap: 1
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                          <Box sx={{
                            width: 36, height: 36, borderRadius: 1.5,
                            bgcolor: statusCfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: statusCfg.color, flexShrink: 0
                          }}>
                            {statusCfg.icon}
                          </Box>
                          <Box>
                            <Typography sx={{
                              fontWeight: 700, fontSize: '0.92rem', color: COLORS.textPrimary
                            }}>
                              {ticket.subject}
                            </Typography>
                            <Typography sx={{ fontSize: '0.75rem', color: COLORS.textMuted }}>
                              #{ticket.id} · {ticket.category?.replace(/_/g, ' ')} · {formatDate(ticket.created_at)}
                            </Typography>
                          </Box>
                        </Box>
                        <Chip size="small" label={ticket.status?.replace(/_/g, ' ')} sx={{
                          bgcolor: statusCfg.bg, color: statusCfg.color,
                          fontWeight: 700, fontSize: '0.7rem', textTransform: 'capitalize',
                          flexShrink: 0
                        }} />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 3, pb: 2 }}>
                      <Box sx={{ mb: 2 }}>
                        <Typography sx={{
                          fontWeight: 700, fontSize: '0.85rem', color: COLORS.textPrimary, mb: 0.5
                        }}>
                          Your Message:
                        </Typography>
                        <Typography sx={{ fontSize: '0.85rem', color: COLORS.textSecondary, lineHeight: 1.6 }}>
                          {ticket.message}
                        </Typography>
                      </Box>

                      {ticket.image_url && (
                        <Box sx={{ mb: 2 }}>
                          <Typography sx={{
                            fontWeight: 700, fontSize: '0.85rem', color: COLORS.textPrimary, mb: 0.5
                          }}>
                            Attachment:
                          </Typography>
                          <Box
                            component="img"
                            src={ticket.image_url}
                            alt="Ticket attachment"
                            sx={{
                              maxWidth: '100%', maxHeight: 300, borderRadius: 2,
                              border: `1px solid ${COLORS.border}`
                            }}
                          />
                        </Box>
                      )}

                      {ticket.admin_response && (
                        <Box sx={{
                          p: 2, borderRadius: 2,
                          bgcolor: `${COLORS.primary}06`,
                          border: `1px solid ${COLORS.primary}15`,
                        }}>
                          <Typography sx={{
                            fontWeight: 700, fontSize: '0.85rem', color: COLORS.primary, mb: 0.5
                          }}>
                            Admin Response:
                          </Typography>
                          <Typography sx={{ fontSize: '0.85rem', color: COLORS.textSecondary, lineHeight: 1.6 }}>
                            {ticket.admin_response}
                          </Typography>
                          {ticket.responded_at && (
                            <Typography sx={{ fontSize: '0.72rem', color: COLORS.textMuted, mt: 0.5 }}>
                              Responded on {formatDate(ticket.responded_at)}
                            </Typography>
                          )}
                        </Box>
                      )}

                      {!ticket.admin_response && ticket.status === 'open' && (
                        <Alert severity="info" sx={{ borderRadius: 2, fontSize: '0.82rem' }}>
                          Our support team will respond to your ticket soon.
                        </Alert>
                      )}
                    </AccordionDetails>
                  </Accordion>
                )
              })}
            </Box>
          )}

          {meta.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={meta.totalPages}
                page={meta.page}
                onChange={(_, page) => fetchTickets(page)}
                color="primary"
                size="small"
                sx={{ '& .MuiPaginationItem-root': { color: COLORS.textSecondary } }}
              />
            </Box>
          )}
        </Paper>

        {/* Create Ticket Dialog */}
        <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth PaperProps={{
          sx: { borderRadius: 3, bgcolor: COLORS.cardBg }
        }}>
          <DialogTitle sx={{ color: COLORS.textPrimary, fontWeight: 700 }}>
            Create Support Ticket
          </DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ borderRadius: 2, mb: 2, fontSize: '0.82rem' }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
              <TextField
                select label="Category *" value={category}
                onChange={(e) => setCategory(e.target.value)}
                fullWidth size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  }
                }}
              >
                {TICKET_CATEGORIES.map(c => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
              </TextField>

              <TextField
                label="Subject *" value={subject}
                onChange={(e) => setSubject(e.target.value)}
                fullWidth size="small" placeholder="Brief description of your issue"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  }
                }}
              />

              <TextField
                label="Message *" value={message}
                onChange={(e) => setMessage(e.target.value)}
                fullWidth size="small" multiline rows={4}
                placeholder="Describe your issue in detail..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  }
                }}
              />

              <Button
                component="label"
                variant="outlined"
                startIcon={<ImageIcon />}
                sx={{
                  borderColor: COLORS.border, color: COLORS.textSecondary,
                  textTransform: 'none', fontWeight: 600, borderRadius: 2,
                  '&:hover': { borderColor: COLORS.primary, color: COLORS.primary }
                }}
              >
                {image ? image.name : 'Attach Screenshot (optional)'}
                <input
                  type="file"
                  hidden
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={(e) => setImage(e.target.files[0])}
                />
              </Button>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setCreateOpen(false)} sx={{
              color: COLORS.textSecondary, textTransform: 'none', fontWeight: 600
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateTicket}
              disabled={submitting || !category || !subject.trim() || !message.trim()}
              variant="contained"
              sx={{
                bgcolor: COLORS.primary, color: '#fff', textTransform: 'none', fontWeight: 700,
                borderRadius: 2, '&:hover': { bgcolor: COLORS.primaryDark },
                '&:disabled': { bgcolor: COLORS.textMuted }
              }}
            >
              {submitting ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Submit Ticket'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Success Snackbar-ish */}
        {success && (
          <Alert severity="success" sx={{
            position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
            borderRadius: 2, zIndex: 9999, boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            fontSize: '0.85rem', fontWeight: 600
          }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}
      </Box>
    </PageWrapper>
  )
}

export default SupportPage