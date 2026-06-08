import { Box, Typography, Container, Link as MuiLink, Divider } from '@mui/material'
import { Link } from 'react-router-dom'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = [
    { label: 'Home', path: '/' },
    { label: 'How it Works', path: '/#how-it-works' },
    { label: 'Redeem', path: '/#redeem' },
    { label: 'Why Choose Us', path: '/#why-choose-us' },
    { label: 'We Paid', path: '/#we-paid' },
  ]

  const legalLinks = [
    { label: 'Terms of Service', path: '/terms' },
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Contact Us', path: '/contact' },
  ]

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#f8fafc',        // CHANGED: Light gray instead of dark
        color: '#64748b',
        pt: { xs: 8, md: 10 },
        pb: 4,
        borderTop: '1px solid #e2e8f0',
      }}
    >
      <Container maxWidth="lg">
        {/* Top Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            gap: { xs: 6, md: 4 },
            mb: 6,
          }}
        >
          {/* Brand */}
          <Box sx={{ maxWidth: 300 }}>
            <Typography
              variant="h6"
              sx={{
                color: '#0f172a',    // Dark text instead of white
                fontWeight: 800,
                letterSpacing: '0.5px',
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Box
                component="span"
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 2,
                  bgcolor: '#10b981',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: 900,
                }}
              >
                W
              </Box>
              WABCASH
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.7 }}>
              Earn real rewards by completing surveys and offers. Trusted by thousands worldwide.
            </Typography>
          </Box>

          {/* Links Grid */}
          <Box
            sx={{
              display: 'flex',
              gap: { xs: 6, md: 8 },
              flexWrap: 'wrap',
            }}
          >
            {/* Quick Links */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ color: '#0f172a', fontWeight: 700, mb: 2, fontSize: '0.85rem' }}
              >
                Quick Links
              </Typography>
              {footerLinks.map((link) => (
                <MuiLink
                  key={link.path}
                  component={Link}
                  to={link.path}
                  sx={{
                    display: 'block',
                    color: '#64748b',
                    textDecoration: 'none',
                    mb: 1,
                    fontSize: '0.85rem',
                    '&:hover': { color: '#10b981' },
                    transition: 'color 0.2s ease',
                  }}
                >
                  {link.label}
                </MuiLink>
              ))}
            </Box>

            {/* Legal */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ color: '#0f172a', fontWeight: 700, mb: 2, fontSize: '0.85rem' }}
              >
                Legal
              </Typography>
              {legalLinks.map((link) => (
                <MuiLink
                  key={link.path}
                  component={Link}
                  to={link.path}
                  sx={{
                    display: 'block',
                    color: '#64748b',
                    textDecoration: 'none',
                    mb: 1,
                    fontSize: '0.85rem',
                    '&:hover': { color: '#10b981' },
                    transition: 'color 0.2s ease',
                  }}
                >
                  {link.label}
                </MuiLink>
              ))}
            </Box>
          </Box>
        </Box>

        <Divider sx={{ borderColor: '#e2e8f0', mb: 4 }} />

        {/* Bottom Bar */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="caption" sx={{ color: '#94a3b8' }}>
            © {currentYear} WABCASH. All rights reserved.
          </Typography>
          <Typography variant="caption" sx={{ color: '#94a3b8' }}>
            Made with care for earners worldwide.
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}

export default Footer