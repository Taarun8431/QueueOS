export default function StatCard({ title, value, icon: Icon, color = 'primary', change, sub }) {
  const colors = {
    primary:   { bg: 'bg-primary-50',   icon: 'bg-primary-100 text-primary-600',   text: 'text-primary-600' },
    secondary: { bg: 'bg-secondary-50', icon: 'bg-secondary-100 text-secondary-600', text: 'text-secondary-600' },
    purple:    { bg: 'bg-purple-50',    icon: 'bg-purple-100 text-purple-600', text: 'text-purple-600' },
    orange:    { bg: 'bg-orange-50',    icon: 'bg-orange-100 text-orange-600', text: 'text-orange-600' },
    red:       { bg: 'bg-red-50',       icon: 'bg-red-100 text-red-600',    text: 'text-red-600' },
  }
  const c = colors[color] || colors.primary

  return (
    <div className="card flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        {change !== undefined && (
          <p className={`text-xs mt-1 font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? '▲' : '▼'} {Math.abs(change)}% vs last week
          </p>
        )}
      </div>
      <div className={`p-3 rounded-xl ${c.icon}`}>
        <Icon size={20} />
      </div>
    </div>
  )
}
