import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function StudentHome() {
  const navigate = useNavigate()
  const [team, setTeam] = useState(null)
  const [loading, setLoading] = useState(true)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login/student')
  }

  // carbon image used only for the Carbon card
  const carbonCardImage = new URL('../../images/carbon footprint.jpg', import.meta.url).href
  // embodied energy image used only for the Embodied Energy card
  const embodiedImage = new URL('../../images/embodied energy.jpeg', import.meta.url).href
  // bill of materials image used for the BOM card
  const bomImage = new URL('../../images/bill of materials.jpeg', import.meta.url).href
  const cards = [
    {
      title: 'Bill of Materials',
      description: 'Create, edit, and manage BOMs with detailed specifications',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z M13 3v5a2 2 0 002 2h5" />
        </svg>
      ),
      image: bomImage,
      path: '/student/bom',
      color: 'from-blue-600 to-blue-700'
    },
    {
      title: 'Carbon Footprinting',
      description: 'Calculate and track carbon emissions for your projects',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      image: carbonCardImage,
      path: '/student/carbon',
      color: 'from-green-600 to-green-700'
    },
    {
      title: 'Embodied Energy',
      description: 'Analyze embodied energy metrics for components and materials',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      image: embodiedImage,
      path: '/student/energy',
      color: 'from-orange-600 to-orange-700'
    }
  ]

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login/student')
      return
    }

    fetchTeamDetails()
  }, [navigate])

  const fetchTeamDetails = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:5000/api/student/team/details', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.success) {
        setTeam(response.data.team)
      }
    } catch (error) {
      console.error('Error fetching team details:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Hero Section - Dark half-banner */}
      <section className="relative overflow-hidden" style={{ height: 260 }}>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-800" />
        <div className="relative h-full max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">Student Dashboard</h1>
            <p className="text-md sm:text-lg text-slate-300">Manage your project materials, carbon footprint, and energy metrics</p>
          </div>
          <div className="flex items-center gap-3">
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
        </div>
      </section>

      {/* Cards Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {cards.map((card, index) => {
            const baseClasses = 'relative rounded-lg p-8 h-full text-white shadow-lg group-hover:shadow-2xl transition-shadow duration-300'
            const hasImage = Boolean(card.image)
            const style = hasImage
              ? {
                backgroundImage: `linear-gradient(rgba(2,6,23,0.62), rgba(2,6,23,0.38)), url('${card.image}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }
              : undefined

            const containerClasses = hasImage ? baseClasses : `${baseClasses} bg-gradient-to-br ${card.color}`

            return (
              <button
                key={index}
                onClick={() => navigate(card.path)}
                className="group text-left transform transition-all duration-300 hover:scale-105"
              >
                <div className={containerClasses} style={style}>
                  <div className="text-white mb-4 opacity-90">{card.icon}</div>
                  <h3 className="text-2xl font-bold mb-2">{card.title}</h3>
                  <p className="text-blue-50 text-sm leading-relaxed">{card.description}</p>
                  <div className="mt-4 inline-block px-3 py-1 bg-slate-900/80 text-white rounded-full text-sm shadow-sm">Click to Open →</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Team Details Section */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Your Team</h2>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading team details...</div>
        ) : !team ? (
          <div className="bg-white/60 backdrop-blur rounded-lg p-12 text-center border border-slate-200">
            <p className="text-slate-600 text-lg">You are not assigned to any team yet.</p>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur border border-slate-200 rounded-xl shadow-lg p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">{team.problemStatement}</h3>
                <p className="text-sm text-slate-500 mt-1">Team ID: {team._id}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600">Guide</p>
                <p className="font-semibold text-slate-900">{team.guide?.name}</p>
                <p className="text-xs text-slate-500">{team.guide?.email}</p>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <h4 className="text-lg font-semibold text-slate-800 mb-4">Team Members</h4>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {team.members?.map((member, idx) => (
                  <div key={member._id} className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{member.name}</p>
                      <p className="text-xs text-slate-500">{member.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentHome
