import { useState } from 'react'
import { CheckCircle, Clock, User } from 'lucide-react'
import { toast } from 'react-toastify'
import { DUMMY_QUEUE } from '../../data/dummy'
import PageHeader from '../../components/PageHeader'

export default function MarkServed() {
  const [queue, setQueue] = useState(DUMMY_QUEUE.filter(q => q.status === 'serving'))
  const [servedList, setServedList] = useState([])

  const handleServed = (q) => {
    setQueue(prev => prev.filter(item => item.id !== q.id))
    setServedList(prev => [{ ...q, servedAt: new Date().toLocaleTimeString() }, ...prev])
    toast.success(`${q.name} marked as served`)
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="Mark Served" subtitle="Confirm service completion for customers" />

      {queue.length > 0 ? (
        <div className="space-y-3 mb-6">
          {queue.map(q => (
            <div key={q.id} className="card border-2 border-primary-200 bg-primary-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-black text-lg">
                    {q.position}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{q.name}</p>
                    <p className="text-sm text-gray-500">{q.service}</p>
                    <p className="text-xs text-gray-400 font-mono">{q.id}</p>
                  </div>
                </div>
                <button onClick={() => handleServed(q)}
                  className="btn-primary flex items-center gap-2 text-sm">
                  <CheckCircle size={14} /> Mark Served
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-10 mb-6">
          <CheckCircle size={40} className="text-green-400 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No active serving tickets</p>
          <p className="text-gray-400 text-sm">Call the next customer to begin</p>
        </div>
      )}

      {/* Served today */}
      {servedList.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">Served Today</h3>
          <div className="space-y-2">
            {servedList.map(q => (
              <div key={`${q.id}-served`} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500" />
                  <span className="font-medium text-gray-900">{q.name}</span>
                  <span className="text-gray-400">{q.service}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock size={10} /> {q.servedAt}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
