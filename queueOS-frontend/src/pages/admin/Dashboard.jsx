import { useAuth } from '../../context/AuthContext'
import { Building2, Users, Activity, TrendingUp, ArrowRight, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import StatCard from '../../components/StatCard'
import PageHeader from '../../components/PageHeader'
import { DUMMY_BUSINESSES, DUMMY_USERS } from '../../data/dummy'

export default function AdminDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const stats = [
    { title: 'Total Businesses', value: DUMMY_BUSINESSES.length, icon: Building2, color: 'blue', change: 2 },
    { title: 'Registered Users', value: DUMMY_USERS.length, icon: Users, color: 'purple', change: 18 },
    { title: 'Active Sessions', value: 243, icon: Activity, color: 'green', change: 7 },
    { title: 'Platform Revenue', value: '$12.4K', icon: TrendingUp, color: 'orange', change: 15 },
  ]

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Platform-wide overview and management"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => <StatCard key={s.title} {...s} />)}
      </div>

      {/* System Health */}
      <div className="card mb-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ShieldCheck size={16} className="text-green-500" /> System Health
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'API Response', value: '98.9ms', status: 'good' },
            { label: 'Uptime', value: '99.97%', status: 'good' },
            { label: 'Error Rate', value: '0.03%', status: 'good' },
          ].map(m => (
            <div key={m.label} className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
              <span className="text-sm text-gray-600">{m.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">{m.value}</span>
                <span className="w-2 h-2 bg-green-500 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Businesses</h3>
            <button onClick={() => navigate('/admin/businesses')}
              className="text-primary-600 text-sm font-medium flex items-center gap-1">
              View all <ArrowRight size={13} />
            </button>
          </div>
          <div className="space-y-2">
            {DUMMY_BUSINESSES.slice(0, 3).map(b => (
              <div key={b.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl text-sm">
                <span className="font-medium text-gray-900">{b.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-xs">{b.category}</span>
                  <span className={b.status === 'active' ? 'badge-active' : 'badge-inactive'}>{b.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Users</h3>
            <button onClick={() => navigate('/admin/users')}
              className="text-primary-600 text-sm font-medium flex items-center gap-1">
              View all <ArrowRight size={13} />
            </button>
          </div>
          <div className="space-y-2">
            {DUMMY_USERS.slice(0, 3).map(u => (
              <div key={u.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl text-sm">
                <div>
                  <span className="font-medium text-gray-900">{u.name}</span>
                  <p className="text-xs text-gray-400">{u.email}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                  u.role === 'admin' ? 'bg-rose-100 text-rose-700' :
                  u.role === 'owner' ? 'bg-purple-100 text-purple-700' :
                  u.role === 'staff' ? 'bg-emerald-100 text-emerald-700' :
                  'bg-blue-100 text-blue-700'
                }`}>{u.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
