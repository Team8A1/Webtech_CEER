import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';

function FacultyLanding() {
  const navigate = useNavigate()
  const { logout } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const [pendingBOMCount, setPendingBOMCount] = useState(0);

  useEffect(() => {
    fetchTeams();
    fetchPendingBOMs();
  }, []);

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

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden" style={{ height: 220 }}>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-800" />
        <div className="relative h-full max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1">Faculty Tools</h1>
            <p className="text-sm text-slate-300">Approve BOMs and create project teams for your students.</p>
          </div>
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
    </div>
  )
}

export default FacultyLanding
