import { useState } from 'react'
import { PhoneCall, Volume2, ChevronRight } from 'lucide-react'
import { toast } from 'react-toastify'
import { DUMMY_QUEUE } from '../../data/dummy'
import PageHeader from '../../components/PageHeader'

export default function CallNext() {
  const waiting = DUMMY_QUEUE.filter(q => q.status === 'waiting')
  const [called, setCalled] = useState(null)
  const [calling, setCalling] = useState(false)

  const handleCall = () => {
    if (waiting.length === 0) { toast.info('No one in queue'); return }
    setCalling(true)
    setTimeout(() => {
      setCalled(waiting[0])
      setCalling(false)
      toast.success(`Calling ${waiting[0].name} – Token ${waiting[0].id}`)
    }, 1000)
  }

  return (
    <div className="max-w-md">
      <PageHeader title="Call Next" subtitle="Call the next person in queue" />

      {/* Next in queue preview */}
      {waiting[0] && (
        <div className="card mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Next in Queue</p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center font-bold text-primary-700 text-lg">
              {waiting[0].position}
            </div>
            <div>
              <p className="font-bold text-gray-900">{waiting[0].name}</p>
              <p className="text-sm text-gray-500">{waiting[0].service}</p>
              <p className="text-xs text-gray-400 font-mono">{waiting[0].id}</p>
            </div>
          </div>
        </div>
      )}

      {/* Call Button */}
      <button onClick={handleCall} disabled={calling}
        className={`w-full py-6 rounded-2xl flex flex-col items-center gap-3 transition-all duration-200 ${
          calling ? 'bg-gray-100 cursor-wait' :
          'bg-primary-600 hover:bg-primary-700 shadow-lg hover:shadow-xl active:scale-95'
        } text-white`}>
        {calling ? (
          <>
            <Volume2 size={32} className="animate-pulse" />
            <span className="font-semibold text-lg">Calling...</span>
          </>
        ) : (
          <>
            <PhoneCall size={32} />
            <span className="font-semibold text-lg">Call Next Customer</span>
            {waiting[0] && <span className="text-primary-200 text-sm">{waiting[0].name} · #{waiting[0].position}</span>}
          </>
        )}
      </button>

      {/* Recently Called */}
      {called && (
        <div className="card mt-6 border border-green-200 bg-green-50">
          <p className="text-xs font-semibold text-green-700 mb-2">Just Called</p>
          <div className="flex items-center gap-2">
            <PhoneCall size={14} className="text-green-600" />
            <span className="text-sm font-medium text-gray-900">{called.name}</span>
            <span className="text-xs text-gray-400">– {called.id} · {called.service}</span>
          </div>
        </div>
      )}

      {/* Remaining */}
      <div className="card mt-4">
        <p className="text-sm font-medium text-gray-700 mb-3">{waiting.length} people waiting</p>
        <div className="space-y-1.5">
          {waiting.slice(1, 5).map(q => (
            <div key={q.id} className="flex items-center justify-between text-sm text-gray-600 py-1">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                  {q.position}
                </span>
                <span>{q.name}</span>
              </div>
              <span className="text-xs text-gray-400">{q.service}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
