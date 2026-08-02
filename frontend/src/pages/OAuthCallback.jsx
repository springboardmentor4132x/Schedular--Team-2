import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getCurrentUser } from '../services/authService'

export default function OAuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login } = useAuth()

  useEffect(() => {
    const token = searchParams.get('token')

    if (token) {
      localStorage.setItem('token', token)

      getCurrentUser()
        .then((currentUser) => {
          login({
            id: currentUser.id,
            name: `${currentUser.first_name} ${currentUser.last_name}`,
            email: currentUser.email,
            role: currentUser.role,
          })

          const roleRoutes = {
            creator: '/dashboard/creator',
            business: '/dashboard/business',
            marketing: '/dashboard/marketing',
            administrator: '/dashboard/admin',
          }

          navigate(roleRoutes[currentUser.role] || '/dashboard')
        })
        .catch(() => {
          localStorage.removeItem('token')
          navigate('/login')
        })
    } else {
      navigate('/login')
    }
  }, [searchParams, navigate, login])

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--bg)' }}
    >
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600 dark:text-slate-400">Completing sign in...</p>
      </div>
    </div>
  )
}