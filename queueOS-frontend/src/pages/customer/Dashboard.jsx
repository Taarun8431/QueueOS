import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Clock, CalendarCheck, Activity, Bell, ArrowRight } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import { DUMMY_APPOINTMENTS, DUMMY_QUEUE } from '../../data/dummy'

export default function CustomerDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const upcoming = DUMMY_APPOINTMENTS.filter(a => a.status === 'confirmed').slice(0, 2)
  const currentPosition = 4

  const quickLinks = [
    { label: 'Join Queue', desc: 'Walk-in at a business', icon: Clock, path: '/customer/join-queue', color: 'bg-blue-50 text-blue-600' },
    { label: 'Book Appointment', desc: 'Schedule ahead of time', icon: CalendarCheck, path: '/customer/book-appointment', color: 'bg-green-50 text-green-600' },
    { label: 'Queue Status', desc: 'Check your position', icon: Activity, path: '/customer/queue-status', color: 'bg-purple-50 text-purple-600' },
    { label: 'Notifications', desc: 'View alerts & updates', icon: Bell, path: '/customer/notifications', color: 'bg-orange-50 text-orange-600' },
  ]

  return (
    <div>
      <PageHeader
        title={`Hello, ${user?.name?.split(' ')[0]} 👋`}
        subtitle="Here's your queue and appointment summary"
      />

      {/* Live queue badge */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 mb-6 text-white">
        <p className="text-blue-100 text-sm mb-1">Your current queue position</p>
        <div className="flex items-end gap-3">
          <p className="text-5xl font-black"># {currentPosition}</p>
          <div className="mb-1">
            <p className="font-semibold">CityMed Hospital</p>
            <p className="text-blue-200 text-sm">Est. wait: ~28 minutes</p>
          </div>
        </div>
        <button onClick={() => navigate('/customer/queue-status')}
          className="mt-3 bg-white/20 hover:bg-white/30 text-white text-sm px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1">
          View Status <ArrowRight size={13} />
        </button>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {quickLinks.map(q => (
          <button key={q.label} onClick={() => navigate(q.path)}
            className="card flex flex-col items-start gap-3 hover:shadow-md transition-shadow cursor-pointer text-left p-4">
            <div className={`p-2.5 rounded-xl ${q.color}`}><q.icon size={18} /></div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{q.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{q.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Upcoming Appointments */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Upcoming Appointments</h3>
          <button onClick={() => navigate('/customer/appointments')}
            className="text-primary-600 text-sm font-medium hover:underline flex items-center gap-1">
            View all <ArrowRight size={13} />
          </button>
        </div>
        {upcoming.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">No upcoming appointments</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map(a => (
              <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{a.business}</p>
                  <p className="text-xs text-gray-400">{a.service} · {a.date} at {a.time}</p>
                </div>
                <span className="badge-active">{a.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
