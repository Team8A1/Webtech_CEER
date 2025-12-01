import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function FacultyTeamCreate() {
  const navigate = useNavigate()
  const [projectTitle, setProjectTitle] = useState('')
  const [availableStudents, setAvailableStudents] = useState([])
  const [selectedStudents, setSelectedStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAvailableStudents()
  }, [])

  const fetchAvailableStudents = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:5000/api/faculty/team/students', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.success) {
        setAvailableStudents(response.data.students)
      }
    } catch (err) {
      console.error('Error fetching students:', err)
      setError('Failed to load students')
    } finally {
      setLoading(false)
    }
  }

  const handleStudentSelect = (e) => {
    const studentId = e.target.value
    if (!studentId) return

    const student = availableStudents.find(s => s._id === studentId)
    if (student && !selectedStudents.find(s => s._id === studentId)) {
      setSelectedStudents([...selectedStudents, student])
      // Remove from available list temporarily to avoid double selection
      setAvailableStudents(availableStudents.filter(s => s._id !== studentId))
    }
    e.target.value = '' // Reset dropdown
  }

  const removeMember = (studentId) => {
    const student = selectedStudents.find(s => s._id === studentId)
    if (student) {
      setSelectedStudents(selectedStudents.filter(s => s._id !== studentId))
      setAvailableStudents([...availableStudents, student])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!projectTitle || selectedStudents.length === 0) {
      return alert('Please provide project title and at least one member.')
    }

    setSubmitting(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        'http://localhost:5000/api/faculty/team/create',
        {
          teamName: projectTitle, // Using project title as team name for now
          problemStatement: projectTitle,
          members: selectedStudents.map(s => s._id)
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      if (response.data.success) {
        alert('Team created successfully!')
        navigate('/faculty')
      }
    } catch (err) {
      console.error('Error creating team:', err)
      setError(err.response?.data?.message || 'Failed to create team')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="p-6">Loading...</div>

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
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Project Info Section */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-300/30 to-cyan-300/30 rounded-xl blur"></div>
            <div className="relative bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                <span className="w-1 h-7 bg-gradient-to-b from-blue-500 to-blue-600 rounded mr-3"></span>
                Project Information
              </h2>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Problem Statement / Project Title</label>
                <input
                  value={projectTitle}
                  onChange={e => setProjectTitle(e.target.value)}
                  placeholder="Enter problem statement"
                  className="w-full bg-slate-50 border border-slate-300/50 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
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

              {/* Add Member Dropdown */}
              <div className="bg-slate-50 rounded-lg p-6 border border-slate-200/50 mb-6">
                <p className="text-sm text-slate-700 mb-4 font-semibold">Select students to add to the team</p>
                <select
                  onChange={handleStudentSelect}
                  className="w-full bg-white border border-slate-300/50 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  defaultValue=""
                >
                  <option value="" disabled>Select a student...</option>
                  {availableStudents.map(student => (
                    <option key={student._id} value={student._id}>
                      {student.name} ({student.email})
                    </option>
                  ))}
                </select>
                {availableStudents.length === 0 && (
                  <p className="text-xs text-orange-500 mt-2">No available students found (or all are already assigned).</p>
                )}
              </div>

              {/* Members List */}
              {selectedStudents.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-slate-700 font-semibold mb-3">Selected Members ({selectedStudents.length})</p>
                  {selectedStudents.map((m, idx) => (
                    <div key={m._id} className="flex items-center justify-between bg-gradient-to-r from-slate-100 to-slate-50 border border-slate-300/50 p-4 rounded-lg hover:border-slate-400 transition-all duration-200 group">
                      <div className="flex items-center gap-4">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm font-bold">{idx + 1}</span>
                        <div>
                          <p className="text-slate-900 font-semibold">{m.name}</p>
                          <p className="text-xs text-slate-500">{m.email}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMember(m._id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
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
              disabled={submitting}
              className={`flex-1 md:flex-none bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-green-500/50 transform hover:scale-105 ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {submitting ? 'Creating...' : 'Create Team'}
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
