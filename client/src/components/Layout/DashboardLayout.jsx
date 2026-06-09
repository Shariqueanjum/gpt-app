import { Box, useTheme } from '@mui/material'
import DashboardNavbar from './DashboardNavbar'

const DashboardLayout = ({ children, darkMode, toggleDarkMode }) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        height: '100%',
        bgcolor: isDark ? '#0f172a' : '#f8fafc',
        transition: 'background-color 0.3s ease',
      }}
    >
      <DashboardNavbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: { xs: '56px', md: '64px' },
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 2, md: 3 },
          maxWidth: 1400,
          mx: 'auto',
          width: '100%',
          position: 'relative',
          bgcolor: 'transparent', // Let parent background show through
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

export default DashboardLayout