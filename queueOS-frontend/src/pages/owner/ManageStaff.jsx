import { useState, useEffect } from 'react'
import { Users, Plus, Building2, UserMinus, Copy, Check } from 'lucide-react'
import { toast } from 'react-toastify'
import PageHeader from '../../components/PageHeader'
import api from '../../api'

export default function ManageStaff() {
  const [businesses, setBusinesses] = useState([])
  const [selectedBusiness, setSelectedBusiness] = useState('')
  const [staffList, setStaffList] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newCredentials, setNewCredentials] = useState(null)
  const [copiedText, setCopiedText] = useState('')

  const [formData, setFormData] = useState({ name: '', phone: '' })

  useEffect(() => {
    api.get('/business/my').then(res => {
      const bizs = res.data.data
      setBusinesses(bizs)
      if (bizs.length > 0) setSelectedBusiness(bizs[0]._id)
    }).catch(() => toast.error('Failed to load businesses'))
  }, [])

  useEffect(() => {
    if (selectedBusiness) {
      fetchStaff()
    }
  }, [selectedBusiness])

  const fetchStaff = () => {
    api.get(`/staff/business/${selectedBusiness}`)
      .then(res => setStaffList(res.data.data))
      .catch(() => toast.error('Failed to load staff'))
  }

  const handleCreateStaff = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/staff/create-assignment', {
        name: formData.name,
        phone: formData.phone,
        businessId: selectedBusiness
      })
      setNewCredentials(res.data.data.credentials)
      setIsModalOpen(false)
      setFormData({ name: '', phone: '' })
      fetchStaff()
      toast.success(res.data.message)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create staff')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveStaff = async (staffId) => {
    if (!window.confirm("Are you sure you want to remove this staff member from this business?")) return
    try {
      await api.delete(`/staff/unassign/${staffId}`)
      toast.success("Staff removed successfully")
      fetchStaff()
    } catch (err) {
      toast.error("Failed to remove staff")
    }
  }

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopiedText(field)
    setTimeout(() => setCopiedText(''), 2000)
  }

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Manage Staff"
        subtitle="Create staff accounts and assign them to your businesses"
        action={
          <button onClick={() => { setIsModalOpen(true); setNewCredentials(null) }} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Staff
          </button>
        }
      />

      <div className="card mb-6">
        <label className="block text-sm font-semibold text-slate-700 mb-2">Select Business</label>
        <select
          value={selectedBusiness}
          onChange={(e) => setSelectedBusiness(e.target.value)}
          className="input-field max-w-md"
        >
          {businesses.map(b => (
            <option key={b._id} value={b._id}>{b.businessName}</option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {staffList.map(assignment => (
          <div key={assignment._id} className="card flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600">
                <Users size={20} />
              </div>
              <div>
                <p className="font-bold text-gray-900">{assignment.staffId.name}</p>
                <p className="text-sm text-gray-500">{assignment.staffId.email} · {assignment.staffId.phone}</p>
              </div>
            </div>
            <button
              onClick={() => handleRemoveStaff(assignment.staffId._id)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Remove Staff"
            >
              <UserMinus size={18} />
            </button>
          </div>
        ))}

        {staffList.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <Users size={32} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500">No staff assigned to this business yet.</p>
          </div>
        )}
      </div>

      {/* Create Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Add Staff Member</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input
                  required
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field"
                  placeholder="e.g. 1234567890"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                {loading ? 'Creating...' : 'Create & Assign'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Credentials Modal */}
      {newCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Staff Created!</h3>
            <p className="text-sm text-slate-500 mb-6">Please copy these login credentials and share them securely with your staff member. They will not be shown again.</p>
            
            <div className="space-y-3 mb-6 text-left">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="overflow-hidden">
                  <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Email</p>
                  <p className="font-mono text-sm text-slate-900 truncate">{newCredentials.email}</p>
                </div>
                <button onClick={() => copyToClipboard(newCredentials.email, 'email')} className="p-2 text-slate-400 hover:text-slate-600">
                  {copiedText === 'email' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Password</p>
                  <p className="font-mono text-sm text-slate-900">{newCredentials.password}</p>
                </div>
                <button onClick={() => copyToClipboard(newCredentials.password, 'password')} className="p-2 text-slate-400 hover:text-slate-600">
                  {copiedText === 'password' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            <button onClick={() => setNewCredentials(null)} className="btn-primary w-full">
              I have copied the credentials
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
