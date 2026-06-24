import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Building2, Users, Clock, TrendingUp, PlusCircle } from 'lucide-react'
import StatCard from '../../components/StatCard'
import PageHeader from '../../components/PageHeader'
import api from '../../api'

export default function OwnerDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [businesses, setBusinesses] = useState([])

  useEffect(() => {
    api.get('/business/my').then(res => setBusinesses(res.data.data)).catch(() => {})
  }, [])

  const stats = [
    { title: 'Locations', value: businesses.length, icon: Building2, color: 'purple', change: 0 },
    { title: "Today's Visitors", value: '—', icon: Users, color: 'blue' },
    { title: 'Avg Wait Time', value: '—', icon: Clock, color: 'orange' },
    { title: 'Queues Served', value: '—', icon: TrendingUp, color: 'green' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="hero-panel">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-slate-200">Owner dashboard</p>
              <h2 className="mt-3 text-4xl font-black text-white">Hello, {user?.name?.split(' ')[0]}</h2>
              <p className="mt-3 max-w-xl text-sm text-slate-200/90">Manage businesses, track foot traffic, and see queue performance at a glance.</p>
            </div>
            <button onClick={() => navigate('/owner/businesses/create')} className="btn-secondary w-full max-w-xs text-sm sm:w-auto flex items-center gap-2">
              <PlusCircle size={16} /> New business
            </button>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Business snapshot</h3>
            <button onClick={() => navigate('/owner/analytics')} className="text-sm font-semibold text-primary-600">View analytics</button>
          </div>
          <div className="grid gap-4">
            {stats.map(stat => (
              <div key={stat.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{stat.title}</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{stat.value}</p>
                  </div>
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-3xl bg-primary-100 text-primary-600">
                    <stat.icon size={20} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Active locations</h3>
          <button onClick={() => navigate('/owner/businesses')} className="text-sm font-semibold text-primary-600">See all</button>
        </div>
        {businesses.length === 0 ? (
          <p className="text-gray-400 text-sm">No businesses yet. <button onClick={() => navigate('/owner/businesses/create')} className="text-primary-600 underline">Create one</button></p>
        ) : (
          <div className="space-y-3">
            {businesses.filter(b => b.isActive).map(b => (
              <div key={b._id} className="flex items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-primary-100 text-primary-700">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{b.businessName}</p>
                    <p className="text-sm text-slate-500">{b.category} · {b.workingHours?.open}–{b.workingHours?.close}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
