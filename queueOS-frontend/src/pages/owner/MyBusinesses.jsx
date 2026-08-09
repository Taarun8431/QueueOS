import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Edit2, Trash2, Eye, PlusCircle, Search, Phone, Mail } from 'lucide-react'
import { toast } from 'react-toastify'
import api from '../../api'

import PageHeader from '../../components/PageHeader'

export default function MyBusinesses() {
  const navigate = useNavigate()
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState(null)

  useEffect(() => {
    api.get('/business/my')
      .then(res => setBusinesses(res.data.data))
      .catch(() => toast.error('Failed to load businesses'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = businesses.filter(b =>
    b.businessName.toLowerCase().includes(search.toLowerCase()) ||
    b.category.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id) => {
    try {
      await api.delete(`/business/${id}`)
      setBusinesses(prev => prev.filter(b => b.id !== id))
      setDeleteId(null)
      toast.success('Business deleted successfully')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    }
  }

  const CATEGORY_ICONS = {
    Hospital: '🏥', Salon: '💇', Bank: '🏦',
    'Government Office': '🏛️', 'Service Center': '🔧',
  }

  if (loading) return <p className="text-gray-400">Loading...</p>

  return (
    <div>
      <PageHeader
        title="My Businesses"
        subtitle={`${businesses.length} business${businesses.length !== 1 ? 'es' : ''} registered`}
        action={
          <button onClick={() => navigate('/owner/businesses/create')}
            className="btn-primary flex items-center gap-2 text-sm">
            <PlusCircle size={16} /> Add Business
          </button>
        }
      />

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search businesses..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-16">
          <Building2 size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No businesses found</p>
          <p className="text-gray-400 text-sm mt-1">Try a different search or add a new business</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(b => (
            <div key={b.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-2xl">
                    {CATEGORY_ICONS[b.category] || '🏢'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{b.businessName}</h3>
                    <p className="text-xs text-gray-400">{b.category}</p>
                  </div>
                </div>
                <span className={b.isActive ? 'badge-active' : 'badge-inactive'}>
                  {b.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-1.5 mb-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail size={13} className="text-gray-400 flex-shrink-0" />
                  <span className="truncate">{b.businessEmail}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={13} className="text-gray-400 flex-shrink-0" />
                  <span>{b.phone}</span>
                </div>
                <div className="text-xs text-gray-400">
                  🕐 {b.workingHoursOpen || 'N/A'} – {b.workingHoursClose || 'N/A'}
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button onClick={() => navigate(`/owner/businesses/${b.id}`)}
                  className="btn-secondary flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5">
                  <Eye size={13} /> View
                </button>
                <button onClick={() => navigate(`/owner/businesses/${b.id}/edit`)}
                  className="btn-secondary flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5">
                  <Edit2 size={13} /> Edit
                </button>
                <button onClick={() => setDeleteId(b.id)}
                  className="btn-danger flex items-center justify-center gap-1.5 px-3 text-xs py-1.5">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Delete Business</h3>
            <p className="text-gray-500 text-sm text-center mb-6">
              This action cannot be undone. Are you sure you want to delete this business?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="btn-danger flex-1">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
