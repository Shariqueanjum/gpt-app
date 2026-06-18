import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

const CheckCircleIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#006e2f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const ErrorIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ba1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" />
  </svg>
)

const EmailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
)

const LoginIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" x2="3" y1="12" y2="12" />
  </svg>
)

const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const success = searchParams.get('success')
  const errorParam = searchParams.get('error')
  const isSuccess = success === 'true'

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => navigate('/login?verified=true'), 5000)
      return () => clearTimeout(timer)
    }
  }, [isSuccess, navigate])

  return (
    <div className="min-h-screen bg-[#faf8ff] flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Mesh gradient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-[140px] -translate-x-1/3 -translate-y-1/3" style={{ background: 'rgba(107, 56, 212, 0.06)' }} />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[140px] translate-x-1/3 translate-y-1/3" style={{ background: 'rgba(151, 244, 165, 0.05)' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] border border-[#cbc3d7]/40 shadow-[0_20px_60px_-15px_rgba(83,18,188,0.12)] p-8 md:p-10 text-center">
          {isSuccess ? (
            <>
              <div className="w-20 h-20 rounded-full bg-[#006e2f]/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircleIcon />
              </div>

              <h1 className="text-[#131b2e] text-2xl font-extrabold mb-3 tracking-tight" style={{ fontFamily: 'Sora, Inter, system-ui, sans-serif' }}>
                You're All Set!
              </h1>

              <p className="text-[#494454] text-base mb-2 leading-relaxed">
                Your email has been verified successfully. Your account is now active.
              </p>

              <div className="bg-[#f2f3ff] rounded-2xl p-4 mb-6 border border-[#cbc3d7]/20">
                <p className="text-sm text-[#494454] font-medium">
                  Redirecting to login in <span className="text-[#5312bc] font-bold">5 seconds</span>...
                </p>
              </div>

              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 w-full bg-[#5312bc] text-white rounded-full py-3.5 font-bold text-base shadow-lg shadow-[#5312bc]/20 hover:bg-[#6b38d4] transition-all"
                style={{ fontFamily: 'Sora, Inter, system-ui, sans-serif' }}
              >
                <LoginIcon /> Ready to earn rewards
              </Link>
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-[#ba1a1a]/10 flex items-center justify-center mx-auto mb-6">
                <ErrorIcon />
              </div>

              <h1 className="text-[#131b2e] text-2xl font-extrabold mb-3 tracking-tight" style={{ fontFamily: 'Sora, Inter, system-ui, sans-serif' }}>
                Verification Failed
              </h1>

              <p className="text-[#494454] text-base mb-6 leading-relaxed">
                {decodeURIComponent(errorParam || '') || 'This verification link is invalid or has expired.'}
              </p>

              <div className="bg-[#f2f3ff] rounded-2xl p-4 mb-6 border border-[#cbc3d7]/20 text-left">
                <p className="text-sm text-[#494454] font-medium mb-2 flex items-center gap-2">
                  <EmailIcon /> Link expired or invalid
                </p>
                <p className="text-xs text-[#494454]/70">
                  The verification link may have expired or already been used. Please request a new one.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 w-full bg-[#5312bc] text-white rounded-full py-3.5 font-bold text-base shadow-lg shadow-[#5312bc]/20 hover:bg-[#6b38d4] transition-all"
                  style={{ fontFamily: 'Sora, Inter, system-ui, sans-serif' }}
                >
                  <EmailIcon /> Resend verification email
                </Link>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center gap-2 w-full bg-[#f2f3ff] text-[#5312bc] rounded-full py-3.5 font-bold text-base border border-[#cbc3d7]/40 hover:bg-[#e9ddff] transition-all"
                >
                  <HomeIcon /> Back to Home
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default VerifyEmailPage