import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronRight, Plus, Trash2, Edit2, X, Upload, Calendar } from 'lucide-react';

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


  // Event State
  const [eventsData, setEventsData] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    date: '',
    description: '',
    image: null
  });

  // Registration State
  const [registrationType, setRegistrationType] = useState('student');
  const [registrationRows, setRegistrationRows] = useState([{ name: '', email: '', department: '' }]);
  const [bulkResult, setBulkResult] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    fetchMaterials();
    fetchEvents();
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

  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/events');
      if (response.data.success) {
        setEventsData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', eventForm.title);
    formData.append('date', eventForm.date);
    formData.append('description', eventForm.description);
    if (eventForm.image) {
      formData.append('image', eventForm.image);
    }

    try {
      if (editingEvent) {
        await axios.put(`http://localhost:8000/api/events/${editingEvent._id}`, formData);
        alert('Event updated successfully');
      } else {
        await axios.post('http://localhost:8000/api/events', formData);
        alert('Event added successfully');
      }
      setShowEventModal(false);
      setEditingEvent(null);
      setEventForm({ title: '', date: '', description: '', image: null });
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Error saving event');
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await axios.delete(`http://localhost:8000/api/events/${id}`);
      fetchEvents();
      alert('Event deleted successfully');
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Error deleting event');
    }
  };

  const openEditEventModal = (event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      date: event.date.split('T')[0], // Format date for input
      description: event.description,
      image: null
    });
    setShowEventModal(true);
  };

  const handleAddRow = () => {
    setRegistrationRows([...registrationRows, { name: '', email: '', department: '' }]);
  };

  const handleRemoveRow = (index) => {
    if (registrationRows.length === 1) return;
    const newRows = registrationRows.filter((_, i) => i !== index);
    setRegistrationRows(newRows);
  };

  const handleRowChange = (index, field, value) => {
    const newRows = [...registrationRows];
    newRows[index][field] = value;
    setRegistrationRows(newRows);
  };

  const handleBulkRegister = async () => {
    // Validate rows
    const validRows = registrationRows.filter(row => row.name.trim() && row.email.trim());

    if (validRows.length === 0) {
      alert('Please enter at least one valid entry with Name and Email');
      return;
    }

    try {
      const endpoint = registrationType === 'student'
        ? 'http://localhost:8000/api/admin/register/students'
        : 'http://localhost:8000/api/admin/register/faculty';

      const payload = registrationType === 'student'
        ? { students: validRows }
        : { faculties: validRows };

      const response = await axios.post(endpoint, payload);

      if (response.data.success) {
        setBulkResult(response.data.results);
        setRegistrationRows([{ name: '', email: '', department: '' }]); // Reset form
        if (registrationType === 'faculty') fetchDashboardData();
        alert(`Process Complete.\nSuccess: ${response.data.results.success.length}\nFailed: ${response.data.results.failed.length}`);
      }
    } catch (error) {
      console.error('Bulk registration error:', error);
      alert('Error during registration process');
    }
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
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-light tracking-tight text-black">Admin Dashboard</h1>
            <p className="text-sm text-gray-400 mt-2 font-light">Manage your institution's resources and users</p>
          </div>
          <div className="flex gap-8 text-sm font-medium">
            {['faculties', 'materials', 'events', 'registration'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`transition-all duration-300 ${activeTab === tab
                  ? 'text-black'
                  : 'text-gray-300 hover:text-gray-500'
                  } capitalize`}
              >
                {tab === 'faculties' ? 'Faculties' : tab}
              </button>
            ))}
          </div>
        </header>



        {activeTab === 'faculties' && (
          <div className="space-y-4">
            {facultiesData.map(({ faculty, teams }) => (
              <div key={faculty._id} className="group">
                <div
                  onClick={() => toggleFaculty(faculty._id)}
                  className="flex items-center justify-between py-4 cursor-pointer hover:opacity-70 transition-opacity"
                >
                  <div className="flex items-baseline gap-4">
                    <h2 className="text-lg font-normal">{faculty.name}</h2>
                    <span className="text-xs text-gray-400 font-light uppercase tracking-wider">{faculty.department}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-300 font-mono">{teams.length} TEAMS</span>
                    {expandedFaculty === faculty._id ? (
                      <ChevronDown className="w-3 h-3 text-black" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-gray-300" />
                    )}
                  </div>
                </div>

                {expandedFaculty === faculty._id && (
                  <div className="pb-8 pl-0">
                    {teams.length === 0 ? (
                      <div className="text-xs text-gray-300 py-2 font-light">
                        No active teams.
                      </div>
                    ) : (
                      <div className="grid gap-6 mt-4">
                        {teams.map((team) => (
                          <div key={team._id} className="pl-4 border-l border-gray-100/50">
                            <div className="flex items-baseline justify-between mb-1">
                              <h3 className="font-medium text-sm">{team.teamName || 'Unnamed Team'}</h3>
                              <span className="text-[10px] text-gray-300 font-mono">
                                {new Date(team.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            <p className="text-xs text-gray-500 mb-2 leading-relaxed max-w-xl font-light">
                              {team.problemStatement}
                            </p>

                            <div className="flex flex-wrap gap-x-4 gap-y-1">
                              {team.members.map((member) => (
                                <span key={member._id} className="text-xs text-gray-400 font-light">
                                  {member.name} <span className="text-gray-200">/</span> {member.usn}
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
        )}

        {activeTab === 'materials' && (
          <div>
            <div className="flex justify-end mb-12">
              <button
                onClick={() => {
                  setEditingMaterial(null);
                  setMaterialForm({ name: '', dimension: '', description: '', image: null });
                  setShowMaterialModal(true);
                }}
                className="group flex items-center gap-3 text-sm font-medium hover:opacity-70 transition-opacity"
              >
                <span>Add Material</span>
                <span className="border border-black rounded-full p-1 group-hover:bg-black group-hover:text-white transition-colors">
                  <Plus className="w-3 h-3" />
                </span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12">
              {materialsData.map((material) => (
                <div key={material._id} className="group relative">
                  <div className="aspect-[4/3] bg-gray-50 overflow-hidden mb-4 rounded-sm">
                    <img src={material.imageUrl} alt={material.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                  </div>
                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-medium text-sm">{material.name}</h3>
                      <span className="text-[10px] text-gray-400">{material.dimension}</span>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed font-light">{material.description}</p>

                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => openEditModal(material)}
                        className="p-1.5 bg-white/90 backdrop-blur rounded-full hover:bg-black hover:text-white transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteMaterial(material._id)}
                        className="p-1.5 bg-white/90 backdrop-blur rounded-full hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div>
            <div className="flex justify-end mb-12">
              <button
                onClick={() => {
                  setEditingEvent(null);
                  setEventForm({ title: '', date: '', description: '', image: null });
                  setShowEventModal(true);
                }}
                className="group flex items-center gap-3 text-sm font-medium hover:opacity-70 transition-opacity"
              >
                <span>Add Event</span>
                <span className="border border-black rounded-full p-1 group-hover:bg-black group-hover:text-white transition-colors">
                  <Plus className="w-3 h-3" />
                </span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
              {eventsData.map((event) => (
                <div key={event._id} className="group relative">
                  <div className="aspect-video bg-gray-50 overflow-hidden mb-4 rounded-sm">
                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                  </div>
                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-medium text-sm">{event.title}</h3>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed font-light">{event.description}</p>

                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => openEditEventModal(event)}
                        className="p-1.5 bg-white/90 backdrop-blur rounded-full hover:bg-black hover:text-white transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event._id)}
                        className="p-1.5 bg-white/90 backdrop-blur rounded-full hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'registration' && (
          <div className="max-w-4xl">
            <div className="flex items-center gap-8 mb-12">
              <h2 className="text-xl font-light">Bulk Registration</h2>
              <div className="h-px bg-gray-100 flex-1"></div>
              <div className="flex gap-4">
                <button
                  onClick={() => setRegistrationType('student')}
                  className={`text-sm transition-colors ${registrationType === 'student' ? 'text-black font-medium' : 'text-gray-300'}`}
                >
                  Student
                </button>
                <button
                  onClick={() => setRegistrationType('faculty')}
                  className={`text-sm transition-colors ${registrationType === 'faculty' ? 'text-black font-medium' : 'text-gray-300'}`}
                >
                  Faculty
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {registrationRows.map((row, index) => (
                <div key={index} className="flex gap-6 items-end group">
                  <div className="w-8 text-xs text-gray-300 mb-3">{index + 1}.</div>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Name"
                      value={row.name}
                      onChange={(e) => handleRowChange(index, 'name', e.target.value)}
                      className="w-full py-2 bg-transparent border-b border-gray-200 text-sm focus:outline-none focus:border-black transition-colors placeholder-gray-200"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="email"
                      placeholder="Email"
                      value={row.email}
                      onChange={(e) => handleRowChange(index, 'email', e.target.value)}
                      className="w-full py-2 bg-transparent border-b border-gray-200 text-sm focus:outline-none focus:border-black transition-colors placeholder-gray-200"
                    />
                  </div>
                  {registrationType === 'faculty' && (
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Department"
                        value={row.department}
                        onChange={(e) => handleRowChange(index, 'department', e.target.value)}
                        className="w-full py-2 bg-transparent border-b border-gray-200 text-sm focus:outline-none focus:border-black transition-colors placeholder-gray-200"
                      />
                    </div>
                  )}
                  <button
                    onClick={() => handleRemoveRow(index)}
                    className="p-2 text-gray-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mt-12">
              <button
                onClick={handleAddRow}
                className="text-sm text-gray-400 hover:text-black transition-colors flex items-center gap-2"
              >
                <Plus className="w-3 h-3" /> Add another entry
              </button>

              <div className="flex items-center gap-6">
                {bulkResult && (
                  <span className="text-xs font-mono text-gray-400">
                    SUCCESS: {bulkResult.success.length} / FAIL: {bulkResult.failed.length}
                  </span>
                )}
                <button
                  onClick={handleBulkRegister}
                  className="bg-black text-white px-8 py-2 text-sm hover:opacity-80 transition-opacity rounded-sm"
                >
                  Process
                </button>
              </div>
            </div>

            {bulkResult && bulkResult.failed.length > 0 && (
              <div className="mt-6 bg-red-50 p-4 rounded-lg border border-red-100">
                <h4 className="text-red-800 font-medium text-sm mb-2">Failed Entries</h4>
                <ul className="space-y-1">
                  {bulkResult.failed.map((fail, i) => (
                    <li key={i} className="text-xs text-red-600">
                      {fail.email}: {fail.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
              <form onSubmit={handleMaterialSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-2">Name</label>
                  <input
                    type="text"
                    value={materialForm.name}
                    onChange={(e) => setMaterialForm({ ...materialForm, name: e.target.value })}
                    className="w-full py-2 border-b border-gray-200 text-sm focus:outline-none focus:border-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-2">Dimension</label>
                  <input
                    type="text"
                    value={materialForm.dimension}
                    onChange={(e) => setMaterialForm({ ...materialForm, dimension: e.target.value })}
                    className="w-full py-2 border-b border-gray-200 text-sm focus:outline-none focus:border-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-2">Description</label>
                  <textarea
                    value={materialForm.description}
                    onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
                    className="w-full py-2 border-b border-gray-200 text-sm focus:outline-none focus:border-black h-24 resize-none bg-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-2">Image</label>
                  <div className="border border-gray-100 rounded-sm p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors relative">
                    <input
                      type="file"
                      onChange={(e) => setMaterialForm({ ...materialForm, image: e.target.files[0] })}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      accept="image/*"
                      required={!editingMaterial}
                    />
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Upload className="w-4 h-4" />
                      <span className="text-xs font-light">{materialForm.image ? materialForm.image.name : 'Upload Image'}</span>
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-black text-white py-3 text-sm hover:opacity-80 transition-opacity"
                >
                  {editingMaterial ? 'Update Material' : 'Add Material'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Event Modal */}
        {showEventModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-light">{editingEvent ? 'Edit Event' : 'Add Event'}</h2>
                <button onClick={() => setShowEventModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <form onSubmit={handleEventSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-2">Title</label>
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    className="w-full py-2 border-b border-gray-200 text-sm focus:outline-none focus:border-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-2">Date</label>
                  <input
                    type="date"
                    value={eventForm.date}
                    onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                    className="w-full py-2 border-b border-gray-200 text-sm focus:outline-none focus:border-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-2">Description</label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    className="w-full py-2 border-b border-gray-200 text-sm focus:outline-none focus:border-black h-24 resize-none bg-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-2">Image</label>
                  <div className="border border-gray-100 rounded-sm p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors relative">
                    <input
                      type="file"
                      onChange={(e) => setEventForm({ ...eventForm, image: e.target.files[0] })}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      accept="image/*"
                      required={!editingEvent}
                    />
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Upload className="w-4 h-4" />
                      <span className="text-xs font-light">{eventForm.image ? eventForm.image.name : 'Upload Image'}</span>
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-black text-white py-3 text-sm hover:opacity-80 transition-opacity"
                >
                  {editingEvent ? 'Update Event' : 'Add Event'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div >
  );
};

export default AdminDashboard;
