import { useState, useEffect, useRef } from 'react'
import { Building2, Clock, Search, Users, ChevronRight, QrCode, Camera, X, User } from 'lucide-react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import PageHeader from '../../components/PageHeader'
import api from '../../api'

export default function JoinQueue() {
  const [businesses, setBusinesses] = useState([])
  const [services, setServices] = useState([])
  const [doctors, setDoctors] = useState([])
  
  const [search, setSearch] = useState('')
  const [selectedBusiness, setSelectedBusiness] = useState(null)
  const [selectedService, setSelectedService] = useState(null)
  
  const [joined, setJoined] = useState(false)
  const [token, setToken] = useState(null)
  
  const [loadingServices, setLoadingServices] = useState(false)
  const [loadingDoctors, setLoadingDoctors] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const init = async () => {
      try {
        const res = await api.get('/business')
        const allBusinesses = res.data.data
        setBusinesses(allBusinesses)
        
        const qBusinessId = searchParams.get('businessId')
        const qServiceId = searchParams.get('serviceId')
        
        if (qBusinessId && qServiceId) {
          const b = allBusinesses.find(bus => bus.id === qBusinessId || bus._id === qBusinessId)
          if (b) {
            setSelectedBusiness(b)
            const sRes = await api.get(`/services/business/${qBusinessId}`)
            const s = sRes.data.data.find(srv => srv.id === qServiceId || srv._id === qServiceId)
            if (s) {
              setSelectedService(s)
              setLoadingDoctors(true)
              const dRes = await api.get(`/staff/role?businessId=${qBusinessId}&roleType=OPD_Doctor`)
              setDoctors(dRes.data.data)
              setLoadingDoctors(false)
            }
          }
        }
      } catch {
        toast.error('Failed to load data')
      }
    }
    init()
  }, [searchParams])

  useEffect(() => {
    if (!showScanner) return
    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false)
    scanner.render((decodedText) => {
      scanner.clear()
      setShowScanner(false)
      try {
        const url = new URL(decodedText)
        const bId = url.searchParams.get('businessId')
        const sId = url.searchParams.get('serviceId')
        if (bId && sId) handleAutoJoin(bId, sId)
        else toast.error('Invalid QR code format')
      } catch {
        toast.error('Invalid QR code URL')
      }
    }, (err) => {})

    return () => { scanner.clear().catch(e => {}) }
  }, [showScanner])

  const handleAutoJoin = async (bId, sId) => {
    try {
      const res = await api.post('/queue/token', { businessId: bId, serviceId: sId })
      setToken(res.data.data)
      setJoined(true)
      toast.success(`Walk-in registered! Token: #${res.data.data.tokenNumber}`)
      setTimeout(() => {
        localStorage.setItem('activeTokenId', res.data.data._id)
        navigate('/customer/queue-status')
      }, 2000)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to auto-join queue')
    }
  }

  const selectBusiness = async (b) => {
    setSelectedBusiness(b)
    setLoadingServices(true)
    try {
      const res = await api.get(`/services/business/${b._id}`)
      setServices(res.data.data)
    } catch {
      toast.error('Failed to load services')
    } finally {
      setLoadingServices(false)
    }
  }

  const handleServiceSelect = async (service) => {
    setSelectedService(service)
    setLoadingDoctors(true)
    try {
      const res = await api.get(`/staff/role?businessId=${selectedBusiness._id}&roleType=OPD_Doctor`)
      setDoctors(res.data.data)
    } catch (err) {
      toast.error('Failed to load OPD doctors')
    } finally {
      setLoadingDoctors(false)
    }
  }

  const handleJoin = async (preferredStaffId = null) => {
    try {
      const payload = { businessId: selectedBusiness._id, serviceId: selectedService._id }
      if (preferredStaffId) {
        payload.preferredStaffId = preferredStaffId
      }
      const res = await api.post('/queue/token', payload)
      setToken(res.data.data)
      setJoined(true)
      toast.success(`Walk-in registered! Token: #${res.data.data.tokenNumber}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register walk-in')
    }
  }

  const filtered = businesses.filter(b => b.isActive &&
    (b.businessName.toLowerCase().includes(search.toLowerCase()) || b.category.toLowerCase().includes(search.toLowerCase())))

  if (joined && token) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto mt-10">
        <div className="card text-center border-t-4 border-t-secondary-500">
          <div className="w-20 h-20 bg-secondary-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-secondary-200">
            <span className="text-3xl font-black text-secondary-600">#{token.tokenNumber}</span>
          </div>
          <h2 className="text-xl font-bold text-primary-900 mb-1">Walk-in Registered</h2>
          <p className="text-slate-500 text-sm mb-6">{selectedBusiness.businessName}</p>
          <button onClick={() => { setJoined(false); setSelectedBusiness(null); setSelectedService(null); setToken(null) }} className="btn-secondary w-full">Join Another</button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <PageHeader title="Walk-In Registration" subtitle="Select a hospital or scan a QR code to register." />
        {!selectedBusiness && (
          <button 
            onClick={() => setShowScanner(true)}
            className="flex items-center gap-2 bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-premium hover:bg-primary-800 transition-all hover:-translate-y-0.5"
          >
            <QrCode size={16} /> Scan QR
          </button>
        )}
      </div>

      {showScanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full relative shadow-premium">
            <button onClick={() => setShowScanner(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-50">
              <X size={24} />
            </button>
            <h3 className="text-xl font-bold text-primary-900 mb-4 text-center">Scan Hospital QR</h3>
            <div id="reader" className="w-full overflow-hidden rounded-2xl border-2 border-primary-100"></div>
            <p className="text-xs text-slate-500 text-center mt-4">Point your camera at the Receptionist's screen to instantly register.</p>
          </div>
        </div>
      )}
      
      <AnimatePresence mode="wait">
        {!selectedBusiness ? (
          <motion.div key="step1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
            <div className="relative mb-6">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input placeholder="Search hospitals..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-11 py-3.5" />
            </div>
            <div className="space-y-3">
              {filtered.map(b => (
                <button key={b.id || b._id} onClick={() => selectBusiness(b)}
                  className="card w-full flex items-center justify-between hover:shadow-premium cursor-pointer text-left group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center transition-colors group-hover:bg-primary-100">
                      <Building2 size={20} className="text-primary-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-primary-900">{b.businessName}</p>
                      <span className="text-xs text-slate-500 font-medium">{b.category}</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-primary-600 transition-colors" />
                </button>
              ))}
              {filtered.length === 0 && <p className="text-slate-400 text-sm text-center py-10 font-medium">No hospitals found.</p>}
            </div>
          </motion.div>
        ) : !selectedService ? (
          <motion.div key="step2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
            <button onClick={() => setSelectedBusiness(null)} className="text-primary-600 text-sm mb-4 font-semibold hover:underline">← Back to hospitals</button>
            <div className="card mb-6 border-l-4 border-l-primary-500">
              <p className="font-bold text-primary-900 text-lg">{selectedBusiness.businessName}</p>
              <p className="text-xs text-slate-500 font-medium">{selectedBusiness.category} · {selectedBusiness.address}</p>
            </div>
            <p className="text-sm font-semibold text-slate-700 mb-4">Select reason for visit:</p>
            {loadingServices ? <p className="text-slate-400 font-medium text-sm">Loading services...</p> : (
              <div className="space-y-3">
                {services.map(s => (
                  <button key={s.id || s._id} onClick={() => s.isActive && handleServiceSelect(s)}
                    className={`card w-full flex items-center justify-between text-left group ${s.isActive ? 'hover:shadow-premium cursor-pointer' : 'opacity-60 cursor-not-allowed bg-slate-50'}`}>
                    <div>
                      <p className="font-semibold text-primary-900">{s.serviceName}</p>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{s.estimatedDuration} min</p>
                    </div>
                    {s.isActive ? (
                      <ChevronRight size={18} className="text-slate-300 group-hover:text-primary-600 transition-colors" />
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-100">Unavailable</span>
                    )}
                  </button>
                ))}
                {services.length === 0 && <p className="text-slate-400 text-sm font-medium py-6 text-center">No services available.</p>}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="step3" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
             <button onClick={() => setSelectedService(null)} className="text-primary-600 text-sm mb-4 font-semibold hover:underline">← Back to services</button>
             <div className="card mb-6 border-l-4 border-l-primary-500">
                <p className="font-bold text-primary-900 text-lg">{selectedService.serviceName}</p>
                <p className="text-xs text-slate-500 font-medium">{selectedBusiness.businessName}</p>
             </div>

             <p className="text-sm font-semibold text-slate-700 mb-4">Select your preferred doctor (Optional):</p>
             {loadingDoctors ? <p className="text-slate-400 font-medium text-sm">Loading doctors...</p> : (
               <div className="space-y-3">
                  <button onClick={() => handleJoin(null)} className="card w-full flex items-center gap-4 hover:border-primary-300 hover:bg-primary-50/30 transition-all text-left">
                     <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                       <Clock size={20} className="text-slate-500" />
                     </div>
                     <div>
                       <p className="font-bold text-slate-900">Next Available Doctor</p>
                       <p className="text-xs text-slate-500 mt-0.5">Fastest option</p>
                     </div>
                  </button>
                  
                  {doctors.map(doc => (
                    <button key={doc.id} onClick={() => handleJoin(doc.id)} className="card w-full flex items-center gap-4 hover:border-primary-300 transition-all text-left group">
                       <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                         <User size={20} className="text-primary-700" />
                       </div>
                       <div className="flex-1">
                         <p className="font-bold text-primary-900">{doc.name}</p>
                         <p className="text-xs text-slate-500 mt-0.5">OPD Specialist</p>
                       </div>
                       {doc.isEmergencyPaused && (
                         <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-100 mr-2">Busy</span>
                       )}
                       <ChevronRight size={18} className="text-slate-300 group-hover:text-primary-600" />
                    </button>
                  ))}
               </div>
             )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
