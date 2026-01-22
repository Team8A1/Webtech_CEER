import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import BOMForm from '../components/BOMForm';

function FacultyApprove() {
  const [boms, setBoms] = useState([])
  const [filter, setFilter] = useState('pending') // pending, approved, all, rejected
  const navigate = useNavigate()
  const previousPendingCountRef = useRef(0)
  const [editingBOM, setEditingBOM] = useState(null)
  const [rejectingId, setRejectingId] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')


  const load = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/faculty/bom/list', {
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
        const response = await axios.get('http://localhost:8000/api/faculty/bom/list', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          const fetchedBoms = response.data.data;
          // Filter out rejected items from pending count
          const currentPendingCount = fetchedBoms.filter(b => !b.guideApproved && b.status !== 'rejected').length;

          // POPUP alert if new pending BOMs appear (no sound, no voice)
          if (currentPendingCount > previousPendingCountRef.current && currentPendingCount > 0) {
            alert("New BOM requests pending for your approval.");
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
      await axios.patch('http://localhost:8000/api/faculty/bom/update', {
        id,
        status: 'approved'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      load(); // Reload to get updated status
      alert('BOM Request Approved');
    } catch (error) {
      console.error('Error approving BOM:', error);
      alert('Error approving request');
    }
  }

  const handleRejectClick = (id) => {
    setRejectingId(id)
    setRejectionReason('')
  }

  const confirmReject = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch('http://localhost:8000/api/faculty/bom/update', {
        id: rejectingId,
        status: 'rejected',
        reason: rejectionReason
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      load();
      alert('BOM Request Rejected');
      setRejectingId(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting BOM:', error);
      alert('Error rejecting request');
    }
  }

  const handleUpdate = async (bomData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch('http://localhost:8000/api/faculty/bom/update', {
        id: editingBOM._id || editingBOM.id,
        ...bomData
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      load();
      setEditingBOM(null);
      alert('BOM Request Updated');
    } catch (error) {
      console.error('Error updating BOM:', error);
      alert('Error updating request');
    }
  }

  const getFilteredBOMs = () => {
    if (filter === 'pending') return boms.filter(b => !b.guideApproved && b.status !== 'rejected')
    if (filter === 'approved') return boms.filter(b => b.guideApproved && b.status !== 'rejected')
    if (filter === 'rejected') return boms.filter(b => b.status === 'rejected')
    return boms
  }

  const filteredBoms = getFilteredBOMs()
  const pendingCount = boms.filter(b => !b.guideApproved && b.status !== 'rejected').length
  const approvedCount = boms.filter(b => b.guideApproved).length
  const rejectedCount = boms.filter(b => b.status === 'rejected').length

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-12">
          <button
            onClick={() => navigate('/faculty')}
            className="px-6 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 hover:border-gray-400 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Page Title */}
        <div className="mb-16 md:mb-20 max-w-4xl">
          <p className="text-sm font-bold tracking-widest text-gray-500 uppercase mb-4">
            BOM Management
          </p>
          <h2 className="text-2xl md:text-4xl lg:text-6xl font-serif font-medium leading-[1.1] tracking-tight mb-8" style={{ color: 'rgb(139, 21, 56)' }}>
            Guide Approval Queue
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-3xl font-light">
            Review and approve Bill of Materials submitted by your students.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="text-4xl font-serif font-bold text-gray-900 mb-2">{boms.length}</div>
            <div className="text-sm text-gray-600 font-medium">Total BOMs</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="text-4xl font-serif font-bold" style={{ color: 'rgb(139, 21, 56)' }}>{pendingCount}</div>
            <div className="text-sm text-gray-600 font-medium">Pending Review</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="text-4xl font-serif font-bold text-green-600">{approvedCount}</div>
            <div className="text-sm text-gray-600 font-medium">Approved</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="text-4xl font-serif font-bold text-red-600">{rejectedCount}</div>
            <div className="text-sm text-gray-600 font-medium">Rejected</div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
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
                key={bom._id || bom.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden"
              >
                <div className="flex items-stretch">
                  {/* Left Status Indicator */}
                  <div className={`w-1 ${bom.guideApproved ? 'bg-green-500' : (bom.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500')}`}></div>

                  {/* Main Content */}
                  {/* Main Content */}
                  <div className="flex-1 p-6 min-w-0">
                    <div className="grid md:grid-cols-[3fr_2fr] gap-6">
                      {/* Left Column - Student & Consumable Details */}
                      <div className="min-w-0 space-y-3">
                        {/* Student Information */}
                        <div className="grid grid-cols-[140px_1fr] items-start">
                          <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Student:</span>
                          <div className="text-sm text-gray-900 font-medium">{bom.studentId?.name || 'N/A'}</div>
                        </div>
                        <div className="grid grid-cols-[140px_1fr] items-start">
                          <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">USN/Email:</span>
                          <div className="text-sm text-blue-600 font-medium break-all">{bom.studentId?.usn || bom.studentId?.email || 'N/A'}</div>
                        </div>
                        {bom.teamId?.problemStatement && (
                          <div className="grid grid-cols-[140px_1fr] items-start">
                            <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Problem Statement:</span>
                            <div className="text-sm text-gray-900 font-medium max-h-24 overflow-auto pb-2 italic">"{bom.teamId.problemStatement}"</div>
                          </div>
                        )}

                        {/* Divider */}
                        <div className="border-t border-gray-300 my-2"></div>

                        {/* Consumable Details */}
                        <div className="grid grid-cols-[140px_1fr] items-start">
                          <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Consumable Name:</span>
                          <div className="text-sm text-gray-900 font-medium max-h-24 overflow-auto pb-2">{bom.consumableName}</div>
                        </div>
                        <div className="grid grid-cols-[140px_1fr] items-start">
                          <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Specification:</span>
                          <div className="text-sm text-gray-900 font-medium max-h-24 overflow-auto pb-2">{bom.specification}</div>
                        </div>
                        <div className="grid grid-cols-[140px_1fr] items-start">
                          <span className="text-sm font-semibold text-gray-600">Quantity:</span>
                          <span className="text-sm text-gray-900 font-medium">{bom.qty}</span>
                        </div>
                        <div className="grid grid-cols-[140px_1fr] items-start">
                          <span className="text-sm font-semibold text-gray-600">Date:</span>
                          <span className="text-sm text-gray-900 font-medium">{new Date(bom.date).toLocaleDateString()}</span>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="text-xs text-gray-600">
                            Created: {new Date(bom.createdAt).toLocaleDateString()} at {new Date(bom.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>

                      {/* Right Column - Project Info & Status */}
                      <div className="min-w-0">
                        <div className="space-y-3">
                          <div className="grid grid-cols-[140px_1fr] items-start">
                            <span className="text-sm font-semibold text-gray-600">Part Name:</span>
                            <div className="text-sm text-gray-900 font-medium max-h-24 overflow-auto pb-2">{bom.partName || 'Unnamed Part'}</div>
                          </div>
                          <div className="grid grid-cols-[140px_1fr] items-start">
                            <span className="text-sm font-semibold text-gray-600">Sprint:</span>
                            <div className="text-sm text-gray-900 font-medium max-h-24 overflow-auto pb-2">{bom.sprintNo}</div>
                          </div>
                        </div>

                        {/* Approval Status */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="space-y-2">
                            <div className="grid grid-cols-[140px_1fr] items-center">
                              <span className="text-sm font-semibold text-gray-600">Guide Approval:</span>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold w-fit ${bom.guideApproved
                                ? 'bg-green-100 text-green-800'
                                : (bom.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800')
                                }`}>
                                {bom.guideApproved ? '✓ Approved' : (bom.status === 'rejected' ? '✗ Rejected' : '⏳ Pending')}
                              </span>
                            </div>
                            <div className="grid grid-cols-[140px_1fr] items-center">
                              <span className="text-sm font-semibold text-gray-600">Lab Approval:</span>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold w-fit ${bom.labApproved
                                ? 'bg-green-100 text-green-800'
                                : (bom.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800')
                                }`}>
                                {bom.labApproved ? '✓ Approved' : (bom.status === 'rejected' ? '✗ Rejected' : '⏳ Pending')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center px-6 py-4 border-l border-gray-200 bg-gray-50">
                    {!bom.guideApproved && bom.status !== 'rejected' ? (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => approve(bom._id || bom.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors shadow"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setEditingBOM(bom)}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleRejectClick(bom._id || bom.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors shadow"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        {bom.status === 'rejected' ? (
                          <>
                            <div className="text-3xl mb-2 text-red-600">✗</div>
                            <span className="text-xs font-semibold text-red-700">Rejected</span>
                          </>
                        ) : (
                          <>
                            <div className="text-3xl mb-2 text-green-600">✓</div>
                            <span className="text-xs font-semibold text-green-700">Approved</span>
                            <div className="text-xs text-gray-600 mt-1">
                              {new Date(bom.guideApprovedAt).toLocaleDateString()}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingBOM && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: 'rgb(139, 21, 56)' }}>Edit BOM Request</h2>
              <BOMForm
                initial={editingBOM}
                onSave={handleUpdate}
                onCancel={() => setEditingBOM(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-serif font-bold mb-4" style={{ color: 'rgb(139, 21, 56)' }}>Reject Request</h3>
            <p className="text-gray-600 mb-4">Please provide a reason for rejecting this request (Optional).</p>
            <textarea
              className="w-full p-3 border border-gray-300 rounded mb-4 focus:ring-2 focus:ring-red-500 outline-none"
              rows="4"
              placeholder="Reason for rejection (Optional)..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            ></textarea>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setRejectingId(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FacultyApprove
