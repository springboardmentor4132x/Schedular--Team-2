import { ThemeProvider } from './shared/context/ThemeContext'
import AppRoutes from './routes/AppRoutes'

/**
 * App — Root component.
 *
 * ThemeProvider is the single source of truth for dark/light mode.
 * Reorganized into clean modular architecture inside frontend/src/.
 */
export default function App() {
  return (
    <ThemeProvider>
      <AppRoutes />
    </ThemeProvider>
  )
}
