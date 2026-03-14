import { useEffect, useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { organizationsApi } from '../../api/organizations'
import {
  HomeIcon,
  BuildingOffice2Icon,
  Cog6ToothIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  FolderIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline'

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [organizations, setOrganizations] = useState([])
  const [expandedOrgs, setExpandedOrgs] = useState({})

  useEffect(() => {
    organizationsApi.list()
      .then(({ data }) => setOrganizations(data.data || data))
      .catch(() => {})
  }, [])

  const toggleOrg = (orgId) => {
    setExpandedOrgs((prev) => ({ ...prev, [orgId]: !prev[orgId] }))
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
      isActive
        ? 'bg-white/15 text-white shadow-sm'
        : 'text-white/50 hover:bg-white/8 hover:text-white/90'
    }`

  return (
    <aside className="w-60 flex flex-col flex-shrink-0" style={{ backgroundColor: '#003148' }}>
      {/* Brand */}
      <div className="px-4 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <span className="text-white font-bold text-lg">SaaS PM</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5 scrollbar-thin">
        <NavLink to="/dashboard" className={navLinkClass}>
          <HomeIcon className="w-4 h-4" />
          Dashboard
        </NavLink>
        <NavLink to="/organizations" className={navLinkClass}>
          <BuildingOffice2Icon className="w-4 h-4" />
          Organizations
        </NavLink>

        {/* Organizations with nested projects */}
        {organizations.length > 0 && (
          <div className="pt-3 pb-1">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Workspaces
            </p>
            {organizations.map((org) => (
              <div key={org.id}>
                <button
                  onClick={() => toggleOrg(org.id)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-150" style={{ color: 'rgba(255,255,255,0.5)' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor='rgba(255,255,255,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor=''}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                    >
                      {org.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate">{org.name}</span>
                  </div>
                  {expandedOrgs[org.id]
                    ? <ChevronDownIcon className="w-3 h-3 shrink-0" />
                    : <ChevronRightIcon className="w-3 h-3 shrink-0" />
                  }
                </button>
                {expandedOrgs[org.id] && (
                  <Link
                    to={`/organizations/${org.id}/projects`}
                    className="flex items-center gap-2 pl-10 pr-3 py-1.5 text-xs rounded-lg transition-colors hover:bg-white/8" style={{ color: 'rgba(255,255,255,0.35)' }}
                  >
                    <FolderIcon className="w-3.5 h-3.5" />
                    View projects
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 space-y-0.5" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <NavLink to="/settings" className={navLinkClass}>
          <Cog6ToothIcon className="w-4 h-4" />
          Settings
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-red-500/15 hover:text-red-300" style={{ color: 'rgba(255,255,255,0.5)' }}
        >
          <ArrowLeftOnRectangleIcon className="w-4 h-4" />
          Sign out
        </button>

        {/* User avatar at bottom */}
        <div className="flex items-center gap-2.5 px-3 py-2 mt-1">
          <img
            src={user?.avatar_url}
            alt={user?.name}
            className="w-7 h-7 rounded-full object-cover"
          />
          <div className="min-w-0">
            <p className="text-xs font-medium truncate" style={{ color: 'rgba(255,255,255,0.75)' }}>{user?.name}</p>
            <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
