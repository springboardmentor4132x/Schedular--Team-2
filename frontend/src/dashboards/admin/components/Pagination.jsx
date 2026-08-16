import Button from '../../../shared/components/ui/Button'

export default function Pagination({ currentPage, totalPages, totalItems, pageSize, entityLabel = 'items', onChange }) {
  if (totalItems === 0) return null

  const start = (currentPage - 1) * pageSize + 1
  const end = Math.min(currentPage * pageSize, totalItems)

  return (
    <div className="p-4 bg-slate-50/60 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
      <span className="text-slate-500 font-medium">
        Showing {start}–{end} of {totalItems} {entityLabel}
      </span>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="xs"
          disabled={currentPage === 1}
          onClick={() => onChange(currentPage - 1)}
        >
          Previous
        </Button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => onChange(pageNum)}
            className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
              currentPage === pageNum
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            {pageNum}
          </button>
        ))}

        <Button
          variant="outline"
          size="xs"
          disabled={currentPage === totalPages}
          onClick={() => onChange(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
