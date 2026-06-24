import { useState } from 'react'
import { Search, User, Mail, Phone } from 'lucide-react'
import PageHeader from '../../components/PageHeader'

const ROLE_BADGE = {
  admin:    'bg-rose-100 text-rose-700',
  owner:    'bg-purple-100 text-purple-700',
  staff:    'bg-emerald-100 text-emerald-700',
  customer: 'bg-blue-100 text-blue-700',
}

// Note: No admin user management API exists in the backend yet.
// This page shows a placeholder until that endpoint is built.
export default function ManageUsers() {
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('all')

  return (
    <div>
      <PageHeader title="Manage Users" subtitle="User management" />
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9" />
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {['all', 'customer', 'owner', 'staff', 'admin'].map(r => (
            <button key={r} onClick={() => setFilterRole(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${filterRole === r ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
              {r}
            </button>
          ))}
        </div>
      </div>
      <div className="card text-center py-16">
        <User size={48} className="text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 font-medium">User management API coming soon</p>
        <p className="text-gray-400 text-sm mt-1">An admin endpoint to list and manage all users needs to be added to the backend.</p>
      </div>
    </div>
  )
}
