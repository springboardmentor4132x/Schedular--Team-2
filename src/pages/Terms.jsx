import { useNavigate, useSearchParams } from 'react-router-dom'
import { HiArrowLeft, HiCheckCircle } from 'react-icons/hi2'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import Button from '../components/Button'

/**
 * Terms & Conditions Page
 *
 * When reached from the Sign Up form (?from=register):
 *   - "Back" navigates to the previous page, preserving all form data
 *     (already in sessionStorage from Register.jsx).
 *   - "Accept & Continue" marks the terms checkbox as accepted in
 *     sessionStorage then returns to /register with the role param
 *     restored, so the user lands back with everything filled in
 *     and the Terms checkbox already ticked.
 *
 * When reached from any other link the buttons simply go back.
 *
 * Props: isDark, onToggleTheme
 */

const SESSION_KEY = 'orbit-register-draft'

function acceptTermsInDraft() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    const draft = raw ? JSON.parse(raw) : {}
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...draft, terms: true }))
  } catch { /* ignore */ }
}

export default function Terms({ isDark, onToggleTheme }) {
  const navigate = useNavigate()
  const [params] = useSearchParams()

  // Detect whether we arrived from the Sign Up form
  const fromRegister = params.get('from') === 'register'
  const roleId       = params.get('role') || ''

  // Back — just go to previous history entry so the browser state
  // (and scroll position) is restored naturally.
  const handleBack = () => navigate(-1)

  // Accept & Continue — tick the checkbox in the draft then return
  // to the register page with the role param intact.
  const handleAccept = () => {
    acceptTermsInDraft()
    navigate(`/register?role=${roleId}`)
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* ── Sticky header ── */}
      <header
        className="border-b sticky top-0 z-50 backdrop-blur-xl"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Logo variant="full" theme={isDark ? 'dark' : 'light'} />
          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
        </div>
      </header>

      {/* ── Content ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">

        {/* Back link (top) */}
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm font-medium mb-8 hover:underline transition-colors"
          style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <HiArrowLeft size={16} aria-hidden="true" />
          Back to Sign Up
        </button>

        {/* Title */}
        <h1
          className="text-4xl font-extrabold mb-3"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}
        >
          Terms & Conditions
        </h1>
        <p className="text-sm mb-10" style={{ color: 'var(--text-muted)' }}>
          Last updated:{' '}
          {new Date().toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric',
          })}
        </p>

        {/* ── Sections ── */}
        <div className="prose max-w-none">

          <Section title="1. Privacy Policy">
            <p>
              OrbitSocial ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you use our social media scheduling platform.
            </p>
            <p>
              We collect information you provide directly (name, email, payment details) and usage data (posts scheduled, accounts connected, analytics). We do not sell your data to third parties.
            </p>
            <p>
              Your social media credentials are encrypted and securely stored. We use OAuth 2.0 for all social platform connections and never store your passwords.
            </p>
          </Section>

          <Section title="2. User Responsibilities">
            <p>By using OrbitSocial, you agree to:</p>
            <ul style={{ color: 'var(--text-muted)', marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Respect the terms of service of connected social platforms</li>
              <li>Not use the service for spam, harassment, or illegal activity</li>
            </ul>
          </Section>

          <Section title="3. Account Rules">
            <p>
              You are responsible for all activity under your account. You must notify us immediately if you suspect unauthorized access.
            </p>
            <p>
              We reserve the right to suspend or terminate accounts that violate these terms, engage in abusive behavior, or pose a security risk.
            </p>
          </Section>

          <Section title="4. Acceptable Use">
            <p>You may not use OrbitSocial to:</p>
            <ul style={{ color: 'var(--text-muted)', marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
              <li>Distribute malware, phishing content, or harmful code</li>
              <li>Violate intellectual property rights</li>
              <li>Harass, threaten, or impersonate others</li>
              <li>Scrape or reverse-engineer the platform</li>
              <li>Overload our systems or attempt unauthorized access</li>
            </ul>
          </Section>

          <Section title="5. Security">
            <p>
              We implement industry-standard security measures including encryption at rest and in transit, secure authentication, and regular security audits.
            </p>
            <p>
              However, no method of transmission over the internet is 100% secure. You acknowledge that you use the service at your own risk.
            </p>
          </Section>

          <Section title="6. Limitation of Liability">
            <p>
              OrbitSocial is provided "as is" without warranties of any kind. We are not liable for service interruptions, data loss, or damages arising from your use of the platform.
            </p>
          </Section>

          <Section title="7. Changes to Terms">
            <p>
              We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the new terms.
            </p>
          </Section>

          <Section title="8. Contact Information">
            <p>For questions about these terms or our privacy practices, contact us at:</p>
            <p>
              <strong>Email:</strong> legal@orbitsocial.app<br />
              <strong>Address:</strong> OrbitSocial Inc., 123 Tech Street, San Francisco, CA 94105
            </p>
          </Section>

        </div>

        {/* ── Bottom action bar ── */}
        <div
          className="mt-12 pt-8 border-t flex flex-col sm:flex-row items-start sm:items-center gap-4"
          style={{ borderColor: 'var(--border)' }}
        >
          {/* Back button — always present */}
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-sm font-medium hover:underline transition-colors"
            style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <HiArrowLeft size={16} aria-hidden="true" />
            Back to Sign Up
          </button>

          {/* Accept & Continue — only shown when arriving from the register form */}
          {fromRegister && (
            <Button
              variant="primary"
              size="md"
              onClick={handleAccept}
              className="sm:ml-auto"
            >
              <HiCheckCircle size={18} aria-hidden="true" />
              Accept &amp; Continue
            </Button>
          )}
        </div>

      </div>
    </div>
  )
}

// ── Section component for consistent formatting ───────────────────
function Section({ title, children }) {
  return (
    <section className="mb-8">
      <h2
        className="text-xl font-bold mb-3"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}
      >
        {title}
      </h2>
      <div className="text-sm leading-relaxed space-y-3" style={{ color: 'var(--text-muted)' }}>
        {children}
      </div>
    </section>
  )
}
