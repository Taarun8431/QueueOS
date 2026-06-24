import { useState, useEffect } from 'react'
import { Users, Clock, CheckCircle, RefreshCw, Wifi } from 'lucide-react'
import { toast } from 'react-toastify'
import PageHeader from '../../components/PageHeader'
import api from '../../api'
import socket from '../../utils/socket'

export default function QueueBoard() {
  const [assignment, setAssignment] = useState(null)
  const [queue, setQueue] = useState([])
  const [services, setServices] = useState([])
  const [serviceFilter, setServiceFilter] = useState('all')
  const [filter, setFilter] = useState('all')
  const [connected, setConnected] = useState(socket.connected)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/staff/my-assignment')
      .then(res => {
        const a = res.data.data
        setAssignment(a)
        const bizId = a.businessId._id || a.businessId
        return api.get(`/services/business/${bizId}`)
      })
      .then(res => {
        setServices(res.data.data)
      })
      .catch(() => toast.error('Failed to load services'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!assignment) return
    const bizId = assignment.businessId._id || assignment.businessId
    
    api.get(`/queue/current/${bizId}/${serviceFilter}`)
      .then(res => setQueue(res.data.data))
      .catch(() => toast.error('Failed to load queue'))

    socket.emit('joinQueueRoom', { businessId: bizId, serviceId: serviceFilter })
    
    const handleUpdate = () => {
      api.get(`/queue/current/${bizId}/${serviceFilter}`).then(res => setQueue(res.data.data)).catch(() => {})
    }
    
    socket.on('queueUpdated', handleUpdate)
    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))
    
    return () => { 
      socket.off('queueUpdated', handleUpdate)
      socket.off('connect')
      socket.off('disconnect') 
    }
  }, [assignment, serviceFilter])

  const handleAction = async (action, tokenId) => {
    try {
      if (action === 'call') {
        await api.put(`/queue/call/${tokenId}`)
        toast.success(`Token called!`)
      } else if (action === 'served') {
        await api.put(`/queue/served/${tokenId}`)
        toast.success(`Marked as Served!`)
      } else if (action === 'no-show') {
        await api.put(`/queue/no-show/${tokenId}`)
        toast.warning(`Marked as No Show!`)
      } else if (action === 'recall') {
        await api.put(`/queue/recall/${tokenId}`)
        toast.success(`Customer recalled!`)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed')
    }
  }

  const filtered = filter === 'all' ? queue : queue.filter(q => q.status === filter)

  if (loading) return <p className="text-gray-400">Loading...</p>

  if (!assignment) return (
    <div className="card text-center py-16">
      <p className="text-gray-500">You are not assigned to any business yet.</p>
    </div>
  )

  return (
    <div>
      <PageHeader
        title="Queue Board"
        subtitle={`${queue.length} people in queue`}
        action={
          <span className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${connected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
            <Wifi size={12} /> {connected ? 'Live' : 'Disconnected'}
          </span>
        }
      />
      
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-5">
        {services.length > 0 && (
          <select 
            className="input-field max-w-xs bg-white shadow-sm" 
            value={serviceFilter} 
            onChange={e => setServiceFilter(e.target.value)}
          >
            <option value="all">All Departments</option>
            {services.map(s => (
              <option key={s._id} value={s._id}>{s.serviceName}</option>
            ))}
          </select>
        )}

        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit overflow-x-auto">
          {['all', 'called', 'waiting', 'served', 'cancelled', 'no_show'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${filter === f ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(q => (
          <div key={q._id} className={`card ${q.status === 'called' ? 'border-2 border-green-300 bg-green-50' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${q.status === 'called' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'}`}>
                  {q.tokenNumber}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Token #{q.tokenNumber}</p>
                  <p className="text-xs text-gray-400 font-mono">{q._id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full capitalize ${q.status === 'called' ? 'bg-green-100 text-green-700' : q.status === 'served' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                  {q.status.replace('_', ' ')}
                </span>
                
                {q.status === 'waiting' && (
                  <button onClick={() => handleAction('call', q._id)} className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium hover:bg-indigo-200 transition-colors">
                    Call
                  </button>
                )}

                {q.status === 'called' && (
                  <>
                    <button onClick={() => handleAction('served', q._id)} className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full font-medium hover:bg-blue-700 transition-colors">
                      Served
                    </button>
                    <button onClick={() => handleAction('no-show', q._id)} className="text-xs bg-orange-500 text-white px-3 py-1 rounded-full font-medium hover:bg-orange-600 transition-colors">
                      No Show
                    </button>
                  </>
                )}

                {q.status === 'no_show' && (
                  <button onClick={() => handleAction('recall', q._id)} className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-medium hover:bg-orange-200 transition-colors">
                    Recall
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="card text-center py-12">
            <Users size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Queue is empty</p>
          </div>
        )}
      </div>
    </div>
  )
}
