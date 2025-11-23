import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

function FacultyApprove() {
  const [boms, setBoms] = useState([])
  const [filter, setFilter] = useState('pending') // pending, approved, all
  const navigate = useNavigate()
  const previousPendingCountRef = useRef(0)
  const voicePlayedRef = useRef(false)

  const playNotificationSound = () => {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  }

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('boms') || '[]')
    const currentPendingCount = stored.filter(b => !b.guideApproved).length
    
    // Play gentle reminder voice only once if there are pending BOMs
    if (currentPendingCount > 0 && !voicePlayedRef.current) {
      const utterance = new SpeechSynthesisUtterance('Gentle reminder, please approve the request')
      utterance.rate = 0.9
      utterance.pitch = 1.5
      const voices = window.speechSynthesis.getVoices()
      const femaleVoice = voices.find(voice => voice.name.includes('Female') || voice.name.includes('woman') || voice.name.includes('female'))
      if (femaleVoice) utterance.voice = femaleVoice
      window.speechSynthesis.speak(utterance)
      voicePlayedRef.current = true
    }
    
    previousPendingCountRef.current = currentPendingCount
    setBoms(stored)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const stored = JSON.parse(localStorage.getItem('boms') || '[]')
      const currentPendingCount = stored.filter(b => !b.guideApproved).length
      
      // Play sound if new pending BOMs appeared
      if (currentPendingCount > previousPendingCountRef.current && currentPendingCount > 0) {
        playNotificationSound()
      }
      
      previousPendingCountRef.current = currentPendingCount
      setBoms(stored)
    }, 3000) // Check every 3 seconds

    return () => clearInterval(interval)
  }, [])

  const approve = (id) => {
    const stored = JSON.parse(localStorage.getItem('boms') || '[]')
    const updated = stored.map(b => b.id === id ? { ...b, guideApproved: true, guideApprovedAt: new Date().toISOString() } : b)
    localStorage.setItem('boms', JSON.stringify(updated))
    setBoms(updated)
  }

  const getFilteredBOMs = () => {
    if (filter === 'pending') return boms.filter(b => !b.guideApproved)
    if (filter === 'approved') return boms.filter(b => b.guideApproved)
    return boms
  }

  const filteredBoms = getFilteredBOMs()
  const pendingCount = boms.filter(b => !b.guideApproved).length
  const approvedCount = boms.filter(b => b.guideApproved).length

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Guide Approval Queue</h1>
              <p className="text-slate-300">Review and approve BOMs for your students</p>
            </div>
            <button
              onClick={() => navigate('/faculty')}
              className="px-6 py-2 bg-white text-slate-900 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
            >
              ← Back to Faculty
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-lg p-4 border border-white border-opacity-20">
              <div className="text-3xl font-bold text-blue-300">{boms.length}</div>
              <div className="text-sm text-gray-800 font-semibold">Total BOMs</div>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-lg p-4 border border-white border-opacity-20">
              <div className="text-3xl font-bold text-yellow-300">{pendingCount}</div>
              <div className="text-sm text-gray-800 font-semibold">Pending Review</div>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-lg p-4 border border-white border-opacity-20">
              <div className="text-3xl font-bold text-green-300">{approvedCount}</div>
              <div className="text-sm text-gray-800 font-semibold">Approved</div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Filter Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setFilter('pending')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              filter === 'pending'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              filter === 'approved'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Approved ({approvedCount})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              filter === 'all'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            All ({boms.length})
          </button>
        </div>

        {/* BOM Cards */}
        {filteredBoms.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">✓</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">All BOMs Reviewed!</h3>
            <p className="text-gray-600">
              {filter === 'pending' ? 'No pending BOMs for approval.' : `No ${filter} BOMs to display.`}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredBoms.map((bom, idx) => (
              <div
                key={bom.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden"
              >
                <div className="flex items-stretch">
                  {/* Left Status Indicator */}
                  <div className={`w-1 ${bom.guideApproved ? 'bg-green-500' : 'bg-yellow-500'}`}></div>

                  {/* Main Content */}
                  <div className="flex-1 p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Left Column - BOM Details */}
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">{bom.partName || 'Unnamed Part'}</h3>

                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <span className="text-sm font-semibold text-gray-600">Serial Number:</span>
                            <span className="text-sm text-gray-900 font-medium">{bom.slNo}</span>
                          </div>
                          <div className="flex justify-between items-start">
                            <span className="text-sm font-semibold text-gray-600">Sprint:</span>
                            <span className="text-sm text-gray-900 font-medium">{bom.sprintNo}</span>
                          </div>
                          <div className="flex justify-between items-start">
                            <span className="text-sm font-semibold text-gray-600">Date:</span>
                            <span className="text-sm text-gray-900 font-medium">{bom.date}</span>
                          </div>
                          <div className="flex justify-between items-start">
                            <span className="text-sm font-semibold text-gray-600">Quantity:</span>
                            <span className="text-sm text-gray-900 font-medium">{bom.qty}</span>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="text-xs text-gray-600">
                            Created: {new Date(bom.createdAt).toLocaleDateString()} at {new Date(bom.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>

                      {/* Right Column - Material & Status */}
                      <div>
                        <div className="space-y-4">
                          <div>
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Consumable Name</label>
                            <p className="text-sm text-gray-900 mt-1">{bom.consumableName}</p>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Specification</label>
                            <p className="text-sm text-gray-900 mt-1 bg-gray-50 p-2 rounded">{bom.specification}</p>
                          </div>
                        </div>

                        {/* Approval Status */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-gray-600">Guide Approval:</span>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                bom.guideApproved
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {bom.guideApproved ? '✓ Approved' : '⏳ Pending'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-gray-600">Lab Approval:</span>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                bom.labApproved
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {bom.labApproved ? '✓ Approved' : '⏳ Pending'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center px-6 py-4 border-l border-gray-200 bg-gray-50">
                    {!bom.guideApproved ? (
                      <button
                        onClick={() => approve(bom.id)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                      >
                        ✓ Approve
                      </button>
                    ) : (
                      <div className="text-center">
                        <div className="text-3xl mb-2">✓</div>
                        <span className="text-xs font-semibold text-green-700">Approved</span>
                        <div className="text-xs text-gray-600 mt-1">
                          {new Date(bom.guideApprovedAt).toLocaleDateString()}
                        </div>
                      </div>
                    )}
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

export default FacultyApprove
