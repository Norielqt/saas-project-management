import api from './axios'

export const notificationsApi = {
  list: ()                => api.get('/notifications'),
  unreadCount: ()         => api.get('/notifications/unread-count'),
  markAsRead: (id)        => api.patch(`/notifications/${id}/read`),
  markAllAsRead: ()       => api.post('/notifications/read-all'),
}
