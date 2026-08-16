export function fullName(user) {
  if (!user) return ''
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ').trim()
  return name || user.username || user.email || 'Unnamed'
}

export function initialsOf(name) {
  return String(name || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export function formatDate(value) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return '—'
  }
}

export function isInLastDays(value, days) {
  if (!value) return false
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return false
  return Date.now() - d.getTime() <= days * 24 * 60 * 60 * 1000
}

export function isThisMonth(value) {
  if (!value) return false
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return false
  const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
}
