import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
  Tooltip,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import NotificationsIcon from '@mui/icons-material/Notifications'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import LogoutIcon from '@mui/icons-material/Logout'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import DashboardIcon from '@mui/icons-material/Dashboard'
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import PeopleIcon from '@mui/icons-material/People'
import HistoryIcon from '@mui/icons-material/History'
import SupportAgentIcon from '@mui/icons-material/SupportAgent'

const DashboardNavbar = ({ darkMode, toggleDarkMode }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  const { user } = useSelector((state) => state.auth)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const [notifAnchor, setNotifAnchor] = useState(null)

  // Check if profile is incomplete - BLOCK EVERYTHING
  const isProfileIncomplete = user?.profile_completion < 30

  const handleLogout = () => {
    if (isProfileIncomplete) return // Block logout too
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/'
  }

  const sidebarItems = [
    { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { label: 'Earn', icon: <MonetizationOnIcon />, path: '/earn' },
    { label: 'Withdraw', icon: <AccountBalanceWalletIcon />, path: '/withdraw' },
    { label: 'Referrals', icon: <PeopleIcon />, path: '/referrals' },
    { label: 'History', icon: <HistoryIcon />, path: '/history' },
    { label: 'Support', icon: <SupportAgentIcon />, path: '/support' },
  ]

  const drawer = (
    <Box sx={{ width: 260 }}>
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" fontWeight={800} sx={{ color: '#10b981' }}>
          WABCASH
        </Typography>
        <Typography variant="caption" sx={{ color: '#64748b' }}>
          Earn Rewards Daily
        </Typography>
      </Box>
      <Divider />
      <List>
        {sidebarItems.map((item) => (
          <ListItem
            button
            key={item.label}
            onClick={() => {
              if (!isProfileIncomplete) {
                setMobileOpen(false)
                navigate(item.path)
              }
            }}
            sx={{
              opacity: isProfileIncomplete ? 0.4 : 1,
              cursor: isProfileIncomplete ? 'not-allowed' : 'pointer',
              '&:hover': isProfileIncomplete ? {} : { bgcolor: '#ecfdf5' },
              borderRadius: 2,
              mx: 1,
              mb: 0.5,
            }}
          >
            <ListItemIcon sx={{ color: '#10b981', minWidth: 40, opacity: isProfileIncomplete ? 0.4 : 1 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}
            />
          </ListItem>
        ))}
      </List>
      <Divider sx={{ mt: 2 }} />
      <List>
        <ListItem
          button
          onClick={handleLogout}
          sx={{
            opacity: isProfileIncomplete ? 0.4 : 1,
            cursor: isProfileIncomplete ? 'not-allowed' : 'pointer',
            '&:hover': isProfileIncomplete ? {} : { bgcolor: '#fef2f2' },
            borderRadius: 2,
            mx: 1,
          }}
        >
          <ListItemIcon sx={{ color: '#ef4444', minWidth: 40, opacity: isProfileIncomplete ? 0.4 : 1 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem', color: '#ef4444' }}
          />
        </ListItem>
      </List>
    </Box>
  )

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          borderBottom: '1px solid #e2e8f0',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, md: 64 } }}>
          {isMobile && (
            <IconButton
              edge="start"
              onClick={() => !isProfileIncomplete && setMobileOpen(true)}
              sx={{ color: '#0f172a', mr: 1, opacity: isProfileIncomplete ? 0.4 : 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              color: '#10b981',
              textDecoration: 'none',
              flexGrow: 1,
              fontSize: { xs: '1.1rem', md: '1.25rem' },
            }}
          >
            WABCASH
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Notifications - DISABLED */}
            <Tooltip title={isProfileIncomplete ? "Complete profile first" : "Notifications"}>
              <span>
                <IconButton
                  onClick={(e) => !isProfileIncomplete && setNotifAnchor(e.currentTarget)}
                  sx={{ color: '#64748b', opacity: isProfileIncomplete ? 0.4 : 1 }}
                  disabled={isProfileIncomplete}
                >
                  <Badge badgeContent={0} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </span>
            </Tooltip>

            {/* Dark Mode - DISABLED */}
            <Tooltip title={isProfileIncomplete ? "Complete profile first" : "Toggle theme"}>
              <span>
                <IconButton
                  onClick={() => !isProfileIncomplete && toggleDarkMode()}
                  sx={{ color: '#64748b', opacity: isProfileIncomplete ? 0.4 : 1 }}
                  disabled={isProfileIncomplete}
                >
                  {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              </span>
            </Tooltip>

            {/* User Menu - DISABLED */}
            <Tooltip title={isProfileIncomplete ? "Complete profile first" : "Account"}>
              <span>
                <IconButton
                  onClick={(e) => !isProfileIncomplete && setAnchorEl(e.currentTarget)}
                  sx={{ ml: 0.5, opacity: isProfileIncomplete ? 0.4 : 1 }}
                  disabled={isProfileIncomplete}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: '#10b981',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                    }}
                  >
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </Avatar>
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* User Dropdown */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { minWidth: 200, borderRadius: 2, mt: 1 } }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="body2" fontWeight={700} sx={{ color: '#0f172a' }}>
            {user?.username || 'User'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            Level {user?.level_id || 1}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile') }}>
          <AccountCircleIcon sx={{ mr: 1.5, color: '#64748b', fontSize: 20 }} />
          Profile
        </MenuItem>
        <MenuItem onClick={handleLogout} sx={{ color: '#ef4444' }}>
          <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} />
          Logout
        </MenuItem>
      </Menu>

      {/* Notifications Dropdown */}
      <Menu
        anchorEl={notifAnchor}
        open={Boolean(notifAnchor)}
        onClose={() => setNotifAnchor(null)}
        PaperProps={{ sx: { minWidth: 300, maxWidth: 360, borderRadius: 2, mt: 1 } }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="body2" fontWeight={700} sx={{ color: '#0f172a' }}>
            Notifications
          </Typography>
        </Box>
        <Divider />
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
            No new notifications
          </Typography>
        </Box>
      </Menu>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        PaperProps={{ sx: { borderRight: '1px solid #e2e8f0' } }}
      >
        {drawer}
      </Drawer>
    </>
  )
}

export default DashboardNavbar