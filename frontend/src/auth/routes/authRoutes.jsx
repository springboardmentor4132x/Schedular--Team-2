import { Route } from 'react-router-dom'
import Landing from '../pages/Landing'
import RoleSelection from '../pages/RoleSelection'
import Register from '../pages/Register'
import Login from '../pages/Login'
import Terms from '../pages/Terms'
import BusinessPlaceholder from '../pages/BusinessPlaceholder'
import MarketingPlaceholder from '../pages/MarketingPlaceholder'

export const getAuthRoutes = (themeProps) => (
  <>
    <Route path="/"               element={<Landing              {...themeProps} />} />
    <Route path="/role-selection" element={<RoleSelection         {...themeProps} />} />
    <Route path="/register"       element={<Register             {...themeProps} />} />
    <Route path="/login"          element={<Login                {...themeProps} />} />
    <Route path="/terms"          element={<Terms                {...themeProps} />} />
    <Route path="/business"       element={<BusinessPlaceholder  {...themeProps} />} />
    <Route path="/marketing"      element={<MarketingPlaceholder {...themeProps} />} />
  </>
)
