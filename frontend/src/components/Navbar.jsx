import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { HiBars3, HiXMark } from 'react-icons/hi2'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import Button from './Button'

/**
 * Navbar
 * Sticky header with logo, nav links, theme toggle, auth buttons
 * Collapses to hamburger on mobile
 * Props: isDark, onToggleTheme
 */
export default function Navbar({ isDark, onToggleTheme }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Features', href: '#features' },
    { label: 'Platforms', href: '#platforms' },
    { label: 'About', href: '#about' },
  ]

  const handleAnchorClick = (href) => {
    setMobileOpen(false)
    if (href.startsWith('#')) {
      const el = document.querySelector(href)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'backdrop-blur-xl border-b shadow-[var(--shadow-sm)]'
            : 'bg-transparent'
        }`}
        style={{
          background: scrolled ? 'rgba(var(--bg), 0.9)' : 'transparent',
          borderColor: scrolled ? 'var(--border)' : 'transparent',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <Logo variant="full" theme={isDark ? 'dark' : 'light'} />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main">
            {navLinks.map(link => (
              link.href.startsWith('#') ? (
                <button
                  key={link.label}
                  onClick={() => handleAnchorClick(link.href)}
                  className="px-4 py-2 text-sm font-medium rounded-[var(--r-sm)] transition-all duration-150"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.label}
                  to={link.href}
                  className="px-4 py-2 text-sm font-medium rounded-[var(--r-sm)] transition-all duration-150"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  {link.label}
                </Link>
              )
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/role-selection">
                <Button variant="primary" size="sm">Sign Up</Button>
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              className="md:hidden p-2 rounded-lg transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              {mobileOpen ? <HiXMark size={22} /> : <HiBars3 size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="fixed top-16 left-0 right-0 z-40 border-b backdrop-blur-xl shadow-[var(--shadow-md)] md:hidden"
          style={{
            background: isDark ? 'rgba(11,18,32,0.97)' : 'rgba(255,255,255,0.97)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
            {navLinks.map(link => (
              link.href.startsWith('#') ? (
                <button
                  key={link.label}
                  onClick={() => handleAnchorClick(link.href)}
                  className="text-left px-4 py-3 text-sm font-medium rounded-lg transition-all"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-alt)'; e.currentTarget.style.color = 'var(--text)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-sm font-medium rounded-lg transition-all"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {link.label}
                </Link>
              )
            ))}
            <div className="border-t pt-3 mt-2 flex flex-col gap-2" style={{ borderColor: 'var(--border)' }}>
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="secondary" size="md" className="w-full">Sign In</Button>
              </Link>
              <Link to="/role-selection" onClick={() => setMobileOpen(false)}>
                <Button variant="primary" size="md" className="w-full">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
