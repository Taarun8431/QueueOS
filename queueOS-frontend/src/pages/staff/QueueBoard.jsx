import { useState, useEffect } from 'react'
import { Users, Clock, CheckCircle, RefreshCw, Wifi, QrCode, X } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
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
  const [showQR, setShowQR] = useState(false)

  useEffect(() => {
    api.get('/staff/my-assignment')
      .then(res => {
        const a = res.data.data
        setAssignment(a)
        const bizId = a.businessId.id || a.businessId
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
    const bizId = assignment.businessId.id || assignment.businessId
    
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
            <option value="all">All Hospitals</option>
            {services.map(s => (
              <option key={s.id} value={s.id}>{s.serviceName}</option>
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

        {serviceFilter !== 'all' && (
          <button 
            onClick={() => setShowQR(true)}
            className="ml-auto flex items-center gap-2 bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-premium hover:bg-primary-800 transition"
          >
            <QrCode size={16} /> Generate Join QR
          </button>
        )}
      </div>

      {showQR && assignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative">
            <button onClick={() => setShowQR(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
            <div className="mb-6">
              <div className="w-16 h-16 bg-primary-100 text-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <QrCode size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-900">Hospital Queue</h3>
              <p className="text-sm text-slate-500 mt-1">
                {services.find(s => s.id === serviceFilter)?.serviceName}
              </p>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex justify-center mb-6">
              <QRCodeCanvas 
                value={`${window.location.origin}/customer/join-queue?businessId=${assignment.businessId.id || assignment.businessId}&serviceId=${serviceFilter}&doctorId=${assignment.staffId}`}
                size={200}
                level="H"
                includeMargin={true}
                className="rounded-xl"
              />
            </div>
            
            <p className="text-xs text-slate-400 font-medium px-4">
              Ask the patient to scan this code with their phone camera to instantly join this specific hospital.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map(q => (
          <div key={q.id} className={`card ${q.status === 'called' ? 'border-2 border-secondary-300 bg-secondary-50' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${q.status === 'called' ? 'bg-secondary-500 text-white' : 'bg-primary-50 text-primary-700 border border-primary-100'}`}>
                  {q.tokenNumber}
                </div>
                <div>
                  <p className="font-semibold text-primary-900">Patient #{q.tokenNumber}</p>
                  <p className="text-xs text-slate-500 font-mono">{q.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full capitalize font-semibold ${q.status === 'called' ? 'bg-secondary-100 text-secondary-700' : q.status === 'served' ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-600'}`}>
                  {q.status.replace('_', ' ')}
                </span>
                
                {q.status === 'waiting' && (
                  <button onClick={() => handleAction('call', q.id)} className="text-xs bg-primary-100 text-primary-700 px-3 py-1 rounded-full font-bold hover:bg-primary-200 transition-colors">
                    Call
                  </button>
                )}

                {q.status === 'called' && (
                  <>
                    <button onClick={() => handleAction('served', q.id)} className="text-xs bg-primary-600 text-white px-3 py-1 rounded-full font-bold hover:bg-primary-700 transition-colors">
                      Completed
                    </button>
                    <button onClick={() => handleAction('no-show', q.id)} className="text-xs bg-rose-500 text-white px-3 py-1 rounded-full font-bold hover:bg-rose-600 transition-colors">
                      No Show
                    </button>
                  </>
                )}

                {q.status === 'no_show' && (
                  <button onClick={() => handleAction('recall', q.id)} className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-bold hover:bg-amber-200 transition-colors">
                    Recall
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="card text-center py-12 border-dashed border-2 border-slate-200 shadow-none">
            <Users size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Queue is empty</p>
          </div>
        )}
      </div>
    </div>
  )
}
