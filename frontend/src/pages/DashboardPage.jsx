import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { organizationsApi } from '../api/organizations'
import { format } from 'date-fns'
import Spinner from '../components/ui/Spinner'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'

export default function DashboardPage() {
  const { user } = useAuth()
  const [organizations, setOrganizations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    organizationsApi.list()
      .then(({ data }) => setOrganizations(data.data || data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const totalProjects = organizations.reduce((acc, o) => acc + (o.projects_count || 0), 0)
  const totalMembers = organizations.reduce((acc, o) => acc + (o.members?.length || 0), 0)

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Welcome banner */}
      <div className="animate-fade-in-up rounded-2xl px-8 py-6 flex items-center justify-between bg-white border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#003148' }}>
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <div className="hidden sm:flex items-center justify-center w-14 h-14 rounded-2xl" style={{ backgroundColor: 'rgba(0,49,72,0.07)' }}>
          <svg className="w-7 h-7" style={{ color: '#003148' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<OrgIcon />}
          label="Organizations"
          value={organizations.length}
          delay="delay-100"
        />
        <StatCard
          icon={<ProjectIcon />}
          label="Total Projects"
          value={totalProjects}
          delay="delay-200"
        />
        <StatCard
          icon={<MemberIcon />}
          label="Team Members"
          value={totalMembers}
          delay="delay-300"
        />
      </div>

      {/* Organizations */}
      <div className="animate-fade-in-up delay-300 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Your Organizations</h2>
          <Link
            to="/organizations"
            className="text-sm font-medium hover:underline transition-colors"
            style={{ color: '#003148' }}
          >
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : organizations.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-2">🏢</div>
            <p className="text-sm">No organizations yet.</p>
            <Link
              to="/organizations"
              className="text-sm mt-2 inline-block hover:underline font-medium"
              style={{ color: '#003148' }}
            >
              Create your first organization
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {organizations.slice(0, 5).map((org) => (
              <li
                key={org.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: '#003148' }}
                  >
                    {org.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{org.name}</p>
                    <p className="text-xs text-gray-400">
                      {org.projects_count || 0} project{org.projects_count !== 1 ? 's' : ''} · {org.members?.length || 0} members
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={org.my_role === 'owner' ? 'blue' : 'gray'}>
                    {org.my_role}
                  </Badge>
                  <Link
                    to={`/organizations/${org.id}/projects`}
                    className="text-sm font-medium hover:underline transition-colors"
                    style={{ color: '#003148' }}
                  >
                    Open →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, delay }) {
  return (
    <div className={`animate-fade-in-up ${delay} bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow`}>
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: 'rgba(0,49,72,0.07)', color: '#003148' }}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold" style={{ color: '#003148' }}>{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  )
}

const OrgIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
)
const ProjectIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
)
const MemberIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)
