import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Users, CheckCircle, Clock, PhoneCall, ArrowRight } from 'lucide-react'
import StatCard from '../../components/StatCard'
import PageHeader from '../../components/PageHeader'
import { DUMMY_QUEUE } from '../../data/dummy'

export default function StaffDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const now = DUMMY_QUEUE.find(q => q.status === 'serving')
  const waiting = DUMMY_QUEUE.filter(q => q.status === 'waiting')

  const stats = [
    { title: 'In Queue', value: DUMMY_QUEUE.length, icon: Users, color: 'blue' },
    { title: 'Served Today', value: 47, icon: CheckCircle, color: 'green', change: 5 },
    { title: 'Avg Service Time', value: '16 min', icon: Clock, color: 'orange' },
    { title: 'No Shows', value: 3, icon: PhoneCall, color: 'red' },
  ]

  return (
    <div>
      <PageHeader
        title={`Staff Dashboard`}
        subtitle={`Welcome, ${user?.name} · CityMed Hospital`}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(s => <StatCard key={s.title} {...s} />)}
      </div>

      {/* Now Serving */}
      {now && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6">
          <p className="text-green-700 text-xs font-semibold uppercase tracking-wider mb-2">Now Serving</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-black text-lg">
                {now.position}
              </div>
              <div>
                <p className="font-bold text-gray-900">{now.name}</p>
                <p className="text-sm text-gray-500">{now.service}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => navigate('/staff/mark-served')} className="btn-primary text-sm py-1.5">Served</button>
              <button onClick={() => navigate('/staff/no-show')} className="btn-secondary text-sm py-1.5">No Show</button>
            </div>
          </div>
        </div>
      )}

      {/* Queue Preview */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Waiting Queue</h3>
          <button onClick={() => navigate('/staff/queue-board')}
            className="text-primary-600 text-sm font-medium flex items-center gap-1">
            Full board <ArrowRight size={13} />
          </button>
        </div>
        <div className="space-y-2">
          {waiting.slice(0, 4).map(q => (
            <div key={q.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">
                  {q.position}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{q.name}</p>
                  <p className="text-xs text-gray-400">{q.service}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Clock size={11} /> {q.waitTime}
              </div>
            </div>
          ))}
        </div>
        {waiting.length > 4 && (
          <p className="text-center text-xs text-gray-400 mt-3">+{waiting.length - 4} more in queue</p>
        )}
      </div>
    </div>
  )
}
