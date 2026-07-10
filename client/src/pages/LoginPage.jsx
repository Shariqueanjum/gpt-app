import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser, clearError } from '../slices/authSlice'

const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
)

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7c.78 0 1.53-.09 2.24-.26" />
    <path d="M2 2l20 20" />
  </svg>
)

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
)

const RefreshIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
)

const LoginPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth)
  const cardRef = useRef(null)

  const [formData, setFormData] = useState({
    email_or_username: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState({})
  const [errors, setErrors] = useState({})
  const [securityQuestion, setSecurityQuestion] = useState(() => {
    const operators = ['+', '-']
    const operator = operators[Math.floor(Math.random() * operators.length)]
    let num1 = Math.floor(Math.random() * 20) + 1
    let num2 = Math.floor(Math.random() * 20) + 1
    if (operator === '-' && num2 > num1) [num1, num2] = [num2, num1]
    const answer = operator === '+' ? num1 + num2 : num1 - num2
    return { num1, num2, operator, answer, userAnswer: '' }
  })

  // Redirect after successful login
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.profile_completion < 30) {
        navigate('/complete-profile')
      } else {
        navigate('/dashboard')
      }
    }
  }, [isAuthenticated, user, navigate])

  // Lock scroll on mount
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = 'unset' }
  }, [])

  const validateField = (name, value) => {
    if (name === 'email_or_username' && !value.trim()) return 'Email or username is required'
    if (name === 'password') {
      if (!value) return 'Password is required'
      if (value.length < 6) return 'Password must be at least 6 characters'
    }
    return ''
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setTouched(prev => ({ ...prev, [name]: true }))
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }))
  }

  const handleSecurityAnswer = (e) => {
    setSecurityQuestion(prev => ({ ...prev, userAnswer: e.target.value }))
    setErrors(prev => ({ ...prev, security: '' }))
  }

  const validateAll = () => {
    const newErrors = {
      email_or_username: validateField('email_or_username', formData.email_or_username),
      password: validateField('password', formData.password),
    }
    if (parseInt(securityQuestion.userAnswer) !== securityQuestion.answer) {
      newErrors.security = 'Incorrect answer. Try again.'
    }
    setErrors(newErrors)
    setTouched({ email_or_username: true, password: true, security: true })
    return !Object.values(newErrors).some(e => e)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(clearError())
    if (!validateAll()) return
    dispatch(loginUser(formData))
  }

  const handleClose = () => {
    dispatch(clearError()) // Clear error when closing
    document.body.style.overflow = 'unset'
    navigate('/')
  }

  const handleBackdropClick = (e) => {
    if (cardRef.current && !cardRef.current.contains(e.target)) {
      handleClose() // This now calls clearError() too
    }
  }

  const regenerateQuestion = () => {
    const operators = ['+', '-']
    const operator = operators[Math.floor(Math.random() * operators.length)]
    let num1 = Math.floor(Math.random() * 20) + 1
    let num2 = Math.floor(Math.random() * 20) + 1
    if (operator === '-' && num2 > num1) [num1, num2] = [num2, num1]
    const answer = operator === '+' ? num1 + num2 : num1 - num2
    setSecurityQuestion({ num1, num2, operator, answer, userAnswer: '' })
    setErrors(prev => ({ ...prev, security: '' }))
  }

  const inputBase = 'w-full bg-[#f2f3ff] rounded-2xl border px-5 py-3.5 pl-12 text-[#131b2e] placeholder-[#494454]/50 text-base transition-all duration-200 focus:outline-none focus:ring-4'
  const inputError = 'border-[#ba1a1a]/40 focus:border-[#ba1a1a] focus:ring-[#ba1a1a]/10'
  const inputNormal = 'border-[#cbc3d7]/40 focus:border-[#5312bc] focus:ring-[#5312bc]/10'

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-24 pb-6 px-4 sm:px-6" onClick={handleBackdropClick}>
      <div className="absolute inset-0 bg-[#131b2e]/70" />

      <div ref={cardRef} className="relative w-full max-w-[400px] mx-auto bg-white rounded-[2rem] border border-[#cbc3d7]/40 shadow-[0_25px_80px_-20px_rgba(83,18,188,0.25)] p-6 sm:p-8">
        <button onClick={handleClose} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#f2f3ff] hover:bg-[#e9ddff] flex items-center justify-center text-[#494454] hover:text-[#5312bc] transition-all duration-200">
          <CloseIcon />
        </button>

        <div className="text-center mb-6">
          <h1 className="text-[#131b2e] text-2xl font-extrabold mb-1.5 tracking-tight" style={{ fontFamily: 'Sora, Inter, system-ui, sans-serif' }}>
            Welcome Back
          </h1>
          <p className="text-[#494454] text-sm font-medium">Sign in to continue earning rewards</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5312bc]/60"><MailIcon /></div>
              <input type="text" name="email_or_username" value={formData.email_or_username} onChange={handleChange} placeholder="Email or Username" className={`${inputBase} ${touched.email_or_username && errors.email_or_username ? inputError : inputNormal} pr-4`} />
            </div>
            {touched.email_or_username && errors.email_or_username && (
              <p className="mt-1.5 text-xs text-[#ba1a1a] font-medium flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-[#ba1a1a]" />{errors.email_or_username}</p>
            )}
          </div>

          <div>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5312bc]/60"><LockIcon /></div>
              <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="Password" className={`${inputBase} ${touched.password && errors.password ? inputError : inputNormal} pr-12`} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7b7486] hover:text-[#5312bc] transition-colors p-1">
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {touched.password && errors.password && (
              <p className="mt-1.5 text-xs text-[#ba1a1a] font-medium flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-[#ba1a1a]" />{errors.password}</p>
            )}
          </div>

          <div className="bg-[#f2f3ff] rounded-2xl p-3.5 border border-[#cbc3d7]/30">
            <p className="text-xs font-semibold text-[#494454] uppercase tracking-[0.08em] mb-2.5">Security Check</p>
            <div className="flex items-center gap-2.5">
              <span className="text-[#131b2e] font-bold text-base font-mono bg-white px-3 py-2 rounded-xl border border-[#cbc3d7]/30 whitespace-nowrap shrink-0">
                {securityQuestion.num1} {securityQuestion.operator} {securityQuestion.num2} = ?
              </span>
              <input type="number" value={securityQuestion.userAnswer} onChange={handleSecurityAnswer} placeholder="Answer" className={`flex-1 min-w-0 bg-white rounded-xl border px-3 py-2 text-[#131b2e] text-base focus:outline-none focus:ring-2 transition-all ${touched.security && errors.security ? 'border-[#ba1a1a] focus:ring-[#ba1a1a]/10' : 'border-[#cbc3d7]/30 focus:border-[#5312bc] focus:ring-[#5312bc]/10'}`} />
              <button type="button" onClick={regenerateQuestion} className="p-2 rounded-xl bg-white border border-[#cbc3d7]/30 text-[#494454] hover:text-[#5312bc] hover:border-[#5312bc]/30 transition-all shrink-0">
                <RefreshIcon />
              </button>
            </div>
            {touched.security && errors.security && (
              <p className="mt-1.5 text-xs text-[#ba1a1a] font-medium flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-[#ba1a1a]" />{errors.security}</p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-[#ba1a1a]/[0.08] border border-[#ba1a1a]/[0.15] rounded-xl text-[#ba1a1a] text-sm font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a] shrink-0" />{error}
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full bg-[#5312bc] text-white rounded-full py-3.5 font-bold text-base shadow-lg shadow-[#5312bc]/20 hover:bg-[#6b38d4] active:scale-[0.97] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2" style={{ fontFamily: 'Sora, Inter, system-ui, sans-serif' }}>
            {loading ? <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Sign In'}
          </button>
        </form>

        <div className="mt-5 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-sm">
            <Link to="/forgot-password" className="font-semibold text-[#5312bc] hover:text-[#6b38d4] transition-colors">Forgot password?</Link>
            <span className="text-[#cbc3d7]">|</span>
            <Link to="/forgot-username" className="font-semibold text-[#5312bc] hover:text-[#6b38d4] transition-colors">Forgot username?</Link>
          </div>
          <p className="text-[#494454] text-sm">
            Don't have an account? <Link to="/register" className="font-bold text-[#5312bc] hover:text-[#6b38d4] transition-colors">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage