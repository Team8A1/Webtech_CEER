import { useState, useEffect } from 'react'

function LabLogin() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleLogin = (e) => {
    e.preventDefault()
    console.log('Lab login submitted')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-between p-20 relative">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/college.png" 
          alt="Campus Background" 
          className="w-full h-full object-cover opacity-20"
        />
      </div>
      
      {/* Left Side - Login Form */}
      <div className="w-full max-w-sm relative z-10">
        <div className="bg-white p-6 shadow-lg">
          {/* Logo */}
          {/* <div className="mb-6">
            <img 
              src="/images/logo.png" 
              alt="Logo" 
              className="h-10 w-auto object-contain"
            />
          </div> */}

          {/* Title */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Lab Login
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              Please enter your details
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label 
                htmlFor="username" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200"
                placeholder="Jonathan_Reichert07"
              />
            </div>

            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200"
                placeholder="••••••••••"
              />
            </div>

            <div className="text-right">
              <a 
                href="#" 
                className="text-sm font-medium text-gray-900 hover:text-gray-700 underline underline-offset-2 transition-colors duration-200"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3.5 transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
            >
              Sign In
            </button>
          </form>

          {/* Footer */}
          <div className="text-center mt-6">
            <span className="text-sm text-gray-600">Are you new? </span>
            <a 
              href="#" 
              className="text-sm font-medium text-gray-900 hover:text-gray-700 underline underline-offset-2 transition-colors duration-200"
            >
              Create an Account
            </a>
          </div>
        </div>
      </div>

      {/* Right Side - Welcome Panel */}
      <div className="hidden lg:block w-full max-w-lg relative z-10 ml-20">
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-5xl font-bold text-gray-900">
              Lab<br />Management
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Oversee laboratory facilities, equipment, and student activities.
            </p>
            <p className="text-sm text-gray-500 tracking-wider">
              CENTER FOR ENGINEERING EDUCATION RESEARCH
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gray-900 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Lab Scheduling</h3>
                <p className="text-sm text-gray-600">Manage lab sessions and bookings</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Equipment Tracking</h3>
                <p className="text-sm text-gray-600">Monitor and maintain lab equipment inventory</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Safety Protocols</h3>
                <p className="text-sm text-gray-600">Ensure compliance with safety standards</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LabLogin
