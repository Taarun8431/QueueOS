import { useState, useEffect } from 'react'
import { Activity, Clock, Users, CheckCircle, AlertCircle, X, Bell, AlertTriangle } from 'lucide-react'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import PageHeader from '../../components/PageHeader'
import api from '../../api'
import socket from '../../utils/socket'

export default function QueueStatus() {
  const [tokenId, setTokenId] = useState(localStorage.getItem('activeTokenId') || '')
  const [tokenData, setTokenData] = useState(null)
  const [myQueues, setMyQueues] = useState([])
  const [loading, setLoading] = useState(false)
  
  // Track emergency state if the doctor is paused
  const [isDoctorPaused, setIsDoctorPaused] = useState(false)

  const fetchStatus = async (id) => {
    if (!id) return
    setLoading(true)
    try {
      const res = await api.get(`/queue/position/${id}`)
      setTokenData(res.data.data)
      // Reset pause state on full fetch, assume it's fine unless socket says otherwise (or if API adds it later)
      setIsDoctorPaused(false)
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
    
    const handleQueueUpdate = (data) => {
      if (['tokenCalled', 'tokenServed', 'tokenCancelled', 'tokenNoShow'].includes(data.event)) {
        fetchStatus(tokenId)
      } else if (data.event === 'doctorPaused') {
        setIsDoctorPaused(data.isPaused)
      } else if (data.event === 'queuePaused') {
        setIsDoctorPaused(data.isPaused)
      }
    }

    socket.on('queueUpdated', handleQueueUpdate)
    return () => socket.off('queueUpdated', handleQueueUpdate)
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
    <div className="max-w-lg mx-auto pb-10">
      <PageHeader title={tokenData ? "Live Queue Status" : "My Walk-ins"} subtitle={tokenData ? "Real-time updates on your position" : "Your active and recent walk-ins"} />

      {!tokenData ? (
        <div className="space-y-4">
          {myQueues.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card text-center py-12 border-dashed border-2 border-slate-200 shadow-none">
              <Activity size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">You haven't joined any queues recently.</p>
            </motion.div>
          ) : (
            myQueues.map(q => (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={q._id} onClick={() => { setTokenId(q._id); localStorage.setItem('activeTokenId', q._id); }} className="card cursor-pointer group hover:border-primary-300 relative overflow-hidden">
                <div className="flex justify-between items-start mb-2 relative z-10">
                  <div>
                    <p className="font-bold text-primary-900">{q.businessId?.businessName}</p>
                    <p className="text-sm font-medium text-slate-500">{q.serviceId?.serviceName}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${['waiting', 'called'].includes(q.status) ? 'bg-secondary-100 text-secondary-800' : 'bg-slate-100 text-slate-500'}`}>
                    {q.status}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100 relative z-10">
                  <p className="text-3xl font-black text-primary-900">#{q.tokenNumber}</p>
                  <span className="text-primary-600 text-xs font-bold uppercase tracking-wide group-hover:underline">View Live Status &rarr;</span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key="status" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
            
            {isDoctorPaused && tokenData.status === 'waiting' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-2xl shadow-sm mb-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-amber-500 mt-0.5" size={20} />
                  <div>
                    <h3 className="text-sm font-bold text-amber-800">Emergency Pause Active</h3>
                    <p className="text-xs text-amber-700 mt-1 font-medium">Your specialist is currently handling an emergency case. Wait times will be longer than usual. Thank you for your patience.</p>
                  </div>
                </div>
              </motion.div>
            )}

            <div className={`rounded-[2rem] p-6 text-white shadow-premium relative overflow-hidden transition-colors duration-500 ${tokenData.status === 'served' ? 'bg-gradient-to-br from-secondary-500 to-secondary-600' : isDoctorPaused ? 'bg-gradient-to-br from-slate-600 to-slate-700' : 'bg-gradient-to-br from-primary-900 to-primary-700'}`}>
              
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1 relative z-10">Your Token</p>
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-5xl font-black">#{tokenData.tokenNumber}</p>
                  <p className="text-white/80 text-sm mt-1 font-semibold uppercase tracking-wide">Status: {tokenData.status === 'served' ? 'Completed' : tokenData.status}</p>
                  
                  {tokenData.position > 0 && (
                    <div className="mt-5 bg-white/10 backdrop-blur-md rounded-2xl p-4 inline-block border border-white/10 shadow-inner">
                      <p className="text-white text-sm font-bold flex items-center gap-2">
                        <Users size={16} />
                        {tokenData.position - 1 === 0 ? "You are next in line!" : `${tokenData.position - 1} people ahead of you.`}
                      </p>
                      {tokenData.estimatedWaitTime > 0 && !isDoctorPaused && (
                        <p className="text-white/80 text-xs mt-2 font-medium flex items-center gap-1.5">
                          <Clock size={14} />
                          Est. Wait: ~{tokenData.estimatedWaitTime} mins
                        </p>
                      )}
                      {isDoctorPaused && (
                         <p className="text-amber-300 text-xs mt-2 font-bold flex items-center gap-1.5">
                           <AlertTriangle size={14} /> Wait time unpredictable
                         </p>
                      )}
                    </div>
                  )}
                </div>
                {tokenData.status === 'called' && (
                  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ repeat: Infinity, duration: 1.5, repeatType: 'reverse' }} className="text-center bg-white/20 p-4 rounded-3xl backdrop-blur-md border border-white/30">
                    <Bell size={40} className="text-white mx-auto mb-2" />
                    <p className="text-white font-bold text-sm">Please Proceed</p>
                  </motion.div>
                )}
                {tokenData.status === 'served' && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-right">
                    <CheckCircle size={56} className="text-white mb-1 drop-shadow-md" />
                  </motion.div>
                )}
              </div>
              
              {tokenData.status === 'waiting' && !isDoctorPaused && (
                <div className="mt-6 bg-black/20 rounded-xl p-3 flex items-center gap-3 relative z-10">
                  <AlertCircle size={16} className="text-secondary-300 flex-shrink-0" />
                  <p className="text-xs text-white/90 font-medium">Stay in the waiting area. We'll notify you when it's your turn.</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => fetchStatus(tokenId)} className="btn-secondary flex-1 shadow-sm">Refresh Status</button>
              {tokenData.status === 'waiting' && (
                <button onClick={handleCancel} className="btn-danger flex items-center gap-1 px-5 shadow-sm">
                  <X size={16} /> Cancel
                </button>
              )}
              {['served', 'cancelled', 'no_show'].includes(tokenData.status) && (
                <button onClick={() => { setTokenData(null); setTokenId(''); localStorage.removeItem('activeTokenId'); }} className="btn-primary flex-1 shadow-md">
                  Done
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
