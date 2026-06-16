import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

// Dummy users for UI demo (no API yet)
const DUMMY_USERS = {
  customer: { id: 1, name: 'Alex Johnson', email: 'customer@demo.com', role: 'customer', phone: '555-0101', dob: '1995-06-15' },
  owner:    { id: 2, name: 'Sarah Williams', email: 'owner@demo.com', role: 'owner', phone: '555-0202', dob: '1988-03-22' },
  staff:    { id: 3, name: 'Mike Davis', email: 'staff@demo.com', role: 'staff', phone: '555-0303', dob: '1992-11-08' },
  admin:    { id: 4, name: 'Admin User', email: 'admin@demo.com', role: 'admin', phone: '555-0404', dob: '1985-01-10' },
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  const login = (email, password) => {
    // Demo login — match by role keyword in email
    let matched = null
    if (email.includes('customer')) matched = DUMMY_USERS.customer
    else if (email.includes('owner'))    matched = DUMMY_USERS.owner
    else if (email.includes('staff'))    matched = DUMMY_USERS.staff
    else if (email.includes('admin'))    matched = DUMMY_USERS.admin
    else matched = DUMMY_USERS.customer // default

    setUser(matched)
    return matched
  }

  const logout = () => setUser(null)

  const updateProfile = (data) => {
    setUser(prev => ({ ...prev, ...data }))
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
