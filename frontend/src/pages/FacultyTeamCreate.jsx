import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function FacultyTeamCreate() {
  const navigate = useNavigate()
  const [memberName, setMemberName] = useState('')
  const [usn, setUsn] = useState('')
  const [divv, setDivv] = useState('')
  const [projectTitle, setProjectTitle] = useState('')
  const [guideName, setGuideName] = useState('')
  const [members, setMembers] = useState([])

  const addMember = () => {
    if (!memberName) return
    setMembers(prev => [...prev, { name: memberName, usn, div: divv }])
    setMemberName('')
    setUsn('')
    setDivv('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!projectTitle || !guideName || members.length === 0) return alert('Please provide project title, guide name and at least one member.')

    const stored = JSON.parse(localStorage.getItem('teams') || '[]')
    const team = {
      id: Date.now().toString(),
      projectTitle,
      guideName,
      members,
      guideApproved: false,
      createdAt: new Date().toISOString()
    }
    stored.push(team)
    localStorage.setItem('teams', JSON.stringify(stored))
    // navigate back to faculty landing
    navigate('/faculty')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto mb-12">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-2xl blur-xl"></div>
          <div className="relative bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-2xl p-8 shadow-lg">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">Create Project Team</h1>
            <p className="text-slate-600 text-lg">Assemble your team, define your project, and begin your journey</p>
          </div>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="max-w-5xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Project Info Section */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-300/30 to-cyan-300/30 rounded-xl blur"></div>
            <div className="relative bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                <span className="w-1 h-7 bg-gradient-to-b from-blue-500 to-blue-600 rounded mr-3"></span>
                Project Information
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Project Title</label>
                  <input
                    value={projectTitle}
                    onChange={e => setProjectTitle(e.target.value)}
                    placeholder="Enter project name"
                    className="w-full bg-slate-50 border border-slate-300/50 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Guide Name</label>
                  <input
                    value={guideName}
                    onChange={e => setGuideName(e.target.value)}
                    placeholder="Enter guide name"
                    className="w-full bg-slate-50 border border-slate-300/50 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Members Section */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-300/30 to-pink-300/30 rounded-xl blur"></div>
            <div className="relative bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                <span className="w-1 h-7 bg-gradient-to-b from-purple-500 to-pink-600 rounded mr-3"></span>
                Team Members
              </h2>

              {/* Add Member Form */}
              <div className="bg-slate-50 rounded-lg p-6 border border-slate-200/50 mb-6">
                <p className="text-sm text-slate-700 mb-4 font-semibold">Add a new member to the team</p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input
                    placeholder="Full Name"
                    value={memberName}
                    onChange={e => setMemberName(e.target.value)}
                    className="bg-white border border-slate-300/50 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  />
                  <input
                    placeholder="USN"
                    value={usn}
                    onChange={e => setUsn(e.target.value)}
                    className="bg-white border border-slate-300/50 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  />
                  <input
                    placeholder="Division"
                    value={divv}
                    onChange={e => setDivv(e.target.value)}
                    className="bg-white border border-slate-300/50 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={addMember}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold rounded-lg px-4 py-2 transition-all duration-200 shadow-lg hover:shadow-purple-500/50 transform hover:scale-105"
                  >
                    Add Member
                  </button>
                </div>
              </div>

              {/* Members List */}
              {members.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-slate-700 font-semibold mb-3">Team Members ({members.length})</p>
                  {members.map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gradient-to-r from-slate-100 to-slate-50 border border-slate-300/50 p-4 rounded-lg hover:border-slate-400 transition-all duration-200 group">
                      <div className="flex items-center gap-4">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm font-bold">{idx + 1}</span>
                        <div>
                          <p className="text-slate-900 font-semibold">{m.name}</p>
                          <p className="text-xs text-slate-500">{m.usn} • {m.div}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 pt-4 pb-8">
            <button
              type="submit"
              className="flex-1 md:flex-none bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-green-500/50 transform hover:scale-105"
            >
              Create Team
            </button>
            <button
              type="button"
              onClick={() => navigate('/faculty')}
              className="px-8 py-3 bg-white/60 border border-slate-300/50 text-slate-700 font-semibold rounded-lg hover:bg-white/80 transition-all duration-200 shadow-md"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FacultyTeamCreate
