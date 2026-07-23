import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiArrowRight, HiCalendarDays, HiUserGroup, HiChartBarSquare, HiBolt } from 'react-icons/hi2'
import { FaInstagram, FaFacebook, FaLinkedin, FaXTwitter, FaPinterest, FaYoutube } from 'react-icons/fa6'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Button from '../components/Button'

/* ── Orbit Hero ─────────────────────────────────────────────────────
   Central hub logo with 3 concentric orbit rings, each carrying 2
   social-platform icons that rotate at different speeds.
   Pure CSS animations via classes defined in index.css.
   ────────────────────────────────────────────────────────────────── */

const ORBIT_PLATFORMS = [
  // ring 1 (inner, fast) — 2 icons at 0° and 180°
  { id: 'instagram', Icon: FaInstagram, color: '#E1306C', ring: 1, angle: 0   },
  { id: 'facebook',  Icon: FaFacebook,  color: '#1877F2', ring: 1, angle: 180 },
  // ring 2 (mid) — 3 icons
  { id: 'linkedin',  Icon: FaLinkedin,  color: '#0A66C2', ring: 2, angle: 60  },
  { id: 'x',         Icon: FaXTwitter,  color: '#374151', ring: 2, angle: 180 },
  { id: 'youtube',   Icon: FaYoutube,   color: '#FF0000', ring: 2, angle: 300 },
  // ring 3 (outer, slow) — 2 icons
  { id: 'pinterest', Icon: FaPinterest, color: '#E60023', ring: 3, angle: 90  },
]

// ring dimensions: radius in px from center
const RING_CONFIG = {
  1: { r: 90,  dur: '12s', dir: 'normal'  },
  2: { r: 150, dur: '20s', dir: 'reverse' },
  3: { r: 210, dur: '30s', dir: 'normal'  },
}

function OrbitHero() {
  // Group icons by ring
  const rings = [1, 2, 3]

  return (
    <div className="relative mx-auto" style={{ width: 460, height: 460 }}>
      {/* SVG rings — decorative circles */}
      <svg
        viewBox="0 0 460 460"
        width="460" height="460"
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
        {rings.map(r => {
          const { r: radius } = RING_CONFIG[r]
          return (
            <circle
              key={r}
              cx="230" cy="230"
              r={radius}
              fill="none"
              stroke="url(#orbitGrad)"
              strokeWidth="1"
              strokeDasharray="4 8"
              opacity={0.35 + r * 0.12}
            />
          )
        })}
        {/* Gradient definition */}
        <defs>
          <linearGradient id="orbitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#1E3A8A" stopOpacity="0.8" />
            <stop offset="50%"  stopColor="#4F46E5" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0.2" />
          </linearGradient>
        </defs>
      </svg>

      {/* Rotating rings — each ring is a positioned div that spins */}
      {rings.map(ringNum => {
        const { r: radius, dur, dir } = RING_CONFIG[ringNum]
        const icons = ORBIT_PLATFORMS.filter(p => p.ring === ringNum)
        // animation direction class
        const spinClass = dir === 'reverse' ? 'orbit-spin-reverse' : ringNum === 3 ? 'orbit-spin-slow' : 'orbit-spin'
        const counterClass = dir === 'reverse' ? 'orbit-icon-upright-reverse' : ringNum === 3 ? 'orbit-icon-upright-slow' : 'orbit-icon-upright'

        return (
          <div
            key={ringNum}
            className={spinClass}
            style={{
              position: 'absolute',
              top: 230 - radius,
              left: 230 - radius,
              width: radius * 2,
              height: radius * 2,
              borderRadius: '50%',
            }}
          >
            {icons.map(({ id, Icon, color, angle }) => {
              // Convert angle to position on circle
              const rad = (angle * Math.PI) / 180
              const x = radius + radius * Math.cos(rad) - 18
              const y = radius + radius * Math.sin(rad) - 18
              return (
                <div
                  key={id}
                  className={counterClass}
                  style={{
                    position: 'absolute',
                    left: x,
                    top: y,
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: `${color}18`,
                    border: `1.5px solid ${color}40`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 0 12px ${color}30`,
                  }}
                >
                  <Icon size={16} style={{ color }} />
                </div>
              )
            })}
          </div>
        )
      })}

      {/* Center hub — Logo */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #1E3A8A 0%, #4F46E5 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 0 8px rgba(30,58,138,.08), 0 0 0 16px rgba(79,70,229,.05), 0 8px 32px rgba(30,58,138,.25)',
        }}
      >
        {/* Orbit icon SVG — white version */}
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
          <circle cx="20" cy="20" r="14" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" />
          <circle cx="20" cy="20" r="9"  stroke="rgba(255,255,255,0.5)" strokeWidth="1"   fill="none" />
          <circle cx="20" cy="20" r="4"  fill="white" />
          <circle cx="20" cy="6"  r="2.5" fill="white" opacity="0.9" />
          <circle cx="34" cy="20" r="2"   fill="white" opacity="0.7" />
          <circle cx="20" cy="34" r="2"   fill="white" opacity="0.6" />
          <circle cx="6"  cy="20" r="2"   fill="white" opacity="0.5" />
        </svg>
      </div>

      {/* Soft glow behind center */}
      <div
        className="orbit-pulse"
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 120, height: 120,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79,70,229,.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}

export default function Landing({ isDark, onToggleTheme }) {
  return (
    <div className="min-h-screen bg-mesh">
      <Navbar isDark={isDark} onToggleTheme={onToggleTheme} />

      {/* ═══ HERO ═══ */}
      <section
        className="relative pt-24 pb-16 px-4 overflow-hidden"
        style={{ background: 'var(--bg)' }}
        aria-label="Hero"
      >
        {/* Decorative background blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #1E3A8A, transparent)' }} aria-hidden="true" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-[0.07] blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #4F46E5, transparent)' }} aria-hidden="true" />

        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

            {/* Left — copy */}
            <div className="flex-1 text-center lg:text-left max-w-xl">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <span className="label-pill mb-6 inline-flex">
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#4F46E5' }} aria-hidden="true" />
                  Plan Once. Publish Everywhere.
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.08 }}
                className="font-extrabold text-5xl sm:text-6xl leading-tight tracking-tight mb-5"
                style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif", color: 'var(--text)' }}
              >
                Your social orbit,{' '}
                <span className="text-gradient">one platform</span>
              </motion.h1>

              {/* Sub */}
              <motion.p
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.16 }}
                className="text-lg mb-3" style={{ color: 'var(--text-muted)' }}
              >
                Orbit Social is the central hub where every social platform connects, schedules, and publishes — automatically.
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.22 }}
                className="text-base max-w-lg mb-8 leading-relaxed" style={{ color: 'var(--text-subtle)' }}
              >
                Plan your content calendar, manage multiple accounts, and schedule posts across every major network from one intelligent dashboard.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.28 }}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-5"
              >
                <Link to="/role-selection">
                  <Button variant="primary" size="xl">
                    Get Started Free
                    <HiArrowRight size={18} aria-hidden="true" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="secondary" size="xl">Sign In</Button>
                </Link>
              </motion.div>

              {/* Trust */}
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.36 }}
                className="text-sm" style={{ color: 'var(--text-subtle)' }}
              >
                Free plan · No credit card · Cancel anytime
              </motion.p>
            </div>

            {/* Right — Orbit animation */}
            <motion.div
              className="flex-shrink-0"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            >
              <OrbitHero />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ PLATFORMS ═══ */}
      <section
        id="platforms"
        className="section"
        style={{ background: 'var(--bg-alt)' }}
        aria-label="Supported platforms"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="label-pill mb-4">Integrations</span>
            <h2
              className="text-3xl sm:text-4xl font-bold mb-3"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}
            >
              Connect every platform
            </h2>
            <p className="text-base" style={{ color: 'var(--text-muted)' }}>
              Publish to all major social networks from one dashboard.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {[
              { name: 'Instagram', Icon: FaInstagram, color: '#E1306C', bg: 'rgba(225,48,108,.10)' },
              { name: 'Facebook',  Icon: FaFacebook,  color: '#1877F2', bg: 'rgba(24,119,242,.10)' },
              { name: 'LinkedIn',  Icon: FaLinkedin,  color: '#0A66C2', bg: 'rgba(10,102,194,.10)' },
              { name: 'X',         Icon: FaXTwitter,  color: '#374151', bg: 'rgba(55,65,81,.08)'   },
              { name: 'YouTube',   Icon: FaYoutube,   color: '#FF0000', bg: 'rgba(255,0,0,.10)'    },
              { name: 'Pinterest', Icon: FaPinterest, color: '#E60023', bg: 'rgba(230,0,35,.10)'   },
            ].map(({ name, Icon, color, bg }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                whileHover={{ y: -4, transition: { duration: 0.15 } }}
                className="card flex flex-col items-center gap-3 p-5 min-w-[120px] cursor-default"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                  <Icon size={24} style={{ color }} aria-hidden="true" />
                </div>
                <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>{name}</span>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-sm font-medium" style={{ color: 'var(--text-subtle)' }}>
            More platforms coming soon
          </p>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section
        id="features"
        className="section"
        style={{ background: 'var(--bg)' }}
        aria-label="Features"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="label-pill mb-4">Features</span>
            <h2
              className="text-3xl sm:text-4xl font-bold mb-3"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}
            >
              Everything you need to grow
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
              Powerful tools designed for creators, businesses, and marketing teams.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: HiCalendarDays,
                bg: 'linear-gradient(135deg, #1E3A8A, #4F46E5)',
                title: 'Smart Scheduling',
                desc: 'Schedule posts weeks in advance with best-time suggestions powered by engagement data.',
              },
              {
                icon: HiUserGroup,
                bg: 'linear-gradient(135deg, #4F46E5, #1E3A8A)',
                title: 'Multi-Account Management',
                desc: 'Connect unlimited accounts and publish everywhere from a single unified dashboard.',
              },
              {
                icon: HiBolt,
                bg: 'linear-gradient(135deg, #1E3A8A, #0A66C2)',
                title: 'Visual Content Calendar',
                desc: 'Drag-and-drop calendar view for effortless content planning and campaign coordination.',
              },
              {
                icon: HiChartBarSquare,
                bg: 'linear-gradient(135deg, #4F46E5, #818CF8)',
                title: 'Analytics Ready',
                desc: 'Performance tracking and insights across all connected platforms.',
                badge: 'Coming Soon',
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.08 }}
                whileHover={{ y: -4, transition: { duration: 0.15 } }}
                className="card p-6 relative"
              >
                {f.badge && (
                  <span
                    className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full"
                    style={{ color: '#4F46E5', background: 'rgba(79,70,229,.10)', border: '1px solid rgba(79,70,229,.20)' }}
                  >
                    {f.badge}
                  </span>
                )}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4"
                  style={{ background: f.bg, boxShadow: '0 4px 12px rgba(30,58,138,.20)' }}
                >
                  <f.icon size={24} aria-hidden="true" />
                </div>
                <h3 className="text-base font-bold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}>
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="section" style={{ background: 'var(--bg-alt)' }} aria-label="How it works">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <span className="label-pill mb-4">Simple Process</span>
            <h2
              className="text-3xl sm:text-4xl font-bold mb-3"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}
            >
              Up and running in minutes
            </h2>
          </div>

          <div className="flex flex-col gap-0 max-w-lg mx-auto">
            {[
              { num: '01', title: 'Connect your accounts', desc: 'Link all your social profiles in seconds with secure OAuth authentication.' },
              { num: '02', title: 'Schedule your content',  desc: 'Create posts, upload media, and schedule them to publish at the perfect time.' },
              { num: '03', title: 'Publish automatically',  desc: 'Orbit Social handles publishing while you focus on creating great content.' },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.1 }}
                className="flex gap-6 items-start"
              >
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-sm z-10"
                    style={{ background: 'linear-gradient(135deg, #1E3A8A, #4F46E5)', boxShadow: '0 4px 16px rgba(30,58,138,.25)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    aria-label={`Step ${step.num}`}
                  >
                    {step.num}
                  </div>
                  {i < 2 && (
                    <div
                      className="w-0.5 flex-1 min-h-[3rem] mt-1"
                      style={{ background: 'linear-gradient(to bottom, #4F46E5, transparent)' }}
                      aria-hidden="true"
                    />
                  )}
                </div>
                <div className={`pt-3 ${i < 2 ? 'pb-8' : ''}`}>
                  <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}>
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section id="about" className="section" style={{ background: 'var(--bg)' }} aria-label="Call to action">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="relative overflow-hidden rounded-[var(--r-2xl)] p-12 sm:p-16 text-center"
            style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #4F46E5 100%)' }}
          >
            <div className="absolute inset-0 dot-grid opacity-10" aria-hidden="true" />
            <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />

            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-4">Ready to grow?</p>
              <h2
                className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Start scheduling smarter today
              </h2>
              <p className="text-base text-white/80 mb-8 max-w-md mx-auto">
                Join thousands of creators and teams who trust Orbit Social to manage their social media presence.
              </p>
              <Link to="/role-selection">
                <Button
                  variant="secondary"
                  size="xl"
                  className="!bg-white !text-[#1E3A8A] !border-transparent hover:!bg-white/90"
                >
                  Create Free Account
                  <HiArrowRight size={18} aria-hidden="true" />
                </Button>
              </Link>
              <p className="text-xs text-white/50 mt-4">Free plan · No credit card required</p>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer isDark={isDark} />
    </div>
  )
}
