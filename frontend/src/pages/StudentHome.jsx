import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
function StudentHome() {
  const navigate = useNavigate()

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

  const [teams, setTeams] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login/student')
      return
    }
    
    const stored = JSON.parse(localStorage.getItem('teams') || '[]')
    setTeams(stored)
  }, [navigate])

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

      {/* Teams created (visible after guide creates team) */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Your Teams</h2>
        {teams.length === 0 ? (
          <div className="bg-white/60 backdrop-blur rounded-lg p-12 text-center border border-slate-200">
            <p className="text-slate-600 text-lg">No teams created yet. Teams will appear here once they are created.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {teams.map(t => (
              <div key={t.id} className="bg-white/80 backdrop-blur border border-slate-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 group">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{t.projectTitle}</h3>
                    <p className="text-sm text-slate-600 mt-1">Guide: <span className="font-semibold text-slate-700">{t.guideName}</span></p>
                  </div>
                  
                  <div className="border-t border-slate-200 pt-4">
                    <p className="text-sm font-semibold text-slate-700 mb-3">Team Members ({t.members?.length || 0})</p>
                    <div className="space-y-2">
                      {t.members?.map((m, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">{idx + 1}</div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{m.name}</p>
                            <p className="text-xs text-slate-500">{m.usn} • {m.div}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentHome
