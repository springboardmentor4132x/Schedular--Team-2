import API from '../shared/api/api'

export async function getReports() {
  const response = await API.get('/reports/')
  return response.data || []
}

export async function generateReport(payload) {
  const response = await API.post('/reports/generate', payload)
  return response.data
}

export async function generateAdminReport(payload) {
  const response = await API.post('/admin/reports/generate', payload)
  return response.data
}

export async function deleteReport(reportId) {
  const response = await API.delete(`/reports/${reportId}`)
  return response.data
}

export async function downloadReport(reportId) {
  const response = await API.get(`/reports/download/${reportId}`, { responseType: 'blob' })
  const disposition = response.headers?.['content-disposition'] || ''
  const match = disposition.match(/filename="?([^";]+)"?/)
  const filename = match ? match[1] : `report-${reportId}.pdf`
  const url = URL.createObjectURL(response.data)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
