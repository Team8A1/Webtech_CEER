import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';

function LabApprove() {
  const [boms, setBoms] = useState([])
  const [filter, setFilter] = useState('pending') // pending, approved, all, rejected
  const navigate = useNavigate()
  const previousPendingCountRef = useRef(0)

  const load = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/lab/bom/list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setBoms(response.data.data);
      }
    } catch (error) {
      console.error('Error loading BOMs:', error);
    }
  }

  useEffect(() => {
    load();
  }, [])

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/lab/bom/list', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          const fetchedBoms = response.data.data;
          // Filter out rejected items from pending count
          const currentPendingCount = fetchedBoms.filter(b => !b.labApproved && b.status !== 'rejected').length;

          // Pop-up alert instead of sound/voice
          if (currentPendingCount > previousPendingCountRef.current && currentPendingCount > 0) {
            alert("New BOM requests pending.");
          }

          previousPendingCountRef.current = currentPendingCount;
          setBoms(fetchedBoms);
        }
      } catch (error) {
        console.error("Error polling BOMs", error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const approve = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch('http://localhost:8000/api/lab/bom/approve', {
        id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      load(); // Reload to get updated status
      alert('BOM Request Approved by Lab');
    } catch (error) {
      console.error('Error approving BOM:', error);
      alert(error.response?.data?.message || 'Error approving request');
    }
  }

  const handleReject = async (id) => {
    if (!confirm('Are you sure you want to reject this request?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.patch('http://localhost:8000/api/lab/bom/reject', {
        id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      load();
      alert('BOM Request Rejected by Lab');
    } catch (error) {
      console.error('Error rejecting BOM:', error);
      alert('Error rejecting request');
    }
  }

  const getFilteredBOMs = () => {
    if (filter === 'pending') return boms.filter(b => !b.labApproved && b.status !== 'rejected')
    if (filter === 'approved') return boms.filter(b => b.labApproved)
    if (filter === 'rejected') return boms.filter(b => b.status === 'rejected')
    return boms
  }

  const filteredBoms = getFilteredBOMs()
  const pendingCount = boms.filter(b => !b.labApproved && b.status !== 'rejected').length
  const approvedCount = boms.filter(b => b.labApproved).length
  const rejectedCount = boms.filter(b => b.status === 'rejected').length

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Lab Instructor Approval Queue</h2>
        <div className="flex gap-4">
          <button onClick={() => navigate('/')} className="text-sm text-gray-600 underline">Back</button>
          <button onClick={() => { localStorage.removeItem('token'); navigate('/lab/login'); }} className="text-sm text-red-600 underline">Logout</button>
        </div >
      </div >

      {/* Dashboard Header and Quick Links */}
      < div >
        <h1 className="text-4xl font-bold mb-2">Lab Instructor Dashboard</h1>
        <p className="text-slate-300">Manage BOMs, materials, and equipment</p>
      </div >
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Lab Materials */}
        <div
          onClick={() => navigate('/lab/materials')}
          className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer border border-gray-200 overflow-hidden group"
        >
          <div className="p-8">
            <h3 className="text-3xl font-bold text-green-600 mb-2">Lab Materials</h3>
            <p className="text-gray-600 font-semibold mb-3">View & Manage</p>
            <p className="text-gray-700 text-sm">Jumper wires, motors, components...</p>
          </div>
        </div>
        {/* Lab Equipment */}
        <div
          onClick={() => navigate('/lab/machines')}
          className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer border border-gray-200 overflow-hidden group"
        >
          <div className="p-8">
            <h3 className="text-3xl font-bold text-purple-600 mb-2">Lab Equipment</h3>
            <p className="text-gray-600 font-semibold mb-3">Browse & Book</p>
            <p className="text-gray-700 text-sm">Lathe, drilling, 3D printer...</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setFilter('pending')}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${filter === 'pending'
            ? 'bg-blue-600 text-white shadow-lg'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${filter === 'approved'
            ? 'bg-green-600 text-white shadow-lg'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
        >
          Approved ({approvedCount})
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${filter === 'rejected'
            ? 'bg-red-600 text-white shadow-lg'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
        >
          Rejected ({rejectedCount})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${filter === 'all'
            ? 'bg-indigo-600 text-white shadow-lg'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
        >
          All ({boms.length})
        </button>
      </div>

      {/* BOM Cards */}
      {
        filteredBoms.length === 0 ? (
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
                key={bom._id || bom.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden"
              >
                <div className="flex items-stretch">
                  {/* Left Status Indicator */}
                  <div className={`w-1 ${bom.labApproved ? 'bg-green-500' : 'bg-yellow-500'}`}></div>

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
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${bom.guideApproved
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                                }`}>
                                {bom.guideApproved ? '✓ Approved' : '⏳ Pending'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-gray-600">Lab Approval:</span>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${bom.labApproved
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
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
                    {!bom.labApproved ? (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => approve(bom._id || bom.id)}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleReject(bom._id || bom.id)}
                          className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-md hover:shadow-lg"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-3xl mb-2">✓</div>
                        <span className="text-xs font-semibold text-green-700">Approved</span>
                        <div className="text-xs text-gray-600 mt-1">
                          {new Date(bom.labApprovedAt).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div >
  )
}

export default LabApprove