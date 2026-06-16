import { Menu, Bell, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useState } from 'react'

const ROLE_BADGE = {
  customer: 'bg-blue-100 text-blue-700',
  owner:    'bg-purple-100 text-purple-700',
  staff:    'bg-emerald-100 text-emerald-700',
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
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
      >
        <Menu size={20} />
      </button>

      <div className="hidden lg:block">
        <h2 className="text-gray-800 font-semibold text-sm">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="relative">
          <button
            onClick={() => setDropOpen(!dropOpen)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-700 font-semibold text-sm">
                {user?.name?.charAt(0)}
              </span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-800 leading-none">{user?.name}</p>
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium mt-0.5 inline-block ${ROLE_BADGE[user?.role]}`}>
                {user?.role}
              </span>
            </div>
            <ChevronDown size={16} className="text-gray-400" />
          </button>

          {dropOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
              <button
                onClick={() => { navigate('/profile'); setDropOpen(false) }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                My Profile
              </button>
              <button
                onClick={() => { navigate('/change-password'); setDropOpen(false) }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Change Password
              </button>
              <hr className="my-1 border-gray-100" />
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
