import { Alert, AlertTitle } from '@mui/material'

const ErrorAlert = ({ message, onClose }) => {
  if (!message) return null
  
  return (
    <Alert severity="error" onClose={onClose} sx={{ mb: 2 }}>
      <AlertTitle>Error</AlertTitle>
      {message}
    </Alert>
  )
}

export default ErrorAlert