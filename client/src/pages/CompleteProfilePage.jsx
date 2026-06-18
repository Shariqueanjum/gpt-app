import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../utils/axiosInstance'
import { fetchCurrentUser } from '../slices/authSlice'

const PersonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
)
const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)
const GenderIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M12 8v8" /><path d="M8 12h8" />
  </svg>
)
const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const ChevronDown = () => (
  <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

// ── Custom dropdown — opens upward, fully contained inside card ───────────────
const CustomSelect = ({ value, onChange, options, placeholder, hasError }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selected = options.find((o) => o.value === value)

  return (
    <div ref={ref} className="relative w-full">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`w-full bg-[#f2f3ff] rounded-2xl border px-4 py-3.5 text-base flex items-center justify-between gap-2 transition-all duration-200 focus:outline-none focus:ring-4
          ${hasError
            ? 'border-[#ba1a1a]/40 focus:border-[#ba1a1a] focus:ring-[#ba1a1a]/10'
            : open
              ? 'border-[#5312bc] ring-4 ring-[#5312bc]/10'
              : 'border-[#cbc3d7]/40'
          }`}
      >
        <span className={`truncate text-sm ${selected ? 'text-[#131b2e]' : 'text-[#494454]/50'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <span className={`text-[#494454] transition-transform duration-200 shrink-0 ${open ? 'rotate-180' : ''}`}>
          <ChevronDown />
        </span>
      </button>

      {/* List — always opens UPWARD (bottom-full) so it never goes below the card */}
      {open && (
        <ul
          className="absolute bottom-full left-0 right-0 mb-1.5 bg-white border border-[#cbc3d7]/60 rounded-2xl shadow-xl shadow-[#5312bc]/10 overflow-y-auto z-[60]"
          style={{ maxHeight: '160px' }}
        >
          {options.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false) }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-150 first:rounded-t-2xl last:rounded-b-2xl
                  ${opt.value === value
                    ? 'bg-[#5312bc]/10 text-[#5312bc] font-semibold'
                    : 'text-[#131b2e] hover:bg-[#f2f3ff]'
                  }`}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

const CompleteProfilePage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const cardRef = useRef(null)

  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [touched, setTouched] = useState({})
  const [formData, setFormData] = useState({ full_name: '', dob: '', gender: '' })
  const [errors, setErrors]     = useState({ full_name: '', dob: '', gender: '' })
  const [dobDay, setDobDay]     = useState('')
  const [dobMonth, setDobMonth] = useState('')
  const [dobYear, setDobYear]   = useState('')

  // Keep body scroll locked — dashboard visible but frozen behind overlay
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = 'unset' }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) { navigate('/'); return }
    if (user?.profile_completion >= 30) { navigate('/dashboard') }
    if (user) {
      setFormData((prev) => ({ ...prev, full_name: user.full_name || '', gender: user.gender || '' }))
      if (user.dob) {
        const dateStr = user.dob.split('T')[0]
        const parts = dateStr.split('-')
        if (parts.length === 3) {
          setDobYear(parts[0]); setDobMonth(parts[1]); setDobDay(parts[2])
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
      case 'dob': {
        if (!value) return 'Date of birth is required'
        const age = new Date().getFullYear() - new Date(value).getFullYear()
        if (age < 13) return 'You must be at least 13 years old'
        if (age > 100) return 'Please enter a valid date of birth'
        return ''
      }
      case 'gender':
        return value ? '' : 'Please select your gender'
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

  const handleDobDay   = (val) => { setDobDay(val);   updateDob(val, dobMonth, dobYear); setError('') }
  const handleDobMonth = (val) => { setDobMonth(val); updateDob(dobDay, val, dobYear);   setError('') }
  const handleDobYear  = (val) => { setDobYear(val);  updateDob(dobDay, dobMonth, val);  setError('') }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    setTouched({ ...touched, [name]: true })
    setErrors({ ...errors, [name]: validateField(name, value) })
    setError('')
  }

  const handleGenderChange = (val) => {
    setFormData({ ...formData, gender: val })
    setTouched({ ...touched, gender: true })
    setErrors({ ...errors, gender: validateField('gender', val) })
    setError('')
  }

  const validateAll = () => {
    const newErrors = {
      full_name: validateField('full_name', formData.full_name),
      dob:       validateField('dob',       formData.dob),
      gender:    validateField('gender',    formData.gender),
    }
    setErrors(newErrors)
    setTouched({ full_name: true, dob: true, gender: true })
    return !Object.values(newErrors).some(Boolean)
  }

  const handleSubmit = async () => {
    if (!validateAll()) { setError('Please fill all required fields correctly'); return }
    setLoading(true); setError('')
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

  const dayOptions = Array.from({ length: 31 }, (_, i) => {
    const v = String(i + 1).padStart(2, '0'); return { value: v, label: v }
  })
  const monthOptions = [
    { value: '01', label: 'Jan' }, { value: '02', label: 'Feb' },
    { value: '03', label: 'Mar' }, { value: '04', label: 'Apr' },
    { value: '05', label: 'May' }, { value: '06', label: 'Jun' },
    { value: '07', label: 'Jul' }, { value: '08', label: 'Aug' },
    { value: '09', label: 'Sep' }, { value: '10', label: 'Oct' },
    { value: '11', label: 'Nov' }, { value: '12', label: 'Dec' },
  ]
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 88 }, (_, i) => {
    const y = String(currentYear - 13 - i); return { value: y, label: y }
  })
  const genderOptions = [
    { value: 'male',              label: 'Male' },
    { value: 'female',            label: 'Female' },
    { value: 'other',             label: 'Other' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-24 pb-6 px-4 sm:px-6">
      {/* Backdrop — blocks clicks on dashboard */}
      <div className="absolute inset-0 bg-[#131b2e]/40" />

      <div
        ref={cardRef}
        className="relative w-full max-w-[420px] mx-auto bg-white rounded-[2rem] border border-[#cbc3d7]/40 shadow-[0_25px_80px_-20px_rgba(83,18,188,0.2)] p-6 sm:p-8"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#5312bc]/10 flex items-center justify-center mx-auto mb-4 text-[#5312bc]">
            <PersonIcon />
          </div>
          <h1
            className="text-[#131b2e] text-2xl font-extrabold mb-2 tracking-tight"
            style={{ fontFamily: 'Sora, Inter, system-ui, sans-serif' }}
          >
            Complete Your Profile
          </h1>
          <p className="text-[#494454] text-sm font-medium">Required before you start earning</p>
        </div>

        {/* Global error */}
        {error && (
          <div className="mb-4 p-3 bg-[#ba1a1a]/[0.08] border border-[#ba1a1a]/[0.15] rounded-xl text-[#ba1a1a] text-sm font-semibold flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a] shrink-0" />
            {error}
          </div>
        )}

        {/* Form */}
        <div className="space-y-5">

          {/* Full Name */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-[#494454] uppercase tracking-[0.08em] mb-2.5">
              <PersonIcon /> Full Name
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={`w-full bg-[#f2f3ff] rounded-2xl border px-5 py-3.5 text-[#131b2e] placeholder-[#494454]/50 text-base transition-all duration-200 focus:outline-none focus:ring-4
                ${touched.full_name && errors.full_name
                  ? 'border-[#ba1a1a]/40 focus:border-[#ba1a1a] focus:ring-[#ba1a1a]/10'
                  : 'border-[#cbc3d7]/40 focus:border-[#5312bc] focus:ring-[#5312bc]/10'}`}
            />
            {touched.full_name && errors.full_name && (
              <p className="mt-1.5 text-xs text-[#ba1a1a] font-medium">{errors.full_name}</p>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-[#494454] uppercase tracking-[0.08em] mb-2.5">
              <CalendarIcon /> Date of Birth <span className="text-[#ba1a1a]">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <CustomSelect value={dobDay}   onChange={handleDobDay}   options={dayOptions}   placeholder="Day"  hasError={touched.dob && !!errors.dob} />
              <CustomSelect value={dobMonth} onChange={handleDobMonth} options={monthOptions} placeholder="Mon"  hasError={touched.dob && !!errors.dob} />
              <CustomSelect value={dobYear}  onChange={handleDobYear}  options={yearOptions}  placeholder="Year" hasError={touched.dob && !!errors.dob} />
            </div>
            {touched.dob && errors.dob && (
              <p className="mt-1.5 text-xs text-[#ba1a1a] font-medium">{errors.dob}</p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-[#494454] uppercase tracking-[0.08em] mb-2.5">
              <GenderIcon /> Gender <span className="text-[#ba1a1a]">*</span>
            </label>
            <CustomSelect
              value={formData.gender}
              onChange={handleGenderChange}
              options={genderOptions}
              placeholder="Select gender"
              hasError={touched.gender && !!errors.gender}
            />
            {touched.gender && errors.gender && (
              <p className="mt-1.5 text-xs text-[#ba1a1a] font-medium">{errors.gender}</p>
            )}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#5312bc] text-white rounded-full py-3.5 font-bold text-base shadow-lg shadow-[#5312bc]/20 hover:bg-[#6b38d4] active:scale-[0.97] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            style={{ fontFamily: 'Sora, Inter, system-ui, sans-serif' }}
          >
            {loading
              ? <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><CheckIcon /> Complete Profile</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}

export default CompleteProfilePage