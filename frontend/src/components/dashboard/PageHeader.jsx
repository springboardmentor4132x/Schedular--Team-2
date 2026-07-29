/**
 * PageHeader — consistent section header used at the top of every dashboard page.
 * Props:
 *   title       string
 *   subtitle    string  (optional)
 *   actions     ReactNode  (optional — right-side buttons)
 */
export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1
          className="text-xl sm:text-2xl font-extrabold"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  )
}
