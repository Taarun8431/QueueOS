import { createContext, useContext, useState, useEffect } from 'react'
import api, { setAccessToken } from '../api'


const AuthContext = createContext(null)


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)


  const login = async (email, password) => {
  const res = await api.post('/auth/login', { email, password })
  setAccessToken(res.data.accessToken)
  setUser(res.data.data)
  localStorage.setItem('user', JSON.stringify(res.data.data))
  return res.data.data
}


 const logout = async () => {
  await api.post('/auth/logout')
  setAccessToken(null)
  setUser(null)
  localStorage.removeItem('user')
}

useEffect(() => {
  const savedUser = localStorage.getItem('user')
  if (savedUser) {
    api.post('/auth/refresh')
      .then(res => {
        setAccessToken(res.data.accessToken)
        setUser(JSON.parse(savedUser))
      })
      .catch(() => localStorage.removeItem('user'))
      .finally(() => setLoading(false))
  } else {
    setLoading(false)
  }
}, [])



  const updateProfile = (data) => {
    setUser(prev => ({ ...prev, ...data }))
  }
  if (loading) return null

  return (
   <AuthContext.Provider value={{ user, login, logout, updateProfile, loading }}>

      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
 
  return useContext(AuthContext)
}
