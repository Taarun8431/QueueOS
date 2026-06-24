import { useState, useEffect } from 'react'
import { Briefcase, Plus, Edit2, Trash2, Clock, DollarSign, ToggleLeft, ToggleRight } from 'lucide-react'
import { toast } from 'react-toastify'
import PageHeader from '../../components/PageHeader'
import api from '../../api'

export default function Services() {
  const [services, setServices] = useState([])
  const [businesses, setBusinesses] = useState([])
  const [selectedBusiness, setSelectedBusiness] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ serviceName: '', estimatedDuration: '', price: '', description: '' })

  useEffect(() => {
    api.get('/business/my')
      .then(res => {
        setBusinesses(res.data.data)
        if (res.data.data.length > 0) setSelectedBusiness(res.data.data[0]._id)
      })
      .catch(() => toast.error('Failed to load businesses'))
  }, [])

  useEffect(() => {
    if (!selectedBusiness) return
    setLoading(true)
    api.get(`/services/business/${selectedBusiness}`)
      .then(res => setServices(res.data.data))
      .catch(() => toast.error('Failed to load services'))
      .finally(() => setLoading(false))
  }, [selectedBusiness])

  const toggleAvailability = async (s) => {
    try {
      await api.put(`/services/${s._id}`, { isActive: !s.isActive })
      setServices(prev => prev.map(item => item._id === s._id ? { ...item, isActive: !item.isActive } : item))
    } catch {
      toast.error('Failed to update service')
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/services/${id}`)
      setServices(prev => prev.filter(s => s._id !== id))
      toast.success('Service removed')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.serviceName || !form.estimatedDuration) { toast.error('Name and duration are required'); return }
    try {
      const res = await api.post('/services', {
        serviceName: form.serviceName,
        estimatedDuration: +form.estimatedDuration,
        price: +form.price || 0,
        description: form.description,
        businessId: selectedBusiness,
      })
      setServices(prev => [...prev, res.data.data])
      toast.success('Service added!')
      setForm({ serviceName: '', estimatedDuration: '', price: '', description: '' })
      setShowForm(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add service')
    }
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Services"
        subtitle="Manage services offered by your businesses"
        action={
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> {showForm ? 'Cancel' : 'Add Service'}
          </button>
        }
      />

      {businesses.length > 0 && (
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 mb-1">Select Business</label>
          <select className="input-field max-w-xs" value={selectedBusiness} onChange={e => setSelectedBusiness(e.target.value)}>
            {businesses.map(b => <option key={b._id} value={b._id}>{b.businessName}</option>)}
          </select>
        </div>
      )}

      {showForm && (
        <div className="card mb-6 border-2 border-primary-100">
          <h3 className="font-semibold text-gray-900 mb-4">New Service</h3>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Service Name *</label>
                <input className="input-field" placeholder="e.g. Haircut" value={form.serviceName}
                  onChange={e => setForm(p => ({ ...p, serviceName: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Duration (min) *</label>
                <input className="input-field" type="number" placeholder="30" value={form.estimatedDuration}
                  onChange={e => setForm(p => ({ ...p, estimatedDuration: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Price ($)</label>
                <input className="input-field" type="number" placeholder="0" value={form.price}
                  onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <input className="input-field" placeholder="Brief description" value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
            </div>
            <button type="submit" className="btn-primary text-sm">Save Service</button>
          </form>
        </div>
      )}

      {loading ? <p className="text-gray-400">Loading...</p> : (
        <div className="space-y-3">
          {services.length === 0 && <p className="text-gray-400 text-sm">No services yet. Add one above.</p>}
          {services.map(s => (
            <div key={s._id} className="card flex items-center justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="p-2 bg-primary-50 rounded-lg flex-shrink-0">
                  <Briefcase size={16} className="text-primary-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{s.serviceName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.description}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-gray-500"><Clock size={11} /> {s.estimatedDuration} min</span>
                    <span className="flex items-center gap-1 text-xs text-gray-500"><DollarSign size={11} /> {s.price === 0 ? 'Free' : s.price}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => toggleAvailability(s)}
                  className={`text-xs flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ${s.isActive ? 'text-green-700 bg-green-50' : 'text-gray-500 bg-gray-100'}`}>
                  {s.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                  {s.isActive ? 'On' : 'Off'}
                </button>
                <button onClick={() => handleDelete(s._id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
