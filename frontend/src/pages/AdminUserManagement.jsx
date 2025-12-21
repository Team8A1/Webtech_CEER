import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function AdminUserManagement() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [filter, setFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', role: 'student', status: 'active', division: '' })

  useEffect(() => {
    // Ideally fetch from backend, but keeping mock list for now + new additions
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    setUsers(users)
  }, [])

  const getRoleBadgeColor = (role) => {
    const colors = {
      student: 'bg-blue-100 text-blue-800',
      faculty: 'bg-green-100 text-green-800',
      lab_instructor: 'bg-purple-100 text-purple-800',
      admin: 'bg-red-100 text-red-800'
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
  }

  const getStatusBadgeColor = (status) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
  }

  const filteredUsers = filter === 'all' ? users : users.filter(u => u.role === filter)

  const handleAddUser = async () => {
    if (formData.name && formData.email) {
      if (formData.role === 'student') {
        try {
          // Call Backend API for Students
          const response = await axios.post('http://localhost:8000/api/admin/register/students', {
            students: [{
              name: formData.name,
              email: formData.email,
              division: formData.division
            }]
          })

          if (response.data.success) {
            alert('Student registered successfully in backend!')
            // Update local mock list for display
            const newUser = {
              id: users.length + 1,
              ...formData,
              joinDate: new Date().toISOString().split('T')[0]
            }
            const updatedUsers = [...users, newUser]
            setUsers(updatedUsers)
            localStorage.setItem('users', JSON.stringify(updatedUsers))

            setFormData({ name: '', email: '', role: 'student', status: 'active', division: '' })
            setShowForm(false)
          }
        } catch (error) {
          console.error('Error registering student:', error)
          alert('Failed to register student: ' + (error.response?.data?.message || error.message))
        }
      } else {
        // Mock behavior for other roles for now
        const newUser = {
          id: users.length + 1,
          ...formData,
          joinDate: new Date().toISOString().split('T')[0]
        }
        setUsers([...users, newUser])
        localStorage.setItem('users', JSON.stringify([...users, newUser]))
        setFormData({ name: '', email: '', role: 'student', status: 'active', division: '' })
        setShowForm(false)
      }
    } else {
      alert('Please fill in Name and Email')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <button
            onClick={() => navigate('/admin')}
            className="mb-4 px-4 py-2 bg-white text-blue-900 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold mb-2">User Management</h1>
          <p className="text-blue-200">View, create, and manage system users</p>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Add User Section */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg border-2 border-blue-200 p-8 mb-8">
            <h3 className="text-2xl font-bold mb-6 text-blue-900">Add New User</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="lab_instructor">Lab Instructor</option>
                <option value="admin">Admin</option>
              </select>

              {formData.role === 'student' && (
                <select
                  value={formData.division}
                  onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Division</option>
                  <option value="A">Division A</option>
                  <option value="B">Division B</option>
                  <option value="C">Division C</option>
                </select>
              )}
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleAddUser}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Add User
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Filters and Add Button */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
                }`}
            >
              All ({users.length})
            </button>
            <button
              onClick={() => setFilter('student')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${filter === 'student' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
                }`}
            >
              Students ({users.filter(u => u.role === 'student').length})
            </button>
            <button
              onClick={() => setFilter('faculty')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${filter === 'faculty' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
                }`}
            >
              Faculty ({users.filter(u => u.role === 'faculty').length})
            </button>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              + Add User
            </button>
          )}
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-blue-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-900 to-blue-800 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Name</th>
                  <th className="px-6 py-4 text-left font-semibold">Email</th>
                  <th className="px-6 py-4 text-left font-semibold">Division</th>
                  <th className="px-6 py-4 text-left font-semibold">Role</th>
                  <th className="px-6 py-4 text-left font-semibold">Status</th>
                  <th className="px-6 py-4 text-left font-semibold">Join Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, idx) => (
                  <tr key={user.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                    <td className="px-6 py-4 font-semibold text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 text-gray-700">{user.email}</td>
                    <td className="px-6 py-4 text-gray-700">{user.division || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRoleBadgeColor(user.role)}`}>
                        {user.role.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeColor(user.status)}`}>
                        {user.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.joinDate}</td>
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

export default AdminUserManagement
