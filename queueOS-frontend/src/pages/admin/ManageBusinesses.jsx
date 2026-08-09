import { useState, useEffect } from 'react'
import { Building2, Search, Ban, CheckCircle, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import PageHeader from '../../components/PageHeader'
import api from '../../api'

export default function ManageBusinesses() {
  const [businesses, setBusinesses] = useState([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/business/my')
      .then(res => setBusinesses(res.data.data))
      .catch(() => toast.error('Failed to load businesses'))
      .finally(() => setLoading(false))
  }, [])

  const toggleStatus = async (b) => {
    try {
      await api.put(`/business/${b.id}`, { isActive: !b.isActive })
      setBusinesses(prev => prev.map(item => item.id === b.id ? { ...item, isActive: !item.isActive } : item))
      toast.success('Business status updated')
    } catch { toast.error('Update failed') }
  }

  const deleteBusiness = async (id) => {
    try {
      await api.delete(`/business/${id}`)
      setBusinesses(prev => prev.filter(b => b.id !== id))
      toast.success('Business removed')
    } catch { toast.error('Delete failed') }
  }

  const filtered = businesses
    .filter(b => filterStatus === 'all' || (filterStatus === 'active' ? b.isActive : !b.isActive))
    .filter(b => b.businessName.toLowerCase().includes(search.toLowerCase()) || b.category.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <p className="text-gray-400">Loading...</p>

  return (
    <div>
      <PageHeader title="Manage Businesses" subtitle={`${businesses.length} businesses on platform`} />
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input placeholder="Search businesses..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9" />
        </div>
        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
          {['all', 'active', 'inactive'].map(f => (
            <button key={f} onClick={() => setFilterStatus(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${filterStatus === f ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Business', 'Category', 'Email', 'Phone', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(b => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 size={14} className="text-primary-600" />
                      </div>
                      <span className="font-medium text-gray-900">{b.businessName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{b.category}</td>
                  <td className="px-4 py-3 text-gray-500">{b.businessEmail}</td>
                  <td className="px-4 py-3 text-gray-500">{b.phone}</td>
                  <td className="px-4 py-3">
                    <span className={b.isActive ? 'badge-active' : 'badge-inactive'}>{b.isActive ? 'active' : 'inactive'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => toggleStatus(b)} className="p-1.5 rounded-lg text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-colors">
                        {b.isActive ? <Ban size={14} /> : <CheckCircle size={14} />}
                      </button>
                      <button onClick={() => deleteBusiness(b.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="text-center py-12 text-gray-400">No businesses found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
