import { useState, useEffect } from 'react'
import { Users, Plus, Building2, UserMinus, Copy, Check, Stethoscope, Clock, ShieldCheck, X } from 'lucide-react'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
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

  const [formData, setFormData] = useState({ name: '', phone: '', roleType: 'OPD_Doctor' })

  useEffect(() => {
    api.get('/business/my').then(res => {
      const bizs = res.data.data
      setBusinesses(bizs)
      if (bizs.length > 0) setSelectedBusiness(bizs[0].id)
    }).catch(() => toast.error('Failed to load hospitals'))
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
        businessId: selectedBusiness,
        roleType: formData.roleType
      })
      setNewCredentials(res.data.data.credentials)
      setIsModalOpen(false)
      setFormData({ name: '', phone: '', roleType: 'OPD_Doctor' })
      fetchStaff()
      toast.success(res.data.message)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create staff')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveStaff = async (staffId) => {
    if (!window.confirm("Are you sure you want to remove this staff member from this hospital?")) return
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
  
  const getRoleIcon = (role) => {
    if (role === 'OPD_Doctor') return <Users size={16} />
    if (role === 'Appointment_Doctor') return <Clock size={16} />
    return <ShieldCheck size={16} />
  }

  const getRoleBadge = (role) => {
    switch (role) {
      case 'OPD_Doctor':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary-50 text-primary-700 border border-primary-200">OPD Specialist</span>
      case 'Appointment_Doctor':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">Appointment Specialist</span>
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">General Staff</span>
    }
  }

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
        <PageHeader
          title="Manage Staff"
          subtitle="Create doctor accounts and assign roles"
        />
        <button onClick={() => { setIsModalOpen(true); setNewCredentials(null) }} className="btn-primary flex items-center gap-2 shadow-premium">
          <Plus size={16} /> Add Staff
        </button>
      </div>

      <div className="card mb-6 shadow-sm">
        <label className="block text-sm font-bold text-primary-900 mb-2">Select Hospital</label>
        <select
          value={selectedBusiness}
          onChange={(e) => setSelectedBusiness(e.target.value)}
          className="input-field max-w-md font-medium"
        >
          {businesses.map(b => (
            <option key={b.id} value={b.id}>{b.businessName}</option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {staffList.map(assignment => (
          <div key={assignment.id} className="card flex items-center justify-between hover:border-primary-300 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary-50 border border-primary-100 rounded-2xl flex items-center justify-center text-primary-700 group-hover:bg-primary-100 transition-colors">
                <Stethoscope size={24} />
              </div>
              <div>
                <p className="font-bold text-primary-900 text-lg flex items-center gap-2">
                  Dr. {assignment.staffId.name} {getRoleBadge(assignment.roleType)}
                </p>
                <p className="text-sm font-medium text-slate-500 mt-0.5">{assignment.staffId.email} · {assignment.staffId.phone}</p>
              </div>
            </div>
            <button
              onClick={() => handleRemoveStaff(assignment.staffId.id)}
              className="p-3 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all"
              title="Remove Staff"
            >
              <UserMinus size={20} />
            </button>
          </div>
        ))}

        {staffList.length === 0 && (
          <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <Users size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">No doctors assigned to this hospital yet.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-3xl w-full max-w-md p-8 shadow-premium relative">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-primary-900">Add Staff Member</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full">
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleCreateStaff} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Full Name</label>
                  <input
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="e.g. Jane Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Phone Number</label>
                  <input
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="input-field"
                    placeholder="e.g. 1234567890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Assign Role</label>
                  <div className="grid grid-cols-1 gap-2">
                     <button type="button" onClick={() => setFormData({...formData, roleType: 'OPD_Doctor'})} className={`p-3 rounded-xl border flex items-center gap-3 text-left transition-all ${formData.roleType === 'OPD_Doctor' ? 'bg-primary-50 border-primary-500 ring-1 ring-primary-500' : 'bg-white border-slate-200 hover:border-primary-300'}`}>
                        <div className={`p-2 rounded-lg ${formData.roleType === 'OPD_Doctor' ? 'bg-primary-200 text-primary-800' : 'bg-slate-100 text-slate-500'}`}><Users size={18}/></div>
                        <div>
                          <p className={`font-bold text-sm ${formData.roleType === 'OPD_Doctor' ? 'text-primary-900' : 'text-slate-700'}`}>OPD Specialist</p>
                          <p className="text-xs text-slate-500 mt-0.5">Handles walk-in queue</p>
                        </div>
                     </button>
                     <button type="button" onClick={() => setFormData({...formData, roleType: 'Appointment_Doctor'})} className={`p-3 rounded-xl border flex items-center gap-3 text-left transition-all ${formData.roleType === 'Appointment_Doctor' ? 'bg-purple-50 border-purple-500 ring-1 ring-purple-500' : 'bg-white border-slate-200 hover:border-purple-300'}`}>
                        <div className={`p-2 rounded-lg ${formData.roleType === 'Appointment_Doctor' ? 'bg-purple-200 text-purple-800' : 'bg-slate-100 text-slate-500'}`}><Clock size={18}/></div>
                        <div>
                          <p className={`font-bold text-sm ${formData.roleType === 'Appointment_Doctor' ? 'text-purple-900' : 'text-slate-700'}`}>Appointment Specialist</p>
                          <p className="text-xs text-slate-500 mt-0.5">Handles scheduled visits</p>
                        </div>
                     </button>
                     <button type="button" onClick={() => setFormData({...formData, roleType: 'General'})} className={`p-3 rounded-xl border flex items-center gap-3 text-left transition-all ${formData.roleType === 'General' ? 'bg-slate-100 border-slate-500 ring-1 ring-slate-500' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                        <div className={`p-2 rounded-lg ${formData.roleType === 'General' ? 'bg-slate-300 text-slate-800' : 'bg-slate-100 text-slate-500'}`}><ShieldCheck size={18}/></div>
                        <div>
                          <p className={`font-bold text-sm ${formData.roleType === 'General' ? 'text-slate-900' : 'text-slate-700'}`}>General Staff</p>
                          <p className="text-xs text-slate-500 mt-0.5">Admin / Non-medical staff</p>
                        </div>
                     </button>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full mt-4 py-3 text-base shadow-lg">
                  {loading ? 'Creating...' : 'Create & Assign Role'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {newCredentials && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-[2rem] w-full max-w-md p-10 shadow-premium text-center">
              <div className="w-20 h-20 bg-secondary-100 border-4 border-white shadow-sm rounded-full flex items-center justify-center mx-auto mb-6">
                <Check size={40} className="text-secondary-600" />
              </div>
              <h3 className="text-3xl font-black text-primary-900 mb-3 tracking-tight">Staff Created!</h3>
              <p className="text-sm font-medium text-slate-500 mb-8 px-4">Please copy these login credentials securely. They will not be shown again.</p>
              
              <div className="space-y-4 mb-8 text-left">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between group hover:border-primary-300 transition-colors">
                  <div className="overflow-hidden">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Email</p>
                    <p className="font-mono text-base font-semibold text-primary-900 truncate">{newCredentials.email}</p>
                  </div>
                  <button onClick={() => copyToClipboard(newCredentials.email, 'email')} className="p-3 bg-white shadow-sm rounded-xl text-slate-400 hover:text-primary-600 transition-colors">
                    {copiedText === 'email' ? <Check size={18} className="text-secondary-500" /> : <Copy size={18} />}
                  </button>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between group hover:border-primary-300 transition-colors">
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Password</p>
                    <p className="font-mono text-base font-semibold text-primary-900">{newCredentials.password}</p>
                  </div>
                  <button onClick={() => copyToClipboard(newCredentials.password, 'password')} className="p-3 bg-white shadow-sm rounded-xl text-slate-400 hover:text-primary-600 transition-colors">
                    {copiedText === 'password' ? <Check size={18} className="text-secondary-500" /> : <Copy size={18} />}
                  </button>
                </div>
              </div>

              <button onClick={() => setNewCredentials(null)} className="btn-primary w-full py-4 text-base shadow-lg">
                I have copied the credentials
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
