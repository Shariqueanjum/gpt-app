// client/src/components/Layout/Footer.jsx
import { Box, Typography, Container } from '@mui/material'
import { Link } from 'react-router-dom'

const supportLinks = [
  { label: 'Live Chat', href: '/login', isRoute: true },
  { label: 'Submit a Ticket', href: '/login', isRoute: true },
  { label: 'Email Support', href: 'mailto:support@wabcash.com', isRoute: false },
]

const legalLinks = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms & Conditions', href: '#' },
  { label: 'Cookies', href: '#' },
  { label: 'Disclaimer', href: '#' },
]

// SVG icons — no external URLs, no loading issues
const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="5" stroke="#E4405F" strokeWidth="2"/>
    <circle cx="12" cy="12" r="5" stroke="#E4405F" strokeWidth="2"/>
    <circle cx="17.5" cy="6.5" r="1.5" fill="#E4405F"/>
  </svg>
)

const DiscordIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" fill="#5865F2"/>
  </svg>
)

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
  </svg>
)

const LinkedInIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="#0A66C2"/>
  </svg>
)

const socialLinks = [
  { label: 'Instagram', href: 'https://instagram.com', Icon: InstagramIcon },
  { label: 'Discord', href: 'https://discord.com', Icon: DiscordIcon },
  { label: 'Facebook', href: 'https://facebook.com', Icon: FacebookIcon },
  { label: 'LinkedIn', href: 'https://linkedin.com', Icon: LinkedInIcon },
]

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#f2f3ff',
        width: '100%',
        pt: { xs: 6, md: 8 },
        pb: { xs: 3, md: 4 },
        borderTop: '1px solid #cbc3d7',
      }}
    >
      <Container maxWidth="lg">
        {/* Main Grid — Desktop: Brand | Support | Legal | (empty) */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: '2fr 1fr 1fr 1fr',
            },
            gap: { xs: 5, md: 6 },
            mb: { xs: 5, md: 6 },
          }}
        >
          {/* Brand Column — spans 2 on mobile, 2fr on desktop */}
          <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 2', md: 'span 1' } }}>
            <Typography
              sx={{
                fontFamily: '"Sora", sans-serif',
                fontSize: '22px',
                fontWeight: 800,
                color: '#5312bc',
                mb: 1.5,
                letterSpacing: '-0.02em',
              }}
            >
              WABCASH
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontSize: '14px',
                lineHeight: 1.6,
                color: '#64748b',
                mb: 3,
                maxWidth: 260,
                fontWeight: 500,
              }}
            >
              The world's most rewarding platform for digital exploration and market research.
            </Typography>
          </Box>

          {/* Support Links */}
          <Box>
            <Typography
              sx={{
                fontFamily: '"Sora", sans-serif',
                fontSize: '13px',
                fontWeight: 700,
                color: '#131b2e',
                mb: 2.5,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Support
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}
            >
              {supportLinks.map((link, idx) => (
                <Box key={idx}>
                  {link.isRoute ? (
                    <Typography
                      component={Link}
                      to={link.href}
                      sx={{
                        fontFamily: '"Plus Jakarta Sans", sans-serif',
                        fontSize: '14px',
                        color: '#64748b',
                        textDecoration: 'none',
                        fontWeight: 500,
                        transition: 'color 0.2s ease',
                        cursor: 'pointer',
                        display: 'block',
                        '&:hover': { color: '#5312bc' },
                      }}
                    >
                      {link.label}
                    </Typography>
                  ) : (
                    <Box
                      component="a"
                      href={link.href}
                      sx={{
                        fontFamily: '"Plus Jakarta Sans", sans-serif',
                        fontSize: '14px',
                        color: '#64748b',
                        textDecoration: 'none',
                        fontWeight: 500,
                        transition: 'color 0.2s ease',
                        cursor: 'pointer',
                        display: 'block',
                        '&:hover': { color: '#5312bc' },
                      }}
                    >
                      {link.label}
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          </Box>

          {/* Legal Links */}
          <Box>
            <Typography
              sx={{
                fontFamily: '"Sora", sans-serif',
                fontSize: '13px',
                fontWeight: 700,
                color: '#131b2e',
                mb: 2.5,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Legal
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}
            >
              {legalLinks.map((link, idx) => (
                <Box
                  key={idx}
                  component="a"
                  href={link.href}
                  sx={{
                    fontFamily: '"Plus Jakarta Sans", sans-serif',
                    fontSize: '14px',
                    color: '#64748b',
                    textDecoration: 'none',
                    fontWeight: 500,
                    transition: 'color 0.2s ease',
                    cursor: 'pointer',
                    display: 'block',
                    '&:hover': { color: '#5312bc' },
                  }}
                >
                  {link.label}
                </Box>
              ))}
            </Box>
          </Box>

          {/* Social — Desktop: 4th column. Mobile: last row */}
          <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 2', md: 'span 1' } }}>
            <Typography
              sx={{
                fontFamily: '"Sora", sans-serif',
                fontSize: '13px',
                fontWeight: 700,
                color: '#131b2e',
                mb: 2.5,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Follow Us
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              {socialLinks.map((social, idx) => {
                const IconComponent = social.Icon
                return (
                  <Box
                    key={idx}
                    component="a"
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '10px',
                      bgcolor: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      border: '1px solid rgba(203, 195, 215, 0.3)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textDecoration: 'none',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 16px rgba(83, 18, 188, 0.12)',
                        borderColor: 'rgba(83, 18, 188, 0.2)',
                      },
                    }}
                  >
                    <IconComponent />
                  </Box>
                )
              })}
            </Box>
          </Box>
        </Box>

        {/* Bottom Bar — TIGHTER */}
        <Box
          sx={{
            pt: 3,
            borderTop: '1px solid rgba(203, 195, 215, 0.3)',
            textAlign: 'center',
          }}
        >
          <Typography
            sx={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: '12px',
              color: '#7b7486',
              fontWeight: 500,
            }}
          >
            © {new Date().getFullYear()} WABCASH. Secure GPT Platform. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}

export default Footer