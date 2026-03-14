import api from './axios'

export const authApi = {
  register: (data) => api.post('/register', data),
  login: (data) => api.post('/login', data),
  logout: () => api.post('/logout'),
  me: () => api.get('/me'),
  updateProfile: (data) => api.put('/profile', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
}
