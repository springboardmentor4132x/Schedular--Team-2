import StatusBadge from '../../../../shared/components/ui/StatusBadge'

export default function ReportTable({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-400">
        No report records match the selected filters.
      </div>
    )
  }

  const headers = Object.keys(data[0]).filter((h) => h !== 'id')

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
            {headers.map((h) => (
              <th key={h} className="p-3.5 whitespace-nowrap">
                {h.replace(/([A-Z])/g, ' $1').toUpperCase()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200">
          {data.map((row, idx) => (
            <tr
              key={row.id || idx}
              className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors duration-150"
            >
              {headers.map((h) => {
                const val = row[h]
                if (h === 'status') {
                  return (
                    <td key={h} className="p-3.5 whitespace-nowrap font-medium">
                      <StatusBadge status={String(val).toLowerCase()} dot />
                    </td>
                  )
                }
                return (
                  <td key={h} className="p-3.5 whitespace-nowrap font-medium">
                    {val}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
