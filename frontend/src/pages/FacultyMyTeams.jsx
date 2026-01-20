import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import { X, Pencil, Plus, Trash2, Save } from 'lucide-react';

function FacultyMyTeams() {
    const navigate = useNavigate()
    const { logout } = useAuth();
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [allBOMs, setAllBOMs] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ problemStatement: '', members: [] });
    const [availableStudents, setAvailableStudents] = useState([]);
    const [saving, setSaving] = useState(false);
    const [memberSearchQuery, setMemberSearchQuery] = useState('');

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
                // Update the selected team with new data
                setSelectedTeam(response.data.team);
                // Update the teams list
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

    // Get all members for display (current + available for adding)
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
        return availableStudents.filter(student => {
            const notAlreadyMember = !editData.members.includes(student._id);

            // Search filter
            const searchMatch = !memberSearchQuery ||
                student.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
                student.email.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
                (student.usn && student.usn.toLowerCase().includes(memberSearchQuery.toLowerCase()));

            return notAlreadyMember && searchMatch;
        });
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
                            onClick={() => { setSelectedTeam(null); setIsEditing(false); }}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="flex items-center justify-between mb-6 border-b pb-4">
                            <h2 className="text-2xl font-serif font-bold text-slate-900">Team Details</h2>
                            {!isEditing && (
                                <button
                                    onClick={handleEditClick}
                                    className="flex items-center gap-2 px-4 py-2 bg-maroon-700 text-white rounded-lg hover:bg-maroon-800 transition-colors"
                                >
                                    <Pencil className="w-4 h-4" />
                                    Edit Team
                                </button>
                            )}
                        </div>

                        {/* Problem Statement */}
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Problem Statement</h3>
                            {isEditing ? (
                                <textarea
                                    value={editData.problemStatement}
                                    onChange={(e) => setEditData(prev => ({ ...prev, problemStatement: e.target.value }))}
                                    className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
                                    rows={3}
                                />
                            ) : (
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-slate-800">
                                    {selectedTeam.problemStatement}
                                </div>
                            )}
                        </div>

                        {/* Team Members */}
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
                                Team Members {isEditing && <span className="text-maroon-600">({editData.members.length})</span>}
                            </h3>

                            {isEditing ? (
                                <div className="space-y-4">
                                    {/* Current Members */}
                                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                                        <div className="bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700">Current Members</div>
                                        {getCurrentMembers().length > 0 ? (
                                            <div className="divide-y">
                                                {getCurrentMembers().map((member) => (
                                                    <div key={member._id} className="flex items-center justify-between px-4 py-3">
                                                        <div>
                                                            <p className="font-medium text-gray-900">{member.name}</p>
                                                            <p className="text-sm text-gray-500">{member.email}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => handleRemoveMember(member._id)}
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Remove from team"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="px-4 py-3 text-gray-500 text-sm">No current members</p>
                                        )}
                                    </div>

                                    {/* Removed Members (will be removed on save) */}
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
                                                        <button
                                                            onClick={() => handleAddMember(member._id)}
                                                            className="px-3 py-1 text-sm bg-white text-gray-700 border rounded hover:bg-gray-50"
                                                        >
                                                            Undo
                                                        </button>
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
                                                        <button
                                                            onClick={() => handleRemoveMember(student._id)}
                                                            className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                                                        >
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
                                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="text-sm font-semibold text-gray-700">Add New Members</div>
                                                </div>
                                                {/* Search Input */}
                                                <div className="relative">
                                                    <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                    </svg>
                                                    <input
                                                        type="text"
                                                        placeholder="Search by name, email, or USN..."
                                                        value={memberSearchQuery}
                                                        onChange={(e) => setMemberSearchQuery(e.target.value)}
                                                        className="w-full pl-9 pr-8 py-1.5 text-sm bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-maroon-500/20 focus:border-maroon-500 outline-none"
                                                    />
                                                    {memberSearchQuery && (
                                                        <button
                                                            onClick={() => setMemberSearchQuery('')}
                                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="max-h-48 overflow-y-auto divide-y">
                                                {getAvailableToAdd().map((student) => (
                                                    <div key={student._id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                                                        <div>
                                                            <p className="font-medium text-gray-900">{student.name}</p>
                                                            <p className="text-sm text-gray-500">{student.email} {student.division && `• ${student.division}`}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => handleAddMember(student._id)}
                                                            className="flex items-center gap-1 px-3 py-1 text-sm bg-maroon-700 text-white rounded hover:bg-maroon-800"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                            Add
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Edit Actions */}
                                    <div className="flex gap-3 pt-4 border-t">
                                        <button
                                            onClick={handleCancelEdit}
                                            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveChanges}
                                            disabled={saving}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-maroon-700 text-white rounded-lg hover:bg-maroon-800 font-medium disabled:opacity-50"
                                        >
                                            <Save className="w-4 h-4" />
                                            {saving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
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
                            )}
                        </div>

                        {/* BOM Section - Only show when not editing */}
                        {!isEditing && (
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
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default FacultyMyTeams
