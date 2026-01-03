import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function RoleSelection() {
  const [isVisible, setIsVisible] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const roles = [
    {
      title: 'Student',
      path: '/login/student',
      icon: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
        </svg>
      )
    },
    {
      title: 'Admin',
      path: '/login/admin',
      icon: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      title: 'Faculty',
      path: '/login/faculty',
      icon: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: 'Lab In-Charge',
      path: '/login/lab',
      icon: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      )
    }
  ]

  const handleRoleClick = (path) => {
    navigate(path)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-between p-20 relative">
      {/* Back to Home button (top-right) */}
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-white text-slate-900 rounded-md shadow-sm hover:bg-slate-100 transition-colors"
        >
          Back to Home
        </button>
      </div>
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/rh.jpg"
          alt="Campus Background"
          className="w-full h-full object-cover opacity-20"
        />
      </div>

      {/* Left Side - Role Selection */}
      <div className="relative z-10 w-full max-w-2xl">
        {/* Title Section */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to CEER Portal
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Select your role to continue
          </p>
          <p className="text-sm text-gray-500 tracking-wider">
            CENTER FOR ENGINEERING EDUCATION RESEARCH
          </p>
        </div>

        {/* Role Selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {roles.map((role, index) => (
            <button
              key={role.title}
              onClick={() => handleRoleClick(role.path)}
              className={`
                bg-white p-8 
                transition-all duration-300 ease-out
                shadow-lg hover:shadow-xl
                hover:scale-105 hover:-translate-y-1
                border border-gray-200 hover:border-gray-900
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
              `}
              style={{
                transitionDelay: `${index * 100}ms`
              }}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="text-gray-900 transition-transform duration-300">
                  {role.icon}
                </div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {role.title}
                </h2>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Side - Information Panel */}
      <div className="hidden lg:block w-full max-w-lg relative z-10 ml-20">
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-5xl font-bold text-gray-900">
              Portal<br />Access
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Choose your role to access the appropriate portal with specialized tools and resources.
            </p>
          </div>

          {/* <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Secure Access</h3>
                <p className="text-sm text-gray-600">Role-based authentication ensures data privacy</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Fast & Reliable</h3>
                <p className="text-sm text-gray-600">Quick access to all your academic resources</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Mobile Friendly</h3>
                <p className="text-sm text-gray-600">Access from any device, anywhere, anytime</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">24/7 Support</h3>
                <p className="text-sm text-gray-600">Get help whenever you need assistance</p>
              </div>
            </div>
          </div> */}

          {/* <div className="pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Need help? Contact us at <span className="text-gray-900 font-medium">support@ceer.edu</span>
            </p>
          </div> */}
        </div>
      </div>
    </div>
  )
}

export default RoleSelection
