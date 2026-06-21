// ============================================================
// AdminDashboardPage.jsx — Admin Overview / Stats
// ============================================================
import { useEffect, useState } from 'react'
import {
  Box, Typography, Paper, Skeleton, Grid
} from '@mui/material'
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import SupportAgentIcon from '@mui/icons-material/SupportAgent'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import ReceiptIcon from '@mui/icons-material/Receipt'
import axiosInstance from '../../utils/axiosInstance'
import { AdminPageWrapper } from '../../components/Layout/AdminLayout'
import { getColors } from '../../components/Layout/SharedLayout'

const StatCard = ({ icon: Icon, label, value, color, darkMode }) => {
  const COLORS = getColors(darkMode)
  return (
    <Paper sx={{
      p: 3, borderRadius: 3,
      bgcolor: COLORS.cardBg,
      border: `1px solid ${COLORS.border}`,
      transition: 'all 0.2s ease',
      '&:hover': {
        boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
        transform: 'translateY(-2px)',
      },
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{
          width: 48, height: 48, borderRadius: 2,
          bgcolor: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: color
        }}>
          <Icon sx={{ fontSize: '1.5rem' }} />
        </Box>
        <Box>
          <Typography sx={{
            fontWeight: 800, fontSize: '1.6rem', color: COLORS.textPrimary
          }}>
            {value}
          </Typography>
          <Typography sx={{ fontSize: '0.82rem', color: COLORS.textSecondary }}>
            {label}
          </Typography>
        </Box>
      </Box>
    </Paper>
  )
}

const AdminDashboardPage = ({ darkMode, toggleDarkMode }) => {
  const COLORS = getColors(darkMode)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const res = await axiosInstance.get('/admin/stats')
      setStats(res.data.data || {})
    } catch (err) {
      try {
        const [usersRes, withdrawalsRes, ticketsRes] = await Promise.all([
          axiosInstance.get('/admin/users?page=1&limit=1'),
          axiosInstance.get('/admin/withdrawals?page=1&limit=1'),
          axiosInstance.get('/admin/tickets?page=1&limit=1'),
        ])
        setStats({
          total_users: usersRes.data.meta?.total || 0,
          total_withdrawals: withdrawalsRes.data.meta?.total || 0,
          pending_withdrawals: 0,
          total_tickets: ticketsRes.data.meta?.total || 0,
          open_tickets: 0,
        })
      } catch {
        setError('Failed to load admin stats')
      }
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (val) => {
    if (val === undefined || val === null) return '0'
    return val.toLocaleString()
  }

  return (
    <AdminPageWrapper darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <Box sx={{ maxWidth: 1200 }}>
        <Typography sx={{
          fontWeight: 800, fontSize: '1.3rem', color: COLORS.textPrimary, mb: 3
        }}>
          Overview
        </Typography>

        {loading ? (
          <Grid container spacing={2.5}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Skeleton variant="rounded" height={100} sx={{ borderRadius: 3 }} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                icon={PeopleAltIcon}
                label="Total Users"
                value={formatNumber(stats?.total_users)}
                color="#2563eb"
                darkMode={darkMode}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                icon={MonetizationOnIcon}
                label="Total Withdrawals"
                value={formatNumber(stats?.total_withdrawals)}
                color="#10b981"
                darkMode={darkMode}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                icon={TrendingUpIcon}
                label="Pending Withdrawals"
                value={formatNumber(stats?.pending_withdrawals)}
                color="#f59e0b"
                darkMode={darkMode}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                icon={SupportAgentIcon}
                label="Open Tickets"
                value={formatNumber(stats?.open_tickets)}
                color="#ec4899"
                darkMode={darkMode}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                icon={LocalOfferIcon}
                label="Total Offer Walls"
                value={formatNumber(stats?.total_offer_walls)}
                color="#14b8a6"
                darkMode={darkMode}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                icon={ReceiptIcon}
                label="Total Transactions"
                value={formatNumber(stats?.total_transactions)}
                color="#7c3aed"
                darkMode={darkMode}
              />
            </Grid>
          </Grid>
        )}

        <Typography sx={{
          fontWeight: 800, fontSize: '1.1rem', color: COLORS.textPrimary, mt: 4, mb: 2
        }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{
              p: 2.5, borderRadius: 3, cursor: 'pointer',
              bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.border}`,
              transition: 'all 0.2s',
              '&:hover': { borderColor: `${COLORS.primary}40`, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }
            }}>
              <Typography sx={{ fontWeight: 700, color: COLORS.primary, fontSize: '0.9rem' }}>
                Manage Users
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: COLORS.textSecondary, mt: 0.5 }}>
                View and manage all registered users
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{
              p: 2.5, borderRadius: 3, cursor: 'pointer',
              bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.border}`,
              transition: 'all 0.2s',
              '&:hover': { borderColor: `${COLORS.primary}40`, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }
            }}>
              <Typography sx={{ fontWeight: 700, color: COLORS.primary, fontSize: '0.9rem' }}>
                Review Withdrawals
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: COLORS.textSecondary, mt: 0.5 }}>
                Approve or reject withdrawal requests
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{
              p: 2.5, borderRadius: 3, cursor: 'pointer',
              bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.border}`,
              transition: 'all 0.2s',
              '&:hover': { borderColor: `${COLORS.primary}40`, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }
            }}>
              <Typography sx={{ fontWeight: 700, color: COLORS.primary, fontSize: '0.9rem' }}>
                Support Tickets
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: COLORS.textSecondary, mt: 0.5 }}>
                Respond to user support requests
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{
              p: 2.5, borderRadius: 3, cursor: 'pointer',
              bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.border}`,
              transition: 'all 0.2s',
              '&:hover': { borderColor: `${COLORS.primary}40`, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }
            }}>
              <Typography sx={{ fontWeight: 700, color: COLORS.primary, fontSize: '0.9rem' }}>
                Offer Walls
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: COLORS.textSecondary, mt: 0.5 }}>
                Configure offer wall integrations
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </AdminPageWrapper>
  )
}

export default AdminDashboardPage