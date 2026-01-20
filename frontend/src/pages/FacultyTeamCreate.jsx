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
  const [searchQuery, setSearchQuery] = useState('')

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
    setSearchQuery('')
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
      // Division filter
      const divisionMatch = divisionFilter === 'All' ||
        (divisionFilter === 'No Division' && !student.division) ||
        student.division === divisionFilter;

      // Search filter (name, email, USN)
      const searchMatch = !searchQuery ||
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.usn && student.usn.toLowerCase().includes(searchQuery.toLowerCase()));

      return divisionMatch && searchMatch;
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
    <div className="min-h-screen bg-slate-50">
      {/* Header Section */}
      <div className="max-w-5xl mx-auto px-6 py-5">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-12">
          <button
            onClick={() => navigate('/faculty')}
            className="px-6 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 hover:border-gray-400 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Page Title */}
        <div className="mb-16 md:mb-20 max-w-4xl">
          <p className="text-sm font-bold tracking-widest text-gray-500 uppercase mb-4">
            Team Management
          </p>
          <h2 className="text-2xl md:text-4xl lg:text-6xl font-serif font-medium leading-[1.1] tracking-tight mb-8" style={{ color: 'rgb(139, 21, 56)' }}>
            Create Project Team
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-3xl font-light">
            Assemble your team, define your project, and begin your journey.
          </p>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="max-w-5xl mx-auto px-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Project Info Section */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <h3 className="text-xl font-serif font-bold mb-6" style={{ color: 'rgb(139, 21, 56)' }}>
              Project Information
            </h3>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Problem Statement / Project Title</label>
              <input
                value={projectTitle}
                onChange={e => setProjectTitle(e.target.value)}
                placeholder="Enter problem statement"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[rgb(139,21,56)] focus:border-transparent transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Members Section */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-bold" style={{ color: 'rgb(139, 21, 56)' }}>
                Team Members
              </h3>
              <button
                type="button"
                onClick={openSelectionModal}
                className="px-6 py-2.5 text-sm font-medium text-white rounded-full transition-colors" style={{ backgroundColor: 'rgb(139, 21, 56)' }}
              >
                + Add Members
              </button>
            </div>

            {/* Members List */}
            {selectedStudents.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-slate-700 font-semibold mb-3">Selected Members ({selectedStudents.length})</p>
                {selectedStudents.map((m, idx) => (
                  <div key={m._id} className="flex items-center justify-between bg-slate-50 border border-slate-200 p-4 rounded-lg hover:border-slate-300 transition-all duration-200 group">
                    <div className="flex items-center gap-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold" style={{ backgroundColor: 'rgb(139, 21, 56)' }}>{idx + 1}</span>
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

          {/* Action Buttons */}
          <div className="flex items-center gap-4 pt-4 pb-8">
            <button
              type="submit"
              disabled={submitting}
              className={`flex-1 md:flex-none text-white font-bold py-3 px-8 rounded-full transition-all duration-200 shadow-lg transform hover:scale-105 ${submitting ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'}`}
              style={{ backgroundColor: 'rgb(139, 21, 56)' }}
            >
              {submitting ? 'Creating...' : 'Create Team'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/faculty')}
              className="px-8 py-3 bg-white border border-slate-300 text-slate-700 font-semibold rounded-full hover:bg-slate-50 transition-all duration-200 shadow-sm"
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
                <h3 className="text-xl font-serif font-bold" style={{ color: 'rgb(139, 21, 56)' }}>Select Team Members</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Division Filter */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
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

                {/* Search Input */}
                <div className="flex-1 w-full sm:w-auto">
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search by name, email, or USN..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-1.5 bg-white border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
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
