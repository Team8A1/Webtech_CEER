import { useState, useEffect } from 'react'

function AdminLogin() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleLogin = (e) => {
    e.preventDefault()
    console.log('Admin login submitted')
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
              Admin Login
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
              Admin<br />Dashboard
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Manage the entire system with comprehensive administrative tools.
            </p>
            <p className="text-sm text-gray-500 tracking-wider">
              CENTER FOR ENGINEERING EDUCATION RESEARCH
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">User Management</h3>
                <p className="text-sm text-gray-600">Control user accounts and permissions</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Analytics & Reports</h3>
                <p className="text-sm text-gray-600">View detailed system analytics and insights</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">System Settings</h3>
                <p className="text-sm text-gray-600">Configure system-wide preferences</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
