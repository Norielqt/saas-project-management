import { useLocation } from 'react-router-dom'
import NotificationDropdown from '../notifications/NotificationDropdown'
import { useAuth } from '../../context/AuthContext'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/organizations': 'Organizations',
  '/settings': 'Settings',
}

export default function Header() {
  const { user } = useAuth()
  const { pathname } = useLocation()

  const title = Object.entries(PAGE_TITLES).find(([path]) => pathname.startsWith(path))?.[1] ?? 'SaaS PM'

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
      <h2 className="font-semibold" style={{ color: '#003148' }}>{title}</h2>

      <div className="flex items-center gap-3">
        <NotificationDropdown />
        <div className="flex items-center gap-2">
          <img
            src={user?.avatar_url}
            alt={user?.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-700 leading-tight">{user?.name}</p>
            {user?.job_title && (
              <p className="text-xs text-gray-400 leading-tight">{user.job_title}</p>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
