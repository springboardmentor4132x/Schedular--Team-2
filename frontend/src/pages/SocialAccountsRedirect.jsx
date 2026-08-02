import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function SocialAccountsRedirect() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { role } = useAuth()

  useEffect(() => {
    const target =
      role === 'business'  ? '/dashboard/connected-accounts' :
      role === 'marketing' ? '/dashboard/mkt/connected-apps' :
      '/dashboard/creator/social-accounts'
    const success = params.get('success') === 'true'
    const platform = params.get('platform')
    navigate(target, {
      replace: true,
      state: success ? { socialConnect: { success: true, platform } } : { socialConnect: { success: false } },
    })
  }, [role, navigate, params])

  return null
}
