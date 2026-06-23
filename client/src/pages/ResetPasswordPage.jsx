// ============================================================
// ResetPasswordPage.jsx — Reset password via token (MODAL)
// API: POST /api/auth/reset-password { token, new_password }
// ============================================================
import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import axiosInstance from '../utils/axiosInstance'

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
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
    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />
  </svg>
)

const ArrowLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
  </svg>
)

const ResetPasswordPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const cardRef = useRef(null)

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = 'unset' }
  }, [])

  const handleClose = () => {
    document.body.style.overflow = 'unset'
    navigate('/')
  }

  const handleBackdropClick = (e) => {
    if (cardRef.current && !cardRef.current.contains(e.target)) {
      handleClose()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!token) {
      setError('Invalid or expired reset link.')
      return
    }
    if (!password) {
      setError('Password is required')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(password)) {
      setError('Password must contain uppercase, lowercase, number and special character')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      setLoading(true)
      await axiosInstance.post('/auth/reset-password', { token, new_password: password })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  const inputBase = 'w-full bg-[#f2f3ff] rounded-2xl border px-5 py-4 pl-12 text-[#131b2e] placeholder-[#494454]/50 text-base transition-all duration-200 focus:outline-none focus:ring-4'
  const inputError = 'border-[#ba1a1a]/40 focus:border-[#ba1a1a] focus:ring-[#ba1a1a]/10'
  const inputNormal = 'border-[#cbc3d7]/40 focus:border-[#5312bc] focus:ring-[#5312bc]/10'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6" onClick={handleBackdropClick}>
      <div className="absolute inset-0 bg-[#131b2e]/70" />

      <div ref={cardRef} className="relative w-full max-w-[460px] mx-auto bg-white rounded-[2rem] border border-[#cbc3d7]/40 shadow-[0_25px_80px_-20px_rgba(83,18,188,0.25)] p-7 sm:p-10">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#f2f3ff] hover:bg-[#e9ddff] flex items-center justify-center text-[#494454] hover:text-[#5312bc] transition-all duration-200 z-10"
        >
          <CloseIcon />
        </button>

        {success ? (
          <div className="text-center py-6">
            <div className="flex justify-center mb-5"><CheckCircleIcon /></div>
            <h2 className="text-[#131b2e] text-2xl font-extrabold mb-3" style={{ fontFamily: 'Sora, Inter, system-ui, sans-serif' }}>
              Password Reset!
            </h2>
            <p className="text-[#494454] text-sm mb-8 leading-relaxed">
              Your password has been reset successfully. You can now log in with your new password.
            </p>
            <Link to="/login" className="inline-block bg-[#5312bc] text-white rounded-full px-10 py-3.5 font-bold text-sm shadow-lg shadow-[#5312bc]/20 hover:bg-[#6b38d4] transition-all">
              Go to Login
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-[#131b2e] text-2xl sm:text-3xl font-extrabold mb-2 tracking-tight" style={{ fontFamily: 'Sora, Inter, system-ui, sans-serif' }}>
                Reset Password
              </h1>
              <p className="text-[#494454] text-sm sm:text-base font-medium">
                Enter your new password below.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5312bc]/60"><LockIcon /></div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError('') }}
                    placeholder="New Password"
                    className={`${inputBase} ${error ? inputError : inputNormal} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7b7486] hover:text-[#5312bc] transition-colors p-1"
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <div>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5312bc]/60"><LockIcon /></div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError('') }}
                    placeholder="Confirm Password"
                    className={`${inputBase} ${error ? inputError : inputNormal} pr-4`}
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-[#ba1a1a] font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]" />{error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !token}
                className="w-full bg-[#5312bc] text-white rounded-full py-4 font-bold text-base shadow-lg shadow-[#5312bc]/20 hover:bg-[#6b38d4] active:scale-[0.97] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ fontFamily: 'Sora, Inter, system-ui, sans-serif' }}
              >
                {loading ? <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Reset Password'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-[#5312bc] hover:text-[#6b38d4] transition-colors">
                <ArrowLeftIcon /> Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ResetPasswordPage