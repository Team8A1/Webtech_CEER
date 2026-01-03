import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Package,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Edit2,
  X,
  Upload,
  Search,
  LogOut,
  UserPlus,
  Settings,
  Lock,
  Wrench,
  BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminInstructions from './AdminInstructions';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('faculty');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Data States
  const [facultiesData, setFacultiesData] = useState([]);
  const [materialsData, setMaterialsData] = useState([]);
  const [equipmentsData, setEquipmentsData] = useState([]);
  const [eventsData, setEventsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI States
  const [expandedFaculty, setExpandedFaculty] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');


  // Forms States
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [materialForm, setMaterialForm] = useState({ name: '', dimension: '', description: '', image: null, density: 0, embodiedEnergy: 0, fixedDimension: 0, formType: 'unit' });

  const [showEventModal, setShowEventModal] = useState(false);
  const [eventForm, setEventForm] = useState({ title: '', date: '', category: '', image: null });

  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [equipmentForm, setEquipmentForm] = useState({ name: '', description: '', inCharge: '', image: null });

  const [showUserModal, setShowUserModal] = useState(false);
  const [userType, setUserType] = useState('student'); // 'student' or 'faculty'
  const [userForm, setUserForm] = useState({
    name: '', email: '', usn: '', div: '', batch: '', // Student fields
    department: '', designation: '', password: '' // Faculty fields (password for both)
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    await Promise.all([fetchDashboardData(), fetchMaterials(), fetchEvents(), fetchEquipments()]);
    setLoading(false);
  };

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      if (response.data.success) setFacultiesData(response.data.data);
    } catch (error) { console.error('Error fetching dashboard:', error); }
  };

  const fetchMaterials = async () => {
    try {
      const response = await api.get('/material/list');
      if (response.data.success) setMaterialsData(response.data.data);
    } catch (error) { console.error('Error fetching materials:', error); }
  };

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events');
      if (response.data.success) setEventsData(response.data.data);
    } catch (error) { console.error('Error fetching events:', error); }
  };

  const fetchEquipments = async () => {
    try {
      const response = await api.get('/equipment/list');
      if (response.data.success) setEquipmentsData(response.data.data);
    } catch (error) { console.error('Error fetching equipments:', error); }
  };

  // --- Handlers ---

  const handleMaterialSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(materialForm).forEach(key => formData.append(key, materialForm[key]));

    try {
      const url = editingMaterial
        ? `/material/update/${editingMaterial._id}`
        : '/material/add';

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };

      editingMaterial ? await api.put(url, formData, config) : await api.post(url, formData, config);

      alert(`Material ${editingMaterial ? 'updated' : 'added'} successfully`);
      setShowMaterialModal(false);
      setEditingMaterial(null);
      setMaterialForm({ name: '', dimension: '', description: '', image: null, density: 0, embodiedEnergy: 0, fixedDimension: 0, formType: 'unit' });
      fetchMaterials();
    } catch (error) {
      alert('Error saving material: ' + (error.response?.data?.message || error.message));
      console.error(error);
    }
  };

  const handleDeleteMaterial = async (id) => {
    if (!confirm('Delete this material?')) return;
    try {
      await api.delete(`/material/delete/${id}`);
      fetchMaterials();
    } catch (error) { alert('Error deleting material'); }
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', eventForm.title);
    formData.append('date', eventForm.date);
    formData.append('category', eventForm.category);
    if (eventForm.image) {
      formData.append('image', eventForm.image);
    }

    try {
      await api.post('/events', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Event created successfully');
      setShowEventModal(false);
      setEventForm({ title: '', date: '', category: '', image: null });
      fetchEvents();
    } catch (error) {
      alert('Error saving event: ' + (error.response?.data?.message || error.message));
      console.error(error);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!confirm('Delete this event?')) return;
    try {
      await api.delete(`/events/${id}`);
      fetchEvents();
    } catch (error) { alert('Error deleting event'); }
  };

  const handleEquipmentSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', equipmentForm.name);
    formData.append('description', equipmentForm.description);
    formData.append('inCharge', equipmentForm.inCharge);
    if (equipmentForm.image) {
      formData.append('image', equipmentForm.image);
    }

    try {
      await api.post('/equipment/add', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Equipment added successfully');
      setShowEquipmentModal(false);
      setEquipmentForm({ name: '', description: '', inCharge: '', image: null });
      fetchEquipments();
    } catch (error) {
      alert('Error saving equipment: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteEquipment = async (id) => {
    if (!confirm('Delete this equipment?')) return;
    try {
      await api.delete(`/equipment/delete/${id}`);
      fetchEquipments();
    } catch (error) { alert('Error deleting equipment'); }
  };

  const handleUserRegister = async (e) => {
    e.preventDefault();
    const endpoint = userType === 'student' ? '/student/register' : '/faculty/register';
    const payload = userType === 'student'
      ? { name: userForm.name, email: userForm.email, password: userForm.password, usn: userForm.usn, div: userForm.div, batch: userForm.batch }
      : { name: userForm.name, email: userForm.email, password: userForm.password, department: userForm.department, designation: userForm.designation };

    try {
      await api.post(`${endpoint}`, payload);
      alert(`${userType === 'student' ? 'Student' : 'Faculty'} registered successfully`);
      setShowUserModal(false);
      setUserForm({ name: '', email: '', usn: '', div: '', batch: '', department: '', designation: '', password: '' });
      if (userType === 'faculty') fetchDashboardData(); // Refresh faculty list
    } catch (error) {
      alert('Registration failed: ' + (error.response?.data?.message || 'Check console for details'));
      console.error(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login/admin');
  };


  // --- Render Helpers ---

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading Dashboard...</div>;

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">

      {/* Sidebar */}
      <aside className={`bg-black text-white transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} flex flex-col fixed h-full z-30`}>
        <div className="p-6 flex items-center justify-between">
          <span className={`font-bold text-xl tracking-tight ${!sidebarOpen && 'hidden'}`}>Admin</span>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-gray-800 rounded">
            {sidebarOpen ? <ChevronDown className="rotate-90 w-5 h-5" /> : <LayoutDashboard className="w-6 h-6" />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {[
            { id: 'faculty', label: 'Faculty & Teams', icon: <Users size={20} /> },
            { id: 'users', label: 'User Registration', icon: <UserPlus size={20} /> },
            { id: 'events', label: 'Recent Events', icon: <Calendar size={20} /> },
            { id: 'materials', label: 'Materials', icon: <Package size={20} /> },
            { id: 'equipment', label: 'Equipment', icon: <Wrench size={20} /> },
            { id: 'instructions', label: 'Student Instructions', icon: <BookOpen size={20} /> },
            { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === item.id ? 'bg-white text-black font-medium' : 'text-gray-400 hover:bg-gray-900 hover:text-white'
                }`}
            >
              {item.icon}
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-gray-900 rounded-lg transition-colors ${!sidebarOpen && 'justify-center'}`}>
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <header className="bg-white border-b border-gray-100 px-8 py-5 flex justify-between items-center sticky top-0 z-20">
          <h1 className="text-2xl font-light">
            {activeTab === 'faculty' && 'Faculty & Teams Overview'}
            {activeTab === 'users' && 'User Registration'}
            {activeTab === 'events' && 'Event Management'}
            {activeTab === 'materials' && 'Material Management'}
            {activeTab === 'equipment' && 'Equipment Management'}
            {activeTab === 'instructions' && 'Student Instructions Management'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-black rounded-full text-white flex items-center justify-center text-sm font-bold">A</div>
          </div>
        </header>

        <div className="p-8">

          {/* Faculty Tab */}
          {activeTab === 'faculty' && (
            <div className="space-y-6 max-w-5xl mx-auto">

              {/* Search & Stats Header */}
              <div className="flex flex-col md:flex-row justify-between items-end gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div>
                  <h2 className="text-xl font-bold mb-1">Faculty Directory</h2>
                  <p className="text-gray-500 text-sm">Manage guides and their assigned student teams.</p>
                </div>
                <div className="w-full md:w-72 relative">
                  <input
                    type="text"
                    placeholder="Search faculty or department..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                </div>
              </div>

              {facultiesData
                .filter(f =>
                  f.faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  f.faculty.department.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(({ faculty, teams }) => {
                  const totalStudents = teams.reduce((acc, team) => acc + team.members.length, 0);

                  return (
                    <div key={faculty._id} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group">
                      <div
                        onClick={() => setExpandedFaculty(expandedFaculty === faculty._id ? null : faculty._id)}
                        className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50/50 transition-colors"
                      >
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold text-lg group-hover:bg-black group-hover:text-white transition-colors">
                            {faculty.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-black transition-colors">{faculty.name}</h3>
                            <p className="text-sm text-gray-500 flex items-center gap-2">
                              <span className="bg-gray-100 text-xs px-2 py-0.5 rounded text-gray-600 font-medium">{faculty.department}</span>
                              <span className="text-gray-300">•</span>
                              {faculty.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-right hidden sm:block">
                            <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Allocated</div>
                            <div className="text-sm font-medium">
                              <span className="text-black">{teams.length}</span> <span className="text-gray-500">Teams</span>
                              <span className="mx-2 text-gray-300">|</span>
                              <span className="text-black">{totalStudents}</span> <span className="text-gray-500">Students</span>
                            </div>
                          </div>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${expandedFaculty === faculty._id ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-400'}`}>
                            {expandedFaculty === faculty._id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </div>
                        </div>
                      </div>

                      {expandedFaculty === faculty._id && (
                        <div className="border-t border-gray-100 bg-gray-50/30 p-6 animate-in fade-in slide-in-from-top-1 duration-200">
                          {teams.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg bg-white">
                              <Package size={24} className="mb-2 opacity-50" />
                              <p className="italic">No teams assigned yet.</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {teams.map(team => (
                                <div key={team._id} className="bg-white border border-gray-200/60 rounded-xl p-5 hover:border-black/20 hover:shadow-sm transition-all relative overflow-hidden">
                                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-gray-200 to-transparent"></div>

                                  <div className="flex justify-between items-start mb-3">
                                    <h4 className="font-bold text-base text-gray-900 line-clamp-1">{team.teamName || 'Unnamed Team'}</h4>
                                    <span className="text-[10px] text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                      {new Date(team.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>

                                  <p className="text-xs text-gray-600 mb-4 leading-relaxed line-clamp-2 min-h-[2.5em]">{team.problemStatement}</p>

                                  <div className="space-y-2">
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Members</div>
                                    <div className="flex flex-wrap gap-2">
                                      {team.members.map(m => (
                                        <div key={m._id} className="inline-flex items-center px-2 py-1 bg-gray-50 border border-gray-100 rounded text-xs hover:bg-gray-100 transition-colors cursor-default">
                                          <div className="w-1.5 h-1.5 rounded-full bg-green-400 mr-2"></div>
                                          <span className="font-medium text-gray-700">{m.name}</span>
                                          <span className="mx-1.5 text-gray-300">|</span>
                                          <span className="text-gray-500 font-mono">{m.usn}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

              {/* Empty State */}
              {facultiesData.filter(f =>
                f.faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                f.faculty.department.toLowerCase().includes(searchTerm.toLowerCase())
              ).length === 0 && (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                      <Search size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">No faculty found</h3>
                    <p className="text-gray-500">Try adjusting your search terms</p>
                  </div>
                )}
            </div>
          )}


          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="max-w-xl mx-auto">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex gap-4 mb-8 p-1 bg-gray-100 rounded-lg">
                  <button
                    onClick={() => {
                      setUserType('student');
                      setUserForm(prev => ({ ...prev, password: 'student@123' }));
                    }}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${userType === 'student' ? 'bg-white shadow text-black' : 'text-gray-500'}`}
                  >
                    Student
                  </button>
                  <button
                    onClick={() => {
                      setUserType('faculty');
                      setUserForm(prev => ({ ...prev, password: 'faculty@123' }));
                    }}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${userType === 'faculty' ? 'bg-white shadow text-black' : 'text-gray-500'}`}
                  >
                    Faculty
                  </button>
                </div>

                <form onSubmit={handleUserRegister} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Full Name</label>
                    <input type="text" required value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email Address</label>
                    <input type="email" required value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Password</label>
                    <input type="text" required value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" />
                  </div>

                  {userType === 'student' ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">USN</label>
                          <input type="text" required value={userForm.usn} onChange={e => setUserForm({ ...userForm, usn: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Division</label>
                          <input type="text" required value={userForm.div} onChange={e => setUserForm({ ...userForm, div: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Batch</label>
                        <input type="text" required value={userForm.batch} onChange={e => setUserForm({ ...userForm, batch: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Department</label>
                        <input type="text" required value={userForm.department} onChange={e => setUserForm({ ...userForm, department: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Designation</label>
                        <input type="text" required value={userForm.designation} onChange={e => setUserForm({ ...userForm, designation: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" />
                      </div>
                    </>
                  )}

                  <button type="submit" className="w-full py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors mt-4">
                    Register {userType === 'student' ? 'Student' : 'Faculty'}
                  </button>
                </form>

                {/* Bulk Upload Section for Students */}
                {userType === 'student' && (
                  <div className="mt-8 pt-8 border-t border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 mb-2">Bulk Registration (Students)</h3>
                    <p className="text-xs text-gray-500 mb-4">Upload a CSV file with columns: Name, Email, Password, USN, Division, Batch</p>

                    <div className="flex gap-4">
                      <input
                        type="file"
                        accept=".csv"
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;

                          if (confirm(`Upload and register students from ${file.name}?`)) {
                            const text = await file.text();
                            const lines = text.split('\n');
                            const headers = lines[0].toLowerCase().split(',').map(h => h.trim());

                            const students = [];

                            // Simple CSV parsing
                            for (let i = 1; i < lines.length; i++) {
                              if (!lines[i].trim()) continue;

                              const values = lines[i].split(',').map(v => v.trim());
                              const userObj = {};

                              headers.forEach((h, index) => {
                                if (h.includes('name')) userObj.name = values[index];
                                else if (h.includes('email')) userObj.email = values[index];
                                else if (h.includes('usn')) userObj.usn = values[index];
                                else if (h.includes('div')) userObj.division = values[index];
                                else if (h.includes('batch')) userObj.batch = values[index];
                              });

                              if (userObj.email && userObj.name) {
                                students.push(userObj);
                              }
                            }

                            try {
                              const response = await api.post('/admin/register/students', { students });
                              const { success, results } = response.data;
                              alert(`Bulk Registration Complete:\nSuccess: ${results.success.length}\nFailed: ${results.failed.length}`);
                            } catch (err) {
                              console.error('Bulk upload failed:', err);
                              alert('Bulk upload failed: ' + (err.response?.data?.message || err.message));
                            }

                            e.target.value = ''; // Reset input
                          }
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Bulk Upload Section for Faculty */}
                {userType === 'faculty' && (
                  <div className="mt-8 pt-8 border-t border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 mb-2">Bulk Registration (Faculty)</h3>
                    <p className="text-xs text-gray-500 mb-4">Upload a CSV file with columns: Name, Email, Department</p>

                    <div className="flex gap-4">
                      <input
                        type="file"
                        accept=".csv"
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;

                          if (confirm(`Upload and register faculty from ${file.name}?`)) {
                            const text = await file.text();
                            const lines = text.split('\n');
                            const headers = lines[0].toLowerCase().split(',').map(h => h.trim());

                            const faculties = [];

                            // Simple CSV parsing
                            for (let i = 1; i < lines.length; i++) {
                              if (!lines[i].trim()) continue;

                              const values = lines[i].split(',').map(v => v.trim());
                              const userObj = {};

                              headers.forEach((h, index) => {
                                if (h.includes('name')) userObj.name = values[index];
                                else if (h.includes('email')) userObj.email = values[index];
                                else if (h.includes('dept') || h.includes('department')) userObj.department = values[index];
                              });

                              if (userObj.email && userObj.name) {
                                faculties.push(userObj);
                              }
                            }

                            try {
                              const response = await api.post('/admin/register/faculty', { faculties });
                              const { success, results } = response.data;
                              alert(`Bulk Registration Complete:\nSuccess: ${results.success.length}\nFailed: ${results.failed.length}`);
                              fetchDashboardData(); // Refresh list
                            } catch (err) {
                              console.error('Bulk upload failed:', err);
                              alert('Bulk upload failed: ' + (err.response?.data?.message || err.message));
                            }

                            e.target.value = ''; // Reset input
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-end mb-8">
                <button onClick={() => setShowEventModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                  <Plus size={18} /> Add New Event
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {eventsData.map(event => (
                  <div key={event._id} className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all">
                    <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                      <img src={event.image || event.imageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleDeleteEvent(event._id)} className="p-2 bg-white/90 rounded-full shadow-sm hover:text-red-600 backdrop-blur-sm">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <span className="px-3 py-1 bg-black/70 backdrop-blur-md text-white text-xs font-bold rounded-full uppercase tracking-wider">
                          {event.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-lg mb-1">{event.title}</h3>
                      <p className="text-gray-500 text-sm mb-0">{event.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Materials Tab */}
          {activeTab === 'materials' && (
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-end mb-8">
                <button
                  onClick={() => {
                    setEditingMaterial(null);
                    setMaterialForm({ name: '', dimension: '', description: '', image: null, density: 0, embodiedEnergy: 0, fixedDimension: 0, formType: 'unit' });
                    setShowMaterialModal(true);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Plus size={18} /> Add Material
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {materialsData.map(material => (
                  <div key={material._id} className="group relative bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all">
                    <div className="aspect-square bg-gray-100 overflow-hidden relative">
                      <img src={material.imageUrl} alt={material.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingMaterial(material); setMaterialForm(material); setShowMaterialModal(true); }} className="p-2 bg-white rounded-full shadow hover:text-blue-600">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDeleteMaterial(material._id)} className="p-2 bg-white rounded-full shadow hover:text-red-600">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold text-gray-900 truncate pr-2">{material.name}</h3>
                      </div>
                      <p className="text-xs text-gray-500 bg-gray-50 inline-block px-2 py-0.5 rounded mb-2">{material.dimension}</p>
                      <p className="text-sm text-gray-500 line-clamp-2">{material.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Equipment Tab */}
          {activeTab === 'equipment' && (
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-end mb-8">
                <button
                  onClick={() => setShowEquipmentModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Plus size={18} /> Add Equipment
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {equipmentsData.map(item => (
                  <div key={item._id} className="group relative bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all">
                    <div className="aspect-video bg-gray-100 overflow-hidden relative">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleDeleteEquipment(item._id)} className="p-2 bg-white rounded-full shadow hover:text-red-600">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">In Charge: {item.inCharge}</p>
                      <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="max-w-xl mx-auto">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-black">
                    <Lock size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Security Settings</h2>
                    <p className="text-sm text-gray-500">Manage your password and security preferences</p>
                  </div>
                </div>

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const current = e.target.currentPassword.value;
                  const newPass = e.target.newPassword.value;
                  const confirmPass = e.target.confirmPassword.value;

                  if (newPass !== confirmPass) {
                    alert("New passwords do not match");
                    return;
                  }

                  try {
                    const response = await api.post('/admin/change-password', {
                      currentPassword: current,
                      newPassword: newPass
                    });
                    if (response.data.success) {
                      alert('Password updated successfully');
                      e.target.reset();
                    }
                  } catch (error) {
                    alert(error.response?.data?.message || 'Failed to update password');
                  }
                }} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Current Password</label>
                    <input name="currentPassword" type="password" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-black transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">New Password</label>
                    <input name="newPassword" type="password" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-black transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Confirm New Password</label>
                    <input name="confirmPassword" type="password" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-black transition-all" />
                  </div>

                  <button type="submit" className="w-full py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors mt-4">
                    Update Password
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'instructions' && (
            <AdminInstructions />
          )}
        </div>

        {/* --- Modals --- */}

        {/* Material Modal */}
        {
          showMaterialModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">{editingMaterial ? 'Edit Material' : 'Add Material'}</h2>
                  <button onClick={() => setShowMaterialModal(false)}><X className="text-gray-400 hover:text-black" /></button>
                </div>
                <form onSubmit={handleMaterialSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Name" required value={materialForm.name} onChange={e => setMaterialForm({ ...materialForm, name: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-black" />
                    <select value={materialForm.formType || 'unit'} onChange={e => setMaterialForm({ ...materialForm, formType: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-black">
                      <option value="unit">Unit (Item)</option>
                      <option value="sheet">Sheet</option>
                      <option value="rod">Rod</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Dynamic Fixed Dimension Input */}
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">
                        {materialForm.formType === 'sheet' ? 'Thickness (mm)' :
                          materialForm.formType === 'rod' ? 'Diameter (mm)' :
                            'Weight (kg) [Optional]'}
                      </label>
                      <input type="number" step="any" placeholder="0" value={materialForm.fixedDimension || ''} onChange={e => setMaterialForm({ ...materialForm, fixedDimension: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-black" />
                    </div>

                    {/* Embodied Energy */}
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Energy Coeff (MJ/kg)</label>
                      <input type="number" step="any" required placeholder="MJ/kg" value={materialForm.embodiedEnergy || ''} onChange={e => setMaterialForm({ ...materialForm, embodiedEnergy: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-black" />
                    </div>
                  </div>

                  {(materialForm.formType === 'sheet' || materialForm.formType === 'rod') && (
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Density (kg/m³)</label>
                      <input type="number" step="any" placeholder="Density" value={materialForm.density || ''} onChange={e => setMaterialForm({ ...materialForm, density: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-black" />
                    </div>
                  )}

                  <input type="text" placeholder="Display Dimension (e.g. '5mm' or '20x20cm')" required value={materialForm.dimension} onChange={e => setMaterialForm({ ...materialForm, dimension: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-black" />
                  <textarea placeholder="Description" required value={materialForm.description} onChange={e => setMaterialForm({ ...materialForm, description: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-black h-24 resize-none" />

                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors relative">
                    <input type="file" accept="image/*" onChange={e => setMaterialForm({ ...materialForm, image: e.target.files[0] })} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Upload size={24} />
                      <span className="text-sm">{materialForm.image?.name || 'Upload Image'}</span>
                    </div>
                  </div>
                  <button type="submit" className="w-full py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800">Save Material</button>
                </form>
              </div>
            </div>
          )
        }

        {/* Event Modal */}
        {
          showEventModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Add New Event</h2>
                  <button onClick={() => setShowEventModal(false)}><X className="text-gray-400 hover:text-black" /></button>
                </div>
                <form onSubmit={handleEventSubmit} className="space-y-4">
                  <input type="text" placeholder="Event Title" required value={eventForm.title} onChange={e => setEventForm({ ...eventForm, title: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-black" />
                  <input type="text" placeholder="Date (e.g. Dec 15, 2025)" required value={eventForm.date} onChange={e => setEventForm({ ...eventForm, date: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-black" />
                  <input type="text" placeholder="Category (e.g. Conference)" required value={eventForm.category} onChange={e => setEventForm({ ...eventForm, category: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-black" />
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors relative">
                    <input type="file" accept="image/*" onChange={e => setEventForm({ ...eventForm, image: e.target.files[0] })} className="absolute inset-0 opacity-0 cursor-pointer" required />
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Upload size={24} />
                      <span className="text-sm">{eventForm.image?.name || 'Upload Event Image'}</span>
                    </div>
                  </div>
                  <button type="submit" className="w-full py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800">Create Event</button>
                </form>
              </div>
            </div>
          )
        }

        {/* Equipment Modal */}
        {
          showEquipmentModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Add New Equipment</h2>
                  <button onClick={() => setShowEquipmentModal(false)}><X className="text-gray-400 hover:text-black" /></button>
                </div>
                <form onSubmit={handleEquipmentSubmit} className="space-y-4">
                  <input type="text" placeholder="Equipment Name" required value={equipmentForm.name} onChange={e => setEquipmentForm({ ...equipmentForm, name: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-black" />
                  <input type="text" placeholder="Person In Charge" required value={equipmentForm.inCharge} onChange={e => setEquipmentForm({ ...equipmentForm, inCharge: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-black" />
                  <textarea placeholder="Description" required value={equipmentForm.description} onChange={e => setEquipmentForm({ ...equipmentForm, description: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-black h-24 resize-none" />

                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors relative">
                    <input type="file" accept="image/*" onChange={e => setEquipmentForm({ ...equipmentForm, image: e.target.files[0] })} className="absolute inset-0 opacity-0 cursor-pointer" required />
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Upload size={24} />
                      <span className="text-sm">{equipmentForm.image?.name || 'Upload Equipment Image'}</span>
                    </div>
                  </div>
                  <button type="submit" className="w-full py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800">Add Equipment</button>
                </form>
              </div>
            </div>
          )
        }

      </main >
    </div >
  );
};

export default AdminDashboard;
