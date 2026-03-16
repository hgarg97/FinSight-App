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

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})

  const emailRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true })
    emailRef.current?.focus()
  }, [])

  function validate() {
    const errors: { email?: string; password?: string } = {}
    if (!email) errors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email'
    if (!password) errors.password = 'Password is required'
    else if (password.length < 8) errors.password = 'Password must be at least 8 characters'
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
      await login(email, password)
      navigate('/', { replace: true })
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Invalid email or password'
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
      <div className="flex flex-col justify-center w-full md:w-[55%] bg-[#FAFAFA] px-8">
        <div className="w-full max-w-[400px] mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-10">
            <FinSightLogo />
            <span className="text-[20px] font-bold text-gray-900">FinSight</span>
          </div>

          <h1 className="text-[28px] font-bold text-[#111] leading-tight">Welcome back</h1>
          <p className="mt-1.5 text-sm text-gray-500">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                ref={emailRef}
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: undefined })) }}
                placeholder="you@example.com"
                className={inputClass(!!fieldErrors.email)}
                autoComplete="email"
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: undefined })) }}
                  placeholder="••••••••"
                  className={inputClass(!!fieldErrors.password) + ' pr-10'}
                  autoComplete="current-password"
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

            {/* Error */}
            {error && <p className="text-sm text-red-500">{error}</p>}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#111] text-white rounded-lg text-sm font-semibold hover:bg-[#222] transition-colors duration-150 disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              Sign in
            </button>
          </form>

          <p className="mt-6 text-sm text-gray-500 text-center">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#0F9E64] font-medium hover:underline">
              Sign up
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
