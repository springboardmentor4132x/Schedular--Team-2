import { Link } from 'react-router-dom'
import { HiArrowRight, HiCalendarDays, HiUserGroup, HiChartBarSquare, HiBolt } from 'react-icons/hi2'
import { FaInstagram, FaFacebook, FaLinkedin, FaXTwitter, FaPinterest, FaYoutube } from 'react-icons/fa6'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Button from '../components/Button'

/**
 * Landing Page
 * Sections: Hero → Platforms → Features → How It Works → CTA → Footer
 * Props: isDark, onToggleTheme
 */
export default function Landing({ isDark, onToggleTheme }) {
  return (
    <div className="min-h-screen bg-mesh">
      <Navbar isDark={isDark} onToggleTheme={onToggleTheme} />

      {/* ═══ HERO ═══ */}
      <section
        className="relative pt-32 pb-20 px-4 overflow-hidden"
        style={{ background: 'var(--bg)' }}
        aria-label="Hero"
      >
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, var(--primary), transparent)' }} aria-hidden="true" />
        <div className="absolute top-20 right-0 w-80 h-80 rounded-full opacity-[0.07] blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, var(--secondary), transparent)' }} aria-hidden="true" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          
          {/* Badge */}
          <span className="label-pill fade-in mb-6">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--primary)' }} aria-hidden="true" />
            Plan Once. Publish Everywhere.
          </span>

          {/* Headline */}
          <h1
            className="font-extrabold text-5xl sm:text-6xl lg:text-7xl leading-tight tracking-tight mb-5 fade-in delay-1"
            style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif", color: 'var(--text)' }}
          >
            Welcome to{' '}
            <span className="text-gradient">OrbitSocial</span>
          </h1>

          {/* Sub-heading */}
          <p className="text-lg sm:text-xl mb-3 fade-in delay-2" style={{ color: 'var(--text-muted)' }}>
            Manage all your social media accounts from one beautiful platform.
          </p>

          {/* Description */}
          <p className="text-base max-w-2xl mx-auto mb-8 leading-relaxed fade-in delay-3" style={{ color: 'var(--text-subtle)' }}>
            Plan your content, organize publishing schedules and manage multiple social media platforms from one place with an intuitive and modern interface.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6 fade-in delay-4">
            <Link to="/role-selection">
              <Button variant="primary" size="xl">
                Get Started
                <HiArrowRight size={18} aria-hidden="true" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="xl">Sign In</Button>
            </Link>
          </div>

          {/* Trust line */}
          <p className="text-sm fade-in delay-4" style={{ color: 'var(--text-subtle)' }}>
            Free plan · No credit card · Cancel anytime
          </p>
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
          
          {/* Header */}
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

          {/* Platform icons */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {[
              { name: 'Instagram', Icon: FaInstagram, color: '#E1306C', bg: 'rgba(225,48,108,.10)' },
              { name: 'Facebook',  Icon: FaFacebook,  color: '#1877F2', bg: 'rgba(24,119,242,.10)' },
              { name: 'LinkedIn',  Icon: FaLinkedin,  color: '#0A66C2', bg: 'rgba(10,102,194,.10)' },
              { name: 'X',         Icon: FaXTwitter,  color: null,      bg: 'rgba(0,0,0,.06)'      },
              { name: 'YouTube',   Icon: FaYoutube,   color: '#FF0000', bg: 'rgba(255,0,0,.10)'    },
              { name: 'Pinterest', Icon: FaPinterest, color: '#E60023', bg: 'rgba(230,0,35,.10)'   },
            ].map(({ name, Icon, color, bg }) => (
              <div
                key={name}
                className="card flex flex-col items-center gap-3 p-5 min-w-[120px] cursor-default"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: bg }}
                >
                  <Icon size={24} style={{ color: color || 'var(--text)' }} aria-hidden="true" />
                </div>
                <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
                  {name}
                </span>
              </div>
            ))}
          </div>

          {/* More coming soon */}
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
          
          {/* Header */}
          <div className="text-center mb-14">
            <span className="label-pill mb-4">Features</span>
            <h2
              className="text-3xl sm:text-4xl font-bold mb-3"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}
            >
              Everything you need to grow
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
              Powerful tools designed for creators, businesses, and agencies.
            </p>
          </div>

          {/* 4 Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: HiCalendarDays,
                bg: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                title: 'Smart Scheduling',
                desc: 'Schedule posts weeks in advance with AI-powered time suggestions.',
              },
              {
                icon: HiUserGroup,
                bg: 'linear-gradient(135deg, var(--secondary), var(--primary))',
                title: 'Manage Multiple Accounts',
                desc: 'Connect unlimited accounts and publish everywhere from one dashboard.',
              },
              {
                icon: HiBolt,
                bg: 'linear-gradient(135deg, var(--primary), var(--accent))',
                title: 'Visual Content Calendar',
                desc: 'Drag-and-drop calendar view for effortless content planning.',
              },
              {
                icon: HiChartBarSquare,
                bg: 'linear-gradient(135deg, var(--accent), var(--primary))',
                title: 'Analytics Ready',
                desc: 'Performance tracking and insights coming soon.',
                badge: 'Coming Soon',
              },
            ].map((f, i) => (
              <div key={i} className="card p-6 relative">
                {f.badge && (
                  <span
                    className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full"
                    style={{
                      color: 'var(--secondary)',
                      background: 'var(--accent-light)',
                      border: '1px solid rgba(15,30,58,.20)',
                    }}
                  >
                    {f.badge}
                  </span>
                )}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 shadow-[var(--shadow-xs)]"
                  style={{ background: f.bg }}
                >
                  <f.icon size={24} aria-hidden="true" />
                </div>
                <h3
                  className="text-base font-bold mb-2"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}
                >
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section
        className="section"
        style={{ background: 'var(--bg-alt)' }}
        aria-label="How it works"
      >
        <div className="max-w-3xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-14">
            <span className="label-pill mb-4">Simple Process</span>
            <h2
              className="text-3xl sm:text-4xl font-bold mb-3"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}
            >
              Up and running in minutes
            </h2>
          </div>

          {/* 3 Steps */}
          <div className="flex flex-col gap-0 max-w-lg mx-auto">
            {[
              {
                num: '01',
                title: 'Connect your accounts',
                desc: 'Link all your social profiles in seconds with secure OAuth authentication.',
              },
              {
                num: '02',
                title: 'Schedule your content',
                desc: 'Create posts, upload media, and schedule them to publish at the perfect time.',
              },
              {
                num: '03',
                title: 'Publish automatically',
                desc: 'OrbitSocial handles publishing while you focus on creating great content.',
              },
            ].map((step, i) => (
              <div key={i} className="flex gap-6 items-start">
                
                {/* Left — number circle + line */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-[var(--shadow-card)] z-10"
                    style={{
                      background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                    aria-label={`Step ${step.num}`}
                  >
                    {step.num}
                  </div>
                  {i < 2 && (
                    <div
                      className="w-0.5 flex-1 min-h-[3rem] mt-1"
                      style={{ background: 'linear-gradient(to bottom, var(--primary), transparent)' }}
                      aria-hidden="true"
                    />
                  )}
                </div>

                {/* Right — content */}
                <div className={`pt-3 ${i < 2 ? 'pb-8' : ''}`}>
                  <h3
                    className="text-lg font-bold mb-2"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section
        id="about"
        className="section"
        style={{ background: 'var(--bg)' }}
        aria-label="Call to action"
      >
        <div className="max-w-4xl mx-auto">
          <div
            className="relative overflow-hidden rounded-[var(--r-2xl)] p-12 sm:p-16 text-center"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}
          >
            {/* Dot overlay */}
            <div className="absolute inset-0 dot-grid opacity-10" aria-hidden="true" />

            {/* Blobs */}
            <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />

            {/* Content */}
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-4">
                Ready to grow?
              </p>
              <h2
                className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Start scheduling smarter today
              </h2>
              <p className="text-base text-white/80 mb-8 max-w-md mx-auto">
                Join thousands of creators and teams who trust OrbitSocial to manage their social media.
              </p>
              <Link to="/role-selection">
                <Button
                  variant="secondary"
                  size="xl"
                  className="!bg-white !text-[#0F1E3A] !border-transparent hover:!bg-white/90"
                >
                  Create Free Account
                  <HiArrowRight size={18} aria-hidden="true" />
                </Button>
              </Link>
              <p className="text-xs text-white/50 mt-4">
                Free plan · No credit card required
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer isDark={isDark} />
    </div>
  )
}
