const ROLE_TITLE = 'Admin'

export function exportReportExcel(reportType, filters = {}, data = {}) {
  const reportTitle = data.title || `${ROLE_TITLE} ${reportType} Report`
  const timestamp = new Date().toLocaleString()

  let csvContent = '\uFEFF'
  csvContent += `OrbitSocial - ${reportTitle}\n`
  csvContent += `Generated At,${timestamp}\n`
  csvContent += `Role,${ROLE_TITLE}\n`
  csvContent += `Date Range,${filters.dateRange || '30 days'}\n`
  csvContent += `Platform Filter,${filters.platform || 'All'}\n`
  csvContent += `Campaign Filter,${filters.campaign || 'All'}\n`
  csvContent += `Content Type,${filters.contentType || 'All'}\n\n`

  if (data.summary) {
    csvContent += `--- EXECUTIVE KPI SUMMARY ---\n`
    Object.entries(data.summary).forEach(([key, val]) => {
      csvContent += `"${key}",${val}\n`
    })
    csvContent += `\n`
  }

  if (data.tableData && data.tableData.length > 0) {
    csvContent += `--- REPORT DATA DETAILS ---\n`
    const headers = Object.keys(data.tableData[0]).filter((h) => h !== 'id')
    csvContent += headers.map((h) => `"${h.toUpperCase()}"`).join(',') + '\n'

    data.tableData.forEach((row) => {
      const line = headers
        .map((h) => {
          const val = row[h] ?? ''
          return `"${String(val).replace(/"/g, '""')}"`
        })
        .join(',')
      csvContent += line + '\n'
    })
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `OrbitSocial_${ROLE_TITLE}_${reportType}_Report_${Date.now()}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  return true
}

export function exportReportPdf(reportType, filters = {}, data = {}) {
  const reportTitle = data.title || `${ROLE_TITLE} ${reportType} Report`
  const timestamp = new Date().toLocaleString()

  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('Please allow popups to download the PDF report.')
    return false
  }

  let tableHtml = ''
  if (data.tableData && data.tableData.length > 0) {
    const headers = Object.keys(data.tableData[0]).filter((h) => h !== 'id')
    tableHtml = `
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px;">
        <thead>
          <tr style="background-color: #4f46e5; color: white;">
            ${headers.map((h) => `<th style="padding: 10px; border: 1px solid #ddd; text-align: left;">${h.toUpperCase()}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.tableData
            .map(
              (row, idx) => `
            <tr style="background-color: ${idx % 2 === 0 ? '#f9fafb' : '#ffffff'};">
              ${headers.map((h) => `<td style="padding: 8px; border: 1px solid #e5e7eb;">${row[h] ?? ''}</td>`).join('')}
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    `
  }

  let summaryHtml = ''
  if (data.summary) {
    summaryHtml = `
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 20px;">
        ${Object.entries(data.summary)
          .map(
            ([key, val]) => `
          <div style="background: #f3f4f6; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb;">
            <div style="font-size: 10px; color: #6b7280; text-transform: uppercase; font-weight: bold;">${key}</div>
            <div style="font-size: 18px; font-weight: bold; color: #111827; margin-top: 4px;">${val}</div>
          </div>
        `
          )
          .join('')}
      </div>
    `
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${reportTitle} - OrbitSocial PDF</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #1e293b; }
          .header { border-bottom: 2px solid #4f46e5; padding-bottom: 15px; margin-bottom: 20px; }
          .title { font-size: 24px; font-weight: bold; color: #4f46e5; margin: 0; }
          .meta { font-size: 11px; color: #64748b; margin-top: 6px; }
          .filters { background: #f8fafc; padding: 10px; border-radius: 6px; margin-top: 10px; font-size: 11px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">OrbitSocial — ${reportTitle}</h1>
          <div class="meta">Generated: ${timestamp} | Role: ${ROLE_TITLE}</div>
          <div class="filters">
            <strong>Active Filters:</strong> Date Range: ${filters.dateRange || '30 days'} | Platform: ${filters.platform || 'All'} | Campaign: ${filters.campaign || 'All'} | Content: ${filters.contentType || 'All'}
          </div>
        </div>

        <h3>Executive Summary</h3>
        ${summaryHtml}

        <h3 style="margin-top: 30px;">Detailed Report Data</h3>
        ${tableHtml}

        <div style="margin-top: 40px; font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 10px;">
          OrbitSocial Platform Analytics &amp; Reports • Confidential
        </div>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `)
  printWindow.document.close()
  return true
}
