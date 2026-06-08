import { Container, Typography, Button, Box, Grid, Paper } from '@mui/material'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { APP_NAME, APP_TAGLINE } from '../utils/constants'
import {Layout} from '../components/Layout/Layout'

const HomePage = () => {
  const { isAuthenticated } = useSelector((state) => state.auth)

  return (
    <Layout>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: { xs: 6, md: 12 },  // Responsive padding
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{ fontSize: { xs: '2rem', md: '3.5rem' }, fontWeight: 'bold' }}
          >
            {APP_NAME}
          </Typography>
          <Typography
            variant="h5"
            sx={{ mb: 4, opacity: 0.9, fontSize: { xs: '1.2rem', md: '1.5rem' } }}
          >
            {APP_TAGLINE}
          </Typography>
          
          {!isAuthenticated && (
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                component={Link}
                to="/register"
              >
                Get Started
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                size="large"
                component={Link}
                to="/login"
              >
                Already a Member?
              </Button>
            </Box>
          )}
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          {[
            { title: 'Complete Surveys', desc: 'Earn points by sharing your opinion' },
            { title: 'Daily Rewards', desc: 'New offers available every day' },
            { title: 'Fast Withdrawals', desc: 'Cash out your earnings instantly' },
          ].map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper elevation={2} sx={{ p: 4, height: '100%', textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.desc}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Layout>
  )
}

export default HomePage