import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import { X } from 'lucide-react';

function FacultyMyTeams() {
    const navigate = useNavigate()
    const { logout } = useAuth();
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [allBOMs, setAllBOMs] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            navigate('/login/faculty');
            return;
        }

        fetchTeams();
        fetchAllBOMs();
    }, [navigate]);

    const fetchAllBOMs = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8000/api/faculty/bom/list', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setAllBOMs(response.data.data);
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

    return (
        <div className="min-h-screen bg-slate-50">
            <section className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8">
                {/* Header Grid */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 md:gap-12">
                    {/* Column 1 */}
                    <div className="max-w-xl">
                        <button
                            onClick={() => navigate('/faculty/dashboard')}
                            className="text-sm font-bold tracking-widest text-gray-500 uppercase mb-4 hover:text-gray-700 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Dashboard
                        </button>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]" style={{ color: 'rgb(139, 21, 56)' }}>
                            <em className="font-serif italic text-gray-500 pr-2">My</em>
                            Teams
                        </h2>
                    </div>

                    {/* Column 2 */}
                    <div className="max-w-md">
                        <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                            View and manage all your project teams and their members.
                        </p>
                    </div>
                </div>

                {/* Teams Grid */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                        <p className="mt-4 text-gray-500">Loading teams...</p>
                    </div>
                ) : teams.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-300">
                        <p className="text-xl text-gray-500 mb-4">No teams created yet.</p>
                        <button
                            onClick={() => navigate('/faculty/team-create')}
                            className="px-6 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
                        >
                            Create Your First Team
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {teams.map((team, index) => (
                            <div
                                key={team._id}
                                onClick={() => setSelectedTeam(team)}
                                className={`flex flex-col h-full p-8 border border-transparent rounded-2xl transition-all duration-300 bg-[#F6F6F6] hover:bg-gray-100 cursor-pointer group ${index % 2 === 0 ? 'lg:mt-8' : ''
                                    }`}
                            >
                                {/* Team Name */}
                                <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4 group-hover:text-[rgb(139,21,56)] transition-colors line-clamp-3">
                                    {team.problemStatement}
                                </h3>

                                {/* Team Info */}
                                <div className="mt-auto space-y-2">
                                    <p className="text-[17px] text-gray-600 leading-relaxed">
                                        <span className="font-semibold text-gray-900">{team.members.length}</span> Team Members
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Created {new Date(team.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Team Details Modal */}
            {selectedTeam && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-4xl p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setSelectedTeam(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-2xl font-serif font-bold text-slate-900 mb-6 border-b pb-4">Team Details</h2>

                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Problem Statement</h3>
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-slate-800">
                                {selectedTeam.problemStatement}
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Team Members</h3>
                            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="w-full text-sm text-left text-gray-500">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-6 py-3">Name</th>
                                            <th className="px-6 py-3">USN</th>
                                            <th className="px-6 py-3">Email</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedTeam.members.map((member) => (
                                            <tr key={member._id} className="bg-white border-b last:border-0 hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium text-gray-900">{member.name}</td>
                                                <td className="px-6 py-4">{member.usn || '-'}</td>
                                                <td className="px-6 py-4">{member.email}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Bill of Materials (BOM)</h3>
                            {allBOMs.filter(bom => bom.teamId?._id === selectedTeam._id || bom.teamId === selectedTeam._id).length > 0 ? (
                                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                    <table className="w-full text-sm text-left text-gray-500">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                            <tr>
                                                <th className="px-6 py-3">Part Name</th>
                                                <th className="px-6 py-3">Specification</th>
                                                <th className="px-6 py-3">Qty</th>
                                                <th className="px-6 py-3">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allBOMs
                                                .filter(bom => bom.teamId?._id === selectedTeam._id || bom.teamId === selectedTeam._id)
                                                .map((bom) => (
                                                    <tr key={bom._id} className="bg-white border-b last:border-0 hover:bg-gray-50">
                                                        <td className="px-6 py-4 font-medium text-gray-900">{bom.partName}</td>
                                                        <td className="px-6 py-4">{bom.specification}</td>
                                                        <td className="px-6 py-4">{bom.qty}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                ${bom.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                                    bom.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                                        'bg-yellow-100 text-yellow-800'}`}>
                                                                {bom.status.charAt(0).toUpperCase() + bom.status.slice(1)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200 border-dashed text-gray-500">
                                    No BOM requests found for this team.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default FacultyMyTeams
