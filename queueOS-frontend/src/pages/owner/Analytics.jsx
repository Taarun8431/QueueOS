import { BarChart3, TrendingUp, Users, Clock, ArrowUp, ArrowDown } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import StatCard from '../../components/StatCard'

const weekData = [
  { day: 'Mon', visitors: 82 },
  { day: 'Tue', visitors: 95 },
  { day: 'Wed', visitors: 120 },
  { day: 'Thu', visitors: 88 },
  { day: 'Fri', visitors: 140 },
  { day: 'Sat', visitors: 175 },
  { day: 'Sun', visitors: 60 },
]

const maxVal = Math.max(...weekData.map(d => d.visitors))

export default function Analytics() {
  const stats = [
    { title: 'Total Visitors (Month)', value: '3,420', icon: Users, color: 'blue', change: 14 },
    { title: 'Avg. Wait Time', value: '11 min', icon: Clock, color: 'orange', change: -8 },
    { title: 'Queues Completed', value: '1,248', icon: TrendingUp, color: 'green', change: 22 },
    { title: 'No-Show Rate', value: '4.2%', icon: BarChart3, color: 'red', change: -3 },
  ]

  const topServices = [
    { name: 'General Consultation', count: 420, pct: 34 },
    { name: 'Blood Test', count: 280, pct: 22 },
    { name: 'X-Ray', count: 195, pct: 16 },
    { name: 'Pharmacy', count: 310, pct: 25 },
    { name: 'Dental Checkup', count: 42, pct: 3 },
  ]

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Business performance overview" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => <StatCard key={s.title} {...s} />)}
      </div>

      {/* Weekly Chart */}
      <div className="card mb-6">
        <h3 className="font-semibold text-gray-900 mb-6">Weekly Visitor Trend</h3>
        <div className="flex items-end gap-3 h-40">
          {weekData.map(d => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-gray-500 font-medium">{d.visitors}</span>
              <div
                className="w-full bg-primary-500 rounded-t-lg transition-all duration-500 hover:bg-primary-600"
                style={{ height: `${(d.visitors / maxVal) * 100}%` }}
              />
              <span className="text-xs text-gray-400">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Services */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Top Services</h3>
          <div className="space-y-3">
            {topServices.map(s => (
              <div key={s.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{s.name}</span>
                  <span className="text-gray-500 font-medium">{s.count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Performance vs Last Month</h3>
          <div className="space-y-3">
            {[
              { label: 'Customer Satisfaction', value: '94%', trend: 'up', delta: '+2%' },
              { label: 'Queue Abandonment', value: '6.1%', trend: 'down', delta: '-1.4%' },
              { label: 'Avg Service Duration', value: '18 min', trend: 'down', delta: '-2 min' },
              { label: 'Peak Hour', value: '11:00 AM', trend: 'neutral', delta: 'unchanged' },
              { label: 'Repeat Customers', value: '62%', trend: 'up', delta: '+5%' },
            ].map(m => (
              <div key={m.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-600">{m.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 text-sm">{m.value}</span>
                  <span className={`text-xs flex items-center gap-0.5 ${
                    m.trend === 'up' ? 'text-green-600' :
                    m.trend === 'down' ? 'text-red-500' : 'text-gray-400'
                  }`}>
                    {m.trend === 'up' ? <ArrowUp size={10} /> : m.trend === 'down' ? <ArrowDown size={10} /> : null}
                    {m.delta}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
