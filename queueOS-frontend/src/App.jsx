import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Core Pages
import Home from './pages/Home'

// Auth Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ChangePassword from './pages/auth/ChangePassword'
import Profile from './pages/auth/Profile'

// Customer Pages
import CustomerDashboard from './pages/customer/Dashboard'
import JoinQueue from './pages/customer/JoinQueue'
import QueueStatus from './pages/customer/QueueStatus'
import BookAppointment from './pages/customer/BookAppointment'
import MyAppointments from './pages/customer/MyAppointments'
import CustomerNotifications from './pages/customer/Notifications'

import HospitalSearch from './pages/customer/HospitalSearch'

// Owner Pages
import OwnerDashboard from './pages/owner/Dashboard'
import MyBusinesses from './pages/owner/MyBusinesses'
import CreateBusiness from './pages/owner/CreateBusiness'
import EditBusiness from './pages/owner/EditBusiness'
import BusinessDetails from './pages/owner/BusinessDetails'
import Services from './pages/owner/Services'
import Analytics from './pages/owner/Analytics'
import AIPredictions from './pages/owner/AIPredictions'
import ManageStaff from './pages/owner/ManageStaff'

// Staff Pages
import StaffDashboard from './pages/staff/Dashboard'
import QueueBoard from './pages/staff/QueueBoard'
import CallNext from './pages/staff/CallNext'
import MarkServed from './pages/staff/MarkServed'
import NoShow from './pages/staff/NoShow'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import ManageBusinesses from './pages/admin/ManageBusinesses'
import ManageUsers from './pages/admin/ManageUsers'
import PlatformAnalytics from './pages/admin/PlatformAnalytics'
import CreateUser from './pages/admin/CreateUser'

// Layouts
import AuthLayout from './layouts/AuthLayout'
import DashboardLayout from './layouts/DashboardLayout'

// Route Guards
import ProtectedRoute from './routes/ProtectedRoute'
import RoleRoute from './routes/RoleRoute'

export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>

          {/* Shared */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/change-password" element={<ChangePassword />} />

          {/* Customer */}
          <Route element={<RoleRoute role="customer" />}>
            <Route path="/customer/dashboard" element={<CustomerDashboard />} />
            <Route path="/customer/hospitals" element={<HospitalSearch />} />
            <Route path="/customer/join-queue" element={<JoinQueue />} />
            <Route path="/customer/queue-status" element={<QueueStatus />} />
            <Route path="/customer/book-appointment" element={<BookAppointment />} />
            <Route path="/customer/appointments" element={<MyAppointments />} />
            <Route path="/customer/notifications" element={<CustomerNotifications />} />
          </Route>

          {/* Owner */}
          <Route element={<RoleRoute role="owner" />}>
            <Route path="/owner/dashboard" element={<OwnerDashboard />} />
            <Route path="/owner/businesses" element={<MyBusinesses />} />
            <Route path="/owner/businesses/create" element={<CreateBusiness />} />
            <Route path="/owner/businesses/:id/edit" element={<EditBusiness />} />
            <Route path="/owner/businesses/:id" element={<BusinessDetails />} />
            <Route path="/owner/services" element={<Services />} />
            <Route path="/owner/staff" element={<ManageStaff />} />
            <Route path="/owner/analytics" element={<Analytics />} />
            <Route path="/owner/ai-predictions" element={<AIPredictions />} />
          </Route>

          {/* Staff */}
          <Route element={<RoleRoute role="staff" />}>
            <Route path="/staff/dashboard" element={<StaffDashboard />} />
            <Route path="/staff/queue-board" element={<QueueBoard />} />
            <Route path="/staff/call-next" element={<CallNext />} />
            <Route path="/staff/mark-served" element={<MarkServed />} />
            <Route path="/staff/no-show" element={<NoShow />} />
          </Route>

          {/* Admin */}
          <Route element={<RoleRoute role="admin" />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/businesses" element={<ManageBusinesses />} />
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/admin/analytics" element={<PlatformAnalytics />} />
          </Route>

        </Route>
      </Route>

      {/* Default Routes */}
      <Route path="/" element={<Home />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
