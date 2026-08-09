import { useState, useEffect } from 'react'
import { Building2, Search, ChevronRight, Stethoscope, Clock, CalendarCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import PageHeader from '../../components/PageHeader'
import api from '../../api'

export default function HospitalSearch() {
  const [businesses, setBusinesses] = useState([])
  const [services, setServices] = useState([])
  
  const [search, setSearch] = useState('')
  const [selectedBusiness, setSelectedBusiness] = useState(null)
  const [selectedService, setSelectedService] = useState(null)
  
  const [loadingServices, setLoadingServices] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/business')
      .then(res => setBusinesses(res.data.data))
      .catch(() => toast.error('Failed to load hospitals'))
  }, [])

  const selectBusiness = async (b) => {
    setSelectedBusiness(b)
    setLoadingServices(true)
    try {
      const res = await api.get(`/services/business/${b.id || b.id}`)
      setServices(res.data.data)
    } catch {
      toast.error('Failed to load treatments')
    } finally {
      setLoadingServices(false)
    }
  }

  const handleAction = (type) => {
    if (!selectedBusiness || !selectedService) return
    const bId = selectedBusiness.id || selectedBusiness.id
    const sId = selectedService.id || selectedService.id
    if (type === 'walk-in') {
      navigate(`/customer/join-queue?businessId=${bId}&serviceId=${sId}`)
    } else {
      navigate(`/customer/book-appointment?businessId=${bId}&serviceId=${sId}`)
    }
  }

  const filtered = businesses.filter(b => b.isActive &&
    (b.businessName.toLowerCase().includes(search.toLowerCase()) || b.category.toLowerCase().includes(search.toLowerCase())))

  return (
    <div className="max-w-2xl mx-auto pb-10">
      <div className="flex justify-between items-start mb-6">
        <PageHeader title="Find Hospital" subtitle="Search for hospitals and select your treatment." />
      </div>

      <AnimatePresence mode="wait">
        {!selectedBusiness ? (
          <motion.div key="step1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
            <div className="relative mb-6">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input placeholder="Search hospitals by name..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-11 py-3.5" />
            </div>
            <div className="space-y-3">
              {filtered.map(b => (
                <button key={b.id || b.id} onClick={() => selectBusiness(b)}
                  className="card w-full flex items-center justify-between hover:border-primary-400 cursor-pointer text-left group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center transition-colors group-hover:bg-primary-100">
                      <Building2 size={20} className="text-primary-600" />
                    </div>
                    <div>
                      <p className="font-bold text-primary-900">{b.businessName}</p>
                      <span className="text-xs text-slate-500 font-medium">{b.address}</span>
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
            <div className="card mb-6 border-l-4 border-l-primary-500 shadow-sm">
              <p className="font-bold text-primary-900 text-lg">{selectedBusiness.businessName}</p>
              <p className="text-xs text-slate-500 font-medium">{selectedBusiness.address}</p>
            </div>
            <p className="text-sm font-semibold text-slate-700 mb-4">Select Treatment / Service:</p>
            {loadingServices ? <p className="text-slate-400 font-medium text-sm">Loading treatments...</p> : (
              <div className="space-y-3">
                {services.map(s => (
                  <button key={s.id || s.id} onClick={() => s.isActive && setSelectedService(s)}
                    className={`card w-full flex items-center justify-between text-left group ${s.isActive ? 'hover:border-primary-400 cursor-pointer' : 'opacity-60 cursor-not-allowed bg-slate-50'}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-primary-50 transition-colors border border-slate-100 group-hover:border-primary-100">
                        <Stethoscope size={18} className="text-slate-500 group-hover:text-primary-600" />
                      </div>
                      <div>
                        <p className="font-bold text-primary-900">{s.serviceName}</p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">{s.estimatedDuration} min</p>
                      </div>
                    </div>
                    {s.isActive ? (
                      <ChevronRight size={18} className="text-slate-300 group-hover:text-primary-600 transition-colors" />
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-100">Unavailable</span>
                    )}
                  </button>
                ))}
                {services.length === 0 && <p className="text-slate-400 text-sm font-medium py-6 text-center">No treatments available.</p>}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="step3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
             <button onClick={() => setSelectedService(null)} className="text-primary-600 text-sm mb-4 font-semibold hover:underline">← Back to treatments</button>
             <div className="card mb-8 border-l-4 border-l-primary-500 shadow-sm">
                <p className="font-bold text-primary-900 text-lg">{selectedService.serviceName}</p>
                <p className="text-xs text-slate-500 font-medium">{selectedBusiness.businessName}</p>
             </div>

             <h3 className="text-lg font-bold text-slate-800 mb-4 text-center">How would you like to proceed?</h3>
             
             <div className="grid sm:grid-cols-2 gap-4">
                <button onClick={() => handleAction('walk-in')} className="card text-center hover:border-secondary-400 hover:shadow-lg transition-all group p-8">
                  <div className="w-16 h-16 bg-secondary-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Clock size={28} className="text-secondary-600" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-lg mb-2">Join Walk-in Queue</h4>
                  <p className="text-xs text-slate-500 font-medium">Join the live queue right now and see your waiting time.</p>
                </button>
                
                <button onClick={() => handleAction('appointment')} className="card text-center hover:border-primary-400 hover:shadow-lg transition-all group p-8">
                  <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <CalendarCheck size={28} className="text-primary-600" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-lg mb-2">Book Appointment</h4>
                  <p className="text-xs text-slate-500 font-medium">Schedule a consultation for a future date and time.</p>
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
