import { useState, useEffect } from 'react'
import { PhoneCall, CheckCircle, XCircle, Users } from 'lucide-react'
import { toast } from 'react-toastify'
import PageHeader from '../../components/PageHeader'
import api from '../../api'
import socket from '../../utils/socket'

export default function CallNext() {
  const [assignment, setAssignment] = useState(null)
  const [services, setServices] = useState([])
  const [selectedService, setSelectedService] = useState('all')
  const [queue, setQueue] = useState([])
  const [loadingAction, setLoadingAction] = useState(null)

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
  }, [])

  useEffect(() => {
    if (!assignment) return
    const bizId = assignment.businessId._id || assignment.businessId
    
    api.get(`/queue/current/${bizId}/${selectedService}`)
      .then(res => setQueue(res.data.data))
      .catch(() => toast.error('Failed to load queue'))

    socket.emit('joinQueueRoom', { businessId: bizId, serviceId: selectedService })
    
    const handleUpdate = () => {
      api.get(`/queue/current/${bizId}/${selectedService}`).then(res => setQueue(res.data.data)).catch(() => {})
    }
    
    socket.on('queueUpdated', handleUpdate)
    
    return () => { 
      socket.off('queueUpdated', handleUpdate) 
    }
  }, [assignment, selectedService])

  const handleAction = async (action, tokenId) => {
    setLoadingAction(tokenId)
    try {
      if (action === 'call') {
        await api.put(`/queue/call/${tokenId}`)
        toast.success(`Token called successfully!`)
      } else if (action === 'served') {
        await api.put(`/queue/served/${tokenId}`)
        toast.success(`Marked as Served`)
      } else if (action === 'no-show') {
        await api.put(`/queue/no-show/${tokenId}`)
        toast.success(`Marked as No Show`)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed')
    } finally {
      setLoadingAction(null)
    }
  }

  const waitingQueue = queue.filter(q => q.status === 'waiting')
  const attendingQueue = queue.filter(q => q.status === 'called')

  return (
    <div className="max-w-md">
      <PageHeader title="Queue Management" subtitle="Call and attend to customers" />

      {services.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Hospital</label>
          <select 
            className="input-field w-full bg-white shadow-sm" 
            value={selectedService} 
            onChange={e => setSelectedService(e.target.value)}
          >
            <option value="all">All Hospitals</option>
            {services.map(s => (
              <option key={s._id} value={s._id}>{s.serviceName}</option>
            ))}
          </select>
        </div>
      )}
      {attendingQueue.length > 0 && (
        <div className="mb-8">
          <h3 className="font-semibold text-secondary-700 mb-3 uppercase text-xs tracking-wider">Currently Attending</h3>
          <div className="space-y-3">
            {attendingQueue.map(q => (
              <div key={q._id} className="card py-4 px-4 border-2 border-secondary-200 bg-secondary-50 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold bg-secondary-500 text-white text-lg">
                      {q.tokenNumber}
                    </div>
                    <div>
                      <p className="font-bold text-primary-900 text-lg">Patient #{q.tokenNumber}</p>
                      <p className="text-xs text-secondary-600 font-medium flex items-center gap-1">
                        <PhoneCall size={12} /> Attending
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleAction('served', q._id)}
                    disabled={loadingAction === q._id}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <CheckCircle size={16} /> Completed
                  </button>
                  <button 
                    onClick={() => handleAction('no-show', q._id)}
                    disabled={loadingAction === q._id}
                    className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-xl py-2 text-sm flex items-center justify-center gap-1 transition-colors border border-rose-200"
                  >
                    <XCircle size={16} /> No Show
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="font-semibold text-primary-900 mb-3 uppercase text-xs tracking-wider">Up Next ({waitingQueue.length})</h3>
        <div className="space-y-3">
          {waitingQueue.map((q, idx) => (
            <div key={q._id} className="card py-3 px-4 flex items-center justify-between shadow-sm border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold bg-primary-50 text-primary-700 border border-primary-100">
                  {q.tokenNumber}
                </div>
                <div>
                  <p className="font-semibold text-primary-900">Patient #{q.tokenNumber}</p>
                  <p className="text-xs text-slate-500">Position: {idx + 1}</p>
                </div>
              </div>
              <button 
                onClick={() => handleAction('call', q._id)}
                disabled={loadingAction === q._id}
                className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm flex items-center gap-1"
              >
                <PhoneCall size={14} /> Call
              </button>
            </div>
          ))}
          {waitingQueue.length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-2xl border border-gray-100">
              <Users size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No one is waiting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
