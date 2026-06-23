// ============================================================
// ForgotPasswordPage.jsx — Request password reset link (MODAL)
// API: POST /api/auth/forgot-password { email_or_username }
// ============================================================
import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axiosInstance from '../utils/axiosInstance'

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
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

const ForgotPasswordPage = () => {
  const navigate = useNavigate()
  const cardRef = useRef(null)

  const [identifier, setIdentifier] = useState('')
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
    if (!identifier.trim()) {
      setError('Email or username is required')
      return
    }
    try {
      setLoading(true)
      await axiosInstance.post('/auth/forgot-password', { email_or_username: identifier.trim() })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
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
              Check Your Email
            </h2>
            <p className="text-[#494454] text-sm mb-8 leading-relaxed">
              If an account exists with <span className="font-semibold text-[#131b2e]">{identifier}</span>, we have sent a password reset link. Please check your inbox.
            </p>
            <button
              onClick={handleClose}
              className="inline-block bg-[#5312bc] text-white rounded-full px-10 py-3.5 font-bold text-sm shadow-lg shadow-[#5312bc]/20 hover:bg-[#6b38d4] transition-all"
            >
              Back to Home
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-[#131b2e] text-2xl sm:text-3xl font-extrabold mb-2 tracking-tight" style={{ fontFamily: 'Sora, Inter, system-ui, sans-serif' }}>
                Forgot Password?
              </h1>
              <p className="text-[#494454] text-sm sm:text-base font-medium">
                Enter your email or username and we will send you a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5312bc]/60"><UserIcon /></div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => { setIdentifier(e.target.value); setError('') }}
                    placeholder="Email or Username"
                    className={`${inputBase} ${error ? inputError : inputNormal} pr-4`}
                  />
                </div>
                {error && (
                  <p className="mt-2 text-sm text-[#ba1a1a] font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]" />{error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#5312bc] text-white rounded-full py-4 font-bold text-base shadow-lg shadow-[#5312bc]/20 hover:bg-[#6b38d4] active:scale-[0.97] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ fontFamily: 'Sora, Inter, system-ui, sans-serif' }}
              >
                {loading ? <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Send Reset Link'}
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

export default ForgotPasswordPage