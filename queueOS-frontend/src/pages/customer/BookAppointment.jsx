import { useState, useEffect } from 'react'
import { Building2, CalendarCheck, ChevronRight } from 'lucide-react'
import { toast } from 'react-toastify'
import PageHeader from '../../components/PageHeader'
import api from '../../api'

const TIME_SLOTS = ['09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00','16:30']

export default function BookAppointment() {
  const [step, setStep] = useState(1)
  const [businesses, setBusinesses] = useState([])
  const [services, setServices] = useState([])
  const [selectedBusiness, setSelectedBusiness] = useState(null)
  const [selectedService, setSelectedService] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.get('/business').then(res => setBusinesses(res.data.data)).catch(() => toast.error('Failed to load businesses'))
  }, [])

  const selectBusiness = async (b) => {
    setSelectedBusiness(b)
    try {
      const res = await api.get(`/services/business/${b._id}`)
      setServices(res.data.data)
    } catch { toast.error('Failed to load services') }
    setStep(2)
  }

  const handleConfirm = async () => {
    setSubmitting(true)
    try {
      await api.post('/appointments', {
        businessId: selectedBusiness._id,
        serviceId: selectedService._id,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
      })
      toast.success('Appointment booked!')
      setStep(5)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed')
    } finally {
      setSubmitting(false)
    }
  }

  const steps = ['Business', 'Service', 'Date & Time', 'Confirm']

  return (
    <div className="max-w-2xl">
      <PageHeader title="Book Appointment" subtitle="Schedule a visit at your convenience" />
      {step < 5 && (
        <div className="flex items-center mb-6">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold flex-shrink-0 ${i + 1 < step ? 'bg-primary-600 text-white' : i + 1 === step ? 'bg-primary-600 text-white ring-4 ring-primary-100' : 'bg-gray-200 text-gray-500'}`}>
                {i + 1 < step ? '✓' : i + 1}
              </div>
              <span className={`ml-2 text-xs font-medium hidden sm:block ${i + 1 === step ? 'text-primary-600' : 'text-gray-400'}`}>{s}</span>
              {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i + 1 < step ? 'bg-primary-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3">
          {businesses.filter(b => b.isActive).map(b => (
            <button key={b._id} onClick={() => selectBusiness(b)}
              className="card w-full flex items-center justify-between hover:shadow-md cursor-pointer text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                  <Building2 size={18} className="text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{b.businessName}</p>
                  <p className="text-xs text-gray-400">{b.category} · {b.address}</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div>
          <button onClick={() => setStep(1)} className="text-primary-600 text-sm mb-4">← Back</button>
          <div className="space-y-2">
            {services.map(s => (
              <button key={s._id} onClick={() => { if(s.isActive) { setSelectedService(s); setStep(3) } }}
                className={`card w-full flex items-center justify-between text-left transition-shadow ${s.isActive ? 'hover:shadow-md cursor-pointer' : 'opacity-75 cursor-not-allowed'}`}>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{s.serviceName}</p>
                  <p className="text-xs text-gray-400">{s.estimatedDuration} min · {s.price === 0 ? 'Free' : `$${s.price}`}</p>
                </div>
                {s.isActive ? (
                  <ChevronRight size={16} className="text-gray-400" />
                ) : (
                  <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">Unavailable</span>
                )}
              </button>
            ))}
            {services.length === 0 && <p className="text-gray-400 text-sm">No services available.</p>}
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <button onClick={() => setStep(2)} className="text-primary-600 text-sm mb-4">← Back</button>
          <div className="card mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
            <input type="date" value={selectedDate} min={new Date().toISOString().split('T')[0]}
              onChange={e => setSelectedDate(e.target.value)} className="input-field" />
          </div>
          {selectedDate && (
            <div className="card">
              <p className="text-sm font-medium text-gray-700 mb-3">Available Time Slots</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {TIME_SLOTS.map(t => (
                  <button key={t} onClick={() => setSelectedTime(t)}
                    className={`py-2 rounded-xl text-sm font-medium transition-colors ${selectedTime === t ? 'bg-primary-600 text-white' : 'bg-gray-50 text-gray-700 hover:bg-primary-50'}`}>
                    {t}
                  </button>
                ))}
              </div>
              {selectedTime && <button onClick={() => setStep(4)} className="btn-primary w-full mt-4">Continue</button>}
            </div>
          )}
        </div>
      )}

      {step === 4 && (
        <div>
          <button onClick={() => setStep(3)} className="text-primary-600 text-sm mb-4">← Back</button>
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Appointment Summary</h3>
            <div className="space-y-3 mb-6">
              {[
                { label: 'Business', value: selectedBusiness?.businessName },
                { label: 'Service', value: selectedService?.serviceName },
                { label: 'Date', value: selectedDate },
                { label: 'Time', value: selectedTime },
                { label: 'Duration', value: `${selectedService?.estimatedDuration} min` },
                { label: 'Cost', value: selectedService?.price === 0 ? 'Free' : `$${selectedService?.price}` },
              ].map(row => (
                <div key={row.label} className="flex justify-between text-sm border-b border-gray-50 pb-2 last:border-0">
                  <span className="text-gray-500">{row.label}</span>
                  <span className="font-medium text-gray-900">{row.value}</span>
                </div>
              ))}
            </div>
            <button onClick={handleConfirm} disabled={submitting} className="btn-primary w-full py-2.5">
              {submitting ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="card text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarCheck size={28} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Appointment Confirmed!</h2>
          <p className="text-gray-500 text-sm mb-4">{selectedBusiness?.businessName} · {selectedDate} at {selectedTime}</p>
          <button onClick={() => setStep(1)} className="btn-secondary w-full">Book Another</button>
        </div>
      )}
    </div>
  )
}
