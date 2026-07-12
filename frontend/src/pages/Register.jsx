import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  HiUser, HiAtSymbol, HiEnvelope, HiPhone,
  HiLockClosed, HiEye, HiEyeSlash,
  HiCheckCircle, HiArrowLeft, HiBriefcase,
  HiExclamationCircle,
} from 'react-icons/hi2'
import { FcGoogle } from 'react-icons/fc'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import Input from '../components/Input'
import Button from '../components/Button'
import Toast from '../components/Toast'

/* ─────────────────────────────────────────────────────────────────
   sessionStorage persistence
   ───────────────────────────────────────────────────────────────── */
const SESSION_KEY = 'orbit-register-draft'

const ROLE_LABELS = {
  creator:   'Creator',
  business:  'Business',
  agency:    'Agency',
  marketing: 'Marketing Team',
}

const EMPTY_FORM = {
  fullName: '', username: '', email: '',
  phone: '', password: '', confirmPassword: '', terms: false,
}

function loadDraft() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null') }
  catch { return null }
}
function saveDraft(data) {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(data)) }
  catch { /* ignore */ }
}
function clearDraft() {
  try { sessionStorage.removeItem(SESSION_KEY) }
  catch { /* ignore */ }
}

/* ─────────────────────────────────────────────────────────────────
   Password strength (5 levels, all criteria visible to user)
   ───────────────────────────────────────────────────────────────── */
function getStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '' }
  let s = 0
  if (pw.length >= 8)           s++
  if (pw.length >= 12)          s++
  if (/[A-Z]/.test(pw))         s++
  if (/[0-9]/.test(pw))         s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  const levels = [
    { score: 0, label: '',            color: '' },
    { score: 1, label: 'Very weak',   color: '#EF4444' },
    { score: 2, label: 'Weak',        color: '#F59E0B' },
    { score: 3, label: 'Fair',        color: '#A7B6D0' },
    { score: 4, label: 'Strong',      color: '#16A34A' },
    { score: 5, label: 'Very strong', color: '#15803D' },
  ]
  return levels[s]
}

/* ─────────────────────────────────────────────────────────────────
   Individual field validators — return error string or ''
   These are called both on blur and on submit.
   ───────────────────────────────────────────────────────────────── */
const validators = {
  fullName(v) {
    if (!v.trim())         return 'Please enter your full name.'
    if (v.trim().length < 3) return 'Full name must be at least 3 characters.'
    return ''
  },
  username(v) {
    if (!v.trim())              return 'Please choose a username.'
    if (v.includes('@'))        return 'Username cannot contain an email address.'
    if (/\s/.test(v))           return 'Username cannot contain spaces.'
    if (v.length < 4)           return 'Username must be at least 4 characters.'
    if (v.length > 20)          return 'Username must be 20 characters or fewer.'
    if (!/^[a-zA-Z0-9_]+$/.test(v))
                                return 'Username can only contain letters, numbers and underscores.'
    return ''
  },
  email(v) {
    if (!v.trim())         return 'Please enter your email address.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
                           return 'Please enter a valid email address.'
    return ''
  },
  phone(v) {
    const digits = v.replace(/\D/g, '')
    if (!v.trim())         return 'Please enter your phone number.'
    if (!/^\d+$/.test(digits)) return 'Phone number must contain digits only.'
    if (digits.length !== 10)  return 'Please enter a valid 10-digit phone number.'
    return ''
  },
  password(v) {
    if (!v)                return 'Please create a password.'
    if (v.length < 8)      return 'Password must be at least 8 characters.'
    if (!/[A-Z]/.test(v))  return 'Password must include at least one uppercase letter.'
    if (!/[a-z]/.test(v))  return 'Password must include at least one lowercase letter.'
    if (!/[0-9]/.test(v))  return 'Password must include at least one number.'
    if (!/[^A-Za-z0-9]/.test(v)) return 'Password must include at least one special character.'
    return ''
  },
  confirmPassword(v, form) {
    if (!v)                    return 'Please confirm your password.'
    if (v !== form.password)   return 'Passwords do not match.'
    return ''
  },
}

function validateAll(form) {
  const errors = {}
  const fields = ['fullName', 'username', 'email', 'phone', 'password', 'confirmPassword']
  fields.forEach(k => {
    const msg = k === 'confirmPassword'
      ? validators.confirmPassword(form[k], form)
      : validators[k](form[k])
    if (msg) errors[k] = msg
  })
  if (!form.terms) errors.terms = 'Please accept the Terms & Conditions before creating your account.'
  return errors
}

/* ─────────────────────────────────────────────────────────────────
   Component
   ───────────────────────────────────────────────────────────────── */
export default function Register({ isDark, onToggleTheme }) {
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const urlRole   = params.get('role') || ''
  const draft     = loadDraft()
  const roleId    = urlRole || draft?.roleId || ''
  const roleLabel = ROLE_LABELS[roleId] || ''

  /* Form state — rehydrate from sessionStorage on mount */
  const [form, setForm] = useState(() => {
    if (draft) {
      const { roleId: _r, ...fields } = draft
      return { ...EMPTY_FORM, ...fields }
    }
    return { ...EMPTY_FORM }
  })

  /* Which fields have been touched (blurred at least once) */
  const [touched,     setTouched]     = useState({})
  /* Errors object — keyed by field name */
  const [errors,      setErrors]      = useState({})
  /* Whether we've attempted a submit (shows all errors at once) */
  const [submitted,   setSubmitted]   = useState(false)
  /* UI state */
  const [showPass,    setShowPass]    = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [success,     setSuccess]     = useState(false)
  const [toast,       setToast]       = useState(null)
  /* Terms container ref for shake + auto-scroll */
  const termsRef    = useRef(null)
  const [termsShake, setTermsShake]  = useState(false)

  const strength = getStrength(form.password)

  /* Persist draft on every change */
  useEffect(() => {
    saveDraft({ ...form, roleId })
  }, [form, roleId])

  /* ── Field change — clear error immediately while typing ── */
  const setField = useCallback((key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(prev => ({ ...prev, [key]: val }))

    // Clear the field's error as soon as the user edits it
    setErrors(prev => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })

    // Username: catch '@' in real-time (autofill or manual typing)
    if (key === 'username') {
      const msg = validators.username(val)
      if (msg) {
        setErrors(prev => ({ ...prev, username: msg }))
      }
    }

    // If confirm-password is being edited, re-check match live
    if (key === 'confirmPassword' && touched.confirmPassword) {
      const msg = validators.confirmPassword(val, { ...form, confirmPassword: val })
      setErrors(prev => msg
        ? { ...prev, confirmPassword: msg }
        : (() => { const n = { ...prev }; delete n.confirmPassword; return n })()
      )
    }

    // If password changes and confirm already has a value, re-validate confirm
    if (key === 'password' && form.confirmPassword && touched.confirmPassword) {
      const msg = validators.confirmPassword(form.confirmPassword, { ...form, password: val })
      setErrors(prev => msg
        ? { ...prev, confirmPassword: msg }
        : (() => { const n = { ...prev }; delete n.confirmPassword; return n })()
      )
    }
  }, [form, touched])

  /* ── Blur — validate this field when user leaves it ── */
  const handleBlur = useCallback((key) => () => {
    setTouched(prev => ({ ...prev, [key]: true }))
    const msg = key === 'confirmPassword'
      ? validators.confirmPassword(form[key], form)
      : validators[key]?.(form[key]) ?? ''
    setErrors(prev => msg
      ? { ...prev, [key]: msg }
      : (() => { const n = { ...prev }; delete n[key]; return n })()
    )
  }, [form])

  /* ── Derive valid state: touched, no error, and field has a value ── */
  const isValid = useCallback((key) =>
    touched[key] && !errors[key] && Boolean(
      key === 'terms' ? form[key] : form[key]?.toString().trim()
    )
  , [touched, errors, form])

  /* ── Trigger terms shake + scroll + focus ── */
  const shakeTerms = useCallback(() => {
    setTermsShake(true)
    setTimeout(() => setTermsShake(false), 500)
    termsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    termsRef.current?.querySelector('input[type="checkbox"]')?.focus()
  }, [])

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitted(true)

    const errs = validateAll(form)
    setErrors(errs)

    if (Object.keys(errs).length) {
      // Shake the terms container if terms is missing
      if (errs.terms) shakeTerms()
      // No global error toast — each field shows its own inline message
      return
    }

    setLoading(true)
    await new Promise(r => setTimeout(r, 1400))  // TODO: replace with real API
    setLoading(false)
    setSuccess(true)
    clearDraft()
    setToast({ type: 'success', message: 'Account created successfully!' })
    setTimeout(() => navigate('/login'), 2000)
  }

  /* ─────────────────────────────────────────────────────────────── */

  return (
    <div className="min-h-screen bg-mesh flex flex-col">

      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <Logo variant="full" theme={isDark ? 'dark' : 'light'} />
        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
      </div>

      {/* Card */}
      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-lg fade-in">
          <div className="card shadow-[var(--shadow-lg)] px-8 py-10">

            {/* Header */}
            <div className="text-center mb-8">
              <h1
                className="text-2xl sm:text-3xl font-extrabold mb-2"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}
              >
                Create your account
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Create your OrbitSocial account to start scheduling content.
              </p>
            </div>

            {/* Role badge */}
            {roleLabel ? (
              <div
                className="flex items-center justify-between mb-6 px-4 py-3 rounded-[var(--r-md)]"
                style={{ background: 'var(--primary-light)', border: '1px solid rgba(15,30,58,.20)' }}
              >
                <div className="flex items-center gap-2.5">
                  <HiBriefcase size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} aria-hidden="true" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--primary)' }}>
                      Selected role
                    </p>
                    <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{roleLabel}</p>
                  </div>
                </div>
                <Link
                  to="/role-selection"
                  className="flex items-center gap-1 text-xs font-semibold hover:underline"
                  style={{ color: 'var(--primary)' }}
                  onClick={clearDraft}
                >
                  <HiArrowLeft size={13} aria-hidden="true" />
                  Change
                </Link>
              </div>
            ) : (
              <div
                className="flex items-center justify-between mb-6 px-4 py-3 rounded-[var(--r-md)]"
                style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.20)' }}
              >
                <p className="text-sm" style={{ color: 'var(--error, #EF4444)' }}>No role selected.</p>
                <Link to="/role-selection" className="text-xs font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
                  Select a role →
                </Link>
              </div>
            )}

            {/* Google button */}
            <button
              type="button"
              className="w-full h-11 rounded-[var(--r-md)] border flex items-center justify-center gap-2 text-sm font-medium mb-6 transition-all duration-200 hover:shadow-[var(--shadow-sm)]"
              style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }}
            >
              <FcGoogle size={18} aria-hidden="true" />
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} aria-hidden="true" />
              <span className="text-xs font-medium" style={{ color: 'var(--text-subtle)' }}>or</span>
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} aria-hidden="true" />
            </div>

            {/* Success state */}
            {success ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center" role="status" aria-live="polite">
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(22,163,74,.12)' }}>
                  <HiCheckCircle size={32} style={{ color: '#16A34A' }} aria-hidden="true" />
                </div>
                <p className="text-lg font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}>
                  Account created successfully!
                </p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Redirecting you to sign in…</p>
              </div>
            ) : (

            /* Form */
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

              {/* Full name + Username */}
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Full name"
                  required
                  placeholder="Alex Johnson"
                  leftIcon={<HiUser size={16} />}
                  value={form.fullName}
                  onChange={setField('fullName')}
                  onBlur={handleBlur('fullName')}
                  error={errors.fullName}
                  valid={isValid('fullName')}
                  autoComplete="name"
                />
                <Input
                  label="Username"
                  required
                  placeholder="e.g. alexjohnson"
                  leftIcon={<HiAtSymbol size={16} />}
                  value={form.username}
                  onChange={setField('username')}
                  onBlur={handleBlur('username')}
                  error={errors.username}
                  valid={isValid('username')}
                  autoComplete="off"
                  hint="4–20 characters. Letters, numbers and _ only."
                />
              </div>

              {/* Email */}
              <Input
                label="Email address"
                type="email"
                required
                placeholder="alex@example.com"
                leftIcon={<HiEnvelope size={16} />}
                value={form.email}
                onChange={setField('email')}
                onBlur={handleBlur('email')}
                error={errors.email}
                valid={isValid('email')}
                autoComplete="email"
              />

              {/* Phone */}
              <Input
                label="Phone number"
                type="tel"
                required
                placeholder="10-digit number"
                leftIcon={<HiPhone size={16} />}
                value={form.phone}
                onChange={setField('phone')}
                onBlur={handleBlur('phone')}
                error={errors.phone}
                valid={isValid('phone')}
                hint="Enter 10 digits, numbers only"
                autoComplete="tel"
              />

              {/* Password + strength bar */}
              <div className="flex flex-col gap-1.5">
                <Input
                  label="Password"
                  required
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  leftIcon={<HiLockClosed size={16} />}
                  value={form.password}
                  onChange={setField('password')}
                  onBlur={handleBlur('password')}
                  error={errors.password}
                  valid={isValid('password')}
                  autoComplete="new-password"
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowPass(v => !v)}
                      aria-label={showPass ? 'Hide password' : 'Show password'}
                      style={{ color: 'var(--text-subtle)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                    >
                      {showPass ? <HiEyeSlash size={17} /> : <HiEye size={17} />}
                    </button>
                  }
                />

                {/* Strength bar */}
                {form.password && (
                  <div>
                    <div className="flex gap-1 mb-1" role="img" aria-label={`Password strength: ${strength.label}`}>
                      {[1,2,3,4,5].map(i => (
                        <div
                          key={i}
                          className="flex-1 h-1.5 rounded-full transition-all duration-300"
                          style={{ background: i <= strength.score ? strength.color : 'var(--border)' }}
                        />
                      ))}
                    </div>
                    {strength.label && (
                      <p className="text-xs font-medium" style={{ color: strength.color }}>
                        {strength.label}
                      </p>
                    )}
                  </div>
                )}

                {/* Password requirements hint — only before errors appear */}
                {!errors.password && !isValid('password') && (
                  <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>
                    Must include uppercase, lowercase, number and special character.
                  </p>
                )}
              </div>

              {/* Confirm password */}
              <Input
                label="Confirm password"
                required
                type={showConfirm ? 'text' : 'password'}
                placeholder="Re-enter your password"
                leftIcon={<HiLockClosed size={16} />}
                value={form.confirmPassword}
                onChange={setField('confirmPassword')}
                onBlur={handleBlur('confirmPassword')}
                error={errors.confirmPassword}
                valid={isValid('confirmPassword')}
                autoComplete="new-password"
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    style={{ color: 'var(--text-subtle)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                  >
                    {showConfirm ? <HiEyeSlash size={17} /> : <HiEye size={17} />}
                  </button>
                }
              />

              {/* Terms checkbox */}
              <div
                ref={termsRef}
                className={termsShake ? 'shake' : ''}
              >
                <label
                  className="flex items-start gap-3 cursor-pointer rounded-[var(--r-md)] transition-all duration-200"
                  style={{
                    padding:     '0.625rem 0.75rem',
                    background:  errors.terms ? 'rgba(239,68,68,.04)' : 'transparent',
                    border:      `1.5px solid ${errors.terms ? '#FCA5A5' : 'transparent'}`,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={form.terms}
                    onChange={e => {
                      setField('terms')(e)
                      // Clear terms error immediately when checked
                      if (e.target.checked) {
                        setErrors(prev => {
                          const n = { ...prev }; delete n.terms; return n
                        })
                      }
                    }}
                    className="mt-0.5 w-4 h-4 rounded cursor-pointer flex-shrink-0"
                    style={{ accentColor: 'var(--primary)' }}
                    aria-describedby={errors.terms ? 'terms-error' : undefined}
                  />
                  <span className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    I agree to OrbitSocial's{' '}
                    <Link
                      to={`/terms?from=register&role=${roleId}`}
                      className="font-medium hover:underline"
                      style={{ color: 'var(--primary)' }}
                    >
                      Terms & Conditions
                    </Link>
                  </span>
                </label>

                {/* Terms error card */}
                {errors.terms && (
                  <div
                    id="terms-error"
                    role="alert"
                    aria-live="assertive"
                    style={{
                      display:      'flex',
                      alignItems:   'flex-start',
                      gap:          '0.5rem',
                      marginTop:    '0.5rem',
                      padding:      '0.5rem 0.75rem',
                      borderRadius: '10px',
                      background:   '#FEF2F2',
                      border:       '1px solid #FECACA',
                      color:        '#B91C1C',
                      fontSize:     '0.8125rem',
                      fontWeight:   500,
                      lineHeight:   1.45,
                      animation:    'inputErrorFadeIn 0.2s ease forwards',
                    }}
                  >
                    <HiExclamationCircle size={15} style={{ marginTop: '0.1rem', flexShrink: 0, color: '#EF4444' }} aria-hidden="true" />
                    <span>{errors.terms}</span>
                  </div>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full mt-2"
              >
                {loading ? 'Creating account…' : 'Create account'}
              </Button>

            </form>
            )}

            {/* Sign-in link */}
            {!success && (
              <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
                Already have an account?{' '}
                <Link to="/login" className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
                  Sign In
                </Link>
              </p>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
