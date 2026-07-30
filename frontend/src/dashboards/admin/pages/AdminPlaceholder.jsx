export default function AdminPlaceholder({ title, description }) {
  return (
    <div className="card max-w-[1400px] mx-auto mt-6 p-5 sm:p-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">{title}</h1>
      <p className="text-slate-700 dark:text-slate-300">{description}</p>
    </div>
  );
}
