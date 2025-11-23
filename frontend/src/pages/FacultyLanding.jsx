import React from 'react'
import { useNavigate } from 'react-router-dom'

function FacultyLanding() {
  const navigate = useNavigate()

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
        <div className="grid md:grid-cols-2 gap-8">
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
        </div>
      </div>
    </div>
  )
}

export default FacultyLanding
