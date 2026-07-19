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
  { num: '1', title: 'General Information', id: 'general' },
  { num: '2', title: 'No Financial Advice', id: 'financial' },
  { num: '3', title: 'Earnings Disclaimer', id: 'earnings' },
  { num: '4', title: 'Third-Party Content', id: 'thirdparty' },
  { num: '5', title: 'Accuracy of Information', id: 'accuracy' },
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

const DisclaimerPage = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [activeSection, setActiveSection] = useState('general')
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
              Disclaimer
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
              {/* 1. General Information */}
              <Section num="1" title="General Information" id="general">
                <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.8, fontSize: '0.95rem' }}>
                  The information provided on <strong style={{ color: colors.textPrimary }}>PickOpinion</strong> is for general informational purposes only. All content on this website is provided in good faith, but we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the site.
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.8, mt: 2, fontSize: '0.95rem' }}>
                  By using our website, you acknowledge and agree that your use of the platform is at your sole risk. We encourage you to verify any information before relying on it.
                </Typography>
              </Section>

              {/* 2. No Financial Advice */}
              <Section num="2" title="No Financial Advice" id="financial">
                <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.8, fontSize: '0.95rem' }}>
                  PickOpinion is a rewards platform, not a financial service or investment opportunity. The earnings you make by completing surveys and offers are rewards for your time and participation, not investment returns or guaranteed income.
                </Typography>
                <Bullet>We do not provide financial, investment, tax, or legal advice</Bullet>
                <Bullet>Any earnings displayed on the platform are illustrative and not guaranteed</Bullet>
                <Bullet>Your actual earnings will depend on survey availability, your demographics, and offer completion rates</Bullet>
                <Bullet>Always consult a qualified professional before making financial decisions</Bullet>
              </Section>

              {/* 3. Earnings Disclaimer */}
              <Section num="3" title="Earnings Disclaimer" id="earnings">
                <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.8, fontSize: '0.95rem' }}>
                  We do not guarantee any specific level of earnings. Survey availability, payout rates, and offer opportunities vary based on multiple factors including your location, demographics, and advertiser demand.
                </Typography>
                <Bullet>Earnings depend on the number and type of surveys available to you</Bullet>
                <Bullet>Not all users will qualify for every survey or offer</Bullet>
                <Bullet>Survey providers may disqualify you mid-survey if you do not meet their criteria</Bullet>
                <Bullet>We reserve the right to adjust earning rates at any time without prior notice</Bullet>
                <Bullet>Any testimonials or earnings examples on our site are not typical results</Bullet>
                <HighlightBox type="warning">
                  <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.8, fontSize: '0.95rem' }}>
                    <strong style={{ color: colors.textPrimary }}>Important:</strong> Past performance or earnings of other users do not guarantee future results for you. Your earnings may vary significantly from those shown in testimonials or promotional materials.
                  </Typography>
                </HighlightBox>
              </Section>

              {/* 4. Third-Party Content */}
              <Section num="4" title="Third-Party Content" id="thirdparty">
                <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.8, fontSize: '0.95rem' }}>
                  PickOpinion partners with third-party survey providers and advertisers. When you interact with third-party offers or surveys:
                </Typography>
                <Bullet>You may be redirected to external websites not operated by us</Bullet>
                <Bullet>We are not responsible for the content, accuracy, or practices of third-party sites</Bullet>
                <Bullet>Third-party offers are subject to the terms and conditions of those providers</Bullet>
                <Bullet>We do not endorse or guarantee any third-party products, services, or claims</Bullet>
                <Bullet>We are not liable for any loss or damage arising from your use of third-party services</Bullet>
              </Section>

              {/* 5. Accuracy of Information */}
              <Section num="5" title="Accuracy of Information" id="accuracy">
                <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.8, fontSize: '0.95rem' }}>
                  While we strive to keep all information on PickOpinion accurate and up to date, we make no representations or warranties of any kind about the completeness, accuracy, reliability, or availability of the platform or its content.
                </Typography>
                <Bullet>We may update, change, or remove content at any time without notice</Bullet>
                <Bullet>We do not guarantee that our platform will be available at all times, uninterrupted, or error-free</Bullet>
                <Bullet>Technical issues, maintenance, or third-party problems may affect availability</Bullet>
                <Bullet>Any reliance you place on information from our platform is strictly at your own risk</Bullet>
                <HighlightBox type="info">
                  <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.8, fontSize: '0.9rem' }}>
                    <strong style={{ color: colors.textPrimary }}>Platform Availability:</strong> We may suspend, withdraw, or restrict access to all or part of our platform for business, operational, or technical reasons. We are not liable for any loss or damage arising from platform downtime.
                  </Typography>
                </HighlightBox>
              </Section>

              {/* 6. Contact Us */}
              <Section num="6" title="Contact Us" id="contact">
                <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.8, mb: 2, fontSize: '0.95rem' }}>
                  If you have any questions about this Disclaimer, please contact us:
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

export default DisclaimerPage