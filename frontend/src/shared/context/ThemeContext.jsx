/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from 'react'

export const ThemeContext = createContext({
  theme:       'light',
  toggleTheme: () => {},
})

export function ThemeProvider({ children, value }) {
  const [themeState, setThemeState] = useState(() => {
    const stored = localStorage.getItem('orbit-theme')
    if (stored === 'dark' || stored === 'light') return stored
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  const theme = value ? (value.isDark ? 'dark' : 'light') : themeState
  const toggleTheme = value ? value.onToggleTheme : () => setThemeState(prev => (prev === 'dark' ? 'light' : 'dark'))

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('orbit-theme', theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export { useTheme } from '../hooks/useTheme'
