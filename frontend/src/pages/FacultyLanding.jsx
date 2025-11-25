import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth';

function FacultyLanding() {
  const navigate = useNavigate()
  const { logout } = useAuth();

  // Mock stats for now - replace with API call later
  const [teamStats, setTeamStats] = useState({
    total: 12,
    inProgress: 5,
    completed: 4,
    pending: 3
  });

  const handleLogout = () => {
    logout();
    navigate('/login/faculty');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden" style={{ height: 220 }}>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-800" />
        <div className="relative h-full max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1">Faculty Tools</h1>
            <p className="text-sm text-slate-300">Approve BOMs and create project teams for your students.</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <button
            onClick={() => navigate('/faculty/approve')}
            className="bg-white p-8 rounded-lg shadow-lg text-left hover:shadow-xl transition">
            <h3 className="text-xl font-bold mb-2">BOM Approval Queue</h3>
            <p className="text-sm text-gray-600">Review and approve Bill of Materials submitted by students.</p>
          </button>

          <button
            onClick={() => navigate('/faculty/team-create')}
            className="bg-white p-8 rounded-lg shadow-lg text-left hover:shadow-xl transition">
            <h3 className="text-xl font-bold mb-2">Create Team</h3>
            <p className="text-sm text-gray-600">Create project teams by adding members and assigning a project title.</p>
          </button>

          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">Team Progress</h3>
            <div className="space-y-4">
              {/* Total Teams */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Total Teams</span>
                  <span className="text-sm font-bold text-blue-600">{teamStats.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((teamStats.total / 10) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* In Progress */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">In Progress</span>
                  <span className="text-sm font-bold text-orange-600">{teamStats.inProgress}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all"
                    style={{ width: `${teamStats.total ? (teamStats.inProgress / teamStats.total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Completed */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Completed</span>
                  <span className="text-sm font-bold text-green-600">{teamStats.completed}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${teamStats.total ? (teamStats.completed / teamStats.total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Pending Approval */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Pending Approval</span>
                  <span className="text-sm font-bold text-red-600">{teamStats.pending}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((teamStats.pending / 10) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FacultyLanding
