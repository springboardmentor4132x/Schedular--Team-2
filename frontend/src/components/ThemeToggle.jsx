import { HiSun, HiMoon } from 'react-icons/hi2'

/**
 * ThemeToggle button
 * Animated sun/moon icon that calls onToggle when clicked
 * Props: isDark (bool), onToggle (fn)
 */
export default function ThemeToggle({ isDark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className="w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-200 hover:scale-105 active:scale-95"
      style={{
        background: 'var(--card)',
        borderColor: 'var(--border)',
        color: 'var(--text-muted)',
      }}
    >
      {isDark ? <HiSun size={16} /> : <HiMoon size={16} />}
    </button>
  )
}
