import api from './axios'

export const projectsApi = {
  list: (orgId)                       => api.get(`/organizations/${orgId}/projects`),
  get: (orgId, projectId)             => api.get(`/organizations/${orgId}/projects/${projectId}`),
  create: (orgId, data)               => api.post(`/organizations/${orgId}/projects`, data),
  update: (orgId, projectId, data)    => api.put(`/organizations/${orgId}/projects/${projectId}`, data),
  delete: (orgId, projectId)          => api.delete(`/organizations/${orgId}/projects/${projectId}`),
  addMember: (projectId, data)        => api.post(`/projects/${projectId}/members`, data),
  removeMember: (projectId, userId)   => api.delete(`/projects/${projectId}/members/${userId}`),
  getActivity: (projectId)            => api.get(`/projects/${projectId}/activity`),
}
