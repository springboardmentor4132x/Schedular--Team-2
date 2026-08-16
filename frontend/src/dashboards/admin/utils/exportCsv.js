export function exportCsv({ filename, headers, rows }) {
  if (!rows || rows.length === 0) return false

  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const csv =
    '\uFEFF' +
    [headers, ...rows].map((r) => r.map(escape).join(',')).join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `${filename}_${Date.now()}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  return true
}
