import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import { X, KeyRound } from 'lucide-react';

function FacultyLanding() {
  const navigate = useNavigate()
  const { logout } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingBOMCount, setPendingBOMCount] = useState(0);

  // Password Change State
  const [user, setUser] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    setUser(storedUser);

    if (!token) {
      navigate('/login/faculty');
      return;
    }

    if (storedUser && storedUser.mustChangePassword) {
      setShowPasswordModal(true);
    }

    fetchTeams();
    fetchPendingBOMs();
  }, [navigate]);


  const fetchPendingBOMs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/faculty/bom/list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        const pending = response.data.data.filter(b => !b.guideApproved && b.status !== 'rejected').length;
        setPendingBOMCount(pending);
      }
    } catch (error) {
      console.error('Error fetching BOMs:', error);
    }
  };

  const fetchTeams = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/faculty/team/list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setTeams(response.data.teams);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login/faculty');
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
      const response = await axios.post('http://localhost:8000/api/faculty/auth/change-password',
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

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden" style={{ height: 220 }}>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-800" />
        <div className="relative h-full max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1">Faculty Tools</h1>
            <p className="text-sm text-slate-300">Approve BOMs and create project teams for your students.</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="px-4 py-2 bg-slate-700/50 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-slate-700 transition-colors border border-slate-600 flex items-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              Change Password
            </button>
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

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <button
            onClick={() => navigate('/faculty/approve')}
            className="bg-white p-8 rounded-lg shadow-lg text-left hover:shadow-xl transition relative group">
            {pendingBOMCount > 0 && (
              <div className="absolute top-4 right-4 w-4 h-4 bg-red-600 rounded-full animate-pulse shadow-sm border-2 border-white"></div>
            )}
            <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">BOM Approval Queue</h3>
            <p className="text-sm text-gray-600">Review and approve Bill of Materials submitted by students.</p>
          </button>

          <button
            onClick={() => navigate('/faculty/team-create')}
            className="bg-white p-8 rounded-lg shadow-lg text-left hover:shadow-xl transition">
            <h3 className="text-xl font-bold mb-2">Create Team</h3>
            <p className="text-sm text-gray-600">Create project teams by adding members and assigning a project title.</p>
          </button>

          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">Team Overview</h3>
            <div className="text-4xl font-bold text-blue-600">{teams.length}</div>
            <p className="text-sm text-gray-500 mt-1">Total Teams Created</p>
          </div>
        </div>

        {/* Teams List Section */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-bold text-gray-800">My Teams</h3>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading teams...</div>
          ) : teams.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No teams created yet. Click "Create Team" to get started.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {teams.map((team) => (
                <div key={team._id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">{team.problemStatement}</h4>
                      <p className="text-sm text-gray-500">Created on {new Date(team.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                      {team.members.length} Members
                    </span>
                  </div>

                  <div className="mt-4">
                    <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Team Members</h5>
                    <div className="flex flex-wrap gap-2">
                      {team.members.map((member) => (
                        <div key={member._id} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold mr-2">
                            {member.name.charAt(0)}
                          </div>
                          <span className="text-sm text-gray-700">{member.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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

export default FacultyLanding
