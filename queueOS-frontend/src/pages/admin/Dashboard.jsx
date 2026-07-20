import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Building2, Users, Activity, TrendingUp, ShieldCheck, ArrowRight } from 'lucide-react'
import StatCard from '../../components/StatCard'
import PageHeader from '../../components/PageHeader'
import api from '../../api'

export default function AdminDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [businesses, setBusinesses] = useState([])

  useEffect(() => {
    api.get('/business/my').then(res => setBusinesses(res.data.data)).catch(() => {})
  }, [])

  const stats = [
    { title: 'Total Businesses', value: businesses.length, icon: Building2, color: 'blue' },
    { title: 'Active Sessions', value: '—', icon: Activity, color: 'green' },
    { title: 'Platform Revenue', value: '—', icon: TrendingUp, color: 'orange' },
  ]

  return (
    <div>
      <PageHeader title="Admin Dashboard" subtitle="Platform-wide overview and management" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map(s => <StatCard key={s.title} {...s} />)}
      </div>
      <div className="card mb-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ShieldCheck size={16} className="text-green-500" /> System Health
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[{ label: 'API Status', value: 'Online' }, { label: 'Database', value: 'Connected' }, { label: 'Redis', value: 'Connected' }].map(m => (
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
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Recent Businesses</h3>
          <button onClick={() => navigate('/admin/businesses')} className="text-primary-600 text-sm font-medium flex items-center gap-1">
            View all <ArrowRight size={13} />
          </button>
        </div>
        <div className="space-y-2">
          {businesses.slice(0, 5).map(b => (
            <div key={b.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl text-sm">
              <span className="font-medium text-gray-900">{b.businessName}</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-xs">{b.category}</span>
                <span className={b.isActive ? 'badge-active' : 'badge-inactive'}>{b.isActive ? 'active' : 'inactive'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
