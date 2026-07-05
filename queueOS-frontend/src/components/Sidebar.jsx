import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
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

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth()
  if (!user) return null

  const navItems = NAV[user.role] || []

  const menuVariants = {
    hidden: { 
      opacity: 0, 
      y: -20, 
      scale: 0.95,
      transformOrigin: "top left"
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 24,
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      y: -10, 
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40" 
            onClick={onClose} 
          />

          {/* Dropdown Menu */}
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute top-20 left-4 sm:left-6 z-50 w-72 rounded-[2rem] bg-white/90 backdrop-blur-3xl shadow-[0_20px_60px_-15px_rgba(79,70,229,0.3)] border border-white/60 overflow-hidden flex flex-col max-h-[calc(100vh-100px)]"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[1rem] bg-indigo-600 text-white shadow-md shadow-indigo-500/30">
                  <span className="text-lg font-black">Q</span>
                </div>
                <div>
                  <p className="text-slate-900 text-sm font-bold">QueueOS</p>
                  <p className="text-indigo-600 text-[10px] font-bold uppercase tracking-wider">{user.role} Portal</p>
                </div>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition-colors p-2 rounded-full hover:bg-rose-50">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
              {navItems.map(({ to, icon: Icon, label }) => (
                <motion.div key={to} variants={itemVariants}>
                  <NavLink
                    to={to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600 hover:translate-x-1'
                      }`
                    }
                  >
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-400 group-hover:text-indigo-600 group-hover:shadow-sm transition-all border border-slate-100">
                      <Icon size={16} />
                    </span>
                    <span>{label}</span>
                  </NavLink>
                </motion.div>
              ))}
            </div>

            <div className="border-t border-slate-200/50 p-4 bg-slate-50/50">
              <div className="flex items-center gap-3 rounded-2xl bg-white p-3 border border-slate-100 shadow-sm">
                <div className="h-9 w-9 rounded-[1rem] bg-indigo-100 flex items-center justify-center text-indigo-700 text-sm font-bold">
                  {user.name?.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
