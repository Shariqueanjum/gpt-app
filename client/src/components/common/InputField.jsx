import { TextField } from '@mui/material'

const InputField = ({ label, type = 'text', name, value, onChange, error, helperText, ...props }) => {
  return (
    <TextField
      fullWidth
      label={label}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      error={!!error}
      helperText={helperText || error}
      margin="normal"
      size="small"
      {...props}
    />
  )
}

export default InputField