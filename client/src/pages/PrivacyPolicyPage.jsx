import { useState, useEffect } from 'react'
import { Box, Typography, Container, Paper, Link as MuiLink, useMediaQuery, useTheme } from '@mui/material'
import { Link } from 'react-router-dom'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import Navbar from '../components/Layout/Navbar'
import Footer from '../components/Layout/Footer'

// Theme colors matching your getColors() function
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
  { num: '1', title: 'Introduction', id: 'intro' },
  { num: '2', title: 'Information We Collect', id: 'collect' },
  { num: '3', title: 'How We Use Your Information', id: 'use' },
  { num: '4', title: 'How We Share Your Information', id: 'share' },
  { num: '5', title: 'Cookies & Tracking', id: 'cookies' },
  { num: '6', title: 'Data Security', id: 'security' },
  { num: '7', title: 'Data Retention', id: 'retention' },
  { num: '8', title: 'Your Rights & Choices', id: 'rights' },
  { num: '9', title: "Children's Privacy", id: 'children' },
  { num: '10', title: 'Changes to This Policy', id: 'changes' },
  { num: '11', title: 'Contact Us', id: 'contact' },
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

const PrivacyPolicyPage = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [activeSection, setActiveSection] = useState('intro')
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
    <>
    <SEO
  title="Privacy Policy | PickOpinion - Your Data, Your Control"
  description="Learn how PickOpinion protects your personal information. Read our Privacy Policy to understand what data we collect, how we use it, and your rights."
  keywords="privacy policy, data protection, survey privacy, PickOpinion privacy, personal data safety, cookie policy"
/>
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <Navbar />

      {/* Hero Header — PLAIN, no decorative circles */}
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
              Privacy Policy
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
              {/* Desktop: Sticky sidebar */}
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

              {/* Mobile: Floating bottom bar */}
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
              {/* 1. Introduction */}
              <Section num="1" title="Introduction" id="intro">
                <HighlightBox>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.8, fontSize: '0.95rem' }}>
                    At <strong style={{ color: colors.textPrimary }}>PickOpinion</strong>, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains what information we collect, how we use it, who we share it with, and your rights regarding your data.
                  </Typography>
                </HighlightBox>
                <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.8, fontSize: '0.95rem' }}>
                  By using our website or creating an account, you agree to the collection and use of information in accordance with this policy. If you do not agree, please do not use our services.
                </Typography>
              </Section>

              {/* 2. Information We Collect */}
              <Section num="2" title="Information We Collect" id="collect">
                <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.8, mb: 2, fontSize: '0.95rem' }}>
                  We collect information that you provide directly to us, as well as information collected automatically when you use our platform.
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
                    Information You Provide
                  </Typography>
                  <Bullet>Your name, email address, username, and password when you register</Bullet>
                  <Bullet>Demographic information such as age, gender, and country to match you with relevant surveys</Bullet>
                  <Bullet>Survey responses and opinions you share when completing offers</Bullet>
                  <Bullet>Payment details such as your preferred payout method (PayPal, UPI, Net Banking, cryptocurrency, or gift cards)</Bullet>
                  <Bullet>Any messages or support tickets you send us</Bullet>
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
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: colors.primary }} />
                    Information Collected Automatically
                  </Typography>
                  <Bullet>Your IP address, browser type, and device information</Bullet>
                  <Bullet>Pages you visit, clicks, and time spent on our platform</Bullet>
                  <Bullet>Approximate location based on your IP address</Bullet>
                  <Bullet>Referral information if someone invited you to join</Bullet>
                </Paper>
              </Section>

              {/* 3. How We Use Your Information */}
              <Section num="3" title="How We Use Your Information" id="use">
                <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.8, mb: 2, fontSize: '0.95rem' }}>
                  We use the information we collect for the following purposes:
                </Typography>
                <Bullet>
                  <strong style={{ color: colors.textPrimary }}>To provide our service:</strong> Match you with surveys and offers, track your earnings, and process your withdrawals
                </Bullet>
                <Bullet>
                  <strong style={{ color: colors.textPrimary }}>To verify your identity:</strong> Prevent fraud, detect VPN or proxy usage, and ensure fair participation
                </Bullet>
                <Bullet>
                  <strong style={{ color: colors.textPrimary }}>To communicate with you:</strong> Send account notifications, earnings updates, and occasional promotional emails (you can opt out anytime)
                </Bullet>
                <Bullet>
                  <strong style={{ color: colors.textPrimary }}>To improve our platform:</strong> Analyze usage patterns, fix bugs, and develop new features
                </Bullet>
                <Bullet>
                  <strong style={{ color: colors.textPrimary }}>To comply with legal obligations:</strong> Respond to lawful requests and protect our rights
                </Bullet>
              </Section>

              {/* 4. How We Share Your Information */}
              <Section num="4" title="How We Share Your Information" id="share">
                <HighlightBox type="warning">
                  <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.8, fontSize: '0.95rem' }}>
                    <strong style={{ color: colors.textPrimary }}>We do not sell your personal information.</strong> We only share your data in the following limited circumstances:
                  </Typography>
                </HighlightBox>
                <Bullet>
                  <strong style={{ color: colors.textPrimary }}>Survey partners:</strong> We share anonymized demographic data (age range, gender, country) with survey providers so they can match you with relevant surveys. Your name, email, and personal identity are never shared.
                </Bullet>
                <Bullet>
                  <strong style={{ color: colors.textPrimary }}>Payment processors:</strong> We share necessary information with PayPal, UPI providers, banks (for Net Banking), crypto gateways, or gift card providers to process your payouts.
                </Bullet>
                <Bullet>
                  <strong style={{ color: colors.textPrimary }}>Service providers:</strong> We use trusted third-party services for hosting, analytics, and email delivery. These providers only access data needed to perform their services.
                </Bullet>
                <Bullet>
                  <strong style={{ color: colors.textPrimary }}>Legal compliance:</strong> We may disclose information if required by law, court order, or to protect our rights, property, or safety.
                </Bullet>
                <Bullet>
                  <strong style={{ color: colors.textPrimary }}>Business transfers:</strong> If PickOpinion is acquired or merged, your information may be transferred as part of that transaction.
                </Bullet>
              </Section>

              {/* 5. Cookies & Tracking */}
              <Section num="5" title="Cookies & Tracking Technologies" id="cookies">
                <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.8, mb: 2, fontSize: '0.95rem' }}>
                  We use cookies and similar technologies to enhance your experience. Cookies are small files stored on your device that help us remember your preferences and understand how you use our site.
                </Typography>
                <Bullet>
                  <strong style={{ color: colors.textPrimary }}>Essential cookies:</strong> Required for login, security, and basic site functionality. These cannot be disabled.
                </Bullet>
                <Bullet>
                  <strong style={{ color: colors.textPrimary }}>Analytics cookies:</strong> Help us understand how visitors use our site so we can improve it. These are optional.
                </Bullet>
                <Bullet>
                  <strong style={{ color: colors.textPrimary }}>Functional cookies:</strong> Remember your preferences like language and theme settings. These are optional.
                </Bullet>
                <Bullet>
                  <strong style={{ color: colors.textPrimary }}>Third-party cookies:</strong> Set by our survey partners to track offer completions and prevent fraud. These are optional.
                </Bullet>
                <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.8, mt: 2, fontSize: '0.95rem' }}>
                  You can manage or disable non-essential cookies through your browser settings or our cookie consent banner. For more details, see our{' '}
                  <Link to="/cookies" style={{ color: colors.primary, textDecoration: 'none', fontWeight: 600 }}>
                    Cookie Policy
                  </Link>
                  .
                </Typography>
              </Section>

              {/* 6. Data Security */}
              <Section num="6" title="Data Security" id="security">
                <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.8, mb: 2, fontSize: '0.95rem' }}>
                  We take the security of your data seriously and use industry-standard measures to protect it:
                </Typography>
                <Bullet>All passwords are encrypted using industry-standard hashing before storage</Bullet>
                <Bullet>Secure authentication using encrypted tokens</Bullet>
                <Bullet>Rate limiting to prevent brute-force attacks</Bullet>
                <Bullet>Input validation and sanitization to prevent malicious data</Bullet>
                <Bullet>Regular security monitoring for suspicious activity</Bullet>
                <HighlightBox type="info">
                  <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.8, fontSize: '0.9rem' }}>
                    While we take strong precautions, no online system is 100% secure. We encourage you to use a strong, unique password and never share your login credentials with anyone.
                  </Typography>
                </HighlightBox>
              </Section>

              {/* 7. Data Retention */}
              <Section num="7" title="Data Retention" id="retention">
                <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.8, mb: 2, fontSize: '0.95rem' }}>
                  We keep your personal information only for as long as necessary to provide our services and fulfill the purposes outlined in this policy.
                </Typography>
                <Bullet>Account information is retained while your account is active</Bullet>
                <Bullet>Transaction and earnings history is retained for legal and tax compliance purposes</Bullet>
                <Bullet>If your account is inactive for 12 months, we may delete your data or contact you before doing so</Bullet>
                <Bullet>When you delete your account, we remove your personal data within 30 days, except where legally required to retain it</Bullet>
              </Section>

              {/* 8. Your Rights & Choices */}
              <Section num="8" title="Your Rights & Choices" id="rights">
                <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.8, mb: 2, fontSize: '0.95rem' }}>
                  Depending on where you live, you may have the following rights regarding your personal information:
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2.5,
                    border: `1px solid ${colors.border}`,
                    bgcolor: colors.cardBg,
                    mb: 2,
                  }}
                >
                  <Bullet>
                    <strong style={{ color: colors.textPrimary }}>Access:</strong> Request a copy of the personal data we hold about you
                  </Bullet>
                  <Bullet>
                    <strong style={{ color: colors.textPrimary }}>Correction:</strong> Update or correct inaccurate information in your profile
                  </Bullet>
                  <Bullet>
                    <strong style={{ color: colors.textPrimary }}>Deletion:</strong> Request deletion of your account and associated data
                  </Bullet>
                  <Bullet>
                    <strong style={{ color: colors.textPrimary }}>Opt-out:</strong> Unsubscribe from promotional emails at any time using the link in every email
                  </Bullet>
                  <Bullet>
                    <strong style={{ color: colors.textPrimary }}>Portability:</strong> Request your data in a portable format
                  </Bullet>
                </Paper>
                <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.8, fontSize: '0.95rem' }}>
                  To exercise any of these rights, contact us at{' '}
                  <MuiLink
                    href="mailto:support@pickopinion.com"
                    sx={{ color: colors.primary, fontWeight: 600, textDecoration: 'none' }}
                  >
                    support@pickopinion.com
                  </MuiLink>
                  . We will respond to your request within 30 days.
                </Typography>
              </Section>

              {/* 9. Children's Privacy */}
              <Section num="9" title="Children's Privacy" id="children">
                <HighlightBox type="danger">
                  <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.8, fontSize: '0.95rem' }}>
                    PickOpinion is <strong style={{ color: colors.danger }}>not intended for children under the age of 16</strong>. We do not knowingly collect personal information from anyone under 16. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately at{' '}
                    <MuiLink
                      href="mailto:support@pickopinion.com"
                      sx={{ color: colors.primary, fontWeight: 600, textDecoration: 'none' }}
                    >
                      support@pickopinion.com
                    </MuiLink>{' '}
                    and we will delete that information promptly.
                  </Typography>
                </HighlightBox>
              </Section>

              {/* 10. Changes to This Policy */}
              <Section num="10" title="Changes to This Policy" id="changes">
                <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.8, fontSize: '0.95rem' }}>
                  We may update this Privacy Policy from time to time. When we make changes, we will update the "Last updated" date at the top of this page. We encourage you to review this policy periodically. Your continued use of PickOpinion after any changes constitutes your acceptance of the updated policy.
                </Typography>
              </Section>

              {/* 11. Contact Us */}
              <Section num="11" title="Contact Us" id="contact">
                <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.8, mb: 2, fontSize: '0.95rem' }}>
                  If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us:
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
                    We aim to respond within 30 business days
                  </Typography>
                </Paper>
              </Section>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
    </>
  )
}

export default PrivacyPolicyPage