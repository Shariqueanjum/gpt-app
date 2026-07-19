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
  { num: '1', title: 'Acceptance of Terms', id: 'acceptance' },
  { num: '2', title: 'Eligibility', id: 'eligibility' },
  { num: '3', title: 'Your Account', id: 'account' },
  { num: '4', title: 'Earnings & Payments', id: 'earnings' },
  { num: '5', title: 'Prohibited Activities', id: 'prohibited' },
  { num: '6', title: 'Termination', id: 'termination' },
  { num: '7', title: 'Third-Party Offers', id: 'thirdparty' },
  { num: '8', title: 'Limitation of Liability', id: 'liability' },
  { num: '9', title: 'Governing Law', id: 'governing' },
  { num: '10', title: 'Changes to Terms', id: 'changes' },
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

const TermsOfServicePage = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [activeSection, setActiveSection] = useState('acceptance')
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
              Terms of Service
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
              {/* 1. Acceptance of Terms */}
              <Section num="1" title="Acceptance of Terms" id="acceptance">
                <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.8, fontSize: '0.95rem' }}>
                  These Terms of Service govern your access to and use of the <strong style={{ color: colors.textPrimary }}>PickOpinion</strong> website and services. By accessing our website, creating an account, or using any of our services, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you must not access or use our services.
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.8, mt: 2, fontSize: '0.95rem' }}>
                  We reserve the right to modify or replace these Terms at any time. When we make changes, we will update the "Last updated" date at the top of this page. Your continued use of PickOpinion after any changes constitutes your acceptance of the updated Terms.
                </Typography>
              </Section>

              {/* 2. Eligibility */}
              <Section num="2" title="Eligibility" id="eligibility">
                <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.8, mb: 2, fontSize: '0.95rem' }}>
                  To use PickOpinion, you must meet the following requirements:
                </Typography>
                <Bullet>You must be at least 16 years of age to register and participate in surveys</Bullet>
                <Bullet>You must provide accurate, complete, and current information during registration</Bullet>
                <Bullet>You must not have been previously banned or suspended from PickOpinion</Bullet>
                <Bullet>You must comply with all applicable laws and regulations in your jurisdiction</Bullet>
                <HighlightBox type="warning">
                  <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.8, fontSize: '0.95rem' }}>
                    <strong style={{ color: colors.textPrimary }}>Double Opt-In:</strong> We use a double opt-in registration process. When you sign up, we send a verification email to your registered address. You must click the verification link to activate your account. Accounts that are not verified within 24 hours will be automatically deleted.
                  </Typography>
                </HighlightBox>
              </Section>

              {/* 3. Your Account */}
              <Section num="3" title="Your Account" id="account">
                <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.8, mb: 2, fontSize: '0.95rem' }}>
                  When you create an account with PickOpinion, you are responsible for maintaining the security of your account and password. You agree to:
                </Typography>
                <Bullet>Keep your password confidential and not share it with anyone</Bullet>
                <Bullet>Notify us immediately if you suspect unauthorized access to your account</Bullet>
                <Bullet>Ensure all information in your profile is accurate and up to date</Bullet>
                <Bullet>Be solely responsible for all activities that occur under your account</Bullet>
                <Bullet>Not create more than one account per person or household</Bullet>
                <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.8, mt: 2, fontSize: '0.95rem' }}>
                  Accounts that have not been logged into for 360 consecutive days may be deemed inactive. Inactive accounts may be closed, and any remaining earnings may be forfeited. We will notify you by email at least 30 days before closing an inactive account.
                </Typography>
              </Section>

              {/* 4. Earnings & Payments */}
              <Section num="4" title="Earnings & Payments" id="earnings">
                <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.8, mb: 2, fontSize: '0.95rem' }}>
                  You can earn rewards on PickOpinion by completing surveys, offers, and other activities available on our platform. The following terms apply to all earnings and payments:
                </Typography>
                <Bullet>Earnings are credited to your account upon successful completion and verification of each activity</Bullet>
                <Bullet>We determine the amount of earnings for each activity at our sole discretion</Bullet>
                <Bullet>There may be times where no earnings are awarded for an activity, regardless of completion</Bullet>
                <Bullet>Earnings are not a currency and have no cash value until redeemed</Bullet>
                <Bullet>You may not transfer, sell, or exchange earnings to another account or third party</Bullet>

                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2.5,
                    border: `1px solid ${colors.border}`,
                    bgcolor: colors.cardBg,
                    mt: 2.5,
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
                    Withdrawals & Payouts
                  </Typography>
                  <Bullet>The minimum withdrawal amount is $5</Bullet>
                  <Bullet>All withdrawals are subject to manual admin review and approval</Bullet>
                  <Bullet>
                    <strong style={{ color: colors.textPrimary }}>Net 60 Payment Terms:</strong> We receive payments from our survey partners and advertisers on a Net 90 basis. To ensure we can fulfill all payouts reliably, we process user withdrawals on a Net 60 basis. This means your earnings become available for withdrawal 60 days after they are credited to your account. Once the 60-day period is complete and your withdrawal request is approved by our admin team, your payment will be processed within 24 hours.
                  </Bullet>
                  <Bullet>Available payout methods include PayPal, UPI, Net Banking, cryptocurrency, and gift cards</Bullet>
                  <Bullet>Payout method availability may vary based on your country and account status</Bullet>
                  <Bullet>We reserve the right to reverse earnings if fraud, VPN usage, or terms violations are detected</Bullet>
                  <Bullet>First-time withdrawals may require additional identity verification</Bullet>
                </Paper>

                <HighlightBox type="info">
                  <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.8, fontSize: '0.9rem' }}>
                    <strong style={{ color: colors.textPrimary }}>Tax Responsibility:</strong> You are responsible for any taxes that may apply to your earnings. We do not withhold taxes on your behalf. We encourage you to consult a tax professional to understand your tax obligations.
                  </Typography>
                </HighlightBox>
              </Section>

              {/* 5. Prohibited Activities */}
              <Section num="5" title="Prohibited Activities" id="prohibited">
                <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.8, mb: 2, fontSize: '0.95rem' }}>
                  You agree not to engage in any of the following prohibited activities. Violation of these rules may result in immediate account suspension, termination, and forfeiture of all earnings:
                </Typography>
                <Bullet>Using VPNs, proxies, or any method to mask or reroute your internet connection</Bullet>
                <Bullet>Creating multiple accounts or using automated tools, bots, or scripts</Bullet>
                <Bullet>Providing false, inaccurate, or misleading information in surveys or your profile</Bullet>
                <Bullet>Attempting to manipulate the reward system or exploit bugs in our platform</Bullet>
                <Bullet>Sharing your account credentials with any other person</Bullet>
                <Bullet>Using the platform for any illegal, fraudulent, or unauthorized purpose</Bullet>
                <HighlightBox type="danger">
                  <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.8, fontSize: '0.95rem' }}>
                    <strong style={{ color: colors.danger }}>Fraud Detection:</strong> We use advanced fraud detection systems including IP analysis, device fingerprinting, and behavior monitoring. Any attempt to circumvent these systems will result in permanent account ban and forfeiture of all earnings.
                  </Typography>
                </HighlightBox>
              </Section>

              {/* 6. Termination */}
              <Section num="6" title="Termination" id="termination">
                <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.8, mb: 2, fontSize: '0.95rem' }}>
                  We reserve the right to suspend or terminate your account at any time, with or without notice, if we determine in our sole discretion that you have violated these Terms or engaged in any prohibited activity.
                </Typography>
                <Bullet>Upon termination, your right to use our services will immediately cease</Bullet>
                <Bullet>All earnings and pending withdrawals associated with your account will be voided and forfeited</Bullet>
                <Bullet>You may also terminate your account at any time by deleting it in your profile settings</Bullet>
                <Bullet>Upon account deletion, your personal data will be removed within 30 days, subject to legal retention requirements</Bullet>
              </Section>

              {/* 7. Third-Party Offers */}
              <Section num="7" title="Third-Party Offers" id="thirdparty">
                <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.8, mb: 2, fontSize: '0.95rem' }}>
                  PickOpinion partners with third-party survey providers and offer walls to bring you earning opportunities. When you interact with these third-party offers:
                </Typography>
                <Bullet>You may be redirected to external websites operated by third parties</Bullet>
                <Bullet>Third-party offers are subject to the terms and conditions of those third parties</Bullet>
                <Bullet>We are not responsible for the content, privacy practices, or terms of third-party websites</Bullet>
                <Bullet>We do not endorse or guarantee any third-party products or services</Bullet>
                <Bullet>We are not liable for any loss or damage arising from your use of third-party services</Bullet>
              </Section>

              {/* 8. Limitation of Liability */}
              <Section num="8" title="Limitation of Liability" id="liability">
                <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.8, mb: 2, fontSize: '0.95rem' }}>
                  PickOpinion is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, either express or implied. We do not guarantee that our platform will be uninterrupted, secure, or error-free.
                </Typography>
                <Bullet>We are not liable for any indirect, incidental, special, consequential, or punitive damages</Bullet>
                <Bullet>Our total liability shall not exceed the amount you have successfully withdrawn in the preceding 12 months</Bullet>
                <Bullet>We are not responsible for any virus, malware, or other harmful components your device may encounter while using our platform</Bullet>
                <Bullet>We recommend maintaining up-to-date antivirus and anti-malware software on your devices</Bullet>
              </Section>

              {/* 9. Governing Law */}
              <Section num="9" title="Governing Law" id="governing">
                <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.8, fontSize: '0.95rem' }}>
                  These Terms are governed by the laws of <strong style={{ color: colors.textPrimary }}>India</strong>. Any disputes arising from these Terms shall be subject to the jurisdiction of the courts in India.
                </Typography>
              </Section>

              {/* 10. Changes to Terms */}
              <Section num="10" title="Changes to These Terms" id="changes">
                <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.8, fontSize: '0.95rem' }}>
                  We may update these Terms of Service from time to time. When we make changes, we will update the "Last updated" date at the top of this page. It is your responsibility to review these Terms periodically. Your continued use of PickOpinion after any changes constitutes your acceptance of the updated Terms. If you do not agree to the new terms, you must stop using our services.
                </Typography>
              </Section>

              {/* 11. Contact Us */}
              <Section num="11" title="Contact Us" id="contact">
                <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.8, mb: 2, fontSize: '0.95rem' }}>
                  If you have any questions, concerns, or feedback about these Terms of Service, please contact us:
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

export default TermsOfServicePage