import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { notificationsApi } from '../api/notifications'
import { useAuth } from './AuthContext'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return
    try {
      const { data } = await notificationsApi.unreadCount()
      setUnreadCount(data.count)
    } catch (_) {}
  }, [user])

  const fetchNotifications = useCallback(async () => {
    if (!user) return
    try {
      const { data } = await notificationsApi.list()
      setNotifications(data.data || data)
      const unread = (data.data || data).filter((n) => !n.read_at).length
      setUnreadCount(unread)
    } catch (_) {}
  }, [user])

  const markAsRead = useCallback(async (id) => {
    await notificationsApi.markAsRead(id)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    )
    setUnreadCount((c) => Math.max(0, c - 1))
  }, [])

  const markAllAsRead = useCallback(async () => {
    await notificationsApi.markAllAsRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })))
    setUnreadCount(0)
  }, [])

  // Poll every 30 seconds for new notifications
  useEffect(() => {
    if (!user) return
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30_000)
    return () => clearInterval(interval)
  }, [user, fetchUnreadCount])

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used inside <NotificationProvider>')
  return ctx
}
