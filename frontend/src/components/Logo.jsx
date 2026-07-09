/**
 * Logo component
 * Renders OrbitSocial SVG logo
 * Props: variant ('full' | 'icon'), theme ('light' | 'dark')
 */
export default function Logo({ variant = 'full', theme = 'light' }) {
  const primaryColor = theme === 'dark' ? '#A7B6D0' : '#0F1E3A'
  const textColor    = theme === 'dark' ? '#F9FAFB' : '#111827'

  if (variant === 'icon') {
    return (
      <svg width="32" height="32" viewBox="0 0 40 40" fill="none" role="img" aria-label="OrbitSocial">
        {/* Outer orbit ring */}
        <circle cx="20" cy="20" r="14" stroke={primaryColor} strokeWidth="2" fill="none" opacity="0.3" />
        {/* Inner orbit ring */}
        <circle cx="20" cy="20" r="9" stroke={primaryColor} strokeWidth="1.5" fill="none" opacity="0.5" />
        {/* Center hub */}
        <circle cx="20" cy="20" r="4" fill={primaryColor} />
        {/* Orbiting dots — platforms */}
        <circle cx="20" cy="6" r="2.5" fill={primaryColor} opacity="0.8" />
        <circle cx="34" cy="20" r="2" fill={primaryColor} opacity="0.7" />
        <circle cx="20" cy="34" r="2" fill={primaryColor} opacity="0.6" />
        <circle cx="6" cy="20" r="2" fill={primaryColor} opacity="0.5" />
      </svg>
    )
  }

  return (
    <svg width="160" height="32" viewBox="0 0 160 32" fill="none" role="img" aria-label="OrbitSocial">
      {/* Icon */}
      <g transform="translate(0, 0)">
        <circle cx="16" cy="16" r="11.2" stroke={primaryColor} strokeWidth="1.6" fill="none" opacity="0.3" />
        <circle cx="16" cy="16" r="7.2" stroke={primaryColor} strokeWidth="1.2" fill="none" opacity="0.5" />
        <circle cx="16" cy="16" r="3.2" fill={primaryColor} />
        <circle cx="16" cy="4.8" r="2" fill={primaryColor} opacity="0.8" />
        <circle cx="27.2" cy="16" r="1.6" fill={primaryColor} opacity="0.7" />
        <circle cx="16" cy="27.2" r="1.6" fill={primaryColor} opacity="0.6" />
        <circle cx="4.8" cy="16" r="1.6" fill={primaryColor} opacity="0.5" />
      </g>

      {/* Wordmark */}
      <text
        x="40" y="21"
        fontFamily="'Plus Jakarta Sans', 'Inter', sans-serif"
        fontSize="16"
        fontWeight="700"
        fill={textColor}
        letterSpacing="-0.4"
      >Orbit</text>
      <text
        x="84" y="21"
        fontFamily="'Plus Jakarta Sans', 'Inter', sans-serif"
        fontSize="16"
        fontWeight="600"
        fill={primaryColor}
        letterSpacing="-0.2"
      >Social</text>
    </svg>
  )
}
