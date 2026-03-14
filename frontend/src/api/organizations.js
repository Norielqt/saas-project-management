import api from './axios'

export const organizationsApi = {
  list: ()                      => api.get('/organizations'),
  get: (id)                     => api.get(`/organizations/${id}`),
  create: (data)                => api.post('/organizations', data),
  update: (id, data)            => api.put(`/organizations/${id}`, data),
  delete: (id)                  => api.delete(`/organizations/${id}`),
  addMember: (id, data)         => api.post(`/organizations/${id}/members`, data),
  removeMember: (orgId, userId) => api.delete(`/organizations/${orgId}/members/${userId}`),
  getActivity: (id)             => api.get(`/organizations/${id}/activity`),
}
