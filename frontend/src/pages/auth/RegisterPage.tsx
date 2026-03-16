import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Check, Loader2 } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

function FinSightLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#0F9E64" />
      <path
        d="M16 22V14M12 18l4-4 4 4"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const features = [
  'AI-powered spending insights',
  'Privacy-first local processing',
  'Smart budgeting & forecasting',
]

interface FieldErrors {
  full_name?: string
  email?: string
  username?: string
  password?: string
  confirm_password?: string
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const register = useAuthStore((s) => s.register)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const fullNameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true })
    fullNameRef.current?.focus()
  }, [])

  function clearFieldError(field: keyof FieldErrors) {
    setFieldErrors((p) => ({ ...p, [field]: undefined }))
  }

  function validate(): FieldErrors {
    const errors: FieldErrors = {}
    if (!fullName.trim()) errors.full_name = 'Full name is required'
    if (!email) errors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email'
    if (!username.trim()) errors.username = 'Username is required'
    else if (username.length < 3) errors.username = 'Username must be at least 3 characters'
    if (!password) errors.password = 'Password is required'
    else if (password.length < 8) errors.password = 'Password must be at least 8 characters'
    if (!confirmPassword) errors.confirm_password = 'Please confirm your password'
    else if (password !== confirmPassword) errors.confirm_password = 'Passwords do not match'
    return errors
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})
    setError('')
    setLoading(true)
    try {
      await register({ email, username, full_name: fullName, password })
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Registration failed. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (hasError: boolean) =>
    `w-full h-11 px-3 text-sm border rounded-lg outline-none transition-all duration-150 bg-white text-gray-900 placeholder-gray-400 ${
      hasError
        ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100'
        : 'border-gray-200 focus:border-[#0F9E64] focus:ring-2 focus:ring-[#0F9E64]/10'
    }`

  return (
    <div className="flex h-screen">
      {/* Left panel */}
      <div className="flex flex-col justify-center w-full md:w-[55%] bg-[#FAFAFA] px-8 overflow-y-auto">
        <div className="w-full max-w-[400px] mx-auto py-10">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <FinSightLogo />
            <span className="text-[20px] font-bold text-gray-900">FinSight</span>
          </div>

          <h1 className="text-[28px] font-bold text-[#111] leading-tight">Create an account</h1>
          <p className="mt-1.5 text-sm text-gray-500">Start managing your finances smarter</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
            {/* Full name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
              <input
                ref={fullNameRef}
                type="text"
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); clearFieldError('full_name') }}
                placeholder="Jane Doe"
                className={inputClass(!!fieldErrors.full_name)}
                autoComplete="name"
              />
              {fieldErrors.full_name && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.full_name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearFieldError('email') }}
                placeholder="you@example.com"
                className={inputClass(!!fieldErrors.email)}
                autoComplete="email"
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
              )}
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); clearFieldError('username') }}
                placeholder="janedoe"
                className={inputClass(!!fieldErrors.username)}
                autoComplete="username"
              />
              {fieldErrors.username && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.username}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearFieldError('password') }}
                  placeholder="••••••••"
                  className={inputClass(!!fieldErrors.password) + ' pr-10'}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); clearFieldError('confirm_password') }}
                  placeholder="••••••••"
                  className={inputClass(!!fieldErrors.confirm_password) + ' pr-10'}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.confirm_password && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.confirm_password}</p>
              )}
            </div>

            {/* Error */}
            {error && <p className="text-sm text-red-500">{error}</p>}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#111] text-white rounded-lg text-sm font-semibold hover:bg-[#222] transition-colors duration-150 disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              Create account
            </button>
          </form>

          <p className="mt-6 text-sm text-gray-500 text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-[#0F9E64] font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right panel — hidden on mobile */}
      <div className="hidden md:flex flex-col items-center justify-center md:w-[45%] bg-[#111]">
        <div className="max-w-[320px] text-center">
          <p className="text-[36px] font-bold text-white leading-tight">FinSight</p>
          <p className="mt-2 text-base text-[#9CA3AF]">Your personal financial intelligence</p>

          <ul className="mt-10 space-y-3 text-left">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-[#9CA3AF]">
                <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                  <Check size={14} color="#0F9E64" strokeWidth={2.5} />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
