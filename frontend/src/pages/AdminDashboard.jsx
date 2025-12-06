import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronRight, Plus, Trash2, Edit2, X, Upload } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('faculties');
  const [facultiesData, setFacultiesData] = useState([]);
  const [materialsData, setMaterialsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedFaculty, setExpandedFaculty] = useState(null);

  // Material Form State
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [materialForm, setMaterialForm] = useState({
    name: '',
    dimension: '',
    description: '',
    image: null
  });

  useEffect(() => {
    fetchDashboardData();
    fetchMaterials();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/admin/dashboard');
      if (response.data.success) {
        setFacultiesData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterials = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/material/list');
      if (response.data.success) {
        setMaterialsData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  const toggleFaculty = (facultyId) => {
    setExpandedFaculty(expandedFaculty === facultyId ? null : facultyId);
  };

  const handleMaterialSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', materialForm.name);
    formData.append('dimension', materialForm.dimension);
    formData.append('description', materialForm.description);
    if (materialForm.image) {
      formData.append('image', materialForm.image);
    }

    try {
      if (editingMaterial) {
        await axios.put(`http://localhost:8000/api/material/update/${editingMaterial._id}`, formData);
        alert('Material updated successfully');
      } else {
        await axios.post('http://localhost:8000/api/material/add', formData);
        alert('Material added successfully');
      }
      setShowMaterialModal(false);
      setEditingMaterial(null);
      setMaterialForm({ name: '', dimension: '', description: '', image: null });
      fetchMaterials();
    } catch (error) {
      console.error('Error saving material:', error);
      alert('Error saving material');
    }
  };

  const handleDeleteMaterial = async (id) => {
    if (!confirm('Are you sure you want to delete this material?')) return;
    try {
      await axios.delete(`http://localhost:8000/api/material/delete/${id}`);
      fetchMaterials();
      alert('Material deleted successfully');
    } catch (error) {
      console.error('Error deleting material:', error);
      alert('Error deleting material');
    }
  };

  const openEditModal = (material) => {
    setEditingMaterial(material);
    setMaterialForm({
      name: material.name,
      dimension: material.dimension,
      description: material.description,
      image: null
    });
    setShowMaterialModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-sm text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-12 font-sans text-gray-900">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 border-b border-gray-100 pb-6 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-light tracking-tight">Admin Dashboard</h1>
          </div>
          <div className="flex gap-6 text-sm">
            <button
              onClick={() => setActiveTab('faculties')}
              className={`pb-2 transition-colors ${activeTab === 'faculties' ? 'text-black border-b-2 border-black' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Faculties & Teams
            </button>
            <button
              onClick={() => setActiveTab('materials')}
              className={`pb-2 transition-colors ${activeTab === 'materials' ? 'text-black border-b-2 border-black' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Materials
            </button>
          </div>
        </header>

        {activeTab === 'faculties' ? (
          <div className="space-y-0 divide-y divide-gray-100">
            {facultiesData.map(({ faculty, teams }) => (
              <div key={faculty._id} className="group">
                <div
                  onClick={() => toggleFaculty(faculty._id)}
                  className="flex items-center justify-between py-6 cursor-pointer hover:bg-gray-50 transition-colors px-4 -mx-4 rounded-lg"
                >
                  <div>
                    <h2 className="text-lg font-medium">{faculty.name}</h2>
                    <p className="text-sm text-gray-500 mt-1">{faculty.department}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-sm text-gray-400">{teams.length} Teams</span>
                    {expandedFaculty === faculty._id ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400" />
                    )}
                  </div>
                </div>

                {expandedFaculty === faculty._id && (
                  <div className="pb-8 pl-4">
                    {teams.length === 0 ? (
                      <div className="text-sm text-gray-400 py-2 italic">
                        No teams assigned.
                      </div>
                    ) : (
                      <div className="grid gap-8 mt-4">
                        {teams.map((team) => (
                          <div key={team._id} className="border-l-2 border-gray-100 pl-6 py-1">
                            <div className="flex items-baseline justify-between mb-2">
                              <h3 className="font-medium text-base">{team.teamName || 'Unnamed Team'}</h3>
                              <span className="text-xs text-gray-400 font-mono">
                                {new Date(team.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            <p className="text-sm text-gray-600 mb-3 leading-relaxed max-w-2xl">
                              {team.problemStatement}
                            </p>

                            <div className="flex flex-wrap gap-2">
                              {team.members.map((member) => (
                                <span key={member._id} className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-600">
                                  {member.name}
                                  <span className="ml-1.5 text-gray-400 border-l border-gray-200 pl-1.5">{member.usn}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div>
            <div className="flex justify-end mb-8">
              <button
                onClick={() => {
                  setEditingMaterial(null);
                  setMaterialForm({ name: '', dimension: '', description: '', image: null });
                  setShowMaterialModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm rounded hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Material
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {materialsData.map((material) => (
                <div key={material._id} className="group relative border border-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gray-100 overflow-hidden">
                    <img src={material.imageUrl} alt={material.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-lg">{material.name}</h3>
                      <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">{material.dimension}</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{material.description}</p>

                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(material)}
                        className="p-2 bg-white rounded-full shadow hover:text-blue-600"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMaterial(material._id)}
                        className="p-2 bg-white rounded-full shadow hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Material Modal */}
        {showMaterialModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-light">{editingMaterial ? 'Edit Material' : 'Add Material'}</h2>
                <button onClick={() => setShowMaterialModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <form onSubmit={handleMaterialSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={materialForm.name}
                    onChange={(e) => setMaterialForm({ ...materialForm, name: e.target.value })}
                    className="w-full p-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Dimension</label>
                  <input
                    type="text"
                    value={materialForm.dimension}
                    onChange={(e) => setMaterialForm({ ...materialForm, dimension: e.target.value })}
                    className="w-full p-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={materialForm.description}
                    onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
                    className="w-full p-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-black h-24 resize-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Image</label>
                  <div className="border border-dashed border-gray-300 rounded p-4 text-center cursor-pointer hover:bg-gray-50 relative">
                    <input
                      type="file"
                      onChange={(e) => setMaterialForm({ ...materialForm, image: e.target.files[0] })}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      accept="image/*"
                      required={!editingMaterial}
                    />
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <Upload className="w-5 h-5" />
                      <span className="text-xs">{materialForm.image ? materialForm.image.name : 'Click to upload'}</span>
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-black text-white py-2.5 rounded text-sm hover:bg-gray-800 transition-colors mt-4"
                >
                  {editingMaterial ? 'Update Material' : 'Add Material'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
