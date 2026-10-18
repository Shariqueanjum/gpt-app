import { useState, useEffect, useCallback } from 'react'
import { Drawer, Box, Typography, Avatar, IconButton, Tabs, Tab, Skeleton, Button, useTheme, useMediaQuery } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import RefreshIcon from '@mui/icons-material/Refresh'
import { getColors } from '../../Layout/SharedLayout'
import { ErrorState } from '../AdminUiKit'
import useUserOverview from './useUserOverview'
import UserProfileSection from './UserProfileSection'
import MoneySummary from './MoneySummary'
import ProviderBreakdown from './ProviderBreakdown'
import SectionCard from './SectionCard'
import HistoryTab from './HistoryTab'
import LockedBalanceDialog from './LockedBalanceDialog'
import { HISTORY_TABS } from './userHistoryConfigs'

/**
 * Everything about ONE user, money first:
 *  profile -> earnings summary -> where the money is -> providers -> histories (tabs)
 * Same props as the old drawer so Users and Traffic Logs pages keep working.
 */
const AdminUserDetailDrawer = ({ userId, open, onClose, darkMode, onBanUnban }) => {
  const COLORS = getColors(darkMode)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  // Clicking a referrer / referred user opens that person; Back returns.
  const [stack, setStack] = useState([])
  const currentId = stack.length ? stack[stack.length - 1] : userId

  const [activeTab, setActiveTab] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)
  const [lockedOpen, setLockedOpen] = useState(false)

  const { data: overview, loading, error, reload } = useUserOverview(currentId, open)

  useEffect(() => {
    if (open) { setStack([]); setActiveTab(0); setRefreshKey(0) }
  }, [open, userId])

  useEffect(() => { setActiveTab(0) }, [currentId])

  const openUser = useCallback((id) => { if (id) setStack((s) => [...s, id]) }, [])
  const goBack = () => setStack((s) => s.slice(0, -1))

  // After unlock / undo: refresh the numbers AND every table
  const handleBalanceChanged = useCallback(() => {
    reload(true)
    setRefreshKey((k) => k + 1)
  }, [reload])

  const refreshAll = () => { reload(true); setRefreshKey((k) => k + 1) }

  const user = overview?.user
  const config = HISTORY_TABS[activeTab]

  return (
    <Drawer anchor="right" open={open} onClose={onClose}
      PaperProps={{ sx: { width: isMobile ? '100%' : 'min(1100px, 96vw)', bgcolor: COLORS.bg, borderLeft: `1px solid ${COLORS.border}`, overflow: 'hidden' } }}>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{
          px: { xs: 1.5, sm: 2.5 }, py: 1.75, borderBottom: `1px solid ${COLORS.border}`, bgcolor: COLORS.cardBg,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
            {stack.length > 0 && (
              <IconButton size="small" onClick={goBack} sx={{ color: COLORS.textSecondary }}><ArrowBackIcon fontSize="small" /></IconButton>
            )}
            <Avatar sx={{ width: 42, height: 42, bgcolor: COLORS.primary, fontWeight: 700, flexShrink: 0 }}>
              {user?.username?.[0]?.toUpperCase() || '?'}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography noWrap sx={{ fontWeight: 800, color: COLORS.textPrimary, fontSize: '1.02rem', lineHeight: 1.2 }}>
                {user?.username || 'Loading…'}
              </Typography>
              <Typography noWrap sx={{ fontSize: '0.78rem', color: COLORS.textMuted }}>{user?.email || ''}</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
            <IconButton size="small" onClick={refreshAll} sx={{ color: COLORS.textSecondary }} aria-label="Refresh"><RefreshIcon fontSize="small" /></IconButton>
            <IconButton size="small" onClick={onClose} sx={{ color: COLORS.textSecondary }} aria-label="Close"><CloseIcon /></IconButton>
          </Box>
        </Box>

        {/* Body */}
        <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', p: { xs: 1.5, sm: 2.5 } }}>
          {loading && !overview ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Skeleton variant="rounded" height={150} />
              <Skeleton variant="rounded" height={140} />
              <Skeleton variant="rounded" height={160} />
              <Skeleton variant="rounded" height={260} />
            </Box>
          ) : error ? (
            <ErrorState label={error} onRetry={() => reload()} COLORS={COLORS} />
          ) : overview ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <UserProfileSection user={user} COLORS={COLORS} onOpenReferrer={openUser} />
              <MoneySummary overview={overview} COLORS={COLORS} onOpenLocked={() => setLockedOpen(true)} />
              <ProviderBreakdown providers={overview.surveys.by_provider} COLORS={COLORS} />

              <SectionCard COLORS={COLORS} noPadding title="Full history"
                subtitle="Pick a tab. Every list has filters, and tables scroll sideways on small screens.">
                <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile
                  sx={{
                    px: { xs: 0.5, sm: 1.5 }, borderBottom: `1px solid ${COLORS.border}`, minHeight: 42,
                    '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, fontSize: '0.85rem', minHeight: 42, color: COLORS.textSecondary },
                    '& .Mui-selected': { color: `${COLORS.primaryLight} !important` },
                    '& .MuiTabs-indicator': { bgcolor: COLORS.primaryLight },
                  }}>
                  {HISTORY_TABS.map((t) => <Tab key={t.key} label={t.label} />)}
                </Tabs>
                <Box sx={{ p: { xs: 1, sm: 2 } }}>
                  <HistoryTab key={`${currentId}-${config.key}`} config={config} userId={currentId} overview={overview}
                    COLORS={COLORS} refreshKey={refreshKey} onOpenUser={openUser} />
                </Box>
              </SectionCard>
            </Box>
          ) : null}
        </Box>

        {/* Footer */}
        {user && (
          <Box sx={{ px: { xs: 1.5, sm: 2.5 }, py: 1.5, borderTop: `1px solid ${COLORS.border}`, bgcolor: COLORS.cardBg }}>
            <Button fullWidth onClick={() => { onClose(); onBanUnban?.(user, user.is_active ? 'ban' : 'unban') }}
              sx={{
                textTransform: 'none', fontWeight: 700, borderRadius: 2, py: 1,
                color: user.is_active ? '#ef4444' : '#10b981',
                bgcolor: user.is_active ? '#ef444414' : '#10b98114',
                border: `1px solid ${user.is_active ? '#ef444440' : '#10b98140'}`,
                '&:hover': { bgcolor: user.is_active ? '#ef444424' : '#10b98124' },
              }}>
              {user.is_active ? 'Ban user' : 'Unban user'}
            </Button>
          </Box>
        )}
      </Box>

      {user && (
        <LockedBalanceDialog open={lockedOpen} onClose={() => setLockedOpen(false)} userId={user.id}
          username={user.username} COLORS={COLORS} onChanged={handleBalanceChanged} />
      )}
    </Drawer>
  )
}

export default AdminUserDetailDrawer
