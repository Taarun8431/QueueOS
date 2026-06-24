import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Users, CheckCircle, Clock, PhoneCall, ArrowRight } from 'lucide-react'
import StatCard from '../../components/StatCard'
import PageHeader from '../../components/PageHeader'
import api from '../../api'
import socket from '../../utils/socket'

export default function StaffDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [assignment, setAssignment] = useState(null)
  const [queue, setQueue] = useState([])

  useEffect(() => {
    api.get('/staff/my-assignment')
      .then(res => {
        const a = res.data.data
        setAssignment(a)
        const bizId = a.businessId._id || a.businessId
        return api.get(`/queue/current/${bizId}/all`)
      })
      .then(res => setQueue(res.data.data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!assignment) return
    const bizId = assignment.businessId._id || assignment.businessId
    socket.emit('joinQueueRoom', { businessId: bizId, serviceId: 'all' })
    socket.on('queueUpdated', () => {
      api.get(`/queue/current/${bizId}/all`).then(res => setQueue(res.data.data)).catch(() => {})
    })
    return () => socket.off('queueUpdated')
  }, [assignment])

  const waiting = queue.filter(q => q.status === 'waiting')
  const called = queue.filter(q => q.status === 'called')

  const stats = [
    { title: 'In Queue', value: queue.length, icon: Users, color: 'blue' },
    { title: 'Waiting', value: waiting.length, icon: Clock, color: 'orange' },
    { title: 'Called', value: called.length, icon: PhoneCall, color: 'green' },
  ]

  const handleAction = async (action, tokenId) => {
    try {
      if (action === 'served') {
        await api.put(`/queue/served/${tokenId}`)
      } else if (action === 'no-show') {
        await api.put(`/queue/no-show/${tokenId}`)
      }
      // socket event will update the queue automatically
    } catch (err) {
      // toast.error(err.response?.data?.message || 'Action failed')
    }
  }

  return (
    <div>
      <PageHeader
        title="Staff Dashboard"
        subtitle={`Welcome, ${user?.name} · ${assignment?.businessId?.businessName || 'Not assigned'}`}
      />
      <div className="grid grid-cols-3 gap-4 mb-6">
        {stats.map(s => <StatCard key={s.title} {...s} />)}
      </div>
      {called.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6">
          <p className="text-green-700 text-xs font-semibold uppercase tracking-wider mb-2">Now Serving</p>
          {called.slice(0, 1).map(t => (
            <div key={t._id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-black text-lg">{t.tokenNumber}</div>
                <p className="font-bold text-gray-900">Token #{t.tokenNumber}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleAction('served', t._id)} className="btn-primary text-sm py-1.5">Served</button>
                <button onClick={() => handleAction('no-show', t._id)} className="btn-secondary text-sm py-1.5">No Show</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Waiting Queue</h3>
          <button onClick={() => navigate('/staff/queue-board')} className="text-primary-600 text-sm font-medium flex items-center gap-1">Full board <ArrowRight size={13} /></button>
        </div>
        <div className="space-y-2">
          {waiting.slice(0, 4).map(t => (
            <div key={t._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">{t.tokenNumber}</div>
                <p className="text-sm font-medium text-gray-900">Token #{t.tokenNumber}</p>
              </div>
            </div>
          ))}
          {waiting.length === 0 && <p className="text-gray-400 text-sm text-center py-4">Queue is empty</p>}
        </div>
      </div>
    </div>
  )
}
