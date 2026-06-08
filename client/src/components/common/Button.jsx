import { Button as MuiButton } from '@mui/material'

const Button = ({ children, loading = false, ...props }) => {
  return (
    <MuiButton
      variant="contained"
      fullWidth
      disabled={loading}
      sx={{ mt: 2, py: 1.2, fontWeight: 'bold' }}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </MuiButton>
  )
}

export default Button