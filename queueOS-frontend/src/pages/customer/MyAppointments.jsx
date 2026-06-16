import { useState } from 'react'
import { CalendarCheck, Clock, X, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'react-toastify'
import { DUMMY_APPOINTMENTS } from '../../data/dummy'
import PageHeader from '../../components/PageHeader'

const STATUS_CONFIG = {
  confirmed: { badge: 'badge-active', icon: CalendarCheck, color: 'text-green-600' },
  completed: { badge: 'badge-inactive', icon: CheckCircle, color: 'text-gray-500' },
  cancelled: { badge: 'bg-red-100 text-red-700 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', icon: X, color: 'text-red-500' },
}

export default function MyAppointments() {
  const [appointments, setAppointments] = useState(DUMMY_APPOINTMENTS)
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter)

  const cancelAppointment = (id) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a))
    toast.success('Appointment cancelled')
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="My Appointments" subtitle={`${appointments.length} total appointments`} />

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
        {['all', 'confirmed', 'completed', 'cancelled'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === f ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(a => {
          const cfg = STATUS_CONFIG[a.status]
          return (
            <div key={a.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{a.business}</p>
                  <p className="text-sm text-gray-500">{a.service}</p>
                </div>
                <span className={cfg.badge}>{a.status}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                <span className="flex items-center gap-1"><CalendarCheck size={13} /> {a.date}</span>
                <span className="flex items-center gap-1"><Clock size={13} /> {a.time}</span>
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono">{a.token}</span>
              </div>
              {a.status === 'confirmed' && (
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <button onClick={() => cancelAppointment(a.id)}
                    className="btn-danger text-xs py-1.5 flex items-center gap-1">
                    <X size={12} /> Cancel
                  </button>
                  <button className="btn-secondary text-xs py-1.5 flex items-center gap-1">
                    <AlertCircle size={12} /> Reschedule
                  </button>
                </div>
              )}
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="card text-center py-12">
            <CalendarCheck size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No {filter === 'all' ? '' : filter} appointments</p>
          </div>
        )}
      </div>
    </div>
  )
}
