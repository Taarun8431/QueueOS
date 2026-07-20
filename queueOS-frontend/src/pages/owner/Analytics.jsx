import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Users, Clock, ArrowUp, ArrowDown } from 'lucide-react'
import { toast } from 'react-toastify'
import PageHeader from '../../components/PageHeader'
import StatCard from '../../components/StatCard'
import api from '../../api'

export default function Analytics() {
  const [businesses, setBusinesses] = useState([])
  const [selectedBusiness, setSelectedBusiness] = useState('')
  const [stats, setStats] = useState(null)
  const [peakHours, setPeakHours] = useState([])
  const [serviceStats, setServiceStats] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/business/my')
      .then(res => {
        setBusinesses(res.data.data)
        if (res.data.data.length > 0) setSelectedBusiness(res.data.data[0].id)
      })
      .catch(() => toast.error('Failed to load businesses'))
  }, [])

  useEffect(() => {
    if (!selectedBusiness) return
    setLoading(true)
    Promise.all([
      api.get(`/analytics/business/${selectedBusiness}`),
      api.get(`/analytics/peak-hours/${selectedBusiness}`),
      api.get(`/analytics/services/${selectedBusiness}`),
    ])
      .then(([statsRes, peakRes, serviceRes]) => {
        setStats(statsRes.data.data)
        setPeakHours(peakRes.data.data)
        setServiceStats(serviceRes.data.data)
      })
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [selectedBusiness])

  const statCards = stats ? [
    { title: 'Total Tokens', value: stats.totalTokensGenerated, icon: Users, color: 'blue' },
    { title: 'Avg. Wait Time', value: `${stats.avgWaitTime} min`, icon: Clock, color: 'orange' },
    { title: 'Customers Served', value: stats.customersServed, icon: TrendingUp, color: 'green' },
    { title: 'No-Show Rate', value: `${stats.noShowRate}%`, icon: BarChart3, color: 'red' },
  ] : []

  const maxTokens = peakHours.length > 0 ? Math.max(...peakHours.map(p => p.totalTokens)) : 1

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Business performance overview" />

      {businesses.length > 1 && (
        <select className="input-field mb-6 max-w-xs" value={selectedBusiness} onChange={e => setSelectedBusiness(e.target.value)}>
          {businesses.map(b => <option key={b.id} value={b.id}>{b.businessName}</option>)}
        </select>
      )}

      {loading ? <p className="text-gray-400">Loading...</p> : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map(s => <StatCard key={s.title} {...s} />)}
          </div>

          {peakHours.length > 0 && (
            <div className="card mb-6">
              <h3 className="font-semibold text-gray-900 mb-6">Peak Hours</h3>
              <div className="flex items-end gap-3 h-40">
                {peakHours.slice(0, 12).map(d => (
                  <div key={d.id} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-500 font-medium">{d.totalTokens}</span>
                    <div className="w-full bg-primary-500 rounded-t-lg hover:bg-primary-600"
                      style={{ height: `${(d.totalTokens / maxTokens) * 100}%` }} />
                    <span className="text-xs text-gray-400">{d.id}h</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {serviceStats.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Services Breakdown</h3>
              <div className="space-y-3">
                {serviceStats.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm">
                    <p className="font-medium text-gray-900">{s.serviceName}</p>
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>Total: {s.totalTokens}</span>
                      <span className="text-green-600">Served: {s.servedCount}</span>
                      <span className="text-red-500">No-show: {s.noShowCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
