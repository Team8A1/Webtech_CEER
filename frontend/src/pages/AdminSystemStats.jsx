import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function AdminSystemStats() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalTeams: 0,
    activeTeams: 0,
    completedTeams: 0,
    completionRate: 0,
    facultyPending: 0,
    labPending: 0,
    systemHealth: 98
  })

  const [departmentStats, setDepartmentStats] = useState([])
  const [facultyWorkload, setFacultyWorkload] = useState([])

  useEffect(() => {
    const teams = JSON.parse(localStorage.getItem('teams') || '[]')
    const boms = JSON.parse(localStorage.getItem('boms') || '[]')

    const active = teams.filter(t => t.status === 'in-progress').length
    const completed = teams.filter(t => t.status === 'completed').length
    const completionRate = teams.length ? Math.round((completed / teams.length) * 100) : 0

    // Calculate department stats from teams
    const depts = {}
    teams.forEach(team => {
      const dept = team.department || 'General'
      depts[dept] = depts[dept] || { teams: 0, completed: 0 }
      depts[dept].teams++
      if (team.status === 'completed') depts[dept].completed++
    })

    const departmentData = Object.entries(depts).map(([name, data]) => ({
      dept: name,
      teams: data.teams,
      completion: data.teams ? Math.round((data.completed / data.teams) * 100) : 0
    }))

    // Calculate faculty workload from BOMs
    const facultyWork = {}
    boms.forEach(bom => {
      const faculty = bom.guide || 'Unassigned'
      facultyWork[faculty] = facultyWork[faculty] || { pending: 0, approved: 0 }
      if (bom.guideApproved) {
        facultyWork[faculty].approved++
      } else {
        facultyWork[faculty].pending++
      }
    })

    const facultyData = Object.entries(facultyWork).map(([name, data]) => ({
      name,
      pending: data.pending,
      approved: data.approved
    }))

    setDepartmentStats(departmentData)
    setFacultyWorkload(facultyData)
    setStats({
      totalTeams: teams.length,
      activeTeams: active,
      completedTeams: completed,
      completionRate,
      facultyPending: boms.filter(b => !b.guideApproved).length,
      labPending: boms.filter(b => !b.labApproved).length,
      systemHealth: 98
    })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <button
            onClick={() => navigate('/admin')}
            className="mb-4 px-4 py-2 bg-white text-purple-900 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold mb-2">System Statistics</h1>
          <p className="text-purple-200">View system performance and team metrics</p>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Key Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-lg border-2 border-purple-200 p-6">
            <div className="text-3xl font-bold text-purple-700">{stats.totalTeams}</div>
            <div className="text-sm text-purple-600 font-semibold mt-2">Total Teams</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-lg border-2 border-blue-200 p-6">
            <div className="text-3xl font-bold text-blue-700">{stats.activeTeams}</div>
            <div className="text-sm text-blue-600 font-semibold mt-2">Active Teams</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-lg border-2 border-green-200 p-6">
            <div className="text-3xl font-bold text-green-700">{stats.completedTeams}</div>
            <div className="text-sm text-green-600 font-semibold mt-2">Completed Teams</div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow-lg border-2 border-orange-200 p-6">
            <div className="text-3xl font-bold text-orange-700">{stats.systemHealth}%</div>
            <div className="text-sm text-orange-600 font-semibold mt-2">System Health</div>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-lg border-2 border-purple-200 p-8">
            <h3 className="text-2xl font-bold text-purple-900 mb-6">Pending Approvals</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-gray-700">Faculty Review</span>
                  <span className="font-bold text-blue-600">{stats.facultyPending} pending</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full"
                    style={{ width: `${Math.min((stats.facultyPending / 20) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-gray-700">Lab Review</span>
                  <span className="font-bold text-purple-600">{stats.labPending} pending</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-purple-600 h-3 rounded-full"
                    style={{ width: `${Math.min((stats.labPending / 20) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Team Completion Rate */}
          <div className="bg-white rounded-lg shadow-lg border-2 border-purple-200 p-8">
            <h3 className="text-2xl font-bold text-purple-900 mb-6">Team Completion Rate</h3>
            <div className="flex items-center justify-center">
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="10"
                    strokeDasharray={`${stats.completionRate * 2.83} 283`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600">{stats.completionRate}%</div>
                    <div className="text-sm text-gray-600 font-semibold">Complete</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Department Stats */}
        <div className="bg-white rounded-lg shadow-lg border-2 border-purple-200 p-8 mb-12">
          <h3 className="text-2xl font-bold text-purple-900 mb-8">Department Statistics</h3>
          <div className="space-y-6">
            {departmentStats.map((dept, idx) => (
              <div key={idx}>
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-gray-700">{dept.dept}</span>
                  <span className="font-bold text-purple-600">{dept.teams} teams • {dept.completion}% complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-purple-600 h-3 rounded-full transition-all"
                    style={{ width: `${dept.completion}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Faculty Workload */}
        <div className="bg-white rounded-lg shadow-lg border-2 border-purple-200 p-8">
          <h3 className="text-2xl font-bold text-purple-900 mb-8">Faculty Workload Distribution</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-900 to-purple-800 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Faculty Name</th>
                  <th className="px-6 py-4 text-left font-semibold">Pending Approvals</th>
                  <th className="px-6 py-4 text-left font-semibold">Approved</th>
                  <th className="px-6 py-4 text-left font-semibold">Workload</th>
                </tr>
              </thead>
              <tbody>
                {facultyWorkload.map((faculty, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-purple-50'}>
                    <td className="px-6 py-4 font-semibold text-gray-900">{faculty.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-bold">
                        {faculty.pending}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold">
                        {faculty.approved}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${(faculty.pending / (faculty.pending + faculty.approved)) * 100}%` }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSystemStats
