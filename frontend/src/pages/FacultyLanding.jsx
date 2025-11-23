import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function FacultyLanding() {
  const navigate = useNavigate()
  const [teamStats, setTeamStats] = useState({
    total: 0,
    inProgress: 0,
    completed: 0,
    pending: 0
  })

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('teams') || '[]')
    const boms = JSON.parse(localStorage.getItem('boms') || '[]')
    
    const stats = {
      total: stored.length,
      inProgress: stored.filter(t => t.status === 'in-progress').length,
      completed: stored.filter(t => t.status === 'completed').length,
      pending: boms.filter(b => !b.guideApproved).length
    }
    setTeamStats(stats)
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden" style={{ height: 220 }}>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-800" />
        <div className="relative h-full max-w-7xl mx-auto px-6 flex items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1">Faculty Tools</h1>
            <p className="text-sm text-slate-300">Approve BOMs and create project teams for your students.</p>
          </div>
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
