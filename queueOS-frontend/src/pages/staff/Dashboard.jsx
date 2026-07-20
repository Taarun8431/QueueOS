import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Users, CheckCircle, Clock, PhoneCall, ArrowRight, AlertTriangle, Stethoscope, QrCode, X } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import StatCard from '../../components/StatCard'
import PageHeader from '../../components/PageHeader'
import api from '../../api'
import socket from '../../utils/socket'

export default function StaffDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [assignment, setAssignment] = useState(null)
  const [queue, setQueue] = useState([])
  const [isPaused, setIsPaused] = useState(false)
  const [pauseLoading, setPauseLoading] = useState(false)
  const [services, setServices] = useState([])
  const [showQR, setShowQR] = useState(false)
  const [qrServiceId, setQrServiceId] = useState('')

  useEffect(() => {
    api.get('/staff/my-assignment')
      .then(res => {
        const a = res.data.data
        setAssignment(a)
        setIsPaused(a.isEmergencyPaused || false)
        const bizId = a.businessId.id || a.businessId
        api.get(`/services/business/${bizId}`).then(sRes => {
          setServices(sRes.data.data)
          if(sRes.data.data.length > 0) setQrServiceId(sRes.data.data[0].id)
        }).catch(() => {})
        return api.get(`/queue/current/${bizId}/all`)
      })
      .then(res => setQueue(res.data.data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!assignment) return
    const bizId = assignment.businessId.id || assignment.businessId
    socket.emit('joinQueueRoom', { businessId: bizId, serviceId: 'all' })
    socket.on('queueUpdated', (data) => {
      if(data.event === 'doctorPaused' && data.staffId === user.userId) {
        setIsPaused(data.isPaused)
      }
      api.get(`/queue/current/${bizId}/all`).then(res => setQueue(res.data.data)).catch(() => {})
    })
    return () => socket.off('queueUpdated')
  }, [assignment, user])

  const waiting = queue.filter(q => q.status === 'waiting' && (!q.preferredStaffId || q.preferredStaffId === user.userId))
  const called = queue.filter(q => q.status === 'called')

  const stats = [
    { title: 'My Walk-ins', value: queue.length, icon: Users, color: 'primary' },
    { title: 'Waiting', value: waiting.length, icon: Clock, color: 'orange' },
    { title: 'Consulting', value: called.length, icon: Stethoscope, color: 'secondary' },
  ]

  const handleAction = async (action, tokenId) => {
    try {
      if (action === 'served') {
        await api.put(`/queue/served/${tokenId}`)
      } else if (action === 'no-show') {
        await api.put(`/queue/no-show/${tokenId}`)
      }
    } catch (err) {}
  }

  const toggleEmergencyPause = async () => {
    setPauseLoading(true)
    try {
      const res = await api.put('/queue/doctor/pause', { isEmergencyPaused: !isPaused })
      setIsPaused(res.data.data.isEmergencyPaused)
      toast.success(res.data.data.isEmergencyPaused ? 'Emergency Pause Activated' : 'Resumed Operations')
    } catch (err) {
      toast.error('Failed to toggle emergency pause')
    } finally {
      setPauseLoading(false)
    }
  }

  return (
    <div className="pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
        <PageHeader
          title="Doctor Dashboard"
          subtitle={`Welcome, Dr. ${user?.name?.split(' ')[0]} · ${assignment?.businessId?.businessName || 'Not assigned'}`}
        />
        {assignment && (
          <div className="flex flex-wrap items-center gap-3">
             <button onClick={() => setShowQR(true)} className="flex items-center gap-2 bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-premium hover:bg-primary-800 transition">
               <QrCode size={16} /> Generate QR
             </button>
             <div className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border ${assignment.roleType === 'Appointment_Doctor' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-primary-50 text-primary-700 border-primary-200'}`}>
                {assignment.roleType ? assignment.roleType.replace('_', ' ') : 'General Staff'}
             </div>
          </div>
        )}
      </div>
      
      <motion.div animate={isPaused ? { opacity: 0.8, filter: 'grayscale(0.5)' } : { opacity: 1, filter: 'grayscale(0)' }}>
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
           {stats.map(s => <StatCard key={s.title} {...s} />)}
         </div>

         <div className={`card mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors ${isPaused ? 'bg-amber-50 border-amber-300 shadow-inner' : 'bg-slate-900'}`}>
            <div className="flex items-center gap-4">
               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isPaused ? 'bg-amber-100 text-amber-600' : 'bg-white/10 text-white'}`}>
                  <AlertTriangle size={24} />
               </div>
               <div>
                 <h3 className={`font-bold text-lg ${isPaused ? 'text-amber-900' : 'text-white'}`}>Emergency Override</h3>
                 <p className={`text-xs font-medium mt-0.5 ${isPaused ? 'text-amber-700' : 'text-slate-400'}`}>
                   {isPaused ? 'Operations are currently paused due to an emergency.' : 'Temporarily pause walk-in routing for emergencies.'}
                 </p>
               </div>
            </div>
            <button 
              onClick={toggleEmergencyPause}
              disabled={pauseLoading}
              className={`px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all ${isPaused ? 'bg-white text-amber-700 hover:bg-amber-100 border border-amber-200' : 'bg-rose-500 text-white hover:bg-rose-600 border border-rose-600'} disabled:opacity-50`}
            >
               {pauseLoading ? 'Processing...' : isPaused ? 'Resume Operations' : 'Trigger Emergency Pause'}
            </button>
         </div>

         {called.length > 0 && (
           <div className="bg-secondary-50 border border-secondary-200 rounded-[2rem] p-6 mb-6 shadow-sm">
             <p className="text-secondary-700 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                <Stethoscope size={16} /> Now Consulting
             </p>
             {called.slice(0, 1).map(t => (
               <div key={t.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-secondary-100">
                 <div className="flex items-center gap-4">
                   <div className="w-14 h-14 bg-secondary-500 rounded-full flex items-center justify-center text-white font-black text-xl shadow-inner">{t.tokenNumber}</div>
                   <div>
                     <p className="font-bold text-primary-900 text-lg">Patient #{t.tokenNumber}</p>
                     <p className="text-xs text-slate-500 font-medium">Started {(new Date(t.updatedAt)).toLocaleTimeString()}</p>
                   </div>
                 </div>
                 <div className="flex gap-2 w-full sm:w-auto">
                   <button onClick={() => handleAction('served', t.id)} className="btn-primary py-2.5 px-6 flex-1 sm:flex-none">Completed</button>
                   <button onClick={() => handleAction('no-show', t.id)} className="btn-secondary py-2.5 px-6 flex-1 sm:flex-none">No Show</button>
                 </div>
               </div>
             ))}
           </div>
         )}
         
         <div className="card">
           <div className="flex items-center justify-between mb-6">
             <div>
               <h3 className="font-bold text-primary-900">Waiting Patients</h3>
               <p className="text-xs text-slate-500 font-medium mt-0.5">Walk-ins routed to you</p>
             </div>
             <button onClick={() => navigate('/staff/queue-board')} className="text-primary-600 text-sm font-bold flex items-center gap-1 hover:underline">Full board <ArrowRight size={14} /></button>
           </div>
           
           <div className="space-y-3">
             {waiting.slice(0, 4).map(t => (
               <div key={t.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors border border-slate-100">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-white shadow-sm border border-slate-200 rounded-full flex items-center justify-center text-sm font-bold text-primary-700">{t.tokenNumber}</div>
                   <div>
                     <p className="text-sm font-bold text-primary-900">Patient #{t.tokenNumber}</p>
                     <p className="text-[11px] text-slate-500 font-medium mt-0.5">{t.serviceId?.serviceName}</p>
                   </div>
                 </div>
                 <button onClick={() => api.put(`/queue/call/${t.id}`).catch(() => {})} className="btn-secondary py-1.5 px-4 text-xs">Call Patient</button>
               </div>
             ))}
             {waiting.length === 0 && <p className="text-slate-400 text-sm font-medium text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">No patients waiting.</p>}
           </div>
         </div>
      </motion.div>

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
              <h3 className="text-xl font-black text-slate-900">Your Room QR</h3>
              
              <select className="input-field mt-3 text-sm text-center" value={qrServiceId} onChange={e => setQrServiceId(e.target.value)}>
                 {services.map(s => <option key={s.id} value={s.id}>{s.serviceName}</option>)}
              </select>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex justify-center mb-6">
              {qrServiceId ? (
                <QRCodeCanvas 
                  value={`${window.location.origin}/customer/join-queue?businessId=${assignment.businessId.id || assignment.businessId}&serviceId=${qrServiceId}&doctorId=${assignment.staffId.id || assignment.staffId}`}
                  size={200}
                  level="H"
                  includeMargin={true}
                  className="rounded-xl"
                />
              ) : (
                <p className="text-sm text-slate-400 py-10">No departments available</p>
              )}
            </div>
            
            <p className="text-xs text-slate-400 font-medium px-4">
              Ask the patient to scan this code to instantly join your queue.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
