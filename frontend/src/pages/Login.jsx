import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HiEnvelope, HiLockClosed, HiEye, HiEyeSlash } from 'react-icons/hi2'
import { FcGoogle } from 'react-icons/fc'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import Input from '../components/Input'
import Button from '../components/Button'
import Toast from '../components/Toast'
import { useAuth, ROLE_ROUTES } from '../context/AuthContext'

/* ── Validation ─────────────────────────────────────────────────── */
function validate(email, password) {
  const errors = {}
  if (!email.trim())
    errors.email = 'Please enter your email address.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = 'Please enter a valid email address.'
  if (!password)
    errors.password = 'Please enter your password.'
  else if (password.length < 8)
    errors.password = 'Password must be at least 8 characters.'
  return errors
}

/* ── Component ──────────────────────────────────────────────────── */
export default function Login({ isDark, onToggleTheme }) {
  const navigate  = useNavigate()
  const { login } = useAuth()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [errors,   setErrors]   = useState({})
  const [touched,  setTouched]  = useState({})
  const [loading,  setLoading]  = useState(false)
  const [toast,    setToast]    = useState(null)

  const clearError = field =>
    setErrors(prev => { const n = { ...prev }; delete n[field]; return n })

  const handleBlur = field => () =>
    setTouched(prev => ({ ...prev, [field]: true }))

  const handleSubmit = async e => {
    e.preventDefault()
    setTouched({ email: true, password: true })
    const errs = validate(email, password)
    if (Object.keys(errs).length) { setErrors(errs); return }

    try {
      setLoading(true)
      const userData = await login(email, password)
      setToast({ type: 'success', message: `Welcome back, ${userData.first_name || userData.username}!` })
      setTimeout(() => navigate(ROLE_ROUTES[userData.role] ?? '/dashboard'), 700)
    } catch (err) {
      setLoading(false)
      const detail = err.response?.data?.detail || 'An error occurred during login.'
      setErrors({ password: detail })
      setToast({ type: 'error', message: detail })
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--bg)' }}
    >
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* ── Top bar ── */}
      <header className="flex items-center justify-between px-6 py-4 flex-shrink-0">
        <Logo variant="full" theme={isDark ? 'dark' : 'light'} />
        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[420px] fade-in">

          {/* ── Card ── */}
          <div
            className="rounded-[var(--r-xl)] shadow-[var(--shadow-lg)] overflow-hidden"
            style={{
              background: isDark
                ? 'rgba(30,41,59,0.95)'
                : 'rgba(255,255,255,1)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'var(--border)'}`,
            }}
          >
            {/* Gradient top bar */}
            <div
              className="h-1.5 w-full"
              style={{ background: 'linear-gradient(90deg, #1E3A8A, #4F46E5)' }}
            />

            <div className="px-8 py-9">

              {/* Header */}
              <div className="mb-7">
                <h1
                  className="text-2xl font-extrabold mb-1.5"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}
                >
                  Sign in to Orbit Social
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Welcome back. Enter your credentials to continue.
                </p>
              </div>

              {/* Google SSO */}
              <button
                type="button"
                className="w-full h-11 rounded-[var(--r-md)] border flex items-center justify-center gap-2.5 text-sm font-medium mb-5 transition-all duration-200 hover:shadow-[var(--shadow-sm)] active:scale-[.99]"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.04)' : '#fff',
                  borderColor: 'var(--border)',
                  color: 'var(--text)',
                }}
              >
                <FcGoogle size={18} aria-hidden="true" />
                Continue with Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                <span className="text-xs font-medium px-1" style={{ color: 'var(--text-subtle)' }}>
                  or sign in with email
                </span>
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

                {/* Email */}
                <Input
                  label="Email address"
                  type="email"
                  required
                  placeholder="you@company.com"
                  leftIcon={<HiEnvelope size={16} />}
                  value={email}
                  onChange={e => { setEmail(e.target.value); clearError('email') }}
                  onBlur={handleBlur('email')}
                  error={touched.email ? errors.email : undefined}
                  valid={touched.email && !errors.email && email.trim().length > 0}
                  autoComplete="email"
                />

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="login-password"
                      className="text-sm font-medium"
                      style={{ color: 'var(--text)' }}
                    >
                      Password{' '}
                      <span style={{ color: '#EF4444' }} aria-hidden="true">*</span>
                    </label>
                    <a
                      href="#"
                      className="text-xs font-semibold transition-colors hover:underline"
                      style={{ color: 'var(--primary)' }}
                    >
                      Forgot password?
                    </a>
                  </div>
                  <Input
                    id="login-password"
                    type={showPass ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    leftIcon={<HiLockClosed size={16} />}
                    value={password}
                    onChange={e => { setPassword(e.target.value); clearError('password') }}
                    onBlur={handleBlur('password')}
                    error={touched.password ? errors.password : undefined}
                    valid={touched.password && !errors.password && password.length >= 8}
                    autoComplete="current-password"
                    rightSlot={
                      <button
                        type="button"
                        onClick={() => setShowPass(v => !v)}
                        aria-label={showPass ? 'Hide password' : 'Show password'}
                        style={{
                          color: 'var(--text-subtle)',
                          background: 'none', border: 'none',
                          cursor: 'pointer', padding: 0, display: 'flex',
                        }}
                      >
                        {showPass ? <HiEyeSlash size={17} /> : <HiEye size={17} />}
                      </button>
                    }
                  />
                </div>

                {/* Remember me */}
                <label className="flex items-center gap-2.5 cursor-pointer w-fit select-none">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={e => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded cursor-pointer"
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Remember me for 30 days
                  </span>
                </label>

                {/* Submit */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  className="w-full mt-1"
                >
                  {loading ? 'Signing in…' : 'Sign in'}
                </Button>
              </form>

              {/* Footer link */}
              <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
                Don't have an account?{' '}
                <Link
                  to="/role-selection"
                  className="font-semibold hover:underline transition-colors"
                  style={{ color: 'var(--primary)' }}
                >
                  Create one free
                </Link>
              </p>

            </div>
          </div>

          {/* Trust badges */}
          <div
            className="flex items-center justify-center gap-4 mt-5 text-xs"
            style={{ color: 'var(--text-subtle)' }}
          >
            <span className="flex items-center gap-1">
              <span aria-hidden="true">🔒</span> 256-bit encryption
            </span>
            <span aria-hidden="true">·</span>
            <span>SOC 2 compliant</span>
            <span aria-hidden="true">·</span>
            <span>GDPR ready</span>
          </div>

        </div>
      </main>
    </div>
  )
}
