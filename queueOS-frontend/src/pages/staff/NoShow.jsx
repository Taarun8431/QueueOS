import { useState, useEffect } from 'react'
import { UserX, Clock } from 'lucide-react'
import { toast } from 'react-toastify'
import PageHeader from '../../components/PageHeader'
import api from '../../api'

export default function NoShow() {
  const [noShowList, setNoShowList] = useState([])
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
          setNoShowList(res.data.data.filter(q => q.status === 'no_show').reverse())
        }
      })
      .catch(() => toast.error('Failed to load no-show log'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-2xl">
      <PageHeader title="No Show Log" subtitle="Log of customers who didn't show up" />

      {loading ? <p className="text-gray-400">Loading...</p> : (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">No-Show Log</h3>
          <div className="space-y-2">
            {noShowList.length === 0 && <p className="text-sm text-gray-500 py-4">No no-shows recorded today.</p>}
            {noShowList.map((q, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <UserX size={14} className="text-red-400" />
                  <span className="text-sm font-medium text-gray-900">Token #{q.tokenNumber}</span>
                </div>
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock size={10} /> {new Date(q.updatedAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
