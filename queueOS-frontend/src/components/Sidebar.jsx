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
    { to: '/owner/staff', icon: Users, label: 'Manage Staff' },
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
      {open && (
        <div className="fixed inset-0 bg-slate-950/50 z-20 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-72 bg-slate-950/95 border-r border-white/10 backdrop-blur-xl transform transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="relative h-full flex flex-col overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 opacity-90" />
          <div className="relative z-10 flex items-center justify-between gap-3 px-6 py-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-3xl bg-white/10 text-white shadow-lg shadow-slate-950/20">
                <span className="text-lg font-black">Q</span>
              </div>
              <div>
                <p className="text-white text-base font-semibold">QueueOS</p>
                <p className="text-white/60 text-xs mt-1">{ROLE_LABELS[user.role]}</p>
              </div>
            </div>
            <button onClick={onClose} className="lg:hidden text-white/70 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <nav className="relative z-10 flex-1 overflow-y-auto px-4 py-5 space-y-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? 'bg-white/15 text-white shadow-[0_10px_30px_-15px_rgba(255,255,255,0.25)]'
                      : 'text-slate-200 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-slate-200 group-hover:bg-white/20 group-hover:text-white">
                  <Icon size={18} />
                </span>
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="relative z-10 border-t border-white/10 px-5 py-5 bg-slate-950/95">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-3xl bg-white/10 flex items-center justify-center text-white text-base font-bold">
                  {user.name?.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-xs text-slate-400">
                <p>Role: <span className="font-semibold text-white capitalize">{user.role}</span></p>
                <p className="truncate">Ready for your next queue action.</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
