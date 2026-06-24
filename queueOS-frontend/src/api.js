import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api',
  withCredentials: true,
})
let accessToken = null

export const setAccessToken = (token) => {
  accessToken = token
}

export const getAccessToken = () => accessToken

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true

      try {
        const res = await axios.post(
          import.meta.env.VITE_API_URL + '/api/auth/refresh',
          {},
          { withCredentials: true }
        )
        const newToken = res.data.accessToken
        setAccessToken(newToken)
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      } catch {
        setAccessToken(null)
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)


export default api

