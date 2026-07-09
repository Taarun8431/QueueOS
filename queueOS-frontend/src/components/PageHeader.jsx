export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-primary-900 sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-slate-500 max-w-xl">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center justify-end">{action}</div>}
    </div>
  )
}
