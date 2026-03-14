import api from './axios'

export const tasksApi = {
  // Tasks
  list: (projectId)                       => api.get(`/projects/${projectId}/tasks`),
  get: (projectId, taskId)                => api.get(`/projects/${projectId}/tasks/${taskId}`),
  create: (projectId, data)               => api.post(`/projects/${projectId}/tasks`, data),
  update: (projectId, taskId, data)       => api.put(`/projects/${projectId}/tasks/${taskId}`, data),
  delete: (projectId, taskId)             => api.delete(`/projects/${projectId}/tasks/${taskId}`),
  updateStatus: (taskId, status)          => api.patch(`/tasks/${taskId}/status`, { status }),
  updatePosition: (taskId, data)          => api.patch(`/tasks/${taskId}/position`, data),
  assign: (taskId, assigneeId)            => api.patch(`/tasks/${taskId}/assign`, { assignee_id: assigneeId }),

  // Subtasks
  listSubtasks: (taskId)                  => api.get(`/tasks/${taskId}/subtasks`),
  createSubtask: (taskId, data)           => api.post(`/tasks/${taskId}/subtasks`, data),
  updateSubtask: (taskId, subtaskId, data)=> api.put(`/tasks/${taskId}/subtasks/${subtaskId}`, data),
  deleteSubtask: (taskId, subtaskId)      => api.delete(`/tasks/${taskId}/subtasks/${subtaskId}`),
  toggleSubtask: (subtaskId)              => api.patch(`/subtasks/${subtaskId}/toggle`),

  // Comments
  listComments: (taskId)                  => api.get(`/tasks/${taskId}/comments`),
  createComment: (taskId, data)           => api.post(`/tasks/${taskId}/comments`, data),
  updateComment: (taskId, commentId, data)=> api.put(`/tasks/${taskId}/comments/${commentId}`, data),
  deleteComment: (taskId, commentId)      => api.delete(`/tasks/${taskId}/comments/${commentId}`),

  // Attachments
  listAttachments: (taskId)               => api.get(`/tasks/${taskId}/attachments`),
  uploadAttachment: (taskId, file)        => {
    const form = new FormData()
    form.append('file', file)
    return api.post(`/tasks/${taskId}/attachments`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  deleteAttachment: (taskId, attachmentId)=> api.delete(`/tasks/${taskId}/attachments/${attachmentId}`),
}
