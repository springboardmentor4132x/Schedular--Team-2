import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import './index.css'

// Apply saved theme before React mounts — prevents flash
const saved = localStorage.getItem('orbit-theme')
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
if (saved === 'dark' || (!saved && prefersDark)) {
  document.documentElement.classList.add('dark')
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif', padding: '2rem', background: '#f8fafc',
        }}>
          <div style={{
            maxWidth: 560, background: '#fff', border: '1px solid #e5e7eb',
            borderRadius: 16, padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,.08)',
          }}>
            <h1 style={{ color: '#dc2626', fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
              Application Error
            </h1>
            <pre style={{
              background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8,
              padding: '1rem', fontSize: '0.8rem', color: '#b91c1c',
              whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowX: 'auto',
            }}>
              {this.state.error.message}
              {'\n\n'}
              {this.state.error.stack}
            </pre>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
)
