import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Clock, CalendarCheck, Activity, Bell } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import api from '../../api'

export default function CustomerDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [myQueues, setMyQueues] = useState([])

  useEffect(() => {
    api.get('/appointments/my').then(res => setAppointments(res.data.data?.filter(a => a.status === 'scheduled').slice(0, 2))).catch(() => {})
    api.get('/queue/my').then(res => setMyQueues(res.data.data?.filter(q => ['waiting', 'called'].includes(q.status)).slice(0, 2))).catch(() => {})
  }, [])

  const quickLinks = [
    { label: 'Search Hospitals', desc: 'Find hospitals and book or join queue', icon: Clock, path: '/customer/hospitals', bg: 'bg-blue-50', text: 'text-blue-600' },
    { label: 'Queue Status', desc: 'Track your position live', icon: Activity, path: '/customer/queue-status', bg: 'bg-purple-50', text: 'text-purple-600' },
    { label: 'My Appointments', desc: 'View your bookings', icon: CalendarCheck, path: '/customer/appointments', bg: 'bg-green-50', text: 'text-green-600' },
    { label: 'Notifications', desc: 'Stay updated in real time', icon: Bell, path: '/customer/notifications', bg: 'bg-orange-50', text: 'text-orange-600' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title={`Hello, ${user?.name?.split(' ')[0]} 👋`} subtitle="Here is your queue overview." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map(link => (
          <button key={link.label} onClick={() => navigate(link.path)}
            className="card flex flex-col gap-3 rounded-[1.75rem] p-5 text-left transition hover:-translate-y-1 hover:shadow-lg">
            <div className={`inline-flex h-12 w-12 items-center justify-center rounded-3xl ${link.bg} ${link.text}`}>
              <link.icon size={20} />
            </div>
            <div>
              <p className="font-semibold text-slate-900">{link.label}</p>
              <p className="mt-1 text-sm text-slate-500">{link.desc}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Active Queues</h3>
            <button onClick={() => navigate('/customer/queue-status')} className="text-sm font-semibold text-primary-600">View all</button>
          </div>
          {myQueues.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400">No active queues.</div>
          ) : (
            <div className="space-y-3">
              {myQueues.map(q => (
                <div key={q._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => { localStorage.setItem('activeTokenId', q._id); navigate('/customer/queue-status'); }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{q.businessId?.businessName}</p>
                      <p className="mt-1 text-sm text-slate-500">{q.serviceId?.serviceName}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${q.status === 'called' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {q.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-bold text-slate-900">Token #{q.tokenNumber}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Upcoming appointments</h3>
            <button onClick={() => navigate('/customer/appointments')} className="text-sm font-semibold text-primary-600">View all</button>
          </div>
          {appointments.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400">No upcoming appointments.</div>
          ) : (
            <div className="space-y-3">
              {appointments.map(a => (
                <div key={a._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">{a.businessId?.businessName}</p>
                  <p className="mt-1 text-sm text-slate-500">{a.serviceId?.serviceName}</p>
                  <p className="mt-2 text-xs text-slate-400">{new Date(a.appointmentDate).toLocaleDateString()} at {a.appointmentTime}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
