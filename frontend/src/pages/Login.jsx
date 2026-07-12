import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HiEnvelope, HiLockClosed, HiEye, HiEyeSlash } from 'react-icons/hi2'
import { FcGoogle } from 'react-icons/fc'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import Input from '../components/Input'
import Button from '../components/Button'
import Toast from '../components/Toast'

/**
 * Login page
 * - Field-level validation with user-friendly messages.
 * - Toast notifications for every outcome:
 *     ✅ Login Successful
 *     ❌ Invalid email address
 *     ❌ Incorrect password
 *     ❌ Please fill in all required fields
 * - Loading spinner while "API" call runs.
 * - On success: shows success toast then navigates to /dashboard.
 */

// ── Validation ─────────────────────────────────────────────────────
function validate(email, password) {
  const errors = {}

  if (!email.trim())
    errors.email = 'Email address is required.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = 'Please enter a valid email address.'

  if (!password)
    errors.password = 'Password is required.'
  else if (password.length < 8)
    errors.password = 'Password must be at least 8 characters.'

  return errors
}

export default function Login({ isDark, onToggleTheme }) {
  const navigate = useNavigate()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [errors,   setErrors]   = useState({})
  const [loading,  setLoading]  = useState(false)
  const [toast,    setToast]    = useState(null)

  // Clear a specific field error when the user edits that field
  const clearError = (field) => {
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // 1. Check for empty fields first
    if (!email.trim() && !password) {
      setToast({ type: 'error', message: 'Please fill in all required fields.' })
      setErrors({
        email:    'Email address is required.',
        password: 'Password is required.',
      })
      return
    }

    // 2. Field-level validation
    const errs = validate(email, password)
    if (Object.keys(errs).length) {
      setErrors(errs)
      // Show the most relevant error as a toast
      const firstMessage = Object.values(errs)[0]
      setToast({ type: 'error', message: firstMessage })
      return
    }

    // 3. Simulate API call ─────────────────────────────────────────
    setLoading(true)
    await new Promise(r => setTimeout(r, 1400))

    // ── Simulated responses ───────────────────────────────────────
    // For demo purposes: any email that starts with "wrong@" triggers
    // "Account not found", anything with wrong password length shows
    // "Incorrect password". Remove this block when wiring real API.
    if (email.toLowerCase().startsWith('wrong@')) {
      setLoading(false)
      setErrors({ email: 'No account found with this email.' })
      setToast({ type: 'error', message: '❌ Account not found.' })
      return
    }
    if (password === '00000000') {
      setLoading(false)
      setErrors({ password: 'The password you entered is incorrect.' })
      setToast({ type: 'error', message: '❌ Incorrect password. Please try again.' })
      return
    }
    // ─────────────────────────────────────────────────────────────

    setLoading(false)
    setToast({ type: 'success', message: '✅ Login successful! Redirecting…' })

    // Navigate to dashboard after the toast is visible
    setTimeout(() => navigate('/dashboard'), 1800)
  }

  return (
    <div className="min-h-screen bg-mesh flex flex-col">

      {/* Toast notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <Logo variant="full" theme={isDark ? 'dark' : 'light'} />
        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md fade-in">

          {/* Glassmorphism card */}
          <div
            className="relative overflow-hidden rounded-[var(--r-xl)] shadow-[var(--shadow-lg)] px-8 py-10"
            style={{
              background: isDark ? 'rgba(23,32,51,0.80)' : 'rgba(255,255,255,0.90)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
            }}
          >
            {/* Decorative blob */}
            <div
              className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl pointer-events-none opacity-20"
              style={{ background: 'radial-gradient(circle, var(--primary), transparent)' }}
              aria-hidden="true"
            />

            <div className="relative z-10">

              {/* ── Header ── */}
              <div className="text-center mb-8">
                <h1
                  className="text-2xl sm:text-3xl font-extrabold mb-2"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}
                >
                  Welcome Back
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Sign in to continue managing your social media accounts.
                </p>
              </div>

              {/* ── Google button (UI only) ── */}
              <button
                type="button"
                className="w-full h-11 rounded-[var(--r-md)] border flex items-center justify-center gap-2 text-sm font-medium mb-6 transition-all duration-200 hover:shadow-[var(--shadow-sm)]"
                style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }}
              >
                <FcGoogle size={18} aria-hidden="true" />
                Continue with Google
              </button>

              {/* ── Divider ── */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} aria-hidden="true" />
                <span className="text-xs font-medium" style={{ color: 'var(--text-subtle)' }}>
                  or continue with email
                </span>
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} aria-hidden="true" />
              </div>

              {/* ── Form ── */}
              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

                {/* Email */}
                <Input
                  label="Email address"
                  type="email"
                  required
                  placeholder="alex@example.com"
                  leftIcon={<HiEnvelope size={16} />}
                  value={email}
                  onChange={e => { setEmail(e.target.value); clearError('email') }}
                  error={errors.email}
                  autoComplete="email"
                />

                {/* Password — label row has Forgot password link */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="input-password"
                      className="text-sm font-medium"
                      style={{ color: 'var(--text)' }}
                    >
                      Password <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <a
                      href="#"
                      className="text-xs font-semibold hover:underline"
                      style={{ color: 'var(--primary)' }}
                    >
                      Forgot password?
                    </a>
                  </div>
                  <Input
                    id="input-password"
                    type={showPass ? 'text' : 'password'}
                    placeholder="Your password"
                    leftIcon={<HiLockClosed size={16} />}
                    value={password}
                    onChange={e => { setPassword(e.target.value); clearError('password') }}
                    error={errors.password}
                    autoComplete="current-password"
                    rightSlot={
                      <button
                        type="button"
                        onClick={() => setShowPass(v => !v)}
                        aria-label={showPass ? 'Hide password' : 'Show password'}
                        style={{
                          color: 'var(--text-subtle)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0,
                          display: 'flex',
                        }}
                      >
                        {showPass ? <HiEyeSlash size={17} /> : <HiEye size={17} />}
                      </button>
                    }
                  />
                </div>

                {/* Remember me */}
                <label className="flex items-center gap-2.5 cursor-pointer w-fit">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={e => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded cursor-pointer"
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Remember me
                  </span>
                </label>

                {/* Submit */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  className="w-full mt-2"
                >
                  {loading ? 'Signing in…' : 'Sign in'}
                </Button>
              </form>

              {/* Sign-up link */}
              <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
                Don't have an account?{' '}
                <Link
                  to="/role-selection"
                  className="font-semibold hover:underline"
                  style={{ color: 'var(--primary)' }}
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>

          {/* Trust note */}
          <p
            className="text-center text-xs mt-5 flex items-center justify-center gap-3"
            style={{ color: 'var(--text-subtle)' }}
          >
            <span>🔒 256-bit encryption</span>
            <span>·</span>
            <span>SOC 2 compliant</span>
          </p>
        </div>
      </div>
    </div>
  )
}
