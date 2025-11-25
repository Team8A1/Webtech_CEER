import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth';

function LabApprove() {
  const [boms, setBoms] = useState([])
  const navigate = useNavigate()
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await api.post('/lab/logout');
      logout('lab');
    } catch (error) {
      logout('lab');
    }
  }

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('boms') || '[]')
    setBoms(stored)
  }, [])

  const approve = (id) => {
    const stored = JSON.parse(localStorage.getItem('boms') || '[]')
    const updated = stored.map(b => b.id === id ? { ...b, labApproved: true, labApprovedAt: new Date().toISOString() } : b)
    localStorage.setItem('boms', JSON.stringify(updated))
    setBoms(updated)
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Lab Instructor Approval Queue</h2>
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

      <div className="space-y-4">
        {boms.length === 0 && <div>No BOM entries yet.</div>}
        {boms.map(b => (
          <div key={b.id} className="p-4 bg-white rounded shadow flex justify-between items-center">
            <div>
              <div className="font-semibold">{b.partName || 'Unnamed part'}</div>
              <div className="text-sm text-gray-600">SL: {b.slNo} | Sprint: {b.sprintNo} | Qty: {b.qty}</div>
              <div className="text-sm mt-1">Guide: {b.guideApproved ? (<span className="text-green-600">Approved</span>) : (<span className="text-yellow-600">Pending</span>)}</div>
              <div className="text-sm">Lab: {b.labApproved ? (<span className="text-green-600">Approved</span>) : (<span className="text-yellow-600">Pending</span>)}</div>
            </div>
            <div>
              {!b.labApproved && <button onClick={() => approve(b.id)} className="bg-gray-900 text-white px-3 py-1 rounded">Approve</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LabApprove
