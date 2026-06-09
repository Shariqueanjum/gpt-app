import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Fade,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import WcIcon from '@mui/icons-material/Wc'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import axiosInstance from '../utils/axiosInstance'
import { fetchCurrentUser } from '../slices/authSlice'

const CompleteProfilePage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useSelector((state) => state.auth)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [touched, setTouched] = useState({})
  
  const [formData, setFormData] = useState({
    full_name: '',
    dob: '',
    gender: '',
  })

  const [errors, setErrors] = useState({
    full_name: '',
    dob: '',
    gender: '',
  })

  // Parse existing DOB
  const [dobDay, setDobDay] = useState('')
  const [dobMonth, setDobMonth] = useState('')
  const [dobYear, setDobYear] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/')
      return
    }
    if (user?.profile_completion >= 30) {
      navigate('/dashboard')
    }
    if (user) {
      setFormData((prev) => ({
        ...prev,
        full_name: user.full_name || '',
        gender: user.gender || '',
      }))
      
      // Parse existing DOB
      if (user.dob) {
        const dateStr = user.dob.split('T')[0]
        const parts = dateStr.split('-')
        if (parts.length === 3) {
          setDobYear(parts[0])
          setDobMonth(parts[1])
          setDobDay(parts[2])
          setFormData((prev) => ({ ...prev, dob: dateStr }))
        }
      }
    }
  }, [isAuthenticated, user, navigate])

  const validateField = (name, value) => {
    switch (name) {
      case 'full_name':
        if (!value.trim()) return 'Full name is required'
        if (value.trim().length < 3) return 'Name must be at least 3 characters'
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'Name can only contain letters'
        return ''
      case 'dob':
        if (!value) return 'Date of birth is required'
        const birthDate = new Date(value)
        const today = new Date()
        const age = today.getFullYear() - birthDate.getFullYear()
        if (age < 13) return 'You must be at least 13 years old'
        if (age > 100) return 'Please enter a valid date of birth'
        return ''
      case 'gender':
        if (!value) return 'Please select your gender'
        return ''
      default:
        return ''
    }
  }

  const updateDob = (day, month, year) => {
    if (day && month && year) {
      const dobString = `${year}-${month}-${day}`
      setFormData((prev) => ({ ...prev, dob: dobString }))
      setTouched((prev) => ({ ...prev, dob: true }))
      setErrors((prev) => ({ ...prev, dob: validateField('dob', dobString) }))
    } else {
      setFormData((prev) => ({ ...prev, dob: '' }))
    }
  }

  const handleDayChange = (e) => {
    const value = e.target.value
    setDobDay(value)
    updateDob(value, dobMonth, dobYear)
    setError('')
  }

  const handleMonthChange = (e) => {
    const value = e.target.value
    setDobMonth(value)
    updateDob(dobDay, value, dobYear)
    setError('')
  }

  const handleYearChange = (e) => {
    const value = e.target.value
    setDobYear(value)
    updateDob(dobDay, dobMonth, value)
    setError('')
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    setTouched({ ...touched, [name]: true })
    setErrors({ ...errors, [name]: validateField(name, value) })
    setError('')
  }

  const validateAll = () => {
    const newErrors = {
      full_name: validateField('full_name', formData.full_name),
      dob: validateField('dob', formData.dob),
      gender: validateField('gender', formData.gender),
    }
    setErrors(newErrors)
    setTouched({ full_name: true, dob: true, gender: true })
    return !Object.values(newErrors).some((e) => e !== '')
  }

  const handleSubmit = async () => {
    if (!validateAll()) {
      setError('Please fill all required fields correctly')
      return
    }

    setLoading(true)
    setError('')
    try {
      await axiosInstance.put('/user/profile', formData)
      await dispatch(fetchCurrentUser()).unwrap()
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const getProgressColor = () => {
    const completion = user?.profile_completion || 20
    if (completion >= 80) return '#10b981'
    if (completion >= 50) return '#f59e0b'
    return '#ef4444'
  }

  // Generate arrays for dropdowns
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'))
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 100 }, (_, i) => String(currentYear - i - 13))

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        p: { xs: 2, sm: 3 },
        pt: { xs: 3, sm: 6 },
        bgcolor: 'rgba(15, 23, 42, 0.9)',
        overflow: 'auto',
      }}
    >
      <Fade in>
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 400,
            p: { xs: 3, sm: 4 },
            borderRadius: 4,
            border: '1px solid rgba(226, 232, 240, 0.8)',
            bgcolor: 'white',
            boxShadow: '0 32px 64px -12px rgba(0, 0, 0, 0.4)',
            position: 'relative',
            overflow: 'visible',
          }}
        >
          {/* Top gradient bar */}
          <Box
            sx={{
              position: 'absolute',
              top: -1,
              left: 20,
              right: 20,
              height: 4,
              background: 'linear-gradient(90deg, #10b981, #34d399, #059669)',
              borderRadius: 2,
            }}
          />

          {/* Icon circle */}
          <Box sx={{ textAlign: 'center', mb: 3, pt: 1 }}>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                color: '#10b981',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.2)',
              }}
            >
              <PersonIcon sx={{ fontSize: 32 }} />
            </Box>
            <Typography variant="h5" fontWeight={800} sx={{ color: '#0f172a', mb: 0.5, letterSpacing: '-0.02em' }}>
              Complete Your Profile
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.875rem' }}>
              Required before you start earning
            </Typography>
          </Box>

          {/* Progress */}
          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: '#f8fafc',
              border: '1px solid #e2e8f0',
              mb: 3,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
              <Typography variant="body2" fontWeight={700} sx={{ color: '#0f172a' }}>
                Profile Completion
              </Typography>
              <Typography variant="body2" fontWeight={800} sx={{ color: getProgressColor() }}>
                {user?.profile_completion || 20}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={user?.profile_completion || 20}
              sx={{
                height: 10,
                borderRadius: 5,
                bgcolor: '#e2e8f0',
                '& .MuiLinearProgress-bar': {
                  bgcolor: getProgressColor(),
                  borderRadius: 5,
                  transition: 'all 0.5s ease',
                },
              }}
            />
          </Box>

          {/* Error */}
          {error && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: '#fef2f2',
                color: '#ef4444',
                mb: 2,
                fontSize: '0.875rem',
                textAlign: 'center',
                border: '1px solid #fecaca',
              }}
            >
              {error}
            </Box>
          )}

          {/* Form */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Full Name */}
            <TextField
              fullWidth
              label="Full Name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="John Doe"
              error={touched.full_name && !!errors.full_name}
              helperText={touched.full_name && errors.full_name}
              InputProps={{
                startAdornment: (
                  <PersonIcon sx={{ color: '#94a3b8', mr: 1, fontSize: 20 }} />
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2.5,
                  bgcolor: '#fafafa',
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#10b981' },
                  '&.Mui-focused fieldset': { borderColor: '#10b981', borderWidth: 2 },
                  '&.Mui-error fieldset': { borderColor: '#ef4444' },
                },
              }}
            />

            {/* Date of Birth */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CalendarTodayIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Date of Birth *
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <FormControl fullWidth error={touched.dob && !!errors.dob && !dobDay}>
                  <InputLabel size="small">Day</InputLabel>
                  <Select
                    value={dobDay}
                    onChange={handleDayChange}
                    label="Day"
                    size="small"
                    sx={{
                      borderRadius: 2.5,
                      bgcolor: '#fafafa',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#10b981' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#10b981', borderWidth: 2 },
                    }}
                  >
                    <MenuItem value=""><em>DD</em></MenuItem>
                    {days.map((d) => (
                      <MenuItem key={d} value={d}>{d}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth error={touched.dob && !!errors.dob && !dobMonth}>
                  <InputLabel size="small">Month</InputLabel>
                  <Select
                    value={dobMonth}
                    onChange={handleMonthChange}
                    label="Month"
                    size="small"
                    sx={{
                      borderRadius: 2.5,
                      bgcolor: '#fafafa',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#10b981' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#10b981', borderWidth: 2 },
                    }}
                  >
                    <MenuItem value=""><em>MM</em></MenuItem>
                    {months.map((m) => (
                      <MenuItem key={m} value={m}>{m}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth error={touched.dob && !!errors.dob && !dobYear}>
                  <InputLabel size="small">Year</InputLabel>
                  <Select
                    value={dobYear}
                    onChange={handleYearChange}
                    label="Year"
                    size="small"
                    sx={{
                      borderRadius: 2.5,
                      bgcolor: '#fafafa',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#10b981' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#10b981', borderWidth: 2 },
                    }}
                  >
                    <MenuItem value=""><em>YYYY</em></MenuItem>
                    {years.map((y) => (
                      <MenuItem key={y} value={y}>{y}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              {touched.dob && errors.dob && (
                <Typography variant="caption" sx={{ color: '#ef4444', mt: 0.5, display: 'block' }}>
                  {errors.dob}
                </Typography>
              )}
            </Box>

            {/* Gender */}
            <FormControl
              fullWidth
              error={touched.gender && !!errors.gender}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2.5,
                  bgcolor: '#fafafa',
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#10b981' },
                  '&.Mui-focused fieldset': { borderColor: '#10b981', borderWidth: 2 },
                },
              }}
            >
              <InputLabel id="gender-label" size="small">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <WcIcon sx={{ fontSize: 16 }} />
                  Gender
                </Box>
              </InputLabel>
              <Select
                labelId="gender-label"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                label="Gender"
                size="small"
              >
                <MenuItem value=""><em>Select gender</em></MenuItem>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
              {touched.gender && errors.gender && (
                <FormHelperText>{errors.gender}</FormHelperText>
              )}
            </FormControl>
          </Box>

          {/* Submit Button */}
          <Button
            variant="contained"
            fullWidth
            onClick={handleSubmit}
            disabled={loading}
            startIcon={!loading && <CheckCircleIcon />}
            sx={{
              mt: 4,
              bgcolor: '#10b981',
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 3,
              py: 1.5,
              fontSize: '1rem',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
              '&:hover': {
                bgcolor: '#059669',
                boxShadow: '0 12px 32px rgba(16, 185, 129, 0.4)',
                transform: 'translateY(-1px)',
              },
              '&:disabled': {
                bgcolor: '#cbd5e1',
                boxShadow: 'none',
              },
              transition: 'all 0.2s ease',
            }}
          >
            {loading ? 'Saving...' : 'Complete & Continue'}
          </Button>
        </Paper>
      </Fade>
    </Box>
  )
}

export default CompleteProfilePage