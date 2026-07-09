import { Link } from 'react-router-dom'
import { FiTwitter, FiGithub, FiLinkedin, FiMail } from 'react-icons/fi'
import Logo from './Logo'

/**
 * Footer
 * Site footer with logo, links, socials, copyright
 * Props: isDark
 */
export default function Footer({ isDark }) {
  const year = new Date().getFullYear()

  const links = {
    Product: ['Features', 'Platforms', 'Pricing', 'Changelog'],
    Company: ['About', 'Blog', 'Careers', 'Contact'],
    Legal:   ['Privacy Policy', 'Terms & Conditions', 'Cookie Policy'],
  }

  const socials = [
    { icon: FiTwitter,  href: '#', label: 'Twitter'  },
    { icon: FiGithub,   href: '#', label: 'GitHub'   },
    { icon: FiLinkedin, href: '#', label: 'LinkedIn' },
    { icon: FiMail,     href: 'mailto:hello@orbitsocial.app', label: 'Email' },
  ]

  return (
    <footer
      className="border-t pt-16 pb-8"
      style={{
        background: 'var(--card)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Top grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4">
              <Logo variant="full" theme={isDark ? 'dark' : 'light'} />
            </div>
            <p className="text-sm leading-relaxed mb-5 max-w-[220px]" style={{ color: 'var(--text-muted)' }}>
              Plan once. Publish everywhere. The modern social media scheduling platform.
            </p>
            <div className="flex items-center gap-3">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-200 hover:scale-105"
                  style={{
                    borderColor: 'var(--border)',
                    color: 'var(--text-muted)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([heading, items]) => (
            <div key={heading}>
              <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text)' }}>
                {heading}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {items.map(item => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm transition-colors duration-150"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-subtle)' }}>
          <p>© {year} OrbitSocial. All rights reserved.</p>
          <p>Made with ❤️ for creators worldwide</p>
        </div>
      </div>
    </footer>
  )
}
