import { Activity, Clock, Users, CheckCircle, AlertCircle } from 'lucide-react'
import { DUMMY_QUEUE } from '../../data/dummy'
import PageHeader from '../../components/PageHeader'

const STATUS_STYLES = {
  serving: 'bg-green-100 text-green-700 border border-green-200',
  waiting: 'bg-gray-50 text-gray-700',
}

export default function QueueStatus() {
  const myPosition = 4
  const myToken = DUMMY_QUEUE.find(q => q.position === myPosition)

  return (
    <div className="max-w-2xl">
      <PageHeader title="Queue Status" subtitle="CityMed Hospital – General Consultation" />

      {/* My Status Card */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-5 mb-6 text-white">
        <p className="text-primary-100 text-sm mb-1">Your token</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-4xl font-black">T-{String(myPosition).padStart(3, '0')}</p>
            <p className="text-primary-200 text-sm mt-1">Position #{myPosition} in queue</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">~28 min</p>
            <p className="text-primary-200 text-sm">estimated wait</p>
          </div>
        </div>
        <div className="mt-4 bg-white/10 rounded-xl p-3 flex items-center gap-2">
          <AlertCircle size={14} className="text-yellow-300" />
          <p className="text-xs text-primary-100">We'll notify you when you're next. Stay nearby!</p>
        </div>
      </div>

      {/* Queue List */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Users size={16} className="text-primary-500" /> Live Queue
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Live
          </div>
        </div>

        <div className="space-y-2">
          {DUMMY_QUEUE.map(q => (
            <div key={q.id}
              className={`flex items-center justify-between p-3 rounded-xl ${STATUS_STYLES[q.status]} ${
                q.position === myPosition ? 'ring-2 ring-primary-400' : ''
              }`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  q.status === 'serving' ? 'bg-green-500 text-white' :
                  q.position === myPosition ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {q.position}
                </div>
                <div>
                  <p className="text-sm font-medium">{q.position === myPosition ? 'You' : q.name}</p>
                  <p className="text-xs text-gray-400">{q.service}</p>
                </div>
              </div>
              <div className="text-right">
                {q.status === 'serving' ? (
                  <div className="flex items-center gap-1 text-green-700 text-xs font-medium">
                    <CheckCircle size={12} /> Serving
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-gray-400 text-xs">
                    <Clock size={11} /> {q.waitTime}
                  </div>
                )}
                {q.position === myPosition && (
                  <span className="text-xs text-primary-600 font-medium">← You</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
