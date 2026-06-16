import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Building2, PlusCircle, Users, BarChart3,
  CalendarCheck, Clock, Bell, User, X, BrainCircuit,
  ClipboardList, PhoneCall, CheckCircle, UserX, Settings,
  Briefcase, Activity
} from 'lucide-react'

const NAV = {
  customer: [
    { to: '/customer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/customer/join-queue', icon: Clock, label: 'Join Queue' },
    { to: '/customer/queue-status', icon: Activity, label: 'Queue Status' },
    { to: '/customer/book-appointment', icon: CalendarCheck, label: 'Book Appointment' },
    { to: '/customer/appointments', icon: ClipboardList, label: 'My Appointments' },
    { to: '/customer/notifications', icon: Bell, label: 'Notifications' },
  ],
  owner: [
    { to: '/owner/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/owner/businesses', icon: Building2, label: 'My Businesses' },
    { to: '/owner/businesses/create', icon: PlusCircle, label: 'Create Business' },
    { to: '/owner/services', icon: Briefcase, label: 'Services' },
    { to: '/owner/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/owner/ai-predictions', icon: BrainCircuit, label: 'AI Predictions' },
  ],
  staff: [
    { to: '/staff/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/staff/queue-board', icon: ClipboardList, label: 'Queue Board' },
    { to: '/staff/call-next', icon: PhoneCall, label: 'Call Next' },
    { to: '/staff/mark-served', icon: CheckCircle, label: 'Mark Served' },
    { to: '/staff/no-show', icon: UserX, label: 'No Show' },
  ],
  admin: [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/businesses', icon: Building2, label: 'Manage Businesses' },
    { to: '/admin/users', icon: Users, label: 'Manage Users' },
    { to: '/admin/analytics', icon: BarChart3, label: 'Platform Analytics' },
  ],
}

const ROLE_COLORS = {
  customer: 'from-blue-600 to-blue-800',
  owner:    'from-purple-600 to-purple-800',
  staff:    'from-emerald-600 to-emerald-800',
  admin:    'from-rose-600 to-rose-800',
}

const ROLE_LABELS = {
  customer: 'Customer Portal',
  owner:    'Owner Portal',
  staff:    'Staff Portal',
  admin:    'Admin Portal',
}

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth()
  if (!user) return null

  const navItems = NAV[user.role] || []
  const gradientClass = ROLE_COLORS[user.role] || 'from-primary-600 to-primary-800'

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30
          w-64 bg-gradient-to-b ${gradientClass}
          transform transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-sm font-black text-primary-600">Q</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">QueueOS</p>
              <p className="text-white/60 text-xs mt-0.5">{ROLE_LABELS[user.role]}</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-white/70 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white/20 text-white shadow-sm'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-white/10">
          <NavLink
            to="/profile"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200"
          >
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user.name}</p>
              <p className="text-white/50 text-xs truncate">{user.email}</p>
            </div>
          </NavLink>
        </div>
      </aside>
    </>
  )
}
