import { useState } from 'react'
import { UserX, RotateCcw, Clock } from 'lucide-react'
import { toast } from 'react-toastify'
import { DUMMY_QUEUE } from '../../data/dummy'
import PageHeader from '../../components/PageHeader'

export default function NoShow() {
  const [queue, setQueue] = useState(DUMMY_QUEUE.filter(q => q.status === 'serving'))
  const [noShowList, setNoShowList] = useState([])

  const handleNoShow = (q) => {
    setQueue(prev => prev.filter(item => item.id !== q.id))
    setNoShowList(prev => [{ ...q, markedAt: new Date().toLocaleTimeString() }, ...prev])
    toast.warning(`${q.name} marked as no-show`)
  }

  const handleRequeue = (q) => {
    setNoShowList(prev => prev.filter(item => item.id !== q.id))
    setQueue(prev => [...prev, { ...q, status: 'serving' }])
    toast.info(`${q.name} re-added to queue`)
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="No Show" subtitle="Mark customers who didn't show up" />

      {queue.length > 0 ? (
        <div className="space-y-3 mb-6">
          {queue.map(q => (
            <div key={q.id} className="card border-2 border-orange-200 bg-orange-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-black text-lg">
                    {q.position}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{q.name}</p>
                    <p className="text-sm text-gray-500">{q.service}</p>
                    <p className="text-xs text-gray-400 font-mono">{q.id}</p>
                  </div>
                </div>
                <button onClick={() => handleNoShow(q)}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors">
                  <UserX size={14} /> No Show
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-10 mb-6">
          <UserX size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No active tickets to mark</p>
        </div>
      )}

      {noShowList.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">No-Show Log</h3>
          <div className="space-y-2">
            {noShowList.map(q => (
              <div key={`${q.id}-ns`} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <UserX size={14} className="text-red-400" />
                  <span className="text-sm font-medium text-gray-900">{q.name}</span>
                  <span className="text-xs text-gray-400">{q.service}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock size={10} /> {q.markedAt}
                  </span>
                  <button onClick={() => handleRequeue(q)}
                    className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                    <RotateCcw size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
