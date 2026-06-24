import { useState, useEffect } from 'react'
import { Activity, Clock, Users, CheckCircle, AlertCircle, X } from 'lucide-react'
import { toast } from 'react-toastify'
import PageHeader from '../../components/PageHeader'
import api from '../../api'
import socket from '../../utils/socket'

export default function QueueStatus() {
  const [tokenId, setTokenId] = useState(localStorage.getItem('activeTokenId') || '')
  const [tokenData, setTokenData] = useState(null)
  const [myQueues, setMyQueues] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchStatus = async (id) => {
    if (!id) return
    setLoading(true)
    try {
      const res = await api.get(`/queue/position/${id}`)
      setTokenData(res.data.data)
    } catch {
      toast.error('Token not found')
      setTokenData(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchMyQueues = async () => {
    try {
      const res = await api.get('/queue/my')
      setMyQueues(res.data.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (tokenId) {
      fetchStatus(tokenId)
    } else {
      fetchMyQueues()
    }
  }, [tokenId])

  useEffect(() => {
    if (!tokenData) return
    socket.on('queueUpdated', (data) => {
      if (['tokenCalled', 'tokenServed', 'tokenCancelled', 'tokenNoShow'].includes(data.event)) {
        fetchStatus(tokenId)
      }
    })
    return () => socket.off('queueUpdated')
  }, [tokenData, tokenId])

  const handleCancel = async () => {
    try {
      await api.put(`/queue/cancel/${tokenId}`)
      toast.success('Token cancelled')
      setTokenData(null)
      localStorage.removeItem('activeTokenId')
      setTokenId('')
      fetchMyQueues()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel')
    }
  }

  return (
    <div className="max-w-lg">
      <PageHeader title={tokenData ? "Queue Status" : "My Queues"} subtitle={tokenData ? "Track your live position" : "Your active and recent queues"} />

      {!tokenData ? (
        <div className="space-y-4">
          {myQueues.length === 0 ? (
            <div className="card text-center py-12">
              <Activity size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">You haven't joined any queues recently.</p>
            </div>
          ) : (
            myQueues.map(q => (
              <div key={q._id} onClick={() => { setTokenId(q._id); localStorage.setItem('activeTokenId', q._id); }} className="card cursor-pointer hover:shadow-md transition">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-gray-900">{q.businessId?.businessName}</p>
                    <p className="text-sm text-gray-500">{q.serviceId?.serviceName}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${['waiting', 'called'].includes(q.status) ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                    {q.status}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                  <p className="text-2xl font-black text-gray-900">#{q.tokenNumber}</p>
                  <button className="text-primary-600 text-sm font-semibold">View Live Status</button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className={`rounded-2xl p-5 text-white ${tokenData.status === 'served' ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-primary-600 to-primary-700'}`}>
            <p className="text-white/80 text-sm mb-1">Your token</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-4xl font-black">#{tokenData.tokenNumber}</p>
                <p className="text-white/90 text-sm mt-1 capitalize">Status: {tokenData.status === 'served' ? 'Completed' : tokenData.status}</p>
                {tokenData.position > 0 && (
                  <p className="text-white/90 text-sm">Position #{tokenData.position} in queue</p>
                )}
              </div>
              {tokenData.status === 'called' && (
                <div className="text-right">
                  <p className="text-xl font-bold">🔔</p>
                  <p className="text-white/90 text-sm">You're being called!</p>
                </div>
              )}
              {tokenData.status === 'served' && (
                <div className="text-right">
                  <CheckCircle size={40} className="text-white mb-1" />
                </div>
              )}
            </div>
            {tokenData.status === 'waiting' && (
              <div className="mt-4 bg-white/10 rounded-xl p-3 flex items-center gap-2">
                <AlertCircle size={14} className="text-yellow-300" />
                <p className="text-xs text-white/90">Stay nearby. We'll notify you when you're next.</p>
              </div>
            )}
            {tokenData.status === 'served' && (
              <div className="mt-4 bg-white/20 rounded-xl p-3 flex items-center gap-2">
                <p className="text-xs text-white">Your appointment has been marked as completed successfully.</p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button onClick={() => fetchStatus(tokenId)} className="btn-secondary flex-1">Refresh</button>
            {tokenData.status === 'waiting' && (
              <button onClick={handleCancel} className="btn-danger flex items-center gap-1 px-4">
                <X size={14} /> Cancel Token
              </button>
            )}
            {['served', 'cancelled', 'no_show'].includes(tokenData.status) && (
              <button onClick={() => { setTokenData(null); setTokenId(''); localStorage.removeItem('activeTokenId'); }} className="btn-primary flex-1">
                Done
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
