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

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [divisionFilter, setDivisionFilter] = useState('All')
  const [tempSelectedIds, setTempSelectedIds] = useState(new Set())

  useEffect(() => {
    fetchAvailableStudents()
  }, [])

  const fetchAvailableStudents = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:8000/api/faculty/team/students', {
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

  const openSelectionModal = () => {
    setTempSelectedIds(new Set(selectedStudents.map(s => s._id)))
    setDivisionFilter('All')
    setIsModalOpen(true)
  }

  const toggleStudentSelection = (studentId) => {
    const newSelection = new Set(tempSelectedIds)
    if (newSelection.has(studentId)) {
      newSelection.delete(studentId)
    } else {
      newSelection.add(studentId)
    }
    setTempSelectedIds(newSelection)
  }

  const confirmSelection = () => {
    const selected = availableStudents.filter(s => tempSelectedIds.has(s._id))
    setSelectedStudents(selected)
    setIsModalOpen(false)
  }

  const removeMember = (studentId) => {
    setSelectedStudents(selectedStudents.filter(s => s._id !== studentId))
  }

  const getFilteredStudents = () => {
    return availableStudents.filter(student => {
      if (divisionFilter === 'All') return true
      if (divisionFilter === 'No Division') return !student.division
      return student.division === divisionFilter
    })
  }

  // Calculate unique divisions from available students
  const uniqueDivisions = ['All', ...new Set(availableStudents.map(s => s.division).filter(Boolean)), 'No Division']

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
        'http://localhost:8000/api/faculty/team/create',
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
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                  <span className="w-1 h-7 bg-gradient-to-b from-purple-500 to-pink-600 rounded mr-3"></span>
                  Team Members
                </h2>
                <button
                  type="button"
                  onClick={openSelectionModal}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  + Add Members
                </button>
              </div>

              {/* Members List */}
              {selectedStudents.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-slate-700 font-semibold mb-3">Selected Members ({selectedStudents.length})</p>
                  {selectedStudents.map((m, idx) => (
                    <div key={m._id} className="flex items-center justify-between bg-gradient-to-r from-slate-100 to-slate-50 border border-slate-300/50 p-4 rounded-lg hover:border-slate-400 transition-all duration-200 group">
                      <div className="flex items-center gap-4">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm font-bold">{idx + 1}</span>
                        <div>
                          <p className="text-slate-900 font-semibold">{m.name}</p>
                          <p className="text-xs text-slate-500">{m.email} {m.division && <span className="bg-slate-200 px-1 rounded text-[10px] ml-1">{m.division}</span>}</p>
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
              ) : (
                <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                  No members selected. Click "Add Members" to start.
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

      {/* Student Selection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-200 bg-slate-50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-800">Select Team Members</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Division Filter */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-slate-600">Filter by Division:</label>
                <select
                  value={divisionFilter}
                  onChange={(e) => setDivisionFilter(e.target.value)}
                  className="bg-white border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {uniqueDivisions.map(div => (
                    <option key={div} value={div}>{div}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              <div className="space-y-1">
                {getFilteredStudents().length > 0 ? (
                  getFilteredStudents().map(student => (
                    <label key={student._id} className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${tempSelectedIds.has(student._id) ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50 border border-transparent'}`}>
                      <input
                        type="checkbox"
                        checked={tempSelectedIds.has(student._id)}
                        onChange={() => toggleStudentSelection(student._id)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 mr-4"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">{student.name}</div>
                        <div className="text-sm text-slate-500">
                          {student.email}
                          {student.division && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">Div: {student.division}</span>}
                        </div>
                      </div>
                    </label>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-500">
                    No students found for this division.
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-slate-600 font-medium hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmSelection}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
              >
                Add Details ({tempSelectedIds.size})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FacultyTeamCreate
