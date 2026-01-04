import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import { X, KeyRound, Pencil, Plus, Trash2, Save } from 'lucide-react';

function FacultyLanding() {
  const navigate = useNavigate()
  const { logout } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingBOMCount, setPendingBOMCount] = useState(0);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [allBOMs, setAllBOMs] = useState([]);

  // Edit Team State
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ problemStatement: '', members: [] });
  const [availableStudents, setAvailableStudents] = useState([]);
  const [saving, setSaving] = useState(false);

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
        setAllBOMs(response.data.data);
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

  const fetchAvailableStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/faculty/team/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setAvailableStudents(response.data.students);
      }
    } catch (error) {
      console.error('Error fetching available students:', error);
    }
  };

  const handleEditClick = () => {
    setEditData({
      problemStatement: selectedTeam.problemStatement,
      members: selectedTeam.members.map(m => m._id)
    });
    fetchAvailableStudents();
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({ problemStatement: '', members: [] });
  };

  const handleRemoveMember = (memberId) => {
    setEditData(prev => ({
      ...prev,
      members: prev.members.filter(id => id !== memberId)
    }));
  };

  const handleAddMember = (studentId) => {
    if (!editData.members.includes(studentId)) {
      setEditData(prev => ({
        ...prev,
        members: [...prev.members, studentId]
      }));
    }
  };

  const handleSaveChanges = async () => {
    if (editData.members.length === 0) {
      alert('Team must have at least one member');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:8000/api/faculty/team/update/${selectedTeam._id}`,
        {
          problemStatement: editData.problemStatement,
          members: editData.members
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSelectedTeam(response.data.team);
        setTeams(prev => prev.map(t =>
          t._id === response.data.team._id ? response.data.team : t
        ));
        setIsEditing(false);
        alert('Team updated successfully!');
      }
    } catch (error) {
      console.error('Error updating team:', error);
      alert(error.response?.data?.message || 'Failed to update team');
    } finally {
      setSaving(false);
    }
  };

  const getCurrentMembers = () => {
    if (!selectedTeam) return [];
    return selectedTeam.members.filter(m => editData.members.includes(m._id));
  };

  const getRemovedMembers = () => {
    if (!selectedTeam) return [];
    return selectedTeam.members.filter(m => !editData.members.includes(m._id));
  };

  const getNewlyAddedStudents = () => {
    if (!selectedTeam) return [];
    const currentMemberIds = selectedTeam.members.map(m => m._id);
    return availableStudents.filter(s =>
      editData.members.includes(s._id) && !currentMemberIds.includes(s._id)
    );
  };

  const getAvailableToAdd = () => {
    return availableStudents.filter(s => !editData.members.includes(s._id));
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

        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (currentUser) {
          currentUser.mustChangePassword = false;
          localStorage.setItem('user', JSON.stringify(currentUser));
        }

        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
          setPasswordSuccess('');
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      setPasswordError(error.response?.data?.message || 'Failed to update password');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-12">
          <button
            onClick={() => navigate('/login/faculty')}
            className="px-6 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 hover:border-gray-400 transition-colors"
          >
            Back to Login
          </button>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setShowPasswordModal(true)} className="px-6 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 hover:border-gray-400 transition-colors">
              Change Password
            </button>
            <button onClick={handleLogout} className="px-6 py-2.5 text-sm font-medium text-red-600 border border-red-200 bg-red-50/10 rounded-full hover:bg-red-50 hover:border-red-300 transition-colors">
              Logout
            </button>
          </div>
        </div>

        {/* Header Section */}
        <div className="mb-16 md:mb-20 max-w-4xl">
          <p className="text-sm font-bold tracking-widest text-gray-500 uppercase mb-4">
            Faculty Dashboard
          </p>
          <h2 className="text-2xl md:text-4xl lg:text-6xl font-serif font-medium leading-[1.1] tracking-tight mb-8" style={{ color: 'rgb(139, 21, 56)' }}>
            Teach in every way your students w<span className="italic font-light" style={{ color: 'rgb(139, 21, 56)' }}>a</span>nt to learn
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-3xl font-light">
            Approve BOMs and create project teams for your students.
          </p>
        </div>

        {/* Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 mb-20">
          {/* BOM Approval Queue Card */}
          <button
            onClick={() => navigate('/faculty/approve')}
            className="group block w-full h-full text-left relative"
          >
            {pendingBOMCount > 0 && (
              <div className="absolute top-4 right-4 z-10 w-8 h-8 bg-red-600 rounded-full animate-pulse shadow-lg border-2 border-white flex items-center justify-center">
                <span className="text-white text-xs font-bold">{pendingBOMCount}</span>
              </div>
            )}
            <div className="relative w-full aspect-[5/4] overflow-hidden rounded-xl mb-6 bg-gray-100">
              <img src="/images/approve.jpg" alt="BOM Approval Queue" className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-serif font-medium text-gray-900 transition-colors group-hover:[color:rgb(139,21,56)]">BOM Approval Queue</h3>
                <div className="w-5 h-4 text-gray-900 transition-transform duration-300 group-hover:translate-x-1">
                  <svg width="100%" height="100%" viewBox="0 0 16 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.546875 3.79455H10.5469V5.29455H0.546875V3.79455Z" fill="currentColor"></path>
                    <path d="M15.4766 4.54474L10.4719 8.87756V0.211914L15.4766 4.54474Z" fill="currentColor"></path>
                  </svg>
                </div>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">Review and approve Bill of Materials submitted by students.</p>
            </div>
          </button>

          {/* Create Team Card */}
          <button onClick={() => navigate('/faculty/team-create')} className="group block w-full h-full text-left">
            <div className="relative w-full aspect-[5/4] overflow-hidden rounded-xl mb-6 bg-gray-100">
              <img src="/images/team.jpg" alt="Create Team" className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-serif font-medium text-gray-900 transition-colors group-hover:[color:rgb(139,21,56)]">Create Team</h3>
                <div className="w-5 h-4 text-gray-900 transition-transform duration-300 group-hover:translate-x-1">
                  <svg width="100%" height="100%" viewBox="0 0 16 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.546875 3.79455H10.5469V5.29455H0.546875V3.79455Z" fill="currentColor"></path>
                    <path d="M15.4766 4.54474L10.4719 8.87756V0.211914L15.4766 4.54474Z" fill="currentColor"></path>
                  </svg>
                </div>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">Create project teams by adding members and assigning a project title.</p>
            </div>
          </button>

          {/* Team Overview Card */}
          <button
            onClick={() => {
              const myTeamsSection = document.getElementById('my-teams-section');
              if (myTeamsSection) {
                myTeamsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            className="group block w-full h-full text-left"
          >
            <div className="relative w-full aspect-[5/4] overflow-hidden rounded-xl mb-6 bg-gray-100">
              <img src="https://cdn.prod.website-files.com/687904fb2b26c434698c47e9/68e2fc0c8ae5b217815396ad_272dd01b1fa967d3f7374c715975249e_teachable-product-downloads.webp" alt="Team Overview" className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-8">
                <div className="text-center">
                  <div className="text-6xl font-serif font-bold text-white mb-2">{teams.length}</div>
                  <p className="text-white text-lg font-medium">Teams Created</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-serif font-medium text-gray-900 transition-colors group-hover:[color:rgb(139,21,56)]">Team Overview</h3>
                <div className="w-5 h-4 text-gray-900 transition-transform duration-300 group-hover:translate-x-1">
                  <svg width="100%" height="100%" viewBox="0 0 16 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.546875 3.79455H10.5469V5.29455H0.546875V3.79455Z" fill="currentColor"></path>
                    <path d="M15.4766 4.54474L10.4719 8.87756V0.211914L15.4766 4.54474Z" fill="currentColor"></path>
                  </svg>
                </div>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">View all your teams below.</p>
            </div>
          </button>
        </div>

        {/* My Teams Section */}
        <section id="my-teams-section" className="w-full py-0 md:py-0 mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 md:gap-12">
            <div className="max-w-xl">
              <h2 className="font-serif font-medium leading-[1.1] tracking-tight text-4xl md:text-5xl font-bold" style={{ color: 'rgb(139, 21, 56)' }}>
                <em className="font-serif italic text-gray-500 pr-2">My</em>Teams
              </h2>
            </div>
            <div className="max-w-md">
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed">View and manage all your project teams and their members.</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              <p className="mt-4 text-gray-500">Loading teams...</p>
            </div>
          ) : teams.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-300">
              <p className="text-xl text-gray-500 mb-4">No teams created yet.</p>
              <button onClick={() => navigate('/faculty/team-create')} className="px-6 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors">
                Create Your First Team
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {teams.map((team, index) => (
                <div
                  key={team._id}
                  onClick={() => setSelectedTeam(team)}
                  className={`flex flex-col h-full p-8 border border-transparent rounded-xl transition-all duration-300 bg-[#F6F6F6] hover:bg-gray-100 cursor-pointer group ${index % 2 === 0 ? 'lg:mt-8' : ''}`}
                >
                  <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4 group-hover:text-[rgb(139,21,56)] transition-colors line-clamp-3">{team.problemStatement}</h3>
                  <div className="mt-auto space-y-2">
                    <p className="text-[17px] text-gray-600 leading-relaxed"><span className="font-semibold text-gray-900">{team.members.length}</span> Team Members</p>
                    <p className="text-sm text-gray-500">Created {new Date(team.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl relative">
            {(!user || !user.mustChangePassword) && (
              <button onClick={() => setShowPasswordModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{user?.mustChangePassword ? 'Security Alert' : 'Update Password'}</h2>
            <p className="text-sm text-slate-500 mb-6">{user?.mustChangePassword ? 'You must change your default password to continue using the portal.' : 'Set a new password for your account to enable manual login.'}</p>
            {passwordError && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">{passwordError}</div>}
            {passwordSuccess && <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100">{passwordSuccess}</div>}
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Current Password</label>
                <input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-200" placeholder="••••••••" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">New Password</label>
                <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-200" placeholder="••••••••" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Confirm Password</label>
                <input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-200" placeholder="••••••••" required />
              </div>
              <button type="submit" className="w-full py-3 bg-slate-900 text-white rounded-full font-bold text-sm tracking-widest hover:bg-slate-800 transition-colors shadow-lg">UPDATE PASSWORD</button>
            </form>
          </div>
        </div>
      )}

      {/* Team Details Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-4xl p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => { setSelectedTeam(null); setIsEditing(false); }} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center justify-between mb-2">
              <h2 className="text-3xl font-serif font-bold" style={{ color: 'rgb(139, 21, 56)' }}>Team Details</h2>
              {!isEditing && (
                <button onClick={handleEditClick} className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors mr-10" style={{ backgroundColor: 'rgb(139, 21, 56)' }}>
                  <Pencil className="w-4 h-4" />Edit Team
                </button>
              )}
            </div>
            <p className="text-gray-500 mb-8">Complete information about this project team</p>

            {/* Problem Statement */}
            <div className="mb-8">
              <h3 className="text-lg font-serif font-bold mb-3" style={{ color: 'rgb(139, 21, 56)' }}>Problem Statement</h3>
              {isEditing ? (
                <textarea value={editData.problemStatement} onChange={(e) => setEditData(prev => ({ ...prev, problemStatement: e.target.value }))} className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-maroon-500 focus:border-transparent" rows={3} />
              ) : (
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-slate-800 text-base leading-relaxed">{selectedTeam.problemStatement}</div>
              )}
            </div>

            {/* Team Members */}
            <div className="mb-8">
              <h3 className="text-lg font-serif font-bold mb-4" style={{ color: 'rgb(139, 21, 56)' }}>
                Team Members {isEditing && <span className="text-maroon-600">({editData.members.length})</span>}
                {!isEditing && `(${selectedTeam.members.length})`}
              </h3>

              {isEditing ? (
                <div className="space-y-4">
                  {/* Current Members */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700">Current Members</div>
                    {getCurrentMembers().length > 0 ? (
                      <div className="divide-y">
                        {getCurrentMembers().map((member, index) => (
                          <div key={member._id} className="flex items-center justify-between px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: 'rgb(139, 21, 56)' }}>{index + 1}</div>
                              <div>
                                <p className="font-medium text-gray-900">{member.name}</p>
                                <p className="text-sm text-gray-500">{member.email}</p>
                              </div>
                            </div>
                            <button onClick={() => handleRemoveMember(member._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Remove from team">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="px-4 py-3 text-gray-500 text-sm">No current members</p>
                    )}
                  </div>

                  {/* Removed Members */}
                  {getRemovedMembers().length > 0 && (
                    <div className="border border-red-200 rounded-lg overflow-hidden bg-red-50">
                      <div className="bg-red-100 px-4 py-2 text-sm font-semibold text-red-700">To Be Removed</div>
                      <div className="divide-y divide-red-200">
                        {getRemovedMembers().map((member) => (
                          <div key={member._id} className="flex items-center justify-between px-4 py-3">
                            <div>
                              <p className="font-medium text-gray-900 line-through">{member.name}</p>
                              <p className="text-sm text-gray-500">{member.email}</p>
                            </div>
                            <button onClick={() => handleAddMember(member._id)} className="px-3 py-1 text-sm bg-white text-gray-700 border rounded hover:bg-gray-50">Undo</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Newly Added Students */}
                  {getNewlyAddedStudents().length > 0 && (
                    <div className="border border-green-200 rounded-lg overflow-hidden bg-green-50">
                      <div className="bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">To Be Added</div>
                      <div className="divide-y divide-green-200">
                        {getNewlyAddedStudents().map((student) => (
                          <div key={student._id} className="flex items-center justify-between px-4 py-3">
                            <div>
                              <p className="font-medium text-gray-900">{student.name}</p>
                              <p className="text-sm text-gray-500">{student.email}</p>
                            </div>
                            <button onClick={() => handleRemoveMember(student._id)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add New Student */}
                  {getAvailableToAdd().length > 0 && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700">Add New Members</div>
                      <div className="max-h-48 overflow-y-auto divide-y">
                        {getAvailableToAdd().map((student) => (
                          <div key={student._id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                            <div>
                              <p className="font-medium text-gray-900">{student.name}</p>
                              <p className="text-sm text-gray-500">{student.email} {student.division && `• ${student.division}`}</p>
                            </div>
                            <button onClick={() => handleAddMember(student._id)} className="flex items-center gap-1 px-3 py-1 text-sm text-white rounded hover:opacity-90" style={{ backgroundColor: 'rgb(139, 21, 56)' }}>
                              <Plus className="w-3 h-3" />Add
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Edit Actions */}
                  <div className="flex gap-3 pt-4 border-t">
                    <button onClick={handleCancelEdit} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
                    <button onClick={handleSaveChanges} disabled={saving} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-white rounded-lg font-medium disabled:opacity-50" style={{ backgroundColor: 'rgb(139, 21, 56)' }}>
                      <Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-3">
                  {selectedTeam.members.map((member, index) => (
                    <div key={member._id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: 'rgb(139, 21, 56)' }}>{index + 1}</div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{member.name}</p>
                          <div className="flex gap-4 text-sm text-gray-600 mt-1">
                            <span>USN: {member.usn || '-'}</span>
                            <span>•</span>
                            <span>{member.email}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bill of Materials - Only show when not editing */}
            {!isEditing && (
              <div>
                <h3 className="text-lg font-serif font-bold mb-4" style={{ color: 'rgb(139, 21, 56)' }}>Bill of Materials (BOM)</h3>
                {allBOMs.filter(bom => bom.teamId?._id === selectedTeam._id || bom.teamId === selectedTeam._id).length > 0 ? (
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-4 text-left font-semibold text-gray-700">Part Name</th>
                          <th className="px-6 py-4 text-left font-semibold text-gray-700">Specification</th>
                          <th className="px-6 py-4 text-left font-semibold text-gray-700">Qty</th>
                          <th className="px-6 py-4 text-left font-semibold text-gray-700">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allBOMs.filter(bom => bom.teamId?._id === selectedTeam._id || bom.teamId === selectedTeam._id).map((bom) => (
                          <tr key={bom._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-gray-900">{bom.partName}</td>
                            <td className="px-6 py-4 text-gray-600">{bom.specification}</td>
                            <td className="px-6 py-4 text-gray-900 font-semibold">{bom.qty}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${bom.status === 'approved' ? 'bg-green-100 text-green-800' : bom.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {bom.status.charAt(0).toUpperCase() + bom.status.slice(1)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
                    <div className="text-4xl mb-3">📦</div>
                    <p className="text-gray-500 font-medium">No BOM requests found for this team.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default FacultyLanding
