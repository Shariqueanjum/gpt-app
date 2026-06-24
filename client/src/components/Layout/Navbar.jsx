// client/src/components/Layout/Navbar.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Collapse,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'

const navSections = [
  { label: 'Home', id: 'home' },
  { label: 'How It Works ?', id: 'how-it-works' },
  { label: 'Why Choose Us', id: 'why-choose-us' },
  { label: 'Rewards', id: 'redeem' },
  { label: 'FAQ', id: 'faq' },
]

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useSelector((state) => state.auth)
  const isHomePage = location.pathname === '/'

    useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])


  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '')
      setTimeout(() => {
        const el = document.getElementById(id)
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 300)
    }
  }, [location])

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen)
  const scrollToSection = (id) => {
    setMobileOpen(false)
    if (!isHomePage) {
      navigate('/#' + id)
      setTimeout(() => {
        const el = document.getElementById(id)
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
      return
    }
    window.history.pushState(null, '', '#' + id)
    const el = document.getElementById(id)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const scrollToTop = () => {
    setMobileOpen(false)
    if (!isHomePage) { navigate('/'); return }
    window.history.pushState(null, '', window.location.pathname)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <AppBar
        position="fixed"
        elevation={scrolled ? 1 : 0}
        sx={{
          bgcolor: '#f2f3ff',
          borderBottom: mobileOpen ? 'none' : '1px solid #e2e8f0',
          transition: 'box-shadow 0.3s ease',
          zIndex: 1300,
        }}
      >
        <Toolbar
          sx={{
            justifyContent: 'space-between',
            minHeight: { xs: '56px', sm: '64px' },
            px: { xs: 2, sm: 3, md: 4 },
            maxWidth: '1280px',
            width: '100%',
            mx: 'auto',
            gap: 1,
          }}
        >
          {/* Logo */}
          <Typography
            onClick={scrollToTop}
            sx={{
              fontFamily: '"Sora", sans-serif',
              fontSize: { xs: '18px', sm: '20px', md: '22px' },
              fontWeight: 800,
              color: '#5312bc',
              textDecoration: 'none',
              letterSpacing: '-0.02em',
              cursor: 'pointer',
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}
          >
            WABCASH
          </Typography>

          {/* Desktop Nav */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
            {navSections.map((item) => (
              <Typography
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                sx={{
                  fontFamily: '"Sora", sans-serif',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#64748b',
                  px: 2,
                  py: 1,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                  '&:hover': { color: '#5312bc', bgcolor: 'rgba(83, 18, 188, 0.06)' },
                }}
              >
                {item.label}
              </Typography>
            ))}
          </Box>

          {/* Right Side */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
            {/* Desktop auth buttons */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
              {!isAuthenticated ? (
                <>
                  <Typography
                    component={Link}
                    to="/login"
                    sx={{
                      fontFamily: '"Sora", sans-serif',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#64748b',
                      textDecoration: 'none',
                      px: 2,
                      py: 1,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap',
                      '&:hover': { color: '#5312bc', bgcolor: 'rgba(83, 18, 188, 0.06)' },
                    }}
                  >
                    Log In
                  </Typography>
                  <Button
                    component={Link}
                    to="/register"
                    sx={{
                      bgcolor: '#5312bc',
                      color: '#fff',
                      borderRadius: '9999px',
                      px: 3,
                      py: 0.8,
                      fontFamily: '"Sora", sans-serif',
                      fontSize: '13px',
                      fontWeight: 600,
                      textTransform: 'none',
                      whiteSpace: 'nowrap',
                      '&:hover': { bgcolor: '#6b38d4' },
                    }}
                  >
                    Sign Up
                  </Button>
                </>
              ) : (
                <Button
                  component={Link}
                  to="/dashboard"
                  sx={{
                    bgcolor: '#5312bc',
                    color: '#fff',
                    borderRadius: '9999px',
                    px: 3,
                    py: 0.8,
                    fontFamily: '"Sora", sans-serif',
                    fontSize: '13px',
                    fontWeight: 600,
                    textTransform: 'none',
                    whiteSpace: 'nowrap',
                    '&:hover': { bgcolor: '#6b38d4' },
                  }}
                >
                  Dashboard
                </Button>
              )}
            </Box>

            {/* Mobile hamburger */}
            <IconButton
              onClick={handleDrawerToggle}
              sx={{
                display: { md: 'none' },
                color: '#131b2e',
                p: 1,
              }}
            >
              {mobileOpen ? <CloseIcon sx={{ fontSize: 24 }} /> : <MenuIcon sx={{ fontSize: 24 }} />}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Menu — Collapse from navbar bottom */}
      <Collapse
        in={mobileOpen}
        timeout={300}
        sx={{
          display: { md: 'none' },
          position: 'fixed',
          top: '56px',
          left: 0,
          right: 0,
          zIndex: 1299,
          bgcolor: '#ffffff',
        }}
      >
        <Box
          sx={{
            bgcolor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            px: 2,
            py: 1,
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
          }}
        >
          {/* All items in ONE column with EQUAL spacing */}
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {/* Nav sections */}
            {navSections.map((item) => (
              <Typography
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                sx={{
                  fontFamily: '"Sora", sans-serif',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#64748b',
                  py: 1.5,
                  px: 2,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  '&:hover': { color: '#5312bc', bgcolor: 'rgba(83, 18, 188, 0.06)' },
                }}
              >
                {item.label}
              </Typography>
            ))}

            {/* Divider */}
            <Box sx={{ my: 1, height: '1px', bgcolor: '#e2e8f0', mx: 2 }} />

            {/* Auth links — same spacing as nav items */}
            {!isAuthenticated ? (
              <>
                <Typography
                  component={Link}
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  sx={{
                    fontFamily: '"Sora", sans-serif',
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#64748b',
                    textDecoration: 'none',
                    py: 1.5,
                    px: 2,
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    '&:hover': { color: '#5312bc', bgcolor: 'rgba(83, 18, 188, 0.06)' },
                  }}
                >
                  Log In
                </Typography>
                <Typography
                  component={Link}
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  sx={{
                    fontFamily: '"Sora", sans-serif',
                    fontSize: '15px',
                    fontWeight: 700,
                    color: '#5312bc',
                    textDecoration: 'none',
                    py: 1.5,
                    px: 2,
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    '&:hover': { bgcolor: 'rgba(83, 18, 188, 0.08)' },
                  }}
                >
                  Sign Up
                </Typography>
              </>
            ) : (
              <Typography
                component={Link}
                to="/dashboard"
                onClick={() => setMobileOpen(false)}
                sx={{
                  fontFamily: '"Sora", sans-serif',
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#5312bc',
                  textDecoration: 'none',
                  py: 1.5,
                  px: 2,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  '&:hover': { bgcolor: 'rgba(83, 18, 188, 0.08)' },
                }}
              >
                Dashboard
              </Typography>
            )}
          </Box>
        </Box>
      </Collapse>
    </>
  )
}

export default Navbar