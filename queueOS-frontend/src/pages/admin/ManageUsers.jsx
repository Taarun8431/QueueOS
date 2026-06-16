import { useState } from 'react'
import { Search, User, Ban, CheckCircle, Trash2, Mail, Phone } from 'lucide-react'
import { toast } from 'react-toastify'
import { DUMMY_USERS } from '../../data/dummy'
import PageHeader from '../../components/PageHeader'

const ROLE_BADGE = {
  admin:    'bg-rose-100 text-rose-700',
  owner:    'bg-purple-100 text-purple-700',
  staff:    'bg-emerald-100 text-emerald-700',
  customer: 'bg-blue-100 text-blue-700',
}

export default function ManageUsers() {
  const [users, setUsers] = useState(DUMMY_USERS)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('all')

  const filtered = users
    .filter(u => filterRole === 'all' || u.role === filterRole)
    .filter(u => u.name.toLowerCase().includes(search.toLowerCase()) ||
                 u.email.toLowerCase().includes(search.toLowerCase()))

  const toggleStatus = (id) => {
    setUsers(prev => prev.map(u =>
      u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
    ))
    toast.success('User status updated')
  }

  const deleteUser = (id) => {
    setUsers(prev => prev.filter(u => u.id !== id))
    toast.success('User removed')
  }

  return (
    <div>
      <PageHeader
        title="Manage Users"
        subtitle={`${users.length} registered users`}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input placeholder="Search users..." value={search}
            onChange={e => setSearch(e.target.value)} className="input-field pl-9" />
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {['all', 'customer', 'owner', 'staff', 'admin'].map(r => (
            <button key={r} onClick={() => setFilterRole(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                filterRole === r ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(u => (
          <div key={u.id} className="card">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="font-bold text-primary-700">{u.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{u.name}</p>
                  <p className="text-xs text-gray-400">{u.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${ROLE_BADGE[u.role]}`}>
                  {u.role}
                </span>
                <span className={u.status === 'active' ? 'badge-active' : 'badge-inactive'}>
                  {u.status}
                </span>
              </div>
            </div>

            <div className="space-y-1 text-xs text-gray-500 mb-3">
              <div className="flex items-center gap-2"><Mail size={11} /> {u.email}</div>
              <div className="flex items-center gap-2"><Phone size={11} /> {u.phone}</div>
              <p>Joined: {u.joined}</p>
            </div>

            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <button onClick={() => toggleStatus(u.id)}
                className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  u.status === 'active'
                    ? 'text-orange-600 bg-orange-50 hover:bg-orange-100'
                    : 'text-green-600 bg-green-50 hover:bg-green-100'
                }`}>
                {u.status === 'active' ? <Ban size={11} /> : <CheckCircle size={11} />}
                {u.status === 'active' ? 'Suspend' : 'Activate'}
              </button>
              <button onClick={() => deleteUser(u.id)}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
                <Trash2 size={11} /> Delete
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-2 card text-center py-12">
            <User size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No users found</p>
          </div>
        )}
      </div>
    </div>
  )
}
