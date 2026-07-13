/**
 * useTheme.js
 * Re-exports the useTheme hook and ThemeProvider from ThemeContext.jsx.
 * Kept as .js (no JSX) so Vite/oxc handles it correctly.
 * Import from this file throughout the app for a clean, stable path.
 */
export { useTheme, ThemeProvider } from '../context/ThemeContext'
