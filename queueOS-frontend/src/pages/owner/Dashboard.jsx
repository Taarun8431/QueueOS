import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Building2, Users, Clock, TrendingUp, PlusCircle, ArrowRight } from 'lucide-react'
import StatCard from '../../components/StatCard'
import PageHeader from '../../components/PageHeader'
import { DUMMY_BUSINESSES } from '../../data/dummy'

export default function OwnerDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const stats = [
    { title: 'Total Businesses', value: DUMMY_BUSINESSES.length, icon: Building2, color: 'purple', change: 0 },
    { title: "Today's Visitors", value: 275, icon: Users, color: 'blue', change: 12 },
    { title: 'Avg Wait Time', value: '14 min', icon: Clock, color: 'orange', sub: 'Across all locations' },
    { title: 'Queues Served', value: 1248, icon: TrendingUp, color: 'green', change: 8 },
  ]

  const activeBusinesses = DUMMY_BUSINESSES.filter(b => b.status === 'active')

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.name?.split(' ')[0]}`}
        subtitle="Here's what's happening with your businesses today"
        action={
          <button onClick={() => navigate('/owner/businesses/create')}
            className="btn-primary flex items-center gap-2 text-sm">
            <PlusCircle size={16} /> New Business
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => <StatCard key={s.title} {...s} />)}
      </div>

      {/* Active Businesses */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Active Businesses</h3>
          <button onClick={() => navigate('/owner/businesses')}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
            View all <ArrowRight size={14} />
          </button>
        </div>
        <div className="space-y-3">
          {activeBusinesses.map(b => (
            <div key={b.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                  <Building2 size={18} className="text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{b.name}</p>
                  <p className="text-xs text-gray-400">{b.category} · {b.openingTime}–{b.closingTime}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800">{b.todayVisitors}</p>
                <p className="text-xs text-gray-400">visitors today</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Create Business', desc: 'Add a new location', icon: PlusCircle, path: '/owner/businesses/create', color: 'text-purple-600 bg-purple-50' },
          { label: 'View Analytics', desc: 'See performance metrics', icon: TrendingUp, path: '/owner/analytics', color: 'text-blue-600 bg-blue-50' },
          { label: 'Manage Services', desc: 'Update service offerings', icon: Clock, path: '/owner/services', color: 'text-green-600 bg-green-50' },
        ].map(a => (
          <button key={a.label} onClick={() => navigate(a.path)}
            className="card flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer text-left">
            <div className={`p-3 rounded-xl ${a.color}`}><a.icon size={20} /></div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{a.label}</p>
              <p className="text-xs text-gray-400">{a.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
