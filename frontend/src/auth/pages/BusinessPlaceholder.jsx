import Logo from '../../shared/components/Logo'
import ThemeToggle from '../../shared/components/ThemeToggle'

export default function BusinessPlaceholder({ isDark, onToggleTheme }) {
  return (
    <div className="min-h-screen bg-mesh flex flex-col">
      <div className="flex items-center justify-between px-6 py-4">
        <Logo variant="full" theme={isDark ? 'dark' : 'light'} />
        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div
          className="w-full max-w-2xl p-8 rounded-[var(--r-xl)] shadow-[var(--shadow-lg)] fade-in"
          style={{
            background: isDark ? 'rgba(23,32,51,0.80)' : 'rgba(255,255,255,0.90)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
          }}
        >
          <h1
            className="text-2xl sm:text-3xl font-extrabold mb-3"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}
          >
            Business Dashboard
          </h1>
          <p className="text-sm sm:text-base leading-relaxed mb-6" style={{ color: 'var(--text-muted)' }}>
            Welcome to the Business Workspace. Manage business social accounts, team permissions, multi-brand workflows, and campaign performance analytics.
          </p>
          <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--primary)' }}>
            <span className="w-2 h-2 rounded-full" style={{ background: 'var(--primary)' }} />
            Active Route: /business
          </div>
        </div>
      </div>
    </div>
  )
}
