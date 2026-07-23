import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiUser, HiBuildingOffice2, HiShieldCheck, HiMegaphone, HiArrowRight } from 'react-icons/hi2'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import Button from '../components/Button'

/**
 * RoleSelection Page
 * 4 role cards — user picks one, continues to Register
 * Roles: business | marketing | creator | administrator
 * Props: isDark, onToggleTheme
 */
export default function RoleSelection({ isDark, onToggleTheme }) {
  const [selected, setSelected] = useState(null)
  const navigate = useNavigate()

  const roles = [
    {
      id: 'creator',
      icon: HiUser,
      title: 'Content Creator',
      desc: 'For individual influencers and content creators building a personal brand.',
      benefits: ['Up to 5 accounts', 'AI scheduling', 'Analytics dashboard'],
    },
    {
      id: 'business',
      icon: HiBuildingOffice2,
      title: 'Business User',
      desc: 'For small to mid-sized businesses growing their social presence.',
      benefits: ['Up to 15 accounts', 'Team collaboration', 'Priority support'],
    },
    {
      id: 'administrator',
      icon: HiShieldCheck,
      title: 'Administrator',
      desc: 'For platform administrators managing users, settings and system-wide controls.',
      benefits: ['Full access', 'User management', 'System settings'],
    },
    {
      id: 'marketing',
      icon: HiMegaphone,
      title: 'Marketing Team',
      desc: 'For in-house marketing teams coordinating content across channels.',
      benefits: ['Team workspaces', 'Approval workflows', 'Content library'],
    },
  ]

  const handleContinue = () => {
    if (selected) navigate(`/register?role=${selected}`)
  }

  return (
    <div className="min-h-screen bg-mesh flex flex-col">
      
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <Logo variant="full" theme={isDark ? 'dark' : 'light'} />
        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-4xl">
          
          {/* Header */}
          <div className="text-center mb-10 fade-in">
            <h1
              className="text-3xl sm:text-4xl font-extrabold mb-3"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}
            >
              How will you use OrbitSocial?
            </h1>
            <p className="text-base" style={{ color: 'var(--text-muted)' }}>
              Choose your role to personalize your experience.
            </p>
          </div>

          {/* Role cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {roles.map((role, i) => {
              const Icon = role.icon
              const isSelected = selected === role.id
              
              return (
                <button
                  key={role.id}
                  onClick={() => setSelected(role.id)}
                  aria-pressed={isSelected}
                  className={`relative text-left p-6 rounded-[var(--r-lg)] border-2 transition-all duration-200 fade-in delay-${i + 1} ${
                    isSelected
                      ? 'shadow-[var(--shadow-card)] scale-[1.01]'
                      : 'hover:shadow-[var(--shadow-sm)] hover:scale-[1.005]'
                  }`}
                  style={{
                    background: 'var(--card)',
                    borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                  }}
                >
                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4"
                    style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}
                  >
                    <Icon size={24} aria-hidden="true" />
                  </div>

                  {/* Title + desc */}
                  <h3
                    className="text-lg font-bold mb-2"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}
                  >
                    {role.title}
                  </h3>
                  <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {role.desc}
                  </p>

                  {/* Benefits */}
                  <ul className="flex flex-col gap-1.5">
                    {role.benefits.map(b => (
                      <li key={b} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-subtle)' }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--primary)' }} aria-hidden="true" />
                        {b}
                      </li>
                    ))}
                  </ul>

                  {/* Selected indicator */}
                  {isSelected && (
                    <div className="absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'var(--primary)' }}>
                      <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                        <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Continue button */}
          <div className="flex flex-col items-center gap-3 fade-in delay-5">
            <Button
              variant="primary"
              size="xl"
              disabled={!selected}
              onClick={handleContinue}
              className="min-w-64"
            >
              {selected ? `Continue as ${roles.find(r => r.id === selected)?.title}` : 'Select a role to continue'}
              <HiArrowRight size={18} aria-hidden="true" />
            </Button>
            <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>
              You can change this anytime in settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
