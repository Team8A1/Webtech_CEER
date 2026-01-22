import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, X, ArrowLeft } from 'lucide-react';
import api from '../utils/api';
import ImageUploadZone from '../components/ImageUploadZone';

const AdminProjects = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [form, setForm] = useState({ title: '', date: '', category: '', snippet: '' });
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await api.get('/projects');
            if (response.data.success) {
                setProjects(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('date', form.date);
            formData.append('category', form.category);
            formData.append('snippet', form.snippet);

            if (imageFile) {
                formData.append('image', imageFile);
            }

            if (editingProject) {
                await api.put(`/projects/${editingProject._id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('Project updated successfully');
            } else {
                await api.post('/projects', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('Project created successfully');
            }
            setShowModal(false);
            setEditingProject(null);
            setForm({ title: '', date: '', category: '', snippet: '' });
            setImageFile(null);
            fetchProjects();
        } catch (error) {
            alert('Error saving project: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleEdit = (project) => {
        setEditingProject(project);
        setForm({
            title: project.title,
            date: project.date,
            category: project.category,
            snippet: project.snippet
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this project?')) return;
        try {
            await api.delete(`/projects/${id}`);
            alert('Project deleted successfully');
            fetchProjects();
        } catch (error) {
            alert('Error deleting project: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="min-h-screen bg-stone-50">
            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/admin/dashboard')}
                        className="mb-4 inline-flex items-center gap-2 text-stone-500 hover:text-maroon-700 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Back to Dashboard
                    </button>
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-serif text-stone-900 mb-2">Manage Projects</h1>
                            <p className="text-stone-500">Add, edit, or remove projects for the landing page</p>
                        </div>
                        <button
                            onClick={() => {
                                setEditingProject(null);
                                setForm({ title: '', date: '', category: '', snippet: '' });
                                setImageFile(null);
                                setShowModal(true);
                            }}
                            className="flex items-center gap-2 px-6 py-3 bg-maroon-700 text-white rounded-xl hover:bg-maroon-800 transition-all shadow-lg"
                        >
                            <Plus size={20} />
                            Add New Project
                        </button>
                    </div>
                </div>

                {/* Projects List */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-maroon-700"></div>
                        <p className="mt-4 text-stone-500">Loading projects...</p>
                    </div>
                ) : projects.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-stone-300">
                        <p className="text-xl text-stone-500 mb-4">No projects yet</p>
                        <p className="text-stone-400">Click "Add New Project" to create your first project</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {projects.map((project) => (
                            <div
                                key={project._id}
                                className="bg-white rounded-2xl p-6 border border-stone-200 hover:border-maroon-200 hover:shadow-lg transition-all"
                            >
                                {project.image && (
                                    <img
                                        src={project.image}
                                        alt={project.title}
                                        className="w-full h-48 object-cover rounded-xl mb-4"
                                    />
                                )}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 bg-maroon-100 text-maroon-700 text-sm font-semibold rounded-full">
                                            {project.category}
                                        </span>
                                        <span className="text-sm text-stone-500">{project.date}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(project)}
                                            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(project._id)}
                                            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">{project.title}</h3>
                                <p className="text-stone-600 leading-relaxed">{project.snippet}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
                        <div className="flex items-center justify-between p-6 border-b border-stone-200">
                            <h2 className="text-2xl font-serif text-stone-900">
                                {editingProject ? 'Edit Project' : 'Add New Project'}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setEditingProject(null);
                                    setImageFile(null);
                                }}
                                className="p-2 hover:bg-stone-100 rounded-full transition-colors"
                            >
                                <X className="text-stone-400 hover:text-stone-900" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-stone-700 mb-2">Project Title</label>
                                <input
                                    type="text"
                                    required
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-maroon-500/20 focus:border-maroon-500 transition-all"
                                    placeholder="e.g., Smart Campus IoT System"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-stone-700 mb-2">Date</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.date}
                                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-maroon-500/20 focus:border-maroon-500 transition-all"
                                        placeholder="e.g., November 2025"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-stone-700 mb-2">Category</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.category}
                                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-maroon-500/20 focus:border-maroon-500 transition-all"
                                        placeholder="e.g., IoT"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-stone-700 mb-2">Description</label>
                                <textarea
                                    required
                                    value={form.snippet}
                                    onChange={(e) => setForm({ ...form, snippet: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-maroon-500/20 focus:border-maroon-500 transition-all resize-none"
                                    placeholder="Brief description of the project"
                                />
                            </div>
                            <ImageUploadZone
                                onImageSelect={setImageFile}
                                existingImage={editingProject?.image}
                                onRemove={() => setImageFile(null)}
                            />
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingProject(null);
                                        setImageFile(null);
                                    }}
                                    className="flex-1 px-6 py-3 border border-stone-300 text-stone-700 rounded-xl hover:bg-stone-50 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-maroon-700 text-white rounded-xl hover:bg-maroon-800 font-bold transition-all shadow-lg"
                                >
                                    {editingProject ? 'Update Project' : 'Create Project'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProjects;
