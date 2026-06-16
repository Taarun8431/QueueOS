import { useState } from 'react'
import { Users, Clock, CheckCircle, PhoneCall, RefreshCw } from 'lucide-react'
import { toast } from 'react-toastify'
import { DUMMY_QUEUE } from '../../data/dummy'
import PageHeader from '../../components/PageHeader'

export default function QueueBoard() {
  const [queue, setQueue] = useState(DUMMY_QUEUE)
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? queue : queue.filter(q => q.status === filter)

  const markServed = (id) => {
    setQueue(prev => prev.filter(q => q.id !== id))
    toast.success('Customer marked as served')
  }
  const markNoShow = (id) => {
    setQueue(prev => prev.filter(q => q.id !== id))
    toast.warning('Marked as no-show')
  }

  return (
    <div>
      <PageHeader
        title="Queue Board"
        subtitle={`${queue.length} people in queue`}
        action={
          <button onClick={() => toast.info('Queue refreshed')}
            className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw size={14} /> Refresh
          </button>
        }
      />

      {/* Filter */}
      <div className="flex gap-2 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
        {['all', 'serving', 'waiting'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === f ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {f} {f !== 'all' && `(${queue.filter(q => q.status === f).length})`}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(q => (
          <div key={q.id} className={`card ${q.status === 'serving' ? 'border-2 border-green-300 bg-green-50' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  q.status === 'serving' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'
                }`}>
                  {q.position}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{q.name}</p>
                  <p className="text-sm text-gray-500">{q.service}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400 font-mono">{q.id}</span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock size={10} /> {q.waitTime}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {q.status === 'serving' && (
                  <>
                    <button onClick={() => markServed(q.id)}
                      className="btn-primary text-xs py-1.5 flex items-center gap-1">
                      <CheckCircle size={12} /> Served
                    </button>
                    <button onClick={() => markNoShow(q.id)}
                      className="btn-secondary text-xs py-1.5 flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50">
                      No Show
                    </button>
                  </>
                )}
                {q.status === 'waiting' && (
                  <button onClick={() => markServed(q.id)}
                    className="btn-secondary text-xs py-1.5 flex items-center gap-1">
                    <PhoneCall size={12} /> Call
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="card text-center py-12">
            <Users size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Queue is empty</p>
          </div>
        )}
      </div>
    </div>
  )
}
