import { Outlet } from 'react-router-dom'
import { Box } from '@mui/material'
import DashboardNavbar from './DashboardNavbar'

const DashboardLayout = ({ children, darkMode, toggleDarkMode }) => {
  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
      <DashboardNavbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <main>{children}</main>
    </div>
  )
}

export default DashboardLayout