import { useState, useEffect } from 'react'
import { CalendarCheck, Clock, X, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'react-toastify'
import PageHeader from '../../components/PageHeader'
import api from '../../api'

const STATUS_CONFIG = {
  scheduled:   { badge: 'badge-active', icon: CalendarCheck },
  checked_in:  { badge: 'bg-indigo-100 text-indigo-700 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', icon: CheckCircle },
  completed:   { badge: 'badge-inactive', icon: CheckCircle },
  cancelled:   { badge: 'bg-red-100 text-red-700 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', icon: X },
  rescheduled: { badge: 'bg-blue-100 text-blue-700 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', icon: AlertCircle },
}

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/appointments/my')
      .then(res => setAppointments(res.data.data))
      .catch(() => toast.error('Failed to load appointments'))
      .finally(() => setLoading(false))
  }, [])

  const cancelAppointment = async (id) => {
    try {
      await api.put(`/appointments/${id}/cancel`)
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: 'cancelled' } : a))
      toast.success('Appointment cancelled')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed')
    }
  }

  const checkInAppointment = async (id) => {
    try {
      await api.post(`/appointments/${id}/check-in`)
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: 'checked_in' } : a))
      toast.success('Checked in successfully! You are now in the live queue.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed')
    }
  }

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter)

  if (loading) return <p className="text-gray-400">Loading...</p>

  return (
    <div className="max-w-2xl">
      <PageHeader title="My Appointments" subtitle={`${appointments.length} total appointments`} />
      <div className="flex gap-2 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
        {['all', 'scheduled', 'completed', 'cancelled'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${filter === f ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
            {f}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {filtered.map(a => {
          const cfg = STATUS_CONFIG[a.status] || STATUS_CONFIG.scheduled
          return (
            <div key={a._id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{a.businessId?.businessName}</p>
                  <p className="text-sm text-gray-500">{a.serviceId?.serviceName}</p>
                </div>
                <span className={cfg.badge}>{a.status}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                <span className="flex items-center gap-1"><CalendarCheck size={13} /> {new Date(a.appointmentDate).toLocaleDateString()}</span>
                <span className="flex items-center gap-1"><Clock size={13} /> {a.appointmentTime}</span>
              </div>
              {a.status === 'scheduled' && (
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <button onClick={() => checkInAppointment(a._id)}
                    className="btn-primary text-xs py-1.5 flex items-center gap-1">
                    <CheckCircle size={12} /> Check In (Arrived)
                  </button>
                  <button onClick={() => cancelAppointment(a._id)}
                    className="btn-danger text-xs py-1.5 flex items-center gap-1">
                    <X size={12} /> Cancel
                  </button>
                </div>
              )}
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="card text-center py-12">
            <CalendarCheck size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No appointments found</p>
          </div>
        )}
      </div>
    </div>
  )
}
