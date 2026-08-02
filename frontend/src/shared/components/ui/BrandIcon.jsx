import { PLATFORM_ICONS, getPlatformBrand } from '../../../services/postAdapter'

export default function BrandIcon({ platform, size = 20, className = '' }) {
  const key = String(platform || '').toLowerCase()
  const Icon = PLATFORM_ICONS[key] || PLATFORM_ICONS.instagram
  const brand = getPlatformBrand(key)

  return (
    <Icon
      size={size}
      className={`${className} ${brand.className || ''}`}
      style={brand.color ? { color: brand.color } : undefined}
    />
  )
}
