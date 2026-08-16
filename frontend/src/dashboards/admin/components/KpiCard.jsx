import Card from '../../../shared/components/ui/Card'

export default function KpiCard({ label, value, icon: Icon, accent, span = false }) {
  return (
    <Card
      className={`p-4 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between ${span ? 'col-span-2 sm:col-span-1' : ''}`}
    >
      <div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          {label}
        </span>
        <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-0.5 block">
          {value}
        </span>
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}>
        <Icon size={18} />
      </div>
    </Card>
  )
}
