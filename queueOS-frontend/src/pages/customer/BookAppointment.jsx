import { useState, useEffect } from 'react'
import { Building2, CalendarCheck, ChevronRight, User, Stethoscope, Clock, FileText } from 'lucide-react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import PageHeader from '../../components/PageHeader'
import api from '../../api'

export default function BookAppointment() {
  const [step, setStep] = useState(1)
  const [businesses, setBusinesses] = useState([])
  const [services, setServices] = useState([])
  const [doctors, setDoctors] = useState([])
  const [timeSlots, setTimeSlots] = useState([])
  
  const [selectedBusiness, setSelectedBusiness] = useState(null)
  const [selectedService, setSelectedService] = useState(null)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  
  const [intakeForm, setIntakeForm] = useState({
    reason: '',
    symptoms: '',
    history: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
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
          const b = allBusinesses.find(bus => bus.id === qBusinessId || bus.id === qBusinessId)
          if (b) {
            setSelectedBusiness(b)
            const sRes = await api.get(`/services/business/${qBusinessId}`)
            const s = sRes.data.data.find(srv => srv.id === qServiceId || srv.id === qServiceId)
            if (s) {
              setSelectedService(s)
              setLoading(true)
              const dRes = await api.get(`/staff/role?businessId=${qBusinessId}&roleType=Appointment_Doctor`)
              setDoctors(dRes.data.data)
              setStep(3)
              setLoading(false)
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
    if (selectedDoctor && selectedDate) {
      setLoading(true)
      api.get(`/staff/availability?staffId=${selectedDoctor.id}&businessId=${selectedBusiness.id}&date=${selectedDate}`)
        .then(res => {
          setTimeSlots(res.data.data)
        })
        .catch(() => toast.error('Failed to load availability'))
        .finally(() => setLoading(false))
    }
  }, [selectedDoctor, selectedDate, selectedBusiness])

  const selectBusiness = async (b) => {
    setSelectedBusiness(b)
    try {
      const res = await api.get(`/services/business/${b.id}`)
      setServices(res.data.data)
      setStep(2)
    } catch { toast.error('Failed to load services') }
  }

  const selectService = async (s) => {
    setSelectedService(s)
    setLoading(true)
    try {
      const res = await api.get(`/staff/role?businessId=${selectedBusiness.id}&roleType=Appointment_Doctor`)
      setDoctors(res.data.data)
      setStep(3)
    } catch {
      toast.error('Failed to load doctors')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    setSubmitting(true)
    try {
      await api.post('/appointments', {
        businessId: selectedBusiness.id,
        serviceId: selectedService.id,
        staffId: selectedDoctor.id,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        intakeForm
      })
      toast.success('Appointment booked!')
      setStep(7)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed')
    } finally {
      setSubmitting(false)
    }
  }

  const steps = ['Clinic', 'Service', 'Doctor', 'Schedule', 'Intake', 'Confirm']
  
  // Adjusted current step for progress bar mapping (max is Confirm which is index 5, so step 6 maps to 5)
  const currentProgressStep = step > 6 ? 6 : step

  return (
    <div className="max-w-3xl mx-auto pb-10">
      <PageHeader title="Book Consultation" subtitle="Schedule an appointment with a specialist" />
      
      {step < 7 && (
        <div className="flex items-center mb-8 overflow-x-auto pb-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center flex-shrink-0">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-colors ${i + 1 < currentProgressStep ? 'bg-primary-600 text-white' : i + 1 === currentProgressStep ? 'bg-primary-700 text-white ring-4 ring-primary-100' : 'bg-slate-200 text-slate-500'}`}>
                {i + 1 < currentProgressStep ? '✓' : i + 1}
              </div>
              <span className={`ml-2 text-xs font-semibold uppercase tracking-wider ${i + 1 === currentProgressStep ? 'text-primary-800' : 'text-slate-400'}`}>{s}</span>
              {i < steps.length - 1 && <div className={`w-8 sm:w-12 h-1 mx-2 rounded-full ${i + 1 < currentProgressStep ? 'bg-primary-600' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
            <h3 className="text-lg font-bold text-primary-900 mb-2">Select a Hospital</h3>
            {businesses.filter(b => b.isActive).map(b => (
              <button key={b.id || b.id} onClick={() => selectBusiness(b)}
                className="card w-full flex items-center justify-between hover:border-primary-400 cursor-pointer text-left group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                    <Building2 size={20} className="text-primary-700" />
                  </div>
                  <div>
                    <p className="font-bold text-primary-900 text-base">{b.businessName}</p>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">{b.category} · {b.address}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-primary-600" />
              </button>
            ))}
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
            <button onClick={() => setStep(1)} className="text-primary-600 text-sm mb-4 font-semibold hover:underline">← Back</button>
            <h3 className="text-lg font-bold text-primary-900 mb-4">Select Service Type</h3>
            <div className="space-y-3">
              {services.map(s => (
                <button key={s.id || s.id} onClick={() => { if(s.isActive) selectService(s) }}
                  className={`card w-full flex items-center justify-between text-left group ${s.isActive ? 'hover:border-primary-400 cursor-pointer' : 'opacity-60 cursor-not-allowed bg-slate-50'}`}>
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                        <Stethoscope size={20} className="text-primary-700" />
                     </div>
                     <div>
                        <p className="font-bold text-primary-900">{s.serviceName}</p>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">{s.estimatedDuration} min consultation · {s.price === 0 ? 'Covered' : `$${s.price}`}</p>
                     </div>
                  </div>
                  {s.isActive ? (
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-primary-600" />
                  ) : (
                    <span className="text-[10px] font-bold text-red-600 uppercase bg-red-50 px-2 py-1 rounded">Unavailable</span>
                  )}
                </button>
              ))}
              {services.length === 0 && <p className="text-slate-500 text-sm font-medium py-6 text-center">No services available.</p>}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="s3" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
             <button onClick={() => setStep(2)} className="text-primary-600 text-sm mb-4 font-semibold hover:underline">← Back</button>
             <h3 className="text-lg font-bold text-primary-900 mb-4">Select Specialist</h3>
             {loading ? <p className="text-slate-500 font-medium">Loading specialists...</p> : (
               <div className="grid sm:grid-cols-2 gap-4">
                  {doctors.map(doc => (
                    <button key={doc.id} onClick={() => { setSelectedDoctor(doc); setStep(4); }} className="card hover:border-primary-400 text-left group relative overflow-hidden">
                       <div className="flex items-start gap-4">
                         <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                           <User size={20} className="text-primary-700" />
                         </div>
                         <div className="flex-1">
                           <p className="font-bold text-primary-900">{doc.name}</p>
                           <p className="text-xs text-slate-500 mt-0.5">Appointment Specialist</p>
                         </div>
                       </div>
                    </button>
                  ))}
                  {doctors.length === 0 && <p className="text-slate-500 text-sm font-medium col-span-2">No doctors available for appointments.</p>}
               </div>
             )}
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="s4" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
            <button onClick={() => setStep(3)} className="text-primary-600 text-sm mb-4 font-semibold hover:underline">← Back</button>
            <h3 className="text-lg font-bold text-primary-900 mb-4">Schedule Date & Time</h3>
            <div className="card mb-6 bg-slate-50 border-none shadow-inner">
              <label className="block text-sm font-bold text-slate-700 mb-2">Select Date</label>
              <input type="date" value={selectedDate} min={new Date().toISOString().split('T')[0]}
                onChange={e => setSelectedDate(e.target.value)} className="input-field bg-white shadow-sm font-medium" />
            </div>
            
            {selectedDate && (
              <div className="card">
                <p className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Clock size={16} className="text-primary-600" /> Available Time Slots
                </p>
                {loading ? <p className="text-sm text-slate-500 font-medium">Checking availability...</p> : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {timeSlots.length > 0 ? timeSlots.map(t => (
                      <button key={t} onClick={() => setSelectedTime(t)}
                        className={`py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm border ${selectedTime === t ? 'bg-primary-700 text-white border-primary-700 shadow-md' : 'bg-white text-slate-700 border-slate-200 hover:border-primary-300 hover:text-primary-700'}`}>
                        {t}
                      </button>
                    )) : <p className="col-span-full text-sm font-medium text-slate-500">No slots available on this date.</p>}
                  </div>
                )}
                {selectedTime && <button onClick={() => setStep(5)} className="btn-primary w-full mt-6 py-3">Continue to Intake</button>}
              </div>
            )}
          </motion.div>
        )}

        {step === 5 && (
          <motion.div key="s5" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
            <button onClick={() => setStep(4)} className="text-primary-600 text-sm mb-4 font-semibold hover:underline">← Back</button>
            <h3 className="text-lg font-bold text-primary-900 mb-4">Patient Intake Form</h3>
            <div className="card space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Reason for Visit</label>
                <input type="text" placeholder="e.g. Annual Checkup, Back Pain" value={intakeForm.reason} onChange={e => setIntakeForm({...intakeForm, reason: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Symptoms (Optional)</label>
                <textarea rows="3" placeholder="Briefly describe any symptoms..." value={intakeForm.symptoms} onChange={e => setIntakeForm({...intakeForm, symptoms: e.target.value})} className="input-field resize-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Prior History / Notes (Optional)</label>
                <textarea rows="2" placeholder="Any relevant medical history?" value={intakeForm.history} onChange={e => setIntakeForm({...intakeForm, history: e.target.value})} className="input-field resize-none" />
              </div>
              <button onClick={() => setStep(6)} disabled={!intakeForm.reason} className="btn-primary w-full py-3 disabled:opacity-50 mt-2">Review Booking</button>
            </div>
          </motion.div>
        )}

        {step === 6 && (
          <motion.div key="s6" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
            <button onClick={() => setStep(5)} className="text-primary-600 text-sm mb-4 font-semibold hover:underline">← Back</button>
            <div className="card">
              <h3 className="text-xl font-black text-primary-900 mb-6 border-b border-slate-100 pb-4">Consultation Summary</h3>
              <div className="space-y-4 mb-8">
                {[
                  { label: 'Clinic', value: selectedBusiness?.businessName, icon: Building2 },
                  { label: 'Service', value: selectedService?.serviceName, icon: Stethoscope },
                  { label: 'Specialist', value: selectedDoctor?.name, icon: User },
                  { label: 'Schedule', value: `${selectedDate} at ${selectedTime}`, icon: Clock },
                  { label: 'Visit Reason', value: intakeForm.reason, icon: FileText },
                ].map(row => (
                  <div key={row.label} className="flex items-start gap-4">
                    <div className="mt-0.5 text-primary-500"><row.icon size={18} /></div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{row.label}</p>
                      <p className="font-semibold text-slate-800 text-base">{row.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={handleConfirm} disabled={submitting} className="btn-primary w-full py-3.5 text-base shadow-xl">
                {submitting ? 'Confirming...' : 'Confirm Appointment'}
              </button>
            </div>
          </motion.div>
        )}

        {step === 7 && (
          <motion.div key="s7" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="card text-center border-t-8 border-t-secondary-500 py-10 shadow-premium">
              <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-secondary-200">
                <CalendarCheck size={36} className="text-secondary-600" />
              </div>
              <h2 className="text-3xl font-black text-primary-900 mb-2 tracking-tight">Appointment Confirmed!</h2>
              <p className="text-slate-500 font-medium mb-8">
                You are scheduled with <span className="font-bold text-slate-700">{selectedDoctor?.name}</span><br/>
                on <span className="font-bold text-slate-700">{selectedDate}</span> at <span className="font-bold text-slate-700">{selectedTime}</span>
              </p>
              <button onClick={() => {
                setStep(1); setSelectedBusiness(null); setSelectedService(null); setSelectedDoctor(null); setSelectedDate(''); setSelectedTime(''); setIntakeForm({reason:'', symptoms:'', history:''});
              }} className="btn-secondary w-full max-w-sm mx-auto">Book Another Consultation</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
