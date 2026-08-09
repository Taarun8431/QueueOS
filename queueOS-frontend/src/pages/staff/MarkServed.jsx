import { useState, useEffect } from 'react'
import { CheckCircle, Clock } from 'lucide-react'
import { toast } from 'react-toastify'
import PageHeader from '../../components/PageHeader'
import api from '../../api'

export default function MarkServed() {
  const [servedList, setServedList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/staff/my-assignment')
      .then(res => {
        const a = res.data.data
        if (!a) return []
        const bizId = a.businessId.id || a.businessId
        return api.get(`/queue/current/${bizId}/all`)
      })
      .then(res => {
        if (res && res.data) {
          setServedList(res.data.data.filter(q => q.status === 'served').reverse())
        }
      })
      .catch(() => toast.error('Failed to load served log'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-2xl">
      <PageHeader title="Served Log" subtitle="Log of all customers served today" />

      {loading ? <p className="text-gray-400">Loading...</p> : (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">Served Today</h3>
          <div className="space-y-2">
            {servedList.length === 0 && <p className="text-sm text-gray-500 py-4">No tokens served yet.</p>}
            {servedList.map((q, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500" />
                  <span className="font-medium text-gray-900">Token #{q.tokenNumber}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock size={10} /> {new Date(q.updatedAt).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
