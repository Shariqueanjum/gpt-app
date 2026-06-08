import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import { logout } from '../../slices/authSlice'

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen)
  const handleClose = () => setMobileOpen(false)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
    handleClose()
  }

  const publicNavLinks = [
    { label: 'Home', path: '/' },
    { label: 'How it Works?', path: '/#how-it-works' },
    { label: 'Redeem', path: '/#redeem' },
    { label: 'Why Choose Us', path: '/#why-choose-us' },
    { label: 'We Paid', path: '/#we-paid' },
  ]

  const authNavLinks = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Earn', path: '/earn' },
    { label: 'Withdraw', path: '/withdraw' },
  ]

  const navLinks = isAuthenticated ? authNavLinks : publicNavLinks

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/' && !location.hash
    if (path.startsWith('/#')) return location.pathname === '/' && location.hash === path.substring(1)
    return location.pathname === path
  }

  const drawerContent = (
    <Box sx={{ width: 280, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" component={Link} to="/" onClick={handleClose} sx={{ textDecoration: 'none', color: '#0f172a', fontWeight: 800, letterSpacing: '0.5px', fontSize: '1.25rem' }}>
          WABCASH
        </Typography>
        <IconButton onClick={handleClose} sx={{ color: '#64748b' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ borderColor: '#e2e8f0' }} />

      <List sx={{ px: 1, py: 2, flex: 1 }}>
        {navLinks.map((link) => (
          <ListItem key={link.label} component={Link} to={link.path} onClick={handleClose}
            sx={{ borderRadius: 2, mb: 0.5, color: isActive(link.path) ? '#10b981' : '#475569', bgcolor: isActive(link.path) ? 'rgba(16, 185, 129, 0.08)' : 'transparent', '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.08)', color: '#10b981' }, textDecoration: 'none', transition: 'all 0.2s ease' }}>
            <ListItemText primary={link.label} primaryTypographyProps={{ fontWeight: isActive(link.path) ? 700 : 500, fontSize: '0.95rem' }} />
          </ListItem>
        ))}
      </List>

      <Divider sx={{ borderColor: '#e2e8f0' }} />

      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {isAuthenticated ? (
          <>
            <Typography variant="body2" sx={{ color: '#64748b', textAlign: 'center', mb: 1 }}>
              Signed in as <strong>{user?.username}</strong>
            </Typography>
            <Button fullWidth variant="outlined" onClick={handleLogout}
              sx={{ borderColor: '#e2e8f0', color: '#64748b', textTransform: 'none', borderRadius: 2, py: 1, '&:hover': { borderColor: '#ef4444', color: '#ef4444', bgcolor: 'rgba(239,68,68,0.04)' } }}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <Button fullWidth component={Link} to="/login" onClick={handleClose}
              sx={{ color: '#475569', textTransform: 'none', borderRadius: 2, py: 1, fontWeight: 600, '&:hover': { bgcolor: 'rgba(15,23,42,0.04)' } }}>
              Login
            </Button>
            <Button fullWidth variant="contained" component={Link} to="/register" onClick={handleClose}
              sx={{ bgcolor: '#10b981', textTransform: 'none', borderRadius: 2, py: 1, fontWeight: 600, boxShadow: '0 4px 14px rgba(16,185,129,0.25)', '&:hover': { bgcolor: '#059669', boxShadow: '0 6px 20px rgba(16,185,129,0.35)' } }}>
              Sign Up
            </Button>
          </>
        )}
      </Box>
    </Box>
  )

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: scrolled ? '#ffffff' : '#ffffff',  // Solid white always, no transparency
        borderBottom: scrolled ? '2px solid #e2e8f0' : '2px solid transparent',
        boxShadow: scrolled ? '0 4px 6px -1px rgba(0,0,0,0.05)' : 'none',
        transition: 'all 0.3s ease',
        // REMOVED: backdropFilter — this was causing the glassy bleed-through
      }}
    >
      <Toolbar sx={{ maxWidth: '1280px', width: '100%', mx: 'auto', px: { xs: 2, sm: 3, md: 4 }, minHeight: '64px' }}>
        <Typography variant="h6" component={Link} to="/"
          sx={{ textDecoration: 'none', color: '#0f172a', fontWeight: 800, letterSpacing: '0.5px', fontSize: { xs: '1.1rem', md: '1.25rem' }, flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box component="span" sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: '#10b981', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.9rem', fontWeight: 900 }}>
            W
          </Box>
          WABCASH
        </Typography>

        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {navLinks.map((link) => (
              <Button key={link.label} component={Link} to={link.path}
                sx={{ color: isActive(link.path) ? '#10b981' : '#475569', textTransform: 'none', fontWeight: isActive(link.path) ? 600 : 500, fontSize: '0.9rem', px: 2, py: 1, borderRadius: 2, position: 'relative', '&::after': isActive(link.path) ? { content: '""', position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)', width: 20, height: 3, borderRadius: 1.5, bgcolor: '#10b981' } : {}, '&:hover': { bgcolor: 'rgba(16,185,129,0.08)', color: '#10b981' }, transition: 'all 0.2s ease' }}>
                {link.label}
              </Button>
            ))}

            <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: '#e2e8f0', height: 24, my: 'auto' }} />

            {isAuthenticated ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 1 }}>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>{user?.username}</Typography>
                <Button onClick={handleLogout} sx={{ color: '#64748b', textTransform: 'none', fontWeight: 500, borderRadius: 2, px: 2, '&:hover': { color: '#ef4444', bgcolor: 'rgba(239,68,68,0.04)' } }}>
                  Logout
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
                <Button component={Link} to="/login" sx={{ color: '#475569', textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 3, '&:hover': { bgcolor: 'rgba(15,23,42,0.04)' } }}>
                  Login
                </Button>
                <Button variant="contained" component={Link} to="/register" sx={{ bgcolor: '#10b981', textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 3, py: 1, boxShadow: '0 4px 14px rgba(16,185,129,0.25)', '&:hover': { bgcolor: '#059669', boxShadow: '0 6px 20px rgba(16,185,129,0.35)' } }}>
                  Sign Up
                </Button>
              </Box>
            )}
          </Box>
        )}

        {isMobile && (
          <IconButton onClick={handleDrawerToggle} sx={{ color: '#475569', ml: 1, '&:hover': { bgcolor: 'rgba(16,185,129,0.08)', color: '#10b981' } }}>
            <MenuIcon />
          </IconButton>
        )}
      </Toolbar>

      <Drawer anchor="right" open={mobileOpen} onClose={handleClose}
        PaperProps={{ sx: { borderTopLeftRadius: 16, borderBottomLeftRadius: 16, boxShadow: '-4px 0 24px rgba(0,0,0,0.08)' } }}>
        {drawerContent}
      </Drawer>
    </AppBar>
  )
}

export default Navbar