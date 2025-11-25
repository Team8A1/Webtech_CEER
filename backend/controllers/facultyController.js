import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';

function FacultyLogin() {
  const [isVisible, setIsVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth();

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/faculty/login', { email, password });
      login(response.data.token, response.data.user);
      navigate('/faculty');
    } catch (error) {
      setError('Login failed. Please try again.')
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await api.post('/faculty/google-login', {
        credential: credentialResponse.credential,
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/faculty/dashboard');
    } catch (error) {
      console.error('Google login error:', error);
      
      // Extract the error message from the server response
      const errorMessage = error.response?.data?.message || 'Google login failed. Please try again.';
      
      // Check for specific error codes
      if (error.response?.status === 403) {
        setError('Access denied. Please ensure you are registered in the system.');
      } else if (error.response?.data?.needsApproval) {
        setError('Account created successfully! Please wait for admin approval before logging in.');
      } else {
        setError(errorMessage);
      }
      
      console.log('Error details:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        data: error.response?.data
      });
    }
  }

  const handleGoogleError = () => {
    setError('Google Sign-In failed. Please try again.')
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
              Faculty Login
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              Please enter your details
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200"
                placeholder="faculty@kletech.ac.in"
                required
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200"
                placeholder="••••••••••"
                required
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
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3.5 transition-all duration-200 hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Google Sign-In Button */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="large"
              text="continue_with"
              shape="rectangular"
              width="384"
            />
          </div>

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
              Faculty<br />Portal
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Manage your courses, students, and academic activities efficiently.
            </p>
            <p className="text-sm text-gray-500 tracking-wider">
              CENTER FOR ENGINEERING EDUCATION RESEARCH
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Course Management</h3>
                <p className="text-sm text-gray-600">Create and manage course content and schedules</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Grade Students</h3>
                <p className="text-sm text-gray-600">Evaluate and grade student submissions</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Schedule Classes</h3>
                <p className="text-sm text-gray-600">Organize and view your teaching schedule</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FacultyLogin