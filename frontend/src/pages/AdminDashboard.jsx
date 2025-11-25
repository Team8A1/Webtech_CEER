import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBOMs: 0,
    totalTeams: 0,
    pendingApprovals: 0,
    approvedBOMs: 0,
    rejectedBOMs: 0
  })

  useEffect(() => {
    const boms = JSON.parse(localStorage.getItem('boms') || '[]')
    const teams = JSON.parse(localStorage.getItem('teams') || '[]')
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    
    setStats({
      totalUsers: users.length,
      totalBOMs: boms.length,
      totalTeams: teams.length,
      pendingApprovals: boms.filter(b => !b.guideApproved && !b.labApproved).length,
      approvedBOMs: boms.filter(b => b.guideApproved && b.labApproved).length,
      rejectedBOMs: boms.filter(b => b.status === 'rejected').length
    })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-slate-300">Manage users, BOMs, and system analytics</p>
        </div>
      </section>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-4 mb-12">
          <div className="bg-white rounded-lg shadow-md border-l-4 border-blue-600 p-6">
            <div className="text-3xl font-bold text-blue-600">{stats.totalUsers}</div>
            <div className="text-sm text-gray-600 font-semibold mt-2">Total Users</div>
          </div>
          <div className="bg-white rounded-lg shadow-md border-l-4 border-green-600 p-6">
            <div className="text-3xl font-bold text-green-600">{stats.totalBOMs}</div>
            <div className="text-sm text-gray-600 font-semibold mt-2">Total BOMs</div>
          </div>
          <div className="bg-white rounded-lg shadow-md border-l-4 border-purple-600 p-6">
            <div className="text-3xl font-bold text-purple-600">{stats.totalTeams}</div>
            <div className="text-sm text-gray-600 font-semibold mt-2">Total Teams</div>
          </div>
        </div>

        {/* Main Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* User Management Card */}
          <button
            onClick={() => navigate('/admin/users')}
            className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-lg hover:shadow-xl transition-all border-2 border-blue-200 p-8 text-left group"
          >
            <h3 className="text-2xl font-bold text-blue-900 mb-2">User Management</h3>
            <p className="text-blue-700 mb-4">Manage all system users, roles, and permissions</p>
            <div className="flex items-center text-blue-600 font-semibold">
              <span>View Details</span>
              <span className="ml-2 group-hover:ml-3 transition-all">→</span>
            </div>
          </button>

          {/* BOM Analytics Card */}
          <button
            onClick={() => navigate('/admin/bom-analytics')}
            className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-lg hover:shadow-xl transition-all border-2 border-green-200 p-8 text-left group"
          >
            <h3 className="text-2xl font-bold text-green-900 mb-2">BOM Analytics</h3>
            <p className="text-green-700 mb-4">Track BOMs, approvals, and statistics</p>
            <div className="flex items-center text-green-600 font-semibold">
              <span>View Analytics</span>
              <span className="ml-2 group-hover:ml-3 transition-all">→</span>
            </div>
          </button>

          {/* System Stats Card */}
          <button
            onClick={() => navigate('/admin/system-stats')}
            className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-lg hover:shadow-xl transition-all border-2 border-purple-200 p-8 text-left group"
          >
            <h3 className="text-2xl font-bold text-purple-900 mb-2">System Statistics</h3>
            <p className="text-purple-700 mb-4">View system performance and metrics</p>
            <div className="flex items-center text-purple-600 font-semibold">
              <span>View Stats</span>
              <span className="ml-2 group-hover:ml-3 transition-all">→</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
