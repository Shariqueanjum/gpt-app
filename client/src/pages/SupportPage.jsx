// ============================================================
// SupportPage.jsx — Create & View Support Tickets (v2)
// ============================================================
import { useEffect, useState } from 'react'
import {
  Box, Typography, Paper, Button, TextField, MenuItem, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert,
  Skeleton, Pagination, useTheme, useMediaQuery, CircularProgress,
  Accordion, AccordionSummary, AccordionDetails, IconButton
} from '@mui/material'
import SupportAgentIcon from '@mui/icons-material/SupportAgent'
import AddIcon from '@mui/icons-material/Add'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import ImageIcon from '@mui/icons-material/Image'
import FilterListIcon from '@mui/icons-material/FilterList'
import CloseIcon from '@mui/icons-material/Close'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
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
  open: { bg: '#dbeafe', color: '#2563eb', icon: <AccessTimeIcon sx={{ fontSize: '1rem' }} /> },
  closed: { bg: '#d1fae5', color: '#059669', icon: <CheckCircleIcon sx={{ fontSize: '1rem' }} /> },
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

  // Filters
  const [statusFilter, setStatusFilter] = useState('')

  // Create ticket dialog
  const [createOpen, setCreateOpen] = useState(false)
  const [category, setCategory] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [image, setImage] = useState(null)
  const [imageName, setImageName] = useState('')

  useEffect(() => {
    fetchTickets(1)
  }, [statusFilter])

  const fetchTickets = async (page) => {
    try {
      setLoading(true)
      let url = `/tickets/?page=${page}&limit=10&sort_by=created_at&sort_order=desc`
      if (statusFilter) {
        url += `&status=${statusFilter}`
      }
      const res = await axiosInstance.get(url)
      setTickets(res.data.data || [])
      setMeta(res.data.meta || { page: 1, totalPages: 1, total: 0 })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB')
        return
      }
      const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
      if (!allowed.includes(file.type)) {
        setError('Only JPG, PNG, and WEBP images are allowed')
        return
      }
      setImage(file)
      setImageName(file.name)
      setError(null)
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

      const res = await axiosInstance.post('/tickets/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      const warning = res.data.data?.warning
      if (warning) {
        setSuccess('Ticket created! Note: ' + warning)
      } else {
        setSuccess('Ticket created successfully! Our team will respond soon.')
      }

      setCreateOpen(false)
      setCategory('')
      setSubject('')
      setMessage('')
      setImage(null)
      setImageName('')
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
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  const formatTime = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit'
    })
  }

  const getStatusConfig = (status) => STATUS_CONFIG[status] || STATUS_CONFIG.open

  const clearFilters = () => {
    setStatusFilter('')
  }

  return (
    <PageWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <Box sx={{ maxWidth: 900, mx: 'auto', px: isMobile ? 2 : 0 }}>

        {/* HEADER */}
        <Box sx={{ mb: 3, mt: isMobile ? 1 : 0 }}>
          <Typography sx={{
            fontWeight: 800, fontSize: isMobile ? '1.3rem' : '1.6rem',
            color: COLORS.textPrimary, mb: 0.5, letterSpacing: '-0.02em'
          }}>
            Support Center
          </Typography>
          <Typography sx={{ fontSize: '0.9rem', color: COLORS.textSecondary }}>
            Create a ticket or view your past requests
          </Typography>
        </Box>

        {/* ═══════════════════════════════════════════════════════
            CREATE TICKET CARD — Clean, no top border
        ═══════════════════════════════════════════════════════ */}
        <Paper sx={{
          p: isMobile ? 2.5 : 3,
          borderRadius: 3, mb: 3,
          bgcolor: COLORS.cardBg,
          border: `1px solid ${COLORS.border}`,
          background: `linear-gradient(135deg, ${COLORS.primary}12 0%, ${COLORS.primary}03 100%)`,
        }}>
          <Box sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: isMobile ? 2 : 3,
          }}>
            <Box sx={{
              width: 56, height: 56, borderRadius: 2.5,
              bgcolor: darkMode ? 'rgba(83,18,188,0.15)' : 'rgba(83,18,188,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: COLORS.primary, flexShrink: 0,
              boxShadow: darkMode
                ? '0 0 20px rgba(83,18,188,0.15)'
                : '0 0 20px rgba(83,18,188,0.08)',
            }}>
              <SupportAgentIcon sx={{ fontSize: '1.8rem' }} />
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography sx={{
                fontWeight: 700, fontSize: '1.05rem', color: COLORS.textPrimary, mb: 0.5
              }}>
                Need Help?
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', color: COLORS.textSecondary, mb: 2 }}>
                Can't find what you're looking for? Create a support ticket and our team will assist you within 24 hours.
              </Typography>
              <Button
                onClick={() => {
                  setCreateOpen(true)
                  setError(null)
                }}
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  bgcolor: COLORS.primary, color: '#fff',
                  fontWeight: 700, textTransform: 'none',
                  borderRadius: 2, px: 3, py: 1.2,
                  boxShadow: `0 4px 14px ${COLORS.primary}40`,
                  '&:hover': { bgcolor: COLORS.primaryDark, boxShadow: `0 6px 20px ${COLORS.primary}50` },
                  transition: 'all 0.2s ease',
                }}
              >
                Create New Ticket
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* TICKET HISTORY */}
        <Paper sx={{
          p: isMobile ? 2 : 3,
          borderRadius: 3,
          bgcolor: COLORS.cardBg,
          border: `1px solid ${COLORS.border}`,
          minHeight: 400,
        }}>
          {/* Header row with styled filter */}
          <Box sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'center',
            justifyContent: 'space-between',
            gap: isMobile ? 1.5 : 2,
            mb: 2.5,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{
                width: 36, height: 36, borderRadius: 2,
                bgcolor: `${COLORS.primary}12`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: COLORS.primary,
              }}>
                <AccessTimeIcon sx={{ fontSize: '1.1rem' }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: COLORS.textPrimary }}>
                  Ticket History
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: COLORS.textMuted }}>
                  {meta.total} total tickets
                </Typography>
              </Box>
            </Box>

            {/* Styled Filter */}
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1,
              px: 1.5, py: 0.6,
              borderRadius: 2,
              bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              border: `1px solid ${COLORS.border}`,
            }}>
              <FilterListIcon sx={{ fontSize: '1rem', color: COLORS.primary }} />
              <TextField
                select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                size="small"
                variant="standard"
                InputProps={{ disableUnderline: true }}
                sx={{
                  minWidth: 110,
                  '& .MuiInput-root': {
                    fontSize: '0.85rem', fontWeight: 600, color: COLORS.textPrimary,
                    '&:before, &:after': { display: 'none' },
                  },
                  '& .MuiSelect-select': { py: 0.3, pr: '24px !important' },
                  '& .MuiSvgIcon-root': { color: COLORS.textMuted, right: 0 },
                }}
              >
                <MenuItem value="" sx={{ fontSize: '0.85rem' }}>All Tickets</MenuItem>
                <MenuItem value="open" sx={{ fontSize: '0.85rem' }}>Open</MenuItem>
                <MenuItem value="closed" sx={{ fontSize: '0.85rem' }}>Closed</MenuItem>
              </TextField>
              {statusFilter && (
                <IconButton onClick={clearFilters} size="small" sx={{ color: COLORS.textMuted, p: 0.3 }}>
                  <CloseIcon sx={{ fontSize: '0.9rem' }} />
                </IconButton>
              )}
            </Box>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[1, 2, 3].map(i => (
                <Skeleton key={i} variant="rounded" height={60} sx={{ borderRadius: 2 }} />
              ))}
            </Box>
          ) : tickets.length === 0 ? (
            <Box sx={{
              textAlign: 'center', py: 6, borderRadius: 2,
              bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
              border: `1px dashed ${COLORS.border}`,
            }}>
              <SupportAgentIcon sx={{ fontSize: '2.5rem', color: COLORS.textMuted, mb: 1.5, opacity: 0.5 }} />
              <Typography sx={{ color: COLORS.textSecondary, fontWeight: 600, fontSize: '0.95rem', mb: 0.5 }}>
                No tickets yet
              </Typography>
              <Typography sx={{ color: COLORS.textMuted, fontSize: '0.8rem' }}>
                Create a ticket if you need help with anything
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              {tickets.map((ticket) => {
                const statusCfg = getStatusConfig(ticket.status)
                return (
                  <Accordion
                    key={ticket.id}
                    sx={{
                      bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: '12px !important',
                      '&:before': { display: 'none' },
                      '&.Mui-expanded': { margin: 0 },
                      overflow: 'hidden',
                      transition: 'all 0.2s',
                      '&:hover': { borderColor: `${COLORS.primary}30` },
                    }}
                    disableGutters
                    elevation={0}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: COLORS.textMuted }} />}
                      sx={{
                        py: isMobile ? 0.8 : 1,
                        px: isMobile ? 1.5 : 2,
                        minHeight: '48px !important',
                        '& .MuiAccordionSummary-content': {
                          margin: '6px 0 !important',
                          alignItems: 'center',
                          gap: 1.5,
                        }
                      }}
                    >
                      <Chip
                        size="small"
                        icon={statusCfg.icon}
                        label={ticket.status?.replace(/_/g, ' ')}
                        sx={{
                          bgcolor: statusCfg.bg,
                          color: statusCfg.color,
                          fontWeight: 700, fontSize: '0.7rem', textTransform: 'capitalize',
                          height: 24, flexShrink: 0,
                          '& .MuiChip-icon': { ml: '4px', fontSize: '0.85rem' },
                        }}
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{
                          fontWeight: 700, fontSize: '0.88rem', color: COLORS.textPrimary,
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                        }}>
                          {ticket.subject}
                        </Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: COLORS.textMuted }}>
                          #{ticket.id} · {ticket.category?.replace(/_/g, ' ')} · {formatDate(ticket.created_at)}
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: isMobile ? 1.5 : 2, pb: 2, pt: 0 }}>
                      <Box sx={{ mb: 2 }}>
                        <Typography sx={{
                          fontSize: '0.75rem', color: COLORS.textMuted,
                          fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.8
                        }}>
                          Your Message
                        </Typography>
                        <Typography sx={{ fontSize: '0.85rem', color: COLORS.textSecondary, lineHeight: 1.6,  fontWeight: 500 }}>
                          {ticket.message}
                        </Typography>
                      </Box>

                      {ticket.image_url && (
                        <Box sx={{ mb: 2 }}>
                          <Typography sx={{
                            fontSize: '0.75rem', color: COLORS.textMuted,
                            fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.8
                          }}>
                            Attachment
                          </Typography>
                          <Box
                            component="img"
                            src={ticket.image_url}
                            alt="Ticket attachment"
                            sx={{
                              maxWidth: '100%', maxHeight: 200, borderRadius: 2,
                              border: `1px solid ${COLORS.border}`,
                            }}
                          />
                        </Box>
                      )}

                      {ticket.admin_response && (
                        <Box sx={{
                          p: 2, borderRadius: 2,
                          bgcolor: darkMode ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.04)',
                          border: `1px solid ${darkMode ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)'}`,
                          mb: 1,
                        }}>
                          <Typography sx={{
                            fontSize: '0.75rem', color: COLORS.accent,
                            fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.8
                          }}>
                            Admin Response
                          </Typography>
                          <Typography sx={{ fontSize: '0.85rem', color: COLORS.textSecondary, lineHeight: 1.6, fontWeight: 500 }}>
                            {ticket.admin_response}
                          </Typography>
                          {ticket.updated_at && (
                            <Typography sx={{ fontSize: '0.7rem', color: COLORS.textMuted, mt: 1 }}>
                              Responded on {formatDate(ticket.updated_at)} at {formatTime(ticket.updated_at)}
                            </Typography>
                          )}
                        </Box>
                      )}

                      {!ticket.admin_response && ticket.status === 'open' && (
                        <Typography sx={{
                          fontSize: '0.8rem', color: COLORS.textMuted, fontStyle: 'italic',fontWeight: 500
                        }}>
                          Our support team will respond to your ticket soon.
                        </Typography>
                      )}
                    </AccordionDetails>
                  </Accordion>
                )
              })}
            </Box>
          )}

          {meta.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2.5 }}>
              <Pagination
                count={meta.totalPages}
                page={meta.page}
                onChange={(_, page) => fetchTickets(page)}
                color="primary"
                size="small"
                sx={{
                  '& .MuiPaginationItem-root': { color: COLORS.textSecondary, fontSize: '0.8rem', fontWeight: 600 },
                  '& .Mui-selected': {
                    bgcolor: `${COLORS.primary} !important`,
                    color: '#fff !important', fontWeight: 700,
                  }
                }}
              />
            </Box>
          )}
        </Paper>

        {/* CREATE TICKET DIALOG */}
        <Dialog
          open={createOpen}
          onClose={() => {
            if (!submitting) {
              setCreateOpen(false)
              setError(null)
              setImage(null)
              setImageName('')
            }
          }}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3, bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.border}` }
          }}
        >
          <DialogTitle sx={{
            color: COLORS.textPrimary, fontWeight: 800,
            fontSize: '1.15rem', pt: 3, px: 3, pb: 1
          }}>
            Create Support Ticket
          </DialogTitle>
          <DialogContent sx={{ px: 3, pb: 1 }}>
            {error && (
              <Alert severity="error" sx={{ borderRadius: 2, mb: 2, fontSize: '0.85rem' }}
                onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.2 }}>
              <Box>
                <Typography sx={{
                  fontSize: '0.75rem', color: COLORS.textMuted,
                  fontWeight: 600, mb: 0.8, textTransform: 'uppercase', letterSpacing: '0.06em'
                }}>
                  Category <Typography component="span" sx={{ color: COLORS.danger }}>*</Typography>
                </Typography>
                <TextField
                  select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  fullWidth
                  size="small"
                  placeholder="Select a category"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                      fontSize: '0.9rem', fontWeight: 600, color: COLORS.textPrimary,
                    }
                  }}
                >
                  {TICKET_CATEGORIES.map(c => (
                    <MenuItem key={c.value} value={c.value} sx={{ fontSize: '0.9rem' }}>
                      {c.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <Box>
                <Typography sx={{
                  fontSize: '0.75rem', color: COLORS.textMuted,
                  fontWeight: 600, mb: 0.8, textTransform: 'uppercase', letterSpacing: '0.06em'
                }}>
                  Subject <Typography component="span" sx={{ color: COLORS.danger }}>*</Typography>
                </Typography>
                <TextField
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  fullWidth
                  size="small"
                  placeholder="Brief description of your issue"
                  inputProps={{ maxLength: 200 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                      fontSize: '0.9rem', fontWeight: 500, color: COLORS.textPrimary,
                    }
                  }}
                />
                <Typography sx={{ fontSize: '0.7rem', color: COLORS.textMuted, mt: 0.5, textAlign: 'right' }}>
                  {subject.length}/200
                </Typography>
              </Box>

              <Box>
                <Typography sx={{
                  fontSize: '0.75rem', color: COLORS.textMuted,
                  fontWeight: 600, mb: 0.8, textTransform: 'uppercase', letterSpacing: '0.06em'
                }}>
                  Message <Typography component="span" sx={{ color: COLORS.danger }}>*</Typography>
                </Typography>
                <TextField
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  fullWidth
                  size="small"
                  multiline
                  rows={4}
                  placeholder="Describe your issue in detail..."
                  inputProps={{ maxLength: 2000 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                      fontSize: '0.9rem', fontWeight: 500, color: COLORS.textPrimary,
                      alignItems: 'flex-start',
                    }
                  }}
                />
                <Typography sx={{ fontSize: '0.7rem', color: COLORS.textMuted, mt: 0.5, textAlign: 'right' }}>
                  {message.length}/2000
                </Typography>
              </Box>

              <Box>
                <Typography sx={{
                  fontSize: '0.75rem', color: COLORS.textMuted,
                  fontWeight: 600, mb: 0.8, textTransform: 'uppercase', letterSpacing: '0.06em'
                }}>
                  Attachment (Optional)
                </Typography>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<ImageIcon />}
                  sx={{
                    color: COLORS.textSecondary,
                    borderColor: COLORS.border,
                    borderRadius: 2, textTransform: 'none', fontWeight: 600,
                    '&:hover': { borderColor: COLORS.primary, color: COLORS.primary },
                  }}
                >
                  {imageName || 'Upload Image'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    hidden
                    onChange={handleImageChange}
                  />
                </Button>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.8 }}>
                  <WarningAmberIcon sx={{ fontSize: '0.75rem', color: COLORS.gold }} />
                  <Typography sx={{ fontSize: '0.7rem', color: COLORS.textMuted }}>
                    Max 3 images per 30 days. Max 5MB. JPG/PNG/WEBP only.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
            <Button
              onClick={() => {
                setCreateOpen(false)
                setError(null)
                setImage(null)
                setImageName('')
              }}
              disabled={submitting}
              sx={{
                color: COLORS.textSecondary, textTransform: 'none', fontWeight: 600,
                borderRadius: 2, px: 2,
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateTicket}
              disabled={submitting || !category || !subject.trim() || !message.trim()}
              variant="contained"
              sx={{
                bgcolor: COLORS.primary, color: '#fff',
                textTransform: 'none', fontWeight: 700,
                borderRadius: 2, px: 3,
                boxShadow: `0 4px 12px ${COLORS.primary}40`,
                '&:hover': { bgcolor: COLORS.primaryDark },
                '&:disabled': { bgcolor: COLORS.textMuted, color: '#fff' },
              }}
            >
              {submitting ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Submit Ticket'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Success Snackbar */}
        {success && (
          <Alert severity="success" sx={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
            borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            maxWidth: 400,
          }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}
      </Box>
    </PageWrapper>
  )
}

export default SupportPage