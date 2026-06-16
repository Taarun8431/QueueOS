import { BarChart3, Users, Building2, TrendingUp, Globe, Activity } from 'lucide-react'
import StatCard from '../../components/StatCard'
import PageHeader from '../../components/PageHeader'

const monthlyData = [
  { month: 'Jan', users: 120, queues: 890 },
  { month: 'Feb', users: 185, queues: 1240 },
  { month: 'Mar', users: 240, queues: 1580 },
  { month: 'Apr', users: 310, queues: 2100 },
  { month: 'May', users: 380, queues: 2780 },
  { month: 'Jun', users: 450, queues: 3420 },
]

const maxQueues = Math.max(...monthlyData.map(d => d.queues))

export default function PlatformAnalytics() {
  const stats = [
    { title: 'Total Users', value: '2,847', icon: Users, color: 'blue', change: 23 },
    { title: 'Active Businesses', value: '156', icon: Building2, color: 'purple', change: 12 },
    { title: 'Queues This Month', value: '34,200', icon: Activity, color: 'green', change: 18 },
    { title: 'Platform Revenue', value: '$48.9K', icon: TrendingUp, color: 'orange', change: 31 },
  ]

  const categoryBreakdown = [
    { name: 'Hospital', count: 48, pct: 31 },
    { name: 'Bank', count: 35, pct: 22 },
    { name: 'Salon', count: 42, pct: 27 },
    { name: 'Government', count: 18, pct: 12 },
    { name: 'Service Center', count: 13, pct: 8 },
  ]

  return (
    <div>
      <PageHeader title="Platform Analytics" subtitle="Complete platform performance metrics" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => <StatCard key={s.title} {...s} />)}
      </div>

      {/* Monthly Growth Chart */}
      <div className="card mb-6">
        <h3 className="font-semibold text-gray-900 mb-6">Monthly Queue Volume</h3>
        <div className="flex items-end gap-4 h-48">
          {monthlyData.map(d => (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-gray-500 font-medium">{d.queues.toLocaleString()}</span>
              <div
                className="w-full bg-primary-500 rounded-t-lg hover:bg-primary-600 transition-colors"
                style={{ height: `${(d.queues / maxQueues) * 100}%` }}
              />
              <span className="text-xs text-gray-400">{d.month}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category Breakdown */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Globe size={16} className="text-primary-500" /> Business by Category
          </h3>
          <div className="space-y-3">
            {categoryBreakdown.map(c => (
              <div key={c.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{c.name}</span>
                  <span className="text-gray-500">{c.count} ({c.pct}%)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-primary-500" /> Platform KPIs
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Daily Active Users', value: '1,240', sub: '+12% vs yesterday' },
              { label: 'Avg Queues / Business', value: '8.4', sub: 'Per business per day' },
              { label: 'Customer Satisfaction', value: '4.6 / 5', sub: 'Based on 2,840 ratings' },
              { label: 'Avg Wait Time', value: '14.2 min', sub: 'Across all queues' },
              { label: 'Mobile App Usage', value: '73%', sub: 'Of total sessions' },
            ].map(m => (
              <div key={m.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm text-gray-700">{m.label}</p>
                  <p className="text-xs text-gray-400">{m.sub}</p>
                </div>
                <p className="font-bold text-gray-900">{m.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
