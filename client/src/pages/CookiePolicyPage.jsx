import { useState, useEffect } from 'react'
import { Box, Typography, Container, Paper, Link as MuiLink, useMediaQuery, useTheme } from '@mui/material'
import { Link } from 'react-router-dom'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import Navbar from '../components/Layout/Navbar'
import Footer from '../components/Layout/Footer'

const colors = {
  primary: '#5312bc',
  primaryLight: '#7c3aed',
  primaryDark: '#3b0f8a',
  accent: '#10b981',
  bg: '#faf8ff',
  cardBg: '#ffffff',
  textPrimary: '#1e1b4b',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  border: '#e5e7eb',
  gold: '#f59e0b',
  danger: '#ef4444',
  sidebarBg: '#f5f3ff',
  headerBg: '#f0eeff',
  headerBorder: '#e2e0f0',
  navBg: '#ffffff',
}

const tocItems = [
  { num: '1', title: 'What Are Cookies', id: 'what' },
  { num: '2', title: 'How We Use Cookies', id: 'use' },
  { num: '3', title: 'Types of Cookies', id: 'types' },
  { num: '4', title: 'Third-Party Cookies', id: 'thirdparty' },
  { num: '5', title: 'Managing Cookies', id: 'manage' },
  { num: '6', title: 'Contact Us', id: 'contact' },
]

const Section = ({ num, title, id, children }) => (
  <Box id={id} sx={{ scrollMarginTop: '100px', mb: 5 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: '0.9rem',
          flexShrink: 0,
          boxShadow: `0 4px 12px ${colors.primary}33`,
        }}
      >
        {num}
      </Box>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          color: colors.textPrimary,
          fontSize: { xs: '1.15rem', md: '1.4rem' },
        }}
      >
        {title}
      </Typography>
    </Box>
    <Box sx={{ pl: { xs: 0, md: 6 } }}>{children}</Box>
  </Box>
)

const Bullet = ({ children }) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
    <Box
      sx={{
        width: 8,
        height: 8,
        borderRadius: '3px',
        bgcolor: colors.primary,
        mt: 1,
        flexShrink: 0,
        transform: 'rotate(45deg)',
      }}
    />
    <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.75, fontSize: '0.9rem' }}>
      {children}
    </Typography>
  </Box>
)

const HighlightBox = ({ children, type = 'info' }) => {
  const styles = {
    info: { bg: colors.sidebarBg, border: colors.headerBorder },
    warning: { bg: '#fffbeb', border: '#fde68a' },
    danger: { bg: '#fef2f2', border: '#fecaca' },
  }
  const s = styles[type]
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2.5,
        border: `1px solid ${s.border}`,
        bgcolor: s.bg,
        mb: 2,
      }}
    >
      {children}
    </Paper>
  )
}

const CookiePolicyPage = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [activeSection, setActiveSection] = useState('what')
  const [mobileTocOpen, setMobileTocOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const offsets = tocItems
        .map((item) => {
          const el = document.getElementById(item.id)
          return el ? { id: item.id, offset: el.getBoundingClientRect().top } : null
        })
        .filter(Boolean)

      const current = offsets.reduce((closest, curr) => {
        if (curr.offset <= 150 && (!closest || curr.offset > closest.offset)) return curr
        return closest
      }, null)

      if (current) setActiveSection(current.id)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleTocClick = (id) => {
    setActiveSection(id)
    setMobileTocOpen(false)
    const el = document.getElementById(id)
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
    }
  }

  const TocContent = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      {tocItems.map((item) => (
        <MuiLink
          key={item.id}
          underline="none"
          onClick={() => handleTocClick(item.id)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            py: 1,
            px: 1.5,
            borderRadius: 2,
            cursor: 'pointer',
            color: activeSection === item.id ? colors.primary : colors.textSecondary,
            bgcolor: activeSection === item.id ? colors.sidebarBg : 'transparent',
            fontWeight: activeSection === item.id ? 700 : 500,
            fontSize: '0.88rem',
            transition: 'all 0.2s ease',
            borderLeft: activeSection === item.id ? `3px solid ${colors.primary}` : '3px solid transparent',
            '&:hover': {
              color: colors.primary,
              bgcolor: colors.sidebarBg,
              borderLeft: `3px solid ${colors.primaryLight}`,
            },
          }}
        >
          <Box
            sx={{
              width: 26,
              height: 26,
              borderRadius: 1,
              bgcolor: activeSection === item.id ? colors.primary : '#f3f4f6',
              color: activeSection === item.id ? '#fff' : colors.textMuted,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {item.num}
          </Box>
          {item.title}
        </MuiLink>
      ))}
    </Box>
  )

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Hero Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 50%, #1e1b4b 100%)`,
          pt: { xs: 10, md: 12 },
          pb: { xs: 6, md: 8 },
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="overline"
              sx={{
                color: 'rgba(255,255,255,0.7)',
                fontWeight: 700,
                letterSpacing: 3,
                fontSize: '0.75rem',
              }}
            >
              LEGAL DOCUMENTS
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                color: '#ffffff',
                mt: 1.5,
                fontSize: { xs: '2rem', md: '3rem' },
                letterSpacing: -1,
              }}
            >
              Cookie Policy
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: 'rgba(255,255,255,0.7)', mt: 2, fontSize: '1rem' }}
            >
              Last updated: July 10, 2026
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Box sx={{ bgcolor: colors.bg, flex: 1, pt: { xs: 4, md: 6 }, pb: 8 }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', lg: 'row' },
              gap: { xs: 3, lg: 5 },
            }}
          >
            {/* LEFT: Table of Contents */}
            <Box sx={{ width: { xs: '100%', lg: 300 }, flexShrink: 0 }}>
              {!isMobile && (
                <Box sx={{ position: 'sticky', top: 24 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      border: `1px solid ${colors.border}`,
                      bgcolor: colors.cardBg,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 700,
                        color: colors.textPrimary,
                        mb: 2.5,
                        fontSize: '0.85rem',
                        textTransform: 'uppercase',
                        letterSpacing: 1.5,
                      }}
                    >
                      On This Page
                    </Typography>
                    <TocContent />
                  </Paper>
                </Box>
              )}

              {isMobile && (
                <>
                  <Box
                    onClick={() => setMobileTocOpen(!mobileTocOpen)}
                    sx={{
                      position: 'fixed',
                      bottom: 20,
                      right: 20,
                      zIndex: 1000,
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      bgcolor: colors.primary,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 4px 20px ${colors.primary}66`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:active': { transform: 'scale(0.95)' },
                    }}
                  >
                    {mobileTocOpen ? <CloseIcon /> : <MenuIcon />}
                  </Box>

                  {mobileTocOpen && (
                    <>
                      <Box
                        onClick={() => setMobileTocOpen(false)}
                        sx={{
                          position: 'fixed',
                          inset: 0,
                          bgcolor: 'rgba(0,0,0,0.4)',
                          zIndex: 998,
                          backdropFilter: 'blur(4px)',
                        }}
                      />
                      <Box
                        sx={{
                          position: 'fixed',
                          bottom: 80,
                          left: 16,
                          right: 16,
                          zIndex: 999,
                          maxHeight: '60vh',
                          overflow: 'auto',
                        }}
                      >
                        <Paper
                          elevation={4}
                          sx={{
                            p: 3,
                            borderRadius: 3,
                            bgcolor: colors.cardBg,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 700,
                                color: colors.textPrimary,
                                fontSize: '0.85rem',
                                textTransform: 'uppercase',
                                letterSpacing: 1.5,
                              }}
                            >
                              On This Page
                            </Typography>
                            <CloseIcon
                              onClick={() => setMobileTocOpen(false)}
                              sx={{ color: colors.textSecondary, fontSize: 20, cursor: 'pointer' }}
                            />
                          </Box>
                          <TocContent />
                        </Paper>
                      </Box>
                    </>
                  )}
                </>
              )}
            </Box>

            {/* RIGHT: Main Content */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {/* 1. What Are Cookies */}
              <Section num="1" title="What Are Cookies" id="what">
                <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.8, fontSize: '0.95rem' }}>
                  Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences, keep you logged in, and understand how you use the site. We also use similar technologies like local storage and session tokens for the same purposes.
                </Typography>
              </Section>

              {/* 2. How We Use Cookies */}
              <Section num="2" title="How We Use Cookies" id="use">
                <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.8, mb: 2, fontSize: '0.95rem' }}>
                  PickOpinion uses cookies for the following purposes:
                </Typography>
                <Bullet><strong style={{ color: colors.textPrimary }}>Authentication:</strong> To keep you logged in and maintain your session securely</Bullet>
                <Bullet><strong style={{ color: colors.textPrimary }}>Security:</strong> To protect your account from unauthorized access and detect suspicious activity</Bullet>
                <Bullet><strong style={{ color: colors.textPrimary }}>Preferences:</strong> To remember your language, theme, and notification settings</Bullet>
                <Bullet><strong style={{ color: colors.textPrimary }}>Analytics:</strong> To understand how users interact with our platform so we can improve it</Bullet>
              </Section>

              {/* 3. Types of Cookies */}
              <Section num="3" title="Types of Cookies We Use" id="types">
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2.5,
                    border: `1px solid ${colors.border}`,
                    bgcolor: colors.cardBg,
                    mb: 2.5,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      color: colors.primary,
                      mb: 2,
                      fontSize: '0.95rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: colors.primary }} />
                    Essential Cookies (Required)
                  </Typography>
                  <Bullet>Session cookies to keep you logged in while you browse</Bullet>
                  <Bullet>Security cookies to prevent unauthorized access and fraud</Bullet>
                  <Bullet>CSRF tokens to protect form submissions</Bullet>
                  <Bullet>These cookies cannot be disabled — they are necessary for the site to function</Bullet>
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2.5,
                    border: `1px solid ${colors.border}`,
                    bgcolor: colors.cardBg,
                    mb: 2.5,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      color: colors.primary,
                      mb: 2,
                      fontSize: '0.95rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: colors.gold }} />
                    Functional Cookies (Optional)
                  </Typography>
                  <Bullet>Remember your preferred language and theme settings</Bullet>
                  <Bullet>Store your notification preferences</Bullet>
                  <Bullet>Save your recently viewed surveys for quick access</Bullet>
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2.5,
                    border: `1px solid ${colors.border}`,
                    bgcolor: colors.cardBg,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      color: colors.primary,
                      mb: 2,
                      fontSize: '0.95rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: colors.accent }} />
                    Analytics Cookies (Optional)
                  </Typography>
                  <Bullet>Help us understand how visitors use our platform</Bullet>
                  <Bullet>Track page views, clicks, and time spent on site</Bullet>
                  <Bullet>Identify bugs and areas for improvement</Bullet>
                  <Bullet>We use aggregated data only — no personal identification</Bullet>
                </Paper>
              </Section>

              {/* 4. Third-Party Cookies */}
              <Section num="4" title="Third-Party Cookies" id="thirdparty">
                <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.8, mb: 2, fontSize: '0.95rem' }}>
                  When you click on a survey or offer from our platform, you may be redirected to a third-party website operated by our survey partners. These third-party sites may set their own cookies on your device.
                </Typography>
                <Bullet>Survey providers and offer walls may use cookies to track offer completion and prevent fraud</Bullet>
                <Bullet>Payment processors may use cookies during the withdrawal process</Bullet>
                <Bullet>Analytics services like Google Analytics may use cookies to help us understand site usage</Bullet>
                <Bullet>We do not control these third-party cookies — please review their respective cookie policies</Bullet>
                <HighlightBox type="warning">
                  <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.8, fontSize: '0.95rem' }}>
                    <strong style={{ color: colors.textPrimary }}>Important:</strong> We do not share your personal data with these third parties for cookie purposes. However, when you visit their sites directly, their own cookie policies apply. We recommend reviewing the cookie policies of survey providers you interact with frequently.
                  </Typography>
                </HighlightBox>
              </Section>

              {/* 5. Managing Cookies */}
              <Section num="5" title="Managing Your Cookies" id="manage">
                <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.8, mb: 2, fontSize: '0.95rem' }}>
                  You can control cookies through your browser settings. Here is how to manage them in popular browsers:
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2.5,
                    border: `1px solid ${colors.border}`,
                    bgcolor: colors.cardBg,
                    mb: 2.5,
                  }}
                >
                  <Bullet><strong style={{ color: colors.textPrimary }}>Google Chrome:</strong> Settings → Privacy and security → Cookies and other site data</Bullet>
                  <Bullet><strong style={{ color: colors.textPrimary }}>Mozilla Firefox:</strong> Preferences → Privacy & Security → Cookies and Site Data</Bullet>
                  <Bullet><strong style={{ color: colors.textPrimary }}>Apple Safari:</strong> Preferences → Privacy → Cookies and website data</Bullet>
                  <Bullet><strong style={{ color: colors.textPrimary }}>Microsoft Edge:</strong> Settings → Cookies and site permissions → Manage and delete cookies</Bullet>
                </Paper>
                <HighlightBox type="info">
                  <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.8, fontSize: '0.9rem' }}>
                    <strong style={{ color: colors.textPrimary }}>Note:</strong> Disabling essential cookies will prevent you from logging in or using core features of PickOpinion. You can disable non-essential cookies (functional and analytics) without affecting basic functionality.
                  </Typography>
                </HighlightBox>
              </Section>

              {/* 6. Contact Us */}
              <Section num="6" title="Contact Us" id="contact">
                <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.8, mb: 2, fontSize: '0.95rem' }}>
                  If you have any questions about our Cookie Policy or how we use cookies, please contact us:
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 3, md: 4 },
                    borderRadius: 3,
                    border: `1px solid ${colors.border}`,
                    bgcolor: colors.cardBg,
                    textAlign: 'center',
                    background: `linear-gradient(135deg, ${colors.sidebarBg} 0%, ${colors.cardBg} 100%)`,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: colors.textPrimary,
                      mb: 1,
                      fontSize: '1.1rem',
                    }}
                  >
                    Get in Touch
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1, fontSize: '0.95rem' }}>
                    <strong style={{ color: colors.textPrimary }}>Email:</strong>{' '}
                    <MuiLink
                      href="mailto:support@pickopinion.com"
                      sx={{ color: colors.primary, fontWeight: 600, textDecoration: 'none' }}
                    >
                      support@pickopinion.com
                    </MuiLink>
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.textMuted, fontSize: '0.85rem' }}>
                    We aim to respond within 48 business hours
                  </Typography>
                </Paper>
              </Section>
            </Box>
          </Box>
        </Container>
      </Box>

      <Footer />
    </Box>
  )
}

export default CookiePolicyPage