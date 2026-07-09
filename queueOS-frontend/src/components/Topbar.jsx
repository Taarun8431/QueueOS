import { Menu, Bell, LogOut, ChevronDown, Search } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useState } from 'react'

const ROLE_BADGE = {
  customer: 'bg-primary-100 text-primary-800',
  owner:    'bg-purple-100 text-purple-700',
  staff:    'bg-secondary-100 text-secondary-800',
  admin:    'bg-rose-100 text-rose-700',
}

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [dropOpen, setDropOpen] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <header className="flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 shadow-sm shadow-slate-950/5 backdrop-blur-xl lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition hover:bg-primary-50 hover:text-primary-700"
        >
          <Menu size={20} />
        </button>

        <div className="hidden md:flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 shadow-sm">
          <Search size={18} className="text-slate-400" />
          <input
            type="search"
            placeholder="Search queues, services, businesses..."
            className="w-60 bg-transparent pr-2 text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-3 text-sm text-slate-600">
        <span className="rounded-full bg-slate-100 px-3 py-2">Good to see you, {user?.name?.split(' ')[0]}</span>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative rounded-2xl border border-slate-200 bg-white/95 p-2 text-slate-600 shadow-sm transition hover:bg-slate-50">
          <Bell size={20} />
          <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-semibold text-white">3</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setDropOpen(!dropOpen)}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/95 px-3 py-2 text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
              {user?.name?.charAt(0)}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-slate-900 leading-none">{user?.name}</p>
              <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${ROLE_BADGE[user?.role]}`}>
                {user?.role}
              </span>
            </div>
            <ChevronDown size={16} className="text-slate-500" />
          </button>

          {dropOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
              <button
                onClick={() => { navigate('/profile'); setDropOpen(false) }}
                className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                My Profile
              </button>
              <button
                onClick={() => { navigate('/change-password'); setDropOpen(false) }}
                className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                Change Password
              </button>
              <div className="border-t border-slate-200" />
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50"
              >
                <LogOut size={14} className="inline-block mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
