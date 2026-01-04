import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import { X } from 'lucide-react';

function LabApprove() {
  const [boms, setBoms] = useState([])
  const [filter, setFilter] = useState('pending') // pending, approved, all, rejected
  const navigate = useNavigate()
  const previousPendingCountRef = useRef(0)
  const [rejectingId, setRejectingId] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')

  // Password Change State
  const [user, setUser] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Predefined rejection reasons
  const predefinedReasons = [
    'Incomplete specification provided',
    'Material not available in inventory',
    'Quantity exceeds lab capacity',
    'Safety concerns with requested material',
    'Specification does not match lab equipment capabilities',
    'Budget allocation exceeded',
    'Lead time not feasible',
    'Similar alternative material available',
    'Requires approval from senior faculty',
    'Other (please specify)'
  ]

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
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    setUser(storedUser);
    if (storedUser && storedUser.mustChangePassword) {
      setShowPasswordModal(true);
    }
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

  const handleRejectClick = (id) => {
    setRejectingId(id)
    setRejectionReason('')
  }

  const confirmReject = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch('http://localhost:8000/api/lab/bom/reject', {
        id: rejectingId,
        reason: rejectionReason
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      load();
      alert('BOM Request Rejected by Lab');
      setRejectingId(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting BOM:', error);
      alert('Error rejecting request');
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8000/api/lab/auth/change-password',
        {
          email: user.email,
          oldPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setPasswordSuccess('Password updated successfully');

        // Update local storage
        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (currentUser) {
          currentUser.mustChangePassword = false;
          localStorage.setItem('user', JSON.stringify(currentUser));
        }

        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
          setPasswordSuccess('');
          // Reload to update state
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      setPasswordError(error.response?.data?.message || 'Failed to update password');
    }
  };

  const getFilteredBOMs = () => {
    if (filter === 'pending') return boms.filter(b => !b.labApproved && b.status !== 'rejected')
    if (filter === 'approved') return boms.filter(b => b.labApproved && b.status !== 'rejected')
    if (filter === 'rejected') return boms.filter(b => b.status === 'rejected')
    return boms
  }

  const filteredBoms = getFilteredBOMs()
  const pendingCount = boms.filter(b => !b.labApproved && b.status !== 'rejected').length
  const approvedCount = boms.filter(b => b.labApproved && b.status !== 'rejected').length
  const rejectedCount = boms.filter(b => b.status === 'rejected').length

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Lab Instructor Approval Queue</h2>
        <div className="flex gap-4">
          <button onClick={() => navigate('/login/lab')} className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">Back</button>
          <button onClick={() => { localStorage.removeItem('token'); navigate('/login/lab'); }} className="px-5 py-2.5 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors shadow-sm">Logout</button>
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
                  <div className="flex-1 p-6 min-w-0">
                    <div className="grid md:grid-cols-[3fr_2fr] gap-6">
                      {/* Left Column - Material Details */}
                      <div className="min-w-0">
                        <div className="space-y-3">
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
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="text-xs text-gray-600">
                            Created: {new Date(bom.createdAt).toLocaleDateString()} at {new Date(bom.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>

                      {/* Right Column - Project Info & Status */}
                      <div className="min-w-0">
                        {/* Part Name & Sprint */}
                        <div className="mb-6 space-y-3">
                          <div className="grid grid-cols-[140px_1fr] items-start">
                            <span className="text-sm font-semibold text-gray-600">Part Name:</span>
                            <div className="text-sm text-gray-900 font-medium max-h-24 overflow-auto pb-2">{bom.partName || 'Unnamed Part'}</div>
                          </div>
                          <div className="grid grid-cols-[140px_1fr] items-start">
                            <span className="text-sm font-semibold text-gray-600">Sprint:</span>
                            <div className="text-sm text-gray-900 font-medium max-h-24 overflow-auto pb-2">{bom.sprintNo}</div>
                          </div>
                          {bom.status === 'rejected' && bom.rejectionReason && (
                            <div className="grid grid-cols-[140px_1fr] items-start mt-2">
                              <span className="text-sm font-semibold text-red-600">Rejection Reason:</span>
                              <div className="text-sm text-red-700 font-medium max-h-24 overflow-auto pb-2">{bom.rejectionReason}</div>
                            </div>
                          )}
                        </div>

                        {/* Approval Status */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="space-y-2">
                            <div className="grid grid-cols-[140px_1fr] items-center">
                              <span className="text-sm font-semibold text-gray-600">Guide Approval:</span>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold w-fit ${bom.guideApproved
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                                }`}>
                                {bom.guideApproved ? '✓ Approved' : '⏳ Pending'}
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
                  <div className="flex items-center px-6 py-4 border-l border-gray-200 bg-gray-50 max-w-[200px] w-full justify-center">
                    {!bom.labApproved && bom.status !== 'rejected' ? (
                      <div className="flex flex-col gap-2 w-full">
                        <button
                          onClick={() => approve(bom._id || bom.id)}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors shadow"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectClick(bom._id || bom.id)}
                          className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors shadow"
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
                              {new Date(bom.labApprovedAt).toLocaleDateString()}
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
        )
      }



      {/* Reject Modal */}
      {rejectingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Reject Request</h3>
            <p className="text-gray-600 mb-4">Please select or provide a reason for rejection.</p>

            {/* Dropdown for predefined reasons */}
            <select
              className="w-full p-3 border border-gray-300 rounded mb-4 focus:ring-2 focus:ring-red-500 outline-none bg-white"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            >
              <option value="">-- Select a reason --</option>
              {predefinedReasons.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>

            {/* Custom reason input - shown only when "Other" is selected */}
            {rejectionReason === 'Other (please specify)' && (
              <textarea
                className="w-full p-3 border border-gray-300 rounded mb-4 focus:ring-2 focus:ring-red-500 outline-none"
                rows="3"
                placeholder="Please specify the reason..."
                value={rejectionReason === 'Other (please specify)' ? '' : rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              ></textarea>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setRejectingId(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={!rejectionReason}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl relative">
            {(!user || !user.mustChangePassword) && (
              <button
                onClick={() => setShowPasswordModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {user?.mustChangePassword ? 'Security Alert' : 'Update Password'}
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              {user?.mustChangePassword
                ? 'You must change your default password to continue using the portal.'
                : 'Set a new password for your account to enable manual login.'}
            </p>

            {passwordError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100">
                {passwordSuccess}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-200"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-200"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-200"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-slate-900 text-white rounded-full font-bold text-sm tracking-widest hover:bg-slate-800 transition-colors shadow-lg"
              >
                UPDATE PASSWORD
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default LabApprove

/* Reject Modal for LabApprove */
// Appending modal to the end of the return statement (inside the component) would be cleaner, but since I'm editing using chunks, I'll insert it before the closing </div> of the main return.