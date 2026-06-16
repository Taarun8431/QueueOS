import { useState } from 'react'
import { Briefcase, Plus, Edit2, Trash2, Clock, DollarSign, ToggleLeft, ToggleRight } from 'lucide-react'
import { DUMMY_SERVICES } from '../../data/dummy'
import { toast } from 'react-toastify'
import PageHeader from '../../components/PageHeader'

export default function Services() {
  const [services, setServices] = useState(DUMMY_SERVICES)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', duration: '', price: '', description: '' })

  const toggleAvailability = (id) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, available: !s.available } : s))
  }

  const handleDelete = (id) => {
    setServices(prev => prev.filter(s => s.id !== id))
    toast.success('Service removed')
  }

  const handleAdd = (e) => {
    e.preventDefault()
    if (!form.name || !form.duration) { toast.error('Name and duration are required'); return }
    setServices(prev => [...prev, {
      id: `S${Date.now()}`, name: form.name, duration: +form.duration,
      price: +form.price || 0, description: form.description, available: true
    }])
    toast.success('Service added!')
    setForm({ name: '', duration: '', price: '', description: '' })
    setShowForm(false)
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

      {showForm && (
        <div className="card mb-6 border-2 border-primary-100">
          <h3 className="font-semibold text-gray-900 mb-4">New Service</h3>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Service Name *</label>
                <input className="input-field" placeholder="e.g. Haircut" value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Duration (min) *</label>
                <input className="input-field" type="number" placeholder="30" value={form.duration}
                  onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} />
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

      <div className="space-y-3">
        {services.map(s => (
          <div key={s.id} className="card flex items-center justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="p-2 bg-primary-50 rounded-lg flex-shrink-0">
                <Briefcase size={16} className="text-primary-600" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-gray-900 text-sm">{s.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.description}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock size={11} /> {s.duration} min
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <DollarSign size={11} /> {s.price === 0 ? 'Free' : s.price}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => toggleAvailability(s.id)}
                className={`text-xs flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
                  s.available ? 'text-green-700 bg-green-50' : 'text-gray-500 bg-gray-100'}`}>
                {s.available ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                {s.available ? 'On' : 'Off'}
              </button>
              <button onClick={() => toast.info('Edit coming soon')}
                className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                <Edit2 size={14} />
              </button>
              <button onClick={() => handleDelete(s.id)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
