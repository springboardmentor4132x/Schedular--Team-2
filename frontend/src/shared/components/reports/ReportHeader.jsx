import React from 'react'
import { FileText, Download, FileSpreadsheet, Sparkles } from 'lucide-react'
import Button from '../Button'

export default function ReportHeader({ title, description, role, onExportPdf, onExportExcel }) {
  return (
    <section
      aria-label="Report Header"
      className="card relative overflow-hidden bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/40 dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              {title}
            </h1>
            <span className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
              <Sparkles size={12} />
              {role === 'admin' ? 'Admin Scope' : 'Creator Scope'}
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs md:text-sm font-medium">
            {description}
          </p>
        </div>

        {/* Action Export Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onExportPdf}
            className="flex items-center gap-1.5 font-bold text-xs"
          >
            <FileText size={14} className="text-rose-500" />
            <span>Export PDF</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onExportExcel}
            className="flex items-center gap-1.5 font-bold text-xs"
          >
            <FileSpreadsheet size={14} />
            <span>Export Excel</span>
          </Button>
        </div>
      </div>
    </section>
  )
}
