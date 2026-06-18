import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { registerUser, clearError, clearMessage } from '../slices/authSlice'

const PersonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
)

const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
)

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
  </svg>
)

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7c.78 0 1.53-.09 2.24-.26" /><path d="M2 2l20 20" />
  </svg>
)

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const RefreshIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
)

// Tick icon for checkbox
const TickIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const RegisterPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { loading, error, message } = useSelector((state) => state.auth)
  const cardRef = useRef(null)

  const [formData, setFormData] = useState({ username: '', email: '', password: '', agreeTerms: false })
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState({})
  const [errors, setErrors] = useState({})
  const [securityQuestion, setSecurityQuestion] = useState({ num1: 0, num2: 0, operator: '+', answer: 0, userAnswer: '' })
  const [submitted, setSubmitted] = useState(false)

  // NO isAuthenticated redirect here — after register, user must verify email first

  const generateSecurityQuestion = () => {
    const operators = ['+', '-']
    const operator = operators[Math.floor(Math.random() * operators.length)]
    let num1 = Math.floor(Math.random() * 20) + 1
    let num2 = Math.floor(Math.random() * 20) + 1
    if (operator === '-' && num2 > num1) [num1, num2] = [num2, num1]
    const answer = operator === '+' ? num1 + num2 : num1 - num2
    setSecurityQuestion({ num1, num2, operator, answer, userAnswer: '' })
    setErrors(prev => ({ ...prev, security: '' }))
  }

  useEffect(() => {
    generateSecurityQuestion()
    dispatch(clearError())
    dispatch(clearMessage())
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = 'unset' }
  }, [dispatch])

  useEffect(() => {
    if (message && message.toLowerCase().includes('verification')) {
      setSubmitted(true)
    }
  }, [message])

  const validateField = (name, value) => {
    if (name === 'username') {
      if (!value.trim()) return 'Username is required'
      if (value.length < 3) return 'Username must be at least 3 characters'
      if (value.length > 20) return 'Username must be under 20 characters'
      if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Only letters, numbers, underscores allowed'
    }
    if (name === 'email') {
      if (!value.trim()) return 'Email is required'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email'
    }
    if (name === 'password') {
      if (!value) return 'Password is required'
      if (value.length < 8) return 'Password must be at least 8 characters'
      if (!/[A-Z]/.test(value)) return 'Need at least one uppercase letter'
      if (!/[a-z]/.test(value)) return 'Need at least one lowercase letter'
      if (!/[0-9]/.test(value)) return 'Need at least one number'
      if (!/[^A-Za-z0-9]/.test(value)) return 'Need at least one special character'
    }
    if (name === 'agreeTerms') {
      if (!value) return 'You must agree to the terms'
    }
    return ''
  }

  const handleChange = (e) => {
    const { name, value, checked } = e.target
    const val = name === 'agreeTerms' ? checked : value
    setFormData(prev => ({ ...prev, [name]: val }))
    setTouched(prev => ({ ...prev, [name]: true }))
    setErrors(prev => ({ ...prev, [name]: validateField(name, val) }))
    if (error) dispatch(clearError())
  }

  const handleSecurityAnswer = (e) => {
    setSecurityQuestion(prev => ({ ...prev, userAnswer: e.target.value }))
    setErrors(prev => ({ ...prev, security: '' }))
  }

  const validateAll = () => {
    const newErrors = {
      username: validateField('username', formData.username),
      email: validateField('email', formData.email),
      password: validateField('password', formData.password),
      agreeTerms: validateField('agreeTerms', formData.agreeTerms),
    }
    if (parseInt(securityQuestion.userAnswer) !== securityQuestion.answer) {
      newErrors.security = 'Incorrect answer. Try again.'
    }
    setErrors(newErrors)
    setTouched({ username: true, email: true, password: true, agreeTerms: true, security: true })
    return !Object.values(newErrors).some(e => e)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateAll()) return
    const { agreeTerms, ...registerData } = formData
    dispatch(registerUser(registerData))
  }

  const handleClose = () => {
    document.body.style.overflow = 'unset'
    navigate('/')
  }

  const handleBackdropClick = (e) => {
    if (cardRef.current && !cardRef.current.contains(e.target)) handleClose()
  }

  const inputBase = 'w-full bg-[#f2f3ff] rounded-2xl border px-5 py-3.5 pl-12 text-[#131b2e] placeholder-[#494454]/50 text-base transition-all duration-200 focus:outline-none focus:ring-4'
  const inputError = 'border-[#ba1a1a]/40 focus:border-[#ba1a1a] focus:ring-[#ba1a1a]/10'
  const inputNormal = 'border-[#cbc3d7]/40 focus:border-[#5312bc] focus:ring-[#5312bc]/10'

  // Success screen — NO countdown, just "Go to Login" button
  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-24 pb-6 px-4 sm:px-6" onClick={handleBackdropClick}>
        <div className="absolute inset-0 bg-[#131b2e]/70" />
        <div ref={cardRef} className="relative w-full max-w-[400px] mx-auto bg-white rounded-[2rem] border border-[#cbc3d7]/40 shadow-[0_25px_80px_-20px_rgba(83,18,188,0.25)] p-6 sm:p-8 text-center">
          <button onClick={handleClose} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#f2f3ff] hover:bg-[#e9ddff] flex items-center justify-center text-[#494454] hover:text-[#5312bc] transition-all duration-200">
            <CloseIcon />
          </button>

          <div className="w-16 h-16 rounded-full bg-[#006e2f]/10 flex items-center justify-center mx-auto mb-5 text-[#006e2f]">
            <CheckCircleIcon />
          </div>

          <h1 className="text-[#131b2e] text-xl font-extrabold mb-2 tracking-tight" style={{ fontFamily: 'Sora, Inter, system-ui, sans-serif' }}>
            Check Your Email!
          </h1>

          <p className="text-[#494454] text-sm mb-1.5 leading-relaxed">We've sent a verification link to:</p>
          <p className="text-[#5312bc] font-bold text-base mb-5 bg-[#5312bc]/5 rounded-xl py-2 px-4 inline-block break-all">{formData.email}</p>

          <div className="bg-[#f2f3ff] rounded-2xl p-4 mb-5 text-left border border-[#cbc3d7]/20">
            <p className="text-sm text-[#494454] font-medium mb-2">Next steps:</p>
            <ol className="text-sm text-[#494454] space-y-1.5 list-decimal list-inside">
              <li>Open your email inbox</li>
              <li>Click the verification link we sent</li>
              <li>Your account will be activated automatically</li>
              <li>Come back and log in</li>
            </ol>
          </div>

          <p className="text-xs text-[#494454]/60 mb-5">
            Didn't receive it? Check your spam folder or{' '}
            <button onClick={() => { setSubmitted(false); dispatch(clearMessage()) }} className="text-[#5312bc] font-semibold hover:underline">try again</button>
          </p>

          <Link to="/login" className="inline-block w-full bg-[#5312bc] text-white rounded-full py-3.5 font-bold text-base shadow-lg shadow-[#5312bc]/20 hover:bg-[#6b38d4] transition-all text-center" style={{ fontFamily: 'Sora, Inter, system-ui, sans-serif' }}>
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-24 pb-6 px-4 sm:px-6" onClick={handleBackdropClick}>
      <div className="absolute inset-0 bg-[#131b2e]/70" />
      <div ref={cardRef} className="relative w-full max-w-[400px] mx-auto bg-white rounded-[2rem] border border-[#cbc3d7]/40 shadow-[0_25px_80px_-20px_rgba(83,18,188,0.25)] p-6 sm:p-8">
        <button onClick={handleClose} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#f2f3ff] hover:bg-[#e9ddff] flex items-center justify-center text-[#494454] hover:text-[#5312bc] transition-all duration-200">
          <CloseIcon />
        </button>

        <div className="text-center mb-6">
          <h1 className="text-[#131b2e] text-2xl font-extrabold mb-1.5 tracking-tight" style={{ fontFamily: 'Sora, Inter, system-ui, sans-serif' }}>
            Create Account
          </h1>
          <p className="text-[#494454] text-sm font-medium">Start earning rewards in minutes</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Username */}
          <div>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5312bc]/60"><PersonIcon /></div>
              <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Username" minLength={3} maxLength={20} className={`${inputBase} ${touched.username && errors.username ? inputError : inputNormal} pr-4`} />
            </div>
            {touched.username && errors.username && (
              <p className="mt-1.5 text-xs text-[#ba1a1a] font-medium flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-[#ba1a1a]" />{errors.username}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5312bc]/60"><MailIcon /></div>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email address" className={`${inputBase} ${touched.email && errors.email ? inputError : inputNormal} pr-4`} />
            </div>
            {touched.email && errors.email && (
              <p className="mt-1.5 text-xs text-[#ba1a1a] font-medium flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-[#ba1a1a]" />{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5312bc]/60"><LockIcon /></div>
              <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="Password" minLength={8} maxLength={50} className={`${inputBase} ${touched.password && errors.password ? inputError : inputNormal} pr-12`} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7b7486] hover:text-[#5312bc] transition-colors p-1" title={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {touched.password && errors.password && (
              <p className="mt-1.5 text-xs text-[#ba1a1a] font-medium flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-[#ba1a1a]" />{errors.password}</p>
            )}
          </div>

          {/* Terms - Tick icon checkbox */}
          <div>
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5">
                <input type="checkbox" name="agreeTerms" checked={formData.agreeTerms} onChange={handleChange} className="peer sr-only" />
                <div className="w-5 h-5 rounded-md border-2 border-[#cbc3d7] bg-white peer-checked:bg-[#5312bc] peer-checked:border-[#5312bc] transition-all flex items-center justify-center">
                  <TickIcon />
                </div>
              </div>
              <span className="text-sm text-[#494454] leading-relaxed">
                I agree to the <Link to="/terms" className="text-[#5312bc] font-semibold hover:underline">Terms</Link> and <Link to="/privacy" className="text-[#5312bc] font-semibold hover:underline">Privacy Policy</Link>
              </span>
            </label>
            {touched.agreeTerms && errors.agreeTerms && (
              <p className="mt-1.5 text-xs text-[#ba1a1a] font-medium flex items-center gap-1 pl-8"><span className="w-1 h-1 rounded-full bg-[#ba1a1a]" />{errors.agreeTerms}</p>
            )}
          </div>

          {/* Security */}
          <div className="bg-[#f2f3ff] rounded-2xl p-3.5 border border-[#cbc3d7]/30">
            <p className="text-xs font-semibold text-[#494454] uppercase tracking-[0.08em] mb-2.5">Security Check</p>
            <div className="flex items-center gap-2.5">
              <span className="text-[#131b2e] font-bold text-base font-mono bg-white px-3 py-2 rounded-xl border border-[#cbc3d7]/30 whitespace-nowrap shrink-0">
                {securityQuestion.num1} {securityQuestion.operator} {securityQuestion.num2} = ?
              </span>
              <input type="number" value={securityQuestion.userAnswer} onChange={handleSecurityAnswer} placeholder="Answer" className={`flex-1 min-w-0 bg-white rounded-xl border px-3 py-2 text-[#131b2e] text-base focus:outline-none focus:ring-2 transition-all ${touched.security && errors.security ? 'border-[#ba1a1a] focus:ring-[#ba1a1a]/10' : 'border-[#cbc3d7]/30 focus:border-[#5312bc] focus:ring-[#5312bc]/10'}`} />
              <button type="button" onClick={generateSecurityQuestion} className="p-2 rounded-xl bg-white border border-[#cbc3d7]/30 text-[#494454] hover:text-[#5312bc] hover:border-[#5312bc]/30 transition-all shrink-0" title="New question">
                <RefreshIcon />
              </button>
            </div>
            {touched.security && errors.security && (
              <p className="mt-1.5 text-xs text-[#ba1a1a] font-medium flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-[#ba1a1a]" />{errors.security}</p>
            )}
          </div>

          {/* Backend Error - from Redux state.error */}
          {error && (
            <div className="p-3 bg-[#ba1a1a]/[0.08] border border-[#ba1a1a]/[0.15] rounded-xl text-[#ba1a1a] text-sm font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a] shrink-0" />{error}
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full bg-[#5312bc] text-white rounded-full py-3.5 font-bold text-base shadow-lg shadow-[#5312bc]/20 hover:bg-[#6b38d4] active:scale-[0.97] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2" style={{ fontFamily: 'Sora, Inter, system-ui, sans-serif' }}>
            {loading ? <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Account'}
          </button>
        </form>

        <div className="mt-5 text-center">
          <p className="text-[#494454] text-sm">
            Already have an account? <Link to="/login" className="font-bold text-[#5312bc] hover:text-[#6b38d4] transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage