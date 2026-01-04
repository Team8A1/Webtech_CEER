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
  BookOpen,
  Shield,
  Activity,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminInstructions from './AdminInstructions';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');


  // Data States
  const [facultiesData, setFacultiesData] = useState([]);
  const [materialsData, setMaterialsData] = useState([]);
  const [equipmentsData, setEquipmentsData] = useState([]);
  const [eventsData, setEventsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI States
  const [expandedFaculty, setExpandedFaculty] = useState(null);
  const [selectedEquipmentView, setSelectedEquipmentView] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');


  // Forms States
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [materialForm, setMaterialForm] = useState({ name: '', dimension: '', description: '', image: null, density: 0, embodiedEnergy: 0, carbonFootprintFactor: 0, fixedDimension: 0, formType: 'unit' });

  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventForm, setEventForm] = useState({ title: '', date: '', category: '', image: null });

  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [equipmentForm, setEquipmentForm] = useState({ name: '', specification: '', description: '', additionalInfo: '', inCharge: '', image: null });

  const [showUserModal, setShowUserModal] = useState(false);
  const [userType, setUserType] = useState('student'); // 'student' or 'faculty'
  const [userForm, setUserForm] = useState({
    name: '', email: '', usn: '', div: '', batch: '', // Student fields
    department: '', designation: '', password: '', // Faculty fields (password for both)
    labName: '' // Lab In-Charge fields
  });

  // Bulk Registration Results Modal States
  const [showBulkResultsModal, setShowBulkResultsModal] = useState(false);
  const [bulkResults, setBulkResults] = useState(null);
  const [bulkType, setBulkType] = useState(''); // 'student' or 'faculty'


  // Stats Tab States
  const [selectedStatMaterials, setSelectedStatMaterials] = useState([]);
  const [statSearchTerm, setStatSearchTerm] = useState('');
  const [showStatDropdown, setShowStatDropdown] = useState(false);
  const [selectedStatTimeline, setSelectedStatTimeline] = useState('thisweek');
  const [statsData, setStatsData] = useState([]);
  const [impactData, setImpactData] = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);

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

  const fetchMaterialStats = async () => {
    if (selectedStatMaterials.length === 0) {
      setStatsData([]);
      return;
    }
    setStatsLoading(true);
    try {
      const mats = selectedStatMaterials.join(',');
      const response = await api.get(`/admin/material-stats?materials=${encodeURIComponent(mats)}&timeline=${selectedStatTimeline}`);
      if (response.data.success) {
        setStatsData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching material stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchImpactStats = async () => {
    try {
      const response = await api.get(`/admin/impact-stats?timeline=${selectedStatTimeline}`);
      if (response.data.success) {
        setImpactData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching impact stats:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'stats') {
      fetchMaterialStats();
      fetchImpactStats();
    }
  }, [selectedStatMaterials, selectedStatTimeline, activeTab]);

  useEffect(() => {
    if (materialsData.length > 0 && selectedStatMaterials.length === 0) {
      setSelectedStatMaterials([materialsData[0].name]);
    }
  }, [materialsData]);

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
      setMaterialForm({ name: '', dimension: '', description: '', image: null, density: 0, embodiedEnergy: 0, carbonFootprintFactor: 0, fixedDimension: 0, formType: 'unit' });
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
      if (editingEvent) {
        await api.put(`/events/${editingEvent._id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        alert('Event updated successfully');
      } else {
        await api.post('/events', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        alert('Event created successfully');
      }
      setShowEventModal(false);
      setEditingEvent(null);
      setEventForm({ title: '', date: '', category: '', image: null });
      fetchEvents();
    } catch (error) {
      alert('Error saving event: ' + (error.response?.data?.message || error.message));
      console.error(error);
    }
  };

  const handleToggleEventStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/events/${id}/toggle-status`);
      fetchEvents();
    } catch (error) {
      alert('Error toggling event status: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!confirm('Delete this event?')) return;
    try {
      await api.delete(`/events/${id}`);
      fetchEvents();
    } catch (error) { alert('Error deleting event'); }
  };



  const [isDragging, setIsDragging] = useState(false);

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type !== 'application/pdf' && file.type !== 'text/csv' && file.type !== 'application/vnd.ms-excel') {
      alert('Please upload a PDF or CSV file');
      return;
    }

    if (!confirm(`Import items from ${file.name}?`)) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true); // Show loading state
      const response = await api.post('/equipment/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(response.data.message);
      fetchEquipments();
    } catch (error) {
      alert('Bulk import failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEquipmentSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', equipmentForm.name);
    formData.append('specification', equipmentForm.specification);
    formData.append('description', equipmentForm.description);
    formData.append('additionalInfo', equipmentForm.additionalInfo);
    formData.append('inCharge', equipmentForm.inCharge);
    if (equipmentForm.image) {
      formData.append('image', equipmentForm.image);
    }

    try {
      if (!editingEquipment && !equipmentForm.image) {
        alert('Please upload an image for the equipment');
        return;
      }

      if (editingEquipment) {
        await api.put(`/equipment/update/${editingEquipment._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Equipment updated successfully');
      } else {
        await api.post('/equipment/add', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Equipment added successfully');
      }
      setShowEquipmentModal(false);
      setEditingEquipment(null);
      setEquipmentForm({ name: '', specification: '', description: '', additionalInfo: '', inCharge: '', image: null });
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

    let endpoint = '';
    let payload = {};

    if (userType === 'student') {
      endpoint = '/student/register';
      payload = { name: userForm.name, email: userForm.email, password: userForm.password, usn: userForm.usn, div: userForm.div, batch: userForm.batch };
    } else if (userType === 'faculty') {
      endpoint = '/faculty/register';
      payload = { name: userForm.name, email: userForm.email, password: userForm.password, department: userForm.department, designation: userForm.designation };
    } else if (userType === 'labIncharge') {
      endpoint = '/lab/register';
      payload = { name: userForm.name, email: userForm.email, password: userForm.password, labName: userForm.labName };
    }

    try {
      await api.post(`${endpoint}`, payload);
      alert(`${userType === 'student' ? 'Student' : userType === 'faculty' ? 'Faculty' : 'Lab In-Charge'} registered successfully`);
      setShowUserModal(false);
      setUserForm({ name: '', email: '', usn: '', div: '', batch: '', department: '', designation: '', password: '', labName: '' });
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

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500 font-serif">Loading Dashboard...</div>;

  return (
    <div className="h-screen bg-stone-50 font-sans text-stone-900 selection:bg-maroon-400 selection:text-white flex flex-col overflow-hidden">

      {/* Top Navigation */}
      <header className="bg-[#0F172B] text-white flex-none z-50 shadow-lg border-b border-white/5">
        <div className="max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-3">
              <Shield size={24} className="text-red-400" />
              <span className="font-serif text-2xl tracking-wide text-white">
                Admin<span className="text-red-400">.</span>
              </span>
            </div>

            {/* Navigation Links */}
            <nav className="hidden xl:flex items-center gap-10">
              {[
                { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={16} /> },
                { id: 'faculty', label: 'Faculty', icon: <Users size={16} /> },
                { id: 'users', label: 'Users', icon: <UserPlus size={16} /> },
                { id: 'events', label: 'Events', icon: <Calendar size={16} /> },
                { id: 'materials', label: 'Materials', icon: <Package size={16} /> },
                { id: 'equipment', label: 'Equipment', icon: <Wrench size={16} /> },
                { id: 'instructions', label: 'Instructions', icon: <BookOpen size={16} /> },
                { id: 'stats', label: 'Stats', icon: <Activity size={16} /> },
                { id: 'performance', label: 'Performance', icon: <Activity size={16} /> },
                { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative group flex items-center gap-2 py-2 text-sm font-medium transition-colors duration-300 ${activeTab === item.id ? 'text-white' : 'text-stone-400 hover:text-white'
                    }`}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {item.icon}
                    {item.label}
                  </span>
                  <span className={`absolute -bottom-2 left-0 h-0.5 bg-red-400 transition-all duration-300 ${activeTab === item.id ? 'w-full' : 'w-0 group-hover:w-full'
                    }`} />
                </button>
              ))}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-6">
              <button onClick={handleLogout} className="flex items-center gap-2 text-stone-400 hover:text-red-400 transition-colors text-sm font-medium group">
                <span>Logout</span>
                <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full overflow-y-auto bg-gradient-to-br from-stone-50 via-white to-stone-100">
        <header className="bg-white/80 backdrop-blur-md border-b border-indigo-50/50 px-10 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
          <div>
            <h1 className="text-2xl font-serif text-stone-900">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'faculty' && 'Faculty & Teams'}
              {activeTab === 'users' && 'User Registration'}
              {activeTab === 'events' && 'Event Management'}
              {activeTab === 'materials' && 'Material Management'}
              {activeTab === 'equipment' && 'Equipment Management'}
              {activeTab === 'instructions' && 'Student Instructions'}
              {activeTab === 'stats' && 'Material Consumption Stats'}
              {activeTab === 'performance' && 'System Analytics'}
              {activeTab === 'settings' && 'Admin Settings'}
            </h1>
            <p className="text-stone-500 text-sm mt-1 font-medium">

              {activeTab === 'faculty' && 'Oversee academic guides and student project groups'}
              {activeTab === 'users' && 'Manage system access and roles'}
              {activeTab === 'events' && 'Curate campus activities and news'}
              {activeTab === 'materials' && 'Inventory control for lab resources'}
              {activeTab === 'equipment' && 'Track and manage lab machinery'}
              {activeTab === 'instructions' && 'Update guidelines for students'}
              {activeTab === 'stats' && 'Track material usage across approved BOM requests'}
              {activeTab === 'performance' && 'Monitor server health and activity logs'}
              {activeTab === 'settings' && 'Configure system preferences'}
            </p>
          </div>
          <div className="flex items-center gap-4">
          </div>
        </header>

        <div className="p-10">

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
              {/* Hero Banner */}
              <div className="relative p-2 flex flex-col items-center justify-center text-center mb-20">
                {/* Ambient Background Glows */}
                <div className="absolute top-0 left-0 -translate-x-12 -translate-y-12 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl -z-10 mix-blend-multiply opacity-70 animate-blob"></div>
                <div className="absolute top-0 left-64 w-64 h-64 bg-purple-100/50 rounded-full blur-3xl -z-10 mix-blend-multiply opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-32 left-32 w-64 h-64 bg-pink-100/50 rounded-full blur-3xl -z-10 mix-blend-multiply opacity-70 animate-blob animation-delay-4000"></div>

                <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur-sm border border-stone-200 text-xs font-bold uppercase tracking-widest mb-4 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-stone-600">System Active</span>
                  </div>
                  <h2 className="text-5xl md:text-7xl font-serif mb-6 leading-tight text-stone-900 tracking-tight">
                    Welcome back,<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-stone-500 via-stone-800 to-stone-500 animate-gradient-x">Administrator</span>
                  </h2>
                  <p className="text-stone-600 text-lg max-w-lg mb-8 leading-relaxed font-light">
                    Manage your academic resources, track project progress, and oversee department activities from one central hub.
                  </p>
                  <div className="flex items-center gap-4">
                    <p className="text-sm font-mono text-stone-500 font-bold bg-white/60 px-4 py-2 rounded-xl border border-stone-200/50 shadow-sm inline-block backdrop-blur-md">
                      {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Right Side Visual - Abstract Dashboard */}
                <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 opacity-80">
                  <div className="relative w-48 h-48">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-48 h-48 bg-gray-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                    <div className="absolute right-10 top-1/2 -translate-y-1/2 w-48 h-48 bg-stone-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative w-32 h-32 border border-white/80 rounded-2xl backdrop-blur-sm bg-white/90 shadow-sm rotate-12 flex items-center justify-center transform transition-transform hover:rotate-0 duration-500">
                        <LayoutDashboard size={40} className="text-stone-400 opacity-80" />
                        <div className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-lg shadow-lg flex items-center justify-center animate-bounce">
                          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                        </div>
                        <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-white/80 backdrop-blur-md rounded-xl shadow-xl border border-white/50 flex items-center justify-center animate-pulse">
                          <div className="flex gap-0.5">
                            <div className="w-0.5 h-3 bg-stone-800 rounded-full"></div>
                            <div className="w-0.5 h-4 bg-stone-400 rounded-full"></div>
                            <div className="w-0.5 h-2 bg-stone-300 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="group relative bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white/50 shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-stone-100 rounded-2xl text-stone-700 shadow-inner group-hover:scale-110 transition-transform duration-300">
                        <Users size={24} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Total Faculty</p>
                        <h3 className="text-3xl font-serif text-stone-900">{facultiesData.length}</h3>
                      </div>
                    </div>
                    <div className="w-full bg-stone-200/50 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-stone-800 h-full rounded-full transition-all duration-1000 group-hover:w-[80%]" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="group relative bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white/50 shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-red-50 rounded-2xl text-red-600 shadow-inner group-hover:scale-110 transition-transform duration-300">
                        <Calendar size={24} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Active Events</p>
                        <h3 className="text-3xl font-serif text-stone-900">{eventsData.length}</h3>
                      </div>
                    </div>
                    <div className="w-full bg-red-100/50 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-red-500 h-full rounded-full transition-all duration-1000 group-hover:w-[50%]" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="group relative bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white/50 shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 shadow-inner group-hover:scale-110 transition-transform duration-300">
                        <Package size={24} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Resources</p>
                        <h3 className="text-3xl font-serif text-stone-900">{materialsData.length + equipmentsData.length}</h3>
                      </div>
                    </div>
                    <div className="w-full bg-indigo-100/50 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full transition-all duration-1000 group-hover:w-[65%]" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-lg font-serif text-stone-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <button onClick={() => setShowEventModal(true)} className="group relative p-4 bg-white/80 backdrop-blur-sm border border-stone-200/60 rounded-2xl hover:border-maroon-200/50 hover:shadow-xl hover:shadow-maroon-500/10 transition-all duration-300 text-left overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-maroon-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="mb-3 p-2 w-fit bg-stone-100 rounded-xl group-hover:bg-maroon-100 group-hover:text-maroon-700 transition-colors duration-300">
                        <Plus size={20} />
                      </div>
                      <span className="font-semibold text-stone-900 block mb-1 group-hover:text-maroon-900 transition-colors">Add New Event</span>
                      <span className="text-xs text-stone-500 group-hover:text-maroon-700/70 transition-colors">Schedule a campus activity</span>
                    </div>
                  </button>

                  <button onClick={() => { setActiveTab('users'); }} className="group relative p-4 bg-white/80 backdrop-blur-sm border border-stone-200/60 rounded-2xl hover:border-emerald-200/50 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 text-left overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="mb-3 p-2 w-fit bg-stone-100 rounded-xl group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors duration-300">
                        <UserPlus size={20} />
                      </div>
                      <span className="font-semibold text-stone-900 block mb-1 group-hover:text-emerald-900 transition-colors">Register User</span>
                      <span className="text-xs text-stone-500 group-hover:text-emerald-700/70 transition-colors">Add student or faculty</span>
                    </div>
                  </button>

                  <button onClick={() => { setShowMaterialModal(true); setEditingMaterial(null); }} className="group relative p-4 bg-white/80 backdrop-blur-sm border border-stone-200/60 rounded-2xl hover:border-blue-200/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 text-left overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="mb-3 p-2 w-fit bg-stone-100 rounded-xl group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors duration-300">
                        <Package size={20} />
                      </div>
                      <span className="font-semibold text-stone-900 block mb-1 group-hover:text-blue-900 transition-colors">Add Material</span>
                      <span className="text-xs text-stone-500 group-hover:text-blue-700/70 transition-colors">Update inventory stock</span>
                    </div>
                  </button>

                  <button onClick={() => setShowEquipmentModal(true)} className="group relative p-4 bg-white/80 backdrop-blur-sm border border-stone-200/60 rounded-2xl hover:border-orange-200/50 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 text-left overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="mb-3 p-2 w-fit bg-stone-100 rounded-xl group-hover:bg-orange-100 group-hover:text-orange-700 transition-colors duration-300">
                        <Wrench size={20} />
                      </div>
                      <span className="font-semibold text-stone-900 block mb-1 group-hover:text-orange-900 transition-colors">Add Equipment</span>
                      <span className="text-xs text-stone-500 group-hover:text-orange-700/70 transition-colors">Register new machinery</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )
          }

          {/* Faculty Tab */}
          {
            activeTab === 'faculty' && (
              <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">

                {/* Search & Stats Header */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-4 bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white shadow-sm">
                  <div>
                    <h2 className="text-xl font-serif mb-1 text-stone-800">Faculty Directory</h2>
                    <p className="text-stone-500 text-sm">Manage guides and their assigned student teams.</p>
                  </div>
                  <div className="w-full md:w-80 relative">
                    <input
                      type="text"
                      placeholder="Search faculty or department..."
                      className="w-full pl-11 pr-4 py-3 bg-white border-0 ring-1 ring-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:shadow-lg transition-all shadow-sm placeholder:text-stone-400"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="w-4 h-4 text-stone-400 absolute left-4 top-3.5" />
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
                      <div key={faculty._id} className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
                        <div
                          onClick={() => setExpandedFaculty(expandedFaculty === faculty._id ? null : faculty._id)}
                          className="flex items-center justify-between p-6 cursor-pointer hover:bg-stone-50/50 transition-colors"
                        >
                          <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-gradient-to-br from-stone-100 to-stone-200 rounded-2xl flex items-center justify-center text-stone-500 font-serif text-xl group-hover:from-maroon-700 group-hover:to-maroon-900 group-hover:text-white transition-all shadow-inner">
                              {faculty.name.charAt(0)}
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-stone-900 group-hover:text-maroon-700 transition-colors font-serif">{faculty.name}</h3>
                              <p className="text-sm text-stone-500 flex items-center gap-2 font-medium">
                                <span className="bg-stone-100 text-xs px-2.5 py-0.5 rounded-md text-stone-600 border border-stone-200">{faculty.department}</span>
                                <span className="text-stone-300">•</span>
                                {faculty.email}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-8">
                            <div className="text-right hidden sm:block">
                              <div className="text-[10px] text-stone-400 uppercase tracking-widest font-bold mb-0.5">Allocated</div>
                              <div className="text-sm font-medium">
                                <span className="text-stone-900 font-bold">{teams.length}</span> <span className="text-stone-500">Teams</span>
                                <span className="mx-3 text-stone-300">|</span>
                                <span className="text-stone-900 font-bold">{totalStudents}</span> <span className="text-stone-500">Students</span>
                              </div>
                            </div>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${expandedFaculty === faculty._id ? 'bg-maroon-700 text-white border-maroon-700 shadow-lg shadow-maroon-900/20' : 'border-stone-200 text-stone-400 group-hover:border-maroon-200 group-hover:text-maroon-400'}`}>
                              {expandedFaculty === faculty._id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            </div>
                          </div>
                        </div>

                        {expandedFaculty === faculty._id && (
                          <div className="border-t border-stone-100 bg-stone-50/50 p-6 animate-in fade-in slide-in-from-top-1 duration-200">
                            {teams.length === 0 ? (
                              <div className="flex flex-col items-center justify-center py-10 text-stone-400 border-2 border-dashed border-stone-200 rounded-xl bg-white/50">
                                <Package size={32} className="mb-3 opacity-30" />
                                <p className="font-serif italic text-stone-500">No teams assigned yet.</p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                {teams.map(team => (
                                  <div key={team._id} className="bg-white border border-stone-100 rounded-xl p-6 hover:border-maroon-100 hover:shadow-lg hover:shadow-maroon-900/5 transition-all relative overflow-hidden group/team">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-stone-200 group-hover/team:bg-maroon-400 transition-colors"></div>

                                    <div className="flex justify-between items-start mb-4">
                                      <h4 className="font-bold text-lg text-stone-900 line-clamp-1 font-serif group-hover/team:text-maroon-800 transition-colors">{team.teamName || 'Unnamed Team'}</h4>
                                      <span className="text-[10px] text-stone-400 font-bold bg-stone-50 px-2 py-1 rounded border border-stone-100 uppercase tracking-wider">
                                        {new Date(team.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>

                                    <p className="text-sm text-stone-600 mb-5 leading-relaxed line-clamp-2 min-h-[3em]">{team.problemStatement}</p>

                                    <div className="space-y-3">
                                      <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Members</div>
                                      <div className="flex flex-wrap gap-2">
                                        {team.members.map(m => (
                                          <div key={m._id} className="inline-flex items-center px-2.5 py-1.5 bg-stone-50 border border-stone-100 rounded-md text-xs hover:bg-white hover:shadow-sm transition-all cursor-default">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
                                            <span className="font-medium text-stone-700">{m.name}</span>
                                            <span className="mx-2 text-stone-200">|</span>
                                            <span className="text-stone-400 font-mono tracking-tight">{m.usn}</span>
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

          {activeTab === 'performance' && (
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white/60 backdrop-blur-xl p-8 rounded-3xl border border-white/50 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-serif text-stone-900">System Performance</h3>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">Optimal</span>
                  </div>
                  <div className="space-y-6">
                    {[
                      { label: 'Server Uptime', value: '99.9%', width: 'w-[99.9%]' },
                      { label: 'Database Load', value: '12%', width: 'w-[12%]' },
                      { label: 'Storage Usage', value: '64%', width: 'w-[64%]' },
                    ].map((stat, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-stone-500">{stat.label}</span>
                          <span className="font-mono font-bold text-stone-900">{stat.value}</span>
                        </div>
                        <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                          <div className={`${stat.width} h-full bg-stone-800 rounded-full`}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/60 backdrop-blur-xl p-8 rounded-3xl border border-white/50 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-serif text-stone-900">Recent Activity</h3>
                    <button className="text-xs font-bold text-stone-400 hover:text-stone-600 transition-colors uppercase tracking-widest">View All</button>
                  </div>
                  <div className="space-y-4">
                    {[
                      { msg: 'New equipment "3D Printer" added', time: '2 hours ago', icon: <Wrench size={14} /> },
                      { msg: 'User "Dr. Smith" updated profile', time: '5 hours ago', icon: <Users size={14} /> },
                      { msg: 'System backup completed successfully', time: 'Yesterday', icon: <Shield size={14} /> },
                    ].map((activity, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 hover:bg-stone-50 rounded-xl transition-colors cursor-default group">
                        <div className="p-2 bg-stone-100 rounded-lg text-stone-500 group-hover:bg-white transition-colors">
                          {activity.icon}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-stone-800">{activity.msg}</p>
                          <p className="text-[10px] text-stone-400">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
              <div className="bg-white/60 backdrop-blur-xl p-8 rounded-3xl border border-white/50 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                  <h3 className="text-xl font-serif text-stone-900">Material Provisioning Statistics</h3>

                  <div className="flex flex-wrap gap-4 w-full md:w-auto">
                    {/* Searchable Multi-Select Dropdown */}
                    <div className="flex flex-col gap-1.5 min-w-[300px] relative">
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider ml-1">Select Materials</label>
                      <div
                        className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-sm font-medium focus-within:ring-2 focus-within:ring-maroon-500/20 cursor-pointer flex justify-between items-center"
                        onClick={() => setShowStatDropdown(!showStatDropdown)}
                      >
                        <span className="truncate max-w-[200px]">
                          {selectedStatMaterials.length > 0 ? selectedStatMaterials.join(', ') : 'Select materials...'}
                        </span>
                        <ChevronDown size={16} className={`transition-transform ${showStatDropdown ? 'rotate-180' : ''}`} />
                      </div>

                      {showStatDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-200 rounded-xl shadow-2xl z-[100] p-3 animate-in fade-in zoom-in-95 duration-200">
                          <div className="flex items-center gap-2 mb-3 bg-stone-50 p-2 rounded-lg border border-stone-100">
                            <Search size={14} className="text-stone-400" />
                            <input
                              placeholder="Search materials..."
                              className="bg-transparent border-none outline-none text-xs w-full"
                              value={statSearchTerm}
                              onChange={(e) => setStatSearchTerm(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
                            {materialsData.filter(m => m.name.toLowerCase().includes(statSearchTerm.toLowerCase())).map(m => (
                              <label key={m._id} className="flex items-center gap-2 p-2 hover:bg-stone-50 rounded-lg cursor-pointer transition-colors group">
                                <input
                                  type="checkbox"
                                  className="accent-maroon-700 h-4 w-4 rounded"
                                  checked={selectedStatMaterials.includes(m.name)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedStatMaterials([...selectedStatMaterials, m.name]);
                                    } else {
                                      setSelectedStatMaterials(selectedStatMaterials.filter(name => name !== m.name));
                                    }
                                  }}
                                />
                                <span className="text-xs font-medium text-stone-700 group-hover:text-stone-900">{m.name}</span>
                              </label>
                            ))}
                            {materialsData.filter(m => m.name.toLowerCase().includes(statSearchTerm.toLowerCase())).length === 0 && (
                              <div className="text-center py-4 text-xs text-stone-400">No materials found</div>
                            )}
                          </div>
                          <div className="mt-3 pt-3 border-t border-stone-100 flex justify-end">
                            <button
                              onClick={() => setShowStatDropdown(false)}
                              className="text-[10px] font-bold text-maroon-700 uppercase tracking-widest hover:text-maroon-800 transition-colors"
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Timeline Dropdown */}
                    <div className="flex flex-col gap-1.5 min-w-[150px]">
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider ml-1">Timeline</label>
                      <select
                        value={selectedStatTimeline}
                        onChange={(e) => setSelectedStatTimeline(e.target.value)}
                        className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-maroon-500/20 outline-none transition-all"
                      >
                        <option value="today">Today</option>
                        <option value="thisweek">This Week</option>
                        <option value="thismonth">This Month</option>
                        <option value="thisyear">This Year</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Main Graph Container */}
                <div className="overflow-x-auto pb-4 custom-scrollbar">
                  <div className={`min-w-full ${selectedStatMaterials.length > 5 ? 'w-[1500px]' : 'w-full'} h-[450px] bg-stone-50/50 rounded-2xl p-6 border border-stone-100`}>
                    {statsLoading ? (
                      <div className="h-full w-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-maroon-700"></div>
                      </div>
                    ) : statsData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={statsData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                          <XAxis
                            dataKey="time"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#78716c', fontSize: 11 }}
                            dy={15}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#78716c', fontSize: 11 }}
                          />
                          <Tooltip
                            shared={false}
                            cursor={{ fill: '#f5f5f4' }}
                            contentStyle={{
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              borderRadius: '12px',
                              border: 'none',
                              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                              fontSize: '12px'
                            }}
                          />
                          <Legend
                            iconType="circle"
                            verticalAlign="top"
                            height={36}
                            wrapperStyle={{ fontSize: '12px', paddingBottom: '20px' }}
                          />
                          {selectedStatMaterials.map((material, idx) => (
                            <Bar
                              key={material}
                              dataKey={material}
                              fill={[
                                '#881337', '#e11d48', '#fb7185', '#be123c', '#9b1c31',
                                '#1e293b', '#334155', '#475569', '#64748b'
                              ][idx % 9]}
                              radius={[4, 4, 0, 0]}
                              barSize={30}
                            />
                          ))}
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full w-full flex flex-col items-center justify-center text-stone-400">
                        <Package size={48} className="mb-4 opacity-20" />
                        <p className="text-sm font-medium">No consumption data found for this period</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Environmental Impact Graph */}
                <div className="bg-white/60 backdrop-blur-xl p-8 rounded-3xl border border-white/50 shadow-sm mt-8">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="text-xl font-serif text-stone-900">Environmental Tracking</h3>
                      <p className="text-xs text-stone-500 mt-1 uppercase tracking-widest font-bold">Total Embodied Energy Usage (MJ)</p>
                    </div>
                  </div>

                  <div className="h-[300px] w-full">
                    {impactData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={impactData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'white',
                              borderRadius: '12px',
                              border: 'none',
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="totalEnergy"
                            stroke="#881337"
                            strokeWidth={3}
                            dot={{ fill: '#881337', strokeWidth: 2, r: 4, stroke: '#fff' }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-stone-400 text-sm italic">
                        Insufficient data to generate impact report
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
              <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/50">
                <div className="flex gap-4 mb-8 p-1.5 bg-stone-100/80 rounded-xl">
                  <button
                    onClick={() => {
                      setUserType('student');
                      setUserForm(prev => ({ ...prev, password: 'student@123' }));
                    }}
                    className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all shadow-sm ${userType === 'student' ? 'bg-white text-maroon-700 shadow-md' : 'text-stone-400 hover:text-stone-600'}`}
                  >
                    Student
                  </button>
                  <button
                    onClick={() => {
                      setUserType('faculty');
                      setUserForm(prev => ({ ...prev, password: 'faculty@123' }));
                    }}
                    className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all shadow-sm ${userType === 'faculty' ? 'bg-white text-maroon-700 shadow-md' : 'text-stone-400 hover:text-stone-600'}`}
                  >
                    Faculty
                  </button>
                  <button
                    onClick={() => {
                      setUserType('labIncharge');
                      setUserForm(prev => ({ ...prev, password: 'lab@123' }));
                    }}
                    className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all shadow-sm ${userType === 'labIncharge' ? 'bg-white text-maroon-700 shadow-md' : 'text-stone-400 hover:text-stone-600'}`}
                  >
                    Lab In-Charge
                  </button>
                </div>

                <form onSubmit={handleUserRegister} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Full Name</label>
                    <input type="text" required value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-maroon-500 focus:ring-4 focus:ring-maroon-500/10 transition-all font-medium" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Email Address</label>
                    <input type="email" required value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-maroon-500 focus:ring-4 focus:ring-maroon-500/10 transition-all font-medium" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Password</label>
                    <input type="text" required value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-maroon-500 focus:ring-4 focus:ring-maroon-500/10 transition-all font-medium" />
                  </div>

                  {userType === 'student' ? (
                    <>
                      <div className="grid grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">USN</label>
                          <input type="text" required value={userForm.usn} onChange={e => setUserForm({ ...userForm, usn: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-maroon-500 focus:ring-4 focus:ring-maroon-500/10 transition-all font-medium" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Division</label>
                          <input type="text" required value={userForm.div} onChange={e => setUserForm({ ...userForm, div: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-maroon-500 focus:ring-4 focus:ring-maroon-500/10 transition-all font-medium" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Batch</label>
                        <input type="text" required value={userForm.batch} onChange={e => setUserForm({ ...userForm, batch: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-maroon-500 focus:ring-4 focus:ring-maroon-500/10 transition-all font-medium" />
                      </div>
                    </>
                  ) : userType === 'faculty' ? (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Department</label>
                        <input type="text" required value={userForm.department} onChange={e => setUserForm({ ...userForm, department: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-maroon-500 focus:ring-4 focus:ring-maroon-500/10 transition-all font-medium" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Designation</label>
                        <input type="text" required value={userForm.designation} onChange={e => setUserForm({ ...userForm, designation: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-maroon-500 focus:ring-4 focus:ring-maroon-500/10 transition-all font-medium" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Lab Name</label>
                        <input type="text" required value={userForm.labName} onChange={e => setUserForm({ ...userForm, labName: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-maroon-500 focus:ring-4 focus:ring-maroon-500/10 transition-all font-medium" />
                      </div>
                    </>
                  )}

                  <button type="submit" className="w-full py-4 bg-maroon-700 text-white font-bold rounded-xl hover:bg-maroon-800 transition-all shadow-lg shadow-maroon-900/20 active:scale-[0.98]">
                    Register {userType === 'student' ? 'Student' : userType === 'faculty' ? 'Faculty' : 'Lab In-Charge'}
                  </button>
                </form>

                {/* Bulk Upload Section for Students */}
                {userType === 'student' && (
                  <div className="mt-10 pt-10 border-t border-stone-100">
                    <h3 className="text-base font-bold text-stone-800 mb-2 font-serif">Bulk Registration (Students)</h3>
                    <p className="text-sm text-stone-500 mb-6">Upload a CSV file with columns: Name, Email, Password, USN, Division, Batch</p>

                    <div className="flex gap-4">
                      <input
                        type="file"
                        accept=".csv"
                        className="block w-full text-sm text-stone-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-stone-900 file:text-white hover:file:bg-maroon-700 file:transition-colors cursor-pointer"
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
                              setBulkResults(results);
                              setBulkType('student');
                              setShowBulkResultsModal(true);
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
                  <div className="mt-10 pt-10 border-t border-stone-100">
                    <h3 className="text-base font-bold text-stone-800 mb-2 font-serif">Bulk Registration (Faculty)</h3>
                    <p className="text-sm text-stone-500 mb-6">Upload a CSV file with columns: Name, Email, Department</p>

                    <div className="flex gap-4">
                      <input
                        type="file"
                        accept=".csv"
                        className="block w-full text-sm text-stone-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-stone-900 file:text-white hover:file:bg-maroon-700 file:transition-colors cursor-pointer"
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
                              setBulkResults(results);
                              setBulkType('faculty');
                              setShowBulkResultsModal(true);
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
            </div >
          )}

          {/* Events Tab */}
          {
            activeTab === 'events' && (
              <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
                <div className="flex justify-end mb-8">
                  <button onClick={() => { setEditingEvent(null); setEventForm({ title: '', date: '', category: '', image: null }); setShowEventModal(true); }} className="flex items-center gap-2 px-6 py-3 bg-maroon-700 text-white rounded-xl hover:bg-maroon-800 transition-all shadow-lg shadow-maroon-900/20 active:scale-[0.98] font-medium">
                    <Plus size={20} /> Add New Event
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {eventsData.map(event => (
                    <div key={event._id} className="group relative h-80 bg-stone-900 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
                      {/* Background Image & Gradient */}
                      <div className="absolute inset-0">
                        <img
                          src={event.image || event.imageUrl}
                          alt={event.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/95 via-stone-900/30 to-black/30 opacity-80 group-hover:opacity-90 transition-opacity" />
                      </div>

                      {/* Active/Inactive Badge */}
                      <div className="absolute top-4 left-4 z-20">
                        <span className={`inline-block px-3 py-1 backdrop-blur-md text-white text-[10px] font-bold rounded-full uppercase tracking-widest shadow-sm ${event.isActive ? 'bg-green-600/90' : 'bg-gray-600/90'}`}>
                          {event.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      {/* Actions (Top Right) */}
                      <div className="absolute top-4 right-4 flex gap-2 translate-y-[-20px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20">
                        <button onClick={() => { setEditingEvent(event); setEventForm(event); setShowEventModal(true); }} className="p-2.5 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-blue-600 hover:text-white transition-colors border border-white/20">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleToggleEventStatus(event._id, event.isActive)} className={`p-2.5 backdrop-blur-md rounded-full text-white transition-colors border border-white/20 ${event.isActive ? 'bg-yellow-600/50 hover:bg-yellow-700' : 'bg-green-600/50 hover:bg-green-700'}`}>
                          {event.isActive ? '○' : '●'}
                        </button>
                        <button onClick={() => handleDeleteEvent(event._id)} className="p-2.5 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-red-600 hover:text-white transition-colors border border-white/20">
                          <Trash2 size={18} />
                        </button>
                      </div>

                      {/* Content (Bottom) */}
                      <div className="absolute bottom-0 left-0 w-full p-8 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 z-10">
                        <span className="inline-block px-3 py-1 bg-red-600/90 backdrop-blur-md text-white text-[10px] font-bold rounded-full uppercase tracking-widest shadow-sm mb-3">
                          {event.category}
                        </span>
                        <h3 className="font-serif text-2xl text-white mb-2 leading-tight">{event.title}</h3>
                        <div className="flex items-center gap-2 text-stone-300 text-sm font-medium">
                          <Calendar size={14} />
                          {event.date}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          }

          {/* Materials Tab */}
          {
            activeTab === 'materials' && (
              <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
                <div className="flex justify-end mb-8">
                  <button
                    onClick={() => {
                      setEditingMaterial(null);
                      setMaterialForm({ name: '', dimension: '', description: '', image: null, density: 0, embodiedEnergy: 0, carbonFootprintFactor: 0, fixedDimension: 0, formType: 'unit' });
                      setShowMaterialModal(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-maroon-700 text-white rounded-xl hover:bg-maroon-800 transition-all shadow-lg shadow-maroon-900/20 active:scale-[0.98] font-medium"
                  >
                    <Plus size={20} /> Add Material
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {materialsData.map(material => (
                    <div key={material._id} className="group relative h-72 bg-stone-900 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
                      {/* Background */}
                      <div className="absolute inset-0">
                        <img src={material.imageUrl} alt={material.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90" />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/95 via-stone-900/20 to-black/20 opacity-80 group-hover:opacity-90 transition-opacity" />
                      </div>

                      {/* Actions */}
                      <div className="absolute top-4 right-4 flex gap-2 translate-y-[-20px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20">
                        <button onClick={() => { setEditingMaterial(material); setMaterialForm(material); setShowMaterialModal(true); }} className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-blue-600 hover:text-white transition-colors border border-white/20">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDeleteMaterial(material._id)} className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-red-600 hover:text-white transition-colors border border-white/20">
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Content */}
                      <div className="absolute bottom-0 left-0 w-full p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 z-10">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-serif text-xl text-white truncate pr-2">{material.name}</h3>
                        </div>
                        <p className="text-[10px] font-bold text-stone-300 bg-white/10 inline-block px-2.5 py-1 rounded-md mb-3 uppercase tracking-wider backdrop-blur-md border border-white/10">{material.dimension}</p>
                        <p className="text-sm text-stone-400 line-clamp-2 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">{material.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          }

          {/* Equipment Tab */}
          {
            activeTab === 'equipment' && (
              <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
                {/* Drag & Drop Zone */}
                <div
                  className={`mb-8 border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer group ${isDragging ? 'border-maroon-500 bg-maroon-50' : 'border-stone-200 bg-stone-50/50 hover:bg-stone-50 hover:border-maroon-200'}`}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
                  onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }}
                  onDrop={handleBulkUpload}
                  onClick={() => document.getElementById('bulk-upload-input').click()}
                >
                  <input
                    id="bulk-upload-input"
                    type="file"
                    accept=".pdf,.csv"
                    className="hidden"
                    onChange={handleBulkUpload}
                  />
                  <div className="p-4 bg-white rounded-full text-maroon-700 shadow-sm mb-3 group-hover:scale-110 transition-transform duration-300">
                    <Upload size={32} />
                  </div>
                  <h3 className="font-serif text-lg text-stone-900 mb-1">Bulk Import Equipment</h3>
                  <p className="text-stone-500 text-sm mb-4">Drag & drop PDF/CSV or click to browse</p>
                  <div className="flex gap-2">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider bg-white px-2 py-1 rounded border border-stone-200">.PDF</span>
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider bg-white px-2 py-1 rounded border border-stone-200">.CSV</span>
                  </div>
                </div>

                <div className="flex justify-end mb-8">
                  <button
                    onClick={() => setShowEquipmentModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-maroon-700 text-white rounded-xl hover:bg-maroon-800 transition-all shadow-lg shadow-maroon-900/20 active:scale-[0.98] font-medium"
                  >
                    <Plus size={20} /> Add Equipment
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {equipmentsData.map(item => (
                    <div
                      key={item._id}
                      onClick={() => setSelectedEquipmentView(item)}
                      className="group relative h-80 bg-stone-900 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
                    >
                      {/* Background */}
                      <div className="absolute inset-0 bg-white">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain p-8 transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/95 via-stone-900/40 to-transparent opacity-90 group-hover:opacity-95 transition-opacity" />
                      </div>

                      {/* Actions */}
                      <div className="absolute top-4 right-4 flex gap-2 translate-y-[-20px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingEquipment(item);
                            setEquipmentForm({
                              name: item.name,
                              specification: item.specification || '',
                              description: item.description,
                              additionalInfo: item.additionalInfo || '',
                              inCharge: item.inCharge,
                              image: null
                            });
                            setShowEquipmentModal(true);
                          }}
                          className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:text-blue-400 border border-white/20"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteEquipment(item._id); }} className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:text-red-400 border border-white/20">
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Content */}
                      <div className="absolute bottom-0 left-0 w-full p-8 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 z-10">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">In Charge: {item.inCharge}</p>
                        </div>
                        <h3 className="text-2xl font-serif text-white mb-2">{item.name}</h3>

                        <div className="text-xs text-red-400 font-bold mt-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100 uppercase tracking-wider">
                          View details <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          }

          {/* Settings Tab */}
          {
            activeTab === 'settings' && (
              <div className="max-w-xl mx-auto">
                <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/50">
                  <div className="flex items-center gap-5 mb-8">
                    <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center text-stone-800 shadow-inner">
                      <Lock size={28} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-serif text-stone-900">Security Settings</h2>
                      <p className="text-sm text-stone-500 font-medium">Manage your password and security preferences</p>
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
                  }} className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Current Password</label>
                      <input name="currentPassword" type="password" required className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl outline-none focus:border-maroon-500 focus:ring-4 focus:ring-maroon-500/10 transition-all font-medium" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">New Password</label>
                      <input name="newPassword" type="password" required className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl outline-none focus:border-maroon-500 focus:ring-4 focus:ring-maroon-500/10 transition-all font-medium" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Confirm New Password</label>
                      <input name="confirmPassword" type="password" required className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl outline-none focus:border-maroon-500 focus:ring-4 focus:ring-maroon-500/10 transition-all font-medium" />
                    </div>

                    <button type="submit" className="w-full py-4 bg-maroon-700 text-white font-bold rounded-xl hover:bg-maroon-800 transition-all shadow-lg shadow-maroon-900/20 active:scale-[0.98]">
                      Update Password
                    </button>
                  </form>
                </div>
              </div>
            )
          }

          {
            activeTab === 'instructions' && (
              <AdminInstructions />
            )
          }
        </div >

        {/* --- Modals --- */}

        {/* Material Modal */}
        {
          showMaterialModal && (
            <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-[2rem] max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 border border-white/20">
                <div className="flex justify-between items-center p-8 border-b border-stone-100 flex-shrink-0">
                  <h2 className="text-2xl font-serif text-stone-900">{editingMaterial ? 'Edit Material' : 'Add Material'}</h2>
                  <button onClick={() => setShowMaterialModal(false)} className="p-2 hover:bg-stone-100 rounded-full transition-colors"><X className="text-stone-400 hover:text-stone-900" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-8">
                  <form onSubmit={handleMaterialSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder="Name" required value={materialForm.name} onChange={e => setMaterialForm({ ...materialForm, name: e.target.value })} className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-maroon-500/20 focus:border-maroon-500 transition-all font-medium placeholder:text-stone-400" />
                      <select value={materialForm.formType || 'unit'} onChange={e => setMaterialForm({ ...materialForm, formType: e.target.value })} className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-maroon-500/20 focus:border-maroon-500 transition-all font-medium text-stone-700">
                        <option value="unit">Unit (Item)</option>
                        <option value="sheet">Sheet</option>
                        <option value="rod">Rod</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5 block">
                          {materialForm.formType === 'sheet' ? 'Thickness (mm)' :
                            materialForm.formType === 'rod' ? 'Diameter (mm)' :
                              'Weight (kg) [Optional]'}
                        </label>
                        <input type="number" step="any" placeholder="0" value={materialForm.fixedDimension || ''} onChange={e => setMaterialForm({ ...materialForm, fixedDimension: e.target.value })} className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-maroon-500/20 focus:border-maroon-500 transition-all font-medium" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5 block">Energy Coeff (MJ/kg)</label>
                        <input type="number" step="any" required placeholder="MJ/kg" value={materialForm.embodiedEnergy || ''} onChange={e => setMaterialForm({ ...materialForm, embodiedEnergy: e.target.value })} className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-maroon-500/20 focus:border-maroon-500 transition-all font-medium" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5 block">Carbon Factor (kgCO₂e/kg)</label>
                        <input type="number" step="any" required placeholder="kgCO₂e/kg" value={materialForm.carbonFootprintFactor || ''} onChange={e => setMaterialForm({ ...materialForm, carbonFootprintFactor: e.target.value })} className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-maroon-500/20 focus:border-maroon-500 transition-all font-medium" />
                      </div>
                    </div>
                    {(materialForm.formType === 'sheet' || materialForm.formType === 'rod') && (
                      <div>
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5 block">Density (kg/m³)</label>
                        <input type="number" step="any" placeholder="Density" value={materialForm.density || ''} onChange={e => setMaterialForm({ ...materialForm, density: e.target.value })} className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-maroon-500/20 focus:border-maroon-500 transition-all font-medium" />
                      </div>
                    )}
                    <input type="text" placeholder="Display Dimension (e.g. '5mm' or '20x20cm')" required value={materialForm.dimension} onChange={e => setMaterialForm({ ...materialForm, dimension: e.target.value })} className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-maroon-500/20 focus:border-maroon-500 transition-all font-medium" />
                    <textarea placeholder="Description" required value={materialForm.description} onChange={e => setMaterialForm({ ...materialForm, description: e.target.value })} className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-maroon-500/20 focus:border-maroon-500 transition-all font-medium h-28 resize-none" />
                    <div className="border-2 border-dashed border-stone-200 rounded-xl p-8 text-center hover:bg-stone-50 hover:border-maroon-200 transition-colors relative group">
                      <input type="file" accept="image/*" onChange={e => setMaterialForm({ ...materialForm, image: e.target.files[0] })} className="absolute inset-0 opacity-0 cursor-pointer" />
                      <div className="flex flex-col items-center gap-3 text-stone-400 group-hover:text-maroon-500 transition-colors">
                        <div className="p-3 bg-stone-100 rounded-full group-hover:bg-maroon-50 transition-colors">
                          <Upload size={24} />
                        </div>
                        <span className="text-sm font-medium">{materialForm.image?.name || 'Click to Upload Image'}</span>
                      </div>
                    </div>
                    <button type="submit" className="w-full py-4 bg-maroon-700 text-white font-bold rounded-xl hover:bg-maroon-800 transition-all shadow-lg shadow-maroon-900/20 active:scale-[0.98]">Save Material</button>
                  </form>
                </div>
              </div>
            </div>
          )
        }

        {/* Event Modal */}
        {
          showEventModal && (
            <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-[2rem] max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 border border-white/20">
                <div className="flex justify-between items-center p-8 border-b border-stone-100 flex-shrink-0">
                  <h2 className="text-2xl font-serif text-stone-900">{editingEvent ? 'Edit Event' : 'Add New Event'}</h2>
                  <button onClick={() => { setShowEventModal(false); setEditingEvent(null); }} className="p-2 hover:bg-stone-100 rounded-full transition-colors"><X className="text-stone-400 hover:text-stone-900" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-8">
                  <form onSubmit={handleEventSubmit} className="space-y-5">
                    <input type="text" placeholder="Event Title" required value={eventForm.title} onChange={e => setEventForm({ ...eventForm, title: e.target.value })} className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-maroon-500/20 focus:border-maroon-500 transition-all font-medium placeholder:text-stone-400" />
                    <input type="text" placeholder="Date (e.g. Dec 15, 2025)" required value={eventForm.date} onChange={e => setEventForm({ ...eventForm, date: e.target.value })} className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-maroon-500/20 focus:border-maroon-500 transition-all font-medium placeholder:text-stone-400" />
                    <input type="text" placeholder="Category (e.g. Conference)" required value={eventForm.category} onChange={e => setEventForm({ ...eventForm, category: e.target.value })} className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-maroon-500/20 focus:border-maroon-500 transition-all font-medium placeholder:text-stone-400" />
                    <div className="border-2 border-dashed border-stone-200 rounded-xl p-8 text-center hover:bg-stone-50 hover:border-maroon-200 transition-colors relative group">
                      <input type="file" accept="image/*" onChange={e => setEventForm({ ...eventForm, image: e.target.files[0] })} className="absolute inset-0 opacity-0 cursor-pointer" required={!editingEvent} />
                      <div className="flex flex-col items-center gap-3 text-stone-400 group-hover:text-maroon-500 transition-colors">
                        <div className="p-3 bg-stone-100 rounded-full group-hover:bg-maroon-50 transition-colors">
                          <Upload size={24} />
                        </div>
                        <span className="text-sm font-medium">{eventForm.image?.name || (editingEvent ? 'Change Event Image (Optional)' : 'Upload Event Image')}</span>
                      </div>
                    </div>
                    <button type="submit" className="w-full py-4 bg-maroon-700 text-white font-bold rounded-xl hover:bg-maroon-800 transition-all shadow-lg shadow-maroon-900/20 active:scale-[0.98]">{editingEvent ? 'Update Event' : 'Create Event'}</button>
                  </form>
                </div>
              </div>
            </div>
          )
        }

        {/* Equipment Modal */}
        {
          showEquipmentModal && (
            <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-[2rem] max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 border border-white/20">
                <div className="flex justify-between items-center p-8 border-b border-stone-100 flex-shrink-0">
                  <h2 className="text-2xl font-serif text-stone-900">{editingEquipment ? 'Edit Equipment' : 'Add New Equipment'}</h2>
                  <button onClick={() => { setShowEquipmentModal(false); setEditingEquipment(null); }} className="p-2 hover:bg-stone-100 rounded-full transition-colors"><X className="text-stone-400 hover:text-stone-900" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-8">
                  <form onSubmit={handleEquipmentSubmit} className="space-y-5">
                    <input type="text" placeholder="Equipment Name" required value={equipmentForm.name} onChange={e => setEquipmentForm({ ...equipmentForm, name: e.target.value })} className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-maroon-500/20 focus:border-maroon-500 transition-all font-medium placeholder:text-stone-400" />
                    <input type="text" placeholder="Person In Charge" required value={equipmentForm.inCharge} onChange={e => setEquipmentForm({ ...equipmentForm, inCharge: e.target.value })} className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-maroon-500/20 focus:border-maroon-500 transition-all font-medium placeholder:text-stone-400" />
                    <input type="text" placeholder="Specification" value={equipmentForm.specification} onChange={e => setEquipmentForm({ ...equipmentForm, specification: e.target.value })} className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-maroon-500/20 focus:border-maroon-500 transition-all font-medium placeholder:text-stone-400" />
                    <textarea placeholder="Description" required value={equipmentForm.description} onChange={e => setEquipmentForm({ ...equipmentForm, description: e.target.value })} className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-maroon-500/20 focus:border-maroon-500 transition-all font-medium h-28 resize-none placeholder:text-stone-400" />
                    <textarea placeholder="Additional Information (Optional)" value={equipmentForm.additionalInfo} onChange={e => setEquipmentForm({ ...equipmentForm, additionalInfo: e.target.value })} className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-maroon-500/20 focus:border-maroon-500 transition-all font-medium h-28 resize-none placeholder:text-stone-400" />

                    <div
                      className="border-2 border-dashed border-stone-200 rounded-xl p-8 text-center hover:bg-stone-50 hover:border-maroon-200 transition-colors relative group"
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const file = e.dataTransfer.files[0];
                        if (file && file.type.startsWith('image/')) {
                          setEquipmentForm({ ...equipmentForm, image: file });
                        }
                      }}
                      onPaste={(e) => {
                        const items = e.clipboardData.items;
                        for (let i = 0; i < items.length; i++) {
                          if (items[i].type.indexOf('image') !== -1) {
                            const file = items[i].getAsFile();
                            setEquipmentForm({ ...equipmentForm, image: file });
                            break;
                          }
                        }
                      }}
                    >
                      <input type="file" accept="image/*" onChange={e => setEquipmentForm({ ...equipmentForm, image: e.target.files[0] })} className="absolute inset-0 opacity-0 cursor-pointer" />
                      <div className="flex flex-col items-center gap-3 text-stone-400 group-hover:text-maroon-500 transition-colors">
                        <div className="p-3 bg-stone-100 rounded-full group-hover:bg-maroon-50 transition-colors">
                          <Upload size={24} />
                        </div>
                        <span className="text-sm font-medium">{equipmentForm.image ? equipmentForm.image.name : (editingEquipment ? 'Change Image' : 'Upload Equipment Image')}</span>
                        <p className="text-[10px] opacity-60 font-medium tracking-wide">PASTE IMAGE OR DRAG & DROP</p>
                      </div>
                    </div>
                    <button type="submit" className="w-full py-4 bg-maroon-700 text-white font-bold rounded-xl hover:bg-maroon-800 transition-all shadow-lg shadow-maroon-900/20 active:scale-[0.98]">
                      {editingEquipment ? 'Update Changes' : 'Add Equipment'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )
        }

        {/* Equipment Detail Modal */}
        {
          selectedEquipmentView && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-in fade-in duration-300"
              onClick={() => setSelectedEquipmentView(null)}
            >
              <div
                className="bg-white rounded-[2rem] max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 relative"
                onClick={e => e.stopPropagation()}
              >
                <div className="h-72 shrink-0 relative bg-stone-50 flex items-center justify-center p-4">
                  <img
                    src={selectedEquipmentView.imageUrl}
                    alt={selectedEquipmentView.name}
                    className="max-w-full max-h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <button
                    onClick={() => setSelectedEquipmentView(null)}
                    className="absolute top-4 right-4 p-2 bg-stone-900/30 hover:bg-stone-900/50 text-white rounded-full backdrop-blur-md transition-colors border border-white/10"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-8 flex-1 overflow-y-auto">
                  <div className="space-y-6">
                    <h2 className="text-3xl font-serif text-stone-900">{selectedEquipmentView.name}</h2>

                    {selectedEquipmentView.specification && (
                      <div>
                        <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                          <span className="w-8 h-px bg-stone-200"></span> Specifications
                        </h4>
                        <p className="text-sm text-stone-700 font-mono bg-stone-50 p-3 rounded-lg border border-stone-100">
                          {selectedEquipmentView.specification}
                        </p>
                      </div>
                    )}

                    <div>
                      <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <span className="w-8 h-px bg-stone-200"></span> Description
                      </h4>
                      <p className="text-stone-600 leading-relaxed font-light">
                        {selectedEquipmentView.description}
                      </p>
                    </div>

                    {selectedEquipmentView.additionalInfo && (
                      <div>
                        <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                          <span className="w-8 h-px bg-stone-200"></span> Additional Information
                        </h4>
                        <a
                          href={selectedEquipmentView.additionalInfo.startsWith('http') ? selectedEquipmentView.additionalInfo : `https://${selectedEquipmentView.additionalInfo}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-maroon-700 hover:text-maroon-900 underline break-all inline-flex items-center gap-2"
                        >
                          {selectedEquipmentView.additionalInfo} <ExternalLink size={14} />
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="pt-6 border-t border-stone-100 flex justify-end mt-4 gap-4">
                    <button
                      onClick={() => {
                        setEditingEquipment(selectedEquipmentView);
                        setEquipmentForm({
                          name: selectedEquipmentView.name,
                          specification: selectedEquipmentView.specification || '',
                          description: selectedEquipmentView.description,
                          additionalInfo: selectedEquipmentView.additionalInfo || '',
                          inCharge: selectedEquipmentView.inCharge,
                          image: null
                        });
                        setSelectedEquipmentView(null);
                        setShowEquipmentModal(true);
                      }}
                      className="px-8 py-3 bg-stone-100 text-stone-900 rounded-full font-bold text-sm tracking-wide hover:bg-stone-200 transition-colors shadow-sm"
                    >
                      EDIT DETAILS
                    </button>
                    <button
                      onClick={() => setSelectedEquipmentView(null)}
                      className="px-8 py-3 bg-stone-900 text-white rounded-full font-bold text-sm tracking-wide hover:bg-stone-800 transition-colors shadow-lg"
                    >
                      CLOSE DETAILS
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        }

        {/* Bulk Registration Results Modal */}
        {
          showBulkResultsModal && bulkResults && (
            <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-[2rem] max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 border border-white/20">
                {/* Header */}
                <div className="flex justify-between items-center p-8 border-b border-stone-100">
                  <div>
                    <h2 className="text-2xl font-serif text-stone-900">Bulk Registration Results</h2>
                    <p className="text-sm text-stone-500 mt-1">
                      {bulkType === 'student' ? 'Student' : 'Faculty'} Registration Summary
                    </p>
                  </div>
                  <button
                    onClick={() => setShowBulkResultsModal(false)}
                    className="p-2 hover:bg-stone-100 rounded-full transition-colors"
                  >
                    <X className="text-stone-400 hover:text-stone-900" />
                  </button>
                </div>

                {/* Summary Stats */}
                <div className="px-8 py-6 bg-stone-50 border-b border-stone-100">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-stone-500 uppercase tracking-widest">Successful</p>
                          <p className="text-3xl font-serif text-emerald-600">{bulkResults.success.length}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-stone-500 uppercase tracking-widest">Failed</p>
                          <p className="text-3xl font-serif text-red-600">{bulkResults.failed.length}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Failed Entries Table */}
                {bulkResults.failed.length > 0 && (
                  <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="px-8 py-4 border-b border-stone-100">
                      <h3 className="text-lg font-serif text-stone-900">Failed Entries</h3>
                      <p className="text-xs text-stone-500 mt-1">Review and correct these entries before re-uploading</p>
                    </div>
                    <div className="flex-1 overflow-y-auto px-8 py-0">
                      <table className="w-full">
                        <thead className="sticky top-0 bg-white">
                          <tr className="border-b border-stone-200">
                            <th className="px-4 py-3 text-left text-xs font-bold text-stone-500 uppercase tracking-widest">Row</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-stone-500 uppercase tracking-widest">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-stone-500 uppercase tracking-widest">Email</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-stone-500 uppercase tracking-widest">Reason</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {bulkResults.failed.map((failure, index) => (
                            <tr key={index} className="hover:bg-stone-50 transition-colors">
                              <td className="px-4 py-3 text-sm font-mono text-stone-600">{failure.rowIndex}</td>
                              <td className="px-4 py-3 text-sm text-stone-900">{failure.data?.name || '-'}</td>
                              <td className="px-4 py-3 text-sm text-stone-600 font-mono">{failure.data?.email || '-'}</td>
                              <td className="px-4 py-3 text-sm text-red-600">{failure.reason}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="px-8 py-6 border-t border-stone-100 flex gap-4">
                  {bulkResults.failed.length > 0 && (
                    <button
                      onClick={() => {
                        // Create CSV content from failed entries
                        const headers = bulkType === 'student'
                          ? ['Name', 'Email', 'USN', 'Division', 'Batch', 'Reason']
                          : ['Name', 'Email', 'Department', 'Reason'];

                        const rows = bulkResults.failed.map(f => {
                          if (bulkType === 'student') {
                            return [
                              f.data?.name || '',
                              f.data?.email || '',
                              f.data?.usn || '',
                              f.data?.division || '',
                              f.data?.batch || '',
                              f.reason
                            ];
                          } else {
                            return [
                              f.data?.name || '',
                              f.data?.email || '',
                              f.data?.department || '',
                              f.reason
                            ];
                          }
                        });

                        const csvContent = [
                          headers.join(','),
                          ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
                        ].join('\n');

                        const blob = new Blob([csvContent], { type: 'text/csv' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `failed_${bulkType}_registrations.csv`;
                        a.click();
                        window.URL.revokeObjectURL(url);
                      }}
                      className="flex-1 py-3.5 bg-stone-100 text-stone-700 rounded-full text-sm font-bold tracking-widest hover:bg-stone-200 transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      DOWNLOAD FAILED ENTRIES
                    </button>
                  )}
                  <button
                    onClick={() => setShowBulkResultsModal(false)}
                    className="px-8 py-3.5 bg-maroon-700 text-white rounded-full text-sm font-bold tracking-widest hover:bg-maroon-800 transition-all shadow-lg"
                  >
                    CLOSE
                  </button>
                </div>
              </div>
            </div>
          )
        }
      </main >
    </div >
  );
};

export default AdminDashboard;
